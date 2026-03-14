import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Search } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase';

interface APILogsProps {
  organizationId: string;
}

interface APILog {
  id: string;
  tokenId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  ipAddress: string;
  timestamp: string;
}

export const APILogs: React.FC<APILogsProps> = ({ organizationId }) => {
  const [logs, setLogs] = useState<APILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [organizationId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'api_logs'),
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const logList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as APILog[];
      setLogs(logList);
    } catch (error) {
      console.error('Error loading API logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="text-indigo-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Logs d'activité API</h3>
            <p className="text-sm text-slate-500">Suivi en temps réel des appels effectués via l'API REST.</p>
          </div>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Horodatage</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Méthode</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Endpoint</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Statut</th>
              <th className="px-4 py-3 font-semibold text-slate-700">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Chargement des logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                  Aucun log d'activité disponible.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.method === 'GET' ? 'bg-emerald-50 text-emerald-700' :
                      log.method === 'POST' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {log.endpoint}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.statusCode >= 200 && log.statusCode < 300 ? 'bg-emerald-100 text-emerald-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                    {log.ipAddress}
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
