#!/usr/bin/env python3
"""Deterministically resolve a Jaipur Home specialist launch without model inheritance."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def now() -> datetime:
    return datetime.now(timezone.utc)


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def iso(value: datetime) -> str:
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def fingerprint(request: dict[str, Any]) -> str:
    stable = {
        key: request.get(key)
        for key in ("revision_id", "agent_id", "role", "task_class", "risk_level", "task", "artifact_scope", "write_scope", "output_contract")
    }
    return hashlib.sha256(json.dumps(stable, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def matches(rule: dict[str, Any], request: dict[str, Any]) -> bool:
    criteria = rule["match"]
    return (
        request["role"] in criteria["roles"]
        and request["task_class"] in criteria["task_classes"]
        and request["risk_level"] in criteria["risk_levels"]
    )


def consent_for(consents: dict[str, Any], request: dict[str, Any], selection: dict[str, Any]) -> dict[str, Any] | None:
    target_fingerprint = fingerprint(request)
    for record in consents.get("records", []):
        if (
            record.get("agent_id") == request["agent_id"]
            and record.get("model") == selection["model"]
            and record.get("reasoning_effort") == selection["reasoning_effort"]
            and record.get("task_fingerprint") == target_fingerprint
            and record.get("status") == "approved"
            and not record.get("consumed_at")
            and (parse_time(record.get("expires_at")) is None or parse_time(record["expires_at"]) > now())
        ):
            return record
    return None


def resolve(policy: dict[str, Any], consents: dict[str, Any], request: dict[str, Any], available_models: set[str]) -> dict[str, Any]:
    required = ("revision_id", "agent_id", "role", "task_class", "risk_level", "task", "artifact_scope", "write_scope", "output_contract")
    missing = [field for field in required if not request.get(field)]
    if missing:
        return {"status": "blocked", "reason": "missing-launch-contract-fields", "missing_fields": missing}
    if request.get("model") or request.get("reasoning_effort"):
        return {"status": "blocked", "reason": "caller-model-override-forbidden", "detail": "The router, not a caller or parent chat, selects the specialist model and reasoning effort."}
    if not request["write_scope"].startswith(f"studio-control/drafts/{request['revision_id']}"):
        return {"status": "blocked", "reason": "write-scope-outside-approved-draft"}

    rule = next((candidate for candidate in policy["routing_rules"] if matches(candidate, request)), None)
    if rule is None:
        return {"status": "blocked", "reason": policy["unmatched_request"], "detail": "No explicit routing rule matches this role/task/risk combination."}
    selection = copy.deepcopy(rule["selection"])
    # A rule names one model, or an explicit ordered "models" list written into the policy.
    # The first available listed model is used; nothing outside the list is ever substituted.
    candidates = selection.pop("models", None) or [selection["model"]]
    model = next((candidate for candidate in candidates if candidate in available_models), None)
    if model is None:
        return {"status": "blocked", "reason": "selected-model-unavailable", "selected_model": candidates[0] if len(candidates) == 1 else candidates, "available_models": sorted(available_models), "detail": "No silent fallback is allowed."}
    selection["model"] = model
    requested_effort = request.get("requested_reasoning_effort")
    if requested_effort:
        if requested_effort not in policy["model_catalog"][model]["allowed_reasoning_efforts"]:
            return {"status": "blocked", "reason": "reasoning-effort-not-allowed"}
        selection["reasoning_effort"] = requested_effort

    tier = policy["model_catalog"][model]["tier"]
    premium = tier in policy["premium_consent"]["required_for_tiers"] or selection["reasoning_effort"] in policy["premium_consent"]["required_for_reasoning_efforts"]
    result = {
        "status": "launch-allowed" if not premium else "premium-consent-required",
        "routing_rule": rule["id"],
        "agent_id": request["agent_id"],
        "role": request["role"],
        "model": model,
        "reasoning_effort": selection["reasoning_effort"],
        "model_tier": tier,
        "selection_rationale": selection["rationale"],
        "task_fingerprint": fingerprint(request),
        "runtime_available_models": sorted(available_models),
        "premium": premium
    }
    if premium:
        consent = consent_for(consents, request, selection)
        if consent:
            result.update({"status": "launch-allowed", "consent_id": consent["consent_id"], "consent_status": "approved"})
        else:
            result["consent_packet"] = {
                "agent_id": request["agent_id"],
                "role": request["role"],
                "model": model,
                "reasoning_effort": selection["reasoning_effort"],
                "task": request["task"],
                "artifact_scope": request["artifact_scope"],
                "why_standard_tier_is_insufficient": selection["rationale"],
                "expected_deliverable": request["output_contract"],
                "draft_only_and_no_external_action": True,
                "scope": "This exact specialist launch only; retries, model/effort changes and other agents require new consent."
            }
    else:
        result["consent_status"] = "not-required"
    return result


def consume(consents_path: Path, result: dict[str, Any]) -> None:
    if not result.get("consent_id"):
        return
    consents = load_json(consents_path)
    for record in consents.get("records", []):
        if record.get("consent_id") == result["consent_id"]:
            if record.get("status") != "approved" or record.get("consumed_at"):
                raise ValueError("consent is not available for single-use consumption")
            record["status"] = "consumed"
            record["consumed_at"] = iso(now())
            write_json(consents_path, consents)
            return
    raise ValueError("consent record was not found")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Project root containing studio-control")
    parser.add_argument("--request", required=True, help="Specialist launch request JSON")
    parser.add_argument("--available-model", action="append", default=[], help="One currently available model; repeat for each model")
    parser.add_argument("--consume-consent", action="store_true", help="Consume approved single-use consent after a launch is accepted")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    control = root / "studio-control"
    policy = load_json(control / "model-policy.json")
    consents_path = control / "model-consents.json"
    consents = load_json(consents_path)
    request = load_json(Path(args.request))
    result = resolve(policy, consents, request, set(args.available_model))
    if args.consume_consent and result.get("status") == "launch-allowed" and result.get("premium"):
        try:
            consume(consents_path, result)
            result["consent_status"] = "consumed"
        except ValueError as exc:
            result = {"status": "blocked", "reason": "consent-consumption-failed", "detail": str(exc)}
    print(json.dumps(result, indent=2))
    return 0 if result.get("status") == "launch-allowed" else 2


if __name__ == "__main__":
    sys.exit(main())
