# CryptID Repository Audit

- **Status:** Stage Zero baseline
- **Audit date:** 2026-11-04
- **Baseline commit:** `5378d112ee62a374fd44c001561e9b9e871c6542`
- **Baseline branch:** `main`
- **Baseline working tree:** clean
- **Audit documents branch:** `cryptid/phase-0-audit` (local; remote branch protection is not verified)

## Scope and method

This audit records the repository and its current behavior before product implementation. It uses source inspection, Git metadata, the configured lint/type/build commands, and the dependency, SAST, and data-flow scanners. No user data or secret values were accessed. No application code, schema, or dependency was changed for this audit.

The application is an Expo/React Native project with a React Native Web export, not a Next.js application. The current web export works, but it is a local prototype: its account and chat state live in the browser process and there is no active chat API or durable account store.

## Repository map

| Area | Observed role |
| --- | --- |
| `app/` | Expo Router screens for sign-in/onboarding, chat list, settings, conversation, and new conversation flows |
| `components/`, `constants/`, `hooks/`, `lib/`, `utils/` | Shared UI, theme, hooks, and client-side helpers, including credential derivation and input checks |
| `context/` | In-memory authentication and chat state providers |
| `server/` | Express web/static and Expo manifest serving; a route registration stub; dormant generated integration scaffolding |
| `shared/` | Drizzle user schema and chat model declarations; the chat declarations are not connected to active persistence |
| `assets/`, `static-build/` | App assets and native/static packaging resources |
| `attached_assets/` | User-provided project materials, including the production-build prompt |

## Runtime and delivery

- Node.js 22, TypeScript strict mode, Expo SDK 54, React Native 0.81, React 19, Expo Router, and Express 5 are declared.
- `npm run web:build` exports a static web application to `dist/`; this completed successfully at baseline.
- `.replit` targets static deployment with `dist` as the public directory, while it also contains a `server:prod` run command. The relationship between static hosting and that server command should be verified before publishing; the export itself does not prove that the Express middleware is active in production.
- The deployment status was not re-queried during this audit. The last known platform check reported no published deployment.
- `.replit` names `README.md` as the entrypoint, but no README was present in the repository inventory.

## Data and server boundaries

- `context/auth.tsx` keeps the prototype account in module memory. Registration derives credential material client-side; there is no server account registration or login route.
- `context/chats.tsx` keeps conversations and messages in React state. Sending a message updates only that local state; there is no network transport.
- `server/routes.ts` creates an HTTP server but registers no application API routes.
- `server/storage.ts` is an in-memory scaffold. `drizzle.config.ts` points at PostgreSQL, but the inspected source contains no active DB connection module or migrations. The configured schema defines a users table only.
- Generated audio, chat, image, and batch integration files are not attached to the active route registrar. Several are not type-correct against the current schema/dependencies.
- The Express development server adds a small set of security headers, CORS checks, body-size limits, request logging, static asset handling, and error handling. These controls do not create server-side authentication or end-to-end encryption.

## Repository and delivery gaps

- No automated test files or test script were found.
- No CI workflow, migration history, README, license, contribution guide, or security policy was found in the inspected repository inventory.
- `server_dist/` and `dist/` are build outputs, not evidence of a deployed or production-tested service.
- The current working branch for this audit is local. Remote branch protection cannot be configured or confirmed from this workspace.

## Baseline product boundary

Working today: the responsive app shell and static web build; local prototype registration/login; local conversation creation; transient local message display and clearing.

Not present today: real user accounts, multi-device identity, contact/device discovery, remote message delivery, end-to-end encryption, passkeys, DIDs, verifiable credentials, a wallet, recovery, durable database persistence, tenant isolation, or production monitoring.

See [EXISTING_FEATURES.md](EXISTING_FEATURES.md) for the feature-by-feature classification and [BASELINE_TEST_RESULTS.md](BASELINE_TEST_RESULTS.md) for reproducible checks.
