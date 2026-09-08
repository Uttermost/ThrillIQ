import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { ContactMessage, ReportStatus } from './types';

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

export async function fetchOpenContactMessagesReal(): Promise<ContactMessage[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('status', '==', 'open'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => d.data() as ContactMessage);
}

export async function resolveContactMessageReal(messageId: string, status: ReportStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, messageId), { status });
}
