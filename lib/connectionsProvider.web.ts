// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { Connection } from './types';

export async function fetchConnectionsForReal(_uid: string): Promise<Connection[]> {
  return [];
}

export async function sendConnectionRequestReal(_requesterId: string, _recipientId: string): Promise<Connection> {
  throw new Error('Not implemented on web.');
}

export async function respondToConnectionRequestReal(_connectionId: string, _accept: boolean): Promise<void> {}
