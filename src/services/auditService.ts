import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface AuditLog {
  id?: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details: string;
  ip?: string;
  timestamp: any;
}

export const auditService = {
  async logAction(action: string, details: string, targetId?: string) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'admin_activity_logs'), {
        adminId: user.uid,
        adminEmail: user.email,
        action,
        details,
        targetId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  },

  getLogs(callback: (logs: AuditLog[]) => void) {
    const q = query(
      collection(db, 'admin_activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));
    });
  }
};
