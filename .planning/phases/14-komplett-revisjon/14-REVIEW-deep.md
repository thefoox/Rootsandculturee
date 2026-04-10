---
phase: 14-komplett-revisjon
reviewed: 2026-04-08T12:00:00Z
depth: deep
files_reviewed: 14
files_reviewed_list:
  - src/lib/firebase/admin.ts
  - src/lib/firebase/client.ts
  - src/lib/firebase/auth.ts
  - src/lib/session.ts
  - src/actions/auth.ts
  - src/components/auth/LoginForm.tsx
  - src/components/auth/RegisterForm.tsx
  - src/components/auth/GoogleRedirectHandler.tsx
  - src/components/layout/Header.tsx
  - next.config.ts
  - src/lib/data/products.ts
  - src/lib/data/experiences.ts
  - src/lib/data/articles.ts
  - src/lib/data/page-content.ts
findings:
  critical: 5
  warning: 8
  info: 4
  total: 17
status: issues_found
---

# Phase 14: Deep Code Review Report

**Reviewed:** 2026-04-08
**Depth:** deep (cross-file analysis)
**Files Reviewed:** 14 source files + 8 cross-referenced files
**Status:** issues_found

## Summary

Deep review of the authentication system (Firebase Auth -> jose session -> server actions), data layer (Firestore -> unstable_cache -> mock fallback), and deployment configuration (Next.js + Vercel). Cross-file analysis traced the full auth flow from client click through Firebase client SDK, to server action, to session cookie creation, and the full data flow from Firestore through cache to page render.

Key concerns:
1. **Dead middleware code** -- `src/proxy.ts` is NOT wired as Next.js middleware (no `middleware.ts` file exists). Route protection relies solely on layout-level checks, which is functionally correct but misses the middleware layer.
2. **`unstable_cache` key collisions** in `products.ts` -- three different cached functions share the identical cache key `['products']`, which can cause stale/wrong data to be served.
3. **Missing error handling** in `page-content.ts` -- two public functions lack try/catch, meaning Firestore errors will crash page renders.
4. **Google redirect auth flow** -- `signInWithRedirect` was deprecated in Firebase JS SDK v10+ in favor of `signInWithPopup` or `signInWithRedirect` with explicit `browserPopupRedirectResolver`. The current implementation may silently fail on certain browsers.
5. **Firebase Admin `cert()` on Vercel** -- the known `DECODER routines::unsupported` error; current code uses `preferRest: true` but `cert()` itself is the failure point. Alternative: use `GOOGLE_APPLICATION_CREDENTIALS` JSON env var or `applicationDefault()`.

## Critical Issues

### CR-01: `unstable_cache` Key Collision Causes Wrong Data for Product Queries

**File:** `src/lib/data/products.ts:32-92`
**Issue:** Three separate cached functions -- `_getProducts`, `_getProductsByCategory`, and `_getProductBySlug` -- all use the identical cache key `['products']`. While `unstable_cache` appends function arguments to the key, `_getProducts()` takes no arguments and `_getProductsByCategory(category)` takes a category string. If Next.js cache implementation deduplicates based on the static key portion alone (which varies by version), calling `getProducts()` could return a cached result from `getProductsByCategory('drikke')` or vice versa. This is a data correctness bug that would show wrong products to users.

Additionally, `_getArticleBySlug` shares key `['articles']` with `_getArticles` (articles.ts:37,62) and `_getExperienceBySlug` shares key `['experiences']` with `_getExperiences` (experiences.ts:54,79).

**Fix:**
```typescript
// products.ts - Use unique static keys for each function
const _getProducts = unstable_cache(
  async (): Promise<Product[]> => { /* ... */ },
  ['products-all'],
  { revalidate: 3600, tags: ['products'] }
)

const _getProductsByCategory = unstable_cache(
  async (category: ProductCategory): Promise<Product[]> => { /* ... */ },
  ['products-by-category'],
  { revalidate: 3600, tags: ['products'] }
)

const _getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => { /* ... */ },
  ['products-by-slug'],
  { revalidate: 3600, tags: ['products'] }
)

// Same pattern for articles.ts and experiences.ts:
// ['articles-all'], ['articles-by-slug']
// ['experiences-all'], ['experiences-by-slug'], ['experience-dates']
```

