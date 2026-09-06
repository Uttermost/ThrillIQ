import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// The "Web application" OAuth client Firebase generated alongside the Android
// one once a SHA-1 fingerprint was registered — GoogleSignin needs this to
// mint an ID token Firebase will accept, not the Android client id itself.
GoogleSignin.configure({
  webClientId: '530380846105-ulg5uvhtfmjgenefutuao18q8p27sf2u.apps.googleusercontent.com',
});

let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

export async function signInWithGoogleReal(): Promise<string | null> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') {
    throw new Error('Sign-in was cancelled.');
  }
  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Couldn't get a Google sign-in token.");
  }
  const credential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(credential);
  return response.data.user.name;
}

export async function signInWithEmailReal(email: string, password: string): Promise<void> {
  try {
    await auth().signInWithEmailAndPassword(email, password);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      await auth().createUserWithEmailAndPassword(email, password);
    } else {
      throw e;
    }
  }
}

export async function sendPhoneCodeReal(phone: string): Promise<void> {
  pendingConfirmation = await auth().signInWithPhoneNumber(phone);
}

export async function verifyPhoneCodeReal(code: string): Promise<void> {
  if (!pendingConfirmation) {
    throw new Error('No pending phone verification. Request a new code.');
  }
  await pendingConfirmation.confirm(code);
  pendingConfirmation = null;
}

export async function signOutReal(): Promise<void> {
  await auth().signOut();
}

export function subscribeMyId(callback: (uid: string | null) => void): () => void {
  return auth().onAuthStateChanged((user) => callback(user?.uid ?? null));
}
