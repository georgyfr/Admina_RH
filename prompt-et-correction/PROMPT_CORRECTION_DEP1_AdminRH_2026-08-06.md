# PROMPT DE CORRECTION GLOBAL — ADMINA-RH DEPARTEMENT 1 + GESTION DU COMPTE

## Admina_RH — SaaS RH Multi-Tenant Camerounais
## Conforme ISO 30201:2026 — Correction Post-Audit 2026-08-06

---

## 0. RESUME EXECUTIF DE L'AUDIT

L'audit du 2026-08-06 a revele un score de conformite globale du **Departement 1 a 8%** (specifie a 86%).
L'integration recente de Supabase Auth a ete detectee (supabase-js 2.112.0 + supabase-ssr 0.12.4 dans les bundles),
mais la cle API est invalide, rendant le site **entierement inaccessible**.

### 10 erreurs a corriger

| Code | Erreur | Severite | Statut | Action
|------|--------|----------|--------|--------|
| ERR-01 | Cle API Supabase invalide → signup 400 | CRITIQUE | Bloquant | Section 1
| ERR-02 | Middleware bloque TOUT (redirect login) | CRITIQUE | Bloquant | Section 1
| ERR-03 | Aucun code source dans le repo GitHub | MAJEUR | Structure | Section 2
| ERR-04 | Domaine 1 (Recrutement) = 0% | MAJEUR | Fonctionnel | Section 3
| ERR-05 | Domaines D4/D12/D21/D23/D24 = 0% | MAJEUR | Fonctionnel | Section 4
| ERR-06 | 13 API routes manquantes (404) | MAJEUR | Backend | Section 5
| ERR-07 | 20 manuels de procedure manquants | MOYEN | Documentation | Section 6
| ERR-08 | Meta description "secteur hotelier" | MINEUR | SEO | Section 7
| ERR-09 | D5 sous /domaine-2/ au lieu de /domaine-5/ | MOYEN | Architecture | Section 8
| ERR-10 | RLS policies generiques (51 policies) | MAJEUR | Securite | Section 9

### Module transversal obligatoire
| Module | Statut actuel | Action |
|--------|--------------|--------|
| **Gestion du Compte** | 0/12 composants, 0% | **Section 10 — PRIORITE ABSOLUE** |

---

## 1. CORRECTION CRITIQUE — AUTH SUPABASE + MIDDLEWARE (ERR-01, ERR-02)

### 1.1 Diagnostic

- **Preuve** : `POST https://aywwakllgvfoqlpowzqf.supabase.co/auth/v1/signup` retourne `400 "Invalid API key"`
- **Cause probable** : La variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans le code deploye contient une cle incorrecte, expiree, ou correspond a un autre projet Supabase
- **Consequence** : L'inscription echoue silencieusement, le login echoue, le middleware bloque toutes les pages

### 1.2 Actions correctives

#### 1.2.1 Recuperer les cles valides (MANUEL — Operateur requis)

```
1. Se connecter a https://supabase.com/dashboard/project/aywwakllgvfoqlpowzqf
2. Aller dans Settings > API
3. Copier :
   - Project URL : https://aywwakllgvfoqlpowzqf.supabase.co
   - Anon (public) Key : eyJhbGciOiJIUzI1NiIs... (commence par eyJ)
   - Service Role Key : (a garder secret, cote serveur uniquement)
4. Verifier que le projet n'est pas en pause (status actif)
5. Verifier que Authentication > Providers > Email est active
```

#### 1.2.2 Mettre a jour les variables d'environnement

```env
# .env.local (NE JAMAIS COMMITTER)
NEXT_PUBLIC_SUPABASE_URL=https://aywwakllgvfoqlpowzqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<COLLER_LA_CLE_ANON_VALIDE_ICI>
SUPABASE_SERVICE_ROLE_KEY=<COLLER_LA_CLE_SERVICE_ROLE_ICI>
```

#### 1.2.3 Corriger le deploiement Cloudflare Workers

```bash
# Si utilisation de wrangler:
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
# Saisir la cle anon valide quand demande

# Ou mettre a jour dans le dashboard Cloudflare :
# Workers & Pages > admina-rh > Settings > Variables and Secrets
# Ajouter/mettre a jour : NEXT_PUBLIC_SUPABASE_ANON_KEY
```

> **VERIFICATION** : Apres correction, tester `POST /auth/v1/signup` avec la nouvelle cle.
> Le code retour doit etre 200 (ou 422 si email deja pris), JAMAIS 400 "Invalid API key".

#### 1.2.4 Corriger le middleware (ERR-02)

Le middleware actuel redirige TOUTES les routes vers /login, y compris potentiellement les routes API.
Voici le middleware corrigé a implementer dans `src/middleware.ts` :

```typescript
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  const { data: { session } } = await supabase.auth.getSession()

  // Routes publiques (authentification)
  const publicRoutes = [
    '/login', '/register', '/forgot-password',
    '/reset-password', '/verify-email', '/auth/callback'
  ]
  const isPublicRoute = publicRoutes.some(r =>
    request.nextUrl.pathname.startsWith(r)
  )

  // Routes API (protegees par cle, pas par middleware)
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

  // Assets statiques (jamais proteges)
  const isStaticAsset = request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/admina-logo.png')

  // Ne pas intercepter les assets et les API
  if (isStaticAsset || isApiRoute) return supabaseResponse

  // Pas de session + route protegee -> redirect login
  if (!session && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Session active + route auth -> redirect vers l'app
  if (session && isPublicRoute &&
      !request.nextUrl.pathname.startsWith('/auth/callback')) {
    const url = request.nextUrl.clone()
    url.pathname = '/domaine-2'  // Page d'accueil par defaut apres login
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|admina-logo.png|api/).*)',
  ],
}
```

#### 1.2.5 Corriger le layout metadata (ERR-08)

Dans `src/app/layout.tsx`, corriger la meta description :

