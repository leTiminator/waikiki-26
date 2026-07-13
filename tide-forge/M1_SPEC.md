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
