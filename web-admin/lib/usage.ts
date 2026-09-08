import { collection, getCountFromServer, query, where } from 'firebase/firestore';

import { db } from './firebase';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Aggregate count queries — server-side counts, no documents transferred.
// Only covers collections firestore.rules makes publicly (or admin-)
// readable at the collection level; `users` has no `list` rule (see the
// rules file's own comment on why — no legitimate reason to enumerate every
// profile), so a total registered-user count isn't obtainable this way.
const COLLECTIONS = ['adventures', 'crews', 'posts', 'postComments', 'reposts', 'reviews'] as const;
type CountedCollection = (typeof COLLECTIONS)[number];

export interface UsageSnapshot {
  totals: Record<CountedCollection, number>;
  newThisWeek: Record<CountedCollection, number>;
  reportsByStatus: { open: number; resolved: number; dismissed: number };
  auditActionsThisWeek: number;
}

async function count(q: ReturnType<typeof query> | ReturnType<typeof collection>): Promise<number> {
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function fetchUsageSnapshot(): Promise<UsageSnapshot> {
  const since = Date.now() - WEEK_MS;

  const [totals, newThisWeek, reportsByStatus, auditActionsThisWeek] = await Promise.all([
    Promise.all(COLLECTIONS.map((name) => count(collection(db, name)))).then((values) =>
      Object.fromEntries(COLLECTIONS.map((name, i) => [name, values[i]])) as Record<CountedCollection, number>
    ),
    Promise.all(COLLECTIONS.map((name) => count(query(collection(db, name), where('createdAt', '>=', since))))).then((values) =>
      Object.fromEntries(COLLECTIONS.map((name, i) => [name, values[i]])) as Record<CountedCollection, number>
    ),
    Promise.all(
      (['open', 'resolved', 'dismissed'] as const).map((status) => count(query(collection(db, 'reports'), where('status', '==', status))))
    ).then(([open, resolved, dismissed]) => ({ open, resolved, dismissed })),
    count(query(collection(db, 'auditLog'), where('createdAt', '>=', since))),
  ]);

  return { totals, newThisWeek, reportsByStatus, auditActionsThisWeek };
}
