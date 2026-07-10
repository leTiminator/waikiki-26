# DEEP / "The Last Divers" — Game Design Document

> Working title: **DEEP** (alt: *The Last Divers*, *Fathom*, *Breathhold*, *Second Fathom*).
> Status: **v0.1 design draft** — the north-star document. Everything here is a decision of record
> unless flagged **[OPEN]**. Build order lives in §20 (Prototype) and §19 (Roadmap).

---

## 0. One-paragraph pitch
In a drowned, post-collapse world, a handful of survivors cling to a small island and the rusting
aircraft carrier beached on its shore. They can't farm enough, can't fish enough from the surface —
so they depend on **divers**, the most revered people left alive, who descend into the dangerous
blue to bring back food, salvage, medicine, and the lost treasures of the old world. You are the
**best diver the village has ever had.** *DEEP* is a slow, methodical 2D scuba-survival sim where
you plan every dive, respect your body and your air, manage nitrogen and buoyancy and fear, and come
home to a community that lives or dies by what you carry up — and that quietly worships you for it.

---

## 1. Design pillars
Three pillars. Every feature must serve at least one; anything that fights one gets cut.

1. **Procedure IS the gameplay.** Equalizing, buddy checks, buoyancy trim, gas planning, safety
   stops — the "boring" real rituals of diving, made tactile and satisfying. The fun is competence,
   not reflexes.
2. **Slow is a feature; consequence, not combat.** You rarely fight the ocean — you respect it,
   mitigate, and recover. Rushing is almost always the wrong call. Tension comes from air, depth,
   nitrogen, and your own calm, not from monsters to kill.
3. **They're counting on you.** The settlement is the stakes engine. You dive carefully because
   people starve if you don't come back — and because you are their legend. Every dive is a small
   act of love and pressure.

**Player fantasy:** *the calm expert.* The one who stays methodical when things go wrong, who reads
the water, who comes back when others wouldn't. Mastery feels like *lowering your heart rate.*

---

## 2. Platform, audience, scope, price
- **Platform:** PC first (Steam), Windows + Linux (Proton/native). Steam Deck a stretch target
  (great fit — slow, handheld-friendly). Console later if it lands.
- **Engine (recommended):** **Godot 4** (free, no royalties, best-in-class 2D, ships to Steam
  cleanly). C# or GDScript. Unity is the fallback if the team prefers it. Decision in §21.
- **Price:** **$4.99–$6.99** launch, with a launch-week discount. Target the "one great evening +
  a long tail" value bracket; 6–12 hours of content for a satisfying $5.
- **Audience:** fans of Dave the Diver, Dredge, Subnautica, Stardew/【cozy-tense】 sims, and — the
  secret weapon — **real divers**, who have almost no game that respects the hobby. They are a
  small but loud, high-word-of-mouth community.
- **Comparables & how we differ:**
  | Game | What we borrow | How we differ |
  |---|---|---|
  | Dave the Diver | 2D dive/hub day-cycle, art warmth, charm | Diving is *methodical & real*, not arcade action |
  | Subnautica | survival diving + base, oxygen dread | 2D, procedure-driven, no crafting-sim bloat, real scuba |
  | Dredge | cozy-eerie tone, "wrongness" at depth, collection | scuba not boat-fishing; body/air simulation |
  | Barotrauma | systems depth, things-go-wrong | single-diver human-scale, calmer, solo-friendly |
- **Team assumption:** solo or 2–4 person small team. Scope is guarded ruthlessly; §19/§20 define a
  shippable core with clean cut lines.

---

## 3. Setting & narrative

### 3.1 The world
Sometime in the near past the seas rose and something in the water *changed* — call it **the
Swell**. Coastlines drowned, supply chains died, most people with them. The ocean is now both the
reason the world ended and the only larder left. It is bountiful and it is **wrong** in places:
most life is ordinary, but the deeper and darker you go, the more you find creatures that shouldn't
be — bleached, oversized, too still, too curious. Nobody has a full explanation. The game never
fully explains it either; the mystery is the pull. (See §11 marine life.)

### 3.2 The refuge
Your community is **maybe 20–60 souls** on a small island. Beached on its reef sits a
half-scuttled **aircraft carrier**, the *[name TBD — e.g. USS Perseverance]*, dragged aground years
ago and slowly gutted into a home: quarters in the hangar deck, gardens on the flight deck, a
smokehouse in a gun tub. It is your **hub**, your base, and — in the endgame — your **ark**.

- **Early/mid game:** the carrier is dead in the water, a fixed home. You dinghy out from it to
  nearby dive sites. Its dark engine rooms and flooded lower decks are themselves late-game dive
  content.
- **Endgame:** you restore its engines and systems enough to **refloat and sail it**, migrating the
  whole community to a new region — new water, new life, new dangers. The static hub becoming a
  moving one is the finale and the sequel hook.

