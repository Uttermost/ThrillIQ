import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { PostComment } from './types';

const COLLECTION = 'postComments';

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): PostComment {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    postId: (data.postId as string) ?? '',
    authorId: (data.authorId as string) ?? '',
    text: (data.text as string) ?? '',
    parentCommentId: (data.parentCommentId as string | null | undefined) ?? null,
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

// No orderBy here (equality filter only), same reasoning as
// fetchReviewsForAdventureReal — no composite index needed; callers sort
// client-side.
export async function fetchCommentsForPostReal(postId: string): Promise<PostComment[]> {
  const snapshot = await firestore().collection(COLLECTION).where('postId', '==', postId).get();
  return snapshot.docs.map(fromDoc);
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
  batch.set(commentRef, { postId: input.postId, authorId: input.authorId, text: input.text, parentCommentId, createdAt });
  batch.update(postRef, { commentCount: firestore.FieldValue.increment(1) });
  await batch.commit();
  return { id: commentRef.id, postId: input.postId, authorId: input.authorId, text: input.text, parentCommentId, createdAt };
}
