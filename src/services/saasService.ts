import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export enum SaaSActivityType {
  ORG_CREATED = 'ORG_CREATED',
  ORG_SUSPENDED = 'ORG_SUSPENDED',
  PLAN_CREATED = 'PLAN_CREATED',
  PLAN_UPDATED = 'PLAN_UPDATED',
  PLAN_DELETED = 'PLAN_DELETED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
}

export const logSaaSActivity = async (
  adminId: string,
  type: SaaSActivityType,
  details: string,
  ipAddress?: string
) => {
  try {
    await addDoc(collection(db, 'saas_activity_logs'), {
      adminId,
      type,
      details,
      ipAddress: ipAddress || 'unknown',
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging SaaS activity:', error);
  }
};
