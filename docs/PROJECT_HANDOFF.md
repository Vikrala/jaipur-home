# Jaipur Home — Complete Project Handoff

**Prepared:** 7 October 2026  
**Purpose:** a precise continuation brief for any architect, designer, visualisation artist, contractor-facing agent, or Codex chat.  
**Current working model:** [`output/jaipur-home`](../output/jaipur-home/). This is the *single maintained* model. From 28 October 2026, update this folder directly and record each coherent change in Git, its [`CHANGELOG.md`](../output/jaipur-home/CHANGELOG.md) and relevant checks. Do not create a separate 3D draft folder for routine changes.

## 1. Read this first — scope, authority, and non-negotiables

This project is a first-floor interior/3D coordination exercise for a residential house in Jaipur. The house layout has already been constructed. The architectural drawing is therefore the controlling geometry, not a loose inspiration reference.

### Authority order

1. The constructed-layout drawing: `Suresh Ji F_F OP-1 Interior Layout.pdf` as revised by the architect on 14 October 2026 ("Revised Interior Layout OP-1", R-011), retained in the model as [`architect-layout.pdf`](../output/jaipur-home/architect-layout.pdf) (the 10 September original is archived as `architect-layout-2026-09-10-superseded.pdf`), and its parsed geometry in [`model/plan-geometry.json`](../output/jaipur-home/model/plan-geometry.json).
2. The current maintained model and its current README: [`output/jaipur-home/README.md`](../output/jaipur-home/README.md).
3. The dated decisions in [`output/jaipur-home/CHANGELOG.md`](../output/jaipur-home/CHANGELOG.md); later entries supersede earlier visual concepts.
4. The approved kitchen image / editable elevation source: [`Kitchen-editable-layout-vivek.pptx`](../Kitchen-editable-layout-vivek.pptx), supported by [`renders/approved-kitchen-reference.png`](../output/jaipur-home/renders/approved-kitchen-reference.png).
5. The selected hall and puja package: [`output/hall-concepts/final-selection/final-specification.md`](../output/hall-concepts/final-selection/final-specification.md), except where a later entry in the maintained model changelog makes a specific revision.

Git history records current model changes. A Git commit tracks the design state; it does not certify site conditions or execution details.

### Do not change without explicit user approval

- Constructed walls, columns, rooms, doors, window IDs/openings, stair, lift well, or ventilation shafts.
- The 10 ft ceiling assumption used by the model.
- The approved kitchen cabinet/elevation logic.
- The decision to omit a dining table/pendants from the kitchen and to omit a separate living-to-kitchen handwash.
- The hall's 75 in TV, compact puja footprint, continuous L-sofa principle, or bedroom-2 bed shift.

### Design intent and user profile

- Interiors must work for older adults (60+) and younger adults (roughly 28–35): low-maintenance, clear circulation, accessible daily-use storage, warm and contemporary rather than fashion-led.
- Use practical Indian-house details: termite/moisture-resistant board choices, hard-water-aware fittings, washable finishes, dust-tolerant detailing, ventilated appliances, service access, realistic electrical points, and waterproofing discipline.
- The former 3D brief explicitly asked for a cohesive modern home, a modular functional kitchen, and visible coordination of sinks, taps, electrical components, lighting, and furniture.
- The model is a design-concept and visual-coordination tool. It is **not** an execution drawing, electrical load calculation, structural design, or statutory approval set.

## 2. Geometry and layout baseline

### Drawing/model facts

| Item | Current recorded value |
| --- | --- |
| Source drawing | `Suresh Ji F_F OP-1 Interior Layout.pdf`, original dated 10 September 2026; revised sheet dated 14 October 2026 adopted by R-011 (walls, columns, rooms, openings, stair, lift and shafts looked unchanged on comparison; `plan-geometry.json` not re-traced) |
| Modelled plot envelope | 27 ft × 60 ft (8,230 × 18,288 mm), for model co-ordinates only |
| Ceiling height | 10 ft (3,048 mm) |
| Main model units | GLB exported in metres; plan source/model script use feet internally |
| Traced architecture status | Walls, columns, rooms and three ventilation shafts were retained through the revisions |

