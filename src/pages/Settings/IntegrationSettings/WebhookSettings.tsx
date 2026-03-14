import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Webhook as WebhookIcon, Shield, ExternalLink } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

interface WebhookSettingsProps {
  organizationId: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  eventType: string;
  secret: string;
  status: 'active' | 'inactive';
}

export const WebhookSettings: React.FC<WebhookSettingsProps> = ({ organizationId }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    eventType: 'courrier_entrant_created',
    secret: '',
    status: 'active'
  });
  const [creating, setCreating] = useState(false);

  const eventTypes = [
    { id: 'courrier_entrant_created', label: 'Nouveau courrier entrant' },
    { id: 'courrier_sortant_created', label: 'Nouveau courrier sortant' },
    { id: 'document_added', label: 'Document ajouté' },
    { id: 'workflow_validated', label: 'Workflow validé' },
    { id: 'courrier_archived', label: 'Courrier archivé' },
  ];

  useEffect(() => {
    loadWebhooks();
  }, [organizationId]);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'webhooks'), where('organizationId', '==', organizationId));
      const snapshot = await getDocs(q);
      const webhookList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Webhook[];
      setWebhooks(webhookList);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const secret = generateSecret();
      await addDoc(collection(db, 'webhooks'), {
        ...formData,
        secret,
        organizationId
      });
      setShowForm(false);
      setFormData({
        name: '',
        url: '',
        eventType: 'courrier_entrant_created',
        secret: '',
        status: 'active'
      });
      loadWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Supprimer ce webhook ?')) return;
    try {
      await deleteDoc(doc(db, 'webhooks', id));
      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <WebhookIcon className="text-indigo-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Webhooks Sortants</h3>
            <p className="text-sm text-slate-500">Envoyez des notifications en temps réel à vos systèmes externes.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} />
          Nouveau Webhook
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateWebhook} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nom du Webhook</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: n8n Workflow Trigger"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Type d'événement</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">URL de destination</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://votre-serveur.com/webhook"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {creating ? 'Création...' : 'Créer le Webhook'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {webhooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500">Aucun webhook configuré.</p>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <ExternalLink size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{webhook.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {eventTypes.find(t => t.id === webhook.eventType)?.label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                      {webhook.url}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Shield size={14} className="text-slate-400" />
                  <span className="text-xs font-mono text-slate-500">Secret actif</span>
                </div>
                <button
                  onClick={() => handleDeleteWebhook(webhook.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
