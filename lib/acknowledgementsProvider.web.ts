import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { SafetyAcknowledgement } from './types';

const COLLECTION = 'acknowledgements';

// Deterministic doc id, same reasoning as reviewsProvider: one
// acknowledgement per participant per adventure, by construction.
function ackId(adventureId: string, userId: string): string {
  return `${adventureId}_${userId}`;
}

export async function fetchAcknowledgementsReal(adventureId: string): Promise<SafetyAcknowledgement[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('adventureId', '==', adventureId)));
  return snapshot.docs.map((d) => d.data() as SafetyAcknowledgement);
}

export async function recordAcknowledgementReal(ack: SafetyAcknowledgement): Promise<void> {
  await setDoc(doc(db, COLLECTION, ackId(ack.adventureId, ack.userId)), ack);
}
