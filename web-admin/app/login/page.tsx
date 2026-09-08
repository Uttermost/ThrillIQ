'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { firebaseUser, profile, isAdmin, signInWithGoogle, signOutUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (firebaseUser && isAdmin) router.replace('/reports');
  }, [firebaseUser, isAdmin, router]);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.');
    } finally {
      setSigningIn(false);
    }
  };

  // Signed in, but the same Firebase account isn't a ThrillIQ admin —
  // isAdmin is only ever set by hand in the Firebase console (see
  // firestore.rules), there's no self-service path to this panel.
  const notAuthorized = firebaseUser && profile && !isAdmin;
  const noProfile = firebaseUser && profile === null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">ThrillIQ Admin</h1>
        <p className="mt-1 text-sm text-textMuted">Sign in with the Google account linked to your ThrillIQ admin user.</p>
      </div>

      {notAuthorized && (
        <div className="w-full max-w-sm rounded-lg border border-danger/40 bg-surface p-4 text-sm">
          <p>
            Signed in as <span className="font-medium">{profile?.name ?? firebaseUser.email}</span>, but this account isn&apos;t a
            ThrillIQ admin.
          </p>
          <button onClick={() => signOutUser()} className="mt-3 text-primary hover:underline">
            Sign out and try another account
          </button>
        </div>
      )}

      {noProfile && (
        <div className="w-full max-w-sm rounded-lg border border-danger/40 bg-surface p-4 text-sm">
          <p>Signed in, but no ThrillIQ profile exists for this account yet.</p>
          <button onClick={() => signOutUser()} className="mt-3 text-primary hover:underline">
            Sign out and try another account
          </button>
        </div>
      )}

      {!firebaseUser && (
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {signingIn ? 'Signing in…' : 'Sign in with Google'}
        </button>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
