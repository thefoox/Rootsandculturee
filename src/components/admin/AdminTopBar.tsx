'use client'

import { Menu } from 'lucide-react'

interface AdminTopBarProps {
  onMenuClick: () => void
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  return (
    <div className="flex h-[56px] items-center bg-white border-b border-forest/12 px-4 md:hidden">
      <button
        onClick={onMenuClick}
        className="flex h-[44px] w-[44px] items-center justify-center text-forest"
        aria-label="Åpne admin-meny"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <span className="flex-1 text-center font-body text-body text-forest">
        Admin
      </span>
      <div className="w-[44px]" aria-hidden="true" />
    </div>
  )
}