### CR-02: Missing Error Handling in `getPageContentBySlug` and `getNavigationPages` Will Crash Page Renders

**File:** `src/lib/data/page-content.ts:83-109`
**Issue:** Every other public data fetcher in the codebase wraps the cached function call in try/catch with a mock fallback. Two functions in `page-content.ts` do NOT follow this pattern:

1. `getPageContentBySlug` (line 104-108) -- if `_getPageContentBySlug` throws a Firestore error, it propagates unhandled and crashes the page render (500 error). This function is called for EVERY CMS-driven page (om-oss, kontakt, etc.).
2. `getNavigationPages` (line 83-85) -- the inner cached function has its own try/catch, but if the `unstable_cache` wrapper itself fails (e.g., serialization error), the exception propagates unhandled. The header's `/api/navigation` route would crash.

**Fix:**
```typescript
export async function getPageContentBySlug(slug: string): Promise<PageContent | null> {
  if (!adminDb) {
    return Array.from(mockPageContent.values()).find((p) => p.slug === slug) ?? null
  }
  try {
    return await _getPageContentBySlug(slug)
  } catch (e) {
    console.warn('getPageContentBySlug failed:', e)
    return Array.from(mockPageContent.values()).find((p) => p.slug === slug) ?? null
  }
}

export async function getNavigationPages(): Promise<PageContent[]> {
  if (!adminDb) return getMockNavigationPages()
  try {
    return await _getNavigationPages()
  } catch (e) {
    console.warn('getNavigationPages failed:', e)
    return getMockNavigationPages()
  }
}
```

### CR-03: `proxy.ts` Is Dead Code -- Middleware Route Protection Is Not Active

**File:** `src/proxy.ts:1-51`
**Issue:** `src/proxy.ts` contains a fully implemented Next.js middleware function with admin/konto route guards and a `config.matcher`, but the file is named `proxy.ts` instead of `middleware.ts`. Next.js only recognizes `middleware.ts` (or `middleware.js`) at the project root or `src/` directory. Since no `middleware.ts` file exists anywhere in the project, this middleware is completely dead code -- it never executes.

Route protection DOES work via server-side layout checks (`src/app/admin/layout.tsx` and `src/app/konto/layout.tsx` both call `verifySession()` and redirect). However, without middleware:
- API routes under `/admin/` or `/konto/` paths (if any exist) are unprotected at the edge
- There's no early rejection before rendering begins (layout checks happen during RSC render)
- The module-level `throw new Error('SESSION_SECRET...')` at line 6-8 would crash if this file were ever imported

Additionally, `proxy.ts` has a module-level throw (`if (!secretKey) throw new Error(...)` at line 6-8) that would crash the Edge Runtime on cold start if `SESSION_SECRET` is missing, unlike `session.ts` which defers the check to function call time.

**Fix:** Either rename `proxy.ts` to `middleware.ts` (and fix the module-level throw to be a lazy check), or delete it as dead code since layout-level protection covers the current routes.

### CR-04: Firebase Admin SDK `cert()` Fails on Vercel Due to Node.js Crypto Incompatibility

**File:** `src/lib/firebase/admin.ts:18-29`
**Issue:** The known `DECODER routines::unsupported` error occurs because `firebase-admin` v13's `cert()` function uses Node.js `crypto` module to parse the PEM private key, and Vercel's serverless runtime may use a BoringSSL-backed version that cannot parse PKCS#1 keys. The current code already uses `preferRest: true` for Firestore (line 35), which avoids gRPC issues, but the `cert()` call at line 20-24 is the actual failure point -- it fails BEFORE Firestore is even initialized.

The `try/catch` at lines 18-29 gracefully falls back to `null`, meaning the entire admin SDK is disabled in production, and ALL Firestore reads fall back to mock data. This means the production site is likely serving hardcoded mock data instead of real CMS content.

