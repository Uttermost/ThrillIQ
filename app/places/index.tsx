import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MountainScene } from '@/components/ui/MountainScene';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Seo } from '@/components/ui/Seo';
import { EmptyState } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { derivePlaces } from '@/lib/places';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type, typography } from '@/lib/theme';

export default function Places() {
  const { adventures } = useApp();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const places = useMemo(() => derivePlaces(adventures), [adventures]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Seo title="Places" description="Browse ThrillIQ adventures grouped by where they actually happen." />
      {isWide ? (
        <View style={styles.wideHeader}>
          <Text style={styles.wideHeading}>Places</Text>
          <Text style={styles.wideSubheading}>Adventures grouped by where they actually happen.</Text>
        </View>
      ) : (
        <ScreenHeader title="Places" />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {places.length === 0 ? (
          <EmptyState icon="location-outline" title="No places yet" message="Places show up here once adventures are posted." />
        ) : (
          <View style={isWide ? styles.grid : undefined}>
            {places.map((place) => (
              <Pressable
                key={place.slug}
                style={[styles.card, isWide && styles.cardWide]}
                onPress={() => router.push(`/places/${place.slug}`)}>
                <MountainScene height={isWide ? 120 : 100} rounded={false} category={place.dominantCategory} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {place.location}
                  </Text>
                  <View style={styles.cardMetaRow}>
                    <Ionicons name="compass-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.cardMeta}>
                      {place.adventures.length} adventure{place.adventures.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  wideHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  wideHeading: { ...type.screenHeading },
  wideSubheading: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, maxWidth: DESKTOP_CONTENT_MAX_WIDTH },
  card: {
    width: '100%',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardWide: { width: 280, marginBottom: 0 },
  cardBody: { padding: spacing.md, gap: 4 },
  cardTitle: { ...type.cardTitle },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMeta: { ...type.secondary, color: colors.textMuted },
});
