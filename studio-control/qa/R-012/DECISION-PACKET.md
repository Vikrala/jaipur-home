# R-012 decision packet — master bathroom and raised washer (rev 4, 27 Oct 2026)

## Scope authorised by the user, 25 October 2026

- Update the master bathroom's finishes and visible fittings in the spirit of the supplied image.
- Raise the existing front-load washer so its platform's finished marble top is 610 mm (2 ft) above the floor.
- Keep constructed walls, door and window openings, the washing-niche location, other rooms and the approved kitchen unchanged.
- Rev 2 (same day): user asked for a usability review of the draft and for it to be corrected.

## What rev 1 got wrong (found by rendering the draft and walking it)

| # | Problem in rev 1 | What it means in daily use | Rev 2 fix |
|---|---|---|---|
| 1 | One fluted panel stood ~1.1 m out from the wall, parallel to it, with both ends of the shower open | Water reaches the WC and vanity. The only path to the WC and washer crossed the wet shower floor, and the gap past the panel was ~565 mm | Two fixed arched fluted returns, one by the vanity and one by the WC, as in the reference. The shower is 900 × 1,220 mm with a 1,220 mm open front. A dry 745 mm route runs to the WC and washer |
| 2 | Mixer, riser, hand shower and shelf floated about 220 mm in front of the tile | Cannot be built; the rain head sat almost over the wall | Set fixed to the tile face. Rain arm extended to put the head about 400 mm out |
| 3 | Point drain in mid-room; nothing marked the wet zone | The whole floor would need falls; puddles in the walkway | Brass linear drain just inside the shower entry, with a black border tile marking the wet zone. *(Superseded in rev 4: the "about 150 mm" outlet shift was measured from a model placeholder; against the architect's drain it was about 0.7 m. The drain now runs along the back wall.)* |
| 4 | No towel rail, robe hook or hand-towel ring | Nowhere to hang a towel or clothes; wet floor from dripping | Towel bar opposite the shower entry, two robe hooks on the dry east wall, hand-towel ring beside the vanity |
| 5 | Mirror backlight wider than the vanity, reaching the shower zone | Splash on an electrical fitting; untidy edge against the glass | Mirror kept within the vanity width and raised clear of the spout |
| 6 | WC-side wall and washing-niche walls were paint | Health-faucet splash and washer leaks on paint | Pale stone tile to 7 ft 2 in on the WC (W9) wall and all three niche walls |
| 7 | Washer socket about 120 mm directly above a kitchen-style gooseneck tap | Water dripping onto a live socket | Washing-machine angle valve on the east niche wall and an IP-rated, RCD-protected switched socket on the west wall, 747 mm apart. Both sit above the machine top, just behind its front face |
| 8 | Services in a ~90 mm side gap, overhead cupboard ~110 mm above the machine | Valve and plug cannot be reached; machine top boxed in | Cupboard lifted to 6 ft 7 in (575 mm clear above the machine), now for spare stock reached with a step stool |
| 9 | Drain hose hung down the front of the machine, across the door | Snags laundry; trip and kink risk | Hose runs behind the machine to a standpipe with an air gap behind the platform |
| 10 | Bay under the platform left as an open frame; no anti-walk restraint | Wasted space; machine can creep forward on spin | Two lift-out laundry baskets on feet under the platform. Front marble upstand added; restraint brackets still to be detailed |
| 11 | No hot-water source anywhere in the bathroom | Cold shower in a Jaipur winter | Horizontal geyser provision above the door, clear of the spray and the door leaf. Delete it if the house has solar or central hot water |

## Your decisions and what changed

| # | Decision | Your answer | Where the draft is now |
|---|---|---|---|
| 1 | Shower front | Agreed: open 1,220 mm front (27 Oct) | Open front kept |
| 2 | Hot water | A 25 L **vertical** geyser in the bathroom (27 Oct) | High in the north-west corner of the door wall, above the vanity: underside 2,256 mm (7 ft 5 in), top about 2,905 mm, clear of the door opening and swing, outside the shower, above the mirror. Horizontal geyser over the door removed. Body (~400 mm dia × 650 mm) is a placeholder until you pick a model |
| 3 | Linear drain | First answer (27 Oct) rested on a wrong "150 mm" figure. **Re-decided 27 Oct: along the back wall, under the mixer** | Brass linear drain against the green-tile wall, 9 mm off the tile, 823 mm behind the open front. It passes over the architect's floor-drain point (plan ≈ x 1.27 ft, z 26.37–26.42 ft, read independently by the author and QA), so the outlet stays there (about 75 mm toward the wall). Floor falls run **away** from the open front and the walkway. Grate and black border are flush (highest part 0.3 mm in the model) |

## Rev 4 fixes from the independent QA of rev 3

| QA finding | Rev 4 change |
|---|---|
| Drain shift mis-stated (150 mm vs about 0.7 m) | Drain moved to the back wall (your decision 3, re-decided); shift is now about 75 mm |
| Drain modelled ~12.6 mm proud | Grate, slots and border lowered; check now tests every part at ≤ 1 mm |
| Towel bar 676 mm beyond the open front | Added a 290 mm brass towel rail through-glass on the dry face of the vanity-side return, 1,100 mm high, standing 42 mm off the glass so a folded towel fits, 83 mm from the opening corner. East-wall bar and hooks stay for bath towels and clothes |
| No 60+ provisions | Blocking behind tile for a vertical grab bar beside the mixer, a fold-down seat (shower back wall, south end) and a fold-up bar beside the WC. Bars and seat are not fitted now; the blocking makes them a one-day job later |
| Shower downlight, PRV route, hot-water route unchecked | Downlight inside the shower flagged IP65/RCD; PRV discharge via the chase to a tundish into the basin waste; insulated hot line about 3 m to the mixer. All three recorded and checked as notes (not geometry) |
| Weak checks | Real error capture (injected hook, proved with a probe); narrowest route measured at the towel bar; vanity gap to the glass face; flush test on all drain parts; new WC-cupboard, rail and blocking checks. 33/33 pass |
| Stale QA record and unlabelled evidence | Evidence sorted into `evidence/rev1` … `rev4`; old QA record archived; new `qa-record.json` indexes both independent reviews |

**Trade-offs that stay** (accepted by you, 27 Oct 2026):
- The mixer is on the back wall, 900 mm from the open front, so you cannot reach it from outside. The thermostatic mixer and hand shower reduce the need to pre-run water. Moving it is not possible because both side walls are glass.
- The narrowest dry route is 676 mm at the towel bar (745 mm wall to glass). That is fine for one person walking, but below a 900 mm walker width.
- Vanity to glass gap is 40 mm: a slot that collects dust. A silicone-sealed filler strip is the fix at site.

## Draft additions — confirmed by you on 27 Oct 2026

You confirmed all three below and accepted the 676 mm narrowest route and the mixer on the back wall ("Keep the WC upper cupboard, the brass WC fittings with the tiled cistern box, and the floating vanity…").

These were added during rev 1–2 to match the reference image and were disclosed after QA:

1. **WC upper cupboard**: shallow sage cupboard above the WC, about 168 mm deep, 2,035–2,751 mm high. Needs moisture-resistant, termite-treated board with sealed edges and a proper wall fixing.
2. **Brass WC fittings and tiled cistern box**: brass flush plate and health faucet; the concealed-cistern box tiled in the pale stone.
3. **Floating vanity**: replaces the approved floor-standing oak vanity cabinet with a floating white unit (a single drawer zone about 235 mm tall, open floor below; the approved cabinet was about 870 mm tall, floor-standing). It looks lighter and is easier to mop under, but it holds **much less** storage. The WC cupboard partly makes up for it.

## Evidence

- Rev 4 renders, captured straight from the 3D canvas at 1600 × 1000: `evidence/rev4/rev4-bath-from-door-drain.jpg`, `rev4-shower-drain-closeup.jpg`, `rev4-bath-vanity-geyser-rail.jpg`, `rev4-bath-master.jpg`, `rev4-washing.jpg`.
- Checks: 33/33 in `verification/verify-results.json`.
- Earlier revisions: `evidence/rev1` (before), `evidence/rev2` (after rev 2; washer views still match), `evidence/rev3`.

## Execution holds (unchanged in principle)

1. Measure clear dimensions, floor falls, the sunken slab and the drain sleeve at site. Falls go to the back-wall channel; turn the waterproofing up behind its wall flange. Use a matte, slip-resistant floor tile and keep waterproofing continuous around the drain, glass channels and wall fixings (RFI-004).
2. Get a support detail for the loaded, spinning washer: frame, slab thickness, anchorage, anti-walk brackets and floor capacity. A loose marble slab over an unsupported gap is unsafe. Lifting the machine down for service needs two people (RFI-013).
3. Confirm the washer model, hose lengths and drain head. Wet-area circuits for the washer socket, the 25 L geyser and the mirror light need RCD protection and IP-rated boxes from a licensed electrician (RFI-005). The geyser needs a dedicated circuit with an isolator outside the bathroom, a PRV discharge line to a drain, and a wall fixing rated for the full tank. Check the selected model's height and connection side against the 2,256 mm underside and 143 mm ceiling gap. The wall behind the geyser backs onto the bedroom wardrobe: confirm its construction before fixing a full tank.
4. Glass: toughened fluted glass in brass-finish wall and floor channels. Arched returns need a supplier's fixing detail; add a stabiliser bar if the supplier requires one. Towel-rail holes must be cut before toughening.
5. W9 sits beside the WC with a 450 mm sill onto the shaft. Window safety and privacy remain under RFI-006.
6. Shower downlight IP65 on an RCD circuit; grab-bar and seat blocking fixed before tiling (RFI-013).

The draft is a visual concept. It has not been promoted to the maintained model or issued for construction.
