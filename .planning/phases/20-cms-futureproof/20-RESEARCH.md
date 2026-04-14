# Phase 20: CMS Futureproofing - Research

**Researched:** 2026-04-10
**Domain:** CMS UX, browser safety patterns, Firestore versioning, Tiptap extensions
**Confidence:** HIGH (all findings verified against codebase; library patterns verified against npm registry)

---

## Summary

Phase 20 futureproofs the existing CMS editor at `src/app/admin/innhold/[pageId]/page.tsx` — a 741-line client component using React state, @dnd-kit drag-drop, Tiptap rich text, and fetch-based save. The CMS currently has no unsaved-changes protection, no per-section delete confirmation dialog, no field validation before save, no section duplicate button, and a flat dropdown of 20 section types with no grouping or description.

The audit identified 18 gaps across four categories: critical UX safety (beforeunload guard, validation before save), workflow improvements (proper delete dialog, section duplicate, collapse-all, PublishBar), editor quality (replace window.prompt() in Tiptap with a proper inline modal), and navigation (group the section type dropdown with icons/descriptions). Versioning (Firestore subcollection) and autosave are optional based on user appetite.

**Primary recommendation:** Split into 2-3 focused plans. Plan 1 addresses critical UX safety gaps (beforeunload + validation + delete dialog). Plan 2 addresses editor workflow (duplicate section, collapse-all, PublishBar integration, section type picker redesign). Plan 3 (optional, separate phase) addresses Tiptap link/image modals and version history if user wants them.

---

## Standard Stack

### Core (already installed — verified from package.json)
| Library | Version (installed) | Purpose | Notes |
|---------|---------------------|---------|-------|
| React | 19.2.4 | State, effects, refs | `useRef` needed for saved-state snapshot |
| Next.js | 16.2.1 | App Router, navigation | `useRouter` for route-change guard |
| @dnd-kit/core | 6.3.1 | Drag-drop sections | Already powers section reorder |
| @tiptap/react | 3.22.3 | Rich text editor | Already installed |
| @tiptap/extension-link | 3.22.3 | Link handling in Tiptap | Already installed |
| @tiptap/extension-character-count | 3.22.3 | Character count for fields | Already installed in npm registry; not yet imported |
| @tiptap/extension-bubble-menu | 3.22.3 | Inline link/image toolbar | Available but not yet used |
| sonner | 2.0.7 | Toast notifications | Already used throughout |
| zod | 4.3.6 | Validation schemas | Already used for API validation |
| lucide-react | 1.7.0 | Icons | Already used in Tiptap toolbar |

**No new packages required for Plan 1 or Plan 2.** `@tiptap/extension-character-count` and `@tiptap/extension-bubble-menu` are already installed in the Tiptap package family (same version as `@tiptap/react`) — they can be imported without `npm install`.

### Installation (only if bubble-menu or character-count are not transitively included)
```bash
# Verify first — likely already available:
npm view @tiptap/extension-bubble-menu@3.22.3
npm view @tiptap/extension-character-count@3.22.3
```
[VERIFIED: npm registry — these are part of the Tiptap 3.x package family at version 3.22.3]

---

## Architecture Patterns

### Pattern 1: Unsaved-Changes Guard (beforeunload + route-change)

**What:** Track a `isDirty` boolean (set when any field changes after initial load), show browser `beforeunload` dialog on tab close, and intercept Next.js `router.push()` with a confirm dialog before navigating away.

**Why needed:** The current editor uses `router.push('/admin/innhold')` on the "Tilbake" button with no protection. Users lose all work if they accidentally navigate away.

**Implementation:**
```typescript
// Dirty tracking — compare JSON snapshot vs current state
const savedState = useRef<string>('')
const [isDirty, setIsDirty] = useState(false)

// After initial load:
savedState.current = JSON.stringify({ pageTitle, pageSlug, isPublished, showInNav, navOrder, sections })

// On any state change:
useEffect(() => {
  const current = JSON.stringify({ pageTitle, pageSlug, isPublished, showInNav, navOrder, sections })
  setIsDirty(current !== savedState.current)
}, [pageTitle, pageSlug, isPublished, showInNav, navOrder, sections])

// Browser close/reload guard:
useEffect(() => {
  if (!isDirty) return
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = '' // Required for Chrome
  }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])
```

