# PROMPT DE CORRECTION — Admina_RH
## Base de donnees Supabase & Gestion des Comptes
### ISO 30201:2026 — Execution Autonome

---

## CONTEXTE GENERAL

**Projet** : Admina_RH — SaaS RH multi-tenant camerounais conforme ISO 30201:2026  
**Stack** : Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui + Zod + Supabase + Cloudflare Workers  
**GitHub** : `georgyfr/Admina_RH`, branche `main`  
**Site live** : `https://admina-rh.supdgeorgyfr.workers.dev`  
**Supabase** : Project ref `aywwakllgvfoqlpowzqf`, schema `admina_rh`  
**Design** : Couleurs CMR (vert `#007a33`, rouge `#ce1126`, or `#fcd116`), police Inter, Font Awesome 6.5.1  
**Structure metier** : 8 departements, 31 domaines, 347 employes (donnees de demonstration)  

---

## ETAT ACTUEL — RESULTATS D'AUDIT

### 2. Base de donnees Supabase — 3% conforme

| Metrique | Valeur |
|---|---|
| Tables creees | 17 sur ~620 attendues |
| Domaines couverts | 1 sur 31 (uniquement D02) |
| Table users (auth) | N'EXISTE PAS |
| Table tenants (multi-tenancy) | N'EXISTE PAS |
| Tables d02_* | 14 tables (seul domaine partiellement migre) |
| Tables de reference | 3 (employees, ref_departments, ref_positions) |

### 3. Gestion des Comptes — 0% fonctionnel (Score global 27/100)

| Fonction | Statut | Detail |
|---|---|---|
| Login | ECHEC | Toujours 401, aucun user en DB |
| Inscription | ECHEC | 200 mais donnees non persistees |
| /mon-compte | ECHEC | 307 redirect vers /login |
| Avatar/dropdown | ECHEC | Bouton "A" decoratif |
| Changement mdp | ECHEC | Non implemente |
| Historique | ECHEC | Non implemente |

---

## STRUCTURE DE REFERENCE — 8 DEPARTEMENTS / 31 DOMAINES

### Departement 1 : Administration Generale du Personnel
- D01 : Gestion de l'Organisation Administrative
- D02 : Gestion Administrative du Personnel
- D04 : Gestion du Temps
- D05 : Gestion des Salaires
- D12 : Administration du Personnel
- D21 : Classification et Cartographie des Emplois
- D23 : Organigramme
- D24 : Gestion des Effectifs

### Departement 2 : Gestion Previsionnelle des Emplois
- D03 : Gestion Previsionnelle des Emplois et des Competences
- D06 : Gestion des Deplacements
- D07 : Gestion de la Paie
- D08 : Gestion des Prestations Sociales

### Departement 3 : Developpement des Competences
- D09 : Formation et Developpement des Competences
- D10 : Gestion des Carrieres
- D11 : Gestion de la Mobilite Interne
- D13 : Gestion des Talents
- D14 : Gestion du Savoir

### Departement 4 : Remuneration et Avantages
- D15 : Gestion de la Remuneration Globale
- D16 : Gestion des Avantages Sociaux
- D17 : Gestion de la Retraite
- D18 : Gestion de l'Impot sur le Revenu

### Departement 5 : Relations Professionnelles
- D19 : Gestion des Relations de Travail
- D20 : Gestion de la Discipline
- D22 : Gestion des Conflits
- D25 : Gestion des Syndicats

### Departement 6 : Sante, Securite et Conditions de Travail
- D26 : Gestion de la Sante au Travail
- D27 : Gestion de la Securite au Travail
- D28 : Gestion des Conditions de Travail

### Departement 7 : Systemes d'Information RH
- D29 : Gestion du Systeme d'Information RH
- D30 : Gestion des Donnees RH

### Departement 8 : Pilotage et Audit RH
- D31 : Pilotage de la Fonction RH
- D32 : Audit RH

---

## PHASE 0 — PRE-REQUIS ET VERIFICATIONS

### 0.1 Verifier la connexion Supabase

