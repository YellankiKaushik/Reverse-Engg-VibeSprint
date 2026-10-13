# ReversePath production readiness — October 13, 2026

## Release decision

**CODE COMPLETE — AWAITING USER SMTP CONFIGURATION.** Public production release remains incomplete. The hardened application is deployed and verified on a protected staged Production deployment. It has not been promoted to the public production domain. The previous public application and prepared `/demo` remain operational.

- Repository: https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint
- Development branch: `codex/production-stabilization`.
- Current verified application source: `6541145` (persistent signup error guidance).
- Existing staged application source: `5ee686d`; this deployment does not contain the final auth error patch. It remains valid evidence for the unchanged planning/execution core.
- Staged deployment: `dpl_C8eZXciWFDqKCm9UX3zWWMjSM5rN`.
- Staged URL: https://reversepath-vibesprint-8bs5ovto2-kaushik-yellanki-project.vercel.app (Vercel Authentication protected).
- Public URL: https://reversepath-vibesprint.vercel.app.
- Public fallback: https://reversepath-vibesprint.vercel.app/demo.
- Recoverable original deployment: `dpl_CwW6fKNJW6yEgf6rCrpc5dmJjAzH`.
- Existing Vercel project: `reversepath-vibesprint`, `prj_McY3U5riuZN49HM72w9Bv7Ng0J1M`, team `kaushik-yellanki-project`. Authenticated API inspection confirmed the **Hobby** plan. No paid infrastructure was created.

The remaining external action is private custom SMTP setup followed by actual signup inbox verification. A read-only configuration snapshot confirmed custom SMTP disabled and email confirmation enabled. The user prefers Resend but owns no sending domain; a possible free temporary alternative is Brevo with a verified mailbox and provider-managed sender replacement, subject to activation and inbox tests. See [the exact provider, DNS and Supabase setup guide](REVERSEPATH_EMAIL_SETUP.md). No purchase is authorized or has been made.

The user now owns all external account activation, domain/DNS, SMTP, API key and environment configuration. The earlier email-retry heartbeat has been **paused** under the final code-only instruction. No signup email, provider configuration, purchase or deployment promotion was performed in this final code pass. Do not automatically retry or repeatedly ask for external setup.

Independent continuation checks passed on the same application source: environment validation, TypeScript, lint (zero errors; six existing warnings), 50 automated tests (four provider gates skipped), production build and npm audit (zero vulnerabilities). Source/client scanning found zero secrets across 157 source files and 42 client assets. Fresh protected staged smoke passed eight tests with one optional gate skipped; public smoke passed four. No additional paid AI calls or application changes were made. The current main commit remains an ancestor of the stabilization branch; main integration is pending release acceptance.

## Final code-only acceptance

**Completed engineering:** reviewed the full stabilization diff against freshly fetched `origin/main`, including graph/execution/check-in/strategy transactions, owner isolation, request idempotency and recovery, output bounds, mobile layout, dependency fixes and test infrastructure. Preserved the existing stack and features. The only additional confirmed issue was raw, transient signup error feedback. Commit `6541145` adds persistent accessible form errors for email HTTP 429, restricted sender and delivery failures, with useful recovery instructions and no automatic resend. Email/password input remains available; switching auth mode clears stale feedback. No schema or external configuration changed.

**Reproduction and fixes:** a controlled, intercepted HTTP 429 test failed on the previous staged code because the persistent alert did not exist. Final browser regressions pass for 429, restricted sender and SMTP failure. Initial local regressions exposed missing API-version/CORS exposure headers in the intercepted test response; corrected the fixture to model the installed Supabase client's error-code parsing. Those intermediate failures are not counted as final passes.

**Tests actually passed in this final pass (October 13, 2026):**

