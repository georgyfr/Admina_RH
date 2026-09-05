// ============================================================
// dataD1.js — Données mock du Domaine 1 (Recrutement)
// Interconnexion D1 -> D2 : indicateurs qualité recrutement
// Sources Excel D1 : feuilles 1, 2, 6, 11, 12, 13, 17
// ============================================================

// --- Demandes de recrutement (feuille 1-Demandes Recrutement) ---
export const DEMANDES_RECRUTEMENT = [
  { id: 'dem-001', numero: 'DEM-2025-001', poste: 'Directrice Administrative', departement: 'Administration', date_demande: '2019-01-05', statut: 'Pourvue', candidat_retenu: 'emp-001', source: 'Cabinet externe', delai_recrutement_jours: 25 },
  { id: 'dem-002', numero: 'DEM-2025-002', poste: 'Responsable Financier', departement: 'Finance', date_demande: '2020-02-15', statut: 'Pourvue', candidat_retenu: 'emp-002', source: 'LinkedIn', delai_recrutement_jours: 30 },
  { id: 'dem-003', numero: 'DEM-2025-003', poste: 'Chef Cuisinier', departement: 'Restauration', date_demande: '2018-05-20', statut: 'Pourvue', candidat_retenu: 'emp-003', source: 'Recommandation interne', delai_recrutement_jours: 18 },
  { id: 'dem-004', numero: 'DEM-2025-004', poste: 'Assistante RH', departement: 'Ressources Humaines', date_demande: '2021-07-15', statut: 'Pourvue', candidat_retenu: 'emp-004', source: 'Job board', delai_recrutement_jours: 22 },
  { id: 'dem-005', numero: 'DEM-2025-005', poste: 'Technicien Senior', departement: 'Maintenance', date_demande: '2019-10-01', statut: 'Pourvue', candidat_retenu: 'emp-005', source: 'Cabinet externe', delai_recrutement_jours: 35 },
  { id: 'dem-006', numero: 'DEM-2025-006', poste: 'Comptable', departement: 'Comptabilite', date_demande: '2020-06-01', statut: 'Pourvue', candidat_retenu: 'emp-006', source: 'LinkedIn', delai_recrutement_jours: 28 },
  { id: 'dem-007', numero: 'DEM-2025-007', poste: 'Chef Securite', departement: 'Securite', date_demande: '2017-03-15', statut: 'Pourvue', candidat_retenu: 'emp-007', source: 'Recommandation interne', delai_recrutement_jours: 15 },
  { id: 'dem-008', numero: 'DEM-2025-008', poste: 'Chargee Communication', departement: 'Marketing', date_demande: '2024-01-15', statut: 'Pourvue', candidat_retenu: 'emp-008', source: 'Job board', delai_recrutement_jours: 20 },
  { id: 'dem-009', numero: 'DEM-2025-009', poste: 'Responsable Hebergement', departement: 'Hebergement', date_demande: '2019-04-01', statut: 'Pourvue', candidat_retenu: 'emp-009', source: 'Cabinet externe', delai_recrutement_jours: 32 },
  { id: 'dem-010', numero: 'DEM-2025-010', poste: 'Serveuse', departement: 'Restauration', date_demande: '2023-09-01', statut: 'Pourvue', candidat_retenu: 'emp-010', source: 'Candidature spontanee', delai_recrutement_jours: 10 },
  { id: 'dem-011', numero: 'DEM-2025-011', poste: 'Stagiaire RH', departement: 'Ressources Humaines', date_demande: '2024-08-15', statut: 'Pourvue', candidat_retenu: 'emp-013', source: 'Universite partenaire', delai_recrutement_jours: 12 },
  { id: 'dem-012', numero: 'DEM-2025-012', poste: 'Community Manager', departement: 'Marketing', date_demande: '2022-03-15', statut: 'Pourvue', candidat_retenu: 'emp-019', source: 'LinkedIn', delai_recrutement_jours: 24 },
  { id: 'dem-013', numero: 'DEM-2025-013', poste: 'Directeur General', departement: 'Administration', date_demande: '2014-12-01', statut: 'Pourvue', candidat_retenu: 'emp-012', source: 'Cabinet externe', delai_recrutement_jours: 45 },
  { id: 'dem-014', numero: 'DEM-2025-014', poste: 'Receptionniste', departement: 'Hebergement', date_demande: '2017-07-01', statut: 'Pourvue', candidat_retenu: 'emp-020', source: 'Candidature spontanee', delai_recrutement_jours: 14 },
  { id: 'dem-015', numero: 'DEM-2025-015', poste: 'Agent Securite', departement: 'Securite', date_demande: '2023-05-01', statut: 'Pourvue', candidat_retenu: 'emp-016', source: 'Job board', delai_recrutement_jours: 16 },
];

