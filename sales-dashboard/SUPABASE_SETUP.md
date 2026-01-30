# Configuration Supabase

## 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### Comment obtenir ces valeurs :

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet (ou créez-en un nouveau)
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Création des tables

Exécutez le script SQL fourni dans `supabase-schema.sql` :

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez le contenu de `supabase-schema.sql`
4. Exécutez la requête

## 3. Structure des tables

### `payment_apis`
- `id` (UUID) - Identifiant unique
- `name` (TEXT) - Nom de l'API
- `api_key` (TEXT) - Clé API (optionnel pour l'instant)
- `is_active` (BOOLEAN) - Si l'API est active
- `daily_usage_count` (INTEGER) - Nombre d'utilisations aujourd'hui
- `max_daily_usage` (INTEGER) - Maximum d'utilisations par jour (défaut: 2)

### `sales`
- `id` (UUID) - Identifiant unique
- `amount` (DECIMAL) - Montant de la transaction
- `payment_api_id` (UUID) - Référence à l'API utilisée
- `payment_link` (TEXT) - Lien de paiement généré
- `status` (TEXT) - Statut: 'pending', 'paid', 'failed', 'cancelled'
- `created_at` (TIMESTAMP) - Date de création

## 4. Données de test

Le script SQL inclut des données de test. Vous pouvez les modifier ou en ajouter d'autres via l'interface Supabase.

## 5. Sécurité (RLS)

Par défaut, les politiques RLS sont commentées. Si vous activez l'authentification Supabase, décommentez et ajustez les politiques dans le fichier SQL.

## 6. Test

Une fois configuré :
1. Lancez `npm run dev`
2. Allez sur `http://localhost:3000`
3. Testez la génération d'un lien de paiement avec un montant ≤ 1000€
