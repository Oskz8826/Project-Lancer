'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getPocketBase } from '@/lib/pocketbase'
import { DISCIPLINES, CURRENCY_RATES } from '@/lib/constants'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import QuoteOverview from '@/components/quotes/QuoteOverview'
import BuilderPanel from '@/components/quotes/BuilderPanel'
import type { QuoteStatus } from '@/types'

const STATUS_COLORS: Record<QuoteStatus, { bg: string; text: string; border: string; label: string }> = {
  draft:     { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.45)', border: 'rgba(255,255,255,0.12)', label: 'Draft' },
  ready:     { bg: 'rgba(242,86,35,0.08)',   text: '#f78560',               border: 'rgba(242,86,35,0.25)',   label: 'Ready' },
  sent:      { bg: 'rgba(59,130,246,0.1)',   text: '#60a5fa',               border: 'rgba(59,130,246,0.25)',  label: 'Sent' },
  accepted:  { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80',               border: 'rgba(34,197,94,0.25)',   label: 'Accepted' },
  rejected:  { bg: 'rgba(239,68,68,0.1)',    text: '#f87171',               border: 'rgba(239,68,68,0.25)',   label: 'Rejected' },
  completed: { bg: 'rgba(168,85,247,0.1)',   text: '#c084fc',               border: 'rgba(168,85,247,0.25)', label: 'Completed' },
}

const FILTERS = ['all', 'draft', 'ready', 'sent', 'accepted', 'rejected', 'completed'] as const

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function QuotesPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()

  const [quotes, setQuotes]             = useState<any[]>([])
  const [quotesReady, setQuotesReady]   = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [isEditing, setIsEditing]       = useState(false)
  const [panelOpen, setPanelOpen]       = useState(false)
  const [panelKey, setPanelKey]         = useState(0)

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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    fetchQuotes(user.id, activeFilter)
  }, [user?.id, activeFilter, fetchQuotes])

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
    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', minHeight: '100vh' }}>

      <DashboardSidebar active="quotes" />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Top bar — full width, never narrowed by panel ── */}
        <div style={{
          padding: '11px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(13,13,18,0.8)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}>
          {/* Title */}
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>
            Quotes
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '3px', flex: 1, overflowX: 'auto' }}>
            {FILTERS.map(tab => {
              const isActive = activeFilter === tab
              const colors   = tab !== 'all' ? STATUS_COLORS[tab as QuoteStatus] : null
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
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

        {/* ── Content area — relative so panel can absolute-position inside ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

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
            ) : quotes.length === 0 ? (
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
                  {quotes.length} quote{quotes.length !== 1 ? 's' : ''}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '10px', overflow: 'hidden',
                }}>
                  {quotes.map((q, i) => {
                    const disciplineLabel = DISCIPLINES.find(d => d.value === q.discipline)?.label ?? q.discipline
                    const qStatus         = (q.status || 'draft') as QuoteStatus
                    const sc              = STATUS_COLORS[qStatus]
                    const isSelected      = q.id === selectedId && panelOpen
                    const isDraft         = qStatus === 'draft'
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSelectQuote(q.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', cursor: 'pointer',
                          borderBottom: i < quotes.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                      >
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
                              {disciplineLabel} · {q.asset_type || '—'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', display: 'flex', gap: '5px' }}>
                              <span>{q.complexity_tier || '—'}</span>
                              <span>·</span>
                              <span>{fmtDate(q.created)}</span>
                              {q.ai_assisted && <span style={{ color: '#f78560' }}>AI</span>}
                            </div>
                          </div>
                        </div>
                        {/* Price / draft indicator */}
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                          {isDraft && !q.quote_min ? (
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
        </div>
      </div>
    </div>
  )
}
