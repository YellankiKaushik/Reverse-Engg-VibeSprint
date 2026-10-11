# ReversePath Vibe Sprint setup

## Dedicated Supabase project

**Current project is already created and migrated:** ReversePath, reference `kvytcttuskwwbmmmjjri`, Singapore, user's kaushikyellanki account. Use the authenticated CLI for this account; the connected MCP account differs. Four original migrations and one helper-permission security migration are applied. Do not create another project, run the bootstrap, or repeat initialization. Instructions below remain a reference for private configuration.

1. Open https://supabase.com/dashboard and select **New project** in your own organization.
2. Name it **ReversePath-VibeSprint**. Choose an available Asia region near your users and a strong database password. Keep the password private; the application does not need that password in `.env`.
3. Wait until the project is active. Record its project reference ID.
4. Under Project Settings / API (or Connect / API keys), copy the project URL, publishable key, and a server secret key privately into the existing ignored `.env`.

| `.env` name | Value source |
| --- | --- |
| `VITE_SUPABASE_URL` | New project's URL |
| `SUPABASE_URL` | Same project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable API key |
| `SUPABASE_PUBLISHABLE_KEY` | Same publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret key (`sb_secret_…`) or legacy service-role key |
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID; optional application metadata |
| `VITE_AUTH_PROVIDER` | `supabase` for this independent project; `lovable` retains brokered Lovable OAuth |
| `AI_PROVIDER_MODE` | Keep `mock` during database verification |
| `PUBLIC_APP_URL` | Local origin initially; production origin after deployment |

Never place a secret/service-role key in any `VITE_*` variable. Never send credentials in chat. `.env`, `.env.*`, databases, dependencies, and build outputs are ignored by Git; `.env.example` is the sole exception.

### Install the existing schema, only on the new empty project

The four existing migrations define the schema, owner-scoped RLS, ownership triggers, and atomic plan activation. Static tests pass; the SQL has **not** been executed against a new project yet.

Preferred CLI workflow (inspect `npx supabase --help` and subcommand help before use):

```powershell
npx supabase login
npx supabase link --project-ref YOUR_NEW_PROJECT_REF
npx supabase db push --dry-run
```

Verify the linked reference matches the newly created project, then apply the reviewed migrations with `npx supabase db push`. Do not reset any remote database. CLI login/link/apply may require account interaction; ask the agent to continue after you provide the **reference ID**, not secrets.

The legacy `supabase/FINAL_REMOTE_BOOTSTRAP.sql` mirrors only the four original migrations. Do not run it on the configured project; CLI migration history is authoritative, including the fifth helper-permission security migration. Never mix bootstrap execution with the applied CLI workflow.

In Authentication / URL Configuration, allow `http://localhost:5173` and `http://127.0.0.1:4173` for local work; add the deployment origin when it exists. Keep email confirmation enabled if desired: signup now explains that email confirmation is required. Google sign-in requires configuring the Google provider separately; email sign-in is sufficient for the MVP.

### Verify Supabase before spending AI credits

```powershell
npm run check:env
$env:RUN_SUPABASE_RLS_TESTS="true"
npm run test:integration
$env:RUN_SUPABASE_RLS_TESTS=$null
$env:RUN_E2E_GOLDEN="true"
npm run test:e2e
$env:RUN_E2E_GOLDEN=$null
```

The authenticated Golden Path honors `.env` AI mode and routes; with `mock`, it verifies sign-in, persistence, completion/progress after refresh, revision review, and cross-user isolation without paid inference. Live test scripts create unique test-owned users/rows and clean up only those users. Normal tests do not prove remote RLS or database persistence.

## RouterPlus through the existing adapter

Official docs: https://app.routerplus.com/docs/api-chat-completions and https://app.routerplus.com/docs/api-models.

RouterPlus supports the existing OpenAI-compatible `/v1/chat/completions` adapter. Use an OpenAI-family model for `response_format: json_schema`; RouterPlus documents that Anthropic-translated routes reject that parameter. The public catalog at https://app.routerplus.com/api/models.json lists `gpt-6-luna` as of October 11, 2026; confirm the exact ID in the **authenticated** `/v1/models` response for your key before using it. No real RouterPlus request has been made for this application yet.

Configure privately:

