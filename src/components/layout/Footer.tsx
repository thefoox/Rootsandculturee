import Link from 'next/link'
import Image from 'next/image'
import { footerColumns } from '@/lib/navigation'
import { NewsletterSignup } from './NewsletterSignup'

export function Footer() {
  return (
    <footer className="border-t border-forest/10 bg-card px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Logo + columns */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo_black.png"
                alt="Roots & Culture"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-heading text-lg font-bold text-forest">
                Roots &amp; Culture
              </span>
            </Link>
            <p className="mt-3 text-body leading-relaxed text-body/70">
              Autentiske norske naturprodukter og opplevelser.
            </p>
          </div>

          {/* Nav columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-3 text-label font-bold uppercase tracking-wider text-forest">
                {column.title}
              </h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body/70 motion-safe:transition-colors motion-safe:duration-150 hover:text-forest"
                        aria-label={`${link.label} (åpner i nytt vindu)`}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-body/70 motion-safe:transition-colors motion-safe:duration-150 hover:text-forest"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="mt-10 border-t border-forest/8 pt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-2 text-label font-bold uppercase tracking-wider text-forest">
                Nyhetsbrev
              </h2>
              <p className="text-body/70 max-w-sm">
                Få nyheter om produkter, opplevelser og norsk natur rett i innboksen.
              </p>
            </div>
            <div className="md:min-w-[320px]">
              <NewsletterSignup />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-forest/8 pt-6 text-center text-label text-forest/40">
          &copy; {new Date().getFullYear()} Roots &amp; Culture. Alle rettigheter reservert.
        </div>
      </div>
    </footer>
  )
}
