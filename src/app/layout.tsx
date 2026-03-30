import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roots & Culture',
  description: 'Autentiske norske natur- og kulturopplevelser',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  )
}
