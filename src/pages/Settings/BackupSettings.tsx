import React, { useState } from 'react';
import { Save, Database, Download, RefreshCw, Calendar, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  settings: AppSettings | null;
  onUpdate: () => void;
}

export const BackupSettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const { organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(settings?.backup || {
    autoDatabaseBackup: true,
    autoDocumentBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await settingsService.saveSettings(organization.id, {
        ...settings,
        backup: formData
      } as any);
      onUpdate();
    } catch (error) {
      console.error('Error saving backup settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Paramètres de Sauvegarde</h3>
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
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-indigo-900">Sauvegarde Sécurisée</h4>
              <p className="text-sm text-indigo-700 mt-1">
                Les sauvegardes sont chiffrées et stockées sur un serveur sécurisé. Vous pouvez restaurer vos données à tout moment.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.autoDatabaseBackup}
                onChange={(e) => setFormData({ ...formData, autoDatabaseBackup: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Database size={16} />
                  Sauvegarde auto de la base de données
                </span>
                <span className="text-xs text-slate-500">Inclut les courriers, utilisateurs et configurations</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.autoDocumentBackup}
                onChange={(e) => setFormData({ ...formData, autoDocumentBackup: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Download size={16} />
                  Sauvegarde auto des documents (PJ)
                </span>
                <span className="text-xs text-slate-500">Inclut tous les fichiers PDF et images numérisés</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-600" />
              Fréquence de sauvegarde
            </label>
            <select
              value={formData.backupFrequency}
              onChange={(e) => setFormData({ ...formData, backupFrequency: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="hourly">Toutes les heures</option>
              <option value="daily">Quotidienne (Recommandé)</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Rétention des sauvegardes (jours)</label>
            <input
              type="number"
              value={formData.retentionDays}
              onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              min="1"
            />
          </div>

          <div className="pt-4">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <RefreshCw size={20} />
              Lancer une sauvegarde manuelle
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
