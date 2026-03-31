# Brand Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 9 custom brand icons using design-lab, vectorize to SVG with vtracer, and integrate into the Roots & Culture codebase replacing lucide-react category/value icons.

**Architecture:** Generate PNGs via `/design-lab` (OpenAI gpt-image-1.5), vectorize each to SVG via `/vtracer-design`, store SVGs in `public/icons/`. Create a `BrandIcon` component that renders SVGs by name. Update `MegaMenuNav` and `om-oss` page to use `BrandIcon` instead of lucide imports.

**Tech Stack:** OpenAI gpt-image-1.5 (design-lab), Python vtracer, Next.js Image, TypeScript

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `public/icons/png/*.png` | Generated PNG icons (intermediate) |
| Create | `public/icons/*.svg` | Vectorized SVG icons (final) |
| Create | `src/components/shared/BrandIcon.tsx` | Reusable icon component |
| Modify | `src/lib/navigation.ts` | Update icon string identifiers |
| Modify | `src/components/layout/MegaMenuNav.tsx` | Replace lucide iconMap with BrandIcon |
| Modify | `src/app/(public)/om-oss/page.tsx` | Replace lucide value icons with BrandIcon |

---

## Shared Style Prompt (used for all icons)

All icons share this base prompt structure for design-lab:

```
Flat minimalist icon, single dark green color (#1B4332), transparent background,
simple clean shapes, no shadows, no gradients, no fine details, works at 20px to 64px,
consistent line weight, icon style suitable for web navigation and feature cards.
[SPECIFIC SUBJECT HERE]
```

---

### Task 1: Setup — Create directories and .env.local

**Files:**
- Create: `public/icons/png/` (directory)
- Create: `public/icons/` (directory)
- Create: `.env.local`

- [ ] **Step 1: Create icon directories**

```bash
mkdir -p public/icons/png
```

- [ ] **Step 2: Create .env.local with OpenAI key**

```bash
# .env.local should contain:
OPENAI_API_KEY=<the key from the user's env.local>
```

Note: User has already created `.env.local` with the key. Verify it exists:

```bash
test -f .env.local && echo "exists" || echo "missing"
```

Expected: `exists`

- [ ] **Step 3: Verify vtracer is installed**

```bash
python3 -c "import vtracer; print('vtracer OK')"
```

Expected: `vtracer OK`

- [ ] **Step 4: Commit setup**

```bash
git add public/icons/.gitkeep
git commit -m "chore: add icon directories for brand icons"
```

---

### Task 2: Generate style reference icon — "Natur" (tree)

**Files:**
- Create: `public/icons/png/natur.png`

- [ ] **Step 1: Invoke /design-lab to generate the "Natur" icon**

Use the `/design-lab` skill with this prompt:

```
Generate a flat minimalist icon of a single tree. Dark green color (#1B4332) only,
transparent background, simple clean shapes, no shadows, no gradients, no fine details.
The tree should have a clear trunk and rounded canopy. Icon style, works at small sizes
(20px). Square format, centered.
```

Save the output to `public/icons/png/natur.png`.

- [ ] **Step 2: User reviews the style**

Show the generated icon to the user. This is the style reference for all remaining icons. Get explicit approval before continuing.

- [ ] **Step 3: If rejected, regenerate with adjusted prompt**

Iterate on the prompt until the user approves the style direction.

---

### Task 3: Generate remaining 8 icons

**Files:**
- Create: `public/icons/png/drikke.png`
- Create: `public/icons/png/kaffe-te.png`
- Create: `public/icons/png/naturprodukter.png`
- Create: `public/icons/png/retreat.png`
- Create: `public/icons/png/kurs.png`
- Create: `public/icons/png/matopplevelse.png`
- Create: `public/icons/png/autentisitet.png`
- Create: `public/icons/png/fellesskap.png`

Use `/design-lab` for each icon. All prompts start with the shared style prefix. Generate one at a time so each can be reviewed.

- [ ] **Step 1: Generate "Drikke" icon**

Prompt subject: `A bottle, simple silhouette of a traditional beverage bottle.`

Save to `public/icons/png/drikke.png`.

- [ ] **Step 2: Generate "Kaffe og te" icon**

Prompt subject: `A cup with steam rising from it, simple coffee/tea cup with 2-3 wavy steam lines.`

Save to `public/icons/png/kaffe-te.png`.

- [ ] **Step 3: Generate "Naturprodukter" icon**

Prompt subject: `A nettle plant (brennesle), simple botanical silhouette with serrated leaves on a stem.`

Save to `public/icons/png/naturprodukter.png`.

- [ ] **Step 4: Generate "Naturretreater" icon**

Prompt subject: `A spruce forest silhouette, 3-5 conifer trees of varying heights in a row.`

Save to `public/icons/png/retreat.png`.

- [ ] **Step 5: Generate "Kurs" icon**

Prompt subject: `A notepad/writing pad with a small plant growing from the top of it, combining learning with nature.`

Save to `public/icons/png/kurs.png`.

