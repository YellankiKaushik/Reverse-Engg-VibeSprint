import { loadEnv } from "vite";

let loaded = false;

export function loadProjectEnv() {
    if (loaded) return;
    loaded = true;

    const mode = process.env["MODE"] ?? process.env["NODE_ENV"] ?? "test";
    const env = loadEnv(mode, process.cwd(), "");
    for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
    }
}

export function testPublishableKey() {
    return process.env["SUPABASE_PUBLISHABLE_KEY"];
}
export function testSecretKey() {
    return process.env["SUPABASE_SERVICE_ROLE_KEY"];
}
export function supabaseTestUrl() {
    return process.env["SUPABASE_URL"];
}

export function hasSupabaseLiveTestCredentials() {
    return Boolean(supabaseTestUrl() && testPublishableKey() && testSecretKey());
}

export function isModernSupabaseApiKey(value: string) {
    return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export function createSupabaseTestFetch(supabaseKey: string): typeof fetch {
    return (input, init) => {
        const headers = new Headers(
            typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );

        if (init?.headers) {
            new Headers(init.headers).forEach((value, key) => headers.set(key, value));
        }

        if (
            isModernSupabaseApiKey(supabaseKey) &&
            headers.get("Authorization") === `Bearer ${supabaseKey}`
        ) {
            headers.delete("Authorization");
        }

        headers.set("apikey", supabaseKey);
        return fetch(input, { ...init, headers });
    };
}
