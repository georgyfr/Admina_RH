-- =============================================================
-- AUDIT V3 FULL MIGRATION — Admina_RH
-- Extracted from Prompt_Correction_V3_AdminaRH_PostAudit_2026-08-07.md
-- Auto-generated extraction — DO NOT EDIT MANUALLY
-- =============================================================

-- =============================================================
-- PHASE 1 — AUTH & ACCOUNTS (P0 CRITICAL)
-- Schema, Profiles, Roles, Preferences, Sessions, Triggers, RLS
-- =============================================================

-- Source: ### 1.1 Creer le schema admina_rh
-- Migration 001 : Creer le schema
CREATE SCHEMA IF NOT EXISTS admina_rh;

-- Verifier
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'admina_rh';
-- Attendu : 1 row avec 'admina_rh'

-- Source: ### 1.2 Creer la table profiles
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

-- Source: ### 1.3 Creer les tables de securite et comptes
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

-- Source: ### 1.4 Triggers
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

-- =============================================================
-- PHASE 1 — VERIFICATION
-- =============================================================

-- Source: ### 1.5 Verifier Phase 1
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

-- =============================================================
-- PHASE 2 — MULTI-TENANCY (P0 CRITICAL)
-- =============================================================

-- Source: ### 2.1 Tables multi-tenant
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

-- =============================================================
-- PHASE 2 — MULTI-TENANCY (P0 CRITICAL)
-- =============================================================

-- Source: ### 2.2 Seed du tenant de demonstration
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

-- =============================================================
-- PHASE 2 — VERIFICATION
-- =============================================================

-- Source: ### 2.3 Verifier Phase 2
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Attendu : 12 tables (7 de Phase 1 + tenants, tenant_users, tenant_modules, tenant_settings, + user_roles FK mis a jour)

SELECT * FROM admina_rh.tenants;
-- Attendu : 1 row (Admina_RH Demo)

SELECT COUNT(*) FROM admina_rh.tenant_modules;
-- Attendu : 32 (31 domaines D01-D32)

-- =============================================================
-- PHASE 3 — MIGRATE EXISTING TABLES (P1 MAJOR)
-- =============================================================

-- Source: ### 3.1 Deplacer employees vers admina_rh
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

-- Source: ### 3.2 Creer les tables de reference manquantes
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

-- Source: ### 3.3 Verifier Phase 3
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

-- =============================================================
-- PHASE 4 — D02 DOMAIN TABLES (P1 CRITICAL)
-- Gestion Administrative du Personnel — 13 tables
-- =============================================================

-- Source: ### 4.3 Exemple complet - D02 Gestion Administrative du Personnel
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

-- =============================================================
-- PHASE 7 — SECURITY: HASH PASSWORDS (P0 CRITICAL)
-- =============================================================

-- Source: ### 7.1 Hasher les mots de passe admina_users
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

-- =============================================================
-- PHASE 8 — FINAL VERIFICATION
-- =============================================================

-- Source: ### 8.1 Script de verification complet
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

-- END OF MIGRATION SCRIPT
