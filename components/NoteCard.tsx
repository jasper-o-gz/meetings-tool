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
    <div className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden hover:border-[#2a2a2a] transition-colors">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#131313] border-b border-[#1d1d1d]">
        <span className="text-xs font-semibold text-[#4a4a4a]">{formattedDate}</span>
        {meeting.type && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#162216] text-[#4a7a4a] border border-[#1e321e]">
            {meeting.type}
          </span>
        )}
        <div className="ml-auto relative">
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="text-[#555] hover:text-[#999] text-sm px-1"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg py-1 z-10 min-w-[7rem] shadow-lg">
              <button
                onClick={() => { onEdit(meeting); setMenuOpen(false) }}
                className="w-full px-3 py-1.5 text-xs text-left text-[#aaa] hover:bg-[#2a2a2a]"
              >
                Bewerken
              </button>
              <button
                onClick={() => { onDelete(meeting.id); setMenuOpen(false) }}
                className="w-full px-3 py-1.5 text-xs text-left text-[#e05050] hover:bg-[#2a2a2a]"
              >
                Verwijderen
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3.5">
        {meeting.notes && (
          <p className="text-sm text-[#787878] leading-relaxed mb-3 whitespace-pre-wrap">{meeting.notes}</p>
        )}
        {meeting.actions.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#3a5acc] mb-2">
              Actiepunten
            </div>
            {meeting.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <span className="text-[#3a5acc] text-[11px] mt-0.5 flex-shrink-0">→</span>
                <span className="text-[13px] text-[#686868] leading-snug">{action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
