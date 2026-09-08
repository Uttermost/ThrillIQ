// Web has no native Firebase SDK support (@react-native-firebase is native-only).
// These stay simulated; the store's own delay/simulateFailures logic wraps them,
// so this just needs to resolve. Swap for the Firebase JS SDK here if web needs
// a real backend later.

export async function signInWithGoogleReal(): Promise<string | null> {
  throw new Error('Not implemented on web.');
}

export async function signInWithEmailReal(_email: string, _password: string): Promise<void> {}

export async function sendPhoneCodeReal(_phone: string): Promise<void> {}

export async function verifyPhoneCodeReal(_code: string): Promise<void> {}

export async function signOutReal(): Promise<void> {}

// Web has no real identity source yet, so store.tsx falls back to the mock ME_ID.
export function subscribeMyId(_callback: (uid: string | null) => void): () => void {
  return () => {};
}
