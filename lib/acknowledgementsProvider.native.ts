import firestore from '@react-native-firebase/firestore';

import { SafetyAcknowledgement } from './types';

const COLLECTION = 'acknowledgements';

// Deterministic doc id, same reasoning as reviewsProvider: one
// acknowledgement per participant per adventure, by construction.
function ackId(adventureId: string, userId: string): string {
  return `${adventureId}_${userId}`;
}

export async function fetchAcknowledgementsReal(adventureId: string): Promise<SafetyAcknowledgement[]> {
  const snapshot = await firestore().collection(COLLECTION).where('adventureId', '==', adventureId).get();
  return snapshot.docs.map((doc) => doc.data() as SafetyAcknowledgement);
}

export async function recordAcknowledgementReal(ack: SafetyAcknowledgement): Promise<void> {
  await firestore().collection(COLLECTION).doc(ackId(ack.adventureId, ack.userId)).set(ack);
}