| Check | Final result |
| --- | --- |
| Deterministic unit/integration/DB suite with real RLS fixtures | **55 passed, 4 skipped**; includes five new auth error regressions; unrelated paid provider gates skipped |
| Typecheck | **Passed** |
| Lint | **Passed**; zero errors, six existing Fast Refresh warnings |
| Environment validation | **Passed**; read-only validation of existing local configuration |
| Node production build | **Passed** |
| Vercel production build | **Passed** locally; no new deployment published |
| Dependency audit | **Passed**; zero vulnerabilities |
| Secret scan | **Passed**; 160 source files and 42 client assets, zero findings |
| Latest code, local Node browser suite | **12 passed, 5 skipped**; mock AI, real Supabase; full Golden Path, graph persistence/refresh, execution/replan, callback/reauthentication, cross-user denial, demo/mobile and three intercepted signup failure regressions |
| Existing protected staged browser checks | **8 passed, 1 skipped**; no SMTP delivery or paid AI, unchanged core callback/session/isolation/demo checks |

The five local browser skips are three already-completed live AI scenarios, real SMTP signup and an unconfigured-auth check that does not apply to this configured build. Staged's one skip is the same unconfigured-auth check. **Zero paid AI calls and zero real signup emails in this final pass.** Historical RouterPlus live evidence below remains historical; the final local Golden Path used mock AI and real database transactions.

**Remaining confirmed code defects:** none identified by the review and final acceptance checks. Existing operational limitations below remain documented; this is not a claim of unlimited scale, complete browser coverage or public email reliability.

**Awaiting the user:** provider activation/verification, any chosen domain/DNS, private SMTP credentials/settings and any necessary keys/environment configuration. Email confirmation remains enabled. No repeated setup requests or automatic email retries are scheduled.

**Release actions after private setup:** build/stage the verified branch including `6541145`; the old staged deployment lacks this auth patch. Verify real confirmation receipt in an owned inbox and callback/session flow on that exact candidate. Once all gates pass, promote that candidate, run public authenticated workflow/persistence/isolation/mobile/demo acceptance, then merge the PR using preserved history and the repository's deployment process. A main merge may trigger production deployment, so prepare the PR as draft and do not merge or enable auto-merge. A successful endpoint or admin-generated confirmation link alone does not satisfy inbox acceptance.

## Architecture actually running

React 19 and TypeScript use TanStack Start SSR/server functions, Router, and Query. Tailwind and the existing UI components remain in place. Nitro builds a Node 24 Vercel server handler; this is not a static-only deployment.

Supabase project **ReversePath**, `kvytcttuskwwbmmmjjri`, Singapore, owns Auth and PostgreSQL. All 16 application tables have RLS enabled. Authenticated server functions supply an owner-scoped client; service credentials are confined to server telemetry/idempotency and disposable test administration. Ownership triggers validate relational children. The connector account differs from the authenticated CLI account; no unrelated project was modified.

The existing AI gateway calls RouterPlus's OpenAI-compatible endpoint `https://api.routerplus.com/v1` through the `openai` adapter, with `gpt-6-luna` for all four routes. AI mode is live, the allowlist is OpenAI-only, and provider retries are zero. Every proposal passes Zod and application graph validation before persistence. The response output cap defaults to 16,384 tokens; `AI_MAX_OUTPUT_TOKENS` can lower it. Mock AI remains available for deterministic tests.

PostgreSQL transactions now own complete graph persistence, activation/version allocation, action status/details/edit revisions, check-ins with changed facts, and strategy selection. Deterministic domain code owns dependency checks, selected-route execution, graph cycle validation, progress, and ranking. `/demo` remains an explicitly labelled prepared example with browser-local storage.

## Confirmed defects resolved

