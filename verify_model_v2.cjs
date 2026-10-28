const fs=require('fs'),path=require('path');
const {chromium}=require('/Users/kriti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=path.join(__dirname,'output/jaipur-home-v2');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files','--disable-web-security','--enable-webgl','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1500,height:920},deviceScaleFactor:1});let errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('file://'+base+'/walkthrough.html');await page.waitForFunction(()=>window.JAIPUR_READY,{timeout:60000});await page.waitForTimeout(2000);
 await page.screenshot({path:base+'/renders/walkthrough-overview.png',fullPage:true});
 const state=await page.evaluate(()=>({fixtures:JAIPUR.fixtures,furniture:JAIPUR.furniture,colliders:JAIPUR.colliders,walls:JAIPUR.P.walls.length,columns:JAIPUR.P.columns.length,ceiling:JAIPUR.ceiling,meshCount:JAIPUR.renderer.info.render.calls,kitchenStorage:JAIPUR.kitchenStorage}));
 for(const id of ['overview','living','living-reverse','kitchen','kitchen-detail','master','master-reverse','bedroom-2','bedroom-3','bath-master','bath-master-reverse','bath-common','washing','store','lobby','stairs','terrace']){
  let uri=await page.evaluate(id=>JAIPUR.capture(id,1920,1280),id);fs.writeFileSync(base+'/renders/'+id+'.png',Buffer.from(uri.split(',')[1],'base64'));
 }
 await page.evaluate(()=>JAIPUR.setStorageInspection(true));
 const shelves=await page.evaluate(()=>JAIPUR.capture('kitchen',1920,1280));fs.writeFileSync(base+'/renders/kitchen-shelves.png',Buffer.from(shelves.split(',')[1],'base64'));await page.evaluate(()=>JAIPUR.setStorageInspection(false));
 await page.evaluate(()=>{JAIPUR.renderer.setSize(1100,1900,false);JAIPUR.camera.aspect=1100/1900;});
 const overhead=await page.evaluate(()=>JAIPUR.overhead());fs.writeFileSync(base+'/renders/measured-overhead.png',Buffer.from(overhead.split(',')[1],'base64'));await page.evaluate(()=>JAIPUR.resetUp());
 // Verify controls, closed doors, evening mode and responsive layout.
 await page.locator('.room-select').selectOption('master');await page.locator('[data-action="doors"]').click();const closed=await page.evaluate(()=>JAIPUR.doorPivots.every(p=>!p.open));await page.locator('[data-action="doors"]').click();
 await page.locator('[data-action="light"]').click();const evening=await page.evaluate(()=>JAIPUR.capture('living',1920,1280));fs.writeFileSync(base+'/renders/living-evening.png',Buffer.from(evening.split(',')[1],'base64'));await page.locator('[data-action="light"]').click();
 const clearances=await page.evaluate(()=>{return Object.entries(JAIPUR.viewpoints).filter(([id,v])=>v.pos).map(([id,v])=>{const [x,y,z]=v.pos;let hit=JAIPUR.colliders.filter(c=>c.type!=='stairs'&&x>c.x0&&x<c.x1&&z>c.z0&&z<c.z1&&y<c.h);return{id,overlap:hit.map(c=>c.name)};});});
 await page.evaluate(()=>{JAIPUR.viewpoints.navigation={name:'Navigation check',pos:[10,5,32],target:[10,5,40]};JAIPUR.go('navigation');});await page.locator('canvas').focus();await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.up('w');const movement=await page.evaluate(()=>JAIPUR.camera.position.z-32);
 await page.evaluate(()=>{JAIPUR.viewpoints.navigation={name:'Counter check',pos:[10,5,45.5],target:[10,5,60]};JAIPUR.go('navigation');});await page.locator('canvas').focus();await page.keyboard.down('w');await page.waitForTimeout(2500);await page.keyboard.up('w');const stopZ=await page.evaluate(()=>{let z=JAIPUR.camera.position.z;delete JAIPUR.viewpoints.navigation;return z;});
 const navigation={keyboardMovementFt:movement,movementPassed:movement>.2,counterStopZ:stopZ,counterCollisionPassed:stopZ<47&&stopZ>46};
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>JAIPUR.go('kitchen'));await page.waitForTimeout(500);await page.screenshot({path:base+'/renders/mobile-check.png',fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 fs.writeFileSync(base+'/model/quality-checks.json',JSON.stringify({errors,closedDoorToggle:closed,mobileOverflow:overflow,viewpointOverlaps:clearances,navigation,...state},null,2));
 await page.setViewportSize({width:1500,height:920});const bytes=await page.evaluate(()=>JAIPUR.glb());fs.writeFileSync(base+'/model/jaipur-first-floor.glb',Buffer.from(bytes));
 console.log(JSON.stringify({errors,closedDoorToggle:closed,mobileOverflow:overflow,navigation,viewpointOverlaps:clearances,fixtureCount:state.fixtures.length,meshCount:state.meshCount,glbBytes:bytes.length},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
