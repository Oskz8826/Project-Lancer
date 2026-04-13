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
    const model = pb.authStore.model
    if (pb.authStore.isValid && model) {
      setUser(model as unknown as UserProfile)
    }
    setLoading(false)

    const unsub = pb.authStore.onChange((_, model) => {
      setUser(model ? (model as unknown as UserProfile) : null)
    })

    return () => unsub()
  }, [])

  async function logout() {
    pb.authStore.clear()
    router.push('/')
  }

  return { user, loading, logout }
}
