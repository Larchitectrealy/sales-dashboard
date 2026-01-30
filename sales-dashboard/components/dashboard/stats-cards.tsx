"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Users, CreditCard, Loader2 } from "lucide-react"
import { getDashboardStats } from "@/app/actions/stats"

interface Stats {
  totalRevenue: number
  transactionCount: number
  activeClients: number
}

interface StatsCardsProps {
  refreshTrigger?: number
}

export function StatsCards({ refreshTrigger = 0 }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      const result = await getDashboardStats()
      if (result.success) {
        setStats(result.stats)
      }
      setIsLoading(false)
    }
    fetchStats()
  }, [refreshTrigger])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statsData = [
    {
      label: "Revenus du mois",
      value: stats ? formatCurrency(stats.totalRevenue) : "0 €",
      icon: TrendingUp,
    },
    {
      label: "Transactions",
      value: stats ? stats.transactionCount.toString() : "0",
      icon: CreditCard,
    },
    {
      label: "Clients actifs",
      value: stats ? stats.activeClients.toString() : "0",
      icon: Users,
    },
  ]

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
