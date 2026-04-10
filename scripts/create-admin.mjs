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
  const EMAIL = 'williamlundflink@gmail.com'

  // Look up existing user
  const user = await auth.getUserByEmail(EMAIL)
  console.log('Found user:', user.uid, user.email)

  // Set admin custom claims
  await auth.setCustomUserClaims(user.uid, { admin: true })
  console.log('Set admin custom claims for', user.uid)

  // Create Firestore user profile
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: EMAIL,
    displayName: user.displayName || '',
    address: '',
    role: 'admin',
    createdAt: new Date(),
  }, { merge: true })
  console.log('Created/updated Firestore user profile')

  // Verify
  const updated = await auth.getUser(user.uid)
  console.log('\n--- Verification ---')
  console.log('UID:', updated.uid)
  console.log('Email:', updated.email)
  console.log('Display name:', updated.displayName)
  console.log('Custom claims:', JSON.stringify(updated.customClaims))
  console.log('Email verified:', updated.emailVerified)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
