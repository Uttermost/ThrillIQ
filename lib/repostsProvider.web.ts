import {
  DocumentData,
  QueryDocumentSnapshot,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from './firebase';
import { Repost } from './types';

const COLLECTION = 'reposts';
const FEED_LIMIT = 100;

function repostId(userId: string, postId: string): string {
  return `${userId}_${postId}`;
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>, myUid: string): Repost {
  const data = snap.data();
  return {
    id: snap.id,
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
  return onSnapshot(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(FEED_LIMIT)),
    (snapshot) => onData(snapshot.docs.map((d) => fromDoc(d, myUid))),
    onError
  );
}

export async function createRepostReal(input: { userId: string; postId: string; comment?: string }): Promise<Repost> {
  const id = repostId(input.userId, input.postId);
  const createdAt = Date.now();
  const comment = input.comment?.trim() || undefined;
  await setDoc(doc(db, COLLECTION, id), {
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
  await deleteDoc(doc(db, COLLECTION, repostId(userId, postId)));
}

export async function toggleLikeRepostReal(id: string, myUid: string, currentlyLiked: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    likedBy: currentlyLiked ? arrayRemove(myUid) : arrayUnion(myUid),
    likeCount: increment(currentlyLiked ? -1 : 1),
  });
}
