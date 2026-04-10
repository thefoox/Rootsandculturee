---
status: awaiting_human_verify
trigger: "admin-bookings-empty: Admin panel at /admin/bookinger shows 'Ingen bookinger enda' despite bookings existing in Firestore (visible on customer profile page)"
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED — Two compounding bugs:
  1. PRIMARY: Stripe webhook creates bookings but never calls revalidateTag('bookings'), so the unstable_cache wrapping getBookings() is never invalidated after new bookings are created. Result: stale (empty) cache is served to admin.
  2. SECONDARY: If admin page was ever visited before any bookings existed, the cache was populated with [] and stays that way permanently (until cancelBooking is called, which is the only current invalidation point).
test: N/A — confirmed by code inspection
expecting: Fix = add revalidateTag('bookings') call in Stripe webhook after creating bookings + remove unstable_cache from getBookings (admin always needs fresh data)
next_action: Apply fix to webhook and optionally remove/bypass cache for admin queries

## Symptoms

expected: Admin bookings page lists all bookings from Firestore, including booking "Dette er et produkt" dated 17. april 2026, status Bekreftet, code 29E1C2A3
actual: Admin bookings page shows "Ingen bookinger enda" — empty state
errors: No visible errors, just empty state
reproduction: Visit /admin/bookinger → empty. Visit /konto/bookinger as customer → booking visible.
started: Unknown — possibly since the first booking was created

## Eliminated

- hypothesis: Collection name mismatch — both admin and customer queries use adminDb.collection('bookings')
  evidence: Checked webhook (writes to 'bookings'), getBookings (reads from 'bookings'), getBookingsByUser (reads from 'bookings') — all same collection
  timestamp: 2026-04-10

- hypothesis: Session role check failure — user doesn't have admin role in session
  evidence: Admin layout (src/app/admin/layout.tsx) redirects to '/' if session.role !== 'admin'. User CAN see the /admin/bookinger page and empty state — so role IS admin.
  timestamp: 2026-04-10

- hypothesis: Firestore REST API credentials failure
  evidence: Customer page works via same adminDb — if credentials were broken, both would fail
  timestamp: 2026-04-10

## Evidence

- timestamp: 2026-04-10
  checked: src/lib/data/bookings.ts — getBookings function
  found: getBookings() is wrapped in unstable_cache with key ['bookings'] and tag 'bookings'. It queries adminDb.collection('bookings').orderBy('createdAt', 'desc').limit(100).get()
  implication: The result is cached. If the cache was populated when the collection was empty (or if Firestore threw an error on first query), it returns [] on subsequent calls.

- timestamp: 2026-04-10
  checked: src/app/api/webhooks/stripe/route.ts — booking creation
  found: Webhook creates bookings via tx.set(bookingDocRef, {...}) inside runTransaction. NO revalidateTag('bookings') call anywhere in the webhook.
  implication: Cache is never invalidated when new bookings are created. Only cancelBooking() in src/actions/bookings.ts calls revalidateTag('bookings'), which is only triggered by admin cancellation action.

- timestamp: 2026-04-10
  checked: src/actions/bookings.ts — getBookingsFiltered
  found: getBookingsFiltered calls getBookings() (the cached version). cancelBooking calls revalidateTag('bookings') + revalidateTag('experience-dates').
  implication: The ONLY way the bookings cache is invalidated is when an admin cancels a booking — not when one is created.

- timestamp: 2026-04-10
  checked: src/app/konto/bookinger/page.tsx — why customer page works
  found: Customer page calls getBookingsByUser() which is NOT wrapped in unstable_cache. It's a direct Firestore REST query every time. Always fresh.
  implication: This confirms the split: cached admin path vs uncached customer path.

- timestamp: 2026-04-10
  checked: src/app/admin/layout.tsx
  found: Admin layout does verifySession() + redirect if role !== 'admin'. User sees the page, so role IS admin.
  implication: Session role is not the issue.

## Resolution

root_cause: The Stripe webhook creates bookings in Firestore but never calls revalidateTag('bookings'). The getBookings() function used by the admin page is wrapped in unstable_cache — once cached (even as []), it stays cached until invalidation. Since no invalidation occurs after booking creation, the admin always sees the stale cached result. The customer page works because getBookingsByUser() is not cached.

fix: Two changes:
  1. In src/app/api/webhooks/stripe/route.ts: add revalidateTag('bookings') after successfully processing bookingItems (after the for loop). Also need to import revalidateTag from 'next/cache'.
  2. Optionally: remove unstable_cache from getBookings() in src/lib/data/bookings.ts since admin data must always be fresh. The cache was designed to reduce Firestore reads, but stale data is worse than extra reads for an admin page.

verification:
files_changed: [src/app/api/webhooks/stripe/route.ts, src/lib/data/bookings.ts]
