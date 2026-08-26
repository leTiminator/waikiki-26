/**
 * DEEP — depth-based light absorption.
 *
 * This is the signature system (ART_BIBLE §4.1): water eats colour with depth, red
 * first, then orange/yellow/green, until only blue-black remains. One function does
 * most of the game's atmospheric heavy lifting.
 *
 * CANONICAL: this file is the reference statement of the math. TideForge's core
 * (tide-forge/index.html, `gradeColor`) carries an identical copy so the tool can
 * preview exactly what the runtime will draw. `reef/tools/verify-grade.mjs` asserts
 * the two agree pixel-for-pixel — if you change the curve here, change it there and
 * re-run that check.
 *
 * Assets are exported from TideForge ungraded (depth 0) and graded here at runtime,
 * so a single sheet serves every depth.
 *
 * ONE DELIBERATE EXCEPTION. Two of TideForge's roles are not ordinary pigment and are
 * graded on a shallower curve inside the tool: GLOW (emissive — bioluminescence should
 * survive where reflected colour dies) and HAZE (water itself, not an object in it).
 * A flat export re-graded uniformly here will therefore differ for those pixels. Assets
 * that lean on them — bioluminescent flora, godrays, silt — want an emissive mask
 * alongside the sheet so the runtime can hold them out. Not needed for the current
 * slice, where they're drawn as loose overlays; worth doing before they matter.
 */

export const MAX_GRADE_DEPTH = 60;   // metres at which absorption saturates

export function clamp(v,a,b){return v<a?a:v>b?b:v;}

/** @param {[number,number,number]} c 0-255 RGB @param {number} depth metres */
export function gradeColor(c, depth){
  const t = clamp(depth / MAX_GRADE_DEPTH, 0, 1);
  let r = c[0] * (1 - 0.88 * t);      // red dies first
  let g = c[1] * (1 - 0.42 * t);      // then green
  let b = c[2] * (1 - 0.10 * t);      // blue survives
  r += (9  - r) * 0.30 * t;           // pull toward the ambient blue-black
  g += (22 - g) * 0.28 * t;
  b += (46 - b) * 0.26 * t;
  const dk = 1 - 0.28 * t;            // and darken overall
  return [clamp(r*dk,0,255)|0, clamp(g*dk,0,255)|0, clamp(b*dk,0,255)|0];
}

export const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;

/** Depth zones as art moods — ART_BIBLE §5. */
export const ZONES = [
  {name:'Surface', max:5,        mood:'safe, warm, inviting'},
  {name:'Reef',    max:18,       mood:'alive, busy'},
  {name:'Twilight',max:30,       mood:'serious, hushed'},
  {name:'Deep',    max:45,       mood:'tense, lonely'},
  {name:'Abyss',   max:Infinity, mood:'dread, wonder'}
];
export const zoneAt = d => ZONES.find(z => d < z.max) || ZONES[ZONES.length-1];

/**
 * Grade a whole ImageData in place-ish, via a colour lookup table.
 * Sprites use a handful of distinct colours (roles -> ramp steps), so the LUT turns a
 * per-pixel colour computation into a per-pixel map lookup. This is the "palette-swap
 * driven by the player's depth" the art bible asks for.
 */
export function gradeImageData(src, dst, depth){
  const lut = new Map();
  for(let i=0;i<src.length;i+=4){
    const a = src[i+3];
    if(!a){ dst[i]=dst[i+1]=dst[i+2]=dst[i+3]=0; continue; }
    const key = (src[i]<<16)|(src[i+1]<<8)|src[i+2];
    let g = lut.get(key);
    if(g===undefined){
      const c = gradeColor([src[i],src[i+1],src[i+2]], depth);
      g = (c[0]<<16)|(c[1]<<8)|c[2];
      lut.set(key,g);
    }
    dst[i]=(g>>16)&255; dst[i+1]=(g>>8)&255; dst[i+2]=g&255; dst[i+3]=a;
  }
}
