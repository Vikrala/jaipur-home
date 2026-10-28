/* R-008 realism pass (draft): procedural PBR textures, window-lit environments and edge helpers.
   Visual only. Nothing here changes a dimension, position, collider or fixture record.
   Every texture is generated in the browser so the walkthrough stays a single offline HTML file. */
(function(){
'use strict';
const T=window.THREE;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const hash=(x,y,s)=>{let n=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,1442695041);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;};
const mod=(a,n)=>((a%n)+n)%n;
/* Tileable value noise: period (px,py) in lattice cells. */
function vnoise(x,y,px,py,s){
 const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(mod(x0,px),mod(y0,py),s),b=hash(mod(x0+1,px),mod(y0,py),s),c=hash(mod(x0,px),mod(y0+1,py),s),d=hash(mod(x0+1,px),mod(y0+1,py),s);
 return lerp(lerp(a,b,u),lerp(c,d,u),v);
}
/* fbm in unit space: u,v in [0,1) tile seamlessly for integer base periods. */
function fbm(u,v,px,py,oct,s){let a=.5,sum=0,n=0;for(let o=0;o<oct;o++){const f=1<<o;sum+=a*vnoise(u*px*f,v*py*f,px*f,py*f,s+o*17);n+=a;a*=.5;}return sum/n;}

function field(size,fn){const f=new Float32Array(size*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++)f[y*size+x]=fn(x/size,y/size,x,y);return f;}
function toCanvas(size,pix){ // pix(x,y,i,out) fills out[0..2] with 0..255
 const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),img=g.createImageData(size,size),d=img.data,o=[0,0,0];
 for(let y=0,i=0;y<size;y++)for(let x=0;x<size;x++,i++){pix(x,y,i,o);d[i*4]=o[0];d[i*4+1]=o[1];d[i*4+2]=o[2];d[i*4+3]=255;}
 g.putImageData(img,0,0);return c;
}
function normalFromHeight(h,size,strength){
 return toCanvas(size,(x,y,i,o)=>{
  const xm=mod(x-1,size),xp=mod(x+1,size),ym=mod(y-1,size),yp=mod(y+1,size);
  const dx=(h[y*size+xp]-h[y*size+xm])*strength,dy=(h[yp*size+x]-h[ym*size+x])*strength;
  const l=Math.hypot(dx,dy,1);o[0]=(-dx/l*.5+.5)*255;o[1]=(dy/l*.5+.5)*255;o[2]=(1/l*.5+.5)*255;
 });
}
function grey(size,f){return toCanvas(size,(x,y,i,o)=>{const v=clamp(f[i])*255;o[0]=o[1]=o[2]=v;});}
function tex(canvas,srgb,sizeFt,aniso,rot){
 const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;
 t.anisotropy=aniso;t.repeat.set(1/sizeFt,1/sizeFt);t.userData={sizeFt};t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;
 if(rot){t.center.set(.5,.5);t.rotation=Math.PI/2;}
 return t;
}
const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const hex=(h)=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

/* ---------- individual surface recipes ---------- */
/* Vitrified tile / stone slab. tiles = tiles per side (2 gives a 2x2 sheet of 600 mm tiles in a 4 ft sample);
   tilesX/tilesY override it for rectangular tiles (1 x 2 in a 4 ft sample = 4 ft x 2 ft tiles, long side along u). */
