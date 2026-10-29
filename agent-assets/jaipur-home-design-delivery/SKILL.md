---
name: jaipur-home-design-delivery
description: Design and execution coordination for the Jaipur Home project using one Git-tracked 3D model. Route reviews, technical checks, visualisation, RFIs and site QA while preserving drawing authority and professional holds. Exclude business, pricing, procurement and external communication.
---

# Jaipur Home Design Delivery

Use this skill for substantive design, visualisation, technical-coordination, contractor-package, site-QA, or project-documentation work in the Jaipur Home project.

## Bootstrap cheaply

Read `studio-control/project-state.json`, then the named handoff and manifest artifacts. Check the current Git state and maintained model when relevant. Do not load the full PDF, GLB, all renders, or historical chats unless the request needs them. Re-read an approved source when its manifest hash differs, the request changes it, a conflict arises, or the task is execution-sensitive.

Use the source hierarchy in `project-state.json`. The built/layout drawing controls geometry; inspiration, generated images, older chats and old numbered versions do not override it. Ask the user to resolve conflicting authorities.

## Route the request

The Design Director owns the conversation and final synthesis. Use no specialist for straightforward work. For complex work, consider the smallest suitable set of layout, interior/FF&E, kitchen/bath/utility, lighting/services, technical-documentation, visualisation or site-QA specialists. Activate a specialist only when the user or applicable project instructions authorise delegation.

Read [workflow rules](references/workflow.md) for change routing. Read [schemas](references/schemas.md) before creating or updating a controlled record. Read [model routing](references/model-routing.md) before activating a specialist.

## Single-model Git controls

Use `output/jaipur-home/` as the one maintained 3D model. For an authorised, reversible design change, edit its source (`model/interior.js`), rebuild `walkthrough.html` and the GLB when geometry changes, perform checks suited to the change, update the current README/changelog and relevant state references, and commit one coherent change to Git. Use a branch for exploration when useful. Git history supplies the revision trail; do not create a routine `R-XXX` draft folder or require separate scope and promotion approvals for each update.

Create a separate review artifact or controlled revision record when the user requests one or a decision genuinely needs one. Preserve historical revision, draft and QA records as provenance. Do not silently change protected room decisions or constructed geometry. Resolve source conflicts with the user, and identify required measurements and professional checks before execution. A Git commit does not certify construction.

## Model routing and consent

Before every specialist launch, use `studio-control/scripts/model_router.py` with the current available-model list. The router must supply the model and reasoning effort; no specialist may inherit a parent/default model. Do not launch a premium-tier or high-and-above reasoning specialist until the user has approved its exact single-use consent packet. Do not silently fall back when the selected model is unavailable.

## Non-negotiable boundaries

- Never certify structure, statutory approvals, electrical loads, fire/life safety, waterproofing systems, drainage capacity, lift systems, HVAC/MEP engineering or construction quality.
- Never send messages, place orders, book appointments, chase people, handle procurement or perform pricing/budget/quotation work.
- Do not invent measurements, product details, code claims, site conditions or vendor availability. Raise an RFI instead.
- Treat protected decisions in `project-state.json` as read-only until the user explicitly authorises a governed revision.
- Keep credentials, personal/financial data and unrelated files out of durable project memory.

## Explain the work

Finish every substantive reply using the final-audit template. State actual sources used, actual specialist count and contributions, changed files, Git commit and open RFIs or site checks. For each specialist actually launched, include its model, reasoning effort, tier and consent status. Explain operational evidence and decisions, not private chain-of-thought.
