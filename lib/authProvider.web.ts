import {
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { auth } from './firebase';

let pendingConfirmation: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

// Firebase's web phone auth needs a live reCAPTCHA bound to a DOM node —
// there's no equivalent on native, where sendPhoneCodeReal just triggers an
// SMS directly. Invisible size keeps it out of the RN-Web layout entirely.
function getRecaptchaVerifier(): RecaptchaVerifier {
  if (recaptchaVerifier) return recaptchaVerifier;
  let container = document.getElementById('recaptcha-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'recaptcha-container';
    document.body.appendChild(container);
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, container, { size: 'invisible' });
  return recaptchaVerifier;
}

export async function signInWithGoogleReal(): Promise<string | null> {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user.displayName;
}

export async function signInWithEmailReal(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      throw e;
    }
  }
}

export async function sendPhoneCodeReal(phone: string): Promise<void> {
  pendingConfirmation = await signInWithPhoneNumber(auth, phone, getRecaptchaVerifier());
}

export async function verifyPhoneCodeReal(code: string): Promise<void> {
  if (!pendingConfirmation) {
    throw new Error('No pending phone verification. Request a new code.');
  }
  await pendingConfirmation.confirm(code);
  pendingConfirmation = null;
}

export async function signOutReal(): Promise<void> {
  await signOut(auth);
}

export function subscribeMyId(callback: (uid: string | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => callback(user?.uid ?? null));
}
