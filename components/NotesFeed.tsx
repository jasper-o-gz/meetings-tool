'use client'
import { useState } from 'react'
import { Client, Meeting } from '@/types'
import { NoteCard } from './NoteCard'
import { MeetingForm } from './MeetingForm'

interface NotesFeedProps {
  client: Client
  initialMeetings: Meeting[]
}

export function NotesFeed({ client, initialMeetings }: NotesFeedProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [showForm, setShowForm] = useState(false)
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null)

  function handleSave(saved: Meeting) {
    setMeetings(prev => {
      const exists = prev.find(m => m.id === saved.id)
      const updated = exists
        ? prev.map(m => m.id === saved.id ? saved : m)
        : [saved, ...prev]
      return updated.sort((a, b) => b.date.localeCompare(a.date))
    })
    setShowForm(false)
    setEditMeeting(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Meeting verwijderen?')) return
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    setMeetings(prev => prev.filter(m => m.id !== id))
  }

  const lastContact = meetings[0]
    ? new Date(meetings[0].date + 'T00:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
    : null

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3.5 px-6 py-4 border-b border-[#1e1e1e] flex-shrink-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-bold flex-shrink-0"
            style={{ background: client.color_bg, color: client.color }}
          >
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-[17px] font-semibold text-[#f0f0f0] leading-none tracking-tight">
              {client.name}
            </h1>
            <p className="text-xs text-[#484848] mt-1">
              {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
              {lastContact ? ` · laatste contact ${lastContact}` : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3a62cc] text-white text-sm font-medium rounded-lg hover:bg-[#4570e0] transition-colors"
          >
            + Nieuwe meeting
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          {meetings.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-[#3a3a3a] text-sm">Nog geen meetings vastgelegd</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-xs text-[#3a5acc] hover:text-[#4f7eff]"
                >
                  Voeg eerste meeting toe →
                </button>
              </div>
            </div>
          ) : (
            meetings.map(meeting => (
              <NoteCard
                key={meeting.id}
                meeting={meeting}
                onEdit={m => setEditMeeting(m)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {(showForm || editMeeting) && (
        <MeetingForm
          clientId={client.id}
          meeting={editMeeting ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditMeeting(null) }}
        />
      )}
    </>
  )
}
