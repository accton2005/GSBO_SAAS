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
import { Courrier, CourrierStatus, Priority, WorkflowDefinition } from '../types';
import { CourrierModal } from '../components/CourrierModal';
import { getCourriers, createCourrier, deleteCourrier, updateCourrier } from '../services/firebaseService';
import { workflowService } from '../services/workflowService';
import { integrationService } from '../services/integrationService';
import { useAuth } from '../contexts/AuthContext';
import WorkflowTimeline from '../components/WorkflowTimeline';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ChevronRight } from 'lucide-react';

export const Courriers: React.FC<{ type: 'entrant' | 'sortant' }> = ({ type }) => {
  const { organization, user } = useAuth();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [isStartingWorkflow, setIsStartingWorkflow] = useState(false);

  useEffect(() => {
    if (!organization?.id) return;

    const unsubscribe = getCourriers(organization.id, type, (data) => {
      setCourriers(data);
      setLoading(false);
      // Update selected courrier if it's open
      if (selectedCourrier) {
        const updated = data.find(c => c.id === selectedCourrier.id);
        if (updated) setSelectedCourrier(updated);
      }
    });

    loadWorkflows();

    return () => unsubscribe();
  }, [organization?.id, type]);

  const loadWorkflows = async () => {
    if (!organization?.id) return;
    const data = await workflowService.getWorkflowDefinitions(organization.id);
    setWorkflows(data);
  };

  const handleStartWorkflow = async (workflowId: string) => {
    if (!selectedCourrier) return;
    try {
      await workflowService.startWorkflow(selectedCourrier.id, workflowId);
      setIsStartingWorkflow(false);
    } catch (error) {
      console.error('Error starting workflow:', error);
      alert('Erreur lors du lancement du workflow');
    }
  };

  const handleSave = async (data: any) => {
    if (!organization?.id) return;
    
    try {
      if (selectedCourrier) {
        await updateCourrier(selectedCourrier.id, data);
        setIsEditModalOpen(false);
      } else {
        const newCourrier = {
          ...data,
          organizationId: organization.id,
          status: 'nouveau',
          createdAt: new Date().toISOString()
        };
        const result = await createCourrier(newCourrier);
        
        // Trigger Webhook
        if (result) {
          const eventType = type === 'entrant' ? 'courrier_entrant_created' : 'courrier_sortant_created';
          integrationService.triggerWebhook(organization.id, eventType, {
            id: result,
            ...newCourrier
          });
        }

        setIsModalOpen(false);
      }
      setSelectedCourrier(null);
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
    en_workflow: 'bg-indigo-100 text-indigo-700',
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

      {isEditModalOpen && selectedCourrier && (
        <CourrierModal 
          type={type} 
          courrier={selectedCourrier}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCourrier(null);
          }} 
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
                          <button 
                            onClick={() => setSelectedCourrier(courrier)}
                            title="Voir" 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedCourrier(courrier);
                              setIsEditModalOpen(true);
                            }}
                            title="Modifier" 
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
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
      {/* Courrier Detail Sidebar */}
      <AnimatePresence>
        {selectedCourrier && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourrier(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCourrier.reference}</h3>
                  <p className="text-sm text-slate-500">{selectedCourrier.objet}</p>
                </div>
                <button 
                  onClick={() => setSelectedCourrier(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Expéditeur</div>
                    <div className="text-sm font-medium text-slate-900">{selectedCourrier.expediteur}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Destinataire</div>
                    <div className="text-sm font-medium text-slate-900">{selectedCourrier.destinataire}</div>
                  </div>
                </div>

                {/* Workflow Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Play size={20} className="text-indigo-600" />
                      Circuit de Validation
                    </h4>
                    {!selectedCourrier.workflowInstanceId && (
                      <button 
                        onClick={() => setIsStartingWorkflow(true)}
                        className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Lancer un Workflow
                      </button>
                    )}
                  </div>

                  {selectedCourrier.workflowInstanceId ? (
                    <WorkflowTimeline 
                      courrierId={selectedCourrier.id} 
                      instanceId={selectedCourrier.workflowInstanceId} 
                    />
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                      <p className="text-slate-500 text-sm mb-4">Aucun circuit de validation n'est actif pour ce courrier.</p>
                      <button 
                        onClick={() => setIsStartingWorkflow(true)}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                      >
                        <Plus size={18} />
                        Démarrer le processus
                      </button>
                    </div>
                  )}
                </div>

                {/* Document Preview Placeholder */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={20} className="text-indigo-600" />
                    Document Numérisé
                  </h4>
                  <div className="aspect-[3/4] bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200">
                    <div className="text-center">
                      <FileText size={48} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Aperçu du document non disponible</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Workflow Selection Modal */}
      <AnimatePresence>
        {isStartingWorkflow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lancer un Workflow</h2>
              <div className="space-y-3">
                {workflows.map(wf => (
                  <button
                    key={wf.id}
                    onClick={() => handleStartWorkflow(wf.id)}
                    className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600">{wf.name}</div>
                      <div className="text-xs text-slate-500">{wf.description}</div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600" />
                  </button>
                ))}
                {workflows.length === 0 && (
                  <div className="text-center py-8 text-slate-500 italic">
                    Aucun workflow configuré. <br />
                    Veuillez en créer un dans le menu Configuration.
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsStartingWorkflow(false)}
                className="w-full mt-6 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
