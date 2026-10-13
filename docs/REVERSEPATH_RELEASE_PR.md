# Prepared pull request: Simplify ReversePath configuration and verify the new backend

The app now uses Supabase for auth/data/storage and OpenRouter as its only live AI service. All planning roles use one model, private keys remain server-side, and native Vite/Nitro builds replace unused hosting/auth integrations. The shared configuration template and Vercel checklist remove obsolete provider routes, model overrides and test credentials while preserving validated graph persistence, completion, progress and replanning.

The committed candidate was deployed from local source to the existing Vercel project's Preview and passed real OpenRouter planning, persistence/refresh, completion/progress, replanning, mobile behavior, owner isolation, and hosted quota enforcement. Supabase confirmation redirects and actual signup email receipt remain release blockers; production is deliberately unchanged.

## Validation

- 53 unit/integration/database tests passed; one optional standalone live smoke skipped.
- Hosted browser suite: 11 passed and one unconfigured-auth-state skip; live mobile Career scenario: one passed.
- TypeScript, lint (six existing warnings), local and remote Vercel builds, audit and source/client/Git-history credential checks passed.
- Eight hosted OpenRouter calls estimated $0.0223, under the authorized $2 limit.
- See [release verification](PRODUCTION_RELEASE_VERIFICATION.md) for exact source SHA, candidate URL and retained rollback deployment.

## Release gate

Target main only after confirmation redirects and real-mailbox signup delivery are verified, the staged Production build passes, and Git integration behavior is checked. This is a local prepared description, not a created GitHub pull request. No merge or force push is authorized while the release gates remain blocked.
