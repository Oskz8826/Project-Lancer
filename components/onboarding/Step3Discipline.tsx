'use client'

import { useState } from 'react'
import { useOnboarding } from './OnboardingContext'
import { DISCIPLINES } from '@/lib/constants'
import type { Discipline } from '@/types'

export default function Step3Discipline() {
  const { next, back, data } = useOnboarding()
  const [selected, setSelected] = useState<Discipline | ''>(data.primary_discipline ?? '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.6rem',
      }}>
        {DISCIPLINES.map(d => (
          <button
            key={d.value}
            type="button"
            onClick={() => setSelected(d.value)}
            style={{
              background: selected === d.value ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected === d.value ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              cursor: 'pointer',
              color: selected === d.value ? '#fff' : 'rgba(255,255,255,0.65)',
              fontSize: '0.875rem',
              fontWeight: selected === d.value ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="btn-ghost" type="button" onClick={back} style={{ flex: 1 }}>Back</button>
        <button
          className="btn-accent"
          type="button"
          disabled={!selected}
          onClick={() => selected && next({ primary_discipline: selected })}
          style={{ flex: 2 }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
