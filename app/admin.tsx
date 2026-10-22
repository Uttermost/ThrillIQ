import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmPanel } from '@/components/ui/ConfirmPanel';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState, InlineError } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelativeTime } from '@/lib/relativeTime';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { AuditLogEntry, Report } from '@/lib/types';

type Status = 'loading' | 'ready' | 'error';

export default function Admin() {
  const { me, users, fetchOtherProfile, fetchOpenReports, resolveReport, fetchAuditLog, deletePost, deleteComment } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Deletes the reported content itself, then resolves the report — the
  // two-step "Resolve"/"Dismiss" above just marks a report reviewed, this
  // is the one that actually removes what was reported. Only posts and
  // comments have a delete action wired up (see deletePost/deleteComment
  // in lib/store.tsx); adventure/user/review reports still only resolve.
  const handleDeleteContent = async (report: Report) => {
    setBusyId(report.id);
    setDeleteError(null);
    try {
      if (report.targetType === 'post') {
        await deletePost(report.targetId);
      } else if (report.targetType === 'comment' && report.contextId) {
        await deleteComment(report.contextId, report.targetId);
      }
    } catch (e) {
      // The content itself failed to delete — nothing happened, so this is
      // the one case that should actually block and let admin retry.
      setDeleteError(e instanceof Error ? e.message : 'Something went wrong.');
      setBusyId(null);
      return;
    }
    // The content is gone by this point — resolving the report is just
    // bookkeeping on top of that. Treating a failure here as the whole
    // action failing would invite admin to hit "Delete" again on content
    // that's already deleted: deleteComment's batch would decrement the
    // post's commentCount a second time, since deletePostCommentReal has
    // no way to know the comment was already gone.
    try {
      await resolveReport(report, 'resolved');
    } catch {
      // Best-effort — the content is deleted either way.
    }
    setReports((prev) => prev.filter((r) => r.id !== report.id));
    setConfirmingDeleteId(null);
    setAuditLog((prev) => [
      {
        id: `local-${Date.now()}`,
        actorId: me.id,
        action: `Deleted reported ${report.targetType}`,
        targetType: report.targetType,
        targetId: report.targetId,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setBusyId(null);
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
                      {confirmingDeleteId === r.id ? (
                        <ConfirmPanel
                          message={deleteError ?? `This deletes the reported ${r.targetType} and can't be undone.`}
                          confirmLabel={`Delete ${r.targetType}`}
                          cancelLabel="Keep it"
                          loading={busyId === r.id}
                          onConfirm={() => handleDeleteContent(r)}
                          onCancel={() => {
                            setConfirmingDeleteId(null);
                            setDeleteError(null);
                          }}
                        />
                      ) : (
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
                          {(r.targetType === 'post' || r.targetType === 'comment') && (
                            <Button
                              label="Delete"
                              accessibilityLabel={`Delete reported ${r.targetType}`}
                              variant="danger"
                              onPress={() => setConfirmingDeleteId(r.id)}
                              disabled={busyId === r.id}
                              style={styles.actionBtn}
                            />
                          )}
                        </View>
                      )}
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
