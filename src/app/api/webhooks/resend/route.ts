import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!adminDb) {
    return NextResponse.json(
      { error: 'Server ikke konfigurert.' },
      { status: 500 }
    )
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('RESEND_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret mangler.' },
      { status: 500 }
    )
  }

  const rawBody = await req.text()
  const headersList = await headers()

  const svixId = headersList.get('svix-id')
  const svixTimestamp = headersList.get('svix-timestamp')
  const svixSignature = headersList.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Manglende webhook-headers.' },
      { status: 400 }
    )
  }

  let payload: Record<string, unknown>
  try {
    const wh = new Webhook(webhookSecret)
    payload = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as Record<string, unknown>
  } catch (err) {
    console.error('Resend webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Ugyldig webhook-signatur.' },
      { status: 400 }
    )
  }

  try {
    await adminDb.collection('emailEvents').add({
      type: payload.type || 'unknown',
      emailId: (payload.data as Record<string, unknown>)?.email_id || '',
      to: (payload.data as Record<string, unknown>)?.to || [],
      subject: (payload.data as Record<string, unknown>)?.subject || '',
      createdAt: payload.created_at
        ? new Date(payload.created_at as string)
        : new Date(),
      loggedAt: new Date(),
      data: payload.data || {},
    })
  } catch (err) {
    console.error('Failed to log email event:', err)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
