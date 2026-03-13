import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Palette, 
  Globe, 
  Lock, 
  Bell, 
  Save,
  Upload,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateOrganization } from '../services/firebaseService';

export const Settings: React.FC = () => {
  const { organization } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    primaryColor: '#4f46e5',
    logo: ''
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        domain: organization.domain || '',
        primaryColor: organization.settings?.primaryColor || '#4f46e5',
        logo: organization.settings?.logo || ''
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    setIsSaving(true);
    try {
      await updateOrganization(organization.id, {
        name: formData.name,
        domain: formData.domain,
        settings: {
          ...organization.settings,
          primaryColor: formData.primaryColor,
          logo: formData.logo
        }
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'domain', label: 'Domaine', icon: Globe },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Paramètres</h2>
        <p className="text-slate-500">Configurez votre instance et personnalisez votre expérience.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Informations Générales</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nom de l'Administration</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="ex: Mairie de Paris"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Une brève description de votre administration..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Personnalisation Visuelle</h3>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-700">Logo de l'Administration</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon size={24} />
                        )}
                      </div>
                      <div className="space-y-2">
                        <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                          Changer le logo
                        </button>
                        <p className="text-xs text-slate-500">PNG, JPG jusqu'à 2MB. Recommandé: 512x512px.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Couleur Primaire</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                        className="w-12 h-12 rounded-lg border-none cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domain' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Configuration du Domaine</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-700">
                      Votre instance est actuellement accessible via le sous-domaine par défaut.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Sous-domaine</label>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        value={formData.domain}
                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="mairie-paris"
                      />
                      <span className="px-4 py-2 bg-slate-50 border border-l-0 border-slate-200 rounded-r-lg text-slate-500 text-sm">
                        .courrier-saas.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showSuccess && (
                  <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                    <Check size={16} />
                    Paramètres enregistrés !
                  </span>
                )}
              </div>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save size={20} />
                )}
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
