---
status: partial
phase: 06-admin-qa-og-feilsider
source: [06-VERIFICATION.md]
started: 2026-04-07T23:30:00.000Z
updated: 2026-04-07T23:30:00.000Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. End-to-end image upload
expected: Log in as admin, upload a JPG on /admin/produkter/ny, fill name/price/category, publish. Product appears in list with image.
result: [pending]

### 2. Scroll-to-first-error behavior
expected: Submit empty forms on all three /admin/*/ny pages. Page scrolls so first error message is visible without manual scrolling.
result: [pending]

### 3. global-error.tsx branded error page
expected: Trigger a root layout error. Branded Norwegian page shows "Noe gikk alvorlig galt" and "Prov igjen" button.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
