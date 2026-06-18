'use client'
import { Client, Meeting } from '@/types'
export function NotesFeed({ client, initialMeetings }: { client: Client; initialMeetings: Meeting[] }) {
  return <div className="p-6">{client.name} — {initialMeetings.length} meetings</div>
}
