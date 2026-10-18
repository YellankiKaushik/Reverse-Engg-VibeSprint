import { isGeminiModelIdentifier } from "@/lib/gemini-policy";

export interface AiDiagnostics {
    providerModel: string;
    outputTokens: number | null;
    finishReason: string | null;
    schemaValid: boolean | null;
    graphValid: boolean | null;
    timedOut: boolean;
}

const finishReasons = new Set([
    "stop",
    "length",
    "content-filter",
    "tool-calls",
    "error",
    "other",
    "unknown",
]);

/** Deliberate allowlist: never serialize SDK errors, prompts, text or responses. */
export function logAiDiagnostics(operation: string, diagnostic: AiDiagnostics) {
    console.info(
        "AI_DIAGNOSTIC",
        JSON.stringify({
            operation: [
                "CLASSIFY_AND_CLARIFY",
                "GENERATE_PLAN_GRAPH",
                "REPLAN",
                "EXPLAIN_CHANGE",
            ].includes(operation)
                ? operation
                : "UNKNOWN",
            providerModel: isGeminiModelIdentifier(diagnostic.providerModel)
                ? diagnostic.providerModel
                : "unknown",
            outputTokens:
                Number.isFinite(diagnostic.outputTokens) && diagnostic.outputTokens! >= 0
                    ? diagnostic.outputTokens
                    : null,
            finishReason: finishReasons.has(diagnostic.finishReason ?? "")
                ? diagnostic.finishReason
                : null,
            schemaValid: diagnostic.schemaValid,
            graphValid: diagnostic.graphValid,
            timedOut: diagnostic.timedOut,
        }),
    );
}
