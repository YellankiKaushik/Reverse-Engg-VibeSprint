# Production release verification

October 14, 2026 (Asia/Calcutta; checks began October 13). **PREVIEW VERIFIED — PRODUCTION RELEASE BLOCKED ON AUTH REDIRECTS AND EMAIL ACCEPTANCE.**

## Deployment and source

- Existing Vercel project: `reversepath-vibesprint`, `prj_McY3U5riuZN49HM72w9Bv7Ng0J1M`.
- Branch: `codex/production-stabilization`.
- Deployed source commit: `933385e999e6fc31b1b4e5b65bb264bb6a81ec10` — OpenRouter-only simplification plus origin-scoped short-lived Vercel OIDC test authentication.
- Preview: https://reversepath-vibesprint-4nqt9wyek-kaushik-yellanki-project.vercel.app.
- Deployment: `dpl_CQVGL2EX9JLDGeL2UpP7Jc4j32yd`, **READY**, Preview target, Node 24.
- Deployment was built from the freshly committed local source with the existing project's Preview variables, not the older GitHub branch contents. Remote `npm ci` and `npm run build:vercel` succeeded.
- Retained production/rollback baseline: `dpl_4EmetpCmuMdwZkxBDKrccNyVMds6`, https://reversepath-vibesprint-6jn9r9fiu-kaushik-yellanki-project.vercel.app, **READY**, still owns https://reversepath-vibesprint.vercel.app. The alias and baseline were rechecked after Preview tests and are unchanged.

This candidate was not promoted. The existing production deployment was not removed, overwritten, or claimed verified against the new acceptance criteria.

## Configuration

**PASS for the eight application variables in both Production and Preview.** Fresh authenticated CLI reads confirmed all names exist. Their values were compared privately: browser/server URLs and publishable keys match the new local Supabase configuration, server and OpenRouter keys match the verified local values, `OPENROUTER_MODEL_DEFAULT=openai/gpt-4.1-mini`, and `AI_PROVIDER_MODE=live`. No deleted-project references were found in either environment. No credential values were printed.

Supabase target remains Reverse Engineering, `usvopldwiwzlvoqawvcu`. OpenRouter is the only inference service, using its fixed official endpoint. The existing project's Node runtime is 24.x. Short-lived local Vercel OIDC authentication was injected only into requests to the exact Preview origin; Deployment Protection was not disabled or broadened.

**FAIL/BLOCKED for hosted Supabase confirmation redirects.** Disposable generated-link probes for both production and the exact Preview origin returned `http://localhost:3000` instead of the requested target. Signup is enabled, email authentication is enabled, and email confirmation is enabled. No Auth policy or security setting was changed.

## Automated and hosted results

