import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Organization } from '../types';
import { auditService, AuditLog } from '../services/auditService';

export const SuperAdmin: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'orgs' | 'logs'>('orgs');

  useEffect(() => {
    const q = query(collection(db, 'organizations'));
    const unsubscribeOrgs = onSnapshot(q, (snapshot) => {
      const orgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Organization[];
      setOrganizations(orgs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching organizations:', error);
      setLoading(false);
    });

    const unsubscribeLogs = auditService.getLogs((data) => {
      setLogs(data);
    });

    return () => {
      unsubscribeOrgs();
      unsubscribeLogs();
    };
  }, []);

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Administration SaaS</h2>
          <p className="text-slate-500">Gérez les organisations et surveillez la plateforme.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Exporter Stats</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Nouveau Plan</button>
        </div>
      </div>

      {/* SaaS Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Organisations</p>
              <p className="text-2xl font-bold text-slate-900">{organizations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Revenu Mensuel</p>
              <p className="text-2xl font-bold text-slate-900">12,450 €</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Utilisateurs Totaux</p>
              <p className="text-2xl font-bold text-slate-900">2,840</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Alertes Sécurité</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('orgs')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'orgs' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Organisations
          {activeTab === 'orgs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'logs' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Logs d'Audit
          {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
      </div>

      {activeTab === 'orgs' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800">Organisations Inscrites</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Organisation</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Domaine</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{org.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{org.domain || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                          Enterprise
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span className="text-sm capitalize text-slate-600">Actif</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Journal d'Audit de Sécurité</h3>
            <p className="text-sm text-slate-500 mt-1">Toutes les actions administratives sont enregistrées de manière immuable.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date & Heure</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Administrateur</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('fr-FR') : 'En cours...'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserIcon size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{log.adminEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.action.includes('DELETE') ? 'bg-rose-100 text-rose-700' : 
                        log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{log.details}</span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                      Aucun log d'audit disponible pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
