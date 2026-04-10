/**
 * Server-side Firebase access — pure HTTP, no native binaries.
 *
 * Previously used firebase-admin which requires gRPC native bindings that
 * crash on Vercel's serverless runtime ("Failed to load external module").
 *
 * Now uses:
 *   - firestoreDb  → Firestore REST API (this file)
 *   - Firebase Storage REST API (see upload route)
 *   - jose + Google JWKS for auth token verification (unchanged)
 *
 * All callers that previously used `adminDb` now use the same `adminDb`
 * export name — the interface is compatible.
 */
import 'server-only'
import { firestoreDb } from './firestore-rest'

export const adminDb = firestoreDb
// adminAuth is no longer needed — auth uses jose + JWKS + ADMIN_EMAILS env var
export const adminAuth = null
// adminApp is no longer needed — Storage uses REST API (see upload route)
export const adminApp = null
