// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { WaitlistEntry } from './types';

export async function fetchWaitlistReal(_adventureId: string): Promise<WaitlistEntry[]> {
  return [];
}

export async function fetchWaitlistForUserReal(_userId: string): Promise<WaitlistEntry[]> {
  return [];
}

export async function joinWaitlistReal(_adventureId: string, _userId: string): Promise<WaitlistEntry> {
  throw new Error('Not implemented on web.');
}

export async function leaveWaitlistReal(_adventureId: string, _userId: string): Promise<void> {}