function tileSet(opt){
 const S=opt.size,tiles=opt.tiles,tpx=S/(opt.tilesX||tiles),tpy=S/(opt.tilesY||tiles),base=hex(opt.base),vein=hex(opt.vein),grout=hex(opt.grout),gw=opt.groutPx;
 const hgt=new Float32Array(S*S),rough=new Float32Array(S*S);
 const alb=toCanvas(S,(x,y,i,o)=>{
  const tx=Math.floor(x/tpx),ty=Math.floor(y/tpy),lx=(x-tx*tpx)/tpx,ly=(y-ty*tpy)/tpy;
  const tone=(hash(tx,ty,11)-.5)*opt.toneVar,sx=tx*13.7,sy=ty*7.3;
  // veining: ridged, domain-warped noise, evaluated per tile so each tile looks cut from a different part of the slab
  const wx=fbm(lx,ly,3,3,3,50+tx*5+ty*9)*opt.warp,wy=fbm(lx,ly,3,3,3,80+tx*3+ty*7)*opt.warp;
  const r=fbm(lx+wx*.25,ly+wy*.25,2,2,5,100+tx*29+ty*31+sx+sy),ridge=Math.pow(1-Math.abs(2*r-1),opt.veinPow);
  const mott=fbm(lx,ly,4,4,4,200+tx*3+ty*5)-.5,grain=(hash(x,y,3)-.5);
  let c=mix3(base,vein,clamp(ridge*opt.veinAmt));
  const k=1+tone+mott*opt.mottle+grain*opt.grain;c=[c[0]*k,c[1]*k,c[2]*k];
  // Grout joint: R-015 sets every floor joint to 1 mm. The joint is narrower than a texel (about 1.2 mm), so each
  // edge texel takes the share of its width the joint actually covers, plus a hair-line arris on that texel only.
  const ex=Math.min(x-tx*tpx,(tx+1)*tpx-1-x),ey=Math.min(y-ty*tpy,(ty+1)*tpy-1-y),d=Math.min(ex,ey);
  const g=opt.tiles>0&&gw>0?clamp(gw-d):0;
  c=mix3(c,[grout[0]*(1+(hash(x,y,9)-.5)*.1),grout[1]*(1+(hash(x,y,9)-.5)*.1),grout[2]*(1+(hash(x,y,9)-.5)*.1)],g);
  hgt[i]=-g*1.0+(d<1&&opt.tiles>0?-.06:0)+grain*.02+ridge*.01;
  rough[i]=lerp(opt.rough+(ridge-.5)*.06+mott*.1,.93,g);
  o[0]=c[0];o[1]=c[1];o[2]=c[2];
 });
 return {albedo:alb,normal:normalFromHeight(hgt,S,opt.bump),rough:grey(S,rough)};
}
/* Wood veneer / laminate with cathedral figure, long pores and a satin finish. Grain runs along canvas x. */
function veneer(S,opt){
 const dark=hex(opt.dark),light=hex(opt.light);const hgt=new Float32Array(S*S),rough=new Float32Array(S*S);
 const alb=toCanvas(S,(x,y,i,o)=>{
  const u=x/S,v=y/S;
  const warp=fbm(u,v,2,3,4,31)*2-1,warp2=fbm(u,v,3,6,3,77)*2-1;
  const ringCoord=v*opt.rings+warp*opt.warpAmt+warp2*opt.warpAmt*.35;
  const ring=.5+.5*Math.sin(ringCoord*Math.PI*2),band=sstep(.15,.95,ring);
  const streak=fbm(u,v,4,96,3,5);                        // long thin fibres
  const fine=vnoise(u*24,v*420,24,420,9);                // medullary pores, very elongated along the grain
  const pore=sstep(.80,.97,fine)*.55;
  const tone=fbm(u,v,2,2,3,401)-.5;                      // sheet-wide tonal drift
  let t=.34+.36*band+.55*(streak-.5)+tone*.35-pore*.7;t=clamp(t);
  const c=mix3(dark,light,t),k=1-.05*pore;
  hgt[i]=-pore*.9+(streak-.5)*.12;
  rough[i]=opt.rough+(1-t)*.06+pore*.16;
  o[0]=c[0]*k;o[1]=c[1]*k;o[2]=c[2]*k;
 });
 return {albedo:alb,normal:normalFromHeight(hgt,S,opt.bump),rough:grey(S,rough)};
}
/* Painted plaster: roller stipple + trowel mottling, almost white so the material colour carries the paint. */
function plaster(S){
 const hgt=new Float32Array(S*S),rough=new Float32Array(S*S);
 const alb=toCanvas(S,(x,y,i,o)=>{
  const u=x/S,v=y/S;
  const low=fbm(u,v,3,3,4,61)-.5,mid=fbm(u,v,24,24,3,71)-.5,hi=hash(x,y,5)-.5;
  const k=.975+low*.05+mid*.025+hi*.012;
  hgt[i]=mid*.55+hi*.35+low*.5;rough[i]=.90+mid*.07+hi*.03;
  o[0]=o[1]=o[2]=clamp(k)*255;
 });
 return {albedo:alb,normal:normalFromHeight(hgt,S,1.5),rough:grey(S,rough)};
}
/* Suede-finish laminate: almost flat, a fine tooth that only shows in raking light. */
function suede(S){
 const hgt=new Float32Array(S*S),rough=new Float32Array(S*S);
 const alb=toCanvas(S,(x,y,i,o)=>{
  const u=x/S,v=y/S,low=fbm(u,v,2,2,3,91)-.5,hi=hash(x,y,19)-.5,mid=fbm(u,v,48,48,2,93)-.5;
  hgt[i]=hi*.5+mid*.4;rough[i]=.70+mid*.06+hi*.04;const k=.985+low*.025+hi*.010;o[0]=o[1]=o[2]=clamp(k)*255;
 });
 return {albedo:alb,normal:normalFromHeight(hgt,S,.45),rough:grey(S,rough)};
}
/* Woven textile: over/under threads, slubs and per-thread tone. threads = thread count across the sample. */
function weave(S,threads,slub,tone){
 const hgt=new Float32Array(S*S),rough=new Float32Array(S*S),tp=S/threads;
 const alb=toCanvas(S,(x,y,i,o)=>{
  const cx=Math.floor(x/tp),cy=Math.floor(y/tp),fx=(x/tp)-cx,fy=(y/tp)-cy,warpOver=((cx+cy)&1)===0;
  const thread=warpOver?Math.sin(Math.PI*fx):Math.sin(Math.PI*fy);               // round thread profile
  const tcol=warpOver?cx:cy,sl=vnoise(warpOver?y/S*threads*.18:x/S*threads*.18,(warpOver?cx:cy)*3.1,Math.max(1,Math.round(threads*.18)),Math.max(1,threads),37);
  const thick=1+(sl-.5)*slub,t=(hash(tcol,warpOver?1:2,41)-.5)*tone,fz=(hash(x,y,43)-.5);
  const shade=.975+.025*thread;hgt[i]=thread*thick*.8+fz*.03;rough[i]=.94-.06*thread;
  const k=clamp((shade+(t*.6)+fz*.025+(sl-.5)*slub*.12)*1.04);o[0]=o[1]=o[2]=k*255;
 });
 return {albedo:alb,normal:normalFromHeight(hgt,S,1.7),rough:grey(S,rough)};
}
/* Low cut-pile rug: thousands of short fibres leaning one way. */
function pile(S){
 const hgt=new Float32Array(S*S),rough=new Float32Array(S*S);
 const alb=toCanvas(S,(x,y,i,o)=>{
  const f=vnoise(x/S*180,y/S*64,180,64,81),g=hash(x,y,83)-.5,low=fbm(x/S,y/S,3,3,3,85)-.5;
  hgt[i]=f*.7+g*.4;rough[i]=.97;const k=.9+f*.1+g*.08+low*.08;o[0]=o[1]=o[2]=clamp(k)*255;
 });
 return {albedo:alb,normal:normalFromHeight(hgt,S,2.6),rough:grey(S,rough)};
}
/* Polished granite: speckle of crystals; flecks catch light, base is honed. */
function granite(S){
 const hgt=new Float32Array(S*S),rough=new Float32Array(S*S);
 const alb=toCanvas(S,(x,y,i,o)=>{
  const u=x/S,v=y/S,big=fbm(u,v,10,10,3,111),fl=hash(x>>1,y>>1,113),sm=hash(x,y,115),cl=fbm(u,v,40,40,2,117);
  let b=32+big*22+(cl-.5)*30;const fleck=sstep(.955,.99,fl)*(40+sm*60),dark=sstep(.35,.1,cl)*-18;
  b=b+fleck+dark+(sm-.5)*10;rough[i]=.26+(1-sstep(.955,.99,fl))*.1;hgt[i]=(sm-.5)*.2+(fl>.9?.1:0);
  const tint=hex('#474744');o[0]=b*(tint[0]/70);o[1]=b*(tint[1]/70);o[2]=b*(tint[2]/70)*.98;
 });
 return {albedo:alb,normal:normalFromHeight(hgt,S,.9),rough:grey(S,rough)};
}

