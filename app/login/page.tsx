'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-80 bg-[#161616] border border-[#222] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-[#1a2438] rounded-xl flex items-center justify-center mx-auto mb-5">
          <div className="w-3 h-3 rounded-full bg-[#4f7eff]" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Klantnotities</h1>
        <p className="text-sm text-[#4a4a4a] mb-7 leading-relaxed">
          Jouw persoonlijke overzicht van klantgesprekken en actiepunten
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/app' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-sm text-[#c0c0c0] hover:border-[#3a3a3a] transition-colors"
        >
          <span
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: 'conic-gradient(#4285f4 0deg 90deg, #34a853 90deg 180deg, #fbbc05 180deg 270deg, #ea4335 270deg 360deg)' }}
          />
          Inloggen met Google
        </button>
        <p className="text-xs text-[#2e2e2e] mt-4">Alleen jouw account heeft toegang</p>
      </div>
    </div>
  )
}
