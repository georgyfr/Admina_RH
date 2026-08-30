-- ==================================================================
-- ADMINA_RH - Departement 1 : Schema SQL Supabase
-- Administration et Gestion des Carrieres
-- Genere automatiquement depuis dept1-schema.ts
-- Date: 2026-08-19 | Project Ref: vdlvxbwakbyzkhcrowiv
-- ==================================================================

-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SECTION 2: TABLES COMMUNES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  pays VARCHAR(100) NOT NULL DEFAULT 'Cameroun',
  devise VARCHAR(10) NOT NULL DEFAULT 'FCFA',
  adresse TEXT, telephone VARCHAR(30), email VARCHAR(200), logo_url TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  est_actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.utilisateurs (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  matricule VARCHAR(50), nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL,
  nom_complet VARCHAR(250) GENERATED ALWAYS AS (prenom || ' ' || nom) STORED,
  email VARCHAR(200) NOT NULL, telephone VARCHAR(30), poste VARCHAR(200),
  departement VARCHAR(200), role VARCHAR(50) NOT NULL DEFAULT 'employe',
  est_actif BOOLEAN NOT NULL DEFAULT true, dernier_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, tenant_id)
);

CREATE TABLE IF NOT EXISTS public.employes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  matricule VARCHAR(50) NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL,
  nom_complet VARCHAR(250) GENERATED ALWAYS AS (prenom || ' ' || nom) STORED,
  date_naissance DATE, lieu_naissance VARCHAR(200), sexe VARCHAR(10),
  nationalite VARCHAR(100) DEFAULT 'Camerounaise',
  situation_familiale VARCHAR(30), nombre_enfants INTEGER DEFAULT 0,
  adresse TEXT, telephone VARCHAR(30), email_personnel VARCHAR(200), email_professionnel VARCHAR(200),
  date_embauche DATE, statut VARCHAR(30) NOT NULL DEFAULT 'actif', photo_url TEXT,
  utilisateur_id UUID REFERENCES public.utilisateurs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(matricule, tenant_id)
);

CREATE TABLE IF NOT EXISTS public.postes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  titre VARCHAR(200) NOT NULL, code VARCHAR(50), classification VARCHAR(100),
  salaire_min NUMERIC(15,2), salaire_max NUMERIC(15,2), description TEXT,
  est_actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECTION 3: TYPES ENUM (46 types)
-- ============================================================

-- d02_avenants_type_avenant_type
DO $$ BEGIN
  CREATE TYPE public.d02_avenants_type_avenant_type AS ENUM ('mutation', 'passage_cdi', 'promotion', 'renouvellement', 'salaire');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_contrats_periodicite_paie_type
DO $$ BEGIN
  CREATE TYPE public.d02_contrats_periodicite_paie_type AS ENUM ('hebdomadaire', 'mensuel', 'quinzomadaire');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_contrats_statut_type
DO $$ BEGIN
  CREATE TYPE public.d02_contrats_statut_type AS ENUM ('actif', 'en_negociation', 'suspendu', 'termine');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_contrats_type_contrat_type
DO $$ BEGIN
  CREATE TYPE public.d02_contrats_type_contrat_type AS ENUM ('CDD', 'CDI', 'Consultant', 'Interim', 'Stage');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_documents_employe_statut_validite_type
DO $$ BEGIN
  CREATE TYPE public.d02_documents_employe_statut_validite_type AS ENUM ('en_cours', 'expire', 'inconnu', 'valide');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_documents_employe_type_document_type
