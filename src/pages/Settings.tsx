import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Palette, 
  Hash, 
  Users, 
  FileText, 
  Activity, 
  BarChart3, 
  Archive, 
  Scan, 
  Shield, 
  Bell, 
  Database,
  Share2,
  Save,
  Check,
  Plus,
  Trash2,
  Edit2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { settingsService } from '../services/settingsService';
import { 
  AppSettings, 
  ServiceDefinition, 
  CourrierTypeDefinition, 
  CourrierStatusDefinition, 
  CourrierPriorityDefinition 
} from '../types';

// Sub-components for each tab
import { GeneralSettings } from './Settings/GeneralSettings';
import { UISettings } from './Settings/UISettings';
import { NumberingSettings } from './Settings/NumberingSettings';
import { ServiceManagement } from './Settings/ServiceManagement';
import { TypeManagement, StatusManagement, PriorityManagement } from './Settings/ManagementWrappers';
import { ArchiveSettings } from './Settings/ArchiveSettings';
import { ScannerSettings } from './Settings/ScannerSettings';
import { SecuritySettings } from './Settings/SecuritySettings';
import { NotificationSettings } from './Settings/NotificationSettings';
import { BackupSettings } from './Settings/BackupSettings';
import { IntegrationSettings } from './Settings/IntegrationSettings';

export const Settings: React.FC = () => {
  const { organization, user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (organization?.id) {
      loadSettings();
    }
  }, [organization?.id]);

  const loadSettings = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const settings = await settingsService.getSettings(organization.id);
    setAppSettings(settings);
    setLoading(false);
  };

  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Accès Refusé</h2>
        <p className="text-slate-500">Seuls les administrateurs peuvent accéder à ce module.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'ui', label: 'Interface', icon: Palette },
    { id: 'numbering', label: 'Numérotation', icon: Hash },
    { id: 'services', label: 'Services', icon: Users },
    { id: 'types', label: 'Types', icon: FileText },
    { id: 'statuses', label: 'Statuts', icon: Activity },
    { id: 'priorities', label: 'Priorités', icon: BarChart3 },
    { id: 'archive', label: 'Archivage', icon: Archive },
    { id: 'scanner', label: 'Scanner', icon: Scan },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Intégrations', icon: Share2 },
    { id: 'backup', label: 'Sauvegarde', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Paramétrage du Système</h2>
        <p className="text-slate-500">Configurez et personnalisez l'application selon vos besoins administratifs.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-72 shrink-0">
          <nav className="space-y-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                <span className="flex-1 text-left">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-full p-12">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6 lg:p-8">
                {activeTab === 'general' && <GeneralSettings settings={appSettings} onUpdate={loadSettings} />}
                {activeTab === 'ui' && <UISettings settings={appSettings} onUpdate={loadSettings} />}
                {activeTab === 'numbering' && <NumberingSettings settings={appSettings} onUpdate={loadSettings} />}
                {activeTab === 'services' && <ServiceManagement organizationId={organization!.id} />}
                {activeTab === 'types' && <TypeManagement organizationId={organization!.id} />}
                {activeTab === 'statuses' && <StatusManagement organizationId={organization!.id} />}
                {activeTab === 'priorities' && <PriorityManagement organizationId={organization!.id} />}
                {activeTab === 'archive' && <ArchiveSettings settings={appSettings} onUpdate={loadSettings} />}
                {activeTab === 'scanner' && <ScannerSettings settings={appSettings} onUpdate={loadSettings} />}
                {activeTab === 'security' && <SecuritySettings settings={appSettings} onUpdate={loadSettings} />}
                {activeTab === 'notifications' && <NotificationSettings settings={appSettings} onUpdate={loadSettings} />}
                {activeTab === 'integrations' && <IntegrationSettings organizationId={organization!.id} />}
                {activeTab === 'backup' && <BackupSettings settings={appSettings} onUpdate={loadSettings} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
