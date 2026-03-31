'use server'

import { z } from 'zod'
import { subscribeNewsletter } from '@/lib/email/contacts'

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
      message: 'Takk! Du er na pameldt nyhetsbrevet vart.',
    }
  } catch {
    return {
      success: false,
      error: 'Noe gikk galt. Prov igjen senere.',
    }
  }
}
