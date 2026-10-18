# Free AI configuration and acceptance

Updated October 18, 2026. **FREE_MODEL_INCOMPATIBLE — full planning acceptance remains blocked.** This is a release verdict: the free router supports the required format, but its available provider rate limited the actual plan request. It does not establish a permanent schema incompatibility.

## Candidate evaluation, in the requested order

| Candidate                           | Current evidence                                                                                                                                                                                                                                                                                           | Decision                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `nex-agi/nex-n2.5-mini:free`        | Exact ID absent from the live catalog; endpoint lookup returned no endpoints.                                                                                                                                                                                                                              | Unavailable; no inference attempted.                         |
| `nvidia/nemotron-3.5-super-vl:free` | Catalog and actual Nvidia endpoint list $0 input/output, JSON-schema support and 131,072 output tokens. Existing-key schema probe returned HTTP 502.                                                                                                                                                       | Unavailable during verification.                             |
| `openrouter/free`                   | Catalog advertises zero pricing, `structured_outputs` and `response_format`. The router filters by required capabilities. A real schema probe and real application intake both returned valid structured output with reported cost $0. Actual plan generation returned provider error 429 inside HTTP 200. | Local candidate only; complete planning contract unverified. |

The successful responses were served by `nvidia/nemotron-3-super-120b-a12b:free` through Nvidia. Its actual endpoint was independently checked: prompt and completion prices both zero, schema/response-format support present, maximum output 235,929 tokens. This exceeds the app's default 12,000 and maximum 16,384 output-token budget. The router's chosen underlying model can vary.

Sources: [live catalog](https://openrouter.ai/api/v1/models), [actual successful serving endpoint](https://openrouter.ai/api/v1/models/nvidia/nemotron-3-super-120b-a12b:free/endpoints), [free router behavior](https://openrouter.ai/docs/guides/routing/routers/free-router), [provider constraints](https://openrouter.ai/docs/guides/routing/provider-selection).

## Live verification and limits

Four inference requests total, using fictional input and the existing key: one NVIDIA 3.5 probe failed (502), one free-router schema probe passed, one application intake passed Zod validation, and one application plan request was rate limited. The two successful responses reported cost zero. Failed requests did not provide complete cost metadata; no paid model or paid fallback was requested. No credits, accounts, providers or keys were purchased or created.

The authenticated key endpoint accepted the existing key and reported a free daily limit of 50 requests, with 50 remaining before these probes. This is account-specific evidence, not a guaranteed allocation for every installation. Provider capacity limits can still produce 429 before the account's daily limit is exhausted. Pricing, limits and availability can change; recheck before deployment. Free inference has variable latency and no reliability guarantee from this project. One successful intake took about 52 seconds. See [OpenRouter limits](https://openrouter.ai/docs/api_reference/limits).

**Live free golden journey: 0 passed, 1 failed at plan generation.** Goal analysis/classification and intake persistence passed before that failure. Free-generated strategies, milestones, action dependencies, complete graph persistence, progress and revised-plan accept/reject were not reached. These requirements remain BLOCKED; mock fixtures and historical paid-model passes do not establish free-model acceptance.

## Zero-cost enforcement in the new source

- Only `openrouter/free` or explicit `vendor/model:free` IDs are accepted in live mode. Paid IDs fail closed.
- Every outgoing SDK request overrides provider routing with `require_parameters=true`, `allow_fallbacks=false` and zero maximum prompt, completion, request and image prices. Caller options cannot override these constraints. Alternative model lists, route overrides, tools and plugins are rejected.
- No alternate provider or paid model is configured. Catalog and actual endpoint pricing/capabilities are checked by `npm run check:ai`, without inference. Runtime zero-price caps are sent even if catalog prices later change.
- Retries default to zero and remain capped at three. Provider 402 and 429 are never automatically retried, including those embedded in HTTP 200 JSON. Safe errors do not expose provider response bodies or credentials. No live failure silently becomes a mock success.
- Saved-data operations remain available when AI is unavailable; Supabase connectivity is still required. Viewing/editing data, progress updates and deletion do not require successful new inference. New plans and replans remain unavailable until a free provider responds with valid output.
- Existing Zod contracts, graph validation, authentication and database protections are preserved.

## Verification results

| Check                                              | Result                                                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run check:env`                                | PASS; pre-existing local `AI_PROVIDER_MODE=mock` preserved and explicitly reported                   |
| `npm run check:ai`                                 | PASS; existing key, catalog/endpoint zero pricing, schema capability and output budget; no inference |
| Typecheck                                          | PASS                                                                                                 |
| Lint                                               | PASS, six existing Fast Refresh warnings                                                             |
| `npm test` with live Supabase RLS enabled          | 69 PASS, 0 FAIL, 1 SKIP (optional additional live AI smoke)                                          |
| Desktop/mobile workspace browser tests             | 2 PASS, 0 FAIL; real Supabase, inference blocked by application quota                                |
| Free live browser golden journey                   | 0 PASS, 1 FAIL (provider rate limit during plan generation)                                          |
| Vercel build, source/client secret scan, npm audit | PASS; no secret findings or dependency vulnerabilities                                               |

The live Supabase suite uses explicit mock plan proposals to test real atomic graph persistence, action completion, rollback, versions, strategy selection and cross-user isolation. This proves database behavior independently, not free AI graph quality. Workspace browser checks cover saved objective/context edits, refresh, export, quota errors, deletion, mobile layout and session behavior. Disposable fixtures from this attempt were removed; older unrelated fixtures were preserved.

An initial mocked adapter test used a model ID now rejected by the free-only guard; its fixture was corrected. A sandbox retry could not load suites because Vite temporary-file renames were denied; the completed authorized run outside that sandbox has the results above. The metadata check also required network access outside the sandbox.

## Local and Vercel configuration

Only the local model line changed; the existing key, Supabase values and provider mode were preserved. `.env` is ignored and must never be committed. The existing local mode was already `mock`; live verification explicitly set `AI_PROVIDER_MODE=live` in its child process. No mode was silently changed to claim free success.

The candidate value, **not yet accepted for release**, is:

```dotenv
OPENROUTER_MODEL_DEFAULT=openrouter/free
```

The owner controls this single variable in the existing Vercel project's **Preview and Production** environments. Keep the existing key and other settings. No Vercel variables were changed and no deployment was created in this task. Do not deploy until the owner confirms the variable is saved; full free planning verification must still pass. Existing deployments do not contain the new source enforcement. A future Preview must deploy this source and undergo hosted AI, persistence, progress, mobile, logs and security checks before any Production promotion.

To change models later, use only an exact explicit free ID (or the free router), run `check:ai` to recheck actual zero-price schema-capable endpoints and output limits, then run the real planning/replanning acceptance journey with fictional input. Do not relax schemas, enable paid fallback or treat metadata checks as inference acceptance. After successful verification, the owner can update the same variable in both Vercel environments and authorize the next deployment.

Current Production/rollback remains `dpl_4EmetpCmuMdwZkxBDKrccNyVMds6`, source `5ee686dc58aa1d4fc6bbfc959a6bc89280929736`, at [public Production](https://reversepath-vibesprint.vercel.app). Candidate `dpl_7st1sGRtjza4EbR245Z7S3uty6qi` remains unpromoted and predates this free-only change. Real email receipt and Google account return on the eventual release candidate remain separate acceptance gates. No mailbox receipt or new hosted Google result is claimed.
