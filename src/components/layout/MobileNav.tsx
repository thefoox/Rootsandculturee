'use client'

interface MobileNavProps {
  onClose: () => void
}

export function MobileNav({ onClose }: MobileNavProps) {
  return (
    <div>
      <button onClick={onClose}>Close</button>
      MobileNav placeholder
    </div>
  )
}
