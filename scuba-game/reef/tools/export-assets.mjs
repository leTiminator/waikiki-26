#!/usr/bin/env node
/**
 * DEEP — reef asset pipeline
 *
 * Drives TideForge (../../tide-forge/index.html) headlessly and exports the reef's
 * art as real files: spritesheets, tilesheets and their JSON manifests.
 *
 * Everything is exported at **depth 0 / corruption 0**, i.e. ungraded raw palette
 * colours. The runtime applies the depth grade itself (reef/depth-grade.js) using the
 * same math, so one sheet serves every depth instead of baking a depth per asset.
 *
 *   npm i -D playwright   # or use a global install
 *   node reef/tools/export-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const OUT=path.resolve(HERE,'../assets');
const FORGE='file://'+path.resolve(HERE,'../../../tide-forge/index.html');

const chromium=await (async()=>{
  for(const m of ['playwright','/opt/node22/lib/node_modules/playwright/index.mjs']){
    try{return (await import(m)).chromium;}catch(e){}
  }
  throw new Error('Playwright not found — run `npm i -D playwright`.');
})();

// palette ramp indices, in TideForge's master order
const PAL={coral:0,tang:1,sunfish:2,kelp:3,violet:4,silver:5,crimson:6,lime:7,sand:8,basalt:9};

// what the reef is built from
const ASSETS=[
  {file:'tile_rock',  module:'tiles',   pal:PAL.basalt, chips:{Material:'rock',  'Edge style':'hard'},   ranges:{Grain:0.3,Contrast:0.45}},
  {file:'tile_sand',  module:'tiles',   pal:PAL.sand,   chips:{Material:'sand',  'Edge style':'rounded'},ranges:{Grain:0.8,Contrast:0.22}},
  {file:'flora_kelp',    module:'flora',pal:PAL.kelp,   chips:{Archetype:'kelp'},    ranges:{Strands:4,Iterations:4,Height:1.15}},
  {file:'flora_staghorn',module:'flora',pal:PAL.coral,  chips:{Archetype:'staghorn'},ranges:{Strands:2,Iterations:4,Height:0.9}},
  {file:'flora_fan',     module:'flora',pal:PAL.violet, chips:{Archetype:'fan'},     ranges:{Strands:1,Iterations:4,Height:0.85}},
  {file:'flora_grass',   module:'flora',pal:PAL.lime,   chips:{Archetype:'grass'},   ranges:{Strands:6,Iterations:4,Height:0.7}},
  // sized in the tool, not in the scene: a smaller Length simply uses less of the
  // 72x42 frame, so the sprite is physically smaller in world units
  {file:'fish_reef',    module:'creature',pal:PAL.tang,   chips:{Archetype:'reef',    Pattern:'v-stripes'},ranges:{Length:0.78,'Body depth':0.95}},
  {file:'fish_angel',   module:'creature',pal:PAL.sunfish,chips:{Archetype:'angel',   Pattern:'h-stripes'},ranges:{Length:0.72,'Body depth':1.15}},
  {file:'fish_predator',module:'creature',pal:PAL.silver, chips:{Archetype:'predator',Pattern:'none'},     ranges:{Length:1.25,'Body depth':0.9}},
  // salvage: the reason you're down here at all (GDD §4)
  {file:'prop_crate',  module:'props',pal:PAL.sand,   chips:{Kind:'crate'}, ranges:{Width:0.8,Height:0.75,Corrosion:0.45,Encrustation:0.4}},
  {file:'prop_drum',   module:'props',pal:PAL.crimson,chips:{Kind:'drum'},  ranges:{Width:0.7,Height:0.9,Corrosion:0.6,Encrustation:0.5}},
  {file:'prop_hull',   module:'props',pal:PAL.silver, chips:{Kind:'hull'},  ranges:{Width:1.2,Height:1.0,Corrosion:0.55,Encrustation:0.6}},
  {file:'prop_debris', module:'props',pal:PAL.basalt, chips:{Kind:'debris'},ranges:{Width:1.0,Height:0.8,Corrosion:0.5,Encrustation:0.55}},
  {file:'vfx_bubbles',module:'vfx',pal:PAL.silver,chips:{Effect:'bubbles'},ranges:{Count:14,'Particle size':1.6,Spread:0.4}},
  {file:'vfx_godray', module:'vfx',pal:PAL.silver,chips:{Effect:'godray'}, ranges:{Count:18,'Particle size':2.4,Lifetime:0.8}},
  {file:'vfx_silt',   module:'vfx',pal:PAL.sand,  chips:{Effect:'silt'},   ranges:{Count:30,'Particle size':2.0,Spread:0.7}}
];

const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1400,height:1000}});
const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
// capture downloads instead of writing them through the browser
await pg.addInitScript(()=>{window.__dl=[];const oc=document.createElement.bind(document);
  document.createElement=(t,...r)=>{const e=oc(t,...r);
    if(String(t).toLowerCase()==='a')e.click=()=>window.__dl.push({name:e.download,href:e.href});return e;};});
await pg.goto(FORGE);
await pg.waitForTimeout(700);

const settle=()=>pg.waitForTimeout(320);
async function chip(label,value){
  await pg.evaluate(({label,value})=>{
    for(const f of document.querySelectorAll('#rail .field')){
      const l=f.querySelector('.lab span');
      if(!l||l.textContent.trim()!==label)continue;
      for(const btn of f.querySelectorAll('.chips button'))
        if(btn.textContent.trim()===value){btn.click();return;}
      throw new Error(`no option "${value}" under "${label}"`);
    }
    throw new Error(`no control labelled "${label}"`);
  },{label,value});
  await settle();
}
async function range(label,value){
  await pg.evaluate(({label,value})=>{
    for(const f of document.querySelectorAll('#rail .field')){
      const l=f.querySelector('.lab span');
      if(!l||!l.textContent.trim().startsWith(label))continue;
      const inp=f.querySelector('input[type=range]');if(!inp)continue;
      inp.value=value;inp.dispatchEvent(new Event('input',{bubbles:true}));return;
    }
    throw new Error(`no slider labelled "${label}"`);
  },{label,value});
  await settle();
}
const swatch=i=>pg.evaluate(i=>document.querySelectorAll('#rail .swatches button')[i].click(),i).then(settle);

fs.mkdirSync(OUT,{recursive:true});
let n=0;
for(const a of ASSETS){
  await pg.evaluate(()=>{window.__dl=[];});
  await pg.click(`#modules button[data-id="${a.module}"]`);
  await pg.waitForTimeout(450);
  for(const [k,v] of Object.entries(a.chips||{}))await chip(k,v);
  for(const [k,v] of Object.entries(a.ranges||{}))await range(k,v);
  await swatch(a.pal);
  await range('Depth',0);          // export ungraded — the runtime grades
  await range('Corruption',0);
  await pg.waitForTimeout(450);

  await pg.click('#bSheet');await pg.waitForTimeout(700);
  await pg.click('#bJson'); await pg.waitForTimeout(450);
  const dl=await pg.evaluate(()=>window.__dl.map(d=>({name:d.name,href:d.href})));
  if(dl.length!==2)throw new Error(`${a.file}: expected 2 downloads, got ${dl.length}`);
  const png=dl.find(d=>d.name.endsWith('.png')),json=dl.find(d=>d.name.endsWith('.json'));
  fs.writeFileSync(path.join(OUT,a.file+'.png'),Buffer.from(png.href.split(',')[1],'base64'));
  const manifest=JSON.parse(decodeURIComponent(json.href.split(',')[1]));
  manifest.asset=a.file;manifest.sheetFile=a.file+'.png';
  fs.writeFileSync(path.join(OUT,a.file+'.json'),JSON.stringify(manifest,null,2));
  const kb=(fs.statSync(path.join(OUT,a.file+'.png')).size/1024).toFixed(1);
  console.log(`  ${a.file.padEnd(16)} ${String(a.module).padEnd(9)} ${kb.padStart(7)} KB  ${png.name}`);
  n++;
}
console.log(`\n${n} assets -> ${path.relative(process.cwd(),OUT)}`);
if(errs.length){console.error('page errors:',errs);process.exitCode=1;}
await b.close();
