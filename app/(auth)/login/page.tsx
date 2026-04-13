'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { pb } from '@/lib/pocketbase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await pb.collection('users').authWithPassword(email, password)
      router.push('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div className="glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Lancer
          </span>
        </div>

        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.4rem' }}>Welcome back</h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.8rem' }}>
          Sign in to your account.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="jane@studio.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-accent" type="submit" disabled={loading} style={{ marginTop: '0.25rem' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
          No account yet?{' '}
          <Link href="/onboarding" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Get started free</Link>
        </p>
      </div>
    </div>
  )
}
