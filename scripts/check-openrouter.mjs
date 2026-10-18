import { loadEnv } from "vite";
import { hasZeroPricing, isFreeModelId } from "../src/lib/free-ai-policy.ts";
const env = loadEnv("production", process.cwd(), "");
const key = env.OPENROUTER_API_KEY?.trim();
const model = env.OPENROUTER_MODEL_DEFAULT?.trim();
class ConfigurationError extends Error {}
async function check() {
    if (!key || !model)
        throw new ConfigurationError(
            "BLOCKED: OPENROUTER_API_KEY and OPENROUTER_MODEL_DEFAULT are required.",
        );
    if (!isFreeModelId(model))
        throw new ConfigurationError("FREE_MODEL_INCOMPATIBLE: paid model IDs are disabled.");
    const auth = await fetch("https://openrouter.ai/api/v1/key", {
        headers: { Authorization: "Bearer " + key },
        signal: AbortSignal.timeout(15000),
    });
    if (!auth.ok)
        throw new ConfigurationError(
            "AUTH_INVALID: OpenRouter did not accept OPENROUTER_API_KEY (HTTP " +
                auth.status +
                "). Keys from other services cannot be substituted.",
        );
    const catalog = await fetch("https://openrouter.ai/api/v1/models", {
        signal: AbortSignal.timeout(15000),
    });
    if (!catalog.ok)
        throw new ConfigurationError(
            "MODEL_CHECK_BLOCKED: OpenRouter model catalog is unavailable.",
        );
    const models = (await catalog.json()).data ?? [];
    const selected = models.find((entry) => entry.id === model);
    const outputTokens = Math.min(16384, Math.max(256, Number(env.AI_MAX_OUTPUT_TOKENS) || 12000));
    if (
        !hasZeroPricing(selected?.pricing) ||
        !selected?.supported_parameters?.includes("structured_outputs") ||
        !selected.supported_parameters.includes("response_format")
    )
        throw new ConfigurationError(
            "FREE_MODEL_INCOMPATIBLE: the catalog must list zero pricing and structured_outputs/response_format support.",
        );
    const pool =
        model === "openrouter/free"
            ? models.filter(
                  (entry) =>
                      isFreeModelId(entry.id) &&
                      entry.id !== model &&
                      hasZeroPricing(entry.pricing) &&
                      entry.supported_parameters?.includes("structured_outputs") &&
                      entry.supported_parameters?.includes("response_format") &&
                      entry.top_provider?.max_completion_tokens >= outputTokens,
              )
            : [selected];
    let endpointVerified = false;
    for (const entry of pool) {
        const response = await fetch(`https://openrouter.ai/api/v1/models/${entry.id}/endpoints`, {
            signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) continue;
        const endpoints = (await response.json()).data?.endpoints ?? [];
        if (
            endpoints.some(
                (endpoint) =>
                    hasZeroPricing(endpoint.pricing) &&
                    endpoint.max_completion_tokens >= outputTokens &&
                    endpoint.supported_parameters?.includes("structured_outputs") &&
                    endpoint.supported_parameters?.includes("response_format"),
            )
        ) {
            endpointVerified = true;
            break;
        }
    }
    if (!endpointVerified)
        throw new ConfigurationError(
            "FREE_MODEL_INCOMPATIBLE: no zero-price schema-capable serving endpoint supports the output budget.",
        );
    console.log(
        "OpenRouter key, zero pricing, endpoint capabilities and output budget passed: " +
            model +
            ". No inference request was made.",
    );
}
check().catch((error) => {
    // Never print a raw transport exception: it can carry headers or request bodies.
    console.error(
        error instanceof ConfigurationError
            ? error.message
            : "OpenRouter validation failed: network/catalog unavailable. No inference request was made.",
    );
    process.exitCode = 1;
});
