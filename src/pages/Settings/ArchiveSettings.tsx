import React, { useState } from 'react';
import { Save, Archive, Folder, Database, Zap } from 'lucide-react';
import { AppSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  settings: AppSettings | null;
  onUpdate: () => void;
}

export const ArchiveSettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const { organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(settings?.archive || {
    path: 'Archives/',
    autoArchive: true,
    archiveDelayDays: 365,
    externalExportEnabled: false,
    externalStoragePath: '',
    autoCompression: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await settingsService.saveSettings(organization.id, {
        ...settings,
        archive: formData
      } as any);
      onUpdate();
    } catch (error) {
      console.error('Error saving archive settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Paramètres d'Archivage</h3>
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
              <Folder size={16} className="text-indigo-600" />
              Chemin du dossier d'archivage
            </label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
              placeholder="ex: Archives/"
            />
            <p className="text-xs text-slate-500">Structure: {formData.path}Année/Mois/Service/</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.autoArchive}
                onChange={(e) => setFormData({ ...formData, autoArchive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Archivage automatique</span>
                <span className="text-xs text-slate-500">Archiver les courriers traités après un certain délai</span>
              </div>
            </label>

            {formData.autoArchive && (
              <div className="pl-11 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Délai d'archivage (jours)</label>
                <input
                  type="number"
                  value={formData.archiveDelayDays}
                  onChange={(e) => setFormData({ ...formData, archiveDelayDays: parseInt(e.target.value) })}
                  className="w-32 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.externalExportEnabled}
                onChange={(e) => setFormData({ ...formData, externalExportEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Database size={16} />
                  Export vers stockage externe
                </span>
                <span className="text-xs text-slate-500">NAS / Serveur de fichiers distant</span>
              </div>
            </label>

            {formData.externalExportEnabled && (
              <div className="pl-11 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Chemin réseau / URL</label>
                <input
                  type="text"
                  value={formData.externalStoragePath}
                  onChange={(e) => setFormData({ ...formData, externalStoragePath: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  placeholder="ex: \\NAS-SERVER\Archives"
                />
              </div>
            )}

            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.autoCompression}
                onChange={(e) => setFormData({ ...formData, autoCompression: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Zap size={16} />
                  Compression automatique
                </span>
                <span className="text-xs text-slate-500">Compresser les documents pour économiser de l'espace</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
