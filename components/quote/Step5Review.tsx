'use client'

import { useState } from 'react'
import { useQuote } from './QuoteContext'
import { calculateQuote, USAGE_LABELS, USAGE_MULTIPLIERS } from '@/lib/benchmarks'
import { CURRENCY_RATES, DISCIPLINES, TIER_LIMITS } from '@/lib/constants'
import { getPocketBase } from '@/lib/pocketbase'
import type { WorkingCurrency, UserProfile } from '@/types'
import { jsPDF } from 'jspdf'

function fmt(eur: number, currency: WorkingCurrency, symbol: string, round = true) {
  const converted = eur * (CURRENCY_RATES[currency] ?? 1)
  return `${symbol}${round ? Math.round(converted).toLocaleString() : converted.toFixed(2)}`
}

const CONFIDENCE_COLORS: Record<string, string> = {
  High:   '#4ade80',
  Medium: '#facc15',
  Low:    '#f87171',
}

export default function Step5Review({ user, onSaved, onRestart }: {
  user: UserProfile
  onSaved: (id: string) => void
  onRestart?: () => void
}) {
  const { data, back, draftId } = useQuote()
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const [error,  setError]    = useState('')
  const [copied, setCopied]   = useState(false)

  const currency = (user.working_currency || 'EUR') as WorkingCurrency
  const symbol   = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'

  // Use pre-computed values if AI-assisted, otherwise compute now
  const calc = data.ai_assisted
    ? {
        base_min:     (data.hours_min ?? 0) * (data.hourly_rate ?? 0),
        base_max:     (data.hours_max ?? 0) * (data.hourly_rate ?? 0),
        revision_add: 0,
        rush_add:     data.rush_job ? (data.quote_mid ?? 0) * 0.25 : 0,
        quote_min:    data.quote_min ?? 0,
        quote_max:    data.quote_max ?? 0,
        quote_mid:    data.quote_mid ?? 0,
      }
    : calculateQuote({
        hours_min:       data.hours_min ?? 0,
        hours_max:       data.hours_max ?? 0,
        hourly_rate:     data.hourly_rate ?? 0,
        revision_rounds: data.revision_rounds ?? 0,
        revision_type:   data.revision_type ?? 'Standard',
        usage_rights:    data.usage_rights ?? 'Indie',
        rush_job:        data.rush_job ?? false,
      })

  const disciplineLabel = DISCIPLINES.find(d => d.value === data.discipline)?.label ?? data.discipline
  const isFree          = user.tier === 'free'

  const taxRate      = data.tax_rate ?? 0
  const taxMin       = calc.quote_min * (taxRate / 100)
  const taxMax       = calc.quote_max * (taxRate / 100)
  const totalMin     = calc.quote_min + taxMin
  const totalMax     = calc.quote_max + taxMax
  const clientBudget = data.client_budget ?? 0
  const overBudget   = clientBudget > 0 && calc.quote_min > clientBudget

  function buildSummaryText() {
    return [
      `Quote — ${disciplineLabel} · ${data.asset_type} · ${data.complexity_tier}`,
      `Experience: ${data.experience_level} | Region: ${data.country}`,
      `Rate: ${fmt(data.hourly_rate ?? 0, currency, symbol)}/hr · Hours: ${data.hours_min}–${data.hours_max}h`,
      `Revisions: ${data.revision_rounds} × ${data.revision_type}`,
      `Usage: ${USAGE_LABELS[data.usage_rights ?? 'Indie']}${data.rush_job ? ' · RUSH' : ''}`,
      ``,
      `Estimated: ${fmt(calc.quote_min, currency, symbol)} – ${fmt(calc.quote_max, currency, symbol)} ${currency}`,
      data.notes ? `Notes: ${data.notes}` : '',
    ].filter(Boolean).join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummaryText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  function handleExportPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210
    const margin = 20
    const col2 = 130
    let y = 20

    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(242, 86, 35)
    doc.text('Lancer', margin, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(160, 160, 160)
    doc.text(data.project_name ? data.project_name : 'Quote Summary', margin, y + 7)

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    doc.text(dateStr, W - margin, y + 7, { align: 'right' })

    y += 18
    doc.setDrawColor(60, 60, 70)
    doc.setLineWidth(0.3)
    doc.line(margin, y, W - margin, y)
    y += 8

    // ── From / To ────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    if (user.name) {
      doc.setTextColor(100, 100, 110)
      doc.text('From', margin, y)
      doc.setTextColor(40, 40, 50)
      doc.text(user.name, margin + 18, y)
      y += 6
    }
    if (data.client_name) {
      doc.setTextColor(100, 100, 110)
      doc.text('To', margin, y)
      doc.setTextColor(40, 40, 50)
      doc.text(data.client_name, margin + 18, y)
      y += 6
    }
    y += 6

    // ── Price hero ───────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.setTextColor(40, 40, 50)
    const priceStr = `${fmt(calc.quote_min, currency, symbol)} – ${fmt(calc.quote_max, currency, symbol)}`
    doc.text(priceStr, W / 2, y, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 130)
    doc.text(currency, W / 2, y + 6, { align: 'center' })
    y += 18

    // ── Metadata section ─────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 130)
    doc.text('PROJECT', margin, y)
    y += 5

    const metaRows: [string, string][] = [
      ['Discipline', `${disciplineLabel} · ${data.asset_type ?? ''}`],
      ['Complexity', data.complexity_tier ?? '—'],
      ['Experience', data.experience_level ?? '—'],
      ['Region', data.country ?? '—'],
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

    // ── Breakdown section ────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 130)
    doc.text('BREAKDOWN', margin, y)
    y += 5

    const breakdownRows: [string, string][] = [
      ['Rate', `${fmt(data.hourly_rate ?? 0, currency, symbol)}/hr`],
      ['Hours', `${data.hours_min}–${data.hours_max} hrs`],
      ['Base range', `${fmt(calc.base_min, currency, symbol)} – ${fmt(calc.base_max, currency, symbol)}`],
      ...(calc.revision_add > 0
        ? [[`Revisions (${data.revision_rounds} × ${data.revision_type})`, `+${fmt(calc.revision_add, currency, symbol)}`] as [string, string]]
        : []),
      ...(calc.rush_add > 0
        ? [['Rush (+25%)', `+${fmt(calc.rush_add, currency, symbol)}`] as [string, string]]
        : []),
      [`Usage (${USAGE_LABELS[data.usage_rights ?? 'Indie']})`,
        data.usage_rights === 'Personal' ? 'base rate' : `×${USAGE_MULTIPLIERS[data.usage_rights ?? 'Indie'].toFixed(2)}`],
    ]

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    for (const [label, value] of breakdownRows) {
      doc.setTextColor(100, 100, 110)
      doc.text(label, margin, y)
      doc.setTextColor(40, 40, 50)
      doc.text(value, col2, y)
      y += 6
    }

    // ── Notes ────────────────────────────────────────────────────────────────
    if (data.notes) {
      y += 4
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 130)
      doc.text('NOTES', margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 70)
      const noteLines = doc.splitTextToSize(data.notes, W - margin * 2)
      doc.text(noteLines, margin, y)
      y += noteLines.length * 5
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.setDrawColor(200, 200, 210)
    doc.line(margin, 272, W - margin, 272)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 160)
    doc.text('Generated by Lancer · lancer.app', margin, 277)

    if (user.tier === 'tester') {
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

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      // Quota gate — only on brand-new quotes (not completing an existing draft)
      if (!draftId) {
        const tier = user.tier || 'free'
        const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]?.quotes_per_month ?? 10
        if ((user.quotes_used_this_month ?? 0) >= limit) {
          setError(`Quote limit reached (${limit}/month on ${tier} plan).`)
          setSaving(false)
          return
        }
      }
      const pb = getPocketBase()
      const payload = {
        user:             user.id,
        discipline:       data.discipline,
        asset_type:       data.asset_type,
        complexity_tier:  data.complexity_tier,
        experience_level: data.experience_level,
        region:           data.region,
        country:          data.country,
        hourly_rate:      data.hourly_rate,
        hours_min:        data.hours_min,
        hours_max:        data.hours_max,
        revision_rounds:  data.revision_rounds,
        revision_type:    data.revision_type,
        usage_rights:     data.usage_rights,
        rush_job:         data.rush_job,
        project_name:     data.project_name || '',
        client_name:      data.client_name || '',
        client_budget:    data.client_budget || 0,
        payment_schedule: data.payment_schedule || 'single',
        tax_rate:         data.tax_rate || 0,
        freelancer_name:  user.name || '',
        notes:            data.notes,
        client_brief:     data.client_brief,
        quote_min:        calc.quote_min,
        quote_max:        calc.quote_max,
        quote_mid:        calc.quote_mid,
        working_currency: currency,
        ai_assisted:      data.ai_assisted,
        confidence:       data.confidence || '',
        confidence_reason: data.confidence_reason || '',
        status:           'pending',
        draft_step:       5,
      }
      let savedId: string
      if (draftId) {
        // Complete an existing draft
        const record = await pb.collection('quotes').update(draftId, payload)
        savedId = record.id
      } else {
        // Brand new quote
        const record = await pb.collection('quotes').create(payload)
        savedId = record.id
        // Increment quota counter only on first create (not draft updates)
        await pb.collection('users').update(user.id, {
          quotes_used_this_month: (user.quotes_used_this_month ?? 0) + 1,
        })
      }
      setSaved(true)
      onSaved(savedId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed — check PocketBase is running.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* AI badge */}
      {data.ai_assisted && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: '20px',
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

      {/* Price range — hero */}
      <div style={{
        background: 'rgba(242,86,35,0.08)', border: '1px solid rgba(242,86,35,0.2)',
        borderRadius: '14px', padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Estimated quote
        </div>
        <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
          {fmt(calc.quote_min, currency, symbol)}
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '24px' }}> – </span>
          {fmt(calc.quote_max, currency, symbol)}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>{currency}</div>

        {/* Confidence */}
        {data.confidence && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: CONFIDENCE_COLORS[data.confidence] ?? '#fff',
            }} />
            <span style={{ fontSize: '12px', color: CONFIDENCE_COLORS[data.confidence] ?? '#fff' }}>
              {data.confidence} confidence
            </span>
            {data.confidence_reason && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                — {data.confidence_reason}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Client budget indicator */}
      {clientBudget > 0 && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px', fontSize: '12px',
          background: overBudget ? 'rgba(251,191,36,0.08)' : 'rgba(74,222,128,0.08)',
          border: `1px solid ${overBudget ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.25)'}`,
          color: overBudget ? '#fbbf24' : '#4ade80',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>{overBudget ? '⚠' : '✓'}</span>
          <span>
            {overBudget
              ? `Quote starts at ${fmt(calc.quote_min, currency, symbol)} — above the client's budget of ${fmt(clientBudget, currency, symbol)}`
              : `Quote of ${fmt(calc.quote_min, currency, symbol)}–${fmt(calc.quote_max, currency, symbol)} is within the client's budget of ${fmt(clientBudget, currency, symbol)}`
            }
          </span>
        </div>
      )}

      {/* Breakdown */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
          Breakdown
        </div>

        {[
          { label: disciplineLabel ?? '',       value: data.asset_type ?? '' },
          { label: 'Complexity',               value: data.complexity_tier ?? '' },
          { label: 'Experience',               value: data.experience_level ?? '' },
          { label: 'Location',                 value: data.country ?? '' },
          { label: 'Rate',                     value: `${fmt(data.hourly_rate ?? 0, currency, symbol)}/hr` },
          { label: 'Hours',                    value: `${data.hours_min}–${data.hours_max} hrs` },
          {
            label: 'Base range',
            value: `${fmt(calc.base_min, currency, symbol)} – ${fmt(calc.base_max, currency, symbol)}`,
          },
          ...(calc.revision_add > 0 ? [{
            label: `Revisions (${data.revision_rounds} × ${data.revision_type})`,
            value: `+${fmt(calc.revision_add, currency, symbol)}`,
          }] : []),
          ...(calc.rush_add > 0 ? [{
            label: 'Rush (+25%)',
            value: `+${fmt(calc.rush_add, currency, symbol)}`,
          }] : []),
          {
            label: `Usage (${USAGE_LABELS[data.usage_rights ?? 'Indie']})`,
            value: data.usage_rights === 'Personal' ? 'base rate' : `×${USAGE_MULTIPLIERS[data.usage_rights ?? 'Indie'].toFixed(2)}`,
          },
          ...(data.payment_schedule && data.payment_schedule !== 'single' ? [{
            label: 'Payment',
            value: data.payment_schedule === 'half_half' ? '50% upfront / 50% delivery' : 'Milestones (see notes)',
          }] : []),
          ...(taxRate > 0 ? [
            { label: 'Subtotal', value: `${fmt(calc.quote_min, currency, symbol)} – ${fmt(calc.quote_max, currency, symbol)}` },
            { label: `Tax / VAT (${taxRate}%)`, value: `+${fmt(taxMin, currency, symbol)} – +${fmt(taxMax, currency, symbol)}` },
            { label: 'Total incl. tax', value: `${fmt(totalMin, currency, symbol)} – ${fmt(totalMax, currency, symbol)}` },
          ] : []),
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}

        {data.notes && (
          <div style={{ marginTop: '6px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>Notes</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{data.notes}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={handleCopy} className="btn-ghost" style={{ width: '100%' }}>
          {copied ? '✓ Copied to clipboard' : 'Copy quote summary'}
        </button>

        {!saved ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-accent"
            style={{ width: '100%' }}
          >
            {saving ? 'Saving...' : 'Save Quote'}
          </button>
        ) : (
          <div style={{
            padding: '10px', borderRadius: '8px', textAlign: 'center',
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
            fontSize: '13px', color: '#4ade80',
          }}>
            ✓ Quote saved
          </div>
        )}

        {/* PDF export — locked for free */}
        <button
          onClick={isFree ? undefined : handleExportPDF}
          disabled={isFree}
          style={{
            width: '100%', padding: '0.65rem 1.5rem', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: isFree ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
            color: isFree ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
            fontSize: '13px', cursor: isFree ? 'default' : 'pointer',
            textAlign: 'center', position: 'relative',
          }}
        >
          Export PDF
          <span style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
            color: '#22c55e', background: 'rgba(34,197,94,0.15)',
            border: '1px solid #22c55e', lineHeight: 1.4,
          }}>Basic</span>
        </button>

        {error && (
          <div style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>{error}</div>
        )}
      </div>

      {!saved && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={back} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>
            ← Adjust
          </button>
          <button
            onClick={onRestart}
            style={{ fontSize: '12px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Start over
          </button>
        </div>
      )}
    </div>
  )
}
