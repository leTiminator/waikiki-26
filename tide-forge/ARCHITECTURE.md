# TideForge — Architecture & Engine Design (v0.1)

> **TideForge** is a bespoke procedural + hand-editable **pixel-art & animation engine** for the game
> *DEEP / The Last Divers*. Scope decision: **"B" — the full art engine** intended to produce (nearly)
> all of the game's 2D art, with a real animation system. This document is the engineering north star.
> The companion game lives in its own repo; TideForge is a standalone tool.

---

## 0. What it is (and the honest boundary)
TideForge generates game art from **modular parts + rules + palettes**, animates it **procedurally and
via keyframes**, and exports **spritesheets + manifests** a game engine can import. It is *not* a magic
"one button → all art" box. It is a **shared core** plus a **family of domain generators**, and every
generated asset is **hand-editable** (a pixel editor layer). Hero art (the diver, key NPC portraits,
capsule art) is expected to be *authored* in TideForge's editor, optionally *seeded* by a generator —
never fully auto-generated. Procedural earns its keep on **high-variety, structurally-regular** art
(creatures, flora, tiles, props, VFX) and on **motion**.

---

## 1. Layered architecture
```
┌───────────────────────────────────────────────────────────┐
│  UI SHELL           module switcher · canvas · param rail   │
│                     · timeline · export bar · asset library │
├───────────────────────────────────────────────────────────┤
│  MODULES (generators)                                       │
│    CreatureForge · FloraForge · TileForge · PropForge ·     │
│    CharacterForge · VFXForge                                │
│    each: paramSchema + generate(cfg,rng) → Asset            │
├───────────────────────────────────────────────────────────┤
│  ANIMATION                                                  │
│    motion models (procedural) · rig/skeleton · clips ·      │
│    keyframe timeline · onion-skin · playback                │
├───────────────────────────────────────────────────────────┤
│  CORE                                                       │
│    PixelMatrix · Layers · PaletteSystem · DepthGrade ·      │
│    Corruption · RNG · Colorizer                             │
├───────────────────────────────────────────────────────────┤
│  IO                                                         │
│    PNG · spritesheet · JSON manifest (Godot/Aseprite-ish) · │
│    GIF (later) · project file · asset library (localStorage)│
└───────────────────────────────────────────────────────────┘
```

## 2. Core (shared by everything)
- **PixelMatrix** — a `W×H` grid of **role ids** (not colors). Roles are semantic: `OUTLINE, BACK,
  SHADOW, BASE, HIGH, BELLY, SPEC, FIN, PATTERN, EYE*, GLOW, MOUTH, …`. Separating *role* from *color*
  is the whole trick — one matrix recolors into infinite palettes and lighting states.
- **Layers** — composite assets (a diver = body + tank + mask + fins layers) stack matrices with
  z-order + anchors. Enables part-swapping and gear-on-character.
- **PaletteSystem** — named **ramps** (dark→light, ~5 steps) + a **role→ramp-step** mapping. One
  master palette keeps *all* art in the same visual language.
- **DepthGrade** — the signature light-absorption transform (red dies first → blue-black) applied at
  colorize time, driven by a depth value. Shared by tool preview *and* game runtime (same math).
- **Corruption** — the "wrongness" transform (bleach + desaturate + sickly tint + glow/extra-eye).
- **Colorizer** — `(role, palette, depth, corruption) → RGBA`, cached per asset/state. Ramps are
  **hue-shifted** on the way through — highlights warm, shadows cool, luminance preserved — because
  hue movement, not just value movement, is what makes a ramp read as lit.
- **Shading vocabulary** (shared by every generator, so form reads consistently across modules):
  **ordered dithering** (a 4×4 Bayer matrix, so a 5-step ramp implies far more than 5 tones),
  a **selective outline** (the lit edge takes a warm `RIM` instead of the flat dark `OUTLINE`),
  a screen-space **ambient-occlusion** pass that darkens pixels tucked away from the light, and a
  translucent `TRANS` role for membranes — fin webbing, sea-fan lattice. One light direction
  (`LIGHT_X/LIGHT_Y`, upper-left) drives all of it.
- **RNG** — seeded (mulberry32) so every asset is reproducible from `(module, cfg, seed)`.

## 3. Module interface (how "all art" stays sane)
Every generator implements the same contract, so the UI, animation, and export are written **once**:
```js
Module = {
  id, label, icon,
  paramSchema,                 // declares controls → auto-generates the rail UI
  defaults(),                  // starting cfg
  generate(cfg, rng) → Asset   // Asset = { layers:[PixelMatrix], meta, anchors, rig? }
}
```
- **paramSchema** drives the control rail automatically (range/select/chips/swatches), so adding a
  module never means hand-building UI.
