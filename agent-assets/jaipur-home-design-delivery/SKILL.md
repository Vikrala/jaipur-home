---
name: jaipur-home-design-delivery
description: Governed interior-design delivery for the Jaipur Home project: route reviews, drafts, technical coordination, visualisation, RFIs and site QA while preserving drawing authority, approval gates and draft-only specialist work. Use for this project's design or execution-coordination requests; exclude business, pricing, procurement and external communication.
---

# Jaipur Home Design Delivery

Use this skill for substantive design, visualisation, technical-coordination, contractor-package, site-QA, or project-documentation work in the Jaipur Home project.

## Bootstrap cheaply

Read `studio-control/project-state.json`, then the named handoff and manifest artifacts. Do not load the full PDF, GLB, all renders, or historical chats unless the request needs them. Re-read an approved artifact only when its manifest hash differs, the request changes it, a conflict arises, the task is execution-sensitive, or independent QA/promotion requires it.

Use the source hierarchy in `project-state.json`. The built/layout drawing controls geometry; inspiration, generated images, older chats and old numbered versions do not override it. Ask the user to resolve conflicting authorities.

## Route the request

The Design Director owns the conversation and final synthesis. Activate only the smallest appropriate specialist team:

- no specialist for straightforward advice;
- layout reviewer for circulation, room fit, openings, accessibility or zoning;
- interior/FF&E designer for concept, materials, furniture, storage and maintenance;
- kitchen/bath/utility specialist for wet areas, appliances, ventilation and cabinetry;
- lighting/services coordinator for electrical, plumbing, HVAC, ceiling and appliance interfaces;
- technical-documentation specialist for elevations, schedules, RFIs, checklists and joinery;
- visualisation specialist for model/render drafts;
- site-QA coordinator for snags, photo review and inspection packages.

Read [workflow rules](references/workflow.md) for revision and approval routing. Read [schemas](references/schemas.md) before creating or updating a controlled record.
Read [model routing](references/model-routing.md) before activating a specialist.

## Draft and promotion controls

For any artifact change, create a revision record from `studio-control/templates/revision-record.json` and use a matching `studio-control/drafts/R-XXX/` folder. Explain scope, sources, specialists, affected zones, risks, files, validation and dependencies; wait for explicit scope approval before drafting.

Specialists may write only draft artifacts. The Design Director may promote a draft only after independent QA and explicit promotion approval. Update the approved baseline, handoff, changelog, manifest/state and QA record only at promotion.

Never silently overwrite, delete, roll back or create a new approved baseline.

## Model routing and consent

Before every specialist launch, use `studio-control/scripts/model_router.py` with the current available-model list. The router must supply the model and reasoning effort; no specialist may inherit a parent/default model. Do not launch a premium-tier or high-and-above reasoning specialist until the user has approved its exact single-use consent packet. Do not silently fall back when the selected model is unavailable.

## Non-negotiable boundaries

- Never certify structure, statutory approvals, electrical loads, fire/life safety, waterproofing systems, drainage capacity, lift systems, HVAC/MEP engineering or construction quality.
- Never send messages, place orders, book appointments, chase people, handle procurement or perform pricing/budget/quotation work.
- Do not invent measurements, product details, code claims, site conditions or vendor availability. Raise an RFI instead.
- Treat protected decisions in `project-state.json` as read-only until the user explicitly authorises a governed revision.
- Keep credentials, personal/financial data and unrelated files out of durable project memory.

## Explain the work

Finish every substantive reply using the final-audit template. State actual sources used, actual specialist count, each specialist's concrete contribution, model, reasoning effort, tier, consent status, final synthesis, changed files and open RFIs. Explain operational evidence and decisions, not private chain-of-thought.
