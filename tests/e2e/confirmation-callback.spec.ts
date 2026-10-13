import { createClient } from "@supabase/supabase-js";
import { expect, test } from "./fixtures";
import {
    createSupabaseTestFetch,
    loadProjectEnv,
    supabaseTestUrl,
    testSecretKey,
    hasSupabaseLiveTestCredentials,
} from "../helpers/test-env";
loadProjectEnv();
test("real confirmation link restores a session and supports password reauthentication", async ({
    page,
    baseURL,
}) => {
    test.skip(
        process.env["RUN_E2E_GOLDEN"] !== "true" || !hasSupabaseLiveTestCredentials(),
        "Requires disposable Supabase account and allowed callback origin.",
    );
    test.setTimeout(60_000);
    const key = testSecretKey()!;
    const admin = createClient(supabaseTestUrl()!, key, {
        global: { fetch: createSupabaseTestFetch(key) },
        auth: { persistSession: false },
    });
    const email = `reversepath-confirm-${crypto.randomUUID()}@example.com`;
    const password = "ReversePath-confirm-test-12345";
    const link = await admin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: { redirectTo: new URL(baseURL!).origin },
    });
    expect(link.error).toBeNull();
    const userId = link.data.user!.id;
    try {
        await page.goto("/auth?x-vercel-set-bypass-cookie=true");
        // This verifies the genuine email-confirmation URL without SMTP delivery.
        await page.goto(link.data.properties!.action_link).catch(() => {
            throw new Error("Confirmation callback navigation failed (URL withheld)");
        });
        await expect(page.getByRole("heading", { name: /your plans/i })).toBeVisible({
            timeout: 30_000,
        });
        expect(
            Boolean((await admin.auth.admin.getUserById(userId)).data.user?.email_confirmed_at),
        ).toBe(true);
        await page.reload();
        await expect(page.getByRole("heading", { name: /your plans/i })).toBeVisible();
        await page.getByRole("button", { name: /sign out/i }).click();
        await expect(page.getByRole("heading", { name: /sign in to reversepath/i })).toBeVisible();
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").fill(password);
        await page.getByRole("button", { name: /^sign in$/i }).click();
        await expect(page.getByRole("heading", { name: /your plans/i })).toBeVisible();
    } finally {
        await admin.auth.admin.deleteUser(userId);
    }
});
