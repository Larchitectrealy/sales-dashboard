import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/app/actions/profile'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (profile.banned) redirect('/login')

  return <DashboardClient initialProfile={profile} />
}
