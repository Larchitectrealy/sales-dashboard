'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateUserRole, setUserBanned, type ProfileRow } from '@/app/actions/admin'
import type { Role } from '@/app/actions/profile'
import { Ban, CheckCircle, Loader2 } from 'lucide-react'

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'user', label: 'Utilisateur' },
]

export function UserManagementClient({ users }: { users: ProfileRow[] }) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRoleChange(userId: string, role: Role) {
    setUpdatingId(userId)
    setError(null)
    try {
      await updateUserRole(userId, role)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleToggleBanned(user: ProfileRow) {
    setUpdatingId(user.id)
    setError(null)
    try {
      await setUserBanned(user.id, !user.banned)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Email</TableHead>
              <TableHead className="text-zinc-400">Rôle</TableHead>
              <TableHead className="text-zinc-400">Statut</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell className="font-medium text-zinc-200">
                  {user.email || user.id.slice(0, 8) + '…'}
                </TableCell>
                <TableCell>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                    disabled={updatingId === user.id}
                    className="w-[140px] rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive" className="gap-1">
                      <Ban className="h-3 w-3" /> Banni
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 gap-1">
                      <CheckCircle className="h-3 w-3" /> Actif
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleBanned(user)}
                    disabled={updatingId === user.id}
                    className={user.banned ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'}
                  >
                    {updatingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.banned ? (
                      'Débannir'
                    ) : (
                      'Bannir'
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
