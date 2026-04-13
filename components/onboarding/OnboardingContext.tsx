'use client'

import { createContext, useContext, useState } from 'react'
import type { OnboardingData } from '@/types'

interface OnboardingContextValue {
  step: number
  data: Partial<OnboardingData>
  next: (patch: Partial<OnboardingData>) => void
  back: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<OnboardingData>>({
    working_currency: 'EUR',
    additional_skills: [],
  })

  function next(patch: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...patch }))
    setStep(s => s + 1)
  }

  function back() {
    setStep(s => Math.max(1, s - 1))
  }

  return (
    <OnboardingContext.Provider value={{ step, data, next, back }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be inside OnboardingProvider')
  return ctx
}