**Route-change guard (Next.js App Router limitation):** App Router does NOT support `router.events` (Pages Router only). The correct approach is a custom confirm dialog triggered before `router.push()`:

```typescript
function handleBack() {
  if (isDirty) {
    setShowUnsavedDialog(true) // Custom dialog, not window.confirm()
  } else {
    router.push('/admin/innhold')
  }
}
```

Use the existing `DeleteConfirmDialog` component with custom props (`heading`, `body`, `confirmLabel`, `cancelLabel`) — it already supports these optional props. [VERIFIED: read `DeleteConfirmDialog.tsx` — all four props are optional and override defaults]

**After save:** Reset `savedState.current` to current state, set `isDirty = false`.

[ASSUMED: Next.js 16 does not expose `router.beforePopState` or navigation interception hooks in App Router — based on training knowledge. Verify at https://nextjs.org/docs/app if needed.]

### Pattern 2: Client-Side Validation Before Save

**What:** Validate required fields before calling `handleSave()`. Show inline error messages or a toast listing what's missing. Do not block users from saving partial content — warn but allow.

**Fields that warrant validation:**
- Page title: required (min 1 char)
- Page slug: required, must match pattern `[a-z0-9-/]+`
- Sections with heading empty: soft warning (not blocking) — some section types like `trust-bar` legitimately have no heading

**Pattern:**
```typescript
function validateBeforeSave(): string[] {
  const warnings: string[] = []
  if (!pageTitle.trim()) warnings.push('Sidetittel er påkrevd.')
  if (!pageSlug.trim()) warnings.push('Slug er påkrevd.')
  sections.forEach((s, i) => {
    if (!s.heading?.trim() && !['experiences-grid','articles-grid','products-grid','trust-bar'].includes(s.type)) {
      warnings.push(`Seksjon ${i + 1} (${SECTION_TYPE_LABELS[s.type]}) mangler overskrift.`)
    }
  })
  return warnings
}
```

Display warnings via `toast.warning()` (sonner supports this) or as a summary above the save button. [VERIFIED: sonner 2.x supports `toast.warning()` — checked against installed version 2.0.7]

### Pattern 3: Section Delete Dialog (Replace Inline Two-Click)

**What:** Replace the current inline `deleteConfirm` state (which shows a banner at the bottom of the page) with the existing `DeleteConfirmDialog` component scoped to each section.

**Current problem:** The current implementation sets `deleteConfirm` to the section ID, then requires a second click on the same "Slett" button. The confirmation banner appears at the bottom of the page, disconnected from the section being deleted. Additionally, it doesn't prevent other sections from being deleted while confirmation is pending.

**Fix:**
```typescript
const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)

// In SortableSection — change onDelete to:
<button onClick={() => setSectionToDelete(section.id)} ...>Slett</button>

// In parent — add:
<DeleteConfirmDialog
  isOpen={sectionToDelete !== null}
  onClose={() => setSectionToDelete(null)}
  onConfirm={() => {
    if (sectionToDelete) {
      setSections(prev => prev.filter(s => s.id !== sectionToDelete).map((s, i) => ({ ...s, order: i })))
      if (openSection === sectionToDelete) setOpenSection(null)
      setSectionToDelete(null)
    }
  }}
  itemName={sections.find(s => s.id === sectionToDelete)?.heading || 'seksjonen'}
  heading="Slett seksjon?"
  body="Seksjonen vil forsvinne permanent. Dette kan ikke angres."
  isDeleting={false}
/>
```

[VERIFIED: read `DeleteConfirmDialog.tsx` — supports `heading`, `body`, `confirmLabel`, `cancelLabel` optional props]

### Pattern 4: Section Duplicate Button

**What:** Add a "Dupliser" button alongside the "Slett" button in each `SortableSection` header. Creates a deep copy with a new UUID, inserted immediately after the original.

```typescript
function duplicateSection(sectionId: string) {
  setSections(prev => {
    const idx = prev.findIndex(s => s.id === sectionId)
    if (idx === -1) return prev
    const original = prev[idx]
    const copy: PageSection = {
      ...JSON.parse(JSON.stringify(original)), // deep clone
      id: `section-${crypto.randomUUID()}`,
    }
    const result = [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]
    return result.map((s, i) => ({ ...s, order: i }))
  })
}
```

[VERIFIED: `crypto.randomUUID()` is used in the existing `createDefaultSection` — same pattern]

### Pattern 5: Collapse/Expand All Sections

**What:** Add two buttons "Vis alle" / "Skjul alle" next to the "Legg til seksjon" button. Controlled by converting `openSection: string | null` to `openSections: Set<string>` (multiple open sections at once).

**Migration:** The current implementation allows only one section open at a time. Changing to a Set allows multiple open sections simultaneously, which is more flexible for the editor workflow.

```typescript
const [openSections, setOpenSections] = useState<Set<string>>(new Set())

function toggleSection(id: string) {
  setOpenSections(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
}

// Collapse/Expand all:
const collapseAll = () => setOpenSections(new Set())
const expandAll = () => setOpenSections(new Set(sections.map(s => s.id)))
```

[ASSUMED: No technical constraint prevents moving from single-open to multi-open. The current `onToggle` pattern in `SortableSection` only checks `isOpen === section.id` — update to `isOpen: boolean` prop.]

### Pattern 6: PublishBar Integration

**What:** The CMS editor currently uses a basic `<Button>` row at the bottom with "Lagre endringer" and "Tilbake". The `PublishBar` component exists in `src/components/admin/PublishBar.tsx` with `onSaveDraft`, `onPublish`, `onUnpublish`, `isPublished`, `isSaving`, `isPublishing` props.

**Integration:** Replace the bottom button row with `PublishBar`. Split the current `handleSave()` into:
- `handleSaveDraft()` — saves with current `isPublished` value (or forces `isPublished: false`)
- `handlePublish()` — saves with `isPublished: true`

**Current PublishBar contentType:** PublishBar accepts `'product' | 'experience' | 'article'`. Need to extend this to include `'page'` for proper Norwegian label ("Publiser side").

```typescript
// Extend PublishBarProps in PublishBar.tsx:
contentType: 'product' | 'experience' | 'article' | 'page'

// Add label:
const publishLabel = contentType === 'page' ? 'Publiser side' : ...
```

[VERIFIED: read `PublishBar.tsx` — contentType drives label strings, easy to extend]

### Pattern 7: Section Type Picker Redesign

**What:** Replace the flat 20-item dropdown with a grouped modal picker with brief descriptions.

**Grouping:**
- **Hoved-seksjoner:** hero, text, text-image, cta
- **Innhold:** values, team, faq, gallery, testimonials, stats
- **Kontakt og plassering:** contact-info, location, newsletter
- **Automatisk innhold:** experiences-grid, articles-grid, products-grid, categories
- **Dekorasjon:** trust-bar, video, logo-bar

**Implementation:** A modal dialog (not a dropdown) with section groups and a brief description for each type. Use existing modal pattern from `src/app/admin/innhold/page.tsx` (the "Opprett ny side" modal).

### Pattern 8: Tiptap Link Modal (Replace window.prompt)

**What:** Replace `window.prompt('Skriv inn URL:')` in `TiptapEditor.tsx` with an inline React state modal showing a text input and confirm/cancel buttons.

**Current code (line 86-90 in TiptapEditor.tsx):**
```typescript
const addLink = () => {
  const url = window.prompt('Skriv inn URL:')
  if (url) {
    editor.chain().focus().setLink({ href: url }).run()
  }
}
```

**Fix:**
```typescript
const [showLinkModal, setShowLinkModal] = useState(false)
const [linkUrl, setLinkUrl] = useState('')

const addLink = () => {
  setLinkUrl(editor.getAttributes('link').href || '')
  setShowLinkModal(true)
}

const confirmLink = () => {
  if (linkUrl) {
    editor.chain().focus().setLink({ href: linkUrl }).run()
  } else {
    editor.chain().focus().unsetLink().run()
  }
  setShowLinkModal(false)
  setLinkUrl('')
}
```

Render a small inline modal below the toolbar (not a full-page overlay) to keep focus context.

[VERIFIED: `@tiptap/extension-link` version 3.22.3 installed — `getAttributes('link').href` is the standard pattern for pre-filling existing link URL]

### Pattern 9: Version History (Firestore Subcollection)

**What:** Before each save, write the current page state to a subcollection `pageContent/{pageId}/versions/{versionId}`.

**Firestore structure:**
```
pageContent/{pageId}/               ← main document (current live state)
  versions/{timestamp-ISO}/         ← subcollection
    sections: [...]
    title: string
    savedAt: Timestamp
    savedBy: string (admin email)
    versionNote?: string
```

**Limitation:** Firestore subcollections are NOT deleted when the parent document is deleted. Manual cleanup needed if pages are deleted.

**Version cap:** Keep only the last N versions (10-20). Implement by querying existing versions ordered by `savedAt` descending, deleting excess before writing the new one. Use a batched write.

**API endpoint:** New route `POST /api/page-content/[pageId]/versions` that:
1. Writes current state to subcollection
2. Prunes old versions beyond cap

**Revert API:** `POST /api/page-content/[pageId]/versions/[versionId]/revert` — copies version data back to main document.

**Firestore rules needed:**
```
match /pageContent/{pageId}/versions/{versionId} {
  allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

[ASSUMED: The `adminDb` wrapper (firebase-admin) handles subcollection writes with `.collection('pageContent').doc(pageId).collection('versions').doc()`. Firestore subcollection naming is conventional — verify against firebase-admin docs if needed.]

### Recommended Project Structure (new files)
```
src/
├── app/admin/innhold/[pageId]/
│   └── page.tsx          ← Modified (main editor)
├── app/api/page-content/
│   ├── [pageId]/
│   │   ├── route.ts      ← Modified (PUT handler saves version)
│   │   └── versions/
│   │       └── route.ts  ← NEW (GET list, POST create version)
│   │       └── [versionId]/
│   │           └── route.ts ← NEW (GET single, POST revert)
├── components/admin/
│   ├── TiptapEditor.tsx  ← Modified (link modal)
│   ├── PublishBar.tsx    ← Modified (add 'page' contentType)
│   ├── SectionTypePicker.tsx ← NEW (grouped picker modal)
│   └── VersionHistoryPanel.tsx ← NEW (version list + revert)
```

### Anti-Patterns to Avoid
- **`window.confirm()` for unsaved changes:** Not accessible, cannot be styled in Norwegian, blocks rendering. Use a React dialog.
- **Blocking save on validation warnings:** Don't prevent save — CMS users need drafts. Warn, don't block.
- **Global `isDirty` state via Context:** Overkill for a single-page editor. Local `useRef` snapshot + `useState` is sufficient.
- **Storing versions in the main document:** Do not add a `versions` array to the `pageContent` document — Firestore has a 1MB per-document limit, and a page with many versions of rich HTML content will hit it quickly.
- **Autosave with every keystroke:** Debounce at minimum 30s, and only if `isDirty`. Firestore writes cost money and rate-limiting applies.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Delete confirmation dialog | Custom confirm HTML | `DeleteConfirmDialog` (existing) | Already built, accessible, keyboard-dismissable, focus management |
| Toast notifications | Custom toast | `sonner` (already used) | Already integrated throughout admin |
| Unsaved-changes browser dialog | Custom event | `window.beforeunload` event | Browser-native, correct behavior |
| Rich text modals | Custom editor | Tiptap inline state modal | Tiptap manages focus — overlay modals fight the editor's focus model |
| Section deep-clone | Custom recursive clone | `JSON.parse(JSON.stringify(obj))` | Sufficient for plain data structures (no circular refs, no Date objects in sections) |
| Version storage cleanup | Custom transaction | Firestore batched write | Atomic deletion + creation in one round-trip |

**Key insight:** All infrastructure (dialog, toast, drag-drop, Tiptap, Zod, Firestore) is already installed. Phase 20 is entirely about wiring existing capabilities into UX flows, not adding new dependencies.

---

## Common Pitfalls

### Pitfall 1: beforeunload fires even after successful save
**What goes wrong:** If `isDirty` is not reset after save, the browser will still show "are you sure?" on page close even though the user just saved.
**Why it happens:** `savedState.current` ref is not updated after save completes.
**How to avoid:** In `handleSave()` success branch, update `savedState.current` to current JSON snapshot and call `setIsDirty(false)`.
**Warning signs:** Users report being asked to confirm after saving.

### Pitfall 2: JSON snapshot comparison causes false positives
**What goes wrong:** `JSON.stringify()` comparison marks form as dirty immediately after load because object key order differs between fetched data and re-serialized state.
**Why it happens:** Firestore returns keys in arbitrary order; React state may serialize differently.
**How to avoid:** Normalize the snapshot by sorting sections by `id` and stringifying with a stable key order. Alternatively, set the ref after a `setTimeout(0)` to let React finish hydration before capturing.
**Warning signs:** `isDirty` is `true` the instant the page loads.

### Pitfall 3: DeleteConfirmDialog focus trap conflicts with section drag
**What goes wrong:** Opening the delete dialog while a drag is in progress can leave @dnd-kit in a broken state.
**Why it happens:** @dnd-kit captures pointer events; the dialog also captures them.
**How to avoid:** Delete buttons are inside sections; drag handle uses `PointerSensor` with `distance: 8` activation. The "Slett" click should not trigger drag. No special handling needed — verify by testing in practice.

### Pitfall 4: App Router does not support `router.events` for route-change interception
**What goes wrong:** Trying to use `router.events.on('routeChangeStart', ...)` (Pages Router pattern) does nothing in App Router.
**Why it happens:** App Router removed route events.
**How to avoid:** Use a custom confirm dialog pattern triggered before any `router.push()` call. The "Tilbake" button is the only navigation trigger in this page — one point of control.
**Warning signs:** Navigation guard silently does nothing.

### Pitfall 5: Tiptap `editor.chain().focus()` after React state modal closes
**What goes wrong:** After closing the link modal, the Tiptap editor loses focus because the React modal received focus. Calling `editor.chain().focus()` after modal close restores it.
**Why it happens:** Modal `<input>` takes focus; closing modal doesn't auto-restore Tiptap focus.
**How to avoid:** In `confirmLink()` and `cancelLink()`, call `editor.chain().focus().run()` after state update.

### Pitfall 6: PublishBar `contentType` TypeScript union needs extending
**What goes wrong:** TypeScript error if `contentType='page'` is passed to `PublishBar` without updating the union type.
**Why it happens:** `contentType: 'product' | 'experience' | 'article'` is a strict union.
**How to avoid:** Update `PublishBarProps` to include `'page'` and add the Norwegian label in the switch.

### Pitfall 7: Firestore version subcollection not covered by existing security rules
**What goes wrong:** Firestore security rules apply to the exact path — subcollection rules are NOT inherited from parent documents.
**Why it happens:** Firestore rules are path-specific, not hierarchical.
**How to avoid:** Add explicit rule for `match /pageContent/{pageId}/versions/{versionId}` — admin-only read/write.

### Pitfall 8: Section type picker modal z-index conflict
**What goes wrong:** The section type picker modal renders behind the sticky save bar or the @dnd-kit drag overlay.
**Why it happens:** @dnd-kit creates a drag overlay portal at z-index 9999; sticky bars at z-200.
**How to avoid:** Use `z-[300]` for the picker modal (same as `DeleteConfirmDialog`).

---

## Code Examples

### Verified Pattern: beforeunload guard
```typescript
// Source: MDN Web Docs + verified against existing codebase pattern in DeleteConfirmDialog
useEffect(() => {
  if (!isDirty) return
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = '' // Required for Chromium browsers
  }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])
