import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { db } from './firebase';
import { Post } from './types';

const COLLECTION = 'posts';
const FEED_LIMIT = 100;

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>, myUid: string): Post {
  const data = snap.data();
  return {
    id: snap.id,
    authorId: (data.authorId as string) ?? '',
    text: (data.text as string) ?? '',
    photos: (data.photos as string[] | undefined) ?? undefined,
    adventureId: (data.adventureId as string | null | undefined) ?? null,
    crewId: (data.crewId as string | null | undefined) ?? null,
    likeCount: (data.likeCount as number) ?? 0,
    likedByMe: ((data.likedBy as string[]) ?? []).includes(myUid),
    commentCount: (data.commentCount as number) ?? 0,
    shareCount: (data.shareCount as number) ?? 0,
    createdAt: (data.createdAt as number) ?? Date.now(),
    editedAt: (data.editedAt as number | undefined) ?? undefined,
  };
}

// Capped rather than fully unbounded — this is a feed, not an archive; a
// pull-to-refresh re-runs the same query for now (no pagination cursor yet).
export function subscribePostsReal(myUid: string, onData: (list: Post[]) => void, onError: (e: unknown) => void): () => void {
  return onSnapshot(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(FEED_LIMIT)),
    (snapshot) => onData(snapshot.docs.map((d) => fromDoc(d, myUid))),
    onError
  );
}

export async function createPostReal(input: {
  authorId: string;
  text: string;
  photos?: string[];
  adventureId?: string | null;
  crewId?: string | null;
}): Promise<Post> {
  const createdAt = Date.now();
  const photos = input.photos && input.photos.length > 0 ? input.photos : undefined;
  const ref = await addDoc(collection(db, COLLECTION), {
    authorId: input.authorId,
    text: input.text,
    ...(photos ? { photos } : {}),
    adventureId: input.adventureId ?? null,
    crewId: input.crewId ?? null,
    likedBy: [] as string[],
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    createdAt,
  });
  return {
    id: ref.id,
    authorId: input.authorId,
    text: input.text,
    photos,
    adventureId: input.adventureId ?? null,
    crewId: input.crewId ?? null,
    likeCount: 0,
    likedByMe: false,
    commentCount: 0,
    shareCount: 0,
    createdAt,
  };
}

export async function toggleLikePostReal(postId: string, myUid: string, currentlyLiked: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, postId), {
    likedBy: currentlyLiked ? arrayRemove(myUid) : arrayUnion(myUid),
    likeCount: increment(currentlyLiked ? -1 : 1),
  });
}

// Bumped only when a share actually completes — see lib/share.ts, which
// calls this only after the platform share sheet resolves or the
// clipboard-copy fallback succeeds.
export async function incrementShareCountReal(postId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, postId), { shareCount: increment(1) });
}

// Only deletes the post document itself — firestore.rules restricts this
// to the post's own author (or an admin). Doesn't cascade to
// postComments/reposts referencing it, same as the native provider.
export async function deletePostReal(postId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, postId));
}

// Only text/photos are editable — see the firestore.rules update rule this
// pairs with. Removing every photo needs deleteField() rather than an
// empty array: `updateDoc` leaves an existing field alone unless told
// otherwise, so an empty array wouldn't actually clear it.
export async function updatePostReal(postId: string, input: { text: string; photos?: string[] }): Promise<void> {
  const photos = input.photos && input.photos.length > 0 ? input.photos : undefined;
  await updateDoc(doc(db, COLLECTION, postId), {
    text: input.text,
    photos: photos ?? deleteField(),
    editedAt: Date.now(),
  });
}
