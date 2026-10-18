# Production release verification

## Latest release verification — October 18, 2026

**PRODUCTION CANDIDATE READY — PUBLIC PROMOTION BLOCKED BY REMAINING ACCEPTANCE GATES.** This section supersedes the historical reports below.

### Application acceptance

| Area                       | Status and verified scope                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                   | **PASS on latest Preview** — routes, dashboard, navigation, desktop/mobile workspace, demo, account settings, export, and error handling.                                                                                                                                                                                                                                                                           |
| Backend                    | **PASS** — live Supabase persistence, authenticated server functions, ownership/RLS tests, transaction and concurrency tests.                                                                                                                                                                                                                                                                                       |
| Google OAuth               | **MANUAL GOOGLE LOGIN PASS — EXISTING TEST ACCOUNT**, reported directly by the owner on the latest Preview: account selection → Your plans → sign out → same-account reauthentication → New Objective. Other accounts, cross-browser behavior, Google-specific refresh, staged Google login, and public Production Google login are not inferred from this evidence. Real automated initiation also reaches Google. |
| Email signup               | **EMAIL_DELIVERY_ACCEPTANCE BLOCKED** — signup UI/error handling and genuine generated confirmation-link verification pass, but no authorized inbox or mailbox template is available. No SMTP delivery or actual inbox receipt was verified. The opt-in real signup test remains skipped.                                                                                                                           |
| Session/JWT                | **PASS on Preview** — genuine Supabase URL-session processing, user validation, dashboard navigation, password authentication, refresh persistence, SDK refresh, invalid/expired refresh handling, logout, and reauthentication. Callback errors are safely displayed and processed parameters are removed.                                                                                                         |
| OpenRouter AI              | **PASS on Preview** — real `openai/gpt-4.1-mini`, eight successful/schema-valid calls with no mock fallback.                                                                                                                                                                                                                                                                                                        |
| Plan persistence/execution | **PASS on Preview** — objective analysis, structured graph generation, save/activation, strategy switching, action start/completion, progress update, and refresh persistence.                                                                                                                                                                                                                                      |
| Replanning                 | **PASS on Preview** — check-ins, changed context, real proposed revisions, reject and accept flows, retained version history.                                                                                                                                                                                                                                                                                       |
| Mobile                     | **PASS on Preview** — 390px workspace/demo and complete live Learning journey, persisted graph/action completion, no horizontal overflow or page errors in that scenario.                                                                                                                                                                                                                                           |
| Protected account data     | **PASS** — two-user database tests and hosted cross-user plan denial; no private owner content displayed.                                                                                                                                                                                                                                                                                                           |

### Test results and limits

