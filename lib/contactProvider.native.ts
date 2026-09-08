import firestore from '@react-native-firebase/firestore';

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
  const doc: ContactMessage = {
    id,
    name: input.name,
    email: input.email,
    topic: input.topic,
    message: input.message,
    ...(input.userId ? { userId: input.userId } : {}),
    status: 'open',
    createdAt: Date.now(),
  };
  await firestore().collection(COLLECTION).doc(id).set(doc);
  return doc;
}
