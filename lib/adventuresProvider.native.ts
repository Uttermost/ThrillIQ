import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { timestampForBucket } from './dateBuckets';
import { Adventure, NewAdventureDraft } from './types';

const COLLECTION = 'adventures';

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot, myUid: string): Adventure {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    category: (data.category as Adventure['category']) ?? 'Other',
    difficulty: (data.difficulty as Adventure['difficulty']) ?? 'Moderate',
    socialLevel: (data.socialLevel as Adventure['socialLevel']) ?? 'Social',
    pace: (data.pace as Adventure['pace']) ?? 'Moderate',
    intensity: (data.intensity as Adventure['intensity']) ?? 'Moderate',
    transport: (data.transport as Adventure['transport']) ?? 'Own transport',
    audience: (data.audience as Adventure['audience']) ?? [],
    dateLabel: (data.dateLabel as string) ?? 'Date TBC',
    meetingTime: (data.meetingTime as string) ?? '',
    dateTimestamp: (data.dateTimestamp as number) ?? timestampForBucket('Later'),
    location: (data.location as string) ?? '',
    latitude: (data.latitude as number) ?? null,
    longitude: (data.longitude as number) ?? null,
    priceKsh: (data.priceKsh as number) ?? 0,
    spotsTotal: (data.spotsTotal as number) ?? 1,
    spotsFilled: (data.spotsFilled as number) ?? 0,
    organizerId: (data.organizerId as string) ?? '',
    participantIds: (data.participantIds as string[]) ?? [],
    guidelines: (data.guidelines as string[]) ?? [],
    likedByMe: ((data.likedBy as string[]) ?? []).includes(myUid),
    likeCount: (data.likeCount as number) ?? 0,
    coordinate: (data.coordinate as { x: number; y: number }) ?? { x: 0.5, y: 0.5 },
  };
}

export function subscribeAdventuresReal(
  myUid: string,
  onData: (list: Adventure[]) => void,
  onError: (e: unknown) => void
): () => void {
  return firestore()
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => onData(snapshot.docs.map((d) => fromDoc(d, myUid))), onError);
}

export async function joinAdventureReal(adventureId: string, myUid: string): Promise<void> {
  const ref = firestore().collection(COLLECTION).doc(adventureId);
  await firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error('This adventure no longer exists.');
    const data = snap.data() as Record<string, unknown>;
    const participantIds = (data.participantIds as string[]) ?? [];
    if (participantIds.includes(myUid)) return;
    const spotsFilled = (data.spotsFilled as number) ?? 0;
    const spotsTotal = (data.spotsTotal as number) ?? 0;
    if (spotsFilled >= spotsTotal) {
      throw new Error('This adventure is full.');
    }
    tx.update(ref, {
      spotsFilled: firestore.FieldValue.increment(1),
      participantIds: firestore.FieldValue.arrayUnion(myUid),
    });
  });
}

export async function leaveAdventureReal(adventureId: string, myUid: string): Promise<void> {
  await firestore()
    .collection(COLLECTION)
    .doc(adventureId)
    .update({
      spotsFilled: firestore.FieldValue.increment(-1),
      participantIds: firestore.FieldValue.arrayRemove(myUid),
    });
}

export async function toggleLikeReal(adventureId: string, myUid: string, currentlyLiked: boolean): Promise<void> {
  await firestore()
    .collection(COLLECTION)
    .doc(adventureId)
    .update({
      likedBy: currentlyLiked ? firestore.FieldValue.arrayRemove(myUid) : firestore.FieldValue.arrayUnion(myUid),
      likeCount: firestore.FieldValue.increment(currentlyLiked ? -1 : 1),
    });
}

export async function createAdventureReal(draft: NewAdventureDraft, organizerId: string): Promise<Adventure> {
  const guidelines: string[] = [];
  if (draft.noAlcohol) guidelines.push('No alcohol');
  if (draft.petsOk) guidelines.push('Pets ok');
  const spots = Math.max(1, parseInt(draft.spots, 10) || 1);
  const base = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    difficulty: draft.difficulty,
    socialLevel: draft.socialLevel,
    pace: draft.pace,
    intensity: draft.intensity,
    transport: draft.transport,
    audience: draft.audience,
    dateLabel: draft.schedule.trim() || 'Date TBC',
    meetingTime: '',
    dateTimestamp: timestampForBucket(draft.when),
    location: 'Nairobi area',
    latitude: null,
    longitude: null,
    priceKsh: parseInt(draft.priceKsh, 10) || 0,
    spotsTotal: spots,
    spotsFilled: 0,
    organizerId,
    participantIds: [] as string[],
    guidelines,
    likedBy: [] as string[],
    likeCount: 0,
    coordinate: { x: 0.5, y: 0.5 },
  };
  const ref = await firestore()
    .collection(COLLECTION)
    .add({ ...base, createdAt: firestore.FieldValue.serverTimestamp() });
  return { id: ref.id, ...base, likedByMe: false };
}

export async function updateAdventureReal(id: string, patch: { title: string; schedule: string }): Promise<void> {
  await firestore().collection(COLLECTION).doc(id).update({
    title: patch.title,
    dateLabel: patch.schedule,
    meetingTime: '',
  });
}

export async function cancelAdventureReal(id: string): Promise<void> {
  await firestore().collection(COLLECTION).doc(id).delete();
}
