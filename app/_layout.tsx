import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, onboarded, authenticated } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (pathname === '/') return; // index.tsx handles the initial redirect itself

    if (!onboarded) {
      if (pathname !== '/onboarding') router.replace('/onboarding');
      return;
    }
    if (!authenticated) {
      // /legal/* (Terms, Privacy, FAQ) must stay reachable pre-auth — the
      // sign-up screen links there so people can read them before agreeing.
      if (!pathname.startsWith('/auth') && !pathname.startsWith('/legal')) router.replace('/auth');
      return;
    }
  }, [ready, onboarded, authenticated, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthGate>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth/index" />
          <Stack.Screen name="auth/email" />
          <Stack.Screen name="auth/phone" />
          <Stack.Screen name="auth/otp" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="adventure/[id]" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="organizer/[id]" />
          <Stack.Screen name="edit/[id]" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/privacy" />
          <Stack.Screen name="profile/[id]" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="legal/terms" />
          <Stack.Screen name="legal/privacy" />
          <Stack.Screen name="legal/faq" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthGate>
    </AppProvider>
  );
}
