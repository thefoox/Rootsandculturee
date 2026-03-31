import 'server-only'
import { resend } from './resend'

const SEGMENT_PRODUKTKUNDER = process.env.RESEND_SEGMENT_PRODUKTKUNDER || ''
const SEGMENT_OPPLEVELSESKUNDER = process.env.RESEND_SEGMENT_OPPLEVELSESKUNDER || ''
const SEGMENT_BLOGGLESERE = process.env.RESEND_SEGMENT_BLOGGLESERE || ''
const TOPIC_NYHETSBREV = process.env.RESEND_TOPIC_NYHETSBREV || ''

/**
 * Add or update a contact in Resend. Upsert by email — safe to call multiple times.
 */
export async function addOrUpdateContact(params: {
  email: string
  firstName?: string
  lastName?: string
  segmentIds?: string[]
  topics?: Array<{ id: string; subscription: 'opt_in' | 'opt_out' }>
}): Promise<void> {
  if (!resend) return

  try {
    await resend.contacts.create({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
    })

    if (params.segmentIds?.length) {
      for (const segmentId of params.segmentIds) {
        await resend.contacts.segments.add({
          email: params.email,
          segmentId,
        })
      }
    }

    if (params.topics?.length) {
      await resend.contacts.topics.update({
        email: params.email,
        topics: params.topics,
      })
    }
  } catch (err) {
    console.error('Resend contact sync error:', err)
  }
}

/**
 * Sync a customer to Resend after successful payment.
 * Assigns to Produktkunder and/or Opplevelseskunder segment based on cart contents.
 */
export async function syncPaymentContact(params: {
  email: string
  name: string
  hasProducts: boolean
  hasBookings: boolean
}): Promise<void> {
  const segmentIds: string[] = []
  if (params.hasProducts && SEGMENT_PRODUKTKUNDER) {
    segmentIds.push(SEGMENT_PRODUKTKUNDER)
  }
  if (params.hasBookings && SEGMENT_OPPLEVELSESKUNDER) {
    segmentIds.push(SEGMENT_OPPLEVELSESKUNDER)
  }

  const nameParts = params.name.trim().split(/\s+/)
  const firstName = nameParts[0] || undefined
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined

  await addOrUpdateContact({
    email: params.email,
    firstName,
    lastName,
    segmentIds,
  })
}

/**
 * Subscribe an email to the newsletter (Blogglesere segment + Nyhetsbrev topic opt-in).
 */
export async function subscribeNewsletter(email: string): Promise<void> {
  const segmentIds = SEGMENT_BLOGGLESERE ? [SEGMENT_BLOGGLESERE] : []
  const topics = TOPIC_NYHETSBREV
    ? [{ id: TOPIC_NYHETSBREV, subscription: 'opt_in' as const }]
    : []

  await addOrUpdateContact({
    email,
    segmentIds,
    topics,
  })
}
