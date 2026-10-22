import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { colors, CONTENT_MAX_WIDTH, radius, spacing, type } from '@/lib/theme';
import { Audience, Difficulty, Intensity, Pace, PriceBand, Region, SocialLevel, Transport, WhenFilter } from '@/lib/types';

export type DurationBand = 'Any' | 'Under 2h' | '2-4h' | '4-8h' | 'Full day' | 'Multi-day';

export interface DiscoverFilters {
  nearMe: boolean;
  // Only meaningful while nearMe is on — kept even when it's off so toggling
  // Near Me back on remembers the last radius picked.
  radiusKm: number;
  difficulty: Difficulty | 'Any';
  socialLevel: SocialLevel | 'Any';
  pace: Pace | 'Any';
  intensity: Intensity | 'Any';
  transport: Transport | 'Any';
  audience: Audience[];
  when: WhenFilter | 'Any time';
  // Only meaningful when when === 'Custom'.
  customDate: number | null;
  duration: DurationBand;
  price: PriceBand | 'Any';
  region: Region | 'Any';
}

export const DEFAULT_RADIUS_KM = 50;

export const DEFAULT_FILTERS: DiscoverFilters = {
  nearMe: false,
  radiusKm: DEFAULT_RADIUS_KM,
  difficulty: 'Any',
  socialLevel: 'Any',
  pace: 'Any',
  intensity: 'Any',
  transport: 'Any',
  audience: [],
  when: 'Any time',
  customDate: null,
  duration: 'Any',
  price: 'Any',
  region: 'Any',
};

export function countActiveFilters(f: DiscoverFilters): number {
  let n = 0;
  if (f.nearMe) n += 1;
  if (f.difficulty !== 'Any') n += 1;
  if (f.socialLevel !== 'Any') n += 1;
  if (f.pace !== 'Any') n += 1;
  if (f.intensity !== 'Any') n += 1;
  if (f.transport !== 'Any') n += 1;
  if (f.audience.length > 0) n += 1;
  if (f.when !== 'Any time') n += 1;
  if (f.duration !== 'Any') n += 1;
  if (f.price !== 'Any') n += 1;
  if (f.region !== 'Any') n += 1;
  return n;
}

// Does dateTimestamp/durationHours match a given band? Exported so Discover
// can apply the same rule it shows here.
export function durationMatchesBand(hours: number, band: DurationBand): boolean {
  switch (band) {
    case 'Any':
      return true;
    case 'Under 2h':
      return hours < 2;
    case '2-4h':
      return hours >= 2 && hours <= 4;
    case '4-8h':
      return hours > 4 && hours <= 8;
    case 'Full day':
      return hours > 8 && hours <= 24;
    case 'Multi-day':
      return hours > 24;
  }
}

const DIFFICULTIES: (Difficulty | 'Any')[] = ['Any', 'Easy', 'Moderate', 'Challenging', 'Extreme'];
const SOCIAL_LEVELS: (SocialLevel | 'Any')[] = ['Any', 'Quiet', 'Social', 'Very Social'];
const PACES: (Pace | 'Any')[] = ['Any', 'Relaxed', 'Moderate', 'Fast'];
const INTENSITIES: (Intensity | 'Any')[] = ['Any', 'Easy', 'Moderate', 'Challenging', 'Extreme'];
const TRANSPORTS: (Transport | 'Any')[] = [
  'Any',
  'Own transport',
  'Organizer transport',
  'Carpool available',
  'Bus/van',
  '4x4',
];
const AUDIENCES: Audience[] = ['Solo friendly', 'Couples', 'Families', 'Beginners', 'Experienced', 'Networking'];
const WHENS: (WhenFilter | 'Any time')[] = ['Any time', 'Today', 'Tomorrow', 'This weekend', 'This week', 'This month', 'Later', 'Custom'];
const DURATIONS: DurationBand[] = ['Any', 'Under 2h', '2-4h', '4-8h', 'Full day', 'Multi-day'];
const PRICES: (PriceBand | 'Any')[] = ['Any', 'Free', 'Under 1,000', '1,000–3,000', '3,000–5,000', '5,000+'];
const REGIONS: Region[] = ['Nairobi', 'Kiambu', 'Kajiado', 'Nakuru', 'Naivasha', 'Machakos'];
const RADII_KM = [10, 25, 50, 100];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
  resultCount: number;
  // Turning Near Me on needs a permission request + a location fetch, both
  // async — the parent (Discover) owns that so it can share the fetched
  // position with the actual list-filtering logic. Turning it off is just
  // a plain filters update, no different from any other chip here.
  onRequestNearMe: () => void;
  nearMeLoading: boolean;
  nearMeError: string | null;
}

// The real filter bottom sheet (spec §15) — one place for every secondary
// Discover filter. Category stays as its own always-visible carousel on the
// main screen; everything here is the "more filters" set.
export function FilterSheet({ visible, onClose, filters, onChange, resultCount, onRequestNearMe, nearMeLoading, nearMeError }: FilterSheetProps) {
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
              <Pressable
                disabled={nearMeLoading}
                onPress={() => (filters.nearMe ? onChange({ ...filters, nearMe: false }) : onRequestNearMe())}
                style={[styles.nearMeChip, filters.nearMe && styles.nearMeChipActive]}>
                {nearMeLoading ? (
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : (
                  <Ionicons name="locate-outline" size={14} color={filters.nearMe ? colors.primary : colors.textSecondary} />
                )}
                <Text style={[styles.nearMeChipLabel, filters.nearMe && styles.nearMeChipLabelActive]}>
                  {nearMeLoading ? 'Locating…' : 'Near me'}
                </Text>
              </Pressable>
            </View>
            {!!nearMeError && <Text style={styles.errorHint}>{nearMeError}</Text>}
            {filters.nearMe && (
              <View style={styles.chipRow}>
                {RADII_KM.map((km) => (
                  <Pressable
                    key={km}
                    onPress={() => onChange({ ...filters, radiusKm: km })}
                    style={[styles.radiusChip, filters.radiusKm === km && styles.radiusChipActive]}>
                    <Text style={[styles.radiusChipLabel, filters.radiusKm === km && styles.radiusChipLabelActive]}>
                      {km} km
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <ChipGroup
              label="Region"
              options={REGIONS}
              selected={filters.region === 'Any' ? [] : [filters.region]}
              onChange={(v) => onChange({ ...filters, region: v.length > 0 ? v[v.length - 1] : 'Any' })}
              multi={false}
            />
          </View>

          <View style={styles.section}>
            <ChipGroup
              label="When"
              options={WHENS}
              selected={[filters.when]}
              onChange={(v) => {
                const next = v.length > 0 ? v[v.length - 1] : 'Any time';
                onChange({ ...filters, when: next, customDate: next === 'Custom' ? filters.customDate : null });
              }}
              multi={false}
            />
            {filters.when === 'Custom' && (
              <DateTimeField
                mode="date"
                value={new Date(filters.customDate ?? Date.now())}
                onChange={(date) => onChange({ ...filters, customDate: date.getTime() })}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.section}>
            <ChipGroup label="Duration" options={DURATIONS} selected={[filters.duration]} onChange={single('duration')} multi={false} />
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
  nearMeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nearMeChipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  nearMeChipLabel: { ...type.chip, color: colors.textSecondary },
  nearMeChipLabelActive: { color: colors.primary },
  radiusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusChipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  radiusChipLabel: { ...type.chip, color: colors.textSecondary },
  radiusChipLabelActive: { color: colors.primary },
  errorHint: { ...type.secondary, color: colors.danger },
  hint: { ...type.secondary, color: colors.textMuted },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
