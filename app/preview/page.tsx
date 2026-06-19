export default function PreviewPage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', height: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f7eff' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Klantnotities</span>
          </div>
          <input placeholder="Zoek klant..." style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text-muted)', boxSizing: 'border-box' }} readOnly />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-very-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Klanten</span>
            <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 500 }}>+ Nieuw</span>
          </div>

          {[
            { name: 'Acme Corp', color: '#4f7eff', bg: '#1a2438', active: true },
            { name: 'Bakkerij De Brood', color: '#ff7f4f', bg: '#382018' },
            { name: 'Creatief Studio', color: '#4fdf7f', bg: '#183828' },
            { name: 'Delta Logistics', color: '#df4f7f', bg: '#381828' },
          ].map((client) => (
            <div key={client.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 8, marginBottom: 2, background: client.active ? 'var(--bg-active)' : 'transparent', cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: client.bg, color: client.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {client.name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: client.active ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {client.name}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-input)', border: '1px solid var(--border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>J</div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>jasper@goeiezaak.com</span>
          <span style={{ fontSize: 10, color: 'var(--text-very-muted)' }}>🌙</span>
          <span style={{ fontSize: 10, color: 'var(--text-very-muted)' }}>Uit</span>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--border-primary)', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1a2438', color: '#4f7eff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>AC</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>Acme Corp</h1>
            <p style={{ fontSize: 12, color: 'var(--text-very-muted)', margin: '4px 0 0' }}>3 meetings · laatste contact 5 juni</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            + Nieuwe meeting
          </button>
        </div>

        {/* Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              date: '5 juni 2025',
              type: 'Voortgang',
              notes: 'Besproken: nieuwe campagne voor Q3. Klant wil focussen op LinkedIn en e-mail. Budget verhoogd naar €8.000.',
              actions: ['LinkedIn strategie uitwerken voor 12 juni', 'Offerte sturen voor e-mail campagne'],
            },
            {
              date: '14 april 2025',
              type: 'Kick-off',
              notes: 'Eerste kennismaking. Acme wil hun online aanwezigheid verbeteren. Twee contactpersonen: Mark (marketing) en Lisa (CEO).',
              actions: ['Intakevragenlijst sturen', 'Concurrentieanalyse voorbereiden'],
            },
            {
              date: '2 maart 2025',
              type: 'Demo',
              notes: 'Demo van het platform gegeven. Enthousiaste reactie. Vragen over integratie met hun CRM systeem.',
              actions: [],
            },
          ].map((meeting, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card-header)', borderBottom: '1px solid var(--border-primary)' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{meeting.date}</span>
                {meeting.type && (
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--badge-bg)', color: 'var(--badge-text)', border: '1px solid var(--badge-border)' }}>
                    {meeting.type}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }}>···</span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{meeting.notes}</p>
                {meeting.actions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: 8 }}>Actiepunten</div>
                    {meeting.actions.map((action, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                        <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 2, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
