import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { InlineError } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { ConnectPermission, DEFAULT_PRIVACY, MessagePermission, ProfileVisibility } from '@/lib/types';

const PROFILE_OPTIONS: ProfileVisibility[] = ['Everyone', 'Connections', 'Participants'];
const CONNECT_OPTIONS: ConnectPermission[] = ['Everyone', 'Participants', 'Nobody'];
const MESSAGE_OPTIONS: MessagePermission[] = ['Connections', 'Participants', 'Nobody'];

export default function PrivacySettings() {
  const { me, updateProfile } = useApp();
  const privacy = me.privacy ?? DEFAULT_PRIVACY;

  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility[]>([privacy.profileVisibility]);
  const [showLocation, setShowLocation] = useState(privacy.locationVisibility !== 'Hidden');
  const [whoCanConnect, setWhoCanConnect] = useState<ConnectPermission[]>([privacy.whoCanConnect]);
  const [showCompleted, setShowCompleted] = useState(privacy.showCompletedAdventures);
  const [showCrews, setShowCrews] = useState(privacy.showCrews);
  const [showConnections, setShowConnections] = useState(privacy.showConnections);
  const [whoCanMessage, setWhoCanMessage] = useState<MessagePermission[]>([privacy.whoCanMessage]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        privacy: {
          profileVisibility: profileVisibility[0] ?? 'Everyone',
          locationVisibility: showLocation ? 'City' : 'Hidden',
          whoCanConnect: whoCanConnect[0] ?? 'Everyone',
          showCompletedAdventures: showCompleted,
          showCrews,
          showConnections,
          whoCanMessage: whoCanMessage[0] ?? 'Participants',
        },
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Privacy" />
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Profile">
          <ChipGroup label="Who can see my profile?" options={PROFILE_OPTIONS} selected={profileVisibility} onChange={setProfileVisibility} multi={false} />
          {profileVisibility[0] !== 'Everyone' && (
            <Text style={styles.warning}>
              "Connections" and "Participants" aren't verifiable yet (no connections system exists) — your profile will only be
              visible to you until that's built.
            </Text>
          )}
        </Section>

        <Section title="Location">
          <Row label="Show my location" value={showLocation} onValueChange={setShowLocation} />
          <Text style={styles.hint}>Only ever your city or area — ThrillIQ never collects or shows an exact address.</Text>
        </Section>

        <Section title="Social">
          <ChipGroup label="Who can send me connection requests?" options={CONNECT_OPTIONS} selected={whoCanConnect} onChange={setWhoCanConnect} multi={false} />
        </Section>

        <Section title="Adventure activity">
          <Row label="Show completed adventures" value={showCompleted} onValueChange={setShowCompleted} />
          <Row label="Show crews" value={showCrews} onValueChange={setShowCrews} />
          <Row label="Show connections" value={showConnections} onValueChange={setShowConnections} />
        </Section>

        <Section title="Messaging">
          <ChipGroup label="Who can message me?" options={MESSAGE_OPTIONS} selected={whoCanMessage} onChange={setWhoCanMessage} multi={false} />
        </Section>

        <Button label="Save changes" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
        {error && <InlineError message={error} onRetry={handleSave} />}
        {saved && !error && <Text style={styles.savedText}>✓ Privacy settings updated.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: { ...typography.subheading, fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { ...typography.body, flex: 1 },
  hint: { ...typography.small },
  warning: { ...typography.small, color: colors.hosting },
  savedText: { color: colors.success, textAlign: 'center', fontWeight: '600' },
});
