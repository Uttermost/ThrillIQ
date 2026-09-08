import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { PostSave } from './types';

const COLLECTION = 'postSaves';

function saveId(userId: string, postId: string): string {
  return `${userId}_${postId}`;
}

// Own saves only — firestore.rules denies reading anyone else's, so this is
// a one-shot fetch on sign-in (same pattern as fetchFollowingReal), not a
// live subscription of a whole collection like posts/reposts.
export async function fetchMySavesReal(myUid: string): Promise<PostSave[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('userId', '==', myUid)));
  return snapshot.docs.map((d) => d.data() as PostSave);
}

export async function savePostReal(userId: string, postId: string): Promise<PostSave> {
  const id = saveId(userId, postId);
  const data: PostSave = { id, userId, postId, createdAt: Date.now() };
  await setDoc(doc(db, COLLECTION, id), data);
  return data;
}

export async function unsavePostReal(userId: string, postId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, saveId(userId, postId)));
}
