import {
  AuditLogEntry,
  Connection,
  Crew,
  DEFAULT_PRIVACY,
  Adventure,
  Follow,
  Post,
  PostComment,
  PostSave,
  Report,
  Repost,
  Review,
  SafetyAcknowledgement,
  Thread,
  User,
  WaitlistEntry,
} from './types';

function pairId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

export const ME_ID = 'u-vincent';

const DAY_MS = 24 * 60 * 60 * 1000;
const inDays = (n: number) => Date.now() + n * DAY_MS;

export const users: Record<string, User> = {
  [ME_ID]: {
    id: ME_ID,
    name: 'Vincent Macharia',
    initials: 'VM',
    role: 'Explorer',
    location: 'Nairobi',
    avatarHue: 205,
    username: 'vincentm',
    bio: 'Weekend hiker, always up for sunrise starts.',
    interests: ['Hiking', 'Photography'],
    adventureCategories: ['Hiking'],
    preferredDifficulty: 'Moderate',
    preferredSocialLevel: 'Social',
    preferredPace: 'Moderate',
    preferredIntensity: 'Moderate',
    experienceLevel: 'Intermediate',
    tags: ['Photography', 'Solo adventures'],
    completedAdventuresCount: 4,
    privacy: DEFAULT_PRIVACY,
    isAdmin: true,
  },
  'u-tom': {
    id: 'u-tom',
    name: 'Tom Wanjiru',
    initials: 'TW',
    role: 'Organizer',
    location: 'Naivasha',
    avatarHue: 205,
    username: 'tomw',
    bio: 'Runs weekend road trips around the Rift Valley.',
    interests: ['Road trips', 'Cycling'],
    adventureCategories: ['Road trip'],
    preferredDifficulty: 'Moderate',
    preferredSocialLevel: 'Very Social',
    preferredPace: 'Moderate',
    preferredIntensity: 'Moderate',
    experienceLevel: 'Advanced',
    tags: ['Networking', 'Families'],
    completedAdventuresCount: 18,
    privacy: DEFAULT_PRIVACY,
  },
  'u-kevin': {
    id: 'u-kevin',
    name: 'Kevin Otieno',
    initials: 'KO',
    role: 'Explorer',
    location: 'Nairobi',
    avatarHue: 28,
    username: 'kevino',
    bio: 'New to hiking, learning the trails around Nairobi.',
    interests: ['Hiking'],
    adventureCategories: ['Hiking'],
    preferredDifficulty: 'Easy',
    preferredSocialLevel: 'Social',
    preferredPace: 'Relaxed',
    preferredIntensity: 'Easy',
    experienceLevel: 'Beginner',
    tags: [],
    completedAdventuresCount: 1,
    privacy: DEFAULT_PRIVACY,
  },
  'u-amina': {
    id: 'u-amina',
    name: 'Amina Kones',
    initials: 'AK',
    role: 'Explorer',
    location: 'Nairobi',
    avatarHue: 28,
    username: 'aminak',
    bio: 'Forest walks and quiet trails over crowded ones.',
    interests: ['Hiking', 'Nature'],
    adventureCategories: ['Hiking'],
    preferredDifficulty: 'Easy',
    preferredSocialLevel: 'Quiet',
    preferredPace: 'Relaxed',
    preferredIntensity: 'Easy',
    experienceLevel: 'Intermediate',
    tags: ['Solo adventures'],
    completedAdventuresCount: 6,
    privacy: DEFAULT_PRIVACY,
  },
  'u-brian': {
    id: 'u-brian',
    name: 'Brian K.',
    initials: 'BK',
    role: 'Explorer',
    location: 'Nairobi',
    avatarHue: 150,
    username: 'briank',
    bio: 'Hikes on weekends, road trips whenever possible.',
    interests: ['Hiking', 'Road trips'],
    adventureCategories: ['Hiking', 'Road trip'],
    preferredDifficulty: 'Moderate',
    preferredSocialLevel: 'Social',
    preferredPace: 'Moderate',
    preferredIntensity: 'Moderate',
    experienceLevel: 'Intermediate',
    tags: ['Couples'],
    completedAdventuresCount: 3,
    privacy: DEFAULT_PRIVACY,
  },
};

