import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/lib/store';
import { colors, radius, spacing } from '@/lib/theme';

const UNKNOWN_USER = { id: '', name: 'Someone', initials: '?', role: '', location: '', avatarHue: 200 };

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { myId, threads, adventures, posts, users, sendMessage, retryMessage, markThreadRead, fetchOtherProfile } = useApp();
  const [draft, setDraft] = useState('');

  const thread = threads.find((t) => t.id === id);

  useEffect(() => {
    if (thread?.unread) markThreadRead(thread.id);
  }, [thread, markThreadRead]);

  useEffect(() => {
    thread?.messages.forEach((m) => {
      if (!m.sharedPostId) return;
      const sharedPost = posts.find((p) => p.id === m.sharedPostId);
      if (sharedPost && !users[sharedPost.authorId]) fetchOtherProfile(sharedPost.authorId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread?.messages.length, posts]);

  if (!thread) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Chat" />
      </SafeAreaView>
    );
  }

  const other = users[thread.otherUserId] ?? UNKNOWN_USER;
  const adventure = adventures.find((a) => a.id === thread.adventureId);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await sendMessage(thread.id, text);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={other.name} subtitle={adventure?.title} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          data={thread.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => {
            const mine = item.senderId === myId;
            const sharedPost = item.sharedPostId ? posts.find((p) => p.id === item.sharedPostId) : undefined;
            const sharedPostAuthor = sharedPost ? users[sharedPost.authorId] : undefined;
            return (
              <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                {!!item.text && (
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.text}</Text>
                  </View>
                )}
                {item.sharedPostId && (
                  <Pressable
                    style={[styles.sharedPostCard, mine ? styles.bubbleMine : styles.bubbleTheirs]}
                    onPress={() => router.push(`/post/${item.sharedPostId}`)}>
                    {sharedPost ? (
                      <>
                        <View style={styles.sharedPostHeader}>
                          <Ionicons name="chatbubbles-outline" size={13} color={mine ? colors.hosting : colors.textSecondary} />
                          <Text style={[styles.sharedPostAuthor, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]} numberOfLines={1}>
                            {sharedPostAuthor?.name ?? 'Someone'}'s post
                          </Text>
                        </View>
                        {!!sharedPost.photos?.[0] && <Image source={{ uri: sharedPost.photos[0] }} style={styles.sharedPostImage} />}
                        <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs} numberOfLines={3}>
                          {sharedPost.text}
                        </Text>
                      </>
                    ) : (
                      <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>This post is no longer available.</Text>
                    )}
                  </Pressable>
                )}
                {mine && item.status === 'failed' && (
                  <Pressable onPress={() => retryMessage(thread.id, item.id)} style={styles.failedRow}>
                    <Text style={styles.failedText}>Failed to send · Tap to retry</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={handleSend}
            accessibilityLabel="Send message"
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            disabled={!draft.trim()}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  messages: { padding: spacing.lg, gap: spacing.sm },
  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleTheirs: { backgroundColor: colors.surfaceMuted, borderTopLeftRadius: 4 },
  bubbleMine: { backgroundColor: colors.accentMuted, borderTopRightRadius: 4 },
  bubbleTextTheirs: { color: colors.textPrimary, fontSize: 14 },
  bubbleTextMine: { color: colors.hosting, fontSize: 14 },
  sharedPostCard: { maxWidth: '80%', borderRadius: radius.md, padding: spacing.md, gap: spacing.xs, marginTop: 4 },
  sharedPostHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sharedPostAuthor: { fontSize: 12, fontWeight: '700' },
  sharedPostImage: { width: '100%', height: 100, borderRadius: radius.sm },
  failedRow: { marginTop: 2 },
  failedText: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});
