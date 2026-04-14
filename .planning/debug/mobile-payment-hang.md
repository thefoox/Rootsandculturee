---
status: awaiting_human_verify
trigger: "Betaling via mobil (Chrome/Android) henger seg opp — spinner som aldri stopper. Aldri fungert på mobil, fungerer på desktop."
created: 2026-04-12T00:00:00Z
updated: 2026-04-12T00:02:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED AND FIXED
test: code review of all changed paths — redirect-return handler reads payment_intent+redirect_status params, skips re-init, routes to confirmation modal
expecting: awaiting human verification on mobile device
next_action: user tests on Chrome/Android

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Stripe Elements-skjema vises direkte på checkout-siden og betaling fullføres
actual: Spinner som aldri stopper — siden viser lasting uten å gå videre til betaling
errors: Ingen kjente feilmeldinger rapportert
reproduction: Gå til checkout på mobil (Chrome/Android), trykk betal — spinner spinner evig
started: Har aldri fungert på mobil. Fungerer på desktop.

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: CSS overflow or z-index blocking the form on mobile
  evidence: globals.css has no overflow:hidden on body; MobileOrderSummary uses fixed positioning but doesn't overlay the form area
  timestamp: 2026-04-12T00:01:00Z

- hypothesis: Stripe.js loadStripe fails silently on mobile
  evidence: getStripe() uses standard loadStripe — no mobile-specific issues; the form renders (user gets to step 2 and presses submit)
  timestamp: 2026-04-12T00:01:00Z

- hypothesis: loading state in CheckoutForm never cleared (e.g. missing setLoading(false))
  evidence: There are missing setLoading(false) paths (coveredByGiftCard path), but the primary mobile issue is a redirect — the component unmounts entirely during redirect, so loading state is irrelevant on return
  timestamp: 2026-04-12T00:01:00Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-12T00:01:00Z
  checked: CheckoutForm.tsx handleSubmit — stripe.confirmPayment call
  found: redirect: 'if_required' with return_url: `${window.location.origin}/checkout`
  implication: On mobile, 3DS and wallet payments (common on Norwegian cards) trigger a full browser redirect. The component unmounts; on return Stripe appends ?payment_intent=pi_xxx&redirect_status=succeeded to the URL.

- timestamp: 2026-04-12T00:01:00Z
  checked: checkout/page.tsx — entire file
  found: No useSearchParams, no searchParams prop, no URLSearchParams reading. The page unconditionally runs initPayment() on mount if items exist.
  implication: After redirect-return, the page ignores the successful payment params and re-initialises a new PaymentIntent from scratch, showing "Laster betalingsskjema..." forever (or until the new PI is created).

- timestamp: 2026-04-12T00:01:00Z
  checked: grep across all src/ files for useSearchParams, payment_intent, redirect_status
  found: Zero occurrences in checkout components. Only used in product filters (CategoryTabs.tsx).
  implication: Confirms no Stripe return-URL handling exists anywhere.

- timestamp: 2026-04-12T00:01:00Z
  checked: CheckoutForm.tsx handleSubmit — all setLoading(false) paths
  found: Missing setLoading(false) in coveredByGiftCard path (minor secondary bug). Primary mobile issue is the redirect.
  implication: Secondary bug to fix alongside the main one.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: checkout/page.tsx has no handler for Stripe's redirect-return URL parameters (?payment_intent=pi_xxx&redirect_status=succeeded). On mobile, stripe.confirmPayment() with redirect:'if_required' triggers a full browser redirect for 3DS/wallet payments. On return, the page ignores the payment result and re-runs initPayment(), showing "Laster betalingsskjema..." indefinitely.
fix: Add useSearchParams in checkout/page.tsx to detect Stripe return params on mount. If redirect_status=succeeded, set paymentIntentId from the URL param to show the confirmation modal. If failed, show an error. Also fix missing setLoading(false) in coveredByGiftCard path in CheckoutForm.tsx.
verification: self-verified — redirect handler reads params before initPayment guard skips re-init; confirmation modal renders on success; error shown + params stripped on failure
files_changed:
  - src/app/(public)/checkout/page.tsx
  - src/components/checkout/CheckoutForm.tsx
