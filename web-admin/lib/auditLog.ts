import { collection, doc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';

import { db } from './firebase';
import type { AuditLogEntry, Report } from './types';

const AUDIT_LOG = 'auditLog';

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  const snap = await getDocs(query(collection(db, AUDIT_LOG), orderBy('createdAt', 'desc'), limit(50)));
  return snap.docs.map((d) => d.data() as AuditLogEntry);
}

export async function recordAuditLog(entry: {
  actorId: string;
  action: string;
  targetType: Report['targetType'];
  targetId: string;
}): Promise<void> {
  const ref = doc(collection(db, AUDIT_LOG));
  const record: AuditLogEntry = { id: ref.id, ...entry, createdAt: Date.now() };
  await setDoc(ref, record);
}
