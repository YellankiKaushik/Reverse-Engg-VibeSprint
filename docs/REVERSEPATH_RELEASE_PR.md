> **Historical document — superseded by the OpenRouter-only cleanup on October 13, 2026.** Previous provider, account, project, deployment and environment instructions below are retained as history. Use [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md), [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md), and [FINAL_CONFIGURATION_REPORT.md](FINAL_CONFIGURATION_REPORT.md) for current setup and evidence. Do not use deleted-project credentials or replay historical deployment/migration instructions.

# Prepared release pull request

Title: **Stabilize ReversePath persistence, execution and signup recovery**

Base: `main`. Head: `codex/production-stabilization`. Intended status: **draft**.

[Open the GitHub comparison and PR creation page](https://github.com/YellankiKaushik/Reverse-Engg-VibeSprint/compare/main...codex%2Fproduction-stabilization?expand=1)

The verified branch is pushed. GitHub connector PR creation returned HTTP 403 `Resource not accessible by integration`; no PR was opened by this task. No merge or auto-merge was performed. Main's published history is preserved. Merging may trigger production deployment, so hold integration until the release gates below pass.

## Proposed description

ReversePath could persist partial plan graphs, lose concurrent action edits, execute alternative strategies and launch duplicate AI work. This change makes graph/action/check-in/strategy writes transactional and owner-scoped, reserves expensive requests atomically, preserves saved-result recovery, limits model output, fixes denied-plan/mobile feedback, and patches vulnerable transitive dependencies. Signup now keeps accessible rate-limit and email-delivery guidance on the form without automatically resending.

Validation on October 13, 2026:

- 55 automated tests passed, 4 unrelated paid provider gates skipped; real Supabase rollback/concurrency/RLS fixtures included.
- Latest code local Node browser suite: 12 passed, 5 skipped, using mock AI and real Supabase. Covers Golden Path, persistence/refresh, execution/replan, callback/session/reauthentication, isolation, mobile demo and intercepted signup failures.
- Existing staged Production smoke: 8 passed, 1 configuration-only skip; no SMTP delivery or paid AI.
- Typecheck, lint (zero errors; six existing warnings), Node/Vercel builds, environment validation, audit (zero vulnerabilities) and secret scan passed.
- Previously completed staged RouterPlus Golden Path and Career/Startup/Learning tests remain documented. No paid AI calls or real signup emails in this final code pass.

Code complete; public release remains gated. The user owns all external provider/domain/DNS/SMTP/key/environment configuration. Email confirmation stays enabled. A new staged candidate must include application commit `6541145`; the older deployment at `5ee686d` lacks the final signup error patch. Require actual inbox confirmation and final public acceptance before claiming release completion. Do not enable auto-merge, rewrite published history, reset databases or reapply completed migrations.

Full evidence and operational limitations: [production readiness](REVERSEPATH_PRODUCTION_READINESS.md).
