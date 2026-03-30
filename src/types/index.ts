export interface User {
  uid: string
  email: string
  displayName: string
  role: 'customer' | 'admin'
  createdAt: Date
  lastLoginAt: Date
}

export interface SessionPayload {
  uid: string
  email: string
  role: 'customer' | 'admin'
  expiresAt: number
}

export interface AuthResult {
  success: boolean
  error?: string
}
