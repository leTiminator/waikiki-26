/**
 * DEEP — TideForge asset importer.
 *
 * Reads the JSON manifests + sheets that `tools/export-assets.mjs` produced and turns
 * them into things the scene can draw. Nothing here knows how the art was generated —
 * it only knows the published manifest shape, which is the point: this is the seam
 * between the tool and the game.
 *
 * Sheets ship at an integer export scale (5× for sprites, 4× for tilesheets). We slice
 * them back down to native 1× art-pixels on load — the export upscale is nearest-
 * neighbour, so this is lossless — and the scene then draws everything at one integer
 * zoom, which is what keeps the pixel grid consistent across modules.
 */
import { gradeImageData } from './depth-grade.js';

const loadImage = src => new Promise((res,rej)=>{
  const im = new Image();
  im.onload = () => res(im);
  im.onerror = () => rej(new Error('could not load '+src));
  im.src = src;
});

function canvasOf(w,h){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d',{willReadFrequently:true});
  x.imageSmoothingEnabled = false;
  return {c,x};
}

/**
 * A loaded asset: its manifest, a native-resolution atlas, and depth-graded copies of
 * that atlas cached per depth bucket.
 */
class Asset {
  constructor(manifest, atlas, frameW, frameH, cols, rows){
    this.manifest = manifest;
    this.id       = manifest.asset;
    this.module   = manifest.module;
    this.native   = atlas;             // {c,x} at 1× art pixels
    this.fw = frameW; this.fh = frameH;
    this.cols = cols; this.rows = rows;
    this.anchors = manifest.anchors || {};
    this.clips = manifest.clips || [];
    this._graded = new Map();          // depth bucket -> canvas
    this._order  = [];
  }
  clip(name){ return this.clips.find(c => c.name === name) || this.clips[0]; }
  frameCount(name){ const c = this.clip(name); return c ? c.frames : 1; }

  /**
   * The atlas graded for this depth, cached in 2 m depth buckets and 0.1 fog steps.
   * `fog` fades the layer toward the ambient water — distance, as opposed to depth.
   */
  graded(depth, fog){
    const b = Math.round(depth / 2) * 2;
    const f = Math.round((fog || 0) * 10) / 10;
    const key = b + '|' + f;
    let g = this._graded.get(key);
    if(!g){
      const {c,x} = canvasOf(this.native.c.width, this.native.c.height);
      const src = this.native.x.getImageData(0,0,c.width,c.height);
      const dst = x.createImageData(c.width, c.height);
      gradeImageData(src.data, dst.data, b, f);
      x.putImageData(dst,0,0);
      g = c;
      this._graded.set(key,g); this._order.push(key);
      while(this._order.length > 40) this._graded.delete(this._order.shift());
    }
    return g;
  }

  /**
   * Draw one frame. `cx,cy` is where the sprite's anchor lands, in screen pixels.
   * `anchor` names a manifest anchor ('base' plants flora on the seafloor); default
   * is the sprite's centre.
   */
  draw(ctx, depth, clipName, frame, cx, cy, zoom, {flip=false, anchor=null, alpha=1, fog=0}={}){
    const clip = this.clip(clipName);
    const row  = clip ? clip.row : 0;
    const F    = Math.max(1, this.frameCount(clipName));
    const col  = ((frame % F) + F) % F;
    const a = this.anchors[anchor];
    const ox = a ? a[0] : this.fw/2;
    const oy = a ? a[1] : this.fh/2;
    const w = this.fw*zoom, h = this.fh*zoom;
    ctx.save();
    if(alpha !== 1) ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(cx), Math.round(cy));
    if(flip) ctx.scale(-1,1);
    ctx.drawImage(this.graded(depth, fog),
      col*this.fw, row*this.fh, this.fw, this.fh,
      Math.round(-ox*zoom), Math.round(-oy*zoom), w, h);
    ctx.restore();
  }
}

/** A tileset asset, plus the autotiler its manifest describes. */
class Tileset extends Asset {
  constructor(manifest, atlas){
    const ts = manifest.tileSize;
    super(manifest, atlas, ts, ts, manifest.sheet.cols, manifest.sheet.rows);
    this.tileSize   = ts;
    this.bits       = manifest.bits;
    this.maskToTile = manifest.maskToTile;
    this.tiles      = manifest.tiles;
    // each sheet row is an interchangeable fill variant for the same 47 keys
    this.variants   = manifest.variants || 1;
  }
  /**
   * Pick the tile for cell (x,y) of a solidity grid, straight off the manifest's map.
   * `solidOutside` decides what lies beyond the grid — a seabed wants solid sides and
   * bottom (so the terrain doesn't grow a rim at the world edge) and open sky above.
   */
  tileFor(solid, x, y, w, h){
    const at = (px,py) => (py < 0) ? false
                        : (px < 0 || px >= w || py >= h) ? true
                        : !!solid[py][px];
    const b = this.bits;
    let m = 0;
    if(at(x,y-1))   m |= b.n;
    if(at(x+1,y-1)) m |= b.ne;
    if(at(x+1,y))   m |= b.e;
    if(at(x+1,y+1)) m |= b.se;
    if(at(x,y+1))   m |= b.s;
    if(at(x-1,y+1)) m |= b.sw;
    if(at(x-1,y))   m |= b.w;
    if(at(x-1,y-1)) m |= b.nw;
    return this.maskToTile[m];
  }
  drawTile(ctx, depth, index, dx, dy, zoom, fog, variant){
    const t = this.tiles[index];
    const s = this.tileSize;
    const row = this.variants > 1 ? (((variant | 0) % this.variants) + this.variants) % this.variants : 0;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.graded(depth, fog), t.col*s, row*s, s, s,
      Math.round(dx), Math.round(dy), s*zoom, s*zoom);
  }
}

/** Load one asset by base name from `dir`. */
export async function loadAsset(dir, name){
  const manifest = await (await fetch(`${dir}/${name}.json`)).json();
  const image    = await loadImage(`${dir}/${manifest.sheetFile}`);
  const scale    = manifest.sheet.scale;

  // slice the export back down to native art pixels
  const isTiles = manifest.module === 'tiles';
  const fw = isTiles ? manifest.tileSize : manifest.frameSize.w;
  const fh = isTiles ? manifest.tileSize : manifest.frameSize.h;
  const cols = manifest.sheet.cols, rows = manifest.sheet.rows;
  const {c,x} = canvasOf(cols*fw, rows*fh);
  x.drawImage(image, 0, 0, cols*fw*scale, rows*fh*scale, 0, 0, cols*fw, rows*fh);

  return isTiles ? new Tileset(manifest, {c,x})
                 : new Asset(manifest, {c,x}, fw, fh, cols, rows);
}

export async function loadAll(dir, names){
  const out = {};
  await Promise.all(names.map(async n => { out[n] = await loadAsset(dir, n); }));
  return out;
}
