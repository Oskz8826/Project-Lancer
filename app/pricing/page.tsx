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
  { label: 'Quotes per month',                            free: '10',       basic: 'Unlimited', pro: 'Unlimited', max: 'Unlimited' },
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
  if (value === true)  return <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
  if (value === false) return <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>
  return <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>{value}</span>
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const [aiBasic, setAiBasic] = useState(false)
  const [aiPro,   setAiPro]   = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [hoveredTier,  setHoveredTier]  = useState<string | null>(null)

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
      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.8rem' }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 2.5rem' }}>
          Everything included at every tier — no hidden extras.
        </p>

        {/* Billing toggle */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', gap: '2px' }}>
            {(['monthly', 'annual'] as Billing[]).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{
                background: billing === b ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: billing === b ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                borderRadius: '7px', padding: '0.4rem 1.1rem',
                color: billing === b ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: '0.88rem', fontWeight: billing === b ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>
          {billing === 'annual' && (
            <span style={{
              position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
              marginLeft: '0.75rem', whiteSpace: 'nowrap',
              background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)',
              fontSize: '0.78rem', fontWeight: 700, padding: '3px 9px', borderRadius: '10px',
            }}>Save 2 months</span>
          )}
        </div>
      </section>

      {/* ── PRICE ROW ── */}
      <section style={{ padding: '0 1.5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', margin: '0 0 1rem', letterSpacing: '0.02em', textAlign: 'center' }}>
          {selectedTier ? 'Ready to go — hit Get started below.' : 'Select a plan to get started.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', textAlign: 'left' }}>

          {/* Free */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'free' ? null : 'free')}
            onMouseEnter={() => setHoveredTier('free')}
            onMouseLeave={() => setHoveredTier(null)}
            style={{
              background: selectedTier === 'free' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
              border: selectedTier === 'free' ? '1px solid rgba(255,255,255,0.6)' : hoveredTier === 'free' ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: hoveredTier === 'free' && selectedTier !== 'free' ? '0 0 0 2px rgba(255,255,255,0.07)' : 'none',
              borderRadius: '14px', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              flex: 1, minWidth: '200px', position: 'relative', cursor: 'pointer',
              transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Free</p>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.45)', lineHeight: 1.4 }}>Starter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>€0</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
              {['10 quotes / month', 'Quote builder', 'Regional benchmarks', 'Multi-currency'].map(f => (
                <li key={f} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: '#F25623', flexShrink: 0 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            {selectedTier === 'free' && (
              <Link href="/onboarding" onClick={e => e.stopPropagation()} className="btn-ghost" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', fontSize: '0.88rem' }}>Get started</Link>
            )}
          </div>

          {/* Basic */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'basic' ? null : 'basic')}
            onMouseEnter={() => setHoveredTier('basic')}
            onMouseLeave={() => setHoveredTier(null)}
            style={{
              background: selectedTier === 'basic' ? 'rgba(242,86,35,0.10)' : 'rgba(242,86,35,0.06)',
              border: selectedTier === 'basic' ? '1px solid rgba(255,255,255,0.6)' : hoveredTier === 'basic' ? '1px solid rgba(242,86,35,0.85)' : '1px solid #F25623',
              boxShadow: hoveredTier === 'basic' && selectedTier !== 'basic' ? '0 0 0 2px rgba(242,86,35,0.18)' : 'none',
              borderRadius: '14px', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              flex: 1, minWidth: '200px', position: 'relative', cursor: 'pointer',
              transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
            }}
          >
            <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: '#F25623', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic</p>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', color: '#22c55e', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', lineHeight: 1.4 }}>Freelancer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{price('basic')}</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>/mo</span>
              </div>
              {billing === 'annual' && <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)', margin: '0.2rem 0 0' }}>{annualLabel('basic')}</p>}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
              {['15 quotes / month', 'Quote history', 'PDF export', 'Role-suggested hours'].map(f => (
                <li key={f} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: '#F25623', flexShrink: 0 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div
              onClick={(e) => { e.stopPropagation(); setAiBasic(v => !v) }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.55rem 0.8rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Checkbox checked={aiBasic} onChange={setAiBasic} />
              <span style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.6)', flex: 1 }}>AI quoting assist <span style={{ color: 'rgba(255,255,255,0.3)' }}>(Claude Haiku 4.5)</span></span>
              <span style={{ fontSize: '0.79rem', color: '#F25623', fontWeight: 600, flexShrink: 0 }}>+€6/mo</span>
            </div>
            {selectedTier === 'basic' && (
              <Link href="/onboarding" onClick={e => e.stopPropagation()} className="btn-accent" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', fontSize: '0.88rem' }}>Get started</Link>
            )}
          </div>

          {/* Pro */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'pro' ? null : 'pro')}
            onMouseEnter={() => setHoveredTier('pro')}
            onMouseLeave={() => setHoveredTier(null)}
            style={{
              background: selectedTier === 'pro' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
              border: selectedTier === 'pro' ? '1px solid rgba(255,255,255,0.6)' : hoveredTier === 'pro' ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: hoveredTier === 'pro' && selectedTier !== 'pro' ? '0 0 0 2px rgba(255,255,255,0.07)' : 'none',
              borderRadius: '14px', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              flex: 1, minWidth: '200px', position: 'relative', cursor: 'pointer',
              transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro</p>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', color: '#3b82f6', background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', lineHeight: 1.4 }}>Studio</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{price('pro')}</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>/mo</span>
              </div>
              {billing === 'annual' && <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)', margin: '0.2rem 0 0' }}>{annualLabel('pro')}</p>}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
              {['20 quotes / month', 'Budget estimator', 'CSV export', 'Everything in Basic'].map(f => (
                <li key={f} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: '#F25623', flexShrink: 0 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div
              onClick={(e) => { e.stopPropagation(); setAiPro(v => !v) }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.55rem 0.8rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Checkbox checked={aiPro} onChange={setAiPro} />
              <span style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.6)', flex: 1 }}>AI budget analysis <span style={{ color: 'rgba(255,255,255,0.3)' }}>(Claude Sonnet 4.6)</span></span>
              <span style={{ fontSize: '0.79rem', color: '#F25623', fontWeight: 600, flexShrink: 0 }}>+€10/mo</span>
            </div>
            {selectedTier === 'pro' && (
              <Link href="/onboarding" onClick={e => e.stopPropagation()} className="btn-ghost" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', fontSize: '0.88rem' }}>Get started</Link>
            )}
          </div>

          {/* Max */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'max' ? null : 'max')}
            onMouseEnter={() => setHoveredTier('max')}
            onMouseLeave={() => setHoveredTier(null)}
            style={{
              background: selectedTier === 'max' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
              border: selectedTier === 'max' ? '1px solid rgba(255,255,255,0.6)' : hoveredTier === 'max' ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: hoveredTier === 'max' && selectedTier !== 'max' ? '0 0 0 2px rgba(255,255,255,0.07)' : 'none',
              borderRadius: '14px', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              flex: 1, minWidth: '200px', position: 'relative', cursor: 'pointer',
              transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max</p>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', color: '#F25623', background: 'rgba(242,86,35,0.15)', border: '1px solid #F25623', lineHeight: 1.4 }}>Full Power</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{price('max')}</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>/mo</span>
              </div>
              {billing === 'annual' && <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)', margin: '0.2rem 0 0' }}>{annualLabel('max')}</p>}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
              {['100 quotes / month', 'Claude Opus 4.6 included', '100 AI requests/mo', 'Everything in Pro'].map(f => (
                <li key={f} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: '#F25623', flexShrink: 0 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.55rem 0.8rem', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.79rem', color: 'rgba(255,255,255,0.4)' }}>
              Claude Opus 4.6 included
            </div>
            {selectedTier === 'max' && (
              <Link href="/onboarding" onClick={e => e.stopPropagation()} className="btn-ghost" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', fontSize: '0.88rem' }}>Get started</Link>
            )}
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
