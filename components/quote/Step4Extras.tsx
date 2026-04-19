'use client'

import { useState } from 'react'
import { useQuote } from './QuoteContext'
import { calculateQuote, USAGE_LABELS, USAGE_MULTIPLIERS } from '@/lib/benchmarks'
import { CURRENCY_RATES } from '@/lib/constants'
import type { UsageRights, RevisionType, WorkingCurrency, PaymentSchedule } from '@/types'

const REVISION_TYPES: { value: RevisionType; label: string; desc: string }[] = [
  { value: 'Minor',    label: 'Minor',    desc: 'Tweaks & small adjustments' },
  { value: 'Standard', label: 'Standard', desc: 'Meaningful feedback rounds' },
  { value: 'Major',    label: 'Major',    desc: 'Significant rework' },
]

const USAGE_OPTIONS: UsageRights[] = ['Personal', 'Indie', 'Commercial', 'AAA', 'Exclusive']

function fmt(eur: number, currency: WorkingCurrency, symbol: string) {
  const converted = eur * (CURRENCY_RATES[currency] ?? 1)
  return `${symbol}${Math.round(converted).toLocaleString()}`
}

export default function Step4Extras({ workingCurrency, currencySymbol }: {
  workingCurrency: WorkingCurrency
  currencySymbol: string
}) {
  const { data, next, back } = useQuote()

  const [revRounds,       setRevRounds]       = useState(data.revision_rounds ?? 2)
  const [revType,         setRevType]         = useState<RevisionType>(data.revision_type ?? 'Standard')
  const [usage,           setUsage]           = useState<UsageRights>(data.usage_rights ?? 'Indie')
  const [rush,            setRush]            = useState(data.rush_job ?? false)
  const [clientName,      setClientName]      = useState(data.client_name ?? '')
  const [clientBudget,    setClientBudget]    = useState(data.client_budget ?? 0)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule>(data.payment_schedule ?? 'single')
  const [taxRate,         setTaxRate]         = useState(data.tax_rate ?? 0)
  const [notes,           setNotes]           = useState(data.notes ?? '')

  const preview = calculateQuote({
    hours_min: data.hours_min ?? 0,
    hours_max: data.hours_max ?? 0,
    hourly_rate: data.hourly_rate ?? 0,
    revision_rounds: revRounds,
    revision_type: revType,
    usage_rights: usage,
    rush_job: rush,
  })

  function handleNext() {
    next({
      revision_rounds: revRounds, revision_type: revType, usage_rights: usage, rush_job: rush,
      client_name: clientName, client_budget: clientBudget, payment_schedule: paymentSchedule,
      tax_rate: taxRate, notes,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Revision rounds */}
      <div>
        <div className="label" style={{ marginBottom: '10px' }}>Revision Rounds</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setRevRounds(v => Math.max(0, v - 1))}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '16px', cursor: 'pointer',
            }}
          >−</button>
          <span style={{ fontSize: '22px', fontWeight: 600, color: '#fff', minWidth: '24px', textAlign: 'center' }}>
            {revRounds}
          </span>
          <button
            onClick={() => setRevRounds(v => Math.min(10, v + 1))}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '16px', cursor: 'pointer',
            }}
          >+</button>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            {revRounds === 0 ? 'No revisions included' : `${revRounds} round${revRounds > 1 ? 's' : ''} included`}
          </span>
        </div>
      </div>

      {/* Revision type */}
      {revRounds > 0 && (
        <div>
          <div className="label" style={{ marginBottom: '8px' }}>Revision Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {REVISION_TYPES.map(rt => {
              const selected = revType === rt.value
              return (
                <button
                  key={rt.value}
                  onClick={() => setRevType(rt.value)}
                  style={{
                    padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
                    background: selected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selected ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
                    color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontWeight: selected ? 600 : 400,
                    fontSize: '12px', transition: 'all 0.15s', textAlign: 'center',
                  }}
                >
                  <div>{rt.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{rt.desc}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Usage rights */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Usage Rights</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {USAGE_OPTIONS.map(opt => {
            const selected = usage === opt
            const mult = USAGE_MULTIPLIERS[opt]
            return (
              <button
                key={opt}
                onClick={() => setUsage(opt)}
                style={{
                  padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                  background: selected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '13px', color: selected ? '#fff' : 'rgba(255,255,255,0.65)', fontWeight: selected ? 600 : 400 }}>
                  {USAGE_LABELS[opt]}
                </span>
                <span style={{ fontSize: '11px', color: selected ? '#f78560' : 'rgba(255,255,255,0.25)' }}>
                  {mult === 1 ? 'base' : `×${mult.toFixed(2)}`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rush job */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Rush Job</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[false, true].map(val => {
            const selected = rush === val
            return (
              <button
                key={String(val)}
                onClick={() => setRush(val)}
                style={{
                  padding: '10px', borderRadius: '8px', cursor: 'pointer',
                  background: selected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
                  color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: selected ? 600 : 400,
                  fontSize: '13px', transition: 'all 0.15s', textAlign: 'center',
                }}
              >
                {val ? 'Rush (+25%)' : 'Standard'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Client name */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Client name (optional)</div>
        <input
          type="text"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          placeholder="Studio or client name..."
          style={{
            width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>

      {/* Client budget */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Client budget (optional)</div>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '13px', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
          }}>{currencySymbol}</span>
          <input
            type="number"
            min={0}
            value={clientBudget || ''}
            onChange={e => setClientBudget(Number(e.target.value) || 0)}
            placeholder="0"
            style={{
              width: '100%', padding: '10px 12px 10px 26px', borderRadius: '8px', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Payment schedule */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Payment schedule</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {([
            { value: 'single',    label: 'Single',    sub: 'Full on delivery' },
            { value: 'half_half', label: '50 / 50',   sub: 'Upfront + delivery' },
            { value: 'milestone', label: 'Milestones', sub: 'Custom schedule' },
          ] as { value: PaymentSchedule; label: string; sub: string }[]).map(opt => {
            const selected = paymentSchedule === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setPaymentSchedule(opt.value)}
                style={{
                  padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
                  background: selected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
                  color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: selected ? 600 : 400,
                  fontSize: '12px', transition: 'all 0.15s', textAlign: 'center',
                }}
              >
                <div>{opt.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{opt.sub}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tax / VAT */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Tax / VAT % (optional)</div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            min={0}
            max={100}
            value={taxRate || ''}
            onChange={e => setTaxRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
            placeholder="0"
            style={{
              width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontFamily: 'inherit', outline: 'none',
            }}
          />
          <span style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '13px', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
          }}>%</span>
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
          EU B2B reverse charge? Set to 0 and mention in notes.
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Notes (optional)</div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional scope, assumptions, exclusions..."
          style={{
            width: '100%', minHeight: '70px', resize: 'vertical',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '10px 12px',
            fontSize: '13px', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.5, fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Live preview */}
      <div style={{
        background: 'rgba(242,86,35,0.08)', border: '1px solid rgba(242,86,35,0.2)',
        borderRadius: '10px', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Estimated total</span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#f78560' }}>
          {fmt(preview.quote_min, workingCurrency, currencySymbol)} – {fmt(preview.quote_max, workingCurrency, currencySymbol)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={back} className="btn-ghost" style={{ flex: 1 }}>← Back</button>
        <button onClick={handleNext} className="btn-accent" style={{ flex: 2 }}>Review Quote →</button>
      </div>
    </div>
  )
}
