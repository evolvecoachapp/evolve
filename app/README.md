# EVOLVE Mobile

React Native + Expo (managed workflow, TypeScript, Expo Router) client for
the EVOLVE API. See Decision 025/026 in [`docs/DECISIONS.md`](../docs/DECISIONS.md)
for the stack rationale, and [`EVOLVE_ARCHITECTURE.md`](../.cursor/rules/EVOLVE_ARCHITECTURE.md)
for how this fits the overall platform.

## Prerequisites

- Node.js 20.19+ (tested with v24) and npm
- The EVOLVE backend running locally (see repo root docs) — this app talks to it over plain HTTP.
- [Expo Go](https://expo.dev/go) on a physical device, or an iOS Simulator / Android Emulator.

This project uses **Expo SDK 54** (`default@sdk-54` template). Dependencies were installed with `npm install` and aligned via `npx expo install --fix`. Test tooling pins `react-test-renderer@19.1.0` to match the SDK's React 19.1.0.

## Setup

```bash
cd app
npm install
cp .env.example .env
# Edit .env if the backend isn't reachable at http://localhost:8000 from your
# device/simulator (e.g. use your machine's LAN IP for Android emulators or
# physical devices).
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` / `npm run web` | Start and open on a specific platform |
| `npm run lint` | ESLint (`eslint-config-expo`) |
| `npm run format` | Prettier — write mode |
| `npm test` | Jest (`jest-expo` preset) unit/component tests |
| `npx tsc --noEmit` | TypeScript typecheck |
| `npx expo export --platform web` | Verify the Metro/Expo bundle builds (static web export) |

## Structure

```
app/              # Expo Router route tree (thin — mounts screens from src/screens)
src/
  api/            # Typed HTTP client (fetch-based) + endpoint calls
  auth/           # AuthContext/useAuth, secure token storage
  components/     # Shared UI primitives (Button, TextField)
  screens/        # Screen components rendered by the route files
  types/          # TypeScript types mirroring backend Pydantic schemas
```

## Scope of this sprint (5.1)

Delivered: project scaffold, a typed API client with JWT auth (login,
register, refresh-on-401, secure token persistence), and a welcome →
login/register → placeholder home screen flow, all against the existing,
unmodified backend `/api/v1/auth/*` and `/api/v1/users/me` endpoints.

Not in this sprint: Coach chat, workout, meal, and progress screens (5.2/5.3),
push notifications and offline sync (5.3), full profile-completion
onboarding, and native/EAS builds. See `docs/TASKS.md`/`docs/ROADMAP.md`.
