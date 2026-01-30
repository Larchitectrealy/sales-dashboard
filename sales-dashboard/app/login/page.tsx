'use client'

import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('error')

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-[350px] border-emerald-900 bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle className="text-emerald-500">Connexion Vendeur</CardTitle>
          <CardDescription>Entrez vos identifiants.</CardDescription>
        </CardHeader>
        
        {/* CORRECTION ICI : On utilise "action" au lieu de "onSubmit" */}
        {/* Next.js gère automatiquement le FormData avec cette méthode */}
        <form action={login}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              
              {/* Message d'erreur si la connexion échoue */}
              {errorMessage && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-2 rounded">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="exemple@mail.com" 
                  required 
                  className="bg-zinc-900 border-zinc-800" 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="bg-zinc-900 border-zinc-800" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" type="submit">
              Se connecter
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-[350px] border-emerald-900 bg-zinc-950 text-white">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
