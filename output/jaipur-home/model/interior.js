(function(){
'use strict';
const root=document.getElementById('jaipur-home'), canvas=root.querySelector('canvas.scene');
const P=window.JAIPUR_PLAN,T=window.THREE,H=10,ft=.3048;
const scene=new T.Scene(); scene.background=new T.Color('#e4e5e1');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
// R-017: the house is static, so shadow maps are redrawn only when lights, doors or fittings change (render()), not on camera-only frames (draw()).
renderer.shadowMap.autoUpdate=false;
renderer.outputColorSpace=T.SRGBColorSpace; renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=.98; renderer.localClippingEnabled=true;
const camera=new T.PerspectiveCamera(62,1,.08,300);
const building=new T.Group(); building.name='First floor — geometry units feet'; scene.add(building);
const ceilings=new T.Group(); ceilings.name='10 ft ceilings'; building.add(ceilings);
const doorLeaves=new T.Group(); doorLeaves.name='Interior doors'; building.add(doorLeaves);
const fixtures=[], furniture=[], colliders=[], doorPivots=[], roomLights=[], emissives=[], kitchenStorage=[], kitchenFronts=[], kitchenDoorPivots=[],poojaDoorPivots=[];
let realismOn=true,storageOpen=false,poojaOpen=false,diyaTrayOpen=false,poojaTrayGroup=null;
const mats={},geoCache=new Map();
let mode='overview',selected='overview',night=false,labels=true,yaw=0,pitch=0,orbitTheta=.64,
    orbitPhi=.60,orbitRadius=70,orbitTarget=new T.Vector3(13.5,0,27),drag=null,
    lastTime=0,tourTimer=null,keys=new Set(),stairWalk=false,
    tYaw=0,tPitch=0,tTheta=.64,tPhi=.60,tRadius=70,vx=0,vz=0,dirty=false;
const px=(p)=>(p-192.36)/16,pz=(p)=>(p-74.88)/16;
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
// R-008: procedural PBR sets (albedo + normal + roughness) in world feet. Sizes are the real-world patch each texture covers.
const RZ=window.JAIPUR_REALISM,FX=window.JAIPUR_FX,RZB=RZ.build(renderer,'high'),TX=RZB.sets;
function pbr(set,ns=1){return {map:set.map,normalMap:set.normalMap,normalScale:new T.Vector2(ns,ns),roughnessMap:set.roughnessMap};}
function uvScale(g,su,sv){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv);uv.needsUpdate=true;return g;}
// R-012: master-bath octagon floor keeps its own canvas texture (R-008 replaced the other canvas textures with PBR sets).
function masterBathFloorTexture(){
 const c=document.createElement('canvas');c.width=c.height=512;const a=c.getContext('2d');
 a.fillStyle='#d6d5cf';a.fillRect(0,0,512,512);
 for(let cy=0;cy<4;cy++)for(let cx=0;cx<4;cx++){
  const x=cx*128,y=cy*128,k=15;
  const e=.42,f=128-e; // R-015: 1 mm joints (512 px = 2 ft, so a 0.5 mm half-joint is 0.42 px)
  a.fillStyle='#f4f1e9';a.beginPath();a.moveTo(x+k,y+e);a.lineTo(x+128-k,y+e);a.lineTo(x+f,y+k);a.lineTo(x+f,y+128-k);a.lineTo(x+128-k,y+f);a.lineTo(x+k,y+f);a.lineTo(x+e,y+128-k);a.lineTo(x+e,y+k);a.closePath();a.fill();
  a.fillStyle='#343633';a.beginPath();a.moveTo(x,y-13);a.lineTo(x+13,y);a.lineTo(x,y+13);a.lineTo(x-13,y);a.closePath();a.fill();
 }
 const tx=new T.CanvasTexture(c);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=renderer.capabilities.getMaxAnisotropy();return tx;
}
const texMasterBathFloor=masterBathFloorTexture();texMasterBathFloor.repeat.set(.5,.5); // R-008 floor UVs are in feet: keep about 150 mm octagons
function mat(name,color,roughness=.7,metalness=0,extra={}){const {physical,bevel,grain,...rest}=extra;const M=physical?T.MeshPhysicalMaterial:T.MeshStandardMaterial;const m=new M({color,roughness,metalness,...rest});m.name=name;m.userData.bevel=!!bevel;m.userData.grain=!!grain;mats[name]=m;return m;}
const ivory=mat('Washable warm chalk paint','#f1e9dc',1,0,pbr(TX.plaster,.8)),white=mat('White ceramic','#f1f0e9',.14,0,{physical:true,clearcoat:.6,clearcoatRoughness:.06}),
 oak=mat('Walnut laminate','#f7ead8',1,0,{...pbr(TX.walnut,1),physical:true,clearcoat:.22,clearcoatRoughness:.38,bevel:true,grain:true}),
 greige=mat('Matte sand laminate','#dfd1bc',1,0,{...pbr(TX.suede,.5),bevel:true}),sage=mat('Muted terracotta laminate','#b88872',1,0,{...pbr(TX.suede,.5),bevel:true}),
 taupe=mat('Dusty blue laminate','#8496a1',1,0,{...pbr(TX.suede,.5),bevel:true}),stone=mat('Matte vitrified floor tile','#ffffff',1,0,{...pbr(TX.tile,.9),physical:true,clearcoat:.42,clearcoatRoughness:.14}),
 bathStone=mat('Anti slip bathroom tile','#ffffff',1,0,pbr(TX.bathTile,1.1)),
 granite=mat('Sealed dark granite','#b5b4af',1,0,{...pbr(TX.granite,.6),physical:true,clearcoat:.3,clearcoatRoughness:.18}),
 linen=mat('Wipeable sand upholstery','#e9dcc7',1,0,{...pbr(TX.linen,1.5),physical:true,sheen:.55,sheenRoughness:.6,sheenColor:new T.Color('#d9ccb6')}),
 bedding=mat('Cotton bedding','#fbf8ef',1,0,{...pbr(TX.cotton,1),physical:true,sheen:.8,sheenRoughness:.6,sheenColor:new T.Color('#ffffff')}),
 blanket=mat('Terracotta cotton throw','#b6795d',1,0,{...pbr(TX.linen,1.3),physical:true,sheen:1,sheenRoughness:.5,sheenColor:new T.Color('#d9a58c')}),
 metal=mat('Brushed stainless steel','#bac0bd',.32,1,{physical:true,anisotropy:.55}),
 brass=mat('Brushed brass','#b08a46',.30,.82),
 flutedGlass=mat('Fluted toughened glass','#d9e2df',.18,.05,{transparent:true,opacity:.48,depthWrite:false}),
 tvStone=mat('Warm ivory TV stone','#ffffff',1,0,{...pbr(TX.stone,.8),physical:true,clearcoat:.35,clearcoatRoughness:.25,bevel:true}),
 charcoal=mat('Charcoal powder coat','#383b38',.66,.25),
 black=mat('Black appliance glass','#151c1d',.22,.35),
 glass=mat('Clear shower glass','#e4ecea',.10,0,{transparent:true,opacity:.20,depthWrite:false}),
 mirror=mat('Mirror silver','#bfcacc',.05,1),
 windowGlass=mat('Window glazing','#dce5e1',.2,.15,{transparent:true,opacity:.18,depthWrite:false}),
 soil=mat('Plant soil','#3d362a',1),leaf=mat('Muted foliage','#68744d',.99),
 trim=mat('Ivory skirting and trim','#d8d1c4',1,0,pbr(TX.plaster,.6)),warmLight=mat('Warm diffused light','#ffedd3',.4,0,{emissive:'#ffe1af',emissiveIntensity:1.6}),
 screenMat=mat('TV dark screen','#1d2828',.19,.28),porcelain=mat('Terracotta pottery','#b27659',.88),
 rugMat=mat('Living low-pile warm greige rug','#cbbdaa',1,0,{...pbr(TX.pile,1.4),physical:true,sheen:.3,sheenRoughness:.8,sheenColor:new T.Color('#cdbfa8')}),
 masterBathFloor=mat('Master bath matte octagon and black-dot anti-slip floor','#ffffff',.88,0,{map:texMasterBathFloor}),
 masterBathLimestone=mat('Master bath warm pale stone wall tile','#e2ddd1',.74),
 masterBathSage=mat('Master bath moisture-resistant sage cabinet','#737c66',.7),
 masterBathGreenA=mat('Master bath glazed forest-green vertical tile A','#425748',.31),
 masterBathGreenB=mat('Master bath glazed forest-green vertical tile B','#354d3e',.3),
 masterBathGreenC=mat('Master bath glazed forest-green vertical tile C','#536650',.34),
 masterBathMarble=mat('Master washer sealed light marble slab','#ece8df',.34),
 masterBathSupport=mat('Master washer tile-faced structural support concept','#e4e0d8',.85),
 masterBathBasket=mat('Master laundry basket woven seagrass-look polypropylene','#b49a72',.92);
const hemi=new T.HemisphereLight('#e5edf1','#c1ac8f',.85);scene.add(hemi);
const sun=new T.DirectionalLight('#fff0d8',2.6);sun.position.set(-16,36,-16);sun.target.position.set(13,0,27);scene.add(sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.camera.left=-42;sun.shadow.camera.right=42;sun.shadow.camera.top=42;sun.shadow.camera.bottom=-42;sun.shadow.camera.near=1;sun.shadow.camera.far=110;sun.shadow.bias=-.0003;sun.shadow.normalBias=.035;sun.shadow.radius=4;
// R-008: day and evening environments with bright window panels and a warm floor bounce. They feed reflections and ambient fill.
const envDay=RZ.environment(renderer,true),envNight=RZ.environment(renderer,false);scene.environment=envDay;
const envSeen=new Set();
function applyEnv(){scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{if(!m||!m.isMeshStandardMaterial)return;
 if(!envSeen.has(m)){envSeen.add(m);m.envMap=night?envNight:envDay;m.needsUpdate=true;}else m.envMap=night?envNight:envDay;
 m.envMapIntensity=m===windowGlass?(night?1.8:.9):night?.75:(m.userData.envDay??.42);});});}
function mesh(g,m,parent=building,name=''){const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;o.name=name||m.name;parent.add(o);return o;}
// R-008: textured boxes get world-feet UVs offset by position (adjacent walls line up, repeated doors differ);
// joinery materials get a 2-3 mm arris so edges catch light. Bounding boxes are unchanged.
function planarUV(g,ox,oy,oz,grain,w,h,d){const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let hz,vt,eh,ev;
 if(ax>=ay&&ax>=az){hz=p.getZ(i)+oz;vt=p.getY(i)+oy;eh=d;ev=h;}else if(ay>=az){hz=p.getX(i)+ox;vt=p.getZ(i)+oz;eh=w;ev=d;}else{hz=p.getX(i)+ox;vt=p.getY(i)+oy;eh=w;ev=h;}
 if(grain&&ev>eh)uv.setXY(i,vt,hz);else uv.setXY(i,hz,vt);}uv.needsUpdate=true;return g;}
function box(w,h,d,x,y,z,m,parent=building,name=''){
 const mapped=!!m.map,mn=Math.min(w,h,d),bevel=m.userData.bevel&&mn>.05&&realismOn;
 let g;
 if(!mapped&&!bevel){const key=`box:${w}:${h}:${d}`;if(!geoCache.has(key))geoCache.set(key,new T.BoxGeometry(w,h,d));g=geoCache.get(key);}
 else{g=bevel?new FX.RoundedBoxGeometry(w,h,d,2,Math.min(.0085,mn*.25)):new T.BoxGeometry(w,h,d);if(mapped)planarUV(g,x,y,z,m.userData.grain,w,h,d);}
 const o=mesh(g,m,parent,name);o.position.set(x,y,z);return o;
}
function roundGeo(w,h,d,r=.06){
 const key=`round:${w}:${h}:${d}:${r}`;if(geoCache.has(key))return geoCache.get(key);
 r=Math.min(r,w*.2,h*.2,d*.2);const s=new T.Shape(),x=-w/2+r,y=-h/2+r,W=w-2*r,L=h-2*r;
 s.moveTo(x,y+r);s.lineTo(x,y+L-r);s.quadraticCurveTo(x,y+L,x+r,y+L);s.lineTo(x+W-r,y+L);s.quadraticCurveTo(x+W,y+L,x+W,y+L-r);s.lineTo(x+W,y+r);s.quadraticCurveTo(x+W,y,x+W-r,y);s.lineTo(x+r,y);s.quadraticCurveTo(x,y,x,y+r);
 const g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r,bevelThickness:r,curveSegments:4});g.translate(0,0,-d/2+r);g.computeVertexNormals();geoCache.set(key,g);return g;
}
function rb(w,h,d,x,y,z,m,parent=building,r=.07,name=''){const o=mesh(roundGeo(w,h,d,r),m,parent,name);o.position.set(x,y,z);return o;}
// R-014: soft upholstery. A sphere is reshaped into a pillow: a squarish (superellipse) plan, a crowned middle that
// thins to a sewn seam at the edges, and a slight dent, instead of a rounded cuboid. axis = the thin (thickness) axis.
// plan: lower = squarer outline; crown: lower = flatter top with fuller sides (box cushions), higher = plumper pillow.
function softGeo(w,h,d,axis='y',plan=.32,crown=.62,dent=.07){
 const key=`soft:${w}:${h}:${d}:${axis}:${plan}:${crown}:${dent}`;if(geoCache.has(key))return geoCache.get(key);
 const g=new T.SphereGeometry(1,48,32),p=g.attributes.position,uv=g.attributes.uv;
 // Axis remaps must be rotations (cyclic), never mirrors: a mirror flips the triangle winding and the mesh renders inside out.
 const dims={x:w,y:h,z:d},[ua,ub]=axis==='y'?['x','z']:axis==='x'?['z','y']:['y','x'];
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const a=Math.sign(x)*Math.pow(Math.abs(x),plan),b=Math.sign(z)*Math.pow(Math.abs(z),plan);
  let t=Math.sign(y)*Math.pow(Math.abs(y),crown);
  t*=1-dent*Math.max(0,1-a*a*1.6)*Math.max(0,1-b*b*1.6)*(y>0?1:.4);   // slight hollow where it has been leaned on
  t*=1-.10*Math.pow(Math.abs(a*b),3);                                 // corners squash a little more ("dog ears")
  const v={[axis]:t*dims[axis]/2,[ua]:a*dims[ua]/2,[ub]:b*dims[ub]/2};p.setXYZ(i,v.x,v.y,v.z);uv.setXY(i,v[ua],v[ub]);}
 g.computeVertexNormals();geoCache.set(key,g);return g;
}
function soft(w,h,d,x,y,z,m,parent=building,name='',axis='y',plan=.32,crown=.62,dent=.07){const o=mesh(softGeo(w,h,d,axis,plan,crown,dent),m,parent,name);o.position.set(x,y,z);return o;}
function cylinder(rad,h,x,y,z,m,parent=building,r2=rad){const cg=new T.CylinderGeometry(rad,r2,h,20);if(m.map)uvScale(cg,Math.PI*2*rad,h);const o=mesh(cg,m,parent);o.position.set(x,y,z);return o;}
function sphere(w,h,d,x,y,z,m,parent=building){const sg=new T.SphereGeometry(.5,24,12);if(m.map)uvScale(sg,Math.PI*Math.max(w,d)*.5,Math.PI*h*.5);const o=mesh(sg,m,parent);o.scale.set(w,h,d);o.position.set(x,y,z);return o;}
function lineTube(points,r,m,parent=building){const pts=points.map(p=>new T.Vector3(...p));const curve=new T.CatmullRomCurve3(pts);const o=mesh(new T.TubeGeometry(curve,Math.max(8,pts.length*6),r,8,false),m,parent);return o;}
function polyPlane(poly,y,m,parent=building,name=''){
 const s=new T.Shape();poly.forEach((p,i)=>i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]));s.closePath();const g=new T.ShapeGeometry(s);g.rotateX(-Math.PI/2);
 const ps=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<ps.count;i++)uv.setXY(i,ps.getX(i),ps.getZ(i));const o=mesh(g,m,parent,name);o.position.y=y;return o;
}
function worktop(w,d,y,parent=building,holes=[],x=0,z=0,name='Granite worktop',m=granite,thickness=.07){
 const s=new T.Shape();s.moveTo(-w/2,-d/2);s.lineTo(w/2,-d/2);s.lineTo(w/2,d/2);s.lineTo(-w/2,d/2);s.closePath();
 for(const hole of holes){const [xx,zz,ww,dd]=hole,p=new T.Path();p.moveTo(xx-ww/2,-zz-dd/2);p.lineTo(xx-ww/2,-zz+dd/2);p.lineTo(xx+ww/2,-zz+dd/2);p.lineTo(xx+ww/2,-zz-dd/2);p.closePath();s.holes.push(p);}
 const g=new T.ExtrudeGeometry(s,{depth:thickness,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);const o=mesh(g,m,parent,name);o.position.set(x,y,z);return o;
}
function sinkCutout(g,w,d){const top=g.children.find(o=>o.name==='Granite top');if(top)g.remove(top);worktop(w+.045,d+.045,2.86,g,[[0,0,w-.29,d-.60]],0,0,'Sink cutout granite');}
function feature(name,type,x,z,w,d,height=0,source='Proposed interior detail'){
 fixtures.push({name,type,x,z,w,d,height,source});
}
function collision(name,x0,z0,x1,z1,h=10,type='wall'){colliders.push({name,x0,z0,x1,z1,h,type});}
function contact(w,d,x,z,parent=building,opacity=.12){
 const c=document.createElement('canvas');c.width=c.height=64;const a=c.getContext('2d'),gr=a.createRadialGradient(32,32,4,32,32,32);gr.addColorStop(0,`rgba(40,31,18,${opacity})`);gr.addColorStop(1,'rgba(40,31,18,0)');a.fillStyle=gr;a.fillRect(0,0,64,64);const m=new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false});const o=new T.Mesh(new T.PlaneGeometry(w,d),m);o.rotation.x=-Math.PI/2;o.position.set(x,.026,z);parent.add(o);return o;
}
// Ventilation shafts confirmed by client. Their lower termination is not supplied; the dark plane is a visual depth cue, not a structural slab specification.
box(27,.32,55.75,13.5,-.21,27.88,trim,building,'Floor slab envelope');
// R-014: the passage between the Bedroom 2 door (D4), the common bath and the living room is not a room in the traced
// plan, so it had no floor or ceiling and showed the grey slab. It gets the same vitrified tile and ceiling as the living room.
{const pass=[[12.1275,17.13],[15.63,17.13],[15.63,21.0075],[12.1275,21.0075]];polyPlane(pass,.008,stone,building,'Passage flooring (Bedroom 2 / common bath)');
 const cp=ivory.clone();cp.side=T.DoubleSide;polyPlane(pass,10,cp,ceilings,'Passage ceiling');}
