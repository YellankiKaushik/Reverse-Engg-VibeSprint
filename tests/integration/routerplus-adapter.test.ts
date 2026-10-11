import { generateObject } from "ai";
import { z } from "zod";
import { afterEach, expect, it, vi } from "vitest";
import { candidatesForAlias } from "@/lib/ai-gateway.server";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

it("sends authenticated schema generation to the RouterPlus-compatible endpoint", async () => {
    vi.stubEnv("AI_PROVIDER_MODE", "live");
    vi.stubEnv("AI_PROVIDER_ALLOWLIST", "openai");
    vi.stubEnv("AI_ROUTE_FAST", "openai");
    vi.stubEnv("OPENAI_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-private-key");
    vi.stubEnv("OPENAI_BASE_URL", "https://api.routerplus.com/v1");
    vi.stubEnv("OPENAI_MODEL_FAST", "test-model");
    const mockFetch = vi.fn(
        async () =>
            new Response(
                JSON.stringify({
                    id: "chatcmpl-test",
                    object: "chat.completion",
                    created: 1,
                    model: "test-model",
                    choices: [
                        {
                            index: 0,
                            message: { role: "assistant", content: '{"ok":true}' },
                            finish_reason: "stop",
                        },
                    ],
                    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
                }),
                { status: 200, headers: { "content-type": "application/json" } },
            ),
    );
    vi.stubGlobal("fetch", mockFetch);
    const [candidate] = candidatesForAlias("FAST");
    const result = await generateObject({
        model: candidate!.model,
        schema: z.object({ ok: z.literal(true) }),
        prompt: "Set ok to true.",
        maxRetries: 0,
    });
    expect(result.object).toEqual({ ok: true });
    const [url, init] = mockFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(url)).toBe("https://api.routerplus.com/v1/chat/completions");
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer test-private-key");
    expect(JSON.parse(String(init.body)).response_format.type).toBe("json_schema");
});
