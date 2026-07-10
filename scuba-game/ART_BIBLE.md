# DEEP / "The Last Divers" — Art Bible (v0.1)

> Companion to `GDD.md`. This is the visual constitution: lock decisions here, and every asset
> should be checkable against it. **[OPEN]** = still to decide. Assumed production model: **solo-first
> pixel art in Aseprite, scaffolded with asset packs, scalable to a commissioned/AI-assisted pipeline
> if budget appears.** If that assumption is wrong, §11–12 change; the rest mostly holds.

---

## 1. Style statement (the one sentence)
**"Warm, hand-touched pixel art with cinematic underwater light — cozy and golden at the surface,
cold, quiet, and quietly *wrong* in the deep."**

North stars: **Dave the Diver** (readable animated pixels, charm), **Dredge** (atmospheric unease,
depth-fade), **Spiritfarer / Gris** (painterly tenderness, palette storytelling). We are moodier and
calmer than Dave, warmer and more human than Dredge.

**Locked direction:** rich **pixel art**, **lightly-stylized** characters, **minimal/floaty**
animation with **skeletal rigs for large creatures**. Atmosphere is carried by **light and color**,
not by asset volume — this is what keeps a small team's game looking premium.

---

## 2. The core principle: atmosphere over asset count
We cannot out-produce a big studio on asset *quantity*. We win on **light, color, and mood**. A
single well-lit reef with godrays, particulate, parallax, and a great palette beats ten flat rooms.
Budget goes to **lighting/FX and a few hero creatures**, not to breadth. Every dollar/hour spent on
the *water column* returns more than one spent on another prop.

---

## 3. Canvas, resolution & pixel density
- **Internal render resolution:** target **480×270** or **640×360** (16:9), integer-scaled to
  1080p/1440p. Low-enough to hand-author, high-enough for atmosphere. **[OPEN — pick one after a
  test scene; leaning 640×360.]**
- **Pixel grid discipline:** one consistent pixel size everywhere. No mixed-resolution assets (the
  #1 thing that makes indie pixel art look amateur). UI, characters, and world share the grid.
- **Character sprite height:** diver ≈ **28–36 px** tall. Human NPCs similar. This sets the scale
  for everything else (creatures, props, tiles at 16px or 32px).
- **Camera:** side-view, slight parallax; subtle slow drift/bob to feel "in the water." No pixel
  jitter — snap to the pixel grid or commit to a smooth sub-pixel camera, never halfway.

---

## 4. Color & light — the signature system
This is the most important section. The look lives or dies here.

### 4.1 Depth-based light absorption (our "free realism")
Real water eats color with depth — **red first, then orange, yellow, green — until only blue-black
remains.** We simulate this as a **depth-driven color grade** applied over the whole scene:
- **0–5 m (Surface):** full warm spectrum, sun-kissed, high saturation. Golden shafts.
- **5–18 m (Reef):** reds mute, palette cools slightly; still colorful, the "postcard" zone.
- **18–30 m (Twilight):** reds/oranges nearly gone; blues/greens dominate; contrast drops.
- **30–45 m (Deep):** near-monochrome blue; your **dive light** restores local color in its cone.
- **45 m+ (Abyss/Dark):** black beyond the light cone; bioluminescence and the "wrongness" glow.
Implement as a shader/palette-swap driven by the player's depth value. **This one system does most
of our atmospheric heavy lifting** and reinforces the dive sim (you *see* how deep you are).

### 4.2 Topside vs. subsurface palettes
- **Topside:** warm, saturated, golden-hour — oranges, sun-yellows, teal sky, weathered carrier
  rust, greenery. The community feels *alive and worth protecting.*
- **Subsurface:** cool base (teal→indigo→black) with **intentional warm accents** (a diver's light,
  a lure fish, coral, a glinting treasure) that pop precisely because the field is cool.

### 4.3 Palette structure
- Author from a **master ramp set**: ~8–12 core hues, each as a 4–6 step light→dark ramp, shared
  across all art for cohesion. **[OPEN — build the master `.pal` first; everything derives from it.]**
- **Stress/panic state:** desaturate + darken the edges (vignette) + narrow the light cone — the
  screen literally reflects losing composure (ties to GDD §6.11).
- **Accessibility:** never encode critical info in hue alone. Gauges use **shape + value + color**
  (green/yellow/red ascent bar also changes fill pattern/height). Colorblind-safe from day one.

---

## 5. Depth zones as art moods (a mood per band)
Each depth band is an emotional beat, not just a lighting value:
| Zone | Depth | Mood | Palette | Signature |
|---|---|---|---|---|
| Surface | 0–5 m | Safe, warm, inviting | golden + teal | godrays, sparkle, boat hull above |
| Reef | 5–18 m | Alive, busy, "postcard" | full cool-warm | coral color, fish schools, clarity |
| Twilight | 18–30 m | Serious, hushed | cooling blues | fading color, drifting particulate |
| Deep | 30–45 m | Tense, lonely | monochrome blue | light-cone islands of color, cold |
| Abyss/Dark | 45 m+ / night | Dread, wonder | black + glow | bioluminescence, wrongness, silence |

Art should make a player *feel the depth* before they read the number.

---

## 6. Character design language
- **Proportions:** lightly stylized — roughly **4.5–5 heads tall**, readable silhouettes, a touch of
  warmth. Not chibi (too cute for the tone), not photoreal (too costly, too cold).
- **Silhouette-first:** every character must be identifiable in pure black silhouette. NPCs get
  distinct shapes/gear so the small cast reads instantly.
- **The diver (hero asset):** the gear is the costume — mask, reg, hoses, fins, BCD, tank, light,
  computer on the wrist. Gear should be **legible even at 32px** because it's gameplay (the player
  reads their own kit). Upgrades should be **visibly different** on the sprite where feasible.
