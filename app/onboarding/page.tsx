'use client'

import { OnboardingProvider, useOnboarding } from '@/components/onboarding/OnboardingContext'
import StepIndicator from '@/components/onboarding/StepIndicator'
import Step1Credentials from '@/components/onboarding/Step1Credentials'
import Step2Role from '@/components/onboarding/Step2Role'
import Step3Discipline from '@/components/onboarding/Step3Discipline'
import Step4Skills from '@/components/onboarding/Step4Skills'
import Step5Location from '@/components/onboarding/Step5Location'
import Step6Currency from '@/components/onboarding/Step6Currency'
import Link from 'next/link'

const STEP_TITLES = [
  'Create your account',
  'What describes you best?',
  'Your primary discipline',
  'Additional skills',
  'Where are you based?',
  'Working currency',
]

const STEP_SUBTITLES = [
  'Free forever. No credit card required.',
  'This shapes your default benchmarks and features.',
  'Sets your default rate benchmarks.',
  'Used to surface relevant asset types.',
  'Used for regional rate benchmarks.',
  'Used for all quotes, budgets, and exports.',
]

function OnboardingInner() {
  const { step } = useOnboarding()
  const idx = step - 1

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div className="glass" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem' }}>
        {/* Logo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Lancer
          </span>
        </div>

        <StepIndicator current={step} total={6} />

        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
          {STEP_TITLES[idx]}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.8rem' }}>
          {STEP_SUBTITLES[idx]}
        </p>

        {step === 1 && <Step1Credentials />}
        {step === 2 && <Step2Role />}
        {step === 3 && <Step3Discipline />}
        {step === 4 && <Step4Skills />}
        {step === 5 && <Step5Location />}
        {step === 6 && <Step6Currency />}

        {step === 1 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingInner />
    </OnboardingProvider>
  )
}
