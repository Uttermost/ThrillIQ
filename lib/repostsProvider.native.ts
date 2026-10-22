import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { Repost } from './types';

const COLLECTION = 'reposts';
const FEED_LIMIT = 100;

function repostId(userId: string, postId: string): string {
  return `${userId}_${postId}`;
}

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot, myUid: string): Repost {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    userId: (data.userId as string) ?? '',
    postId: (data.postId as string) ?? '',
    comment: (data.comment as string | undefined) ?? undefined,
    likeCount: (data.likeCount as number) ?? 0,
    likedByMe: ((data.likedBy as string[]) ?? []).includes(myUid),
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

// Capped like subscribePostsReal, for the same reason — this is a feed,
// not an archive.
export function subscribeRepostsReal(myUid: string, onData: (list: Repost[]) => void, onError: (e: unknown) => void): () => void {
  return firestore()
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(FEED_LIMIT)
    .onSnapshot((snapshot) => onData(snapshot.docs.map((d) => fromDoc(d, myUid))), onError);
}

export async function createRepostReal(input: { userId: string; postId: string; comment?: string }): Promise<Repost> {
  const id = repostId(input.userId, input.postId);
  const createdAt = Date.now();
  const comment = input.comment?.trim() || undefined;
  await firestore()
    .collection(COLLECTION)
    .doc(id)
    .set({
      userId: input.userId,
      postId: input.postId,
      ...(comment ? { comment } : {}),
      likedBy: [] as string[],
      likeCount: 0,
      createdAt,
    });
  return { id, userId: input.userId, postId: input.postId, comment, likeCount: 0, likedByMe: false, createdAt };
}

export async function removeRepostReal(userId: string, postId: string): Promise<void> {
  await firestore().collection(COLLECTION).doc(repostId(userId, postId)).delete();
}

export async function toggleLikeRepostReal(id: string, myUid: string, currentlyLiked: boolean): Promise<void> {
  await firestore()
    .collection(COLLECTION)
    .doc(id)
    .update({
      likedBy: currentlyLiked ? firestore.FieldValue.arrayRemove(myUid) : firestore.FieldValue.arrayUnion(myUid),
      likeCount: firestore.FieldValue.increment(currentlyLiked ? -1 : 1),
    });
}
