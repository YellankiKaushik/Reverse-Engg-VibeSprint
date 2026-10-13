import { generateObject } from "ai";
import { z } from "zod";
import { expect, it, vi, afterEach } from "vitest";
import { candidateForAlias } from "@/lib/ai-gateway.server";
import { loadProjectEnv } from "../helpers/test-env";
loadProjectEnv();
afterEach(() => vi.unstubAllEnvs());
it.skipIf(
    process.env["RUN_LIVE_AI_SMOKE"] !== "true" ||
        !process.env["OPENROUTER_API_KEY"] ||
        !process.env["OPENROUTER_MODEL_DEFAULT"],
)(
    "OpenRouter returns a real schema-valid response",
    async () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        const candidate = candidateForAlias("FAST");
        expect(candidate?.providerId).toBe("openrouter");
        const result = await generateObject({
            model: candidate!.model,
            schema: z.object({ ok: z.literal(true) }),
            prompt: "Set ok to true.",
            providerOptions: { openrouter: { provider: { require_parameters: true } } },
            maxOutputTokens: 256,
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(30000),
        });
        expect(result.object.ok).toBe(true);
    },
    45000,
);
