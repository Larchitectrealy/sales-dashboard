"use server"

import { createClient } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { getCurrentProfile } from "@/app/actions/profile"

export type CreatePaymentLinkResult =
  | { paymentLink: string }
  | { error: string }

export async function createPaymentLink(formData: FormData): Promise<CreatePaymentLinkResult> {
  const amount = parseFloat(formData.get("amount") as string)

  if (isNaN(amount) || amount <= 0) {
    return { error: "Le montant doit être valide et supérieur à 0." }
  }
  if (amount > 1000) {
    return { error: "Le montant ne peut pas dépasser 1000€." }
  }

  const customerEmail = (formData.get("customer_email") as string)?.trim() || undefined

  const profile = await getCurrentProfile()
  if (!profile || profile.banned) return { error: "Non autorisé" }

  // 2. Chercher une API disponible (client admin pour contourner RLS : payment_apis réservé aux admins)
  const admin = createAdminClient()
  const { data: availableApis, error: apiError } = await admin
    .from("payment_apis")
    .select("*")
    .eq("is_active", true)
    .lt("daily_usage_count", 2)
    .order("daily_usage_count", { ascending: true })
    .limit(1)

  if (apiError) {
    console.error("Erreur lors de la recherche d'API:", apiError)
    return { error: "Erreur lors de la recherche d'un compte disponible" }
  }

  if (!availableApis || availableApis.length === 0) {
    return { error: "Quota journalier atteint pour tous les comptes" }
  }

  const selectedApi = availableApis[0]
  if (!selectedApi.vendor_token) {
    return { error: "Le vendor_token de l'API n'est pas configuré" }
  }

  // 3. Appel Lydia Production — doc officielle : /request/do.json, form-urlencoded, vendor_token uniquement (pas de signature)
  const LYDIA_URL = "https://lydia-app.com/api/request/do.json"
  const recipient = customerEmail || "client@comptoir.fr"

  const body = new URLSearchParams({
    vendor_token: selectedApi.vendor_token,
    amount: String(amount),
    currency: "EUR",
    type: "email",
    recipient,
    message: "Paiement comptoir",
  })

  console.log("🛑 LYDIA REQUEST:", LYDIA_URL, "| amount:", amount, "| recipient:", recipient)

  let rawText: string
  let res: Response
  try {
    res = await fetch(LYDIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    })
    rawText = await res.text()
  } catch (err) {
    console.error("🛑 LYDIA erreur de connexion:", err)
    return { error: "Impossible de joindre l'API Lydia. Vérifiez votre connexion." }
  }

  console.log("🛑 RÉPONSE LYDIA BRUTE:", rawText)

  if (!res.ok) {
    console.error("🛑 LYDIA HTTP", res.status, "— réponse complète:", rawText)
    return { error: `Lydia a refusé la requête (${res.status}).` }
  }

  let json: unknown
  try {
    json = JSON.parse(rawText)
  } catch {
    console.error("🛑 LYDIA réponse non-JSON:", rawText.slice(0, 500))
    return { error: "Lydia a renvoyé un format invalide." }
  }

  const data = json && typeof json === "object" && !Array.isArray(json) ? (json as Record<string, unknown>) : null
  if (!data) {
    console.error("🛑 LYDIA réponse vide ou invalide. JSON:", JSON.stringify(json))
    return { error: "Réponse Lydia invalide." }
  }

  // Doc Lydia : data.error === "0" (string) = requête RÉUSSIE. Ne pas utiliser if (data.error) car "0" est truthy en JS.
  const errorCode = data.error != null ? String(data.error) : ""
  const success = errorCode === "0"

  if (!success) {
    const errMsg = (typeof data.message === "string" && data.message.trim()) ? data.message.trim() : errorCode || "Erreur inconnue"
    console.error("🛑 LYDIA erreur:", errorCode, "| message:", data.message, "| full:", JSON.stringify(data))
    return { error: "Lydia: " + errMsg }
  }

  // Succès : extraire mobile_url (champ de la réponse /api/request/do)
  let paymentLink: string | null = null
  if (typeof data.mobile_url === "string" && data.mobile_url.trim()) {
    paymentLink = data.mobile_url.trim()
  } else if (typeof data.url === "string" && data.url.trim()) {
    paymentLink = data.url.trim()
  } else if (data.request && typeof data.request === "object" && !Array.isArray(data.request)) {
    const req = data.request as Record<string, unknown>
    if (typeof req.mobile_url === "string" && req.mobile_url.trim()) paymentLink = req.mobile_url.trim()
    else if (typeof req.url === "string" && req.url.trim()) paymentLink = req.url.trim()
  }

  if (!paymentLink) {
    console.error("🛑 LYDIA succès mais pas de mobile_url. JSON:", JSON.stringify(data))
    return { error: "Pas de lien dans la réponse Lydia (mobile_url absent)." }
  }

  // 4. Mettre à jour l'usage (admin) et enregistrer la vente (session user)
  const currentUsage = selectedApi.daily_usage_count || 0
  const { error: updateError } = await admin
    .from("payment_apis")
    .update({ daily_usage_count: currentUsage + 1 })
    .eq("id", selectedApi.id)

  if (updateError) {
    console.error("Erreur mise à jour API:", updateError)
  }

  const supabase = await createClient()
  const saleRecord: Record<string, unknown> = {
    amount,
    payment_api_id: selectedApi.id,
    payment_link: paymentLink,
    status: "pending",
    created_at: new Date().toISOString(),
    user_id: profile.id,
  }
  if (customerEmail && String(customerEmail).trim()) {
    saleRecord.customer_email = String(customerEmail).trim()
  }

  const { error: salesError } = await supabase.from("sales").insert(saleRecord)
  if (salesError) {
    console.error("Erreur enregistrement vente:", salesError)
  }

  revalidatePath("/")
  return { paymentLink }
}
