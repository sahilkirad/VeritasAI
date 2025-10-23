'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { databaseAuth, UserProfile } from '@/lib/database-auth';

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, expectedRole?: 'investor' | 'founder' | 'admin') => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'investor' | 'founder' | 'admin', companyName?: string, companyWebsite?: string, linkedinProfile?: string) => Promise<void>;
  signInWithGoogle: (role?: 'investor' | 'founder' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = () => {
      try {
        // First, check localStorage directly (for admin and other sessions)
        if (typeof window !== 'undefined') {
          const session = localStorage.getItem('veritas_session');
          console.log('🔍 Checking localStorage session:', session);
          if (session) {
            try {
              const userData = JSON.parse(session);
              console.log('🔍 Parsed userData:', userData);
              setUser(userData);
              setUserProfile(userData);
              console.log('✅ User authenticated from localStorage:', userData.email);
              setLoading(false);
              return;
            } catch (parseError) {
              console.error('❌ Failed to parse session:', parseError);
              localStorage.removeItem('veritas_session');
            }
          } else {
            console.log('ℹ️ No localStorage session found');
          }
        }

        // Fallback to databaseAuth if no localStorage session
        const currentUser = databaseAuth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setUserProfile(currentUser);
          console.log('✅ User authenticated from databaseAuth:', currentUser.email);
        } else {
          setUser(null);
          setUserProfile(null);
          console.log('ℹ️ No user authenticated');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    };

    // Check immediately
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string, expectedRole?: 'investor' | 'founder' | 'admin') => {
    try {
      console.log('🔄 Attempting sign in for:', email, 'Expected role:', expectedRole);
      const result = await databaseAuth.signInWithEmail(email, password, expectedRole);
      
      if (result.success && result.user) {
        setUser(result.user);
        setUserProfile(result.user);
        console.log('✅ Sign in successful:', result.user.email, 'Role:', result.user.role);
      } else {
        throw new Error(result.error || 'Sign in failed');
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'investor' | 'founder' | 'admin', companyName?: string, companyWebsite?: string, linkedinProfile?: string) => {
    try {
      console.log('🔄 Attempting sign up for:', email, 'Role:', role);
      const result = await databaseAuth.signUpWithEmail(email, password, fullName, role, companyName, companyWebsite, linkedinProfile);
      
      if (result.success && result.user) {
        setUser(result.user);
        setUserProfile(result.user);
        console.log('✅ Sign up successful:', result.user.email);
      } else {
        throw new Error(result.error || 'Sign up failed');
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signInWithGoogle = async (role?: 'investor' | 'founder' | 'admin') => {
    try {
      console.log('🔄 Attempting Google sign in, Role:', role);
      const result = await databaseAuth.signInWithGoogle(role);
      
      if (result.success && result.user) {
        setUser(result.user);
        setUserProfile(result.user);
        console.log('✅ Google sign in successful:', result.user.email);
      } else {
        throw new Error(result.error || 'Google sign in failed');
      }
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Attempting logout');
      await databaseAuth.signOut();
      setUser(null);
      setUserProfile(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear state anyway
      setUser(null);
      setUserProfile(null);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}