### 3.3 The culture of divers *(core theme — do not treat as flavor)*
The whole society organizes around **divers**. They are the providers, the heroes, the closest
thing to celebrities and priests the new world has:

- **Aspiration.** Every kid wants to be a diver. Apprentices beg to buddy with you. There's a
  waiting list for the training course.
- **Ceremony.** A returning diver is met at the water's edge. Their haul is laid on the **Return
  Wall**. When a diver dies, there's a rite — an empty mask set on the wall, names read.
- **Status = your legend.** A **Reputation / Legend** stat (§10.5) rises with bold, clean, generous
  dives and falls with lost apprentices, abandoned hauls, and reckless calls. It changes how NPCs
  talk to you, what prices you get, who volunteers to dive with you, and what the village asks of
  you.
- **You are the best.** The MC is *already* the legend at game start — the tutorial is you being
  watched. This flips the usual power fantasy: you don't earn respect from zero, you carry the
  weight of already having it. The drama is living up to it and mentoring the next generation.

### 3.4 The main character & the fishing business
The MC runs a modest **surface fishing operation** (nets, traps, longlines) that predates the diving
— it's the "day job" that keeps the village fed *baseline*, while diving is the ambition and the
lifeline for everything the surface can't provide. Mechanically this gives us **two harvest verbs**
(§10.6): fishing = safe, passive, steady; diving = risky, active, exceptional. Narratively it grounds
the MC as a working person, not a superhero.

### 3.5 Cast (named, deep — see §10.4)
A small, memorable cast, each tied to a base module and a personal arc. Examples (all **[OPEN]** —
placeholders):
- **The Chief / Quartermaster** — runs the carrier, gives you the community's needs, your foil.
- **The Mentor** — the old diver who trained you, now can't dive (a lung, an ear, the bends once
  too often). Your conscience and tutorial voice.
- **The Apprentice(s)** — 2–3 hopefuls with distinct personalities and dive abilities; you choose
  who to train and take down. The emotional core of the "lose one and it hurts" system.
- **The Doc** — runs the infirmary; treats your DCS and injuries; disapproves of your risks.
- **The Fixer / Engineer** — services gear, works the carrier restoration; gates the endgame.
- **The Farmer, the Cook, the Radio operator** — smaller arcs tied to their modules.

### 3.6 Tone
Cozy-but-tense. Warm sunlight and human moments topside; blue, quiet, occasionally *wrong* below.
Grounded and humane, not grimdark. Think *Dredge*'s unease crossed with *Spiritfarer*'s tenderness.

---

## 4. The core loops

### 4.1 Macro loop — the day cycle *(structure decision: day-cycle + light contracts)*
```
MORNING  Base phase: assess needs (food/water/parts/morale), read contracts/requests,
         manage & assign crew, run the fishing business, service & choose gear, pick a
         buddy or go solo, plan the dive (site, depth, gas, objective).
DAY      Dive phase: travel to site → descend → work the objective → manage air/nitrogen/
         incidents → ascend slow → safety stop → surface.
EVENING  Return phase: haul is weighed & distributed, legend updates, injuries treated,
         catalog/photos logged, money/resources allocated to base upgrades, story beats.
NIGHT    (optional) Night dive, planning, or rest → next day.
```
The rhythm is **tense dive / calm planning**, alternating. Contracts (village/faction requests:
"find insulin," "salvage the pump seal," "we need 40kg of fish before the storm") layer *direction*
on top of the sandbox without removing player choice.

### 4.2 Micro loop — a single dive
```
PLAN → GEAR CHECK → ENTRY → DESCENT(equalize, trim) → BOTTOM(objective, air/N2/incidents,
       navigation, environment) → ASCENT(slow, deco if owed) → SAFETY STOP → EXIT → LOG
```
Each stage is a distinct interaction (§6). The dive is the game; everything else exists to give it
weight and consequence.

---

## 5. Controls & feel (2D)
Side-view 2D, character-scale. The **feel** target is *weight and deliberateness* — the diver has
momentum, buoyancy, and drag; nothing snaps.

- **Move:** left/right swim, up/down kick. Swimming costs air (more when finning hard/against
  current); drifting is free.
- **Buoyancy (the signature feel):** two layers —
  - **Breath (fine):** inhale to rise slowly, exhale to sink slowly (real divers trim depth with
    lungs). Held mid-breath = neutral. A gentle, always-on control.
  - **BCD (coarse):** tap to add/dump air from the buoyancy vest for big depth changes. Over-inflate
    near the surface and you risk an uncontrolled ascent.
- **Breath-hold:** hold to stop breathing (silence, stillness, zero bubbles — for skittish life or a
  moment of control) — but CO₂ builds, and **you must never hold your breath while ascending**
  (lung over-expansion = injury). The game teaches this as a real rule with real consequence.
