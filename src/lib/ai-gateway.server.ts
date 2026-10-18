import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { enforceFreeRequest, isFreeModelId } from "./free-ai-policy";

export const MODEL_ALIASES = ["FAST", "PRIMARY", "CRITIC", "FALLBACK"] as const;
export type ModelAlias = (typeof MODEL_ALIASES)[number];
export const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1";

export interface AiProviderCandidate {
    providerId: "openrouter";
    providerName: "openrouter";
    modelAlias: ModelAlias;
    modelId: string;
    model: LanguageModel;
}

export interface AiAttemptTelemetry {
    provider: string;
    modelAlias: string;
    modelId: string;
    attempt: number;
    latencyMs: number;
    outcome: string;
    retryable: boolean;
}

// Missing or invalid modes fail closed to deterministic, no-cost mock AI.
export function isMockAiEnabled() {
    return process.env["AI_PROVIDER_MODE"]?.toLowerCase() !== "live";
}

export function timeoutMs() {
    const parsed = Number(process.env["AI_PROVIDER_TIMEOUT_MS"]);
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(300_000, parsed) : 90_000;
}

export function maxOutputTokens() {
    const parsed = Number(process.env["AI_MAX_OUTPUT_TOKENS"]);
    return Number.isFinite(parsed) && parsed >= 256 ? Math.min(16_384, Math.floor(parsed)) : 12_000;
}

export function maxProviderRetries() {
    const parsed = Number(process.env["AI_PROVIDER_MAX_RETRIES"]);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.min(3, Math.floor(parsed)) : 0;
}

// One service, one model for every planning role. No alternate endpoints or keys.
export function candidateForAlias(alias: ModelAlias): AiProviderCandidate | undefined {
    if (isMockAiEnabled() || process.env["OPENROUTER_ENABLED"] === "false") return undefined;
    const apiKey = process.env["OPENROUTER_API_KEY"]?.trim();
    const modelId = process.env["OPENROUTER_MODEL_DEFAULT"]?.trim();
    if (!apiKey || !modelId || !isFreeModelId(modelId)) return undefined;
    const provider = createOpenAICompatible({
        name: "openrouter",
        baseURL: OPENROUTER_ENDPOINT,
        apiKey,
        supportsStructuredOutputs: true,
        // Applied after caller options, so they cannot override the zero-price cap.
        transformRequestBody: (body) => enforceFreeRequest(modelId, body),
        headers: {
            "X-OpenRouter-Title": "ReversePath",
            ...(process.env["PUBLIC_APP_URL"]
                ? { "HTTP-Referer": process.env["PUBLIC_APP_URL"]! }
                : {}),
        },
    });
    return {
        providerId: "openrouter",
        providerName: "openrouter",
        modelAlias: alias,
        modelId,
        model: provider(modelId),
    };
}

export interface AiFailure {
    code:
        | "AI_PROVIDER_TIMEOUT"
        | "AI_RATE_LIMITED"
        | "AI_SCHEMA_INVALID"
        | "AI_POLICY_REJECTED"
        | "AI_BUDGET_EXCEEDED"
        | "AI_UNAVAILABLE";
    message: string;
    retryable: boolean;
}

/** Maps gateway/provider failures onto the documented error model. */
export function classifyAiError(error: unknown): AiFailure {
    const anyErr = error as
        | {
              statusCode?: number;
              status?: number;
              name?: string;
              message?: string;
              responseBody?: string;
          }
        | undefined;
    let status = anyErr?.statusCode ?? anyErr?.status;
    // OpenRouter can send a provider failure inside an HTTP 200 JSON body.
    // Read only its numeric status; never expose the raw response or metadata.
    if (status === 200 && anyErr?.responseBody) {
        try {
            const code: unknown = JSON.parse(anyErr.responseBody)?.error?.code;
            if (typeof code === "number" && Number.isInteger(code) && code >= 400 && code <= 599)
                status = code;
        } catch {
            // Malformed responses continue through the existing safe error mapping.
        }
    }
    const message = anyErr?.message ?? "The planning engine could not complete this request.";

    if (status === 429)
        return {
            code: "AI_RATE_LIMITED",
            message: "The planning engine is rate limited right now. Please try again shortly.",
            retryable: true,
        };
    if (status === 402)
        return {
            code: "AI_BUDGET_EXCEEDED",
            message:
                "Free AI is unavailable for this account right now. Check the account's free access and quota. Saved plans still work.",
            retryable: false,
        };
    if (status === 403)
        return {
            code: "AI_POLICY_REJECTED",
            message:
                "AI access is blocked by workspace or provider policy. Saved plans still work.",
            retryable: false,
        };
    if (status === 401)
        return {
            code: "AI_UNAVAILABLE",
            message: "AI is not configured for this app.",
            retryable: false,
        };
    if (status === 400 || /schema|zod|json|parse|object generated|malformed/i.test(message))
        return {
            code: "AI_SCHEMA_INVALID",
            message: "The planning engine returned invalid structured output. Please try again.",
            retryable: true,
        };
    if (status && status >= 500)
        return {
            code: "AI_PROVIDER_TIMEOUT",
            message: "The planning engine is temporarily unavailable. Saved plans still work.",
            retryable: true,
        };
    if (anyErr?.name === "AbortError" || /timeout|aborted/i.test(message))
        return {
            code: "AI_PROVIDER_TIMEOUT",
            message: "The planning engine timed out.",
            retryable: true,
        };

    return {
        code: "AI_UNAVAILABLE",
        message: "The planning engine is temporarily unavailable. Saved plans still work.",
        retryable: true,
    };
}
