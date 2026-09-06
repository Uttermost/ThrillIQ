// Fallback module for TypeScript's plain Node resolution, which doesn't know
// about React Native's .native/.web platform suffixes the way Metro does.
// Metro always prefers authProvider.native.ts or authProvider.web.ts over
// this file at bundle time, so this exists purely so `tsc` (and any other
// non-Metro tool) can resolve `./authProvider` — keep it in sync with
// authProvider.web.ts.

export async function signInWithGoogleReal(): Promise<string | null> {
  throw new Error('Not implemented on web.');
}

export async function signInWithEmailReal(_email: string, _password: string): Promise<void> {}

export async function sendPhoneCodeReal(_phone: string): Promise<void> {}

export async function verifyPhoneCodeReal(_code: string): Promise<void> {}

export async function signOutReal(): Promise<void> {}

export function subscribeMyId(_callback: (uid: string | null) => void): () => void {
  return () => {};
}
