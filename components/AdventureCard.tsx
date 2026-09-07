import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MountainScene } from '@/components/ui/MountainScene';
import { useApp } from '@/lib/store';
import { colors, iconSize, spacing, type } from '@/lib/theme';
import { Adventure } from '@/lib/types';

interface AdventureCardProps {
  adventure: Adventure;
  onPress: () => void;
  onToggleLike?: () => void;
}

export function AdventureCard({ adventure, onPress, onToggleLike }: AdventureCardProps) {
  const { myId, users } = useApp();
  const isHosting = adventure.organizerId === myId;
  const isFull = adventure.spotsFilled >= adventure.spotsTotal;
  const organizer = users[adventure.organizerId];

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.imageWrap}>
          <MountainScene height={140} rounded={false} />
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
          {isFull && <Badge label="Full" tone="danger" style={styles.fullBadge} />}
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
            {adventure.difficulty} · {adventure.socialLevel}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.price}>{adventure.priceKsh > 0 ? `KSh ${adventure.priceKsh.toLocaleString()}` : 'Free'}</Text>
            <Text style={styles.spots}>
              {adventure.spotsFilled}/{adventure.spotsTotal} spots
            </Text>
          </View>
          {organizer && (
            <View style={styles.organizerRow}>
              <Text style={styles.organizerText}>Hosted by {organizer.name.split(' ')[0]}</Text>
              <View style={styles.likeCountRow}>
                <Ionicons name="heart" size={12} color={colors.textMuted} />
                <Text style={styles.likeCount}>{adventure.likeCount}</Text>
              </View>
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
  fullBadge: {
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
  price: { ...type.bodyEmphasis },
  spots: { ...type.secondary, color: colors.textSecondary },
  organizerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  organizerText: { ...type.caption, color: colors.textMuted },
  likeCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { ...type.caption, color: colors.textMuted },
});