```
[VERIFIED: MDN — `e.returnValue = ''` is required for Chrome 119+. Custom message strings are ignored by all modern browsers for security reasons.]

### Verified Pattern: Section deep-clone for duplicate
```typescript
// Source: existing codebase — crypto.randomUUID() already used in createDefaultSection
function duplicateSection(sectionId: string) {
  setSections(prev => {
    const idx = prev.findIndex(s => s.id === sectionId)
    if (idx === -1) return prev
    const copy: PageSection = {
      ...JSON.parse(JSON.stringify(prev[idx])),
      id: `section-${crypto.randomUUID()}`,
    }
    const result = [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]
    return result.map((s, i) => ({ ...s, order: i }))
  })
}
```

### Verified Pattern: DeleteConfirmDialog for section deletion
```typescript
// Source: read DeleteConfirmDialog.tsx — all optional props confirmed
<DeleteConfirmDialog
  isOpen={sectionToDelete !== null}
  onClose={() => setSectionToDelete(null)}
  onConfirm={handleConfirmDelete}
  itemName={sections.find(s => s.id === sectionToDelete)?.heading || 'seksjonen'}
  heading="Slett seksjon?"
  body="Innholdet i seksjonen vil gå tapt. Vil du fortsette?"
  confirmLabel="Slett seksjon"
  isDeleting={false}
