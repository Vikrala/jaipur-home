# R-008 draft: realism pass (materials, light, soft shadows) — NOT PROMOTED

Status: draft. Baseline `output/jaipur-home/` is untouched. Scope approved 13 Oct 2026 (route A then B; 2-3 mm edge radii).

## What changed (visual only)
- Procedural PBR texture sets (albedo + normal + roughness) in real-world feet: vitrified tile with 2 ft joints, bath tile, TV stone, walnut veneer (grain follows the long side of each panel), painted plaster, suede laminate, linen, cotton, rug pile, granite. Pre-baked into `model/textures-baked.js` (2.9 MB) so the file loads fast; `model/realism.js` is the generator.
- Physical materials: clear-coat on tile, walnut, granite, ceramic; sheen on upholstery, bedding, curtains, rug; anisotropic steel.
- Day and evening environments with window-light panels; one rectangular area light per window (switched per room); lower hemisphere fill.
- Ground-truth ambient occlusion (GTAO) + MSAA through a post-processing chain; toggle button "Soft shadows".
- 2-3 mm rounded edges on laminate/walnut/stone boxes (bounding boxes unchanged).
- Point-light shadow maps 1024 -> 2048.

## What did NOT change
Walls, columns, openings, room sizes, every fixture/furniture/collider record, viewpoints. `verification/verify-geometry.json`: 1,920 meshes, max bounding-box delta 0.000 ft, fixtures/furniture/colliders/viewpoints identical to baseline R-007.

## Files
model/interior.js, realism.js, textures-baked.js, three-postfx.js (+ unchanged three.min.js, gltf-exporter.js, plan-data.js), walkthrough.template.html (one new button), rebuild_walkthrough.py, walkthrough.html (built), model/jaipur-first-floor.glb (17.9 MB; baseline 7.7 MB), interior.js.diff, renders/compare-*.jpg, verification/, tools/ (bake, capture, Blender still renderer).

## Known limits
- Browser real-time PBR is archviz quality, not photographs. Path-traced stills (route B) are in renders/ when produced.
- Load time was measured only in a software-rendered test browser (13 s baseline -> 36 s). On a real GPU it should be much closer to baseline but this has NOT been measured. Frame rate not measured on real hardware.
- Weave on upholstery still slightly aliases at long range; evening ceilings read dark brown.
- Textures show design intent only. Real veneer, laminate, tile and fabric need physical samples.
- QA: author checks only (scripted geometry equality + visual review). No independent/router QA performed.
