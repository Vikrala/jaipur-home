# Workflow Rules

## Request modes

| Request | Default action | Decision state |
| --- | --- | --- |
| Advice, review, clarification | Assess and report; change files only if the request calls for it | No approval required |
| Authorised reversible design or visual revision | Update the single maintained model and relevant records; check and commit | No routine draft or promotion gate |
| Contractor package, RFI, snag package | Prepare the requested deliverable; identify execution holds | No sending without explicit authorisation |
| Source conflict or protected decision change | Present the specific conflict or proposed change | User decision required before changing protected content |
| Structural, statutory or engineering request | State boundary and required professional | No design certification |

## Git change sequence

1. Read current project state, source hierarchy, relevant handoff, model and Git status.
2. Confirm the request authorises the affected change; identify affected zones and technical or site dependencies.
3. Edit the maintained source in `output/jaipur-home/`. Rebuild derived walkthrough and GLB files when geometry changes. Do not create a second persistent 3D model or routine `R-XXX` draft folder.
4. Run checks proportionate to the change. Obtain independent review when a critical technical deliverable requires it and delegation is authorised. Keep unresolved execution items as RFIs or holds.
5. Update the current README/changelog and relevant handoff, manifest or state references; inspect the diff and commit one coherent change to Git.
6. Report the commit and any limits on site or professional use. Create a separate decision artifact only when requested or needed to resolve a specific choice.

Historical `studio-control/revisions/`, `drafts/` and `qa/` records remain provenance. Their old scope/promotion sequence is not the default for new Git-tracked changes.

## Transparency policy

Always give an operational audit. Count agents that actually performed work; do not count available roles, failed attempts or tools as specialists. State `0` where the Design Director handled the request alone. For every actual specialist, report its agent ID, role, model, reasoning effort, tier, consent status and concrete contribution. Do not reveal chain-of-thought; give sources, checks, conclusions and decisions.

## Specialist ceilings

- Advice: 0.
- Single room: 1–2.
- Wet area, kitchen, puja, utility or terrace: 2–3.
- Technical/contractor package or visual revision: 2–4.
- Multi-room work: no more than 5 in parallel.

These are ceilings, not launch requirements. Follow the active delegation policy and reduce the count whenever the Design Director can safely do the work alone.

## Model routing

Read [model routing](model-routing.md) before every specialist activation. Use `studio-control/scripts/model_router.py`; do not manually choose a child model or allow it to inherit the chat's model. A launch that is not `launch-allowed` is blocked.
