import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/lib/auth';

import './globals.css';

export const metadata: Metadata = {
  title: 'ThrillIQ Admin',
  description: 'Moderation and audit tooling for ThrillIQ.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
