import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { Review } from './types';

const COLLECTION = 'reviews';

// Deterministic doc id (adventureId_reviewerId) — one review per participant
// per adventure by construction, and lets hasReviewedReal check existence
// with a single get() instead of a query.
function reviewId(adventureId: string, reviewerId: string): string {
  return `${adventureId}_${reviewerId}`;
}

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): Review {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    adventureId: (data.adventureId as string) ?? '',
    organizerId: (data.organizerId as string) ?? '',
    reviewerId: (data.reviewerId as string) ?? '',
    rating: (data.rating as Review['rating']) ?? 5,
    text: (data.text as string) ?? '',
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

export async function fetchReviewsForOrganizerReal(organizerId: string): Promise<Review[]> {
  const snapshot = await firestore().collection(COLLECTION).where('organizerId', '==', organizerId).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(fromDoc);
}

export async function hasReviewedReal(adventureId: string, reviewerId: string): Promise<boolean> {
  const doc = await firestore().collection(COLLECTION).doc(reviewId(adventureId, reviewerId)).get();
  return doc.exists;
}

export async function submitReviewReal(review: {
  adventureId: string;
  organizerId: string;
  reviewerId: string;
  rating: Review['rating'];
  text: string;
}): Promise<Review> {
  const id = reviewId(review.adventureId, review.reviewerId);
  const createdAt = Date.now();
  await firestore().collection(COLLECTION).doc(id).set({ ...review, createdAt });
  return { id, ...review, createdAt };
}
