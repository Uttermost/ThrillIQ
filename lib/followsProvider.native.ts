import firestore from '@react-native-firebase/firestore';

import { Follow } from './types';

const COLLECTION = 'follows';

function followId(followerId: string, followingId: string): string {
  return `${followerId}_${followingId}`;
}

// Who `uid` follows.
export async function fetchFollowingReal(uid: string): Promise<Follow[]> {
  const snapshot = await firestore().collection(COLLECTION).where('followerId', '==', uid).get();
  return snapshot.docs.map((doc) => doc.data() as Follow);
}

// Who follows `uid`.
export async function fetchFollowersReal(uid: string): Promise<Follow[]> {
  const snapshot = await firestore().collection(COLLECTION).where('followingId', '==', uid).get();
  return snapshot.docs.map((doc) => doc.data() as Follow);
}

export async function followUserReal(followerId: string, followingId: string): Promise<Follow> {
  const id = followId(followerId, followingId);
  const doc: Follow = { id, followerId, followingId, createdAt: Date.now() };
  await firestore().collection(COLLECTION).doc(id).set(doc);
  return doc;
}

export async function unfollowUserReal(followerId: string, followingId: string): Promise<void> {
  await firestore().collection(COLLECTION).doc(followId(followerId, followingId)).delete();
}
