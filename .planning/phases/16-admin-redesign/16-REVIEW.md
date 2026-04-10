---
phase: 16-admin-redesign
reviewed: 2026-04-10T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/components/admin/AdminShell.tsx
  - src/components/admin/AdminSidebar.tsx
  - src/components/admin/AdminTopBar.tsx
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 16: Code Review Report

**Reviewed:** 2026-04-10
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed three admin shell components introduced in the phase 16 redesign: `AdminShell`, `AdminSidebar`, and `AdminTopBar`. The components are well-structured overall, with good use of WCAG-compliant touch targets (44px), `aria-hidden` on decorative icons, `aria-current="page"` for active nav items, and `motion-safe:` guards on transitions.

Three warnings were found:

1. The mobile sidebar overlay has no keyboard escape handler, and is missing `role="dialog"` + `aria-modal` — focus is not trapped, which breaks WCAG 2.1 AA keyboard navigation requirements (legally mandated for Norwegian commercial sites).
2. The logout handler in `AdminSidebar` has no error handling — a failed `signOut()` or `/api/auth/logout` call leaves the user in a split authentication state with no user feedback.
3. Both the mobile close button and the top bar menu button are missing `type="button"`, which can cause unintended form submission in wrapped contexts.

---

## Warnings

### WR-01: Mobile sidebar overlay is not keyboard-accessible (WCAG violation)

**File:** `src/components/admin/AdminShell.tsx:29-38`

**Issue:** The mobile sidebar is rendered as a plain `<div>` overlay without `role="dialog"`, `aria-modal="true"`, or focus trapping. Keyboard users have no way to close it with the Escape key, and screen readers do not announce it as a modal dialog. This is a WCAG 2.1 AA violation (Success Criterion 2.1.1 Keyboard) — legally required for Norwegian commercial websites.

**Fix:**

Add an `onKeyDown` handler to the overlay that closes the sidebar on Escape, and add the dialog role. For full compliance, focus should be moved into the sidebar when it opens and returned to the menu button when it closes. Minimal fix:

```tsx
{sidebarOpen && (
  <>
    <div
      className="fixed inset-0 z-[240] bg-black/50 md:hidden"
      onClick={() => setSidebarOpen(false)}
      onKeyDown={(e) => { if (e.key === 'Escape') setSidebarOpen(false) }}
      aria-hidden="true"
    />
    <div role="dialog" aria-modal="true" aria-label="Admin-navigasjon">
      <AdminSidebar mobile onClose={() => setSidebarOpen(false)} />
    </div>
  </>
)}
```

For full focus trap behaviour, use a `useEffect` to move focus to the first focusable element inside the sidebar and restore it to `onMenuClick` button on close. The `AdminTopBar` menu button should be given a `ref` for this purpose.

---

### WR-02: Logout handler has no error handling — split auth state on failure

**File:** `src/components/admin/AdminSidebar.tsx:162-167`

**Issue:** The logout `onClick` calls `signOut()` and then `fetch('/api/auth/logout')` with no `try/catch`. If either call fails:
- Firebase client auth is signed out but the session cookie is still valid (user can reload and still be "logged in" server-side).
- Or the session cookie is cleared but the Firebase client token is still live (reverse split).

In both cases the user sees no error and is redirected to `/` while their auth state is inconsistent.

**Fix:**

```tsx
onClick={async () => {
  try {
    await signOut()
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  } catch (err) {
    console.error('Logg ut feilet:', err)
    // Show user-facing error — e.g. toast
    toast.error('Kunne ikke logge ut. Prøv igjen.')
  }
}}
```

---

### WR-03: Buttons missing `type="button"` — implicit submit in form contexts

**File:** `src/components/admin/AdminSidebar.tsx:52` and `src/components/admin/AdminTopBar.tsx:13`

**Issue:** The mobile close button (`<button onClick={onClose}>`) in `AdminSidebar` and the menu button in `AdminTopBar` both omit `type="button"`. The HTML default for a `<button>` with no `type` is `type="submit"`. If these components are ever wrapped in a `<form>` (even indirectly through page composition), clicking them will submit the form rather than triggering the intended action.

**Fix:**

```tsx
// AdminSidebar.tsx line 52
<button
  type="button"
  onClick={onClose}
  ...
>

// AdminTopBar.tsx line 13
<button
  type="button"
  onClick={onMenuClick}
  ...
>
```

---

## Info

### IN-01: `title` and `aria-label` set to same value on collapsed nav links

**File:** `src/components/admin/AdminSidebar.tsx:100-101` and `137-138`

**Issue:** When collapsed, nav links set both `aria-label` and `title` to the item label. `title` tooltips are not reliably exposed to screen readers and are inaccessible on touch devices. Since `aria-label` already covers accessibility, `title` is redundant.

**Fix:** Remove the `title` prop from the collapsed nav links, or keep `title` only on the action buttons at the bottom (where a visible tooltip on hover provides extra utility for sighted keyboard users).

---

### IN-02: Logout uses `window.location.href` instead of App Router navigation

**File:** `src/components/admin/AdminSidebar.tsx:166`

**Issue:** `window.location.href = '/'` causes a full browser navigation instead of a client-side route transition. This is acceptable post-logout (ensures all client state is cleared), but is inconsistent with the App Router pattern used elsewhere in the codebase.

**Fix:** This is intentional in many auth flows (hard reload clears all React state and caches). If intentional, add a comment:

```tsx
// Full page reload intentional: clears all React state and caches after logout
window.location.href = '/'
```

---

### IN-03: Redundant width declaration on mobile sidebar

**File:** `src/components/admin/AdminSidebar.tsx:41`

**Issue:** When `mobile` is `true`, the `aside` receives `w-[240px]` via the `mobile &&` class, but `isCollapsed` is always `false` for mobile (line 34), so the `isCollapsed ? 'w-[64px]' : 'w-[240px]'` conditional on line 40 also outputs `w-[240px]`. Both Tailwind classes resolve to the same value — the explicit mobile `w-[240px]` on line 41 is redundant.

**Fix:** No functional impact. If desired, simplify the mobile className to remove the duplicate:

```tsx
className={cn(
  'flex h-full flex-col bg-white border-r border-forest/12',
  isCollapsed ? 'w-[64px]' : 'w-[240px]',
  mobile && 'fixed inset-y-0 left-0 z-[250]'  // w-[240px] already covered above
)}
```

---

_Reviewed: 2026-04-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