```typescript
// AVANT (incorrect) :
// "Solution SaaS de gestion RH pour le secteur hotelier au Cameroun"

// APRES (correct) :
export const metadata: Metadata = {
  title: 'ADMINA-RH — Gestion des Ressources Humaines',
  description: 'Admina-RH : SaaS RH multi-tenant pour le Cameroun. '
    + 'Gestion administrative, recrutement, paie, conges, performance, '
    + 'et conformite reglementaire. ISO 30201:2026.',
  keywords: [
    'ADMINA-RH', 'gestion RH', 'Cameroun', 'SaaS RH', 'paie',
    'conges', 'recrutement', 'ISO 30201', 'multi-tenant'
  ],
}
```

### 1.3 Verification de la correction

| # | Test | Commande / Action | Resultat attendu
|---|------|-------------------|------------------
| V1 | Cle API valide | `curl -X POST https://aywwakllgvfoqlpowzqf.supabase.co/auth/v1/signup -H "apikey: <VOTRE_CLE>" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"Test1234!"}'` | 200 ou 422 (PAS 400)
| V2 | Login fonctionnel | Se connecter sur /login avec un compte valide | Redirect vers /domaine-2
| V3 | Middleware correct | Ete connecte, acceder a /domaine-2 | Page affichee (pas redirect)
| V4 | Middleware public | Ete deconnecte, acceder a /login | Page login affichee (pas redirect)
| V5 | API non bloquees | `curl https://admina-rh.../api/d02/employees` | 200 (pas redirect 307)

---

## 2. STRUCTURE DU REPO GITHUB (ERR-03)

### 2.1 Probleme
Le repo `georgyfr/Admina_RH` sur la branche `main` contient 706 fichiers de documentation
(PDF, XLSX, PNG, MD) mais **ZERO ligne de code source** (ni TypeScript, ni JavaScript, ni JSON de config).

### 2.2 Action corrective

#### Option A (Recommandee) : Repo monorepo avec sous-dossiers

```
Admina_RH/                          # Repo racine
├── src/                             # CODE SOURCE (NOUVEAU)
│   ├── app/                        # Next.js App Router
│   ├── components/                 # Composants React
│   ├── lib/                        # Utilitaires, clients
│   └── middleware.ts
├── supabase/                       # Migrations SQL
│   └── migrations/
├── docs/                           # DOCUMENTATION (deplace depuis racine)
│   ├── DEPARTEMENTS/
│   ├── Domaine1_Recrutement_Candidats/
│   ├── Domaine2_Gestion_Administrative_Personnel/
│   └── ... (31 domaines)
├── prompts/                        # Prompts de dev (deplace depuis racine)
│   ├── PROMPT_DEV_Domaine2_Complet_V2.md
│   └── PROMPT_CORRECTION_DEP1_2026-08-06.md
├── public/                         # Assets statiques
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── wrangler.toml                   # Config Cloudflare Workers
```

#### Etapes de migration

```bash
# 1. Creer les dossiers de code
mkdir -p src/app src/components src/lib docs prompts supabase/migrations public

# 2. Deplacer la documentation
mv DEPARTEMENTS/ docs/
mv Domaine*/ docs/
mv Concurrents/ docs/
mv Structure_Organisationnelle_DRH_et_Mapping_31_Domaines.pdf docs/
mv Interfaces_Employe_Admina_RH_2026-07-25.png docs/
mv Matrice_Priorisation_Interfaces_Employe_Admina_RH_2026-07-25.png docs/

# 3. Deplacer les prompts
mv *.md prompts/ 2>/dev/null || true

# 4. Commits
 git add -A && git commit -m "refactor: reorganise repo - code source + docs + prompts"
 git push origin main
```

---

## 3. DOMAINE 1 — RECRUTEMENT ET INTEGRATION (ERR-04)

### 3.1 Etat actuel
- Dossier complet dans le repo : flux, schemas, matrice, manuel de procedures
- Donnees d'exemple dans `D1_data.json` (5 demandes, 3 candidats, 3 entretiens, 3 evaluations, 2 contrats, 3 cabinets, 4 sources, 3 couts, 5 pipeline)
- **Aucune table DB, aucune page, aucune API** n'existe

### 3.2 Tables Supabase a creer