for(const r of P.rooms){if(r.id==='stairs')continue;polyPlane(r.polygon,.008,r.id==='bath-master'?masterBathFloor:r.finish==='bath'?bathStone:r.finish==='outdoor'?bathStone:stone,building,r.name+' flooring');
 if(!['stairs','terrace','lift'].includes(r.id)){const ceilingPaint=ivory.clone();ceilingPaint.side=T.DoubleSide;polyPlane(r.polygon,10,ceilingPaint,ceilings,r.name+' ceiling');}
}
for(const v of P.voids){const [a,b,c,d]=v.bounds;box(c-a,.05,d-b,(a+c)/2,.007,(b+d)/2,mat(v.id+' shaft depth cue','#6b736c',.98),building,v.name+' — termination provisional');}
function wallSegment(w,a,b,sill,lintel){
 if(b-a<.00001||lintel-sill<.00001)return;const [x0,z0,x1,z1]=w.bounds;
 const o=w.axis==='x'?box(b-a,lintel-sill,z1-z0,(a+b)/2,(sill+lintel)/2,(z0+z1)/2,ivory,building,w.name):box(x1-x0,lintel-sill,b-a,(x0+x1)/2,(sill+lintel)/2,(a+b)/2,ivory,building,w.name);
 const c=w.axis==='x'?[a,z0,b,z1]:[x0,a,x1,b];if(sill<2)collision(w.name,...c,lintel);
 if(sill===0){if(w.axis==='x')box(b-a,.25,z1-z0+.025,(a+b)/2,.13,(z0+z1)/2,trim);else box(x1-x0+.025,.25,b-a,(x0+x1)/2,.13,(a+b)/2,trim);}
 o.userData={architectural:true,pdf:w.pdf,provisional:w.provisional};
}
function polyIn(x,z,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,zi]=poly[i],[xj,zj]=poly[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;}
function roomAt(x,z){for(const r of P.rooms)if(polyIn(x,z,r.polygon))return r.id;for(const v of P.voids){const [a,b,c,d]=v.bounds;if(x>a&&x<c&&z>b&&z<d)return 'void';}return null;}
const windowLights=[];
if(FX.RectAreaLightUniformsLib)FX.RectAreaLightUniformsLib.init();
function windowLight(w,op,width,h){
 const [x0,z0,x1,z1]=w.bounds,ax=w.axis==='x',cx=ax?(op.start+op.end)/2:(x0+x1)/2,cz=ax?(z0+z1)/2:(op.start+op.end)/2;
 const A=ax?[cx,cz-1.3]:[cx-1.3,cz],B=ax?[cx,cz+1.3]:[cx+1.3,cz],ra=roomAt(...A),rb=roomAt(...B);
 const outdoorish=r=>!r||['void','stairs','terrace'].includes(r),lit=r=>!outdoorish(r);
 let dir=0,room=null,reach=1;
 if(lit(ra)&&outdoorish(rb)){dir=-1;room=ra;reach=rb==='terrace'?1:rb==='stairs'?.45:rb==='void'?.4:1;}
 else if(lit(rb)&&outdoorish(ra)){dir=1;room=rb;reach=ra==='terrace'?1:ra==='stairs'?.45:ra==='void'?.4:1;}
 if(!dir)return;
 const L=new T.RectAreaLight('#fff1dc',1,Math.max(.2,width-.14),Math.max(.2,h-.15));
 const px0=ax?cx:cx+dir*.18,pz0=ax?cz+dir*.18:cz;L.position.set(px0,op.sill+h/2,pz0);L.lookAt(ax?cx:cx+dir*6,op.sill+h/2,ax?cz+dir*6:cz);
 scene.add(L);windowLights.push({light:L,room,reach,x:cx,z:cz,area:width*h});
}
function updateWindowLights(){
 const cam=camera.position,camRoom=mode==='walk'?roomAt(cam.x,cam.z):null;
 for(const wl of windowLights){
  let k=mode==='overview'?.55:(camRoom===wl.room?1:.14);
  const dayI=Math.min(8,wl.area*1.1)*wl.reach;
  wl.light.intensity=night?k*Math.min(2.2,wl.area*.25)*wl.reach:k*dayI;
  wl.light.color.set(night?'#8fa8d4':'#fff1dc');
 }
}
function openingFrame(w,op){
 const [x0,z0,x1,z1]=w.bounds,x=w.axis==='x'?(op.start+op.end)/2:(x0+x1)/2,z=w.axis==='z'?(op.start+op.end)/2:(z0+z1)/2,
  width=op.end-op.start,h=op.lintel-op.sill,group=new T.Group();group.position.set(x,op.sill,z);if(w.axis==='z')group.rotation.y=Math.PI/2;building.add(group);group.name=op.id+' '+op.kind;
 const depth=w.axis==='x'?z1-z0:x1-x0;
 if(op.kind==='window'){
  box(width,.08,depth+.07,0,.015,0,trim,group,'Window sill');
  for(const sx of [-1,1])box(.09,h,.10,sx*(width/2-.045),h/2,0,charcoal,group,'Window jamb');
  for(const yy of [0,h])box(width,.09,.10,0,yy,0,charcoal,group,'Window frame');
  box(.055,h,.085,0,h/2,0,charcoal,group,'Window mullion');
  box(width-.12,h-.13,.025,0,h/2,0,windowGlass,group,'Window glass');
  windowLight(w,op,width,h);
  if(op.id==='W9'||op.id==='W4'){
   for(let xx=-width/2+.1;xx<width/2;xx+=.19)box(.025,h-.15,.025,xx,h/2,.04,metal,group,'Ventilator louvre');
  }else{
   box(.025,.20,.07,.07,h*.5,.09,metal,group,'Window latch');
  }
 }else if(op.kind==='lift'){
  for(const sx of [-1,1])box(.16,h+.2,depth+.02,sx*(width/2+.07),h/2,0,metal,group,'Lift surround');
  box(width+.28,.15,depth+.02,0,h+.02,0,metal,group);
  for(const sx of [-1,1])box(width/2-.02,h-.05,.06,sx*(width/4+.01),h/2,0,metal,group,'Lift sliding panel');
  box(.035,h-.2,.075,0,h/2,.05,charcoal,group);
  box(.27,.7,.04,width/2+.35,3.5,.05,metal,group,'Lift call station');
  sphere(.08,.08,.03,width/2+.35,3.7,.078,warmLight,group);sphere(.08,.08,.03,width/2+.35,3.43,.078,charcoal,group);
 }else{
  for(const sx of [-1,1])box(.10,h,.14,sx*(width/2-.05),h/2,0,oak,group,'Door jamb');
  box(width,.10,.14,0,h-.05,0,oak,group,'Door head');
  // Modelled doors can be closed for review; open leaves do not change opening sizes.
  const pivot=new T.Group();pivot.position.set(x,0,z);if(w.axis==='z')pivot.rotation.y=Math.PI/2;doorLeaves.add(pivot);
  const right=['D1','D3','D5','D6','D8'].includes(op.id),direction=right?-1:1;
  const openAngle=['D1','D9'].includes(op.id)?-Math.PI/2:Math.PI/2;
  const hinge=new T.Group();hinge.position.x=direction*(-width/2+.075);pivot.add(hinge);
  rb(width-.15,h-.12,.12,direction*(width-.15)/2,(h-.12)/2,.02,oak,hinge,.025,'Flush laminate door '+op.id);
  box(.05,.36,.16,direction*(width-.35),3.15,.13,metal,hinge,'Door handle');box(.3,.05,.05,direction*(width-.48),3.25,.21,metal,hinge,'Lever handle');
  for(const yy of [.7,h/2,h-.7])cylinder(.035,.14,0,yy,.04,metal,hinge);
  hinge.rotation.y=openAngle;doorPivots.push({id:op.id,hinge,base:pivot,open:true,openAngle,twoWay:['D6','D9'].includes(op.id),bounds:w.axis==='x'?[op.start,z0,op.end,z1]:[x0,op.start,x1,op.end]});
 }
 feature(op.id+' '+op.kind,op.kind,x,z,w.axis==='x'?width:depth,w.axis==='z'?width:depth,op.lintel,'Architect plan: opening position and annotated height');
}
for(const w of P.walls){const start=w.axis==='x'?w.bounds[0]:w.bounds[1],end=w.axis==='x'?w.bounds[2]:w.bounds[3];let cur=start;
 for(const op of [...w.openings].sort((a,b)=>a.start-b.start)){wallSegment(w,cur,op.start,0,w.height);wallSegment(w,op.start,op.end,0,op.sill);wallSegment(w,op.start,op.end,op.lintel,w.height);openingFrame(w,op);cur=op.end;}
 wallSegment(w,cur,end,0,w.height);
}
for(const c of P.columns){const [a,b,d,e]=c.bounds;const o=box(d-a,10,e-b,(a+d)/2,5,(b+e)/2,ivory,building,c.name);o.userData={architectural:true,pdf:c.pdf};collision(c.name,a,b,d,e);}

function cabinet(name,x,z,w,d,h,rotation=0,finish=oak,drawers=false,parent=building){
 const g=new T.Group();g.name=name;g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);
 for(const sx of [-1,1])box(.06,h-.2,d,sx*(w/2-.03),h/2+.1,0,finish,g,'Cabinet side');
 box(w-.12,h-.2,.05,0,h/2+.1,-d/2+.025,finish,g,'Cabinet back');
 box(w-.12,.055,d-.05,0,.25,0,finish,g,'Cabinet base');box(w-.1,.2,d-.08,0,.10,0,charcoal,g,'Recessed plinth');
 let n=Math.max(1,Math.round(w/1.8)),sw=w/n;
 if(drawers){for(let j=0;j<3;j++){let yy=.25+(h-.3)*(j+.5)/3;box(w-.065,(h-.3)/3-.055,.055,0,yy,d/2+.035,finish,g,'Drawer front');box(.45,.035,.055,0,yy+.14,d/2+.085,metal,g,'Drawer pull');}}
 else for(let j=0;j<n;j++){let xx=-w/2+sw*(j+.5);box(sw-.06,h-.3,.055,xx,(h+.15)/2,d/2+.035,finish,g,'Laminate shutter');box(.025,.38,.06,xx+sw/2-.12,h*.48,d/2+.085,metal,g,'Easy grip handle');}
 if(h<4)box(w+.045,.06,d+.045,0,h+.025,0,granite,g,'Granite top');
 if(parent===building){const sw90=Math.abs(Math.sin(rotation))>.5;let W=sw90?d:w,D=sw90?w:d;collision(name,x-W/2,z-D/2,x+W/2,z+D/2,h,'cabinet');furniture.push({name,type:'cabinet',x,z,w:W,d:D,h});}
 return g;
}
function bedside(x,z,rotation=0,finish=oak){return cabinet('Bedside drawer',x,z,1.6,1.3,1.6,rotation,finish,true);}
function bed(name,x,z,w,l,rotation=0,accent=blanket){
 const g=new T.Group();g.name=name;g.position.set(x,0,z);g.rotation.y=rotation;building.add(g);
 rb(w+.08,.64,l+.06,0,.48,0,oak,g,.065,'Bed storage base');
 rb(w,.58,l,0,1.1,0,bedding,g,.13,'Mattress');
 rb(w+.04,3.20,.22,0,1.85,-l/2-.065,oak,g,.07,'Walnut framed headboard');
 rb(w-.22,2.87,.08,0,1.86,-l/2+.075,linen,g,.10,'Plain upholstered headboard insert');
 soft(w+.02,.16,l*.6,0,1.44,l*.17,bedding,g,'Cotton duvet','y',.10,.45,.02);
 rb(w+.04,.11,l*.3,0,1.53,l*.26,accent,g,.045,'Cotton foot throw');
 for(const sx of [-1,1]){const pillow=soft(w*.40,.42,1.30,sx*w*.24,1.98,-l/2+.62,bedding,g,'Cotton pillow','y',.30,.70,.10);pillow.rotation.x=-1.05;const cushion=soft(1.15,1.15,.38,sx*w*.22,1.94,-l/2+1.28,accent,g,'Accent pillow','z',.24,.62,.05);cushion.rotation.x=-.32;}
 for(const sx of [-1,1])for(const sz of [-1,1])box(.16,.23,.16,sx*(w/2-.3),.115,sz*(l/2-.3),charcoal,g);
 contact(w+1,l+1,x,z,building,.17);
 const sw90=Math.abs(Math.sin(rotation))>.5,W=sw90?l:w,D=sw90?w:l;collision(name,x-W/2,z-D/2,x+W/2,z+D/2,1.55,'bed');furniture.push({name,type:'bed',x,z,w:W,d:D,h:1.55});return g;
}
function curtain(name,x,z,w,h,rotation=0,y=0){
 const g=new T.Group();g.name=name;g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);
 cylinder(.035,w+.3,0,h+.12,0,charcoal,g).rotation.z=Math.PI/2;
 const cloth=mat(name+' cotton','#e1dccf',1,0,{...pbr(TX.linen,.9),side:T.DoubleSide,physical:true,sheen:.9,sheenRoughness:.55,sheenColor:new T.Color('#f6eee0')});
 for(const sx of [-1,1]){let cw=w*.22,seg=18;const gg=new T.PlaneGeometry(cw,h,seg,1),p=gg.attributes.position;uvScale(gg,cw*1.6,h);for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/cw*6*Math.PI)*.075);gg.computeVertexNormals();const o=mesh(gg,cloth,g,'Washable curtain panel');o.position.set(sx*(w/2-cw/2),h/2,0);}
}
function art(x,y,z,w,h,rotation=0,scheme=['#eee0c9','#bd7b5b','#758c9c']){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);
 box(w+.1,h+.1,.045,0,0,0,oak,g,'Simple art frame');
 const c=document.createElement('canvas');c.width=600;c.height=700;const a=c.getContext('2d');a.fillStyle=scheme[0];a.fillRect(0,0,600,700);a.fillStyle=scheme[1];a.beginPath();a.ellipse(260,270,190,270,-.25,0,Math.PI*2);a.fill();a.fillStyle=scheme[2];a.beginPath();a.ellipse(400,470,175,195,.6,0,Math.PI*2);a.fill();a.strokeStyle='#e8e2d4';a.lineWidth=5;a.beginPath();a.moveTo(140,600);a.bezierCurveTo(380,570,180,90,460,110);a.stroke();
 const m=new T.MeshStandardMaterial({map:new T.CanvasTexture(c),roughness:.9});m.map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.position.z=.032;g.add(o);
}
function botanicalArt(x,y,z,w,h,rotation=0,accent='#b56f4f'){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);
 box(w+.10,h+.10,.045,0,0,0,oak,g,'Slim walnut botanical art frame');
 const c=document.createElement('canvas');c.width=600;c.height=760;const a=c.getContext('2d');
 a.fillStyle='#eee6d9';a.fillRect(0,0,600,760);a.strokeStyle='#536049';a.lineWidth=11;a.lineCap='round';a.beginPath();a.moveTo(295,675);a.bezierCurveTo(280,520,330,340,292,105);a.stroke();
 const leaves=[[270,590,-.72],[335,530,.58],[245,460,-.75],[348,400,.60],[250,325,-.72],[332,260,.55],[282,180,-.38]];
 for(const [xx,yy,rr] of leaves){a.save();a.translate(xx,yy);a.rotate(rr);a.fillStyle='#65704f';a.beginPath();a.ellipse(0,0,54,112,0,0,Math.PI*2);a.fill();a.restore();}
 a.fillStyle=accent;a.beginPath();a.ellipse(400,292,104,150,.42,0,Math.PI*2);a.fill();
 const m=new T.MeshStandardMaterial({map:new T.CanvasTexture(c),roughness:.92});m.map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.position.z=.032;g.add(o);
}
function tv(name,x,z,w,rotation=0,centerY=4){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;building.add(g);g.name=name;
 rb(w+.07,w*.5625+.06,.095,0,centerY,0,charcoal,g,.04,'TV bezel');box(w,w*.5625,.025,0,centerY,.062,screenMat,g,'TV screen');
 box(.7,.38,.06,0,centerY-.4,-.05,charcoal,g,'TV bracket');feature(name,'electrical',x,z,w,.2,centerY,'Proposed television and concealed power/data');
 // A subtle screen reflection, no product branding.
 const c=document.createElement('canvas');c.width=600;c.height=340;const a=c.getContext('2d'),gr=a.createLinearGradient(0,0,600,340);gr.addColorStop(0,'#263736');gr.addColorStop(.55,'#172323');gr.addColorStop(1,'#35413a');a.fillStyle=gr;a.fillRect(0,0,600,340);a.fillStyle='rgba(198,207,185,.08)';a.beginPath();a.moveTo(20,0);a.lineTo(300,0);a.lineTo(560,340);a.lineTo(280,340);a.fill();const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const m=new T.MeshStandardMaterial({map:tx,roughness:.19,metalness:.2});const o=new T.Mesh(new T.PlaneGeometry(w-.025,w*.5625-.025),m);o.position.set(0,centerY,.079);g.add(o);return g;
}
function switchPanel(name,x,y,z,rotation=0,n=3,socket=false){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);
 rb(.16+n*.13,.28,.038,0,0,0,white,g,.015,'Electrical faceplate');
 for(let i=0;i<n;i++){let xx=(i-(n-1)/2)*.13;if(socket){for(const [dx,dy] of [[-.028,-.022],[.028,-.022],[0,.028]]){const o=new T.Mesh(new T.CircleGeometry(.01,8),charcoal);o.position.set(xx+dx,dy,.026);g.add(o);}}else box(.085,.18,.015,xx,0,.025,trim,g,'Rocker switch');}
 feature(name,socket?'socket':'switch',x,z,.16+n*.13,.04,y);return g;
}
function sofaControlPanel(name,x,y,z,rotation=0){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);
 const face=new T.Group();face.rotation.x=-Math.PI/2;g.add(face);
 rb(.82,.32,.045,0,0,0,charcoal,face,.025,'Upward-facing sofa plank switch and charging faceplate');
 for(const xx of [-.30,-.17])box(.085,.18,.015,xx,0,.028,trim,face,'Sofa rocker switch');
 for(const [dx,dy] of [[-.035,-.032],[.035,-.032],[0,.035]]){const o=new T.Mesh(new T.CircleGeometry(.012,8),trim);o.position.set(.06+dx,dy,.028);face.add(o);}
 box(.10,.035,.015,.24,.045,.028,trim,face,'USB A outlet');box(.10,.055,.015,.24,-.055,.028,trim,face,'USB C outlet');
 feature(name,'switch/socket',x,z,.82,.05,y,'Accessible switches, Indian 6A socket, USB-A and USB-C on walnut sofa plank');return g;
}
function ac(name,x,z,rotation=0){const g=new T.Group();g.position.set(x,8.45,z);g.rotation.y=rotation;building.add(g);g.name=name;
 // R-014: split-unit profile (flat back, curved front sweeping into the outlet), extruded across the 2.9 ft width.
 const s=new T.Shape();s.moveTo(-.335,.40);s.lineTo(.12,.40);s.quadraticCurveTo(.335,.39,.335,.14);s.lineTo(.30,-.18);s.quadraticCurveTo(.27,-.38,.06,-.40);s.lineTo(-.335,-.40);s.closePath();
 const geo=new T.ExtrudeGeometry(s,{depth:2.80,bevelEnabled:true,bevelSize:.04,bevelThickness:.05,bevelSegments:4,curveSegments:16});geo.translate(0,0,-1.40);geo.rotateY(-Math.PI/2);geo.computeVertexNormals();
 mesh(geo,white,g,'Split AC indoor unit');
 box(2.55,.11,.30,0,-.33,.16,charcoal,g,'AC outlet');const flap=box(2.55,.02,.26,0,-.38,.26,white,g,'AC swing flap');flap.rotation.x=-.45;
 for(let i=0;i<9;i++)box(.012,.09,.22,-1.1+i*.275,-.32,.16,trim,g,'AC vertical vane');
 box(2.7,.008,.02,0,.12,.335,trim,g,'AC front panel groove');box(.20,.06,.012,1.05,-.05,.316,black,g,'AC display');box(.03,.02,.006,1.0,-.05,.324,warmLight,g,'AC display LED');
 feature(name,'AC',x,z,2.9,.7,8.45);}
function ceilingLight(room,x,z,ambientPower=26){
 cylinder(.40,.08,x,9.94,z,trim);cylinder(.32,.025,x,9.889,z,warmLight);const light=new T.PointLight('#ffe5bc',ambientPower,16,2);light.position.set(x,9.35,z);scene.add(light);roomLights.push({room,light,power:ambientPower});feature(room+' ceiling light','light',x,z,.8,.8,9.9);
}
function downlight(room,x,z){cylinder(.17,.045,x,9.97,z,trim);cylinder(.13,.018,x,9.939,z,warmLight);feature(room+' downlight','light',x,z,.34,.34,9.95);}
// R-006: framed mirror panel fixed to a wall or cabinet face (plan labels MIRROR). Group local +z faces the room.
function wallMirror(name,x,y,z,w,h,rotation=0,note='Architect plan: MIRROR'){
 const g=new T.Group();g.name=name;g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);
 box(w+.1,h+.1,.04,0,h/2,-.005,oak,g,'Mirror frame');box(w,h,.03,0,h/2,.02,mirror,g,'Mirror glass');
 feature(name,'mirror',x,z,Math.abs(Math.cos(rotation))>.5?w:.05,Math.abs(Math.sin(rotation))>.5?w:.05,y+h,note);return g;
}
function fan(name,x,z){const g=new T.Group();g.position.set(x,8.7,z);building.add(g);cylinder(.045,.6,0,.4,0,charcoal,g);cylinder(.20,.15,0,.08,0,greige,g);for(let i=0;i<3;i++){const b=rb(1.7,.03,.27,.80,0,0,greige,g,.05,'Fan blade');const pivot=new T.Group();pivot.rotation.y=i*Math.PI*2/3;g.remove(b);pivot.add(b);g.add(pivot);}feature(name,'fan',x,z,3.5,3.5,8.7);}
function sconce(x,z,rotation=0,y=4.6){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);cylinder(.11,.15,0,0,.08,metal,g).rotation.x=Math.PI/2;lineTube([[0,0,.15],[0,.1,.4],[0,.32,.4]],.025,metal,g);const o=mesh(new T.CylinderGeometry(.17,.23,.32,20),warmLight,g,'Diffused bedside light');o.position.set(0,.32,.4);}
function plant(x,z,h=2,parent=building){cylinder(h*.15,h*.26,x,h*.13,z,porcelain,parent,h*.12);cylinder(h*.13,.03,x,h*.265,z,soil,parent);for(let i=0;i<8;i++){let a=i*2.399,hh=h*(.5+.5*(i%3)/2),dx=Math.cos(a)*h*.25,dz=Math.sin(a)*h*.25;lineTube([[x,h*.25,z],[x+dx*.5,hh*.8,z+dz*.5],[x+dx,hh,z+dz]],.012,leaf,parent);const l=sphere(h*.15,h*.4,h*.04,x+dx,hh-.1,z+dz,leaf,parent);l.rotation.set(.35,a,-.3);}}

