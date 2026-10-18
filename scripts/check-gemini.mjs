import { loadEnv } from "vite";
import { isAllowedGeminiModel } from "../src/lib/gemini-policy.ts";

const env = loadEnv("production", process.cwd(), "");
const model = env.GEMINI_MODEL_DEFAULT?.trim();
const key = env.GEMINI_API_KEY?.trim();
async function check() {
    if (!key || !model || !isAllowedGeminiModel(model)) {
        console.error(
            "GEMINI_CONFIG_BLOCKED: GEMINI_API_KEY and an approved GEMINI_MODEL_DEFAULT are required.",
        );
        process.exitCode = 1;
        return;
    }
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}`,
        {
            headers: { "x-goog-api-key": key },
            signal: AbortSignal.timeout(15000),
        },
    );
    const body = await response.json();
    if (
        !response.ok ||
        !body.supportedGenerationMethods?.includes("generateContent") ||
        body.outputTokenLimit < 12000
    ) {
        console.error(
            `GEMINI_CONFIG_BLOCKED: catalog/key/capacity check failed (HTTP ${response.status}). No inference was made.`,
        );
        process.exitCode = 1;
        return;
    }
    console.log(`Gemini key, model and output capacity passed: ${model}. No inference was made.`);
    console.log(
        "Model free-tier pricing/structured outputs are documented by Google. Confirm this project's Free Tier/no-paid-billing status in AI Studio before live generation; the catalog does not expose billing tier or remaining quota.",
    );
}
check().catch(() => {
    console.error(
        "Gemini configuration check unavailable: network/catalog failure. No inference was made.",
    );
    process.exitCode = 1;
});
