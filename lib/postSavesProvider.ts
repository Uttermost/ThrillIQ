// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { PostSave } from './types';

export async function fetchMySavesReal(_myUid: string): Promise<PostSave[]> {
  return [];
}

export async function savePostReal(_userId: string, _postId: string): Promise<PostSave> {
  throw new Error('Not implemented on web.');
}

export async function unsavePostReal(_userId: string, _postId: string): Promise<void> {}
