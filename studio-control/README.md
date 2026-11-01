# Jaipur Home Design Studio Control Layer

This folder makes the current house-design package safe to continue across Codex chats without repeatedly loading every artifact.

## Read order

1. `project-state.json` for the compact boot pack and active status.
2. `artifact-manifest.json` to identify source authority and detect changed files.
3. `decision-log.json` and `rfis.json` for known decisions and open dependencies.
4. Only then retrieve the relevant drawing, model, render, or historical chat for the request.

The single maintained working model is `output/jaipur-home/`. `studio-control/` supplies source context and historical records; Git tracks new changes.

## Change protocol from 28 October 2026

- For a user-authorised, reversible change, edit the maintained model in `output/jaipur-home/` directly.
- Rebuild affected derived files, run checks suited to the change, and update the current README, changelog, handoff and state references.
- Inspect the complete Git diff and commit one coherent final change. Preserve unrelated working-tree edits.
- Use a separate review artifact or revision record only when requested or needed to resolve a source conflict. Historical `drafts/`, `revisions/` and `qa/` records remain provenance.
- Stop for a user decision when source authorities conflict or a protected decision or constructed geometry would change. Identify any professional site check before execution.
- A branch can isolate exploration without creating another 3D model folder. Mark unresolved measurements and services as holds; a Git commit does not certify execution.

## Safety boundary

This layer is for interior-design coordination. It cannot certify structure, approvals, electrical loads, fire/life safety, waterproofing systems, lift work, HVAC engineering, drainage capacity, or MEP design. Those requirements become RFIs or professional/vendor sign-off dependencies.
