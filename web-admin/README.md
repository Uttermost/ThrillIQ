# ThrillIQ Web Admin

An internal moderation panel for ThrillIQ staff, built with Next.js (App Router) + TypeScript + Tailwind. It talks directly to the same Firestore database as the mobile app — same collections, same `firestore.rules`, same `User.isAdmin` gate — there is no separate backend or admin-login system.

## Scope (v1)

- **Reports queue** — open reports on posts/comments/adventures/users/reviews, with resolve / dismiss / delete-content actions. Feature parity with the mobile app's `app/admin.tsx`.
- **Audit log** — the last 50 moderation actions, append-only, same `auditLog` collection.

User management (promote/demote admins, ban users) and general content browsing were deliberately left out of this first pass — `isAdmin` can only be set by hand in the Firebase console today (see `firestore.rules`), and there's no `ban` field on `User` yet. Revisit once there's a real need.

## How auth works

Admin access is gated by `User.isAdmin` on the signed-in Firebase Auth user's own `/users/{uid}` doc — the exact same flag and the exact same rule (`firestore.rules`) the mobile app and its `app/admin.tsx` screen rely on. This panel doesn't invent a separate admin login: sign in with the Google account already linked to a ThrillIQ user, and if that user's `isAdmin` is `true`, you're in. If it's `false` (or no profile exists yet), you'll see a "not authorized" screen with a sign-out link.

There's no self-service way to become an admin — `isAdmin` is deliberately not client-settable (see the `/users/{uid}` update rule), so granting access still means a human setting it in the Firebase console.

## Setup

1. **Register a Web app** in the `thrilliq` Firebase project (Firebase console → Project settings → General → Your apps → Add app → Web), if one doesn't already exist. The mobile app only registered an Android app (`../google-services.json`) — the JS SDK needs its own Web app config.
2. **Enable the Google sign-in provider** for the project (Authentication → Sign-in method → Google), if not already enabled — it should already be, since the mobile app uses Google Sign-In too.
3. Copy `.env.example` to `.env.local` and fill in the values from step 1:
   ```bash
   cp .env.example .env.local
   ```
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Deploying

This is a standard Next.js app — deploy it anywhere Next.js runs (Vercel, Cloud Run, etc.), with the `NEXT_PUBLIC_FIREBASE_*` env vars set on the host. No server-side secrets are involved; all reads/writes happen client-side through Firestore's own security rules, same as the mobile app.
