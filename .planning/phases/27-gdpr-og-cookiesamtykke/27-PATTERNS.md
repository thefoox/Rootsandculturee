# Phase 27: GDPR og cookiesamtykke — Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 6 new/modified files
**Analogs found:** 5 / 6 (1 is a pure library wrapper with no direct codebase analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/layout/CookieBanner.tsx` | component (replace) | event-driven | `src/components/layout/CookieBanner.tsx` (current) | self — different implementation |
| `src/app/(public)/personvern/page.tsx` | page (rewrite) | request-response | `src/app/(public)/personvern/page.tsx` (current) | self — structural extension |
| `src/app/(public)/informasjonskapsler/page.tsx` | page (new) | request-response | `src/app/(public)/personvern/page.tsx` | role-match (static content page) |
| `src/app/(public)/konto/profil/page.tsx` | page (modify) | request-response | `src/app/konto/profil/page.tsx` (current) | self — additive UI |
| `src/actions/account.ts` | server action (new) | CRUD + batch | `src/actions/profile.ts` | role-match (same server action file pattern) |
| `src/lib/navigation.ts` | utility (modify) | — | `src/lib/navigation.ts` (current) | self — data-only change |

---

## Pattern Assignments

### `src/components/layout/CookieBanner.tsx` (component, event-driven)

**Analog:** `src/components/layout/CookieBanner.tsx` (current implementation — full replacement)

**Existing component structure** (lines 1–52) — note the `'use client'` + `useEffect` mount pattern to keep:
```typescript
'use client'

import { useState, useEffect } from 'react'
```

**Key constraint from current code:** The component returns `null` when consent exists (line 24: `if (!visible) return null`). The new vanilla-cookieconsent wrapper ALSO returns `null` from render — all DOM work happens via the library after mount.

**Current localStorage key to clean up** (line 11):
```typescript
const consent = localStorage.getItem('cookie-consent')
```
Replace with: `localStorage.removeItem('cookie-consent')` in the new `useEffect` before calling `CookieConsent.run()`.

**New imports pattern** — replaces all current imports:
```typescript
'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
```

**New core pattern** — `useEffect` with no deps array (runs once on mount, returns null from render):
```typescript
export function CookieBanner() {
  useEffect(() => {
    localStorage.removeItem('cookie-consent') // clean up legacy flag
    CookieConsent.run({ /* config */ })
  }, [])

  return null
}
```

**Mount location** — already mounted in `src/app/layout.tsx` lines 8 + 41:
```typescript
import { CookieBanner } from '@/components/layout/CookieBanner'
// ...
<CookieBanner />   // placed after <Footer />, before <Toaster />
```
No layout.tsx changes needed — the named export `CookieBanner` is preserved.

**No analog found for vanilla-cookieconsent config** — use RESEARCH.md Pattern 1 directly (the full `CookieConsent.run()` config block with Norwegian translations).

---

### `src/app/(public)/personvern/page.tsx` (page, request-response — rewrite)

**Analog:** `src/app/(public)/personvern/page.tsx` (current)

**Metadata pattern** (lines 1–7) — preserve this exact shape:
```typescript
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Personvernerklæring — Roots & Culture',
  description: 'Les om hvordan Roots & Culture behandler dine personopplysninger.',
}
```

**Page component shell** (lines 9–12) — preserve wrapper div and Breadcrumbs:
```typescript
export default function PersonvernPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-24 md:px-8">
      <Breadcrumbs items={[{ label: 'Personvern' }]} />
      <h1 className="mt-4 font-heading text-h1 font-bold text-forest">Personvernerklæring</h1>
      <p className="mt-2 text-label text-body">Sist oppdatert: april 2026</p>
```

**Section pattern** (lines 16–21) — each GDPR Art. 13 section uses this shape:
```tsx
<section>
  <h2 className="font-heading text-h4 font-bold text-forest">1. Behandlingsansvarlig</h2>
  <p className="mt-3">...</p>
