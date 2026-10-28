#!/usr/bin/env python3
"""Behaviour checks for the deterministic specialist model router."""

from __future__ import annotations

import importlib.util
import json
import shutil
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
ROUTER_PATH = ROOT / "studio-control" / "scripts" / "model_router.py"
spec = importlib.util.spec_from_file_location("model_router", ROUTER_PATH)
assert spec and spec.loader
router = importlib.util.module_from_spec(spec)
spec.loader.exec_module(router)


class ModelRouterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        shutil.copytree(ROOT / "studio-control", self.root / "studio-control")
        self.policy = router.load_json(self.root / "studio-control" / "model-policy.json")
        self.consents_path = self.root / "studio-control" / "model-consents.json"

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    @staticmethod
    def request(role: str, task_class: str, risk_level: str, agent_id: str) -> dict:
        revision = "R-001"
        return {
            "revision_id": revision,
            "agent_id": agent_id,
            "role": role,
            "task_class": task_class,
            "risk_level": risk_level,
            "task": "Controlled test task.",
            "requested_tools": [],
            "artifact_scope": ["docs/LATEST_COMPLETE_HOUSE_DESIGN.json"],
            "write_scope": f"studio-control/drafts/{revision}",
            "output_contract": "Structured draft findings only.",
            "requested_reasoning_effort": None
        }

    def test_standard_launch_has_explicit_model(self) -> None:
        request = self.request("project-state-steward", "state-management", "low", "R-001-state-01")
        result = router.resolve(self.policy, {"records": []}, request, {"gpt-6-luna", "gpt-6-sol"})
        self.assertEqual(result["status"], "launch-allowed")
        self.assertEqual(result["model"], "gpt-6-luna")
        self.assertEqual(result["reasoning_effort"], "medium")
        self.assertEqual(result["consent_status"], "not-required")

    def test_premium_launch_requires_exact_consent(self) -> None:
        request = self.request("kitchen-bath-utility-specialist", "kitchen-bath-utility", "medium", "R-001-kitchen-01")
        result = router.resolve(self.policy, {"records": []}, request, {"gpt-6.1-sol"})
        self.assertEqual(result["status"], "premium-consent-required")
        self.assertEqual(result["model"], "gpt-6.1-sol")
        self.assertIn("consent_packet", result)

    def test_premium_consent_is_single_use(self) -> None:
        request = self.request("kitchen-bath-utility-specialist", "kitchen-bath-utility", "medium", "R-001-kitchen-01")
        first = router.resolve(self.policy, {"records": []}, request, {"gpt-6.1-sol"})
        consent = {
            "consent_id": "MC-001-01",
            "status": "approved",
            "agent_id": request["agent_id"],
            "model": first["model"],
            "reasoning_effort": first["reasoning_effort"],
            "task_fingerprint": first["task_fingerprint"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat(),
            "consumed_at": None
        }
        router.write_json(self.consents_path, {"schema_version": "1.0", "records": [consent]})
        result = router.resolve(self.policy, router.load_json(self.consents_path), request, {"gpt-6.1-sol"})
        self.assertEqual(result["status"], "launch-allowed")
        router.consume(self.consents_path, result)
        consumed = router.load_json(self.consents_path)["records"][0]
        self.assertEqual(consumed["status"], "consumed")
        replay = router.resolve(self.policy, router.load_json(self.consents_path), request, {"gpt-6.1-sol"})
        self.assertEqual(replay["status"], "premium-consent-required")

    def test_unavailable_model_never_falls_back(self) -> None:
        request = self.request("kitchen-bath-utility-specialist", "kitchen-bath-utility", "medium", "R-001-kitchen-01")
        result = router.resolve(self.policy, {"records": []}, request, {"gpt-6-sol"})
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["reason"], "selected-model-unavailable")

    def test_parent_or_caller_model_override_is_blocked(self) -> None:
        request = self.request("project-state-steward", "state-management", "low", "R-001-state-01")
        request["model"] = "gpt-6-astra"
        result = router.resolve(self.policy, {"records": []}, request, {"gpt-6-luna", "gpt-6-astra"})
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["reason"], "caller-model-override-forbidden")


    def test_ordered_model_list_prefers_first_available(self) -> None:
        request = self.request("site-qa-coordinator", "routine-site-qa", "medium", "R-001-qa-01")
        both = router.resolve(self.policy, {"records": []}, request, {"gpt-6-sol", "claude-sonnet-5-5"})
        self.assertEqual(both["model"], "gpt-6-sol")
        claude = router.resolve(self.policy, {"records": []}, request, {"claude-sonnet-5-5", "claude-opus-5-5"})
        self.assertEqual(claude["status"], "launch-allowed")
        self.assertEqual(claude["model"], "claude-sonnet-5-5")
        self.assertEqual(claude["model_tier"], "standard")
        self.assertEqual(claude["consent_status"], "not-required")

    def test_ordered_model_list_never_substitutes_unlisted_model(self) -> None:
        request = self.request("site-qa-coordinator", "routine-site-qa", "medium", "R-001-qa-01")
        result = router.resolve(self.policy, {"records": []}, request, {"claude-opus-5-5", "gpt-6.1-sol"})
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["reason"], "selected-model-unavailable")


if __name__ == "__main__":
    unittest.main()
