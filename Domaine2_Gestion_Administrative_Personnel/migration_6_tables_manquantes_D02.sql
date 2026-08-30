-- ============================================================
-- ADMINA_RH — Domaine 2 : 6 Tables manquantes
-- Gestion des Conges, Absences, Pointage & Heures Supplementaires
-- Schema cible : admina_rh
-- Convention : UUID PK, tenant_id multi-tenant, employee_id FK,
--              created_at / updated_at, RLS, indexes
-- ============================================================

-- ─── 1. TYPES ENUM ─────────────────────────────────────────────
DO $$ BEGIN

    -- Types de conge
    CREATE TYPE admina_rh.d02_leave_type AS ENUM (
        'conge_annuel', 'conge_maladie', 'conge_maternite', 'conge_paternite',
        'conge_marriage', 'conge_deuil', 'conge_sans_solde', 'conge_exceptionnel'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    -- Statut d'une demande de conge
    CREATE TYPE admina_rh.d02_leave_request_status AS ENUM (
        'en_attente', 'approuvee', 'rejetee', 'annulee'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    -- Types d'absence
    CREATE TYPE admina_rh.d02_absence_type AS ENUM (
        'maladie', 'accident_travail', 'hospitalisation', 'quarantaine',
        'conge_maternite', 'conge_paternite', 'absence_autorisee', 'absence_non_justifiee'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    -- Statut d'une absence
    CREATE TYPE admina_rh.d02_absence_status AS ENUM (
        'en_attente', 'justifiee', 'non_justifiee', 'rejetee'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    -- Statut heures supp
    CREATE TYPE admina_rh.d02_overtime_status AS ENUM (
        'en_attente', 'validee', 'rejetee', 'payee'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    -- Statut pointage
    CREATE TYPE admina_rh.d02_attendance_status AS ENUM (
        'brouillon', 'valide', 'rejete'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    -- Statut planning mensuel
    CREATE TYPE admina_rh.d02_planning_status AS ENUM (
        'brouillon', 'valide', 'cloture'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLE : d02_leave_requests (Conges Annuels)
--    Excel : 8-Conges Annuels — 11 champs metier
-- ============================================================
CREATE TABLE IF NOT EXISTS admina_rh.d02_leave_requests (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id         UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    leave_number      VARCHAR(50) NOT NULL,
    type_conge        admina_rh.d02_leave_type NOT NULL,
    date_debut        DATE NOT NULL,
    date_fin          DATE NOT NULL,
    nombre_jours      INTEGER NOT NULL,
    motif             TEXT,
    statut            admina_rh.d02_leave_request_status NOT NULL DEFAULT 'en_attente',
    date_approbation  DATE,
    approbateur_id    UUID REFERENCES admina_rh.employees(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ
);

-- ============================================================
-- 3. TABLE : d02_leave_balances (Solde Conges)
--    Excel : 9-Solde Conges — 9 champs metier
-- ============================================================
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

-- ============================================================
-- 4. TABLE : d02_absences (Absences Maladie)
--    Excel : 10-Absences Maladie — 11 champs metier
-- ============================================================
CREATE TABLE IF NOT EXISTS admina_rh.d02_absences (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id         UUID NOT NULL REFERENCES admina.tenants(id) ON DELETE CASCADE,
    employee_id       UUID NOT NULL REFERENCES admina_rh.employees(id) ON DELETE CASCADE,
    absence_number    VARCHAR(50) NOT NULL,
    type_absence      admina_rh.d02_absence_type NOT NULL,
    date_debut        DATE NOT NULL,
    date_fin          DATE,
    duree_jours       INTEGER,
    justificatif_url  TEXT,
    statut            admina_rh.d02_absence_status NOT NULL DEFAULT 'en_attente',
    motif             TEXT,
    observations      TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ
);

-- ============================================================
-- 5. TABLE : d02_overtime_hours (Heures Supplementaires)
--    Excel : 11-Heures Supplementaires — 11 champs metier
-- ============================================================
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

-- ============================================================
-- 6. TABLE : d02_attendance_records (Pointage Presence)
--    Excel : 12-Pointage Presence — 10 champs metier
-- ============================================================
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
    statut          admina_rh.d02_attendance_status NOT NULL DEFAULT 'brouillon',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- ============================================================
-- 7. TABLE : d02_monthly_planning (Planning Mensuel Presence)
--    Excel : 22-Planning Mensuel Presence — 13 champs metier
-- ============================================================
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
    statut          admina_rh.d02_planning_status NOT NULL DEFAULT 'brouillon',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- ============================================================
-- 8. INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_d02_lr_tenant   ON admina_rh.d02_leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_lr_employee ON admina_rh.d02_leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_d02_lr_statut   ON admina_rh.d02_leave_requests(statut);
CREATE INDEX IF NOT EXISTS idx_d02_lr_dates    ON admina_rh.d02_leave_requests(date_debut, date_fin);

CREATE INDEX IF NOT EXISTS idx_d02_lb_tenant   ON admina_rh.d02_leave_balances(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_d02_lb_emp_yr ON admina_rh.d02_leave_balances(employee_id, annee);

CREATE INDEX IF NOT EXISTS idx_d02_ab_tenant   ON admina_rh.d02_absences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_ab_employee ON admina_rh.d02_absences(employee_id);
CREATE INDEX IF NOT EXISTS idx_d02_ab_statut   ON admina_rh.d02_absences(statut);
CREATE INDEX IF NOT EXISTS idx_d02_ab_dates    ON admina_rh.d02_absences(date_debut, date_fin);

CREATE INDEX IF NOT EXISTS idx_d02_ot_tenant   ON admina_rh.d02_overtime_hours(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_ot_employee ON admina_rh.d02_overtime_hours(employee_id);
CREATE INDEX IF NOT EXISTS idx_d02_ot_statut   ON admina_rh.d02_overtime_hours(statut);

CREATE INDEX IF NOT EXISTS idx_d02_at_tenant   ON admina_rh.d02_attendance_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_at_employee ON admina_rh.d02_attendance_records(employee_id);

CREATE INDEX IF NOT EXISTS idx_d02_mp_tenant   ON admina_rh.d02_monthly_planning(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_mp_employee ON admina_rh.d02_monthly_planning(employee_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_d02_mp_emp_mo ON admina_rh.d02_monthly_planning(employee_id, mois);

-- ============================================================
-- 9. RLS (Row Level Security) — Multi-tenant isolation
-- ============================================================
ALTER TABLE admina_rh.d02_leave_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_leave_balances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_absences             ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_overtime_hours       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_attendance_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admina_rh.d02_monthly_planning     ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_iso_lr ON admina_rh.d02_leave_requests
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_iso_lb ON admina_rh.d02_leave_balances
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_iso_ab ON admina_rh.d02_absences
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_iso_ot ON admina_rh.d02_overtime_hours
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_iso_at ON admina_rh.d02_attendance_records
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_iso_mp ON admina_rh.d02_monthly_planning
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ============================================================
-- 10. COMMENTAIRES
-- ============================================================
COMMENT ON TABLE admina_rh.d02_leave_requests     IS 'D02 - Demandes de conges annuels et approbations';
COMMENT ON TABLE admina_rh.d02_leave_balances     IS 'D02 - Soldes de conges par employe et par annee';
COMMENT ON TABLE admina_rh.d02_absences            IS 'D02 - Absences pour maladie et autres motifs';
COMMENT ON TABLE admina_rh.d02_overtime_hours      IS 'D02 - Heures supplementaires declarees et validees';
COMMENT ON TABLE admina_rh.d02_attendance_records  IS 'D02 - Pointage de presence hebdomadaire';
COMMENT ON TABLE admina_rh.d02_monthly_planning    IS 'D02 - Planning mensuel de presence par employe';
