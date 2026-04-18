import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', minHeight: '100vh' }}>
      <DashboardSidebar />
      {children}
    </div>
  )
}
