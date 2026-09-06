import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <AppProvider>
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
    </AppProvider>
  );
}
