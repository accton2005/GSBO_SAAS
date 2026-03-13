import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Courrier, CourrierStatus, Priority } from '../types';
import { CourrierModal } from '../components/CourrierModal';
import { getCourriers, createCourrier, deleteCourrier } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

export const Courriers: React.FC<{ type: 'entrant' | 'sortant' }> = ({ type }) => {
  const { organization } = useAuth();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;

    const unsubscribe = getCourriers(organization.id, type, (data) => {
      setCourriers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organization?.id, type]);

  const handleSave = async (data: any) => {
    if (!organization?.id) return;
    
    try {
      await createCourrier({
        ...data,
        organizationId: organization.id
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving courrier:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce courrier ?')) {
      try {
        await deleteCourrier(id);
      } catch (error) {
        console.error('Error deleting courrier:', error);
      }
    }
  };

  const statusColors: Record<CourrierStatus, string> = {
    nouveau: 'bg-blue-100 text-blue-700',
    en_cours: 'bg-amber-100 text-amber-700',
    traite: 'bg-emerald-100 text-emerald-700',
    archive: 'bg-slate-100 text-slate-700'
  };

  const priorityIcons: Record<Priority, any> = {
    basse: { icon: Clock, color: 'text-slate-400' },
    normale: { icon: CheckCircle2, color: 'text-blue-500' },
    haute: { icon: AlertCircle, color: 'text-amber-500' },
    urgente: { icon: AlertCircle, color: 'text-rose-500' }
  };

  const filteredCourriers = courriers.filter(c => 
    c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.expediteur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <CourrierModal 
          type={type} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Courriers {type === 'entrant' ? 'Entrants' : 'Sortants'}
          </h2>
          <p className="text-slate-500">Gérez et suivez votre correspondance administrative.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nouveau Courrier
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par référence, objet, expéditeur..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            Filtres
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 text-sm">Chargement des courriers...</p>
            </div>
          ) : filteredCourriers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <p className="text-slate-900 font-medium">Aucun courrier trouvé</p>
              <p className="text-slate-500 text-sm mt-1">Commencez par en ajouter un nouveau.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Référence</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Objet & Expéditeur</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priorité</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourriers.map((courrier) => {
                  const PriorityIcon = priorityIcons[courrier.priority].icon;
                  return (
                    <tr key={courrier.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-indigo-600">{courrier.reference}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{courrier.objet}</span>
                          <span className="text-xs text-slate-500">{courrier.expediteur}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {new Date(courrier.dateReception || courrier.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PriorityIcon size={16} className={priorityIcons[courrier.priority].color} />
                          <span className="text-xs capitalize text-slate-600">{courrier.priority}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[courrier.status]}`}>
                          {courrier.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="Voir" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                          <button title="Modifier" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(courrier.id)}
                            title="Supprimer" 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <button className="p-2 text-slate-400 group-hover:hidden">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
