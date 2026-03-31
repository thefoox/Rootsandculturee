import type { Difficulty } from '@/types'

interface DifficultyBadgeProps {
  difficulty: Difficulty
}

const labels: Record<Difficulty, string> = {
  lett: 'Lett',
  moderat: 'Moderat',
  krevende: 'Krevende',
}

const styles: Record<Difficulty, string> = {
  lett: 'bg-badge-easy-bg text-badge-easy',
  moderat: 'bg-badge-moderate-bg text-badge-moderate',
  krevende: 'bg-badge-hard-bg text-badge-hard',
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-1 font-body text-label ${styles[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  )
}