- **anchors** = named points (eye, mouth, hand, mount, foot) for attaching parts, VFX, or rig bones.
- **rig** (optional) = a skeleton for character-class assets (see §5).

**Planned modules**
| Module | Produces | Technique | Priority |
|---|---|---|---|
| CreatureForge | fish / sea life | ellipse body + part kit + pattern | **M0 (built)** |
| FloraForge | coral, kelp, weeds | L-systems / growth rules | **M1 (built)** |
| TileForge | rock/sand/reef tiles | noise + edge/autotile masks | **M1 (built)** |
| VFXForge | bubbles, silt, godrays, glow | particle/shader bakes | **M1 (built)** |
| PropForge | gear, wrecks, debris, UI icons | modular kit + convex shading + ageing | **M1.5 (built)** |
| CharacterForge | diver + NPCs (rigged) | modular humanoid + skeleton | M2 |

## 4. Animation system (procedural + keyframe)
Two complementary paths, unified by **Clips**:
- **Procedural motion models** — pure functions `(x,y,role,phase,meta,params) → {dx,dy,scale}` applied
  at bake time. No frames drawn. Presets: **swim** (traveling wave down the body), **sway** (kelp,
  amplitude by height), **idle-bob**, **breathe/pulse** (radial scale), **flutter** (fins only),
  **blink**. This is how a low-count team gets fluid motion for free. *(Built in M0 for creatures.)*
- **Rig / skeleton** (M2) — bones + IK for humanoids; procedural gaits (walk/swim) + hand-tunable.
- **Keyframe timeline** (M2) — for authored, expressive cycles: draw/pose per frame, **onion-skin**,
  ease, loop. Works on matrices *or* rig poses.
- **Clips** — named `{ motion|keyframes, params, frameCount, fps }` per asset (e.g. `swim`, `idle`,
  `hurt`, `dart`). An asset ships multiple clips → one spritesheet, one manifest.

## 5. Export & data
- **Spritesheet PNG** — one row per clip, columns = frames; power-of-two padding optional.
- **JSON manifest** — frame rects, clip names, fps, anchors, pivot. Target formats: **Godot
  `SpriteFrames`** and **Aseprite-JSON** shapes (both documented, both trivially importable).
- **Single-frame PNG**, **individual frames**, **GIF/APNG** (later — needs an encoder).
- **Project file** (`.tideforge.json`) — palettes + assets + clips; the game repo imports it.
- **Asset library** — save/browse generated+edited assets (localStorage first, file-backed later).

## 6. Tech & pipeline
- **Now (M0–M1):** single self-contained `index.html`, Canvas 2D, zero deps — instantly openable and
  publishable, ideal for fast iteration and sharing. Internally organized into `core / module /
  anim / io / ui` sections mirroring the eventual file split.
- **Next (in the real repo):** migrate to **Vite + vanilla ES modules** (`/src/core`, `/src/modules`,
  `/src/anim`, `/src/io`, `/src/ui`), unit-tested core, so modules can grow independently.
- **No framework** required; Canvas is enough. Add a GIF encoder + a pixel-editor canvas as deps only
  when those milestones arrive.
- **Pixel editor** (M2) — a paint layer over any generated asset (draw/erase/fill by role or color),
  so generation *seeds* and humans *finish*. Non-negotiable for hero art.

## 7. Roadmap
- **M0 — Core + Creatures + procedural animation** *(built).* PaletteSystem, PixelMatrix,
  DepthGrade, Corruption, CreatureForge, motion models, clip timeline, spritesheet+JSON export.
- **M1 — Environment & VFX** *(built).* An explicit Module contract with a schema-generated control
  rail; FloraForge, TileForge (47-tile blob autotiling + fill variants), VFXForge; asset library;
  palette editor.
- **M1.5 — Depth of image** *(built).* A shared shading vocabulary (dithering, hue-shifted ramps,
  rim light, ambient occlusion, membranes); form lighting for creatures; PropForge; and five
  parallax layers in the game's reef scene.
- **M2 — Characters & authoring.** CharacterForge + rig, keyframe timeline, the pixel-editor paint
  layer, PropForge.
- **M3 — Pipeline.** Godot/Aseprite export polish, project files, batch generation, palette editor,
  GIF/APNG.

## 8. Guardrails (so the tool doesn't eat the game)
- Ship **M0 usable** before starting M1. Every milestone must produce art the game can actually use.
- **Procedural where variety pays; hand-authored where identity matters.** Don't try to generate the
  diver's face.
- If a domain is faster in Aseprite than in TideForge, **use Aseprite** — the tool is a means, not a
  monument.
