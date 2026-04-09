'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getGoogleRedirectResult } from '@/lib/firebase/auth'
import { googleLoginAction } from '@/actions/auth'

/**
 * Invisible component that checks for Google redirect result on every page load.
 * Must be mounted in root layout so it runs regardless of which page the user lands on.
 */
export function GoogleRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    getGoogleRedirectResult().then(async (result) => {
      if (!result) return
      try {
        const loginResult = await googleLoginAction(result.idToken)
        if (loginResult.success) {
          router.refresh()
        }
      } catch (e) {
        console.error('Google redirect login failed:', e)
      }
    })
  }, [router])

  return null
}
