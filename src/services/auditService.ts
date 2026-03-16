import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DB_CONFIG } from '../config/dbConfig';
import { mysqlService } from './mysqlService';

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
    // For MySQL, we might have a mock user in localStorage if not using Firebase Auth
    const mockUserId = localStorage.getItem('mock_user_id');
    const uid = user?.uid || mockUserId;
    const email = user?.email || 'mysql_user';

    if (!uid) return;

    if (DB_CONFIG.useMySQL) {
      // Get organizationId from somewhere or pass it
      // For now, we'll assume the logData structure matches what mysqlService expects
      await mysqlService.createAuditLog({
        organizationId: 'TODO', // Needs to be passed or fetched
        userId: uid,
        action,
        details,
        resourceId: targetId
      });
      return;
    }

    try {
      await addDoc(collection(db, 'admin_activity_logs'), {
        adminId: uid,
        adminEmail: email,
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
    if (DB_CONFIG.useMySQL) {
      // Fetch from MySQL
      // mysqlService.getAuditLogs('TODO').then(callback);
      return () => {};
    }
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
