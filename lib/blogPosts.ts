import { Category } from './types';

// Static launch content — the handoff doc's CMS section (§12) describes
// blog posts as eventually admin-editable, but that's a real content
// pipeline (storage, an editor UI) that doesn't exist yet. This is the
// honest MVP shape of that: a typed module the list/detail pages read,
// swappable for a real fetch once a CMS exists, without fabricating a
// backend that isn't there.
//
// Every post below describes the real product — no fabricated adventure
// guides, place facts, or specific travel claims that would need local
// knowledge or editorial fact-checking, and no invented named author —
// same "real data or nothing" rule as the rest of this app. Byline is
// "The ThrillIQ Team" throughout rather than a fabricated individual.
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  body: string[];
  publishedAt: number;
}

function readTimeMinutes(post: BlogPost): number {
  const words = post.body.join(' ').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-we-built-thrilliq',
    title: 'Why We Built ThrillIQ',
    excerpt: 'Adventures are everywhere. Finding people to share them with is the hard part — that\'s the problem this product exists to solve.',
    category: 'Social',
    publishedAt: new Date('2026-08-15').getTime(),
    body: [
      "There's no shortage of hikes, rides, and weekend trips happening around you. What's actually scarce is a way to find the ones you can join, hosted by someone real, with other people who'll actually show up.",
      'Most "discovery" apps solve half of that: a directory of listings with no one behind them, or a social feed with no way to turn a post into a plan. ThrillIQ is built to close that gap — an adventure page that tells you exactly what you\'re signing up for, and a social layer around it so the people you meet don\'t disappear when the adventure ends.',
      "That's why every adventure on ThrillIQ has a real organizer, real guidelines you agree to before joining, and a participant list you can see before you show up. It's why joining never routes a payment through us — you and the organizer settle that directly, the way you would if a friend invited you along.",
      "It's also why the product doesn't stop at the adventure itself. Feed exists because the story usually continues after the hike is over. Crews exist because the best adventures are the ones you keep having with the same people. People exists because sometimes the adventure is really just an excuse to meet someone worth knowing.",
      "We'd rather build a smaller set of features that actually gets people outside with each other than a bigger app that doesn't. If that's what you're looking for, Discover is the place to start.",
    ],
  },
  {
    slug: 'how-joining-an-adventure-works',
    title: 'How Joining an Adventure Actually Works',
    excerpt: 'From finding something on Discover to showing up on the day — what actually happens at each step, and what does not.',
    category: 'Hiking',
    publishedAt: new Date('2026-08-22').getTime(),
    body: [
      'Discover is where it starts, and you can browse it without an account — filter by category, date, price, or distance, and open anything that looks interesting. An adventure page shows you what you actually need to decide: the date and meeting point, the difficulty and pace, what\'s included, what to bring, and who else is going.',
      "If it's full, you're not out of luck — join the waitlist and you'll see exactly where you stand. If a spot opens up because someone leaves, you move up the list automatically.",
      'When you\'re ready to join, you\'ll agree to the organizer\'s guidelines first — things like an alcohol policy, or whether it\'s pet-friendly. That\'s not a formality; the organizer can see who\'s agreed to what before the day arrives.',
      "Joining itself doesn't charge you anything through the app. If the adventure has a price, you and the organizer settle that directly, however they've set it up. That's true whether it's free or not — ThrillIQ isn't in the payment chain either way.",
      "Once you're in, you can message the organizer with questions, see who else is going, and — if your plans change — leave any time before the adventure starts. Your spot opens back up, including for anyone on the waitlist.",
      "After it happens, you can leave a review, and if you post about it on the Feed you can tag the adventure so anyone reading can find their way back to it. It's a small thing, but it's how one adventure turns into the next one.",
    ],
  },
  {
    slug: 'a-guide-to-safety-on-thrilliq',
    title: 'A Guide to Safety on ThrillIQ',
    excerpt: 'What\'s actually built to help you stay safe, what to expect from organizers, and a few practical habits worth having anyway.',
    category: 'Photography',
    publishedAt: new Date('2026-08-29').getTime(),
    body: [
      "Adventures on ThrillIQ are run independently by their organizers, not by us — which means the platform's job is to make sure the right information and tools exist, not to promise an outcome it can't guarantee. Here's exactly what that means in practice.",
      "Every adventure has guidelines its organizer sets before anyone can join — things like alcohol policy, whether it's pet-friendly, or age suitability. You see them and agree to them before you're in, and the organizer can see who has.",
      "If something goes wrong — with an adventure, a post, or a person — every page has a report option, with real categories: spam, inappropriate content, a safety concern, or something else. Reports go to the ThrillIQ team, not to the person you're reporting.",
      "You can add an emergency contact to your profile. It stays private — the only time it's shown is back to you, as a reminder, once you've joined an adventure. It's not sent to the organizer or any other participant.",
      "Beyond what's built, a few habits are worth having regardless of the app: meet in public, well-lit places the first time you're adventuring with someone new; tell a friend or family member what you're joining and when; and trust your instincts. You can leave any adventure and report it at any point — you don't need a reason beyond something feeling off.",
      "None of this replaces judgment. It's meant to make good judgment easier to act on.",
    ],
  },
  {
    slug: 'tips-for-hosting-your-first-adventure',
    title: 'Tips for Hosting Your First Adventure',
    excerpt: 'What the Create wizard actually asks for, and a few things worth thinking through before you publish.',
    category: 'Camping',
    publishedAt: new Date('2026-09-05').getTime(),
    body: [
      "Hosting on ThrillIQ starts with Create, and it walks you through the same things a participant will actually read: a title, category, and description; the date, time, and meeting point; the vibe — social level, pace, and intensity; who it's for; transport arrangements; what's included versus what people should bring; your guidelines and safety notes; and the price, if any, plus your cancellation policy.",
      "The description is doing more work than it looks like. The people deciding whether to join are reading it for the same things you'd want to know as a participant: what actually happens, how hard it is, and what to expect from the people around you. Specific beats generic — 'a 6km loop with one steep climb near the end' tells someone more than 'a nice hike.'",
      "Guidelines aren't just a formality — they're the thing participants agree to before joining, and you can see who has. If there's anything you'd want someone to know before they show up, put it there rather than leaving it as a surprise on the day.",
      "Since ThrillIQ doesn't process payment, be upfront in your description about how you'd like to be paid, and treat 'joined' and 'paid' as two separate things until you've actually confirmed the second one.",
      "Once people start joining, you'll see them on your Organizer Dashboard alongside your other hosted adventures and your reviews. Messaging participants ahead of time — even just to confirm the meeting point — tends to matter more than anything else for how the day actually goes.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getReadTimeMinutes(post: BlogPost): number {
  return readTimeMinutes(post);
}
