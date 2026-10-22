# Integration Matrix

Status is based on code paths present in the repository, not credentials that may exist outside the workspace.

| Integration | Adapter/service | Credential source | Current status | Health / execution gap |
|---|---|---|---|---|
| Neon PostgreSQL | Prisma client | `NEON_DATABASE_URL` | REAL AND WORKING | Migrations are current; no application health endpoint or pool telemetry. |
| NextAuth credentials | `lib/auth.ts`, Pages API handler | `NEXTAUTH_SECRET` / `AUTH_SECRET` | PARTIALLY WORKING | Hard-coded demo login and fallback secret; no user lifecycle controls or RBAC enforcement. |
| AI Gateway | `lib/ai-gateway/service.ts` | Encrypted `Credential` or deployment key | PARTIALLY WORKING | Capability routing, failover, health history, usage/cost accounting, and key-version rotation exist; provider-specific native APIs/cost rates and legacy key migration require configuration. |
| Activepieces | `lib/activepieces.ts` | Remote MCP Server (`https://cloud.activepieces.com/mcp/platform`) via OAuth 2.0 PKCE | REAL AND WORKING | Official Model Context Protocol integration over Streamable HTTP; automatic token refresh; dynamic tool discovery and tool execution for agents and workflows. |
| Stripe | Course payments route | Encrypted `stripe` credential or `STRIPE_SECRET_KEY` | PARTIALLY WORKING | Checkout session creation exists; webhook verification, payment reconciliation, and durable payment events are still needed. |
| Resend | Agent tools and lead outreach | Encrypted `resend`/`email` credential or `RESEND_API_KEY` plus `RESEND_FROM_EMAIL` | PARTIALLY WORKING | Sends are approval-gated and idempotent in Agent Runtime; delivery webhook/reconciliation is still needed. |
| Social publishing | `lib/social-publisher.ts` authenticated webhook | URL plus encrypted webhook credential or `SOCIAL_PUBLISH_WEBHOOK_SECRET` | PARTIALLY WORKING | Scheduled posts persist and publisher failures are recorded; webhook health is unverified until a safe health contract exists. |
| Social browser sessions | `lib/social-sessions.ts` | `SOCIAL_ENCRYPTION_KEY` | REAL AND WORKING | Direct manual account logins (username/email + password) for Twitter/X, LinkedIn, Instagram, Facebook, TikTok, Threads; encrypted at rest via AES-256; no developer API keys or platform developer apps required. |
| Instagram / LinkedIn / Threads / Twitter / TikTok / Facebook | Direct manual login in `lib/social-sessions.ts` | User direct account credentials | REAL AND WORKING | User enters account login details directly; credentials stored encrypted at rest on server. |
| YouTube | Prisma records + AI text | AI key only | PARTIALLY WORKING | Research/script generation persists; YouTube API upload, token vault, health, and asset pipeline missing. |
| GitHub | Website Factory adapter | Encrypted `github` credential or `GITHUB_TOKEN`, `GITHUB_OWNER` | PARTIALLY WORKING | Repository creation/publishing is implemented; repository/branch permissions and end-to-end deploy wiring need configured credentials. |
| Vercel | Website Factory adapter | Encrypted `vercel` credential or `VERCEL_TOKEN` | PARTIALLY WORKING | Deployment API and health check are implemented; project/team/domain setup needs configured credentials. |
| File storage | Node filesystem in designer | None | PARTIALLY WORKING | Local uploads are not durable across serverless deployments and lack malware/content scanning. |
| Integration health | `/api/integrations/health` | Encrypted credentials or env keys | PARTIALLY WORKING | GitHub, Vercel, Activepieces, Resend, and Stripe probes persist connection status; social and YouTube remain UNVERIFIED without safe OAuth/webhook probes. |
| Cron/workers | Vercel cron worker routes | `CRON_SECRET` / `AGENT_WORKER_SECRET` / `WEBSITE_WORKER_SECRET` | PARTIALLY WORKING | Agent and Website Factory work use persistent queues/leases and recovery; production scheduling secrets must be configured. |

## Required target adapter families

`AIProviderAdapter`, `WebsiteBuilderAdapter`, `ImageGenerationAdapter`, `VideoGenerationAdapter`, `SocialPlatformAdapter`, `EmailProviderAdapter`, `WorkflowProviderAdapter`, and `SearchProviderAdapter` should be selected through registries. Pages should call application services; provider SDKs and HTTP details should remain inside adapters.

## Environment inventory

Current code references include `DATABASE_URL` / `NEON_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ACTIVEPIECES_MCP_URL`, `ACTIVEPIECES_OAUTH_CLIENT_ID`, `ACTIVEPIECES_OAUTH_CLIENT_SECRET`, `SOCIAL_ENCRYPTION_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SOCIAL_PUBLISH_WEBHOOK_URL`, `SOCIAL_PUBLISH_WEBHOOK_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `VERCEL_TOKEN`, `CRON_SECRET`, `AGENT_WORKER_SECRET`, and `WEBSITE_WORKER_SECRET`. Social accounts require no developer API keys (direct manual account login). Configure only the secrets for integrations you enable.

