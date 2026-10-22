// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { Crew } from './types';

export function subscribeCrewsReal(_onData: (list: Crew[]) => void, _onError: (e: unknown) => void): () => void {
  return () => {};
}

export async function createCrewReal(_input: { name: string; description: string; ownerId: string }): Promise<Crew> {
  throw new Error('Not implemented on web.');
}

export async function joinCrewReal(_crewId: string, _myUid: string): Promise<void> {}

export async function leaveCrewReal(_crewId: string, _myUid: string): Promise<void> {}
