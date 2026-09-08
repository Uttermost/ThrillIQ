'use client';

import { useCallback, useEffect, useState } from 'react';

import AdminShell from '@/components/AdminShell';
import StatTile from '@/components/StatTile';
import { fetchUsageSnapshot, type UsageSnapshot } from '@/lib/usage';

type Status = 'loading' | 'ready' | 'error';

const LABELS: Record<keyof UsageSnapshot['totals'], string> = {
  adventures: 'Adventures',
  crews: 'Crews',
  posts: 'Posts',
  postComments: 'Comments',
  reposts: 'Reposts',
  reviews: 'Reviews',
};

export default function UsagePage() {
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setSnapshot(await fetchUsageSnapshot());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold">Usage</h1>
      <p className="mt-1 text-sm text-textMuted">Content volume across the app, as of this page load.</p>

      {status === 'loading' && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-surfaceMuted" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 rounded-lg border border-danger/40 bg-surface p-4 text-sm">
          Couldn&apos;t load usage data.{' '}
          <button onClick={load} className="text-primary hover:underline">
            Retry
          </button>
        </div>
      )}

      {status === 'ready' && snapshot && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(Object.keys(LABELS) as (keyof UsageSnapshot['totals'])[]).map((key) => (
              <StatTile
                key={key}
                label={LABELS[key]}
                value={snapshot.totals[key]}
                delta={`+${snapshot.newThisWeek[key].toLocaleString()} this week`}
              />
            ))}
          </div>

          <h2 className="mt-8 text-sm font-medium text-textMuted">Reports</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="text-xs text-textMuted">Open</div>
              <div className="mt-1 text-2xl font-semibold text-warning">{snapshot.reportsByStatus.open.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="text-xs text-textMuted">Resolved</div>
              <div className="mt-1 text-2xl font-semibold text-good">{snapshot.reportsByStatus.resolved.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="text-xs text-textMuted">Dismissed</div>
              <div className="mt-1 text-2xl font-semibold text-textMuted">{snapshot.reportsByStatus.dismissed.toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm">
            <span className="font-medium">{snapshot.auditActionsThisWeek.toLocaleString()}</span>{' '}
            <span className="text-textMuted">moderation action{snapshot.auditActionsThisWeek === 1 ? '' : 's'} logged this week.</span>
          </div>

          <p className="mt-8 text-xs text-textMuted">
            Registered-user count isn&apos;t shown — <code className="rounded bg-surfaceMuted px-1 py-0.5">firestore.rules</code> has no{' '}
            <code className="rounded bg-surfaceMuted px-1 py-0.5">list</code> rule on <code className="rounded bg-surfaceMuted px-1 py-0.5">users</code>{' '}
            (deliberately — see the rules file), so there&apos;s no query this panel can run to count them without changing that rule.
          </p>
        </>
      )}
    </AdminShell>
  );
}
