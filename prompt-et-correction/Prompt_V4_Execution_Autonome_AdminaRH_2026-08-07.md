# PROMPT V4 — EXÉCUTION AUTONOME Admina_RH
## Garantir le déploiement fonctionnel sur Supabase + Cloudflare
### Basé sur le portail HTML : AdminaRH_Portail_Navigation.html
### Date : 2026-08-07

---

## 🚨 CONTEXTE CRITIQUE — LIRE EN PREMIER

Les Prompts V1, V2 et V3 n'ont JAMAIS été exécutés. Score d'exécution réel : **4.4% (2/45 items)**.

**État actuel SUPABASE (project ref: aywwakllgvfoqlpowzqf)**:
- Schema `admina_rh` : **N'EXISTE PAS**
- Tables existantes dans `public` : seulement `admina_users` (13 rows, mdp `Admin@2024` en clair) et `employees` (15 rows, emails `@hotel.com`, FK orphelines)
- RLS : 0 table protégée | Triggers : 0 | Fonctions SQL : 0
- Clé `service_role` : **CASSÉE** (incompatible GoTrue, 401 sur /auth/v1/admin/users)

**État actuel CLOUDFLARE (admina-rh.supdgeorgyfr.workers.dev)**:
- 14 routes API en 404 (register, session, forgot-password, reset-password, departments, employees, tenants, roles, audit-logs, settings...)
- Seul `/api/auth/login-direct` (fallback PostgREST) fonctionne
- Page `/mon-compte` : VIDE (0 formulaire, 0 input, 0 bouton)

**Cible (portail HTML)** :
- 8 départements, 31 domaines (D01-D31), 347 employés
- Design : vert #007a33, rouge #ce1126, or #fcd116, Inter, FA 6.5.1
- Conformité ISO 30201:2026

---

## RÈGLES D'EXÉCUTION — OBLIGATOIRES

1. **Exécuter CHAQUE phase séquentiellement. Ne pas passer à la phase suivante sans vérification.**
2. **Chaque bloc SQL doit être copié-collé DANS LE SQL EDITOR SUPABASE** (pas de fichier externe).
3. **Chaque bloc TypeScript doit être écrit DANS LE FICHIER CORRESPONDANT du repo GitHub.**
4. **Après chaque phase, exécuter la commande de vérification. Si échec, corriger avant de continuer.**
5. **Commit et push sur GitHub après chaque phase.**
6. **Déployer sur Cloudflare après la phase des routes API.**

---

## PHASE 0 — PRÉREQUIS (15 min)

### 0.1 Régénérer la clé service_role
- Aller sur https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf/settings/api
- Cliquer "Regenerate" sur `service_role`
- Copier la NOUVELLE clé
- Remplacer dans Cloudflare Workers env vars : `SUPABASE_SERVICE_ROLE_KEY`
- Vérifier : `curl -H "Authorization: Bearer <NOUVELLE_CLE>" https://aywwakllgvfoqlpowzqf.supabase.co/auth/v1/admin/users` → doit retourner 200 (liste users)

### 0.2 Vérifier les variables d'environnement Cloudflare
```bash
cd /path/to/Admina_RH
npx wrangler secret list
# Doit contenir : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
```

### 0.3 Nettoyer les tables existantes cassées
```sql
-- Exécuter dans Supabase SQL Editor
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.admina_users CASCADE;
```

### ✅ Vérification Phase 0
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- Résultat attendu : 0 rows
```

---

## PHASE 1 — SCHÉMA AUTH + UTILISATEURS (30 min)

### 1.1 Créer les tables d'authentification
```sql
-- Exécuter dans Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils (liée à auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, tenant_id)
);

-- Table des rôles
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  level INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table de liaison user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id, tenant_id)
);

-- Préférences utilisateur
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'fr',
  theme TEXT NOT NULL DEFAULT 'light',
  notifications_email BOOLEAN NOT NULL DEFAULT true,
  notifications_push BOOLEAN NOT NULL DEFAULT true,
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tentatives de connexion
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id UUID
);

