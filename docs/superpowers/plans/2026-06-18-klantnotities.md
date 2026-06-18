# Klantnotities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persoonlijke web-app voor klantgesprekken en actiepunten — Google-authenticatie, Supabase-database, auto-deploy via GitHub naar Vercel.

**Architecture:** Next.js 14 App Router. API routes (niet Server Actions) handelen CRUD af zodat ze met Jest testbaar zijn. NextAuth.js v4 beheert Google OAuth met een email-allowlist in de `signIn` callback. React client components fetchen de API routes. Supabase service role key wordt alleen server-side gebruikt.

**Tech Stack:** Next.js 14, NextAuth.js v4, @supabase/supabase-js v2, Tailwind CSS 3, TypeScript 5, Jest + React Testing Library

---

## File map

```
meetings-tool/
├── app/
│   ├── layout.tsx                        # Root layout — wraps met SessionProvider
│   ├── page.tsx                          # Redirect: /app als ingelogd, anders /login
│   ├── providers.tsx                     # 'use client' SessionProvider wrapper
│   ├── login/
│   │   └── page.tsx                      # Login-scherm (Google-knop)
│   ├── app/
│   │   ├── layout.tsx                    # App-shell: sidebar + main
│   │   ├── page.tsx                      # Redirect naar eerste klant of leeg scherm
│   │   └── [clientId]/
│   │       └── page.tsx                  # Notitie-feed van geselecteerde klant
│   └── api/
│       ├── auth/[...nextauth]/route.ts   # NextAuth handler
│       ├── clients/
│       │   ├── route.ts                  # GET (lijst), POST (aanmaken)
│       │   └── [id]/route.ts             # PATCH (hernoemen), DELETE
│       └── meetings/
│           ├── route.ts                  # GET (per clientId), POST (aanmaken)
│           └── [id]/route.ts             # PATCH (bewerken), DELETE
├── components/
│   ├── Sidebar.tsx                       # Klantenlijst, zoek, toevoegen/bewerken/verwijderen
│   ├── ClientForm.tsx                    # Overlay: klant toevoegen of hernoemen
│   ├── NotesFeed.tsx                     # Meeting-feed met header voor geselecteerde klant
│   ├── NoteCard.tsx                      # Één meeting-kaart
│   └── MeetingForm.tsx                   # Overlay: nieuwe of bewerkte meeting
├── lib/
│   ├── auth.ts                           # NextAuth opties (Google provider + email check)
│   ├── supabase.ts                       # Supabase server-side client (service role)
│   └── colors.ts                         # Kleurpalet-util: index → { bg, text }
├── types/
│   └── index.ts                          # Client en Meeting TypeScript types
├── middleware.ts                          # Beschermt /app/* routes
├── supabase/migrations/001_initial.sql   # DB-schema
├── __tests__/
│   ├── lib/colors.test.ts
│   ├── api/clients.test.ts
│   └── api/meetings.test.ts
├── jest.config.ts
├── jest.setup.ts
├── .env.example
└── .env.local                            # Geheimen — NIET committen
```

---

### Task 1: Project scaffolden + dependencies installeren

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.env.example`
- Create: `.env.local`

- [ ] **Stap 1: Maak Next.js app aan**

```bash
npx create-next-app@14 meetings-tool \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd meetings-tool
```

Verwacht: project aangemaakt met Next.js 14, TypeScript, Tailwind, App Router.

- [ ] **Stap 2: Installeer runtime dependencies**

```bash
npm install next-auth@4 @supabase/supabase-js@2
```

- [ ] **Stap 3: Installeer test dependencies**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Stap 4: Maak jest.config.ts**

```ts
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Stap 5: Maak jest.setup.ts**

```ts
// jest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Stap 6: Voeg test scripts toe aan package.json**

Voeg toe aan het `scripts`-object in `package.json`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Stap 7: Maak .env.example**

```
# .env.example
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=vervang-dit-met-een-random-string

GOOGLE_CLIENT_ID=jouw-google-client-id
GOOGLE_CLIENT_SECRET=jouw-google-client-secret

