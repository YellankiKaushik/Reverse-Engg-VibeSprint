import { loadEnv } from "vite";
import { existsSync, readFileSync } from "node:fs";

const env = loadEnv("production", process.cwd(), "");
const required = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
];
const errors = required.filter((name) => !env[name]?.trim()).map((name) => `${name} is missing`);
const mode = env.AI_PROVIDER_MODE || "mock";
if (!["mock", "live"].includes(mode)) errors.push("AI_PROVIDER_MODE must be mock or live");
if (env.VITE_AUTH_PROVIDER && env.VITE_AUTH_PROVIDER !== "supabase")
    errors.push("VITE_AUTH_PROVIDER must be supabase (or unset)");
if (mode === "live") {
    for (const name of ["OPENROUTER_API_KEY", "OPENROUTER_MODEL_DEFAULT"])
        if (!env[name]?.trim()) errors.push(`${name} is required for live AI`);
    if (env.OPENROUTER_ENABLED === "false") errors.push("OPENROUTER_ENABLED disables live AI");
}
for (const file of [".env", ".env.local", ".env.production", ".env.production.local"]) {
    if (!existsSync(file)) continue;
    const seen = new Set();
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        const name = line.match(/^\s*(?:export\s+)?([\w]+)\s*=/)?.[1];
        if (!name) continue;
        if (seen.has(name)) errors.push(`${file}: duplicate assignment for ${name}`);
        seen.add(name);
    }
}
for (const name of ["VITE_SUPABASE_URL", "SUPABASE_URL", "PUBLIC_APP_URL"]) {
    if (!env[name]) continue;
    try {
        if (!["https:", "http:"].includes(new URL(env[name]).protocol)) throw new Error();
    } catch {
        errors.push(`${name} must be an HTTP(S) URL`);
    }
}
if (env.VITE_SUPABASE_URL && env.SUPABASE_URL && env.VITE_SUPABASE_URL !== env.SUPABASE_URL)
    errors.push("Browser and server Supabase URLs must match");
if (
    env.VITE_SUPABASE_PUBLISHABLE_KEY &&
    env.SUPABASE_PUBLISHABLE_KEY &&
    env.VITE_SUPABASE_PUBLISHABLE_KEY !== env.SUPABASE_PUBLISHABLE_KEY
)
    errors.push("Browser and server publishable keys must match");
for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith("VITE_") || !value) continue;
    let secret =
        value.startsWith("sb_secret_") ||
        /(?:API_KEY|SERVICE_ROLE|SECRET|PASSWORD|TOKEN)/i.test(name);
    try {
        if (value.split(".").length === 3)
            secret ||=
                JSON.parse(Buffer.from(value.split(".")[1], "base64url").toString()).role ===
                "service_role";
    } catch {
        /* Non-JWT public values are valid. */
    }
    if (secret) errors.push(`${name} appears to expose a private credential to the browser`);
}
for (const name of ["VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY"]) {
    const key = env[name];
    if (key?.startsWith("sb_secret_")) errors.push(`${name} must be a public publishable key`);
    try {
        const claims = JSON.parse(Buffer.from(key?.split(".")[1] || "", "base64url"));
        if (claims.role !== "anon") errors.push(`${name} must have the anon role`);
        if (claims.ref !== new URL(env.SUPABASE_URL).hostname.split(".")[0])
            errors.push(`${name} identifies a different Supabase project`);
    } catch {
        /* Modern publishable keys are opaque; live connectivity verifies them. */
    }
}
const obsoleteNames = Object.keys(env).filter((name) =>
    /^(GEMINI_|GROQ_|OPENAI_|LOVABLE_|AI_ROUTE_|AI_PROVIDER_ALLOWLIST$|SUPABASE_TEST_|VITE_SUPABASE_PROJECT_ID$|OBJECT_STORAGE_PROVIDER$)/.test(
        name,
    ),
);
if (obsoleteNames.length)
    console.log(`Ignored legacy settings (not needed): ${obsoleteNames.join(", ")}`);
console.log(`AI provider: OpenRouter; mode: ${mode}`);
if (mode === "mock") console.log("Mock AI is enabled: no live generation is claimed.");
if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
} else
    console.log(
        "Environment names and public credential checks passed. Run authenticated tests to verify connectivity; live AI also requires model compatibility validation.",
    );
