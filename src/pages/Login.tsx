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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-[1000px] w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Left Side - Branding/Info */}
        <div className="md:w-[45%] bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <Mail className="text-indigo-600" size={28} />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">Courrier<span className="text-indigo-200">Flow</span></span>
            </div>
            
            <h2 className="text-4xl font-bold leading-[1.1] mb-6 uppercase tracking-tighter">
              La gestion de <br /> courrier <span className="text-indigo-200 underline decoration-indigo-300 underline-offset-8">réinventée</span>.
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed opacity-90">
              Une plateforme centralisée pour optimiser vos flux administratifs, sécuriser vos échanges et accélérer vos processus de décision.
            </p>
          </div>

          <div className="relative z-10 pt-12">
            <div className="space-y-4">
              {[
                "Suivi en temps réel",
                "Workflows automatisés",
                "Archivage sécurisé",
                "Statistiques avancées"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-indigo-100">
                  <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 p-12 md:p-16">
          <div className="max-w-sm mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Connexion</h1>
              <p className="text-slate-500 font-medium">Accédez à votre espace de travail sécurisé.</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl flex items-center gap-3 font-bold">
                <ShieldCheck size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Identifiant Professionnel
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@administration.gov"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Clé d'accès
                  </label>
                  <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                    Oublié ?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? 'Authentification...' : 'S\'authentifier'}
                {!isSubmitting && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
              </button>
            </form>

            <div className="my-10 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou continuer avec</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-100 transition-all disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Compte Google
            </button>

            <div className="mt-12 text-center">
              <Link to="/landing" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                ← Retour au portail public
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