-- Journal d'audit
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  tenant_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tokens de reset mot de passe
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions actives
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.2 Trigger auto-update updated_at
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' AND table_name IN (
      'profiles','user_preferences','audit_logs','password_reset_tokens','user_sessions'
    )
  LOOP
    EXECUTE format('
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    ', tbl);
  END LOOP;
END $$;
```

### 1.3 RLS sur toutes les tables
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles : un user voit son propre profil, ou tout si super_admin
CREATE POLICY "users_view_own" ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "service_role_all" ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Roles : lecture publique, écriture service_role uniquement
CREATE POLICY "roles_read" ON public.roles FOR SELECT
  USING (true);
CREATE POLICY "roles_service_role" ON public.roles FOR ALL
  USING (auth.role() = 'service_role');

-- user_roles : lecture own tenant
CREATE POLICY "user_roles_own" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "user_roles_service_role" ON public.user_roles FOR ALL
  USING (auth.role() = 'service_role');

-- user_preferences : own only
CREATE POLICY "prefs_own" ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- audit_logs : service_role
CREATE POLICY "audit_service_role" ON public.audit_logs FOR ALL
  USING (auth.role() = 'service_role');

-- login_attempts : service_role
CREATE POLICY "login_service_role" ON public.login_attempts FOR ALL
  USING (auth.role() = 'service_role');

-- password_reset_tokens : service_role
CREATE POLICY "prt_service_role" ON public.password_reset_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- user_sessions : own
CREATE POLICY "sessions_own" ON public.user_sessions FOR ALL
  USING (auth.uid() = user_id);
```

### 1.4 Seeder les rôles système
```sql
INSERT INTO public.roles (name, description, permissions, level, is_system) VALUES
  ('super_admin', 'Administrateur principal du système', '{"all": true}', 100, true),
  ('tenant_admin', 'Administrateur du tenant', '{"manage_users": true, "manage_departments": true, "manage_employees": true, "view_reports": true}', 80, true),
  ('hr_manager', 'Responsable RH', '{"manage_employees": true, "manage_contracts": true, "manage_payroll": true, "view_reports": true}', 60, true),
  ('hr_assistant', 'Assistant RH', '{"manage_employees": true, "view_reports": true}', 40, true),
  ('manager', 'Manager de département', '{"view_team": true, "approve_leaves": true, "view_reports": true}', 30, true),
  ('employee', 'Employé standard', '{"view_own": true, "request_leave": true, "update_profile": true}', 10, true),
  ('viewer', 'Lecteur seul', '{"view_own": true}', 5, true);
```

### 1.5 Créer le compte super_admin via Supabase Auth
```sql
-- D'abord créer l'utilisateur dans auth.users via l'API admin
-- Puis le profil sera créé automatiquement par le trigger ci-dessous

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tenant_id, email, full_name, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'tenant_id', '00000000-0000-0000-0000-000000000000'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    true
  );
  -- Assigner le rôle par défaut
  INSERT INTO public.user_roles (user_id, role_id, tenant_id)
  SELECT NEW.id, r.id, COALESCE(NEW.raw_user_meta_data->>'tenant_id', '00000000-0000-0000-0000-000000000000')
  FROM public.roles r WHERE r.name = 'employee' LIMIT 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### ✅ Vérification Phase 1
```sql
SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' ORDER BY table_name;
-- Résultat attendu : 8 tables (profiles, roles, user_roles, user_preferences, login_attempts, audit_logs, password_reset_tokens, user_sessions)

SELECT name FROM public.roles ORDER BY level DESC;
-- Résultat attendu : 7 rôles (super_admin, tenant_admin, hr_manager, hr_assistant, manager, employee, viewer)

SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Résultat attendu : >= 14 politiques

SELECT trigger_name FROM information_schema.triggers 
  WHERE trigger_schema = 'public' OR event_object_table IN (SELECT table_name FROM information_schema.tables WHERE table_schema='public');
-- Résultat attendu : >= 6 triggers
```

**Commit Phase 1 :** `git add -A && git commit -m "Phase 1: Schema auth + users + RLS + triggers" && git push`

---

## PHASE 2 — MULTI-TENANCY + DÉPARTEMENTS + DOMAINES (30 min)

### 2.1 Tables multi-tenancy
```sql
-- Tenants
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'enterprise',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_employees INTEGER NOT NULL DEFAULT 500,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Modules activés par tenant
CREATE TABLE public.tenant_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  UNIQUE(tenant_id, module_code)
);

-- Trigger updated_at pour tenants
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### 2.2 Départements (8) et Domaines (31) — EXTRAITS DU PORTAIL HTML
```sql
-- Départements
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'fas fa-building',
  color_class TEXT NOT NULL DEFAULT 'ig',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Domaines (D01-D31)
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'fas fa-cube',
  bg_class TEXT NOT NULL DEFAULT 'b01',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### 2.3 RLS sur tables Phase 2
```sql
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_service_role" ON public.tenants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "tenant_modules_sr" ON public.tenant_modules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "depts_read" ON public.departments FOR SELECT USING (true);
CREATE POLICY "depts_sr" ON public.departments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "domains_read" ON public.domains FOR SELECT USING (true);
CREATE POLICY "domains_sr" ON public.domains FOR ALL USING (auth.role() = 'service_role');
```

### 2.4 Seed Tenant + Départements + Domaines (données du portail HTML)
```sql
-- Tenant démo
INSERT INTO public.tenants (id, name, slug, plan, max_employees, settings) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Admina_RH Démo', 'admina-rh-demo', 'enterprise', 500,
   '{"country": "CM", "currency": "XAF", "timezone": "Africa/Douala"}'::jsonb);

