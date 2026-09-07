// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { Review } from './types';

export async function fetchReviewsForOrganizerReal(_organizerId: string): Promise<Review[]> {
  return [];
}

export async function hasReviewedReal(_adventureId: string, _reviewerId: string): Promise<boolean> {
  return false;
}

export async function submitReviewReal(_review: {
  adventureId: string;
  organizerId: string;
  reviewerId: string;
  rating: Review['rating'];
  text: string;
}): Promise<Review> {
  throw new Error('Not implemented on web.');
}