```typescript
// Fichier : src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### 0.2 Verifier les variables d'environnement

```bash
# .env.local (VERIFIER QUE CES VARIABLES EXISTENT)
NEXT_PUBLIC_SUPABASE_URL=https://aywwakllgvfoqlpowzqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<cle_anon_publique>
SUPABASE_SERVICE_ROLE_KEY=<cle_service_role_privee>
NEXTAUTH_SECRET=<secret_pour_jwt>
NEXTAUTH_URL=https://admina-rh.supdgeorgyfr.workers.dev
```

### 0.3 Lister toutes les tables existantes (script de verification)

```sql
-- Executer dans Supabase SQL Editor
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'admina_rh'
ORDER BY table_name;
```

**Attendu** : ce script doit retourner exactement les 17 tables suivantes :
`employees`, `ref_departments`, `ref_positions`, et 14 tables `d02_*`.  
**Action** : Si le resultat est different, documenter les ecarts.

---

## PHASE 1 — AUTHENTIFICATION ET USERS (P0 CRITIQUE)

### 1.1 Creer la table profiles

```sql
-- Migration : 001_create_profiles.sql
CREATE SCHEMA IF NOT EXISTS admina_rh;

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

-- Politique : un utilisateur peut lire son propre profil
CREATE POLICY "Users can view own profile"
  ON admina_rh.profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique : un utilisateur peut modifier son propre profil
CREATE POLICY "Users can update own profile"
  ON admina_rh.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 1.2 Creer les tables de gestion des comptes

```sql
-- Migration : 002_create_account_tables.sql

-- Roles utilisateurs
CREATE TABLE IF NOT EXISTS admina_rh.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL CHECK (role_name IN (
    'super_admin', 'admin', 'rh_manager', 'rh_officer',
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

-- Preferences utilisateur
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

-- Historique des connexions
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
CREATE POLICY "Users can view own login attempts" ON admina_rh.login_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Journal d'audit utilisateur
CREATE TABLE IF NOT EXISTS admina_rh.user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admina_rh.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.user_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit log" ON admina_rh.user_audit_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit log" ON admina_rh.user_audit_log
  FOR INSERT WITH CHECK (true);

-- Tokens de reset mot de passe
CREATE TABLE IF NOT EXISTS admina_rh.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Sessions utilisateur actives
CREATE TABLE IF NOT EXISTS admina_rh.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admina_rh.profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
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

### 1.3 Trigger post-signup pour auto-profil

```sql
-- Migration : 003_create_auth_trigger.sql

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

  -- Creer les preferences par defaut
  INSERT INTO admina_rh.user_preferences (user_id)
  VALUES (NEW.id);

  -- Logger la creation du compte
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

-- Trigger pour mettre a jour updated_at sur profile
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

### 1.4 Corriger l'API Route de Login

```typescript
// Fichier : src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe requis'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Logger la tentative echouee
      await supabase.from('login_attempts').insert({
        email,
        success: false,
        failure_reason: error.message,
      })
      return NextResponse.json(
        { error: 'Identifiants invalides', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      )
    }

    // Logger la connexion reussie
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    await supabase.from('login_attempts').insert({
      user_id: data.user.id,
      email,
      success: true,
      ip_address: ip || null,
      user_agent: request.headers.get('user-agent') || null,
    })

    // Mettre a jour le profil
    await supabase.from('profiles').update({
      last_sign_in_at: new Date().toISOString(),
    }).eq('id', data.user.id)

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
      session: { access_token: data.session?.access_token },
    })
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

### 1.5 Corriger l'API Route d'Inscription

```typescript
// Fichier : src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caracteres')
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

    // Verifier si l'email existe deja dans les profils
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
        emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/confirm`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, code: 'SIGNUP_FAILED' },
        { status: 400 }
      )
    }

    // Le trigger handle_new_user() a automatiquement cree le profil
    // Verifier que le profil existe bien
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // Fallback : creer manuellement le profil
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          first_name,
          last_name,
        })
      }
    }

    return NextResponse.json({
      message: 'Compte cree avec succes. Verifiez votre email.',
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

### 1.6 Implementer la page /mon-compte

```typescript
// Fichier : src/app/(dashboard)/mon-compte/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountProfile } from './AccountProfile'

export default async function MonComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, user_preferences(*)')
    .eq('id', user.id)
    .single()

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role_name, tenants(name)')
    .eq('user_id', user.id)

  const { data: loginHistory } = await supabase
    .from('login_attempts')
    .select('success, ip_address, user_agent, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <AccountProfile
      profile={profile}
      roles={roles || []}
      loginHistory={loginHistory || []}
    />
  )
}
```

---

## PHASE 2 — MULTI-TENANCY (P0 CRITIQUE)

### 2.1 Creer les tables multi-tenant

```sql
-- Migration : 010_create_tenants.sql

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
  created_by UUID REFERENCES admina_rh.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.tenants ENABLE ROW LEVEL SECURITY;

