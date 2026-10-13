import { loadEnv } from "vite";
const env = loadEnv("production", process.cwd(), "");
const key = env.OPENROUTER_API_KEY?.trim();
const model = env.OPENROUTER_MODEL_DEFAULT?.trim();
class ConfigurationError extends Error {}
async function check() {
    if (!key || !model)
        throw new ConfigurationError(
            "BLOCKED: OPENROUTER_API_KEY and OPENROUTER_MODEL_DEFAULT are required.",
        );
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
    const selected = (await catalog.json()).data?.find((entry) => entry.id === model);
    if (
        !selected?.supported_parameters?.includes("structured_outputs") ||
        !selected.supported_parameters.includes("response_format")
    )
        throw new ConfigurationError(
            "MODEL_INCOMPATIBLE: OPENROUTER_MODEL_DEFAULT must identify a model with structured_outputs and response_format support. Check the OpenRouter catalog; openai/gpt-4.1-mini is the tested option.",
        );
    console.log(
        "OpenRouter authentication and model compatibility passed: " +
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
