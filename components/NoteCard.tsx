'use client'
import { useState } from 'react'
import { Meeting } from '@/types'

interface NoteCardProps {
  meeting: Meeting
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
}

export function NoteCard({ meeting, onEdit, onDelete }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const formattedDate = new Date(meeting.date + 'T00:00:00').toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden hover:border-[var(--border-menu)] transition-colors">
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-card-header)] border-b border-[var(--border-primary)]">
        <span className="text-xs font-semibold text-[var(--text-muted)]">{formattedDate}</span>
        {meeting.type && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--badge-border)]">
            {meeting.type}
          </span>
        )}
        <div className="ml-auto relative">
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm px-1"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 bg-[var(--bg-menu)] border border-[var(--border-menu)] rounded-lg py-1 z-10 min-w-[7rem] shadow-lg">
              <button
                onClick={() => { onEdit(meeting); setMenuOpen(false) }}
                className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              >
                Bewerken
              </button>
              <button
                onClick={() => { onDelete(meeting.id); setMenuOpen(false) }}
                className="w-full px-3 py-1.5 text-xs text-left text-[var(--danger)] hover:bg-[var(--bg-hover)]"
              >
                Verwijderen
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3.5">
        {meeting.notes && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3 whitespace-pre-wrap">{meeting.notes}</p>
        )}
        {meeting.actions.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-2">
              Actiepunten
            </div>
            {meeting.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <span className="text-[var(--accent)] text-[11px] mt-0.5 flex-shrink-0">→</span>
                <span className="text-[13px] text-[var(--text-muted)] leading-snug">{action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
