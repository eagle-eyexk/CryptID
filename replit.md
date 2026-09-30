# CryptId — Local, View-Once Messaging

A responsive web application with native mobile support for temporary, local-only message sessions. It does not deliver messages to another person or provide end-to-end message encryption.

## Architecture

- **Frontend**: Expo Router and React Native; the web interface uses a desktop sidebar and a compact mobile tab bar
- **Backend**: Express.js (port 5000) — serves the Expo application; no chat or identity API is registered
- **Storage**: None — identity, channels, messages, and rate-limit state exist only in runtime memory
- **Auth**: Memory-only passphrase identity; reload starts a fresh session

## Key Features

- Responsive channel list, local channel creation, chat, and settings
- Local message composer for the current runtime only; messages are not delivered remotely
- Messages are removed from memory about 1.2 seconds after first becoming visible
- No message previews or retained conversation history
- Clear pending messages, delete channels, sign out, and end the session
- Passphrase identity with a generated session fingerprint; no identity persistence

## File Structure

```
app/
  _layout.tsx           — Root layout with all providers
  (tabs)/
    _layout.tsx         — Responsive web navigation and native tabs
    index.tsx           — Current local channels
    settings.tsx        — Session status and memory controls
  chat/[id].tsx         — Local view-once channel
  new.tsx               — Local channel creation

components/
  AuthGate.tsx          — In-memory identity registration and unlock
  ResponsiveTabBar.tsx  — Web sidebar and compact mobile navigation
  DnaHelix.tsx          — Session identity visualization
  ErrorBoundary.tsx     — Error boundary
  ErrorFallback.tsx     — Error UI

context/
  auth.tsx              — In-memory passphrase identity
  chats.tsx             — In-memory channels and messages

constants/
  colors.ts             — CryptId color palette
```

## Workflows

- **Start Backend**: `npm run server:dev` (port 5000)
- **Start Frontend**: `npm run expo:dev` (port 8081)

## Notes

- Nothing is written to browser or device storage or a project database
- Message text is not sent to the backend or a third-party AI service
- A local channel is a single-runtime experience, not a remote conversation
- Reloading or ending the session clears the in-memory state
