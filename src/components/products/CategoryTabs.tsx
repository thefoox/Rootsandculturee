'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'

interface CategoryTab {
  value: string
  label: string
}

interface CategoryTabsProps {
  categories: CategoryTab[]
  activeCategory: string
}

export function CategoryTabs({ categories, activeCategory }: CategoryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabsRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === '') {
        params.delete('kategori')
      } else {
        params.set('kategori', value)
      }
      const query = params.toString()
      router.push(query ? `?${query}` : '/produkter', { scroll: false })
    },
    [router, searchParams]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const tabs = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      if (!tabs) return

      let nextIndex = index
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextIndex = (index + 1) % tabs.length
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        nextIndex = (index - 1 + tabs.length) % tabs.length
      }

      if (nextIndex !== index) {
        tabs[nextIndex].focus()
      }
    },
    []
  )

  const allTabs: CategoryTab[] = [{ value: '', label: 'Alle' }, ...categories]

  return (
    <div
      className="sticky top-0 z-10 border-b border-forest/12 bg-cream py-2"
      ref={tabsRef}
      role="tablist"
      aria-label="Produktkategorier"
    >
      <div className="mx-auto flex max-w-[1200px] gap-8 overflow-x-auto px-4 md:px-8">
        {allTabs.map((tab, index) => {
          const isActive = tab.value === activeCategory
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(tab.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`min-h-[44px] whitespace-nowrap font-body text-[15px] text-forest ${
                isActive
                  ? 'border-b-2 border-ember font-medium'
                  : 'border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
