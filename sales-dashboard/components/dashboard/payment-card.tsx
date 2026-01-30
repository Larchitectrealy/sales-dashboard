"use client"

import { CreditCard, Wallet } from "lucide-react"

export function PaymentCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">
          Méthodes de paiement
        </h3>
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Carte bancaire</p>
              <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
            </div>
          </div>
          <span className="text-sm font-medium text-primary">Par défaut</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Wallet className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Portefeuille</p>
              <p className="text-sm text-muted-foreground">Solde: 1,250 €</p>
            </div>
          </div>
        </div>
      </div>
      <button className="mt-4 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
        Ajouter une méthode
      </button>
    </div>
  )
}
