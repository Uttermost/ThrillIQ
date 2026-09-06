import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ME_ID, initialAdventures, initialThreads, users } from './mockData';
import { Adventure, NewAdventureDraft, Thread, User } from './types';

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
  threads: Thread[];
  simulateFailures: boolean;
}

interface AppContextValue extends AppState {
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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [adventures, setAdventures] = useState<Adventure[]>(initialAdventures);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [usersState, setUsersState] = useState<Record<string, User>>(users);
  const [simulateFailures, setSimulateFailures] = useState(false);
  const simulateFailuresRef = useRef(simulateFailures);
  simulateFailuresRef.current = simulateFailures;
  const adventuresRef = useRef(adventures);
  adventuresRef.current = adventures;
  const threadsRef = useRef(threads);
  threadsRef.current = threads;

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

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    } catch {
      // Non-fatal: onboarding state just won't persist across restarts.
    }
  }, []);

  const updateMyName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const initials = trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
    setUsersState((prev) => ({ ...prev, [ME_ID]: { ...prev[ME_ID], name: trimmed, initials: initials || prev[ME_ID].initials } }));
  }, []);

  const completeSignIn = useCallback(async () => {
    setAuthenticated(true);
    try {
      await AsyncStorage.setItem(AUTHENTICATED_KEY, 'true');
    } catch {
      // Non-fatal: session just won't persist across restarts.
    }
  }, []);

  const signInWithProvider = useCallback(
    async (_provider: SocialProvider) => {
      await delay(NETWORK_LATENCY_MS);
      if (simulateFailuresRef.current) {
        throw new ApiError("Couldn't sign in. Try again.");
      }
      await completeSignIn();
    },
    [completeSignIn]
  );

  const signInWithEmail = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      await delay(NETWORK_LATENCY_MS);
      if (simulateFailuresRef.current) {
        throw new ApiError("Couldn't sign in. Check your details and try again.");
      }
      if (!email.includes('@') || password.length < 6) {
        throw new ApiError('Enter a valid email and a password of at least 6 characters.');
      }
      updateMyName(name);
      await completeSignIn();
    },
    [completeSignIn, updateMyName]
  );

  const sendPhoneCode = useCallback(async (phone: string) => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't send the code. Check your connection.");
    }
    if (phone.replace(/\D/g, '').length < 9) {
      throw new ApiError('Enter a valid phone number.');
    }
  }, []);

  const verifyPhoneCode = useCallback(
    async ({ name, code }: { phone: string; name: string; code: string }) => {
      await delay(NETWORK_LATENCY_MS);
      if (simulateFailuresRef.current) {
        throw new ApiError('Incorrect code. Check your messages and try again.');
      }
      if (code.length !== 6) {
        throw new ApiError('Enter the 6-digit code.');
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
  }, []);

  const fetchAdventures = useCallback(async () => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't load adventures");
    }
    return adventuresRef.current;
  }, []);

  const joinAdventure = useCallback(async (id: string) => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't join. Check your connection.");
    }
    const target = adventuresRef.current.find((a) => a.id === id);
    if (!target || target.participantIds.includes(ME_ID)) return;
    if (target.spotsFilled >= target.spotsTotal) {
      throw new ApiError('This adventure is full.');
    }
    setAdventures((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, spotsFilled: a.spotsFilled + 1, participantIds: [...a.participantIds, ME_ID] } : a
      )
    );
  }, []);

  const leaveAdventure = useCallback(async (id: string) => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't leave. Check your connection.");
    }
    setAdventures((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, spotsFilled: Math.max(0, a.spotsFilled - 1), participantIds: a.participantIds.filter((p) => p !== ME_ID) }
          : a
      )
    );
  }, []);

  const toggleLike = useCallback((id: string) => {
    setAdventures((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, likedByMe: !a.likedByMe, likeCount: a.likeCount + (a.likedByMe ? -1 : 1) }
          : a
      )
    );
  }, []);

  const createAdventure = useCallback(async (draft: NewAdventureDraft) => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't publish. Your draft wasn't lost.");
    }
    const guidelines: string[] = [];
    if (draft.noAlcohol) guidelines.push('No alcohol');
    if (draft.petsOk) guidelines.push('Pets ok');
    const spots = Math.max(1, parseInt(draft.spots, 10) || 1);
    const created: Adventure = {
      id: `a-${Date.now()}`,
      title: draft.title.trim(),
      type: draft.type,
      difficulty: draft.difficulty,
      dateLabel: draft.schedule.trim() || 'Date TBC',
      meetingTime: '',
      location: 'Nairobi area',
      priceKsh: parseInt(draft.priceKsh, 10) || 0,
      spotsTotal: spots,
      spotsFilled: 0,
      organizerId: ME_ID,
      participantIds: [],
      guidelines,
      likedByMe: false,
      likeCount: 0,
      coordinate: { x: 0.5, y: 0.5 },
    };
    setAdventures((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateAdventure = useCallback(async (id: string, patch: { title: string; schedule: string }) => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't save changes.");
    }
    setAdventures((prev) =>
      prev.map((a) => (a.id === id ? { ...a, title: patch.title, dateLabel: patch.schedule, meetingTime: '' } : a))
    );
  }, []);

  const cancelAdventure = useCallback(async (id: string) => {
    await delay(NETWORK_LATENCY_MS);
    if (simulateFailuresRef.current) {
      throw new ApiError("Couldn't cancel. Try again.");
    }
    setAdventures((prev) => prev.filter((a) => a.id !== id));
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
                { id: messageId, threadId, senderId: ME_ID, text, status: 'sent', createdAt: Date.now() },
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
      adventures,
      threads,
      simulateFailures,
      me: usersState[ME_ID],
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
    }),
    [
      ready,
      authenticated,
      onboarded,
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
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
