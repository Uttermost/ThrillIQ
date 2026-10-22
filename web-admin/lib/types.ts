// Mirrors the subset of ../lib/types.ts (the mobile app's Firestore schema)
// that this admin panel reads and writes. There's no shared package between
// the two apps, so keep these in sync by hand if the mobile schema changes.

export interface User {
  id: string;
  name: string;
  isAdmin?: boolean;
}

export type ReportTargetType = 'adventure' | 'user' | 'review' | 'post' | 'comment';
export type ReportReason = 'Spam' | 'Inappropriate content' | 'Safety concern' | 'Other';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  contextId?: string;
  reporterId: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetType: ReportTargetType;
  targetId: string;
  createdAt: number;
}
