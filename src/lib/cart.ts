import type { CartItem } from '@/types'

const CART_KEY = 'roots-cart'

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(CART_KEY)
    if (!stored) return []
    return JSON.parse(stored) as CartItem[]
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // localStorage may be full or unavailable -- silently fail
  }
}

export function generateCartId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
