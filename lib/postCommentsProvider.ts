// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { PostComment } from './types';

export async function fetchCommentsForPostReal(_postId: string, _myUid: string): Promise<PostComment[]> {
  return [];
}

export async function createPostCommentReal(_input: {
  postId: string;
  authorId: string;
  text: string;
  parentCommentId?: string | null;
}): Promise<PostComment> {
  throw new Error('Not implemented on web.');
}

export async function toggleLikeCommentReal(_commentId: string, _myUid: string, _currentlyLiked: boolean): Promise<void> {}
