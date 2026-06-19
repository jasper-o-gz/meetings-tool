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
      <div className="w-80 bg-[var(--bg-modal)] border border-[var(--border-primary)] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-modal-header)]">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {mode === 'add' ? 'Nieuwe klant' : 'Klant hernoemen'}
          </span>
          <button onClick={onClose} className="text-[var(--text-very-muted)] hover:text-[var(--text-muted)] text-lg leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Klantnaam"
            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-placeholder)]"
          />
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--text-muted)] border border-[var(--border-primary)] rounded-lg"
            >
              Annuleer
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-4 py-2 text-sm text-[var(--accent-text)] bg-[var(--accent)] rounded-lg disabled:opacity-40"
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