**Fix:** Use the `GOOGLE_APPLICATION_CREDENTIALS` approach with a JSON service account file, or parse the key manually:
```typescript
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app'

function getApp() {
  if (getApps().length > 0) return getApps()[0]

  // Option A: Use GOOGLE_APPLICATION_CREDENTIALS (set to JSON string on Vercel)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson)
      return initializeApp({ credential: cert(serviceAccount) })
    } catch (error) {
      console.warn('Firebase Admin: Failed to parse service account JSON.', error)
      return null
    }
  }

  // Option B: Fallback to individual env vars with key format fix
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin: Missing credentials.')
    return null
  }

  try {
    // Convert PKCS#1 to PKCS#8 if needed, or ensure the key is in PKCS#8 format
    const formattedKey = privateKey.replace(/\\n/g, '\n')
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: formattedKey }),
    })
  } catch (error) {
    console.warn('Firebase Admin: Failed to initialize.', error)
    return null
  }
}
```

### CR-05: `signInWithRedirect` Deprecated in Firebase JS SDK v10+ -- Google Login May Silently Fail

**File:** `src/lib/firebase/auth.ts:8,27`
**Issue:** Firebase JS SDK v10+ (the project uses v12.11.0) deprecated `signInWithRedirect` in favor of explicit resolver imports. The function may silently fail or throw on certain browsers (especially Safari with ITP, and Chrome with third-party cookie restrictions) because the redirect flow requires cross-origin storage access that modern browsers increasingly block.

The `GoogleRedirectHandler` component (line 16 in GoogleRedirectHandler.tsx) calls `getRedirectResult()` on every page load. If the redirect flow fails silently (returns `null`), the user sees no error -- they just land back on the page without being logged in, with no feedback.

**Fix:** Switch to `signInWithPopup` which is more reliable in modern browsers, or use the explicit `browserPopupRedirectResolver`:
```typescript
import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase er ikke konfigurert.')
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const idToken = await result.user.getIdToken(true)
  return { idToken, uid: result.user.uid, email: result.user.email, displayName: result.user.displayName }
}
```
This eliminates the need for `GoogleRedirectHandler` entirely and provides immediate feedback on success/failure.

## Warnings

### WR-01: `_getPageContent` Cached Function Falls Back to Mock Data Inside Cache -- Stale Mock Data Gets Cached

**File:** `src/lib/data/page-content.ts:36-40`
**Issue:** Inside the `_getPageContent` cached function (line 37-39), if the Firestore document doesn't exist, it falls back to `mockPageContent.get(pageId)`. This mock fallback result gets cached by `unstable_cache` for 3600 seconds. If a real document is later created in Firestore, users will see mock data for up to an hour.

The same pattern appears in `_getNavigationPages` (line 73) and `_getPageContentBySlug` (line 96).

**Fix:** Return `null` from the cached function when the document doesn't exist. Let the public wrapper handle the mock fallback:
```typescript
const _getPageContent = unstable_cache(
  async (pageId: string): Promise<PageContent | null> => {
    const doc = await adminDb!.collection('pageContent').doc(pageId).get()
    if (!doc.exists) return null  // Don't cache mock data
    return mapPageContent(doc)
  },
  ['page-content'],
  { revalidate: 3600, tags: ['page-content'] }
)

export async function getPageContent(pageId: string): Promise<PageContent | null> {
  if (!adminDb) return mockPageContent.get(pageId) ?? null
  try {
    const result = await _getPageContent(pageId)
    return result ?? mockPageContent.get(pageId) ?? null
  } catch (e) {
    console.warn('getPageContent failed:', e)
    return mockPageContent.get(pageId) ?? null
  }
}
```

### WR-02: `loginAction` Returns Misleading Error Message for Server-Side Failures

**File:** `src/actions/auth.ts:28`
**Issue:** The catch block at line 26-29 returns the error message `'Feil e-post eller passord. Prover du igjen?'` (wrong email/password) for ALL server-side errors, including Firestore connectivity failures, expired ID tokens, or `SESSION_SECRET` not being set. This misleads users into thinking their credentials are wrong when the actual issue is a server configuration problem.

