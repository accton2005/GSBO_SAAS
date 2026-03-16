import React from 'react';
import { 
  Mail, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Search, 
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Mail className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Courrier<span className="text-indigo-600">Flow</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">À propos de nous</a>
            <a href="#docs" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">Documents et tutoriels</a>
            <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">Contactez-nous</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Connexion
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-widest">
              <Zap size={14} />
              La nouvelle ère du courrier
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase">
              Gérez votre <span className="text-indigo-600">courrier</span> avec précision.
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
              Une plateforme SaaS puissante pour la gestion centralisée, le suivi en temps réel et l'archivage sécurisé de tous vos courriers organisationnels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-lg uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
              >
                Accéder à la plateforme
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 rounded-full font-bold text-lg uppercase tracking-widest border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                Voir la démo
              </button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=100&h=100&q=80"
                ].map((url, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={url} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">
                Rejoint par plus de <span className="text-slate-900 font-bold">500+ organisations</span>
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-600/10 rounded-[40px] blur-3xl"></div>
            <div className="relative bg-slate-900 rounded-[40px] p-4 shadow-2xl border border-white/10 overflow-hidden">
              <div className="bg-slate-800 rounded-[32px] aspect-video flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
              Tout ce dont vous avez <span className="text-indigo-600">besoin</span>
            </h2>
            <p className="text-lg text-slate-500">
              Des outils robustes conçus pour optimiser le flux de travail de votre secrétariat et de vos équipes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="text-indigo-600" size={32} />,
                title: "Traitement Rapide",
                desc: "Numérisez et enregistrez vos courriers en quelques secondes avec notre interface intuitive."
              },
              {
                icon: <Shield className="text-indigo-600" size={32} />,
                title: "Sécurité Totale",
                desc: "Vos documents sont chiffrés et stockés en toute sécurité avec des contrôles d'accès granulaires."
              },
              {
                icon: <Search className="text-indigo-600" size={32} />,
                title: "Recherche Intelligente",
                desc: "Retrouvez n'importe quel courrier instantanément grâce à notre moteur de recherche multicritères."
              },
              {
                icon: <Users className="text-indigo-600" size={32} />,
                title: "Collaboration",
                desc: "Assignez des courriers, ajoutez des annotations et suivez les actions de vos collaborateurs."
              },
              {
                icon: <Clock className="text-indigo-600" size={32} />,
                title: "Historique Complet",
                desc: "Gardez une trace indélébile de chaque mouvement et modification de vos documents."
              },
              {
                icon: <Building2 className="text-indigo-600" size={32} />,
                title: "Multi-Organisation",
                desc: "Gérez plusieurs départements ou filiales à partir d'une seule interface centralisée."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-slate-100 hover:border-indigo-200 transition-all group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[48px] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none relative z-10">
            Prêt à transformer votre <br /> gestion de courrier ?
          </h2>
          <p className="text-indigo-50 text-xl max-w-2xl mx-auto relative z-10">
            Commencez votre essai gratuit de 14 jours dès aujourd'hui. Aucune carte de crédit requise.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-indigo-600 px-12 py-5 rounded-full font-bold text-lg uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
            >
              Se connecter
            </button>
            <button className="bg-indigo-700 text-white px-12 py-5 rounded-full font-bold text-lg uppercase tracking-widest hover:bg-indigo-800 transition-all border border-white/20">
              Contacter l'équipe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Mail className="text-white" size={24} />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">Courrier<span className="text-indigo-600">Flow</span></span>
              </div>
              <p className="text-slate-400 max-w-sm text-lg leading-relaxed">
                La solution complète pour la gestion moderne du courrier en entreprise. Optimisez, sécurisez et collaborez.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-500">Plateforme</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarification</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-500">Légal</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Conditions générales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de remboursement</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique relative aux cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
            <p>© 2026 CourrierFlow. Tous droits réservés.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
