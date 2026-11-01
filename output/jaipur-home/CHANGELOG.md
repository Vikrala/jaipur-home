# Jaipur Home 3D Model - Change Log

This folder is the single maintained model. New revisions update these files directly.

## 1 November 2026 - Sofa plank stops at the kitchen–living ledge (RFI-016)

- The walnut sofa service plank, its wall-wash LED and the south switch/USB charging panel no longer pass inside the R-019 ledge. The plank now ends 9 mm short of the ledge face, about 92 mm past the sofa arm instead of 360 mm; the charging panel moves with the plank end and stays reachable beside the arm. The ledge is unchanged.
- Rebuilt the walkthrough and GLB; refreshed the living, living-reverse, sofa-wall and ledge renders. A clash check now finds only the expected wall-skirting contact at the wall-flush ledge (to be scribed on site).

## 1 November 2026 - Merged the GitHub history: kitchen–living ledge restored

- GitHub's `main` held three 28–29 October commits that this checkout lacked. They were merged at the user's instruction, keeping all local work from 31 October onwards.
- The R-019 kitchen–living ledge is now in the current model unchanged: floor-supported, about 1,067 mm long, 600 mm deep and 762 mm high, set back near the sofa and flush to the west wall, with kitchen-facing drawer stacks, a light stone-look top and dark fluting on the living face. Its two walkthrough views (**Kitchen-living ledge — living face** and **— kitchen drawers**) are restored; `renders/current-kitchen-living-ledge.png` and `renders/current-kitchen-granite.png` are refreshed from the merged model.
- The kitchen granite study, developed in both histories, now carries one label, R-020, as GitHub had resolved; its texture and placement are the local version.
- Known clash carried over from GitHub: the ledge overlaps the south end of the walnut sofa service plank and its south charging panel. Recorded as RFI-016 for a decision; no geometry was changed in the merge.
- Rebuilt the walkthrough, GLB (now includes the ledge with full materials) and Bedroom 2/overview renders.

## 1 November 2026 - Bedroom 2 open 9 in compartment and ceiling from the wardrobe

- Removed the seven fixed shelves from the right bay's 229 mm compartment. It is now an open full-height slot, still 229 mm clear inside its boards; the rest of the bay is unchanged.
- The east perimeter drop of the Bedroom 2 ceiling tray now treats the wardrobe as the boundary. The drop still covers the 2 ft wardrobe, then projects the same 250 mm band as the other three sides into the room from the upper-door face; its underside stays at about 2,920 mm with a 15 mm clearance above the upper doors. The muted blue inset line and step to the central field moved with it, so the tray reads from the wardrobe rather than from the wall behind it. Ceiling levels, fan and lights are unchanged.
- Rebuilt the walkthrough, GLB and Bedroom 2 renders; `model/bedroom-2-wardrobe-checks.json` records zero compartment shelves and the 250 mm band projection. Ceiling setting-out remains under RFI-014.

## 1 November 2026 - Bedroom 2 client QA corrections

Applied directly after an independent site-QA review and the client's six observations; the corrected 3D interpretation was approved in chat before modelling.

- **Niche and bedside aligned.** The open walnut niche widens from 381 mm to about 600 mm, running from the north wall (closing the dead 3 in slot) to the floating bedside's front line. The bedside now sits just in front of the mirror, about 535 mm deep, with its front 9 mm clear of the north sliding leaf. Previously the tabletop projected 143 mm past the niche and fouled the leaf's path. The niche has four equal open tiers (about 474 mm clear) and warm LED profiles in both inner rear corners of every tier; the single top strip is removed. Its separate upper door widens to about 573 mm.
- **Mirror.** It now stops at about 2,374 mm, below the corner upper door (2,417 mm), and uses a pale blue-grey glass finish instead of the fully metallic material that rendered as a black strip. The vertical switchboard is slightly deeper.
- **Wardrobe re-proportioned.** The main wardrobe shortens from 3,278 mm to 3,135 mm (two bays of about 1,567 mm). The right compartment now keeps a full 229 mm clear width inside its boards (previously 197 mm). Both bays share a 520 mm shelf column; hanging widths are about 999 mm left and 752 mm right. Drawers, pull-out trays and the lower storage are split at the shelf-column gable so no unit exceeds about 1 m; the solid lower box is now an open basket. The compartment has fixed shelves about 300 mm apart.
- **Doors.** The broad sliding leaves overlap 35 mm (was 13 mm) and park flush with the far end; handles are lowered to about 1,050 mm centre. Each bay keeps two equal hinged upper doors (about 766 mm), re-split to the new bays rather than to the compartment.
- Rebuilt the walkthrough, GLB and Bedroom 2 renders, added `renders/bedroom-2-niche.png` and the **Bedroom 2 bedside niche** viewpoint, and recorded measured dimensions in `model/bedroom-2-wardrobe-checks.json`. The QA record is `studio-control/qa/QA-B2-2026-11-01/`.
- Not changed: the bed position. The bed-to-wardrobe clear lane is about 486–521 mm, below a comfortable 600 mm; this is added to RFI-015 for a site decision. The niche LED driver and switching need an electrician's check.

## 1 November 2026 - Bedroom 2 approved wardrobe sketch built in the maintained model

