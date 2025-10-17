// Pure localStorage-based authentication system
// This completely bypasses Firebase and works 100% locally

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'investor' | 'founder';
  createdAt: string;
  isAuthenticated: boolean;
}

export interface AuthResult {
  success: boolean;
  user: UserProfile | null;
  error?: string;
}

class LocalAuth {
  private static instance: LocalAuth;
  private readonly STORAGE_KEY = 'veritas_user_profile';
  private readonly AUTH_KEY = 'veritas_auth_status';

  static getInstance(): LocalAuth {
    if (!LocalAuth.instance) {
      LocalAuth.instance = new LocalAuth();
    }
    return LocalAuth.instance;
  }

  // Generate a unique user ID
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Sign up with email and password
  async signUpWithEmail(
    email: string, 
    password: string, 
    fullName: string, 
    role: 'investor' | 'founder'
  ): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = this.getCurrentUser();
      if (existingUser && existingUser.email === email) {
        return {
          success: false,
          user: null,
          error: 'User already exists with this email'
        };
      }

      // Create new user profile
      const userProfile: UserProfile = {
        uid: this.generateUserId(),
        email: email.toLowerCase().trim(),
        displayName: fullName.trim(),
        role,
        createdAt: new Date().toISOString(),
        isAuthenticated: true
      };

      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userProfile));
      localStorage.setItem(this.AUTH_KEY, 'true');

      console.log('✅ User signed up successfully:', userProfile.email);

      return {
        success: true,
        user: userProfile
      };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      return {
        success: false,
        user: null,
        error: error.message || 'Failed to create account'
      };
    }
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Check if user exists in localStorage
      const storedProfile = localStorage.getItem(this.STORAGE_KEY);
      
      if (!storedProfile) {
        return {
          success: false,
          user: null,
          error: 'No account found with this email'
        };
      }

      const userProfile: UserProfile = JSON.parse(storedProfile);
      
      // Simple email validation (in real app, you'd validate password too)
      if (userProfile.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
        return {
          success: false,
          user: null,
          error: 'Invalid email or password'
        };
      }

      // Update authentication status
      userProfile.isAuthenticated = true;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userProfile));
      localStorage.setItem(this.AUTH_KEY, 'true');

      console.log('✅ User signed in successfully:', userProfile.email);

      return {
        success: true,
        user: userProfile
      };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      return {
        success: false,
        user: null,
        error: error.message || 'Failed to sign in'
      };
    }
  }

  // Sign in with Google (simulated)
  async signInWithGoogle(role?: 'investor' | 'founder'): Promise<AuthResult> {
    try {
      // Simulate Google OAuth flow
      const userProfile: UserProfile = {
        uid: this.generateUserId(),
        email: 'user@google.com',
        displayName: 'Google User',
        role: role || 'investor',
        createdAt: new Date().toISOString(),
        isAuthenticated: true
      };

      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userProfile));
      localStorage.setItem(this.AUTH_KEY, 'true');

      console.log('✅ Google sign in successful:', userProfile.email);

      return {
        success: true,
        user: userProfile
      };
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      return {
        success: false,
        user: null,
        error: error.message || 'Failed to sign in with Google'
      };
    }
  }

  // Get current user
  getCurrentUser(): UserProfile | null {
    try {
      const isAuthenticated = localStorage.getItem(this.AUTH_KEY) === 'true';
      const storedProfile = localStorage.getItem(this.STORAGE_KEY);
      
      if (!isAuthenticated || !storedProfile) {
        return null;
      }

      const userProfile: UserProfile = JSON.parse(storedProfile);
      return userProfile.isAuthenticated ? userProfile : null;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.AUTH_KEY);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>): Promise<AuthResult> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          user: null,
          error: 'No user logged in'
        };
      }

      const updatedProfile: UserProfile = {
        ...currentUser,
        ...updates
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProfile));

      return {
        success: true,
        user: updatedProfile
      };
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      return {
        success: false,
        user: null,
        error: error.message || 'Failed to update profile'
      };
    }
  }
}

export const localAuth = LocalAuth.getInstance();
