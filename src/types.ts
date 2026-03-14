export type UserRole = 'admin' | 'agent' | 'viewer' | 'superadmin' | 'secretariat' | 'chef_service' | 'direction';
export type CourrierType = 'entrant' | 'sortant';
export type CourrierStatus = 'nouveau' | 'en_cours' | 'traite' | 'archive' | 'en_workflow';
export type Priority = 'basse' | 'normale' | 'haute' | 'urgente';

export type WorkflowStatus = 'en_attente' | 'en_cours' | 'valide' | 'refuse' | 'ignore' | 'termine';
export type WorkflowActionType = 'valider' | 'refuser' | 'transferer' | 'commenter' | 'demander_modification';

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
  workflowInstanceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
}

export interface WorkflowDefinition {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  name: string;
  order: number;
  roleRequired: UserRole;
  actionRequired: string;
  isMandatory: boolean;
  deadlineDays?: number;
  deadlineHours?: number;
  createdAt: string;
}

export interface WorkflowInstance {
  id: string;
  courrierId: string;
  workflowId: string;
  currentStepIndex: number;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowInstanceStep {
  id: string;
  instanceId: string;
  stepId: string;
  assignedUser?: string;
  status: WorkflowStatus;
  comment?: string;
  actionDate?: string;
}

export interface WorkflowAction {
  id: string;
  instanceStepId: string;
  actionType: WorkflowActionType;
  userId: string;
  comment: string;
  timestamp: string;
}

export interface WorkflowTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
}

export interface WorkflowRule {
  id: string;
  workflowId: string;
  ruleType: string;
  condition: string;
  action: string;
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

export interface AppSettings {
  id: string;
  organizationId: string;
  general: {
    adminName: string;
    logoUrl?: string;
    faviconUrl?: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    language: string;
    timezone: string;
    dateFormat: string;
    welcomeMessage: string;
  };
  ui: {
    primaryColor: string;
    secondaryColor: string;
    themeMode: 'light' | 'dark' | 'system';
    footerText: string;
    showLogoOnLogin: boolean;
    showLogoOnDashboard: boolean;
    showLogoOnReports: boolean;
  };
  numbering: {
    entrantPrefix: string;
    sortantPrefix: string;
    initialNumber: number;
    annualReset: boolean;
    autoCounter: boolean;
    currentEntrantNumber: number;
    currentSortantNumber: number;
  };
  archive: {
    path: string;
    autoArchive: boolean;
    archiveDelayDays: number;
    externalExportEnabled: boolean;
    externalStoragePath?: string;
    autoCompression: boolean;
  };
  scanner: {
    enabled: boolean;
    source: string;
    resolutionDpi: number;
    defaultFormat: 'pdf' | 'jpg';
    autoCompression: boolean;
    multiPage: boolean;
  };
  security: {
    sessionDurationMinutes: number;
    passwordPolicy: 'simple' | 'medium' | 'strong';
    maxLoginAttempts: number;
    enable2FA: boolean;
    enableUserLogging: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    internalEnabled: boolean;
    urgentAlertEnabled: boolean;
    delayAlertEnabled: boolean;
  };
  backup: {
    autoDatabaseBackup: boolean;
    autoDocumentBackup: boolean;
    backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    lastBackupDate?: string;
  };
}

export interface CourrierTypeDefinition {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description?: string;
}

export interface CourrierStatusDefinition {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface CourrierPriorityDefinition {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  maxProcessingDays: number;
}

export interface ServiceDefinition {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  headOfService?: string;
  description?: string;
}