DO $$ BEGIN
  CREATE TYPE public.d02_documents_employe_type_document_type AS ENUM ('Attestation', 'Autre', 'CNI', 'CV', 'Certificat', 'Contrat_signe', 'Diplome', 'Passeport', 'Photo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_mutuelle_prevoyance_statut_type
DO $$ BEGIN
  CREATE TYPE public.d02_mutuelle_prevoyance_statut_type AS ENUM ('actif', 'en_attente', 'resilie');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_prets_avances_statut_type
DO $$ BEGIN
  CREATE TYPE public.d02_prets_avances_statut_type AS ENUM ('defaut', 'en_cours', 'rembourse', 'solde');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_prets_avances_type_type
DO $$ BEGIN
  CREATE TYPE public.d02_prets_avances_type_type AS ENUM ('avance', 'pret');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_sanctions_disciplinaires_statut_type
DO $$ BEGIN
  CREATE TYPE public.d02_sanctions_disciplinaires_statut_type AS ENUM ('active', 'en_appel', 'levee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_visites_medicales_resultat_type
DO $$ BEGIN
  CREATE TYPE public.d02_visites_medicales_resultat_type AS ENUM ('apte', 'apte_avec_restrictions', 'en_attente', 'inapte');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d02_visites_medicales_type_visite_type
DO $$ BEGIN
  CREATE TYPE public.d02_visites_medicales_type_visite_type AS ENUM ('aptitude', 'embauche', 'periodique', 'reprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d04_absences_type_type
DO $$ BEGIN
  CREATE TYPE public.d04_absences_type_type AS ENUM ('depart_anticipe', 'maladie', 'retard', 'sans_justification');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d04_horaires_statut_type
DO $$ BEGIN
  CREATE TYPE public.d04_horaires_statut_type AS ENUM ('actif', 'inactif');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d04_horaires_type_type
DO $$ BEGIN
  CREATE TYPE public.d04_horaires_type_type AS ENUM ('astreinte', 'equipe_roulante', 'jour_semaine', 'nuit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d04_jours_ouvrables_type_jour_type
DO $$ BEGIN
  CREATE TYPE public.d04_jours_ouvrables_type_jour_type AS ENUM ('ferie', 'ouvrable', 'pont', 'weekend');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d04_plannings_statut_type
DO $$ BEGIN
  CREATE TYPE public.d04_plannings_statut_type AS ENUM ('archive', 'brouillon', 'publie');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d04_plannings_type_planning_type
DO $$ BEGIN
  CREATE TYPE public.d04_plannings_type_planning_type AS ENUM ('hebdomadaire', 'mensuel', 'rotation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d04_pointages_source_type
DO $$ BEGIN
  CREATE TYPE public.d04_pointages_source_type AS ENUM ('badge', 'import', 'manuel');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d05_bulletins_paie_statut_type
DO $$ BEGIN
  CREATE TYPE public.d05_bulletins_paie_statut_type AS ENUM ('archive', 'brouillon', 'envoye', 'genere');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d05_conventions_collectives_statut_type
DO $$ BEGIN
  CREATE TYPE public.d05_conventions_collectives_statut_type AS ENUM ('active', 'archivee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d05_elements_paie_statut_type
DO $$ BEGIN
  CREATE TYPE public.d05_elements_paie_statut_type AS ENUM ('paye', 'provisionnel', 'valide');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d05_elements_paie_type_element_type
DO $$ BEGIN
  CREATE TYPE public.d05_elements_paie_type_element_type AS ENUM ('cotisation', 'indemnite', 'prime', 'retenue', 'salaire_base');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d05_primes_statut_type
DO $$ BEGIN
  CREATE TYPE public.d05_primes_statut_type AS ENUM ('demandee', 'payee', 'rejetee', 'validee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d12_autorisations_statut_type
DO $$ BEGIN
  CREATE TYPE public.d12_autorisations_statut_type AS ENUM ('demandee', 'rejetee', 'validee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d12_calendrier_jours_feries_statut_type
DO $$ BEGIN
  CREATE TYPE public.d12_calendrier_jours_feries_statut_type AS ENUM ('actif', 'inactif');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d12_calendrier_jours_feries_type_jour_type
DO $$ BEGIN
  CREATE TYPE public.d12_calendrier_jours_feries_type_jour_type AS ENUM ('ferie', 'jonglage', 'pont');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d12_conges_statut_type
DO $$ BEGIN
  CREATE TYPE public.d12_conges_statut_type AS ENUM ('annule', 'approuve', 'demande', 'rejete', 'valide_n1', 'valide_n2');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d12_conges_type_conge_type
DO $$ BEGIN
  CREATE TYPE public.d12_conges_type_conge_type AS ENUM ('conges_exceptionnel', 'conges_maladie', 'conges_maternite', 'conges_paternite', 'conges_payes', 'conges_sans_solde', 'rtt');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d12_entrees_sorties_type_mouvement_type
DO $$ BEGIN
  CREATE TYPE public.d12_entrees_sorties_type_mouvement_type AS ENUM ('entree', 'sortie');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_competences_statut_type
DO $$ BEGIN
  CREATE TYPE public.d21_competences_statut_type AS ENUM ('actif', 'obsolete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_competences_type_type
DO $$ BEGIN
  CREATE TYPE public.d21_competences_type_type AS ENUM ('comportementale', 'technique', 'transversale');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_ecarts_competences_priorite_type
DO $$ BEGIN
  CREATE TYPE public.d21_ecarts_competences_priorite_type AS ENUM ('basse', 'critique', 'haute', 'moyenne');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_ecarts_competences_statut_type
DO $$ BEGIN
  CREATE TYPE public.d21_ecarts_competences_statut_type AS ENUM ('depasse', 'detecte', 'en_cours', 'resolu');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_fiches_poste_statut_type
DO $$ BEGIN
  CREATE TYPE public.d21_fiches_poste_statut_type AS ENUM ('archive', 'brouillon', 'en_validation', 'valide');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_historique_revisions_entity_type_type
DO $$ BEGIN
  CREATE TYPE public.d21_historique_revisions_entity_type_type AS ENUM ('competence', 'fiche_poste', 'referentiel_metier');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_passerelles_statut_type
DO $$ BEGIN
  CREATE TYPE public.d21_passerelles_statut_type AS ENUM ('active', 'obsolete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_passerelles_type_passerelle_type
DO $$ BEGIN
  CREATE TYPE public.d21_passerelles_type_passerelle_type AS ENUM ('horizontale', 'transversale', 'verticale');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_referentiel_mapping_referentiel_externe_type
DO $$ BEGIN
  CREATE TYPE public.d21_referentiel_mapping_referentiel_externe_type AS ENUM ('CITP', 'ESCO', 'O*NET', 'ROME');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d21_referentiel_metiers_statut_type
DO $$ BEGIN
  CREATE TYPE public.d21_referentiel_metiers_statut_type AS ENUM ('actif', 'en_revision', 'obsolete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d23_affectations_statut_type
DO $$ BEGIN
  CREATE TYPE public.d23_affectations_statut_type AS ENUM ('annulee', 'en_cours', 'terminee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d23_affectations_type_affectation_type
DO $$ BEGIN
  CREATE TYPE public.d23_affectations_type_affectation_type AS ENUM ('detache', 'mutation', 'temporaire', 'titulaire');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d23_structures_statut_type
DO $$ BEGIN
  CREATE TYPE public.d23_structures_statut_type AS ENUM ('actif', 'en_reorganisation', 'inactif');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d23_structures_type_type
DO $$ BEGIN
  CREATE TYPE public.d23_structures_type_type AS ENUM ('departement', 'direction', 'equipe', 'pole', 'service');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d24_demographie_rh_sexe_type
DO $$ BEGIN
  CREATE TYPE public.d24_demographie_rh_sexe_type AS ENUM ('F', 'M');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- d24_mouvements_effectifs_type_mouvement_type
DO $$ BEGIN
  CREATE TYPE public.d24_mouvements_effectifs_type_mouvement_type AS ENUM ('depart', 'embauche', 'mutation_externe', 'mutation_interne', 'promotion', 'retraite');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- SECTION 4: TABLES DU DEPARTEMENT 1 (49 tables)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.d02_contrats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  poste_id UUID,
  tenant_id UUID NOT NULL,
  type_contrat d02_contrats_type_contrat_type NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  statut d02_contrats_statut_type NOT NULL,
  salaire_base NUMERIC(15,2) NOT NULL,
  periodicite_paie d02_contrats_periodicite_paie_type,
  conventions_collectives_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_contrats_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d02_contrats_poste_id FOREIGN KEY (poste_id) REFERENCES public.postes ON DELETE CASCADE,
  CONSTRAINT fk_d02_contrats_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d02_contrats_conventions_collectives_id FOREIGN KEY (conventions_collectives_id) REFERENCES public.d05_conventions_collectives ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d02_avenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrat_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_avenant d02_avenants_type_avenant_type NOT NULL,
  date_effet DATE NOT NULL,
  ancien_valeur TEXT,
  nouvelle_valeur TEXT,
  motif TEXT,
  piece_jointe_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_avenants_contrat_id FOREIGN KEY (contrat_id) REFERENCES public.d02_contrats ON DELETE CASCADE,
  CONSTRAINT fk_d02_avenants_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d02_documents_employe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_document d02_documents_employe_type_document_type NOT NULL,
  fichier_storage_id UUID,
  date_emission DATE,
  date_expiration DATE,
  statut_validite d02_documents_employe_statut_validite_type,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_documents_employe_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d02_documents_employe_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d02_donnees_bancaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  rib TEXT NOT NULL,
  iban VARCHAR(34) NOT NULL,
  bic VARCHAR(11) NOT NULL,
  nom_banque VARCHAR(200),
  titulaire_compte VARCHAR(200) NOT NULL,
  est_principal BOOLEAN DEFAULT false,
  date_debut DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_donnees_bancaires_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d02_donnees_bancaires_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d02_mutuelle_prevoyance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  organisme VARCHAR(200) NOT NULL,
  type_couverture TEXT,
  numero_adhesion VARCHAR(50),
  date_adhesion DATE,
  montant_cotisation NUMERIC(15,2),
  part_employeur NUMERIC(5,2),
  part_salarie NUMERIC(5,2),
  statut d02_mutuelle_prevoyance_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_mutuelle_prevoyance_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d02_mutuelle_prevoyance_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d02_prets_avances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type d02_prets_avances_type_type NOT NULL,
  montant NUMERIC(15,2) NOT NULL,
  date_octroi DATE NOT NULL,
  mensualite NUMERIC(15,2),
  nb_echeances INTEGER,
  echeance_en_cours INTEGER DEFAULT 0,
  statut d02_prets_avances_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_prets_avances_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d02_prets_avances_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d02_sanctions_disciplinaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_sanction TEXT NOT NULL,
  motif TEXT NOT NULL,
  date_sanction DATE NOT NULL,
  decision TEXT,
  piece_jointe_id UUID,
  statut d02_sanctions_disciplinaires_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_sanctions_disciplinaires_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d02_sanctions_disciplinaires_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d02_visites_medicales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_visite d02_visites_medicales_type_visite_type NOT NULL,
  date_visite DATE NOT NULL,
  medecin VARCHAR(200),
  resultat d02_visites_medicales_resultat_type,
  observations TEXT,
  date_prochaine DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d02_visites_medicales_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d02_visites_medicales_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d05_elements_paie (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  contrat_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  periode DATE NOT NULL,
  type_element d05_elements_paie_type_element_type NOT NULL,
  libelle VARCHAR(200) NOT NULL,
  montant NUMERIC(15,2) NOT NULL,
  base_calcul NUMERIC(15,2),
  taux NUMERIC(7,4),
  statut d05_elements_paie_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_elements_paie_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d05_elements_paie_contrat_id FOREIGN KEY (contrat_id) REFERENCES public.d02_contrats ON DELETE CASCADE,
  CONSTRAINT fk_d05_elements_paie_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d05_bulletins_paie (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  contrat_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  periode DATE NOT NULL,
  salaire_brut NUMERIC(15,2) NOT NULL,
  total_cotisations NUMERIC(15,2),
  salaire_net NUMERIC(15,2) NOT NULL,
  net_imposable NUMERIC(15,2),
  nb_heures_travaillees NUMERIC(7,2),
  fichier_pdf_id UUID,
  statut d05_bulletins_paie_statut_type,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_bulletins_paie_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d05_bulletins_paie_contrat_id FOREIGN KEY (contrat_id) REFERENCES public.d02_contrats ON DELETE CASCADE,
  CONSTRAINT fk_d05_bulletins_paie_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d05_primes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_prime TEXT NOT NULL,
  montant NUMERIC(15,2) NOT NULL,
  periode DATE NOT NULL,
  motif TEXT,
  valide_par UUID,
  date_validation DATE,
  statut d05_primes_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_primes_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d05_primes_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d05_primes_valide_par FOREIGN KEY (valide_par) REFERENCES public.utilisateurs ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.d05_conventions_collectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  nom VARCHAR(300) NOT NULL,
  taux_horaire_min NUMERIC(7,2),
  grille_salaires JSONB,
  date_effet DATE,
  statut d05_conventions_collectives_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_conventions_collectives_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d05_retenues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_retenue TEXT NOT NULL,
  montant NUMERIC(15,2) NOT NULL,
  periode DATE NOT NULL,
  motif TEXT,
  statut TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_retenues_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d05_retenues_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d05_cotisations_sociales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  libelle VARCHAR(200) NOT NULL,
  taux_employeur NUMERIC(5,2) NOT NULL,
  taux_salarie NUMERIC(5,2) NOT NULL,
  plafond NUMERIC(15,2),
  statut TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_cotisations_sociales_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d05_historique_salaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  ancien_salaire NUMERIC(15,2) NOT NULL,
  nouveau_salaire NUMERIC(15,2) NOT NULL,
  date_effet DATE NOT NULL,
  motif TEXT,
  avenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_historique_salaires_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d05_historique_salaires_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d05_historique_salaires_avenant_id FOREIGN KEY (avenant_id) REFERENCES public.d02_avenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d05_previsions_paie (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  structure_id UUID,
  periode DATE NOT NULL,
  masse_salariale_prevue NUMERIC(15,2) NOT NULL,
  masse_salariale_reelle NUMERIC(15,2),
  ecart NUMERIC(15,2) GENERATED ALWAYS AS (masse_salariale_reelle - masse_salariale_prevue) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d05_previsions_paie_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d05_previsions_paie_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d12_conges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  contrat_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_conge d12_conges_type_conge_type NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  nb_jours NUMERIC(5,1) NOT NULL,
  motif TEXT,
  solde_avant NUMERIC(5,1),
  solde_apres NUMERIC(5,1),
  statut d12_conges_statut_type,
  valide_par_n1 UUID,
  date_validation_n1 DATE,
  valide_par_n2 UUID,
  date_validation_n2 DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d12_conges_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d12_conges_contrat_id FOREIGN KEY (contrat_id) REFERENCES public.d02_contrats ON DELETE CASCADE,
  CONSTRAINT fk_d12_conges_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d12_conges_valide_par_n1 FOREIGN KEY (valide_par_n1) REFERENCES public.utilisateurs ON DELETE SET NULL,
  CONSTRAINT fk_d12_conges_valide_par_n2 FOREIGN KEY (valide_par_n2) REFERENCES public.utilisateurs ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.d12_solde_conges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_conge TEXT NOT NULL,
  annee INTEGER NOT NULL,
  acquis NUMERIC(5,1) DEFAULT 0,
  pris NUMERIC(5,1) DEFAULT 0,
  solde NUMERIC(5,1) GENERATED ALWAYS AS (COALESCE(acquis, 0) + COALESCE(report_annee_prec, 0) - COALESCE(pris, 0)) STORED,
  report_annee_prec NUMERIC(5,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d12_solde_conges_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d12_solde_conges_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d12_absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_absence TEXT NOT NULL,
  date_debut TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ,
  duree_heures NUMERIC(5,2),
  motif TEXT,
  justifiee BOOLEAN DEFAULT false,
  piece_justificative_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d12_absences_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d12_absences_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d12_entrees_sorties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_mouvement d12_entrees_sorties_type_mouvement_type NOT NULL,
  date_mouvement DATE NOT NULL,
  motif_sortie TEXT,
  contrat_id UUID,
  documents_rendus TEXT[],
  solde_conges_reliquat NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d12_entrees_sorties_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d12_entrees_sorties_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d12_entrees_sorties_contrat_id FOREIGN KEY (contrat_id) REFERENCES public.d02_contrats ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d12_autorisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_autorisation TEXT NOT NULL,
  date_debut TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ NOT NULL,
  motif TEXT,
  valide_par UUID,
  statut d12_autorisations_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d12_autorisations_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d12_autorisations_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d12_autorisations_valide_par FOREIGN KEY (valide_par) REFERENCES public.utilisateurs ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.d12_compteurs_absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  periode DATE NOT NULL,
  total_heures NUMERIC(7,2),
  justifiees NUMERIC(7,2),
  non_justifiees NUMERIC(7,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d12_compteurs_absences_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d12_compteurs_absences_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d12_calendrier_jours_feries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  annee INTEGER NOT NULL,
  date_jour DATE NOT NULL,
  libelle VARCHAR(200) NOT NULL,
  type_jour d12_calendrier_jours_feries_type_jour_type NOT NULL,
  statut d12_calendrier_jours_feries_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d12_calendrier_jours_feries_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d04_plannings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  structure_id UUID,
  tenant_id UUID NOT NULL,
  type_planning d04_plannings_type_planning_type NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  horaire_debut TEXT,
  horaire_fin TEXT,
  nb_heures_prevues NUMERIC(5,2),
  statut d04_plannings_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d04_plannings_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d04_plannings_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d04_plannings_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d04_horaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  libelle VARCHAR(200) NOT NULL,
  type d04_horaires_type_type NOT NULL,
  horaires JSONB NOT NULL,
  duree_semaine NUMERIC(5,2) NOT NULL,
  est_default BOOLEAN DEFAULT false,
  statut d04_horaires_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d04_horaires_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d04_pointages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  date_pointage DATE NOT NULL,
  heure_entree TEXT,
  heure_sortie TEXT,
  nb_heures_travaillees NUMERIC(5,2),
  nb_heures_sup NUMERIC(5,2),
  planning_id UUID,
  source d04_pointages_source_type,
  est_regularise BOOLEAN DEFAULT false,
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d04_pointages_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d04_pointages_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d04_pointages_planning_id FOREIGN KEY (planning_id) REFERENCES public.d04_plannings ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d04_comptes_heures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  periode DATE NOT NULL,
  heures_normales NUMERIC(7,2) DEFAULT 0,
  heures_sup_25 NUMERIC(7,2) DEFAULT 0,
  heures_sup_50 NUMERIC(7,2) DEFAULT 0,
  heures_nuit NUMERIC(7,2) DEFAULT 0,
  heures_dimanche NUMERIC(7,2) DEFAULT 0,
  heures_astreinte NUMERIC(7,2) DEFAULT 0,
  solde_repos_compensatoire NUMERIC(7,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d04_comptes_heures_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d04_comptes_heures_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d04_absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  date_absence DATE NOT NULL,
  type d04_absences_type_type NOT NULL,
  duree_heures NUMERIC(5,2),
  justifiee BOOLEAN DEFAULT false,
  motif TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d04_absences_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d04_absences_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d04_jours_ouvrables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  annee INTEGER NOT NULL,
  date_jour DATE NOT NULL,
  type_jour d04_jours_ouvrables_type_jour_type NOT NULL,
  est_travaille BOOLEAN DEFAULT false,
  horaire_special JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d04_jours_ouvrables_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d04_equilibres_vp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  vp_acquises NUMERIC(5,2) DEFAULT 0,
  vp_utilisees NUMERIC(5,2) DEFAULT 0,
  vp_perdues NUMERIC(5,2) DEFAULT 0,
  solde NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d04_equilibres_vp_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d04_equilibres_vp_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d23_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  parent_id UUID,
  code VARCHAR(20) NOT NULL,
  nom VARCHAR(200) NOT NULL,
  type d23_structures_type_type NOT NULL,
  niveau INTEGER NOT NULL,
  responsable_id UUID,
  effectif_prevu INTEGER,
  effectif_reel INTEGER,
  date_effet DATE NOT NULL,
  nomenclature VARCHAR(50),
  budget_annuel NUMERIC(15,2),
  localisation VARCHAR(200),
  statut d23_structures_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d23_structures_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d23_structures_parent_id FOREIGN KEY (parent_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d23_structures_responsable_id FOREIGN KEY (responsable_id) REFERENCES public.employes ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d23_affectations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  structure_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  poste_id UUID,
  date_debut DATE NOT NULL,
  date_fin DATE,
  type_affectation d23_affectations_type_affectation_type NOT NULL,
  motif TEXT,
  statut d23_affectations_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d23_affectations_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d23_affectations_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d23_affectations_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d23_affectations_poste_id FOREIGN KEY (poste_id) REFERENCES public.postes ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d23_nomenclatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  libelle VARCHAR(200) NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  statut TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d23_nomenclatures_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d23_historique_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_modification TEXT NOT NULL,
  modifications JSONB NOT NULL,
  modifie_par UUID,
  date_modification DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d23_historique_structures_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d23_historique_structures_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d23_historique_structures_modifie_par FOREIGN KEY (modifie_par) REFERENCES public.utilisateurs ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.d23_entites_organisationnelles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  nom VARCHAR(200) NOT NULL,
  type TEXT NOT NULL,
  adresse TEXT,
  structure_rattachement_id UUID,
  statut TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d23_entites_organisationnelles_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d23_entites_organisationnelles_structure_rattachement_id FOREIGN KEY (structure_rattachement_id) REFERENCES public.d23_structures ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d23_postes_budgetaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  titre_poste VARCHAR(200) NOT NULL,
  nombre_postes INTEGER NOT NULL,
  postes_pourvus INTEGER,
  postes_vacants INTEGER,
  classification_id UUID,
  statut TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d23_postes_budgetaires_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d23_postes_budgetaires_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d23_postes_budgetaires_classification_id FOREIGN KEY (classification_id) REFERENCES public.d21_referentiel_metiers ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d24_previsions_effectifs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  periode DATE NOT NULL,
  effectif_prevu INTEGER NOT NULL,
  effectif_reel INTEGER,
  ecart INTEGER,
  taux_remplissage NUMERIC(5,2),
  besoins_recrutement INTEGER,
  departs_prevus INTEGER,
  commentaires TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d24_previsions_effectifs_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d24_previsions_effectifs_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d24_mouvements_effectifs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID,
  structure_id UUID,
  tenant_id UUID NOT NULL,
  type_mouvement d24_mouvements_effectifs_type_mouvement_type NOT NULL,
  date_mouvement DATE NOT NULL,
  motif TEXT,
  structure_origine_id UUID,
  structure_destination_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d24_mouvements_effectifs_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d24_mouvements_effectifs_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d24_mouvements_effectifs_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d24_mouvements_effectifs_structure_origine_id FOREIGN KEY (structure_origine_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d24_mouvements_effectifs_structure_destination_id FOREIGN KEY (structure_destination_id) REFERENCES public.d23_structures ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d24_tableau_bord_social (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  structure_id UUID,
  periode DATE NOT NULL,
  total_effectif INTEGER NOT NULL,
  embauches INTEGER,
  departs INTEGER,
  taux_turnover NUMERIC(5,2),
  masse_salariale NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d24_tableau_bord_social_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d24_tableau_bord_social_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d24_demographie_rh (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  periode DATE NOT NULL,
  tranche_age VARCHAR(20) NOT NULL,
  sexe d24_demographie_rh_sexe_type NOT NULL,
  effectif INTEGER NOT NULL,
  anciennete_moyenne NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d24_demographie_rh_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d24_indicateurs_effectifs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  structure_id UUID,
  periode DATE NOT NULL,
  taux_remplissage NUMERIC(5,2),
  taux_rotation NUMERIC(5,2),
  taux_stabilite NUMERIC(5,2),
  anciennete_moyenne NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d24_indicateurs_effectifs_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d24_indicateurs_effectifs_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d21_referentiel_metiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  parent_id UUID,
  code VARCHAR(20) NOT NULL,
  code_rome VARCHAR(10),
  code_esco VARCHAR(20),
  libelle VARCHAR(300) NOT NULL,
  niveau_hierarchique INTEGER NOT NULL,
  description TEXT,
  activites_principales TEXT[],
  competences_cles TEXT,
  statut d21_referentiel_metiers_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_referentiel_metiers_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d21_referentiel_metiers_parent_id FOREIGN KEY (parent_id) REFERENCES public.d21_referentiel_metiers ON DELETE CASCADE,
  CONSTRAINT fk_d21_referentiel_metiers_competences_cles FOREIGN KEY (competences_cles) REFERENCES public.d21_competences ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d21_fiches_poste (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  metier_id UUID NOT NULL,
  structure_id UUID,
  titre VARCHAR(200) NOT NULL,
  version INTEGER DEFAULT 1,
  statut d21_fiches_poste_statut_type,
  missions_principales TEXT[] NOT NULL,
  responsabilites TEXT[],
  conditions_travail TEXT,
  classification JSONB,
  remuneration_min NUMERIC(15,2),
  remuneration_max NUMERIC(15,2),
  experience_requise VARCHAR(100),
  formation_requise TEXT[],
  valide_par UUID,
  date_validation DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_fiches_poste_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d21_fiches_poste_metier_id FOREIGN KEY (metier_id) REFERENCES public.d21_referentiel_metiers ON DELETE CASCADE,
  CONSTRAINT fk_d21_fiches_poste_structure_id FOREIGN KEY (structure_id) REFERENCES public.d23_structures ON DELETE CASCADE,
  CONSTRAINT fk_d21_fiches_poste_valide_par FOREIGN KEY (valide_par) REFERENCES public.utilisateurs ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.d21_competences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  type d21_competences_type_type NOT NULL,
  code VARCHAR(20),
  libelle VARCHAR(200) NOT NULL,
  description TEXT,
  famille VARCHAR(100),
  niveaux_evaluation JSONB,
  referentiel_externe VARCHAR(50),
  statut d21_competences_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_competences_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d21_poste_competence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fiche_poste_id UUID NOT NULL,
  competence_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  niveau_requis INTEGER NOT NULL,
  poids NUMERIC(5,2) DEFAULT 1.0,
  est_obligatoire BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_poste_competence_fiche_poste_id FOREIGN KEY (fiche_poste_id) REFERENCES public.d21_fiches_poste ON DELETE CASCADE,
  CONSTRAINT fk_d21_poste_competence_competence_id FOREIGN KEY (competence_id) REFERENCES public.d21_competences ON DELETE CASCADE,
  CONSTRAINT fk_d21_poste_competence_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d21_passerelles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metier_source_id UUID NOT NULL,
  metier_cible_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type_passerelle d21_passerelles_type_passerelle_type NOT NULL,
  conditions JSONB,
  competences_a_acquerir TEXT,
  formation_recommandee TEXT,
  probabilite NUMERIC(5,2),
  statut d21_passerelles_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_passerelles_metier_source_id FOREIGN KEY (metier_source_id) REFERENCES public.d21_referentiel_metiers ON DELETE CASCADE,
  CONSTRAINT fk_d21_passerelles_metier_cible_id FOREIGN KEY (metier_cible_id) REFERENCES public.d21_referentiel_metiers ON DELETE CASCADE,
  CONSTRAINT fk_d21_passerelles_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d21_passerelles_competences_a_acquerir FOREIGN KEY (competences_a_acquerir) REFERENCES public.d21_competences ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d21_referentiel_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metier_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  referentiel_externe d21_referentiel_mapping_referentiel_externe_type NOT NULL,
  code_externe VARCHAR(50) NOT NULL,
  libelle_externe VARCHAR(300),
  taux_correspondance NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_referentiel_mapping_metier_id FOREIGN KEY (metier_id) REFERENCES public.d21_referentiel_metiers ON DELETE CASCADE,
  CONSTRAINT fk_d21_referentiel_mapping_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.d21_historique_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type d21_historique_revisions_entity_type_type NOT NULL,
  entity_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  version_avant INTEGER,
  version_apres INTEGER,
  modifications JSONB NOT NULL,
  modifie_par UUID,
  motif_modification TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_historique_revisions_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE,
  CONSTRAINT fk_d21_historique_revisions_modifie_par FOREIGN KEY (modifie_par) REFERENCES public.utilisateurs ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.d21_ecarts_competences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id UUID NOT NULL,
  fiche_poste_id UUID NOT NULL,
  competence_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  niveau_actuel INTEGER,
  niveau_requis INTEGER NOT NULL,
  ecart INTEGER,
  plan_action TEXT,
  priorite d21_ecarts_competences_priorite_type,
  date_analyse DATE NOT NULL,
  statut d21_ecarts_competences_statut_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_d21_ecarts_competences_employe_id FOREIGN KEY (employe_id) REFERENCES public.employes ON DELETE CASCADE,
  CONSTRAINT fk_d21_ecarts_competences_fiche_poste_id FOREIGN KEY (fiche_poste_id) REFERENCES public.d21_fiches_poste ON DELETE CASCADE,
  CONSTRAINT fk_d21_ecarts_competences_competence_id FOREIGN KEY (competence_id) REFERENCES public.d21_competences ON DELETE CASCADE,
  CONSTRAINT fk_d21_ecarts_competences_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants ON DELETE CASCADE
);

-- ============================================================
-- SECTION 5: INDEXS PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_d02_contrats_employe_id ON public.d02_contrats(employe_id);
CREATE INDEX IF NOT EXISTS idx_d02_contrats_poste_id ON public.d02_contrats(poste_id);
CREATE INDEX IF NOT EXISTS idx_d02_contrats_tenant_id ON public.d02_contrats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_contrats_type_contrat ON public.d02_contrats(type_contrat);
CREATE INDEX IF NOT EXISTS idx_d02_contrats_statut ON public.d02_contrats(statut);
CREATE INDEX IF NOT EXISTS idx_d02_avenants_contrat_id ON public.d02_avenants(contrat_id);
CREATE INDEX IF NOT EXISTS idx_d02_avenants_tenant_id ON public.d02_avenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_documents_employe_employe_id ON public.d02_documents_employe(employe_id);
CREATE INDEX IF NOT EXISTS idx_d02_documents_employe_tenant_id ON public.d02_documents_employe(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_donnees_bancaires_employe_id ON public.d02_donnees_bancaires(employe_id);
CREATE INDEX IF NOT EXISTS idx_d02_donnees_bancaires_tenant_id ON public.d02_donnees_bancaires(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_mutuelle_prevoyance_employe_id ON public.d02_mutuelle_prevoyance(employe_id);
CREATE INDEX IF NOT EXISTS idx_d02_mutuelle_prevoyance_tenant_id ON public.d02_mutuelle_prevoyance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_mutuelle_prevoyance_statut ON public.d02_mutuelle_prevoyance(statut);
CREATE INDEX IF NOT EXISTS idx_d02_prets_avances_employe_id ON public.d02_prets_avances(employe_id);
CREATE INDEX IF NOT EXISTS idx_d02_prets_avances_tenant_id ON public.d02_prets_avances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_prets_avances_statut ON public.d02_prets_avances(statut);
CREATE INDEX IF NOT EXISTS idx_d02_sanctions_disciplinaires_employe_id ON public.d02_sanctions_disciplinaires(employe_id);
CREATE INDEX IF NOT EXISTS idx_d02_sanctions_disciplinaires_tenant_id ON public.d02_sanctions_disciplinaires(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d02_sanctions_disciplinaires_statut ON public.d02_sanctions_disciplinaires(statut);
CREATE INDEX IF NOT EXISTS idx_d02_visites_medicales_employe_id ON public.d02_visites_medicales(employe_id);
CREATE INDEX IF NOT EXISTS idx_d02_visites_medicales_tenant_id ON public.d02_visites_medicales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_elements_paie_employe_id ON public.d05_elements_paie(employe_id);
CREATE INDEX IF NOT EXISTS idx_d05_elements_paie_contrat_id ON public.d05_elements_paie(contrat_id);
CREATE INDEX IF NOT EXISTS idx_d05_elements_paie_tenant_id ON public.d05_elements_paie(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_elements_paie_statut ON public.d05_elements_paie(statut);
CREATE INDEX IF NOT EXISTS idx_d05_bulletins_paie_employe_id ON public.d05_bulletins_paie(employe_id);
CREATE INDEX IF NOT EXISTS idx_d05_bulletins_paie_contrat_id ON public.d05_bulletins_paie(contrat_id);
CREATE INDEX IF NOT EXISTS idx_d05_bulletins_paie_tenant_id ON public.d05_bulletins_paie(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_bulletins_paie_statut ON public.d05_bulletins_paie(statut);
CREATE INDEX IF NOT EXISTS idx_d05_primes_employe_id ON public.d05_primes(employe_id);
CREATE INDEX IF NOT EXISTS idx_d05_primes_tenant_id ON public.d05_primes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_primes_periode ON public.d05_primes(periode);
CREATE INDEX IF NOT EXISTS idx_d05_primes_statut ON public.d05_primes(statut);
CREATE INDEX IF NOT EXISTS idx_d05_conventions_collectives_tenant_id ON public.d05_conventions_collectives(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_conventions_collectives_statut ON public.d05_conventions_collectives(statut);
CREATE INDEX IF NOT EXISTS idx_d05_retenues_employe_id ON public.d05_retenues(employe_id);
CREATE INDEX IF NOT EXISTS idx_d05_retenues_tenant_id ON public.d05_retenues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_retenues_periode ON public.d05_retenues(periode);
CREATE INDEX IF NOT EXISTS idx_d05_retenues_statut ON public.d05_retenues(statut);
CREATE INDEX IF NOT EXISTS idx_d05_cotisations_sociales_tenant_id ON public.d05_cotisations_sociales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_cotisations_sociales_statut ON public.d05_cotisations_sociales(statut);
CREATE INDEX IF NOT EXISTS idx_d05_historique_salaires_employe_id ON public.d05_historique_salaires(employe_id);
CREATE INDEX IF NOT EXISTS idx_d05_historique_salaires_tenant_id ON public.d05_historique_salaires(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_previsions_paie_tenant_id ON public.d05_previsions_paie(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d05_previsions_paie_structure_id ON public.d05_previsions_paie(structure_id);
CREATE INDEX IF NOT EXISTS idx_d12_conges_employe_id ON public.d12_conges(employe_id);
CREATE INDEX IF NOT EXISTS idx_d12_conges_contrat_id ON public.d12_conges(contrat_id);
CREATE INDEX IF NOT EXISTS idx_d12_conges_tenant_id ON public.d12_conges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d12_conges_type_conge ON public.d12_conges(type_conge);
CREATE INDEX IF NOT EXISTS idx_d12_conges_statut ON public.d12_conges(statut);
CREATE INDEX IF NOT EXISTS idx_d12_solde_conges_employe_id ON public.d12_solde_conges(employe_id);
CREATE INDEX IF NOT EXISTS idx_d12_solde_conges_tenant_id ON public.d12_solde_conges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d12_solde_conges_type_conge ON public.d12_solde_conges(type_conge);
CREATE INDEX IF NOT EXISTS idx_d12_absences_employe_id ON public.d12_absences(employe_id);
CREATE INDEX IF NOT EXISTS idx_d12_absences_tenant_id ON public.d12_absences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d12_absences_type_absence ON public.d12_absences(type_absence);
CREATE INDEX IF NOT EXISTS idx_d12_entrees_sorties_employe_id ON public.d12_entrees_sorties(employe_id);
CREATE INDEX IF NOT EXISTS idx_d12_entrees_sorties_tenant_id ON public.d12_entrees_sorties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d12_entrees_sorties_contrat_id ON public.d12_entrees_sorties(contrat_id);
CREATE INDEX IF NOT EXISTS idx_d12_autorisations_employe_id ON public.d12_autorisations(employe_id);
CREATE INDEX IF NOT EXISTS idx_d12_autorisations_tenant_id ON public.d12_autorisations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d12_autorisations_statut ON public.d12_autorisations(statut);
CREATE INDEX IF NOT EXISTS idx_d12_compteurs_absences_employe_id ON public.d12_compteurs_absences(employe_id);
CREATE INDEX IF NOT EXISTS idx_d12_compteurs_absences_tenant_id ON public.d12_compteurs_absences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d12_compteurs_absences_periode ON public.d12_compteurs_absences(periode);
CREATE INDEX IF NOT EXISTS idx_d12_calendrier_jours_feries_tenant_id ON public.d12_calendrier_jours_feries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d12_calendrier_jours_feries_statut ON public.d12_calendrier_jours_feries(statut);
CREATE INDEX IF NOT EXISTS idx_d04_plannings_employe_id ON public.d04_plannings(employe_id);
CREATE INDEX IF NOT EXISTS idx_d04_plannings_structure_id ON public.d04_plannings(structure_id);
CREATE INDEX IF NOT EXISTS idx_d04_plannings_tenant_id ON public.d04_plannings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d04_plannings_statut ON public.d04_plannings(statut);
CREATE INDEX IF NOT EXISTS idx_d04_horaires_tenant_id ON public.d04_horaires(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d04_horaires_statut ON public.d04_horaires(statut);
CREATE INDEX IF NOT EXISTS idx_d04_pointages_employe_id ON public.d04_pointages(employe_id);
CREATE INDEX IF NOT EXISTS idx_d04_pointages_tenant_id ON public.d04_pointages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d04_comptes_heures_employe_id ON public.d04_comptes_heures(employe_id);
CREATE INDEX IF NOT EXISTS idx_d04_comptes_heures_tenant_id ON public.d04_comptes_heures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d04_comptes_heures_periode ON public.d04_comptes_heures(periode);
CREATE INDEX IF NOT EXISTS idx_d04_absences_employe_id ON public.d04_absences(employe_id);
CREATE INDEX IF NOT EXISTS idx_d04_absences_tenant_id ON public.d04_absences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d04_jours_ouvrables_tenant_id ON public.d04_jours_ouvrables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d04_equilibres_vp_employe_id ON public.d04_equilibres_vp(employe_id);
CREATE INDEX IF NOT EXISTS idx_d04_equilibres_vp_tenant_id ON public.d04_equilibres_vp(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d23_structures_tenant_id ON public.d23_structures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d23_structures_statut ON public.d23_structures(statut);
CREATE INDEX IF NOT EXISTS idx_d23_affectations_employe_id ON public.d23_affectations(employe_id);
CREATE INDEX IF NOT EXISTS idx_d23_affectations_structure_id ON public.d23_affectations(structure_id);
CREATE INDEX IF NOT EXISTS idx_d23_affectations_tenant_id ON public.d23_affectations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d23_affectations_poste_id ON public.d23_affectations(poste_id);
CREATE INDEX IF NOT EXISTS idx_d23_affectations_statut ON public.d23_affectations(statut);
CREATE INDEX IF NOT EXISTS idx_d23_nomenclatures_tenant_id ON public.d23_nomenclatures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d23_nomenclatures_statut ON public.d23_nomenclatures(statut);
CREATE INDEX IF NOT EXISTS idx_d23_historique_structures_structure_id ON public.d23_historique_structures(structure_id);
CREATE INDEX IF NOT EXISTS idx_d23_historique_structures_tenant_id ON public.d23_historique_structures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d23_entites_organisationnelles_tenant_id ON public.d23_entites_organisationnelles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d23_entites_organisationnelles_statut ON public.d23_entites_organisationnelles(statut);
CREATE INDEX IF NOT EXISTS idx_d23_postes_budgetaires_structure_id ON public.d23_postes_budgetaires(structure_id);
CREATE INDEX IF NOT EXISTS idx_d23_postes_budgetaires_tenant_id ON public.d23_postes_budgetaires(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d23_postes_budgetaires_statut ON public.d23_postes_budgetaires(statut);
CREATE INDEX IF NOT EXISTS idx_d24_previsions_effectifs_structure_id ON public.d24_previsions_effectifs(structure_id);
CREATE INDEX IF NOT EXISTS idx_d24_previsions_effectifs_tenant_id ON public.d24_previsions_effectifs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d24_previsions_effectifs_periode ON public.d24_previsions_effectifs(periode);
CREATE INDEX IF NOT EXISTS idx_d24_mouvements_effectifs_employe_id ON public.d24_mouvements_effectifs(employe_id);
CREATE INDEX IF NOT EXISTS idx_d24_mouvements_effectifs_structure_id ON public.d24_mouvements_effectifs(structure_id);
CREATE INDEX IF NOT EXISTS idx_d24_mouvements_effectifs_tenant_id ON public.d24_mouvements_effectifs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d24_tableau_bord_social_tenant_id ON public.d24_tableau_bord_social(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d24_tableau_bord_social_structure_id ON public.d24_tableau_bord_social(structure_id);
CREATE INDEX IF NOT EXISTS idx_d24_tableau_bord_social_periode ON public.d24_tableau_bord_social(periode);
CREATE INDEX IF NOT EXISTS idx_d24_demographie_rh_tenant_id ON public.d24_demographie_rh(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d24_demographie_rh_periode ON public.d24_demographie_rh(periode);
CREATE INDEX IF NOT EXISTS idx_d24_indicateurs_effectifs_tenant_id ON public.d24_indicateurs_effectifs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d24_indicateurs_effectifs_structure_id ON public.d24_indicateurs_effectifs(structure_id);
CREATE INDEX IF NOT EXISTS idx_d24_indicateurs_effectifs_periode ON public.d24_indicateurs_effectifs(periode);
CREATE INDEX IF NOT EXISTS idx_d21_referentiel_metiers_tenant_id ON public.d21_referentiel_metiers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_referentiel_metiers_statut ON public.d21_referentiel_metiers(statut);
CREATE INDEX IF NOT EXISTS idx_d21_fiches_poste_tenant_id ON public.d21_fiches_poste(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_fiches_poste_structure_id ON public.d21_fiches_poste(structure_id);
CREATE INDEX IF NOT EXISTS idx_d21_fiches_poste_statut ON public.d21_fiches_poste(statut);
CREATE INDEX IF NOT EXISTS idx_d21_competences_tenant_id ON public.d21_competences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_competences_statut ON public.d21_competences(statut);
CREATE INDEX IF NOT EXISTS idx_d21_poste_competence_tenant_id ON public.d21_poste_competence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_passerelles_tenant_id ON public.d21_passerelles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_passerelles_statut ON public.d21_passerelles(statut);
CREATE INDEX IF NOT EXISTS idx_d21_referentiel_mapping_tenant_id ON public.d21_referentiel_mapping(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_historique_revisions_tenant_id ON public.d21_historique_revisions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_ecarts_competences_employe_id ON public.d21_ecarts_competences(employe_id);
CREATE INDEX IF NOT EXISTS idx_d21_ecarts_competences_tenant_id ON public.d21_ecarts_competences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_d21_ecarts_competences_statut ON public.d21_ecarts_competences(statut);
CREATE INDEX IF NOT EXISTS idx_employes_tenant_id ON public.employes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employes_matricule ON public.employes(matricule);
CREATE INDEX IF NOT EXISTS idx_employes_statut ON public.employes(statut);
CREATE INDEX IF NOT EXISTS idx_employes_nom ON public.employes(nom);
CREATE INDEX IF NOT EXISTS idx_employes_prenom ON public.employes(prenom);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_tenant_id ON public.utilisateurs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON public.utilisateurs(email);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_role ON public.utilisateurs(role);
CREATE INDEX IF NOT EXISTS idx_postes_tenant_id ON public.postes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_postes_titre ON public.postes(titre);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_est_actif ON public.tenants(est_actif);

-- ============================================================
-- SECTION 6: TRIGGERS (updated_at automatique)
-- ============================================================

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE tbl TEXT; BEGIN
  FOR tbl IN SELECT unnest(ARRAY['tenants','utilisateurs','employes','postes','d02_contrats','d02_avenants','d02_documents_employe','d02_donnees_bancaires','d02_mutuelle_prevoyance','d02_prets_avances','d02_sanctions_disciplinaires','d02_visites_medicales','d05_elements_paie','d05_bulletins_paie','d05_primes','d05_conventions_collectives','d05_retenues','d05_cotisations_sociales','d05_historique_salaires','d05_previsions_paie','d12_conges','d12_solde_conges','d12_absences','d12_entrees_sorties','d12_autorisations','d12_compteurs_absences','d12_calendrier_jours_feries','d04_plannings','d04_horaires','d04_pointages','d04_comptes_heures','d04_absences','d04_jours_ouvrables','d04_equilibres_vp','d23_structures','d23_affectations','d23_nomenclatures','d23_entites_organisationnelles','d23_postes_budgetaires','d24_previsions_effectifs','d24_mouvements_effectifs','d21_referentiel_metiers','d21_fiches_poste','d21_competences','d21_passerelles','d21_ecarts_competences']) LOOP
    EXECUTE format('DO $$ BEGIN CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;', tbl);
  END LOOP; END $$;

-- ============================================================
-- SECTION 7: ROW LEVEL SECURITY (RLS)
-- ============================================================

DO $$ DECLARE tbl TEXT; BEGIN
  FOR tbl IN SELECT unnest(ARRAY['tenants','utilisateurs','employes','postes','d02_contrats','d02_avenants','d02_documents_employe','d02_donnees_bancaires','d02_mutuelle_prevoyance','d02_prets_avances','d02_sanctions_disciplinaires','d02_visites_medicales','d05_elements_paie','d05_bulletins_paie','d05_primes','d05_conventions_collectives','d05_retenues','d05_cotisations_sociales','d05_historique_salaires','d05_previsions_paie','d12_conges','d12_solde_conges','d12_absences','d12_entrees_sorties','d12_autorisations','d12_compteurs_absences','d12_calendrier_jours_feries','d04_plannings','d04_horaires','d04_pointages','d04_comptes_heures','d04_absences','d04_jours_ouvrables','d04_equilibres_vp','d23_structures','d23_affectations','d23_nomenclatures','d23_historique_structures','d23_entites_organisationnelles','d23_postes_budgetaires','d24_previsions_effectifs','d24_mouvements_effectifs','d24_tableau_bord_social','d24_demographie_rh','d24_indicateurs_effectifs','d21_referentiel_metiers','d21_fiches_poste','d21_competences','d21_poste_competence','d21_passerelles','d21_referentiel_mapping','d21_historique_revisions','d21_ecarts_competences']) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP; END $$;

-- Isolation multi-tenant
CREATE POLICY employes_tenant_isolation ON public.employes
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY postes_tenant_isolation ON public.postes
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_contrats_tenant_isolation ON public.d02_contrats
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_avenants_tenant_isolation ON public.d02_avenants
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_documents_employe_tenant_isolation ON public.d02_documents_employe
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_donnees_bancaires_tenant_isolation ON public.d02_donnees_bancaires
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_mutuelle_prevoyance_tenant_isolation ON public.d02_mutuelle_prevoyance
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_prets_avances_tenant_isolation ON public.d02_prets_avances
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_sanctions_disciplinaires_tenant_isolation ON public.d02_sanctions_disciplinaires
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d02_visites_medicales_tenant_isolation ON public.d02_visites_medicales
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_elements_paie_tenant_isolation ON public.d05_elements_paie
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_bulletins_paie_tenant_isolation ON public.d05_bulletins_paie
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_primes_tenant_isolation ON public.d05_primes
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_conventions_collectives_tenant_isolation ON public.d05_conventions_collectives
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_retenues_tenant_isolation ON public.d05_retenues
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_cotisations_sociales_tenant_isolation ON public.d05_cotisations_sociales
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_historique_salaires_tenant_isolation ON public.d05_historique_salaires
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d05_previsions_paie_tenant_isolation ON public.d05_previsions_paie
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d12_conges_tenant_isolation ON public.d12_conges
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d12_solde_conges_tenant_isolation ON public.d12_solde_conges
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d12_absences_tenant_isolation ON public.d12_absences
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d12_entrees_sorties_tenant_isolation ON public.d12_entrees_sorties
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d12_autorisations_tenant_isolation ON public.d12_autorisations
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d12_compteurs_absences_tenant_isolation ON public.d12_compteurs_absences
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d12_calendrier_jours_feries_tenant_isolation ON public.d12_calendrier_jours_feries
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d04_plannings_tenant_isolation ON public.d04_plannings
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d04_horaires_tenant_isolation ON public.d04_horaires
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d04_pointages_tenant_isolation ON public.d04_pointages
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d04_comptes_heures_tenant_isolation ON public.d04_comptes_heures
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d04_absences_tenant_isolation ON public.d04_absences
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d04_jours_ouvrables_tenant_isolation ON public.d04_jours_ouvrables
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d04_equilibres_vp_tenant_isolation ON public.d04_equilibres_vp
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d23_structures_tenant_isolation ON public.d23_structures
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d23_affectations_tenant_isolation ON public.d23_affectations
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d23_nomenclatures_tenant_isolation ON public.d23_nomenclatures
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d23_historique_structures_tenant_isolation ON public.d23_historique_structures
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d23_entites_organisationnelles_tenant_isolation ON public.d23_entites_organisationnelles
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d23_postes_budgetaires_tenant_isolation ON public.d23_postes_budgetaires
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d24_previsions_effectifs_tenant_isolation ON public.d24_previsions_effectifs
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d24_mouvements_effectifs_tenant_isolation ON public.d24_mouvements_effectifs
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d24_tableau_bord_social_tenant_isolation ON public.d24_tableau_bord_social
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d24_demographie_rh_tenant_isolation ON public.d24_demographie_rh
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d24_indicateurs_effectifs_tenant_isolation ON public.d24_indicateurs_effectifs
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_referentiel_metiers_tenant_isolation ON public.d21_referentiel_metiers
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_fiches_poste_tenant_isolation ON public.d21_fiches_poste
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_competences_tenant_isolation ON public.d21_competences
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_poste_competence_tenant_isolation ON public.d21_poste_competence
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_passerelles_tenant_isolation ON public.d21_passerelles
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_referentiel_mapping_tenant_isolation ON public.d21_referentiel_mapping
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_historique_revisions_tenant_isolation ON public.d21_historique_revisions
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY d21_ecarts_competences_tenant_isolation ON public.d21_ecarts_competences
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY utilisateurs_self_read ON public.utilisateurs FOR SELECT USING (auth.uid() = id);
CREATE POLICY utilisateurs_self_update ON public.utilisateurs FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- SECTION 8: FONCTIONS UTILITAIRES
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.utilisateurs WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.utilisateurs WHERE id = auth.uid() AND role IN ('admin','rh','drh'));
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_solde_conges()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.statut = 'approuve' THEN
      UPDATE public.d12_solde_conges SET pris = COALESCE(pris, 0) + NEW.nb_jours
      WHERE employe_id = NEW.employe_id AND type_conge = NEW.type_conge AND annee = EXTRACT(YEAR FROM NEW.date_debut)::INTEGER;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.statut = 'approuve' THEN
      UPDATE public.d12_solde_conges SET pris = GREATEST(COALESCE(pris, 0) - OLD.nb_jours, 0)
      WHERE employe_id = OLD.employe_id AND type_conge = OLD.type_conge AND annee = EXTRACT(YEAR FROM OLD.date_debut)::INTEGER;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_solde_conges AFTER INSERT OR UPDATE OR DELETE ON public.d12_conges FOR EACH ROW EXECUTE FUNCTION public.update_solde_conges();

-- ============================================================
-- SECTION 9: JOURNAL D AUDIT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES public.utilisateurs(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, table_name VARCHAR(100) NOT NULL, record_id UUID,
  old_values JSONB, new_values JSONB, ip_address VARCHAR(45), user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_tenant_isolation ON public.audit_logs USING (tenant_id = get_current_tenant_id());

-- ============================================================
-- SECTION 10: VERIFICATION
-- ============================================================
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- Resultat attendu: 54 tables (49 Dept 1 + 4 communes + 1 audit)
