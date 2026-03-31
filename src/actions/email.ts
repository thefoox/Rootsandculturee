'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/dal'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import { adminDb } from '@/lib/firebase/admin'

const emailSchema = z.object({
  to: z.string().email('Ugyldig e-postadresse.'),
  subject: z.string().min(1, 'Emne er pakrevd.').max(200, 'Emnet er for langt.'),
  message: z.string().min(1, 'Melding er pakrevd.').max(5000, 'Meldingen er for lang.'),
})

export async function sendAdminEmail(
  to: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ingen tilgang.' }
  }

  const validation = emailSchema.safeParse({ to, subject, message })
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { success: false, error: firstError.message }
  }

  if (!resend) {
    return { success: false, error: 'E-posttjenesten er ikke konfigurert.' }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text: `${message}\n\nMed vennlig hilsen,\nRoots & Culture`,
    })

    // Log to Firestore
    if (adminDb) {
      await adminDb.collection('emailLog').add({
        to,
        subject,
        message,
        sentBy: session.email,
        sentAt: new Date(),
      })
    }

    return { success: true }
  } catch (err) {
    console.error('Admin email error:', err)
    return { success: false, error: 'Kunne ikke sende e-post. Prov igjen.' }
  }
}
