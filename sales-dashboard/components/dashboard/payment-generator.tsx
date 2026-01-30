"use client"

import { useState } from "react"
import { CreditCard, AlertTriangle, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createPaymentLink } from "@/app/actions/payment"

interface PaymentGeneratorProps {
  onLinkCreated?: () => void
}

export function PaymentGenerator({ onLinkCreated }: PaymentGeneratorProps) {
  const [amount, setAmount] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    setGeneratedLink(null) // Réinitialiser le lien si le montant change

    if (value) {
      const numValue = parseFloat(value)
      if (isNaN(numValue) || numValue <= 0) {
        setError("Le montant doit être un nombre positif")
      } else if (numValue > 1000) {
        setError("Le montant maximum est de 1000 €")
      } else {
        setError("")
      }
    } else {
      setError("")
    }
  }

  const handleCreateLink = async () => {
    if (!amount) {
      setError("Veuillez saisir un montant")
      return
    }

    const numValue = parseFloat(amount)
    if (isNaN(numValue) || numValue <= 0) {
      setError("Le montant doit être un nombre positif")
      return
    }
    if (numValue > 1000) {
      setError("Le montant maximum est de 1000 €")
      return
    }

    setIsLoading(true)
    setError("")
    setGeneratedLink(null)

    try {
      const formData = new FormData()
      formData.set("amount", amount)
      if (customerEmail) formData.set("customer_email", customerEmail)

      const result = await createPaymentLink(formData)

      if ("error" in result) {
        setError(result.error)
        return
      }

      const link = result.paymentLink
      if (
        link &&
        link.startsWith("http") &&
        !link.includes("ogp.me") &&
        !link.includes("schema.org") &&
        link.length > 20
      ) {
        setGeneratedLink(link)
        setAmount("")
        if (onLinkCreated) onLinkCreated()
      } else {
        setError("Le lien généré n'est pas valide. Veuillez réessayer.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCustomerEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerEmail(e.target.value)
  }

  const handleCopyLink = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink)
        // Optionnel: afficher un message de confirmation
      } catch (err) {
        console.error("Erreur lors de la copie:", err)
      }
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xl md:p-8">
      <div className="mb-4 flex items-center gap-3 md:mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 md:h-12 md:w-12">
          <CreditCard className="h-5 w-5 text-primary md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-card-foreground md:text-2xl">
            Générer un Paiement
          </h2>
          <p className="text-sm text-muted-foreground">
            Créez un lien de paiement en quelques secondes
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-card-foreground"
          >
            Montant (Max 1000€)
          </label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              max={1000}
              min={0}
              step="0.01"
              className={cn(
                "h-14 text-lg font-semibold",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
              €
            </span>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="customer_email" className="text-sm font-medium text-card-foreground">
            Email du client (optionnel)
          </label>
          <Input
            id="customer_email"
            type="email"
            name="customer_email"
            placeholder="Email du client (optionnel)"
            value={customerEmail}
            onChange={handleCustomerEmailChange}
            className="h-12"
          />
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault()
            console.log("Bouton cliqué!")
            handleCreateLink()
          }}
          type="button"
          size="lg"
          className="h-14 w-full text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40"
          disabled={!!error || !amount || isLoading}
        >
          {isLoading ? "Création en cours..." : "Créer Lien"}
        </Button>

        {generatedLink && (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-semibold text-success">
                Lien de paiement généré avec succès !
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-border bg-background p-3">
                <p className="truncate text-sm font-mono text-foreground">
                  {generatedLink}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
                title="Copier le lien"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(generatedLink, "_blank")}
                className="shrink-0"
                title="Ouvrir le lien"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