-- Liaison utilisateur-tenant
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
CREATE POLICY "Users can view own tenant memberships" ON admina_rh.tenant_users
  FOR SELECT USING (auth.uid() = user_id);

-- Modules actifs par tenant
CREATE TABLE IF NOT EXISTS admina_rh.tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL, -- ex: 'D02', 'D04', 'D09'
  module_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, module_code)
);
ALTER TABLE admina_rh.tenant_modules ENABLE ROW LEVEL SECURITY;

-- Abonnements
CREATE TABLE IF NOT EXISTS admina_rh.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  max_employees INT DEFAULT 10,
  max_departments INT DEFAULT 8,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admina_rh.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Tenant settings detaillees
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

-- Isolation des donnees par tenant
CREATE POLICY "Tenant isolation on employees" ON admina_rh.employees
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM admina_rh.tenant_users WHERE user_id = auth.uid()
  ));
```

### 2.2 Middleware multi-tenant

```typescript
// Fichier : src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Routes protegees
  const protectedPaths = ['/dashboard', '/mon-compte', '/admin', '/api/protected']
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Ajouter le tenant_id au header pour les routes API
  if (user) {
    const { data: membership } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single()

    if (membership) {
      supabaseResponse.headers.set('x-tenant-id', membership.tenant_id)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|register|api/auth).*)',
  ],
}
```

---

## PHASE 3 — MIGRATION BASE DE DONNEES (P1 MAJEUR)

### 3.1 Schema complet par domaine

**IMPORTANT** : Voici les tables attendues par domaine. Chaque domaine doit avoir entre 15 et 30 tables couvrant : entites principales, tables de liaison, tables de reference, tables d'historique, tables d'audit.

#### Domaine D01 - Gestion de l'Organisation Administrative (Dept 1)

```sql
CREATE TABLE admina_rh.d01_organizational_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES admina_rh.d01_organizational_units(id),
  unit_type TEXT NOT NULL CHECK (unit_type IN ('direction', 'departement', 'service', 'bureau', 'cellule')),
  head_id UUID REFERENCES admina_rh.employees(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

CREATE TABLE admina_rh.d01_unit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES admina_rh.d01_organizational_units(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'rename', 'move', 'merge', 'split', 'deactivate')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES admina_rh.profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Domaine D02 - Gestion Administrative du Personnel (Dept 1)

```sql
-- Tables deja existantes (14 tables d02_*) - a verifier et completer :
-- d02_employees, d02_contracts, d02_assignments, d02_documents,
-- d02_employments, d02_civil_status, d02_identifications,
-- d02_emergency_contacts, d02_qualifications, d02_experiences,
-- d02_languages, d02_references, d02_dependents, d02_notes
-- Plus les tables manquantes :

CREATE TABLE IF NOT EXISTS admina_rh.d02_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id),
  doc_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admina_rh.d02_employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id),
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_kb INT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES admina_rh.profiles(id),
  expires_at DATE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admina_rh.d02_contract_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id),
  contract_id UUID REFERENCES admina_rh.d02_contracts(id),
  change_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES admina_rh.profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Domaines D03-D32 — Pattern de generation

**Pour chaque domaine D03 a D32, appliquer le pattern suivant :**

1. **Table principale** : `dXX_<entite_principale>` (ex: `d03_skills_inventory`)
2. **Table de categorisation** : `dXX_<entite>_categories`
3. **Table de liaison** : `dXX_<entite>_<entite_rel>` (many-to-many)
4. **Table historique** : `dXX_<entite>_history`
5. **Table de reference** : `ref_dXX_<concept>`
6. **Tables specifiques** selon le metier du domaine

**Exemple pour D03 - Gestion Previsionnelle des Emplois :**

```sql
CREATE TABLE admina_rh.d03_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id),
  job_code TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_family TEXT,
  job_level TEXT CHECK (job_level IN ('A1','A2','B1','B2','B3','C1','C2','D1')),
  department_id UUID REFERENCES admina_rh.d01_organizational_units(id),
  min_salary DECIMAL(12,2),
  max_salary DECIMAL(12,2),
  required_qualifications JSONB DEFAULT '[]',
  required_skills JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admina_rh.d03_skills_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id),
  skill_code TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('debutant','intermediaire','avance','expert')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admina_rh.d03_employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES admina_rh.employees(id),
  skill_id UUID NOT NULL REFERENCES admina_rh.d03_skills_inventory(id),
  proficiency_level TEXT CHECK (proficiency_level IN ('1','2','3','4','5')),
  acquired_date DATE,
  expires_date DATE,
  certified BOOLEAN DEFAULT false,
  UNIQUE(employee_id, skill_id)
);

