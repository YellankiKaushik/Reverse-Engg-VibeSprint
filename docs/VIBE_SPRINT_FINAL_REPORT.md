# ReversePath release report — October 13, 2026

**Hardened live application staged and verified; public release blocked by Supabase email signup rate limiting.**

The complete architecture, defect resolutions, test matrix, AI usage and release continuation are recorded in [REVERSEPATH_PRODUCTION_READINESS.md](REVERSEPATH_PRODUCTION_READINESS.md). This replaces the October 11 status that production environment variables were missing.

The existing free Hobby Vercel project now has verified live configuration. Source commit `5ee686d` is deployed as staged Production deployment `dpl_C8eZXciWFDqKCm9UX3zWWMjSM5rN`, behind Vercel Authentication. The final hosted Golden Path passed using RouterPlus / `gpt-6-luna`: intake, clarification, validated graph persistence, activation, dependency frontier, completion/progress, refresh, check-in, candidate rejection/acceptance, reauthentication and cross-user denial. Career, Startup and Learning scenario tests also passed with saved live provenance. A genuine confirmation-link callback passed, using an admin-generated link without SMTP delivery.

The main reliability fixes are atomic execution edits, graph persistence/version allocation, check-ins/facts and strategy selection; correct selected-route progress and BLOCKED_BY cycle direction; duplicate AI claim protection; bounded output and fail-closed usage checks; immediate denied-plan error feedback; and mobile navigation wrapping. Eight migrations match the dedicated ReversePath database, and all 16 application tables have RLS. No reset, truncate, unrelated-project modification or published-history rewrite was performed.

Verification: **50 unit/integration/database tests passed, 4 provider gates skipped**; TypeScript and Node/Vercel builds passed; lint has no errors; full dependency audit has zero vulnerabilities. The final staged browser suite passed 8 tests with 5 explicitly gated skips, the separate live scenarios passed 3 tests, and the confirmation callback passed 1. Current public landing/guard/demo/mobile checks passed 4 tests, and an Edge desktop/mobile demo smoke passed. Skips are not counted as live verification.

New real model testing recorded 18 successful schema-valid calls, 27,582 input / 83,838 output tokens. At the checked RouterPlus catalog prices the estimate is $0.0447, below the authorized $2 ceiling; it is not an invoice. Private credentials were not printed, committed or found in the inspected browser assets.

**Failed acceptance:** real email signup returned HTTP 429 `over_email_send_rate_limit` for a valid email domain. The built-in Supabase email service must recover or be replaced with privately configured existing SMTP before public signup can pass. No inbox delivery is certified. Public promotion was withheld; the current [application](https://reversepath-vibesprint.vercel.app) and [prepared demo](https://reversepath-vibesprint.vercel.app/demo) remain operational. The original deployment remains recoverable.

Next: configure the email service, pass staged signup acceptance, promote the same verified staged deployment, then run the actual public authenticated Golden Path/signup/mobile/demo checks. Until then the full production Definition of Done remains unsatisfied.
