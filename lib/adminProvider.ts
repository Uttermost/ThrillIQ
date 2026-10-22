// Web has no native Firestore SDK support (@react-native-firebase is native-only).
// store.tsx never actually calls these on web — it keeps its own mock array logic
// inline for that platform — but this file must exist so the import resolves.

import { AuditLogEntry, Report, ReportStatus } from './types';

export async function submitReportReal(_report: {
  targetType: Report['targetType'];
  targetId: string;
  contextId?: string;
  reporterId: string;
  reason: Report['reason'];
  details: string;
}): Promise<Report> {
  throw new Error('Not implemented on web.');
}

export async function fetchOpenReportsReal(): Promise<Report[]> {
  return [];
}

export async function resolveReportReal(_reportId: string, _status: ReportStatus): Promise<void> {}

export async function recordAuditLogReal(_entry: { actorId: string; action: string; targetType: Report['targetType']; targetId: string }): Promise<void> {}

export async function fetchAuditLogReal(): Promise<AuditLogEntry[]> {
  return [];
}