// MASTER BEDROOM: bed and storage use the architect's positions, with no floor rug.
bed('Master bed 6 ft × 6 ft 6 in',px(260.34),pz(234.96),6,6.5,Math.PI/2);
bedside(px(221.0),pz(174.4),Math.PI/2);bedside(px(221),pz(294.6),Math.PI/2);
// R-006: LOCKER HIDDEN in the NW bedside (plan note). Concealed steel locker behind the drawer bank, no visible front.
{const lk=new T.Group();lk.name='Master hidden locker (concealed inside NW bedside)';lk.position.set(px(221.0),0,pz(174.4));lk.rotation.y=Math.PI/2;building.add(lk);
 box(1.2,.62,.55,0,.60,-.30,metal,lk,'Concealed steel locker body');box(1.24,.04,.59,0,.93,-.30,granite,lk,'Locker granite lid');
 feature('Master hidden locker','storage',px(221.0),pz(174.4),1.2,.55,.95,'Architect plan: LOCKER HIDDEN, concealed in NW bedside; internal size and lock type to be confirmed');}
cabinet('Master west wardrobe',px(220.38),pz(352.98),5.7525,2,8.6,Math.PI/2,oak);
cabinet('Master upper TV storage',px(370.8),pz(186.0),2.8,1.18,8.6,-Math.PI/2,greige);
cabinet('Master lower TV storage',px(370.8),pz(316.3),3.45,1.18,8.6,-Math.PI/2,greige);
cabinet('Master TV console',px(371.1),pz(252),3.8,1.125,1.65,-Math.PI/2,oak,true);
tv('Master TV',px(362.0),pz(252),3.25,-Math.PI/2);
curtain('Master rear curtains',px(310),pz(159),6.5,9.1,0,.35);
art(px(207),4.9,pz(235),2.6,3,Math.PI/2);
wallMirror('Master store mirror',10.5,1.3,15.55,1.8,5.4,-Math.PI/2,'Architect plan: MIRROR on the 2 ft store segment at the east wall, south end');
sconce(px(207),pz(175),Math.PI/2);sconce(px(207),pz(294),Math.PI/2);
switchPanel('Master entry controls',px(378.8),3.7,pz(331),-Math.PI/2,4);
for(const zz of [174.4,294.6])switchPanel('Master bedside charging',px(206.2),2.05,pz(zz),Math.PI/2,2,true);
switchPanel('Master TV power/data',px(379),1.2,pz(255),-Math.PI/2,3,true);
ac('Master AC',px(333),pz(397.4),Math.PI);
ceilingLight('master',px(323),pz(267),29);for(const [x,z] of [[234,208],[234,332],[351,208],[351,332]])downlight('master',px(x),pz(z));fan('Master fan',px(276),pz(239));

// REAR SHAFT (R-011): revised plan draws a KOTTA/GRENITE SELF along the shaft's west wall: 1 ft 9 in deep (x 0.75-2.50 ft) over the full
// 4 ft 3 in length of the shaft (z 0.375-4.6275 ft). Height (2 ft 6 in), slab thickness and corbel supports are assumptions, and the shaft
// termination is not supplied - see RFI-011. This does not alter the shaft walls or the shaft's confirmed status.
{const kota=mat('Kota stone shelf','#8c9189',.82,0),kx0=.75,kx1=2.5,kz0=.375,kz1=4.6275,ky=2.5,kt=.125,kc=new T.Group();kc.name='Rear shaft kota shelf';building.add(kc);
 box(kx1-kx0,kt,kz1-kz0,(kx0+kx1)/2,ky-kt/2,(kz0+kz1)/2,kota,kc,'Kota stone shelf slab');
 for(const zz of [kz0+.5,(kz0+kz1)/2,kz1-.5])box(kx1-kx0-.15,.45,.35,(kx0+kx1)/2-.075,ky-kt-.225,zz,kota,kc,'Kota shelf corbel');
 collision('Rear shaft kota shelf',kx0,kz0,kx1,kz1,ky,'cabinet');furniture.push({name:'Rear shaft kota shelf',type:'cabinet',x:(kx0+kx1)/2,z:(kz0+kz1)/2,w:kx1-kx0,d:kz1-kz0,h:ky});
 feature('Rear shaft kota shelf','joinery',(kx0+kx1)/2,(kz0+kz1)/2,kx1-kx0,kz1-kz0,ky,'Architect plan (revised 14 Oct 2026): KOTTA/GRENITE SELF 1 ft 9 in x 4 ft 3 in along the shaft west wall; height, thickness and supports are assumptions (RFI-011)');}

// BEDROOM 2: the complete sleeping group shifts 1 ft 9.2 in toward the east
// almirah. The right bedside granite top meets the almirah side exactly, while
// the left table, charging points, artwork and fan retain alignment with the bed.
const b2ShiftPdf=28.24,b2BedPdfX=474.36+b2ShiftPdf,b2LeftTablePdfX=410.4+b2ShiftPdf,b2RightTablePdfX=539+b2ShiftPdf;
bed('Bedroom 2 bed 6 ft × 6 ft 6 in — shifted toward almirah',px(b2BedPdfX),pz(136.92),6,6.5,0);
bedside(px(b2LeftTablePdfX),pz(102),0);bedside(px(b2RightTablePdfX),pz(102),0);
cabinet('Bedroom 2 east wardrobe',px(596.4),pz(190.92),10.755,2,8.6,-Math.PI/2,sage);
// R-010: architect east-wall chain is 3 in wall offset + 1 ft 3 in store + 10 ft 9 in wardrobe = 12 ft 3 in
// (the room). The store was modelled 2 ft long, so it overlapped the wardrobe by 6 in and their shutters
// collided. Now 1 ft 3 in long (z 0.625-1.875 ft), abutting the wardrobe at z 1.875 ft; depth stays 2 ft.
// Back face set exactly on the east wall face (x 26.25 ft; px(596.36)), so nothing here exceeds the room.
cabinet('Bedroom 2 north end storage',px(596.36),pz(94.88),1.25,2,8.6,-Math.PI/2,oak);
// R-011 (revised architect plan 14 Oct 2026): the Bedroom 2 TV unit is replaced by a STUDY UNIT, 5 ft wide x 1 ft 6 in deep
// (outline measured from the PDF vectors: x 16.19-21.19 ft, z 10.88-12.37 ft). Its face is 3 ft 9 in from the bed foot (plan dimension
// 3'-9"; bed foot z 7.13 ft) and it stands about 3 in off the south wall, as drawn. The TV is removed. Desk height (2 ft 6 in), the
// three-drawer pedestal at the east end and the modesty panel are assumptions - the plan shows only the outline.
{const sx=18.6865,sz=11.624,sw=5.0,sd=1.5,pw=1.5,h=2.4,pedX=-sw/2+pw/2;
 const su=new T.Group();su.name='Bedroom 2 study unit';su.position.set(sx,0,sz);su.rotation.y=Math.PI;building.add(su);
 box(sw+.04,.10,sd+.04,0,h+.05,.015,oak,su,'Study desk top');
 for(const k of [-1,1])box(.06,h-.2,sd-.05,pedX+k*(pw/2-.03),h/2+.1,0,oak,su,'Study pedestal side');
 box(pw-.12,h-.2,.05,pedX,h/2+.1,-sd/2+.05,oak,su,'Study pedestal back');
 box(pw-.12,.055,sd-.1,pedX,.25,0,oak,su,'Study pedestal base');box(pw-.1,.2,sd-.1,pedX,.10,0,charcoal,su,'Study pedestal plinth');
 for(let j=0;j<3;j++){const yy=.25+(h-.3)*(j+.5)/3;box(pw-.065,(h-.3)/3-.055,.055,pedX,yy,sd/2+.0,oak,su,'Study drawer front');box(.45,.035,.055,pedX,yy+.14,sd/2+.05,metal,su,'Study drawer pull');}
 box(.06,h,sd-.05,sw/2-.03,h/2,0,oak,su,'Study desk end panel');
 box(sw-pw-.06,1.0,.04,(pw-.06)/2,1.85,-sd/2+.06,oak,su,'Study desk modesty panel');
 collision('Bedroom 2 study unit',sx-sw/2,sz-sd/2,sx+sw/2,sz+sd/2,2.5,'cabinet');furniture.push({name:'Bedroom 2 study unit',type:'cabinet',x:sx,z:sz,w:sw,d:sd,h:2.5});
 feature('Bedroom 2 study unit','joinery',sx,sz,sw,sd,2.5,'Architect plan (revised 14 Oct 2026): STUDY UNIT 5 ft x 1 ft 6 in replaces the TV unit; desk height, pedestal side and drawers are assumptions');
 switchPanel('Bedroom 2 study unit power/data',sx,3.3,12.61,Math.PI,3,true);}
curtain('Bedroom 2 rear shaft curtains',px(390.5),pz(115.2),4.25,9.1,Math.PI/2,.35);
curtain('Bedroom 2 south window curtains',px(560.4),pz(274.7),2.6,9.0,Math.PI,.38);
art(px(474+b2ShiftPdf),5.5,pz(82.5),3.8,2.2,0);
// R-011: the revised plan removes the west-wall AC and draws it on the south wall, centred over the study unit (3 ft wide, x 17.19-20.18 ft).
ac('Bedroom 2 AC south wall over study unit (revised plan)',18.6865,12.53,Math.PI);
wallMirror('Bedroom 2 north wall mirror',22.9,3.5,.4,1.5,2.9,0,'Architect plan: MIRROR 1 ft 3 in beside the north-wall store; placed per the drawing, not the shifted bed (discrepancy 1 left open)');
switchPanel('Bedroom 2 entry controls',px(445),3.7,pz(316),-Math.PI/2,4);
for(const xx of [b2LeftTablePdfX,b2RightTablePdfX])switchPanel('Bedroom 2 bedside charging',px(xx),2,pz(82.5),0,2,true);
ceilingLight('bedroom-2',px(474),pz(220),29);for(const [x,z] of [[407,171],[548,171],[407,240],[552,240]])downlight('bedroom-2',px(x),pz(z));fan('Bedroom 2 fan',px(474+b2ShiftPdf),pz(155));

// BEDROOM 3: dusty blue; the smaller bed and two separate wardrobes stay as drawn.
const clay=mat('Dusty blue cotton throw','#71899b',1,0,{...pbr(TX.linen,1.3),physical:true,sheen:1,sheenRoughness:.5,sheenColor:new T.Color('#a9bfcc')});
bed('Bedroom 3 bed 5 ft 6 in × 6 ft 3 in',px(498.42),pz(827.94),5.5,6.25,Math.PI/2,clay);
bedside(px(458),pz(773),Math.PI/2);bedside(px(458),pz(883),Math.PI/2);
// R-011: revised east-wall chain (north to south) 2 ft 9 in wardrobe + 2 ft store + 5 ft iron table + 1 ft 6 in shelf + 4 ft 3 in wardrobe = 15 ft 6 in.
cabinet('Bedroom 3 north wardrobe 2 ft 9 in',px(596.4),40.875,2.75,2,8.6,-Math.PI/2,taupe);
// R-011: store and shelf x set to 25.75 so their back faces sit exactly on the east wall face (26.25); px(604.0) had left them 0.0225 ft (7 mm) into the wall.
cabinet('Bedroom 3 store 2 ft (mirror on face)',25.75,43.25,2,1,8.6,-Math.PI/2,taupe);
wallMirror('Bedroom 3 store mirror',25.1675,1.3,43.25,1.8,5.4,-Math.PI/2,'Architect plan: MIRROR on the 2 ft store beside the folding iron table');
cabinet('Bedroom 3 south wardrobe 4 ft 3 in',px(596.4),pz(920.88),4.25,2,8.6,-Math.PI/2,oak);
// R-006/R-011: open shelf (plan label SELF) between the iron table and the south wardrobe; 11 in on the 10 Sep plan, 1 ft 6 in on the 14 Oct revision (z 49.25-50.75 ft).
{const cz=50.0,sw=1.5,sd=1.0,sh=new T.Group();sh.name='Bedroom 3 open shelf 1 ft 6 in';sh.position.set(25.75,0,cz);sh.rotation.y=-Math.PI/2;building.add(sh);
 for(const sx of [-1,1])box(.04,6.5,sd,sx*(sw/2-.02),3.25,0,oak,sh,'Shelf side');for(let i=0;i<6;i++)box(sw-.04,.04,sd-.02,0,.3+i*1.2,0,oak,sh,'Shelf board');box(sw-.04,6.4,.03,0,3.25,-sd/2+.015,oak,sh,'Shelf back');
 collision('Bedroom 3 open shelf',25.25,cz-sw/2,26.25,cz+sw/2,6.5,'cabinet');furniture.push({name:'Bedroom 3 open shelf',type:'cabinet',x:25.75,z:cz,w:1.0,d:sw,h:6.5});
 feature('Bedroom 3 open shelf','storage',25.75,cz,1.0,sw,6.5,'Architect plan (revised 14 Oct 2026): SELF 1 ft 6 in');}
// R-007/R-011: revised plan replaces the Bedroom 3 TV unit with a FOLDING IRON TABLE; the 14 Oct PDF dimensions it 5 ft long x 1 ft 9 in deep (R-007 had 5 ft 6 in from an image).
// Modelled as a wall-hinged padded leaf (hinge on the long wall edge, surface 2 ft 9 in high, assumed) that folds up into a shallow frame.
const ironZ=46.75,ironHingeX=26.2,ironLen=5.0,ironDepth=1.75,ironTop=2.75;
const ironGroup=new T.Group();ironGroup.name='Bedroom 3 folding iron table';ironGroup.position.set(0,0,ironZ);building.add(ironGroup);
{const fr=new T.Group();fr.name='Iron table stowage frame';ironGroup.add(fr);
 box(.30,.07,ironLen+.12,26.1,ironTop-.07,0,oak,fr,'Frame bottom rail');box(.30,.07,ironLen+.12,26.1,ironTop+ironDepth+.08,0,oak,fr,'Frame top rail');
 for(const sz of [-1,1])box(.30,ironDepth+.22,.07,26.1,ironTop+ironDepth/2+.005,sz*(ironLen/2+.025),oak,fr,'Frame end');
 box(.03,ironDepth+.16,ironLen,26.235,ironTop+ironDepth/2+.005,0,taupe,fr,'Frame back panel');}
const ironLeaf=new T.Group();ironLeaf.name='Iron table leaf (hinged)';ironLeaf.position.set(ironHingeX,ironTop,0);ironGroup.add(ironLeaf);
rb(ironDepth,.07,ironLen,-ironDepth/2,-.035,0,oak,ironLeaf,.02,'Iron table board');
rb(ironDepth-.1,.035,ironLen-.1,-ironDepth/2,.012,0,linen,ironLeaf,.012,'Padded heat-resistant cover');
box(.03,.15,ironLen-.2,-.02,-.02,0,metal,ironLeaf,'Iron table hinge');
const ironLegs=new T.Group();ironLegs.name='Iron table folding legs';ironGroup.add(ironLegs);
for(const sz of [-1,1])box(.07,ironTop-.07,.07,ironHingeX-ironDepth+.05,(ironTop-.07)/2,sz*(ironLen/2-.25),metal,ironLegs,'Iron table leg');
box(.05,.05,ironLen-.5,ironHingeX-ironDepth+.05,.9,0,metal,ironLegs,'Iron table leg stretcher');
const ironCollider=(()=>{collision('Bedroom 3 folding iron table (open)',26.25-1.75,ironZ-ironLen/2,26.25,ironZ+ironLen/2,ironTop,'cabinet');return colliders[colliders.length-1];})();
furniture.push({name:'Bedroom 3 folding iron table',type:'table',x:26.25-1.75/2,z:ironZ,w:1.75,d:ironLen,h:ironTop});
feature('Bedroom 3 folding iron table','joinery',26.25-1.75/2,ironZ,1.75,ironLen,ironTop,'Architect plan (revised 14 Oct 2026): FOLDING IRON TABLE 5 ft x 1 ft 9 in; surface height, hinge and stowage frame are assumptions');
switchPanel('Bedroom 3 iron table socket',26.2,2.0,ironZ,-Math.PI/2,2,true);
curtain('Bedroom 3 front curtains',px(528.36),pz(951),5.6,7.9,Math.PI,.35);
art(px(446),5.0,pz(830),2.6,3,Math.PI/2,['#e8e0d1','#8297a5','#a87658']);
ac('Bedroom 3 AC',px(536),pz(708.5),0);
switchPanel('Bedroom 3 entry controls',px(446),3.7,pz(776),Math.PI/2,4);
for(const zz of [773,883])switchPanel('Bedroom 3 bedside charging',px(446),2.0,pz(zz),Math.PI/2,2,true);
ceilingLight('bedroom-3',px(552),pz(830),26);for(const [x,z] of [[478,745],[563,765],[480,914],[555,914]])downlight('bedroom-3',px(x),pz(z));fan('Bedroom 3 fan',px(499),pz(825));

function sofaRun(name,x,z,w,d,rotation=0,armStart=false,armEnd=false){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;g.name=name;building.add(g);
 rb(w,.70,d,0,.83,0,linen,g,.10,'Continuous sofa base');
 soft(w-.10,.34,d-.44,0,1.35,.15,linen,g,'Single continuous seat cushion — no seat divisions','y',.07,.42,.03);
 soft(w,1.17,.30,0,1.79,-d/2+.1,linen,g,'Continuous supportive sofa back','z',.08,.50,.03);
 if(armStart)rb(.28,1.18,d-.10,-w/2+.14,1.42,0,linen,g,.08,'Sofa end arm');
 if(armEnd)rb(.28,1.18,d-.10,w/2-.14,1.42,0,linen,g,.08,'Sofa end arm');
 return g;
}
// LIVING FINAL: 11 ft continuous main run, 4 ft 6 in connected return and
// a true 36 in seat depth. The rear faces align with the finished wall faces.
const sofaDepth=2.83,sofaX=8.395,sofaZ0=pz(451),sofaZ1=pz(627),sofaLen=sofaZ1-sofaZ0,
 returnStart=6.75,returnEnd=12.1275,returnLen=returnEnd-returnStart,
 returnX=(returnStart+returnEnd)/2,returnZ=22.655;
sofaRun('Living continuous L sofa — 11 ft main run',sofaX,(sofaZ0+sofaZ1)/2,sofaLen,sofaDepth,Math.PI/2,true,false);
sofaRun('Living continuous L sofa — return to end of AC wall',returnX,returnZ,returnLen,sofaDepth,0,false,true);
const mainBackX=sofaX-sofaDepth/2+.10,returnBackZ=returnZ-sofaDepth/2+.10;
rb(.28,1.17,sofaZ0-returnBackZ+.28,mainBackX,1.79,(returnBackZ+sofaZ0)/2,linen,building,.09,'Living continuous corner back connector');
collision('L sofa west',sofaX-sofaDepth/2,sofaZ0,sofaX+sofaDepth/2,sofaZ1,1.8,'sofa');
collision('L sofa return',returnStart,returnZ-sofaDepth/2,returnEnd,returnZ+sofaDepth/2,1.8,'sofa');
// Loose cushions echo the selected warm ivory and terracotta composition
// without dividing the single continuous seat plane.
for(const [z,m,h] of [[25.20,linen,.80],[28.35,blanket,.76],[31.55,linen,.80]]){
 const c=soft(.42,h+.55,1.55,7.52,1.95+h*.2,z,m,building,'Living loose back cushion','x',.24,.62,.05);c.rotation.z=.22;
}
soft(1.55,1.35,.42,8.30,2.10,21.78,blanket,building,'Living return accent cushion','z',.24,.62,.05).rotation.x=-.22;
soft(1.55,1.35,.42,10.05,2.10,21.78,linen,building,'Living return loose cushion','z',.24,.62,.05).rotation.x=-.22;
const sofaBoardX=6.84,sofaBoardStart=returnBackZ-.12,sofaBoardEnd=sofaZ1+1.18,
 sofaBoardLen=sofaBoardEnd-sofaBoardStart,sofaBoardZ=(sofaBoardStart+sofaBoardEnd)/2,
 returnBoardStart=6.75,returnBoardEnd=12.1275,returnBoardLen=returnBoardEnd-returnBoardStart,returnBoardX=(returnBoardStart+returnBoardEnd)/2;
