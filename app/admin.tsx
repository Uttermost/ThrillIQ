import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState, InlineError } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelativeTime } from '@/lib/relativeTime';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { AuditLogEntry, Report } from '@/lib/types';

type Status = 'loading' | 'ready' | 'error';

export default function Admin() {
  const { me, users, fetchOtherProfile, fetchOpenReports, resolveReport, fetchAuditLog } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [reportList, logList] = await Promise.all([fetchOpenReports(), fetchAuditLog()]);
      setReports(reportList);
      setAuditLog(logList);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [fetchOpenReports, fetchAuditLog]);

  useEffect(() => {
    if (me.isAdmin) load();
  }, [me.isAdmin, load]);

  useEffect(() => {
    [...reports.map((r) => r.reporterId), ...auditLog.map((a) => a.actorId)].forEach((uid) => {
      if (!users[uid]) fetchOtherProfile(uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, auditLog]);

  const handleResolve = async (report: Report, status: 'resolved' | 'dismissed') => {
    setBusyId(report.id);
    try {
      await resolveReport(report, status);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setAuditLog((prev) => [
        {
          id: `local-${Date.now()}`,
          actorId: me.id,
          action: status === 'dismissed' ? 'Dismissed report' : 'Resolved report',
          targetType: report.targetType,
          targetId: report.targetId,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    } catch {
      // Best-effort: the report just stays in the open list on failure.
    } finally {
      setBusyId(null);
    }
  };

  if (!me.isAdmin) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Admin" />
        <Text style={styles.notFound}>This screen isn't available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Admin" />
      <ScrollView contentContainerStyle={styles.content}>
        {status === 'loading' && (
          <View style={{ gap: spacing.md }}>
            <Skeleton style={{ height: 90 }} />
            <Skeleton style={{ height: 90 }} />
          </View>
        )}

        {status === 'error' && <InlineError message="Couldn't load the queue." retryLabel="Retry" onRetry={load} />}

        {status === 'ready' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Open reports</Text>
              {reports.length === 0 ? (
                <EmptyState icon="shield-checkmark-outline" title="Nothing to review" message="No open reports right now." />
              ) : (
                reports.map((r) => {
                  const reporter = users[r.reporterId];
                  // Comments have no page of their own — contextId (the
                  // post they belong to) is where admin can actually see
                  // one in place; every other target type is navigable
                  // from targetId alone.
                  const targetHref =
                    r.targetType === 'user'
                      ? `/profile/${r.targetId}`
                      : r.targetType === 'post'
                        ? `/post/${r.targetId}`
                        : r.targetType === 'comment'
                          ? (r.contextId ? `/post/${r.contextId}` : null)
                          : `/adventure/${r.targetId}`;
                  return (
                    <View key={r.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Badge label={r.reason} tone="accent" />
                        <Text style={styles.cardDate}>{formatRelativeTime(r.createdAt)}</Text>
                      </View>
                      <Pressable onPress={() => targetHref && router.push(targetHref)} disabled={!targetHref}>
                        <Text style={styles.cardTarget}>
                          Reported {r.targetType}: {r.targetId}
                        </Text>
                      </Pressable>
                      <Text style={styles.cardMeta}>Filed by {reporter?.name ?? r.reporterId}</Text>
                      {!!r.details && <Text style={styles.cardDetails}>{r.details}</Text>}
                      <View style={styles.actionsRow}>
                        <Button
                          label="Resolve"
                          onPress={() => handleResolve(r, 'resolved')}
                          loading={busyId === r.id}
                          style={styles.actionBtn}
                        />
                        <Button
                          label="Dismiss"
                          variant="secondary"
                          onPress={() => handleResolve(r, 'dismissed')}
                          loading={busyId === r.id}
                          style={styles.actionBtn}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              {auditLog.length === 0 ? (
                <Text style={styles.cardMeta}>No moderation actions yet.</Text>
              ) : (
                auditLog.map((a) => (
                  <View key={a.id} style={styles.logRow}>
                    <Text style={styles.logText}>
                      {users[a.actorId]?.name ?? a.actorId} · {a.action} ({a.targetType} {a.targetId})
                    </Text>
                    <Text style={styles.cardDate}>{formatRelativeTime(a.createdAt)}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  notFound: { ...type.body, padding: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.sectionHeading },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { ...type.caption, color: colors.textMuted },
  cardTarget: { ...type.bodyEmphasis, color: colors.primary },
  cardMeta: { ...type.secondary, color: colors.textSecondary },
  cardDetails: { ...type.secondary },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: { flex: 1 },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  logText: { ...type.secondary, flex: 1, marginRight: spacing.sm },
});
