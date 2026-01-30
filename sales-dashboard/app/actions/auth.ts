'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  console.log("--- Tentative de connexion pour :", email)

  let errorOccurred = false
  let errorMessage = ""

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Erreur Supabase détaillée :", error.message)
      errorOccurred = true
      errorMessage = error.message
    }
  } catch (err) {
    console.error("Erreur système :", err)
    errorOccurred = true
    errorMessage = "Erreur serveur"
  }

  // TRÈS IMPORTANT : Le redirect doit être en dehors du bloc try/catch
  if (errorOccurred) {
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }

  console.log("--- Connexion réussie ! Redirection...")
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}