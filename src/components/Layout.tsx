import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'agent' | 'viewer' | 'superadmin';
  orgName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, orgName }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} orgName={orgName} />
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
