import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { Post } from './types';

const COLLECTION = 'posts';
const FEED_LIMIT = 100;

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot, myUid: string): Post {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    authorId: (data.authorId as string) ?? '',
    text: (data.text as string) ?? '',
    photos: (data.photos as string[] | undefined) ?? undefined,
    adventureId: (data.adventureId as string | null | undefined) ?? null,
    likeCount: (data.likeCount as number) ?? 0,
    likedByMe: ((data.likedBy as string[]) ?? []).includes(myUid),
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

// Capped rather than fully unbounded — this is a feed, not an archive; a
// pull-to-refresh re-runs the same query for now (no pagination cursor yet).
export function subscribePostsReal(myUid: string, onData: (list: Post[]) => void, onError: (e: unknown) => void): () => void {
  return firestore()
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(FEED_LIMIT)
    .onSnapshot((snapshot) => onData(snapshot.docs.map((d) => fromDoc(d, myUid))), onError);
}

export async function createPostReal(input: {
  authorId: string;
  text: string;
  photos?: string[];
  adventureId?: string | null;
}): Promise<Post> {
  const createdAt = Date.now();
  const photos = input.photos && input.photos.length > 0 ? input.photos : undefined;
  const ref = await firestore()
    .collection(COLLECTION)
    .add({
      authorId: input.authorId,
      text: input.text,
      ...(photos ? { photos } : {}),
      adventureId: input.adventureId ?? null,
      likedBy: [] as string[],
      likeCount: 0,
      createdAt,
    });
  return { id: ref.id, authorId: input.authorId, text: input.text, photos, adventureId: input.adventureId ?? null, likeCount: 0, likedByMe: false, createdAt };
}

export async function toggleLikePostReal(postId: string, myUid: string, currentlyLiked: boolean): Promise<void> {
  await firestore()
    .collection(COLLECTION)
    .doc(postId)
    .update({
      likedBy: currentlyLiked ? firestore.FieldValue.arrayRemove(myUid) : firestore.FieldValue.arrayUnion(myUid),
      likeCount: firestore.FieldValue.increment(currentlyLiked ? -1 : 1),
    });
}