// --- Périodes d'essai (feuille 13-Periode Essai) ---
// IC-D1-D2-03 : D1-13-Periode Essai -> D2-4-Avenants Contrat
export const PERIODES_ESSAI = [
  { id: 'pe-001', employee_id: 'emp-001', date_debut_essai: '2019-01-15', date_fin_essai: '2019-04-15', statut: 'Confirmé', duree_jours: 90, decision: 'Confirmation definitive', date_decision: '2019-03-28' },
  { id: 'pe-002', employee_id: 'emp-002', date_debut_essai: '2020-03-01', date_fin_essai: '2020-06-01', statut: 'Confirmé', duree_jours: 92, decision: 'Confirmation definitive', date_decision: '2020-05-15' },
  { id: 'pe-003', employee_id: 'emp-003', date_debut_essai: '2018-06-10', date_fin_essai: '2018-09-10', statut: 'Confirmé', duree_jours: 92, decision: 'Confirmation definitive', date_decision: '2018-08-25' },
  { id: 'pe-004', employee_id: 'emp-004', date_debut_essai: '2021-09-01', date_fin_essai: '2021-12-01', statut: 'Confirmé', duree_jours: 91, decision: 'Confirmation definitive', date_decision: '2021-11-15' },
  { id: 'pe-005', employee_id: 'emp-008', date_debut_essai: '2024-02-01', date_fin_essai: '2024-05-01', statut: 'Confirmé', duree_jours: 90, decision: 'Confirmation definitive', date_decision: '2024-04-15' },
  { id: 'pe-006', employee_id: 'emp-010', date_debut_essai: '2023-10-01', date_fin_essai: '2024-01-01', statut: 'Rupture', duree_jours: 45, decision: 'Rupture pendant essai', date_decision: '2023-11-15', motif_rupture: 'Inadapte au poste' },
  { id: 'pe-007', employee_id: 'emp-013', date_debut_essai: '2024-09-01', date_fin_essai: '2024-12-01', statut: 'En cours', duree_jours: 91, decision: null, date_decision: null },
  { id: 'pe-008', employee_id: 'emp-016', date_debut_essai: '2023-06-01', date_fin_essai: '2023-09-01', statut: 'Confirmé', duree_jours: 92, decision: 'Confirmation definitive', date_decision: '2023-08-15' },
  { id: 'pe-009', employee_id: 'emp-019', date_debut_essai: '2022-04-01', date_fin_essai: '2022-07-01', statut: 'Confirmé', duree_jours: 91, decision: 'Confirmation definitive', date_decision: '2022-06-15' },
  { id: 'pe-010', employee_id: 'emp-020', date_debut_essai: '2017-08-01', date_fin_essai: '2017-11-01', statut: 'Confirmé', duree_jours: 92, decision: 'Confirmation definitive', date_decision: '2017-10-15' },
];

