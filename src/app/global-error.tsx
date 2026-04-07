'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="nb">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#F5F0E8' }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#888',
                marginBottom: '0.5rem',
              }}
            >
              Kritisk feil
            </p>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#1C3A2E',
                marginBottom: '1rem',
              }}
            >
              Noe gikk alvorlig galt
            </h1>
            <p style={{ color: '#444', marginBottom: '2rem' }}>
              Beklager, en uventet feil oppstod. Prøv å laste siden på nytt.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#1C3A2E',
                color: '#F5F0E8',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Prøv igjen
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
