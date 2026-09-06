import firestore from '@react-native-firebase/firestore';

import { DEFAULT_PRIVACY, User } from './types';

const COLLECTION = 'users';

function fromDoc(uid: string, data: Record<string, unknown>): User {
  return {
    id: uid,
    name: (data.name as string) ?? '',
    initials: (data.initials as string) ?? '',
    role: (data.role as string) ?? 'Explorer',
    location: (data.location as string) ?? '',
    avatarHue: (data.avatarHue as number) ?? 205,
    username: (data.username as string) ?? '',
    bio: (data.bio as string) ?? '',
    interests: (data.interests as string[]) ?? [],
    adventureCategories: (data.adventureCategories as User['adventureCategories']) ?? [],
    preferredDifficulty: (data.preferredDifficulty as User['preferredDifficulty']) ?? null,
    preferredSocialLevel: (data.preferredSocialLevel as User['preferredSocialLevel']) ?? null,
    preferredPace: (data.preferredPace as User['preferredPace']) ?? null,
    preferredIntensity: (data.preferredIntensity as User['preferredIntensity']) ?? null,
    experienceLevel: (data.experienceLevel as User['experienceLevel']) ?? null,
    tags: (data.tags as User['tags']) ?? [],
    completedAdventuresCount: (data.completedAdventuresCount as number) ?? 0,
    connectionsCount: (data.connectionsCount as number) ?? 0,
    crewIds: (data.crewIds as string[]) ?? [],
    privacy: (data.privacy as User['privacy']) ?? DEFAULT_PRIVACY,
  };
}

export function subscribeProfileReal(uid: string, onData: (user: User) => void, onError: (e: unknown) => void): () => void {
  return firestore()
    .collection(COLLECTION)
    .doc(uid)
    .onSnapshot((doc) => {
      if (doc.exists) onData(fromDoc(uid, doc.data() as Record<string, unknown>));
    }, onError);
}

export async function fetchProfileReal(uid: string): Promise<User | null> {
  const doc = await firestore().collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return fromDoc(uid, doc.data() as Record<string, unknown>);
}

export async function ensureProfileReal(uid: string, seed: { name: string; initials: string }): Promise<void> {
  const ref = firestore().collection(COLLECTION).doc(uid);
  const doc = await ref.get();
  if (doc.exists) return;
  await ref.set({
    name: seed.name,
    initials: seed.initials,
    role: 'Explorer',
    location: '',
    avatarHue: 205,
    username: '',
    bio: '',
    interests: [],
    adventureCategories: [],
    preferredDifficulty: null,
    preferredSocialLevel: null,
    preferredPace: null,
    preferredIntensity: null,
    experienceLevel: null,
    tags: [],
    completedAdventuresCount: 0,
    connectionsCount: 0,
    crewIds: [],
    privacy: DEFAULT_PRIVACY,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function updateProfileReal(uid: string, patch: Partial<User>): Promise<void> {
  await firestore().collection(COLLECTION).doc(uid).set(patch, { merge: true });
}
