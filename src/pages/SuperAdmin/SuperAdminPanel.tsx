import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search,
  Zap,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SuperAdminDashboard from './SuperAdminDashboard';
import PlanManagement from './PlanManagement';
import OrganizationManagement from './OrganizationManagement';

const SuperAdminPanel: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, component: <SuperAdminDashboard /> },
    { id: 'organizations', label: 'Organisations', icon: Building2, component: <OrganizationManagement /> },
    { id: 'plans', label: 'Plans SaaS', icon: Zap, component: <PlanManagement /> },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard, component: <div className="p-8 text-center text-slate-500">Gestion des abonnements (En cours de développement)</div> },
    { id: 'users', label: 'Utilisateurs SaaS', icon: Users, component: <div className="p-8 text-center text-slate-500">Gestion des utilisateurs (En cours de développement)</div> },
    { id: 'activity', label: 'Logs d\'activité', icon: Activity, component: <div className="p-8 text-center text-slate-500">Logs d'activité (En cours de développement)</div> },
    { id: 'settings', label: 'Paramètres Globaux', icon: Settings, component: <div className="p-8 text-center text-slate-500">Paramètres (En cours de développement)</div> },
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.component : <SuperAdminDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block">SuperAdmin</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">CourrierFlow SaaS</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                  activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-slate-50">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@courrierflow.com</div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-slate-400 hover:text-slate-600 ${isSidebarOpen ? 'hidden' : 'block'}`}>
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Recherche globale..."
                className="w-80 pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">Admin System</div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">En ligne</div>
              </div>
              <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-10 h-10 rounded-xl border border-slate-100" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminPanel;
