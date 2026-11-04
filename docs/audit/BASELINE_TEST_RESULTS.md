# Baseline Test and Build Results

- **Date:** 2026-11-04
- **Source baseline:** `main` at `5378d112ee62a374fd44c001561e9b9e871c6542`
- **Initial Git status:** clean
- **Runtime:** Node.js 22

No application source, schema, or package dependency was changed for this audit. The audit documents are being added separately on local branch `cryptid/phase-0-audit`.

## Commands

| Check | Result | Details |
| --- | --- | --- |
| `npm run lint` | **PASS with warnings** | 0 errors, 14 unused-code warnings, all in `components/LockGate.tsx`. |
| `npx tsc --noEmit --pretty false` | **FAIL** | 14 errors, all in dormant `server/replit_integrations/` scaffolding. |
| `npm run server:build` | **PASS** | Express bundle completed (`server_dist/index.js`). |
| `npm run web:build` | **PASS** | Expo web export completed to `dist/`; 55 assets, 2.54 KB CSS, 2.77 MB JavaScript bundle before compression. |
| Automated tests | **NOT CONFIGURED** | No test script or test/spec files were found in the inspected repository. No test suite could be run. |
| Dependency audit | **FINDINGS** | 0 critical, 17 high, 12 moderate, 4 low advisory records. |
| SAST | **PASS** | 0 findings reported. |
| HoundDog | **PASS** | 0 data-flow/privacy findings reported. |

## TypeScript error groups

1. `server/replit_integrations/audio/routes.ts`: three Express route parameter type mismatches (`string | string[]` versus `string`).
2. `server/replit_integrations/batch/utils.ts`: two uses of `p-retry` `AbortError` that do not match the installed API types.
3. `server/replit_integrations/chat/routes.ts`: three route parameter type mismatches.
4. `server/replit_integrations/chat/storage.ts`: missing `server/db` module and missing `conversations`/`messages` exports from the current schema.
5. `server/replit_integrations/image/client.ts`: two possibly-undefined response data errors.
6. `server/replit_integrations/image/routes.ts`: one possibly-undefined response data error.

These files are not registered by the active `server/routes.ts` registrar. The errors still block a clean repository-wide TypeScript check and should be resolved or the unused scaffold removed before a CI gate is made mandatory.

## Interpretation

- A passing web export confirms a static bundle can be generated; it does not confirm a public deployment, production headers, or working remote chat.
- A passing server bundle confirms the active server entrypoint bundles; it does not verify app API behavior because no app API routes are registered.
- Scanner zeroes do not validate cryptographic design, protocol correctness, or authorization.
- The running development workflows were reported by the workspace during this audit; no browser-driven test was performed because the requested work is a Stage Zero audit and the application code was not changed.

For security findings and remediation order, see [SECURITY_AUDIT.md](SECURITY_AUDIT.md) and [DEPENDENCY_AUDIT.md](DEPENDENCY_AUDIT.md).