box(.18,.76,sofaBoardLen,sofaBoardX,1.70,sofaBoardZ,oak,building,'Walnut sofa service band');
box(returnBoardLen,.76,.18,returnBoardX,1.70,21.10,oak,building,'Walnut sofa service band return');
box(.25,.10,sofaBoardLen,6.875,2.12,sofaBoardZ,oak,building,'Walnut sofa top plank');
box(returnBoardLen,.10,.25,returnBoardX,2.12,21.1325,oak,building,'Walnut sofa top plank return');
box(.06,.045,sofaBoardLen-.22,7.015,2.17,sofaBoardZ,warmLight,building,'Shielded sofa wall-wash LED');
box(returnBoardLen-.22,.045,.06,returnBoardX,2.17,21.2725,warmLight,building,'Shielded sofa return wall-wash LED');
sofaControlPanel('Sofa south-end charging',6.89,2.19,sofaBoardEnd-.46,Math.PI/2);
sofaControlPanel('Sofa return-end charging',returnBoardEnd-.48,2.19,21.14,0);
feature('Low illuminated sofa service plank','furniture',sofaBoardX,sofaBoardZ,.25,sofaBoardLen,2.17,'Narrow walnut plank separated from upholstery; both switch and charging panels face upward');
// The selected L1 scheme includes a large warm rug and a 42 x 20 in table.
const tableX=13.65,tableZ=29.05;
rb(7.15,.10,10.10,13.65,.075,29.05,rugMat,building,.10,'Living low-pile washable rug');
feature('Living 7 ft 2 in × 10 ft 1 in rug','furniture',13.65,29.05,7.15,10.10,.10,'Final living selection: L1 warm neutral rug');
rb(1.667,.16,3.50,tableX,1.27,tableZ,oak,building,.10,'42 × 20 in walnut centre table');
for(const xx of [-.60,.60])for(const zz of [-1.38,1.38])box(.10,1.19,.10,tableX+xx,.64,tableZ+zz,charcoal);
collision('Centre table',tableX-.834,tableZ-1.75,tableX+.834,tableZ+1.75,1.36,'table');
rb(.82,.07,1.12,tableX+.10,1.39,tableZ-.38,greige,building,.02,'Book on centre table');
cylinder(.23,.32,tableX-.28,1.48,tableZ+.72,porcelain);
// TV WALL REVISION V7: the full-height backing clears the W5 window entirely.
// Only the low console continues left to the exact window centreline.
const livingWindowStart=25.6275,livingWindowEnd=28.1325,
 tvPanelWidth=7.55,tvPanelZ=livingWindowEnd+.20+tvPanelWidth/2,
 tvUnitBottom=1.38,tvUnitTop=9.95,tvUnitHeight=tvUnitTop-tvUnitBottom,
 tvConsoleLeft=(livingWindowStart+livingWindowEnd)/2,tvConsoleRight=36.10,
 tvConsoleWidth=tvConsoleRight-tvConsoleLeft,tvConsoleZ=(tvConsoleLeft+tvConsoleRight)/2;
box(.10,tvUnitHeight,tvPanelWidth,19.12,(tvUnitBottom+tvUnitTop)/2,tvPanelZ,tvStone,building,'Living TV ceiling-height warm stone backing panel');
for(const zz of [tvPanelZ-tvPanelWidth/2+.14,tvPanelZ+tvPanelWidth/2-.14]){
 for(let z=zz-.25;z<=zz+.25;z+=.10)box(.12,tvUnitHeight,.045,18.97,(tvUnitBottom+tvUnitTop)/2,z,oak,building,'Living TV ceiling-height fluted walnut side band');
}
cabinet('Living TV floating console with hidden ventilated service bays',px(490.38),tvConsoleZ,tvConsoleWidth,1.25,1.38,-Math.PI/2,oak,true);
box(.07,.30,1.18,17.96,.82,tvConsoleLeft+.55,charcoal,building,'TV console concealed ventilation grille');
box(.07,.30,1.18,17.96,.82,tvConsoleRight-.55,charcoal,building,'TV console concealed ventilation grille');
box(.045,.045,tvConsoleWidth-.40,17.92,.23,tvConsoleZ,warmLight,building,'TV console shielded underlight');
tv('Living 75 inch TV — raised 1 ft',px(479.4),tvPanelZ,5.45,-Math.PI/2,5.0);
botanicalArt(6.79,5.30,27.00,2.30,3.25,Math.PI/2,'#bd7654');
botanicalArt(6.79,5.18,30.72,1.85,2.80,Math.PI/2,'#c38a67');
feature('Living TV concealed service route','electrical',18.35,tvConsoleZ,tvConsoleWidth,1.25,1.38,'Full-height backing clears W5; console reaches window centreline; removable ventilated bays; two 32 mm conduits; IR repeater; 75 inch screen');
// 27 Oct 2026 (R-013, user instruction): the 2.7 ft potted plant in front of the main door D6 was removed.
ac('Living AC — centred on left wall',9.44,21.10,0);
switchPanel('Living entry controls — below W5',19.06,2.15,(livingWindowStart+livingWindowEnd)/2,-Math.PI/2,5);
switchPanel('Living TV power/data',px(498.7),1.1,tvPanelZ,-Math.PI/2,4,true);
ceilingLight('living',px(405),pz(525),34);ceilingLight('living',px(406),pz(629),28);
for(const [x,z] of [[350,476],[468,476],[350,596],[468,646]])downlight('living',px(x),pz(z));fan('Living fan',px(406),pz(552));

function tap(x,y,z,rotation=0,parent=building,finish=metal){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);cylinder(.065,.055,0,.028,0,finish,g);lineTube([[0,.04,0],[0,.43,0],[0,.59,.16],[0,.48,.35]],.04,finish,g);box(.18,.035,.08,.12,.12,.03,finish,g,'Lever tap handle');g.updateWorldMatrix(true,false);const v=g.getWorldPosition(new T.Vector3());feature('Single lever mixer tap','tap',v.x,v.z,.4,.4,v.y+.59);return g;}
function basin(name,x,z,w,d,y=3,rotation=0,kitchen=false,parent=building,tapFinish=metal){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);g.name=name;
 const m=kitchen?metal:white;
 // The basin is a real recessed bowl with an open centre and drain, not a solid block.
 worktop(w,d,0,g,[[0,0,w-.16,d-.16]],0,0,'Open sink rim',m,.04);
 rb(w-.22,.06,d-.22,0,-.22,0,m,g,.10,'Sink bowl bottom');
 box(w-.13,.23,.055,0,-.10,-d/2+.09,m,g,'Bowl rear');box(w-.13,.23,.055,0,-.10,d/2-.09,m,g,'Bowl front');
 box(.055,.23,d-.19,-w/2+.09,-.10,0,m,g,'Bowl side');box(.055,.23,d-.19,w/2-.09,-.10,0,m,g,'Bowl side');
 cylinder(.065,.015,0,-.18,0,metal,g);tap(0,.025,-d/2+.12,0,g,tapFinish);feature(name,'sink',x,z,w,d,y,'Architect plan: sink position; fixture design proposed');return g;
}
function fridge(x,z){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.PI/2;building.add(g);g.name='Kitchen refrigerator';
 // R-014: cabinet body with separate doors, a dark gasket line between them, bar handles on stand-offs, a toe-kick grille and top hinge caps.
 rb(2.25,6.24,1.93,0,3.16,-.06,metal,g,.05,'Standard refrigerator');
 rb(2.21,1.66,.10,0,5.47,.96,metal,g,.025,'Freezer door');rb(2.21,4.16,.10,0,2.55,.96,metal,g,.025,'Fridge door');
 box(2.17,.035,.06,0,4.635,.92,black,g,'Fridge door gasket gap');box(2.1,.05,.05,0,6.31,.92,charcoal,g,'Fridge top hinge cover');
 for(const [y0,len] of [[3.05,1.25],[4.95,.62]]){const h=cylinder(.026,len,.90,y0+len/2,1.10,metal,g);h.name='Fridge bar handle';for(const yy of [y0+.08,y0+len-.08])box(.05,.05,.10,.90,yy,1.04,metal,g,'Handle stand-off');}
 box(.36,.20,.012,-.62,4.05,1.017,black,g,'Fridge door display');for(let i=0;i<3;i++)box(.05,.02,.004,-.72+i*.10,4.05,1.025,warmLight,g,'Display segment');
 box(2.05,.40,.05,0,.24,.90,charcoal,g,'Fridge toe-kick grille');for(let i=0;i<9;i++)box(1.9,.014,.02,0,.08+i*.04,.93,black,g,'Grille slat');
 collision('Refrigerator',x-1.05,z-1.18,x+1.05,z+1.18,6.4,'appliance');feature('Refrigerator','appliance',x,z,2.1,2.35,6.4,'Architect plan: fridge position; standard appliance proposed');}

function exhaust(x,y,z,size=1,rotation=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;building.add(g);box(size,size,.10,0,0,0,white,g,'Exhaust fan frame');const c=new T.Mesh(new T.CircleGeometry(size*.38,24),charcoal);c.position.z=.06;g.add(c);for(let i=0;i<5;i++){const o=new T.Mesh(new T.CircleGeometry(size*.16,12),trim);o.scale.set(1,.55,1);o.rotation.z=i*Math.PI*2/5;o.position.set(Math.cos(i*Math.PI*2/5)*size*.16,Math.sin(i*Math.PI*2/5)*size*.16,.07);g.add(o);}for(let i=-4;i<=4;i++)box(size*.85,.015,.015,0,i*size*.075,.09,metal,g,'Exhaust grille');feature('Exhaust fan','ventilation',x,z,size,.13,y);}


function chair(x,z,rotation=0,label='Dining chair'){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;building.add(g);rb(1.4,.18,1.45,0,1.48,0,linen,g,.06,label+' cushion');rb(1.4,1.22,.17,0,2.13,-.66,linen,g,.11,label+' supportive back');for(const xx of [-.54,.54])for(const zz of [-.53,.53])box(.09,1.4,.09,xx,.72,zz,oak,g);collision(label,x-.7,z-.73,x+.7,z+.73,2.65,'chair');}
// Approved kitchen, 14 September 2026. Architecture comes from unchanged plan-data.
// Cabinet/appliance dimensions are concept dimensions in feet, not a shop drawing.
const kitchenSand=mat('Kitchen matte sand laminate','#d0b48d',1,0,{...pbr(TX.suede,.5),bevel:true});
const K={counterTop:2.96,cabinetTop:2.91,plinth:.20,depth:2.25,
 wallBottom:5.10,tier:8.25,ceiling:10,wallDepth:1.20,
 windowStart:6.1275,windowEnd:10.3725,windowMullion:8.25,
 counterStart:.75,counterEnd:15.375,back:49.2525,front:47.0025,
 westStart:pz(711),westEnd:pz(826.92),sinkCentre:pz(755.6),sinkWidth:3.30};
K.sinkStart=K.sinkCentre-K.sinkWidth/2;K.sinkEnd=K.sinkCentre+K.sinkWidth/2;
K.cornerEnd=4.55;K.hoodStart=3;K.hoodEnd=K.windowStart;
K.hobCentre=(K.hoodStart+K.hoodEnd)/2;
const kitchenModules=[];
function kitchenCase(name,x,z,w,d,bottom,top,rotation,finish,shelves=0){
 const g=new T.Group();g.name=name;g.position.set(x,bottom,z);g.rotation.y=rotation;building.add(g);
 const h=top-bottom,t=.055;
 for(const side of [-1,1])box(t,h,d,side*(w/2-t/2),h/2,0,finish,g,'Cabinet carcass side');
 box(w-.11,h,.045,0,h/2,-d/2+.025,finish,g,'Cabinet back');
 for(const yy of [.0275,h-.0275])box(w-.11,.055,d,0,yy,0,finish,g,'Carcass horizontal');
 for(let i=1;i<=shelves;i++)box(w-.11,.055,d-.10,0,h*i/(shelves+1),0,ivory,g,'Fixed internal shelf');
 if(bottom===0){box(w-.12,.20,d-.16,0,.10,-.06,charcoal,g,'Recessed plinth');
  const az=Math.abs(Math.sin(rotation))>.5;collision(name,x-(az?d:w)/2,z-(az?w:d)/2,x+(az?d:w)/2,z+(az?w:d)/2,top,'cabinet');
  furniture.push({name,type:'cabinet',x,z,w:az?d:w,d:az?w:d,h:top});}
 g.userData={kitchen:true,width:w,depth:d,bottom,top,shelves,role:name};kitchenModules.push(g);
 kitchenStorage.push({name,type:'cupboard',width:w,bounds:new T.Box3().setFromObject(g).min.toArray().concat(new T.Box3().setFromObject(g).max.toArray()),shelves,ceilingHeight:top===10});
 return g;
}
function plainFront(g,w,h,d,finish=kitchenSand,xx=0,yy=0){
 const f=new T.Group();f.name='Closed cabinet shutter';f.position.set(xx,yy,d/2+.025);g.add(f);
 box(w-.022,h-.022,.06,0,h/2,0,finish,f,'Uniform cabinet shutter');
 box(.40,.035,.075,0,.20,.065,metal,f,'Silver horizontal handle');return f;
}
function liftFront(g,w,h,d,finish=kitchenSand,label='Single lift-up shutter'){
 const hinge=new T.Group();hinge.name=label+' top hinge';hinge.position.set(0,h,d/2+.025);g.add(hinge);
 box(w-.022,h-.022,.06,0,-h/2,0,finish,hinge,label);
 box(.40,.035,.075,0,-h+.20,.065,metal,hinge,'Lift-up handle');
 for(const side of [-1,1]){box(.09,.10,.12,side*(w/2-.12),h-.10,d/2-.04,metal,g,'Lift hinge');
  lineTube([[side*(w/2-.10),h*.58,d/2-.14],[side*(w/2-.10),h-.12,d/2-.07]],.017,metal,g).name='Lift support arm';}
 kitchenDoorPivots.push({hinge,openAngle:-Math.PI*.34,axis:'x',name:label});g.userData.frontCount=1;g.userData.opening='lift-up';return hinge;
}
function sideFront(g,w,h,d,finish,xx=0,side=-1,label='Side-hinged shutter',inspect=false){
 const hinge=new T.Group();hinge.name=label+' hinge';hinge.position.set(xx+side*w/2,0,d/2+.025);g.add(hinge);
 box(w-.022,h-.022,.06,-side*w/2,h/2,0,finish,hinge,label);
 box(.40,.035,.075,-side*w/2,.21,.065,metal,hinge,'Silver horizontal handle');
 for(const yy of [.35,h-.35])box(.065,.09,.10,xx+side*(w/2-.06),yy,d/2-.025,metal,g,'Concealed hinge');
 if(inspect)kitchenDoorPivots.push({hinge,openAngle:side*Math.PI*.53,axis:'y',name:label});
 return hinge;
}
function drawerBay(name,x,z,w,rotation,finish){
 const g=kitchenCase(name,x,z,w,K.depth,0,K.cabinetTop,rotation,finish);
 const levels=[K.plinth,1.305,2.41,K.cabinetTop];
 for(let i=0;i<3;i++){const y0=levels[i],y1=levels[i+1];
  box(w-.022,y1-y0-.022,.06,0,(y0+y1)/2,K.depth/2+.025,finish,g,'Drawer tier '+(3-i));
  box(.43,.035,.075,0,(y0+y1)/2+.08,K.depth/2+.09,metal,g,'Drawer handle');
  box(w-.15,.08,K.depth-.14,0,y0+.06,0,ivory,g,'Internal drawer bottom');
 }
 g.userData.drawerLevels=levels;g.userData.frontCount=3;return g;
}
function overhead(name,x,z,w,rotation,bottom=K.wallBottom,top=K.tier,shelves=1,fronts=1){
 const g=kitchenCase(name,x,z,w,K.wallDepth,bottom,top,rotation,kitchenSand,shelves);
 for(let i=0;i<fronts;i++)plainFront(g,w/fronts,top-bottom,K.wallDepth,kitchenSand,-w/2+w/fronts*(i+.5));
 g.userData.frontCount=fronts;return g;
}
const kc=px(222.36),windowZ=K.back-K.depth/2,wallZ=K.back-K.wallDepth/2,wallX=.75+K.wallDepth/2;
// Window wall: two light bays, one wide unsplit walnut bay, hob bay, corner door.
const lightW=(K.counterEnd-K.windowEnd)/2;
for(let i=0;i<2;i++)drawerBay('Window wall light drawer bay '+(i+1),K.windowEnd+lightW*(i+.5),windowZ,lightW,Math.PI,kitchenSand);
drawerBay('Window wall single wide walnut drawer bay',(K.windowStart+K.windowEnd)/2,windowZ,K.windowEnd-K.windowStart,Math.PI,oak);
drawerBay('Window wall narrow hob drawer bay',(K.cornerEnd+K.windowStart)/2,windowZ,K.windowStart-K.cornerEnd,Math.PI,oak);
// One fixed shelf inside the blind L corner, accessed only under the hob.
const corner=new T.Group();corner.name='Window wall blind corner storage';building.add(corner);
box(K.cornerEnd-.75,.055,K.depth,(K.cornerEnd+.75)/2,.24,windowZ,ivory,corner,'Corner cabinet base');
box(K.cornerEnd-.75,.055,K.depth-.10,(K.cornerEnd+.75)/2,1.50,windowZ,ivory,corner,'Single fixed corner shelf');
for(const x of [.75,K.cornerEnd])box(.055,2.71,K.depth,x,1.55,windowZ,oak,corner,'Corner cabinet side');
box(K.cornerEnd-.75,2.71,.05,(K.cornerEnd+.75)/2,1.55,K.back-.025,oak,corner,'Corner cabinet back');
box(K.cornerEnd-.75,.20,K.depth-.14,(K.cornerEnd+.75)/2,.10,windowZ+.06,charcoal,corner,'Corner recessed plinth');
// The hidden end panel meets the RO drawer carcass. No internal panel blocks
// reaching sideways into the blind corner from the door beneath the hob.
box(2.25,2.71,.05,1.875,1.55,K.front+.025,oak,corner,'Fixed end behind RO drawers');
const cornerGate=new T.Group();cornerGate.name='Corner access front on window wall';cornerGate.position.set((3+K.cornerEnd)/2,0,windowZ);cornerGate.rotation.y=Math.PI;building.add(cornerGate);
sideFront(cornerGate,K.cornerEnd-3,2.71,K.depth,oak,0,-1,'Corner access door beneath hob',true).position.y=.20;
corner.userData={kitchen:true,shelves:1,accessWall:'window',mechanism:'fixed shelf',bounds:[.75,K.front,K.cornerEnd,K.back]};kitchenModules.push(corner);
collision('Blind corner cabinet',.75,K.front,K.cornerEnd,K.back,2.91,'cabinet');
// RO wall: light drawers, double sink cupboard, walnut drawers. No drawer under a bowl.
drawerBay('RO wall light drawer bay',kc,(K.westStart+K.sinkStart)/2,K.sinkStart-K.westStart,Math.PI/2,kitchenSand);
drawerBay('RO wall walnut drawer bay',kc,(K.sinkEnd+K.westEnd)/2,K.westEnd-K.sinkEnd,Math.PI/2,oak);
const sinkBase=kitchenCase('Double sink two-door base cupboard',kc,K.sinkCentre,K.sinkWidth,K.depth,0,2.91,Math.PI/2,oak);
sinkBase.remove(sinkBase.children.find(o=>o.name==='Carcass horizontal'&&o.position.y>2.8));
sideFront(sinkBase,K.sinkWidth/2,2.71,K.depth,oak,-K.sinkWidth/4,-1,'Left sink cupboard door').position.y=.20;
sideFront(sinkBase,K.sinkWidth/2,2.71,K.depth,oak,K.sinkWidth/4,1,'Right sink geyser service door',true).position.y=.20;
sinkBase.userData.frontCount=2;sinkBase.userData.drawers=0;
worktop(K.counterEnd-.75,K.depth,2.96,building,[],(K.counterEnd+.75)/2,windowZ,'Continuous window-wall granite');
worktop(K.depth,K.westEnd-K.westStart,2.96,building,[[0,K.sinkCentre-(K.westEnd+K.westStart)/2,1.47,K.sinkWidth-.14]],kc,(K.westEnd+K.westStart)/2,'RO-wall granite with double-sink aperture');
const doubleSink=new T.Group();doubleSink.name='Equal-width double bowl sink';doubleSink.position.set(kc,K.counterTop+.075,K.sinkCentre);doubleSink.rotation.y=Math.PI/2;building.add(doubleSink);
const bowlWidth=(K.sinkWidth-.22)/2,centre=(bowlWidth+.04)/2;
const bowlSteel=mat('Recessed brushed sink steel','#52616a',.44,.65);
worktop(K.sinkWidth,1.61,0,doubleSink,[[-centre,0,bowlWidth,1.43],[centre,0,bowlWidth,1.43]],0,0,'Double-bowl stainless rim',metal,.035);
for(const xx of [-centre,centre]){
 box(bowlWidth-.06,.035,1.37,xx,-.62,0,bowlSteel,doubleSink,'Recessed bowl bottom');
 for(const zz of [-.715,.715])box(bowlWidth,.62,.035,xx,-.30,zz,bowlSteel,doubleSink,'Sink bowl wall');
 for(const dx of [-bowlWidth/2,bowlWidth/2])box(.035,.62,1.43,xx+dx,-.30,0,bowlSteel,doubleSink,'Sink bowl side');
 cylinder(.065,.025,xx,-.595,0,metal,doubleSink).name='Sink drain strainer';
 lineTube([[xx,-.64,0],[xx,-1.0,0],[xx,-1.28,-.38],[0,-1.30,-.48],[0,-1.8,-.55]],.035,metal,doubleSink).name='Sink waste and trap';
}
box(.07,.06,1.55,0,-.01,0,metal,doubleSink,'Double-sink centre divider');
tap(0,.025,-.72,0,doubleSink).scale.y=1.65;doubleSink.userData={kitchen:true,bowls:2,width:K.sinkWidth};
feature('Double-bowl kitchen sink','sink',kc,K.sinkCentre,1.61,K.sinkWidth,2.96,'Approved kitchen image, sink centre retained');
// Compact mini geyser is behind the RIGHT sink door, separated from waste traps.
const geyser=new T.Group();geyser.name='Hidden mini geyser beneath right sink bowl';geyser.position.set(K.sinkWidth/4,1.20,-.06);sinkBase.add(geyser);
rb(.66,.91,.45,0,0,0,white,geyser,.07,'Mini geyser body');
cylinder(.09,.025,0,.08,.242,metal,geyser).rotation.x=Math.PI/2;
for(const [xx,m] of [[-.18,mat('Geyser hot marker','#b34839')],[.18,mat('Geyser cold marker','#397fa0')]]){
 box(.10,.06,.10,xx,-.47,.10,m,geyser,'Service connection marker');
 lineTube([[xx,-.44,.10],[xx,-.65,.10],[xx,-.72,-.25],[xx,-.72,-.60]],.026,metal,geyser).name='Geyser service hose';
 box(.10,.065,.06,xx,-.72,-.60,metal,geyser,'Isolation valve');}
