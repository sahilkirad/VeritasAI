// hooks/useFirebase.ts
// Custom hook to ensure Firebase is properly initialized on client side

import { useEffect, useState } from 'react'
import { db, auth, storage } from '@/lib/firebase-client'

interface UseFirebaseReturn {
  isInitialized: boolean
  db: any
  auth: any
  storage: any
  error: Error | null
}

export function useFirebase(): UseFirebaseReturn {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    // Check if Firebase is initialized
    if (db && auth && storage) {
      setIsInitialized(true)
      setError(null)
    } else {
      // Retry after a short delay
      const timer = setTimeout(() => {
        if (db && auth && storage) {
          setIsInitialized(true)
          setError(null)
        } else {
          // Don't set error, just keep trying
          console.log('Firebase not ready yet, will retry...')
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  return {
    isInitialized,
    db,
    auth,
    storage,
    error
  }
}
