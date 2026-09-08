import { collection, doc, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';

import { db } from './firebase';
import { AuditLogEntry, Report, ReportStatus } from './types';

const REPORTS = 'reports';
const AUDIT_LOG = 'auditLog';

export async function submitReportReal(report: {
  targetType: Report['targetType'];
  targetId: string;
  contextId?: string;
  reporterId: string;
  reason: Report['reason'];
  details: string;
}): Promise<Report> {
  const id = `report-${Date.now()}`;
  // Firestore rejects an explicit `undefined` field value, so contextId is
  // only included in the write when actually present — same pattern as
  // Post.photos/PostComment.parentCommentId elsewhere in this file's peers.
  const data: Report = {
    id,
    targetType: report.targetType,
    targetId: report.targetId,
    ...(report.contextId ? { contextId: report.contextId } : {}),
    reporterId: report.reporterId,
    reason: report.reason,
    details: report.details,
    status: 'open',
    createdAt: Date.now(),
  };
  await setDoc(doc(db, REPORTS, id), data);
  return data;
}

export async function fetchOpenReportsReal(): Promise<Report[]> {
  const snapshot = await getDocs(query(collection(db, REPORTS), where('status', '==', 'open'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => d.data() as Report);
}

export async function resolveReportReal(reportId: string, status: ReportStatus): Promise<void> {
  await updateDoc(doc(db, REPORTS, reportId), { status });
}

export async function recordAuditLogReal(entry: {
  actorId: string;
  action: string;
  targetType: Report['targetType'];
  targetId: string;
}): Promise<void> {
  const id = `audit-${Date.now()}`;
  const data: AuditLogEntry = { id, ...entry, createdAt: Date.now() };
  await setDoc(doc(db, AUDIT_LOG, id), data);
}

export async function fetchAuditLogReal(): Promise<AuditLogEntry[]> {
  const snapshot = await getDocs(query(collection(db, AUDIT_LOG), orderBy('createdAt', 'desc'), limit(50)));
  return snapshot.docs.map((d) => d.data() as AuditLogEntry);
}
