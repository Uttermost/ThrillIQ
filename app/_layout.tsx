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
      if (!pathname.startsWith('/auth')) router.replace('/auth');
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
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthGate>
    </AppProvider>
  );
}
