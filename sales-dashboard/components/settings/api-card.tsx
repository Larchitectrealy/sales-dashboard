'use client'

import { useRouter } from 'next/navigation'
import { CreditCard, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toggleApiStatus, deleteApi } from '@/app/actions/settings'

interface ApiCardProps {
  api: any
}

export function ApiCard({ api }: ApiCardProps) {
  const router = useRouter()

  const handleToggle = async () => {
    await toggleApiStatus(api.id, api.is_active)
    router.refresh()
  }

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette API ?')) {
      await deleteApi(api.id)
      router.refresh()
    }
  }

  const maxUsage = api.max_daily_usage || 2
  const usage = api.daily_usage_count || 0
  const pct = Math.min(100, Math.round((usage / maxUsage) * 100))

  const maskedToken = (token?: string | null) => {
    if (!token) return '•••• ••••'
    const t = token.trim()
    if (t.length <= 8) return '•••• ••••'
    return '•••• ' + t.slice(-4)
  }

  return (
    <div
      className={`relative rounded-xl p-5 shadow-md border ${api.is_active ? 'border-emerald-600/40' : 'border-zinc-800'} bg-gradient-to-br from-zinc-900 to-zinc-950`}
      style={{ boxShadow: api.is_active ? '0 6px 20px rgba(16,185,129,0.08)' : undefined }}
    >
      {/* Top row: icon, name, switch */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${api.is_active ? 'bg-emerald-900/20' : 'bg-zinc-800'}`}>
            <CreditCard className={`${api.is_active ? 'text-emerald-400' : 'text-zinc-400'} h-5 w-5`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${api.is_active ? 'text-white' : 'text-zinc-300'}`}>{api.name}</h3>
            <div className="mt-1 text-xs text-zinc-400">{api.is_active ? 'Actif' : 'Inactif'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={!!api.is_active} onCheckedChange={async () => await handleToggle()} />
        </div>
      </div>

      {/* Middle: masked token */}
      <div className="mt-6">
        <div className="text-xs text-zinc-400">Token</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="font-mono text-sm tracking-wider text-white">{maskedToken(api.api_token || api.vendor_token)}</div>
          <Badge className={`${api.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-zinc-800 text-zinc-400'} text-sm`}>{usage}/{maxUsage}</Badge>
        </div>
      </div>

      {/* Bottom: progress bar and delete */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex-1 pr-4">
          <div className="w-full h-2 bg-zinc-800 rounded-full">
            <div
              className={`h-2 rounded-full ${usage >= maxUsage ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-zinc-400">Quota journalier</div>
        </div>

        <div className="flex flex-col items-end">
          <Button variant="ghost" size="icon" className="text-red-500" onClick={handleDelete} aria-label="Supprimer API">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