// --- Suivi post-embauche (feuille 17-Suivi Post-Embauche) ---
// IC-D1-D2-05 : D1-17-Suivi Post-Embauche -> D2-1-Tableau de Bord
export const SUIVI_POST_EMBAUCHE = [
  { id: 'spe-001', employee_id: 'emp-001', date_embauche: '2019-01-15', encore_present: true, mois_3_atteint: true, mois_6_atteint: true, satisfaction_3m: 4.5, satisfaction_6m: 4.7, performance: 'Au-dessus attentes', delai_completude_dossier_jours: 5 },
  { id: 'spe-002', employee_id: 'emp-002', date_embauche: '2020-03-01', encore_present: true, mois_3_atteint: true, mois_6_atteint: true, satisfaction_3m: 4.2, satisfaction_6m: 4.5, performance: 'Conforme attentes', delai_completude_dossier_jours: 7 },
  { id: 'spe-003', employee_id: 'emp-003', date_embauche: '2018-06-10', encore_present: true, mois_3_atteint: true, mois_6_atteint: true, satisfaction_3m: 4.0, satisfaction_6m: 4.3, performance: 'Conforme attentes', delai_completude_dossier_jours: 4 },
  { id: 'spe-004', employee_id: 'emp-004', date_embauche: '2021-09-01', encore_present: true, mois_3_atteint: true, mois_6_atteint: true, satisfaction_3m: 4.6, satisfaction_6m: 4.8, performance: 'Au-dessus attentes', delai_completude_dossier_jours: 3 },
  { id: 'spe-005', employee_id: 'emp-008', date_embauche: '2024-02-01', encore_present: true, mois_3_atteint: true, mois_6_atteint: false, satisfaction_3m: 4.1, satisfaction_6m: null, performance: 'Conforme attentes', delai_completude_dossier_jours: 6 },
  { id: 'spe-006', employee_id: 'emp-010', date_embauche: '2023-10-01', encore_present: false, mois_3_atteint: false, mois_6_atteint: false, satisfaction_3m: 2.8, satisfaction_6m: null, performance: 'Sous attentes', delai_completude_dossier_jours: 12, motif_depart: 'Rupture periode essai' },
  { id: 'spe-007', employee_id: 'emp-013', date_embauche: '2024-09-01', encore_present: true, mois_3_atteint: true, mois_6_atteint: false, satisfaction_3m: 3.8, satisfaction_6m: null, performance: 'En evaluation', delai_completude_dossier_jours: 8 },
  { id: 'spe-008', employee_id: 'emp-016', date_embauche: '2023-06-01', encore_present: true, mois_3_atteint: true, mois_6_atteint: true, satisfaction_3m: 3.9, satisfaction_6m: 4.1, performance: 'Conforme attentes', delai_completude_dossier_jours: 5 },
  { id: 'spe-009', employee_id: 'emp-019', date_embauche: '2022-04-01', encore_present: true, mois_3_atteint: true, mois_6_atteint: true, satisfaction_3m: 4.3, satisfaction_6m: 4.4, performance: 'Conforme attentes', delai_completude_dossier_jours: 4 },
  { id: 'spe-010', employee_id: 'emp-020', date_embauche: '2017-08-01', encore_present: false, mois_3_atteint: true, mois_6_atteint: true, satisfaction_3m: 3.5, satisfaction_6m: 3.2, performance: 'Sous attentes', delai_completude_dossier_jours: 10, motif_depart: 'Licenciement' },
];

// --- Sources de recrutement (feuille 9-Sources) ---
export const SOURCES_RECRUTEMENT = [
  { source: 'Cabinet externe', count: 4, cout_moyen: 350000, qualite_moyenne: 4.2, label: 'Cabinet de recrutement' },
  { source: 'LinkedIn', count: 3, cout_moyen: 50000, qualite_moyenne: 4.5, label: 'LinkedIn' },
  { source: 'Recommandation interne', count: 2, cout_moyen: 0, qualite_moyenne: 4.7, label: 'Recommandation employé' },
  { source: 'Job board', count: 3, cout_moyen: 25000, qualite_moyenne: 3.8, label: 'Sites emploi (Job board)' },
  { source: 'Candidature spontanee', count: 2, cout_moyen: 0, qualite_moyenne: 3.5, label: 'Candidature spontanée' },
  { source: 'Universite partenaire', count: 1, cout_moyen: 10000, qualite_moyenne: 4.0, label: 'Université partenaire' },
];

// --- Base candidats (feuille 2-Base Candidats) — agrégats ---
export const BASE_CANDIDATS_STATS = {
  total_candidats: 247,
  candidats_actifs: 38,
  candidats_recurentes: 12,
  candidats_embauches: 15,
  taux_conversion: 6.1, // % candidats -> embauchés
  delai_moyen_recrutement: 23, // jours
  cout_total_recrutement: 2450000, // FCFA
  cout_moyen_par_embauche: 163333, // FCFA
};

