import { readFileSync } from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Load .env.local
const envFile = readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
}

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const auth = getAuth(app)
const db = getFirestore(app)

async function main() {
  const EMAIL = 'admin@rootsandculture.com'
  const user = await auth.getUserByEmail(EMAIL)
  console.log('UID:', user.uid)
  console.log('Providers:', user.providerData.map(p => p.providerId))
  console.log('Custom claims:', JSON.stringify(user.customClaims))
  console.log('Email verified:', user.emailVerified)
  console.log('Disabled:', user.disabled)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
