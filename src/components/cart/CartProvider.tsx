'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { loadCart, saveCart } from '@/lib/cart'
import type { CartItem } from '@/types'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, experienceDateId?: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

function getItemKey(item: { id: string; experienceDateId?: string | null }): string {
  return item.experienceDateId ? `${item.id}:${item.experienceDateId}` : item.id
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount (SSR-safe)
  useEffect(() => {
    setItems(loadCart())
    setMounted(true)
  }, [])

  // Persist to localStorage on every change (after initial mount)
  useEffect(() => {
    if (mounted) {
      saveCart(items)
    }
  }, [items, mounted])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = getItemKey(item)
      const existing = prev.find((i) => getItemKey(i) === key)

      if (existing) {
        // For experiences, don't increase quantity (always 1 per D-11)
        if (existing.type === 'experience') return prev
        // For products, increase quantity
        return prev.map((i) =>
          getItemKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }

      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string, experienceDateId?: string) => {
    setItems((prev) =>
      prev.filter((i) => getItemKey(i) !== getItemKey({ id, experienceDateId }))
    )
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        // Experience items always stay at quantity 1 (D-11)
        if (i.type === 'experience') return i
        return { ...i, quantity }
      })
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
