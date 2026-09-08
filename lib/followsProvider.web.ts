import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { Follow } from './types';

const COLLECTION = 'follows';

function followId(followerId: string, followingId: string): string {
  return `${followerId}_${followingId}`;
}

// Who `uid` follows.
export async function fetchFollowingReal(uid: string): Promise<Follow[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('followerId', '==', uid)));
  return snapshot.docs.map((d) => d.data() as Follow);
}

// Who follows `uid`.
export async function fetchFollowersReal(uid: string): Promise<Follow[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('followingId', '==', uid)));
  return snapshot.docs.map((d) => d.data() as Follow);
}

export async function followUserReal(followerId: string, followingId: string): Promise<Follow> {
  const id = followId(followerId, followingId);
  const data: Follow = { id, followerId, followingId, createdAt: Date.now() };
  await setDoc(doc(db, COLLECTION, id), data);
  return data;
}

export async function unfollowUserReal(followerId: string, followingId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, followId(followerId, followingId)));
}
