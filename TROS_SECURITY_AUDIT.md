# TROS Security Audit

## Critical findings

1. `ApiKey.value` is stored as ordinary database text; migrate to authenticated encryption with key versioning and rotation.
2. `lib/agent/runtime.ts` returns mock task data; privileged execution cannot safely be considered implemented.
3. Admin authorization is inconsistent; every admin route must require a server-side role check and deny by default.
4. Next.js build sets `ignoreBuildErrors: true`; production builds must fail on type errors.
5. Authentication has documented demo/fallback behavior; remove it and require a strong configured secret.
6. Provider and integration inputs need strict Zod validation, SSRF-safe endpoint allowlisting, and secret redaction.
7. Long-running actions need idempotency keys, authorization checks, bounded retries, and audit events.

## Controls required

- Per-user query scoping for all user-owned records.
- Role and capability checks at API boundaries, not only in UI.
- AES-GCM or equivalent authenticated encryption; never log plaintext secrets.
- Rate limiting for authentication, AI, outreach, and generation endpoints.
- CSP/report-only rollout plus nosniff, referrer policy, HSTS, and appropriate frame policy.
- Structured audit logs containing actor, action, resource, outcome, and correlation ID without secrets.
- Dependency and migration review before deployment.

No security control is marked complete until covered by an automated test or verified production-safe implementation.
