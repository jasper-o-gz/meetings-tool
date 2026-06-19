'use client'
import { useState } from 'react'
import { Meeting } from '@/types'

interface MeetingFormProps {
  clientId: string
  meeting?: Meeting
  onSave: (meeting: Meeting) => void
  onClose: () => void
}

export function MeetingForm({ clientId, meeting, onSave, onClose }: MeetingFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(meeting?.date ?? today)
  const [type, setType] = useState(meeting?.type ?? '')
  const [notes, setNotes] = useState(meeting?.notes ?? '')
  const [actions, setActions] = useState<string[]>(meeting?.actions ?? [])
  const [actionInput, setActionInput] = useState('')
  const [loading, setLoading] = useState(false)

  function addAction() {
    const trimmed = actionInput.trim()
    if (!trimmed) return
    setActions(prev => [...prev, trimmed])
    setActionInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const isEdit = !!meeting
    const res = await fetch(isEdit ? `/api/meetings/${meeting.id}` : '/api/meetings', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, date, type, notes, actions }),
    })
    const saved: Meeting = await res.json()
    setLoading(false)
    onSave(saved)
  }

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[var(--bg-modal)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-primary)]">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {meeting ? 'Meeting bewerken' : 'Nieuwe meeting'}
          </span>
          <button onClick={onClose} className="text-[var(--text-very-muted)] hover:text-[var(--text-muted)] text-lg leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[var(--label-color)] uppercase tracking-wider">Datum</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--border-focus)]"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[var(--label-color)] uppercase tracking-wider">Type gesprek</label>
              <input
                type="text"
                value={type}
                onChange={e => setType(e.target.value)}
                placeholder="bijv. Voortgang, Kick-off..."
                className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-placeholder)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[var(--label-color)] uppercase tracking-wider">Wat besproken</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Bespreekpunten, besluiten, context..."
              rows={4}
              className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--border-focus)] resize-none placeholder:text-[var(--text-placeholder)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-[var(--label-color)] uppercase tracking-wider">Actiepunten</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={actionInput}
                onChange={e => setActionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAction() } }}
                placeholder="Voeg actiepunt toe..."
                className="flex-1 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-placeholder)]"
              />
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-2 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-lg text-xs text-[var(--accent)] font-medium hover:bg-[var(--bg-active)]"
              >
                + Voeg toe
              </button>
            </div>
            {actions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="text-[var(--accent)] text-[11px]">→</span>
                <span className="flex-1">{action}</span>
                <button
                  type="button"
                  onClick={() => setActions(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-[var(--text-placeholder)] hover:text-[var(--danger)] text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[var(--text-muted)] border border-[var(--border-primary)] rounded-lg">
              Annuleer
            </button>
            <button
              type="submit"
              disabled={!date || loading}
              className="px-5 py-2 text-sm text-[var(--accent-text)] bg-[var(--accent)] rounded-lg disabled:opacity-40 font-medium"
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
