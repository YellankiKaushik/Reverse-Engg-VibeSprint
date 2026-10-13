> **Historical document — superseded by the OpenRouter-only cleanup on October 13, 2026.** Previous provider, account, project, deployment and environment instructions below are retained as history. Use [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md), [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md), and [FINAL_CONFIGURATION_REPORT.md](FINAL_CONFIGURATION_REPORT.md) for current setup and evidence. Do not use deleted-project credentials or replay historical deployment/migration instructions.

# New backend localhost verification

Verified October 13, 2026. Current status: **BACKEND PASS — REAL AI PASS — LOCALHOST PASS**.

## Completed backend and live verification

The user explicitly approved four reviewed migrations. The connected Supabase tool verified project name/reference and applied `restrict_internal_ownership_helpers`, `atomic_execution_updates`, `atomic_plan_persistence`, and `atomic_checkins_and_strategy_selection`. All eight migrations are now recorded; the base four have historical timestamps different from local filenames. CLI login was stopped at the user's request and was not required for these changes.

Catalog checks confirmed all 16 tables with RLS enabled, all owner policies, ownership/profile/timestamp triggers, required foreign keys and uniqueness constraints. All application RPCs are SECURITY INVOKER, anonymous execution is denied, and the internal helper is denied to anon/authenticated roles. All SQL advisor warnings cleared; leaked-password protection remains disabled and was not changed.

Updated checks:

- Gated `npm test`: **55 passed, 4 paid-AI tests skipped**.
- Mock `npm run test:e2e` against localhost:5173 with the authenticated gate: **12 passed, 5 skipped** (three optional live scenarios, public email delivery, and unconfigured-auth state).
- Real RouterPlus Career scenario: **1 passed**. One actual plan was schema/graph-validated, saved and activated in this new project. Action completion and progress were verified in the browser and database, then survived refresh. The same saved plan passed mobile layout checks. No browser runtime errors occurred. Only disposable test fixtures were removed afterward.
- Live telemetry: **2 successful schema-valid calls**, 2,600 input tokens and 6,859 output tokens using `gpt-6-luna`; estimated **$0.0037**, not a provider billing statement. Model catalog rates were $0.10/million input and $0.50/million output.
- Typecheck, lint (six existing warnings), secret scan and diff whitespace checks pass. Existing Node build passed earlier; no application source changed in this fix. The existing live scenario test was extended to verify action/progress database persistence and mobile layout.

Local AI is now enabled with the existing RouterPlus settings. The server runs at http://localhost:5173. Vercel Preview/Production and GitHub push are pending the user's manual environment update confirmation; see [release checklist](NEW_BACKEND_RELEASE_CHECKLIST.md).

The sections below preserve the initial diagnosis and pre-fix evidence; their missing-RPC and mock-only status statements are historical.

## Target and local configuration

- User-designated project: Reverse Engineering, Reverse Engg organization, Tokyo.
- Project reference from the ignored `.env`: `usvopldwiwzlvoqawvcu`.
- Frontend, backend, and test URLs agree. Public keys agree. The server service-role JWT and legacy test JWTs identify this reference. Each configured application/test Supabase credential successfully authenticated against this endpoint.
- No duplicate assignments or deleted-project references exist in `.env`; no additional local environment files are present.
- `VITE_AUTH_PROVIDER=supabase`, `APP_ENV=local`. Corrected `PUBLIC_APP_URL` to `http://localhost:5173` and changed `AI_PROVIDER_MODE` to `mock` for deterministic verification.
- The shell inherits an unrelated `OPENAI_API_KEY`. App/test processes were started with only this inherited value cleared, allowing the private `.env` value to load. Global Windows environment settings were not changed.
- `npm run check:env` passed. Private credential/browser exposure checks passed, `.env` is Git-ignored, and the existing secret scanner reported zero findings in source and generated client assets.
- Removed the stale CLI link to the deleted project. Updated `supabase/config.toml` metadata; this does **not** establish an authenticated remote CLI link.

## Remote database evidence

The authenticated REST schema lists all 16 application tables. Disposable-account integration tests successfully sign in and verify base ownership isolation. This does not establish that every constraint, trigger, policy, or migration matches the current repository.

The following application RPCs are absent from the REST schema, and live integration tests fail with `PGRST202`:

- `update_execution_node`: action completion/editing and prerequisite enforcement.
- `persist_plan_graph`: atomic graph persistence and version allocation.
- `save_plan_check_in`: transactional check-ins. `select_plan_strategy` is also absent from the schema.

An anonymous, non-mutating call to `require_same_owner` returned 204, confirming the internal helper permission restriction is missing or has been reverted. Relevant reviewed migration files:

- `20261011095115_restrict_internal_ownership_helpers.sql`
- `20261013084557_atomic_execution_updates.sql`
- `20261013085758_atomic_plan_persistence.sql`
- `20261013090748_atomic_checkins_and_strategy_selection.sql`

All eight local migration SQL files were reviewed. They create the schema and ownership policies/triggers, restrict helper permissions, and add owner-scoped transactional operations. The reviewed later migrations do not bulk-delete or reset data. Existing trigger replacements preserve ownership checks; application updates execute under RLS. The base CREATE TABLE/TYPE migrations must not be blindly replayed over existing objects.

The CLI account initially listed no accessible projects and rejected linking with insufficient privileges. The connected Supabase plugin sees only an unrelated LoadGuard project, which was not modified. Explicit new-project migration-list and dry-run attempts could not connect without an IPv4 pooler link. No remote migration was applied, history repaired, bootstrap executed, or database reset.

The user requested interactive CLI login, which was launched in a PowerShell terminal in this project. After authentication: verify account/project identity, link explicitly to the reference above, inspect migration history and actual schema, perform the dry run, and ask once for approval of the exact missing migrations before applying them.

## Authentication and browser results

At `http://localhost:5173`, real disposable accounts passed password sign-in, refresh session persistence, logout, generated confirmation callback, password reauthentication, and mobile denial of another user's objective. These tests clean up only their own fixtures. The generated-link test does not test public email delivery and sends no signup email; email confirmation settings were not changed.

Public route protection, understandable auth errors, signup error recovery, and demo desktop/mobile behavior passed. Demo persistence is browser storage and is not proof of live plan persistence. Full authenticated Golden Path and live planning remain blocked by missing transaction RPCs.

## AI verification

RouterPlus configuration uses `https://api.routerplus.com/v1`, is enabled, and has a private key. An authenticated `/models` request returned 200 and includes the configured `gpt-6-luna` model. No paid generation calls were made. Adapter structured generation, saved live provenance, live plan persistence, and cost remain to be verified after mock backend tests pass. AI remains in mock mode.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run check:env` | Passed |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; 6 existing Fast Refresh warnings |
| `npm test` | 49 passed, 10 gated tests skipped |
| Gated Supabase integration run | 8 passed, 4 failed, 4 skipped; all 4 failures concern missing transaction RPCs |
| `npm run build:node` | Passed; existing framework deprecation/plugin warnings |
| `npm run test:e2e` default | 9 passed, 8 gated tests skipped |
| Public/auth/demo browser checks at localhost:5173 | 9 passed, 1 unconfigured-auth test skipped |
| Gated real confirmation and mobile owner-isolation checks at localhost:5173 | 2 passed |
| Secret scan | Zero findings |

The development server is running at `http://localhost:5173` with mock AI. No Vercel operation, Git push, commit, or history rewrite was performed during this verification. Do not claim localhost readiness or real AI verification until migration, persistence, Golden Path, and controlled live-generation checks pass.
