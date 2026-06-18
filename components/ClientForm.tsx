'use client'
import { useState } from 'react'

interface ClientFormProps {
  mode: 'add' | 'rename'
  initialName?: string
  onSave: (name: string) => Promise<void>
  onClose: () => void
}

export function ClientForm({ mode, initialName = '', onSave, onClose }: ClientFormProps) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSave(name.trim())
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-80 bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#e0e0e0]">
            {mode === 'add' ? 'Nieuwe klant' : 'Klant hernoemen'}
          </span>
          <button onClick={onClose} className="text-[#3a3a3a] hover:text-[#666] text-lg leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Klantnaam"
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] placeholder:text-[#3a3a3a]"
          />
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#555] border border-[#272727] rounded-lg"
            >
              Annuleer
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-4 py-2 text-sm text-white bg-[#3a62cc] rounded-lg disabled:opacity-40"
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
