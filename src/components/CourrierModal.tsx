import React, { useState, useEffect } from 'react';
import { X, Upload, Scan, FileText, Check, GitBranch, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { performOCR } from '../services/ocrService';
import { generateCourrierReference } from '../services/qrService';
import { Courrier, WorkflowInstance, WorkflowStep } from '../types';
import { workflowService } from '../services/workflowService';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const schema = z.object({
  objet: z.string().min(5, 'L\'objet est requis'),
  expediteur: z.string().min(3, 'L\'expéditeur est requis'),
  destinataire: z.string().min(3, 'Le destinataire est requis'),
  priority: z.enum(['basse', 'normale', 'haute', 'urgente']),
});

type FormData = z.infer<typeof schema>;

interface CourrierModalProps {
  type: 'entrant' | 'sortant';
  courrier?: Courrier | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const CourrierModal: React.FC<CourrierModalProps> = ({ type, courrier, onClose, onSave }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [ocrText, setOcrText] = useState(courrier?.ocrText || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstance | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: courrier?.priority || 'normale',
      objet: courrier?.objet || '',
      expediteur: courrier?.expediteur || '',
      destinataire: courrier?.destinataire || '',
    }
  });

  useEffect(() => {
    if (courrier?.workflowInstanceId) {
      loadWorkflowData(courrier.workflowInstanceId);
    }
  }, [courrier]);

  const loadWorkflowData = async (instanceId: string) => {
    setLoadingWorkflow(true);
    try {
      const instance = await workflowService.getWorkflowInstance(instanceId);
      if (instance) {
        setWorkflowInstance(instance);
        const steps = await workflowService.getWorkflowSteps(instance.workflowId);
        setWorkflowSteps(steps);
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoadingWorkflow(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    try {
      const base64 = imagePreview.split(',')[1];
      const text = await performOCR(base64);
      setOcrText(text);
    } catch (error) {
      alert("Erreur lors de l'OCR");
    } finally {
      setIsScanning(false);
    }
  };

  const onSubmit = (data: FormData) => {
    if (courrier) {
      onSave({
        ...courrier,
        ...data,
        ocrText,
      });
    } else {
      const reference = generateCourrierReference(type);
      onSave({
        ...data,
        type,
        reference,
        ocrText,
        createdAt: new Date().toISOString(),
        status: 'nouveau'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {courrier ? 'Détails du Courrier' : `Enregistrer un Courrier ${type === 'entrant' ? 'Entrant' : 'Sortant'}`}
          </h3>
          <div className="flex items-center gap-4">
            {courrier && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-600">
                {courrier.reference}
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Workflow Status Indicator */}
        {courrier && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch size={18} className="text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">Cycle de vie du courrier</span>
              </div>
              <div className="text-xs font-medium text-slate-500">
                Statut actuel: <span className="text-indigo-600 font-bold uppercase">{courrier.status.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="relative">
              {/* Progress Bar Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
              
              {/* Progress Bar Active */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-500"
                style={{ 
                  width: courrier.status === 'traite' ? '100%' : 
                         courrier.status === 'en_workflow' ? `${((workflowInstance?.currentStepIndex || 0) + 1) / (workflowSteps.length + 1) * 100}%` :
                         '20%'
                }}
              ></div>

              <div className="relative flex justify-between">
                {/* Step 1: Registered */}
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors",
                    courrier.status !== 'nouveau' ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  )}>
                    <Check size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Enregistré</span>
                </div>

                {/* Workflow Steps */}
                {workflowSteps.length > 0 ? (
                  workflowSteps.map((step, index) => {
                    const isCompleted = (workflowInstance?.currentStepIndex || 0) > index || workflowInstance?.status === 'termine';
                    const isCurrent = (workflowInstance?.currentStepIndex || 0) === index && workflowInstance?.status === 'en_cours';
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors",
                          isCompleted ? "bg-indigo-600 text-white" : 
                          isCurrent ? "bg-amber-500 text-white ring-4 ring-amber-100" : 
                          "bg-slate-200 text-slate-400"
                        )}>
                          {isCompleted ? <Check size={14} /> : isCurrent ? <Clock size={14} /> : <span className="text-[10px]">{index + 1}</span>}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{step.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors",
                      courrier.status === 'en_workflow' || courrier.status === 'traite' ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                    )}>
                      <Clock size={14} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Traitement</span>
                  </div>
                )}

                {/* Step Final: Validated */}
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors",
                    courrier.status === 'traite' ? "bg-emerald-500 text-white ring-4 ring-emerald-100" : "bg-slate-200 text-slate-400"
                  )}>
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Validé</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Side */}
          <form id="courrier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Objet du courrier</label>
              <input 
                {...register('objet')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ex: Demande de travaux..."
              />
              {errors.objet && <p className="text-xs text-rose-500">{errors.objet.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Expéditeur</label>
                <input 
                  {...register('expediteur')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.expediteur && <p className="text-xs text-rose-500">{errors.expediteur.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Destinataire</label>
                <input 
                  {...register('destinataire')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.destinataire && <p className="text-xs text-rose-500">{errors.destinataire.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Priorité</label>
              <select 
                {...register('priority')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Texte extrait (OCR)</label>
              <textarea 
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                placeholder="Le texte extrait apparaîtra ici après le scan..."
              />
            </div>
          </form>

          {/* Document Side */}
          <div className="space-y-6">
            <label className="text-sm font-medium text-slate-700 block">Document numérisé</label>
            <div className={cn(
              "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all h-64 relative overflow-hidden",
              imagePreview ? "border-indigo-500 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-400 bg-slate-50"
            )}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                  <button 
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full shadow-sm hover:bg-white"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-full shadow-sm text-indigo-600 mb-4">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Cliquez pour télécharger</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG ou PDF jusqu'à 10Mo</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                disabled={!imagePreview || isScanning}
                onClick={handleOCR}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyse...
                  </>
                ) : (
                  <>
                    <Scan size={20} />
                    Lancer l'OCR
                  </>
                )}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
              <FileText className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-800">
                L'OCR utilise l'intelligence artificielle pour extraire automatiquement le texte du document scanné.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
            Annuler
          </button>
          <button 
            form="courrier-form"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            {isSubmitting ? 'Enregistrement...' : (
              <>
                <Check size={20} />
                Enregistrer le courrier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