// ============================================================
// Calcul des indicateurs qualité recrutement (IC-D1-D2-05)
// ============================================================
export function calculerIndicateursQualite() {
  const suivis = SUIVI_POST_EMBAUCHE;
  const total = suivis.length;
  const presents3mois = suivis.filter(s => s.mois_3_atteint && s.encore_present).length;
  const presents6mois = suivis.filter(s => s.mois_6_atteint && s.encore_present).length;
  const rupturesEssai = PERIODES_ESSAI.filter(pe => pe.statut === 'Rupture').length;
  const essaisEnCours = PERIODES_ESSAI.filter(pe => pe.statut === 'En cours').length;

  // Taux de rétention à 3 mois = (employés encore présents à 3 mois / total embauchés avec 3 mois atteignables)
  const eligible3m = suivis.filter(s => s.mois_3_atteint !== null).length;
  const tauxRetention3m = eligible3m > 0 ? Math.round((presents3mois / eligible3m) * 100) : 0;

  // Taux de rétention à 6 mois
  const eligible6m = suivis.filter(s => s.mois_6_atteint !== null && s.mois_6_atteint).length;
  const presents6m = suivis.filter(s => s.mois_6_atteint && s.encore_present).length;
  const tauxRetention6m = eligible6m > 0 ? Math.round((presents6m / eligible6m) * 100) : 0;

  // Turnover précoce (départs durant période essai)
  const turnoverPrecoce = total > 0 ? Math.round((rupturesEssai / total) * 100) : 0;

  // Délai moyen de complétude du dossier administratif
  const delaisDossier = suivis.map(s => s.delai_completude_dossier_jours).filter(d => d !== null);
  const delaiMoyenCompletude = delaisDossier.length > 0 ? Math.round(delaisDossier.reduce((s, d) => s + d, 0) / delaisDossier.length * 10) / 10 : 0;

  // Satisfaction moyenne 3 mois
  const sats3m = suivis.filter(s => s.satisfaction_3m !== null).map(s => s.satisfaction_3m);
  const satisfactionMoyenne3m = sats3m.length > 0 ? Math.round(sats3m.reduce((s, v) => s + v, 0) / sats3m.length * 10) / 10 : 0;

  // Satisfaction moyenne 6 mois
  const sats6m = suivis.filter(s => s.satisfaction_6m !== null).map(s => s.satisfaction_6m);
  const satisfactionMoyenne6m = sats6m.length > 0 ? Math.round(sats6m.reduce((s, v) => s + v, 0) / sats6m.length * 10) / 10 : 0;

  // Répartition par performance
  const parPerformance = {};
  suivis.forEach(s => {
    if (s.performance) parPerformance[s.performance] = (parPerformance[s.performance] || 0) + 1;
  });

  // Délai moyen de recrutement (depuis demandes)
  const delaisRecrutement = DEMANDES_RECRUTEMENT.map(d => d.delai_recrutement_jours);
  const delaiMoyenRecrutement = delaisRecrutement.length > 0 ? Math.round(delaisRecrutement.reduce((s, d) => s + d, 0) / delaisRecrutement.length) : 0;

  return {
    tauxRetention3m,
    tauxRetention6m,
    turnoverPrecoce,
    rupturesEssai,
    essaisEnCours,
    delaiMoyenCompletude,
    satisfactionMoyenne3m,
    satisfactionMoyenne6m,
    parPerformance,
    delaiMoyenRecrutement,
    totalEmbauches: total,
    coutMoyenRecrutement: BASE_CANDIDATS_STATS.cout_moyen_par_embauche,
    tauxConversion: BASE_CANDIDATS_STATS.taux_conversion,
  };
}

