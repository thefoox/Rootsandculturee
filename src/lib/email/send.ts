import 'server-only'
import { resend, FROM_EMAIL } from './resend'

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}): Promise<void> {
  if (!resend) {
    console.warn('Resend not configured — skipping email send')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    })
  } catch (err) {
    console.error('Email send error:', err)
  }
}
