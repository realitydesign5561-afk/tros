# Current Feature Audit

Audit basis: repository state inspected on 2026-09-25. Classification reflects implemented behavior, not visual intent.

## Summary

- **REAL AND WORKING:** core CRUD for projects, courses, leads, social drafts, workflows, AI feature records, and authenticated sessions; Prisma/Neon migration deployment; production build.
- **PARTIALLY WORKING:** website factory generation, AI course generation, YouTube generation, designer uploads, social automation, email outreach, payments, workflow activation/runs, and social session storage.
- **UI ONLY:** generic module route, test lab presentation, provider checklist/status presentation, portions of admin/reboot/backup UI.
- **BACKEND ONLY:** cron social execution, several API CRUD surfaces, Activepieces HTTP adapter, encryption helpers.
- **BROKEN:** no automated test suite; production TypeScript errors are configured to be ignored by Next; admin backup expects SQLite; some routes lack role enforcement; durable async execution is absent.
- **MISSING INTEGRATION:** durable queue, agent runtime, tool registry, provider/model registry, connection health, cost tracking, RBAC permissions, project versioning, repair/recovery, streaming task progress.

## User-facing pages

| Surface | Classification | Evidence / limitation |
|---|---|---|
| Dashboard `/` | PARTIALLY WORKING | Authenticated shell and metrics; depends on backend counts and does not provide a durable command/task model. |
| Admin `/admin` | PARTIALLY WORKING | Reads admin overview data, but overview checks authenticated user presence rather than ADMIN role. |
| AI Features `/ai-features` | REAL AND WORKING | CRUD persisted in `AiFeature`; no execution/runtime for a feature as an agent. |
| Automation `/automation` | UI ONLY / PARTIALLY WORKING | Control-plane presentation; no durable general job queue or execution history behind the target concepts. |
| Courses `/courses`, `/courses/create` | PARTIALLY WORKING | Course CRUD and generated content persist; external video/payment execution is incomplete. |
| Course detail `/courses/[id]` | REAL AND WORKING | Loads and updates lesson content through API; page uses client hooks in a route that should be reviewed for client boundary correctness. |
| Designer `/designer` | PARTIALLY WORKING | Upload and design records persist locally; no real image-generation provider adapter/storage pipeline. |
| Leads `/leads` | PARTIALLY WORKING | Lead records persist, but POST creates hard-coded example leads with source `DEMO`. |
| Campaigns `/leads/campaigns` | PARTIALLY WORKING | Campaign and lead-message records exist; sending is delegated to Resend only when configured. |
| Social `/social`, `/social/[view]` | PARTIALLY WORKING | Drafts, inbox, sessions, and analytics persist; actual publishing is a webhook delegation and browser login URL, not platform adapters. |
| Settings `/settings` | PARTIALLY WORKING | Password and provider values can be submitted; `ApiKey.value` is plaintext and no connection health test is performed. |
| Test Lab `/test-lab` | UI ONLY | Renders the automation control plane; no persisted test-run subsystem exists. |
| Website Factory | PARTIALLY WORKING | Creates project blueprints and management records; no asynchronous builder, repository sync, deployment execution, or version/snapshot system. |
| Workflows `/workflows` | PARTIALLY WORKING | Graph CRUD and AI/fallback generation persist; execution depends on optional Activepieces and lacks durable step logs. |
| YouTube OS `/youtube-os` | PARTIALLY WORKING | Video records and AI text generation exist; asset rendering/upload/publishing is not implemented. |
| Generic `/[module]` | UI ONLY | Only `module-3` maps to workflow builder; other modules show a placeholder. |
| Login | PARTIALLY WORKING | NextAuth credentials flow works with database lookup but includes hard-coded demo credentials and a fallback secret. |

## API and service classification

| Area | Classification | Evidence / limitation |
|---|---|---|
| Auth API | PARTIALLY WORKING | NextAuth credentials provider and JWT sessions; no MFA, password reset, throttling, RBAC middleware, or secure fail-closed secret requirement. |
| Website Factory APIs | PARTIALLY WORKING | Prisma project/analytics writes and optional AI gateway; long work is synchronous and deployment/import only records pending state. |
| Workflow APIs | PARTIALLY WORKING | CRUD and Activepieces calls; no internal execution engine, queue, resumability, or detailed execution IDs/logs. |
| Social APIs/cron | PARTIALLY WORKING | Scheduled posts run from Vercel cron and webhook; no durable lease, per-post execution log, or platform health. |
| Leads/outreach | PARTIALLY WORKING | CRM persistence and Resend path; lead generation itself is demo data and outreach lacks job tracking. |
| Courses/payments | PARTIALLY WORKING | Stripe payment-link creation is present; webhook/reconciliation/enrollment lifecycle is absent. |
| Designer/media | PARTIALLY WORKING | Local filesystem upload path is unsuitable as durable production object storage. |
| Admin APIs | BROKEN / PARTIALLY WORKING | Backup targets `prisma/dev.db`; reboot is not a real deployment operation; role checks are inconsistent. |
| Activepieces | PARTIALLY WORKING | HTTP adapter supports create/update/run/status, but env-only module state, no webhook reconciliation, health polling, or durable external execution mapping. |
| Crypto | BROKEN FOR PRODUCTION | AES-CBC fallback key is hard-coded; no authenticated encryption/key versioning/rotation. |

## Missing foundation

No tests, task queue, execution log, agent session/tool-call records, provider/model registry, encrypted credential vault, health history, usage/cost records, permission model, feature health, repair system, test-run persistence, or project versions/snapshots are present in the current schema.
