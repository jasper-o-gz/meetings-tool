/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/meetings/route'
import { PATCH, DELETE } from '@/app/api/meetings/[id]/route'
import { NextRequest } from 'next/server'

const mockMeeting = {
  id: 'm1',
  client_id: 'c1',
  date: '2025-06-12',
  type: 'Voortgang',
  notes: 'Campagne besproken',
  actions: ['Offerte sturen'],
  created_at: '2025-06-12T10:00:00Z',
}

jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }))
const { supabase } = require('@/lib/supabase')

beforeEach(() => jest.clearAllMocks())

describe('GET /api/meetings', () => {
  it('geeft meetings terug voor een clientId', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockMeeting], error: null }),
        }),
      }),
    })
    const req = new NextRequest('http://localhost/api/meetings?clientId=c1')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json[0].client_id).toBe('c1')
  })

  it('geeft 400 terug als clientId ontbreekt', async () => {
    const req = new NextRequest('http://localhost/api/meetings')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/meetings', () => {
  it('maakt een meeting aan en geeft 201 terug', async () => {
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockMeeting, error: null }),
        }),
      }),
    })
    const req = new NextRequest('http://localhost/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'c1',
        date: '2025-06-12',
        type: 'Voortgang',
        notes: 'Campagne besproken',
        actions: ['Offerte sturen'],
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('geeft 400 terug als client_id of date ontbreekt', async () => {
    const req = new NextRequest('http://localhost/api/meetings', {
      method: 'POST',
      body: JSON.stringify({ notes: 'test' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/meetings/[id]', () => {
  it('bewerkt een meeting en geeft 200 terug', async () => {
    const updated = { ...mockMeeting, notes: 'Bijgewerkte notitie' }
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      }),
    })
    const req = new NextRequest('http://localhost/api/meetings/m1', {
      method: 'PATCH',
      body: JSON.stringify({ date: '2025-06-12', type: 'Voortgang', notes: 'Bijgewerkte notitie', actions: [] }),
    })
    const res = await PATCH(req, { params: { id: 'm1' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.notes).toBe('Bijgewerkte notitie')
  })
})

describe('DELETE /api/meetings/[id]', () => {
  it('verwijdert een meeting en geeft 204 terug', async () => {
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    })
    const req = new NextRequest('http://localhost/api/meetings/m1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 'm1' } })
    expect(res.status).toBe(204)
  })
})
