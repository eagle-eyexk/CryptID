# CryptId — Secure Ephemeral Messenger

A dark, atmospheric encrypted messaging app with self-destructing messages and PIN lock screen.

## Architecture

- **Frontend**: Expo Router (file-based routing), React Native
- **Backend**: Express.js (port 5000) — serves API + landing page
- **Storage**: AsyncStorage (local only — no server-side persistence)
- **Auth**: PIN-based lock screen (default PIN: 1234)

## Key Features

- PIN lock screen with shake animation on wrong entry
- Encrypted channel creation with custom self-destruct timers (30s → 24h → Never)
- Messages auto-expire and purge based on burn timer
- Inverted FlatList chat UI with live countdown timers on each message
- Burn all messages / delete channel options
- Settings: change PIN, wipe all data, stats
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
- All data stored in AsyncStorage — no server needed
- Messages purge every 10s based on expiresAt timestamp
- Auto-reply simulation gives the app a live feel