export const initialAdventures: Adventure[] = [
  {
    id: 'a-ngong',
    title: 'Ngong Hills sunrise hike',
    description:
      'We climb the seven hills before dawn to catch sunrise over the Rift Valley. Steady moderate pace with a couple of short breaks — the view at the top is worth the early start.',
    category: 'Hiking',
    difficulty: 'Moderate',
    socialLevel: 'Social',
    pace: 'Moderate',
    intensity: 'Moderate',
    transport: 'Own transport',
    audience: ['Solo friendly', 'Experienced'],
    dateLabel: 'Sat, Sep 12',
    meetingTime: '6:00am',
    dateTimestamp: inDays(3),
    location: 'Ngong Hills, Kajiado',
    latitude: -1.3833,
    longitude: 36.6333,
    durationHours: 4,
    priceKsh: 1500,
    cancellationPolicy: 'Full refund if cancelled 24 hours before start. Weather cancellations are rescheduled.',
    spotsTotal: 1,
    spotsFilled: 1,
    childrenWelcome: false,
    equipment: 'Hiking shoes, headlamp, 2L water, light jacket',
    included: 'Guide, group photos',
    excluded: 'Transport, food and drinks',
    organizerId: ME_ID,
    participantIds: ['u-brian'],
    guidelines: ['No alcohol', 'Bring 2L water'],
    likedByMe: false,
    likeCount: 12,
    coordinate: { x: 0.42, y: 0.58 },
  },
  {
    id: 'a-naivasha',
    title: 'Naivasha road trip',
    description:
      "A relaxed day out to Lake Naivasha — boat ride past the hippos, lunch by the water, and a walk around Crescent Island if there's time. Easy pace, good for a first road trip with the group.",
    category: 'Road trip',
    difficulty: 'Moderate',
    socialLevel: 'Very Social',
    pace: 'Relaxed',
    intensity: 'Easy',
    transport: 'Carpool available',
    audience: ['Couples', 'Families', 'Beginners'],
    dateLabel: 'Sun, Sep 13',
    meetingTime: '7:00am',
    dateTimestamp: inDays(6),
    location: 'Lake Naivasha',
    latitude: -0.7167,
    longitude: 36.4333,
    durationHours: 9,
    priceKsh: 4500,
    cancellationPolicy: 'Refundable up to 48 hours before departure.',
    spotsTotal: 20,
    spotsFilled: 11,
    childrenWelcome: true,
    equipment: 'Comfortable walking shoes, sunscreen, camera',
    included: 'Boat ride, park entry',
    excluded: 'Lunch, personal expenses',
    organizerId: 'u-tom',
    participantIds: ['u-kevin', 'u-brian'],
    guidelines: ['Carpool meets at Total station', 'Bring a valid ID'],
    likedByMe: false,
    likeCount: 7,
    coordinate: { x: 0.22, y: 0.34 },
  },
  {
    id: 'a-karura',
    title: 'Karura Forest evening walk',
    description:
      'An easy loop through Karura Forest as the light goes golden — flat trails, a stop at the waterfall, and good company. Great if you want to try a group hike without committing to a big one.',
    category: 'Hiking',
    difficulty: 'Easy',
    socialLevel: 'Social',
    pace: 'Relaxed',
    intensity: 'Easy',
    transport: 'Own transport',
    audience: ['Solo friendly', 'Families', 'Beginners'],
    dateLabel: 'Wed, Sep 16',
    meetingTime: '5:30pm',
    dateTimestamp: inDays(12),
    location: 'Karura Forest, Nairobi',
    latitude: -1.2472,
    longitude: 36.8319,
    durationHours: 2,
    priceKsh: 300,
    cancellationPolicy: 'Free cancellation any time before start.',
    spotsTotal: 15,
    spotsFilled: 4,
    childrenWelcome: true,
    equipment: 'Closed shoes, water bottle',
    included: 'Guide',
    excluded: 'Food, park entry fee',
    organizerId: 'u-amina',
    participantIds: [],
    guidelines: ['No littering', 'Closed shoes recommended'],
    likedByMe: true,
    likeCount: 3,
    coordinate: { x: 0.6, y: 0.22 },
  },
  {
    id: 'a-amboseli',
    title: 'Amboseli weekend safari',
    description:
      "A two-day trip to Amboseli for elephants against the backdrop of Kilimanjaro. We travel down together, camp overnight, and do two game drives. This one's physically easier than it sounds — the challenge is the early starts and the road, not the walking.",
    category: 'Road trip',
    difficulty: 'Challenging',
    socialLevel: 'Social',
    pace: 'Moderate',
    intensity: 'Challenging',
    transport: 'Organizer transport',
    audience: ['Experienced', 'Couples'],
    dateLabel: 'Fri, Sep 25',
    meetingTime: '5:00am',
    dateTimestamp: inDays(40),
    location: 'Amboseli National Park',
    latitude: -2.6527,
    longitude: 37.2606,
    durationHours: 48,
    priceKsh: 12000,
    cancellationPolicy: '50% refund if cancelled 7+ days before departure; non-refundable within 7 days.',
    spotsTotal: 8,
    spotsFilled: 8,
    childrenWelcome: false,
    equipment: 'Warm clothing, passport or ID, camera, sunscreen',
    included: 'Transport, camping gear, two game drives, park fees',
    excluded: 'Personal travel insurance, souvenirs',
    organizerId: 'u-tom',
    participantIds: [],
    guidelines: ['Passport or ID required', 'Full payment to organizer before departure'],
    likedByMe: false,
    likeCount: 21,
    coordinate: { x: 0.75, y: 0.7 },
  },
];

