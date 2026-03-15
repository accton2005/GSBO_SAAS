import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Zap, 
  Users, 
  Database, 
  FileText,
  ShieldCheck,
  Headphones,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { logSaaSActivity, SaaSActivityType } from '../../services/saasService';
import { useAuth } from '../../contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  maxUsers: number;
  maxStorageGB: number;
  maxDocumentsPerMonth: number;
  apiAccess: boolean;
  workflowEnabled: boolean;
  supportLevel: 'standard' | 'priority' | 'dedicated';
  status: 'active' | 'inactive';
  createdAt: any;
}

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    maxUsers: 5,
    maxStorageGB: 10,
    maxDocumentsPerMonth: 500,
    apiAccess: false,
    workflowEnabled: false,
    supportLevel: 'standard' as 'standard' | 'priority' | 'dedicated',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'saas_plans'));
      const plansList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
      setPlans(plansList);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updateDoc(doc(db, 'saas_plans', editingPlan.id), formData);
        if (user) {
          await logSaaSActivity(user.id, SaaSActivityType.PLAN_UPDATED, `Plan ${formData.name} mis à jour`);
        }
      } else {
        const newDoc = await addDoc(collection(db, 'saas_plans'), {
          ...formData,
          createdAt: Timestamp.now(),
        });
        if (user) {
          await logSaaSActivity(user.id, SaaSActivityType.PLAN_CREATED, `Plan ${formData.name} créé`);
        }
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      setFormData({
        name: '',
        price: 0,
        maxUsers: 5,
        maxStorageGB: 10,
        maxDocumentsPerMonth: 500,
        apiAccess: false,
        workflowEnabled: false,
        supportLevel: 'standard' as 'standard' | 'priority' | 'dedicated',
        status: 'active' as 'active' | 'inactive',
      });
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      try {
        await deleteDoc(doc(db, 'saas_plans', id));
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      maxUsers: plan.maxUsers,
      maxStorageGB: plan.maxStorageGB,
      maxDocumentsPerMonth: plan.maxDocumentsPerMonth,
      apiAccess: plan.apiAccess,
      workflowEnabled: plan.workflowEnabled,
      supportLevel: plan.supportLevel,
      status: plan.status,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Plans SaaS</h2>
          <p className="text-slate-500">Créez et gérez les offres d'abonnement pour vos clients.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} /> Nouveau Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {plan.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">{plan.price}€</span>
                <span className="text-slate-500 text-sm">/ mois</span>
              </div>
            </div>
            <div className="p-8 flex-1 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Users size={16} className="text-indigo-600" />
                <span>Jusqu'à <strong>{plan.maxUsers}</strong> utilisateurs</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FileText size={16} className="text-indigo-600" />
                <span><strong>{plan.maxDocumentsPerMonth}</strong> courriers / mois</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Database size={16} className="text-indigo-600" />
                <span><strong>{plan.maxStorageGB} GB</strong> de stockage</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Zap size={16} className={plan.workflowEnabled ? 'text-indigo-600' : 'text-slate-300'} />
                <span className={plan.workflowEnabled ? '' : 'line-through text-slate-400'}>Workflows avancés</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheck size={16} className={plan.apiAccess ? 'text-indigo-600' : 'text-slate-300'} />
                <span className={plan.apiAccess ? '' : 'line-through text-slate-400'}>Accès API & Webhooks</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Headphones size={16} className="text-indigo-600" />
                <span className="capitalize">Support {plan.supportLevel}</span>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => openEditModal(plan)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Edit size={16} /> Modifier
              </button>
              <button 
                onClick={() => handleDelete(plan.id)}
                className="p-3 bg-white border border-slate-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-slate-900">{editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nom du Plan</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="ex: Professional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Prix Mensuel (€)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Max Utilisateurs</label>
                  <input 
                    type="number" 
                    required
                    value={formData.maxUsers}
                    onChange={e => setFormData({...formData, maxUsers: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Max Documents / mois</label>
                  <input 
                    type="number" 
                    required
                    value={formData.maxDocumentsPerMonth}
                    onChange={e => setFormData({...formData, maxDocumentsPerMonth: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Stockage (GB)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.maxStorageGB}
                    onChange={e => setFormData({...formData, maxStorageGB: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Niveau de Support</label>
                  <select 
                    value={formData.supportLevel}
                    onChange={e => setFormData({...formData, supportLevel: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="standard">Standard</option>
                    <option value="priority">Prioritaire</option>
                    <option value="dedicated">Dédié</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="apiAccess"
                    checked={formData.apiAccess}
                    onChange={e => setFormData({...formData, apiAccess: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="apiAccess" className="text-sm font-medium text-slate-700">Accès API & Webhooks</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="workflowEnabled"
                    checked={formData.workflowEnabled}
                    onChange={e => setFormData({...formData, workflowEnabled: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="workflowEnabled" className="text-sm font-medium text-slate-700">Workflows avancés activés</label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Statut</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: 'active'})}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Actif
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: 'inactive'})}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.status === 'inactive' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Inactif
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                  {editingPlan ? 'Mettre à jour le Plan' : 'Créer le Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
