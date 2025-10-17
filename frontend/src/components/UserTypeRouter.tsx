'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UserTypeRouterProps {
  children: React.ReactNode;
}

export default function UserTypeRouter({ children }: UserTypeRouterProps) {
  const { userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userProfile?.role) {
      const userType = userProfile.role.toLowerCase();
      
      // Redirect based on user type
      if (userType === 'founder') {
        router.push('/dashboard/founder');
      } else if (userType === 'investor') {
        router.push('/dashboard/investor');
      }
    }
  }, [userProfile, router]);

  return <>{children}</>;
}
