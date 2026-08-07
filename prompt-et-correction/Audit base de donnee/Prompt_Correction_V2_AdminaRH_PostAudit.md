# PROMPT DE CORRECTION V2 — Admina_RH (POST-AUDIT)
## Complement au Rapport_AdminA-RH.pdf — Manquants Identifies
### Date : 7 aout 2026 — Score d'execution du Prompt V1 : 19%

---

## CONTEXTE CRITIQUE

Un premier prompt de correction a ete genere (Prompt_Correction_AdminaRH_Database_Comptes.md) et un rapport de travaux a ete produit (Rapport_AdminA-RH.pdf dans /Resume). L'audit de ce rapport revele que **seul 19% du prompt original a ete execute**. Les corrections effectuees sont principalement de l'ordre du deploiement Cloudflare et d'un contournement d'authentification (fallback PostgREST), mais **aucune des corrections structurelles de la base de donnees n'a ete appliquee**.

### Ce qui a ete fait (par le Rapport_AdminA-RH.pdf)
- Deploiement Cloudflare Workers fonctionnel (bundle optimise, Prisma supprime)
- Login fallback via PostgREST direct (/api/auth/login-direct) — **fonctionnel mais non securise**
- 5 comptes demo dans table `admina_users` (non pas `admina_rh.profiles` comme demande)
- Middleware acceptant cookie `admina_auth` en plus de session Supabase
- Suppression des references hotel/Cameroun dans 20+ fichiers
- Mot de passe unique `Admin@2024` pour tous les comptes

### Ce qui N'A PAS ete fait (manquants critiques)
- **Aucune table du schema `admina_rh` n'a ete creee** (pas de `profiles`, `tenants`, `user_roles`, etc.)
- **Aucun trigger SQL** (pas de `handle_new_user`)
- **Aucune politique RLS** activee
- **Aucune table de multi-tenancy** (tenants, tenant_users, tenant_modules)
- **Aucune table d'audit** (login_attempts, user_audit_log)
- **L'inscription ne persiste pas** (route /api/auth/register retourne 404)
- **/mon-compte est vide** (pas de formulaire, pas d'avatar, pas de changement MDP)
- **0 table migree** parmi les 31 domaines (seules les 17 tables initiales existent)
- **0 test unitaire** ecrit
- **Authentification Supabase standard toujours en echec** (cle service_role defaillante)

---

## DIFFERENCE CRUCIALE : admina_users vs admina_rh.profiles

Le rapport indique que les comptes sont dans une table `admina_users` (probablement dans le schema `public`), alors que le prompt demandait une table `admina_rh.profiles` liee a `auth.users(id)`. **Cette table `admina_users` existante est un workaround qui ne respecte ni l'architecture multi-tenant ni les exigences ISO 30201:2026.**

**Action requise** : Creer les tables dans le schema `admina_rh` comme specifie dans le prompt V1, puis migrer les donnees de `admina_users` vers les nouvelles tables.

---

## PHASE 1 — CORRECTIONS IMMEDIATES (Jour 1-2)

### 1.1 Corriger la cle service_role Supabase

Le rapport indique que la cle service_role est rejetee par GoTrue Admin ("invalid JWT").

**Action** :
1. Se connecter au Dashboard Supabase > Settings > API
2. Regenerer la cle service_role
3. Verifier qu'elle fonctionne avec GoTrue :
```bash
curl -X POST 'https://aywwakllgvfoqlpowzqf.supabase.co/auth/v1/admin/users' \
  -H "apikey: <NOUVELLE_CLE_SERVICE_ROLE>" \
  -H "Authorization: Bearer <NOUVELLE_CLE_SERVICE_ROLE>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@audit.com","password":"TestPass123","email_confirm":true}'
```
4. Mettre a jour `wrangler.toml` et `.env` avec la nouvelle cle
5. Redeployer sur Cloudflare Workers

### 1.2 Creer la table admina_rh.profiles

```sql
CREATE SCHEMA IF NOT EXISTS admina_rh;

CREATE TABLE IF NOT EXISTS admina_rh.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'fr-CM',
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admina_rh.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON admina_rh.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON admina_rh.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Migrer les donnees existantes depuis admina_users
INSERT INTO admina_rh.profiles (id, email, first_name, last_name, phone, is_active, created_at)
SELECT id, email, first_name, last_name, phone, is_active, created_at
FROM admina_users
ON CONFLICT (id) DO NOTHING;
```

### 1.3 Creer les tables multi-tenant

```sql
CREATE TABLE IF NOT EXISTS admina_rh.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#007a33',
  secondary_color TEXT DEFAULT '#ce1126',
  country TEXT DEFAULT 'CM',
  timezone TEXT DEFAULT 'Africa/Douala',
  currency TEXT DEFAULT 'XAF',
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','professional','enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.tenants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS admina_rh.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL DEFAULT 'employee',
  is_default BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);
ALTER TABLE admina_rh.tenant_users ENABLE ROW LEVEL SECURITY;
```

### 1.4 Creer le trigger handle_new_user

```sql
CREATE OR REPLACE FUNCTION admina_rh.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admina_rh.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION admina_rh.handle_new_user();
```

### 1.5 Corriger le login Supabase Auth standard

Le rapport indique que `signInWithPassword` echoue (401) car les utilisateurs existent dans `admina_users` mais pas dans `auth.users`. Apres la migration (1.2), les utilisateurs doivent aussi exister dans `auth.users`.

**Action** : Pour les 5 comptes demo, les creer dans `auth.users` via le Dashboard Supabase ou l'API GoTrue Admin (necessite 1.1). Ensuite, `signInWithPassword` fonctionnera nativement.

---

## PHASE 2 — FONCTIONNALITES COMPTES (Jour 3-5)

### 2.1 Creer la route /api/auth/register

Le rapport ne mentionne aucune route d'inscription fonctionnelle. L'URL retourne 404.

```typescript
// Fichier : src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await request.json()
    const supabase = await createClient()

    // Verifier doublon
    const { data: existing } = await supabase
      .from('admina_rh.profiles').select('id').eq('email', email).single()
    if (existing) return NextResponse.json({ error: 'Email deja utilise' }, { status: 409 })

    // Creer via Supabase Auth (declenche le trigger handle_new_user)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { first_name, last_name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm`
      }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: 'Compte cree', user_id: data.user?.id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

