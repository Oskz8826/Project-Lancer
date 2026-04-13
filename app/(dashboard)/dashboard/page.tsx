'use client'

import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Dashboard coming soon. Auth is working.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
          <span>Role: <b style={{ color: '#fff' }}>{user?.role}</b></span>
          <span>Tier: <b style={{ color: 'var(--accent)' }}>{user?.tier}</b></span>
          <span>Currency: <b style={{ color: '#fff' }}>{user?.working_currency}</b></span>
        </div>
        <button className="btn-ghost" onClick={logout}>Sign out</button>
      </div>
    </div>
  )
}
