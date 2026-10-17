# Vercel environment setup

Use the existing **reversepath-vibesprint** project. This is the single current environment checklist. Old release reports describe previous providers and must not be used to configure the app.

The app uses Supabase, OpenRouter, and Vercel. The OpenRouter endpoint is fixed to `https://openrouter.ai/api/v1`; all AI roles use one model. Never paste private keys into chat, source files, `.env.example`, or a `VITE_*` variable.

## Required variables

These eight names are sufficient for live inference and the application's authentication/data operations. For mock-only local work, the last three can be omitted because mock is the safe default.

| Exact name                      | Public/private            | Value source                                              | Required               | Vercel environments  | Shares a value?                         | Why it exists                                                       |
| ------------------------------- | ------------------------- | --------------------------------------------------------- | ---------------------- | -------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Public                    | New Supabase project URL                                  | Yes                    | Production + Preview | Same as `SUPABASE_URL`                  | Browser authentication and database access                          |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public                    | New project's publishable key                             | Yes                    | Production + Preview | Same as `SUPABASE_PUBLISHABLE_KEY`      | Browser requests, protected by RLS                                  |
| `SUPABASE_URL`                  | Server config, not secret | Same project URL                                          | Yes                    | Production + Preview | Same as `VITE_SUPABASE_URL`             | Authenticated server functions                                      |
| `SUPABASE_PUBLISHABLE_KEY`      | Server config, not secret | Same publishable key                                      | Yes                    | Production + Preview | Same as `VITE_SUPABASE_PUBLISHABLE_KEY` | Server queries execute with the user's JWT and RLS                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Private Secret            | New project's `sb_secret_` key or legacy service-role JWT | Yes                    | Production + Preview | Separate server credential              | Trusted telemetry, quotas, idempotency; test administration locally |
| `OPENROUTER_API_KEY`            | Private Secret            | OpenRouter key settings; existing local key               | Yes for live           | Production + Preview | Separate AI credential                  | Authenticates server-side OpenRouter requests                       |
| `OPENROUTER_MODEL_DEFAULT`      | Server config, not secret | OpenRouter catalog; tested `openai/gpt-4.1-mini`          | Yes for live           | Production + Preview | One model for all roles                 | Structured intake, plans, and replans                               |
| `AI_PROVIDER_MODE`              | Server config             | `live` for real AI, `mock` for deterministic examples     | Set `live` for real AI | Production + Preview | Same behavior in either environment     | Makes paid inference deliberate; defaults to mock                   |

There are **three unique credential values**: a Supabase publishable key (used under two names), a Supabase server secret, and an OpenRouter key. The two URL names identify the same project; they are not two services. Modern Supabase keys are supported. Never substitute a secret for a publishable key.

## Optional variables

All are optional. Omit them to use the documented defaults. `APP_ENV` is metadata and has no runtime effect. The application does not read `AI_GENERATION_ENABLED`; use `OPENROUTER_ENABLED=false` to disable live inference.

| Exact name                              | Public/private            | Value/source and default                                                                  | Required | Environments | Shares a value? | Purpose                                                                       |
| --------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------- | -------- | ------------ | --------------- | ----------------------------------------------------------------------------- |
| `VITE_AUTH_PROVIDER`                    | Public                    | `supabase` (the only supported provider)                                                  | No       | Both         | No credential   | Compatibility label; omission is supported                                    |
| `OPENROUTER_ENABLED`                    | Server                    | `true`; set `false` to disable real inference                                             | No       | Both         | No              | Optional kill switch                                                          |
| `PUBLIC_APP_URL`                        | Server config, not secret | Production: `https://reversepath-vibesprint.vercel.app`; Preview: chosen candidate origin | No       | Both         | No              | Optional OpenRouter attribution header; auth redirects use the browser origin |
| `APP_ENV`                               | Server metadata           | `local`, `preview`, or `production`                                                       | No       | Both         | No              | Describes the environment; does not select a provider or change auth          |
| `AI_PROVIDER_TIMEOUT_MS`                | Server                    | `90000`, capped at `300000`                                                               | No       | Both         | No              | Bounds each inference attempt                                                 |
| `AI_PROVIDER_MAX_RETRIES`               | Server                    | `0`, capped at `3`                                                                        | No       | Both         | No              | Retries only OpenRouter; no other service fallback                            |
| `AI_MAX_OUTPUT_TOKENS`                  | Server                    | `12000`, bounded between `256` and `16384`                                                | No       | Both         | No              | Bounds response size and inference spending                                   |
| `AI_DAILY_REQUEST_LIMIT`                | Server                    | Unset: 20 intake analyses, 10 generations/replans per user/day, per operation             | No       | Both         | No              | Application request quota                                                     |
| `AI_LIMIT_CLASSIFY_AND_CLARIFY_PER_DAY` | Server                    | Defaults to daily request limit                                                           | No       | Both         | No              | Intake operation limit                                                        |
| `AI_LIMIT_GENERATE_PLAN_GRAPH_PER_DAY`  | Server                    | Defaults to daily request limit                                                           | No       | Both         | No              | Generation operation limit                                                    |
| `AI_LIMIT_REPLAN_PER_DAY`               | Server                    | Defaults to daily request limit                                                           | No       | Both         | No              | Replanning operation limit                                                    |
| `SUPABASE_STORAGE_BUCKET`               | Server                    | `reversepath-files`                                                                       | No       | Both if used | No              | Existing Supabase file-storage adapter's bucket name                          |

