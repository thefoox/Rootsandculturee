'use client'

import { useActionState, useEffect } from 'react'
import { updateProfileAction } from '@/actions/profile'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { toast } from 'sonner'

interface ProfileFormProps {
  profile: {
    uid: string
    email: string
    displayName: string
    address: string
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success('Profilen er oppdatert')
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      <Input
        label="E-post"
        type="email"
        value={profile.email}
        readOnly
        disabled
        className="opacity-60 cursor-not-allowed"
      />

      <Input
        label="Fullt navn"
        name="displayName"
        defaultValue={profile.displayName}
        required
        minLength={2}
      />

      <Input
        label="Leveringsadresse"
        name="address"
        defaultValue={profile.address}
      />

      {state && !state.success && state.error && (
        <FormError id="profile-error" message={state.error} />
      )}

      <Button type="submit" loading={isPending}>
        Lagre endringer
      </Button>
    </form>
  )
}
