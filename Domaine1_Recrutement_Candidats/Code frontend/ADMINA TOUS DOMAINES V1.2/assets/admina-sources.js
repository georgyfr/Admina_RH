/* =============================================================
   Admina-RH — Sources de Recrutement — couche admina
   M22 : CENTRE DE PILOTAGE — Sources & performance des canaux
   Héro + alertes contextuelles + 6 KPI cliquables + 3 graphiques
   (donut candidats/canal, coût/recrutement, entonnoir global)
   + recherche/filtres + table triable 16 col + vue cartes + drawer
   détail (score décomposé) + création/édition synchronisée canaux↔
   performance + duplication + suppression confirmée + bascule
   actif/inactif + comparateur multi-canaux + simulateur d'allocation
   budgétaire + cibles configurables + export CSV + journal d'audit
   + pont vers /previsions-postes + thème sombre + responsive mobile.
   - Scope strict : /Domaine1_Recrutement_Candidats/sources-recrutement
   - Idempotent (data-asr / data-asr-hide), sans collision (__ADMINA_SRC_M22__)
   - Données : window.__ADMINA_SRC_API__ (patch chunk) → fallback localStorage
   - Journal : window.__ADMINA_AUDIT__ (SPA D1)
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_SRC_M22__) return;
  window.__ADMINA_SRC_M22__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/Domaine1_Recrutement_Candidats\/sources-recrutement\/?$/;
  var LS_DATA = 'admina-sources-data';
  var LS_UI = 'admina-sources-ui';
  var LS_CIBLES = 'admina-sources-cibles';
  var PREFILL_PREV = 'admina_prev_prefill';

  var UI = { q: '', canal: '', statut: '', score: '', perf: '', kpi: '', view: 'table', sortKey: 'score', sortDir: -1, page: 0, per: 10, drawer: 0, dialog: 0, editId: null, delId: null };

  var CIBLES_DEF = { taux: 10, qualite: 14, delai: 30, cpr: 80000 };
  var CIBLES = loadCibles();
  function loadCibles() {
    try { var v = JSON.parse(localStorage.getItem(LS_CIBLES) || 'null'); if (v && typeof v === 'object') return Object.assign({}, CIBLES_DEF, v); } catch (e) {}
    return Object.assign({}, CIBLES_DEF);
  }
  function saveCibles() { try { localStorage.setItem(LS_CIBLES, JSON.stringify(CIBLES)); } catch (e) {} }

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fcfa(n) { return (Number(n) || 0).toLocaleString('fr-FR') + ' FCFA'; }
  function kfcfa(n) { n = Number(n) || 0; return n >= 1000000 ? (n / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' M' : n >= 1000 ? Math.round(n / 1000) + ' k' : String(n); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %'; }
  function jlog(a, d) { try { window.__ADMINA_AUDIT__ && window.__ADMINA_AUDIT__.log(a, d, 'Recruteur'); } catch (e) {} }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h(sel, attrs, htmlStr) { var e = document.createElement(sel); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (htmlStr != null) e.innerHTML = htmlStr; return e; }
  function toastsZone() { var z = $('[data-asr="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-asr', 'toasts'); z.className = 'asr-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'asr-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_SRC_API__ || null; }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.canaux) { try { d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e2) { d = null; } }
    if (!d || !d.canaux) return [];
    var canaux = d.canaux || [], perfs = d.performances || [];
    return canaux.map(function (c) {
      var p = null;
      for (var i = 0; i < perfs.length; i++) { if ((perfs[i].source || '') === c.nom) { p = perfs[i]; break; } }
      var nbC = Number(c.nbCandidats) || 0, cout = Number(c.cout) || 0;
      var ent = p ? (Number(p.nbEntretiens) || 0) : 0;
      var rec = p ? (Number(p.nbRecrutements) || 0) : 0;
      var taux = p ? (Number(p.tauxTransformation) || 0) : null;
      var cpc = nbC > 0 ? Math.round(cout / nbC) : null;
      var cpr = (p && rec > 0) ? Math.round((Number(p.coutRecrutement) || 0) / rec) : null;
      var noResult = !!(p && rec === 0 && cout > 0);
      var u = { id: c.id, nom: c.nom || '', description: c.description || '', active: !!c.active, nbCandidats: nbC, cout: cout, canal: (p && p.canal) || '', p: p };
      u.numero = p ? (p.numero || ('SRC-' + String(c.id).padStart(3, '0'))) : ('CAN-' + String(c.id).padStart(3, '0'));
      u.ent = ent; u.rec = rec; u.taux = taux; u.cpc = cpc; u.cpr = cpr; u.noResult = noResult;
      u.delai = p ? (Number(p.delaiMoyen) || 0) : null;
      u.qual = p ? (Number(p.qualiteMoyenne) || 0) : null;
      u.notes = p ? (p.notes || '') : '';
      var sc = scoreOf(u);
      u.score = sc.total; u.grade = sc.grade; u.parts = sc.parts;
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (Number(rows[i].id) === Number(id)) return rows[i]; } return null; }
  function nextId(arr) { return arr.reduce(function (m, r) { return Math.max(m, Number(r.id) || 0); }, 0) + 1; }

  function scoreOf(u) {
    var p = u.p;
    if (!p) return { total: null, grade: 'NA', parts: null };
    var taux = Number(p.tauxTransformation) || 0;
    var qual = Number(p.qualiteMoyenne) || 0;
    var del = Number(p.delaiMoyen) || 0;
    var cpr = u.cpr;
    var pTaux = Math.max(0, Math.min(100, Math.round(taux / (CIBLES.taux || 10) * 100)));
    var pQual = Math.max(0, Math.min(100, Math.round(qual / (CIBLES.qualite || 14) * 100)));
    var pDelai = del <= 0 ? 55 : (del <= (CIBLES.delai || 30) ? 100 : Math.max(0, Math.round(100 - (del - CIBLES.delai) / CIBLES.delai * 100)));
    var pCpr;
    if (cpr === null) pCpr = u.noResult ? 0 : 55;
    else if (cpr === 0) pCpr = 100;
    else pCpr = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, cpr - (CIBLES.cpr || 80000)) / (CIBLES.cpr || 80000) * 100)));
    var total = Math.round(0.35 * pTaux + 0.20 * pQual + 0.20 * pDelai + 0.25 * pCpr);
    total = Math.max(0, Math.min(100, total));
    var grade = total >= 75 ? 'A' : total >= 60 ? 'B' : total >= 45 ? 'C' : 'D';
    return { total: total, grade: grade, parts: { taux: pTaux, qual: pQual, delai: pDelai, cpr: pCpr } };
  }

  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.canaux) { try { location.reload(); } catch (e2) {} return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    try { location.reload(); } catch (e3) { toast('Écriture impossible', 'err'); }
    return false;
  }

  /* ================= thème ================= */
  function detectTheme() {
    var root = $('[data-asr="root"]');
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

  /* ================= filtrage / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q.trim());
    var out = rows.filter(function (r) {
      if (UI.canal && r.nom !== UI.canal) return false;
      if (UI.statut === 'actifs' && !r.active) return false;
      if (UI.statut === 'inactifs' && r.active) return false;
      if (UI.score && r.grade !== UI.score) return false;
      if (UI.perf === 'recrutes' && !(r.rec > 0)) return false;
      if (UI.perf === 'zero' && !(r.p && r.rec === 0)) return false;
      if (UI.perf === 'payants' && !((Number(r.cout) || 0) > 0)) return false;
      if (UI.perf === 'gratuits' && (Number(r.cout) || 0) > 0) return false;
      if (UI.kpi === 'actifs' && !r.active) return false;
      if (UI.kpi === 'recrutes' && !(r.rec > 0)) return false;
      if (UI.kpi === 'payants' && !((Number(r.cout) || 0) > 0)) return false;
      if (UI.kpi === 'couteux' && !(r.cpr !== null && r.cpr > (CIBLES.cpr || 80000))) return false;
      if (UI.kpi === 'taux' && !(r.taux !== null && r.taux >= (CIBLES.taux || 10))) return false;
      if (UI.kpi === 'zero' && !r.noResult) return false;
      if (UI.kpi === 'inactifs' && r.active) return false;
      if (UI.kpi === 'gratuit' && !(!(r.cout > 0) && r.rec > 0)) return false;
      if (UI.kpi === 'retard' && !(r.delai !== null && r.delai > (CIBLES.delai || 30))) return false;
      if (q) {
        var hay = norm([r.numero, r.nom, r.description, r.notes, r.canal].join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'score') { va = a.score === null ? -1 : a.score; vb = b.score === null ? -1 : b.score; }
      else if (k === 'taux') { va = a.taux === null ? -1 : a.taux; vb = b.taux === null ? -1 : b.taux; }
      else if (k === 'cpr') { va = a.cpr === null ? 9e15 : a.cpr; vb = b.cpr === null ? 9e15 : b.cpr; }
      else if (k === 'cpc') { va = a.cpc === null ? 9e15 : a.cpc; vb = b.cpc === null ? 9e15 : b.cpc; }
      else if (k === 'delai') { va = a.delai === null ? 9e15 : a.delai; vb = b.delai === null ? 9e15 : b.delai; }
      else if (k === 'qual') { va = a.qual === null ? -1 : a.qual; vb = b.qual === null ? -1 : b.qual; }
      else if (k === 'nbCandidats') { va = Number(a.nbCandidats) || 0; vb = Number(b.nbCandidats) || 0; }
      else if (k === 'cout') { va = Number(a.cout) || 0; vb = Number(b.cout) || 0; }
      else if (k === 'ent' || k === 'rec') { va = Number(a[k]) || 0; vb = Number(b[k]) || 0; }
      else if (k === 'active') { va = a.active ? 1 : 0; vb = b.active ? 1 : 0; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.canal ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.score ? 1 : 0) + (UI.perf ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.canal = ''; UI.statut = ''; UI.score = ''; UI.perf = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Sources\s+de\s+Recrutement/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-asr="root"]');
    if (!root) {
      root = h('section', { 'data-asr': 'root', class: 'asr-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-asr-page')) {
      page.setAttribute('data-asr-page', '1');
      page.setAttribute('data-asr-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-asr-hide')) {
      natif.setAttribute('data-asr-hide', '1');
      natif.setAttribute('data-asr-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-asr="root"]'); if (root) root.remove();
    $$('[data-asr-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-asr-oldw') || '';
      n.removeAttribute('data-asr-page');
      n.removeAttribute('data-asr-oldw');
    });
    $$('[data-asr-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-asr-olddisp') || '';
      n.removeAttribute('data-asr-hide');
      n.removeAttribute('data-asr-olddisp');
    });
    $$('[data-asr]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-asr="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'asr-btn asr-btn-primary asr-backbtn', 'data-asr': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'sources-recrutement');
  }

  var CANAUX_DL = ['Site web', 'LinkedIn', 'Indeed', 'Cabinet de recrutement', 'Référence interne', 'École / Université', 'Salon professionnel', 'Réseaux sociaux', 'Presse', 'Candidature spontanée', 'Autre'];

  function buildShell() {
    var root = $('[data-asr="root"]');
    if (!root || $('[data-asr="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="asr-hero" data-asr="hero">' +
        '<div class="asr-hero-main">' +
          '<div class="asr-hero-title">' +
            '<span class="asr-hero-ico" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2 6.2 17M12 7.2 17.8 17M7.2 19h9.6"/></svg>' +
            '</span>' +
            '<div><h2 class="asr-h2">Centre de pilotage — Sources de recrutement</h2>' +
            '<p class="asr-hero-sub" data-asr="herosub"></p></div>' +
          '</div>' +
          '<div class="asr-hero-actions">' +
            '<button class="asr-btn" data-asr="btn-journal" title="Journal d\u2019activité (J)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Journal</button>' +
            '<button class="asr-btn" data-asr="btn-sim" title="Simulateur d\u2019allocation budgétaire (S)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>Simulateur</button>' +
            '<button class="asr-btn" data-asr="btn-cmp" title="Comparer des canaux (C)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3v18M15 3v18"/><rect x="3" y="6" width="6" height="9" rx="1"/><rect x="15" y="9" width="6" height="9" rx="1"/></svg>Comparer <span class="asr-nc-badge" data-asr="cmp-badge"></span></button>' +
            '<button class="asr-btn" data-asr="btn-cibles" title="Cibles et seuils de pilotage"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>Cibles</button>' +
            '<button class="asr-btn" data-asr="btn-print" title="Imprimer (P)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>Imprimer</button>' +
            '<button class="asr-btn" data-asr="btn-export" title="Exporter en CSV (E)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>Exporter CSV</button>' +
            '<button class="asr-btn asr-btn-primary" data-asr="btn-new" title="Nouvelle source (N)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Nouvelle source</button>' +
          '</div>' +
        '</div>' +
        '<div class="asr-hero-alerts" data-asr="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="asr-kpis" data-asr="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="asr-charts" data-asr="charts">' +
        '<div class="asr-chart-card"><div class="asr-chart-title">Candidats par canal</div><div class="asr-donut-wrap" data-asr="donut"></div></div>' +
        '<div class="asr-chart-card"><div class="asr-chart-title">Coût par recrutement (cible ' + kfcfa(CIBLES.cpr) + ')</div><div class="asr-bars" data-asr="bars"></div></div>' +
        '<div class="asr-chart-card"><div class="asr-chart-title">Entonnoir global candidats → embauches</div><div class="asr-funnel" data-asr="funnel"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="asr-toolbar" data-asr="toolbar">' +
        '<div class="asr-search"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input type="search" placeholder="Rechercher (source, description, notes…)" data-asr="search" aria-label="Rechercher une source" /></div>' +
        '<select data-asr="f-canal" class="asr-sel" aria-label="Filtrer par canal"></select>' +
        '<select data-asr="f-statut" class="asr-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-asr="f-score" class="asr-sel" aria-label="Filtrer par score"></select>' +
        '<select data-asr="f-perf" class="asr-sel" aria-label="Filtrer par performance"></select>' +
        '<button class="asr-chipbtn" data-asr="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="asr-count" data-asr="count"></span>' +
        '<div class="asr-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="asr-vbtn" data-asr="v-table" title="Vue tableau"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>Tableau</button>' +
          '<button class="asr-vbtn" data-asr="v-cards" title="Vue cartes"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-asr="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-asr="selbar"></div>' +

      /* PIED */
      '<div class="asr-foot">Source de vérité locale (navigateur) — journal d\u2019audit actif · cibles configurables · <button class="asr-link" data-asr="btn-native">Afficher le tableau natif</button></div>';

    /* --- listeners fixes --- */
    $('[data-asr="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-asr="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-asr="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'sources-recrutement'); window.print(); });
    $('[data-asr="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-asr="btn-sim"]', root).addEventListener('click', openSimulator);
    $('[data-asr="btn-cmp"]', root).addEventListener('click', function () { if (SEL.length >= 2) openCompare(); else { toast('Cochez au moins 2 canaux dans le tableau pour les comparer'); } });
    $('[data-asr="btn-cibles"]', root).addEventListener('click', openCibles);
    $('[data-asr="btn-native"]', root).addEventListener('click', showNative);
    $('[data-asr="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-asr="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
    var si = $('[data-asr="search"]', root);
    si.addEventListener('input', function () { UI.q = si.value; UI.page = 0; refresh(); });
    ['canal', 'statut', 'score', 'perf'].forEach(function (k) {
      var s = $('[data-asr="f-' + k + '"]', root);
      s.addEventListener('change', function () { UI[k] = s.value; UI.page = 0; refresh(); });
    });
    $('[data-asr="btn-reset"]', root).addEventListener('click', function () { resetFilters(); refresh(); });
    document.addEventListener('keydown', onKey);
  }

  function setView(v) { UI.view = v; saveUI(); refresh(); }
  function loadUI() {
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v) { if (typeof v.view === 'string') UI.view = v.view; if (typeof v.per === 'number') UI.per = v.per; } } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per })); } catch (e) {} }

  /* ================= alertes ================= */
  function computeAlerts() {
    var rows = data();
    var out = [];
    var zero = rows.filter(function (r) { return r.noResult; });
    if (zero.length) {
      var tot = zero.reduce(function (s, r) { return s + (Number(r.cout) || 0); }, 0);
      out.push({ tone: 'err', txt: zero.length + ' canal' + (zero.length > 1 ? 'aux' : '') + ' sans aucun recrutement malgré ' + fcfa(tot) + ' investis', f: 'zero' });
    }
    var couteux = rows.filter(function (r) { return r.active && r.cpr !== null && r.cpr > (CIBLES.cpr || 80000); });
    if (couteux.length) {
      var worst = couteux.slice().sort(function (a, b) { return b.cpr - a.cpr; })[0];
      out.push({ tone: 'warn', txt: couteux.length + ' canal' + (couteux.length > 1 ? 'aux' : '') + ' au-dessus du coût/recrutement cible (' + worst.nom + ' : ' + fcfa(worst.cpr) + ')', f: 'couteux' });
    }
    var inact = rows.filter(function (r) { return !r.active; });
    if (inact.length) out.push({ tone: 'info', txt: inact.length + ' canal' + (inact.length > 1 ? 'aux' : '') + ' inactif' + (inact.length > 1 ? 's' : '') + ' — ' + inact.map(function (r) { return r.nom; }).slice(0, 3).join(', '), f: 'inactifs' });
    var retard = rows.filter(function (r) { return r.active && r.delai !== null && r.delai > (CIBLES.delai || 30); });
    if (retard.length) out.push({ tone: 'warn', txt: 'Délai moyen > ' + CIBLES.delai + ' j sur ' + retard.length + ' canal' + (retard.length > 1 ? 'aux' : '') + ' (' + retard.map(function (r) { return r.nom + ' ' + r.delai + ' j'; }).slice(0, 2).join(', ') + '…)', f: 'retard' });
    var gratuit = rows.filter(function (r) { return !(r.cout > 0) && r.rec > 0; });
    if (gratuit.length) {
      var best = gratuit.slice().sort(function (a, b) { return b.rec - a.rec; })[0];
      out.push({ tone: 'ok', txt: gratuit.length + ' canal' + (gratuit.length > 1 ? 'aux' : '') + ' gratuit' + (gratuit.length > 1 ? 's' : '') + ' à résultats — priorisez ' + best.nom + ' (' + best.rec + ' recrutements à coût nul)', f: 'gratuit' });
    }
    return out.slice(0, 5);
  }

  /* ================= rendus dynamiques ================= */
  function chipHtml(txt, tone) { return '<span class="asr-chip ' + tone + '">' + esc(txt) + '</span>'; }
  function tauxTone(t) { return t === null ? 'neutral' : t >= (CIBLES.taux || 10) ? 'ok' : t >= 5 ? 'warn' : 'err'; }
  function cprTxt(r) { return r.cpr === null ? '\u2014' : r.cpr === 0 ? 'Gratuit' : fcfa(r.cpr); }

  function renderHero() {
    var rows = data();
    var actifs = rows.filter(function (r) { return r.active; });
    var cand = rows.reduce(function (s, r) { return s + r.nbCandidats; }, 0);
    var rec = rows.reduce(function (s, r) { return s + r.rec; }, 0);
    var cout = rows.reduce(function (s, r) { return s + (Number(r.cout) || 0); }, 0);
    var best = rows.filter(function (r) { return r.score !== null; }).sort(function (a, b) { return b.score - a.score; })[0];
    var sub = rows.length + ' canaux · ' + cand + ' candidats · ' + rec + ' recrutement' + (rec > 1 ? 's' : '') + ' · coût ' + kfcfa(cout) + ' FCFA · ' + (best ? 'meilleure source : ' + best.nom + ' (score ' + best.score + '/100)' : 'aucune performance enregistrée');
    $('[data-asr="herosub"]').textContent = sub;
    var zone = $('[data-asr="alerts"]');
    var al = computeAlerts();
    zone.innerHTML = al.map(function (a) {
      return '<button class="asr-alert ' + a.tone + '" data-asr="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('[data-asr="alert"]', zone).forEach(function (b) {
      b.addEventListener('click', function () { resetFilters(); UI.kpi = b.getAttribute('data-f'); refresh(); toast('Filtre appliqué : ' + b.textContent.slice(0, 60)); });
    });
  }

  function renderKPIs() {
    var rows = data();
    var actifs = rows.filter(function (r) { return r.active; });
    var cand = rows.reduce(function (s, r) { return s + r.nbCandidats; }, 0);
    var rec = rows.reduce(function (s, r) { return s + r.rec; }, 0);
    var cout = rows.reduce(function (s, r) { return s + (Number(r.cout) || 0); }, 0);
    var withRec = rows.filter(function (r) { return r.rec > 0 && (Number(r.cout) || 0) >= 0; });
    var coutRec = rows.filter(function (r) { return r.rec > 0; }).reduce(function (s, r) { return s + (Number(r.p && r.p.coutRecrutement) || 0); }, 0);
    var cprMoy = rec > 0 ? Math.round(coutRec / rec) : 0;
    var withTaux = rows.filter(function (r) { return r.taux !== null && r.nbCandidats > 0; });
    var tauxMoy = withTaux.length ? (withTaux.reduce(function (s, r) { return s + r.rec; }, 0) / withTaux.reduce(function (s, r) { return s + r.nbCandidats; }, 0) * 100) : 0;
    var zero = rows.filter(function (r) { return r.noResult; }).length;
    var kpis = [
      { t: 'CANAUX ACTIFS', v: actifs.length + '/' + rows.length, s: 'sources en production', f: 'actifs', on: UI.kpi === 'actifs' },
      { t: 'RECRUTEMENTS RÉALISÉS', v: String(rec), s: 'tous canaux confondus', f: 'recrutes', on: UI.kpi === 'recrutes' },
      { t: 'COÛT TOTAL ENGAGÉ', v: kfcfa(cout) + ' FCFA', s: 'abonnements & prestations', f: 'payants', on: UI.kpi === 'payants' },
      { t: 'COÛT / RECRUTEMENT', v: cprMoy ? fcfa(cprMoy) : '\u2014', s: 'cible ' + kfcfa(CIBLES.cpr) + ' FCFA', f: 'couteux', on: UI.kpi === 'couteux' },
      { t: 'TAUX DE CONVERSION', v: pct(tauxMoy), s: 'cible ' + pct(CIBLES.taux), f: 'taux', on: UI.kpi === 'taux' },
      { t: 'SANS RÉSULTAT', v: String(zero), s: 'coût engagé, 0 recrutement', f: 'zero', on: UI.kpi === 'zero' }
    ];
    var zone = $('[data-asr="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="asr-kpi' + (k.on ? ' on' : '') + '" data-asr="kpi" data-f="' + k.f + '" aria-pressed="' + (k.on ? 'true' : 'false') + '"><span class="asr-kpi-t">' + k.t + '</span><span class="asr-kpi-v">' + esc(k.v) + '</span><span class="asr-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('[data-asr="kpi"]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        UI.kpi = (UI.kpi === f) ? '' : f;
        UI.page = 0;
        refresh();
      });
    });
  }

  var PALETTE = ['#0d9488', '#0e7490', '#059669', '#15803d', '#b45309', '#7c2d12', '#334155', '#65a30d', '#be123c', '#7e22ce', '#475569'];

  function renderDonut() {
    var rows = data().filter(function (r) { return r.nbCandidats > 0; }).sort(function (a, b) { return b.nbCandidats - a.nbCandidats; });
    var zone = $('[data-asr="donut"]');
    if (!rows.length) { zone.innerHTML = '<div class="asr-empty">Aucun candidat.</div>'; return; }
    var tot = rows.reduce(function (s, r) { return s + r.nbCandidats; }, 0);
    var R = 56, C = 2 * Math.PI * R, off = 0;
    var slices = rows.map(function (r, i) {
      var frac = r.nbCandidats / tot;
      var seg = '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + PALETTE[i % PALETTE.length] + '" stroke-width="23" stroke-dasharray="' + (frac * C).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-off * C).toFixed(2) + '" data-asr="slice" data-nom="' + esc(r.nom) + '" style="cursor:pointer"><title>' + esc(r.nom) + ' : ' + r.nbCandidats + ' candidats</title></circle>';
      off += frac;
      return seg;
    }).join('');
    zone.innerHTML =
      '<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Candidats par canal">' +
        '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="var(--asr-neutralbg)" stroke-width="23"/>' + slices +
        '<text x="70" y="66" text-anchor="middle" font-size="19" font-weight="800" fill="var(--asr-text)">' + tot + '</text>' +
        '<text x="70" y="82" text-anchor="middle" font-size="8.5" fill="var(--asr-text2)">candidats</text>' +
      '</svg>' +
      '<div class="asr-donut-legend">' + rows.map(function (r, i) {
        return '<span class="asr-dl-item' + (UI.canal === r.nom ? ' on' : '') + '" data-asr="dl" data-nom="' + esc(r.nom) + '"><span class="asr-dl-dot" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' + esc(r.nom.length > 17 ? r.nom.slice(0, 16) + '…' : r.nom) + '<span class="asr-dl-val">' + r.nbCandidats + '</span></span>';
      }).join('') + '</div>';
    $$('[data-asr="slice"]', zone).concat($$('[data-asr="dl"]', zone)).forEach(function (n) {
      n.addEventListener('click', function () {
        var nom = n.getAttribute('data-nom');
        UI.canal = (UI.canal === nom) ? '' : nom;
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderBars() {
    var zone = $('[data-asr="bars"]');
    if (!zone) return;
    var card = zone.closest('.asr-chart-card');
    if (card) { var tt = card.querySelector('.asr-chart-title'); if (tt) tt.textContent = 'Coût par recrutement (cible ' + kfcfa(CIBLES.cpr) + ')'; }
    var rows = data().filter(function (r) { return r.cpr !== null; }).sort(function (a, b) { return b.cpr - a.cpr; });
    if (!rows.length) { zone.innerHTML = '<div class="asr-empty">Aucun coût/recrutement calculable.</div>'; return; }
    var max = Math.max.apply(null, rows.map(function (r) { return r.cpr; }));
    zone.innerHTML = rows.map(function (r) {
      var w = max > 0 ? Math.max(3, Math.round(r.cpr / max * 100)) : 3;
      var over = r.cpr > (CIBLES.cpr || 80000);
      return '<div class="asr-bar-row" data-asr="bar" data-id="' + r.id + '" title="' + esc(r.nom) + ' : ' + esc(cprTxt(r)) + ' par recrutement">' +
        '<span class="asr-bar-name">' + esc(r.nom.length > 19 ? r.nom.slice(0, 18) + '…' : r.nom) + '</span>' +
        '<span class="asr-bar-track"><span class="asr-bar-fill' + (over ? ' over' : '') + '" style="width:' + w + '%"></span>' + (over ? '<span class="asr-bar-cible" style="left:' + Math.round((CIBLES.cpr || 80000) / max * 100) + '%"></span>' : '') + '</span>' +
        '<span class="asr-bar-val">' + esc(cprTxt(r)) + '</span></div>';
    }).join('');
    $$('[data-asr="bar"]', zone).forEach(function (n) {
      n.addEventListener('click', function () { openDrawer(Number(n.getAttribute('data-id'))); });
    });
  }

  function renderFunnel() {
    var rows = data().filter(function (r) { return r.p; });
    var zone = $('[data-asr="funnel"]');
    if (!rows.length) { zone.innerHTML = '<div class="asr-empty">Aucune donnée de performance.</div>'; return; }
    var cand = rows.reduce(function (s, r) { return s + r.nbCandidats; }, 0);
    var ent = rows.reduce(function (s, r) { return s + r.ent; }, 0);
    var rec = rows.reduce(function (s, r) { return s + r.rec; }, 0);
    function bar(cls, val, label, wmax) {
      var w = wmax > 0 ? Math.max(14, Math.round(val / wmax * 100)) : 14;
      return '<div class="asr-fstage"><div class="asr-fbar ' + cls + '" style="width:' + w + '%">' + val + '</div><div class="asr-flabel">' + label + '</div></div>';
    }
    zone.innerHTML =
      bar('s1', cand, 'Candidats générés', cand) +
      '<div class="asf-arrow">▼ ' + (cand > 0 ? pct(ent / cand * 100) : '\u2014') + ' convocation en entretien</div>' +
      bar('s2', ent, 'Entretiens menés', cand) +
      '<div class="asf-arrow">▼ ' + (ent > 0 ? pct(rec / ent * 100) : '\u2014') + ' offre acceptée</div>' +
      bar('s3', rec, 'Recrutements finalisés', cand);
  }

  function renderFilters() {
    var rows = data();
    var canaux = rows.map(function (r) { return r.nom; });
    function opts(sel, list, cur) {
      return '<option value="">' + sel + '</option>' + list.map(function (o) { return '<option value="' + esc(o.v) + '"' + (cur === o.v ? ' selected' : '') + '>' + esc(o.l) + '</option>'; }).join('');
    }
    $('[data-asr="f-canal"]').innerHTML = opts('Tous les canaux', canaux.map(function (c) { return { v: c, l: c }; }), UI.canal);
    $('[data-asr="f-statut"]').innerHTML = opts('Statut : tous', [{ v: 'actifs', l: 'Actifs' }, { v: 'inactifs', l: 'Inactifs' }], UI.statut);
    $('[data-asr="f-score"]').innerHTML = opts('Score : tous', [{ v: 'A', l: 'Grade A (≥ 75)' }, { v: 'B', l: 'Grade B (60-74)' }, { v: 'C', l: 'Grade C (45-59)' }, { v: 'D', l: 'Grade D (< 45)' }, { v: 'NA', l: 'Sans performance' }], UI.score);
    $('[data-asr="f-perf"]').innerHTML = opts('Performance : tous', [{ v: 'recrutes', l: 'Avec recrutements' }, { v: 'zero', l: 'Sans recrutement' }, { v: 'payants', l: 'Canaux payants' }, { v: 'gratuits', l: 'Canaux gratuits' }], UI.perf);
    var cnt = activeFilterCount();
    $('[data-asr="btn-reset"]').hidden = cnt === 0;
    var fl = filtered();
    $('[data-asr="count"]').textContent = fl.length + ' source' + (fl.length > 1 ? 's' : '') + (cnt ? ' (filtré)' : '');
    $('[data-asr="v-table"]').classList.toggle('on', UI.view === 'table');
    $('[data-asr="v-cards"]').classList.toggle('on', UI.view === 'cards');
  }

  /* ================= table ================= */
  var COLS = [
    { k: 'numero', l: 'N°', sort: true },
    { k: 'nom', l: 'Source', sort: true },
    { k: 'nbCandidats', l: 'Candidats', sort: true, num: true },
    { k: 'ent', l: 'Entretiens', sort: true, num: true },
    { k: 'rec', l: 'Recrutements', sort: true, num: true },
    { k: 'taux', l: 'Taux transf.', sort: true, num: true },
    { k: 'cpc', l: 'Coût/candidat', sort: true, num: true },
    { k: 'cpr', l: 'Coût/recrutement', sort: true, num: true },
    { k: 'delai', l: 'Délai (j)', sort: true, num: true },
    { k: 'qual', l: 'Qualité /20', sort: true, num: true },
    { k: 'score', l: 'Score', sort: true, num: true },
    { k: 'active', l: 'Statut', sort: true },
    { k: 'notes', l: 'Notes', sort: false },
    { k: '_act', l: 'Actions', sort: false }
  ];
  function renderContent() {
    var zone = $('[data-asr="content"]');
    if (!zone) return;
    if (UI.view === 'cards') renderCards(zone); else renderTable(zone);
  }
  function renderTable(zone) {
    var fl = filtered();
    var per = UI.per, pages = Math.max(1, Math.ceil(fl.length / per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pageRows = fl.slice(UI.page * per, UI.page * per + per);
    var thead = '<tr><th style="width:30px"><input type="checkbox" class="asr-chk" data-asr="chk-all" aria-label="Tout sélectionner la page"></th>' +
      COLS.map(function (c) {
        if (!c.sort) return '<th>' + c.l + '</th>';
        var ar = UI.sortKey === c.k ? (UI.sortDir === 1 ? '▲' : '▼') : '';
        return '<th data-sort="' + c.k + '" tabindex="0" role="button" aria-label="Trier par ' + esc(c.l) + '">' + c.l + (ar ? ' <span class="asr-arrow">' + ar + '</span>' : '') + '</th>';
      }).join('') + '</tr>';
    var tbody = pageRows.map(function (r) {
      var funnel = r.p ? '<span class="asr-fmini" title="Candidats → entretiens → recrutements"><i class="f1" style="width:' + (r.nbCandidats ? Math.min(100, Math.round(r.ent / Math.max(1, r.nbCandidats) * 100)) : 0) + '%"></i><i class="f2" style="width:' + (r.nbCandidats ? Math.min(100, Math.round(r.rec / Math.max(1, r.nbCandidats) * 100)) : 0) + '%"></i></span>' : '<span class="asr-num">\u2014</span>';
      var gauge = r.qual === null ? '\u2014' : '<span class="asr-gauge" title="Qualité ' + r.qual + '/20"><i style="width:' + Math.round(r.qual / 20 * 100) + '%"></i></span> ' + r.qual;
      var score = r.score === null ? '<span class="asr-grade NA">N/A</span>' : '<span class="asr-grade ' + r.grade + '">' + r.grade + '</span><span class="asr-scorebar"><span class="asr-scorefill" style="width:' + r.score + '%"></span></span>';
      var notes = r.notes ? (r.notes.length > 34 ? '<span title="' + esc(r.notes) + '">' + esc(r.notes.slice(0, 33)) + '…</span>' : esc(r.notes)) : '\u2014';
      return '<tr data-id="' + r.id + '"' + (r.active ? '' : ' class="inactive"') + '>' +
        '<td><input type="checkbox" class="asr-chk" data-asr="chk" data-id="' + r.id + '"' + (SEL.indexOf(Number(r.id)) >= 0 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.nom) + '"></td>' +
        '<td class="asr-num">' + esc(r.numero) + '</td>' +
        '<td><span class="asr-srcname" data-asr="open" data-id="' + r.id + '" title="Ouvrir le détail" tabindex="0" role="button">' + esc(r.nom) + '</span><span class="asr-srcdesc" title="' + esc(r.description) + '">' + esc(r.description || '\u2014') + '</span></td>' +
        '<td class="asr-numcell">' + r.nbCandidats + '</td>' +
        '<td class="asr-numcell">' + (r.p ? r.ent : '\u2014') + '</td>' +
        '<td class="asr-numcell">' + (r.p ? r.rec : '\u2014') + '</td>' +
        '<td style="text-align:center">' + funnel + '</td>' +
        '<td style="text-align:center">' + (r.taux === null ? '\u2014' : chipHtml(pct(r.taux), tauxTone(r.taux))) + '</td>' +
        '<td class="asr-right">' + (r.cpc === null ? '\u2014' : r.cpc === 0 ? 'Gratuit' : fcfa(r.cpc)) + '</td>' +
        '<td class="asr-right">' + esc(cprTxt(r)) + '</td>' +
        '<td class="asr-numcell">' + (r.delai === null ? '\u2014' : r.delai) + '</td>' +
        '<td style="text-align:center;white-space:nowrap">' + gauge + '</td>' +
        '<td style="text-align:center">' + score + '</td>' +
        '<td style="text-align:center">' + chipHtml(r.active ? 'Actif' : 'Inactif', r.active ? 'ok' : 'neutral') + '</td>' +
        '<td style="max-width:200px;font-size:.72rem;color:var(--asr-text2)">' + notes + '</td>' +
        '<td><div class="asr-actions">' +
          '<button class="asr-ic" data-asr="view" data-id="' + r.id + '" title="Voir le détail" aria-label="Voir ' + esc(r.nom) + '">👁</button>' +
          '<button class="asr-ic" data-asr="edit" data-id="' + r.id + '" title="Modifier" aria-label="Modifier ' + esc(r.nom) + '">✎</button>' +
          '<button class="asr-ic" data-asr="dup" data-id="' + r.id + '" title="Dupliquer" aria-label="Dupliquer ' + esc(r.nom) + '">⧉</button>' +
          '<button class="asr-ic danger" data-asr="del" data-id="' + r.id + '" title="Supprimer" aria-label="Supprimer ' + esc(r.nom) + '">🗑</button>' +
        '</div></td>' +
      '</tr>';
    }).join('') || '<tr><td colspan="' + (COLS.length + 1) + '"><div class="asr-empty">Aucune source ne correspond aux filtres.</div></td></tr>';
    zone.innerHTML =
      '<div class="asr-tblcard"><div class="asr-tblwrap"><table class="asr-tbl"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table></div>' +
      '<div class="asr-pager" data-asr="pager"></div></div>';
    /* tri */
    $$('th[data-sort]', zone).forEach(function (th) {
      function doSort() {
        var k = th.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir *= -1; else { UI.sortKey = k; UI.sortDir = (k === 'cpr' || k === 'cpc' || k === 'delai') ? 1 : -1; }
        UI.page = 0; refresh();
      }
      th.addEventListener('click', doSort);
      th.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doSort(); } });
    });
    /* actions */
    $$('[data-asr="open"]', zone).forEach(function (n) {
      function open() { openDrawer(Number(n.getAttribute('data-id'))); }
      n.addEventListener('click', open);
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
    });
    $$('[data-asr="view"]', zone).forEach(function (n) { n.addEventListener('click', function () { openDrawer(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="edit"]', zone).forEach(function (n) { n.addEventListener('click', function () { openDialog(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="dup"]', zone).forEach(function (n) { n.addEventListener('click', function () { duplicate(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="del"]', zone).forEach(function (n) { n.addEventListener('click', function () { askDelete(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="chk"]', zone).forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = Number(cb.getAttribute('data-id'));
        if (cb.checked) { if (SEL.indexOf(id) < 0) SEL.push(id); }
        else { SEL = SEL.filter(function (x) { return x !== id; }); }
        refresh();
      });
    });
    var all = $('[data-asr="chk-all"]', zone);
    if (all) {
      all.checked = pageRows.length > 0 && pageRows.every(function (r) { return SEL.indexOf(Number(r.id)) >= 0; });
      all.indeterminate = !all.checked && pageRows.some(function (r) { return SEL.indexOf(Number(r.id)) >= 0; });
      all.addEventListener('change', function () {
        pageRows.forEach(function (r) {
          var id = Number(r.id);
          if (all.checked) { if (SEL.indexOf(id) < 0) SEL.push(id); }
          else SEL = SEL.filter(function (x) { return x !== id; });
        });
        refresh();
      });
    }
    renderPager(zone, fl.length, pages);
  }
  function renderPager(zone, total, pages) {
    var pg = $('[data-asr="pager"]', zone);
    if (!pg) return;
    if (pages <= 1 && total <= UI.per) { pg.innerHTML = '<span>' + total + ' source(s)</span>'; return; }
    var nums = [];
    for (var i = 0; i < pages; i++) nums.push('<button class="asr-pgbtn' + (i === UI.page ? ' on' : '') + '" data-pg="' + i + '" aria-label="Page ' + (i + 1) + '">' + (i + 1) + '</button>');
    pg.innerHTML =
      '<span>' + total + ' source(s) · ' + UI.per + '/page</span>' +
      '<select class="asr-sel" data-asr="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) { return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>'; }).join('') + '</select>' +
      '<button class="asr-pgbtn" data-pg="prev"' + (UI.page === 0 ? ' disabled' : '') + '>‹ Préc.</button>' +
      nums.join('') +
      '<button class="asr-pgbtn" data-pg="next"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>Suiv. ›</button>';
    $$('[data-pg]', pg).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-pg');
        if (v === 'prev') UI.page = Math.max(0, UI.page - 1);
        else if (v === 'next') UI.page = Math.min(pages - 1, UI.page + 1);
        else UI.page = Number(v);
        refresh();
      });
    });
    $('[data-asr="per"]', pg).addEventListener('change', function (e) { UI.per = Number(e.target.value) || 10; UI.page = 0; saveUI(); refresh(); });
  }

  /* ================= cartes ================= */
  function renderCards(zone) {
    var fl = filtered();
    var per = UI.per, pages = Math.max(1, Math.ceil(fl.length / per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pageRows = fl.slice(UI.page * per, UI.page * per + per);
    zone.innerHTML = '<div class="asr-cards">' + pageRows.map(function (r) {
      var f1 = r.nbCandidats ? Math.min(100, Math.round(r.ent / Math.max(1, r.nbCandidats) * 100)) : 0;
      var f3 = r.nbCandidats ? Math.min(100, Math.round(r.rec / Math.max(1, r.nbCandidats) * 100)) : 0;
      var grade = r.score === null ? '<span class="asr-grade NA">N/A</span>' : '<span class="asr-grade ' + r.grade + '" title="Score ' + r.score + '/100">' + r.grade + '</span>';
      return '<div class="asr-card' + (r.active ? '' : ' inactive') + '" data-id="' + r.id + '">' +
        '<div class="asr-card-top"><div><span class="asr-card-name" data-asr="open" data-id="' + r.id + '" tabindex="0" role="button">' + esc(r.nom) + '</span>' +
        '<span class="asr-srcdesc">' + esc(r.description || '\u2014') + '</span></div>' + grade + '</div>' +
        '<div class="asr-card-funnel"><span>Entonnoir : ' + r.nbCandidats + ' → ' + (r.p ? r.ent : '?') + ' → ' + (r.p ? r.rec : '?') + '</span>' +
        '<span class="asr-fmini"><i class="f1" style="width:' + f1 + '%"></i><i class="f2" style="width:' + f3 + '%"></i></span></div>' +
        '<div class="asr-card-meta">' +
          (r.taux === null ? '' : chipHtml(pct(r.taux), tauxTone(r.taux))) +
          chipHtml(r.cpr === null ? 'coût/recrutement n/a' : r.cpr === 0 ? 'recrutement gratuit' : kfcfa(r.cpr) + '/recrut.', r.cpr === null ? 'neutral' : r.cpr === 0 ? 'ok' : r.cpr > (CIBLES.cpr || 80000) ? 'err' : 'ok') +
          (r.delai === null ? '' : chipHtml(r.delai + ' j', r.delai > (CIBLES.delai || 30) ? 'warn' : 'info')) +
          chipHtml(r.active ? 'Actif' : 'Inactif', r.active ? 'ok' : 'neutral') +
        '</div>' +
        '<div class="asr-card-foot">' +
          '<label class="asr-switch" title="' + (r.active ? 'Désactiver' : 'Activer') + ' ce canal"><input type="checkbox" data-asr="sw" data-id="' + r.id + '"' + (r.active ? ' checked' : '') + ' aria-label="Canal actif"><span></span></label>' +
          '<span class="asr-num">' + esc(r.numero) + '</span>' +
          '<div class="asr-card-act">' +
            '<button class="asr-ic" data-asr="view" data-id="' + r.id + '" title="Voir">👁</button>' +
            '<button class="asr-ic" data-asr="edit" data-id="' + r.id + '" title="Modifier">✎</button>' +
            '<button class="asr-ic" data-asr="dup" data-id="' + r.id + '" title="Dupliquer">⧉</button>' +
            '<button class="asr-ic danger" data-asr="del" data-id="' + r.id + '" title="Supprimer">🗑</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') || '<div class="asr-empty">Aucune source ne correspond aux filtres.</div>' + '</div>';
    $$('[data-asr="open"]', zone).forEach(function (n) { n.addEventListener('click', function () { openDrawer(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="view"]', zone).forEach(function (n) { n.addEventListener('click', function () { openDrawer(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="edit"]', zone).forEach(function (n) { n.addEventListener('click', function () { openDialog(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="dup"]', zone).forEach(function (n) { n.addEventListener('click', function () { duplicate(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="del"]', zone).forEach(function (n) { n.addEventListener('click', function () { askDelete(Number(n.getAttribute('data-id'))); }); });
    $$('[data-asr="sw"]', zone).forEach(function (sw) {
      sw.addEventListener('change', function () { toggleActive(Number(sw.getAttribute('data-id')), sw.checked); });
    });
  }

  /* ================= multi-sélection ================= */
  var SEL = [];
  function renderSelBar() {
    var bar = $('[data-asr="selbar"]');
    if (!bar) return;
    if (SEL.length < 2) { bar.innerHTML = ''; updateCmpBadge(); return; }
    var rows = data().filter(function (r) { return SEL.indexOf(Number(r.id)) >= 0; });
    var cand = rows.reduce(function (s, r) { return s + r.nbCandidats; }, 0);
    var rec = rows.reduce(function (s, r) { return s + r.rec; }, 0);
    var cout = rows.reduce(function (s, r) { return s + (Number(r.cout) || 0); }, 0);
    bar.innerHTML = '<div class="asr-selbar">' +
      '<span class="asr-selbar-info">' + SEL.length + ' canal' + (SEL.length > 1 ? 'aux' : '') + ' sélectionné' + (SEL.length > 1 ? 's' : '') + '</span>' +
      '<span class="asr-selbar-sub">' + cand + ' candidats · ' + rec + ' recrutements · ' + fcfa(cout) + '</span>' +
      '<button class="asr-btn asr-btn-primary" data-asr="sb-cmp">Comparer</button>' +
      '<button class="asr-btn asr-btn-ghost" data-asr="sb-exp">Exporter la sélection</button>' +
      '<button class="asr-btn asr-btn-ghost" data-asr="sb-act">Activer</button>' +
      '<button class="asr-btn asr-btn-ghost" data-asr="sb-des">Désactiver</button>' +
      '<button class="asr-btn asr-btn-danger" data-asr="sb-del">Supprimer</button>' +
      '<button class="asr-btn asr-btn-ghost" data-asr="sb-x">Désélectionner</button>' +
      '</div>';
    $('[data-asr="sb-cmp"]', bar).addEventListener('click', openCompare);
    $('[data-asr="sb-exp"]', bar).addEventListener('click', function () { exportCSV(rows.slice()); });
    $('[data-asr="sb-act"]', bar).addEventListener('click', function () { setGroupActive(true); });
    $('[data-asr="sb-des"]', bar).addEventListener('click', function () { setGroupActive(false); });
    $('[data-asr="sb-del"]', bar).addEventListener('click', askDeleteGroup);
    $('[data-asr="sb-x"]', bar).addEventListener('click', function () { SEL = []; refresh(); });
    updateCmpBadge();
  }
  function updateCmpBadge() {
    var b = $('[data-asr="cmp-badge"]');
    if (!b) return;
    var n = SEL.length;
    b.textContent = n ? String(n) : '';
    b.style.display = n ? 'inline-grid' : 'none';
  }
  function setGroupActive(on) {
    var ids = SEL.slice();
    mutate(function (cur) {
      cur.canaux = cur.canaux.map(function (c) { return ids.indexOf(Number(c.id)) >= 0 ? Object.assign({}, c, { active: on }) : c; });
      return cur;
    }, 'Statut groupé canaux', ids.length + ' canal(aux) → ' + (on ? 'actifs' : 'inactifs'));
    toast(ids.length + ' canal(aux) ' + (on ? 'activé(s)' : 'désactivé(s)'));
    SEL = [];
    refresh();
  }
  function askDeleteGroup() {
    var ids = SEL.slice();
    var rows = data().filter(function (r) { return ids.indexOf(Number(r.id)) >= 0; });
    var cout = rows.reduce(function (s, r) { return s + (Number(r.cout) || 0); }, 0);
    confirmBox('Supprimer ' + ids.length + ' canal(aux) ?',
      rows.map(function (r) { return r.nom; }).join(', ') + ' — ' + fcfa(cout) + ' de coût annuel seront retirés du suivi. Cette action est définitive.',
      function () {
        var noms = rows.map(function (r) { return r.nom; });
        mutate(function (cur) {
          cur.canaux = cur.canaux.filter(function (c) { return ids.indexOf(Number(c.id)) < 0; });
          cur.performances = cur.performances.filter(function (p) { return noms.indexOf(p.source) < 0 && ids.indexOf(Number(p.id)) < 0; });
          return cur;
        }, 'Suppression groupée canaux', rows.length + ' canal(aux)');
        SEL = [];
        refresh();
      });
  }

  /* ================= drawer détail ================= */
  function openDrawer(id) {
    closeDrawer();
    var r = rowById(id);
    if (!r) return;
    UI.drawer = id;
    var back = h('div', { class: 'asr-backdrop', 'data-asr': 'backdrop', 'data-asr-for': 'drawer' });
    back.addEventListener('click', function (e) { if (e.target === back) closeDrawer(); });
    var d = h('div', { class: 'asr-drawer', 'data-asr': 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Détail source ' + (r.nom || '') });
    var parts = r.parts;
    var scoreBlock = '';
    if (parts) {
      scoreBlock =
        '<div class="asr-fsec">Score de performance — ' + r.score + '/100 (grade ' + r.grade + ')</div>' +
        '<div class="asr-bars">' +
          simBar('Taux de conversion (cible ' + pct(CIBLES.taux) + ')', parts.taux) +
          simBar('Qualité moyenne (cible ' + CIBLES.qualite + '/20)', parts.qual) +
          simBar('Délai (cible ≤ ' + CIBLES.delai + ' j)', parts.delai) +
          simBar('Coût/recrutement (cible ≤ ' + kfcfa(CIBLES.cpr) + ')', parts.cpr) +
        '</div>';
    } else {
      scoreBlock = '<div class="asr-fsec">Score de performance</div><div class="asr-empty">Aucune ligne de performance associée — renseignez les entretiens et recrutements pour calculer le score.</div>';
    }
    var funnel = r.p ?
      '<div class="asr-fsec">Entonnoir du canal</div>' +
      '<div class="asr-funnel">' +
        '<div class="asr-fstage"><div class="asr-fbar s1" style="width:100%">' + r.nbCandidats + '</div><div class="asr-flabel">Candidats</div></div>' +
        '<div class="asf-arrow">▼ ' + (r.nbCandidats ? pct(r.ent / r.nbCandidats * 100) : '\u2014') + '</div>' +
        '<div class="asr-fstage"><div class="asr-fbar s2" style="width:' + Math.max(18, r.nbCandidats ? Math.round(r.ent / r.nbCandidats * 100) : 18) + '%">' + r.ent + '</div><div class="asr-flabel">Entretiens</div></div>' +
        '<div class="asf-arrow">▼ ' + (r.ent ? pct(r.rec / r.ent * 100) : '\u2014') + '</div>' +
        '<div class="asr-fstage"><div class="asr-fbar s3" style="width:' + Math.max(12, r.nbCandidats ? Math.round(r.rec / r.nbCandidats * 100) : 12) + '%">' + r.rec + '</div><div class="asr-flabel">Recrutements</div></div>' +
      '</div>' : '';
    d.innerHTML =
      '<div class="asr-drawer-head"><div><div class="asr-drawer-title">' + esc(r.nom) + '</div>' +
      '<div class="asr-drawer-sub">' + esc(r.numero) + ' · ' + (r.active ? 'Canal actif' : 'Canal inactif') + (r.score !== null ? ' · score ' + r.score + '/100' : '') + '</div></div>' +
      '<button class="asr-drawer-x" aria-label="Fermer le détail">✕</button></div>' +
      '<div class="asr-drawer-body">' +
        '<dl class="asr-kv">' +
          '<dt>Description</dt><dd>' + esc(r.description || '\u2014') + '</dd>' +
          '<dt>Candidats générés</dt><dd>' + r.nbCandidats + '</dd>' +
          '<dt>Coût engagé</dt><dd>' + (r.cout > 0 ? fcfa(r.cout) : 'Gratuit') + '</dd>' +
          '<dt>Coût / candidat</dt><dd>' + (r.cpc === null ? '\u2014' : r.cpc === 0 ? 'Gratuit' : fcfa(r.cpc)) + '</dd>' +
          (r.p ? '<dt>Entretiens</dt><dd>' + r.ent + '</dd>' : '') +
          (r.p ? '<dt>Recrutements</dt><dd>' + r.rec + '</dd>' : '') +
          (r.taux !== null ? '<dt>Taux de transformation</dt><dd>' + pct(r.taux) + '</dd>' : '') +
          (r.cpr !== null ? '<dt>Coût / recrutement</dt><dd>' + (r.cpr === 0 ? 'Gratuit' : fcfa(r.cpr)) + '</dd>' : '') +
          (r.noResult ? '<dt>⚠ Situation</dt><dd>Coût engagé sans aucun recrutement</dd>' : '') +
          (r.delai !== null ? '<dt>Délai moyen</dt><dd>' + r.delai + ' jours</dd>' : '') +
          (r.qual !== null ? '<dt>Qualité moyenne</dt><dd>' + r.qual + ' / 20</dd>' : '') +
          (r.canal ? '<dt>Canal de diffusion</dt><dd>' + esc(r.canal) + '</dd>' : '') +
        '</dl>' +
        funnel + scoreBlock +
        '<div class="asr-fsec">Notes</div>' +
        '<textarea class="asr-ta asr-in" data-asr="d-notes" rows="3" placeholder="Notes internes sur ce canal…">' + esc(r.notes) + '</textarea>' +
        '<div class="asr-drawer-actions">' +
          '<button class="asr-btn asr-btn-primary" data-asr="d-save-notes">Enregistrer les notes</button>' +
          '<button class="asr-btn asr-btn-ghost" data-asr="d-edit">✎ Modifier</button>' +
          '<button class="asr-btn asr-btn-ghost" data-asr="d-dup">⧉ Dupliquer</button>' +
          '<button class="asr-btn asr-btn-ghost" data-asr="d-toggle">' + (r.active ? 'Désactiver' : 'Activer') + '</button>' +
          '<button class="asr-btn asr-btn-ghost" data-asr="d-prev" title="Créer une prévision de poste en utilisant ce canal">Planifier via ce canal →</button>' +
          '<button class="asr-btn asr-btn-danger" data-asr="d-del">Supprimer</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(back);
    document.body.appendChild(d);
    $('.asr-drawer-x', d).addEventListener('click', closeDrawer);
    $('[data-asr="d-save-notes"]', d).addEventListener('click', function () {
      var v = $('[data-asr="d-notes"]', d).value;
      saveNotes(r.id, v);
    });
    $('[data-asr="d-edit"]', d).addEventListener('click', function () { var nid = r.id; closeDrawer(); openDialog(nid); });
    $('[data-asr="d-dup"]', d).addEventListener('click', function () { closeDrawer(); duplicate(r.id); });
    $('[data-asr="d-toggle"]', d).addEventListener('click', function () { toggleActive(r.id, !r.active); closeDrawer(); });
    $('[data-asr="d-prev"]', d).addEventListener('click', function () { planPrev(r); });
    $('[data-asr="d-del"]', d).addEventListener('click', function () { closeDrawer(); askDelete(r.id); });
  }
  function simBar(label, val) {
    return '<div class="asr-bar-row" style="grid-template-columns:190px 1fr 44px;cursor:default"><span class="asr-bar-name">' + esc(label) + '</span>' +
      '<span class="asr-bar-track"><span class="asr-bar-fill" style="width:' + Math.max(2, Math.min(100, val)) + '%"></span></span>' +
      '<span class="asr-bar-val">' + val + '</span></div>';
  }
  function closeDrawer() {
    $$('[data-asr="drawer"],[data-asr="backdrop"][data-asr-for="drawer"]').forEach(function (n) { n.remove(); });
    UI.drawer = 0;
  }
  function saveNotes(id, notes) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      cur.performances = cur.performances.map(function (p) { return r.p && Number(p.id) === Number(r.p.id) ? Object.assign({}, p, { notes: notes }) : p; });
      return cur;
    }, 'Notes canal', r.nom);
    toast('Notes enregistrées pour ' + r.nom, 'ok');
  }

  /* ================= dialog création / édition ================= */
  function openDialog(editId) {
    var root = $('[data-asr="root"]'); if (!root) return;
    closeDialog();
    UI.editId = editId || null;
    var r = editId ? rowById(editId) : null;
    var back = h('div', { class: 'asr-backdrop', 'data-asr': 'backdrop', 'data-asr-for': 'dialog' });
    back.addEventListener('click', function (e) { if (e.target === back) closeDialog(); });
    var dl0 = h('div', { class: 'asr-dialog', 'data-asr': 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': (r ? 'Modifier' : 'Nouvelle') + ' source de recrutement' });
    var v = function (k) { return r && r[k] != null ? String(r[k]) : ''; };
    var pv = r && r.p ? r.p : null;
    var dlOptions = CANAUX_DL.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('');
    dl0.innerHTML =
      '<div class="asr-dialog-head"><h3>' + (r ? 'Modifier la source — ' + esc(r.nom) : 'Nouvelle source de recrutement') + '</h3>' +
      '<button class="asr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asr-dialog-body">' +
        '<div class="asr-fsec">Identité du canal</div>' +
        '<div class="asr-fgrid">' +
          '<label class="asr-lab full">Nom de la source *<input class="asr-in" type="text" data-asr="i-nom" value="' + esc(v('nom')) + '" placeholder="ex. LinkedIn, Cabinet, Salon emploi…"></label>' +
          '<label class="asr-lab full">Description<textarea class="asr-ta asr-in" data-asr="i-desc" rows="2" placeholder="À quoi sert ce canal ?">' + esc(v('description')) + '</textarea></label>' +
          '<label class="asr-lab">Statut du canal<select class="asr-in" data-asr="i-active"><option value="1"' + (!r || r.active ? ' selected' : '') + '>Actif</option><option value="0"' + (r && !r.active ? ' selected' : '') + '>Inactif</option></select></label>' +
          '<label class="asr-lab">Canal de diffusion<input class="asr-in" type="text" data-asr="i-canal" list="asr-canaux-dl" value="' + esc(r ? r.canal : '') + '" placeholder="ex. LinkedIn">' +
          '<datalist id="asr-canaux-dl">' + dlOptions + '</datalist></label>' +
        '</div>' +
        '<div class="asr-fsec">Volume &amp; coût</div>' +
        '<div class="asr-fgrid">' +
          '<label class="asr-lab">Nb candidats générés<input class="asr-in" type="number" min="0" step="1" data-asr="i-cand" value="' + esc(r ? String(r.nbCandidats) : '0') + '"></label>' +
          '<label class="asr-lab">Coût annuel (FCFA)<input class="asr-in" type="number" min="0" step="1000" data-asr="i-cout" value="' + esc(r ? String(r.cout) : '0') + '"></label>' +
          '<label class="asr-lab">Nb entretiens obtenus<input class="asr-in" type="number" min="0" step="1" data-asr="i-ent" value="' + esc(String(pv ? (Number(pv.nbEntretiens) || 0) : 0)) + '"></label>' +
          '<label class="asr-lab">Nb recrutements finalisés<input class="asr-in" type="number" min="0" step="1" data-asr="i-rec" value="' + esc(String(pv ? (Number(pv.nbRecrutements) || 0) : 0)) + '"></label>' +
        '</div>' +
        '<div class="asr-fsec">Qualité</div>' +
        '<div class="asr-fgrid">' +
          '<label class="asr-lab">Délai moyen (jours)<input class="asr-in" type="number" min="0" step="1" data-asr="i-delai" value="' + esc(String(pv ? (Number(pv.delaiMoyen) || 0) : 0)) + '"></label>' +
          '<label class="asr-lab">Qualité moyenne (/20)<input class="asr-in" type="number" min="0" max="20" step="0.1" data-asr="i-qual" value="' + esc(String(pv ? (Number(pv.qualiteMoyenne) || 0) : 0)) + '"></label>' +
        '</div>' +
        '<div class="asr-fsec">Notes</div>' +
        '<label class="asr-lab full">Notes<textarea class="asr-ta asr-in" data-asr="i-notes" rows="2">' + esc(r ? r.notes : '') + '</textarea></label>' +
        '<div class="asr-live" data-asr="live"></div>' +
        '<div class="asr-form-err" data-asr="ferr" hidden></div>' +
      '</div>' +
      '<div class="asr-dialog-foot">' +
        '<span class="asr-form-hint">* obligatoire — taux, coûts unitaires et score sont recalculés automatiquement</span>' +
        '<div><button class="asr-btn asr-btn-ghost" data-asr="c-cancel">Annuler</button> ' +
        '<button class="asr-btn asr-btn-primary" data-asr="c-save">' + (r ? 'Enregistrer' : 'Créer la source') + '</button></div>' +
      '</div>';
    document.body.appendChild(back);
    document.body.appendChild(dl0);
    function updLive() {
      var g = function (k) { var e = $('[data-asr="' + k + '"]', dl0); return e ? e.value : ''; };
      var cand = Number(g('i-cand')) || 0, cout = Number(g('i-cout')) || 0;
      var ent = Number(g('i-ent')) || 0, rec = Number(g('i-rec')) || 0;
      var delai = Number(g('i-delai')) || 0, qual = Number(g('i-qual')) || 0;
      var taux = cand > 0 ? Math.round(rec / cand * 1000) / 10 : 0;
      var cpc = cand > 0 ? Math.round(cout / cand) : null;
      var cpr = rec > 0 ? Math.round(cout / rec) : null;
      var fake = { p: { tauxTransformation: taux, qualiteMoyenne: qual, delaiMoyen: delai, nbRecrutements: rec }, cpr: cpr, noResult: rec === 0 && cout > 0, nbCandidats: cand, cout: cout };
      var sc = rec > 0 || ent > 0 || cand > 0 ? scoreOf(fake) : { total: null, grade: 'NA' };
      $('[data-asr="live"]', dl0).innerHTML =
        '<span>Taux : <b>' + pct(taux) + '</b></span>' +
        '<span>Coût/candidat : <b>' + (cpc === null ? '\u2014' : cpc === 0 ? 'Gratuit' : fcfa(cpc)) + '</b></span>' +
        '<span>Coût/recrutement : <b class="' + (cpr !== null && cpr > (CIBLES.cpr || 80000) ? 'bad' : '') + '">' + (cpr === null ? '\u2014' : cpr === 0 ? 'Gratuit' : fcfa(cpr)) + '</b></span>' +
        '<span>Score estimé : <b>' + (sc.total === null ? '\u2014' : sc.total + '/100 (' + sc.grade + ')') + '</b></span>' +
        ((ent > cand || rec > cand || rec > ent) ? '<span class="bad">⚠ cohérence : entretiens/recrutements ≤ candidats attendu</span>' : '');
    }
    $$('input,select,textarea', dl0).forEach(function (i2) { i2.addEventListener('input', updLive); });
    updLive();
    $('.asr-drawer-x', dl0).addEventListener('click', closeDialog);
    $('[data-asr="c-cancel"]', dl0).addEventListener('click', closeDialog);
    $('[data-asr="c-save"]', dl0).addEventListener('click', function () { saveDialog(); });
    $('[data-asr="i-nom"]', dl0).focus();
  }
  function closeDialog() {
    $$('[data-asr="dialog"],[data-asr="backdrop"][data-asr-for="dialog"]').forEach(function (n) { n.remove(); });
    $$('#asr-canaux-dl').forEach(function (n) { n.remove(); });
    UI.dialog = 0; UI.editId = null;
  }
  function saveDialog() {
    var dl0 = $('[data-asr="dialog"]'); if (!dl0) return;
    var g = function (k) { var e = $('[data-asr="' + k + '"]', dl0); return e ? e.value.trim() : ''; };
    var nom = g('i-nom');
    var cand = Number(g('i-cand')) || 0, cout = Number(g('i-cout')) || 0;
    var ent = Number(g('i-ent')) || 0, rec = Number(g('i-rec')) || 0;
    var delai = Number(g('i-delai')) || 0, qual = Number(g('i-qual')) || 0;
    var err = '';
    if (!nom) err = 'Le nom de la source est obligatoire.';
    else if (rec > cand || ent > cand) err = 'Incohérence : entretiens et recrutements ne peuvent dépasser les candidats générés.';
    else if (rec > ent) err = 'Incohérence : les recrutements ne peuvent dépasser les entretiens.';
    else if (qual < 0 || qual > 20) err = 'La qualité doit être comprise entre 0 et 20.';
    if (!err && !UI.editId) {
      var exists = data().some(function (x) { return norm(x.nom) === norm(nom); });
      if (exists) err = 'Une source porte déjà ce nom.';
    }
    var fe = $('[data-asr="ferr"]', dl0);
    if (err) { fe.textContent = err; fe.hidden = false; fe.scrollIntoView({ block: 'nearest' }); return; }
    fe.hidden = true;
    var active = g('i-active') === '1';
    var canal = g('i-canal'), notes = g('i-notes'), desc = g('i-desc');
    var taux = cand > 0 ? Math.round(rec / cand * 1000) / 10 : 0;
    if (UI.editId) {
      var old = rowById(UI.editId);
      if (!old) { closeDialog(); return; }
      mutate(function (cur) {
        cur.canaux = cur.canaux.map(function (c) {
          return Number(c.id) === Number(old.id) ? Object.assign({}, c, { nom: nom, description: desc, nbCandidats: cand, cout: cout, active: active }) : c;
        });
        var matched = false;
        cur.performances = cur.performances.map(function (p) {
          if (old.p && Number(p.id) === Number(old.p.id)) { matched = true; return Object.assign({}, p, { source: nom, nbCandidats: cand, nbEntretiens: ent, nbRecrutements: rec, tauxTransformation: taux, coutRecrutement: cout, delaiMoyen: delai, qualiteMoyenne: qual, notes: notes, canal: canal }); }
          if (!old.p && (p.source || '') === old.nom) { matched = true; return Object.assign({}, p, { source: nom, nbCandidats: cand, nbEntretiens: ent, nbRecrutements: rec, tauxTransformation: taux, coutRecrutement: cout, delaiMoyen: delai, qualiteMoyenne: qual, notes: notes, canal: canal }); }
          return p;
        });
        if (!matched) {
          cur.performances = cur.performances.concat([{ id: nextId(cur.performances), numero: 'SRC-' + String(nextId(cur.performances)).padStart(3, '0'), source: nom, nbCandidats: cand, nbEntretiens: ent, nbRecrutements: rec, tauxTransformation: taux, coutRecrutement: cout, delaiMoyen: delai, qualiteMoyenne: qual, notes: notes, canal: canal }]);
        }
        return cur;
      }, 'Modification source', nom);
      toast('Source « ' + nom + ' » mise à jour', 'ok');
    } else {
      mutate(function (cur) {
        var idC = nextId(cur.canaux);
        var idP = nextId(cur.performances);
        cur.canaux = cur.canaux.concat([{ id: idC, nom: nom, description: desc, nbCandidats: cand, cout: cout, active: active }]);
        cur.performances = cur.performances.concat([{ id: idP, numero: 'SRC-' + String(idP).padStart(3, '0'), source: nom, nbCandidats: cand, nbEntretiens: ent, nbRecrutements: rec, tauxTransformation: taux, coutRecrutement: cout, delaiMoyen: delai, qualiteMoyenne: qual, notes: notes, canal: canal }]);
        return cur;
      }, 'Création source', nom + ' (' + cand + ' candidats, ' + fcfa(cout) + ')');
      toast('Source « ' + nom + ' » créée', 'ok');
    }
    closeDialog();
  }
  function duplicate(id) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      var idC = nextId(cur.canaux);
      cur.canaux = cur.canaux.concat([{ id: idC, nom: r.nom + ' (copie)', description: r.description, nbCandidats: r.nbCandidats, cout: r.cout, active: r.active }]);
      var idP = nextId(cur.performances);
      cur.performances = cur.performances.concat([{ id: idP, numero: 'SRC-' + String(idP).padStart(3, '0'), source: r.nom + ' (copie)', nbCandidats: r.nbCandidats, nbEntretiens: r.ent, nbRecrutements: r.rec, tauxTransformation: r.taux || 0, coutRecrutement: r.cout, delaiMoyen: r.delai || 0, qualiteMoyenne: r.qual || 0, notes: r.notes, canal: r.canal }]);
      return cur;
    }, 'Duplication source', r.nom + ' (copie)');
    toast('Source dupliquée : ' + r.nom + ' (copie)', 'ok');
  }
  function toggleActive(id, on) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      cur.canaux = cur.canaux.map(function (c) { return Number(c.id) === Number(id) ? Object.assign({}, c, { active: !!on }) : c; });
      return cur;
    }, 'Changement de statut canal', r.nom + ' → ' + (on ? 'actif' : 'inactif'));
    toast('Canal « ' + r.nom + ' » ' + (on ? 'activé' : 'désactivé'), 'ok');
  }
  function askDelete(id) {
    var r = rowById(id);
    if (!r) return;
    confirmBox('Supprimer la source « ' + r.nom + ' » ?',
      r.nbCandidats + ' candidats et ' + fcfa(r.cout) + ' de coût annuel seront retirés du suivi. Cette action est définitive.',
      function () {
        mutate(function (cur) {
          cur.canaux = cur.canaux.filter(function (c) { return Number(c.id) !== Number(id); });
          cur.performances = cur.performances.filter(function (p) { return (p.source || '') !== r.nom && !(r.p && Number(p.id) === Number(r.p.id)); });
          return cur;
        }, 'Suppression source', r.nom);
        toast('Source « ' + r.nom + ' » supprimée');
      });
  }
  function confirmBox(title, msg, onOk) {
    closeConfirm();
    var back = h('div', { class: 'asr-backdrop', 'data-asr': 'backdrop', 'data-asr-for': 'confirm' });
    back.addEventListener('click', function (e) { if (e.target === back) closeConfirm(); });
    var d = h('div', { class: 'asr-confirm', 'data-asr': 'confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': title });
    d.innerHTML = '<h4>' + esc(title) + '</h4><p>' + esc(msg) + '</p><div class="asr-confirm-row">' +
      '<button class="asr-btn asr-btn-ghost" data-asr="cf-no">Annuler</button>' +
      '<button class="asr-btn asr-btn-danger" data-asr="cf-ok">Confirmer</button></div>';
    document.body.appendChild(back);
    document.body.appendChild(d);
    $('[data-asr="cf-no"]', d).addEventListener('click', closeConfirm);
    $('[data-asr="cf-ok"]', d).addEventListener('click', function () { closeConfirm(); onOk(); });
  }
  function closeConfirm() {
    $$('[data-asr="confirm"],[data-asr="backdrop"][data-asr-for="confirm"]').forEach(function (n) { n.remove(); });
  }

  /* ================= comparateur ================= */
  function openCompare() {
    if (SEL.length < 2) { toast('Cochez au moins 2 canaux à comparer'); return; }
    closeCompare();
    var rows = data().filter(function (r) { return SEL.indexOf(Number(r.id)) >= 0; });
    if (rows.length < 2) { toast('Sélection introuvable'); return; }
    var back = h('div', { class: 'asr-backdrop', 'data-asr': 'backdrop', 'data-asr-for': 'compare' });
    back.addEventListener('click', function (e) { if (e.target === back) closeCompare(); });
    var d = h('div', { class: 'asr-dialog', 'data-asr': 'compare', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Comparaison de canaux' });
    var metrics = [
      { l: 'Candidats', get: function (r) { return r.nbCandidats; }, best: 'max', fmt: function (v) { return String(v); } },
      { l: 'Entretiens', get: function (r) { return r.p ? r.ent : null; }, best: 'max', fmt: function (v) { return v === null ? '\u2014' : String(v); } },
      { l: 'Recrutements', get: function (r) { return r.p ? r.rec : null; }, best: 'max', fmt: function (v) { return v === null ? '\u2014' : String(v); } },
      { l: 'Taux de conversion', get: function (r) { return r.taux; }, best: 'max', fmt: function (v) { return v === null ? '\u2014' : pct(v); } },
      { l: 'Coût annuel', get: function (r) { return Number(r.cout) || 0; }, best: 'min', fmt: function (v) { return v === 0 ? 'Gratuit' : fcfa(v); } },
      { l: 'Coût/candidat', get: function (r) { return r.cpc; }, best: 'min', fmt: function (v) { return v === null ? '\u2014' : v === 0 ? 'Gratuit' : fcfa(v); } },
      { l: 'Coût/recrutement', get: function (r) { return r.cpr; }, best: 'min', fmt: function (v) { return v === null ? '\u2014' : v === 0 ? 'Gratuit' : fcfa(v); } },
      { l: 'Délai moyen (j)', get: function (r) { return r.delai; }, best: 'min', fmt: function (v) { return v === null ? '\u2014' : String(v); } },
      { l: 'Qualité /20', get: function (r) { return r.qual; }, best: 'max', fmt: function (v) { return v === null ? '\u2014' : String(v); } },
      { l: 'Score /100', get: function (r) { return r.score; }, best: 'max', fmt: function (v) { return v === null ? '\u2014' : String(v); } }
    ];
    var body = metrics.map(function (m) {
      var vals = rows.map(function (r) { return m.get(r); });
      var usable = vals.filter(function (v) { return v !== null; });
      var bestV = usable.length ? (m.best === 'max' ? Math.max.apply(null, usable) : Math.min.apply(null, usable)) : null;
      var worstV = usable.length ? (m.best === 'max' ? Math.min.apply(null, usable) : Math.max.apply(null, usable)) : null;
      return '<tr><td>' + esc(m.l) + '</td>' + rows.map(function (r, i) {
        var v = vals[i];
        var cls = '';
        if (v !== null && bestV !== null && v === bestV && rows.length > 1) cls = 'best';
        if (v !== null && worstV !== null && v === worstV && bestV !== worstV && rows.length > 1) cls = 'bad';
        return '<td class="' + cls + '">' + esc(m.fmt(v)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    d.innerHTML =
      '<div class="asr-dialog-head"><h3>Comparaison de ' + rows.length + ' canaux</h3><button class="asr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asr-dialog-body"><div class="asr-cmp-wrap"><table class="asr-cmp"><thead><tr><th>Métrique</th>' +
      rows.map(function (r) { return '<th>' + esc(r.nom) + '<br><span class="asr-grade ' + (r.grade || 'NA') + '" style="margin-top:4px">' + (r.grade || 'N/A') + '</span></th>'; }).join('') +
      '</tr></thead><tbody>' + body +
      '<tr><td>Statut</td>' + rows.map(function (r) { return '<td>' + chipHtml(r.active ? 'Actif' : 'Inactif', r.active ? 'ok' : 'neutral') + '</td>'; }).join('') + '</tr>' +
      '<tr><td>Notes</td>' + rows.map(function (r) { return '<td style="text-align:left;font-size:.7rem">' + esc(r.notes || '\u2014') + '</td>'; }).join('') + '</tr>' +
      '</tbody></table></div></div>' +
      '<div class="asr-dialog-foot"><span class="asr-form-hint">Vert = meilleure valeur · Rouge = moins bonne valeur (par ligne)</span>' +
      '<button class="asr-btn asr-btn-primary" data-asr="cmp-x">Fermer</button></div>';
    document.body.appendChild(back);
    document.body.appendChild(d);
    $('.asr-drawer-x', d).addEventListener('click', closeCompare);
    $('[data-asr="cmp-x"]', d).addEventListener('click', closeCompare);
    jlog('Comparaison canaux', rows.map(function (r) { return r.nom; }).join(' vs '));
  }
  function closeCompare() {
    $$('[data-asr="compare"],[data-asr="backdrop"][data-asr-for="compare"]').forEach(function (n) { n.remove(); });
  }

  /* ================= simulateur d'allocation ================= */
  var SIM = { budget: 1000000, objectif: 50, poids: 50 };
  function openSimulator() {
    closeSim();
    var back = h('div', { class: 'asr-backdrop', 'data-asr': 'backdrop', 'data-asr-for': 'sim' });
    back.addEventListener('click', function (e) { if (e.target === back) closeSim(); });
    var d = h('div', { class: 'asr-dialog', 'data-asr': 'sim', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Simulateur d\u2019allocation budgétaire' });
    d.innerHTML =
      '<div class="asr-dialog-head"><h3>Simulateur d\u2019allocation budgétaire</h3><button class="asr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asr-dialog-body">' +
        '<p style="font-size:.78rem;color:var(--asr-text2);margin:0 0 6px">Répartit un budget annuel entre les canaux <b>actifs</b> en tenant compte de leur score de performance et de leur coût par candidat. Aucune donnée n\u2019est modifiée.</p>' +
        '<div class="asr-sim-row"><label for="asr-sim-b">Budget annuel à répartir</label><input id="asr-sim-b" type="range" min="100000" max="3000000" step="50000" value="' + SIM.budget + '"><output>' + fcfa(SIM.budget) + '</output></div>' +
        '<div class="asr-sim-row"><label for="asr-sim-o">Objectif de candidats</label><input id="asr-sim-o" type="range" min="10" max="250" step="5" value="' + SIM.objectif + '"><output>' + SIM.objectif + '</output></div>' +
        '<div class="asr-sim-row"><label for="asr-sim-p">Poids qualité vs coût</label><input id="asr-sim-p" type="range" min="0" max="100" step="5" value="' + SIM.poids + '"><output>' + SIM.poids + '%</output></div>' +
        '<div class="asr-sim-out" data-asr="sim-out"></div>' +
      '</div>' +
      '<div class="asr-dialog-foot"><span class="asr-form-hint">Indicatif — basé sur les performances historiques</span>' +
      '<button class="asr-btn asr-btn-primary" data-asr="sim-x">Fermer</button></div>';
    document.body.appendChild(back);
    document.body.appendChild(d);
    $('.asr-drawer-x', d).addEventListener('click', closeSim);
    $('[data-asr="sim-x"]', d).addEventListener('click', closeSim);
    var upd = function () {
      SIM.budget = Number($('#asr-sim-b', d).value);
      SIM.objectif = Number($('#asr-sim-o', d).value);
      SIM.poids = Number($('#asr-sim-p', d).value);
      $('#asr-sim-b', d).nextElementSibling.textContent = fcfa(SIM.budget);
      $('#asr-sim-o', d).nextElementSibling.textContent = String(SIM.objectif);
      $('#asr-sim-p', d).nextElementSibling.textContent = SIM.poids + '%';
      renderSim(d);
    };
    ['asr-sim-b', 'asr-sim-o', 'asr-sim-p'].forEach(function (id) { $('#' + id, d).addEventListener('input', upd); });
    upd();
    jlog('Simulateur allocation', 'budget ' + fcfa(SIM.budget) + ', objectif ' + SIM.objectif + ' candidats');
  }
  function renderSim(d) {
    var rows = data().filter(function (r) { return r.active && r.p && r.nbCandidats > 0 && r.score !== null; });
    var out = $('[data-asr="sim-out"]', d);
    if (!rows.length) { out.innerHTML = '<div class="asr-empty">Aucun canal actif avec performance exploitable.</div>'; return; }
    var refCpc = (function () {
      var totC = rows.reduce(function (s, r) { return s + (Number(r.cout) || 0); }, 0);
      var totN = rows.reduce(function (s, r) { return s + r.nbCandidats; }, 0);
      return totN > 0 ? Math.max(1, Math.round(totC / totN)) : 1;
    })();
    var pw = SIM.poids / 100;
    var wsum = 0;
    var alloc = rows.map(function (r) {
      var cpcW = r.cpc === 0 ? 0 : (r.cpc === null ? refCpc : r.cpc);
      var cpcC = (r.cpc === null || r.cpc === 0) ? refCpc : r.cpc;
      var eff = (r.score / 100) * (0.5 + pw) + (1 / (1 + cpcW / refCpc)) * (1 - pw * 0.5) + 0.05;
      var w = eff;
      wsum += w;
      return { r: r, w: w, cpc: cpcC };
    });
    alloc.forEach(function (a) { a.montant = wsum > 0 ? Math.round(SIM.budget * a.w / wsum) : 0; a.cand = Math.round(a.montant / a.cpc); });
    alloc.sort(function (a, b) { return b.montant - a.montant; });
    var totCand = alloc.reduce(function (s, a) { return s + a.cand; }, 0);
    var tips = [];
    var gratuits = alloc.filter(function (a) { return a.r.cout === 0 || a.cpc === 0; });
    if (gratuits.length) tips.push('Priorisez les canaux gratuits (' + gratuits.map(function (a) { return a.r.nom; }).join(', ') + ') — chaque franc y est 100 % utile.');
    var dGrade = alloc.filter(function (a) { return a.r.grade === 'D'; });
    if (dGrade.length) tips.push('Suspendez ou redressez : ' + dGrade.map(function (a) { return a.r.nom; }).join(', ') + ' (grade D).');
    var budgetNec = (function () {
      var candPerFranc = alloc.reduce(function (s, a) { return s + a.w / Math.max(1, a.cpc); }, 0) / (wsum || 1);
      return candPerFranc > 0 ? Math.round(SIM.objectif / candPerFranc) : 0;
    })();
    if (totCand < SIM.objectif) tips.push('Avec ' + fcfa(SIM.budget) + ', visez ~' + totCand + ' candidats ; il faut ≈ ' + fcfa(budgetNec) + ' pour atteindre ' + SIM.objectif + '.');
    else tips.push('Objectif atteint avec marge : ' + totCand + ' candidats attendus pour ' + SIM.objectif + ' visés — vous pouvez resserrer le budget.');
    out.innerHTML =
      '<div class="asr-sim-kpis"><span>Budget réparti : <b>' + fcfa(SIM.budget) + '</b></span><span>Candidats attendus : <b>≈ ' + totCand + '</b></span><span>Objectif : <b>' + SIM.objectif + '</b></span></div>' +
      '<div class="asr-sim-alloc">' + alloc.map(function (a) {
        var w = SIM.budget > 0 ? Math.max(2, Math.round(a.montant / SIM.budget * 100)) : 2;
        return '<div class="asr-sim-arow"><span>' + esc(a.r.nom) + ' <span class="asr-grade ' + a.r.grade + '" style="display:inline-grid;width:18px;height:18px;font-size:.62rem">' + a.r.grade + '</span></span>' +
          '<span class="asr-bar-track"><span class="asr-bar-fill" style="width:' + w + '%"></span></span>' +
          '<span>' + fcfa(a.montant) + '</span><span>≈ ' + a.cand + ' cand.</span></div>';
      }).join('') + '</div>' +
      tips.map(function (t) { return '<div class="asr-sim-tip">' + esc(t) + '</div>'; }).join('');
  }
  function closeSim() {
    $$('[data-asr="sim"],[data-asr="backdrop"][data-asr-for="sim"]').forEach(function (n) { n.remove(); });
  }

  /* ================= cibles ================= */
  function openCibles() {
    closeCibles();
    var back = h('div', { class: 'asr-backdrop', 'data-asr': 'backdrop', 'data-asr-for': 'cibles' });
    back.addEventListener('click', function (e) { if (e.target === back) closeCibles(); });
    var d = h('div', { class: 'asr-dialog', 'data-asr': 'cibles', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Cibles de pilotage' });
    d.innerHTML =
      '<div class="asr-dialog-head"><h3>Cibles &amp; seuils de pilotage</h3><button class="asr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asr-dialog-body">' +
        '<p style="font-size:.78rem;color:var(--asr-text2);margin:0 0 8px">Ces cibles alimentent les scores (grades A-D), les alertes du héro et les filtres KPI.</p>' +
        '<div class="asr-fgrid">' +
          '<label class="asr-lab">Taux de conversion cible (%)<input class="asr-in" type="number" min="1" max="100" step="0.5" data-asr="cb-taux" value="' + CIBLES.taux + '"></label>' +
          '<label class="asr-lab">Qualité cible (/20)<input class="asr-in" type="number" min="1" max="20" step="0.5" data-asr="cb-qual" value="' + CIBLES.qualite + '"></label>' +
          '<label class="asr-lab">Délai cible (jours max)<input class="asr-in" type="number" min="1" max="180" step="1" data-asr="cb-delai" value="' + CIBLES.delai + '"></label>' +
          '<label class="asr-lab">Coût/recrutement cible (FCFA)<input class="asr-in" type="number" min="0" step="5000" data-asr="cb-cpr" value="' + CIBLES.cpr + '"></label>' +
        '</div>' +
      '</div>' +
      '<div class="asr-dialog-foot"><button class="asr-link" data-asr="cb-def">Valeurs par défaut</button>' +
      '<div><button class="asr-btn asr-btn-ghost" data-asr="cb-x">Annuler</button> ' +
      '<button class="asr-btn asr-btn-primary" data-asr="cb-ok">Appliquer</button></div></div>';
    document.body.appendChild(back);
    document.body.appendChild(d);
    $('.asr-drawer-x', d).addEventListener('click', closeCibles);
    $('[data-asr="cb-x"]', d).addEventListener('click', closeCibles);
    $('[data-asr="cb-def"]', d).addEventListener('click', function () {
      $('[data-asr="cb-taux"]', d).value = CIBLES_DEF.taux;
      $('[data-asr="cb-qual"]', d).value = CIBLES_DEF.qualite;
      $('[data-asr="cb-delai"]', d).value = CIBLES_DEF.delai;
      $('[data-asr="cb-cpr"]', d).value = CIBLES_DEF.cpr;
    });
    $('[data-asr="cb-ok"]', d).addEventListener('click', function () {
      CIBLES = {
        taux: Math.max(1, Number($('[data-asr="cb-taux"]', d).value) || 10),
        qualite: Math.max(1, Math.min(20, Number($('[data-asr="cb-qual"]', d).value) || 14)),
        delai: Math.max(1, Number($('[data-asr="cb-delai"]', d).value) || 30),
        cpr: Math.max(0, Number($('[data-asr="cb-cpr"]', d).value) || 80000)
      };
      saveCibles();
      jlog('Cibles mises à jour', 'taux ' + CIBLES.taux + '% · qualité ' + CIBLES.qualite + '/20 · délai ' + CIBLES.delai + 'j · CPR ' + fcfa(CIBLES.cpr));
      closeCibles();
      refresh();
      toast('Cibles appliquées — scores et alertes recalculés', 'ok');
    });
  }
  function closeCibles() {
    $$('[data-asr="cibles"],[data-asr="backdrop"][data-asr-for="cibles"]').forEach(function (n) { n.remove(); });
  }

  /* ================= export CSV ================= */
  function exportCSV(rowsOverride) {
    var rows = rowsOverride || filtered();
    var cols = ['numero', 'source', 'description', 'active', 'nbCandidats', 'nbEntretiens', 'nbRecrutements', 'tauxTransformation', 'cout', 'coutParCandidat', 'coutParRecrutement', 'delaiMoyen', 'qualiteMoyenne', 'score', 'grade', 'notes'];
    function escCsv(v) { v = v == null ? '' : String(v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var lines = rows.map(function (r) {
      var o = {
        numero: r.numero, source: r.nom, description: r.description, active: r.active ? 'Actif' : 'Inactif',
        nbCandidats: r.nbCandidats, nbEntretiens: r.p ? r.ent : '', nbRecrutements: r.p ? r.rec : '',
        tauxTransformation: r.taux === null ? '' : r.taux, cout: r.cout,
        coutParCandidat: r.cpc === null ? '' : r.cpc, coutParRecrutement: r.cpr === null ? '' : r.cpr,
        delaiMoyen: r.delai === null ? '' : r.delai, qualiteMoyenne: r.qual === null ? '' : r.qual,
        score: r.score === null ? '' : r.score, grade: r.grade === 'NA' ? '' : r.grade, notes: r.notes
      };
      return cols.map(function (c) { return escCsv(o[c]); }).join(';');
    });
    var csv = '\ufeff' + cols.join(';') + '\n' + lines.join('\n');
    dl(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'sources-recrutement' + (activeFilterCount() ? '-filtrees' : '') + '.csv');
    jlog('Export CSV', rows.length + ' source(s)' + (activeFilterCount() ? ' (filtrées)' : ''));
    toast(rows.length + ' source(s) exportée(s) en CSV', 'ok');
  }

  /* ================= journal ================= */
  function journalRows() {
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.read === 'function') return window.__ADMINA_AUDIT__.read() || [];
      return JSON.parse(localStorage.getItem('admina_journal') || '[]');
    } catch (e) { return []; }
  }
  function openJournal() {
    closeJournal();
    var back = h('div', { class: 'asr-backdrop asr-backdrop-j', 'data-asr': 'backdrop', 'data-asr-for': 'journal' });
    back.addEventListener('click', closeJournal);
    var d = h('div', { class: 'asr-journal', 'data-asr': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    d.innerHTML =
      '<div class="asr-drawer-head"><div><div class="asr-drawer-title">Journal d\u2019activité</div><div class="asr-drawer-sub" data-asr="jcount"></div></div>' +
      '<button class="asr-drawer-x" aria-label="Fermer le journal">✕</button></div>' +
      '<div class="asr-jsearch"><input type="search" class="asr-in" placeholder="Filtrer le journal…" data-asr="jsearch" aria-label="Filtrer le journal"></div>' +
      '<div class="asr-jlist" data-asr="jlist"></div>';
    document.body.appendChild(back);
    document.body.appendChild(d);
    $('.asr-drawer-x', d).addEventListener('click', closeJournal);
    $('[data-asr="jsearch"]', d).addEventListener('input', renderJournal);
    renderJournal();
  }
  function renderJournal() {
    var body = $('[data-asr="jlist"]'); if (!body) return;
    var q = norm(($('[data-asr="jsearch"]') || {}).value || '');
    var rows = journalRows().filter(function (r) { return !q || norm((r.action || '') + ' ' + (r.detail || '') + ' ' + (r.role || '')).indexOf(q) >= 0; }).slice(0, 120);
    $('[data-asr="jcount"]').textContent = rows.length + ' entrée(s)';
    body.innerHTML = rows.map(function (r) {
      var hh = '?';
      try { hh = new Date(r.time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
      return '<div class="asr-jrow"><span class="asr-jtime">' + esc(hh) + '</span><span class="asr-jact">' + esc(r.action || '') + '</span><span class="asr-jdet">' + esc(r.detail || '') + '</span></div>';
    }).join('') || '<div class="asr-empty">Aucune entrée.</div>';
  }
  function closeJournal() {
    $$('[data-asr="journal"],[data-asr="backdrop"][data-asr-for="journal"]').forEach(function (n) { n.remove(); });
  }

  /* ================= pont vers prévisions ================= */
  function planPrev(r) {
    try { localStorage.setItem(PREFILL_PREV, JSON.stringify({ canalDiffusion: r.nom, _t: Date.now() })); } catch (e) {}
    jlog('Pont sources → prévisions', 'canal ' + r.nom);
    closeDrawer();
    toast('Pré-remplissage du canal « ' + r.nom + ' » dans les prévisions…', 'ok');
    setTimeout(function () { location.assign('/Domaine1_Recrutement_Candidats/previsions-postes'); }, 350);
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSim(); closeCompare(); closeCibles(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-asr="dialog"]') || $('[data-asr="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    if (e.key === 's' || e.key === 'S') { openSimulator(); e.preventDefault(); }
    if (e.key === 'c' || e.key === 'C') { openCompare(); e.preventDefault(); }
    if (e.key === '/') { var si = $('[data-asr="search"]'); if (si) { si.focus(); e.preventDefault(); } }
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
    renderFunnel();
    renderFilters();
    renderContent();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-asr="drawer"],[data-asr="dialog"],[data-asr="confirm"],[data-asr="journal"],[data-asr="sim"],[data-asr="compare"],[data-asr="cibles"]')) {
      $$('[data-asr="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= fix table natif ================= */
  function fixTables() {
    var containers = $$('.MuiTableContainer-root');
    for (var i = 0; i < containers.length; i++) {
      var el0 = containers[i];
      if (el0.__adminaSrcFixed) continue;
      el0.__adminaSrcFixed = true;
      el0.style.overflowX = 'auto';
      el0.style.maxWidth = '100%';
      var tbl = el0.querySelector('table.MuiTable-root');
      if (tbl) { var w = tbl.style.minWidth; if (!w || parseInt(w, 10) < 1100) tbl.style.minWidth = '1100px'; }
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-asr');
    shellBuilt = false;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-asr]') || t.closest('#asr-canaux-dl'))) continue;
        scheduleRefresh();
        break;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  var refreshT = null;
  function scheduleRefresh() { clearTimeout(refreshT); refreshT = setTimeout(function () { if (active && isOn()) refresh(); }, 200); }
  function deactivate() {
    if (!active) return;
    active = false;
    html.classList.remove('admina-asr');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSim(); closeCompare(); closeCibles();
    SEL = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    fixTables();
    var natif = conteneurNatif();
    var root = $('[data-asr="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-asr-hide', '1');
      natif.setAttribute('data-asr-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) refresh();
  }

  /* démarrage */
  if (isOn()) activate();
  setInterval(function () {
    var on = isOn();
    if (on && !active) activate();
    else if (!on && active) deactivate();
  }, 350);
  window.addEventListener('popstate', function () {
    var on = isOn();
    if (on && !active) activate();
    else if (!on && active) deactivate();
  });

  window.__ADMINA_SRC_UI__ = {
    version: '1.0-t22',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    exportCSV: exportCSV,
    openCompare: openCompare,
    openSimulator: openSimulator
  };
  try { console.info('[ADMINA_SRC] M22 actif — Centre de pilotage des sources /sources-recrutement'); } catch (e) {}
})();
