# PROMPT D'EXECUTION DEPLOIEMENT — Admina_RH
## Supabase + Cloudflare Workers  |  Execution Autonome
### Genere le 2026-08-07  |  Version 1.0

---

## DIRECTIVES D'EXECUTION

Ce prompt est concu pour etre execute de maniere **autonome et sequentielle**. Chaque phase doit etre terminee et verifiee avant de passer a la suivante. Le chart `Roadmap_Deploiement_AdminaRH_Supabase_Cloudflare_2026-08-07.png` illustre les 8 phases.

### Environnement

| Parametre | Valeur |
|---|---|
| **Supabase Dashboard** | https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf/sql/new |
| **Supabase Ref** | `aywwakllgvfoqlpowzqf` |
| **Supabase URL** | `https://aywwakllgvfoqlpowzqf.supabase.co` |
| **Supabase Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d3dha2xsZ3Zmb3FscG93enFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTk3MzMsImV4cCI6MjEwMDA3NTczM30.bDMuaRt0rKZqMpp-Jwc70KWr3Tr2DzQaVkEwh1cnSy4` |
| **Cloudflare Site** | `https://admina-rh.supdgeorgyfr.workers.dev` |
| **GitHub** | `georgyfr/Admina_RH`, branche `main` |
| **Design** | Vert `#007a33`, rouge `#ce1126`, or `#fcd116` |

### Regles d'execution

1. **Ne jamais sauter une phase**. Chaque phase a une section `VERIFICATION` obligatoire.
2. **Copier-coller le SQL exact** dans le Supabase SQL Editor. Ne pas modifier le SQL.
3. **Pour Cloudflare**, ecrire les fichiers TypeScript aux chemins exacts specifies, puis deployer avec `npx opennextjs-cloudflare deploy`.
4. **En cas d'erreur SQL**, lire le message d'erreur, corriger uniquement ce qui est necessaire, et re-executer.
5. **Apres chaque phase**, executer le script de verification et confirmer le resultat avant de continuer.
6. **A la fin**, generer le rapport de conformite (section RESULTAT FINAL).

---

## PHASE 0 — PRE-REQUIS (15 min)

### 0.1 Regenerer la cle service_role

