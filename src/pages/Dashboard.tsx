import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getCourriers } from '../services/firebaseService';
import { Courrier } from '../types';

export const Dashboard: React.FC = () => {
  const { organization } = useAuth();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;

    // Listen to all courriers for the organization
    const unsubscribe = getCourriers(organization.id, undefined, (data) => {
      setCourriers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organization?.id]);

  const stats = {
    total: courriers.length,
    entrants: courriers.filter(c => c.type === 'entrant').length,
    sortants: courriers.filter(c => c.type === 'sortant').length,
    enAttente: courriers.filter(c => c.status === 'nouveau' || c.status === 'en_cours').length,
    traites: courriers.filter(c => c.status === 'traite').length,
  };

  const recentActivity = courriers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Group by day for the chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => ({
    name: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
    entrants: courriers.filter(c => c.type === 'entrant' && c.createdAt.startsWith(date)).length,
    sortants: courriers.filter(c => c.type === 'sortant' && c.createdAt.startsWith(date)).length,
  }));

  const cards = [
    { label: 'Total Courriers', value: stats.total, icon: FileText, color: 'bg-indigo-50 text-indigo-600', trend: '+12%', trendUp: true },
    { label: 'Entrants', value: stats.entrants, icon: Clock, color: 'bg-blue-50 text-blue-600', trend: '+5%', trendUp: true },
    { label: 'Sortants', value: stats.sortants, icon: Send, color: 'bg-emerald-50 text-emerald-600', trend: '+8%', trendUp: true },
    { label: 'En Attente', value: stats.enAttente, icon: AlertCircle, color: 'bg-amber-50 text-amber-600', trend: '-2%', trendUp: false },
  ];

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tableau de Bord</h2>
        <p className="text-slate-500">Bienvenue, voici un aperçu de l'activité de votre administration.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Volume de Courriers</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-indigo-500">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEntrants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSortants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="entrants" stroke="#4f46e5" fillOpacity={1} fill="url(#colorEntrants)" strokeWidth={3} />
                <Area type="monotone" dataKey="sortants" stroke="#10b981" fillOpacity={1} fill="url(#colorSortants)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Activité Récente</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">Voir tout</button>
          </div>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucune activité récente</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className={`mt-1 p-2 rounded-lg shrink-0 ${item.type === 'entrant' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {item.type === 'entrant' ? <Clock size={16} /> : <Send size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.objet}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.type === 'entrant' ? 'Reçu de' : 'Envoyé à'} <span className="font-medium text-slate-700">{item.expediteur}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-8 py-3 border border-slate-100 rounded-xl text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            Rapport complet
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
