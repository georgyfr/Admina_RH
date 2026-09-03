// ============================================================
// Domaine 2 — Gestion Administrative du Personnel
// Données mock (basées sur le fichier Excel de référence)
// Structure transposable vers Supabase (tables d02_*)
// ============================================================

// --- Nomenclatures (extraites de la feuille _Lists du fichier Excel) ---
export const NOMENCLATURES = {
  civilite: ['M.', 'Mme', 'Mlle'],
  genre: ['Masculin', 'Feminin'],
  situation_fam: ['Celibataire', 'Marie(e)', 'Divorce(e)', 'Veuf(ve)'],
  nationalite: ['Camerounaise', 'Gabonaise', 'Senegalaise', 'Ivoirienne', 'Française'],
  statut_employe: ['Actif', 'Inactif', 'Suspendu', 'Essai'],
  type_contrat: ['CDI', 'CDD', 'Stage', 'Interim', 'Apprentissage'],
  categorie_salarie: ['Cadre', 'Maitrise', 'Execution', 'Stagiaire'],
  regime_travail: ['Temps plein', 'Temps partiel', '25h/sem', '40h/sem'],
  departement: ['Administration', 'Finance', 'Comptabilite', 'Restauration', 'Hebergement', 'Maintenance', 'Securite', 'Ressources Humaines', 'Marketing', 'Logistique'],
  statut_contrat: ['En vigueur', 'Echu', 'Resilie', 'Suspendu'],
  type_avenant: ['Salaire', 'Poste', 'Temps partiel', 'Lieu travail', 'Promotion'],
  type_document: ['CNI', 'Passeport', 'Attestation CNPS', 'Casier judiciaire', 'Certificat medical', 'Diplome', 'RIB bancaire', 'Photo identite', 'Certificat domicile', 'Contrat precedent'],
  statut_document: ['Valide', 'A renouveler', 'Expire'],
  lieu_depot: ['Dossier physique', 'Coffre fort', 'Archive numerique', 'Service RH'],
  banque: ['Afriland First Bank', 'BICEC', 'SGBC', 'UBA', 'Ecobank', 'BGFI', 'Standard Chartered', 'Banque Atlantique'],
  statut_rib: ['Actif', 'Inactif', 'A verifier'],
  organisme_prevo: ['ACTIVA Assurances', 'SUNU Vie', 'Saham Assurance', 'AXA Cameroun', 'Beneficial Life'],
  couverture: ['Individuelle', 'Familiale', 'Conjoint', 'Enfants'],
  statut_adhesion: ['Active', 'Suspendue', 'Resiliee'],
  type_conge: ['conge_annuel', 'conge_maladie', 'conge_maternite', 'conge_paternite', 'conge_marriage', 'conge_deuil', 'conge_sans_solde', 'conge_exceptionnel'],
  statut_conge: ['en_attente', 'approuvee', 'rejetee', 'annulee'],
  type_absence: ['maladie', 'accident_travail', 'hospitalisation', 'quarantaine', 'conge_maternite', 'conge_paternite', 'absence_autorisee', 'absence_non_justifiee'],
  statut_absence: ['en_attente', 'justifiee', 'non_justifiee', 'rejetee'],
  statut_heures: ['en_attente', 'validee', 'rejetee', 'payee'],
  taux_majoration: ['100%', '125%', '150%'],
  statut_paie: ['generee', 'validee', 'payee'],
  mode_paie: ['Virement', 'Cheque', 'Especes'],
  organisme_social: ['CNPS', 'CNP', 'Direction des Impots', 'DGI', 'MINTSS'],
  type_declaration: ['Mensuelle', 'Trimestrielle', 'Annuelle'],
  statut_declaration: ['soumise', 'en_retard', 'validee'],
  type_permit: ['Permis travail', 'Carte sejour', 'Visa long sejour', 'Titre de sejour'],
  statut_permit: ['Valide', 'A renouveler', 'En renouvellement', 'Expire'],
  autorite: ['MINTSS', 'DGSN', 'Ministere Interieur', 'Delegation Generale'],
  motif_depart: ['demission', 'licenciement', 'fin_cdd', 'retraite', 'deces'],
  statut_dossier: ['en_cours', 'en_attente_piece', 'clos'],
  type_pret: ['avance_salaire', 'pret_social', 'pret_logement'],
  statut_pret: ['demande', 'accorde', 'en_remboursement', 'solde', 'refuse'],
  type_sanction: ['avertissement_oral', 'avertissement_ecrit', 'blame', 'suspension'],
  statut_sanction: ['notififiee', 'en_execution', 'executee', 'annulee'],
  type_visite: ['embauche', 'periodique', 'reprise', 'demandee'],
  aptitude: ['apte', 'apte_avec_restrictions', 'inapte_temporaire', 'inapte_definitif'],
};

