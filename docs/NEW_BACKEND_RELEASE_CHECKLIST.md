> **Historical document — superseded by the OpenRouter-only cleanup on October 13, 2026.** Previous provider, account, project, deployment and environment instructions below are retained as history. Use [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md), [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md), and [FINAL_CONFIGURATION_REPORT.md](FINAL_CONFIGURATION_REPORT.md) for current setup and evidence. Do not use deleted-project credentials or replay historical deployment/migration instructions.

# New backend fix and release checklist

Target Supabase: **Reverse Engineering**, `usvopldwiwzlvoqawvcu`, Tokyo. Verified through the connected Supabase tool; CLI login is not required.

## Reviewed database changes — approved and applied

Remote history contains four base migrations under different timestamps from the repository: `initial_reversepath_schema`, `lock_down_profile_trigger_function`, `enforce_reversepath_ownership_integrity`, and `atomic_plan_version_activation`. Do not replay those migrations or change their history.

Direct catalog inspection confirms all 16 application tables with RLS enabled, all 16 owner policies, all 11 ownership triggers, the profile-creation trigger, timestamp triggers, required foreign keys, and unique version/active-version constraints. No missing tables, policies, or triggers were found.

The four subsequent repository migrations were approved and applied through the connected Supabase tool:

1. `20261011095115_restrict_internal_ownership_helpers.sql`: restrict internal helper execution and fix its search path.
2. `20261013084557_atomic_execution_updates.sql`: add transactional action editing/completion.
3. `20261013085758_atomic_plan_persistence.sql`: add transactional graph saving and replace activation with its existing RLS-respecting implementation.
4. `20261013090748_atomic_checkins_and_strategy_selection.sql`: add check-ins and strategy selection.

The exact reviewed SQL is combined in `supabase/LOCALHOST_BACKEND_PATCH.sql`, with BEGIN/COMMIT and a schema-cache reload. It contains no reset, DROP TABLE, TRUNCATE, bulk DELETE, new schema, or disabled RLS. The tool applied the four source migrations and recorded their history. Gated database tests and the mock browser Golden Path now pass. Do not rerun the patch.

SQL Editor alternative retained for reference only (already applied; do not execute again):

1. Open https://supabase.com/dashboard/project/usvopldwiwzlvoqawvcu/sql/new.
2. Confirm the project name is Reverse Engineering and the reference matches the URL above.
3. Paste the entire contents of `supabase/LOCALHOST_BACKEND_PATCH.sql` into a new query and run it once as the SQL Editor's postgres role.
4. Report success or the error message with credentials removed. Do not run FINAL_REMOTE_BOOTSTRAP.sql or the base migrations.
5. Manual execution does not record migration history; tell the agent it was executed manually so it verifies definitions rather than replaying the patch.

The connected tool can instead apply the four reviewed migrations after approval and record migration history. Do not execute both paths.

Supabase advisors confirm the helper search-path and executable-definer warnings addressed by these migrations. Leaked-password protection is disabled; this existing Auth setting is not modified by the patch. Reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Vercel environment checklist — user updates manually

Use only the existing **reversepath-vibesprint** project (`prj_McY3U5riuZN49HM72w9Bv7Ng0J1M`). Replace values in **Production**. For an ordinary Preview deployment, configure matching values in **Preview** as well and remove obsolete branch-specific overrides. Keys are copied privately from the verified local `.env`/new project settings, never into chat or source files.