| Run/check                                          |       Passed | Failed | Skipped / limit                                                                                                                       |
| -------------------------------------------------- | -----------: | -----: | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` with `RUN_SUPABASE_RLS_TESTS=true`      |           60 |      0 | 1 optional paid live-AI smoke test; 17 test files passed, one skipped                                                                 |
| Full local `npm run test:e2e`                      |           20 |      0 | 5: unconfigured-auth environment, three optional real-AI scenarios, real signup without authorized mailbox; planning was mock locally |
| Initial full hosted Preview suite                  |           19 |      1 | 5 gated skips; failure was the confirmation harness reaching Vercel login before the app                                              |
| Targeted corrected confirmation test               |            1 |      0 | 0; genuine Supabase verification plus explicitly followed callback, no email delivery claim                                           |
| Corrected hosted non-AI suite                      |           19 |      0 | 5 gated skips; already-passed paid golden journey excluded, not counted as a new pass or skip                                         |
| Hosted real-AI golden journey                      |            1 |      0 | 0; included in the initial hosted run, not repeated after the test-only correction                                                    |
| Separate hosted mobile Learning journey            |            1 |      0 | 0; enabled only this optional scenario                                                                                                |
| Public retained Production baseline browser checks |            5 |      0 | 0; landing, guard, generated confirmation/password reauth, demo persistence, mobile demo; older release only                          |
| Staged Production browser suite                    |            — |      — | **BLOCKED before running**, OIDC access returns HTTP 403 `TRUSTED_SOURCES_ENVIRONMENT_MISMATCH`                                       |
| Staged authenticated HTTP asset checks             | 20 responses |      0 | All HTTP 200; HTML and referenced JavaScript, not browser acceptance                                                                  |

The corrected hosted suite plus the successful live golden journey cover the full currently enabled browser scope across runs. The separate mobile Learning test adds live mobile coverage. The optional unconfigured-auth case requires a deliberately empty configuration; the latest authenticated target is configured. Career and Startup scenarios were not enabled. The Learning scenario was skipped in the broad suite and passed separately. Skips are not passes.

The confirmation failure was a test-harness limitation: Playwright routes only the first URL of a redirect chain, so the Preview-only OIDC header was absent after the cross-origin Supabase verification redirect. The corrected test follows the real Supabase verification endpoint without forwarding Vercel credentials, checks that its destination retains the intended app origin, and then opens that returned URL through the existing app-origin-only fixture. No response is mocked and the real disposable account is confirmed. Credential-bearing artifacts are disabled. This verifies Supabase confirmation and app session restoration, **not** a native browser's Vercel-cookie redirect round trip or inbox receipt. See the installed Playwright API types / [page.route documentation](https://playwright.dev/docs/api/class-page#page-route).

Additional required commands all pass: `npm run check:env`, `npm run check:ai`, `npm run typecheck`, `npm run lint` (zero errors, six existing Fast Refresh warnings), `npm run build:vercel`, `npm audit` (zero vulnerabilities), and `node scripts/scan-secrets.mjs` (zero findings). Local `check:env` correctly reports mock mode; the separate isolated check of actual Production variables reports live mode. Builds retain existing TanStack validator deprecation warnings. Local development-server request-aborted diagnostics occurred when test navigation cancelled requests; hosted error scans below found no records.

### Live inference budget

The golden journey used six schema-valid calls: 9,006 input and 8,533 output tokens. Mobile Learning used two schema-valid calls: 2,667 input and 3,028 output tokens. Total newly incurred verification: **8 calls, 11,673 input tokens, 11,561 output tokens**.

The live OpenRouter catalog reported $0.0000004/input token and $0.0000016/output token for `openai/gpt-4.1-mini`. Estimated total: **$0.0231668**, below $2. This estimate excludes billing adjustments and is not an invoice. No additional paid smoke test or repeated golden journey was run.

### Production configuration and deployment identity

The existing Vercel project remains `prj_McY3U5riuZN49HM72w9Bv7Ng0J1M`, team `team_UYEpjjRaObtrYF55SYu5rqUl`, Node.js 24. The eight required variables are scoped to shared Preview and Production without a branch override:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
OPENROUTER_MODEL_DEFAULT
AI_PROVIDER_MODE
```

Actual Production values were injected into a child process from a clean linked directory, avoiding local `.env` precedence. Private validation confirmed matching browser/server Supabase URLs and publishable keys; intended NEW project `usvopldwiwzlvoqawvcu`; private credentials matching the verified local configuration; no secret key in public-key variables; `AI_PROVIDER_MODE=live`; model `openai/gpt-4.1-mini`. Values and secret-bearing env files were not printed or written. The Production-configured local build, OpenRouter key/catalog check without inference, and remote Production build all passed.

| Deployment role                        | Identity                                                                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latest manually verified Preview       | https://reversepath-vibesprint-1dl3py5y4-kaushik-yellanki-project.vercel.app — `dpl_GAj6YD5ppfSjwUy2Zg6eXgPyocx8`, source `bcd234503cc82de465615f45c5acad78cc97d05c`                  |
| Staged Production candidate            | https://reversepath-vibesprint-h3nzus71j-kaushik-yellanki-project.vercel.app — **READY**, `dpl_7st1sGRtjza4EbR245Z7S3uty6qi`, source `80a4be968fd059c9dd55f7575612c5b5f04e16af`, main |
| Current public Production              | https://reversepath-vibesprint.vercel.app — **READY, retained older release**, source `5ee686dc58aa1d4fc6bbfc959a6bc89280929736`                                                      |
| Public deployment / preserved rollback | `dpl_4EmetpCmuMdwZkxBDKrccNyVMds6` — https://reversepath-vibesprint-6jn9r9fiu-kaushik-yellanki-project.vercel.app                                                                     |

