'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
      <div className="w-80 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-[var(--accent-bg)] rounded-xl flex items-center justify-center mx-auto mb-5">
          <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Klantnotities</h1>
        <p className="text-sm text-[var(--text-muted)] mb-7 leading-relaxed">
          Jouw persoonlijke overzicht van klantgesprekken en actiepunten
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/app' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl text-sm text-[var(--text-secondary)] hover:border-[var(--border-focus)] transition-colors"
        >
          <span
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: 'conic-gradient(#4285f4 0deg 90deg, #34a853 90deg 180deg, #fbbc05 180deg 270deg, #ea4335 270deg 360deg)' }}
          />
          Inloggen met Google
        </button>
        <p className="text-xs text-[var(--text-very-muted)] mt-4">Alleen jouw account heeft toegang</p>
      </div>
    </div>
  )
}