feature('Hidden kitchen mini geyser','appliance',kc+.15,K.sinkCentre-K.sinkWidth/4,.45,.66,1.65,'Right sink base service cupboard');
fridge(px(220.6),pz(686.8));
// Continuous backsplash on RO wall; source window openings stay open.
box(.04,K.wallBottom-3.03,K.westEnd-K.westStart,.77,(K.wallBottom+3.03)/2,(K.westEnd+K.westStart)/2,bathStone);
box(K.counterEnd-.75,.40,.04,(K.counterEnd+.75)/2,3.25,K.back-.025,bathStone);
box(K.hoodEnd-K.hoodStart,K.wallBottom-3.5,.04,K.hobCentre,(K.wallBottom+3.5)/2,K.back-.025,bathStone);
// Rack and full sink share exactly ONE model width and the same centreline.
const rack=kitchenCase('Sink-width concealed drying rack',wallX,K.sinkCentre,K.sinkWidth,K.wallDepth,K.wallBottom,K.tier,Math.PI/2,kitchenSand);
liftFront(rack,K.sinkWidth,K.tier-K.wallBottom,K.wallDepth,kitchenSand,'Single full-width drying rack shutter');
for(const y of [.30,1.35]){
 for(const zz of [-.43,.43])box(K.sinkWidth-.18,.025,.025,0,y,zz,metal,rack,'Drying rack horizontal rail');
 for(let x=-K.sinkWidth/2+.13;x<K.sinkWidth/2-.1;x+=.14)box(.018,.018,.86,x,y,0,metal,rack,'Drying rack stainless grid');
 for(const side of [-1,1])box(.022,.21,.84,side*(K.sinkWidth/2-.13),y+.10,0,metal,rack,'Drying rack side rail');
}
box(K.sinkWidth-.16,.04,1.05,0,.11,0,metal,rack,'Accessible drip tray');
for(let i=0;i<10;i++){const plate=cylinder(.33,.024,-1.25+i*.235,1.71,-.04,i<7?white:charcoal,rack);plate.rotation.z=Math.PI/2;plate.name='Plate in drying rack';}
for(let i=0;i<6;i++)cylinder(.12,.27,-.95+i*.34,.46,.04,i<3?white:glass,rack).name='Cup in drying rack';
rack.userData.sinkWidth=K.sinkWidth;rack.userData.alignedCentre=K.sinkCentre;
// Adjacent RO is behind a shutter with a genuine dispensing cutout.
const roW=K.sinkStart-K.westStart,roZ=(K.sinkStart+K.westStart)/2;
const ro=kitchenCase('Hidden RO with direct tap opening',wallX,roZ,roW,K.wallDepth,K.wallBottom,K.tier,Math.PI/2,kitchenSand);
const gate=new T.Group();gate.name='RO shutter with dispensing cutout';gate.position.z=K.wallDepth/2+.025;ro.add(gate);
const roShape=new T.Shape();roShape.moveTo(-roW/2+.011,.011);roShape.lineTo(roW/2-.011,.011);roShape.lineTo(roW/2-.011,K.tier-K.wallBottom-.011);roShape.lineTo(-roW/2+.011,K.tier-K.wallBottom-.011);roShape.closePath();
const opening=new T.Path();opening.moveTo(-.30,.16);opening.lineTo(-.30,1.20);opening.lineTo(.30,1.20);opening.lineTo(.30,.16);opening.closePath();roShape.holes.push(opening);
const gateGeo=new T.ExtrudeGeometry(roShape,{depth:.06,bevelEnabled:false});gateGeo.translate(0,0,-.03);mesh(gateGeo,kitchenSand,gate,'Cutout-access RO cupboard gate');
box(.32,.035,.075,0,1.47,.065,metal,gate,'RO service shutter handle');
rb(Math.max(.65,roW-.12),1.15,.46,0,2.05,-.10,white,ro,.05,'Concealed RO purifier body');
for(const xx of [-.20,0,.20])cylinder(.09,.65,xx,1.17,-.11,white,ro).name='RO filter cartridge';
box(.65,1.07,.03,0,.68,.05,charcoal,ro,'RO dispensing recess back');
box(.58,.035,.44,0,.175,.33,metal,ro,'RO removable drip tray');
lineTube([[0,1.16,.13],[0,1.04,.50],[0,.89,.50]],.025,metal,ro).name='Built-in RO dispensing spout';
box(.05,.13,.04,.06,1.10,.50,metal,ro,'RO tap lever');cylinder(.105,.32,0,.36,.44,glass,ro).name='Glass at RO tap';
ro.userData.cutout={width:.60,height:1.04};ro.userData.directTap=true;
feature('RO tap behind access cutout','tap',wallX+.55,roZ,.60,.44,K.wallBottom+1.16);
// Loft gates aligned with the base/upper modules, all the way to the ceiling.
overhead('RO wall walnut-bay upper cupboard',wallX,(K.sinkEnd+K.westEnd)/2,K.westEnd-K.sinkEnd,Math.PI/2);
for(const [name,c,w,fronts] of [['RO loft',roZ,roW,1],['Rack loft',K.sinkCentre,K.sinkWidth,2],['Cookware loft',(K.sinkEnd+K.westEnd)/2,K.westEnd-K.sinkEnd,1]])overhead(name,wallX,c,w,Math.PI/2,K.tier,10,1,fronts);
const fridgeZ=pz(686.8);overhead('Fridge upper storage',wallX,fridgeZ,2.30,Math.PI/2,6.88,K.tier,1,2);
overhead('Fridge ceiling loft',wallX,fridgeZ,2.30,Math.PI/2,K.tier,10,1,2);
overhead('RO corner upper cupboard',wallX,(K.westEnd+48.0525)/2,48.0525-K.westEnd,Math.PI/2);
overhead('RO corner loft',wallX,(K.westEnd+48.0525)/2,48.0525-K.westEnd,Math.PI/2,K.tier,10);
overhead('Window corner upper storage',2.475,wallZ,1.05,Math.PI);
overhead('Window corner loft',2.475,wallZ,1.05,Math.PI,K.tier,10);
// Chimney front: one lower lift-up gate and one upper loft gate.
const hoodW=K.hoodEnd-K.hoodStart;
const hood=kitchenCase('Concealed chimney single-lift cabinet',K.hobCentre,wallZ,hoodW,K.wallDepth,K.wallBottom,K.tier,Math.PI,kitchenSand);
hood.remove(hood.children.find(o=>o.name==='Carcass horizontal'&&o.position.y<.1));
worktop(hoodW-.11,K.wallDepth,.02,hood,[[0,0,hoodW-.25,1.0]],0,0,'Open extractor intake surround',metal,.03);
liftFront(hood,hoodW,K.tier-K.wallBottom,K.wallDepth,kitchenSand,'Single chimney lift-up shutter');
overhead('Single chimney loft gate',K.hobCentre,wallZ,hoodW,Math.PI,K.tier,10,0,1);
box(hoodW-.18,.20,1.05,0,.12,0,metal,hood,'Concealed extractor body');
box(hoodW-.25,.03,1.0,0,-.035,0,charcoal,hood,'Chimney grease grille');
for(let i=0;i<16;i++)box(.025,.02,.86,-hoodW/2+.20+i*(hoodW-.40)/15,-.055,0,metal,hood,'Chimney filter baffle');
for(const xx of [-hoodW/2+.22,hoodW/2-.22])cylinder(.065,.02,xx,-.06,.32,warmLight,hood).name='Hood task lamp';
lineTube([[0,.22,-.30],[0,2.2,-.36],[0,3.9,-.36]],.18,metal,hood).name='Concealed chimney duct';
// Exhaust service shutter occupies ONLY the right window pane in the kitchen view.
const exhaustWidth=K.windowMullion-K.windowStart,exhaustX=(K.windowMullion+K.windowStart)/2;
const exhaustGate=kitchenCase('Right-window-pane exhaust service cupboard',exhaustX,wallZ,exhaustWidth,K.wallDepth,K.tier,10,Math.PI,kitchenSand);
const ef=plainFront(exhaustGate,exhaustWidth,10-K.tier,K.wallDepth);
ef.children.find(o=>o.name==='Silver horizontal handle').position.y=1.43;
box(exhaustWidth-.25,.81,.08,0,.66,.08,charcoal,ef,'Exhaust grille within pane-width service shutter');
for(let i=0;i<10;i++)box(exhaustWidth-.38,.017,.035,0,.32+i*.073,.132,metal,ef,'Exhaust horizontal grille slat');
exhaustGate.userData.serviceSpan=[K.windowStart,K.windowMullion];exhaustGate.userData.frontCount=1;
overhead('Other window-pane loft',(K.windowMullion+K.windowEnd)/2,wallZ,K.windowEnd-K.windowMullion,Math.PI,K.tier,10);
// W8 is retained: only lofts above its head, no cabinet may cover its glazing.
overhead('Between-window upper cabinets',11.4975,wallZ,2.25,Math.PI,K.wallBottom,K.tier,1,2);
overhead('Between-window lofts',11.4975,wallZ,2.25,Math.PI,K.tier,10,1,2);
overhead('W8 ceiling lofts',13.81125,wallZ,2.3775,Math.PI,K.tier,10,0,2);
// Standard four-burner 2x2 hob, aligned exactly beneath the chimney.
const gas=new T.Group();gas.name='Four burner modular hob';gas.position.set(K.hobCentre,3.055,windowZ);gas.rotation.y=Math.PI;building.add(gas);
rb(2.50,.09,1.55,0,0,0,black,gas,.045,'Four burner black-glass hob');
for(const [xx,zz] of [[-.68,-.39],[.68,-.39],[-.68,.32],[.68,.32]]){
 const burner=new T.Group();burner.name='Gas burner';burner.position.set(xx,.06,zz);gas.add(burner);
 cylinder(.22,.035,0,0,0,metal,burner);cylinder(.16,.06,0,.06,0,charcoal,burner);
 for(const a of [0,Math.PI/2])box(.045,.055,.58,0,.14,0,charcoal,burner).rotation.y=a;
}
for(const xx of [-.48,-.16,.16,.48])cylinder(.055,.04,xx,.07,.64,metal,gas).name='Hob control knob';
gas.userData={kitchen:true,burners:4,centre:K.hobCentre};feature('Four burner gas hob','appliance',K.hobCentre,windowZ,2.5,1.55,3.2);
// A few countertop accessories reflect the accepted render, leaving the prep run clear.
const kitchenDecor=new T.Group();kitchenDecor.name='Kitchen countertop accessories';kitchenDecor.position.y=3.0;building.add(kitchenDecor);
plant(8.8,48.85,.85,kitchenDecor);plant(1.50,40.2,.75,kitchenDecor);
for(const [x,z,h] of [[11.2,48.85,.6],[11.8,48.85,.45],[2.6,45.6,.45]]){
 cylinder(.15,h,x,h/2,z,white,kitchenDecor).name='Kitchen sealed canister';
 cylinder(.16,.04,x,h+.02,z,oak,kitchenDecor).name='Canister lid';}
rb(.68,1.08,.065,11.95,.54,49.06,oak,kitchenDecor,.08,'Chopping board');
cylinder(.18,.50,11.0,.25,48.9,white,kitchenDecor).name='Spoon utensil holder';
for(let i=0;i<4;i++){lineTube([[10.9+i*.055,.30,48.9],[10.9+i*.055,.84,48.9]],.018,oak,kitchenDecor).name='Wooden spoon handle';sphere(.10,.16,.025,10.9+i*.055,.89,48.9,oak,kitchenDecor).name='Wooden spoon head';}
cylinder(.20,.46,1.25,.23,40.30,porcelain,kitchenDecor).name='Kitchen lidded pot';
// Warm task lighting with sources under the cabinets; no sun at night.
box(.055,.025,K.westEnd-K.westStart,1.95,K.wallBottom-.04,(K.westEnd+K.westStart)/2,warmLight,building,'RO-wall continuous under-cabinet LED');
box(2.25,.025,.055,11.4975,K.wallBottom-.04,48.045,warmLight,building,'Window-wall prep LED');
for(const [z,power] of [[roZ,6],[K.sinkCentre,9],[(K.sinkEnd+K.westEnd)/2,7]]){
 const l=new T.PointLight('#ffe2b9',power,4.5,2);l.position.set(2.03,5.0,z);building.add(l);roomLights.push({room:'kitchen',light:l,power});}
const hl=new T.PointLight('#ffe2b9',7,4.4,2);hl.position.set(K.hobCentre,5.0,47.95);building.add(hl);roomLights.push({room:'kitchen',light:hl,power:7});
for(const zz of [733,787])switchPanel('Kitchen switched worktop socket',px(205.4),4.3,pz(zz),Math.PI/2,2,true);
switchPanel('Fridge isolator',px(205.4),6.7,pz(712),Math.PI/2,2,true);
switchPanel('Chimney service isolator',K.hobCentre,7.1,49.10,Math.PI,1,true);
switchPanel('Kitchen entry controls',px(431),3.7,pz(861.1),Math.PI,4);
ceilingLight('kitchen',px(317),pz(788),32);for(const [x,z] of [[248,747],[360,788],[390,830]])downlight('kitchen',px(x),pz(z));
// Dining table/chairs/pendants and the living-to-kitchen handwash removed as approved.
function kitchenQA(){
 building.updateWorldMatrix(true,true);
 const cornerRay=new T.Raycaster(new T.Vector3(4,1.8,48),new T.Vector3(-1,0,0)).intersectObjects(corner.children,true);
 const w7=P.walls.flatMap(w=>w.openings).find(o=>o.id==='W7');
 const near=(a,b)=>Math.abs(a-b)<.000001;
 return {version:'approved kitchen 2026-09-14',dimensions:'feet, provisional cabinet dimensions',checks:{
  windowAndExhaustBoundary:near(K.windowStart,w7.start)&&near(K.windowEnd,w7.end)&&near(exhaustGate.userData.serviceSpan[0],w7.start)&&near(exhaustGate.userData.serviceSpan[1],(w7.start+w7.end)/2),
  hoodClearsWindow:near(K.hoodEnd,w7.start),singleLiftUpHood:hood.userData.frontCount===1&&hood.userData.opening==='lift-up',
  hobUnderHood:near(gas.position.x,hood.position.x),fourBurners:gas.children.filter(o=>o.name==='Gas burner').length===4,
  twoSinkBowls:doubleSink.userData.bowls===2,rackExactlySinkWidth:near(rack.userData.width,doubleSink.userData.width),
  rackCentredOverSink:near(rack.position.z,doubleSink.position.z),noDrawersUnderSink:sinkBase.userData.drawers===0&&sinkBase.userData.frontCount===2,
  sinkBaysHaveNoOverlap:near(K.westStart+(K.sinkStart-K.westStart),K.sinkStart)&&near(K.sinkEnd+(K.westEnd-K.sinkEnd),K.westEnd),
  fixedCornerShelf:corner.userData.shelves===1&&corner.userData.accessWall==='window',blindCornerReachUnblocked:cornerRay.length>0&&cornerRay[0].point.x<1,
  RODirectTapCutout:ro.userData.directTap===true,
  geyserInSinkCupboard:geyser.parent===sinkBase,tenFootCeiling:K.ceiling===10,
  equalDrawerTierHeights:kitchenModules.filter(g=>g.userData.drawerLevels).every(g=>JSON.stringify(g.userData.drawerLevels)===JSON.stringify([.20,1.305,2.41,2.91])),
  noDiningOrHandwash:!furniture.some(f=>/dining|handwash/i.test(f.name))&&!fixtures.some(f=>/dining pendant|handwash basin/i.test(f.name))},
  sinkSurfaceHits:[-centre,centre].map(zz=>new T.Raycaster(new T.Vector3(kc,3.2,K.sinkCentre+zz),new T.Vector3(0,-1,0)).intersectObjects(building.children,true).slice(0,4).map(hit=>({name:hit.object.name,y:hit.point.y}))),
  modules:kitchenModules.map(g=>({name:g.name,...g.userData})),hinges:kitchenDoorPivots.map(p=>({name:p.name,axis:p.axis,angle:p.openAngle})),
  limitations:['Concept appliance sizes and door openings need manufacturer/site coordination','Visual lighting simulation, not a lux calculation','All traced source windows, walls, columns and shafts retained']};
}

