'use client'

import { useState } from 'react'
import { useOnboarding } from './OnboardingContext'
import { REGIONS } from '@/lib/constants'

export default function Step5Location() {
  const { next, back, data } = useOnboarding()
  const [region, setRegion] = useState(data.region ?? '')
  const [country, setCountry] = useState(data.country ?? '')

  const countries = REGIONS.find(r => r.value === region)?.countries ?? []

  function handleRegionChange(val: string) {
    setRegion(val)
    setCountry('')
  }

  const canContinue = region && country

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label className="label">Region</label>
        <select
          className="input"
          value={region}
          onChange={e => handleRegionChange(e.target.value)}
          style={{ appearance: 'none' }}
        >
          <option value="" disabled>Select region...</option>
          {REGIONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Country</label>
        <select
          className="input"
          value={country}
          onChange={e => setCountry(e.target.value)}
          disabled={!region}
          style={{ appearance: 'none', opacity: !region ? 0.4 : 1 }}
        >
          <option value="" disabled>Select country...</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="btn-ghost" type="button" onClick={back} style={{ flex: 1 }}>Back</button>
        <button
          className="btn-accent"
          type="button"
          disabled={!canContinue}
          onClick={() => next({ region, country })}
          style={{ flex: 2 }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
