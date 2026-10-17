import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const env = { ...loadEnv("test", process.cwd(), ""), ...process.env };
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseFetch = (input, init) => {
    const headers = new Headers(init?.headers);
    if (key?.startsWith("sb_secret_") && headers.get("Authorization") === `Bearer ${key}`)
        headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
};
const admin = createClient(env.SUPABASE_URL, key, {
    global: { fetch: supabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false },
});
const report = {
    date: new Date().toISOString(),
    project: new URL(env.SUPABASE_URL).hostname.split(".")[0],
    redirects: [],
    mailboxConfigured: Boolean(env.E2E_SIGNUP_EMAIL_TEMPLATE?.includes("{runId}")),
    emailDelivery: "BLOCKED: no authorized inbox has been inspected",
};
for (const origin of [
    "https://reversepath-vibesprint.vercel.app",
    "https://reversepath-vibesprint-4nqt9wyek-kaushik-yellanki-project.vercel.app",
    "http://127.0.0.1:4173",
    ...process.argv.slice(2),
]) {
    if (
        !/^https:\/\/reversepath-vibesprint(?:-[a-z0-9-]+)?\.vercel\.app$|^http:\/\/127\.0\.0\.1:4173$/.test(
            origin,
        )
    )
        throw new Error("Unexpected confirmation redirect test target");
    let id;
    try {
        const result = await admin.auth.admin.generateLink({
            type: "signup",
            email: `reversepath-final-redirect-${crypto.randomUUID()}@example.com`,
            password: `ReversePath-${crypto.randomUUID()}!`,
            options: { redirectTo: origin },
        });
        id = result.data.user?.id;
        if (result.error) throw new Error(`Auth API returned ${result.error.status}`);
        const actual = new URL(result.data.properties.action_link).searchParams.get("redirect_to");
        report.redirects.push({ requested: origin, actual, passed: actual === origin });
    } catch (error) {
        report.redirects.push({ requested: origin, passed: false, error: error.message });
    } finally {
        if (id) {
            const removed = await admin.auth.admin.deleteUser(id);
            if (removed.error) throw new Error("Disposable redirect account cleanup failed");
        }
    }
}
const secrets = Object.entries(env)
    .filter(
        ([name, value]) =>
            /API_KEY|SERVICE_ROLE_KEY|SECRET_KEY/.test(name) &&
            !name.startsWith("VITE_") &&
            value.length > 16,
    )
    .map(([, value]) => value);
const commits = execFileSync("git", ["rev-list", "--all"], { encoding: "utf8" })
    .trim()
    .split(/\s+/);
let findings = 0;
for (const commit of commits) {
    const content = execFileSync("git", ["show", "--format=", "--no-ext-diff", commit], {
        encoding: "utf8",
        maxBuffer: 30 * 1024 * 1024,
    });
    if (
        secrets.some((secret) => content.includes(secret)) ||
        /sb_secret_[A-Za-z0-9_-]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{32,}/.test(content)
    )
        findings++;
    for (const match of content.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
        try {
            if (
                JSON.parse(Buffer.from(match[0].split(".")[1], "base64url")).role === "service_role"
            )
                findings++;
        } catch {
            /* Not a JWT payload. */
        }
    }
}
report.history = { commitsScanned: commits.length, findings };
mkdirSync("logs/final-qa", { recursive: true });
writeFileSync("logs/final-qa/redirect-history.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (findings || report.redirects.some((r) => !r.passed)) process.exitCode = 1;
