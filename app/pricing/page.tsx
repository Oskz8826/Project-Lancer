'use client'

import { useState } from 'react'
import Link from 'next/link'

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(!checked) }}
      style={{
        width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
        background: checked ? '#F25623' : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${checked ? '#F25623' : 'rgba(255,255,255,0.2)'}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

type Billing = 'monthly' | 'annual'

const MONTHLY = { basic: 7, pro: 15, max: 38 }
const ANNUAL  = { basic: 4.90, pro: 10.50, max: 26.60 }
const ANNUAL_TOTAL = { basic: 59, pro: 126, max: 319 }
const AI_ADDON = { basic: 6, pro: 10 }

type FeatureRow = {
  section?: string
  label: string
  free: string | boolean
  basic: string | boolean
  pro: string | boolean
  max: string | boolean
}

const FEATURES: FeatureRow[] = [
  // ── Core ──
  { section: 'Core', label: 'Disciplines',               free: '1',        basic: 'All',       pro: 'All',       max: 'All' },
  { label: 'Quotes per month',                            free: '3',        basic: 'Unlimited', pro: 'Unlimited', max: 'Unlimited' },
  { label: 'Quote builder',                               free: true,       basic: true,        pro: true,        max: true },
  { label: 'Role-suggested hours',                        free: true,       basic: true,        pro: true,        max: true },
  { label: 'Usage rights selector',                       free: true,       basic: true,        pro: true,        max: true },
  { label: 'Regional rate benchmarks',                    free: 'Basic',    basic: 'Full',      pro: 'Full',      max: 'Full' },
  { label: 'Multi-currency display',                      free: true,       basic: true,        pro: true,        max: true },
  // ── History & Export ──
  { section: 'History & Export', label: 'Quote history', free: false,      basic: true,        pro: true,        max: true },
  { label: 'PDF export',                                  free: false,      basic: true,        pro: true,        max: true },
  { label: 'CSV export',                                  free: false,      basic: false,       pro: true,        max: true },
  { label: 'Branded proposal export',                     free: false,      basic: false,       pro: false,       max: true },
  // ── Studio Tools ──
  { section: 'Studio Tools', label: 'Studio budget estimator', free: false, basic: false,      pro: true,        max: true },
  { label: 'Asset list builder',                          free: false,      basic: false,       pro: true,        max: true },
  { label: 'Timeline feasibility',                        free: false,      basic: false,       pro: true,        max: true },
  { label: 'Multi-project tracking',                      free: false,      basic: false,       pro: false,       max: true },
  // ── Team & Insights ──
  { section: 'Team & Insights', label: 'Team seats',     free: false,      basic: false,       pro: false,       max: '3' },
  { label: 'Monthly rate insights report',                free: false,      basic: false,       pro: false,       max: true },
  // ── AI ──
  { section: 'AI', label: 'AI quoting assist',           free: false,      basic: 'Claude Haiku 4.5', pro: 'Claude Sonnet 4.6', max: 'Claude Opus 4.6' },
  { label: 'AI budget analysis',                          free: false,      basic: false,       pro: 'Claude Sonnet 4.6', max: 'Claude Opus 4.6' },
  { label: 'AI requests / month',                         free: false,      basic: '15',        pro: '20',        max: '100' },
  { label: 'Overage rate',                                free: false,      basic: '€0.20',     pro: '€0.50',     max: '€1.00' },
]

function Cell({ value }: { value: string | boolean }) {
  if (value === true)  return <span style={{ color: '#F25623', fontSize: '1.1rem' }}>✓</span>
  if (value === false) return <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>
  return <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>{value}</span>
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const [aiBasic, setAiBasic] = useState(false)
  const [aiPro,   setAiPro]   = useState(false)

  function price(tier: 'basic' | 'pro' | 'max') {
    const base = billing === 'annual' ? ANNUAL[tier] : MONTHLY[tier]
    const addon = tier === 'basic' && aiBasic ? AI_ADDON.basic
                : tier === 'pro'   && aiPro   ? AI_ADDON.pro
                : 0
    return `€${(base + addon).toFixed(2).replace(/\.00$/, '')}`
  }

  function annualLabel(tier: 'basic' | 'pro' | 'max') {
    const addon = tier === 'basic' && aiBasic ? AI_ADDON.basic * 12
                : tier === 'pro'   && aiPro   ? AI_ADDON.pro * 12
                : 0
    return `billed €${ANNUAL_TOTAL[tier] + addon}/yr`
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '56px',
        background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', textDecoration: 'none', color: '#fff' }}>
            Lancer
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Home</Link>
            <span style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600 }}>Pricing</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/onboarding" className="btn-accent" style={{ textDecoration: 'none', fontSize: '0.88rem', padding: '0.45rem 1rem' }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.8rem' }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 2.5rem' }}>
          Everything included at every tier — no hidden extras.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', gap: '2px', marginBottom: '3rem' }}>
          {(['monthly', 'annual'] as Billing[]).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              background: billing === b ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: billing === b ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
              borderRadius: '7px', padding: '0.4rem 1.1rem',
              color: billing === b ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: '0.88rem', fontWeight: billing === b ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
              {b === 'annual' && (
                <span style={{ background: '#F25623', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>–30%</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── PRICE ROW ── */}
      <section style={{ padding: '0 1.5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', gap: '1rem', marginBottom: '0.5rem' }}>
          <div />
          {/* Free */}
          <div style={{ textAlign: 'center', padding: '1.2rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Free</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.8rem' }}>€0</p>
            <Link href="/onboarding" className="btn-ghost" style={{ textDecoration: 'none', display: 'block', fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}>Get started</Link>
          </div>
          {/* Basic */}
          <div style={{ textAlign: 'center', padding: '1.2rem 0.8rem', background: 'rgba(242,86,35,0.06)', border: '1px solid #F25623', borderRadius: '12px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#F25623', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>POPULAR</div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', margin: '0 0 0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic</p>
            <div
              onClick={() => setAiBasic(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center', cursor: 'pointer', marginBottom: '0.3rem' }}
            >
              <Checkbox checked={aiBasic} onChange={setAiBasic} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>+AI €6/mo</span>
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{price('basic')}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', margin: '0 0 0.8rem' }}>{billing === 'annual' ? annualLabel('basic') : '/month'}</p>
            <Link href="/onboarding" className="btn-accent" style={{ textDecoration: 'none', display: 'block', fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}>Get started</Link>
          </div>
          {/* Pro */}
          <div style={{ textAlign: 'center', padding: '1.2rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', margin: '0 0 0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro</p>
            <div
              onClick={() => setAiPro(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center', cursor: 'pointer', marginBottom: '0.3rem' }}
            >
              <Checkbox checked={aiPro} onChange={setAiPro} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>+AI €10/mo</span>
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{price('pro')}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', margin: '0 0 0.8rem' }}>{billing === 'annual' ? annualLabel('pro') : '/month'}</p>
            <Link href="/onboarding" className="btn-ghost" style={{ textDecoration: 'none', display: 'block', fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}>Get started</Link>
          </div>
          {/* Max */}
          <div style={{ textAlign: 'center', padding: '1.2rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{price('max')}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', margin: '0 0 0.8rem' }}>{billing === 'annual' ? annualLabel('max') : '/month'}</p>
            <Link href="/onboarding" className="btn-ghost" style={{ textDecoration: 'none', display: 'block', fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}>Get started</Link>
          </div>
        </div>
      </section>

      {/* ── FEATURE TABLE ── */}
      <section style={{ padding: '0 1.5rem 6rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', padding: '0.75rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Feature</span>
            {['Free', 'Basic', 'Pro', 'Max'].map(t => (
              <span key={t} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textAlign: 'center' }}>{t}</span>
            ))}
          </div>
          {FEATURES.map((row, i) => (
            <div key={row.label}>
              {/* Section header */}
              {row.section && (
                <div style={{
                  padding: '0.55rem 1.2rem',
                  background: 'rgba(242,86,35,0.06)',
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,0.07)' : undefined,
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F25623', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {row.section}
                  </span>
                </div>
              )}
              {/* Feature row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)',
                padding: '0.8rem 1.2rem', alignItems: 'center',
                borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: 'transparent',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                {(['free', 'basic', 'pro', 'max'] as const).map(t => (
                  <div key={t} style={{ textAlign: 'center' }}>
                    <Cell value={row[t]} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
