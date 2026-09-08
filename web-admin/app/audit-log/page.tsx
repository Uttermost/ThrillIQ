'use client';

import { useCallback, useEffect, useState } from 'react';

import AdminShell from '@/components/AdminShell';
import { formatRelativeTime } from '@/lib/relativeTime';
import { fetchAuditLog } from '@/lib/auditLog';
import type { AuditLogEntry } from '@/lib/types';
import { fetchUser } from '@/lib/users';

type Status = 'loading' | 'ready' | 'error';

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [actorNames, setActorNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await fetchAuditLog();
      setEntries(list);
      setStatus('ready');

      const uniqueActorIds = Array.from(new Set(list.map((e) => e.actorId)));
      const resolved = await Promise.all(uniqueActorIds.map(async (uid) => [uid, (await fetchUser(uid))?.name ?? uid] as const));
      setActorNames(Object.fromEntries(resolved));
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminShell>
      <h1 className="text-xl font-semibold">Audit log</h1>
      <p className="mt-1 text-sm text-textMuted">The last 50 moderation actions, most recent first. Append-only.</p>

      <div className="mt-6 flex flex-col gap-2">
        {status === 'loading' && (
          <>
            <div className="h-12 animate-pulse rounded-md bg-surfaceMuted" />
            <div className="h-12 animate-pulse rounded-md bg-surfaceMuted" />
            <div className="h-12 animate-pulse rounded-md bg-surfaceMuted" />
          </>
        )}

        {status === 'error' && (
          <div className="rounded-lg border border-danger/40 bg-surface p-4 text-sm">
            Couldn&apos;t load the audit log.{' '}
            <button onClick={load} className="text-primary hover:underline">
              Retry
            </button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-textMuted">
            No moderation actions yet.
          </div>
        )}

        {status === 'ready' &&
          entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-md bg-surfaceMuted px-4 py-3 text-sm">
              <span>
                {actorNames[entry.actorId] ?? entry.actorId} · {entry.action} ({entry.targetType} {entry.targetId})
              </span>
              <span className="shrink-0 pl-3 text-xs text-textMuted">{formatRelativeTime(entry.createdAt)}</span>
            </div>
          ))}
      </div>
    </AdminShell>
  );
}
