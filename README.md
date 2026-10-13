# ReversePath

ReversePath turns a goal into a structured plan with prerequisites, strategies, milestones, and next actions. Track completion and progress, then review revised plans as your circumstances change.

**Three external services:** Supabase for authentication, PostgreSQL and storage; OpenRouter for all real AI inference; Vercel for hosting the React/TanStack Start application and server functions. Mock AI and the labelled offline /demo example remain available.

Start with [the simple architecture](docs/SIMPLE_ARCHITECTURE.md), [the single environment checklist](docs/VERCEL_ENV_SETUP.md), and [the verification report](docs/FINAL_CONFIGURATION_REPORT.md). The OpenRouter candidate is deployed and verified on Preview; production release is blocked on Supabase confirmation redirects and real signup email delivery. See [hosted release verification](docs/PRODUCTION_RELEASE_VERIFICATION.md). Previous release reports are historical and do not describe the current OpenRouter configuration.

## Run locally

Use Node 24 and npm. The committed package-lock.json is the only package lock.

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Edit .env privately. Preserve an existing configured .env.
npm run check:env
npm run dev
```

Open http://localhost:5173. Keep AI_PROVIDER_MODE=mock for deterministic, no-cost development. For real inference, configure OPENROUTER_API_KEY and OPENROUTER_MODEL_DEFAULT, run npm run check:ai, then explicitly use AI_PROVIDER_MODE=live and restart. All roles use one model; the tested model is openai/gpt-4.1-mini. The endpoint is fixed to OpenRouter, and keys stay on the server.

## Environment

Five Supabase names are required: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY. The URL names share one URL; the publishable-key names share one credential. Use the existing new project. Never put the server secret in a VITE variable.

Live AI adds OPENROUTER_API_KEY, OPENROUTER_MODEL_DEFAULT, and AI_PROVIDER_MODE=live. Other controls have safe defaults. There are no alternate provider endpoints, routing lists, per-role model names, or test-specific Supabase credentials. See [.env.example](.env.example) and [VERCEL_ENV_SETUP.md](docs/VERCEL_ENV_SETUP.md) for the exact required/optional names and value sources.

The existing schema lives in supabase/migrations. Applied migrations must not be rerun. Database functions preserve ownership, RLS, graph consistency, action prerequisites, and transactional saving. No bootstrap/reset is needed for the configured project.

## Verify

```powershell
npm run check:env
npm run check:ai
npm run typecheck
npm run lint
npm test
npm run build:node
npm run build:vercel
npm run test:e2e
npm audit
node scripts/scan-secrets.mjs
```

Normal tests do not make paid inference calls. Opt-in gates verify disposable Supabase accounts, the full mock Golden Path, and controlled live generation. See [test instructions](docs/SIMPLE_ARCHITECTURE.md#tests). Public signup requires an authorized disposable mailbox; confirmation-link tests do not claim real inbox delivery.

The product flow remains login → goal → analysis → plan → activation → action completion → progress → refresh → replan. Server functions validate the Supabase JWT; user data operations obey RLS. AI proposals pass Zod and graph validation before being saved. /demo is clearly labelled example data and persists in browser storage.

## Vercel

Reuse reversepath-vibesprint. Manually configure both Production and Preview using [VERCEL_ENV_SETUP.md](docs/VERCEL_ENV_SETUP.md). Use Node 24, npm ci, and npm run build:vercel. Test a preview and staged production candidate before promotion, preserve the previous deployment, and never force-push published history. The verified Preview is retained while auth release gates are resolved. Production promotion and GitHub release are withheld; see the hosted verification report.
