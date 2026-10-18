import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedGeminiModel, isGeminiModelIdentifier } from "@/lib/gemini-policy";
import { runIntakeAnalysis } from "@/ai/orchestrator.server";
import { mockIntakeAnalysis } from "@/ai/mock-provider.server";
import { geminiResponse } from "../helpers/gemini-response";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
});
describe("Gemini-only free-tier configuration", () => {
    it("only allows the explicitly reviewed free-tier Flash model", () => {
        expect(isAllowedGeminiModel("gemini-3.8-flash")).toBe(true);
        for (const model of [
            "gemini-4-argon",
            "gemini-flash-latest",
            "openrouter/free",
            "openai/gpt-4.1-mini",
            "gemini-3.8-flash-image",
        ])
            expect(isAllowedGeminiModel(model)).toBe(false);
    });
    it("permits public Gemini version identifiers in diagnostics only", () => {
        expect(isGeminiModelIdentifier("gemini-3.8-flash-001")).toBe(true);
        expect(isAllowedGeminiModel("gemini-3.8-flash-001")).toBe(false);
        expect(isGeminiModelIdentifier("fictional@example.test")).toBe(false);
    });
    for (const status of [400, 401, 403, 402]) {
        it(`never automatically retries Gemini HTTP ${status} or substitutes mock output`, async () => {
            vi.stubEnv("AI_PROVIDER_MODE", "live");
            vi.stubEnv("GEMINI_API_KEY", "fictional-key");
            vi.stubEnv("GEMINI_MODEL_DEFAULT", "gemini-3.8-flash");
            vi.stubEnv("AI_PROVIDER_MAX_RETRIES", "3");
            vi.spyOn(console, "info").mockImplementation(() => {});
            const fetch = vi.fn(
                async () =>
                    new Response(
                        JSON.stringify({
                            error: {
                                code: status,
                                message: "Fictional quota failure",
                                status:
                                    status === 429 ? "RESOURCE_EXHAUSTED" : "FAILED_PRECONDITION",
                            },
                        }),
                        { status, headers: { "Content-Type": "application/json" } },
                    ),
            );
            vi.stubGlobal("fetch", fetch);
            await expect(
                runIntakeAnalysis({
                    rawText: "Fictional project objective",
                    correlationId: "fictional",
                }),
            ).rejects.toMatchObject({
                code:
                    status === 402
                        ? "GEMINI_FREE_TIER_UNAVAILABLE"
                        : status === 400
                          ? "GEMINI_SCHEMA_INVALID"
                          : "GEMINI_AUTH_INVALID",
                meta: { provider: "gemini", schemaValid: false },
            });
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    }
    for (const status of [503, 429]) {
        it(`backs off after HTTP ${status}, then returns real-provider output without fallback`, async () => {
            vi.useFakeTimers();
            vi.stubEnv("AI_PROVIDER_MODE", "live");
            vi.stubEnv("GEMINI_API_KEY", "fictional-key");
            vi.stubEnv("GEMINI_MODEL_DEFAULT", "gemini-3.8-flash");
            vi.stubEnv("AI_PROVIDER_MAX_RETRIES", "2");
            vi.spyOn(console, "info").mockImplementation(() => {});
            const input = { rawText: "Fictional project objective", correlationId: "fictional" };
            const fetch = vi
                .fn()
                .mockResolvedValueOnce(
                    new Response(
                        JSON.stringify({ error: { code: status, message: "Temporary failure" } }),
                        {
                            status,
                            headers: { "Content-Type": "application/json", "retry-after": "3" },
                        },
                    ),
                )
                .mockResolvedValueOnce(geminiResponse(JSON.stringify(mockIntakeAnalysis(input))));
            vi.stubGlobal("fetch", fetch);
            const pending = runIntakeAnalysis(input);
            await vi.advanceTimersByTimeAsync(2999);
            expect(fetch).toHaveBeenCalledTimes(1);
            await vi.advanceTimersByTimeAsync(251);
            const result = await pending;
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(result.meta).toMatchObject({ provider: "gemini", schemaValid: true });
            expect(result.meta.attempts.map((attempt) => attempt.outcome)).toEqual([
                status === 503 ? "GEMINI_PROVIDER_UNAVAILABLE" : "GEMINI_RATE_LIMITED",
                "SUCCESS",
            ]);
        });
    }
    it("stops after three transient attempts", async () => {
        vi.useFakeTimers();
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        vi.stubEnv("GEMINI_API_KEY", "fictional-key");
        vi.stubEnv("GEMINI_MODEL_DEFAULT", "gemini-3.8-flash");
        vi.stubEnv("AI_PROVIDER_MAX_RETRIES", "99");
        vi.spyOn(console, "info").mockImplementation(() => {});
        const fetch = vi.fn(
            async () =>
                new Response(JSON.stringify({ error: { code: 503, message: "Unavailable" } }), {
                    status: 503,
                    headers: { "Content-Type": "application/json" },
                }),
        );
        vi.stubGlobal("fetch", fetch);
        const assertion = expect(
            runIntakeAnalysis({ rawText: "Fictional objective", correlationId: "fictional" }),
        ).rejects.toMatchObject({
            code: "GEMINI_PROVIDER_UNAVAILABLE",
            meta: { diagnostics: { timedOut: false } },
        });
        await vi.advanceTimersByTimeAsync(8000);
        await assertion;
        expect(fetch).toHaveBeenCalledTimes(3);
    });
});
