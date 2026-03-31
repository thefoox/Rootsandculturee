'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { signUp } from '@/lib/firebase/auth'
import { registerAction } from '@/actions/auth'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Oppgi fullt navn.'
    if (!email.trim()) newErrors.email = 'Oppgi en gyldig e-postadresse.'
    if (password.length < 8) newErrors.password = 'Passordet er for svakt. Bruk minst 8 tegn med tall og bokstaver.'
    if (!address.trim()) newErrors.address = 'Oppgi leveringsadresse.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setLoading(true)

    try {
      // Step 1: Firebase client auth
      const { idToken } = await signUp(email, password, name)

      // Step 2: Server Action creates user doc + session
      const result = await registerAction(idToken, name, address)
      if (!result.success) {
        setFormError(result.error || 'Noe gikk galt.')
        setLoading(false)
        return
      }

      // Step 3: Refresh and close modal
      router.refresh()
      onSuccess()
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      if (firebaseError.code === 'auth/email-already-in-use') {
        setFormError('Denne e-postadressen er allerede registrert. Logg inn i stedet?')
      } else if (firebaseError.code === 'auth/weak-password') {
        setErrors({ password: 'Passordet er for svakt. Bruk minst 8 tegn med tall og bokstaver.' })
      } else if (firebaseError.code === 'auth/invalid-email') {
        setErrors({ email: 'Oppgi en gyldig e-postadresse.' })
      } else {
        setFormError('Noe gikk galt. Sjekk internettforbindelsen og prover pa nytt.')
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <FormError id="register-form-error" message={formError} className="mb-4" />
      )}

      <div className="space-y-4">
        <Input
          label="Fullt navn"
          type="text"
          placeholder="Ola Nordmann"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
          autoComplete="name"
          id="register-name"
        />
        <Input
          label="E-postadresse"
          type="email"
          placeholder="ola@eksempel.no"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
          id="register-email"
        />
        <Input
          label="Passord"
          type="password"
          placeholder="Minst 8 tegn"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          autoComplete="new-password"
          id="register-password"
        />
        <Input
          label="Leveringsadresse"
          type="text"
          placeholder="Gateadresse, postnummer, sted"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
          required
          autoComplete="street-address"
          id="register-address"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="mt-6 w-full"
      >
        Opprett konto
      </Button>

      <p className="mt-4 text-center text-[13px] text-body">
        Har du konto?{' '}
        <button
          type="button"
          className="text-ember hover:underline"
          onClick={onSwitchToLogin}
        >
          Logg inn
        </button>
      </p>
    </form>
  )
}
