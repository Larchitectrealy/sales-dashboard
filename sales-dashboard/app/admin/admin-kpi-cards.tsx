'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TrendingUp, Users, Percent, Calendar } from 'lucide-react'
import type { AdminDashboardKPIs } from '@/app/actions/admin'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

interface AdminKPICardsProps {
  kpis: AdminDashboardKPIs
}

export function AdminKPICards({ kpis }: AdminKPICardsProps) {
  const cards = [
    {
      title: 'CA Aujourd\'hui',
      value: formatCurrency(kpis.caToday),
      sub: kpis.caTodayChangePercent != null ? (
        <span className={kpis.caTodayChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {kpis.caTodayChangePercent >= 0 ? '+' : ''}{kpis.caTodayChangePercent} % vs hier
        </span>
      ) : null,
      icon: TrendingUp,
      className: 'border-zinc-800 bg-zinc-900/80',
    },
    {
      title: 'Vendeurs actifs',
      value: String(kpis.activeSellersToday),
      sub: 'Aujourd\'hui',
      icon: Users,
      className: 'border-zinc-800 bg-zinc-900/80',
    },
    {
      title: 'Taux de conversion',
      value: `${kpis.conversionRatePercent} %`,
      sub: 'Liens → ventes payées (mois)',
      icon: Percent,
      className: 'border-zinc-800 bg-zinc-900/80',
    },
    {
      title: 'CA total du mois',
      value: formatCurrency(kpis.caMonthTotal),
      sub: 'Ventes validées',
      icon: Calendar,
      className: 'border-zinc-800 bg-zinc-900/80',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.title} className={c.className}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-zinc-400">{c.title}</span>
              <Icon className="h-5 w-5 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-white md:text-3xl">{c.value}</p>
              {c.sub && <p className="mt-1 text-xs text-zinc-500">{c.sub}</p>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
