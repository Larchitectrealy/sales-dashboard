-- ============================================================
-- Index sur la table sales pour accélérer les requêtes de stats
-- Exécuter dans l'éditeur SQL Supabase
-- ============================================================
-- Ces index optimisent :
-- - Filtrage par vendeur (user_id)
-- - Tri et plage de dates (created_at)
-- - Requêtes combinées (stats du mois par user, historique, etc.)

-- Index sur user_id (déjà créé par supabase-rbac-migration.sql si appliqué)
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);

-- Index sur created_at (déjà dans supabase-schema.sql si appliqué)
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);

-- Index composite pour les requêtes stats : filtre par user + plage de dates + statut
-- Ex. : ventes du mois pour un user, ventes payées par vendeur
CREATE INDEX IF NOT EXISTS idx_sales_user_created
  ON public.sales(user_id, created_at DESC);

-- Optionnel : index pour les requêtes "stats du mois" (status = 'paid' + created_at)
CREATE INDEX IF NOT EXISTS idx_sales_status_created
  ON public.sales(status, created_at DESC)
  WHERE status = 'paid';
