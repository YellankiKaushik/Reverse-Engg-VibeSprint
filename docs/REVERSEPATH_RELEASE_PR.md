# Prepared draft pull request: Finalize ReversePath OpenRouter release and verification

The app now uses Supabase for auth/data/storage and OpenRouter as its only live AI service. All planning roles use one model, private keys remain server-side, and native Vite/Nitro builds replace unused hosting/auth integrations. The shared configuration template and Vercel checklist remove obsolete provider routes, model overrides and test credentials while preserving validated graph persistence, completion, progress and replanning.

October 17 candidate `e77ad37a5c3b910fe23f3090dac0f4079419af19` is deployed to the existing project's new Preview and passed fresh real OpenRouter planning/replanning, strategy switching, action start/completion, persistence, history, owner isolation, and desktop/mobile workspace tests. Export failures now prevent partial downloads; duplicate strategy keys fail graph validation. Regression tests cover both.

Production redirect generation is fixed. Preview redirects still fall back to Production, and real signup email delivery is unverified. Production remains unchanged. Create this PR as a **draft**, from `codex/production-stabilization` to `main`. The connector's create-PR request returned HTTP 403 `Resource not accessible by integration`; no PR currently exists.

## Validation

- 56 automated tests passed; one optional standalone live smoke skipped.
- Local browser suite: 14 passed, five skipped. Hosted suite: 13 passed, three skipped, with three further tests explicitly excluded. Separate mobile live Learning scenario: one passed.
- TypeScript, lint (zero errors/six existing warnings), Node and Vercel builds, audit and source/client/history scans passed. Hosted runtime error query returned no records in the inspected window.
- Eight hosted OpenRouter calls: 11,403 input and 9,697 output tokens; catalog estimate $0.0201, under $2.
- See [release verification](PRODUCTION_RELEASE_VERIFICATION.md) for exact source SHA, candidate URL and retained rollback deployment.

## Release gate

Merge into main only after Preview confirmation and real-mailbox signup acceptance, staged Production verification, promotion, and public-domain smoke tests pass. Preserve commit history with a merge commit, confirm intended commits are present on main, and only then remove stabilization. The current Vercel project has no Git link; do not assume a merge deploys it. This file is prepared PR text, not a created PR or an instruction to bypass release gates.