- [ ] **Step 6: Generate "Matopplevelser" icon**

Prompt subject: `A plate/dish with leaf decoration on it, a dining plate with a simple leaf motif, combining food with nature.`

Save to `public/icons/png/matopplevelse.png`.

- [ ] **Step 7: Generate "Autentisitet" icon**

Prompt subject: `Two people hugging, simple silhouette of two figures in an embrace, warm and human.`

Save to `public/icons/png/autentisitet.png`.

- [ ] **Step 8: Generate "Fellesskap" icon**

Prompt subject: `People gathered around a campfire, 3-4 simple figure silhouettes sitting around a fire, community and togetherness.`

Save to `public/icons/png/fellesskap.png`.

- [ ] **Step 9: User reviews all 8 icons**

Show all generated icons together. Regenerate any that don't match the approved style or concept.

- [ ] **Step 10: Commit PNGs**

```bash
git add public/icons/png/
git commit -m "feat: generate 9 brand icon PNGs via design-lab"
```

---

### Task 4: Vectorize all 9 icons to SVG

**Files:**
- Create: `public/icons/natur.svg`
- Create: `public/icons/drikke.svg`
- Create: `public/icons/kaffe-te.svg`
- Create: `public/icons/naturprodukter.svg`
- Create: `public/icons/retreat.svg`
- Create: `public/icons/kurs.svg`
- Create: `public/icons/matopplevelse.svg`
- Create: `public/icons/autentisitet.svg`
- Create: `public/icons/fellesskap.svg`

- [ ] **Step 1: Invoke /vtracer-design for each PNG**

Use the `/vtracer-design` skill to trace each PNG to SVG. Process all 9:

```bash
for icon in natur drikke kaffe-te naturprodukter retreat kurs matopplevelse autentisitet fellesskap; do
  echo "Vectorizing $icon..."
done
```

Each invocation of `/vtracer-design` should:
- Input: `public/icons/png/${name}.png`
- Output: `public/icons/${name}.svg`

- [ ] **Step 2: Verify SVGs exist and are non-empty**

```bash
for icon in natur drikke kaffe-te naturprodukter retreat kurs matopplevelse autentisitet fellesskap; do
  if [ -s "public/icons/${icon}.svg" ]; then
    echo "${icon}.svg OK"
  else
    echo "${icon}.svg MISSING or EMPTY"
  fi
done
```

Expected: All 9 show "OK"

- [ ] **Step 3: Visual check of SVGs in browser**

Open each SVG in a browser tab to verify colors match `#1B4332` and backgrounds are transparent.

- [ ] **Step 4: Commit SVGs**

```bash
git add public/icons/*.svg
git commit -m "feat: vectorize 9 brand icons to SVG via vtracer"
```

---

### Task 5: Create BrandIcon component

**Files:**
- Create: `src/components/shared/BrandIcon.tsx`

- [ ] **Step 1: Create the BrandIcon component**

```tsx
import Image from 'next/image'

const VALID_ICONS = [
  'drikke',
  'kaffe-te',
  'naturprodukter',
  'retreat',
  'kurs',
  'matopplevelse',
  'natur',
  'autentisitet',
  'fellesskap',
] as const

type BrandIconName = (typeof VALID_ICONS)[number]

interface BrandIconProps {
  name: BrandIconName
  size?: number
  className?: string
}

export function BrandIcon({ name, size = 24, className }: BrandIconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit src/components/shared/BrandIcon.tsx 2>&1 || true
```

Run a full type check to catch any issues:

```bash
npx tsc --noEmit
```

Expected: No errors related to BrandIcon.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/BrandIcon.tsx
git commit -m "feat: add BrandIcon component for custom SVG icons"
```

---

### Task 6: Update navigation.ts icon identifiers

**Files:**
- Modify: `src/lib/navigation.ts:19-31`

- [ ] **Step 1: Update icon strings in navigation.ts**

Change the icon values in `mainNavItems`:

```ts
// Products — update these 3 lines:
{ label: 'Drikke', href: '/produkter?kategori=drikke', description: 'Tradisjonelle norske drikker', icon: 'drikke' },
{ label: 'Kaffe og te', href: '/produkter?kategori=kaffe-te', description: 'Handplukket kaffe og urtete', icon: 'kaffe-te' },
{ label: 'Naturprodukter', href: '/produkter?kategori=naturprodukter', description: 'Ekte fra norsk natur', icon: 'naturprodukter' },