- Replaced the old fixed terracotta east wardrobe shutters, within the architect's 10 ft 9 in by 2 ft footprint, with two broad greige lower sliding leaves on separate tracks. Either leaf slides over the other bay. The two upper bays each have a pair of hinged shutters, with independent left/right controls. The static GLB exports all four upper shutters and both lower leaves closed.
- Converted the 1 ft 3 in north end store into the sketch's open walnut shelf niche with a separately operable upper cabinet door. Replaced the right bedside with a floating one-drawer unit whose top is at the modelled mattress level; extended the mirror to the top of the upper cabinets and added a vertical switchboard between it and the headboard. The right main bay has a 229 mm full-height outer compartment; hanging, shelves, drawer and pull-outs fit in the remaining width.
- Widened only Bedroom 2's east false-ceiling drop to the wardrobe face. Its underside and the wardrobe top meet at approximately 2,920 mm; the assumed 3,048 mm slab soffit and other rooms' ceilings are unchanged.
- Added walkthrough controls and close/open inspection views, rebuilt affected Bedroom 2 renders and the GLB, and recorded the browser, dimension and export checks in `model/bedroom-2-wardrobe-checks.json`. Hardware rating, pull-out clearance, wall fixings, electrical routing and measured ceiling levels remain RFI-014/RFI-015 execution checks.

## 1 November 2026 - Bedroom 2 hinged-upper and 229 mm compartment sketches

- Corrected both unapproved review images: upper storage now has two hinged shutters over each lower sliding bay, rather than sliding shutters. Upper bay divisions align with the two lower bays. The bedside mirror reaches the top of the upper cabinets.
- The right-open sketch adds a fixed full-height gable that forms an approximately 229 mm (9 in) compartment at the outer right of the exposed lower bay. The hanging section, shelf column, drawer and pull-outs are shown within the remaining width. The narrow compartment's use remains unspecified.
- Saved the corrected closed/open pair under `concepts/` and retained earlier sketches as provenance. No Bedroom 2 model, walkthrough or GLB change was made.

## 1 November 2026 - Bedroom 2 two-shutter closed/open sketch pair

- Superseded the four-narrow-shutter review sketch after the client's correction. The main wardrobe beyond the corner shelves now has two bay-width sliding shutters total; the loft above it has its own aligned two-shutter sliding pair. Internal partitions remain behind the door fronts.
- Added matched closed and right-open review sketches under `concepts/`. The open view shows one bay's hanging space, shelf column, drawer and lower pull-outs, plus the open right loft. The source image guides the storage arrangement only. No Bedroom 2 model, walkthrough or GLB change was made.

## 1 November 2026 - Bedroom 2 two-bay sliding wardrobe sketch

- Corrected the unapproved wardrobe sketch after the client's practicality review. The main wardrobe beyond the corner shelves is now drawn as two independent bays with two sliding leaves in each bay, a fixed central divider and upper storage split to match.
- Saved `concepts/bedroom-2-sliding-wardrobe-two-bays-sketch-2026-11-01.png` and preserved the earlier sketch. Bedroom 2 model, walkthrough and GLB remain unchanged while the client reviews the interpretation.

## 1 November 2026 - Bedroom 2 sliding wardrobe and top-storage sketch

- Added a new unapproved review sketch, `concepts/bedroom-2-sliding-wardrobe-loft-sketch-2026-11-01.png`, based on the client's separate sliding-wardrobe video. It shows a matching upper loft band with shelves behind its shutters and warm-greige main sliding leaves; one of each is open in the sketch to explain storage and movement.
- Retained the corrected bedside, mirror and vertical switchboard from the prior concept. Bedroom 2 model, walkthrough and GLB remain unchanged pending the client's interpretation decision and site joinery checks.

## 1 November 2026 - Bedroom 2 concept sketch correction

- Revised the unapproved sketch only: lowered the floating bedside top to mattress-top level, moved and extended the mirror from the top to the highest open shelf bay, and added a vertical switchboard between mirror and headboard from the tabletop to headboard top.
- Preserved the earlier sketch as provenance and saved the corrected version as `concepts/bedroom-2-wardrobe-corner-sketch-2026-11-01-v2.png`. No Bedroom 2 geometry, walkthrough or GLB change was made.

## 1 November 2026 - Living rug visibility and Bedroom 2 review sketch

- Added a walkthrough control to show or hide only the living rug. It starts visible; hiding it exposes the existing glossy ivory tile, and switching it back on restores the rug. The static GLB keeps the rug because its geometry has not changed.
- Captured `renders/living-without-rug.png` and checked the button's on/off state and floor visibility in the browser.
- Saved a separate Bedroom 2 concept sketch under `concepts/` for client review: floating one-drawer bedside corner, dark open niche and closed upper bay at the wardrobe end, with the main wardrobe shown as sliding doors. This is not an approved bedroom design or a 3D model change.

## 1 November 2026 - Corrected living table to four-corner stool layout

- Replaced the mistaken central pedestal with intersecting walnut support panels forming a plus beneath the rounded framed top. The four resulting corner bays each hold one muted olive hollow storage stool with a closed lift-up lid. The earlier three-stool interpretation below is superseded.
- Kept the 914 × 660 mm top, walnut/olive room palette and table position. All four stools tuck within the modelled tabletop footprint; modelled sofa/console side bands remain 916/920 mm. Confirm finished sizes, extraction and lid hardware with the fabricator.
- Rebuilt the walkthrough, GLB and affected renders; updated the dedicated table view and geometry check to require four stools in the four corner bays. Added an inspection still with the top temporarily hidden to reveal the plus support and all four stools; the top remains in the maintained model and GLB.

## 1 November 2026 - Living coffee table from client reference