### 2.2 Rendre /mon-compte fonctionnel

Actuellement la page retourne du contenu vide ou redirige. Elle doit afficher :
- Informations du profil (nom, prenom, email, telephone) avec formulaire d'edition
- Avatar avec upload vers Supabase Storage
- Bouton de changement de mot de passe
- Historique des connexions (si table login_attempts existe)
- Preferences utilisateur (theme, langue, notifications)

### 2.3 Eliminer le mot de passe unique

Le rapport indique que TOUS les 5 comptes utilisent `Admin@2024`. C'est une vulnerabilite critique.

**Action** : Apres correction de la cle service_role (1.1), generer des mots de passe individuels cryptes pour chaque compte et les injecter via l'API GoTrue Admin.

---

## PHASE 3 — MIGRATION BASE DE DONNEES (Jour 6-20)

### 3.1 Executer les migrations SQL du prompt V1

Les 44 fichiers SQL definis dans le prompt V1 (001 a 044) n'ont **AUCUN d'entre eux ete execute**. Ils sont disponibles dans le dossier `prompt-et-correction/Audit base de donnee/` du repo mais n'ont jamais ete appliques a Supabase.

**Action** : Les executer dans l'ordre via le SQL Editor de Supabase ou via un pipeline CI/CD.

### 3.2 Priorite de migration par departement

1. **Dept 1** (8 domaines) : D01, D02, D04, D05, D12, D21, D23, D24
2. **Dept 7** (2 domaines) : D29, D30 (SIRH — necessaire pour le frontend)
3. **Dept 8** (2 domaines) : D31, D32 (Pilotage/Audit)
4. **Dept 4** (4 domaines) : D15, D16, D17, D18 (Remuneration)
5. **Dept 2** (4 domaines) : D03, D06, D07, D08
6. **Dept 3** (5 domaines) : D09, D10, D11, D13, D14
7. **Dept 5** (4 domaines) : D19, D20, D22, D25
8. **Dept 6** (3 domaines) : D26, D27, D28

---

## PHASE 4 — SECURITE ET QUALITE (Jour 21-25)

### 4.1 Activer RLS sur toutes les tables

```sql
-- Script a executer apres toutes les creations de tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE admina_rh.%I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;
```

### 4.2 Creer la table login_attempts

```sql
CREATE TABLE IF NOT EXISTS admina_rh.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admina_rh.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON admina_rh.login_attempts
  FOR SELECT USING (auth.uid() = user_id);
```

### 4.3 Tests

Ecrire au minimum les tests suivants :
- `login-direct.test.ts` : Verifier le fallback PostgREST
- `login-supabase.test.ts` : Verifier l'auth standard (apres 1.1)
- `register.test.ts` : Verifier la creation de compte
- `mon-compte.test.ts` : Verifier la page de profil
- `rls.test.ts` : Verifier l'isolation des donnees

---

## RAPPORT D'AUDIT FINAL — FORMAT ATTENDU

Apres execution de ce prompt V2, produire un rapport contenant :

| Phase | Action | Statut | Preuve |
|---|---|---|---|
| 1.1 | Cle service_role corrigee | PASS/FAIL | Screenshot GoTrue API |
| 1.2 | Table admina_rh.profiles | PASS/FAIL | SQL query result |
| 1.3 | Tables multi-tenant | PASS/FAIL | SQL query result |
| 1.4 | Trigger handle_new_user | PASS/FAIL | Test inscription |
| 1.5 | Login Supabase Auth | PASS/FAIL | curl response |
| 2.1 | Route /api/auth/register | PASS/FAIL | curl response 201 |
| 2.2 | /mon-compte fonctionnel | PASS/FAIL | Screenshot |
| 2.3 | Mots de passe individuels | PASS/FAIL | Test login |
| 3.1 | Migrations SQL executees | PASS/FAIL | Count tables |
| 4.1 | RLS actif sur 100% tables | PASS/FAIL | SQL query |
| 4.2 | Table login_attempts | PASS/FAIL | Test logging |
| 4.3 | Tests unitaires passes | PASS/FAIL | Vitest output |

**Seuil de validation** : Minimum 10/12 items en PASS pour considerer la correction reussie.

---

## NOTES

- Le fallback PostgREST (login-direct) est une solution TEMPORAIRE et doit ete supprime apres 1.1 et 1.5
- La table `admina_users` existante doit etre migree puis DEPRECIEE
- Toutes les nouvelles tables doivent etre dans le schema `admina_rh`, pas `public`
- Le rapport Rapport_AdminA-RH.pdf mentionne que les fichiers SQL d'audit sont dans le repo mais n'ont jamais ete executes — c'est la priorite absolue
