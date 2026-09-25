# Security Audit

## Critical findings

- **Credential exposure risk:** `ApiKey.value` is stored as plaintext and is reachable from server code. Replace it with encrypted `Credential.ciphertext`; return only metadata and last-four/fingerprint values.
- **Hard-coded cryptographic fallback:** `lib/crypto.ts` uses a fixed fallback key when `SOCIAL_ENCRYPTION_KEY` is absent. Production must fail closed and use authenticated encryption with key versioning.
- **Hard-coded authentication credentials:** `lib/auth.ts` accepts `admin@reality.com` / `admin123`; `prisma/seed.ts` resets this password. Remove the production bypass and require an explicit bootstrap flow.
- **Hard-coded NextAuth secret fallback:** `lib/auth.ts` includes a development secret. Production must require `NEXTAUTH_SECRET` and fail startup when absent.
- **Database secret handling:** the connection URL has been supplied in conversation and must be rotated. `.env` files were world-writable in the workspace; use `chmod 600` and secret-manager deployment variables.

## High findings

- **Authorization inconsistency:** several admin endpoints check only for an authenticated user rather than `role === ADMIN`; enforce authorization in a shared server-side policy.
- **No CSRF/abuse controls beyond framework defaults:** credential login, provider writes, outbound email, workflow runs, and social operations need rate limits, idempotency, and audit records.
- **External side effects are not durable:** email, social webhook, Stripe links, and Activepieces runs lack execution IDs, retry policy, callback verification, and immutable logs.
- **Local filesystem uploads:** designer uploads under the application process are not durable or isolated for production.
- **SQLite backup mismatch:** the backup endpoint searches for `prisma/dev.db` while the application datasource is PostgreSQL.
- **Build type safety disabled:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`; the separate compiler currently passes but production must not suppress failures.
- **Unverified cron boundary:** cron authentication must be mandatory and constant-time; scheduled work should enqueue jobs rather than perform all work in one request.

## Medium findings

- Provider settings accept arbitrary provider labels/values without capability validation or health checks.
- Raw provider errors and payloads need redaction before persistence or client response.
- No audit trail exists for permission changes, credential access, workflow activation, publishing, or repair actions.
- No tenant/resource policy exists beyond ad hoc `ownerId` filters.

## Security target controls

- Secret manager for deployment secrets; encrypted credential vault for user/provider tokens.
- AES-256-GCM or equivalent authenticated encryption, key IDs, rotation, and decrypt-only server service.
- Central authorization policies for user, role, feature, tool, and resource scopes.
- Redaction utility applied to logs, errors, traces, and AI prompts/results where needed.
- Rate limiting, idempotency keys, replay protection, webhook signatures, and outbound allowlists.
- Append-only audit events and security-relevant system events.
- Dependency scanning, static analysis, secret scanning, and security-focused integration tests.
