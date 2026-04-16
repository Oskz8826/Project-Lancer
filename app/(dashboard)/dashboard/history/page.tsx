import { redirect } from 'next/navigation'

// History route redirects to the quotes list — same content.
export default function HistoryPage() {
  redirect('/dashboard/quotes')
}
