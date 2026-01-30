"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function generatePaymentLink(amount: number) {
  try {
    // Vérifier que le montant est <= 1000
    if (amount > 1000) {
      return {
        success: false,
        error: "Le montant maximum est de 1000 €",
      }
    }

    if (amount <= 0) {
      return {
        success: false,
        error: "Le montant doit être supérieur à 0",
      }
    }

    // Chercher une API active avec daily_usage_count < 2
    const { data: availableApi, error: apiError } = await supabase
      .from("payment_apis")
      .select("*")
      .eq("is_active", true)
      .lt("daily_usage_count", 2)
      .limit(1)
      .single()

    if (apiError || !availableApi) {
      return {
        success: false,
        error: "Aucun compte disponible",
      }
    }

    // Simuler l'appel à Lydia (lien factice pour l'instant)
    const paymentLink = `https://lydia-app.com/pay/${availableApi.id}/${Date.now()}`

    // Incrémenter daily_usage_count de +1
    const { error: updateError } = await supabase
      .from("payment_apis")
      .update({ daily_usage_count: availableApi.daily_usage_count + 1 })
      .eq("id", availableApi.id)

    if (updateError) {
      console.error("Erreur lors de la mise à jour de l'API:", updateError)
      return {
        success: false,
        error: "Erreur lors de la mise à jour de l'API",
      }
    }

    // Enregistrer la transaction dans la table sales
    const { error: salesError } = await supabase.from("sales").insert({
      amount: amount,
      payment_api_id: availableApi.id,
      payment_link: paymentLink,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    if (salesError) {
      console.error("Erreur lors de l'enregistrement de la vente:", salesError)
      return {
        success: false,
        error: "Erreur lors de l'enregistrement de la transaction",
      }
    }

    // Revalider le cache pour mettre à jour l'interface
    revalidatePath("/")

    return {
      success: true,
      paymentLink: paymentLink,
      apiId: availableApi.id,
    }
  } catch (error) {
    console.error("Erreur lors de la génération du lien:", error)
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    }
  }
}