La cle service_role actuelle est incompatible avec GoTrue (l'API Admin rejette avec "invalid JWT: unable to parse or verify signature").

**Actions manuelles dans le Supabase Dashboard :**

1. Ouvrir https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf/settings/api
2. Section "Project API keys" > cliquer **"Generate new service role key"**
3. Copier la nouvelle cle
4. Ouvrir le fichier `wrangler.toml` a la racine du projet et mettre a jour :
```toml
[vars]
SUPABASE_SERVICE_ROLE_KEY = "<NOUVELLE_CLE_ICI>"
```
5. Ouvrir `.env.local` et mettre a jour :
```bash
SUPABASE_SERVICE_ROLE_KEY=<NOUVELLE_CLE_ICI>
```

### 0.2 Verifier la nouvelle cle

```bash
curl -X POST 'https://aywwakllgvfoqlpowzqf.supabase.co/auth/v1/admin/users' \
  -H 'Authorization: Bearer <NOUVELLE_CLE>' \
  -H 'Content-Type: application/json' \
  -d '{"email":"verify-test@audit.com","password":"Verify1234!","email_confirm":true}'
```

**Attendu** : Status 200 ou 201 (pas 401). Si 401, la cle est encore invalide -> regenerer.

### 0.3 Nettoyer le user de test

```sql
DELETE FROM auth.users WHERE email = 'verify-test@audit.com';
```

### VERIFICATION PHASE 0
- [ ] Nouvelle cle service_role copiee dans wrangler.toml
- [ ] Nouvelle cle dans .env.local
- [ ] Test curl renvoie 200/201 (pas 401)
- [ ] User de test supprime

---

## PHASE 1 — SCHEMA ADMINA_RH + TABLES AUTH (30 min)

**Ouvrir le SQL Editor** : https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf/sql/new

### 1.1 Executer le bloc SQL suivant (copier-coller integralement)

```sql
-- ═══════════════════════════════════════════════════════════
-- PHASE 1 : Schema + Tables Auth + Triggers
-- ═══════════════════════════════════════════════════════════

-- 1.1 Creer le schema
CREATE SCHEMA IF NOT EXISTS admina_rh;

-- 1.2 Table profiles
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

CREATE POLICY "Users view own profile" ON admina_rh.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON admina_rh.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role profiles" ON admina_rh.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- 1.3 Table user_roles
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
CREATE POLICY "Users view own roles" ON admina_rh.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role user_roles" ON admina_rh.user_roles
  FOR ALL USING (auth.role() = 'service_role');

-- 1.4 Table user_preferences
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
CREATE POLICY "Users manage own prefs" ON admina_rh.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 1.5 Table login_attempts
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
CREATE POLICY "Users view own attempts" ON admina_rh.login_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role attempts" ON admina_rh.login_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- 1.6 Table user_audit_log
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
CREATE POLICY "Users view own audit" ON admina_rh.user_audit_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role insert audit" ON admina_rh.user_audit_log
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all audit" ON admina_rh.user_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admina_rh.user_roles
    WHERE user_id = auth.uid() AND role_name IN ('super_admin', 'tenant_admin', 'auditor'))
  );

-- 1.7 Table password_reset_tokens
CREATE TABLE IF NOT EXISTS admina_rh.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 1.8 Table user_sessions
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
CREATE POLICY "Users manage own sessions" ON admina_rh.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 1.9 Fonctions et triggers
CREATE OR REPLACE FUNCTION admina_rh.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admina_rh.profiles (id, email, first_name, last_name, email_verified_at)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN NOW() ELSE NULL END
  );
  INSERT INTO admina_rh.user_preferences (user_id) VALUES (NEW.id);
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

### VERIFICATION PHASE 1

```sql
-- Executer dans le SQL Editor
SELECT 'Tables admina_rh' AS check_name, COUNT(*) AS count
FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE';
-- Attendu : 7

SELECT 'Tables avec RLS' AS check_name, COUNT(DISTINCT tablename) AS count
FROM pg_policies WHERE schemaname = 'admina_rh';
-- Attendu : 7

SELECT 'Triggers auth' AS check_name, COUNT(*) AS count
FROM information_schema.triggers
WHERE event_object_schema = 'auth';
-- Attendu : 1 (on_auth_user_created)

SELECT 'Fonctions admina_rh' AS check_name, COUNT(*) AS count
FROM information_schema.routines WHERE routine_schema = 'admina_rh';
-- Attendu : 2
```

- [ ] 7 tables dans admina_rh
- [ ] 7 tables avec RLS
- [ ] 1 trigger sur auth.users
- [ ] 2 fonctions dans admina_rh

---

## PHASE 2 — MULTI-TENANCY (20 min)

### 2.1 Executer le bloc SQL suivant

```sql
-- ═══════════════════════════════════════════════════════════
-- PHASE 2 : Multi-Tenancy
-- ═══════════════════════════════════════════════════════════

-- 2.1 Table tenants
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
CREATE POLICY "Service role tenants" ON admina_rh.tenants
  FOR ALL USING (auth.role() = 'service_role');

-- 2.2 Table tenant_users
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
CREATE POLICY "Users view memberships" ON admina_rh.tenant_users
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role tenant_users" ON admina_rh.tenant_users
  FOR ALL USING (auth.role() = 'service_role');

-- 2.3 Table tenant_modules
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

-- 2.4 Table tenant_settings
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

-- 2.5 FK user_roles -> tenants
DO $$ BEGIN
  ALTER TABLE admina_rh.user_roles ADD CONSTRAINT fk_user_roles_tenant
    FOREIGN KEY (tenant_id) REFERENCES admina_rh.tenants(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2.6 Triggers
CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON admina_rh.tenants
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
CREATE TRIGGER tenant_settings_updated_at BEFORE UPDATE ON admina_rh.tenant_settings
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();

-- 2.7 Seed tenant demo (conserver le meme ID)
INSERT INTO admina_rh.tenants (id, name, slug, employee_count, created_by)
VALUES (
  'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  'Admina_RH Demo', 'admina-rh-demo', 15, NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO admina_rh.tenant_settings (tenant_id)
VALUES ('bf7f8545-d3fa-4c9d-b971-4281ed039030')
ON CONFLICT (tenant_id) DO NOTHING;

-- 2.8 Activer les 32 modules (D01-D32)
INSERT INTO admina_rh.tenant_modules (tenant_id, module_code, module_name) VALUES
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

### VERIFICATION PHASE 2

```sql
SELECT COUNT(*) AS tables_admina_rh FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE';
-- Attendu : 12

SELECT name, slug FROM admina_rh.tenants;
-- Attendu : 1 row (Admina_RH Demo)

SELECT COUNT(*) AS modules FROM admina_rh.tenant_modules;
-- Attendu : 32
```

- [ ] 12 tables dans admina_rh
- [ ] 1 tenant (Admina_RH Demo)
- [ ] 32 modules actifs

---

## PHASE 3 — MIGRATION DONNEES (20 min)

### 3.1 Executer le bloc SQL

```sql
-- ═══════════════════════════════════════════════════════════
-- PHASE 3 : Migration des donnees existantes
-- ═══════════════════════════════════════════════════════════

-- 3.1 Creer table departments (references par employees.department_id)
CREATE TABLE IF NOT EXISTS admina_rh.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030',
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID,
  parent_id UUID REFERENCES admina_rh.departments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE admina_rh.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation departments" ON admina_rh.departments
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM admina_rh.tenant_users WHERE user_id = auth.uid()));
CREATE POLICY "Service role departments" ON admina_rh.departments
  FOR ALL USING (auth.role() = 'service_role');

-- 3.2 Creer table positions
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
CREATE POLICY "Service role positions" ON admina_rh.positions
  FOR ALL USING (auth.role() = 'service_role');

-- 3.3 Creer table employees dans admina_rh
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
  department_id UUID REFERENCES admina_rh.departments(id),
  position_id UUID REFERENCES admina_rh.positions(id),
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
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM admina_rh.tenant_users WHERE user_id = auth.uid()));
CREATE POLICY "Service role employees" ON admina_rh.employees
  FOR ALL USING (auth.role() = 'service_role');

-- 3.4 Migrer donnees depuis public.employees
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

-- 3.5 Corriger emails @hotel.com
UPDATE admina_rh.employees
SET email = REPLACE(email, '@hotel.com', '@admina-rh.demo')
WHERE email LIKE '%@hotel.com';

-- 3.6 Seed 8 departements
INSERT INTO admina_rh.departments (id, code, name, description) VALUES
  ('6f053139-ac25-4f06-bf83-6780233b845e', 'DEP1', 'Administration Generale du Personnel', 'Gestion administrative complete du personnel'),
  ('1a58777d-bf40-4410-b95d-766054054d01', 'DEP2', 'Gestion Previsionnelle des Emplois', 'Planification et gestion previsionnelle'),
  ('e6e551a1-b0dc-457a-9dff-b3af9c19167a', 'DEP3', 'Developpement des Competences', 'Formation et developpement'),
  ('c00f32a1-0000-4f06-bf83-000000000001', 'DEP4', 'Remuneration et Avantages', 'Gestion de la remuneration'),
  ('4a26a6e3-0000-4410-b95d-000000000002', 'DEP5', 'Relations Professionnelles', 'Relations de travail et discipline'),
  ('93943e6b-0000-4f06-bf83-000000000003', 'DEP6', 'Sante Securite et Conditions de Travail', 'Sante et securite au travail'),
  ('aaaaaaaa-0000-4410-b95d-000000000004', 'DEP7', 'Systemes d Information RH', 'Systemes d information'),
  ('bbbbbbbb-0000-4f06-bf83-000000000005', 'DEP8', 'Pilotage et Audit RH', 'Pilotage et audit')
ON CONFLICT (id) DO NOTHING;

-- 3.7 Triggers
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON admina_rh.employees
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
CREATE TRIGGER departments_updated_at BEFORE UPDATE ON admina_rh.departments
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
CREATE TRIGGER positions_updated_at BEFORE UPDATE ON admina_rh.positions
  FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();
```

### VERIFICATION PHASE 3

```sql
SELECT COUNT(*) FROM admina_rh.employees;           -- Attendu : 15
SELECT COUNT(*) FROM admina_rh.departments;          -- Attendu : 8
SELECT COUNT(*) FROM admina_rh.employees WHERE email LIKE '%@hotel.com'; -- Attendu : 0
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'admina_rh'; -- Attendu : 15
```

- [ ] 15 employees migres
- [ ] 8 departments crees
- [ ] 0 emails @hotel.com
- [ ] 15 tables dans admina_rh

---

## PHASE 4 — MIGRATION 31 DOMAINES (4-6h)

### 4.1 Instructions generales

Pour chaque domaine D01 a D32, creer les tables dans le schema `admina_rh` avec le pattern :

```
Chaque table DOIT avoir :
  - id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - tenant_id UUID NOT NULL DEFAULT 'bf7f8545-d3fa-4c9d-b971-4281ed039030'
  - created_at TIMESTAMPTZ DEFAULT NOW()
  - updated_at TIMESTAMPTZ DEFAULT NOW()
  - ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
  - Policy: tenant isolation
  - Policy: service_role full access
  - Trigger: updated_at
```

### 4.2 Tables par domaine (resume)

| Domaine | Tables a creer |
|---|---|
| D01 Organisation | d01_organizational_units, d01_unit_history |
| D02 Admin. Personnel | d02_contracts, d02_assignments, d02_documents, d02_civil_status, d02_identifications, d02_emergency_contacts, d02_qualifications, d02_experiences, d02_languages, d02_dependents, d02_notes, d02_contract_history, d02_document_templates, d02_employee_documents |
| D03 GPE | d03_jobs, d03_skills_inventory, d03_employee_skills, d03_workforce_forecast |
| D04 Temps | d04_work_schedules, d04_attendances, d04_leaves, d04_leave_balances, d04_overtime_requests, d04_overtime_records |
| D05 Salaires | d05_salary_structures, d05_salary_components, d05_employee_salaries, d05_salary_history |
| D06 Deplacements | d06_travel_requests, d06_travel_expenses, d06_mission_orders |
| D07 Paie | d07_payroll_periods, d07_payroll_runs, d07_payslips, d07_payroll_details, d07_tax_deductions, d07_social_contributions |
| D08 Prestations | d08_benefits, d08_benefit_enrollments, d08_claims |
| D09 Formation | d09_training_programs, d09_training_sessions, d09_enrollments, d09_certifications, d09_training_needs |
| D10 Carrieres | d10_career_paths, d10_promotions, d10_transfers, d10_demotions |
| D11 Mobilite | d11_mobility_requests, d11_mobility_matches, d11_internal_postings |
| D12 Admin. Personnel | d12_personnel_actions, d12_personnel_files |
| D13 Talents | d13_talent_pools, d13_succession_plans, d13_high_potentials |
| D14 Savoir | d14_knowledge_base, d14_knowledge_categories, d14_articles |
| D15 Remuneration | d15_compensation_plans, d15_variable_pay, d15_benefits_in_kind |
| D16 Avantages | d16_social_benefits, d16_allowances, d16_insurance_plans |
| D17 Retraite | d17_pension_plans, d17_pension_contributions, d17_retirement_requests |
| D18 Impot | d18_tax_brackets, d18_tax_exemptions, d18_annual_tax_reports |
| D19 Relations | d19_collective_agreements, d19_grievances, d19_meetings |
| D20 Discipline | d20_sanctions, d20_disciplinary_cases, d20_warnings |
| D21 Classification | d21_job_classifications, d21_grade_scales, d21_evaluation_grids |
| D22 Conflits | d22_conflicts, d22_mediations, d22_resolutions |
| D23 Organigramme | d23_org_charts, d23_positions_hierarchy |
| D24 Effectifs | d24_headcount_plans, d24_hiring_plans, d24_separation_records |
| D25 Syndicats | d25_unions, d25_union_members, d25_collective_bargaining |
| D26 Sante | d26_health_records, d26_medical_exams, d26_occupational_diseases |
| D27 Securite | d27_safety_incidents, d27_safety_inspections, d27_risk_assessments |
| D28 Conditions | d28_working_conditions, d28_equipments, d28_remote_work_policies |
| D29 SI RH | d29_system_configs, d29_data_imports, d29_integrations |
| D30 Donnees | d30_data_quality_checks, d30_data_exports, d30_privacy_consents |
| D31 Pilotage | d31_kpi_definitions, d31_kpi_values, d31_dashboards, d31_reports |
| D32 Audit | d32_audit_plans, d32_audit_findings, d32_audit_recommendations, d32_compliance_checks |

### 4.3 Script de generation automatique des triggers

```sql
-- Executer APRES avoir cree toutes les tables de tous les domaines
DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('profiles', 'employees', 'departments', 'positions', 'tenants', 'tenant_settings')
  LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON admina_rh.%I
      FOR EACH ROW EXECUTE FUNCTION admina_rh.update_updated_at();', tbl, tbl);
  END LOOP;
END $$;
```

### VERIFICATION PHASE 4

```sql
SELECT COUNT(*) AS total_tables FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE';
-- Attendu : 285+ (15 existantes + ~270 nouvelles)

SELECT COUNT(DISTINCT tablename) AS tables_with_rls FROM pg_policies
WHERE schemaname = 'admina_rh';
-- Attendu : meme nombre que total_tables
```

- [ ] 285+ tables dans admina_rh
- [ ] Toutes les tables ont RLS

---

## PHASE 5 — API AUTH CLOUDFLARE (45 min)

### 5.1 Creer le fichier `src/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  tenant_slug: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name, tenant_slug } = registerSchema.parse(body)
    const supabase = await createClient()

    const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single()
    if (existing) return NextResponse.json({ error: 'Email deja utilise' }, { status: 409 })

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name, last_name }, emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm` },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    if (data.user && tenant_slug) {
      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenant_slug).single()
      if (tenant) {
        await supabase.from('user_roles').insert({ user_id: data.user.id, tenant_id: tenant.id, role_name: 'viewer', is_default: true })
        await supabase.from('tenant_users').insert({ tenant_id: tenant.id, user_id: data.user.id, is_default: true })
      }
    }
    return NextResponse.json({ message: 'Compte cree. Verifiez votre email.', user_id: data.user?.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Donnees invalides', details: err.errors }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

### 5.2 Creer `src/app/api/auth/forgot-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/reset-password`,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Si un compte existe, un lien a ete envoye.' })
  } catch { return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }) }
}
```

### 5.3 Creer `src/app/api/auth/reset-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const { password } = z.object({ password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/) }).parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase.auth.updateUser({ password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Mot de passe mis a jour.' })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

### 5.4 Creer `src/app/api/auth/session/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const { cookies } = await import('next/headers')
    const c = (await cookies()).get('admina_auth')?.value
    if (c) return NextResponse.json({ authenticated: true, method: 'fallback' })
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, method: 'supabase', user: { id: user.id, email: user.email } })
}
```

### 5.5 Deployer sur Cloudflare

```bash
cd /chemin/vers/Admina_RH
npx opennextjs-cloudflare deploy
```

### VERIFICATION PHASE 5

```bash
# Test register (doit retourner 201, pas 404)
curl -X POST https://admina-rh.supdgeorgyfr.workers.dev/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@audit.com","password":"Test1234!","first_name":"Test","last_name":"Audit"}'

