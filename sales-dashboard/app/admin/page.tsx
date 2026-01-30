import { requireAdmin } from '@/app/actions/profile'
import { getTeamPerformance } from '@/app/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutDashboard, Users } from 'lucide-react'
import { AddSellerForm } from './add-seller-form'
import { TeamPerformanceTable } from './team-performance-table'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  await requireAdmin()

  const perf = await getTeamPerformance()
  const rows = perf.success ? perf.rows : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-zinc-300 hover:text-white hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Users className="mr-2 h-4 w-4" />
              Gestion des utilisateurs
            </Button>
          </Link>
        </div>
      </div>

      <header className="flex items-center gap-3">
        <LayoutDashboard className="h-8 w-8 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tableau Admin</h1>
          <p className="text-zinc-400 text-sm">
            Création de commerciaux et performance de l&apos;équipe.
          </p>
        </div>
      </header>

      <section>
        <AddSellerForm />
      </section>

      <section>
        <TeamPerformanceTable rows={rows} />
      </section>
    </div>
  )
}