### Room schedule from the architect-traced model

| Zone | Printed drawing size / description | Status in current design |
| --- | --- | --- |
| Master bedroom | 11 ft × 15 ft 3 in | Existing layout retained; bed, wardrobes, TV storage and bedside furniture modelled |
| Bedroom 2 | 14 ft 1½ in × 12 ft 3 in | Bed group shifted toward almirah in latest revision; see §6 |
| Bedroom 3 | 10 ft 6 in × 15 ft 6 in | East-wall run per the 14 Oct revised plan (R-011): 2 ft 9 in wardrobe, 2 ft store with mirror, 5 ft x 1 ft 9 in folding iron table, 1 ft 6 in shelf, 4 ft 3 in wardrobe |
| Master bathroom | 5 ft 7½ in × 9 ft plus washing niche | Interior concept retained; wet-area details are not fabrication-issued |
| Common bathroom | 4 ft 6 in × 8 ft 9 in | Interior concept retained |
| Living hall | 12 ft 6 in × 18 ft 1½ in | Final living/TV/puja design incorporated |
| Kitchen / dining envelope | 14 ft 7½ in × 12 ft 3 in | Approved kitchen retained; no dining set in design |
| Store | As drawn | Shelving/interior retained, subject to site measure |
| Lift lobby | 6 ft 9 in × 4 ft 4 in | Retained; 1 ft x 3 ft shoe rack added against the east wall (R-011) |
| Lift | 5 ft × 5 ft | Retained; coordinate with lift vendor before any finish/service change |
| Stair | Two flights, 3 ft 3 in wide | Retained; stair vertical profile in the model is provisional |
| Front open area/terrace | As drawn | Visual concept only; boundary/terrace construction details are provisional |

### Ventilation shafts — retained, not fillable rooms

- Rear shaft: confirmed by client on 14 September 2026. The 14 Oct revised plan draws a 1 ft 9 in x 4 ft 3 in kota/granite shelf on its west wall (R-011, RFI-011); the shaft itself is unchanged.
- Washing-area shaft: confirmed by client on 14 September 2026.
- Lift-side shaft: confirmed by client on 14 September 2026.
- Their lower termination and structural build-up were not supplied. The dark/void treatment in the visual model is a depth cue, not a slab or structural instruction.

## 3. Completed journey and decisions, in chronological order

| Stage | What was done | Decision that survives into current work |
| --- | --- | --- |
| Initial 3D-house brief | Reviewed the supplied first-floor layout and built a whole-floor walkthrough/GLB concept around it. | Keep the architect's layout; interior improvements must sit inside it. |
| Layout tracing and early review | Walls, columns, rooms, windows, doors, stair, lift and shafts were traced from OP-1. Model viewpoints and QA capture were added. | `plan-geometry.json` is the machine-readable layout control. |
| Whole-home visual design | Modern, warm, practical furniture, lighting and service details were developed for bedrooms, bathrooms, store, washing niche, lobby/stair and terrace. | These zones remain concept interiors; no later whole-room replacement is approved. |
| Kitchen revision cycle | Multiple kitchen variants were tested, then the 14 September image and the Vivek PPT elevations were treated as approved. The hob/hood was later realigned. | Current kitchen is described in §4 and must not be casually redesigned. |
| Hall and puja re-check against constructed plan | A new OP-1 check corrected a major earlier assumption: puja is a compact perpendicular unit at the stair/Bedroom-3 corner, not a freestanding niche beside the stair. TV wall is along the stair enclosure. | Hall geometry, TV/puja relationship, no dining table, no hall sink. |
| Hall/puja reference research and options | Selected Pinterest references were mapped into L1/L2/L3 living and P1/P2/P3 puja options. | Final selection: L1 room base + L2 TV/service joinery + L3 botanical art; P1 visual language + P3 pocketed opening/diya operation. |
| Hall/puja operations refinement | Pooja doors, tray, photo/idol inventory, ventilation, heat risk and service controls were made explicit. | Four pocket-fold leaves, independent full-width diya tray, 8 photos, 7 idols, two drawers, real-flame rules. |
| Final living-room correction | Sofa, rug, table, TV wall and W5 relationship were adjusted. | Continuous 11 ft sofa/return composition, 75 in TV, full-height backing clear of W5. |
| Bedroom 2 privacy test and rollback | A privacy screen was proposed, then removed because it made the entry visually intrusive. Bed was instead shifted toward almirah. | **Do not reintroduce the privacy screen** unless user asks. Bedside tabletop meets wardrobe. |
| Current maintenance convention | The numbered v2–v7 folders were retained as history; `output/jaipur-home` was declared the maintained model. | Make approved updates only in `output/jaipur-home` and append to its changelog. |
| Single-model consolidation (27 Oct 2026) | R-012 master bathroom and R-008 realism merged; all drafts and v2–v7 retired (to Trash). | One 3D model only: `output/jaipur-home`. RFIs kept; RFI-013 added. |

