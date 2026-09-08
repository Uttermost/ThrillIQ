import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { Connection } from './types';

const COLLECTION = 'connections';

function connectionId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

export async function fetchConnectionsForReal(uid: string): Promise<Connection[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('participantIds', 'array-contains', uid)));
  return snapshot.docs.map((d) => d.data() as Connection);
}

export async function sendConnectionRequestReal(requesterId: string, recipientId: string): Promise<Connection> {
  const id = connectionId(requesterId, recipientId);
  const data: Connection = {
    id,
    participantIds: [requesterId, recipientId].sort() as [string, string],
    requesterId,
    recipientId,
    status: 'pending',
    createdAt: Date.now(),
  };
  await setDoc(doc(db, COLLECTION, id), data);
  return data;
}

export async function respondToConnectionRequestReal(connectionId: string, accept: boolean): Promise<void> {
  const ref = doc(db, COLLECTION, connectionId);
  if (accept) await updateDoc(ref, { status: 'accepted' });
  else await deleteDoc(ref);
}