- **Context action:** grab/collect, clear mask, hold guide line, signal buddy, take photo.
- **HUD toggle:** raise wrist to read the **dive computer** (depth, time, air, no-deco, ascent
  rate) — deliberately a *glance*, not an always-on wall of numbers, to keep immersion (§14).

Controls fully rebindable; gamepad-first, mouse+keyboard supported (Steam Deck target).

---

## 6. The dive — detailed systems
This is the heart. Each subsystem below is designed to be **independently toggleable / tunable** so
the prototype can ship a subset and difficulty modes can dial things off.

### 6.1 Pre-dive planning
Before entry the player commits to a **dive plan** on the boat/deck:
- **Site** (depth profile, hazards, visibility band, life, current) — from the map (§12).
- **Depth target & bottom time** — the game shows the **no-deco limit** for that depth/gas.
- **Gas:** air or a **nitrox** mix (§6.9) with its **MOD** (max operating depth) shown.
- **Objective:** collect / photograph / salvage / explore / contract.
- **Buddy or solo** (§7).
- **Load-out:** weights (trim, §6.14), light + battery (night, §6.12), tools, extra tank/stage,
  camera, catch bag.
A good plan is rewarded; the water punishes improvisation. Planning is deliberately a *satisfying
ritual*, not a chore — clean UI, sensible defaults, "repeat last plan."

### 6.2 Gear & the pre-dive check *(prototype-critical)*
A tactile **buddy-check minigame** (the real acronym **BWRAF** — BCD, Weights, Releases, Air, Final).
Each dive, the game **randomly seeds 0–N faults** based on gear condition (§9.3):
- A loose tank band, a low tank you didn't top off, a torn mask strap, a free-flowing octopus, a
  dead computer battery, a stuck inflator, a missing weight.
- The player inspects each item; catching a fault lets you fix/replace it topside (safe). **Missing
  a fault** means it surfaces *underwater* as an incident (§6.10) at the worst time.
This single system delivers the "checking gear with randomly generated issues" fantasy and doubles as
the tutorial for every failure mode.

### 6.3 Entry & descent
- **Entry:** giant-stride/back-roll flavor beat (mostly cosmetic; can fail comically if unweighted).
- **Descent:** you sink at a controlled rate via BCD/breath. Descending too fast risks a squeeze and
  skips your equalization window.

### 6.4 Equalization *(signature methodical beat)*
As you descend, **pressure builds on your sinuses/ears**. A subtle on-screen pressure indicator
rises; you must **equalize** (a gentle, rhythmic input — e.g. a timed button, "pinch and blow")
every few meters to keep it in the green.
- Descend too fast or skip it → pain, a **reverse block**, forced slow-down, or (if ignored) an ear
  **barotrauma** injury that benches you for days (§10, infirmary).
- A **congested day** (random morning condition) makes equalizing harder — a reason to *not dive*
  today, reinforcing "the best divers know when to stay out of the water."

### 6.5 Buoyancy & trim (moment-to-moment)
Neutral buoyancy is the skill you're always practicing. Depth, breath, BCD, wetsuit compression, and
tank weight (which drops as air depletes) all shift it. Mastery = hovering effortlessly, drifting,
never touching the bottom. Poor buoyancy → bumping the reef (damages life/legend), **stirring silt**
(kills visibility, §6.13), and wasting air correcting.

### 6.6 Air / gas management *(prototype-critical)*
Your tank pressure is the master clock of every dive.
- Consumption scales with **depth** (deeper = denser gas = faster use), **exertion** (finning,
  current), and **stress/panic** (§6.11). This makes calm, shallow, efficient diving *literally last
  longer.*
- Teach **rule of thirds** (⅓ out, ⅓ back, ⅓ reserve) as a soft guide; a **turn-pressure** marker on
  the gauge nudges you to head back.
- Running low → warnings → the tension of the ascent. Out of air → emergency procedures (§6.8),
  never instant death (per stakes choice). A **pony/stage bottle** upgrade adds a reserve.

### 6.7 Nitrogen, no-deco limits & decompression *(all four risk systems: IN)*
A modeled (simplified single-tissue or few-tissue) **nitrogen load**:
- The **dive computer** shows your **No-Deco Limit (NDL)** counting down — a function of depth and
  time. Stay within it and a normal slow ascent + safety stop is enough.
- Blow past the NDL and you incur a **decompression obligation**: mandatory **deco stops** at set
  depths on the way up, shown on the computer. Skipping them (or a fast ascent, §6.15) rolls for
  **decompression sickness (DCS / "the bends")** → injury, infirmary time, legend hit.
- **Repetitive dives / surface interval:** residual nitrogen carries between dives in a day; the
  second dive has a shorter NDL. Rewards spacing dives and planning the day, not just the dive.
- Presented as a *readable gauge with color states*, never as dive-table math the player must do.

### 6.8 Emergency procedures *(IN)*
When things go truly wrong, the game offers **skill-based outs**, not just failure:
- **Air-sharing:** signal your buddy, take their **octopus** (backup reg), ascend together sharing
  gas. Requires a buddy in range and calm (stress makes the handoff fumble).
