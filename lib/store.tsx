import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  cancelAdventureReal,
  createAdventureReal,
  joinAdventureReal,
  leaveAdventureReal,
  subscribeAdventuresReal,
  toggleLikeReal,
  updateAdventureReal,
} from './adventuresProvider';
import {
  sendPhoneCodeReal,
  signInWithEmailReal,
  signInWithGoogleReal,
  signOutReal,
  subscribeMyId,
  verifyPhoneCodeReal,
} from './authProvider';
import { fetchAcknowledgementsReal, recordAcknowledgementReal } from './acknowledgementsProvider';
import { fetchAuditLogReal, fetchOpenReportsReal, recordAuditLogReal, resolveReportReal, submitReportReal } from './adminProvider';
import { fetchConnectionsForReal, respondToConnectionRequestReal, sendConnectionRequestReal } from './connectionsProvider';
import { createCrewReal, joinCrewReal, leaveCrewReal, subscribeCrewsReal } from './crewsProvider';
import { fetchFollowersReal, fetchFollowingReal, followUserReal, unfollowUserReal } from './followsProvider';
import { ME_ID, initialThreads, users } from './mockData';
import { createPostCommentReal, deletePostCommentReal, fetchCommentsForPostReal, toggleLikeCommentReal } from './postCommentsProvider';
import { fetchMySavesReal, savePostReal, unsavePostReal } from './postSavesProvider';
import { createPostReal, deletePostReal, incrementShareCountReal, subscribePostsReal, toggleLikePostReal, updatePostReal } from './postsProvider';
import { createRepostReal, removeRepostReal, subscribeRepostsReal, toggleLikeRepostReal } from './repostsProvider';
import { ensureProfileReal, fetchProfileReal, subscribeProfileReal, updateProfileReal } from './profileProvider';
import { fetchReviewsForAdventureReal, fetchReviewsForOrganizerReal, hasReviewedReal, submitReviewReal } from './reviewsProvider';
import { fetchWaitlistForUserReal, fetchWaitlistReal, joinWaitlistReal, leaveWaitlistReal } from './waitlistProvider';
import {
  Adventure,
  AppNotification,
  AuditLogEntry,
  Connection,
  Crew,
  DEFAULT_PRIVACY,
  DeepLink,
  Follow,
  NewAdventureDraft,
  NotificationType,
  Post,
  PostComment,
  PostSave,
  Report,
  ReportStatus,
  Repost,
  Review,
  SafetyAcknowledgement,
  Thread,
  User,
  WaitlistEntry,
} from './types';

let notificationSeq = 0;
function makeNotification(type: NotificationType, title: string, body: string, deepLink: DeepLink | null): AppNotification {
  notificationSeq += 1;
  return { id: `n-${Date.now()}-${notificationSeq}`, type, title, body, createdAt: Date.now(), read: false, deepLink };
}

function authErrorMessage(e: unknown, fallback: string): string {
  const code = (e as { code?: string })?.code;
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password (at least 6 characters).';
    case 'auth/email-already-in-use':
      return 'That email is already in use with a different password.';
    case 'auth/invalid-phone-number':
      return 'Enter a valid phone number.';
    case 'auth/invalid-verification-code':
      return 'Incorrect code. Check your messages and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a moment.';
    case 'auth/network-request-failed':
      return "Couldn't reach the server. Check your connection.";
    default:
      return e instanceof Error && e.message ? e.message : fallback;
  }
}

function defaultUser(id: string): User {
  return {
    id,
    name: 'Explorer',
    initials: 'ME',
    role: 'Explorer',
    location: '',
    avatarHue: 205,
    username: '',
    bio: '',
    interests: [],
    adventureCategories: [],
    preferredDifficulty: null,
    preferredSocialLevel: null,
    preferredPace: null,
    preferredIntensity: null,
    experienceLevel: null,
    tags: [],
    completedAdventuresCount: 0,
    privacy: DEFAULT_PRIVACY,
  };
}

const ONBOARDED_KEY = 'thrilliq.onboarded';
const AUTHENTICATED_KEY = 'thrilliq.authenticated';
const NETWORK_LATENCY_MS = 650;

export type SocialProvider = 'google' | 'apple';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ApiError extends Error {}

interface AppState {
  ready: boolean;
  authenticated: boolean;
  onboarded: boolean;
  adventures: Adventure[];
  crews: Crew[];
  posts: Post[];
  reposts: Repost[];
  // Own saves only (see the comment on the postSaves state below) — still
  // exposed raw, unlike follows, so app/saved.tsx can sort by save time
  // rather than just knowing which post ids are saved.
  postSaves: PostSave[];
  threads: Thread[];
  simulateFailures: boolean;
}

