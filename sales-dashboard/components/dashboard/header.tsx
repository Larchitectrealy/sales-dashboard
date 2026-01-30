"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/app/actions/user"

export function DashboardHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const result = await getCurrentUser()
      if (result.success && result.user) {
        setUserEmail(result.user.email || null)
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-foreground md:text-4xl truncate">Tableau de Bord</h1>
      <p className="text-sm text-muted-foreground truncate">
        {isLoading
          ? "Chargement..."
          : userEmail
            ? `Bonjour, ${userEmail}`
            : "Bienvenue ! Voici un aperçu de vos ventes."}
      </p>
    </div>
  )
}
