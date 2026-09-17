/* =============================================================
   Admina-RH — Saisonniers & Temporaires — couche admina (W3-b)
   Scope : /saisonniers-temporaires · préfixe asa- · flag __ADMINA_SAI_W3__
   ---------------------------------------------------------------
   PHILOSOPHIE DE LA PAGE (exigence permanente du client — verbatim) :
   « /saisonniers-temporaires = LE FICHIER DES RETOURNANTS. La main
   d'œuvre saisonnière bien gérée n'est pas un bras d'essuyage
   renouvelé chaque année : c'est un fichier de retournants connus —
   quelqu'un qui a bien fait une saison est une quantité maîtrisée
   qu'on recontacte en priorité. La page suit les contrats dans le
   temps (dates, durées, couverture), maîtrise les coûts (taux
   horaire × durée vs coût total, dérives signalées), et distingue
   les motifs (Saisonnalité, Remplacement, Cooptation, candidature
   spontanée) pour savoir qui revient, pourquoi, et à quel prix.
   La fidélisation prime sur le remplacement. »
   ---------------------------------------------------------------
   - VUE SIGNATURE « SAISONNALITÉ » (défaut au chargement) : frise
     12 mois (Janv→Déc) · une ligne par saisonnier · barres de
     couverture dateDebut→dateFin positionnées sur l'axe des mois ·
     badge retournant (même nom dans ≥ 2 contrats) · pastille de
     conflit (contrats d'une même personne qui se chevauchent) ·
     mois SANS couverture mis en évidence pour un département donné
     (sélecteur au-dessus de la frise) · navigation ‹ année ›
     (année de référence = celle des contrats majoritaires)
   - Héro calculé (X saisonniers · Y en cours · coût total Z FCFA ·
     N retournants) + sous-ligne durée moyenne
   - 5 alertes AAA cliquables → filtres (fins imminentes sans
     renouvellement, retournants à recontacter, coût du portefeuille
     > seuil, dérive de coût, mois à venir sans couverture)
   - 6 KPI (≥ 4 filtrent) + 3 graphiques SVG vanilla cliquables
     (donut statuts · coût par département · contrats par mois)
   - Recherche + filtres (statut, département, motif, période) +
     Réinitialiser · table triable aria-sort · vue cartes
   - Drawer fiche (coûts détaillés calculés vs déclarés, motif &
     source éditables, statut rapide, notes, alertes inline,
     historique journal) · dialog création/édition VALIDÉ (dates
     jj/mm/aaaa réelles, fin > début bloquant, coût auto-calculé
     modifiable + recalculer, aperçu live) · duplication (statut
     En cours, SAI max+1, dates à remplir) · suppression simple &
     groupée confirmée · seuils persistés · export CSV · journal
     admina_journal (role RH) + délégation __ADMINA_AUDIT__ ·
     raccourcis N/E/J/P/C/S/K/T + / + ? · dark mode auto · burger
     mobile <820px · 390px sans débordement (frise scrollable dans
     son conteneur, jamais la page)
   - Données : window.__ADMINA_SAI_API__ (chunk déjà patché — AUCUN
     re-patch ici) → fallback localStorage admina-saisonniers-data →
     snapshot démo · résilience : 30 réessais (450 ms) au démarrage,
     sinon page native intacte · pont bidirectionnel (subscribe +
     poller 1,2 s) — la vue native reflète les mutations du module
   - Aucun global hors window.__ADMINA_SAI_*
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_SAI_W3__) return; /* idempotence : refus si déjà chargé */

  var html = document.documentElement;
  var RE_PAGE = /\/saisonniers-temporaires\/?$/; /* pathname UNIQUEMENT, jamais querystring */
  var LS_DATA = 'admina-saisonniers-data';
  var LS_UI = 'admina-saisonniers-ui';
  var LS_SEUILS = 'admina-saisonniers-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', dep: '', motif: '', periode: '', kpi: '', dim: '', mois: '', depfrise: '', annee: null, view: 'saison', sortKey: 'debut', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, sel: [] };

  /* ================= seuils (persistés) ================= */
  var SEUILS_DEF = { finImminente: 30, retournantDelai: 3, coutMax: 2000000, derivePct: 10, heuresJour: 8 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }
  function clamp(v, mn, mx) { v = Number(v); if (!isFinite(v)) v = mn; return Math.max(mn, Math.min(mx, v)); }

  /* ================= référentiels ================= */
  /* Couleurs natives du chunk : En cours:info · Termine:success · Abandonne:error */
  var STATUTS = [
    { k: 'En cours', lab: 'En cours', c: '#0e7490' },
    { k: 'Termine', lab: 'Terminé', c: '#059669' },
    { k: 'Abandonne', lab: 'Abandonné', c: '#dc2626' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  function statutIdx(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return i; } return 99; }
  var MOTIFS = ['Remplacement', 'Saisonnalite', 'Surcharge', 'Reorganisation', 'Cooptation', 'Candidature spontanee'];
  var MOTIF_LAB = { 'Remplacement': 'Remplacement', 'Saisonnalite': 'Saisonnalité', 'Surcharge': 'Surcharge', 'Reorganisation': 'Réorganisation', 'Cooptation': 'Cooptation', 'Candidature spontanee': 'Candidature spontanée' };
  function motifLab(k) { return MOTIF_LAB[k] || k || '—'; }
  var SOURCES = ['Site web entreprise', 'Presse', 'Cooptation', 'Reseaux sociaux', 'Candidature spontanee', 'Cabinet de recrutement', 'Référence interne'];
  var MOIS12 = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fcfa(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' FCFA'; }
  function nb(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }); }
  function pctv(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
  function tsOf(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (m) return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    var m2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    if (m2) return Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]));
    return 0;
  }
  function dateKey(s) { var t = tsOf(s); return t ? Math.round(t / 86400000) : 0; }
  function todayTs() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysUntil(s) { var t = tsOf(s); if (!t) return null; return Math.round((t - todayTs()) / 86400000); }
  function daysSince(s) { var d = daysUntil(s); return d === null ? 0 : Math.max(0, -d); }
  function jDelay(s) { var d = daysUntil(s); if (d === null) return '—'; if (d === 0) return "aujourd'hui"; if (d > 0) return 'J+' + d; if (d === -1) return 'hier'; return 'J' + d; }
  function monthsSince(s) {
    var t = tsOf(s); if (!t) return 0;
    var d = new Date(t), n = new Date();
    var m = (n.getFullYear() - d.getFullYear()) * 12 + (n.getMonth() - d.getMonth());
    if (n.getDate() < d.getDate()) m -= 1;
    return Math.max(0, m);
  }
  function validDateStr(s) {
    var v = String(s || '').trim();
    if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(v)) return false;
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    var d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2200) return false;
    var dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCDate() === d && dt.getUTCMonth() === mo - 1;
  }
  function diffJours(a, b) { var ta = tsOf(a), tb = tsOf(b); if (!ta || !tb) return 0; return Math.round((tb - ta) / 86400000) + 1; }
  function monthKey(s) {
    var t = tsOf(s); if (!t) return '';
    var d = new Date(t);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
  }
  function jlog(a, d) {
    try { if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.log === 'function') window.__ADMINA_AUDIT__.log(a, d, 'RH'); } catch (e) {}
    try {
      var arr = JSON.parse(localStorage.getItem(LS_J) || '[]');
      if (!Array.isArray(arr)) arr = [];
      arr.push({ time: Date.now(), action: a, detail: d || '', role: 'RH' });
      if (arr.length > 80) arr = arr.slice(-80);
      localStorage.setItem(LS_J, JSON.stringify(arr));
    } catch (e2) {}
  }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h(sel, attrs, htmlStr) { var e = document.createElement(sel); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (htmlStr != null) e.innerHTML = htmlStr; return e; }
  function toastsZone() { var z = $('[data-asa="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-asa', 'toasts'); z.className = 'asa-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'asa-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= snapshot démo (fallback ultime, copie conforme du chunk natif) ================= */
  var DEMO = [
    { id: 1, numero: 'SAI-001', nom: 'Nkoum Patrick', prenom: 'Patrick', poste: 'Agent de Sécurité', departement: 'Sécurité', dateDebut: '01/12/2024', dateFin: '31/03/2025', duree: 121, statut: 'Termine', tauxHoraire: 2500, coutTotal: 302500, motif: 'Remplacement', source: 'Site web entreprise', notes: "Saison de fin d'année" },
    { id: 2, numero: 'SAI-002', nom: 'Nganou Carine', prenom: 'Carine', poste: 'Agent Accueil', departement: 'Hébergement', dateDebut: '01/12/2024', dateFin: '28/02/2025', duree: 90, statut: 'Termine', tauxHoraire: 2000, coutTotal: 180000, motif: 'Saisonnalite', source: 'Cooptation', notes: '' },
    { id: 3, numero: 'SAI-003', nom: 'Fomumbod Thierry', prenom: 'Thierry', poste: 'Serveur', departement: 'Restauration', dateDebut: '15/12/2024', dateFin: '15/03/2025', duree: 91, statut: 'Termine', tauxHoraire: 1800, coutTotal: 163800, motif: 'Saisonnalite', source: 'Candidature spontanee', notes: '' },
    { id: 4, numero: 'SAI-004', nom: 'Tchouankou Gloire', prenom: 'Gloire', poste: 'Plongeur', departement: 'Restauration', dateDebut: '01/01/2025', dateFin: '30/04/2025', duree: 120, statut: 'En cours', tauxHoraire: 1500, coutTotal: 180000, motif: 'Surcharge', source: 'Site web entreprise', notes: '' },
    { id: 5, numero: 'SAI-005', nom: 'Moukouri Yvan', prenom: 'Yvan', poste: 'Agent de Blanchisserie', departement: 'Lingerie', dateDebut: '01/01/2025', dateFin: '30/04/2025', duree: 120, statut: 'En cours', tauxHoraire: 1500, coutTotal: 180000, motif: 'Saisonnalite', source: 'Presse', notes: '' },
    { id: 6, numero: 'SAI-006', nom: 'Atangana Bruno', prenom: 'Bruno', poste: 'Jardinier', departement: 'Maintenance', dateDebut: '01/01/2025', dateFin: '31/05/2025', duree: 151, statut: 'En cours', tauxHoraire: 1500, coutTotal: 226500, motif: 'Remplacement', source: 'Cooptation', notes: 'Remplacement congé maternité' },
    { id: 7, numero: 'SAI-007', nom: 'Eyenga Junior', prenom: 'Junior', poste: 'Agent de Sécurité', departement: 'Sécurité', dateDebut: '01/02/2025', dateFin: '31/05/2025', duree: 120, statut: 'En cours', tauxHoraire: 2500, coutTotal: 300000, motif: 'Saisonnalite', source: 'Cabinet de recrutement', notes: '' },
    { id: 8, numero: 'SAI-008', nom: 'Tabi Estelle', prenom: 'Estelle', poste: 'Aide Cuisinière', departement: 'Restauration', dateDebut: '01/03/2025', dateFin: '31/05/2025', duree: 92, statut: 'En cours', tauxHoraire: 1600, coutTotal: 147200, motif: 'Surcharge', source: 'Candidature spontanee', notes: '' },
    { id: 9, numero: 'SAI-009', nom: 'Nkoulou Fabrice', prenom: 'Fabrice', poste: 'Manutentionnaire', departement: 'Logistique & Approvisionnement', dateDebut: '15/02/2025', dateFin: '15/05/2025', duree: 90, statut: 'En cours', tauxHoraire: 1500, coutTotal: 135000, motif: 'Surcharge', source: 'Site web entreprise', notes: '' },
    { id: 10, numero: 'SAI-010', nom: 'Tchouankou Gloire', prenom: 'Gloire', poste: 'Agent de Sécurité', departement: 'Sécurité', dateDebut: '01/01/2025', dateFin: '31/03/2025', duree: 90, statut: 'Termine', tauxHoraire: 2500, coutTotal: 225000, motif: 'Remplacement', source: 'Référence interne', notes: 'Contrat terminé' }
  ];

  /* ================= données ================= */
  function api() { return window.__ADMINA_SAI_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.saisonniers && Array.isArray(d.saisonniers) && d.saisonniers.length) return true;
    return false;
  }
  var DERIVED = ['nomKey', 'retCount', 'retournant', 'conflit', 'conflitAvec', 'debutTs', 'finTs', 'dureeCalc', 'coutTheo', 'derivePctV', 'derive', 'jRest', 'imminent', 'coverToday', 'retActive', 'retLastFin', 'retMois', 'retStale'];
  function rawRows() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.saisonniers || !d.saisonniers.length) d = readLS();
    if (!d || !d.saisonniers || !d.saisonniers.length) d = { saisonniers: DEMO };
    return d.saisonniers;
  }
  function data() {
    var src = rawRows();
    if (!src || !src.length) return [];
    /* retournants : même nom (normalisé) dans ≥ 2 contrats — le fichier des retournants */
    var map = {};
    var rows = src.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = Number(u.id) || 0;
      u.tauxHoraire = Number(u.tauxHoraire) || 0;
      u.coutTotal = Number(u.coutTotal) || 0;
      u.duree = Number(u.duree) || 0;
      u.nomKey = norm(String(u.nom || '').trim() || String(u.prenom || '').trim());
      u.debutTs = tsOf(u.dateDebut);
      u.finTs = tsOf(u.dateFin);
      u.dureeCalc = u.debutTs && u.finTs && u.finTs >= u.debutTs ? diffJours(u.dateDebut, u.dateFin) : u.duree;
      u.coutTheo = u.tauxHoraire * SEUILS.heuresJour * u.dureeCalc;
      u.derivePctV = u.coutTheo > 0 ? Math.round((u.coutTotal - u.coutTheo) / u.coutTheo * 100) : 0;
      u.derive = u.coutTheo > 0 && u.coutTotal > 0 && Math.abs(u.derivePctV) > SEUILS.derivePct;
      u.jRest = u.statut === 'En cours' ? daysUntil(u.dateFin) : null;
      u.imminent = u.statut === 'En cours' && u.jRest !== null && u.jRest <= SEUILS.finImminente;
      u.coverToday = !!(u.debutTs && u.finTs && u.debutTs <= todayTs() && u.finTs >= todayTs());
      if (u.nomKey) { if (!map[u.nomKey]) map[u.nomKey] = { key: u.nomKey, name: u.nom || u.prenom || '', count: 0, active: false, lastFinTs: 0, lastFin: '' }; map[u.nomKey].count++; if (u.statut === 'En cours') map[u.nomKey].active = true; }
      return u;
    });
    /* conflits : contrats d'une même personne dont les périodes se chevauchent */
    var byKey = {};
    rows.forEach(function (r) { if (r.nomKey && r.debutTs && r.finTs) { if (!byKey[r.nomKey]) byKey[r.nomKey] = []; byKey[r.nomKey].push(r); } });
    Object.keys(byKey).forEach(function (k) {
      var g = byKey[k];
      for (var i = 0; i < g.length; i++) for (var j = i + 1; j < g.length; j++) {
        var a = g[i], b = g[j];
        if (b.debutTs <= a.finTs && a.debutTs <= b.finTs) {
          a.conflit = true; b.conflit = true;
          (a.conflitAvec = a.conflitAvec || []).push(b.numero || b.id);
          (b.conflitAvec = b.conflitAvec || []).push(a.numero || a.id);
        }
      }
    });
    rows.forEach(function (r) {
      var mi = map[r.nomKey];
      if (!mi) return;
      r.retCount = mi.count;
      r.retournant = mi.count >= 2;
      r.retActive = mi.active;
      if (!r.conflitAvec) r.conflitAvec = [];
    });
    Object.keys(map).forEach(function (k) {
      var mi = map[k];
      rows.forEach(function (r) {
        if (r.nomKey !== k) return;
        if (r.statut === 'Termine' && r.finTs > mi.lastFinTs) { mi.lastFinTs = r.finTs; mi.lastFin = r.dateFin; }
      });
      mi.mois = mi.lastFinTs ? monthsSince(mi.lastFin) : 0;
      mi.stale = mi.count >= 2 && !mi.active && mi.lastFinTs > 0 && mi.mois > SEUILS.retournantDelai;
      rows.forEach(function (r) { if (r.nomKey === k) { r.retLastFin = mi.lastFin; r.retMois = mi.mois; r.retStale = mi.stale; } });
    });
    return rows;
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) {
      var n = Number(r.id); if (isFinite(n)) m = Math.max(m, n);
      var m2 = /^SAI-(\d+)$/.exec(String(r.numero || r.id || ''));
      if (m2) m = Math.max(m, Number(m2[1]));
      return m;
    }, 0) + 1;
    return { id: mx, numero: 'SAI-' + String(mx).padStart(3, '0') };
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.saisonniers) { toast('Écriture impossible — recharger la page', 'err'); return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct (résilience) — crée le store depuis le snapshot démo au besoin */
    var cur2 = readLS();
    if (!cur2 || !cur2.saisonniers || !cur2.saisonniers.length) {
      cur2 = { saisonniers: rawRows().map(function (r) { var u = {}; for (var k in r) if (DERIVED.indexOf(k) < 0) u[k] = r[k]; return u; }) };
    }
    var nv2 = fn(cur2);
    try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { return false; }
    if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
    refresh();
    return true;
  }

  /* ================= retournants ================= */
  function retournants(rows) {
    rows = rows || data();
    var seen = {};
    var out = [];
    rows.forEach(function (r) {
      if (!r.nomKey || seen[r.nomKey]) return;
      seen[r.nomKey] = 1;
      if (r.retournant) out.push({ key: r.nomKey, name: r.nom || r.prenom || '', count: r.retCount, active: r.retActive, lastFin: r.retLastFin || '', mois: r.retMois || 0, stale: r.retStale });
    });
    out.sort(function (a, b) { return b.count - a.count || (b.lastFin || '').localeCompare(a.lastFin || ''); });
    return out;
  }

  /* ================= frise / couverture ================= */
  function curY() { return new Date().getFullYear(); }
  function curMonth() { return new Date().getMonth(); }
  function navYear() {
    if (UI.annee) return UI.annee;
    var rows = data();
    var cnt = {};
    rows.forEach(function (r) {
      if (!r.debutTs || !r.finTs) return;
      var a = new Date(r.debutTs).getUTCFullYear(), b = new Date(r.finTs).getUTCFullYear();
      for (var y = a; y <= b; y++) cnt[y] = (cnt[y] || 0) + 1;
    });
    var best = curY(), bestN = -1;
    Object.keys(cnt).forEach(function (y) {
      var yi = Number(y);
      if (cnt[y] > bestN || (cnt[y] === bestN && yi > best)) { best = yi; bestN = cnt[y]; }
    });
    return best;
  }
  function yearBounds() {
    var rows = data();
    var mn = curY(), mx = curY();
    rows.forEach(function (r) {
      if (r.debutTs) mn = Math.min(mn, new Date(r.debutTs).getUTCFullYear());
      if (r.finTs) mx = Math.max(mx, new Date(r.finTs).getUTCFullYear());
    });
    return { min: mn - 1, max: mx + 1 };
  }
  function monthLayout(year) {
    var jan = Date.UTC(year, 0, 1);
    var ms = Date.UTC(year + 1, 0, 1) - jan;
    var cells = [], acc = 0;
    for (var m = 0; m < 12; m++) {
      var w = (Date.UTC(year, m + 1, 1) - Date.UTC(year, m, 1)) / ms * 100;
      cells.push({ m: m, left: acc, w: w });
      acc += w;
    }
    return { jan: jan, ms: ms, cells: cells, year: year };
  }
  function barGeom(r, lay) {
    var startTs = Math.max(r.debutTs, lay.jan);
    var endTs = Math.min(r.finTs, lay.jan + lay.ms - 86400000);
    if (r.finTs < lay.jan || r.debutTs >= lay.jan + lay.ms) return null;
    var left = (startTs - lay.jan) / lay.ms * 100;
    var w = (endTs + 86400000 - startTs) / lay.ms * 100;
    return { left: left, w: Math.max(1.2, w) };
  }
  function depfriseRows() {
    var rows = data().filter(function (r) { return r.debutTs && r.finTs && r.statut !== 'Abandonne'; });
    if (UI.depfrise) rows = rows.filter(function (r) { return norm(r.departement) === norm(UI.depfrise); });
    return rows;
  }
  function couverture() {
    var year = navYear();
    var lay = monthLayout(year);
    var rows = depfriseRows();
    var cells = lay.cells.map(function (c) {
      var mStart = Date.UTC(year, c.m, 1);
      var mEnd = Date.UTC(year, c.m + 1, 0);
      var covered = rows.some(function (r) { return r.debutTs <= mEnd && r.finTs >= mStart; });
      var future = year > curY() || (year === curY() && c.m >= curMonth());
      return { m: c.m, lab: MOIS12[c.m], covered: covered, gap: !covered, future: future, left: c.left, w: c.w };
    });
    var gaps = cells.filter(function (c) { return c.gap; }).map(function (c) { return c.lab.toLowerCase(); });
    var futGaps = cells.filter(function (c) { return c.gap && c.future; }).map(function (c) { return c.lab.toLowerCase(); });
    return { year: year, dep: UI.depfrise || '', cells: cells, gaps: gaps, futureGaps: futGaps };
  }
  function worstDepGaps(year) {
    var deps = {};
    data().forEach(function (r) { if (r.departement) deps[r.departement] = 1; });
    var out = [];
    Object.keys(deps).sort().forEach(function (d) {
      var rows = data().filter(function (r) { return r.debutTs && r.finTs && r.statut !== 'Abandonne' && norm(r.departement) === norm(d); });
      var gaps = [];
      for (var m = 0; m < 12; m++) {
        var mStart = Date.UTC(year, m, 1), mEnd = Date.UTC(year, m + 1, 0);
        var future = year > curY() || (year === curY() && m >= curMonth());
        if (!future) continue;
        if (!rows.some(function (r) { return r.debutTs <= mEnd && r.finTs >= mStart; })) gaps.push(MOIS12[m].toLowerCase());
      }
      if (gaps.length) out.push({ dep: d, gaps: gaps });
    });
    out.sort(function (a, b) { return b.gaps.length - a.gaps.length; });
    return out;
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var fin = rows.filter(function (r) { return r.imminent; });
    if (fin.length) out.push({ tone: 'warn', txt: fin.length + ' contrat' + (fin.length > 1 ? 's' : '') + ' encore « En cours » finissant à ' + SEUILS.finImminente + ' j ou moins (ou déjà échus) sans renouvellement décidé : ' + fin.slice(0, 2).map(function (r) { return r.numero + ' (' + jDelay(r.dateFin) + ')'; }).join(', ') + '…', f: 'fin' });
    var stales = retournants(rows).filter(function (m) { return m.stale; });
    if (stales.length) out.push({ tone: 'info', txt: stales.length + ' retournant' + (stales.length > 1 ? 's' : '') + ' à recontacter en priorité : ' + SEUILS.retournantDelai + ' mois ou plus depuis le dernier contrat terminé (' + stales.slice(0, 2).map(function (m) { return m.name + ' · ' + m.mois + ' mois'; }).join(', ') + ')…', f: 'retstale' });
    var total = rows.reduce(function (s, r) { return s + r.coutTotal; }, 0);
    if (total > SEUILS.coutMax) out.push({ tone: 'err', txt: 'Coût total du portefeuille ' + fcfa(total) + ' > seuil ' + fcfa(SEUILS.coutMax) + ' — vérifier les contrats les plus coûteux (réglage : Seuils S).', f: 'cout' });
    var der = rows.filter(function (r) { return r.derive; });
    if (der.length) out.push({ tone: 'warn', txt: 'Dérive de coût : ' + der.length + ' contrat' + (der.length > 1 ? 's' : '') + ' dont le coût déclaré s\u2019écarte de plus de ' + SEUILS.derivePct + ' % du calcul taux × ' + SEUILS.heuresJour + ' h/j × durée — vérifier la saisie : ' + der.slice(0, 2).map(function (r) { return r.numero + ' (' + (r.derivePctV > 0 ? '+' : '') + r.derivePctV + ' %)'; }).join(', ') + '…', f: 'derive' });
    var cov = worstDepGaps(navYear());
    if (cov.length) out.push({ tone: 'warn', txt: cov.length + ' département' + (cov.length > 1 ? 's' : '') + ' actif' + (cov.length > 1 ? 's' : '') + ' avec des mois à venir sans couverture (' + navYear() + ') : ' + cov[0].dep + ' — ' + cov[0].gaps.length + ' mois vides (' + cov[0].gaps.slice(0, 3).join(', ') + (cov[0].gaps.length > 3 ? '…' : '') + ')', f: 'couv' });
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var retStaleKeys = {};
    if (UI.dim === 'retstale') retournants(rows).forEach(function (m) { if (m.stale) retStaleKeys[m.key] = 1; });
    var avgCout = rows.length ? rows.reduce(function (s, r) { return s + r.coutTotal; }, 0) / rows.length : 0;
    var avgDur = rows.length ? rows.reduce(function (s, r) { return s + r.dureeCalc; }, 0) / rows.length : 0;
    var avgTaux = rows.length ? rows.reduce(function (s, r) { return s + r.tauxHoraire; }, 0) / rows.length : 0;
    var out = rows.filter(function (r) {
      if (UI.statut && r.statut !== UI.statut) return false;
      if (UI.dep && norm(r.departement) !== norm(UI.dep)) return false;
      if (UI.motif && r.motif !== UI.motif) return false;
      if (UI.periode === 'cover' && !r.coverToday) return false;
      if (UI.periode === 'avenir' && !(r.debutTs > todayTs())) return false;
      if (UI.periode === 'passe' && !(!r.coverToday && r.finTs && r.finTs < todayTs())) return false;
      if (UI.periode === 'imminent' && !r.imminent) return false;
      if (UI.periode === 'chev' && !r.conflit) return false;
      if (UI.periode === 'sansdates' && (r.debutTs && r.finTs)) return false;
      if (UI.kpi === 'cours' && r.statut !== 'En cours') return false;
      if (UI.kpi === 'cout' && !(r.coutTotal > avgCout)) return false;
      if (UI.kpi === 'duree' && !(r.dureeCalc > avgDur && r.dureeCalc > 0)) return false;
      if (UI.kpi === 'taux' && !(r.tauxHoraire > avgTaux && r.tauxHoraire > 0)) return false;
      if (UI.kpi === 'retour' && !r.retournant) return false;
      if (UI.dim === 'retstale' && !retStaleKeys[r.nomKey]) return false;
      if (UI.dim === 'derive' && !r.derive) return false;
      if (UI.mois && UI.mois.indexOf('m:') === 0 && monthKey(r.dateDebut) !== UI.mois.slice(2)) return false;
      if (q && !(norm(r.nom).indexOf(q) > -1 || norm(r.prenom).indexOf(q) > -1 || norm(r.numero).indexOf(q) > -1 || norm(r.poste).indexOf(q) > -1 || norm(r.departement).indexOf(q) > -1 || norm(r.motif).indexOf(q) > -1 || norm(r.source).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'nom') { va = norm(a.nom + ' ' + a.prenom); vb = norm(b.nom + ' ' + b.prenom); }
      else if (k === 'debut' || k === 'couv') { va = a.debutTs || 99999999; vb = b.debutTs || 99999999; }
      else if (k === 'fin') { va = a.finTs || 99999999; vb = b.finTs || 99999999; }
      else if (k === 'duree') { va = a.dureeCalc; vb = b.dureeCalc; }
      else if (k === 'taux') { va = a.tauxHoraire; vb = b.tauxHoraire; }
      else if (k === 'cout') { va = a.coutTotal; vb = b.coutTotal; }
      else if (k === 'statut') { va = statutIdx(a.statut); vb = statutIdx(b.statut); }
      else if (k === 'motif') { va = norm(motifLab(a.motif)); vb = norm(motifLab(b.motif)); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.dep ? 1 : 0) + (UI.motif ? 1 : 0) + (UI.periode ? 1 : 0) + (UI.kpi ? 1 : 0) + (UI.dim ? 1 : 0) + (UI.mois ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.motif = ''; UI.periode = ''; UI.kpi = ''; UI.dim = ''; UI.mois = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/^Saisonniers/i.test((hs[i].textContent || '').trim())) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-asa="root"]');
    if (!root) {
      root = h('section', { 'data-asa': 'root', class: 'asa-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-asa-page')) {
      page.setAttribute('data-asa-page', '1');
      page.setAttribute('data-asa-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-asa-hide')) {
      natif.setAttribute('data-asa-hide', '1');
      natif.setAttribute('data-asa-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-asa="root"]'); if (root) root.remove();
    $$('[data-asa-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-asa-oldw') || '';
      n.removeAttribute('data-asa-page');
      n.removeAttribute('data-asa-oldw');
    });
    $$('[data-asa-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-asa-olddisp') || '';
      n.removeAttribute('data-asa-hide');
      n.removeAttribute('data-asa-olddisp');
    });
    $$('[data-asa]').forEach(function (n) { n.remove(); });
  }
  function showNative() {
    var root = $('[data-asa="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'asa-btn asa-btn-primary asa-backbtn', 'data-asa': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'saisonniers-temporaires');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    frise: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M6 14h6M10 18h7"/></svg>',
    couv: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12M15 9v12"/></svg>',
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
  var HERO_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><circle cx="12" cy="15.5" r="2.4"/><path d="M12 11.6v1.5M12 18v.1M8.6 15.5h.9M14.5 15.5h.9"/></svg>';

  function buildShell() {
    var root = $('[data-asa="root"]');
    if (!root || $('[data-asa="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="asa-hero" data-asa="hero">' +
        '<div class="asa-hero-main">' +
          '<div class="asa-hero-title">' +
            '<span class="asa-hero-ico" aria-hidden="true">' + HERO_ICON + '</span>' +
            '<div><h2 class="asa-h2">Centre de pilotage — Saisonniers &amp; Temporaires</h2>' +
            '<p class="asa-hero-sub" data-asa="herosub"></p>' +
            '<p class="asa-hero-sub2" data-asa="herosub2"></p></div>' +
          '</div>' +
          '<div class="asa-hero-actions">' +
            '<button class="asa-btn" data-asa="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="asa-btn" data-asa="btn-couv" title="Couverture &amp; retournants (K)">' + ICO.couv + 'Couverture</button>' +
            '<button class="asa-btn" data-asa="btn-seuils" title="Seuils de pilotage (S)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="asa-btn" data-asa="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="asa-btn" data-asa="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="asa-btn asa-btn-primary" data-asa="btn-new" title="Nouveau contrat (N)">' + ICO.plus + 'Nouveau contrat</button>' +
          '</div>' +
        '</div>' +
        '<div class="asa-hero-alerts" data-asa="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="asa-kpis" data-asa="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="asa-charts" data-asa="charts">' +
        '<div class="asa-chart-card"><div class="asa-chart-title">Statuts des contrats</div><div class="asa-donut-wrap" data-asa="donut"></div></div>' +
        '<div class="asa-chart-card"><div class="asa-chart-title">Coût total par département</div><div class="asa-bars" data-asa="bars"></div></div>' +
        '<div class="asa-chart-card"><div class="asa-chart-title">Contrats par mois de démarrage</div><div class="asa-bars" data-asa="mois"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="asa-toolbar" data-asa="toolbar">' +
        '<div class="asa-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (nom, prénom, poste, motif, source…)" data-asa="search" aria-label="Rechercher un saisonnier" /></div>' +
        '<select data-asa="f-statut" class="asa-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-asa="f-dep" class="asa-sel" aria-label="Filtrer par département"></select>' +
        '<select data-asa="f-motif" class="asa-sel" aria-label="Filtrer par motif"></select>' +
        '<select data-asa="f-periode" class="asa-sel" aria-label="Filtrer par période"></select>' +
        '<button class="asa-chipbtn" data-asa="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="asa-count" data-asa="count"></span>' +
        '<div class="asa-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="asa-vbtn" data-asa="v-saison" title="Vue saisonnalité (P)">' + ICO.frise + 'Saisonnalité</button>' +
          '<button class="asa-vbtn" data-asa="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="asa-vbtn" data-asa="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-asa="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-asa="selbar"></div>' +

      /* PIED */
      '<div class="asa-foot">Le fichier des retournants — la fidélisation prime sur le remplacement · source de vérité locale (navigateur) · journal d\u2019audit actif · seuils configurables · <button class="asa-link" data-asa="btn-native">Afficher le tableau natif</button></div>';

    $('[data-asa="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-asa="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-asa="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'saisonniers-temporaires'); window.print(); });
    $('[data-asa="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-asa="btn-couv"]', root).addEventListener('click', openCouverture);
    $('[data-asa="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-asa="btn-native"]', root).addEventListener('click', showNative);
    $('[data-asa="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-asa="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-asa="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-asa="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-asa="f-dep"]', root).addEventListener('change', function (e) { UI.dep = e.target.value; UI.page = 0; refresh(); });
    $('[data-asa="f-motif"]', root).addEventListener('change', function (e) { UI.motif = e.target.value; UI.page = 0; refresh(); });
    $('[data-asa="f-periode"]', root).addEventListener('change', function (e) { UI.periode = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-asa="v-saison"]', root).addEventListener('click', function () { setView('saison'); });
    $('[data-asa="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-asa="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
  }

  function setView(v) { UI.view = v; refresh(); }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var nbCours = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var total = rows.reduce(function (s, r) { return s + r.coutTotal; }, 0);
    var rets = retournants(rows);
    var moy = rows.length ? Math.round(rows.reduce(function (s, r) { return s + r.dureeCalc; }, 0) / rows.length) : 0;
    var tauxMoy = rows.length ? Math.round(rows.reduce(function (s, r) { return s + r.tauxHoraire; }, 0) / rows.length) : 0;
    $('[data-asa="herosub"]').textContent =
      rows.length + ' saisonnier' + (rows.length > 1 ? 's' : '') +
      ' · ' + nbCours + ' en cours' +
      ' · coût total ' + fcfa(total) +
      ' · ' + rets.length + ' retournant' + (rets.length > 1 ? 's' : '');
    $('[data-asa="herosub2"]').textContent =
      'Durée moyenne : ' + moy + ' j · taux horaire moyen ' + nb(tauxMoy) + ' FCFA/h — le fichier des retournants : la fidélisation prime sur le remplacement.';
    var zone = $('[data-asa="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="asa-alert ' + a.tone + '" data-asa="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.asa-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'fin') UI.periode = 'imminent';
        else if (f === 'retstale') UI.dim = 'retstale';
        else if (f === 'cout') { UI.kpi = 'cout'; toast('Contrats au-dessus de la moyenne du portefeuille — ajustez le seuil dans Seuils (S)', ''); }
        else if (f === 'derive') UI.dim = 'derive';
        else if (f === 'couv') {
          var cov = worstDepGaps(navYear());
          UI.view = 'saison';
          if (cov.length) UI.depfrise = cov[0].dep;
          refresh();
          var fc = $('[data-asa="frisecard"]');
          if (fc) { try { fc.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e1) {} }
          return;
        }
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nbAll = rows.length;
    var nbCours = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var nbFin = rows.filter(function (r) { return r.imminent; }).length;
    var total = rows.reduce(function (s, r) { return s + r.coutTotal; }, 0);
    var avgCout = nbAll ? total / nbAll : 0;
    var moy = nbAll ? Math.round(rows.reduce(function (s, r) { return s + r.dureeCalc; }, 0) / nbAll) : 0;
    var nbLong = rows.filter(function (r) { return r.dureeCalc > moy && r.dureeCalc > 0; }).length;
    var avgTaux = nbAll ? rows.reduce(function (s, r) { return s + r.tauxHoraire; }, 0) / nbAll : 0;
    var nbTaux = rows.filter(function (r) { return r.tauxHoraire > avgTaux && r.tauxHoraire > 0; }).length;
    var rets = retournants(rows);
    var nbStale = rets.filter(function (m) { return m.stale; }).length;
    var deps = {}, mots = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; if (r.motif) mots[r.motif] = 1; });
    var kpis = [
      { k: '', t: 'SAISONNIERS', v: String(nbAll), s: Object.keys(deps).length + ' départements · ' + Object.keys(mots).length + ' motifs', cls: '' },
      { k: 'cours', t: 'EN COURS', v: String(nbCours), s: 'dont ' + nbFin + ' finissant ≤ ' + SEUILS.finImminente + ' j', cls: nbFin > 0 ? 'gold' : '' },
      { k: 'cout', t: 'COÛT TOTAL', v: fcfa(total), s: 'moyenne ' + fcfa(Math.round(avgCout)) + ' / contrat', cls: total > SEUILS.coutMax ? 'gold' : '' },
      { k: 'duree', t: 'DURÉE MOYENNE', v: moy + ' j', s: 'au-dessus : ' + nbLong + ' contrat' + (nbLong > 1 ? 's' : ''), cls: '' },
      { k: 'taux', t: 'TAUX HORAIRE MOY.', v: nb(Math.round(avgTaux)) + ' FCFA/h', s: 'au-dessus : ' + nbTaux + ' contrat' + (nbTaux > 1 ? 's' : ''), cls: '' },
      { k: 'retour', t: 'RETOURNANTS', v: String(rets.length), s: 'à recontacter : ' + nbStale, cls: nbStale > 0 ? 'gold' : '' }
    ];
    var zone = $('[data-asa="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="asa-kpi' + (k.cls === 'gold' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="asa-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="asa-kpi-v' + (k.cls === 'gold' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="asa-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.asa-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.motif = ''; UI.periode = ''; UI.dim = ''; UI.mois = ''; }
        UI.page = 0;
        refresh();
      });
    });
  }

  function donutSvg(parts, total, label) {
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Statuts des contrats">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">' + esc(label) + '</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-asa="donut"]');
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length, 'contrats') +
      '<div class="asa-donut-legend">' + parts.map(function (p) {
        return '<span class="asa-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="asa-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="asa-dl-val">' + p.v + ' · ' + pctv(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.asa-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.statut = UI.statut === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items, fmt) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (!items.length || mx <= 0) return '<div class="asa-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="asa-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="asa-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="asa-bar-track"><span class="asa-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="asa-bar-val">' + (fmt ? fmt(it.v) : it.v) + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-asa="bars"]');
    var map = {};
    rows.forEach(function (r) { var p = r.departement || '—'; if (!map[p]) map[p] = { key: p, name: p, v: 0 }; map[p].v += r.coutTotal; });
    var items = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items, function (v) { return fcfa(v); });
    $$('.asa-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.dep = UI.dep === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    var z2 = $('[data-asa="mois"]');
    var map2 = {};
    rows.forEach(function (r) {
      var mk = monthKey(r.dateDebut);
      if (!mk) return;
      if (!map2[mk]) map2[mk] = { key: mk, v: 0 };
      map2[mk].v++;
    });
    var items2 = Object.keys(map2).sort().map(function (k) {
      var p = k.split('-');
      return { key: k, name: MOIS12[Number(p[1]) - 1] + ' ' + p[0].slice(2), v: map2[k].v };
    });
    z2.innerHTML = barRowsHtml(items2);
    $$('.asa-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.mois = UI.mois === 'm:' + k ? '' : 'm:' + k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var deps = {}, mots = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; if (r.motif) mots[r.motif] = 1; });
    var sel = $('[data-asa="f-statut"]');
    sel.innerHTML = '<option value="">Statut : tous</option>' + STATUTS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-asa="f-dep"]');
    sel2.innerHTML = '<option value="">Département : tous</option>' + Object.keys(deps).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.dep === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-asa="f-motif"]');
    sel3.innerHTML = '<option value="">Motif : tous</option>' + Object.keys(mots).sort(function (a, b) { return motifLab(a).localeCompare(motifLab(b)); }).map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.motif === s ? ' selected' : '') + '>' + esc(motifLab(s)) + '</option>';
    }).join('');
    var sel4 = $('[data-asa="f-periode"]');
    sel4.innerHTML = '<option value="">Période : toutes</option>' +
      '<option value="cover"' + (UI.periode === 'cover' ? ' selected' : '') + '>Couvre aujourd\u2019hui</option>' +
      '<option value="avenir"' + (UI.periode === 'avenir' ? ' selected' : '') + '>À venir (début futur)</option>' +
      '<option value="passe"' + (UI.periode === 'passe' ? ' selected' : '') + '>Déjà terminés</option>' +
      '<option value="imminent"' + (UI.periode === 'imminent' ? ' selected' : '') + '>Fin imminente ≤ ' + SEUILS.finImminente + ' j (ou échue)</option>' +
      '<option value="chev"' + (UI.periode === 'chev' ? ' selected' : '') + '>En chevauchement (conflit)</option>' +
      '<option value="sansdates"' + (UI.periode === 'sansdates' ? ' selected' : '') + '>Dates à compléter</option>';
    $('[data-asa="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-asa="count"]');
    var extra = UI.dim === 'retstale' ? ' · retournants à recontacter' : UI.dim === 'derive' ? ' · dérive de coût' : (UI.mois ? ' · démarrés ' + UI.mois.slice(2) : '');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' contrats' + extra;
  }

  /* ================= chips / cellules ================= */
  function statutChip(r) {
    var sm = statutMeta(r.statut);
    return '<span class="asa-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function retBadge(r) {
    if (!r.retournant) return '';
    return '<span class="asa-retb" title="Retournant : ' + r.retCount + ' contrats dans le fichier — la fidélisation prime sur le remplacement">↻ ' + r.retCount + '</span>';
  }
  function conflitDot(r) {
    if (!r.conflit) return '';
    return '<span class="asa-confl" title="Conflit : périodes qui se chevauchent avec ' + esc((r.conflitAvec || []).join(', ')) + '">⚠</span>';
  }
  function deriveChip(r) {
    if (!r.derive) return '';
    return '<span class="asa-chip err" title="Coût déclaré ' + esc(fcfa(r.coutTotal)) + ' vs calculé ' + esc(fcfa(r.coutTheo)) + ' (taux × ' + SEUILS.heuresJour + ' h × durée)">dérive ' + (r.derivePctV > 0 ? '+' : '') + r.derivePctV + ' %</span>';
  }
  function miniCouv(r) {
    if (!r.debutTs || !r.finTs) return '<span class="asa-chip warn" title="Dates à compléter">à compléter</span>';
    var lay = monthLayout(new Date(r.debutTs).getUTCFullYear());
    var g = barGeom(r, lay);
    var jrest = '';
    if (r.statut === 'En cours' && r.jRest !== null) {
      var cls = r.jRest < 0 ? 'err' : (r.jRest <= SEUILS.finImminente ? 'warn' : 'info');
      jrest = '<span class="asa-chip ' + cls + '" title="' + (r.jRest < 0 ? 'Fin dépassée — statut à mettre à jour' : 'J-restants avant la fin du contrat') + '">' + esc(jDelay(r.dateFin)) + '</span>';
    }
    var bar = g ? '<span class="asa-mini-track"><span class="asa-mini-bar ' + (r.statut === 'Termine' ? 'done' : r.statut === 'Abandonne' ? 'aband' : 'cours') + '" style="left:' + g.left + '%;width:' + g.w + '%"></span></span>' : '';
    return '<span class="asa-miniwrap">' + bar + jrest + '</span>';
  }

  /* ================= VUE SAISONNALITÉ (signature) =================
     Frise 12 mois : une ligne par saisonnier, barre de couverture
     positionnée sur l'axe des mois, badge retournant, pastille de
     conflit, mois sans couverture surlignés pour le département
     choisi, navigation ‹ année › (année = contrats majoritaires). */
  function renderFrise() {
    var year = navYear();
    var lay = monthLayout(year);
    var cov = couverture();
    var rowsAll = filtered();
    var rows = rowsAll.filter(function (r) { return r.debutTs && r.finTs && r.finTs >= lay.jan && r.debutTs < lay.jan + lay.ms; });
    var hors = rowsAll.length - rows.length;
    var deps = {};
    data().forEach(function (r) { if (r.departement) deps[r.departement] = 1; });
    var monthsHead = '<div class="asa-fmonths">' + cov.cells.map(function (c) {
      return '<span class="asa-fm' + (c.gap ? ' gap' : '') + '" style="left:' + c.left + '%;width:' + c.w + '%">' + c.lab + '</span>';
    }).join('') + '</div>';
    var body = rows.map(function (r) {
      var g = barGeom(r, lay);
      var sm = statutMeta(r.statut);
      return '<div class="asa-friserow' + (r.conflit ? ' confl' : '') + '" data-id="' + esc(r.id) + '">' +
        '<div class="asa-fr-id">' +
          '<span class="asa-fr-name" data-open="' + esc(r.id) + '">' + esc(r.nom || r.prenom || '—') + (r.prenom && norm(r.nom || '').indexOf(norm(r.prenom)) < 0 ? ' ' + esc(r.prenom) : '') + '</span>' +
          '<span class="asa-num">' + esc(r.numero || r.id) + ' · ' + esc(r.poste || '—') + '</span>' +
          '<span class="asa-num">' + esc(r.departement || '—') + ' · ' + esc(r.dateDebut || '—') + ' → ' + esc(r.dateFin || '—') + '</span>' +
          '<span class="asa-fr-badges">' + retBadge(r) + conflitDot(r) + (r.imminent ? '<span class="asa-chip warn" title="Fin imminente sans renouvellement décidé">fin ' + esc(jDelay(r.dateFin)) + '</span>' : '') + '</span>' +
        '</div>' +
        '<div class="asa-ftrack">' +
          cov.cells.map(function (c) { return '<i class="asa-fcell' + (c.gap ? ' gap' : '') + '" style="left:' + c.left + '%;width:' + c.w + '%"></i>'; }).join('') +
          (g ? '<button class="asa-fbar ' + (r.statut === 'Termine' ? 'done' : r.statut === 'Abandonne' ? 'aband' : 'cours') + '" style="left:' + g.left + '%;width:' + g.w + '%;border-color:' + sm.c + '" data-open="' + esc(r.id) + '" title="' + esc((r.numero || '') + ' · ' + (r.dateDebut || '') + ' → ' + (r.dateFin || '') + ' · ' + r.dureeCalc + ' j · ' + statutMeta(r.statut).lab) + '">' +
            (g.w > 9 ? '<span>' + esc(r.numero || '') + '</span>' : '') + '</button>' : '<span class="asa-fnone">hors année ' + year + '</span>') +
        '</div></div>';
    }).join('');
    var gapNote = '';
    var gapLabs = cov.gaps;
    if (gapLabs.length) gapNote = 'Mois sans couverture (' + esc(cov.dep || 'tous départements') + ', ' + year + ') : ' + esc(gapLabs.join(', ')) + (cov.futureGaps.length ? ' — dont ' + cov.futureGaps.length + ' mois à venir ⚠' : '');
    else gapNote = 'Couverture complète sur les 12 mois (' + esc(cov.dep || 'tous départements') + ', ' + year + ').';
    var card = $('[data-asa="content"]');
    card.innerHTML = '<div class="asa-frisecard" data-asa="frisecard">' +
      '<div class="asa-frise-head">' +
        '<div class="asa-frise-title">Frise de couverture — SAISONNALITÉ <b>' + year + '</b>' +
          '<span class="asa-frise-sub">ann\u00e9e de r\u00e9f\u00e9rence = contrats majoritaires · cliquez une barre pour ouvrir la fiche</span></div>' +
        '<div class="asa-frise-ctrl">' +
          '<select class="asa-sel" data-asa="frise-dep" aria-label="Département analysé pour les mois sans couverture">' +
            '<option value="">Tous les départements</option>' +
            Object.keys(deps).sort().map(function (d) { return '<option value="' + esc(d) + '"' + (UI.depfrise === d ? ' selected' : '') + '>' + esc(d) + '</option>'; }).join('') +
          '</select>' +
          '<div class="asa-annee" role="group" aria-label="Naviguer entre les années">' +
            '<button class="asa-pgbtn" data-asa="an-prev" title="Année précédente">‹</button>' +
            '<span class="asa-annee-l">' + year + '</span>' +
            '<button class="asa-pgbtn" data-asa="an-next" title="Année suivante">›</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="asa-frise-legend">' +
        '<span><i class="asa-leg cours"></i>en cours</span>' +
        '<span><i class="asa-leg done"></i>terminé</span>' +
        '<span><i class="asa-leg aband"></i>abandonné</span>' +
        '<span><i class="asa-leg gap"></i>mois sans couverture</span>' +
        '<span>↻ retournant (≥ 2 contrats)</span>' +
        '<span>⚠ chevauchement de contrats</span>' +
      '</div>' +
      '<div class="asa-frise-scroll"><div class="asa-frise">' + monthsHead +
        (body || '<div class="asa-empty">Aucun contrat ne correspond aux filtres sur l\u2019année ' + year + (hors > 0 ? ' — ' + hors + ' contrat(s) hors année masqué(s)' : '') + '</div>') +
      '</div></div>' +
      '<div class="asa-frise-note' + (gapLabs.length ? ' hasgap' : '') + '">' + gapNote + (hors > 0 && rows.length ? ' · ' + hors + ' contrat(s) hors année ' + year + ' masqué(s).' : '') + '</div>' +
      '</div>';
    var fd = $('[data-asa="frise-dep"]', card);
    if (fd) fd.addEventListener('change', function (e) { UI.depfrise = e.target.value; refresh(); });
    var pv = $('[data-asa="an-prev"]', card), nx = $('[data-asa="an-next"]', card);
    var bounds = yearBounds();
    if (pv) pv.addEventListener('click', function () { UI.annee = Math.max(bounds.min, year - 1); refresh(); });
    if (nx) nx.addEventListener('click', function () { UI.annee = Math.min(bounds.max, year + 1); refresh(); });
    bindRowActions(card);
  }

  /* ================= table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var total = all.reduce(function (s, r) { return s + r.coutTotal; }, 0);
    var nbCours = all.filter(function (r) { return r.statut === 'En cours'; }).length;
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = 'none';
      if (key) aria = key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none';
      return '<th ' + (key ? 'data-sort="' + key + '" aria-sort="' + aria + '"' : '') + ' class="' + (cls || '') + '" scope="col">' + label +
        (key && key === sortKey ? '<span class="asa-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'asa-th-chk') + th('N°', 'numero') + th('Nom', 'nom') + th('Poste', 'poste') + th('Département', 'departement') +
      th('Début', 'debut') + th('Fin', 'fin') + th('Couverture', 'couv') + th('Durée', 'duree') +
      th('Taux horaire', 'taux') + th('Coût total', 'cout') + th('Motif', 'motif') + th('Statut', 'statut') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="asa-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.nom || r.prenom || r.numero) + '"></td>' +
        '<td class="asa-num">' + esc(r.numero || r.id) + '</td>' +
        '<td><span class="asa-cand" data-open="' + esc(r.id) + '">' + esc(r.nom || '—') + '</span>' +
          (r.prenom && norm(r.nom || '').indexOf(norm(r.prenom)) < 0 ? ' <span class="asa-num">' + esc(r.prenom) + '</span>' : '') +
          (retBadge(r) || '') + (conflitDot(r) || '') + '</td>' +
        '<td style="font-weight:600">' + esc(r.poste || '—') + '</td>' +
        '<td>' + (r.departement ? '<span class="asa-chip neutral">' + esc(r.departement) + '</span>' : '—') + '</td>' +
        '<td class="asa-nowrap">' + (r.dateDebut ? esc(r.dateDebut) + ' <span class="asa-num">(' + esc(jDelay(r.dateDebut)) + ')</span>' : '<span class="asa-chip warn">à compléter</span>') + '</td>' +
        '<td class="asa-nowrap">' + (r.dateFin ? esc(r.dateFin) + ' <span class="asa-num">(' + esc(jDelay(r.dateFin)) + ')</span>' : '<span class="asa-chip warn">à compléter</span>') + '</td>' +
        '<td>' + miniCouv(r) + '</td>' +
        '<td class="asa-num">' + (r.dureeCalc ? r.dureeCalc + ' j' : '—') + '</td>' +
        '<td class="asa-num">' + (r.tauxHoraire ? nb(r.tauxHoraire) + ' FCFA/h' : '—') + '</td>' +
        '<td class="asa-nowrap">' + (r.coutTotal ? '<b>' + esc(fcfa(r.coutTotal)) + '</b>' : '—') + ' ' + deriveChip(r) + '</td>' +
        '<td><span class="asa-chip neutral" title="' + esc(r.source || '') + '">' + esc(motifLab(r.motif)) + '</span></td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td><div class="asa-actions">' +
          '<button class="asa-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="asa-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="asa-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (dates à remplir)">' + ICO.dup + '</button>' +
          '<button class="asa-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="asa-tfoot"><td></td><td colspan="13">TOTAL ' + all.length + ' contrats · ' + nbCours + ' en cours · coût total ' + fcfa(total) + '</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="asa-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="asa-sel" data-asa="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="asa-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="asa-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-asa="content"]');
    card.innerHTML = '<div class="asa-tblcard"><div class="asa-tblwrap"><table class="asa-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="14"><div class="asa-empty">Aucun contrat ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'nom' || k === 'numero' || k === 'poste' || k === 'departement' || k === 'motif' ? 1 : -1; }
        refresh();
      });
    });
    bindRowActions(card);
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-asa="per"]', card);
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
      });
    });
    $$('[data-open]', scope).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open'), null); }); });
    $$('[data-edit]', scope).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit'), null); }); });
    $$('[data-dup]', scope).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', scope).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-asa="content"]');
    card.innerHTML = rows.length ? '<div class="asa-cards">' + rows.map(function (r) {
      return '<div class="asa-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="asa-card-top"><div><input type="checkbox" class="asa-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="asa-num">' + esc(r.numero || r.id) + '</span>' + retBadge(r) + conflitDot(r) + '</div>' +
        statutChip(r) + '</div>' +
        '<div class="asa-card-name" data-open="' + esc(r.id) + '">' + esc(r.nom || '—') + (r.prenom && norm(r.nom || '').indexOf(norm(r.prenom)) < 0 ? ' ' + esc(r.prenom) : '') + '</div>' +
        '<div class="asa-card-poste">' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div>' +
        '<div class="asa-card-couv">' + miniCouv(r) + '</div>' +
        '<div class="asa-card-meta">' +
          '<span class="asa-chip info">' + esc(r.dateDebut || '—') + ' → ' + esc(r.dateFin || '—') + '</span>' +
          '<span class="asa-chip neutral">' + (r.dureeCalc ? r.dureeCalc + ' j' : 'durée —') + '</span>' +
          '<span class="asa-chip neutral">' + esc(motifLab(r.motif)) + '</span>' +
          deriveChip(r) +
        '</div>' +
        '<div class="asa-card-cost"><span class="asa-num">Taux ' + (r.tauxHoraire ? nb(r.tauxHoraire) + ' FCFA/h' : '—') + '</span>' +
          '<b>' + esc(fcfa(r.coutTotal)) + '</b></div>' +
        '<div class="asa-card-foot">' +
          (r.imminent ? '<span class="asa-chip warn">fin ' + esc(jDelay(r.dateFin)) + '</span>' : '<span class="asa-num">' + esc(r.source || '') + '</span>') +
          '<div class="asa-card-act">' +
            '<button class="asa-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
            '<button class="asa-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
            '<button class="asa-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (dates à remplir)">' + ICO.dup + '</button>' +
            '<button class="asa-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
          '</div></div></div>';
    }).join('') + '</div>' : '<div class="asa-empty">Aucun contrat ne correspond aux filtres</div>';
    bindRowActions(card);
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-asa="selbar"]');
    if (!zone) return;
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    var rows = UI.sel.map(function (id) { return rowById(id); }).filter(Boolean);
    var cout = rows.reduce(function (s, r) { return s + r.coutTotal; }, 0);
    zone.innerHTML = '<div class="asa-selbar">' +
      '<span class="asa-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="asa-selbar-sub">coût cumulé ' + fcfa(cout) + '</span>' +
      '<button class="asa-btn asa-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="asa-btn asa-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="asa-btn asa-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= journal (lecture fusionnée) ================= */
  function journalRows() {
    var out = [];
    var seen = {};
    function push(x) {
      var k = (x.time || 0) + '|' + (x.action || '') + '|' + (x.detail || '');
      if (!seen[k]) { seen[k] = 1; out.push(x); }
    }
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.read === 'function') {
        (window.__ADMINA_AUDIT__.read() || []).forEach(push);
      }
    } catch (e) {}
    try { (JSON.parse(localStorage.getItem(LS_J) || '[]') || []).forEach(push); } catch (e2) {}
    out.sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
    return out;
  }

  /* ================= drawer fiche =================
     Leçon M26 : aucun handler ne se referme sur un snapshot —
     chaque mutation relit les données fraîches via mutate(cur),
     puis reopenDrawerAt(id) rafraîchit la fiche ouverte. */
  function closeDrawer() { $$('[data-asa="drawer"],[data-asa="backdrop"][data-asa-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id, section) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'asa-backdrop', 'data-asa': 'backdrop', 'data-asa-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var sm = statutMeta(r.statut);
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var warnBlock = '';
    if (!r.debutTs || !r.finTs) warnBlock += '<div class="asa-warnblock">⚠ Dates à compléter — la durée et le coût ne peuvent pas être contrôlés.</div>';
    if (r.imminent) warnBlock += '<div class="asa-warnblock">⚠ Fin ' + esc(jDelay(r.dateFin)) + ' et statut toujours « En cours » — décider du renouvellement (c\u2019est un retournant : recontacter en priorité) ou clôturer.</div>';
    if (r.derive) warnBlock += '<div class="asa-warnblock">⚠ Dérive de coût : déclaré ' + esc(fcfa(r.coutTotal)) + ' vs calculé ' + esc(fcfa(r.coutTheo)) + ' (taux × ' + SEUILS.heuresJour + ' h/j × ' + r.dureeCalc + ' j), écart ' + (r.derivePctV > 0 ? '+' : '') + r.derivePctV + ' %.</div>';
    if (r.conflit) warnBlock += '<div class="asa-warnblock">⚠ Chevauchement de contrats pour cette personne : ' + esc((r.conflitAvec || []).join(', ')) + ' — une personne ne peut pas couvrir deux postes simultanément.</div>';
    var hist = journalRows().filter(function (x) {
      var hay = (x.action || '') + ' ' + (x.detail || '');
      return hay.indexOf(String(r.numero || '')) > -1 && String(r.numero || '').length > 2;
    }).slice(0, 8);
    var histHtml = hist.length ? hist.map(function (x) {
      var d = new Date(x.time);
      return '<div class="asa-jrow"><span class="asa-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="asa-jact">' + esc(x.action || '') + '</span><span class="asa-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="asa-empty" style="padding:8px 0">Aucun événement journalisé pour ce contrat.</div>';
    var dr = h('aside', { class: 'asa-drawer', 'data-asa': 'drawer', role: 'dialog', 'aria-label': 'Fiche contrat ' + (r.numero || r.id) });
    dr.innerHTML =
      '<div class="asa-drawer-head"><div><div class="asa-drawer-title">' + esc(r.nom || '—') + (r.prenom && norm(r.nom || '').indexOf(norm(r.prenom)) < 0 ? ' ' + esc(r.prenom) : '') + '</div>' +
      '<div class="asa-drawer-sub">' + esc(r.numero || r.id) + ' · ' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div></div>' +
      '<button class="asa-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asa-drawer-body">' +
        '<div class="asa-live" style="margin-top:0"><span>Statut <b style="color:' + sm.c + '">' + esc(sm.lab) + '</b></span>' +
          '<span>Période <b>' + esc(r.dateDebut || '—') + ' → ' + esc(r.dateFin || '—') + '</b></span>' +
          '<span>Durée <b>' + (r.dureeCalc ? r.dureeCalc + ' j' : '—') + '</b></span>' +
          (r.jRest !== null ? '<span>Fin <b>' + esc(jDelay(r.dateFin)) + '</b></span>' : '') +
        '</div>' +
        '<div style="margin-top:8px">' + retBadge(r) + ' <span class="asa-num">' + (r.retournant ? 'retournant — dernier contrat terminé : ' + esc(r.retLastFin || '—') + (r.retActive ? ' · contrat en cours' : '') : 'premier contrat dans le fichier') + '</span></div>' +
        warnBlock +
        '<div class="asa-fsec" data-asa="dsec-couts">Coûts détaillés — calculé vs déclaré</div>' +
        '<dl class="asa-kv">' +
          kv('Taux horaire', (r.tauxHoraire ? nb(r.tauxHoraire) + ' FCFA/h' : '—')) +
          kv('Heures / jour (seuil)', SEUILS.heuresJour + ' h') +
          kv('Durée', (r.dureeCalc ? r.dureeCalc + ' j' : '—')) +
          kv('Coût calculé', (r.coutTheo ? '<b>' + esc(fcfa(r.coutTheo)) + '</b> <span class="asa-num">(taux × ' + SEUILS.heuresJour + ' h × durée)</span>' : '—')) +
          kv('Coût déclaré', '<b>' + esc(fcfa(r.coutTotal)) + '</b>') +
          kv('Écart', r.coutTheo ? '<span style="color:' + (Math.abs(r.derivePctV) > SEUILS.derivePct ? 'var(--asa-err)' : 'var(--asa-ok)') + '">' + (r.derivePctV > 0 ? '+' : '') + r.derivePctV + ' %</span>' : '—') +
        '</dl>' +
        (r.coutTheo ? '<div class="asa-drawer-actions" style="margin-top:6px"><button class="asa-btn asa-btn-ghost" data-act="recalc">Recalculer le coût déclaré = taux × ' + SEUILS.heuresJour + ' h × durée</button></div>' : '') +
        '<div class="asa-fsec" data-asa="dsec-motif">Motif &amp; source — pourquoi il revient</div>' +
        '<div class="asa-sim-row"><label for="asa-msel">Motif</label>' +
          '<select id="asa-msel" class="asa-in" data-asa="motsel">' + [r.motif].concat(MOTIFS.filter(function (m) { return m !== r.motif; })).filter(Boolean).map(function (m) {
            return '<option value="' + esc(m) + '"' + (m === r.motif ? ' selected' : '') + '>' + esc(motifLab(m)) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="asa-sim-row"><label for="asa-sselin">Source</label>' +
          '<input id="asa-sselin" class="asa-in" data-asa="srcsel" list="asa-srcs" value="' + esc(r.source || '') + '" placeholder="Ex. Cooptation">' +
          '<datalist id="asa-srcs">' + SOURCES.map(function (s) { return '<option value="' + esc(s) + '"></option>'; }).join('') + '</datalist></div>' +
        '<div class="asa-fsec" data-asa="dsec-statut">Statut rapide</div>' +
        '<div class="asa-sim-row" style="margin-bottom:10px"><label for="asa-stsel">Statut du contrat</label>' +
          '<select id="asa-stsel" class="asa-in" data-asa="stsel">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="asa-fsec" data-asa="dsec-notes">Notes</div>' +
        '<textarea class="asa-notebox" data-asa="note" placeholder="Qualité de la saison, à recontacter pour…, contacts, remarques de coûts…">' + esc(r.notes || '') + '</textarea>' +
        '<div class="asa-fsec" data-asa="dsec-hist">Historique (journal)</div>' +
        histHtml +
        '<div class="asa-drawer-actions">' +
          '<button class="asa-btn asa-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="asa-btn asa-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="asa-btn asa-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="asa-btn asa-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.asa-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-asa="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statut) return;
      mutate(function (cur) {
        cur.saisonniers = cur.saisonniers.map(function (x) { if (String(x.id) === String(id)) x.statut = nv; return x; });
        return cur;
      }, 'Statut modifié', (r.numero || r.id) + ' → ' + statutMeta(nv).lab);
      toast('Statut : ' + statutMeta(nv).lab, 'ok');
      reopenDrawerAt(id, 'statut');
    });
    $('[data-asa="motsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.motif) return;
      mutate(function (cur) {
        cur.saisonniers = cur.saisonniers.map(function (x) { if (String(x.id) === String(id)) x.motif = nv; return x; });
        return cur;
      }, 'Motif modifié', (r.numero || r.id) + ' → ' + motifLab(nv));
      toast('Motif : ' + motifLab(nv), 'ok');
      reopenDrawerAt(id, 'motif');
    });
    $('[data-asa="srcsel"]', dr).addEventListener('change', function () {
      var nv = $('[data-asa="srcsel"]', dr).value.trim();
      if (nv === (r.source || '')) return;
      mutate(function (cur) {
        cur.saisonniers = cur.saisonniers.map(function (x) { if (String(x.id) === String(id)) x.source = nv; return x; });
        return cur;
      }, 'Source modifiée', (r.numero || r.id) + ' → ' + (nv || '—'));
      toast('Source enregistrée', 'ok');
      reopenDrawerAt(id, 'motif');
    });
    $('[data-act="recalc"]', dr).addEventListener('click', function () {
      mutate(function (cur) {
        cur.saisonniers = cur.saisonniers.map(function (x) {
          if (String(x.id) === String(id)) x.coutTotal = Math.round((Number(x.tauxHoraire) || 0) * SEUILS.heuresJour * (Number(x.duree) || 0));
          return x;
        });
        return cur;
      }, 'Coût recalculé', (r.numero || r.id) + ' → ' + fcfa(r.coutTheo));
      toast('Coût déclaré recalculé : ' + fcfa(r.coutTheo), 'ok');
      reopenDrawerAt(id, 'couts');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-asa="note"]', dr).value;
      mutate(function (cur) {
        cur.saisonniers = cur.saisonniers.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.numero || r.id);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    if (section) {
      var tgt = $('[data-asa="dsec-' + section + '"]', dr);
      if (tgt) { try { tgt.scrollIntoView({ block: 'center' }); } catch (e) {} }
    }
    jlog('Ouverture fiche', r.numero || r.id);
  }
  function reopenDrawerAt(id, section) {
    if (UI.drawerId !== null && String(UI.drawerId) === String(id)) openDrawer(id, section);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-asa="dialog"],[data-asa="backdrop"][data-asa-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
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
    var bd = h('div', { class: 'asa-backdrop', 'data-asa': 'backdrop', 'data-asa-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'asa-dialog', 'data-asa': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier un contrat' : 'Nouveau contrat saisonnier' });
    function opts(list, cur, labFn) {
      return '<option value=""></option>' + list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = labFn ? labFn(vv) : (typeof x === 'object' ? x.lab : x);
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    var depsDatalist = '<datalist id="asa-deps">' + Object.keys(rows.reduce(function (m, x) { if (x.departement) m[x.departement] = 1; return m; }, {})).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    var srcDatalist = '<datalist id="asa-srcs2">' + Object.keys(rows.reduce(function (m, x) { if (x.source) m[x.source] = 1; return m; }, {})).concat(SOURCES).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    var motifList = MOTIFS.slice();
    if (v('motif') && motifList.indexOf(v('motif')) < 0) motifList = [v('motif')].concat(motifList);
    var motifOpts = opts(motifList, v('motif'), motifLab);
    dlg.innerHTML =
      '<div class="asa-dialog-head"><h3>' + (r ? 'Modifier le contrat ' + esc(r.numero || r.id) : 'Nouveau contrat saisonnier') + '</h3>' +
      '<button class="asa-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asa-dialog-body">' +
        '<div class="asa-fgrid">' +
          '<label class="asa-lab">Nom *<input class="asa-in" data-f="nom" value="' + esc(v('nom')) + '" placeholder="Ex. Nkoum Patrick"></label>' +
          '<label class="asa-lab">Prénom *<input class="asa-in" data-f="prenom" value="' + esc(v('prenom')) + '" placeholder="Ex. Patrick"></label>' +
          '<label class="asa-lab">Poste *<input class="asa-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Agent de Sécurité"></label>' +
          '<label class="asa-lab">Département *<input class="asa-in" data-f="departement" list="asa-deps" value="' + esc(v('departement')) + '" placeholder="Ex. Sécurité"></label>' +
          '<label class="asa-lab">Date de début * (jj/mm/aaaa)<input class="asa-in" data-f="dateDebut" value="' + esc(v('dateDebut')) + '" placeholder="jj/mm/aaaa" inputmode="numeric"></label>' +
          '<label class="asa-lab">Date de fin * (jj/mm/aaaa, postérieure au début)<input class="asa-in" data-f="dateFin" value="' + esc(v('dateFin')) + '" placeholder="jj/mm/aaaa" inputmode="numeric"></label>' +
          '<label class="asa-lab">Statut<select class="asa-in" data-f="statut">' + opts(STATUTS, v('statut') || 'En cours') + '</select></label>' +
          '<label class="asa-lab">Taux horaire * (FCFA/h, nombre)<input class="asa-in" data-f="tauxHoraire" type="number" min="0" step="any" value="' + esc(v('tauxHoraire')) + '" placeholder="Ex. 2500"></label>' +
          '<label class="asa-lab">Motif<select class="asa-in" data-f="motif">' + motifOpts + '</select></label>' +
          '<label class="asa-lab">Source<input class="asa-in" data-f="source" list="asa-srcs2" value="' + esc(v('source')) + '" placeholder="Ex. Cooptation"></label>' +
          '<label class="asa-lab">Coût total (FCFA) — auto-calculé, modifiable<div style="display:flex;gap:6px"><input class="asa-in" data-f="coutTotal" type="number" min="0" step="any" value="' + esc(v('coutTotal')) + '" placeholder="Auto = taux × h × durée"><button type="button" class="asa-btn asa-btn-ghost asa-mini" data-act="recalc" title="Recalculer = taux × heures/jour × durée">↻ Recalculer</button></div></label>' +
          '<label class="asa-lab full">Notes<textarea class="asa-in asa-ta" data-f="notes" placeholder="Qualité de la saison, à recontacter pour…, précisions…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' + depsDatalist + srcDatalist +
        '<div class="asa-live" data-asa="dlg-live"></div>' +
        '<div data-asa="dlg-err"></div>' +
      '</div>' +
      '<div class="asa-dialog-foot"><span class="asa-form-hint">Le fichier des retournants — dates réelles jj/mm/aaaa, fin &gt; début · coût = taux × ' + SEUILS.heuresJour + ' h/j × durée (modifiable)</span>' +
      '<span style="display:flex;gap:8px"><button class="asa-btn asa-btn-ghost" data-act="cancel" style="color:var(--asa-text);border-color:var(--asa-line)">Annuler</button>' +
      '<button class="asa-btn asa-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer le contrat') + '</button></span></div>';
    $('.asa-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function calc() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var ok1 = validDateStr(val.dateDebut), ok2 = validDateStr(val.dateFin);
      var dur = ok1 && ok2 ? diffJours(val.dateDebut, val.dateFin) : 0;
      var taux = parseFloat(String(val.tauxHoraire || '').replace(',', '.')) || 0;
      var calc = Math.round(taux * SEUILS.heuresJour * dur);
      return { val: val, ok1: ok1, ok2: ok2, dur: dur, taux: taux, calc: calc };
    }
    function live() {
      var c = calc();
      var ordre = c.ok1 && c.ok2 && dateKey(c.val.dateFin) > dateKey(c.val.dateDebut);
      var declar = parseFloat(String(c.val.coutTotal || '').replace(',', '.')) || 0;
      var ecart = c.calc ? Math.round((declar - c.calc) / c.calc * 100) : 0;
      $('[data-asa="dlg-live"]', dlg).innerHTML =
        '<span>Durée <b>' + (c.dur && ordre ? c.dur + ' j' : '—') + '</b></span>' +
        '<span>Coût calculé <b>' + (c.calc && ordre ? fcfa(c.calc) : '—') + '</b> <span class="asa-num">(taux × ' + SEUILS.heuresJour + ' h × durée)</span></span>' +
        '<span>Coût déclaré <b>' + (declar ? fcfa(declar) : '—') + '</b>' + (c.calc && declar ? ' · écart <b class="' + (Math.abs(ecart) > SEUILS.derivePct ? 'bad' : 'good') + '">' + (ecart > 0 ? '+' : '') + ecart + ' %</b>' : '') + '</span>' +
        (!c.ok1 && c.val.dateDebut ? '<span class="bad">⚠ date de début invalide</span>' : '') +
        (!c.ok2 && c.val.dateFin ? '<span class="bad">⚠ date de fin invalide</span>' : '') +
        (c.ok1 && c.ok2 && !ordre ? '<span class="bad">⚠ la fin doit être postérieure au début</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    $('[data-act="recalc"]', dlg).addEventListener('click', function () {
      var c = calc();
      var inp = $('[data-f="coutTotal"]', dlg);
      if (inp) inp.value = c.calc ? String(c.calc) : '';
      live();
      toast('Coût recalculé : ' + (c.calc ? fcfa(c.calc) : 'complétez dates + taux'), c.calc ? 'ok' : '');
    });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-asa="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="asa-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.nom || '').trim()) return fail('Le nom est obligatoire.');
      if (!String(val.prenom || '').trim()) return fail('Le prénom est obligatoire.');
      if (!String(val.poste || '').trim()) return fail('Le poste est obligatoire.');
      if (!String(val.departement || '').trim()) return fail('Le département est obligatoire.');
      if (!validDateStr(val.dateDebut)) return fail('La date de début est obligatoire et doit être une date réelle au format jj/mm/aaaa.');
      if (!validDateStr(val.dateFin)) return fail('La date de fin est obligatoire et doit être une date réelle au format jj/mm/aaaa.');
      if (dateKey(val.dateFin) <= dateKey(val.dateDebut)) return fail('La date de fin doit être strictement postérieure à la date de début.');
      var taux = parseFloat(String(val.tauxHoraire || '').replace(',', '.'));
      if (!isFinite(taux) || taux < 0) return fail('Le taux horaire est obligatoire et doit être un nombre (FCFA/h).');
      var coutIn = String(val.coutTotal || '').trim();
      var cout = coutIn === '' ? Math.round(taux * SEUILS.heuresJour * diffJours(val.dateDebut, val.dateFin)) : parseFloat(coutIn.replace(',', '.'));
      if (!isFinite(cout) || cout < 0) return fail('Le coût total doit être un nombre (FCFA) — laissez vide pour l\u2019auto-calcul.');
      var rec = {
        nom: String(val.nom).trim(),
        prenom: String(val.prenom).trim(),
        poste: String(val.poste).trim(),
        departement: String(val.departement).trim(),
        dateDebut: String(val.dateDebut).trim(),
        dateFin: String(val.dateFin).trim(),
        duree: diffJours(val.dateDebut, val.dateFin),
        statut: String(val.statut || '').trim() || 'En cours',
        tauxHoraire: taux,
        coutTotal: Math.round(cout),
        motif: String(val.motif || '').trim(),
        source: String(val.source || '').trim(),
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.saisonniers = cur.saisonniers.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) if (DERIVED.indexOf(kk) < 0) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Contrat modifié', rec.nom + ' (' + rec.dateDebut + ' → ' + rec.dateFin + ')');
        toast('Contrat mis à jour', 'ok');
      } else {
        mutate(function (cur) {
          var mx = cur.saisonniers.reduce(function (m, x) {
            var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n);
            var m2 = /^SAI-(\d+)$/.exec(String(x.numero || ''));
            if (m2) m = Math.max(m, Number(m2[1]));
            return m;
          }, 0) + 1;
          var cp = {};
          for (var k2 in rec) cp[k2] = rec[k2];
          cp.id = mx;
          cp.numero = 'SAI-' + String(mx).padStart(3, '0');
          cur.saisonniers = cur.saisonniers.concat([cp]);
          return cur;
        }, 'Contrat créé', rec.nom + ' (' + rec.dateDebut + ' → ' + rec.dateFin + ')');
        toast('Contrat créé — ' + rec.nom, 'ok');
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
    var newId = null;
    mutate(function (cur) {
      var mx = cur.saisonniers.reduce(function (m, x) {
        var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n);
        var m2 = /^SAI-(\d+)$/.exec(String(x.numero || ''));
        if (m2) m = Math.max(m, Number(m2[1]));
        return m;
      }, 0) + 1;
      newId = mx;
      var cp = {};
      for (var k in r) if (DERIVED.indexOf(k) < 0) cp[k] = r[k];
      cp.id = mx;
      cp.numero = 'SAI-' + String(mx).padStart(3, '0');
      /* duplication = nouveau contrat pour un retournant : statut En cours, dates à remplir */
      cp.statut = 'En cours';
      cp.dateDebut = '';
      cp.dateFin = '';
      cp.duree = 0;
      cp.coutTotal = 0;
      cp.notes = '';
      cur.saisonniers = cur.saisonniers.concat([cp]);
      return cur;
    }, 'Contrat dupliqué', (r.numero || r.id) + ' → dates à remplir');
    toast('Contrat dupliqué — renseignez les dates du nouveau contrat', 'ok');
    if (newId) openDialog(newId, null);
  }
  function closeConfirm() { $$('[data-asa="confirm"],[data-asa="backdrop"][data-asa-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'asa-backdrop', 'data-asa': 'backdrop', 'data-asa-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'asa-confirm', 'data-asa': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer ce contrat ?</h4><p>' + esc(r.numero || r.id) + ' — ' + esc(r.nom || '') + ' (' + esc(r.poste || '') + ', ' + esc(r.dateDebut || '') + ' → ' + esc(r.dateFin || '') + ').' + (r.retournant ? ' Attention : ce contrat compte dans le fichier des retournants (' + r.retCount + ' contrats).' : '') + ' Cette action est définitive.</p>' +
      '<div class="asa-confirm-row"><button class="asa-btn asa-btn-ghost" data-a="no" style="color:var(--asa-text);border-color:var(--asa-line)">Annuler</button>' +
      '<button class="asa-btn asa-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.saisonniers = cur.saisonniers.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Contrat supprimé', r.numero || r.id);
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Contrat supprimé', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' contrats ?') : 'Supprimer 1 contrat ?';
    var bd = h('div', { class: 'asa-backdrop', 'data-asa': 'backdrop', 'data-asa-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'asa-confirm', 'data-asa': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero || r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="asa-confirm-row"><button class="asa-btn asa-btn-ghost" data-a="no" style="color:var(--asa-text);border-color:var(--asa-line)">Annuler</button>' +
      '<button class="asa-btn asa-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.saisonniers = cur.saisonniers.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' contrats');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' contrats supprimés', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= couverture & retournants (K) ================= */
  function closeCouverture() { $$('[data-asa="couv"],[data-asa="backdrop"][data-asa-for="couv"]').forEach(function (n) { n.remove(); }); }
  function openCouverture() {
    closeCouverture();
    var year = navYear();
    var cov = couverture();
    var rets = retournants(data());
    var stales = rets.filter(function (m) { return m.stale; });
    var depsGaps = worstDepGaps(year);
    var bd = h('div', { class: 'asa-backdrop', 'data-asa': 'backdrop', 'data-asa-for': 'couv' });
    bd.addEventListener('click', closeCouverture);
    var p = h('div', { class: 'asa-panel', 'data-asa': 'couv', role: 'dialog', 'aria-label': 'Couverture & retournants' });
    var gapRows = depsGaps.map(function (d) {
      return '<div class="asa-chg-row"><span class="asa-chg-who"><b>' + esc(d.dep) + '</b></span>' +
        '<span class="asa-chg-what">' + d.gaps.length + ' mois à venir sans couverture : ' + esc(d.gaps.join(', ')) + '</span>' +
        '<button class="asa-ic" data-dep="' + esc(d.dep) + '" title="Analyser dans la frise">👁</button></div>';
    }).join('');
    var retRows = rets.slice(0, 14).map(function (m) {
      return '<div class="asa-chg-row' + (m.stale ? ' hot' : '') + '">' +
        '<span class="asa-chg-who"><b>' + esc(m.name) + '</b> · ' + m.count + ' contrat' + (m.count > 1 ? 's' : '') + '</span>' +
        '<span class="asa-chg-what">' + (m.active ? 'contrat en cours' : m.lastFin ? 'dernier contrat terminé le ' + esc(m.lastFin) + ' (' + m.mois + ' mois)' : 'sans date de fin') + (m.stale ? ' — <b>à recontacter</b>' : '') + '</span>' +
        '<button class="asa-ic" data-ret="' + esc(m.key) + '" title="Voir ses contrats">👁</button></div>';
    }).join('');
    p.innerHTML = '<div class="asa-panel-head"><h3>Couverture &amp; retournants — ' + year + '</h3><button class="asa-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asa-panel-body">' +
        '<div class="asa-sim-kpis"><span><b>' + (cov.futureGaps.length ? cov.futureGaps.length : 0) + '</b> mois à venir sans couverture (' + esc(cov.dep || 'tous départements') + ')</span>' +
          '<span><b>' + rets.length + '</b> retournant' + (rets.length > 1 ? 's' : '') + '</span>' +
          '<span><b>' + stales.length + '</b> à recontacter (&gt; ' + SEUILS.retournantDelai + ' mois)</span></div>' +
        '<div class="asa-fsec">Mois à venir sans couverture, par département</div>' +
        (gapRows || '<div class="asa-empty" style="padding:8px 0">Tous les mois à venir sont couverts dans chaque département actif.</div>') +
        '<div class="asa-fsec">Fichier des retournants — la fidélisation prime sur le remplacement</div>' +
        (retRows || '<div class="asa-empty" style="padding:8px 0">Aucun retournant pour l\u2019instant : chaque bien-noté sera recontacté la saison prochaine.</div>') +
        '<div class="asa-sim-tip" style="margin-top:10px">💡 Un retournant connu = une quantité maîtrisée : recontactez-le avant d\u2019ouvrir une nouvelle candidature.</div>' +
      '</div>';
    $('.asa-drawer-x', p).addEventListener('click', closeCouverture);
    $$('[data-dep]', p).forEach(function (b) {
      b.addEventListener('click', function () {
        UI.depfrise = b.getAttribute('data-dep');
        UI.view = 'saison';
        closeCouverture();
        refresh();
        var fc = $('[data-asa="frisecard"]');
        if (fc) { try { fc.scrollIntoView({ block: 'start' }); } catch (e1) {} }
      });
    });
    $$('[data-ret]', p).forEach(function (b) {
      b.addEventListener('click', function () {
        resetFilters();
        UI.dim = 'retstale';
        closeCouverture();
        refresh();
        toast('Contrats des retournants à recontacter', 'ok');
      });
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Couverture & retournants ouverte', year + ' · ' + rets.length + ' retournant(s)');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-asa="seuils"],[data-asa="backdrop"][data-asa-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'asa-backdrop', 'data-asa': 'backdrop', 'data-asa-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'asa-panel', 'data-asa': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="asa-panel-head"><h3>Seuils de pilotage</h3><button class="asa-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asa-panel-body">' +
        '<p class="asa-cibles-note">Ces seuils alimentent les alertes « fin imminente », « retournants à recontacter », « coût du portefeuille », « dérive de coût » et le calcul du coût théorique — persistés sur ce navigateur.</p>' +
        '<div class="asa-sim-row"><label for="asa-s1">Fin imminente — jours avant la date de fin</label><input type="range" id="asa-s1" min="7" max="90" step="1" value="' + SEUILS.finImminente + '"><input class="asa-in" type="number" min="7" max="90" step="1" data-asa="s1n" value="' + SEUILS.finImminente + '"></div>' +
        '<div class="asa-sim-row"><label for="asa-s2">Retournant à recontacter après (mois sans contrat)</label><input type="range" id="asa-s2" min="1" max="24" step="1" value="' + SEUILS.retournantDelai + '"><input class="asa-in" type="number" min="1" max="24" step="1" data-asa="s2n" value="' + SEUILS.retournantDelai + '"></div>' +
        '<div class="asa-sim-row"><label for="asa-s3">Coût total du portefeuille — seuil (FCFA)</label><input type="range" id="asa-s3" min="0" max="10000000" step="50000" value="' + SEUILS.coutMax + '"><input class="asa-in" type="number" min="0" step="50000" data-asa="s3n" value="' + SEUILS.coutMax + '"></div>' +
        '<div class="asa-sim-row"><label for="asa-s4">Tolérance de dérive de coût (%)</label><input type="range" id="asa-s4" min="5" max="50" step="1" value="' + SEUILS.derivePct + '"><input class="asa-in" type="number" min="5" max="50" step="1" data-asa="s4n" value="' + SEUILS.derivePct + '"></div>' +
        '<div class="asa-sim-row"><label for="asa-s5">Heures par jour (calcul du coût théorique)</label><input type="range" id="asa-s5" min="6" max="12" step="1" value="' + SEUILS.heuresJour + '"><input class="asa-in" type="number" min="6" max="12" step="1" data-asa="s5n" value="' + SEUILS.heuresJour + '"></div>' +
        '<div class="asa-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="asa-btn asa-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.asa-drawer-x', p).addEventListener('click', closeSeuils);
    [['asa-s1', 's1n', 'finImminente', 7, 90, 1], ['asa-s2', 's2n', 'retournantDelai', 1, 24, 1], ['asa-s3', 's3n', 'coutMax', 0, 10000000, 50000], ['asa-s4', 's4n', 'derivePct', 5, 50, 1], ['asa-s5', 's5n', 'heuresJour', 6, 12, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-asa="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = clamp(n.value, cfg[3], cfg[4]); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.finImminente = clamp($('[data-asa="s1n"]', p).value, 7, 90);
      SEUILS.retournantDelai = clamp($('[data-asa="s2n"]', p).value, 1, 24);
      SEUILS.coutMax = clamp($('[data-asa="s3n"]', p).value, 0, 100000000);
      SEUILS.derivePct = clamp($('[data-asa="s4n"]', p).value, 5, 50);
      SEUILS.heuresJour = clamp($('[data-asa="s5n"]', p).value, 6, 12);
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'fin ' + SEUILS.finImminente + ' j · retournant ' + SEUILS.retournantDelai + ' mois · coût ' + SEUILS.coutMax + ' · dérive ' + SEUILS.derivePct + ' % · ' + SEUILS.heuresJour + ' h/j');
      toast('Seuils appliqués — alertes et coûts recalculés', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal (panneau) ================= */
  function closeJournal() { $$('[data-asa="journal"],[data-asa="backdrop"][data-asa-for="journal"]').forEach(function (n) { n.remove(); }); }
  function openJournal() {
    closeJournal();
    var bd = h('div', { class: 'asa-backdrop', 'data-asa': 'backdrop', 'data-asa-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'asa-panel', 'data-asa': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="asa-panel-head"><h3>Journal d\u2019activité</h3><button class="asa-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asa-panel-body" data-asa="jlist"></div>';
    $('.asa-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-asa="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="asa-jrow"><span class="asa-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="asa-jact">' + esc(x.action || '') + '</span><span class="asa-jdet">' + esc(x.detail || '') + '</span><span class="asa-jrole">' + esc(x.role || '') + '</span></div>';
    }).join('') : '<div class="asa-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Contrat', 'Nom', 'Prénom', 'Poste', 'Département', 'Date début', 'Date fin', 'Durée (jours)', 'Statut', 'Taux horaire (FCFA/h)', 'Heures/jour', 'Coût théorique (FCFA)', 'Coût déclaré (FCFA)', 'Dérive (%)', 'Motif', 'Source', 'Retournant (nb contrats)', 'Notes'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero || r.id, r.nom, r.prenom, r.poste, r.departement, r.dateDebut, r.dateFin, r.dureeCalc, r.statut, r.tauxHoraire, SEUILS.heuresJour, r.coutTheo, r.coutTotal, r.coutTheo ? r.derivePctV + ' %' : '', motifLab(r.motif), r.source, r.retournant ? r.retCount : '', r.notes];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'saisonniers-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeCouverture(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-asa="dialog"]') || $('[data-asa="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { setView('saison'); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { setView('cards'); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { setView('table'); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { openCouverture(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-asa="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouveau contrat · E export · J journal · P saisonnalité · C cartes · T tableau · S seuils · K couverture & retournants · / recherche', ''); }
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

  /* ================= thème sombre (LS admina-dark + luminance + prefers-color-scheme) ================= */
  function detectTheme() {
    var root = $('[data-asa="root"]');
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
    if (dark) html.setAttribute('data-dark', '1');
    else html.removeAttribute('data-dark');
  }

  /* ================= UI persist (per seulement — la vue signature Saisonnalité est le défaut au chargement) ================= */
  function loadUI() {
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v && typeof v.per === 'number') UI.per = v.per; } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ per: UI.per })); } catch (e) {} }

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
    else renderFrise();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-asa="drawer"],[data-asa="dialog"],[data-asa="confirm"],[data-asa="journal"],[data-asa="couv"],[data-asa="seuils"]')) {
      $$('[data-asa="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0, subBound = false;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function tryActivate() {
    if (active) return;
    if (!isOn()) { bootTries = 0; return; }
    bootTries++;
    /* résilience : API → LS → (après 30 essais) snapshot démo ; sans conteneur natif : page intacte */
    if (!ready() && bootTries < 30) { setTimeout(tryActivate, 450); return; }
    if (!mountRoot()) return; /* page native intacte si montage impossible */
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
    html.classList.add('admina-asa');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    UI.annee = null; /* année de référence = contrats majoritaires à chaque activation */
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-asa]')) continue;
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
    html.classList.remove('admina-asa');
    html.removeAttribute('data-dark');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeCouverture(); closeSeuils();
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
    var root = $('[data-asa="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-asa-hide', '1');
      natif.setAttribute('data-asa-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) refresh();
  }

  /* démarrage : réessais 30 × 450 ms (relit API puis LS à chaque essai), sinon snapshot démo / page native intacte */
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

  window.__ADMINA_SAI_UI__ = {
    version: '1.0-w3',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openJournal: openJournal,
    openSeuils: openSeuils,
    openCouverture: openCouverture,
    setView: setView,
    exportCSV: exportCSV,
    debug: {
      filtered: filtered,
      alerts: computeAlerts,
      retournants: retournants,
      couverture: couverture,
      seuils: SEUILS
    }
  };
  try { console.info('[ADMINA_SAI] W3-b actif — Le fichier des retournants /saisonniers-temporaires'); } catch (e) {}

  window.__ADMINA_SAI_W3__ = true; /* flag d'idempotence posé EN FIN d'init (canon W3-b) */
})();
