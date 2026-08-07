# PROMPT DE CORRECTION V3 — Admina_RH
## Base de donnees Supabase & Gestion des Comptes
### Audit d'ecart Post-Verification  |  2026-08-07

---

## CONTEXTE — POURQUOI CE PROMPT V3

**Deux prompts de correction precedents (V1 et V2) n'ont pas ete executes.**

L'audit de verification du 7 aout 2026, fonde sur l'analyse croisee de 3 sources independantes, confirme que **le taux d'execution du Prompt V1 est de 4.4% (2 items sur 45)**. Le rapport `Rapport_AdminA-RH.pdf` decrit uniquement un deploiement Cloudflare Workers avec un contournement (fallback PostgREST), sans aucune creation de table, trigger, ou RLS dans Supabase.

Ce prompt V3 est **auto-executable** : il contient tout le SQL, TypeScript, et les instructions de verification pas-a-pas.

---

## 0. ETAT REEL VERIFIE LE 2026-08-07 A 12:35 UTC

### 0.1 Supabase — Etat constate via API REST

| Element | Constate | Attendu par Prompt V1 |
|---|---|---|
| Schema `admina_rh` | **N'EXISTE PAS** (aucune table accessible) | 8 tables auth + 5 tables tenant + ~600 tables domaines |
| Table `admina_users` (public) | EXISTE - 13 rows, 10 colonnes | A migrer vers admina_rh.profiles |
| Table `employees` (public) | EXISTE - 15 rows, 28 colonnes | A deplacer dans admina_rh |
| Tables `ref_departments` | **N'EXISTE PLUS** (404) | Existaient avant |
| Tables `ref_positions` | **N'EXISTE PLUS** (404) | Existaient avant |
| Tables D02_* (14 tables) | **TOUTES ABSENTES** (404) | 14 tables a verifier/completer |
| RLS (Row Level Security) | **AUCUNE table n'a RLS** | RLS sur toutes les tables |
| Triggers | **AUCUN trigger** | handle_new_user, update_updated_at |
| Fonctions SQL | **AUCUNE fonction** | handle_new_user(), update_updated_at() |

**Detail de la table admina_users existante (13 rows) :**
- Colonnes : id, tenant_id, email, full_name, role, employee_id, is_active, last_login_at, created_at, updated_at
- Roles presents : super_admin(1), tenant_admin(3), manager(1), hr_manager(1), hr_assistant(1), employee(1), viewer(5)
- 1 seul tenant_id : `bf7f8545-d3fa-4c9d-b971-4281ed039030`
- Passwords en clair (tous identiques : `Admin@2024`)

**Detail de la table employees existante (15 rows) :**
- Colonnes : id, tenant_id, matricule, civilite, nom, prenom, date_naissance, lieu_naissance, genre, nationalite, situation_familiale, telephone, email, adresse, department_id, position_id, type_contrat, categorie, regime_travail, date_embauche, salaire_brut, lieu_travail, statut, photo_url, notes, created_at, updated_at
- Emails contiennent encore `@hotel.com` (non neutralises)
- Les tables `departments` et `positions` (references FK) n'existent pas
- salaire_brut = NULL pour tous les employes

### 0.2 Cloudflare Workers — Etat constate

| Endpoint | Status | Detail |
|---|---|---|
| `POST /api/auth/login` | 401 | Supabase Auth echoue (cle service_role incompatible GoTrue) |
| `POST /api/auth/login-direct` | 200 | Fallback PostgREST fonctionnel (lisent admina_users) |
| `POST /api/auth/register` | **404** | Route non implementee |
| `GET /api/auth/me` | 401 | Non autorise (pas de session valide) |
| `GET /api/auth/session` | **404** | Route non implementee |
| `POST /api/auth/forgot-password` | **404** | Route non implementee |
| `POST /api/auth/reset-password` | **404** | Route non implementee |
| `GET /mon-compte` | 200 | **PAGE VIDE** - 0 formulaires, 0 inputs, 0 boutons |
| `GET /api/departments` | **404** | Route non implementee |
| `GET /api/employees` | **404** | Route non implementee |
| `GET /api/tenants` | **404** | Route non implementee |
| `GET /api/roles` | **404** | Route non implementee |
| `GET /api/audit-logs` | **404** | Route non implementee |
| `GET /login` | 200 | Page fonctionnelle (client-side rendered) |
| `GET /dashboard` | 200 | Page fonctionnelle |

### 0.3 Problemes techniques bloquants identifies

1. **Cle service_role incompatible avec GoTrue** : La cle service_role fonctionne avec PostgREST mais est rejetee par GoTrue Admin (signature JWT invalide). Cela empeche la creation programmatique d'utilisateurs via Supabase Auth.
2. **Mot de passe unique `Admin@2024`** pour 13 comptes = vulnerabilite critique.
3. **Emails employees `@hotel.com`** non neutralises dans les donnees de seed.
4. **Tables FK orphelines** : employees reference `department_id` et `position_id` mais les tables `departments` et `positions` n'existent pas dans le schema public.
5. **Page /mon-compte** est une coquille vide sans aucun composant interactif.

---

## STRUCTURE DE REFERENCE

**Projet** : Admina_RH — SaaS RH multi-tenant camerounais ISO 30201:2026
**Stack** : Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui + Zod + Supabase + Cloudflare Workers
**GitHub** : `georgyfr/Admina_RH`, branche `main`
**Site live** : `https://admina-rh.supdgeorgyfr.workers.dev`
**Supabase** : Project ref `aywwakllgvfoqlpowzqf`
**Design** : Vert `#007a33`, rouge `#ce1126`, or `#fcd116`, Inter, FA 6.5.1
**Structure** : 8 departements, 31 domaines (D01-D32), 347 employes cible

---

## PHASE 0 — PRE-REQUIS (a executer AVANT tout le reste)

### 0.1 Regenerer la cle service_role Supabase

**ACTION CRITIQUE** : La cle service_role actuelle est incompatible avec GoTrue.

