'use client'

import { useAuth, TESTER_EMAILS, PREVIEW_KEY } from '@/hooks/useAuth'

export default function TesterSwitcher() {
  const { user, previewActive } = useAuth()

  if (!user || !TESTER_EMAILS.includes(user.email)) return null

  function toggle() {
    const next = !previewActive
    localStorage.setItem(PREVIEW_KEY, String(next))
    window.location.reload()
  }

  return (
    <button
      onClick={toggle}
      title={previewActive ? 'Exit tester preview' : 'Preview as tester'}
      style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '8px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
        background: previewActive ? 'rgba(242,86,35,0.15)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${previewActive ? 'rgba(242,86,35,0.5)' : 'rgba(255,255,255,0.15)'}`,
        color: previewActive ? '#f78560' : 'rgba(255,255,255,0.5)',
        cursor: 'pointer', letterSpacing: '0.04em',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'all 0.15s',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
      {previewActive ? 'TESTER VIEW' : 'Preview tester'}
    </button>
  )
}