**Fix:**
```typescript
} catch (error) {
  console.error('loginAction failed:', error)
  const errorMessage = error instanceof Error && error.message.includes('SESSION_SECRET')
    ? 'Server er ikke konfigurert. Kontakt administrator.'
    : 'Innlogging feilet. Sjekk internettforbindelsen og prov igjen.'
  return { success: false, error: errorMessage }
}
```

### WR-03: Session Cookie Has No Renewal/Sliding Window -- Users Logged Out After Exactly 7 Days

**File:** `src/lib/session.ts:18-35`
**Issue:** The session cookie is set with a fixed 7-day expiration (line 18) and is never renewed. A user who logs in and uses the site daily for 6 days will be silently logged out on day 7. The `getSession()` function checks `expiresAt` (line 48) but never refreshes the cookie. For an e-commerce site, this means users could lose their authenticated state mid-checkout.

**Fix:** Add session renewal in `getSession()` when the session is past the halfway point:
```typescript
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  if (!cookie?.value) return null

  try {
    const { payload } = await jwtVerify(cookie.value, getEncodedKey(), {
      algorithms: ['HS256'],
    })
    const session = payload as unknown as SessionPayload
    if (session.expiresAt < Date.now()) return null

    // Renew session if past halfway point (3.5 days)
    const halfLife = SESSION_DURATION / 2
    if (session.expiresAt - Date.now() < halfLife) {
      await createSession({ uid: session.uid, email: session.email, role: session.role })
    }

    return session
  } catch {
    return null
  }
}
```

### WR-04: Header Profile Dropdown Has No Click-Outside-to-Close Behavior

**File:** `src/components/layout/Header.tsx:136-165`
**Issue:** The profile dropdown (line 148-165) opens on click but only closes when clicking the profile button again, a menu link, or the logout button. Clicking anywhere else on the page leaves the dropdown open. This is a usability and accessibility issue -- users expect dropdowns to close on outside click, and screen reader users may not realize the dropdown is still open.

**Fix:** Add a click-outside handler:
```typescript
import { useRef, useEffect } from 'react'

// Inside Header component:
const profileRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (!profileOpen) return
  function handleClickOutside(e: MouseEvent) {
    if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
      setProfileOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [profileOpen])

// Wrap the profile button + dropdown in: <div ref={profileRef} className="relative">
```

### WR-05: `getArticleBySlug` Mock Fallback Behavior Inconsistent with Other Fetchers

**File:** `src/lib/data/articles.ts:66-74`
**Issue:** `getArticleBySlug` (line 66-74) falls back to mock data in BOTH development and production when `adminDb` is null. Compare with `getProductBySlug` (products.ts:94-107) and `getExperienceBySlug` (experiences.ts:83-96), which return `null` in production when `adminDb` is null. This inconsistency means:
- Products/experiences show "not found" pages in production without Firebase
- Articles show fake/mock content in production without Firebase

**Fix:** Make `getArticleBySlug` consistent:
```typescript
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!adminDb) {
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    return mockArticles.find((a) => a.slug === slug) ?? null
  }
  // ...
}
```

### WR-06: Missing Content-Security-Policy Header in Production

**File:** `next.config.ts:18-31`
**Issue:** The `headers()` configuration includes X-Frame-Options, X-Content-Type-Options, and other security headers, but is missing `Content-Security-Policy` (CSP). Without CSP, the site is more vulnerable to XSS attacks. Given that the site handles payments (Stripe) and authentication (Firebase), a CSP header is strongly recommended. A previous phase (13) planned to add this but it appears to not be present in the current config.

**Fix:** Add a CSP header to `next.config.ts`:
```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://firebasestorage.googleapis.com https://storage.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://js.stripe.com https://accounts.google.com https://*.firebaseapp.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.stripe.com https://identitytoolkit.googleapis.com",
  ].join('; '),
}
```

### WR-07: `GoogleRedirectHandler` Silently Swallows All Auth Errors

