'use client'

import { useState } from 'react'
import {
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { toast } from 'sonner'

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!currentPassword) {
      newErrors.currentPassword = 'Gammelt passord er paakrevd.'
    }
    if (!newPassword || newPassword.length < 8) {
      newErrors.newPassword = 'Nytt passord ma vaere minst 8 tegn.'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Bekreft passord er paakrevd.'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passordene samsvarer ikke.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (!validate()) return

    const user = auth?.currentUser
    if (!user || !user.email) {
      setErrors({ general: 'Du er ikke logget inn. Last inn siden pa nytt.' })
      return
    }

    setIsLoading(true)

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)

      toast.success('Passordet er endret')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: unknown) {
      const firebaseError = error as { code?: string }
      if (
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        setErrors({ currentPassword: 'Feil passord. Prov igjen.' })
      } else if (firebaseError.code === 'auth/weak-password') {
        setErrors({ newPassword: 'Passordet er for svakt (minst 8 tegn).' })
      } else {
        setErrors({ general: 'Noe gikk galt. Prov igjen.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h3 className="font-heading text-lg font-bold text-forest mb-4">
        Endre passord
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input
          label="Gammelt passord"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errors.currentPassword}
        />

        <Input
          label="Nytt passord"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.newPassword}
        />

        <Input
          label="Bekreft nytt passord"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        {errors.general && (
          <FormError id="password-error" message={errors.general} />
        )}

        <Button type="submit" loading={isLoading}>
          Endre passord
        </Button>
      </form>
    </div>
  )
}
