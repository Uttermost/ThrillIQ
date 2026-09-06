// Web has no Firestore SDK support — store.tsx keeps profiles entirely in the
// local usersState mock on that platform and never calls these. Present only
// so the import resolves.

import { User } from './types';

export function subscribeProfileReal(_uid: string, _onData: (user: User) => void, _onError: (e: unknown) => void): () => void {
  return () => {};
}

export async function fetchProfileReal(_uid: string): Promise<User | null> {
  return null;
}

export async function ensureProfileReal(_uid: string, _seed: { name: string; initials: string }): Promise<void> {}

export async function updateProfileReal(_uid: string, _patch: Partial<User>): Promise<void> {}
