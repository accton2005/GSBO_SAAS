import React, { useState } from 'react';
import { Save, Hash } from 'lucide-react';
import { AppSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  settings: AppSettings | null;
  onUpdate: () => void;
}

export const NumberingSettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const { organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(settings?.numbering || {
    entrantPrefix: 'CE',
    sortantPrefix: 'CS',
    initialNumber: 1,
    annualReset: true,
    autoCounter: true,
    currentEntrantNumber: 0,
    currentSortantNumber: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await settingsService.saveSettings(organization.id, {
        ...settings,
        numbering: formData
      } as any);
      onUpdate();
    } catch (error) {
      console.error('Error saving numbering settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Paramétrage de la Numérotation</h3>
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
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Hash size={18} className="text-indigo-600" />
            Courrier Entrant
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Préfixe</label>
              <input
                type="text"
                value={formData.entrantPrefix}
                onChange={(e) => setFormData({ ...formData, entrantPrefix: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ex: CE"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Exemple de format :</p>
              <p className="text-sm font-mono font-bold text-slate-700">
                {formData.entrantPrefix}-{new Date().getFullYear()}-0001
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Hash size={18} className="text-indigo-600" />
            Courrier Sortant
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Préfixe</label>
              <input
                type="text"
                value={formData.sortantPrefix}
                onChange={(e) => setFormData({ ...formData, sortantPrefix: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ex: CS"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Exemple de format :</p>
              <p className="text-sm font-mono font-bold text-slate-700">
                {formData.sortantPrefix}-{new Date().getFullYear()}-0001
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Numéro initial</label>
            <input
              type="number"
              value={formData.initialNumber}
              onChange={(e) => setFormData({ ...formData, initialNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              min="1"
            />
          </div>

          <div className="space-y-4 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.annualReset}
                onChange={(e) => setFormData({ ...formData, annualReset: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Réinitialisation annuelle</span>
            </label>
          </div>

          <div className="space-y-4 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoCounter}
                onChange={(e) => setFormData({ ...formData, autoCounter: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Compteur automatique</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
