# Configuration de l'Authentification Supabase

## 1. Activer l'authentification dans Supabase

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Providers**
4. Activez **Email** provider (il est généralement activé par défaut)

## 2. Créer un utilisateur de test

### Option A : Via l'interface Supabase
1. Allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Entrez un email et un mot de passe
4. Cliquez sur **Create user**

### Option B : Via l'éditeur SQL
```sql
-- Créer un utilisateur avec email et mot de passe
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('votre_mot_de_passe', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## 3. Politiques de sécurité (RLS)

Par défaut, Supabase utilise Row Level Security (RLS). Vous devrez peut-être ajuster les politiques pour que les utilisateurs authentifiés puissent accéder aux tables `payment_apis` et `sales`.

### Exemple de politiques RLS pour `payment_apis` :
```sql
-- Permettre aux utilisateurs authentifiés de lire les APIs
CREATE POLICY "Users can read payment_apis"
ON payment_apis
FOR SELECT
TO authenticated
USING (true);

-- Permettre aux utilisateurs authentifiés de mettre à jour les APIs
CREATE POLICY "Users can update payment_apis"
ON payment_apis
FOR UPDATE
TO authenticated
USING (true);
```

### Exemple de politiques RLS pour `sales` :
```sql
-- Permettre aux utilisateurs authentifiés de lire les ventes
CREATE POLICY "Users can read sales"
ON sales
FOR SELECT
TO authenticated
USING (true);

-- Permettre aux utilisateurs authentifiés d'insérer des ventes
CREATE POLICY "Users can insert sales"
ON sales
FOR INSERT
TO authenticated
WITH CHECK (true);
```

## 4. Tester la connexion

1. Lancez `npm run dev`
2. Allez sur `http://localhost:3000`
3. Vous serez redirigé vers `/login`
4. Connectez-vous avec l'email et le mot de passe créés
5. Vous serez redirigé vers le dashboard

## 5. Fonctionnalités implémentées

- ✅ Page de login (`/login`)
- ✅ Protection des routes via middleware
- ✅ Redirection automatique si non connecté
- ✅ Bouton de déconnexion dans la sidebar
- ✅ Gestion des sessions avec Supabase Auth

## Notes importantes

- Le middleware protège toutes les routes sauf `/login`
- Si vous êtes connecté et allez sur `/login`, vous serez redirigé vers `/`
- Les sessions sont gérées automatiquement par Supabase
- Les cookies sont sécurisés et gérés par le middleware
