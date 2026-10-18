# Google OAuth callback investigation — October 18, 2026

**Latest owner evidence: MANUAL GOOGLE LOGIN PASS — EXISTING TEST ACCOUNT.** The owner completed Google account selection, reached Your plans, signed out, reauthenticated with the same account, and accessed New Objective on the latest Preview. Fresh redirect probes now retain that Preview's origin and `/auth`. Other accounts, cross-browser behavior, and Google-specific refresh persistence are not inferred from this result. See [the latest release verification](PRODUCTION_RELEASE_VERIFICATION.md) for the staged Production candidate and remaining gates.

The investigation below records the earlier state before that manual acceptance and redirect update; its Google/Preview blockers are historical.

## Verified diagnosis

The existing Supabase browser client uses the SDK's implicit flow with persistent local storage and automatic URL session detection. No separate PKCE exchange route is required for that configured flow. The client and AppShell were inspected; neither needed an architecture change.

On the earlier Preview, Google initiation returned HTTP 302 to `accounts.google.com`, with the correct provider callback `https://usvopldwiwzlvoqawvcu.supabase.co/auth/v1/callback`. Its requested Preview origin and `/auth` path are now accepted by Supabase. This supersedes the previous day's allowlist finding for that Preview.

A concrete application bug was reproduced on the earlier deployment: `/auth#error=access_denied&error_description=...` returned HTTP 200, displayed the sign-in form with zero alerts, and retained the callback error in the URL. The hook called only `getSession()`, which waits for SDK initialization but does not propagate its URL callback error. Thus a failed OAuth callback looked like an ordinary signed-out visit. The earlier Google button also exposed raw initiation error messages through a toast.

This explains the silent failure behavior. It does **not** prove why the reported user's particular Google account exchange failed. No authorized Google account/browser session was available to select an account or inspect its real return. Google authentication, identity creation/linking, and the provider-to-Supabase exchange remain unverified for both new and existing Google accounts.

## Targeted changes

- `src/lib/auth-callback.ts`: await SDK initialization, read the resulting session, report safe callback failures including an incomplete callback, and remove callback parameters after processing.
- `src/hooks/use-auth.ts`: wait for callback restoration before completing loading, preserve newer auth events over an older session snapshot, clear stale errors on a successful sign-in, and scrub processed callback parameters.
- `src/routes/auth.tsx`: return Google OAuth to `/auth` on the initiating origin, replace the sign-in history entry when navigating to the dashboard, show session-restoration status, and show safe persistent initiation errors.
- `tests/unit/auth-callback.test.ts` and `tests/e2e/oauth.spec.ts`: targeted callback, error, initiation, session, refresh, logout, and password-login regressions. Credential-bearing callback tests disable traces, screenshots, and video.

No keys, authentication policies, Google Cloud settings, OpenRouter settings, database schema, or branch structure changed.

## Flow acceptance

| Question                                          | Result                                                                                                                                                                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does Google account authentication succeed?       | **BLOCKED** — real provider initiation passes, account selection was not performed.                                                                                                                                                                             |
| Does Supabase complete the Google callback?       | **BLOCKED** — no real Google account exchange was available. A real Supabase session callback was independently verified.                                                                                                                                       |
| Does the return stay on Preview?                  | Earlier Preview origin and `/auth`: **PASS**. New Preview `/auth`: **BLOCKED**, Supabase currently falls back to Production.                                                                                                                                    |
| Does the browser receive/persist a valid session? | **PASS** for a genuine disposable Supabase session delivered through the implicit callback format, including SDK user validation and refresh. Google-specific issuance remains blocked.                                                                         |
| Does useAuth detect it?                           | **PASS** on the deployed Preview.                                                                                                                                                                                                                               |
| Does `/auth` navigate to the dashboard?           | **PASS** on the deployed Preview with a real Supabase session.                                                                                                                                                                                                  |
| Are callback errors hidden?                       | Reproduced before the fix; **PASS** after the fix for query/fragment errors, incomplete fragments, and codes without a verifier.                                                                                                                                |
| Does Vercel protection interfere?                 | Protection is enabled; unauthenticated access to the earlier Preview returns 302 to Vercel. Origin-scoped trusted-source access passes all hosted tests. A normal user's Vercel-cookie round trip through Google is still unverified; protection was preserved. |