- Replaced the 42 × 20 in four-leg table with a 36 × 26 in (914 × 660 mm) rounded walnut tray top on a central pedestal. Modelled tabletop height is about 454 mm.
- Added three movable muted olive upholstered storage stools; two are tucked beneath the table ends and one is shown pulled out with its storage lid open. The walnut matches the TV and sofa joinery, while olive picks up the room's botanical artwork.
- Retained the existing sofa, rug, TV/puja relationship and room layout. Shifted the table 76 mm toward the TV wall to keep the modelled long-side bands about 916 mm by the sofa and 920 mm by the console with stools tucked; verify the final furniture and clearances on site. Stool lid safety, support, upholstery and washable storage lining need a fabricator detail.
- Rebuilt the standalone walkthrough and GLB, refreshed the overview and living renders, and added a dedicated table detail view. `model/living-table-checks.json` records the browser/export checks.

## 1 November 2026 - Matte white false ceiling finish

- Changed every proposed false ceiling plane and dropped band to a clear matte white, including kitchen, bathrooms, store, lobby and passage. The warm wall paint and the bedroom/living decorative inset lines remain distinct.
- Rebuilt the standalone walkthrough, updated the GLB ceiling materials and refreshed the reflected ceiling concept plan. Ceiling levels and layout are unchanged.


## 1 November 2026 - False ceilings throughout the enclosed floor

- Added shallow dropped perimeter trays to the three bedrooms and living room, with a warm brass line in the master, muted blue lines in Bedrooms 2 and 3, and a warm cove line in the living room. Kept central fan/lighting fields high and simple.
- Added one plain flat ceiling to the kitchen; its existing loft fronts and exhaust service cupboard now terminate at the proposed finished ceiling without changing the approved module arrangement. Added plain flat ceilings to both bathrooms, the washing niche, store, lobby and short passage. The lift cabin ceiling, open stair and terrace remain as drawn.
- Retained the 3,048 mm slab-soffit assumption. Provisional finished levels: about 2,981 mm in bedroom/living central fields, 2,932 mm in the kitchen, and 2,993 mm in baths/store/lobby/passage. Perimeter drops are about 61–70 mm below the central fields. Repositioned ceiling fittings and fan stems to those visual levels.
- Rebuilt the standalone walkthrough and updated GLB geometry; added five ceiling viewpoints and a reflected ceiling concept plan. RFI-014 records the measured-section, fan fixing, lighting, moisture and service-access checks needed before an execution drawing.


## 1 November 2026 - TV stone and puja texture QA

- Repaired the procedural stone recipe for a grout-free slab and rebaked only its albedo, normal and roughness maps. A zero tile count had produced black maps, making the intended warm ivory TV backing and puja back liner appear dark blue or grey.
- Added recessed walnut carcass rails between the two puja drawers and below the independent diya tray. The wide blue recesses were exposed wall, not missing walnut texture. The drawer and tray clearances remain visible as narrow working reveals.
- Brought the 75 in TV closer to its backing by 305 mm (1 ft). Its prior stand-off cast a large rectangular evening shadow across the corrected stone. TV size, centre height, panel location and W5 clearance remain as established.
- Rebuilt the standalone walkthrough, GLB and nine current floor-view renders. Browser day/evening checks and independent specialist QA checked the corrected stone, walnut reveals, all 11 baked texture families and the exported GLB.
- On site, confirm the TV bracket fixes into masonry/structure, with enough depth for ventilation, plugs and cable bend radius. Confirm the puja rail and tray running clearances with the joinery fabricator.

## 31 October 2026 - Glossy ivory 2 ft x 4 ft floor tile and Git workflow

- The client's showroom tile is now the visualised finish on all dry interior floors: living, kitchen, store, lobby, lift landing, bedrooms and the short passage. Bathroom and terrace anti-slip floor concepts remain separate.
- Tile module: 610 × 1,220 mm (2 × 4 ft), straight laid with the long side along the existing plan x direction and 1 mm joints. The image was cleaned from `IMG_9981.HEIC` to remove showroom reflections; the model repeats one sample, so actual boxes will vary.
- The standalone walkthrough embeds the tile image so local `file://` browsers can render it. The GLB and nine current floor views were regenerated. The material assignment, texture repeat and GLB structure were checked.
- The project workflow now uses direct edits to this single model, followed by checks and one coherent Git commit. Routine draft/promotion gates are retired; historical records remain provenance.
- Before execution, confirm supplier wet slip data and test a wet sample underfoot, especially in the kitchen and older-adult routes; check shade variation, thickness, flatness and finished-floor clearances on site.

## 28 October 2026 - R-020 kitchen slab in the client's granite

Applied directly to this model on the user's instruction. This granite is under consideration, not a final selection.

- **Both kitchen worktop runs now show the granite from the client's site photo.** The photo is saved as `kitchen-granite-reference.jpg`. The texture shows:
  - a polished black base;
  - dense, crinkled banding;
  - flowing copper and rust patches.
- **The banding runs along each run, both the window wall and the RO wall,** the way a fabricator would normally cut it. The joint at the L-corner and the exact figure are to be agreed when the slab is selected.
- The texture is an approximation of the photo, and real slabs vary by block and batch.
- Other granite in the house, such as the bedside tops, the locker lid and the vanity, is unchanged.
- The GLB is re-exported. The stills are not regenerated.
- This study was developed separately in this checkout and on GitHub. When the two histories were merged on 1 November 2026 it took the label R-020, freeing R-019 for the kitchen–living ledge below.

## 28 October 2026 - R-019 kitchen–living ledge and Git workflow

