'use client'

import { useAuth } from '@/hooks/useAuth'

export default function AlphaBanner() {
  const { user } = useAuth()
  if (user?.tier !== 'tester') return null

  return (
    <div style={{
      padding: '7px 18px',
      background: 'rgba(251,191,36,0.08)',
      borderBottom: '0.5px solid rgba(251,191,36,0.2)',
      display: 'flex', alignItems: 'center', gap: '8px',
      flexShrink: 0,
    }}>
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#fbbf24', flexShrink: 0,
      }} />
      <span style={{ fontSize: '11px', color: 'rgba(251,191,36,0.85)' }}>
        Tester account — some features are limited or unavailable in this alpha build.
      </span>
    </div>
  )
}
