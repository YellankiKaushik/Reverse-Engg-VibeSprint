# Direct Gemini Free Tier verification

Updated October 18, 2026. **REVERSEPATH GEMINI FREE TIER VERIFIED — READY FOR VERCEL UPDATE.**

This report accompanies the main-branch Gemini migration. Acceptance was performed locally against the real Google Gemini API and existing Supabase project. Vercel configuration, deployments, aliases and public Production remain unchanged.

## Model, tier and availability

Selected production model: **gemini-3.8-flash**. The existing private key successfully accesses the exact live model catalog; `generateContent` is supported and output capacity is 65,536 tokens. The application keeps its 12,000-token default and 16,384 hard cap.

The owner manually confirmed the key's Google AI Studio project shows **Free tier**, offers **Set up billing**, and has no paid billing enabled. No billing setting was changed. Google documents [$0 Free Tier input/output prices](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.8-flash) and [JSON-schema structured output support](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash). Remaining project quota is not exposed by the catalog; no request balance is invented.

The current controlled availability test made **two** small fictional-intake attempts:

| Attempt                   | HTTP | Result                      | Output tokens | Finish       |
| ------------------------- | ---- | --------------------------- | ------------- | ------------ |
| 1                         | 503  | GEMINI_PROVIDER_UNAVAILABLE | Not returned  | Not returned |
| 2, after 2,109 ms backoff | 200  | Structured intake validated | 412           | STOP         |

3.8 recovered within the three-attempt bound. **3.6 was not inferred or selected**, and is not a runtime fallback. The previous single-503 attempt remains historical; this successful bounded retest supersedes its blocker.

## Complete real browser Golden Path

One Playwright Chromium Golden Path **passed in approximately 2.5 minutes**. It used a fictional product-design career objective, disposable test users, the real Gemini API, actual server functions and the existing Supabase database. No provider response was replaced with a fixture or mock.

| Acceptance step                                       | Result                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Real intake and structured validation                 | PASS                                                                        |
| Save normalized intake/context                        | PASS                                                                        |
| Real compact plan generation                          | PASS                                                                        |
| Zod validation                                        | PASS, original contracts preserved                                          |
| Graph validation                                      | PASS, references/cycles/required graph semantics checked                    |
| Save graph and activate plan                          | PASS                                                                        |
| Switch strategy and restore selected route            | PASS                                                                        |
| Start and complete an action                          | PASS                                                                        |
| Progress changes and persists after refresh           | PASS                                                                        |
| Save check-in and changed capacity                    | PASS                                                                        |
| First real replan and valid candidate graph           | PASS                                                                        |
| Reject first candidate, preserve existing active plan | PASS                                                                        |
| Second real replan and valid candidate graph          | PASS after one bounded 503 retry                                            |
| Accept second candidate                               | PASS                                                                        |
| Refresh and verify active version / database pointer  | PASS: three versions, one rejected, exactly one active v3, matching pointer |
| Re-login and restore saved plan                       | PASS                                                                        |
| Second user cannot load first user's plan             | PASS                                                                        |

The initial persisted graph contains **14 nodes, 14 edges, two strategies, exactly one recommendation, three recommended milestones and seven ACTION/EXPERIMENT nodes**. Prompts retain the approximate 18–22-node target and 24-node/48-edge compact ceilings; no unnecessary nodes were added to fill a quota and no schema was loosened. Both revised graphs contain 14 nodes and 13 edges.

Six logical AI operations succeeded in the Golden Path:

| Operation                 | Input tokens | Output tokens | Finish   | Schema   | Graph               |
| ------------------------- | ------------ | ------------- | -------- | -------- | ------------------- |
| Intake                    | 423          | 445           | STOP     | PASS     | N/A                 |
| Plan                      | 1,512        | 3,928         | STOP     | PASS     | PASS                |
| Replan candidate rejected | 1,984        | 4,087         | STOP     | PASS     | PASS                |
| First change explanation  | 688          | 421           | STOP     | PASS     | N/A                 |
| Replan candidate accepted | 1,997        | 3,924         | STOP     | PASS     | PASS                |
| Second change explanation | 691          | 442           | STOP     | PASS     | N/A                 |
| Total                     | 7,295        | 13,247        | All STOP | All PASS | All applicable PASS |

The second replan first received 503 and then succeeded after bounded backoff. Golden Path total: **seven HTTP inference attempts, six successful outputs**. Including the two availability probes, this retest used **nine HTTP inference attempts: seven successes and two transient 503 responses**. No 429 occurred, no paid model or OpenRouter request was made, and no new provider was introduced. No further inference was sent after acceptance.

