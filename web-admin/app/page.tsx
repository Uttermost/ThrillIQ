'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/lib/auth';

export default function Home() {
  const { firebaseUser, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (firebaseUser === undefined) return;
    router.replace(firebaseUser && isAdmin ? '/reports' : '/login');
  }, [firebaseUser, isAdmin, router]);

  return null;
}
