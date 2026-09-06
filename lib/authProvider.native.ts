import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

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
