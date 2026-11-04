# Security Audit and Initial Threat Model

**Baseline:** 2026-11-04. This is a source-level Stage Zero review, not a penetration test, cryptographic review, or production certification.

## Scanner results

| Scanner | Result |
| --- | --- |
| Dependency audit (OSV) | 0 critical, 17 high advisory records, 12 moderate, 4 low |
| SAST | 0 findings |
| HoundDog data-flow/privacy scan | 0 findings |

Zero code-scanner findings do not establish that the application is safe. In particular, they do not validate an encryption protocol, identity claims, deployment headers, or runtime authorization.

## Highest-priority findings

| Priority | Finding | Current evidence | Required action |
| --- | --- | --- | --- |
| **High** | The app is not a real remote secure chat | The chat provider stores messages only in local React state; there are no application API routes or message transport. | Treat it as a local prototype. Select and implement a reviewed messaging protocol before making E2EE or delivery claims. |
| **High** | Authentication is not an enforcement boundary | Account data and login state are in browser memory; no server account/session service exists. | Design server-side identity, session lifecycle, abuse controls, and account recovery before accepting real accounts or sensitive data. |
| **High** | Login throttling is client-only | The limiter is a module-level variable and can be reset by refreshing or modifying the client. | Enforce rate limits and lockout policy at the server boundary, with monitoring and safe recovery. |
| **High** | Dependency scan found unresolved advisories | 17 high and 12 moderate advisory records; vulnerable versions are pinned by several package overrides. | Review and remediate in small compatible updates; assess major upgrades separately and rerun all checks. See [DEPENDENCY_AUDIT.md](DEPENDENCY_AUDIT.md). |
| **Medium** | Server comparison is not guaranteed constant-time | `safeCompare` explicitly only reduces obvious early-exit differences; the app currently verifies locally. | Do not use it as a cryptographic guarantee. Use a reviewed constant-time primitive at a trusted server boundary where applicable. |
| **Medium** | Web security headers are incomplete/unverified | Express adds `nosniff`, referrer, and permissions headers; no CSP or HSTS is configured there. A static deployment may not run that Express middleware at all. | Verify production response headers and configure CSP, transport security, and caching at the serving layer before publishing. |
| **Medium** | Dormant integration code is not release-ready | Generated routes are not registered and baseline type checking fails in that scaffolding. | Keep it unreachable; either remove it or review, repair, and test it before any activation. |
| **Medium** | No automated regression or CI gate | No test script, tests, or CI workflow was found. | Add unit/integration tests, dependency scanning, type checking, and build verification before expanding the security surface. |

## Threat model (target platform)

The following are design risks for the requested product, not evidence of current attacks or current server-side user data.

| Asset | Threat actor/event | Main risk | Controls required before production |
| --- | --- | --- | --- |
| Passphrase, private keys, recovery material | Malicious script, compromised browser/device, stolen device | Secret theft or unauthorized impersonation | Minimize browser exposure, secure key lifecycle, passkey/device controls, recovery threat analysis, CSP, independent review |
| Message content and metadata | Malicious server/operator, network attacker, compromised endpoint | Disclosure, tampering, replay, traffic-analysis exposure | Reviewed E2EE protocol, authenticated key changes, replay protection, metadata minimization, clear retention policy |
| Device roster and sessions | Account thief, lost device, malicious client | Unauthorized device remains trusted | Server-enforced device registry, verified enrollment, revocation, session invalidation, alerts |
| DIDs and verifiable claims | Malicious issuer/verifier, phishing, compromised signing key | Forged, stale, over-disclosed, or misattributed claims | Standards-conformant issuance/verification, trust policy, expiry/status checks, selective disclosure, issuer-key rotation |
| Tenant and enterprise records | Cross-tenant bug or privileged insider | Unauthorized cross-organization access | Tenant-scoped authorization, isolation tests, audit logs, least privilege, incident response |
| Build and dependencies | Compromised upstream package or build pipeline | Code execution or secret/data compromise | Lockfile review, supported versions, CI provenance, dependency updates, secret isolation |

## Security boundaries and non-claims

- There is no server-side chat or persistent account data in the active app today. This limits current backend exposure but also means the requested security properties do not exist.
- The PBKDF2-derived local credential value verifies a locally held prototype credential; it does not encrypt chat messages or produce a public-key identity.
- A screen-level “burn” action only removes local in-memory state. It cannot promise secure deletion from screenshots, browser memory, device backups, or a remote recipient.
- The displayed fingerprint is not a signed DID or identity proof.
- Do not invent cryptographic algorithms. Use maintained, reviewed protocol implementations; require test vectors, negative/fuzz/interoperability tests, external cryptographic review, and a vulnerability-response process.

## Immediate release gate

Do not describe this app as production-ready, an encrypted chat, a self-custody wallet, or a verifiable identity platform until the corresponding implementation exists, the high dependency findings are triaged, deployment headers are verified, and security review and acceptance tests pass.
