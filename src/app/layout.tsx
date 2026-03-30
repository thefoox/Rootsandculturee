import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { Toaster } from 'sonner'
import { SkipLink } from '@/components/layout/SkipLink'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartProvider } from '@/components/cart/CartProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Roots & Culture',
  description: 'Autentiske norske natur- og kulturopplevelser',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${inter.variable} ${merriweather.variable}`}>
      <body>
        <CartProvider>
          <SkipLink />
          <Header />
          <main id="main-content">
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  )
}
