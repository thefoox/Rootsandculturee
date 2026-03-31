import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string // undefined = current page (not linked)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Always start with "Hjem" linking to "/"
  const allItems: BreadcrumbItem[] = [{ label: 'Hjem', href: '/' }, ...items]

  return (
    <nav aria-label="Brodsmuler">
      <ol className="flex flex-wrap items-center gap-1 text-[13px]">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-bark/50" aria-hidden="true">
                  &#8250;
                </span>
              )}
              {isLast || !item.href ? (
                <span className="font-medium text-forest">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-bark motion-safe:transition-colors motion-safe:duration-100 hover:text-forest hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
