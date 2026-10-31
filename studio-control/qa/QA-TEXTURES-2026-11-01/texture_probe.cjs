const { chromium } = require('/Users/kriti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const here = __dirname;
  const pagePath = path.resolve(here, '../../../output/jaipur-home/walkthrough.html');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(pathToFileURL(pagePath).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.JAIPUR_READY === true, { timeout: 120000 });
  const results = await page.evaluate(async () => {
    const J = window.JAIPUR;
    const sample = t => {
      if (!t?.image?.width || !t?.image?.height) return null;
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d'); ctx.drawImage(t.image, 0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    const materials = new Map();
    J.scene.traverse(o => {
      if (!o.isMesh || !o.material) return;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (!materials.has(m.name)) materials.set(m.name, { name: m.name, color: m.color?.getHexString(), map: !!m.map,
          normal: !!m.normalMap, roughness: !!m.roughnessMap, image: m.map?.image?.width && m.map?.image?.height ? `${m.map.image.width}x${m.map.image.height}` : null,
          mapMean: sample(m.map), normalMean: sample(m.normalMap), roughnessMean: sample(m.roughnessMap),
          meshes: 0 });
        materials.get(m.name).meshes++;
      }
    });
    const tv = J.building.getObjectByName('Living TV ceiling-height warm stone backing panel');
    const pooja = J.building.getObjectByName('Final retractable-door pooja unit');
    const ray = new window.THREE.Raycaster();
    const hits = [2.5, 5.5, 7.5].map(y => {
      const from = new window.THREE.Vector3(10.8, y, 32.1);
      ray.set(from, new window.THREE.Vector3(1, 0, 0));
      return { y, objects: ray.intersectObjects(J.building.children, true).slice(0, 8).map(h => ({ name: h.object.name, material: h.object.material?.name, x: h.point.x, distance: h.distance })) };
    });
    return { materials: [...materials.values()], hits, tv: { material: tv.material.name, mapMean: sample(tv.material.map), position: tv.position.toArray(), size: new window.THREE.Box3().setFromObject(tv).getSize(new window.THREE.Vector3()).toArray(), normalScale: tv.material.normalScale?.toArray(), roughness: tv.material.roughness, clearcoat: tv.material.clearcoat },
      pooja: pooja.children.filter(o => /drawer|tray front|rail below/i.test(o.name)).map(o => ({ name: o.name, y: o.position.y, z: o.position.z, material: o.material?.name })) };
  });
  for (const night of [false, true]) for (const ao of [false, true]) {
    const uri = await page.evaluate(({ night, ao }) => { window.JAIPUR.setNight(night); window.JAIPUR.setAO(ao); return window.JAIPUR.capture('tv-wall', 1400, 1000); }, { night, ao });
    fs.writeFileSync(path.join(here, `probe-tv-${night ? 'evening' : 'day'}-${ao ? 'ao' : 'plain'}.png`), Buffer.from(uri.split(',')[1], 'base64'));
  }
  for (const night of [false, true]) {
    const uri = await page.evaluate(night => { window.JAIPUR.setNight(night); window.JAIPUR.setAO(true); return window.JAIPUR.capture('pooja', 1400, 1000); }, night);
    fs.writeFileSync(path.join(here, `probe-pooja-${night ? 'evening' : 'day'}.png`), Buffer.from(uri.split(',')[1], 'base64'));
  }
  fs.writeFileSync(path.join(here, 'probe-results.json'), JSON.stringify({ ...results, errors }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ materials: results.materials.length, errors, tv: results.tv, poojaRails: results.pooja.filter(o => o.name.includes('rail')).length }));
})().catch(error => { console.error(error); process.exit(1); });
