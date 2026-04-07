# Phase 06 Code Review

**Scope:** Specified files (config-driven review)
**Files reviewed:** 6

---

## Code Review Results

**Scope:** Explicit file list from review config — 6 files covering the upload route rewrite, Firebase Admin init, global error boundary, and the three admin create-form pages.
**Files reviewed:** 6

---

### Critical (auto-fixed)

| # | File | Issue | Confidence | Fix Applied |
|---|------|-------|-----------|-------------|
| 1 | `src/app/admin/opplevelser/ny/page.tsx:252` | Norwegian typo: label reads "Hva du ma ta med" — missing "å". Visible to admin users on every experience creation form. | 92 | Replaced `ma` with `må`. |

---

### Important

| # | File | Issue | Confidence | Suggested Fix |
|---|------|-------|-----------|---------------|
| 1 | `src/app/admin/produkter/ny/page.tsx:66`<br>`src/app/admin/opplevelser/ny/page.tsx:78`<br>`src/app/admin/artikler/ny/page.tsx:64` | `requestAnimationFrame` is used to defer the scroll-to-first-error query, but `requestAnimationFrame` fires before the browser has painted the new React state. React batches state updates and flushes them asynchronously; a `requestAnimationFrame` fired immediately after `setErrors()` may execute before the DOM reflects the new `[role="alert"]` elements, causing `querySelector('[role="alert"]')` to return `null`. A `useEffect` keyed on `errors` (or `setTimeout(fn, 0)`) is more reliable because it runs after the render cycle commits to the DOM. | 75 | Replace the inline `requestAnimationFrame` block in `submitForm` with a `useEffect` that watches `errors` and scrolls when a new error appears. Example: `useEffect(() => { if (Object.keys(errors).length > 0) { const el = document.querySelector('[role="alert"]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, [errors])` |
| 2 | `src/app/api/upload/route.ts:28–29` | File MIME type is not validated — only the file extension is checked. An attacker who controls the filename can upload a `.jpg`-named binary with a non-image `Content-Type`. The `file.type` value is provided by the client and is equally untrusted, but reading the first few bytes of `buffer` to check magic bytes (or at minimum rejecting non-image `file.type` values) would harden the check. | 65 | After constructing `buffer`, add: `const allowedMimes = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']; if (!allowedMimes.includes(file.type)) return NextResponse.json({ error: 'Filtype ikke tillatt.' }, { status: 400 })` |
| 3 | `src/app/admin/artikler/ny/page.tsx:165–173` | The meta title `Input` field has no error display. All other fields on this page and on the product/experience forms render a `<FormError>` when `errors.<field>` is set. If the server action returns `errors.metaTitle`, it is silently swallowed — the admin user gets no feedback. | 80 | Add `error={errors.metaTitle}` prop to the meta title `Input` component at line 165, mirroring the pattern on every other `Input` in the form. |
| 4 | `src/app/api/upload/route.ts:51` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is a client-exposed environment variable being read server-side to configure a privileged storage operation. It works in practice, but it couples a public client config key to a server authentication path. A dedicated server-side `FIREBASE_STORAGE_BUCKET` variable (no `NEXT_PUBLIC_` prefix) would follow the project's own convention of keeping server config in server-only vars. | 55 | Add `FIREBASE_STORAGE_BUCKET=` to `.env.local.example`, set it in Vercel, and update `route.ts` line 51 to `process.env.FIREBASE_STORAGE_BUCKET`. |

---

### Minor

| # | File | Issue | Confidence |
|---|------|-------|-----------|
| 1 | `src/lib/firebase/admin.ts:21–30` | `initializeApp` does not include `storageBucket` in the credential config. The upload route compensates correctly via the explicit `.bucket(bucketName)` call, so this does not cause a bug today. However, any future code that calls `getStorage(adminApp).bucket()` without a name will fail with a runtime error rather than a helpful message. Adding `storageBucket: process.env.FIREBASE_STORAGE_BUCKET` to the `initializeApp` call would make the default bucket unambiguous and reduce future footgun risk. | 55 |

---

**Summary:** 1 critical (1 auto-fixed), 4 important, 1 minor

---

## Auto-fix Log

### Fix 1 — Norwegian typo in opplevelser/ny/page.tsx

- **File:** `src/app/admin/opplevelser/ny/page.tsx`
- **Line:** 252
- **Change:** `Hva du ma ta med` → `Hva du må ta med`
- **TypeScript check:** Passed (`npx tsc --noEmit` — no errors)
