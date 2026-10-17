import { spawn } from "node:child_process";

// Invoke through `vercel env run --environment=development -- node ...`.
// Vercel provides short-lived authentication in memory; never print or save it.
const target = new URL(process.argv[2]);
if (
    target.protocol !== "https:" ||
    !target.hostname.startsWith("reversepath-vibesprint-") ||
    !target.hostname.endsWith(".vercel.app")
)
    throw new Error("Choose a deployment of the existing ReversePath project.");
if (!process.env.VERCEL_OIDC_TOKEN)
    throw new Error("Short-lived Vercel authentication is required.");
const child = spawn(process.execPath, ["scripts/run-e2e.mjs", ...process.argv.slice(3)], {
    stdio: "inherit",
    env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: target.origin,
        AI_PROVIDER_MODE: "live",
        RUN_E2E_GOLDEN: "true",
    },
    shell: false,
});
child.on("exit", (code) => {
    process.exitCode = code ?? 1;
});
child.on("error", () => {
    console.error("Hosted QA process could not start.");
    process.exitCode = 1;
});
