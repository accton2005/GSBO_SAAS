import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, Key } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

interface APISettingsProps {
  organizationId: string;
}

interface Token {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'revoked';
}

export const APISettings: React.FC<APISettingsProps> = ({ organizationId }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
  }, [organizationId]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'api_tokens'), where('organizationId', '==', organizationId));
      const snapshot = await getDocs(q);
      const tokenList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Token[];
      setTokens(tokenList);
    } catch (error) {
      console.error('Error loading API tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'saas_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateToken = async () => {
    if (!newTokenName) return;
    setCreating(true);
    try {
      const tokenValue = generateToken();
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

      await addDoc(collection(db, 'api_tokens'), {
        organizationId,
        name: newTokenName,
        token: tokenValue,
        createdAt,
        expiresAt,
        status: 'active',
        createdBy: 'admin' // Should be current user ID
      });

      setNewTokenName('');
      loadTokens();
    } catch (error) {
      console.error('Error creating token:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer ce jeton ?')) return;
    try {
      await deleteDoc(doc(db, 'api_tokens', id));
      loadTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
        <Key className="text-indigo-600 shrink-0" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-indigo-900">Accès API REST</h4>
          <p className="text-xs text-indigo-700 mt-1">
            Utilisez ces jetons pour intégrer l'application avec des outils externes comme n8n ou Zapier.
            Les jetons doivent être envoyés dans l'en-tête <code>Authorization: Bearer [TOKEN]</code>.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={newTokenName}
          onChange={(e) => setNewTokenName(e.target.value)}
          placeholder="Nom du jeton (ex: n8n Integration)"
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          onClick={handleCreateToken}
          disabled={creating || !newTokenName}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Plus size={18} />
          {creating ? 'Génération...' : 'Générer un jeton'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Nom</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Jeton</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Créé le</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Expire le</th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                  Aucun jeton API généré.
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{token.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                        {token.token.substring(0, 8)}...{token.token.substring(token.token.length - 4)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(token.token)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Copier le jeton"
                      >
                        {copiedToken === token.token ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(token.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteToken(token.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Révoquer le jeton"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
