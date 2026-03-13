import React from 'react';
import { Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  React.useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await login();
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return; // Silent return for user cancellation
      }
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-200">
            <Building2 size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Connexion</h2>
          <p className="text-slate-500 mt-2">Accédez à votre espace de gestion.</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Se connecter avec Google
            <ArrowRight size={20} />
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Nouveau sur la plateforme ?</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/register')}
            className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Créer un compte organisation
          </button>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Accès sécurisé multi-tenant</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Authentification Google unique</span>
          </div>
        </div>
      </div>
    </div>
  );
};
