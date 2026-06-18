import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getColor } from '@/lib/colors'

export async function GET() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
  }
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .order('created_at', { ascending: true })
  const index = existing?.length ?? 0
  const color = getColor(index)

  const { data, error } = await supabase
    .from('clients')
    .insert({ name: body.name.trim(), color: color.text, color_bg: color.bg })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
