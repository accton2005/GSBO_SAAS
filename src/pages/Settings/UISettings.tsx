import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { AppSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  settings: AppSettings | null;
  onUpdate: () => void;
}

export const UISettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const { organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(settings?.ui || {
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    themeMode: 'light',
    footerText: '© 2026 Gestion des Courriers. Tous droits réservés.',
    showLogoOnLogin: true,
    showLogoOnDashboard: true,
    showLogoOnReports: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await settingsService.saveSettings(organization.id, {
        ...settings,
        ui: formData
      } as any);
      onUpdate();
    } catch (error) {
      console.error('Error saving UI settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Personnalisation de l'Interface</h3>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-700">Couleur principale</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg border-none cursor-pointer"
            />
            <input
              type="text"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-700">Couleur secondaire</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg border-none cursor-pointer"
            />
            <input
              type="text"
              value={formData.secondaryColor}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mode d'affichage</label>
          <select
            value={formData.themeMode}
            onChange={(e) => setFormData({ ...formData, themeMode: e.target.value as any })}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="light">Mode Clair</option>
            <option value="dark">Mode Sombre</option>
            <option value="system">Système</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Texte du pied de page</label>
          <input
            type="text"
            value={formData.footerText}
            onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          <label className="text-sm font-medium text-slate-700">Affichage du logo</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.showLogoOnLogin}
                onChange={(e) => setFormData({ ...formData, showLogoOnLogin: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Page de connexion</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.showLogoOnDashboard}
                onChange={(e) => setFormData({ ...formData, showLogoOnDashboard: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Tableau de bord</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.showLogoOnReports}
                onChange={(e) => setFormData({ ...formData, showLogoOnReports: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Rapports PDF</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
