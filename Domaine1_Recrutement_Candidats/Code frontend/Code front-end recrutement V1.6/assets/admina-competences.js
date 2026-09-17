/* =============================================================
   Admina-RH — Compétences des Candidats — couche admina (W3-d)
   Scope : /competences · préfixe acp- · flag __ADMINA_CPT_W3__
   ---------------------------------------------------------------
   PHILOSOPHIE DE LA PAGE (posée avant toute conception) :
   /competences = LA MATRICE DE TALENTS. Recruter vite, c'est
   savoir qui sait quoi. La matrice révèle ce qu'aucun CV ne
   montre : la RARETÉ (une compétence détenue par un seul expert
   est un risque), les DOUBLONS, les COMBINAISONS rares, les
   experts sous-exploités. Niveau × années d'expérience × catégorie
   font passer la compétence d'une étiquette à une mesure. La page
   ne juge pas les gens : elle mesure le portefeuille de
   savoir-faire de l'entreprise et son exposition au risque de
   départ.
   ---------------------------------------------------------------
   VUE SIGNATURE : « MATRICE DES TALENTS » — une rangée par
   compétence DISTINCTE : barre empilée des niveaux (Expert /
   Avancé / Intermédiaire / Débutant, couleurs distinctes),
   compteur d'experts, années moyennes, badge RARE si détenteurs
   ≤ seuil, cliquable → filtre compétence ; tri par défaut =
   rareté croissante (les plus rares en premier) ; toggle de tri
   rareté / alpha.
   - Héro calculé (X compétences · Y experts · Z candidats ·
     N compétences rares) + sous-ligne catégories & années moyennes
   - 5 alertes AAA cliquables → filtres (+ croisement optionnel
     __ADMINA_CAND_API__ « candidats sans compétence », silencieux)
   - 6 KPI (dont 4 filtrent) + 3 graphiques SVG vanilla cliquables
     (donut catégories, top compétences par détenteurs, histogramme
     années 0-2 / 3-5 / 6-9 / 10+)
   - Recherche + filtres (niveau, catégorie, années min) +
     Réinitialiser · table triable aria-sort · vue cartes ·
     VUE MATRICE · drawer fiche (portrait de profil : toutes les
     compétences du même candidat, niveau éditable rapide en
     segmented, alertes inline, historique admina_journal) ·
     dialog création/édition VALIDÉ (candidat, compétence, niveau,
     catégorie obligatoires ; années 0-50 ; aperçu live de rareté) ·
     duplication (id max+1) · suppression simple & groupée
     confirmée · seuils configurables (rareté 1-3 détenteurs,
     expert min années 5-15) · export CSV 7 colonnes · journal
     admina_journal {role:'RH'} + délégation __ADMINA_AUDIT__ ·
     raccourcis N/E/J/P/C/S/K/T + / + ? · dark mode auto ·
     burger mobile <820px · garde-fous 390px (0 débordement)
   - Données : window.__ADMINA_CPT_API__ (chunk DÉJÀ patché par
     l'orchestrateur — AUCUN re-patch ici) → fallback localStorage
     admina-competences-data → snapshot démo · résilience :
     30 réessais (450 ms) au démarrage, sinon page native intacte ·
     écriture : API sinon fallback LS direct · pont bidirectionnel
     (subscribe + poller 1,2 s) — la vue native reflète les
     mutations du module
   - Aucun global hors window.__ADMINA_CPT_*
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_CPT_W3__) return;
  window.__ADMINA_CPT_W3__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/competences\/?$/; /* pathname UNIQUEMENT (leçon M28-V2 : pas de querystring) */
  var LS_DATA = 'admina-competences-data';
  var LS_UI = 'admina-competences-ui';
  var LS_SEUILS = 'admina-competences-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', niveau: '', cat: '', anneeMin: '', comp: '', bucket: '', flag: '', view: 'matrice', sortKey: 'candidat', sortDir: 1, matSort: 'rarete', page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, delId: null, sel: [] };

  /* ================= seuils (K) ================= */
  var SEUILS_DEF = { rarete: 2, expertMinAnnees: 5 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels (valeurs EXACTES du chunk natif) =================
     Chunk Competences-B2umrOJH.js : niveaux ['Debutant','Intermediaire','Avance','Expert']
     catégories ['Métier','Technique','Management','Logiciel','Certification','Créatif','Marketing','Langue']
     couleurs natives : Debutant=default · Intermediaire=info · Avance=warning · Expert=success */
  var NIVEAUX = [
    { k: 'Debutant', lab: 'Débutant', rank: 0, cls: 'lvl-deb', bar: '#94a3b8' },
    { k: 'Intermediaire', lab: 'Intermédiaire', rank: 1, cls: 'lvl-inter', bar: '#0e7490' },
    { k: 'Avance', lab: 'Avancé', rank: 2, cls: 'lvl-avance', bar: '#d97706' },
    { k: 'Expert', lab: 'Expert', rank: 3, cls: 'lvl-expert', bar: '#059669' }
  ];
  function nivMeta(k) { for (var i = 0; i < NIVEAUX.length; i++) { if (NIVEAUX[i].k === k) return NIVEAUX[i]; } return { k: k || '', lab: k || '—', rank: -1, cls: 'lvl-deb', bar: '#94a3b8' }; }
  var CATS = ['Métier', 'Technique', 'Management', 'Logiciel', 'Certification', 'Créatif', 'Marketing', 'Langue'];
  var BUCKETS = [
    { k: 'b0', lab: '0–2 ans', min: 0, max: 2 },
    { k: 'b3', lab: '3–5 ans', min: 3, max: 5 },
    { k: 'b6', lab: '6–9 ans', min: 6, max: 9 },
    { k: 'b10', lab: '10 ans et +', min: 10, max: 999 }
  ];
  function bucketOf(a) { var n = Number(a) || 0; return n <= 2 ? 'b0' : n <= 5 ? 'b3' : n <= 9 ? 'b6' : 'b10'; }

  /* ================= snapshot démo (reprise EXACTE des 14 lignes natives) ================= */
  var DEMO = [
    { id: 1, candidat: 'Ndiaye Moussa', competence: 'Gastronomie française', niveau: 'Expert', anneesExperience: 10, categorie: 'Métier' },
    { id: 2, candidat: 'Ndiaye Moussa', competence: 'Management d\'équipe', niveau: 'Avance', anneesExperience: 8, categorie: 'Management' },
    { id: 3, candidat: 'Ndiaye Moussa', competence: 'HACCP / Hygiène', niveau: 'Expert', anneesExperience: 9, categorie: 'Certification' },
    { id: 4, candidat: 'Tchouankou Claire', competence: 'Comptabilité générale', niveau: 'Avance', anneesExperience: 5, categorie: 'Métier' },
    { id: 5, candidat: 'Tchouankou Claire', competence: 'Sage Comptabilité', niveau: 'Avance', anneesExperience: 4, categorie: 'Logiciel' },
    { id: 6, candidat: 'Tchouankou Claire', competence: 'Fiscalité camerounaise', niveau: 'Intermediaire', anneesExperience: 3, categorie: 'Métier' },
    { id: 7, candidat: 'Kamga Blaise', competence: 'React / JavaScript', niveau: 'Avance', anneesExperience: 4, categorie: 'Technique' },
    { id: 8, candidat: 'Kamga Blaise', competence: 'Node.js / Express', niveau: 'Avance', anneesExperience: 3, categorie: 'Technique' },
    { id: 9, candidat: 'Kamga Blaise', competence: 'DevOps / CI-CD', niveau: 'Intermediaire', anneesExperience: 2, categorie: 'Technique' },
    { id: 10, candidat: 'Mebara Nadège', competence: 'Accueil client', niveau: 'Avance', anneesExperience: 4, categorie: 'Métier' },
    { id: 11, candidat: 'Mebara Nadège', competence: 'Réservation (PMS)', niveau: 'Intermediaire', anneesExperience: 2, categorie: 'Logiciel' },
    { id: 12, candidat: 'Eyenga Clarisse', competence: 'Community Management', niveau: 'Avance', anneesExperience: 2, categorie: 'Métier' },
    { id: 13, candidat: 'Eyenga Clarisse', competence: 'Photoshop / Canva', niveau: 'Intermediaire', anneesExperience: 3, categorie: 'Créatif' },
    { id: 14, candidat: 'Eyenga Clarisse', competence: 'Publicité digitale', niveau: 'Debutant', anneesExperience: 1, categorie: 'Marketing' }
  ];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num1(n) { return (Math.round((Number(n) || 0) * 10) / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 }); }
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
  function toastsZone() { var z = $('[data-acp="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-acp', 'toasts'); z.className = 'acp-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'acp-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_CPT_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.competences && Array.isArray(d.competences) && d.competences.length) return true;
    return false;
  }
  function rawRows() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.competences) { d = readLS(); }
    if (!d || !d.competences || !Array.isArray(d.competences) || !d.competences.length) {
      /* snapshot démo (dernier recours avant page native intacte) */
      return DEMO.map(function (r) { var u = {}; for (var k in r) u[k] = r[k]; return u; });
    }
    return d.competences.map(function (r) { var u = {}; for (var k in r) u[k] = r[k]; return u; });
  }
  /* Groupes « compétence DISTINCTE » : la matière première de la MATRICE */
  function groups(rows) {
    var map = {}, order = [];
    rows.forEach(function (r) {
      var k = norm(r.competence) || '\u2014';
      if (!map[k]) { map[k] = { key: k, label: String(r.competence || '').trim(), holders: 0, experts: 0, sum: 0, cats: {}, _lc: {} }; order.push(k); }
      var g = map[k];
      g.holders++;
      if (r.niveau === 'Expert') g.experts++;
      g.sum += (Number(r.anneesExperience) || 0);
      var lab = String(r.competence || '').trim();
      g._lc[lab] = (g._lc[lab] || 0) + 1;
      var cat = String(r.categorie || '').trim();
      if (cat) g.cats[cat] = 1;
    });
    return order.map(function (k) {
      var g = map[k];
      var best = g.label, bestN = -1;
      for (var lab in g._lc) { if (g._lc[lab] > bestN) { bestN = g._lc[lab]; best = lab; } }
      g.label = best;
      g.avg = g.holders ? g.sum / g.holders : 0;
      g.rare = g.holders <= SEUILS.rarete;
      g.catList = Object.keys(g.cats);
      return g;
    });
  }
  function candCounts(rows) {
    var m = {};
    rows.forEach(function (r) { var k = norm(r.candidat); if (k) m[k] = (m[k] || 0) + 1; });
    return m;
  }
  function dupCounts(rows) {
    var m = {};
    rows.forEach(function (r) { var k = norm(r.candidat) + '|' + norm(r.competence); if (k !== '|') m[k] = (m[k] || 0) + 1; });
    return m;
  }
  function dominantCat(rows) {
    var m = {};
    rows.forEach(function (r) { var c = String(r.categorie || '').trim(); if (c) m[c] = (m[c] || 0) + 1; });
    var best = '', bn = -1;
    Object.keys(m).sort().forEach(function (c) { if (m[c] > bn) { bn = m[c]; best = c; } });
    return best;
  }
  function data() {
    var rows = rawRows();
    var gs = groups(rows);
    var gmap = {};
    gs.forEach(function (g) { gmap[g.key] = g; });
    var cc = candCounts(rows);
    var dc = dupCounts(rows);
    return rows.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = Number(u.id) || 0;
      u.annees = Number(u.anneesExperience) || 0;
      u.ref = 'COMP-' + String(u.id).padStart(3, '0');
      u.grp = gmap[norm(u.competence)] || null;
      u.candN = cc[norm(u.candidat)] || 0;
      u.multi = u.candN >= 2;
      u.doublon = (dc[norm(u.candidat) + '|' + norm(u.competence)] || 0) >= 2;
      var cat = String(u.categorie || '').trim();
      u.catIssue = !cat || CATS.indexOf(cat) < 0;
      u.nm = nivMeta(u.niveau);
      u.underused = u.niveau === 'Expert' && u.annees >= SEUILS.expertMinAnnees;
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextId(rows) {
    return rows.reduce(function (m, r) { var n = Number(r.id); if (isFinite(n)) m = Math.max(m, n); return m; }, 0) + 1;
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.competences) { toast('Écriture impossible — recharger la page', 'err'); return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct (résilience W3) */
    var cur2 = readLS();
    var list = (cur2 && cur2.competences) ? cur2.competences : DEMO.map(function (r) { var u = {}; for (var k in r) u[k] = r[k]; return u; });
    var nv2 = fn({ competences: list });
    try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { toast('Écriture impossible — stockage indisponible', 'err'); return false; }
    if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
    refresh();
    return true;
  }

  /* ================= croisement optionnel (silencieux) =========
     Candidats de la Base Candidats (__ADMINA_CAND_API__) absents
     de la matrice : qui sait quoi ? personne ne le sait pour eux. */
  function missingCands() {
    var rows = data();
    var out = [];
    var seen = {};
    function add(name) {
      var n = String(name || '').trim();
      if (!n) return;
      var k = norm(n);
      if (!k || seen[k]) return;
      var present = rows.some(function (r) {
        var e = norm(r.candidat);
        if (!e) return false;
        return e === k || e.indexOf(k) > -1 || k.indexOf(e) > -1;
      });
      if (!present) { seen[k] = 1; out.push({ name: n }); }
    }
    try {
      var c = window.__ADMINA_CAND_API__;
      var cd = c && typeof c.getData === 'function' ? c.getData() : null;
      if (cd && cd.candidats && cd.candidats.length) {
        cd.candidats.forEach(function (r) {
          if (!r) return;
          add(r.candidat || [r.prenom, r.nom].filter(Boolean).join(' ') || r.nomComplet || '');
        });
      }
    } catch (e2) {}
    return out;
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var gs = groups(rows);
    var e1 = gs.filter(function (g) { return g.experts === 1; });
    if (e1.length) out.push({ tone: 'err', txt: e1.length + ' compétence' + (e1.length > 1 ? 's' : '') + ' à expert UNIQUE — risque de départ : un seul expert détient le savoir-faire (' + e1.slice(0, 2).map(function (g) { return g.label; }).join(', ') + '…)', f: 'expert1' });
    var miss = missingCands();
    if (miss.length) out.push({ tone: 'info', txt: miss.length + ' candidat' + (miss.length > 1 ? 's' : '') + ' de la base sans AUCUNE compétence renseignée — compléter la matrice : ' + miss.slice(0, 3).map(function (m) { return m.name; }).join(', ') + '…', f: 'cross' });
    var un = rows.filter(function (r) { return r.niveau === 'Expert' && (Number(r.anneesExperience) || 0) >= SEUILS.expertMinAnnees; });
    if (un.length) out.push({ tone: 'info', txt: un.length + ' expert' + (un.length > 1 ? 's' : '') + ' sous-exploité' + (un.length > 1 ? 's' : '') + ' — Expert avec ≥ ' + SEUILS.expertMinAnnees + ' ans : ' + un.slice(0, 2).map(function (r) { return r.candidat + ' · ' + r.competence; }).join(', ') + '…', f: 'experto' });
    var dc = dupCounts(rows);
    var dbl = rows.filter(function (r) { return (dc[norm(r.candidat) + '|' + norm(r.competence)] || 0) >= 2; });
    if (dbl.length) out.push({ tone: 'warn', txt: dbl.length + ' ligne' + (dbl.length > 1 ? 's' : '') + ' en doublon probable — même candidat + même compétence sur plusieurs lignes (' + dbl.slice(0, 2).map(function (r) { return 'COMP-' + String(r.id).padStart(3, '0'); }).join(', ') + '…)', f: 'doubles' });
    var nc = rows.filter(function (r) { var c = String(r.categorie || '').trim(); return !c || CATS.indexOf(c) < 0; });
    if (nc.length) out.push({ tone: 'warn', txt: nc.length + ' compétence' + (nc.length > 1 ? 's' : '') + ' sans catégorie ou catégorie incohérente — la mesure perd son axe (' + nc.slice(0, 2).map(function (r) { return r.candidat + ' · ' + r.competence; }).join(', ') + '…)', f: 'nocat' });
    return out.slice(0, 6);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var domcat = UI.flag === 'catdom' ? dominantCat(rows) : '';
    var out = rows.filter(function (r) {
      if (UI.niveau && r.niveau !== UI.niveau) return false;
      if (UI.cat && norm(r.categorie || '') !== norm(UI.cat)) return false;
      if (UI.anneeMin !== '' && !(r.annees >= Number(UI.anneeMin))) return false;
      if (UI.comp && norm(r.competence) !== norm(UI.comp)) return false;
      if (UI.bucket && bucketOf(r.annees) !== UI.bucket) return false;
      if (UI.flag === 'expert1' && !(r.grp && r.grp.experts === 1)) return false;
      if (UI.flag === 'experto' && !r.underused) return false;
      if (UI.flag === 'doubles' && !r.doublon) return false;
      if (UI.flag === 'nocat' && !r.catIssue) return false;
      if (UI.flag === 'rare' && !(r.grp && r.grp.rare)) return false;
      if (UI.flag === 'multi' && !r.multi) return false;
      if (UI.flag === 'catdom' && norm(r.categorie || '') !== norm(domcat)) return false;
      if (q && !(norm(r.candidat).indexOf(q) > -1 || norm(r.competence).indexOf(q) > -1 || norm(r.categorie).indexOf(q) > -1 || norm(r.ref).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'niveau') { va = a.nm.rank; vb = b.nm.rank; }
      else if (k === 'annees' || k === 'id') { va = Number(a[k]) || 0; vb = Number(b[k]) || 0; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return (a.id || 0) - (b.id || 0);
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.niveau ? 1 : 0) + (UI.cat ? 1 : 0) + (UI.anneeMin !== '' ? 1 : 0) + (UI.comp ? 1 : 0) + (UI.bucket ? 1 : 0) + (UI.flag ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.niveau = ''; UI.cat = ''; UI.anneeMin = ''; UI.comp = ''; UI.bucket = ''; UI.flag = ''; UI.page = 0; }
  function setFlag(f) { resetFilters(); UI.flag = f; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Comp[ée]tences\s+des\s+Candidats/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-acp="root"]');
    if (!root) {
      root = h('section', { 'data-acp': 'root', class: 'acp-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-acp-page')) {
      page.setAttribute('data-acp-page', '1');
      page.setAttribute('data-acp-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-acp-hide')) {
      natif.setAttribute('data-acp-hide', '1');
      natif.setAttribute('data-acp-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-acp="root"]'); if (root) root.remove();
    $$('[data-acp-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-acp-oldw') || '';
      n.removeAttribute('data-acp-page');
      n.removeAttribute('data-acp-oldw');
    });
    $$('[data-acp-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-acp-olddisp') || '';
      n.removeAttribute('data-acp-hide');
      n.removeAttribute('data-acp-olddisp');
    });
    $$('[data-acp]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-acp="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'acp-btn acp-btn-primary acp-backbtn', 'data-acp': 'back' }, 'Revenir à la Matrice des Talents');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'competences');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    matrix: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    synthese: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16"/><path d="M8 15v-4M12 15V7M16 15v-6M20 15v-2"/></svg>',
    seuils: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };

  function buildShell() {
    var root = $('[data-acp="root"]');
    if (!root || $('[data-acp="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="acp-hero" data-acp="hero">' +
        '<div class="acp-hero-main">' +
          '<div class="acp-hero-title">' +
            '<span class="acp-hero-ico">' + ICO.matrix + '</span>' +
            '<div><h2 class="acp-h2">La Matrice des Talents</h2>' +
            '<p class="acp-hero-sub" data-acp="herosub"></p>' +
            '<p class="acp-hero-mini" data-acp="heromini"></p></div>' +
          '</div>' +
          '<div class="acp-hero-actions">' +
            '<button class="acp-btn" data-acp="btn-new" title="Nouvelle ligne (N)">' + ICO.plus + 'Nouvelle ligne</button>' +
            '<button class="acp-btn" data-acp="btn-export" title="Exporter (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="acp-btn" data-acp="btn-journal" title="Journal (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="acp-btn" data-acp="btn-synthese" title="Synthèse du portefeuille (S)">' + ICO.synthese + 'Synthèse</button>' +
            '<button class="acp-btn" data-acp="btn-seuils" title="Seuils (K)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="acp-btn" data-acp="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
          '</div>' +
        '</div>' +
        '<div class="acp-hero-alerts" data-acp="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="acp-kpis" data-acp="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="acp-charts" data-acp="charts">' +
        '<div class="acp-chart-card"><div class="acp-chart-title">Répartition par catégorie</div><div class="acp-donut-wrap" data-acp="donut"></div></div>' +
        '<div class="acp-chart-card"><div class="acp-chart-title">Top compétences par détenteurs</div><div data-acp="topbars"></div></div>' +
        '<div class="acp-chart-card"><div class="acp-chart-title">Années d\u2019expérience (0-2 / 3-5 / 6-9 / 10+)</div><div data-acp="histo"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="acp-toolbar" data-acp="toolbar">' +
        '<div class="acp-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (candidat, compétence, catégorie…)" data-acp="search" aria-label="Rechercher dans la matrice" /></div>' +
        '<select data-acp="f-niveau" class="acp-sel" aria-label="Filtrer par niveau"></select>' +
        '<select data-acp="f-cat" class="acp-sel" aria-label="Filtrer par catégorie"></select>' +
        '<select data-acp="f-annee" class="acp-sel" aria-label="Filtrer par années minimum"></select>' +
        '<button class="acp-chipbtn" data-acp="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="acp-count" data-acp="count"></span>' +
        '<div class="acp-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="acp-vbtn" data-acp="v-matrice" title="Vue Matrice des talents (P)">' + ICO.grid + 'Matrice</button>' +
          '<button class="acp-vbtn" data-acp="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="acp-vbtn" data-acp="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-acp="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-acp="selbar"></div>' +

      /* PIED */
      '<div class="acp-foot">La page ne juge pas les gens : elle mesure le portefeuille de savoir-faire de l\u2019entreprise et son exposition au risque de départ · source de vérité locale (navigateur) · journal d\u2019audit actif · seuils configurables · <button class="acp-link" data-acp="btn-native">Afficher le tableau natif</button></div>';

    $('[data-acp="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-acp="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-acp="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'competences'); window.print(); });
    $('[data-acp="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-acp="btn-synthese"]', root).addEventListener('click', openSynthese);
    $('[data-acp="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-acp="btn-native"]', root).addEventListener('click', showNative);
    $('[data-acp="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-acp="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-acp="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-acp="f-niveau"]', root).addEventListener('change', function (e) { UI.niveau = e.target.value; UI.flag = ''; UI.page = 0; refresh(); });
    $('[data-acp="f-cat"]', root).addEventListener('change', function (e) { UI.cat = e.target.value; UI.flag = ''; UI.page = 0; refresh(); });
    $('[data-acp="f-annee"]', root).addEventListener('change', function (e) { UI.anneeMin = e.target.value; UI.flag = ''; UI.page = 0; refresh(); });
    $('[data-acp="v-matrice"]', root).addEventListener('click', function () { setView('matrice'); });
    $('[data-acp="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-acp="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
  }

  function setView(v) { UI.view = v; saveUI(); refresh(); }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var gs = groups(rows);
    var nbDist = gs.length;
    var nbExp = rows.filter(function (r) { return r.niveau === 'Expert'; }).length;
    var cands = candCounts(rows);
    var nbCands = Object.keys(cands).length;
    var nbRare = gs.filter(function (g) { return g.rare; }).length;
    var cats = {};
    rows.forEach(function (r) { var c = String(r.categorie || '').trim(); if (c) cats[c] = 1; });
    var sumA = 0; rows.forEach(function (r) { sumA += r.annees; });
    var avgA = rows.length ? sumA / rows.length : 0;
    $('[data-acp="herosub"]').textContent = nbDist + ' compétence' + (nbDist > 1 ? 's' : '') +
      ' · ' + nbExp + ' expert' + (nbExp > 1 ? 's' : '') +
      ' · ' + nbCands + ' candidat' + (nbCands > 1 ? 's' : '') +
      ' · ' + nbRare + ' compétence' + (nbRare > 1 ? 's' : '') + ' rare' + (nbRare > 1 ? 's' : '');
    $('[data-acp="heromini"]').textContent = Object.keys(cats).length + ' catégorie' + (Object.keys(cats).length > 1 ? 's' : '') +
      ' · années d\u2019expérience moyennes : ' + num1(avgA) + ' a · savoir qui sait quoi, avant l\u2019entretien';
    var zone = $('[data-acp="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="acp-alert ' + a.tone + '" data-acp="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.acp-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        if (f === 'cross') {
          var miss = missingCands();
          if (miss.length) { openDialog(null, { candidat: miss[0].name }); return; }
        }
        setFlag(f);
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var gs = groups(rows);
    var nbExp = rows.filter(function (r) { return r.niveau === 'Expert'; }).length;
    var cc = candCounts(rows);
    var nbCands = Object.keys(cc).length;
    var nbMulti = Object.keys(cc).filter(function (k) { return cc[k] >= 2; }).length;
    var nbRare = gs.filter(function (g) { return g.rare; }).length;
    var cats = {};
    rows.forEach(function (r) { var c = String(r.categorie || '').trim(); if (c) cats[c] = 1; });
    var domcat = dominantCat(rows);
    var domn = rows.filter(function (r) { return String(r.categorie || '').trim() === domcat; }).length;
    var sumA = 0, sumE = 0, nbE = 0;
    rows.forEach(function (r) { sumA += r.annees; if (r.niveau === 'Expert') { sumE += r.annees; nbE++; } });
    var avgA = rows.length ? sumA / rows.length : 0;
    var avgE = nbE ? sumE / nbE : 0;
    var kpis = [
      { k: '', t: 'COMPÉTENCES (LIGNES)', v: String(rows.length), s: gs.length + ' distinctes', cls: '', on: false },
      { k: 'niv:Expert', t: 'EXPERTS', v: String(nbExp), s: 'niveau Expert', cls: '', on: UI.niveau === 'Expert' },
      { k: 'multi', t: 'CANDIDATS DISTINCTS', v: String(nbCands), s: nbMulti + ' avec ≥ 2 compétences', cls: '', on: UI.flag === 'multi' },
      { k: 'catdom', t: 'CATÉGORIES', v: String(Object.keys(cats).length), s: domcat ? 'dominante : ' + domcat + ' (' + domn + ')' : '—', cls: '', on: UI.flag === 'catdom' },
      { k: 'rare', t: 'RARES', v: String(nbRare), s: '≤ ' + SEUILS.rarete + ' détenteur(s)', cls: nbRare ? 'gold' : '', on: UI.flag === 'rare' },
      { k: '', t: 'ANNÉES MOY.', v: num1(avgA) + ' a', s: 'experts : ' + num1(avgE) + ' a', cls: '', on: false }
    ];
    var zone = $('[data-acp="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="acp-kpi' + (k.cls === 'gold' ? ' gold' : '') + (k.on ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="acp-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="acp-kpi-v">' + esc(k.v) + '</span>' +
        '<span class="acp-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.acp-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        if (k === 'niv:Expert') {
          var was = UI.niveau === 'Expert';
          resetFilters();
          UI.niveau = was ? '' : 'Expert';
        } else if (UI.flag === k) { resetFilters(); }
        else { setFlag(k); }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Répartition par catégorie">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">lignes</text></svg>';
  }

  var CAT_COLORS = ['#0f766e', '#d97706', '#0e7490', '#7c3aed', '#dc2626', '#059669', '#64748b', '#a16207'];
  function catColor(i) { return CAT_COLORS[i % CAT_COLORS.length]; }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-acp="donut"]');
    if (!zone) return;
    var m = {};
    rows.forEach(function (r) { var c = String(r.categorie || '').trim() || '(sans catégorie)'; if (!m[c]) m[c] = 0; m[c]++; });
    var keys = Object.keys(m).sort(function (a, b) { return m[b] - m[a] || a.localeCompare(b, 'fr'); });
    var parts = keys.map(function (k, i) { return { k: k, c: catColor(i), v: m[k] }; });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="acp-donut-legend">' + parts.map(function (p) {
        return '<span class="acp-dl-item' + (UI.cat === p.k || (UI.flag === 'catdom' && p.k === dominantCat(rows)) ? ' on' : '') + '" data-cat="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="acp-dl-dot" style="background:' + p.c + '"></span>' + esc(p.k) +
          '<span class="acp-dl-val">' + p.v + ' · ' + (rows.length ? Math.round(p.v / rows.length * 100) : 0) + ' %</span></span>';
      }).join('') + '</div>';
    $$('.acp-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-cat');
        UI.cat = UI.cat === k ? '' : k;
        UI.flag = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  /* barres SVG vanilla (top compétences par détenteurs) */
  function svgBars(items, unit) {
    if (!items.length) return '<div class="acp-empty">Aucune donnée</div>';
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) mx = 1;
    var rowH = 24, w = 340, nameW = 148, barW = 140, H = items.length * rowH + 6;
    var out = '<svg viewBox="0 0 ' + w + ' ' + H + '" width="100%" role="img" aria-label="Top compétences par détenteurs" style="max-height:' + (H * 1.15) + 'px">';
    items.forEach(function (it, i) {
      var y = i * rowH + 4;
      var bw = Math.max(3, it.v / mx * barW);
      var lab = it.name.length > 20 ? it.name.slice(0, 19) + '…' : it.name;
      out += '<g class="acp-svgbar" data-key="' + esc(it.key) + '" role="button" tabindex="0">' +
        '<title>' + esc(it.name + ' — ' + it.v + ' ' + unit) + '</title>' +
        '<text x="0" y="' + (y + 12) + '" class="acp-sb-name">' + esc(lab) + '</text>' +
        '<rect x="' + nameW + '" y="' + y + '" width="' + barW + '" height="14" rx="4" class="acp-sb-track"/>' +
        '<rect x="' + nameW + '" y="' + y + '" width="' + bw + '" height="14" rx="4" class="acp-sb-fill"/>' +
        '<text x="' + (nameW + barW + 8) + '" y="' + (y + 12) + '" class="acp-sb-val">' + esc(String(it.v)) + '</text></g>';
    });
    out += '</svg>';
    return out;
  }

  function renderTopBars() {
    var zone = $('[data-acp="topbars"]');
    if (!zone) return;
    var gs = groups(data()).slice().sort(function (a, b) { return b.holders - a.holders || a.label.localeCompare(b.label, 'fr'); }).slice(0, 8);
    var items = gs.map(function (g) { return { key: g.label, name: g.label, v: g.holders }; });
    zone.innerHTML = svgBars(items, 'détenteur(s)');
    $$('.acp-svgbar', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.comp = UI.comp === k ? '' : k;
        UI.flag = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  /* histogramme SVG vanilla (années d'expérience par buckets) */
  function svgHisto(items) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) mx = 1;
    var w = 340, H = 170, base = 140, colW = 62, gap = 16;
    var out = '<svg viewBox="0 0 ' + w + ' ' + H + '" width="100%" role="img" aria-label="Années d\u2019expérience par tranche">';
    out += '<line x1="6" y1="' + base + '" x2="' + (w - 6) + '" y2="' + base + '" class="acp-hist-axis"/>';
    items.forEach(function (it, i) {
      var bh = Math.max(2, it.v / mx * 100);
      var x = 20 + i * (colW + gap);
      out += '<g class="acp-svgbar" data-key="' + it.k + '" role="button" tabindex="0">' +
        '<title>' + esc(it.lab + ' — ' + it.v + ' ligne(s)') + '</title>' +
        '<rect x="' + x + '" y="' + (base - bh) + '" width="' + colW + '" height="' + bh + '" rx="5" class="acp-hist-bar"/>' +
        '<text x="' + (x + colW / 2) + '" y="' + (base - bh - 6) + '" text-anchor="middle" class="acp-hist-val">' + esc(String(it.v)) + '</text>' +
        '<text x="' + (x + colW / 2) + '" y="' + (base + 16) + '" text-anchor="middle" class="acp-hist-lab">' + esc(it.lab) + '</text></g>';
    });
    out += '</svg>';
    return out;
  }

  function renderHisto() {
    var zone = $('[data-acp="histo"]');
    if (!zone) return;
    var rows = data();
    var items = BUCKETS.map(function (b) {
      return { key: b.k, lab: b.lab, v: rows.filter(function (r) { return bucketOf(r.annees) === b.k; }).length };
    });
    zone.innerHTML = svgHisto(items);
    $$('.acp-svgbar', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.bucket = UI.bucket === k ? '' : k;
        UI.flag = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var sel1 = $('[data-acp="f-niveau"]');
    sel1.innerHTML = '<option value="">Niveau : tous</option>' + NIVEAUX.slice().sort(function (a, b) { return b.rank - a.rank; }).map(function (n) {
      return '<option value="' + esc(n.k) + '"' + (UI.niveau === n.k ? ' selected' : '') + '>' + esc(n.lab) + '</option>';
    }).join('');
    var cats = {};
    rows.forEach(function (r) { var c = String(r.categorie || '').trim(); if (c) cats[c] = 1; });
    var sel2 = $('[data-acp="f-cat"]');
    sel2.innerHTML = '<option value="">Catégorie : toutes</option>' + Object.keys(cats).sort(function (a, b) { return a.localeCompare(b, 'fr'); }).map(function (c) {
      return '<option value="' + esc(c) + '"' + (UI.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');
    var sel3 = $('[data-acp="f-annee"]');
    sel3.innerHTML = '<option value="">Années : toutes</option>' + ['1', '2', '3', '5', '8', '10'].map(function (v) {
      return '<option value="' + v + '"' + (UI.anneeMin === v ? ' selected' : '') + '>≥ ' + v + ' ans</option>';
    }).join('');
    $('[data-acp="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-acp="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' lignes';
  }

  /* ================= cellules ================= */
  function niveauChip(r) {
    var nm = r.nm || nivMeta(r.niveau);
    return '<span class="acp-chip ' + nm.cls + '" title="Niveau : ' + esc(nm.lab) + '">' + esc(nm.lab) + '</span>';
  }
  function catChip(r) {
    var c = String(r.categorie || '').trim();
    if (!c) return '<span class="acp-chip err" title="Sans catégorie — à renseigner">sans catégorie</span>';
    if (CATS.indexOf(c) < 0) return '<span class="acp-chip warn" title="Catégorie inattendue : ' + esc(c) + '">' + esc(c) + '</span>';
    return '<span class="acp-chip neutral" title="Catégorie">' + esc(c) + '</span>';
  }
  function yearsBar(r) {
    var w = Math.min(r.annees * 10, 100);
    return '<span class="acp-ybar" aria-hidden="true"><i style="width:' + w + '%"></i></span><span class="acp-num">' + r.annees + ' a</span>';
  }
  function rareBadge(g) {
    if (g && g.rare) return '<span class="acp-rare" title="RARE — ' + g.holders + ' détenteur(s) ≤ ' + SEUILS.rarete + '">RARE</span>';
    return '<span class="acp-num">—</span>';
  }

  /* ================= table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var gs = groups(all);
    var nbExp = all.filter(function (r) { return r.niveau === 'Expert'; }).length;
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = 'none';
      if (key) aria = key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none';
      return '<th ' + (key ? 'data-sort="' + key + '" aria-sort="' + aria + '"' : '') + ' class="' + (cls || '') + '" scope="col">' + label +
        (key && key === sortKey ? '<span class="acp-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'acp-th-chk') + th('Réf.', 'id') + th('Candidat', 'candidat') + th('Compétence', 'competence') +
      th('Niveau', 'niveau') + th('Années exp.', 'annees') + th('Catégorie', 'categorie') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="acp-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.candidat) + '"></td>' +
        '<td class="acp-num">' + esc(r.ref) + '</td>' +
        '<td><span class="acp-cand" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.competence || '—') + (r.grp && r.grp.holders > 1 ? ' <span class="acp-num">(' + r.grp.holders + ' détenteurs)</span>' : '') + '</td>' +
        '<td>' + niveauChip(r) + '</td>' +
        '<td>' + yearsBar(r) + '</td>' +
        '<td>' + catChip(r) + '</td>' +
        '<td><div class="acp-actions">' +
          '<button class="acp-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="acp-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="acp-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="acp-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="acp-tfoot"><td></td><td colspan="7">TOTAL ' + all.length + ' lignes · ' + gs.length + ' compétences distinctes · ' + nbExp + ' experts · ' + gs.filter(function (g) { return g.rare; }).length + ' rare(s)</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="acp-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="acp-sel" data-acp="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="acp-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="acp-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-acp="content"]');
    card.innerHTML = '<div class="acp-tblcard"><div class="acp-tblwrap"><table class="acp-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="8"><div class="acp-empty">Aucune ligne ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = (k === 'annees' || k === 'id') ? -1 : 1; }
        refresh();
      });
    });
    bindRowActions(card);
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-acp="per"]', card);
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
    $$('[data-open]', scope).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', scope).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit'), null); }); });
    $$('[data-dup]', scope).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', scope).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-acp="content"]');
    card.innerHTML = rows.length ? '<div class="acp-cards">' + rows.map(function (r) {
      return '<div class="acp-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="acp-card-top"><div><input type="checkbox" class="acp-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="acp-num">' + esc(r.ref) + '</span></div>' +
        '<span>' + (r.grp && r.grp.rare ? rareBadge(r.grp) + ' ' : '') + niveauChip(r) + '</span></div>' +
        '<div class="acp-card-name" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</div>' +
        '<div class="acp-card-poste"><b>' + esc(r.competence || '—') + '</b></div>' +
        '<div class="acp-card-meta">' + catChip(r) + '<span class="acp-num">' + (r.candN >= 2 ? r.candN + ' compétences au total' : '1ère compétence') + '</span>' + (r.doublon ? '<span class="acp-chip warn" title="Doublon probable">doublon ?</span>' : '') + '</div>' +
        '<div class="acp-card-prog">' + yearsBar(r) + '</div>' +
        '<div class="acp-card-foot"><span class="acp-num">' + esc(r.grp && r.grp.rare ? 'Risque : ' + r.grp.holders + ' détenteur(s)' : 'Portefeuille · ' + (r.grp ? r.grp.experts : 0) + ' expert(s) sur la compétence') + '</span>' +
        '<div class="acp-card-act">' +
          '<button class="acp-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="acp-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="acp-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="acp-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="acp-empty">Aucune ligne ne correspond aux filtres</div>';
    bindRowActions(card);
  }

  /* ================= VUE MATRICE DES TALENTS (signature) =========
     Une rangée par compétence DISTINCTE : barre empilée des niveaux,
     compteur d'experts, années moyennes, badge RARE si détenteurs
     ≤ seuil. Clic → filtre compétence. Tri : rareté (défaut) / alpha. */
  function renderMatrice() {
    var rows = filtered();
    var gs = groups(rows);
    if (UI.matSort === 'rarete') gs.sort(function (a, b) { return a.holders - b.holders || a.label.localeCompare(b.label, 'fr'); });
    else gs.sort(function (a, b) { return a.label.localeCompare(b.label, 'fr'); });
    var card = $('[data-acp="content"]');
    var legend = '<div class="acp-mat-legend">' +
      NIVEAUX.slice().sort(function (a, b) { return b.rank - a.rank; }).map(function (n) {
        return '<span><i class="acp-leg" style="background:' + n.bar + '"></i>' + esc(n.lab) + '</span>';
      }).join('') +
      '<span class="acp-mat-hint">Une rangée = une compétence distincte · cliquez une compétence pour filtrer la page · les plus rares d\u2019abord.</span>' +
      '<span class="acp-mat-sort" role="group" aria-label="Tri de la matrice">' +
        '<button class="acp-sortbtn' + (UI.matSort === 'rarete' ? ' on' : '') + '" data-msort="rarete" title="Tri par rareté croissante">Rareté ↑</button>' +
        '<button class="acp-sortbtn' + (UI.matSort === 'alpha' ? ' on' : '') + '" data-msort="alpha" title="Tri alphabétique">A→Z</button>' +
      '</span></div>';
    var head = '<div class="acp-mat-head">' +
      '<span>Compétence</span><span>Répartition des niveaux</span><span>Experts</span><span>Détenteurs</span><span>Années moy.</span><span>Rareté</span></div>';
    var body = gs.map(function (g) {
      var segs = NIVEAUX.map(function (n) {
        var cnt = rows.filter(function (r) { return norm(r.competence) === g.key && r.niveau === n.k; }).length;
        if (!cnt) return '';
        return '<i class="seg-' + n.k.toLowerCase() + '" style="width:' + (cnt / g.holders * 100) + '%" title="' + esc(n.lab + ' : ' + cnt) + '"></i>';
      }).join('');
      return '<div class="acp-mrow' + (g.rare ? ' israre' : '') + '">' +
        '<div class="acp-mat-id">' +
          '<span class="acp-mat-name" data-comp="' + esc(g.label) + '" role="button" tabindex="0">' + esc(g.label) + '</span>' +
          '<span class="acp-mat-cats">' + (g.catList.length ? g.catList.map(function (c) { return '<span class="acp-chip neutral">' + esc(c) + '</span>'; }).join(' ') : '<span class="acp-chip err">sans catégorie</span>') + '</span>' +
        '</div>' +
        '<div class="acp-mat-bar" title="' + esc(g.holders + ' détenteur(s) · ' + g.experts + ' expert(s)') + '">' + segs + '</div>' +
        '<span class="acp-mat-num' + (g.experts ? ' strong' : '') + '">' + g.experts + '</span>' +
        '<span class="acp-mat-num">' + g.holders + '</span>' +
        '<span class="acp-mat-num">' + num1(g.avg) + ' a</span>' +
        '<span class="acp-mat-rare">' + rareBadge(g) + '</span>' +
      '</div>';
    }).join('');
    card.innerHTML = '<div class="acp-matcard">' + legend + head +
      (body || '<div class="acp-empty">Aucune compétence ne correspond aux filtres</div>') +
      '<div class="acp-mat-foot">' + gs.length + ' compétence' + (gs.length > 1 ? 's' : '') + ' affichée' + (gs.length > 1 ? 's' : '') + ' · ' + rows.length + ' ligne(s) de la matrice</div></div>';
    bindRowActions(card);
    $$('.acp-mat-name', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-comp');
        UI.comp = UI.comp === k ? '' : k;
        UI.flag = '';
        UI.page = 0;
        refresh();
        if (UI.comp) toast('Filtre compétence : ' + UI.comp, 'ok');
      });
    });
    $$('.acp-sortbtn', card).forEach(function (b) {
      b.addEventListener('click', function () {
        UI.matSort = b.getAttribute('data-msort') || 'rarete';
        saveUI();
        refresh();
      });
    });
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-acp="selbar"]');
    if (!zone) return;
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    var rows = UI.sel.map(function (id) { return rowById(id); }).filter(Boolean);
    zone.innerHTML = '<div class="acp-selbar">' +
      '<span class="acp-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="acp-selbar-sub">' + (rows.length ? num1(rows.reduce(function (s, r) { return s + r.annees; }, 0) / rows.length) + ' années moy.' : '') + '</span>' +
      '<button class="acp-btn acp-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="acp-btn acp-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="acp-btn acp-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer fiche (portrait de profil) =========
     Leçon M26/M28 : aucun handler ne se referme sur un snapshot —
     chaque mutation relit les données fraîches via mutate(cur) et
     rouvre le drawer avec reopenDrawerAt(id). */
  function closeDrawer() { $$('[data-acp="drawer"],[data-acp="backdrop"][data-acp-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = String(id);
    var bd = h('div', { class: 'acp-backdrop', 'data-acp': 'backdrop', 'data-acp-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var g = r.grp;
    var warnBlock = '';
    if (g && g.rare) warnBlock += '<div class="acp-warnblock">⚠ Compétence RARE — ' + g.holders + ' détenteur(s) ≤ ' + SEUILS.rarete + ' : un départ expose l\u2019entreprise sur « ' + esc(g.label) + ' ».</div>';
    if (g && g.experts === 1 && r.niveau === 'Expert') warnBlock += '<div class="acp-warnblock">⚠ Expert UNIQUE sur cette compétence — risque de départ à couvrir (formation d\u2019un second expert).</div>';
    if (r.doublon) warnBlock += '<div class="acp-warnblock">⚠ Doublon probable — le même candidat détient déjà « ' + esc(r.competence) + ' » sur une autre ligne (COMP).</div>';
    if (r.underused) warnBlock += '<div class="acp-warnblock">ℹ Expert sous-exploité — ' + r.annees + ' années d\u2019expérience (≥ ' + SEUILS.expertMinAnnees + ') : talent à mobiliser.</div>';
    if (r.catIssue) warnBlock += '<div class="acp-warnblock">⚠ Sans catégorie ou catégorie incohérente — la mesure perd son axe.</div>';
    var profilRows = data().filter(function (x) { return norm(x.candidat) === norm(r.candidat); })
      .sort(function (a, b) { return a.competence.localeCompare(b.competence, 'fr'); });
    var profil = profilRows.map(function (x) {
      var xg = x.grp;
      return '<div class="acp-profrow' + (String(x.id) === String(id) ? ' cur' : '') + '">' +
        '<div class="acp-profrow-main">' +
          '<span class="acp-profrow-comp">' + esc(x.competence) + ' <span class="acp-num">' + esc(x.ref) + '</span>' + (xg && xg.rare ? ' <span class="acp-rare">RARE</span>' : '') + '</span>' +
          '<span class="acp-profrow-meta">' + niveauChip(x) + ' ' + catChip(x) + ' <span class="acp-num">' + x.annees + ' a</span></span>' +
        '</div>' +
        '<div class="acp-seg" role="group" aria-label="Niveau de ' + esc(x.competence) + '">' +
          NIVEAUX.map(function (n) {
            return '<button type="button" class="' + (x.niveau === n.k ? ' on' : '') + '" data-niv="' + esc(x.id) + '|' + esc(n.k) + '" title="' + esc(n.lab) + '" aria-pressed="' + (x.niveau === n.k ? 'true' : 'false') + '">' + esc(n.lab.slice(0, 4)) + '</button>';
          }).join('') +
        '</div></div>';
    }).join('');
    var candName = r.candidat || '—';
    var hist = journalRows().filter(function (x) {
      var d = norm(x.detail || '');
      return d.indexOf(norm(candName)) > -1 || d.indexOf(norm(r.ref)) > -1;
    }).slice(0, 8);
    var dr = h('aside', { class: 'acp-drawer', 'data-acp': 'drawer', role: 'dialog', 'aria-label': 'Fiche compétence ' + r.ref });
    dr.innerHTML =
      '<div class="acp-drawer-head"><div><div class="acp-drawer-title">' + esc(candName) + '</div>' +
      '<div class="acp-drawer-sub">' + esc(r.ref) + ' · ' + esc(r.competence || '—') + ' · ' + esc((r.nm || nivMeta(r.niveau)).lab) + '</div></div>' +
      '<button class="acp-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="acp-drawer-body">' +
        '<div class="acp-live" style="margin-top:0"><span>Niveau <b>' + esc((r.nm || nivMeta(r.niveau)).lab) + '</b></span>' +
          '<span>Années <b>' + r.annees + ' a</b></span>' +
          '<span>Catégorie <b>' + esc(String(r.categorie || '').trim() || '—') + '</b></span>' +
          '<span>Détenteurs <b>' + (g ? g.holders : 1) + '</b>' + (g && g.rare ? ' <span class="acp-rare">RARE</span>' : '') + '</span></div>' +
        warnBlock +
        '<div class="acp-fsec">Portrait de profil — toutes les compétences de ' + esc(candName) + ' (' + profilRows.length + ')</div>' +
        '<div class="acp-prof">' + profil + '</div>' +
        '<div class="acp-fsec">Historique (journal)</div>' +
        (hist.length ? hist.map(function (x) {
          var d = new Date(x.time);
          return '<div class="acp-jrow"><span class="acp-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
            '<span class="acp-jact">' + esc(x.action || '') + '</span><span class="acp-jdet">' + esc(x.detail || '') + '</span></div>';
        }).join('') : '<div class="acp-empty" style="padding:8px 0">Aucune activité enregistrée pour ce candidat.</div>') +
        '<div class="acp-drawer-actions">' +
          '<button class="acp-btn acp-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="acp-btn acp-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="acp-btn acp-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.acp-drawer-x', dr).addEventListener('click', closeDrawer);
    /* niveau éditable rapide : handlers relisent l'état FRAIS (stale-closure) */
    $$('[data-niv]', dr).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = (b.getAttribute('data-niv') || '').split('|');
        if (p.length !== 2) return;
        var rowId = p[0], nv = p[1];
        var cur = rowById(rowId);
        if (!cur) { toast('Ligne introuvable', 'err'); return; }
        if (String(cur.niveau) === String(nv)) return;
        mutate(function (c) {
          c.competences = c.competences.map(function (x) { if (String(x.id) === String(rowId)) x.niveau = nv; return x; });
          return c;
        }, 'Niveau modifié', 'COMP-' + String(rowId).padStart(3, '0') + ' · ' + String(cur.candidat || '') + ' · ' + String(cur.competence || '') + ' → ' + nv);
        toast('Niveau : ' + nivMeta(nv).lab, 'ok');
        reopenDrawerAt(rowId);
      });
    });
    $$('[data-open]', dr).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', r.ref + ' · ' + candName);
  }
  function reopenDrawerAt(id) {
    if (UI.drawerId !== null && String(UI.drawerId) === String(id)) openDrawer(id);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-acp="dialog"],[data-acp="backdrop"][data-acp-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
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
    var bd = h('div', { class: 'acp-backdrop', 'data-acp': 'backdrop', 'data-acp-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'acp-dialog', 'data-acp': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une ligne de compétence' : 'Nouvelle ligne de compétence' });
    var candsDatalist = '<datalist id="acp-cands">' + Object.keys(rows.reduce(function (m, x) { if (x.candidat) m[x.candidat] = 1; return m; }, {})).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    var compsDatalist = '<datalist id="acp-comps">' + Object.keys(rows.reduce(function (m, x) { if (x.competence) m[x.competence] = 1; return m; }, {})).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist>';
    function opts(list, cur) {
      return '<option value=""></option>' + list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = typeof x === 'object' ? x.lab : x;
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    dlg.innerHTML =
      '<div class="acp-dialog-head"><h3>' + (r ? 'Modifier ' + esc(r.ref) : 'Nouvelle ligne de compétence') + '</h3>' +
      '<button class="acp-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="acp-dialog-body">' +
        '<div class="acp-fgrid">' +
          '<label class="acp-lab">Candidat * (format « Nom Prénom »)<input class="acp-in" data-f="candidat" list="acp-cands" value="' + esc(v('candidat')) + '" placeholder="Ex. Ndiaye Moussa"></label>' +
          '<label class="acp-lab">Compétence *<input class="acp-in" data-f="competence" list="acp-comps" value="' + esc(v('competence')) + '" placeholder="Ex. React / JavaScript"></label>' +
          '<label class="acp-lab">Niveau *<select class="acp-in" data-f="niveau">' + opts(NIVEAUX, v('niveau') || 'Debutant') + '</select></label>' +
          '<label class="acp-lab">Catégorie *<select class="acp-in" data-f="categorie">' + opts(CATS, v('categorie')) + '</select></label>' +
          '<label class="acp-lab">Années d\u2019expérience (0–50)<input class="acp-in" type="number" min="0" max="50" step="1" data-f="anneesExperience" value="' + esc(v('anneesExperience') || '0') + '" inputmode="numeric"></label>' +
        '</div>' + candsDatalist + compsDatalist +
        '<div class="acp-live" data-acp="dlg-live"></div>' +
        '<div data-acp="dlg-err"></div>' +
      '</div>' +
      '<div class="acp-dialog-foot"><span class="acp-form-hint">Candidat, compétence, niveau et catégorie obligatoires · années entières 0–50</span>' +
      '<span style="display:flex;gap:8px"><button class="acp-btn acp-btn-ghost" data-act="cancel" style="color:var(--acp-text);border-color:var(--acp-line)">Annuler</button>' +
      '<button class="acp-btn acp-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Ajouter à la matrice') + '</button></span></div>';
    $('.acp-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var comp = norm(val.competence);
      var others = data().filter(function (x) { return norm(x.competence) === comp && String(x.id) !== String(UI.editId || ''); });
      var after = others.length + 1;
      var rare = after <= SEUILS.rarete;
      var dbl = others.some(function (x) { return norm(x.candidat) === norm(val.candidat); });
      $('[data-acp="dlg-live"]', dlg).innerHTML =
        '<span>Après enregistrement : « ' + esc(val.competence || '—') + ' » — <b>' + after + ' détenteur(s)</b></span>' +
        '<span>' + (rare ? '<b class="good">RARE (≤ ' + SEUILS.rarete + ') — risque de départ à surveiller</b>' : 'au-dessus du seuil de rareté (' + SEUILS.rarete + ')') + '</span>' +
        (dbl ? '<span class="bad">⚠ doublon probable : ce candidat détient déjà cette compétence</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('change', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-acp="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="acp-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.candidat || '').trim()) return fail('Le candidat est obligatoire (format « Nom Prénom »).');
      if (!String(val.competence || '').trim()) return fail('La compétence est obligatoire.');
      if (NIVEAUX.map(function (n) { return n.k; }).indexOf(String(val.niveau || '').trim()) < 0) return fail('Le niveau est obligatoire (Débutant, Intermédiaire, Avancé ou Expert).');
      if (!String(val.categorie || '').trim()) return fail('La catégorie est obligatoire (Métier, Technique, Management, Logiciel, Certification, Créatif, Marketing, Langue).');
      var an = String(val.anneesExperience == null ? '' : val.anneesExperience).trim();
      if (an === '') an = '0';
      if (!/^\d{1,2}$/.test(an) || Number(an) > 50) return fail('Les années d\u2019expérience doivent être un nombre entier entre 0 et 50.');
      var rec = {
        candidat: String(val.candidat).trim(),
        competence: String(val.competence).trim(),
        niveau: String(val.niveau).trim(),
        categorie: String(val.categorie).trim(),
        anneesExperience: Number(an)
      };
      if (editId) {
        mutate(function (cur) {
          cur.competences = cur.competences.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Compétence modifiée', 'COMP-' + String(editId).padStart(3, '0') + ' · ' + rec.candidat + ' · ' + rec.competence);
        toast('Ligne mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var mx = cur.competences.reduce(function (m, x) { var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n); return m; }, 0) + 1;
          var cp = {};
          for (var k2 in rec) cp[k2] = rec[k2];
          cp.id = mx;
          cur.competences = cur.competences.concat([cp]);
          return cur;
        }, 'Compétence créée', rec.candidat + ' · ' + rec.competence + ' · ' + rec.niveau);
        toast('Ligne ajoutée à la matrice — ' + rec.candidat, 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="candidat"]', dlg);
    if (first) first.focus();
  }

  /* ================= duplication / suppression ================= */
  function dupRow(id) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      var mx = cur.competences.reduce(function (m, x) { var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n); return m; }, 0) + 1;
      var cp = {};
      for (var k in r) if (['annees', 'ref', 'grp', 'candN', 'multi', 'doublon', 'catIssue', 'nm', 'underused'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = mx;
      cur.competences = cur.competences.concat([cp]);
      return cur;
    }, 'Compétence dupliquée', 'COMP-' + String(id).padStart(3, '0') + ' · ' + (r.candidat || '') + ' · ' + (r.competence || ''));
    toast('Ligne dupliquée depuis ' + r.ref + ' — ajustez le candidat pour éviter un doublon', 'ok');
  }
  function closeConfirm() { $$('[data-acp="confirm"],[data-acp="backdrop"][data-acp-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'acp-backdrop', 'data-acp': 'backdrop', 'data-acp-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var g = r.grp;
    var c = h('div', { class: 'acp-confirm', 'data-acp': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette ligne ?</h4><p>' + esc(r.ref) + ' — ' + esc(r.candidat || '—') + ' · ' + esc(r.competence || '—') + '. ' +
      (g && g.rare ? 'Cette compétence est RARE (' + g.holders + ' détenteur(s)) : la supprimer augmente l\u2019exposition. ' : '') +
      'Cette action est définitive.</p>' +
      '<div class="acp-confirm-row"><button class="acp-btn acp-btn-ghost" data-a="no" style="color:var(--acp-text);border-color:var(--acp-line)">Annuler</button>' +
      '<button class="acp-btn acp-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.competences = cur.competences.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Compétence supprimée', 'COMP-' + String(id).padStart(3, '0') + ' · ' + (r.candidat || '') + ' · ' + (r.competence || ''));
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Ligne supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' lignes ?') : 'Supprimer 1 ligne ?';
    var bd = h('div', { class: 'acp-backdrop', 'data-acp': 'backdrop', 'data-acp-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'acp-confirm', 'data-acp': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.ref); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="acp-confirm-row"><button class="acp-btn acp-btn-ghost" data-a="no" style="color:var(--acp-text);border-color:var(--acp-line)">Annuler</button>' +
      '<button class="acp-btn acp-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.competences = cur.competences.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' lignes');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' lignes supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= synthèse du portefeuille (S) =================
     La philosophie de la page en chiffres : rareté, doublons,
     combinaisons rares, experts sous-exploités. */
  function closeSynthese() { $$('[data-acp="synthese"],[data-acp="backdrop"][data-acp-for="synthese"]').forEach(function (n) { n.remove(); }); }
  function openSynthese() {
    closeSynthese();
    var rows = data();
    var gs = groups(rows);
    var e1 = gs.filter(function (g) { return g.experts === 1; });
    var rare = gs.filter(function (g) { return g.rare; });
    var dbl = rows.filter(function (r) { return r.doublon; });
    var un = rows.filter(function (r) { return r.underused; });
    /* combinaisons rares : paires de compétences détenues par un seul candidat */
    var pairs = {}, candMap = {};
    rows.forEach(function (r) { var k = norm(r.candidat); if (!candMap[k]) candMap[k] = { name: r.candidat, comps: [] }; candMap[k].comps.push(r.competence); });
    Object.keys(candMap).forEach(function (k) {
      var cs = candMap[k].comps.slice().sort(function (a, b) { return a.localeCompare(b, 'fr'); });
      for (var i = 0; i < cs.length; i++) for (var j = i + 1; j < cs.length; j++) {
        var pk = norm(cs[i]) + '+' + norm(cs[j]);
        if (!pairs[pk]) pairs[pk] = { a: cs[i], b: cs[j], n: 0, who: candMap[k].name };
        pairs[pk].n++;
      }
    });
    var rarePairs = Object.keys(pairs).map(function (k) { return pairs[k]; }).filter(function (p) { return p.n === 1; });
    var bd = h('div', { class: 'acp-backdrop', 'data-acp': 'backdrop', 'data-acp-for': 'synthese' });
    bd.addEventListener('click', closeSynthese);
    var p = h('div', { class: 'acp-panel', 'data-acp': 'synthese', role: 'dialog', 'aria-label': 'Synthèse du portefeuille de savoir-faire' });
    p.innerHTML = '<div class="acp-panel-head"><h3>Synthèse du portefeuille de savoir-faire</h3><button class="acp-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="acp-panel-body">' +
        '<div class="acp-sim-kpis">' +
          '<span><b>' + gs.length + '</b> compétences distinctes</span>' +
          '<span><b>' + rare.length + '</b> rares (≤ ' + SEUILS.rarete + ' détenteurs)</span>' +
          '<span><b>' + e1.length + '</b> à expert unique</span>' +
          '<span><b>' + dbl.length + '</b> doublon(s)</span>' +
          '<span><b>' + un.length + '</b> expert(s) sous-exploité(s)</span>' +
        '</div>' +
        '<div class="acp-fsec">Risque de départ — expert unique</div>' +
        (e1.length ? '<div class="acp-syn-rows">' + e1.slice(0, 6).map(function (g) { return '<div class="acp-syn-row"><b>' + esc(g.label) + '</b><span class="acp-num">1 expert / ' + g.holders + ' détenteur(s) · ' + num1(g.avg) + ' a</span></div>'; }).join('') + '</div>' : '<div class="acp-empty" style="padding:6px 0">Aucune compétence à expert unique.</div>') +
        '<div class="acp-fsec">Combinaisons rares — détenues par une seule personne</div>' +
        (rarePairs.length ? '<div class="acp-syn-rows">' + rarePairs.slice(0, 6).map(function (pr) { return '<div class="acp-syn-row"><b>' + esc(pr.a + ' + ' + pr.b) + '</b><span class="acp-num">' + esc(pr.who) + '</span></div>'; }).join('') + '</div>' : '<div class="acp-empty" style="padding:6px 0">Aucune combinaison isolée.</div>') +
        '<div class="acp-fsec">Experts sous-exploités (≥ ' + SEUILS.expertMinAnnees + ' ans)</div>' +
        (un.length ? '<div class="acp-syn-rows">' + un.slice(0, 6).map(function (r) { return '<div class="acp-syn-row"><b>' + esc(r.candidat + ' · ' + r.competence) + '</b><span class="acp-num">' + r.annees + ' a · ' + esc((r.nm || nivMeta(r.niveau)).lab) + '</span></div>'; }).join('') + '</div>' : '<div class="acp-empty" style="padding:6px 0">Aucun expert sous-exploité au seuil actuel.</div>') +
        '<div class="acp-sim-tip" style="margin-top:10px">💡 ' + e1.length + ' risque(s) de départ, ' + rarePairs.length + ' combinaison(s) rare(s) : la matrice révèle ce qu\u2019aucun CV ne montre. Former un second expert est le geste le plus rentable de la page.</div>' +
      '</div>';
    $('.acp-drawer-x', p).addEventListener('click', closeSynthese);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Synthèse ouverte', gs.length + ' compétences · ' + e1.length + ' risque(s)');
  }

  /* ================= seuils (K) ================= */
  function closeSeuils() { $$('[data-acp="seuils"],[data-acp="backdrop"][data-acp-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'acp-backdrop', 'data-acp': 'backdrop', 'data-acp-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'acp-panel', 'data-acp': 'seuils', role: 'dialog', 'aria-label': 'Seuils de la matrice' });
    p.innerHTML = '<div class="acp-panel-head"><h3>Seuils de la matrice</h3><button class="acp-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="acp-panel-body">' +
        '<p class="acp-cibles-note">Ces seuils alimentent le badge « RARE », les alertes « expert unique » et « experts sous-exploités » — réglez-les selon la taille de votre vivier.</p>' +
        '<div class="acp-sim-row"><label for="acp-s1">Seuil de rareté (détenteurs max)</label><input type="range" id="acp-s1" min="1" max="3" step="1" value="' + SEUILS.rarete + '"><input class="acp-in" type="number" min="1" max="3" step="1" data-acp="s1n" value="' + SEUILS.rarete + '"></div>' +
        '<div class="acp-sim-row"><label for="acp-s2">Expert sous-exploité (années min)</label><input type="range" id="acp-s2" min="5" max="15" step="1" value="' + SEUILS.expertMinAnnees + '"><input class="acp-in" type="number" min="5" max="15" step="1" data-acp="s2n" value="' + SEUILS.expertMinAnnees + '"></div>' +
        '<div class="acp-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="acp-btn acp-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.acp-drawer-x', p).addEventListener('click', closeSeuils);
    [['acp-s1', 's1n', 'rarete', 1, 3], ['acp-s2', 's2n', 'expertMinAnnees', 5, 15]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-acp="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.rarete = Math.max(1, Math.min(3, Number($('[data-acp="s1n"]', p).value) || SEUILS.rarete));
      SEUILS.expertMinAnnees = Math.max(5, Math.min(15, Number($('[data-acp="s2n"]', p).value) || SEUILS.expertMinAnnees));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'rareté ≤ ' + SEUILS.rarete + ' détenteur(s) · expert min ' + SEUILS.expertMinAnnees + ' ans');
      toast('Seuils appliqués — matrice et alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-acp="journal"],[data-acp="backdrop"][data-acp-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'acp-backdrop', 'data-acp': 'backdrop', 'data-acp-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'acp-panel', 'data-acp': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="acp-panel-head"><h3>Journal d\u2019activité</h3><button class="acp-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="acp-panel-body" data-acp="jlist"></div>';
    $('.acp-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-acp="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="acp-jrow"><span class="acp-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="acp-jact">' + esc(x.action || '') + '</span><span class="acp-jdet">' + esc(x.detail || '') + (x.role ? ' · ' + esc(x.role) : '') + '</span></div>';
    }).join('') : '<div class="acp-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV (7 colonnes) ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var gs = groups(data());
    var gmap = {};
    gs.forEach(function (g) { gmap[g.key] = g; });
    var sep = ';';
    var head = ['Référence', 'Candidat', 'Compétence', 'Niveau', 'Catégorie', 'Années d\u2019expérience', 'Détenteurs'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var g = gmap[norm(r.competence)];
      var cells = [r.ref, r.candidat, r.competence, (r.nm || nivMeta(r.niveau)).lab, r.categorie, r.annees, g ? g.holders : 1];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'competences-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils(); closeSynthese(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-acp="dialog"]') || $('[data-acp="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { setView('matrice'); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { setView('cards'); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { setView('table'); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSynthese(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { openSeuils(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-acp="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle ligne · E export · J journal · P matrice · C cartes · T tableau · S synthèse · K seuils · / recherche', ''); }
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
    var root = $('[data-acp="root"]');
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
    /* garde CSS dark demandée : html.admina-acp[data-dark] */
    if (dark) html.setAttribute('data-dark', '');
    else html.removeAttribute('data-dark');
  }

  /* ================= UI persist ================= */
  function loadUI() {
    try {
      var v = JSON.parse(localStorage.getItem(LS_UI) || 'null');
      if (v) {
        if (typeof v.view === 'string' && ['matrice', 'table', 'cards'].indexOf(v.view) > -1) UI.view = v.view;
        if (typeof v.per === 'number') UI.per = v.per;
        if (typeof v.matSort === 'string' && ['rarete', 'alpha'].indexOf(v.matSort) > -1) UI.matSort = v.matSort;
      }
    } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per, matSort: UI.matSort })); } catch (e) {} }

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
    renderTopBars();
    renderHisto();
    renderFilters();
    if (UI.view === 'cards') renderCards();
    else if (UI.view === 'table') renderTable();
    else renderMatrice();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-acp="drawer"],[data-acp="dialog"],[data-acp="confirm"],[data-acp="journal"],[data-acp="seuils"],[data-acp="synthese"]')) {
      $$('[data-acp="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0, subBound = false;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function tryActivate() {
    if (active) return;
    if (!isOn()) { bootTries = 0; return; }
    bootTries++;
    if (ready()) { activate(); return; }
    if (bootTries < 30) { setTimeout(tryActivate, 450); return; }
    /* 30 essais épuisés : LS puis snapshot démo — sinon page native intacte
       (si le conteneur natif est introuvable, mountRoot échoue et rien ne bouge) */
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
    html.classList.add('admina-acp');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-acp]')) continue;
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
    html.classList.remove('admina-acp');
    html.removeAttribute('data-dark');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils(); closeSynthese();
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
    var root = $('[data-acp="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-acp-hide', '1');
      natif.setAttribute('data-acp-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) refresh();
  }

  /* démarrage : réessais 30 × 450 ms (relit l'API à chaque essai),
     puis LS, puis snapshot démo — sinon page native intacte */
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

  window.__ADMINA_CPT_UI__ = {
    version: '1.0-w3',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openJournal: openJournal,
    openSeuils: openSeuils,
    openSynthese: openSynthese,
    setView: setView,
    exportCSV: exportCSV,
    debug: { filtered: filtered, alerts: computeAlerts, rarete: function () { return groups(data()); }, seuils: SEUILS }
  };
  try { console.info('[ADMINA_CPT] W3-d actif — La Matrice des Talents /competences'); } catch (e) {}
})();
