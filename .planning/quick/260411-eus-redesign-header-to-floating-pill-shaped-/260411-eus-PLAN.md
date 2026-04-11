---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/Header.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Hero pages show transparent header with cream text when NOT scrolled"
    - "ALL pages show cream/white floating pill header when scrolled"
    - "Non-hero pages show cream header at all times"
    - "Logo, nav links, cart icon, login button, and hamburger all use correct colors in every state"
  artifacts:
    - path: "src/components/layout/Header.tsx"
      provides: "Unified cream floating pill on scroll for all page types"
  key_links:
    - from: "Header.tsx isTransparent && !isScrolled"
      to: "MegaMenuNav transparent prop"
      via: "prop drilling"
      pattern: "transparent=.*isTransparent.*!isScrolled"
---

<objective>
Redesign header scroll behavior so ALL pages use a white/cream floating pill when scrolled. Currently, hero pages use bg-forest (dark green) when scrolled, creating inconsistency. The fix: replace every standalone `isTransparent` color check with `isTransparent && !isScrolled` so "dark mode" styling only applies to unscrolled hero pages.

Purpose: Consistent header appearance across all page types when scrolled.
Output: Updated Header.tsx with unified cream floating pill on scroll.
</objective>

<execution_context>
@/home/william/.claude/get-shit-done/workflows/execute-plan.md
@/home/william/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/layout/Header.tsx
@src/components/layout/MegaMenuNav.tsx (read-only reference -- no changes needed here)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Unify header scroll styling to cream floating pill</name>
  <files>src/components/layout/Header.tsx</files>
  <action>
Make the following changes to Header.tsx. The core principle: introduce a derived boolean `const showDarkHeader = isTransparent && !isScrolled` and use it everywhere the component currently uses bare `isTransparent` for color decisions.

1. **Add derived variable** (after line 35, the `isScrolled` declaration):
   ```typescript
   const showDarkHeader = isTransparent && !isScrolled
   ```

2. **Header background className block** (lines 108-120): Replace the entire conditional with:
   ```
   isScrolled
     ? 'top-3 left-4 right-4 lg:left-6 lg:right-6 rounded-2xl shadow-lg bg-cream/95 backdrop-blur-md'
     : isTransparent
       ? 'top-0 left-0 right-0 bg-transparent'
       : 'top-0 left-0 right-0 bg-cream/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
   ```
   Key change: scrolled state is always `bg-cream/95 backdrop-blur-md` regardless of page type. Remove the `bg-forest text-cream` and `bg-cream` split.

3. **Logo filter** (line 133): Change `isTransparent` to `showDarkHeader`:
   ```
   className={`h-12 w-12 ${showDarkHeader ? 'brightness-0 invert' : ''}`}
   ```

4. **MegaMenuNav transparent prop** (line 140): Change to:
   ```
   transparent={showDarkHeader}
   ```

5. **Desktop cart icon** (line 148): Change `isTransparent` to `showDarkHeader`:
   ```
   className={`relative flex h-11 w-11 items-center justify-center rounded hover:opacity-85 ${showDarkHeader ? 'text-cream' : 'text-forest'}`}
   ```

6. **Login button** (lines 188-191): Change `isTransparent` to `showDarkHeader`:
   ```
   className={`rounded-full px-4 py-2 text-body font-medium motion-safe:transition-colors motion-safe:duration-150 ${
     showDarkHeader
       ? 'bg-cream/20 text-cream hover:bg-cream/30'
       : 'bg-forest text-cream hover:bg-forest/80'
   }`}
   ```

7. **Mobile cart icon** (line 209): Change `isTransparent` to `showDarkHeader`:
   ```
   className={`h-5 w-5 ${showDarkHeader ? 'text-cream' : 'text-forest'}`}
   ```

8. **Mobile hamburger** (line 220): Change `isTransparent` to `showDarkHeader`:
   ```
   className={`h-6 w-6 ${showDarkHeader ? 'text-cream' : 'text-forest'}`}
   ```

Do NOT modify MegaMenuNav.tsx -- it already handles the `transparent` prop correctly.
  </action>
  <verify>
    <automated>cd /home/william/Documents/Rootsnew && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - Header background is cream/white floating pill when scrolled on ALL page types (no more bg-forest on scroll)
    - Hero pages still show transparent dark header when NOT scrolled
    - Non-hero pages show cream header at all scroll positions
    - All child elements (logo, nav, cart, login, hamburger) use correct light/dark colors based on showDarkHeader
    - Build succeeds with no errors
  </done>
</task>

</tasks>

<verification>
1. Build succeeds: `npx next build` completes without errors
2. Visual check: On hero pages (/, /opplevelser, /om-oss, /kontakt), header starts transparent with cream text, transitions to cream floating pill on scroll
3. Visual check: On non-hero pages (/produkter, /blogg), header is cream at all times, becomes floating pill on scroll
4. All interactive elements (nav links, cart, login, hamburger) maintain correct color contrast in both states
</verification>

<success_criteria>
- No `bg-forest` applied to the scrolled header state
- `showDarkHeader` variable controls all color decisions
- MegaMenuNav receives `transparent={showDarkHeader}` instead of `transparent={isTransparent}`
- Build passes
</success_criteria>

<output>
After completion, create `.planning/quick/260411-eus-redesign-header-to-floating-pill-shaped-/260411-eus-SUMMARY.md`
</output>
