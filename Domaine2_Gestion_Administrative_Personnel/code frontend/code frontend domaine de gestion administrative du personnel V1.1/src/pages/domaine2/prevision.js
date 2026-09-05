// ============================================================
// prevision.js — Analyse prédictive (Prévision des effectifs)
// Équivalent Excel : =PREVISION.ETS() + commentaire narratif dynamique
// ============================================================
import { EMPLOYEES, CONTRATS, SOLDES_CONGES } from './data';

// ------------------------------------------------------------
// 1. Historique_Effectif : 12 derniers mois (mois, effectif)
//    Calculé depuis les dates d'embauche (cumul employés actifs par mois)
// ------------------------------------------------------------
export function genererHistoriqueEffectif() {
  const aujourd = new Date();
  const mois12 = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(aujourd.getFullYear(), aujourd.getMonth() - i, 1);
    const finMois = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    // Effectif actif à la fin de ce mois = employés embauchés avant finMois ET non partis
    const effectif = EMPLOYEES.filter(e => {
      const emb = new Date(e.date_embauche);
      if (emb > finMois) return false;
      // Si l'employé est "Inactif", on vérifie s'il était encore actif à ce mois
      // (on l'inclut si on n'a pas de date de départ précise — mock)
      if (e.statut === 'Inactif') {
        // On l'exclut que des 3 derniers mois (simplification mock)
        return i > 2;
      }
      return true;
    }).length;
    const masseSalariale = EMPLOYEES.filter(e => {
      const emb = new Date(e.date_embauche);
      if (emb > finMois) return false;
      if (e.statut === 'Inactif') return i > 2;
      return e.statut === 'Actif';
    }).reduce((s, e) => s + e.salaire_brut, 0);

    mois12.push({
      mois: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      dateIso: d.toISOString().slice(0, 10),
      effectif,
      masseSalariale: Math.round(masseSalariale / 1000), // en milliers FCFA
    });
  }
  return mois12;
}

// ------------------------------------------------------------
// 2. Prévision ETS (Exponential Triple Smoothing) simplifiée
//    Implémentation manuelle de lissage exponentiel triple (Holt-Winters)
//    Équivalent =PREVISION.ETS(cible; valeurs; dates; saisonnalité; ...)
// ------------------------------------------------------------
export function prevoirETS(historique, nbMois = 3, saisonnalite = 12) {
  if (historique.length < 4) return [];
  const valeurs = historique.map(h => h.effectif);
  const n = valeurs.length;

  // Paramètres de lissage
  const alpha = 0.4; // niveau
  const beta = 0.15; // tendance
  const gamma = 0.1; // saisonnalité

  // Initialisation
  let niveau = valeurs[0];
  let tendance = valeurs[1] - valeurs[0];
  const saisonnalites = [];
  const periodeSaison = Math.min(saisonnalite, n);

  // Estimation initiale des coefficients saisonniers
  const moyenneInitiale = valeurs.slice(0, periodeSaison).reduce((s, v) => s + v, 0) / periodeSaison;
  for (let i = 0; i < periodeSaison; i++) {
    saisonnalites.push(valeurs[i] - moyenneInitiale);
  }

  // Lissage
  for (let i = periodeSaison; i < n; i++) {
    const saisonIndex = (i % periodeSaison);
    const ancienNiveau = niveau;
    const ancienneTendance = tendance;
    niveau = alpha * (valeurs[i] - saisonnalites[saisonIndex]) + (1 - alpha) * (ancienNiveau + ancienneTendance);
    tendance = beta * (niveau - ancienNiveau) + (1 - beta) * ancienneTendance;
    saisonnalites[saisonIndex] = gamma * (valeurs[i] - niveau) + (1 - gamma) * saisonnalites[saisonIndex];
  }

  // Prévisions
  const previsions = [];
  const derniereDate = new Date(historique[n - 1].dateIso);
  for (let m = 1; m <= nbMois; m++) {
    const saisonIndex = ((n + m - 1) % periodeSaison);
    const valeurPrevue = Math.max(0, Math.round(niveau + m * tendance + saisonnalites[saisonIndex]));
    // Intervalle de confiance (écart-type des résidus × facteur)
    const residus = [];
    for (let i = periodeSaison; i < n; i++) {
      const s = saisonnalites[i % periodeSaison];
      const prev = ancienneTendance + niveau + s;
      residus.push(valeurs[i] - prev);
    }
    const variance = residus.reduce((s, r) => s + r * r, 0) / Math.max(residus.length, 1);
    const ecartType = Math.sqrt(variance);
    const marge = Math.round(1.96 * ecartType * Math.sqrt(m)); // 95% IC

    const datePrevue = new Date(derniereDate.getFullYear(), derniereDate.getMonth() + m, 1);
    previsions.push({
      mois: datePrevue.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      dateIso: datePrevue.toISOString().slice(0, 10),
      prevision: valeurPrevue,
      icInf: Math.max(0, valeurPrevue - marge),
      icSup: valeurPrevue + marge,
      estPrevision: true,
    });
  }
  return previsions;
}

