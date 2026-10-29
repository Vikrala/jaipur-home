# Jaipur home — coordinated main 3D model

This is the single maintained 3D model. Edit `model/interior.js`, rebuild `walkthrough.html`, update the GLB when geometry changes, and commit each coherent update to Git. Git history is the revision record; do not make a separate 3D draft folder for routine changes. Site-dependent details remain labelled as concept work until measured and coordinated.

**R-019 kitchen–living ledge (28 October 2026):** A floor-supported, kitchen-facing drawer unit now sits back near the sofa and meets the west wall along its side. The current concept is 1,067 mm long, approximately 600 mm deep and 762 mm high above finished floor. A light stone-look top, shallow dark fluting on the living face, two kitchen-side drawer stacks and an illustrative shielded warm light are modelled. The traced plan gives approximately 101 mm between the sofa end and the ledge and 1,562 mm on the east approach before finish tolerances. Confirm the built wall, sofa gap, clear route, concealed services and anti-tip fixing before joinery detailing.

**R-020 kitchen granite study (28 October 2026):** Both kitchen worktop runs now show an approximation of the client's [black-and-copper granite photo](kitchen-granite-reference.jpg). The banding follows each run, including the RO wall. This is a material option under consideration, not a selected batch or fabrication pattern. Confirm the actual slab, thickness, edge profile and L-corner joint with the supplier. Other granite in the house is unchanged.

The [R-019 plan diagram](renders/kitchen-living-ledge-plan.svg) stays with this model for placement review; it is not a measured shop drawing.

The model retains the approved kitchen, puja unit, final living-room furniture and architect-traced floor geometry. The full-height TV backing clears W5 and reaches the 10 ft ceiling; the low console extends left to the window centreline. The 75 in TV has been raised 1 ft, the living AC is centred on the solid left wall, the main controls sit below W5 above the console, and the sofa has an illuminated walnut service plank with integrated switches and charging.

See `CHANGELOG.md` and Git history for the dated revision history. Future model changes update this folder directly.

The puja unit remains inside the architect's 3 ft 6 in × 1 ft 1.5 in footprint. It contains exactly seven small idols and eight photographs, an independent pull-out diya tray, two drawers and four P1-style fluted-glass leaves shown retracted into P3-style flush side pockets. The doors close only above the tray and drawer line.

Open walkthrough.html and choose Approved kitchen, Kitchen window wall, Kitchen RO and sink wall, or Kitchen corner shelf. The standalone walkthrough works without downloading libraries. The model starts at night. Use the access-door control to open the single lift-up chimney and drying-rack gates, the corner door under the hob, and the geyser service door below the sink.

The kitchen follows the approved 14 September image and the window/RO wall elevations in Kitchen-editable-layout-vivek.pptx. It includes two light drawer stacks, one unsplit wide walnut stack under the main window, a narrow hob-side drawer stack and a full-height corner door. The corner contains one fixed shelf and has no swing-out trays or RO-wall access. All drawer tiers share the same heights. The RO wall has drawers left of the sink, two full-height sink gates, and light drawers before the fridge. No drawers sit beneath either bowl. The drying rack and full sink have the same model width (3.30 ft / 1006 mm) and centreline. These cabinet/appliance sizes remain provisional.

The exhaust service shutter is confined to the right window pane in the kitchen view. It ends at the window jamb and has a separate grille and handle. The four-burner hob and concealed chimney share a centreline. The RO body is hidden behind its cutout gate; its dispensing spout is directly accessible. The mini geyser is hidden beneath the right bowl. The dining set, pendants and separate living-to-kitchen handwash have been removed.

The architect’s traced walls, windows (including W8, outside the accepted reference framing), columns, rooms, ventilation shafts and 10 ft ceiling are retained. Other room interiors are retained. Ceiling faces render from below in the walkthrough. The edited PowerPoint remains untouched.

model/jaipur-first-floor.glb is the complete updated first-floor model, exported in metres with kitchen access doors closed. It contains editable meshes and material assignments. Open/close controls belong to the HTML walkthrough; the GLB is a static scene.

Three visual reviews covered architecture/layout, cabinetry/storage/service access, and cooking/night lighting for the household personas. Geometry checks and GLB structure checks are recorded in model/quality-checks.json; captured model views are in renders/. The live model has illustrative lighting/material detail. Exact manufacturer appliance fit, hood installation clearance, cabinet fixings, service routing, physical shutter clearance and lighting levels require site/vendor coordination; they are not certified by this concept model.

R-006 (13 October 2026) brought the model back into line with the architect plan for the Bedroom 2 AC, W2/W9 sills, mirrors, Bedroom 3 east-wall run, Master hidden locker, store brick return and two-way doors D6/D9. See CHANGELOG.md. The photoreal images in realistic/ pre-date this and have not been regenerated.

R-007 (13 October 2026) replaced the Bedroom 3 TV unit with a folding iron table per the revised architect plan for that room. See CHANGELOG.md.

R-010 (15 October 2026) corrected the Bedroom 2 east wall: the oak end store is now 1 ft 3 in long, as the architect plan dimensions it, so it no longer overlaps the wardrobe. See CHANGELOG.md.

R-011 (15 October 2026) follows the architect's revised layout dated 14 October 2026: Bedroom 2 study unit with the AC moved to the south wall, a lobby shoe rack, a kota shelf in the rear shaft, and the Bedroom 3 east-wall run (5 ft iron table, 1 ft 6 in shelf, 2 ft 9 in wardrobe). `architect-layout.pdf` is now the revised sheet; the original is kept as `architect-layout-2026-09-10-superseded.pdf`. See CHANGELOG.md.

**27 October 2026: one model.** R-012 (master bathroom and raised washer) and R-008 (realism pass: PBR materials, day/evening environments, soft shadows) are merged here. All drafts and the numbered v2–v7 copies have been retired, so this folder is now the only 3D model.

New walkthrough controls:
- **Soft shadows** switches ambient occlusion on and off.

Master bathroom views:
- Master bathroom — from the door
- Master bathroom — reference draft
- Master bathroom vanity — reference draft
- Washing niche — raised washer draft

QA records are in `studio-control/qa/`. See CHANGELOG.md.
