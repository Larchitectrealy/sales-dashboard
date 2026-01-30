import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec la clé service_role.
 * À utiliser UNIQUEMENT côté serveur (Server Actions admin).
 * Ne jamais exposer cette clé au client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour les opérations admin.')
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