# Test forgot-password (doit retourner 200, pas 404)
curl -X POST https://admina-rh.supdgeorgyfr.workers.dev/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@admina-rh.demo"}'

# Test session (doit retourner 200/401, pas 404)
curl https://admina-rh.supdgeorgyfr.workers.dev/api/auth/session
```

- [ ] /api/auth/register -> 201 ou 409 (pas 404)
- [ ] /api/auth/forgot-password -> 200 (pas 404)
- [ ] /api/auth/reset-password -> 200 ou 400 (pas 404)
- [ ] /api/auth/session -> 200 ou 401 (pas 404)

---

## PHASE 6 — PAGE /MON-COMPTE (45 min)

### 6.1 Creer `src/app/(dashboard)/mon-compte/MonCompteClient.tsx`

> Le code complet de ce composant client a 4 onglets (Profil, Securite, Historique, Preferences) est dans le fichier `Prompt_Correction_V3_AdminaRH_PostAudit_2026-08-07.md`, section 6.2.

**Points cles :**
- Le composant DOIT contenir des `<input>` pour le profil (prenom, nom, telephone)
- Le composant DOIT contenir des `<input type="password">` pour le changement de mot de passe
- Le composant DOIT afficher les roles de l'utilisateur
- Le composant DOIT avoir un bouton "Se deconnecter"

### 6.2 Creer les API routes pour /mon-compte

> Voir `Prompt_Correction_V3_AdminaRH_PostAudit_2026-08-07.md`, sections 6.1 et 6.3.

### 6.3 Deployer

```bash
npx opennextjs-cloudflare deploy
```

### VERIFICATION PHASE 6

```bash
# La page DOIT contenir des inputs
curl -s https://admina-rh.supdgeorgyfr.workers.dev/mon-compte | grep -c '<input'
# Attendu : > 0 (actuellement 0)
```

- [ ] /mon-compte contient au moins 3 `<input>`
- [ ] /mon-compte a des boutons (Enregistrer, Deconnecter)
- [ ] /mon-compte affiche les 4 onglets

---

## PHASE 7 — SECURITE (15 min)

### 7.1 Hasher les mots de passe

```sql
-- Verifier que la colonne password_hash existe
SELECT column_name FROM information_schema.columns
WHERE table_name = 'admina_users' AND table_schema = 'public';

