import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, Inbox, Send, HardDrive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCourriers, getUsers } from '../services/firebaseService';
import { Courrier, User } from '../types';

export const Stats: React.FC = () => {
  const { organization } = useAuth();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;

    const unsubCourriers = getCourriers(organization.id, undefined, (data) => {
      setCourriers(data);
    });

    const unsubUsers = getUsers(organization.id, (data) => {
      setUsers(data);
      setLoading(false);
    });

    return () => {
      unsubCourriers();
      unsubUsers();
    };
  }, [organization?.id]);

  // Group by month for the chart (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7); // YYYY-MM
  }).reverse();

  const chartData = months.map(month => {
    const monthName = new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short' });
    return {
      name: monthName,
      entrants: courriers.filter(c => c.type === 'entrant' && c.createdAt.startsWith(month)).length,
      sortants: courriers.filter(c => c.type === 'sortant' && c.createdAt.startsWith(month)).length,
    };
  });

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analyses & Statistiques</h2>
        <p className="text-slate-500">Suivez les performances et l'utilisation de votre plateforme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume Over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Volume de Courriers (6 mois)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEntrants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSortants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="entrants" stroke="#6366f1" fillOpacity={1} fill="url(#colorEntrants)" strokeWidth={2} />
                <Area type="monotone" dataKey="sortants" stroke="#10b981" fillOpacity={1} fill="url(#colorSortants)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Inbox size={20} className="text-indigo-600" />
            Répartition par Statut
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Nouveau', value: courriers.filter(c => c.status === 'nouveau').length },
                { name: 'En cours', value: courriers.filter(c => c.status === 'en_cours').length },
                { name: 'Traité', value: courriers.filter(c => c.status === 'traite').length },
                { name: 'Archivé', value: courriers.filter(c => c.status === 'archive').length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Utilisateurs Actifs</h4>
            <Users size={20} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{users.length}</p>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min((users.length / 10) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Stockage</h4>
            <HardDrive size={20} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">0.5 GB</p>
          <p className="text-xs text-slate-400 mt-2">Limite: 10 GB</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Courriers Traités</h4>
            <Inbox size={20} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{courriers.filter(c => c.status === 'traite').length}</p>
          <p className="text-xs text-slate-400 mt-2">Total historique</p>
        </div>
      </div>
    </div>
  );
};
