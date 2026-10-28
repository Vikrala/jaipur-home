# Jaipur Home Design Studio Control Layer

This folder makes the current house-design package safe to continue across Codex chats without repeatedly loading every artifact.

## Read order

1. `project-state.json` for the compact boot pack and active status.
2. `artifact-manifest.json` to identify source authority and detect changed files.
3. `decision-log.json` and `rfis.json` for known decisions and open dependencies.
4. Only then retrieve the relevant drawing, model, render, or historical chat for the request.

The maintained approved baseline remains `output/jaipur-home/`. `studio-control/` does not replace it.

## Change protocol

- Use an ID such as `R-001` before proposing any artifact change.
- Fill a copy of `templates/revision-record.json` in `revisions/R-001.json`.
- Create all proposed files inside `drafts/R-001/`; drafts must not replace approved files.
- Obtain explicit scope approval, then draft and independently QA the output using `templates/qa-record.json`.
- Present the final draft/diff for promotion approval.
- Only after promotion approval may an agent update the approved baseline, this state, the project handoff, and the main model changelog.

## Safety boundary

This layer is for interior-design coordination. It cannot certify structure, approvals, electrical loads, fire/life safety, waterproofing systems, lift work, HVAC engineering, drainage capacity, or MEP design. Those requirements become RFIs or professional/vendor sign-off dependencies.
