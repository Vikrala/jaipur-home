# QA-B2-2026-11-01 — Bedroom 2 wardrobe corner

Independent read-only site QA (claude-sonnet-5-5, medium, standard tier; routed by `studio-control/scripts/model_router.py`, rule `standard-design-delivery`, no consent required) of the Bedroom 2 corner built earlier on 1 Nov 2026, against the client's approved sketches and observations. Measurements were taken from world bounding boxes in the built walkthrough.

## Findings and disposition

| ID | Finding | Severity | Disposition |
|---|---|---|---|
| F1 | Bedside top projected 143 mm past the 381 mm niche and fouled the north sliding leaf by about 13–35 mm over 150 mm | High | Fixed: niche widened to ~600 mm to the table front; table back to the mirror face, front 9 mm clear of the leaf (client chose widening over shrinking the table) |
| F2 | Mirror ran to 2,920 mm, past the corner upper door | High | Fixed: glass top ~2,374 mm, below the door at 2,417 mm |
| F3 | Only one niche light strip | High | Fixed: warm LED profiles in both inner rear corners of all four tiers; electrician check under RFI-015 |
| F4 | Uneven niche tiers (945/503/527 mm) | Medium | Fixed: four equal tiers, ~474 mm clear |
| F5 | 229 mm compartment only 197 mm clear | High | Fixed: 229 mm clear inside boards; fixed shelves at ~300 mm |
| F6 | Upper doors to be re-split; 800 mm hinged doors are wide | Medium | Re-split two per bay (~766 mm) aligned to bays per sketch; 4 hinges + stay noted for fabricator |
| F7 | Fully metallic mirror rendered black | High | Fixed: pale blue-grey low-metalness glass with clearcoat |
| F8 | Bed-to-leaf clear lane 486–521 mm | High | Not changed (retained bed-shift decision); added to RFI-015 |
| F9 | 1.59 m drawers/trays; solid lower box | High | Fixed: split at the shelf-column gable; open basket |
| F10 | Rail at ~2,170 mm | Medium | Not adopted: a 1,800 mm rail would clash with the drawer below |
| F11 | Unequal hanging/shelf modules | Medium | Fixed: common 520 mm shelf column in both bays |
| F12 | 13 mm leaf overlap; high handles | Medium | Fixed: 35 mm overlap, handles ~1,050 mm centre; anti-jump stops under RFI-015 |
| F13 | Ceiling drop/top junction at 2,920 mm unverified | Medium | Unchanged; RFI-014 |
| F14 | Switchboard thin/low; no sockets | Low | Slightly deeper; contents/routing remain site checks |
| F15 | 77 mm dead slot at north wall | Low | Fixed: absorbed by the widened niche |
| F16 | Two shallow loft tiers | Low | Unchanged |

Post-correction measured checks are in `output/jaipur-home/model/bedroom-2-wardrobe-checks.json`.