```sql
-- Schema: admina_rh

CREATE TABLE admina_rh.d01_recruitment_demands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  reference     TEXT NOT NULL UNIQUE,          -- REF-REC-2026-001
  title         TEXT NOT NULL,                  -- Intitule du poste
  department_id UUID REFERENCES admina_rh.ref_departments(id),
  position_id   UUID REFERENCES admina_rh.ref_positions(id),
  contract_type TEXT NOT NULL DEFAULT 'CDI'
                CHECK (contract_type IN ('CDI','CDD','Stage','Alternance','Interim','Freelance')),
  requested_by  UUID NOT NULL,                  -- Demandeur (user_id)
  priority      TEXT NOT NULL DEFAULT 'moyenne'
                CHECK (priority IN ('basse','moyenne','haute','urgente')),
  status        TEXT NOT NULL DEFAULT 'brouillon'
                CHECK (status IN ('brouillon','validee','en_cours','pourvue','annulee')),
  vacancies     INTEGER NOT NULL DEFAULT 1,
  salary_min    NUMERIC(12,2),
  salary_max    NUMERIC(12,2),
  description   TEXT,
  requirements  TEXT,                          -- Competences requises (JSON ou texte)
  published_at  TIMESTAMPTZ,
  deadline      DATE,                          -- Date limite de candidature
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d01_candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  demand_id     UUID NOT NULL REFERENCES admina_rh.d01_recruitment_demands(id) ON DELETE CASCADE,
  last_name     TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  source        TEXT,                          -- LinkedIn, Indeed, Referral, Cabinet...
  cv_url        TEXT,                          -- Supabase Storage
  cover_letter_url TEXT,
  status        TEXT NOT NULL DEFAULT 'nouveau'
                CHECK (status IN ('nouveau','en_cours','entretien','evaluation','retenu','refuse','desiste')),
  rating        INTEGER CHECK (rating BETWEEN 0 AND 5),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d01_interviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES admina_rh.d01_candidates(id) ON DELETE CASCADE,
  demand_id     UUID NOT NULL REFERENCES admina_rh.d01_recruitment_demands(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL,                 -- user_id du recruteur
  interview_type TEXT NOT NULL DEFAULT 'technique'
                CHECK (interview_type IN ('telephonique','technique','rh','directeur','final')),
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INTEGER DEFAULT 60,
  location      TEXT,                          -- Salle ou lien visio
  status        TEXT NOT NULL DEFAULT 'planifie'
                CHECK (status IN ('planifie','termine','annule','reporte')),
  score         INTEGER CHECK (score BETWEEN 0 AND 100),
  feedback      TEXT,
  recommendation TEXT CHECK (recommendation IN ('favorable','defavorable','a_discuter')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d01_evaluations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES admina_rh.d01_candidates(id) ON DELETE CASCADE,
  evaluator_id  UUID NOT NULL,
  criteria      JSONB NOT NULL DEFAULT '{}',     -- {"technique":4,"communication":3,...}
  overall_score NUMERIC(3,1),
  comments      TEXT,
  decision      TEXT CHECK (decision IN ('retenu','refuse','en_attente')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d01_recruitment_pipeline (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES admina_rh.d01_candidates(id) ON DELETE CASCADE,
  stage         TEXT NOT NULL DEFAULT 'candidature'
                CHECK (stage IN ('candidature','preselection','entretien_technique','entretien_rh','test','offre','négociation','integration','refuse','desiste')),
  entered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at     TIMESTAMPTZ,
  notes         TEXT
);

CREATE TABLE admina_rh.d01_cabinet_partners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact_name  TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  specialization TEXT,                         -- RH, IT, Ingenierie...
  address       TEXT,
  city          TEXT DEFAULT 'Douala',
  country       TEXT DEFAULT 'Cameroun',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  rating        INTEGER CHECK (rating BETWEEN 0 AND 5),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d01_cost_tracking (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  demand_id     UUID REFERENCES admina_rh.d01_recruitment_demands(id) ON DELETE SET NULL,
  category      TEXT NOT NULL
                CHECK (category IN ('publication','cabinet','visio','deplacement','test_psychotechnique','relocation','autre')),
  amount        NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'XAF',
  description   TEXT,
  date_incurred DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_d01_candidates_demand ON admina_rh.d01_candidates(demand_id);
CREATE INDEX idx_d01_interviews_candidate ON admina_rh.d01_interviews(candidate_id);
CREATE INDEX idx_d01_pipeline_candidate ON admina_rh.d01_recruitment_pipeline(candidate_id);
CREATE INDEX idx_d01_demands_tenant_status ON admina_rh.d01_recruitment_demands(tenant_id, status);

-- RLS
ALTER TABLE admina_rh.d01_recruitment_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d01_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d01_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d01_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d01_recruitment_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d01_cabinet_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d01_cost_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies par role
DO $$ BEGIN
  -- Pour chaque table D01, creer des policies par role
  -- Exemple pour d01_recruitment_demands :
  CREATE POLICY "Admin RH full access D01 demands" ON admina_rh.d01_recruitment_demands
    FOR ALL USING (auth.uid() IN (
      SELECT user_id FROM admina_rh.user_roles
      WHERE tenant_id = admina_rh.d01_recruitment_demands.tenant_id
      AND role = 'admin_rh'
    ));

  CREATE POLICY "DRH read/write D01 demands" ON admina_rh.d01_recruitment_demands
    FOR ALL USING (auth.uid() IN (
      SELECT user_id FROM admina_rh.user_roles
      WHERE tenant_id = admina_rh.d01_recruitment_demands.tenant_id
      AND role IN ('drh', 'admin_rh')
    ));

  CREATE POLICY "Chef Service read D01 demands" ON admina_rh.d01_recruitment_demands
    FOR SELECT USING (auth.uid() IN (
      SELECT user_id FROM admina_rh.user_roles
      WHERE tenant_id = admina_rh.d01_recruitment_demands.tenant_id
    ));
END $$;
```

### 3.3 Routes a creer

```
src/app/
  domaine-1/
    page.tsx                          # Dashboard Recrutement (KPIs pipeline)
    demandes/
      page.tsx                        # Liste des demandes de recrutement
      nouveau/page.tsx               # Nouvelle demande
      [id]/page.tsx                  # Detail d'une demande
    candidats/
      page.tsx                        # Liste des candidats
      [id]/page.tsx                  # Fiche candidat
    entretiens/
      page.tsx                        # Planning des entretiens
      nouveau/page.tsx               # Planifier un entretien
    pipeline/
      page.tsx                        # Vue pipeline Kanban
    partenaires/
      page.tsx                        # Cabinets de recrutement
    couts/
      page.tsx                        # Suivi des couts
```

### 3.4 API Routes a creer

```
src/app/api/d01/
  demands/route.ts                   # GET (liste) + POST (creer)
  demands/[id]/route.ts              # GET + PUT + DELETE
  candidates/route.ts                # GET + POST
  candidates/[id]/route.ts           # GET + PUT + DELETE
  interviews/route.ts                # GET + POST
  interviews/[id]/route.ts           # GET + PUT
  evaluations/route.ts               # GET + POST
  pipeline/route.ts                  # GET + PUT (deplacer stage)
  partners/route.ts                  # GET + POST
  costs/route.ts                     # GET + POST
```

---

## 4. DOMAINES MANQUANTS DU DEPARTEMENT 1 (ERR-05)

### 4.1 Cartographie des domaines a implementer

