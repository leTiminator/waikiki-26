#!/usr/bin/env node
/**
 * Proof that TideForge's preview and the game's runtime grade colour identically.
 *
 * ARCHITECTURE.md §2 claims the depth-grade math is "shared by tool preview *and* game
 * runtime (same math)". This asserts it instead of trusting it:
 *
 *   1. export an asset from TideForge at depth 0 (ungraded) and again at depth D,
 *   2. apply the *runtime's* gradeColor to the depth-0 export,
 *   3. require the result to equal TideForge's own depth-D export, pixel for pixel.
 *
 * If this fails, the tool is lying to the artist about what the game will draw.
 *
 *   node reef/tools/verify-grade.mjs
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');            // repo root: serves both projects same-origin

const MIME = {'.html':'text/html','.js':'text/javascript','.json':'application/json',
              '.png':'image/png','.css':'text/css'};
const server = http.createServer((req,res)=>{
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, rel.endsWith('/') ? rel+'index.html' : rel);
  if(!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200,{'content-type': MIME[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const chromium = await (async()=>{
  for(const m of ['playwright','/opt/node22/lib/node_modules/playwright/index.mjs']){
    try{ return (await import(m)).chromium; }catch(e){}
  }
  throw new Error('Playwright not found — run `npm i -D playwright`.');
})();

const CASES = [
  {name:'creature · yellow tang', module:'creature', chips:{Species:'yellowtang'}, depth:24},
  {name:'flora · staghorn',     module:'flora',    chips:{Archetype:'staghorn'},                  depth:31},
  {name:'tiles · rock',         module:'tiles',    chips:{Material:'rock'},                       depth:44}
];

const b  = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}});
const errs = [];
pg.on('pageerror', e => errs.push(String(e.message)));
await pg.addInitScript(()=>{window.__dl=[];const oc=document.createElement.bind(document);
  document.createElement=(t,...r)=>{const e=oc(t,...r);
    if(String(t).toLowerCase()==='a')e.click=()=>window.__dl.push({name:e.download,href:e.href});return e;};});
await pg.goto(`${BASE}/tide-forge/index.html`);
await pg.waitForTimeout(700);

async function chip(label,value){
  await pg.evaluate(({label,value})=>{
    for(const f of document.querySelectorAll('#rail .field')){
      const l=f.querySelector('.lab span');
      if(!l||l.textContent.trim()!==label)continue;
      for(const btn of f.querySelectorAll('.chips button'))
        if(btn.textContent.trim()===value){btn.click();return;}
    }
    throw new Error(`no chip ${label}/${value}`);
  },{label,value});
  await pg.waitForTimeout(300);
}
async function setDepth(v){
  await pg.evaluate(v=>{
    for(const f of document.querySelectorAll('#rail .field')){
      const l=f.querySelector('.lab span');
      if(!l||!l.textContent.trim().startsWith('Depth'))continue;
      const i=f.querySelector('input[type=range]');
      i.value=v; i.dispatchEvent(new Event('input',{bubbles:true})); return;
    }
    throw new Error('no depth slider');
  },v);
  await pg.waitForTimeout(420);
}
async function sheet(){
  await pg.evaluate(()=>{window.__dl=[];});
  await pg.click('#bSheet');
  await pg.waitForTimeout(650);
  return pg.evaluate(()=>window.__dl[0].href);
}

let failed = 0;
console.log(`\ndepth-grade portability: TideForge preview  vs  reef/depth-grade.js\n`);
for(const c of CASES){
  await pg.click(`#modules button[data-id="${c.module}"]`);
  await pg.waitForTimeout(450);
  for(const [k,v] of Object.entries(c.chips)) await chip(k,v);

  await setDepth(0);        const flat  = await sheet();
  await setDepth(c.depth);  const baked = await sheet();

  const r = await pg.evaluate(async ({flat,baked,depth})=>{
    const {gradeImageData} = await import('/scuba-game/reef/depth-grade.js');
    const load = src => new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.src=src;});
    const [a,bimg] = await Promise.all([load(flat), load(baked)]);
    const cv = (im)=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
      const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.drawImage(im,0,0);
      return x.getImageData(0,0,c.width,c.height);};
    const A = cv(a), B = cv(bimg);
    if(A.data.length !== B.data.length) return {error:'size mismatch'};
    const G = new Uint8ClampedArray(A.data.length);
    gradeImageData(A.data, G, depth);            // runtime grade, applied to the flat export
    // Split by alpha. Fully opaque pixels must match exactly. Semi-transparent ones get a
    // tolerance derived from the format rather than a fudge factor: canvas stores
    // premultiplied alpha, so un-premultiplying divides by a/255 and a half-unit
    // quantisation becomes +-0.5*255/a. Rounding happens on both the tool and the runtime
    // side, so the bound is ceil(255/a) per channel — 2 units at alpha 168, 3 at the
    // half-transparent alpha 124 the anti-aliasing pass uses. Anything beyond that is a
    // real disagreement about the curve.
    let opaque=0, opaqueBad=0, opaqueWorst=0, sample=null;
    let trans=0, transBad=0, transWorst=0, transTol=1;
    for(let i=0;i<G.length;i+=4){
      const a = B.data[i+3];
      if(a < 8) continue;
      const d = Math.max(Math.abs(G[i]-B.data[i]), Math.abs(G[i+1]-B.data[i+1]), Math.abs(G[i+2]-B.data[i+2]));
      if(a === 255){
        opaque++;
        if(d > opaqueWorst){ opaqueWorst = d;
          sample = {alpha:a, runtime:[G[i],G[i+1],G[i+2]], tool:[B.data[i],B.data[i+1],B.data[i+2]],
                    flat:[A.data[i],A.data[i+1],A.data[i+2]]}; }
        if(d > 0) opaqueBad++;
      } else {
        trans++;
        const tol = Math.ceil(255 / a);
        if(d - tol > transWorst - transTol){ transWorst = d; transTol = tol; }
        if(d > tol) transBad++;
      }
    }
    return {opaque, opaqueBad, opaqueWorst, trans, transBad, transWorst, transTol, sample};
  }, {flat, baked, depth:c.depth});

  const ok = r.opaqueBad === 0 && r.transBad === 0;
  if(!ok) failed++;
  console.log(`  ${ok?'PASS':'FAIL'}  ${c.name.padEnd(20)} @ ${String(c.depth).padStart(2)} m  ` +
              `opaque ${r.opaque}px/${r.opaqueBad} differ (Δ${r.opaqueWorst})  ` +
              `translucent ${r.trans}px/${r.transBad} over budget (Δ${r.transWorst} vs Δ${r.transTol} allowed)`);
  if(!ok && r.sample) console.log(`        flat ${JSON.stringify(r.sample.flat)}  ` +
                      `runtime ${JSON.stringify(r.sample.runtime)}  tool ${JSON.stringify(r.sample.tool)}`);
}
console.log(failed ? `\n${failed} case(s) disagree — the tool is previewing something the game won't draw.\n`
                   : `\nopaque pixels identical; translucent within the premultiplied-alpha bound.\n`);
if(errs.length) console.error('page errors:', errs);
await b.close();
server.close();
process.exitCode = failed ? 1 : 0;
