const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < HOUR_MS) return 'Just now';
  if (diff < DAY_MS) {
    const hours = Math.floor(diff / HOUR_MS);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  if (diff < WEEK_MS) {
    const days = Math.floor(diff / DAY_MS);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  if (diff < MONTH_MS) {
    const weeks = Math.floor(diff / WEEK_MS);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  const months = Math.floor(diff / MONTH_MS);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}
