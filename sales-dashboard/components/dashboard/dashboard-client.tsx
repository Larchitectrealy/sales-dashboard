'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { PaymentGenerator } from '@/components/dashboard/payment-generator'
import { TransactionsTable } from '@/components/dashboard/transactions-table'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { DashboardHeader } from '@/components/dashboard/header'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/app/actions/profile'

interface DashboardClientProps {
  initialProfile: Profile | null
}

export function DashboardClient({ initialProfile }: DashboardClientProps) {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState('accueil')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleItemClick = (item: string) => {
    setActiveItem(item)
    if (item === 'reglages') router.push('/settings')
    else if (item === 'historique') router.push('/historique')
    else if (item === 'admin-dashboard') router.push('/admin')
    else if (item === 'admin') router.push('/admin/users')
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          role={initialProfile?.role ?? 'user'}
          banned={initialProfile?.banned ?? false}
        />
      </div>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <DashboardHeader />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <StatsCards refreshTrigger={refreshTrigger} />
          <div className="mb-8">
            <PaymentGenerator onLinkCreated={() => setRefreshTrigger((prev) => prev + 1)} />
          </div>
          <div>
            <TransactionsTable refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  )
}