1. Aller sur https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf/settings/api
2. Cliquer "Generate new service role key"
3. Copier la nouvelle cle
4. Mettre a jour `wrangler.toml` :
```toml
[vars]
SUPABASE_SERVICE_ROLE_KEY = "<nouvelle_cle>"
```
5. Mettre a jour `.env.local` :
```bash
SUPABASE_SERVICE_ROLE_KEY=<nouvelle_cle>
```
6. Verifier que la nouvelle cle fonctionne avec GoTrue :
```bash
curl -X POST 'https://aywwakllgvfoqlpowzqf.supabase.co/auth/v1/admin/users' \
  -H 'Authorization: Bearer <NOUVELLE_CLE_SERVICE_ROLE>' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"Test1234!","email_confirm":true}'
```
**Attendu** : Status 200/201 (pas 401)

### 0.2 Variables d'environnement requises

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://aywwakllgvfoqlpowzqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d3dha2xsZ3Zmb3FscG93enFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTk3MzMsImV4cCI6MjEwMDA3NTczM30.bDMuaRt0rKZqMpp-Jwc70KWr3Tr2DzQaVkEwh1cnSy4
SUPABASE_SERVICE_ROLE_KEY=<cle_a_regenerer>
```

---

## PHASE 1 — SCHEMA ADMINA_RH + TABLES AUTH (P0 CRITIQUE)

**TOUTES les requetes SQL ci-dessous doivent etre executees dans le SQL Editor de Supabase** (https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf/sql/new)

### 1.1 Creer le schema admina_rh

```sql
-- Migration 001 : Creer le schema
CREATE SCHEMA IF NOT EXISTS admina_rh;

-- Verifier
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'admina_rh';
-- Attendu : 1 row avec 'admina_rh'
```

### 1.2 Creer la table profiles

```sql
-- Migration 002 : profiles
CREATE TABLE IF NOT EXISTS admina_rh.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  display_name TEXT GENERATED ALWAYS AS (
    COALESCE(NULLIF(first_name, ''), '') || ' ' || COALESCE(NULLIF(last_name, ''), '')
  ) STORED,
  phone TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'fr-CM',
  is_active BOOLEAN DEFAULT true,
  email_verified_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admina_rh.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON admina_rh.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON admina_rh.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role full access profiles"
  ON admina_rh.profiles FOR ALL
  USING (auth.role() = 'service_role');
```

### 1.3 Creer les tables de securite et comptes

```sql
-- Migration 003 : user_roles
CREATE TABLE IF NOT EXISTS admina_rh.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  role_name TEXT NOT NULL CHECK (role_name IN (
    'super_admin', 'tenant_admin', 'rh_manager', 'rh_officer',
    'department_head', 'manager', 'employee', 'auditor', 'viewer'
  )),
  is_default BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES admina_rh.profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id, role_name)
);
ALTER TABLE admina_rh.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON admina_rh.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access user_roles"
  ON admina_rh.user_roles FOR ALL USING (auth.role() = 'service_role');

-- Migration 004 : user_preferences
CREATE TABLE IF NOT EXISTS admina_rh.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT false,
  dashboard_layout JSONB DEFAULT '{}',
  sidebar_collapsed BOOLEAN DEFAULT false,
  rows_per_page INT DEFAULT 25,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON admina_rh.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Migration 005 : login_attempts
CREATE TABLE IF NOT EXISTS admina_rh.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admina_rh.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own login attempts" ON admina_rh.login_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access login_attempts"
  ON admina_rh.login_attempts FOR ALL USING (auth.role() = 'service_role');

-- Migration 006 : user_audit_log
CREATE TABLE IF NOT EXISTS admina_rh.user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admina_rh.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.user_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit log" ON admina_rh.user_audit_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role insert audit" ON admina_rh.user_audit_log
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all audit" ON admina_rh.user_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admina_rh.user_roles
    WHERE user_id = auth.uid() AND role_name IN ('super_admin', 'tenant_admin', 'auditor'))
  );

-- Migration 007 : password_reset_tokens
CREATE TABLE IF NOT EXISTS admina_rh.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Migration 008 : user_sessions
CREATE TABLE IF NOT EXISTS admina_rh.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sessions" ON admina_rh.user_sessions
  FOR ALL USING (auth.uid() = user_id);
```

### 1.4 Triggers

```sql
-- Migration 009 : Trigger handle_new_user
CREATE OR REPLACE FUNCTION admina_rh.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admina_rh.profiles (id, email, first_name, last_name, email_verified_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN NOW() ELSE NULL END
  );
  INSERT INTO admina_rh.user_preferences (user_id)
  VALUES (NEW.id);
  INSERT INTO admina_rh.user_audit_log (user_id, action, entity_type, entity_id, new_values)
  VALUES (NEW.id, 'ACCOUNT_CREATED', 'profile', NEW.id,
    jsonb_build_object('email', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION admina_rh.handle_new_user();

-- Migration 010 : Trigger update_updated_at (reutilisable)
CREATE OR REPLACE FUNCTION admina_rh.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON admina_rh.profiles
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
```

### 1.5 Verifier Phase 1

```sql
-- Script de verification - executer apres Phase 1
SELECT 'Phase 1 Verification' AS check_name;

SELECT table_name, row_level_security
FROM information_schema.tables t
JOIN pg_policies p ON p.schemaname = t.table_schema AND p.tablename = t.table_name
WHERE t.table_schema = 'admina_rh' AND t.table_type = 'BASE TABLE'
ORDER BY table_name;
-- Attendu : 7 tables (profiles, user_roles, user_preferences, login_attempts, user_audit_log, password_reset_tokens, user_sessions) avec RLS

SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'admina_rh' OR event_object_schema = 'auth';
-- Attendu : handle_new_user (AFTER INSERT ON auth.users), profiles_updated_at
```

---

## PHASE 2 — MULTI-TENANCY (P0 CRITIQUE)

### 2.1 Tables multi-tenant

```sql
-- Migration 011 : tenants
CREATE TABLE IF NOT EXISTS admina_rh.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#007a33',
  secondary_color TEXT DEFAULT '#ce1126',
  accent_color TEXT DEFAULT '#fcd116',
  country TEXT DEFAULT 'CM',
  timezone TEXT DEFAULT 'Africa/Douala',
  currency TEXT DEFAULT 'XAF',
  employee_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access tenants"
  ON admina_rh.tenants FOR ALL USING (auth.role() = 'service_role');

-- Migration 012 : tenant_users
CREATE TABLE IF NOT EXISTS admina_rh.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  department_ids UUID[],
  is_default BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);
ALTER TABLE admina_rh.tenant_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memberships" ON admina_rh.tenant_users
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access tenant_users"
  ON admina_rh.tenant_users FOR ALL USING (auth.role() = 'service_role');

-- Migration 013 : tenant_modules
CREATE TABLE IF NOT EXISTS admina_rh.tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  module_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, module_code)
);
ALTER TABLE admina_rh.tenant_modules ENABLE ROW LEVEL SECURITY;