-- Si pas de password_hash, l'ajouter
ALTER TABLE public.admina_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Hasher les mots de passe (bcrypt)
UPDATE public.admina_users SET password_hash = crypt('Admin@2024_Super!2026', gen_salt('bf'))
WHERE email = 'super.admin@admina-rh.demo';
UPDATE public.admina_users SET password_hash = crypt('Admin@2024_Tenant!2026', gen_salt('bf'))
WHERE email = 'admin@admina-rh.demo';
UPDATE public.admina_users SET password_hash = crypt('Manager@2024!', gen_salt('bf'))
WHERE email = 'manager.admin@admina-rh.demo';
UPDATE public.admina_users SET password_hash = crypt('HRMgr@2024!', gen_salt('bf'))
WHERE email = 'hr.manager@admina-rh.demo';
UPDATE public.admina_users SET password_hash = crypt('HRAssist@2024!', gen_salt('bf'))
WHERE email = 'hr.assistant@admina-rh.demo';
UPDATE public.admina_users SET password_hash = crypt('Employe@2024!', gen_salt('bf'))
WHERE email = 'employe.demo@admina-rh.demo';
UPDATE public.admina_users SET password_hash = crypt('Viewer@2024!', gen_salt('bf'))
WHERE email = 'viewer.demo@admina-rh.demo';
```

### 7.2 Corriger login-direct pour verifier le hash

Dans `src/app/api/auth/login-direct/route.ts`, remplacer la comparaison en clair par :
```typescript
import bcrypt from 'bcryptjs'
// ... dans la verification :
const validPassword = await bcrypt.compare(password, user.password_hash)
if (!validPassword) return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
```

### VERIFICATION PHASE 7

```sql
SELECT email, password_hash IS NOT NULL AS has_hash FROM public.admina_users;
-- Attendu : tous les users ont password_hash non NULL

