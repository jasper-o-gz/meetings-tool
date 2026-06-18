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
      <div className="w-full max-w-lg bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <span className="text-sm font-semibold text-[#e0e0e0]">
            {meeting ? 'Meeting bewerken' : 'Nieuwe meeting'}
          </span>
          <button onClick={onClose} className="text-[#3a3a3a] hover:text-[#666] text-lg leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Datum</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc]"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Type gesprek</label>
              <input
                type="text"
                value={type}
                onChange={e => setType(e.target.value)}
                placeholder="bijv. Voortgang, Kick-off..."
                className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] placeholder:text-[#333]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Wat besproken</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Bespreekpunten, besluiten, context..."
              rows={4}
              className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] resize-none placeholder:text-[#333]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Actiepunten</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={actionInput}
                onChange={e => setActionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAction() } }}
                placeholder="Voeg actiepunt toe..."
                className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] placeholder:text-[#333]"
              />
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-2 bg-[#1a2438] border border-[#263652] rounded-lg text-xs text-[#4f7eff] font-medium hover:bg-[#1e2a42]"
              >
                + Voeg toe
              </button>
            </div>
            {actions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#606060]">
                <span className="text-[#3a5acc] text-[11px]">→</span>
                <span className="flex-1">{action}</span>
                <button
                  type="button"
                  onClick={() => setActions(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-[#333] hover:text-[#e05050] text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#555] border border-[#272727] rounded-lg">
              Annuleer
            </button>
            <button
              type="submit"
              disabled={!date || loading}
              className="px-5 py-2 text-sm text-white bg-[#3a62cc] rounded-lg disabled:opacity-40 font-medium"
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
