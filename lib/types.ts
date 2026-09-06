export type ActivityType = 'Hike' | 'Road trip';
export type Difficulty = 'Beginner' | 'Moderate' | 'Challenging';

export interface User {
  id: string;
  name: string;
  initials: string;
  role: string;
  location: string;
  avatarHue: number;
}

export interface Adventure {
  id: string;
  title: string;
  type: ActivityType;
  difficulty: Difficulty;
  dateLabel: string;
  meetingTime: string;
  location: string;
  priceKsh: number;
  spotsTotal: number;
  spotsFilled: number;
  organizerId: string;
  participantIds: string[];
  guidelines: string[];
  likedByMe: boolean;
  likeCount: number;
  coordinate: { x: number; y: number };
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  status: 'sent' | 'failed';
  createdAt: number;
}

export interface Thread {
  id: string;
  adventureId: string;
  otherUserId: string;
  unread: boolean;
  messages: ChatMessage[];
}

export interface NewAdventureDraft {
  title: string;
  schedule: string;
  priceKsh: string;
  spots: string;
  type: ActivityType;
  difficulty: Difficulty;
  noAlcohol: boolean;
  petsOk: boolean;
}
