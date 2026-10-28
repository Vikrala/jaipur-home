# QA and multi-perspective review: main model after R-015

**Date:** 27 October 2026
**Model:** `output/jaipur-home/` (BASELINE-2026-10-27, with R-013, R-014 and R-015 applied)
**Verdict:** pass with holds. The model loads, and the R-015 removal is clean. The holds are described below.

## Specialists

| Agent | Perspective | Model | Effort | Tier | Consent |
|---|---|---|---|---|---|
| BASELINE-site-qa-01 | Independent QA (code, geometry, records) | claude-sonnet-5-5 | medium | standard | not required |
| BASELINE-site-qa-02 | Carpenter, painter, electrician, plumber, tiler/waterproofing, mason, fabricator, AC | claude-sonnet-5-5 | medium | standard | not required |
| BASELINE-ffe-01 | Home owner and interior designer | claude-sonnet-5-5 | medium | standard | not required |

- **Routing:** `scripts/model_router.py`, rule `standard-design-delivery`.
- **Run records:** `agent-runs/RUN-QA-2026-10-27-*.json`.
- **Access:** all three agents were read-only.

## Coordinator verification

I checked the agents' claims against the code before accepting them.

**Confirmed:**
- The towel bar and robe hooks are on the east wall directly opposite the open shower front. `interior.js:939-944` still says "Outside the spray", which is now false.
- The `toilet()` collider is an unrotated ±0.75 × ±1.1 ft box, but the master WC is rotated 90°, so walk-mode collision is wrong around it.
- `LATEST_COMPLETE_HOUSE_DESIGN.json:293` still says "dry route 745/676 mm" and "through-glass towel rail".
- RFI-013 still says "flush grate and border" and "glass fixing".
- The template header still says "Updated 15 Oct 2026".
- Kitchen wall units run 1,555–2,515 mm, with lofts above to the ceiling.
- The R-015 code removal is clean. No references remain to the glass objects, the toggle or the border.

**Rejected:**
- *"The kitchen backsplash uses the 4 × 2 ft floor tile"*, raised by the owner/designer review and the trades review. It is false: the backsplash uses `bathStone`, the anti-slip bath tile (`interior.js:643-645`). The error came from the R-014 and R-015 CHANGELOG wording, which needs correcting.

**Not verified:**
- The TV console length and the puja depth limits.
- Kitchen aisle and bedside clearances.
- The swing of door D3 against the geyser.

## Findings

### Must fix: model and records

1. **Master bath towel bar and hooks.**
   - They are about 684 mm opposite the open shower, so towels will get wet.
   - Fix: move them to the north (door) wall or the vanity side, and correct the note.
2. **Stale glass text in the records.**
   - Where: `docs/LATEST_COMPLETE_HOUSE_DESIGN.json:293` and `:359`, the RFI-013 reason and item 3, and the "2 ft 5 in route" caption.
   - The R-014 and R-015 CHANGELOG lines also wrongly say the backsplash uses the floor tile.
3. **Master WC collider.** Swap the half-extents for rotated WCs.
4. **Captions and header.** The viewpoints are still named "reference draft", and the header date is 15 Oct.
5. **Stale stills.** These still show the glass:
   - `renders/bath-master*.png`;
   - `realistic/bath-master*.png`;
   - `renders/bath-master-glass-hidden.png`, which now depicts a control that no longer exists.

### Must resolve on site and in the tender (professional sign-off)

6. **Open-shower electrics.** The vanity mirror light, the geyser outlet (about 790 mm from the rain head), the washer socket and the exhaust are all within spray reach. A licensed electrician must set the zones and IP ratings, with 30 mA RCD protection on all bathroom circuits and the geyser isolator outside the bathroom.
7. **Whole-floor waterproofing.**
   - Waterproof the whole floor, with a 300 mm upturn and full height at the shower, vanity and WC walls.
   - Ponding test.
   - Bath door threshold lip.
   - A drawn slope plan at 1:80–1:100 toward the back-wall drain. The WC end may sit 20–30 mm higher, so set the WC and vanity heights after the screed.
8. **Drain sleeve.** Confirm the actual sleeve position and slab depth before ordering the linear drain. The plan position is read from a raster at ±30 mm (RFI-013).
9. **1 mm floor joints, 4 × 2 ft tiles.**
   - Achievable only with rectified tile from one batch, a flat screed, full-bed adhesive with back-buttering, levelling clips and epoxy grout.
   - Needs movement joints at thresholds and on long runs.
   - Lay a trial bay first.
   - Both reviewers recommend 2 mm. **The user chose 1 mm (D-014), so this needs the user's decision.**
10. **Puja pocket-fold fluted-glass leaves.**
    - The cabinet is 343 mm deep. Use rated pocket hardware and a full-size mock-up before tender (RFI-002).
    - Do not tender it as a lump-sum carpentry item.
11. **Board specification.**
    - BWP/BWR ply for the kitchen, the bath-adjacent units and the utility cupboard.
    - Termite treatment.
    - 2 mm edge-banding on wet edges.
    - No MDF or particle board in wet zones.
12. **Washer in a wet room.**
    - Masonry or RCC-framed platform, not a loose slab.
    - Access hatch of at least 300 × 300 mm.
    - Air-gap on the standpipe.
    - Anti-vibration pads.
    - Leak tray (RFI-013).

### Should fix: owner and designer

13. **Kitchen uppers.** Daily items belong at or below about 1,800 mm for the 60+ users. Mark the band above about 2,100 mm as occasional storage only, and consider a pull-down shelf.
14. **Master bath storage.** The floating vanity loses storage. Add a deep drawer or a recessed niche for medicines and cleaning supplies.
15. **Living sofa.** A firm 450 mm seat, at least one firm arm, and a removable, stain-resistant cover.
16. **Paint.** No chalk or lime paint in the master bath. Use washable acrylic, and apply damp-proofing on the living side of the shared east wall.
17. **Lighting layers.** Add:
    - a 2,700–3,000 K wall-wash or cove at the TV wall;
    - a bedside reading light at each bed;
    - a dimmable layer in the master bath.
18. **Palette.** The kitchen's cream-yellow upper shutters are the odd one out. Terracotta is only a prop colour. Use one walnut throughout.
19. **AC.** Condensate drain routes and outdoor-unit locations are not shown for any room.

## RFIs proposed (not yet raised)

- **RFI-004:** split it, and add the whole-floor waterproofing extent, the ponding test and the threshold level.
- **RFI-005:** add electrical zoning for the open shower.
- **RFI-013:** add a floor slope plan.
- **New:**
  - large-format tiling: joint width, trial bay and movement joints;
  - board and edge specification for wet-zone and kitchen carpentry;
  - AC condensate drains and outdoor units per room.
- **RFI-002:** treat as a blocker until the hardware is chosen.
- **RFI-006:** add a security grille at the W9 opening.