| Domaine | Service Dep1 | Niveau de priorite | Tables DB | Pages | API Routes |
|---------|-------------|-------------------|-----------|-------|------------|
| **D4** Temps de Travail | S1.2 | P1 | 3 tables | 4 pages | 4 routes |
| **D12** Documentation | S1.1 | P2 | 2 tables | 3 pages | 2 routes |
| **D21** Cartographie Metiers | S1.3 | P1 | 3 tables | 4 pages | 3 routes |
| **D23** Travail Temporaire | S1.2 | P3 | 2 tables | 3 pages | 3 routes |
| **D24** Stagiaires | S1.3 | P2 | 2 tables | 4 pages | 3 routes |

### 4.2 Domaine 4 — Temps de Travail et Planification (Service 1.2)

**Tables SQL :**
```sql
CREATE TABLE admina_rh.d04_work_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  employee_id   UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('hebdomadaire','rotation','exceptionnel')),
  monday_start  TIME, tuesday_start TIME, wednesday_start TIME,
  thursday_start TIME, friday_start TIME,
  saturday_start TIME, sunday_start TIME,
  monday_end    TIME, tuesday_end TIME, wednesday_end TIME,
  thursday_end  TIME, friday_end TIME,
  saturday_end  TIME, sunday_end TIME,
  effective_from DATE NOT NULL, effective_to DATE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d04_time_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  employee_id   UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  clock_in      TIMESTAMPTZ,
  clock_out     TIMESTAMPTZ,
  break_min     INTEGER DEFAULT 0,
  total_min     INTEGER,
  overtime_min  INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'normal'
                CHECK (status IN ('normal','retard','absent','teletravail','conge','ferie')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, employee_id, date)
);

CREATE TABLE admina_rh.d04_overtime_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  employee_id   UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  hours_requested NUMERIC(4,2) NOT NULL,
  reason        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'en_attente'
                CHECK (status IN ('en_attente','approuve','refuse')),
  approved_by   UUID,
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Pages :** `/domaine-4/` (dashboard), `/domaine-4/horaires`, `/domaine-4/pointage`, `/domaine-4/depassements`

### 4.3 Domaine 21 — Fiches de Poste et Cartographie des Metiers (Service 1.3)

**Tables SQL :**
```sql
CREATE TABLE admina_rh.d21_job_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  position_id   UUID REFERENCES admina_rh.ref_positions(id),
  title         TEXT NOT NULL,
  department    TEXT,
  grade         TEXT,
  classification TEXT,
  mission       TEXT NOT NULL,               -- Description de la mission
  responsibilities TEXT,                    -- Responsabilites principales
  required_skills JSONB DEFAULT '[]',       -- Competences requises
  required_diplomas JSONB DEFAULT '[]',     -- Diplomes/certifications
  experience_years INTEGER,
  salary_range_min NUMERIC(12,2),
  salary_range_max NUMERIC(12,2),
  physical_requirements TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','obsolete','en_revision')),
  version       INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d21_career_paths (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  department    TEXT,
  levels        JSONB NOT NULL DEFAULT '[]',  -- [{"grade":"A1","title":"...","years_min":0},...]
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admina_rh.d21_skills_matrix (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  job_profile_id UUID NOT NULL REFERENCES admina_rh.d21_job_profiles(id) ON DELETE CASCADE,
  skill_name    TEXT NOT NULL,
  skill_category TEXT NOT NULL
                CHECK (skill_category IN ('technique','comportemental','linguistique','informatique','management')),
  required_level INTEGER NOT NULL DEFAULT 3 CHECK (required_level BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, job_profile_id, skill_name)
);
```

**Pages :** `/domaine-21/` (dashboard), `/domaine-21/fiches-poste`, `/domaine-21/parcours-carriere`, `/domaine-21/matrice-competences`

### 4.4 Domaine 24 — Stagiaires et Alternants (Service 1.3)

**Tables SQL :**
```sql
CREATE TABLE admina_rh.d24_internships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  intern_name   TEXT NOT NULL,
  intern_email  TEXT,
  intern_phone  TEXT,
  school        TEXT,
  program       TEXT,                          -- Filiere/formation
  internship_type TEXT NOT NULL
                CHECK (internship_type IN ('stage_decouverte','stage_ete','stage_fin_etude','alternance','formation_professionnelle')),
  department_id UUID REFERENCES admina_rh.ref_departments(id),
  supervisor_id UUID REFERENCES admina_rh.employees(id),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'planifie'
                CHECK (status IN ('planifie','en_cours','termine','abandonne','embauche')),
  monthly_allowance NUMERIC(10,2),
  objectives    TEXT,
  assessment    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Pages :** `/domaine-24/` (dashboard), `/domaine-24/stagiaires`, `/domaine-24/conventions`, `/domaine-24/evaluations`

### 4.5 Domaines 12 et 23 (structure similaire, priorite plus basse)

- **D12** (Documentation et Archivage) : 2 tables (`d12_documents`, `d12_archives`), 3 pages
- **D23** (Travail Temporaire) : 2 tables (`d23_missions`, `d23_interim_contracts`), 3 pages

---

## 5. API ROUTES MANQUANTES (ERR-06)

### 5.1 Routes D2 a creer (13 manquantes)

```
src/app/api/d02/
  career-paths/route.ts            # Parcours carrieres des employes
  promotions/route.ts              # Demandes de promotion
  trainings/route.ts               # Formations suivies
  transfers/route.ts               # Transferts inter-departements
  discipline/route.ts              # Dossiers disciplinaires
  competencies/route.ts            # Competences des employes
  evaluations/route.ts             # Evaluations performance
  leave-requests/route.ts          # Demandes de conge (CRUD)
  notifications/route.ts           # Notifications utilisateur
  organizations/route.ts           # Structure organisationnelle
  positions/route.ts               # Postes et grades
  grades/route.ts                  # Grilles salariales
  audit-logs/route.ts              # Journal d'audit
```

### 5.2 Routes transversales a creer

```
src/app/api/
  health/route.ts                  # GET { status: 'ok', version: '2.5', uptime }
  tenants/route.ts                 # GET (liste tenants) + POST
  auth/
    register/route.ts              # POST (inscription via API)
    login/route.ts                 # POST (connexion via API)
    logout/route.ts                # POST (deconnexion)
```

### 5.3 Patron de reponse standardise

Chaque API route DOIT suivre ce pattern :

```typescript
// src/app/api/d02/career-paths/route.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  employee_id: z.string().uuid().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const supabase = await createServerSupabaseClient()
    const { data, error, count } = await supabase
      .from('d02_career_paths')
      .select('*', { count: 'exact' })
      .range((query.page - 1) * query.limit, query.page * query.limit - 1)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, total: count, page: query.page, limit: query.limit })
  } catch (err) {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('d02_career_paths')
      .insert(body)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Donnees invalides' }, { status: 400 })
  }
}
```

---

## 6. MANUELS DE PROCEDURE MANQUANTS (ERR-07)

### 6.1 Etat actuel
- 4/24 manuels crees (01-04)
- Dossiers 05-24 contiennent uniquement un fichier `.gitkeep`

### 6.2 Manuels a creer

| # | Feuille Excel D2 | Manuel a generer | Contenu attendu |
|---|-------------------|-----------------|----------------|
| 05 | Documents | `05_Manuel_Procedure_Documents_AdminRH.md` | Upload, versioning, approbation docs employes |
| 06 | Bancaires | `06_Manuel_Procedure_Bancaires_AdminRH.md` | Coordonnees bancaires, RIB, changements, virements |
| 07 | Mutuelle | `07_Manuel_Procedure_Mutuelle_AdminRH.md` | Inscription, cotisations, prestations, couverture |
| 08 | Permis | `08_Manuel_Procedure_Permis_AdminRH.md` | Demandes, renouvellements, suivi expatries |
| 09 | Conges | `09_Manuel_Procedure_Conges_AdminRH.md` | Demandes, soldes, report, conflits, CNPS |
| 10 | Soldes de Conges | `10_Manuel_Procedure_Soldes_Conges_AdminRH.md` | Calcul, compteur, acquisition, report annuel |
| 11 | Absences | `11_Manuel_Procedure_Absences_AdminRH.md` | Types, declaration, justificatif, impact paie |
| 12 | Heures Supp. | `12_Manuel_Procedure_Heures_Supp_AdminRH.md` | Autorisation, calcul, majoration, paiement, plafond |
| 13 | Pointage | `13_Manuel_Procedure_Pointage_AdminRH.md` | Saisie, badge, validation, correction, export |
| 14 | Planning | `14_Manuel_Procedure_Planning_AdminRH.md` | Planning hebdo, repos,astreintes, equipes |
| 15 | Paie | `15_Manuel_Procedure_Paie_AdminRH.md` | Bulletins, calcul, deductions CNPS/IR, paiement |
| 16 | Declarations | `16_Manuel_Procedure_Declarations_AdminRH.md` | CNPS mensuelle, fichier ETAT, echeances |
| 17 | Prets/Avances | `17_Manuel_Procedure_Prets_AdminRH.md` | Demande, approbation, remboursement, deduction |
| 18 | Sanctions | `18_Manuel_Procedure_Sanctions_AdminRH.md` | Types, procedure disciplinaire, poursuite, archive |
| 19 | Visites Med. | `19_Manuel_Procedure_Visites_Med_AdminRH.md` | Visites periodiques, aptitude, inaptitude, CI |
| 20 | Departs | `20_Manuel_Procedure_Departs_AdminRH.md` | Demission, licenciement, retraite, fin contrat, checklist |
| 21 | Archivage | `21_Manuel_Procedure_Archivage_AdminRH.md` | Duree conservation, numerisation, destruction |
| 22 | Rappels | `22_Manuel_Procedure_Rappels_AdminRH.md` | Echeances, alertes automatiques, renouvellements |
| 23 | PDCA | `23_Manuel_Procedure_PDCA_AdminRH.md` | Cycle amelioration, KPIs, revue, actions correctives |
| 24 | Non-Conformites | `24_Manuel_Procedure_Non_Conformites_AdminRH.md` | Detection, enregistrement, analyse, action corrective |

### 6.3 Format obligatoire pour chaque manuel

Chaque manuel DOIT contenir :
1. Page de couverture avec titre, version, date, auteur
2. Objectif et perimetre
3. Acteurs et responsabilites (RACI)
4. Flowchart de la procedure (mermaid ou image)
5. Etapes detaillees (numerotees)
6. Donnees d'entree/sortie
7. Regles metier (loi camerounaise applicable)
8. Matrice des acces par profil (L/LE/E)
9. Exceptions et cas limites
10. KPIs de suivi
11. Annexes (modeles, formulaires)

---

## 7. REFACTORING ROUTING D5 (ERR-09)

### 7.1 Probleme
Les pages de conges, soldes de conges et absences sont montees sous `/domaine-2/` alors que
l'architecture Departement 1 specifie que le Domaine 5 doit avoir sa propre route `/domaine-5/`.

### 7.2 Action

**Phase 1 — Creer les nouvelles routes D5 :**
```
src/app/domaine-5/
  page.tsx                    # Dashboard Conges
  demandes/page.tsx           # Demandes de conge
  soldes/page.tsx             # Soldes de conges
  absences/page.tsx           # Gestion des absences
  calendrier/page.tsx         # Calendrier equipe
```

**Phase 2 — Conserver les routes D2 comme alias temporaire** (backward compat) :
```typescript
// src/app/domaine-2/conges/page.tsx — Redirect temporaire
import { redirect } from 'next/navigation'
export default function CongesRedirect() {
  redirect('/domaine-5/demandes')
}
```

**Phase 3 — Mettre a jour le Departement 1** :
```typescript
// Dans la page /departement-1, corriger les liens :
// Service 1.1 : D5 Conges -> /domaine-5 (au lieu de /domaine-2/conges)
```

---

## 8. RLS POLICIES SECURISEES (ERR-10)

### 8.1 Probleme
Les 51 politiques RLS existantes sont toutes nommees "Service role full access" sans
differenciation de roles. N'importe quel utilisateur authentifie peut lire/modifier toutes les donnees.

### 8.2 Solution — Creer une table des roles utilisateurs

```sql
CREATE TABLE admina_rh.user_roles (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
  role          TEXT NOT NULL
                CHECK (role IN (
                  'admin_rh',     -- Admin RH (acces total)
                  'drh',          -- Directeur RH
                  'chef_service', -- Chef de Service
                  'gestionnaire', -- Gestionnaire Paie/Admin
                  'superviseur',  -- Superviseur
                  'employe'       -- Employe (lecture limitee)
                )),
  granted_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tenant_id)
);

ALTER TABLE admina_rh.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own role" ON admina_rh.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage roles" ON admina_rh.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admina_rh.user_roles
            WHERE user_id = auth.uid()
            AND tenant_id = admina_rh.user_roles.tenant_id
            AND role = 'admin_rh')
  );
```

### 8.3 Remplacer les 51 policies generiques

Pour chaque table existante, remplacer "Service role full access" par des policies par role.
Exemple pour `admina_rh.employees` :

```sql
-- Supprimer l'ancienne policy
DROP POLICY "Service role full access admina_rh.employees" ON admina_rh.employees;

-- Admin RH : CRUD complet
CREATE POLICY "admin_rh_full_employees" ON admina_rh.employees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admina_rh.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin_rh'
            AND ur.tenant_id = admina_rh.employees.tenant_id)
  );

-- DRH + Chef Service : Lecture + Ecriture (pas suppression)
CREATE POLICY "rw_employees" ON admina_rh.employees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admina_rh.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('drh','chef_service','gestionnaire','superviseur')
            AND ur.tenant_id = admina_rh.employees.tenant_id)
  );

CREATE POLICY "rw_update_employees" ON admina_rh.employees
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admina_rh.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('drh','chef_service','gestionnaire')
            AND ur.tenant_id = admina_rh.employees.tenant_id)
  );

-- Employe : voir uniquement son propre profil
CREATE POLICY "self_read_employees" ON admina_rh.employees
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 9. GESTION DU COMPTE UTILISATEUR — MODULE TRANSVERSAL (PRIORITE ABSOLUE)

### 9.1 Pourquoi c'est prioritaire
Sans gestion du compte fonctionnelle, l'authentification ne sert a rien.
L'utilisateur ne peut pas : voir son profil, changer son mot de passe, voir son activite,
gerer ses preferences. C'est le **point d'entree obligatoire** de l'application.

### 9.2 Tables Supabase a creer

```sql
-- Profil utilisateur etendu
CREATE TABLE admina_rh.user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id),
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  display_name  TEXT GENERATED ALWAYS AS (
    COALESCE(NULLIF(TRIM(first_name || ' ' || last_name), ''),
             auth.users.raw_user_meta_data->>'display_name')
  ) STORED,
  phone         TEXT,
  job_title     TEXT,
  department    TEXT,
  avatar_url    TEXT,
  locale        TEXT NOT NULL DEFAULT 'fr' CHECK (locale IN ('fr', 'en')),
  theme         TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  timezone      TEXT NOT NULL DEFAULT 'Africa/Douala',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, id)
);

