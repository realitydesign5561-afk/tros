# TROS Integration Matrix

| Integration | Consumer | Current evidence | Status | Required configuration |
|---|---|---|---|---|
| PostgreSQL/Prisma | all persistence | `prisma/schema.prisma`, migrations | CONFIGURATION_REQUIRED | `DATABASE_URL` |
| NextAuth credentials | login/session | `pages/api/auth/[...nextauth].ts` | PARTIALLY_WORKING | `NEXTAUTH_SECRET`, trusted URL |
| AI providers | gateway and feature agents | `lib/ai-gateway`, `lib/aiGateway.ts` | CONFIGURATION_REQUIRED | provider credentials, capability registry |
| Activepieces | workflows | `lib/activepieces.ts` | CONFIGURATION_REQUIRED | endpoint and token |
| Resend | lead outreach | `lib/lead/EmailService.ts` | CONFIGURATION_REQUIRED | Resend key and verified sender |
| Stripe | course payments | payment API routes | CONFIGURATION_REQUIRED | Stripe keys and webhook |
| Social platforms | Social OS | adapters/session routes | CONFIGURATION_REQUIRED | official OAuth apps and scopes |
| Object storage | designer/assets | local upload paths | NOT_IMPLEMENTED | production blob provider |
| Durable queue | long-running agents | no queue implementation | NOT_IMPLEMENTED | queue/worker provider |
| Deployment/GitHub | Website Factory | project fields only | NOT_IMPLEMENTED | repository and deployment authorization |

Credentials must be tenant-scoped, encrypted at rest, excluded from logs, and never returned to browser clients.
