import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAiEngineUrl,
  getAiEngineKey,
  checkAiEngineHealth,
  requestAiEngine,
} from "../lib/ai-engine-client";

describe("ai-engine-client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("Environment configuration", () => {
    it("should return default URL when AI_ENGINE_URL is not set", () => {
      delete process.env.AI_ENGINE_URL;
      expect(getAiEngineUrl()).toBe("http://127.0.0.1:8000");
    });

    it("should strip trailing slashes from AI_ENGINE_URL", () => {
      process.env.AI_ENGINE_URL = "http://localhost:8000///";
      expect(getAiEngineUrl()).toBe("http://localhost:8000");
    });

    it("should return default key when AI_ENGINE_INTERNAL_KEY is not set", () => {
      delete process.env.AI_ENGINE_INTERNAL_KEY;
      expect(getAiEngineKey()).toBe("prism_internal_secret_change_me");
    });

    it("should return custom key when set", () => {
      process.env.AI_ENGINE_INTERNAL_KEY = "custom_secret_key";
      expect(getAiEngineKey()).toBe("custom_secret_key");
    });
  });

  describe("checkAiEngineHealth", () => {
    it("should return isOnline true and latency when server responds 200 OK", async () => {
      const mockPayload = {
        status: "ok",
        app_name: "PRISM AI Engine",
        version: "0.1.0",
        environment: "development",
        uptime_seconds: 120.5,
        timestamp: "2026-09-16T12:00:00Z",
      };

      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockPayload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const health = await checkAiEngineHealth();
      expect(health.isOnline).toBe(true);
      expect(health.status).toBe("ok");
      expect(health.version).toBe("0.1.0");
      expect(health.uptimeSeconds).toBe(120.5);
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("should handle server offline / connection refused gracefully", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("ECONNREFUSED"));

      const health = await checkAiEngineHealth();
      expect(health.isOnline).toBe(false);
      expect(health.error).toContain("ECONNREFUSED");
    });

    it("should handle non-200 HTTP response gracefully", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      const health = await checkAiEngineHealth();
      expect(health.isOnline).toBe(false);
      expect(health.error).toContain("500");
    });
  });

  describe("requestAiEngine", () => {
    it("should attach X-Internal-Secret header and parse JSON response", async () => {
      process.env.AI_ENGINE_INTERNAL_KEY = "test_key_123";

      const mockResponseData = { result: "success", count: 42 };
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponseData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const data = await requestAiEngine<{ result: string; count: number }>("/api/v1/test", {
        method: "POST",
        body: JSON.stringify({ query: "hello" }),
      });

      expect(data).toEqual(mockResponseData);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const [calledUrl, calledInit] = fetchSpy.mock.calls[0];
      expect(calledUrl).toBe("http://127.0.0.1:8000/api/v1/test");
      expect((calledInit?.headers as Record<string, string>)["X-Internal-Secret"]).toBe(
        "test_key_123"
      );
    });

    it("should throw formatted error when AI Engine returns error response", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "Invalid parameters provided" }), {
          status: 422,
          statusText: "Unprocessable Entity",
          headers: { "Content-Type": "application/json" },
        })
      );

      await expect(requestAiEngine("/api/v1/invalid")).rejects.toThrow(
        "AI Engine Error [422]: Invalid parameters provided"
      );
    });
  });
});