// Reviews reference past, already-completed occurrences of each organizer's
// adventures (consistent with their completedAdventuresCount above) rather
// than the four upcoming listings in initialAdventures — none of those have
// happened yet, so nothing in the current listing is reviewable.
export const initialReviews: Review[] = [
  {
    id: 'a-past-1_u-kevin',
    adventureId: 'a-past-1',
    organizerId: 'u-tom',
    reviewerId: 'u-kevin',
    rating: 5,
    text: 'Tom is a fantastic organizer — the Rift Valley trip was unforgettable.',
    createdAt: inDays(-10),
  },
  {
    id: 'a-past-2_u-brian',
    adventureId: 'a-past-2',
    organizerId: 'u-tom',
    reviewerId: 'u-brian',
    rating: 4,
    text: 'Well organized, though we started a bit later than planned.',
    createdAt: inDays(-25),
  },
  {
    id: `a-past-3_${ME_ID}`,
    adventureId: 'a-past-3',
    organizerId: 'u-amina',
    reviewerId: ME_ID,
    rating: 5,
    text: 'Amina runs a calm, welcoming hike — great for anyone new to it.',
    createdAt: inDays(-6),
  },
  {
    id: 'a-past-4_u-kevin',
    adventureId: 'a-past-4',
    organizerId: 'u-amina',
    reviewerId: 'u-kevin',
    rating: 5,
    text: 'Great pace, learned a lot about the forest trails.',
    createdAt: inDays(-40),
  },
];

export const initialPosts: Post[] = [
  {
    id: 'p-brian-naivasha',
    authorId: 'u-brian',
    text: "Counting down to the Naivasha trip — first time seeing the hippos up close, can't wait.",
    adventureId: 'a-naivasha',
    likedByMe: true,
    likeCount: 4,
    commentCount: 3,
    shareCount: 1,
    createdAt: inDays(-1),
  },
  {
    id: 'p-tom-amboseli',
    authorId: 'u-tom',
    text: 'Packing the camping gear for Amboseli this weekend — bring warm layers, it gets cold once the sun drops.',
    adventureId: 'a-amboseli',
    likedByMe: false,
    likeCount: 9,
    commentCount: 1,
    shareCount: 3,
    createdAt: inDays(-2),
  },
  {
    id: 'p-amina-forest',
    authorId: 'u-amina',
    text: 'Karura in the evening light is unbeatable this time of year. If you have never done a forest walk, this is the season for it.',
    adventureId: null,
    likedByMe: false,
    likeCount: 6,
    commentCount: 0,
    shareCount: 0,
    createdAt: inDays(-4),
  },
  {
    id: 'p-kevin-gear',
    authorId: 'u-kevin',
    text: 'Anyone doing the Naivasha trip have a spare pair of trekking poles I could borrow? Mine broke on the last trail.',
    adventureId: 'a-naivasha',
    likedByMe: false,
    likeCount: 1,
    commentCount: 0,
    shareCount: 0,
    createdAt: inDays(-5),
  },
  {
    id: 'p-amina-crew-sunrise',
    authorId: 'u-amina',
    text: "This Saturday's Sunrise Hikers meetup is on — same trailhead as last time, 6am sharp. Bring a headlamp.",
    adventureId: null,
    crewId: 'c-sunrise-hikers',
    likedByMe: false,
    likeCount: 3,
    commentCount: 0,
    shareCount: 0,
    createdAt: inDays(-3),
  },
];

