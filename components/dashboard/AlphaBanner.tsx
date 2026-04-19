'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, TESTER_EMAILS } from '@/hooks/useAuth'
import { getPocketBase } from '@/lib/pocketbase'

function fmt(s: number) {
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export default function AlphaBanner() {
  const { user } = useAuth()
  const router = useRouter()

  const [sessionEnd, setSessionEnd] = useState(0)
  const [recordId,   setRecordId]   = useState('')
  const [remaining,  setRemaining]  = useState(0)
  const [setting,    setSetting]    = useState(false)
  const [custom,     setCustom]     = useState('')

  // Fetch record + subscribe to realtime changes
  useEffect(() => {
    const pb = getPocketBase()
    pb.collection('alpha_session').getFirstListItem('').then(rec => {
      setRecordId(rec.id)
      setSessionEnd(rec.session_end ?? 0)
    }).catch(() => {})

    pb.collection('alpha_session').subscribe('*', e => {
      setSessionEnd(e.record.session_end ?? 0)
    })

    return () => { pb.collection('alpha_session').unsubscribe('*') }
  }, [])

  // Countdown tick
  useEffect(() => {
    if (!sessionEnd) { setRemaining(0); return }
    const tick = () => setRemaining(Math.max(0, Math.floor((sessionEnd - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [sessionEnd])

  const isAdmin = user ? TESTER_EMAILS.includes(user.email) : false

  // Auto-logout non-admin testers when session expires
  useEffect(() => {
    if (sessionEnd > 0 && remaining === 0 && !isAdmin) {
      getPocketBase().authStore.clear()
      router.push('/login')
    }
  }, [remaining, sessionEnd, isAdmin, router])

  if (user?.tier !== 'tester') return null

  async function startTimer(minutes: number) {
    const end = Date.now() + minutes * 60_000
    await getPocketBase().collection('alpha_session').update(recordId, { session_end: end })
    setSetting(false)
    setCustom('')
  }

  async function resetTimer() {
    await getPocketBase().collection('alpha_session').update(recordId, { session_end: 0 })
  }

  const isExpired = sessionEnd > 0 && remaining === 0
  const isUrgent  = remaining > 0 && remaining < 600
  const hasTimer  = sessionEnd > 0

  const bannerBg     = isExpired ? 'rgba(239,68,68,0.1)'   : 'rgba(251,191,36,0.08)'
  const bannerBorder = isExpired ? 'rgba(239,68,68,0.25)'  : 'rgba(251,191,36,0.2)'
  const dotColor     = isExpired ? '#f87171'                : '#fbbf24'
  const textColor    = isExpired ? 'rgba(248,113,113,0.9)' : 'rgba(251,191,36,0.85)'

  const btnBase: React.CSSProperties = {
    padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 500,
    border: '0.5px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)',
    color: 'rgba(251,191,36,0.85)', cursor: 'pointer',
  }

  return (
    <div style={{
      padding: '7px 18px',
      background: bannerBg,
      borderBottom: `0.5px solid ${bannerBorder}`,
      display: 'flex', alignItems: 'center', gap: '8px',
      flexShrink: 0,
    }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />

      {setting && isAdmin ? (
        /* ── Duration picker ── */
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: textColor, marginRight: '2px' }}>Set duration:</span>
          {[30, 60, 120].map(m => (
            <button key={m} style={btnBase} onClick={() => startTimer(m)}>
              {m < 60 ? `${m}m` : `${m / 60}h`}
            </button>
          ))}
          <input
            type="number"
            min={1}
            placeholder="min"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && Number(custom) > 0) startTimer(Number(custom)) }}
            style={{
              width: '52px', padding: '2px 6px', borderRadius: '5px', fontSize: '10px',
              border: '0.5px solid rgba(251,191,36,0.3)', background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)', outline: 'none',
            }}
          />
          <button style={btnBase} onClick={() => { if (Number(custom) > 0) startTimer(Number(custom)) }}>
            Start
          </button>
          <button
            style={{ ...btnBase, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', padding: '2px 4px' }}
            onClick={() => setSetting(false)}
          >✕</button>
        </div>
      ) : isExpired ? (
        /* ── Expired ── */
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '11px', color: textColor }}>
            Session ended — testing window closed.
          </span>
          {isAdmin && <button style={btnBase} onClick={resetTimer}>Clear</button>}
        </div>
      ) : hasTimer ? (
        /* ── Countdown active ── */
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '11px', color: textColor }}>
            Tester account — some features are limited or unavailable in this alpha build.
          </span>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: textColor, flexShrink: 0,
            animation: isUrgent ? 'alpha-pulse 1s ease-in-out infinite' : 'none',
          }}>
            Session closes in {fmt(remaining)}
          </span>
          {isAdmin && (
            <button
              title="Reset timer"
              style={{ ...btnBase, padding: '2px 6px', fontSize: '12px', lineHeight: 1 }}
              onClick={resetTimer}
            >↺</button>
          )}
        </div>
      ) : (
        /* ── No timer ── */
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '11px', color: textColor }}>
            Tester account — some features are limited or unavailable in this alpha build.
          </span>
          {isAdmin && <button style={btnBase} onClick={() => setSetting(true)}>Set timer</button>}
        </div>
      )}

      <style>{`
        @keyframes alpha-pulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
