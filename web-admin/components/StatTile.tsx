export default function StatTile({ label, value, delta }: { label: string; value: number; delta?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs text-textMuted">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value.toLocaleString()}</div>
      {delta && <div className="mt-1 text-xs text-textMuted">{delta}</div>}
    </div>
  );
}