// A repost is its own Feed item, distinct from Post.shareCount above (which
// only counts external/in-thread shares). Kevin reposting Brian's post here
// is deliberately asymmetric from initialConnections/initialFollows — it
// exercises the "reposted by someone I don't already follow" case too.
export const initialReposts: Repost[] = [
  {
    id: 'u-kevin_p-brian-naivasha',
    userId: 'u-kevin',
    postId: 'p-brian-naivasha',
    comment: 'This is exactly the trip I was asking about gear for.',
    likedByMe: false,
    likeCount: 2,
    createdAt: inDays(-1),
  },
];

// Private to the saving user — unlike reposts above, never shown to anyone
// else. Vincent (ME_ID) saving Tom's post is the only seed here since it's
// the only one that's actually visible/testable from the signed-in demo
// account's own "Saved posts" list.
export const initialPostSaves: PostSave[] = [{ id: `${ME_ID}_p-tom-amboseli`, userId: ME_ID, postId: 'p-tom-amboseli', createdAt: inDays(-1) }];

// One comment doc per (postId, author) pair reflected in the commentCount
// values above — kept in sync by hand here since mock data has no batch
// write to enforce it the way postCommentsProvider.native.ts does.
export const initialPostComments: PostComment[] = [
  {
    id: 'pc-tom-naivasha-1',
    postId: 'p-brian-naivasha',
    authorId: 'u-tom',
    text: "It's a great spot — bring a zoom lens if you have one, the hippos keep their distance.",
    likedByMe: true,
    likeCount: 2,
    createdAt: inDays(-1) + 1000 * 60 * 30,
  },
  {
    id: 'pc-kevin-naivasha-1',
    postId: 'p-brian-naivasha',
    authorId: 'u-kevin',
    text: 'Same, first time for me too. See you there!',
    likedByMe: false,
    likeCount: 0,
    createdAt: inDays(-1) + 1000 * 60 * 90,
  },
  {
    id: 'pc-brian-naivasha-reply-1',
    postId: 'p-brian-naivasha',
    authorId: 'u-brian',
    parentCommentId: 'pc-tom-naivasha-1',
    text: 'Good shout, packing the 200mm.',
    likedByMe: false,
    likeCount: 1,
    createdAt: inDays(-1) + 1000 * 60 * 100,
  },
  {
    id: `pc-${ME_ID}-amboseli-1`,
    postId: 'p-tom-amboseli',
    authorId: ME_ID,
    text: 'Good call on the layers — it was freezing at night last time.',
    likedByMe: false,
    likeCount: 1,
    createdAt: inDays(-2) + 1000 * 60 * 45,
  },
];

// One per existing (adventureId, participant) pair in initialAdventures —
// every seeded participant already "agreed" when they joined. New joins
// during a session record their own via store.tsx's joinAdventure.
export const initialAcknowledgements: SafetyAcknowledgement[] = [
  { adventureId: 'a-ngong', userId: 'u-brian', guidelinesSnapshot: ['No alcohol', 'Bring 2L water'], agreedAt: inDays(-2) },
  {
    adventureId: 'a-naivasha',
    userId: 'u-kevin',
    guidelinesSnapshot: ['Carpool meets at Total station', 'Bring a valid ID'],
    agreedAt: inDays(-1),
  },
  {
    adventureId: 'a-naivasha',
    userId: 'u-brian',
    guidelinesSnapshot: ['Carpool meets at Total station', 'Bring a valid ID'],
    agreedAt: inDays(-1),
  },
];

export const initialCrews: Crew[] = [
  {
    id: 'c-sunrise-hikers',
    name: 'Sunrise Hikers Nairobi',
    description: 'Early risers who chase sunrise views on Nairobi-area trails. Casual, weekly Saturday hikes.',
    avatarHue: 205,
    memberIds: [ME_ID, 'u-brian', 'u-amina'],
    ownerId: ME_ID,
    createdAt: inDays(-60),
  },
  {
    id: 'c-rift-valley-roadtrippers',
    name: 'Rift Valley Roadtrippers',
    description: 'Weekend road trips around the Rift Valley — Naivasha, Nakuru, and beyond.',
    avatarHue: 28,
    memberIds: ['u-tom', 'u-brian', 'u-kevin'],
    ownerId: 'u-tom',
    createdAt: inDays(-120),
  },
];

