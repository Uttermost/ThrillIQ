import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/StateViews';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/lib/store';
import { colors, spacing, typography } from '@/lib/theme';
import { AppNotification, NotificationType } from '@/lib/types';

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  adventure_cancelled: 'close-circle-outline',
  adventure_updated: 'create-outline',
  participant_joined: 'people-outline',
  new_message: 'chatbubble-outline',
  adventure_reminder: 'time-outline',
  review_prompt: 'star-outline',
  waitlist_spot_open: 'flash-outline',
};

function timeAgo(ts: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const openNotification = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (!n.deepLink) return;
    if (n.deepLink.screen === 'adventure') router.push(`/adventure/${n.deepLink.id}`);
    else if (n.deepLink.screen === 'organizer') router.push(`/organizer/${n.deepLink.id}`);
    else if (n.deepLink.screen === 'chat') router.push(`/chat/${n.deepLink.id}`);
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Notifications"
        onEdit={hasUnread ? markAllNotificationsRead : undefined}
        actionIcon="checkmark-done"
        actionLabel="Mark all as read"
      />
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No notifications" message="Adventure updates and messages will show up here." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={[styles.row, !item.read && styles.rowUnread]} onPress={() => openNotification(item)}>
              <Ionicons name={ICONS[item.type]} size={22} color={item.read ? colors.textMuted : colors.accent} />
              <View style={styles.rowBody}>
                <Text style={[styles.title, !item.read && styles.titleUnread]}>{item.title}</Text>
                <Text style={styles.body} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowUnread: { backgroundColor: colors.accentMuted },
  rowBody: { flex: 1 },
  title: { ...typography.subheading, fontSize: 15 },
  titleUnread: { fontWeight: '700' },
  body: { ...typography.caption, marginTop: 2 },
  time: { ...typography.small, marginTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: spacing.xs },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 22 + spacing.md },
});
