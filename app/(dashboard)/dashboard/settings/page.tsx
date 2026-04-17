'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getPocketBase } from '@/lib/pocketbase'
import { DISCIPLINES, REGIONS, CURRENCIES } from '@/lib/constants'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import type { WorkingCurrency, Discipline } from '@/types'

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  free:  { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.45)', border: 'rgba(255,255,255,0.12)' },
  basic: { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80',                border: 'rgba(34,197,94,0.25)'   },
  pro:   { bg: 'rgba(59,130,246,0.1)',   text: '#60a5fa',                border: 'rgba(59,130,246,0.25)'  },
  max:   { bg: 'rgba(168,85,247,0.1)',   text: '#c084fc',                border: 'rgba(168,85,247,0.25)'  },
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '8px 11px', borderRadius: '8px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: `0.5px solid ${focused ? 'rgba(242,86,35,0.5)' : 'rgba(255,255,255,0.1)'}`,
    color: 'rgba(255,255,255,0.85)', fontSize: '12px', outline: 'none',
    transition: 'border-color 0.15s',
  }
}

export default function SettingsPage() {
  const { user, loading, logout, refreshUser } = useAuth()
  const router = useRouter()

  // Editable fields
  const [name,       setName]       = useState('')
  const [discipline, setDiscipline] = useState<Discipline>('3d_hard_surface')
  const [region,     setRegion]     = useState('')
  const [country,    setCountry]    = useState('')
  const [currency,   setCurrency]   = useState<WorkingCurrency>('EUR')

  // UI state
  const [saving,    setSaving]    = useState(false)
  const [saveOk,    setSaveOk]    = useState(false)
  const [saveError, setSaveError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Seed form from user profile once loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setDiscipline((user.primary_discipline || '3d_hard_surface') as Discipline)
      setRegion(user.region || '')
      setCountry(user.country || '')
      setCurrency((user.working_currency || 'EUR') as WorkingCurrency)
    }
  }, [user?.id])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{
          width: '20px', height: '20px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#F25623',
        }} />
      </div>
    )
  }

  const tierColors = TIER_COLORS[user.tier] ?? TIER_COLORS.free
  const quoteCap   = user.tier === 'free' ? 3 : null

  async function handleSave() {
    setSaving(true)
    setSaveOk(false)
    setSaveError('')
    try {
      const pb = getPocketBase()
      await pb.collection('users').update(user!.id, {
        name,
        primary_discipline: discipline,
        region,
        country,
        working_currency: currency,
      })
      await refreshUser()
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const regionCountries = REGIONS.find(r => r.value === region)?.countries ?? []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', minHeight: '100vh' }}>

      <DashboardSidebar active="settings" />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{
          padding: '11px 18px',
          display: 'flex', alignItems: 'center',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(13,13,18,0.8)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
            Settings
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px' }}>
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* ── Profile card ── */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>
                Profile
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Name */}
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your name"
                    style={inputStyle(focusedField === 'name')}
                  />
                </div>

                {/* Primary discipline */}
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>
                    Primary discipline
                  </label>
                  <select
                    value={discipline}
                    onChange={e => setDiscipline(e.target.value as Discipline)}
                    onFocus={() => setFocusedField('discipline')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle(focusedField === 'discipline'), appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    {DISCIPLINES.map(d => (
                      <option key={d.value} value={d.value} style={{ background: '#1a1a24', color: '#fff' }}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region + Country row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>
                      Region
                    </label>
                    <select
                      value={region}
                      onChange={e => { setRegion(e.target.value); setCountry('') }}
                      onFocus={() => setFocusedField('region')}
                      onBlur={() => setFocusedField(null)}
                      style={{ ...inputStyle(focusedField === 'region'), appearance: 'none', WebkitAppearance: 'none' }}
                    >
                      <option value="" style={{ background: '#1a1a24', color: '#fff' }}>Select region</option>
                      {REGIONS.map(r => (
                        <option key={r.value} value={r.value} style={{ background: '#1a1a24', color: '#fff' }}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      onFocus={() => setFocusedField('country')}
                      onBlur={() => setFocusedField(null)}
                      disabled={regionCountries.length === 0}
                      style={{
                        ...inputStyle(focusedField === 'country'),
                        appearance: 'none', WebkitAppearance: 'none',
                        opacity: regionCountries.length === 0 ? 0.4 : 1,
                      }}
                    >
                      <option value="" style={{ background: '#1a1a24', color: '#fff' }}>Select country</option>
                      {regionCountries.map(c => (
                        <option key={c} value={c} style={{ background: '#1a1a24', color: '#fff' }}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Working currency */}
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>
                    Working currency
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {CURRENCIES.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setCurrency(c.value as WorkingCurrency)}
                        style={{
                          padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                          cursor: 'pointer', fontWeight: currency === c.value ? 600 : 400,
                          background: currency === c.value ? 'rgba(242,86,35,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `0.5px solid ${currency === c.value ? 'rgba(242,86,35,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          color: currency === c.value ? '#f78560' : 'rgba(255,255,255,0.55)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save button + feedback */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '8px 20px', borderRadius: '8px',
                    background: saveOk ? 'rgba(34,197,94,0.12)' : 'rgba(242,86,35,0.12)',
                    border: `0.5px solid ${saveOk ? 'rgba(34,197,94,0.35)' : 'rgba(242,86,35,0.35)'}`,
                    color: saveOk ? '#4ade80' : '#f78560',
                    fontSize: '12px', fontWeight: 500,
                    cursor: saving ? 'default' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Saving…' : saveOk ? 'Saved' : 'Save changes'}
                </button>
                {saveError && (
                  <span style={{ fontSize: '11px', color: '#f87171' }}>{saveError}</span>
                )}
              </div>
            </div>

            {/* ── Account card ── */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>
                Account
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <AccountRow label="Email" value={user.email} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Plan</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                    background: tierColors.bg, color: tierColors.text, border: `0.5px solid ${tierColors.border}`,
                    textTransform: 'capitalize',
                  }}>
                    {user.tier}
                  </span>
                </div>

                <AccountRow
                  label="AI addon"
                  value={user.ai_addon ? 'Active' : 'Not active'}
                  valueColor={user.ai_addon ? '#4ade80' : undefined}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Quotes this month</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
                    {user.quotes_used_this_month ?? 0}
                    {quoteCap !== null && <span style={{ color: 'rgba(255,255,255,0.3)' }}> / {quoteCap}</span>}
                  </span>
                </div>

              </div>

              {/* Sign out */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={logout}
                  style={{
                    padding: '7px 16px', borderRadius: '8px',
                    background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.25)',
                    color: '#f87171', fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function AccountRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{label}</span>
      <span style={{ fontSize: '11px', color: valueColor || 'rgba(255,255,255,0.65)' }}>{value}</span>
    </div>
  )
}
