# DEEP — reef vertical slice

The first playable fragment of *DEEP*, and the first consumer of TideForge output.

It exists to prove two things:

1. **The atmosphere thesis.** ART_BIBLE §14 puts "depth colour-grade shader + a single reef
   background" first on the shot list, because that one system does most of the game's
   atmospheric work. Dive from the surface to 25 m and watch the reds die.
2. **The art pipeline actually works.** Every tile, plant, fish and effect on screen was
   generated in TideForge, exported to a file, and imported here through its published JSON
   manifest. Nothing is re-generated at runtime.

## Run it

```sh
npx http-server scuba-game -p 8080
# then open http://localhost:8080/reef/
```

A server is required — browsers refuse to `fetch()` the manifests from `file://`.

## Controls

| | |
|---|---|
| **← →** | swim |
| **↑ ↓** | kick up / down |
| **Q** / **E** | dump / inflate the BCD (coarse buoyancy) |
| **Space** | hold your breath — no bubbles, no air burned |

Breathing trims your depth on its own: you rise on the inhale and sink on the exhale, which
is how a real diver holds a level. Air burns faster the deeper you are (ambient pressure) and
faster again when you're finning. Ascend above 9 m/min and the computer complains — that's the
real rule, and GDD §6.15 calls it the best tension-per-line-of-code in the game.

## Files

| | |
|---|---|
| `index.html` | the scene — terrain, entities, diver, HUD |
| `depth-grade.js` | **canonical** depth-based light absorption (ART_BIBLE §4.1) |
| `tideforge.js` | importer: reads a TideForge manifest + sheet, slices frames, autotiles |
| `assets/` | exported art — committed, so the scene runs without the tool |
| `tools/export-assets.mjs` | regenerates `assets/` by driving TideForge headlessly |
| `tools/verify-grade.mjs` | asserts the tool and the runtime grade colour identically |

## Sea life

Fish are real Pacific-reef species, not archetypes. Each carries its traits in its own
manifest — approximate adult length in cm, body depth/length aspect, real colours, the
depth band it lives in, and whether it shoals — and the scene reads those to place it.

