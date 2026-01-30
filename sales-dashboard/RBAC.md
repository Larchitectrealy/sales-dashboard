# RBAC (Role-Based Access Control)

## Rôles

| Rôle        | Accès |
|------------|--------|
| **admin**  | Tout : tableau de bord, historique, **Réglages (API)**, **Utilisateurs**, stats globales. |
| **moderator** | Tableau de bord, historique, stats globales (analytics). Pas de gestion API ni utilisateurs. |
| **user**   | Uniquement son tableau de bord, ses stats, ses liens, son historique. Pas de Réglages ni Admin. |

## Mise en place

1. **Exécuter la migration SQL**  
   Dans Supabase → SQL Editor, exécuter le contenu de `supabase-rbac-migration.sql` (après le schéma principal).

2. **Restreindre payment_apis aux admins (RLS)**  
   Exécuter `supabase-payment-apis-admin-only.sql` (après la migration RBAC, car `is_admin()` doit exister). Seuls les admins pourront voir / ajouter / modifier / supprimer les APIs dans Réglages. La création de liens par les utilisateurs continue via le backend (clé service_role).

3. **Définir le premier admin**  
   Dans SQL Editor :
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'votre@email.com';
   ```
   (Remplacer par l’email du compte qui doit être admin.)

4. **Ventes existantes**  
   Les lignes déjà présentes dans `sales` n’ont pas de `user_id`. Les nouvelles ventes en auront un (créateur du lien).

## Routes protégées

- **/** (dashboard) : connecté + non banni.
- **/historique** : connecté + non banni (données filtrées par rôle).
- **/settings** : **admin** uniquement (gestion des APIs).
- **/admin/users** : **admin** uniquement (gestion des utilisateurs).

## Côté backend

- `getCurrentProfile()` : profil de l’utilisateur (rôle, banned).
- `requireAdmin()` : redirige si non admin.
- `verifyRole(['admin'])` : utilisé dans les Server Actions (ex. settings) pour bloquer les appels directs.