// --- 20 Employés (mock basé sur l'échantillon Excel : EMP-001 Nganou Clarisse...) ---
export const EMPLOYEES = [
  { id: 'emp-001', matricule: 'EMP-001', civilite: 'Mme', nom: 'Nganou', prenom: 'Clarisse', date_naissance: '1988-03-15', lieu_naissance: 'Douala', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '699123456', email: 'c.nganou@admina-rh.cm', adresse: 'Bonanjo, Douala', departement: 'Administration', poste: 'Directrice Administrative', type_contrat: 'CDI', categorie: 'Cadre', regime_travail: 'Temps plein', date_embauche: '2019-01-15', salaire_brut: 1250000, lieu_travail: 'Douala Siege', statut: 'Actif', photo_url: '' },
  { id: 'emp-002', matricule: 'EMP-002', civilite: 'M.', nom: 'Tchinda', prenom: 'Armand', date_naissance: '1992-07-22', lieu_naissance: 'Yaoundé', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Celibataire', telephone: '677234567', email: 'a.tchinda@admina-rh.cm', adresse: 'Bastos, Yaoundé', departement: 'Finance', poste: 'Responsable Financier', type_contrat: 'CDI', categorie: 'Cadre', regime_travail: 'Temps plein', date_embauche: '2020-03-01', salaire_brut: 980000, lieu_travail: 'Yaoundé', statut: 'Actif', photo_url: '' },
  { id: 'emp-003', matricule: 'EMP-003', civilite: 'M.', nom: 'Foka', prenom: 'Jean-Paul', date_naissance: '1985-11-03', lieu_naissance: 'Bafoussam', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '690345678', email: 'jp.foka@admina-rh.cm', adresse: 'Dla Bonapriso', departement: 'Restauration', poste: 'Chef Cuisinier', type_contrat: 'CDI', categorie: 'Maitrise', regime_travail: 'Temps plein', date_embauche: '2018-06-10', salaire_brut: 750000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-004', matricule: 'EMP-004', civilite: 'Mme', nom: 'Beti', prenom: 'Sandrine', date_naissance: '1995-04-18', lieu_naissance: 'Garoua', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Celibataire', telephone: '691456789', email: 's.beti@admina-rh.cm', adresse: 'Akwa, Douala', departement: 'Ressources Humaines', poste: 'Assistante RH', type_contrat: 'CDI', categorie: 'Execution', regime_travail: 'Temps plein', date_embauche: '2021-09-01', salaire_brut: 420000, lieu_travail: 'Douala Siege', statut: 'Actif', photo_url: '' },
  { id: 'emp-005', matricule: 'EMP-005', civilite: 'M.', nom: 'Kamga', prenom: 'Brice', date_naissance: '1990-12-25', lieu_naissance: 'Nkongsamba', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '692567890', email: 'b.kamga@admina-rh.cm', adresse: 'Bonapriso, Douala', departement: 'Maintenance', poste: 'Technicien Senior', type_contrat: 'CDI', categorie: 'Maitrise', regime_travail: 'Temps plein', date_embauche: '2019-11-15', salaire_brut: 580000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-006', matricule: 'EMP-006', civilite: 'Mme', nom: 'Essomba', prenom: 'Marie', date_naissance: '1993-08-12', lieu_naissance: 'Yaoundé', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '693678901', email: 'm.essomba@admina-rh.cm', adresse: 'Mvog-Mbi, Yaoundé', departement: 'Comptabilite', poste: 'Comptable', type_contrat: 'CDI', categorie: 'Maitrise', regime_travail: 'Temps plein', date_embauche: '2020-07-01', salaire_brut: 520000, lieu_travail: 'Yaoundé', statut: 'Actif', photo_url: '' },
  { id: 'emp-007', matricule: 'EMP-007', civilite: 'M.', nom: 'Nkomo', prenom: 'Patrick', date_naissance: '1987-02-14', lieu_naissance: 'Douala', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Divorce(e)', telephone: '694789012', email: 'p.nkomo@admina-rh.cm', adresse: 'Akwa, Douala', departement: 'Securite', poste: 'Chef Securite', type_contrat: 'CDI', categorie: 'Maitrise', regime_travail: 'Temps plein', date_embauche: '2017-04-20', salaire_brut: 480000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-008', matricule: 'EMP-008', civilite: 'Mme', nom: 'Atangana', prenom: 'Christelle', date_naissance: '1996-06-30', lieu_naissance: 'Yaoundé', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Celibataire', telephone: '695890123', email: 'c.atangana@admina-rh.cm', adresse: 'Bastos, Yaoundé', departement: 'Marketing', poste: 'Chargee Communication', type_contrat: 'CDD', categorie: 'Execution', regime_travail: 'Temps plein', date_embauche: '2024-02-01', salaire_brut: 450000, lieu_travail: 'Yaoundé', statut: 'Essai', photo_url: '' },
  { id: 'emp-009', matricule: 'EMP-009', civilite: 'M.', nom: 'Bidjocka', prenom: 'Eric', date_naissance: '1989-09-05', lieu_naissance: 'Bafoussam', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '696901234', email: 'e.bidjocka@admina-rh.cm', adresse: 'Dla Bonanjo', departement: 'Hebergement', poste: 'Responsable Hebergement', type_contrat: 'CDI', categorie: 'Cadre', regime_travail: 'Temps plein', date_embauche: '2019-05-15', salaire_brut: 820000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-010', matricule: 'EMP-010', civilite: 'Mme', nom: 'Tsogo', prenom: 'Aline', date_naissance: '1994-01-22', lieu_naissance: 'Edéa', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Celibataire', telephone: '697012345', email: 'a.tsogo@admina-rh.cm', adresse: 'Akwa, Douala', departement: 'Restauration', poste: 'Serveuse', type_contrat: 'CDD', categorie: 'Execution', regime_travail: 'Temps plein', date_embauche: '2023-10-01', salaire_brut: 180000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-011', matricule: 'EMP-011', civilite: 'M.', nom: 'Mvondo', prenom: 'Samuel', date_naissance: '1991-05-17', lieu_naissance: 'Yaoundé', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '698123456', email: 's.mvondo@admina-rh.cm', adresse: 'Mvan, Yaoundé', departement: 'Logistique', poste: 'Responsable Logistique', type_contrat: 'CDI', categorie: 'Cadre', regime_travail: 'Temps plein', date_embauche: '2020-01-10', salaire_brut: 690000, lieu_travail: 'Yaoundé', statut: 'Actif', photo_url: '' },
  { id: 'emp-012', matricule: 'EMP-012', civilite: 'M.', nom: 'Etoa', prenom: 'David', date_naissance: '1983-10-08', lieu_naissance: 'Bamenda', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '699234567', email: 'd.etoa@admina-rh.cm', adresse: 'Bonanjo, Douala', departement: 'Administration', poste: 'Directeur General', type_contrat: 'CDI', categorie: 'Cadre', regime_travail: 'Temps plein', date_embauche: '2015-01-05', salaire_brut: 1800000, lieu_travail: 'Douala Siege', statut: 'Actif', photo_url: '' },
  { id: 'emp-013', matricule: 'EMP-013', civilite: 'Mme', nom: 'Foko', prenom: 'Nadine', date_naissance: '1997-03-11', lieu_naissance: 'Limbé', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Celibataire', telephone: '690345670', email: 'n.foko@admina-rh.cm', adresse: 'Bonapriso, Douala', departement: 'Ressources Humaines', poste: 'Stagiaire RH', type_contrat: 'Stage', categorie: 'Stagiaire', regime_travail: 'Temps plein', date_embauche: '2024-09-01', salaire_brut: 80000, lieu_travail: 'Douala Siege', statut: 'Essai', photo_url: '' },
  { id: 'emp-014', matricule: 'EMP-014', civilite: 'M.', nom: 'Bekolo', prenom: 'Herve', date_naissance: '1988-07-19', lieu_naissance: 'Douala', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '691456701', email: 'h.bekolo@admina-rh.cm', adresse: 'Akwa, Douala', departement: 'Maintenance', poste: 'Chef Maintenance', type_contrat: 'CDI', categorie: 'Maitrise', regime_travail: 'Temps plein', date_embauche: '2018-02-01', salaire_brut: 650000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-015', matricule: 'EMP-015', civilite: 'Mme', nom: 'Nguea', prenom: 'Sophie', date_naissance: '1992-11-27', lieu_naissance: 'Kribi', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '692567012', email: 's.nguea@admina-rh.cm', adresse: 'Bastos, Yaoundé', departement: 'Finance', poste: 'Analyste Financier', type_contrat: 'CDI', categorie: 'Cadre', regime_travail: 'Temps plein', date_embauche: '2021-01-15', salaire_brut: 720000, lieu_travail: 'Yaoundé', statut: 'Actif', photo_url: '' },
  { id: 'emp-016', matricule: 'EMP-016', civilite: 'M.', nom: 'Abena', prenom: 'Guy', date_naissance: '1994-04-03', lieu_naissance: 'Buea', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Celibataire', telephone: '693670123', email: 'g.abena@admina-rh.cm', adresse: 'Mvan, Yaoundé', departement: 'Securite', poste: 'Agent Securite', type_contrat: 'CDD', categorie: 'Execution', regime_travail: 'Temps plein', date_embauche: '2023-06-01', salaire_brut: 220000, lieu_travail: 'Yaoundé', statut: 'Actif', photo_url: '' },
  { id: 'emp-017', matricule: 'EMP-017', civilite: 'Mme', nom: 'Kouam', prenom: 'Bertrand', date_naissance: '1986-08-16', lieu_naissance: 'Douala', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '694780234', email: 'b.kouam@admina-rh.cm', adresse: 'Bonapriso, Douala', departement: 'Restauration', poste: 'Maitre Hotel', type_contrat: 'CDI', categorie: 'Maitrise', regime_travail: 'Temps plein', date_embauche: '2016-09-01', salaire_brut: 540000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-018', matricule: 'EMP-018', civilite: 'Mme', nom: 'Ngo Bell', prenom: 'Jacqueline', date_naissance: '1990-12-01', lieu_naissance: 'Yaoundé', genre: 'Feminin', nationalite: 'Camerounaise', situation_familiale: 'Divorce(e)', telephone: '695890345', email: 'j.ngobell@admina-rh.cm', adresse: 'Mokolo, Yaoundé', departement: 'Comptabilite', poste: 'Comptable Senior', type_contrat: 'CDI', categorie: 'Maitrise', regime_travail: 'Temps plein', date_embauche: '2019-03-15', salaire_brut: 580000, lieu_travail: 'Yaoundé', statut: 'Actif', photo_url: '' },
  { id: 'emp-019', matricule: 'EMP-019', civilite: 'M.', nom: 'Talla', prenom: 'Emmanuel', date_naissance: '1995-02-09', lieu_naissance: 'Bafoussam', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Celibataire', telephone: '696901456', email: 'e.talla@admina-rh.cm', adresse: 'Akwa, Douala', departement: 'Marketing', poste: 'Community Manager', type_contrat: 'CDI', categorie: 'Execution', regime_travail: 'Temps plein', date_embauche: '2022-04-01', salaire_brut: 380000, lieu_travail: 'Douala', statut: 'Actif', photo_url: '' },
  { id: 'emp-020', matricule: 'EMP-020', civilite: 'M.', nom: 'Ze', prenom: 'Aristide', date_naissance: '1982-06-21', lieu_naissance: 'Garoua', genre: 'Masculin', nationalite: 'Camerounaise', situation_familiale: 'Marie(e)', telephone: '697012567', email: 'a.ze@admina-rh.cm', adresse: 'Bonanjo, Douala', departement: 'Hebergement', poste: 'Receptionniste', type_contrat: 'CDI', categorie: 'Execution', regime_travail: 'Temps plein', date_embauche: '2017-08-01', salaire_brut: 320000, lieu_travail: 'Douala', statut: 'Inactif', photo_url: '' },
];

export const findEmployee = (id) => EMPLOYEES.find(e => e.id === id || e.matricule === id);
export const employeeFullName = (e) => e ? `${e.prenom} ${e.nom}` : '';

// --- Contrats ---
export const CONTRATS = [
  { id: 'ctr-001', contract_number: 'CTR-2025-001', employee_id: 'emp-001', type_contrat: 'CDI', date_debut: '2019-01-15', date_fin: null, salaire_brut: 1250000, regime_travail: 'Temps plein', lieu_travail: 'Douala Siege', statut: 'En vigueur', observations: '' },
  { id: 'ctr-002', contract_number: 'CTR-2025-002', employee_id: 'emp-002', type_contrat: 'CDI', date_debut: '2020-03-01', date_fin: null, salaire_brut: 980000, regime_travail: 'Temps plein', lieu_travail: 'Yaoundé', statut: 'En vigueur', observations: '' },
  { id: 'ctr-003', contract_number: 'CTR-2024-003', employee_id: 'emp-003', type_contrat: 'CDI', date_debut: '2018-06-10', date_fin: null, salaire_brut: 750000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' },
  { id: 'ctr-004', contract_number: 'CTR-2025-004', employee_id: 'emp-004', type_contrat: 'CDI', date_debut: '2021-09-01', date_fin: null, salaire_brut: 420000, regime_travail: 'Temps plein', lieu_travail: 'Douala Siege', statut: 'En vigueur', observations: '' },
  { id: 'ctr-005', contract_number: 'CTR-2025-005', employee_id: 'emp-005', type_contrat: 'CDI', date_debut: '2019-11-15', date_fin: null, salaire_brut: 580000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' },
  { id: 'ctr-006', contract_number: 'CTR-2025-006', employee_id: 'emp-006', type_contrat: 'CDI', date_debut: '2020-07-01', date_fin: null, salaire_brut: 520000, regime_travail: 'Temps plein', lieu_travail: 'Yaoundé', statut: 'En vigueur', observations: '' },
  { id: 'ctr-007', contract_number: 'CTR-2017-007', employee_id: 'emp-007', type_contrat: 'CDI', date_debut: '2017-04-20', date_fin: null, salaire_brut: 480000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' },
  { id: 'ctr-008', contract_number: 'CTR-2024-008', employee_id: 'emp-008', type_contrat: 'CDD', date_debut: '2024-02-01', date_fin: '2025-01-31', salaire_brut: 450000, regime_travail: 'Temps plein', lieu_travail: 'Yaoundé', statut: 'En vigueur', observations: 'CDD 12 mois renouvelable' },
  { id: 'ctr-009', contract_number: 'CTR-2019-009', employee_id: 'emp-009', type_contrat: 'CDI', date_debut: '2019-05-15', date_fin: null, salaire_brut: 820000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' },
  { id: 'ctr-010', contract_number: 'CTR-2023-010', employee_id: 'emp-010', type_contrat: 'CDD', date_debut: '2023-10-01', date_fin: '2024-09-30', salaire_brut: 180000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'Echu', observations: 'CDD termine, non renouvele' },
  { id: 'ctr-011', contract_number: 'CTR-2020-011', employee_id: 'emp-011', type_contrat: 'CDI', date_debut: '2020-01-10', date_fin: null, salaire_brut: 690000, regime_travail: 'Temps plein', lieu_travail: 'Yaoundé', statut: 'En vigueur', observations: '' },
  { id: 'ctr-012', contract_number: 'CTR-2015-012', employee_id: 'emp-012', type_contrat: 'CDI', date_debut: '2015-01-05', date_fin: null, salaire_brut: 1800000, regime_travail: 'Temps plein', lieu_travail: 'Douala Siege', statut: 'En vigueur', observations: 'Cadre dirigeant' },
  { id: 'ctr-013', contract_number: 'CTR-2024-013', employee_id: 'emp-013', type_contrat: 'Stage', date_debut: '2024-09-01', date_fin: '2024-11-30', salaire_brut: 80000, regime_travail: 'Temps plein', lieu_travail: 'Douala Siege', statut: 'En vigueur', observations: 'Stage Master 2 RH' },
  { id: 'ctr-014', contract_number: 'CTR-2018-014', employee_id: 'emp-014', type_contrat: 'CDI', date_debut: '2018-02-01', date_fin: null, salaire_brut: 650000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' },
  { id: 'ctr-015', contract_number: 'CTR-2021-015', employee_id: 'emp-015', type_contrat: 'CDI', date_debut: '2021-01-15', date_fin: null, salaire_brut: 720000, regime_travail: 'Temps plein', lieu_travail: 'Yaoundé', statut: 'En vigueur', observations: '' },
  { id: 'ctr-016', contract_number: 'CTR-2023-016', employee_id: 'emp-016', type_contrat: 'CDD', date_debut: '2023-06-01', date_fin: '2025-05-31', salaire_brut: 220000, regime_travail: 'Temps plein', lieu_travail: 'Yaoundé', statut: 'En vigueur', observations: 'CDD 24 mois' },
  { id: 'ctr-017', contract_number: 'CTR-2016-017', employee_id: 'emp-017', type_contrat: 'CDI', date_debut: '2016-09-01', date_fin: null, salaire_brut: 540000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' },
  { id: 'ctr-018', contract_number: 'CTR-2019-018', employee_id: 'emp-018', type_contrat: 'CDI', date_debut: '2019-03-15', date_fin: null, salaire_brut: 580000, regime_travail: 'Temps plein', lieu_travail: 'Yaoundé', statut: 'En vigueur', observations: '' },
  { id: 'ctr-019', contract_number: 'CTR-2022-019', employee_id: 'emp-019', type_contrat: 'CDI', date_debut: '2022-04-01', date_fin: null, salaire_brut: 380000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'En vigueur', observations: '' },
  { id: 'ctr-020', contract_number: 'CTR-2017-020', employee_id: 'emp-020', type_contrat: 'CDI', date_debut: '2017-08-01', date_fin: null, salaire_brut: 320000, regime_travail: 'Temps plein', lieu_travail: 'Douala', statut: 'Resilie', observations: 'Resilie pour faute grave' },
];

// --- Congés ---
export const CONGES = [
  { id: 'cng-001', leave_number: 'CG-2025-001', employee_id: 'emp-001', type_conge: 'conge_annuel', date_debut: '2025-07-15', date_fin: '2025-07-30', nombre_jours: 16, motif: 'Vacances familiales', statut: 'approuvee', date_approbation: '2025-06-20', approbateur: 'emp-012' },
  { id: 'cng-002', leave_number: 'CG-2025-002', employee_id: 'emp-002', type_conge: 'conge_annuel', date_debut: '2025-12-20', date_fin: '2026-01-05', nombre_jours: 17, motif: 'Fetes de fin annee', statut: 'en_attente', date_approbation: null, approbateur: null },
  { id: 'cng-003', leave_number: 'CG-2025-003', employee_id: 'emp-004', type_conge: 'conge_maladie', date_debut: '2025-09-10', date_fin: '2025-09-14', nombre_jours: 5, motif: 'Paludisme', statut: 'approuvee', date_approbation: '2025-09-10', approbateur: 'emp-001' },
  { id: 'cng-004', leave_number: 'CG-2025-004', employee_id: 'emp-008', type_conge: 'conge_maternite', date_debut: '2025-10-01', date_fin: '2026-01-14', nombre_jours: 106, motif: 'Conge maternite legal', statut: 'approuvee', date_approbation: '2025-09-15', approbateur: 'emp-012' },
  { id: 'cng-005', leave_number: 'CG-2025-005', employee_id: 'emp-010', type_conge: 'conge_annuel', date_debut: '2025-08-05', date_fin: '2025-08-20', nombre_jours: 16, motif: 'Vacances', statut: 'rejetee', date_approbation: '2025-07-25', approbateur: 'emp-009' },
  { id: 'cng-006', leave_number: 'CG-2025-006', employee_id: 'emp-015', type_conge: 'conge_marriage', date_debut: '2025-11-10', date_fin: '2025-11-17', nombre_jours: 7, motif: 'Mariage civil', statut: 'approuvee', date_approbation: '2025-10-15', approbateur: 'emp-011' },
  { id: 'cng-007', leave_number: 'CG-2025-007', employee_id: 'emp-019', type_conge: 'conge_exceptionnel', date_debut: '2025-09-25', date_fin: '2025-09-27', nombre_jours: 3, motif: 'Bapteme enfant', statut: 'en_attente', date_approbation: null, approbateur: null },
  { id: 'cng-008', leave_number: 'CG-2025-008', employee_id: 'emp-007', type_conge: 'conge_deuil', date_debut: '2025-06-12', date_fin: '2025-06-18', nombre_jours: 6, motif: 'Deces pere', statut: 'approuvee', date_approbation: '2025-06-12', approbateur: 'emp-012' },
];

// --- Soldes de congés ---
export const SOLDES_CONGES = EMPLOYEES.map(e => {
  const pris = CONGES.filter(c => c.employee_id === e.id && c.statut === 'approuvee' && c.type_conge === 'conge_annuel').reduce((s, c) => s + c.nombre_jours, 0);
  const enCours = CONGES.filter(c => c.employee_id === e.id && c.statut === 'en_attente').reduce((s, c) => s + c.nombre_jours, 0);
  const droit = e.categorie === 'Cadre' ? 30 : 26;
  return { employee_id: e.id, annee: 2025, droit_annuel_jours: droit, conges_pris_jours: pris, solde_disponible: droit - pris, conges_en_cours: enCours, report_n1_jours: 0, taux_utilisation: Math.round((pris / droit) * 100), statut: 'actif' };
});

// --- Documents ---
export const DOCUMENTS = [
  { id: 'doc-001', employee_id: 'emp-001', document_number: 'DOC-001', type_document: 'CNI', numero_document: 'ID-123456789', date_emission: '2014-03-15', date_expiration: '2025-09-15', statut: 'A renouveler', lieu_depot: 'Dossier physique', notes: '' },
  { id: 'doc-002', employee_id: 'emp-001', document_number: 'DOC-002', type_document: 'RIB bancaire', numero_document: 'RIB-001', date_emission: '2019-01-10', date_expiration: null, statut: 'Valide', lieu_depot: 'Service RH', notes: 'Afriland First Bank' },
  { id: 'doc-003', employee_id: 'emp-002', document_number: 'DOC-003', type_document: 'Attestation CNPS', numero_document: 'CNPS-456', date_emission: '2020-02-28', date_expiration: '2026-02-28', statut: 'Valide', lieu_depot: 'Dossier physique', notes: '' },
  { id: 'doc-004', employee_id: 'emp-003', document_number: 'DOC-004', type_document: 'Certificat medical', numero_document: 'MED-789', date_emission: '2018-06-05', date_expiration: '2026-06-05', statut: 'Valide', lieu_depot: 'Archive numerique', notes: '' },
  { id: 'doc-005', employee_id: 'emp-004', document_number: 'DOC-005', type_document: 'CNI', numero_document: 'ID-987654321', date_emission: '2016-08-20', date_expiration: '2026-08-20', statut: 'Valide', lieu_depot: 'Dossier physique', notes: '' },
  { id: 'doc-006', employee_id: 'emp-008', document_number: 'DOC-006', type_document: 'Passeport', numero_document: 'P-012345', date_emission: '2022-01-15', date_expiration: '2025-10-01', statut: 'Expire', lieu_depot: 'Coffre fort', notes: 'Renouvellement urgent' },
  { id: 'doc-007', employee_id: 'emp-010', document_number: 'DOC-007', type_document: 'Casier judiciaire', numero_document: 'CJ-456789', date_emission: '2023-09-15', date_expiration: '2025-09-15', statut: 'Expire', lieu_depot: 'Dossier physique', notes: '' },
  { id: 'doc-008', employee_id: 'emp-013', document_number: 'DOC-008', type_document: 'Diplome', numero_document: 'DIP-M2RH', date_emission: '2024-07-01', date_expiration: null, statut: 'Valide', lieu_depot: 'Archive numerique', notes: 'Master 2 RH' },
];

// --- Rappels ---
export const RAPPELS = [
  { id: 'rapp-001', employee_id: 'emp-001', type_rappel: 'expiration_document', description: 'Renouvellement CNI employée Nganou Clarisse', date_echeance: '2025-09-15', statut: 'en_attente', responsable_suivi: 'emp-004', action_requise: 'Lancer procedure renouvellement' },
  { id: 'rapp-002', employee_id: 'emp-008', type_rappel: 'expiration_document', description: 'Renouvellement passeport Atangana Christelle', date_echeance: '2025-10-01', statut: 'en_retard', responsable_suivi: 'emp-004', action_requise: 'URGENT: passeport expire' },
  { id: 'rapp-003', employee_id: 'emp-010', type_rappel: 'expiration_document', description: 'Renouvellement casier judiciaire Tsogo Aline', date_echeance: '2025-09-15', statut: 'en_retard', responsable_suivi: 'emp-004', action_requise: 'Demander nouveau casier' },
  { id: 'rapp-004', employee_id: 'emp-013', type_rappel: 'echeance_periode_essai', description: 'Fin stage Foko Nadine', date_echeance: '2024-11-30', statut: 'traite', responsable_suivi: 'emp-001', action_requise: 'Decision: embauche ou fin stage' },
  { id: 'rapp-005', employee_id: 'emp-016', type_rappel: 'renouvellement_contrat', description: 'Fin CDD Abena Guy dans 2 mois', date_echeance: '2025-05-31', statut: 'traite', responsable_suivi: 'emp-011', action_requise: 'Decider renouvellement' },
  { id: 'rapp-006', employee_id: 'emp-020', type_rappel: 'declaration_sociale', description: 'Declaration CNPS mensuelle septembre', date_echeance: '2025-10-10', statut: 'en_attente', responsable_suivi: 'emp-006', action_requise: 'Preparer declaration' },
];

// --- Heures supplémentaires ---
export const HEURES_SUPP = [
  { id: 'hs-001', employee_id: 'emp-003', semaine: 'S37-2025', heures_normales: 40, heures_supp: 8, taux_majoration: '125%', montant_brut: 12000, montant_calcule: 15000, statut: 'validee', valide_par: 'emp-009' },
  { id: 'hs-002', employee_id: 'emp-005', semaine: 'S37-2025', heures_normales: 40, heures_supp: 12, taux_majoration: '150%', montant_brut: 18000, montant_calcule: 27000, statut: 'payee', valide_par: 'emp-014' },
  { id: 'hs-003', employee_id: 'emp-009', semaine: 'S38-2025', heures_normales: 40, heures_supp: 6, taux_majoration: '100%', montant_brut: 9000, montant_calcule: 9000, statut: 'en_attente', valide_par: null },
  { id: 'hs-004', employee_id: 'emp-014', semaine: 'S38-2025', heures_normales: 40, heures_supp: 10, taux_majoration: '125%', montant_brut: 15000, montant_calcule: 18750, statut: 'en_attente', valide_par: null },
  { id: 'hs-005', employee_id: 'emp-017', semaine: 'S37-2025', heures_normales: 40, heures_supp: 5, taux_majoration: '100%', montant_brut: 7000, montant_calcule: 7000, statut: 'validee', valide_par: 'emp-003' },
];

// --- Déclarations sociales ---
export const DECLARATIONS = [
  { id: 'decl-001', organisme: 'CNPS', type_declaration: 'Mensuelle', periode: 'Aout 2025', montant: 2840000, date_soumission: '2025-09-08', date_echeance: '2025-09-10', nombre_salaries: 19, statut: 'validee', observations: '' },
  { id: 'decl-002', organisme: 'Direction des Impots', type_declaration: 'Mensuelle', periode: 'Aout 2025', montant: 1560000, date_soumission: null, date_echeance: '2025-09-15', nombre_salaries: 19, statut: 'en_retard', observations: 'URGENT: depasser le delai' },
  { id: 'decl-003', organisme: 'CNPS', type_declaration: 'Trimestrielle', periode: 'T3 2025', montant: 8520000, date_soumission: null, date_echeance: '2025-10-15', nombre_salaries: 19, statut: 'soumise', observations: 'En preparation' },
];

// --- Sanctions ---
export const SANCTIONS = [
  { id: 'snc-001', employee_id: 'emp-010', type_sanction: 'avertissement_ecrit', faute_commise: 'Retards repetes (3x en 1 semaine)', date_faute: '2025-08-15', date_notification: '2025-08-20', date_execution: '2025-08-20', duree_suspension_jours: null, statut: 'executee', valide_par: 'emp-009', observations: '' },
  { id: 'snc-002', employee_id: 'emp-016', type_sanction: 'avertissement_oral', faute_commise: 'Oubli de pointage', date_faute: '2025-09-01', date_notification: '2025-09-02', date_execution: '2025-09-02', duree_suspension_jours: null, statut: 'executee', valide_par: 'emp-011', observations: '' },
  { id: 'snc-003', employee_id: 'emp-020', type_sanction: 'suspension', faute_commise: 'Abandon de poste', date_faute: '2025-07-10', date_notification: '2025-07-15', date_execution: '2025-07-15', duree_suspension_jours: 15, statut: 'executee', valide_par: 'emp-012', observations: 'Suivi procedure disciplinaire complete' },
];

// --- Visites médicales ---
export const VISITES_MEDICALES = [
  { id: 'vm-001', employee_id: 'emp-001', type_visite: 'periodique', medecin_structure: 'Centre Medical Bonanjo', date_visite: '2025-03-10', date_prochaine_visite: '2026-03-10', resultat: 'Normal', aptitude: 'apte', restrictions: '', cout: 15000, prise_en_charge: 'Employeur', observations: '' },
  { id: 'vm-002', employee_id: 'emp-008', type_visite: 'embauche', medecin_structure: 'Polyclinique Bonapriso', date_visite: '2024-01-25', date_prochaine_visite: '2025-01-25', resultat: 'Normal', aptitude: 'apte_avec_restrictions', restrictions: 'Pas de port de charges > 10kg', cout: 25000, prise_en_charge: 'Employeur', observations: 'Grossesse en cours' },
  { id: 'vm-003', employee_id: 'emp-013', type_visite: 'embauche', medecin_structure: 'Centre Medical Bonanjo', date_visite: '2024-08-28', date_prochaine_visite: '2025-08-28', resultat: 'Normal', aptitude: 'apte', restrictions: '', cout: 15000, prise_en_charge: 'Employeur', observations: '' },
  { id: 'vm-004', employee_id: 'emp-020', type_visite: 'reprise', medecin_structure: 'Polyclinique Bonapriso', date_visite: '2025-08-01', date_prochaine_visite: null, resultat: 'Inapte temporaire', aptitude: 'inapte_temporaire', restrictions: 'Repos medical 30 jours', cout: 30000, prise_en_charge: 'Employeur', observations: 'Suite accident travail' },
];

// --- Prêts ---
export const PRETS = [
  { id: 'pret-001', employee_id: 'emp-005', type_pret: 'avance_salaire', montant_demande: 200000, montant_accorde: 200000, taux_interet: 0, mensualite: 100000, duree_mois: 2, date_demande: '2025-08-15', date_debut_remboursement: '2025-09-01', solde_restant: 100000, statut: 'en_remboursement', observations: 'Urgence medicale' },
  { id: 'pret-002', employee_id: 'emp-006', type_pret: 'pret_social', montant_demande: 1000000, montant_accorde: 800000, taux_interet: 3, mensualite: 68000, duree_mois: 12, date_demande: '2025-06-01', date_debut_remboursement: '2025-07-01', solde_restant: 612000, statut: 'en_remboursement', observations: 'Frais scolaires enfants' },
  { id: 'pret-003', employee_id: 'emp-014', type_pret: 'pret_logement', montant_demande: 3000000, montant_accorde: 2500000, taux_interet: 5, mensualite: 105000, duree_mois: 24, date_demande: '2024-12-01', date_debut_remboursement: '2025-01-01', solde_restant: 1365000, statut: 'en_remboursement', observations: 'Achat terrain' },
  { id: 'pret-004', employee_id: 'emp-019', type_pret: 'avance_salaire', montant_demande: 100000, montant_accorde: 100000, taux_interet: 0, mensualite: 50000, duree_mois: 2, date_demande: '2025-09-20', date_debut_remboursement: '2025-10-01', solde_restant: 100000, statut: 'accorde', observations: '' },
];

// --- Départs ---
export const DEPARTS = [
  { id: 'dep-001', employee_id: 'emp-020', date_depart: '2025-07-30', motif_depart: 'licenciement', date_notification: '2025-07-15', solde_conges_jours: 12, dernier_salaire: 320000, indemnite: 1600000, documents_remis: ['Attestation travail', 'Certificat travail', 'Solde tout compte'], statut_dossier: 'clos' },
];

// --- Avenants (manquait) ---
export const AVENANTS = [
  { id: 'avn-001', amendment_number: 'AVN-2025-001', contract_id: 'ctr-001', employee_id: 'emp-001', date_avenant: '2023-06-01', type_modification: 'Salaire', ancienne_valeur: '1100000 FCFA', nouvelle_valeur: '1250000 FCFA', motif: 'Promotion Director Administrative', date_effet: '2023-07-01', statut: 'Active' },
  { id: 'avn-002', amendment_number: 'AVN-2025-002', contract_id: 'ctr-003', employee_id: 'emp-003', date_avenant: '2024-01-15', type_modification: 'Poste', ancienne_valeur: 'Sous-Chef', nouvelle_valeur: 'Chef Cuisinier', motif: 'Promotion suite depart', date_effet: '2024-02-01', statut: 'Active' },
  { id: 'avn-003', amendment_number: 'AVN-2025-003', contract_id: 'ctr-014', employee_id: 'emp-014', date_avenant: '2025-09-01', type_modification: 'Salaire', ancienne_valeur: '600000 FCFA', nouvelle_valeur: '650000 FCFA', motif: 'Revision annuelle', date_effet: '2025-09-01', statut: 'En attente' },
  { id: 'avn-004', amendment_number: 'AVN-2025-004', contract_id: 'ctr-019', employee_id: 'emp-019', date_avenant: '2025-08-20', type_modification: 'Temps partiel', ancienne_valeur: 'Temps plein', nouvelle_valeur: '25h/sem', motif: 'Demande personnelle etudes', date_effet: '2025-09-15', statut: 'En attente' },
];

// --- Permis (feuille 15-Autorisations Permis) ---
export const PERMIS = [
  { id: 'prm-001', employee_id: 'emp-008', permit_number: 'CS-2024-008', type_permit: 'Carte sejour', numero_permit: 'CS-2024-008', date_delivrance: '2024-01-10', date_expiration: '2025-10-10', autorite: 'DGSN', statut: 'A renouveler' },
  { id: 'prm-002', employee_id: 'emp-015', permit_number: 'PT-2021-015', type_permit: 'Permis travail', numero_permit: 'PT-2021-015', date_delivrance: '2021-01-20', date_expiration: '2026-01-20', autorite: 'MINTSS', statut: 'Valide' },
  { id: 'prm-003', employee_id: 'emp-013', permit_number: 'VS-2024-013', type_permit: 'Visa long sejour', numero_permit: 'VS-2024-013', date_delivrance: '2024-08-15', date_expiration: '2025-08-15', autorite: 'Ministere Interieur', statut: 'Expire' },
];

// --- Fiches de paie (feuille 13-Fiches de Paie) ---
export const FICHES_PAIE = [
  { id: 'fp-001', employee_id: 'emp-001', mois: '2025-08', salaire_brut: 1250000, cotisations: 312500, taux_charges: 25, net_a_payer: 937500, mode_paie: 'Virement', date_paiement: '2025-09-05', statut: 'payee' },
  { id: 'fp-002', employee_id: 'emp-002', mois: '2025-08', salaire_brut: 980000, cotisations: 245000, taux_charges: 25, net_a_payer: 735000, mode_paie: 'Virement', date_paiement: '2025-09-05', statut: 'payee' },
  { id: 'fp-003', employee_id: 'emp-003', mois: '2025-08', salaire_brut: 750000, cotisations: 187500, taux_charges: 25, net_a_payer: 562500, mode_paie: 'Virement', date_paiement: '2025-09-05', statut: 'payee' },
  { id: 'fp-004', employee_id: 'emp-004', mois: '2025-08', salaire_brut: 420000, cotisations: 105000, taux_charges: 25, net_a_payer: 315000, mode_paie: 'Virement', date_paiement: '2025-09-05', statut: 'payee' },
  { id: 'fp-005', employee_id: 'emp-005', mois: '2025-08', salaire_brut: 580000, cotisations: 145000, taux_charges: 25, net_a_payer: 435000, mode_paie: 'Virement', date_paiement: '2025-09-05', statut: 'payee' },
  { id: 'fp-006', employee_id: 'emp-008', mois: '2025-08', salaire_brut: 450000, cotisations: 112500, taux_charges: 25, net_a_payer: 337500, mode_paie: 'Cheque', date_paiement: null, statut: 'validee' },
  { id: 'fp-007', employee_id: 'emp-013', mois: '2025-08', salaire_brut: 80000, cotisations: 12000, taux_charges: 15, net_a_payer: 68000, mode_paie: 'Especes', date_paiement: null, statut: 'generee' },
];

// --- Pointage (feuille 12-Pointage Presence) ---
export const POINTAGE = [
  { id: 'pt-001', employee_id: 'emp-001', semaine: 'S37-2025', jours_presents: 5, jours_absents: 0, retards_minutes: 0, heures_supp: 0, taux_presence: 100, statut: 'valide' },
  { id: 'pt-002', employee_id: 'emp-002', semaine: 'S37-2025', jours_presents: 5, jours_absents: 0, retards_minutes: 10, heures_supp: 4, taux_presence: 100, statut: 'valide' },
  { id: 'pt-003', employee_id: 'emp-003', semaine: 'S37-2025', jours_presents: 4, jours_absents: 1, retards_minutes: 30, heures_supp: 8, taux_presence: 80, statut: 'valide' },
  { id: 'pt-004', employee_id: 'emp-004', semaine: 'S37-2025', jours_presents: 5, jours_absents: 0, retards_minutes: 0, heures_supp: 0, taux_presence: 100, statut: 'valide' },
  { id: 'pt-005', employee_id: 'emp-008', semaine: 'S37-2025', jours_presents: 3, jours_absents: 2, retards_minutes: 0, heures_supp: 0, taux_presence: 60, statut: 'brouillon' },
  { id: 'pt-006', employee_id: 'emp-014', semaine: 'S37-2025', jours_presents: 5, jours_absents: 0, retards_minutes: 15, heures_supp: 10, taux_presence: 100, statut: 'valide' },
  { id: 'pt-007', employee_id: 'emp-019', semaine: 'S37-2025', jours_presents: 4, jours_absents: 1, retards_minutes: 45, heures_supp: 5, taux_presence: 80, statut: 'valide' },
];

// --- Planning mensuel (feuille 22-Planning Mensuel Presence) ---
export const PLANNING_MENSUEL = [
  { id: 'pl-001', employee_id: 'emp-001', mois: '2025-09', jours_ouvrables: 22, jours_presents: 22, jours_absents: 0, retards_minutes: 0, heures_supp: 0, taux_presence: 100, statut: 'valide' },
  { id: 'pl-002', employee_id: 'emp-003', mois: '2025-09', jours_ouvrables: 22, jours_presents: 18, jours_absents: 4, retards_minutes: 60, heures_supp: 8, taux_presence: 82, statut: 'brouillon' },
  { id: 'pl-003', employee_id: 'emp-014', mois: '2025-09', jours_ouvrables: 22, jours_presents: 20, jours_absents: 2, retards_minutes: 30, heures_supp: 10, taux_presence: 91, statut: 'brouillon' },
  { id: 'pl-004', employee_id: 'emp-019', mois: '2025-09', jours_ouvrables: 22, jours_presents: 19, jours_absents: 3, retards_minutes: 90, heures_supp: 5, taux_presence: 86, statut: 'brouillon' },
];

// --- Absences (feuille 10-Absences Maladie) ---
export const ABSENCES = [
  { id: 'abs-001', employee_id: 'emp-003', type_absence: 'maladie', date_debut: '2025-09-15', date_fin: '2025-09-20', duree_jours: 6, motif: 'Paludisme', statut: 'justifiee' },
  { id: 'abs-002', employee_id: 'emp-010', type_absence: 'absence_non_justifiee', date_debut: '2025-08-20', date_fin: '2025-08-21', duree_jours: 2, motif: 'Non signalé', statut: 'non_justifiee' },
  { id: 'abs-003', employee_id: 'emp-017', type_absence: 'accident_travail', date_debut: '2025-07-10', date_fin: '2025-07-25', duree_jours: 16, motif: 'Brulure main', statut: 'justifiee' },
  { id: 'abs-004', employee_id: 'emp-008', type_absence: 'conge_maternite', date_debut: '2025-10-01', date_fin: '2026-01-14', duree_jours: 106, motif: 'Conge maternite legal', statut: 'justifiee' },
];

// --- Mutuelle (feuille 7-Mutuelle Prevoyance) ---
export const MUTUELLES = [
  { id: 'mut-001', employee_id: 'emp-001', organisme: 'ACTIVA Assurances', numero_adherent: 'ACT-001', date_adhesion: '2019-01-20', couverture: 'Familiale', personnes_a_charge: 3, cotisation_mensuelle: 15000, cotisation_annuelle: 180000, statut: 'Active' },
  { id: 'mut-002', employee_id: 'emp-002', organisme: 'SUNU Vie', numero_adherent: 'SUN-002', date_adhesion: '2020-03-10', couverture: 'Individuelle', personnes_a_charge: 0, cotisation_mensuelle: 8000, cotisation_annuelle: 96000, statut: 'Active' },
  { id: 'mut-003', employee_id: 'emp-003', organisme: 'Saham Assurance', numero_adherent: 'SAH-003', date_adhesion: '2018-06-15', couverture: 'Familiale', personnes_a_charge: 4, cotisation_mensuelle: 18000, cotisation_annuelle: 216000, statut: 'Active' },
  { id: 'mut-004', employee_id: 'emp-008', organisme: 'AXA Cameroun', numero_adherent: 'AXA-008', date_adhesion: '2024-02-05', couverture: 'Individuelle', personnes_a_charge: 0, cotisation_mensuelle: 10000, cotisation_annuelle: 120000, statut: 'Active' },
];

// --- Bancaires (feuille 6-Donnees Bancaires) ---
export const BANCAIRES = [
  { id: 'bnq-001', employee_id: 'emp-001', banque: 'Afriland First Bank', agence: 'Bonanjo', rib: '3000100001203456789012', is_principal: true, statut: 'Actif' },
  { id: 'bnq-002', employee_id: 'emp-002', banque: 'BICEC', agence: 'Bastos', rib: '3000200002301456789012', is_principal: true, statut: 'Actif' },
  { id: 'bnq-003', employee_id: 'emp-003', banque: 'SGBC', agence: 'Akwa', rib: '3000300003402567890123', is_principal: true, statut: 'Actif' },
  { id: 'bnq-004', employee_id: 'emp-004', banque: 'UBA', agence: 'Bonapriso', rib: '3000400004503678901234', is_principal: true, statut: 'A verifier' },
];

// --- KPIs (équivalent COUNTIF/SUM Excel -> aggregation JS) ---
export const computeKPIs = () => {
  const totalEmployes = EMPLOYEES.length;
  const employesActifs = EMPLOYEES.filter(e => e.statut === 'Actif').length;
  const contratsEnVigueur = CONTRATS.filter(c => c.statut === 'En vigueur').length;
  const masseSalariale = EMPLOYEES.filter(e => e.statut === 'Actif').reduce((s, e) => s + e.salaire_brut, 0);
  const congesEnAttente = CONGES.filter(c => c.statut === 'en_attente').length;
  const documentsARepouveler = DOCUMENTS.filter(d => d.statut === 'A renouveler' || d.statut === 'Expire').length;
  const declarationsEnRetard = DECLARATIONS.filter(d => d.statut === 'en_retard').length;
  const rappelsEnRetard = RAPPELS.filter(r => r.statut === 'en_retard').length;
  const pretsEnCours = PRETS.filter(p => p.statut === 'en_remboursement').length;
  const soldePretsRestant = PRETS.filter(p => p.statut === 'en_remboursement').reduce((s, p) => s + p.solde_restant, 0);

  const parDepartement = {};
  EMPLOYEES.filter(e => e.statut !== 'Inactif').forEach(e => { parDepartement[e.departement] = (parDepartement[e.departement] || 0) + 1; });
  const parTypeContrat = {};
  EMPLOYEES.filter(e => e.statut !== 'Inactif').forEach(e => { parTypeContrat[e.type_contrat] = (parTypeContrat[e.type_contrat] || 0) + 1; });
  const parCategorie = {};
  EMPLOYEES.filter(e => e.statut !== 'Inactif').forEach(e => { parCategorie[e.categorie] = (parCategorie[e.categorie] || 0) + 1; });

  return { totalEmployes, employesActifs, contratsEnVigueur, masseSalariale, congesEnAttente, documentsARepouveler, declarationsEnRetard, rappelsEnRetard, pretsEnCours, soldePretsRestant, parDepartement, parTypeContrat, parCategorie, tauxActifs: Math.round((employesActifs / totalEmployes) * 100) };
};

// ============================================================
// KPIs EXACTS du fichier Excel feuille 1-Tableau de Bord
// 28 KPIs en 7 blocs + 4 tableaux de répartition
// Transposition COUNTIF/SUM/SUMPRODUCT/AVERAGE -> JS
// ============================================================
export const computeKPIsExcel = () => {
  // --- BLOC 1 (B5:K5) : Effectifs ---
  const effectifTotal = EMPLOYEES.length; // COUNTIF(Fiche, "<>")
  const employesActifs = EMPLOYEES.filter(e => e.statut === 'Actif').length; // COUNTIF(Fiche, "Actif")
  const cadres = EMPLOYEES.filter(e => e.categorie === 'Cadre').length; // COUNTIF(Fiche, "Cadre")
  const cdi = EMPLOYEES.filter(e => e.type_contrat === 'CDI').length; // COUNTIF(Fiche, "CDI")

  // --- BLOC 2 (B9:K9) : Contrats & masse salariale ---
  const contratsEnVigueur = CONTRATS.filter(c => c.statut === 'En vigueur').length; // COUNTIF(Contrats, "En vigueur")
  const masseSalarialeBrute = CONTRATS.filter(c => c.statut === 'En vigueur').reduce((s, c) => s + c.salaire_brut, 0); // SUM(Contrats salaire)
  const avenantsEnAttente = AVENANTS.filter(a => a.statut === 'En attente').length; // COUNTIF(Avenants, "En attente")
  const cddInterim = CONTRATS.filter(c => c.type_contrat === 'CDD' || c.type_contrat === 'Interim').length; // COUNTIF(CDD) + COUNTIF(Interim)

  // --- BLOC 3 (B13:K13) : Documents & permis ---
  const documentsValides = DOCUMENTS.filter(d => d.statut === 'Valide').length; // COUNTIF(Documents, "Valide")
  const documentsARenouveler = DOCUMENTS.filter(d => d.statut === 'A renouveler').length; // COUNTIF(Documents, "A renouveler")
  const permisValides = PERMIS.filter(p => p.statut === 'Valide').length; // COUNTIF(Permis, "Valide")
  const rappelsEnRetard = RAPPELS.filter(r => r.statut === 'en_retard').length; // COUNTIF(Rappels, "En retard")

  // --- BLOC 4 (B17:K17) : Absences, congés, heures supp ---
  const totalJoursAbsences = ABSENCES.reduce((s, a) => s + (a.duree_jours || 0), 0); // SUM(Absences duree)
  const congesApprouves = CONGES.filter(c => c.statut === 'approuvee').length; // COUNTIF(Conges, "Approuve")
  const heuresSuppTotales = HEURES_SUPP.reduce((s, h) => s + h.heures_supp, 0); // SUM(HeuresSupp)
  const tauxPresenceMoyen = POINTAGE.length > 0 ? Math.round(POINTAGE.reduce((s, p) => s + p.taux_presence, 0) / POINTAGE.length) : 0; // AVERAGE(Pointage)

  // --- BLOC 5 (B21:K21) : Paie & déclarations ---
  const totalNetPaye = FICHES_PAIE.reduce((s, f) => s + f.net_a_payer, 0); // SUM(Fiches net)
  const totalCotisations = FICHES_PAIE.reduce((s, f) => s + f.cotisations, 0); // SUM(Fiches cotisations)
  const declarationsEnRetard = DECLARATIONS.filter(d => d.statut === 'en_retard').length; // COUNTIF(Declarations, "En retard")
  const dossiersDepartsClos = DEPARTS.filter(d => d.statut_dossier === 'clos').length; // COUNTIF(Departs, "Clos")

  // --- BLOC 6 (B51:K51) : Prêts, sanctions, visites ---
  const pretsEnCours = PRETS.filter(p => p.statut === 'en_remboursement').length; // COUNTIF(Prets, "En cours")
  const totalAvances = PRETS.filter(p => p.statut === 'en_remboursement').reduce((s, p) => s + p.montant_accorde, 0); // SUMPRODUCT(Prets montant)
  const sanctionsAnnee = SANCTIONS.length; // COUNTA(Sanctions)
  const visitesAPlanifier = VISITES_MEDICALES.filter(v => v.date_prochaine_visite && new Date(v.date_prochaine_visite) - new Date() > 0 && new Date(v.date_prochaine_visite) - new Date() < 30 * 86400000).length; // COUNTIF(Visites, "<=30") - COUNTIF("<0")

  // --- BLOC 7 (B55:K55) : Planning mensuel ---
  const tauxPresenceMoyenPlanning = PLANNING_MENSUEL.length > 0 ? Math.round(PLANNING_MENSUEL.reduce((s, p) => s + p.taux_presence, 0) / PLANNING_MENSUEL.length) : 0; // AVERAGE(Planning)
  const totalRetardsMin = PLANNING_MENSUEL.reduce((s, p) => s + p.retards_minutes, 0); // SUM(Planning retards)
  const heuresSuppMensuelles = PLANNING_MENSUEL.reduce((s, p) => s + p.heures_supp, 0); // SUM(Planning heures supp)
  const indemnitesDeparts = DEPARTS.reduce((s, d) => s + d.indemnite, 0); // SUM(Departs indemnite)

  // --- TABLEAU 1 : Répartition par département (12 départements Excel) ---
  const departementsExcel = [
    'Direction Generale', 'Service Client', 'Finance & Comptabilité', 'Marketing & Communication',
    'Maintenance', 'Commercial', 'Logistique & Approvisionnement', 'Cuisine & Restauration',
    'Réception & Front Office', 'Sécurité'
  ];
  // On mappe nos départements mock vers ceux de l'Excel
  const mappingDept = {
    'Administration': ['Direction Generale', 'Commercial'],
    'Finance': ['Finance & Comptabilité'],
    'Comptabilite': ['Finance & Comptabilité'],
    'Restauration': ['Cuisine & Restauration'],
    'Hebergement': ['Réception & Front Office'],
    'Maintenance': ['Maintenance'],
    'Securite': ['Sécurité'],
    'Ressources Humaines': ['Direction Generale'],
    'Marketing': ['Marketing & Communication'],
    'Logistique': ['Logistique & Approvisionnement'],
  };
  const parDepartementExcel = {};
  departementsExcel.forEach(d => parDepartementExcel[d] = 0);
  EMPLOYEES.filter(e => e.statut !== 'Inactif').forEach(e => {
    const mapped = mappingDept[e.departement] || [];
    if (mapped.length > 0) parDepartementExcel[mapped[0]]++;
  });

  // --- TABLEAU 2 : Répartition par type de contrat (6 types Excel) ---
  const typesContratExcel = ['CDI', 'CDD', 'Stage', 'Interim', 'Alternance', 'Freelance'];
  const parTypeContratExcel = {};
  typesContratExcel.forEach(t => parTypeContratExcel[t] = 0);
  EMPLOYEES.filter(e => e.statut !== 'Inactif').forEach(e => {
    if (typesContratExcel.includes(e.type_contrat)) parTypeContratExcel[e.type_contrat]++;
  });

  // --- TABLEAU 3 : Répartition par type de sanction (5 types Excel) ---
  const typesSanctionExcel = ['Avertissement oral', 'Avertissement écrit', 'Blâme', 'Suspension', 'Mise à pied'];
  const mappingSanction = {
    'avertissement_oral': 'Avertissement oral',
    'avertissement_ecrit': 'Avertissement écrit',
    'blame': 'Blâme',
    'suspension': 'Suspension',
  };
  const parTypeSanctionExcel = {};
  typesSanctionExcel.forEach(t => parTypeSanctionExcel[t] = 0);
  SANCTIONS.forEach(s => {
    const mapped = mappingSanction[s.type_sanction];
    if (mapped) parTypeSanctionExcel[mapped]++;
  });

  // --- TABLEAU 4 : Répartition par type de prêt (5 types Excel) avec montants ---
  const typesPretExcel = ['Avance salaire', 'Prêt social', 'Prêt logement', 'Prêt urgence', 'Prêt formation'];
  const mappingPret = {
    'avance_salaire': 'Avance salaire',
    'pret_social': 'Prêt social',
    'pret_logement': 'Prêt logement',
  };
  const parTypePretExcel = {};
  typesPretExcel.forEach(t => parTypePretExcel[t] = { count: 0, montant: 0 });
  PRETS.forEach(p => {
    const mapped = mappingPret[p.type_pret];
    if (mapped) {
      parTypePretExcel[mapped].count++;
      parTypePretExcel[mapped].montant += p.montant_accorde;
    }
  });

  return {
    // 28 KPIs en 7 blocs (exactement comme le fichier Excel)
    bloc1: { effectifTotal, employesActifs, cadres, cdi },
    bloc2: { contratsEnVigueur, masseSalarialeBrute, avenantsEnAttente, cddInterim },
    bloc3: { documentsValides, documentsARenouveler, permisValides, rappelsEnRetard },
    bloc4: { totalJoursAbsences, congesApprouves, heuresSuppTotales, tauxPresenceMoyen },
    bloc5: { totalNetPaye, totalCotisations, declarationsEnRetard, dossiersDepartsClos },
    bloc6: { pretsEnCours, totalAvances, sanctionsAnnee, visitesAPlanifier },
    bloc7: { tauxPresenceMoyenPlanning, totalRetardsMin, heuresSuppMensuelles, indemnitesDeparts },
    // 4 tableaux de répartition
    parDepartementExcel,
    parTypeContratExcel,
    parTypeSanctionExcel,
    parTypePretExcel,
  };
};

// --- Labels français ---
export const LABELS = {
  type_conge: { conge_annuel: 'Congé annuel', conge_maladie: 'Maladie', conge_maternite: 'Maternité', conge_paternite: 'Paternité', conge_marriage: 'Mariage', conge_deuil: 'Deuil', conge_sans_solde: 'Sans solde', conge_exceptionnel: 'Exceptionnel' },
  statut_conge: { en_attente: 'En attente', approuvee: 'Approuvée', rejetee: 'Rejetée', annulee: 'Annulée' },
  type_sanction: { avertissement_oral: 'Avert. oral', avertissement_ecrit: 'Avert. écrit', blame: 'Blâme', suspension: 'Suspension' },
  aptitude: { apte: 'Apte', apte_avec_restrictions: 'Apte + restrict.', inapte_temporaire: 'Inapte temp.', inapte_definitif: 'Inapte définitif' },
  type_visite: { embauche: 'Embauche', periodique: 'Périodique', reprise: 'Reprise', demandee: 'À la demande' },
  motif_depart: { demission: 'Démission', licenciement: 'Licenciement', fin_cdd: 'Fin CDD', retraite: 'Retraite', deces: 'Décès' },
  statut_dossier: { en_cours: 'En cours', en_attente_piece: 'En attente pièces', clos: 'Clos' },
  type_rappel: { expiration_document: 'Expiration document', renouvellement_contrat: 'Renouvellement contrat', echeance_periode_essai: 'Échéance période essai', visite_medicale: 'Visite médicale', declaration_sociale: 'Déclaration sociale' },
  statut_rappel: { en_attente: 'En attente', en_retard: 'En retard', traite: 'Traité' },
  statut_declaration: { soumise: 'Soumise', en_retard: 'En retard', validee: 'Validée' },
  statut_pret: { demande: 'Demande', accorde: 'Accordé', en_remboursement: 'En remboursement', solde: 'Soldé', refuse: 'Refusé' },
  statut_heures: { en_attente: 'En attente', validee: 'Validée', rejetee: 'Rejetée', payee: 'Payée' },
  statut_permit: { Valide: 'Valide', 'A renouveler': 'À renouveler', 'En renouvellement': 'En renouvellement', Expire: 'Expiré' },
  statut_document: { Valide: 'Valide', 'A renouveler': 'À renouveler', Expire: 'Expiré' },
  statut_contrat: { 'En vigueur': 'En vigueur', Echu: 'Échu', Resilie: 'Résilié', Suspendu: 'Suspendu' },
  type_pret: { avance_salaire: 'Avance salaire', pret_social: 'Prêt social', pret_logement: 'Prêt logement' },
};

// --- Helpers formatage ---
export const formatFCFA = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
export const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
export const formatDate = (d) => { if (!d) return '—'; const date = typeof d === 'string' ? new Date(d) : d; if (isNaN(date)) return '—'; return date.toLocaleDateString('fr-FR'); };
export const joursRestants = (dateStr) => { if (!dateStr) return null; const target = new Date(dateStr); const now = new Date(); return Math.ceil((target - now) / (1000 * 60 * 60 * 24)); };
export const calculerAnciennete = (dateEmbauche) => { if (!dateEmbauche) return '—'; const d = new Date(dateEmbauche); const now = new Date(); const ans = now.getFullYear() - d.getFullYear(); const mois = now.getMonth() - d.getMonth(); const totalMois = ans * 12 + mois; const a = Math.floor(totalMois / 12); const m = totalMois % 12; return `${a}a ${m}m`; };
