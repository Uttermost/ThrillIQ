import firestore from '@react-native-firebase/firestore';

import { Connection } from './types';

const COLLECTION = 'connections';

function connectionId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

export async function fetchConnectionsForReal(uid: string): Promise<Connection[]> {
  const snapshot = await firestore().collection(COLLECTION).where('participantIds', 'array-contains', uid).get();
  return snapshot.docs.map((doc) => doc.data() as Connection);
}

export async function sendConnectionRequestReal(requesterId: string, recipientId: string): Promise<Connection> {
  const id = connectionId(requesterId, recipientId);
  const doc: Connection = {
    id,
    participantIds: [requesterId, recipientId].sort() as [string, string],
    requesterId,
    recipientId,
    status: 'pending',
    createdAt: Date.now(),
  };
  await firestore().collection(COLLECTION).doc(id).set(doc);
  return doc;
}

export async function respondToConnectionRequestReal(connectionId: string, accept: boolean): Promise<void> {
  const ref = firestore().collection(COLLECTION).doc(connectionId);
  if (accept) await ref.update({ status: 'accepted' });
  else await ref.delete();
}
