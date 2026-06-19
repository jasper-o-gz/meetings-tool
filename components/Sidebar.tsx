'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Client } from '@/types'
import { ClientForm } from './ClientForm'
import { useTheme } from '@/lib/theme'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, toggle } = useTheme()
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
      <aside className="w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)] flex flex-col flex-shrink-0">
        {/* Topbalk */}
        <div className="px-4 pt-4 pb-3 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">Klantnotities</span>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek klant..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-placeholder)]"
          />
        </div>

        {/* Klantenlijst */}
        <div className="flex-1 overflow-y-auto px-3 py-2" ref={menuRef}>
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-semibold text-[var(--text-very-muted)] uppercase tracking-wider">Klanten</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-[10px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
            >
              + Nieuw
            </button>
          </div>

          {filtered.map(client => (
            <div key={client.id} className="relative group">
              <button
                onClick={() => router.push(`/app/${client.id}`)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 text-left transition-colors ${
                  activeId === client.id ? 'bg-[var(--bg-active)]' : 'hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background: client.color_bg, color: client.color }}
                >
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium truncate ${activeId === client.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {client.name}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === client.id ? null : client.id) }}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-very-muted)] hover:text-[var(--text-muted)] text-sm px-1"
                >
                  ···
                </button>
              </button>

              {menuOpen === client.id && (
                <div className="absolute right-2 top-8 bg-[var(--bg-menu)] border border-[var(--border-menu)] rounded-lg py-1 z-10 min-w-[7rem] shadow-xl">
                  <button
                    onClick={() => { setRenameTarget(client); setMenuOpen(null) }}
                    className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  >
                    Hernoemen
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="w-full px-3 py-1.5 text-xs text-left text-[var(--danger)] hover:bg-[var(--bg-hover)]"
                  >
                    Verwijderen
                  </button>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && search && (
            <p className="text-xs text-[var(--text-placeholder)] px-2 py-2">Geen klanten gevonden</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-primary)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--bg-input)] border border-[var(--border-input)] flex items-center justify-center text-[11px] text-[var(--text-muted)] font-semibold">
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] flex-1 truncate">{session?.user?.email}</span>
            <button
              onClick={toggle}
              className="text-[10px] text-[var(--text-very-muted)] hover:text-[var(--text-muted)] mr-2"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-[10px] text-[var(--text-very-muted)] hover:text-[var(--text-muted)]"
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
