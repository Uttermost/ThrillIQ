import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { sharePost } from '@/lib/share';
import { useApp } from '@/lib/store';
import { colors, CONTENT_MAX_WIDTH, radius, spacing, type } from '@/lib/theme';
import { Post } from '@/lib/types';

interface SharePostSheetProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
  // Called once a share actually completes, however it completed — external
  // sheet, clipboard fallback, or sent into a thread — so the caller can
  // record it exactly once, the same contract PostCard already relies on.
  onShared: () => void;
}

// Who a post could be sent to: everyone already in a thread with me, plus
// accepted connections I haven't messaged yet. Threads aren't gated by
// Connection status in this app (see adventure/[id].tsx's message-organizer
// flow), so an existing thread always counts regardless of connection state.
function useSharablePeople(myId: string, enabled: boolean) {
  const { threads, fetchConnectionsFor } = useApp();
  const [connectionIds, setConnectionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchConnectionsFor(myId).then((list) => {
      if (cancelled) return;
      const accepted = list.filter((c) => c.status === 'accepted').map((c) => c.participantIds.find((id) => id !== myId) as string);
      setConnectionIds(accepted);
    });
    return () => {
      cancelled = true;
    };
  }, [myId, fetchConnectionsFor, enabled]);

  return useMemo(() => {
    const seen = new Set<string>();
    const people: { uid: string; threadId: string | null }[] = [];
    threads.forEach((t) => {
      if (seen.has(t.otherUserId)) return;
      seen.add(t.otherUserId);
      people.push({ uid: t.otherUserId, threadId: t.id });
    });
    connectionIds.forEach((uid) => {
      if (seen.has(uid)) return;
      seen.add(uid);
      people.push({ uid, threadId: null });
    });
    return people;
  }, [threads, connectionIds]);
}

export function SharePostSheet({ visible, onClose, post, onShared }: SharePostSheetProps) {
  const { myId, authenticated, users, fetchOtherProfile, ensureThreadForAdventure, sendMessage } = useApp();
  const { width } = useWindowDimensions();
  const isWide = width > CONTENT_MAX_WIDTH;
  const people = useSharablePeople(myId, authenticated);
  const [caption, setCaption] = useState('');
  const [sharingExternally, setSharingExternally] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    people.forEach((p) => {
      if (!users[p.uid]) fetchOtherProfile(p.uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people.map((p) => p.uid).join(',')]);

  const handleClose = () => {
    setCaption('');
    onClose();
  };

  const handleShareExternally = async () => {
    setSharingExternally(true);
    try {
      const completed = await sharePost(post);
      if (completed) {
        onShared();
        handleClose();
      }
    } finally {
      setSharingExternally(false);
    }
  };

  const handleSendTo = async (person: { uid: string; threadId: string | null }) => {
    setSendingTo(person.uid);
    try {
      const threadId = person.threadId ?? ensureThreadForAdventure(`direct-${person.uid}`, person.uid);
      await sendMessage(threadId, caption.trim(), post.id);
      onShared();
      handleClose();
      router.push(`/chat/${threadId}`);
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.sheet, isWide && styles.sheetCentered]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Share post</Text>

        <Pressable style={styles.externalRow} onPress={handleShareExternally} disabled={sharingExternally}>
          <View style={styles.externalIcon}>
            {sharingExternally ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="share-outline" size={18} color={colors.primary} />}
          </View>
          <Text style={styles.externalLabel}>Share externally</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Send to a conversation</Text>
        {!authenticated ? (
          <Pressable
            onPress={() => {
              handleClose();
              router.push('/auth');
            }}>
            <Text style={styles.signInLink}>Sign in to send this in a message →</Text>
          </Pressable>
        ) : (
          <>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a message (optional)"
              placeholderTextColor={colors.textMuted}
              style={styles.captionInput}
              maxLength={300}
            />

            {people.length === 0 ? (
              <Text style={styles.emptyText}>Message someone from their profile first — they'll show up here to share posts with.</Text>
            ) : (
              <ScrollView style={styles.peopleList} keyboardShouldPersistTaps="handled">
                {people.map((p) => {
                  const person = users[p.uid];
                  return (
                    <Pressable key={p.uid} style={styles.personRow} onPress={() => handleSendTo(p)} disabled={sendingTo !== null}>
                      <Avatar initials={person?.initials ?? '?'} hue={person?.avatarHue ?? 200} size={36} />
                      <Text style={styles.personName}>{person?.name ?? 'Someone'}</Text>
                      {sendingTo === p.uid && <ActivityIndicator size="small" color={colors.primary} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </>
        )}
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
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetCentered: {
    left: undefined,
    right: undefined,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center' },
  title: { ...type.sectionHeading },
  externalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  externalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalLabel: { ...type.bodyEmphasis, color: colors.primary },
  sectionLabel: { ...type.inputLabel, color: colors.textSecondary, marginTop: spacing.xs },
  captionInput: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...type.body,
    color: colors.textPrimary,
  },
  emptyText: { ...type.secondary, color: colors.textMuted },
  signInLink: { ...type.bodyEmphasis, color: colors.primary },
  peopleList: { maxHeight: 280 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  personName: { ...type.body, flex: 1 },
});
