# ThrillIQ

A social adventure platform for Kenya — discover, join, and coordinate real-world hikes and road trips near Nairobi, and message organizers directly. No payments move through the app; adventures are run independently and paid for directly with the organizer.

Built with [Expo](https://expo.dev) (React Native + TypeScript) and [expo-router](https://docs.expo.dev/router/introduction/).

## Scope

This is the Phase 1 mobile client, built against a mock in-memory data layer (`lib/store.tsx`, `lib/mockData.ts`) so the UI, navigation, and every loading/empty/error/retry state can be validated before a real backend exists. The data layer is written so a real API can be swapped in later without touching the screens.

Screens: onboarding, discover (list/map), adventure detail, chat, messages, create, profile, organizer dashboard, edit adventure — following the four-tab nav (Discover · Messages · Create · Profile) with adventure detail, chat, the organizer dashboard, and edit as drill-ins reached only by tapping into something specific.

## Get started

```bash
npm install
npx expo start
```

The app uses `@react-native-firebase/*`, which requires native code — it no longer runs in plain Expo Go. Use the web target, or a [development build](#building-with-eas) on a simulator/device/emulator.

### Testing error/retry states

Profile → **Simulate network failures** forces every network action (loading adventures, joining, publishing, sending a message) to fail, so you can exercise the error and retry states without needing a real backend outage.

## Building with EAS

Builds are managed through [EAS Build](https://docs.expo.dev/build/introduction/), configured in `eas.json`. The project is linked to the `graphtechnologies` Expo account (`app.json` → `extra.eas.projectId`).

```bash
npx eas-cli build --profile development --platform android   # installable dev client, for use with `npx expo start --dev-client`
npx eas-cli build --profile preview --platform android       # internal-distribution APK
npx eas-cli build --profile production --platform android    # app bundle for Play Store submission
```

### Firebase

- **Android** is fully configured: `google-services.json` is checked in and referenced via `android.googleServicesFile` in `app.json`.
- **iOS** is not yet configured. Firebase builds need an iOS app registered in the `thrilliq` Firebase project and its `GoogleService-Info.plist` added to the repo root, referenced via `expo.ios.googleServicesFile` in `app.json`. Until then, `eas build --platform ios` (and `expo prebuild --platform ios`) will fail with a `Path to GoogleService-Info.plist is not defined` error from the `@react-native-firebase/app` config plugin.
