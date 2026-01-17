import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { clearCompanyIdCache } from '@/lib/firebaseApi';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  company_id: string;
  company_name?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createCompany: (companyName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Load user profile
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Load company name if company_id exists
          let companyName = '';
          if (userData.company_id) {
            const companyDoc = await getDoc(doc(db, 'companies', userData.company_id));
            if (companyDoc.exists()) {
              companyName = companyDoc.data().name || '';
            }
          }
          
          setProfile({
            id: firebaseUser.uid,
            email: userData.email || firebaseUser.email || '',
            username: userData.username || '',
            company_id: userData.company_id || '',
            company_name: companyName,
            role: userData.role || 'user',
          });
        }
      } else {
        setProfile(null);
        clearCompanyIdCache();
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username,
        company_id: '', // Will be set when user creates/joins company
        role: 'admin', // First user of company will be admin
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      clearCompanyIdCache();
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const createCompany = async (companyName: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Create company document
      const companyRef = doc(db, 'companies', `company_${user.uid}`);
      await setDoc(companyRef, {
        name: companyName,
        owner_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      
      // Update user document with company_id
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        company_id: companyRef.id,
        updated_at: Timestamp.now(),
      }, { merge: true });
      
      // Reload profile
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          id: user.uid,
          email: userData.email || user.email || '',
          username: userData.username || '',
          company_id: userData.company_id || '',
          company_name: companyName,
          role: userData.role || 'admin',
        });
      }
    } catch (error: any) {
      console.error('Create company error:', error);
      throw new Error(error.message || 'Failed to create company');
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    createCompany,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
