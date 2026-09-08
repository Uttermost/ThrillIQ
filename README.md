# ThrillIQ

A social adventure platform for Kenya — discover, join, and coordinate real-world hikes and road trips near Nairobi, and message organizers directly. No payments move through the app; adventures are run independently and paid for directly with the organizer.

Built with [Expo](https://expo.dev) (React Native + TypeScript) and [expo-router](https://docs.expo.dev/router/introduction/).

## Scope

Screens: onboarding, discover (list/map), adventure detail, chat, messages, create, profile, organizer dashboard, edit adventure — following the four-tab nav (Discover · Messages · Create · Profile) with adventure detail, chat, the organizer dashboard, and edit as drill-ins reached only by tapping into something specific.

### What's real vs. mocked, by platform

`@react-native-firebase` (auth + Firestore) is native-only, so the app is split by platform via Metro's `.native.ts`/`.web.ts` file convention (`lib/authProvider.*`, `lib/adventuresProvider.*`) behind one `useApp()` interface — screens don't know or care which backend they're talking to:

|                          | Web                          | Android (native)                                  |
| ------------------------ | ----------------------------- | -------------------------------------------------- |
| Auth (email/phone)       | Simulated                     | Real Firebase Auth                                  |
| Auth (Google/Apple)      | Simulated                     | Simulated — Google needs a SHA-1 fingerprint added to the Firebase console first; Apple is out of scope for now |
| Adventures (discover/join/leave/like/create/edit/cancel) | Simulated, in-memory mock array (`lib/mockData.ts`) | Real Firestore (`adventures` collection), live via `onSnapshot` |
| Messages/chat            | Simulated                     | Simulated (not yet migrated to Firestore)           |

Native's Firestore starts **empty** rather than seeded with the demo data — the mock data's organizer/participant ids (`u-vincent`, `u-tom`, etc.) are fake and don't correspond to real Firebase users, so seeding them there would be pretend data pretending to be real. Sign up and create an adventure to see it flow through.

Identity is dynamic (`useApp().myId`): the mock `ME_ID` on web, the signed-in Firebase uid on native — every screen that checks "is this me?" (organizer badges, "you're going", hosting stats) reads it from context rather than a hardcoded constant.

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
