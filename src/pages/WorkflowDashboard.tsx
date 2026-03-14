import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter, 
  Search,
  ChevronRight,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { workflowService } from '../services/workflowService';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { WorkflowInstance, Courrier, WorkflowDefinition } from '../types';
import { Link } from 'react-router-dom';

const WorkflowDashboard: React.FC = () => {
  const { user } = useAuth();
  const [instances, setInstances] = useState<(WorkflowInstance & { courrier?: Courrier; workflow?: WorkflowDefinition })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'termine' | 'refuse'>('all');

  useEffect(() => {
    if (user?.organizationId) {
      loadData();
    }
  }, [user, filter]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    let q = query(collection(db, 'workflow_instances'));
    // Note: In a real app, we'd filter by organizationId via courrier or workflow
    // For now, let's fetch all and filter client-side or assume they are scoped
    const snapshot = await getDocs(q);
    const instanceData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WorkflowInstance));
    
    const enriched = await Promise.all(instanceData.map(async (inst) => {
      const courrierSnap = await getDoc(doc(db, 'courriers', inst.courrierId));
      const workflowSnap = await getDoc(doc(db, 'workflow_definitions', inst.workflowId));
      
      const courrier = courrierSnap.exists() ? { id: courrierSnap.id, ...courrierSnap.data() } as Courrier : undefined;
      const workflow = workflowSnap.exists() ? { id: workflowSnap.id, ...workflowSnap.data() } as WorkflowDefinition : undefined;
      
      return { ...inst, courrier, workflow };
    }));

    // Filter by organization and status
    const filtered = enriched.filter(inst => {
      const orgMatch = inst.courrier?.organizationId === user.organizationId;
      const statusMatch = filter === 'all' || inst.status === filter;
      return orgMatch && statusMatch;
    });

    setInstances(filtered);
    setLoading(false);
  };

  const stats = {
    total: instances.length,
    pending: instances.filter(i => i.status === 'en_cours').length,
    completed: instances.filter(i => i.status === 'termine').length,
    rejected: instances.filter(i => i.status === 'refuse').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Workflow</h1>
          <p className="text-gray-500">Suivez l'état d'avancement des circuits de validation</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un courrier..."
              className="pl-10 pr-4 py-2 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminés</option>
            <option value="refuse">Refusés</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 p-3 rounded-xl">
              <FileText className="text-indigo-600" size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Workflows</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 p-3 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-sm text-gray-500">En cours</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-3 rounded-xl">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
          <div className="text-sm text-gray-500">Terminés</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-3 rounded-xl">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
          <div className="text-sm text-gray-500">Refusés</div>
        </div>
      </div>

      {/* Instance List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Courrier</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Workflow</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Étape Actuelle</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date Début</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {instances.map(inst => (
              <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{inst.courrier?.reference || 'N/A'}</div>
                  <div className="text-xs text-gray-500 truncate w-48">{inst.courrier?.objet}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{inst.workflow?.name}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {inst.currentStepIndex + 1}
                    </div>
                    <span className="text-sm text-gray-600">Étape {inst.currentStepIndex + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    inst.status === 'termine' ? 'bg-emerald-100 text-emerald-700' :
                    inst.status === 'refuse' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {inst.status === 'termine' ? 'Terminé' :
                     inst.status === 'refuse' ? 'Refusé' :
                     'En cours'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    {new Date(inst.startedAt).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link 
                    to={`/courriers?id=${inst.courrierId}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                  >
                    Détails
                    <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
            {instances.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  Aucun workflow trouvé
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Chargement...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkflowDashboard;
