# @keep-playing/mobile

The agency app. Joining AhTohMoh means downloading this.

Expo + expo-router. Same API as the web (`apps/web`), authenticated with a
session token in SecureStore sent as `Authorization: Bearer`.

## Run it

```bash
# From the repo root
pnpm install

# Point the app at your dev server (your machine's LAN address, not localhost)
echo "EXPO_PUBLIC_API_URL=http://192.168.1.20:3000" > apps/mobile/.env

# Start
pnpm --filter @keep-playing/mobile dev
```

Scan the QR with Expo Go (Android/iOS). Sign in with your Collective account.

## Tabs

- **Home** — Since you were here. The async loop.
- **Projects** — everything visible to your tier.
- **Voice** — the recorder as a primary surface. Record, upload, transcribe.
- **You** — profile + sign out.

## Builds

Private distribution via EAS: TestFlight (iOS) + Play internal track (Android).

```bash
npx eas build --profile preview --platform all
```

Bundle ids: `com.ahtohmoh.keepplaying`.
