/**
 * Diagnostic endpoint — verifies Firestore REST API connectivity.
 *
 * ONLY accessible when DEBUG_FIRESTORE_KEY env var matches the request header.
 * Remove or disable this route after diagnosing production issues.
 *
 * Usage:
 *   curl -H "x-debug-key: YOUR_DEBUG_FIRESTORE_KEY" https://your-app.vercel.app/api/debug-firestore
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function GET(request: NextRequest) {
  const debugKey = process.env.DEBUG_FIRESTORE_KEY
  if (!debugKey) {
    return NextResponse.json({ error: 'Debug endpoint not enabled. Set DEBUG_FIRESTORE_KEY env var.' }, { status: 403 })
  }

  const provided = request.headers.get('x-debug-key')
  if (provided !== debugKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const results: Record<string, unknown> = {}

  // 1. Check env vars are present (don't log full values)
  results.envVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? `set (${process.env.FIREBASE_PROJECT_ID})` : 'MISSING',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
      ? `set (${process.env.FIREBASE_CLIENT_EMAIL})`
      : 'MISSING',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      ? `set (length=${process.env.FIREBASE_PRIVATE_KEY.length}, starts="${process.env.FIREBASE_PRIVATE_KEY.slice(0, 27)}")`
      : 'MISSING',
  }

  // 2. Try to read from products collection (simple get, no query)
  try {
    const snapshot = await adminDb.collection('products').limit(1).get()
    results.productsQuery = {
      ok: true,
      docsReturned: snapshot.size,
      empty: snapshot.empty,
      firstDocId: snapshot.docs[0]?.id ?? null,
    }
  } catch (e) {
    results.productsQuery = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }

  // 3. Try to read published products (the actual query used by the public page)
  try {
    const snapshot = await adminDb
      .collection('products')
      .where('publishedAt', '!=', null)
      .orderBy('publishedAt', 'desc')
      .get()
    results.publishedProductsQuery = {
      ok: true,
      docsReturned: snapshot.size,
      empty: snapshot.empty,
    }
  } catch (e) {
    results.publishedProductsQuery = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }

  // 4. Try to read from experiences collection
  try {
    const snapshot = await adminDb
      .collection('experiences')
      .where('publishedAt', '!=', null)
      .orderBy('publishedAt', 'desc')
      .get()
    results.publishedExperiencesQuery = {
      ok: true,
      docsReturned: snapshot.size,
      empty: snapshot.empty,
    }
  } catch (e) {
    results.publishedExperiencesQuery = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }

  return NextResponse.json(results)
}