## 4. Approved kitchen — highest-confidence finished design

### R-019 kitchen–living ledge added to the working model (28 October 2026)

The user requested a 3 ft 6 in / 1,067 mm long slab with storage, approximately 600 mm deep, with its top 2 ft 6 in / 762 mm above finished floor. After review, the unit was set back near the sofa and brought flush to the west wall along its side. The floor-supported base has kitchen-facing drawer storage; the living face has shallow dark fluting and a light stone-look top. The model shows about 101 mm to the sofa end and 1,562 mm on the east kitchen approach before finish tolerances. Verify the finished wall and skirting, sofa gap, drawer/door operation, concealed services, stone support and anti-tip fixing before fabrication. The approved kitchen wall cabinetry, appliances, dining omission and puja remain unchanged.

### R-020 kitchen worktop granite study (28 October 2026)

The client's [site-photo granite](../output/jaipur-home/kitchen-granite-reference.jpg) is rendered on both kitchen worktop runs for review. The model approximates a polished black base with crinkled copper/rust banding; the banding follows each run. It is **under consideration**, not a final stone selection. Confirm the actual slab batch, thickness, edge profile and L-corner cut/joint before fabrication. Other granite surfaces remain unchanged.

### Controlling sources

- Current visual/model: [`output/jaipur-home`](../output/jaipur-home/).
- Original approved reference: [`renders/approved-kitchen-reference.png`](../output/jaipur-home/renders/approved-kitchen-reference.png).
- Editable elevation source: [`Kitchen-editable-layout-vivek.pptx`](../Kitchen-editable-layout-vivek.pptx); do not overwrite it.
- Kitchen-specific render iterations and notes: [`output/kitchen-preview`](../output/kitchen-preview/).

### Fixed layout and cabinet logic

- Modular kitchen uses two light drawer stacks, one **unsplit wide walnut drawer stack** below the main window, a narrow hob-side drawer stack, and a full-height corner door.
- Drawer tiers align at the same heights.
- Corner: one **fixed shelf** only. No swing-out trays and no RO-wall access through the corner.
- RO/sink wall: drawers to the left of the sink; two full-height sink gates; light drawers before the fridge. No drawers under either bowl.
- Sink: double bowl. The drying rack and sink are identical model width and share a centreline: **3.30 ft / 1,006 mm**.
- RO: hidden behind a cut-out gate, but dispensing spout remains directly accessible.
- Mini geyser: concealed below the right sink bowl.
- Hob: four burners. Hob and concealed chimney share one centreline.
- Chimney: one lift-up access front; hood body/intake remains accessible. Chimney service tower is not storage.
- Exhaust service shutter: confined to the right window pane; terminates at the jamb; has a separate grille and handle.
- Kitchen dining set, pendants, and separate living-to-kitchen handwash are removed.

### Verified geometry/QA

- Hob shifted right by **14.43 in / 366 mm** in the v3 correction.
- Modelled hood clearance to window jamb: **77 mm**; clearance to exhaust frame: **21.7 mm**. These are model checks, not installation approval.
- QA passes in current model confirm: hood clears window, no overlapping drawer/sink bays, four burners, two recessed bowls, rack centred and equal to sink width, direct RO tap cutout, fixed reachable corner shelf, geyser below sink, and no dining/handwash.

### Kitchen action before fabrication

