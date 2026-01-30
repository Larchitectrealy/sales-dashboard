import { requireAdmin } from '@/app/actions/profile'
import { getUsersForAdmin } from '@/app/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'
import { UserManagementClient } from './user-management-client'
import { AddUserForm } from './add-user-form'

export default async function AdminUsersPage() {
  await requireAdmin()

  const result = await getUsersForAdmin()
  const users = result.success ? result.users : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8 space-y-8">
      <Link href="/">
        <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;accueil
        </Button>
      </Link>

      <AddUserForm />

      <section>
        <h2 className="text-xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-400" />
          Liste des utilisateurs
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          Rôles et statut banni. Modifiez le rôle ou bannissez un compte.
        </p>

        {users.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 py-12 text-center text-zinc-500">
            Aucun utilisateur en base.
          </div>
        ) : (
          <UserManagementClient users={users} />
        )}
      </section>
    </div>
  )
}
