# Direct Gemini Free Tier verification

Updated October 19, 2026. **HOSTED GEMINI VERIFIED — PRODUCTION BLOCKED ON PREVIEW AUTHENTICATION ACCEPTANCE.**

The October 18 local verification remains recorded below. The owner has since updated Vercel configuration, and the new Preview has completed the real hosted Gemini Golden Path. Public Production remains unchanged.

## Hosted release verification — October 19, 2026

**PRODUCTION RELEASE BLOCKED — hosted Gemini workflow verified; new Preview authentication redirect gate remains open.**

- Existing project: prj_McY3U5riuZN49HM72w9Bv7Ng0J1M. Preview deployment: **dpl_G7h3S3Q6TLiYRhjVjmXKWNobQ5v8**, READY, [Preview](https://reversepath-vibesprint-rcsecgaua-kaushik-yellanki-project.vercel.app). Verified source: **8b46434cf02fb59b06417d3e5923e845f8af4707**, main.
- Owner-updated Preview and Production configuration was privately verified: the existing Gemini key, gemini-3.8-flash, live mode, retries 2, all five Supabase variables, matching URL/key pairs, no OpenRouter variables and no private values in VITE_* variables. Keys match the accepted local Free Tier project. Billing and auth policies were not changed.
- Hosted browser suite: **19 passed, one failed**. The real Gemini Golden Path passed: intake, compact plan, original Zod/graph validation, atomic save/activation, strategy changes, action completion, progress refresh, check-in, two real replans, revision rejection/acceptance, and refreshed active-version pointer. Three versions remain, one rejected and exactly one active v3. No mocked Gemini response was used.
- Initial hosted graph: **13 nodes, 13 edges, two strategies, four recommended milestones and six executable actions/experiments**. Six successful AI operations used **7,379 input / 13,230 output tokens**; every successful output finished STOP and passed its schema. Runtime graph validation passed for the plan and both replans.
- Password login/logout/re-login, session restoration, cross-user denial, desktop/mobile workspace, mobile demo, provider initiation and safe callback errors passed. Real Google account selection/return on this new Preview was not performed: the available browser has no signed-in authorized Google account. Owner's earlier Google/inbox confirmations remain historical MANUAL PASS evidence, not a fresh Google round-trip result here.
- The sole automated failure is the genuine confirmation-link redirect. Independent disposable probes for both the Preview root and /auth returned HTTP 303 to **https://reversepath-vibesprint.vercel.app/**, instead of Preview. This is a Supabase redirect-allowlist blocker, not a demonstrated Gemini or persistence defect. No confirmation email was sent or inbox delivery re-tested.
- Security: all **21 fetched hosted HTML/browser assets** returned 200; zero private-key or private-environment-identifier findings. Final filtered runtime logs: **zero error records, zero HTTP 5xx, zero secret matches**; six successful AI validation diagnostics. An intermediate planning diagnostic had no output; its upstream status was not logged, so no specific HTTP failure is inferred. Dependency audit: zero vulnerabilities. The unchanged source's accepted automated baseline remains **81 passed, one skipped**.
- No database/schema, runtime source, dependency or authentication-policy changes were made during this release attempt. Deployment Protection stayed enabled. Short-lived origin-scoped Vercel identities accessed Preview; no share link or broader protection exception was created. Disposable account cleanup passed; two unrelated September fixtures were preserved.
- **No new Production deployment or promotion was performed.** Current public Production and rollback: **dpl_DbZKsUNeizVEiAe7X8dM7tHEAe79**, source **80a4be968fd059c9dd55f7575612c5b5f04e16af**, [public URL](https://reversepath-vibesprint.vercel.app). Production smoke/Golden Path for the Gemini release remains NOT RUN; the public domain still serves the earlier source.

### Consolidated remaining authentication action

In the existing Supabase project **usvopldwiwzlvoqawvcu → Authentication → URL Configuration → Redirect URLs**, add both entries below. Keep the Site URL at https://reversepath-vibesprint.vercel.app and preserve existing Production/localhost entries. The exact origin covers the current root callback probe; the origin-scoped /** entry covers /auth and other Preview paths. No project-wide hostname wildcard is required.

```text
https://reversepath-vibesprint-rcsecgaua-kaushik-yellanki-project.vercel.app
https://reversepath-vibesprint-rcsecgaua-kaushik-yellanki-project.vercel.app/**
```

Then complete Google sign-in on this Preview and confirm it returns to its authenticated dashboard (including logout/re-login). No authorized Auth-configuration write connection is available here, so these settings were not altered. After this action, rerun only the affected callback acceptance, verify Google completion, then stage the Production build with Production variables, test it, promote that exact staged build and run public Production acceptance. Preserve the recorded rollback deployment.

Known Free Tier limitation: transient provider unavailability/rate limits may occur. Existing retries remain bounded to at most three attempts for 503/429; saved plans remain usable during inference failures. No billing, paid inference, alternate provider or credit purchase is authorized or introduced.

The sections below record earlier verification dates and must not override this latest hosted status.

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

## Accepted Vercel configuration — owner update verified

The owner has already set these **server-side** values for Preview and Production; all were privately verified on October 19. Do not repeat the variable setup:

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

Keep private values server-only. The new Preview has been deployed and verified as described above. Production remains unchanged. The next gate is the Supabase Preview redirect allowlist and fresh Google account-return acceptance, followed by staged Production verification and release.
