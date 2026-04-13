'use client'

import { useState } from 'react'
import { useOnboarding } from './OnboardingContext'
import { DISCIPLINES } from '@/lib/constants'
import type { Discipline } from '@/types'

export default function Step4Skills() {
  const { next, back, data } = useOnboarding()
  const [selected, setSelected] = useState<Discipline[]>(data.additional_skills ?? [])
  const [custom, setCustom] = useState('')

  // Free tier: max 2 additional skills. Limit enforced post-auth, but shown here.
  const isFree = data.role === 'freelancer' // Free until they upgrade
  const maxSkills = isFree ? 2 : Infinity
  const available = DISCIPLINES.filter(d => d.value !== data.primary_discipline)

  function toggle(val: Discipline) {
    setSelected(prev => {
      if (prev.includes(val)) return prev.filter(v => v !== val)
      if (prev.length >= maxSkills) return prev
      return [...prev, val]
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {isFree && (
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Free plan: pick up to 2 additional skills. Unlock all on Basic+.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
        {available.map(d => {
          const isSelected = selected.includes(d.value)
          const isDisabled = !isSelected && selected.length >= maxSkills
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => toggle(d.value)}
              disabled={isDisabled}
              style={{
                background: isSelected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                color: isDisabled ? 'rgba(255,255,255,0.25)' : isSelected ? '#fff' : 'rgba(255,255,255,0.65)',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 600 : 400,
                transition: 'all 0.15s',
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              {d.label}
            </button>
          )
        })}
      </div>
      <div>
        <label className="label">Custom skill (optional)</label>
        <input
          className="input"
          placeholder="e.g. Technical Animation"
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="btn-ghost" type="button" onClick={back} style={{ flex: 1 }}>Back</button>
        <button
          className="btn-accent"
          type="button"
          onClick={() => next({ additional_skills: selected })}
          style={{ flex: 2 }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
