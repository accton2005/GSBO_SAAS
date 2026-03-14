import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Users, Save, X } from 'lucide-react';
import { ServiceDefinition } from '../../types';
import { settingsService } from '../../services/settingsService';

interface Props {
  organizationId: string;
}

export const ServiceManagement: React.FC<Props> = ({ organizationId }) => {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<ServiceDefinition>>({});

  useEffect(() => {
    loadServices();
  }, [organizationId]);

  const loadServices = async () => {
    setLoading(true);
    const data = await settingsService.getServices(organizationId);
    setServices(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentService.name || !currentService.code) return;

    if (currentService.id) {
      await settingsService.updateService(currentService.id, currentService);
    } else {
      await settingsService.addService({
        ...currentService as any,
        organizationId
      });
    }
    setIsEditing(false);
    setCurrentService({});
    loadServices();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      await settingsService.deleteService(id);
      loadServices();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Gestion des Services / Départements</h3>
        <button
          onClick={() => {
            setCurrentService({});
            setIsEditing(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Ajouter un service
        </button>
      </div>

      {isEditing && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">
              {currentService.id ? 'Modifier le service' : 'Nouveau service'}
            </h4>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nom du service</label>
              <input
                type="text"
                value={currentService.name || ''}
                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ex: Ressources Humaines"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Code service</label>
              <input
                type="text"
                value={currentService.code || ''}
                onChange={(e) => setCurrentService({ ...currentService, code: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ex: RH"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Chef de service</label>
              <input
                type="text"
                value={currentService.headOfService || ''}
                onChange={(e) => setCurrentService({ ...currentService, headOfService: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Nom du responsable"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
              <input
                type="text"
                value={currentService.description || ''}
                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
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
        {services.map((service) => (
          <div key={service.id} className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{service.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{service.code}</span>
                  {service.headOfService && <span>• {service.headOfService}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setCurrentService(service);
                  setIsEditing(true);
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && !loading && (
          <div className="md:col-span-2 p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400">Aucun service configuré.</p>
          </div>
        )}
      </div>
    </div>
  );
};
