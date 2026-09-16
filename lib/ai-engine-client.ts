/**
 * Client helper to communicate with the PRISM AI Engine (Python FastAPI sidecar).
 */

export interface AiEngineHealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  uptime_seconds: number;
  timestamp: string;
}

export interface AiEngineHealthStatus {
  isOnline: boolean;
  latencyMs: number;
  status?: string;
  version?: string;
  uptimeSeconds?: number;
  error?: string;
}

export interface AiEngineRequestOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Returns the configured base URL for the AI Engine.
 */
export function getAiEngineUrl(): string {
  const url = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";
  return url.replace(/\/+$/, "");
}

/**
 * Returns the secret key for internal service-to-service authorization.
 */
export function getAiEngineKey(): string {
  return process.env.AI_ENGINE_INTERNAL_KEY || "prism_internal_secret_change_me";
}

/**
 * Check the operational health and round-trip latency of the AI Engine.
 */
export async function checkAiEngineHealth(timeoutMs = 3000): Promise<AiEngineHealthStatus> {
  const baseUrl = getAiEngineUrl();
  const internalKey = getAiEngineKey();
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: "GET",
      headers: {
        "X-Internal-Secret": internalKey,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        isOnline: false,
        latencyMs,
        error: `AI Engine responded with HTTP status ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as AiEngineHealthResponse;
    return {
      isOnline: data.status === "ok",
      latencyMs,
      status: data.status,
      version: data.version,
      uptimeSeconds: data.uptime_seconds,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";

    return {
      isOnline: false,
      latencyMs: isTimeout ? timeoutMs : latencyMs,
      error: isTimeout ? "AI Engine health check timed out" : `Connection failed: ${errorMessage}`,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Make an authenticated typed request to an endpoint in the AI Engine.
 */
export async function requestAiEngine<T>(
  endpoint: string,
  options: AiEngineRequestOptions = {}
): Promise<T> {
  const baseUrl = getAiEngineUrl();
  const internalKey = getAiEngineKey();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const { timeoutMs = 15000, headers = {}, ...customInit } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const mergedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Internal-Secret": internalKey,
      ...(headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...customInit,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorDetail = response.statusText;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson);
      } catch {
        // use fallback statusText
      }
      throw new Error(`AI Engine Error [${response.status}]: ${errorDetail}`);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`AI Engine request to ${cleanEndpoint} timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface VoiceInfo {
  name: string;
  language: string;
  gender: string;
  quality: string;
  description: string;
  is_downloaded: boolean;
}

/**
 * Fetch catalog of supported voices from the AI Engine.
 */
export async function getAvailableVoices(): Promise<VoiceInfo[]> {
  return requestAiEngine<VoiceInfo[]>("/api/v1/audio/voices", { method: "GET" });
}

/**
 * Request speech synthesis from text and return raw audio ArrayBuffer (WAV).
 */
export async function generateSpeechAudio(
  text: string,
  voice = "en_US-lessac-medium",
  speed = 1.0,
  timeoutMs = 60000
): Promise<ArrayBuffer> {
  const baseUrl = getAiEngineUrl();
  const internalKey = getAiEngineKey();
  const url = `${baseUrl}/api/v1/audio/tts`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": internalKey,
      },
      body: JSON.stringify({ text, voice, speed }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorDetail = response.statusText;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson);
      } catch {
        // fallback
      }
      throw new Error(`AI Engine TTS Error [${response.status}]: ${errorDetail}`);
    }

    return await response.arrayBuffer();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`TTS synthesis timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

