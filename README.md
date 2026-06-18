# Waikiki '26 — Shared Vacation Budget & Itinerary App

> **STATUS / HANDOFF (read this):** This app is **built and live** at
> https://letiminator.github.io/waikiki-26/ — Firebase + GitHub Pages are already set up.
> The app now uses a **shared passcode** (the "no logins" wording below is outdated) and the
> dates are **Jun 23 – Jul 6, 2026**. The setup steps further down are mostly done, kept for
> reference. **For the current architecture, data model, features, and dev conventions, read
> [`CLAUDE.md`](CLAUDE.md)** — a fresh Claude Code session loads it automatically.

A single-page, mobile-first web app for our June 25 – July 6, 2026 Waikiki trip,
built for **two people to share one live trip** — both can add/check/edit and see
each other's changes in seconds, from one simple link, no logins.

## Features
- **Plan** — collapsible day-by-day itinerary, tap to check off items.
- **Book** — each bookable activity with a direct-operator link AND a Groupon link
  where one exists, plus tap-to-call and tap-to-map. Mark "Booked" + store the
  confirmation # on the card.
- **Budget** — check planned items as you pay, log real expenses with the + button,
  live "spent vs. planned" meter in the header.
- **Activity** — a shared feed: "Tim marked Kualoa booked," "Sam added $24 — shave
  ice," newest first, with timestamps. Each person sets a display name on first open.
- **Tips** + quick links (weather, hotel map, 911). Countdown in the header.
- Installable to a phone home screen.

## How sharing works (read this)
Data lives in a free **Firebase Realtime Database**. The web files are static and
hosted on **GitHub Pages**; Firebase holds the shared trip state and pushes live
updates to both phones. Anyone with the GitHub Pages link (and the Firebase config
baked into it) can view and edit — there are no per-user accounts, by design, to keep
it frictionless. Only share the link with each other.

**Offline note:** because the data is shared and live, the app needs internet to sync.
It caches so it still *opens* offline and shows the last-synced state, but new edits
made offline sync when you're back online (last-write-wins). For a 2-person trip that's
fine.

## Files
- `index.html` — the whole app (HTML/CSS/JS). Firebase config block is near the top.
- `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` — PWA/offline.
- `README.md` — this file.

---

## STEP 1 — FIREBASE SETUP (≈5 min, the user does this once)

This produces the config keys the app needs. Claude Code can't do this part — it
requires a Google login — so guide the user through it:

1. Go to https://console.firebase.google.com and click **Add project**. Name it
   anything (e.g. `waikiki-26`). You can disable Google Analytics. Create.
2. In the left menu choose **Build → Realtime Database → Create Database**.
   - Pick a location (US is fine).
   - Start in **test mode** (allows read/write). Good enough for a 2-person private
     trip. (Optional hardening below.)
3. Click the gear (Project settings) → scroll to **Your apps** → click the **</>**
   (Web) icon → register an app (nickname `waikiki`, no hosting needed).
4. Firebase shows a `firebaseConfig = { ... }` snippet. Copy these 5 values:
   `apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`.
5. Paste them into the `firebaseConfig` block near the top of `index.html`
   (replace the `PASTE_...` placeholders). Save.

> If the user skips this, the app still runs in **local-only mode** (works on one
> device, no sharing) and shows a banner on the Activity tab.

**Optional security hardening** (test mode expires in ~30 days). In Realtime Database →
Rules, you can set:
```json
{ "rules": { "trip": { ".read": true, ".write": true } } }
```
That keeps it open-by-link (matches the no-login design). Only the hard-to-guess
Pages URL + project ID gate access; don't post the link publicly.

---

## STEP 2 — DEPLOY TO GITHUB PAGES (Claude Code does this)

Files are at `/home/claude/waikiki-app/` (or wherever the user unzipped them).

```bash
cd <this folder>
git init
git add .
git commit -m "Waikiki '26 shared trip app"
git branch -M main
```

Create the repo and push (fastest with the GitHub CLI if authenticated):
```bash
gh repo create waikiki-26 --public --source=. --remote=origin --push
```
If `gh` isn't available: have the user create an empty public repo named `waikiki-26`
on github.com, give you their username, then:
```bash
git remote add origin https://github.com/<USERNAME>/waikiki-26.git
git push -u origin main
```

Enable Pages:
```bash
gh api -X POST repos/<USERNAME>/waikiki-26/pages -f "source[branch]=main" -f "source[path]=/"
```
…or: repo **Settings → Pages → Deploy from a branch → main → / (root) → Save**.

Live within ~1 min at:
```
https://<USERNAME>.github.io/waikiki-26/
```

## STEP 3 — SHARE
Text that one link to each other. On each phone: open in Safari/Chrome → Share →
**Add to Home Screen**. First open asks for a display name (for the Activity feed).
Both phones now share the same live trip.

## Notes for whoever edits later
- Trip content is in plain JS arrays near the top of `index.html`: `ITIN`, `BOOKINGS`,
  `BUDGET`, `TIPS`. Edit and re-push.
- Booking links were verified mid-2026; operators change URLs and Groupon deals rotate
  — confirm before relying on them, re-check Groupon near the trip.
- After ANY edit, bump `VERSION` in `sw.js` (currently `waikiki-v3`) so phones load the
  new version instead of the cached one.
- The Firebase keys in `index.html` are not secret in the usual sense (web apps ship
  them client-side); access is gated by the rules + an unguessable link. That's the
  standard trade-off for a no-login shared app.
