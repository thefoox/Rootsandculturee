export function formatPrice(priceInOre: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInOre / 100)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('nb-NO', { dateStyle: 'long' }).format(date)
}

export function formatDateMedium(date: Date): string {
  return new Intl.DateTimeFormat('nb-NO', { dateStyle: 'medium' }).format(date)
}
