-- ============================================================
-- ADMINA_RH — Domaine 2 : Tables manquantes
-- Gestion des Congés, Absences, Pointage & Heures Supplémentaires
-- Schema : admina_rh
-- Convention : UUID PK, tenant_id multi-tenant, employee_id FK
-- ============================================================

-- ─── 1. ENUM TYPES (si pas déjà créés) ─────────────────────────
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'd02_conge_type') THEN
        CREATE TYPE admina_rh.d02_conge_type AS ENUM (
            'conge_annuel', 'conge_maladie', 'conge_maternite', 'conge_paternite',
            'conge_marriage', 'conge_deuil', 'conge_sans_solde', 'conge_exceptionnel'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'd02_absence_type') THEN
        CREATE TYPE admina_rh.d02_absence_type AS ENUM (
            'maladie', 'accident_travail', 'hospitalisation', 'quarantaine',
            'conge_maternite', 'conge_paternite', 'absence_autorisee', 'absence_non_justifiee'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'd02_overtime_status') THEN
        CREATE TYPE admina_rh.d02_overtime_status AS ENUM ('en_attente', 'validee', 'rejetee', 'payee');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'd02_attendance_status') THEN
        CREATE TYPE admina_rh.d02_attendance_status AS ENUM ('brouillon', 'valide', 'rejete');
    END IF;
END $$;

