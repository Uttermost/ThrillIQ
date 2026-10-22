import React from 'react';

import { LegalDocument } from '@/components/ui/LegalDocument';

export default function PrivacyPolicy() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updatedLabel="Last updated: draft — pending legal review"
      intro="This Privacy Policy explains what information ThrillIQ collects, how we use it, and the choices you have. It applies to everyone who uses the ThrillIQ app, whether or not you've created an account."
      sections={[
        {
          heading: 'Information we collect',
          paragraphs: [
            'Account information: your name, email or phone number, and profile details you choose to add — bio, interests, adventure preferences, and a profile photo.',
            "Content you create: posts, photos you attach to posts or reviews, comments, reviews you leave for organizers, and messages you send in chat threads.",
            'Location: only if you choose to add it to an adventure you organize, or use "near me" search — we never collect your background or continuous location.',
            'Safety information: emergency contact details you add to your profile, and your record of agreeing to an adventure\'s safety guidelines before joining.',
            'Usage information: basic technical data needed to operate the app, such as sign-in method and device platform.',
          ],
        },
        {
          heading: 'How we use your information',
          paragraphs: [
            'To operate core features: showing you adventures, letting you join, connecting you with organizers and other participants, and running the social feed.',
            'To keep the community safe: reviewing reports, enforcing our Terms of Service, and maintaining an audit trail of moderation actions.',
            'To communicate with you: notifications about activity relevant to you (likes, comments, follows, adventure updates), which you can manage in-app.',
            'We do not sell your personal information, and we do not use your data to serve third-party advertising.',
          ],
        },
        {
          heading: 'Who can see what',
          paragraphs: [
            'Your public profile, posts, and reviews are visible to other users according to your privacy settings (Everyone, Connections, or Participants).',
            'Your emergency contact is private — it is shown only to you, as a safety reminder, and is never shared with organizers, other participants, or ThrillIQ staff outside of a genuine emergency.',
            'Direct messages and adventure chat threads are visible only to their participants.',
            "An adventure organizer can see who has joined their adventure and whether each participant has acknowledged the adventure's guidelines.",
          ],
        },
        {
          heading: 'Payments',
          paragraphs: [
            'ThrillIQ does not process payments for adventures. Prices shown are set by the organizer and paid directly to them, outside of this app — we do not collect or store payment card information.',
          ],
        },
        {
          heading: 'Data retention and your choices',
          paragraphs: [
            'You can edit or remove most of your own content at any time — posts, comments, reposts, and reviews all have a delete option.',
            "We don't yet offer a self-service way to delete your account. To request deletion of your account and associated data, contact us at privacy@thrilliq.com and we'll process your request.",
            'Reported content and moderation records are retained separately for safety and accountability purposes, even if the original content is later removed.',
          ],
        },
        {
          heading: "Children's privacy",
          paragraphs: ['ThrillIQ is not directed at children under 16, and we do not knowingly collect information from them.'],
        },
        {
          heading: 'Changes to this policy',
          paragraphs: ["We'll update this page if how we handle your data changes, and update the date at the top when we do."],
        },
        {
          heading: 'Contact us',
          paragraphs: ['Questions about this policy or your data: privacy@thrilliq.com.'],
        },
      ]}
    />
  );
}