```dotenv
OPENAI_BASE_URL=https://api.routerplus.com/v1
OPENAI_ENABLED=true
OPENAI_API_KEY=YOUR_PRIVATE_ROUTERPLUS_KEY
OPENAI_MODEL_DEFAULT=CONFIRMED_MODEL_ID
AI_PROVIDER_ALLOWLIST=openai
AI_ROUTE_FAST=openai
AI_ROUTE_PRIMARY=openai
AI_ROUTE_CRITIC=openai
AI_ROUTE_FALLBACK=openai
AI_PROVIDER_MAX_RETRIES=0
AI_DAILY_REQUEST_LIMIT=10
AI_PROVIDER_MODE=mock
```

Role-specific `OPENAI_MODEL_*` variables can remain empty; the default model now correctly applies. `openai` is the adapter ID even when its base URL points to RouterPlus. Do not set the allowlist to `routerplus`, which is not an adapter ID. Invalid explicit allowlists now fail closed.

This Codex shell currently inherits an unrelated `OPENAI_API_KEY`. To allow your private `.env` key to take effect in local commands, clear **only the shell's inherited value** before running the app/tests:

```powershell
$env:OPENAI_API_KEY=$null
```

This does not delete the key saved in `.env` or change global Windows settings. Existing environment variables take precedence over `.env`. Do not run live tests until the effective key and model are confirmed.

When ready, privately change `.env` to `AI_PROVIDER_MODE=live`, restart the server, and run:

```powershell
$env:OPENAI_API_KEY=$null
$env:RUN_LIVE_AI_SMOKE="true"
npm run test:integration -- --run tests/integration/live-ai-smoke.test.ts
$env:RUN_LIVE_AI_SMOKE=$null
$env:RUN_E2E_GOLDEN="true"
npm run test:e2e
$env:RUN_E2E_GOLDEN=$null
```

The smoke call is deliberately tiny, but it is real paid inference. The full live Golden Path makes intake, plan, and replan calls. Mock and live generation provenance is stored in plan-node metadata and displayed for the saved version. Older versions without provenance are labelled unknown, never assumed live.

## Deployment

Vercel is prepared through Nitro's `vercel` preset. `npm run build:vercel` generates `.vercel/output` with an SSR/server-function handler; `vercel.json` supplies the build command. The production server is not a static-only Vite site.

The dedicated Vercel project already exists: `reversepath-vibesprint`, ID `prj_McY3U5riuZN49HM72w9Bv7Ng0J1M`, team `kaushik-yellanki-project`, free Hobby plan. Reuse it; do not create another hosting project. The verified production origin is `https://reversepath-vibesprint.vercel.app`, with `/demo` as the prepared fallback.

After real integration passes, configure the environment names above privately for production and run a remote build/deployment. Use Node 24 (the tested runtime). Set Supabase's Site URL and `PUBLIC_APP_URL` to `https://reversepath-vibesprint.vercel.app`; allow that origin and the local test origins as authentication redirects. Provider keys and server Supabase secret must remain runtime secrets. `VITE_*` public values must be available at build time. `.vercelignore` excludes `.env` from source upload. User authorization covers safe updates to this existing deployment; preserve the working demo until the real hosted Golden Path passes.

Do not deploy the current unconfigured build as a working authenticated/live product. An offline-only preview can be published only if explicitly approved and labelled as such. A successful local Vercel build is not proof of a working public deployment.

For any Node host:

```powershell
npm run build:node
npm start
```

`npm start` loads a local `.env` when present. Hosting-supplied environment variables still take precedence. `npm run build` retains the original Lovable/Cloudflare target selection; use the named build script for the intended host.

## Two-minute demonstration

- 0:00–0:20: Explain how vague goals lack clear prerequisites and an achievable next step.
- 0:20–0:40: Sign in and choose the product-manager example under New objective.
- 0:40–1:15: Show analysis, answer relevant questions if asked, and generate the plan. Describe the actual AI mode.
- 1:15–1:40: Show the dependency map, strategy, and highest-ranked next action.
- 1:40–2:00: Complete an action, show changed progress, and refresh to confirm persistence.

Recovery: open `/demo`, say **“This is our prepared offline example, not live AI,”** load the six-month PM plan, complete the first action, and refresh. It uses the real deterministic frontier/progress functions and browser storage, not Supabase. The fallback has been tested on desktop and mobile through full completion and reset.
