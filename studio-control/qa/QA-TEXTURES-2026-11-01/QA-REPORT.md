# 1 November 2026 texture QA — main model

**Result: PASS after correction.** Independent reviewer: `site-qa-coordinator`, `gpt-6-sol` at medium reasoning (standard tier; no premium consent required). The reviewer made no file edits.

## Findings and fixes

- **TV backing and puja back liner:** Both use `Warm ivory TV stone`. The grout-free `stone` recipe divided by zero when `tiles=0`, so its baked albedo, normal and roughness maps were black. The corrected recipe uses one full-size texture cell. Rebaked stone albedo averages about RGB 214/203/188 and reads as pale veined stone in day and evening.
- **Puja drawers:** The blue bands were exposed wall-coloured recesses between two separate walnut fronts and below the diya tray. Two recessed walnut carcass rails now close them, leaving narrow working reveals. The two drawers and independent tray remain.
- **TV cast shadow:** The screen sat about 369 mm in front of the backing, causing a broad grey rectangle under evening light. Its mount depth moved 305 mm toward the backing; a narrow edge shadow remains. TV size, centre height, panel and W5 relationship remain.

## Verification

- Current walkthrough loaded with no page errors. Day and evening captures with ambient occlusion on and off show the warm ivory TV stone. Focused puja captures show walnut rails and no blue void.
- All 11 baked texture families (33 JPEG albedo/normal/roughness maps) decoded with plausible light/dark values; no all-black family remains. The independent reviewer also inspected representative living, kitchen, bedroom, bath, lobby and terrace surfaces.
- Rebuilt GLB parsed with 74 materials, 63 embedded images and 65 texture records. Stone map assignments, both puja rails and revised TV position are present. The floor tile render/export check passed.

## Site checks

RFI-001 (puja door, tray, vent, hot-zone and joinery clearances) and RFI-002 (TV wall measure, bracket/fixing, ventilation and conduit routes) remain open. These renders do not certify fabrication details or lighting levels.

Evidence: `probe-results.json`, `probe-tv-day-ao.png`, `probe-tv-evening-ao.png`, `probe-pooja-day.png`, `probe-pooja-evening.png`, `output/jaipur-home/model/floor-tile-render-check.json`.
