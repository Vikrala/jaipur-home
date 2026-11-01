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
  try {
    const page = await browser.newPage({viewport: {width: 1500, height: 920}, deviceScaleFactor: 1});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + path.join(root, 'walkthrough.html'));
    await page.waitForFunction(() => window.JAIPUR_READY, null, {timeout: 90000});
    const audit = await page.evaluate(() => {
      const names = ['Living rounded walnut tray top', 'Living raised walnut tray rim',
        'Living coffee table plus support east-west', 'Living coffee table plus support north-south'];
      const found = Object.fromEntries(names.map(name => [name, !!JAIPUR.building.getObjectByName(name)]));
      const stools = JAIPUR.building.children.filter(o => o.name.startsWith('Living olive storage stool — '));
      const corners = stools.map(o => o.userData.corner).sort();
      const table = JAIPUR.colliders.find(o => o.name === 'Centre table');
      const sofa = JAIPUR.colliders.find(o => o.name === 'L sofa west');
      const console = JAIPUR.colliders.find(o => o.name === 'Living TV floating console with hidden ventilated service bays');
      const sideClearanceMm = {
        sofa: Math.round((table.x0 - sofa.x1) * 304.8),
        console: Math.round((console.x0 - table.x1) * 304.8)
      };
      return {found, stoolCount: stools.length, corners, table, sideClearanceMm, floorTileError: window.JAIPUR_FLOOR_TILE_ERROR || null};
    });
    if (errors.length || audit.floorTileError || Object.values(audit.found).some(v => !v) || audit.stoolCount !== 4 ||
        audit.corners.join(',') !== 'TV north,TV south,sofa north,sofa south' ||
        audit.sideClearanceMm.sofa < 914 || audit.sideClearanceMm.console < 914) {
      throw new Error(JSON.stringify({errors, audit}));
    }
    await page.evaluate(() => JAIPUR.setNight(false));
    for (const [view, filename] of [
      ['overview', 'floor-tile-overview.png'],
      ['living', 'floor-tile-living.png'],
      ['living-reverse', 'floor-tile-living-reverse.png'],
      ['living-table', 'living-table-detail.png']
    ]) {
      const uri = await page.evaluate(id => JAIPUR.capture(id, 1800, 1200), view);
      fs.writeFileSync(path.join(root, 'renders', filename), Buffer.from(uri.split(',')[1], 'base64'));
    }
    // Inspection only: remove the tabletop from this still to reveal all four
    // stool bays and the intersecting timber support. Restore it before export.
    const underframe = await page.evaluate(() => {
      const top = JAIPUR.building.getObjectByName('Living rounded walnut tray top');
      const rim = JAIPUR.building.getObjectByName('Living raised walnut tray rim');
      top.visible = rim.visible = false;
      const uri = JAIPUR.capture('living-table', 1800, 1200);
      top.visible = rim.visible = true;
      JAIPUR.render();
      return uri;
    });
    fs.writeFileSync(path.join(root, 'renders', 'living-table-underframe.png'), Buffer.from(underframe.split(',')[1], 'base64'));
    await page.evaluate(() => JAIPUR.setNight(true));
    const evening = await page.evaluate(() => JAIPUR.capture('living', 1800, 1200));
    fs.writeFileSync(path.join(root, 'renders', 'floor-tile-living-evening.png'), Buffer.from(evening.split(',')[1], 'base64'));
    const glbBase64 = await page.evaluate(async () => {
      const bytes = await JAIPUR.glb();
      const data = new Uint8Array(bytes);
      const chunks = [];
      for (let i = 0; i < data.length; i += 24576) {
        chunks.push(btoa(String.fromCharCode(...data.subarray(i, i + 24576))));
      }
      return chunks.join('');
    });
    const glb = Buffer.from(glbBase64, 'base64');
    if (glb.toString('ascii', 0, 4) !== 'glTF') throw new Error('Invalid GLB header');
    fs.writeFileSync(path.join(root, 'model', 'jaipur-first-floor.glb'), glb);
    fs.writeFileSync(path.join(root, 'model', 'living-table-checks.json'), JSON.stringify({errors, audit, glbBytes: glb.length, views: ['overview', 'living', 'living-reverse', 'living-table', 'living-table-underframe-inspection', 'living-evening']}, null, 2));
    console.log(JSON.stringify({errors, audit, glbBytes: glb.length}, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
