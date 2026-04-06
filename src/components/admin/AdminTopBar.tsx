'use client'

interface AdminTopBarProps {
  onMenuClick: () => void
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  return (
    <div className="dark-surface flex h-[56px] items-center bg-admin-sidebar px-4 md:hidden">
      <button
        onClick={onMenuClick}
        className="flex h-[44px] w-[44px] items-center justify-center text-cream"
        aria-label="Åpne admin-meny"
      >
        <span className="text-xl" aria-hidden="true">☰</span>
      </button>
      <span className="flex-1 text-center font-body text-body text-cream">
        Admin
      </span>
      <div className="w-[44px]" aria-hidden="true" />
    </div>
  )
}
