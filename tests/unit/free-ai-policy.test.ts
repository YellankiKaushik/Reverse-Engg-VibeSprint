import { afterEach, describe, expect, it, vi } from "vitest";
import { generateObject } from "ai";
import { z } from "zod";
import { enforceFreeRequest, hasZeroPricing, isFreeModelId } from "../../src/lib/free-ai-policy";
import { candidateForAlias } from "../../src/lib/ai-gateway.server";
import { runIntakeAnalysis } from "../../src/ai/orchestrator.server";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

function liveFreeConfiguration() {
    vi.stubEnv("AI_PROVIDER_MODE", "live");
    vi.stubEnv("OPENROUTER_ENABLED", "true");
    vi.stubEnv("OPENROUTER_API_KEY", "fictional-unit-key");
    vi.stubEnv("OPENROUTER_MODEL_DEFAULT", "openrouter/free");
    vi.stubEnv("AI_PROVIDER_MAX_RETRIES", "3");
}

describe("zero-cost AI enforcement", () => {
    it("accepts explicit free variants and the free router only", () => {
        expect(isFreeModelId("openrouter/free")).toBe(true);
        expect(isFreeModelId("nvidia/nemotron-3.5-super-vl:free")).toBe(true);
        for (const id of ["openrouter/auto", "openai/gpt-4.1-mini", "x/y:free:online"])
            expect(isFreeModelId(id)).toBe(false);
    });
    it("requires known zero input/output and all additional charge fields", () => {
        expect(hasZeroPricing({ prompt: "0", completion: "0", request: "0" })).toBe(true);
        for (const pricing of [
            undefined,
            { prompt: "0" },
            { prompt: "0", completion: "0.01" },
            { prompt: "0", completion: "0", request: "1" },
            { prompt: "0", completion: "0", image: null },
        ])
            expect(hasZeroPricing(pricing)).toBe(false);
    });
    it("rejects paid models, fallback models, plugins and router overrides", () => {
        expect(() => enforceFreeRequest("x/paid", { model: "x/paid" })).toThrow(
            "FREE_MODEL_INCOMPATIBLE",
        );
        for (const override of [
            { model: "x/paid" },
            { models: ["x/paid"] },
            { route: "fallback" },
            { plugins: [{ id: "web" }] },
            { tools: [{ type: "function" }] },
        ])
            expect(() =>
                enforceFreeRequest("openrouter/free", { model: "openrouter/free", ...override }),
            ).toThrow("FREE_MODEL_INCOMPATIBLE");
    });
    it("enforces the policy on the SDK's actual outgoing JSON", async () => {
        liveFreeConfiguration();
        const mockFetch = vi.fn(async (_input, init) => {
            const body = JSON.parse(init.body);
            expect(body.model).toBe("openrouter/free");
            expect(body.response_format.type).toBe("json_schema");
            expect(body.provider).toEqual({
                require_parameters: true,
                allow_fallbacks: false,
                max_price: { prompt: 0, completion: 0, request: 0, image: 0 },
            });
            return new Response(
                JSON.stringify({
                    id: "fictional",
                    model: "x/test:free",
                    choices: [
                        {
                            index: 0,
                            message: { role: "assistant", content: '{"ok":true}' },
                            finish_reason: "stop",
                        },
                    ],
                    usage: { prompt_tokens: 1, completion_tokens: 1 },
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        });
        vi.stubGlobal("fetch", mockFetch);
        const result = await generateObject({
            model: candidateForAlias("FAST")!.model,
            schema: z.object({ ok: z.boolean() }),
            prompt: "Fictional test",
            maxRetries: 0,
            providerOptions: {
                openrouter: {
                    provider: {
                        require_parameters: false,
                        allow_fallbacks: true,
                        max_price: { prompt: 99 },
                    },
                },
            },
        });
        expect(result.object.ok).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    for (const [status, httpStatus] of [
        [402, 402],
        [429, 429],
        [402, 200],
        [429, 200],
    ]) {
        it(`does not retry provider ${status} in HTTP ${httpStatus} when retries are configured`, async () => {
            liveFreeConfiguration();
            const mockFetch = vi.fn(
                async () =>
                    new Response(
                        JSON.stringify({
                            error: { message: "Fictional provider failure", code: status },
                        }),
                        { status: httpStatus, headers: { "Content-Type": "application/json" } },
                    ),
            );
            vi.stubGlobal("fetch", mockFetch);
            await expect(
                runIntakeAnalysis({
                    rawText: "Fictional test objective",
                    correlationId: "unit-only",
                }),
            ).rejects.toMatchObject({
                code: status === 402 ? "AI_BUDGET_EXCEEDED" : "AI_RATE_LIMITED",
            });
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    }
});
