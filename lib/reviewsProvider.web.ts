import { DocumentData, QueryDocumentSnapshot, collection, doc, getDoc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { Review } from './types';

const COLLECTION = 'reviews';

// Deterministic doc id (adventureId_reviewerId) — one review per participant
// per adventure by construction, and lets hasReviewedReal check existence
// with a single get() instead of a query.
function reviewId(adventureId: string, reviewerId: string): string {
  return `${adventureId}_${reviewerId}`;
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Review {
  const data = snap.data();
  return {
    id: snap.id,
    adventureId: (data.adventureId as string) ?? '',
    organizerId: (data.organizerId as string) ?? '',
    reviewerId: (data.reviewerId as string) ?? '',
    rating: (data.rating as Review['rating']) ?? 5,
    text: (data.text as string) ?? '',
    photos: (data.photos as string[] | undefined) ?? undefined,
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

export async function fetchReviewsForOrganizerReal(organizerId: string): Promise<Review[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('organizerId', '==', organizerId), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(fromDoc);
}

// No orderBy here (only an equality filter), so no composite index needed —
// callers sort client-side if they need chronological order.
export async function fetchReviewsForAdventureReal(adventureId: string): Promise<Review[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('adventureId', '==', adventureId)));
  return snapshot.docs.map(fromDoc);
}

export async function hasReviewedReal(adventureId: string, reviewerId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COLLECTION, reviewId(adventureId, reviewerId)));
  return snap.exists();
}

export async function submitReviewReal(review: {
  adventureId: string;
  organizerId: string;
  reviewerId: string;
  rating: Review['rating'];
  text: string;
  photos?: string[];
}): Promise<Review> {
  const id = reviewId(review.adventureId, review.reviewerId);
  const createdAt = Date.now();
  const { photos, ...rest } = review;
  // Firestore rejects `undefined` field values — only include photos when
  // there actually are some, rather than writing an empty/undefined field.
  await setDoc(doc(db, COLLECTION, id), { ...rest, ...(photos && photos.length > 0 ? { photos } : {}), createdAt });
  return { id, ...review, createdAt };
}
