import React, { useState } from 'react';
import { Save, Scan, Zap, Layers } from 'lucide-react';
import { AppSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  settings: AppSettings | null;
  onUpdate: () => void;
}

export const ScannerSettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const { organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(settings?.scanner || {
    enabled: true,
    source: 'WIA-Scanner-01',
    resolutionDpi: 300,
    defaultFormat: 'pdf',
    autoCompression: true,
    multiPage: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await settingsService.saveSettings(organization.id, {
        ...settings,
        scanner: formData
      } as any);
      onUpdate();
    } catch (error) {
      console.error('Error saving scanner settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Paramètres Scan Documents</h3>
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
          <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Scan size={16} />
                Activer le scanner
              </span>
              <span className="text-xs text-slate-500">Permettre la numérisation directe depuis l'interface</span>
            </div>
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Source du scanner</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="WIA-Scanner-01">WIA-Scanner-01 (Défaut)</option>
              <option value="TWAIN-HP-LaserJet">TWAIN-HP-LaserJet</option>
              <option value="Network-Scanner-IP">Scanner Réseau (IP)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Résolution (DPI)</label>
            <select
              value={formData.resolutionDpi}
              onChange={(e) => setFormData({ ...formData, resolutionDpi: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="150">150 DPI (Rapide)</option>
              <option value="300">300 DPI (Standard)</option>
              <option value="600">600 DPI (Haute qualité)</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Format par défaut</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  checked={formData.defaultFormat === 'pdf'}
                  onChange={() => setFormData({ ...formData, defaultFormat: 'pdf' })}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium">PDF</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  checked={formData.defaultFormat === 'jpg'}
                  onChange={() => setFormData({ ...formData, defaultFormat: 'jpg' })}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium">JPG</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
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
                <span className="text-xs text-slate-500">Réduire la taille des fichiers numérisés</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.multiPage}
                onChange={(e) => setFormData({ ...formData, multiPage: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Layers size={16} />
                  Scan multipage
                </span>
                <span className="text-xs text-slate-500">Combiner plusieurs pages dans un seul document</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
