/* =============================================================
   Admina-RH — Stagiaires (vivier) — couche admina (W3-a)
   Scope : /stagiaires · préfixe ast- · flag __ADMINA_STG_W3__
   ---------------------------------------------------------------
   PHILOSOPHIE DE LA PAGE (à refléter dans TOUTE l'UI) :
   /stagiaires = L'ESSAI MUTUEL. Un stage est une période
   d'observation à double sens : l'entreprise observe le stagiaire,
   le stagiaire évalue l'entreprise. Un stagiaire bien encadré et
   bien évalué est un vivier pré-qualifié ; le statut "Embauche"
   est l'aboutissement naturel, pas une faveur. La page suit la
   progression temporelle de chaque stage (% écoulé, J-restants),
   l'évaluation chiffrée, le tuteur responsable ; elle pousse à
   trancher AVANT la fin (pas de stage qui s'arrête sans décision)
   et à convertir les meilleurs en embauches. Ce n'est NI un
   tableur de main d'œuvre, NI un carnet de notes : c'est le
   vivier pré-qualifié de l'entreprise.
   ---------------------------------------------------------------
   - VUE SIGNATURE « AVANCEMENT DES STAGES » : une rangée par
     stagiaire — barre de progression % écoulé, badge J-restants
     (ou « terminé le jj/mm »), note /20 colorée par seuils, badge
     statut, pastille d'alerte si décision manquante proche de la
     fin ; rangée cliquable → drawer à CE stagiaire.
   - Héro calculé (X stagiaires · Y en cours · Z embauchés ·
     conversion N %) + sous-ligne indemnité totale & échéances du
     mois · 5 alertes AAA cliquables → filtres (+ croisement
     optionnel __ADMINA_CAND_API__, silencieux si absent)
   - 6 KPI (dont 4 filtrent) + 3 graphiques SVG vanilla cliquables
     (donut statuts, indemnité par département, fins par mois)
   - Recherche + filtres (statut, département, évaluation min) +
     Réinitialiser · table triable aria-sort · vue cartes ·
     VUE AVANCEMENT · drawer fiche (décision & évaluation rapides,
     notes, alertes inline, historique) · dialog création/édition
     VALIDÉ (dates jj/mm/aaaa, fin > début bloquant, aperçu live) ·
     duplication (statut En cours, évaluation null, n° max+1) ·
     suppression simple & groupée confirmée · panneau seuils
     (fin imminente, mi-parcours, note min) persisté · export CSV ·
     journal admina_journal + délégation __ADMINA_AUDIT__ ·
     raccourcis N/E/J/P/C/S/K/T + / + ? · dark mode auto ·
     burger mobile <820px · garde-fous 390px (0 débordement)
   - Données : window.__ADMINA_STG_API__ (chunk déjà patché) →
     fallback localStorage admina-stagiaires-data → snapshot démo
     dérivé des données natives · résilience : 30 réessais
     (450 ms) au démarrage, sinon page native intacte · écriture :
     API sinon fallback LS direct · pont bidirectionnel
     (subscribe + poller 1,2 s) — la vue native reflète les
     mutations du module
   - Aucun global hors window.__ADMINA_STG_*
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_STG_W3__) return;

  var html = document.documentElement;
  var RE_PAGE = /\/stagiaires\/?$/;
  var LS_DATA = 'admina-stagiaires-data';
  var LS_UI = 'admina-stagiaires-ui';
  var LS_SEUILS = 'admina-stagiaires-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', dep: '', evalmin: '', kpi: '', mois: '', flag: '', view: 'avancement', sortKey: 'dateFin', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, sel: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { finImminente: 14, miParcours: 50, evalMin: 10 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  /* Statuts natifs du chunk (En cours/Termine/Abandonne/Embauche) ;
     couleurs = vocabulaire commun admina (info/success/error/warning). */
  var STATUTS = [
    { k: 'En cours', lab: 'En cours', c: '#0e7490' },
    { k: 'Termine', lab: 'Terminé', c: '#059669' },
    { k: 'Abandonne', lab: 'Abandonné', c: '#dc2626' },
    { k: 'Embauche', lab: 'Embauche', c: '#d97706' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  function statutIdx(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return i; } return 99; }

  /* Snapshot démo — dérivé 1:1 des données natives du chunk
     Stagiaires-B2vOYBEP.js (aucune donnée inventée). */
  var DEMO = [
    { id: 1, numero: 'STG-001', nom: 'Tchoumi Sandra', prenom: 'Sandra', etablissement: 'Université de Douala', formation: 'Licence Gestion Hôtelière', departementAccueil: 'Restauration', tuteur: 'M. Nkoulou Amina', dateDebut: '01/01/2025', dateFin: '30/06/2025', duree: 181, indemnite: 50000, statut: 'En cours', evaluation: 14, notes: 'Très motivée' },
    { id: 2, numero: 'STG-002', nom: 'Bikay Patricia', prenom: 'Patricia', etablissement: 'ISTAG', formation: 'BTS Comptabilité', departementAccueil: 'Finance & Comptabilite', tuteur: 'M. Tabi Sandrine', dateDebut: '01/02/2025', dateFin: '31/07/2025', duree: 181, indemnite: 45000, statut: 'En cours', evaluation: 15, notes: 'Bonne performance' },
    { id: 3, numero: 'STG-003', nom: 'Ngassa Jean', prenom: 'Jean', etablissement: 'Université de Yaoundé', formation: 'Master Informatique', departementAccueil: 'Informatique', tuteur: 'M. Kamga Blaise', dateDebut: '01/03/2025', dateFin: '31/08/2025', duree: 184, indemnite: 50000, statut: 'En cours', evaluation: null, notes: 'Profil développeur prometteur' },
    { id: 4, numero: 'STG-004', nom: 'Fotso Brigitte', prenom: 'Brigitte', etablissement: 'Ecole Hôtelière de Douala', formation: 'BTS Hôtellerie', departementAccueil: 'Hébergement', tuteur: 'Mme. Fotso Marie', dateDebut: '01/01/2025', dateFin: '30/06/2025', duree: 181, indemnite: 50000, statut: 'En cours', evaluation: 16, notes: 'Excellente stagiaire' },
    { id: 5, numero: 'STG-005', nom: 'Moukouri Patrice', prenom: 'Patrice', etablissement: 'ISTAG', formation: 'Licence RH', departementAccueil: 'Ressources Humaines', tuteur: 'M. Nkoulou Paul', dateDebut: '01/01/2025', dateFin: '30/06/2025', duree: 181, indemnite: 45000, statut: 'En cours', evaluation: 13, notes: '' },
    { id: 6, numero: 'STG-006', nom: 'Eyenga Carine', prenom: 'Carine', etablissement: 'Université de Douala', formation: 'Licence Communication', departementAccueil: 'Marketing & Communication', tuteur: 'Mme. Mebara Nadège', dateDebut: '01/02/2025', dateFin: '31/07/2025', duree: 181, indemnite: 45000, statut: 'En cours', evaluation: 14, notes: 'Créative' },
    { id: 7, numero: 'STG-007', nom: 'Tchinda Armand', prenom: 'Armand', etablissement: 'Université de Dschang', formation: 'Master Logistique', departementAccueil: 'Logistique & Approvisionnement', tuteur: 'M. Ngo Ndobo Alain', dateDebut: '01/03/2025', dateFin: '31/08/2025', duree: 184, indemnite: 50000, statut: 'En cours', evaluation: null, notes: '' },
    { id: 8, numero: 'STG-008', nom: 'Nkoulou Stephane', prenom: 'Stephane', etablissement: 'ENSP Yaoundé', formation: 'Licence Sécurité', departementAccueil: 'Sécurité', tuteur: 'M. Kamga Blaise', dateDebut: '01/01/2025', dateFin: '30/06/2025', duree: 181, indemnite: 45000, statut: 'Termine', evaluation: 15, notes: 'Stagiaire sérieux, embauché en CDD' },
    { id: 9, numero: 'STG-009', nom: 'Atangana Sarah', prenom: 'Sarah', etablissement: 'Ecole Hôtelière de Douala', formation: 'BTS Restauration', departementAccueil: 'Restauration', tuteur: 'M. Nkoulou Amina', dateDebut: '01/02/2025', dateFin: '15/04/2025', duree: 74, indemnite: 40000, statut: 'Abandonne', evaluation: 10, notes: 'Abandon pour raison personnelle' },
    { id: 10, numero: 'STG-010', nom: 'Bikay Patricia', prenom: 'Patricia', etablissement: 'ISTAG', formation: 'BTS Comptabilité', departementAccueil: 'Finance & Comptabilite', tuteur: 'M. Tabi Sandrine', dateDebut: '01/01/2025', dateFin: '30/06/2025', duree: 181, indemnite: 45000, statut: 'Embauche', evaluation: 17, notes: 'Embauchée suite au stage' }
  ];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
  function fmtFcfa(n) { return !n && n !== 0 ? '—' : (Number(n) || 0).toLocaleString('fr-FR') + ' FCFA'; }
  function jDate(s) {
    var v = String(s || '').trim();
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v);
    if (m) return m[3] + '/' + m[2] + '/' + m[1];
    return v;
  }
  function dateKey(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (m) return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
    var m2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    if (m2) return Number(m2[1]) * 10000 + Number(m2[2]) * 100 + Number(m2[3]);
    return 0;
  }
  function tsOf(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (m) return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    var m2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    if (m2) return Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]));
    return 0;
  }
  function todayTs() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysSince(s) { var t = tsOf(s); if (!t) return 0; return Math.max(0, Math.floor((todayTs() - t) / 86400000)); }
  function daysUntil(s) { var t = tsOf(s); if (!t) return null; return Math.round((t - todayTs()) / 86400000); }
  function jDelay(s) { var d = daysUntil(s); if (d === null) return '—'; if (d === 0) return "aujourd'hui"; if (d > 0) return 'J+' + d; if (d === -1) return 'hier'; return 'J' + d; }
  function validDateStr(s) {
    var v = String(s || '').trim();
    if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(v)) return false;
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    var d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2200) return false;
    var dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCDate() === d && dt.getUTCMonth() === mo - 1;
  }
  function monthKey(s) {
    var t = tsOf(s);
    if (!t) return '';
    var d = new Date(t);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
  }
  function currentMonthKey() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function MOIS_LAB(mk) {
    var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    var p = String(mk || '').split('-');
    if (p.length !== 2) return mk;
    return MOIS[Number(p[1]) - 1] + ' ' + p[0].slice(2);
  }
  function jlog(a, d) {
    try { if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.log === 'function') window.__ADMINA_AUDIT__.log(a, d, 'RH'); } catch (e) {}
    try {
      var arr = JSON.parse(localStorage.getItem(LS_J) || '[]');
      if (!Array.isArray(arr)) arr = [];
      arr.push({ time: new Date().toISOString(), action: a, detail: d || '', role: 'RH' });
      if (arr.length > 80) arr = arr.slice(-80);
      localStorage.setItem(LS_J, JSON.stringify(arr));
    } catch (e2) {}
  }
  function journalTs(t) { if (typeof t === 'number') return t; var n = Date.parse(t); return isNaN(n) ? 0 : n; }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h(sel, attrs, htmlStr) { var e = document.createElement(sel); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (htmlStr != null) e.innerHTML = htmlStr; return e; }
  function toastsZone() { var z = $('[data-ast="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-ast', 'toasts'); z.className = 'ast-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'ast-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }
  function fullName(r) {
    var n = String(r.nom || '').trim();
    var p = String(r.prenom || '').trim();
    if (p && norm(n).indexOf(norm(p)) < 0) return (n ? n + ' ' + p : p);
    return n || p || '—';
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_STG_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.stagiaires && Array.isArray(d.stagiaires) && d.stagiaires.length) return true;
    return false;
  }
  /* Croisement optionnel __ADMINA_CAND_API__ — SILENCIEUX si absent. */
  function candidatIndex() {
    var idx = [];
    try {
      var c = window.__ADMINA_CAND_API__;
      var cd = c && typeof c.getData === 'function' ? c.getData() : null;
      if (cd && cd.candidats && cd.candidats.length) {
        cd.candidats.forEach(function (x) {
          if (!x) return;
          [x.prenom + ' ' + x.nom, x.nom + ' ' + x.prenom, x.nom].forEach(function (n) {
            var k = norm(n); if (k) idx.push(k);
          });
        });
      }
    } catch (e) {}
    return idx;
  }
  function absentDeCandidats(r, idx) {
    if (!idx || !idx.length) return false;
    var mine = [norm(r.prenom + ' ' + r.nom), norm(r.nom + ' ' + r.prenom), norm(r.nom), norm(r.prenom)].filter(Boolean);
    for (var i = 0; i < mine.length; i++) {
      var me = mine[i];
      if (me.length < 3) continue;
      for (var j = 0; j < idx.length; j++) {
        if (idx[j].indexOf(me) > -1 || me.indexOf(idx[j]) > -1) return false;
      }
    }
    return true;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.stagiaires) { d = readLS(); }
    if (!d || !d.stagiaires || !d.stagiaires.length) { d = { stagiaires: DEMO }; }
    if (!d.stagiaires || !d.stagiaires.length) return [];
    var cidx = candidatIndex();
    return d.stagiaires.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = Number(u.id) || 0;
      u.duree = Number(u.duree) || 0;
      u.indemnite = Number(u.indemnite) || 0;
      u.evaluation = (u.evaluation == null || u.evaluation === '') ? null : Number(u.evaluation);
      u.stm = statutMeta(u.statut);
      u.debutTs = tsOf(u.dateDebut);
      u.finTs = tsOf(u.dateFin);
      u.totalJ = (u.debutTs && u.finTs && u.finTs > u.debutTs) ? Math.round((u.finTs - u.debutTs) / 86400000) : (Number(u.duree) || 0);
      var el2 = (u.debutTs && u.totalJ) ? Math.floor((todayTs() - u.debutTs) / 86400000) : 0;
      u.pct = u.totalJ ? Math.max(0, Math.min(100, Math.round(el2 / u.totalJ * 100))) : 0;
      u.jRest = daysUntil(u.dateFin);
      /* décision manquante = ni Embauche ni Termine (Abandonne motivé = décision, mais
         le canon exige une issue finalisée ; on alerte tant que non finalisé) */
      u.decisionMissing = u.statut !== 'Embauche' && u.statut !== 'Termine';
      u.imminente = u.decisionMissing && u.jRest !== null && u.jRest <= SEUILS.finImminente;
      u.noneval = u.statut === 'En cours' && u.pct >= SEUILS.miParcours && u.evaluation == null;
      u.abandonSans = u.statut === 'Abandonne' && !String(u.notes || '').trim();
      u.embauche = u.statut === 'Embauche';
      u.crossMiss = u.statut === 'En cours' && absentDeCandidats(u, cidx);
      return u;
    });
  }
  var DERIVED = ['stm', 'debutTs', 'finTs', 'totalJ', 'pct', 'jRest', 'decisionMissing', 'imminente', 'noneval', 'abandonSans', 'embauche', 'crossMiss'];
  function stripDerived(u) { var c = {}; for (var k in u) { if (DERIVED.indexOf(k) < 0) c[k] = u[k]; } return c; }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) {
      var n = Number(r.id); if (isFinite(n)) m = Math.max(m, n);
      var m2 = /^STG-(\d+)$/.exec(String(r.numero || r.id || ''));
      if (m2) m = Math.max(m, Number(m2[1]));
      return m;
    }, 0) + 1;
    return { id: mx, numero: 'STG-' + String(mx).padStart(3, '0') };
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.stagiaires) { toast('Écriture impossible — recharger la page', 'err'); return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct (résilience W3) — sème le snapshot courant si LS vide */
    var cur2 = readLS();
    if (!cur2 || !cur2.stagiaires) { cur2 = { stagiaires: data().map(stripDerived) }; }
    if (cur2 && cur2.stagiaires) {
      var nv2 = fn(cur2);
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { return false; }
      if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
      refresh();
      return true;
    }
    toast('Écriture impossible — API indisponible', 'err');
    return false;
  }

  /* ================= alertes AAA ================= */
  function computeAlerts(rows) {
    var out = [];
    var fin = rows.filter(function (r) { return r.imminente; });
    if (fin.length) out.push({ tone: 'err', txt: fin.length + ' fin(s) de stage à trancher sous ' + SEUILS.finImminente + ' j (ou dépassées) sans décision finale — le stage ne doit pas s\u2019arrêter sans issue : ' + fin.slice(0, 2).map(function (r) { return r.numero + ' · ' + fullName(r); }).join(', ') + '…', f: 'fin' });
    var nev = rows.filter(function (r) { return r.noneval; });
    if (nev.length) out.push({ tone: 'warn', txt: nev.length + ' stagiaire(s) en cours non évalué(s) après mi-parcours (' + SEUILS.miParcours + ' % écoulés) — l\u2019essai mutuel exige une note : ' + nev.slice(0, 2).map(function (r) { return r.numero + ' · ' + r.pct + ' %'; }).join(', ') + '…', f: 'noneval' });
    var emb = rows.filter(function (r) { return r.embauche; });
    if (emb.length) out.push({ tone: 'info', txt: emb.length + ' statut(s) « Embauche » à convertir en embauche effective — ne laissez pas le vivier pré-qualifié refroidir : ' + emb.slice(0, 2).map(function (r) { return r.numero + ' · ' + fullName(r); }).join(', ') + '…', f: 'emb' });
    var aba = rows.filter(function (r) { return r.abandonSans; });
    if (aba.length) out.push({ tone: 'warn', txt: aba.length + ' abandon(s) sans notes explicatives — documenter la cause pour fiabiliser le vivier : ' + aba.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…', f: 'abandon' });
    var cross = rows.filter(function (r) { return r.crossMiss; });
    if (cross.length) out.push({ tone: 'info', txt: cross.length + ' stagiaire(s) actif(s) absent(s) de la base candidats — rattacher au vivier : ' + cross.slice(0, 3).map(function (r) { return fullName(r); }).join(', ') + '…', f: 'cross' });
    return out.slice(0, 6);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.statut && r.statut !== UI.statut) return false;
      if (UI.dep && norm(r.departementAccueil) !== norm(UI.dep)) return false;
      if (UI.evalmin === 'nulle' && r.evaluation != null) return false;
      if (UI.evalmin && UI.evalmin !== 'nulle' && !(r.evaluation != null && r.evaluation >= Number(UI.evalmin))) return false;
      if (UI.mois && UI.mois.indexOf('m:') === 0 && monthKey(r.dateFin) !== UI.mois.slice(2)) return false;
      if (UI.kpi === 'cours' && r.statut !== 'En cours') return false;
      if (UI.kpi === 'emb' && !r.embauche) return false;
      if (UI.kpi === 'term' && r.statut !== 'Termine') return false;
      if (UI.kpi === 'aban' && r.statut !== 'Abandonne') return false;
      if (UI.flag === 'fin' && !r.imminente) return false;
      if (UI.flag === 'noneval' && !r.noneval) return false;
      if (UI.flag === 'emb' && !r.embauche) return false;
      if (UI.flag === 'abandon' && !r.abandonSans) return false;
      if (UI.flag === 'cross' && !r.crossMiss) return false;
      if (q && !(norm(fullName(r)).indexOf(q) > -1 || norm(r.numero).indexOf(q) > -1 || norm(r.etablissement).indexOf(q) > -1 || norm(r.formation).indexOf(q) > -1 || norm(r.tuteur).indexOf(q) > -1 || norm(r.departementAccueil).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'nom') { va = norm(fullName(a)); vb = norm(fullName(b)); }
      else if (k === 'dateDebut') { va = a.debutTs || 99999999; vb = b.debutTs || 99999999; }
      else if (k === 'dateFin') { va = a.finTs || 99999999; vb = b.finTs || 99999999; }
      else if (k === 'prog') { va = a.pct; vb = b.pct; }
      else if (k === 'statut') { va = statutIdx(a.statut); vb = statutIdx(b.statut); }
      else if (k === 'evaluation') { va = a.evaluation == null ? -1 : a.evaluation; vb = b.evaluation == null ? -1 : b.evaluation; }
      else if (k === 'duree' || k === 'indemnite') { va = Number(a[k]) || 0; vb = Number(b[k]) || 0; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.dep ? 1 : 0) + (UI.evalmin ? 1 : 0) + (UI.kpi ? 1 : 0) + (UI.mois ? 1 : 0) + (UI.flag ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.evalmin = ''; UI.kpi = ''; UI.mois = ''; UI.flag = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Stagiaires/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-ast="root"]');
    if (!root) {
      root = h('section', { 'data-ast': 'root', class: 'ast-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-ast-page')) {
      page.setAttribute('data-ast-page', '1');
      page.setAttribute('data-ast-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-ast-hide')) {
      natif.setAttribute('data-ast-hide', '1');
      natif.setAttribute('data-ast-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-ast="root"]'); if (root) root.remove();
    $$('[data-ast-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-ast-oldw') || '';
      n.removeAttribute('data-ast-page');
      n.removeAttribute('data-ast-oldw');
    });
    $$('[data-ast-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-ast-olddisp') || '';
      n.removeAttribute('data-ast-hide');
      n.removeAttribute('data-ast-olddisp');
    });
    $$('[data-ast]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-ast="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'ast-btn ast-btn-primary ast-backbtn', 'data-ast': 'back' }, 'Revenir au centre Vivier');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'stagiaires');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    av: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    hour: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    seuils: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  var USER_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6"/><path d="M16.5 3.5a3.4 3.4 0 0 1 0 6.8"/><path d="M18 14.6c2 .8 3.2 2.6 3.6 5.4"/><path d="M17 9.5c2.5.5 4 2.2 4 2.2"/></svg>';

  function buildShell() {
    var root = $('[data-ast="root"]');
    if (!root || $('[data-ast="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="ast-hero" data-ast="hero">' +
        '<div class="ast-hero-main">' +
          '<div class="ast-hero-title">' +
            '<span class="ast-hero-ico" aria-hidden="true">' + USER_ICON + '</span>' +
            '<div><h2 class="ast-h2">Vivier Stagiaires — l\u2019essai mutuel</h2>' +
            '<p class="ast-hero-sub" data-ast="herosub"></p>' +
            '<p class="ast-hero-sub2" data-ast="herosub2"></p></div>' +
          '</div>' +
          '<div class="ast-hero-actions">' +
            '<button class="ast-btn" data-ast="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="ast-btn" data-ast="btn-echeances" title="Échéances & décisions à trancher (S)">' + ICO.hour + 'Échéances</button>' +
            '<button class="ast-btn" data-ast="btn-seuils" title="Seuils de pilotage (K)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="ast-btn" data-ast="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="ast-btn" data-ast="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="ast-btn ast-btn-primary" data-ast="btn-new" title="Nouveau stagiaire (N)">' + ICO.plus + 'Nouveau stagiaire</button>' +
          '</div>' +
        '</div>' +
        '<div class="ast-hero-alerts" data-ast="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="ast-kpis" data-ast="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="ast-charts" data-ast="charts">' +
        '<div class="ast-chart-card"><div class="ast-chart-title">Statuts des stages</div><div class="ast-donut-wrap" data-ast="donut"></div></div>' +
        '<div class="ast-chart-card"><div class="ast-chart-title">Indemnité par département d\u2019accueil</div><div class="ast-bars" data-ast="bars"></div></div>' +
        '<div class="ast-chart-card"><div class="ast-chart-title">Fins de stage par mois à venir</div><div class="ast-bars" data-ast="mois"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="ast-toolbar" data-ast="toolbar">' +
        '<div class="ast-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (nom, prénom, établissement, formation, tuteur…)" data-ast="search" aria-label="Rechercher un stagiaire" /></div>' +
        '<select data-ast="f-statut" class="ast-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-ast="f-dep" class="ast-sel" aria-label="Filtrer par département d\u2019accueil"></select>' +
        '<select data-ast="f-eval" class="ast-sel" aria-label="Filtrer par évaluation minimale"></select>' +
        '<button class="ast-chipbtn" data-ast="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="ast-count" data-ast="count"></span>' +
        '<div class="ast-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="ast-vbtn" data-ast="v-avancement" title="Avancement des stages (P)">' + ICO.av + 'Avancement</button>' +
          '<button class="ast-vbtn" data-ast="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="ast-vbtn" data-ast="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-ast="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-ast="selbar"></div>' +

      /* PIED */
      '<div class="ast-foot">L\u2019essai mutuel : l\u2019entreprise observe, le stagiaire évalue — chaque stage doit aboutir à une décision · journal d\u2019audit actif · seuils configurables · <button class="ast-link" data-ast="btn-native">Afficher le tableau natif</button></div>';

    $('[data-ast="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-ast="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-ast="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'stagiaires'); window.print(); });
    $('[data-ast="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-ast="btn-echeances"]', root).addEventListener('click', openEcheances);
    $('[data-ast="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-ast="btn-native"]', root).addEventListener('click', showNative);
    $('[data-ast="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-ast="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-ast="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-ast="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.kpi = ''; UI.flag = ''; UI.page = 0; refresh(); });
    $('[data-ast="f-dep"]', root).addEventListener('change', function (e) { UI.dep = e.target.value; UI.page = 0; refresh(); });
    $('[data-ast="f-eval"]', root).addEventListener('change', function (e) { UI.evalmin = e.target.value; UI.page = 0; refresh(); });
    $('[data-ast="v-avancement"]', root).addEventListener('click', function () { setView('avancement'); });
    $('[data-ast="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-ast="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
  }

  function setView(v) { UI.view = v; saveUI(); refresh(); }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var nb = rows.length;
    var cours = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var emb = rows.filter(function (r) { return r.embauche; }).length;
    var conv = nb ? Math.round(emb / nb * 100) : 0;
    var ind = rows.reduce(function (s, r) { return s + (r.indemnite || 0); }, 0);
    var cm = currentMonthKey();
    var eche = rows.filter(function (r) { return r.statut === 'En cours' && monthKey(r.dateFin) === cm; }).length;
    $('[data-ast="herosub"]').textContent = nb + ' stagiaires · ' + cours + ' en cours · ' + emb + ' embauché' + (emb > 1 ? 's' : '') + ' · conversion ' + conv + ' %';
    $('[data-ast="herosub2"]').textContent = 'Indemnité totale ' + fmtFcfa(ind) + ' · ' + eche + ' fin(s) de stage ce mois-ci · l\u2019essai mutuel : trancher avant la fin';
    var zone = $('[data-ast="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="ast-alert ' + a.tone + '" data-ast="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.ast-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        UI.flag = f;
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var cours = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var emb = rows.filter(function (r) { return r.embauche; }).length;
    var term = rows.filter(function (r) { return r.statut === 'Termine'; }).length;
    var aban = rows.filter(function (r) { return r.statut === 'Abandonne'; }).length;
    var conv = nb ? Math.round(emb / nb * 100) : 0;
    var ind = rows.reduce(function (s, r) { return s + (r.indemnite || 0); }, 0);
    var atrancher = rows.filter(function (r) { return r.imminente; }).length;
    var deps = {}; var etabs = {};
    rows.forEach(function (r) { if (r.departementAccueil) deps[r.departementAccueil] = 1; if (r.etablissement) etabs[r.etablissement] = 1; });
    var kpis = [
      { k: '', t: 'STAGIAIRES', v: String(nb), s: Object.keys(deps).length + ' départements · ' + Object.keys(etabs).length + ' établissements', cls: '' },
      { k: 'cours', t: 'EN COURS', v: String(cours), s: 'dont ' + atrancher + ' à trancher sous J-' + SEUILS.finImminente, cls: atrancher > 0 ? 'bad' : '' },
      { k: 'emb', t: 'CONVERSION EMBAUCHE', v: conv + ' %', s: emb + ' / ' + nb + ' statut « Embauche »', cls: '' },
      { k: '', t: 'INDENNITÉ TOTALE', v: (nb ? Math.round(ind / 1000).toLocaleString('fr-FR') : '0') + ' k FCFA', s: 'moyenne ' + fmtFcfa(nb ? Math.round(ind / nb) : 0) + ' / stagiaire', cls: '' },
      { k: 'term', t: 'TERMINÉS', v: String(term), s: 'stages conclus avec une décision', cls: '' },
      { k: 'aban', t: 'ABANDONS', v: String(aban), s: 'taux d\u2019abandon ' + pct(nb ? aban / nb * 100 : 0), cls: aban > 0 ? 'bad' : '' }
    ];
    var zone = $('[data-ast="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="ast-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="ast-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="ast-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="ast-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.ast-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        UI.flag = '';
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.evalmin = ''; UI.mois = ''; }
        UI.page = 0;
        refresh();
      });
    });
  }

  function donutSvg(parts, total) {
    var R = 52, C = 2 * Math.PI * R, off = 0;
    var segs = parts.filter(function (p) { return p.v > 0; }).map(function (p) {
      var frac = total > 0 ? p.v / total : 0;
      var len = frac * C;
      var s = '<circle r="' + R + '" cx="60" cy="60" fill="none" stroke="' + p.c + '" stroke-width="17" ' +
        'stroke-dasharray="' + Math.max(0, len - 1.2) + ' ' + (C - Math.max(0, len - 1.2)) + '" ' +
        'stroke-dashoffset="' + (-off) + '" transform="rotate(-90 60 60)" />';
      off += len;
      return s;
    }).join('');
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Statuts des stages">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">stagiaires</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-ast="donut"]');
    if (!zone) return;
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="ast-donut-legend">' + parts.map(function (p) {
        return '<span class="ast-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="ast-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="ast-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.ast-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.statut = UI.statut === k ? '' : k;
        UI.kpi = ''; UI.flag = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items, fmt) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (!items.length || mx <= 0) return '<div class="ast-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="ast-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="ast-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="ast-bar-track"><span class="ast-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="ast-bar-val">' + (fmt ? fmt(it.v) : it.v) + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-ast="bars"]');
    if (!zone) return;
    var map = {};
    rows.forEach(function (r) { var p = r.departementAccueil || '—'; if (!map[p]) map[p] = { key: p, name: p, v: 0 }; map[p].v += (r.indemnite || 0); });
    var items = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items, function (v) { return (v / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' k'; });
    $$('.ast-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.dep = UI.dep === k ? '' : k;
        UI.kpi = ''; UI.flag = '';
        UI.page = 0;
        refresh();
      });
    });
    var z2 = $('[data-ast="mois"]');
    if (!z2) return;
    var cm = currentMonthKey();
    var map2 = {};
    rows.forEach(function (r) {
      var mk = monthKey(r.dateFin);
      if (!mk || mk < cm) return;
      if (!map2[mk]) map2[mk] = { key: mk, name: MOIS_LAB(mk), v: 0 };
      map2[mk].v++;
    });
    var items2 = Object.keys(map2).sort().map(function (k) { return map2[k]; }).slice(0, 8);
    z2.innerHTML = barRowsHtml(items2);
    $$('.ast-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.mois = UI.mois === 'm:' + k ? '' : 'm:' + k;
        UI.kpi = ''; UI.flag = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var deps = {};
    rows.forEach(function (r) { if (r.departementAccueil) deps[r.departementAccueil] = 1; });
    var sel = $('[data-ast="f-statut"]');
    if (!sel) return;
    sel.innerHTML = '<option value="">Statut : tous</option>' + STATUTS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-ast="f-dep"]');
    sel2.innerHTML = '<option value="">Département : tous</option>' + Object.keys(deps).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.dep === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-ast="f-eval"]');
    sel3.innerHTML = '<option value="">Évaluation min : toutes</option>' +
      '<option value="16"' + (UI.evalmin === '16' ? ' selected' : '') + '>\u2265 16 / 20 (vivier or)</option>' +
      '<option value="14"' + (UI.evalmin === '14' ? ' selected' : '') + '>\u2265 14 / 20</option>' +
      '<option value="12"' + (UI.evalmin === '12' ? ' selected' : '') + '>\u2265 12 / 20</option>' +
      '<option value="10"' + (UI.evalmin === '10' ? ' selected' : '') + '>\u2265 10 / 20</option>' +
      '<option value="nulle"' + (UI.evalmin === 'nulle' ? ' selected' : '') + '>Non évalués</option>';
    $('[data-ast="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-ast="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' stagiaires';
  }

  /* ================= cellules ================= */
  function statutChip(r) {
    var sm = r.stm || statutMeta(r.statut);
    return '<span class="ast-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function evalCls(v) {
    if (v == null) return 'neutral';
    if (v >= 14) return 'ok';
    if (v >= SEUILS.evalMin) return 'warn';
    return 'err';
  }
  function evalChip(r) {
    if (r.evaluation == null) return '<span class="ast-chip neutral" title="Non évalué — l\u2019essai mutuel exige une note">non évalué</span>';
    var c = evalCls(r.evaluation);
    return '<span class="ast-evalchip ' + c + '" title="Évaluation ' + r.evaluation + '/20">' + r.evaluation + '<i>/20</i></span>' +
      '<span class="ast-gauge" aria-hidden="true"><span class="ast-gauge-fill ' + c + '" style="width:' + Math.max(0, Math.min(100, Math.round(r.evaluation / 20 * 100))) + '%"></span></span>';
  }
  function jrestChip(r) {
    if (!r.finTs) return '<span class="ast-num">—</span>';
    if (r.statut !== 'En cours') {
      return '<span class="ast-chip neutral" title="Stage conclu">' + (r.finTs <= todayTs() ? 'terminé le ' + esc(jDate(r.dateFin)) : esc(jDelay(r.dateFin))) + '</span>';
    }
    var j = r.jRest;
    if (j === null) return '<span class="ast-num">—</span>';
    if (j > 0) {
      var cls = j <= SEUILS.finImminente ? 'warn' : 'info';
      return '<span class="ast-chip ' + cls + '" title="Fin le ' + esc(r.dateFin) + '">J-' + j + '</span>';
    }
    if (j === 0) return '<span class="ast-chip err" title="Le stage se termine aujourd\u2019hui — trancher">aujourd\u2019hui</span>';
    return '<span class="ast-chip err" title="Fin de stage dépassée sans décision">dépassé de ' + (-j) + ' j</span>';
  }
  function miniProg(r) {
    return '<span class="ast-prog" role="img" aria-label="Stage écoulé à ' + r.pct + ' %"><i style="width:' + r.pct + '%"></i></span>' +
      '<span class="ast-prog-pct">' + r.pct + ' %</span>';
  }
  function dateRange(r) {
    if (!r.debutTs && !r.finTs) return '—';
    return esc(jDate(r.dateDebut) || '—') + ' \u2192 ' + esc(jDate(r.dateFin) || '—') + ' · ' + (r.totalJ || r.duree || 0) + ' j';
  }
  function pastille(r) {
    if (r.imminente) return '<button class="ast-pastille hot" data-pastille="' + esc(r.id) + '" title="Décision manquante — fin ' + esc(jDelay(r.dateFin)) + ' : trancher (Embauche / Terminé / Abandon motivé)" aria-label="Décision manquante pour ' + esc(fullName(r)) + '"></button>';
    if (r.noneval) return '<button class="ast-pastille warm" data-pastille="' + esc(r.id) + '" title="Non évalué après mi-parcours" aria-label="Évaluation manquante pour ' + esc(fullName(r)) + '"></button>';
    return '';
  }

  /* ================= table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var nb = all.length;
    var emb = all.filter(function (r) { return r.embauche; }).length;
    var ind = all.reduce(function (s, r) { return s + (r.indemnite || 0); }, 0);
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = 'none';
      if (key) aria = key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none';
      return '<th ' + (key ? 'data-sort="' + key + '" aria-sort="' + aria + '"' : '') + ' class="' + (cls || '') + '" scope="col">' + label +
        (key && key === sortKey ? '<span class="ast-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'ast-th-chk') + th('N°', 'numero') + th('Nom & prénom', 'nom') + th('Formation', 'formation') +
      th('Établissement', 'etablissement') + th('Département', 'departementAccueil') + th('Tuteur', 'tuteur') +
      th('Début', 'dateDebut') + th('Fin', 'dateFin') + th('Avancement', 'prog') + th('Durée', 'duree') +
      th('Indemnité', 'indemnite') + th('Évaluation', 'evaluation') + th('Statut', 'statut') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="ast-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(fullName(r)) + '"></td>' +
        '<td class="ast-num">' + esc(r.numero || r.id) + '</td>' +
        '<td><span class="ast-cand" data-open="' + esc(r.id) + '">' + esc(fullName(r)) + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.formation || '—') + '</td>' +
        '<td>' + esc(r.etablissement || '—') + '</td>' +
        '<td>' + (r.departementAccueil ? '<span class="ast-chip neutral">' + esc(r.departementAccueil) + '</span>' : '—') + '</td>' +
        '<td>' + esc(r.tuteur || '—') + '</td>' +
        '<td class="ast-arr">' + esc(jDate(r.dateDebut) || '—') + '</td>' +
        '<td>' + jrestChip(r) + '</td>' +
        '<td>' + miniProg(r) + '</td>' +
        '<td class="ast-arr">' + (r.totalJ || r.duree || 0) + ' j</td>' +
        '<td class="ast-arr">' + esc(fmtFcfa(r.indemnite)) + '</td>' +
        '<td>' + evalChip(r) + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td><div class="ast-actions">' +
          '<button class="ast-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="ast-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="ast-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (nouvel essai)">' + ICO.dup + '</button>' +
          '<button class="ast-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="ast-tfoot"><td></td><td colspan="14">TOTAL ' + nb + ' stagiaires · ' + emb + ' embauché(s) · conversion ' + (nb ? Math.round(emb / nb * 100) : 0) + ' % · indemnité totale ' + esc(fmtFcfa(ind)) + '</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="ast-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="ast-sel" data-ast="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="ast-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="ast-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-ast="content"]');
    card.innerHTML = '<div class="ast-tblcard"><div class="ast-tblwrap"><table class="ast-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="15"><div class="ast-empty">Aucun stagiaire ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = 1; }
        refresh();
      });
    });
    bindRowActions(card);
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-ast="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function bindRowActions(scope) {
    $$('[data-chk]', scope).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.sel.indexOf(id);
        if (c.checked && i < 0) UI.sel.push(id);
        if (!c.checked && i > -1) UI.sel.splice(i, 1);
        renderSelBar();
        renderHero();
      });
    });
    $$('[data-open]', scope).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open'), null); }); });
    $$('[data-pastille]', scope).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); openDrawer(b.getAttribute('data-pastille'), 'sec-eval'); }); });
    $$('[data-edit]', scope).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); openDialog(b.getAttribute('data-edit'), null); }); });
    $$('[data-dup]', scope).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', scope).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-ast="content"]');
    card.innerHTML = rows.length ? '<div class="ast-cards">' + rows.map(function (r) {
      return '<div class="ast-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="ast-card-top"><div><input type="checkbox" class="ast-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="ast-num">' + esc(r.numero || r.id) + '</span></div>' +
        statutChip(r) + '</div>' +
        '<div class="ast-card-name" data-open="' + esc(r.id) + '">' + esc(fullName(r)) + '</div>' +
        '<div class="ast-card-poste" style="font-size:.95rem">' + esc(r.formation || '—') + ' · ' + esc(r.etablissement || '—') + '</div>' +
        '<div class="ast-card-prog">' + miniProg(r) + jrestChip(r) + '</div>' +
        '<div class="ast-card-segs">' + evalChip(r) + pastille(r) + '</div>' +
        '<div class="ast-card-meta">' + (r.departementAccueil ? '<span class="ast-chip info">' + esc(r.departementAccueil) + '</span>' : '') +
          (r.tuteur ? '<span class="ast-chip neutral">' + esc(r.tuteur) + '</span>' : '') + '</div>' +
        '<div class="ast-card-foot"><span class="ast-num">' + esc(dateRange(r)) + '</span>' +
        '<div class="ast-card-act">' +
          '<button class="ast-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="ast-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="ast-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (nouvel essai)">' + ICO.dup + '</button>' +
          '<button class="ast-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="ast-empty">Aucun stagiaire ne correspond aux filtres</div>';
    bindRowActions(card);
  }

  /* ================= VUE AVANCEMENT (signature de la page) =========
     Un rangé = un stagiaire, dans l'ordre des fins de stage : où en
     est son essai mutuel (% écoulé), combien de jours restent pour
     trancher, quelle note, quel tuteur — et la pastille rouge si la
     décision manque approche de la fin. Clic → fiche du stagiaire. */
  function renderAvancement() {
    var rows = filtered();
    var card = $('[data-ast="content"]');
    var legend = '<div class="ast-av-legend">' +
      '<span><i class="ast-leg lg-bar"></i>barre = % du stage écoulé (le trait pointillé marque le mi-parcours d\u2019évaluation exigée)</span>' +
      '<span><i class="ast-leg lg-j"></i>badge = J-restants (ou fin conclue)</span>' +
      '<span><i class="ast-leg lg-p"></i>pastille = décision manquante / évaluation manquante</span>' +
      '<span class="ast-av-hint">Cliquez une rangée pour ouvrir la fiche — tranchez AVANT la fin : Embauche, Terminé ou Abandon motivé.</span>' +
      '</div>';
    var body = rows.map(function (r) {
      var badges = '';
      if (r.abandonSans) badges += '<span class="ast-chip warn" title="Abandon sans notes explicatives">cause à documenter</span> ';
      if (r.crossMiss) badges += '<span class="ast-chip info" title="Absent de la base candidats">hors vivier</span> ';
      var tick = '<span class="ast-av-tick" style="left:' + SEUILS.miParcours + '%" title="Mi-parcours : évaluation exigée (' + SEUILS.miParcours + ' %)"></span>';
      return '<div class="ast-avrow' + (r.imminente ? ' late' : '') + '" data-id="' + esc(r.id) + '" data-open="' + esc(r.id) + '" role="button" tabindex="0" aria-label="Ouvrir la fiche de ' + esc(fullName(r)) + '">' +
        '<div class="ast-av-id">' +
          '<span class="ast-av-name">' + esc(fullName(r)) + pastille(r) + '</span>' +
          '<span class="ast-num">' + esc(r.numero || r.id) + ' · ' + esc(r.formation || '—') + '</span>' +
          '<span class="ast-num">' + esc(r.etablissement || '—') + ' · tuteur ' + esc(r.tuteur || '—') + '</span>' +
          (badges ? '<span class="ast-av-badges">' + badges + '</span>' : '') +
        '</div>' +
        '<div class="ast-av-mid">' +
          '<div class="ast-av-bar" aria-hidden="true"><span class="ast-av-fill' + (r.pct >= 100 ? ' full' : '') + '" style="width:' + r.pct + '%"></span>' + tick + '</div>' +
          '<div class="ast-av-dates"><span class="ast-av-pct">' + r.pct + ' % écoulé</span><span class="ast-num">' + esc(dateRange(r)) + '</span></div>' +
        '</div>' +
        '<div class="ast-av-eval">' + evalChip(r) + '</div>' +
        '<div class="ast-av-end">' + jrestChip(r) + statutChip(r) + '</div>' +
      '</div>';
    }).join('');
    card.innerHTML = '<div class="ast-avcard">' + legend +
      (body || '<div class="ast-empty">Aucun stagiaire ne correspond aux filtres</div>') + '</div>';
    bindRowActions(card);
    $$('.ast-avrow', card).forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('button, input, select, textarea, a')) return;
        openDrawer(row.getAttribute('data-open'), null);
      });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(row.getAttribute('data-open'), null); }
      });
    });
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-ast="selbar"]');
    if (!zone) return;
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    var rows = UI.sel.map(function (id) { return rowById(id); }).filter(Boolean);
    zone.innerHTML = '<div class="ast-selbar">' +
      '<span class="ast-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="ast-selbar-sub">indemnité cumulée ' + fmtFcfa(rows.reduce(function (s, r) { return s + (r.indemnite || 0); }, 0)) + '</span>' +
      '<button class="ast-btn ast-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="ast-btn ast-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="ast-btn ast-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer fiche stagiaire =================
     Leçon M26/W2 : aucun handler ne se referme sur un snapshot —
     chaque mutation relit les données fraîches via mutate(cur). */
  function closeDrawer() { $$('[data-ast="drawer"],[data-ast="backdrop"][data-ast-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id, anchor) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'ast-backdrop', 'data-ast': 'backdrop', 'data-ast-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var sm = r.stm;
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var warnBlock = '';
    if (r.imminente) warnBlock += '<div class="ast-warnblock">⚠ Décision manquante : fin du stage ' + esc(jDelay(r.dateFin)) + ' — tranchez maintenant : Embauche (si l\u2019essai est concluant), Terminé, ou Abandon motivé.</div>';
    if (r.jRest !== null && r.jRest < 0 && r.statut === 'En cours') warnBlock += '<div class="ast-warnblock">⚠ Fin de stage dépassée de ' + (-r.jRest) + ' j sans décision — régulariser le statut dès aujourd\u2019hui.</div>';
    if (r.noneval) warnBlock += '<div class="ast-warnblock">⚠ Non évalué alors que ' + r.pct + ' % du stage est écoulé (seuil ' + SEUILS.miParcours + ' %) — l\u2019essai mutuel exige une note avant la fin.</div>';
    if (r.abandonSans) warnBlock += '<div class="ast-warnblock">⚠ Abandon sans notes explicatives — documenter la cause (côté stagiaire et côté entreprise).</div>';
    if (r.crossMiss) warnBlock += '<div class="ast-warnblock">ℹ Ce stagiaire actif n\u2019apparaît pas dans la base candidats — rattachez-le au vivier pour tracer le pipeline.</div>';
    var evalInput = '<div class="ast-sim-row"><label for="ast-eval-in">Évaluation (/20) — colorée par seuils (min ' + SEUILS.evalMin + ')</label>' +
      '<span style="display:flex;gap:8px;align-items:center"><input id="ast-eval-in" class="ast-in" type="number" min="0" max="20" step="1" data-ast="evalin" value="' + (r.evaluation == null ? '' : r.evaluation) + '" placeholder="ex. 15">' +
      '<button class="ast-btn ast-btn-primary" data-act="save-eval">Noter</button></span></div>';
    var hist = journalRows().filter(function (j) { return String(j.detail || '').indexOf(String(r.numero || r.id)) > -1; }).slice(0, 8);
    var histHtml = hist.length ? hist.map(function (j) {
      var d = new Date(journalTs(j.time) || Date.now());
      return '<div class="ast-jrow"><span class="ast-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="ast-jact">' + esc(j.action || '') + '</span><span class="ast-jdet">' + esc(j.detail || '') + '</span></div>';
    }).join('') : '<div class="ast-empty" style="padding:8px 0">Aucune action enregistrée pour ce stagiaire.</div>';
    var dr = h('aside', { class: 'ast-drawer', 'data-ast': 'drawer', role: 'dialog', 'aria-label': 'Fiche stagiaire ' + (r.numero || r.id) });
    dr.innerHTML =
      '<div class="ast-drawer-head"><div><div class="ast-drawer-title">' + esc(fullName(r)) + '</div>' +
      '<div class="ast-drawer-sub">' + esc(r.numero || r.id) + ' · ' + esc(r.formation || '—') + ' · ' + esc(r.departementAccueil || '—') + '</div></div>' +
      '<button class="ast-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ast-drawer-body">' +
        '<div class="ast-live" style="margin-top:0"><span>Statut <b style="color:' + sm.c + '">' + esc(sm.lab) + '</b></span>' +
          '<span>Avancement <b>' + r.pct + ' %</b></span>' +
          '<span>Restant <b>' + esc(r.statut === 'En cours' ? jDelay(r.dateFin) : 'conclu') + '</b></span>' +
          '<span>Durée <b>' + (r.totalJ || r.duree || 0) + ' j</b></span>' +
          '<span>Indemnité <b>' + esc(fmtFcfa(r.indemnite)) + '</b></span></div>' +
        warnBlock +
        '<div class="ast-fsec">Décision & évaluation rapides</div>' +
        '<div data-ast="sec-eval">' +
          '<div class="ast-sim-row" style="margin-bottom:10px"><label for="ast-stsel">Statut du stage — trancher AVANT la fin</label>' +
            '<select id="ast-stsel" class="ast-in" data-ast="stsel">' + STATUTS.map(function (s) {
              return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
            }).join('') + '</select></div>' +
          evalInput +
        '</div>' +
        '<div class="ast-fsec">Progression du stage</div>' +
        '<div data-ast="sec-prog">' +
          '<div class="ast-av-bar big" aria-hidden="true"><span class="ast-av-fill' + (r.pct >= 100 ? ' full' : '') + '" style="width:' + r.pct + '%"></span><span class="ast-av-tick" style="left:' + SEUILS.miParcours + '%"></span></div>' +
          '<div class="ast-av-dates" style="margin-top:6px"><span class="ast-av-pct">' + r.pct + ' % écoulé</span><span class="ast-num">' + esc(dateRange(r)) + '</span></div>' +
          '<dl class="ast-kv" style="margin-top:10px">' +
            kv('Date de début', esc(jDate(r.dateDebut) || '—')) +
            kv('Date de fin', esc(jDate(r.dateFin) || '—') + (r.jRest !== null && r.statut === 'En cours' ? ' <span class="ast-num">(' + esc(jDelay(r.dateFin)) + ')</span>' : '')) +
            kv('Durée', (r.totalJ || r.duree || 0) + ' jours') +
            kv('Département d\u2019accueil', esc(r.departementAccueil || '—')) +
          '</dl>' +
        '</div>' +
        '<div class="ast-fsec">Détails</div>' +
        '<dl class="ast-kv">' +
          kv('Établissement', esc(r.etablissement || '—')) +
          kv('Formation', esc(r.formation || '—')) +
          kv('Tuteur responsable', esc(r.tuteur || '—')) +
          kv('Indemnité', esc(fmtFcfa(r.indemnite))) +
          kv('N° stagiaire', esc(r.numero || r.id)) +
        '</dl>' +
        '<div class="ast-fsec">Notes</div>' +
        '<div data-ast="sec-notes">' +
          '<textarea class="ast-notebox" data-ast="note" placeholder="Observations de l\u2019essai mutuel : ce que l\u2019entreprise a vu, ce que le stagiaire a évalué, cause d\u2019abandon éventuelle…">' + esc(r.notes || '') + '</textarea>' +
          '<div class="ast-drawer-actions" style="margin-top:8px"><button class="ast-btn ast-btn-ghost" data-act="note">Enregistrer les notes</button></div>' +
        '</div>' +
        '<div class="ast-fsec">Historique</div>' +
        histHtml +
        '<div class="ast-drawer-actions">' +
          '<button class="ast-btn ast-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="ast-btn ast-btn-ghost" data-act="dup">Dupliquer (nouvel essai)</button>' +
          '<button class="ast-btn ast-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.ast-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-ast="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statut) return;
      mutate(function (cur) {
        cur.stagiaires = cur.stagiaires.map(function (x) { if (String(x.id) === String(id)) x.statut = nv; return x; });
        return cur;
      }, 'Décision tranchée', (r.numero || r.id) + ' · ' + fullName(r) + ' → ' + statutMeta(nv).lab);
      toast('Statut : ' + statutMeta(nv).lab, 'ok');
      reopenDrawerAt(id, 'sec-eval');
    });
    $('[data-act="save-eval"]', dr).addEventListener('click', function () {
      var inp = $('[data-ast="evalin"]', dr);
      var raw = String(inp.value || '').trim();
      if (raw === '') {
        mutate(function (cur) {
          cur.stagiaires = cur.stagiaires.map(function (x) { if (String(x.id) === String(id)) x.evaluation = null; return x; });
          return cur;
        }, 'Évaluation effacée', r.numero || r.id);
        toast('Évaluation effacée', 'ok');
        reopenDrawerAt(id, 'sec-eval');
        return;
      }
      var v = Number(raw);
      if (!isFinite(v) || v < 0 || v > 20) { toast('Note invalide — attendu 0 à 20', 'err'); return; }
      mutate(function (cur) {
        cur.stagiaires = cur.stagiaires.map(function (x) { if (String(x.id) === String(id)) x.evaluation = v; return x; });
        return cur;
      }, 'Évaluation enregistrée', (r.numero || r.id) + ' · ' + v + '/20');
      toast('Évaluation : ' + v + '/20', 'ok');
      reopenDrawerAt(id, 'sec-eval');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-ast="note"]', dr).value;
      mutate(function (cur) {
        cur.stagiaires = cur.stagiaires.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.numero || r.id);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    if (anchor) {
      var tgt = $('[data-ast="' + anchor + '"]', dr);
      if (tgt) { tgt.classList.add('hl'); try { tgt.scrollIntoView({ block: 'center' }); } catch (e) {} }
    }
    jlog('Ouverture fiche', r.numero || r.id);
  }
  function reopenDrawerAt(id, anchor) {
    if (UI.drawerId !== null && String(UI.drawerId) === String(id)) openDrawer(id, anchor);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-ast="dialog"],[data-ast="backdrop"][data-ast-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId, prefill) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) {
      if (r) return r[k] == null ? '' : String(r[k]);
      if (prefill && prefill[k] != null) return String(prefill[k]);
      return '';
    };
    var bd = h('div', { class: 'ast-backdrop', 'data-ast': 'backdrop', 'data-ast-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'ast-dialog', 'data-ast': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier un stagiaire' : 'Nouveau stagiaire' });
    function opts(list, cur) {
      return list.map(function (x) {
        return '<option value="' + esc(x.k) + '"' + (cur === x.k ? ' selected' : '') + '>' + esc(x.lab) + '</option>';
      }).join('');
    }
    var depsDatalist = '<datalist id="ast-deps">' + Object.keys(rows.reduce(function (m, x) { if (x.departementAccueil) m[x.departementAccueil] = 1; return m; }, {})).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    var tutDatalist = '<datalist id="ast-tuts">' + Object.keys(rows.reduce(function (m, x) { if (x.tuteur) m[x.tuteur] = 1; return m; }, {})).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    dlg.innerHTML =
      '<div class="ast-dialog-head"><h3>' + (r ? 'Modifier le stagiaire ' + esc(r.numero || r.id) : 'Nouveau stagiaire — ouvrir l\u2019essai mutuel') + '</h3>' +
      '<button class="ast-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ast-dialog-body">' +
        '<div class="ast-fgrid">' +
          '<label class="ast-lab">Nom *<input class="ast-in" data-f="nom" value="' + esc(v('nom')) + '" placeholder="Ex. Tchoumi Sandra"></label>' +
          '<label class="ast-lab">Prénom *<input class="ast-in" data-f="prenom" value="' + esc(v('prenom')) + '" placeholder="Ex. Sandra"></label>' +
          '<label class="ast-lab">Établissement *<input class="ast-in" data-f="etablissement" value="' + esc(v('etablissement')) + '" placeholder="Ex. Université de Douala"></label>' +
          '<label class="ast-lab">Formation *<input class="ast-in" data-f="formation" value="' + esc(v('formation')) + '" placeholder="Ex. Licence Gestion Hôtelière"></label>' +
          '<label class="ast-lab">Département d\u2019accueil *<input class="ast-in" data-f="departementAccueil" list="ast-deps" value="' + esc(v('departementAccueil')) + '" placeholder="Ex. Restauration"></label>' +
          '<label class="ast-lab">Tuteur responsable *<input class="ast-in" data-f="tuteur" list="ast-tuts" value="' + esc(v('tuteur')) + '" placeholder="Ex. M. Nkoulou Amina"></label>' +
          '<label class="ast-lab">Date de début * (jj/mm/aaaa)<input class="ast-in" data-f="dateDebut" value="' + esc(jDate(v('dateDebut'))) + '" placeholder="jj/mm/aaaa" inputmode="numeric"></label>' +
          '<label class="ast-lab">Date de fin * (jj/mm/aaaa)<input class="ast-in" data-f="dateFin" value="' + esc(jDate(v('dateFin'))) + '" placeholder="jj/mm/aaaa" inputmode="numeric"></label>' +
          '<label class="ast-lab">Indemnité (FCFA)<input class="ast-in" type="number" min="0" step="500" data-f="indemnite" value="' + esc(v('indemnite')) + '" placeholder="ex. 50000"></label>' +
          '<label class="ast-lab">Statut<select class="ast-in" data-f="statut">' + opts(STATUTS, v('statut') || 'En cours') + '</select></label>' +
          '<label class="ast-lab">Évaluation (/20, vide = non évalué)<input class="ast-in" type="number" min="0" max="20" step="1" data-f="evaluation" value="' + esc(v('evaluation')) + '" placeholder="ex. 15"></label>' +
          '<label class="ast-lab full">Notes<textarea class="ast-in ast-ta" data-f="notes" placeholder="Observations de l\u2019essai mutuel, engagement, points d\u2019attention…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' + depsDatalist + tutDatalist +
        '<div class="ast-live" data-ast="dlg-live"></div>' +
        '<div data-ast="dlg-err"></div>' +
      '</div>' +
      '<div class="ast-dialog-foot"><span class="ast-form-hint">L\u2019essai mutuel commence au premier jour · dates réelles jj/mm/aaaa · la fin doit suivre le début</span>' +
      '<span style="display:flex;gap:8px"><button class="ast-btn ast-btn-ghost" data-act="cancel" style="color:var(--ast-text);border-color:var(--ast-line)">Annuler</button>' +
      '<button class="ast-btn ast-btn-primary" data-act="save" disabled>' + (r ? 'Enregistrer' : 'Créer le stagiaire') + '</button></span></div>';
    $('.ast-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function collect() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      return val;
    }
    function validate(val) {
      if (!String(val.nom || '').trim()) return 'Le nom est obligatoire.';
      if (!String(val.prenom || '').trim()) return 'Le prénom est obligatoire.';
      if (!String(val.etablissement || '').trim()) return 'L\u2019établissement est obligatoire.';
      if (!String(val.formation || '').trim()) return 'La formation est obligatoire.';
      if (!String(val.departementAccueil || '').trim()) return 'Le département d\u2019accueil est obligatoire.';
      if (!String(val.tuteur || '').trim()) return 'Le tuteur responsable est obligatoire.';
      if (!validDateStr(val.dateDebut)) return 'La date de début est obligatoire et doit être une date réelle au format jj/mm/aaaa.';
      if (!validDateStr(val.dateFin)) return 'La date de fin est obligatoire et doit être une date réelle au format jj/mm/aaaa.';
      if (dateKey(val.dateFin) <= dateKey(val.dateDebut)) return 'La date de fin doit être strictement postérieure à la date de début.';
      if (String(val.indemnite || '').trim() && !(Number(val.indemnite) >= 0)) return 'L\u2019indemnité doit être un nombre positif (FCFA).';
      var ev = String(val.evaluation || '').trim();
      if (ev && !(Number(ev) >= 0 && Number(ev) <= 20)) return 'L\u2019évaluation doit être comprise entre 0 et 20 (ou vide si non évalué).';
      return '';
    }
    function live() {
      var val = collect();
      var err = validate(val);
      var save = $('[data-act="save"]', dlg);
      save.disabled = !!err;
      var dOk = validDateStr(val.dateDebut), fOk = validDateStr(val.dateFin);
      var totalJ = (dOk && fOk && dateKey(val.dateFin) > dateKey(val.dateDebut)) ? Math.round((tsOf(val.dateFin) - tsOf(val.dateDebut)) / 86400000) : null;
      var jRest = fOk ? daysUntil(val.dateFin) : null;
      var pc = (dOk && fOk && totalJ) ? Math.max(0, Math.min(100, Math.round(Math.floor((todayTs() - tsOf(val.dateDebut)) / 86400000) / totalJ * 100))) : null;
      $('[data-ast="dlg-live"]', dlg).innerHTML =
        '<span>Durée calculée <b>' + (totalJ !== null ? totalJ + ' j' : '—') + '</b></span>' +
        '<span>J-restants <b>' + (jRest !== null ? esc(jDelay(val.dateFin)) : 'date invalide') + '</b></span>' +
        '<span>% écoulé <b>' + (pc !== null ? pc + ' %' : '—') + '</b></span>' +
        '<span>Indemnité <b>' + esc(fmtFcfa(Number(val.indemnite) || 0)) + '</b></span>' +
        (err ? '<span class="bad">⚠ ' + esc(err) + '</span>' : '<span class="good">✓ Formulaire valide</span>');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); i.addEventListener('change', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = collect();
      var err = validate(val);
      if (err) return;
      var rec = {
        nom: String(val.nom).trim(),
        prenom: String(val.prenom).trim(),
        etablissement: String(val.etablissement).trim(),
        formation: String(val.formation).trim(),
        departementAccueil: String(val.departementAccueil).trim(),
        tuteur: String(val.tuteur).trim(),
        dateDebut: String(val.dateDebut).trim(),
        dateFin: String(val.dateFin).trim(),
        indemnite: Number(val.indemnite) || 0,
        statut: String(val.statut || '').trim() || 'En cours',
        evaluation: String(val.evaluation || '').trim() === '' ? null : Number(val.evaluation),
        notes: String(val.notes || '')
      };
      rec.duree = Math.round((tsOf(rec.dateFin) - tsOf(rec.dateDebut)) / 86400000);
      if (editId) {
        mutate(function (cur) {
          cur.stagiaires = cur.stagiaires.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Stagiaire modifié', rec.nom);
        toast('Stagiaire mis à jour', 'ok');
      } else {
        mutate(function (cur) {
          var mx = cur.stagiaires.reduce(function (m, x) {
            var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n);
            var m2 = /^STG-(\d+)$/.exec(String(x.numero || ''));
            if (m2) m = Math.max(m, Number(m2[1]));
            return m;
          }, 0) + 1;
          var cp = {};
          for (var k2 in rec) cp[k2] = rec[k2];
          cp.id = mx;
          cp.numero = 'STG-' + String(mx).padStart(3, '0');
          cur.stagiaires = cur.stagiaires.concat([cp]);
          return cur;
        }, 'Stagiaire créé', rec.nom);
        toast('Stagiaire créé — ' + rec.nom, 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="nom"]', dlg);
    if (first) first.focus();
  }

  /* ================= duplication / suppression ================= */
  function dupRow(id) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      var mx = cur.stagiaires.reduce(function (m, x) {
        var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n);
        var m2 = /^STG-(\d+)$/.exec(String(x.numero || ''));
        if (m2) m = Math.max(m, Number(m2[1]));
        return m;
      }, 0) + 1;
      var cp = {};
      for (var k in r) if (DERIVED.indexOf(k) < 0) cp[k] = r[k];
      cp.id = mx;
      cp.numero = 'STG-' + String(mx).padStart(3, '0');
      /* un nouvel essai mutuel repart sans décision ni note : statut En cours, évaluation à blanc */
      cp.statut = 'En cours';
      cp.evaluation = null;
      cur.stagiaires = cur.stagiaires.concat([cp]);
      return cur;
    }, 'Stagiaire dupliqué', (r.numero || r.id) + ' → nouvel essai');
    toast('Stagiaire dupliqué — nouvel essai (statut En cours, évaluation à blanc)', 'ok');
  }
  function closeConfirm() { $$('[data-ast="confirm"],[data-ast="backdrop"][data-ast-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'ast-backdrop', 'data-ast': 'backdrop', 'data-ast-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'ast-confirm', 'data-ast': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer ce stagiaire ?</h4><p>' + esc(r.numero || r.id) + ' — ' + esc(fullName(r)) + ' (' + esc(r.formation || '—') + '). Le suivi de l\u2019essai mutuel sera perdu. Cette action est définitive.</p>' +
      '<div class="ast-confirm-row"><button class="ast-btn ast-btn-ghost" data-a="no" style="color:var(--ast-text);border-color:var(--ast-line)">Annuler</button>' +
      '<button class="ast-btn ast-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.stagiaires = cur.stagiaires.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Stagiaire supprimé', r.numero || r.id);
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Stagiaire supprimé', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' stagiaires ?') : 'Supprimer 1 stagiaire ?';
    var bd = h('div', { class: 'ast-backdrop', 'data-ast': 'backdrop', 'data-ast-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'ast-confirm', 'data-ast': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero || r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="ast-confirm-row"><button class="ast-btn ast-btn-ghost" data-a="no" style="color:var(--ast-text);border-color:var(--ast-line)">Annuler</button>' +
      '<button class="ast-btn ast-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.stagiaires = cur.stagiaires.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' stagiaires');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' stagiaires supprimés', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= échéances (S) =================
     « Pas de stage qui s'arrête sans décision » : qui finit quand,
     et la décision est-elle prête ? */
  function closeEcheances() { $$('[data-ast="echeances"],[data-ast="backdrop"][data-ast-for="echeances"]').forEach(function (n) { n.remove(); }); }
  function openEcheances() {
    closeEcheances();
    var rows = data().filter(function (r) { return r.finTs > 0; }).sort(function (a, b) { return a.finTs - b.finTs; });
    var atrancher = rows.filter(function (r) { return r.imminente; });
    var cm = currentMonthKey();
    var ceMois = rows.filter(function (r) { return r.statut === 'En cours' && monthKey(r.dateFin) === cm; }).length;
    var bd = h('div', { class: 'ast-backdrop', 'data-ast': 'backdrop', 'data-ast-for': 'echeances' });
    bd.addEventListener('click', closeEcheances);
    var p = h('div', { class: 'ast-panel', 'data-ast': 'echeances', role: 'dialog', 'aria-label': 'Échéances & décisions à trancher' });
    var list = rows.slice(0, 12).map(function (r) {
      var decision = r.statut !== 'En cours'
        ? '<span class="ast-chip ok">décision : ' + esc(statutMeta(r.statut).lab) + '</span>'
        : '<span class="ast-chip err">à trancher</span>';
      return '<div class="ast-ech-row' + (r.imminente ? ' hot' : '') + '">' +
        '<span class="ast-ech-when">' + esc(jDate(r.dateFin) || '—') + ' <b>(' + esc(jDelay(r.dateFin)) + ')</b></span>' +
        '<span class="ast-ech-who"><b>' + esc(fullName(r)) + '</b> · ' + esc(r.numero || r.id) + ' · ' + esc(r.departementAccueil || '—') + '</span>' +
        '<span class="ast-ech-what">' + decision + ' <span class="ast-num">' + r.pct + ' % écoulé</span></span>' +
        '<button class="ast-ic" data-open="' + esc(r.id) + '" title="Ouvrir la fiche">' + ICO.eye + '</button></div>';
    }).join('');
    var tip = atrancher.length
      ? '💡 ' + atrancher.length + ' stage(s) à trancher sous J-' + SEUILS.finImminente + ' — chaque stage doit se conclure par Embauche, Terminé ou Abandon motivé.'
      : '💡 Aucune décision urgente — le vivier est à jour. Pensez à convertir les meilleurs en embauches.';
    p.innerHTML = '<div class="ast-panel-head"><h3>Échéances & décisions à trancher</h3><button class="ast-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ast-panel-body">' +
        '<div class="ast-sim-kpis"><span><b>' + atrancher.length + '</b> à trancher sous J-' + SEUILS.finImminente + '</span>' +
          '<span><b>' + ceMois + '</b> fin(s) ce mois-ci</span></div>' +
        (list || '<div class="ast-empty">Aucune échéance enregistrée.</div>') +
        '<div class="ast-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' +
      '</div>';
    $('.ast-drawer-x', p).addEventListener('click', closeEcheances);
    $$('[data-open]', p).forEach(function (b) {
      b.addEventListener('click', function () { closeEcheances(); openDrawer(b.getAttribute('data-open'), null); });
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Échéances ouvertes', atrancher.length + ' à trancher');
  }

  /* ================= seuils (K) ================= */
  function closeSeuils() { $$('[data-ast="seuils"],[data-ast="backdrop"][data-ast-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'ast-backdrop', 'data-ast': 'backdrop', 'data-ast-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'ast-panel', 'data-ast': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="ast-panel-head"><h3>Seuils de pilotage</h3><button class="ast-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ast-panel-body">' +
        '<p class="ast-cibles-note">Ces seuils alimentent les alertes « fin à trancher », « non évalué après mi-parcours » et la coloration des notes — réglez-les selon vos politiques de stage.</p>' +
        '<div class="ast-sim-row"><label for="ast-s1">Fin imminente (jours avant la fin de stage)</label><input type="range" id="ast-s1" min="7" max="90" step="1" value="' + SEUILS.finImminente + '"><input class="ast-in" type="number" min="7" max="90" step="1" data-ast="s1n" value="' + SEUILS.finImminente + '"></div>' +
        '<div class="ast-sim-row"><label for="ast-s2">Évaluation exigée dès (% du stage écoulé)</label><input type="range" id="ast-s2" min="20" max="80" step="1" value="' + SEUILS.miParcours + '"><input class="ast-in" type="number" min="20" max="80" step="1" data-ast="s2n" value="' + SEUILS.miParcours + '"></div>' +
        '<div class="ast-sim-row"><label for="ast-s3">Note minimum attendue (/20)</label><input type="range" id="ast-s3" min="5" max="15" step="1" value="' + SEUILS.evalMin + '"><input class="ast-in" type="number" min="5" max="15" step="1" data-ast="s3n" value="' + SEUILS.evalMin + '"></div>' +
        '<div class="ast-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="ast-btn ast-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.ast-drawer-x', p).addEventListener('click', closeSeuils);
    [['ast-s1', 's1n', 'finImminente', 7, 90, 1], ['ast-s2', 's2n', 'miParcours', 20, 80, 1], ['ast-s3', 's3n', 'evalMin', 5, 15, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-ast="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.finImminente = Math.max(7, Math.min(90, Number($('[data-ast="s1n"]', p).value) || SEUILS.finImminente));
      SEUILS.miParcours = Math.max(20, Math.min(80, Number($('[data-ast="s2n"]', p).value) || SEUILS.miParcours));
      SEUILS.evalMin = Math.max(5, Math.min(15, Number($('[data-ast="s3n"]', p).value) || SEUILS.evalMin));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'fin imminente J-' + SEUILS.finImminente + ' · évaluation dès ' + SEUILS.miParcours + ' % · note min ' + SEUILS.evalMin + '/20');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-ast="journal"],[data-ast="backdrop"][data-ast-for="journal"]').forEach(function (n) { n.remove(); }); }
  function journalRows() {
    var out = [];
    var seen = {};
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.read === 'function') {
        (window.__ADMINA_AUDIT__.read() || []).forEach(function (x) {
          var k = String(x.time || '') + '|' + (x.action || '') + '|' + (x.detail || '');
          if (!seen[k]) { seen[k] = 1; out.push(x); }
        });
      }
    } catch (e) {}
    try {
      JSON.parse(localStorage.getItem(LS_J) || '[]').forEach(function (x) {
        var k = String(x.time || '') + '|' + (x.action || '') + '|' + (x.detail || '');
        if (!seen[k]) { seen[k] = 1; out.push(x); }
      });
    } catch (e2) {}
    out.sort(function (a, b) { return journalTs(b.time) - journalTs(a.time); });
    return out;
  }
  function openJournal() {
    closeJournal();
    var bd = h('div', { class: 'ast-backdrop', 'data-ast': 'backdrop', 'data-ast-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'ast-panel', 'data-ast': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="ast-panel-head"><h3>Journal d\u2019activité</h3><button class="ast-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ast-panel-body" data-ast="jlist"></div>';
    $('.ast-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-ast="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(journalTs(x.time) || Date.now());
      return '<div class="ast-jrow"><span class="ast-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="ast-jact">' + esc(x.action || '') + '</span><span class="ast-jdet">' + esc(x.detail || '') + ' <span class="ast-num">' + esc(x.role || '') + '</span></span></div>';
    }).join('') : '<div class="ast-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Stagiaire', 'Nom', 'Prénom', 'Établissement', 'Formation', 'Département accueil', 'Tuteur', 'Date début', 'Date fin', 'Durée (j)', '% écoulé', 'J-restants', 'Indemnité (FCFA)', 'Évaluation /20', 'Statut', 'Notes'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero || r.id, r.nom, r.prenom, r.etablissement, r.formation, r.departementAccueil, r.tuteur, jDate(r.dateDebut), jDate(r.dateFin), r.totalJ || r.duree || 0, r.pct, r.jRest === null ? '' : jDelay(r.dateFin), r.indemnite, r.evaluation == null ? '' : r.evaluation, statutMeta(r.statut).lab, r.notes];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'stagiaires-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeEcheances(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-ast="dialog"]') || $('[data-ast="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { setView('avancement'); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { setView('cards'); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { setView('table'); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openEcheances(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { openSeuils(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-ast="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouveau stagiaire · E export CSV · J journal · P avancement · C cartes · T tableau · S échéances · K seuils · / recherche', ''); }
  }

  /* ================= burger mobile ================= */
  var burger = null, navBackdrop = null;
  function ensureBurger() {
    var tb = document.querySelector('.MuiAppBar-root header, .MuiAppBar-root, header.MuiAppBar-root') || document.querySelector('header');
    if (!tb) return;
    if (getComputedStyle(tb).position === 'static') tb.style.position = 'relative';
    if (!burger) {
      burger = document.createElement('button');
      burger.type = 'button';
      burger.className = 'admina-burger';
      burger.id = 'admina-burger';
      burger.setAttribute('aria-label', 'Ouvrir la navigation');
      burger.setAttribute('aria-controls', 'admina-navpanel');
      burger.setAttribute('aria-expanded', 'false');
      burger.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg>';
      burger.addEventListener('click', function () {
        if (html.classList.contains('admina-nav-open')) closeNav(); else openNav();
      });
    }
    if (tb.firstElementChild !== burger) tb.insertBefore(burger, tb.firstChild);
    var panel = document.querySelector('.MuiDrawer-docked');
    if (panel && !panel.id) { panel.id = 'admina-navpanel'; panel.setAttribute('aria-label', 'Navigation principale'); }
    if (!navBackdrop || !navBackdrop.isConnected) {
      navBackdrop = document.createElement('div');
      navBackdrop.className = 'admina-nav-backdrop';
      navBackdrop.addEventListener('click', function () { closeNav(); });
      document.body.appendChild(navBackdrop);
    }
  }
  function openNav() { html.classList.add('admina-nav-open'); if (burger) burger.setAttribute('aria-expanded', 'true'); }
  function closeNav() {
    if (!html.classList.contains('admina-nav-open')) return;
    html.classList.remove('admina-nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', function (e) {
    if (!html.classList.contains('admina-nav-open')) return;
    var item = e.target && e.target.closest ? e.target.closest('.MuiDrawer-docked .MuiListItemButton-root, .MuiDrawer-docked a') : null;
    if (item) setTimeout(closeNav, 120);
  }, true);

  /* ================= thème ================= */
  function detectTheme() {
    var root = $('[data-ast="root"]');
    if (!root) return;
    var dark = null;
    try {
      var v = localStorage.getItem('admina-dark');
      if (v === 'true') dark = true;
      else if (v === 'false') dark = false;
    } catch (e) {}
    if (dark === null) {
      var elx = root.parentElement;
      while (elx && elx !== document.documentElement) {
        var bg = '';
        try { bg = getComputedStyle(elx).backgroundColor || ''; } catch (e2) {}
        var m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?\)/.exec(bg);
        if (m && (m[4] === undefined || parseFloat(m[4]) > 0.5)) {
          var lum = (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255;
          dark = lum < 0.45;
          break;
        }
        elx = elx.parentElement;
      }
    }
    if (dark === null) {
      try { dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e3) { dark = false; }
    }
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  /* ================= UI persist ================= */
  function loadUI() {
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v) { if (typeof v.view === 'string') UI.view = v.view; if (typeof v.per === 'number') UI.per = v.per; } } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per })); } catch (e) {} }

  /* ================= refresh global ================= */
  var shellBuilt = false;
  function buildShellOnce() { if (!shellBuilt) { buildShell(); shellBuilt = true; } }
  function refresh() {
    if (!isOn()) return;
    if (!mountRoot()) return;
    buildShellOnce();
    renderHero();
    renderKPIs();
    renderDonut();
    renderBars();
    renderFilters();
    if (UI.view === 'cards') renderCards();
    else if (UI.view === 'table') renderTable();
    else renderAvancement();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-ast="drawer"],[data-ast="dialog"],[data-ast="confirm"],[data-ast="journal"],[data-ast="echeances"],[data-ast="seuils"]')) {
      $$('[data-ast="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0, subBound = false;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function tryActivate() {
    if (active) return;
    if (!isOn()) { bootTries = 0; return; }
    bootTries++;
    if (!ready()) {
      if (bootTries < 30) { setTimeout(tryActivate, 450); return; }
      /* 30 essais sans API ni LS : activer quand même avec le snapshot
         démo dérivé des données natives — les écritures se feront en LS.
         Si l'ancre native manque, mountRoot() échoue et la page reste intacte. */
    }
    activate();
  }
  function bindApiSub() {
    if (subBound) return;
    var a = api();
    if (a && typeof a.subscribe === 'function') {
      try { a.subscribe(function () { if (active) scheduleRefresh(); }); subBound = true; } catch (e) {}
    }
  }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-ast');
    html.setAttribute('data-ast', 'on');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-ast]')) continue;
        scheduleRefresh();
        break;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', onKey);
  }
  var refreshT = null;
  function scheduleRefresh() { clearTimeout(refreshT); refreshT = setTimeout(function () { if (active && isOn()) refresh(); }, 200); }
  function deactivate() {
    if (!active) return;
    active = false;
    html.classList.remove('admina-ast');
    html.removeAttribute('data-ast');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeEcheances(); closeSeuils();
    UI.sel = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    bindApiSub();
    var natif = conteneurNatif();
    var root = $('[data-ast="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-ast-hide', '1');
      natif.setAttribute('data-ast-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) refresh();
  }

  /* démarrage : réessais 30 × 450 ms (relit l'API à chaque essai),
     puis fallback LS / snapshot démo — jamais casser la page native */
  if (isOn()) tryActivate();
  setInterval(function () {
    var on = isOn();
    if (on && !active) tryActivate();
    else if (!on && active) deactivate();
  }, 350);
  window.addEventListener('popstate', function () {
    var on = isOn();
    if (on && !active) tryActivate();
    else if (!on && active) deactivate();
  });

  window.__ADMINA_STG_UI__ = {
    version: '1.0-w3',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openEcheances: openEcheances,
    openJournal: openJournal,
    openSeuils: openSeuils,
    setView: setView,
    exportCSV: exportCSV,
    debug: { filtered: filtered, alerts: computeAlerts, nextNumero: nextNumero, seuils: SEUILS }
  };
  try { console.info('[ADMINA_STG] W3-a actif — Vivier Stagiaires /stagiaires (l\u2019essai mutuel)'); } catch (e) {}
  window.__ADMINA_STG_W3__ = true;
})();
