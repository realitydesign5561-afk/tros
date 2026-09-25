# Integration Matrix

Status is based on code paths present in the repository, not credentials that may exist outside the workspace.

| Integration | Adapter/service | Credential source | Current status | Health / execution gap |
|---|---|---|---|---|
| Neon PostgreSQL | Prisma client | `NEON_DATABASE_URL` | REAL AND WORKING | Migrations are current; no application health endpoint or pool telemetry. |
| NextAuth credentials | `lib/auth.ts`, Pages API handler | `NEXTAUTH_SECRET` / `AUTH_SECRET` | PARTIALLY WORKING | Hard-coded demo login and fallback secret; no user lifecycle controls or RBAC enforcement. |
| AI Gateway | Direct `generateText` calls | `AI_GATEWAY_API_KEY` | PARTIALLY WORKING | Provider/model calls are route-specific; no unified adapter, usage/cost/latency records, retries, or health registry. |
| Activepieces | `lib/activepieces.ts` | `ACTIVEPIECES_API_URL`, `ACTIVEPIECES_API_KEY` | PARTIALLY WORKING | Create/update/run/status supported; no webhook reconciliation, durable job state, capability registry, or health history. |
| Stripe | Direct SDK in course payment route | `STRIPE_SECRET_KEY` | PARTIALLY WORKING | Payment link creation only; webhook verification, reconciliation, and durable payment events missing. |
| Resend | Direct SDK in outreach route | `RESEND_API_KEY` | PARTIALLY WORKING | Email send path exists; no provider health, idempotency, delivery webhook, or message execution record. |
| Social publishing | `lib/social-publisher.ts` webhook | `SOCIAL_PUBLISH_WEBHOOK_URL`, optional secret | MISSING INTEGRATION / PARTIALLY WORKING | Delegates to an unspecified webhook; no platform adapters, status callbacks, retries, or per-execution logs. |
| Social browser sessions | `lib/social-sessions.ts` | `SOCIAL_ENCRYPTION_KEY` | PARTIALLY WORKING | Session state is encrypted and persisted; hard-coded fallback key and no browser automation execution/health check. |
| Instagram / LinkedIn / Threads | Login URL list only | User browser session | UI/connection placeholder | No OAuth or verified platform API adapter. |
| YouTube | Prisma records + AI text | AI key only | PARTIALLY WORKING | Research/script generation persists; YouTube API upload, token vault, health, and asset pipeline missing. |
| GitHub | URL validation only | None | MISSING INTEGRATION | Website Factory stores repository URL but does not authenticate or sync. |
| Vercel | Status message only | None | MISSING INTEGRATION | Deployment is recorded as pending authorization, not executed. |
| File storage | Node filesystem in designer | None | PARTIALLY WORKING | Local uploads are not durable across serverless deployments and lack malware/content scanning. |
| Cron | Vercel cron `/api/cron/social` | `CRON_SECRET` expected by route | PARTIALLY WORKING | One scheduled route; no general scheduler, lease, queue, or missed-run recovery. |

## Required target adapter families

`AIProviderAdapter`, `WebsiteBuilderAdapter`, `ImageGenerationAdapter`, `VideoGenerationAdapter`, `SocialPlatformAdapter`, `EmailProviderAdapter`, `WorkflowProviderAdapter`, and `SearchProviderAdapter` should be selected through registries. Pages should call application services; provider SDKs and HTTP details should remain inside adapters.

## Environment inventory

Current code references: `NEON_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET`, `AI_GATEWAY_API_KEY`, `ACTIVEPIECES_API_URL`, `ACTIVEPIECES_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `SOCIAL_ENCRYPTION_KEY`, `SOCIAL_PUBLISH_WEBHOOK_URL`, `SOCIAL_PUBLISH_WEBHOOK_SECRET`, `CRON_SECRET`, and `VERCEL_URL`. Production configuration must fail closed for secrets required by an enabled integration.