- Integrated the user's slab/storage change into the single maintained model. The 1,067 mm long, approximately 600 mm deep, 762 mm high unit is set back near the sofa and meets the west wall along its side. Drawers face the kitchen; the living face has shallow dark fluting, a light stone-look top and an illustrative warm under-lip light.
- The traced model leaves approximately 101 mm at the sofa end and 1,562 mm on the east approach before finish tolerances. Wall scribing, anti-tip restraint, concealed wiring and operating clearances need site/fabricator checks; this is not a fabrication drawing.
- Updated the interactive walkthrough and the GLB. The GLB uses simple box geometry for the new joinery; the walkthrough has the richer live material/edge depiction.
- Per the user's workflow instruction, Git commits now track each coherent change to this one maintained model. Routine revisions no longer create separate 3D draft folders or wait for a draft-promotion step. The architect layout and protected room decisions still govern physical changes.

## 28 October 2026 - R-018 bathroom wall tile to the ceiling

Applied directly to this model on the user's instruction.

- **All bathroom wall tile now runs floor to ceiling (10 ft).** Before, it stopped at 7 ft 2 in. This applies to the master bathroom, its washing niche and the common bathroom.
- **The master shower's green vertical tile continues to the ceiling.** The top course is a cut tile of about 145 mm.
- **Tile fills the panels above the openings:**
  - above doors D3 and D5, from the 8 ft 3 in lintel;
  - above window W9, from 9 ft 6 in;
  - above window W4, from 9 ft. The W4 window band itself stays open.
- **The common bathroom's north (lobby-side) wall is now tiled full height.** It was painted before. The user confirmed this on 28 Oct 2026.
- The GLB is re-exported. The stills are not regenerated.

## 28 October 2026 - R-017 smoother movement, same detail

Applied directly to this model on the user's instruction. Nothing in the design or the render quality changes.

- **Shadows are cached.** The sun shadow and the two room-light shadows were redrawn on every frame, and that was most of the frame cost. They are now redrawn only when a light, door or fitting changes. The house is static, so the picture is pixel-identical.
- **One draw per screen frame.** Dragging and scrolling used to render inside each mouse event, sometimes several times per frame. The animation loop now draws once per frame.
- **Eased motion.** Look, orbit and walking speed glide toward the input instead of stepping. Top walking speed is unchanged.
- **Unchanged:** textures, resolution, anti-aliasing, soft shadows (AO), shadow sharpness, lights and geometry. The GLB and stills are not affected.

## 27 October 2026 - R-016 QA fixes (items 1–5 of the post-R-015 review)

Applied directly to this model on the user's instruction, from `studio-control/qa/BASELINE-2026-10-27/QA-REPORT.md`.

- **Master towel bar and robe hooks moved** off the wall directly opposite the open shower front.
  - They are now on the east wall south of the shower line: the bar is at z 27.45–29.00 ft and the hooks at 29.35 and 29.75 ft, at the same heights as before.
  - They sit beside the walk to the WC and washer. The hand-towel ring by the vanity is unchanged.
- **WC collision boxes now follow the WC rotation.** This affects both the master and common WCs, which were rotated 90° but had unrotated collision boxes.
- **Captions updated.**
  - "Reference draft" is dropped from the master bathroom viewpoint names, and the route caption now reads 745 mm.
  - The page header now says "Updated 27 Oct 2026".
  - The plan note gains a short master bathroom line.
- **Stale records corrected.**
  - `docs/LATEST_COMPLETE_HOUSE_DESIGN.json`: the dry route, the through-glass towel rail and the consolidation outcome are marked as superseded.
  - RFI-013: the border and glass-fixing wording is updated.
  - The R-014 and R-015 entries above wrongly said the kitchen backsplash uses the 4 ft x 2 ft floor tile. It uses the anti-slip bathroom tile, and both entries are corrected.
- The stills are left as they are, at the user's request.

## 27 October 2026 - R-015 open master shower, 1 mm floor joints

Applied directly to this model on the user's instruction.

- **Master bath glass removed.** Both arched fluted-glass returns are gone, together with:
  - their brass frames, wall profiles and floor channels;
  - their collision walls;
  - the glass-mounted towel rail and its stand-offs, which had nothing left to fix to.
  The shower is now a fully open wet zone.
- **"Hide master bath glass" button removed**, along with its viewer code.
- **Black border strip removed** from the floor across the shower front, between where the two partitions stood. The linear drain along the back wall under the mixer stays, flush with the floor.
- **All floor tile joints are now 1 mm.** They were about 8–12 mm wide on the textures.
  - Re-baked: the 4 ft x 2 ft vitrified tile (all dry rooms and the passage) and the anti-slip bathroom and balcony tile (bath floors and walls, outdoor areas and the kitchen backsplash).
  - The master bath octagon floor is redrawn with 1 mm joints. Its small black dot inserts are part of the tile pattern, not joints, so they stay.
- **Viewpoint captions updated** to describe the open shower.
- **Site note:** without glass, spray will reach the vanity, the WC and the route to the washer. Waterproof the whole bathroom floor, with an upturn of at least 300 mm on all walls; keep the floor anti-slip; fix towel hooks outside the direct spray. This is added to RFI-013.
- Stills in `renders/` were not regenerated, so the master bath images still show the glass, including `bath-master-glass-hidden.png`.

## 27 October 2026 - R-014 evening light, 4 ft x 2 ft tiles, pillows and cushions, appliances, passage floor

Applied directly to this model on the user's instruction.

