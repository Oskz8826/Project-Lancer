'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import DashboardTransition from '@/components/dashboard/DashboardTransition'
import AlphaBanner from '@/components/dashboard/AlphaBanner'

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading || !user) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{
        padding: '11px 18px',
        display: 'flex', alignItems: 'center',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        background: 'rgba(13,13,18,0.8)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
          History
        </div>
      </div>

      <AlphaBanner />

      <DashboardTransition style={{ flex: 1, overflowY: 'auto', padding: '24px 18px' }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
          Coming soon.
        </div>
      </DashboardTransition>
    </div>
  )
}
