import React, { useState } from 'react';
import { Building2, ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithEmail, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Adresse e-mail ou mot de passe incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login();
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
          <Mail className="text-white" size={24} />
        </div>
        <span className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Courrier<span className="text-indigo-600">Flow</span></span>
      </div>

      <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Connexion</h2>
          <div className="w-12 h-0.5 bg-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Connectez-vous pour accéder à votre espace de gestion.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">
              Adresse e-mail
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                Mot de passe
              </label>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-600"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            {isSubmitting ? 'Connexion...' : 'SE CONNECTER'}
          </button>
        </form>

        <div className="my-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-indigo-600 w-3 h-3 rotate-45"></div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <button 
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-100 transition-all group disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continuer avec Google
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-slate-400">
        Besoin d'aide ? <Link to="/landing" className="text-indigo-600 font-bold hover:underline">Retour à l'accueil</Link>
      </div>
    </div>
  );
};
