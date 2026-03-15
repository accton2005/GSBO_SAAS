import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, Organization } from '../types';
import { DB_CONFIG } from '../config/dbConfig';
import { mysqlService } from '../services/mysqlService';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() } as User;
      setUser(userData);
      
      const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
      if (orgDoc.exists()) {
        setOrganization({ id: orgDoc.id, ...orgDoc.data() } as Organization);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid);
      } else {
        const mockUserId = localStorage.getItem('mock_user_id');
        if (mockUserId) {
          if (DB_CONFIG.useMySQL) {
            const userData = await mysqlService.getUsers(mockUserId).then(users => users.find(u => u.id === mockUserId) || null);
            if (userData) {
              setUser(userData);
              const orgData = await mysqlService.getOrganization(userData.organizationId);
              setOrganization(orgData);
            }
          } else {
            await fetchUserData(mockUserId);
          }
        } else {
          setUser(null);
          setOrganization(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    localStorage.removeItem('mock_user_id');
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (DB_CONFIG.useMySQL) {
      const userData = await mysqlService.login(email, pass);
      setUser(userData);
      localStorage.setItem('mock_user_id', userData.id);
      
      const orgData = await mysqlService.getOrganization(userData.organizationId);
      setOrganization(orgData);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem('mock_user_id');
    } catch (authError: any) {
      const q = query(collection(db, 'users'), where('email', '==', email), where('password', '==', pass));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setUser(userData);
        localStorage.setItem('mock_user_id', userData.id);
        
        const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
        if (orgDoc.exists()) {
          setOrganization({ id: orgDoc.id, ...orgDoc.data() } as Organization);
        }
      } else {
        throw authError;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('mock_user_id');
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider value={{ user, organization, loading, login, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
