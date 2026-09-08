export default function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'accent' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        tone === 'accent' ? 'bg-primary/15 text-primary' : 'bg-surfaceMuted text-textMuted'
      }`}
    >
      {label}
    </span>
  );
}
