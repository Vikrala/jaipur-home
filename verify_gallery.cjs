const fs=require('fs'),path=require('path');
const {chromium}=require('/Users/kriti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=path.join(__dirname,'output/jaipur-home');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files','--enable-webgl','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+base+'/index.html');await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete),{timeout:30000});
 const broken=await page.evaluate(()=>[...document.images].filter(i=>i.getAttribute('src')&&i.naturalWidth===0).map(i=>i.getAttribute('src')));const cards=await page.locator('.room-card').count();
 await page.screenshot({path:base+'/renders/gallery-desktop-check.png'});
 await page.locator('.room-card button').first().click();await page.locator('[data-view="measured"]').click();await page.waitForFunction(()=>document.getElementById('modal-image').naturalWidth===1920);const comparison=await page.locator('#modal-image').getAttribute('src');await page.screenshot({path:base+'/renders/gallery-comparison-check.png'});
 await page.locator('#next-room').click();await page.locator('#room-link').click();await page.waitForFunction(()=>window.JAIPUR_READY,{timeout:60000});const linkedRoom=await page.locator('.view-name').textContent();
 await page.goto('file://'+base+'/index.html');await page.setViewportSize({width:390,height:844});await page.screenshot({path:base+'/renders/gallery-mobile-check.png'});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 const report={errors,brokenImages:broken,roomCards:cards,comparisonView:comparison,linked3DRoom:linkedRoom,mobileOverflow:overflow};fs.writeFileSync(base+'/model/gallery-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 await browser.close();if(errors.length||broken.length||cards!==11||overflow||linkedRoom!=='Kitchen / dining')process.exit(1);
})().catch(e=>{console.error(e);process.exit(1);});
