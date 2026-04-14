---
phase: 20-cms-futureproof
plan: 03
subsystem: ui, api, database
tags: [firestore, subcollection, version-history, cms, next.js, typescript]

# Dependency graph
requires:
  - phase: 20-cms-futureproof/20-01
    provides: Safety features (PublishBar, validation, unsaved-changes guard) integrated into CMS editor
  - phase: 20-cms-futureproof/20-02
    provides: Productivity features (duplicate, type picker, autosave, item reorder) integrated into CMS editor

provides:
  - Version snapshots stored in Firestore subcollection pageContent/{pageId}/versions/{versionId}
  - GET /api/page-content/[pageId]/versions — list last 10 versions with metadata
  - POST /api/page-content/[pageId]/versions — create version snapshot with cap-20 pruning
  - POST /api/page-content/[pageId]/versions/[versionId] — revert editor to a specific version
  - VersionHistoryPanel component — collapsible panel in CMS editor showing version list with revert
  - Firestore security rule protecting versions subcollection (admin-only read/write)

affects: [cms-editor, page-content-api, firestore-rules]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Version snapshots via Firestore subcollection with timestamp-based IDs"
    - "VERSION_CAP = 20 with batch-delete pruning on every POST"
    - "Silent version creation (fetch().catch(() => {})) — never blocks save workflow"
    - "Revert pattern: server writes version data back to main doc, returns data, client updates all state"
    - "refreshTrigger counter pattern for child component re-fetch without prop drilling"

key-files:
  created:
    - src/app/api/page-content/[pageId]/versions/route.ts
    - src/app/api/page-content/[pageId]/versions/[versionId]/route.ts
    - src/components/admin/VersionHistoryPanel.tsx
  modified:
    - src/app/admin/innhold/[pageId]/page.tsx
    - firestore.rules

key-decisions:
  - "Timestamp-based version IDs (ISO string with colons/dots replaced by dashes) — sortable without extra index"
  - "VERSION_CAP = 20 with pruning on every POST — prevents unbounded subcollection growth"
  - "Silent version creation after save — version failures never block editor workflow"
  - "Revert returns full page data in response body — client updates all state without a second GET"
  - "refreshTrigger counter (not timestamp) — simpler and avoids Date serialization issues"
  - "Firestore REST set() second arg is boolean true for merge, not { merge: true } — matched existing pattern"

patterns-established:
  - "Subcollection version pattern: pageContent/{pageId}/versions/{versionId}"
  - "Silent fire-and-forget fetch for non-critical background operations"
  - "onRevert callback resets savedStateRef.current + setIsDirty(false) — editor is clean after revert"

requirements-completed: [CMS-FP-13, CMS-FP-14, CMS-FP-15, CMS-FP-16, CMS-FP-17]

# Metrics
duration: 20min
completed: 2026-04-14
---

# Phase 20 Plan 03: CMS Version History Summary

**Firestore subcollection version history for the CMS editor: save snapshots on every write, browse last 10 versions in a collapsible panel, revert to any version with full state restoration and cache invalidation**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-14T10:46:00Z
- **Completed:** 2026-04-14T11:06:44Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Two API routes for version management: list (GET), create (POST) with cap-20 pruning, and revert (POST on [versionId])
- VersionHistoryPanel client component with collapsible UI, version list, and revert button per version
- Version creation wired into all four save paths: handleSaveDraft, handlePublish, handleUnpublish, autosave
- Revert flow: server writes version data back to main Firestore document, invalidates CDN/cache, returns restored data; client updates all form state and resets dirty tracking
- Firestore security rule added for `pageContent/{pageId}/versions/{versionId}` — admin-only read/write (double protection: API layer + Firestore rules)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create version API routes and Firestore security rule** - `f277e62` (feat)
2. **Task 2: Create VersionHistoryPanel and integrate into editor** - `e85f5ad` (feat)

## Files Created/Modified
- `src/app/api/page-content/[pageId]/versions/route.ts` — GET list last 10 versions, POST create snapshot with pruning at cap 20
- `src/app/api/page-content/[pageId]/versions/[versionId]/route.ts` — POST revert: writes version data back to main doc, invalidates cache, returns restored data
- `src/components/admin/VersionHistoryPanel.tsx` — collapsible panel showing version list with date, savedBy, sectionCount, and Gjenopprett button
- `src/app/admin/innhold/[pageId]/page.tsx` — import + versionRefresh state + version POST in all 4 save handlers + VersionHistoryPanel render with onRevert callback
- `firestore.rules` — added admin-only rule for pageContent/{pageId}/versions/{versionId}

## Decisions Made
- Timestamp-based version IDs (ISO string with `:` and `.` replaced by `-`) — naturally sortable, no secondary index needed
- VERSION_CAP = 20 (API spec said 20, list shows 10): stores 20, displays 10 most recent
- Silent fire-and-forget fetch for version creation — failures never interrupt the save workflow
- Revert returns full page data in response body so client can update state in one round-trip
- Firestore REST `set()` takes a boolean `true` for merge (not `{ merge: true }`) — matched existing codebase pattern from `src/app/api/page-content/[pageId]/route.ts`

## Deviations from Plan

**1. [Rule 1 - Bug] Fixed `{ merge: true }` → `true` for Firestore REST set() call**
- **Found during:** Task 1 (version revert route)
- **Issue:** Plan showed `{ merge: true }` as the second arg to `.set()`, but the project uses a custom Firestore REST client where `DocRef.set(data, merge = false)` takes a boolean, not an options object
- **Fix:** Changed to `true` (boolean) to match the actual interface in `src/lib/firebase/firestore-rest.ts`
- **Files modified:** `src/app/api/page-content/[pageId]/versions/[versionId]/route.ts`
- **Verification:** TypeScript compiles clean, matches pattern used in existing `route.ts`
- **Committed in:** `f277e62` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary correctness fix — the wrong type would have caused a runtime type mismatch. No scope creep.

## Issues Encountered
- Worktree branch was behind master by 6 commits (Waves 1+2 work). Rebased onto `210c1d2` before starting.

## Known Stubs
None — all version data is live from Firestore, no hardcoded placeholders.

## Threat Flags
None — all threat model mitigations (T-20-05 through T-20-08) were implemented as planned:
- Revert requires admin session (T-20-05)
- VERSION_CAP = 20 with pruning (T-20-06)
- GET versions requires admin session (T-20-07)
- Explicit Firestore rule for subcollection (T-20-08)

## User Setup Required
None — no external service configuration required. Firestore subcollection is created automatically on first version save.

## Next Phase Readiness
- All three waves of Phase 20 (CMS futureproofing) are complete
- The CMS editor now has: safety features (Wave 1), productivity features (Wave 2), and version history (Wave 3)
- No blockers for next phase

---
*Phase: 20-cms-futureproof*
*Completed: 2026-04-14*
