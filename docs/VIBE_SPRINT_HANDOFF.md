# Vibe Sprint handoff — October 11, 2026

## Working directory and Git

Work directly in `C:\Users\YellankiKaushik\Desktop\KAUSHIK\ALL Projects\VibeSprint\Coding files\Coding Files - Retraza-Kaaush-main`.

- Branch: `main`.
- Origin: `https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint.git`.
- Clean extracted baseline: `c684966` (`chore: preserve clean ReversePath sprint baseline`).
- No Git history existed when work began. `git ls-remote --heads origin` returned no branches.
- No push or deployment has been authorized or performed. Before pushing, inspect the current index for secrets and request explicit approval, as required by the mission.
- Do not modify the original Retraza-Kaaush remote, force-push, amend/rebase published commits, create a nested clone, or reset any existing Supabase project.

## User decisions

The user has no confirmed ReversePath Supabase project. They requested a **new dedicated project named ReversePath-VibeSprint**, safe local work meanwhile, and `AI_PROVIDER_MODE=mock` until live AI is configured. They will save a RouterPlus replacement key privately in `.env` as `OPENAI_API_KEY`. Do not ask them to paste secrets into chat. Do not reuse the connected inactive LoadGuard 3D project.

## Architecture preserved

React 19 / TypeScript, TanStack Start server functions, Query/Router, existing Tailwind/shadcn design system, Supabase Auth/PostgreSQL/RLS, AI SDK OpenAI-compatible gateway, Zod proposal validation, deterministic dependency frontier/progress, and existing migrations. npm/package-lock is the verified package manager; installed dependencies pass `npm ls --depth=0`. No reinstall or library upgrade was needed. Preserve the extracted Bun files as reference.

## Local implementation completed

- `.gitignore`: all `.env.*` excluded except `.env.example`; credentials, local DB files, build outputs, deployment state, and dependencies excluded.
- Created ignored `.env` from the example. Values are still unconfigured; mock mode remains enabled.
- Public landing/sign-in render without Supabase config; sign-in shows a useful configuration message and disables unavailable actions.
- Browser Supabase fallback does not reference undefined `process`; opaque server secret keys are rejected as public configuration.
- Auth hook handles restore rejection and unmount cleanup.
- Signup correctly waits for email confirmation when no session is returned. Auth controls remain disabled until hydration/session initialization so early clicks are not lost.
- Independent deployment Google OAuth uses Supabase directly; setting `VITE_AUTH_PROVIDER=lovable` retains the original brokered Lovable OAuth.
- Dashboard query errors are displayed with retry; queries include user identity to avoid stale account data.
- Plan reads surface DB errors instead of showing empty/partial successful data; requested versions must belong to the case's plan.
- Completion/edit/check-in metadata writes now check DB errors. Action execution logic is in a testable server module; metadata failures do not mark the node complete. Handler tests verify failure propagation, milestone updates, and rejection of objective status edits. Milestone review controls allow milestones to contribute to completion, matching the existing progress denominator.
- Generated plan provenance (provider/model, including mock) is stored in existing node metadata. UI distinguishes mock/live/older unknown sources without a new DB migration.
- Product-manager example added to New objective, with an accessible textarea and guarded submission.
- `/demo`: curated six-month PM example with clear “no live AI” label, real domain frontier/progress, dependency unlocking, localStorage persistence, malformed-state recovery, full completion, reset, responsive layout. It does not demonstrate database persistence or AI generation.
- RouterPlus reuses the OpenAI adapter; blank role model values fall back to `OPENAI_MODEL_DEFAULT`. Explicit invalid provider allowlists/routes fail closed.
- RouterPlus adapter test intercepts HTTP and checks endpoint, Bearer header, JSON schema request and validated output. It is **not a real live RouterPlus test**.
- Live smoke suite now includes the OpenAI adapter. E2E no longer forcibly changes provider routes/mode to Gemini/Groq.
- Fixed empty Playwright base URL from `.env.example`, bounded server readiness fetch, and empty test-key overrides.
- Vite config loads private local server env into `process.env` without exposing it through browser defines.
- Node production and Vercel target build scripts; start loads local `.env` when present. Vercel produces a Node 24 SSR function and assets under `.vercel/output`.
- `npm run check:env` reports missing configuration names and checks for private credentials in VITE variables.

## Files modified/added after baseline

Configuration: `.env.example`, `package.json`, `playwright.config.ts`, `vite.config.ts`, `eslint.config.js`, `.prettierignore`, `.vercelignore`, `vercel.json`, `README.md`.

Scripts: `scripts/run-e2e.mjs`, `scripts/build.mjs`, `scripts/check-env.mjs`.

Application: `src/hooks/use-auth.ts`, `src/integrations/supabase/client.ts`, `src/lib/ai-gateway.server.ts`, `src/lib/data.functions.ts`, `src/lib/execution.functions.ts`, `src/lib/action-execution.server.ts`, `src/lib/planner.server.ts`, `src/lib/planning.functions.ts`, `src/domain/demo-plan.ts`, `src/routes/auth.tsx`, `src/routes/index.tsx`, `src/routes/new.tsx`, `src/routes/plans.$caseId.tsx`, `src/routes/demo.tsx`, generated `src/routeTree.gen.ts`.