Confirm actual hob, chimney, fridge, RO, rack, geyser, sink and hardware model numbers; then prepare a measured shop drawing for shutter swing/lift clearance, plumbing traps, RO waste, electrical circuits, chimney duct route, ventilation, and countertop joints. The current cabinet/appliance sizes are still provisional.

## 5. Final living hall and TV wall

### Correct spatial relationship

- Hall is **12 ft 6 in × 18 ft 1½ in** (3,810 × 5,525 mm).
- TV wall is along the stair enclosure; puja turns perpendicular at the stair/Bedroom-3 edge, facing toward the kitchen/Bedroom-3 approach.
- Do not put the puja facing the sofa or turn it into a freestanding unit beside the stair.
- Do not add a dining table, hall sink/handwash, extra accent chair, exposed electronics, or a partition.

### Current approved composition

- L-shaped sofa: **11 ft (3,353 mm) main run**, approximately **4 ft 6 in** return in selected specification, 34–36 in deep (current model check records 2.83 ft / 863 mm depth). The seating is modular below but visually one continuous bench plane; no visible seat split.
- Current model has a 5.38 ft return extending to the AC-wall end; use the final model rather than older concept imagery if dimensions conflict.
- Sofa back: about 30 in / 760 mm high.
- Rug: modelled **7 ft 2 in × 10 ft 1 in** (2,179 × 3,073 mm).
- Centre table: **42 × 20 in** (1,067 × 508 mm).
- Clearance logic: 36 in target walking band; model/design package records about **39.5 in / 1,003 mm** on either long side of centred table.
- Sofa service plank: narrow walnut plank, separated from upholstery and below sofa-back height. Top roughly 650 mm above finished floor, warm 2700K dimmable wall wash, one reachable module at each exposed end (Indian 6A + USB-A + USB-C). Driver must be in an accessible ventilated box.
- Artwork: two botanical frames; use anti-glare acrylic rather than glass.
- AC: current main revision centres it on the solid left wall.

### TV / console

- TV: **75 in**, 16:9; approximately 65.4 × 36.8 in (1,661 × 935 mm). Current maintained model raises TV centre by 1 ft from the earlier position; model records TV centre at 5 ft above floor. Treat current model/changelog as latest.
- Backing: floor/console to 10 ft ceiling, shifted right **8.73 in / 220 mm** to clear W5; modelled clearance to W5 is **61 mm**.
- Low console: hidden ventilated equipment bays, power/data raceway, spare conduit/service loop, IR repeater; no exposed cables. Current model records 9.22 ft width, while older selection document says 8 ft 6 in. **Resolve final console length from current site measurement and retain the current rule: left end aligns to W5 centreline without obstructing window.**
- Main entry controls: below W5, above console, not integrated into the TV feature.
- Bracket must fix to masonry/structural backing—not decorative board or stone finish alone.

## 6. Final puja unit

### Envelope, position and inventory

- Exact architect footprint: **42 in wide × maximum 13.5 in deep** (1,067 × 343 mm); approximately **84 in / 2,134 mm** high.
- Unit turns perpendicular to the TV/stair wall within the living edge. Keep adjacent bedroom door operation clear.
- Exactly **7 idols**, each up to 4 in tall, on a removable two-level non-combustible stone riser.
- Exactly **8 framed photos**, on two shallow rails, 4 per rail. Tallest frame: 9 in; smallest pieces about 3 in.
- Two lower drawers: daily-use shallow drawer above bulk-supplies drawer; use removable washable liners.

### Closure and diya operation

- Four narrow, approximately 9 in P1-style fluted/toughened-glass leaves with brass/walnut frame language.
- Each side's two leaves fold, pivot 90 degrees and retract into a flush side pocket; no leaf can remain in the hall or adjacent 32 in door path.
- Doors close only across the shrine opening; the two drawers and diya tray remain below the door line and separately accessible.
- Diya tray: cabinet-width fascia; **3.24 ft clear internal width** in current QA, full extension about 1 ft, non-combustible stone base, removable brass drip liner, raised oil-retaining lip, positive stops, and **minimum 25 kg-rated full-extension runners**.
- Model controls intentionally sequence operation: extending tray opens shrine; closing shrine retracts tray first.

