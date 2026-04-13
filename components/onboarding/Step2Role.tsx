'use client'

import { useState } from 'react'
import { useOnboarding } from './OnboardingContext'
import type { UserRole } from '@/types'

const ROLES: { value: UserRole; label: string; description: string; badge?: string }[] = [
  {
    value: 'freelancer',
    label: 'Freelancer',
    description: 'I quote clients for game dev work — art, animation, design, code, or sound.',
  },
  {
    value: 'studio',
    label: 'Indie dev / Studio',
    description: 'I need to plan and estimate art production budgets for my game.',
    badge: 'Pro',
  },
]

export default function Step2Role() {
  const { next, back, data } = useOnboarding()
  const [selected, setSelected] = useState<UserRole>(data.role ?? 'freelancer')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {ROLES.map(role => (
        <button
          key={role.value}
          type="button"
          onClick={() => setSelected(role.value)}
          style={{
            background: selected === role.value ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${selected === role.value ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px',
            padding: '1.1rem 1.2rem',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.3rem' }}>{role.label}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{role.description}</div>
          </div>
          {role.badge && (
            <span style={{
              background: 'rgba(242,86,35,0.15)',
              color: 'var(--accent)',
              border: '1px solid rgba(242,86,35,0.3)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              marginLeft: '1rem',
            }}>
              {role.badge}
            </span>
          )}
        </button>
      ))}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="btn-ghost" type="button" onClick={back} style={{ flex: 1 }}>Back</button>
        <button className="btn-accent" type="button" onClick={() => next({ role: selected })} style={{ flex: 2 }}>
          Continue
        </button>
      </div>
    </div>
  )
}
