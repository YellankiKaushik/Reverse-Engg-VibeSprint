import { generateObject } from "ai";
import { z } from "zod";
import { expect, it, vi, afterEach } from "vitest";
import { candidateForAlias } from "@/lib/ai-gateway.server";
import { loadProjectEnv } from "../helpers/test-env";
loadProjectEnv();
afterEach(() => vi.unstubAllEnvs());
it.skipIf(
    process.env["RUN_LIVE_AI_SMOKE"] !== "true" ||
        !process.env["GEMINI_API_KEY"] ||
        !process.env["GEMINI_MODEL_DEFAULT"],
)(
    "Gemini returns a real schema-valid response (requires verified Free Tier project)",
    async () => {
        vi.stubEnv("AI_PROVIDER_MODE", "live");
        const candidate = candidateForAlias("FAST");
        expect(candidate?.providerId).toBe("gemini");
        const result = await generateObject({
            model: candidate!.model,
            schema: z.object({ ok: z.literal(true) }),
            prompt: "Set ok to true.",
            providerOptions: {
                google: { thinkingConfig: { thinkingLevel: "low", includeThoughts: false } },
            },
            maxOutputTokens: 256,
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(30000),
        });
        expect(result.object.ok).toBe(true);
    },
    45000,
);
