import firestore from '@react-native-firebase/firestore';

import { WaitlistEntry } from './types';

const COLLECTION = 'waitlist';

function waitlistId(adventureId: string, userId: string): string {
  return `${adventureId}_${userId}`;
}

export async function fetchWaitlistReal(adventureId: string): Promise<WaitlistEntry[]> {
  const snapshot = await firestore().collection(COLLECTION).where('adventureId', '==', adventureId).orderBy('createdAt', 'asc').get();
  return snapshot.docs.map((doc) => doc.data() as WaitlistEntry);
}

export async function fetchWaitlistForUserReal(userId: string): Promise<WaitlistEntry[]> {
  const snapshot = await firestore().collection(COLLECTION).where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => doc.data() as WaitlistEntry);
}

export async function joinWaitlistReal(adventureId: string, userId: string): Promise<WaitlistEntry> {
  const id = waitlistId(adventureId, userId);
  const doc: WaitlistEntry = { id, adventureId, userId, createdAt: Date.now() };
  await firestore().collection(COLLECTION).doc(id).set(doc);
  return doc;
}

export async function leaveWaitlistReal(adventureId: string, userId: string): Promise<void> {
  await firestore().collection(COLLECTION).doc(waitlistId(adventureId, userId)).delete();
}
