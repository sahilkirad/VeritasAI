'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Add a small delay to prevent immediate redirects during session validation
    const redirectTimeout = setTimeout(() => {
      if (!loading && !user) {
        console.log('🔄 No user found, redirecting to login');
        router.push('/login');
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(redirectTimeout);
  }, [user, loading, router]);

  // Show loading spinner during SSR and initial client render
  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
