/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/clients/route'
import { PATCH, DELETE } from '@/app/api/clients/[id]/route'
import { NextRequest } from 'next/server'

const mockClient = {
  id: '1',
  name: 'Anne&Max',
  color: '#4f7eff',
  color_bg: '#1a2438',
  created_at: '2025-01-01T00:00:00Z',
}

jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }))
jest.mock('@/lib/colors', () => ({ getColor: jest.fn(() => ({ bg: '#1a2438', text: '#4f7eff' })) }))

const { supabase } = require('@/lib/supabase')

beforeEach(() => jest.clearAllMocks())

describe('GET /api/clients', () => {
  it('geeft klantenlijst terug met status 200', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [mockClient], error: null }),
      }),
    })
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].name).toBe('Anne&Max')
  })

  it('geeft 500 terug bij een database-fout', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    })
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/clients', () => {
  it('maakt een klant aan en geeft 201 terug', async () => {
    const newClient = { ...mockClient, id: '2', name: 'Goeie Zaak' }
    supabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockClient], error: null }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: newClient, error: null }),
          }),
        }),
      })
    const req = new NextRequest('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Goeie Zaak' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.name).toBe('Goeie Zaak')
  })

  it('geeft 400 terug als naam ontbreekt', async () => {
    const req = new NextRequest('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/clients/[id]', () => {
  it('hernoemt een klant en geeft 200 terug', async () => {
    const updated = { ...mockClient, name: 'Nieuwe Naam' }
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      }),
    })
    const req = new NextRequest('http://localhost/api/clients/1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Nieuwe Naam' }),
    })
    const res = await PATCH(req, { params: { id: '1' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.name).toBe('Nieuwe Naam')
  })
})

describe('DELETE /api/clients/[id]', () => {
  it('verwijdert een klant en geeft 204 terug', async () => {
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    })
    const req = new NextRequest('http://localhost/api/clients/1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: '1' } })
    expect(res.status).toBe(204)
  })
})
