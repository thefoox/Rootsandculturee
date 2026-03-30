'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Wine, Coffee, Leaf, Mountain, BookOpen, UtensilsCrossed } from 'lucide-react'
import { mainNavItems } from '@/lib/navigation'

// Map icon string identifiers to lucide-react components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wine: Wine,
  coffee: Coffee,
  leaf: Leaf,
  mountain: Mountain,
  'book-open': BookOpen,
  utensils: UtensilsCrossed,
}

export function MegaMenuNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLUListElement>(null)
  const dropdownRefs = useRef<(HTMLAnchorElement | null)[]>([])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIndex(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Arrow key handler for dropdown menu items
  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent, itemIndex: number, totalItems: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (itemIndex + 1) % totalItems
      dropdownRefs.current[nextIndex]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (itemIndex - 1 + totalItems) % totalItems
      dropdownRefs.current[prevIndex]?.focus()
    } else if (e.key === 'Escape') {
      setOpenIndex(null)
    }
  }, [])

  return (
    <ul ref={navRef} className="flex items-center gap-1" role="menubar">
      {mainNavItems.map((item, index) => {
        const hasChildren = item.children && item.children.length > 0
        const isOpen = openIndex === index

        return (
          <li
            key={item.href}
            className="relative"
            role="none"
            onMouseEnter={() => hasChildren && setOpenIndex(index)}
            onMouseLeave={() => hasChildren && setOpenIndex(null)}
          >
            {hasChildren ? (
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 text-[15px] text-forest hover:underline"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpenIndex(isOpen ? null : index)
                  } else if (e.key === 'ArrowDown' && !isOpen) {
                    e.preventDefault()
                    setOpenIndex(index)
                    // Focus first dropdown item after opening
                    setTimeout(() => dropdownRefs.current[0]?.focus(), 50)
                  }
                }}
              >
                {item.label}
                <svg
                  className={`h-4 w-4 motion-safe:transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <Link
                href={item.href}
                className="block px-3 py-2 text-[15px] text-forest hover:underline"
                role="menuitem"
              >
                {item.label}
              </Link>
            )}

            {/* Dropdown panel -- multi-column with icon areas per D-15 and UI-SPEC */}
            {hasChildren && isOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-0 w-[520px] rounded-b-lg border border-forest/15 bg-cream shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                role="menu"
              >
                <ul className="grid grid-cols-2 gap-1 p-4">
                  {item.children!.map((child, childIndex) => {
                    const IconComponent = child.icon ? iconMap[child.icon] : null

                    return (
                      <li key={child.href} role="none">
                        <Link
                          href={child.href}
                          className="flex items-start gap-3 rounded-md px-3 py-3 hover:bg-card"
                          role="menuitem"
                          ref={(el) => { dropdownRefs.current[childIndex] = el }}
                          onClick={() => setOpenIndex(null)}
                          onKeyDown={(e) => handleDropdownKeyDown(e, childIndex, item.children!.length)}
                        >
                          {/* Icon area: 48px placeholder per UI-SPEC mega-menu spec */}
                          {IconComponent && (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-card">
                              <IconComponent className="h-5 w-5 text-forest" />
                            </div>
                          )}
                          <div>
                            <span className="block text-[15px] font-medium text-forest">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="block text-[13px] text-bark">
                                {child.description}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
