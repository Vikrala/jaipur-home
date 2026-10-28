# Jaipur Home Design Studio Control Layer

This folder makes the current house-design package safe to continue across Codex chats without repeatedly loading every artifact.

## Read order

1. `project-state.json` for the compact boot pack and active status.
2. `artifact-manifest.json` to identify source authority and detect changed files.
3. `decision-log.json` and `rfis.json` for known decisions and open dependencies.
4. Only then retrieve the relevant drawing, model, render, or historical chat for the request.

The single maintained working model is `output/jaipur-home/`. `studio-control/` supplies source context and historical records; Git tracks new changes.

## Change protocol from 28 October 2026

- Work on the one maintained model in `output/jaipur-home/`; use `model/interior.js` as the editable scene and rebuild the walkthrough and GLB when affected.
- Commit each coherent change to Git with a clear message. A branch can isolate exploration without creating another 3D model folder. Git history supplies the reversible revision trail.
- Update the current README/changelog, relevant handoff/state references and checks in the same commit. Do not create a new `R-XXX` draft folder for routine changes.
- The user may request a separate review artifact when a decision needs one. Historical `revisions/`, `drafts/` and `qa/` records remain for provenance, but the draft/promotion sequence in their templates is no longer the default workflow.
- Preserve the architect's built geometry and protected room decisions unless the user explicitly changes them and the appropriate professional checks are identified. Mark unresolved measurements and services as holds; a Git commit does not certify execution.

## Safety boundary

This layer is for interior-design coordination. It cannot certify structure, approvals, electrical loads, fire/life safety, waterproofing systems, lift work, HVAC engineering, drainage capacity, or MEP design. Those requirements become RFIs or professional/vendor sign-off dependencies.
