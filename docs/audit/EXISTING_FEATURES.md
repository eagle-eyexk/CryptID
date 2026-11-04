# Existing Features and Verification

**Baseline:** commit `5378d112ee62a374fd44c001561e9b9e871c6542`, branch `main`, 2026-11-04.

Classifications distinguish working local prototype behavior from production capabilities. “Not implemented” is included where none of the prompt’s implementation states would accurately describe an absent feature.

| Feature | Classification | Evidence and limits |
| --- | --- | --- |
| Responsive Expo/React Native Web interface | **WORKING** | App screens are routed through Expo Router; the web export builds. This does not establish public availability or accessibility conformance. |
| Static web export | **WORKING** | `npm run web:build` exports `dist/`. A published URL and production headers were not verified in this audit. |
| Local registration and login | **PARTIALLY WORKING** | Credential material is derived in the client, but the account exists only in module memory and disappears when that runtime is lost. There is no server identity or durable account store. |
| Passphrase verification | **PARTIALLY WORKING** | Local prototype verification uses a derived credential hash. It is not a server authentication boundary, wallet key, or proof of identity. |
| Displayed identity fingerprint | **MOCKED** | It is a locally derived display value, not a DID, public-key identity, signature, or remotely verifiable proof. |
| Create a conversation | **PARTIALLY WORKING** | Creates an in-memory local conversation; it does not discover or connect to another person or device. |
| Send and view chat messages | **PARTIALLY WORKING** | Messages are appended to local React state only. There is no network delivery, receipt, synchronization, or E2EE. |
| Burn/clear local messages | **PARTIALLY WORKING** | The local UI can remove its in-memory messages. It cannot erase copies on another device, backups, logs, screenshots, or storage that does not exist in this prototype. |
| Login attempt throttling | **SECURITY RISK** | The limiter is client-memory UI friction, resets with runtime state, and is not enforced by a server. |
| Express service and security middleware | **PARTIALLY WORKING** | Development server builds and starts; it has basic headers, CORS, request-size limits, and error handling. The active route registrar adds no app API endpoints. |
| PostgreSQL persistence | **UNUSED** | Drizzle configuration and a users table exist, but there is no active DB connection or migration path in the inspected application. |
| Generated AI/audio/chat/image/batch integrations | **UNUSED / BROKEN** | Scaffolding is present but not registered in active routes; baseline TypeScript reports errors in these files. |
| Automatic account/device matching | **NOT IMPLEMENTED** | No discovery, pairing, contact graph, or device registry exists. The user previously answered “Both” to the matching-scope clarification; confirm the exact matching dimensions and consent model before implementation. |
| End-to-end encrypted chat | **NOT IMPLEMENTED** | No network messaging protocol, ratchet, device key exchange, key verification, or encrypted message storage exists. |
| Passkeys/WebAuthn and device revocation | **NOT IMPLEMENTED** | No credential registration/assertion or device lifecycle service exists. |
| DIDs, verifiable credentials, wallet, or encrypted vault | **NOT IMPLEMENTED** | No DID methods, VC issuance/verification, key custody, vault encryption, or recovery flow exists. |
| Enterprise tenants, RBAC, audit trail, Connect API/SDK | **NOT IMPLEMENTED** | No tenant model, authorization policy, audit event system, or public integration API exists. |

## Product and infrastructure decisions still open

- The user canceled the earlier question about which server should host encrypted chat accounts. No server/provider choice is recorded in the code. Do not silently choose a hosted chat platform or imply that local-only chat has a remote account service.
- The “Both” matching answer needs its two exact matching dimensions recovered or confirmed before discovery is designed. Matching should be consent-based and expose an opt-out.
- The attached prompt describes a much broader identity platform than the current chat prototype. Treat wallet, credentials, vault, enterprise, and chat as separately gated capabilities rather than shipping claims for unimplemented features.

## Verification rule

Do not label registration as account security, the fingerprint as identity proof, message clearing as guaranteed deletion, or the application as encrypted/secure chat until the corresponding server, protocol, persistence, and adversarial tests are implemented and independently reviewed.