ALTER TABLE admina_rh.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON admina_rh.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON admina_rh.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON admina_rh.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger auto-creation profil au signup
CREATE OR REPLACE FUNCTION admina_rh.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admina_rh.user_profiles (id, tenant_id, first_name, last_name, phone, job_title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'tenant_id', '00000000-0000-0000-0000-000000000000'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'job_title', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION admina_rh.handle_new_user();

-- Historique des connexions
CREATE TABLE admina_rh.user_login_history (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id),
  ip_address    INET,
  user_agent    TEXT,
  device_type   TEXT,
  browser       TEXT,
  os            TEXT,
  location      TEXT,
  success       BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admina_rh.user_login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own login history" ON admina_rh.user_login_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_login_history_user ON admina_rh.user_login_history(user_id, created_at DESC);

-- Demandes de suppression de compte (RGPD)
CREATE TABLE admina_rh.user_account_deletion_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES admina.tenants(id),
  reason        TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at  TIMESTAMPTZ,
  processed_by  UUID REFERENCES auth.users(id),
  admin_notes   TEXT
);

ALTER TABLE admina_rh.user_account_deletion_requests ENABLE ROW LEVEL SECURITY;
```

### 9.3 Routes de gestion du compte

```
src/app/
  (auth)/
    login/page.tsx                    # Connexion
    register/page.tsx                 # Inscription
    forgot-password/page.tsx          # Mot de passe oublie
    reset-password/page.tsx           # Reset (lien email)
    verify-email/page.tsx             # Verification email
    callback/page.tsx                 # OAuth callback
  mon-compte/
    page.tsx                          # Profil (onglet par defaut)
    securite/page.tsx                 # Mot de passe + email
    activite/page.tsx                 # Historique connexions
    supprimer/page.tsx                # Demande suppression RGPD
