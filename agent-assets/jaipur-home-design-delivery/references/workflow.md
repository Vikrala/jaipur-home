# Workflow Rules

## Request modes

| Request | Default action | Approval state |
| --- | --- | --- |
| Advice, review, clarification | Assess and report; create no artifact change | No approval required |
| Design, visual or technical revision | Prepare revision record and decision packet | Scope approval before draft |
| Contractor package, RFI, snag package | Create draft deliverable only | No sending; promotion only if it becomes baseline documentation |
| Source conflict or missing evidence | Produce decision options or RFI | Pause for user decision |
| Structural, statutory or engineering request | State boundary and required professional | No design certification |

## Mandatory revision sequence

1. Allocate the next `R-XXX` ID; do not reuse an existing ID.
2. Populate source authority, impact, specialist roles, risks and validation in the revision record.
3. Present the decision packet and wait for explicit scope approval.
4. Create drafts only under `studio-control/drafts/R-XXX/`.
5. Obtain independent QA using the QA template. The author cannot be the sole QA reviewer.
6. Show a concise diff/review set and unresolved RFIs.
7. Wait for explicit promotion approval.
8. Promote only listed artifacts; then refresh current handoff/state/changelog/manifest records.

## Transparency policy

Always give an operational audit. Count agents that actually performed work; do not count available roles, failed attempts or tools as specialists. State `0` where the Design Director handled the request alone. For every actual specialist, report its agent ID, role, model, reasoning effort, tier, consent status and concrete contribution. Also list planned agents that were not launched and why. Do not reveal chain-of-thought; give sources, checks, conclusions and decisions.

## Specialist ceilings

- Advice: 0.
- Single room: 1–2.
- Wet area, kitchen, puja, utility or terrace: 2–3.
- Technical/contractor package or visual revision: 2–4.
- Multi-room work: no more than 5 in parallel.

The Director may reduce this count whenever it can safely do the work without specialists.

## Model routing

Read [model routing](model-routing.md) before every specialist activation. Use `studio-control/scripts/model_router.py`; do not manually choose a child model or allow it to inherit the chat's model. A launch that is not `launch-allowed` is blocked.
