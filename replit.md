# CryptId — Secure Ephemeral Messenger

A dark, atmospheric encrypted messaging app with self-destructing messages and PIN lock screen.

## Architecture

- **Frontend**: Expo Router (file-based routing), React Native
- **Backend**: Express.js (port 5000) — serves API + landing page
- **Storage**: None — identity, channels, and messages exist only in memory
- **Auth**: Memory-only passphrase session

## Key Features

- PIN lock screen with shake animation on wrong entry
- Encrypted channel creation with view-once messages
- Messages are deleted from memory after being visible for 1.2 seconds
- Inverted FlatList chat UI with no message previews or history
- Burn all messages / delete channel options
- Settings: end session, clear memory, and privacy status
- Dark navy theme with cyan/green accents (no-trace aesthetic)

## File Structure

```
app/
  _layout.tsx           — Root layout with all providers
  (tabs)/
    _layout.tsx         — Tab layout (liquid glass on iOS 26+)
    index.tsx           — Conversations list
    settings.tsx        — Settings + security
  chat/[id].tsx         — Chat screen (inverted FlatList, keyboard-aware)
  new.tsx               — New channel creation (modal)

components/
  LockGate.tsx          — PIN lock screen with keypad
  ErrorBoundary.tsx     — Error boundary
  ErrorFallback.tsx     — Error UI
  KeyboardAwareScrollViewCompat.tsx

context/
  auth.tsx              — PIN authentication state
  chats.tsx             — Conversations & messages with auto-expiry

constants/
  colors.ts             — Dark navy theme
```

## Workflows

- **Start Backend**: `npm run server:dev` (port 5000)
- **Start Frontend**: `npm run expo:dev` (port 8081)

## Notes

- Default PIN is `1234`
- Nothing is written to device storage or a project database
- Messages never call a backend or third-party AI service
- Reloading or ending the session clears the in-memory state
