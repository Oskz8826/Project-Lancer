'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getPocketBase } from '@/lib/pocketbase'
import { DISCIPLINES, CURRENCY_RATES } from '@/lib/constants'
import QuoteOverview from '@/components/quotes/QuoteOverview'
import BuilderPanel from '@/components/quotes/BuilderPanel'
import type { QuoteStatus } from '@/types'
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

const FILTERS = ['all', 'pending', 'accepted', 'declined', 'revised', 'superseded', 'expired'] as const

const STAGE_ORDER: Record<QuoteStatus, number> = {
  pending: 0, revised: 1, accepted: 2, declined: 3, superseded: 4, expired: 5,
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function QuotesPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [quotes, setQuotes]             = useState<any[]>([])
  const [quotesReady, setQuotesReady]   = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [isEditing, setIsEditing]       = useState(false)
  const [panelOpen, setPanelOpen]       = useState(false)
  const [panelKey, setPanelKey]         = useState(0)
  const [sortBy, setSortBy]             = useState<'newest' | 'name' | 'stage'>('newest')
  const [sortOpen, setSortOpen]         = useState(false)

  const fetchQuotes = useCallback((userId: string, filter: string) => {
    setQuotesReady(false)
    const pb = getPocketBase()
    const f = filter === 'all'
      ? `user = "${userId}"`
      : `user = "${userId}" && status = "${filter}"`
    pb.collection('quotes')
      .getList(1, 100, { filter: f, sort: '-created' })
      .then(res => { setQuotes(res.items); setQuotesReady(true) })
      .catch(() => setQuotesReady(true))
  }, [])

  const sortedQuotes = useMemo(() => {
    const arr = [...quotes]
    if (sortBy === 'name') return arr.sort((a, b) => (a.client_name ?? '').localeCompare(b.client_name ?? ''))
    if (sortBy === 'stage') return arr.sort((a, b) => STAGE_ORDER[a.status as QuoteStatus] - STAGE_ORDER[b.status as QuoteStatus])
    return arr // newest: already sorted by -created from PocketBase
  }, [quotes, sortBy])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    fetchQuotes(user.id, activeFilter)
  }, [user?.id, activeFilter, fetchQuotes])

  useEffect(() => {
    if (!quotesReady) return
    const openId = searchParams.get('open')
    if (openId) {
      setSelectedId(openId)
      setIsEditing(false)
      setPanelOpen(true)
    }
  }, [quotesReady, searchParams])

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{
          width: '20px', height: '20px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#F25623',
        }} />
      </div>
    )
  }

  const selectedQuote = quotes.find(q => q.id === selectedId) ?? null

  function handleNewQuote() {
    setSelectedId(null)
    setIsEditing(true)
    setPanelKey(k => k + 1)
    setPanelOpen(true)
  }

  function handleSelectQuote(id: string) {
    setSelectedId(id)
    setIsEditing(false)
    setPanelOpen(true)
  }

  function handleClosePanel() {
    setPanelOpen(false)
    setSelectedId(null)
    setIsEditing(false)
  }

  async function handleSaved(id: string) {
    await refreshUser()
    fetchQuotes(user!.id, activeFilter)
    setSelectedId(id)
    setIsEditing(false)
    setPanelOpen(true)
  }

  function handleStatusChange(id: string, status: QuoteStatus) {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Top bar — full width, never narrowed by panel ── */}
        <div style={{
          padding: '11px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(13,13,18,0.8)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          flexShrink: 0, position: 'relative', zIndex: 20,
        }}>
          {/* Title */}
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>
            Quotes
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '3px', flex: 1, overflowX: 'auto' }}>
            {FILTERS.map(tab => {
              const isActive = activeFilter === tab && sortBy !== 'stage'
              const colors   = tab !== 'all' ? STATUS_COLORS[tab as QuoteStatus] : null
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveFilter(tab); if (sortBy === 'stage') setSortBy('newest') }}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                    border: isActive
                      ? `0.5px solid ${colors?.border ?? 'rgba(255,255,255,0.2)'}`
                      : '0.5px solid transparent',
                    background: isActive
                      ? (colors?.bg ?? 'rgba(255,255,255,0.07)')
                      : 'none',
                    color: isActive
                      ? (colors?.text ?? 'rgba(255,255,255,0.85)')
                      : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {tab === 'all' ? 'All' : STATUS_COLORS[tab as QuoteStatus].label}
                </button>
              )
            })}
            {/* Divider */}
            <div style={{ width: '0.5px', background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', margin: '2px 4px', flexShrink: 0 }} />
            {/* Stage sort tab */}
            <button
              onClick={() => setSortBy('stage')}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                border: sortBy === 'stage' ? '0.5px solid rgba(255,255,255,0.2)' : '0.5px solid transparent',
                background: sortBy === 'stage' ? 'rgba(255,255,255,0.07)' : 'none',
                color: sortBy === 'stage' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                fontWeight: sortBy === 'stage' ? 500 : 400,
              }}
            >Stage</button>
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setSortOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)', fontSize: '11px', borderRadius: '6px',
                padding: '4px 9px', cursor: 'pointer', outline: 'none',
              }}
            >
              {sortBy === 'name' ? 'Name' : 'Newest'}
              <span style={{ fontSize: '8px', opacity: 0.6 }}>▾</span>
            </button>
            {sortOpen && (
              <>
                {/* backdrop to close on outside click */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                  onClick={() => setSortOpen(false)}
                />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50,
                  background: '#16161e', border: '0.5px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px', overflow: 'hidden', minWidth: '100px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {(['newest', 'name'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setSortOpen(false) }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '7px 12px', fontSize: '11px', cursor: 'pointer', border: 'none',
                        background: sortBy === opt ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: sortBy === opt ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
                      }}
                    >
                      {opt === 'newest' ? 'Newest' : 'Name'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* New quote button */}
          <button
            onClick={handleNewQuote}
            style={{
              padding: '5px 12px', borderRadius: '7px',
              background: 'rgba(242,86,35,0.15)', border: '0.5px solid rgba(242,86,35,0.4)',
              fontSize: '11px', color: '#f78560', fontWeight: 500, cursor: 'pointer',
              flexShrink: 0,
            }}
          >+ New quote</button>
        </div>

        <AlphaBanner />

        {/* ── Content area — relative so panel can absolute-position inside ── */}
        <DashboardTransition style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

          {/* Quote list — right padding opens up when panel is visible */}
          <div style={{
            padding: '16px 18px', height: '100%', overflowY: 'auto', boxSizing: 'border-box',
            paddingRight: panelOpen ? '458px' : '18px',
            transition: 'padding-right 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}>

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
            ) : sortedQuotes.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '10px', padding: '40px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                  {activeFilter === 'all' ? 'No saved quotes yet' : `No ${activeFilter} quotes`}
                </div>
                {activeFilter === 'all' && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                    <button
                      onClick={handleNewQuote}
                      style={{ background: 'none', border: 'none', color: '#f78560', cursor: 'pointer', fontSize: '11px' }}
                    >
                      Create your first quote →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={{
                  fontSize: '10px', color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
                }}>
                  {sortedQuotes.length} quote{sortedQuotes.length !== 1 ? 's' : ''}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '10px', overflow: 'hidden',
                }}>
                  {sortedQuotes.map((q, i) => {
                    const disciplineLabel = DISCIPLINES.find(d => d.value === q.discipline)?.label ?? q.discipline
                    const qStatus         = (q.status || 'pending') as QuoteStatus
                    const sc              = STATUS_COLORS[qStatus]
                    const isSelected      = q.id === selectedId && panelOpen
                    const isPending       = qStatus === 'pending'
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSelectQuote(q.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', cursor: 'pointer',
                          borderBottom: i < sortedQuotes.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                      >
                        <div style={{ width: '100%', minWidth: 0 }}>
                          {/* Progress bar */}
                          {(() => {
                            const STAGES: QuoteStatus[] = ['pending', 'revised', 'accepted']
                            const IDX: Record<QuoteStatus, number> = { pending: 0, revised: 1, accepted: 2, declined: -1, superseded: -1, expired: -1 }
                            const CLRS: Record<QuoteStatus, string> = { pending: '#facc15', revised: '#60a5fa', accepted: '#4ade80', declined: '#f87171', superseded: 'rgba(255,255,255,0.4)', expired: '#f97316' }
                            const curIdx = IDX[qStatus]
                            const isRej = curIdx === -1
                            return (
                              <div style={{ display: 'flex', gap: '3px', marginBottom: '7px', width: '25%' }}>
                                {STAGES.map((s, i) => {
                                  const filled = i <= curIdx
                                  const isNext = i === curIdx + 1
                                  const bg = isRej
                                    ? '#f87171'
                                    : filled
                                      ? CLRS[qStatus]
                                      : isNext ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'
                                  return <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: bg }} />
                                })}
                              </div>
                            )
                          })()}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              {/* Status badge */}
                              <span style={{
                                padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 500,
                                background: sc.bg, color: sc.text, border: `0.5px solid ${sc.border}`,
                                flexShrink: 0,
                              }}>
                                {sc.label}
                              </span>
                              {/* Info */}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {q.project_name || `${disciplineLabel} · ${q.asset_type || '—'}`}
                                </div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', display: 'flex', gap: '5px' }}>
                                  {q.project_name && <><span>{disciplineLabel} · {q.asset_type || '—'}</span><span>·</span></>}
                                  <span>{q.complexity_tier || '—'}</span>
                                  <span>·</span>
                                  <span>{fmtDate(q.created)}</span>
                                  {q.ai_assisted && <span style={{ color: '#f78560' }}>AI</span>}
                                </div>
                              </div>
                            </div>
                        {/* Price / draft indicator */}
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                          {isPending && !q.quote_min ? (
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                              Step {q.draft_step || 1}/5
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#f78560', whiteSpace: 'nowrap' }}>
                              {q.quote_min && q.quote_max ? (() => {
                                const cur = q.working_currency || 'EUR'
                                const sym = cur === 'GBP' ? '£' : cur === 'USD' ? '$' : '€'
                                const rate = CURRENCY_RATES[cur] ?? 1
                                return `${sym}${Math.round(q.quote_min * rate).toLocaleString()} – ${sym}${Math.round(q.quote_max * rate).toLocaleString()}`
                              })() : '—'}
                            </div>
                          )}
                        </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Slide-in panel ── */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: '440px',
            background: 'rgba(13,13,18,0.98)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderLeft: '0.5px solid rgba(255,255,255,0.08)',
            transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', flexDirection: 'column',
            zIndex: 10,
          }}>
            {panelOpen && (
              isEditing ? (
                <BuilderPanel
                  key={`builder-${panelKey}-${selectedId ?? 'new'}`}
                  quote={selectedId ? quotes.find(q => q.id === selectedId) ?? null : null}
                  user={user}
                  onClose={handleClosePanel}
                  onSaved={handleSaved}
                  onRestart={handleNewQuote}
                />
              ) : selectedId !== null ? (
                selectedQuote ? (
                  <QuoteOverview
                    key={`overview-${selectedId}`}
                    quote={selectedQuote}
                    onClose={handleClosePanel}
                    onStatusChange={handleStatusChange}
                    onEdit={() => setIsEditing(true)}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div className="animate-spin" style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#F25623' }} />
                  </div>
                )
              ) : null
            )}
          </div>
        </DashboardTransition>
      </div>
  )
}
