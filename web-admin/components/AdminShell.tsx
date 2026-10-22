'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/reports', label: 'Reports' },
  { href: '/audit-log', label: 'Audit log' },
  { href: '/usage', label: 'Usage' },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const { firebaseUser, profile, isAdmin, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (firebaseUser === undefined) return;
    if (!firebaseUser || !isAdmin) router.replace('/login');
  }, [firebaseUser, isAdmin, router]);

  if (firebaseUser === undefined || !firebaseUser || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-textMuted">
        {firebaseUser === undefined ? 'Loading…' : 'Redirecting…'}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-4">
        <div className="mb-6 px-2 text-lg font-semibold">ThrillIQ Admin</div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition ${
                pathname === item.href ? 'bg-primary/15 text-primary' : 'text-textMuted hover:bg-surfaceMuted hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border pt-3 text-xs text-textMuted">
          <div className="mb-2 truncate">{profile?.name ?? firebaseUser.email}</div>
          <button onClick={() => signOutUser()} className="hover:text-white hover:underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
