'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useOnboarding } from './OnboardingContext'
import { CURRENCIES } from '@/lib/constants'
import { pb } from '@/lib/pocketbase'
import type { WorkingCurrency } from '@/types'

export default function Step6Currency() {
  const { back, data } = useOnboarding()
  const [currency, setCurrency] = useState<WorkingCurrency>(data.working_currency ?? 'EUR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const finalData = { ...data, working_currency: currency }

      // 1. Create PocketBase auth user
      await pb.collection('users').create({
        name: finalData.name,
        email: finalData.email,
        password: finalData.password,
        passwordConfirm: finalData.password,
        role: finalData.role,
        primary_discipline: finalData.primary_discipline,
        additional_skills: finalData.additional_skills,
        region: finalData.region,
        country: finalData.country,
        working_currency: currency,
        tier: 'free',
        ai_addon: false,
        quotes_used_this_month: 0,
      })

      // 2. Log in immediately
      await pb.collection('users').authWithPassword(finalData.email!, finalData.password!)

      // 3. Route to dashboard
      router.push('/dashboard')
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : ''
      const isDuplicate = raw.toLowerCase().includes('already exists') || raw.toLowerCase().includes('unique') || raw.toLowerCase().includes('failed to create record')
      const msg = isDuplicate
        ? 'An account with that email already exists. Try signing in instead.'
        : (raw || 'Something went wrong. Please try again.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {CURRENCIES.map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCurrency(c.value as WorkingCurrency)}
            style={{
              background: currency === c.value ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${currency === c.value ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              padding: '1rem 1.2rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '1.4rem', width: '2rem' }}>{c.symbol}</span>
            <span style={{ color: '#fff', fontWeight: currency === c.value ? 600 : 400 }}>{c.label}</span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
        Subscriptions are always billed in EUR. This sets your working currency for quotes and budgets.
      </p>
      {error && (
        <div>
          <p className="error-text" style={{ margin: 0 }}>{error}</p>
          {error.includes('already exists') && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
              <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in here</Link>
            </p>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="btn-ghost" type="button" onClick={back} disabled={loading} style={{ flex: 1 }}>Back</button>
        <button className="btn-accent" type="button" onClick={submit} disabled={loading} style={{ flex: 2 }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </div>
  )
}
