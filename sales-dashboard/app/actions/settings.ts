'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { verifyRole } from '@/app/actions/profile'

type AddApiResult = { success: true } | { success: false; error: string }

export async function addPaymentApi(formData: FormData): Promise<AddApiResult> {
  const profile = await verifyRole(['admin'])
  if (!profile) return { success: false, error: 'Accès réservé aux administrateurs.' }

  const supabase = await createClient()
  const name = (formData.get('name') as string || '').trim()
  const vendor_token = (formData.get('vendor_token') as string || '').trim()
  const api_token = (formData.get('api_token') as string || '').trim()

  if (!name || !vendor_token || !api_token) {
    return { success: false, error: 'Tous les champs sont requis.' }
  }

  // Vérifier doublons: Vendor Token ou API Token déjà existant
  const orExpr = `vendor_token.eq.${vendor_token},api_token.eq.${api_token}`
  const { data: existing, error: selError } = await supabase
    .from('payment_apis')
    .select('id')
    .or(orExpr)

  if (selError) {
    console.error('Erreur vérification doublons:', selError)
    return { success: false, error: 'Erreur lors de la vérification des doublons.' }
  }

  if (existing && existing.length > 0) {
    return { success: false, error: 'Cette API est déjà enregistrée dans votre dashboard.' }
  }

  const { error } = await supabase.from('payment_apis').insert({
    name,
    vendor_token,
    api_token,
    daily_usage_count: 0,
    is_active: true,
  })

  if (error) {
    console.error('Erreur ajout API:', error)
    return { success: false, error: "Erreur lors de l'ajout de l'API." }
  }

  revalidatePath('/settings')
  revalidatePath('/')
  return { success: true }
}

export async function toggleApiStatus(id: string, currentStatus: boolean) {
  const profile = await verifyRole(['admin'])
  if (!profile) return

  const supabase = await createClient()
  await supabase
    .from('payment_apis')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  revalidatePath('/settings')
  revalidatePath('/')
}

export async function deleteApi(id: string) {
  const profile = await verifyRole(['admin'])
  if (!profile) return

  const supabase = await createClient()
  await supabase
    .from('payment_apis')
    .delete()
    .eq('id', id)

  revalidatePath('/settings')
  revalidatePath('/')
}