import { doc, setDoc } from 'firebase/firestore';

import { db } from './firebase';
import { ContactMessage } from './types';

const COLLECTION = 'contactMessages';

export async function submitContactMessageReal(input: {
  name: string;
  email: string;
  topic: ContactMessage['topic'];
  message: string;
  userId?: string;
}): Promise<ContactMessage> {
  const id = `contact-${Date.now()}`;
  // Same undefined-field pattern as submitReportReal — userId is only set
  // when the submitter happens to be signed in, and Firestore rejects an
  // explicit `undefined` value.
  const data: ContactMessage = {
    id,
    name: input.name,
    email: input.email,
    topic: input.topic,
    message: input.message,
    ...(input.userId ? { userId: input.userId } : {}),
    status: 'open',
    createdAt: Date.now(),
  };
  await setDoc(doc(db, COLLECTION, id), data);
  return data;
}
