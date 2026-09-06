import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MountainScene } from '@/components/ui/MountainScene';
import { useApp } from '@/lib/store';
import { colors, spacing, typography } from '@/lib/theme';
import { Adventure } from '@/lib/types';

interface AdventureCardProps {
  adventure: Adventure;
  onPress: () => void;
  onToggleLike?: () => void;
}

export function AdventureCard({ adventure, onPress, onToggleLike }: AdventureCardProps) {
  const { myId } = useApp();
  const isHosting = adventure.organizerId === myId;
  const isFull = adventure.spotsFilled >= adventure.spotsTotal;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.imageWrap}>
          <MountainScene height={110} rounded={false} />
          {isHosting && <Badge label="You're hosting" tone="hosting" style={styles.hostingBadge} />}
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{adventure.title}</Text>
          <Text style={styles.meta}>
            {adventure.dateLabel} · {adventure.difficulty} · ~KSh {adventure.priceKsh.toLocaleString()} ·{' '}
            {adventure.spotsFilled}/{adventure.spotsTotal} spots{isFull ? ' · Full' : ''}
          </Text>
          <View style={styles.footer}>
            <Pressable style={styles.likeRow} onPress={onToggleLike} hitSlop={8}>
              <Ionicons
                name={adventure.likedByMe ? 'heart' : 'heart-outline'}
                size={18}
                color={adventure.likedByMe ? colors.accent : colors.textMuted}
              />
              <Text style={styles.likeCount}>{adventure.likeCount}</Text>
            </Pressable>
            <View style={styles.likeRow}>
              <Ionicons name="share-outline" size={18} color={colors.textMuted} />
              <Text style={styles.shareLabel}>Share</Text>
            </View>
          </View>
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
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
  },
  meta: {
    ...typography.caption,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  likeCount: {
    ...typography.caption,
  },
  shareLabel: {
    ...typography.caption,
  },
});
