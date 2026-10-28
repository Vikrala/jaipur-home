#!/usr/bin/env python3
"""Read-only consistency checks for the Jaipur Home design studio control layer."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) == 2 else Path.cwd().resolve()
    control = root / "studio-control"
    errors: list[str] = []
    state = load_json(control / "project-state.json")
    manifest = load_json(control / "artifact-manifest.json")
    decisions = load_json(control / "decision-log.json")
    rfis = load_json(control / "rfis.json")
    policy = load_json(control / "model-policy.json")
    consents = load_json(control / "model-consents.json")

    for field in ("project_id", "approved_baseline", "boot_pack", "source_hierarchy", "protected_decisions", "session_policy"):
        if not state.get(field):
            errors.append(f"project-state missing required field: {field}")

    for artifact in manifest.get("artifacts", []):
        for field in ("id", "path", "role", "authority_rank", "sha256"):
            if field not in artifact:
                errors.append(f"artifact missing {field}: {artifact}")
        target = root / artifact.get("path", "")
        if not target.is_file():
            errors.append(f"artifact path missing: {artifact.get('path')}")
            continue
        actual = sha256(target)
        if actual != artifact.get("sha256"):
            errors.append(f"artifact fingerprint changed: {artifact.get('id')} ({artifact.get('path')})")

    decision_ids = {entry.get("id") for entry in decisions.get("decisions", [])}
    if len(decision_ids) != len(decisions.get("decisions", [])):
        errors.append("decision IDs must be unique")

    rfi_ids = {entry.get("id") for entry in rfis.get("rfis", [])}
    if len(rfi_ids) != len(rfis.get("rfis", [])):
        errors.append("RFI IDs must be unique")
    missing_rfis = set(state.get("open_rfis", [])) - rfi_ids
    if missing_rfis:
        errors.append(f"project-state references missing RFIs: {sorted(missing_rfis)}")

    if not policy.get("no_implicit_model_inheritance") or policy.get("default_model") is not None:
        errors.append("model policy must disable implicit/default specialist model selection")
    catalog = policy.get("model_catalog", {})
    if not catalog:
        errors.append("model policy has no model catalog")
    for rule in policy.get("routing_rules", []):
        selection = rule.get("selection", {})
        model = selection.get("model")
        effort = selection.get("reasoning_effort")
        if model not in catalog:
            errors.append(f"routing rule selects unlisted model: {rule.get('id')}")
        elif effort not in catalog[model].get("allowed_reasoning_efforts", []):
            errors.append(f"routing rule uses disallowed reasoning effort: {rule.get('id')}")

    consent_ids = {record.get("consent_id") for record in consents.get("records", [])}
    if len(consent_ids) != len(consents.get("records", [])):
        errors.append("model consent IDs must be unique")
    for record in consents.get("records", []):
        required = ("consent_id", "status", "agent_id", "model", "reasoning_effort", "task_fingerprint")
        missing = [field for field in required if not record.get(field)]
        if missing:
            errors.append(f"model consent missing fields {missing}: {record.get('consent_id')}")
        if record.get("model") not in catalog:
            errors.append(f"model consent names unlisted model: {record.get('consent_id')}")

    if errors:
        print("Studio control validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "Studio control validation passed: "
        f"{len(manifest.get('artifacts', []))} governed artifacts, "
        f"{len(decisions.get('decisions', []))} recorded decisions, "
        f"{len(rfis.get('rfis', []))} RFIs, "
        f"{len(policy.get('routing_rules', []))} model-routing rules."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
