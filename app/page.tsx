'use client'

import { useState } from 'react'
import Link from 'next/link'
import TransitionLink from '@/components/ui/TransitionLink'

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
        background: checked ? '#F25623' : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${checked ? '#F25623' : 'rgba(255,255,255,0.2)'}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

type Billing = 'monthly' | 'annual'

const MONTHLY = { basic: 7, pro: 15, max: 38 }
const ANNUAL  = { basic: 4.90, pro: 10.50, max: 26.60 }
const AI_ADDON = { basic: 6, pro: 10 }

const AUDIENCE: Record<string, { label: string; color: string; bg: string }> = {
  free:  { label: 'Starter',    color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.07)' },
  basic: { label: 'Freelancer', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  pro:   { label: 'Studio',     color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  max:   { label: 'Full Power', color: '#F25623', bg: 'rgba(242,86,35,0.15)' },
}

const TIERS = [
  {
    id: 'free' as const,
    name: 'Free',
    desc: 'Try it out',
    monthlyBase: 0,
    annualBase: 0,
    features: ['10 quotes / month', 'Quote builder', 'Regional benchmarks', 'Multi-currency'],
    cta: 'Get started',
    ghost: true,
  },
  {
    id: 'basic' as const,
    name: 'Basic',
    desc: 'For freelancers',
    monthlyBase: MONTHLY.basic,
    annualBase: ANNUAL.basic,
    annualTotal: '€59/year',
    features: ['15 quotes / month', 'Quote history', 'PDF export', 'Role-suggested hours'],
    cta: 'Get started',
    highlight: true,
    aiAddon: { label: 'AI quoting assist', model: 'Claude Haiku 4.5', price: AI_ADDON.basic },
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    desc: 'For studios',
    monthlyBase: MONTHLY.pro,
    annualBase: ANNUAL.pro,
    annualTotal: '€126/year',
    features: ['20 quotes / month', 'Budget estimator', 'CSV export', 'Everything in Basic'],
    cta: 'Get started',
    ghost: true,
    aiAddon: { label: 'AI assist + budget analysis', model: 'Claude Sonnet 4.6', price: AI_ADDON.pro },
  },
  {
    id: 'max' as const,
    name: 'Max',
    desc: 'Full power',
    monthlyBase: MONTHLY.max,
    annualBase: ANNUAL.max,
    annualTotal: '€319/year',
    features: ['100 quotes / month', 'Claude Opus 4.6 included', '100 AI requests/mo', 'Everything in Pro'],
    cta: 'Get started',
    ghost: true,
    aiIncluded: 'Claude Opus 4.6 included',
  },
]

const FAQS = [
  { q: 'Can I switch plans at any time?', a: 'Yes. Upgrades take effect immediately, downgrades at the end of your billing period. No lock-in.' },
  { q: 'What currency is billing in?', a: 'All subscriptions are billed in EUR. Your working currency for quotes is set separately at onboarding.' },
  { q: 'What happens when I hit my AI request limit?', a: 'You can continue using all non-AI features. Overage requests are available at €0.20–€1.00 per request depending on tier.' },
  { q: 'Can I try before I buy?', a: 'The Free tier is free forever — no credit card required. Includes the full quote builder for up to 10 quotes per month.' },
  { q: 'Is there a yearly discount?', a: 'Yes. Annual billing saves ~17% across all paid tiers.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel from your profile settings at any time. Access stays active until the end of your billing period.' },
]

export default function LandingPage() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const [aiBasic, setAiBasic] = useState(false)
  const [aiPro,   setAiPro]   = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [hoveredTier,  setHoveredTier]  = useState<string | null>(null)

  function getPrice(tier: typeof TIERS[number]) {
    if (tier.monthlyBase === 0) return '€0'
    const base = billing === 'annual' ? tier.annualBase! : tier.monthlyBase
    const addon = tier.id === 'basic' && aiBasic ? AI_ADDON.basic
                : tier.id === 'pro'   && aiPro   ? AI_ADDON.pro
                : 0
    return `€${(base + addon).toFixed(2).replace(/\.00$/, '')}`
  }

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '6rem 1.5rem 4rem', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(242,86,35,0.12)', border: '1px solid rgba(242,86,35,0.3)',
          borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 600,
          color: '#F25623', marginBottom: '1.5rem', letterSpacing: '0.04em',
        }}>
          Built for game dev
        </div>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800,
          lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 1.2rem',
        }}>
          Price your work.<br />
          <span style={{ color: '#F25623' }}>Know your worth.</span>
        </h1>
        <p style={{
          fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.65, margin: '0 auto 2.5rem', maxWidth: '480px',
        }}>
          The pricing and budget estimator built for game dev freelancers and indie studios.
          Accurate quotes. Regional benchmarks. AI-assisted.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/onboarding" className="btn-accent" style={{ textDecoration: 'none' }}>
            Get started free
          </Link>
          <TransitionLink href="/pricing" className="btn-ghost" style={{ textDecoration: 'none' }}>
            See pricing
          </TransitionLink>
        </div>
        <p style={{ marginTop: '1.2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
          Free forever. No credit card required.
        </p>
      </section>

      {/* ── VALUE PROPS ── */}
      <section style={{ padding: '0 1.5rem 5rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🎯', title: 'Built for game dev', body: 'Understands asset types, complexity tiers, and discipline-specific rates — not a generic calculator.' },
            { icon: '🌍', title: 'Regional benchmarks', body: 'Rate data for North America, Europe, LATAM, Asia-Pacific, and Eastern Europe. Quote with confidence.' },
            { icon: '🤖', title: 'AI-assisted quoting', body: 'Paste a client brief and get a structured quote in seconds. Powered by Claude Haiku, Sonnet, or Opus.' },
            { icon: '📄', title: 'PDF export', body: 'Generate clean, professional quote PDFs ready to send to clients — no reformatting needed.' },
          ].map(p => (
            <div key={p.title} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '1.4rem',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.7rem' }}>{p.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{p.title}</h3>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '0 1.5rem 2rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>
          Simple, transparent pricing
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 2rem' }}>
          Start free. Upgrade when you need more.
        </p>

        {/* Billing toggle */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2.5rem' }}>
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

        {/* Tier cards */}
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', margin: '0 0 1rem', letterSpacing: '0.02em' }}>
          {selectedTier ? 'Ready to go — hit Get started below.' : 'Select a plan to get started.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', textAlign: 'left' }}>
          {TIERS.map(tier => {
            const annualBase = tier.id === 'basic' ? 59 : tier.id === 'pro' ? 126 : tier.id === 'max' ? 319 : 0
            const aiYearly = tier.id === 'basic' && aiBasic ? AI_ADDON.basic * 12
                           : tier.id === 'pro'   && aiPro   ? AI_ADDON.pro * 12
                           : 0
            const annualLabel = annualBase > 0 ? `€${annualBase + aiYearly}/year` : null
            return (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id === selectedTier ? null : tier.id)}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              style={{
                background: tier.highlight ? 'rgba(242,86,35,0.06)' : selectedTier === tier.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: selectedTier === tier.id
                  ? '1px solid rgba(255,255,255,0.6)'
                  : hoveredTier === tier.id
                    ? tier.highlight ? '1px solid rgba(242,86,35,0.85)' : '1px solid rgba(255,255,255,0.22)'
                    : tier.highlight ? '1px solid #F25623' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: hoveredTier === tier.id && selectedTier !== tier.id
                  ? tier.highlight ? '0 0 0 2px rgba(242,86,35,0.18)' : '0 0 0 2px rgba(255,255,255,0.07)'
                  : 'none',
                borderRadius: '14px', padding: '1.6rem 1.4rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                flex: 1, minWidth: '200px', position: 'relative',
                cursor: 'pointer',
                transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
              }}
            >
              {tier.highlight && (
                <div style={{
                  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                  background: '#F25623', color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                  padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
                }}>MOST POPULAR</div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tier.name}</p>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                    color: AUDIENCE[tier.id].color, background: AUDIENCE[tier.id].bg,
                    border: `1px solid ${AUDIENCE[tier.id].color}`, lineHeight: 1.4,
                  }}>{AUDIENCE[tier.id].label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800 }}>{getPrice(tier)}</span>
                  {tier.monthlyBase > 0 && <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>/mo</span>}
                </div>
                {annualLabel && billing === 'annual' && (
                  <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)', margin: '0.2rem 0 0' }}>Billed {annualLabel}</p>
                )}
              </div>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
                {tier.features.map(f => (
                  <li key={f} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: '#F25623', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              {tier.aiAddon && (
                <div
                  onClick={(e) => { e.stopPropagation(); tier.id === 'basic' ? setAiBasic(!aiBasic) : setAiPro(!aiPro) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.55rem',
                    background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                    padding: '0.55rem 0.8rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <Checkbox
                    checked={tier.id === 'basic' ? aiBasic : aiPro}
                    onChange={v => tier.id === 'basic' ? setAiBasic(v) : setAiPro(v)}
                  />
                  <span style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.6)', flex: 1 }}>
                    {tier.aiAddon.label} <span style={{ color: 'rgba(255,255,255,0.3)' }}>({tier.aiAddon.model})</span>
                  </span>
                  <span style={{ fontSize: '0.79rem', color: '#F25623', fontWeight: 600, flexShrink: 0 }}>+€{tier.aiAddon.price}/mo</span>
                </div>
              )}

              {tier.aiIncluded && (
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
                  padding: '0.55rem 0.8rem', border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: '0.79rem', color: 'rgba(255,255,255,0.4)',
                }}>
                  {tier.aiIncluded}
                </div>
              )}

              {selectedTier === tier.id && (
                <Link
                  href="/onboarding"
                  onClick={(e) => e.stopPropagation()}
                  className={tier.highlight ? 'btn-accent' : 'btn-ghost'}
                  style={{ textDecoration: 'none', textAlign: 'center', display: 'block', fontSize: '0.88rem' }}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
            )
          })}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <TransitionLink href="/pricing" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1px' }}>
            Compare all features →
          </TransitionLink>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '4rem 1.5rem 6rem', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 2rem', textAlign: 'center' }}>
          Frequently asked questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1rem 1.2rem', background: 'transparent', border: 'none',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', gap: '1rem',
                }}
              >
                {faq.q}
                <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <p style={{ margin: 0, padding: '0 1.2rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Lancer</span>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} Lancer OÜ. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          {['Privacy', 'Terms'].map(l => (
            <span key={l} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </>
  )
}
