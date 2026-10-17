# Final configuration report

> **Subsequent GitHub update:** [PR #1](https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint/pull/1) merged the verified source into main; stabilization was safely removed. Main is the only source branch. No Production release accompanied the merge. See [GITHUB_FINALIZATION_REPORT.md](GITHUB_FINALIZATION_REPORT.md) for the latest source-control state; earlier GitHub blockers below are historical.

## Current snapshot — October 17, 2026

Fresh application configuration checks and the real OpenRouter key/model capability check pass. The eight required Vercel variables are present on shared Preview/Production entries without branch overrides. Hosted Preview behavior confirms Supabase project `usvopldwiwzlvoqawvcu`, live OpenRouter, and `openai/gpt-4.1-mini`. There is no new provider or project.

Application candidate `e77ad37a5c3b910fe23f3090dac0f4079419af19` is deployed to READY Preview `dpl_7wig7xrzUDR8dVmdggHw2QpbarkH` and its verified source is now preserved on main through PR #1. The prior Production deployment is retained; Production promotion remains withheld pending signup acceptance. Production redirect generation passes; both tested Preview origins still fall back to Production; real inbox delivery is unverified. The GitHub integration's HTTP 403 was resolved for this operation by using the owner's existing authorized Git credentials without changing integration permissions.

Fresh checks: 56 automated passes/one optional skip, 14 local browser passes/five skips, both build targets, TypeScript, lint with zero errors/six existing warnings, zero npm audit vulnerabilities, and no source/client/history secret findings. Hosted acceptance and detailed feature evidence are recorded in [FINAL_PROJECT_COMPLETION.md](FINAL_PROJECT_COMPLETION.md) and [PRODUCTION_RELEASE_VERIFICATION.md](PRODUCTION_RELEASE_VERIFICATION.md).

Automatic approval review rejected downloading secret-bearing Vercel environment files. Verification instead used variable names/scopes, origin-scoped short-lived OIDC authentication, actual hosted inference, and database assertions. No environment values were rewritten. Local mock mode and the existing local quota override remain intact. `AI_GENERATION_ENABLED` is not read at runtime; the implemented live switch is `OPENROUTER_ENABLED=false`.

## Historical configuration snapshot — October 13, 2026

> Configuration snapshot from October 13, before the release commit and hosted Preview. For current commit/deployment status and auth release blockers, see [PRODUCTION_RELEASE_VERIFICATION.md](PRODUCTION_RELEASE_VERIFICATION.md).

October 13, 2026. **REVERSEPATH CONFIGURATION SIMPLIFIED — READY FOR MANUAL VERCEL SETUP.**

## A. Final architecture

The app uses exactly three external services: **Supabase** (Auth, PostgreSQL, Storage), **OpenRouter** (all real model inference), and **Vercel** (the intended frontend/server-function host). React, TanStack Start/Query/Router, Tailwind, Nitro, and the existing AI SDK remain. Native Vite plugins replace the Lovable build wrapper; the default standalone build uses Node instead of Cloudflare. Fonts are served locally with their original open-font licenses. No interface redesign or product feature was added.

Mock AI remains deterministic and explicitly labelled. The live provider cannot route to Gemini, Groq, direct OpenAI/RouterPlus, Lovable AI, or an arbitrary configured base URL. All FAST/PRIMARY/CRITIC/FALLBACK roles use `OPENROUTER_MODEL_DEFAULT`. Schema/graph validation, Supabase JWT authorization, RLS and transactional operations are preserved.

## B. Exact required environment variables

For a live deployment, use these **eight names**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL_DEFAULT`
- `AI_PROVIDER_MODE=live`

The two URL names share one project URL; the two publishable-key names share one key. There are three unique credentials: Supabase publishable key, Supabase server secret, and OpenRouter key. Only publishable keys may enter the browser. Mock-only work requires just the five Supabase names; missing AI mode defaults to mock. Full public/private/required/environment/value-source tables are in [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md).

Local `.env` was retained. Its actual OpenRouter key authenticated successfully before any rename. Only lowercase `openrouter_api_key` was normalized to `OPENROUTER_API_KEY`; the key's value was not changed or substituted. No RouterPlus key was relabelled as OpenRouter. A compatible low-cost model, `openai/gpt-4.1-mini`, was selected after checking the OpenRouter catalog and then tested live. Local mode remains **mock** by default. Existing manually configured credential values were preserved; obsolete non-secret switches/metadata were removed.

## C. Removed or deprecated configuration

Removed from runtime and normal templates: `GEMINI_*`, `GROQ_*`, `OPENAI_*`, `LOVABLE_*`, `AI_PROVIDER_ALLOWLIST`, all four `AI_ROUTE_*`, all four per-role `OPENROUTER_MODEL_*`, configurable `OPENROUTER_BASE_URL`, separate OpenRouter attribution variables, `OBJECT_STORAGE_PROVIDER`, `VITE_SUPABASE_PROJECT_ID`, and all `SUPABASE_TEST_*` overrides.

Tests now use primary Supabase credentials. Existing ignored legacy test-key assignments were retained privately because they are credentials, but are unused. The checker warns by variable name only. Legacy names appear only in historical documentation, the checker's deprecation pattern, and a negative regression proving old credentials cannot activate inference. There is no active hidden dependency on them.

Removed unused Lovable OAuth/session broker, cron auth helper, editor error forwarding, and Notion export stub. Removed their two direct Lovable dependencies and the redundant tsconfig-paths plugin. Removed stale Bun lock/config so npm has one authoritative lockfile. The repository's Lovable Git-history instructions in AGENTS.md remain respected.

## D. Code changes

| Files                                                                                         | Purpose                                                                                                                                |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/ai-gateway.server.ts`                                                                | Fixed OpenRouter transport, one model, safe mock default, bounded controls, understandable errors                                      |
| `src/ai/orchestrator.server.ts`                                                               | One provider with bounded retries; required structured-output routing; existing Zod/telemetry preserved                                |
| `scripts/check-env.mjs`, new `scripts/check-openrouter.mjs`, `package.json`                   | Validate exact environment names, public-secret separation, duplicates and model/credential compatibility without inference            |
| `.env.example`                                                                                | Minimal template with documented optional defaults and explicit test gates                                                             |
| `scripts/run-e2e.mjs`, `tests/helpers/test-env.ts`                                            | Use primary Supabase configuration; eliminate test credential overrides                                                                |
| `tests/unit/ai-gateway.test.ts`, `tests/unit/ai-orchestrator.test.ts`                         | Regression coverage for OpenRouter-only behavior, mock safety, bounded controls and missing config                                     |
| New `tests/integration/openrouter-adapter.test.ts`, `tests/integration/live-ai-smoke.test.ts` | Verify authenticated JSON-schema transport and required parameters; remove old provider smoke branches and false-success auth handling |
| `tests/e2e/golden-path.live-supabase.spec.ts`, `tests/e2e/planning-scenarios.spec.ts`         | OpenRouter provenance, real saved-plan completion/progress/refresh, mobile checks                                                      |
| `tests/e2e/signup-confirmation.spec.ts`                                                       | Require an authorized unique disposable mailbox; avoid deleting a preexisting account                                                  |
| `src/routes/auth.tsx`, `src/integrations/supabase/client.ts`                                  | Direct Supabase OAuth/session storage; existing password auth unchanged                                                                |
| `src/integrations/supabase/client.server.ts`, `auth-middleware.ts`                            | Replace obsolete setup guidance only; authorization logic retained                                                                     |
| `src/lib/object-storage.server.ts`                                                            | Remove unused provider selection; keep Supabase storage operations                                                                     |
| `vite.config.ts`, `package.json`, `package-lock.json`                                         | Native existing framework plugins, explicit Node/Vercel builds, dependency cleanup                                                     |
| `src/routes/__root.tsx`, `src/styles.css`, new `src/fonts.css`, `public/fonts/`               | Remove editor reporting and serve the same fonts locally, preserving appearance                                                        |
| `scripts/scan-secrets.mjs`                                                                    | Handle tracked files deleted in the working tree without crashing                                                                      |
| `README.md`, `docs/SIMPLE_ARCHITECTURE.md`, `docs/VERCEL_ENV_SETUP.md`                        | Current contributor setup, architecture, and one manual Vercel checklist                                                               |
| Prior architecture/setup/release reports                                                      | Add historical banners; retain their original record beneath the banner                                                                |

Previously prepared backend configuration/SQL artifacts remain in the working tree from the earlier approved repair; no SQL migration was reapplied in this cleanup.

## E. Test results

| Check                                                           | Actual outcome                                                                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial pre-refactor mock suite                                 | 49 passed, 10 gated skips                                                                                                                                                                          |
| Refactored normal mock suite                                    | 47 passed, 7 gated skips                                                                                                                                                                           |
| Refactored suite with real Supabase gate                        | **53 passed, 1 live-smoke skip**                                                                                                                                                                   |
| `npm run check:env`                                             | Passed in mock and explicit live mode                                                                                                                                                              |
| `npm run check:ai`                                              | OpenRouter authentication and catalog capability check passed; no inference                                                                                                                        |
| `npm run typecheck`                                             | Passed                                                                                                                                                                                             |
| `npm run lint`                                                  | Passed, zero errors; six preexisting Fast Refresh warnings                                                                                                                                         |
| `npm run build:node`                                            | Passed                                                                                                                                                                                             |
| `npm run build:vercel`                                          | Passed, Node 24 target; no deployment                                                                                                                                                              |
| Full mock browser suite at localhost:5173 with Golden Path gate | **12 passed, 5 skipped**                                                                                                                                                                           |
| Built standalone Node server browser checks                     | **6 passed**: public/auth guard, desktop/mobile demo, full mock Golden Path, mobile owner isolation                                                                                                |
| Controlled real OpenRouter Career plan browser test             | **1 passed**, including saved plan, action completion, progress, refresh and mobile layout                                                                                                         |
| Public signup email acceptance                                  | Initial fixture failed: HTTP 400 `email_address_invalid` for generated example.com address; corrected gate skips without authorized mailbox; live delivery remains **BLOCKED**, not claimed passed |
| `npm audit`                                                     | Zero vulnerabilities                                                                                                                                                                               |
| Secret scanner                                                  | Zero findings in repository source candidates and both client build outputs                                                                                                                        |
| `git diff --check`                                              | Passed; Windows line-ending notices are informational                                                                                                                                              |

The standalone live-smoke gate was intentionally not run because a real full-plan test already validated OpenRouter structured generation. Startup alias/import issues exposed while removing the wrapper were corrected before the passing runs. No unresolved critical deterministic test/build failure remains. The separate public email-delivery limitation is recorded in [PENDING_ISSUES.md](PENDING_ISSUES.md).

## F. Local Supabase status

The current endpoint identifies **Reverse Engineering**, reference `usvopldwiwzlvoqawvcu`, Tokyo. Browser/server URLs and publishable-key values match. The deleted project was not used.

Gated tests against the new database pass owner isolation, cross-parent ownership enforcement, action edits/completion and prerequisite enforcement, transactional rollback, concurrent version allocation, check-ins, strategy selection, and version activation. The browser Golden Path verifies goals, graphs, completion/progress persistence, rejected/accepted replans, session refresh, logout, and another user's denied access. Test cleanup deletes only unique test-owned accounts/resources.

No Supabase project, database setting, RLS policy, table, or migration was changed/reapplied during this simplification. Existing server-secret use remains restricted to trusted server operations and disposable test administration. Storage still uses Supabase's existing adapter; this task did not create buckets or add file features.

## G. AI integration status

**PASS — actual OpenRouter**, model `openai/gpt-4.1-mini`, official fixed endpoint `https://openrouter.ai/api/v1`.

The stored key was accepted by OpenRouter's authenticated key endpoint. The model catalog declares `structured_outputs` and `response_format`; requests set `provider.require_parameters=true`. Live analysis and plan generation passed Zod/domain checks, saved and activated a real plan in the new Supabase database, and retained progress after completing an action and refreshing. The saved version's UI provenance identifies OpenRouter. No mock substitution occurred in the live run.

Two successful schema-valid inference calls: **2,662 input tokens, 2,250 output tokens**. Catalog rates were $0.40/million input and $1.60/million output, giving estimated **$0.0047**, well below the $2 allowance. This is a catalog estimate, not a provider billing statement. Disposable live fixtures were cleaned up after persistence was verified.

## H. Vercel setup checklist

Use only [docs/VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md). Manually add its eight required names to **both Production and Preview** in the existing `reversepath-vibesprint` project. Add optional overrides only if needed. There are no per-role provider branches or duplicate application logic. Build-time `VITE_*` settings require a new build after saving.

The user reported clearing old Vercel values. This task did not assume those values are valid, read/change Vercel settings, create another project, deploy, or promote anything. Hosting verification will require a separate authorized deployment after the user confirms the settings are saved.

## I. Remaining manual actions

1. Save the eight required values for Production and Preview in the existing Vercel project using the new Supabase credentials and actual OpenRouter key. Confirm they are saved before requesting deployment.
2. For public signup/email acceptance, provide an authorized disposable mailbox template and confirm real inbox receipt; allow the intended deployment origins in Supabase Auth if needed. This is not required for the verified disposable-account login/planning flow.
3. Optionally remove preserved unused local test credentials and enable Supabase leaked-password protection. Neither was changed automatically.

No CLI authentication, new provider, new project, payment, or database reset is needed for the completed local checks.

## J. Git status

- Branch: `codex/production-stabilization`.
- HEAD: `b6960d05ac56435815fd0f8eb251078f612fd0c6`.
- Changes are **uncommitted**. Modified source/config/tests/docs, removed unused integrations/dependencies and Bun files, and new OpenRouter adapter/check script, font assets, architecture/checklist/report files are present. Earlier uncommitted backend artifacts are preserved.
- No commit, push, merge, force push, history rewrite, deployment, promotion, or production setting change occurred during this cleanup.

The development server remains available at http://localhost:5173 with safe mock AI. The temporary built Node test server was stopped after verification.