// --- Historique rétention 12 mois (pour LineChart) ---
export function genererHistoriqueRetention() {
  return [
    { mois: 'Oct', retention3m: 88, retention6m: 82 },
    { mois: 'Nov', retention3m: 90, retention6m: 84 },
    { mois: 'Déc', retention3m: 85, retention6m: 80 },
    { mois: 'Janv', retention3m: 92, retention6m: 86 },
    { mois: 'Févr', retention3m: 89, retention6m: 83 },
    { mois: 'Mars', retention3m: 91, retention6m: 85 },
    { mois: 'Avr', retention3m: 93, retention6m: 88 },
    { mois: 'Mai', retention3m: 90, retention6m: 85 },
    { mois: 'Juin', retention3m: 94, retention6m: 89 },
    { mois: 'Juil', retention3m: 92, retention6m: 87 },
    { mois: 'Août', retention3m: 91, retention6m: 86 },
    { mois: 'Sep', retention3m: calculerIndicateursQualite().tauxRetention3m, retention6m: calculerIndicateursQualite().tauxRetention6m },
  ];
}

// ============================================================
// Évaluations D1 par employé (feuilles 4-Grille Evaluation,
// 13-Periode Essai, 17-Suivi Post-Embauche, 19-Evaluation Strategique)
// Équivalent RECHERCHEX($B$2; ...) sur chaque feuille D1
// ============================================================

// --- Grille d'évaluation (feuille 4-Grille Evaluation) ---
// Score entretien /100 + recommandation
export const GRILLES_EVALUATION = {
  'emp-001': { score: 92, recommandation: 'Fortement recommandé', points_forts: 'Leadership, expérience, communication', points_faibles: 'Aucun identifié', date_evaluation: '2019-01-10' },
  'emp-002': { score: 85, recommandation: 'Recommandé', points_forts: 'Compétences techniques, rigueur', points_faibles: 'Prise de parole en public', date_evaluation: '2020-02-20' },
  'emp-003': { score: 78, recommandation: 'Recommandé', points_forts: 'Expérience cuisine, créativité', points_faibles: 'Management équipe', date_evaluation: '2018-05-25' },
  'emp-004': { score: 88, recommandation: 'Fortement recommandé', points_forts: 'Organisation, discrétion, réactivité', points_faibles: 'Aucun identifié', date_evaluation: '2021-08-15' },
  'emp-005': { score: 75, recommandation: 'Recommandé avec réserves', points_forts: 'Compétences techniques', points_faibles: 'Ponctualité', date_evaluation: '2019-10-20' },
  'emp-008': { score: 82, recommandation: 'Recommandé', points_forts: 'Créativité, maîtrise réseaux sociaux', points_faibles: 'Gestion du stress', date_evaluation: '2024-01-20' },
  'emp-010': { score: 65, recommandation: 'Recommandé avec réserves', points_forts: 'Dynamisme', points_faibles: 'Fiabilité, assiduité', date_evaluation: '2023-09-15' },
  'emp-013': { score: 90, recommandation: 'Fortement recommandé', points_forts: 'Motivation, apprentissage rapide', points_faibles: "Manque d'expérience", date_evaluation: '2024-08-20' },
  'emp-016': { score: 70, recommandation: 'Recommandé avec réserves', points_forts: 'Intégrité, physionomie', points_faibles: 'Communication', date_evaluation: '2023-05-20' },
  'emp-019': { score: 80, recommandation: 'Recommandé', points_forts: 'Créativité, adaptation digitale', points_faibles: 'Autonomie', date_evaluation: '2022-03-20' },
  'emp-020': { score: 68, recommandation: 'Recommandé avec réserves', points_forts: 'Expérience accueil', points_faibles: 'Performance sous pression', date_evaluation: '2017-07-20' },
};

// --- Évaluation stratégique (feuille 19-Evaluation Strategique) ---
// Score stratégique /100 (alignement vision, potentiel, culture)
export const EVALUATIONS_STRATEGIQUES = {
  'emp-001': { score: 88, potentiel: 'Haut potentiel', alignement_culture: 'Excellent', succession: 'Prêt pour Direction Générale', date: '2024-06-15' },
  'emp-002': { score: 82, potentiel: 'Prometteur', alignement_culture: 'Bon', succession: 'Prêt pour CFO', date: '2024-06-15' },
  'emp-003': { score: 70, potentiel: 'Confirmé', alignement_culture: 'Bon', succession: 'Expert métier', date: '2024-06-15' },
  'emp-004': { score: 85, potentiel: 'Haut potentiel', alignement_culture: 'Excellent', succession: 'Prêt pour RRH', date: '2024-06-15' },
  'emp-008': { score: 78, potentiel: 'Prometteur', alignement_culture: 'Bon', succession: 'À développer', date: '2024-06-15' },
  'emp-013': { score: 85, potentiel: 'Haut potentiel', alignement_culture: 'Excellent', succession: 'Talent à suivre', date: '2024-06-15' },
  'emp-019': { score: 75, potentiel: 'Prometteur', alignement_culture: 'Bon', succession: 'À développer', date: '2024-06-15' },
  'emp-020': { score: 60, potentiel: 'Confirmé', alignement_culture: 'Moyen', succession: 'Non éligible', date: '2024-06-15' },
};