## Validation performed

- Typecheck: PASS.
- Auth unit tests: **9 passed**. The first sandboxed run hit a Windows temporary-file rename restriction; the authorized rerun passed.
- Local browser regressions: **15 passed** across two targeted runs, including a genuine generated email-confirmation link, real session persistence, logout, password reauthentication, and cross-user denial. Generated-link acceptance does not establish inbox receipt. Signup error-state tests use intercepted responses and are not real email-delivery acceptance.
- Actual new Preview: **14 passed**, zero failures/skips. Includes real Google initiation, real Supabase callback session, refresh, logout, password login, protected-route denial, and cross-user protection. It does not include Google account selection or real Google callback acceptance.
- Local production-mode Vercel-target build and actual remote Preview build: PASS, Node.js 24. Remote dependency audit: zero vulnerabilities.
- Lint: zero errors, six existing Fast Refresh warnings.
- Source/build secret scan: zero findings across 183 source files and 42 client assets.
- Hosted browser scan: 20 assets, zero secret findings, expected Supabase project, zero page errors, failed requests, or server errors on the scanned public pages.
- Preview server error scan: zero records in the inspected 30-minute window.
- Additional live AI calls: zero; spend: $0.

## Deployment

- Preview: https://reversepath-vibesprint-1dl3py5y4-kaushik-yellanki-project.vercel.app
- Deployment: `dpl_GAj6YD5ppfSjwUy2Zg6eXgPyocx8`, READY, target Preview.
- Runtime source pushed to main: `bcd234503cc82de465615f45c5acad78cc97d05c`.
- Public Production remains https://reversepath-vibesprint.vercel.app at source `5ee686dc58aa1d4fc6bbfc959a6bc89280929736`.
- Preserved Production/rollback deployment: `dpl_4EmetpCmuMdwZkxBDKrccNyVMds6`.
- Git integration remains disconnected; the source push did not deploy Production. This report is a subsequent documentation-only main commit.

## Exact remaining actions

1. In the existing Supabase project's [Authentication → URL Configuration](https://supabase.com/dashboard/project/usvopldwiwzlvoqawvcu/auth/url-configuration), add these Redirect URLs, preserving Production, localhost, and the earlier working Preview entries:

    ```text
    https://reversepath-vibesprint-1dl3py5y4-kaushik-yellanki-project.vercel.app
    https://reversepath-vibesprint-1dl3py5y4-kaushik-yellanki-project.vercel.app/**
    ```

    The exact `/auth` target currently resolves to `https://reversepath-vibesprint.vercel.app` in a generated-link allowlist probe. Production `/auth` and the earlier Preview `/auth` retain their requested destinations. No authorized management token is configured, and the connected Supabase account exposes only an unrelated inactive project, so this setting could not be updated safely here.

2. Single manual Google acceptance test: open the new Preview in a Vercel-authorized browser, choose **Continue with Google**, select an authorized test account, verify **Your plans** appears on the same Preview, refresh, sign out, and repeat with an existing Google-linked test account (use a previously unused authorized account for the new-account case). If it fails, report only the visible safe error and whether the origin stayed on Preview; never share the callback URL, codes, tokens, or personal email.

Production readiness: **BLOCKED** until the new redirect is accepted, real Google account acceptance passes, and the previously outstanding real signup-email and production-release checks are completed. No Production deployment or promotion was attempted in this fix.

References: [Supabase Google implicit-flow behavior](https://supabase.com/docs/guides/auth/social-login/auth-google), [Supabase redirect allowlist](https://supabase.com/docs/guides/auth/redirect-urls). The changelog markdown endpoint could not be read by the web tool; current official auth documentation and the installed SDK source were inspected.
