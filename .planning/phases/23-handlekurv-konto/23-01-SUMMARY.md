---
phase: 23-handlekurv-konto
plan: 01
subsystem: ui
tags: [firestore, server-action, cart, accessibility, wcag, sonner]

# Dependency graph
requires:
  - phase: 22-ecommerce-robusthet
    provides: checkout.ts validation pattern (products/experiences/giftcards against Firestore)
provides:
  - validateCartItems server action with Norwegian error reasons
  - MAX_PRODUCT_QUANTITY=99 constant shared across cart UI and logic
  - Stale/deleted/inactive item removal on handlekurv page mount with toast feedback
  - Increment button disabled at quantity 99 with correct aria-label "Øk antall"
affects: [24-auth-produktsider, checkout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Action for cart validation: validateCartItems in src/actions/cart.ts mirrors checkout.ts pattern"
    - "hasValidated ref pattern: prevents infinite re-validation loops when items change"
    - "Depend on [mounted] not [items] in validation useEffect to avoid removal-triggered re-runs"
    - "DoS guard: early return if items.length > 50 per T-23-02 threat mitigation"

key-files:
  created:
    - src/actions/cart.ts
  modified:
    - src/components/cart/CartItem.tsx
    - src/components/cart/CartProvider.tsx
    - src/app/(public)/handlekurv/page.tsx

key-decisions:
  - "Use MAX_PRODUCT_QUANTITY=99 as sanity cap (not stock-aware) — stock checked authoritatively at checkout"
  - "useEffect depends on [mounted] not [items] — prevents infinite loop when removeItem changes items array"
  - "DoS guard at 50 items (not 99) to bound Firestore reads per validation call (T-23-02)"
  - "Validation failure is non-blocking — catch silently, checkout catches remaining issues"

patterns-established:
  - "Cart validation pattern: server action called once on mount via hasValidated ref + mounted guard"

requirements-completed: [HK-01, HK-02, HK-04]

# Metrics
duration: 20min
completed: 2026-04-10
---

# Phase 23 Plan 01: Handlekurv Stale Item Validation Summary

**Server action validateCartItems removes stale/deleted/inactive products and experiences from cart on handlekurv page load, with Norwegian toast messages and quantity capped at 99 with fixed aria-label**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-10T00:00:00Z
- **Completed:** 2026-04-10T00:20:00Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- Created `src/actions/cart.ts` with `validateCartItems` server action — validates products (existence, publishedAt, variant), experiences (existence, date, isActive, availableSeats), passes gift cards through; returns `{ valid, removed }` with Norwegian reasons
- Integrated validation into handlekurv page: fires once after cart loads from localStorage, removes stale items via `removeItem`, shows `toast.error(reason, { description: name })` for each
- Capped quantity stepper at 99 in both CartItem (disabled button) and CartProvider (ceiling in updateQuantity); fixed accessibility typo: `"Ok antall"` -> `"Øk antall"`

## Task Commits

Each task was committed atomically:

1. **Task 1: validateCartItems server action + max quantity constant** - `414edfb` (feat)
2. **Task 2: Integrate cart validation on handlekurv page mount** - `87a7483` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `src/actions/cart.ts` — New server action: `validateCartItems`, `MAX_PRODUCT_QUANTITY=99`, `CartValidationResult` interface
- `src/components/cart/CartItem.tsx` — Import MAX_PRODUCT_QUANTITY, increment button disabled at qty>=99, aria-label fixed to "Øk antall"
- `src/components/cart/CartProvider.tsx` — Import MAX_PRODUCT_QUANTITY, updateQuantity rejects qty > 99
- `src/app/(public)/handlekurv/page.tsx` — useEffect calls validateCartItems once on mount, removes stale items with toast

## Decisions Made
- MAX_PRODUCT_QUANTITY=99 as practical sanity cap (not stock-aware) — authoritative stock check stays at checkout
- useEffect depends on `[mounted]` not `[items]` to avoid infinite loop when item removal changes the items array
- DoS guard: early return if items.length > 50 (T-23-02 threat model mitigation)
- Validation failure is caught silently — non-blocking, checkout validates authoritatively

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] DoS guard for excessive Firestore reads (T-23-02)**
- **Found during:** Task 1 (validateCartItems creation)
- **Issue:** Threat model assigned `mitigate` disposition to T-23-02 (DoS via large cart batch reads), but the plan action text didn't include an explicit implementation
- **Fix:** Added early return `if (items.length > 50) return { valid: items, removed: [] }` before Firestore reads
- **Files modified:** src/actions/cart.ts
- **Verification:** TypeScript compiles clean; logic is a simple guard before the for-loop
- **Committed in:** 414edfb (Task 1 commit)

**2. [Rule 2 - Missing Critical] adminDb null guard**
- **Found during:** Task 1 (validateCartItems creation)
- **Issue:** adminDb is `null` during static generation (build-time), calling `.collection()` on null would throw
- **Fix:** Added early return `if (!adminDb) return { valid: items, removed: [] }` before any Firestore access
- **Files modified:** src/actions/cart.ts
- **Verification:** TypeScript compiles clean; mirrors pattern in checkout.ts
- **Committed in:** 414edfb (Task 1 commit)

**3. [Rule - Approach] useEffect dependency array: [mounted] instead of [items, removeItem]**
- **Found during:** Task 2 (handlekurv page integration)
- **Issue:** Plan specified `[items, removeItem]` as dependency array, but research doc (Pitfall 1) explicitly warns this causes infinite re-validation loops when items change due to removal
- **Fix:** Used `[mounted]` with `// eslint-disable-line react-hooks/exhaustive-deps` comment; `hasValidated` ref ensures single execution
- **Files modified:** src/app/(public)/handlekurv/page.tsx
- **Verification:** Logic correct per research doc analysis — no loop possible
- **Committed in:** 87a7483 (Task 2 commit)

---

**Total deviations:** 3 (2 auto-fixed Rule 2 security/correctness, 1 approach correction from research doc)
**Impact on plan:** All corrections necessary for correctness and security. No scope creep.

## Issues Encountered
- Initial edits were made to the main repo instead of the worktree — detected immediately, changes copied to worktree, main repo restored to HEAD before any commits

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cart validation is live on handlekurv page; stale items are removed before user reaches checkout
- Plan 23-02 (konto error boundaries) can proceed independently
- Checkout still performs authoritative validation — this is a UX improvement only, not a security bypass

## Self-Check: PASSED
- FOUND: src/actions/cart.ts
- FOUND: src/components/cart/CartItem.tsx
- FOUND: src/components/cart/CartProvider.tsx
- FOUND: src/app/(public)/handlekurv/page.tsx
- FOUND: commit 414edfb (feat(23-01): add validateCartItems server action + max quantity cap)
- FOUND: commit 87a7483 (feat(23-01): integrate cart validation on handlekurv page mount)

---
*Phase: 23-handlekurv-konto*
*Completed: 2026-04-10*