// --- Bilan période d'essai (feuille 13-Periode Essai) ---
// Récupéré depuis PERIODES_ESSAI mais avec évaluation qualitative
export const BILANS_PERIODE_ESSAI = {
  'emp-001': { resultat: 'Confirmé', note_integration: 4.5, recommandation_manager: 'Excellente intégration, autonome rapidement', points_amelioration: 'Aucun' },
  'emp-002': { resultat: 'Confirmé', note_integration: 4.2, recommandation_manager: 'Bonne intégration, compétences solides', points_amelioration: 'Travailler la communication transverse' },
  'emp-003': { resultat: 'Confirmé', note_integration: 4.0, recommandation_manager: 'Intégration correcte, maîtrise technique', points_amelioration: 'Renforcer le management d\'équipe' },
  'emp-004': { resultat: 'Confirmé', note_integration: 4.6, recommandation_manager: 'Excellente intégration, proactive', points_amelioration: 'Aucun' },
  'emp-005': { resultat: 'Confirmé', note_integration: 3.8, recommandation_manager: 'Intégration correcte', points_amelioration: 'Améliorer la ponctualité' },
  'emp-008': { resultat: 'Confirmé', note_integration: 4.1, recommandation_manager: 'Bonne intégration, créative', points_amelioration: 'Gestion du stress' },
  'emp-010': { resultat: 'Rupture', note_integration: 2.5, recommandation_manager: 'Difficultés d\'adaptation, retards répétés', points_amelioration: 'Fiabilité, assiduité' },
  'emp-013': { resultat: 'En cours', note_integration: 3.8, recommandation_manager: 'En cours d\'évaluation, motivé', points_amelioration: 'Gagner en expérience' },
  'emp-016': { resultat: 'Confirmé', note_integration: 3.9, recommandation_manager: 'Intégration correcte', points_amelioration: 'Communication' },
  'emp-019': { resultat: 'Confirmé', note_integration: 4.3, recommandation_manager: 'Bonne intégration, créatif', points_amelioration: 'Autonomie' },
  'emp-020': { resultat: 'Confirmé', note_integration: 3.5, recommandation_manager: 'Intégration moyenne', points_amelioration: 'Performance sous pression' },
};