- **Evening mode is brighter.**
  - Room lights at night go from 1.3x to 2.1x.
  - Ambient fill goes from 0.14 to 0.34, exposure from 1.08 to 1.32, and evening reflections from 0.50 to 0.75.
  - Measured average screen brightness in evening mode (0–255, soft shadows off) rose in every room, with no blown-out areas:

    | Room | Before | After |
    |---|---|---|
    | Living | 112 | 158 |
    | Master bedroom | 70 | 109 |
    | Kitchen | 90 | 125 |
    | Bedroom 2 | 86 | 128 |
    | Master bath | 94 | 136 |

- **Floor tiles are 4 ft x 2 ft** (about 1,220 x 610 mm), laid straight, with the long side along the plan x axis.
  - The tile texture was re-baked; it was 2 x 2 ft before.
  - It applies wherever the vitrified floor tile is used: all dry rooms and the new passage. (Corrected by R-016: the kitchen backsplash uses the anti-slip bathroom tile, not this one.)
  - Bathroom floors keep their smaller anti-slip tiles, which suit drainage slopes better than large tiles do.
- **Grey patch outside the common bathroom is fixed.** The 3 ft 6 in x 3 ft 10 in passage between the Bedroom 2 door (D4), the common bath and the living room is not a room in the traced plan. It had no floor or ceiling, so the grey slab showed through. It now has the same tile floor and a ceiling. Walls and doors are unchanged.
- **Pillows and cushions are shaped like real pillows**, no longer rounded boxes. They have a crowned middle that thins to a sewn seam, slightly pinched corners and a small dent.
  - Beds: the sleeping pillows lean against the headboard, a square accent cushion sits in front of each, and the duvets are softened.
  - Sofa: the single seat cushion (still one piece, no divisions) and the back are plumper.
  - Sofa loose cushions: these were buried inside the sofa back. They now sit on the seat and lean against it.
- **Appliances have more realistic shapes.**
  - **Refrigerator:**
    - separate freezer and fridge doors with a dark gap between them;
    - bar handles on stand-offs, a door display, a toe-kick grille and a hinge cover.
  - **Split ACs (all four):** a curved split-unit body, a swing flap, vertical vanes, a front panel groove and a display.
  - **Washing machine:**
    - a chrome porthole ring, domed glass and a recessed drum;
    - a door pull and a detergent drawer.
- **Follow-up fix (same day, after user screenshots).** The upright cushions were rendering inside out because my axis remap mirrored the mesh, which flipped its faces. These were the bed accent cushions, the sofa back and the two sofa-return cushions. They looked hollow and see-through, with no texture. The remap is now a pure rotation, and every face of all 23 pillows, cushions and duvets has been checked to point outward.
- **Loading fix.** Textures now load on the image `onload` event, not `img.decode()`, which never finished in one test browser and left the textures blank.
- **Unchanged:** sizes and positions used for planning. Collision areas, fixture records and viewpoints are identical to before, as checked in the browser. The mesh-by-mesh comparison changed only the objects listed above.
- **Files:** `walkthrough.html` was rebuilt and the GLB re-exported (19.2 MB). The stills in `renders/` and `realistic/` were not regenerated, so they still show the old tiles, pillows and appliances.

## 27 October 2026 - R-013 living-room plant removed

- Removed the 2.7 ft potted plant that stood in the living room in line with the main door D6, at x 14.85 ft, z 22.57 ft (about 4.4 ft inside the door). It was the only plant in the living room. The plant had no collision or feature record, so only its meshes are gone.
- Nothing else changed. The kitchen planters and the terrace plant stay.
- `walkthrough.html` was rebuilt and the GLB re-exported. The existing living-room stills in `renders/` and `realistic/` were not regenerated and still show the plant.
- Applied directly to this model on the user's instruction. No draft was made and no independent QA was run.

## 27 October 2026 - Consolidation: R-012 master bathroom and R-008 realism merged; one model only

On the user's instruction ("merge the complete draft to the main baseline version … bring the project to a single 3D model"), and after the user chose to merge R-008 too, two drafts were merged into this model, and every other model copy was retired.

**R-012 master bathroom and raised washer (rev 4.1)**
- **Shower.** It is 900 × 1,220 mm between two fixed arched fluted-glass returns, one on the vanity side and one on the WC side. The front is open, 1,220 mm wide, with no kerb. Green vertical tile lines the back wall, and the brass thermostatic mixer, rain head and hand shower are fixed to the tile face.
- **Drain.** A brass linear drain runs along the back wall under the mixer. It is flush with the floor (the highest part is 0.3 mm proud in the model). It passes over the architect's floor-drain point (plan ≈ x 1.27 ft, z 26.37–26.42 ft), so the outlet moves about 75 mm. The floor falls away from the open front. A black border tile marks the wet zone.
- **Dry route.** The route to the WC and washer is 745 mm from wall to glass, narrowing to 676 mm at the towel bar. The user accepted this, and accepted that the mixer is on the back wall.
- **Hot water.** A 25 L vertical geyser sits high in the north-west corner above the vanity. Its underside is at 2,256 mm and its top at about 2,905 mm. It has a high-level IP-rated outlet. The PRV discharges through the wall chase to a tundish into the basin waste. An insulated hot line runs about 3 m to the mixer. The horizontal geyser over the door is removed.
- **Towels.** A through-glass brass towel rail sits on the dry face of the vanity-side return, 1,100 mm high and 42 mm off the glass. A towel bar and two robe hooks are on the east wall, and a hand-towel ring is beside the vanity.
- **Future grab bars and seat.** Blocking is recorded behind the tile for a vertical grab bar by the mixer, a fold-down shower seat, and a fold-up bar beside the WC.
- **Vanity and WC.** User-confirmed on 27 Oct:
  - a floating white vanity with a stone top and an arched brass-rim mirror, within the vanity width (it holds less storage than the old floor-standing cabinet);
  - a shallow sage cupboard above the WC;
  - brass WC fittings and a tiled cistern box.
