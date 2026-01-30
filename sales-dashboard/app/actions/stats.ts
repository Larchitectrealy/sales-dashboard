"use server"

import { createClient } from "@/lib/supabase-server"
import { getCurrentProfile } from "@/app/actions/profile"

export async function getDashboardStats() {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()
    if (!profile || profile.banned) {
      return {
        success: false,
        error: "Non autorisé",
        stats: { totalRevenue: 0, transactionCount: 0, activeClients: 0 },
      }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // user : uniquement ses ventes ; admin/moderator : toutes
    const baseQuery = () => {
      let q = supabase.from("sales").select("amount, id")
      if (profile.role === "user") {
        q = q.eq("user_id", profile.id)
      }
      return q
    }

    // Revenu du mois = uniquement les ventes payées (status = 'paid')
    const { data: salesThisMonth, error: salesError } = await baseQuery()
      .eq("status", "paid")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    if (salesError) {
      console.error("Erreur lors de la récupération des ventes:", salesError)
    }

    const totalRevenue =
      salesThisMonth?.reduce((sum, sale) => sum + (parseFloat(sale.amount.toString()) || 0), 0) || 0
    const transactionCount = salesThisMonth?.length || 0

    const { data: allSales, error: allSalesError } = await baseQuery()
    if (allSalesError) {
      console.error("Erreur lors de la récupération de toutes les ventes:", allSalesError)
    }
    const activeClients = allSales?.length || 0

    return {
      success: true,
      stats: {
        totalRevenue,
        transactionCount,
        activeClients,
      },
    }
  } catch (error) {
    console.error("Erreur lors du calcul des stats:", error)
    return {
      success: false,
      error: "Erreur lors du calcul des statistiques",
      stats: {
        totalRevenue: 0,
        transactionCount: 0,
        activeClients: 0,
      },
    }
  }
}