The candidate was created under the new explicit staging authorization with `vercel deploy --prod --skip-domain`. [Vercel documents that this prevents automatic Production-domain promotion](https://vercel.com/docs/cli/deploy#skip-domain). After staging, an explicit lookup of `reversepath-vibesprint.vercel.app` still returns `dpl_4EmetpCmuMdwZkxBDKrccNyVMds6`; its prior source is preserved. No promotion or rollback was executed. The earlier automatic-review rejection of staging is historical; this newly authorized staged build succeeded.

Preview and staged candidate contain identical application source, dependency lockfile, and build/deployment configuration. The difference at candidate source `80a4be9` is documentation. Subsequent finalization changes affect only the confirmation test harness and documentation, so a new runtime build was not required for those edits. No application architecture, keys, provider, database, or authentication policies changed. No new branches or PRs were created. Final main synchronization and clean-tree verification are performed after committing this report; the resulting commit is reported in the release response.

### Redirects, protection, and security

Fresh generated-link probes retain the exact latest Preview origin and `/auth`, the Production origin and `/auth`, and `http://127.0.0.1:4173`. The retired `4nqt9wyek` Preview still falls back to Production; it is not the current release candidate and is not a blocker for the working Preview. The temporary staged hostname's `/auth` currently falls back to Production and is not accepted for staged callback testing.

Deployment Protection is preserved. Staged browser preflight with the existing development OIDC identity returns 403 `TRUSTED_SOURCES_ENVIRONMENT_MISMATCH`. Standard authorized `vercel curl` HTTP access works and was used only for HTML/JavaScript checks. Automatic approval review rejected the separate tool that would create a deployment share link: it grants authentication-bypassing access for up to 23 hours without explicit approval. No such link was created, and no credential was extracted or forwarded into a staged browser as a workaround. Staged browser acceptance remains blocked.

Security results:

- Source/generated-client/history secret scans: zero findings; 26 historical commits inspected before final report commit.
- Preview browser audit: 20 assets, correct Supabase project, zero secret findings/page errors/failed requests/server errors on the inspected public pages.
- Staged authenticated HTTP audit: 20 HTML/JavaScript responses, all 200, correct Supabase project, zero secret findings/request failures. No staged browser/session success is inferred.
- Deployment-scoped runtime queries: zero error records for each of Preview, staged candidate, and retained public baseline in the inspected 30-minute window, bounded to 100 records each. This is not exhaustive monitoring or long-term retention evidence.
- All newly generated test accounts from this final attempt were removed. Two older synthetic fixtures dated September 7 were observed and left untouched; real accounts were not modified.

### Consolidated remaining actions

1. **Real email acceptance:** once, create a new account on the latest working Preview using an inbox you control. Confirm actual receipt and open its link; verify it returns to the same Preview and permits login. Report the result, without sending email contents, credentials, or callback URLs. No repeated confirmation requests or SMTP changes are needed.
2. **Staged browser access:** approve a deployment-specific temporary share link for `dpl_7st1sGRtjza4EbR245Z7S3uty6qi` so authenticated browser acceptance can run. The tool's new links last up to 23 hours. Keep Deployment Protection enabled. This approval was not inferred from permission to create the staged build.
3. **Staged callback allowlist:** for OAuth/confirmation testing on the temporary staged hostname, add these two entries in the existing [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/usvopldwiwzlvoqawvcu/auth/url-configuration), preserving the working Production, Preview, and localhost entries:

    ```text
    https://reversepath-vibesprint-h3nzus71j-kaushik-yellanki-project.vercel.app
    https://reversepath-vibesprint-h3nzus71j-kaushik-yellanki-project.vercel.app/**
    ```

    The connected Supabase account exposes only an unrelated inactive project and no management token is configured. No working Google credentials need to be recreated. The final public Production redirect already passes.

After these acceptance gates pass, test the staged browser journey, promote that tested Production candidate to the existing public domain, and verify the new public release and Google login there. Those steps have **not** been claimed as complete. The owner-reported Google result applies only to the latest Preview and existing test account. **REVERSEPATH remains release-blocked; the new code is not yet serving public Production.**

## Historical release records

The sections below describe older attempts and are superseded by the current evidence above.

> **GitHub status update:** Subsequent explicit GitHub-only authorization permitted [PR #1](https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint/pull/1) to be normally merged into main and the preserved stabilization branch to be removed. [GITHUB_FINALIZATION_REPORT.md](GITHUB_FINALIZATION_REPORT.md) supersedes this report's earlier GitHub-access/merge blockers. No automatic deployment path was configured and Production remains unchanged. Signup and Production acceptance gates below still apply.

## Current verification — October 17, 2026

**PRODUCTION RELEASE BLOCKED — APPLICATION PREVIEW VERIFIED; SIGNUP ACCEPTANCE REMAINS OPEN.**

- Candidate: `e77ad37a5c3b910fe23f3090dac0f4079419af19`, pushed on `codex/production-stabilization`.
- Fresh Preview: https://reversepath-vibesprint-m8pa5r4bg-kaushik-yellanki-project.vercel.app, `dpl_7wig7xrzUDR8dVmdggHw2QpbarkH`, READY, Node 24. Vercel deployment metadata confirms the candidate SHA and branch.
- Production/rollback remains `dpl_4EmetpCmuMdwZkxBDKrccNyVMds6`, source `5ee686dc58aa1d4fc6bbfc959a6bc89280929736`; public domain https://reversepath-vibesprint.vercel.app. No promotion occurred. The separately authorized GitHub merge is recorded in `GITHUB_FINALIZATION_REPORT.md`.
- Production confirmation redirect now passes. The old required Preview and the new candidate Preview both fall back to the Production origin, not localhost. Their hosted callback acceptance is blocked until their exact origins are allowed.
- **EMAIL_DELIVERY_VERIFICATION: BLOCKED.** No authorized inbox was available. Generated confirmation links, admin-confirmed test accounts, and intercepted signup responses do not establish actual inbox delivery.
- GitHub: [PR #1](https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint/pull/1) was created and normally merged using existing authorized Git credentials after the integration returned HTTP 403. Stabilization was safely removed; main is the only source branch.

Fresh local results: environment/model checks, TypeScript, lint (zero errors, six existing warnings), **56 automated passes/one optional skip**, **14 local browser passes/five skips**, both build targets, zero audit vulnerabilities, and no source/generated-client/history secret findings. All 19 user-data server functions declare authentication middleware; real database tests cover ownership, isolation, rollback, prerequisites, and concurrency.

Hosted suite: **13 passed, 0 failed, 3 skipped**. It verifies password authentication, real OpenRouter intake/planning, strategy switching, action start/completion, progress and refresh, check-ins, rejected/accepted replans, retained history, reauthentication, cross-user denial, desktop/mobile edits, exports, session refresh/expiry, quotas, deletion, and demo behavior. The three live scenarios were gated skips in this run. Unconfigured authentication, known-blocked Preview confirmation callback, and real public signup were explicitly excluded, not counted as passes. A separate mobile Learning scenario is reported below after its run.

The full real-AI journey used **6 successful schema-valid calls**, **8,728 input tokens**, and **6,886 output tokens**, all through OpenRouter `openai/gpt-4.1-mini`. No mock substitution occurred. Disposable test-owned accounts were cleaned up. The deployed public-client audit inspected 20 HTML/JavaScript responses with the correct Supabase reference, zero secret findings, zero page errors, zero failed requests, and zero server errors in that scope. The deployment-scoped runtime-error query returned no records, including the final one-hour query after the mobile scenario; this is bounded evidence, not a claim of exhaustive log retention.

The separate mobile **Learning scenario passed (1 passed, 0 failed, 0 skipped)**. It began at 390px, checked the persisted graph and completed action in Supabase, retained progress after refresh, and found no page errors or horizontal overflow. Its two real calls used 2,675 input and 2,811 output tokens. Total newly incurred live verification: **8 schema-valid calls, 11,403 input tokens, 9,697 output tokens**. Estimated cost at the catalog's $0.40/million input and $1.60/million output rates is **$0.0201**, below $2; this is not a provider billing statement.

Vercel has the eight required variable names on shared Preview/Production entries without branch overrides. Secret-bearing env downloads were rejected by automatic approval review; values were not downloaded or rewritten. Hosted behavior and database assertions provide the functional Preview evidence. A distinct staged Production build still needs verification after the signup gates pass. The project currently has no Vercel Git link, so Git pushes are not assumed to deploy it automatically.

Fixes in this audit: incomplete JSON exports now fail visibly; duplicate strategy keys fail graph validation. [FINAL_PROJECT_COMPLETION.md](FINAL_PROJECT_COMPLETION.md) contains the full feature matrix, detailed limits, manual actions, and deliberately deferred improvements.

## Historical verification — October 14, 2026

The record below is preserved as historical evidence. Its localhost redirect failure, deployment tip, and release actions are superseded by the current section above.

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
