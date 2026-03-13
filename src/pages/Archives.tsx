import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Search, 
  Filter, 
  Download, 
  Eye,
  FileSearch,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCourriers } from '../services/firebaseService';
import { Courrier } from '../types';

export const Archives: React.FC = () => {
  const { organization } = useAuth();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;

    // Listen to archived courriers
    const unsubscribe = getCourriers(organization.id, undefined, (data) => {
      setCourriers(data.filter(c => c.status === 'archive'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organization?.id]);

  const filteredArchives = courriers.filter(c => 
    c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.expediteur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Archives Numériques</h2>
          <p className="text-slate-500">Consultez et récupérez vos documents archivés.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm">
          <FileSearch size={20} />
          Recherche Avancée
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher dans les archives..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar size={18} />
            Année
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            Type
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 text-sm">Chargement des archives...</p>
        </div>
      ) : filteredArchives.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive size={32} />
          </div>
          <p className="text-slate-900 font-medium">Aucune archive trouvée</p>
          <p className="text-slate-500 text-sm mt-1">Les courriers marqués comme "archivés" apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchives.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Archive size={24} />
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg">
                  <Download size={18} />
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-600 font-mono">{item.reference}</p>
                <h4 className="font-bold text-slate-900 line-clamp-1">{item.objet}</h4>
                <p className="text-xs text-slate-500">
                  {item.expediteur} • Archivé le {new Date(item.updatedAt || item.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  <Eye size={14} />
                  Consulter
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {item.documentUrl ? 'PDF • 2.4 MB' : 'Sans document'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