-- 8 Départements (exactement comme dans le portail HTML)
INSERT INTO public.departments (tenant_id, code, name, description, icon, color_class, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'DEP1', 'Gestion Administrative', 'Recrutement, contrats, organisation, cartographie des métiers', 'fas fa-users-gear', 'ig', 1),
  ('a0000000-0000-0000-0000-000000000001', 'DEP2', 'Paie & Rémunération', 'Traitement paie, CNPS, DGI, avantages sociaux, prévoyance', 'fas fa-money-check-dollar', 'ib', 2),
  ('a0000000-0000-0000-0000-000000000001', 'DEP3', 'Formation & Développement', 'Compétences, évaluation, talents, mobilité, innovation', 'fas fa-graduation-cap', 'iv', 3),
  ('a0000000-0000-0000-0000-000000000001', 'DEP4', 'Santé, Sécurité & Bien-être', 'Conditions de travail, sécurité, bien-être, diversité', 'fas fa-shield-heart', 'ia', 4),
  ('a0000000-0000-0000-0000-000000000001', 'DEP5', 'Droit du Travail & Conformité', 'Législation camerounaise, OHADA, audit, contentieux', 'fas fa-scale-balanced', 'ic', 5),
  ('a0000000-0000-0000-0000-000000000001', 'DEP6', 'Communication & Marque Employeur', 'Marque employeur, communication interne, engagement, RSE', 'fas fa-bullhorn', 'ip', 6),
  ('a0000000-0000-0000-0000-000000000001', 'DEP7', 'Mobilité Internationale', 'Expatriés, personnel détaché, mobilité internationale', 'fas fa-plane-departure', 'ir', 7),
  ('a0000000-0000-0000-0000-000000000001', 'DEP8', 'Pilotage & Système', 'Tableaux de bord, pilotage RH, fiches de postes, relations sociales', 'fas fa-chart-column', 'io', 8);

-- 31 Domaines (D01-D31) — exactement comme dans le portail HTML
INSERT INTO public.domains (tenant_id, department_id, code, name, slug, description, icon, bg_class, sort_order) VALUES
  -- Dép. 1 (Gestion Administrative)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP1'), 'D01', 'Recrutement & Candidats', 'recrutement', 'Gestion du processus de recrutement, offres, candidatures', 'fas fa-user-plus', 'b01', 1),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP1'), 'D02', 'Contrats & Gestion Admin.', 'contrats', 'Contrats de travail, avenants, gestion administrative', 'fas fa-file-signature', 'b02', 2),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP1'), 'D04', 'Temps de Travail & Planification', 'temps-travail', 'Horaires, planning, pointage, heures supplémentaires', 'fas fa-clock', 'b04', 4),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP1'), 'D05', 'Congés, Absences & Présence', 'conges', 'Solde de congés, demandes, validations, présence', 'fas fa-umbrella-beach', 'b05', 5),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP1'), 'D12', 'Documentation & Archivage RH', 'documentation', 'Gestion documentaire, archivage, numérisation', 'fas fa-folder-open', 'b12', 12),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP1'), 'D23', 'Travail Temporaire', 'travail-temporaire', 'Intérimaires, CDD, contrats temporaires', 'fas fa-briefcase', 'b23', 23),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP1'), 'D24', 'Stagiaires & Alternants', 'stagiaires', 'Conventions de stage, suivi, intégration', 'fas fa-graduation-cap', 'b24', 24),
  -- Dép. 2 (Paie & Rémunération)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP2'), 'D03', 'Paie & Rémunération', 'paie', 'Traitement paie, bulletins, CNPS, DGI, impôts', 'fas fa-coins', 'b03', 3),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP2'), 'D22', 'Avantages Sociaux & Prévisionnelle', 'avantages-sociaux', 'Mutuelle, assurances, avantages en nature', 'fas fa-heart-pulse', 'b22', 22),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP2'), 'D31', 'Retraites & Prévoyance', 'retraites', 'Retraite CNPS, plans épargne, prévoyance décès', 'fas fa-piggy-bank', 'b31', 31),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP2'), 'D26', 'Gestion Budgétaire & Fiscale RH', 'budget-fiscal', 'Budgets RH, fiscalité, déclarations CNPS/DGI', 'fas fa-calculator', 'b26', 26),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP2'), 'D15', 'Budget & Pilotage Financier RH', 'budget-rh', 'Budget formation, masse salariale, coûts RH', 'fas fa-chart-pie', 'b15', 15),
  -- Dép. 3 (Formation & Développement)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP3'), 'D06', 'Formation & Développement Compétences', 'formation', 'Plans de formation, budgets, certifications', 'fas fa-chalkboard-user', 'b06', 6),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP3'), 'D07', 'Évaluation & Gestion Performance', 'evaluation', 'Objectifs, entretiens annuels, feedback', 'fas fa-chart-line', 'b07', 7),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP3'), 'D10', 'Talents & Mobilité Interne', 'talents', 'Identification talents, succession, mobilité', 'fas fa-star', 'b10', 10),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP3'), 'D28', 'Mobilité Carrière & Succession', 'mobilite-carriere', 'Plans de succession, promotion, mobilité interne', 'fas fa-arrows-spin', 'b28', 28),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP3'), 'D19', 'Innovation RH & Transformation Digitale', 'innovation', 'Digitalisation RH, nouveaux outils', 'fas fa-lightbulb', 'b19', 19),
  -- Dép. 4 (Santé, Sécurité & Bien-être)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP4'), 'D09', 'Santé, Sécurité & Conditions Travail', 'sante-securite', 'Hygiène, sécurité, médecine du travail', 'fas fa-hard-hat', 'b09', 9),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP4'), 'D27', 'Bien-être au Travail', 'bien-etre', 'Qualité de vie au travail, bien-être, prévention', 'fas fa-hand-holding-heart', 'b27', 27),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP4'), 'D16', 'Diversité, Équité & Inclusion', 'diversite', 'Politiques DEI, égalité des chances', 'fas fa-people-group', 'b16', 16),
  -- Dép. 5 (Droit du Travail & Conformité)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP5'), 'D11', 'Droit du Travail & Conformité CMR', 'droit-travail', 'Code du travail camerounais, OHADA', 'fas fa-gavel', 'b11', 11),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP5'), 'D17', 'Audit, Conformité & Contentieux', 'audit-conformite', 'Audits internes, conformité légale, contentieux', 'fas fa-magnifying-glass-chart', 'b17', 17),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP5'), 'D14', 'Reporting & Tableaux de Bord', 'reporting', 'Indicateurs RH, dashboards, rapports', 'fas fa-table-columns', 'b14', 14),
  -- Dép. 6 (Communication & Marque Employeur)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP6'), 'D13', 'Communication RH & Marque Employeur', 'marque-employeur', 'Stratégie marque employeur, communication externe', 'fas fa-award', 'b13', 13),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP6'), 'D29', 'Communication Interne & Engagement', 'comm-interne', 'Communication interne, enquêtes, culture', 'fas fa-comments', 'b29', 29),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP6'), 'D18', 'RSE & Développement Durable RH', 'rse', 'Responsabilité sociétale, développement durable', 'fas fa-leaf', 'b18', 18),
  -- Dép. 7 (Mobilité Internationale)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP7'), 'D25', 'Expatriés', 'expatries', 'Gestion expatriés, contrats, fiscalité, visas', 'fas fa-passport', 'b25', 25),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP7'), 'D30', 'Personnel Détaché', 'detaches', 'Détachement international, protections sociales', 'fas fa-building-columns', 'b30', 30),
  -- Dép. 8 (Pilotage & Système)
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP8'), 'D20', 'Pilotage & Reporting RH', 'tableaux-bord', 'Tableaux de bord, KPIs, pilotage stratégique', 'fas fa-gauge-high', 'b20', 20),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP8'), 'D21', 'Fiches de Postes & Cartographie Métiers', 'fiches-postes', 'Descriptions de postes, profils, cartographie', 'fas fa-id-card', 'b21', 21),
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.departments WHERE code='DEP8'), 'D08', 'Relations Sociales & Syndicats', 'relations-sociales', 'Syndicats, CSE, conventions collectives, litiges', 'fas fa-handshake', 'b08', 8);

