import { chromium } from "@playwright/test";
import { loadEnv } from "vite";
import { mkdirSync, writeFileSync } from "node:fs";

const origin = new URL(process.argv[2]).origin;
if (!/^https:\/\/reversepath-vibesprint(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin))
    throw new Error("Choose an existing ReversePath deployment.");
const env = { ...loadEnv("test", process.cwd(), ""), ...process.env };
const secrets = Object.entries(env)
    .filter(
        ([name, value]) =>
            /API_KEY|SERVICE_ROLE_KEY|SECRET_KEY/.test(name) &&
            !name.startsWith("VITE_") &&
            value.length > 16,
    )
    .map(([, value]) => value);
const report = {
    origin,
    assets: 0,
    findings: 0,
    correctProject: false,
    pageErrors: [],
    failedRequests: [],
    serverErrors: [],
};
const browser = await chromium.launch();
try {
    const page = await browser.newPage();
    if (env.VERCEL_OIDC_TOKEN)
        await page.route(
            (url) => url.origin === origin,
            (route) =>
                route.continue({
                    headers: {
                        ...route.request().headers(),
                        "x-vercel-trusted-oidc-idp-token": env.VERCEL_OIDC_TOKEN,
                    },
                }),
        );
    page.on("pageerror", (error) => report.pageErrors.push(error.name));
    page.on("requestfailed", (request) => {
        if (!request.failure()?.errorText.includes("ERR_ABORTED"))
            report.failedRequests.push(new URL(request.url()).pathname);
    });
    const pending = [];
    const inspected = new Set();
    page.on("response", (response) => {
        const url = new URL(response.url());
        if (url.origin !== origin) return;
        if (response.status() >= 500)
            report.serverErrors.push({ path: url.pathname, status: response.status() });
        if (
            inspected.has(url.pathname) ||
            !/javascript|text\/html/.test(response.headers()["content-type"] ?? "")
        )
            return;
        inspected.add(url.pathname);
        pending.push(
            response
                .text()
                .then((content) => {
                    report.assets++;
                    if (
                        secrets.some((secret) => content.includes(secret)) ||
                        /sb_secret_[A-Za-z0-9_-]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{32,}/.test(content)
                    )
                        report.findings++;
                    if (content.includes("usvopldwiwzlvoqawvcu")) report.correctProject = true;
                    for (const match of content.matchAll(
                        /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
                    )) {
                        try {
                            if (
                                JSON.parse(Buffer.from(match[0].split(".")[1], "base64url"))
                                    .role === "service_role"
                            )
                                report.findings++;
                        } catch {
                            /* Not a JWT. */
                        }
                    }
                })
                .catch(() => {
                    report.failedRequests.push(url.pathname);
                }),
        );
    });
    mkdirSync("logs/final-qa", { recursive: true });
    for (const path of ["/", "/auth", "/demo"]) {
        const response = await page.goto(origin + path);
        if (!response?.ok()) throw new Error("Public route did not return success");
        await page.waitForLoadState("networkidle");
    }
    await page.getByRole("button", { name: "Load prepared plan" }).click();
    await page.screenshot({ path: "logs/final-qa/demo-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: "logs/final-qa/demo-mobile.png", fullPage: true });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error("Mobile horizontal overflow");
    await Promise.all(pending);
    writeFileSync("logs/final-qa/hosted-client-audit.json", JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (
        report.findings ||
        !report.correctProject ||
        report.pageErrors.length ||
        report.failedRequests.length ||
        report.serverErrors.length
    )
        process.exitCode = 1;
} finally {
    await browser.close();
}
