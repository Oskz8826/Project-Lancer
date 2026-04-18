'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getPocketBase } from '@/lib/pocketbase'
import { DISCIPLINES, CURRENCY_RATES } from '@/lib/constants'
import type { WorkingCurrency, QuoteStatus } from '@/types'
import DashboardTransition from '@/components/dashboard/DashboardTransition'
import AlphaBanner from '@/components/dashboard/AlphaBanner'

const STATUS_COLORS: Record<QuoteStatus, { bg: string; text: string; border: string; label: string }> = {
  pending:    { bg: 'rgba(250,204,21,0.08)',  text: '#facc15',               border: 'rgba(250,204,21,0.25)',  label: 'Pending' },
  accepted:   { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80',               border: 'rgba(34,197,94,0.25)',   label: 'Accepted' },
  declined:   { bg: 'rgba(239,68,68,0.1)',    text: '#f87171',               border: 'rgba(239,68,68,0.25)',   label: 'Declined' },
  revised:    { bg: 'rgba(59,130,246,0.1)',   text: '#60a5fa',               border: 'rgba(59,130,246,0.25)',  label: 'Revised' },
  superseded: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.12)', label: 'Superseded' },
  expired:    { bg: 'rgba(249,115,22,0.08)',  text: '#f97316',               border: 'rgba(249,115,22,0.25)',  label: 'Expired' },
}

const PROGRESS_STAGES = [0,1,2,3,4,5]
const PROGRESS_INDEX: Record<QuoteStatus, number> = {
  pending: 0, revised: 2, accepted: 5, declined: -1, superseded: -1, expired: -1,
}
const STAGE_COLORS: Record<QuoteStatus, string> = {
  pending: '#facc15', revised: '#60a5fa', accepted: '#4ade80',
  declined: '#f87171', superseded: 'rgba(255,255,255,0.4)', expired: '#f97316',
}

function StatusBar({ status }: { status: QuoteStatus }) {
  const currentIdx = PROGRESS_INDEX[status]
  const isTerminal = currentIdx === -1
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '7px', width: '25%' }}>
      {PROGRESS_STAGES.map((stage, i) => {
        const filled = !isTerminal && i <= currentIdx
        const isNext = !isTerminal && i === currentIdx + 1
        const color = isTerminal
          ? STAGE_COLORS[status]
          : filled
            ? STAGE_COLORS[status]
            : isNext ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'
        return (
          <div
            key={stage}
            style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: color,
              transition: 'background 0.2s',
            }}
          />
        )
      })}
    </div>
  )
}

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', GBP: '£', USD: '$' }

function fmtAmount(eur: number | undefined | null, currency: string) {
  if (eur == null || isNaN(eur)) return '—'
  const rate = CURRENCY_RATES[currency as WorkingCurrency] ?? 1
  const sym  = CURRENCY_SYMBOLS[currency] ?? '€'
  return `${sym}${Math.round(eur * rate).toLocaleString()}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const QUOTE_CAP: Record<string, number> = {
  free: 10,
  basic: Infinity,
  pro: Infinity,
  max: Infinity,
  tester: Infinity,
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [quotes, setQuotes]         = useState<any[]>([])
  const [quotesReady, setQuotesReady] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    const pb = getPocketBase()
    pb.collection('quotes')
      .getList(1, 100, { filter: `user = "${user.id}"`, sort: '-created' })
      .then(res => { setQuotes(res.items); setQuotesReady(true) })
      .catch(() => setQuotesReady(true))
  }, [user?.id])

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

  const draftQuotes  = quotes.filter(q => q.status === 'draft')
  const savedQuotes  = quotes.filter(q => q.status !== 'draft')
  const recentQuotes = quotes.slice(0, 5)

  const tier = user.tier ?? 'free'
  const quoteCap = QUOTE_CAP[tier] ?? 3
  const quotesUsed = user.quotes_used_this_month ?? 0
  const isFree = tier === 'free'
  const isBasicOrBelow = tier === 'free' || tier === 'basic'
  const greeting = getGreeting()
  const dateStr = getDateString()
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
  const quotaFillPct = isFree ? Math.min((quotesUsed / quoteCap) * 100, 100) : 0
  const quotesRemaining = isFree ? Math.max(quoteCap - quotesUsed, 0) : null

  return (
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

        <AlphaBanner />

        {/* Content */}
        <DashboardTransition style={{ padding: '16px 18px', flex: 1 }}>

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
              <div style={{ fontSize: '22px', fontWeight: 500, color: '#fff' }}>
                {quotesReady ? savedQuotes.length : '—'}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>
                {!quotesReady || quotes.length === 0
                  ? 'No saved quotes yet'
                  : draftQuotes.length > 0
                    ? `+ ${draftQuotes.length} draft${draftQuotes.length !== 1 ? 's' : ''}`
                    : `${savedQuotes.length} quote${savedQuotes.length !== 1 ? 's' : ''} saved`}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '12px', padding: '12px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>Avg quote value</div>
              <div style={{ fontSize: '22px', fontWeight: 500, color: '#fff' }}>
                {savedQuotes.length > 0
                  ? fmtAmount(savedQuotes.reduce((s, q) => s + (q.quote_mid ?? 0), 0) / savedQuotes.length, savedQuotes[0]?.working_currency || 'EUR')
                  : '—'}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>
                {savedQuotes.length > 0 ? 'across all saved quotes' : 'No quotes yet'}
              </div>
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

          {!quotesReady ? (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '10px', padding: '20px 14px',
              display: 'flex', justifyContent: 'center',
            }}>
              <div className="animate-spin" style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#F25623',
              }} />
            </div>
          ) : recentQuotes.length === 0 ? (
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
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              {recentQuotes.map((q, i) => {
                const disciplineLabel = DISCIPLINES.find(d => d.value === q.discipline)?.label ?? q.discipline
                const cur = q.working_currency || 'EUR'
                const qStatus = (q.status || 'draft') as QuoteStatus
                const sc = STATUS_COLORS[qStatus]
                return (
                  <div
                    key={q.id}
                    onClick={() => router.push(`/dashboard/quotes?open=${q.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', cursor: 'pointer',
                      borderBottom: i < recentQuotes.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: '100%', minWidth: 0 }}>
                      <StatusBar status={qStatus} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.project_name || `${disciplineLabel} · ${q.asset_type}`}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: sc.text, fontWeight: 500 }}>{sc.label}</span>
                            <span>·</span>
                            {q.project_name && <><span>{disciplineLabel}</span><span>·</span></>}
                            <span>{q.complexity_tier}</span>
                            <span>·</span>
                            <span>{fmtDate(q.created)}</span>
                            {q.ai_assisted && <span style={{ color: '#f78560' }}>AI</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f78560', textAlign: 'right', flexShrink: 0 }}>
                          {fmtAmount(q.quote_min, cur)} – {fmtAmount(q.quote_max, cur)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DashboardTransition>

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
  )
}
