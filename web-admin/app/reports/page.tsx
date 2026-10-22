'use client';

import { useCallback, useEffect, useState } from 'react';

import AdminShell from '@/components/AdminShell';
import ReportCard from '@/components/ReportCard';
import { useAuth } from '@/lib/auth';
import { deleteReportedContent, fetchOpenReports, resolveReport } from '@/lib/reports';
import type { Report } from '@/lib/types';
import { fetchUser } from '@/lib/users';

type Status = 'loading' | 'ready' | 'error';

export default function ReportsPage() {
  const { firebaseUser } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [reporterNames, setReporterNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await fetchOpenReports();
      setReports(list);
      setStatus('ready');

      const uniqueReporterIds = Array.from(new Set(list.map((r) => r.reporterId)));
      const entries = await Promise.all(
        uniqueReporterIds.map(async (uid) => [uid, (await fetchUser(uid))?.name ?? uid] as const)
      );
      setReporterNames(Object.fromEntries(entries));
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (report: Report, next: 'resolved' | 'dismissed') => {
    if (!firebaseUser) return;
    setBusyId(report.id);
    try {
      await resolveReport(report, next, firebaseUser.uid);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (report: Report) => {
    if (!firebaseUser) return;
    setBusyId(report.id);
    setDeleteError(null);
    try {
      await deleteReportedContent(report, firebaseUser.uid);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold">Open reports</h1>
      <p className="mt-1 text-sm text-textMuted">Reported posts, comments, adventures, users, and reviews awaiting review.</p>

      <div className="mt-6 flex flex-col gap-3">
        {status === 'loading' && (
          <>
            <div className="h-24 animate-pulse rounded-lg bg-surfaceMuted" />
            <div className="h-24 animate-pulse rounded-lg bg-surfaceMuted" />
          </>
        )}

        {status === 'error' && (
          <div className="rounded-lg border border-danger/40 bg-surface p-4 text-sm">
            Couldn&apos;t load the queue.{' '}
            <button onClick={load} className="text-primary hover:underline">
              Retry
            </button>
          </div>
        )}

        {status === 'ready' && reports.length === 0 && (
          <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-textMuted">
            Nothing to review — no open reports right now.
          </div>
        )}

        {status === 'ready' &&
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              reporterName={reporterNames[report.reporterId] ?? report.reporterId}
              busy={busyId === report.id}
              onResolve={() => handleResolve(report, 'resolved')}
              onDismiss={() => handleResolve(report, 'dismissed')}
              onDelete={() => handleDelete(report)}
              deleteError={busyId === report.id ? deleteError : null}
            />
          ))}
      </div>
    </AdminShell>
  );
}
