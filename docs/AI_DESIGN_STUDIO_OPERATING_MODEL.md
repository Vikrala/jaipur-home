# Jaipur Home AI Design Studio — Operating Model

This project uses a Codex-native, governed interior-design delivery workflow. It supports design and execution coordination; it does not operate the business, send messages, make purchases, or provide certified engineering/approval decisions.

## Start of a new chat

Read [`../studio-control/project-state.json`](../studio-control/project-state.json) first. It points to the compact boot pack: project persona, current handoff, structured design state, artifact manifest, decisions and open RFIs. Load only the artifact needed for the request. Do not reload the complete PDF, model, render collection or historical chats unless the request, a changed hash, conflict, safety issue, QA or promotion requires it.

## Roles

The Design Director owns user interaction, source hierarchy, approvals and promotion. Specialists may be activated only where useful: layout, interiors/FF&E, kitchen-bath-utility, lighting/services, technical documentation, visualisation, site QA, and state stewardship. Specialists make draft findings/artifacts only; the Director promotes no artifact without the required user approvals and independent QA.

Every specialist launch is routed through `studio-control/scripts/model_router.py`. The router selects a model and reasoning effort from `model-policy.json`; specialists never inherit the chat model. Premium-tier models and high-or-higher reasoning each require a separate, single-use user consent recorded in `model-consents.json`. A selected model missing from the runtime availability list blocks the launch rather than silently falling back.

## Revision lifecycle

1. Create `R-XXX` and use `studio-control/templates/revision-record.json`.
2. Present source authority, scope, affected zones, specialist team, risks, RFIs, artifacts and validation plan.
3. Obtain explicit scope approval before drafting.
4. Work only in `studio-control/drafts/R-XXX/`.
5. Run independent QA with the QA template.
6. Present draft/diff and remaining dependencies.
7. Obtain explicit promotion approval.
8. Update approved artifacts, handoff, changelog, state and manifest only after promotion.

## Mandatory final response audit

Every substantive response ends with work mode, sources used, actual specialist count, named contribution of each specialist, files changed and open RFIs/site checks. This is an operational audit, not disclosure of hidden reasoning.

The audit must additionally list every activated specialist's model, reasoning effort, tier, premium-consent ID/status, and contribution. It must also list planned specialists that were not launched and why.

## Guardrails

- The constructed OP-1 drawing controls geometry; generated images and older chats do not override it.
- Source conflicts pause for the user to decide.
- The agent never certifies structural, statutory, MEP, lift, electrical-load, drainage, fire/life-safety or waterproofing work.
- No pricing, procurement, payments, vendor selection, external messages, appointment booking or reminder chasing.
- No baseline overwrite, deletion or rollback without explicit approval.
- Missing site facts become RFIs, not invented design assumptions.

See the reusable global skill at `~/.codex/skills/jaipur-home-design-delivery` and the project-staged copy at [`../agent-assets/jaipur-home-design-delivery`](../agent-assets/jaipur-home-design-delivery/).