- **CESA (Controlled Emergency Swimming Ascent):** out of air, no buddy — swim up slowly while
  exhaling continuously (a held-input mini-game: too fast = lung/DCS risk, too slow = blackout risk).
  The dramatic solo escape.
- **Buddy rescue:** if your buddy panics/blacks out, *you* perform the rescue (bring them up
  controlled) — a tense reversal that ties into §7 and the culture theme.

### 6.9 Nitrox & gas mixes *(IN)*
An unlock (via certification, §8). **Enriched-air nitrox (EANx)** raises O₂ %:
- **Benefit:** less nitrogen → longer NDL / bottom time at moderate depth.
- **Cost:** raised **oxygen toxicity** risk below the mix's **MOD**; exceed MOD and you roll for a
  tox hit (potentially fatal in reality — here: severe incident/injury). You must **analyze your
  mix** (a small pre-dive check) and respect its depth ceiling.
- Creates a genuine planning tradeoff and a reason to own multiple tanks/blends.

### 6.10 In-dive incidents *(prototype-lite; expands later)*
Random or fault-seeded events you must **calmly resolve**, each a small interaction:
- **Mask flood/leak** → tilt head, exhale through nose to **clear the mask** (classic).
- **Regulator free-flow** → switch to octopus / feather the purge.
- **Reg out of mouth** → recover & clear it.
- **Cramp** → stretch it out (brief immobilization).
- **Entanglement** (line, net, kelp) → stay still, cut free with a knife (panic makes it worse).
- **Inflator stuck** → dump/disconnect before it rockets you up.
- **Vertigo / lost-in-silt** → stop, breathe, find a reference.
Each incident spikes **stress** (§6.11); resolving it calmly restores control. The design rule:
**the correct response is almost always "slow down and do the procedure."**

