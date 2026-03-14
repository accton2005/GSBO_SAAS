import React, { useState } from 'react';
import { Save, Shield, Lock, UserCheck, History } from 'lucide-react';
import { AppSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  settings: AppSettings | null;
  onUpdate: () => void;
}

export const SecuritySettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const { organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(settings?.security || {
    sessionDurationMinutes: 60,
    passwordPolicy: 'medium',
    maxLoginAttempts: 5,
    enable2FA: false,
    enableUserLogging: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await settingsService.saveSettings(organization.id, {
        ...settings,
        security: formData
      } as any);
      onUpdate();
    } catch (error) {
      console.error('Error saving security settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Paramètres de Sécurité</h3>
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
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <History size={16} className="text-indigo-600" />
              Durée de session (minutes)
            </label>
            <input
              type="number"
              value={formData.sessionDurationMinutes}
              onChange={(e) => setFormData({ ...formData, sessionDurationMinutes: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              min="5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Lock size={16} className="text-indigo-600" />
              Politique de mot de passe
            </label>
            <select
              value={formData.passwordPolicy}
              onChange={(e) => setFormData({ ...formData, passwordPolicy: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="simple">Simple (6+ caractères)</option>
              <option value="medium">Moyenne (8+ caractères, chiffres)</option>
              <option value="strong">Forte (10+ caractères, majuscules, symboles)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nombre maximum de tentatives</label>
            <input
              type="number"
              value={formData.maxLoginAttempts}
              onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              min="1"
              max="10"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.enable2FA}
                onChange={(e) => setFormData({ ...formData, enable2FA: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <UserCheck size={16} />
                  Double authentification (2FA)
                </span>
                <span className="text-xs text-slate-500">Renforcer la sécurité des comptes administrateurs</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.enableUserLogging}
                onChange={(e) => setFormData({ ...formData, enableUserLogging: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Shield size={16} />
                  Journalisation des actions
                </span>
                <span className="text-xs text-slate-500">Enregistrer toutes les modifications effectuées par les utilisateurs</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
