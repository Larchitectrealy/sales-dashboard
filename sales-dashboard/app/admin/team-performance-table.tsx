'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TeamPerformanceRow } from '@/app/actions/admin'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface TeamPerformanceTableProps {
  rows: TeamPerformanceRow[]
}

export function TeamPerformanceTable({ rows }: TeamPerformanceTableProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-emerald-400 text-xl">
          Performance Équipe
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Ventes validées (statut payé) par vendeur — chiffre d&apos;affaires et dernière vente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 py-12 text-center text-zinc-500">
            Aucune vente validée pour l&apos;instant.
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-300 font-medium">Vendeur (Email)</TableHead>
                  <TableHead className="text-zinc-300 font-medium text-right">Ventes validées</TableHead>
                  <TableHead className="text-zinc-300 font-medium text-right">Chiffre d&apos;affaires</TableHead>
                  <TableHead className="text-zinc-300 font-medium text-right">Dernière vente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow
                    key={i}
                    className="border-zinc-800 text-zinc-200 hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-medium">{row.email}</TableCell>
                    <TableCell className="text-right">{row.validatedSales}</TableCell>
                    <TableCell className="text-right text-emerald-400">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400">
                      {formatDate(row.lastSale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