</section>
```

**List pattern** (lines 25–31):
```tsx
<ul className="mt-2 list-disc space-y-1 pl-6">
  <li>...</li>
</ul>
```

**Content scaffold** — 9 new sections required per RESEARCH.md (Art. 13 checklist):
1. Behandlingsansvarlig
2. Personvernombud
3. Formål og rettslig grunnlag (with sub-items per activity)
4. Mottakere og databehandlere (Firebase, Stripe, Vercel, Resend with DPA links)
5. Overføring til tredjeland (EU-US DPF + SCCs)
6. Lagringstider per kategori
7. Dine rettigheter (Art. 15–22) — link to `/konto/profil` for self-service
8. Klagerett til Datatilsynet
9. Automatiserte avgjørelser (state: ingen)

---

### `src/app/(public)/informasjonskapsler/page.tsx` (page, request-response — new)

**Analog:** `src/app/(public)/personvern/page.tsx`

**Imports pattern** — same as personvern analog (lines 1–2):
```typescript
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
```

**Metadata pattern** — adapt title/description:
```typescript
export const metadata: Metadata = {
  title: 'Informasjonskapsler — Roots & Culture',
  description: 'Oversikt over informasjonskapsler og lagringsteknologi brukt på rootsculture.no.',
}
```

**Page wrapper pattern** — identical to personvern (copy lines 9–12):
```typescript
export default function InformasjonskapslerPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-24 md:px-8">
      <Breadcrumbs items={[{ label: 'Informasjonskapsler' }]} />
      <h1 className="mt-4 font-heading text-h1 font-bold text-forest">Informasjonskapsler</h1>
```

**Cookie inventory table** — new pattern, no codebase analog. Use semantic `<table>` with Tailwind utility classes consistent with the site's existing table usage in admin pages. The cookie table must list all 4 entries from RESEARCH.md Cookie Inventory:

| Name | Type | Category | Varighet | Formål | Satt av |
|---|---|---|---|---|---|
| `__session` | HTTP-informasjonskapsel | Nødvendig | 7 dager | Sesjonshåndtering | rootsculture.no |
| `roots-cart` | localStorage | Nødvendig | Til den slettes | Handlekurv | rootsculture.no |
| `cc_cookie` | Informasjonskapsel | — | 182 dager | Samtykkevalg | rootsculture.no |
| `cookie-consent` | localStorage | — | Fjernes ved besøk | Eldre samtykkeflagg (fjernes) | rootsculture.no |

**"Administrer samtykke" button** — after the table, add a button to reopen the vanilla-cookieconsent preferences modal:
```typescript
// Client component sub-component or inline 'use client' if needed:
// CookieConsent.showPreferences() — from 'vanilla-cookieconsent'
```

---

### `src/app/konto/profil/page.tsx` (page, request-response — modify)

**Analog:** `src/app/konto/profil/page.tsx` (current — additive changes only)

**Current auth guard pattern** (lines 1–10) — preserve exactly:
```typescript
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'

