# ReversePath final completion audit

October 17, 2026 — Asia/Calcutta.

**REVERSEPATH FINALIZATION BLOCKED**

**Subsequent GitHub-only finalization:** The owner explicitly authorized source-control finalization independently of Production signup acceptance. [PR #1](https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint/pull/1) was normally merged, all source was verified on main, and stabilization was safely deleted locally/remotely. Main is now the only source branch. No Production deployment occurred. [GITHUB_FINALIZATION_REPORT.md](GITHUB_FINALIZATION_REPORT.md) supersedes the GitHub blockers and branch-state descriptions in the earlier audit below; Production acceptance remains blocked.

The application candidate passed fresh automated, local browser, and hosted real-AI verification. Production promotion remains withheld because required signup acceptance is incomplete. Source-control finalization was subsequently authorized independently and completed through PR #1 with a normal merge and safe branch cleanup. No skipped or unperformed check is treated as a pass.

## Application and source

ReversePath converts goals and other intents into dependency-based plans, compares strategies, ranks executable actions, tracks progress and check-ins, and proposes reviewable revised versions. The implemented stack is React 19, TypeScript, TanStack Start/Router/Query, Tailwind CSS 4, Radix UI, Vite 8, Nitro, Supabase Auth/PostgreSQL, and OpenRouter through the AI SDK. Node 24 is the deployment runtime.

Email/password signup, confirmation callbacks, login, logout, stored sessions, and refresh are implemented. Google OAuth exists in the UI but provider setup is deliberately deferred. The offline demo is curated browser-local data; mock inference is distinct from real OpenRouter calls.

- Audited initial local/remote stabilization HEAD: `59d18d1e1f5f1d6239ce6b62ad69760a931826ad`.
- Verified application candidate: `e77ad37a5c3b910fe23f3090dac0f4079419af19`.
- Remote main at audit: `0afdca597d5bc815949f189d440da2c31dc8bc46`.
- Main is an ancestor of stabilization; no merge conflict or history rewrite is needed to preserve its commits. Actual GitHub protection/merge checks remain subject to repository permissions.
- Later evidence/documentation changes on stabilization are not a claim that Production has advanced. Candidate identity and final branch identity are separate while release is blocked.

Two defects were corrected: export now fails instead of silently downloading partial data after a database read error; graph validation rejects duplicate strategy keys before persistence. Regression tests cover both. Existing browser coverage now also exercises strategy switching, starting work, objective/context edits, JSON download contents, session refresh, expiry with invalid refresh credentials, quotas, deletion, and desktop/mobile navigation.

## Fresh verification results

| Check                                   | Result                     | Evidence / limits                                                                                                                             |
| --------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check:env`                     | PASS                       | Required configuration and public/server credential checks; local default mock                                                                |
| `npm run check:ai`                      | PASS                       | Real OpenRouter key/catalog check, `openai/gpt-4.1-mini`; no inference in this check                                                          |
| TypeScript                              | PASS                       | `npm run typecheck` after fixes and test additions                                                                                            |
| ESLint                                  | PASS                       | Zero errors; six existing Fast Refresh warnings                                                                                               |
| Automated tests with real Supabase gate | PASS                       | **56 passed, 0 failed, 1 skipped**; skipped test is the optional standalone live AI smoke                                                     |
| Node production build                   | PASS                       | Fresh build after application fixes                                                                                                           |
| Vercel production-target build          | PASS                       | Fresh build after application fixes                                                                                                           |
| Local browser suite                     | PASS                       | **14 passed, 0 failed, 5 skipped**                                                                                                            |
| Hosted Preview suite                    | PASS within selected scope | **13 passed, 0 failed, 3 skipped**; three additional tests explicitly excluded as described below                                             |
| Mobile live-planning scenario           | PASS                       | **1 passed, 0 failed, 0 skipped**; Learning scenario, actual OpenRouter and database assertions                                               |
| `npm audit`                             | PASS                       | Zero reported vulnerabilities                                                                                                                 |
| Source/generated-client secret scan     | PASS                       | Zero findings; scans include both generated client targets                                                                                    |
| Git history scan                        | PASS                       | 20 reachable commits scanned at candidate audit; no current private-value, recognized secret-pattern, or service-role JWT matches             |
| Deployed public client scan             | PASS                       | 20 HTML/JavaScript responses; correct Supabase reference, zero private-value/pattern findings, page errors, failed requests, or server errors |
| Preview runtime error query             | PASS for inspected window  | No error records returned by the deployment-scoped query; final window is recorded in release verification                                    |

Local browser skips: unconfigured-auth state (the current client is configured), three optional live scenarios, and real public signup. Hosted suite excludes the unconfigured-auth check, generated-link callback for the known-unallowed Preview origin, and public signup without an authorized mailbox. Its three skipped live scenarios are not represented as passes; Learning is exercised separately. Mocked signup-error responses verify UI behavior only.

The separate Learning scenario began on a 390px mobile viewport, saved a real plan, checked its graph and action completion in Supabase, verified progress after refresh, and found no horizontal overflow or browser runtime errors. It used two successful schema-valid calls with 2,675 input and 2,811 output tokens. Together with the hosted full journey, new inference totals **8 calls, 11,403 input tokens, and 9,697 output tokens**. Cost is a catalog estimate rather than a billing statement; see the release report.

Initial sandbox execution hit Windows temporary-file permission errors; the authorized rerun passed. A concurrent build interrupted an initial workspace browser run through a Windows Vite watcher collision; sequential verification replaced it. An initial quota assertion assumed 20 even though local configuration overrides the limit to 10; the test was corrected to validate the actual limit message and unchanged goal/usage counts. These unsuccessful attempts are not counted as passing runs. Local dev-server logs retain existing navigation-cancellation diagnostics; hosted error queries are separate evidence.

## Feature verification matrix

| Feature                                         | Test method                                                | Result                         | Evidence                                                  | Issue                                                     |
| ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| Landing/dashboard/empty state                   | Local and hosted browser                                   | PASS                           | Auth guard and workspace suites                           | None observed                                             |
| Email signup form and errors                    | Intercepted browser responses                              | PASS for UI                    | Auth-state tests                                          | Does not establish real delivery                          |
| Real signup email delivery                      | Authorized inbox inspection                                | BLOCKED                        | No mailbox template or inbox access                       | Owner must verify delivery                                |
| Production confirmation redirect                | Real generated-link probe                                  | PASS                           | Requested and actual production origins match             | No SMTP assertion                                         |
| Preview confirmation redirect                   | Real generated-link probe                                  | FAIL                           | Old and new Preview origins fall back to Production       | Allow exact Preview origins                               |
| Real confirmation callback                      | Local browser with generated Supabase link                 | PASS locally                   | Confirmation-callback test                                | Hosted Preview callback withheld                          |
| Password login/logout/reauthentication          | Real disposable accounts, browser                          | PASS                           | Local and hosted full workflow                            | Accounts were administratively confirmed                  |
| Session persistence                             | Reload and logout/login                                    | PASS                           | Full workflow and workspace tests                         | None observed                                             |
| Session refresh                                 | Real SDK refresh-token exchange                            | PASS                           | Desktop/mobile workspace tests                            | Tokens not logged                                         |
| Expired session with invalid refresh            | Browser stored-session expiry fixture                      | PASS on hosted workspace       | Redirect to auth, no private settings                     | Simulated expiry; real refresh rejection                  |
| Protected routes/unauthorized access            | Signed-out and cross-user browser probes                   | PASS                           | Auth guard, isolation suites                              | None observed                                             |
| Goal creation/analysis                          | Mock locally, real AI on Preview                           | PASS                           | Full workflow                                             | Real inference labeled separately                         |
| Clarification                                   | Browser when questions are returned; deterministic harness | PASS                           | Full workflow/harness                                     | Question count depends on input                           |
| Objective/context editing/removal               | Browser and database export assertions                     | PASS                           | Workspace suite                                           | None observed                                             |
| Goal loading/navigation/deletion                | Browser and owned data assertions                          | PASS                           | Workspace and full workflow                               | None observed                                             |
| OpenRouter/model/output contracts               | Credential check, adapter tests, real hosted calls         | PASS                           | Real usage events with schema validation                  | No provider fallback                                      |
| Strategy/milestone/action/dependency generation | Real graph persistence and contract tests                  | PASS                           | Full workflow, planner validation, live scenario          | AI output can still fail validation safely                |
| Strategy selection                              | Browser switches away and back; RPC regressions            | PASS                           | Expanded full workflow and database suite                 | None observed                                             |
| Prioritization/bottleneck                       | Domain tests and rendered plan                             | PASS                           | Frontier tests/full workflow                              | Heuristic scores                                          |
| Action starting/completion                      | Browser and transactional database checks                  | PASS                           | Expanded full workflow and RLS suite                      | Prerequisites enforced                                    |
| Prerequisite enforcement                        | Real database rollback/concurrency tests                   | PASS                           | Six gated database regressions                            | Skipped prerequisites do not unblock                      |
| Progress and refresh persistence                | Browser and database completion checks                     | PASS                           | Full workflow/live scenario                               | Scoped to selected strategy                               |
| Action editing/milestone completion             | Real RPC transaction and prerequisite regressions          | PASS at database/service layer | Supabase regressions/execution tests                      | Not every status has a separate UI click test             |
| Check-ins/changed facts                         | Browser and atomic RPC regressions                         | PASS                           | Full workflow/workspace/database suite                    | None observed                                             |
| Replan/change summary                           | Real OpenRouter candidate generation                       | PASS                           | Hosted full workflow                                      | Completion carry-over limitation below                    |
| Accept/reject/history/active version            | Browser, deterministic harness, transactional activation   | PASS                           | Hosted full workflow                                      | Previous active version retained until acceptance         |
| Account settings/JSON export                    | Desktop/mobile browser download inspection                 | PASS                           | Workspace plus export failure regression                  | Export contains planning tables only                      |
| Demo/reset/persistence                          | Desktop/mobile browser                                     | PASS                           | Demo tests and inspected screenshots                      | Curated example, not live AI                              |
| Mobile forms/navigation/overflow                | 390px browser viewport                                     | PASS                           | Workspace, demo, isolation, separate live scenario        | No redesign performed                                     |
| Loading/error feedback                          | Browser errors/denied routes plus source inspection        | PASS within covered states     | Auth-state/isolation tests                                | No exhaustive visual test of every loading frame          |
| RLS/ownership/transactions                      | Real two-user DB tests                                     | PASS                           | Supabase gated suite                                      | No schema changes or resets                               |
| Quotas/idempotency                              | Unit/service tests and seeded owned browser fixtures       | PASS                           | Exactly 20 seeded events, no new goal/inference on denial | Per-user operation quota, not a claimed global IP limiter |

## Backend, hosting, and GitHub

Supabase remains **Reverse Engineering**, reference `usvopldwiwzlvoqawvcu`. Browser/server configurations pass local matching checks. Hosted requests use that project and persist real plans. The connected Supabase integration does not expose this project to its current account, so functional verification used the existing application credentials instead; no unrelated project was modified.

Vercel project: `reversepath-vibesprint`, `prj_McY3U5riuZN49HM72w9Bv7Ng0J1M`, team `team_UYEpjjRaObtrYF55SYu5rqUl`. All eight required variable names are present on both Preview and Production in shared entries with no branch override. Hosted Preview behavior verifies live OpenRouter and the intended database. Secret values were not downloaded for comparison: automatic approval review rejected writing secret-bearing environment files. A safer short-lived, origin-scoped OIDC path enabled hosted tests without persisting the authentication token.

Verified Preview: https://reversepath-vibesprint-m8pa5r4bg-kaushik-yellanki-project.vercel.app, deployment `dpl_7wig7xrzUDR8dVmdggHw2QpbarkH`, READY, Node 24, candidate SHA above. The public domain remains on the prior Production deployment; it is not described as freshly released or verified against the candidate.

Production/rollback baseline: `dpl_4EmetpCmuMdwZkxBDKrccNyVMds6`, https://reversepath-vibesprint-6jn9r9fiu-kaushik-yellanki-project.vercel.app, source `5ee686dc58aa1d4fc6bbfc959a6bc89280929736`. Public URL: https://reversepath-vibesprint.vercel.app. The baseline was retained. No Production candidate was promoted while acceptance gates remained blocked.

Repository: https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint. The initial audit's PR attempt returned HTTP 403, `Resource not accessible by integration`. Under subsequent explicit GitHub-only authorization, the owner's existing Git credentials created and normally merged [PR #1](https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint/pull/1). Main was verified to preserve the entire source tip before stabilization was deleted locally and remotely. Main is now the only source branch and the active local branch. The merge triggered no Production deployment; full details are in `GITHUB_FINALIZATION_REPORT.md`.

## Remaining manual actions

1. In the existing Supabase project's Auth redirect allowlist, allow both the required older Preview origin and the current candidate origin. Production Site URL now behaves correctly; do not restore the old localhost fallback or disable confirmation.
2. Use a unique disposable address in an inbox you control to register once on the intended release site. Confirm actual receipt, inspect the destination origin, follow the link, verify dashboard/password login, then logout/login. Record this evidence or explicitly address the email acceptance requirement as project owner. Generated admin links do not satisfy inbox delivery.
3. After signup acceptance passes, verify a staged Production build from the finalized main source, promote it, and smoke-test the public domain. GitHub merging and branch cleanup are already complete; no additional integration permission is required for the finished PR operation.

## Known limitations and future improvements

Replanning retains previous version history but creates new pending nodes; it does not automatically transfer completion state by semantic identity. Mock plans are generic fixtures. Graph presentation uses grouped cards rather than a draggable canvas. Data export is limited to planning tables. No account-deletion or file-upload interface is implemented. These are documented scope limits, not newly added features.

**FUTURE IMPROVEMENTS:** Google OAuth provider setup, new features or redesigns, uploads, extra analytics/monitoring, additional AI providers, optional refactoring/developer-experience cleanup, licensing decisions, and new CI infrastructure are deliberately deferred. Existing deprecation/Fast Refresh/cancellation warnings can be addressed separately. No optional enhancement was used as a release gate.

Local sanitized evidence and screenshots are under ignored `logs/final-qa/`. GitHub-main finalization is complete; Production release remains incomplete until its listed acceptance gates pass.
