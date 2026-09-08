import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Index() {
  const { ready, onboarded, authenticated } = useApp();

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

  // Signed-out visitors on web land on the public marketing homepage — see
  // app/home.tsx. Native has no equivalent (there's no logged-out "browse
  // the app store"-style landing to design for), and anyone already signed
  // in goes straight to Discover, same as before.
  if (Platform.OS === 'web' && !authenticated) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/(tabs)/discover" />;
}