CREATE TABLE admina_rh.d03_workforce_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id),
  forecast_period TEXT NOT NULL,
  department_id UUID REFERENCES admina_rh.d01_organizational_units(id),
  current_headcount INT DEFAULT 0,
  projected_headcount INT DEFAULT 0,
  gap INT GENERATED ALWAYS AS (projected_headcount - current_headcount) STORED,
  actions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','approved','implemented','archived')),
  created_by UUID REFERENCES admina_rh.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Script de migration complet

**Ordre d'execution des migrations :**

``n
001_create_profiles.sql
002_create_account_tables.sql
003_create_auth_trigger.sql
004_create_tenants.sql
005_create_tenant_tables.sql
006_update_existing_tables_add_tenant_id.sql
007_create_d01_tables.sql
008_verify_and_complete_d02_tables.sql
009_create_d03_tables.sql
010_create_d04_tables.sql
011_create_d05_tables.sql
012_create_d06_tables.sql
013_create_d07_tables.sql
014_create_d08_tables.sql
015_create_d09_tables.sql
016_create_d10_tables.sql
017_create_d11_tables.sql
018_create_d12_tables.sql
019_create_d13_tables.sql
020_create_d14_tables.sql
021_create_d15_tables.sql
022_create_d16_tables.sql
023_create_d17_tables.sql
024_create_d18_tables.sql
025_create_d19_tables.sql
026_create_d20_tables.sql
027_create_d21_tables.sql
028_create_d22_tables.sql
029_create_d23_tables.sql
030_create_d24_tables.sql
031_create_d25_tables.sql
032_create_d26_tables.sql
033_create_d27_tables.sql
034_create_d28_tables.sql
035_create_d29_tables.sql
036_create_d30_tables.sql
037_create_d31_tables.sql
038_create_d32_tables.sql
039_create_rls_policies_all.sql
040_seed_reference_data.sql
041_seed_demo_data.sql
042_create_indexes.sql
043_create_views.sql
044_verify_migration.sql
```

### 3.3 Donnees de reference obligatoires

```sql
-- Migration : 040_seed_reference_data.sql

-- Departements de reference
INSERT INTO admina_rh.ref_departments (code, name, description) VALUES
('D01', 'Administration Generale du Personnel', 'Gestion administrative globale du personnel'),
('D02', 'Gestion Administrative du Personnel', 'Gestion des dossiers individuels'),
('D03', 'Gestion Previsionnelle des Emplois', 'Planification et prevision des effectifs'),
('D04', 'Gestion du Temps', 'Pointage, conges et absences'),
('D05', 'Gestion des Salaires', 'Administration de la remuneration'),
('D06', 'Gestion des Deplacements', 'Missions et deplacements professionnels'),
('D07', 'Gestion de la Paie', 'Traitement de la paie mensuelle'),
('D08', 'Gestion des Prestations Sociales', 'CNPS, assurances, mutuelles'),
('D09', 'Formation et Developpement', 'Plans de formation et competences'),
('D10', 'Gestion des Carrieres', 'Avancements et promotions'),
('D11', 'Gestion de la Mobilite Interne', 'Mutations et reclassements'),
('D12', 'Administration du Personnel', 'Actes administratifs'),
('D13', 'Gestion des Talents', 'Identification et developpement des talents'),
('D14', 'Gestion du Savoir', 'Capitalisation des connaissances'),
('D15', 'Gestion de la Remuneration Globale', 'Politique de remuneration'),
('D16', 'Gestion des Avantages Sociaux', 'Avantages en nature et sociaux'),
('D17', 'Gestion de la Retraite', 'Preparation et gestion de la retraite'),
('D18', 'Gestion de l Impot sur le Revenu', 'Impots et deductions'),
('D19', 'Gestion des Relations de Travail', 'Conventions collectives et negocations'),
('D20', 'Gestion de la Discipline', 'Procedures disciplinaires'),
('D21', 'Classification et Cartographie des Emplois', 'Grades et classifications'),
('D22', 'Gestion des Conflits', 'Mediation et resolution'),
('D23', 'Organigramme', 'Structure organisationnelle'),
('D24', 'Gestion des Effectifs', 'Prevision et gestion des effectifs'),
('D25', 'Gestion des Syndicats', 'Relations syndicales'),
('D26', 'Gestion de la Sante au Travail', 'Medecine du travail'),
('D27', 'Gestion de la Securite au Travail', 'Hygiene et securite'),
('D28', 'Gestion des Conditions de Travail', 'Environnement de travail'),
('D29', 'Gestion du Systeme d Information RH', 'Outils et systemes SI'),
('D30', 'Gestion des Donnees RH', 'Qualite et gouvernance des donnees'),
('D31', 'Pilotage de la Fonction RH', 'Tableaux de bord et KPI'),
('D32', 'Audit RH', 'Audit interne et conformite');