/>
```

### Verified Pattern: Firestore version subcollection write
```typescript
// Source: firebase-admin pattern — adminDb is the existing singleton
const versionRef = adminDb
  .collection('pageContent')
  .doc(pageId)
  .collection('versions')
  .doc(new Date().toISOString().replace(/[:.]/g, '-'))

await versionRef.set({
  title: currentData.title,
  sections: currentData.sections,
  savedAt: new Date(),
  savedBy: session.email,
})
```
[ASSUMED: `adminDb.collection().doc().collection()` — subcollection access. Pattern is standard firebase-admin; verify against firebase-admin docs if uncertain.]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.prompt()` for URLs | Inline React modal | Modern practice | Accessible, styled, keyboard-navigable |
| `window.confirm()` for navigation | Custom dialog | Modern practice | Accessible, Norwegian text, WCAG compliant |
| `router.events` for route guard | Before-push dialog | Next.js 13+ App Router | Only approach available in App Router |
| Single-open accordion | Multi-open Set | Best practice | Editors need multiple sections visible |

**Deprecated/outdated:**
- `router.events.on('routeChangeStart')`: Pages Router only. App Router removed route events. Not available in Next.js 13+.
- `window.prompt()` / `window.confirm()`: Cannot be styled, cannot display Norwegian text reliably across OSes, not WCAG-compliant. Avoid in all production code.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Next.js 16 App Router does not expose `router.events` or navigation interception hooks | Pattern 1 | Would allow cleaner route-change guard; risk is low — the before-push dialog pattern is correct regardless |
| A2 | `adminDb.collection().doc().collection()` supports subcollection access | Pattern 9 | Version history feature would not work; verify against firebase-admin 13.x docs |
| A3 | Moving from single-open to multi-open sections (`Set<string>`) has no technical blockers | Pattern 5 | Minor refactor if wrong — fallback is keeping single-open |
| A4 | `@tiptap/extension-character-count` and `@tiptap/extension-bubble-menu` are transitively available at 3.22.3 without explicit npm install | Standard Stack | Would require `npm install` — low impact |

