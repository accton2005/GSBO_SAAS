import React, { useState, useEffect } from 'react';
import { Save, Send, Check, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

interface SMTPSettingsProps {
  organizationId: string;
}

export const SMTPSettings: React.FC<SMTPSettingsProps> = ({ organizationId }) => {
  const [settings, setSettings] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    fromEmail: '',
    fromName: '',
    status: 'inactive'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [organizationId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'smtp_settings'), where('organizationId', '==', organizationId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setSettings({
          host: data.host || '',
          port: data.port || 587,
          username: data.username || '',
          password: data.password || '',
          encryption: data.encryption || 'tls',
          fromEmail: data.fromEmail || '',
          fromName: data.fromName || '',
          status: data.status || 'inactive'
        });
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const q = query(collection(db, 'smtp_settings'), where('organizationId', '==', organizationId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'smtp_settings'), {
          ...settings,
          organizationId
        });
      } else {
        await updateDoc(doc(db, 'smtp_settings', snapshot.docs[0].id), settings);
      }
      
      setMessage({ type: 'success', text: 'Paramètres SMTP enregistrés avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Veuillez saisir un email de test.' });
      return;
    }

    setTesting(true);
    setMessage(null);
    try {
      const response = await fetch('/api/integrations/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, testEmail })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error || 'Échec du test SMTP.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la connexion au serveur.' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Hôte SMTP</label>
          <input
            type="text"
            value={settings.host}
            onChange={(e) => setSettings({ ...settings, host: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="smtp.exemple.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Port SMTP</label>
          <input
            type="number"
            value={settings.port}
            onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Utilisateur</label>
          <input
            type="text"
            value={settings.username}
            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mot de passe</label>
          <input
            type="password"
            value={settings.password}
            onChange={(e) => setSettings({ ...settings, password: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Chiffrement</label>
          <select
            value={settings.encryption}
            onChange={(e) => setSettings({ ...settings, encryption: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">Aucun</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Statut</label>
          <select
            value={settings.status}
            onChange={(e) => setSettings({ ...settings, status: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="active">Activé</option>
            <option value="inactive">Désactivé</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email de l'expéditeur</label>
          <input
            type="email"
            value={settings.fromEmail}
            onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nom de l'expéditeur</label>
          <input
            type="text"
            value={settings.fromName}
            onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
        </button>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Email de test"
            className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            <Send size={18} />
            {testing ? 'Test en cours...' : 'Tester la connexion'}
          </button>
        </div>
      </div>
    </div>
  );
};
