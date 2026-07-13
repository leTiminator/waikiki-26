# START HERE — TideForge handoff

> Read this first in a fresh session. It's the current state, where every file is, and what to do next
> so work continues without re-discovering anything.

## What this project is
**TideForge** — a bespoke **procedural + hand-editable pixel-art & animation engine** for the game
*DEEP / The Last Divers*. It generates game art from modular parts + shared palettes, animates it
(procedurally now, keyframe later), and exports spritesheets + JSON manifests for a game engine.
Scope decision on record: **"B" — the full art engine** (creatures, flora, tiles, props, VFX, rigged
characters + animation). The game itself is a separate project (see the game's `GDD.md` / `ART_BIBLE.md`,
currently staged in the `waikiki-26` repo under `scuba-game/`).

## Files in this project
- `index.html` — the whole M0 app (self-contained: HTML+CSS+JS, no deps). Open in any browser.
- `ARCHITECTURE.md` — the full engine design + roadmap (the engineering north star).
- `README.md` — short project intro + how to run/use.
- `M1_SPEC.md` — the next milestone's build spec (FloraForge + TileForge + VFXForge). **Start here for coding.**
- `START_HERE.md` — this handoff.

## Current status: **M0 complete**
Built and working in `index.html`:
- **Core:** palette system (8 master ramps), role-based pixel-matrix, depth-grade (light absorption),
  corruption ("wrongness") transform, seeded RNG, colorizer.
- **Creature module:** parametric fish generator (archetype, length/depth, tail, dorsal, pattern,
  palette) — first module behind a **module switcher** (Flora/Tiles/Props/Characters are stubbed `soon`).
- **Animation:** procedural **motion models** (swim, sway, bob, breathe, flutter), **multi-clip
  timeline** (per-clip motion/frames/fps/amplitude/speed), scrub + play + onion-skin, live frame strip.
- **Export:** single-frame PNG, spritesheet (a row per clip), JSON manifest (clips, frames, fps, anchors).

## Next: **M1** (see `M1_SPEC.md`)
1. **FloraForge** — coral / kelp / weeds via L-systems + procedural sway animation.
2. **TileForge** — reef / sand / rock tiles with autotiling (edge masks).
3. **VFXForge** — bubbles, silt, godrays, glow (particle/shader bakes).
Then **M2**: CharacterForge + rig + keyframe timeline + a pixel-paint layer (finish hero art by hand).

## Conventions
- M0 stays single-file for instant use. In this repo, M1+ should migrate to **Vite + ES modules**
  (`/src/core`, `/src/modules`, `/src/anim`, `/src/io`, `/src/ui`) — see ARCHITECTURE §6. Until that
  refactor lands, new modules can be added to `index.html` following the existing `core / module /
  anim / io / ui` section layout.
- Keep all art in **one master palette language** (roles → ramp steps); never hardcode colors.
- **Procedural where variety pays; hand-authored where identity matters.** Don't auto-generate hero faces.
- The **depth-grade** math is shared with the game runtime — keep it portable.

## How this got here (migration note)
M0 was authored in a session scoped to the `waikiki-26` repo and staged there under `tide-forge/` on
branch `claude/scuba-game-prototype-vpxs01`, then imported into this `tide-forge` repo. If any file
looks missing, it can be recovered from that branch.

## To continue
Say: **"Continue TideForge — build M1 per M1_SPEC.md, starting with FloraForge."**
