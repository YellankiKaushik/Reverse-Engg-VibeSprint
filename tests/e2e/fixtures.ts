import { test as base, expect } from "@playwright/test";

// Protection credentials are sent only to the selected deployment origin.
export const test = base.extend({
    page: async ({ page, baseURL }, runFixture) => {
        const token = process.env["VERCEL_AUTOMATION_BYPASS_SECRET"];
        if (token && baseURL) {
            const origin = new URL(baseURL).origin;
            await page.route(
                (url) => url.origin === origin,
                (route) =>
                    route.continue({
                        headers: {
                            ...route.request().headers(),
                            "x-vercel-protection-bypass": token,
                            "x-vercel-set-bypass-cookie": "true",
                        },
                    }),
            );
        }
        await runFixture(page);
    },
});
export { expect };
