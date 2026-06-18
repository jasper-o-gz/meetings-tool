import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function AppPage() {
  const { data: clients } = await supabase
    .from('clients')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)

  if (clients && clients.length > 0) redirect(`/app/${clients[0].id}`)

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-[#3a3a3a] text-sm">Voeg een klant toe om te beginnen</p>
    </div>
  )
}
