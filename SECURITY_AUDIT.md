# Security Audit

## Critical findings

- **Legacy credential table:** `ApiKey.value` remains a plaintext column for compatibility, but provider/admin application paths no longer read it. `scripts/migrate-legacy-api-keys.ts` verifies encrypted copies before deleting source rows. The current database dry run found zero legacy rows; run this script on each deployment database after configuring the vault key.
- **Credential key configuration:** AI credentials use AES-256-GCM and key-version metadata through `AI_CREDENTIAL_ENCRYPTION_KEYS` and `AI_CREDENTIAL_ENCRYPTION_KEY_VERSION`; legacy single-key `v1` remains readable. Configure/backup the key ring and rotate via the admin-only API before removing old versions.
- **Social session migration:** new social-session writes use AES-256-GCM and fail closed without `SOCIAL_ENCRYPTION_KEY`. Legacy AES-CBC sessions remain readable for migration compatibility; re-save them with a configured key to upgrade.
- **NextAuth secret fallback:** `lib/auth.ts` still has a development fallback. Production must require `NEXTAUTH_SECRET` and fail startup when absent.
- **Database secret handling:** the connection URL was exposed in conversation and should be rotated. Use secret-manager deployment variables and restrict local `.env` permissions.

## High findings

- **Authorization inconsistency:** several admin endpoints check only for an authenticated user rather than `role === ADMIN`; enforce authorization in a shared server-side policy.
- **No CSRF/abuse controls beyond framework defaults:** credential login, provider writes, outbound email, workflow runs, and social operations need rate limits, idempotency, and audit records.
- **External side effects are not durable:** email, social webhook, Stripe links, and Activepieces runs lack execution IDs, retry policy, callback verification, and immutable logs.
- **Local filesystem uploads:** designer uploads under the application process are not durable or isolated for production.
- **SQLite backup mismatch:** the backup endpoint searches for `prisma/dev.db` while the application datasource is PostgreSQL.
- **Build type safety disabled:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`; the separate compiler currently passes but production must not suppress failures.
- **Cron authentication comparison:** cron secrets are now mandatory for the social publisher, but authorization comparison should still be constant-time.

## Medium findings

- Legacy integrations using environment variables still require deployment configuration; encrypted user credentials are resolved server-side for supported adapters.
- Raw provider errors and payloads need redaction before persistence or client response.
- No audit trail exists for permission changes, credential access, workflow activation, publishing, or repair actions.
- No tenant/resource policy exists beyond ad hoc `ownerId` filters.

## Security target controls

- Secret manager for deployment secrets; encrypted credential vault for user/provider tokens.
- AES-256-GCM or equivalent authenticated encryption, key IDs, rotation, and decrypt-only server service. Social sessions still need a legacy-data re-save campaign.
- Central authorization policies for user, role, feature, tool, and resource scopes.
- Redaction utility applied to logs, errors, traces, and AI prompts/results where needed.
- Rate limiting, idempotency keys, replay protection, webhook signatures, and outbound allowlists.
- Append-only audit events and security-relevant system events.
- Dependency scanning, static analysis, secret scanning, and security-focused integration tests.
