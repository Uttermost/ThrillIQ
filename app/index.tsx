import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Index() {
  const { ready, onboarded } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  // Discover is the public homepage — signed in or not, land there. Signing
  // in is only required for posting or accessing your profile.
  return <Redirect href="/(tabs)/discover" />;
}
