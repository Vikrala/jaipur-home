const fs = require('fs');
const path = require('path');
const {chromium} = require('/Users/kriti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '../..');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage({viewport: {width: 1500, height: 920}, deviceScaleFactor: 1});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.join(root, 'walkthrough.html'));
  await page.waitForFunction(() => window.JAIPUR_READY, null, {timeout: 90000});
  const audit = await page.evaluate(() => {
    const floors = JAIPUR.P.rooms.map(r => {
      const mesh = JAIPUR.building.getObjectByName(r.name + ' flooring');
      return {room: r.id, material: mesh?.material?.name || null};
    });
    const floor = JAIPUR.building.getObjectByName('Living flooring').material;
    return {
      tileError: window.JAIPUR_FLOOR_TILE_ERROR || null,
      material: floor.name,
      repeat: [floor.map.repeat.x, floor.map.repeat.y],
      roughness: floor.roughness,
      clearcoat: floor.clearcoat,
      floors
    };
  });
  if (audit.tileError || audit.material !== 'Glossy ivory showroom floor tile, 2 ft x 4 ft') {
    throw new Error('Floor tile did not load: ' + JSON.stringify(audit));
  }
  const renders = path.join(root, 'renders');
  await page.evaluate(() => JAIPUR.setNight(false));
  const views = ['overview', 'living', 'living-reverse', 'kitchen', 'master', 'bedroom-2', 'bedroom-3', 'lobby'];
  for (const id of views) {
    const uri = await page.evaluate(id => JAIPUR.capture(id, 1800, 1200), id);
    fs.writeFileSync(path.join(renders, 'floor-tile-' + id + '.png'), Buffer.from(uri.split(',')[1], 'base64'));
  }
  await page.evaluate(() => JAIPUR.setNight(true));
  const evening = await page.evaluate(() => JAIPUR.capture('living', 1800, 1200));
  fs.writeFileSync(path.join(renders, 'floor-tile-living-evening.png'), Buffer.from(evening.split(',')[1], 'base64'));
  const glbBase64 = await page.evaluate(async () => {
    const bytes = await JAIPUR.glb();
    const data = new Uint8Array(bytes);
    const chunks = [];
    const chunkSize = 24576; // divisible by 3, so base64 chunks join without padding
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(btoa(String.fromCharCode(...data.subarray(i, i + chunkSize))));
    }
    return chunks.join('');
  });
  const glb = Buffer.from(glbBase64, 'base64');
  fs.writeFileSync(path.join(root, 'model', 'jaipur-first-floor.glb'), glb);
  const result = {browser: process.env.BROWSER_BIN || 'Google Chrome', errors, audit, views: [...views, 'living-evening'], glbBytes: glb.length};
  fs.writeFileSync(path.join(root, 'model', 'floor-tile-render-check.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({errors, audit, views: result.views, glbBytes: glb.length}, null, 2));
  await browser.close();
})().catch(e => {console.error(e); process.exit(1);});
