"use client"

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void
  onError: (error: string) => void
  text?: string
  disabled?: boolean
}

export default function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  text = "Sign in with Google",
  disabled = false 
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (typeof window !== 'undefined' && window.google && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
            callback: (response: any) => {
              if (response.credential) {
                onSuccess(response.credential)
              } else {
                onError('Google authentication failed')
              }
            }
          })

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 300
          })
        } catch (error) {
          console.error('Google OAuth initialization error:', error)
          onError('Google authentication not available')
        }
      }
    }

    // Wait for Google script to load
    if (typeof window !== 'undefined' && window.google) {
      initializeGoogleAuth()
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (typeof window !== 'undefined' && window.google) {
          clearInterval(checkGoogle)
          initializeGoogleAuth()
        }
      }, 100)

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000)
    }
  }, [onSuccess, onError])

  if (disabled) {
    return (
      <Button 
        type="button"
        variant="outline" 
        className="w-full bg-transparent"
        disabled
      >
        {text}
      </Button>
    )
  }

  return (
    <div ref={buttonRef} className="w-full" />
  )
}
