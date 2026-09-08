'use client';

import { useState } from 'react';

import Badge from '@/components/Badge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatRelativeTime } from '@/lib/relativeTime';
import type { Report } from '@/lib/types';

export default function ReportCard({
  report,
  reporterName,
  busy,
  onResolve,
  onDismiss,
  onDelete,
  deleteError,
}: {
  report: Report;
  reporterName: string;
  busy: boolean;
  onResolve: () => void;
  onDismiss: () => void;
  onDelete: () => void;
  deleteError: string | null;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const canDelete = report.targetType === 'post' || report.targetType === 'comment';

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <Badge label={report.reason} tone="accent" />
        <span className="text-xs text-textMuted">{formatRelativeTime(report.createdAt)}</span>
      </div>
      <p className="mt-2 font-medium text-primary">
        Reported {report.targetType}: <span className="font-mono text-sm">{report.targetId}</span>
      </p>
      <p className="mt-1 text-sm text-textMuted">Filed by {reporterName}</p>
      {report.details && <p className="mt-2 text-sm">{report.details}</p>}

      {confirmingDelete ? (
        <ConfirmDialog
          message={deleteError ?? `This deletes the reported ${report.targetType} and can't be undone.`}
          confirmLabel={`Delete ${report.targetType}`}
          cancelLabel="Keep it"
          loading={busy}
          onConfirm={onDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onResolve}
            disabled={busy}
            className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Resolve
          </button>
          <button
            onClick={onDismiss}
            disabled={busy}
            className="flex-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-textMuted transition hover:text-white disabled:opacity-50"
          >
            Dismiss
          </button>
          {canDelete && (
            <button
              onClick={() => setConfirmingDelete(true)}
              disabled={busy}
              className="flex-1 rounded-md border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
