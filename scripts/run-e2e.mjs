import { spawn } from "node:child_process";
import { loadEnv } from "vite";

function loadProjectEnv() {
    const mode = process.env.MODE ?? process.env.NODE_ENV ?? "test";
    const env = loadEnv(mode, process.cwd(), "");
    for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
    }
}

loadProjectEnv();

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

function spawnNode(args, options = {}) {
    return spawn(process.execPath, args, {
        stdio: "inherit",
        shell: false,
        ...options,
    });
}

async function waitForServer(url, timeoutMs = 120_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
            if (response.ok) return;
        } catch {
            /* The server may still be starting. */
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(`Timed out waiting for ${url}`);
}

async function run() {
    const ownsServer = !process.env.PLAYWRIGHT_BASE_URL;
    const runGolden = process.env.RUN_E2E_GOLDEN === "true";

    const serverEnv = {
        ...process.env,
        AI_PROVIDER_MODE: process.env.AI_PROVIDER_MODE ?? "mock",
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54321",
        VITE_SUPABASE_PUBLISHABLE_KEY:
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "test-publishable-key",
        SUPABASE_URL: process.env.SUPABASE_URL ?? "http://127.0.0.1:54321",
        SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ?? "test-publishable-key",
    };

    const server = ownsServer
        ? spawnNode(
              [
                  "./node_modules/vite/bin/vite.js",
                  "dev",
                  "--host",
                  "127.0.0.1",
                  "--port",
                  String(port),
              ],
              {
                  env: serverEnv,
              },
          )
        : null;

    try {
        if (server) await waitForServer(baseURL);
        const args = ["./node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)];
        const testProcess = spawnNode(args, {
            env: { ...process.env, PLAYWRIGHT_BASE_URL: baseURL },
        });
        const code = await new Promise((resolve) => testProcess.on("exit", resolve));
        process.exitCode = typeof code === "number" ? code : 1;
    } finally {
        if (server && !server.killed) {
            server.kill("SIGINT");
        }
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
