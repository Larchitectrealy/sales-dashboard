"use server"

import { createClient } from "@/lib/supabase-server"
import { getCurrentProfile } from "@/app/actions/profile"

const DEFAULT_LIMIT = 5
const HISTORY_LIMIT = 100

export async function getLatestTransactions(limit = DEFAULT_LIMIT) {
  try {
    const supabase = await createClient()
    const profile = await getCurrentProfile()
    if (!profile || profile.banned) {
      return { success: false, error: "Non autorisé", transactions: [] }
    }

    let query = supabase.from("sales").select("*").order("created_at", { ascending: false }).limit(limit)
    if (profile.role === "user") {
      query = query.eq("user_id", profile.id)
    }
    const { data: transactions, error } = await query

    if (error) {
      console.error("Erreur lors de la récupération des transactions:", error)
      return {
        success: false,
        error: "Erreur lors de la récupération des transactions",
        transactions: [],
      }
    }

    return {
      success: true,
      transactions: transactions || [],
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error)
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
      transactions: [],
    }
  }
}

/** Pour la page Historique : plus de transactions, statuts pending/paid */
export async function getHistoryTransactions() {
  return getLatestTransactions(HISTORY_LIMIT)
}
