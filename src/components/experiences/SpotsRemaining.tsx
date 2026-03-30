interface SpotsRemainingProps {
  available: number
  total: number
}

export function SpotsRemaining({ available, total }: SpotsRemainingProps) {
  if (available === 0) {
    return (
      <span className="font-body text-[13px] font-medium text-destructive">
        Utsolgt
      </span>
    )
  }

  if (available <= 3) {
    return (
      <span className="font-body text-[13px] font-medium text-destructive">
        Kun {available} plasser igjen!
        <span className="sr-only"> (lavt antall)</span>
      </span>
    )
  }

  return (
    <span className="font-body text-[13px] text-bark">
      {available} av {total} plasser igjen
    </span>
  )
}