```

### 9.4 Composants a creer

```
src/components/
  auth/
    login-form.tsx                    # Formulaire connexion
    register-form.tsx                 # Formulaire inscription
    forgot-password-form.tsx          # Formulaire mdp oublie
    social-login-buttons.tsx          # Google OAuth
  account/
    profile-form.tsx                  # Formulaire profil
    avatar-upload.tsx                 # Upload + crop avatar
    password-change-form.tsx          # Changement mdp
    email-change-form.tsx             # Changement email
    preference-selector.tsx           # Langue, theme, timezone
    login-history-table.tsx           # Historique connexions
    danger-zone.tsx                   # Suppression compte RGPD
    account-sidebar.tsx               # Sidebar navigation
  layout/
    header-avatar-dropdown.tsx        # Avatar cliquable + dropdown
    auth-guard.tsx                    # Protection wrapper
```

### 9.5 Login flow complet

```
1. User saisit email + password sur /login
2. Validation Zod cote client (email valide, mdp >= 8 chars)
3. supabase.auth.signInWithPassword({ email, password })
4. Si erreur :
   - "Identifiants incorrects" (message generic, ne pas reveler si email existe)
   - Log dans user_login_history (success=false, failure_reason=...)
   - Max 5 tentatives / 15 min (config Supabase)
