'use client';

import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth, db } from './firebase';
import type { User } from './types';

type AuthState = {
  // undefined: still resolving the initial auth state. null: signed out.
  firebaseUser: FirebaseUser | null | undefined;
  profile: User | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => onAuthStateChanged(auth, (user) => setFirebaseUser(user)), []);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }
    // Live subscription, not a one-off fetch — isAdmin can only ever change
    // out-of-band (Firebase console), so this picks that up without asking
    // an already-open admin session to sign out and back in.
    return onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
      setProfile(snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null);
    });
  }, [firebaseUser]);

  const value = useMemo<AuthState>(
    () => ({
      firebaseUser,
      profile,
      isAdmin: profile?.isAdmin === true,
      signInWithGoogle: async () => {
        await signInWithPopup(auth, new GoogleAuthProvider());
      },
      signOutUser: async () => {
        await signOut(auth);
      },
    }),
    [firebaseUser, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