ALLOWED_EMAIL=jouw@email.com

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key
```

- [ ] **Stap 8: Maak .env.local** (vul echte waarden in — NIET committen)

```bash
cp .env.example .env.local
```

Controleer dat `.gitignore` al `.env.local` bevat (create-next-app voegt dit automatisch toe).

- [ ] **Stap 9: Initialiseer git en push naar GitHub**

```bash
git add .
git commit -m "chore: initial Next.js scaffold"
```

Maak een nieuwe GitHub-repo aan op github.com, dan:
```bash
git remote add origin https://github.com/JOUW_USERNAME/meetings-tool.git
git branch -M main
git push -u origin main
```

- [ ] **Stap 10: Controleer dev server**

```bash
npm run dev
```

Verwacht: server draait op http://localhost:3000, geen errors.

---

### Task 2: TypeScript types + kleurpalet-util

**Files:**
- Create: `types/index.ts`
- Create: `lib/colors.ts`
- Create: `__tests__/lib/colors.test.ts`

- [ ] **Stap 1: Schrijf falende test**

```ts
// __tests__/lib/colors.test.ts
import { getColor } from '@/lib/colors'

describe('getColor', () => {
  it('geeft een object terug met bg en text', () => {
    const color = getColor(0)
    expect(color).toHaveProperty('bg')
    expect(color).toHaveProperty('text')
  })

  it('wraps rond na 8 kleuren', () => {
    expect(getColor(0)).toEqual(getColor(8))
    expect(getColor(1)).toEqual(getColor(9))
  })

  it('geeft dezelfde kleur terug voor dezelfde index', () => {
    expect(getColor(3)).toEqual(getColor(3))
  })
})
```

- [ ] **Stap 2: Draai test — verwacht FAIL**

```bash
npx jest __tests__/lib/colors.test.ts
```

Verwacht: FAIL — "Cannot find module '@/lib/colors'"

- [ ] **Stap 3: Maak TypeScript types aan**

```ts
// types/index.ts
export interface Client {
  id: string
  name: string
  color: string       // tekstkleur hex, bijv. '#4f7eff'
  color_bg: string    // achtergrondkleur hex, bijv. '#1a2438'
  created_at: string
}

export interface Meeting {
  id: string
  client_id: string
  date: string        // 'YYYY-MM-DD'
  type: string
  notes: string
  actions: string[]
  created_at: string
}
```

- [ ] **Stap 4: Maak kleurpalet-util aan**

```ts
// lib/colors.ts
const PALETTE = [
  { bg: '#1a2438', text: '#4f7eff' },
  { bg: '#162216', text: '#4a8a4a' },
  { bg: '#221628', text: '#8a5a8a' },
  { bg: '#221e12', text: '#8a7040' },
  { bg: '#221414', text: '#8a4a4a' },
  { bg: '#12222e', text: '#4a8aaa' },
  { bg: '#1e1428', text: '#7a5aaa' },
  { bg: '#141e22', text: '#4a7a7a' },
]

export function getColor(index: number): { bg: string; text: string } {
  return PALETTE[index % PALETTE.length]
}
```

- [ ] **Stap 5: Draai test — verwacht PASS**

```bash
npx jest __tests__/lib/colors.test.ts
```

Verwacht: PASS — 3 tests slagen.

- [ ] **Stap 6: Commit**

```bash
git add types/index.ts lib/colors.ts __tests__/lib/colors.test.ts jest.config.ts jest.setup.ts .env.example
git commit -m "chore: types, kleurpalet-util en jest-configuratie"
```

---

### Task 3: Database-schema (Supabase)

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Stap 1: Maak Supabase-project aan**

1. Ga naar https://supabase.com — maak gratis account aan
2. Klik **New Project** (kies een naam, onthoud het database-wachtwoord)
3. Wacht ~2 minuten totdat het project klaar is

- [ ] **Stap 2: Schrijf het migration-bestand**

```sql
-- supabase/migrations/001_initial.sql

create table clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null,
  color_bg text not null,
  created_at timestamptz default now() not null
);

