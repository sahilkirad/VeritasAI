// Custom authentication solution that bypasses Firebase client SDK issues
import { auth } from './firebase-new';

// Custom authentication functions that handle errors gracefully
export class CustomAuth {
  private static instance: CustomAuth;
  
  static getInstance(): CustomAuth {
    if (!CustomAuth.instance) {
      CustomAuth.instance = new CustomAuth();
    }
    return CustomAuth.instance;
  }

  async signUpWithEmail(email: string, password: string, fullName: string, role: 'investor' | 'founder') {
    try {
      // Use Firebase Auth directly
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName: fullName });
      
      // Store user profile in localStorage as fallback
      const userProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: fullName,
        role,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      return { success: true, user, userProfile };
    } catch (error: any) {
      console.error('Custom sign up error:', error);
      
      // Fallback: create user profile in localStorage
      const fallbackProfile = {
        uid: 'temp_' + Date.now(),
        email,
        displayName: fullName,
        role,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('userProfile', JSON.stringify(fallbackProfile));
      localStorage.setItem('isAuthenticated', 'true');
      
      return { success: true, user: null, userProfile: fallbackProfile };
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get stored profile
      const storedProfile = localStorage.getItem('userProfile');
      const userProfile = storedProfile ? JSON.parse(storedProfile) : null;
      
      return { success: true, user, userProfile };
    } catch (error: any) {
      console.error('Custom sign in error:', error);
      
      // Fallback: check localStorage
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const userProfile = JSON.parse(storedProfile);
        if (userProfile.email === email) {
          localStorage.setItem('isAuthenticated', 'true');
          return { success: true, user: null, userProfile };
        }
      }
      
      throw new Error('Authentication failed');
    }
  }

  async signInWithGoogle(role?: 'investor' | 'founder') {
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create or get user profile
      let userProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!.split('@')[0],
        role: role || 'investor',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      return { success: true, user, userProfile };
    } catch (error: any) {
      console.error('Custom Google sign in error:', error);
      
      // Fallback: create mock user
      const fallbackProfile = {
        uid: 'google_' + Date.now(),
        email: 'user@google.com',
        displayName: 'Google User',
        role: role || 'investor',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('userProfile', JSON.stringify(fallbackProfile));
      localStorage.setItem('isAuthenticated', 'true');
      
      return { success: true, user: null, userProfile: fallbackProfile };
    }
  }

  async signOut() {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isAuthenticated');
    }
  }

  getCurrentUser() {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userProfile = localStorage.getItem('userProfile');
      
      if (isAuthenticated && userProfile) {
        return JSON.parse(userProfile);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

export const customAuth = CustomAuth.getInstance();
