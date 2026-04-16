'use client'

import { useState } from 'react'
import { QuoteProvider, useQuote } from '@/components/quote/QuoteContext'
import Step1AssetType from '@/components/quote/Step1AssetType'
import Step2Experience from '@/components/quote/Step2Experience'
import Step3RateHours from '@/components/quote/Step3RateHours'
import Step4Extras from '@/components/quote/Step4Extras'
import Step5Review from '@/components/quote/Step5Review'
import { getPocketBase } from '@/lib/pocketbase'
import type { UserProfile, WorkingCurrency, QuoteData } from '@/types'

const CURRENCY_SYMBOLS: Record<WorkingCurrency, string> = { EUR: '€', GBP: '£', USD: '$' }

const STEP_TITLES = [
  'Asset type & complexity',
  'Experience & location',
  'Rate & hours',
  'Revisions & extras',
  'Review your quote',
]

// ── Inner component (needs QuoteProvider above it) ──────────────────────────
function BuilderPanelInner({
  user,
  workingCurrency,
  currencySymbol,
  onClose,
  onSaved,
  onRestart,
}: {
  user: UserProfile
  workingCurrency: WorkingCurrency
  currencySymbol: string
  onClose: () => void
  onSaved: (id: string) => void
  onRestart?: () => void
}) {
  const { step, data, draftId, setDraftId } = useQuote()
  const [savingDraft, setSavingDraft] = useState(false)
  const [draftError, setDraftError]   = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const hasChanges = step > 1 || Object.keys(data).some(k => {
    const key = k as keyof QuoteData
    if (key === 'discipline' || key === 'revision_rounds' || key === 'revision_type' ||
        key === 'usage_rights' || key === 'rush_job') return false
    return Boolean((data as any)[key])
  })

  async function handleSaveDraft() {
    setSavingDraft(true)
    setDraftError('')
    try {
      const pb = getPocketBase()
      const payload = {
        user:             user.id,
        discipline:       data.discipline,
        asset_type:       data.asset_type || '',
        complexity_tier:  data.complexity_tier || '',
        experience_level: data.experience_level || '',
        region:           data.region || '',
        country:          data.country || '',
        hourly_rate:      data.hourly_rate || 0,
        hours_min:        data.hours_min || 0,
        hours_max:        data.hours_max || 0,
        revision_rounds:  data.revision_rounds || 2,
        revision_type:    data.revision_type || 'Standard',
        usage_rights:     data.usage_rights || 'Indie',
        rush_job:         data.rush_job || false,
        notes:            data.notes || '',
        client_brief:     data.client_brief || '',
        working_currency: workingCurrency,
        ai_assisted:      data.ai_assisted || false,
        status:           'draft',
        draft_step:       step,
      }
      let savedId: string
      if (draftId) {
        await pb.collection('quotes').update(draftId, payload)
        savedId = draftId
      } else {
        const record = await pb.collection('quotes').create(payload)
        setDraftId(record.id)
        savedId = record.id
        // First save — count toward quota same as a completed quote
        await pb.collection('users').update(user.id, {
          quotes_used_this_month: (user.quotes_used_this_month ?? 0) + 1,
        })
      }
      setShowConfirm(false)
      onSaved(savedId) // navigate to overview
      return true
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Save failed')
      return false
    } finally {
      setSavingDraft(false)
    }
  }

  async function handleSaveDraftAndClose() {
    await handleSaveDraft() // onSaved handles navigation
  }

  function handleCloseClick() {
    if (hasChanges) {
      setShowConfirm(true)
    } else {
      onClose()
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Panel header */}
        <div style={{
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                {STEP_TITLES[step - 1] ?? 'New quote'}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                Step {step} of 5
              </div>
            </div>
            {draftId && (
              <span style={{
                fontSize: '10px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.35)', flexShrink: 0,
              }}>Draft</span>
            )}
          </div>
          <button
            onClick={handleCloseClick}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', fontSize: '18px', lineHeight: 1, padding: '2px 4px',
            }}
          >×</button>
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {user && step === 1 && <Step1AssetType user={user} />}
          {step === 2 && <Step2Experience />}
          {step === 3 && <Step3RateHours workingCurrency={workingCurrency} currencySymbol={currencySymbol} />}
          {step === 4 && <Step4Extras workingCurrency={workingCurrency} currencySymbol={currencySymbol} />}
          {user && step === 5 && <Step5Review user={user} onSaved={onSaved} onRestart={onRestart} />}
        </div>

        {/* Footer — Save draft (shown on steps 1–4) */}
        {step < 5 && (
          <div style={{
            padding: '10px 16px',
            borderTop: '0.5px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <button
              onClick={handleSaveDraft}
              disabled={savingDraft}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '12px', cursor: savingDraft ? 'default' : 'pointer',
                opacity: savingDraft ? 0.6 : 1,
              }}
            >
              {savingDraft ? 'Saving…' : 'Save draft'}
            </button>
            {draftError && (
              <span style={{ fontSize: '10px', color: '#f87171' }}>{draftError}</span>
            )}
          </div>
        )}
      </div>

      {/* Confirm-on-exit dialog */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#141420', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '14px', padding: '24px', maxWidth: '320px', width: '90%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              Unsaved progress
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
              Save as a draft to continue later, or discard your changes.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleSaveDraftAndClose}
                disabled={savingDraft}
                style={{
                  width: '100%', padding: '9px', borderRadius: '8px',
                  background: 'rgba(242,86,35,0.12)', border: '0.5px solid rgba(242,86,35,0.35)',
                  color: '#f78560', fontSize: '12px', fontWeight: 500,
                  cursor: savingDraft ? 'default' : 'pointer',
                  opacity: savingDraft ? 0.6 : 1,
                }}
              >{savingDraft ? 'Saving…' : 'Save draft'}</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setShowConfirm(false); onClose() }}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '8px',
                    background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontSize: '12px', cursor: 'pointer',
                  }}
                >Discard</button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer',
                  }}
                >Keep editing</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Exported wrapper (provides QuoteContext) ─────────────────────────────────
