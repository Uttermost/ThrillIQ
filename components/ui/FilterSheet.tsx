import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { colors, CONTENT_MAX_WIDTH, radius, spacing, type } from '@/lib/theme';
import { Audience, Difficulty, Intensity, Pace, PriceBand, Region, SocialLevel, Transport, WhenBucket } from '@/lib/types';

export interface DiscoverFilters {
  difficulty: Difficulty | 'Any';
  socialLevel: SocialLevel | 'Any';
  pace: Pace | 'Any';
  intensity: Intensity | 'Any';
  transport: Transport | 'Any';
  audience: Audience[];
  when: WhenBucket | 'Any time';
  price: PriceBand | 'Any';
  region: Region | 'Any';
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  difficulty: 'Any',
  socialLevel: 'Any',
  pace: 'Any',
  intensity: 'Any',
  transport: 'Any',
  audience: [],
  when: 'Any time',
  price: 'Any',
  region: 'Any',
};

export function countActiveFilters(f: DiscoverFilters): number {
  let n = 0;
  if (f.difficulty !== 'Any') n += 1;
  if (f.socialLevel !== 'Any') n += 1;
  if (f.pace !== 'Any') n += 1;
  if (f.intensity !== 'Any') n += 1;
  if (f.transport !== 'Any') n += 1;
  if (f.audience.length > 0) n += 1;
  if (f.when !== 'Any time') n += 1;
  if (f.price !== 'Any') n += 1;
  if (f.region !== 'Any') n += 1;
  return n;
}

const DIFFICULTIES: (Difficulty | 'Any')[] = ['Any', 'Easy', 'Moderate', 'Challenging', 'Extreme'];
const SOCIAL_LEVELS: (SocialLevel | 'Any')[] = ['Any', 'Quiet', 'Social', 'Very Social'];
const PACES: (Pace | 'Any')[] = ['Any', 'Relaxed', 'Moderate', 'Fast'];
const INTENSITIES: (Intensity | 'Any')[] = ['Any', 'Easy', 'Moderate', 'Challenging', 'Extreme'];
const TRANSPORTS: (Transport | 'Any')[] = ['Any', 'Own transport', 'Organizer transport', 'Carpool available'];
const AUDIENCES: Audience[] = ['Solo friendly', 'Couples', 'Families', 'Beginners', 'Experienced', 'Networking'];
const WHENS: (WhenBucket | 'Any time')[] = ['Any time', 'This week', 'This month', 'Later'];
const PRICES: (PriceBand | 'Any')[] = ['Any', 'Free', 'Under 1,000', '1,000–3,000', '3,000–5,000', '5,000+'];
const REGIONS: Region[] = ['Nairobi', 'Kiambu', 'Kajiado', 'Nakuru', 'Naivasha', 'Machakos'];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
  resultCount: number;
}

// The real filter bottom sheet (spec §15) — one place for every secondary
// Discover filter. Category stays as its own always-visible carousel on the
// main screen; everything here is the "more filters" set.
export function FilterSheet({ visible, onClose, filters, onChange, resultCount }: FilterSheetProps) {
  const { width } = useWindowDimensions();
  const isWide = width > CONTENT_MAX_WIDTH;
  const single = <K extends keyof DiscoverFilters>(key: K) => (values: DiscoverFilters[K][]) => {
    onChange({ ...filters, [key]: values.length > 0 ? values[values.length - 1] : DEFAULT_FILTERS[key] });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, isWide && styles.sheetCentered]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={() => onChange(DEFAULT_FILTERS)} hitSlop={8}>
            <Text style={styles.clearAll}>Clear all</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            <View style={styles.chipRow}>
              <Pressable disabled style={[styles.disabledChip]}>
                <Text style={styles.disabledChipLabel}>Near me</Text>
                <Text style={styles.comingSoon}>Coming soon</Text>
              </Pressable>
            </View>
            <ChipGroup
              label="Region"
              options={REGIONS}
              selected={filters.region === 'Any' ? [] : [filters.region]}
              onChange={(v) => onChange({ ...filters, region: v.length > 0 ? v[v.length - 1] : 'Any' })}
              multi={false}
            />
          </View>

          <View style={styles.section}>
            <ChipGroup label="When" options={WHENS} selected={[filters.when]} onChange={single('when')} multi={false} />
          </View>

          <View style={styles.section}>
            <ChipGroup label="Price" options={PRICES} selected={[filters.price]} onChange={single('price')} multi={false} />
            <Text style={styles.hint}>Price shown for information only. Participants pay the organizer directly.</Text>
          </View>

          <View style={styles.section}>
            <ChipGroup
              label="Difficulty"
              options={DIFFICULTIES}
              selected={[filters.difficulty]}
              onChange={single('difficulty')}
              multi={false}
            />
          </View>

          <View style={styles.section}>
            <ChipGroup
              label="Social level"
              options={SOCIAL_LEVELS}
              selected={[filters.socialLevel]}
              onChange={single('socialLevel')}
              multi={false}
            />
          </View>

          <View style={styles.section}>
            <ChipGroup label="Pace" options={PACES} selected={[filters.pace]} onChange={single('pace')} multi={false} />
          </View>

          <View style={styles.section}>
            <ChipGroup label="Intensity" options={INTENSITIES} selected={[filters.intensity]} onChange={single('intensity')} multi={false} />
          </View>

          <View style={styles.section}>
            <ChipGroup label="Transport" options={TRANSPORTS} selected={[filters.transport]} onChange={single('transport')} multi={false} />
          </View>

          <View style={styles.section}>
            <ChipGroup
              label="Audience"
              options={AUDIENCES}
              selected={filters.audience}
              onChange={(v) => onChange({ ...filters, audience: v })}
              multi
            />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button label={`Show ${resultCount} adventure${resultCount === 1 ? '' : 's'}`} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
  },
  // On tablet/desktop-width viewports the Modal itself still spans the
  // full window (RN's Modal isn't scoped by ResponsiveViewport), so the
  // sheet re-applies the same max-width constraint and centers itself
  // instead of stretching edge to edge.
  sheetCentered: {
    left: undefined,
    right: undefined,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...type.sectionHeading },
  clearAll: { ...type.bodyEmphasis, color: colors.primary },
  body: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionLabel: { ...type.inputLabel },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  disabledChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    opacity: 0.55,
  },
  disabledChipLabel: { ...type.chip, color: colors.textMuted },
  comingSoon: { ...type.caption, fontSize: 10, color: colors.textMuted },
  hint: { ...type.secondary, color: colors.textMuted },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