| Defect                                                               | Resolution and evidence                                                                                                                                                                                           |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production had no environment settings                               | Installed 26 verified settings from the ignored private import, comparing project, public/server keys and private local credentials without printing values. Staged hosted live inference and persistence passed. |
| Supabase Site URL was localhost and redirect list was empty          | Updated only Site URL and redirect allowlist; preserved email confirmation and all undeclared settings. Production/local origins and the exact staged origin are allowed.                                         |
| Two simultaneous claims could launch duplicate paid work             | Unique idempotency insert now determines the owner; pending claims reject and completed claims replay. Database/claim-check errors fail closed.                                                                   |
| Quota-read errors permitted inference                                | Usage-read errors now reject requests; failed as well as successful recorded requests count toward the operation quota.                                                                                           |
| Failed receipt recording could release a saved request               | A saved-result receipt failure preserves the reservation and asks the user to refresh before retrying.                                                                                                            |
| Action status/details could diverge; concurrent edits lost revisions | One owner-scoped execution RPC writes both, locks graph mutation, enforces prerequisites, and increments revisions atomically. Real rollback/concurrency tests passed.                                            |
| Plan persistence could leave a partial graph                         | One transaction inserts version, strategies, nodes, edges, actions, assumptions, risks, bottleneck and optional activation. Real failed-insert rollback and concurrent version allocation passed.                 |
| Concurrent activation and excessive definer privileges               | Activation locks the plan and now uses `SECURITY INVOKER`; exactly one active version remains. The corresponding security advisor warning disappeared.                                                            |
| Check-in and changed facts could be saved separately                 | One transaction saves both; invalid fact rollback and cross-user denial passed.                                                                                                                                   |
| Invalid strategy selection could clear the existing selection        | Selection validates version/owner and updates in a transaction. Wrong-version selection leaves the previous choice intact.                                                                                        |
| Execution/progress counted alternative strategy work                 | Execute the selected route, shared work and required prerequisites; exclude unrelated alternatives from progress/frontier.                                                                                        |
| `BLOCKED_BY` cycle checks used the opposite direction to execution   | Normalize the edge direction for cycle detection; regression covers false positives and previously missed mixed cycles.                                                                                           |
| Denied plan stayed on a skeleton during repeated reads               | Plan-detail queries report errors immediately instead of automatic retries. Focused staged cross-user regression passed.                                                                                          |
| Authenticated mobile navigation could overflow                       | Header wraps on narrow screens. Authenticated mobile and learning-plan overflow checks passed.                                                                                                                    |
| Known vulnerable transitive dependencies                             | Targeted lockfile updates to undici, source-map-js, brace-expansion and shell-quote; full npm audit reports zero vulnerabilities.                                                                                 |

## Actual testing matrix

All results below were executed on October 13, 2026. Passed, skipped, failed and externally blocked checks are separated.

| Check                                                   | Result                                                                                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                                              | **Passed**                                                                                                                                                                    |
| Environment validation                                  | **Passed**; matching dedicated project and live configuration                                                                                                                 |
| Unit/integration/static DB suite with live RLS enabled  | **50 passed, 4 skipped**; the skipped tests are unrelated provider smoke gates                                                                                                |
| Lint                                                    | **Passed**, 0 errors / 6 existing Fast Refresh warnings                                                                                                                       |
| Full dependency audit                                   | **Passed**, 0 vulnerabilities                                                                                                                                                 |
| Node production build                                   | **Passed**                                                                                                                                                                    |
| Vercel local and hosted builds                          | **Passed**, Node 24 SSR/server functions                                                                                                                                      |
| Supabase migrations                                     | **8 local/remote versions match**, no reset/bootstrap/truncation                                                                                                              |
| Remote execution/graph/check-in/selection tests         | **Passed**, real rollback, concurrent edits/version allocation, prerequisites, milestones, deferred work and owner isolation                                                  |
| Local Node browser suite with mock AI and real Supabase | **9 passed, 5 skipped**; live scenarios/signup were deliberately gated, plus the missing-config check                                                                         |
| Final staged hosted browser suite with real AI          | **8 passed, 5 skipped**, full Golden Path included; scenarios and SMTP signup were run separately                                                                             |
| Requested Career / Startup / Learning scenarios         | **3 passed**, real RouterPlus generation, saved provenance, graph validity, completion criteria, available next action, refresh and layout                                    |
| Real confirmation-link callback                         | **1 passed**, genuine admin-generated signup confirmation URL, confirmed account, session after refresh, logout and password reauthentication; no SMTP/inbox delivery claimed |
| Public existing release Chromium checks                 | **4 passed**, landing, auth guard, demo lifecycle and mobile demo                                                                                                             |
| Microsoft Edge public demo smoke                        | **Passed**, completion after refresh, desktop/mobile, no overflow and zero page errors                                                                                        |
| Source/private-key scan                                 | **Passed**, 157 source files and 42 local client assets at the recorded scan, zero findings                                                                                   |
| Hosted page/client scan                                 | **Passed**, 3 pages and 17 discovered client scripts, no configured private credential matches                                                                                |
| Deployment upload inspection                            | **Passed**, private import/helper files absent; `.vercel` explicitly excluded from subsequent source uploads                                                                  |
| Staged runtime error-log inspection                     | CLI returned **no error logs** in the inspected window; this is a bounded observation, not a guarantee of complete observability                                              |
| Real public-email signup                                | **FAILED / externally blocked**, HTTP 429 `over_email_send_rate_limit` for a valid `example.com` test address                                                                 |
| Promoted public authenticated Golden Path               | **BLOCKED / not run**; promotion withheld until signup acceptance passes                                                                                                      |

