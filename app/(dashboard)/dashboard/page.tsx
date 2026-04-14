'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const QUOTE_CAP: Record<string, number> = {
  free: 3,
  basic: Infinity,
  pro: Infinity,
  max: Infinity,
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function IconDashboard({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

function IconQuotes({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}

function IconHistory({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function IconSettings({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="animate-spin"
          style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#F25623',
          }}
        />
      </div>
    )
  }

  const tier = user.tier ?? 'free'
  const quoteCap = QUOTE_CAP[tier] ?? 3
  const quotesUsed = user.quotes_used_this_month ?? 0
  const isFree = tier === 'free'
  const isBasicOrBelow = tier === 'free' || tier === 'basic'
  const greeting = getGreeting()
  const dateStr = getDateString()
  const initials = getInitials(user.name || user.email?.split('@')[0] || 'U')
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
  const quotaFillPct = isFree ? Math.min((quotesUsed / quoteCap) * 100, 100) : 0
  const quotesRemaining = isFree ? Math.max(quoteCap - quotesUsed, 0) : null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderRight: '0.5px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '14px 0', gap: '6px',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo mark — links to home */}
        <Link href="/" style={{ textDecoration: 'none' }} title="Home">
          <div style={{
            width: '30px', height: '30px', borderRadius: '7px',
            background: 'linear-gradient(135deg,#f25623,#c43d10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px',
            cursor: 'pointer',
          }}>L</div>
        </Link>

        {/* Dashboard — active */}
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px',
          background: 'rgba(242,86,35,0.15)', border: '1px solid rgba(242,86,35,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconDashboard color="#f25623" />
        </div>

        {/* Quotes */}
        <Link href="/dashboard/quotes" style={{ textDecoration: 'none' }} title="Quotes">
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconQuotes />
          </div>
        </Link>

        {/* History */}
        <Link href="/dashboard/history" style={{ textDecoration: 'none' }} title="History">
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconHistory />
          </div>
        </Link>

        {/* Settings */}
        <Link href="/dashboard/settings" style={{ textDecoration: 'none' }} title="Settings">
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconSettings />
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Avatar — links to settings */}
        <Link href="/dashboard/settings" style={{ textDecoration: 'none' }} title="Account settings">
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(242,86,35,0.2)', border: '1px solid rgba(242,86,35,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 600, color: '#f25623', cursor: 'pointer',
          }}>{initials}</div>
        </Link>
      </div>

      {/* ── Main content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{
          padding: '11px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(13,13,18,0.8)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
              {greeting}, {user.name}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              {dateStr} · {tierLabel} plan
            </div>
          </div>
          <div style={{ display: 'flex', gap: '7px' }}>
            <Link href="/dashboard/history" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '5px 12px', borderRadius: '7px',
                border: '0.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                fontSize: '11px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}>History</div>
            </Link>
            <Link href="/dashboard/quotes/new" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '5px 12px', borderRadius: '7px',
                background: 'rgba(242,86,35,0.15)', border: '0.5px solid rgba(242,86,35,0.4)',
                fontSize: '11px', color: '#f78560', fontWeight: 500, cursor: 'pointer',
              }}>+ New quote</div>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px', flex: 1 }}>

          {/* 3-stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '12px', padding: '12px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>Quotes this month</div>
              <div style={{ fontSize: '22px', fontWeight: 500, color: '#fff' }}>
                {quotesUsed}{isFree ? ` / ${quoteCap}` : ''}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(242,86,35,0.7)', marginTop: '3px' }}>
                {isFree ? `${quotesRemaining} remaining on free` : `Unlimited on ${tierLabel}`}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '12px', padding: '12px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>Saved quotes</div>
              <div style={{ fontSize: '22px', fontWeight: 500, color: '#fff' }}>0</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>No saved quotes yet</div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '12px', padding: '12px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>Avg quote value</div>
              <div style={{ fontSize: '22px', fontWeight: 500, color: '#fff' }}>—</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>No quotes yet</div>
            </div>
          </div>

          {/* Action row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <Link href="/dashboard/quotes/new" style={{ textDecoration: 'none' }}>
              <div style={{
                borderRadius: '10px', padding: '11px 14px',
                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer',
                border: '0.5px solid rgba(242,86,35,0.35)',
                background: 'rgba(242,86,35,0.12)', color: '#f78560',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              }}>+ New quote</div>
            </Link>

            <div style={{
              borderRadius: '10px', padding: '11px 14px',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
              cursor: isBasicOrBelow ? 'default' : 'pointer',
              border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', opacity: isBasicOrBelow ? 0.6 : 1 }}>Budget estimator</span>
              {isBasicOrBelow && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                  background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
                  border: '1px solid #3b82f6', lineHeight: 1.4,
                  marginLeft: 'auto',
                }}>Pro</span>
              )}
            </div>
          </div>

          {/* Recent quotes */}
          <div style={{
            fontSize: '10px', color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
          }}>Recent quotes</div>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '10px', padding: '24px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>No quotes yet</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
              Create your first quote to get started.{' '}
              <Link href="/dashboard/quotes/new" style={{ color: '#f78560', textDecoration: 'none' }}>
                New quote →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer quota bar — free only */}
        {isFree && (
          <div style={{
            padding: '10px 18px',
            borderTop: '0.5px solid rgba(255,255,255,0.05)',
            background: 'rgba(13,13,18,0.8)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                {quotesRemaining} of {quoteCap} free quotes remaining this month
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '3px' }}>
                <div style={{
                  width: '120px', height: '3px', borderRadius: '2px',
                  background: 'rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: `${quotaFillPct}%`, height: '3px', borderRadius: '2px',
                    background: 'rgba(242,86,35,0.6)',
                  }} />
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{quotesUsed}/{quoteCap}</span>
              </div>
            </div>
            <Link href="/pricing" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '12px', color: '#f78560', cursor: 'pointer' }}>Upgrade to Basic →</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