-- Activer tous les modules pour le tenant démo
INSERT INTO public.tenant_modules (tenant_id, module_code, is_enabled)
SELECT 'a0000000-0000-0000-0000-000000000001', code, true
FROM public.domains WHERE tenant_id = 'a0000000-0000-0000-0000-000000000001';
```

### 2.5 Table employees (version corrigée)
```sql
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  matricule TEXT NOT NULL,
  civilite TEXT NOT NULL DEFAULT 'M',
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance DATE,
  lieu_naissance TEXT,
  genre TEXT NOT NULL DEFAULT 'M',
  nationalite TEXT NOT NULL DEFAULT 'Camerounaise',
  situation_familiale TEXT,
  telephone TEXT,
  email TEXT NOT NULL,
  adresse TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  position_id UUID,
  type_contrat TEXT NOT NULL DEFAULT 'CDI',
  categorie TEXT,
  regime_travail TEXT NOT NULL DEFAULT 'Temps plein',
  date_embauche DATE,
  salaire_brut DECIMAL(12,2),
  lieu_travail TEXT NOT NULL DEFAULT 'Douala',
  statut TEXT NOT NULL DEFAULT 'actif',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, matricule)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_sr" ON public.employees FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "employees_view_own" ON public.employees FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()));
```

### ✅ Vérification Phase 2
```sql
SELECT COUNT(*) AS nb_departments FROM public.departments;
-- Résultat attendu : 8

SELECT COUNT(*) AS nb_domains FROM public.domains;
-- Résultat attendu : 31

SELECT COUNT(*) AS nb_modules FROM public.tenant_modules;
-- Résultat attendu : 31

