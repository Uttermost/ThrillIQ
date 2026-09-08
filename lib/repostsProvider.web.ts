// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { Repost } from './types';

export function subscribeRepostsReal(_myUid: string, _onData: (list: Repost[]) => void, _onError: (e: unknown) => void): () => void {
  return () => {};
}

export async function createRepostReal(_input: { userId: string; postId: string; comment?: string }): Promise<Repost> {
  throw new Error('Not implemented on web.');
}

export async function removeRepostReal(_userId: string, _postId: string): Promise<void> {}

export async function toggleLikeRepostReal(_id: string, _myUid: string, _currentlyLiked: boolean): Promise<void> {}