### 6.11 Panic / stress *(IN — core to pillar 2)*
A **stress meter** that rises with incidents, low air, depth/narcosis, darkness, entanglement, and
**task-loading** (multiple problems at once). Effects of high stress:
- **Faster air consumption**, tunnel-vision **UI vignette**, shakier inputs, harder equalizing.
- If it maxes → **panic**: the dangerous urge to bolt for the surface (an uncontrolled ascent).
Player tools to lower stress: **slow, deliberate breathing** (a rhythm mini-interaction — the "box
breathing" beat), stopping to hover, holding a line, your buddy's presence. Staying calm is the
*mechanically optimal* play — the pillar made literal.

### 6.12 Night diving & light *(IN)*
Night/deep-dark sites: vision reduced to your **dive-light cone**; **battery** is a consumable
(charge it topside, §9). Different life emerges at night (many species only appear then — feeds the
catalog, §11, and the "wrongness"). Dropping/breaking your light is a genuine emergency. A backup
light is a smart load-out choice.

### 6.13 Visibility & silt
Each site has a **visibility band** (crystal → murky), varied by weather, depth, night, and your own
**silt-outs** from bad buoyancy/finning. Low viz raises stress, hides life and hazards, and makes
navigation (§6.14) matter. High-viz days are a joy and a reason to pick sites by conditions.

### 6.14 Underwater navigation *(IN)*
You must **find your way back** to the ascent line / boat:
- **Compass** load-out + **natural navigation** (reef contours, ripples, the slope of the bottom).
- A **guide/reel line** you can lay for wrecks/complex sites (and mandatory for overhead, §6.16).
- Get lost → longer swim back = more air/nitrogen spent = real tension. A **surface marker buoy
  (SMB)** upgrade helps the boat find *you*.
- **Weighting & trim** (the pre-dive weight choice) lives here too: correct weighting = effortless
  hover & efficient finning; over/under-weighted = wasted air, silt, and fatigue.

### 6.15 Ascent & the ascent-rate rule *(prototype-critical — best tension-per-code in the game)*
The golden rule: **ascend slowly.** A prominent **ascent-rate indicator**:
- Green = safe (≤ ~9–10 m/min). Yellow = too fast (warning). Red = dangerous → rolls for DCS /
  lung injury.
- The tension of a low-air, deep dive is the *discipline to rise slowly anyway.* This one mechanic,
  cheap to build, carries the whole emotional signature of the game.

### 6.16 Safety stop & deco stops *(safety-stop: IN; overhead: POST-LAUNCH)*
- **Safety stop:** hover at ~5 m for ~3 minutes before surfacing — a **discipline check** against
  surge and buoyancy drift, with a visible timer. Optional but skipping it risks DCS; doing it every
  time is the mark of a pro.
- **Deco stops:** mandatory when you owe deco (§6.7), at computer-dictated depths.
- **Overhead environments (wrecks/caves):** penetration where you *can't* go straight up — requires
  guide line, gas planning (rule of thirds becomes law), backup light. **Deferred to post-launch**
  as premium high-risk content; the carrier's flooded decks are the natural first overhead site.

### 6.17 Objectives (why you're down there)
- **Forage/collect:** food fish/shellfish, edible plants, resources (materials, fuel, scrap).
- **Salvage:** wreck loot, machine parts (feeds base repair & the carrier endgame), old-world
  treasures (economy & story).
- **Photograph/catalog:** marine life (§11) — the calm collection loop; rarity + shot quality = pay.
- **Rescue/retrieve:** contract objectives (a person, a specific part, a lost diver's gear).
- **Explore:** reveal map, find new sites, uncover "wrongness" lore.

---

## 7. Buddy & solo system *(deep buddy system: IN)*
- **Buddies** are **named crew/apprentices** (§3.5) with distinct **abilities & traits**: e.g. one
  spots rare life, one is calm (stabilizes your stress), one carries extra gas, one is a strong
  swimmer for current, one is reckless (higher yield, higher risk). You choose who to bring.
- Buddies enable **air-sharing** and **mutual rescue** (§6.8); they can also **panic** and need
  *your* help — reversing the pressure and deepening the culture theme.
- **Apprentices** train over time by diving with you (they gain skill/certs), and **losing one hurts**
  — legend hit, a funeral rite, and NPC arcs change. This is the game's sharpest emotional stake and
  a direct reward for the "don't get greedy" pillar.
- **Solo** = higher **legend** and yield (no split, no restrictions) but **no safety net**: an
  out-of-air with no buddy means CESA or bust. The classic risk/reward, framed as the legend flexing.

---

## 8. Progression: certifications & skills *(cert tiers: IN)*
A diegetic **certification ladder** gates depth, gas, sites, and features — you *earn your ranks*,
mirroring the diver culture:
- **Open Water** (start-ish) → depth ~18 m, basic gear.
- **Advanced** → deeper (~30 m), night & navigation specialties, nitrox.
- **Rescue** → buddy-rescue tools, stress management, better emergency outcomes.
- **Deco / Tech** (endgame) → deep dives, deco procedures, stage bottles, overhead (post-launch).
Certs are unlocked via **courses/exams** at the base (time + resources + a skill mini-check), taught
by your Mentor. Beyond certs, a lighter **skill/perk** layer (air efficiency, calm, sharp eyes,
faster equalizing) rewards playstyle. Certs also drive **which contracts and sites** open up.

---

## 9. Gear
### 9.1 Gear slots
Mask, fins, wetsuit/drysuit (thermal & depth rating), BCD (lift & pockets), regulator + octopus,
tank(s) (size & gas), weights, dive computer, light, knife, compass/SMB, camera, catch bag, and
consumables (batteries, patches, O-rings, spare mask).

### 9.2 Upgrades & choice
Each slot has a **progression of items** with real tradeoffs (not just "bigger number"): a bigger
tank = more air but more drag/weight; a drysuit = warmth but harder buoyancy control; a fancy
computer = better info but costly. Buying/upgrading is a core money sink (§13) and a reason to dive.

### 9.3 Servicing & maintenance *(IN)*
Gear **degrades with use**; the **Workshop** module (§10) services it. Condition affects the odds &
severity of **pre-dive faults (§6.2)** and **in-dive incidents (§6.10)**. Batteries need charging;
O-rings and straps get consumed. Neglect = a nastier gear-check next time. Ties maintenance directly
to survival, and gives the Engineer NPC a role.

---

## 10. The base / settlement

### 10.1 Design stance *(fixed unlockable slots)*
**Not** a free-placement builder. The carrier/island has **predefined slots** you **unlock and
upgrade**; the world art visibly grows (rooms light up, gardens fill in, the deck populates). This
delivers most of the base-building satisfaction at a fraction of the cost/scope and keeps the game
shippable. The door stays open to add free placement later.

### 10.2 The Module data model *(architecture — build this way from day one)*
Everything on the base is a **Module**, one uniform schema, so a one-room dive shop and a 20-room
carrier are the *same code + more data*:
```
Module {
  id, name, level, slot,
  inputs:  [resource+rate],      // what it consumes
  outputs: [resource+rate],      // what it produces
  staffSlot: crewRef|null,       // an assigned survivor buffs it
  condition: 0..1,               // degrades, needs repair/parts
  unlockReq: {cert|story|resource|carrier-restore-stage}
}
```
The prototype ships exactly **one** module (Dive Shop). Everything below is additive data, never a
rewrite.

### 10.3 Module list & rough unlock order
1. **Dive Shop** *(v1)* — gear storage, **tank fills** (needs power/compressor), **workbench**
   (repairs/servicing). The only module the prototype needs.
2. **Smokehouse / Kitchen** — raw fish → rations/meals; interacts with spoilage (§13).
3. **Rain catcher / Desalinator** — fresh water for crew & divers.
4. **Hydroponics / Garden** (flight deck) — greens, trade goods, meds precursors.
5. **Infirmary** — treats DCS, barotrauma, injuries; run by the Doc; recovery time & cost = your
   "injury + lost cargo" failure surface.
6. **Quarters** (hangar deck) — house survivors; more hands (staff/fishing) but more mouths.
7. **Workshop / Fabricator** — craft & upgrade gear from salvage; services gear (§9.3).
8. **Power** (generator → solar → batteries) — gates many modules; fuel is a dive-able resource.
9. **Cold storage / Fridge** — reduces spoilage; enables stockpiling.
10. **Radio / Watchtower** — reveals new sites, brings contracts, traders, and new survivors.
11. **Training hall** — where certs (§8) and apprentices (§7) are taught.
12. **Aquaculture pens** — farm/breed caught fish; late-game passive food so you can dive purely for
    treasure/story.
13. **Engine room** *(endgame)* — the carrier-restoration track; refloat & relocate (§10.7).

### 10.4 Crew / survivors *(named cast + deep culture)*
Named survivors (§3.5) with **traits, needs, morale, and personal arcs**. Assign them to module
**staffSlots** to boost output, or train them as **apprentice divers** (§7). Morale is driven by
food/water/safety, your **legend**, and story choices; low morale → people leave or stop working.
Keep the cast **small and hand-authored** (quality over quantity) to stay in budget while delivering
Dave-the-Diver warmth.

### 10.5 Reputation / Legend *(core theme system)*
A visible **Legend** stat, the social currency of the diver culture:
- **Rises:** clean dives, generous hauls, meeting contracts, rescuing a buddy, bold solo feats,
  training apprentices to graduation.
- **Falls:** lost/abandoned hauls, a dead or injured apprentice, reckless calls, unmet critical
  needs.
- **Effects:** NPC dialogue & warmth, shop prices, which apprentices volunteer, morale, and
  unlocking of special contracts/ceremonies. Legend is *the* score that isn't money — it's how the
  village *feels* about you.

### 10.6 The fishing business *(two-verb economy)*
Surface fishing (nets/traps/longlines) is a **safe, passive, manageable** food engine you tend from
the base: set gear, assign crew, collect yields, upgrade capacity. It covers the village's **baseline
calories** so diving is about *ambition and rare finds*, not desperation — keeping the game from
feeling grindy or cruel. It also gives non-diver crew meaningful work and the MC a grounded identity.

### 10.7 Endgame: restore & relocate the carrier
A long-arc **restoration project** (hull patches, engines, power, navigation) fed by salvage,
parts, fuel, and specialist crew. Completing it lets you **refloat and sail the carrier to a new
region** — resetting the site map with tougher, richer water and advancing the story. The static hub
becomes a moving one: the finale, and a natural spot to end v1 / seed a sequel or DLC.

---

## 11. Marine life & the catalog *(real + subtle wrongness; photo-catalog IN)*
- **Real biology, mostly.** A hand-authored bestiary of believable reef/pelagic/deep species with
  real behaviors: skittish schools, territorial morays, curious turtles, cleaner stations, hunting
  patterns, day/night shifts. Learning behavior = better photos, safer dives, richer forage.
- **Subtle wrongness at depth.** Rare, unsettling variants and creatures the deeper/darker you go —
  bleached, oversized, too-still, wrong-eyed — never fully explained. The **catalog** slowly reveals
  how far the Swell reached. This is the mystery pull without turning into a monster shooter.
- **Hazards, not enemies.** Dangerous life is **avoided, not fought**: stings (fire coral,
  jellyfish, cone snails), bites (moray, shark territory), and the rule *don't touch anything*.
  Getting hurt = injury (§infirmary), and a legend/karma ding for damaging life.
- **Photography loop:** frame, hold still (breath-hold helps), light it (night), and capture; the
  game scores **rarity × behavior × composition**. Fills an **encyclopedia**, pays out, and is the
  calmest, coziest reason to dive. A perfect "just one more dive" hook.

---

## 12. Sites, regions & the world map
- **Site = a hand-authored 2D dive level** with: depth profile, **visibility band**, **current**
  pattern, thermal/night state, hazard set, life table, and objective hooks.
- **Regions** group sites around the current base location. **Restoring & relocating the carrier**
  (§10.7) swaps to a new region — the primary macro-progression gate.
- **Site archetypes for launch:** shallow reef (tutorial-safe), kelp/temperate (entanglement,
  cold), sandy flats (navigation, buried salvage), the drop-off/wall (depth, narcosis, nitrogen),
  a shipwreck (salvage; light overhead teased), a night site, and the **carrier's own flooded decks**
  (home-grown overhead content for late game). Aim ~8–12 hand-crafted sites for a $5 scope.
- **Conditions vary by day** (weather → visibility, current, surface chop affecting entry), so the
  "pick where to dive today" decision stays fresh without infinite content.

---

## 13. Economy & resource flows
- **Currencies/resources:** money/barter (**scrip**), **food**, **water**, **power/fuel**, **parts/
  scrap**, **meds**, **rare treasures** (high-value story/economy items).
- **Sources:** diving (rare/high-value), fishing (staple food), gardens/rain (water/greens),
  contracts (targeted rewards), selling to traders (via Radio).
- **Sinks:** gear buy/upgrade/service, cert courses, module unlocks/upgrades, crew needs
  (food/water tick per day), infirmary costs (your failure surface), the carrier restoration.
- **Spoilage** makes food a *flow*, not a hoard, until Cold Storage upgrades — a gentle pressure
  that rewards processing (smokehouse) and planning. All base ticks are **per-day** (never mid-dive),
  protecting the methodical pacing.
- **Balance intent:** fishing covers baseline so the player is never in a death spiral; diving is
  where *growth* comes from. Failure costs progress (lost haul, injury downtime), never a game-over.

---

## 14. UX / UI
- **Immersion-first HUD.** Underwater, minimize persistent numbers. Core state is felt (bubbles,
  breathing SFX, vignette for stress, muffled audio deep) and **glanced** on the wrist **dive
  computer** (depth, time, air, no-deco, ascent rate). Diegetic where possible.
- **Planning screens** are clean and forgiving: clear defaults, "repeat last plan," visible NDL/MOD,
  no arithmetic demanded of the player. The sim is honest underneath but **readable** on top.
- **Gear check & incidents** use tactile, physical interactions over menus.
- **The Log:** every dive auto-writes a **logbook** entry (depth, time, life seen, haul) — both a
  real-diver delight and the catalog/collection backbone.
- **Onboarding:** the Mentor voice teaches procedures diegetically as the MC "refreshes the basics"
  and trains apprentices. Real dive knowledge is delivered as *play*, not text walls.

---

## 15. Art direction
- **2D, warm & painterly topside; blue, layered, atmospheric below.** Dave-the-Diver-adjacent
  readability and charm, but calmer and moodier. Parallax water columns, godrays, particulate,
  silt, and a palette that shifts colder/darker with depth (red drops out first, like real light
  absorption — a free bit of realism that looks gorgeous).
- **Character & creature art** hand-authored; the "wrongness" creatures get uncanny, memorable
  silhouettes. Base grows visibly as modules unlock.
- **Readability rule:** hazards, interactables, and the ascent line must always read clearly even in
  low viz (subtle outlines/iconography), so difficulty comes from the sim, not from not-seeing-a-button.

---

## 16. Audio
- **Sound is a core mechanic, not dressing.** Your own **breathing** is the metronome of the dive
  (calm vs. panicked pacing is audible); **bubbles**, the click of the computer, distant whale song,
  the wrong silence when life goes still before a predator. Muffling and pressure with depth.
- **Topside:** warm, human, folk-instrument island score; the community's life.
- **Stingers** for incidents kept restrained — unease over jump-scares.
- Breathing/heart-rate audio ties directly to the **stress system** (§6.11) — the player *hears*
  themselves losing or keeping control.

---

## 17. Difficulty & accessibility
- **Modes:** *Story* (forgiving sim, faults rare, generous air/NDL) → *Diver* (default, the intended
  methodical experience) → *Tech/Realism* (hardcore-sim numbers for the real-diver crowd) →
  optional **Ironman/permadeath toggle** for those who want it (default off, per the "injury not
  death" stance).
- **Granular toggles:** because every dive subsystem (§6) is independent, players can dial specific
  systems (equalizing, deco, navigation) up/down — great for accessibility and for the "I just want
  to explore" crowd.
- **Accessibility:** remappable inputs, hold-vs-toggle for breath/held actions, colorblind-safe
  gauges, adjustable timers (equalize/safety-stop windows), reduced-motion & screen-shake options,
  full subtitles, and a **panic-assist** option that softens the stress spiral.

---

## 18. Save & meta
- **Single persistent campaign save** (auto-save at phase boundaries; the day cycle gives clean save
  points). Optional multiple slots. No online requirement.
- **Logbook & catalog** persist as the player's "collection" meta and Steam-achievement surface
  (first night dive, 100 species, a clean deco dive, graduate an apprentice, refloat the carrier…).

---

## 19. Content scope & roadmap
Guarded scope. Cut lines are explicit so the game can *ship*.

- **M0 — Prototype / vertical slice** (§20): one site, the core dive loop, one module. *Answer: is
  the dive fun?*
- **M1 — Core dive complete:** all launch dive subsystems (nitrogen, narcosis, nitrox, emergencies,
  currents, navigation, night, stress, safety stop, weighting), gear + servicing, 4–5 sites.
- **M2 — Base & culture:** module system + ~8 modules, named cast + arcs, legend, fishing business,
  contracts, certs, apprentices.
- **M3 — World & endgame:** 8–12 sites, full catalog/photography, carrier restoration & relocation,
  the "wrongness" lore arc, balance & economy pass.
- **M4 — Polish & ship:** difficulty modes, accessibility, audio pass, Steam page, demo (Next Fest),
  localization-ready strings.
- **Post-launch:** **overhead environments** (wrecks/caves penetration), thermoclines/drysuit depth,
  more regions, new-game+, community wishlist.

---

## 20. THE PROTOTYPE (build this first)
**Goal:** prove the core fantasy — *is a slow, careful dive fun to control and tense to survive?* —
in the smallest possible build. **Ship nothing else until this is fun.**

**Include (and only this):**
1. One 2D dive site (a simple reef with a drop-off) + boat/deck entry point.
2. **Buoyancy via breath + BCD** (the signature feel — get this *juicy*).
3. **Air gauge** that depletes (faster with depth/exertion).
4. **Ascent-rate meter** with green/yellow/red + a DCS-ish consequence (the best tension-per-line
   system).
5. **Equalization** on descent (the methodical beat).
6. **One pre-dive gear check** with 1–2 random faults.
7. **1–2 in-dive incidents** (mask flood/clear; a free-flow) to prove the "calm procedure" loop.
8. A **collect + photograph objective**, and **surface safely = success** (with a **safety-stop**
   prompt at 5 m).
9. A **stub base:** a single "Return" screen that weighs your haul and shows a ration counter ticking
   — just enough to *feel* "they're counting on you."

**Explicitly excluded from the prototype:** nitrogen/deco math, nitrox, narcosis, currents,
navigation, night, the module system, crew, certs, economy, story. All layer on later without
rework (that's what §10.2 buys us).

**Success test:** a playtester finishes a dive, exhales in relief at the surface, and *immediately
wants to plan a better one.* If yes → build M1. If no → fix the feel before adding anything.

---

## 21. Tech recommendation
- **Engine:** **Godot 4** — free, no per-sale royalty (critical at a $5 price), excellent 2D
  pipeline, small binaries, first-class Steam export via GodotSteam. GDScript for velocity; C# if the
  team prefers typing/perf.
- **Architecture notes:** build the **Module system (§10.2)** and a **data-driven dive-subsystem
  registry** (each of §6's systems as an independent, toggleable component) from the start — this is
  what makes the prototype→full-game path additive. Keep **sim state** (depth, air, N₂, stress,
  buoyancy) in one clean model updated each tick; the UI/audio just *read* it.
- **Content pipeline:** sites, gear, creatures, modules, and contracts all as **data files** (JSON/
  Godot resources) so design can iterate without code — essential for a small team hitting 8–12
  sites and a big catalog.

---

## 22. Monetization & Steam strategy
- **Premium, one-time $4.99–$6.99.** No microtransactions, no ads — antithetical to the audience and
  the tone.
- **Steam page early**, wishlist-driven. A **free demo** (a polished version of the prototype dive)
  aimed at **Steam Next Fest** — this genre demos *extremely* well (the tense-dive clip is inherently
  shareable).
- **Marketing angle:** "the scuba game that actually respects scuba." Court the **real-diver
  community** (dive forums, r/scuba, instructors) — a small, passionate, high-conversion audience —
  plus the cozy-sim and Dave-the-Diver crowds.
- **Post-launch DLC** (overhead/tech diving, new regions) can extend the tail without a sequel.

---

## 23. Risks & mitigations
| Risk | Mitigation |
|---|---|
| **Base-building scope creep** kills the project | Fixed-slot module system (§10.1); base is 30% of effort by design |
| Sim feels like homework, not fun | "Grounded but *readable*" (§14); the sim is honest underneath, glanceable on top; difficulty toggles |
| Slow pacing reads as "boring" | Make the *feel* juicy (buoyancy, audio, tension); tense-dive/calm-base rhythm; contracts for direction |
| Too many dive subsystems to build | Independent, toggleable components (§21); ship a subset (M1), add rest incrementally |
| Small team can't hit content volume | Data-driven sites/creatures/modules; hand-author a tight, high-quality set over a huge shallow one |
| Failure feels punishing against cozy tone | "Injury + lost cargo," fishing safety-net, no game-over (§13) |

---

## 24. Open questions / parking lot
- Final **title** and the community/carrier proper names.
- Exact **nitrogen model** fidelity for *Diver* vs *Tech* modes (single-tissue vs multi).
- Is there an **overarching antagonist/mystery resolution** to the Swell, or is it deliberately
  never explained? (Recommend: *mostly* unexplained, a few haunting answers.)
- **Multiplayer / co-op buddy** — almost certainly out of scope for v1; note as a dream feature.
- How **hand-crafted vs. semi-procedural** are sites? (Recommend hand-crafted for launch.)
- Length target: what's the **critical-path hours** vs. completionist (catalog/legend) hours?

---

*End of v0.1. This document is the north star; §20 is the next action. Build the dive, prove it's
fun, then grow the world around it.*