**File:** `src/components/auth/GoogleRedirectHandler.tsx:16-27`
**Issue:** The `getGoogleRedirectResult()` call (line 16) swallows all errors internally (auth.ts line 41: `catch { return null }`). If the Google redirect result contains an error (e.g., user denied permission, account linking conflict), the handler returns `null` and the user sees no feedback. The component also catches errors from `googleLoginAction` (line 23-24) but only logs to console -- the user sees nothing.

After a failed Google login redirect, the user lands back on the homepage with no indication that login failed.

**Fix:** Add user-visible error feedback. Either use a toast notification or set a URL parameter:
```typescript
export function GoogleRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    getGoogleRedirectResult().then(async (result) => {
      if (!result) return
      try {
        const loginResult = await googleLoginAction(result.idToken)
        if (loginResult.success) {
          router.refresh()
          toast.success('Du er logget inn med Google.')
        } else {
          toast.error(loginResult.error || 'Innlogging feilet.')
        }
      } catch (e) {
        console.error('Google redirect login failed:', e)
        toast.error('Innlogging med Google feilet. Prov igjen.')
      }
    })
  }, [router])

  return null
}
```

### WR-08: `getExperienceDates` Caches Relative Date Query -- Stale Results for 60 Seconds

**File:** `src/lib/data/experiences.ts:98-113`
**Issue:** The cached function `_getExperienceDates` creates a `new Date()` (line 100) inside the cached callback and queries `where('date', '>=', now)`. The result is cached for 60 seconds (line 112). This means `now` is captured at cache creation time, and for the next 60 seconds, the "current time" used for filtering is stale. While 60s staleness is minor, the real issue is that the same `experienceId` argument will always return the first cached result for 60 seconds, even though `now` changes every second.

This is mostly harmless with a 60s revalidate, but at the boundary (e.g., a date expires at 15:00:00, user hits cache at 14:59:50 -- cached result includes the date, but at 15:00:30 the cached result still shows the expired date for 30 more seconds).

**Fix:** Consider filtering expired dates client-side after cache retrieval, or accept the 60s window as a trade-off (document the design decision).

## Info

### IN-01: Dead Variable `isHeroPage` in Header Component

**File:** `src/components/layout/Header.tsx:38`
**Issue:** `isHeroPage` is declared on line 38 but never referenced anywhere in the component. Line 40 defines `isTransparent` with its own logic that serves the same purpose. `isHeroPage` is dead code.

**Fix:** Delete line 38.

### IN-02: Dead Code File `src/proxy.ts` Should Be Removed

**File:** `src/proxy.ts:1-51`
**Issue:** As described in CR-03, this file is completely dead code. It exports a `proxy` function and `config` object but nothing imports it, and it is not in the middleware filename convention. It also duplicates session verification logic from `src/lib/session.ts` and has a divergent implementation (module-level throw vs lazy check, hardcoded type vs imported `SessionPayload`).

**Fix:** Delete `src/proxy.ts`. If middleware is desired in the future, create a proper `src/middleware.ts` that imports from `src/lib/session.ts`.

### IN-03: Duplicate Admin Import in `src/actions/auth.ts`

**File:** `src/actions/auth.ts:3-4`
**Issue:** Lines 3 and 4 import from the same module on separate lines:
```typescript
import { adminAuth } from '@/lib/firebase/admin'
import { adminDb } from '@/lib/firebase/admin'
```

**Fix:** Combine into a single import:
```typescript
import { adminAuth, adminDb } from '@/lib/firebase/admin'
```

### IN-04: `Header.tsx` Session Check Via Client-Side Fetch Has No Caching

**File:** `src/components/layout/Header.tsx:42-46`
**Issue:** The Header component fetches `/api/auth/session` on every mount to check login state. This fires on every client-side navigation (since Header is in the root layout and re-mounts aren't triggered, this is actually just once per full page load). However, there's no SWR/cache mechanism, so the auth state can be briefly stale after login/logout until the next full page load. The `handleLoginSuccess` callback manually sets `setIsLoggedIn(true)`, but the navigation fetch at line 50-58 has no similar manual override.

**Fix:** This is acceptable for the current architecture but could be improved with a lightweight auth context that shares state between the GoogleRedirectHandler and Header.

---

_Reviewed: 2026-04-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
