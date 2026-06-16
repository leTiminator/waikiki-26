// Automated deal watcher for Waikiki '26.
//
// Runs on a schedule (GitHub Actions). For each booking it opens the Groupon /
// operator page in a headless browser, fingerprints the title + prices it finds,
// and when that fingerprint CHANGES it drops a tappable entry into the shared
// Activity feed (trip/feed) so both phones see the new deal live.
//
// It writes ONLY to Firebase (trip/feed, trip/deals, trip/dealsCheckedAt) and
// never touches index.html. It no-ops cleanly until the GH secrets are set.

import admin from "firebase-admin";
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const SA = process.env.FIREBASE_SERVICE_ACCOUNT;
const DB_URL = process.env.FIREBASE_DB_URL;

// --- Guard: stay inert until the trip's Firebase is wired up ---
if (!SA || !DB_URL) {
  console.log(
    "Firebase secrets not set (FIREBASE_SERVICE_ACCOUNT / FIREBASE_DB_URL). " +
      "Nothing to do yet — exiting cleanly."
  );
  process.exit(0);
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MAX_FEED = 60; // keep in sync with the app's own cap
const FETCH_TIMEOUT_MS = 45000;
const RENDER_WAIT_MS = 2500;

// --- Firebase Admin ---
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(SA)),
  databaseURL: DB_URL,
});
const db = admin.database();

// --- Pull booking targets straight from index.html (single source of truth) ---
function loadBookings() {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const m = html.match(/const BOOKINGS\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error("Could not locate the BOOKINGS array in index.html");
  // Trusted, repo-local literal — evaluate it as the JS array it is.
  return Function("return " + m[1])();
}

// Prefer the Groupon link (deals rotate there); fall back to the operator site.
function targetsFrom(bookings) {
  const out = [];
  for (const b of bookings) {
    if (b.groupon) out.push({ id: b.id, name: b.name, url: b.groupon, source: "Groupon" });
    else if (b.official) out.push({ id: b.id, name: b.name, url: b.official, source: b.name });
  }
  return out;
}

// --- Helpers ---
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const sha1 = (s) => createHash("sha1").update(s).digest("hex");
const priceNum = (s) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || Infinity;

async function readPage(browser, url) {
  const page = await browser.newPage({ userAgent: UA });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: FETCH_TIMEOUT_MS });
    await page.waitForTimeout(RENDER_WAIT_MS); // let client-side prices render
    const data = await page.evaluate(() => {
      const og = document.querySelector('meta[property="og:title"]');
      const title = (og && og.content) || document.title || "";
      const text = document.body ? document.body.innerText : "";
      const prices = Array.from(
        new Set((text.match(/\$\s?\d[\d,]*(?:\.\d{2})?/g) || []).map((s) => s.replace(/\s/g, "")))
      );
      return { title, prices };
    });
    return { ok: true, ...data };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  } finally {
    await page.close();
  }
}

function fingerprint(title, prices) {
  const top = prices.slice().sort((a, b) => priceNum(a) - priceNum(b)).slice(0, 8);
  return { fp: sha1(norm(title) + "|" + top.join(",")), lowest: top[0] || "", top };
}

async function main() {
  const targets = targetsFrom(loadBookings());
  const prevSnap = await db.ref("trip/deals").get();
  const prev = prevSnap.exists() ? prevSnap.val() || {} : {};

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const dealUpdates = {};
  const newEntries = [];

  for (const t of targets) {
    const r = await readPage(browser, t.url);
    if (!r.ok || !r.prices || r.prices.length === 0) {
      // Bot wall / challenge page / no price on page — record nothing, don't spam.
      console.log(`skip ${t.id}: ${r.ok ? "no price signal" : r.error}`);
      continue;
    }
    const { fp, lowest } = fingerprint(r.title, r.prices);
    const before = prev[t.id];
    const record = {
      fp,
      title: norm(r.title),
      price: lowest,
      url: t.url,
      source: t.source,
      ts: Date.now(),
    };

    if (!before) {
      // First time we ever read this target — store the baseline silently so the
      // first run doesn't post one "new deal" line per booking.
      dealUpdates[t.id] = { ...record, first: true };
      console.log(`baseline ${t.id}: ${lowest || "(no price)"}`);
    } else if (before.fp !== fp) {
      dealUpdates[t.id] = record;
      newEntries.push({
        who: "Deal watch",
        text:
          `\u{1F195} ${esc(t.source)} update — <b>${esc(norm(r.title) || t.name)}</b>` +
          (lowest ? ` · from ${esc(lowest)}` : "") +
          ` <a href="${esc(t.url)}" target="_blank" rel="noopener">view ↗</a>`,
        ts: Date.now(),
      });
      console.log(`CHANGED ${t.id}: ${lowest || "(no price)"}`);
    } else {
      console.log(`unchanged ${t.id}`);
    }
  }

  await browser.close();

  if (Object.keys(dealUpdates).length) {
    await db.ref("trip/deals").update(dealUpdates);
  }
  if (newEntries.length) {
    // Prepend new deal lines, newest first, respecting the app's 60-item cap.
    await db.ref("trip/feed").transaction((cur) => {
      const arr = Array.isArray(cur) ? cur : cur ? Object.values(cur) : [];
      return [...newEntries, ...arr].slice(0, MAX_FEED);
    });
  }
  await db.ref("trip/dealsCheckedAt").set(Date.now());

  console.log(
    `done — checked ${targets.length}, state updates ${Object.keys(dealUpdates).length}, feed posts ${newEntries.length}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("deal-watch failed:", e);
    process.exit(1);
  });
