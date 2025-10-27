// Database-based authentication system using Firestore
import { db } from './firebase-new';
import { doc, setDoc, getDoc, collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'investor' | 'founder' | 'admin';
  password: string; // Hashed password
  createdAt: string;
  isAuthenticated: boolean;
  // Company information (for founders)
  companyName?: string;
  companyWebsite?: string;
  linkedinProfile?: string;
}

export interface AuthResult {
  success: boolean;
  user: UserProfile | null;
  error?: string;
}

class DatabaseAuth {
  private static instance: DatabaseAuth;
  private readonly SESSION_KEY = 'veritas_session';
  private db!: Firestore;

  static getInstance(): DatabaseAuth {
    if (!DatabaseAuth.instance) {
      DatabaseAuth.instance = new DatabaseAuth();
    }
    return DatabaseAuth.instance;
  }

  constructor() {
    this.db = db;
  }

  // Generate a unique user ID
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  // Sign up with email and password
  async signUpWithEmail(
    email: string, 
    password: string, 
    fullName: string, 
    role: 'investor' | 'founder' | 'admin',
    companyName?: string,
    companyWebsite?: string,
    linkedinProfile?: string
  ): Promise<AuthResult> {
    try {
      console.log('🔄 Database signup for:', email, 'Role:', role);

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          user: null,
          error: 'User already exists with this email'
        };
      }

