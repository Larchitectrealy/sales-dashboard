'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createUserByAdmin } from '@/app/actions/admin'
import { UserPlus, AlertCircle } from 'lucide-react'

const ROLES = [
  { value: 'user', label: 'Utilisateur' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'admin', label: 'Admin' },
] as const

export function AddUserForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const form = e.currentTarget
    const formData = new FormData(form)
    setIsSubmitting(true)
    try {
      const result = await createUserByAdmin(formData)
      if (result.success) {
        setSuccess(true)
        form.reset()
        router.refresh()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-emerald-400 text-xl flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Ajouter un utilisateur
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Créez un compte avec email et mot de passe. Le rôle par défaut est Utilisateur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4 items-end">
          {error && (
            <div className="md:col-span-4 flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="md:col-span-4 rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-200">
              Utilisateur créé. La liste ci-dessous a été mise à jour.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-user-email">Email</Label>
            <Input
              id="new-user-email"
              name="email"
              type="email"
              placeholder="nouveau@exemple.com"
              required
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-user-password">Mot de passe</Label>
            <Input
              id="new-user-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-user-role">Rôle</Label>
            <select
              id="new-user-role"
              name="role"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