// ------------------------------------------------------------
// 3. Commentaire narratif dynamique (2-3 phrases)
//    Équivalent : ="Au "&TEXTE(AUJOURDHUI();"dd/mm")&", l'effectif est de "&...
// ------------------------------------------------------------
export function genererCommentaireNarratif(historique, previsions, effectifActuel, masseSalariale) {
  const aujourdhui = new Date();
  const dateStr = aujourdhui.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

  if (previsions.length === 0) {
    return {
      titre: 'Analyse indisponible',
      texte: `Au ${dateStr}, l'effectif est de ${effectifActuel} personnes. Données historiques insuffisantes pour générer une prévision fiable.`,
      ton: 'neutre',
    };
  }

  const prev3Mois = previsions[previsions.length - 1].prevision;
  const delta = prev3Mois - effectifActuel;
  const pourcentage = effectifActuel > 0 ? ((delta / effectifActuel) * 100).toFixed(1) : 0;

  // Détection des fins de CDD à venir (approximation)
  const finsCDD = CONTRATS.filter(c => c.type_contrat === 'CDD' && c.date_fin && new Date(c.date_fin) > aujourdhui && new Date(c.date_fin) < new Date(aujourdhui.getTime() + 90 * 86400000)).length;

  // Détection des embauches récentes (période d'essai)
  const periodesEssai = EMPLOYEES.filter(e => {
    const emb = new Date(e.date_embauche);
    const diffMois = (aujourdhui - emb) / (30 * 86400000);
    return diffMois < 3 && e.statut === 'Essai';
  }).length;

  let texte = '';
  let ton = 'neutre';

  if (delta > 0) {
    texte = `Au ${dateStr}, l'effectif est de ${effectifActuel} personnes. Une hausse de ${pourcentage}% est attendue dans les 3 mois (${prev3Mois} employés projetés), principalement due aux CDD saisonniers et aux périodes d'essai en cours (${periodesEssai} employés en essai). Pensez à anticiper les recrutements et l'intégration.`;
    ton = 'positif';
  } else if (delta < 0) {
    texte = `Au ${dateStr}, l'effectif est de ${effectifActuel} personnes. Une baisse de ${Math.abs(pourcentage)}% est attendue dans les 3 mois (${prev3Mois} employés projetés), liée à ${finsCDD} fin(s) de CDD à venir et aux départs programmés. Anticipez le remplacement des postes critiques.`;
    ton = 'attention';
  } else {
    texte = `Au ${dateStr}, l'effectif est de ${effectifActuel} personnes. La tendance est stable sur les 3 prochains mois, avec ${finsCDD} fin(s) de CDD à anticiper et ${periodesEssai} période(s) d'essai en cours. Maintenez le suivi des renouvellements.`;
    ton = 'neutre';
  }

  // Note sur la masse salariale
  const masseSalarialeK = Math.round(masseSalariale / 1000);
  texte += ` La masse salariale brute mensuelle est de ${masseSalarialeK.toLocaleString('fr-FR')}k FCFA.`;

  return { titre: ton === 'positif' ? 'Tendance haussière' : ton === 'attention' ? 'Tendance baissière' : 'Tendance stable', texte, ton };
}

// ------------------------------------------------------------
// 4. Alertes périodes d'essai (fins dans <15j)
//    Équivalent : =COUNTIFS('Periode Essai'!Statut;"En cours"; DateFin;"<"&AUJOURDHUI()+15)
// ------------------------------------------------------------
export function detecterPeriodesEssaiCritiques() {
  const aujourdhui = new Date();
  const dans15j = new Date(aujourdhui.getTime() + 15 * 86400000);
  const dans30j = new Date(aujourdhui.getTime() + 30 * 86400000);

  // Employés en période d'essai (statut "Essai") ou récemment embauchés (<3 mois)
  const employesEssai = EMPLOYEES.filter(e => {
    if (e.statut === 'Essai') return true;
    const emb = new Date(e.date_embauche);
    const diffMois = (aujourdhui - emb) / (30 * 86400000);
    return diffMois < 3 && diffMois >= 0;
  });

  // Calcul de la date de fin d'essai (3 mois après embauche, convention)
  return employesEssai.map(e => {
    const emb = new Date(e.date_embauche);
    const finEssai = new Date(emb.getFullYear(), emb.getMonth() + 3, emb.getDate());
    const joursRestants = Math.ceil((finEssai - aujourdhui) / 86400000);
    let statut = 'En cours';
    if (joursRestants < 0) statut = 'Expiré';
    else if (joursRestants <= 15) statut = 'Critique (<15j)';
    else if (joursRestants <= 30) statut = 'À surveiller (<30j)';
    return {
      employee: e,
      dateEmbauche: e.date_embauche,
      dateFinEssai: finEssai.toISOString().slice(0, 10),
      joursRestants,
      statut,
    };
  }).filter(e => e.joursRestants <= 30); // Seulement ceux qui nécessitent une décision
}

// ------------------------------------------------------------
// 5. Données combinées pour le LineChart (historique + prévision)
//    Série pointillée pour la prévision
// ------------------------------------------------------------
export function genererDonneesChart(historique, previsions) {
  const data = [];
  // Historique (réel)
  historique.forEach(h => {
    data.push({
      mois: h.mois,
      effectif: h.effectif,
      prevision: null, // pas de prévision sur l'historique
      icInf: null,
      icSup: null,
      estPrevision: false,
    });
  });
  // Point de jonction (dernier point historique répété pour liaison)
  if (historique.length > 0 && previsions.length > 0) {
    data[data.length - 1].prevision = historique[historique.length - 1].effectif;
  }
  // Prévisions (pointillés)
  previsions.forEach(p => {
    data.push({
      mois: p.mois,
      effectif: null,
      prevision: p.prevision,
      icInf: p.icInf,
      icSup: p.icSup,
      estPrevision: true,
    });
  });
  return data;
}
