// Automated deal watcher for Waikiki '26.
//
// Runs on a schedule (GitHub Actions). For each booking it opens the Groupon /
// operator page in a headless browser, fingerprints the title + prices it finds,
// and when that fingerprint CHANGES it drops a tappable entry into the shared
// Activity feed (trip/feed) so both phones see the new deal live.
//
// It writes ONLY to Firebase (trip/<room>/feed, /deals, /dealsCheckedAt — the same
// passcode-derived room the app uses) and never touches index.html. It no-ops
// cleanly until the GH secrets are set.

import admin from "firebase-admin";
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const SA = process.env.FIREBASE_SERVICE_ACCOUNT;
const DB_URL = process.env.FIREBASE_DB_URL;
const PASS = process.env.TRIP_PASSCODE;

// --- Guard: stay inert until Firebase + the trip passcode are wired up ---
if (!SA || !DB_URL || !PASS) {
  console.log(
    "Secrets not set (FIREBASE_SERVICE_ACCOUNT / FIREBASE_DB_URL / TRIP_PASSCODE). " +
      "Nothing to do yet — exiting cleanly."
  );
  process.exit(0);
}

// Derive the same private room id the app uses: SHA-256(passcode) -> first 24 hex.
const ROOM = createHash("sha256").update(PASS.trim()).digest("hex").slice(0, 24);
const BASE = `trip/${ROOM}`;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MAX_FEED = 60; // keep in sync with the app's own cap
const FETCH_TIMEOUT_MS = 45000;
const RENDER_WAIT_MS = 2500;
const MIN_PRICE = 10; // ignore $0 / footer / gift-card junk that churns the fingerprint
const READ_RETRIES = 1; // retry once on a bot-wall / no-price page before giving up
const RETRY_WAIT_MS = 3000;

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

// Keep only plausible prices (drops $0 / promo / gift-card noise), lowest first.
function usablePrices(prices) {
  return (prices || [])
    .map((s) => ({ s, n: priceNum(s) }))
    .filter((x) => isFinite(x.n) && x.n >= MIN_PRICE)
    .sort((a, b) => a.n - b.n);
}

function fingerprint(title, prices) {
  const sorted = usablePrices(prices).slice(0, 8);
  const top = sorted.map((x) => x.s);
  return {
    fp: sha1(norm(title) + "|" + top.join(",")),
    lowest: top[0] || "",
    lowestNum: sorted.length ? sorted[0].n : Infinity,
    top,
  };
}

// Retry once on a bot-wall / no-usable-price page (transient challenges are common).
async function readWithRetry(browser, url) {
  let last = null;
  for (let attempt = 0; attempt <= READ_RETRIES; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, RETRY_WAIT_MS));
    last = await readPage(browser, url);
    if (last.ok && usablePrices(last.prices).length) return last;
  }
  return last;
}

async function main() {
  const targets = targetsFrom(loadBookings());
  const prevSnap = await db.ref(`${BASE}/deals`).get();
  const prev = prevSnap.exists() ? prevSnap.val() || {} : {};

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  // Baselines (first sightings) have no feed line, so they're safe to persist any
  // time. Changes DO have a feed line — those fingerprints are persisted only AFTER
  // the feed write succeeds, so a failed post can't permanently suppress the alert.
  const baselineUpdates = {};
  const changeUpdates = {};
  const newEntries = [];

  for (const t of targets) {
    const r = await readWithRetry(browser, t.url);
    const usable = r && r.ok ? usablePrices(r.prices) : [];
    if (!r || !r.ok || !usable.length) {
      // Bot wall / challenge page / no usable price — record nothing, don't spam.
      console.log(`skip ${t.id}: ${r && r.ok ? "no price signal" : r ? r.error : "no result"}`);
      continue;
    }
    const { fp, lowest, lowestNum } = fingerprint(r.title, r.prices);
    const before = prev[t.id];
    const record = {
      fp,
      title: norm(r.title),
      price: lowest,
      priceNum: isFinite(lowestNum) ? lowestNum : null,
      url: t.url,
      source: t.source,
      ts: Date.now(),
    };

    if (!before) {
      // First time we ever read this target — store the baseline silently so the
      // first run doesn't post one "new deal" line per booking.
      baselineUpdates[t.id] = { ...record, first: true };
      console.log(`baseline ${t.id}: ${lowest || "(no price)"}`);
      continue;
    }
    if (before.fp === fp) {
      console.log(`unchanged ${t.id}`);
      continue;
    }

    // Fingerprint changed — figure out whether the price specifically dropped.
    changeUpdates[t.id] = record;
    const oldNum = typeof before.priceNum === "number" ? before.priceNum : priceNum(before.price);
    const dropped = isFinite(oldNum) && isFinite(lowestNum) && lowestNum < oldNum;
    const rose = isFinite(oldNum) && isFinite(lowestNum) && lowestNum > oldNum;
    const title = `<b>${esc(norm(r.title) || t.name)}</b>`;
    const link = `<a href="${esc(t.url)}" target="_blank" rel="noopener">view ↗</a>`;
    let text;
    if (dropped) {
      text = `\u{1F4C9} ${esc(t.source)} price drop — ${title} · was ${esc(before.price)} → now ${esc(lowest)} ${link}`;
    } else if (rose) {
      text = `\u{1F195} ${esc(t.source)} update — ${title} · now ${esc(lowest)} (was ${esc(before.price)}) ${link}`;
    } else {
      text = `\u{1F195} ${esc(t.source)} update — ${title}${lowest ? ` · from ${esc(lowest)}` : ""} ${link}`;
    }
    newEntries.push({ who: "Deal watch", text, ts: Date.now() });
    console.log(`${dropped ? "DROP" : "CHANGED"} ${t.id}: ${lowest || "(no price)"}`);
  }

  await browser.close();

  // Baselines first (no notification tied to them).
  if (Object.keys(baselineUpdates).length) {
    await db.ref(`${BASE}/deals`).update(baselineUpdates);
  }
  // Then the feed lines — BEFORE persisting the changed fingerprints below, so if
  // this throws we exit non-zero with the old fingerprints intact and retry next run.
  if (newEntries.length) {
    // Prepend new deal lines, newest first, respecting the app's 60-item cap.
    await db.ref(`${BASE}/feed`).transaction((cur) => {
      const arr = Array.isArray(cur) ? cur : cur ? Object.values(cur) : [];
      return [...newEntries, ...arr].slice(0, MAX_FEED);
    });
  }
  // Only now lock in the changed fingerprints (the feed write succeeded).
  if (Object.keys(changeUpdates).length) {
    await db.ref(`${BASE}/deals`).update(changeUpdates);
  }
  await db.ref(`${BASE}/dealsCheckedAt`).set(Date.now());

  const stateUpdates = Object.keys(baselineUpdates).length + Object.keys(changeUpdates).length;
  console.log(
    `done — checked ${targets.length}, state updates ${stateUpdates}, feed posts ${newEntries.length}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("deal-watch failed:", e);
    process.exit(1);
  });
