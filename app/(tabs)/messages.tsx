import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, spacing, typography } from '@/lib/theme';

const UNKNOWN_USER = { id: '', name: 'Someone', initials: '?', role: '', location: '', avatarHue: 200 };

export default function Messages() {
  const { myId, threads, adventures, users, markThreadRead } = useApp();

  const sorted = [...threads].sort((a, b) => {
    const aLast = a.messages.at(-1)?.createdAt ?? 0;
    const bLast = b.messages.at(-1)?.createdAt ?? 0;
    return bLast - aLast;
  });

  const openThread = (threadId: string) => {
    markThreadRead(threadId);
    router.push(`/chat/${threadId}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>Messages</Text>

      {sorted.length === 0 ? (
        <EmptyState icon="chatbubble-outline" title="No messages yet" message="Threads with organizers and participants appear here." />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const other = users[item.otherUserId] ?? UNKNOWN_USER;
            const adventure = adventures.find((a) => a.id === item.adventureId);
            const lastMessage = item.messages.at(-1);
            const isHosting = adventure?.organizerId === myId;
            return (
              <Pressable style={styles.row} onPress={() => openThread(item.id)}>
                <Avatar initials={other.initials} hue={other.avatarHue} />
                <View style={styles.rowBody}>
                  <Text style={styles.name}>{other.name}</Text>
                  <Text style={styles.adventureLabel}>
                    {adventure?.title}
                    {isHosting ? ' · you\'re hosting' : ''}
                  </Text>
                  <Text style={[styles.preview, item.unread && styles.previewUnread]} numberOfLines={1}>
                    {lastMessage?.sharedPostId && !lastMessage.text ? 'Shared a post' : lastMessage?.text}
                  </Text>
                </View>
                {item.unread && <View style={styles.dot} />}
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  heading: { ...typography.title, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  list: { paddingTop: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowBody: { flex: 1 },
  name: { ...typography.subheading, fontSize: 15 },
  adventureLabel: { ...typography.small, marginTop: 1 },
  preview: { ...typography.caption, marginTop: 2 },
  previewUnread: { color: colors.textPrimary, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 40 + spacing.md },
});
