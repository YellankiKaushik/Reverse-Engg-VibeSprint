# ReversePath — Vibe Sprint submission report

## Release status

**Local live product verified; production credentials and hosted live verification pending.** The prepared public demo remains available.

- Application: https://reversepath-vibesprint.vercel.app
- Submission fallback: https://reversepath-vibesprint.vercel.app/demo
- Source: https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint
- Hosting: existing Vercel `reversepath-vibesprint` project, free Hobby plan.
- Verified production deployment: `dpl_CwW6fKNJW6yEgf6rCrpc5dmJjAzH`, application source `3e6b399`.

## Product overview and problem

ReversePath turns a vague goal into a structured plan by working backwards from the desired outcome. It organizes prerequisites, context, strategies, assumptions, risks, milestones and actions, then ranks the next executable action using dependencies and progress.

It addresses the gap between having an ambition and knowing what to do next within the user's available time and resources.

## Technology stack

React 19, TypeScript, TanStack Start SSR and server functions, TanStack Router/Query, Tailwind/shadcn UI, Supabase Auth/PostgreSQL/RLS, AI SDK OpenAI-compatible structured generation, Zod contracts, Vitest and Playwright. Nitro supplies Vercel Node 24 SSR output.

## Core functionality completed

- Existing goal intake, clarification, plan generation, version activation, actions, progress and replanning implementation preserved.
- Deterministic dependency frontier and progress calculations tested.
- Prepared six-month product-manager example supports task unlocking, all six completions, refresh persistence, reset and mobile use without credentials.
- Missing configuration and database errors are displayed; signup confirmation and rejected login were verified with intercepted HTTP.
- AI provider/model provenance is stored with generated plan metadata and displayed honestly.
- Four source migrations applied through the authenticated CLI to the verified empty **ReversePath** database (`kvytcttuskwwbmmmjjri`, Singapore), plus a security migration restricting internal trigger-helper RPC permissions. All 16 application tables have RLS/policies. No bootstrap, reset or existing-data deletion was performed.
- Real email signup and login tested. Signup required email confirmation; the disposable fixture was confirmed using the admin API for automated login. Confirmation-link clicking was not automated.
- Full authenticated Golden Path passed against the production Node build with mock AI and with real RouterPlus AI, including saved plans, completion, refresh, version rejection/activation and cross-user isolation.

## AI integration and model actually used

**Actual live model tested: `gpt-6-luna`, through RouterPlus's OpenAI-compatible API and the existing `openai` adapter.** Authenticated `/v1/models` and a real minimal JSON-schema smoke passed before enabling local live mode. `/demo` remains a curated example, not AI output.

Endpoint: `https://api.routerplus.com/v1`; OpenAI-only routes and zero retries. The full live Golden Path recorded six successful schema-valid calls, 9,851 input tokens and 27,813 output tokens, all on gpt-6-luna. At the public catalog rates ($0.10 input / $0.50 output per million tokens), that successful run estimates below $0.02; this is not a provider billing receipt. Failed/timeout attempts and the tiny smoke also consumed small amounts. Testing remains within the approved $2 ceiling. Live provider/model provenance was verified in the UI; the plan was saved in Supabase.

## Tests executed and results

Latest local checks on October 11, 2026:

| Check | Actual result |
| --- | --- |
| `npm run check:env` | Passed, privately configured matching project and live AI mode |
| `npm run typecheck` | Passed |
| `npm run test` with remote RLS enabled | 40 passed, 4 provider checks skipped; 13 files passed, 1 skipped |
| `npm run build:vercel` | Passed |
| Public production Chromium tests | 4 passed: landing, auth guard, prepared-demo lifecycle and mobile usability |
| Separate production browser visit | HTTP 200, zero page errors; screenshot visually inspected |
| Credential-pattern scan before initial source push | 144 tracked files, zero findings |
| Supabase RLS plus migration checks after helper security fix | 6 passed across 2 files |
| Authenticated Golden Path, production Node build, mock AI | 1 passed |
| RouterPlus structured-output smoke | 1 passed, 3 unrelated provider checks skipped |
| Full local live Golden Path | 1 passed in 3.8 minutes; real AI analysis, planning/replanning, persistence, progress, refresh, provenance and isolation |
| Hosted live Golden Path | Pending Production env configuration and deployment |
| Built client credential scan | 24 assets scanned; zero private credential matches |

The production security blocker was resolved by upgrading to patched TanStack Start 1.168.60 and compatible Router/plugin versions. No security bypass was enabled. Golden Path tests were corrected to avoid double generation, compare progress without CSS text transformation, and allow time for sequential live calls. A dev-only invalid function-ID failure did not reproduce against the production build. Skipped tests do not demonstrate live functionality.

## Known limitations and required next actions

1. User is importing the private ignored `.vercel/production.env` (26 whitelisted settings) into the existing Vercel project's Production environment and configuring Supabase redirect URLs. Hosted live acceptance remains pending until deployment and actual browser verification pass.
2. The connector account differs from the user's browser/CLI account. The verified ReversePath reference above is authoritative. Unrelated LoadGuard 3D has not been modified.
3. Email confirmation is enabled. The automated signup test used admin confirmation; users must follow their email link. Default Supabase email limits and provider availability can affect signup delivery.
4. Live planning/replanning latency varies. Backend action updates use multiple existing writes; remote errors are surfaced, but these writes are not transactional.
5. `/demo` completion is browser-local, not Supabase persistence. It must remain labelled a prepared offline example.

## Two-minute demonstration

For the live release after hosted verification: sign in, submit the product-manager goal, show analysis and generate a plan, point out the live model provenance and recommended next action, complete it and refresh to prove database persistence. Prepare a saved plan beforehand if inference latency would overrun the two-minute slot. Use the fallback below if an external provider is unavailable.

- **0:00–0:20:** Open `/demo` and explain the problem: a goal needs prerequisites and an achievable next action. State “This is a prepared offline example, not live AI.”
- **0:20–0:40:** Load the prepared plan and show the six-month product-manager goal, capacity, gap and strategy.
- **0:40–1:15:** Show the recommended next action and dependencies. Complete it to unlock the next task.
- **1:15–1:40:** Show progress changing and explain how the deterministic frontier selects an executable action.
- **1:40–2:00:** Refresh to demonstrate browser persistence; reset if needed. Distinguish the prepared fallback from real live generation and database storage.

Update the release status and hosted test evidence after production configuration, deployment and the real public Golden Path pass. Local live success is not yet proof of the hosted release.
