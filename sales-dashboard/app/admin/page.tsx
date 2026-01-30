import { requireAdmin } from '@/app/actions/profile'
import { getAdminDashboardData } from '@/app/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutDashboard, Users, UserPlus } from 'lucide-react'
import { AdminKPICards } from './admin-kpi-cards'
import { AdminRevenueChart } from './admin-revenue-chart'
import { AdminTopPerformers } from './admin-top-performers'
import { AdminActivityFeed } from './admin-activity-feed'
import { AddSellerForm } from './add-seller-form'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  await requireAdmin()

  const result = await getAdminDashboardData()
  const data = result.success ? result.data : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-zinc-300 hover:text-white hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/users">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Users className="mr-2 h-4 w-4" />
              Utilisateurs
            </Button>
          </Link>
        </div>
      </div>

      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
          <LayoutDashboard className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
            Dashboard Performance
          </h1>
          <p className="text-sm text-zinc-400">
            Statistiques et activité de l&apos;équipe
          </p>
        </div>
      </header>

      {!data ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 py-12 text-center text-zinc-500">
          {result.error ?? 'Impossible de charger les données.'}
        </div>
      ) : (
        <>
          {/* Section KPI — 4 cartes */}
          <section>
            <AdminKPICards kpis={data.kpis} />
          </section>

          {/* Section Graphique — CA 30 jours */}
          <section>
            <AdminRevenueChart data={data.chartData} />
          </section>

          {/* Section 2 colonnes : Top Performers + Fil d'actualité */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <AdminTopPerformers rows={data.topPerformers} />
            </div>
            <div>
              <AdminActivityFeed activities={data.activities} />
            </div>
          </section>
        </>
      )}

      {/* Ajouter un vendeur — replié en carte */}
      <section className="border-t border-zinc-800 pt-8">
        <details className="group rounded-xl border border-zinc-800 bg-zinc-900/50">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 md:px-6">
            <UserPlus className="h-5 w-5 text-emerald-500" />
            <span>Ajouter un nouveau vendeur</span>
          </summary>
          <div className="border-t border-zinc-800 p-4 md:p-6">
            <AddSellerForm />
          </div>
        </details>
      </section>
    </div>
  )
}
