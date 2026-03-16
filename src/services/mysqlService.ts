import { Courrier, User, Organization } from '../types';

const API_BASE_URL = 'http://localhost/courrierflow/api'; // Adjust to your XAMPP path

export const mysqlService = {
  // Auth
  login: async (email: string, pass: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    return data.user;
  },

  // Organizations
  getOrganization: async (orgId: string): Promise<Organization> => {
    const response = await fetch(`${API_BASE_URL}/organizations.php?id=${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch organization');
    return await response.json();
  },

  createOrganization: async (orgData: Omit<Organization, 'id'>): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/organizations.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });
    if (!response.ok) throw new Error('Failed to create organization');
    const data = await response.json();
    return data.id;
  },

  // Users
  getUsers: async (orgId: string): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users.php?orgId=${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/users.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to create user');
    const data = await response.json();
    return data.id;
  },

  // Courriers
  getCourriers: async (orgId: string, type?: string): Promise<Courrier[]> => {
    const url = new URL(`${API_BASE_URL}/courriers.php`);
    url.searchParams.append('orgId', orgId);
    if (type) url.searchParams.append('type', type);
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch courriers');
    return await response.json();
  },

  createCourrier: async (courrierData: Omit<Courrier, 'id'>): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/courriers.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courrierData)
    });
    if (!response.ok) throw new Error('Failed to create courrier');
    const data = await response.json();
    return data.id;
  },

  updateCourrier: async (courrierId: string, data: Partial<Courrier>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/courriers.php?id=${courrierId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update courrier');
  },

  deleteCourrier: async (courrierId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/courriers.php?id=${courrierId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete courrier');
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users.php?id=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update user');
  },

  deleteUser: async (userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users.php?id=${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  updateOrganization: async (orgId: string, data: Partial<Organization>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/organizations.php?id=${orgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update organization');
  },

  deleteOrganization: async (orgId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/organizations.php?id=${orgId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete organization');
  },

  // Services
  getServices: async (orgId: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/services.php?orgId=${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return await response.json();
  },

  createService: async (serviceData: any): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/services.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData)
    });
    if (!response.ok) throw new Error('Failed to create service');
    const data = await response.json();
    return data.id;
  },

  updateService: async (serviceId: string, data: any): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/services.php?id=${serviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update service');
  },

  deleteService: async (serviceId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/services.php?id=${serviceId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete service');
  },

  // Audit Logs
  getAuditLogs: async (orgId: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/audit_logs.php?orgId=${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return await response.json();
  },

  createAuditLog: async (logData: any): Promise<void> => {
    await fetch(`${API_BASE_URL}/audit_logs.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
  }
};
