# Controlled Record Schemas

Routine authorised model changes use Git commits, the current README/changelog and the compact project state. Use the records below when a separate decision, technical package, QA record or specialist launch calls for one; do not create a new `R-XXX` record for every model edit.

## Revision record

When a distinct revision packet is needed, use `studio-control/templates/revision-record.json` without removing fields. Record source authority, affected zones, proposal, risks, validation and relevant specialist routing. Approval fields record actual decisions; a historical template does not impose routine scope or promotion gates on Git-tracked changes. Protected decisions still require explicit user authorisation before alteration.

## QA record

For a substantive technical package or requested independent QA, use `studio-control/templates/qa-record.json`. The QA specialist must not be the authoring specialist for a critical deliverable. Record evidence rather than an unsupported pass assertion. A failed or unresolved execution check becomes an RFI or hold.

## RFI

An RFI must identify zone, unknown, why it matters, named owner and the execution decision that is blocked. It is not a substitute for a site measurement, vendor cut sheet or licensed professional's design.

## Final user audit

Use `studio-control/templates/final-audit.md`. State work mode, sources, actual specialists, changed files, Git commit and open decisions or site checks. Distinguish a model recommendation from a site/vendor-confirmed fact or professional sign-off.

## Model consent and run records

Use `studio-control/templates/model-consent.json` for each premium launch. It is valid only for the exact agent ID, model, reasoning effort and task fingerprint; record the consent in `model-consents.json` and mark it consumed when the launch starts.

Use `studio-control/templates/agent-run-record.json` for every planned or activated specialist. Save it in `studio-control/agent-runs/`. A run record must state whether a planned agent was blocked, launched, completed, failed or cancelled.
