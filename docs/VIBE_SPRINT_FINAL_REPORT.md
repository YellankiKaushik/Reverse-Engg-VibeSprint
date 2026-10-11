# ReversePath — Vibe Sprint submission report

## Release status

**Verified hosted prepared demo; live product acceptance remains incomplete.**

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
- Four source migrations reviewed for schema, RLS, ownership integrity and activation. **They have not been applied to a dedicated remote database.**

## AI integration and model actually used

**No live model has been used for this release.** `/demo` is a curated example, not AI output. Local AI mode remains `mock`; production has no provider credentials.

The existing `openai` adapter is prepared for `https://api.routerplus.com/v1`, OpenAI-only routing and zero retries. A replacement RouterPlus key is absent. An authenticated model listing, inexpensive structured-output model selection, real analysis and plan validation must precede enabling live mode. The user authorized less than $2 total testing expenditure; no inference expenditure has occurred.

## Tests executed and results

Latest local checks on October 11, 2026:

| Check | Actual result |
| --- | --- |
| `npm run check:env` | Blocked: five required Supabase variables missing; AI mock |
| `npm run typecheck` | Passed |
| `npm run test` | 38 passed, 6 optional live checks skipped; 12 files passed, 2 skipped |
| `npm run build:vercel` | Passed |
| Public production Chromium tests | 4 passed: landing, auth guard, prepared-demo lifecycle and mobile usability |
| Separate production browser visit | HTTP 200, zero page errors; screenshot visually inspected |
| Credential-pattern scan before initial source push | 144 tracked files, zero findings |
| Real Supabase RLS / authenticated Golden Path | Not verified; required project and keys absent |
| Real RouterPlus generation / live hosted Golden Path | Not executed; provider key and database absent |

The production security blocker was resolved by upgrading to patched TanStack Start 1.168.60 and compatible Router/plugin versions. No security bypass was enabled. Skipped tests do not demonstrate live functionality.

## Known limitations and required next actions

1. The connected Supabase account currently contains only the unrelated inactive LoadGuard 3D project. It has not been modified. A new `ReversePath-VibeSprint` project is required.
2. Confirm the target organization and zero-cost project creation, then configure the new project's URL, publishable and server keys privately using [the setup guide](VIBE_SPRINT_SETUP.md).
3. Apply the four migrations only after verifying the target is the dedicated empty project. Run remote RLS and the authenticated Golden Path with mock AI.
4. Supply the RouterPlus replacement key privately, confirm a model through authenticated `/v1/models`, and validate real generation within the approved budget.
5. Only after real local integration passes, configure production build/runtime variables, Supabase redirect URLs, deploy to the existing Vercel project and test with disposable users. Preserve or roll back to the verified demo deployment if required.
6. Current browser persistence in `/demo` is not database persistence. Real registration, AI plans and remote persistence remain acceptance blockers.

## Two-minute demonstration

- **0:00–0:20:** Open `/demo` and explain the problem: a goal needs prerequisites and an achievable next action. State “This is a prepared offline example, not live AI.”
- **0:20–0:40:** Load the prepared plan and show the six-month product-manager goal, capacity, gap and strategy.
- **0:40–1:15:** Show the recommended next action and dependencies. Complete it to unlock the next task.
- **1:15–1:40:** Show progress changing and explain how the deterministic frontier selects an executable action.
- **1:40–2:00:** Refresh to demonstrate browser persistence; reset if needed. Explain that live Supabase and RouterPlus are pending configuration.

Once live acceptance passes, replace this release status and test evidence with the actual model, remote test results and verified deployment. Do not present this report as a completed live release before those checks pass.
