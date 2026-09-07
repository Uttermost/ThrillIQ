// Adventure category — the full taxonomy from the UI/UX spec (§14-15).
// Supersedes the old two-value ActivityType.
export type Category = 'Hiking' | 'Road trip' | 'Camping' | 'Cycling' | 'Wellness' | 'Water' | 'Photography' | 'Networking' | 'Social' | 'Other';
export type Difficulty = 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
export type WhenBucket = 'This week' | 'This month' | 'Later';
// Granular date-filter taxonomy for Discover (spec §15) — distinct from
// WhenBucket, which is only the coarse fallback used when deriving a
// representative timestamp for legacy/native-default data.
export type WhenFilter = 'Today' | 'Tomorrow' | 'This weekend' | 'This week' | 'This month' | 'Later' | 'Custom';
export type SocialLevel = 'Quiet' | 'Social' | 'Very Social';
export type Pace = 'Relaxed' | 'Moderate' | 'Fast';
export type Intensity = 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
export type Transport = 'Own transport' | 'Organizer transport' | 'Carpool available' | 'Bus/van' | '4x4';
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
  // Private to the account holder — never shown on anyone else's view of
  // this profile. Surfaced back to the user themselves as a safety
  // reminder on adventures they've joined. Deliberately just stored
  // contact info, not an "SOS" feature — no backend exists to actually
  // alert this contact, so nothing here should imply that it would.
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  privacy?: PrivacySettings;
  // Never client-settable — see firestore.rules, which blocks a user from
  // changing this on their own doc. Only ever set out-of-band (seeded here,
  // or by a human directly in the Firebase console in a real deployment).
  isAdmin?: boolean;
}

export type ReportTargetType = 'adventure' | 'user' | 'review';
export type ReportReason = 'Spam' | 'Inappropriate content' | 'Safety concern' | 'Other';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reporterId: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetType: ReportTargetType;
  targetId: string;
  createdAt: number;
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
  // Whole hours; multi-day adventures (e.g. an overnight safari) just use a
  // large value (e.g. 48) rather than a separate day-count field.
  durationHours: number;
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

export type NotificationType =
  | 'adventure_cancelled'
  | 'adventure_updated'
  | 'participant_joined'
  | 'new_message'
  | 'adventure_reminder'
  | 'review_prompt'
  | 'waitlist_spot_open';

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

export interface WaitlistEntry {
  id: string;
  adventureId: string;
  userId: string;
  createdAt: number;
}

export type ConnectionStatus = 'pending' | 'accepted';

export interface Connection {
  id: string;
  // Sorted [a, b] pair, purely so a single array-contains query finds every
  // connection involving a given uid regardless of who sent the request.
  participantIds: [string, string];
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  createdAt: number;
}

export interface Crew {
  id: string;
  name: string;
  description: string;
  avatarHue: number;
  memberIds: string[];
  ownerId: string;
  createdAt: number;
}

// A timestamped, versioned record of a participant agreeing to an
// adventure's guidelines at join time — an auditable safety trail, not
// just the in-the-moment checkbox state on the join screen.
export interface SafetyAcknowledgement {
  adventureId: string;
  userId: string;
  guidelinesSnapshot: string[];
  agreedAt: number;
}

export interface Review {
  id: string;
  adventureId: string;
  organizerId: string;
  reviewerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  // Data URIs (not CDN-backed URLs) — there's no Firebase Storage bucket
  // deployed for this project, so photos are downscaled client-side and
  // stored inline. Real participant-taken photos, just not CDN-hosted;
  // revisit once Storage is deployed and this can move to real URLs.
  photos?: string[];
  createdAt: number;
}

export interface NewAdventureDraft {
  title: string;
  description: string;
  // Real epoch ms, set via native date/time pickers — dateLabel, meetingTime
  // and the WhenBucket used for filtering are all derived from this rather
  // than entered separately.
  scheduledAt: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  durationHours: string;
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
  childrenWelcome: boolean;
  equipment: string;
  included: string;
  excluded: string;
  noAlcohol: boolean;
  petsOk: boolean;
}