// --- Suivi post-embauche détaillé (feuille 17-Suivi Post-Embauche) ---
// Satisfaction manager + risque de départ + évaluations 1/3/6 mois
export const SUIVI_POST_EMBAUCHE_DETAIL = {
  'emp-001': {
    satisfaction_1m: 4.3, satisfaction_3m: 4.5, satisfaction_6m: 4.7,
    risque_depart: 'Faible', niveau_risque: 1,
    evaluation_1m: 'Au-dessus attentes', evaluation_3m: 'Au-dessus attentes', evaluation_6m: 'Excellent',
    feedback_manager: 'Collaboratrice exceptionnelle, leader naturel',
    feedback_employe: 'Très satisfaite, environnement stimulant',
    actions_recommandees: 'Préparer vers Direction Générale',
  },
  'emp-002': {
    satisfaction_1m: 4.0, satisfaction_3m: 4.2, satisfaction_6m: 4.5,
    risque_depart: 'Faible', niveau_risque: 1,
    evaluation_1m: 'Conforme attentes', evaluation_3m: 'Conforme attentes', evaluation_6m: 'Au-dessus attentes',
    feedback_manager: 'Compétences techniques solides, fiable',
    feedback_employe: 'Bonne intégration, perspectives claires',
    actions_recommandees: 'Former au CFO',
  },
  'emp-003': {
    satisfaction_1m: 3.8, satisfaction_3m: 4.0, satisfaction_6m: 4.3,
    risque_depart: 'Faible', niveau_risque: 1,
    evaluation_1m: 'Conforme attentes', evaluation_3m: 'Conforme attentes', evaluation_6m: 'Conforme attentes',
    feedback_manager: 'Maîtrise technique, à développer en management',
    feedback_employe: 'Satisfait, environnement de travail agréable',
    actions_recommandees: 'Formation management d\'équipe',
  },
  'emp-004': {
    satisfaction_1m: 4.5, satisfaction_3m: 4.6, satisfaction_6m: 4.8,
    risque_depart: 'Faible', niveau_risque: 0,
    evaluation_1m: 'Au-dessus attentes', evaluation_3m: 'Au-dessus attentes', evaluation_6m: 'Excellent',
    feedback_manager: 'Proactive, organisée, discrète — profil idéal',
    feedback_employe: 'Très satisfaite, équipe bienveillante',
    actions_recommandees: 'Préparer vers RRH',
  },
  'emp-008': {
    satisfaction_1m: 3.9, satisfaction_3m: 4.1, satisfaction_6m: null,
    risque_depart: 'Moyen', niveau_risque: 2,
    evaluation_1m: 'Conforme attentes', evaluation_3m: 'Conforme attentes', evaluation_6m: null,
    feedback_manager: 'Créative, à encadrer pour gestion du stress',
    feedback_employe: 'Satisfaite mais pression sur certains projets',
    actions_recommandees: 'Mentoring et gestion du stress',
  },
  'emp-010': {
    satisfaction_1m: 2.8, satisfaction_3m: 2.5, satisfaction_6m: null,
    risque_depart: 'Élevé', niveau_risque: 3,
    evaluation_1m: 'Sous attentes', evaluation_3m: 'Sous attentes', evaluation_6m: null,
    feedback_manager: 'Difficultés d\'adaptation, retards répétés',
    feedback_employe: 'Mal à l\'aise, charge trop élevée',
    actions_recommandees: 'URGENT : entretien de cadrage ou rupture',
  },
  'emp-013': {
    satisfaction_1m: 3.8, satisfaction_3m: 3.8, satisfaction_6m: null,
    risque_depart: 'Faible', niveau_risque: 1,
    evaluation_1m: 'En évaluation', evaluation_3m: 'En évaluation', evaluation_6m: null,
    feedback_manager: 'Stagiaire motivé, en cours d\'évaluation',
    feedback_employe: 'Très content, beaucoup appris',
    actions_recommandees: 'Décision fin de stage',
  },
  'emp-019': {
    satisfaction_1m: 4.0, satisfaction_3m: 4.3, satisfaction_6m: 4.4,
    risque_depart: 'Faible', niveau_risque: 1,
    evaluation_1m: 'Conforme attentes', evaluation_3m: 'Conforme attentes', evaluation_6m: 'Au-dessus attentes',
    feedback_manager: 'Créatif, bonne adaptation digitale',
    feedback_employe: 'Satisfait, projets intéressants',
    actions_recommandees: 'Développer l\'autonomie',
  },
  'emp-020': {
    satisfaction_1m: 3.5, satisfaction_3m: 3.5, satisfaction_6m: 3.2,
    risque_depart: 'Élevé', niveau_risque: 3,
    evaluation_1m: 'Sous attentes', evaluation_3m: 'Sous attentes', evaluation_6m: 'Sous attentes',
    feedback_manager: 'Performance en baisse, difficultés sous pression',
    feedback_employe: 'Insatisfait, manque de soutien',
    actions_recommandees: 'URGENT : entretien ou procédure de licenciement',
  },
};

// --- Helper : récupérer toutes les évaluations d'un employé ---
// Équivalent RECHERCHEX sur 4 feuilles D1 simultanément
export function recupererEvaluationsEmployee(employeeId) {
  return {
    grille: GRILLES_EVALUATION[employeeId] || null,
    strategique: EVALUATIONS_STRATEGIQUES[employeeId] || null,
    periodeEssai: BILANS_PERIODE_ESSAI[employeeId] || null,
    suiviPostEmbauche: SUIVI_POST_EMBAUCHE_DETAIL[employeeId] || null,
  };
}
