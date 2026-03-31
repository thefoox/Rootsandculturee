import Link from 'next/link'
import Image from 'next/image'
import { footerColumns } from '@/lib/navigation'
import { NewsletterSignup } from './NewsletterSignup'

export function Footer() {
  return (
    <footer className="border-t border-forest/10 bg-cream px-6 py-14 lg:px-8">
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
              <span className="font-heading text-[17px] font-bold text-forest">
                Roots &amp; Culture
              </span>
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-body/70">
              Autentiske norske naturprodukter og opplevelser.
            </p>
          </div>

          {/* Nav columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-forest">
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
                        className="text-[14px] text-body/70 hover:text-forest hover:underline"
                        aria-label={`${link.label} (apner i nytt vindu)`}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[14px] text-body/70 hover:text-forest hover:underline"
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
          <div className="mx-auto max-w-md">
            <h2 className="mb-2 text-[13px] font-bold uppercase tracking-wider text-forest">
              Nyhetsbrev
            </h2>
            <p className="mb-3 text-[14px] text-body/70">
              Fa nyheter om produkter, opplevelser og norsk natur rett i innboksen.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        <div className="mt-8 border-t border-forest/8 pt-6 text-center text-[13px] text-body/50">
          &copy; {new Date().getFullYear()} Roots &amp; Culture. Alle rettigheter reservert.
        </div>
      </div>
    </footer>
  )
}
