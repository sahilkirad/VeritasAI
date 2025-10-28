#!/usr/bin/env node

/**
 * Test User Creation Script
 * Creates a test investor user for testing the login functionality
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');
const bcrypt = require('bcryptjs');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJuzygstsuvpYofxhwnipGTH-3DzAkVQM",
  authDomain: "veritas-472301.firebaseapp.com",
  projectId: "veritas-472301",
  storageBucket: "veritas-472301.firebasestorage.app",
  messagingSenderId: "533015987350",
  appId: "1:533015987350:web:d6080ff950f86137352eb7",
  measurementId: "G-PRT33XGJNS",
};

async function createTestUser() {
  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test user data
    const testUser = {
      email: 'investor@test.com',
      password: 'testpassword123',
      displayName: 'Test Investor',
      role: 'investor'
    };
    
    console.log('🔄 Creating test user:', testUser.email);
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(testUser.password, saltRounds);
    
    // Generate user ID
    const userId = 'test_investor_' + Date.now();
    
    // Create user profile
    const userProfile = {
      uid: userId,
      email: testUser.email,
      displayName: testUser.displayName,
      role: testUser.role,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      isAuthenticated: false
    };
    
    // Add to Firestore
    await setDoc(doc(db, 'users', userId), userProfile);
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('👤 Role:', testUser.role);
    console.log('🆔 User ID:', userId);
    console.log('');
    console.log('🌐 You can now test login at: https://veritas-472301.web.app/investor/login');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

// Run the script
createTestUser();
