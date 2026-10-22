import React from 'react';

import { LegalDocument } from '@/components/ui/LegalDocument';

export default function TermsOfService() {
  return (
    <LegalDocument
      title="Terms of Service"
      updatedLabel="Last updated: draft — pending legal review"
      intro="These Terms govern your use of ThrillIQ. By creating an account, you agree to them. Please also read our Privacy Policy, which explains how we handle your information."
      sections={[
        {
          heading: 'Who can use ThrillIQ',
          paragraphs: [
            'You must be at least 16 years old to create an account. By signing up, you confirm the information you provide is accurate and that you are responsible for keeping your account secure.',
          ],
        },
        {
          heading: 'Adventures are between members',
          paragraphs: [
            'ThrillIQ is a platform that connects people organizing and joining adventures — we are not a party to any adventure, and we do not organize, supervise, or guarantee the safety of any adventure listed in the app.',
            'Outdoor and group activities carry inherent risk. By joining an adventure, you accept that risk and agree that you are responsible for your own safety, judgement, and any equipment or preparation the organizer\'s guidelines call for.',
            "Prices, cancellation policies, and refunds are set by the organizer, not ThrillIQ. Payment happens directly between you and the organizer — the app never processes payment for an adventure.",
          ],
        },
        {
          heading: 'Your content',
          paragraphs: [
            'You keep ownership of what you post — photos, text, reviews, and comments. By posting, you give ThrillIQ permission to display it in the app to the audience your privacy settings allow.',
            "You're responsible for what you post. Don't post anything illegal, harassing, hateful, or that infringes someone else's rights.",
          ],
        },
        {
          heading: 'Community standards',
          paragraphs: [
            'Treat other members with respect. Harassment, hate speech, spam, and impersonation are not allowed and can be reported from any post, comment, adventure, review, or profile.',
            'Reported content is reviewed by our moderation team, who may remove content or take other action, including suspending accounts, consistent with these Terms.',
          ],
        },
        {
          heading: 'Account suspension and termination',
          paragraphs: [
            'We may suspend or remove access to an account that violates these Terms or puts other members at risk. You may stop using ThrillIQ at any time.',
          ],
        },
        {
          heading: 'Disclaimers',
          paragraphs: [
            'ThrillIQ is provided "as is." We do our best to keep the app reliable, but we do not guarantee it will always be available or error-free.',
            'To the fullest extent permitted by law, ThrillIQ is not liable for injuries, losses, or disputes arising from an adventure organized by another member — those are between you and the organizer.',
          ],
        },
        {
          heading: 'Changes to these Terms',
          paragraphs: ["We'll update this page if these Terms change, and update the date at the top when we do. Continuing to use ThrillIQ after a change means you accept the updated Terms."],
        },
        {
          heading: 'Governing law',
          paragraphs: ['These Terms are governed by the laws of Kenya.'],
        },
        {
          heading: 'Contact us',
          paragraphs: ['Questions about these Terms: legal@thrilliq.com.'],
        },
      ]}
    />
  );
}