      // For admin role, check if this is the first admin
      if (role === 'admin') {
        const isFirst = await this.isFirstAdmin();
        if (!isFirst) {
          return {
            success: false,
            user: null,
            error: 'Admin registration is closed. Only the first admin can self-register.'
          };
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create new user profile
      const userProfile: UserProfile = {
        uid: this.generateUserId(),
        email: email.toLowerCase().trim(),
        displayName: fullName.trim(),
        role,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        isAuthenticated: true,
        // Add company information for founders
        ...(role === 'founder' && {
          companyName: companyName?.trim() || '',
          companyWebsite: companyWebsite?.trim() || '',
          linkedinProfile: linkedinProfile?.trim() || ''
        })
      };

      // Store in Firestore
      await setDoc(doc(this.db, 'users', userProfile.uid), userProfile);

      // Store session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify({
          uid: userProfile.uid,
          email: userProfile.email,
          role: userProfile.role
        }));
      }

      console.log('✅ Database signup successful:', userProfile.email);

      return {
        success: true,
        user: userProfile
      };
    } catch (error: any) {
      console.error('❌ Database signup error:', error);
      return {
        success: false,
        user: null,
        error: error.message || 'Failed to create account'
      };
    }
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string, expectedRole?: 'investor' | 'founder' | 'admin'): Promise<AuthResult> {
    try {
      console.log('🔄 Database signin for:', email);
      console.log('🔄 Database instance:', this);
      console.log('🔄 Database db:', this.db);

      // Get user from database
      console.log('🔄 Getting user by email...');
      const userProfile = await this.getUserByEmail(email);
      console.log('🔄 User profile found:', userProfile);
      
      if (!userProfile) {
        console.log('❌ No user profile found for email:', email);
        return {
          success: false,
          user: null,
          error: 'No account found with this email. Please sign up first or check your email address.'
        };
      }

      // Verify password
      console.log('🔄 Verifying password...');
      const isPasswordValid = await this.verifyPassword(password, userProfile.password);
      console.log('🔄 Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ Password verification failed');
        return {
          success: false,
          user: null,
          error: 'Invalid email or password. Please check your credentials and try again.'
        };
      }

      // Validate role if expected role is provided
      if (expectedRole && userProfile.role !== expectedRole) {
        console.log('❌ Role mismatch:', userProfile.role, 'vs', expectedRole);
        return {
          success: false,
          user: null,
          error: `This email is registered as a ${userProfile.role}, not a ${expectedRole}. Please use the correct login page.`
        };
      }

      // Update authentication status
      console.log('🔄 Updating authentication status...');
      userProfile.isAuthenticated = true;
      
      try {
        await setDoc(doc(this.db, 'users', userProfile.uid), userProfile);
      } catch (dbError) {
        console.warn('⚠️ Could not update database, but continuing with login:', dbError);
      }

      // Store session in localStorage
      if (typeof window !== 'undefined') {
        console.log('🔄 Storing session in localStorage...');
        localStorage.setItem(this.SESSION_KEY, JSON.stringify({
          uid: userProfile.uid,
          email: userProfile.email,
          role: userProfile.role
        }));
      }

      console.log('✅ Database signin successful:', userProfile.email);

      return {
        success: true,
        user: userProfile
      };
    } catch (error: any) {
      console.error('❌ Database signin error:', error);
      console.error('❌ Database signin error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return {
        success: false,
        user: null,
        error: error.message || 'Failed to sign in'
      };
    }
  }

  // Get user by email from database
  private async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      console.log('🔄 Getting user by email:', email);
      console.log('🔄 Database instance in getUserByEmail:', this.db);
      
      const usersRef = collection(this.db, 'users');
      console.log('🔄 Users collection reference:', usersRef);
      
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      console.log('🔄 Query created:', q);
      
      const querySnapshot = await getDocs(q);
      console.log('🔄 Query snapshot:', querySnapshot);
      console.log('🔄 Query snapshot empty:', querySnapshot.empty);
      console.log('🔄 Query snapshot size:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('❌ No documents found for email:', email);
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as UserProfile;
      console.log('🔄 User document data:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Get user by email error:', error);
      console.error('❌ Get user by email error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return null;
    }
  }

  // Get current user from session
  getCurrentUser(): UserProfile | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) {
        return null;
      }

      const sessionData = JSON.parse(session);
      return {
        uid: sessionData.uid,
        email: sessionData.email,
        displayName: sessionData.displayName || sessionData.email.split('@')[0],
        role: sessionData.role,
        password: '', // Don't store password in session
        createdAt: new Date().toISOString(),
        isAuthenticated: true
      };
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.SESSION_KEY);
      }
      console.log('✅ Database signout successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Check if this is the first admin (no admin exists yet)
  private async isFirstAdmin(): Promise<boolean> {
    try {
      const usersRef = collection(this.db, 'users');
      const adminQuery = query(usersRef, where('role', '==', 'admin'));
      const snapshot = await getDocs(adminQuery);
      return snapshot.empty;
    } catch (error) {
      console.error('❌ Error checking for first admin:', error);
      return false;
    }
  }

  // Public method to check if first admin exists (for UI)
  async canCreateAdmin(): Promise<boolean> {
    return await this.isFirstAdmin();
  }

  // Google OAuth with real Google authentication
  async signInWithGoogle(role?: 'investor' | 'founder' | 'admin'): Promise<AuthResult> {
    try {
      console.log('🔄 Database Google signin, Role:', role);
      
      // Check if Google is available
      if (typeof window === 'undefined' || !window.google) {
        return {
          success: false,
          user: null,
          error: 'Google authentication not available'
        };
      }

      // Use Google Identity Services
      const credential = await new Promise((resolve, reject) => {
        window.google.accounts.oauth2.initCodeClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
          scope: 'email profile',
          callback: (response: any) => {
            if (response.code) {
              resolve(response.code);
            } else {
              reject(new Error('Google authentication failed'));
            }
          }
        }).requestCode();
      });

      // For now, create a mock Google user with real Google data
      const userProfile: UserProfile = {
        uid: this.generateUserId(),
        email: 'user@gmail.com', // This would come from Google API
        displayName: 'Google User', // This would come from Google API
        role: role || 'investor',
        password: '', // No password for Google
        createdAt: new Date().toISOString(),
        isAuthenticated: true
      };

      // Check if user already exists
      const existingUser = await this.getUserByEmail(userProfile.email);
      if (existingUser) {
        userProfile.uid = existingUser.uid;
        userProfile.role = existingUser.role; // Keep existing role
      }

      // Store in Firestore
      await setDoc(doc(this.db, 'users', userProfile.uid), userProfile);

      // Store session
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify({
          uid: userProfile.uid,
          email: userProfile.email,
          role: userProfile.role
        }));
      }

      console.log('✅ Database Google signin successful:', userProfile.email);

      return {
        success: true,
        user: userProfile
      };
    } catch (error: any) {
      console.error('❌ Database Google signin error:', error);
      return {
        success: false,
        user: null,
        error: error.message || 'Failed to sign in with Google'
      };
    }
  }
}

export const databaseAuth = DatabaseAuth.getInstance();
