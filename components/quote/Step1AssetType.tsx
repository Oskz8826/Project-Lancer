'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuote } from './QuoteContext'
import { DISCIPLINES } from '@/lib/constants'
import { ASSET_TYPES } from '@/lib/benchmarks'
import type { Discipline, ComplexityTier, UserProfile } from '@/types'

const COMPLEXITY_TIERS: { value: ComplexityTier; label: string; desc: string }[] = [
  { value: 'Simple', label: 'Simple', desc: 'Minimal detail, fast turnaround' },
  { value: 'Mid',    label: 'Mid',    desc: 'Standard game-ready quality' },
  { value: 'Complex',label: 'Complex',desc: 'High detail, multiple revisions' },
  { value: 'Hero',   label: 'Hero',   desc: 'Showcase / cinematic quality' },
]

export default function Step1AssetType({ user }: { user: UserProfile }) {
  const { data, next, goToStep } = useQuote()

  const initialDiscipline: Discipline =
    (data.discipline || user.primary_discipline || '3d_hard_surface') as Discipline
  const [discipline, setDiscipline] = useState<Discipline>(initialDiscipline)
  const [assetType, setAssetType]   = useState(
    data.asset_type || ASSET_TYPES[initialDiscipline]?.[0]?.label || ''
  )
  const [complexity, setComplexity] = useState<ComplexityTier>(data.complexity_tier ?? 'Mid')

  // Custom asset type
  const [customMode, setCustomMode]   = useState(false)
  const [customValue, setCustomValue] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (customMode) customInputRef.current?.focus()
  }, [customMode])

  // AI assist state
  const [brief, setBrief]         = useState(data.client_brief ?? '')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError]     = useState('')

  const assetOptions = ASSET_TYPES[discipline] ?? []
  const canContinue  = (customMode ? customValue.trim() !== '' : assetType !== '') && complexity !== undefined

  const canUseAI = user.tier !== 'free' && user.ai_addon

  async function handleAIAnalyze() {
    if (!brief.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_brief: brief,
          discipline,
          experience_level: data.experience_level ?? 'Mid',
          region: data.region ?? user.region,
          country: data.country ?? user.country,
          hourly_rate: data.hourly_rate ?? 0,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const result = await res.json()

      // Map AI result into QuoteData and jump to review
      goToStep(5, {
        discipline,
        asset_type:       result.asset_type ?? assetType,
        complexity_tier:  result.complexity_tier ?? complexity,
        experience_level: data.experience_level ?? 'Mid',
        region:           data.region ?? user.region,
        country:          data.country ?? user.country,
        hourly_rate:      result.suggested_rate_eur ?? data.hourly_rate ?? 0,
        hours_min:        result.estimated_hours_min ?? 0,
        hours_max:        result.estimated_hours_max ?? 0,
        rate_is_custom:   false,
        hours_are_custom: false,
        revision_rounds:  result.revisions_included ?? 2,
        revision_type:    'Standard',
        usage_rights:     result.usage_rights ?? 'Indie',
        rush_job:         result.rush_job ?? false,
        notes:            data.notes ?? '',
        client_brief:     brief,
        quote_min:        result.quote_min_eur ?? 0,
        quote_max:        result.quote_max_eur ?? 0,
        quote_mid:        ((result.quote_min_eur ?? 0) + (result.quote_max_eur ?? 0)) / 2,
        confidence:       result.confidence,
        confidence_reason:result.confidence_reason,
        ai_assisted:      true,
      })
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI analysis failed. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  function handleNext() {
    if (!canContinue) return
    next({ discipline, asset_type: assetType, complexity_tier: complexity, client_brief: brief })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* AI Assist panel — Basic+ with addon */}
      {canUseAI && (
        <div style={{
          background: 'rgba(242,86,35,0.06)',
          border: '1px solid rgba(242,86,35,0.2)',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f78560', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.1-5.28a2.5 2.5 0 0 1 .02-1.04l1.08-5.24A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.1-5.28a2.5 2.5 0 0 0-.02-1.04l-1.08-5.24A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
            AI Assist — paste a client brief to auto-fill your quote
          </div>
          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="e.g. 'Need a game-ready sci-fi rifle model with 4K textures, PBR workflow, low poly under 15k tris, delivery in 3 weeks...'"
            style={{
              width: '100%', minHeight: '80px', resize: 'vertical',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '10px 12px',
              fontSize: '12px', color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.5, fontFamily: 'inherit',
            }}
          />
          {aiError && (
            <div style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>{aiError}</div>
          )}
          <button
            onClick={handleAIAnalyze}
            disabled={!brief.trim() || aiLoading}
            style={{
              marginTop: '10px',
              padding: '7px 16px', borderRadius: '7px',
              background: brief.trim() && !aiLoading ? '#F25623' : 'rgba(255,255,255,0.08)',
              color: brief.trim() && !aiLoading ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none', fontSize: '12px', fontWeight: 600, cursor: brief.trim() && !aiLoading ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            {aiLoading ? 'Analyzing...' : 'Analyze with AI →'}
          </button>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
            Or fill in manually below and continue step by step.
          </div>
        </div>
      )}

      {/* Discipline selector */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Discipline</div>
        <select
          value={discipline}
          onChange={e => {
            const d = e.target.value as Discipline
            setDiscipline(d)
            setAssetType(ASSET_TYPES[d]?.[0]?.label ?? '')
          }}
          className="input"
          style={{ width: '100%' }}
        >
          {DISCIPLINES.map(d => (
            <option key={d.value} value={d.value} style={{ background: '#1a1a24', color: '#fff' }}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Asset type grid */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Asset / Deliverable</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {assetOptions.map(opt => {
            const selected = !customMode && assetType === opt.label
            return (
              <button
                key={opt.label}
                onClick={() => { setCustomMode(false); setAssetType(opt.label) }}
                style={{
                  padding: '10px 12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer',
                  background: selected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
                  color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: selected ? 600 : 400,
                  fontSize: '13px', transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            )
          })}

          {/* Custom option */}
          <button
            onClick={() => {
              setCustomMode(true)
              setAssetType(customValue)
            }}
            style={{
              padding: '10px 12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer',
              background: customMode ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${customMode ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
              color: customMode ? '#fff' : 'rgba(255,255,255,0.4)',
              fontWeight: customMode ? 600 : 400,
              fontSize: '13px', transition: 'all 0.15s',
            }}
          >
            Custom…
          </button>
        </div>

        {/* Custom text input */}
        {customMode && (
          <input
            ref={customInputRef}
            type="text"
            value={customValue}
            onChange={e => { setCustomValue(e.target.value); setAssetType(e.target.value) }}
            placeholder="e.g. Animated UI Widget, Tileable Texture Set…"
            className="input"
            style={{ width: '100%', marginTop: '8px' }}
          />
        )}
      </div>

      {/* Complexity tier */}
      <div>
        <div className="label" style={{ marginBottom: '8px' }}>Complexity Tier</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {COMPLEXITY_TIERS.map(tier => {
            const selected = complexity === tier.value
            return (
              <button
                key={tier.value}
                onClick={() => setComplexity(tier.value)}
                title={tier.desc}
                style={{
                  padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
                  background: selected ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? '#F25623' : 'rgba(255,255,255,0.08)'}`,
                  color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: selected ? 600 : 400,
                  fontSize: '13px', transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                {tier.label}
              </button>
            )
          })}
        </div>
        {complexity && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
            {COMPLEXITY_TIERS.find(t => t.value === complexity)?.desc}
          </div>
        )}
      </div>

      {/* Continue */}
      <button
        onClick={handleNext}
        disabled={!canContinue}
        className="btn-accent"
        style={{ width: '100%' }}
      >
        Continue →
      </button>
    </div>
  )
}
