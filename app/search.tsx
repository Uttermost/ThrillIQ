import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type, typography } from '@/lib/theme';
import { Adventure, Crew, Post } from '@/lib/types';

const RESULTS_PER_SECTION = 5;

function matches(query: string, ...fields: (string | undefined | null)[]): boolean {
  return fields.some((f) => !!f && f.toLowerCase().includes(query));
}

export default function Search() {
  const { myId, adventures, crews, posts } = useApp();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  // Adventures, crews and posts are all publicly loaded client-side already
  // (same collections Discover/Feed/crews already use) — this is a real
  // search over that real data, not a mock. People are deliberately not
  // included: there's no directory query available (firestore.rules denies
  // `list` on /users on purpose — see its own comment — so only users
  // already encountered through an adventure/crew/post are known
  // client-side at all, and a "search" that silently only covers those
  // would misrepresent itself as a full people search).
  const matchedAdventures = useMemo<Adventure[]>(() => {
    if (!q) return [];
    return adventures.filter((a) => matches(q, a.title, a.location, a.description, a.category)).slice(0, RESULTS_PER_SECTION);
  }, [adventures, q]);

  const matchedCrews = useMemo<Crew[]>(() => {
    if (!q) return [];
    return crews.filter((c) => matches(q, c.name, c.description)).slice(0, RESULTS_PER_SECTION);
  }, [crews, q]);

  const matchedPosts = useMemo<Post[]>(() => {
    if (!q) return [];
    return posts.filter((p) => matches(q, p.text)).slice(0, RESULTS_PER_SECTION);
  }, [posts, q]);

  const hasAnyResults = matchedAdventures.length > 0 || matchedCrews.length > 0 || matchedPosts.length > 0;

  const openAdventure = (a: Adventure) => {
    router.push(a.organizerId === myId ? `/organizer/${a.id}` : `/adventure/${a.id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Search" />
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search adventures, crews and posts"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoFocus
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!q && (
          <EmptyState icon="search-outline" title="Search ThrillIQ" message="Find adventures, crews and posts by keyword." />
        )}

        {!!q && !hasAnyResults && (
          <EmptyState icon="search-outline" title="No results" message={`Nothing matched "${query.trim()}".`} />
        )}

        {matchedAdventures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adventures</Text>
            {matchedAdventures.map((a) => (
              <Pressable key={a.id} style={styles.row} onPress={() => openAdventure(a)}>
                <View style={styles.rowIcon}>
                  <Ionicons name="compass-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {a.title}
                  </Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {a.location} · {a.category}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {matchedCrews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crews</Text>
            {matchedCrews.map((c) => (
              <Pressable key={c.id} style={styles.row} onPress={() => router.push(`/crew/${c.id}`)}>
                <View style={styles.rowIcon}>
                  <Ionicons name="people-outline" size={18} color={colors.hosting} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {c.memberIds.length} member{c.memberIds.length === 1 ? '' : 's'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {matchedPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posts</Text>
            {matchedPosts.map((p) => (
              <Pressable key={p.id} style={styles.row} onPress={() => router.push(`/post/${p.id}`)}>
                <View style={styles.rowIcon}>
                  <Ionicons name="chatbubbles-outline" size={18} color={colors.accent} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {p.text}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!!q && <Text style={styles.footnote}>Looking for a person? Find them from a shared adventure, crew or post.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    height: 50,
  },
  searchInput: { flex: 1, ...type.input, color: colors.textPrimary },
  content: { padding: spacing.lg, paddingTop: 0, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.caption, fontWeight: '700', color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: { ...type.bodyEmphasis },
  rowSubtitle: { ...type.secondary, color: colors.textSecondary },
  footnote: { ...type.secondary, color: colors.textMuted, textAlign: 'center' },
});
