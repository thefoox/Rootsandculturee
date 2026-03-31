'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Navnet ma vaere minst 2 tegn.'),
  address: z.string().optional().default(''),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Gammelt passord er paakrevd.'),
    newPassword: z
      .string()
      .min(8, 'Nytt passord ma vaere minst 8 tegn.'),
    confirmPassword: z.string().min(1, 'Bekreft passord er paakrevd.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passordene samsvarer ikke.',
    path: ['confirmPassword'],
  })

export async function updateProfileAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session) {
    return { success: false, error: 'Du er ikke logget inn.' }
  }

  if (!adminDb) {
    return { success: false, error: 'Server er ikke konfigurert. Kontakt administrator.' }
  }

  const raw = {
    displayName: formData.get('displayName'),
    address: formData.get('address'),
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || 'Ugyldig data.'
    return { success: false, error: firstError }
  }

  try {
    await adminDb.collection('users').doc(session.uid).update({
      displayName: parsed.data.displayName,
      address: parsed.data.address,
    })
    return { success: true }
  } catch {
    return { success: false, error: 'Kunne ikke oppdatere profilen. Prov igjen.' }
  }
}

export async function changePasswordAction(
  _prevState: { success: boolean; requiresReauth?: boolean; error?: string; errors?: Record<string, string> } | null,
  formData: FormData
): Promise<{ success: boolean; requiresReauth?: boolean; error?: string; errors?: Record<string, string> }> {
  const session = await verifySession()
  if (!session) {
    return { success: false, error: 'Du er ikke logget inn.' }
  }

  const raw = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = passwordSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const err of parsed.error.issues) {
      const key = err.path[0]?.toString() || 'general'
      errors[key] = err.message
    }
    return { success: false, errors }
  }

  // Server action only validates -- actual password change must happen client-side
  // since Firebase Auth updatePassword requires the current user's auth state
  return { success: true, requiresReauth: true }
}
