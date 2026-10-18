import { createGoogle } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { isAllowedGeminiModel } from "./gemini-policy";

export const MODEL_ALIASES = ["FAST", "PRIMARY", "CRITIC", "FALLBACK"] as const;
export type ModelAlias = (typeof MODEL_ALIASES)[number];
export const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

export interface AiProviderCandidate {
    providerId: "gemini";
    providerName: "gemini";
    modelAlias: ModelAlias;
    modelId: string;
    model: LanguageModel;
}

export interface AiAttemptTelemetry {
    provider: string;
    modelAlias: string;
    modelId: string;
    attempt: number;
    latencyMs: number;
    outcome: string;
    retryable: boolean;
}

// Missing or invalid modes fail closed to deterministic, no-cost mock AI.
export function isMockAiEnabled() {
    return process.env["AI_PROVIDER_MODE"]?.toLowerCase() !== "live";
}

export function timeoutMs() {
    const parsed = Number(process.env["AI_PROVIDER_TIMEOUT_MS"]);
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(300_000, parsed) : 90_000;
}

export function maxOutputTokens() {
    const parsed = Number(process.env["AI_MAX_OUTPUT_TOKENS"]);
    return Number.isFinite(parsed) && parsed >= 256 ? Math.min(16_384, Math.floor(parsed)) : 12_000;
}

export function maxProviderRetries() {
    const parsed = Number(process.env["AI_PROVIDER_MAX_RETRIES"]);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.min(2, Math.floor(parsed)) : 0;
}

/** Opt-in retries are restricted to transient 503/429 responses, at most three attempts. */
export function geminiRetryDelayMs(error: unknown, attempt: number): number | undefined {
    const failure = error as
        | { statusCode?: number; status?: number; responseHeaders?: Record<string, string> }
        | undefined;
    if (![429, 503].includes(failure?.statusCode ?? failure?.status ?? 0) || attempt >= 2)
        return undefined;
    const header = failure?.responseHeaders?.["retry-after"];
    const seconds = header ? Number(header) : NaN;
    const retryAfterMs = Number.isFinite(seconds)
        ? seconds * 1000
        : header
          ? Date.parse(header) - Date.now()
          : 0;
    // Leave long quota cooldowns to a later deliberate request.
    if (retryAfterMs > 60_000) return undefined;
    return (
        Math.max(retryAfterMs || 0, attempt === 0 ? 2000 : 5000) + Math.floor(Math.random() * 250)
    );
}

// One service, one model for every planning role. No alternate endpoints or keys.
export function candidateForAlias(alias: ModelAlias): AiProviderCandidate | undefined {
    if (isMockAiEnabled()) return undefined;
    const apiKey = process.env["GEMINI_API_KEY"]?.trim();
    const modelId = process.env["GEMINI_MODEL_DEFAULT"]?.trim();
    if (!apiKey || !modelId || !isAllowedGeminiModel(modelId)) return undefined;
    const provider = createGoogle({
        baseURL: GEMINI_ENDPOINT,
        apiKey,
    });
    return {
        providerId: "gemini",
        providerName: "gemini",
        modelAlias: alias,
        modelId,
        model: provider(modelId),
    };
}

export interface AiFailure {
    code:
        | "GEMINI_PROVIDER_UNAVAILABLE"
        | "GEMINI_RATE_LIMITED"
        | "GEMINI_SCHEMA_INVALID"
        | "GEMINI_TIMEOUT"
        | "GEMINI_AUTH_INVALID"
        | "GEMINI_FREE_TIER_UNAVAILABLE"
        | "AI_GRAPH_INVALID"
        | "AI_UNAVAILABLE";
    message: string;
    retryable: boolean;
    timedOut?: boolean;
}

/** Maps gateway/provider failures onto the documented error model. */
export function classifyAiError(error: unknown): AiFailure {
    const anyErr = error as
        | {
              statusCode?: number;
              status?: number;
              name?: string;
              message?: string;
              code?: string;
          }
        | undefined;
    const status = anyErr?.statusCode ?? anyErr?.status;
    const message = anyErr?.message ?? "The planning engine could not complete this request.";

    if (anyErr?.code === "PLAN_VALIDATION_FAILED")
        return {
            code: "AI_GRAPH_INVALID",
            message: "The planning engine returned an invalid dependency graph. Please try again.",
            retryable: false,
        };

    if (status === 429)
        return {
            code: "GEMINI_RATE_LIMITED",
            message:
                "Gemini's free quota or rate limit was reached. Try again later. Saved plans still work.",
            retryable: true,
        };
    if (status === 402)
        return {
            code: "GEMINI_FREE_TIER_UNAVAILABLE",
            message:
                "Gemini free-tier access is unavailable for this project. Saved plans still work.",
            retryable: false,
        };
    if (status === 401 || status === 403)
        return {
            code: "GEMINI_AUTH_INVALID",
            message:
                "Gemini authentication or project access was rejected. Saved plans still work.",
            retryable: false,
        };
    if (status === 404)
        return {
            code: "AI_UNAVAILABLE",
            message: "The configured Gemini model is unavailable. Saved plans still work.",
            retryable: false,
        };
    if (status === 408 || status === 504)
        return {
            code: "GEMINI_TIMEOUT",
            message: "Gemini timed out. Saved plans still work.",
            retryable: true,
            timedOut: true,
        };
    if (status && status >= 500)
        return {
            code: "GEMINI_PROVIDER_UNAVAILABLE",
            message: "Gemini is temporarily unavailable. Saved plans still work.",
            retryable: true,
            timedOut: false,
        };
    if (status === 400 || /schema|zod|json|parse|object generated|malformed/i.test(message))
        return {
            code: "GEMINI_SCHEMA_INVALID",
            message: "The planning engine returned invalid structured output. Please try again.",
            retryable: false,
        };
    if (
        ["AbortError", "TimeoutError"].includes(anyErr?.name ?? "") ||
        /timeout|aborted/i.test(message)
    )
        return {
            code: "GEMINI_TIMEOUT",
            message: "The planning engine timed out.",
            retryable: true,
            timedOut: true,
        };

    return {
        code: "AI_UNAVAILABLE",
        message: "The planning engine is temporarily unavailable. Saved plans still work.",
        retryable: true,
    };
}
