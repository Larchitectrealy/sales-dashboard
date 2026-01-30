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
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8 space-y-8">
      <Link href="/">
        <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;accueil
        </Button>
      </Link>

      <section>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
          <History className="h-7 w-7 text-emerald-400" />
          Historique des transactions
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          Dernières ventes (payées ou en attente). Cliquez sur l&apos;icône pour copier le lien de paiement.
        </p>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-16 px-6 text-center">
            <div className="rounded-full bg-zinc-800 p-4 mb-4">
              <History className="h-10 w-10 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-medium">Aucune transaction</p>
            <p className="text-zinc-500 text-sm mt-1">Les ventes apparaîtront ici après création de liens.</p>
          </div>
        ) : (
          <HistoryTable transactions={transactions} />
        )}
      </section>
    </div>
  )
}
