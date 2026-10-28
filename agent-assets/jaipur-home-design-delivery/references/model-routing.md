# Model Routing

## Required launch path

1. Create a launch request from `studio-control/templates/specialist-launch-request.json`.
2. Obtain the actual runtime model list from the specialist-launch environment.
3. Run `studio-control/scripts/model_router.py` with one `--available-model` value for each actual model.
4. If output is `premium-consent-required`, show its `consent_packet` and wait for explicit user approval. Record an approved copy of the consent template in `studio-control/model-consents.json` with a 30-minute expiry.
5. Re-run the router. Only `launch-allowed` can start a specialist.
6. At actual launch, re-run with `--consume-consent` for a premium agent. Record the outcome in `studio-control/agent-runs/`.

The router does not spawn an agent itself. The Design Director must pass its exact `model` and `reasoning_effort` in the specialist-launch API/tool call. If a specialist API cannot accept both explicit values, do not activate that specialist.

## Policy

- `gpt-6-luna` / medium: project state, manifests, RFI formatting and routine document checks.
- `gpt-6-sol`, else `claude-sonnet-5-5` / medium: standard interior, layout, technical-package and routine site-QA work. The rule lists the two in this order; the first available one is used, and the launch is blocked if neither is (user-approved 27 Oct 2026). In Claude Code, pass `model: "sonnet"` and the routed effort to the Agent tool.
- `gpt-6.1-sol` / medium: complex layout, kitchen/bath/utility, visual QA and services coordination; premium consent required.
- `gpt-6-astra` / medium: high-risk cross-discipline conflicts, complex visual/model investigation and multi-room review; premium consent required.

Any high, xhigh, max or ultra reasoning effort is premium even on another model. These are workflow tiers, not claimed price estimates.

## Invocation

In a Jaipur Home project chat, the root `AGENTS.md` and implicit skill policy activate this workflow for matching design-delivery work. Use `$jaipur-home-design-delivery` in the first prompt to force reliable activation when a request is ambiguous. A chat outside this project does not receive its project artifacts automatically.
