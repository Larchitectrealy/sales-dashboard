-- Schéma de base de données pour le dashboard de paiement
-- Exécutez ces requêtes dans l'éditeur SQL de Supabase

-- Table: payment_apis
-- Stocke les informations des APIs de paiement (Lydia, etc.)
CREATE TABLE IF NOT EXISTS payment_apis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_key TEXT,
  vendor_token TEXT,
  api_token TEXT,
  is_active BOOLEAN DEFAULT true,
  daily_usage_count INTEGER DEFAULT 0,
  max_daily_usage INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: sales
-- Stocke toutes les transactions/ventes
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10, 2) NOT NULL,
  payment_api_id UUID REFERENCES payment_apis(id),
  payment_link TEXT,
  customer_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_apis_active ON payment_apis(is_active, daily_usage_count);

-- Fonction pour réinitialiser daily_usage_count chaque jour (optionnel)
-- Vous pouvez configurer un cron job dans Supabase pour exécuter cette fonction
CREATE OR REPLACE FUNCTION reset_daily_usage_count()
RETURNS void AS $$
BEGIN
  UPDATE payment_apis SET daily_usage_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Exemple de données pour tester
-- Insérez quelques APIs de test
INSERT INTO payment_apis (name, is_active, daily_usage_count, max_daily_usage)
VALUES 
  ('Lydia API 1', true, 0, 2),
  ('Lydia API 2', true, 0, 2),
  ('Lydia API 3', true, 1, 2)
ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) - Activez selon vos besoins
-- ALTER TABLE payment_apis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Politiques RLS de base (ajustez selon vos besoins)
-- CREATE POLICY "Allow all operations for authenticated users" ON payment_apis
--   FOR ALL USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow all operations for authenticated users" ON sales
--   FOR ALL USING (auth.role() = 'authenticated');
