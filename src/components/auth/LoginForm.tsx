'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { signIn, signInWithGoogle, checkGoogleRedirectResult } from '@/lib/firebase/auth'
import { loginAction, googleLoginAction } from '@/actions/auth'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToReset: () => void
  onSuccess: () => void
}

export function LoginForm({ onSwitchToRegister, onSwitchToReset, onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Handle Google redirect result on mount (if user was redirected back)
  useEffect(() => {
    checkGoogleRedirectResult().then(async (result) => {
      if (!result) return
      setGoogleLoading(true)
      try {
        const loginResult = await googleLoginAction(result.idToken)
        if (!loginResult.success) {
          setFormError(loginResult.error || 'Noe gikk galt.')
          setGoogleLoading(false)
          return
        }
        router.refresh()
        onSuccess()
      } catch {
        setFormError('Innlogging med Google feilet. Prøv igjen.')
        setGoogleLoading(false)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = 'Oppgi en gyldig e-postadresse.'
    if (!password.trim()) newErrors.password = 'Oppgi passord.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setErrors({})
    if (!validate()) return
    setLoading(true)

    try {
      // Step 1: Firebase client auth
      const { idToken } = await signIn(email, password)

      // Step 2: Server Action creates jose session cookie
      const result = await loginAction(idToken)
      if (!result.success) {
        setFormError(result.error || 'Noe gikk galt.')
        setLoading(false)
        return
      }

      // Step 3: Refresh server state and close modal (D-11: stay on current page)
      router.refresh()
      onSuccess()
    } catch (err: unknown) {
      // Map Firebase error codes to Norwegian messages
      const firebaseError = err as { code?: string }
      if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setFormError('Feil e-post eller passord. Prøv igjen.')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setFormError('For mange forsøk. Vent litt og prøv igjen.')
      } else if (firebaseError.code === 'auth/invalid-email') {
        setErrors({ email: 'Oppgi en gyldig e-postadresse.' })
      } else {
        console.error('Login error:', firebaseError.code, err)
        setFormError('Noe gikk galt. Sjekk internettforbindelsen og prøv på nytt.')
      }
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setFormError('')
    setGoogleLoading(true)

    try {
      const { idToken } = await signInWithGoogle()
      const result = await googleLoginAction(idToken)
      if (!result.success) {
        setFormError(result.error || 'Noe gikk galt.')
        setGoogleLoading(false)
        return
      }

      router.refresh()
      onSuccess()
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.message === 'redirect') {
        // Redirecting to Google — don't show error
        return
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        // Bruker lukket popup — ingen feilmelding
      } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        setFormError('Denne e-postadressen er allerede registrert med en annen innloggingsmetode.')
      } else {
        setFormError('Innlogging med Google feilet. Prøv igjen.')
      }
      setGoogleLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <FormError id="login-form-error" message={formError} className="mb-4" />
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-forest/20 bg-white px-4 py-2 font-body text-body font-medium text-forest transition-all duration-100 min-h-[44px] hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
        aria-busy={googleLoading || undefined}
      >
        {googleLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest/20 border-t-forest" aria-hidden="true" />
            <span>Laster...</span>
          </>
        ) : (
          <>
            <span className="text-lg font-bold leading-none" aria-hidden="true">G</span>
            <span>Logg inn med Google</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-forest/12" />
        <span className="text-label text-body">eller</span>
        <div className="h-px flex-1 bg-forest/12" />
      </div>

      <div className="space-y-4">
        <Input
          label="E-postadresse"
          type="email"
          placeholder="ola@eksempel.no"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
          id="login-email"
        />
        <Input
          label="Passord"
          type="password"
          placeholder="Minst 8 tegn"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          autoComplete="current-password"
          id="login-password"
        />
      </div>

      <div className="mt-2 text-right">
        <button
          type="button"
          className="text-label text-body hover:underline"
          onClick={onSwitchToReset}
        >
          Glemt passord?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="mt-6 w-full"
      >
        Logg inn
      </Button>

      <p className="mt-4 text-center text-label text-body">
        Ny her?{' '}
        <button
          type="button"
          className="text-forest hover:underline"
          onClick={onSwitchToRegister}
        >
          Opprett konto
        </button>
      </p>
    </form>
  )
}
