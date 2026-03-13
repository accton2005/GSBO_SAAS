import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Mail, Lock, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const schema = z.object({
  orgName: z.string().min(3, 'Le nom doit faire au moins 3 caractères'),
  domain: z.string().min(3, 'Le domaine est requis'),
});

type FormData = z.infer<typeof schema>;

export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // 1. Create Organization
      const orgRef = await addDoc(collection(db, 'organizations'), {
        name: data.orgName,
        domain: data.domain,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: firebaseUser.uid, // Add this to allow the creator to become admin
        settings: {
          appName: data.orgName,
          primaryColor: '#6366f1',
          secondaryColor: '#10b981'
        }
      });

      // 2. Create User as Admin
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        organizationId: orgRef.id,
        name: firebaseUser.displayName || 'Admin',
        email: firebaseUser.email,
        role: 'admin',
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return; // Silent return for user cancellation
      }
      
      // Handle Firestore permission errors specifically if they occur
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.WRITE, 'organizations/users');
      }

      console.error('Registration error:', error);
      alert('Erreur lors de la création du compte. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side - Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 text-white">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600">
                <Building2 size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight">SaaS Courrier</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Modernisez la gestion de votre administration.
            </h1>
            <ul className="space-y-4">
              {[
                'Multi-tenant sécurisé',
                'OCR & Scan intelligent',
                'Suivi par QR Code & Barcode',
                'Circuits de visa automatisés',
                'Archivage conforme'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-indigo-300" />
                  <span className="text-indigo-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-indigo-200 text-sm">
            © 2024 SaaS Gestion Courrier. Tous droits réservés.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-12">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Créer un compte</h2>
            <p className="text-slate-500 mt-2">Inscrivez votre administration dès aujourd'hui.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nom de l'administration</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  {...register('orgName')}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="ex: Mairie de Paris"
                />
              </div>
              {errors.orgName && <p className="text-xs text-rose-500">{errors.orgName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Domaine souhaité</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  {...register('domain')}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="mairie-paris"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">.app.com</span>
              </div>
              {errors.domain && <p className="text-xs text-rose-500">{errors.domain.message}</p>}
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
              <p className="text-xs text-indigo-700 leading-relaxed">
                En cliquant sur le bouton ci-dessous, vous serez invité à vous connecter avec votre compte Google pour finaliser la création de votre compte administrateur.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {isSubmitting ? 'Création en cours...' : 'S\'inscrire avec Google'}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8 text-sm">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
