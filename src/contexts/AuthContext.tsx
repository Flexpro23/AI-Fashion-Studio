'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
  name: string;
  email: string;
  phone: string;
  remainingGenerations: number;
  createdAt: Date;
  lastLoginAt: Date;
  totalGenerations: number;
  accountStatus: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  decrementGenerations: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          remainingGenerations: data.remainingGenerations || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          totalGenerations: data.totalGenerations || 0,
          accountStatus: data.accountStatus || 'active'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmailPassword = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const decrementGenerations = async () => {
    if (user && userData && userData.remainingGenerations > 0) {
      try {
        const newRemaining = userData.remainingGenerations - 1;
        const newTotal = userData.totalGenerations + 1;
        
        await updateDoc(doc(db, 'users', user.uid), {
          remainingGenerations: newRemaining,
          totalGenerations: newTotal,
          lastLoginAt: new Date()
        });

        setUserData({
          ...userData,
          remainingGenerations: newRemaining,
          totalGenerations: newTotal,
          lastLoginAt: new Date()
        });
      } catch (error) {
        console.error('Error updating generation count:', error);
        throw error;
      }
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  const value = {
    user,
    userData,
    loading,
    loginWithEmailPassword,
    logout,
    decrementGenerations,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