/* ---------- public builders ---------- */
function buildProcedural(renderer,quality){
 const A=Math.min(8,renderer.capabilities.getMaxAnisotropy()),hi=quality!=='low',S=hi?1024:512,sets={};
 function reg(name,rec,sizeFt,rot){
  sets[name]={map:tex(rec.albedo,true,sizeFt,A,rot),normalMap:tex(rec.normal,false,sizeFt,A,rot),roughnessMap:tex(rec.rough,false,sizeFt,A,rot),sizeFt};
 }
 reg('tile',tileSet({size:S,tiles:2,tilesX:1,tilesY:2,base:'#d9cdbd',vein:'#bdae98',grout:'#a69d8d',groutPx:S/1219.2*.5,toneVar:.07,warp:2.2,veinPow:8,veinAmt:.38,mottle:.09,grain:.04,rough:.24,bump:2.6}),4);
 reg('bathTile',tileSet({size:S,tiles:2,base:'#d3c7b6',vein:'#b9ac9a',grout:'#9a9384',groutPx:S/1219.2*.5,toneVar:.09,warp:1.2,veinPow:3,veinAmt:.25,mottle:.22,grain:.14,rough:.72,bump:3.2}),4);
 reg('stone',tileSet({size:S,tiles:0,base:'#d7cbbb',vein:'#a99a86',grout:'#000000',groutPx:0,toneVar:0,warp:3,veinPow:5,veinAmt:.7,mottle:.12,grain:.03,rough:.30,bump:.8}),4);
 reg('walnut',veneer(S,{dark:'#573523',light:'#a77a52',rings:5,warpAmt:.38,rough:.50,bump:1.3}),4,false);
 reg('plaster',plaster(512),3);
 reg('suede',suede(512),3);
 reg('linen',weave(512,56,.45,.025),.95);
 reg('cotton',weave(512,72,.25,.015),.55);
 reg('pile',pile(512),2);
 reg('granite',granite(512),2);
 return sets;
}