export const initialConnections: Connection[] = [
  {
    id: pairId(ME_ID, 'u-brian'),
    participantIds: [ME_ID, 'u-brian'].sort() as [string, string],
    requesterId: ME_ID,
    recipientId: 'u-brian',
    status: 'accepted',
    createdAt: inDays(-30),
  },
  {
    id: pairId(ME_ID, 'u-amina'),
    participantIds: [ME_ID, 'u-amina'].sort() as [string, string],
    requesterId: 'u-amina',
    recipientId: ME_ID,
    status: 'accepted',
    createdAt: inDays(-15),
  },
  {
    id: pairId(ME_ID, 'u-kevin'),
    participantIds: [ME_ID, 'u-kevin'].sort() as [string, string],
    requesterId: 'u-kevin',
    recipientId: ME_ID,
    status: 'pending',
    createdAt: inDays(-1),
  },
];

// Deliberately not symmetric with initialConnections — Follow and Connection
// are different relationships (see the Follow type comment). The
// signed-in user follows Tom, an organizer they're not Connected to, to
// show that following doesn't require a mutual connection first.
export const initialFollows: Follow[] = [
  { id: `${ME_ID}_u-tom`, followerId: ME_ID, followingId: 'u-tom', createdAt: inDays(-20) },
  { id: `${ME_ID}_u-amina`, followerId: ME_ID, followingId: 'u-amina', createdAt: inDays(-14) },
  { id: `u-brian_${ME_ID}`, followerId: 'u-brian', followingId: ME_ID, createdAt: inDays(-28) },
  { id: `u-tom_${ME_ID}`, followerId: 'u-tom', followingId: ME_ID, createdAt: inDays(-9) },
  { id: 'u-kevin_u-tom', followerId: 'u-kevin', followingId: 'u-tom', createdAt: inDays(-40) },
];

// a-amboseli is the one seed adventure at capacity (8/8) — a natural seed
// case for the waitlist.
export const initialWaitlist: WaitlistEntry[] = [{ id: 'a-amboseli_u-kevin', adventureId: 'a-amboseli', userId: 'u-kevin', createdAt: inDays(-2) }];

export const initialReports: Report[] = [
  {
    id: 'report-1',
    targetType: 'adventure',
    targetId: 'a-amboseli',
    reporterId: 'u-kevin',
    reason: 'Other',
    details: "Price seems to have changed since I first saw the listing — wasn't sure if that's allowed.",
    status: 'open',
    createdAt: inDays(-3),
  },
  {
    id: 'report-2',
    targetType: 'user',
    targetId: 'u-brian',
    reporterId: 'u-amina',
    reason: 'Spam',
    details: 'Kept messaging about an unrelated side business.',
    status: 'dismissed',
    createdAt: inDays(-20),
  },
];

export const initialAuditLog: AuditLogEntry[] = [
  {
    id: 'audit-1',
    actorId: ME_ID,
    action: 'Dismissed report',
    targetType: 'user',
    targetId: 'u-brian',
    createdAt: inDays(-19),
  },
];

export const initialThreads: Thread[] = [
  {
    id: 't-kevin',
    adventureId: 'a-ngong',
    otherUserId: 'u-kevin',
    unread: true,
    messages: [
      {
        id: 'm1',
        threadId: 't-kevin',
        senderId: 'u-kevin',
        text: 'Should I bring a headlamp?',
        status: 'sent',
        createdAt: Date.now() - 1000 * 60 * 40,
      },
    ],
  },
  {
    id: 't-tom',
    adventureId: 'a-naivasha',
    otherUserId: 'u-tom',
    unread: false,
    messages: [
      {
        id: 'm2',
        threadId: 't-tom',
        senderId: 'u-tom',
        text: 'We meet at the Total station, 7am.',
        status: 'sent',
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
      },
      {
        id: 'm3',
        threadId: 't-tom',
        senderId: ME_ID,
        text: 'Sounds good, see you then.',
        status: 'sent',
        createdAt: Date.now() - 1000 * 60 * 60 * 4,
      },
    ],
  },
  {
    id: 't-amina',
    adventureId: 'a-ngong',
    otherUserId: 'u-amina',
    unread: false,
    messages: [
      {
        id: 'm4',
        threadId: 't-amina',
        senderId: 'u-amina',
        text: 'Hey! Excited to have you on the hike Saturday.',
        status: 'sent',
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
      },
    ],
  },
];
