'use client'

import { useState, useEffect } from 'react'
import { useQuote } from './QuoteContext'
import { getSuggestedRate, getSuggestedHours, calculateQuote } from '@/lib/benchmarks'
import { CURRENCY_RATES } from '@/lib/constants'
import type { Discipline, WorkingCurrency } from '@/types'

function fmt(eur: number, currency: WorkingCurrency, symbol: string) {
  const converted = eur * (CURRENCY_RATES[currency] ?? 1)
  return `${symbol}${Math.round(converted).toLocaleString()}`
}

export default function Step3RateHours({ workingCurrency, currencySymbol }: {
  workingCurrency: WorkingCurrency
  currencySymbol: string
}) {
  const { data, next, back } = useQuote()

  const discipline    = data.discipline as Discipline
  const assetType     = data.asset_type ?? ''
  const complexity    = data.complexity_tier ?? 'Mid'
  const region        = data.region ?? ''
  const country       = data.country ?? ''
  const experience    = data.experience_level ?? 'Mid'

  const suggestedRate  = getSuggestedRate(discipline, region, country, experience)
  const suggestedHours = getSuggestedHours(discipline, assetType, complexity)

  // Convert EUR ↔ working currency
  const rate2display = (eur: number) => Math.round(eur * (CURRENCY_RATES[workingCurrency] ?? 1))
  const display2eur  = (val: number) => val / (CURRENCY_RATES[workingCurrency] ?? 1)

  const [rateCustom, setRateCustom]   = useState(data.rate_is_custom ?? false)
  const [hoursCustom, setHoursCustom] = useState(data.hours_are_custom ?? false)

  // displayRate is always in working currency for the input
  const [displayRate, setDisplayRate] = useState(
    data.rate_is_custom && data.hourly_rate ? rate2display(data.hourly_rate) : rate2display(suggestedRate)
  )
  const [hoursMin, setHoursMin] = useState(data.hours_min ?? suggestedHours.min)
  const [hoursMax, setHoursMax] = useState(data.hours_max ?? suggestedHours.max)

  // EUR rate used for calculations and storage
  const rateEur = rateCustom ? display2eur(displayRate) : suggestedRate

  // When user turns off custom toggles, reset to suggested
  useEffect(() => { if (!rateCustom) setDisplayRate(rate2display(suggestedRate)) }, [rateCustom, suggestedRate, workingCurrency])
  useEffect(() => {
    if (!hoursCustom) {
      setHoursMin(suggestedHours.min)
      setHoursMax(suggestedHours.max)
    }
  }, [hoursCustom, suggestedHours.min, suggestedHours.max])

  const preview = calculateQuote({
    hours_min: hoursMin, hours_max: hoursMax, hourly_rate: rateEur,
    revision_rounds: data.revision_rounds ?? 2,
    revision_type: data.revision_type ?? 'Standard',
    usage_rights: data.usage_rights ?? 'Indie',
    rush_job: data.rush_job ?? false,
  })

  function handleNext() {
    next({
      hourly_rate: rateEur,
      hours_min: hoursMin,
      hours_max: hoursMax,
      rate_is_custom: rateCustom,
      hours_are_custom: hoursCustom,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hourly Rate */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div className="label">Hourly Rate</div>
            {!rateCustom && (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                {region.replace('_', ' ')} · {experience} · benchmark
              </div>
            )}
          </div>
          <button
            onClick={() => setRateCustom(v => !v)}
            style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: rateCustom ? 'rgba(242,86,35,0.15)' : 'rgba(255,255,255,0.07)',
              color: rateCustom ? '#f78560' : 'rgba(255,255,255,0.4)',
            }}
          >
            {rateCustom ? 'Use benchmark' : 'Custom rate'}
          </button>
        </div>

        {rateCustom ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>{currencySymbol}</span>
            <input
              type="number"
              value={displayRate}
              min={1}
              onChange={e => setDisplayRate(Number(e.target.value))}
              className="input"
              style={{ flex: 1, fontSize: '20px', fontWeight: 600 }}
            />
          </div>
        ) : (
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
            {fmt(suggestedRate, workingCurrency, currencySymbol)}<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>/hr</span>
          </div>
        )}
      </div>

      {/* Estimated Hours */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div className="label">Estimated Hours</div>
            {!hoursCustom && (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                {assetType} · {complexity} · benchmark range
              </div>
            )}
          </div>
          <button
            onClick={() => setHoursCustom(v => !v)}
            style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: hoursCustom ? 'rgba(242,86,35,0.15)' : 'rgba(255,255,255,0.07)',
              color: hoursCustom ? '#f78560' : 'rgba(255,255,255,0.4)',
            }}
          >
            {hoursCustom ? 'Use estimate' : 'Custom hours'}
          </button>
        </div>

        {hoursCustom ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              value={hoursMin}
              min={1}
              onChange={e => setHoursMin(Number(e.target.value))}
              className="input"
              style={{ flex: 1, fontSize: '18px', fontWeight: 600 }}
              placeholder="Min"
            />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>–</span>
            <input
              type="number"
              value={hoursMax}
              min={hoursMin}
              onChange={e => setHoursMax(Number(e.target.value))}
              className="input"
              style={{ flex: 1, fontSize: '18px', fontWeight: 600 }}
              placeholder="Max"
            />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>hrs</span>
          </div>
        ) : (
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
            {suggestedHours.min}–{suggestedHours.max}
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}> hrs</span>
          </div>
        )}
      </div>

      {/* Live preview */}
      <div style={{
        background: 'rgba(242,86,35,0.08)', border: '1px solid rgba(242,86,35,0.2)',
        borderRadius: '10px', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Estimated base range</span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#f78560' }}>
          {fmt(preview.quote_min, workingCurrency, currencySymbol)} – {fmt(preview.quote_max, workingCurrency, currencySymbol)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={back} className="btn-ghost" style={{ flex: 1 }}>← Back</button>
        <button onClick={handleNext} className="btn-accent" style={{ flex: 2 }}>Continue →</button>
      </div>
    </div>
  )
}
