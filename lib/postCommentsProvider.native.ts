import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { PostComment } from './types';

const COLLECTION = 'postComments';

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot, myUid: string): PostComment {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
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
  const snapshot = await firestore().collection(COLLECTION).where('postId', '==', postId).get();
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
  const commentRef = firestore().collection(COLLECTION).doc();
  const postRef = firestore().collection('posts').doc(input.postId);
  const batch = firestore().batch();
  batch.set(commentRef, {
    postId: input.postId,
    authorId: input.authorId,
    text: input.text,
    parentCommentId,
    likedBy: [] as string[],
    likeCount: 0,
    createdAt,
  });
  batch.update(postRef, { commentCount: firestore.FieldValue.increment(1) });
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
  await firestore()
    .collection(COLLECTION)
    .doc(commentId)
    .update({
      likedBy: currentlyLiked ? firestore.FieldValue.arrayRemove(myUid) : firestore.FieldValue.arrayUnion(myUid),
      likeCount: firestore.FieldValue.increment(currentlyLiked ? -1 : 1),
    });
}