/* Window-lit environment for reflections and ambient fill. day=true gives a bright sky behind the window panels. */
function environment(renderer,day){
 const s=new T.Scene();
 const dome=document.createElement('canvas');dome.width=16;dome.height=256;const g=dome.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
 if(day){gr.addColorStop(0,'#cfe0ee');gr.addColorStop(.45,'#e8e4da');gr.addColorStop(.55,'#d9d2c2');gr.addColorStop(1,'#c9bfae');}
 else{gr.addColorStop(0,'#20324a');gr.addColorStop(.48,'#37394a');gr.addColorStop(.52,'#6a5640');gr.addColorStop(1,'#4a3b2b');}
 g.fillStyle=gr;g.fillRect(0,0,16,256);const dt=new T.CanvasTexture(dome);dt.colorSpace=T.SRGBColorSpace;
 s.add(new T.Mesh(new T.SphereGeometry(100,32,16),new T.MeshBasicMaterial({map:dt,side:T.BackSide})));
 const win=new T.MeshBasicMaterial({color:day?new T.Color(6,5.6,5):new T.Color(.5,.62,.9),side:T.DoubleSide});
 const lamp=new T.MeshBasicMaterial({color:new T.Color(day?1.4:4.2,day?1.25:3.0,day?1.0:1.7),side:T.DoubleSide});
 for(const [x,y,z,w,h] of [[-30,10,-6,22,20],[30,11,10,18,20],[0,12,-34,26,18]]){const m=new T.Mesh(new T.PlaneGeometry(w,h),win);m.position.set(x,y,z);m.lookAt(0,4,0);s.add(m);}
 for(const [x,z] of [[-8,-8],[8,6],[-4,12]]){const m=new T.Mesh(new T.PlaneGeometry(6,6),lamp);m.position.set(x,28,z);m.lookAt(x,0,z);s.add(m);}
 const floor=new T.Mesh(new T.CircleGeometry(60,24),new T.MeshBasicMaterial({color:day?'#d2c9b9':'#4a3e31'}));floor.rotation.x=-Math.PI/2;floor.position.y=-2;s.add(floor);
 const pm=new T.PMREMGenerator(renderer);const tex2=pm.fromScene(s,.03,.1,200).texture;pm.dispose();return tex2;
}
/* Baked textures decode in milliseconds; procedural generation takes seconds, so it is only the fallback. */
function loadBaked(renderer){
 const A=Math.min(8,renderer.capabilities.getMaxAnisotropy()),sets={},waits=[];
 for(const [name,d] of Object.entries(window.JAIPUR_TEXDATA)){
  const rec={sizeFt:d.sizeFt};
  for(const [key,srgb] of [['map',true],['normalMap',false],['roughnessMap',false]]){
   const img=new Image();const t=new T.Texture(img);
   // R-014: wait on onload, not img.decode(); decode() never settles in some browsers, which left textures blank.
   const loaded=new Promise(res=>{img.onload=()=>{t.needsUpdate=true;res();};img.onerror=()=>res();});img.src=d[key];
   t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=A;t.repeat.set(1/d.sizeFt,1/d.sizeFt);
   t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.userData={sizeFt:d.sizeFt,mimeType:'image/jpeg'};
   
   waits.push(loaded);rec[key]=t;
  }
  sets[name]=rec;
 }
 return {sets,ready:Promise.all(waits)};
}
function build(renderer,quality){
 if(window.JAIPUR_TEXDATA)return loadBaked(renderer);
 return {sets:buildProcedural(renderer,quality),ready:Promise.resolve()};
}
window.JAIPUR_REALISM={build,buildProcedural,environment,hash,vnoise,fbm};
})();
