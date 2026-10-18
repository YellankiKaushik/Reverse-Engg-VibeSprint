import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    candidateForAlias,
    classifyAiError,
    geminiRetryDelayMs,
    isMockAiEnabled,
    maxProviderRetries,
    maxOutputTokens,
    timeoutMs,
    MODEL_ALIASES,
} from "@/lib/ai-gateway.server";

beforeEach(() => {
    for (const name of [
        "AI_PROVIDER_MODE",
        "OPENROUTER_ENABLED",
        "GEMINI_API_KEY",
        "GEMINI_MODEL_DEFAULT",
        "AI_PROVIDER_TIMEOUT_MS",
        "AI_PROVIDER_MAX_RETRIES",
        "AI_MAX_OUTPUT_TOKENS",
    ])
        vi.stubEnv(name, "");
});
afterEach(() => vi.unstubAllEnvs());

describe("Gemini configuration", () => {
    it("defaults to no-cost mock AI and fails closed on invalid modes", () => {
        expect(isMockAiEnabled()).toBe(true);
        vi.stubEnv("AI_PROVIDER_MODE", "typo");
        expect(candidateForAlias("PRIMARY")).toBeUndefined();
    });
    it("uses one Gemini model for all roles", () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("GEMINI_API_KEY", "test-private-key");
        vi.stubEnv("GEMINI_MODEL_DEFAULT", "gemini-3.8-flash");
        for (const alias of MODEL_ALIASES) {
            const candidate = candidateForAlias(alias);
            expect(candidate?.providerId).toBe("gemini");
            expect(candidate?.modelId).toBe("gemini-3.8-flash");
            expect(candidate?.modelAlias).toBe(alias);
        }
    });
    it("refuses a paid model even with valid live configuration", () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("GEMINI_API_KEY", "test-private-key");
        vi.stubEnv("GEMINI_MODEL_DEFAULT", "gemini-4-argon");
        expect(candidateForAlias("PRIMARY")).toBeUndefined();
    });
    it("requires both the Gemini key and model", () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        expect(candidateForAlias("FAST")).toBeUndefined();
        vi.stubEnv("GEMINI_API_KEY", "test-private-key");
        expect(candidateForAlias("FAST")).toBeUndefined();
    });
    it("respects mock mode and ignores the obsolete OpenRouter switch", () => {
        vi.stubEnv("GEMINI_API_KEY", "test-private-key");
        vi.stubEnv("GEMINI_MODEL_DEFAULT", "gemini-3.8-flash");
        expect(candidateForAlias("FAST")).toBeUndefined();
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("OPENROUTER_ENABLED", "false");
        expect(candidateForAlias("FAST")?.providerId).toBe("gemini");
    });
    it("never falls back to legacy provider credentials or endpoints", () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("OPENAI_API_KEY", "test-legacy-key");
        vi.stubEnv("OPENAI_BASE_URL", "https://api.routerplus.com/v1");
        vi.stubEnv("AI_PROVIDER_ALLOWLIST", "openai");
        expect(candidateForAlias("PRIMARY")).toBeUndefined();
    });
    it("bounds timeout, retry and output budgets", () => {
        expect(maxProviderRetries()).toBe(0);
        expect(maxOutputTokens()).toBe(12000);
        vi.stubEnv("AI_PROVIDER_TIMEOUT_MS", "999999");
        vi.stubEnv("AI_PROVIDER_MAX_RETRIES", "12");
        vi.stubEnv("AI_MAX_OUTPUT_TOKENS", "999999");
        expect(timeoutMs()).toBe(300000);
        expect(maxProviderRetries()).toBe(2);
        expect(maxOutputTokens()).toBe(16384);
    });
    it("keeps actionable errors without leaking provider details", () => {
        expect(classifyAiError({ status: 429 }).code).toBe("GEMINI_RATE_LIMITED");
        expect(classifyAiError({ message: "invalid JSON" }).code).toBe("GEMINI_SCHEMA_INVALID");
        expect(classifyAiError({ name: "AbortError" }).code).toBe("GEMINI_TIMEOUT");
        expect(classifyAiError({ status: 401 }).retryable).toBe(false);
        expect(classifyAiError({ message: "private provider detail" }).message).not.toContain(
            "private provider detail",
        );
    });
    it("distinguishes provider unavailability from deadlines, auth and invalid output", () => {
        expect(classifyAiError({ status: 503 })).toMatchObject({
            code: "GEMINI_PROVIDER_UNAVAILABLE",
            retryable: true,
            timedOut: false,
        });
        expect(classifyAiError({ status: 504 })).toMatchObject({
            code: "GEMINI_TIMEOUT",
            timedOut: true,
        });
        for (const status of [401, 403])
            expect(classifyAiError({ status })).toMatchObject({
                code: "GEMINI_AUTH_INVALID",
                retryable: false,
            });
        expect(classifyAiError({ status: 400 })).toMatchObject({
            code: "GEMINI_SCHEMA_INVALID",
            retryable: false,
        });
        expect(classifyAiError({ status: 402 })).toMatchObject({
            code: "GEMINI_FREE_TIER_UNAVAILABLE",
            retryable: false,
        });
    });
    it("does not retry nontransient failures or ignore long quota cooldowns", () => {
        for (const status of [400, 401, 403, 404, 500, 504])
            expect(geminiRetryDelayMs({ status }, 0)).toBeUndefined();
        expect(
            geminiRetryDelayMs({ status: 429, responseHeaders: { "retry-after": "120" } }, 0),
        ).toBeUndefined();
        expect(geminiRetryDelayMs({ status: 503 }, 2)).toBeUndefined();
    });
});
