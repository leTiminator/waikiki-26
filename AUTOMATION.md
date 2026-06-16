# Deal watch — automated Groupon / operator deal checker

This repo includes an optional background job that checks each booking's **Groupon
and operator links every ~3 hours** and, when a deal's price or title changes, drops
a **tappable entry into the shared Activity feed** so both phones see it live.

It is built entirely as **new files** — it does **not** modify `index.html` or `sw.js`,
and it changes nothing about the app's look. New deals appear through the Activity
feed you already have.

## What it touches

- `.github/workflows/check-deals.yml` — GitHub Actions schedule (cron `0 */3 * * *`) plus a manual **Run workflow** button.
- `scripts/check-deals.mjs` — the checker (headless Chromium via Playwright + Firebase Admin).
- `scripts/package.json` — its dependencies.

It reads your booking links straight from the `BOOKINGS` array in `index.html`
(single source of truth — no duplicated URLs to keep in sync), and writes **only** to
Firebase:

| Path | Shape | Purpose |
|---|---|---|
| `trip/feed` | array of `{ who, text, ts }` | the line the app shows ("🆕 Groupon update — … view ↗"). Same shape the app already uses. |
| `trip/deals/<bookingId>` | `{ fp, title, price, url, source, ts }` | the checker's own fingerprint state for change detection (the app ignores this). |
| `trip/dealsCheckedAt` | epoch-ms number | last time the job ran. |

## Activate it (one-time, ~3 min)

The job is **inert until you add two GitHub repository secrets** — without them every
scheduled run exits immediately and does nothing.

1. **Get a Firebase service account** (lets the job write to your database):
   Firebase console → ⚙ **Project settings → Service accounts → Generate new private key**.
   A JSON file downloads. Open it and copy the **entire contents**.

2. **Add the secrets** at
   `https://github.com/leTiminator/waikiki-26/settings/secrets/actions` → **New repository secret**:
   - `FIREBASE_SERVICE_ACCOUNT` → paste the whole service-account JSON.
   - `FIREBASE_DB_URL` → your `databaseURL`, e.g. `https://your-project-default-rtdb.firebaseio.com`.

3. **Test it now:** repo → **Actions** tab → **Deal watch** → **Run workflow**.
   The first run records a silent **baseline** for every booking (no feed spam). After
   that, any price/title change posts a feed line. You can watch the run's logs there.

> Tip: the schedule is best-effort and GitHub auto-pauses scheduled workflows after
> ~60 days of no repo activity — re-enable from the Actions tab if that happens.

## How "new" is decided

For each target the job collects the page title and the prices it finds, takes the
8 lowest, and hashes them into a fingerprint. A run posts to the feed only when that
fingerprint **differs from the last run**. The very first sighting is stored silently
as a baseline so you don't get one "new deal" line per booking on day one.

## Honest caveats

- **Groupon is hostile to bots.** It may serve a challenge/Access-Denied page instead
  of deals. When the job can't read a usable price it simply skips that target (no false
  "deal" posts) — but that also means it can silently miss real changes. Headless
  Chromium gets past most basic walls; it is not guaranteed.
- **Heuristic, not a real API.** Groupon has no open public deals API anymore. This reads
  rendered pages, so operator markup changes can break parsing. Treat feed posts as a
  "go look" nudge, not gospel — always confirm price on the operator's own site.
- **Search-result pages are chattier** than single-deal pages (the Kualoa link is a
  search query), so they may flag changes more often as listings rotate.

## More reliable upgrade path

For dependable, structured deal data without scraping, sign up for a **Groupon affiliate
feed** (distributed through networks like CJ/Sovrn). You get clean title/price/URL data
(and commission links), which you'd swap in where `readPage()` currently scrapes. That's
the production-grade route if this becomes more than a 2-person convenience.

## Not included (would touch the locked app files)

A **push notification** to your phones when a deal drops would require editing
`index.html` (permission prompt + token registration) and `sw.js` (a push handler),
plus Firebase Cloud Messaging setup — and on iOS it only works once the app is added to
the home screen. Because that changes the locked files, it's intentionally left out.
Say the word and it can be added as a clearly-scoped follow-up.