5. Si succes :
   - Log dans user_login_history (success=true, device_type, browser, os, ip)
   - Redirect vers redirect param ou /domaine-2
6. Header : avatar cliquable avec dropdown (profil, securite, activite, deconnexion)
```

### 9.6 Register flow complet

```
1. User remplit : Prenom, Nom, Email, Mot de passe, Confirmer, Code tenant (optionnel)
2. Validation Zod :
   - first_name : 2-50 chars
   - last_name : 2-50 chars
   - email : email valide
   - password : min 8, 1 majuscule, 1 chiffre, 1 special
   - confirm_password : match avec password
3. Indicateur de force du mot de passe (barre visuelle)
4. supabase.auth.signUp({
     email, password,
     options: { data: { first_name, last_name, tenant_id } }
   })
5. Le trigger handle_new_user() cree automatiquement le profil dans user_profiles
6. Supabase envoie un email de verification
7. Page "Verifiez votre email" + bouton "Renvoyer le lien"
8. User clique le lien -> /verify-email?status=success
9. Auto-login + redirect vers /domaine-2
```

### 9.7 Page /mon-compte — Onglet Profil

```
+------------------------------------------+
| HEADER Admina_RH                          |
| [Logo] [Search...]  [Notif] [Avatar v]   |
+--------+---------------------------------+
| SIDEBAR|  MAIN CONTENT                    |
| Mon    |                                 |
| Profil |  [Avatar 96x96] [Changer photo]  |
| <-- act|                                 |
| Securi |  Prenom : [__________]           |
| Activit|  Nom     : [__________]           |
| Danger |  Email   : user@test.com (L)     |
|        |  Tel     : +237 XXXX XXXX        |
|        |  Poste   : [__________]          |
|        |  Dept    : [Select v]            |
|        |  Tenant  : Mon Entreprise (L)    |
|        |                                 |
|        |  [Enregistrer] [Annuler]         |
+--------+---------------------------------+
```

- (L) = Lecture seule
- Avatar : cercle 96x96, initiales si pas de photo, upload vers Supabase Storage
- Validation Zod, toast succes/erreur, loading skeleton

### 9.8 Page /mon-compte/securite

- Changer le mot de passe : ancien + nouveau + confirmer
- Changer l'email : nouvel email + verification
- Se deconnecter de tous les autres appareils
- (P3) 2FA / MFA via Supabase Auth TOTP

### 9.9 Page /mon-compte/activite

- Tableau historique des connexions : date, appareil, navigateur, OS, localisation, statut
- Pagination : 20/page, tri date desc
- Filtre : 7j, 30j, 90j, tout
- Export CSV (P2)

### 9.10 Header Avatar Dropdown

```
+---------------------------+
| [Avatar] Prenom Nom       |
| prenom@email.com           |
| Mon Entreprise             |
|---------------------------|
| Mon Profil                 |  -> /mon-compte
| Securite                   |  -> /mon-compte/securite
| Mon Activite               |  -> /mon-compte/activite
|---------------------------|
| Deconnexion               |  -> supabase.auth.signOut()
+---------------------------+
```

- Ferme au clic hors zone, Escape, ou item selectionne
- Accessibilite : role="menu", role="menuitem", navigation clavier

### 9.11 Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://aywwakllgvfoqlpowzqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<CLE_ANON_VALIDE>
SUPABASE_SERVICE_ROLE_KEY=<CLE_SERVICE_ROLE_VALIDE>
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=avatars
```

