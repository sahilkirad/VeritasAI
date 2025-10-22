// hooks/useFirestoreRealtime.ts
// Custom hook for Firestore real-time listeners

import { useEffect, useState, useRef, useMemo } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  Unsubscribe,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore'
import { useFirebase } from './useFirebase'

interface UseFirestoreRealtimeOptions {
  collectionName: string
  constraints?: QueryConstraint[]
  enabled?: boolean
}

interface UseFirestoreRealtimeReturn<T> {
  data: T[]
  loading: boolean
  error: Error | null
  unsubscribe: () => void
}

export function useFirestoreRealtime<T = DocumentData>({
  collectionName,
  constraints = [],
  enabled = true
}: UseFirestoreRealtimeOptions): UseFirestoreRealtimeReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  
  // Use Firebase hook to ensure proper initialization
  const { isInitialized, db, error: firebaseError } = useFirebase()

  // Memoize constraints to prevent infinite loops
  const constraintsKey = useMemo(() => 
    JSON.stringify(constraints.map((c: any) => {
      // Create a stable key for each constraint
      if (c.type === 'where') return `where:${c.field}:${c.op}:${c.value}`;
      if (c.type === 'orderBy') return `orderBy:${c.field}:${c.direction || 'asc'}`;
      if (c.type === 'limit') return `limit:${c.limit}`;
      return JSON.stringify(c);
    })),
    [constraints]
  )

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    // Check if we're on the client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // Wait for Firebase to be initialized
    if (!isInitialized) {
      if (firebaseError) {
        setError(firebaseError)
        setLoading(false)
      }
      return
    }

    // Check if Firebase is properly initialized
    if (!db) {
      console.log('Firebase not initialized yet, will retry...')
      setError(new Error('Firebase not initialized'))
      setLoading(false)
      return
    }

    try {
      const collectionRef = collection(db, collectionName)
      const q = query(collectionRef, ...constraints)
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newData: T[] = []
          snapshot.forEach((doc) => {
            newData.push({
              id: doc.id,
              ...doc.data()
            } as T)
          })
          setData(newData)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error(`Error listening to ${collectionName}:`, err)
          setError(err)
          setLoading(false)
        }
      )

      unsubscribeRef.current = unsubscribe

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    } catch (err) {
      console.error(`Error setting up listener for ${collectionName}:`, err)
      setError(err as Error)
      setLoading(false)
    }
  }, [collectionName, enabled, isInitialized, constraintsKey])

  const unsubscribe = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
  }

  return {
    data,
    loading,
    error,
    unsubscribe
  }
}

// Specific hooks for admin dashboard collections

export function useAdminMemos() {
  return useFirestoreRealtime({
    collectionName: 'adminMemos',
    constraints: [
      orderBy('createdAt', 'desc'),
      limit(50)
    ]
  })
}

export function usePendingMemos() {
  return useFirestoreRealtime({
    collectionName: 'adminMemos',
    constraints: [
      orderBy('createdAt', 'desc'),
      limit(50)
    ]
  })
}

export function useApprovedMemos() {
  return useFirestoreRealtime({
    collectionName: 'adminMemos',
    constraints: [
      orderBy('createdAt', 'desc'),
      limit(50)
    ]
  })
}

export function useFlaggedMemos() {
  return useFirestoreRealtime({
    collectionName: 'adminMemos',
    constraints: [
      orderBy('createdAt', 'desc'),
      limit(50)
    ]
  })
}

export function useInvestorProfiles() {
  return useFirestoreRealtime({
    collectionName: 'investorProfiles',
    constraints: [
      orderBy('createdAt', 'desc')
    ]
  })
}

export function useInvestorRecommendations() {
  return useFirestoreRealtime({
    collectionName: 'investorRecommendations',
    constraints: [
      orderBy('generatedAt', 'desc'),
      limit(20)
    ]
  })
}

export function usePlatformMetrics() {
  return useFirestoreRealtime({
    collectionName: 'platformMetrics',
    constraints: [
      orderBy('date', 'desc'),
      limit(1)
    ]
  })
}

export function useRecentActivity() {
  return useFirestoreRealtime({
    collectionName: 'adminActivity',
    constraints: [
      orderBy('timestamp', 'desc'),
      limit(10)
    ]
  })
}

// Hook for real-time platform statistics
export function usePlatformStats() {
  const [stats, setStats] = useState({
    totalActiveDeals: 0,
    pendingMemos: 0,
    approvedMemos: 0,
    totalInvestors: 0,
    totalFounders: 0
  })

  const adminMemos = useAdminMemos()
  const investorProfiles = useInvestorProfiles()

  useEffect(() => {
    // Filter memos by status on client side to avoid complex Firestore queries
    const pendingMemos = adminMemos.data.filter(
      (memo: any) => memo.status === 'pending_review'
    )
    const approvedMemos = adminMemos.data.filter(
      (memo: any) => memo.status === 'approved'
    )

    const totalInvestors = investorProfiles.data.filter(
      (profile: any) => profile.role === 'investor'
    ).length

    const totalFounders = investorProfiles.data.filter(
      (profile: any) => profile.role === 'founder'
    ).length

    setStats({
      totalActiveDeals: adminMemos.data.length,
      pendingMemos: pendingMemos.length,
      approvedMemos: approvedMemos.length,
      totalInvestors,
      totalFounders
    })
  }, [adminMemos.data, investorProfiles.data])

  return {
    ...stats,
    loading: adminMemos.loading || investorProfiles.loading,
    error: adminMemos.error || investorProfiles.error
  }
}

// Hook for memo status changes
export function useMemoStatusChanges() {
  const [statusChanges, setStatusChanges] = useState<any[]>([])

  const adminMemos = useAdminMemos()

  useEffect(() => {
    // Track status changes by comparing previous and current data
    const changes = adminMemos.data.filter((memo: any) => 
      memo.status === 'approved' || memo.status === 'flagged' || memo.status === 'rejected'
    )

    setStatusChanges(changes)
  }, [adminMemos.data])

  return {
    statusChanges,
    loading: adminMemos.loading,
    error: adminMemos.error
  }
}

// Hook for real-time notifications
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  const pendingMemos = usePendingMemos()
  const flaggedMemos = useFlaggedMemos()
  const recentActivity = useRecentActivity()

  useEffect(() => {
    const newNotifications = [
      ...pendingMemos.data.map((memo: any) => ({
        id: `pending-${memo.id}`,
        type: 'pending_review',
        title: 'New Memo Pending Review',
        message: `Memo for ${memo.companyName} is awaiting review`,
        timestamp: memo.createdAt,
        severity: 'info'
      })),
      ...flaggedMemos.data.map((memo: any) => ({
        id: `flagged-${memo.id}`,
        type: 'flagged',
        title: 'Memo Flagged',
        message: `Memo for ${memo.companyName} has been flagged for review`,
        timestamp: memo.updatedAt,
        severity: 'warning'
      })),
      ...recentActivity.data.map((activity: any) => ({
        id: `activity-${activity.id}`,
        type: 'activity',
        title: activity.title || 'System Activity',
        message: activity.message,
        timestamp: activity.timestamp,
        severity: activity.severity || 'info'
      }))
    ]

    // Sort by timestamp and limit to 20
    setNotifications(
      newNotifications
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
    )
  }, [pendingMemos.data, flaggedMemos.data, recentActivity.data])

  return {
    notifications,
    loading: pendingMemos.loading || flaggedMemos.loading || recentActivity.loading,
    error: pendingMemos.error || flaggedMemos.error || recentActivity.error
  }
}