- **The MC:** looks the part of "the best" — confident stance, a signature silhouette element
  (a distinctive mask, a scarred wetsuit, a unique light). Iconic enough to be a Steam capsule face.
- **Expression:** topside, faces carry the charm (Dave-style emotive portraits for dialogue **[OPEN
  — portrait style: pixel bust vs. small illustrated portrait]**). Underwater, the mask hides the
  face, so **body language and bubbles** carry emotion.

---

## 7. Creature design & the "wrongness" language
- **Believable baseline:** most sea life reads as real — correct-ish shapes, behavior-driven motion
  (schooling, darting, hovering, cleaning). Believability makes the wrongness land.
- **The wrongness (spend art budget here):** rare deep/dark variants that are *uncanny, not gory* —
  the horror is in **silhouette, scale, stillness, and eyes/light**, not blood:
  - **Too big** (familiar creature, wrong scale), **too still** (hangs motionless, then isn't),
    **too many** (extra eyes/fins), **wrong light** (glows where it shouldn't), **wrong calm**
    (unbothered by you = predator confidence).
  - Design each as a **memorable black silhouette first** — if it's scary/striking in silhouette,
    it's right. These are the screenshots people share.
- **Hazard readability:** dangerous life must telegraph (color warning, posture, a "tell" animation)
  so death feels fair. Stingers/biters get a consistent visual grammar.

---

## 8. Environment & parallax
- **Layered depth:** far water haze → mid structures (reef, wreck, drop-off) → gameplay layer
  (where the diver & interactables live) → foreground particulate/silhouettes. 3–5 parallax layers.
- **Readability rule (critical):** the **gameplay layer** must always separate cleanly from
  background — interactables, hazards, and the **ascent line** get subtle rim-light/outline so they
  read even in murk or darkness. *Difficulty comes from the sim, not from hunting for a pixel.*
- **Tiling + hero pieces:** build sites from a **modular tile/prop kit** per biome (reef, kelp,
  sand, wreck, carrier-interior) for volume, plus a few hand-placed **hero landmarks** per site for
  identity and navigation (GDD §6.14).

---

## 9. Lighting & FX (the atmosphere engine)
Priority-ordered — build these early; they're the "premium" multiplier:
1. **Depth color grade** (§4.1) — do this first.
2. **Godrays / light shafts** from the surface, strongest shallow, fading with depth.
3. **Particulate/marine snow** drifting in the water column (density rises with depth/murk).
4. **Silt-out:** buoyancy/fin errors kick up a spreading silt cloud that kills local visibility.
5. **Dive-light cone** (night/deep): a soft radial that restores color locally; battery-dependent.
6. **Bioluminescence & glow** in the abyss/night — the beauty payoff of going deep/dark.
7. **Bubbles** from breathing (rate = the stress/breath state; a readable, diegetic gauge).
8. **Caustics** on surfaces near the surface if cheap to add.

---

## 10. UI / HUD art
- **Diegetic & minimal.** Core state is *felt* (bubbles, breathing SFX, vignette) and **glanced** on
  a **wrist dive computer** — a small pixel device UI (depth, bottom time, air, no-deco, ascent
  rate). Raising the wrist brings it up; it's not a permanent overlay.
- **Style:** the computer is a chunky, rugged, slightly-retro dive-watch aesthetic (fits post-apoc
  salvaged tech). Gauges use value+shape+color (accessibility, §4.3).
- **Menus (planning/base):** clean, warm, "field-manual / logbook" aesthetic — paper, stamps,
  handwriting, tide charts. The **logbook** is a hero UI object (real divers love their logbooks).
- **Icon set:** one cohesive pixel icon family for gear, resources, contracts, and life catalog.

---

## 11. Animation
- **Diver & humans:** **minimal/floaty** — few frames, but *motion* sells it: constant gentle drift,
  fin kicks as short loops, hair/hose/particle secondary motion, breath bob. Underwater's slow
  weightlessness is *forgiving* of low frame counts — lean into it (a cost advantage, not a
  compromise).
- **Large creatures:** **skeletal rigs** (Godot's `Skeleton2D`/cutout or Spine) — a rig animates
  smoothly and cheaply, ideal for undulating bodies/fins. Reuse rigs across similar species.
- **Small fish/schools:** cheap 2–4 frame loops + flocking motion; the *movement pattern* does the
  work, not the frame count.
- **Hero moments** (a "wrongness" reveal, a rescue): worth a few extra frames — spend sparingly.
- **Golden rule:** *movement > frames.* Secondary motion, easing, and drift make 4 frames look like
  20.

---

## 12. Tooling & production pipeline
- **Pixel art:** **Aseprite** (industry standard, cheap, great for palettes/ramps & frame anim).
- **Palettes:** author the **master `.pal`** first (§4.3); lock it; derive all art from it.
- **Skeletal:** Godot built-in cutout animation (free) or **Spine** if budget allows; DragonBones as
  a free alternative.
- **Engine import:** Godot 4, pixel-perfect import settings, a depth-grade shader, a parallax
  background system, and a particle system for snow/silt/bubbles.
- **Scaffolding with asset packs:** for the **prototype**, it's legitimate to start from a
  reef/underwater pixel pack to prove gameplay, then progressively **replace** with original art for
  cohesion & Steam release. Track what's placeholder vs. final in a simple asset list. *(Verify
  license allows commercial use before shipping anything.)*
- **If budget/AI enters:** commission or AI-generate **hero pieces** (capsule art, key creatures,
  portraits, promo) against this bible's palette & silhouette rules; keep gameplay sprites
  hand-controlled for consistency. Any AI-origin art gets a documented, Steam-policy-compliant
  disclosure and a human cleanup pass.

---

## 13. Consistency rules (the do/don't checklist)
**Do:** one pixel density · one master palette · silhouette-test every character/creature · let
depth drive color · spend FX budget on light/particulate · keep the gameplay layer readable.
**Don't:** mix resolutions · use pure black/white for large fills (use darkest/lightest ramp steps) ·
encode info in hue alone · over-animate cheap assets · let background clutter compete with
interactables · ship placeholder asset-pack art in the final build.

---

## 14. Prototype art shot list (make these, in this order)
Just enough to make the vertical slice (GDD §20) look and feel right — **placeholders welcome**:
1. **Depth color-grade shader + a single reef background** (proves the whole atmosphere thesis).
2. **The diver sprite** with: idle-drift, fin-kick, ascend/descend, reach/grab, mask-clear, and a
   "held breath / still" pose. (Hero asset — worth the time.)
3. **Wrist dive-computer UI** (depth / air / ascent-rate bar / no-deco readout).
4. **3–5 common fish** (2–4 frame loops) + **1 hero creature** for a memorable moment.
5. **Godrays + particulate + bubble** particle setups.
6. **Silt-out effect.**
7. **Ascent line + surface/boat** (the "you made it" beat).
8. **A warm topside "Return" frame** (haul on the wall, a ration counter) — sells "they need you."
If #1 and #2 look good together in motion, the art direction is proven — everything else scales from
there.

---

*End of Art Bible v0.1. Pair with GDD §20 for the prototype. Build the depth-grade + one reef + the
diver first; if that screenshot feels like the game, we've found the look.*
