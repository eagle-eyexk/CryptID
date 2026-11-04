# Migration and Delivery Plan

This plan is gated. Stage Zero documents the current state; it does not authorize a wholesale rewrite or a production security claim. Keep the current prototype usable while incrementally adding verified capabilities.

## Stage Zero — baseline audit (current)

- [x] Record Git baseline and working-tree state.
- [x] Inventory implemented, partial, unused, mocked, broken, and absent features.
- [x] Run lint, TypeScript, server build, web build, and three security scanners.
- [x] Document architectural gaps and initial threat model.
- [ ] Confirm product scope and open decisions before implementation.

Deliverables: this folder’s seven audit documents. Baseline source commit: `5378d112ee62a374fd44c001561e9b9e871c6542`.

## Stage 1 — product, trust, and deployment decisions

Before building backend or cryptographic features:

1. Separate the MVP web chat from the broader identity-platform scope.
2. Confirm what “Both” means for automatic matching, define consent, visibility, opt-out, and anti-enumeration behavior.
3. Select the server/hosting model for accounts and encrypted chat; the earlier provider-selection question was canceled, so no host is assumed here.
4. Define account recovery, key custody, device replacement/revocation, metadata retention, and user deletion guarantees.
5. Decide which DID, credential, and messaging standards are required and which are explicitly out of scope.
6. Write product-level abuse cases and a threat model. Do not create or migrate production data before a data model and rollback plan are reviewed.

**Gate:** written decisions and acceptance criteria approved; no feature is called encrypted or self-custodied based only on UI.

## Stage 2 — engineering and dependency foundation

- Remediate the dependency advisories from `DEPENDENCY_AUDIT.md`, resolving vulnerable override pins and isolating major upgrades.
- Add automated tests for existing local flows, API contract tests, and a CI gate for lint, type checking, tests, web build, and dependency scanning.
- Decide whether dormant integrations should be removed or supported; do not expose them until type-correct and reviewed.
- Add explicit database connection, schema migrations, backup/restore, and rollback only after the data model is approved.
- Define CSP and other production headers at the actual static or server hosting layer. Verify them against the deployed origin.
- Measure the web bundle and test keyboard, screen-reader, contrast, focus, and mobile layouts.

**Gate:** clean supported type check and repeatable build/test pipeline; no unresolved high dependency findings unless a documented exception is approved.

## Stage 3 — real accounts and device lifecycle

- Implement server-enforced account and session boundaries, input validation, rate limits, abuse monitoring, and audit events.
- Add passkeys/WebAuthn only with correct relying-party/origin configuration, supported authenticator lifecycle, recovery, and user messaging.
- Add device enrollment, cross-device matching with consent, device verification, revocation, and session invalidation.
- Test unauthorized access, replay, account enumeration, recovery abuse, and multi-device revocation.

**Gate:** server authorization tests and threat-model review pass; recovery cannot silently bypass device trust.

## Stage 4 — secure messaging

- Choose a maintained, reviewed E2EE protocol/library; do not invent cryptographic primitives or design a new protocol in application code.
- Implement authenticated device-key changes, identity verification, encrypted message payloads, replay protection, delivery state, metadata minimization, and clear retention semantics.
- Add protocol test vectors, negative/fuzz/interoperability tests, multi-device and revocation tests, and external cryptographic review.
- Keep server-side delivery state and encrypted content separate; do not log plaintext or secrets.

**Gate:** independent review findings resolved or explicitly accepted; user-visible claims match verified protocol properties.

## Stage 5 — wallet, DIDs, and credentials (separate releases)

- Define supported DID methods and resolution/trust policy before creating identifiers.
- Add wallet key custody, backup/recovery, export, and compromise handling as a separately reviewed feature.
- Implement credential issuance, verification, status/revocation, expiry, issuer trust, and selective disclosure against the required standards.
- Test malformed, expired, revoked, replayed, and untrusted credentials, including privacy and data-minimization behavior.

**Gate:** interoperability tests and security/privacy review pass for each credential or wallet flow.

## Stage 6 — enterprise and production operations

- Add tenant boundaries, role/permission model, tenant-isolation tests, administrative audit trails, and documented retention.
- Add Connect API/SDK/webhooks only with scoped authentication, replay protection, rate limits, versioning, and sandboxing.
- Establish monitoring, alerting, backup restore drills, incident response, vulnerability reporting, key rotation, and service objectives.
- Complete applicable privacy, legal, and operational reviews before broad launch.

## Release acceptance gate

Do not label the full product “production-ready” until required scope is implemented and independently verified: secure authentication and device lifecycle, E2EE review, credential/wallet standards and test coverage if in scope, tenant isolation if in scope, dependency remediation, reproducible tests/builds, deployment headers, backup/recovery, monitoring, incident response, and privacy/legal review. Any critical unmet acceptance criterion blocks that claim.
