// ============================================================
// seuils.js — Configuration des seuils d'alertes (feuille _Config_Seuils)
// Équivalent Excel : feuille cachée avec les seuils paramétrables
// Tous les seuils sont centralisés ici pour modification facile
// ============================================================

// --- Seuils des feux tricolores (mise en forme conditionnelle) ---
// Vert si valeur > 95% de l'objectif
// Jaune si entre 80% et 95%
// Rouge si < 80%
export const SEUILS_PERFORMANCE = {
  // Format : { objectif, minJaune, minVert } — la valeur est comparée à l'objectif
  effectifTotal: { objectif: 20, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Effectif total vs objectif' },
  employesActifs: { objectif: 20, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Employés actifs' },
  cadres: { objectif: 6, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Cadres' },
  cdi: { objectif: 16, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'CDI' },
  cddInterim: { objectif: 3, minVert: 0.95, minJaune: 0.80, sens: 'lower_better', description: 'CDD/Intérim (trop = instabilité)' },
  contratsEnVigueur: { objectif: 20, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Contrats en vigueur' },
  documentsValides: { objectif: 20, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Documents valides' },
  documentsARenouveler: { objectif: 0, seuilJaune: 1, seuilRouge: 3, sens: 'lower_better', description: 'Documents à renouveler (0 = idéal)' },
  tauxPresenceMoyen: { objectif: 95, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Taux présence moyen (objectif > 95%)' },
  rappelsEnRetard: { objectif: 0, seuilJaune: 1, seuilRouge: 3, sens: 'lower_better', description: 'Rappels en retard (0 = idéal)' },
  masseSalarialeBrute: { objectif: 12000000, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Masse salariale brute' },
  totalNetPaye: { objectif: 9000000, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Total net payé' },
  tauxActifs: { objectif: 100, minVert: 0.95, minJaune: 0.80, sens: 'higher_better', description: 'Taux d\'actifs' },
};

// --- Seuils d'alerte échéances (Jours_avant_expiration) ---
export const SEUILS_ECHEANCES = {
  contrat: { critique: 30, attention: 60, label: 'Contrat' },      // < 30j = rouge, 30-60j = orange, > 60j = vert
  document: { critique: 15, attention: 30, label: 'Document' },    // < 15j = rouge, 15-30j = orange, > 30j = vert
  permis: { critique: 30, attention: 60, label: 'Permis' },
  visiteMedicale: { critique: 15, attention: 30, label: 'Visite médicale' },
  cnps: { critique: 30, attention: 60, label: 'Attestation CNPS' },
};

// --- Couleurs des feux tricolores ---
export const FEUX = {
  vert: { color: '#2a7a4a', bg: '#e6f4ed', icon: '🟢', label: 'Conforme', priority: 0 },
  jaune: { color: '#b86a2a', bg: '#fef3e7', icon: '🟡', label: 'Attention', priority: 1 },
  rouge: { color: '#b33a4a', bg: '#fde8eb', icon: '🔴', label: 'Critique', priority: 2 },
  gris: { color: '#6b7a8a', bg: '#eef3f9', icon: '⚪', label: 'N/A', priority: -1 },
};

// --- Calculer le feu tricolore d'un KPI selon sa config ---
export function evaluerFeu(kpiKey, valeur, kpiConfig) {
  const config = SEUILS_PERFORMANCE[kpiKey];
  if (!config) return FEUX.gris;

  // KPI "lower_better" (moins c'est mieux, ex: documentsARenouveler, rappelsEnRetard)
  if (config.sens === 'lower_better' && config.seuilRouge !== undefined) {
    if (valeur >= config.seuilRouge) return FEUX.rouge;
    if (valeur >= config.seuilJaune) return FEUX.jaune;
    return FEUX.vert;
  }

  // KPI "higher_better" avec pourcentage de l'objectif
  if (config.sens === 'higher_better' && config.objectif > 0) {
    const ratio = valeur / config.objectif;
    if (ratio >= config.minVert) return FEUX.vert;
    if (ratio >= config.minJaune) return FEUX.jaune;
    return FEUX.rouge;
  }

  // KPI "lower_better" avec pourcentage (rare)
  if (config.sens === 'lower_better' && config.objectif !== undefined && valeur <= config.objectif) {
    return FEUX.vert;
  }
  if (valeur <= config.objectif * 1.2) return FEUX.jaune;
  return FEUX.rouge;
}

// --- Calculer le feu d'une échéance (jours restants) ---
export function evaluerEcheance(typeEcheance, joursRestants) {
  const seuil = SEUILS_ECHEANCES[typeEcheance] || SEUILS_ECHEANCES.document;
  if (joursRestants === null || joursRestants === undefined || isNaN(joursRestants)) return FEUX.gris;
  if (joursRestants < 0) return FEUX.rouge; // déjà expiré
  if (joursRestants < seuil.critique) return FEUX.rouge;
  if (joursRestants < seuil.attention) return FEUX.jaune;
  return FEUX.vert;
}

// --- Helper : calculer jours restants avant une date ---
export function calculerJoursRestants(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

// --- Détecter toutes les échéances critiques (contrats, documents, permis, visites, CNPS) ---
export function detecterEcheancesCritiques(data) {
  const alertes = [];

  // 1. Contrats expirant dans < 60 jours (seuil attention) ou < 30 (critique)
  data.contrats.forEach(c => {
    if (!c.date_fin) return; // CDI sans date de fin = N/A
    const jours = calculerJoursRestants(c.date_fin);
    const feu = evaluerEcheance('contrat', jours);
    if (feu !== FEUX.vert && feu !== FEUX.gris) {
      const emp = data.employees.find(e => e.id === c.employee_id);
      alertes.push({
        type: 'contrat',
        feu,
        jours,
        employe: emp ? `${emp.prenom} ${emp.nom}` : 'Inconnu',
        detail: `Contrat ${c.contract_number} ${jours < 0 ? 'expiré' : 'expire dans ' + jours + 'j'}`,
        date: c.date_fin,
        href: '/domaine2_Gestion_Administrative_Personnel/contrats',
      });
    }
  });

  // 2. Documents expirant (CNPS, CNI, passeport, etc.)
  data.documents.forEach(d => {
    const jours = calculerJoursRestants(d.date_expiration);
    const feu = evaluerEcheance('document', jours);
    if (feu !== FEUX.vert && feu !== FEUX.gris) {
      const emp = data.employees.find(e => e.id === d.employee_id);
      const isCNPS = d.type_document === 'Attestation CNPS';
      alertes.push({
        type: isCNPS ? 'cnps' : 'document',
        feu,
        jours,
        employe: emp ? `${emp.prenom} ${emp.nom}` : 'Inconnu',
        detail: `${d.type_document} ${jours < 0 ? 'expiré' : 'expire dans ' + jours + 'j'}`,
        date: d.date_expiration,
        href: '/domaine2_Gestion_Administrative_Personnel/documents',
      });
    }
  });

  // 3. Permis expirant
  data.permis.forEach(p => {
    const jours = calculerJoursRestants(p.date_expiration);
    const feu = evaluerEcheance('permis', jours);
    if (feu !== FEUX.vert && feu !== FEUX.gris) {
      const emp = data.employees.find(e => e.id === p.employee_id);
      alertes.push({
        type: 'permis',
        feu,
        jours,
        employe: emp ? `${emp.prenom} ${emp.nom}` : 'Inconnu',
        detail: `${p.type_permit} ${jours < 0 ? 'expiré' : 'expire dans ' + jours + 'j'}`,
        date: p.date_expiration,
        href: '/domaine2_Gestion_Administrative_Personnel/permis',
      });
    }
  });

  // 4. Visites médicales à planifier
  data.visites.forEach(v => {
    if (!v.date_prochaine_visite) return;
    const jours = calculerJoursRestants(v.date_prochaine_visite);
    const feu = evaluerEcheance('visiteMedicale', jours);
    if (feu !== FEUX.vert && feu !== FEUX.gris) {
      const emp = data.employees.find(e => e.id === v.employee_id);
      alertes.push({
        type: 'visiteMedicale',
        feu,
        jours,
        employe: emp ? `${emp.prenom} ${emp.nom}` : 'Inconnu',
        detail: `Visite médicale ${jours < 0 ? 'en retard' : 'dans ' + jours + 'j'}`,
        date: v.date_prochaine_visite,
        href: '/domaine2_Gestion_Administrative_Personnel/visites-medicales',
      });
    }
  });

  // Trier par priorité (rouge en premier, puis par jours restants)
  alertes.sort((a, b) => {
    if (a.feu.priority !== b.feu.priority) return b.feu.priority - a.feu.priority;
    return a.jours - b.jours;
  });

  return alertes;
}

// --- Générer le texte synthétique d'alerte ---
export function genererTexteSynthese(alertes) {
  if (alertes.length === 0) {
    return {
      feu: FEUX.vert,
      texte: 'Tous les documents sont à jour. Aucune échéance critique détectée.',
    };
  }
  const critiques = alertes.filter(a => a.feu === FEUX.rouge).length;
  const attentions = alertes.filter(a => a.feu === FEUX.jaune).length;

  if (critiques > 0) {
    return {
      feu: FEUX.rouge,
      texte: `Attention, ${critiques} échéance(s) critique(s) détectée(s)${attentions > 0 ? ` et ${attentions} à surveiller` : ''}. Action requise immédiatement.`,
    };
  }
  return {
    feu: FEUX.jaune,
    texte: `${attentions} échéance(s) à surveiller dans les 30-60 prochains jours.`,
  };
}

// --- Flèche de tendance (comparaison valeur actuelle vs précédente) ---
export function calculerTendance(valeurActuelle, valeurPrecedente) {
  if (valeurPrecedente === undefined || valeurPrecedente === null || isNaN(valeurPrecedente)) {
    return { fleche: '→', delta: 0, texte: 'N/A', couleur: '#6b7a8a' };
  }
  const delta = valeurActuelle - valeurPrecedente;
  if (delta > 0) {
    return { fleche: '▲', delta: Math.abs(delta), texte: `+${delta > 0 ? '+' : ''}${delta}`, couleur: '#2a7a4a', up: true };
  }
  if (delta < 0) {
    return { fleche: '▼', delta: Math.abs(delta), texte: `${delta}`, couleur: '#b33a4a', up: false };
  }
  return { fleche: '→', delta: 0, texte: '0', couleur: '#6b7a8a', up: null };
}