-- Migration 014 : tenant_settings
CREATE TABLE IF NOT EXISTS admina_rh.tenant_settings (
  tenant_id UUID PRIMARY KEY REFERENCES admina_rh.tenants(id) ON DELETE CASCADE,
  fiscal_year_start_month INT DEFAULT 1,
  payroll_frequency TEXT DEFAULT 'monthly'
    CHECK (payroll_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  working_days_per_week INT DEFAULT 5,
  annual_leave_days INT DEFAULT 30,
  sick_leave_days INT DEFAULT 15,
  overtime_policy JSONB DEFAULT '{}',
  document_templates JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  compliance_settings JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.tenant_settings ENABLE ROW LEVEL SECURITY;

-- Ajouter FK sur user_roles.tenant_id (apres creation de tenants)
ALTER TABLE admina_rh.user_roles
  ADD CONSTRAINT fk_user_roles_tenant
  FOREIGN KEY (tenant_id) REFERENCES admina_rh.tenants(id) ON DELETE CASCADE;

-- Triggers updated_at pour tables tenant
CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON admina_rh.tenants
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
CREATE TRIGGER tenant_settings_updated_at BEFORE UPDATE ON admina_rh.tenant_settings
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
```

### 2.2 Seed du tenant de demonstration

```sql
-- Migration 015 : Seed tenant demo
-- Conserver le meme tenant_id que dans admina_users pour compatibilite
INSERT INTO admina_rh.tenants (id, name, slug, employee_count, created_by)
VALUES (
  'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  'Admina_RH Demo',
  'admina-rh-demo',
  15,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO admina_rh.tenant_settings (tenant_id)
VALUES ('bf7f8545-d3fa-4c9d-b971-4281ed039030')
ON CONFLICT (tenant_id) DO NOTHING;

-- Activer tous les modules pour le tenant demo
INSERT INTO admina_rh.tenant_modules (tenant_id, module_code, module_name)
VALUES
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D01', 'Gestion de l''Organisation Administrative'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D02', 'Gestion Administrative du Personnel'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D03', 'Gestion Previsionnelle des Emplois'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D04', 'Gestion du Temps'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D05', 'Gestion des Salaires'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D06', 'Gestion des Deplacements'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D07', 'Gestion de la Paie'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D08', 'Gestion des Prestations Sociales'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D09', 'Formation et Developpement'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D10', 'Gestion des Carrieres'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D11', 'Gestion de la Mobilite Interne'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D12', 'Administration du Personnel'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D13', 'Gestion des Talents'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D14', 'Gestion du Savoir'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D15', 'Gestion de la Remuneration Globale'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D16', 'Gestion des Avantages Sociaux'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D17', 'Gestion de la Retraite'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D18', 'Gestion de l''Impot sur le Revenu'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D19', 'Gestion des Relations de Travail'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D20', 'Gestion de la Discipline'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D21', 'Classification et Cartographie des Emplois'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D22', 'Gestion des Conflits'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D23', 'Organigramme'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D24', 'Gestion des Effectifs'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D25', 'Gestion des Syndicats'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D26', 'Gestion de la Sante au Travail'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D27', 'Gestion de la Securite au Travail'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D28', 'Gestion des Conditions de Travail'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D29', 'Gestion du Systeme d''Information RH'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D30', 'Gestion des Donnees RH'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D31', 'Pilotage de la Fonction RH'),
  ('bf7f8545-d3fa-4c9d-b971-4281ed039030', 'D32', 'Audit RH')
ON CONFLICT (tenant_id, module_code) DO NOTHING;
```

### 2.3 Verifier Phase 2

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Attendu : 12 tables (7 de Phase 1 + tenants, tenant_users, tenant_modules, tenant_settings, + user_roles FK mis a jour)

SELECT * FROM admina_rh.tenants;
-- Attendu : 1 row (Admina_RH Demo)

SELECT COUNT(*) FROM admina_rh.tenant_modules;
-- Attendu : 32 (31 domaines D01-D32)
```

---

## PHASE 3 — MIGRER LES TABLES EXISTANTES VERS admina_rh (P1 MAJEUR)

### 3.1 Deplacer employees vers admina_rh

```sql
-- Migration 016 : Copier employees vers admina_rh
CREATE TABLE IF NOT EXISTS admina_rh.employees (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  matricule TEXT NOT NULL,
  civilite TEXT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance DATE,
  lieu_naissance TEXT,
  genre TEXT,
  nationalite TEXT DEFAULT 'Camerounaise',
  situation_familiale TEXT,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  department_id UUID,
  position_id UUID,
  type_contrat TEXT,
  categorie TEXT,
  regime_travail TEXT DEFAULT 'Temps plein',
  date_embauche DATE,
  salaire_brut DECIMAL(12,2),
  lieu_travail TEXT,
  statut TEXT DEFAULT 'Actif',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(matricule)
);

ALTER TABLE admina_rh.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation employees" ON admina_rh.employees
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM admina_rh.tenant_users WHERE user_id = auth.uid()
  ));
CREATE POLICY "Service role full access employees"
  ON admina_rh.employees FOR ALL USING (auth.role() = 'service_role');

-- Migrer les donnees existantes
INSERT INTO admina_rh.employees (
  id, tenant_id, matricule, civilite, nom, prenom, date_naissance, lieu_naissance,
  genre, nationalite, situation_familiale, telephone, email, adresse,
  department_id, position_id, type_contrat, categorie, regime_travail,
  date_embauche, salaire_brut, lieu_travail, statut, photo_url, notes, created_at, updated_at
)
SELECT id, tenant_id, matricule, civilite, nom, prenom, date_naissance, lieu_naissance,
  genre, nationalite, situation_familiale, telephone, email, adresse,
  department_id, position_id, type_contrat, categorie, regime_travail,
  date_embauche, salaire_brut, lieu_travail, statut, photo_url, notes, created_at, updated_at
FROM public.employees
ON CONFLICT (id) DO NOTHING;

-- Corriger les emails @hotel.com
UPDATE admina_rh.employees
SET email = REPLACE(email, '@hotel.com', '@admina-rh.demo')
WHERE email LIKE '%@hotel.com';

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON admina_rh.employees
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
```

### 3.2 Creer les tables de reference manquantes

```sql
-- Migration 017 : departements (referenced by employees.department_id)
CREATE TABLE IF NOT EXISTS admina_rh.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID REFERENCES admina_rh.employees(id),
  parent_id UUID REFERENCES admina_rh.departments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE admina_rh.departments ENABLE ROW LEVEL SECURITY;

-- Migration 018 : positions (referenced by employees.position_id)
CREATE TABLE IF NOT EXISTS admina_rh.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  department_id UUID REFERENCES admina_rh.departments(id),
  job_level TEXT,
  min_salary DECIMAL(12,2),
  max_salary DECIMAL(12,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE admina_rh.positions ENABLE ROW LEVEL SECURITY;

-- Ajouter FK sur employees
DO $$ BEGIN
  ALTER TABLE admina_rh.employees ADD CONSTRAINT fk_employees_dept
    FOREIGN KEY (department_id) REFERENCES admina_rh.departments(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE admina_rh.employees ADD CONSTRAINT fk_employees_pos
    FOREIGN KEY (position_id) REFERENCES admina_rh.positions(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed departements (8 departements du projet)
INSERT INTO admina_rh.departments (id, code, name, description) VALUES
  ('6f053139-ac25-4f06-bf83-6780233b845e', 'DEP1', 'Administration Generale du Personnel', 'Gestion administrative complete du personnel'),
  ('1a58777d-bf40-4410-b95d-766054054d01', 'DEP2', 'Gestion Previsionnelle des Emplois', 'Planification et gestion previsionnelle'),
  ('e6e551a1-b0dc-457a-9dff-b3af9c19167a', 'DEP3', 'Developpement des Competences', 'Formation et developpement'),
  ('c00f32a1-...', 'DEP4', 'Remuneration et Avantages', 'Gestion de la remuneration'),
  ('4a26a6e3-...', 'DEP5', 'Relations Professionnelles', 'Relations de travail et discipline'),
  ('93943e6b-...', 'DEP6', 'Sante Securite et Conditions de Travail', 'Sante et securite au travail'),
  (' dept_id_7', 'DEP7', 'Systemes d Information RH', 'Systemes d information'),
  ('dept_id_8', 'DEP8', 'Pilotage et Audit RH', 'Pilotage et audit')
ON CONFLICT DO NOTHING;
```

### 3.3 Verifier Phase 3

```sql
SELECT COUNT(*) AS employees_count FROM admina_rh.employees;
-- Attendu : 15 (migres depuis public.employees)

SELECT COUNT(*) AS hotel_emails FROM admina_rh.employees WHERE email LIKE '%@hotel.com';
-- Attendu : 0

SELECT COUNT(*) FROM admina_rh.departments;
-- Attendu : 8

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Attendu : 15 tables (12 precedentes + employees, departments, positions)
```

---

## PHASE 4 — MIGRATION DES 31 DOMAINES (P1 MAJEUR)

### 4.1 Pattern standard par domaine

Pour chaque domaine D01 a D32, creer les tables suivantes dans le schema `admina_rh` :

1. **Table principale** : `dXX_<entite>` (avec tenant_id, colonnes metier, created_at, updated_at)
2. **Table de categories** : `dXX_<entite>_categories`
3. **Table de liaison** : `dXX_<entite>_<relation>` (many-to-many)
4. **Table historique** : `dXX_<entite>_history`
5. **Tables specifiques** selon le metier du domaine
6. **RLS** sur chaque table (tenant isolation + service_role)
7. **Trigger** updated_at sur chaque table

### 4.2 Priorites de migration

| Priorite | Domaines | Tables estimees |
|---|---|---|
| **P1-Critique** | D02 (Gestion Administrative Personnel) | ~17 tables |
| **P1-Critique** | D04 (Gestion du Temps) | ~12 tables |
| **P1-Critique** | D07 (Gestion de la Paie) | ~15 tables |
| **P1-Majeur** | D01 (Organisation Administrative) | ~8 tables |
| **P1-Majeur** | D05 (Gestion des Salaires) | ~10 tables |
| **P1-Majeur** | D09 (Formation) | ~12 tables |
| **P2** | D03, D06, D08, D10, D11, D12 | ~60 tables |
| **P2** | D13-D22 | ~80 tables |
| **P3** | D23-D32 | ~70 tables |

### 4.3 Exemple complet - D02 Gestion Administrative du Personnel

```sql
-- Migration 020 : D02 tables

-- D02 principales
CREATE TABLE IF NOT EXISTS admina_rh.d02_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('CDI', 'CDD', 'Stage', 'Interim', 'Consultant')),
  start_date DATE NOT NULL,
  end_date DATE,
  salary_gross DECIMAL(12,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
  trial_period_months INT DEFAULT 0,
  notice_days INT DEFAULT 0,
  work_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation d02_contracts" ON admina_rh.d02_contracts
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM admina_rh.tenant_users WHERE user_id = auth.uid()));
CREATE POLICY "Service role d02_contracts" ON admina_rh.d02_contracts
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS admina_rh.d02_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  department_id UUID REFERENCES admina_rh.departments(id),
  position_id UUID REFERENCES admina_rh.positions(id),
  start_date DATE NOT NULL,
  end_date DATE,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_assignments ENABLE ROW LEVEL SECURITY;

-- D02 documents employes
CREATE TABLE IF NOT EXISTS admina_rh.d02_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_kb INT,
  mime_type TEXT,
  uploaded_by UUID,
  expires_at DATE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_documents ENABLE ROW LEVEL SECURITY;

-- D02 etat civil
CREATE TABLE IF NOT EXISTS admina_rh.d02_civil_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE UNIQUE,
  situation_familiale TEXT,
  nombre_enfants INT DEFAULT 0,
  conjoint_nom TEXT,
  conjoint_profession TEXT,
  date_mariage DATE,
  lieu_mariage TEXT,
  regime_matrimonial TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_civil_status ENABLE ROW LEVEL SECURITY;

-- D02 identifications
CREATE TABLE IF NOT EXISTS admina_rh.d02_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  id_type TEXT NOT NULL CHECK (id_type IN ('CNI', 'Passeport', 'Permis conduire', 'Carte sejour')),
  id_number TEXT NOT NULL,
  issued_by TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_identifications ENABLE ROW LEVEL SECURITY;

-- D02 contacts d'urgence
CREATE TABLE IF NOT EXISTS admina_rh.d02_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- D02 qualifications
CREATE TABLE IF NOT EXISTS admina_rh.d02_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  qualification_type TEXT NOT NULL CHECK (qualification_type IN ('Diplome', 'Certificat', 'Licence', 'Master', 'Doctorat', 'Autre')),
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  year_obtained INT,
  field_of_study TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_qualifications ENABLE ROW LEVEL SECURITY;

-- D02 experiences professionnelles
CREATE TABLE IF NOT EXISTS admina_rh.d02_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_experiences ENABLE ROW LEVEL SECURITY;

-- D02 langues
CREATE TABLE IF NOT EXISTS admina_rh.d02_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT CHECK (proficiency IN ('debutant', 'intermediaire', 'avance', 'courant', 'bilingue')),
  certificate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_languages ENABLE ROW LEVEL SECURITY;

-- D02 dependents (personnes a charge)
CREATE TABLE IF NOT EXISTS admina_rh.d02_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT,
  date_of_birth DATE,
  gender TEXT,
  is_student BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_dependents ENABLE ROW LEVEL SECURITY;

-- D02 notes/observations
CREATE TABLE IF NOT EXISTS admina_rh.d02_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  written_by UUID,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_notes ENABLE ROW LEVEL SECURITY;

-- D02 contract history
CREATE TABLE IF NOT EXISTS admina_rh.d02_contract_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES admina_rh.d02_contracts(id),
  change_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.d02_contract_history ENABLE ROW LEVEL SECURITY;

-- Triggers updated_at pour toutes les tables D02
DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'admina_rh' AND table_name LIKE 'd02_%' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON admina_rh.%I
      FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();', tbl, tbl);
  END LOOP;
END $$;
```

### 4.4 Template pour les domaines D03 a D32

Pour chaque domaine, suivre le meme pattern. Voici la liste complete des tables a creer par domaine :

```
D01 (Organisation Admin.) : d01_organizational_units, d01_unit_history
D03 (Gest. Prev. Emplois) : d03_jobs, d03_skills_inventory, d03_employee_skills, d03_workforce_forecast
D04 (Gest. du Temps) : d04_work_schedules, d04_attendances, d04_leaves, d04_leave_balances, d04_overtime_requests, d04_overtime_records
D05 (Gest. des Salaires) : d05_salary_structures, d05_salary_components, d05_employee_salaries, d05_salary_history
D06 (Deplacements) : d06_travel_requests, d06_travel_expenses, d06_mission_orders
D07 (Paie) : d07_payroll_periods, d07_payroll_runs, d07_payslips, d07_payroll_details, d07_tax_deductions, d07_social_contributions
D08 (Prestations Sociales) : d08_benefits, d08_benefit_enrollments, d08_claims
D09 (Formation) : d09_training_programs, d09_training_sessions, d09_enrollments, d09_certifications, d09_training_needs
D10 (Carrieres) : d10_career_paths, d10_promotions, d10_transfers, d10_demotions
D11 (Mobilite Interne) : d11_mobility_requests, d11_mobility_matches, d11_internal_postings
D12 (Admin. Personnel) : d12_personnel_actions, d12_personnel_files
D13 (Talents) : d13_talent_pools, d13_succession_plans, d13_high_potentials
D14 (Savoir) : d14_knowledge_base, d14_knowledge_categories, d14_articles
D15 (Remuneration Globale) : d15_compensation_plans, d15_variable_pay, d15_benefits_in_kind
D16 (Avantages Sociaux) : d16_social_benefits, d16_allowances, d16_insurance_plans
D17 (Retraite) : d17_pension_plans, d17_pension_contributions, d17_retirement_requests
D18 (Impot Revenu) : d18_tax_brackets, d18_tax_exemptions, d18_annual_tax_reports
D19 (Relations Travail) : d19_collective_agreements, d19_grievances, d19_meetings
D20 (Discipline) : d20_sanctions, d20_disciplinary_cases, d20_warnings
D21 (Classification Emplois) : d21_job_classifications, d21_grade_scales, d21_evaluation_grids
D22 (Conflits) : d22_conflicts, d22_mediations, d22_resolutions
D23 (Organigramme) : d23_org_charts, d23_positions_hierarchy
D24 (Effectifs) : d24_headcount_plans, d24_hiring_plans, d24_separation_records
D25 (Syndicats) : d25_unions, d25_union_members, d25_collective_bargaining
D26 (Sante Travail) : d26_health_records, d26_medical_exams, d26_occupational_diseases
D27 (Securite Travail) : d27_safety_incidents, d27_safety_inspections, d27_risk_assessments
D28 (Conditions Travail) : d28_working_conditions, d28_equipments, d28_remote_work_policies
D29 (SI RH) : d29_system_configs, d29_data_imports, d29_integrations
D30 (Donnees RH) : d30_data_quality_checks, d30_data_exports, d30_privacy_consents
D31 (Pilotage RH) : d31_kpi_definitions, d31_kpi_values, d31_dashboards, d31_reports
D32 (Audit RH) : d32_audit_plans, d32_audit_findings, d32_audit_recommendations, d32_compliance_checks
```

**IMPORTANT** : Chaque table DOIT avoir :
- `tenant_id UUID NOT NULL` avec FK vers admina_rh.tenants
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- Policy tenant isolation
- Policy service_role full access
- Trigger updated_at

---

## PHASE 5 — AUTHENTIFICATION CLOUDFLARE (P0 CRITIQUE)

### 5.1 API Route - Register

```typescript
// Fichier : src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Minimum 8 caracteres')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  first_name: z.string().min(2, 'Prenom requis'),
  last_name: z.string().min(2, 'Nom requis'),
  tenant_slug: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name, tenant_slug } = registerSchema.parse(body)

    const supabase = await createClient()

    // Verifier si l'email existe deja
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Cet email est deja utilise', code: 'EMAIL_EXISTS' },
        { status: 409 }
      )
    }

    // Creer le compte via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, last_name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, code: 'SIGNUP_FAILED' },
        { status: 400 }
      )
    }

    // Le trigger handle_new_user() cree automatiquement le profil
    // Ajouter le role par defaut si tenant_specifie
    if (data.user && tenant_slug) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenant_slug)
        .single()

      if (tenant) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          tenant_id: tenant.id,
          role_name: 'viewer',
          is_default: true,
        })
        await supabase.from('tenant_users').insert({
          tenant_id: tenant.id,
          user_id: data.user.id,
          is_default: true,
        })
      }
    }

    return NextResponse.json({
      message: 'Compte cree. Verifiez votre email.',
      user_id: data.user?.id,
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Donnees invalides', details: err.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
```

### 5.2 API Route - Forgot Password

```typescript
// Fichier : src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/reset-password`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Toujours retourner 200 pour eviter l'enumeration d'emails
    return NextResponse.json({
      message: 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.'
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

### 5.3 API Route - Reset Password

```typescript
// Fichier : src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const resetSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

export async function POST(request: NextRequest) {
  try {
    const { password } = resetSchema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase.auth.updateUser({ password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Mot de passe mis a jour avec succes.' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

### 5.4 API Route - Session Check

```typescript
// Fichier : src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Verifier aussi le fallback cookie
    const cookieStore = await (await import('next/headers')).cookies()
    const adminaAuth = cookieStore.get('admina_auth')?.value
    if (adminaAuth) {
      return NextResponse.json({ authenticated: true, method: 'fallback' })
    }
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    authenticated: true,
    method: 'supabase',
    user: { id: user.id, email: user.email },
    profile,
  })
}
```

---

## PHASE 6 — PAGE /MON-COMPTE (P1 MAJEUR)

### 6.1 Page serveur complete

```typescript
// Fichier : src/app/(dashboard)/mon-compte/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MonCompteClient from './MonCompteClient'

export default async function MonComptePage() {
  const supabase = await createClient()

  // Essayer Supabase Auth d'abord
  let user = null
  let authMethod = 'none'

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) authMethod = 'supabase'
  } catch {}

  // Fallback : verifier cookie admina_auth
  if (!user) {
    const cookieStore = await (await import('next/headers')).cookies()
    const adminaAuth = cookieStore.get('admina_auth')?.value
    if (adminaAuth) {
      // Decoder le token fallback pour obtenir l'email
      const email = adminaAuth.split('_')[1] // ajuster selon format reel
      const { data } = await supabase
        .from('admina_users')
        .select('*')
        .eq('email', email)
        .single()
      if (data) {
        user = data
        authMethod = 'fallback'
      }
    }
  }

  if (!user) redirect('/login')

  // Charger le profil depuis admina_rh.profiles si disponible, sinon depuis admina_users
  let profile = null
  let loginHistory = []
  let roles = []

  if (authMethod === 'supabase') {
    const { data: p } = await supabase
      .from('profiles')
      .select('*, user_preferences(*)')
      .eq('id', user.id)
      .single()
    profile = p

    const { data: r } = await supabase
      .from('user_roles')
      .select('role_name, tenants(name)')
      .eq('user_id', user.id)
    roles = r || []

    const { data: h } = await supabase
      .from('login_attempts')
      .select('success, ip_address, user_agent, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    loginHistory = h || []
  }

  return (
    <MonCompteClient
      user={user}
      profile={profile}
      roles={roles}
      loginHistory={loginHistory}
      authMethod={authMethod}
    />
  )
}
```

### 6.2 Composant client avec formulaires

```typescript
// Fichier : src/app/(dashboard)/mon-compte/MonCompteClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MonCompteProps {
  user: any
  profile: any
  roles: any[]
  loginHistory: any[]
  authMethod: string
}