-- ─── 2. TABLE : d02_leave_requests (Congés Annuels) ─────────────
-- Excel : 8-Conges Annuels — 11 champs métier
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admina_rh.d02_leave_requests (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    leave_number    VARCHAR(50) NOT NULL,
    type_conge      admina_rh.d02_conge_type NOT NULL,
    date_debut      DATE NOT NULL,
    date_fin        DATE NOT NULL,
    nombre_jours    INTEGER NOT NULL,
    motif           TEXT,
    statut          admina_rh.d02_conge_status NOT NULL DEFAULT 'en_attente',
    date_approbation DATE,
    approbateur_id  UUID REFERENCES admina_rh.employees(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- ─── 3. TABLE : d02_leave_balances (Solde Congés) ──────────────
-- Excel : 9-Solde Conges — 9 champs métier
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admina_rh.d02_leave_balances (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id         UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    annee               INTEGER NOT NULL,
    droit_annuel_jours  NUMERIC(5,1) NOT NULL DEFAULT 0,
    conges_pris_jours   NUMERIC(5,1) NOT NULL DEFAULT 0,
    solde_disponible    NUMERIC(5,1) NOT NULL DEFAULT 0,
    conges_en_cours     NUMERIC(5,1) NOT NULL DEFAULT 0,
    report_n1_jours     NUMERIC(5,1) NOT NULL DEFAULT 0,
    taux_utilisation    NUMERIC(5,2),
    statut              VARCHAR(30) NOT NULL DEFAULT 'actif',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

-- ─── 4. TABLE : d02_absences (Absences Maladie) ─────────────────
-- Excel : 10-Absences Maladie — 11 champs métier
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admina_rh.d02_absences (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    absence_number  VARCHAR(50) NOT NULL,
    type_absence    admina_rh.d02_absence_type NOT NULL,
    date_debut      DATE NOT NULL,
    date_fin        DATE,
    duree_jours     INTEGER,
    justificatif_url TEXT,
    statut          admina_rh.d02_absence_status NOT NULL DEFAULT 'en_attente',
    motif           TEXT,
    observations    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- ─── 5. TABLE : d02_overtime_hours (Heures Supplémentaires) ─────
-- Excel : 11-Heures Supplementaires — 11 champs métier
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admina_rh.d02_overtime_hours (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id         UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    overtime_number     VARCHAR(50) NOT NULL,
    semaine             VARCHAR(20) NOT NULL,
    heures_normales     NUMERIC(4,1) NOT NULL DEFAULT 0,
    heures_supp         NUMERIC(4,1) NOT NULL DEFAULT 0,
    taux_majoration     NUMERIC(4,2) NOT NULL DEFAULT 0,
    montant_brut        NUMERIC(12,2) NOT NULL DEFAULT 0,
    montant_calcule     NUMERIC(12,2) NOT NULL DEFAULT 0,
    statut              admina_rh.d02_overtime_status NOT NULL DEFAULT 'en_attente',
    valide_par          UUID REFERENCES admina_rh.employees(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

-- ─── 6. TABLE : d02_attendance_records (Pointage Présence) ──────
-- Excel : 12-Pointage Presence — 10 champs métier
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admina_rh.d02_attendance_records (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    record_number   VARCHAR(50) NOT NULL,
    semaine         VARCHAR(20) NOT NULL,
    jours_presents  INTEGER NOT NULL DEFAULT 0,
    jours_absents   INTEGER NOT NULL DEFAULT 0,
    retards_minutes INTEGER NOT NULL DEFAULT 0,
    heures_supp     NUMERIC(4,1) NOT NULL DEFAULT 0,
    taux_presence   NUMERIC(5,2),
    observations    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- ─── 7. TABLE : d02_monthly_planning (Planning Mensuel Présence)
-- Excel : 22-Planning Mensuel Presence — 13 champs métier
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admina_rh.d02_monthly_planning (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    plan_number     VARCHAR(50) NOT NULL,
    department_id   UUID REFERENCES admina_rh.ref_departments(id) ON DELETE SET NULL,
    position_id     UUID REFERENCES admina_rh.ref_positions(id) ON DELETE SET NULL,
    mois            VARCHAR(20) NOT NULL,
    jours_ouvrables INTEGER NOT NULL DEFAULT 0,
    jours_presents  INTEGER NOT NULL DEFAULT 0,
    jours_absents   INTEGER NOT NULL DEFAULT 0,
    retards_minutes INTEGER NOT NULL DEFAULT 0,
    heures_supp     NUMERIC(4,1) NOT NULL DEFAULT 0,
    taux_presence   NUMERIC(5,2),
    commentaire     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_d02_leave_requests_tenant    ON admina_rh.d02_leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_leave_requests_employee  ON admina_rh.d02_leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_d02_leave_requests_statut    ON admina_rh.d02_leave_requests(statut);

CREATE INDEX IF NOT EXISTS idx_d02_leave_balances_tenant    ON admina_rh.d02_leave_balances(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_d02_leave_balances_emp_yr ON admina_rh.d02_leave_balances(employee_id, annee);

CREATE INDEX IF NOT EXISTS idx_d02_absences_tenant          ON admina_rh.d02_absences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_absences_employee        ON admina_rh.d02_absences(employee_id);
CREATE INDEX IF NOT EXISTS idx_d02_absences_statut          ON admina_rh.d02_absences(statut);

CREATE INDEX IF NOT EXISTS idx_d02_overtime_tenant          ON admina_rh.d02_overtime_hours(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_overtime_employee        ON admina_rh.d02_overtime_hours(employee_id);
CREATE INDEX IF NOT EXISTS idx_d02_overtime_statut          ON admina_rh.d02_overtime_hours(statut);

CREATE INDEX IF NOT EXISTS idx_d02_attendance_tenant        ON admina_rh.d02_attendance_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_attendance_employee      ON admina_rh.d02_attendance_records(employee_id);

CREATE INDEX IF NOT EXISTS idx_d02_monthly_plan_tenant      ON admina_rh.d02_monthly_planning(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_monthly_plan_employee    ON admina_rh.d02_monthly_planning(employee_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_d02_monthly_plan_emp_mo ON admina_rh.d02_monthly_planning(employee_id, mois);

-- ============================================================
-- RLS (Row Level Security) — Multi-tenant
-- ============================================================
ALTER TABLE admina_rh.d02_leave_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_leave_balances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_absences            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_overtime_hours      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_attendance_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_monthly_planning    ENABLE ROW LEVEL SECURITY;

-- Policy: tenants can only see their own data
CREATE POLICY tenant_isolation_d02_leave_requests ON admina_rh.d02_leave_requests
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation_d02_leave_balances ON admina_rh.d02_leave_balances
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation_d02_absences ON admina_rh.d02_absences
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation_d02_overtime ON admina_rh.d02_overtime_hours
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation_d02_attendance ON admina_rh.d02_attendance_records
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation_d02_monthly_plan ON admina_rh.d02_monthly_planning
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ============================================================
-- COMMENTAIRES
-- ============================================================
COMMENT ON TABLE  admina_rh.d02_leave_requests     IS 'Conges annuels - Demandes et approbations';
COMMENT ON TABLE  admina_rh.d02_leave_balances     IS 'Solde de conges par employe et par annee';
COMMENT ON TABLE  admina_rh.d02_absences            IS 'Absences pour maladie et autres motifs';
COMMENT ON TABLE  admina_rh.d02_overtime_hours      IS 'Heures supplementaires declarees et validees';
COMMENT ON TABLE  admina_rh.d02_attendance_records  IS 'Pointage de presence hebdomadaire';
COMMENT ON TABLE  admina_rh.d02_monthly_planning    IS 'Planning mensuel de presence par employe';