### 9.12 Dependances a installer

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install react-dropzone react-easy-crop
npm install date-fns
```

---

## 10. PHASES DE PRIORITE DE CORRECTION

### Phase P0 — BLOQUANT (Jours 1-3)
| # | Tache | Erreur corrigee | Livrable
|---|-------|----------------|----------|
| P0.1 | Recuperer et configurer la cle API Supabase valide | ERR-01 | .env.local + wrangler secrets
| P0.2 | Corriger le middleware (routes publiques + API exclues) | ERR-02 | src/middleware.ts
| P0.3 | Corriger la meta description | ERR-08 | src/app/layout.tsx
| P0.4 | Creer les 3 tables user (profiles, login_history, deletion) | Compte | SQL migration
| P0.5 | Creer le trigger handle_new_user() | Compte | SQL migration
| P0.6 | Implementer /login avec flow complet | Compte | src/app/(auth)/login/page.tsx
| P0.7 | Implementer /register avec force password + verification | Compte | src/app/(auth)/register/page.tsx
| P0.8 | Implementer /mon-compte (onglet profil) | Compte | src/app/mon-compte/page.tsx
| P0.9 | Implementer header avatar dropdown | Compte | src/components/layout/header-avatar-dropdown.tsx
| P0.10 | Creer le bucket avatars dans Supabase Storage | Compte | Config Supabase

### Phase P1 — FONCTIONNEL (Semaine 2)
| # | Tache | Erreur corrigee | Livrable
|---|-------|----------------|----------|
| P1.1 | Implementer /mon-compte/securite | Compte | page.tsx
| P1.2 | Implementer /mon-compte/activite | Compte | page.tsx
| P1.3 | Implementer /forgot-password + /reset-password | Compte | 2 pages
| P1.4 | Creer les 7 tables D01 (Recrutement) | ERR-04 | SQL migration
| P1.5 | Creer les routes /domaine-1/* (dashboard, demandes, candidats, pipeline) | ERR-04 | 6 pages
| P1.6 | Creer les 10 API routes D01 | ERR-04 | 10 route.ts
| P1.7 | Creer les 13 API routes D2 manquantes | ERR-06 | 13 route.ts
| P1.8 | Corriger les 51 RLS policies + table user_roles | ERR-10 | SQL migration

### Phase P2 — STRUCTUREL (Semaine 3)
| # | Tache | Erreur corrigee | Livrable
|---|-------|----------------|----------|
| P2.1 | Creer les tables + routes D4 (Temps de Travail) | ERR-05 | 3 tables + 4 pages + 4 API
| P2.2 | Creer les tables + routes D21 (Cartographie) | ERR-05 | 3 tables + 4 pages + 3 API
| P2.3 | Creer les tables + routes D24 (Stagiaires) | ERR-05 | 1 table + 4 pages + 3 API
| P2.4 | Refondre le routing D5 (creer /domaine-5/, redirect D2) | ERR-09 | 5 pages + 4 redirects
| P2.5 | Reorganiser le repo GitHub (code + docs separes) | ERR-03 | Structure repo
| P2.6 | Ajouter /api/health + /api/tenants | ERR-06 | 2 API routes

### Phase P3 — DOCUMENTATION (Semaine 4)
| # | Tache | Erreur corrigee | Livrable
|---|-------|----------------|----------|
| P3.1 | Creer les manuels 05-12 | ERR-07 | 8 fichiers .pdf
| P3.2 | Creer les manuels 13-20 | ERR-07 | 8 fichiers .pdf
| P3.3 | Creer les manuels 21-24 | ERR-07 | 4 fichiers .pdf
| P3.4 | Implementer /mon-compte/supprimer (RGPD) | Compte | page.tsx + modal
| P3.5 | Creer les tables + routes D12 et D23 | ERR-05 | 4 tables + 6 pages

---

## 11. TESTS DE VERIFICATION POST-CORRECTION

| # | Test | Resultat attendu
|---|------|------------------
| T01 | Acceder a / sans etre connecte | Redirect 307 vers /login
| T02 | Se connecter avec identifiants valides | Redirect vers /domaine-2, session creee
| T03 | Creer un compte (register) | Email verification envoyee, profil dans user_profiles
| T04 | Verifier email | Page succes, auto-login
| T05 | Mot de passe oublie | Email de reset envoye
| T06 | Cliquer avatar header | Dropdown avec 5 items
| T07 | Acceder a /mon-compte | Page profil avec donnees utilisateur
| T08 | Modifier profil (prenom) | Sauvegarde, toast succes
| T09 | Changer mot de passe | Nouveau mdp actif, ancien refuse
| T10 | Voir historique activite | Tableau avec connexions, pagination
| T11 | Acceder a /domaine-1 | Dashboard recrutement (pas 404)
| T12 | Creer une demande de recrutement | Enregistree en DB, visible dans la liste
| T13 | POST /api/health | { status: 'ok', version: '2.5' }
| T14 | POST /api/d02/career-paths | 201 (au lieu de 404)
| T15 | Employe ne voit que ses donnees | RLS filtre, pas de donnees autres tenants
| T16 | Meta description correcte | Contient "SaaS RH multi-tenant", PAS "hotelier"
| T17 | /domaine-5/demandes accessible | Page conges (pas redirect vers D2)
| T18 | Se deconnecter via dropdown | Session detruite, redirect /login

---

## 12. CONTRAINTES TECHNIQUES

### 12.1 Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage) — projet aywwakllgvfoqlpowzqf
- Deploiement : Cloudflare Workers via OpenNext
- Multi-tenant : isolation par tenant_id via RLS

### 12.2 Regles absolues
- JAMAIS exposer SUPABASE_SERVICE_ROLE_KEY cote client
- JAMAIS desactiver la verification email en production
- TOUJOURS valider les inputs cote serveur (Zod + RLS)
- TOUJOURS utiliser les parametres SQL (pas de concatenation)
- TOUTES les tables DOIVENT avoir tenant_id + RLS actif
- TOUTES les API routes DOIVENT retourner du JSON valide (pas "invalid json")
- TOUTES les pages DOIVENT etre responsive (mobile-first)
- TOUTES les pages DOIVENT avoir un loading skeleton

### 12.3 Conformite ISO 30201:2026
- Tracabilite : chaque action loggee avec timestamp + user + type
- Confidentialite : donnees isolees par tenant_id
- Integrite : modifications sensibles requierent verification
- Disponibilite : gestion du compte accessible independamment des modules metier

---

## 13. LIVRABLES FINAUX

| # | Livrable | Format | Emplacement
|---|----------|--------|-------------|
| L1 | Pages auth (login, register, forgot, reset, verify, callback) | TSX | src/app/(auth)/
| L2 | Page mon-compte (profil, securite, activite, supprimer) | TSX | src/app/mon-compte/
| L3 | Middleware corrige | TS | src/middleware.ts
| L4 | Header avatar dropdown | TSX | src/components/layout/
| L5 | Composants auth + account | TSX | src/components/
| L6 | Client Supabase (browser + server) | TS | src/lib/supabase/
| L7 | Migrations SQL (compte + D01 + D04 + D21 + D24 + RLS) | SQL | supabase/migrations/
| L8 | Pages D01 (recrutement) | TSX | src/app/domaine-1/
| L9 | Pages D04, D21, D24 | TSX | src/app/domaine-4/, domaine-21/, domaine-24/
| L10 | Pages D05 (conges) | TSX | src/app/domaine-5/
| L11 | 13 API routes D2 + 10 API routes D01 | TS | src/app/api/
| L12 | API health + tenants | TS | src/app/api/
| L13 | Manuels 05-24 | PDF | docs/Domaine2/.../
| L14 | Repo reorganise | - | georgyfr/Admina_RH
