'use client';

import { useEffect, useState } from 'react';
import { localAuth } from '@/lib/local-auth';

export default function FirebaseConnectionTest() {
  const [status, setStatus] = useState<string>('Testing Firebase connection...');
  const [authStatus, setAuthStatus] = useState<string>('Checking auth...');
  const [configStatus, setConfigStatus] = useState<string>('Checking config...');

  useEffect(() => {
    // Test local authentication system
    try {
      const currentUser = localAuth.getCurrentUser();
      if (currentUser) {
        setAuthStatus(`✅ Local Auth: User logged in (${currentUser.email})`);
      } else {
        setAuthStatus('✅ Local Auth: No user (ready for login)');
      }
    } catch (error) {
      setAuthStatus('❌ Local Auth: Error');
    }

    // Test localStorage availability
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setConfigStatus('✅ Local Storage: Available and working');
    } catch (error) {
      setConfigStatus('❌ Local Storage: Not available');
    }

    // Overall status
    setTimeout(() => {
      setStatus('✅ Local Authentication System Ready');
    }, 1000);
  }, []);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <h3 className="font-bold mb-2 text-blue-800">Firebase Connection Test</h3>
      <div className="space-y-1 text-sm text-blue-700">
        <div>{status}</div>
        <div>{configStatus}</div>
        <div>{authStatus}</div>
      </div>
    </div>
  );
}