## Implementation and safe failure behavior

- The official `@ai-sdk/google` adapter is pinned to `4.0.60` to match existing AI SDK provider types. The old OpenRouter adapter/runtime request policy and checker are removed.
- Every logical role uses the single configured, explicitly allowlisted `gemini-3.8-flash` model at Google's fixed direct endpoint. No automatic model/provider fallback exists.
- Low thinking is configured with thought summaries disabled. Gemini 3.8 does not support minimal thinking; complete thinking disablement is not claimed. No tools, grounding, explicit caching or paid service-tier option is requested.
- Compact planning and replanning retain all required fields, two materially different strategies, one recommendation, concise milestones/actions, assumptions, risks and bottleneck. Zod schemas, graph validation, RLS, ownership, action prerequisites, authentication and atomic persistence remain intact.
- Public-safe errors distinguish `GEMINI_PROVIDER_UNAVAILABLE`, `GEMINI_RATE_LIMITED`, `GEMINI_SCHEMA_INVALID`, `GEMINI_TIMEOUT`, `GEMINI_AUTH_INVALID` and `GEMINI_FREE_TIER_UNAVAILABLE`. Graph and local configuration failures retain separate codes. A 503 is no longer mislabeled as a timeout.
- Retries default to zero. The existing `AI_PROVIDER_MAX_RETRIES` setting can opt into at most **two retries / three total attempts**, only for 503/429, with approximately 2/5-second backoff plus jitter. Retry-After is respected; cooldowns longer than 60 seconds stop the current request. 400/401/403, schema/graph failures and configuration errors are not blindly retried. The successful Golden Path used this existing setting at 2.
- Saved plans remain usable with Supabase connectivity during AI failures. Live mode never silently substitutes mock output.
- Diagnostics allowlist only model, tokens, finish, validation and timeout state. Raw SDK errors/responses, prompts, keys and session credentials are not published.

## Final QA and security

- `npm run check:env`: PASS, live configuration checked privately.
- Gemini provider checker (`npm run check:ai`): PASS, metadata only, no extra inference.
- Typecheck: PASS.
- Lint: PASS, zero errors and six existing Fast Refresh warnings.
- `npm test`: **81 passed, zero failed, one skipped**, 19 passed test files and one skipped file. Real Supabase regressions enabled; optional additional live smoke skipped.
- Targeted retry/error regressions: 28 passed before the final suite. They cover bounded recovery/caps, nonretryable auth/schema errors, Retry-After, safe classifications and no fallback. Fixture responses are clearly isolated from the real acceptance above.
- `npm run build:vercel`: PASS, local production-mode build; no deployment.
- `npm audit`: PASS, zero vulnerabilities.
- Existing secret scanner: PASS, 195 source files and 42 browser assets, zero findings. Server-key identifiers are absent from the 21 current Vercel browser assets.
- `.env` remains ignored and untracked. Private credentials are checked against source, client assets, reachable history and QA logs before commit/push.
- Disposable-account cleanup: PASS, zero current-attempt accounts remain. Two unrelated older September fixtures were preserved.
- Local development logs also recorded HTTP navigation cancellations (`aborted`) and existing TanStack deprecation warnings; all browser assertions passed. This local acceptance does not claim hosted runtime or Production verification.

Owner-confirmed Google OAuth and real email/password signup, inbox receipt, callback and re-login remain accepted MANUAL PASS results. No authentication configuration/setup was repeated and no database reset or migration was performed.

## Owner-controlled Vercel update — no deployment yet

In the existing Vercel project, manually set these **server-side** values for Preview and Production:

```dotenv
GEMINI_API_KEY=<existing private key>
GEMINI_MODEL_DEFAULT=gemini-3.8-flash
AI_PROVIDER_MODE=live
```

Preserve all Supabase values. To reproduce the tested transient retry behavior, the existing optional `AI_PROVIDER_MAX_RETRIES` control can be set to `2`; its default remains `0`. No new runtime control was introduced.

The migrated runtime no longer reads these values, so they can be removed from future migrated deployments:

- OPENROUTER_API_KEY
- OPENROUTER_MODEL_DEFAULT
- OPENROUTER_ENABLED

Do not expose private values through `VITE_*`, publish them in Git, trigger a deployment or replace the public Production deployment yet. Existing deployment snapshots remain available for rollback. The next step is **owner confirmation that the manual Vercel variable update is saved**, followed by separately authorized hosted deployment/verification.
