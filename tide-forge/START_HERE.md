# START HERE — TideForge handoff

> Read this first in a fresh session. It's the current state, where every file is, and what to do next
> so work continues without re-discovering anything.

## What this project is
**TideForge** — a bespoke **procedural + hand-editable pixel-art & animation engine** for the game
*DEEP / The Last Divers*. It generates game art from modular parts + shared palettes, animates it
(procedurally now, keyframe later), and exports spritesheets + JSON manifests for a game engine.
Scope decision on record: **"B" — the full art engine** (creatures, flora, tiles, props, VFX, rigged
characters + animation). The game itself is a separate project (see the game's `GDD.md` / `ART_BIBLE.md`,
staged in the `waikiki-26` repo under `scuba-game/`).

## Files in this project
- `index.html` — the whole app (self-contained: HTML+CSS+JS, no deps). Open in any browser.
- `ARCHITECTURE.md` — the full engine design + roadmap (the engineering north star).
- `README.md` — short project intro + how to run/use.
- `M1_SPEC.md` — the M1 build spec, now **delivered**; keep it as the record of what shipped.
- `START_HERE.md` — this handoff.

## Current status: **M1 complete**, plus an **M1.5 depth-of-image pass**
**M0 (core + creatures + animation)** and **M1 (environment & VFX)** are both built and working.

**Core** — palette system (10 master ramps, editable), role-based pixel-matrix, depth-grade (light
absorption), corruption ("wrongness"), seeded RNG, periodic value-noise/fbm, colorizer, and a shared
stamping vocabulary (`stampSeg` / `stampDisc` / `outlinePass`) every generator draws with.

**The Module contract is now explicit** (`defModule({...})`), and this is the thing to preserve:
```js
Module = {
  id, label, icon, size:{w,h}, fit,
  groups:      [{key,title}],                       // rail panels
  paramSchema: [{key,group,label,type,...}],        // -> the rail UI is GENERATED from this
  defaults()   -> cfg,
  generate(cfg,rng)            -> {w,h,roles,meta},          // motion-animated
  generateFrames(cfg,rng,clip) -> {w,h,frames:[roles],meta},  // pre-baked (baked:true)
  motions, clips(), hint, hud(cfg), label2(cfg)
}
```
The rail, the randomizer, the timeline, the library and every exporter are written **once** against
that contract — a new module needs zero bespoke UI. Add one and it appears fully wired.

**Modules built**
- **CreatureForge** — parametric fish (archetype, length/depth, tail, dorsal, pattern). *(M0)*
- **FloraForge** — kelp / staghorn / sea fan / soft coral / turtle grass. Stochastic L-system string
  rewriting → a turtle that stamps thick tapered segments, countershaded from the segment normal vs.
  a fixed light direction. Segment length **and** taper are normalised by the iteration count, so
  every archetype fills the frame whatever the settings. Sea fans web adjacent tips into a lattice;
  bioluminescent variants glow at depth.
- **TileForge** — sand / rock / rubble / coral-crust. Periodic (wrapping) cell noise quantised into
  stones with a shaded seam and a lit lip, plus a real **47-tile blob autotile set** built from edge
  and corner masks. The preview is a live autotiled seabed. Exports a tilesheet + the full 256-entry
  bitmask→tile map.
- **VFXForge** — bubbles / silt / godrays / glow motes / ink. Per-frame particle bakes; every
  particle advances a whole number of cycles per clip, so the loop is **seam-free at any frame
  count**. Silt and ink accumulate a density field and map density→role, so they read as volume.

**Animation** — procedural motion models (swim, sway, bob, breathe, flutter, none, baked),
multi-clip timeline, scrub + play + onion-skin, live frame strip. `sway` scales amplitude by height
above the holdfast when the module supplies one, and takes a **current** bias.

**M1.5 — depth of image.** The generators were producing flat art, so the *core* gained a shared
shading vocabulary that every module inherits: **ordered Bayer dithering** (a 5-step ramp now
implies far more than five tones), a **luminance-preserving hue shift** (warm highlights, cool
shadows), **selective outlines** (the lit edge takes a warm `RIM`), a screen-space **AO** pass, and
a translucent `TRANS` role. Creatures got real form lighting — countershading with a cylindrical
falloff, a dithered dorsal-ridge highlight, fin membranes with rays, and markings that shade the
body rather than stamping a flat colour. TileForge grew **fill variants per blob key** (the 16px
repeat is gone). **PropForge** landed early (crates, drums, tanks, hull plate, debris — a modular
kit shaded by one convex form model, then corroded and encrusted). The game's reef scene grew
**five parallax layers**.

**Species (M1.6).** CreatureForge now carries a catalogue of 16 real Pacific-reef species —
chromis, anthias, butterflyfishes, yellow tang, moorish idol, wrasse, convict tang, taape,
menpachi, akule, parrotfish, bluefin and giant trevally, moray, whitetip reef shark — each with
an approximate adult length in cm, a body depth/length aspect, real colour ramps, a depth band
and schooling behaviour. **The frame follows the fish**: sprite length comes from the real length
through a square-root compression curve (`spriteLenPx`), so a 9 cm chromis is 19 px and a 1.7 m
trevally 106 px — honest ordering without the small ones becoming 3-pixel dots. A species preset
rewrites the body plan *and* the palette, so it must trigger a full rebuild, not just `markAsset`.

**Also in M1** — an **asset library** (localStorage; seed+cfg means entries are tiny; thumbnails,
reload, delete) and a **lite palette editor** (tweak any ramp's 5 stops, add/delete custom ramps,
everything downstream recolors live; persisted).

**Export** — single-frame PNG, spritesheet (a row per clip), tilesheet (the blob set), and JSON
manifests (clips/frames/fps/anchors; VFX also carries its emitter params; tiles carry the autotile map).

## Next: **M2** (see ARCHITECTURE §7)
1. **CharacterForge** — modular humanoid + skeleton/rig, procedural gaits.
2. **Keyframe timeline** — authored cycles on matrices *or* rig poses, onion-skin, ease.
3. **Pixel-paint layer** — draw/erase/fill over any generated asset. Non-negotiable for hero art.
4. *(PropForge already landed — see M1.5 above.)*

**Known limitation worth fixing in M2:** every module has a fixed frame size, so a creature is
always 72×42. That is why the reef's fish all read as roughly a metre long — small schooling fish
need a per-config frame size.

## Conventions
- The app stays single-file while it's this size. Follow the existing `core / modules / anim / ui / io`
  section layout. Migrate to **Vite + ES modules** (ARCHITECTURE §6) when the module count justifies it.
- **New modules go through `defModule`** and declare a `paramSchema` — never hand-build rail UI.
- Keep all art in **one master palette language** (roles → ramp steps); never hardcode colors.
- **Procedural where variety pays; hand-authored where identity matters.** Don't auto-generate hero faces.
- The **depth-grade** math is shared with the game runtime — keep it portable.
- After editing, syntax-check the inline JS (extract the `<script>` and `node --check`), and eyeball the
  actual art — Chromium + Playwright are available for headless contact sheets, which is how M1's
  generators were tuned.

## How this got here (migration note)
M0 and M1 were authored in sessions scoped to the `waikiki-26` repo and staged there under
`tide-forge/` on branch `claude/scuba-game-prototype-vpxs01`, then imported into this `tide-forge`
repo. If any file looks missing, it can be recovered from that branch.

## To continue
Say: **"Continue TideForge — build M2, starting with the pixel-paint layer."**
