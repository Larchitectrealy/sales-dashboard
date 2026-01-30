"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLatestTransactions } from "@/app/actions/get-transactions"

interface Transaction {
  id: string
  amount: number
  payment_link: string | null
  status: "pending" | "paid" | "failed" | "cancelled"
  created_at: string
}

interface TransactionsTableProps {
  refreshTrigger?: number
}

export function TransactionsTable({ refreshTrigger = 0 }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getLatestTransactions()
      if (result.success) {
        setTransactions(result.transactions)
      } else {
        setError(result.error || "Erreur lors du chargement")
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [refreshTrigger])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${day}/${month}`
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const handleCopyLink = async (paymentLink: string | null) => {
    if (!paymentLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(paymentLink)
      // Optionnel: afficher un toast de confirmation
    } catch (err) {
      console.error("Erreur lors de la copie:", err)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé"
      case "pending":
        return "Pending"
      case "failed":
        return "Échoué"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xl md:p-6">
      <h3 className="mb-4 text-lg font-bold text-card-foreground md:mb-6 md:text-xl">
        Dernières Transactions
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-destructive">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Aucune transaction récente
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Montant</TableHead>
                <TableHead className="text-muted-foreground">Statut</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-card-foreground">
                    {formatDate(transaction.created_at)}
                  </TableCell>
                  <TableCell className="font-semibold text-card-foreground">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium border",
                        transaction.status === "paid"
                          ? "bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/30 hover:bg-[var(--color-success)]/30"
                          : transaction.status === "pending"
                            ? "bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/30 hover:bg-[var(--color-warning)]/30"
                            : "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)] border-[var(--color-destructive)]/30 hover:bg-[var(--color-destructive)]/30"
                      )}
                    >
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyLink(transaction.payment_link)}
                      disabled={!transaction.payment_link}
                      className="h-8 w-8"
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
      )}
    </div>
  )
}
