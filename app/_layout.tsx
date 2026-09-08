import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { ResponsiveViewport } from '@/components/ui/ResponsiveViewport';
import { AppProvider, useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

// Discover, adventure detail, and viewing someone else's profile are the
// public "homepage" — browsable without signing in. Posting (Create),
// managing your own account (Profile tab + its edit/privacy subscreens),
// and anything else that only makes sense for a signed-in identity
// (Messages, Chat, the organizer dashboard, editing an adventure,
// Notifications) require auth.
const AUTH_REQUIRED_PREFIXES = ['/create', '/messages', '/chat', '/organizer', '/edit', '/notifications', '/connections', '/admin', '/saved'];

function requiresAuth(pathname: string): boolean {
  if (pathname === '/profile' || pathname === '/profile/edit' || pathname === '/profile/privacy') return true;
  return AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, onboarded, authenticated, me } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (pathname === '/') return; // index.tsx handles the initial redirect itself

    if (!onboarded) {
      if (pathname !== '/onboarding') router.replace('/onboarding');
      return;
    }
    if (requiresAuth(pathname) && !authenticated) {
      if (!pathname.startsWith('/auth')) router.replace('/auth');
      return;
    }
    // Every sign-in path stamps agreedToTermsAt before completeSignIn ever
    // runs, so an authenticated session missing it didn't come from any of
    // them — it's a session restored from a device/profile that predates
    // this field. Applies everywhere, not just auth-required screens: the
    // point is nobody stays authenticated without having agreed, not just
    // that they can't reach a specific gated screen.
    if (authenticated && !me.agreedToTermsAt && pathname !== '/auth/consent') {
      router.replace('/auth/consent');
      return;
    }
  }, [ready, onboarded, authenticated, me.agreedToTermsAt, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthGate>
        <StatusBar style="dark" />
        <ResponsiveViewport>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth/index" />
            <Stack.Screen name="auth/email" />
            <Stack.Screen name="auth/phone" />
            <Stack.Screen name="auth/otp" />
            <Stack.Screen name="auth/consent" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="adventure/[id]" />
            <Stack.Screen name="crews" />
            <Stack.Screen name="crew/[id]" />
            <Stack.Screen name="connections" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="organizer/[id]" />
            <Stack.Screen name="edit/[id]" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/privacy" />
            <Stack.Screen name="profile/[id]" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ResponsiveViewport>
      </AuthGate>
    </AppProvider>
  );
}
