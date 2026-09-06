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
