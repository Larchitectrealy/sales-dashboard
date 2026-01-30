import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HistoryTable } from '@/components/historique/history-table'
import { getHistoryTransactions } from '@/app/actions/get-transactions'
import { getCurrentProfile } from '@/app/actions/profile'
import { ArrowLeft, History } from 'lucide-react'

export default async function HistoriquePage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (profile.banned) redirect('/login')

  const result = await getHistoryTransactions()
  const transactions = result.success ? (result.transactions ?? []) : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 space-y-6 md:space-y-8">
      <Link href="/">
        <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;accueil
        </Button>
      </Link>

      <section className="min-w-0">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2 flex items-center gap-2 md:text-4xl">
          <History className="h-6 w-6 shrink-0 text-emerald-400 md:h-7 md:w-7" />
          Historique des transactions
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          Dernières ventes (payées ou en attente). Cliquez sur l&apos;icône pour copier le lien de paiement.
        </p>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-12 px-4 text-center md:py-16 md:px-6">
            <div className="rounded-full bg-zinc-800 p-4 mb-4">
              <History className="h-10 w-10 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-medium">Aucune transaction</p>
            <p className="text-zinc-500 text-sm mt-1">Les ventes apparaîtront ici après création de liens.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <HistoryTable transactions={transactions} />
          </div>
        )}
      </section>
    </div>
  )
}