-- Types de contrats camerounais
INSERT INTO admina_rh.ref_contract_types (code, label, description) VALUES
('CDI', 'Contrat a Duree Indeterminee', 'Contrat permanent sans date de fin'),
('CDD', 'Contrat a Duree Determinee', 'Contrat avec date de fin definie'),
('CCTT', 'Contrat de Travail a Temps Partiel', 'Contrat avec horaire reduit'),
('STAGE', 'Contrat de Stage', 'Stage professionnel ou academique'),
('INTERIM', 'Contrat d Interim', 'Mission temporaire via agence'),
('CONSULTANT', 'Contrat de Consultation', 'Prestation de service');

-- Positions de reference
INSERT INTO admina_rh.ref_positions (code, title, category, level) VALUES
('DG', 'Directeur General', 'Direction', 'A1'),
('DD', 'Directeur de Departement', 'Direction', 'A2'),
('CS', 'Chef de Service', 'Encadrement', 'B1'),
('CB', 'Chef de Bureau', 'Encadrement', 'B2'),
('CE', 'Chef de Cellule', 'Encadrement', 'B3'),
('EM-A', 'Employe Cadre', 'Execution', 'C1'),
('EM-B', 'Employe Qualifie', 'Execution', 'C2'),
('EM-C', 'Employe Non Qualifie', 'Execution', 'D1');
```

---

## PHASE 4 — GESTION DES COMPTES FRONTEND (P2)

### 4.1 Avatar fonctionnel avec upload

```typescript
// Fichier : src/components/account/AvatarUpload.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface AvatarUploadProps {
  userId: string
  currentAvatar?: string | null
  displayName?: string
  onUpload: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatar, displayName, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`

    setUploading(true)
    const { error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      await supabase.from('profiles').update({
        avatar_url: publicUrl,
      }).eq('id', userId)

      onUpload(publicUrl)
    }
    setUploading(false)
  }

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentAvatar || undefined} alt={displayName} />
        <AvatarFallback className="bg-[#007a33] text-white text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="avatar-upload"
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          disabled={uploading}
        >
          {uploading ? 'Chargement...' : 'Changer la photo'}
        </Button>
      </div>
    </div>
  )
}
```

### 4.2 Dropdown utilisateur

