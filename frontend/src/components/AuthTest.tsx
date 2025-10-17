'use client';

import { useAuth } from '@/contexts/AuthContext';
import { databaseAuth } from '@/lib/database-auth';

export default function AuthTest() {
  const { user, userProfile, loading } = useAuth();

  const testLocalAuth = () => {
    const currentUser = databaseAuth.getCurrentUser();
    console.log('Local Auth Test:', currentUser);
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
      <h3 className="font-bold mb-2 text-green-800">Authentication Test</h3>
      <div className="space-y-1 text-sm text-green-700">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'None'}</p>
        <p><strong>User Profile:</strong> {userProfile ? `${userProfile.displayName} (${userProfile.role})` : 'None'}</p>
        <p><strong>Database Auth:</strong> {databaseAuth.isAuthenticated() ? 'Authenticated' : 'Not authenticated'}</p>
        <button 
          onClick={testLocalAuth}
          className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs"
        >
          Test Database Auth
        </button>
      </div>
    </div>
  );
}
