import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  Users, 
  Settings, 
  Archive, 
  ShieldCheck,
  BarChart3,
  LogOut,
  GitBranch,
  Settings2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../contexts/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  role: 'admin' | 'agent' | 'viewer' | 'superadmin' | 'secretariat' | 'chef_service' | 'direction';
  orgName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, orgName }) => {
  const { logout } = useAuth();
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';

  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/', roles: ['admin', 'agent', 'viewer', 'secretariat', 'chef_service', 'direction'] },
    { icon: Inbox, label: 'Courriers Entrants', path: '/entrants', roles: ['admin', 'agent', 'viewer', 'secretariat', 'chef_service', 'direction'] },
    { icon: Send, label: 'Courriers Sortants', path: '/sortants', roles: ['admin', 'agent', 'viewer', 'secretariat', 'chef_service', 'direction'] },
    { icon: GitBranch, label: 'Suivi Workflows', path: '/workflows', roles: ['admin', 'agent', 'secretariat', 'chef_service', 'direction'] },
    { icon: Archive, label: 'Archives', path: '/archives', roles: ['admin', 'agent', 'viewer', 'secretariat', 'chef_service', 'direction'] },
    { icon: Users, label: 'Utilisateurs', path: '/users', roles: ['admin'] },
    { icon: Settings2, label: 'Config. Workflows', path: '/workflow-builder', roles: ['admin'] },
    { icon: BarChart3, label: 'Statistiques', path: '/stats', roles: ['admin'] },
    { icon: Settings, label: 'Paramétrage', path: '/settings', roles: ['admin'] },
    // Super Admin items
    { icon: ShieldCheck, label: 'Gestion SaaS', path: '/saas-admin', roles: ['superadmin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold truncate">{orgName || 'Gestion Courrier'}</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{role}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
