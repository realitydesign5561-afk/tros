# Integration Matrix

Status is based on code paths present in the repository, not credentials that may exist outside the workspace.

| Integration | Adapter/service | Credential source | Current status | Health / execution gap |
|---|---|---|---|---|
| Neon PostgreSQL | Prisma client | `NEON_DATABASE_URL` | REAL AND WORKING | Migrations are current; no application health endpoint or pool telemetry. |
| NextAuth credentials | `lib/auth.ts`, Pages API handler | `NEXTAUTH_SECRET` / `AUTH_SECRET` | PARTIALLY WORKING | Hard-coded demo login and fallback secret; no user lifecycle controls or RBAC enforcement. |
| AI Gateway | `lib/ai-gateway/service.ts` | Encrypted `Credential` or deployment key | PARTIALLY WORKING | Capability routing, failover, health history, usage/cost accounting, and key-version rotation exist; provider-specific native APIs/cost rates and legacy key migration require configuration. |
| Activepieces | `lib/activepieces.ts` | `ACTIVEPIECES_API_URL` plus encrypted credential or env key | PARTIALLY WORKING | Create/update/run/status and workflow agent dispatch use the adapter; integration health probes are available; callback reconciliation remains. |
| Stripe | Course payments route | Encrypted `stripe` credential or `STRIPE_SECRET_KEY` | PARTIALLY WORKING | Checkout session creation exists; webhook verification, payment reconciliation, and durable payment events are still needed. |
| Resend | Agent tools and lead outreach | Encrypted `resend`/`email` credential or `RESEND_API_KEY` plus `RESEND_FROM_EMAIL` | PARTIALLY WORKING | Sends are approval-gated and idempotent in Agent Runtime; delivery webhook/reconciliation is still needed. |
| Social publishing | `lib/social-publisher.ts` authenticated webhook | URL plus encrypted webhook credential or `SOCIAL_PUBLISH_WEBHOOK_SECRET` | PARTIALLY WORKING | Scheduled posts persist and publisher failures are recorded; webhook health is unverified until a safe health contract exists. |
| Social browser sessions | `lib/social-sessions.ts` | `SOCIAL_ENCRYPTION_KEY` | PARTIALLY WORKING | New session writes use AES-GCM; legacy AES-CBC remains read-only compatible and existing sessions should be re-saved. |
| Instagram / LinkedIn / Threads | Login URL list only | User browser session | UI/connection placeholder | No OAuth or verified platform API adapter. |
| YouTube | Prisma records + AI text | AI key only | PARTIALLY WORKING | Research/script generation persists; YouTube API upload, token vault, health, and asset pipeline missing. |
| GitHub | Website Factory adapter | Encrypted `github` credential or `GITHUB_TOKEN`, `GITHUB_OWNER` | PARTIALLY WORKING | Repository creation/publishing is implemented; repository/branch permissions and end-to-end deploy wiring need configured credentials. |
| Vercel | Website Factory adapter | Encrypted `vercel` credential or `VERCEL_TOKEN` | PARTIALLY WORKING | Deployment API and health check are implemented; project/team/domain setup needs configured credentials. |
| File storage | Node filesystem in designer | None | PARTIALLY WORKING | Local uploads are not durable across serverless deployments and lack malware/content scanning. |
| Integration health | `/api/integrations/health` | Encrypted credentials or env keys | PARTIALLY WORKING | GitHub, Vercel, Activepieces, Resend, and Stripe probes persist connection status; social and YouTube remain UNVERIFIED without safe OAuth/webhook probes. |
| Cron/workers | Vercel cron worker routes | `CRON_SECRET` / `AGENT_WORKER_SECRET` / `WEBSITE_WORKER_SECRET` | PARTIALLY WORKING | Agent and Website Factory work use persistent queues/leases and recovery; production scheduling secrets must be configured. |

## Required target adapter families

`AIProviderAdapter`, `WebsiteBuilderAdapter`, `ImageGenerationAdapter`, `VideoGenerationAdapter`, `SocialPlatformAdapter`, `EmailProviderAdapter`, `WorkflowProviderAdapter`, and `SearchProviderAdapter` should be selected through registries. Pages should call application services; provider SDKs and HTTP details should remain inside adapters.

## Environment inventory

Current code references include `NEON_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AI_CREDENTIAL_ENCRYPTION_KEY` (legacy v1), `AI_CREDENTIAL_ENCRYPTION_KEYS`, `AI_CREDENTIAL_ENCRYPTION_KEY_VERSION`, `SOCIAL_ENCRYPTION_KEY`, `ACTIVEPIECES_API_URL`, `ACTIVEPIECES_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SOCIAL_PUBLISH_WEBHOOK_URL`, `SOCIAL_PUBLISH_WEBHOOK_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `VERCEL_TOKEN`, `CRON_SECRET`, `AGENT_WORKER_SECRET`, and `WEBSITE_WORKER_SECRET`. Configure only the secrets for integrations you enable.
