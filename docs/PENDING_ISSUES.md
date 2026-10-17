# Pending issues

## Current release blockers — October 17, 2026

- **Production confirmation redirect: RESOLVED.** Fresh generated signup links retain `https://reversepath-vibesprint.vercel.app`. The old localhost fallback is no longer the current failure.
- **Preview confirmation redirects: BLOCKED.** Both the required old Preview (`reversepath-vibesprint-4nqt9wyek-kaushik-yellanki-project.vercel.app`) and the new verified candidate (`reversepath-vibesprint-m8pa5r4bg-kaushik-yellanki-project.vercel.app`) fall back to Production. Allow their exact origins in the existing Supabase project's Auth redirect allowlist.
- **EMAIL_DELIVERY_VERIFICATION: BLOCKED.** No authorized mailbox template or inbox access was available. The owner must register one disposable account, verify actual email receipt and its allowed destination, confirm it, and verify login/dashboard/logout/reauthentication. No real inbox delivery is claimed and confirmation was not disabled.
- **GitHub PR creation: BLOCKED by integration permissions.** Create-PR returned HTTP 403 `Resource not accessible by integration`. Git push succeeded. Grant PR-write access or create the prepared draft PR from `REVERSEPATH_RELEASE_PR.md`.
- **Production release/main finalization: WITHHELD by acceptance gates.** Keep the verified Preview and prior Production/rollback deployment. Do not merge or delete stabilization until signup acceptance and staged Production/public-domain verification pass. Main remains unchanged.

Fresh local results: 56 automated tests passed with one optional live-smoke skip; 14 browser tests passed with five skips; TypeScript, lint (six existing warnings), both builds, npm audit, and secret scans passed. The exact-source Preview passed its hosted suite, including real AI replanning. Details and the feature verification matrix are in [FINAL_PROJECT_COMPLETION.md](FINAL_PROJECT_COMPLETION.md) and [PRODUCTION_RELEASE_VERIFICATION.md](PRODUCTION_RELEASE_VERIFICATION.md).

**FUTURE IMPROVEMENTS:** Google OAuth configuration, uploads, redesign/new features, new providers, analytics/monitoring integrations, optional refactoring, licensing, and CI infrastructure remain deferred. Existing warnings are not release blockers. Export failure handling and duplicate strategy-key validation were fixed in this audit.

## Historical blockers and maintenance notes — October 14, 2026

The following records are historical. In particular, their claims about both hosted origins falling back to localhost and all changes being local-only have been superseded above.

- **BLOCKED: Supabase hosted confirmation redirects.** Generated signup links for both https://reversepath-vibesprint.vercel.app and the verified Preview origin resolve to http://localhost:3000. Set the new project's Auth Site URL to the production origin and explicitly allow production and the Preview URL in Redirect URLs, retaining required local entries. No Auth setting was changed automatically.
- **BLOCKED: real signup email acceptance.** Confirmation remains enabled. No authorized real disposable mailbox is configured and no actual inbox receipt has been verified. Keep the verified Preview; do not promote until the public signup acceptance criteria pass.
- **BLOCKED: Production and subsequent GitHub release.** The source is committed locally and Preview passes; user-required release gates prevent promotion and the post-release push/PR/merge steps.

Details and exact URLs are in [PRODUCTION_RELEASE_VERIFICATION.md](PRODUCTION_RELEASE_VERIFICATION.md). The prior maintenance notes below remain relevant where stated.

Updated October 13, 2026, after the OpenRouter-only cleanup.

1. **Real public signup/email delivery is not verified.** One opt-in test used a generated `example.com` address and Supabase rejected it with HTTP 400 `email_address_invalid`. This does not establish that a legitimate mailbox fails. The test now requires an authorized disposable `E2E_SIGNUP_EMAIL_TEMPLATE` containing `{runId}` and skips without it. No further signup email attempts were made. Generated real confirmation-link callbacks, login, logout, and refresh persistence pass; they do not verify inbox delivery. For public release acceptance, run the gate with a mailbox you control and confirm receipt manually. Do not disable confirmation or repeatedly resend.
2. **Existing warnings remain.** ESLint reports six Fast Refresh export warnings in unchanged UI primitives. TanStack reports existing `inputValidator` deprecations during builds. These do not fail lint, TypeScript, either production build, or browser acceptance. They are deferred to avoid expanding this provider/configuration refactor.
3. **Server cancellation diagnostics.** Node/h3 logs request-aborted errors when browser navigations cancel outstanding requests or the test server stops. The built Node server still passed its complete mock Golden Path and six browser checks. No functional failure was observed from these cancellations; reduce diagnostic noise in a separate maintenance task if needed.
4. **Supabase leaked-password protection remains disabled.** This existing Auth setting was observed in the preceding backend verification. No database/Auth settings were changed during the cleanup. See [Supabase password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) if enabling it in the project is desired.
5. **Local retired test credentials were preserved.** Existing `SUPABASE_TEST_*_KEY` values remain in the ignored `.env` to honor the instruction not to remove/overwrite manually configured credentials. Tests and the app do not read them. They are not needed for new contributor setup or Vercel; remove them manually if desired. Any inherited `OPENAI_API_KEY` is also ignored by the OpenRouter-only gateway.

Vercel variables, deployment, production promotion, and GitHub push are intentionally deferred to the user's next instruction. Use only [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) for the manual environment setup.
