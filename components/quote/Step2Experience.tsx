'use client'

import { useState } from 'react'
import { useQuote } from './QuoteContext'
import { REGIONS } from '@/lib/constants'
import type { ExperienceLevel } from '@/types'

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'Junior',  label: 'Junior',  desc: '0–2 years' },
  { value: 'Mid',     label: 'Mid',     desc: '2–5 years' },
  { value: 'Senior',  label: 'Senior',  desc: '5–10 years' },
  { value: 'Veteran', label: 'Veteran', desc: '10+ years' },
]

export default function Step2Experience() {
  const { data, next, back } = useQuote()

  const [experience, setExperience] = useState<ExperienceLevel>(data.experience_level ?? 'Mid')
  const [region, setRegion]         = useState(data.region ?? '')
  const [country, setCountry]       = useState(data.country ?? '')

  const regionObj    = REGIONS.find(r => r.value === region)
  const countryList  = regionObj?.countries ?? []
  const canContinue  = experience && region && country

  function handleNext() {
    if (!canContinue) return
    next({ experience_level: experience, region, country })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Experience level */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Your Experience Level</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {EXPERIENCE_LEVELS.map(lvl => {
            const selected = experience === lvl.value
            return (
              <button
                key={lvl.value}
                onClick={() => setExperience(lvl.value)}
                style={{
                  padding: '12px 8px', borderRadius: '8px', cursor: 'pointer',
                  background: selected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
                  color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: selected ? 600 : 400,
                  fontSize: '13px', transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                <div>{lvl.label}</div>
                <div style={{ fontSize: '10px', color: selected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                  {lvl.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Region */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Your Region</div>
        <select
          value={region}
          onChange={e => {
            setRegion(e.target.value)
            setCountry('')
          }}
          className="input"
          style={{ width: '100%' }}
        >
          <option value="" style={{ background: '#1a1a24', color: '#fff' }}>Select region…</option>
          {REGIONS.map(r => (
            <option key={r.value} value={r.value} style={{ background: '#1a1a24', color: '#fff' }}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Country */}
      {region && (
        <div>
          <div className="label" style={{ marginBottom: '8px' }}>Your Country</div>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="input"
            style={{ width: '100%' }}
          >
            <option value="" style={{ background: '#1a1a24', color: '#fff' }}>Select country…</option>
            {countryList.map(c => (
              <option key={c} value={c} style={{ background: '#1a1a24', color: '#fff' }}>{c}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={back} className="btn-ghost" style={{ flex: 1 }}>← Back</button>
        <button onClick={handleNext} disabled={!canContinue} className="btn-accent" style={{ flex: 2 }}>
          Continue →
        </button>
      </div>
    </div>
  )
}
