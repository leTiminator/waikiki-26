# CLAUDE.md — Waikiki '26 trip app (handoff context)

Read this first. It's the current state + conventions for this project so a fresh
session can continue without re-discovering everything. (`README.md` is the
*original* setup guide and is partly stale — trust this file and the code.)

## What this is
A single-page, mobile-first PWA for a **two-person Waikiki trip, Jun 23 – Jul 6, 2026**.
Both people share ONE live trip via Firebase, gated by a **shared passcode**. Hosted
free on GitHub Pages.

- **Live:** https://letiminator.github.io/waikiki-26/
- **Repo:** github.com/leTiminator/waikiki-26 — Pages deploys from **`main` / root**.
- **Service worker version:** currently `waikiki-v33` (in `sw.js`).

## Files
- `index.html` — the **entire app** (HTML + CSS + JS in one file). ~All work happens here.
- `sw.js` — service worker. Network-first for the HTML doc (edits show on a normal
  reload); cache-first for static assets; never caches the weather API. **Bump `VERSION`
  on every app change.**
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png` — PWA.
- `BANNER2.png` — header banner (1836×588, already cropped of its white letterbox bands).
- `scripts/check-deals.mjs` + `.github/workflows/check-deals.yml` — optional deal-watcher.
- `README.md` (original, partly stale), `AUTOMATION.md` (deal-watcher setup).
- `waikiki-app.zip` — the original bundle; **intentionally NOT committed**. Don't add it.

## Architecture / data model
- **Static trip content** = JS arrays near the top of `index.html`: `ITIN` (day-by-day
  plan), `BOOKINGS` (bookable activities), `CURATED` (~111 browse items incl. ~94 scraped
  Groupon Oahu deals), `BUDGET` (planned budget groups/items), `TIPS`. Same for everyone.
- **Shared/synced state** = Firebase Realtime DB, under a per-passcode room:
  - room id = `SHA-256(passcode)` → first 24 hex chars (derived identically in the app and
    in `check-deals.mjs`; the raw passcode is never stored in the page or DB).
  - path: `trip/<room>/{ done, booked, conf, expenses, feed, moved, amounts, purchases, customItems, notes, deleted, customActs, actEdits, customBookings, deals, dealsCheckedAt }`
  - `done` checked plan/budget items · `booked`/`conf` booking marks + confirmation #s ·
    `feed` activity log `[{who,text,ts}]` · `moved` `{slotId:"26Jun"}` activity day overrides ·
    `amounts` `{itemId:number}` budget-cost overrides · `purchases` `{itemId:[{a,n,by,ts}]}`
    per-item purchases · `customItems` `[{id,name,amt}]` user-added budget categories ·
    `notes` `{slotId:"text"}` per-activity user notes on the Plan page ·
    `deleted` `{slotId:true}` activities hidden from the Plan (undo-able; reset restores) ·
    `customActs` `[{id,day,t,a,n}]` user-added Plan activities (id `ca_*`; flow through done/moved/notes/deleted by id) ·
    `actEdits` `{slotId:{t,a}}` user edits to a built-in or custom activity's time/text (applied by `effAct()`) ·
    `customBookings` `[{id,name,when,price,official,note}]` user-added bookings (id `cb_*`; booked/conf keyed by id).
- **Firebase** project `waikiki-2026`; config is in `index.html` (client-side keys are fine).
  DB security rule (set by owner): `{ "rules": { "trip": { "$room": { ".read": true, ".write": true } } } }`
  — open per-room, rooms not enumerable.

## Privacy model (important)
The link is public; the data is gated by the passcode. A **different passcode → a different,
empty room → fully isolated.** Only sharing the exact passcode shares the trip. So the link
is safe to show off (tell people to type any throwaway code → their own sandbox).

## Features (all built & live)
Animated ocean **startup splash** (`#splash`, ~1.15s, fades out via `dismissSplash()`;
respects `prefers-reduced-motion`) · passcode rooms · live per-day weather (Open-Meteo; icon driven by **rain probability** so
trade-wind "drizzle" codes don't show as rain; taps to the NWS forecast; refreshes hourly) ·
banner header with fluid title/date/pills · collapsible day cards · **move activities between
days** (tap ↪ then "Move here", synced, confirms; a day's title auto-summarizes from its
current activities once items are moved in/out, else keeps its hand-written `theme` —
see `dayTitle()`) · **full activity CRUD via a sheet** (`#actSheet` / `openAct()` — day picker
+ time + activity + note; used for add AND edit; the day picker doubles as a move): **add**
(per-day `＋ add activity` or the FAB), **edit** any activity (✏️, built-in via `actEdits`,
custom in place), **delete** (🗑) with an **Undo toast** (`showUndo()`) · the **FAB is
context-aware** (`updateFab()`/`curTab`): adds an activity on Plan, a booking on Book, a
category on Budget; hidden on Feed/Tips · open day cards
**stay open across re-renders** (`openDays`) · **Today focus mode** on the Plan tab (`todayIndex()`/`todayISO()` resolve the
current Hawaii date to an ITIN day: a "📍 Today · Day N of M" jump strip on top, today's
card auto-expands + scrolls into view once on boot via `scrollToToday()`, a TODAY badge,
and past days dimmed) · **add a personal note to any activity** (tap "＋ note", synced, in
`state.notes`) · Book tab = built-in bookings + **your own bookings** (add/edit/delete via the
`#bookSheet`, same booked/conf treatment, `state.customBookings`) + long curated Groupon
list · Budget = **editable costs** (tap the $), **per-item purchase logging** (amount+note,
edit ✎ + delete), **rename** custom categories (✎), **+ button adds a custom category** ·
**Undo toast** (`showUndo()`/`doUndo()`, `#toast`) on every single-item delete (activity,
purchase, category, custom booking) — reset still confirms + asks the passcode · phone
**back button** closes popups / cancels a move / else jumps to the Plan tab.

## DEV CONVENTIONS — read before editing
1. **Bump `VERSION` in `sw.js`** (`waikiki-vN` → N+1) after ANY app change.
2. **Deploy = commit + push to `main`.** Pages redeploys in ~1 min. Verify at the live URL
   with a `?fresh=N` query string to bypass the service-worker cache.
3. **`index.html` stores emoji/some punctuation as literal `\uXXXX` escapes** (e.g. the day
   chevron is literally `›`). Exact-string `Edit` matching on those lines is brittle —
   for whole-function rewrites, splice via a tiny `node` script (regex-replace
   `function X(){…}`) instead of fighting the matcher.
4. After editing, **syntax-check** the inline JS: extract the main `<script>` and `node --check`.
5. The owner cares about the **visual design** — match existing styles; don't restyle/refactor
   UI unless asked. Destructive actions should confirm (and reset also asks for the passcode).

## Deal-watcher (optional; inert until secrets set)
`.github/workflows/check-deals.yml` runs `scripts/check-deals.mjs` every 3h to post new
Groupon/operator deal changes into the shared feed. Needs repo **secrets**
`FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_DB_URL`, `TRIP_PASSCODE`. See `AUTOMATION.md`.
All three secrets are now passed into the job env (an earlier bug omitted `TRIP_PASSCODE`,
so the watcher could never run). The watcher filters out junk prices (< `$10`), retries
once on bot-walls, posts the feed line **before** persisting the changed fingerprint (so a
failed post isn't lost), and flags **price drops** (📉, old → now). Playwright browsers are
cached in CI.

## Trip specifics
Jun 23 – Jul 6, 2026. Arrive 6/23 ~6:47am, Hawaiian flight **AS 1017**. Depart 7/6,
flight **AS 900**. Hotel: Twin Fins, Waikiki. 2 people. First days are beach / exploring.
