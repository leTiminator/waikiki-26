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