- **Wall finishes.** The walls are pale stone tile to 7 ft 2 in, including the W9/WC wall and the washing niche. The floor is a matte octagon tile with black dots.
- **Washing niche.**
  - The front-load washer sits on a platform with a marble top at 610 mm. The support is a concept only (RFI-013).
  - Two lift-out laundry baskets sit below.
  - The angle valve and the RCD socket are on opposite walls, above the machine.
  - The hose runs to a standpipe behind the platform.
  - The cupboard is lifted to 6 ft 7 in.
- **Shower light.** The downlight inside the shower is flagged IP65 on an RCD circuit.
- **QA.**
  - Author checks: 33/33.
  - Independent QA R-012-site-qa-03 (claude-sonnet-5-5, medium) passed with holds.
  - Rev 3 independent QA (site-qa-02) had failed on the drain shift (150 mm stated, about 0.7 m in reality). That was re-decided by the user.
  - QA records are kept in `studio-control/qa/R-012/`.

**R-008 realism pass (visual only)**
- **Materials.** Procedural PBR materials (albedo, normal and roughness) are baked into `model/textures-baked.js` and generated by `model/realism.js`. Tile, bath tile, TV stone, walnut, plaster, laminate, linen, cotton, rug and granite are in real-world feet. Clear-coat, sheen and anisotropic metals are applied.
- **Light and shadows.** Day and evening environments now feed reflections. A "Soft shadows" button switches ambient occlusion (post-processing in `model/three-postfx.js`).
- **Edges.** Joinery boxes get 2–3 mm rounded edges. Bounding boxes are unchanged.
- **Merge conflict.** R-008 replaced the canvas textures, so the master-bath octagon floor keeps its own small canvas texture, scaled to about 150 mm octagons.
- **Effect on geometry.** None outside the bathroom: all 1,788 meshes outside the master bathroom and niche are identical to the 15 Oct baseline. That baseline already includes R-010 and R-011, so the merge undid neither.
- **Not measured.** Load time and frame rate on a real GPU were not measured. In the software browser, R-008 loaded in about 36 s against 13 s before.
- **Rebuild tools.** The texture and post-processing tools are in `model/build-tools/`. They need Node, Playwright and esbuild, none of which are on this Mac.

**New viewer control**
- **Hide master bath glass.** This button hides and shows both arched glass returns, their brass frames and the glass-mounted towel rail, so you can see into the shower. It is for viewing only: the glass is still part of the design, and walk-mode collisions still apply. The GLB always contains the glass.

**Files**
- **Updated:**
  - `model/interior.js`, plus the new `model/realism.js`, `model/textures-baked.js` and `model/three-postfx.js`;
  - `walkthrough.template.html` (Soft shadows and Hide master bath glass buttons), `rebuild_walkthrough.py` and `walkthrough.html`;
  - `model/jaipur-first-floor.glb`, re-exported at 18.4 MB (was 7.6 MB; the PBR textures account for the increase).
- **Renders:**
  - Re-rendered: `renders/bath-master.png`, `bath-master-reverse.png` and `washing.png`.
  - Added: `bath-master-entry.png` and `bath-master-glass-hidden.png` (daylight, no ambient occlusion).
  - Not regenerated: the other stills and `realistic/`, so they still show the pre-R-008 materials.
- **Retired** (moved to the macOS Trash folder `jaipur-home-trash-2026-10-27`, so they can be recovered until the Trash is emptied):
  - draft folders R-001 to R-012;
  - old model folders `output/jaipur-home-v2` to `v7`;
  - the pre-merge copies of this model's changed files.
- **Not merged:** R-009, the Blender path-traced render kit, was retired. R-001 to R-005, the TV-unit renders, had already been withdrawn.
- **Still open:** RFI-013 (master bathroom and washing niche) is now in `studio-control/rfis.json`. The site holds stay open: geyser wall and fixing, washer support, standpipe, drain falls and waterproofing, through-glass rail fixing, blocking, the shared east wall and W9.

## 15 October 2026 - R-011 revised architect layout (Bedroom 2, Bedroom 3, lobby, rear shaft)

The architect's revised layout ("Revised Interior Layout OP-1", sheet dated 14 October 2026) replaces `architect-layout.pdf`; the 10 September original is kept as `architect-layout-2026-09-10-superseded.pdf`. Dimensions below were read from the revised sheet (written dimension chains, plus outline sizes measured from the PDF vectors where nothing is written). Applied directly to the baseline on the user's instruction.

