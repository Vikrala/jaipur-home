// Rebuild Bedroom 2 review views and the maintained GLB from the standalone walkthrough.
const fs=require('fs'),path=require('path');
const {chromium}=require('/Users/kriti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../..'),renders=path.join(root,'renders');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1500,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'walkthrough.html'));
  await page.waitForFunction(()=>window.JAIPUR_READY,null,{timeout:90000});
  const audit=await page.evaluate(()=>{
   const w=JAIPUR.bedroom2Wardrobe,main=JAIPUR.building.getObjectByName('Bedroom 2 two-bay sliding wardrobe');
   const bb=o=>new THREE.Box3().setFromObject(o),mm=v=>Math.round(v*304.8);
   const gable=main?.getObjectByName('Bedroom 2 right bay 229 mm full-height compartment gable');
   const endGables=[];main?.traverse(o=>{if(o.name==='Bedroom 2 wardrobe end gable')endGables.push(bb(o));});
   const glass=JAIPUR.building.getObjectByName('Bedroom 2 mirror glass');
   const cornerDoor=JAIPUR.building.getObjectByName('Bedroom 2 corner upper cabinet hinged shutter');
   const niche=JAIPUR.building.getObjectByName('Bedroom 2 bedside open shelf and upper cabinet');
   const top=JAIPUR.building.getObjectByName('Bedroom 2 mattress-height bedside top');
   const leafL=main?.getObjectByName('Bedroom 2 left broad sliding face'),leafR=main?.getObjectByName('Bedroom 2 right broad sliding face');
   const ceiling=JAIPUR.ceilings.getObjectByName('bedroom-2 east dropped band');
   const cb=bb(ceiling),gb=bb(gable),eb=endGables.sort((a,b)=>b.min.z-a.min.z)[0],nb=bb(niche),tb=bb(top),lb=bb(leafL),rb=bb(leafR),mb=bb(glass),db=bb(cornerDoor);
   let leds=0,compShelves=0;main.traverse(o=>{if(/compartment fixed shelf/.test(o.name))compShelves++;});niche.traverse(o=>{if(o.name==='Bedroom 2 niche inner-corner warm LED profile')leds++;});
   return {main:!!main,lowerLeaves:Object.keys(w.slides),upperLeafCount:w.upperDoors.length,
    wardrobeLengthMm:mm(w.W),nicheWidthMm:mm(nb.max.z-nb.min.z),compartmentClearMm:mm(eb.min.z-gb.max.z),
    tableFrontToLeafGapMm:mm(lb.min.z-tb.max.z),leafOverlapMm:mm(lb.max.z-rb.min.z),
    mirrorTopMm:mm(mb.max.y),cornerDoorBottomMm:mm(db.min.y),nicheLedProfiles:leds,compartmentShelves:compShelves,ceilingBandProjectionMm:mm(24.1425-cb.min.x),
    wardrobeTop:w.H,ceilingFaceX:cb.min.x,ceilingBottom:cb.min.y,
    cornerUpperHinge:!!w.nicheUpperHinge,floatingTable:!!top,tileError:window.JAIPUR_FLOOR_TILE_ERROR||null};
  });
  if(errors.length||!audit.main||audit.lowerLeaves.join(',')!=='left,right'||audit.upperLeafCount!==4||
     Math.abs(audit.compartmentClearMm-229)>1||Math.abs(audit.wardrobeLengthMm-3135)>2||Math.abs(audit.nicheWidthMm-601)>3||
     audit.tableFrontToLeafGapMm<5||Math.abs(audit.leafOverlapMm-35)>2||audit.mirrorTopMm>=audit.cornerDoorBottomMm||audit.nicheLedProfiles!==8||
     Math.abs(audit.ceilingFaceX-23.3225)>.005||audit.compartmentShelves!==0||Math.abs(audit.ceilingBottom-9.58)>.005||
     !audit.cornerUpperHinge||!audit.floatingTable||audit.tileError)throw new Error(JSON.stringify({errors,audit}));
  await page.evaluate(()=>JAIPUR.setNight(false));
  async function save(view,name){const uri=await page.evaluate(id=>JAIPUR.capture(id,1800,1200),view);fs.writeFileSync(path.join(renders,name),Buffer.from(uri.split(',')[1],'base64'));}
  for(const [view,name] of [
   ['overview','overview.png'],['overview','walkthrough-overview.png'],['overview','floor-tile-overview.png'],
   ['bedroom-2','bedroom-2.png'],['bedroom-2','floor-tile-bedroom-2.png'],
   ['bedroom-2','final-bedroom-2.png'],['bedroom-2-entry','final-bedroom-2-entry.png'],
   ['bedroom-2-study','bedroom-2-study.png'],['bedroom-2-wardrobe','bedroom-2-wardrobe-closed.png'],
   ['bedroom-2-wardrobe-detail','bedroom-2-wardrobe-closed-detail.png'],
   ['bedroom-2-wardrobe-upper','bedroom-2-ceiling-and-upper-storage.png'],['bedroom-2-niche','bedroom-2-niche.png']])await save(view,name);
  await page.click('[data-b2-slide="right"]');
  await page.waitForFunction(()=>Math.abs(JAIPUR.bedroom2Wardrobe.slides.right.position.x+JAIPUR.bedroom2Wardrobe.slideX)<.02);
  await page.click('[data-b2-upper="right"]');
  await page.waitForFunction(()=>JAIPUR.bedroom2Wardrobe.upperDoors.filter(p=>p.side==='right').every(p=>Math.abs(p.hinge.rotation.y-p.openAngle)<.02));
  await save('bedroom-2-wardrobe-detail','bedroom-2-wardrobe-right-open.png');
  const rightState=await page.evaluate(()=>({lower:document.querySelector('[data-b2-slide="right"]').getAttribute('aria-pressed'),upper:document.querySelector('[data-b2-upper="right"]').getAttribute('aria-pressed')}));
  if(rightState.lower!=='true'||rightState.upper!=='true')throw new Error('Right control state mismatch '+JSON.stringify(rightState));
  await page.click('[data-b2-upper="corner"]');
  await page.waitForFunction(()=>Math.abs(JAIPUR.bedroom2Wardrobe.nicheUpperHinge.rotation.y+1.25)<.02);
  const cornerOpened=await page.locator('[data-b2-upper="corner"]').getAttribute('aria-pressed');
  await page.click('[data-b2-upper="corner"]');
  await page.waitForFunction(()=>Math.abs(JAIPUR.bedroom2Wardrobe.nicheUpperHinge.rotation.y)<.02);
  if(cornerOpened!=='true')throw new Error('Corner upper-door control did not open');
  await page.click('[data-b2-slide="left"]');
  await page.waitForFunction(()=>Math.abs(JAIPUR.bedroom2Wardrobe.slides.left.position.x-JAIPUR.bedroom2Wardrobe.slideX)<.02);
  await save('bedroom-2-wardrobe-detail','bedroom-2-wardrobe-left-open.png');
  await page.evaluate(()=>{JAIPUR.setBedroom2Sliding('closed',true);JAIPUR.setBedroom2UpperDoors('right',false,true);});
  const glbBase64=await page.evaluate(async()=>{
   const bytes=new Uint8Array(await JAIPUR.glb()),chunks=[];
   for(let i=0;i<bytes.length;i+=24576)chunks.push(btoa(String.fromCharCode(...bytes.subarray(i,i+24576))));
   return chunks.join('');
  });
  const glb=Buffer.from(glbBase64,'base64');if(glb.toString('ascii',0,4)!=='glTF')throw new Error('Invalid GLB header');
  fs.writeFileSync(path.join(root,'model','jaipur-first-floor.glb'),glb);
  const result={date:'2026-11-01',scope:'Bedroom 2 open 229 mm compartment and east ceiling band projecting from the upper-door face',browserErrors:errors,audit,
   controls:{rightOpen:rightState,leftOpen:true,upperRightOpened:true,cornerUpperOpenedAndClosed:true},
   views:['overview','bedroom-2','bedroom-2-entry','bedroom-2-study','bedroom-2-wardrobe-closed','bedroom-2-wardrobe-closed-detail','bedroom-2-wardrobe-right-open','bedroom-2-wardrobe-left-open','bedroom-2-ceiling-and-upper-storage','bedroom-2-niche'],
   glbBytes:glb.length,glbStaticState:'all Bedroom 2 wardrobe doors closed'};
  fs.writeFileSync(path.join(root,'model','bedroom-2-wardrobe-checks.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