const store=new T.Group();building.add(store);store.name='Store shelves at architect alcove';
for(let i=0;i<5;i++){box(5.4,.08,1.0,px(249),1.25+i*1.32,pz(630.9),greige,store,'Store shelf');for(let j=0;j<4;j++){const xx=px(217)+j*1.22;rb(.95,.69,.78,xx,1.64+i*1.32,pz(632),ivory,store,.04,'Sealed pantry container');box(.96,.06,.79,xx,2.00+i*1.32,pz(632),oak,store,'Container lid');box(.32,.15,.008,xx,1.67+i*1.32,pz(632)+.397,white,store,'Container label');}}
ceilingLight('store',px(266),pz(645),12);
// Practical P1/P3 hybrid. Four fluted-glass leaves close the shrine zone; paired
// leaves fold and park inside side pockets without projecting into circulation.
// The full-width diya tray and both storage drawers remain below the door line.
const poojaX=px(466.4),poojaZ=pz(691.9),poojaW=3.50,poojaD=1.125,poojaH=7.0;
const pooja=new T.Group();pooja.name='Final retractable-door pooja unit';pooja.position.set(poojaX,0,poojaZ);pooja.rotation.y=Math.PI;building.add(pooja);
box(poojaW,.16,poojaD,0,.08,0,charcoal,pooja,'Recessed ventilated plinth');
for(const sx of [-1,1])box(.08,poojaH-.18,poojaD,sx*(poojaW/2-.04),poojaH/2+.09,0,oak,pooja,'Pooja outer side');
box(poojaW-.16,poojaH-.22,.055,0,poojaH/2+.10,-poojaD/2+.03,tvStone,pooja,'Non-combustible pooja back liner');
// A deep lower drawer takes bulky puja supplies; the shallower upper drawer keeps
// daily cotton, matchbox and cleaning cloth accessible without bending as far.
for(const [yy,hh,label] of [[.63,.80,'Deep puja supply drawer'],[1.48,.66,'Daily-use puja drawer']]){box(poojaW-.18,hh,.07,0,yy,poojaD/2+.04,oak,pooja,label);box(.62,.045,.08,0,yy+.02,poojaD/2+.09,brass,pooja,'Pooja drawer pull');}
// Full cabinet-width, independently accessible tray on heavy-duty full-extension
// runners. The raised perimeter contains oil; the brass liner lifts out to wash.
poojaTrayGroup=new T.Group();poojaTrayGroup.name='Full-width pull-out diya tray assembly';poojaTrayGroup.position.set(0,2.31,.08);pooja.add(poojaTrayGroup);
const diyaTrayW=poojaW-.26,diyaTrayFrontW=poojaW-.10,diyaTrayD=1.02;
box(diyaTrayFrontW,.22,.09,0,0,diyaTrayD/2+.08,oak,poojaTrayGroup,'Cabinet-width diya tray front');
box(diyaTrayW,.075,diyaTrayD,0,.17,0,bathStone,poojaTrayGroup,'Full-width non-combustible diya tray');
box(diyaTrayW-.16,.035,diyaTrayD-.15,0,.225,.01,brass,poojaTrayGroup,'Full-width removable brass drip liner');
for(const sx of [-1,1])box(.055,.12,diyaTrayD-.10,sx*(diyaTrayW/2-.05),.26,.01,brass,poojaTrayGroup,'Diya tray oil-retaining side lip');
box(diyaTrayW-.10,.12,.055,0,.26,-diyaTrayD/2+.05,brass,poojaTrayGroup,'Diya tray rear safety lip');
cylinder(.22,.05,0,.29,.17,brass,poojaTrayGroup);cylinder(.075,.14,0,.38,.17,porcelain,poojaTrayGroup);
cylinder(.09,.06,-.72,.30,.10,charcoal,poojaTrayGroup);cylinder(.09,.06,.72,.30,.10,charcoal,poojaTrayGroup);
box(.32,.10,.22,-1.15,.31,.12,brass,poojaTrayGroup,'Matchbox holder away from flame');
for(let x=-1.40;x<=1.40;x+=.24)box(.13,.055,.08,x,.23,poojaD/2+.07,charcoal,pooja,'Pooja low vent');
box(poojaW-.20,.33,.09,0,6.72,poojaD/2+.045,brass,pooja,'Pooja perforated high vent');
for(let x=-1.42;x<=1.42;x+=.16)cylinder(.025,.10,x,6.72,poojaD/2+.10,charcoal,pooja).rotation.x=Math.PI/2;
box(3.08,.09,.96,0,2.92,.02,bathStone,pooja,'Non-combustible pooja altar');
box(2.82,.18,.63,0,3.10,-.16,bathStone,pooja,'Lower removable idol riser');
box(2.02,.18,.50,0,3.37,-.27,bathStone,pooja,'Upper removable idol riser');
function poojaIdolLocal(x,y,z,s=.22){cylinder(s*.55,.07,x,y,z,brass,pooja);cylinder(s*.32,s*.55,x,y+s*.30,z,brass,pooja);sphere(s*.23,s*.23,s*.18,x,y+s*.66,z,brass,pooja);}
for(const [x,y,s] of [[-.92,3.20,.19],[-.31,3.20,.21],[.31,3.20,.20],[.92,3.20,.19],[-.62,3.48,.20],[0,3.48,.24],[.62,3.48,.20]])poojaIdolLocal(x,y,-.10,s);
for(const [row,y] of [[0,4.66],[1,5.55]])for(let i=0;i<4;i++){
 const x=-1.17+i*.78,tall=row===1&&i===1,h=tall?.75:.48,w=tall?.52:.42;
 box(w+.06,h+.06,.055,x,y,-poojaD/2+.11,brass,pooja,'Pooja photograph frame');
 box(w,h,.026,x,y,-poojaD/2+.075,warmLight,pooja,'Pooja framed deity photograph');
}
for(const y of [4.31,5.18]){box(3.00,.055,.16,0,y,-poojaD/2+.18,brass,pooja,'Pooja photo rail');box(3.00,.035,.055,0,y-.04,-poojaD/2+.10,warmLight,pooja,'Shielded photo-rail light outside hot zone');}
box(3.02,.045,.08,0,4.03,-poojaD/2+.15,warmLight,pooja,'Shielded altar task light outside flame plume');
// Closed positions fill the opening. Open positions rotate each leaf 90 degrees
// and stack the two pairs within the 13.5 in-deep side pockets.
const poojaLeafW=.76,poojaLeafH=3.20,closedLeafX=[-1.14,-.38,.38,1.14];
for(const sx of [-1,1]){
 box(.22,3.52,poojaD-.10,sx*1.53,4.77,0,oak,pooja,'Flush pooja door pocket');
 for(let j=0;j<2;j++){
  const index=sx<0?j:2+j,leaf=new T.Group();leaf.position.set(closedLeafX[index],4.77,poojaD/2+.06);pooja.add(leaf);leaf.name='Pooja operable pocket-fold leaf';
  box(poojaLeafW-.10,poojaLeafH-.12,.035,0,0,0,flutedGlass,leaf,'Retractable fluted-glass door leaf');
  for(const xx of [-poojaLeafW/2+.035,poojaLeafW/2-.035])box(.07,poojaLeafH,.07,xx,0,0,brass,leaf,'Pooja door brass stile');
  for(const yy of [-poojaLeafH/2+.035,poojaLeafH/2-.035])box(poojaLeafW,.07,.07,0,yy,0,brass,leaf,'Pooja door brass rail');
  const openPosition=new T.Vector3(sx*1.49,4.77,(j?-.17:.17));
  poojaDoorPivots.push({leaf,closedPosition:new T.Vector3(closedLeafX[index],4.77,poojaD/2+.06),openPosition,closedRotation:0,openRotation:sx*Math.PI/2,side:sx,pair:j+1});
 }
}
box(3.02,.08,.10,0,6.50,poojaD/2-.01,oak,pooja,'Pooja door upper track');
switchPanel('Pooja accessible side light and service socket',poojaX+poojaW/2+.03,3.75,poojaZ,-Math.PI/2,2,true);
collision('Pooja cabinet',poojaX-poojaW/2,poojaZ-poojaD/2,poojaX+poojaW/2,poojaZ+poojaD/2,poojaH,'cabinet');
furniture.push({name:'Final retractable-door pooja unit',type:'cabinet',x:poojaX,z:poojaZ,w:poojaW,d:poojaD,h:poojaH});
feature('Pooja unit','furniture',poojaX,poojaZ,poojaW,poojaD,poojaH,'Architect footprint retained; four operable P1-style pocket-fold leaves; full-width independent diya tray; two task-specific drawers; exactly seven idols and eight photographs');
feature('Pooja full-width diya tray','fire-safe pull-out',poojaX,poojaZ,diyaTrayFrontW,diyaTrayD,2.60,'Cabinet-width fascia; clear tray fits between cabinet sides. Non-combustible base with removable brass drip liner, raised oil lip, positive stops and 25 kg minimum full-extension runners');

// R-018 (28 Oct 2026, user instruction): bathroom wall tile runs floor to ceiling (0.04-9.98 ft) on every wall of both
// bathrooms, including the panels above doors D3/D5 (lintel 8.25 ft) and windows W9 (9.5 ft) / W4 (window band 7.5-9.0 ft).
const bathTileY0=.04,bathTileY1=9.98;
function tileSpan(along,c,a,b,y0,y1,m,name,t=.04){if(b-a<.01||y1-y0<.01)return;
 if(along==='x')box(b-a,y1-y0,t,(a+b)/2,(y0+y1)/2,c,m,building,name);else box(t,y1-y0,b-a,c,(y0+y1)/2,(a+b)/2,m,building,name);}
function bathroomWalls(x0,z0,x1,z1,master=false){
 const Y0=bathTileY0,Y1=bathTileY1,nm='Bathroom full-height wall tile';
 if(master)tileSpan('z',x0+.03,z0,z1,Y0,Y1,bathStone,nm);
 else{tileSpan('z',x0+.03,z0,pz(342.96),Y0,Y1,bathStone,nm);tileSpan('z',x0+.03,pz(342.96),pz(387),8.25,Y1,bathStone,nm+' above D5');tileSpan('z',x0+.03,pz(387),z1,Y0,Y1,bathStone,nm);}
 if(master)tileSpan('z',x1-.03,z0,z1,Y0,Y1,bathStone,nm);
 else{const w0=13.01,w1=14.88;tileSpan('z',x1-.03,z0,w1,Y0,7.5,bathStone,nm+' below W4');tileSpan('z',x1-.03,z0,w1,9.0,Y1,bathStone,nm+' above W4');tileSpan('z',x1-.03,w1,z1,Y0,Y1,bathStone,nm);}
 // Solid shower-end wall full height; above the door aperture the tile continues from the lintel to the ceiling.
 const xe=master?px(250.32):x1;tileSpan('x',z0+.025,x0,xe,Y0,Y1,bathStone,nm);
 if(master)tileSpan('x',z0+.025,xe,x1,8.25,Y1,bathStone,nm+' above D3');
 // Common bath lobby-side (north) wall beside the WC is tiled too, so no bathroom wall is left in paint.
 if(!master)tileSpan('x',z1-.025,x0,x1,Y0,Y1,bathStone,nm+' north wall');
 // Subtle horizontal tile joints improve scale and maintenance realism.
 for(let y=2;y<Y1;y+=2){if(master)box(.005,.015,z1-z0,x0+.057,y,(z0+z1)/2,trim);
  if(master||y<7.5)box(.005,.015,z1-z0,x1-.057,y,(z0+z1)/2,trim);else box(.005,.015,z1-14.88,x1-.057,y,(14.88+z1)/2,trim);}
}
function toilet(name,x,z,rotation=0){
 const g=new T.Group();g.name=name;g.position.set(x,0,z);g.rotation.y=rotation;building.add(g);
 const master=name==='Master WC',fitting=master?brass:metal;
 sphere(1.07,.75,1.80,0,1.10,.03,white,g);rb(.72,1.0,1.1,0,.62,-.12,white,g,.17,'WC pedestal');
 const outer=new T.Shape(),inner=new T.Path();outer.absellipse(0,0,.50,.70,0,Math.PI*2,false);inner.absellipse(0,.025,.32,.47,0,Math.PI*2,true);outer.holes.push(inner);const seat=mesh(new T.ExtrudeGeometry(outer,{depth:.045,bevelEnabled:true,bevelSize:.02,bevelThickness:.015,bevelSegments:2,steps:1}),white,g,'WC seat ring');seat.rotation.x=-Math.PI/2;seat.position.set(0,1.46,.05);
 const bowl=mesh(new T.SphereGeometry(.5,24,12),charcoal,g,'WC inner bowl');bowl.scale.set(.62,.13,.91);bowl.position.set(0,1.415,.065);
 box(1.4,3.8,.32,0,1.90,-.94,master?masterBathLimestone:bathStone,g,'Concealed cistern tile enclosure');
 rb(.48,.24,.04,0,3.14,-.755,fitting,g,.02,'Dual flush plate');for(const xx of [-.12,.12])box(.18,.16,.012,xx,3.14,-.728,fitting,g);
 lineTube([[.85,2.1,-.77],[.85,.65,-.70],[.92,1.75,-.65]],.018,fitting,g);box(.09,.25,.08,.92,1.81,-.65,fitting,g,'Health faucet');
 cylinder(.025,.5,-.83,2.16,-.56,fitting,g).rotation.z=Math.PI/2;cylinder(.16,.33,-.83,2.16,-.56,white,g).rotation.z=Math.PI/2;
 if(master){
  box(1.66,2.35,.55,0,7.85,-.83,masterBathSage,g,'Master WC shallow sage upper cupboard');
  box(.025,2.10,.57,0,7.85,-.53,brass,g,'Master WC cupboard door joint');
  for(const xx of [-.43,.43])box(.27,.025,.045,xx,7.76,-.53,brass,g,'Master WC cupboard pull');
  feature('Master WC shallow upper storage','storage',x,z,1.66,.55,9.03,'Concept only: moisture-resistant board, sealed edges and wall fixing to be checked');
 }
 feature(name,'WC',x,z,1.5,2.2,1.5,'Architect plan: WC and concealed cistern positions');const r90=Math.abs(Math.sin(rotation))>.5,hx=r90?1.1:.75,hz=r90?.75:1.1;collision(name,x-hx,z-hz,x+hx,z+hz,3.8,'WC');
}
function shower(name,x,z,rotation=0,width=4.0){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;building.add(g);g.name=name;
 lineTube([[0,3.35,0],[0,6.55,0],[0,7.03,.30],[0,7.03,.65]],.027,metal,g);
 cylinder(.26,.04,0,7.0,.68,metal,g);box(.48,.17,.08,0,3.55,.09,metal,g,'Shower mixer');
 lineTube([[.25,3.5,.07],[.45,2.3,.20],[.30,4.72,.06]],.017,metal,g);box(.12,.65,.08,.30,4.88,.08,metal,g,'Handheld shower');
 box(.67,.09,.25,-.72,3.55,.10,metal,g,'Shower soap shelf');cylinder(.10,.30,-.74,3.74,.14,porcelain,g);
 rb(.33,.02,.33,0,.032,1.55,metal,g,.025,'Floor drain');for(let i=-3;i<=3;i++)box(.025,.002,.23,i*.035,.048,1.55,charcoal,g);
 // Open-entry screen and a clear wet area, with no new masonry or floor step.
 const screen=box(width*.38,6.25,.02,-width*.31,3.15,2.85,glass,g,'Open-entry shower screen');
 g.updateWorldMatrix(true,true);const screenBounds=new T.Box3().setFromObject(screen);collision(name+' glass screen',screenBounds.min.x,screenBounds.min.z,screenBounds.max.x,screenBounds.max.z,6.25,'glass');
 box(.04,6.2,.04,-width*.5+.04,3.13,2.85,metal,g,'Shower screen support');
 feature(name,'shower',x,z,width,3,7.03,'Architect plan: wet-area position; mixer and open screen proposed');
}
function vanity(name,x,z,rotation=0){const g0=cabinet(name,x,z,1.6,1.6,2.85,rotation,oak);sinkCutout(g0,1.6,1.6);basin(name+' ceramic sink',x,z,1.5,1.1,2.95,rotation);
 const g=new T.Group();g.position.set(x,4.8,z);g.rotation.y=rotation;building.add(g);box(1.55,2.3,.055,0,0,-.71,mirror,g,'Vanity mirror');box(1.62,.10,.11,0,1.25,-.65,warmLight,g,'Mirror light');feature(name+' mirror light','light',x,z,1.62,.11,6.05);
}
function masterReferenceVanity(x,z,rotation){
 const g=new T.Group();g.name='Master vanity';g.position.set(x,0,z);g.rotation.y=rotation;building.add(g);
 box(1.64,.77,1.60,0,2.42,0,white,g,'Master floating white vanity body');
 box(1.67,.07,1.65,0,2.84,0,masterBathMarble,g,'Master vanity stone top');
 box(1.50,.055,.03,0,2.36,.82,brass,g,'Master vanity discreet brass pull');
 basin('Master vanity ceramic sink',x,z,1.5,1.1,2.95,rotation,false,building,brass);
 const mg=new T.Group();mg.position.set(x,3.72,z);mg.rotation.y=rotation;building.add(mg);
 const arched=(w,h)=>{const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.closePath();return new T.ShapeGeometry(s);};
 const back=mesh(arched(1.62,2.95),warmLight,mg,'Master vanity arched mirror backlight');back.position.z=-.725;
 const rim=mesh(arched(1.52,2.86),brass,mg,'Master vanity arched brass mirror rim');rim.position.set(0,.035,-.70);
 const pane=mesh(arched(1.44,2.78),mirror,mg,'Master vanity arched mirror');pane.position.set(0,.08,-.67);
 collision('Master vanity',x-.80,z-.82,x+.80,z+.82,2.9,'cabinet');
 furniture.push({name:'Master vanity',type:'cabinet',x,z,w:1.6,d:1.6,h:2.9});
 feature('Master vanity mirror light','light',x,z,1.62,.11,6.67,'Reference-inspired arched mirror with concealed light; IP rating and circuit to be confirmed');
}
// MASTER BATHROOM AND WASHING NICHE
// R-012 rev 2 fixed the mixer set to the tiled wall and kept the washer services reachable above the machine.
// R-015 (user decision 27 Oct 2026): the arched glass returns are removed; the shower is fully open.
const mb=P.rooms.find(r=>r.id==='bath-master').bounds; bathroomWalls(...mb,true);
tileSpan('z',mb[0]+.075,mb[1],mb[3],bathTileY0,bathTileY1,masterBathLimestone,'Master west pale stone wall',.045);
tileSpan('z',mb[2]-.075,mb[1],mb[3],bathTileY0,bathTileY1,masterBathLimestone,'Master east pale stone wall',.045);
// WC-side (W9) wall is a splash zone for the health faucet: tile it around the window.
{const wz0=mb[3]-.025;
 tileSpan('x',wz0,mb[0],1.5,bathTileY0,bathTileY1,masterBathLimestone,'Master WC-side pale stone wall',.045);
 tileSpan('x',wz0,3.375,3.75,bathTileY0,bathTileY1,masterBathLimestone,'Master WC-side pale stone wall',.045);
 tileSpan('x',wz0,1.5,3.375,bathTileY0,1.5,masterBathLimestone,'Master WC-side pale stone wall below W9',.045);
 tileSpan('x',wz0,1.5,3.375,9.5,bathTileY1,masterBathLimestone,'Master WC-side pale stone wall above W9',.045);}
// Washing niche walls get the same washable stone tile, floor to ceiling (R-018).
tileSpan('z',mb[2]-.075,30.0075,33.877,bathTileY0,bathTileY1,masterBathLimestone,'Washing niche east tiled wall',.045);
tileSpan('z',3.75+.025,30.3825,33.877,bathTileY0,bathTileY1,masterBathLimestone,'Washing niche west tiled wall',.045);
tileSpan('x',33.877-.025,3.75,6.375,bathTileY0,bathTileY1,masterBathLimestone,'Washing niche back tiled wall',.045);

// Shower zone: 4 ft (1,220 mm) along the wall × 2 ft 11 in (900 mm) deep, centred on the existing mixer point.
const SHX=mb[0]+.134,SHZ=pz(474.4),SHW=4.0,SHD=2.95,SZ0=SHZ-SHW/2,SZ1=SHZ+SHW/2;
const greenTileW=.31,greenTileH=1.18;
for(let z=SZ0;z<SZ1-.02;z+=greenTileW)for(let y=.06;y<bathTileY1-.02;y+=greenTileH){
 const zw=Math.min(greenTileW-.018,SZ1-z-.018),yh=Math.min(greenTileH-.025,bathTileY1-y);
 if(zw<=0||yh<=0)continue;
 const tileMat=[masterBathGreenA,masterBathGreenB,masterBathGreenC][(Math.round((z-SZ0)/greenTileW)+Math.round(y/greenTileH))%3];
 box(.04,yh,zw,mb[0]+.114,y+yh/2,z+zw/2,tileMat,building,'Master shower vertical green tile');
}
feature('Master shower green tile','wall finish',mb[0]+.114,SHZ,.04,SHW,bathTileY1,'Floor to ceiling (R-018). Reference palette inside the shower only; waterproof substrate and grout specification pending (RFI-004)');
function masterReferenceShower(x,z,width,depth){
 // Local frame: +z points out of the tiled wall (world +x); local x runs along the wall (world -z).
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.PI/2;building.add(g);g.name='Master shower';
 // Mixer set is fixed to the tile face (rev 1 left it floating 220 mm off the wall).
 lineTube([[0,3.40,.09],[0,6.62,.09],[0,6.98,.30],[0,7.02,.80],[0,7.02,1.30]],.027,brass,g);
 cylinder(.40,.045,0,6.98,1.30,brass,g);
 rb(.52,.19,.10,0,3.55,.13,brass,g,.03,'Master shower thermostatic mixer');
 for(const xx of [-.17,.17])cylinder(.055,.06,xx,3.55,.20,brass,g).rotation.x=Math.PI/2;
 lineTube([[.30,3.50,.10],[.50,2.40,.24],[.36,4.75,.11]],.017,brass,g);box(.12,.65,.08,.36,4.90,.12,brass,g,'Master handheld shower on holder');
 rb(.80,.07,.30,-.95,4.10,.15,brass,g,.02,'Master shower brass shelf');cylinder(.10,.30,-1.12,4.29,.17,porcelain,g);cylinder(.08,.24,-.86,4.26,.17,white,g);
 // R-015 (user decision 27 Oct 2026): fully open shower, no glass returns, frames or floor channels.
 // R-012 rev 4 (user decision 27 Oct 2026): the linear drain runs along the back wall under the mixer, close to the
 // architect's floor drain (plan ≈ x 1.27 ft, z 26.37 ft), so the outlet barely moves and the floor falls AWAY from the
 // open front and the walkway. Grate top is flush with the finished floor; no border strip across the shower front (R-015).
 rb(width-.30,.02,.22,0,-.0015,.14,brass,g,.01,'Master shower linear drain along back wall');
 for(let xx=-width/2+.30;xx<width/2-.25;xx+=.09)box(.03,.001,.14,xx,.0085,.14,charcoal,g,'Linear drain slot');
 feature('Master shower','shower',x+depth/2,z,depth,width,7.02,'Existing mixer/drain zone retained; 900 × 1,220 mm open shower zone with no glass returns or screen (R-015): spray reaches the vanity and WC zone, so the whole bathroom floor is treated as wet. Linear drain along the back wall under the mixer, flush, falls away from the open front (about 1:80–1:100); outlet stays near the architect floor-drain point, under the south end of the channel (plumber to confirm, RFI-004)');
 feature('Master shower drain outlet','drain',x+.14,26.37,.25,.25,0,'Architect plan floor drain read at about x 1.27 ft, z 26.37 ft (raster, ±30 mm); channel outlet placed under it, about 75 mm toward the wall. Site to confirm against the actual sleeve');
}
masterReferenceShower(SHX,SHZ,SHW,SHD);
masterReferenceVanity(px(218),pz(427),Math.PI/2);
toilet('Master WC',px(225.0),pz(528),Math.PI/2);
exhaust(px(232),8.68,pz(553.3),.65,Math.PI);
ceilingLight('bath-master',px(271),pz(484),24);downlight('bath-master',px(228),pz(475));
feature('Master shower downlight wet-zone rating','light',px(228),pz(475),.34,.34,9.95,'This downlight is over the open shower zone: IP65 wet-zone fitting on an RCD-protected circuit (RFI-005)');
for(const [n,x,z,h,note] of [
 ['Grab-bar blocking: vertical, beside the shower mixer',mb[0]+.134,SHZ-.85,5.0,'Marine ply/solid blocking or anchor plate behind the green tile, 700–1,500 mm high, for a future vertical grab bar'],
 ['Fold-down seat blocking: shower back wall, south end',mb[0]+.134,SHZ+1.25,1.6,'Blocking for a wall-hung fold-down seat (seat about 450 mm high); seat folds over the drain, no legs'],
 ['Fold-up grab-bar blocking beside the WC (back wall)',mb[0]+.134,pz(528)+.95,2.6,'W9 sill is at about 440 mm, so the side wall cannot take a bar; blocking on the back wall beside the cistern enclosure for a fold-up bar']])
 feature(n,'blocking',x,z,.10,.6,h,note);