create table meetings (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  date date not null,
  type text not null default '',
  notes text not null default '',
  actions text[] not null default '{}',
  created_at timestamptz default now() not null
);

create index meetings_client_id_idx on meetings(client_id);
create index meetings_date_idx on meetings(date desc);
```

- [ ] **Stap 3: Voer migration uit in Supabase**

1. Ga naar het Supabase-dashboard → **SQL Editor**
2. Plak de inhoud van `supabase/migrations/001_initial.sql`
3. Klik **Run**
4. Verwacht: "Success. No rows returned"

- [ ] **Stap 4: Kopieer verbindingsgegevens naar .env.local**

In het Supabase-dashboard → **Settings → API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- **service_role** sleutel (geheim) → `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

- [ ] **Stap 5: Commit migration-bestand**

```bash
git add supabase/
git commit -m "chore: database-migratie met clients en meetings tabellen"
```

---

### Task 4: Supabase client

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Stap 1: Maak Supabase server-side client aan**

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Alleen server-side — gebruikt service role key, nooit naar de browser sturen
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

- [ ] **Stap 2: Controleer dat de dev server nog start**

```bash
npm run dev
```

Verwacht: server start zonder errors.

- [ ] **Stap 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: Supabase server-client"
```

---

### Task 5: NextAuth-authenticatie

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`
- Create: `app/login/page.tsx`
- Create: `app/providers.tsx`
- Modify: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Stap 1: Stel Google OAuth in**

1. Ga naar https://console.cloud.google.com
2. Maak een project aan (of gebruik bestaand)
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Kopieer **Client ID** → `GOOGLE_CLIENT_ID` in `.env.local`
7. Kopieer **Client Secret** → `GOOGLE_CLIENT_SECRET` in `.env.local`
8. Genereer een secret: `openssl rand -base64 32` → `NEXTAUTH_SECRET` in `.env.local`
9. Zet `ALLOWED_EMAIL` op jouw Google-emailadres in `.env.local`

- [ ] **Stap 2: Maak NextAuth-configuratie**

```ts
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return user.email === process.env.ALLOWED_EMAIL
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
```

- [ ] **Stap 3: Maak NextAuth route handler**

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Stap 4: Maak middleware**

```ts
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: ['/app/:path*'],
}
```

- [ ] **Stap 5: Maak login-pagina**

```tsx
// app/login/page.tsx
'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-80 bg-[#161616] border border-[#222] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-[#1a2438] rounded-xl flex items-center justify-center mx-auto mb-5">
          <div className="w-3 h-3 rounded-full bg-[#4f7eff]" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Klantnotities</h1>
        <p className="text-sm text-[#4a4a4a] mb-7 leading-relaxed">
          Jouw persoonlijke overzicht van klantgesprekken en actiepunten
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/app' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-sm text-[#c0c0c0] hover:border-[#3a3a3a] transition-colors"
        >
          <span
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: 'conic-gradient(#4285f4 0deg 90deg, #34a853 90deg 180deg, #fbbc05 180deg 270deg, #ea4335 270deg 360deg)' }}
          />
          Inloggen met Google
        </button>
        <p className="text-xs text-[#2e2e2e] mt-4">Alleen jouw account heeft toegang</p>
      </div>
    </div>
  )
}
```

- [ ] **Stap 6: Maak Providers-component (SessionProvider wrapper)**

```tsx
// app/providers.tsx
'use client'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] **Stap 7: Pas root layout aan**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Klantnotities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Stap 8: Maak root page redirect**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/app')
  redirect('/login')
}
```

- [ ] **Stap 9: Test login-flow**

```bash
npm run dev
```

1. Open http://localhost:3000 → moet redirecten naar `/login`
2. Klik "Inloggen met Google" → Google OAuth
3. Login met het toegestane emailadres → redirect naar `/app` (404 is OK, die pagina bestaat nog niet)
4. Probeer `/app` zonder login → redirect naar `/login`

- [ ] **Stap 10: Commit**

```bash
git add lib/auth.ts app/api/auth app/login app/page.tsx app/providers.tsx app/layout.tsx middleware.ts
git commit -m "feat: Google-authenticatie met email-allowlist"
```

