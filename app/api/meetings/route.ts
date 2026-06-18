import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) return NextResponse.json({ error: 'clientId is verplicht' }, { status: 400 })

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.client_id || !body.date) {
    return NextResponse.json({ error: 'client_id en date zijn verplicht' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      client_id: body.client_id,
      date: body.date,
      type: body.type ?? '',
      notes: body.notes ?? '',
      actions: body.actions ?? [],
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
