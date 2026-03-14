import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Settings as SettingsIcon,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { workflowService } from '../services/workflowService';
import { WorkflowDefinition, WorkflowStep, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'secretariat', label: 'Secrétariat' },
  { value: 'chef_service', label: 'Chef de Service' },
  { value: 'agent', label: 'Agent' },
  { value: 'direction', label: 'Direction' },
];

const WorkflowBuilder: React.FC = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [steps, setSteps] = useState<Partial<WorkflowStep>[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.organizationId) {
      loadWorkflows();
    }
  }, [user]);

  const loadWorkflows = async () => {
    if (!user) return;
    const data = await workflowService.getWorkflowDefinitions(user.organizationId);
    setWorkflows(data);
  };

  const handleSelectWorkflow = async (wf: WorkflowDefinition) => {
    setSelectedWorkflow(wf);
    const stepData = await workflowService.getWorkflowSteps(wf.id);
    setSteps(stepData);
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newWorkflowName) return;
    setLoading(true);
    const id = await workflowService.createWorkflowDefinition(user.organizationId, newWorkflowName, newWorkflowDesc);
    await loadWorkflows();
    setIsCreating(false);
    setNewWorkflowName('');
    setNewWorkflowDesc('');
    setLoading(false);
    
    const newWf = { id, organizationId: user.organizationId, name: newWorkflowName, description: newWorkflowDesc, createdAt: new Date().toISOString() };
    handleSelectWorkflow(newWf);
  };

  const addStep = () => {
    const newStep: Partial<WorkflowStep> = {
      name: 'Nouvelle étape',
      order: steps.length,
      roleRequired: 'agent',
      actionRequired: 'Validation',
      isMandatory: true,
      deadlineDays: 2,
      deadlineHours: 0
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update orders
    const orderedSteps = newSteps.map((s, i) => ({ ...s, order: i }));
    setSteps(orderedSteps);
  };

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const saveWorkflow = async () => {
    if (!selectedWorkflow) return;
    setLoading(true);
    
    // This is a bit complex because we need to sync steps
    // For simplicity in this demo, we'll delete existing steps and recreate them
    // In a real app, you'd update existing ones and delete removed ones
    const existingSteps = await workflowService.getWorkflowSteps(selectedWorkflow.id);
    for (const s of existingSteps) {
      await workflowService.deleteWorkflowStep(s.id);
    }

    for (const s of steps) {
      await workflowService.createWorkflowStep({
        workflowId: selectedWorkflow.id,
        name: s.name || 'Étape',
        order: s.order || 0,
        roleRequired: s.roleRequired || 'agent',
        actionRequired: s.actionRequired || 'Validation',
        isMandatory: s.isMandatory ?? true,
        deadlineDays: s.deadlineDays,
        deadlineHours: s.deadlineHours
      });
    }

    setLoading(false);
    alert('Workflow enregistré avec succès !');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Constructeur de Workflow</h1>
          <p className="text-gray-500">Concevez vos processus administratifs personnalisés</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Nouveau Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Workflow List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-bottom border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700">Mes Workflows</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {workflows.map(wf => (
              <button
                key={wf.id}
                onClick={() => handleSelectWorkflow(wf)}
                className={`w-full text-left p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between ${selectedWorkflow?.id === wf.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
              >
                <div>
                  <div className="font-medium text-gray-900">{wf.name}</div>
                  <div className="text-xs text-gray-500 truncate w-40">{wf.description}</div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
            {workflows.length === 0 && (
              <div className="p-8 text-center text-gray-400 italic">
                Aucun workflow défini
              </div>
            )}
          </div>
        </div>

        {/* Main Area: Step Builder */}
        <div className="lg:col-span-3">
          {selectedWorkflow ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedWorkflow.name}</h2>
                  <p className="text-gray-500 text-sm">{selectedWorkflow.description}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={addStep}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={18} />
                    Ajouter une étape
                  </button>
                  <button 
                    onClick={saveWorkflow}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => moveStep(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button 
                          onClick={() => moveStep(index, 'down')}
                          disabled={index === steps.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom de l'étape</label>
                          <input 
                            type="text" 
                            value={step.name} 
                            onChange={(e) => updateStep(index, { name: e.target.value })}
                            className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rôle requis</label>
                          <select 
                            value={step.roleRequired} 
                            onChange={(e) => updateStep(index, { roleRequired: e.target.value as UserRole })}
                            className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Action requise</label>
                          <input 
                            type="text" 
                            value={step.actionRequired} 
                            onChange={(e) => updateStep(index, { actionRequired: e.target.value })}
                            className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="ex: Visa, Validation..."
                          />
                        </div>

                        <div className="md:col-span-1 flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Délai (jours)</label>
                            <input 
                              type="number" 
                              value={step.deadlineDays} 
                              onChange={(e) => updateStep(index, { deadlineDays: parseInt(e.target.value) })}
                              className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <button 
                            onClick={() => removeStep(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input 
                          type="checkbox" 
                          checked={step.isMandatory} 
                          onChange={(e) => updateStep(index, { isMandatory: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Étape obligatoire
                      </label>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Info size={12} />
                        L'étape {index + 1} doit être complétée avant de passer à la suivante.
                      </div>
                    </div>
                  </motion.div>
                ))}

                {steps.length === 0 && (
                  <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl p-12 text-center">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SettingsIcon className="text-indigo-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">Aucune étape définie</h3>
                    <p className="text-indigo-600 mb-6">Commencez par ajouter les étapes de votre processus administratif.</p>
                    <button 
                      onClick={addStep}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Ajouter la première étape
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center h-full flex flex-col justify-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChevronRight className="text-gray-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez un workflow</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Choisissez un workflow dans la liste de gauche pour modifier ses étapes ou créez-en un nouveau.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau Workflow</h2>
              <form onSubmit={handleCreateWorkflow} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du workflow</label>
                  <input 
                    type="text" 
                    required
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ex: Circuit Courrier Urgent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={newWorkflowDesc}
                    onChange={(e) => setNewWorkflowDesc(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Décrivez l'objectif de ce circuit..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowBuilder;
