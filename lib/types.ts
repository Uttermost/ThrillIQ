// Adventure category — the full taxonomy from the UI/UX spec (§14-15).
// Supersedes the old two-value ActivityType.
export type Category = 'Hiking' | 'Road trip' | 'Camping' | 'Cycling' | 'Wellness' | 'Water' | 'Photography' | 'Networking' | 'Social' | 'Other';
export type Difficulty = 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
export type WhenBucket = 'This week' | 'This month' | 'Later';
export type SocialLevel = 'Quiet' | 'Social' | 'Very Social';
export type Pace = 'Relaxed' | 'Moderate' | 'Fast';
export type Intensity = 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
export type Transport = 'Own transport' | 'Organizer transport' | 'Carpool available';
export type Audience = 'Solo friendly' | 'Couples' | 'Families' | 'Beginners' | 'Experienced' | 'Networking';
export type PriceBand = 'Free' | 'Under 1,000' | '1,000–3,000' | '3,000–5,000' | '5,000+';
export type Region = 'Nairobi' | 'Kiambu' | 'Kajiado' | 'Nakuru' | 'Naivasha' | 'Machakos';
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
  adventureCategories?: Category[];
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
  description: string;
  category: Category;
  difficulty: Difficulty;
  socialLevel: SocialLevel;
  pace: Pace;
  intensity: Intensity;
  transport: Transport;
  audience: Audience[];
  dateLabel: string;
  meetingTime: string;
  // Approximate, filterable date — organizers pick a "This week / This
  // month / Later" bucket rather than an exact calendar date; dateLabel
  // stays their own free-text description for display.
  dateTimestamp: number;
  location: string;
  // Real coordinates for "near me"/distance filtering — optional because no
  // location picker exists yet to populate them; nothing reads these until
  // one does, so a missing value here isn't a bug to chase.
  latitude: number | null;
  longitude: number | null;
  priceKsh: number;
  cancellationPolicy: string;
  spotsTotal: number;
  spotsFilled: number;
  childrenWelcome: boolean;
  equipment: string;
  included: string;
  excluded: string;
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

export interface Review {
  id: string;
  adventureId: string;
  organizerId: string;
  reviewerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: number;
}

export interface NewAdventureDraft {
  title: string;
  description: string;
  schedule: string;
  location: string;
  priceKsh: string;
  cancellationPolicy: string;
  spots: string;
  category: Category;
  difficulty: Difficulty;
  socialLevel: SocialLevel;
  pace: Pace;
  intensity: Intensity;
  transport: Transport;
  audience: Audience[];
  when: WhenBucket;
  childrenWelcome: boolean;
  equipment: string;
  included: string;
  excluded: string;
  noAlcohol: boolean;
  petsOk: boolean;
}