-- Verifier qu'aucun mot de passe en clair ne reste
SELECT email FROM public.admina_users WHERE password_hash IS NULL;
-- Attendu : 0 rows
```

- [ ] Tous les utilisateurs ont un hash bcrypt
- [ ] Login-direct utilise bcrypt.compare

---

## RESULTAT FINAL — RAPPORT DE CONFORMITE

### A. Script de verification globale (executer dans SQL Editor)

```sql
SELECT 'A1. Schema admina_rh' AS item,
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name='admina_rh') THEN 'OK' ELSE 'FAIL' END AS status;

SELECT 'A2. Total tables' AS item, COUNT(*)::text || '/285+' AS value
FROM information_schema.tables WHERE table_schema='admina_rh' AND table_type='BASE TABLE';

SELECT 'A3. Tables avec RLS' AS item, COUNT(DISTINCT tablename)::text AS value
FROM pg_policies WHERE schemaname='admina_rh';

SELECT 'A4. Triggers' AS item, COUNT(*)::text AS value
FROM information_schema.triggers WHERE event_object_schema IN ('admina_rh','auth');

SELECT 'A5. Fonctions' AS item, COUNT(*)::text AS value
FROM information_schema.routines WHERE routine_schema='admina_rh';

SELECT 'A6. Employees migres' AS item, COUNT(*)::text AS value FROM admina_rh.employees;