Tests: `tests/helpers/test-env.ts`, `tests/unit/ai-gateway.test.ts`, `tests/unit/demo-plan.test.ts`, `tests/integration/live-ai-smoke.test.ts`, `tests/integration/routerplus-adapter.test.ts`, `tests/integration/execution-handler.test.ts`, `tests/e2e/auth-states.spec.ts`, `tests/e2e/demo.spec.ts`, `tests/e2e/golden-path.live-supabase.spec.ts`.

Docs: this file and `docs/VIBE_SPRINT_SETUP.md`. Use `git status --short` / `git show --stat HEAD` for the authoritative current file list.

## Commands and evidence

Baseline:

- `npm run typecheck`: pass.
- `npm run test`: 30 passed, 5 live checks skipped.
- `npm run lint`: 0 errors, 6 existing Fast Refresh warnings in UI primitives.
- `npm run build`: pass, original Cloudflare target.
- `npm run test:e2e`: 2 public/guard checks passed, authenticated Golden Path skipped.
- Index credential-pattern scan: 130 files, 0 findings before baseline commit.

After implementation:

- `npm ls --depth=0`: pass, installed tree matches dependency ranges.
- `npm run typecheck`: pass after correcting index-signature access in new code.
- `npm run test`: 38 passed, 6 live checks skipped (14 files: 12 passed, 2 skipped).
- `npm run test:e2e`: 5 passed, 3 skipped with empty Supabase config. Covers landing, guard, missing config, desktop demo lifecycle, and mobile overflow/completion.
- Configured-client auth checks with fake public client config and intercepted HTTP: 2 passed, 1 missing-config check skipped. Signup confirmation and invalid-login feedback are verified; real Supabase auth remains untested.
- An initial configured signup test exposed clickable pre-hydration controls; disabling auth controls until initialized fixed it. The rerun passed.
- `npm run build:node`: pass. `npm start` was verified on ports 3000 and 3001; latest browser checks against the **production server** passed 5 tests (landing, protected guard, missing-config handling, desktop and mobile offline lifecycle), with 3 configuration-dependent checks skipped.
- `npm run build:vercel`: pass; `.vercel/output/config.json` contains filesystem assets and fallback to `/__server`; generated `.vc-config.json` uses `nodejs24.x` with streaming.
- Desktop/mobile screenshots inspected; no clipping or horizontal overflow in the prepared demo.
- `npm run check:env`: correctly exits 1 because five required Supabase variables are missing. This is a real configuration blocker, not a passed live check.
- `vercel whoami`: authenticated as the user's account; no Vercel project created or linked and nothing deployed.
- Logs are ignored `*-check.log` files in the workspace, not committed credentials.

## Required private environment names (never values)

Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Optional project metadata: `VITE_SUPABASE_PROJECT_ID`. Independent OAuth: `VITE_AUTH_PROVIDER`.

AI: `AI_PROVIDER_MODE`, `OPENAI_BASE_URL`, `OPENAI_ENABLED`, `OPENAI_API_KEY`, `OPENAI_MODEL_DEFAULT`, optionally `OPENAI_MODEL_FAST/PRIMARY/CRITIC/FALLBACK`, `AI_PROVIDER_ALLOWLIST`, `AI_ROUTE_FAST/PRIMARY/CRITIC/FALLBACK`, `AI_PROVIDER_MAX_RETRIES`, `AI_DAILY_REQUEST_LIMIT`, `AI_MAX_OUTPUT_TOKENS`.

Deployment: `PUBLIC_APP_URL`, `APP_ENV`, plus the runtime/build Supabase and AI values above. Optional verification gates: `RUN_SUPABASE_RLS_TESTS`, `RUN_LIVE_AI_SMOKE`, `RUN_E2E_GOLDEN`, `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_PORT`.

IMPORTANT: the shell inherits a non-RouterPlus `OPENAI_API_KEY`; environment variables override `.env`. Clear only that shell variable (`$env:OPENAI_API_KEY=$null`) before live commands so the user's `.env` replacement key is used. Never log the key.

## Genuine outstanding blockers and limits

1. Dedicated Supabase project not yet created/configured. Existing migrations have static validation only, not remote SQL execution. No existing database was changed.
2. RouterPlus private key and authenticated model ID not configured. Public docs/catalog confirm compatible wire format, but no real paid inference has been made.
3. Full authenticated Golden Path, real RLS, persisted completion after refresh, and live planning/replanning require those configurations.
4. Push and public deployment require explicit mission approval. No public application URL exists.
5. Backend action/node edits use multiple writes under the existing API; errors are now surfaced, but these writes are not transactional. Remote failure/concurrency behavior requires real DB tests before claiming production reliability.

## Exact next task for Claude Code or Codex

Read `docs/VIBE_SPRINT_SETUP.md`, obtain the **new project's reference ID** and privately configured `.env`, confirm the target is ReversePath-VibeSprint, apply the four reviewed migrations only to that empty project, and run `npm run check:env`. Keep AI mock initially. Run live Supabase RLS tests and the authenticated Golden Path against mock AI first. Fix failures from actual output.

Then verify the RouterPlus model for the user's key through authenticated `/v1/models`, use an OpenAI-family model for JSON schema output, enable live mode, run the small schema smoke and full Golden Path. Request push/deploy approval only after reviewing the concrete commit/configuration. Push to the NEW origin without force; link/create a dedicated Vercel project, configure secrets privately, deploy with Nitro's Vercel preset, verify the public user journey, and update this handoff with the URL and actual results.

Do not repeat the baseline investigation or mistake skipped live tests for successful integration. `/demo` is the tested fallback and must always be presented as a prepared offline example.
