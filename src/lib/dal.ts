import 'server-only'
import { cache } from 'react'
import { getSession } from './session'
import type { SessionPayload } from '@/types'

export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  const session = await getSession()
  if (!session) return null
  return session
})
