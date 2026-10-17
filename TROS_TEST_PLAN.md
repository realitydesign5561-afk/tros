# TROS Test Plan

## Required layers

1. **Static:** TypeScript, ESLint, dependency audit, Prisma validation.
2. **Unit:** provider routing, retry classification, encryption, schemas, permissions, state transitions.
3. **API:** unauthenticated denial, tenant scoping, validation, idempotency, error contracts.
4. **Integration:** PostgreSQL migrations, NextAuth credentials, configured provider health, Activepieces mapping, Stripe webhook reconciliation.
5. **Browser:** login, dashboard, generation submission, workflow review/activation, task progress, error/retry states, responsive layout.
6. **Production smoke:** deployment health, database connectivity, configured integrations, headers, and rollback path.

## Exit criteria

- `npm test -- --runInBand` passes.
- `npm run build` passes without ignored TypeScript failures.
- No privileged route is accessible without the required role.
- Every claimed completed task has persisted evidence and an inspectable execution record.
- Configuration-dependent integrations report `CONFIGURATION_REQUIRED` clearly.

Current baseline was blocked before dependency installation; rerun after implementation.
