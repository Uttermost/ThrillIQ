import { WhenBucket } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

// Representative timestamp for a bucket an organizer picked at creation time.
export function timestampForBucket(bucket: WhenBucket, now: number = Date.now()): number {
  switch (bucket) {
    case 'This week':
      return now + 3 * DAY_MS;
    case 'This month':
      return now + 15 * DAY_MS;
    case 'Later':
      return now + 45 * DAY_MS;
  }
}

// Re-derive the bucket an adventure falls into right now, for filtering.
export function bucketForTimestamp(dateTimestamp: number, now: number = Date.now()): WhenBucket {
  const daysAway = (dateTimestamp - now) / DAY_MS;
  if (daysAway <= 7) return 'This week';
  if (daysAway <= 30) return 'This month';
  return 'Later';
}

// Granular date-filter predicates — buildable now that adventures carry a
// real scheduledAt timestamp instead of a hand-picked bucket. All local-time
// (Date's own getFullYear/getMonth/getDate/getDay), not UTC — "today" should
// mean the organizer's/participant's own calendar day.
export function isSameDay(ts: number, otherTs: number): boolean {
  const a = new Date(ts);
  const b = new Date(otherTs);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isToday(ts: number, now: number = Date.now()): boolean {
  return isSameDay(ts, now);
}

export function isTomorrow(ts: number, now: number = Date.now()): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(ts, tomorrow.getTime());
}

// The nearest Saturday 00:00 through the following Monday 00:00 — if today
// is already Sat/Sun, that's this weekend; otherwise it's the upcoming one.
export function thisWeekendRange(now: number = Date.now()): { start: number; end: number } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay(); // 0 = Sun .. 6 = Sat
  if (day === 0) start.setDate(start.getDate() - 1);
  else if (day !== 6) start.setDate(start.getDate() + (6 - day));
  const end = new Date(start);
  end.setDate(start.getDate() + 2);
  return { start: start.getTime(), end: end.getTime() };
}

export function isThisWeekend(ts: number, now: number = Date.now()): boolean {
  const { start, end } = thisWeekendRange(now);
  return ts >= start && ts < end;
}

export function isThisWeek(ts: number, now: number = Date.now()): boolean {
  return ts >= now && ts - now <= 7 * DAY_MS;
}

export function isThisMonth(ts: number, now: number = Date.now()): boolean {
  const daysAway = (ts - now) / DAY_MS;
  return daysAway > 7 && daysAway <= 30;
}

export function isLater(ts: number, now: number = Date.now()): boolean {
  return ts - now > 30 * DAY_MS;
}
