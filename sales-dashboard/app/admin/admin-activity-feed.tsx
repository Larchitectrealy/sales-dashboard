'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Link2, CheckCircle } from 'lucide-react'
import type { ActivityItem } from '@/app/actions/admin'

interface AdminActivityFeedProps {
  activities: ActivityItem[]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return 'À l\'instant'
  if (diffMin < 60) return `Il y a ${diffMin} min`
  if (diffH < 24) return `Il y a ${diffH} h`
  if (diffD < 7) return `Il y a ${diffD} j`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function AdminActivityFeed({ activities }: AdminActivityFeedProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Activity className="h-5 w-5 text-zinc-500" />
          Dernières activités
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">Aucune activité récente.</p>
        ) : (
          <ul className="space-y-3 max-h-[320px] overflow-y-auto">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                {a.type === 'sale_paid' ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <Link2 className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-200">{a.message}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatTime(a.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
