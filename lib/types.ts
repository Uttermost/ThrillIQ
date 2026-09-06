export type ActivityType = 'Hike' | 'Road trip';
export type Difficulty = 'Beginner' | 'Moderate' | 'Challenging';
export type WhenBucket = 'This week' | 'This month' | 'Later';
export type SocialLevel = 'Quiet' | 'Social' | 'Very Social';
export type Pace = 'Relaxed' | 'Moderate' | 'Fast';
export type Intensity = 'Low' | 'Medium' | 'High';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ProfileTag = 'Photography' | 'Networking' | 'Families' | 'Solo adventures' | 'Couples';
export type ProfileVisibility = 'Everyone' | 'Connections' | 'Participants';
export type LocationVisibility = 'City' | 'Approximate' | 'Hidden';
export type ConnectPermission = 'Everyone' | 'Participants' | 'Nobody';
export type MessagePermission = 'Connections' | 'Participants' | 'Nobody';

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  locationVisibility: LocationVisibility;
  whoCanConnect: ConnectPermission;
  showCompletedAdventures: boolean;
  showCrews: boolean;
  showConnections: boolean;
  whoCanMessage: MessagePermission;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: 'Everyone',
  locationVisibility: 'City',
  whoCanConnect: 'Everyone',
  showCompletedAdventures: true,
  showCrews: true,
  showConnections: true,
  whoCanMessage: 'Participants',
};

export interface User {
  id: string;
  name: string;
  initials: string;
  role: string;
  location: string;
  avatarHue: number;
  username?: string;
  bio?: string;
  interests?: string[];
  adventureCategories?: ActivityType[];
  preferredDifficulty?: Difficulty | null;
  preferredSocialLevel?: SocialLevel | null;
  preferredPace?: Pace | null;
  preferredIntensity?: Intensity | null;
  experienceLevel?: ExperienceLevel | null;
  tags?: ProfileTag[];
  completedAdventuresCount?: number;
  connectionsCount?: number;
  crewIds?: string[];
  privacy?: PrivacySettings;
}

export interface Adventure {
  id: string;
  title: string;
  type: ActivityType;
  difficulty: Difficulty;
  dateLabel: string;
  meetingTime: string;
  // Approximate, filterable date — organizers pick a "This week / This
  // month / Later" bucket rather than an exact calendar date; dateLabel
  // stays their own free-text description for display.
  dateTimestamp: number;
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

export type NotificationType = 'adventure_cancelled' | 'adventure_updated' | 'participant_joined' | 'new_message';

export interface DeepLink {
  screen: 'adventure' | 'organizer' | 'chat';
  id: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  deepLink: DeepLink | null;
}

export interface NewAdventureDraft {
  title: string;
  schedule: string;
  priceKsh: string;
  spots: string;
  type: ActivityType;
  difficulty: Difficulty;
  when: WhenBucket;
  noAlcohol: boolean;
  petsOk: boolean;
}
