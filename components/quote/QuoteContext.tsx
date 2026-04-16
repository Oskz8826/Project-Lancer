'use client'

import { createContext, useContext, useState } from 'react'
import type { QuoteData, Discipline } from '@/types'

interface QuoteContextValue {
  step: number
  data: Partial<QuoteData>
  next: (patch: Partial<QuoteData>) => void
  back: () => void
  goToStep: (step: number, patch?: Partial<QuoteData>) => void
  draftId: string | null
  setDraftId: (id: string) => void
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

const DEFAULTS: Partial<QuoteData> = {
  revision_rounds: 2,
  revision_type: 'Standard',
  usage_rights: 'Indie',
  rush_job: false,
  notes: '',
  client_brief: '',
  ai_assisted: false,
  rate_is_custom: false,
  hours_are_custom: false,
}

export function QuoteProvider({
  children,
  initialDiscipline,
  initialRegion,
  initialCountry,
  initialData,
  initialStep,
  existingDraftId,
}: {
  children: React.ReactNode
  initialDiscipline?: Discipline
  initialRegion?: string
  initialCountry?: string
  initialData?: Partial<QuoteData>
  initialStep?: number
  existingDraftId?: string | null
}) {
  const [step, setStep] = useState(initialStep ?? 1)
  const [data, setData] = useState<Partial<QuoteData>>({
    ...DEFAULTS,
    discipline: initialDiscipline || '3d_hard_surface' as Discipline,
    region: initialRegion ?? '',
    country: initialCountry ?? '',
    ...initialData,
  })
  const [draftId, setDraftId] = useState<string | null>(existingDraftId ?? null)

  function next(patch: Partial<QuoteData>) {
    setData(prev => ({ ...prev, ...patch }))
    setStep(s => s + 1)
  }

  function back() {
    setStep(s => Math.max(1, s - 1))
  }

  function goToStep(target: number, patch?: Partial<QuoteData>) {
    if (patch) setData(prev => ({ ...prev, ...patch }))
    setStep(target)
  }

  return (
    <QuoteContext.Provider value={{ step, data, next, back, goToStep, draftId, setDraftId }}>
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote() {
  const ctx = useContext(QuoteContext)
  if (!ctx) throw new Error('useQuote must be inside QuoteProvider')
  return ctx
}