| Variables | Required value/source |
| --- | --- |
| `VITE_SUPABASE_URL`, `SUPABASE_URL` | `https://usvopldwiwzlvoqawvcu.supabase.co` |
| `VITE_SUPABASE_PROJECT_ID` | `usvopldwiwzlvoqawvcu` |
| `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` | Same new project's publishable key, copied privately |
| `SUPABASE_SERVICE_ROLE_KEY` | New project's server secret/service-role key, server-only Secret |
| `VITE_AUTH_PROVIDER` | `supabase` |
| `APP_ENV` | `production` for Production; `preview` for Preview |
| `PUBLIC_APP_URL` | `https://reversepath-vibesprint.vercel.app` for Production; the actual candidate origin for Preview |
| `OPENAI_API_KEY` | Existing RouterPlus key, server-only Secret |
| `OPENAI_ENABLED`, `AI_GENERATION_ENABLED` | `true` |
| `OPENAI_BASE_URL` | `https://api.routerplus.com/v1` |
| `OPENAI_MODEL_DEFAULT` | `gpt-6-luna`, subject to the authenticated model check |
| `OPENAI_MODEL_FAST`, `OPENAI_MODEL_PRIMARY`, `OPENAI_MODEL_CRITIC`, `OPENAI_MODEL_FALLBACK` | Remove stale overrides or use the same verified model |
| `AI_PROVIDER_MODE` | `live` after local saved-plan verification passes |
| `AI_PROVIDER_ALLOWLIST` | `openai` |
| `AI_ROUTE_FAST`, `AI_ROUTE_PRIMARY`, `AI_ROUTE_CRITIC`, `AI_ROUTE_FALLBACK` | `openai` |
| `AI_PROVIDER_MAX_RETRIES` | `0` |
| `AI_PROVIDER_TIMEOUT_MS` | `90000` |
| `AI_DAILY_REQUEST_LIMIT` | `10` |
| `AI_MAX_OUTPUT_TOKENS` | `12000` (existing plan budget) |
| `GEMINI_ENABLED`, `GROQ_ENABLED`, `OPENROUTER_ENABLED`, `LOVABLE_AI_ENABLED` | `false` |
| `OBJECT_STORAGE_PROVIDER`, `SUPABASE_STORAGE_BUCKET` | `supabase`, `reversepath-files` (existing storage configuration) |

Keep optional operation-specific AI limits consistent with the existing local settings or unset for the daily-limit fallback. Remove `SUPABASE_TEST_*`, `RUN_*`, `PLAYWRIGHT_*` test variables from deployment configuration if present. Never put server keys/provider credentials into any `VITE_*` variable. Public Supabase values must be correct at build time.

Do not overwrite the local `.env` with pulled Vercel values. Old deployment artifacts and environment values are historical and must not be used for the new backend.

## Verification and release order

1. Obtain approval, apply only the reviewed missing migrations, verify database objects and security advisors.
2. Run gated Supabase integration and authenticated Golden Path with mock AI.
3. Privately recheck RouterPlus credentials/model; generate one real saved plan and verify action completion, progress, and refresh. Limit additional inference to $2.
4. Wait for the user's confirmation that Vercel environment values are updated before deploying.
5. Build and test the existing project's candidate, including real auth, data persistence, mobile behavior, and credential scanning. Public email delivery must be distinguished from safe generated-link confirmation tests.
6. For an ordinary Preview, test it, then stage a Production candidate without assigning domains and test that candidate too: promoting a Preview can rebuild with Production variables. Promote only the verified Production build. Preserve existing deployments for rollback; the deleted old backend cannot be restored by rolling back code alone.
7. Commit and push the verified changes to `codex/production-stabilization` without force push or rewriting published history.

Current release status: **backend, real AI, and localhost PASS**. One real RouterPlus plan passed saving/activation, completion, progress/refresh persistence, and mobile layout checks. Two live calls used 2,600 input and 6,859 output tokens, estimated $0.0037 at the current catalog rates. Preview, Production, and GitHub release await the user's Vercel environment confirmation. No deployment or push has occurred.

## Verification after the user's environment-update confirmation

The authenticated CLI resolved the existing project to `kaushik-yellanki-project/reversepath-vibesprint`, ID `prj_McY3U5riuZN49HM72w9Bv7Ng0J1M`, Node 24.x. The connected Vercel plugin could not access this team/project, so the existing authenticated CLI was used.

Fresh environment reads contradict the reported update: Production still has the deleted project's URL/reference in `VITE_SUPABASE_URL`, `SUPABASE_URL`, and `VITE_SUPABASE_PROJECT_ID`, and both public-key values do not match the verified local new-project configuration. Preview lists no application environment variables. Private Secret values are omitted by environment pulls; their omission is not evidence that they are absent. No secret values were printed.

The user was asked to save the new values to the exact existing project's Production and Preview targets. No known-broken deployment was created. `npm run build:vercel` passed with the verified local environment; the client secret scan and whitespace checks passed.

Rollback reference recorded before any release: active production deployment `dpl_CwW6fKNJW6yEgf6rCrpc5dmJjAzH`, URL `https://reversepath-vibesprint-j8vhqsuyf-kaushik-yellanki-project.vercel.app`, owns `reversepath-vibesprint.vercel.app`. It remains READY and has not been modified or removed. Its old backend was deleted, so retaining this deployment preserves the previous offline fallback, not its former backend functionality.