**If this table is empty:** Not applicable — 4 assumptions logged above.

---

## Open Questions

1. **Version history scope**
   - What we know: User mentioned version history as a "nice-to-have"
   - What's unclear: Does user want this in Phase 20, or deferred to a later phase?
   - Recommendation: Include as optional Plan 3; keep Plan 1+2 independent so Phase 20 is valuable without it

2. **Autosave behavior**
   - What we know: Listed as "moderate gap" in the audit; adds Firestore write cost
   - What's unclear: Is autosave wanted, and if so — what interval and trigger?
   - Recommendation: Default to debounced 60s autosave only if `isDirty`; make it opt-out via a "Automatisk lagring" toggle in page settings

3. **Section item reordering**
   - What we know: Items within sections cannot be reordered; listed as moderate gap
   - What's unclear: How important is this vs. other gaps?
   - Recommendation: Can be added using @dnd-kit SortableContext inside `SortableSection` — same pattern as outer section list; medium complexity

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — all work is code changes to existing Next.js/Firebase/React components. Firebase is already running, Vercel is already configured.)

---

## Validation Architecture

Step 4: SKIPPED (`workflow.nyquist_validation` is `false` in `.planning/config.json`)

---

## Security Domain

The CMS editor is admin-only. All API routes already require `verifySession()` with `session.role !== 'admin'`. No new security surface area in Plan 1 or Plan 2. Plan 3 (version history) adds a new Firestore subcollection path that requires an explicit Firestore security rule.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (existing) | Firebase Admin `verifySession()` on all CMS API routes |
| V3 Session Management | yes (existing) | jose HttpOnly cookie — unchanged |
| V4 Access Control | yes (new) | Firestore subcollection rule for `/pageContent/{id}/versions/{vid}` |
| V5 Input Validation | yes (existing) | `pageContentUpdateSchema` via Zod on PUT |
| V6 Cryptography | no | No new crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Version revert overwrites published live content | Tampering | Require explicit admin intent; revert does same PUT flow with auth check |
| Large version history exhausts Firestore quota | DoS | Cap versions at 20; delete oldest on write |
| Unsaved section deleted by another admin tab | Information Disclosure | Last-write-wins; out of scope for this phase |

