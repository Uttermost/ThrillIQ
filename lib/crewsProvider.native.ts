import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { Crew } from './types';

const COLLECTION = 'crews';

// Deterministic-ish avatar hue from the name so a crew doesn't need a real
// image upload feature (none exists) yet still looks visually distinct.
function hueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return Math.abs(hash);
}

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): Crew {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    avatarHue: (data.avatarHue as number) ?? 0,
    memberIds: (data.memberIds as string[]) ?? [],
    ownerId: (data.ownerId as string) ?? '',
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

export function subscribeCrewsReal(onData: (list: Crew[]) => void, onError: (e: unknown) => void): () => void {
  return firestore()
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => onData(snapshot.docs.map(fromDoc)), onError);
}

export async function createCrewReal(input: { name: string; description: string; ownerId: string }): Promise<Crew> {
  const doc = {
    name: input.name,
    description: input.description,
    avatarHue: hueFromName(input.name),
    memberIds: [input.ownerId],
    ownerId: input.ownerId,
    createdAt: Date.now(),
  };
  const ref = await firestore().collection(COLLECTION).add(doc);
  return { id: ref.id, ...doc };
}

export async function joinCrewReal(crewId: string, myUid: string): Promise<void> {
  await firestore()
    .collection(COLLECTION)
    .doc(crewId)
    .update({ memberIds: firestore.FieldValue.arrayUnion(myUid) });
}

export async function leaveCrewReal(crewId: string, myUid: string): Promise<void> {
  await firestore()
    .collection(COLLECTION)
    .doc(crewId)
    .update({ memberIds: firestore.FieldValue.arrayRemove(myUid) });
}
