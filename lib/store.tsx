import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

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
import { formatDateLabel, formatTimeLabel } from './dateFormat';
import { fetchFollowersReal, fetchFollowingReal, followUserReal, unfollowUserReal } from './followsProvider';
import {
  ME_ID,
  initialAcknowledgements,
  initialAdventures,
  initialAuditLog,
  initialConnections,
  initialCrews,
  initialFollows,
  initialPostComments,
  initialPosts,
  initialReports,
  initialReviews,
  initialThreads,
  initialWaitlist,
  users,
} from './mockData';
import { createPostCommentReal, fetchCommentsForPostReal } from './postCommentsProvider';
import { createPostReal, incrementShareCountReal, subscribePostsReal, toggleLikePostReal } from './postsProvider';
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
  Report,
  ReportStatus,
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
const IS_NATIVE = Platform.OS !== 'web';

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
  sendMessage: (threadId: string, text: string) => Promise<void>;
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
  fetchCommentsForPost: (postId: string) => Promise<PostComment[]>;
  createComment: (input: { postId: string; text: string }) => Promise<PostComment>;
  recordShare: (postId: string) => void;
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
  submitReport: (input: { targetType: Report['targetType']; targetId: string; reason: Report['reason']; details: string }) => Promise<void>;
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
  const [adventures, setAdventures] = useState<Adventure[]>(IS_NATIVE ? [] : initialAdventures);
  const [crews, setCrews] = useState<Crew[]>(IS_NATIVE ? [] : initialCrews);
  const crewsRef = useRef(crews);
  crewsRef.current = crews;
  const [posts, setPosts] = useState<Post[]>(IS_NATIVE ? [] : initialPosts);
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const postsErrorRef = useRef<string | null>(null);
  const [postComments, setPostComments] = useState<PostComment[]>(IS_NATIVE ? [] : initialPostComments);
  const postCommentsRef = useRef(postComments);
  postCommentsRef.current = postComments;
  // On web this holds the whole mock follow graph (initialFollows), same as
  // crews/adventures. On native it holds only the signed-in user's own
  // following edges (populated below) — never the full collection, which
  // isn't meant to be globally loaded the way the small demo ones are.
  const [follows, setFollows] = useState<Follow[]>(IS_NATIVE ? [] : initialFollows);
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
  // Web-mock master list of every review (native ignores this — it fetches
  // and caches per organizer instead, since Firestore has no reason to ship
  // every review in the app to every client up front).
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const reviewsRef = useRef(reviews);
  reviewsRef.current = reviews;
  const [reviewsByOrganizer, setReviewsByOrganizer] = useState<Record<string, Review[]>>({});
  // Web-mock master list, mirroring the reviews list above; native fetches
  // and writes straight through to Firestore instead.
  const [acknowledgements, setAcknowledgements] = useState<SafetyAcknowledgement[]>(initialAcknowledgements);
  const acknowledgementsRef = useRef(acknowledgements);
  acknowledgementsRef.current = acknowledgements;
  // Web-mock master list of every connection; native fetches per uid instead.
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const connectionsRef = useRef(connections);
  connectionsRef.current = connections;
  // Web-mock master list of every waitlist entry; native fetches per
  // adventure/user instead.
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialWaitlist);
  const waitlistRef = useRef(waitlist);
  waitlistRef.current = waitlist;
  // Adventure ids the current user is waitlisted for — refreshed on sign-in
  // and after joining/leaving a waitlist; drives the waitlist_spot_open
  // notification below without a per-render Firestore query.
  const [myWaitlistedAdventureIds, setMyWaitlistedAdventureIds] = useState<string[]>([]);
  // Web-mock master lists; native fetches straight from Firestore instead.
  const [reports, setReports] = useState<Report[]>(initialReports);
  const reportsRef = useRef(reports);
  reportsRef.current = reports;
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initialAuditLog);
  const auditLogRef = useRef(auditLog);
  auditLogRef.current = auditLog;
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
  // this runs on native regardless of sign-in state.
  useEffect(() => {
    if (!IS_NATIVE) return;
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
  // also runs on native regardless of sign-in state.
  const crewsErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!IS_NATIVE) return;
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
    if (!IS_NATIVE || !authenticated) return;
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

  // Real Firestore posts feed — publicly browsable like adventures/crews.
  useEffect(() => {
    if (!IS_NATIVE) return;
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

  // Real Firestore profile for the signed-in user, native only. Keeps
  // usersState[myId] in sync with whatever's actually saved server-side.
  useEffect(() => {
    if (!IS_NATIVE || !authenticated) return;
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
    if (IS_NATIVE) {
      const known = usersStateRef.current[myIdRef.current];
      try {
        await ensureProfileReal(myIdRef.current, { name: known?.name || 'Explorer', initials: known?.initials || 'ME' });
      } catch {
        // Non-fatal: the local defaultUser() fallback covers the gap until
        // the next successful sign-in retries this.
      }
    }
  }, []);

  const signInWithProvider = useCallback(
    async (provider: SocialProvider) => {
      // Google is real on native now that a SHA-1 fingerprint is registered.
      // Apple stays simulated everywhere (deferred; needs a native module and
      // an Apple Developer account), and Google stays simulated on web (no
      // web SDK wired up).
      if (IS_NATIVE && provider === 'google') {
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
    if (IS_NATIVE && adventuresErrorRef.current) {
      throw new ApiError(adventuresErrorRef.current);
    }
    return adventuresRef.current;
  }, []);

  const joinAdventure = useCallback(async (id: string) => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't join. Check your connection.");
    }
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      const target = adventuresRef.current.find((a) => a.id === id);
      if (!target || target.participantIds.includes(myIdRef.current)) return;
      if (target.spotsFilled >= target.spotsTotal) {
        throw new ApiError('This adventure is full.');
      }
      setAdventures((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, spotsFilled: a.spotsFilled + 1, participantIds: [...a.participantIds, myIdRef.current] } : a
        )
      );
      setAcknowledgements((prev) => [
        ...prev,
        { adventureId: id, userId: myIdRef.current, guidelinesSnapshot: target.guidelines, agreedAt: Date.now() },
      ]);
      return;
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setAdventures((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                spotsFilled: Math.max(0, a.spotsFilled - 1),
                participantIds: a.participantIds.filter((p) => p !== myIdRef.current),
              }
            : a
        )
      );
      return;
    }
    try {
      await leaveAdventureReal(id, myIdRef.current);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't leave. Check your connection.");
    }
  }, []);

  const toggleLike = useCallback((id: string) => {
    if (!IS_NATIVE) {
      setAdventures((prev) =>
        prev.map((a) => (a.id === id ? { ...a, likedByMe: !a.likedByMe, likeCount: a.likeCount + (a.likedByMe ? -1 : 1) } : a))
      );
      return;
    }
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      const guidelines: string[] = [];
      if (draft.noAlcohol) guidelines.push('No alcohol');
      if (draft.petsOk) guidelines.push('Pets ok');
      const spots = Math.max(1, parseInt(draft.spots, 10) || 1);
      const created: Adventure = {
        id: `a-${Date.now()}`,
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        difficulty: draft.difficulty,
        socialLevel: draft.socialLevel,
        pace: draft.pace,
        intensity: draft.intensity,
        transport: draft.transport,
        audience: draft.audience,
        dateLabel: formatDateLabel(draft.scheduledAt),
        meetingTime: formatTimeLabel(draft.scheduledAt),
        dateTimestamp: draft.scheduledAt,
        location: draft.location.trim() || 'Location TBC',
        latitude: draft.latitude,
        longitude: draft.longitude,
        durationHours: Math.max(1, parseInt(draft.durationHours, 10) || 1),
        priceKsh: parseInt(draft.priceKsh, 10) || 0,
        cancellationPolicy: draft.cancellationPolicy.trim(),
        spotsTotal: spots,
        spotsFilled: 0,
        childrenWelcome: draft.childrenWelcome,
        equipment: draft.equipment.trim(),
        included: draft.included.trim(),
        excluded: draft.excluded.trim(),
        organizerId: myIdRef.current,
        participantIds: [],
        guidelines,
        likedByMe: false,
        likeCount: 0,
        coordinate: { x: 0.5, y: 0.5 },
      };
      setAdventures((prev) => [created, ...prev]);
      return created;
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setAdventures((prev) =>
        prev.map((a) => (a.id === id ? { ...a, title: patch.title, dateLabel: patch.schedule, meetingTime: '' } : a))
      );
      return;
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setAdventures((prev) => prev.filter((a) => a.id !== id));
      return;
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
    if (IS_NATIVE && crewsErrorRef.current) {
      throw new ApiError(crewsErrorRef.current);
    }
    return crewsRef.current;
  }, []);

  const createCrew = useCallback(async ({ name, description }: { name: string; description: string }): Promise<Crew> => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't create your crew. Try again.");
    }
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      const created: Crew = {
        id: `c-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        avatarHue: Math.abs(name.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), 0)) % 360,
        memberIds: [myIdRef.current],
        ownerId: myIdRef.current,
        createdAt: Date.now(),
      };
      setCrews((prev) => [created, ...prev]);
      return created;
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setCrews((prev) =>
        prev.map((c) => (c.id === id && !c.memberIds.includes(myIdRef.current) ? { ...c, memberIds: [...c.memberIds, myIdRef.current] } : c))
      );
      return;
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setCrews((prev) => prev.map((c) => (c.id === id ? { ...c, memberIds: c.memberIds.filter((m) => m !== myIdRef.current) } : c)));
      return;
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
    if (IS_NATIVE && postsErrorRef.current) {
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
      if (!IS_NATIVE) {
        await delay(NETWORK_LATENCY_MS);
        const created: Post = {
          id: `p-${Date.now()}`,
          authorId: myIdRef.current,
          text: text.trim(),
          photos: photos && photos.length > 0 ? photos : undefined,
          adventureId: adventureId ?? null,
          crewId: crewId ?? null,
          likeCount: 0,
          likedByMe: false,
          commentCount: 0,
          shareCount: 0,
          createdAt: Date.now(),
        };
        setPosts((prev) => [created, ...prev]);
        return created;
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
    if (!IS_NATIVE) {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) } : p)));
      return;
    }
    const target = postsRef.current.find((p) => p.id === id);
    if (!target) return;
    toggleLikePostReal(id, myIdRef.current, target.likedByMe).catch(() => {
      // Best-effort, same as adventure likes — a failed like just doesn't flip.
    });
  }, []);

  const fetchCommentsForPost = useCallback(async (postId: string): Promise<PostComment[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return postCommentsRef.current.filter((c) => c.postId === postId);
    }
    try {
      return await fetchCommentsForPostReal(postId);
    } catch {
      return [];
    }
  }, []);

  const createComment = useCallback(async ({ postId, text }: { postId: string; text: string }): Promise<PostComment> => {
    if (simulateFailuresRef.current) {
      await delay(NETWORK_LATENCY_MS);
      throw new ApiError("Couldn't post your comment. Try again.");
    }
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      const created: PostComment = { id: `pc-${Date.now()}`, postId, authorId: myIdRef.current, text: text.trim(), createdAt: Date.now() };
      setPostComments((prev) => [...prev, created]);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)));
      return created;
    }
    try {
      return await createPostCommentReal({ postId, authorId: myIdRef.current, text: text.trim() });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't post your comment. Try again.");
    }
  }, []);

  // Fire-and-forget, same style as toggleLike/toggleLikePost — the caller
  // (lib/share.ts via the UI) already confirmed the share itself completed
  // before calling this, so a failed count-increment isn't worth surfacing.
  const recordShare = useCallback((id: string) => {
    if (!IS_NATIVE) {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, shareCount: p.shareCount + 1 } : p)));
      return;
    }
    incrementShareCountReal(id).catch(() => {});
  }, []);

  const fetchFollowersFor = useCallback(async (uid: string): Promise<Follow[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return followsRef.current.filter((f) => f.followingId === uid);
    }
    try {
      return await fetchFollowersReal(uid);
    } catch {
      return [];
    }
  }, []);

  const fetchFollowingFor = useCallback(async (uid: string): Promise<Follow[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return followsRef.current.filter((f) => f.followerId === uid);
    }
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
    const id = `${myIdRef.current}_${uid}`;
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      if (followsRef.current.some((f) => f.id === id)) return;
      setFollows((prev) => [...prev, { id, followerId: myIdRef.current, followingId: uid, createdAt: Date.now() }]);
      return;
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setFollows((prev) => prev.filter((f) => f.id !== id));
      return;
    }
    try {
      await unfollowUserReal(myIdRef.current, uid);
      setFollows((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't unfollow. Try again.");
    }
  }, []);

  const fetchConnectionsFor = useCallback(async (uid: string): Promise<Connection[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return connectionsRef.current.filter((c) => c.participantIds.includes(uid));
    }
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      const id = [myIdRef.current, toUserId].sort().join('_');
      if (connectionsRef.current.some((c) => c.id === id)) return;
      const created: Connection = {
        id,
        participantIds: [myIdRef.current, toUserId].sort() as [string, string],
        requesterId: myIdRef.current,
        recipientId: toUserId,
        status: 'pending',
        createdAt: Date.now(),
      };
      setConnections((prev) => [...prev, created]);
      return;
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? (accept ? { ...c, status: 'accepted' as const } : null) : c)).filter((c): c is Connection => c !== null)
      );
      return;
    }
    try {
      await respondToConnectionRequestReal(connectionId, accept);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't update the request. Try again.");
    }
  }, []);

  const refreshMyWaitlist = useCallback(async () => {
    const mine = !IS_NATIVE
      ? waitlistRef.current.filter((w) => w.userId === myIdRef.current)
      : await fetchWaitlistForUserReal(myIdRef.current).catch(() => []);
    setMyWaitlistedAdventureIds(mine.map((w) => w.adventureId));
  }, []);

  useEffect(() => {
    refreshMyWaitlist();
  }, [myId, refreshMyWaitlist]);

  const fetchWaitlist = useCallback(async (adventureId: string): Promise<WaitlistEntry[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return waitlistRef.current.filter((w) => w.adventureId === adventureId).sort((a, b) => a.createdAt - b.createdAt);
    }
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
      const id = `${adventureId}_${myIdRef.current}`;
      if (!IS_NATIVE) {
        await delay(NETWORK_LATENCY_MS);
        if (waitlistRef.current.some((w) => w.id === id)) return;
        setWaitlist((prev) => [...prev, { id, adventureId, userId: myIdRef.current, createdAt: Date.now() }]);
        await refreshMyWaitlist();
        return;
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
      if (!IS_NATIVE) {
        await delay(NETWORK_LATENCY_MS);
        setWaitlist((prev) => prev.filter((w) => !(w.adventureId === adventureId && w.userId === myIdRef.current)));
        await refreshMyWaitlist();
        return;
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
    async ({ targetType, targetId, reason, details }: { targetType: Report['targetType']; targetId: string; reason: Report['reason']; details: string }) => {
      if (simulateFailuresRef.current) {
        await delay(NETWORK_LATENCY_MS);
        throw new ApiError("Couldn't submit your report. Try again.");
      }
      if (!IS_NATIVE) {
        await delay(NETWORK_LATENCY_MS);
        const created: Report = {
          id: `report-${Date.now()}`,
          targetType,
          targetId,
          reporterId: myIdRef.current,
          reason,
          details: details.trim(),
          status: 'open',
          createdAt: Date.now(),
        };
        setReports((prev) => [created, ...prev]);
        return;
      }
      try {
        await submitReportReal({ targetType, targetId, reporterId: myIdRef.current, reason, details: details.trim() });
      } catch (e) {
        throw new ApiError(e instanceof Error ? e.message : "Couldn't submit your report. Try again.");
      }
    },
    []
  );

  const fetchOpenReports = useCallback(async (): Promise<Report[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return reportsRef.current.filter((r) => r.status === 'open');
    }
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
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status } : r)));
      setAuditLog((prev) => [
        { id: `audit-${Date.now()}`, actorId: myIdRef.current, action, targetType: report.targetType, targetId: report.targetId, createdAt: Date.now() },
        ...prev,
      ]);
      return;
    }
    try {
      await resolveReportReal(report.id, status);
      await recordAuditLogReal({ actorId: myIdRef.current, action, targetType: report.targetType, targetId: report.targetId });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't update the report. Try again.");
    }
  }, []);

  const fetchAuditLog = useCallback(async (): Promise<AuditLogEntry[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return auditLogRef.current;
    }
    try {
      return await fetchAuditLogReal();
    } catch {
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (threadId: string, text: string) => {
    const messageId = `m-${Date.now()}`;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: messageId, threadId, senderId: myIdRef.current, text, status: 'sent', createdAt: Date.now() },
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
    if (!IS_NATIVE) return;
    try {
      await updateProfileReal(myIdRef.current, patch);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't save your profile.");
    }
  }, []);

  const fetchOtherProfile = useCallback(async (uid: string): Promise<User> => {
    const cached = usersStateRef.current[uid];
    if (cached) return cached;
    if (IS_NATIVE) {
      try {
        const profile = await fetchProfileReal(uid);
        if (profile) {
          setUsersState((prev) => ({ ...prev, [uid]: profile }));
          return profile;
        }
      } catch {
        // Falls through to the generic placeholder below.
      }
    }
    const placeholder = { ...defaultUser(uid), name: 'Someone', initials: '?' };
    setUsersState((prev) => (prev[uid] ? prev : { ...prev, [uid]: placeholder }));
    return placeholder;
  }, []);

  const fetchReviewsForOrganizer = useCallback(async (organizerId: string): Promise<Review[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      const list = reviewsRef.current.filter((r) => r.organizerId === organizerId);
      setReviewsByOrganizer((prev) => ({ ...prev, [organizerId]: list }));
      return list;
    }
    try {
      const list = await fetchReviewsForOrganizerReal(organizerId);
      setReviewsByOrganizer((prev) => ({ ...prev, [organizerId]: list }));
      return list;
    } catch {
      return [];
    }
  }, []);

  const fetchReviewsForAdventure = useCallback(async (adventureId: string): Promise<Review[]> => {
    if (!IS_NATIVE) {
      await delay(NETWORK_LATENCY_MS);
      return reviewsRef.current.filter((r) => r.adventureId === adventureId);
    }
    try {
      return await fetchReviewsForAdventureReal(adventureId);
    } catch {
      return [];
    }
  }, []);

  const hasReviewed = useCallback(async (adventureId: string): Promise<boolean> => {
    const id = `${adventureId}_${myIdRef.current}`;
    if (!IS_NATIVE) return reviewsRef.current.some((r) => r.id === id);
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
      if (!IS_NATIVE) {
        await delay(NETWORK_LATENCY_MS);
        const id = `${adventureId}_${myIdRef.current}`;
        if (reviewsRef.current.some((r) => r.id === id)) return;
        const created: Review = {
          id,
          adventureId,
          organizerId,
          reviewerId: myIdRef.current,
          rating,
          text: text.trim(),
          photos: photos && photos.length > 0 ? photos : undefined,
          createdAt: Date.now(),
        };
        setReviews((prev) => [created, ...prev]);
        setReviewsByOrganizer((prev) => ({ ...prev, [organizerId]: [created, ...(prev[organizerId] ?? [])] }));
        return;
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
  }, [posts, crews, myId]);

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
    if (!IS_NATIVE) return acknowledgementsRef.current.filter((a) => a.adventureId === adventureId);
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
      fetchCommentsForPost,
      createComment,
      recordShare,
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
      fetchCommentsForPost,
      createComment,
      recordShare,
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