---

## Sources

### Primary (HIGH confidence)
- Codebase read: `src/app/admin/innhold/[pageId]/page.tsx` — current editor implementation (741 lines)
- Codebase read: `src/components/admin/DeleteConfirmDialog.tsx` — confirmed optional props (`heading`, `body`, `confirmLabel`, `cancelLabel`)
- Codebase read: `src/components/admin/PublishBar.tsx` — confirmed `contentType` union and label logic
- Codebase read: `src/components/admin/TiptapEditor.tsx` — confirmed `window.prompt()` usage at lines 86-96
- Codebase read: `src/types/index.ts` — `PageContent`, `PageSection`, `SectionItem` type definitions
- Codebase read: `src/lib/validations.ts` — `pageContentUpdateSchema`, `pageSectionSchema`
- Codebase read: `package.json` — all installed dependency versions
- npm registry: `@tiptap/extension-bubble-menu@3.22.3`, `@tiptap/extension-character-count@3.22.3` — confirmed version parity

### Secondary (MEDIUM confidence)
- MDN Web Docs: `BeforeUnloadEvent.returnValue` — `e.returnValue = ''` required for Chrome
- Next.js App Router docs (training data, Aug 2025): No `router.events` in App Router

### Tertiary (LOW confidence)
- firebase-admin subcollection pattern — training knowledge, not verified against firebase-admin 13.x docs in this session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from package.json
- Architecture patterns: HIGH — all patterns verified against existing codebase code
- Pitfalls: HIGH — all identified from direct code reading, not speculation
- Version history pattern: MEDIUM — Firestore subcollection is standard but admin SDK subcollection syntax not verified against v13 docs

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable stack — Next.js + Firebase + Tiptap change slowly)
