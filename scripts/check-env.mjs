import { loadEnv } from "vite";

const env = loadEnv("production", process.cwd(), "");
const required = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
];
const errors = required.filter((name) => !env[name]?.trim()).map((name) => `${name} is missing`);
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
console.log(`AI mode: ${env.AI_PROVIDER_MODE || "live"}`);
if (env.AI_PROVIDER_MODE === "mock")
    console.log("Mock AI is enabled: no live generation is claimed.");
if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
} else
    console.log(
        "Supabase environment names and public credential checks passed. Run authenticated tests to verify connectivity.",
    );
