import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Palette } from 'lucide-react';
import { settingsService } from '../../services/settingsService';

interface Props {
  organizationId: string;
  title: string;
  type: 'types' | 'statuses' | 'priorities';
  fields: {
    name: string;
    label: string;
    type: 'text' | 'color' | 'number';
    placeholder?: string;
  }[];
}

export const ManagementList: React.FC<Props> = ({ organizationId, title, type, fields }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>({});

  useEffect(() => {
    loadItems();
  }, [organizationId, type]);

  const loadItems = async () => {
    setLoading(true);
    let data: any[] = [];
    if (type === 'types') data = await settingsService.getCourrierTypes(organizationId);
    if (type === 'statuses') data = await settingsService.getCourrierStatuses(organizationId);
    if (type === 'priorities') data = await settingsService.getCourrierPriorities(organizationId);
    setItems(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentItem.name) return;

    if (currentItem.id) {
      if (type === 'types') await settingsService.updateCourrierType(currentItem.id, currentItem);
      if (type === 'statuses') await settingsService.updateCourrierStatus(currentItem.id, currentItem);
      if (type === 'priorities') await settingsService.updateCourrierPriority(currentItem.id, currentItem);
    } else {
      const newItem = { ...currentItem, organizationId };
      if (type === 'types') await settingsService.addCourrierType(newItem);
      if (type === 'statuses') await settingsService.addCourrierStatus(newItem);
      if (type === 'priorities') await settingsService.addCourrierPriority(newItem);
    }
    setIsEditing(false);
    setCurrentItem({});
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      if (type === 'types') await settingsService.deleteCourrierType(id);
      if (type === 'statuses') await settingsService.deleteCourrierStatus(id);
      if (type === 'priorities') await settingsService.deleteCourrierPriority(id);
      loadItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <button
          onClick={() => {
            setCurrentItem({});
            setIsEditing(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {isEditing && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">
              {currentItem.id ? 'Modifier' : 'Nouveau'}
            </h4>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{field.label}</label>
                {field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentItem[field.name] || '#000000'}
                      onChange={(e) => setCurrentItem({ ...currentItem, [field.name]: e.target.value })}
                      className="w-10 h-10 rounded-lg border-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentItem[field.name] || '#000000'}
                      onChange={(e) => setCurrentItem({ ...currentItem, [field.name]: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={currentItem[field.name] || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, [field.name]: field.type === 'number' ? parseInt(e.target.value) : e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save size={18} />
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              {item.color ? (
                <div className="w-10 h-10 rounded-lg shadow-inner" style={{ backgroundColor: item.color }}></div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <Palette size={20} />
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900">{item.name}</h4>
                {item.code && <span className="text-xs font-mono text-slate-500">{item.code}</span>}
                {item.maxProcessingDays && <span className="text-xs text-slate-500 ml-2">• Délai: {item.maxProcessingDays}j</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setCurrentItem(item);
                  setIsEditing(true);
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="md:col-span-2 p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400">Aucun élément configuré.</p>
          </div>
        )}
      </div>
    </div>
  );
};