- **Bedroom 2 study unit.** The TV unit is replaced by a STUDY UNIT, 5 ft wide x 1 ft 6 in deep (plan outline x 16.19-21.19 ft, z 10.88-12.37 ft), about 3 in off the south wall, its face 3 ft 9 in from the bed foot as dimensioned. The TV and its console are removed. Desk height 2 ft 6 in, a three-drawer pedestal at the east end and a modesty panel are assumptions (the plan shows only the outline); proposed power/data panel on the wall above.
- **Bedroom 2 AC.** Removed from the west wall and placed on the south wall, centred over the study unit (plan symbol 3 ft wide).
- **Lobby shoe rack.** New SHOE RACK against the lobby east wall, 1 ft deep x 3 ft long, starting at the lift-entry wall face (plan outline x 25.25-26.25 ft). Height 3 ft 3 in (kept below the lobby controls) and open shelves are assumptions.
- **Rear-shaft kota/granite shelf.** New KOTTA/GRENITE SELF along the west wall of the rear ventilation shaft, 1 ft 9 in deep over the shaft's full 4 ft 3 in length (plan lines x 0.75-2.50 ft). Height 2 ft 6 in, 1.5 in slab and three kota corbels are assumptions; the shaft walls and status are unchanged (RFI-011).
- **Bedroom 3 east wall.** Run re-laid to the revised chain 2 ft 9 in wardrobe + 2 ft store + 5 ft folding iron table + 1 ft 6 in shelf + 4 ft 3 in wardrobe = 15 ft 6 in (was 2 ft 10 in / 2 ft / 5 ft 6 in / 11 in / 4 ft 3 in). The iron table is 5 ft x 1 ft 9 in (R-007 had 5 ft 6 in from an image); bed-to-table gap is 2 ft 3 in as dimensioned. Store and shelf back faces now sit exactly on the east wall face (they were 7 mm inside it).
- **Kitchen sink.** No model change: the approved double-bowl sink already matches the revised plan's double bowl.
- **Not modelled, by instruction:** an AC symbol on the kitchen/dining east wall; the plan label change "LOCKER HIDEEN" to "LOCKER" (Master locker stays concealed pending RFI-008).
- Added viewpoints Bedroom 2 study unit, Lobby shoe rack, Rear shaft kota shelf. Regenerated bedroom-2, final-bedroom-2, final-bedroom-2-entry, bedroom-3, both iron-table stills, lobby, overview and both overhead stills; added bedroom-2-study, lobby-shoe-rack and rear-shaft-shelf. Re-exported the GLB. Other stills were not regenerated and were rendered on a different machine, so these new ones differ slightly in tone from the rest.
- Nothing else changed: every mesh outside the edited zones is identical to the previous baseline. 31 of 31 author checks pass; independent QA was not run (author checks are in studio-control/drafts/R-011/verification/).

## 15 October 2026 - R-010 Bedroom 2 east-wall almirah overlap

- Fixed the Bedroom 2 east wall, where the oak end store and the sage wardrobe overlapped by about 6 in, so their doors collided in the walkthrough.
- The architect plan dimensions this wall as 3 in + 1 ft 3 in store + 10 ft 9 in wardrobe = 12 ft 3 in, which is the room length. The model had the store 2 ft long along the wall (the drawn 2 ft is its depth), giving 12 ft 9 in.
- The store is now 1 ft 3 in long (z 0.625 to 1.875 ft) and abuts the unchanged 10 ft 9 in wardrobe; depth stays 2 ft and its back face sits on the east wall face. A 0.72 in shutter reveal remains between the two doors.
- Everything stays inside the architect's Bedroom 2 envelope; the 3 in strip between the north wall and the store is left open as drawn.
- No other geometry changed: 1,913 of 1,920 meshes are identical; only the store's own parts differ.
- Regenerated bedroom-2, final-bedroom-2, overview, measured-overhead and final-measured-overhead and re-exported the GLB. The Bedroom 2 hall-entry view is unaffected.
- Independent QA was not run; the author's checks are in studio-control/drafts/R-010/verification/. Promoted directly on the user's instruction.

## 13 October 2026 - R-007 Bedroom 3 folding iron table

- Revised architect plan for Bedroom 3 received: the TV unit is replaced by a FOLDING IRON TABLE, 5 ft 6 in long x 1 ft 9 in deep, on the east wall in the same position.
- Removed the Bedroom 3 TV and TV unit.
- Modelled the table as a wall-hinged padded leaf (surface 2 ft 9 in, assumed) that folds up into a shallow frame; open by default. New walkthrough control "Fold iron table up / down"; the GLB exports it open.
- Added a proposed socket below the table.
- The rest of the Bedroom 3 layout already matched the revised drawing and is unchanged.
- Regenerated bedroom-3, overview and both overhead renders; added open and folded iron-table views.

## 13 October 2026 - R-006 model corrections to the architect plan

- Moved the Bedroom 2 AC from the south wall to the west wall, as drawn.
- Corrected window sills: W2 now 2 ft 6 in; W9 now 1 ft 6 in (raised as RFI-006).
- Added the drawn mirrors: Master east-wall store, Bedroom 2 north wall, Bedroom 3 store.
- Reset the Bedroom 3 east-wall run to the drawn 2 ft 10 in wardrobe, 2 ft store with mirror, 5 ft 6 in TV unit, 11 in shelf and 4 ft 3 in wardrobe.
- Added the Master hidden locker inside the north-west bedside, and the BRICK return beside the store column (provisional height).
- D6 and D9 are now two-way doors; the walkthrough has a "Flip two-way doors" control.
- Fixed the collision box of rotated cabinets and beds (Bedroom 2 TV console).
- Regenerated 22 model renders from the corrected model; kitchen and store image prompts are marked superseded.
- Bedroom 2 bed-group shift was deliberately not changed.

## 23 September 2026 - Bedroom 2 sleeping-group shift

- Shifted the Bedroom 2 bed and both bedside tables approximately 538 mm (1 ft 9.2 in) toward the east almirah.
- Positioned the almirah-side bedside table so its granite top meets the almirah side exactly, with no overlap.
- Shifted both bedside charging points, the headboard artwork and the ceiling fan with the bed to retain alignment.
- Removed the previous 545 mm gap between the almirah-side table and almirah.
- Kept the bed size, almirah, doorway, windows and masonry unchanged.

