import { createClient } from '@/lib/supabase-server'

export default async function TestPage() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('payment_apis').select('count')
    
    if (error) return <div>❌ Erreur de connexion : {error.message}</div>
    return <div>✅ Connexion réussie ! Supabase répond bien.</div>
  } catch (e) {
    return <div>❌ Crash complet : Vérifie tes clés dans .env.local</div>
  }
}