export default function BuilderPanel({
  quote,
  user,
  onClose,
  onSaved,
  onRestart,
}: {
  quote: any | null   // null = new quote; existing draft = pre-seed with its data
  user: UserProfile
  onClose: () => void
  onSaved: (id: string) => void
  onRestart?: () => void
}) {
  const workingCurrency = (user.working_currency || 'EUR') as WorkingCurrency
  const currencySymbol  = CURRENCY_SYMBOLS[workingCurrency]

  // Build initialData from existing draft record
  const initialData: Partial<QuoteData> | undefined = quote ? {
    discipline:       quote.discipline,
    asset_type:       quote.asset_type,
    complexity_tier:  quote.complexity_tier,
    experience_level: quote.experience_level,
    region:           quote.region,
    country:          quote.country,
    hourly_rate:      quote.hourly_rate,
    hours_min:        quote.hours_min,
    hours_max:        quote.hours_max,
    revision_rounds:  quote.revision_rounds,
    revision_type:    quote.revision_type,
    usage_rights:     quote.usage_rights,
    rush_job:         quote.rush_job,
    notes:            quote.notes,
    client_brief:     quote.client_brief,
    ai_assisted:      quote.ai_assisted,
  } : undefined

  return (
    <QuoteProvider
      initialDiscipline={quote?.discipline ?? user.primary_discipline}
      initialRegion={quote?.region ?? user.region}
      initialCountry={quote?.country ?? user.country}
      initialData={initialData}
      initialStep={quote?.draft_step ?? 1}
      existingDraftId={quote?.id ?? null}
    >
      <BuilderPanelInner
        user={user}
        workingCurrency={workingCurrency}
        currencySymbol={currencySymbol}
        onClose={onClose}
        onSaved={onSaved}
        onRestart={onRestart}
      />
    </QuoteProvider>
  )
}