SELECT d.name, COUNT(dom.id) AS domaines_count
FROM public.departments d
LEFT JOIN public.domains dom ON dom.department_id = d.id
GROUP BY d.name ORDER BY d.sort_order;
-- Résultat attendu : 8 lignes avec les bons counts (7,5,5,3,4,3,3,4)
```

**Commit Phase 2 :** `git add -A && git commit -m "Phase 2: Multi-tenancy + 8 departements + 31 domaines + employees" && git push`

---

## PHASE 3 — ROUTES API CLOUDFLARE (45 min)

### 3.1 Structure des fichiers à créer/modifier

Créer les fichiers suivants dans le repo GitHub `georgyfr/Admina_RH` :

**Fichier : `src/api/auth/register.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, full_name, tenant_id, phone } = await req.json();
    
    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'email, password et full_name requis' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, tenant_id: tenant_id || 'a0000000-0000-0000-0000-000000000001', phone },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, user: data.user }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/auth/session.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (error || !user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, user_roles(role_id, roles(name, level))')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ user, profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/auth/forgot-password.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, message: 'Email de réinitialisation envoyé' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/auth/reset-password.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { token, new_password } = await req.json();
    if (!token || !new_password) {
      return NextResponse.json({ error: 'token et new_password requis' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.verifyOtp({ token_hash: token, type: 'recovery' });
    if (error) return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });

    const { error: updateError } = await supabase.auth.updateUser({ password: new_password });
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    return NextResponse.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/departments/index.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenant_id') || 'a0000000-0000-0000-0000-000000000001';
    const withDomains = searchParams.get('with_domains') === 'true';

    let query = supabase
      .from('departments')
      .select(withDomains ? '*, domains(*)' : '*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order');

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ departments: data, count: data?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/domains/index.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenant_id') || 'a0000000-0000-0000-0000-000000000001';
    const deptId = searchParams.get('department_id');

    let query = supabase
      .from('domains')
      .select('*, departments(name, code)')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (deptId) query = query.eq('department_id', deptId);
    query = query.order('sort_order');

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ domains: data, count: data?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/employees/index.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenant_id') || 'a0000000-0000-0000-0000-000000000001';
    const deptId = searchParams.get('department_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('employees')
      .select('*, departments(name, code)')
      .eq('tenant_id', tenantId);

    if (deptId) query = query.eq('department_id', deptId);
    query = query.range(offset, offset + limit - 1).order('nom');

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ employees: data, total: count, limit, offset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tenant_id = body.tenant_id || 'a0000000-0000-0000-0000-000000000001';
    
    // Générer matricule auto
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant_id);
    
    const matricule = `EMP-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('employees')
      .insert({ ...body, tenant_id, matricule })
      .select('*, departments(name, code)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ employee: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/tenants/index.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*, tenant_modules(*)')
      .order('name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tenants: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/roles/index.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('level');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ roles: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/audit-logs/index.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ logs: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        ...body,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ log: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Fichier : `src/api/settings/index.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('settings, name, plan')
      .eq('id', 'a0000000-0000-0000-0000-000000000001')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { settings } = await req.json();
    const { data, error } = await supabase
      .from('tenants')
      .update({ settings, updated_at: new Date().toISOString() })
      .eq('id', 'a0000000-0000-0000-0000-000000000001')
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ tenant: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### 3.2 Vérifier que les routes sont bien dans le bon répertoire

Pour Next.js App Router, les routes API doivent être dans :
```
src/app/api/auth/register/route.ts
src/app/api/auth/session/route.ts
src/app/api/auth/forgot-password/route.ts
src/app/api/auth/reset-password/route.ts
src/app/api/departments/route.ts
src/app/api/domains/route.ts
src/app/api/employees/route.ts
src/app/api/tenants/route.ts
src/app/api/roles/route.ts
src/app/api/audit-logs/route.ts
src/app/api/settings/route.ts
```

**IMPORTANT** : Adapter les noms de fichiers selon la structure existante du projet. Vérifier d'abord la structure dans le repo.

### ✅ Vérification Phase 3
```bash
# Tester chaque route après déploiement
BASE=https://admina-rh.supdgeorgyfr.workers.dev

curl -s $BASE/api/departments | head -c 200
curl -s $BASE/api/domains | head -c 200
curl -s $BASE/api/roles | head -c 200
curl -s $BASE/api/tenants | head -c 200
curl -s $BASE/api/settings | head -c 200
curl -s $BASE/api/employees?limit=3 | head -c 200
curl -s $BASE/api/audit-logs | head -c 200

# Chaque curl doit retourner du JSON valide (pas 404)
```

**Commit Phase 3 :** `git add -A && git commit -m "Phase 3: 11 routes API fonctionnelles" && git push`

---

## PHASE 4 — PAGE PORTAIL NAVIGATION (30 min)

### 4.1 Page principale du portail

Modifier le fichier `src/app/page.tsx` pour afficher le portail identique au HTML.

La page doit contenir :

**Composant serveur (Server Component)** :
```typescript
// src/app/page.tsx
import { createClient } from '@supabase/supabase-js';
import PortailClient from '@/components/PortailClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function PortailPage() {
  const { data: departments } = await supabase
    .from('departments')
    .select('*, domains(*)')
    .eq('is_active', true)
    .order('sort_order');

  const { data: stats } = await supabase
    .from('employees')
    .select('id', { count: 'exact', head: true });

  const { data: domains } = await supabase
    .from('domains')
    .select('*, departments(name, code)')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <PortailClient
      departments={departments || []}
      totalEmployees={stats || 0}
      allDomains={domains || []}
    />
  );
}
```

**Composant client (PortailClient)** :
- Convertir le HTML du portail en composant React/TSX
- Garder EXACTEMENT le même design (couleurs CMR, gradients, animations)
- Utiliser Tailwind CSS 4 + shadcn/ui
- Font : Inter, Icons : Font Awesome 6.5.1 (ou Lucide si FA non disponible)
- Header fixe avec barre tricolore CMR, logo, recherche, dropdown compte
- Stats : 8 départements, 31 domaines, X employés
- Grille de 8 cartes départements (expandables avec leurs domaines)
- Grille de 31 cartes domaines (comme dans le HTML)
- Recherche globale (Ctrl+K)
- Toast notifications

### 4.2 Design System (variables CSS)
```css
/* Dans globals.css ou layout.tsx */
:root {
  --cmr-green: #007a33;
  --cmr-red: #ce1126;
  --cmr-gold: #fcd116;
  --dark: #0a1628;
  --text: #1e293b;
  --muted: #64748b;
  --border: #e2e8f0;
  --bg: #f1f5f9;
}
```

### ✅ Vérification Phase 4
```bash
# Après déploiement
curl -s https://admina-rh.supdgeorgyfr.workers.dev/ | head -c 500
# Doit contenir le HTML du portail (pas une page vide ou erreur)
```

**Commit Phase 4 :** `git add -A && git commit -m "Phase 4: Portail navigation avec 8 depts + 31 domaines" && git push`

---

## PHASE 5 — PAGE /MON-COMPTE (30 min)

### 5.1 Créer la route /mon-compte

**Fichier : `src/app/mon-compte/page.tsx`**

Cette page doit contenir un formulaire COMPLET avec 4 onglets :

1. **Profil** : Nom, Prénom, Email (lecture seule), Téléphone, Adresse, Photo
2. **Sécurité** : Changement mot de passe (ancien + nouveau + confirmation), 2FA toggle
3. **Historique** : Tableau des 20 dernières connexions (date, IP, user agent, succès/échec)
4. **Préférences** : Langue (fr/en), Thème (light/dark), Notifications email/push

Chaque onglet doit avoir :
- Des champs de formulaire fonctionnels (input, select, toggle)
- Un bouton "Enregistrer" qui fait un POST/PUT vers l'API correspondante
- Des validations (Zod)
- Des messages de succès/erreur (toast)

### 5.2 API associées

**Fichier : `src/app/api/profile/route.ts`** (GET/PUT profil)
**Fichier : `src/app/api/profile/change-password/route.ts`** (POST changement mdp)
**Fichier : `src/app/api/profile/preferences/route.ts`** (GET/PUT préférences)
**Fichier : `src/app/api/profile/history/route.ts`** (GET historique connexions)

### ✅ Vérification Phase 5
```bash
curl -s https://admina-rh.supdgeorgyfr.workers.dev/mon-compte | head -c 500
# Doit contenir des <input>, <form>, des labels en français
# Compter : au moins 10 input/select/toggle, au moins 2 boutons submit
```

**Commit Phase 5 :** `git add -A && git commit -m "Phase 5: Page /mon-compte avec 4 onglets fonctionnels" && git push`

---

## PHASE 6 — SÉCURITÉ & DONNÉES DE DÉMO (20 min)

### 6.1 Créer le super_admin
```bash
# Via Supabase Management API (nécessite la NOUVELLE clé service_role)
curl -X POST 'https://aywwakllgvfoqlpowzqf.supabase.co/auth/v1/admin/users' \
  -H "Authorization: Bearer <NOUVELLE_CLE_SERVICE_ROLE>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admina-rh.demo",
    "password": "Admin@2024_Securise!",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Dr. Fotso Kamga",
      "tenant_id": "a0000000-0000-0000-0000-000000000001"
    }
  }'
```

Puis assigner le rôle super_admin :
```sql
UPDATE public.user_roles
SET role_id = (SELECT id FROM public.roles WHERE name = 'super_admin')
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'admin@admina-rh.demo');
```

### 6.2 Seeder des employés de démo (15-20 lignes)
```sql
-- Insertion d'employés de démonstration
INSERT INTO public.employees (tenant_id, matricule, civilite, nom, prenom, genre, email, telephone, department_id, type_contrat, date_embauche, salaire_brut, lieu_travail, statut) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0001', 'M', 'Fotso', 'Kamga', 'M', 'k.fotso@admina-rh.demo', '+237 6XX XX XX 01', (SELECT id FROM public.departments WHERE code='DEP5'), 'CDI', '2020-03-15', 850000, 'Douala', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0002', 'M', 'Nkoulou', 'Mbarga', 'M', 'm.nkoulou@admina-rh.demo', '+237 6XX XX XX 02', (SELECT id FROM public.departments WHERE code='DEP1'), 'CDI', '2021-01-10', 650000, 'Douala', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0003', 'Mme', 'Ngassa', 'Tchinda', 'F', 'n.tchinda@admina-rh.demo', '+237 6XX XX XX 03', (SELECT id FROM public.departments WHERE code='DEP2'), 'CDI', '2019-06-01', 720000, 'Yaoundé', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0004', 'M', 'Eyenga', 'Nkotto', 'M', 'e.nkotto@admina-rh.demo', '+237 6XX XX XX 04', (SELECT id FROM public.departments WHERE code='DEP3'), 'CDD', '2023-09-01', 480000, 'Douala', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0005', 'Mme', 'Mvondo', 'Ze', 'F', 'm.ze@admina-rh.demo', '+237 6XX XX XX 05', (SELECT id FROM public.departments WHERE code='DEP4'), 'CDI', '2020-11-20', 580000, 'Douala', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0006', 'M', 'Aboya', 'Meyong', 'M', 'a.meyong@admina-rh.demo', '+237 6XX XX XX 06', (SELECT id FROM public.departments WHERE code='DEP6'), 'CDI', '2022-02-14', 550000, 'Douala', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0007', 'Mme', 'Biye', 'Elong', 'F', 'b.elong@admina-rh.demo', '+237 6XX XX XX 07', (SELECT id FROM public.departments WHERE code='DEP7'), 'CDI', '2021-07-01', 680000, 'Yaoundé', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0008', 'M', 'Ngo', 'Mbane', 'M', 'n.mbane@admina-rh.demo', '+237 6XX XX XX 08', (SELECT id FROM public.departments WHERE code='DEP8'), 'CDI', '2018-04-01', 900000, 'Douala', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0009', 'Mme', ' Ndongo', 'Samba', 'F', 'n.samba@admina-rh.demo', '+237 6XX XX XX 09', (SELECT id FROM public.departments WHERE code='DEP1'), 'CDD', '2024-01-15', 420000, 'Douala', 'actif'),
  ('a0000000-0000-0000-0000-000000000001', 'EMP-0010', 'M', 'Tchoumi', 'Nganou', 'M', 't.nganou@admina-rh.demo', '+237 6XX XX XX 10', (SELECT id FROM public.departments WHERE code='DEP2'), 'CDI', '2019-09-01', 760000, 'Douala', 'actif');
```

### ✅ Vérification Phase 6
```sql
SELECT COUNT(*) AS nb_employees FROM public.employees;
-- Résultat attendu : >= 10

SELECT email FROM public.employees LIMIT 5;
-- Tous doivent être en @admina-rh.demo (PAS @hotel.com)

SELECT p.full_name, r.name AS role FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
JOIN public.roles r ON r.id = ur.role_id
WHERE p.email = 'admin@admina-rh.demo';
-- Résultat attendu : Dr. Fotso Kamga | super_admin
```

**Commit Phase 6 :** `git add -A && git commit -m "Phase 6: Securite + donnees demo + super_admin" && git push`

---

## PHASE 7 — DÉPLOIEMENT CLOUDFLARE (15 min)

### 7.1 Build et déploiement
```bash
cd /path/to/Admina_RH

# Build
npm run build  # ou bun run build

# Déployer sur Cloudflare Workers
npx wrangler deploy

# OU si utilisation de @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static
```

### 7.2 Vérifier le déploiement
```bash
BASE=https://admina-rh.supdgeorgyfr.workers.dev

# Page principale
curl -s -o /dev/null -w "%{http_code}" $BASE/
# Attendu : 200

# Routes API
curl -s -o /dev/null -w "%{http_code}" $BASE/api/departments
# Attendu : 200
curl -s -o /dev/null -w "%{http_code}" $BASE/api/domains
# Attendu : 200
curl -s -o /dev/null -w "%{http_code}" $BASE/api/roles
# Attendu : 200
curl -s -o /dev/null -w "%{http_code}" $BASE/api/tenants
# Attendu : 200
curl -s -o /dev/null -w "%{http_code}" $BASE/api/employees
# Attendu : 200
curl -s -o /dev/null -w "%{http_code}" $BASE/api/audit-logs
# Attendu : 200
curl -s -o /dev/null -w "%{http_code}" $BASE/api/settings
# Attendu : 200
curl -s -o /dev/null -w "%{http_code}" $BASE/api/auth/register
# Attendu : 200 (POST)
curl -s -o /dev/null -w "%{http_code}" $BASE/api/auth/session
# Attendu : 200

curl -s -o /dev/null -w "%{http_code}" $BASE/mon-compte
# Attendu : 200

# Vérifier le contenu des réponses
curl -s $BASE/api/departments | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Départements: {len(d.get(\"departments\",[]))}')"
# Attendu : Départements: 8

curl -s $BASE/api/domains | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Domaines: {len(d.get(\"domains\",[]))}')"
# Attendu : Domaines: 31

curl -s $BASE/api/roles | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Rôles: {len(d.get(\"roles\",[]))}')"
# Attendu : Rôles: 7
```

---

## PHASE 8 — VÉRIFICATION FINALE & RAPPORT (15 min)

### 8.1 Check-list de conformité

Exécuter CHAQUE vérification et noter le résultat (✅/❌) :

**SUPABASE :**
```sql
-- 1. Nombre total de tables
SELECT COUNT(*) AS total_tables FROM information_schema.tables 
  WHERE table_schema = 'public';
-- ✅ Attendu : >= 13

-- 2. Tables avec RLS
SELECT tablename, rowsecurity FROM pg_tables 
  WHERE schemaname = 'public' ORDER BY tablename;
-- ✅ Attendu : toutes avec rowsecurity = true

-- 3. Nombre de politiques RLS
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- ✅ Attendu : >= 20

-- 4. Triggers actifs
SELECT COUNT(*) FROM information_schema.triggers 
  WHERE event_object_schema = 'public';
-- ✅ Attendu : >= 6

-- 5. Fonctions SQL
SELECT routine_name FROM information_schema.routines 
  WHERE routine_schema = 'public';
-- ✅ Attendu : update_updated_at, handle_new_user

-- 6. Données de départements
SELECT COUNT(*) FROM public.departments;
-- ✅ Attendu : 8

-- 7. Données de domaines
SELECT COUNT(*) FROM public.domains;
-- ✅ Attendu : 31

-- 8. Données d'employés (emails neutralisés)
SELECT COUNT(*), COUNT(CASE WHEN email LIKE '%@admina-rh.demo' THEN 1 END) AS emails_ok
FROM public.employees;
-- ✅ Attendu : tous les emails en @admina-rh.demo

-- 9. Aucun mot de passe en clair
SELECT column_name FROM information_schema.columns 
  WHERE table_schema = 'public' AND column_name LIKE '%password%';
-- ✅ Attendu : 0 (pas de colonne password dans les tables public)

-- 10. Rôles système
SELECT name, level FROM public.roles ORDER BY level DESC;
-- ✅ Attendu : 7 rôles de super_admin(100) à viewer(5)
```

**CLOUDFLARE :**
```bash
BASE=https://admina-rh.supdgeorgyfr.workers.dev

# 11. Page principale (200)
curl -s -o /dev/null -w "%{http_code}\n" $BASE/

# 12. /mon-compte (200, contient des inputs)
curl -s $BASE/mon-compte | grep -c 'input\|form\|button'

# 13. /api/departments (200, 8 items)
curl -s $BASE/api/departments

# 14. /api/domains (200, 31 items)
curl -s $BASE/api/domains

# 15. /api/roles (200, 7 items)
curl -s $BASE/api/roles

# 16. /api/tenants (200)
curl -s $BASE/api/tenants

# 17. /api/employees (200)
curl -s $BASE/api/employees

# 18. /api/audit-logs (200)
curl -s $BASE/api/audit-logs

# 19. /api/settings (200)
curl -s $BASE/api/settings

# 20. /api/auth/register (POST, 201)
curl -s -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","full_name":"Test User"}'

# 21. /api/auth/session (GET)
curl -s $BASE/api/auth/session

# 22. /api/auth/forgot-password (POST)
curl -s -X POST $BASE/api/auth/forgot-password -H "Content-Type: application/json" \
  -d '{"email":"admin@admina-rh.demo"}'

# 23. /api/auth/reset-password (POST)
curl -s -X POST $BASE/api/auth/reset-password -H "Content-Type: application/json" \
  -d '{"token":"test","new_password":"NewPass123!"}'
```

### 8.2 Générer le rapport de conformité

Créer un fichier `RAPPORT_V4_EXECUTION_2026-08-07.md` avec :
- Tableau des 23 vérifications (✅/❌ avec preuve)
- Score global : X/23 (pourcentage)
- Détail des items en échec avec cause
- Instructions de correction pour chaque échec

---

## RÉSUMÉ DES LIVRABLES PAR PHASE

| Phase | Description | Supabase | Cloudflare | Fichiers |
|-------|-------------|----------|------------|----------|
| 0 | Prérequis | Nettoyage tables | Regénération clé | - |
| 1 | Auth + Users | 8 tables + RLS + triggers + 7 rôles | - | SQL Editor |
| 2 | Tenants + Depts + Domains | 4 tables + 8 depts + 31 domains | - | SQL Editor |
| 3 | Routes API | - | 11 routes fonctionnelles | 11 route.ts |
| 4 | Portail Navigation | - | Page / avec portail | page.tsx + PortailClient.tsx |
| 5 | Page /mon-compte | - | 4 onglets fonctionnels | mon-compte/ + 4 API |
| 6 | Sécurité + Demo | 10+ employés + super_admin | - | SQL + curl |
| 7 | Déploiement | - | Build + deploy | - |
| 8 | Vérification | 10 checks SQL | 13 checks curl | Rapport |

---

## CRITÈRES DE RÉUSSITE

Le déploiement est considéré RÉUSSI si :
- [ ] **≥ 13 tables** créées dans Supabase public
- [ ] **≥ 20 politiques RLS** actives
- [ ] **8 départements** et **31 domaines** en base
- [ ] **≥ 10 employés** de démo avec emails @admina-rh.demo
- [ ] **≥ 10 routes API** retournent 200 (pas 404)
- [ ] **Page /** affiche le portail avec les 8 départements
- [ ] **Page /mon-compte** contient des formulaires fonctionnels
- [ ] **0 mot de passe en clair** dans les tables
- [ ] **super_admin** créé avec rôle assigné
- [ ] Score global **≥ 80% (≥ 18/23 checks passent)**

---
*Prompt V4 — Généré le 2026-08-07 — Basé sur l'audit d'écart (score 4.4%) et le portail HTML de référence*
