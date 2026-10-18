import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    candidateForAlias,
    classifyAiError,
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
        "OPENROUTER_API_KEY",
        "OPENROUTER_MODEL_DEFAULT",
        "AI_PROVIDER_TIMEOUT_MS",
        "AI_PROVIDER_MAX_RETRIES",
        "AI_MAX_OUTPUT_TOKENS",
    ])
        vi.stubEnv(name, "");
});
afterEach(() => vi.unstubAllEnvs());

describe("OpenRouter configuration", () => {
    it("defaults to no-cost mock AI and fails closed on invalid modes", () => {
        expect(isMockAiEnabled()).toBe(true);
        vi.stubEnv("AI_PROVIDER_MODE", "typo");
        expect(candidateForAlias("PRIMARY")).toBeUndefined();
    });
    it("uses one OpenRouter model for all roles", () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("OPENROUTER_API_KEY", "test-private-key");
        vi.stubEnv("OPENROUTER_MODEL_DEFAULT", "test/model:free");
        for (const alias of MODEL_ALIASES) {
            const candidate = candidateForAlias(alias);
            expect(candidate?.providerId).toBe("openrouter");
            expect(candidate?.modelId).toBe("test/model:free");
            expect(candidate?.modelAlias).toBe(alias);
        }
    });
    it("refuses a paid model even with valid live configuration", () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("OPENROUTER_API_KEY", "test-private-key");
        vi.stubEnv("OPENROUTER_MODEL_DEFAULT", "openai/gpt-4.1-mini");
        expect(candidateForAlias("PRIMARY")).toBeUndefined();
    });
    it("requires both the OpenRouter key and model", () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        expect(candidateForAlias("FAST")).toBeUndefined();
        vi.stubEnv("OPENROUTER_API_KEY", "test-private-key");
        expect(candidateForAlias("FAST")).toBeUndefined();
    });
    it("respects explicit disable and mock mode", () => {
        vi.stubEnv("OPENROUTER_API_KEY", "test-private-key");
        vi.stubEnv("OPENROUTER_MODEL_DEFAULT", "test/model");
        expect(candidateForAlias("FAST")).toBeUndefined();
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("OPENROUTER_ENABLED", "false");
        expect(candidateForAlias("FAST")).toBeUndefined();
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
        expect(maxProviderRetries()).toBe(3);
        expect(maxOutputTokens()).toBe(16384);
    });
    it("keeps actionable errors without leaking provider details", () => {
        expect(classifyAiError({ status: 429 }).code).toBe("AI_RATE_LIMITED");
        expect(classifyAiError({ message: "invalid JSON" }).code).toBe("AI_SCHEMA_INVALID");
        expect(classifyAiError({ name: "AbortError" }).code).toBe("AI_PROVIDER_TIMEOUT");
        expect(classifyAiError({ status: 401 }).retryable).toBe(false);
        expect(classifyAiError({ message: "private provider detail" }).message).not.toContain(
            "private provider detail",
        );
    });
});
