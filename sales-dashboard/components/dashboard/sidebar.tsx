"use client"

import { Home, History, Settings, LogOut, Users, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import type { Role } from "@/app/actions/profile"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  role?: Role
  banned?: boolean
}

const baseMenuItems = [
  { id: "accueil", label: "Accueil", icon: Home },
  { id: "historique", label: "Historique", icon: History },
]

const adminMenuItems = [
  { id: "reglages", label: "Réglages (API)", icon: Settings },
  { id: "admin-dashboard", label: "Tableau Admin", icon: LayoutDashboard },
  { id: "admin", label: "Utilisateurs", icon: Users },
]

export function Sidebar({ activeItem, onItemClick, role = "user", banned }: SidebarProps) {
  const isAdmin = role === "admin"
  const menuItems = [...baseMenuItems, ...(isAdmin ? adminMenuItems : [])]

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h2 className="text-xl font-bold text-sidebar-foreground">PayFlow</h2>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <form action={logout} className="w-full">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>
  )
}
