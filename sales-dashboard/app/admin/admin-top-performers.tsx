'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TopPerformerRow } from '@/app/actions/admin'

interface AdminTopPerformersProps {
  rows: TopPerformerRow[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

export function AdminTopPerformers({ rows }: AdminTopPerformersProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-zinc-100">
          Top performeurs (ce mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">Aucune vente ce mois-ci.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Vendeur</TableHead>
                  <TableHead className="text-zinc-400 text-right">CA généré</TableHead>
                  <TableHead className="text-zinc-400 text-right">Ventes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-200">{row.email}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-400">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400">{row.salesCount}</TableCell>
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