The first staged live run completed all six successful AI calls and the execution/replan flow, then failed the cross-user error-screen timeout. After the query retry fix, the focused regression and final complete staged Golden Path passed. Do not count the earlier run as a passed suite.

The first real signup fixture used `example.test`, which Supabase rejected as an invalid email domain. The test now uses a reserved valid domain and captures the exact API error. A separate confirmation-callback attempt reached Vercel SSO because redirected navigations did not inherit the route header; origin-scoped bypass-cookie setup fixed that test infrastructure issue. These were not fabricated application successes.

## Live AI evidence and expenditure

All 18 new successful model calls used RouterPlus / `gpt-6-luna` and passed structured-output validation. Test-owned plans were persisted in the real database and refreshed before fixture cleanup.

| Run                                                    |  Calls | Input tokens | Output tokens |
| ------------------------------------------------------ | -----: | -----------: | ------------: |
| Initial staged Golden Path (final UI assertion failed) |      6 |        9,750 |        27,641 |
| Final staged Golden Path (passed)                      |      6 |        9,920 |        29,580 |
| Career                                                 |      2 |        2,607 |         8,952 |
| Startup                                                |      2 |        2,676 |         8,360 |
| Learning, mobile                                       |      2 |        2,629 |         9,305 |
| **Total**                                              | **18** |   **27,582** |    **83,838** |

