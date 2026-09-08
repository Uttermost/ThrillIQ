import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { db } from './firebase';
import { Crew } from './types';

const COLLECTION = 'crews';

// Deterministic-ish avatar hue from the name so a crew doesn't need a real
// image upload feature (none exists) yet still looks visually distinct.
function hueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return Math.abs(hash);
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Crew {
  const data = snap.data();
  return {
    id: snap.id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    avatarHue: (data.avatarHue as number) ?? 0,
    memberIds: (data.memberIds as string[]) ?? [],
    ownerId: (data.ownerId as string) ?? '',
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

export function subscribeCrewsReal(onData: (list: Crew[]) => void, onError: (e: unknown) => void): () => void {
  return onSnapshot(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')), (snapshot) => onData(snapshot.docs.map(fromDoc)), onError);
}

export async function createCrewReal(input: { name: string; description: string; ownerId: string }): Promise<Crew> {
  const data = {
    name: input.name,
    description: input.description,
    avatarHue: hueFromName(input.name),
    memberIds: [input.ownerId],
    ownerId: input.ownerId,
    createdAt: Date.now(),
  };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function joinCrewReal(crewId: string, myUid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, crewId), { memberIds: arrayUnion(myUid) });
}

export async function leaveCrewReal(crewId: string, myUid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, crewId), { memberIds: arrayRemove(myUid) });
}
