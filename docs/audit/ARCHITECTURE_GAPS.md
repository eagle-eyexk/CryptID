# Architecture Gaps

- **Target:** the attached CryptID production-build prompt (web-accessible, secure chat and digital identity platform)
- **Current state:** Expo/React Native Web prototype with an Express static/manifest server and local-only state

## Capability gaps

| Target area | Current state | Gap |
| --- | --- | --- |
| Web application | Static Expo web export works locally | Public deployment, production routing, response headers, CSP, cache policy, accessibility, and web performance are not verified |
| Identity and accounts | Client-memory prototype account | No trusted identity API, database, session service, account recovery, audit trail, or abuse enforcement |
| Device matching | No device registry or discovery service | No enrollment, user consent, trust verification, duplicate handling, revocation, or recovery |
| Messaging | Local messages in React state | No transport, delivery guarantees, multi-device synchronization, encrypted persistence, key verification, replay handling, or metadata policy |
| Cryptography | Local credential derivation and a display fingerprint | No wallet key custody, DID methods, signing identity, key exchange, E2EE protocol, rotation, or independently reviewed implementation |
| Passkeys | None | No WebAuthn registration/assertion, origin policy, authenticator lifecycle, or recovery design |
| Credentials | None | No W3C VC issuance, presentation, verification, status/revocation, issuer trust, or consented disclosure |
| Encrypted vault | None | No encryption-at-rest model, storage boundary, key derivation/rotation, backup, or recovery |
| Enterprise | None | No tenant model, RBAC/ABAC, cross-tenant isolation, administrator audit log, or Connect API/SDK/webhooks |
| Data layer | Drizzle config and user table only; no active connection/migrations | No reviewed schema, migration/rollback procedure, backups, retention policy, or data access controls |
| Operations | Development workflows and static export | No confirmed production deployment, monitoring/alerts, incident response, restore test, or service-level objectives |
| Quality | Lint and build scripts | No automated test suite or CI gate; current TypeScript check fails in dormant scaffolding |

## Architecture and delivery risks

1. **Static/server boundary:** `.replit` uses a static deployment target and `dist` public directory, while the repository also contains an Express production run command. Verify which path serves published traffic. Express headers cannot be assumed to reach static-hosted responses.
2. **Database is configuration, not persistence:** Drizzle configuration references PostgreSQL and expects `DATABASE_URL`, but active application code does not connect to it. The chat model declarations and user schema are not a working persistence layer.
3. **Dormant scaffold can be mistaken for a feature:** generated server integrations exist but are not registered. Their presence is not evidence of a usable backend.
4. **Bundle size:** the baseline web export produced a 2.77 MB JavaScript bundle before compression. Measure real mobile and web performance before adding large identity or cryptography packages.
5. **Broad platform scope:** the prompt combines messaging, identity, wallet, credentials, vault, and enterprise controls. Building these as one undifferentiated release increases security and migration risk.

## Recommended architecture direction

- Preserve the current Expo/React Native Web client as the web/mobile UI unless a measured requirement justifies a framework migration. A rewrite to Next.js or Go is not a prerequisite for a secure design.
- Start with a modular monolith API and a clearly versioned client/server contract. Add PostgreSQL only after account, device, and retention models have been reviewed; add Redis or object storage only when justified.
- Keep identity/authentication, device trust, messaging, credential issuance/verification, and enterprise policy as separate modules with explicit boundaries and threat models.
- Use standards-based, maintained implementations for passkeys, messaging encryption, DIDs, and credentials. Keep keys client-controlled where the selected product model requires self-custody; document recovery consequences before implementing recovery.
- Add tests, dependency gates, migration/backup procedures, monitoring, and incident response before any sensitive production data is accepted.
- Do not introduce destructive migrations, replace the client stack, or activate generated integrations as an audit follow-up. Plan and rehearse those changes separately.
