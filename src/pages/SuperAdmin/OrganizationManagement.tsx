import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Building2, 
  Users, 
  CreditCard, 
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface Organization {
  id: string;
  name: string;
  domain?: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  currentPlanId: string;
  planName?: string;
  createdAt: any;
  userCount?: number;
  docCount?: number;
}

const OrganizationManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'organizations'), orderBy('createdAt', 'desc')));
      const orgsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
      
      // In a real app, we'd fetch user counts and plan names too
      // For now, we'll mock some of these fields
      const enrichedOrgs = orgsList.map(org => ({
        ...org,
        planName: org.currentPlanId === 'starter' ? 'Starter' : 'Professional',
        userCount: Math.floor(Math.random() * 20) + 1,
        docCount: Math.floor(Math.random() * 1000),
      }));

      setOrganizations(enrichedOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Organization['status']) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle2 size={14} /> Actif</span>;
      case 'suspended':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle size={14} /> Suspendu</span>;
      case 'trial':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider"><AlertCircle size={14} /> Essai</span>;
      case 'expired':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider"><AlertCircle size={14} /> Expiré</span>;
      default:
        return null;
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Organisations</h2>
          <p className="text-slate-500">Visualisez et gérez toutes les organisations inscrites sur la plateforme.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Organisation</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Utilisateurs</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Documents</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400">Chargement des données...</td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400">Aucune organisation trouvée.</td>
                </tr>
              ) : filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{org.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <ExternalLink size={10} /> {org.domain || 'Pas de domaine'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(org.status)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <CreditCard size={16} className="text-slate-400" />
                      {org.planName}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Users size={16} className="text-slate-400" />
                      {org.userCount}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-slate-700">
                      {org.docCount}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Affichage de <strong>{filteredOrgs.length}</strong> sur <strong>{organizations.length}</strong> organisations
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50" disabled>Précédent</button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50" disabled>Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagement;