### Non-negotiable fire/maintenance rules

- Use quartz/sintered stone or equivalent non-combustible surface at altar, back, tray and overhead hot zone.
- Keep at least **18 in / 457 mm** clear above the diya flame; photo frames, timber and LEDs must be outside smoke/flame plume.
- Permanent high and low ventilation must remain open in all door states.
- For diya/incense/dhoop: park doors fully open, fully extend tray, and keep only flame-free closure. Close only after all flame/embers are extinguished and the hot liner cools.
- Use manufacturer-rated synchronised pocket-fold hardware; do not fabricate the mechanism with ordinary wardrobe channels. Require a full-size mock-up, supplier installation approval and removable access panel.

## 7. Bedrooms, bathrooms, utility, stair and outdoor zones

These were included in the original coordinated whole-home model. They are not newly reapproved shop drawings; preserve their layout until a user specifically asks to revise a zone.

### Master bedroom

- Modelled with 6 ft × 6 ft 6 in bed, bedside drawers, west wardrobe and TV-storage/console composition.
- Original design intent: older-adult-friendly clear floor, bedside controls and closed storage.

### Bedroom 2 — latest change

- Bed and both bedside tables shifted approximately **538 mm / 1 ft 9.2 in toward the east almirah**.
- Almirah-side bedside tabletop now touches wardrobe exactly: **0 mm gap**; no overlap.
- Associated charging points, headboard artwork and ceiling fan shifted with bed so alignments remain coherent.
- Prior 545 mm gap was removed.
- A privacy screen was tested then rejected/removed: it compromised arrival and was visually intrusive. Existing doorway and masonry are untouched.

### Bedroom 3

- Modelled with 5 ft 6 in × 6 ft 3 in bed, bedside tables, two north/south wardrobe runs and a folding iron table (R-007; the TV was removed). Preserve door/terrace-window relationship.
- R-011 (15 Oct 2026, revised plan of 14 Oct): east wall is 2 ft 9 in wardrobe, 2 ft store with mirror, 5 ft x 1 ft 9 in folding iron table (hinged leaf, surface 2 ft 9 in assumed, folds up; proposed socket below), 1 ft 6 in open shelf, 4 ft 3 in wardrobe = 15 ft 6 in. Bed-to-table gap 2 ft 3 in. No TV in Bedroom 3. (R-006/R-007 had 2 ft 10 in / 5 ft 6 in / 11 in.)

### R-006 model corrections (13 Oct 2026)

- Bedroom 2 AC was on the west wall in R-006; R-011 moved it to the south wall over the study unit. W2 sill 2 ft 6 in; W9 sill 1 ft 6 in (RFI-006). Mirrors added at Master east-wall store, Bedroom 2 north wall and Bedroom 3 store.
- Master hidden locker modelled inside the NW bedside; store BRICK return added (height provisional); D6 and D9 modelled as two-way doors (RFI-007, RFI-008).
- Bedroom 2 bed-group shift was not touched; the Bedroom 2 north mirror sits behind the shifted bedside until that is revisited.

### R-010 Bedroom 2 east-wall correction (15 Oct 2026)

- The Bedroom 2 east-wall run now matches the architect plan: 3 in offset from the north wall, a **1 ft 3 in** oak end store, then the **10 ft 9 in** wardrobe = 12 ft 3 in (the room length). The store was previously modelled 2 ft long and overlapped the wardrobe by about 6 in.
- Store depth is still 2 ft; its back face sits on the east wall face. A 0.72 in reveal separates the store door from the first wardrobe door.
- Bed-group shift and the bedside-to-wardrobe contact are unchanged. The 3 in strip north of the store is modelled open as drawn; whether it needs a filler or furring panel is not on the drawing (proposed as an RFI, not yet raised).

### R-011 revised architect layout (15 Oct 2026)

Source: architect's "Revised Interior Layout OP-1", dated 14 October 2026, now `architect-layout.pdf`. Sizes come from written dimensions, or from outlines measured off the PDF vectors where nothing is written.