---

### Task 6: Clients API-routes (met tests)

**Files:**
- Create: `app/api/clients/route.ts`
- Create: `app/api/clients/[id]/route.ts`
- Create: `__tests__/api/clients.test.ts`

- [ ] **Stap 1: Schrijf falende tests**

```ts
// __tests__/api/clients.test.ts
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
```

- [ ] **Stap 2: Draai tests — verwacht FAIL**

```bash
npx jest __tests__/api/clients.test.ts
```

Verwacht: FAIL — "Cannot find module '@/app/api/clients/route'"

- [ ] **Stap 3: Maak lijst/aanmaken route**

```ts
// app/api/clients/route.ts
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
```

- [ ] **Stap 4: Maak bewerken/verwijderen route**

```ts
// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('clients')
    .update({ name: body.name.trim() })
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('clients').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Stap 5: Draai tests — verwacht PASS**

```bash
npx jest __tests__/api/clients.test.ts
```

Verwacht: PASS — alle tests groen.

- [ ] **Stap 6: Commit**

```bash
git add app/api/clients __tests__/api/clients.test.ts
git commit -m "feat: clients API routes (CRUD) met tests"
```

---

### Task 7: Meetings API-routes (met tests)

**Files:**
- Create: `app/api/meetings/route.ts`
- Create: `app/api/meetings/[id]/route.ts`
- Create: `__tests__/api/meetings.test.ts`

- [ ] **Stap 1: Schrijf falende tests**

```ts
// __tests__/api/meetings.test.ts
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
```

- [ ] **Stap 2: Draai tests — verwacht FAIL**

```bash
npx jest __tests__/api/meetings.test.ts
```

Verwacht: FAIL — "Cannot find module '@/app/api/meetings/route'"

- [ ] **Stap 3: Maak lijst/aanmaken route**

```ts
// app/api/meetings/route.ts
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
```

- [ ] **Stap 4: Maak bewerken/verwijderen route**

```ts
// app/api/meetings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('meetings')
    .update({
      date: body.date,
      type: body.type,
      notes: body.notes,
      actions: body.actions,
    })
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('meetings').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Stap 5: Draai alle tests**

```bash
npx jest
```

Verwacht: PASS — alle tests groen.

- [ ] **Stap 6: Commit**

```bash
git add app/api/meetings __tests__/api/meetings.test.ts
git commit -m "feat: meetings API routes (CRUD) met tests"
```

---

### Task 8: App-layout en routing

**Files:**
- Create: `app/app/layout.tsx`
- Create: `app/app/page.tsx`
- Create: `app/app/[clientId]/page.tsx`
- Create: `components/Sidebar.tsx` (placeholder)
- Create: `components/NotesFeed.tsx` (placeholder)

- [ ] **Stap 1: Maak app-shell layout**

```tsx
// app/app/layout.tsx
import { Sidebar } from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
```

- [ ] **Stap 2: Maak app index-pagina (redirect naar eerste klant)**

```tsx
// app/app/page.tsx
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
```

- [ ] **Stap 3: Maak client notes-pagina**

```tsx
// app/app/[clientId]/page.tsx
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
```

- [ ] **Stap 4: Maak placeholder Sidebar en NotesFeed zodat de app compileert**

```tsx
// components/Sidebar.tsx
'use client'
export function Sidebar() {
  return <aside className="w-60 bg-[#0d0d0d] border-r border-[#1e1e1e] flex-shrink-0" />
}
```

```tsx
// components/NotesFeed.tsx
'use client'
import { Client, Meeting } from '@/types'
export function NotesFeed({ client, initialMeetings }: { client: Client; initialMeetings: Meeting[] }) {
  return <div className="p-6">{client.name} — {initialMeetings.length} meetings</div>
}
```

- [ ] **Stap 5: Controleer compilatie en routing**

```bash
npm run dev
```

1. Ga naar http://localhost:3000 → redirect naar /login
2. Na login → /app → leeg scherm of redirect naar eerste klant
3. Geen build-errors in terminal

- [ ] **Stap 6: Commit**

