import React, { useState } from 'react';
import { Save, Bell, Mail, Monitor, AlertTriangle, Clock } from 'lucide-react';
import { AppSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  settings: AppSettings | null;
  onUpdate: () => void;
}

export const NotificationSettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const { organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(settings?.notifications || {
    emailEnabled: true,
    internalEnabled: true,
    urgentAlertEnabled: true,
    delayAlertEnabled: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await settingsService.saveSettings(organization.id, {
        ...settings,
        notifications: formData
      } as any);
      onUpdate();
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Paramètres des Notifications</h3>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="flex items-center gap-4 p-6 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Mail size={24} />
          </div>
          <div className="flex-1">
            <span className="block text-sm font-bold text-slate-900">Notifications Email</span>
            <span className="text-xs text-slate-500">Envoyer des alertes par courrier électronique</span>
          </div>
          <input
            type="checkbox"
            checked={formData.emailEnabled}
            onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>

        <label className="flex items-center gap-4 p-6 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <Monitor size={24} />
          </div>
          <div className="flex-1">
            <span className="block text-sm font-bold text-slate-900">Notifications Internes</span>
            <span className="text-xs text-slate-500">Afficher des bulles de notification dans l'application</span>
          </div>
          <input
            type="checkbox"
            checked={formData.internalEnabled}
            onChange={(e) => setFormData({ ...formData, internalEnabled: e.target.checked })}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>

        <label className="flex items-center gap-4 p-6 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <span className="block text-sm font-bold text-slate-900">Alerte Courrier Urgent</span>
            <span className="text-xs text-slate-500">Notifier immédiatement pour les courriers à haute priorité</span>
          </div>
          <input
            type="checkbox"
            checked={formData.urgentAlertEnabled}
            onChange={(e) => setFormData({ ...formData, urgentAlertEnabled: e.target.checked })}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>

        <label className="flex items-center gap-4 p-6 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <span className="block text-sm font-bold text-slate-900">Alerte Retard Traitement</span>
            <span className="text-xs text-slate-500">Notifier quand un courrier dépasse le délai de traitement</span>
          </div>
          <input
            type="checkbox"
            checked={formData.delayAlertEnabled}
            onChange={(e) => setFormData({ ...formData, delayAlertEnabled: e.target.checked })}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>
      </div>
    </form>
  );
};