| Check                                                      | Actual result                                                                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check:env`                                        | PASS                                                                                                                                |
| `npm run check:ai`                                         | PASS: actual OpenRouter authentication and structured-output catalog support; no inference during this check                        |
| `npm run typecheck`                                        | PASS                                                                                                                                |
| `npm run lint`                                             | PASS, zero errors; six existing Fast Refresh warnings                                                                               |
| `npm test` with real Supabase RLS gate                     | **53 passed, 1 optional live-smoke skip**                                                                                           |
| Local `npm run build:vercel`                               | PASS                                                                                                                                |
| Remote Preview install/build                               | PASS, Node 24; existing framework/dependency deprecation warnings only                                                              |
| `npm audit` locally and remote install audit               | Zero known vulnerabilities                                                                                                          |
| Hosted public/auth/demo/Golden Path/isolation run          | **11 passed, 1 unconfigured-auth-state skip**                                                                                       |
| Hosted controlled real Career planning/mobile scenario     | **1 passed**                                                                                                                        |
| Hosted quota test                                          | PASS: seeded 20 test-owned intake usage events, request denied with a clear limit message; zero new goals and zero inference events |
| Hosted client audit                                        | 11 fetched HTML/JavaScript files scanned; new project reference present; zero private credential findings or fetch failures         |
| Source and generated-client secret scan                    | Zero findings                                                                                                                       |
| Git history scan                                           | Zero current private credential matches, recognized secret-key patterns, or service-role JWT findings                               |
| Vercel runtime error logs for the tested deployment/window | Zero error records                                                                                                                  |
| Confirmation callback on deployed origins                  | BLOCKED by redirect configuration; generated-link probes establish the incorrect fallback                                           |
| Actual public signup/inbox delivery                        | BLOCKED/unverified: no authorized real disposable mailbox configured; no fabricated SMTP/inbox success                              |

The hosted Golden Path used actual password login with disposable verified accounts, goal creation, real OpenRouter analysis/generation, schema validation, new-database persistence, activation, action completion, progress after refresh, saved check-ins, rejected and accepted replans, logout/reauthentication, version refresh, and cross-user denial. The separate live scenario verified its saved graph and completed action in the database, refresh persistence, mobile layout without horizontal overflow, and zero browser runtime errors. `/demo` desktop/mobile behavior and prepared-data labelling passed separately.

Signup error-state browser checks use explicit mocked HTTP responses to verify understandable UI feedback; they are not email-delivery evidence. Existing confirmation-link tests were not misrepresented as hosted successes once the incorrect redirect fallback was confirmed.

## Real AI and cost

**PASS — OpenRouter `openai/gpt-4.1-mini`.** No live claim used substituted mock output.

- Golden Path: 6 successful schema-valid calls, 9,323 input tokens and 8,300 output tokens.
- Career/mobile: 2 successful schema-valid calls, 2,664 input tokens and 2,638 output tokens.
- Total newly authorized hosted inference: **8 calls, 11,987 input tokens, 10,938 output tokens**.
- Estimated catalog cost: **$0.0223**, using $0.40/million input and $1.60/million output. This is an estimate, not a provider billing statement; it is below the $2 limit.

Quota verification made no paid AI call. Test fixtures were deleted only by their own unique test-account IDs after verification. No remote schema migration, database reset, unrelated project operation, or bulk user-data deletion occurred.

## Security and limits

**PASS within the performed checks.** All user-data server functions declare `requireSupabaseAuth`; Supabase JWT validation and owner-scoped RLS remain intact. Gated tests cover cross-owner reads/writes, cross-parent ownership, prerequisite enforcement, transactional rollback, concurrency, and idempotency. Provider and server secrets stayed out of browser responses/assets and committed files; `.env` and private `.vercel` state remain ignored.

The eight-variable hosted configuration uses code defaults: **20 intake analyses and 10 plan generations/replans per user per 24 hours, independently per operation**. Optional `AI_DAILY_REQUEST_LIMIT` overrides the shared default; operation-specific controls override that. The intake default was directly verified on Preview. Responses default to 12,000 output tokens with zero provider retries and a 90-second attempt timeout. The earlier documentation's blanket 10/day statement was corrected to match these unchanged runtime defaults.

Supabase leaked-password protection remains the previously noted optional setting; it was not enabled or disabled automatically. No access-protection or email-confirmation policy was weakened.

## Exact blockers and manual actions

1. In the **new Supabase project**, open Authentication → URL Configuration. Set **Site URL** to `https://reversepath-vibesprint.vercel.app`, and allow that origin plus `https://reversepath-vibesprint-4nqt9wyek-kaushik-yellanki-project.vercel.app` in **Redirect URLs**. Retain needed localhost entries. Current generated confirmation links fall back to `http://localhost:3000`. These settings need explicit user action/approval; they were not changed by this release run.
2. Verify signup confirmation delivery to a mailbox you control, with an authorized disposable address. If Supabase's default sender cannot deliver to the intended recipient, configure supported SMTP manually or authorize that setup. Keep confirmation enabled. `E2E_SIGNUP_EMAIL_TEMPLATE` with `{runId}` may be set locally for the existing opt-in public signup test; actual inbox receipt must still be confirmed. No key/mailbox password should be pasted into chat.
3. After those acceptance checks pass, authorize continuation of release verification. Test the staged Production configuration/build before assigning the domain. Promoting a Preview can rebuild it with Production settings, so the rebuilt Production candidate must be verified rather than assuming the Preview test covers a different build.

Production promotion is withheld under the user's release-gate instructions. GitHub push/PR/merge are also withheld because Phase 7 is authorized **after release verification**. The verified source is committed locally. No force push or history rewrite occurred. A current PR description is prepared locally in `docs/REVERSEPATH_RELEASE_PR.md` for the later verified release.
