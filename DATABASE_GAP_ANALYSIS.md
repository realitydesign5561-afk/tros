# Database Gap Analysis

## Current state

Prisma uses PostgreSQL through `NEON_DATABASE_URL`. The existing four migrations are applied and the current schema supports users, projects, workflows, courses, social content, YouTube records, leads, AI feature records, and basic analytics/API keys.

The current schema is useful product data, but it treats most execution state as strings (`status`, `logs`, `metadata`) and has no shared execution identity or ownership model for platform operations.

## Required additions

The foundation migration adds additive models for:

- AI providers, models, credentials, health, usage, and costs
- AI tasks, task steps, outputs, agent sessions, and tool calls
- Integrations and integration connections
- Scheduled jobs, automation runs, and execution logs
- Users/roles and feature permissions
- Feature health, repair attempts, test runs, and system events
- Project snapshots and project versions

These models are intentionally generic and use JSON fields for evolving provider payloads. Foreign keys preserve existing data and cascade only within the new aggregate where appropriate.

## Data rules for implementation

1. `Task.id` is the execution ID exposed to clients; `idempotencyKey` is unique per owner.
2. Task and step statuses are explicit state-machine values in service code; database strings allow additive rollout without breaking old rows.
3. Credentials store ciphertext and metadata only. Plaintext must never be selected by ordinary UI queries.
4. Usage/cost rows are append-only and linked to provider/model/task where known.
5. Job claiming uses `lockedAt`, `lockedBy`, `attempts`, and `availableAt`; leases make restarts recoverable.
6. Execution logs are append-only with sequence numbers for ordered streaming/resume.
7. Project versions/snapshots are immutable records; current `Project` rows remain compatible.
8. Permission checks are additive; existing ADMIN users can be backfilled into the initial role model.

## Remaining migration work after this foundation

- Add indexes tuned to queue polling and tenant ownership after production query metrics.
- Move existing `ApiKey` values into encrypted `Credential` records with a one-time migration and deletion of plaintext values.
- Backfill workflow runs into `AutomationRun` and execution logs.
- Add project version creation to Website Factory writes.
- Add retention policies and archival for logs, usage, and raw provider payloads.
- Introduce database-level enums only after the rollout stabilizes to avoid blocking zero-downtime deployments.
