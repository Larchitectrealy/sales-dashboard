-- ============================================================
-- payment_apis : accès réservé aux ADMIN (RLS)
-- À exécuter APRÈS supabase-rbac-migration.sql (is_admin() doit exister)
-- ============================================================

-- Activer RLS sur payment_apis
ALTER TABLE public.payment_apis ENABLE ROW LEVEL SECURITY;

-- Supprimer d'éventuelles anciennes politiques trop permissives
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.payment_apis;
DROP POLICY IF EXISTS "Authenticated can read payment_apis" ON public.payment_apis;

-- Seuls les admins peuvent lire les APIs
CREATE POLICY "Admin can read payment_apis"
  ON public.payment_apis FOR SELECT
  USING (public.is_admin());

-- Seuls les admins peuvent insérer une API
CREATE POLICY "Admin can insert payment_apis"
  ON public.payment_apis FOR INSERT
  WITH CHECK (public.is_admin());

-- Seuls les admins peuvent modifier (activer/désactiver, usage)
CREATE POLICY "Admin can update payment_apis"
  ON public.payment_apis FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seuls les admins peuvent supprimer une API
CREATE POLICY "Admin can delete payment_apis"
  ON public.payment_apis FOR DELETE
  USING (public.is_admin());
