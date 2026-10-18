// Verified against Google's pricing/model documentation on October 18, 2026.
// Model eligibility does not establish a project's billing tier: keep it Free Tier.
export const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";

export function isAllowedGeminiModel(model: string): boolean {
    return model === GEMINI_DEFAULT_MODEL;
}

/** Public model identifiers only; never log arbitrary provider strings. */
export function isGeminiModelIdentifier(model: string): boolean {
    return /^gemini-[a-z0-9.-]{1,90}$/.test(model);
}
