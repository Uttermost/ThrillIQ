// DRAFT legal text, same caveat as app/terms.tsx and app/privacy.tsx — not
// reviewed or finalized. Sections describing what the product actually
// does are grounded in real, already-built behavior; a real legal/business
// decision (the registered company entity, jurisdiction, a monitored
// contact address, specific liability language) is left as an explicit
// [bracketed] placeholder instead of an invented fact.
export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  sections: LegalSection[];
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    sections: [
      {
        heading: '1. What this covers',
        paragraphs: ['This describes what ThrillIQ actually stores in your browser, and why — not a generic template.'],
      },
      {
        heading: '2. What we use',
        paragraphs: [
          "Two local storage flags: whether you've completed onboarding, and whether you're signed in. Neither identifies you beyond that.",
          "Firebase Authentication (the service that handles sign-in) stores its own session data in your browser to keep you signed in between visits — standard behavior for that service, not something ThrillIQ configures separately.",
        ],
      },
      {
        heading: "3. What we don't use",
        paragraphs: ['No advertising or analytics tracking cookies today. If that changes, this policy will be updated first.'],
      },
      {
        heading: '4. Your choices',
        paragraphs: ["Clearing your browser's local storage signs you out and resets onboarding. Your browser's own settings control cookies more broadly."],
      },
      {
        heading: '5. Changes to this policy',
        paragraphs: ["We'll update the date below whenever this changes."],
      },
    ],
  },
  {
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    sections: [
      {
        heading: '1. Why these exist',
        paragraphs: ["ThrillIQ works because real people show up for each other. These guidelines are what makes that safe to keep doing."],
      },
      {
        heading: '2. Be a real person',
        paragraphs: ['Use your real identity. No impersonating someone else, and no fake accounts.'],
      },
      {
        heading: "3. Respect each adventure's guidelines",
        paragraphs: ["Every adventure has guidelines its organizer sets. You agree to them before joining — follow them once you're there."],
      },
      {
        heading: '4. No harassment, hate, or unsafe behavior',
        paragraphs: ["Don't harass, threaten, or endanger anyone — on an adventure, in a message, or in a post."],
      },
      {
        heading: '5. Post responsibly',
        paragraphs: ["Feed posts, comments, and reviews should reflect genuine experiences. No spam, and nothing you don't have the rights to post."],
      },
      {
        heading: '6. Reporting & enforcement',
        paragraphs: [
          "Every adventure, post, and profile can be reported — spam, inappropriate content, a safety concern, or something else. Reports go to the ThrillIQ team for review, and may result in content removal or account restriction.",
        ],
      },
      {
        heading: '7. Changes to these guidelines',
        paragraphs: ["We'll update the date below whenever this changes."],
      },
    ],
  },
  {
    slug: 'safety-policy',
    title: 'Safety Policy',
    sections: [
      {
        heading: '1. Our approach',
        paragraphs: [
          'Adventures on ThrillIQ are organized and run independently — ThrillIQ is not a party to them. This policy covers what we do build to support safety, not a guarantee about any specific adventure.',
        ],
      },
      {
        heading: '2. Before joining',
        paragraphs: ["Every adventure has guidelines its organizer sets. You agree to them before you can join, and the organizer can see who has."],
      },
      {
        heading: '3. Reporting',
        paragraphs: ['Every adventure, post, and profile has a report option, reviewed by the ThrillIQ team.'],
      },
      {
        heading: '4. Emergency contact',
        paragraphs: ["You can add one to your profile. It's private — shown only back to you, as a reminder, once you've joined an adventure."],
      },
      {
        heading: "5. What this policy doesn't cover",
        paragraphs: [
          "ThrillIQ does not run background checks, verify organizer identity beyond their account, or provide insurance for adventures. Participation is at your own discretion — see our general safety guidance for practical habits worth having regardless.",
        ],
      },
      {
        heading: '6. Changes to this policy',
        paragraphs: ["We'll update the date below whenever this changes."],
      },
    ],
  },
  {
    slug: 'organizer-terms',
    title: 'Organizer Terms',
    sections: [
      {
        heading: '1. Who this applies to',
        paragraphs: ['Anyone who creates and hosts an adventure on ThrillIQ.'],
      },
      {
        heading: "2. You're responsible for your adventure",
        paragraphs: [
          "Adventures are run independently by their organizers, not by ThrillIQ. You're responsible for the legality, safety, and conduct of the adventures you host.",
        ],
      },
      {
        heading: '3. Pricing & payment',
        paragraphs: [
          "You set your own price. ThrillIQ doesn't process, hold, or transmit payment — participants pay you directly, however you've arranged it.",
        ],
      },
      {
        heading: '4. Guidelines & participants',
        paragraphs: ["You set the guidelines participants agree to before joining, and you can see who's joined, who's waitlisted, and who's acknowledged your guidelines."],
      },
      {
        heading: '5. Cancelling an adventure',
        paragraphs: ["Cancelling removes it from Discover and notifies everyone who joined. This can't be undone."],
      },
      {
        heading: '6. Reviews',
        paragraphs: ['Participants can leave reviews after your adventure happens. These are real and visible on your Organizer Dashboard.'],
      },
      {
        heading: '7. Conduct',
        paragraphs: ['You agree to our Community Guidelines the same as any other user.'],
      },
      {
        heading: '8. Changes to these terms',
        paragraphs: ["We'll update the date below whenever this changes."],
      },
    ],
  },
  {
    slug: 'cancellation-refund-policy',
    title: 'Cancellation & Refund Policy',
    sections: [
      {
        heading: '1. Cancelling your spot',
        paragraphs: ["Leave any adventure any time before it happens, from the adventure page. Your spot opens up, including for anyone on the waitlist."],
      },
      {
        heading: '2. If the organizer cancels',
        paragraphs: ["You'll get a notification, and the adventure comes off Discover."],
      },
      {
        heading: '3. Refunds',
        paragraphs: [
          "ThrillIQ doesn't process payment, so there's no platform-level refund to request. If an adventure has a price, the organizer sets their own cancellation policy for it — shown on the adventure page — and any refund is between you and them.",
        ],
      },
      {
        heading: '4. Waitlist',
        paragraphs: ["If an adventure is full, joining the waitlist doesn't guarantee a spot — you move up only as others leave."],
      },
      {
        heading: '5. Changes to this policy',
        paragraphs: ["We'll update the date below whenever this changes."],
      },
    ],
  },
  {
    slug: 'copyright-policy',
    title: 'Copyright & Content Policy',
    sections: [
      {
        heading: '1. Your content, your rights',
        paragraphs: [
          'You keep ownership of what you post — text, photos, reviews. Posting it grants ThrillIQ a license to display it within the Service to the audience your privacy settings allow.',
        ],
      },
      {
        heading: "2. Respecting others' rights",
        paragraphs: ["Don't post anything you don't have the rights to, or that infringes someone else's copyright or other rights."],
      },
      {
        heading: '3. Reporting infringing content',
        paragraphs: ['Use the report option on the specific post, review, or profile. Reports are reviewed by the ThrillIQ team.'],
      },
      {
        heading: '4. Repeat violations',
        paragraphs: ['Accounts that repeatedly post infringing or violating content may be restricted.'],
      },
      {
        heading: '5. Changes to this policy',
        paragraphs: ["We'll update the date below whenever this changes."],
      },
    ],
  },
  {
    slug: 'report-abuse',
    title: 'Report Abuse',
    sections: [
      {
        heading: '1. How to report',
        paragraphs: [
          'Every adventure, post, and profile has a report option, right where you see it — pick a reason (spam, inappropriate content, a safety concern, or something else) and add details if you can.',
        ],
      },
      {
        heading: '2. What happens next',
        paragraphs: ["Reports go to the ThrillIQ team, not to the person you're reporting, and are reviewed from there."],
      },
      {
        heading: '3. If you’re in immediate danger',
        paragraphs: ["Contact your local emergency services first. Report to ThrillIQ afterward — this is a review process, not an emergency response."],
      },
      {
        heading: '4. Changes to this policy',
        paragraphs: ["We'll update the date below whenever this changes."],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
