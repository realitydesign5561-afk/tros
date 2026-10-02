# TROS Implementation Roadmap

The roadmap is staged so the existing application remains deployable and project data remains intact.

## Current status

- **Phase 0: COMPLETE** — audit, additive foundation schema, provider contracts, baseline tests, and build validation.
- **Phase 1: COMPLETE** — persistent leased queues, task/event APIs, SSE progress, cancellation/retry controls, idempotent submissions, lease heartbeats, checkpoint resume, and manual reconciliation for uncertain side effects.
- **Phase 2: IMPLEMENTED, DEPLOYMENT CONFIGURATION PENDING** — versioned encrypted credentials, rotation, migration tooling, integration health, and provider accounting exist. This database dry run found no legacy plaintext API-key rows; configure the key ring in each deployment.
- **Phase 3: PARTIALLY IMPLEMENTED** — shared Universal Agent and module-aware tools now persist outputs for Website Factory, workflows, social drafts, courses, YouTube research/scripts/assets, designs, and approved email. Search, image editing, YouTube publishing, and several repair tools still need verified adapters.
- **Phase 4: PARTIALLY IMPLEMENTED** — Activepieces, Resend, Stripe, GitHub, Vercel, and authenticated social webhook adapters/health checks reuse env or encrypted credentials. OAuth callback reconciliation, native social/YouTube adapters, and object storage remain.

## Phase 0: Foundation (this pass)

- Audit existing pages, routes, integrations, schema, deployment, and security.
- Add architecture/audit/matrix/gap/security documentation.
- Add additive foundation schema for tasks, jobs, agents, providers, credentials, integrations, permissions, health, tests, repairs, audit, usage, and project versions.
- Add provider-neutral TypeScript contracts and a deterministic task state machine.
- Add unit tests for state transitions and adapter contract behavior.
- Validate Prisma, TypeScript, lint, tests, and production build.

Exit criteria: migration applies without altering existing tables; tests pass; build passes; no feature page is forced onto an unfinished runtime.

## Phase 1: Execution kernel

- Implement task service and Postgres-backed leased job worker.
- Add task status/progress APIs and SSE or cursor-based event streaming.
- Persist execution logs and idempotency keys.
- Add cancellation, retry, timeout, and restart recovery.
- Migrate Website Factory generation into a resumable task while preserving current synchronous API compatibility.

Phase 1 implementation status: delivered. Recovery decisions are covered by unit tests; the opt-in database idempotency integration test requires a dedicated `TROS_TEST_DATABASE_URL` and is skipped by default.

## Phase 2: Provider and credential platform

- Implement encrypted Credential Vault and migrate `ApiKey` values.
- Build provider/model registry and adapter factories.
- Add health probes, capability discovery, usage/cost recording, and redaction.
- Replace direct AI SDK calls with AI Gateway service.

Phase 2 status: implementation delivered. A dry run found zero legacy `ApiKey` rows. Production credential entry/rotation remains blocked until `AI_CREDENTIAL_ENCRYPTION_KEYS` and `AI_CREDENTIAL_ENCRYPTION_KEY_VERSION` are configured and backed up.

## Phase 3: Agent and tool runtime

- Implement agent sessions, tool definitions, tool-call authorization, approval gates, and context budgets.
- Convert Website Factory, Course Studio, Social OS, YouTube OS, Leads, Designer, and Workflow Builder into agents with scoped tools.
- Persist outputs and project versions for every artifact-producing task.

Phase 3 status: partially delivered through the Universal Agent runtime and tool registry. Continue by implementing verified SearchProvider, image-editing, YouTube publishing, and bounded repair adapters, then wire remaining module workflows to them.

## Phase 4: Workflow and integrations

- Implement Integration Manager and connection lifecycle.
- Add Activepieces webhook reconciliation and adapter health.
- Add native email, payment, social, YouTube, GitHub, Vercel, and object-storage adapters incrementally.
- Move cron work to scheduler + queue and make all side effects idempotent.

Phase 4 status: partially delivered. The integration health endpoint probes configured GitHub, Vercel, Activepieces, Resend, and Stripe credentials. OAuth-based providers and webhook completion callbacks still need provider-specific setup.

## Phase 5: Operations and recovery

- Feature registry and feature permissions.
- Health dashboard with connection, provider, queue, and task status.
- Repair engine with bounded automatic repairs and operator approval.
- Test Lab with dry-run isolation and persisted test runs.
- Audit, usage, cost, retention, and operational alerting.

## Phase 6: Hardening

- Remove demo credentials and fallback secrets.
- Enforce production build type checking.
- Add end-to-end tests for login, task submission/resume, provider failure, retry, cancellation, project versioning, and authorization.
- Load test queue claims and streaming; perform backup/restore rehearsal.

## Phase 2 exit criteria

- Run `db:migrate-credentials:dry-run` in every target environment; the current Neon dry run found zero rows. If any are found, run `db:migrate-credentials` only after verifying the configured key ring.
- Configure and back up `AI_CREDENTIAL_ENCRYPTION_KEYS` and `AI_CREDENTIAL_ENCRYPTION_KEY_VERSION` in each deployment, then test provider credential rotation.
- Use a dedicated `TROS_TEST_DATABASE_URL` for the opt-in persistence integration tests.
- Rotate the Neon password exposed in prior chat messages.
- Define tenant/RBAC scope and provider credentials/callbacks needed for production integrations.
