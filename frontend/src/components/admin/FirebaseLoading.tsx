// components/admin/FirebaseLoading.tsx
// Loading component while Firebase initializes

import { useFirebase } from '@/hooks/useFirebase'
import { Loader2 } from 'lucide-react'

interface FirebaseLoadingProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FirebaseLoading({ children, fallback }: FirebaseLoadingProps) {
  const { isInitialized, error } = useFirebase()

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef5ff]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Firebase Error</h1>
          <p className="text-muted-foreground mt-2">
            {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef5ff]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h1 className="text-xl font-semibold text-gray-900">Initializing Firebase...</h1>
          <p className="text-muted-foreground mt-2">
            Please wait while we set up the connection.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
