'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSellerWithGeneratedPassword } from '@/app/actions/admin'
import { UserPlus, AlertCircle, Copy, Check } from 'lucide-react'

export function AddSellerForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modal, setModal] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setModal(null)
    const form = e.currentTarget
    const email = (form.email as HTMLInputElement).value?.trim()
    if (!email) return
    setIsSubmitting(true)
    try {
      const result = await createSellerWithGeneratedPassword(email)
      if (result.success) {
        setModal({ email, password: result.password })
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

  async function copyPassword() {
    if (!modal?.password) return
    try {
      await navigator.clipboard.writeText(modal.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Impossible de copier.')
    }
  }

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-emerald-400 text-xl flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Ajouter un nouveau vendeur
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Un mot de passe sera généré automatiquement. Il ne sera affiché qu&apos;une seule fois — copiez-le pour le transmettre au commercial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            {error && (
              <div className="w-full flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="seller-email">Email du commercial</Label>
              <Input
                id="seller-email"
                name="email"
                type="email"
                placeholder="commercial@exemple.com"
                required
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Création...' : 'Créer le commercial'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modale : mot de passe en clair (une seule fois) */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setModal(null)}
        >
          <Card
            className="w-full max-w-md border-zinc-700 bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-400 text-lg">
                Commercial créé
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Transmettez ce mot de passe à <strong className="text-zinc-200">{modal.email}</strong>. Il ne sera plus affiché.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-3 font-mono text-sm text-white break-all select-all">
                {modal.password}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={copyPassword}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copier
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setModal(null)}
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
