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

Then open in an iOS simulator, Android emulator, [Expo Go](https://expo.dev/go), or the web.

### Testing error/retry states

Profile → **Simulate network failures** forces every network action (loading adventures, joining, publishing, sending a message) to fail, so you can exercise the error and retry states without needing a real backend outage.