## 23 September 2026 - Bedroom 2 privacy-screen rollback

- Removed the proposed inner-entry privacy screen after review; it was visually intrusive and compromised the sense of arrival.
- Restored Bedroom 2 to its prior furniture-only layout while retaining the measured 545 mm bedside-to-wardrobe gap for the next layout correction.
- No masonry, doorway or other room geometry was changed.

## 23 September 2026 - Bedroom 2 entrance privacy

- Confirmed the modeled bedside-to-wardrobe cabinet clearance as approximately 545 mm (1 ft 9 1/2 in).
- Added an opaque lightweight screen across the inner entry so the bed is not directly visible from the hall; entry now turns right around its free end.
- Retained the architect's constructed Bedroom 2 doorway and existing masonry.
- Preserved the full constructed entrance and approximately 950 mm (3 ft 1 1/2 in) turning clearance between the privacy screen and the bed foot.
- Added a full-length dressing mirror on the bedroom-facing side so the new screen performs a second practical function.
- Limited the screen to 5 ft 9 in high, leaving the upper zone open for the nearby high-level AC airflow.

## 23 September 2026 - Practical puja-corner operation

- Converted the four fluted-glass leaves from a fixed-open depiction into operable closed and pocketed-open states in the walkthrough.
- Added separate **Open/close puja cabinet** and **Pull out/retract diya tray** controls. Pulling out the tray opens the shrine; closing the shrine retracts the tray first.
- Widened the diya tray fascia to the cabinet width and the working tray to the full clear internal width, with a removable brass drip liner, raised oil-retaining edges and a non-combustible stone base.
- Reorganized storage as a shallow daily-use drawer above a deeper bulk-supplies drawer.
- Shifted the altar and removable two-tier idol riser to improve reach, while retaining exactly seven idols and eight photo frames.
- Kept photo lights shielded and outside the flame plume; retained permanent high and low ventilation.
- Moved the light/service control from an over-high internal position to the accessible outer cabinet side, away from the flame zone.
- Marked the tray for positive open/closed stops and minimum 25 kg-rated full-extension runners for fabrication coordination.

## 23 September 2026 - Living services and furniture coordination

- Raised the centreline of the 75 in living-room TV by 1 ft while retaining its 16:9 size.
- Moved the living AC from the passage opening to the centre of the solid left wall.
- Moved the main-door control panel below window W5, above the low TV console.
- Reworked the sofa-wall joinery as a walnut service plank with wall-wash lighting. The plank extends beyond both sofa arms so the two switch/socket/USB panels remain visible and reachable.
- Closed the backrest gap at the L corner with a continuous upholstered connector.
- Extended the sofa return to the end of the solid AC wall.
- Reduced and separated the plank projection so the sofa back no longer rests on it.
- Rotated both plank control panels upward to face the ceiling.
- Retained the architect-traced structure, masonry openings, staircase, lift, kitchen and puja unit.

## 23 September 2026 - TV wall correction

- Shifted the ceiling-height TV backing approximately 220 mm right so it clears W5.
- Extended the low TV console left to the W5 centreline.
- Raised the stone backing and fluted walnut side members to the 10 ft ceiling.

## 23 September 2026 - Final living-room layout

- Coordinated the 11 ft continuous sofa run, 4 ft 6 in return, 42 x 20 in centre table, rug, botanical artwork, 75 in TV and concealed-service console.
- Preserved the approved kitchen and puja designs.

## Earlier history (retired model folders, summarised 27 October 2026)

These folders were deleted in the 27 October consolidation. Their decisions survive in this model and in `docs/PROJECT_HANDOFF.md` §3.

- **Original package (12 Sep 2026)** — `Suresh-Ji-first-floor-interiors.zip`. This was the first whole-floor walkthrough and GLB, traced from the architect's OP-1 layout of 10 Sep. It included realistic concept images per room.
- **v2 (14 Sep)** — revised from the OP-1 drawing, with bathroom, kitchen and remaining-room revision prompts. Also packaged as `jaipur-home-revised-2026-09-14.zip`.
- **v3 (Sep)** — kitchen alignment preview. The hob moved 366 mm so the hob and the concealed chimney share a centreline. Chimney casing clears the window by 77 mm and the exhaust frame by 21.7 mm. A whole-house theme was not created.
- **v4 (Sep)** — approved kitchen. It follows the 14 Sep image and the Vivek PPT elevations, with a single lift-up chimney, an equal-width drying rack and sink, a hidden RO and a sink geyser. Also packaged as `jaipur-home-approved-kitchen-v4.zip`.
- **v5 (Sep)** — final hall and puja coordination:
  - L1 room base, L2 TV and service joinery, L3 botanical art;
  - 75 in TV and an 8 ft 6 in console;
  - puja inside the 3 ft 6 in × 1 ft 1.5 in footprint, with 7 idols, 8 photos, a pull-out diya tray and pocket-fold leaves.
- **v6 (Sep)** — final living room. It has an 11 ft sofa run with a 4 ft 6 in return and 36 in seat depth, a 42 × 20 in centre table, and a large rug.
- **v7 (23 Sep)** — TV wall. The backing moved 8.7 in right to clear W5 and now runs full height; the console extends to the window centreline. From 23 Sep, `output/jaipur-home` became the single maintained model (entries above).
- **Withdrawn drafts:** R-001 to R-005 (TV-unit and living render variants, Oct 2026), withdrawn by the user.
