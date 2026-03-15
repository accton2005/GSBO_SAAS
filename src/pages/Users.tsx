import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Trash2,
  CheckCircle2,
  XCircle,
  Edit,
  X,
  Plus
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, deleteUser, createUser, updateUser } from '../services/firebaseService';

export const Users: React.FC = () => {
  const { organization, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'agent' as UserRole,
    password: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization?.id) return;

    const unsubscribe = getUsers(organization.id, (data) => {
      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organization?.id]);

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }

    // In a real app, we'd use a custom modal for confirmation
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    if (!editingUser && newUser.password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingUser) {
        const updateData: any = {
          name: newUser.name,
          displayName: newUser.name,
          email: newUser.email,
          role: newUser.role,
        };
        if (newUser.password) {
          updateData.password = newUser.password;
        }
        await updateUser(editingUser.id, updateData);
      } else {
        await createUser({
          name: newUser.name,
          displayName: newUser.name,
          email: newUser.email,
          role: newUser.role,
          password: newUser.password,
          organizationId: organization.id,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setNewUser({ name: '', email: '', role: 'agent', password: '' });
    } catch (error) {
      console.error('Error saving user:', error);
      setError("Erreur lors de l'enregistrement de l'utilisateur. Vérifiez vos permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || ''
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'agent', password: '' });
    setIsModalOpen(true);
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-indigo-100 text-indigo-700',
    agent: 'bg-indigo-100 text-indigo-700',
    viewer: 'bg-slate-100 text-slate-700',
    superadmin: 'bg-rose-100 text-rose-700',
    secretariat: 'bg-amber-100 text-amber-700',
    chef_service: 'bg-purple-100 text-purple-700',
    direction: 'bg-blue-100 text-blue-700'
  };

  const filteredUsers = users.filter(u => 
    (u.displayName || u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
          <p className="text-slate-500">Gérez les membres de votre organisation et leurs permissions.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus size={20} />
          Créer un Utilisateur
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Utilisateurs</p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Administrateurs</p>
          <p className="text-2xl font-bold text-indigo-600">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Agents</p>
          <p className="text-2xl font-bold text-indigo-600">{users.filter(u => u.role === 'agent').length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un utilisateur par nom ou email..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dernière Connexion</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{user.displayName || user.name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className={user.role === 'admin' ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-indigo-600">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-medium">Actif</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(user)}
                          title="Modifier" 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Supprimer" 
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="font-bold text-lg">
                {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Nom complet</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ex: Jean Dupont"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Adresse e-mail</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="jean.dupont@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                <input 
                  type="password" 
                  required={!editingUser}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder={editingUser ? "Laisser vide pour ne pas changer" : "••••••••"}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Rôle</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Administrateur</option>
                  <option value="secretariat">Secrétariat</option>
                  <option value="chef_service">Chef de Service</option>
                  <option value="direction">Direction</option>
                  <option value="viewer">Observateur</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (editingUser ? 'Enregistrement...' : 'Création...') : (editingUser ? 'Enregistrer' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
