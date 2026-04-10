---
status: awaiting_human_verify
trigger: "Checkout page at /checkout shows error 'Noe gikk galt med betalingen. Prøv igjen.' when attempting to purchase an experience"
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T00:02:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED — receipt_email: '' (empty string) is passed to Stripe API on init call, which rejects it as an invalid email address
test: ran node script calling stripe.paymentIntents.create with receipt_email: ''
expecting: verified StripeInvalidRequestError: "Invalid email address:"
next_action: await human verification that checkout now completes successfully

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Clicking the payment button should redirect to Stripe Checkout or complete the payment flow
actual: Error message "Noe gikk galt med betalingen. Prøv igjen." appears at the top of the checkout page. No Stripe redirect happens.
errors: User-facing error only — need to check server action logs and Stripe integration
reproduction: Add an experience to cart, go to /checkout, attempt payment
started: Unknown — may be related to recent changes or persistent issue

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: Stripe API version '2026-03-25.dahlia' might be invalid
  evidence: node test confirmed SDK accepts this version, it's the SDK's own default version
  timestamp: 2026-04-10T00:01:00Z

- hypothesis: Missing STRIPE_SECRET_KEY env var
  evidence: .env.local has both STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set with test keys
  timestamp: 2026-04-10T00:01:00Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-10T00:01:00Z
  checked: checkout/page.tsx initPayment() call
  found: calls createPaymentIntent({ email: '', isInit: true }, items) on mount — email is always empty string for the init call
  implication: customerEmail = '' is passed as receipt_email to stripe.paymentIntents.create

- timestamp: 2026-04-10T00:01:00Z
  checked: checkout.ts line 215
  found: receipt_email: customerEmail — no guard for empty string
  implication: Stripe API receives receipt_email: '' which fails validation

- timestamp: 2026-04-10T00:01:00Z
  checked: node test of stripe.paymentIntents.create with receipt_email: ''
  found: StripeInvalidRequestError: "Invalid email address:"
  implication: This is the exact error that triggers the catch block returning "Noe gikk galt med betalingen. Prøv igjen."

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: createPaymentIntent passes receipt_email: '' (empty string) to Stripe API during the init call (isInit: true). The checkout page calls createPaymentIntent with { email: '', isInit: true } to create a PaymentIntent before the user fills in their email. Stripe rejects empty string as an invalid email, throwing StripeInvalidRequestError, caught by the catch block which returns the user-facing error.
fix: In the paymentIntents.create call, conditionally include receipt_email only when customerEmail is truthy (non-empty string).
verification:
files_changed: [src/actions/checkout.ts]
