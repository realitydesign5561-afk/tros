# TROS Architecture

TROS is a Next.js App Router application with Prisma/PostgreSQL persistence, NextAuth credentials authentication, feature-specific services, and API route handlers. The target architecture is a shared execution plane used by Website Factory, Workflows, Social OS, Course Studio, YouTube OS, Designer, Leads, and AI Features.

## Target execution flow

`request -> authenticated user -> capability router -> durable AgentTask -> validated tool -> provider/integration -> artifact/result -> execution log -> UI stream/history`

## Core boundaries

- **Web:** route pages and components; no provider secrets.
- **API:** authentication, validation, authorization, idempotency, and orchestration.
- **Runtime:** task state machine, tool registry, retries, cancellation, checkpoints, and repair.
- **AI Gateway:** capability-based provider selection, health, fallback, usage, and cost records.
- **Persistence:** user-scoped projects, workflows, artifacts, tasks, attempts, and audit logs.
- **Integrations:** Activepieces, Resend, Stripe, social APIs, storage, and deployment providers.

## Deployment constraints

Vercel request handlers are not durable workers. Long-running work must be represented by persisted tasks and processed by an externally invoked worker/queue with leases and idempotency. Until a durable queue is configured, the system must report `CONFIGURATION_REQUIRED` rather than claiming asynchronous completion.

## Current architecture risks

`lib/agent/runtime.ts` is a placeholder, provider credentials are represented by plaintext `ApiKey.value`, role checks are inconsistent, and Next build type errors are ignored. These are priority-one remediation items.
