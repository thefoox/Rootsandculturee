'use server'

import { z } from 'zod'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import { checkActionRateLimit } from '@/lib/rate-limit'

const contactSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd.').max(100),
  email: z.string().email('Ugyldig e-postadresse.'),
  message: z.string().min(10, 'Meldingen må være minst 10 tegn.').max(5000),
})

export interface ContactFormState {
  success: boolean
  error?: string
}

export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const limited = await checkActionRateLimit('contact', 5, 3_600_000) // 5/hr
  if (limited) {
    return { success: false, error: 'For mange forsøk. Prøv igjen om en time.' }
  }

  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  if (!resend) {
    return { success: false, error: 'E-posttjenesten er ikke konfigurert.' }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: 'post@rootsculture.no',
      replyTo: parsed.data.email,
      subject: `Kontaktskjema: ${parsed.data.name}`,
      text: `Navn: ${parsed.data.name}\nE-post: ${parsed.data.email}\n\nMelding:\n${parsed.data.message}`,
    })

    return { success: true }
  } catch (err) {
    console.error('Contact form error:', err)
    return { success: false, error: 'Kunne ikke sende meldingen. Prøv igjen.' }
  }
}
