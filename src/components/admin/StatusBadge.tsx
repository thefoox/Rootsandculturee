interface StatusBadgeProps {
  status: 'draft' | 'published'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'published') {
    return (
      <span className="inline-flex rounded-full bg-badge-easy-bg px-2 py-1 text-[13px] text-badge-easy">
        Publisert
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full border border-forest/20 bg-card px-2 py-1 text-[13px] text-body">
      Utkast
    </span>
  )
}
