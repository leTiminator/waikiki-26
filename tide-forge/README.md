# TideForge 🌊🔩

A bespoke **procedural + hand-editable pixel-art and animation engine** for the game
*DEEP / The Last Divers*. It generates game art from modular parts, rules, and shared palettes,
animates it procedurally (and, later, via keyframes), and exports spritesheets + manifests a game
engine can import.

- **Scope:** the full art engine (see [`ARCHITECTURE.md`](./ARCHITECTURE.md)) — creatures, flora,
  tiles, props, VFX, and rigged characters, plus animation.
- **Status:** **M0** — core (palette, pixel-matrix, depth-grade, corruption) + the **Creature**
  module + **procedural animation clips** + spritesheet/JSON export.
- **Philosophy:** procedural where variety pays off; hand-authored where identity matters. Every
  generated asset is meant to be editable, not final.

## Run it
Open [`index.html`](./index.html) in any modern browser. No build step, no dependencies (M0).

## Use it
1. Pick a **module** (Creatures active; others coming).
2. Shape the asset with the **generate** controls (archetype, body, fins, pattern, palette).
3. Set **dive conditions** (depth grade) and **corruption** to preview in-game lighting/wrongness.
4. Build **animation clips** in the timeline (choose a motion model, frames, fps; scrub, onion-skin).
5. **Export** a single PNG, a spritesheet (a row per clip), or the JSON manifest.

## Structure (M0)
Single self-contained `index.html`, organized internally into `core / module / anim / io / ui`
sections. It migrates to Vite + ES modules (`/src/...`) once in its own repo — see ARCHITECTURE §6.

## Roadmap
M0 core+creatures+animation → M1 flora/tiles/VFX → M2 characters+rig+keyframe editor+pixel-paint →
M3 engine-export pipeline. Full detail in [`ARCHITECTURE.md`](./ARCHITECTURE.md).
