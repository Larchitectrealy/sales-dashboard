'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addPaymentApi } from '@/app/actions/settings'

interface AddApiFormProps {
  /** Message d'erreur initial (ex: depuis searchParams) */
  initialError?: string | null
}

export function AddApiForm({ initialError }: AddApiFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayError = error ?? initialError

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    setIsSubmitting(true)
    try {
      const result = await addPaymentApi(formData)
      if (result.success) {
        form.reset()
        router.refresh()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-6 md:grid-cols-4 items-end"
    >
      {displayError && (
        <div
          className="md:col-span-4 flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{displayError}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="add-name">Nom du compte</Label>
        <Input
          id="add-name"
          name="name"
          placeholder="ex: Lydia Magasin 1"
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="add-vendor">Vendor Token</Label>
        <Input
          id="add-vendor"
          name="vendor_token"
          type="password"
          placeholder="Token magasin"
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="add-api">API Token</Label>
        <Input
          id="add-api"
          name="api_token"
          type="password"
          placeholder="Token API"
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          required
        />
      </div>

      <div className="flex items-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSubmitting ? 'Ajout...' : '+ Ajouter le compte'}
        </Button>
      </div>
    </form>
  )
}
