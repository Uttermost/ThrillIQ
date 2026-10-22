// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { SafetyAcknowledgement } from './types';

export async function fetchAcknowledgementsReal(_adventureId: string): Promise<SafetyAcknowledgement[]> {
  return [];
}

export async function recordAcknowledgementReal(_ack: SafetyAcknowledgement): Promise<void> {}
