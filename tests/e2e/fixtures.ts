import { test as base, expect } from "@playwright/test";

// Protection credentials are sent only to the selected deployment origin.
export const test = base.extend({
    page: async ({ page, baseURL }, runFixture, testInfo) => {
        const token = process.env["VERCEL_AUTOMATION_BYPASS_SECRET"];
        const oidc = process.env["VERCEL_OIDC_TOKEN"];
        const share = process.env["VERCEL_DEPLOYMENT_SHARE_TOKEN"];
        if (share && baseURL) {
            if (testInfo.project.use.trace !== "off") {
                throw new Error("Confidential staged testing requires --trace off.");
            }
            const origin = new URL(baseURL).origin;
            if (
                origin !==
                "https://reversepath-vibesprint-h3nzus71j-kaushik-yellanki-project.vercel.app"
            ) {
                throw new Error(
                    "Temporary access is restricted to the approved staged deployment.",
                );
            }
            const access = new URL("/auth", origin);
            access.searchParams.set("_vercel_share", share);
            try {
                await page.goto(access.href);
                // The share URL sets a host-scoped cookie. Never retain its
                // confidential query in navigation, traces, or test reports.
                // Leave /auth so a test's /auth#tokens arrival creates a new
                // document and SDK instance, as a real OAuth return does.
                await page.goto(new URL("/demo", origin).href);
            } catch {
                throw new Error("Temporary staged access failed (confidential URL withheld).");
            }
            if (new URL(page.url()).origin !== origin) {
                throw new Error("Temporary staged access did not reach the approved application.");
            }
        } else if ((token || oidc) && baseURL) {
            const origin = new URL(baseURL).origin;
            await page.route(
                (url) => url.origin === origin,
                (route) =>
                    route.continue({
                        headers: {
                            ...route.request().headers(),
                            ...(token
                                ? {
                                      "x-vercel-protection-bypass": token,
                                      "x-vercel-set-bypass-cookie": "true",
                                  }
                                : { "x-vercel-trusted-oidc-idp-token": oidc! }),
                        },
                    }),
            );
        }
        await runFixture(page);
    },
});
export { expect };
