import {
  DocumentData,
  QueryDocumentSnapshot,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebase';
import { PostComment } from './types';

const COLLECTION = 'postComments';

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>, myUid: string): PostComment {
  const data = snap.data();
  return {
    id: snap.id,
    postId: (data.postId as string) ?? '',
    authorId: (data.authorId as string) ?? '',
    text: (data.text as string) ?? '',
    parentCommentId: (data.parentCommentId as string | null | undefined) ?? null,
    likeCount: (data.likeCount as number) ?? 0,
    likedByMe: ((data.likedBy as string[]) ?? []).includes(myUid),
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

// No orderBy here (equality filter only), same reasoning as
// fetchReviewsForAdventureReal — no composite index needed; callers sort
// client-side.
export async function fetchCommentsForPostReal(postId: string, myUid: string): Promise<PostComment[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('postId', '==', postId)));
  return snapshot.docs.map((d) => fromDoc(d, myUid));
}

// Adds the comment and bumps the parent post's commentCount in one atomic
// batch — never two independent writes, so the denormalized count can't
// drift from the real number of comment docs even if one half failed.
export async function createPostCommentReal(input: {
  postId: string;
  authorId: string;
  text: string;
  parentCommentId?: string | null;
}): Promise<PostComment> {
  const createdAt = Date.now();
  const parentCommentId = input.parentCommentId ?? null;
  const commentRef = doc(collection(db, COLLECTION));
  const postRef = doc(db, 'posts', input.postId);
  const batch = writeBatch(db);
  batch.set(commentRef, {
    postId: input.postId,
    authorId: input.authorId,
    text: input.text,
    parentCommentId,
    likedBy: [] as string[],
    likeCount: 0,
    createdAt,
  });
  batch.update(postRef, { commentCount: increment(1) });
  await batch.commit();
  return {
    id: commentRef.id,
    postId: input.postId,
    authorId: input.authorId,
    text: input.text,
    parentCommentId,
    likeCount: 0,
    likedByMe: false,
    createdAt,
  };
}

export async function toggleLikeCommentReal(commentId: string, myUid: string, currentlyLiked: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, commentId), {
    likedBy: currentlyLiked ? arrayRemove(myUid) : arrayUnion(myUid),
    likeCount: increment(currentlyLiked ? -1 : 1),
  });
}

// Admin-only today (see the commentCount decrement rule in firestore.rules)
// — deletes the comment and decrements its post's commentCount in one
// atomic batch, the mirror image of createPostCommentReal's batch above.
export async function deletePostCommentReal(postId: string, commentId: string): Promise<void> {
  const commentRef = doc(db, COLLECTION, commentId);
  const postRef = doc(db, 'posts', postId);
  const batch = writeBatch(db);
  batch.delete(commentRef);
  batch.update(postRef, { commentCount: increment(-1) });
  await batch.commit();
}
