export default function ConfirmDialog({
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  loading,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-2 rounded-md border border-danger/40 bg-danger/5 p-3">
      <p className="text-sm">{message}</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-textMuted transition hover:text-white disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
