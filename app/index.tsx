import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Index() {
  const { ready, authenticated, onboarded } = useApp();

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

  if (!authenticated) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/(tabs)/discover" />;
}