switchPanel('Master bathroom external light switch',px(310),3.7,pz(397.6),Math.PI,2);
// Towels and clothes: a bar and two robe hooks on the east wall SOUTH of the shower line (R-016: with the glass gone,
// the old position directly opposite the open front was in the spray), beside the walk to the WC; a hand-towel ring by the vanity.
{const ex=mb[2]-.10,g=new T.Group();g.position.set(ex,0,0);building.add(g);
 const bar=cylinder(.022,1.55,-.20,4.35,28.225,brass,g);bar.rotation.x=Math.PI/2;bar.name='Master towel bar';
 for(const zz of [27.45,29.00]){cylinder(.05,.03,-.01,4.35,zz,brass,g).rotation.z=Math.PI/2;cylinder(.018,.20,-.10,4.35,zz,brass,g).rotation.z=Math.PI/2;}
 for(const zz of [29.35,29.75]){cylinder(.045,.03,-.01,5.55,zz,brass,g).rotation.z=Math.PI/2;lineTube([[-.01,5.55,zz],[-.16,5.55,zz],[-.20,5.62,zz]],.02,brass,g);}
 feature('Master towel bar and robe hooks','accessory',ex-.1,28.6,.22,2.4,5.6,'R-016: moved south of the open shower line (bar starts about 145 mm past the shower edge, 745 mm across the floor), about two steps from the shower; side splash still possible, so use a brass or SS fixing and fix into masonry behind tile');}
{const ring=mesh(new T.TorusGeometry(.26,.022,10,32),brass,building,'Master hand-towel ring');ring.position.set(2.98,3.78,mb[1]+.13);
 box(.10,.10,.08,2.98,4.06,mb[1]+.09,brass,building,'Hand-towel ring bracket');
 feature('Master hand-towel ring','accessory',2.98,mb[1]+.12,.6,.1,4.1,'Beside the vanity, clear of the door swing');}
// Hot water (R-012 rev 3, user decision 25 Oct 2026): a 25 L VERTICAL storage geyser. About 570 mm between
// the D3 leaf and the ceiling is too little for a vertical tank, so it sits high in the corner of the door wall
// above the vanity counter: outside the spray, clear of the door swing and the walking route, close to the basin
// and mixer. Body ~400 mm dia × 650 mm is a placeholder until the actual model's cut sheet (RFI-013).
{const gx=1.70,gr=.656,gz=21.0075+.06+gr,gy0=7.40,gh=2.13,g=new T.Group();g.position.set(gx,gy0,gz);building.add(g);g.name='Master bathroom 25 L vertical geyser';
 const body=cylinder(gr,gh,0,gh/2,0,white,g);body.name='Vertical 25 L storage geyser';
 cylinder(gr*.92,.10,0,-.03,0,white,g).name='Geyser bottom cap';
 box(.34,.14,.02,0,gh*.62,gr+.005,charcoal,g,'Geyser indicator panel');
 for(const yy of [.45,gh-.45])box(.70,.10,.10,0,yy,-gr-.02,metal,g,'Geyser wall bracket');
 // Cold in and hot out drop from the base into the wall chase; the PRV outlet line runs down the wall corner to the floor trap.
 for(const [xx,m] of [[-.22,mat('Geyser hot marker','#b34839')],[.22,mat('Geyser cold marker','#397fa0')]]){
  box(.08,.06,.08,xx,-.14,-.15,m,g,'Geyser service connection');
  lineTube([[xx,-.10,-.15],[xx,-.45,-.40],[xx,-.60,-gr+.02]],.022,metal,g);}
 lineTube([[.42,-.08,.05],[.62,-.55,-.30],[.66,-.75,-gr+.03]],.016,metal,g);
 feature('Geyser PRV discharge route','drain',gx+.66,21.0075+.06,.1,.1,0,'PRV line enters the wall chase and drops to a tundish discharging into the vanity basin waste (no open discharge on the floor); plumber to detail');
 feature('Geyser hot-water route to shower mixer','pipe',1.0,23.5,.1,3.0,3.5,'Insulated concealed CPVC hot line, about 3 m along the north and west walls to the shower mixer; expect a short wait for hot water');
 feature('Master 25 L vertical geyser','appliance',gx,gz,2*gr,2*gr,gy0+gh,'User decision 25 Oct 2026: 25 L vertical geyser in the bathroom. Underside 7 ft 5 in, top about 9 ft 6 in; confirm the selected model, wall fixing, PRV drain route, dedicated circuit with outside isolator and IP rating (RFI-005, RFI-013)');}
switchPanel('Master geyser switched outlet (IP-rated, high level)',2.95,7.75,21.0075+.06,0,1,true);

// The slab finishes 2 ft (610 mm) above the floor. The stone is a finish over a
// support concept; its span, vibration restraint and waterproofing need site design.
const wx=px(273.0),wz=pz(592.2),platform=new T.Group();platform.position.set(wx,0,wz);platform.rotation.y=Math.PI;building.add(platform);platform.name='Master washing-machine raised support concept';
for(const xx of [-1.065,1.065])box(.15,1.89,2.28,xx,.945,0,masterBathSupport,platform,'Washer platform supported side cheek');
box(2.28,.16,.12,0,1.81,1.04,metal,platform,'Washer platform concealed front cross support');
box(2.31,.11,2.31,0,1.945,0,masterBathMarble,platform,'Washer platform sealed marble top at 2 ft');
box(2.31,.07,.06,0,2.035,1.125,masterBathMarble,platform,'Washer platform front anti-walk upstand');
box(2.08,.025,2.10,0,2.012,0,charcoal,platform,'Washer removable anti-vibration mat');
// The bay under the platform is used, not wasted: two lift-out laundry baskets on feet, clear of mopping water.
for(const xx of [-.48,.48]){rb(.86,1.20,1.55,xx,.72,.10,masterBathBasket,platform,.06,'Lift-out laundry basket');for(const zz of [-.6,.6])box(.06,.10,.06,xx,.06,.10+zz,charcoal,platform,'Basket foot');}
feature('Washing machine raised support','utility support',wx,wz,2.31,2.31,2.0,'Concept: marble top at 610 mm with front anti-walk upstand; independently designed support, anchorage, vibration, waterproofing and service access required');
const wg=new T.Group();wg.position.set(wx,2.0,wz);building.add(wg);wg.rotation.y=Math.PI;wg.name='Washing machine niche';
rb(2.03,2.86,2.05,0,1.46,0,white,wg,.06,'Front load washing machine');box(1.9,.30,.07,0,2.58,1.05,trim,wg,'Washer controls');
const drum=cylinder(.50,.10,0,1.37,1.00,black,wg);drum.rotation.x=Math.PI/2;drum.name='Washer drum recess';
// R-014: porthole door with a chrome ring, domed tinted glass, a pull handle, and a detergent drawer in the control strip.
{const ring=mesh(new T.TorusGeometry(.56,.075,16,48),metal,wg,'Washer door chrome ring');ring.position.set(0,1.37,1.08);
 const inner=mesh(new T.TorusGeometry(.47,.035,12,48),white,wg,'Washer door inner trim');inner.position.set(0,1.37,1.10);
 const dome=sphere(.94,.94,.30,0,1.37,1.06,glass,wg);dome.name='Washer door domed glass';
 box(.07,.30,.06,.66,1.37,1.10,charcoal,wg,'Washer door pull');
 box(.62,.24,.03,-.58,2.58,1.085,white,wg,'Detergent drawer');box(.30,.05,.02,-.58,2.53,1.10,charcoal,wg,'Detergent drawer grip');
 box(1.9,.012,.02,0,2.42,1.06,charcoal,wg,'Control strip shut line');}box(.38,.08,.025,.43,2.64,1.12,charcoal,wg);cylinder(.085,.04,-.65,2.63,1.11,metal,wg).rotation.x=Math.PI/2;
// Services: inlet valve (east wall) and RCD-protected switched socket (west wall) sit ABOVE the machine top,
// near the front, on opposite walls; the drain hose runs behind the machine to a standpipe, not across the door.
{const vx=mb[2]-.10,vy=5.20,vz=wz-.80,g=new T.Group();g.position.set(vx,vy,vz);g.rotation.y=-Math.PI/2;building.add(g);g.name='Washer inlet angle valve';
 cylinder(.07,.03,0,0,.015,metal,g).rotation.x=Math.PI/2;cylinder(.035,.20,0,0,.11,metal,g).rotation.x=Math.PI/2;
 box(.24,.05,.05,0,.07,.14,charcoal,g,'Quarter-turn valve handle');cylinder(.04,.10,0,-.08,.18,metal,g);
 feature('Washer inlet angle valve','tap',vx,vz,.3,.3,vy,'Above the machine top, just behind its front face: reachable to shut off after every wash');}
lineTube([[mb[2]-.28,5.08,wz-.80],[mb[2]-.22,4.98,wz-.20],[mb[2]-.20,4.95,wz+.70],[wx+.70,4.70,wz+1.08]],.03,charcoal);
switchPanel('Washing machine RCD-protected switched socket (IP-rated box)',3.75+.075,5.45,wz-.80,Math.PI/2,2,true);
lineTube([[wx-.75,4.55,wz+1.06],[3.95,4.90,wz+.60],[3.86,5.30,wz-.70]],.016,charcoal);
lineTube([[wx-.45,4.10,wz+1.04],[wx-.55,4.45,wz+1.20],[wx-.80,3.40,wz+1.36],[wx-.85,2.85,wz+1.37]],.037,metal);
cylinder(.07,2.75,wx-.85,1.375,wz+1.37,metal);
feature('Washer drain standpipe behind platform','drain',wx-.85,wz+1.37,.14,.14,2.75,'Hose hooked into a standpipe with air gap behind the platform; trap position to be confirmed by plumber');
feature('Washing machine','appliance',wx,wz,2.03,2.05,4.9,'Architect niche position retained; appliance base 2 ft above floor, actual model and hose/drain limits pending');
collision('Washing machine',wx-1.02,wz-1.03,wx+1.02,wz+1.03,4.9,'appliance');ceilingLight('bath-master',wx,pz(572),10);

// Closed utility cupboard within the existing washing niche, clear of the side shaft.
// Lifted to 6 ft 7 in so the services and the machine top stay reachable; it now holds spare stock (step stool).
const utilityGroup=new T.Group();utilityGroup.position.y=6.55;building.add(utilityGroup);
const uc=cabinet('Utility overhead storage',wx,33.37,2.25,.80,2.0,Math.PI,greige,false,utilityGroup);
for(const o of [...uc.children])if(['Recessed plinth','Granite top'].includes(o.name))uc.remove(o);
box(2.25,.06,.80,0,2.0,0,greige,uc,'Utility cupboard closed top');
feature('Utility overhead storage','storage',wx,33.37,2.25,.80,8.55,'Proposed wall-mounted moisture-resistant cabinet raised above the services; site fixing check required');

// COMMON BATHROOM: preserve the narrow 4 ft 6 in enclosure and all fixture positions.
const cb=P.rooms.find(r=>r.id==='bath-common').bounds;bathroomWalls(...cb);
vanity('Common vanity',px(507),pz(354.5),-Math.PI/2);
toilet('Common WC',px(495),pz(396),-Math.PI/2);
shower('Common shower',px(483),pz(284.2),0,4.2);
exhaust(px(516.8),8.30,pz(305),.62,-Math.PI/2);
ceilingLight('bath-common',px(480),pz(348),22);downlight('bath-common',px(482),pz(304));
switchPanel('Common bathroom external switch',px(440.9),3.7,pz(397),-Math.PI/2,2);

// STAIRCASE: exact two 3 ft 3 in flights and the 23 numbered steps, section provisional.
const sx0=px(506.4),sx1=px(558.36),sx2=px(560.4),sx3=px(612.36),sz0=pz(498.24),sz1=pz(645),sz2=pz(700.92),td=(sz1-sz0)/11,rise=10/23;
for(let i=0;i<11;i++){
 let y=(i+1)*rise,z=sz0+(i+.5)*td;box(sx3-sx2,y,td,(sx2+sx3)/2,y/2,z,bathStone,building,'Stair tread '+(i+1));box(sx3-sx2,.025,.09,(sx2+sx3)/2,y+.01,z-td/2+.045,charcoal,building,'Stair nosing');
 let yy=(23-i)*rise;box(sx1-sx0,yy,td,(sx0+sx1)/2,yy/2,z,bathStone,building,'Stair tread '+(23-i));box(sx1-sx0,.025,.09,(sx0+sx1)/2,yy+.01,z+td/2-.045,charcoal,building,'Stair nosing');
}
box(sx3-sx0,12*rise,sz2-sz1,(sx0+sx3)/2,6*rise,(sz1+sz2)/2,bathStone,building,'Stair landing 12');
lineTube([[sx3-.12,3.25+rise,sz0],[sx3-.12,3.25+11*rise,sz1],[sx3-.12,3.25+12*rise,sz2-.3],[sx0+.12,3.25+12*rise,sz2-.3],[sx0+.12,3.25+13*rise,sz1],[sx0+.12,3.25+23*rise,sz0]],.055,oak);
for(let i=0;i<11;i++){cylinder(.025,3.1,sx3-.12,(i+1)*rise+1.55,sz0+(i+.5)*td,metal);cylinder(.025,3.1,sx0+.12,(23-i)*rise+1.55,sz0+(i+.5)*td,metal);}
collision('Stair footprint',sx0,sz0,sx3,sz2,10,'stairs');
ceilingLight('lobby',px(567),pz(457),25);downlight('lobby',px(536),pz(454));
switchPanel('Lobby controls',px(610.5),3.7,pz(466),-Math.PI/2,3);
// R-011 (revised plan 14 Oct 2026): SHOE RACK against the lobby east wall, 1 ft deep x 3 ft long (outline measured from the PDF vectors:
// x 25.25-26.25 ft, z 22.12-25.12 ft; set to abut the lift-entry wall face at z 22.133 ft), starting at the lift-entry wall. Height (3 ft 3 in, kept below the lobby controls), open slatted
// shelves and the sample shoes are assumptions - the plan gives only the outline and the label.
{const rx=25.75,rz=23.633,rw=3.0,rd=1.0,rh=3.25,rk=new T.Group();rk.name='Lobby shoe rack';rk.position.set(rx,0,rz);rk.rotation.y=-Math.PI/2;building.add(rk);
 for(const k of [-1,1])box(.05,rh-.2,rd,k*(rw/2-.025),rh/2+.1,0,oak,rk,'Shoe rack side');
 box(rw-.1,rh-.2,.04,0,rh/2+.1,-rd/2+.02,oak,rk,'Shoe rack back');box(rw-.1,.2,rd-.06,0,.10,0,charcoal,rk,'Shoe rack plinth');
 box(rw+.04,.06,rd+.03,0,rh+.03,.012,oak,rk,'Shoe rack top');
 const shoeMats=[charcoal,greige,linen,sage];
 for(let i=0;i<4;i++){const yy=.30+i*.78;box(rw-.1,.04,rd-.06,0,yy,0,oak,rk,'Shoe rack shelf');
  for(let j=0;j<5;j++){const sxx=-rw/2+.35+j*.57;rb(.34,.2,.80,sxx,yy+.12,.02,shoeMats[(i+j)%4],rk,.07,'Sample shoe pair');}}
 collision('Lobby shoe rack',rx-rd/2,rz-rw/2,rx+rd/2,rz+rw/2,rh,'cabinet');furniture.push({name:'Lobby shoe rack',type:'cabinet',x:rx,z:rz,w:rd,d:rw,h:rh});
 feature('Lobby shoe rack','joinery',rx,rz,rd,rw,rh,'Architect plan (revised 14 Oct 2026): SHOE RACK 1 ft x 3 ft against the lobby east wall; height and shelf layout are assumptions');}
// Lift cabin and its controls are included; no second floor or new shaft is introduced.
box(4.96,7.40,.035,px(572.4),3.72,pz(338),metal,building,'Lift cabin rear wall');
box(.035,7.40,4.92,px(534),3.72,pz(377),metal,building,'Lift cabin side wall');
box(.035,7.40,4.92,px(610.7),3.72,pz(377),metal,building,'Lift cabin side wall');
box(4.95,.08,4.95,px(572.4),7.49,pz(377),ivory,building,'Lift cabin ceiling');
lineTube([[px(535),3.1,pz(353)],[px(535),3.1,pz(400)]],.035,metal);
box(.06,1.4,.45,px(609.8),3.8,pz(387),charcoal,building,'Lift internal button panel');
ceilingLight('lift',px(572),pz(377),9);

// FRONT OPEN AREA: the stippled boundary is retained in the same position.
const tl={room:'terrace',power:4,light:new T.PointLight('#ffe4bc',4,10)};tl.light.position.set(px(206),6,pz(929));scene.add(tl.light);roomLights.push(tl);
sconce(px(205.4),pz(929),Math.PI/2,6);