- **Bedroom 2:** STUDY UNIT 5 ft x 1 ft 6 in on the south wall replaces the TV unit (TV removed); face 3 ft 9 in from the bed foot, about 3 in off the wall. AC moved from the west wall to the south wall, centred over the unit. Desk height 2 ft 6 in, three-drawer east pedestal and modesty panel are assumptions (RFI-012). The bed-group shift, east wardrobe and R-010 end store are unchanged.
- **Lobby:** SHOE RACK 1 ft x 3 ft against the east wall from the lift-entry wall face. Height 3 ft 3 in and open shelves are assumptions (RFI-012).
- **Rear shaft:** KOTTA/GRENITE SELF 1 ft 9 in x 4 ft 3 in on the shaft west wall. Height 2 ft 6 in, 1.5 in slab and corbels are assumptions; shaft status unchanged (RFI-011).
- **Bedroom 3:** east-wall run per the table above; iron table now 5 ft long.
- **Kitchen sink:** revised plan shows a double bowl, matching the approved kitchen; no change.
- **Not modelled by instruction:** AC symbol on the kitchen/dining east wall; plan label "LOCKER" (no longer "HIDEEN").

### Bathrooms, washing and store

- Master bath (R-012, promoted 27 Oct 2026):
  - **Shower:** 900 × 1,220 mm, fully open, with no glass returns, screen or kerb. The glass was removed in R-015, 27 Oct 2026, so the whole bathroom floor is treated as wet.
  - **Drain:** a flush linear drain along the back wall under the mixer, over the architect's floor-drain point. The floor falls away from the walkway.
  - **Route:** with the glass gone, the route to the WC and washer is no longer separated from the shower.
  - **Towels:** a bar and two robe hooks on the east wall, south of the shower line (R-016), with a hand-towel ring by the vanity.
- **Bathroom wall tile (R-018):** floor to ceiling, 10 ft, on every wall of both bathrooms. This includes the master washing niche, the panels above doors D3 and D5 and above windows W9 and W4, and the common bathroom's north (lobby-side) wall, which was previously painted.
  - **Geyser:** 25 L vertical, high in the north-west corner above the vanity. Its underside is at 2,256 mm.
  - **Vanity and WC:** a floating vanity with an arched mirror, a sage cupboard above the WC, and brass fittings.
  - **Future grab bars and seat:** blocking recorded behind the tile.
  - **Washer:** raised so its marble top is at 610 mm, with baskets underneath.
  - **Floor joints:** 1 mm on every floor tile in the house (R-015).
  - **Open RFIs:** RFI-013, RFI-004, RFI-005 and RFI-006.
- Common bath: retain 4 ft 6 in width, vanity/mirror light, WC, shower, high ventilation/exhaust; external switch is modelled.
- Washing niche: modelled washer, inlet tap, hose, switched outlet and ventilation shaft. Electrical point must be a suitable protected circuit and final plumbing/shaft details must be checked on site.
- Store: interior shelving concept retained; older model wording references a separate handwash because it was originally shown in the drawing, but the approved kitchen/living decision removes a separate living-to-kitchen handwash. Do not re-add one by assumption.

### Lift, stairs and terrace

- Lift: maintain 5 ft × 5 ft well; lift supplier governs clearances, pit/headroom/ventilation and finish interface.
- Stair: 23-step concept/3 ft 3 in flights in model; riser/tread/handrail/landing details must be taken from measured built work, not this visual model.
- Terrace/open front: warm outdoor tile and chairs are visual-only. Confirm waterproofing screed slopes, drainage outlet, parapet/railing height, expansion joints and weatherproof electrical points before making it an execution scope.

## 8. Visual/model assets and how to continue safely

### Current handoff files

