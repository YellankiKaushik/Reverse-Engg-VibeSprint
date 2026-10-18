# Vercel environment setup

The verified migration uses **Supabase + direct Gemini + Vercel**. The complete real Gemini Free Tier Golden Path has passed locally. Keep the existing project and public deployment. The owner’s manual variable update has been privately verified for both targets. The new Preview is deployed; Production is held on its new authentication redirect gate. See [current hosted verification](PRODUCTION_RELEASE_VERIFICATION.md).

## Required configuration

| Name                          | Scope          | Source                                                         |
| ----------------------------- | -------------- | -------------------------------------------------------------- |
| VITE_SUPABASE_URL             | Public browser | Existing Supabase URL                                          |
| VITE_SUPABASE_PUBLISHABLE_KEY | Public browser | Existing publishable key                                       |
| SUPABASE_URL                  | Server         | Same project URL                                               |
| SUPABASE_PUBLISHABLE_KEY      | Server         | Same publishable key                                           |
| SUPABASE_SERVICE_ROLE_KEY     | Private server | Existing server secret                                         |
| GEMINI_API_KEY                | Private server | Existing key for a verified Free Tier project                  |
| GEMINI_MODEL_DEFAULT          | Server         | gemini-3.8-flash                                               |
| AI_PROVIDER_MODE              | Server         | mock locally; live only for deliberate verified-free inference |

Never expose Gemini or Supabase server secrets through VITE_* variables. Preserve matching URL/key pairs. The ignored .env remains private.

## Free-tier requirement

Google documents free-tier pricing and structured outputs for gemini-3.8-flash. The existing key and catalog pass, but do not reveal project billing tier or remaining free quota. Verify **Google AI Studio → Projects → Free Tier**, with no paid billing enabled. Do not link billing, add credits, or call paid-only models. A model name cannot make a paid project's generation free.

The owner confirmed Free Tier, the available "Set up billing" option, and no paid billing enabled. The first current availability probe returned 503; the second passed after 2.1 seconds of backoff. The complete real Golden Path then passed using gemini-3.8-flash, including bounded recovery from one further replan 503. No 3.6 inference or other provider was needed. Remaining project quota is not exposed by the catalog and is not claimed. See [Gemini verification](GEMINI_VERIFICATION.md).

## Owner update completed and verified

These server variables have already been saved and privately verified in both Preview and Production; no repeat setup is requested:

```dotenv
GEMINI_API_KEY=<existing private key>
GEMINI_MODEL_DEFAULT=gemini-3.8-flash
AI_PROVIDER_MODE=live
```

Preserve Supabase settings; the eventual live target uses AI_PROVIDER_MODE=live. After the accepted migration, these variables are obsolete for its new deployments:

- OPENROUTER_API_KEY
- OPENROUTER_MODEL_DEFAULT
- OPENROUTER_ENABLED

Role-specific OpenRouter variables are also unused. Preserve rollback access until release acceptance; existing deployments still contain the old implementation. No environment variables or protection settings were changed by the agent. A new Preview was deployed; public Production remains unchanged.

## Optional controls

Keep only controls you use: AI_PROVIDER_TIMEOUT_MS (90000; maximum 300000), AI_PROVIDER_MAX_RETRIES (0; maximum 2), AI_MAX_OUTPUT_TOKENS (12000; range 256–16384), shared/operation-specific daily limits, and SUPABASE_STORAGE_BUCKET. Defaults remain 20 intake and 10 plan/replan requests per user per day, per operation. Only 503/429 are eligible for opt-in retries, with at most three total attempts, approximately 2/5-second backoff plus jitter, and Retry-After respected. A cooldown longer than 60 seconds ends the request. 400/401/403, configuration, schema and graph errors are not blindly retried. The successful controlled run used AI_PROVIDER_MAX_RETRIES=2; setting this existing optional control to 2 reproduces that bounded retry policy. No additional environment variable was introduced. VITE_AUTH_PROVIDER=supabase is optional; APP_ENV and PUBLIC_APP_URL are not required for routing or authentication.

Test gates belong in controlled local testing. Run configuration checks, typecheck, lint, tests, the Vercel build, audit and secret scanner. The local real intake → plan → validate → save → strategy/action/progress/refresh → check-in → real replan → reject and accept revisions has passed. Hosted Gemini verification now passes; the new Preview redirect allowlist and Google account-return acceptance remain release gates. Mock passes do not replace real acceptance. Historical provider reports remain historical.
