import Link from 'next/link'
import { footerColumns } from '@/lib/navigation'

export function Footer() {
  return (
    <footer className="dark-surface bg-forest px-4 py-12 text-cream lg:px-8">
      <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-2 md:grid-cols-4">
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 font-heading text-[20px] font-bold">
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
                      className="text-[15px] text-cream/80 hover:text-cream hover:underline"
                      aria-label={`${link.label} (apner i nytt vindu)`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[15px] text-cream/80 hover:text-cream hover:underline"
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
      <div className="mx-auto mt-8 max-w-[1200px] border-t border-cream/20 pt-8 text-center text-[13px] text-cream/60">
        &copy; {new Date().getFullYear()} Roots &amp; Culture. Alle rettigheter reservert.
      </div>
    </footer>
  )
}
