'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export type Role = 'admin' | 'moderator' | 'user'

export interface Profile {
  id: string
  email: string | null
  role: Role
  banned: boolean
}

/** Récupère le profil de l'utilisateur connecté. Crée le profil si absent (rétrocompat). */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, banned')
    .eq('id', user.id)
    .single()

  if (profile) {
    return {
      id: profile.id,
      email: profile.email ?? user.email ?? null,
      role: (profile.role as Role) || 'user',
      banned: profile.banned ?? false,
    }
  }

  // Création lazy du profil pour les utilisateurs existants avant RBAC
  const { data: inserted } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email ?? null,
      role: 'user',
      banned: false,
    })
    .select('id, email, role, banned')
    .single()

  if (!inserted) return null
  return {
    id: inserted.id,
    email: inserted.email ?? user.email ?? null,
    role: (inserted.role as Role) || 'user',
    banned: inserted.banned ?? false,
  }
}

/** Vérifie que l'utilisateur a l'un des rôles. Sinon redirige ou renvoie null. */
export async function requireRole(allowedRoles: Role[]): Promise<Profile | null> {
  const profile = await getCurrentProfile()
  if (!profile || profile.banned) {
    redirect('/login')
  }
  if (!allowedRoles.includes(profile.role)) {
    return null
  }
  return profile
}

/** Admin uniquement. Redirige si non connecté ou non admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireRole(['admin'])
  if (!profile) redirect('/')
  return profile
}

/** Vérifie le rôle côté backend (pour Server Actions). Renvoie le profil ou null. */
export async function verifyRole(allowedRoles: Role[]): Promise<Profile | null> {
  return requireRole(allowedRoles)
}
