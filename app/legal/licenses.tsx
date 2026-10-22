import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { OPEN_SOURCE_DEPENDENCIES } from '@/lib/openSourceLicenses';
import { colors, radius, spacing, type } from '@/lib/theme';

export default function OpenSourceLicenses() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Open source licenses" />
      <FlatList
        data={OPEN_SOURCE_DEPENDENCIES}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Text style={styles.intro}>
            ThrillIQ is built with the following open source packages. Each is used under the terms of its own license, shown below — see the
            package's own repository for the full license text.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.meta}>
              <Text style={styles.version}>v{item.version}</Text>
              <View style={styles.licenseBadge}>
                <Text style={styles.licenseLabel}>{item.license}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  intro: { ...type.body, color: colors.textSecondary, marginBottom: spacing.lg },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  name: { ...type.bodyEmphasis },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  version: { ...type.secondary, color: colors.textMuted },
  licenseBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  licenseLabel: { ...type.chip, color: colors.textSecondary },
});
