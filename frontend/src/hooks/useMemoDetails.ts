// Custom hook for fetching individual memo details from ingestionResults
import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase-new'

interface MemoDetails {
  id: string
  startupName: string
  founderName: string
  founderEmail: string
  stage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B'
  sector: string[]
  status: 'Intake' | 'Memo 1' | 'Memo 2' | 'Memo 3' | 'Sent'
  aiScore?: number
  riskLevel: 'Low' | 'Medium' | 'High'
  lastUpdated: string
  createdAt: string
  memo1Generated: boolean
  memo2Generated: boolean
  memo3Generated: boolean
  originalFilename: string
  processingTime: number
  processingStatus: 'SUCCESS' | 'FAILED'
  memo_1: any
  memo_2: any
  memo_3: any
}

interface UseMemoDetailsReturn {
  memo: MemoDetails | null
  loading: boolean
  error: Error | null
}

export function useMemoDetails(memoId: string | undefined): UseMemoDetailsReturn {
  const [memo, setMemo] = useState<MemoDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!memoId) {
      setLoading(false)
      setError(new Error('No memo ID provided'))
      return
    }

    console.log('🔄 Setting up real-time memo details listener for:', memoId)
    
    const memoRef = doc(db, 'ingestionResults', memoId)
    
    const unsubscribe = onSnapshot(
      memoRef,
      (doc) => {
        try {
          if (!doc.exists()) {
            console.log('❌ Memo not found:', memoId)
            setMemo(null)
            setError(new Error('Memo not found'))
            setLoading(false)
            return
          }

          const data = doc.data()
          const transformedMemo = transformToMemoDetails(doc.id, data)
          
          console.log('✅ Real-time memo details update:', transformedMemo.startupName)
          setMemo(transformedMemo)
          setError(null)
          setLoading(false)
        } catch (err) {
          console.error('❌ Error processing memo data:', err)
          setError(err as Error)
          setLoading(false)
        }
      },
      (err) => {
        console.error('❌ Real-time memo details listener error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => {
      console.log('🧹 Cleaning up memo details listener for:', memoId)
      unsubscribe()
    }
  }, [memoId])

  return { memo, loading, error }
}

// Transform ingestionResults document to MemoDetails format
function transformToMemoDetails(id: string, data: any): MemoDetails {
  try {
    const memo1 = data.memo_1 || {}
    const memo2 = data.memo_2 || {}
    const memo3 = data.memo_3 || {}
    
    // Extract company information
    const startupName = memo1.title || 
                       memo3.company_name || 
                       memo2.company_name || 
                       'Unknown Company'
    
    const founderName = memo1.founder_name || 
                       memo3.founder_name || 
                       memo2.founder_name || 
                       'Unknown Founder'
    
    const founderEmail = memo1.founder_email || 
                        memo3.founder_email || 
                        memo2.founder_email || 
                        'unknown@example.com'
    
    // Determine stage
    const stage = memo1.company_stage || 
                 memo3.company_stage || 
                 memo2.company_stage || 
                 'Seed'
    
    // Extract sector information
    const sector = memo1.industry_category ? 
                  [memo1.industry_category] : 
                  memo3.industry_category ? 
                  [memo3.industry_category] : 
                  memo2.industry_category ? 
                  [memo2.industry_category] : 
                  ['Technology']
    
    // Calculate status based on which memos exist
    const hasMemo1 = memo1 && Object.keys(memo1).length > 0
    const hasMemo2 = memo2 && Object.keys(memo2).length > 0
    const hasMemo3 = memo3 && Object.keys(memo3).length > 0
    
    let status = 'Intake'
    if (hasMemo3) status = 'Memo 3'
    else if (hasMemo2) status = 'Memo 2'
    else if (hasMemo1) status = 'Memo 1'
    
    // Calculate AI score
    const aiScore = memo3.overall_score || 
                   memo2.overall_score || 
                   memo1.overall_score || 
                   undefined
    
    // Calculate risk level
    const riskLevel = calculateRiskLevel(data)
    
    // Determine last updated timestamp
    const getSafeTimestamp = (timestamp: any) => {
      try {
        if (timestamp && timestamp.seconds) {
          const date = new Date(timestamp.seconds * 1000)
          return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
        }
        return new Date().toISOString()
      } catch (error) {
        console.warn('Invalid timestamp:', timestamp, error)
        return new Date().toISOString()
      }
    }

    const lastUpdated = data.createdAt || getSafeTimestamp(data.timestamp)
    const createdAt = data.createdAt || getSafeTimestamp(data.timestamp)

    return {
      id,
      startupName,
      founderName,
      founderEmail,
      stage: stage as 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B',
      sector,
      status: status as 'Intake' | 'Memo 1' | 'Memo 2' | 'Memo 3' | 'Sent',
      aiScore,
      riskLevel,
      lastUpdated,
      createdAt,
      memo1Generated: hasMemo1,
      memo2Generated: hasMemo2,
      memo3Generated: hasMemo3,
      originalFilename: data.original_filename || 'Unknown',
      processingTime: data.processing_time_seconds || 0,
      processingStatus: data.status || 'SUCCESS',
      memo_1: memo1,
      memo_2: memo2,
      memo_3: memo3
    }
  } catch (error) {
    console.error('❌ Error transforming memo data:', error, 'Data:', data)
    // Return a minimal memo object to prevent complete failure
    return {
      id,
      startupName: 'Unknown Company',
      founderName: 'Unknown Founder',
      founderEmail: 'unknown@example.com',
      stage: 'Seed',
      sector: ['Technology'],
      status: 'Intake',
      riskLevel: 'Medium',
      aiScore: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      memo1Generated: false,
      memo2Generated: false,
      memo3Generated: false,
      originalFilename: 'Unknown',
      processingTime: 0,
      processingStatus: 'SUCCESS',
      memo_1: {},
      memo_2: {},
      memo_3: {}
    }
  }
}

// Calculate risk level based on flags/score
function calculateRiskLevel(data: any): 'Low' | 'Medium' | 'High' {
  const memo1 = data.memo_1 || {}
  const memo2 = data.memo_2 || {}
  const memo3 = data.memo_3 || {}
  
  // Check for red flags
  const redFlags = [
    ...(memo1.initial_flags || []),
    ...(memo2.key_risks || []),
    ...(memo3.key_risks || [])
  ]
  
  // Get AI score
  const score = memo3.overall_score || memo2.overall_score || memo1.overall_score || 5
  
  // High risk: Many red flags or low score
  if (redFlags.length > 3 || score < 4) return 'High'
  
  // Medium risk: Some red flags or medium score
  if (redFlags.length > 1 || score < 7) return 'Medium'
  
  // Low risk: Few flags and good score
  return 'Low'
}
