import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { WaitlistEntry } from './types';

const COLLECTION = 'waitlist';

function waitlistId(adventureId: string, userId: string): string {
  return `${adventureId}_${userId}`;
}

export async function fetchWaitlistReal(adventureId: string): Promise<WaitlistEntry[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('adventureId', '==', adventureId), orderBy('createdAt', 'asc')));
  return snapshot.docs.map((d) => d.data() as WaitlistEntry);
}

export async function fetchWaitlistForUserReal(userId: string): Promise<WaitlistEntry[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('userId', '==', userId)));
  return snapshot.docs.map((d) => d.data() as WaitlistEntry);
}

export async function joinWaitlistReal(adventureId: string, userId: string): Promise<WaitlistEntry> {
  const id = waitlistId(adventureId, userId);
  const data: WaitlistEntry = { id, adventureId, userId, createdAt: Date.now() };
  await setDoc(doc(db, COLLECTION, id), data);
  return data;
}

export async function leaveWaitlistReal(adventureId: string, userId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, waitlistId(adventureId, userId)));
}
