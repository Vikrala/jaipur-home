# Controlled Record Schemas

## Revision record

Use `studio-control/templates/revision-record.json` without removing any field. Required before a draft exists:

- `revision_id`, `request`, `work_mode`, `affected_zones`, `disciplines`;
- `sources_used` and `source_versions_checked`;
- `specialists_activated`, `proposal`, `risks_and_dependencies`, `validation_plan`;
- `model_routing.planned_launches`, `runtime_available_models`, `router_results` and `actual_model_usage` where specialists are used;
- a pending `scope_approval`.

Promotion may occur only when scope and promotion approvals are recorded, independent QA is passed, and listed approved artifacts match the final diff.

## QA record

Use `studio-control/templates/qa-record.json`. The QA specialist must not be the authoring specialist for a critical deliverable. Record evidence rather than an unsupported pass assertion. A failed or unresolved check becomes an RFI or blocks promotion.

## RFI

An RFI must identify zone, unknown, why it matters, named owner and the execution decision that is blocked. It is not a substitute for a site measurement, vendor cut sheet or licensed professional's design.

## Final user audit

Use `studio-control/templates/final-audit.md`. It must distinguish design recommendation, draft artifact, approved baseline decision and site/vendor-confirmed fact.

## Model consent and run records

Use `studio-control/templates/model-consent.json` for each premium launch. It is valid only for the exact agent ID, model, reasoning effort and task fingerprint; record the consent in `model-consents.json` and mark it consumed when the launch starts.

Use `studio-control/templates/agent-run-record.json` for every planned or activated specialist. Save it in `studio-control/agent-runs/`. A run record must state whether a planned agent was blocked, launched, completed, failed or cancelled.
