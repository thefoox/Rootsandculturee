import 'server-only'

/**
 * Runtime environment variable validation.
 * Call validateEnv() at server startup (e.g. in a Server Action or API route)
 * to fail fast with a clear error message when required vars are missing.
 *
 * During build, env vars may not be available — so validation is lazy,
 * not at module scope.
 */

function getRequired(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env.local or your deployment environment.`
    )
  }
  return value
}

let validated = false

export function validateEnv() {
  if (validated) return
  validated = true

  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ]

  if (process.env.NODE_ENV === 'production') {
    required.push('SESSION_SECRET')
  }

  const missing = required.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n` +
      missing.map((name) => `  - ${name}`).join('\n') +
      `\n\nSet them in .env.local or your deployment environment.`
    )
  }

  // Warn about optional vars
  const optional = ['RESEND_API_KEY', 'FIREBASE_PROJECT_ID']
  for (const name of optional) {
    if (!process.env[name]) {
      console.warn(`[env] Optional variable ${name} not set.`)
    }
  }
}
