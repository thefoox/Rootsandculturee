'use server'

import { z } from 'zod'
import { subscribeNewsletter } from '@/lib/email/contacts'
import { checkActionRateLimit } from '@/lib/rate-limit'

export interface NewsletterState {
  success: boolean
  error?: string
  message?: string
}

const NewsletterSchema = z.object({
  email: z.string().email('Oppgi en gyldig e-postadresse.'),
})

export async function subscribeAction(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const limited = await checkActionRateLimit('newsletter', 5, 3_600_000) // 5/hr
  if (limited) {
    return { success: false, error: 'For mange forsøk. Prøv igjen om en time.' }
  }

  const parsed = NewsletterSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Ugyldig e-postadresse.',
    }
  }

  try {
    await subscribeNewsletter(parsed.data.email)
    return {
      success: true,
      message: 'Takk! Du er nå påmeldt nyhetsbrevet vårt.',
    }
  } catch {
    return {
      success: false,
      error: 'Noe gikk galt. Prøv igjen senere.',
    }
  }
}
