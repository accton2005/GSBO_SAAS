import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Courrier, User, Organization } from '../types';
import { auditService } from './auditService';
import { mysqlService } from './mysqlService';
import { DB_CONFIG } from '../config/dbConfig';

// Organizations
export const getOrganization = (orgId: string, callback: (org: Organization | null) => void) => {
  if (DB_CONFIG.useMySQL) {
    mysqlService.getOrganization(orgId).then(callback).catch(() => callback(null));
    return () => {}; // No real-time for MySQL in this simple version
  }
  const path = `organizations/${orgId}`;
  return onSnapshot(doc(db, 'organizations', orgId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Organization);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const createOrganization = async (orgData: Omit<Organization, 'id'>) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.createOrganization(orgData);
  }
  const path = 'organizations';
  try {
    const docRef = await addDoc(collection(db, 'organizations'), orgData);
    await auditService.logAction('CREATE_ORG', `Created organization: ${orgData.name}`, docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateOrganization = async (orgId: string, data: Partial<Organization>) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.updateOrganization(orgId, data);
  }
  const path = `organizations/${orgId}`;
  try {
    await updateDoc(doc(db, 'organizations', orgId), data);
    await auditService.logAction('UPDATE_ORG', `Updated organization settings for: ${orgId}`, orgId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Users
export const getUsers = (orgId: string, callback: (users: User[]) => void) => {
  if (DB_CONFIG.useMySQL) {
    mysqlService.getUsers(orgId).then(callback).catch(() => callback([]));
    return () => {};
  }
  const path = 'users';
  const q = query(collection(db, 'users'), where('organizationId', '==', orgId));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const deleteUser = async (userId: string) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.deleteUser(userId);
  }
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
    await auditService.logAction('DELETE_USER', `Deleted user account: ${userId}`, userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const createUser = async (userData: Omit<User, 'id'>) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.createUser(userData);
  }
  const path = 'users';
  try {
    const docRef = await addDoc(collection(db, 'users'), userData);
    await auditService.logAction('CREATE_USER', `Created new user: ${userData.email} with role ${userData.role}`, docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateUser = async (userId: string, data: Partial<User>) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.updateUser(userId, data);
  }
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), data);
    await auditService.logAction('UPDATE_USER', `Updated user account: ${userId}`, userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Courriers
export const getCourriers = (orgId: string, type: 'entrant' | 'sortant' | undefined, callback: (courriers: Courrier[]) => void) => {
  if (DB_CONFIG.useMySQL) {
    mysqlService.getCourriers(orgId, type).then(callback).catch(() => callback([]));
    return () => {};
  }
  const path = 'courriers';
  let q = query(
    collection(db, 'courriers'), 
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc')
  );

  if (type) {
    q = query(q, where('type', '==', type));
  }
  return onSnapshot(q, (snapshot) => {
    const courriers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Courrier));
    callback(courriers);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const createCourrier = async (courrierData: Omit<Courrier, 'id'>) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.createCourrier(courrierData);
  }
  const path = 'courriers';
  try {
    const docRef = await addDoc(collection(db, 'courriers'), courrierData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateCourrier = async (courrierId: string, data: Partial<Courrier>) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.updateCourrier(courrierId, data);
  }
  const path = `courriers/${courrierId}`;
  try {
    await updateDoc(doc(db, 'courriers', courrierId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteCourrier = async (courrierId: string) => {
  if (DB_CONFIG.useMySQL) {
    return mysqlService.deleteCourrier(courrierId);
  }
  const path = `courriers/${courrierId}`;
  try {
    await deleteDoc(doc(db, 'courriers', courrierId));
    await auditService.logAction('DELETE_COURRIER', `Deleted courrier: ${courrierId}`, courrierId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
