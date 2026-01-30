'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { requireAdmin, type Role } from '@/app/actions/profile'
import crypto from 'crypto'

/** Génère un mot de passe aléatoire de 12 caractères alphanumériques. */
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars[crypto.randomInt(0, chars.length)]
  }
  return password
}

export interface ProfileRow {
  id: string
  email: string | null
  role: Role
  banned: boolean
  created_at: string
  updated_at: string
}

/** Liste tous les profils (admin uniquement). */
export async function getUsersForAdmin(): Promise<{ success: boolean; users: ProfileRow[]; error?: string }> {
  const profile = await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, banned, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUsersForAdmin:', error)
    return { success: false, users: [], error: error.message }
  }
  return { success: true, users: (data ?? []) as ProfileRow[] }
}

/** Changer le rôle d'un utilisateur (admin uniquement). */
export async function updateUserRole(userId: string, role: Role) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('updateUserRole:', error)
    throw new Error(error.message)
  }
  revalidatePath('/admin/users')
}

/** Bannir / débannir un utilisateur (admin uniquement). */
export async function setUserBanned(userId: string, banned: boolean) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ banned, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('setUserBanned:', error)
    throw new Error(error.message)
  }
  revalidatePath('/admin/users')
}

export type CreateUserResult = { success: true } | { success: false; error: string }

/** Créer un utilisateur (admin uniquement). Utilise la clé service_role. */
export async function createUserByAdmin(formData: FormData): Promise<CreateUserResult> {
  await requireAdmin()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const role = (formData.get('role') as Role) || 'user'

  if (!email) return { success: false, error: "L'email est requis." }
  if (!password || password.length < 6) return { success: false, error: 'Le mot de passe doit faire au moins 6 caractères.' }
  if (!['admin', 'moderator', 'user'].includes(role)) return { success: false, error: 'Rôle invalide.' }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        return { success: false, error: 'Un compte existe déjà avec cet email.' }
      }
      return { success: false, error: error.message }
    }

    const userId = data?.user?.id
    if (!userId) return { success: false, error: 'Utilisateur créé mais ID introuvable.' }

    const { error: profileError } = await admin
      .from('profiles')
      .upsert(
        { id: userId, email, role, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('Upsert profil:', profileError)
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (e) {
    console.error('createUserByAdmin:', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur lors de la création de l'utilisateur.",
    }
  }
}

export type CreateSellerResult =
  | { success: true; password: string }
  | { success: false; error: string }

/** Créer un commercial (vendeur) avec mot de passe auto-généré. Admin uniquement. */
export async function createSellerWithGeneratedPassword(email: string): Promise<CreateSellerResult> {
  await requireAdmin()

  const trimmedEmail = email?.trim()
  if (!trimmedEmail) return { success: false, error: "L'email est requis." }

  const password = generateSecurePassword()

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        return { success: false, error: 'Un compte existe déjà avec cet email.' }
      }
      return { success: false, error: error.message }
    }

    const userId = data?.user?.id
    if (!userId) return { success: false, error: 'Utilisateur créé mais ID introuvable.' }

    await admin
      .from('profiles')
      .upsert(
        { id: userId, email: trimmedEmail, role: 'user', updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { success: true, password }
  } catch (e) {
    console.error('createSellerWithGeneratedPassword:', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur lors de la création du commercial.",
    }
  }
}

export interface TeamPerformanceRow {
  email: string
  validatedSales: number
  revenue: number
  lastSale: string | null
}

/** Tableau de bord performance équipe : ventes groupées par vendeur (admin uniquement). */
export async function getTeamPerformance(): Promise<{
  success: boolean
  rows: TeamPerformanceRow[]
  error?: string
}> {
  await requireAdmin()

  try {
    const admin = createAdminClient()

    const { data: paidSales, error: salesError } = await admin
      .from('sales')
      .select('user_id, amount, created_at')
      .eq('status', 'paid')

    if (salesError) {
      console.error('getTeamPerformance sales:', salesError)
      return { success: false, rows: [], error: salesError.message }
    }

    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('id, email')

    if (profilesError) {
      console.error('getTeamPerformance profiles:', profilesError)
      return { success: false, rows: [], error: profilesError.message }
    }

    const profileById = new Map<string, string>()
    for (const p of profiles ?? []) {
      profileById.set(p.id, p.email ?? '—')
    }

    type Agg = { count: number; total: number; lastDate: string | null }
    const byUser = new Map<string, Agg>()

    for (const sale of paidSales ?? []) {
      const uid = sale.user_id ?? '__anonymous__'
      const amount = parseFloat(String(sale.amount ?? 0)) || 0
      const createdAt = sale.created_at ?? null

      if (!byUser.has(uid)) {
        byUser.set(uid, { count: 0, total: 0, lastDate: null })
      }
      const agg = byUser.get(uid)!
      agg.count += 1
      agg.total += amount
      if (createdAt && (!agg.lastDate || createdAt > agg.lastDate)) {
        agg.lastDate = createdAt
      }
    }

    const rows: TeamPerformanceRow[] = []
    for (const [userId, agg] of byUser.entries()) {
      const email = userId === '__anonymous__' ? '— (non attribuée)' : profileById.get(userId) ?? '—'
      rows.push({
        email,
        validatedSales: agg.count,
        revenue: agg.total,
        lastSale: agg.lastDate,
      })
    }

    rows.sort((a, b) => b.revenue - a.revenue)
    return { success: true, rows }
  } catch (e) {
    console.error('getTeamPerformance:', e)
    return {
      success: false,
      rows: [],
      error: e instanceof Error ? e.message : 'Erreur lors du chargement des performances.',
    }
  }
}

