import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AppSettings, 
  ServiceDefinition, 
  CourrierTypeDefinition, 
  CourrierStatusDefinition, 
  CourrierPriorityDefinition 
} from '../types';

const APP_SETTINGS = 'app_settings';
const SERVICES = 'services_definitions';
const COURRIER_TYPES = 'courrier_types';
const COURRIER_STATUSES = 'courrier_statuses';
const COURRIER_PRIORITIES = 'courrier_priorities';

export const settingsService = {
  // App Settings
  async getSettings(organizationId: string): Promise<AppSettings | null> {
    const docRef = doc(db, APP_SETTINGS, organizationId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as AppSettings;
    }
    return null;
  },

  async saveSettings(organizationId: string, settings: Omit<AppSettings, 'id' | 'organizationId'>) {
    const docRef = doc(db, APP_SETTINGS, organizationId);
    await setDoc(docRef, { ...settings, organizationId }, { merge: true });
  },

  // Services / Departments
  async getServices(organizationId: string): Promise<ServiceDefinition[]> {
    const q = query(collection(db, SERVICES), where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceDefinition));
  },

  async addService(service: Omit<ServiceDefinition, 'id'>) {
    return await addDoc(collection(db, SERVICES), service);
  },

  async updateService(id: string, updates: Partial<ServiceDefinition>) {
    const docRef = doc(db, SERVICES, id);
    await updateDoc(docRef, updates);
  },

  async deleteService(id: string) {
    await deleteDoc(doc(db, SERVICES, id));
  },

  // Courrier Types
  async getCourrierTypes(organizationId: string): Promise<CourrierTypeDefinition[]> {
    const q = query(collection(db, COURRIER_TYPES), where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourrierTypeDefinition));
  },

  async addCourrierType(type: Omit<CourrierTypeDefinition, 'id'>) {
    return await addDoc(collection(db, COURRIER_TYPES), type);
  },

  async updateCourrierType(id: string, updates: Partial<CourrierTypeDefinition>) {
    const docRef = doc(db, COURRIER_TYPES, id);
    await updateDoc(docRef, updates);
  },

  async deleteCourrierType(id: string) {
    await deleteDoc(doc(db, COURRIER_TYPES, id));
  },

  // Courrier Statuses
  async getCourrierStatuses(organizationId: string): Promise<CourrierStatusDefinition[]> {
    const q = query(collection(db, COURRIER_STATUSES), where('organizationId', '==', organizationId), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourrierStatusDefinition));
  },

  async addCourrierStatus(status: Omit<CourrierStatusDefinition, 'id'>) {
    return await addDoc(collection(db, COURRIER_STATUSES), status);
  },

  async updateCourrierStatus(id: string, updates: Partial<CourrierStatusDefinition>) {
    const docRef = doc(db, COURRIER_STATUSES, id);
    await updateDoc(docRef, updates);
  },

  async deleteCourrierStatus(id: string) {
    await deleteDoc(doc(db, COURRIER_STATUSES, id));
  },

  // Courrier Priorities
  async getCourrierPriorities(organizationId: string): Promise<CourrierPriorityDefinition[]> {
    const q = query(collection(db, COURRIER_PRIORITIES), where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourrierPriorityDefinition));
  },

  async addCourrierPriority(priority: Omit<CourrierPriorityDefinition, 'id'>) {
    return await addDoc(collection(db, COURRIER_PRIORITIES), priority);
  },

  async updateCourrierPriority(id: string, updates: Partial<CourrierPriorityDefinition>) {
    const docRef = doc(db, COURRIER_PRIORITIES, id);
    await updateDoc(docRef, updates);
  },

  async deleteCourrierPriority(id: string) {
    await deleteDoc(doc(db, COURRIER_PRIORITIES, id));
  }
};
