import { doc, getDoc } from 'firebase/firestore';

import { db } from './firebase';
import type { User } from './types';

const cache = new Map<string, User | null>();

// Simple client-side memo — the reports queue and audit log both need
// display names for a handful of actor/reporter ids, and there's no `list`
// rule on /users to batch-fetch them (see firestore.rules), so this just
// avoids re-fetching the same uid across both views in one session.
export async function fetchUser(uid: string): Promise<User | null> {
  if (cache.has(uid)) return cache.get(uid)!;
  // firestore.rules' /users get rule has no admin bypass — a profile whose
  // privacy.profileVisibility isn't 'Everyone' denies this read the same
  // way it would for any other non-connection viewer. Fall back to null
  // (callers show the raw uid) rather than surfacing that as a page error.
  let user: User | null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    user = snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
  } catch {
    user = null;
  }
  cache.set(uid, user);
  return user;
}
