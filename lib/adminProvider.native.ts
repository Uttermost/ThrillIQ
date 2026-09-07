import firestore from '@react-native-firebase/firestore';

import { AuditLogEntry, Report, ReportStatus } from './types';

const REPORTS = 'reports';
const AUDIT_LOG = 'auditLog';

export async function submitReportReal(report: {
  targetType: Report['targetType'];
  targetId: string;
  reporterId: string;
  reason: Report['reason'];
  details: string;
}): Promise<Report> {
  const id = `report-${Date.now()}`;
  const doc: Report = { id, ...report, status: 'open', createdAt: Date.now() };
  await firestore().collection(REPORTS).doc(id).set(doc);
  return doc;
}

export async function fetchOpenReportsReal(): Promise<Report[]> {
  const snapshot = await firestore().collection(REPORTS).where('status', '==', 'open').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => doc.data() as Report);
}

export async function resolveReportReal(reportId: string, status: ReportStatus): Promise<void> {
  await firestore().collection(REPORTS).doc(reportId).update({ status });
}

export async function recordAuditLogReal(entry: {
  actorId: string;
  action: string;
  targetType: Report['targetType'];
  targetId: string;
}): Promise<void> {
  const id = `audit-${Date.now()}`;
  const doc: AuditLogEntry = { id, ...entry, createdAt: Date.now() };
  await firestore().collection(AUDIT_LOG).doc(id).set(doc);
}

export async function fetchAuditLogReal(): Promise<AuditLogEntry[]> {
  const snapshot = await firestore().collection(AUDIT_LOG).orderBy('createdAt', 'desc').limit(50).get();
  return snapshot.docs.map((doc) => doc.data() as AuditLogEntry);
}
