import { NextResponse } from 'next/server'
import { createPaymentIntent, type CheckoutFormData } from '@/actions/checkout'
import type { CartItem } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { formData, cartItems } = body as {
      formData: CheckoutFormData
      cartItems: CartItem[]
    }

    if (!formData || !cartItems) {
      return NextResponse.json(
        { error: 'Ugyldig foresporselsdata.' },
        { status: 400 }
      )
    }

    const result = await createPaymentIntent(formData, cartItems)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ clientSecret: result.clientSecret })
  } catch (err) {
    console.error('create-payment-intent error:', err)
    return NextResponse.json(
      { error: 'Noe gikk galt. Prov igjen.' },
      { status: 500 }
    )
  }
}
