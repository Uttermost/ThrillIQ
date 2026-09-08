import firestore from '@react-native-firebase/firestore';

import { PostSave } from './types';

const COLLECTION = 'postSaves';

function saveId(userId: string, postId: string): string {
  return `${userId}_${postId}`;
}

// Own saves only — firestore.rules denies reading anyone else's, so this is
// a one-shot fetch on sign-in (same pattern as fetchFollowingReal), not a
// live subscription of a whole collection like posts/reposts.
export async function fetchMySavesReal(myUid: string): Promise<PostSave[]> {
  const snapshot = await firestore().collection(COLLECTION).where('userId', '==', myUid).get();
  return snapshot.docs.map((doc) => doc.data() as PostSave);
}

export async function savePostReal(userId: string, postId: string): Promise<PostSave> {
  const id = saveId(userId, postId);
  const doc: PostSave = { id, userId, postId, createdAt: Date.now() };
  await firestore().collection(COLLECTION).doc(id).set(doc);
  return doc;
}

export async function unsavePostReal(userId: string, postId: string): Promise<void> {
  await firestore().collection(COLLECTION).doc(saveId(userId, postId)).delete();
}
