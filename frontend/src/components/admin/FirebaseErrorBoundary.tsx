// components/admin/FirebaseErrorBoundary.tsx
// Error boundary component for Firebase initialization errors

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface FirebaseErrorBoundaryProps {
  children: ReactNode
  error?: Error | null
}

export function FirebaseErrorBoundary({ children, error }: FirebaseErrorBoundaryProps) {
  // Handle Firebase initialization errors
  if (error && error.message.includes('Firebase not initialized')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef5ff]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Firebase Initialization Error</h1>
          <p className="text-muted-foreground mb-6">
            The Firebase connection could not be established. This might be due to:
          </p>
          <ul className="text-left text-sm text-muted-foreground mb-6 space-y-2">
            <li>• Network connectivity issues</li>
            <li>• Firebase configuration problems</li>
            <li>• Service temporarily unavailable</li>
          </ul>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin'} 
              variant="outline"
              className="w-full"
            >
              Back to Admin Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
