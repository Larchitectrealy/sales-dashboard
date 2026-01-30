"use client"

import { useRouter } from "next/navigation"
import { Home, History, Settings, LayoutDashboard, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "@/app/actions/profile"

interface MobileBottomNavProps {
  activeItem: string
  onItemClick: (item: string) => void
  role?: Role
}

const baseItems = [
  { id: "accueil", label: "Accueil", icon: Home },
  { id: "historique", label: "Historique", icon: History },
]

const adminItems = [
  { id: "reglages", label: "Réglages", icon: Settings },
  { id: "admin-dashboard", label: "Admin", icon: LayoutDashboard },
  { id: "admin", label: "Utilisateurs", icon: Users },
]

export function MobileBottomNav({ activeItem, onItemClick, role = "user" }: MobileBottomNavProps) {
  const router = useRouter()
  const isAdmin = role === "admin"
  const items = [...baseItems, ...(isAdmin ? adminItems : [])]

  const handleClick = (itemId: string) => {
    onItemClick(itemId)
    if (itemId === "reglages") router.push("/settings")
    else if (itemId === "historique") router.push("/historique")
    else if (itemId === "admin-dashboard") router.push("/admin")
    else if (itemId === "admin") router.push("/admin/users")
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeItem === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors min-w-0 flex-1",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
