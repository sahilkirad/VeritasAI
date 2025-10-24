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
    const checkAuth = async () => {
      try {
        console.log('🔍 Starting authentication check...');
        
        // First, check localStorage directly (for admin and other sessions)
        if (typeof window !== 'undefined') {
          const session = localStorage.getItem('veritas_session');
          console.log('🔍 Checking localStorage session:', session);
          
          if (session) {
            try {
              const sessionData = JSON.parse(session);
              console.log('🔍 Session data found:', sessionData);
              
              // Create user profile from session
              const userProfile: UserProfile = {
                uid: sessionData.uid,
                email: sessionData.email,
                displayName: sessionData.displayName || sessionData.email,
                role: sessionData.role,
                password: '', // Don't store password in session
                createdAt: sessionData.createdAt || new Date().toISOString(),
                isAuthenticated: true
              };
              
              console.log('✅ Restoring session for:', userProfile.email, 'Role:', userProfile.role);
              setUser(userProfile);
              setUserProfile(userProfile);
              setLoading(false);
              return;
            } catch (parseError) {
              console.error('❌ Error parsing session data:', parseError);
              localStorage.removeItem('veritas_session');
            }
          }
        }
        
        // If no session found, set loading to false
        console.log('🔍 No session found, setting loading to false');
        setLoading(false);
      } catch (error) {
        console.error('❌ Error checking authentication:', error);
        setLoading(false);
      }
    };

    // Check immediately
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string, expectedRole?: 'investor' | 'founder' | 'admin') => {
    try {
      console.log('🔄 AuthContext: Attempting sign in for:', email, 'Expected role:', expectedRole);
      console.log('🔄 AuthContext: databaseAuth instance:', databaseAuth);
      const result = await databaseAuth.signInWithEmail(email, password, expectedRole);
      console.log('🔄 AuthContext: signInWithEmail result:', result);
      
      if (result.success && result.user) {
        setUser(result.user);
        setUserProfile(result.user);
        console.log('✅ AuthContext: Sign in successful:', result.user.email, 'Role:', result.user.role);
      } else {
        console.error('❌ AuthContext: Sign in failed:', result.error);
        throw new Error(result.error || 'Sign in failed');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Sign in error:', error);
      console.error('❌ AuthContext: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'investor' | 'founder' | 'admin', companyName?: string, companyWebsite?: string, linkedinProfile?: string) => {
    try {
      console.log('🔄 AuthContext: Attempting sign up for:', email, 'Role:', role);
      const result = await databaseAuth.signUpWithEmail(email, password, fullName, role, companyName, companyWebsite, linkedinProfile);
      console.log('🔄 AuthContext: signUpWithEmail result:', result);
      
      if (result.success && result.user) {
        setUser(result.user);
        setUserProfile(result.user);
        console.log('✅ AuthContext: Sign up successful:', result.user.email, 'Role:', result.user.role);
      } else {
        console.error('❌ AuthContext: Sign up failed:', result.error);
        throw new Error(result.error || 'Sign up failed');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signInWithGoogle = async (role?: 'investor' | 'founder' | 'admin') => {
    try {
      console.log('🔄 AuthContext: Attempting Google sign in for role:', role);
      // For now, create a mock Google user for testing
      const mockUser: UserProfile = {
        uid: 'google_' + Date.now(),
        email: 'test@google.com',
        displayName: 'Google User',
        role: role || 'investor',
        password: '',
        createdAt: new Date().toISOString(),
        isAuthenticated: true
      };
      
      setUser(mockUser);
      setUserProfile(mockUser);
      console.log('✅ AuthContext: Google sign in successful:', mockUser.email, 'Role:', mockUser.role);
    } catch (error: any) {
      console.error('❌ AuthContext: Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 AuthContext: Logging out user');
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('veritas_session');
      }
      
      // Clear state
      setUser(null);
      setUserProfile(null);
      
      console.log('✅ AuthContext: Logout successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Logout error:', error);
      // Still clear state even if there's an error
      setUser(null);
      setUserProfile(null);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
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
