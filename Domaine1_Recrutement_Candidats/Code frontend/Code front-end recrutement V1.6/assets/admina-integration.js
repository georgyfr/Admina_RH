/* =============================================================
   Admina-RH — Intégration Employé — couche admina (W2-a)
   Scope : /integration-employe · préfixe aig- · flag __ADMINA_IGR_W2__
   ---------------------------------------------------------------
   PHILOSOPHIE DE LA PAGE (posée avant toute conception) :
   /integration-employe = le PARCOURS D'ARRIVÉE de chaque nouvel
   employé — de la décision d'embauche au premier jour réussi.
   C'est un processus administratif ET humain séquencé : préparation
   du poste, contrat & documents, formation sécurité, matériel &
   badge, accès informatique, visite des locaux, formation métier.
   Trois principes gouvernent cette page :
     1. chaque employé a un parcours visible avec une progression
        claire (VUE PARCOURS = signature : barre segmentée par
        étape, cliquable, qui ouvre la fiche à l'étape visée) ;
     2. rien ne doit se perdre entre l'acceptation de l'offre et
        le premier jour — les arrivées à venir et leur état de
        préparation (documents, badge, compte) remontent en alerte
        J-1 actionnable, et la charge d'accueil par période est
        visible pour ne jamais découvrir un arrivant non préparé ;
     3. les blocages administratifs remontent comme alertes
        actionnables (documents manquants, intégration stagnante,
        date de début absente) — chaque alerte conduit au bon
        filtre ou au bon geste.
   Cette page n'est NI un pipeline kanban, NI un tableur : c'est un
   suivi de parcours individuel avec vue d'ensemble. Les fonctions
   d'intelligence (alertes, KPI, graphiques) servent ce PARCOURS.
   ---------------------------------------------------------------
   - Héro calculé (X intégrations · Y complètes · Z en retard ·
     progression moyenne) + 5 alertes AAA cliquables → filtres
     (+ croisement optionnel __ADMINA_SEL_API__/__ADMINA_CAND_API__
     « retenus sans intégration », silencieux si absents)
   - 6 KPI (dont 4 filtrent) + 3 graphiques SVG vanilla cliquables
     (donut statuts, progression par département, charge par période)
   - Recherche + 5 filtres + Réinitialiser · table triable
     aria-sort · vue cartes · VUE PARCOURS · drawer fiche (étapes
     cochables, dates, notes) · dialog création/édition VALIDÉ
     (dates jj/mm/aaaa, validation bloquante) · duplication
     (progression/validations réinitialisées) · suppression simple
     & groupée confirmée · seuils configurables (stagnation,
     alerte J-1, tolérance retard) · export CSV · journal
     admina_journal + délégation __ADMINA_AUDIT__ · raccourcis
     N/E/J/P/C/S/K/T + ? · dark mode auto · burger mobile <820px ·
     garde-fous 390px (0 débordement horizontal)
   - Données : window.__ADMINA_IGR_API__ (patch chunk W2-a) →
     fallback localStorage admina-integration-data · résilience :
     30 réessais (450 ms) au démarrage, sinon page native intacte ·
     écriture : API sinon fallback LS direct · pont bidirectionnel
     (subscribe + poller 1,2 s) — la vue native reflète les
     mutations du module
   - Aucun global hors window.__ADMINA_IGR_*
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_IGR_W2__) return;
  window.__ADMINA_IGR_W2__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/integration-employe\/?$/;
  var LS_DATA = 'admina-integration-data';
  var LS_UI = 'admina-integration-ui';
  var LS_SEUILS = 'admina-integration-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', dep: '', prog: '', date: '', docs: '', kpi: '', mois: '', view: 'parcours', sortKey: 'arrivee', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, delId: null, sel: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { stagnation: 45, j1: 7, retard: 0 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var STATUTS = [
    { k: 'En cours', lab: 'En cours', c: '#d97706' },
    { k: 'Terminee', lab: 'Terminée', c: '#059669' },
    { k: 'Prolongee', lab: 'Prolongée', c: '#0e7490' },
    { k: 'Echec', lab: 'Échec', c: '#dc2626' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }

  /* Le PARCOURS = 6 étapes séquencées, chacune portée par un champ
     natif réel du chunk Integration (aucune donnée inventée). */
  var STEPS = [
    { k: 'docs', f: 'docsAdmin', lab: 'Documents administratifs', short: 'Doc.', doneVal: 'Oui', vals: ['Oui', 'En cours', 'Non'], idle: 'Non' },
    { k: 'secu', f: 'formationSecurite', lab: 'Formation sécurité', short: 'Séc.', doneVal: 'Oui', vals: ['Oui', 'Planifiée', 'Non'], idle: 'Non' },
    { k: 'matos', f: 'equipementBadge', lab: 'Équipement & badge', short: 'Mat.', doneVal: 'Oui', vals: ['Oui', 'En cours', 'Non'], idle: 'Non' },
    { k: 'it', f: 'compteInfo', lab: 'Compte informatique', short: 'IT', doneVal: 'Oui', vals: ['Oui', 'En cours', 'Non'], idle: 'Non' },
    { k: 'locaux', f: 'visiteLocaux', lab: 'Visite des locaux', short: 'Loc.', doneVal: 'Fait', vals: ['Fait', 'Non fait'], idle: 'Non fait' },
    { k: 'metier', f: 'formationMetier', lab: 'Formation métier', short: 'Mét.', doneVal: 'Terminée', vals: ['Terminée', 'En cours', 'Planifiée'], idle: 'Planifiée' }
  ];
  function stepByk(k) { for (var i = 0; i < STEPS.length; i++) { if (STEPS[i].k === k) return STEPS[i]; } return null; }
  function stepState(r, st) {
    var v = r[st.f];
    if (v === st.doneVal) return 'done';
    if (v === 'En cours' || v === 'Planifiée') return 'wip';
    return 'todo';
  }
  function doneCount(r) { var n = 0; for (var i = 0; i < STEPS.length; i++) { if (stepState(r, STEPS[i]) === 'done') n++; } return n; }
  function progressOf(r) { return Math.round(doneCount(r) / STEPS.length * 100); }
  function stepRank(r) { return doneCount(r); }

  var DOCS_VALS = ['Oui', 'En cours', 'Non'];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
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
  function jlog(a, d) {
    try { if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.log === 'function') window.__ADMINA_AUDIT__.log(a, d, 'Recruteur'); } catch (e) {}
    try {
      var arr = JSON.parse(localStorage.getItem(LS_J) || '[]');
      if (!Array.isArray(arr)) arr = [];
      arr.push({ time: Date.now(), action: a, detail: d || '', role: 'Recruteur' });
      if (arr.length > 80) arr = arr.slice(-80);
      localStorage.setItem(LS_J, JSON.stringify(arr));
    } catch (e2) {}
  }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h(sel, attrs, htmlStr) { var e = document.createElement(sel); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (htmlStr != null) e.innerHTML = htmlStr; return e; }
  function toastsZone() { var z = $('[data-aig="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-aig', 'toasts'); z.className = 'aig-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'aig-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_IGR_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.integrations && Array.isArray(d.integrations) && d.integrations.length) return true;
    return false;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.integrations) { d = readLS(); }
    if (!d || !d.integrations || !d.integrations.length) return [];
    return d.integrations.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = String(u.id);
      u.done = doneCount(u);
      u.prog = progressOf(u);
      u.stm = statutMeta(u.statutIntegration);
      u.arrTs = tsOf(u.dateArrivee);
      u.finTs = tsOf(u.dateFinIntegration);
      u.jArr = daysUntil(u.dateArrivee);
      u.retard = u.statutIntegration === 'En cours' && u.finTs > 0 && daysSince(u.dateFinIntegration) > SEUILS.retard;
      u.stagn = u.statutIntegration === 'En cours' && u.done < STEPS.length && daysSince(u.dateArrivee) > SEUILS.stagnation;
      u.immin = u.jArr !== null && u.jArr >= 0 && u.jArr <= SEUILS.j1 && (u.docsAdmin !== 'Oui' || u.equipementBadge !== 'Oui' || u.compteInfo !== 'Oui');
      u.parcoursFait = u.done === STEPS.length && u.statutIntegration !== 'Terminee';
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) {
      var n = Number(r.id); if (isFinite(n)) m = Math.max(m, n);
      var m2 = /^INT-(\d+)$/.exec(String(r.numero || r.id || ''));
      if (m2) m = Math.max(m, Number(m2[1]));
      return m;
    }, 0) + 1;
    return { id: mx, numero: 'INT-' + String(mx).padStart(3, '0') };
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.integrations) { toast('Écriture impossible — recharger la page', 'err'); return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct (résilience W2) */
    var cur2 = readLS();
    if (cur2 && cur2.integrations) {
      var nv2 = fn(cur2);
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { return false; }
      if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
      refresh();
      return true;
    }
    toast('Écriture impossible — API indisponible', 'err');
    return false;
  }

  /* ================= croisements optionnels (silencieux) =========
     Retenus (sélections __ADMINA_SEL_API__ ou candidats
     __ADMINA_CAND_API__) qui n'ont AUCUNE intégration ouverte ici :
     rien ne doit se perdre entre l'offre acceptée et le jour 1. */
  function missingHires() {
    var rows = data();
    var out = [];
    var seen = {};
    function add(name, from) {
      var n = String(name || '').trim();
      if (!n) return;
      var k = norm(n);
      if (!k || seen[k]) return;
      var present = rows.some(function (r) {
        var e = norm(r.employe);
        if (!e) return false;
        return e === k || e.indexOf(k) > -1 || k.indexOf(e) > -1;
      });
      if (!present) { seen[k] = 1; out.push({ name: n, from: from }); }
    }
    try {
      var s = window.__ADMINA_SEL_API__;
      var sd = s && typeof s.getData === 'function' ? s.getData() : null;
      if (sd && sd.selections && sd.selections.length) {
        sd.selections.forEach(function (d) { if (d && d.statut === 'Retenu') add(d.candidat, 'sélection'); });
      }
    } catch (e1) {}
    try {
      var c = window.__ADMINA_CAND_API__;
      var cd = c && typeof c.getData === 'function' ? c.getData() : null;
      if (cd && cd.candidats && cd.candidats.length) {
        cd.candidats.forEach(function (r) {
          if (r && r.statut === 'Retenu') add((r.prenom || '') + ' ' + (r.nom || ''), 'candidats');
        });
      }
    } catch (e2) {}
    return out;
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var nodate = rows.filter(function (r) { return !String(r.dateArrivee || '').trim(); });
    if (nodate.length) out.push({ tone: 'err', txt: nodate.length + ' intégration' + (nodate.length > 1 ? 's' : '') + ' sans date de début prévue — planifier le premier jour (' + nodate.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'nodate' });
    var docs = rows.filter(function (r) { return r.docsAdmin !== 'Oui'; });
    if (docs.length) out.push({ tone: 'err', txt: docs.length + ' dossier' + (docs.length > 1 ? 's' : '') + ' administratif' + (docs.length > 1 ? 's' : '') + ' incomplet' + (docs.length > 1 ? 's' : '') + ' — blocage avant l\u2019embauche (' + docs.slice(0, 2).map(function (r) { return r.numero + ' ' + r.employe; }).join(', ') + '…)', f: 'docs' });
    var stg = rows.filter(function (r) { return r.stagn; });
    if (stg.length) out.push({ tone: 'warn', txt: stg.length + ' intégration' + (stg.length > 1 ? 's' : '') + ' stagnante' + (stg.length > 1 ? 's' : '') + ' : arrivée il y a plus de ' + SEUILS.stagnation + ' j sans parcours complété (' + stg.slice(0, 2).map(function (r) { return r.numero + ' · ' + r.done + '/6'; }).join(', ') + '…)', f: 'stagn' });
    var j1 = rows.filter(function (r) { return r.immin; });
    if (j1.length) out.push({ tone: 'warn', txt: 'Premier jour à ' + SEUILS.j1 + ' j ou moins sans matériel/accès prêt : ' + j1.slice(0, 2).map(function (r) { return r.employe + ' (' + jDelay(r.dateArrivee) + ')'; }).join(', ') + '…', f: 'j1' });
    var full = rows.filter(function (r) { return r.parcoursFait; });
    if (full.length) out.push({ tone: 'info', txt: full.length + ' parcours à 100 % des étapes sans statut finalisé — clôturer (' + full.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'full' });
    var miss = missingHires();
    if (miss.length) out.push({ tone: 'info', txt: miss.length + ' retenu' + (miss.length > 1 ? 's' : '') + ' (sélection/candidats) sans intégration ouverte — ouvrir le parcours avant le jour 1 : ' + miss.slice(0, 3).map(function (m) { return m.name; }).join(', ') + '…', f: 'cross' });
    return out.slice(0, 6);
  }

  /* ================= filtres / tri ================= */
  function monthKey(s) {
    var t = tsOf(s);
    if (!t) return '';
    var d = new Date(t);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
  }
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.statut && r.statutIntegration !== UI.statut) return false;
      if (UI.dep && norm(r.departement) !== norm(UI.dep)) return false;
      if (UI.prog === 'full' && r.done < STEPS.length) return false;
      if (UI.prog === 'p75' && !(r.prog >= 75 && r.done < STEPS.length)) return false;
      if (UI.prog === 'half' && !(r.prog >= 50 && r.prog < 75)) return false;
      if (UI.prog === 'low' && !(r.prog < 50)) return false;
      if (UI.date === 'in30' && !(r.jArr !== null && r.jArr >= 0 && r.jArr <= 30)) return false;
      if (UI.date === 'past' && !(r.jArr !== null && r.jArr < 0)) return false;
      if (UI.date === 'j1' && !r.immin) return false;
      if (UI.date === 'stagn' && !r.stagn) return false;
      if (UI.date === 'nodate' && String(r.dateArrivee || '').trim()) return false;
      if (UI.date === 'full' && !r.parcoursFait) return false;
      if (UI.docs === 'missing' && r.docsAdmin === 'Oui') return false;
      if (UI.docs === 'matos' && r.equipementBadge === 'Oui' && r.compteInfo === 'Oui') return false;
      if (UI.kpi === 'cours' && r.statutIntegration !== 'En cours') return false;
      if (UI.kpi === 'done' && r.statutIntegration !== 'Terminee') return false;
      if (UI.kpi === 'retard' && !r.retard) return false;
      if (UI.kpi === 'soon' && !(r.jArr !== null && r.jArr >= 0 && r.jArr <= 30)) return false;
      if (UI.mois && UI.mois.indexOf('m:') === 0 && monthKey(r.dateArrivee) !== UI.mois.slice(2)) return false;
      if (q && !(norm(r.employe).indexOf(q) > -1 || norm(r.numero).indexOf(q) > -1 || norm(r.poste).indexOf(q) > -1 || norm(r.departement).indexOf(q) > -1 || norm(r.managerAccueil).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'prog') { va = a.done; vb = b.done; }
      else if (k === 'docs' || k === 'secu' || k === 'matos' || k === 'it' || k === 'locaux' || k === 'metier') {
        var st = stepByk(k); va = stepRankVal(a, st); vb = stepRankVal(b, st);
      }
      else if (k === 'arrivee') { va = a.arrTs || 99999999; vb = b.arrTs || 99999999; }
      else if (k === 'fin') { va = a.finTs || 99999999; vb = b.finTs || 99999999; }
      else if (k === 'statut') { va = statutIdx(a.statutIntegration); vb = statutIdx(b.statutIntegration); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function statutIdx(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return i; } return 99; }
  function stepRankVal(r, st) {
    var s = stepState(r, st);
    return s === 'done' ? 2 : s === 'wip' ? 1 : 0;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.dep ? 1 : 0) + (UI.prog ? 1 : 0) + (UI.date ? 1 : 0) + (UI.docs ? 1 : 0) + (UI.kpi ? 1 : 0) + (UI.mois ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.prog = ''; UI.date = ''; UI.docs = ''; UI.kpi = ''; UI.mois = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Int[ée]gration\s+Employ[ée]/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-aig="root"]');
    if (!root) {
      root = h('section', { 'data-aig': 'root', class: 'aig-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-aig-page')) {
      page.setAttribute('data-aig-page', '1');
      page.setAttribute('data-aig-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-aig-hide')) {
      natif.setAttribute('data-aig-hide', '1');
      natif.setAttribute('data-aig-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-aig="root"]'); if (root) root.remove();
    $$('[data-aig-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-aig-oldw') || '';
      n.removeAttribute('data-aig-page');
      n.removeAttribute('data-aig-oldw');
    });
    $$('[data-aig-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-aig-olddisp') || '';
      n.removeAttribute('data-aig-hide');
      n.removeAttribute('data-aig-olddisp');
    });
    $$('[data-aig]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-aig="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'aig-btn aig-btn-primary aig-backbtn', 'data-aig': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'integration-employe');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    route: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M7 17c4-1 6-3 7-7M17 7c-.5 4-3 8-10 10"/></svg>',
    charge: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 15h3M13 13h4"/></svg>',
    seuils: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    steps: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h4M12 6h8M4 12h8M16 12h4M4 18h4M12 18h8"/><circle cx="10" cy="6" r="1.6"/><circle cx="14" cy="12" r="1.6"/><circle cx="10" cy="18" r="1.6"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  var USER_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/><path d="M17 9h5M17 13h5"/></svg>';

  function buildShell() {
    var root = $('[data-aig="root"]');
    if (!root || $('[data-aig="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="aig-hero" data-aig="hero">' +
        '<div class="aig-hero-main">' +
          '<div class="aig-hero-title">' +
            '<span class="aig-hero-ico" aria-hidden="true">' + USER_ICON + '</span>' +
            '<div><h2 class="aig-h2">Centre de pilotage — Intégration des Employés</h2>' +
            '<p class="aig-hero-sub" data-aig="herosub"></p></div>' +
          '</div>' +
          '<div class="aig-hero-actions">' +
            '<button class="aig-btn" data-aig="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="aig-btn" data-aig="btn-charge" title="Charge d\u2019accueil à venir (K)">' + ICO.charge + 'Charge</button>' +
            '<button class="aig-btn" data-aig="btn-seuils" title="Seuils de pilotage (S)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="aig-btn" data-aig="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="aig-btn" data-aig="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="aig-btn aig-btn-primary" data-aig="btn-new" title="Nouvelle intégration (N)">' + ICO.plus + 'Nouvelle intégration</button>' +
          '</div>' +
        '</div>' +
        '<div class="aig-hero-alerts" data-aig="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="aig-kpis" data-aig="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="aig-charts" data-aig="charts">' +
        '<div class="aig-chart-card"><div class="aig-chart-title">Statuts d\u2019intégration</div><div class="aig-donut-wrap" data-aig="donut"></div></div>' +
        '<div class="aig-chart-card"><div class="aig-chart-title">Progression moyenne par département</div><div class="aig-bars" data-aig="bars"></div></div>' +
        '<div class="aig-chart-card"><div class="aig-chart-title">Charge d\u2019accueil par période d\u2019arrivée</div><div class="aig-bars" data-aig="periodes"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="aig-toolbar" data-aig="toolbar">' +
        '<div class="aig-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (employé, poste, département, manager…)" data-aig="search" aria-label="Rechercher une intégration" /></div>' +
        '<select data-aig="f-statut" class="aig-sel" aria-label="Filtrer par statut d\u2019intégration"></select>' +
        '<select data-aig="f-dep" class="aig-sel" aria-label="Filtrer par département"></select>' +
        '<select data-aig="f-prog" class="aig-sel" aria-label="Filtrer par progression"></select>' +
        '<select data-aig="f-date" class="aig-sel" aria-label="Filtrer par date d\u2019arrivée"></select>' +
        '<select data-aig="f-docs" class="aig-sel" aria-label="Filtrer par prérequis manquants"></select>' +
        '<button class="aig-chipbtn" data-aig="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="aig-count" data-aig="count"></span>' +
        '<div class="aig-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="aig-vbtn" data-aig="v-parcours" title="Vue parcours (P)">' + ICO.steps + 'Parcours</button>' +
          '<button class="aig-vbtn" data-aig="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="aig-vbtn" data-aig="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-aig="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-aig="selbar"></div>' +

      /* PIED */
      '<div class="aig-foot">Source de vérité locale (navigateur) — conforme Manuel D1 (intégration &amp; suivi) · journal d\u2019audit actif · seuils configurables · <button class="aig-link" data-aig="btn-native">Afficher le tableau natif</button></div>';

    $('[data-aig="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-aig="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-aig="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'integration-employe'); window.print(); });
    $('[data-aig="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-aig="btn-charge"]', root).addEventListener('click', openCharge);
    $('[data-aig="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-aig="btn-native"]', root).addEventListener('click', showNative);
    $('[data-aig="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-aig="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-aig="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-aig="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aig="f-dep"]', root).addEventListener('change', function (e) { UI.dep = e.target.value; UI.page = 0; refresh(); });
    $('[data-aig="f-prog"]', root).addEventListener('change', function (e) { UI.prog = e.target.value; UI.page = 0; refresh(); });
    $('[data-aig="f-date"]', root).addEventListener('change', function (e) { UI.date = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aig="f-docs"]', root).addEventListener('change', function (e) { UI.docs = e.target.value; UI.page = 0; refresh(); });
    $('[data-aig="v-parcours"]', root).addEventListener('click', function () { setView('parcours'); });
    $('[data-aig="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-aig="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
  }

  function setView(v) { UI.view = v; saveUI(); refresh(); }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var nbDone = rows.filter(function (r) { return r.statutIntegration === 'Terminee'; }).length;
    var nbLate = rows.filter(function (r) { return r.retard; }).length;
    var moy = rows.length ? Math.round(rows.reduce(function (s, r) { return s + r.prog; }, 0) / rows.length) : 0;
    var sub = rows.length + ' intégration' + (rows.length > 1 ? 's' : '') +
      ' · ' + nbDone + ' complète' + (nbDone > 1 ? 's' : '') +
      ' · ' + nbLate + ' en retard' +
      ' · progression moyenne ' + moy + ' %';
    $('[data-aig="herosub"]').textContent = sub;
    var zone = $('[data-aig="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="aig-alert ' + a.tone + '" data-aig="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.aig-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'nodate') UI.date = 'nodate';
        else if (f === 'docs') UI.docs = 'missing';
        else if (f === 'stagn') UI.date = 'stagn';
        else if (f === 'j1') UI.date = 'j1';
        else if (f === 'full') UI.date = 'full';
        else if (f === 'cross') {
          var miss = missingHires();
          refresh();
          if (miss.length) { openDialog(null, { employe: miss[0].name }); return; }
        }
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var nbCours = rows.filter(function (r) { return r.statutIntegration === 'En cours'; }).length;
    var nbDone = rows.filter(function (r) { return r.statutIntegration === 'Terminee'; }).length;
    var nbLate = rows.filter(function (r) { return r.retard; }).length;
    var soon = rows.filter(function (r) { return r.jArr !== null && r.jArr >= 0 && r.jArr <= 30; });
    var next = soon.slice().sort(function (a, b) { return a.arrTs - b.arrTs; })[0];
    var moy = nb ? Math.round(rows.reduce(function (s, r) { return s + r.prog; }, 0) / nb) : 0;
    var deps = {}; var mans = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; if (r.managerAccueil) mans[r.managerAccueil] = 1; });
    var kpis = [
      { k: '', t: 'INTÉGRATIONS', v: String(nb), s: Object.keys(deps).length + ' départements · ' + Object.keys(mans).length + ' managers', cls: '' },
      { k: 'cours', t: 'EN COURS', v: String(nbCours), s: 'dont ' + nbLate + ' en retard', cls: '' },
      { k: 'done', t: 'COMPLÈTES', v: String(nbDone), s: 'taux de complétion ' + pct(nb ? nbDone / nb * 100 : 0), cls: '' },
      { k: 'retard', t: 'EN RETARD', v: String(nbLate), s: 'fin prévue dépassée', cls: nbLate > 0 ? 'bad' : '' },
      { k: 'soon', t: 'ARRIVÉES J-30', v: String(soon.length), s: next ? 'prochaine : ' + next.employe + ' (' + jDelay(next.dateArrivee) + ')' : 'aucune à venir', cls: '' },
      { k: '', t: 'PROGRESSION MOY.', v: moy + ' %', s: 'tous parcours · ' + rows.reduce(function (s, r) { return s + r.done; }, 0) + ' étapes validées', cls: '' }
    ];
    var zone = $('[data-aig="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="aig-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="aig-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="aig-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="aig-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.aig-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.prog = ''; UI.date = ''; UI.docs = ''; UI.mois = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Statuts d\u2019intégration">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">intégrations</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-aig="donut"]');
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statutIntegration === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="aig-donut-legend">' + parts.map(function (p) {
        return '<span class="aig-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="aig-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="aig-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.aig-dl-item', zone).forEach(function (it) {
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
    if (!items.length || mx <= 0) return '<div class="aig-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="aig-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="aig-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="aig-bar-track"><span class="aig-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="aig-bar-val">' + (fmt ? fmt(it.v) : it.v) + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-aig="bars"]');
    var map = {};
    rows.forEach(function (r) { var p = r.departement || '—'; if (!map[p]) map[p] = { key: p, name: p, sum: 0, n: 0 }; map[p].sum += r.prog; map[p].n++; });
    var items = Object.keys(map).map(function (k) {
      return { key: map[k].key, name: map[k].name, v: Math.round(map[k].sum / map[k].n) };
    }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items, function (v) { return v + ' %'; });
    $$('.aig-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.dep = UI.dep === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    var z2 = $('[data-aig="periodes"]');
    var map2 = {};
    rows.forEach(function (r) {
      var mk = monthKey(r.dateArrivee);
      if (!mk) return;
      if (!map2[mk]) map2[mk] = { key: mk, v: 0 };
      map2[mk].v++;
    });
    var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    var items2 = Object.keys(map2).sort().map(function (k) {
      var p = k.split('-');
      return { key: k, name: MOIS[Number(p[1]) - 1] + ' ' + p[0].slice(2), v: map2[k].v };
    });
    z2.innerHTML = barRowsHtml(items2);
    $$('.aig-bar-row', z2).forEach(function (b) {
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
    var deps = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; });
    var sel = $('[data-aig="f-statut"]');
    sel.innerHTML = '<option value="">Statut : tous</option>' + STATUTS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-aig="f-dep"]');
    sel2.innerHTML = '<option value="">Département : tous</option>' + Object.keys(deps).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.dep === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-aig="f-prog"]');
    sel3.innerHTML = '<option value="">Progression : toutes</option>' +
      '<option value="full"' + (UI.prog === 'full' ? ' selected' : '') + '>100 % (parcours complet)</option>' +
      '<option value="p75"' + (UI.prog === 'p75' ? ' selected' : '') + '>≥ 75 % (en fin de parcours)</option>' +
      '<option value="half"' + (UI.prog === 'half' ? ' selected' : '') + '>50–74 %</option>' +
      '<option value="low"' + (UI.prog === 'low' ? ' selected' : '') + '>&lt; 50 % (à relancer)</option>';
    var sel4 = $('[data-aig="f-date"]');
    sel4.innerHTML = '<option value="">Arrivée : toutes</option>' +
      '<option value="in30"' + (UI.date === 'in30' ? ' selected' : '') + '>À venir ≤ 30 j</option>' +
      '<option value="j1"' + (UI.date === 'j1' ? ' selected' : '') + '>Imminentes, pas prêtes (J-' + SEUILS.j1 + ')</option>' +
      '<option value="past"' + (UI.date === 'past' ? ' selected' : '') + '>Déjà arrivées</option>' +
      '<option value="stagn"' + (UI.date === 'stagn' ? ' selected' : '') + '>Stagnantes &gt; ' + SEUILS.stagnation + ' j</option>' +
      '<option value="nodate"' + (UI.date === 'nodate' ? ' selected' : '') + '>Sans date de début</option>' +
      '<option value="full"' + (UI.date === 'full' ? ' selected' : '') + '>Complètes à finaliser</option>';
    var sel5 = $('[data-aig="f-docs"]');
    sel5.innerHTML = '<option value="">Prérequis : tous</option>' +
      '<option value="missing"' + (UI.docs === 'missing' ? ' selected' : '') + '>Documents admin incomplets</option>' +
      '<option value="matos"' + (UI.docs === 'matos' ? ' selected' : '') + '>Matériel / accès non prêts</option>';
    $('[data-aig="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-aig="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' intégrations';
  }

  /* ================= cellules ================= */
  function statutChip(r) {
    var sm = r.stm || statutMeta(r.statutIntegration);
    return '<span class="aig-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function stepChip(r, st) {
    var s = stepState(r, st);
    var v = r[st.f] || '—';
    var cls = s === 'done' ? 'ok' : s === 'wip' ? 'warn' : 'neutral';
    return '<span class="aig-chip ' + cls + '" title="' + esc(st.lab + ' : ' + v) + '">' + esc(v) + '</span>';
  }
  function miniProg(r) {
    var segs = STEPS.map(function (st) {
      var s = stepState(r, st);
      return '<i class="' + (s === 'done' ? 's-d' : s === 'wip' ? 's-w' : 's-t') + '" title="' + esc(st.lab + ' : ' + (r[st.f] || '—')) + '"></i>';
    }).join('');
    return '<span class="aig-prog" aria-hidden="true">' + segs + '</span><span class="aig-prog-pct">' + r.done + '/6 · ' + r.prog + ' %</span>';
  }
  function arrCell(r) {
    if (!r.dateArrivee) return '<span class="aig-chip err" title="Aucune date de début prévue">sans date</span>';
    var txt = esc(r.dateArrivee) + ' <span class="aig-num">(' + esc(jDelay(r.dateArrivee)) + ')</span>';
    if (r.immin) return '<span class="aig-chip warn" title="Premier jour imminent et préparation incomplète">' + txt + ' ⚠</span>';
    return '<span class="aig-arr">' + txt + '</span>';
  }
  function retardCell(r) {
    if (!r.retard) return '<span class="aig-num">' + esc(jDate(r.dateFinIntegration) || '—') + '</span>';
    return '<span class="aig-chip err" title="Fin prévue dépassée de ' + daysSince(r.dateFinIntegration) + ' j">' + esc(jDate(r.dateFinIntegration) || '—') + ' · retard</span>';
  }

  /* ================= table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var nbDone = all.filter(function (r) { return r.statutIntegration === 'Terminee'; }).length;
    var moy = all.length ? Math.round(all.reduce(function (s, r) { return s + r.prog; }, 0) / all.length) : 0;
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = 'none';
      if (key) aria = key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none';
      return '<th ' + (key ? 'data-sort="' + key + '" aria-sort="' + aria + '"' : '') + ' class="' + (cls || '') + '" scope="col">' + label +
        (key && key === sortKey ? '<span class="aig-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'aig-th-chk') + th('N°', 'numero') + th('Employé', 'employe') + th('Poste', 'poste') + th('Département', 'departement') +
      th('Arrivée', 'arrivee') + th('Manager', 'managerAccueil') + th('Parcours', 'prog') + th('Docs', 'docs') + th('Séc.', 'secu') +
      th('Équip.', 'matos') + th('Compte', 'it') + th('Locaux', 'locaux') + th('Métier', 'metier') +
      th('Statut', 'statut') + th('Fin prévue', 'fin') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="aig-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.employe) + '"></td>' +
        '<td class="aig-num">' + esc(r.numero || r.id) + '</td>' +
        '<td><span class="aig-cand" data-open="' + esc(r.id) + '">' + esc(r.employe || '—') + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.poste || '—') + '</td>' +
        '<td>' + (r.departement ? '<span class="aig-chip neutral">' + esc(r.departement) + '</span>' : '—') + '</td>' +
        '<td>' + arrCell(r) + '</td>' +
        '<td>' + esc(r.managerAccueil || '—') + '</td>' +
        '<td>' + miniProg(r) + '</td>' +
        '<td>' + stepChip(r, STEPS[0]) + '</td>' +
        '<td>' + stepChip(r, STEPS[1]) + '</td>' +
        '<td>' + stepChip(r, STEPS[2]) + '</td>' +
        '<td>' + stepChip(r, STEPS[3]) + '</td>' +
        '<td>' + stepChip(r, STEPS[4]) + '</td>' +
        '<td>' + stepChip(r, STEPS[5]) + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td>' + retardCell(r) + '</td>' +
        '<td><div class="aig-actions">' +
          '<button class="aig-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aig-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aig-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aig-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="aig-tfoot"><td></td><td colspan="15">TOTAL ' + all.length + ' intégrations · ' + nbDone + ' complète(s) · progression moyenne ' + moy + ' %</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="aig-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="aig-sel" data-aig="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="aig-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="aig-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-aig="content"]');
    card.innerHTML = '<div class="aig-tblcard"><div class="aig-tblwrap"><table class="aig-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="16"><div class="aig-empty">Aucune intégration ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'employe' || k === 'numero' || k === 'poste' || k === 'departement' ? 1 : -1; }
        refresh();
      });
    });
    bindRowActions(card);
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-aig="per"]', card);
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
    $$('[data-edit]', scope).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit'), null); }); });
    $$('[data-dup]', scope).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', scope).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-aig="content"]');
    card.innerHTML = rows.length ? '<div class="aig-cards">' + rows.map(function (r) {
      return '<div class="aig-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="aig-card-top"><div><input type="checkbox" class="aig-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="aig-num">' + esc(r.numero || r.id) + '</span></div>' +
        statutChip(r) + '</div>' +
        '<div class="aig-card-name" data-open="' + esc(r.id) + '">' + esc(r.employe || '—') + '</div>' +
        '<div class="aig-card-poste" style="font-size:.95rem">' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div>' +
        '<div class="aig-card-prog">' + miniProg(r) + '</div>' +
        '<div class="aig-card-segs">' + STEPS.map(function (st) {
          var s = stepState(r, st);
          return '<button class="aig-segbtn ' + (s === 'done' ? 's-d' : s === 'wip' ? 's-w' : 's-t') + '" data-step="' + esc(r.id) + '|' + esc(st.k) + '" title="' + esc(st.lab + ' : ' + (r[st.f] || '—')) + '">' + esc(st.short) + '</button>';
        }).join('') + '</div>' +
        '<div class="aig-card-meta">' + arrCell(r) + (r.managerAccueil ? '<span class="aig-chip info">' + esc(r.managerAccueil) + '</span>' : '') + '</div>' +
        '<div class="aig-card-foot"><span class="aig-num">Fin prévue : ' + esc(jDate(r.dateFinIntegration) || '—') + '</span>' +
        '<div class="aig-card-act">' +
          '<button class="aig-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aig-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aig-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aig-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="aig-empty">Aucune intégration ne correspond aux filtres</div>';
    bindRowActions(card);
    $$('[data-step]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = (b.getAttribute('data-step') || '').split('|');
        if (p.length === 2) openDrawer(p[0], p[1]);
      });
    });
  }

  /* ================= VUE PARCOURS (signature de la page) =========
     Un rangé = un employé ; la barre segmentée = ses 6 étapes dans
     l'ordre du parcours d'arrivée. Chaque segment est cliquable et
     ouvre la fiche directement à l'étape visée. */
  function renderParcours() {
    var rows = filtered();
    var card = $('[data-aig="content"]');
    var legend = '<div class="aig-pc-legend">' +
      '<span><i class="aig-leg s-d"></i>étape validée</span>' +
      '<span><i class="aig-leg s-w"></i>en cours / planifiée</span>' +
      '<span><i class="aig-leg s-t"></i>à démarrer</span>' +
      '<span class="aig-pc-hint">Cliquez une étape pour ouvrir la fiche à cet endroit — cliquez le nom pour le parcours complet.</span>' +
      '</div>';
    var head = '<div class="aig-pc-head">' +
      '<span class="aig-pc-id">Employé</span>' +
      STEPS.map(function (st) { return '<span class="aig-pc-st" title="' + esc(st.lab) + '">' + esc(st.short) + '</span>'; }).join('') +
      '<span class="aig-pc-end">Statut</span></div>';
    var body = rows.map(function (r) {
      var badges = '';
      if (r.retard) badges += '<span class="aig-chip err" title="Fin prévue dépassée">retard</span> ';
      if (r.stagn) badges += '<span class="aig-chip warn" title="Arrivée il y a plus de ' + SEUILS.stagnation + ' j sans complétion">stagnante</span> ';
      if (r.immin) badges += '<span class="aig-chip warn" title="Premier jour imminent, préparation incomplète">J-1 ⚠</span> ';
      if (r.parcoursFait) badges += '<span class="aig-chip info" title="Étapes toutes validées, statut à finaliser">à clôturer</span> ';
      return '<div class="aig-pcrow' + (r.retard ? ' late' : '') + '" data-id="' + esc(r.id) + '">' +
        '<div class="aig-pc-id">' +
          '<span class="aig-pc-name" data-open="' + esc(r.id) + '">' + esc(r.employe || '—') + '</span>' +
          '<span class="aig-num">' + esc(r.numero || r.id) + ' · ' + esc(r.poste || '—') + '</span>' +
          '<span class="aig-num">' + esc(r.departement || '—') + ' · arrivée ' + esc(r.dateArrivee ? r.dateArrivee + ' (' + jDelay(r.dateArrivee) + ')' : 'non planifiée') + '</span>' +
          (badges ? '<span class="aig-pc-badges">' + badges + '</span>' : '') +
        '</div>' +
        '<div class="aig-pc-steps" role="group" aria-label="Étapes du parcours de ' + esc(r.employe || '') + '">' +
          STEPS.map(function (st, i) {
            var s = stepState(r, st);
            return '<button class="aig-pstep ' + (s === 'done' ? 's-d' : s === 'wip' ? 's-w' : 's-t') + (i < STEPS.length - 1 ? ' arrow' : '') + '" ' +
              'data-step="' + esc(r.id) + '|' + esc(st.k) + '" title="' + esc(st.lab + ' : ' + (r[st.f] || '—')) + '" aria-label="' + esc(st.lab + ' : ' + (r[st.f] || '—')) + '">' +
              '<span class="aig-pstep-l">' + esc(st.short) + '</span><span class="aig-pstep-v">' + esc(r[st.f] || '—') + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="aig-pc-end"><div class="aig-pc-prog">' + miniProg(r) + '</div>' + statutChip(r) + '</div>' +
      '</div>';
    }).join('');
    card.innerHTML = '<div class="aig-pccard">' + legend + head +
      (body || '<div class="aig-empty">Aucune intégration ne correspond aux filtres</div>') + '</div>';
    bindRowActions(card);
    $$('[data-step]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = (b.getAttribute('data-step') || '').split('|');
        if (p.length === 2) openDrawer(p[0], p[1]);
      });
    });
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-aig="selbar"]');
    if (!zone) return;
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    var rows = UI.sel.map(function (id) { return rowById(id); }).filter(Boolean);
    zone.innerHTML = '<div class="aig-selbar">' +
      '<span class="aig-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="aig-selbar-sub">progression moyenne ' + (rows.length ? Math.round(rows.reduce(function (s, r) { return s + r.prog; }, 0) / rows.length) : 0) + ' %</span>' +
      '<button class="aig-btn aig-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="aig-btn aig-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="aig-btn aig-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer fiche parcours =================
     Leçon M26 : aucun handler ne se referme sur un snapshot —
     chaque mutation relit les données fraîches via mutate(cur). */
  function closeDrawer() { $$('[data-aig="drawer"],[data-aig="backdrop"][data-aig-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id, stepKey) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'aig-backdrop', 'data-aig': 'backdrop', 'data-aig-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var stm = r.stm;
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var warnBlock = '';
    if (r.retard) warnBlock += '<div class="aig-warnblock">⚠ Fin prévue dépassée de ' + daysSince(r.dateFinIntegration) + ' j — clôturer ou prolonger l\u2019intégration.</div>';
    if (r.stagn) warnBlock += '<div class="aig-warnblock">⚠ Parcours stagnante : arrivée il y a ' + daysSince(r.dateArrivee) + ' j, ' + r.done + '/6 étapes validées.</div>';
    if (r.immin) warnBlock += '<div class="aig-warnblock">⚠ Premier jour ' + esc(jDelay(r.dateArrivee)) + ' — préparation incomplète (documents, badge ou compte).</div>';
    var stepsHtml = STEPS.map(function (st) {
      var s = stepState(r, st);
      return '<div class="aig-steprow" data-aig="step-' + esc(st.k) + '">' +
        '<input type="checkbox" class="aig-chk" data-stchk="' + esc(st.k) + '"' + (s === 'done' ? ' checked' : '') + ' aria-label="' + esc(st.lab) + ' validée">' +
        '<div class="aig-steprow-mid"><span class="aig-steprow-l">' + esc(st.lab) + '</span>' +
          '<span class="aig-steprow-v">' + esc(r[st.f] || '—') + '</span></div>' +
        '<select class="aig-in aig-steprow-sel" data-stsel="' + esc(st.k) + '" aria-label="Valeur de l\u2019étape ' + esc(st.lab) + '">' +
          st.vals.map(function (vv) { return '<option value="' + esc(vv) + '"' + (vv === r[st.f] ? ' selected' : '') + '>' + esc(vv) + '</option>'; }).join('') +
        '</select></div>';
    }).join('');
    var dr = h('aside', { class: 'aig-drawer', 'data-aig': 'drawer', role: 'dialog', 'aria-label': 'Fiche intégration ' + (r.numero || r.id) });
    dr.innerHTML =
      '<div class="aig-drawer-head"><div><div class="aig-drawer-title">' + esc(r.employe || '—') + '</div>' +
      '<div class="aig-drawer-sub">' + esc(r.numero || r.id) + ' · ' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div></div>' +
      '<button class="aig-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aig-drawer-body">' +
        '<div class="aig-live" style="margin-top:0"><span>Statut <b style="color:' + stm.c + '">' + esc(stm.lab) + '</b></span>' +
          '<span>Parcours <b>' + r.done + '/6 · ' + r.prog + ' %</b></span>' +
          '<span>Arrivée <b>' + esc(r.dateArrivee ? jDelay(r.dateArrivee) : '—') + '</b></span>' +
          '<span>Fin prévue <b>' + esc(jDate(r.dateFinIntegration) || '—') + '</b></span></div>' +
        warnBlock +
        '<div class="aig-fsec">Parcours d\u2019intégration — étapes cochables</div>' +
        '<div class="aig-steps">' + stepsHtml + '</div>' +
        '<div class="aig-fsec">Dates & accueil</div>' +
        '<dl class="aig-kv">' +
          kv('Date d\u2019arrivée', esc(jDate(r.dateArrivee) || '—') + (r.jArr !== null ? ' <span class="aig-num">(' + esc(jDelay(r.dateArrivee)) + ')</span>' : '')) +
          kv('Fin d\u2019intégration', esc(jDate(r.dateFinIntegration) || '—')) +
          kv('Manager d\u2019accueil', esc(r.managerAccueil || '—')) +
          kv('Poste', esc(r.poste || '—')) +
          kv('Département', esc(r.departement || '—')) +
        '</dl>' +
        '<div class="aig-fsec">Statut</div>' +
        '<div class="aig-sim-row" style="margin-bottom:10px"><label for="aig-stsel">Statut de l\u2019intégration</label>' +
          '<select id="aig-stsel" class="aig-in" data-aig="stsel">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statutIntegration ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="aig-fsec">Notes</div>' +
        '<textarea class="aig-notebox" data-aig="note" placeholder="Points d\u2019attention, accueil, documents restants…">' + esc(r.notes || '') + '</textarea>' +
        '<div class="aig-drawer-actions">' +
          '<button class="aig-btn aig-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="aig-btn aig-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="aig-btn aig-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="aig-btn aig-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.aig-drawer-x', dr).addEventListener('click', closeDrawer);
    /* étapes cochables : coche = valeur « fait », décoche = valeur « à démarrer » ; le select affine (En cours / Planifiée…) */
    $$('[data-stchk]', dr).forEach(function (cb) {
      cb.addEventListener('change', function () {
        var st = stepByk(cb.getAttribute('data-stchk'));
        if (!st) return;
        var nv = cb.checked ? st.doneVal : st.idle;
        mutate(function (cur) {
          cur.integrations = cur.integrations.map(function (x) { if (String(x.id) === String(id)) x[st.f] = nv; return x; });
          return cur;
        }, cb.checked ? 'Étape validée' : 'Étape réouverte', (r.numero || r.id) + ' · ' + st.lab + ' → ' + nv);
        toast(st.lab + ' : ' + nv, cb.checked ? 'ok' : '');
        reopenDrawerAt(id, st.k);
      });
    });
    $$('[data-stsel]', dr).forEach(function (sel) {
      sel.addEventListener('change', function () {
        var st = stepByk(sel.getAttribute('data-stsel'));
        if (!st) return;
        var nv = sel.value;
        mutate(function (cur) {
          cur.integrations = cur.integrations.map(function (x) { if (String(x.id) === String(id)) x[st.f] = nv; return x; });
          return cur;
        }, 'Étape mise à jour', (r.numero || r.id) + ' · ' + st.lab + ' → ' + nv);
        toast(st.lab + ' : ' + nv, 'ok');
        reopenDrawerAt(id, st.k);
      });
    });
    $('[data-aig="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statutIntegration) return;
      mutate(function (cur) {
        cur.integrations = cur.integrations.map(function (x) { if (String(x.id) === String(id)) x.statutIntegration = nv; return x; });
        return cur;
      }, 'Statut modifié', (r.numero || r.id) + ' → ' + statutMeta(nv).lab);
      toast('Statut : ' + statutMeta(nv).lab, 'ok');
      reopenDrawerAt(id, stepKey);
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-aig="note"]', dr).value;
      mutate(function (cur) {
        cur.integrations = cur.integrations.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.numero || r.id);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    if (stepKey) {
      var tgt = $('[data-aig="step-' + stepKey + '"]', dr);
      if (tgt) { tgt.classList.add('hl'); try { tgt.scrollIntoView({ block: 'center' }); } catch (e) {} }
    }
    jlog('Ouverture fiche', r.numero || r.id);
  }
  function reopenDrawerAt(id, stepKey) {
    if (UI.drawerId !== null && String(UI.drawerId) === String(id)) openDrawer(id, stepKey);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-aig="dialog"],[data-aig="backdrop"][data-aig-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
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
    var bd = h('div', { class: 'aig-backdrop', 'data-aig': 'backdrop', 'data-aig-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'aig-dialog', 'data-aig': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une intégration' : 'Nouvelle intégration' });
    function opts(list, cur) {
      return '<option value=""></option>' + list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = typeof x === 'object' ? x.lab : x;
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    var depsDatalist = '<datalist id="aig-deps">' + Object.keys(rows.reduce(function (m, x) { if (x.departement) m[x.departement] = 1; return m; }, {})).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    var mansDatalist = '<datalist id="aig-mans">' + Object.keys(rows.reduce(function (m, x) { if (x.managerAccueil) m[x.managerAccueil] = 1; return m; }, {})).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    dlg.innerHTML =
      '<div class="aig-dialog-head"><h3>' + (r ? 'Modifier l\u2019intégration ' + esc(r.numero || r.id) : 'Nouvelle intégration') + '</h3>' +
      '<button class="aig-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aig-dialog-body">' +
        '<div class="aig-fgrid">' +
          '<label class="aig-lab">Employé *<input class="aig-in" data-f="employe" value="' + esc(v('employe')) + '" placeholder="Ex. Nkoulou Amina"></label>' +
          '<label class="aig-lab">Poste *<input class="aig-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="aig-lab">Département *<input class="aig-in" data-f="departement" list="aig-deps" value="' + esc(v('departement')) + '" placeholder="Ex. Restauration"></label>' +
          '<label class="aig-lab">Manager d\u2019accueil *<input class="aig-in" data-f="managerAccueil" list="aig-mans" value="' + esc(v('managerAccueil')) + '" placeholder="Ex. M. Nkoulou Paul"></label>' +
          '<label class="aig-lab">Date d\u2019arrivée * (jj/mm/aaaa)<input class="aig-in" data-f="dateArrivee" value="' + esc(jDate(v('dateArrivee'))) + '" placeholder="jj/mm/aaaa" inputmode="numeric"></label>' +
          '<label class="aig-lab">Fin d\u2019intégration (jj/mm/aaaa)<input class="aig-in" data-f="dateFinIntegration" value="' + esc(jDate(v('dateFinIntegration'))) + '" placeholder="jj/mm/aaaa" inputmode="numeric"></label>' +
          '<label class="aig-lab">Statut intégration<select class="aig-in" data-f="statutIntegration">' + opts(STATUTS, v('statutIntegration') || 'En cours') + '</select></label>' +
          '<label class="aig-lab">Documents administratifs<select class="aig-in" data-f="docsAdmin">' + opts(DOCS_VALS, v('docsAdmin') || 'Non') + '</select></label>' +
          '<label class="aig-lab">Formation sécurité<select class="aig-in" data-f="formationSecurite">' + opts(['Oui', 'Planifiée', 'Non'], v('formationSecurite') || 'Non') + '</select></label>' +
          '<label class="aig-lab">Équipement & badge<select class="aig-in" data-f="equipementBadge">' + opts(DOCS_VALS, v('equipementBadge') || 'Non') + '</select></label>' +
          '<label class="aig-lab">Compte informatique<select class="aig-in" data-f="compteInfo">' + opts(DOCS_VALS, v('compteInfo') || 'Non') + '</select></label>' +
          '<label class="aig-lab">Visite des locaux<select class="aig-in" data-f="visiteLocaux">' + opts(['Fait', 'Non fait'], v('visiteLocaux') || 'Non fait') + '</select></label>' +
          '<label class="aig-lab">Formation métier<select class="aig-in" data-f="formationMetier">' + opts(['Terminée', 'En cours', 'Planifiée'], v('formationMetier') || 'Planifiée') + '</select></label>' +
          '<label class="aig-lab full">Notes<textarea class="aig-in aig-ta" data-f="notes" placeholder="Précisions sur le parcours, le matériel, l\u2019accueil…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' + depsDatalist + mansDatalist +
        '<div class="aig-live" data-aig="dlg-live"></div>' +
        '<div data-aig="dlg-err"></div>' +
      '</div>' +
      '<div class="aig-dialog-foot"><span class="aig-form-hint">Rien ne doit se perdre entre l\u2019offre acceptée et le premier jour · dates au format jj/mm/aaaa</span>' +
      '<span style="display:flex;gap:8px"><button class="aig-btn aig-btn-ghost" data-act="cancel" style="color:var(--aig-text);border-color:var(--aig-line)">Annuler</button>' +
      '<button class="aig-btn aig-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer l\u2019intégration') + '</button></span></div>';
    $('.aig-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var est = STEPS.filter(function (st) { return val[st.f] === st.doneVal; }).length;
      var arrOk = validDateStr(val.dateArrivee);
      var j = arrOk ? daysUntil(val.dateArrivee) : null;
      var finOk = !String(val.dateFinIntegration || '').trim() || validDateStr(val.dateFinIntegration);
      $('[data-aig="dlg-live"]', dlg).innerHTML =
        '<span>Parcours estimé <b>' + est + '/6 · ' + Math.round(est / STEPS.length * 100) + ' %</b></span>' +
        '<span>Statut <b>' + esc(val.statutIntegration ? statutMeta(val.statutIntegration).lab : '—') + '</b></span>' +
        '<span>Arrivée <b>' + (arrOk ? esc(jDelay(val.dateArrivee)) : 'date invalide') + '</b></span>' +
        (!finOk ? '<span class="bad">⚠ Fin d\u2019intégration invalide</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-aig="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="aig-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.employe || '').trim()) return fail('Le nom de l\u2019employé est obligatoire.');
      if (!String(val.poste || '').trim()) return fail('Le poste est obligatoire.');
      if (!String(val.departement || '').trim()) return fail('Le département est obligatoire.');
      if (!String(val.managerAccueil || '').trim()) return fail('Le manager d\u2019accueil est obligatoire.');
      if (!validDateStr(val.dateArrivee)) return fail('La date d\u2019arrivée est obligatoire et doit être une date réelle au format jj/mm/aaaa.');
      if (String(val.dateFinIntegration || '').trim() && !validDateStr(val.dateFinIntegration)) return fail('La fin d\u2019intégration doit être une date réelle au format jj/mm/aaaa.');
      if (validDateStr(val.dateArrivee) && validDateStr(val.dateFinIntegration) && dateKey(val.dateFinIntegration) < dateKey(val.dateArrivee)) return fail('La fin d\u2019intégration ne peut pas précéder la date d\u2019arrivée.');
      var rec = {
        employe: String(val.employe).trim(),
        poste: String(val.poste).trim(),
        departement: String(val.departement).trim(),
        managerAccueil: String(val.managerAccueil).trim(),
        dateArrivee: String(val.dateArrivee).trim(),
        dateFinIntegration: String(val.dateFinIntegration || '').trim(),
        statutIntegration: String(val.statutIntegration || '').trim() || 'En cours',
        docsAdmin: String(val.docsAdmin || '').trim() || 'Non',
        formationSecurite: String(val.formationSecurite || '').trim() || 'Non',
        equipementBadge: String(val.equipementBadge || '').trim() || 'Non',
        compteInfo: String(val.compteInfo || '').trim() || 'Non',
        visiteLocaux: String(val.visiteLocaux || '').trim() || 'Non fait',
        formationMetier: String(val.formationMetier || '').trim() || 'Planifiée',
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.integrations = cur.integrations.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Intégration modifiée', rec.employe);
        toast('Intégration mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var mx = cur.integrations.reduce(function (m, x) {
            var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n);
            var m2 = /^INT-(\d+)$/.exec(String(x.numero || ''));
            if (m2) m = Math.max(m, Number(m2[1]));
            return m;
          }, 0) + 1;
          var cp = {};
          for (var k2 in rec) cp[k2] = rec[k2];
          cp.id = mx;
          cp.numero = 'INT-' + String(mx).padStart(3, '0');
          cur.integrations = cur.integrations.concat([cp]);
          return cur;
        }, 'Intégration créée', rec.employe);
        toast('Intégration créée — ' + rec.employe, 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="employe"]', dlg);
    if (first) first.focus();
  }

  /* ================= duplication / suppression ================= */
  function dupRow(id) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      var mx = cur.integrations.reduce(function (m, x) {
        var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n);
        var m2 = /^INT-(\d+)$/.exec(String(x.numero || ''));
        if (m2) m = Math.max(m, Number(m2[1]));
        return m;
      }, 0) + 1;
      var cp = {};
      for (var k in r) if (['done', 'prog', 'stm', 'arrTs', 'finTs', 'jArr', 'retard', 'stagn', 'immin', 'parcoursFait'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = mx;
      cp.numero = 'INT-' + String(mx).padStart(3, '0');
      /* progression & validations réinitialisées : un parcours se rejoue à zéro */
      cp.docsAdmin = 'Non';
      cp.formationSecurite = 'Non';
      cp.equipementBadge = 'Non';
      cp.compteInfo = 'Non';
      cp.visiteLocaux = 'Non fait';
      cp.formationMetier = 'Planifiée';
      cp.statutIntegration = 'En cours';
      cp.dateFinIntegration = '';
      cp.notes = '';
      cur.integrations = cur.integrations.concat([cp]);
      return cur;
    }, 'Intégration dupliquée', r.numero || r.id);
    toast('Intégration dupliquée (progression réinitialisée)', 'ok');
  }
  function closeConfirm() { $$('[data-aig="confirm"],[data-aig="backdrop"][data-aig-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'aig-backdrop', 'data-aig': 'backdrop', 'data-aig-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aig-confirm', 'data-aig': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette intégration ?</h4><p>' + esc(r.numero || r.id) + ' — ' + esc(r.employe || '—') + ' (' + esc(r.poste || '—') + '). Le suivi du parcours sera perdu. Cette action est définitive.</p>' +
      '<div class="aig-confirm-row"><button class="aig-btn aig-btn-ghost" data-a="no" style="color:var(--aig-text);border-color:var(--aig-line)">Annuler</button>' +
      '<button class="aig-btn aig-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.integrations = cur.integrations.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Intégration supprimée', r.numero || r.id);
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Intégration supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' intégrations ?') : 'Supprimer 1 intégration ?';
    var bd = h('div', { class: 'aig-backdrop', 'data-aig': 'backdrop', 'data-aig-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aig-confirm', 'data-aig': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero || r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="aig-confirm-row"><button class="aig-btn aig-btn-ghost" data-a="no" style="color:var(--aig-text);border-color:var(--aig-line)">Annuler</button>' +
      '<button class="aig-btn aig-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.integrations = cur.integrations.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' intégrations');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' intégrations supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= charge d'accueil (K) =================
     « Rien ne doit se perdre entre l'acceptation de l'offre et le
     premier jour » : qui arrive, quand, et est-ce prêt ? */
  function closeCharge() { $$('[data-aig="charge"],[data-aig="backdrop"][data-aig-for="charge"]').forEach(function (n) { n.remove(); }); }
  function openCharge() {
    closeCharge();
    var rows = data();
    var up = rows.filter(function (r) { return r.jArr !== null && r.jArr >= -1; }).sort(function (a, b) { return a.arrTs - b.arrTs; });
    var bd = h('div', { class: 'aig-backdrop', 'data-aig': 'backdrop', 'data-aig-for': 'charge' });
    bd.addEventListener('click', closeCharge);
    var p = h('div', { class: 'aig-panel', 'data-aig': 'charge', role: 'dialog', 'aria-label': 'Charge d\u2019accueil à venir' });
    var list = up.slice(0, 12).map(function (r) {
      var miss = [];
      if (r.docsAdmin !== 'Oui') miss.push('documents');
      if (r.formationSecurite !== 'Oui') miss.push('sécurité');
      if (r.equipementBadge !== 'Oui') miss.push('badge');
      if (r.compteInfo !== 'Oui') miss.push('compte');
      if (r.visiteLocaux !== 'Fait') miss.push('locaux');
      if (r.formationMetier === 'Planifiée') miss.push('formation');
      return '<div class="aig-chg-row' + (miss.length && r.jArr <= SEUILS.j1 ? ' hot' : '') + '">' +
        '<span class="aig-chg-when">' + esc(r.dateArrivee || '—') + ' <b>(' + esc(jDelay(r.dateArrivee)) + ')</b></span>' +
        '<span class="aig-chg-who"><b>' + esc(r.employe || '—') + '</b> · ' + esc(r.poste || '—') + '</span>' +
        '<span class="aig-chg-what">' + (miss.length ? 'à préparer : ' + esc(miss.join(', ')) : '<span class="aig-chip ok">parcours prêt</span>') + '</span>' +
        '<button class="aig-ic" data-open="' + esc(r.id) + '" title="Ouvrir la fiche">' + ICO.eye + '</button></div>';
    }).join('');
    var tip = up.length
      ? '💡 ' + up.length + ' arrivée' + (up.length > 1 ? 's' : '') + ' à préparer · prochaine : ' + up[0].employe + ' ' + jDelay(up[0].dateArrivee) + '.'
      : '💡 Aucune arrivée planifiée — la charge d\u2019accueil est au vert.';
    p.innerHTML = '<div class="aig-panel-head"><h3>Charge d\u2019accueil à venir</h3><button class="aig-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aig-panel-body">' +
        '<div class="aig-sim-kpis"><span><b>' + up.length + '</b> arrivée(s) planifiée(s)</span>' +
          '<span><b>' + up.filter(function (r) { return r.jArr <= SEUILS.j1; }).length + '</b> à ' + SEUILS.j1 + ' j ou moins</span></div>' +
        (list || '<div class="aig-empty">Aucune arrivée à venir enregistrée.</div>') +
        '<div class="aig-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' +
      '</div>';
    $('.aig-drawer-x', p).addEventListener('click', closeCharge);
    $$('[data-open]', p).forEach(function (b) {
      b.addEventListener('click', function () { closeCharge(); openDrawer(b.getAttribute('data-open'), null); });
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Charge d\u2019accueil ouverte', up.length + ' arrivée(s)');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-aig="seuils"],[data-aig="backdrop"][data-aig-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'aig-backdrop', 'data-aig': 'backdrop', 'data-aig-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'aig-panel', 'data-aig': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="aig-panel-head"><h3>Seuils de pilotage</h3><button class="aig-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aig-panel-body">' +
        '<p class="aig-cibles-note">Ces seuils alimentent les alertes « stagnation », « premier jour imminent » et « en retard » — réglez-les selon la durée réelle de vos parcours d\u2019intégration.</p>' +
        '<div class="aig-sim-row"><label for="aig-s1">Stagnation sans complétion (jours après arrivée)</label><input type="range" id="aig-s1" min="15" max="120" step="1" value="' + SEUILS.stagnation + '"><input class="aig-in" type="number" min="15" max="120" step="1" data-aig="s1n" value="' + SEUILS.stagnation + '"></div>' +
        '<div class="aig-sim-row"><label for="aig-s2">Alerte « premier jour » (jours avant l\u2019arrivée)</label><input type="range" id="aig-s2" min="1" max="30" step="1" value="' + SEUILS.j1 + '"><input class="aig-in" type="number" min="1" max="30" step="1" data-aig="s2n" value="' + SEUILS.j1 + '"></div>' +
        '<div class="aig-sim-row"><label for="aig-s3">Tolérance de retard (jours après la fin prévue)</label><input type="range" id="aig-s3" min="0" max="60" step="1" value="' + SEUILS.retard + '"><input class="aig-in" type="number" min="0" max="60" step="1" data-aig="s3n" value="' + SEUILS.retard + '"></div>' +
        '<div class="aig-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="aig-btn aig-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.aig-drawer-x', p).addEventListener('click', closeSeuils);
    [['aig-s1', 's1n', 'stagnation', 15, 120, 1], ['aig-s2', 's2n', 'j1', 1, 30, 1], ['aig-s3', 's3n', 'retard', 0, 60, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-aig="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.stagnation = Math.max(15, Math.min(120, Number($('[data-aig="s1n"]', p).value) || SEUILS.stagnation));
      SEUILS.j1 = Math.max(1, Math.min(30, Number($('[data-aig="s2n"]', p).value) || SEUILS.j1));
      SEUILS.retard = Math.max(0, Math.min(60, Number($('[data-aig="s3n"]', p).value) || SEUILS.retard));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'stagnation ' + SEUILS.stagnation + ' j · alerte J-' + SEUILS.j1 + ' · tolérance retard ' + SEUILS.retard + ' j');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-aig="journal"],[data-aig="backdrop"][data-aig-for="journal"]').forEach(function (n) { n.remove(); }); }
  function journalRows() {
    var out = [];
    var seen = {};
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.read === 'function') {
        (window.__ADMINA_AUDIT__.read() || []).forEach(function (x) {
          var k = (x.time || 0) + '|' + (x.action || '') + '|' + (x.detail || '');
          if (!seen[k]) { seen[k] = 1; out.push(x); }
        });
      }
    } catch (e) {}
    try {
      JSON.parse(localStorage.getItem(LS_J) || '[]').forEach(function (x) {
        var k = (x.time || 0) + '|' + (x.action || '') + '|' + (x.detail || '');
        if (!seen[k]) { seen[k] = 1; out.push(x); }
      });
    } catch (e2) {}
    out.sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
    return out;
  }
  function openJournal() {
    closeJournal();
    var bd = h('div', { class: 'aig-backdrop', 'data-aig': 'backdrop', 'data-aig-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'aig-panel', 'data-aig': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="aig-panel-head"><h3>Journal d\u2019activité</h3><button class="aig-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aig-panel-body" data-aig="jlist"></div>';
    $('.aig-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-aig="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="aig-jrow"><span class="aig-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="aig-jact">' + esc(x.action || '') + '</span><span class="aig-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="aig-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Intégration', 'Employé', 'Poste', 'Département', 'Date arrivée', 'Délai arrivée', 'Manager accueil', 'Documents admin', 'Formation sécurité', 'Équipement & badge', 'Compte informatique', 'Visite locaux', 'Formation métier', 'Étapes validées', 'Progression %', 'Statut intégration', 'Fin prévue', 'En retard', 'Notes'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero || r.id, r.employe, r.poste, r.departement, jDate(r.dateArrivee), r.jArr === null ? '' : jDelay(r.dateArrivee), r.managerAccueil, r.docsAdmin, r.formationSecurite, r.equipementBadge, r.compteInfo, r.visiteLocaux, r.formationMetier, r.done + '/6', r.prog, r.statutIntegration, jDate(r.dateFinIntegration), r.retard ? 'oui' : '', r.notes];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-integration-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeCharge(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-aig="dialog"]') || $('[data-aig="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { setView('parcours'); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { setView('cards'); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { setView('table'); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { openCharge(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-aig="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle intégration · E export · J journal · P parcours · C cartes · T tableau · S seuils · K charge d\u2019accueil · / recherche', ''); }
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
    var root = $('[data-aig="root"]');
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
    else renderParcours();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-aig="drawer"],[data-aig="dialog"],[data-aig="confirm"],[data-aig="journal"],[data-aig="charge"],[data-aig="seuils"]')) {
      $$('[data-aig="backdrop"]').forEach(function (b) { b.remove(); });
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
      return; /* ni API ni LS après 30 essais : laisser la page native intacte */
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
    html.classList.add('admina-aig');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-aig]')) continue;
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
    html.classList.remove('admina-aig');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeCharge(); closeSeuils();
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
    var root = $('[data-aig="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-aig-hide', '1');
      natif.setAttribute('data-aig-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) refresh();
  }

  /* démarrage : réessais 30 × 450 ms (relit l'API à chaque essai), sinon page native intacte */
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

  window.__ADMINA_IGR_UI__ = {
    version: '1.0-w2',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openCharge: openCharge,
    openJournal: openJournal,
    openSeuils: openSeuils,
    setView: setView,
    exportCSV: exportCSV,
    debug: { filtered: filtered, alerts: computeAlerts, steps: STEPS, progress: progressOf, missingHires: missingHires, nextNumero: nextNumero, seuils: SEUILS }
  };
  try { console.info('[ADMINA_IGR] W2-a actif — Centre de pilotage Intégration des Employés /integration-employe'); } catch (e) {}
})();