// Modest loose furniture in the front open area; no roof, platform or partition added.
chair(2.1,53.65,Math.PI,'Outdoor chair');chair(5.0,53.65,Math.PI,'Outdoor chair');
cylinder(.53,.10,3.55,1.65,53.65,porcelain);cylinder(.06,1.6,3.55,.81,53.65,charcoal);
collision('Outdoor side table',3.02,53.12,4.08,54.18,1.7,'table');
plant(7.0,54.2,1.9);
const viewpoints={
 overview:{name:'Whole floor',detail:'3 bedrooms · 10 ft ceiling · optional partition omitted'},
 living:{name:'Living',pos:[px(459),5.2,pz(653)],target:[px(323),3.2,pz(490)],detail:'Walnut · warm stone · terracotta · supportive sand seating'},
 'living-reverse':{name:'Living reverse view',pos:[px(360),5.1,pz(463)],target:[18.0,3.8,tvPanelZ],room:'living',detail:'Full-height TV backing clears the window; low console extends to the window centreline'},
 'tv-wall':{name:'Living TV wall',pos:[10.8,4.8,31.0],target:[18.2,4.7,tvPanelZ],room:'living',fov:60,detail:'Ceiling-height backing shifted right of W5 · console extends beneath half the window'},
 'sofa-wall':{name:'Living sofa service plank',pos:[14.6,4.1,30.0],target:[7.0,1.9,30.0],room:'living',fov:58,detail:'Walnut plank extends beyond both sofa arms · integrated switches, 6A socket, USB-A and USB-C'},
 kitchen:{name:'Approved kitchen',pos:[px(429),5.15,pz(698)],target:[px(247),4.85,pz(827)],detail:'Approved sand and walnut kitchen · double sink · four burners · hidden RO and geyser'},
 'kitchen-detail':{name:'Kitchen worktop',pos:[px(397),4.95,pz(783)],target:[px(247),4.8,pz(814)],room:'kitchen',detail:'One lift-up hood gate · sink-width rack · direct RO tap · accessible fixed corner shelf'},
 master:{name:'Master bedroom',pos:[px(356),5.1,pz(382)],target:[px(245),3.0,pz(221)],detail:'Older adults’ room · clear floor · bedside controls · closed storage'},
 'master-reverse':{name:'Master storage',pos:[px(235),5.0,pz(304)],target:[px(365),3.7,pz(248)],room:'master',detail:'Simple wardrobes and TV storage stay in their planned positions'},
 'bedroom-2':{name:'Bedroom 2',pos:[px(415),5.15,pz(266)],target:[px(520),3.2,pz(120)],detail:'Sleeping group shifted toward the almirah · right bedside top meets the almirah side'},
 'bedroom-2-entry':{name:'Bedroom 2 from hall',pos:[13.78,4.85,22.75],target:[16.4,3.0,7.0],room:'bedroom-2',fov:58,detail:'Hall sightline after shifting the bed and both bedside units toward the almirah'},
 'bedroom-2-study':{name:'Bedroom 2 study unit',pos:[px(430),5.0,pz(150)],target:[18.69,4.4,12.1],room:'bedroom-2',fov:72,detail:'Study unit 5 ft x 1 ft 6 in replaces the TV unit · AC now on the south wall above it · 3 ft 9 in from the bed foot'},
 'bedroom-3':{name:'Bedroom 3',pos:[px(552),5.0,pz(939)],target:[px(473),3.0,pz(795)],detail:'Dusty blue accents · walnut · two planned storage runs'},
 'bedroom-3-iron':{name:'Bedroom 3 folding iron table',pos:[17.2,5.0,52.6],target:[25.6,3.0,46.4],room:'bedroom-3',fov:70,detail:'Folding iron table 5 ft x 1 ft 9 in on the east wall, between the 2 ft mirror store and the 1 ft 6 in shelf'},
 'bath-master':{name:'Master bathroom',pos:[px(281),5.1,pz(435)],target:[px(242),3.05,pz(516)],fov:82,detail:'Open shower, no glass returns · 745 mm route to WC and washer · towel bar and hooks on the east wall beyond the shower'},
 'bath-master-entry':{name:'Master bathroom — from the door',pos:[5.35,5.2,21.55],target:[2.3,3.3,27.6],fov:80,room:'bath-master',detail:'Vanity, open 3 ft × 4 ft shower with the linear drain along the back wall under the mixer, WC beyond · floor falls away from the walkway'},
 'bath-master-reverse':{name:'Master bathroom vanity',pos:[px(281),5.1,pz(548)],target:[px(221),4.5,pz(443)],fov:76,room:'bath-master',detail:'Floating white vanity · arched mirror kept within the vanity · 25 L vertical geyser high in the corner above the counter · open shower, no glass'},
 'bath-common':{name:'Common bathroom',pos:[px(456),5.1,pz(296)],target:[px(494),2.7,pz(389)],fov:82,closedDoors:['D5'],detail:'4 ft 6 in width preserved · door closed for the fixture view'},
 washing:{name:'Washing niche — raised washer draft',pos:[px(272),5.1,pz(527)],target:[px(273),3.9,pz(593)],room:'bath-master',fov:75,detail:'Washer base 2 ft / 610 mm · inlet valve and RCD socket on opposite walls above the machine · drain behind · laundry baskets below · cupboard lifted to 6 ft 7 in'},
 store:{name:'Store',pos:[px(366),5.0,pz(697)],target:[px(276),3.7,pz(637)],fov:69,detail:'Store shelves beside the clear living-to-kitchen transition'},
 lobby:{name:'Lift lobby / stairs',pos:[px(573),4.3,pz(497)],target:[px(573),3.65,pz(424.5)],fov:90,closedDoors:['D6'],detail:'5 ft × 5 ft lift · lobby door closed for the lift view'},
 stairs:{name:'Staircase',pos:[px(588),5.2,pz(477)],target:[px(551),6,pz(642)],fov:72,detail:'23 numbered steps · 3 ft 3 in flights · vertical profile provisional'},
 terrace:{name:'Front open area',pos:[11.8,5.1,50.8],target:[3.8,2.0,53.8],detail:'Two backed chairs · warm outdoor tile · boundary height provisional'}
};
viewpoints['lobby-shoe-rack']={name:'Lobby shoe rack',pos:[20.9,4.6,23.2],target:[26.0,2.0,23.6],room:'lobby',fov:70,detail:'Shoe rack 1 ft x 3 ft against the east wall, starting at the lift-entry wall'};
viewpoints['rear-shaft-shelf']={name:'Rear shaft kota shelf',pos:[9.2,5.0,4.3],target:[1.6,2.2,2.5],room:'master',fov:72,detail:'Kota/granite shelf 1 ft 9 in x 4 ft 3 in along the shaft west wall · height assumed · shaft termination not supplied'};
viewpoints.pooja={name:'Pooja',pos:[poojaX,4.35,poojaZ-7.2],target:[poojaX,3.55,poojaZ],room:'living',fov:55,detail:'Operable pocket-fold doors · full-width fire-safe diya tray · washable liner · daily and bulk storage'};
viewpoints['window-wall']={name:'Kitchen window wall',pos:[10.8,5.3,43.5],target:[7.4,5.2,49.2],room:'kitchen',fov:72,detail:'Single wide drawer bay · one lift-up chimney shutter · exhaust aligned to right pane'};
viewpoints['ro-wall']={name:'Kitchen RO and sink wall',pos:[8.4,5.0,42.6],target:[1.5,5.0,42.7],room:'kitchen',fov:72,detail:'Rack and sink share one width · two sink cupboard doors · geyser below sink'};
viewpoints['corner-storage']={name:'Kitchen corner shelf',pos:[4.4,3.2,44.6],target:[3.65,1.65,48.1],room:'kitchen',fov:58,detail:'Open kitchen access doors to inspect the single fixed shelf beneath the hob'};
for(const v of P.voids){const [a,b,c,d]=v.bounds;viewpoints[v.id]={name:v.name,pos:[(a+c)/2,14,(b+d)/2+.4],target:[(a+c)/2,1,(b+d)/2],fov:60,detail:'Ventilation void retained · light washable walls · vertical termination provisional'};}
const guide=root.querySelector('.view-detail'),roomName=root.querySelector('.view-name'),select=root.querySelector('select.room-select'),modeBtn=root.querySelector('[data-action="mode"]'),lightBtn=root.querySelector('[data-action="light"]'),doorBtn=root.querySelector('[data-action="doors"]'),hint=root.querySelector('.hint');
for(const [id,v] of Object.entries(viewpoints)){const o=document.createElement('option');o.value=id;o.textContent=v.name;select.appendChild(o);}
const labelEls={};
for(const r of P.rooms){if(['stairs','terrace','store','lift'].includes(r.id))continue;const e=document.createElement('button');e.type='button';e.className='room-label';e.textContent=r.name;e.setAttribute('aria-label','Enter '+r.name);e.addEventListener('click',()=>go(r.id));root.querySelector('.labels').appendChild(e);labelEls[r.id]=e;}
for(const v of P.voids){const e=document.createElement('span');e.className='room-label';e.textContent=v.name;e.style.pointerEvents='none';root.querySelector('.labels').appendChild(e);labelEls[v.id]=e;}
function roomCenter(r){if(!r.polygon)return[(r.bounds[0]+r.bounds[2])/2,(r.bounds[1]+r.bounds[3])/2];let x=0,z=0;r.polygon.forEach(p=>{x+=p[0];z+=p[1];});return[x/r.polygon.length,z/r.polygon.length];}
function stopTour(){if(tourTimer){clearInterval(tourTimer);tourTimer=null;}root.querySelector('[data-action="tour"]').textContent='Guided tour';}
function go(id,keepTour=false){if(!keepTour)stopTour();selected=id;const v=viewpoints[id];if(!v)return;
 const doorsOpen=doorBtn.textContent==='Close doors';doorPivots.forEach(p=>{p.open=doorsOpen&&!v.closedDoors?.includes(p.id);p.hinge.rotation.y=p.open?p.openAngle:0;});
 updateDoorBounds();
 mode=id==='overview'?'overview':'walk';roomName.textContent=v.name;guide.textContent=v.detail;select.value=[...select.options].some(o=>o.value===id)?id:(v.room||id);
 if(mode==='overview'){renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),3.8)];ceilings.visible=false;camera.fov=50;orbitTheta=.63;orbitPhi=.60;orbitRadius=70;orbitTarget.set(13.5,0,27);updateOrbit();}
 else{renderer.clippingPlanes=[];ceilings.visible=true;camera.fov=v.fov||62;camera.position.set(...v.pos);const d=new T.Vector3(...v.target).sub(camera.position).normalize();yaw=Math.atan2(-d.x,-d.z);pitch=Math.asin(d.y);updateLook();}
 tYaw=yaw;tPitch=pitch;tTheta=orbitTheta;tPhi=orbitPhi;tRadius=orbitRadius;vx=vz=0;
 camera.updateProjectionMatrix();modeBtn.textContent=mode==='overview'?'Walk inside':'Whole floor';hint.textContent=mode==='overview'?'Drag to orbit · scroll to zoom · choose a room to enter':'Drag to look · W A S D / arrow keys to move · choose a room to jump';
 root.classList.toggle('inside',mode==='walk');updateLights();updateWindowLights();render();
}
function updateLights(){const rid=viewpoints[selected]?.room||selected;roomLights.forEach(({room,light,power})=>{let adjacent=(rid==='living'&&['kitchen','store','lobby'].includes(room))||(rid==='kitchen'&&['living','store'].includes(room));light.intensity=power*(night?2.1:1)*(mode==='overview'||room===rid?1:adjacent?.45:.08);light.castShadow=mode==='walk'&&room===rid&&room!=='terrace';if(light.castShadow){light.shadow.mapSize.set(2048,2048);light.shadow.bias=-.001;light.shadow.normalBias=.025;}});}
function updateLook(){camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}
function updateOrbit(){camera.position.set(orbitTarget.x+orbitRadius*Math.sin(orbitTheta)*Math.sin(orbitPhi),orbitTarget.y+orbitRadius*Math.cos(orbitPhi),orbitTarget.z+orbitRadius*Math.cos(orbitTheta)*Math.sin(orbitPhi));camera.lookAt(orbitTarget);}
function updateDoorBounds(){building.updateMatrixWorld(true);doorPivots.forEach(p=>{const b=new T.Box3().setFromObject(p.hinge);p.solidBounds=[b.min.x,b.min.z,b.max.x,b.max.z];});}
function blocked(x,z){const r=.30;if(x<.78+r||x>26.25-r||z<.38+r||z>55.5-r)return true;
 for(const p of doorPivots){const [a,b,c,d]=p.solidBounds||p.bounds;if(x+r>a&&x-r<c&&z+r>b&&z-r<d)return true;}
 for(const c of colliders){if(c.type==='stairs')continue;if(c.h<.3)continue;if(x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1)return true;}
 for(const v of P.voids){const [a,b,c,d]=v.bounds;if(x>a&&x<c&&z>b&&z<d)return true;}
 if(x>sx0&&x<sx3&&z>sz0&&z<sz2)return true;return false;
}
function move(dx,dz){const x=camera.position.x,z=camera.position.z;if(!blocked(x+dx,z))camera.position.x+=dx;if(!blocked(camera.position.x,z+dz))camera.position.z+=dz;}
let composer=null,gtao=null,aoOn=true;
function buildFX(){
 const rt=new T.WebGLRenderTarget(4,4,{type:T.HalfFloatType,samples:4});
 composer=new FX.EffectComposer(renderer,rt);composer.addPass(new FX.RenderPass(scene,camera));
 gtao=new FX.GTAOPass(scene,camera,4,4);gtao.updateGtaoMaterial({radius:1.15,distanceExponent:1.6,thickness:1.4,scale:1.35,samples:16,distanceFallOff:1,screenSpaceRadius:false});
 gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,radiusExponent:1,rings:2,samples:16});
 gtao.blendIntensity=.95;composer.addPass(gtao);composer.addPass(new FX.OutputPass());
}
buildFX();
const rc=new ResizeObserver(()=>{const b=canvas.getBoundingClientRect();renderer.setSize(b.width,b.height,false);composer.setSize(b.width,b.height);camera.aspect=b.width/b.height;camera.updateProjectionMatrix();render();});rc.observe(canvas);
canvas.addEventListener('pointerdown',e=>{stopTour();canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};if(mode==='overview'){tTheta-=dx*.007;tPhi=Math.max(.16,Math.min(1.30,tPhi+dy*.005));}else{tYaw-=dx*.005;tPitch=Math.max(-1.3,Math.min(1.3,tPitch-dy*.005));}});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();if(mode==='overview')tRadius=Math.max(22,Math.min(100,tRadius+e.deltaY*.025));else{move(-Math.sin(yaw)*e.deltaY*-.008,-Math.cos(yaw)*e.deltaY*-.008);dirty=true;}},{passive:false});
canvas.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();stopTour();keys.add(e.key.toLowerCase());}});canvas.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));canvas.addEventListener('blur',()=>keys.clear());
// Native buttons keep touch and keyboard movement available without pointer-lock permission.
root.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.move);b.setPointerCapture(e.pointerId);});b.addEventListener('pointerup',()=>keys.delete(b.dataset.move));b.addEventListener('pointercancel',()=>keys.delete(b.dataset.move));});
select.addEventListener('change',()=>go(select.value));modeBtn.addEventListener('click',()=>go(mode==='overview'?'living':'overview'));
function setNight(value){night=value;lightBtn.textContent=night?'Daylight':'Evening';hemi.intensity=night?.34:.16;applyEnv();updateWindowLights();sun.intensity=night?0:2.6;renderer.toneMappingExposure=night?1.32:.98;scene.background.set(night?'#132337':'#e4e5e1');windowGlass.color.set(night?'#182d47':'#dce5e1');windowGlass.opacity=night?.85:.18;updateLights();render();}
lightBtn.addEventListener('click',()=>setNight(!night));
const aoBtn=root.querySelector('[data-action="ao"]');
function setAO(on){aoOn=on;aoBtn.textContent=on?'Soft shadows: On':'Soft shadows: Off';aoBtn.setAttribute('aria-pressed',String(on));render();}
aoBtn.addEventListener('click',()=>setAO(!aoOn));
const twoWayBtn=root.querySelector('[data-action="twoway"]');
twoWayBtn.addEventListener('click',()=>{doorPivots.forEach(p=>{if(!p.twoWay)return;p.openAngle=-p.openAngle;if(p.open)p.hinge.rotation.y=p.openAngle;});updateDoorBounds();render();});
doorBtn.addEventListener('click',()=>{const open=doorBtn.textContent==='Close doors';doorPivots.forEach(p=>{p.hinge.rotation.y=open?0:p.openAngle;p.open=!open;});doorBtn.textContent=open?'Open doors':'Close doors';updateDoorBounds();render();});
root.querySelector('[data-action="tour"]').addEventListener('click',()=>{if(tourTimer){stopTour();return;}const route=['living','living-reverse','kitchen','kitchen-detail','master','master-reverse','bedroom-2','bedroom-3','bath-master','washing','bath-common','store','pooja','lobby','stairs','terrace'];let i=0;go(route[0],true);root.querySelector('[data-action="tour"]').textContent='Pause tour';tourTimer=setInterval(()=>{i++;if(i>=route.length){stopTour();return;}go(route[i],true);},6500);});
root.querySelector('[data-action="image"]').addEventListener('click',()=>{render();const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='jaipur-home-'+selected+(night?'-evening':'')+'.png';a.click();});
root.querySelector('[data-action="full"]').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else root.requestFullscreen?.();});
function setStorageInspection(open){storageOpen=open;kitchenDoorPivots.forEach(p=>p.hinge.rotation[p.axis]=open?p.openAngle:0);const btn=root.querySelector('[data-action="storage"]');btn.textContent=open?'Close kitchen access doors':'Open kitchen access doors';btn.setAttribute('aria-pressed',String(open));render();}
root.querySelector('[data-action="storage"]').addEventListener('click',()=>{if(!['kitchen','kitchen-detail','window-wall','ro-wall','corner-storage'].includes(selected))go('kitchen');setStorageInspection(!storageOpen);});
function setDiyaTrayOpen(open,ensureShrine=true){
 if(open&&ensureShrine&&!poojaOpen)setPoojaOpen(true);
 diyaTrayOpen=open;poojaTrayGroup.position.z=open?1.08:.08;
 const btn=root.querySelector('[data-action="pooja-tray"]');btn.textContent=open?'Retract diya tray':'Pull out diya tray';btn.setAttribute('aria-pressed',String(open));render();
}
let ironOpen=true;
function setIronTable(open){
 ironOpen=open;ironLeaf.rotation.z=open?0:-Math.PI/2;ironLegs.visible=open;ironCollider.h=open?2.75:.2;
 const btn=root.querySelector('[data-action="iron-table"]');btn.textContent=open?'Fold iron table up':'Fold iron table down';btn.setAttribute('aria-pressed',String(open));render();
}
function setPoojaOpen(open){
 if(!open&&diyaTrayOpen)setDiyaTrayOpen(false,false);
 poojaOpen=open;poojaDoorPivots.forEach(p=>{p.leaf.position.copy(open?p.openPosition:p.closedPosition);p.leaf.rotation.y=open?p.openRotation:p.closedRotation;});
 const btn=root.querySelector('[data-action="pooja-doors"]');btn.textContent=open?'Close puja cabinet':'Open puja cabinet';btn.setAttribute('aria-pressed',String(open));render();
}
root.querySelector('[data-action="iron-table"]').addEventListener('click',()=>{if(selected!=='bedroom-3-iron')go('bedroom-3-iron');setIronTable(!ironOpen);});
root.querySelector('[data-action="pooja-doors"]').addEventListener('click',()=>{if(selected!=='pooja')go('pooja');setPoojaOpen(!poojaOpen);});
root.querySelector('[data-action="pooja-tray"]').addEventListener('click',()=>{if(selected!=='pooja')go('pooja');setDiyaTrayOpen(!diyaTrayOpen);});
function render(){renderer.shadowMap.needsUpdate=true;draw();}
function draw(){if(aoOn&&composer)composer.render();else renderer.render(scene,camera);const b=canvas.getBoundingClientRect();for(const r of [...P.rooms,...P.voids]){const e=labelEls[r.id];if(!e)continue;e.hidden=mode!=='overview';if(e.hidden)continue;const [x,z]=roomCenter(r),v=new T.Vector3(x,.16,z).project(camera);e.style.left=(v.x*.5+.5)*b.width+'px';e.style.top=(-v.y*.5+.5)*b.height+'px';e.hidden=v.z>1||Math.abs(v.x)>1||Math.abs(v.y)>1;}}
function animate(t){const dt=Math.min((t-lastTime)/1000,.05)||.016;lastTime=t;
 // R-017: look, orbit and walking speed ease toward their targets, so motion stays smooth between input events.
 const kL=1-Math.exp(-dt*16),kV=1-Math.exp(-dt*9),ease=(a,b)=>Math.abs(b-a)>1e-4;
 if(mode==='walk'){
  if(ease(yaw,tYaw)||ease(pitch,tPitch)){yaw+=(tYaw-yaw)*kL;pitch+=(tPitch-pitch)*kL;updateLook();dirty=true;}
  let f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),r=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),n=Math.hypot(f,r)||1,speed=3.5;
  vx+=((-Math.sin(yaw)*f+Math.cos(yaw)*r)/n*speed-vx)*kV;vz+=((-Math.cos(yaw)*f-Math.sin(yaw)*r)/n*speed-vz)*kV;
  if(Math.hypot(vx,vz)>.02){move(vx*dt,vz*dt);dirty=true;}else vx=vz=0;
 }else if(ease(orbitTheta,tTheta)||ease(orbitPhi,tPhi)||ease(orbitRadius,tRadius)){orbitTheta+=(tTheta-orbitTheta)*kL;orbitPhi+=(tPhi-orbitPhi)*kL;orbitRadius+=(tRadius-orbitRadius)*kL;updateOrbit();dirty=true;}
 if(dirty){dirty=false;draw();}
 requestAnimationFrame(animate);}
window.JAIPUR={scene,building,renderer,camera,go,viewpoints,fixtures,furniture,colliders,P,ceilings,doorPivots,kitchenStorage,kitchenFronts,kitchenDoorPivots,poojaDoorPivots,poojaTrayGroup,kitchenQA,setStorageInspection,setPoojaOpen,setDiyaTrayOpen,setNight,setIronTable,setAO,
 render,draw,width:27,ceiling:10,
 capture(id,w=1920,h=1280){go(id);renderer.setPixelRatio(1);renderer.setSize(w,h,false);composer.setPixelRatio(1);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();return canvas.toDataURL('image/png');},
 overhead(){go('overview');renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),3.8)];camera.position.set(13.5,85,27);camera.up.set(0,0,-1);camera.lookAt(13.5,0,27);camera.fov=39;camera.updateProjectionMatrix();render();return canvas.toDataURL('image/png');},
 resetUp(){camera.up.set(0,1,0);go('overview');},
 async glb(){const e=new window.JAIPUR_GLTFExporter();const saved=ceilings.visible,poojaWasOpen=poojaOpen,trayWasOpen=diyaTrayOpen;ceilings.visible=true;const angles=kitchenDoorPivots.map(p=>p.hinge.rotation[p.axis]);kitchenDoorPivots.forEach(p=>p.hinge.rotation[p.axis]=0);const ironWas=ironOpen;setIronTable(true);setPoojaOpen(false);const exportRoot=building.clone(true);setIronTable(ironWas);kitchenDoorPivots.forEach((p,i)=>p.hinge.rotation[p.axis]=angles[i]);setPoojaOpen(poojaWasOpen);setDiyaTrayOpen(trayWasOpen);exportRoot.scale.setScalar(ft);exportRoot.name='Suresh Ji first floor — metres';exportRoot.userData={source:P.source,ceiling_m:10*ft,optional_partition:'omitted',ventilation_shafts:'three confirmed',kitchen:'Approved 14 September: four burners, double bowl sink, equal-width drying rack, hidden RO cutout, sink geyser, single lift-up chimney, fixed corner shelf',pooja:'Operable four-leaf pocket-fold cabinet with full-width fire-safe pull-out diya tray',provisional:P.provisional};const out=await e.parseAsync(exportRoot,{binary:true,onlyVisible:false,maxTextureSize:512});ceilings.visible=saved;return Array.from(new Uint8Array(out));}
};
root.querySelector('[data-action="model"]').addEventListener('click',async()=>{const button=root.querySelector('[data-action="model"]');button.disabled=true;try{const bytes=await window.JAIPUR.glb();const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='jaipur-home-main.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}finally{button.disabled=false;}});
root.dataset.kitchenQa=JSON.stringify(kitchenQA());
function enterHash(){const id=decodeURIComponent(location.hash.slice(1));go(viewpoints[id]?id:'overview');}
window.addEventListener('hashchange',enterHash);setNight(true);enterHash();requestAnimationFrame(animate);RZB.ready.then(()=>{render();window.JAIPUR_READY=true;});
})();
