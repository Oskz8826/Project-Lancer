'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getPocketBase } from '@/lib/pocketbase'
import { DISCIPLINES, CURRENCY_RATES } from '@/lib/constants'
import QuoteOverview from '@/components/quotes/QuoteOverview'
import DashboardTransition from '@/components/dashboard/DashboardTransition'
import AlphaBanner from '@/components/dashboard/AlphaBanner'
import type { QuoteStatus, WorkingCurrency } from '@/types'

const STATUS_COLORS: Record<QuoteStatus, { bg: string; text: string; border: string; label: string }> = {
  pending:    { bg: 'rgba(250,204,21,0.08)',  text: '#facc15',               border: 'rgba(250,204,21,0.25)',  label: 'Pending' },
  accepted:   { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80',               border: 'rgba(34,197,94,0.25)',   label: 'Accepted' },
  declined:   { bg: 'rgba(239,68,68,0.1)',    text: '#f87171',               border: 'rgba(239,68,68,0.25)',   label: 'Declined' },
  revised:    { bg: 'rgba(59,130,246,0.1)',   text: '#60a5fa',               border: 'rgba(59,130,246,0.25)',  label: 'Revised' },
  superseded: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.12)', label: 'Superseded' },
  expired:    { bg: 'rgba(249,115,22,0.08)',  text: '#f97316',               border: 'rgba(249,115,22,0.25)',  label: 'Expired' },
}

const ALL_STATUSES: QuoteStatus[] = ['pending', 'accepted', 'declined', 'revised', 'superseded', 'expired']
const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', GBP: '£', USD: '$' }
const QUOTE_EXPIRY_DAYS = 30

