import type { Metadata } from 'next'
import './globals.css'
import StarField from '@/components/ui/StarField'
import ClientLayout from './ClientLayout'

export const metadata: Metadata = {
  title: 'Lancer — Game Dev Pricing & Budget Estimator',
  description: 'Accurate quotes and budget estimates for game dev freelancers and indie studios.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StarField />
        <div className="above-stars">
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  )
}