export default async function ProfilPage() {
  const session = await verifySession()
  if (!session) {
    redirect('/')
  }
```

**Current content structure** (lines 20–36) — preserve existing sections, add new section after `<PasswordChangeForm />`:
```tsx
<hr className="border-forest/12" />

{/* NEW: Data section for Art. 15 + Art. 17 */}
<section aria-labelledby="data-heading">
  <h3 id="data-heading" className="font-heading text-h4 font-bold text-forest mb-4">
    Mine data
  </h3>
  {/* DataExportButton + DeleteAccountSection Client Components */}
</section>
```

**Pattern for client interactive sections** — analogy from `src/components/konto/ProfileForm.tsx` lines 19–26:
```typescript
'use client'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
```

**Confirmation pattern for destructive action** — no existing dialog/modal in codebase. Use `useState` + inline conditional render (native browser-style confirmation section, no modal library). Show a confirmation div with two buttons after the user clicks "Slett konto":
```typescript
const [confirming, setConfirming] = useState(false)

// Render:
{confirming ? (
  <div role="alert" className="rounded-xl border border-rust/30 bg-rust/5 p-4 space-y-3">
    <p>Er du sikker? Kontoen kan ikke gjenopprettes.</p>
    <div className="flex gap-3">
      <Button variant="secondary" onClick={() => setConfirming(false)}>Avbryt</Button>
      <form action={deleteAction}>
        <Button type="submit" className="bg-rust text-cream" loading={isPending}>
          Bekreft sletting
        </Button>
      </form>
    </div>
  </div>
) : (
  <Button variant="secondary" onClick={() => setConfirming(true)}>Slett konto</Button>
)}
```

**Button import** — from `src/components/ui/Button.tsx` (variant system: `'primary' | 'secondary' | 'ghost'`).

---

### `src/actions/account.ts` (server action, CRUD + batch — new)

**Analog:** `src/actions/profile.ts` (same directory, same 'use server' + verifySession + adminDb pattern)

**Imports pattern** — based on profile.ts lines 1–3 + orders.ts line 3:
```typescript
'use server'

import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
```

**Auth guard pattern** (profile.ts lines 28–31) — copy exactly, adapt return type:
```typescript
export async function exportUserData(): Promise<object> {
  const session = await verifySession()
  if (!session) throw new Error('Ikke pålogget')
  const uid = session.uid
  // ...
}

export async function deleteUserAccount(): Promise<void> {
  const session = await verifySession()
  if (!session) redirect('/')
  const uid = session.uid
  // ...
}
```

**Batch write pattern** — from `src/lib/firebase/firestore-rest.ts` `WriteBatch` class (lines 430–449). The `adminDb.batch()` API:
```typescript
const batch = adminDb.batch()

// For each doc in a query snapshot:
for (const doc of ordersSnap.docs) {
  batch.update(doc.ref, { customerId: null, customerEmail: '[slettet]' })
}
await batch.commit()
```

**Multi-collection query pattern** — from `src/actions/orders.ts` lines 31–41:
```typescript
const snapshot = await adminDb
  .collection('orders')
  .where('customerId', '==', uid)
  .get()
```

**Parallel fetch pattern** — from `src/actions/orders.ts` lines 234–237 (`Promise.all`):
```typescript
const [userDoc, ordersSnap, bookingsSnap] = await Promise.all([
  adminDb.collection('users').doc(uid).get(),
  adminDb.collection('orders').where('customerId', '==', uid).get(),
  adminDb.collection('bookings').where('customerId', '==', uid).get(),
])
```

**Delete user doc pattern** — from `src/lib/firebase/firestore-rest.ts` DocRef.delete() (line 322):
```typescript
batch.delete(adminDb.collection('users').doc(uid))
```

**CRITICAL — adminAuth is null in this project:** `src/lib/firebase/admin.ts` line 20:
```typescript
export const adminAuth = null
```
The Firebase Admin Auth SDK (`adminAuth.deleteUser(uid)`) is NOT available — the project uses Firestore REST + jose for auth. The RESEARCH.md pattern that calls `adminAuth.deleteUser(uid)` cannot be used as-is.

**Alternative for Firebase Auth user deletion:** Use the Firebase Auth REST API directly with a service account token (same OAuth2 token mechanism as `firestore-rest.ts`). Endpoint: `DELETE https://identitytoolkit.googleapis.com/v1/projects/{projectId}/accounts/{uid}?key={apiKey}` — OR skip Auth record deletion and rely on session deletion (the user can no longer log in once the Firestore user doc is gone and session is cleared). Confirm approach during implementation.

**Session deletion + redirect pattern** — from `src/actions/auth.ts` lines 75–77:
```typescript
export async function logoutAction(): Promise<void> {
  await deleteSession()
}
// followed by redirect('/') on the caller side
```

**Error handling pattern** — from `src/actions/profile.ts` lines 47–55:
```typescript
try {
  await adminDb.collection('users').doc(session.uid).update({ ... })
  return { success: true }
} catch {
  return { success: false, error: 'Kunne ikke oppdatere profilen. Prøv igjen.' }
}
```

---

### `src/lib/navigation.ts` (utility, data-only — modify)

**Analog:** `src/lib/navigation.ts` (self — single line addition)

**FooterColumn pattern** (lines 76–110) — the `footerColumns` array. Add to the `'Kundeservice'` column's `links` array (line 89–94):
```typescript
{
  title: 'Kundeservice',
  links: [
    { label: 'Kontakt oss', href: '/kontakt' },
    { label: 'Vanlige spørsmål', href: '/kontakt#faq' },
    { label: 'Frakt og retur', href: '/kontakt#frakt' },
    { label: 'Personvern', href: '/personvern' },
    { label: 'Informasjonskapsler', href: '/informasjonskapsler' }, // ADD THIS
    { label: 'Vilkår', href: '/vilkar' },
  ],
},
```

No other changes needed — Footer component already consumes `footerColumns` from this file.

---

## Shared Patterns

### Session verification (apply to all server actions and server pages)
**Source:** `src/lib/dal.ts` lines 1–10 + `src/actions/profile.ts` lines 28–31

```typescript
import { verifySession } from '@/lib/dal'

const session = await verifySession()
if (!session) redirect('/') // for pages
if (!session) return { success: false, error: 'Du er ikke logget inn.' } // for actions returning state
if (!session) throw new Error('Ikke pålogget') // for actions that throw
```

### Norwegian error messages (apply to all actions)
**Source:** `src/actions/profile.ts`, `src/actions/contact.ts`
All user-visible error strings in Norwegian. Pattern: `'Kunne ikke [verb] [noun]. Prøv igjen.'`

### Button component (apply to all interactive UI in profil page)
**Source:** `src/components/ui/Button.tsx` — variants `'primary'`, `'secondary'`, `'ghost'`; prop `loading={boolean}`; `min-h-[44px]` built in (WCAG touch target).

### Tailwind class conventions (apply to all new components)
**Source:** All existing components — use `text-forest` (dark green), `bg-cream`, `bg-card`, `border-forest/12`, `font-heading`, `font-body`, `text-body`, `text-label`. No `tailwind.config.js` — CSS custom properties only.

### `motion-safe:transition-*` (apply to any animated element)
**Source:** `src/components/ui/Button.tsx` line 30, `src/app/konto/layout.tsx` line 24
All CSS transitions must be wrapped: `motion-safe:transition-all motion-safe:duration-150`.

### `useActionState` + `sonner` toast pattern (apply to client forms/buttons)
**Source:** `src/components/konto/ProfileForm.tsx` lines 20–27
```typescript
const [state, formAction, isPending] = useActionState(actionFn, null)

useEffect(() => {
  if (state?.success) toast.success('...')
}, [state])
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/components/layout/CookieBanner.tsx` (vanilla-cookieconsent config) | component | event-driven | No library wrapper components exist in codebase. No consent management patterns. Use RESEARCH.md Pattern 1 directly. |
| `src/app/(public)/informasjonskapsler/page.tsx` (cookie table) | page section | — | No HTML tables in public-facing pages. Admin pages have table patterns but with different styling context. Use `<table>` with Tailwind utilities, `<thead>/<tbody>/<th>/<td>` for WCAG compliance. |
| Firebase Auth user deletion in `src/actions/account.ts` | server action | — | `adminAuth` is `null` in this project (firebase-admin not installed on Vercel). Must use Firebase Auth REST API or omit Auth record deletion. Confirm approach during Wave 0 implementation. |

---

## Metadata

**Analog search scope:** `src/components/`, `src/app/`, `src/actions/`, `src/lib/`
**Files scanned:** 62 TypeScript/TSX source files
**Pattern extraction date:** 2026-04-16
