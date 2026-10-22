// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { Adventure, NewAdventureDraft } from './types';

export function subscribeAdventuresReal(
  _myUid: string,
  _onData: (list: Adventure[]) => void,
  _onError: (e: unknown) => void
): () => void {
  return () => {};
}

export async function joinAdventureReal(_adventureId: string, _myUid: string): Promise<void> {}

export async function leaveAdventureReal(_adventureId: string, _myUid: string): Promise<void> {}

export async function toggleLikeReal(_adventureId: string, _myUid: string, _currentlyLiked: boolean): Promise<void> {}

export async function createAdventureReal(_draft: NewAdventureDraft, _organizerId: string): Promise<Adventure> {
  throw new Error('Not implemented on web.');
}

export async function updateAdventureReal(_id: string, _patch: { title: string; schedule: string }): Promise<void> {}

export async function cancelAdventureReal(_id: string): Promise<void> {}
