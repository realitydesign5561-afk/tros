# TROS Implementation Roadmap

The roadmap is staged so the existing application remains deployable and project data remains intact.

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

## Phase 2: Provider and credential platform

- Implement encrypted Credential Vault and migrate `ApiKey` values.
- Build provider/model registry and adapter factories.
- Add health probes, capability discovery, usage/cost recording, and redaction.
- Replace direct AI SDK calls with AI Gateway service.

## Phase 3: Agent and tool runtime

- Implement agent sessions, tool definitions, tool-call authorization, approval gates, and context budgets.
- Convert Website Factory, Course Studio, Social OS, YouTube OS, Leads, Designer, and Workflow Builder into agents with scoped tools.
- Persist outputs and project versions for every artifact-producing task.

## Phase 4: Workflow and integrations

- Implement Integration Manager and connection lifecycle.
- Add Activepieces webhook reconciliation and adapter health.
- Add native email, payment, social, YouTube, GitHub, Vercel, and object-storage adapters incrementally.
- Move cron work to scheduler + queue and make all side effects idempotent.

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

## Explicit blockers before Phase 1

- Rotate the exposed Neon password and remove plaintext/API-key risk.
- Decide on a production queue deployment strategy.
- Provide credentials and callback contracts for each external provider.
- Define tenant model and RBAC roles beyond the current ADMIN default.
- Decide object storage and browser-worker deployment targets.
