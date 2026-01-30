'use client'

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
import { Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HistoryTransaction {
  id: string
  amount: number
  payment_link: string | null
  status: string
  created_at: string
  customer_email?: string | null
}

interface HistoryTableProps {
  transactions: HistoryTransaction[]
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${h}:${min}`
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'paid':
      return 'Payé'
    case 'pending':
      return 'En attente'
    case 'failed':
      return 'Échoué'
    case 'cancelled':
      return 'Annulé'
    default:
      return status
  }
}

export function HistoryTable({ transactions }: HistoryTableProps) {
  const handleCopy = async (link: string | null) => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 min-w-0">
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Date</TableHead>
            <TableHead className="text-zinc-400">Montant</TableHead>
            <TableHead className="text-zinc-400">Client</TableHead>
            <TableHead className="text-zinc-400">Statut</TableHead>
            <TableHead className="text-zinc-400 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50">
              <TableCell className="font-medium text-zinc-200">
                {formatDate(tx.created_at)}
              </TableCell>
              <TableCell className="font-semibold text-white">
                {formatAmount(tx.amount)}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm">
                {tx.customer_email || '—'}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium border',
                    tx.status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : tx.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                  )}
                >
                  {getStatusLabel(tx.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(tx.payment_link)}
                  disabled={!tx.payment_link}
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  title="Copier le lien"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
