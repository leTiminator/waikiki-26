# TideForge — M1 build spec (Flora · Tiles · VFX)

> Goal of M1: prove the module system generalizes past creatures, and add the environment art the game
> needs. Each module reuses the M0 **core** (palette, pixel-matrix, depth-grade, corruption, colorizer)
> and the **animation** system unchanged. Build in this order.

## Shared: formalize the Module interface first
Before adding modules, extract the implicit M0 contract into an explicit one so the rail UI + export
are written once:
```js
Module = {
  id, label, icon,
  paramSchema: [ {key,label,type:'range|select|chips|swatch',min,max,step,options} ],
  defaults(): cfg,
  generate(cfg, rng): { roles /*or layers*/, meta:{cx,cy,anchors...} },
  motions: ['sway',...]   // which animation models make sense for this module
}
```
Render the control rail **from `paramSchema`** (auto-generated), so a new module needs zero bespoke UI.
Keep the same `bakeClip`, timeline, and export code paths.

---

## 1. FloraForge (coral, kelp, sea weeds)
**Technique:** L-systems / recursive growth into the role-matrix, then organic recolor + sway anim.

- **Archetypes:** `kelp` (tall single/multi strand), `staghorn` (branching coral), `fan` (sea fan,
  flat lattice), `soft` (blobby soft coral), `grass` (turtle-grass clumps).
- **L-system:** axiom + rules with seeded randomness; params: `iterations`, `branchAngle`,
  `branchChance`, `segmentLen`, `taper`, `curl`. Draw each segment as a thick line stamped into the
  matrix with shade roles (BACK on the shaded side, HIGH on the lit side → same countershading trick).
- **Tips/polyps:** stamp small BELLY/SPEC clusters or GLOW (for bioluminescent variants at depth).
- **Palette:** reuse master ramps (kelp/lime/violet/coral fit). Corruption bleaches coral (dead-reef
  look) — thematically perfect.
- **Animation:** the **`sway`** motion model already exists; extend it so amplitude scales by **height
  above the holdfast** (base fixed, tips move most). Add a `current` param (bias sway direction).
- **Anchors:** `base` (holdfast) for placing on the seafloor; `tips` for attaching particles.

## 2. TileForge (reef rock, sand, rubble, walls)
**Technique:** noise-filled base tiles + **autotiling edge masks** so tiles seam correctly in-engine.

- **Base fill:** value/blue noise → shade roles for texture (grain for sand, blocky for rock).
- **Autotiling:** generate a **47-tile blob set** (or the 16-tile minimal) from one material by
  compositing edge/corner masks — export as a tilesheet the engine's autotiler consumes.
- **Params:** `material` (sand/rock/rubble/coral-crust), `grain`, `contrast`, `edgeStyle`.
- **Depth-grade preview:** show tiles at a chosen depth so artists see them in-context.
- **Export:** a **tilesheet PNG** + a JSON describing the tile layout / autotile mapping (Godot
  TileSet-friendly). No animation needed (optionally a subtle `shimmer` for caustics later).

## 3. VFXForge (bubbles, silt, godrays, glow motes)
**Technique:** parametric particle/gradient **bakes** to short looping spritesheets (or export params
for a runtime particle system — support both).

- **Effects:** `bubbles` (rising, wobble, pop), `silt` (expanding puff, fades), `godray` (soft shaft,
  slow sway), `glow` (pulsing bioluminescent mote), `blood/ink` (diffusing cloud).
- **Params per effect:** count, size range, speed, spread, lifetime, color (from palette/accent).
- **Output:** a looping spritesheet + a JSON of the particle params (so the game can either play the
  sheet or drive its own emitter). This is the highest atmosphere-per-effort work — do it early if
  the game needs polish fast.

---

## Also in M1 (supporting)
- **Asset library:** save generated assets (cfg+seed+clips) to `localStorage`; browse/reload/delete.
  A seed+cfg fully reproduces an asset, so entries are tiny.
- **Palette editor (lite):** view/tweak the master ramps; add a custom ramp. Everything downstream
  recolors live.