// Experiences — update these 4 lines:
{ label: 'Alle opplevelser', href: '/opplevelser', description: 'Se alle naturopplevelser', icon: 'retreat' },
{ label: 'Naturretreater', href: '/opplevelser/retreat', description: 'Ro og fordypning i naturen', icon: 'retreat' },
{ label: 'Kurs', href: '/opplevelser/kurs', description: 'Laer tradisjoner og handverk', icon: 'kurs' },
{ label: 'Matopplevelser', href: '/opplevelser/matopplevelse', description: 'Smak norsk matkultur', icon: 'matopplevelse' },
```

Note: "Alle opplevelser" reuses the `retreat` icon since there's no dedicated "all" icon.

- [ ] **Step 2: Commit**

```bash
git add src/lib/navigation.ts
git commit -m "feat: update navigation icon identifiers for brand icons"
```

---

### Task 7: Replace iconMap in MegaMenuNav with BrandIcon

**Files:**
- Modify: `src/components/layout/MegaMenuNav.tsx:1-16, 121-138`

- [ ] **Step 1: Update imports**

Replace:
```tsx
import { Wine, Coffee, Leaf, Mountain, BookOpen, UtensilsCrossed } from 'lucide-react'
```

With:
```tsx
import { BrandIcon } from '@/components/shared/BrandIcon'
```

- [ ] **Step 2: Remove the iconMap object**

Delete lines 8-16 (the entire `iconMap` const).

- [ ] **Step 3: Replace icon rendering in the dropdown**

Replace the icon rendering block (around line 121-138):

```tsx
{/* Old code */}
{IconComponent && (
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-card">
    <IconComponent className="h-5 w-5 text-forest" />
  </div>
)}
```

With:

```tsx
{child.icon && (
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-card">
    <BrandIcon name={child.icon as any} size={20} />
  </div>
)}
```

Also remove the `IconComponent` variable assignment (`const IconComponent = child.icon ? iconMap[child.icon] : null`).

- [ ] **Step 4: Verify type check passes**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Visual check in browser**

Run `npm run dev`, open the site, hover over "Produkter" and "Opplevelser" in the mega-menu. Verify the brand icons appear at the correct size inside the 48px card backgrounds.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/MegaMenuNav.tsx
git commit -m "feat: replace lucide icons with BrandIcon in MegaMenuNav"
```

---

### Task 8: Replace lucide icons on Om oss page

**Files:**
- Modify: `src/app/(public)/om-oss/page.tsx:1-34, 148-155`

- [ ] **Step 1: Update imports**

Replace:
```tsx
import { Leaf, Heart, Users } from 'lucide-react'
```

With:
```tsx
import { BrandIcon } from '@/components/shared/BrandIcon'
```

- [ ] **Step 2: Update the values array**

Replace:
```tsx
const values = [
  {
    icon: Leaf,
    title: 'Natur',
    text: 'Vi tror på kraften i norsk natur...',
  },
  {
    icon: Heart,
    title: 'Autentisitet',
    text: 'Alt vi tilbyr er ekte og gjennomtenkt...',
  },
  {
    icon: Users,
    title: 'Fellesskap',
    text: 'Vi bygger et fellesskap av naturelskere...',
  },
]
```

With:
```tsx
const values = [
  {
    icon: 'natur' as const,
    title: 'Natur',
    text: 'Vi tror på kraften i norsk natur. Alle våre produkter og opplevelser er skapt med dyp respekt for naturen, og vi jobber for å bevare de unike landskapene vi er så heldige å kalle hjem.',
  },
  {
    icon: 'autentisitet' as const,
    title: 'Autentisitet',
    text: 'Alt vi tilbyr er ekte og gjennomtenkt. Fra håndplukkede urter til nøye kuraterte opplevelser — vi kompromisser aldri på kvalitet eller genuinitet. Det du får fra oss, er alltid det ekte.',
  },
  {
    icon: 'fellesskap' as const,
    title: 'Fellesskap',
    text: 'Vi bygger et fellesskap av naturelskere som deler en lidenskap for norsk natur og kulturarv. Sammen skaper vi opplevelser som knytter mennesker nærmere hverandre og naturen rundt oss.',
  },
]
```

- [ ] **Step 3: Update the icon rendering in the values section**

Replace:
```tsx
<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
  <value.icon
    className="h-7 w-7 text-ember"
    aria-hidden="true"
  />
</div>
```

With:
```tsx
<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
  <BrandIcon name={value.icon} size={28} />
</div>
```

- [ ] **Step 4: Verify type check passes**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Visual check in browser**

Navigate to `/om-oss`. Verify the three value cards show the brand icons (tree, two people hugging, people around campfire) at 28px inside the circular backgrounds.

- [ ] **Step 6: Commit**

```bash
git add src/app/(public)/om-oss/page.tsx
git commit -m "feat: replace lucide icons with BrandIcon on Om oss page"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Check all three icon contexts visually**

1. **Mega-menu** (hover Produkter/Opplevelser): Icons at ~20px in 48px card backgrounds
2. **Om oss value cards**: Icons at 28px in circular backgrounds
3. **Resize browser** to verify icons remain crisp at different viewport widths

- [ ] **Step 3: Verify no leftover lucide category imports**

```bash
grep -n "Wine\|Coffee\|BookOpen\|UtensilsCrossed" src/components/layout/MegaMenuNav.tsx
grep -n "Leaf\|Heart\|Users" src/app/\(public\)/om-oss/page.tsx
```

Expected: No matches for either command.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git status
# If clean, no commit needed
```
