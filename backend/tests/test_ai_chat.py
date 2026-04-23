"""Backend API tests: root & AI chat proxy (Emergent LLM fallback)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://perception-monitor.preview.emergentagent.com").rstrip("/")


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Root health ----
def test_root_ok(api_client):
    r = api_client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert data.get("service") == "osint-dashboard-proxy"


# ---- AI chat fallback (Emergent LLM) ----
def test_ai_chat_fallback_returns_response(api_client):
    payload = {"message": "Say hi in 5 words.", "session_id": "test-session-1"}
    r = api_client.post(f"{BASE_URL}/api/ai/chat", json=payload, timeout=120)
    assert r.status_code == 200, f"body={r.text}"
    data = r.json()
    assert "response" in data
    assert isinstance(data["response"], str)
    assert len(data["response"]) > 0
    assert data.get("source") in ("external", "emergent-llm")


def test_ai_chat_without_token_uses_emergent(api_client):
    # No token -> should go straight to Emergent LLM fallback
    r = api_client.post(f"{BASE_URL}/api/ai/chat", json={"message": "Hello", "session_id": "t2"}, timeout=60)
    assert r.status_code == 200
    assert r.json().get("source") == "emergent-llm"


def test_ai_chat_validation_error_on_missing_message(api_client):
    r = api_client.post(f"{BASE_URL}/api/ai/chat", json={"session_id": "x"}, timeout=10)
    assert r.status_code == 422