interface AppContextValue extends AppState {
  myId: string;
  me: User;
  users: Record<string, User>;
  completeOnboarding: () => Promise<void>;
  setSimulateFailures: (value: boolean) => void;
  signInWithProvider: (provider: SocialProvider) => Promise<void>;
  signInWithEmail: (params: { name: string; email: string; password: string }) => Promise<void>;
  sendPhoneCode: (phone: string) => Promise<void>;
  verifyPhoneCode: (params: { phone: string; name: string; code: string }) => Promise<void>;
  signOut: () => Promise<void>;
  fetchAdventures: () => Promise<Adventure[]>;
  joinAdventure: (id: string) => Promise<void>;
  leaveAdventure: (id: string) => Promise<void>;
  toggleLike: (id: string) => void;
  createAdventure: (draft: NewAdventureDraft) => Promise<Adventure>;
  updateAdventure: (id: string, patch: { title: string; schedule: string }) => Promise<void>;
  cancelAdventure: (id: string) => Promise<void>;
  sendMessage: (threadId: string, text: string, sharedPostId?: string) => Promise<void>;
  retryMessage: (threadId: string, messageId: string) => Promise<void>;
  markThreadRead: (threadId: string) => void;
  ensureThreadForAdventure: (adventureId: string, organizerId: string) => string;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  fetchOtherProfile: (uid: string) => Promise<User>;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  reviewsByOrganizer: Record<string, Review[]>;
  fetchReviewsForOrganizer: (organizerId: string) => Promise<Review[]>;
  fetchReviewsForAdventure: (adventureId: string) => Promise<Review[]>;
  hasReviewed: (adventureId: string) => Promise<boolean>;
  submitReview: (params: { adventureId: string; organizerId: string; rating: Review['rating']; text: string; photos?: string[] }) => Promise<void>;
  fetchAcknowledgementsForAdventure: (adventureId: string) => Promise<SafetyAcknowledgement[]>;
  fetchCrews: () => Promise<Crew[]>;
  createCrew: (input: { name: string; description: string }) => Promise<Crew>;
  joinCrew: (id: string) => Promise<void>;
  leaveCrew: (id: string) => Promise<void>;
  fetchPosts: () => Promise<Post[]>;
  createPost: (input: { text: string; photos?: string[]; adventureId?: string | null; crewId?: string | null }) => Promise<Post>;
  toggleLikePost: (id: string) => void;
  deletePost: (id: string) => Promise<void>;
  updatePost: (id: string, input: { text: string; photos?: string[] }) => Promise<void>;
  fetchCommentsForPost: (postId: string) => Promise<PostComment[]>;
  createComment: (input: { postId: string; text: string; parentCommentId?: string | null }) => Promise<PostComment>;
  toggleLikeComment: (commentId: string, currentlyLiked: boolean) => void;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  recordShare: (postId: string) => void;
  createRepost: (input: { postId: string; comment?: string }) => Promise<void>;
  removeRepost: (postId: string) => Promise<void>;
  toggleLikeRepost: (id: string) => void;
  // Same "always available" shape as myFollowingIds below — a small,
  // own-account-scoped set, never a full collection.
  mySavedPostIds: Set<string>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  // Who the signed-in user follows — always available without a fetch (a
  // small, own-account-scoped set), unlike per-profile follower/following
  // counts below which are fetched on demand per screen.
  myFollowingIds: Set<string>;
  fetchFollowersFor: (uid: string) => Promise<Follow[]>;
  fetchFollowingFor: (uid: string) => Promise<Follow[]>;
  followUser: (uid: string) => Promise<void>;
  unfollowUser: (uid: string) => Promise<void>;
  fetchConnectionsFor: (uid: string) => Promise<Connection[]>;
  sendConnectionRequest: (toUserId: string) => Promise<void>;
  respondToConnectionRequest: (connectionId: string, accept: boolean) => Promise<void>;
  fetchWaitlist: (adventureId: string) => Promise<WaitlistEntry[]>;
  joinWaitlist: (adventureId: string) => Promise<void>;
  leaveWaitlist: (adventureId: string) => Promise<void>;
  submitReport: (input: { targetType: Report['targetType']; targetId: string; contextId?: string; reason: Report['reason']; details: string }) => Promise<void>;
  fetchOpenReports: () => Promise<Report[]>;
  resolveReport: (report: Report, status: ReportStatus) => Promise<void>;
  fetchAuditLog: () => Promise<AuditLogEntry[]>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [myId, setMyId] = useState(ME_ID);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const crewsRef = useRef(crews);
  crewsRef.current = crews;
  const [posts, setPosts] = useState<Post[]>([]);
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const postsErrorRef = useRef<string | null>(null);
  // Reposts ARE globally reactive like posts/crews (unlike comments) — a
  // single small feed-shaped collection, not per-user data.
  const [reposts, setReposts] = useState<Repost[]>([]);
  const repostsRef = useRef(reposts);
  repostsRef.current = reposts;
  // Own saves only, like follows below — never a full collection, and
  // private besides (firestore.rules denies reading anyone else's saves).
  const [postSaves, setPostSaves] = useState<PostSave[]>([]);
  const postSavesRef = useRef(postSaves);
  postSavesRef.current = postSaves;
  const mySavedPostIds = useMemo(() => new Set(postSaves.filter((s) => s.userId === myId).map((s) => s.postId)), [postSaves, myId]);
  // Only the signed-in user's own following edges (fetched below) — never
  // the full collection, which isn't meant to be globally loaded.
  const [follows, setFollows] = useState<Follow[]>([]);
  const followsRef = useRef(follows);
  followsRef.current = follows;
  const myFollowingIds = useMemo(() => new Set(follows.filter((f) => f.followerId === myId).map((f) => f.followingId)), [follows, myId]);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    initialThreads
      .filter((t) => t.unread)
      .map((t) => {
        const last = t.messages.at(-1);
        const other = users[t.otherUserId];
        return makeNotification(
          'new_message',
          other?.name ?? 'New message',
          last?.text ?? '',
          { screen: 'chat', id: t.id }
        );
      })
  );
  const hasLoadedAdventuresOnceRef = useRef(false);
  const [usersState, setUsersState] = useState<Record<string, User>>(users);
  // Reviews are fetched and cached per organizer/adventure on demand — no
  // reason to ship every review in the app to every client up front.
  const [reviewsByOrganizer, setReviewsByOrganizer] = useState<Record<string, Review[]>>({});
  // Adventure ids the current user is waitlisted for — refreshed on sign-in
  // and after joining/leaving a waitlist; drives the waitlist_spot_open
  // notification below without a per-render Firestore query.
  const [myWaitlistedAdventureIds, setMyWaitlistedAdventureIds] = useState<string[]>([]);
  const [simulateFailures, setSimulateFailures] = useState(false);
  const simulateFailuresRef = useRef(simulateFailures);
  simulateFailuresRef.current = simulateFailures;
  const adventuresRef = useRef(adventures);
  adventuresRef.current = adventures;
  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const myIdRef = useRef(myId);
  myIdRef.current = myId;
  const adventuresErrorRef = useRef<string | null>(null);
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;
  const usersStateRef = useRef(usersState);
  usersStateRef.current = usersState;

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(ONBOARDED_KEY), AsyncStorage.getItem(AUTHENTICATED_KEY)])
      .then(([onboardedValue, authValue]) => {
        setOnboarded(onboardedValue === 'true');
        setAuthenticated(authValue === 'true');
      })
      .catch(() => {
        setOnboarded(false);
        setAuthenticated(false);
      })
      .finally(() => setReady(true));
  }, []);

  // On native, myId becomes the real Firebase Auth uid once signed in. On web
  // it stays the mock ME_ID, since @react-native-firebase has no web support.
  useEffect(() => subscribeMyId((uid) => setMyId(uid ?? ME_ID)), []);

  useEffect(() => {
    setUsersState((prev) => (prev[myId] ? prev : { ...prev, [myId]: defaultUser(myId) }));
  }, [myId]);

  // Real Firestore adventures feed. Adventures are publicly browsable, so
  // this runs regardless of sign-in state.
  useEffect(() => {
    return subscribeAdventuresReal(
      myId,
      (list) => {
        adventuresErrorRef.current = null;
        // Diff against the previous snapshot to surface real notifications —
        // skip the very first snapshot after mount so loading existing
        // adventures doesn't look like a flood of new events.
        if (hasLoadedAdventuresOnceRef.current) {
          const prevById = new Map(adventuresRef.current.map((a) => [a.id, a]));
          const newIds = new Set(list.map((a) => a.id));
          const fresh: AppNotification[] = [];
          prevById.forEach((prev, prevId) => {
            const mine = prev.organizerId === myId || prev.participantIds.includes(myId);
            if (mine && !newIds.has(prevId)) {
              fresh.push(makeNotification('adventure_cancelled', `${prev.title} was cancelled`, 'The organizer cancelled this adventure.', null));
            }
          });
          list.forEach((curr) => {
            const prev = prevById.get(curr.id);
            if (!prev) return;
            const mine = curr.organizerId === myId || curr.participantIds.includes(myId);
            if (mine && (prev.title !== curr.title || prev.dateLabel !== curr.dateLabel)) {
              fresh.push(
                makeNotification('adventure_updated', `${curr.title} was updated`, 'Date or details changed.', { screen: 'adventure', id: curr.id })
              );
            }
            if (curr.organizerId === myId && curr.participantIds.length > prev.participantIds.length) {
              fresh.push(
                makeNotification('participant_joined', 'New participant', `Someone joined ${curr.title}.`, { screen: 'organizer', id: curr.id })
              );
            }
          });
          if (fresh.length > 0) setNotifications((prevN) => [...fresh, ...prevN]);
        }
        hasLoadedAdventuresOnceRef.current = true;
        setAdventures(list);
      },
      (e) => {
        // Surfaced the next time fetchAdventures() is called (mount or
        // pull-to-refresh), which drives Discover's error/retry state —
        // otherwise a permission-denied (e.g. rules not published yet)
        // fails silently and Discover just looks empty forever.
        adventuresErrorRef.current = e instanceof Error ? e.message : "Couldn't load adventures";
      }
    );
  }, [authenticated, myId]);

  // Real Firestore crews feed — publicly browsable like adventures, so this
  // also runs regardless of sign-in state.
  const crewsErrorRef = useRef<string | null>(null);
  useEffect(() => {
    return subscribeCrewsReal(
      (list) => {
        crewsErrorRef.current = null;
        setCrews(list);
      },
      (e) => {
        crewsErrorRef.current = e instanceof Error ? e.message : "Couldn't load crews";
      }
    );
  }, []);

  // Unlike the live subscriptions above, this is a one-shot fetch of just
  // the signed-in user's own following edges — not the whole follows
  // collection, which has no reason to be loaded client-side in full.
  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    fetchFollowingReal(myId)
      .then((list) => {
        if (!cancelled) setFollows(list);
      })
      .catch(() => {
        // Best-effort: myFollowingIds just stays empty/stale on failure.
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, myId]);

  // Same one-shot pattern as follows above — just the signed-in user's own
  // saves, not a live subscription of a collection nobody else can read.
  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    fetchMySavesReal(myId)
      .then((list) => {
        if (!cancelled) setPostSaves(list);
      })
      .catch(() => {
        // Best-effort: mySavedPostIds just stays empty/stale on failure.
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, myId]);

  // Real Firestore posts feed — publicly browsable like adventures/crews.
  useEffect(() => {
    return subscribePostsReal(
      myId,
      (list) => {
        postsErrorRef.current = null;
        setPosts(list);
      },
      (e) => {
        postsErrorRef.current = e instanceof Error ? e.message : "Couldn't load the feed";
      }
    );
  }, [myId]);

  // Real Firestore reposts feed — same shape as posts above (publicly
  // browsable, capped, globally reactive).
  useEffect(() => {
    return subscribeRepostsReal(
      myId,
      (list) => setReposts(list),
      () => {
        // Best-effort, same as follows above — reposts just stay stale/empty
        // on failure rather than blocking the rest of the Feed.
      }
    );
  }, [myId]);

  // Real Firestore profile for the signed-in user. Keeps usersState[myId]
  // in sync with whatever's actually saved server-side.
  useEffect(() => {
    if (!authenticated) return;
    return subscribeProfileReal(
      myId,
      (profile) => setUsersState((prev) => ({ ...prev, [myId]: profile })),
      () => {
        // Profile doc may not exist yet (ensureProfileReal creates it on
        // sign-in); the local defaultUser() fallback covers the gap.
      }
    );
  }, [authenticated, myId]);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    } catch {
      // Non-fatal: onboarding state just won't persist across restarts.
    }
  }, []);

  const updateMyName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const initials = trimmed
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
      setUsersState((prev) => ({
        ...prev,
        [myId]: { ...(prev[myId] ?? defaultUser(myId)), name: trimmed, initials: initials || prev[myId]?.initials || '' },
      }));
    },
    [myId]
  );

  const completeSignIn = useCallback(async () => {
    setAuthenticated(true);
    try {
      await AsyncStorage.setItem(AUTHENTICATED_KEY, 'true');
    } catch {
      // Non-fatal: session just won't persist across restarts.
    }
    const known = usersStateRef.current[myIdRef.current];
    try {
      await ensureProfileReal(myIdRef.current, { name: known?.name || 'Explorer', initials: known?.initials || 'ME' });
    } catch {
      // Non-fatal: the local defaultUser() fallback covers the gap until
      // the next successful sign-in retries this.
    }
  }, []);

  const signInWithProvider = useCallback(
    async (provider: SocialProvider) => {
      // Google is real on both native (SHA-1 fingerprint registered) and web
      // (Firebase Auth popup). Apple stays simulated everywhere — deferred,
      // needs a native module and an Apple Developer account.
      if (provider === 'google') {
        if (simulateFailuresRef.current) {
          throw new ApiError("Couldn't sign in. Try again.");
        }
        let name: string | null;
        try {
          name = await signInWithGoogleReal();
        } catch (e) {
          throw new ApiError(authErrorMessage(e, "Couldn't sign in. Try again."));
        }
        if (name) updateMyName(name);
        await completeSignIn();
        return;
      }
      await delay(NETWORK_LATENCY_MS);
      if (simulateFailuresRef.current) {
        throw new ApiError("Couldn't sign in. Try again.");
      }
      await completeSignIn();
    },
    [completeSignIn, updateMyName]
  );

  const signInWithEmail = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't sign in. Check your details and try again.");
      }
      if (!email.includes('@') || password.length < 6) {
        throw new ApiError('Enter a valid email and a password of at least 6 characters.');
      }
      try {
        await signInWithEmailReal(email, password);
      } catch (e) {
        throw new ApiError(authErrorMessage(e, "Couldn't sign in. Check your details and try again."));
      }
      updateMyName(name);
      await completeSignIn();
    },
    [completeSignIn, updateMyName]
  );

  const sendPhoneCode = useCallback(async (phone: string) => {
    if (phone.replace(/\D/g, '').length < 9) {
      throw new ApiError('Enter a valid phone number.');
    }
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't send the code. Check your connection.");
    }
    try {
      await sendPhoneCodeReal(phone);
    } catch (e) {
      throw new ApiError(authErrorMessage(e, "Couldn't send the code. Check your connection."));
    }
  }, []);

  const verifyPhoneCode = useCallback(
    async ({ name, code }: { phone: string; name: string; code: string }) => {
      if (code.length !== 6) {
        throw new ApiError('Enter the 6-digit code.');
      }
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError('Incorrect code. Check your messages and try again.');
      }
      try {
        await verifyPhoneCodeReal(code);
      } catch (e) {
        throw new ApiError(authErrorMessage(e, 'Incorrect code. Check your messages and try again.'));
      }
      updateMyName(name);
      await completeSignIn();
    },
    [completeSignIn, updateMyName]
  );

  const signOut = useCallback(async () => {
    setAuthenticated(false);
    try {
      await AsyncStorage.removeItem(AUTHENTICATED_KEY);
    } catch {
      // Non-fatal: local state is already signed out.
    }
    try {
      await signOutReal();
    } catch {
      // Non-fatal: local session is already cleared either way.
    }
  }, []);

  const fetchAdventures = useCallback(async () => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't load adventures");
    }
    if (adventuresErrorRef.current) {
      throw new ApiError(adventuresErrorRef.current);
    }
    return adventuresRef.current;
  }, []);

  const joinAdventure = useCallback(async (id: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't join. Check your connection.");
    }
    const guidelinesSnapshot = adventuresRef.current.find((a) => a.id === id)?.guidelines ?? [];
    try {
      await joinAdventureReal(id, myIdRef.current);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't join. Check your connection.");
    }
    recordAcknowledgementReal({ adventureId: id, userId: myIdRef.current, guidelinesSnapshot, agreedAt: Date.now() }).catch(() => {
      // Best-effort: the join itself already succeeded; a failed audit-trail
      // write isn't worth blocking or retrying on its own.
    });
  }, []);

  const leaveAdventure = useCallback(async (id: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't leave. Check your connection.");
    }
    try {
      await leaveAdventureReal(id, myIdRef.current);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't leave. Check your connection.");
    }
  }, []);

  const toggleLike = useCallback((id: string) => {
    const target = adventuresRef.current.find((a) => a.id === id);
    if (!target) return;
    toggleLikeReal(id, myIdRef.current, target.likedByMe).catch(() => {
      // Best-effort: a failed like just doesn't flip. Not worth a retry UI.
    });
  }, []);

  const createAdventure = useCallback(async (draft: NewAdventureDraft) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't publish. Your draft wasn't lost.");
    }
    try {
      return await createAdventureReal(draft, myIdRef.current);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't publish. Your draft wasn't lost.");
    }
  }, []);

  const updateAdventure = useCallback(async (id: string, patch: { title: string; schedule: string }) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't save changes.");
    }
    try {
      await updateAdventureReal(id, patch);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't save changes.");
    }
  }, []);

  const cancelAdventure = useCallback(async (id: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't cancel. Try again.");
    }
    try {
      await cancelAdventureReal(id);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't cancel. Try again.");
    }
  }, []);

  const fetchCrews = useCallback(async (): Promise<Crew[]> => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't load crews");
    }
    if (crewsErrorRef.current) {
      throw new ApiError(crewsErrorRef.current);
    }
    return crewsRef.current;
  }, []);

  const createCrew = useCallback(async ({ name, description }: { name: string; description: string }): Promise<Crew> => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't create your crew. Try again.");
    }
    try {
      return await createCrewReal({ name: name.trim(), description: description.trim(), ownerId: myIdRef.current });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't create your crew. Try again.");
    }
  }, []);

  const joinCrew = useCallback(async (id: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't join. Check your connection.");
    }
    try {
      await joinCrewReal(id, myIdRef.current);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't join. Check your connection.");
    }
  }, []);

  const leaveCrew = useCallback(async (id: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't leave. Check your connection.");
    }
    try {
      await leaveCrewReal(id, myIdRef.current);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't leave. Check your connection.");
    }
  }, []);

  const fetchPosts = useCallback(async (): Promise<Post[]> => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't load the feed");
    }
    if (postsErrorRef.current) {
      throw new ApiError(postsErrorRef.current);
    }
    return postsRef.current;
  }, []);

  const createPost = useCallback(
    async ({
      text,
      photos,
      adventureId,
      crewId,
    }: {
      text: string;
      photos?: string[];
      adventureId?: string | null;
      crewId?: string | null;
    }) => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't publish your post. Try again.");
      }
      try {
        return await createPostReal({ authorId: myIdRef.current, text: text.trim(), photos, adventureId, crewId });
      } catch (e) {
        throw new ApiError(e instanceof Error ? e.message : "Couldn't publish your post. Try again.");
      }
    },
    []
  );

  const toggleLikePost = useCallback((id: string) => {
    const target = postsRef.current.find((p) => p.id === id);
    if (!target) return;
    toggleLikePostReal(id, myIdRef.current, target.likedByMe).catch(() => {
      // Best-effort, same as adventure likes — a failed like just doesn't flip.
    });
  }, []);

  // Deliberately doesn't cascade to postComments/reposts referencing this
  // post, matching postsProvider.native.ts's deletePostReal — both screens
  // that could show an orphaned reference already degrade gracefully.
  const deletePost = useCallback(async (id: string): Promise<void> => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't delete your post. Try again.");
    }
    try {
      await deletePostReal(id);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't delete your post. Try again.");
    }
  }, []);

  // Only text/photos are editable — see the matching firestore.rules update
  // rule. Likes/comments/shares/tags all survive untouched; editedAt marks
  // that it happened so PostCard can show an "Edited" note.
  const updatePost = useCallback(async (id: string, { text, photos }: { text: string; photos?: string[] }): Promise<void> => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't save your changes. Try again.");
    }
    const cleanPhotos = photos && photos.length > 0 ? photos : undefined;
    try {
      await updatePostReal(id, { text: text.trim(), photos: cleanPhotos });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't save your changes. Try again.");
    }
  }, []);

  const fetchCommentsForPost = useCallback(async (postId: string): Promise<PostComment[]> => {
    try {
      return await fetchCommentsForPostReal(postId, myIdRef.current);
    } catch {
      return [];
    }
  }, []);

  const createComment = useCallback(
    async ({ postId, text, parentCommentId }: { postId: string; text: string; parentCommentId?: string | null }): Promise<PostComment> => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't post your comment. Try again.");
      }
      try {
        return await createPostCommentReal({ postId, authorId: myIdRef.current, text: text.trim(), parentCommentId });
      } catch (e) {
        throw new ApiError(e instanceof Error ? e.message : "Couldn't post your comment. Try again.");
      }
    },
    []
  );

  // Comments have no single global reactive array (fetchCommentsForPost
  // hands results straight to whichever screen asked, per-post) — so the
  // caller passes currentlyLiked and owns its own optimistic UI update;
  // this just persists it.
  const toggleLikeComment = useCallback((commentId: string, currentlyLiked: boolean) => {
    toggleLikeCommentReal(commentId, myIdRef.current, currentlyLiked).catch(() => {
      // Best-effort, same as adventure/post likes — a failed like just doesn't flip.
    });
  }, []);

  // Admin-only today — the moderation queue (app/admin.tsx) is the only
  // caller, deleting a reported comment. No self-service "delete my own
  // comment" flow exists yet, so this doesn't check authorship client-side;
  // firestore.rules is the real gate.
  const deleteComment = useCallback(async (postId: string, commentId: string): Promise<void> => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't delete that comment. Try again.");
    }
    try {
      await deletePostCommentReal(postId, commentId);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't delete that comment. Try again.");
    }
  }, []);

  // Fire-and-forget, same style as toggleLike/toggleLikePost — the caller
  // (lib/share.ts via the UI) already confirmed the share itself completed
  // before calling this, so a failed count-increment isn't worth surfacing.
  const recordShare = useCallback((id: string) => {
    incrementShareCountReal(id).catch(() => {});
  }, []);

  // Reposting counts as a share (recordShare bumps shareCount the same as
  // any other completed share), plus it creates its own Feed item.
  const createRepost = useCallback(async ({ postId, comment }: { postId: string; comment?: string }): Promise<void> => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't repost. Try again.");
    }
    try {
      await createRepostReal({ userId: myIdRef.current, postId, comment });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't repost. Try again.");
    }
    // Best-effort, same as the plain recordShare action below — the repost
    // itself already succeeded by this point, so a failed count bump isn't
    // worth surfacing as a repost failure. Previously this was awaited
    // inside the same try block: a network blip here threw *after* the
    // repost doc was already created, so the UI showed a failure for an
    // action that had actually succeeded — and if the user retried,
    // createRepostReal's unconditional `.set()` on the same deterministic
    // id would silently reset the repost's likeCount/likedBy/createdAt.
    incrementShareCountReal(postId).catch(() => {});
  }, []);

  const removeRepost = useCallback(async (postId: string): Promise<void> => {
    await removeRepostReal(myIdRef.current, postId).catch(() => {
      // Best-effort, same as other removals in this file.
    });
  }, []);

  const toggleLikeRepost = useCallback((id: string) => {
    const target = repostsRef.current.find((r) => r.id === id);
    if (!target) return;
    toggleLikeRepostReal(id, myIdRef.current, target.likedByMe).catch(() => {
      // Best-effort, same as post/comment likes.
    });
  }, []);

  const fetchFollowersFor = useCallback(async (uid: string): Promise<Follow[]> => {
    try {
      return await fetchFollowersReal(uid);
    } catch {
      return [];
    }
  }, []);

  const fetchFollowingFor = useCallback(async (uid: string): Promise<Follow[]> => {
    try {
      return await fetchFollowingReal(uid);
    } catch {
      return [];
    }
  }, []);

  const followUser = useCallback(async (uid: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't follow. Try again.");
    }
    try {
      const created = await followUserReal(myIdRef.current, uid);
      setFollows((prev) => (prev.some((f) => f.id === created.id) ? prev : [...prev, created]));
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't follow. Try again.");
    }
  }, []);

  const unfollowUser = useCallback(async (uid: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't unfollow. Try again.");
    }
    const id = `${myIdRef.current}_${uid}`;
    try {
      await unfollowUserReal(myIdRef.current, uid);
      setFollows((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't unfollow. Try again.");
    }
  }, []);

  // Private — never appears anywhere but the saving user's own "Saved
  // posts" list (app/saved.tsx). Idempotent by deterministic id, same
  // shape as follow/repost.
  const savePost = useCallback(async (postId: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't save that post. Try again.");
    }
    try {
      const created = await savePostReal(myIdRef.current, postId);
      setPostSaves((prev) => (prev.some((s) => s.id === created.id) ? prev : [...prev, created]));
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't save that post. Try again.");
    }
  }, []);

  const unsavePost = useCallback(async (postId: string) => {
    const id = `${myIdRef.current}_${postId}`;
    try {
      await unsavePostReal(myIdRef.current, postId);
      setPostSaves((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't unsave that post. Try again.");
    }
  }, []);

  const fetchConnectionsFor = useCallback(async (uid: string): Promise<Connection[]> => {
    try {
      return await fetchConnectionsForReal(uid);
    } catch {
      return [];
    }
  }, []);

  const sendConnectionRequest = useCallback(async (toUserId: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't send the request. Try again.");
    }
    try {
      await sendConnectionRequestReal(myIdRef.current, toUserId);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't send the request. Try again.");
    }
  }, []);

  const respondToConnectionRequest = useCallback(async (connectionId: string, accept: boolean) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't update the request. Try again.");
    }
    try {
      await respondToConnectionRequestReal(connectionId, accept);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't update the request. Try again.");
    }
  }, []);

  const refreshMyWaitlist = useCallback(async () => {
    const mine = await fetchWaitlistForUserReal(myIdRef.current).catch(() => []);
    setMyWaitlistedAdventureIds(mine.map((w) => w.adventureId));
  }, []);

  useEffect(() => {
    refreshMyWaitlist();
  }, [myId, refreshMyWaitlist]);

  const fetchWaitlist = useCallback(async (adventureId: string): Promise<WaitlistEntry[]> => {
    try {
      return await fetchWaitlistReal(adventureId);
    } catch {
      return [];
    }
  }, []);

  const joinWaitlist = useCallback(
    async (adventureId: string) => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't join the waitlist. Try again.");
      }
      try {
        await joinWaitlistReal(adventureId, myIdRef.current);
        await refreshMyWaitlist();
      } catch (e) {
        throw new ApiError(e instanceof Error ? e.message : "Couldn't join the waitlist. Try again.");
      }
    },
    [refreshMyWaitlist]
  );

  const leaveWaitlist = useCallback(
    async (adventureId: string) => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't leave the waitlist. Try again.");
      }
      try {
        await leaveWaitlistReal(adventureId, myIdRef.current);
        await refreshMyWaitlist();
      } catch (e) {
        throw new ApiError(e instanceof Error ? e.message : "Couldn't leave the waitlist. Try again.");
      }
    },
    [refreshMyWaitlist]
  );

  const submitReport = useCallback(
    async ({
      targetType,
      targetId,
      contextId,
      reason,
      details,
    }: {
      targetType: Report['targetType'];
      targetId: string;
      contextId?: string;
      reason: Report['reason'];
      details: string;
    }) => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't submit your report. Try again.");
      }
      try {
        await submitReportReal({ targetType, targetId, contextId, reporterId: myIdRef.current, reason, details: details.trim() });
      } catch (e) {
        throw new ApiError(e instanceof Error ? e.message : "Couldn't submit your report. Try again.");
      }
    },
    []
  );

  const fetchOpenReports = useCallback(async (): Promise<Report[]> => {
    try {
      return await fetchOpenReportsReal();
    } catch {
      return [];
    }
  }, []);

  const resolveReport = useCallback(async (report: Report, status: ReportStatus) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't update the report. Try again.");
    }
    const action = status === 'dismissed' ? 'Dismissed report' : 'Resolved report';
    try {
      await resolveReportReal(report.id, status);
      await recordAuditLogReal({ actorId: myIdRef.current, action, targetType: report.targetType, targetId: report.targetId });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't update the report. Try again.");
    }
  }, []);

  const fetchAuditLog = useCallback(async (): Promise<AuditLogEntry[]> => {
    try {
      return await fetchAuditLogReal();
    } catch {
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (threadId: string, text: string, sharedPostId?: string) => {
    const messageId = `m-${Date.now()}`;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: messageId,
                  threadId,
                  senderId: myIdRef.current,
                  text,
                  status: 'sent',
                  ...(sharedPostId ? { sharedPostId } : {}),
                  createdAt: Date.now(),
                },
              ],
            }
          : t
      )
    );
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: t.messages.map((m) => (m.id === messageId ? { ...m, status: 'failed' } : m)) }
            : t
        )
      );
    }
  }, []);

  const retryMessage = useCallback(async (threadId: string, messageId: string) => {
    await delay(NETWORK_LATENCY_MS);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: t.messages.map((m) =>
                m.id === messageId ? { ...m, status: simulateFailuresRef.current ? 'failed' : 'sent' } : m
              ),
            }
          : t
      )
    );
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: false } : t)));
  }, []);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    setUsersState((prev) => ({ ...prev, [myIdRef.current]: { ...(prev[myIdRef.current] ?? defaultUser(myIdRef.current)), ...patch } }));
    try {
      await updateProfileReal(myIdRef.current, patch);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't save your profile.");
    }
  }, []);

  const fetchOtherProfile = useCallback(async (uid: string): Promise<User> => {
    const cached = usersStateRef.current[uid];
    if (cached) return cached;
    try {
      const profile = await fetchProfileReal(uid);
      if (profile) {
        setUsersState((prev) => ({ ...prev, [uid]: profile }));
        return profile;
      }
    } catch {
      // Falls through to the generic placeholder below.
    }
    const placeholder = { ...defaultUser(uid), name: 'Someone', initials: '?' };
    setUsersState((prev) => (prev[uid] ? prev : { ...prev, [uid]: placeholder }));
    return placeholder;
  }, []);

  const fetchReviewsForOrganizer = useCallback(async (organizerId: string): Promise<Review[]> => {
    try {
      const list = await fetchReviewsForOrganizerReal(organizerId);
      setReviewsByOrganizer((prev) => ({ ...prev, [organizerId]: list }));
      return list;
    } catch {
      return [];
    }
  }, []);

  const fetchReviewsForAdventure = useCallback(async (adventureId: string): Promise<Review[]> => {
    try {
      return await fetchReviewsForAdventureReal(adventureId);
    } catch {
      return [];
    }
  }, []);

  const hasReviewed = useCallback(async (adventureId: string): Promise<boolean> => {
    try {
      return await hasReviewedReal(adventureId, myIdRef.current);
    } catch {
      return false;
    }
  }, []);

  const submitReview = useCallback(
    async ({
      adventureId,
      organizerId,
      rating,
      text,
      photos,
    }: {
      adventureId: string;
      organizerId: string;
      rating: Review['rating'];
      text: string;
      photos?: string[];
    }) => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't submit your review. Try again.");
      }
      try {
        const created = await submitReviewReal({
          adventureId,
          organizerId,
          reviewerId: myIdRef.current,
          rating,
          text: text.trim(),
          photos: photos && photos.length > 0 ? photos : undefined,
        });
        setReviewsByOrganizer((prev) => ({ ...prev, [organizerId]: [created, ...(prev[organizerId] ?? [])] }));
      } catch (e) {
        throw new ApiError(e instanceof Error ? e.message : "Couldn't submit your review. Try again.");
      }
    },
    []
  );

  // Derived notifications — computed client-side from state every client
  // already has, rather than requiring another real user's live action (the
  // web mock has no such second actor to react to; native's adventures diff
  // above only fires for the other, genuinely multi-user event types).
  // Deterministic ids (`n-reminder-<id>`, `n-review-<id>`) make each one a
  // one-time event per adventure instead of re-firing on every state change.
  useEffect(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    adventures
      .filter((a) => a.participantIds.includes(myId) && a.dateTimestamp > now && a.dateTimestamp - now < dayMs)
      .forEach((a) => {
        const nid = `n-reminder-${a.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        setNotifications((prev) =>
          prev.some((n) => n.id === nid)
            ? prev
            : [
                {
                  id: nid,
                  type: 'adventure_reminder',
                  title: `${a.title} is coming up`,
                  body: `Starts ${a.dateLabel}${a.meetingTime ? ` · ${a.meetingTime}` : ''}.`,
                  createdAt: now,
                  read: false,
                  deepLink: { screen: 'adventure', id: a.id },
                },
                ...prev,
              ]
        );
      });

    adventures
      .filter((a) => a.participantIds.includes(myId) && a.organizerId !== myId && a.dateTimestamp < now)
      .forEach((a) => {
        const nid = `n-review-${a.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        hasReviewed(a.id).then((already) => {
          if (already) return;
          setNotifications((prev) =>
            prev.some((n) => n.id === nid)
              ? prev
              : [
                  {
                    id: nid,
                    type: 'review_prompt',
                    title: `How was ${a.title}?`,
                    body: 'Leave a quick review for the organizer.',
                    createdAt: now,
                    read: false,
                    deepLink: { screen: 'adventure', id: a.id },
                  },
                  ...prev,
                ]
          );
        });
      });

    adventures
      .filter((a) => myWaitlistedAdventureIds.includes(a.id) && a.spotsFilled < a.spotsTotal && !a.participantIds.includes(myId))
      .forEach((a) => {
        const nid = `n-waitlist-${a.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        setNotifications((prev) =>
          prev.some((n) => n.id === nid)
            ? prev
            : [
                {
                  id: nid,
                  type: 'waitlist_spot_open',
                  title: `A spot opened up in ${a.title}!`,
                  body: 'Join now before it fills again.',
                  createdAt: now,
                  read: false,
                  deepLink: { screen: 'adventure', id: a.id },
                },
                ...prev,
              ]
        );
      });
  }, [adventures, myId, hasReviewed, myWaitlistedAdventureIds]);

  // Same "derived, one-time, from already-loaded state" pattern as above —
  // posts and crews are already loaded client-side (live on native, seeded
  // on web), so these need no separate live-diff machinery. Deliberately
  // coarse: post_liked/post_commented fire once per post (its first like,
  // its first comment), not once per like/comment — a full per-event feed
  // would need a real diff of someone else's live action, which the web
  // mock has no second actor to generate anyway.
  useEffect(() => {
    const now = Date.now();

    posts
      .filter((p) => p.authorId === myId && p.likeCount >= 1)
      .forEach((p) => {
        const nid = `n-postlike-${p.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        setNotifications((prev) =>
          prev.some((n) => n.id === nid)
            ? prev
            : [
                { id: nid, type: 'post_liked', title: 'Someone liked your post', body: p.text, createdAt: now, read: false, deepLink: { screen: 'post', id: p.id } },
                ...prev,
              ]
        );
      });

    posts
      .filter((p) => p.authorId === myId && p.commentCount >= 1)
      .forEach((p) => {
        const nid = `n-postcomment-${p.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        setNotifications((prev) =>
          prev.some((n) => n.id === nid)
            ? prev
            : [
                { id: nid, type: 'post_commented', title: 'New comment on your post', body: p.text, createdAt: now, read: false, deepLink: { screen: 'post', id: p.id } },
                ...prev,
              ]
        );
      });

    posts
      .filter((p) => p.crewId && p.authorId !== myId && crews.some((c) => c.id === p.crewId && c.memberIds.includes(myId)))
      .forEach((p) => {
        const nid = `n-crewpost-${p.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        const crew = crews.find((c) => c.id === p.crewId);
        setNotifications((prev) =>
          prev.some((n) => n.id === nid)
            ? prev
            : [
                {
                  id: nid,
                  type: 'crew_post',
                  title: `New post in ${crew?.name ?? 'your crew'}`,
                  body: p.text,
                  createdAt: now,
                  read: false,
                  deepLink: { screen: 'crew', id: p.crewId as string },
                },
                ...prev,
              ]
        );
      });

    posts
      .filter((p) => p.authorId === myId)
      .forEach((p) => {
        if (!reposts.some((r) => r.postId === p.id && r.userId !== myId)) return;
        const nid = `n-repost-${p.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        setNotifications((prev) =>
          prev.some((n) => n.id === nid)
            ? prev
            : [
                { id: nid, type: 'post_reposted', title: 'Someone reposted your post', body: p.text, createdAt: now, read: false, deepLink: { screen: 'post', id: p.id } },
                ...prev,
              ]
        );
      });
  }, [posts, crews, reposts, myId]);

  // Who follows me — a one-shot check per sign-in (fetchFollowersFor is a
  // single query, not a live subscription), same simplification as above:
  // a new follow mid-session isn't picked up until the next sign-in/reload.
  useEffect(() => {
    let cancelled = false;
    fetchFollowersFor(myId).then((list) => {
      if (cancelled) return;
      list.forEach((f) => {
        const nid = `n-follower-${f.id}`;
        if (notificationsRef.current.some((n) => n.id === nid)) return;
        setNotifications((prev) =>
          prev.some((n) => n.id === nid)
            ? prev
            : [
                {
                  id: nid,
                  type: 'new_follower',
                  title: 'New follower',
                  body: 'Someone started following you.',
                  createdAt: f.createdAt,
                  read: false,
                  deepLink: { screen: 'profile', id: f.followerId },
                },
                ...prev,
              ]
        );
      });
    });
    return () => {
      cancelled = true;
    };
  }, [myId, fetchFollowersFor]);

  const fetchAcknowledgementsForAdventure = useCallback(async (adventureId: string): Promise<SafetyAcknowledgement[]> => {
    try {
      return await fetchAcknowledgementsReal(adventureId);
    } catch {
      return [];
    }
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const ensureThreadForAdventure = useCallback((adventureId: string, organizerId: string) => {
    const existing = threadsRef.current.find((t) => t.adventureId === adventureId && t.otherUserId === organizerId);
    if (existing) return existing.id;
    const id = `t-${adventureId}-${organizerId}`;
    setThreads((prev) => [...prev, { id, adventureId, otherUserId: organizerId, unread: false, messages: [] }]);
    return id;
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      authenticated,
      onboarded,
      myId,
      adventures,
      crews,
      posts,
      reposts,
      postSaves,
      threads,
      simulateFailures,
      me: usersState[myId] ?? defaultUser(myId),
      users: usersState,
      completeOnboarding,
      setSimulateFailures,
      signInWithProvider,
      signInWithEmail,
      sendPhoneCode,
      verifyPhoneCode,
      signOut,
      fetchAdventures,
      joinAdventure,
      leaveAdventure,
      toggleLike,
      createAdventure,
      updateAdventure,
      cancelAdventure,
      sendMessage,
      retryMessage,
      markThreadRead,
      ensureThreadForAdventure,
      updateProfile,
      fetchOtherProfile,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      reviewsByOrganizer,
      fetchReviewsForOrganizer,
      fetchReviewsForAdventure,
      hasReviewed,
      submitReview,
      fetchAcknowledgementsForAdventure,
      fetchCrews,
      createCrew,
      joinCrew,
      leaveCrew,
      fetchPosts,
      createPost,
      toggleLikePost,
      deletePost,
      updatePost,
      fetchCommentsForPost,
      createComment,
      toggleLikeComment,
      deleteComment,
      recordShare,
      createRepost,
      removeRepost,
      toggleLikeRepost,
      mySavedPostIds,
      savePost,
      unsavePost,
      myFollowingIds,
      fetchFollowersFor,
      fetchFollowingFor,
      followUser,
      unfollowUser,
      fetchConnectionsFor,
      sendConnectionRequest,
      respondToConnectionRequest,
      fetchWaitlist,
      joinWaitlist,
      leaveWaitlist,
      submitReport,
      fetchOpenReports,
      resolveReport,
      fetchAuditLog,
    }),
    [
      ready,
      authenticated,
      onboarded,
      myId,
      adventures,
      crews,
      posts,
      reposts,
      postSaves,
      threads,
      simulateFailures,
      usersState,
      completeOnboarding,
      signInWithProvider,
      signInWithEmail,
      sendPhoneCode,
      verifyPhoneCode,
      signOut,
      fetchAdventures,
      joinAdventure,
      leaveAdventure,
      toggleLike,
      createAdventure,
      updateAdventure,
      cancelAdventure,
      sendMessage,
      retryMessage,
      markThreadRead,
      ensureThreadForAdventure,
      updateProfile,
      fetchOtherProfile,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      reviewsByOrganizer,
      fetchReviewsForOrganizer,
      fetchReviewsForAdventure,
      hasReviewed,
      submitReview,
      fetchAcknowledgementsForAdventure,
      fetchCrews,
      createCrew,
      joinCrew,
      leaveCrew,
      fetchPosts,
      createPost,
      toggleLikePost,
      deletePost,
      updatePost,
      fetchCommentsForPost,
      createComment,
      toggleLikeComment,
      deleteComment,
      recordShare,
      createRepost,
      removeRepost,
      toggleLikeRepost,
      mySavedPostIds,
      savePost,
      unsavePost,
      myFollowingIds,
      fetchFollowersFor,
      fetchFollowingFor,
      followUser,
      unfollowUser,
      fetchConnectionsFor,
      sendConnectionRequest,
      respondToConnectionRequest,
      fetchWaitlist,
      joinWaitlist,
      leaveWaitlist,
      submitReport,
      fetchOpenReports,
      resolveReport,
      fetchAuditLog,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
