# TROS Implementation Plan

## Phase 1 — Safety and evidence
- Keep the audit current and remove claims without evidence.
- Enforce server-side authentication, role checks, validation, and tenant scoping.
- Make production builds fail on type errors.

## Phase 2 — Shared execution plane
- Add persisted task, attempt, checkpoint, tool-call, artifact, and execution-log models.
- Replace placeholder agent runtime with a state machine and idempotent task creation.
- Add a capability-aware tool registry with strict schemas and permission requirements.
- Add worker leasing, bounded retries, cancellation, and resumable checkpoints.

## Phase 3 — Provider and integration control
- Add provider/model/capability records and encrypted credentials.
- Add health history, circuit breakers, fallback routing, usage/cost tracking, and redaction.
- Add explicit configuration-required outcomes for unavailable integrations.

## Phase 4 — Module execution
- Route Website Factory and Workflow Builder through the shared runtime first.
- Add durable Social, Course, YouTube, Designer, Lead, and AI Feature tasks.
- Verify external side effects and persist artifacts/results before reporting success.

## Phase 5 — Verification and operations
- Add unit, API, integration, and browser tests.
- Add deployment smoke checks, repair/rollback, audit logs, and operational dashboards.

This sequence preserves existing CRUD data and avoids claiming capabilities that are not configured.
