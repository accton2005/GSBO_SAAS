export type UserRole = 'admin' | 'agent' | 'viewer' | 'superadmin';
export type CourrierType = 'entrant' | 'sortant';
export type CourrierStatus = 'nouveau' | 'en_cours' | 'traite' | 'archive';
export type Priority = 'basse' | 'normale' | 'haute' | 'urgente';

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  domain: string;
  subscriptionPlanId: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  settings: {
    appName: string;
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    loginBranding?: string;
  };
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  serviceId?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Courrier {
  id: string;
  organizationId: string;
  type: CourrierType;
  reference: string;
  objet: string;
  expediteur: string;
  destinataire: string;
  dateReception: string;
  status: CourrierStatus;
  priority: Priority;
  documentUrl?: string;
  ocrText?: string;
  qrCodeData?: string;
  barcodeData?: string;
  serviceId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  userLimit: number;
  storageLimit: number;
  features: string[];
}

export interface UsageStats {
  organizationId: string;
  usersCount: number;
  storageUsed: number;
  courriersCount: number;
  ocrUsage: number;
  lastUpdated: string;
}