```typescript
// Fichier : src/components/layout/UserDropdown.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserDropdown({
  userId, email, displayName, avatarUrl
}: {
  userId: string
  email: string
  displayName: string
  avatarUrl?: string | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = displayName
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-[#007a33] text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/mon-compte">Mon Compte</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mon-compte?tab=security">Securite</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mon-compte?tab=history">Historique</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          Se deconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 4.3 Changement de mot de passe

```typescript
// Fichier : src/app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8)
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

    const body = await request.json()
    const { current_password, new_password } = changePasswordSchema.parse(body)

    // Verifier le mot de passe actuel
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password,
    })
    if (verifyError) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      )
    }

    // Mettre a jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    // Logger le changement
    await supabase.from('user_audit_log').insert({
      user_id: user.id,
      action: 'PASSWORD_CHANGED',
      entity_type: 'profile',
      entity_id: user.id,
    })

    return NextResponse.json({ message: 'Mot de passe mis a jour avec succes' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Donnees invalides', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

---

## PHASE 5 — VERIFICATION ET TESTS

### 5.1 Tests unitaires

```typescript
// Fichier : src/__tests__/auth/login.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

describe('POST /api/auth/login', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('retourne 401 pour identifiants invalides', async () => {
    const mockSupabase = {
      auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } }) },
      from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({}) }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
    })
    const res = await loginPOST(req as any)
    expect(res.status).toBe(401)
  })

  it('retourne 200 et session pour identifiants valides', async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'uuid-1', email: 'test@test.com' },
            session: { access_token: 'token-123' },
          },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'Password1' }),
    })
    const res = await loginPOST(req as any)
    expect(res.status).toBe(200)
  })
})
```

### 5.2 Script de verification de conformite

```sql
-- Migration : 044_verify_migration.sql

-- Verifier le nombre total de tables
SELECT 'Tables totales' AS metric,
  COUNT(*) AS value,
  CASE WHEN COUNT(*) >= 600 THEN 'OK' ELSE 'ECHEC' END AS status
FROM information_schema.tables
WHERE table_schema = 'admina_rh';

-- Verifier les tables par domaine
SELECT
  SUBSTRING(table_name FROM 1 FOR 3) AS domaine,
  COUNT(*) AS tables_count,
  CASE WHEN COUNT(*) >= 10 THEN 'OK' ELSE 'INSUFFISANT' END AS status
FROM information_schema.tables
WHERE table_schema = 'admina_rh' AND table_name ~ '^d[0-9]+'
GROUP BY SUBSTRING(table_name FROM 1 FOR 3)
ORDER BY domaine;

-- Verifier que les tables critiques existent
SELECT 'Tables critiques' AS check_type,
  STRING_AGG(table_name, ', ' ORDER BY table_name) AS manquantes
FROM (
  SELECT unnest(ARRAY[
    'profiles', 'tenants', 'tenant_users', 'tenant_modules',
    'tenant_subscriptions', 'tenant_settings', 'user_roles',
    'user_preferences', 'login_attempts', 'user_audit_log',
    'password_reset_tokens', 'user_sessions'
  ]) AS table_name
) t
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'admina_rh' AND table_name = t.table_name
);

-- Verifier RLS
SELECT 'RLS active' AS check_type,
  tablename,
  CASE WHEN rowsecurity THEN 'OK' ELSE 'MANQUANT' END AS status
FROM pg_tables
WHERE schemaname = 'admina_rh'
ORDER BY tablename;

-- Verifier le trigger auth
SELECT 'Trigger auth' AS check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

---

## RAPPORT D'AUDIT FINAL — FORMAT ATTENDU

A la fin de l'execution, vous DEVEZ produire un rapport d'audit contenant :

### Structure du rapport :

1. **Resume Executif**
   - Score global avant correction : 27/100
   - Score global apres correction : [a calculer]
   - Nombre de tables creees : [nombre]
   - Fonctionnalites restaurees : [liste]

2. **Metriques par Phase**
   | Phase | Description | Avant | Apres | Statut |
   |---|---|---|---|---|
   | P0-Auth | Authentification | 0% | [?]% | [OK/ECHEC] |
   | P0-Tenant | Multi-tenancy | 0% | [?]% | [OK/ECHEC] |
   | P1-DB | Base de donnees | 3% | [?]% | [OK/ECHEC] |
   | P2-UI | Gestion comptes UI | 0% | [?]% | [OK/ECHEC] |

3. **Tests Executes**
   - Login : [PASS/FAIL]
   - Inscription : [PASS/FAIL]
   - /mon-compte : [PASS/FAIL]
   - Avatar upload : [PASS/FAIL]
   - Changement mdp : [PASS/FAIL]
   - Multi-tenancy isolation : [PASS/FAIL]
   - RLS policies : [PASS/FAIL]

4. **Liste des fichiers modifies/crees**
   - Chemins complets et descriptions

5. **Problemes connus et limitations**
   - Ce qui n'a pas pu etre corrige et pourquoi

6. **Seuils de conformite**
   - Score global >= 80/100 pour validation
   - Toutes les tables critiques doivent exister
   - Toutes les fonctions P0 doivent etre operationnelles
   - RLS actif sur 100% des tables sensibles

---

## NOTES IMPORTANTES

- **Ordre d'execution** : Les phases doivent etre executees dans l'ordre (P0 avant P1 avant P2)
- **Tenant ID** : Toutes les tables metier DOIVENT avoir une colonne `tenant_id UUID NOT NULL REFERENCES admina_rh.tenants(id)`
- **RLS** : TOUTES les tables doivent avoir Row Level Security active
- **Timestamps** : TOUTES les tables doivent avoir `created_at TIMESTAMPTZ DEFAULT NOW()` et `updated_at TIMESTAMPTZ DEFAULT NOW()`
- **Soft delete** : Utiliser `is_active BOOLEAN DEFAULT true` au lieu de DELETE physique
- **Audit trail** : Les tables critiques doivent avoir une table `_history` correspondante
- **ISO 30201:2026** : Chaque domaine doit pouvoir tracer les actions (qui, quand, quoi, pourquoi)
