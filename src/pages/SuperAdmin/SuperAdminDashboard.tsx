import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Activity,
  RefreshCw
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
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrgs: 0,
    activeSubs: 0,
    totalUsers: 0,
    totalDocs: 0,
    monthlyRevenue: 0,
    revenueGrowth: 12.5,
  });

  const [revenueData, setRevenueData] = useState([
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ]);

  const [planDistribution, setPlanDistribution] = useState([
    { name: 'Starter', value: 400 },
    { name: 'Professional', value: 300 },
    { name: 'Enterprise', value: 100 },
  ]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    // In a real app, we'd fetch these from Firestore
    // For now, we'll use some mock data combined with real counts if possible
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const orgsSnap = await getDocs(collection(db, 'organizations'));
      const usersSnap = await getDocs(collection(db, 'users'));
      const docsSnap = await getDocs(collection(db, 'courriers'));
      const subsSnap = await getDocs(query(collection(db, 'subscriptions'), where('status', '==', 'active')));

      setStats({
        totalOrgs: orgsSnap.size,
        totalUsers: usersSnap.size,
        totalDocs: docsSnap.size,
        activeSubs: subsSnap.size,
        monthlyRevenue: subsSnap.size * 99, // Mock calculation
        revenueGrowth: 12.5,
      });
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Organisations', value: stats.totalOrgs, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+4%' },
          { label: 'Abonnements Actifs', value: stats.activeSubs, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+2%' },
          { label: 'Utilisateurs Totaux', value: stats.totalUsers, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12%' },
          { label: 'Documents Stockés', value: stats.totalDocs, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+8%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Revenu Mensuel</h3>
              <p className="text-sm text-slate-500">Evolution du MRR sur les 7 derniers mois</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats.monthlyRevenue}€</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                <TrendingUp size={12} /> {stats.revenueGrowth}%
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Distribution des Plans</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalOrgs}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total</div>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            {planDistribution.map((plan, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-sm font-medium text-slate-600">{plan.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{plan.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Activité Récente</h3>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Voir tout</button>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { action: 'Nouvelle Organisation', details: 'Mairie de Bordeaux a rejoint le plan Professional', time: 'Il y a 2h', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { action: 'Paiement Reçu', details: 'Facture #INV-2026-001 payée par Mairie de Lyon', time: 'Il y a 5h', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { action: 'Alerte Quota', details: 'Organisation "Prefecture" a atteint 90% de son stockage', time: 'Il y a 1j', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
            { action: 'Plan Modifié', details: 'Mairie de Nice est passée du plan Starter à Professional', time: 'Il y a 2j', icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((item, i) => (
            <div key={i} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900">{item.action}</div>
                <div className="text-sm text-slate-500">{item.details}</div>
              </div>
              <div className="text-xs font-medium text-slate-400">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
