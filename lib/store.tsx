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
import { timestampForBucket } from './dateBuckets';
import { ME_ID, initialAdventures, initialThreads, users } from './mockData';
import { ensureProfileReal, fetchProfileReal, subscribeProfileReal, updateProfileReal } from './profileProvider';
import { Adventure, AppNotification, DEFAULT_PRIVACY, DeepLink, NewAdventureDraft, NotificationType, Thread, User } from './types';

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
    connectionsCount: 0,
    crewIds: [],
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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [myId, setMyId] = useState(ME_ID);
  const [adventures, setAdventures] = useState<Adventure[]>(IS_NATIVE ? [] : initialAdventures);
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
      return;
    }
    try {
      await joinAdventureReal(id, myIdRef.current);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : "Couldn't join. Check your connection.");
    }
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
        category: draft.category,
        difficulty: draft.difficulty,
        socialLevel: draft.socialLevel,
        pace: draft.pace,
        intensity: draft.intensity,
        transport: draft.transport,
        audience: draft.audience,
        dateLabel: draft.schedule.trim() || 'Date TBC',
        meetingTime: '',
        dateTimestamp: timestampForBucket(draft.when),
        location: 'Nairobi area',
        latitude: null,
        longitude: null,
        priceKsh: parseInt(draft.priceKsh, 10) || 0,
        spotsTotal: spots,
        spotsFilled: 0,
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
    }),
    [
      ready,
      authenticated,
      onboarded,
      myId,
      adventures,
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
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
