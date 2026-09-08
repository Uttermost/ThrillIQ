// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { Follow } from './types';

export async function fetchFollowingReal(_uid: string): Promise<Follow[]> {
  return [];
}

export async function fetchFollowersReal(_uid: string): Promise<Follow[]> {
  return [];
}

export async function followUserReal(_followerId: string, _followingId: string): Promise<Follow> {
  throw new Error('Not implemented on web.');
}

export async function unfollowUserReal(_followerId: string, _followingId: string): Promise<void> {}
