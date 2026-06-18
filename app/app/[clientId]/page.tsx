import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { NotesFeed } from '@/components/NotesFeed'
import { Client, Meeting } from '@/types'

export default async function ClientPage({ params }: { params: { clientId: string } }) {
  const [clientResult, meetingsResult] = await Promise.all([
    supabase.from('clients').select('*').eq('id', params.clientId).single(),
    supabase.from('meetings').select('*').eq('client_id', params.clientId).order('date', { ascending: false }),
  ])
  if (clientResult.error || !clientResult.data) notFound()
  return (
    <NotesFeed
      client={clientResult.data as Client}
      initialMeetings={(meetingsResult.data ?? []) as Meeting[]}
    />
  )
}
