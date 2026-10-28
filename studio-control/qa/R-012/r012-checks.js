// R-012 shared checks (rev 4). Used by verify_r012.cjs (Node + Playwright) and harness.html (any browser).
(function(root){
function runChecks(A,B,log){const ZONE={x0:.7,x1:6.8,z0:20.5,z1:34.3};
 const res=[];const chk=(name,ok,ev)=>{res.push({name,status:ok?'pass':'FAIL',evidence:ev});(log||console.log)((ok?'PASS ':'FAIL ')+name+' :: '+ev);};
 const f=v=>+(+v).toFixed(3),mm=ft=>Math.round(ft*304.8);
 const outside=m=>m.b[3]<ZONE.x0||m.b[0]>ZONE.x1||m.b[5]<ZONE.z0||m.b[2]>ZONE.z1;
 const key=m=>m.n+'|'+m.b.join(',');const ka=new Map(),kb=new Map();
 for(const m of A.meshes.filter(outside))ka.set(key(m),(ka.get(key(m))||0)+1);for(const m of B.meshes.filter(outside))kb.set(key(m),(kb.get(key(m))||0)+1);
 const diff=[...new Set([...ka.keys(),...kb.keys()])].filter(k=>(ka.get(k)||0)!==(kb.get(k)||0));
 chk('No geometry change outside the master bathroom / washing niche envelope',diff.length===0,`${[...ka.values()].reduce((a,b)=>a+b,0)} outside meshes compared; ${diff.length} differ${diff.length?': '+diff.slice(0,5).join(' ; '):''}`);
 const M=n=>B.meshes.filter(m=>m.n===n),one=n=>M(n)[0],col=n=>B.colliders.find(c=>c.name===n);
 const ret=B.colliders.filter(c=>/Master shower glass return/.test(c.name));
 chk('Two glass returns enclose the shower (vanity side and WC side)',ret.length===2,ret.map(c=>c.name+' x '+f(c.x0)+'-'+f(c.x1)+' z '+f(c.z0)+'-'+f(c.z1)).join(' | '));
 const tile=Math.max(...M('Master shower vertical green tile').map(m=>m.b[3]));const front=Math.max(...ret.map(c=>c.x1));
 const zA=Math.min(...ret.map(c=>(c.z0+c.z1)/2)),zB=Math.max(...ret.map(c=>(c.z0+c.z1)/2));
 chk('Shower clear depth ≥ 890 mm (nominal 900) and ≥ 1,200 mm between returns',mm(front-tile)>=890&&mm(zB-zA)>=1200,`${mm(front-tile)} mm deep (tile face to front line) × ${mm(zB-zA)} mm between glass centres`);
 const east=Math.min(...M('Master east pale stone wall').map(m=>m.b[0]));
 chk('Dry route from door to WC/washer is at least 700 mm wall-to-glass and never crosses the shower floor',mm(east-front)>=700,`front of shower ${f(front)} ft to east wall face ${f(east)} ft = ${mm(east-front)} mm`);
 const eastFix=B.meshes.filter(m=>m.b[0]>front+.5&&m.b[3]<=east+.01&&m.b[2]<30.0075&&m.b[5]>21.0075&&m.b[1]<6.5&&m.b[4]>2.5&&m.b[0]<east-.01);const pinch=Math.min(east,...eastFix.map(m=>m.b[0]));
 chk('Narrowest dry route (at towel bar/hooks) ≥ 650 mm; 900 mm walker width is NOT met (recorded trade-off)',mm(pinch-front)>=650,`narrowest ${mm(pinch-front)} mm at x ${f(pinch)} (${eastFix.length} wall fittings between 760 and 1,980 mm high considered)`);
 const wc=B.fixtures.find(x=>x.name==='Master WC');
 const zBface=Math.max(...ret.map(c=>c.z1))-.01;chk('WC centreline to nearest side obstruction ≥ 400 mm (to glass FACE)',mm(wc.z-zBface)>=400&&mm(30.0075-wc.z)>=400,`to glass face ${mm(wc.z-zBface)} mm (centre ${mm(wc.z-zB)} mm), to W9 wall ${mm(30.0075-wc.z)} mm`);
 const shf=B.fixtures.find(x=>x.name==='Master shower'&&x.type==='shower');chk('Shower feature record is named and carries the rev 4 drain note',!!shf&&/back wall/.test(shf.source),`${shf?shf.name+': '+shf.source.slice(0,90)+'…':'missing'}`);
 const van=col('Master vanity'),zAface=Math.min(...ret.map(c=>c.z0))+.01;chk('Vanity clear of the vanity-side return (to glass face)',van.z1<zAface,`vanity edge z ${f(van.z1)}, glass face z ${f(zAface)} (${mm(zAface-van.z1)} mm gap)`);
 const mir=one('Master vanity arched mirror backlight');chk('Mirror stays within the vanity width',mir.b[2]>=van.z0-.01&&mir.b[5]<=van.z1+.01,`mirror z ${mir.b[2]}-${mir.b[5]}, vanity ${f(van.z0)}-${f(van.z1)}`);
 const mix=one('Master shower thermostatic mixer');chk('Shower mixer fixed to the tiled wall (≤ 30 mm proud of tile to its back)',mm(mix.b[0]-tile)<=30,`mixer back x ${mix.b[0]}, tile face ${f(tile)} → ${mm(mix.b[0]-tile)} mm`);
 const drain=one('Master shower linear drain along back wall');
 chk('Rev 4: linear drain runs along the back wall under the mixer, ≥ 600 mm behind the open front',!!drain&&drain.b[0]>=tile-.005&&drain.b[0]-tile<=.05&&mm(front-drain.b[3])>=600&&drain.b[2]<mix.b[2]&&drain.b[5]>mix.b[5],`drain x ${drain.b[0]}-${drain.b[3]} (tile face ${f(tile)}, front ${f(front)} → ${mm(front-drain.b[3])} mm behind the front); spans z ${drain.b[2]}-${drain.b[5]}, mixer z ${mix.b[2]}-${mix.b[5]}`);
 const AFD={x:1.27,z:26.37},outlet=B.fixtures.find(x=>x.name==='Master shower drain outlet');
 chk('Drain channel passes over the architect floor-drain point; outlet within 100 mm of it',drain.b[2]<=AFD.z&&drain.b[5]>=AFD.z&&!!outlet&&mm(Math.hypot(outlet.x-AFD.x,outlet.z-AFD.z))<=100,`architect FD (plan raster) x ${AFD.x} z ${AFD.z}; channel z ${drain.b[2]}-${drain.b[5]}; outlet x ${outlet&&f(outlet.x)} z ${outlet&&f(outlet.z)} → ${outlet&&mm(Math.hypot(outlet.x-AFD.x,outlet.z-AFD.z))} mm`);
 chk('Old entry drain removed',M('Master shower linear drain at entry').length===0,`${M('Master shower linear drain at entry').length} found`);
 const bar=one('Master towel bar');chk('East-wall towel bar outside the wet zone (opposite the opening; 2nd towel point)',bar.b[0]>front&&bar.b[2]<zB&&bar.b[5]>zA,`bar x ${bar.b[0]}-${bar.b[3]} z ${bar.b[2]}-${bar.b[5]}; ${mm(bar.b[0]-front)} mm beyond the front line`);
 const rail=one('Master glass-mounted towel rail');const rd=rail?Math.hypot(Math.max(0,front-rail.b[3]),Math.max(0,zAface-rail.b[5])):99;
 chk('Rev 4: a towel rail within 450 mm of the shower opening corner, on the dry side, clear of vanity and door landing',!!rail&&rail.b[5]<=zAface+.001&&mm(rd)<=450&&rail.b[0]>van.x1&&rail.b[3]<3.6225&&mm(zAface-rail.b[5])>=40&&rail.b[1]>2.6&&rail.b[4]<4.2,`rail clear of glass ${rail&&mm(zAface-rail.b[5])} mm (≥ 40 for a folded towel); rail x ${rail&&rail.b[0]}-${rail&&rail.b[3]} y ${rail&&mm(rail.b[1])}-${rail&&mm(rail.b[4])} mm z ${rail&&rail.b[2]}-${rail&&rail.b[5]}; ${mm(rd)} mm from the opening corner (${f(front)}, ${f(zAface)}); vanity ends x ${f(van.x1)}, D3 opening starts x 3.6225`);
 const blk=B.fixtures.filter(x=>/blocking/i.test(x.name));
 chk('Rev 4: grab-bar and seat blocking recorded (shower mixer, fold-down seat, WC)',blk.length>=3,blk.map(x=>x.name).join(' | '));
 const marble=one('Washer platform sealed marble top at 2 ft'),wm=one('Front load washing machine');
 chk('Marble top finished level 610 mm',Math.abs(mm(marble.b[4])-610)<=2,`${mm(marble.b[4])} mm`);
 const valve=B.fixtures.find(x=>x.name==='Washer inlet angle valve'),sock=B.fixtures.find(x=>/Washing machine RCD/.test(x.name));
 chk('Inlet valve and socket above the machine top and within 300 mm of its front face',valve.height>wm.b[4]&&sock.height>wm.b[4]&&mm(valve.z-wm.b[2])<=300&&mm(sock.z-wm.b[2])<=300,`machine top ${f(wm.b[4])} ft; valve y ${valve.height} z ${f(valve.z)}; socket y ${sock.height} z ${f(sock.z)}; front face z ${wm.b[2]}`);
 chk('Water and electrical points on opposite walls (≥ 600 mm apart)',mm(Math.abs(valve.x-sock.x))>=600,`${mm(Math.abs(valve.x-sock.x))} mm apart`);
 const hoses=B.meshes.filter(m=>m.n===''||/Tube/.test(m.n));
 const sp=B.fixtures.find(x=>/standpipe/.test(x.name));chk('Drain standpipe is behind the platform, not in front of the door',sp.z>marble.b[5],`standpipe z ${f(sp.z)}, platform back ${marble.b[5]}`);
 const cab=M('Laminate shutter').filter(m=>m.b[2]>32&&m.b[0]>3.7&&m.b[3]<6.4);const cabBottom=Math.min(...cab.map(m=>m.b[1]));
 chk('Overhead cupboard leaves ≥ 450 mm above the machine for services and access',mm(cabBottom-wm.b[4])>=450,`machine top ${wm.b[4]} ft, shutter bottom ${f(cabBottom)} ft → ${mm(cabBottom-wm.b[4])} mm`);
 // Rev 3: 25 L vertical geyser, outside the spray, clear of the door swing, above head height.
 const gy=one('Vertical 25 L storage geyser'),gyx=B.fixtures.find(x=>x.name==='Master 25 L vertical geyser');
 chk('25 L vertical geyser is in the bathroom, vertical and outside the shower',!!gy&&(gy.b[4]-gy.b[1])>(gy.b[3]-gy.b[0])&&gy.b[5]<zA&&gy.b[3]<front,`body x ${gy.b[0]}-${gy.b[3]} y ${gy.b[1]}-${gy.b[4]} z ${gy.b[2]}-${gy.b[5]}; shower starts z ${f(zA)}`);
 chk('Geyser clear of the D3 opening and swing, with ≥ 2,100 mm headroom below it',gy.b[3]<3.6225&&Math.hypot(6.30-gy.b[3],gy.b[5]-21.0075)>2.6&&mm(gy.b[1])>=2100,`geyser east edge x ${gy.b[3]} vs D3 opening 3.6225; underside ${mm(gy.b[1])} mm`);
 chk('Geyser top leaves ≥ 100 mm below the 10 ft ceiling and clears the mirror',mm(10-gy.b[4])>=100&&gy.b[1]>mir.b[4],`top ${mm(gy.b[4])} mm, ceiling 3048 mm; mirror top ${mm(mir.b[4])} mm`);
 chk('Old horizontal geyser over the door removed',M('Horizontal storage geyser provision').length===0,`${M('Horizontal storage geyser provision').length} found`);
 // Rev 3: the linear drain must never sit on the route from the door to the vanity, WC or washer.
 const leafW=6.30-3.6225,van2=col('Master vanity');
 // The D3 opening starts 65 mm west of the shower front, but that strip is stopped by the vanity-side glass
 // return at zA, so the landing is split: full opening width up to the return, walkway width beyond it.
 const routes=[{n:'door landing (before the glass return)',x0:3.6225,x1:6.375,z0:21.0075,z1:zA},{n:'door swing beyond the return',x0:front,x1:6.375,z0:zA,z1:21.0075+leafW},{n:'dry walkway to WC/washer',x0:front,x1:6.375,z0:21.0075,z1:30.0075},{n:'vanity standing zone',x0:van2.x1,x1:6.375,z0:21.0075,z1:zA}];
 const hit=(m,r)=>m.b[0]<r.x1&&m.b[3]>r.x0&&m.b[2]<r.z1&&m.b[5]>r.z0;
 const dr=[...M('Master shower linear drain along back wall'),...M('Linear drain slot')];
 const hits=routes.filter(r=>dr.some(m=>hit(m,r))).map(r=>r.n);
 chk('Linear drain and its slots stay inside the shower, off every walking route',hits.length===0&&dr.every(m=>m.b[3]<front&&m.b[2]>zA&&m.b[5]<zB),`drain x ${drain.b[0]}-${drain.b[3]} z ${drain.b[2]}-${drain.b[5]}; shower front x ${f(front)}, returns z ${f(zA)}-${f(zB)}; routes hit: ${hits.length?hits.join(', '):'none'}`);
 const bord=one('Master shower black border tile');const flushParts=[bord,...dr];const proud=Math.max(...flushParts.map(m=>(m.b[4]-.008)*304.8));
 chk('Drain grate, slots and black border are flush with the floor (≤ 1 mm proud)',proud<=1,`highest top ${proud.toFixed(2)} mm above the ${mm(.008)} mm floor finish (${flushParts.length} parts: border, drain body, slots)`);
 chk('Door D3 swing (radius ≈ leaf width) clears the shower front glass',Math.hypot(6.30-front,zA-21.0075)>2.6,`hinge (6.30, 21.01) to return front corner = ${f(Math.hypot(6.30-front,zA-21.0075))} ft vs leaf ~2.6 ft`);
 // Rev 4: WC upper cupboard, shower downlight and geyser PRV/hot-water route are now checked, not just drawn.
 const cup=one('Master WC shallow sage upper cupboard');
 chk('WC upper cupboard: bottom ≥ 2,000 mm, depth ≤ 200 mm, ≥ 100 mm below ceiling, beyond the WC-side return',!!cup&&mm(cup.b[1])>=2000&&mm(cup.b[3]-cup.b[0])<=200&&mm(10-cup.b[4])>=100&&cup.b[2]>zB,`bottom ${cup&&mm(cup.b[1])} mm, top ${cup&&mm(cup.b[4])} mm, depth ${cup&&mm(cup.b[3]-cup.b[0])} mm, z ${cup&&cup.b[2]}-${cup&&cup.b[5]} (return ${f(zB)})`);
 const dl=B.fixtures.find(x=>x.name==='bath-master downlight'&&x.x<front&&x.z>zA&&x.z<zB),dlr=B.fixtures.find(x=>x.name==='Master shower downlight wet-zone rating');
 chk('Downlight inside the shower is flagged IP65 / RCD',!!dl&&!!dlr&&/IP65/.test(dlr.source),`downlight at x ${dl&&f(dl.x)} z ${dl&&f(dl.z)} inside the enclosure; note: ${dlr&&dlr.source}`);
 const prv=B.fixtures.find(x=>x.name==='Geyser PRV discharge route'),hw=B.fixtures.find(x=>x.name==='Geyser hot-water route to shower mixer');
 chk('Geyser PRV discharge and hot-water route are specified (not left mid-wall)',!!prv&&/tundish|trap|waste/i.test(prv.source)&&!!hw,`PRV: ${prv&&prv.source} | HW: ${hw&&hw.source}`);
 chk('No browser errors (captured by injected error/console hook, verified by a probe)',B.errorHookOk===true&&B.errors.length===0&&A.errors.length===0,`hook probe captured: ${B.errorHookOk}; draft errors ${JSON.stringify(B.errors)}; baseline errors ${JSON.stringify(A.errors)}`);
 chk('Draft GLB exports (export only, not a geometry test)',B.glb>100000,`GLB ${B.glb} bytes`);
 return res;}
function dumpScene(){const J=window.JAIPUR,T=window.THREE;J.building.updateMatrixWorld(true);const r=v=>+v.toFixed(3);const meshes=[];
 J.building.traverse(o=>{if(o.isMesh){const b=new T.Box3().setFromObject(o);meshes.push({n:o.name,b:[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(r)});}});
 return {meshes,colliders:J.colliders,fixtures:J.fixtures};}
const api={runChecks,dumpScene};if(typeof module!=='undefined')module.exports=api;else root.R012=api;
})(typeof window!=='undefined'?window:globalThis);
