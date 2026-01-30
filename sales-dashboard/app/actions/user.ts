"use server"

import { createClient } from "@/lib/supabase-server"

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        success: false,
        user: null,
      }
    }

    return {
      success: true,
      user: {
        email: user.email,
        id: user.id,
      },
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return {
      success: false,
      user: null,
    }
  }
}
