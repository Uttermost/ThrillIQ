import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { Post } from '@/lib/types';

const POST_MAX = 500;

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function CrewDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { myId, me, authenticated, crews, users, posts, fetchOtherProfile, joinCrew, leaveCrew, createPost, toggleLikePost, recordShare } = useApp();
  const crew = crews.find((c) => c.id === id);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const crewPosts = useMemo(
    () => posts.filter((p) => p.crewId === id).sort((a, b) => b.createdAt - a.createdAt),
    [posts, id]
  );

  useEffect(() => {
    if (!crew) return;
    crew.memberIds.forEach((uid) => {
      if (!users[uid]) fetchOtherProfile(uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crew?.memberIds.join(',')]);

  if (!crew) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Crew" />
        <Text style={styles.notFound}>This crew no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const isMember = crew.memberIds.includes(myId);
  const owner = users[crew.ownerId];

  const handleToggle = async () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    setBusy(true);
    try {
      if (isMember) await leaveCrew(crew.id);
      else await joinCrew(crew.id);
    } catch {
      // Best-effort: the button just stays in its current state on failure.
    } finally {
      setBusy(false);
    }
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      await createPost({ text, photos, crewId: crew.id });
      setText('');
      setPhotos([]);
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = (post: Post) => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    toggleLikePost(post.id);
  };

  const handleShared = (post: Post) => {
    if (!authenticated) return;
    recordShare(post.id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={crew.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar initials={initialsFor(crew.name)} hue={crew.avatarHue} size={72} />
          <Text style={styles.name}>{crew.name}</Text>
          <Text style={styles.meta}>
            {crew.memberIds.length} member{crew.memberIds.length === 1 ? '' : 's'}
            {owner ? ` · Created by ${owner.name.split(' ')[0]}` : ''}
          </Text>
        </View>

        {!!crew.description && <Text style={styles.description}>{crew.description}</Text>}

        <Button
          label={isMember ? 'Leave crew' : 'Join crew'}
          variant={isMember ? 'secondary' : 'primary'}
          onPress={handleToggle}
          loading={busy}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          {crew.memberIds.map((uid) => {
            const person = users[uid];
            if (!person) return null;
            return (
              <Pressable key={uid} style={styles.memberRow} onPress={() => router.push(`/profile/${uid}`)}>
                <Avatar initials={person.initials} hue={person.avatarHue} size={40} />
                <Text style={styles.memberName}>{person.name}</Text>
                {uid === crew.ownerId && <Text style={styles.ownerBadge}>Owner</Text>}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {isMember && (
            <View style={styles.composer}>
              <View style={styles.composerRow}>
                <Avatar initials={me.initials} hue={me.avatarHue} size={36} />
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={`Share something with ${crew.name}…`}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={POST_MAX}
                  style={styles.composerInput}
                />
              </View>
              <PhotoPicker photos={photos} onChange={setPhotos} max={3} />
              {postError && <Text style={styles.errorHint}>{postError}</Text>}
              <Button label="Post" onPress={handlePost} disabled={!text.trim()} loading={posting} />
            </View>
          )}
          {crewPosts.length === 0 ? (
            <Text style={styles.emptyText}>No posts yet in this crew{isMember ? ' — be the first.' : '.'}</Text>
          ) : (
            <View style={{ gap: spacing.md }}>
              {crewPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onToggleLike={() => handleToggleLike(post)}
                  onShared={() => handleShared(post)}
                  hideCrewLink
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  notFound: { ...type.body, padding: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { alignItems: 'center', gap: spacing.xs },
  name: { ...type.screenHeading, marginTop: spacing.sm, textAlign: 'center' },
  meta: { ...type.secondary, color: colors.textSecondary },
  description: { ...type.body, textAlign: 'center' },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.sectionHeading },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  memberName: { ...type.body, flex: 1 },
  ownerBadge: { ...type.chip, color: colors.hosting },
  composer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  composerRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  composerInput: { flex: 1, ...type.body, color: colors.textPrimary, minHeight: 36, paddingTop: 8 },
  errorHint: { ...type.secondary, color: colors.danger },
  emptyText: { ...type.secondary, color: colors.textMuted },
});
