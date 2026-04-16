'use client'

import { useState, useEffect } from 'react'
import { getPocketBase } from '@/lib/pocketbase'
import { DISCIPLINES, CURRENCY_RATES } from '@/lib/constants'
import type { QuoteStatus, WorkingCurrency } from '@/types'
import { jsPDF } from 'jspdf'

const STATUS_COLORS: Record<QuoteStatus, { bg: string; text: string; border: string; label: string }> = {
  draft:     { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.15)', label: 'Draft' },
  ready:     { bg: 'rgba(242,86,35,0.1)',    text: '#f78560',               border: 'rgba(242,86,35,0.25)',   label: 'Ready' },
  sent:      { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa',               border: 'rgba(59,130,246,0.3)',   label: 'Sent' },
  accepted:  { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80',               border: 'rgba(34,197,94,0.3)',    label: 'Accepted' },
  rejected:  { bg: 'rgba(239,68,68,0.12)',   text: '#f87171',               border: 'rgba(239,68,68,0.3)',    label: 'Rejected' },
  completed: { bg: 'rgba(168,85,247,0.12)',  text: '#c084fc',               border: 'rgba(168,85,247,0.3)',   label: 'Completed' },
}

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', GBP: '£', USD: '$' }
const ALL_STATUSES: QuoteStatus[] = ['draft', 'ready', 'sent', 'accepted', 'rejected', 'completed']

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
    doc.text('Quote Summary', margin, y + 7)
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    doc.text(dateStr, W - margin, y + 7, { align: 'right' })

    y += 18
    doc.setDrawColor(60, 60, 70)
    doc.setLineWidth(0.3)
    doc.line(margin, y, W - margin, y)
    y += 12

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
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
          Quote overview
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: '18px', lineHeight: 1, padding: '2px 4px',
          }}
        >×</button>
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
        </div>

        {/* Metadata */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '10px', padding: '12px', marginBottom: '14px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <Row label="Discipline" value={`${disciplineLabel} · ${quote.asset_type}`} />
          <Row label="Complexity" value={quote.complexity_tier} />
          <Row label="Experience" value={quote.experience_level} />
          <Row label="Region" value={quote.country} />
          <Row label="Created" value={fmtDate(quote.created)} />
          {quote.ai_assisted && <Row label="AI-assisted" value="Yes" valueColor="#f78560" />}
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
          <Row label={`Rate × hours`} value={`${sym}${Math.round((quote.hourly_rate ?? 0) * rate)}/hr · ${quote.hours_min}–${quote.hours_max}h`} />
          <Row label="Revisions" value={`${quote.revision_rounds} × ${quote.revision_type}`} />
          <Row label="Usage rights" value={quote.usage_rights} />
          {quote.rush_job && <Row label="Rush job" value="+25%" valueColor="#facc15" />}
          {quote.notes && <Row label="Notes" value={quote.notes} />}
        </div>

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
              {ALL_STATUSES.filter(s => s !== 'draft' || status === 'draft').map(s => {
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

        {/* Edit button — drafts only */}
        {status === 'draft' && onEdit && (
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
