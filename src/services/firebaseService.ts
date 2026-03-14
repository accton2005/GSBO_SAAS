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

// Organizations
export const getOrganization = (orgId: string, callback: (org: Organization | null) => void) => {
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
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
    await auditService.logAction('DELETE_USER', `Deleted user account: ${userId}`, userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const createUser = async (userData: Omit<User, 'id'>) => {
  const path = 'users';
  try {
    const docRef = await addDoc(collection(db, 'users'), userData);
    await auditService.logAction('CREATE_USER', `Created new user: ${userData.email} with role ${userData.role}`, docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// Courriers
export const getCourriers = (orgId: string, type: 'entrant' | 'sortant' | undefined, callback: (courriers: Courrier[]) => void) => {
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
  const path = 'courriers';
  try {
    const docRef = await addDoc(collection(db, 'courriers'), courrierData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateCourrier = async (courrierId: string, data: Partial<Courrier>) => {
  const path = `courriers/${courrierId}`;
  try {
    await updateDoc(doc(db, 'courriers', courrierId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteCourrier = async (courrierId: string) => {
  const path = `courriers/${courrierId}`;
  try {
    await deleteDoc(doc(db, 'courriers', courrierId));
    await auditService.logAction('DELETE_COURRIER', `Deleted courrier: ${courrierId}`, courrierId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
