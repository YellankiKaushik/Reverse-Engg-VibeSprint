/** Free-only policy shared by the gateway and the non-inference config check. */
export function isFreeModelId(id: string): boolean {
    return id === "openrouter/free" || /^[a-z0-9_.-]+\/[a-z0-9_.-]+:free$/.test(id);
}

export function hasZeroPricing(pricing: Record<string, unknown> | undefined): boolean {
    if (!pricing || pricing["prompt"] == null || pricing["completion"] == null) return false;
    return Object.entries(pricing).every(
        ([key, value]) =>
            key === "discount" ||
            (((typeof value === "string" && value.trim() !== "") || typeof value === "number") &&
                Number(value) === 0),
    );
}

export function enforceFreeRequest(model: string, body: Record<string, unknown>) {
    if (
        !isFreeModelId(model) ||
        body["model"] !== model ||
        body["models"] ||
        body["route"] ||
        body["plugins"] ||
        body["tools"]
    ) {
        throw new Error("FREE_MODEL_INCOMPATIBLE: paid models and routing overrides are disabled.");
    }
    return {
        ...body,
        model,
        provider: {
            require_parameters: true,
            allow_fallbacks: false,
            max_price: { prompt: 0, completion: 0, request: 0, image: 0 },
        },
    };
}