// --- Dashboard Performance Admin ---

function getStartOfDayUTC(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0))
  return x
}

export interface AdminDashboardKPIs {
  caToday: number
  caTodayChangePercent: number | null
  activeSellersToday: number
  conversionRatePercent: number
  caMonthTotal: number
}

export interface AdminDashboardChartPoint {
  date: string
  amount: number
}

export interface TopPerformerRow {
  email: string
  revenue: number
  salesCount: number
}

export interface ActivityItem {
  id: string
  type: 'link_created' | 'sale_paid'
  message: string
  createdAt: string
}

export interface AdminDashboardData {
  kpis: AdminDashboardKPIs
  chartData: AdminDashboardChartPoint[]
  topPerformers: TopPerformerRow[]
  activities: ActivityItem[]
}

/** Données complètes du dashboard performance admin. */
export async function getAdminDashboardData(): Promise<{
  success: boolean
  data?: AdminDashboardData
  error?: string
}> {
  await requireAdmin()

  try {
    const admin = createAdminClient()
    const now = new Date()
    const todayStart = getStartOfDayUTC(now)
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1)
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    const { data: allSales, error: salesError } = await admin
      .from('sales')
      .select('id, user_id, amount, status, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (salesError) {
      console.error('getAdminDashboardData sales:', salesError)
      return { success: false, error: salesError.message }
    }

    const sales = allSales ?? []
    const profilesById = new Map<string, string>()
    const { data: profiles } = await admin.from('profiles').select('id, email')
    for (const p of profiles ?? []) {
      profilesById.set(p.id, p.email ?? '—')
    }

    const paidSales = sales.filter((s) => s.status === 'paid')
    const amount = (s: (typeof sales)[0]) => parseFloat(String(s.amount ?? 0)) || 0

    const todayPaid = paidSales.filter(
      (s) => s.created_at && s.created_at >= todayStart.toISOString() && s.created_at < tomorrowStart.toISOString()
    )
    const yesterdayPaid = paidSales.filter(
      (s) => s.created_at && s.created_at >= yesterdayStart.toISOString() && s.created_at < todayStart.toISOString()
    )
    const caToday = todayPaid.reduce((sum, s) => sum + amount(s), 0)
    const caYesterday = yesterdayPaid.reduce((sum, s) => sum + amount(s), 0)
    const caTodayChangePercent =
      caYesterday > 0 ? Math.round(((caToday - caYesterday) / caYesterday) * 100) : caToday > 0 ? 100 : null

    const todayAny = sales.filter(
      (s) => s.created_at && s.created_at >= todayStart.toISOString() && s.created_at < tomorrowStart.toISOString()
    )
    const activeSellersToday = new Set(todayAny.map((s) => s.user_id).filter(Boolean)).size

    const monthPaid = paidSales.filter((s) => s.created_at && s.created_at >= monthStart.toISOString())
    const monthTotal = sales.filter((s) => s.created_at && s.created_at >= monthStart.toISOString())
    const conversionRatePercent =
      monthTotal.length > 0 ? Math.round((monthPaid.length / monthTotal.length) * 100) : 0
    const caMonthTotal = monthPaid.reduce((sum, s) => sum + amount(s), 0)

    const kpis: AdminDashboardKPIs = {
      caToday,
      caTodayChangePercent,
      activeSellersToday,
      conversionRatePercent,
      caMonthTotal,
    }

    const dayToAmount = new Map<string, number>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setUTCDate(d.getUTCDate() + i)
      const dayKey = d.toISOString().slice(0, 10)
      dayToAmount.set(dayKey, 0)
    }
    for (const s of paidSales) {
      if (!s.created_at) continue
      const dayKey = s.created_at.slice(0, 10)
      if (dayToAmount.has(dayKey)) {
        dayToAmount.set(dayKey, dayToAmount.get(dayKey)! + amount(s))
      }
    }
    const chartData: AdminDashboardChartPoint[] = Array.from(dayToAmount.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }))

    const monthPaidByUser = new Map<string, { revenue: number; count: number }>()
    for (const s of monthPaid) {
      const uid = s.user_id ?? '__anon__'
      if (!monthPaidByUser.has(uid)) monthPaidByUser.set(uid, { revenue: 0, count: 0 })
      const agg = monthPaidByUser.get(uid)!
      agg.revenue += amount(s)
      agg.count += 1
    }
    const topPerformers: TopPerformerRow[] = Array.from(monthPaidByUser.entries())
      .filter(([uid]) => uid !== '__anon__')
      .map(([uid, agg]) => ({
        email: profilesById.get(uid) ?? '—',
        revenue: agg.revenue,
        salesCount: agg.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    const recentSales = [...sales].sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    ).slice(0, 25)
    const activities: ActivityItem[] = recentSales.map((s) => {
      const email = s.user_id ? profilesById.get(s.user_id) ?? '—' : '—'
      const amt = amount(s)
      if (s.status === 'paid') {
        return {
          id: s.id,
          type: 'sale_paid' as const,
          message: `Vente validée de ${amt.toFixed(0)} € par ${email}`,
          createdAt: s.created_at ?? '',
        }
      }
      return {
        id: s.id,
        type: 'link_created' as const,
        message: `${email} a généré un lien`,
        createdAt: s.created_at ?? '',
      }
    })

    return {
      success: true,
      data: { kpis, chartData, topPerformers, activities },
    }
  } catch (e) {
    console.error('getAdminDashboardData:', e)
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Erreur lors du chargement du dashboard.',
    }
  }
}
