import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MountainScene } from '@/components/ui/MountainScene';
import { useApp } from '@/lib/store';
import { colors, iconSize, spacing, type } from '@/lib/theme';
import { Adventure } from '@/lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const LOW_SPOTS_THRESHOLD = 3;
const AVATAR_STACK_MAX = 3;

interface AdventureCardProps {
  adventure: Adventure;
  onPress: () => void;
  onToggleLike?: () => void;
}

export function AdventureCard({ adventure, onPress, onToggleLike }: AdventureCardProps) {
  const { myId, users, fetchOtherProfile } = useApp();
  const isHosting = adventure.organizerId === myId;
  const isFull = adventure.spotsFilled >= adventure.spotsTotal;
  const organizer = users[adventure.organizerId];
  const goingIds = [adventure.organizerId, ...adventure.participantIds];

  useEffect(() => {
    goingIds.slice(0, AVATAR_STACK_MAX).forEach((uid) => {
      if (!users[uid]) fetchOtherProfile(uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adventure.organizerId, adventure.participantIds.join(',')]);

  const spotsLeft = adventure.spotsTotal - adventure.spotsFilled;
  const startingSoon = adventure.dateTimestamp > Date.now() && adventure.dateTimestamp - Date.now() < DAY_MS;
  const statusBadge: { label: string; tone: 'neutral' | 'accent' | 'success' } = isFull
    ? { label: 'Full', tone: 'neutral' }
    : startingSoon
      ? { label: 'Starting soon', tone: 'accent' }
      : spotsLeft <= LOW_SPOTS_THRESHOLD
        ? { label: `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`, tone: 'accent' }
        : { label: 'Open', tone: 'success' };

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.imageWrap}>
          <MountainScene height={140} rounded={false} category={adventure.category} />
          {isHosting && <Badge label="You're hosting" tone="hosting" style={styles.hostingBadge} />}
          <View style={styles.imageActions}>
            <Pressable style={styles.imageActionBtn} onPress={onToggleLike} hitSlop={8}>
              <Ionicons
                name={adventure.likedByMe ? 'heart' : 'heart-outline'}
                size={iconSize.inline}
                color={adventure.likedByMe ? colors.accent : colors.textPrimary}
              />
            </Pressable>
            <Pressable style={styles.imageActionBtn} hitSlop={8}>
              <Ionicons name="share-outline" size={iconSize.inline} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Badge label={statusBadge.label} tone={statusBadge.tone} style={styles.statusBadge} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {adventure.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {adventure.location}
            </Text>
          </View>
          <Text style={styles.metaText}>
            {adventure.dateLabel}
            {adventure.meetingTime ? ` · ${adventure.meetingTime}` : ''}
          </Text>
          <Text style={styles.metaText}>
            {adventure.difficulty} · {adventure.socialLevel} · {goingIds.length} going
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.price}>{adventure.priceKsh > 0 ? `KSh ${adventure.priceKsh.toLocaleString()}` : 'Free'}</Text>
            <Text style={styles.spots}>
              {adventure.spotsFilled}/{adventure.spotsTotal} spots
            </Text>
          </View>
          {organizer && (
            <View style={styles.socialRow}>
              <View style={styles.avatarStack}>
                {goingIds.slice(0, AVATAR_STACK_MAX).map((uid, i) => {
                  const person = users[uid];
                  if (!person) return null;
                  return (
                    <View key={uid} style={[styles.avatarWrap, { marginLeft: i === 0 ? 0 : -10, zIndex: AVATAR_STACK_MAX - i }]}>
                      <Avatar initials={person.initials} hue={person.avatarHue} size={26} />
                    </View>
                  );
                })}
                {goingIds.length > AVATAR_STACK_MAX && (
                  <View style={[styles.avatarWrap, styles.avatarOverflow, { marginLeft: -10 }]}>
                    <Text style={styles.avatarOverflowText}>+{goingIds.length - AVATAR_STACK_MAX}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.organizerText} numberOfLines={1}>
                Hosted by {organizer.name.split(' ')[0]}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
  },
  hostingBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  statusBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
  },
  imageActions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    gap: 2,
  },
  title: {
    ...type.cardTitle,
    marginBottom: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...type.secondary, color: colors.textSecondary },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: { ...type.bodyEmphasis, color: colors.primary },
  spots: { ...type.secondary, color: colors.textSecondary },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { borderRadius: 999, borderWidth: 2, borderColor: colors.surface },
  avatarOverflow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverflowText: { ...type.caption, fontSize: 10, fontWeight: '700', color: colors.textSecondary },
  organizerText: { ...type.caption, color: colors.textMuted, flex: 1 },
});