## Definition of done (M1)
Flora, Tiles, and VFX selectable in the module switcher, each generating in-style art that previews
with depth-grade + corruption and exports (sheet/tilesheet + JSON). The game can drop in a reef scene
built entirely from TideForge output. Then move to M2 (characters + rig + keyframe editor + pixel-paint).

---

# DELIVERED — M1 build record

M1 shipped in `index.html`. What was built against each item above:

**Shared module interface** — done, as `defModule({id,label,icon,size,fit,groups,paramSchema,
defaults,generate|generateFrames,motions,clips,hint,hud,label2})`. The control rail, the randomizer,
the timeline, the asset library and every exporter are written once against it; a module declares
`paramSchema` and gets its whole UI generated. `bakeClip`/timeline/export code paths are unchanged in
shape — `bakeFrames` just gained a branch for pre-baked modules.

**1. FloraForge** — done. All five archetypes (kelp, staghorn, fan, soft, grass). Stochastic L-system
rewriting with `[ ]` branch pruning by `branchChance`, interpreted by a turtle stamping thick tapered
segments; roles come from the segment normal vs. a fixed light direction (same countershading trick as
creature bodies), with lower growth biased a step darker. Polyps/tips are shaded like little spheres;
`bio` swaps them for GLOW. Sea fans web adjacent tips into a lattice. Corruption bleaches via the
shared transform. `sway` now scales amplitude by height above the holdfast and takes a `current` bias.
Anchors: `base` + `tips`.
- *Refinement not in the spec:* segment length **and** taper are normalised by iteration count, so an
  archetype fills the frame whatever the iteration setting — the `seglen` slider reads as a relative
  multiplier. Without this the branching archetypes came out as stubs and kelp tapered to a hairline.
- `branchChance` floors at 30%: the bracket-only archetypes (fan especially) collapse to a single
  segment at 0.

**2. TileForge** — done, with the **full 47-tile blob set** (not the 16-tile minimal). Base fill is
periodic value noise (the lattice wraps at the tile edge, so a tile always seams with itself),
quantised into stone cells with a shaded seam on the lower-right and a lit lip on the upper-left.
Materials: sand / rock / rubble / coral-crust; params `grain`, `contrast`, `edgeStyle`
(hard/soft/rounded). Edges and corners — outer corners carved and re-outlined, inner corners creased.
The preview is a **live autotiled seabed**, so the seams are visible in context, and it depth-grades
with the shared slider. Exports a tilesheet PNG (12×4 at 4×) plus JSON carrying the tile layout, the
bit values, and the full **256-entry `maskToTile` map** a Godot autotiler can consume directly.
- *Not done (spec marked it optional/later):* the `shimmer` caustics animation. Tiles are static.

**3. VFXForge** — done. bubbles / silt / godray / glow / ink, params count, size, speed, spread,
lifetime. **Both** outputs as specified: a looping spritesheet and the emitter params in the JSON, so
the game can play the sheet or drive its own particle system. Every particle advances a whole number
of cycles across the clip, so the loop is seam-free at any frame count (verified by comparing the
wrap-around frame delta against the typical frame delta). Silt and ink accumulate a density field and
map density→role rather than stamping discs first-write-wins, which is what makes them read as volume.

**Supporting** — asset library (localStorage, capped at 24, thumbnails rendered from cfg+seed,
reload/delete/clear) and the lite palette editor (10 master ramps, per-stop colour editing, add and
delete custom ramps, live recolour everywhere, persisted).

## Definition of done — met
Flora, Tiles and VFX are all selectable in the module switcher, each generates in-style art that
previews with depth-grade + corruption, and each exports (sheet/tilesheet + JSON). A reef scene can be
built entirely from TideForge output.

## Deliberate deviation
The spec suggested migrating to Vite + ES modules for M1. The app stayed **single-file**, which
`START_HERE.md` explicitly permits until the refactor lands ("new modules can be added to `index.html`
following the existing `core / module / anim / io / ui` section layout"). Keeping it dependency-free
preserved instant-open iteration, and the explicit Module contract is what actually buys the
independence — the file split is now a mechanical move whenever it's wanted. Reassess at M2, when the
pixel-paint layer and a rig arrive.

Next: **M2** — CharacterForge + rig + keyframe timeline + the pixel-paint layer, then PropForge.
