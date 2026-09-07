// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { Post } from './types';

export function subscribePostsReal(_myUid: string, _onData: (list: Post[]) => void, _onError: (e: unknown) => void): () => void {
  return () => {};
}

export async function createPostReal(_input: {
  authorId: string;
  text: string;
  photos?: string[];
  adventureId?: string | null;
}): Promise<Post> {
  throw new Error('Not implemented on web.');
}

export async function toggleLikePostReal(_postId: string, _myUid: string, _currentlyLiked: boolean): Promise<void> {}

export async function incrementShareCountReal(_postId: string): Promise<void> {}
