'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getPocketBase } from '@/lib/pocketbase'
import { calculateQuote, USAGE_LABELS, USAGE_MULTIPLIERS } from '@/lib/benchmarks'
import { DISCIPLINES, CURRENCY_RATES } from '@/lib/constants'
import type { QuoteStatus, WorkingCurrency } from '@/types'
import { jsPDF } from 'jspdf'

const STATUS_COLORS: Record<QuoteStatus, { bg: string; text: string; border: string; label: string }> = {
  pending:    { bg: 'rgba(250,204,21,0.1)',   text: '#facc15',               border: 'rgba(250,204,21,0.25)',  label: 'Pending' },
  accepted:   { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80',               border: 'rgba(34,197,94,0.3)',    label: 'Accepted' },
  declined:   { bg: 'rgba(239,68,68,0.12)',   text: '#f87171',               border: 'rgba(239,68,68,0.3)',    label: 'Declined' },
  revised:    { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa',               border: 'rgba(59,130,246,0.3)',   label: 'Revised' },
  superseded: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.12)', label: 'Superseded' },
  expired:    { bg: 'rgba(249,115,22,0.1)',   text: '#f97316',               border: 'rgba(249,115,22,0.25)',  label: 'Expired' },
}

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', GBP: '£', USD: '$' }
const CONFIDENCE_COLORS: Record<string, string> = { High: '#4ade80', Medium: '#facc15', Low: '#f87171' }
const ALL_STATUSES: QuoteStatus[] = ['pending', 'accepted', 'declined', 'revised', 'superseded', 'expired']

function fmtAmount(eur: number | undefined | null, currency: string) {
  if (eur == null || isNaN(eur)) return '—'
  const rate = CURRENCY_RATES[currency as WorkingCurrency] ?? 1
  const sym  = CURRENCY_SYMBOLS[currency] ?? '€'
  return `${sym}${Math.round(eur * rate).toLocaleString()}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function QuoteOverview({
  quote,
  onClose,
  onStatusChange,
  onEdit,
}: {
  quote: any
  onClose: () => void
  onStatusChange: (id: string, status: QuoteStatus) => void
  onEdit?: () => void
}) {
  const { user } = useAuth()
  const cur     = quote.working_currency || 'EUR'
  const sym     = CURRENCY_SYMBOLS[cur] ?? '€'
  const rate    = CURRENCY_RATES[cur as WorkingCurrency] ?? 1

  const currentStatus: QuoteStatus = (quote.status || 'draft') as QuoteStatus
  const [status, setStatus]        = useState<QuoteStatus>(currentStatus)

  // Sync if the parent refreshes the quote record (e.g. after saving draft → ready)
  useEffect(() => {
    setStatus((quote.status || 'draft') as QuoteStatus)
  }, [quote.status])
  const [dropdownOpen, setDropdown] = useState(false)
  const [updating, setUpdating]    = useState(false)
  const [copied, setCopied]        = useState(false)

  const disciplineLabel = DISCIPLINES.find(d => d.value === quote.discipline)?.label ?? quote.discipline
  const colors          = STATUS_COLORS[status]

  const calc = quote.ai_assisted
    ? {
        base_min:     (quote.hours_min ?? 0) * (quote.hourly_rate ?? 0),
        base_max:     (quote.hours_max ?? 0) * (quote.hourly_rate ?? 0),
        revision_add: 0,
        rush_add:     quote.rush_job ? (quote.quote_mid ?? 0) * 0.25 : 0,
      }
    : calculateQuote({
        hours_min:       quote.hours_min ?? 0,
        hours_max:       quote.hours_max ?? 0,
        hourly_rate:     quote.hourly_rate ?? 0,
        revision_rounds: quote.revision_rounds ?? 0,
        revision_type:   quote.revision_type ?? 'Standard',
        usage_rights:    quote.usage_rights ?? 'Indie',
        rush_job:        quote.rush_job ?? false,
      })

  async function handleStatusSelect(next: QuoteStatus) {
    setDropdown(false)
    if (next === status) return
    setUpdating(true)
    try {
      const pb = getPocketBase()
      await pb.collection('quotes').update(quote.id, { status: next })
      setStatus(next)
      onStatusChange(quote.id, next)
    } catch { /* silent — stale optimistic update reverts on next fetch */ }
    finally { setUpdating(false) }
  }

  function buildSummaryText() {
    const min = fmtAmount(quote.quote_min, cur)
    const max = fmtAmount(quote.quote_max, cur)
    return [
      `Quote — ${disciplineLabel} · ${quote.asset_type} · ${quote.complexity_tier}`,
      `Experience: ${quote.experience_level} | Region: ${quote.country}`,
      `Rate: ${sym}${Math.round((quote.hourly_rate ?? 0) * rate)}/hr · Hours: ${quote.hours_min}–${quote.hours_max}h`,
      `Revisions: ${quote.revision_rounds} × ${quote.revision_type}`,
      `Usage: ${quote.usage_rights}${quote.rush_job ? ' · RUSH' : ''}`,
      ``,
      `Estimated: ${min} – ${max} ${cur}`,
      quote.notes ? `Notes: ${quote.notes}` : '',
    ].filter(Boolean).join('\n')
  }

  function handleExportPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210
    const margin = 20
    const col2 = 130
    let y = 20

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(242, 86, 35)
    doc.text('Lancer', margin, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(quote.project_name || 'Quote Summary', margin, y + 7)
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    doc.text(dateStr, W - margin, y + 7, { align: 'right' })

    y += 18
    doc.setDrawColor(60, 60, 70)
    doc.setLineWidth(0.3)
    doc.line(margin, y, W - margin, y)
    y += 8

    // From / To
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    if (quote.freelancer_name) {
      doc.setTextColor(100, 100, 110)
      doc.text('From', margin, y)
      doc.setTextColor(40, 40, 50)
      doc.text(quote.freelancer_name, margin + 18, y)
      y += 6
    }
    if (quote.client_name) {
      doc.setTextColor(100, 100, 110)
      doc.text('To', margin, y)
      doc.setTextColor(40, 40, 50)
      doc.text(quote.client_name, margin + 18, y)
      y += 6
    }
    if (quote.freelancer_name || quote.client_name) y += 4

    // Price hero
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.setTextColor(50, 50, 60)
    doc.text(`${fmtAmount(quote.quote_min, cur)} – ${fmtAmount(quote.quote_max, cur)}`, W / 2, y, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(cur, W / 2, y + 6, { align: 'center' })
    y += 18

    // Metadata
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text('PROJECT', margin, y)
    y += 5

    const metaRows: [string, string][] = [
      ['Discipline', `${disciplineLabel} · ${quote.asset_type ?? ''}`],
      ['Complexity', quote.complexity_tier ?? '—'],
      ['Experience', quote.experience_level ?? '—'],
      ['Region', quote.country ?? '—'],
    ]
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    for (const [label, value] of metaRows) {
      doc.setTextColor(100, 100, 110)
      doc.text(label, margin, y)
      doc.setTextColor(40, 40, 50)
      doc.text(value, col2, y)
      y += 6
    }
    y += 4

    // Breakdown
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text('BREAKDOWN', margin, y)
    y += 5

    const breakdownRows: [string, string][] = [
      ['Rate', `${sym}${Math.round((quote.hourly_rate ?? 0) * rate)}/hr`],
      ['Hours', `${quote.hours_min}–${quote.hours_max} hrs`],
      [`Revisions (${quote.revision_rounds} × ${quote.revision_type})`, ''],
      [`Usage (${quote.usage_rights})`, ''],
      ...(quote.rush_job ? [['Rush job', '+25%'] as [string, string]] : []),
    ]
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    for (const [label, value] of breakdownRows) {
      doc.setTextColor(100, 100, 110)
      doc.text(label, margin, y)
      if (value) { doc.setTextColor(40, 40, 50); doc.text(value, col2, y) }
      y += 6
    }

    if (quote.notes) {
      y += 4
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.text('NOTES', margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 70)
      const noteLines = doc.splitTextToSize(quote.notes, W - margin * 2)
      doc.text(noteLines, margin, y)
    }

    doc.setDrawColor(200, 200, 210)
    doc.line(margin, 272, W - margin, 272)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 170)
    doc.text('Generated by Lancer · lancer.app', margin, 277)

    if (user?.tier === 'tester') {
      const pages = doc.getNumberOfPages()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(52)
      doc.setTextColor(180, 180, 180)
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i)
        doc.text('ALPHA', 105, 148, { align: 'center', angle: 45 })
      }
    }

    const slug = (disciplineLabel ?? 'quote').toLowerCase().replace(/\s+/g, '-')
    const datePart = new Date().toISOString().slice(0, 10)
    doc.save(`lancer-quote-${slug}-${datePart}.pdf`)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummaryText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Panel header */}
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
            {quote.project_name || 'Quote overview'}
          </div>
          {quote.project_name && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
              {disciplineLabel} · {quote.asset_type}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            cursor: 'pointer', color: 'rgba(239,68,68,0.8)',
            width: '28px', height: '28px', borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            padding: 0,
          }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* Price hero */}
        <div style={{
          background: 'rgba(242,86,35,0.07)', border: '0.5px solid rgba(242,86,35,0.2)',
          borderRadius: '10px', padding: '16px', marginBottom: '14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
            Estimated range
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#f78560', letterSpacing: '-0.02em' }}>
            {fmtAmount(quote.quote_min, cur)} – {fmtAmount(quote.quote_max, cur)}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
            {cur}
          </div>
          {quote.confidence && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: CONFIDENCE_COLORS[quote.confidence] ?? '#fff' }} />
              <span style={{ fontSize: '11px', color: CONFIDENCE_COLORS[quote.confidence] ?? '#fff' }}>
                {quote.confidence} confidence
              </span>
              {quote.confidence_reason && (
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>— {quote.confidence_reason}</span>
              )}
            </div>
          )}
        </div>

        {/* AI pill badge */}
        {quote.ai_assisted && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '20px', marginBottom: '10px',
            background: 'rgba(242,86,35,0.12)', border: '1px solid rgba(242,86,35,0.25)',
            fontSize: '11px', color: '#f78560', width: 'fit-content',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.1-5.28a2.5 2.5 0 0 1 .02-1.04l1.08-5.24A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.1-5.28a2.5 2.5 0 0 0-.02-1.04l-1.08-5.24A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
            AI-assisted quote
          </div>
        )}

        {/* Metadata */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '10px', padding: '12px', marginBottom: '14px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {quote.project_name && <Row label="Project" value={quote.project_name} valueColor="rgba(255,255,255,0.85)" />}
          {quote.client_name && <Row label="Client" value={quote.client_name} valueColor="#f78560" />}
          <Row label="Discipline" value={`${disciplineLabel} · ${quote.asset_type}`} />
          <Row label="Complexity" value={quote.complexity_tier} />
          <Row label="Experience" value={quote.experience_level} />
          <Row label="Region" value={quote.country} />
          <Row label="Created" value={fmtDate(quote.created)} />
        </div>

        {/* Breakdown */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '10px', padding: '12px', marginBottom: '14px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>
            Breakdown
          </div>
          {[
            { label: 'Rate',       value: `${fmtAmount(quote.hourly_rate, cur)}/hr` },
            { label: 'Hours',      value: `${quote.hours_min}–${quote.hours_max} hrs` },
            { label: 'Base range', value: `${fmtAmount(calc.base_min, cur)} – ${fmtAmount(calc.base_max, cur)}` },
            ...(calc.revision_add > 0 ? [{ label: `Revisions (${quote.revision_rounds} × ${quote.revision_type})`, value: `+${fmtAmount(calc.revision_add, cur)}` }] : []),
            ...(calc.rush_add > 0 ? [{ label: 'Rush (+25%)', value: `+${fmtAmount(calc.rush_add, cur)}` }] : []),
            {
              label: `Usage (${USAGE_LABELS[quote.usage_rights ?? 'Indie']})`,
              value: quote.usage_rights === 'Personal' ? 'base rate' : `×${USAGE_MULTIPLIERS[quote.usage_rights ?? 'Indie'].toFixed(2)}`,
            },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{row.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
          {quote.notes && (
            <div style={{ marginTop: '6px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>Notes</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{quote.notes}</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {(() => {
          const STAGES: QuoteStatus[] = ['pending', 'revised', 'accepted']
          const IDX: Record<QuoteStatus, number> = { pending: 0, revised: 1, accepted: 2, declined: -1, superseded: -1, expired: -1 }
          const CLRS: Record<QuoteStatus, string> = { pending: '#facc15', revised: '#60a5fa', accepted: '#4ade80', declined: '#f87171', superseded: 'rgba(255,255,255,0.4)', expired: '#f97316' }
          const curIdx = IDX[status]
          const isTerminal = curIdx === -1
          return (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {STAGES.map((s, i) => {
                const filled = !isTerminal && i <= curIdx
                const isNext = !isTerminal && i === curIdx + 1
                const bg = isTerminal
                  ? CLRS[status]
                  : filled
                    ? CLRS[status]
                    : isNext ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'
                return <div key={s} title={STATUS_COLORS[s].label} style={{ flex: 1, height: '3px', borderRadius: '2px', background: bg }} />
              })}
            </div>
          )
        })()}

        {/* Status badge + dropdown */}
        <div style={{ marginBottom: '14px', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>Status</div>
          <button
            onClick={() => setDropdown(o => !o)}
            disabled={updating}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px',
              background: colors.bg, border: `0.5px solid ${colors.border}`,
              color: colors.text, fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', opacity: updating ? 0.6 : 1,
            }}
          >
            {colors.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 50,
              background: 'rgba(20,20,28,0.98)', border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '4px', marginTop: '4px',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {ALL_STATUSES.map(s => {
                const c = STATUS_COLORS[s]
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusSelect(s)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '7px 10px', borderRadius: '7px',
                      background: s === status ? 'rgba(255,255,255,0.05)' : 'none',
                      border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: c.text,
                    }}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Edit button — pending/revised only */}
        {(status === 'pending' || status === 'revised') && onEdit && (
          <button
            onClick={onEdit}
            style={{
              width: '100%', padding: '9px 14px', borderRadius: '8px', marginBottom: '8px',
              background: 'rgba(242,86,35,0.1)', border: '0.5px solid rgba(242,86,35,0.3)',
              color: '#f78560', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            }}
          >Continue editing →</button>
        )}

        {/* Copy summary */}
        <button
          onClick={handleCopy}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
            color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)',
            fontSize: '12px', cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy summary'}
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPDF}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer',
          }}
        >
          Export PDF
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '11px', color: valueColor || 'rgba(255,255,255,0.65)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
