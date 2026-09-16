"""Smoke tests for FastAPI AI Engine endpoints."""

import asyncio
import os
import sys

# Ensure ai-engine root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import ASGITransport, AsyncClient
from app.main import app



async def run_tests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Health Check Endpoint
        response = await client.get("/api/v1/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["status"] == "ok"
        assert data["app_name"] == "PRISM AI Engine"
        assert "uptime_seconds" in data
        assert "timestamp" in data
        print("PASS: /api/v1/health check passed!")

        # 2. Test Root Redirect to /docs
        response_root = await client.get("/", follow_redirects=False)
        assert response_root.status_code in (302, 307), f"Expected redirect, got {response_root.status_code}"
        assert response_root.headers.get("location") == "/docs"
        print("PASS: / root redirect to /docs passed!")

        # 3. Test OpenAPI Schema
        response_openapi = await client.get("/api/v1/openapi.json")
        assert response_openapi.status_code == 200
        openapi_data = response_openapi.json()
        assert openapi_data["info"]["title"] == "PRISM AI Engine"
        print("PASS: /api/v1/openapi.json schema generation passed!")

    print("\nALL SMOKE TESTS PASSED SUCCESSFULLY! [OK]")


if __name__ == "__main__":
    asyncio.run(run_tests())
