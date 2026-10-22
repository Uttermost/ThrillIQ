import { collection, deleteDoc, doc, getDocs, increment, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';

import { db } from './firebase';
import { recordAuditLog } from './auditLog';
import type { Report, ReportStatus } from './types';

const REPORTS = 'reports';

export async function fetchOpenReports(): Promise<Report[]> {
  const snap = await getDocs(query(collection(db, REPORTS), where('status', '==', 'open'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => d.data() as Report);
}

export async function resolveReport(report: Report, status: ReportStatus, actorId: string): Promise<void> {
  await updateDoc(doc(db, REPORTS, report.id), { status });
  await recordAuditLog({
    actorId,
    action: status === 'dismissed' ? 'Dismissed report' : 'Resolved report',
    targetType: report.targetType,
    targetId: report.targetId,
  });
}

// Deletes the reported content itself (post, or comment + the parent post's
// denormalized commentCount, matching postsProvider/postCommentsProvider's
// deletePostReal/deletePostCommentReal on the mobile app), then resolves the
// report. Only 'post' and 'comment' reports have a delete action — same
// restriction as the mobile admin screen, since adventure/user/review
// reports have no delete path wired up anywhere yet.
export async function deleteReportedContent(report: Report, actorId: string): Promise<void> {
  if (report.targetType === 'post') {
    await deleteDoc(doc(db, 'posts', report.targetId));
  } else if (report.targetType === 'comment' && report.contextId) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'postComments', report.targetId));
    batch.update(doc(db, 'posts', report.contextId), { commentCount: increment(-1) });
    await batch.commit();
  } else {
    throw new Error(`No delete action for report target type "${report.targetType}".`);
  }

  await resolveReport(report, 'resolved', actorId);
}