SELECT 'A7. Emails @hotel' AS item, COUNT(*)::text AS value FROM admina_rh.employees WHERE email LIKE '%@hotel.com';

SELECT 'A8. Tenants' AS item, COUNT(*)::text AS value FROM admina_rh.tenants;

SELECT 'A9. Modules actifs' AS item, COUNT(*)::text AS value FROM admina_rh.tenant_modules;

SELECT 'A10. Passwords hashes' AS item, COUNT(*)::text || '/13' AS value
FROM public.admina_users WHERE password_hash IS NOT NULL;
```

### B. Tests Cloudflare (executer dans un terminal)

```bash
echo "B1. Register:" && curl -s -o /dev/null -w "%{http_code}" -X POST https://admina-rh.supdgeorgyfr.workers.dev/api/auth/register -H 'Content-Type: application/json' -d '{"email":"t@t.com","password":"Test1234!","first_name":"T","last_name":"T"}'
echo "B2. Forgot:" && curl -s -o /dev/null -w "%{http_code}" -X POST https://admina-rh.supdgeorgyfr.workers.dev/api/auth/forgot-password -H 'Content-Type: application/json' -d '{"email":"a@b.com"}'
echo "B3. Session:" && curl -s -o /dev/null -w "%{http_code}" https://admina-rh.supdgeorgyfr.workers.dev/api/auth/session
echo "B4. Mon-compte inputs:" && curl -s https://admina-rh.supdgeorgyfr.workers.dev/mon-compte | grep -c '<input'
```

### C. Score de conformite

| Critere | Poids | Attendu |
|---|---|---|
| Schema admina_rh | 10% | Existe |
| Tables (285+) | 25% | 285+ |
| RLS | 20% | 100% tables |
| Triggers + fonctions | 10% | 36+ |
| API endpoints (6) | 15% | 6 routes 200/201 |
| /mon-compte fonctionnel | 10% | 3+ inputs |
| Securite (hash) | 10% | 13/13 hashes |

**Score cible : 100%**

Copier le resultat de ce rapport dans `prompt-et-correction/Audit base de donnee/RAPPORT_EXECUTION_DEPLOIEMENT.md` sur le repo GitHub.
