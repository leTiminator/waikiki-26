# TideForge 🌊🔩

A bespoke **procedural + hand-editable pixel-art and animation engine** for the game
*DEEP / The Last Divers*. It generates game art from modular parts, rules, and shared palettes,
animates it procedurally (and, later, via keyframes), and exports spritesheets + manifests a game
engine can import.

- **Scope:** the full art engine (see [`ARCHITECTURE.md`](./ARCHITECTURE.md)) — creatures, flora,
  tiles, props, VFX, and rigged characters, plus animation.
- **Status:** **M1.5** — the core (palette, pixel-matrix, depth-grade, corruption, and a shared
  shading vocabulary: dithering, hue-shifted ramps, rim light, occlusion) plus five live modules:
  **Creatures**, **Flora**, **Tiles** (47-tile blob autotiling with fill variants), **VFX** and
  **Props**, with procedural animation clips, an asset library, a palette editor, and
  spritesheet / tilesheet / JSON export.
- **Philosophy:** procedural where variety pays off; hand-authored where identity matters. Every
  generated asset is meant to be editable, not final.

## Run it
Open [`index.html`](./index.html) in any modern browser. No build step, no dependencies.

## Use it
1. Pick a **module** — Creatures, Flora, Tiles, VFX, Props (Characters land in M2).
2. Shape the asset with the **generate** controls. The whole control rail is generated from each
   module's `paramSchema`, so every module gets the same rail, randomizer and exporters for free.
3. Set **dive conditions** (depth grade) and **corruption** to preview in-game lighting/wrongness.
4. Build **animation clips** in the timeline (motion model, amplitude, current, frames, fps; scrub,
   onion-skin). Tiles are static and hide the timeline.
5. **Export** a single PNG, a spritesheet (a row per clip) or tilesheet (the 47-tile blob set), plus
   the JSON manifest.
6. **Save** an asset to the library (a seed + cfg reproduces it exactly, so entries are tiny), and
   tweak the master ramps in the palette editor — everything downstream recolors live.

## The modules
| Module | Produces | Technique |
|---|---|---|
| **Creatures** | reef / angel / eel / puffer / predator fish | ellipse body + part kit + pattern |
| **Flora** | kelp, staghorn, sea fan, soft coral, turtle grass | L-system rewriting → turtle that stamps countershaded segments; sway scales with height above the holdfast |
| **Tiles** | sand / rock / rubble / coral-crust seabed | periodic cell noise + a 47-tile blob autotile set from edge & corner masks |
| **VFX** | bubbles, silt, godrays, glow motes, ink | per-frame particle bakes that loop exactly at any frame count |
| **Props** | crates, drums, tanks, hull plate, debris | modular kit shaded by one convex form model, then corroded and encrusted |

## Structure
Single self-contained `index.html`, organized internally into `core / modules / anim / ui / io`
sections mirroring the eventual file split. It migrates to Vite + ES modules (`/src/...`) when the
module count justifies it — see ARCHITECTURE §6.

## Roadmap
M0 core+creatures+animation → **M1 flora/tiles/VFX (done)** → M2 characters+rig+keyframe
editor+pixel-paint → M3 engine-export pipeline. Full detail in [`ARCHITECTURE.md`](./ARCHITECTURE.md).
