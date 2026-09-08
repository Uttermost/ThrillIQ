// Plain fallback so `tsc` can resolve `./contactProvider` — Metro's bundler
// always prefers contactProvider.web.ts / contactProvider.native.ts at
// build time, so this file's body never actually runs. See
// adventuresProvider.ts and its peers for the same pattern.

import { ContactMessage } from './types';

export async function submitContactMessageReal(_input: {
  name: string;
  email: string;
  topic: ContactMessage['topic'];
  message: string;
  userId?: string;
}): Promise<ContactMessage> {
  throw new Error('Not implemented');
}
