# Brand Icons for Roots & Culture

## Context

Roots & Culture uses 28 generic lucide-react icons across the site. The product categories, experience categories, and brand values deserve custom icons that reinforce the earthy, Norwegian nature brand identity. This spec covers generating 9 custom icons using design-lab (OpenAI gpt-image-1.5), vectorizing them with vtracer, and integrating them into the codebase.

## Icons (9 total)

### Product Categories (3)

| Name | File | Description | Replaces |
|------|------|-------------|----------|
| Drikke | `drikke.svg` | Traditional Norwegian beverages | `Wine` (lucide) |
| Kaffe og te | `kaffe-te.svg` | Hand-picked coffee and herbal tea | `Coffee` (lucide) |
| Naturprodukter | `naturprodukter.svg` | Authentic Norwegian nature products | `Leaf` (lucide) |

### Experience Categories (3)

| Name | File | Description | Replaces |
|------|------|-------------|----------|
| Naturretreater | `retreat.svg` | Peace and immersion in nature | `Mountain` (lucide) |
| Kurs | `kurs.svg` | Traditions and handicraft courses | `BookOpen` (lucide) |
| Matopplevelser | `matopplevelse.svg` | Norwegian food culture experiences | `UtensilsCrossed` (lucide) |

### Brand Values (3)

| Name | File | Description | Replaces |
|------|------|-------------|----------|
| Natur | `natur.svg` | Respect for Norwegian nature | `Leaf` (lucide) |
| Autentisitet | `autentisitet.svg` | Authentic and genuine | `Heart` (lucide) |
| Fellesskap | `fellesskap.svg` | Connecting people together | `Users` (lucide) |

## Visual Style

- **Approach:** Flat illustration + minimalist symbol hybrid
- **Primary color:** Dark green (`#1B4332` / forest)
- **Background:** Transparent
- **Detail level:** Simple, clear shapes that work from 20px to 64px+
- **Constraints:** No shadows, no gradients, no fine details that disappear at small sizes
- **Consistency:** All 9 icons share the same visual language and line weight

## File Structure

```
public/
  icons/
    png/           # Generated PNGs (intermediate, kept as reference)
    drikke.svg
    kaffe-te.svg
    naturprodukter.svg
    retreat.svg
    kurs.svg
    matopplevelse.svg
    natur.svg
    autentisitet.svg
    fellesskap.svg
```

## Generation Workflow

1. Generate "Natur" icon as style reference using design-lab
2. User approves the style
3. Generate remaining 8 icons using the same style prompt
4. Vectorize all 9 PNGs to SVG using vtracer
5. Place SVGs in `public/icons/`

## Code Changes

### 1. `src/lib/navigation.ts`
Update icon string values to match new filenames:
- `wine` -> `drikke`
- `coffee` -> `kaffe-te`
- `leaf` -> `naturprodukter`
- `mountain` -> `retreat`
- `book-open` -> `kurs`
- `utensils` -> `matopplevelse`

### 2. New: `src/components/shared/BrandIcon.tsx`
Simple component that renders an SVG icon by name at a given size. Centralizes icon rendering logic. Props: `name` (icon filename without extension), `size` (number, default 24), `className` (optional).

### 3. `src/components/layout/MegaMenuNav.tsx`
Replace lucide `iconMap` with `BrandIcon` component. Size ~20px.

### 4. `src/app/(public)/om-oss/page.tsx`
Replace lucide icons (Leaf, Heart, Users) in value cards with `BrandIcon`. Size ~28px.

## Environment

- `.env.local` contains `OPENAI_API_KEY` (already created by user)
- `vtracer` Python package (already installed by user)

## Verification

1. Visual check of each generated icon in the browser
2. Test SVGs render correctly at all three sizes (mega-menu 20px, value cards 28px, section icons 64px)
3. Verify colors match `#1B4332` after vectorization
4. Verify transparent background on all SVGs
5. Run `next build` to ensure no broken imports