```bash
git add app/app components/Sidebar.tsx components/NotesFeed.tsx
git commit -m "feat: app-shell layout en routing"
```

---

### Task 9: Sidebar component

**Files:**
- Create: `components/ClientForm.tsx`
- Modify: `components/Sidebar.tsx`

- [ ] **Stap 1: Maak ClientForm overlay (toevoegen / hernoemen)**

```tsx
// components/ClientForm.tsx
'use client'
import { useState } from 'react'

interface ClientFormProps {
  mode: 'add' | 'rename'
  initialName?: string
  onSave: (name: string) => Promise<void>
  onClose: () => void
}

export function ClientForm({ mode, initialName = '', onSave, onClose }: ClientFormProps) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSave(name.trim())
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-80 bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#e0e0e0]">
            {mode === 'add' ? 'Nieuwe klant' : 'Klant hernoemen'}
          </span>
          <button onClick={onClose} className="text-[#3a3a3a] hover:text-[#666] text-lg leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Klantnaam"
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] placeholder:text-[#3a3a3a]"
          />
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#555] border border-[#272727] rounded-lg"
            >
              Annuleer
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-4 py-2 text-sm text-white bg-[#3a62cc] rounded-lg disabled:opacity-40"
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Stap 2: Bouw volledige Sidebar**

```tsx
// components/Sidebar.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Client } from '@/types'
import { ClientForm } from './ClientForm'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Client | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchClients() }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchClients() {
    const res = await fetch('/api/clients')
    setClients(await res.json())
  }

  async function handleAdd(name: string) {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const created: Client = await res.json()
    setClients(prev => [...prev, created])
    setShowAddForm(false)
    router.push(`/app/${created.id}`)
  }

  async function handleRename(name: string) {
    if (!renameTarget) return
    const res = await fetch(`/api/clients/${renameTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const updated: Client = await res.json()
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
    setRenameTarget(null)
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Klant "${client.name}" en alle bijbehorende meetings verwijderen?`)) return
    await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    setClients(prev => prev.filter(c => c.id !== client.id))
    setMenuOpen(null)
    router.push('/app')
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const activeId = pathname.split('/app/')[1]

  return (
    <>
      <aside className="w-60 bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col flex-shrink-0">
        {/* Topbalk */}
        <div className="px-4 pt-4 pb-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#4f7eff]" />
            <span className="text-sm font-bold text-[#e0e0e0]">Klantnotities</span>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek klant..."
            className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-[#888] outline-none focus:border-[#3a3a3a] placeholder:text-[#333]"
          />
        </div>

        {/* Klantenlijst */}
        <div className="flex-1 overflow-y-auto px-3 py-2" ref={menuRef}>
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-semibold text-[#3a3a3a] uppercase tracking-wider">Klanten</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-[10px] text-[#3a5acc] hover:text-[#4f7eff] font-medium"
            >
              + Nieuw
            </button>
          </div>

          {filtered.map(client => (
            <div key={client.id} className="relative group">
              <button
                onClick={() => router.push(`/app/${client.id}`)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 text-left transition-colors ${
                  activeId === client.id ? 'bg-[#1a2338]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background: client.color_bg, color: client.color }}
                >
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium truncate ${activeId === client.id ? 'text-white' : 'text-[#c0c0c0]'}`}>
                    {client.name}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === client.id ? null : client.id) }}
                  className="opacity-0 group-hover:opacity-100 text-[#3a3a3a] hover:text-[#666] text-sm px-1"
                >
                  ···
                </button>
              </button>

              {menuOpen === client.id && (
                <div className="absolute right-2 top-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg py-1 z-10 min-w-[7rem] shadow-xl">
                  <button
                    onClick={() => { setRenameTarget(client); setMenuOpen(null) }}
                    className="w-full px-3 py-1.5 text-xs text-left text-[#aaa] hover:bg-[#2a2a2a]"
                  >
                    Hernoemen
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="w-full px-3 py-1.5 text-xs text-left text-[#e05050] hover:bg-[#2a2a2a]"
                  >
                    Verwijderen
                  </button>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && search && (
            <p className="text-xs text-[#333] px-2 py-2">Geen klanten gevonden</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center text-[11px] text-[#666] font-semibold">
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] text-[#444] flex-1 truncate">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-[10px] text-[#333] hover:text-[#555]"
            >
              Uit
            </button>
          </div>
        </div>
      </aside>

      {showAddForm && (
        <ClientForm mode="add" onSave={handleAdd} onClose={() => setShowAddForm(false)} />
      )}
      {renameTarget && (
        <ClientForm
          mode="rename"
          initialName={renameTarget.name}
          onSave={handleRename}
          onClose={() => setRenameTarget(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Stap 3: Test sidebar in browser**

```bash
npm run dev
```

1. Login en ga naar /app
2. Klik "+ Nieuw" → ClientForm overlay verschijnt
3. Voeg een klant toe → verschijnt in sidebar, navigeert naar die klant
4. Hover over klant → "···" menu verschijnt
5. Hernoem klant → naam wordt bijgewerkt
6. Verwijder klant → verdwijnt uit sidebar

- [ ] **Stap 4: Commit**

```bash
git add components/Sidebar.tsx components/ClientForm.tsx
git commit -m "feat: Sidebar met klant CRUD"
```

---

### Task 10: NoteCard, MeetingForm en NotesFeed

**Files:**
- Create: `components/NoteCard.tsx`
- Create: `components/MeetingForm.tsx`
- Modify: `components/NotesFeed.tsx`

- [ ] **Stap 1: Maak NoteCard-component**

```tsx
// components/NoteCard.tsx
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
            className="text-[#2e2e2e] hover:text-[#666] text-sm px-1"
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
```

- [ ] **Stap 2: Maak MeetingForm overlay**

```tsx
// components/MeetingForm.tsx
'use client'
import { useState } from 'react'
import { Meeting } from '@/types'

interface MeetingFormProps {
  clientId: string
  meeting?: Meeting
  onSave: (meeting: Meeting) => void
  onClose: () => void
}

export function MeetingForm({ clientId, meeting, onSave, onClose }: MeetingFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(meeting?.date ?? today)
  const [type, setType] = useState(meeting?.type ?? '')
  const [notes, setNotes] = useState(meeting?.notes ?? '')
  const [actions, setActions] = useState<string[]>(meeting?.actions ?? [])
  const [actionInput, setActionInput] = useState('')
  const [loading, setLoading] = useState(false)

  function addAction() {
    const trimmed = actionInput.trim()
    if (!trimmed) return
    setActions(prev => [...prev, trimmed])
    setActionInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const isEdit = !!meeting
    const res = await fetch(isEdit ? `/api/meetings/${meeting.id}` : '/api/meetings', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, date, type, notes, actions }),
    })
    const saved: Meeting = await res.json()
    setLoading(false)
    onSave(saved)
  }

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <span className="text-sm font-semibold text-[#e0e0e0]">
            {meeting ? 'Meeting bewerken' : 'Nieuwe meeting'}
          </span>
          <button onClick={onClose} className="text-[#3a3a3a] hover:text-[#666] text-lg leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Datum</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc]"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Type gesprek</label>
              <input
                type="text"
                value={type}
                onChange={e => setType(e.target.value)}
                placeholder="bijv. Voortgang, Kick-off..."
                className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] placeholder:text-[#333]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Wat besproken</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Bespreekpunten, besluiten, context..."
              rows={4}
              className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] resize-none placeholder:text-[#333]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wider">Actiepunten</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={actionInput}
                onChange={e => setActionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAction() } }}
                placeholder="Voeg actiepunt toe..."
                className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#c0c0c0] outline-none focus:border-[#3a5acc] placeholder:text-[#333]"
              />
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-2 bg-[#1a2438] border border-[#263652] rounded-lg text-xs text-[#4f7eff] font-medium hover:bg-[#1e2a42]"
              >
                + Voeg toe
              </button>
            </div>
            {actions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#606060]">
                <span className="text-[#3a5acc] text-[11px]">→</span>
                <span className="flex-1">{action}</span>
                <button
                  type="button"
                  onClick={() => setActions(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-[#333] hover:text-[#e05050] text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#555] border border-[#272727] rounded-lg">
              Annuleer
            </button>
            <button
              type="submit"
              disabled={!date || loading}
              className="px-5 py-2 text-sm text-white bg-[#3a62cc] rounded-lg disabled:opacity-40 font-medium"
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Stap 3: Bouw volledige NotesFeed**

```tsx
// components/NotesFeed.tsx
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
```

- [ ] **Stap 4: Test de volledige UI in browser**

```bash
npm run dev
```

Controleer:
1. Selecteer een klant → notitie-feed met header verschijnt
2. Klik "+ Nieuwe meeting" → formulier overlay opent, datum is vandaag
3. Vul datum, type, notities en actiepunten in → Opslaan
4. Nieuwe meetingkaart verschijnt bovenaan met juiste data
5. Klik "···" op een kaart → bewerken/verwijderen menu
6. Bewerken: formulier opent met bestaande data, opslaan → kaart wordt bijgewerkt
7. Verwijderen: bevestigingsdialoog, daarna verdwijnt kaart

- [ ] **Stap 5: Draai alle tests één keer**

```bash
npx jest
```

Verwacht: PASS — alle tests groen.

- [ ] **Stap 6: Commit**

```bash
git add components/NoteCard.tsx components/MeetingForm.tsx components/NotesFeed.tsx
git commit -m "feat: NoteCard, MeetingForm en NotesFeed"
```

---

### Task 11: Deployen naar Vercel

Geen codewijzigingen — alleen configuratie.

- [ ] **Stap 1: Push alle commits**

```bash
git push origin main
```

- [ ] **Stap 2: Verbind Vercel met GitHub**

1. Ga naar https://vercel.com — maak gratis account aan
2. Klik **Add New → Project**
3. Importeer de `meetings-tool` GitHub-repo
4. Framework: **Next.js** (wordt automatisch herkend)
5. Deploy nog NIET — voeg eerst env vars toe

- [ ] **Stap 3: Voeg environment variables toe in Vercel**

In het Vercel-project → **Settings → Environment Variables**:

```
NEXTAUTH_URL              = https://jouw-app-naam.vercel.app
NEXTAUTH_SECRET           = (zelfde waarde als lokaal)
GOOGLE_CLIENT_ID          = (zelfde waarde als lokaal)
GOOGLE_CLIENT_SECRET      = (zelfde waarde als lokaal)
ALLOWED_EMAIL             = jouw@email.com
NEXT_PUBLIC_SUPABASE_URL  = (zelfde waarde als lokaal)
SUPABASE_SERVICE_ROLE_KEY = (zelfde waarde als lokaal)
```

Belangrijk: `NEXTAUTH_URL` moet de echte Vercel-URL zijn (niet localhost).

- [ ] **Stap 4: Voeg productie-redirect URI toe aan Google OAuth**

1. Ga terug naar Google Cloud Console → jouw OAuth client
2. Voeg toe aan **Authorized redirect URIs**: `https://jouw-app-naam.vercel.app/api/auth/callback/google`

- [ ] **Stap 5: Deploy**

Klik **Deploy** in Vercel. Volg de build-logs.

Verwacht: `✓ Compiled successfully`

- [ ] **Stap 6: Test de productie-app**

1. Open `https://jouw-app-naam.vercel.app`
2. Login met Google → authenticatie werkt, redirect naar `/app`
3. Maak een klant aan, voeg een meeting toe → data blijft staan na page refresh
4. Log uit en terug in → data staat er nog

- [ ] **Stap 7: Verifieer auto-deploy**

Maak een kleine wijziging en push:

```bash
# Pas de app-title aan in app/layout.tsx
git add app/layout.tsx
git commit -m "chore: test auto-deploy"
git push origin main
```

In het Vercel-dashboard moet automatisch een nieuwe deployment starten binnen enkele seconden.

---

## Alle tests tegelijk

```bash
npx jest
```

Verwacht: alle tests slagen. Geen flaky tests.
