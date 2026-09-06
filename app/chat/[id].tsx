import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ME_ID } from '@/lib/mockData';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, adventures, users, sendMessage, retryMessage, markThreadRead } = useApp();
  const [draft, setDraft] = useState('');

  const thread = threads.find((t) => t.id === id);

  useEffect(() => {
    if (thread?.unread) markThreadRead(thread.id);
  }, [thread, markThreadRead]);

  if (!thread) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Chat" />
      </SafeAreaView>
    );
  }

  const other = users[thread.otherUserId];
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
            const mine = item.senderId === ME_ID;
            return (
              <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.text}</Text>
                </View>
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