The [RouterPlus public model catalog](https://app.routerplus.com/api/models.json), checked this session, lists $0.10 per million input and $0.50 per million output tokens for this model. These recorded calls estimate **$0.0447**, well below the authorized $2 ceiling. This is a catalog-based estimate, not a billing receipt. No repeated paid smoke or separate local live Golden Path was needed. Deterministic checks covered the remaining regressions.

Live planning latency remains material: the final Golden Path took 5.6 minutes, and each requested goal took about two minutes. These include sequential intake/planning/replan calls and remote persistence. Existing loading messages do not promise a completion time. A saved plan is preferable for time-limited presentations.

## Configuration overview

Production contains these verified names (values intentionally omitted):

`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_AUTH_PROVIDER`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_APP_URL`, `APP_ENV`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_ENABLED`, `OPENAI_MODEL_DEFAULT`, `OPENAI_MODEL_FAST`, `OPENAI_MODEL_PRIMARY`, `OPENAI_MODEL_CRITIC`, `OPENAI_MODEL_FALLBACK`, `AI_PROVIDER_MODE`, `AI_PROVIDER_ALLOWLIST`, `AI_ROUTE_FAST`, `AI_ROUTE_PRIMARY`, `AI_ROUTE_CRITIC`, `AI_ROUTE_FALLBACK`, `AI_PROVIDER_MAX_RETRIES`, `AI_PROVIDER_TIMEOUT_MS`, `AI_DAILY_REQUEST_LIMIT`.

Public VITE settings were available during the hosted build. Private provider/service credentials were installed as sensitive settings and remained server-side. Local commands clear only an inherited `OPENAI_API_KEY` so the verified private `.env` value applies. `.env` and `.vercel/production.env` are ignored, and `.vercelignore` excludes private configuration from source uploads.

Security advisors now report only disabled leaked-password protection. Do not buy an upgrade or change authentication policy solely to clear this warning. The SQL functions added here are owner-scoped invokers, have fixed search paths, and revoke anonymous/PUBLIC execution. Email confirmation remains enabled.

## Operational troubleshooting and release continuation

1. **Signup HTTP 429:** inspect Authentication email settings and provider limits. Supabase's built-in provider is restricted to two emails per hour; configurable higher delivery limits require custom SMTP or a Send Email hook. Its default service is not a production email solution. See [rate limits](https://supabase.com/docs/guides/auth/rate-limits) and [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp). Configure an existing provider privately; do not disable confirmation to make a test pass.
2. **After SMTP is configured:** rerun `signup-confirmation.spec.ts` with `RUN_E2E_SIGNUP=true` on the staged URL. Use an owned test mailbox via configuration when verifying actual inbox delivery; reserved-domain automated tests verify endpoint behavior and callback only.
3. **If staged signup, actual inbox delivery and all other release gates pass:** promote the exact final verified Production candidate built from the current branch. The older `dpl_C8eZXciWFDqKCm9UX3zWWMjSM5rN` deployment does not contain the final auth patch and must not be treated as the final candidate. Then run the full Golden Path, the signup test and `/demo` against `https://reversepath-vibesprint.vercel.app`, and update this report before claiming release completion.
4. **Protected staging:** use authenticated CLI access or an origin-scoped automation header/cookie. Do not disable protection or forward a bypass token to Supabase. The test fixture establishes a bypass cookie for cross-origin confirmation redirects. See [Vercel automation protection access](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation).
5. **AI 401/402/404/429/timeouts:** inspect server-side configuration names, model availability, provider account status and bounded logs. Keep retries at zero while diagnosing. Do not repeatedly regenerate or substitute a mock response without displaying its provenance.
6. **Duplicate/in-flight request:** wait for the current operation and refresh. A completed receipt replays. A receipt-recording failure retains the reservation; inspect the saved plan before retrying. An abandoned reservation after a process crash needs owner/operation/key-specific operator investigation, not bulk deletion.
7. **Database failure:** verify the linked reference before any CLI migration. Never reset or bootstrap this project. Inspect migration history and owner-scoped RPC errors. A failed transaction leaves earlier committed state intact.
8. **After a failed promoted release:** preserve the working deployment ID above and use an explicitly targeted rollback if necessary. The new migrations are additive and remain compatible with the original demo; do not revert data by destructive schema operations.

Useful local checks:

```powershell
$env:OPENAI_API_KEY=$null
npm run check:env
npm run typecheck
npm run lint
$env:AI_PROVIDER_MODE="mock"
$env:RUN_SUPABASE_RLS_TESTS="true"
npm test
node scripts/scan-secrets.mjs
npm audit
npm run build:node
```

Live browser gates are explicit: `RUN_E2E_GOLDEN`, `RUN_E2E_SCENARIOS`, and `RUN_E2E_SIGNUP`. `PLAYWRIGHT_BASE_URL` chooses the target. Avoid sharing traces, auth state, private environment files or screenshots containing credentials. Test fixtures create unique disposable accounts, then delete only those accounts and their cascading test-owned rows.

## Outstanding limitations

- Public signup/email delivery and promoted public acceptance remain blocked; the Definition of Done is not satisfied.
- Admin-generated confirmation-link verification does not demonstrate actual inbox delivery.
- All paid/live AI acceptance ran on the protected staged Production deployment, not the still-old public alias.
- AI quotas count recorded events by user and operation; they are not a global dollar budget or an atomic reservation across different request keys. Unique idempotency keys protect same-key work, not arbitrary distinct requests.
- Abrupt process termination can leave an in-flight idempotency reservation requiring specific operator recovery. No unsafe automatic expiry was introduced while an AI call might still be running.
- Replan explanation/diff and context-edit operations outside the new graph transaction retain existing behavior; transactional graph persistence does not imply every ancillary application write is one transaction.
- Default email service limits, external provider latency, and disabled leaked-password protection remain operational considerations.
- Tests exercised Chromium and an installed Edge smoke; no Firefox/Safari coverage or formal load/availability certification is claimed.

Future changes should retain the current stack, run deterministic tests before paid inference, add targeted fault/concurrency tests for any new multi-write operation, preserve `/demo`, and avoid rewriting published Git history or touching unrelated Supabase projects.

## GitHub release preparation

The verified stabilization branch is pushed; application source is `6541145`. Reviewed the full diff against fetched `origin/main` and preserved history. PR creation through the GitHub connector returned HTTP 403 `Resource not accessible by integration`; no PR was opened and no merge occurred. The complete [draft PR description and comparison link](REVERSEPATH_RELEASE_PR.md) are ready for review. This external connector permission does not affect code acceptance.