function fmtAmount(eur: number | undefined | null, currency: string) {
  if (eur == null || isNaN(eur)) return '—'
  const rate = CURRENCY_RATES[currency as WorkingCurrency] ?? 1
  const sym  = CURRENCY_SYMBOLS[currency] ?? '€'
  return `${sym}${Math.round(eur * rate).toLocaleString()}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getExpiryDate(createdIso: string): Date {
  const d = new Date(createdIso)
  d.setDate(d.getDate() + QUOTE_EXPIRY_DAYS)
  return d
}

function daysUntilExpiry(createdIso: string): number {
  const expiry = getExpiryDate(createdIso)
  return Math.ceil((expiry.getTime() - Date.now()) / 86400000)
}

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [quotes, setQuotes]               = useState<any[]>([])
  const [quotesReady, setQuotesReady]     = useState(false)
  const [activeFilter, setActiveFilter]   = useState<string>('all')
  const [clientSearch, setClientSearch]   = useState('')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')
  const [sortBy, setSortBy]               = useState<'newest' | 'status' | 'price'>('newest')
  const [sortOpen, setSortOpen]           = useState(false)
  const [selectedId, setSelectedId]       = useState<string | null>(null)
  const [panelOpen, setPanelOpen]         = useState(false)
  const [selected, setSelected]           = useState<Set<string>>(new Set())
  const [bulkOpen, setBulkOpen]           = useState(false)
  const [bulkUpdating, setBulkUpdating]   = useState(false)

  const fetchQuotes = useCallback((userId: string) => {
    setQuotesReady(false)
    const pb = getPocketBase()
    pb.collection('quotes')
      .getList(1, 500, { filter: `user = "${userId}"`, sort: '-created' })
      .then(res => { setQuotes(res.items); setQuotesReady(true) })
      .catch(() => setQuotesReady(true))
  }, [])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (user) fetchQuotes(user.id)
  }, [user?.id, fetchQuotes])

  const filteredQuotes = useMemo(() => {
    let arr = [...quotes]

    if (activeFilter !== 'all') arr = arr.filter(q => q.status === activeFilter)

    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase()
      arr = arr.filter(r => (r.client_name || '').toLowerCase().includes(q))
    }

    if (dateFrom) arr = arr.filter(r => new Date(r.created) >= new Date(dateFrom))
    if (dateTo)   arr = arr.filter(r => new Date(r.created) <= new Date(dateTo + 'T23:59:59'))

    if (sortBy === 'status') arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''))
    else if (sortBy === 'price') arr.sort((a, b) => (b.quote_mid ?? 0) - (a.quote_mid ?? 0))
    // newest: already sorted by -created from PocketBase

    return arr
  }, [quotes, activeFilter, clientSearch, dateFrom, dateTo, sortBy])

  const expiringSoon = useMemo(() =>
    filteredQuotes.filter(q => q.status === 'pending' && daysUntilExpiry(q.created) <= 3 && daysUntilExpiry(q.created) >= 0),
    [filteredQuotes]
  )

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

  // Free tier: upgrade wall
  if (user.tier === 'free') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{
          padding: '11px 18px',
          display: 'flex', alignItems: 'center',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(13,13,18,0.8)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>History</div>
        </div>
        <AlphaBanner />
        <DashboardTransition style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 18px' }}>
          <div style={{ textAlign: 'center', maxWidth: '320px' }}>
            <div style={{ fontSize: '20px', marginBottom: '10px' }}>📁</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
              History is a Basic feature
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', lineHeight: 1.6 }}>
              Upgrade to Basic to access your full quote history, filters, and bulk actions.
            </div>
            <button
              onClick={() => router.push('/pricing')}
              style={{
                padding: '9px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                background: '#F25623', border: 'none', color: '#fff', cursor: 'pointer',
              }}
            >
              View plans
            </button>
          </div>
        </DashboardTransition>
      </div>
    )
  }

  const selectedQuote = quotes.find(q => q.id === selectedId) ?? null

  function handleSelectQuote(id: string) {
    setSelectedId(id)
    setPanelOpen(true)
  }

  function handleClosePanel() {
    setPanelOpen(false)
    setSelectedId(null)
  }

  function handleStatusChange(id: string, status: QuoteStatus) {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q))
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filteredQuotes.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredQuotes.map(q => q.id)))
    }
  }

  async function handleBulkStatus(newStatus: QuoteStatus) {
    setBulkUpdating(true)
    const pb = getPocketBase()
    await Promise.all(
      [...selected].map(id => pb.collection('quotes').update(id, { status: newStatus }))
    )
    setQuotes(prev => prev.map(q => selected.has(q.id) ? { ...q, status: newStatus } : q))
    setSelected(new Set())
    setBulkOpen(false)
    setBulkUpdating(false)
  }

  const allChecked = filteredQuotes.length > 0 && selected.size === filteredQuotes.length
  const someChecked = selected.size > 0 && selected.size < filteredQuotes.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{
        padding: '11px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        background: 'rgba(13,13,18,0.8)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>History</div>

        {/* Sort */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSortOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '14px', fontSize: '11px',
              background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
            }}
          >
            Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'status' ? 'Status' : 'Price'}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {sortOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, zIndex: 50, marginTop: '4px',
              background: 'rgba(20,20,28,0.98)', border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '4px', minWidth: '120px',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {(['newest', 'status', 'price'] as const).map(s => (
                <button key={s} onClick={() => { setSortBy(s); setSortOpen(false) }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px',
                  borderRadius: '7px', background: sortBy === s ? 'rgba(255,255,255,0.05)' : 'none',
                  border: 'none', cursor: 'pointer', fontSize: '12px',
                  color: sortBy === s ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                }}>
                  {s === 'newest' ? 'Newest first' : s === 'status' ? 'By status' : 'By price'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlphaBanner />

      <DashboardTransition style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>

        {/* Expiring soon banner */}
        {expiringSoon.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
            background: 'rgba(249,115,22,0.08)', border: '0.5px solid rgba(249,115,22,0.25)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ fontSize: '12px', color: '#f97316' }}>
              {expiringSoon.length === 1
                ? `1 quote expires in ${daysUntilExpiry(expiringSoon[0].created)} day${daysUntilExpiry(expiringSoon[0].created) === 1 ? '' : 's'}`
                : `${expiringSoon.length} quotes expiring within 3 days`}
            </span>
          </div>
        )}

        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {/* Status chips */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {(['all', ...ALL_STATUSES] as const).map(f => {
              const active = activeFilter === f
              const sc = f !== 'all' ? STATUS_COLORS[f] : null
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '4px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 500,
                    border: `0.5px solid ${active ? (sc?.border ?? 'rgba(255,255,255,0.25)') : 'rgba(255,255,255,0.08)'}`,
                    background: active ? (sc?.bg ?? 'rgba(255,255,255,0.06)') : 'transparent',
                    color: active ? (sc?.text ?? 'rgba(255,255,255,0.8)') : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {f === 'all' ? 'All' : sc?.label}
                </button>
              )
            })}
          </div>

          {/* Client search */}
          <input
            type="text"
            placeholder="Search client…"
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
            style={{
              padding: '4px 10px', borderRadius: '14px', fontSize: '11px',
              background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.75)', outline: 'none', width: '130px',
            }}
          />

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{
              padding: '4px 8px', borderRadius: '14px', fontSize: '11px',
              background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)', outline: 'none', colorScheme: 'dark',
            }}
          />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{
              padding: '4px 8px', borderRadius: '14px', fontSize: '11px',
              background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)', outline: 'none', colorScheme: 'dark',
            }}
          />

          {(clientSearch || dateFrom || dateTo) && (
            <button
              onClick={() => { setClientSearch(''); setDateFrom(''); setDateTo('') }}
              style={{
                padding: '4px 8px', borderRadius: '14px', fontSize: '11px',
                background: 'none', border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: '10px', marginBottom: '10px',
            background: 'rgba(242,86,35,0.08)', border: '0.5px solid rgba(242,86,35,0.2)',
          }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {selected.size} selected
            </span>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setBulkOpen(o => !o)}
                disabled={bulkUpdating}
                style={{
                  padding: '5px 12px', borderRadius: '14px', fontSize: '11px', fontWeight: 500,
                  background: '#F25623', border: 'none', color: '#fff',
                  cursor: bulkUpdating ? 'not-allowed' : 'pointer', opacity: bulkUpdating ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                Set status
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {bulkOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: '4px',
                  background: 'rgba(20,20,28,0.98)', border: '0.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '4px', minWidth: '140px',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  {ALL_STATUSES.map(s => {
                    const c = STATUS_COLORS[s]
                    return (
                      <button key={s} onClick={() => handleBulkStatus(s)} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '7px 10px', borderRadius: '7px', border: 'none',
                        background: 'none', cursor: 'pointer', fontSize: '12px', color: c.text,
                      }}>
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <button
              onClick={() => setSelected(new Set())}
              style={{
                padding: '5px 10px', borderRadius: '14px', fontSize: '11px',
                background: 'none', border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        {!quotesReady ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
            <div className="animate-spin" style={{
              width: '20px', height: '20px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#F25623',
            }} />
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '48px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>No quotes match these filters.</div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
            border: '0.5px solid rgba(255,255,255,0.06)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 90px 90px 80px 80px 80px',
              padding: '8px 14px',
              borderBottom: '0.5px solid rgba(255,255,255,0.05)',
              fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.3)',
              gap: '8px', alignItems: 'center',
            }}>
              <div
                onClick={toggleSelectAll}
                style={{
                  width: '14px', height: '14px', borderRadius: '4px', cursor: 'pointer',
                  border: `1.5px solid ${allChecked || someChecked ? '#F25623' : 'rgba(255,255,255,0.2)'}`,
                  background: allChecked ? '#F25623' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                {(allChecked || someChecked) && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    {allChecked
                      ? <path d="M20 6L9 17l-5-5"/>
                      : <line x1="5" y1="12" x2="19" y2="12"/>}
                  </svg>
                )}
              </div>
              <div>Project</div>
              <div>Client</div>
              <div>Discipline</div>
              <div>Price range</div>
              <div>Status</div>
              <div>Created</div>
              <div style={{ display: 'none' }}>Expires</div>
            </div>

            {/* Rows */}
            {filteredQuotes.map((q, i) => {
              const qStatus = (q.status || 'pending') as QuoteStatus
              const sc      = STATUS_COLORS[qStatus]
              const cur     = q.working_currency || 'EUR'
              const disc    = DISCIPLINES.find(d => d.value === q.discipline)?.label ?? q.discipline ?? '—'
              const isSelected = q.id === selectedId && panelOpen
              const isChecked  = selected.has(q.id)
              const days       = qStatus === 'pending' ? daysUntilExpiry(q.created) : null
              const isExpiring = days !== null && days <= 3 && days >= 0

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuote(q.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 90px 90px 80px 80px 80px',
                    padding: '10px 14px', gap: '8px', alignItems: 'center',
                    borderBottom: i < filteredQuotes.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
                    background: isSelected
                      ? 'rgba(255,255,255,0.04)'
                      : isExpiring
                        ? 'rgba(249,115,22,0.04)'
                        : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                    borderLeft: isExpiring ? '2px solid rgba(249,115,22,0.4)' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = isExpiring ? 'rgba(249,115,22,0.04)' : 'transparent' }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={e => toggleSelect(q.id, e)}
                    style={{
                      width: '14px', height: '14px', borderRadius: '4px', cursor: 'pointer', flexShrink: 0,
                      border: `1.5px solid ${isChecked ? '#F25623' : 'rgba(255,255,255,0.15)'}`,
                      background: isChecked ? '#F25623' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isChecked && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>

                  {/* Project name */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.8)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {q.project_name || q.asset_type || 'Untitled quote'}
                    </div>
                    {isExpiring && (
                      <div style={{ fontSize: '10px', color: '#f97316', marginTop: '1px' }}>
                        Expires in {days} day{days === 1 ? '' : 's'}
                      </div>
                    )}
                  </div>

                  {/* Client */}
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.client_name || '—'}
                  </div>

                  {/* Discipline */}
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {disc}
                  </div>

                  {/* Price range */}
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                    {q.quote_min && q.quote_max
                      ? `${fmtAmount(q.quote_min, cur)}–${fmtAmount(q.quote_max, cur)}`
                      : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 500,
                      background: sc.bg, color: sc.text, border: `0.5px solid ${sc.border}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Created */}
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                    {fmtDate(q.created)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ height: '32px' }} />
      </DashboardTransition>

      {/* Slide-in panel */}
      {panelOpen && selectedQuote && (
        <>
          <div
            onClick={handleClosePanel}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', zIndex: 50,
            background: 'rgba(13,13,18,0.97)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '0.5px solid rgba(255,255,255,0.07)',
            overflowY: 'auto',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
            animation: 'slideInRight 0.22s ease',
          }}>
            <QuoteOverview
              quote={selectedQuote}
              onClose={handleClosePanel}
              onStatusChange={handleStatusChange}
            />
          </div>
        </>
      )}

      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
    </div>
  )
}