export default function MonCompteClient({ user, profile, roles, loginHistory, authMethod }: MonCompteProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'history' | 'preferences'>('profile')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Form state
  const [form, setForm] = useState({
    firstName: profile?.first_name || user?.firstName || '',
    lastName: profile?.last_name || user?.lastName || '',
    phone: profile?.phone || user?.phone || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/mon-compte/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setToast({ type: 'success', message: 'Profil mis a jour avec succes' })
      } else {
        setToast({ type: 'error', message: 'Erreur lors de la mise a jour' })
      }
    } catch {
      setToast({ type: 'error', message: 'Erreur reseau' })
    }
    setSaving(false)
  }

  async function changePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ type: 'error', message: 'Les mots de passe ne correspondent pas' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/mon-compte/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (res.ok) {
        setToast({ type: 'success', message: 'Mot de passe modifie' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json()
        setToast({ type: 'error', message: data.error || 'Erreur' })
      }
    } catch {
      setToast({ type: 'error', message: 'Erreur reseau' })
    }
    setSaving(false)
  }

  async function logout() {
    await fetch('/api/auth/logout-direct', { method: 'POST' })
    router.push('/login')
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: 'fa-user' },
    { id: 'security' as const, label: 'Securite', icon: 'fa-shield-halved' },
    { id: 'history' as const, label: 'Historique', icon: 'fa-clock-rotate-left' },
    { id: 'preferences' as const, label: 'Preferences', icon: 'fa-gear' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mon Compte</h1>

      {/* Avatar + Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#007a33] flex items-center justify-center text-white text-2xl font-bold">
          {(form.firstName?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{form.firstName} {form.lastName}</h2>
          <p className="text-gray-500">{form.email}</p>
          <div className="flex gap-2 mt-2">
            {roles.map((r: any, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-[#007a33]/10 text-[#007a33] rounded-full text-xs font-medium">
                {r.role_name}
              </span>
            ))}
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              Auth: {authMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#007a33] text-[#007a33]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className={`fa-solid ${tab.icon} mr-2`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Profil */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
              <input type="text" value={form.firstName}
                onChange={e => setForm({...form, firstName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" value={form.lastName}
                onChange={e => setForm({...form, lastName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="bg-[#007a33] text-white px-6 py-2 rounded-lg hover:bg-[#006629] disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      )}

      {/* Tab: Securite */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input type="password" value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input type="password" value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33]" />
            </div>
          </div>
          <button onClick={changePassword} disabled={saving}
            className="bg-[#ce1126] text-white px-6 py-2 rounded-lg hover:bg-[#b00e20] disabled:opacity-50">
            {saving ? 'Mise a jour...' : 'Modifier le mot de passe'}
          </button>
          <hr className="my-4" />
          <button onClick={logout}
            className="text-red-600 hover:text-red-700 font-medium">
            <i className="fa-solid fa-right-from-bracket mr-2" />Se deconnecter
          </button>
        </div>
      )}

      {/* Tab: Historique */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Historique des connexions</h3>
          {loginHistory.length === 0 ? (
            <p className="text-gray-500">Aucun historique disponible (auth fallback active)</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Statut</th>
                    <th className="px-4 py-2 text-left">Adresse IP</th>
                    <th className="px-4 py-2 text-left">Navigateur</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((h: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{new Date(h.created_at).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${h.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {h.success ? 'Succes' : 'Echec'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{h.ip_address || '-'}</td>
                      <td className="px-4 py-2 text-gray-500 truncate max-w-[200px]">{h.user_agent || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <p className="text-gray-500">Les preferences seront disponibles apres la migration complete vers Supabase Auth.</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-[#007a33]' : 'bg-[#ce1126]'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
```

### 6.3 API Route - Update Profile

```typescript
// Fichier : src/app/api/mon-compte/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const body = await request.json()

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Audit log
  await supabase.from('user_audit_log').insert({
    user_id: user.id,
    action: 'PROFILE_UPDATED',
    entity_type: 'profile',
    entity_id: user.id,
    old_values: {},
    new_values: { firstName: body.firstName, lastName: body.lastName, phone: body.phone },
  })

  return NextResponse.json({ message: 'Profil mis a jour' })
}
```

---

## PHASE 7 — SECURITE CRITIQUE (P0)

### 7.1 Hasher les mots de passe admina_users

La table `admina_users` (public schema) contient des mots de passe en clair. Bien que cette table doive etre depreciee au profit de Supabase Auth + admina_rh.profiles, il faut la securiser immediatement.

```sql
-- ATTENTION : Executer uniquement apres avoir note les mots de passe actuels
-- pour les 5 comptes de demonstration

-- Mettre a jour admina_users avec des mots de passe hashes (bcrypt)
-- Les nouveaux passwords doivent etre individuels et uniques
-- Exemple (a adapter avec les vrais hashes bcrypt) :

-- Pour le super admin (garder Admin@2024 temporairement mais le hasher)
UPDATE public.admina_users
SET password_hash = crypt('Admin@2024_Super!2026', gen_salt('bf'))
WHERE email = 'super.admin@admina-rh.demo';

-- Pour l'admin tenant
UPDATE public.admina_users
SET password_hash = crypt('Admin@2024_Tenant!2026', gen_salt('bf'))
WHERE email = 'admin@admina-rh.demo';

-- Pour les autres comptes de demo, generer des mots de passe uniques
-- IMPORTANT : Supprimer la colonne 'password' en clair si elle existe
-- ALTER TABLE public.admina_users DROP COLUMN IF EXISTS password;

-- Verifier que la colonne password_hash existe et est utilisee
SELECT email, LEFT(password_hash, 20) AS hash_prefix FROM public.admina_users LIMIT 5;
```

### 7.2 Corriger le login-direct pour verifier les hashes

Le fichier `src/app/api/auth/login-direct/route.ts` doit etre mis a jour pour :
1. Verifier le mot de passe hash (bcrypt.compare) au lieu de la comparaison en clair
2. Logger les tentatives de connexion dans `admina_rh.login_attempts`
3. Limiter les tentatives (rate limiting)

---

## PHASE 8 — VERIFICATION FINALE

### 8.1 Script de verification complet

```sql
-- Executer dans Supabase SQL Editor apres TOUTES les phases

-- 1. Schema
SELECT '1. Schema admina_rh' AS check_name,
  EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'admina_rh') AS passed;

-- 2. Tables (attendu: 15 minimum apres Phase 3)
SELECT '2. Tables admina_rh' AS check_name,
  COUNT(*) AS table_count,
  CASE WHEN COUNT(*) >= 15 THEN 'PASS' ELSE 'FAIL' END AS status
FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE';

-- 3. RLS
SELECT '3. Tables avec RLS' AS check_name,
  COUNT(DISTINCT tablename) AS rls_count
FROM pg_policies
WHERE schemaname = 'admina_rh';

-- 4. Triggers
SELECT '4. Triggers' AS check_name,
  COUNT(*) AS trigger_count
FROM information_schema.triggers
WHERE event_object_schema IN ('admina_rh', 'auth');

-- 5. Donnees employees
SELECT '5. Employees admina_rh' AS check_name,
  COUNT(*) AS count
FROM admina_rh.employees;
-- Attendu : 15

-- 6. Tenant demo
SELECT '6. Tenant demo' AS check_name,
  name, slug, employee_count
FROM admina_rh.tenants;
-- Attendu : 1 row (Admina_RH Demo)

-- 7. Modules actifs
SELECT '7. Modules actifs' AS check_name, COUNT(*) FROM admina_rh.tenant_modules;
-- Attendu : 32

-- 8. Emails hotel
SELECT '8. Emails @hotel.com' AS check_name, COUNT(*) FROM admina_rh.employees WHERE email LIKE '%@hotel.com';
-- Attendu : 0

-- 9. Fonctions
SELECT '9. Fonctions admina_rh' AS check_name,
  COUNT(*) FROM information_schema.routines WHERE routine_schema = 'admina_rh';
-- Attendu : 2 (handle_new_user, update_updated_at)
```

### 8.2 Verification Cloudflare

```bash
# Apres deploiement, tester chaque endpoint :

# 1. Login fallback (doit fonctionner)
curl -X POST https://admina-rh.supdgeorgyfr.workers.dev/api/auth/login-direct \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@admina-rh.demo","password":"Admin@2024"}'
# Attendu : 200 avec token

# 2. Register (nouveau)
curl -X POST https://admina-rh.supdgeorgyfr.workers.dev/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@audit.com","password":"Test1234!","first_name":"Test","last_name":"Audit"}'
# Attendu : 201 (pas 404)

# 3. Session check (nouveau)
curl https://admina-rh.supdgeorgyfr.workers.dev/api/auth/session
# Attendu : 401 ou 200 (pas 404)

# 4. Mon compte (doit avoir des formulaires)
curl -s https://admina-rh.supdgeorgyfr.workers.dev/mon-compte | rg -c '<input'
# Attendu : > 0 (pas 0)

# 5. Forgot password (nouveau)
curl -X POST https://admina-rh.supdgeorgyfr.workers.dev/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@admina-rh.demo"}'
# Attendu : 200 (pas 404)
```

### 8.3 Rapport de conformite post-execution

Apres avoir execute TOUTES les phases, generer un rapport contenant :

1. **Capture d'ecran** du SQL Editor montrant les tables creees
2. **Resultat du script de verification** (section 8.1)
3. **Resultats des tests curl** (section 8.2)
4. **Capture d'ecran** de la page /mon-compte avec formulaires
5. **Score de conformite** recalcule : 
   - Nombre de tables creees / nombre attendu
   - Nombre d'endpoints fonctionnels / nombre attendu
   - Pourcentage global

---

## RESUME DES PHASES

| Phase | Priorite | Contenu | Tables Creees | Endpoints | Estimation |
|---|---|---|---|---|---|
| Phase 0 | P0 | Regenerer cle service_role, verifier env | 0 | 0 | 15 min |
| Phase 1 | P0 | Schema + 7 tables auth + triggers | 7 | 0 | 30 min |
| Phase 2 | P0 | 5 tables tenant + seed | 5 | 0 | 20 min |
| Phase 3 | P1 | Migrer employees, departments, positions | 3 | 0 | 20 min |
| Phase 4 | P1 | 31 domaines D01-D32 (~270 tables) | ~270 | 0 | 4-6h |
| Phase 5 | P0 | 4 API routes auth | 0 | 4 | 45 min |
| Phase 6 | P1 | Page /mon-compte complete | 0 | 2 | 45 min |
| Phase 7 | P0 | Securiser mots de passe | 0 | 0 | 15 min |
| Phase 8 | - | Verification finale | 0 | 0 | 20 min |
| **TOTAL** | | | **~285** | **6** | **~7-8h** |

---

## RAPPORT D'AUDIT D'ECART

### Methodologie
3 sources verifiees le 2026-08-07 a 12:35 UTC :
1. PDF `Rapport_AdminA-RH.pdf` (GitHub, dossier Resume)
2. Supabase REST API (scan de 60+ noms de tables)
3. Cloudflare Workers (test de 19 endpoints)

### Resultats

| Critere | Prompt V1 attendait | Etat reel | Statut |
|---|---|---|---|
| Schema admina_rh | 1 schema complet | N'EXISTE PAS | NON FAIT |
| Tables auth (profiles, roles, etc.) | 7 tables | 0 creees | NON FAIT |
| Tables tenant | 5 tables | 0 creees | NON FAIT |
| Tables domaines (D01-D32) | ~600 tables | 0 creees | NON FAIT |
| RLS sur toutes les tables | 100% couvert | 0 table avec RLS | NON FAIT |
| Triggers (auth, updated_at) | 2+ fonctions | 0 fonction | NON FAIT |
| /api/auth/register | Route fonctionnelle | 404 | NON FAIT |
| /api/auth/forgot-password | Route fonctionnelle | 404 | NON FAIT |
| /api/auth/reset-password | Route fonctionnelle | 404 | NON FAIT |
| /api/auth/session | Route fonctionnelle | 404 | NON FAIT |
| /mon-compte (page fonctionnelle) | Formulaires + donnees | Page VIDE (0 input) | NON FAIT |
| Login Supabase Auth | Fonctionnel | 401 (cle service_role cassee) | PARTIEL |
| Login fallback PostgREST | Contournement temporaire | Fonctionnel | FAIT |
| Middleware multi-tenant | Tenant isolation | Bloque tout vers /login | PARTIEL |
| Deploiement Cloudflare | App accessible | Accessible (12.5 Ko gz) | FAIT |
| 5 comptes demo operationnels | Supabase Auth | Fallback PostgREST (mdp unique) | PARTIEL |
| Mots de passe individuels | Hash bcrypt | Mdp unique en clair | NON FAIT |

**Score global d'execution Prompt V1 : 4.4% (2/45 items)**

### Conclusion
Le rapport `Rapport_AdminA-RH.pdf` decrit un travail de **deploiement Cloudflare** et de **contournement d'urgence** (fallback PostgREST), mais **aucune des corrections structurelles du Prompt V1 n'a ete executee**. La base de donnees est dans le meme etat qu'avant le premier audit. Ce prompt V3 corrige les lacunes des versions precedentes en ajoutant des verifications intermediaires et un ordre d'execution strict.
