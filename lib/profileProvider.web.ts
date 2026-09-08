import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from './firebase';
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
    privacy: (data.privacy as User['privacy']) ?? DEFAULT_PRIVACY,
    isAdmin: (data.isAdmin as boolean) ?? false,
  };
}

export function subscribeProfileReal(uid: string, onData: (user: User) => void, onError: (e: unknown) => void): () => void {
  return onSnapshot(
    doc(db, COLLECTION, uid),
    (snap) => {
      if (snap.exists()) onData(fromDoc(uid, snap.data()));
    },
    onError
  );
}

export async function fetchProfileReal(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return fromDoc(uid, snap.data());
}

export async function ensureProfileReal(uid: string, seed: { name: string; initials: string }): Promise<void> {
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
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
    privacy: DEFAULT_PRIVACY,
    createdAt: serverTimestamp(),
  });
}

export async function updateProfileReal(uid: string, patch: Partial<User>): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), patch, { merge: true });
}
