import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { unstable_noStore } from 'next/cache'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApiCard } from '@/components/settings/api-card'
import { AddApiForm } from '@/components/settings/add-api-form'
import { Wallet, ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/app/actions/profile'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  await requireAdmin()
  unstable_noStore()

  const supabase = await createClient()
  const { data: apisRaw, error: apisError } = await supabase
    .from('payment_apis')
    .select('*')
    .order('created_at', { ascending: true })

  if (apisError) {
    console.error('Settings: erreur chargement APIs', apisError)
  }
  const apis = Array.isArray(apisRaw) ? apisRaw : []

  const errorParam = typeof searchParams?.error === 'string' ? searchParams.error : Array.isArray(searchParams?.error) ? searchParams.error[0] : undefined

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8 space-y-10">
      <Link href="/">
        <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;accueil
        </Button>
      </Link>

      {/* SECTION 1 : Ajouter une API */}
      <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-emerald-400 text-xl">Ajouter un compte Lydia Pro</CardTitle>
          <CardDescription className="text-zinc-400">
            Configurez vos tokens Vendor et API. Les doublons sont refusés.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <AddApiForm initialError={errorParam} />
        </CardContent>
      </Card>

      {/* SECTION 2 : Liste des comptes (Wallet) - visible après ajout */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Portefeuille de Terminaisons</h2>
        <p className="text-zinc-500 text-sm mb-6">Activer, désactiver ou supprimer les comptes Lydia ci-dessous.</p>

        {apisError && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            Erreur chargement des APIs : {apisError.message}. Vérifiez les permissions Supabase (RLS) sur la table payment_apis.
          </div>
        )}

        {apis.length === 0 && !apisError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 py-16 px-6 text-center">
            <div className="rounded-full bg-zinc-800 p-4 mb-4">
              <Wallet className="h-10 w-10 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-medium">Aucune API configurée</p>
            <p className="text-zinc-500 text-sm mt-1">Ajoutez un compte ci-dessus pour le voir apparaître ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apis.map((api: { id: string; name?: string; is_active?: boolean; daily_usage_count?: number; max_daily_usage?: number; api_token?: string | null; vendor_token?: string | null }) => (
              <ApiCard key={api.id} api={api} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
