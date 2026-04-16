'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { pb } from '@/lib/pocketbase'
import type { UserProfile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // fireImmediately=true ensures the callback fires synchronously with the
    // current auth state, avoiding a race between PocketBase localStorage
    // restore and the effect running.
    const unsub = pb.authStore.onChange((_, model) => {
      setUser(model ? (model as unknown as UserProfile) : null)
      setLoading(false)
    }, true)

    return () => unsub()
  }, [])

  // Subscribe to real-time user record updates so quota and other fields
  // refresh immediately without requiring a page reload.
  useEffect(() => {
    const userId = pb.authStore.model?.id
    if (!userId) return

    pb.collection('users').subscribe(userId, (e) => {
      setUser(e.record as unknown as UserProfile)
    }).catch(() => { /* SSE not available */ })

    return () => {
      pb.collection('users').unsubscribe(userId).catch(() => {})
    }
  }, [user?.id])

  async function logout() {
    pb.authStore.clear()
    router.push('/')
  }

  async function refreshUser() {
    if (!pb.authStore.isValid || !pb.authStore.model) return
    try {
      await pb.collection('users').authRefresh()
      // authRefresh atomically updates token + model in authStore → onChange fires → setUser updates
    } catch { /* ignore */ }
  }

  return { user, loading, logout, refreshUser }
}
