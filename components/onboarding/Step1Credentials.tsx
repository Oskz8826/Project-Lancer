'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboarding } from './OnboardingContext'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type Fields = z.infer<typeof schema>

export default function Step1Credentials() {
  const { next, data } = useOnboarding()
  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: data.name ?? '', email: data.email ?? '', password: '' },
  })

  return (
    <form onSubmit={handleSubmit(next)} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label className="label">Full name</label>
        <input className={`input ${errors.name ? 'error' : ''}`} placeholder="Jane Doe" {...register('name')} />
        {errors.name && <p className="error-text">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label">Email</label>
        <input className={`input ${errors.email ? 'error' : ''}`} type="email" placeholder="jane@studio.com" {...register('email')} />
        {errors.email && <p className="error-text">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Password</label>
        <input className={`input ${errors.password ? 'error' : ''}`} type="password" placeholder="Min. 8 characters" {...register('password')} />
        {errors.password && <p className="error-text">{errors.password.message}</p>}
      </div>
      <button className="btn-accent" type="submit" style={{ marginTop: '0.5rem' }}>
        Continue
      </button>
    </form>
  )
}