- [`docs/LATEST_COMPLETE_HOUSE_DESIGN.json`](LATEST_COMPLETE_HOUSE_DESIGN.json): structured version of this handoff; intended for another agent or a script.
- [`output/jaipur-home/walkthrough.html`](../output/jaipur-home/walkthrough.html): interactive current walkthrough. It starts at night and supports day/night, kitchen access doors, puja cabinet/tray states, room selection and GLB download.
- [`output/jaipur-home/model/jaipur-first-floor.glb`](../output/jaipur-home/model/jaipur-first-floor.glb): current complete first-floor GLB; access doors exported closed.
- [`output/jaipur-home/model/interior.js`](../output/jaipur-home/model/interior.js): current editable scene logic.
- [`output/jaipur-home/model/quality-checks.json`](../output/jaipur-home/model/quality-checks.json): machine-recorded QA and limitations.
- [`output/hall-concepts/final-render-v2`](../output/hall-concepts/final-render-v2/): final review image set / prompts.
- [`output/hall-concepts/final-selection`](../output/hall-concepts/final-selection/): selected hall/puja specification and selected visuals.
- Numbered copies v2–v7 and all draft folders were retired on 27 Oct 2026; `output/jaipur-home` is the only 3D model. Their history is summarised at the end of `output/jaipur-home/CHANGELOG.md`; QA records are in `studio-control/qa/`.

### Safe workflow for the next agent

1. Read this handoff, the structured JSON, the current `README.md`, `CHANGELOG.md`, and `quality-checks.json`.
2. Use `plan-geometry.json`/architect PDF to test every proposed placement; never use a generated render as geometry authority.
3. Check whether the request changes a construction-fixed element. If yes, seek user decision plus architect/structural sign-off where applicable.
4. If changing the model, update `output/jaipur-home` only, retain the architect geometry, rebuild affected outputs, run focused checks and append a dated changelog entry. Commit each coherent change to Git instead of creating a routine 3D draft folder.
5. For an execution question, produce a measured drawing/specification list and flag outstanding site/vendor confirmations. Do not claim that a Git commit or the 3D model is approved for construction.

## 9. Outstanding decisions and site-verification register

| Priority | Item | Needed before action |
| --- | --- | --- |
| Critical | Final joinery dimensions | Site measure after final floor, skirting, plaster/stone thickness and window/door reveals are known. |
| Critical | Pooja door/tray | Hardware supplier's rated pocket-fold system, full-size mock-up, 25 kg tray runners, ventilation free area and fire-safe lining confirmation. |
| Critical | Kitchen appliance/service fit | Actual appliance cut sheets, chimney duct/installation height, RO/gas/water/drain routes, geyser circuit and shutter clearances. |
| High | Kitchen–living ledge R-019 | Measure finished wall/sofa fit and 1,562 mm model approach, test drawer and adjacent door operation, and detail stone support, anti-tip fixing and any concealed LED supply. |
| Critical | TV wall | Masonry fixing location, W5 reveal clearance, conduit paths, console support and equipment ventilation. |
| High | Wet areas/terrace | Waterproofing, floor slope, drain test, grout/sealant and plumbing penetration strategy—not available from model. |
| High | Electrical | Licensed electrician to confirm loads, circuiting, earthing, RCD protection, appliance isolators, wire sizes and wet/outdoor fitting ratings. |
| High | Bedroom 2 | Reconfirm built wardrobe face, bedside cabinet thickness and bed position before fabrication; screen remains rejected. |
| Open | Site/orientation/budget/family routine | Not adequately recorded in earlier chats. Ask only if relevant to a new scope; do not invent them. |

## 10. Known limitations and conflicts to handle explicitly

- Visual lighting is illustrative; there is no measured lux study.
- Material textures and live model lighting can differ from photorealistic reference renders.
- The GLB was browser-exported again on 29 Oct 2026 from the combined R-019 ledge and R-020 kitchen granite scene. It is valid glTF 2.0, but it is not a BIM or fabrication model.
- After R-008, the walkthrough is heavier (about 4 MB HTML). Load time and frame rate on a real GPU have not been measured.
- Sink/chimney, TV console and puja dimensions are concept-level until vendor and site coordination.
- W8 is deliberately retained in architecture even if it falls outside older accepted camera framing.
- Older artifacts mention a kitchen dining set or handwash; those are superseded by the approved omission. Avoid reviving rejected items due to stale render content.
- The user did not provide a verified construction budget, site orientation, contractor details, product list, or measured post-finish dimensions in the retrievable project chats. These are genuine unknowns, not blanks an agent should fill with assumptions.
