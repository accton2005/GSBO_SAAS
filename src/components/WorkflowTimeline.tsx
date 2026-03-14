import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  User as UserIcon, 
  MessageSquare, 
  Send,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { workflowService } from '../services/workflowService';
import { 
  WorkflowInstance, 
  WorkflowInstanceStep, 
  WorkflowStep, 
  WorkflowAction,
  WorkflowActionType,
  User
} from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface WorkflowTimelineProps {
  courrierId: string;
  instanceId: string;
}

const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ courrierId, instanceId }) => {
  const { user: currentUser } = useAuth();
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [instanceSteps, setInstanceSteps] = useState<(WorkflowInstanceStep & { stepDetails?: WorkflowStep })[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionComment, setActionComment] = useState('');
  const [performingAction, setPerformingAction] = useState(false);

  useEffect(() => {
    loadWorkflowData();
  }, [instanceId]);

  const loadWorkflowData = async () => {
    setLoading(true);
    const inst = await workflowService.getWorkflowInstance(instanceId);
    if (inst) {
      setInstance(inst);
      const iSteps = await workflowService.getWorkflowInstanceSteps(instanceId);
      const enrichedSteps = await Promise.all(iSteps.map(async (is) => {
        const stepDetails = await workflowService.getWorkflowSteps(inst.workflowId);
        const details = stepDetails.find(s => s.id === is.stepId);
        return { ...is, stepDetails: details };
      }));
      setInstanceSteps(enrichedSteps);
    }
    setLoading(false);
  };

  const handleAction = async (actionType: WorkflowActionType) => {
    if (!currentUser || !instance) return;
    
    const currentStep = instanceSteps[instance.currentStepIndex];
    if (!currentStep) return;

    setPerformingAction(true);
    try {
      await workflowService.performAction(
        instanceId,
        currentStep.id,
        currentUser.id,
        actionType,
        actionComment
      );
      setActionComment('');
      await loadWorkflowData();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Erreur lors de l\'action');
    } finally {
      setPerformingAction(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement du workflow...</div>;
  if (!instance) return null;

  const currentStep = instanceSteps[instance.currentStepIndex];
  const isAssignedToMe = currentStep?.stepDetails?.roleRequired === currentUser?.role;
  const isCompleted = instance.status === 'termine' || instance.status === 'refuse';

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            instance.status === 'termine' ? 'bg-emerald-100 text-emerald-600' :
            instance.status === 'refuse' ? 'bg-red-100 text-red-600' :
            'bg-indigo-100 text-indigo-600'
          }`}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Statut du Workflow</div>
            <div className="font-semibold text-gray-900">
              {instance.status === 'termine' ? 'Circuit validé et terminé' :
               instance.status === 'refuse' ? 'Circuit refusé' :
               `Étape ${instance.currentStepIndex + 1} sur ${instanceSteps.length}`}
            </div>
          </div>
        </div>
        {instance.status === 'en_cours' && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium">
            <Clock size={16} />
            En cours de traitement
          </div>
        )}
      </div>

      {/* Timeline Visual */}
      <div className="relative pl-8 space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

        {instanceSteps.map((step, index) => {
          const isActive = index === instance.currentStepIndex && instance.status === 'en_cours';
          const isDone = (index < instance.currentStepIndex) || (instance.status === 'termine');
          const isRefused = step.status === 'refuse';
          
          return (
            <div key={step.id} className="relative">
              {/* Dot */}
              <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-4 border-white z-10 ${
                isRefused ? 'bg-red-500' :
                isDone ? 'bg-emerald-500' :
                isActive ? 'bg-indigo-600 ring-4 ring-indigo-100' :
                'bg-gray-300'
              }`}></div>

              <div className={`p-4 rounded-xl border transition-all ${
                isActive ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50' :
                isDone ? 'bg-white border-gray-100 opacity-80' :
                'bg-gray-50 border-transparent opacity-60'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={`font-bold ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {step.stepDetails?.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <UserIcon size={12} />
                      Rôle requis: <span className="font-semibold">{step.stepDetails?.roleRequired}</span>
                    </div>
                  </div>
                  {isDone && !isRefused && <CheckCircle2 className="text-emerald-500" size={20} />}
                  {isRefused && <XCircle className="text-red-500" size={20} />}
                  {isActive && <Clock className="text-indigo-600 animate-pulse" size={20} />}
                </div>

                {step.comment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic flex gap-2">
                    <MessageSquare size={16} className="text-gray-400 shrink-0" />
                    "{step.comment}"
                  </div>
                )}

                {step.actionDate && (
                  <div className="mt-2 text-[10px] text-gray-400 text-right">
                    Validé le {new Date(step.actionDate).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Panel */}
      {!isCompleted && isAssignedToMe && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-900 font-bold">
            <AlertTriangle size={20} />
            Votre action est requise
          </div>
          <p className="text-sm text-indigo-700">
            Vous êtes responsable de l'étape <strong>{currentStep?.stepDetails?.name}</strong>. 
            Veuillez examiner le courrier et prendre une décision.
          </p>
          
          <textarea 
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            placeholder="Ajouter un commentaire (optionnel)..."
            className="w-full border-indigo-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            rows={3}
          />

          <div className="flex gap-3">
            <button 
              onClick={() => handleAction('valider')}
              disabled={performingAction}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              Valider
            </button>
            <button 
              onClick={() => handleAction('refuser')}
              disabled={performingAction}
              className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              <XCircle size={18} />
              Refuser
            </button>
          </div>
        </div>
      )}

      {!isCompleted && !isAssignedToMe && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3 text-gray-500 italic text-sm">
          <Clock size={18} />
          En attente de validation par un utilisateur avec le rôle: {currentStep?.stepDetails?.roleRequired}
        </div>
      )}
    </div>
  );
};

export default WorkflowTimeline;