Sprite size comes from the species' true length through a square-root compression curve
(TideForge's art scale): 19 px for a 9 cm chromis up to 106 px for a 1.7 m giant trevally.
Strictly to scale the chromis would be a 3-pixel dot with nowhere to put an eye, so the
range is compressed the way every commercial game compresses it — the ordering stays
honest and the true cm travels in the manifest for gameplay to use.

Tight schoolers (chromis, anthias, convict tang, bluestripe snapper, bigeye scad) spawn as
shoals: one moving centre with members holding station around it. That is cheaper and
steadier than per-fish boids and reads correctly at these sizes. Pairs (butterflyfish,
moorish idol), loose aggregations (tangs, parrotfish) and solitary hunters (trevally,
whitetip, moray) each spawn to their own rule.

Placement intersects a species' true depth band with the water actually above the reef. If
they don't overlap, the species isn't found at that depth and simply doesn't spawn — which
is why the reef sits at ~12 m, the shallow-reef zone this roster actually lives in. An
earlier build put the seabed at 22.6 m and almost nothing spawned; the level was wrong,
not the ecology.

## Ecology: how growth finds its place

Placement is not `if (random < density)`. That distributes things *evenly*, which is why
an earlier build read as clutter. Real reef distribution is a habitat-suitability function
over a few physical quantities, so those are computed once from the terrain and everything
else follows with no per-colony tuning constants:

| Field | Computed from | What it drives |
|---|---|---|
| **light** | ray marched down each column, blocked by rock, attenuated by depth, then scattered sideways | every photosynthetic coral — and sponges, which *invert* it |
| **exposure** | openness to the water column in a radius | robust massive forms take it; delicate branching forms need shelter; fans want flow |
| **substrate** | flatness + local basins → sand, rubble or hard rock | nothing hard-bottomed grows on sand; seagrass grows *only* there |
| **relief** | height above the local seabed | crest / slope / base zonation |

Each guild declares a niche as ranges over those four; suitability is the product of
triangular membership functions. Colonies are then **seeded** from the suitability map —
pick a good face, grow outward through neighbours while the habitat still suits that
guild, stop when it doesn't. Colony size falls out of the habitat rather than a constant:
big stands where conditions are good, scattered individuals at the margins.

The same substrate model decides the **tile material**, which matters more than it sounds:
capping every top cell with sand drew a continuous tan band across the whole reef and was
the single most artificial thing on screen. Sand now appears in basins and flats only.

## Look and feel

Three systems do most of the atmospheric work, and none of them are assets:

**One current, not many.** Every plant used to sway on its own random phase — the
even-sprinkle mistake again, in time instead of space. A single surge field (a travelling
wave in x plus a slow wander) now returns a phase that varies smoothly across the reef, and
flora sway frames, particulate drift and fish station-holding all sample it. A wave visibly
passes through the coral instead of each plant twitching to its own clock.

**Caustics.** Refracted light throws a rippling net over anything facing upward. Masked by
the same light field the ecology uses, so it dies under overhangs and fades out with depth.
The first attempt capped each floor tile with a 6px sliver — it rendered fine and covered
0.4% of the screen, which is to say it was invisible. Caustics are a continuous sheet lying
over the seabed, not a per-tile decal, and the pattern has to vary in **both** axes or it
reads as vertical stripes rather than a net.

**Camera and post.** The camera leads the direction of travel and eases toward that target,
so the diver moves through the world instead of the world sliding under a locked frame.
Bloom is done by downscaling the frame with smoothing *off* and adding it back, which keeps
the bleed chunky and in keeping with the pixel grid rather than smearing a gaussian over
pixel art. A vignette pulls the eye off the frame edges.

## Parallax layers

Five layers, back to front (ART_BIBLE §8):

1. **Water** — the depth-graded gradient.
2. **Far drop-off** — a silhouette ridge, heavily hazed, slow horizontal parallax.
3. **Background reef** — a nearer ridge with small flora on it, moderately hazed.
4. **Gameplay layer** — the autotiled seabed, flora, fish, diver, bubbles, silt.
5. **Foreground** — near flora silhouettes and coarse particulate, parallaxed *past* the
   camera and pushed deep into the grade so they read as unlit shapes.

Two things make this work, and both were wrong on the first attempt:

**Distant layers are silhouettes, not tiles.** Reusing the detailed tile kit for the
background smears its 16px repeat across half the screen and reads as wallpaper. At
distance you read a shape and a value, never a texture. Distance is sold by *contrast
loss* — mixing toward the ambient water — which is also exactly what keeps the gameplay
layer legible (§8's readability rule).

**Parallax is motion relative to a shared pivot**, not a raw multiple of the camera
position. `worldY - camY * f` is meaningless in absolute terms; every layer is placed as
`pivot + (cam - pivot) * f`, so all layers align at the opening view and diverge as you
swim. And because a ridge fills downward from its crest, that crest must stay inside the
frame: one that drifts above the viewport floods the screen with a single flat colour,
which looks exactly like having no layers at all.

## How the pipeline fits together

TideForge exports **ungraded** art (depth 0, raw palette colours). The runtime applies the
depth grade itself, so one sheet serves every depth and the grade can follow the player
continuously instead of being baked per asset. Grading runs as a colour LUT over each sheet,
cached in 2 m buckets — the "palette-swap driven by the player's depth" the art bible asks for.

Sheets ship at an integer export scale (5× sprites, 4× tiles) and are sliced back to native
1× art-pixels on load, then drawn at one integer zoom. That's what keeps the pixel grid
consistent across modules that were authored at different frame sizes.

The seabed is not hand-placed: a heightmap produces a solidity grid, and each solid cell picks
its tile straight from the manifest's 256-entry `maskToTile` map. Swapping in a different
material is a one-line change because the autotiling contract lives in the exported data.

## Keeping tool and runtime honest

```sh
node reef/tools/verify-grade.mjs
```

Exports an asset at depth 0 and again at depth D, applies `depth-grade.js` to the flat export,
and requires an exact pixel match against TideForge's own depth-D render. Currently passes on
1.77 M opaque pixels across creature, flora and tile assets at 24 / 31 / 44 m.

Run it after touching the curve in either place. It has already earned its keep: it caught the
diver's pupil colour being exempt from the grade in the tool, and a sub-unit rounding drift
that made the tool preview a colour the game could not reproduce.

## What's placeholder

The **diver is drawn in code**, not generated — hero art is deliberately hand-authored, and
CharacterForge + the pixel-paint layer are M2. Fish read large (roughly a metre); TideForge's
creature frame is a fixed 72×42, so small schooling fish need a variable frame size in the
tool. Both are noted for M2 rather than worked around here.