Local/test-only settings must stay out of deployed configuration:

| Exact names                              | Required | Environment                               | Purpose                                                                                     |
| ---------------------------------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `RUN_SUPABASE_RLS_TESTS`                 | No       | Local/test                                | Disposable-account database regression gate                                                 |
| `RUN_E2E_GOLDEN`, `RUN_E2E_SCENARIOS`    | No       | Local/test                                | Full authenticated flow / controlled real planning scenario                                 |
| `RUN_LIVE_AI_SMOKE`                      | No       | Local/test                                | Tiny real structured-output call, off by default                                            |
| `RUN_E2E_SIGNUP`                         | No       | Local/test                                | Explicit public signup gate                                                                 |
| `E2E_SIGNUP_EMAIL_TEMPLATE`              | No       | Local/test, private mailbox configuration | Authorized disposable mailbox with `{runId}` in the address; prevents reusing real accounts |
| `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_PORT` | No       | Local/test                                | Existing server URL or default test port `4173`                                             |

## Not needed

- `GEMINI_*`, `GROQ_*`, `OPENAI_*` (including RouterPlus credentials), `LOVABLE_*`.
- `AI_PROVIDER_ALLOWLIST`, `AI_ROUTE_FAST`, `AI_ROUTE_PRIMARY`, `AI_ROUTE_CRITIC`, `AI_ROUTE_FALLBACK`.
- `OPENROUTER_BASE_URL`, `OPENROUTER_HTTP_REFERER`, `OPENROUTER_APP_TITLE`.
- `OPENROUTER_MODEL_FAST`, `OPENROUTER_MODEL_PRIMARY`, `OPENROUTER_MODEL_CRITIC`, `OPENROUTER_MODEL_FALLBACK`.
- `VITE_SUPABASE_PROJECT_ID`, `OBJECT_STORAGE_PROVIDER`.
- `SUPABASE_TEST_URL`, `SUPABASE_TEST_PUBLISHABLE_KEY`, `SUPABASE_TEST_SECRET_KEY`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_TEST_SERVICE_ROLE_KEY`. Tests use the primary credentials and clean up only their disposable fixtures.

These variables are not inference/auth/storage configuration paths anymore. Old keys preserved in an existing ignored `.env` are unused and can be removed manually. Key names are case-sensitive: use `OPENROUTER_API_KEY`, not `openrouter_api_key`.

## Manual setup for Production and Preview

1. Open the existing Vercel project's Settings → Environment Variables. Do not create another project.
2. Add the eight required names above, selecting **Production and Preview**. Use the new Supabase project and the actual OpenRouter key. If team policy requires separate secrets, use separately issued keys for the same intended services.
3. Optionally set `PUBLIC_APP_URL` and `APP_ENV` separately for each target. No Preview-specific application code is needed. Do not leave stale branch overrides.
4. Add the intended production/candidate origins in Supabase's Auth redirect allowlist if email confirmation or Google OAuth will be used. Keep email confirmation enabled. Configure Google in Supabase only if you want the existing Google button to work.
5. Verify locally with `npm run check:env`, `npm run check:ai`, mock integration/browser tests, and one explicitly enabled live scenario. `check:ai` authenticates and checks model capability without generating text.
6. After confirming settings are saved, request a deployment. A new build is required for updated `VITE_*` values; old deployed bundles do not update automatically.

Configuration cleanup did not change Vercel settings. A Preview has since been verified; see [release verification](PRODUCTION_RELEASE_VERIFICATION.md). Future production release: build with `npm run build:vercel`, test Preview, stage and test Production before promotion, retain the previous deployment, and push only verified source. No force push.

Model compatibility is checked against the catalog and enforced with `provider.require_parameters=true`. See [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs) and [authentication](https://openrouter.ai/docs/api/reference/authentication).
