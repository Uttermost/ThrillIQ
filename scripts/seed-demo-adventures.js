/**
 * One-off seed script for 3 demo adventures in Firestore, so a fresh
 * install's Discover screen isn't empty before any organizer has posted.
 *
 * Requires your own Firebase service account key — never commit it, never
 * hand it to anyone else. Get one from:
 *   Firebase console → Project settings → Service accounts → Generate new private key
 *
 * Run:
 *   npm install firebase-admin --no-save
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json node scripts/seed-demo-adventures.js
 */
const admin = require('firebase-admin');

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

const DAY_MS = 24 * 60 * 60 * 1000;
const inDays = (n) => Date.now() + n * DAY_MS;

const DEMO_ADVENTURES = [
  {
    title: 'Ngong Hills sunrise hike',
    type: 'Hike',
    difficulty: 'Moderate',
    dateLabel: 'Sat, Sep 12',
    meetingTime: '6:00am',
    dateTimestamp: inDays(3),
    location: 'Ngong Hills, Kajiado',
    priceKsh: 1500,
    spotsTotal: 12,
    spotsFilled: 0,
    organizerId: 'demo-organizer',
    participantIds: [],
    guidelines: ['No alcohol', 'Bring 2L water'],
    likedBy: [],
    likeCount: 0,
    coordinate: { x: 0.42, y: 0.58 },
  },
  {
    title: 'Naivasha road trip',
    type: 'Road trip',
    difficulty: 'Moderate',
    dateLabel: 'Sun, Sep 13',
    meetingTime: '7:00am',
    dateTimestamp: inDays(6),
    location: 'Lake Naivasha',
    priceKsh: 4500,
    spotsTotal: 20,
    spotsFilled: 0,
    organizerId: 'demo-organizer',
    participantIds: [],
    guidelines: ['Carpool meets at Total station', 'Bring a valid ID'],
    likedBy: [],
    likeCount: 0,
    coordinate: { x: 0.22, y: 0.34 },
  },
  {
    title: 'Karura Forest evening walk',
    type: 'Hike',
    difficulty: 'Beginner',
    dateLabel: 'Wed, Sep 16',
    meetingTime: '5:30pm',
    dateTimestamp: inDays(12),
    location: 'Karura Forest, Nairobi',
    priceKsh: 300,
    spotsTotal: 15,
    spotsFilled: 0,
    organizerId: 'demo-organizer',
    participantIds: [],
    guidelines: ['No littering', 'Closed shoes recommended'],
    likedBy: [],
    likeCount: 0,
    coordinate: { x: 0.6, y: 0.22 },
  },
];

async function main() {
  const batch = db.batch();
  for (const adventure of DEMO_ADVENTURES) {
    const ref = db.collection('adventures').doc();
    batch.set(ref, { ...adventure, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  await batch.commit();
  console.log(`Seeded ${DEMO_ADVENTURES.length} demo adventures.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
