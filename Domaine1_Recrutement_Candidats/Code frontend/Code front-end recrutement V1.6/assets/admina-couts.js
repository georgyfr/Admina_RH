/* =============================================================
   Admina-RH — Analyse des Coûts de Recrutement — couche admina
   M24 : CENTRE DE PILOTAGE — Coûts de recrutement par demande
   Héro calculé + alertes contextuelles cliquables + 6 KPI filtres
   + 3 graphiques (donut structure par nature, coût par demande vs
   cible budget/poste, coût par département) + recherche/filtres
   + table triable 17 col avec totaux + vue cartes + drawer détail
   (croisement ISO avec __ADMINA_STORE__.demandes : statut, manager,
   priorité, cohérence poste/demande) + création/édition 12 champs
   avec totaux live + duplication + suppression confirmée + barre
   de sélection multi + comparateur + simulateur budgétaire + cibles
   configurables (Obj. 3 ISO : budget/poste) + export CSV + journal
   + thème sombre + responsive mobile.
   - Scope strict : /Domaine1_Recrutement_Candidats/analyse-des-couts
   - Idempotent (data-aco / data-aco-hide), sans collision (__ADMINA_COUT_M24__)
   - Données : window.__ADMINA_COUT_API__ (patch chunk) → fallback localStorage
   - Journal : window.__ADMINA_AUDIT__ (SPA D1)
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_COUT_M24__) return;
  window.__ADMINA_COUT_M24__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/Domaine1_Recrutement_Candidats\/analyse-des-couts\/?$/;
  var LS_DATA = 'admina-couts-data';
  var LS_UI = 'admina-couts-ui';
  var LS_CIBLES = 'admina-couts-cibles';

  var UI = { q: '', dept: '', coh: '', bud: '', nat: '', kpi: '', view: 'table', sortKey: 'total', sortDir: -1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, delId: null, cmp: [] };

  var CIBLES_DEF = { cpp: 100000, budgetGlobal: 1500000, partCabinet: 40 };
  var CIBLES = loadCibles();
  function loadCibles() {
    try { var v = JSON.parse(localStorage.getItem(LS_CIBLES) || 'null'); if (v && typeof v === 'object') return Object.assign({}, CIBLES_DEF, v); } catch (e) {}
    return Object.assign({}, CIBLES_DEF);
  }
  function saveCibles() { try { localStorage.setItem(LS_CIBLES, JSON.stringify(CIBLES)); } catch (e) {} }

  var NATURES = [
    { k: 'publicite', lab: 'Publicité', c: '#0ea5a0', f: 'f1' },
    { k: 'cabinet', lab: 'Cabinet', c: '#f59e0b', f: 'f2' },
    { k: 'deplacement', lab: 'Déplacement', c: '#8b5cf6', f: 'f3' },
    { k: 'tests', lab: 'Tests', c: '#ef4444', f: 'f4' },
    { k: 'hebergement', lab: 'Hébergement', c: '#06b6d4', f: 'f5' },
    { k: 'formation', lab: 'Formation', c: '#10b981', f: 'f6' },
    { k: 'autres', lab: 'Autres', c: '#64748b', f: 'f7' }
  ];

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
  function toastsZone() { var z = $('[data-aco="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-aco', 'toasts'); z.className = 'aco-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'aco-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }
  function dateKey(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (m) return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
    var m2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    if (m2) return Number(m2[1]) * 10000 + Number(m2[2]) * 100 + Number(m2[3]);
    return 0;
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_COUT_API__ || null; }
  function storeDemandes() {
    try { var s = window.__ADMINA_STORE__; if (s && s.demandes && s.demandes.length) return s.demandes; } catch (e) {}
    return [];
  }
  function demandeByNum(num) {
    if (!num) return null;
    var ds = storeDemandes();
    for (var i = 0; i < ds.length; i++) { if (String(ds[i].numero || '') === String(num)) return ds[i]; }
    return null;
  }
  function coherence(r) {
    if (!r.demandeLiee) return { s: 'none', msg: 'Aucune demande liée' };
    var d = demandeByNum(r.demandeLiee);
    if (!d) return { s: 'err', d: null, msg: 'Demande introuvable' };
    if (norm(d.poste) !== norm(r.poste)) return { s: 'warn', d: d, msg: 'Poste incohérent (demande : ' + d.poste + ')' };
    return { s: 'ok', d: d, msg: 'Conforme' };
  }
  function rowTotal(r) {
    var t = 0;
    for (var i = 0; i < NATURES.length; i++) t += (Number(r[NATURES[i].k]) || 0);
    return t;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.lignes) { try { d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e2) { d = null; } }
    if (!d || !d.lignes || !d.lignes.length) return [];
    var out = d.lignes.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      for (var i = 0; i < NATURES.length; i++) u[NATURES[i].k] = Number(u[NATURES[i].k]) || 0;
      u.total = rowTotal(u);
      u.postes = Math.max(1, Number(u.postes) || 1);
      u.cpp = Math.round(u.total / u.postes);
      u.coh = coherence(u);
      return u;
    });
    var grand = out.reduce(function (s, r) { return s + r.total; }, 0);
    out.forEach(function (r) { r.part = grand > 0 ? r.total / grand : 0; });
    return out;
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (Number(rows[i].id) === Number(id)) return rows[i]; } return null; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) { var m2 = /^COUT-(\d+)$/.exec(String(r.numero || '')); return Math.max(m, m2 ? Number(m2[1]) : 0); }, 0) + 1;
    return 'COUT-' + String(mx).padStart(3, '0');
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.lignes) { toast('Écriture impossible — recharger la page', 'err'); return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    toast('Écriture impossible — API indisponible', 'err');
    return false;
  }

  /* ================= cibles & alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var grand = rows.reduce(function (s, r) { return s + r.total; }, 0);
    var above = rows.filter(function (r) { return r.cpp > CIBLES.cpp; });
    if (above.length) {
      var worst = above.slice().sort(function (a, b) { return b.cpp - a.cpp; })[0];
      out.push({ tone: 'warn', txt: above.length + ' demande' + (above.length > 1 ? 's' : '') + ' au-dessus du budget/poste cible (' + worst.poste + ' : ' + fcfa(worst.cpp) + '/poste)', f: 'above' });
    }
    var cab = rows.reduce(function (s, r) { return s + r.cabinet; }, 0);
    var pc = grand > 0 ? Math.round(cab / grand * 100) : 0;
    if (pc > CIBLES.partCabinet) out.push({ tone: 'warn', txt: 'Les cabinets pèsent ' + kfcfa(cab) + ' FCFA — ' + pc + ' % du budget total (cible ≤ ' + CIBLES.partCabinet + ' %)', f: 'cab' });
    var incoh = rows.filter(function (r) { return r.coh.s === 'warn' || r.coh.s === 'err'; });
    if (incoh.length) out.push({ tone: 'err', txt: incoh.length + ' liaison' + (incoh.length > 1 ? 's' : '') + ' demande à corriger — poste incohérent ou demande introuvable (' + incoh.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'coh' });
    var cheap = rows.filter(function (r) { return r.total > 0 && r.cpp <= CIBLES.cpp / 2; });
    if (cheap.length) out.push({ tone: 'ok', txt: cheap.length + ' recrutement' + (cheap.length > 1 ? 's' : '') + ' à coût maîtrisé — ' + kfcfa(cheap[0].total) + ' FCFA (' + cheap.slice(0, 2).map(function (r) { return r.poste; }).join(', ') + ')', f: 'cheap' });
    var tst = rows.reduce(function (s, r) { return s + r.tests; }, 0);
    var nbT = rows.filter(function (r) { return r.tests > 0; }).length;
    if (tst > 0) out.push({ tone: 'info', txt: 'Tests & évaluations : ' + kfcfa(tst) + ' FCFA sur ' + nbT + ' demande' + (nbT > 1 ? 's' : '') + ' — investiguer les écarts', f: 'tests' });
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var moy = rows.length ? Math.round(rows.reduce(function (s, r) { return s + r.total; }, 0) / rows.length) : 0;
    var out = rows.filter(function (r) {
      if (UI.dept && norm(r.departement) !== norm(UI.dept)) return false;
      if (UI.coh === 'ok' && r.coh.s !== 'ok') return false;
      if (UI.coh === 'bad' && !(r.coh.s === 'warn' || r.coh.s === 'err')) return false;
      if (UI.coh === 'err' && r.coh.s !== 'err') return false;
      if (UI.bud === 'over' && !(r.cpp > CIBLES.cpp)) return false;
      if (UI.bud === 'ok' && r.cpp > CIBLES.cpp) return false;
      if (UI.bud === 'cheap' && !(r.total > 0 && r.cpp <= CIBLES.cpp / 2)) return false;
      if (UI.nat) { var n = NATURES.filter(function (x) { return x.k === UI.nat; })[0]; if (n && !(Number(r[n.k]) > 0)) return false; }
      if (UI.kpi === 'moy' && !(r.total > moy)) return false;
      if (UI.kpi === 'poste' && !(r.cpp > CIBLES.cpp)) return false;
      if (UI.kpi === 'cab' && !(Number(r.cabinet) > 0)) return false;
      if (q && !(norm(r.poste).indexOf(q) > -1 || norm(r.numero).indexOf(q) > -1 || norm(r.demandeLiee).indexOf(q) > -1 || norm(r.departement).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1)) return false;
      return true;
    });
    if (UI.bud === 'top') {
      out = rows.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 3);
      return out;
    }
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'total') { va = a.total; vb = b.total; }
      else if (k === 'cpp') { va = a.cpp; vb = b.cpp; }
      else if (k === 'part') { va = a.part; vb = b.part; }
      else if (k === 'date') { va = dateKey(a.date); vb = dateKey(b.date); }
      else if (k === 'demande') { va = a.demandeLiee || ''; vb = b.demandeLiee || ''; }
      else if (NATURES.some(function (x) { return x.k === k; })) { va = Number(a[k]) || 0; vb = Number(b[k]) || 0; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.dept ? 1 : 0) + (UI.coh ? 1 : 0) + (UI.bud ? 1 : 0) + (UI.nat ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.dept = ''; UI.coh = ''; UI.bud = ''; UI.nat = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Analyse\s+des\s+Co[uû]ts/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-aco="root"]');
    if (!root) {
      root = h('section', { 'data-aco': 'root', class: 'aco-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-aco-page')) {
      page.setAttribute('data-aco-page', '1');
      page.setAttribute('data-aco-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-aco-hide')) {
      natif.setAttribute('data-aco-hide', '1');
      natif.setAttribute('data-aco-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-aco="root"]'); if (root) root.remove();
    $$('[data-aco-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-aco-oldw') || '';
      n.removeAttribute('data-aco-page');
      n.removeAttribute('data-aco-oldw');
    });
    $$('[data-aco-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-aco-olddisp') || '';
      n.removeAttribute('data-aco-hide');
      n.removeAttribute('data-aco-olddisp');
    });
    $$('[data-aco]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-aco="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'aco-btn aco-btn-primary aco-backbtn', 'data-aco': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'analyse-des-couts');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    sim: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>',
    cmp: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3v18M15 3v18"/><rect x="3" y="6" width="6" height="9" rx="1"/><rect x="15" y="9" width="6" height="9" rx="1"/></svg>',
    cibles: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
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
  var PIE_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>';

  function buildShell() {
    var root = $('[data-aco="root"]');
    if (!root || $('[data-aco="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="aco-hero" data-aco="hero">' +
        '<div class="aco-hero-main">' +
          '<div class="aco-hero-title">' +
            '<span class="aco-hero-ico" aria-hidden="true">' + PIE_ICON + '</span>' +
            '<div><h2 class="aco-h2">Centre de pilotage — Analyse des coûts de recrutement</h2>' +
            '<p class="aco-hero-sub" data-aco="herosub"></p></div>' +
          '</div>' +
          '<div class="aco-hero-actions">' +
            '<button class="aco-btn" data-aco="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="aco-btn" data-aco="btn-sim" title="Simulateur budgétaire (S)">' + ICO.sim + 'Simulateur</button>' +
            '<button class="aco-btn" data-aco="btn-cmp" title="Comparer des analyses (C)">' + ICO.cmp + 'Comparer <span class="aco-nc-badge" data-aco="cmp-badge"></span></button>' +
            '<button class="aco-btn" data-aco="btn-cibles" title="Cibles et budgets de référence (Obj. 3 ISO)">' + ICO.cibles + 'Cibles</button>' +
            '<button class="aco-btn" data-aco="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="aco-btn" data-aco="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="aco-btn aco-btn-primary" data-aco="btn-new" title="Nouvelle analyse (N)">' + ICO.plus + 'Nouvelle analyse</button>' +
          '</div>' +
        '</div>' +
        '<div class="aco-hero-alerts" data-aco="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="aco-kpis" data-aco="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="aco-charts" data-aco="charts">' +
        '<div class="aco-chart-card"><div class="aco-chart-title">Structure des coûts par nature</div><div class="aco-donut-wrap" data-aco="donut"></div></div>' +
        '<div class="aco-chart-card"><div class="aco-chart-title" data-aco="bars-title"></div><div class="aco-bars" data-aco="bars"></div></div>' +
        '<div class="aco-chart-card"><div class="aco-chart-title">Coût par département</div><div class="aco-bars" data-aco="depts"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="aco-toolbar" data-aco="toolbar">' +
        '<div class="aco-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (poste, n°, demande, notes…)" data-aco="search" aria-label="Rechercher une analyse de coûts" /></div>' +
        '<select data-aco="f-dept" class="aco-sel" aria-label="Filtrer par département"></select>' +
        '<select data-aco="f-coh" class="aco-sel" aria-label="Filtrer par cohérence de la demande liée"></select>' +
        '<select data-aco="f-bud" class="aco-sel" aria-label="Filtrer par budget"></select>' +
        '<select data-aco="f-nat" class="aco-sel" aria-label="Filtrer par nature de dépense"></select>' +
        '<button class="aco-chipbtn" data-aco="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="aco-count" data-aco="count"></span>' +
        '<div class="aco-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="aco-vbtn" data-aco="v-table" title="Vue tableau">' + ICO.tbl + 'Tableau</button>' +
          '<button class="aco-vbtn" data-aco="v-cards" title="Vue cartes">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-aco="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-aco="selbar"></div>' +

      /* PIED */
      '<div class="aco-foot">Source de vérité locale (navigateur) — conforme Manuel D1 §4.4 (coûts liés aux demandes) · journal d\u2019audit actif · cibles configurables · <button class="aco-link" data-aco="btn-native">Afficher le tableau natif</button></div>';

    $('[data-aco="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-aco="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-aco="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'analyse-des-couts'); window.print(); });
    $('[data-aco="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-aco="btn-sim"]', root).addEventListener('click', openSim);
    $('[data-aco="btn-cmp"]', root).addEventListener('click', openCompare);
    $('[data-aco="btn-cibles"]', root).addEventListener('click', openCibles);
    $('[data-aco="btn-native"]', root).addEventListener('click', showNative);
    $('[data-aco="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-aco="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-aco="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-aco="f-dept"]', root).addEventListener('change', function (e) { UI.dept = e.target.value; UI.page = 0; refresh(); });
    $('[data-aco="f-coh"]', root).addEventListener('change', function (e) { UI.coh = e.target.value; UI.page = 0; refresh(); });
    $('[data-aco="f-bud"]', root).addEventListener('change', function (e) { UI.bud = e.target.value; UI.page = 0; refresh(); });
    $('[data-aco="f-nat"]', root).addEventListener('change', function (e) { UI.nat = e.target.value; UI.page = 0; refresh(); });
    $('[data-aco="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-aco="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var grand = rows.reduce(function (s, r) { return s + r.total; }, 0);
    var cab = rows.reduce(function (s, r) { return s + r.cabinet; }, 0);
    var worst = rows.slice().sort(function (a, b) { return b.total - a.total; })[0];
    var sub = rows.length + ' analyse' + (rows.length > 1 ? 's' : '') + ' · coût total ' + kfcfa(grand) + ' FCFA' +
      ' · coût moyen/demande ' + (rows.length ? fcfa(Math.round(grand / rows.length)) : '—') +
      (worst ? ' · poste le plus coûteux : ' + worst.poste + ' (' + kfcfa(worst.total) + ')' : '') +
      (grand ? ' · cabinets ' + Math.round(cab / grand * 100) + ' %' : '');
    $('[data-aco="herosub"]').textContent = sub;
    var zone = $('[data-aco="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="aco-alert ' + a.tone + '" data-aco="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.aco-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'above') UI.bud = 'over';
        else if (f === 'cab') UI.nat = 'cabinet';
        else if (f === 'coh') UI.coh = 'bad';
        else if (f === 'cheap') UI.bud = 'cheap';
        else if (f === 'tests') UI.nat = 'tests';
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var grand = rows.reduce(function (s, r) { return s + r.total; }, 0);
    var cab = rows.reduce(function (s, r) { return s + r.cabinet; }, 0);
    var nb = rows.length;
    var moy = nb ? Math.round(grand / nb) : 0;
    var sumPp = rows.reduce(function (s, r) { return s + r.postes; }, 0);
    var cpp = sumPp ? Math.round(grand / sumPp) : 0;
    var worst = rows.slice().sort(function (a, b) { return b.total - a.total; })[0];
    var pcCab = grand ? Math.round(cab / grand * 100) : 0;
    var depts = {};
    rows.forEach(function (r) { var d = r.departement || '—'; depts[d] = (depts[d] || 0) + 1; });
    var kpis = [
      { k: '', t: 'ANALYSES', v: String(nb), s: Object.keys(depts).length + ' départements', cls: '' },
      { k: '', t: 'COÛT TOTAL', v: kfcfa(grand) + ' F', s: 'budget global ' + kfcfa(CIBLES.budgetGlobal) + ' (' + pct(grand / CIBLES.budgetGlobal * 100) + ')', cls: grand > CIBLES.budgetGlobal ? 'bad' : '' },
      { k: 'moy', t: 'COÛT MOYEN/DEMANDE', v: kfcfa(moy) + ' F', s: 'par demande de recrutement', cls: '' },
      { k: 'poste', t: 'COÛT MOYEN/POSTE', v: kfcfa(cpp) + ' F', s: 'cible ' + kfcfa(CIBLES.cpp) + ' (Obj. 3)', cls: cpp > CIBLES.cpp ? 'bad' : '' },
      { k: 'cher', t: 'LA PLUS CHÈRE', v: worst ? kfcfa(worst.total) + ' F' : '—', s: worst ? worst.poste : '', cls: '' },
      { k: 'cab', t: 'BUDGET CABINETS', v: kfcfa(cab) + ' F', s: pcCab + ' % du total · cible ≤ ' + CIBLES.partCabinet + ' %', cls: pcCab > CIBLES.partCabinet ? 'bad' : '' }
    ];
    var zone = $('[data-aco="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="aco-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="aco-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="aco-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="aco-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.aco-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        if (k === 'cher' && worst) { openDrawer(worst.id); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.dept = ''; UI.coh = ''; UI.bud = ''; UI.nat = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Structure des coûts">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="12.5" font-weight="800" fill="currentColor">' + esc(kfcfa(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">FCFA total</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-aco="donut"]');
    var total = rows.reduce(function (s, r) { return s + r.total; }, 0);
    var parts = NATURES.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.reduce(function (s, r) { return s + (Number(r[n.k]) || 0); }, 0) };
    });
    zone.innerHTML = donutSvg(parts, total) +
      '<div class="aco-donut-legend">' + parts.map(function (p) {
        return '<span class="aco-dl-item' + (UI.nat === p.k ? ' on' : '') + '" data-nat="' + p.k + '" role="button" tabindex="0">' +
          '<span class="aco-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="aco-dl-val">' + (total ? Math.round(p.v / total * 100) : 0) + ' % · ' + kfcfa(p.v) + '</span></span>';
      }).join('') + '</div>';
    $$('.aco-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-nat');
        UI.nat = UI.nat === k ? '' : k;
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items, cible) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) return '<div class="aco-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      var over = cible && it.v > cible;
      var cpos = cible ? Math.min(100, cible / mx * 100) : null;
      return '<div class="aco-bar-row" data-id="' + (it.id != null ? it.id : '') + '" data-dept="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="aco-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="aco-bar-track"><span class="aco-bar-fill' + (over ? ' over' : '') + '" style="width:' + w + '%"></span>' +
        (cpos != null ? '<span class="aco-bar-cible" style="left:' + cpos + '%"></span>' : '') + '</span>' +
        '<span class="aco-bar-val">' + kfcfa(it.v) + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-aco="bars"]');
    $('[data-aco="bars-title"]').textContent = 'Coût par demande (cible ' + kfcfa(CIBLES.cpp) + '/poste)';
    var items = rows.slice().sort(function (a, b) { return b.total - a.total; }).map(function (r) {
      return { id: r.id, name: r.poste + ' · ' + r.numero, v: r.total };
    });
    zone.innerHTML = barRowsHtml(items, CIBLES.cpp);
    $$('.aco-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () { var id = Number(b.getAttribute('data-id')); if (id) openDrawer(id); });
    });
    var z2 = $('[data-aco="depts"]');
    var map = {};
    rows.forEach(function (r) { var d = r.departement || '—'; if (!map[d]) map[d] = { key: d, name: d, v: 0, n: 0 }; map[d].v += r.total; map[d].n++; });
    var items2 = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.v - a.v; });
    z2.innerHTML = barRowsHtml(items2, null);
    $$('.aco-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = b.getAttribute('data-dept');
        UI.dept = UI.dept === d ? '' : d;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var depts = {};
    rows.forEach(function (r) { if (r.departement) depts[r.departement] = 1; });
    var sel = $('[data-aco="f-dept"]');
    var cur = UI.dept;
    sel.innerHTML = '<option value="">Département : tous</option>' + Object.keys(depts).sort().map(function (d) {
      return '<option value="' + esc(d) + '"' + (cur === d ? ' selected' : '') + '>' + esc(d) + '</option>';
    }).join('');
    sel.value = cur;
    var sel2 = $('[data-aco="f-coh"]');
    sel2.innerHTML = '<option value="">Demande liée : toutes</option>' +
      '<option value="ok"' + (UI.coh === 'ok' ? ' selected' : '') + '>Conformes</option>' +
      '<option value="bad"' + (UI.coh === 'bad' ? ' selected' : '') + '>À vérifier</option>' +
      '<option value="err"' + (UI.coh === 'err' ? ' selected' : '') + '>Introuvables</option>';
    var sel3 = $('[data-aco="f-bud"]');
    sel3.innerHTML = '<option value="">Budget : tous</option>' +
      '<option value="over"' + (UI.bud === 'over' ? ' selected' : '') + '>Au-dessus de la cible</option>' +
      '<option value="ok"' + (UI.bud === 'ok' ? ' selected' : '') + '>Sous la cible</option>' +
      '<option value="cheap"' + (UI.bud === 'cheap' ? ' selected' : '') + '>Très économiques</option>' +
      '<option value="top"' + (UI.bud === 'top' ? ' selected' : '') + '>Top 3 coûts</option>';
    var sel4 = $('[data-aco="f-nat"]');
    sel4.innerHTML = '<option value="">Nature : toutes</option>' + NATURES.map(function (n) {
      return '<option value="' + n.k + '"' + (UI.nat === n.k ? ' selected' : '') + '>' + esc(n.lab) + ' &gt; 0</option>';
    }).join('');
    $('[data-aco="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-aco="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' analyses';
  }

  function cohChip(r) {
    var dot = r.coh.s === 'ok' ? '<span class="aco-dot ok"></span>' : r.coh.s === 'warn' ? '<span class="aco-dot warn"></span>' : r.coh.s === 'err' ? '<span class="aco-dot err"></span>' : '<span class="aco-dot" style="background:#94a3b8"></span>';
    var st = r.coh.d ? ' · ' + r.coh.d.statut : '';
    if (!r.demandeLiee) return '<span class="aco-chip neutral">' + dot + '—</span>';
    return '<span class="aco-chip ' + (r.coh.s === 'ok' ? 'ok' : r.coh.s === 'warn' ? 'warn' : 'err') + '" title="' + esc(r.coh.msg) + '">' + dot + esc(r.demandeLiee) + esc(st) + '</span>';
  }

  function natureCells(r) {
    return NATURES.map(function (n) {
      var v = Number(r[n.k]) || 0;
      return '<td class="aco-right' + (v === 0 ? ' zero' : '') + '">' + (v === 0 ? '0' : v.toLocaleString('fr-FR')) + '</td>';
    }).join('');
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var tot = { pub: 0, cab: 0, dep: 0, tst: 0, heb: 0, form: 0, aut: 0, grand: 0 };
    all.forEach(function (r) {
      tot.pub += r.publicite; tot.cab += r.cabinet; tot.dep += r.deplacement; tot.tst += r.tests;
      tot.heb += r.hebergement; tot.form += r.formation; tot.aut += r.autres; tot.grand += r.total;
    });
    var mx = all.reduce(function (m, r) { return Math.max(m, r.total); }, 0) || 1;
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      return '<th ' + (key ? 'data-sort="' + key + '"' : '') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="aco-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'aco-th-chk') + th('N°', 'numero') + th('Poste', 'poste') + th('Demande liée', 'demande') + th('Département', 'departement') +
      th('Publicité', 'publicite', 'aco-right') + th('Cabinet', 'cabinet', 'aco-right') + th('Dépl.', 'deplacement', 'aco-right') +
      th('Tests', 'tests', 'aco-right') + th('Héberg.', 'hebergement', 'aco-right') + th('Form.', 'formation', 'aco-right') + th('Autres', 'autres', 'aco-right') +
      th('Coût total', 'total', 'aco-right') + th('Coût/poste', 'cpp', 'aco-right') + th('Part', 'part') +
      th('Date', 'date') + th('Notes', null) + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      var over = r.cpp > CIBLES.cpp;
      return '<tr data-id="' + r.id + '">' +
        '<td><input type="checkbox" class="aco-chk" data-chk="' + r.id + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.poste) + '"></td>' +
        '<td class="aco-num">' + esc(r.numero) + '</td>' +
        '<td><span class="aco-poste" data-open="' + r.id + '">' + esc(r.poste) + '</span></td>' +
        '<td>' + cohChip(r) + '</td>' +
        '<td>' + (r.departement ? '<span class="aco-chip neutral">' + esc(r.departement) + '</span>' : '—') + '</td>' +
        natureCells(r) +
        '<td class="aco-right" style="font-weight:800">' + r.total.toLocaleString('fr-FR') + '</td>' +
        '<td class="aco-right"><span style="font-weight:700;color:' + (over ? 'var(--aco-err)' : 'var(--aco-ok)') + '">' + r.cpp.toLocaleString('fr-FR') + '</span></td>' +
        '<td><span style="font-size:.72rem;color:var(--aco-text2)">' + pct(r.part * 100) + '</span><span class="aco-pbar' + (r.part * 100 > CIBLES.partCabinet ? ' over' : '') + '"><i style="width:' + Math.max(2, r.part * 100) + '%"></i></span></td>' +
        '<td class="aco-num">' + esc(r.date || '—') + '</td>' +
        '<td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--aco-text2);font-size:.72rem" title="' + esc(r.notes || '') + '">' + esc(r.notes || '—') + '</td>' +
        '<td><div class="aco-actions">' +
          '<button class="aco-ic" data-open="' + r.id + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aco-ic" data-edit="' + r.id + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aco-ic" data-dup="' + r.id + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aco-ic danger" data-del="' + r.id + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="aco-tfoot"><td></td><td colspan="4">TOTAUX (' + all.length + ')</td>' +
      '<td class="aco-right">' + tot.pub.toLocaleString('fr-FR') + '<span class="aco-footpct">' + pct(tot.grand ? tot.pub / tot.grand * 100 : 0) + '</span></td>' +
      '<td class="aco-right">' + tot.cab.toLocaleString('fr-FR') + '<span class="aco-footpct">' + pct(tot.grand ? tot.cab / tot.grand * 100 : 0) + '</span></td>' +
      '<td class="aco-right">' + tot.dep.toLocaleString('fr-FR') + '<span class="aco-footpct">' + pct(tot.grand ? tot.dep / tot.grand * 100 : 0) + '</span></td>' +
      '<td class="aco-right">' + tot.tst.toLocaleString('fr-FR') + '<span class="aco-footpct">' + pct(tot.grand ? tot.tst / tot.grand * 100 : 0) + '</span></td>' +
      '<td class="aco-right">' + tot.heb.toLocaleString('fr-FR') + '<span class="aco-footpct">' + pct(tot.grand ? tot.heb / tot.grand * 100 : 0) + '</span></td>' +
      '<td class="aco-right">' + tot.form.toLocaleString('fr-FR') + '<span class="aco-footpct">' + pct(tot.grand ? tot.form / tot.grand * 100 : 0) + '</span></td>' +
      '<td class="aco-right">' + tot.aut.toLocaleString('fr-FR') + '<span class="aco-footpct">' + pct(tot.grand ? tot.aut / tot.grand * 100 : 0) + '</span></td>' +
      '<td class="aco-right">' + tot.grand.toLocaleString('fr-FR') + '<span class="aco-footpct">100 %</span></td>' +
      '<td colspan="4"></td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="aco-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="aco-sel" data-aco="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="aco-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="aco-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-aco="content"]');
    card.innerHTML = '<div class="aco-tblcard"><div class="aco-tblwrap"><table class="aco-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="18"><div class="aco-empty">Aucune analyse ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'poste' || k === 'numero' ? 1 : -1; }
        refresh();
      });
    });
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = Number(c.getAttribute('data-chk'));
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 analyses', 'err'); c.checked = false; return; } UI.cmp.push(id); }
        if (!c.checked && i > -1) UI.cmp.splice(i, 1);
        renderSelBar();
        renderHero();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(Number(b.getAttribute('data-open'))); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(Number(b.getAttribute('data-edit'))); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(Number(b.getAttribute('data-dup'))); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(Number(b.getAttribute('data-del'))); }); });
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-aco="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var mx = rows.reduce(function (m, r) { return Math.max(m, r.total); }, 0) || 1;
    var card = $('[data-aco="content"]');
    card.innerHTML = rows.length ? '<div class="aco-cards">' + rows.map(function (r) {
      var over = r.cpp > CIBLES.cpp;
      var struct = NATURES.map(function (n) {
        var v = Number(r[n.k]) || 0;
        return v > 0 ? '<i class="' + n.f + '" style="width:' + Math.max(2, v / r.total * 100) + '%" title="' + esc(n.lab) + ' ' + kfcfa(v) + '"></i>' : '';
      }).join('');
      return '<div class="aco-cardx' + (over ? ' over' : '') + '" data-id="' + r.id + '">' +
        '<div class="aco-card-top"><div><input type="checkbox" class="aco-chk" data-chk="' + r.id + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="aco-num">' + esc(r.numero) + '</span></div>' +
        '<span class="aco-chip ' + (over ? 'err' : 'ok') + '">' + (over ? 'Hors budget' : 'Conforme') + '</span></div>' +
        '<div class="aco-card-name" data-open="' + r.id + '">' + esc(r.poste) + '</div>' +
        '<div class="aco-card-total">' + r.total.toLocaleString('fr-FR') + ' FCFA</div>' +
        '<div class="aco-card-struct"><span>' + fcfa(r.cpp) + '/poste · ' + r.postes + ' poste' + (r.postes > 1 ? 's' : '') + '</span><span class="aco-fmini">' + struct + '</span></div>' +
        '<div class="aco-card-meta">' + cohChip(r) + (r.departement ? '<span class="aco-chip neutral">' + esc(r.departement) + '</span>' : '') +
        '<span class="aco-chip info">' + esc(r.date || '—') + '</span></div>' +
        '<div class="aco-card-foot"><span class="aco-num">' + pct(r.part * 100) + ' du budget</span>' +
        '<div class="aco-card-act">' +
          '<button class="aco-ic" data-open="' + r.id + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aco-ic" data-edit="' + r.id + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aco-ic" data-dup="' + r.id + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aco-ic danger" data-del="' + r.id + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="aco-empty">Aucune analyse ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = Number(c.getAttribute('data-chk'));
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 analyses', 'err'); c.checked = false; return; } UI.cmp.push(id); }
        if (!c.checked && i > -1) UI.cmp.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(Number(b.getAttribute('data-open'))); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(Number(b.getAttribute('data-edit'))); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(Number(b.getAttribute('data-dup'))); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(Number(b.getAttribute('data-del'))); }); });
  }

  function renderSelBar() {
    var zone = $('[data-aco="selbar"]');
    if (!UI.cmp.length) { zone.innerHTML = ''; return; }
    var rows = UI.cmp.map(function (id) { return rowById(id); }).filter(Boolean);
    var sum = rows.reduce(function (s, r) { return s + r.total; }, 0);
    zone.innerHTML = '<div class="aco-selbar">' +
      '<span class="aco-selbar-info">' + rows.length + ' sélectionnée' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="aco-selbar-sub">' + fcfa(sum) + ' cumulés</span>' +
      '<button class="aco-btn aco-btn-ghost" data-sel="cmp" ' + (rows.length < 2 ? 'disabled' : '') + '>Comparer</button>' +
      '<button class="aco-btn aco-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="aco-btn aco-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="aco-btn aco-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.cmp = []; refresh(); }
        else if (a === 'cmp') openCompare();
        else if (a === 'exp') exportCSV(UI.cmp.slice());
        else if (a === 'del') askDelBulk(UI.cmp.slice());
      });
    });
  }

  /* ================= drawer détail ================= */
  function closeDrawer() { $$('[data-aco="drawer"],[data-aco="backdrop"][data-aco-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var all = data();
    var moy = all.length ? Math.round(all.reduce(function (s, x) { return s + x.total; }, 0) / all.length) : 0;
    var ecart = moy ? Math.round((r.total - moy) / moy * 100) : 0;
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var struct = NATURES.map(function (n) {
      var v = Number(r[n.k]) || 0;
      return '<dt>' + esc(n.lab) + '</dt><dd>' + (v ? v.toLocaleString('fr-FR') + ' FCFA <span style="color:var(--aco-text2);font-weight:600">(' + pct(r.total ? v / r.total * 100 : 0) + ')</span>' : '—') + '</dd>';
    }).join('');
    var mini = NATURES.map(function (n) {
      var v = Number(r[n.k]) || 0;
      return v > 0 ? '<i class="' + n.f + '" style="width:' + Math.max(2, v / r.total * 100) + '%" title="' + esc(n.lab) + '"></i>' : '';
    }).join('');
    var d = r.coh.d;
    var demandBlock = !r.demandeLiee
      ? '<dl class="aco-kv"><dt>Liaison</dt><dd>Aucune demande liée</dd></dl>'
      : '<dl class="aco-kv">' +
        '<dt>Demande</dt><dd>' + esc(r.demandeLiee) + '</dd>' +
        (r.coh.s !== 'ok' ? '<dt>Cohérence</dt><dd style="color:var(--aco-' + (r.coh.s === 'err' ? 'err' : 'warn') + ')">' + esc(r.coh.msg) + '</dd>' : '<dt>Cohérence</dt><dd style="color:var(--aco-ok)">Conforme</dd>') +
        (d ? '<dt>Statut demande</dt><dd>' + esc(d.statut || '—') + '</dd>' +
          '<dt>Priorité</dt><dd>' + esc(d.priorite || '—') + '</dd>' +
          '<dt>Manager</dt><dd>' + esc(d.manager || '—') + '</dd>' +
          '<dt>Site</dt><dd>' + esc(d.site || '—') + '</dd>' +
          '<dt>Attente</dt><dd>' + (Number(d.joursAttente) || 0) + ' j' + (d.alerte ? ' <span class="aco-chip err">alerte</span>' : '') + '</dd>' : '') +
        '</dl>' +
        (d ? '' : '');
    var dr = h('aside', { class: 'aco-drawer', 'data-aco': 'drawer', role: 'dialog', 'aria-label': 'Détail ' + r.poste });
    dr.innerHTML =
      '<div class="aco-drawer-head"><div><div class="aco-drawer-title">' + esc(r.poste) + '</div>' +
      '<div class="aco-drawer-sub">' + esc(r.numero) + ' · ' + esc(r.departement || '—') + ' · ' + esc(r.date || '—') + '</div></div>' +
      '<button class="aco-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aco-drawer-body">' +
        '<div class="aco-live" style="margin-top:0"><span>Total <b>' + fcfa(r.total) + '</b></span>' +
          '<span>Coût/poste <b class="' + (r.cpp > CIBLES.cpp ? 'bad' : 'good') + '">' + fcfa(r.cpp) + '</b></span>' +
          '<span>Part <b>' + pct(r.part * 100) + '</b></span>' +
          '<span>Écart moyenne <b class="' + (ecart > 0 ? 'bad' : 'good') + '">' + (ecart > 0 ? '+' : '') + ecart + ' %</b></span></div>' +
        '<div class="aco-fsec">Structure par nature</div>' +
        '<span class="aco-fmini" style="width:100%;height:10px;margin-bottom:8px">' + mini + '</span>' +
        '<dl class="aco-kv">' + struct + '<dt>Postes pourvus</dt><dd>' + r.postes + '</dd>' +
        '<dt>Coût/poste</dt><dd>' + fcfa(r.cpp) + (r.cpp > CIBLES.cpp ? ' <span class="aco-chip err">cible dépassée</span>' : ' <span class="aco-chip ok">dans la cible</span>') + '</dd></dl>' +
        '<div class="aco-fsec">Demande de recrutement liée</div>' + demandBlock +
        '<a class="aco-btn aco-btn-ghost" style="margin-top:8px;text-decoration:none" href="/Domaine1_Recrutement_Candidats/demandes">Ouvrir les demandes →</a>' +
        '<div class="aco-fsec">Notes</div>' +
        '<textarea class="aco-notebox" data-aco="note" placeholder="Notes internes (cabinet, précisions…)">' + esc(r.notes || '') + '</textarea>' +
        '<div class="aco-drawer-actions">' +
          '<button class="aco-btn aco-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="aco-btn aco-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="aco-btn aco-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="aco-btn aco-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.aco-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-aco="note"]', dr).value;
      mutate(function (cur) {
        cur.lignes = cur.lignes.map(function (x) { if (Number(x.id) === Number(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.numero);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture détail', r.numero);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-aco="dialog"],[data-aco="backdrop"][data-aco-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var ds = storeDemandes();
    var depts = {};
    rows.forEach(function (x) { if (x.departement) depts[x.departement] = 1; });
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'aco-dialog', 'data-aco': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une analyse' : 'Nouvelle analyse' });
    dlg.innerHTML =
      '<div class="aco-dialog-head"><h3>' + (r ? 'Modifier l\u2019analyse ' + esc(r.numero) : 'Nouvelle analyse de coûts') + '</h3>' +
      '<button class="aco-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aco-dialog-body">' +
        '<div class="aco-fgrid">' +
          '<label class="aco-lab full">Poste visé *<input class="aco-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="aco-lab">Demande de recrutement liée<select class="aco-in" data-f="demandeLiee">' +
            '<option value="">— Aucune —</option>' +
            ds.map(function (d) { return '<option value="' + esc(d.numero) + '"' + (v('demandeLiee') === d.numero ? ' selected' : '') + '>' + esc(d.numero + ' · ' + d.poste) + '</option>'; }).join('') +
            (r && r.demandeLiee && !demandeByNum(r.demandeLiee) ? '<option value="' + esc(r.demandeLiee) + '" selected>' + esc(r.demandeLiee) + ' (hors référence)</option>' : '') +
          '</select></label>' +
          '<label class="aco-lab">Département<input class="aco-in" data-f="departement" list="aco-depts" value="' + esc(v('departement')) + '"><datalist id="aco-depts">' + Object.keys(depts).sort().map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join('') + '</datalist></label>' +
          NATURES.map(function (n) {
            return '<label class="aco-lab">' + esc(n.lab) + ' (FCFA)<input class="aco-in" type="number" min="0" step="500" data-f="' + n.k + '" value="' + esc(v(n.k) || '0') + '"></label>';
          }).join('') +
          '<label class="aco-lab">Date<input class="aco-in" data-f="date" value="' + esc(v('date') || '') + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="aco-lab">Postes pourvus<input class="aco-in" type="number" min="1" step="1" data-f="postes" value="' + esc(v('postes') || '1') + '"></label>' +
          '<label class="aco-lab full">Notes<textarea class="aco-in aco-ta" data-f="notes" placeholder="Cabinet prestataire, précisions…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        '<div class="aco-live" data-aco="dlg-live"></div>' +
        '<div data-aco="dlg-err"></div>' +
      '</div>' +
      '<div class="aco-dialog-foot"><span class="aco-form-hint">ISO 30401 · le coût/poste est comparé au budget prévisionnel (' + kfcfa(CIBLES.cpp) + ')</span>' +
      '<span style="display:flex;gap:8px"><button class="aco-btn aco-btn-ghost" data-act="cancel" style="color:var(--aco-text);border-color:var(--aco-line)">Annuler</button>' +
      '<button class="aco-btn aco-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer l\u2019analyse') + '</button></span></div>';
    $('.aco-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var t = 0;
      NATURES.forEach(function (n) { t += Number(val[n.k]) || 0; });
      var pp = Math.max(1, Number(val.postes) || 1);
      var cpp = Math.round(t / pp);
      var others = 0;
      rows.forEach(function (x) {
        if (editId && Number(x.id) === Number(editId)) return;
        var t2 = 0;
        NATURES.forEach(function (n) { t2 += Number(x[n.k]) || 0; });
        others += t2;
      });
      var part = (others + t) > 0 ? t / (others + t) * 100 : 0;
      var d = demandeByNum(val.demandeLiee);
      var coh = '';
      if (val.demandeLiee && d && val.poste && norm(d.poste) !== norm(val.poste)) coh = '<span class="bad">⚠ Poste ≠ demande (' + esc(d.poste) + ')</span>';
      else if (val.demandeLiee && !d) coh = '<span class="bad">⚠ Demande introuvable dans le référentiel</span>';
      else if (val.demandeLiee && d) coh = '<span class="good">✓ Demande conforme</span>';
      $('[data-aco="dlg-live"]', dlg).innerHTML =
        '<span>Total <b>' + fcfa(t) + '</b></span>' +
        '<span>Coût/poste <b class="' + (cpp > CIBLES.cpp ? 'bad' : 'good') + '">' + fcfa(cpp) + '</b></span>' +
        '<span>Part du budget actuel <b>' + pct(part) + '</b></span>' +
        (coh ? '<span>' + coh + '</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-aco="dlg-err"]', dlg);
      if (!String(val.poste || '').trim()) { err.innerHTML = '<div class="aco-form-err">Le poste visé est obligatoire.</div>'; return; }
      var t = 0;
      NATURES.forEach(function (n) { t += Number(val[n.k]) || 0; });
      if (t <= 0) { err.innerHTML = '<div class="aco-form-err">Renseignez au moins un montant de dépense.</div>'; return; }
      var N2 = function (x) { var k2 = Number(x); return isFinite(k2) ? Math.max(0, Math.round(k2)) : 0; };
      var rec = {
        poste: String(val.poste).trim(),
        publicite: N2(val.publicite), cabinet: N2(val.cabinet), deplacement: N2(val.deplacement),
        tests: N2(val.tests), hebergement: N2(val.hebergement), formation: N2(val.formation), autres: N2(val.autres),
        demandeLiee: String(val.demandeLiee || '').trim(), date: String(val.date || '').trim(),
        departement: String(val.departement || '').trim(), postes: Math.max(1, Number(val.postes) || 1),
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.lignes = cur.lignes.map(function (x) { if (Number(x.id) === Number(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Analyse modifiée', rec.poste);
        toast('Analyse mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var id = cur.lignes.reduce(function (m, x) { return Math.max(m, Number(x.id) || 0); }, 0) + 1;
          var cp = { id: id, numero: nextNumero(cur.lignes) };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.lignes = cur.lignes.concat([cp]);
          return cur;
        }, 'Analyse créée', rec.poste);
        toast('Analyse créée — ' + rec.poste, 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="poste"]', dlg);
    if (first) first.focus();
  }

  /* ================= duplication / suppression ================= */
  function dupRow(id) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      var nid = cur.lignes.reduce(function (m, x) { return Math.max(m, Number(x.id) || 0); }, 0) + 1;
      var cp = {};
      for (var k in r) if (k !== 'total' && k !== 'cpp' && k !== 'part' && k !== 'coh' && k !== 'postes') cp[k] = r[k];
      cp.id = nid;
      cp.numero = nextNumero(cur.lignes);
      cp.poste = String(r.poste) + ' (copie)';
      cp.postes = Math.max(1, Number(r.postes) || 1);
      cur.lignes = cur.lignes.concat([cp]);
      return cur;
    }, 'Analyse dupliquée', r.numero);
    toast('Analyse dupliquée', 'ok');
  }
  function closeConfirm() { $$('[data-aco="confirm"],[data-aco="backdrop"][data-aco-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aco-confirm', 'data-aco': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette analyse ?</h4><p>' + esc(r.numero) + ' — ' + esc(r.poste) + ' (' + fcfa(r.total) + '). Cette action est définitive.</p>' +
      '<div class="aco-confirm-row"><button class="aco-btn aco-btn-ghost" data-a="no" style="color:var(--aco-text);border-color:var(--aco-line)">Annuler</button>' +
      '<button class="aco-btn aco-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.lignes = cur.lignes.filter(function (x) { return Number(x.id) !== Number(id); }); return cur; }, 'Analyse supprimée', r.numero);
      UI.cmp = UI.cmp.filter(function (x) { return x !== Number(id); });
      closeConfirm(); closeDrawer();
      toast('Analyse supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var sum = rows.reduce(function (s, r) { return s + r.total; }, 0);
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' analyses ?') : 'Supprimer 1 analyse ?';
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aco-confirm', 'data-aco': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero); }).join(', ') + ' — ' + fcfa(sum) + ' au total. Cette action est définitive.</p>' +
      '<div class="aco-confirm-row"><button class="aco-btn aco-btn-ghost" data-a="no" style="color:var(--aco-text);border-color:var(--aco-line)">Annuler</button>' +
      '<button class="aco-btn aco-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.lignes = cur.lignes.filter(function (x) { return ids.indexOf(Number(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' analyses');
      UI.cmp = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' analyses supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= comparateur ================= */
  function closeCompare() { $$('[data-aco="compare"],[data-aco="backdrop"][data-aco-for="compare"]').forEach(function (n) { n.remove(); }); }
  function openCompare() {
    closeCompare();
    var ids = UI.cmp.length >= 2 ? UI.cmp : [];
    if (ids.length < 2) {
      var all = data().slice().sort(function (a, b) { return b.total - a.total; });
      ids = [all[0], all[all.length - 1]].filter(Boolean).map(function (r) { return r.id; });
    }
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (rows.length < 2) { toast('Sélectionnez au moins 2 analyses à comparer', 'err'); return; }
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'compare' });
    bd.addEventListener('click', closeCompare);
    var p = h('div', { class: 'aco-panel', 'data-aco': 'compare', role: 'dialog', 'aria-label': 'Comparateur' });
    var head = '<tr><th>Critère</th>' + rows.map(function (r) { return '<th>' + esc(r.poste) + '<br><span style="font-weight:600;color:var(--aco-text2)">' + esc(r.numero) + '</span></th>'; }).join('') + '</tr>';
    function row2(lab, get, fmt, bestMin) {
      var vals = rows.map(get);
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      return '<tr><td>' + esc(lab) + '</td>' + rows.map(function (r, i) {
        var v = vals[i];
        var cls = mn === mx ? '' : (bestMin ? (v === mn ? ' best' : v === mx ? ' bad' : '') : (v === mx ? ' best' : v === mn ? ' bad' : ''));
        return '<td class="' + cls + '">' + fmt(v, r) + '</td>';
      }).join('') + '</tr>';
    }
    var body = NATURES.map(function (n) {
      return row2(n.lab, function (r) { return Number(r[n.k]) || 0; }, function (v) { return v ? v.toLocaleString('fr-FR') : '—'; }, true);
    }).join('') +
      row2('Coût total', function (r) { return r.total; }, function (v) { return v.toLocaleString('fr-FR'); }, true) +
      row2('Postes pourvus', function (r) { return r.postes; }, function (v) { return String(v); }, false) +
      row2('Coût/poste', function (r) { return r.cpp; }, function (v) { return v.toLocaleString('fr-FR'); }, true) +
      row2('Part du budget', function (r) { return Math.round(r.part * 1000) / 10; }, function (v) { return pct(v); }, true) +
      '<tr><td>Demande liée</td>' + rows.map(function (r) {
        return '<td>' + (r.demandeLiee ? esc(r.demandeLiee) + (r.coh.s !== 'ok' ? ' <span class="aco-chip warn">⚠</span>' : '') : '—') + '</td>';
      }).join('') + '</tr>';
    p.innerHTML = '<div class="aco-panel-head"><h3>Comparateur d\u2019analyses de coûts</h3><button class="aco-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aco-panel-body"><div class="aco-cmp-wrap"><table class="aco-cmp"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="aco-cibles-note" style="margin-top:10px">Vert = le plus économique · Rouge = le plus coûteux. Les honnoraire de cabinets expliquent l\u2019essentiel des écarts dans le jeu de données actuel.</p></div>';
    $('.aco-drawer-x', p).addEventListener('click', closeCompare);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Comparateur ouvert', rows.length + ' analyses');
  }

  /* ================= simulateur budgétaire ================= */
  function closeSim() { $$('[data-aco="sim"],[data-aco="backdrop"][data-aco-for="sim"]').forEach(function (n) { n.remove(); }); }
  function openSim() {
    closeSim();
    var rows = data();
    var grand = rows.reduce(function (s, r) { return s + r.total; }, 0);
    var cab = rows.reduce(function (s, r) { return s + r.cabinet; }, 0);
    var nb = Math.max(1, rows.length);
    var moy = Math.round(grand / nb);
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'sim' });
    bd.addEventListener('click', closeSim);
    var p = h('div', { class: 'aco-panel', 'data-aco': 'sim', role: 'dialog', 'aria-label': 'Simulateur budgétaire' });
    p.innerHTML = '<div class="aco-panel-head"><h3>Simulateur d\u2019enveloppe budgétaire</h3><button class="aco-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aco-panel-body">' +
        '<div class="aco-sim-row"><label for="aco-sim-bud">Budget disponible (FCFA)</label>' +
          '<input type="range" id="aco-sim-bud" min="200000" max="5000000" step="50000" value="' + CIBLES.budgetGlobal + '">' +
          '<input class="aco-in" type="number" min="0" step="10000" data-aco="sim-bud-n" value="' + CIBLES.budgetGlobal + '"></div>' +
        '<div class="aco-sim-row"><label for="aco-sim-cpp">Coût moyen visé / recrutement (FCFA)</label>' +
          '<input type="range" id="aco-sim-cpp" min="20000" max="500000" step="5000" value="' + Math.min(500000, moy) + '">' +
          '<input class="aco-in" type="number" min="0" step="5000" data-aco="sim-cpp-n" value="' + moy + '"></div>' +
        '<div class="aco-sim-out" data-aco="sim-out"></div>' +
        '<div class="aco-sim-tip" data-aco="sim-tip"></div>' +
      '</div>';
    $('.aco-drawer-x', p).addEventListener('click', closeSim);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var rBud = $('#aco-sim-bud', p), nBud = $('[data-aco="sim-bud-n"]', p);
    var rCpp = $('#aco-sim-cpp', p), nCpp = $('[data-aco="sim-cpp-n"]', p);
    function parts() {
      return NATURES.map(function (n) {
        return { lab: n.lab, v: rows.reduce(function (s, r) { return s + (Number(r[n.k]) || 0); }, 0) };
      });
    }
    function calc() {
      var bud = Math.max(0, Number(nBud.value) || 0);
      var cpp = Math.max(1, Number(nCpp.value) || 1);
      var nbR = Math.floor(bud / cpp);
      var reste = bud - nbR * cpp;
      var out = $('[data-aco="sim-out"]', p);
      var rep = parts().map(function (pt) {
        var alloc = grand > 0 ? bud * (pt.v / grand) : 0;
        return '<div class="aco-sim-arow"><span>' + esc(pt.lab) + '</span><span class="aco-bar-track"><span class="aco-bar-fill" style="width:' + (grand ? pt.v / grand * 100 : 0) + '%"></span></span><span>' + kfcfa(alloc) + ' F</span><span>' + pct(grand ? pt.v / grand * 100 : 0) + '</span></div>';
      }).join('');
      out.innerHTML = '<div class="aco-sim-kpis"><span><b>' + nbR + '</b> recrutement' + (nbR > 1 ? 's' : '') + ' finançable' + (nbR > 1 ? 's' : '') + '</span>' +
        '<span>reste <b>' + kfcfa(reste) + ' F</b></span><span>coût moyen actuel <b>' + fcfa(moy) + '</b></span></div>' +
        '<div style="font-size:.72rem;color:var(--aco-text2);margin-bottom:5px">Allocation au prorata de la structure actuelle des coûts :</div>' +
        '<div class="aco-sim-alloc">' + rep + '</div>';
      var cabPct = grand ? Math.round(cab / grand * 100) : 0;
      var lib = cabPct > CIBLES.partCabinet ? Math.round(bud * (cabPct - CIBLES.partCabinet) / 100) : 0;
      $('[data-aco="sim-tip"]', p).innerHTML = lib > 0
        ? '💡 Ramener la part cabinets de ' + cabPct + ' % à ' + CIBLES.partCabinet + ' % libérerait ≈ ' + kfcfa(lib) + ' FCFA sur cette enveloppe — soit ' + Math.floor(lib / cpp) + ' recrutement(s) supplémentaire(s).'
        : '💡 Structure conforme : la part cabinets (' + cabPct + ' %) respecte la cible de ' + CIBLES.partCabinet + ' %. Concentrez l\u2019optimisation sur les tests et déplacements.';
    }
    function syncBud(v) { v = Math.max(200000, Math.min(5000000, Number(v) || 200000)); rBud.value = v; nBud.value = v; calc(); }
    function syncCpp(v) { v = Math.max(20000, Math.min(500000, Number(v) || 50000)); rCpp.value = v; nCpp.value = v; calc(); }
    rBud.addEventListener('input', function () { nBud.value = rBud.value; calc(); });
    nBud.addEventListener('change', function () { syncBud(nBud.value); });
    rCpp.addEventListener('input', function () { nCpp.value = rCpp.value; calc(); });
    nCpp.addEventListener('change', function () { syncCpp(nCpp.value); });
    calc();
    jlog('Simulateur budgétaire ouvert', '');
  }

  /* ================= cibles ================= */
  function closeCibles() { $$('[data-aco="cibles"],[data-aco="backdrop"][data-aco-for="cibles"]').forEach(function (n) { n.remove(); }); }
  function openCibles() {
    closeCibles();
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'cibles' });
    bd.addEventListener('click', closeCibles);
    var p = h('div', { class: 'aco-panel', 'data-aco': 'cibles', role: 'dialog', 'aria-label': 'Cibles de pilotage' });
    p.innerHTML = '<div class="aco-panel-head"><h3>Cibles & budgets de référence</h3><button class="aco-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aco-panel-body">' +
        '<p class="aco-cibles-note">Ces seuils alimentent les alertes, les couleurs et la ligne de cible du graphique (Objectif 3 ISO : « coût moyen par recrutement sous le budget prévisionnel par poste »).</p>' +
        '<div class="aco-sim-row"><label for="aco-c1">Budget prévisionnel / poste (FCFA)</label><input type="range" id="aco-c1" min="20000" max="500000" step="5000" value="' + CIBLES.cpp + '"><input class="aco-in" type="number" min="0" step="5000" data-aco="c1n" value="' + CIBLES.cpp + '"></div>' +
        '<div class="aco-sim-row"><label for="aco-c2">Budget global de référence (FCFA)</label><input type="range" id="aco-c2" min="200000" max="10000000" step="50000" value="' + CIBLES.budgetGlobal + '"><input class="aco-in" type="number" min="0" step="50000" data-aco="c2n" value="' + CIBLES.budgetGlobal + '"></div>' +
        '<div class="aco-sim-row"><label for="aco-c3">Part cabinets maximale (%)</label><input type="range" id="aco-c3" min="5" max="80" step="1" value="' + CIBLES.partCabinet + '"><input class="aco-in" type="number" min="0" max="100" step="1" data-aco="c3n" value="' + CIBLES.partCabinet + '"></div>' +
        '<div class="aco-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="aco-btn aco-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.aco-drawer-x', p).addEventListener('click', closeCibles);
    [['aco-c1', 'c1n', 'cpp', 20000, 500000, 5000], ['aco-c2', 'c2n', 'budgetGlobal', 200000, 10000000, 50000], ['aco-c3', 'c3n', 'partCabinet', 5, 80, 1]].forEach(function (cfg) {
      var r = $('#' + cfg[0], p), n = $('[data-aco="' + cfg[1] + '"]', p);
      r.addEventListener('input', function () { n.value = r.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); r.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      CIBLES.cpp = Math.max(20000, Number($('[data-aco="c1n"]', p).value) || CIBLES.cpp);
      CIBLES.budgetGlobal = Math.max(200000, Number($('[data-aco="c2n"]', p).value) || CIBLES.budgetGlobal);
      CIBLES.partCabinet = Math.max(5, Math.min(80, Number($('[data-aco="c3n"]', p).value) || CIBLES.partCabinet));
      saveCibles();
      closeCibles();
      jlog('Cibles mises à jour', 'cpp ' + kfcfa(CIBLES.cpp) + ' · budget ' + kfcfa(CIBLES.budgetGlobal) + ' · cabinets ≤ ' + CIBLES.partCabinet + ' %');
      toast('Cibles appliquées — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-aco="journal"],[data-aco="backdrop"][data-aco-for="journal"]').forEach(function (n) { n.remove(); }); }
  function openJournal() {
    closeJournal();
    var bd = h('div', { class: 'aco-backdrop', 'data-aco': 'backdrop', 'data-aco-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'aco-panel', 'data-aco': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="aco-panel-head"><h3>Journal d\u2019activité</h3><button class="aco-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aco-panel-body" data-aco="jlist"></div>';
    $('.aco-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-aco="jlist"]', p);
    var j = [];
    try { j = (window.__ADMINA_AUDIT__ && window.__ADMINA_AUDIT__.read ? window.__ADMINA_AUDIT__.read() : []) || []; } catch (e) { j = []; }
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="aco-jrow"><span class="aco-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="aco-jact">' + esc(x.action || '') + '</span><span class="aco-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="aco-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N°', 'Poste', 'Demande liée', 'Statut demande', 'Cohérence', 'Département'].concat(NATURES.map(function (n) { return n.lab; })).concat(['Coût total', 'Postes pourvus', 'Coût/poste', 'Part %', 'Date', 'Notes']);
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero, r.poste, r.demandeLiee || '', r.coh.d ? r.coh.d.statut : '', r.coh.msg, r.departement || ''];
      NATURES.forEach(function (n) { cells.push(String(Number(r[n.k]) || 0)); });
      cells.push(String(r.total), String(r.postes), String(r.cpp), String(Math.round(r.part * 1000) / 10), r.date || '', r.notes || '');
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    var tot = rows.reduce(function (s, r) { return s + r.total; }, 0);
    lines.push('');
    lines.push(['TOTAUX', '', '', '', '', ''].concat(NATURES.map(function (n) { return String(rows.reduce(function (s, r) { return s + (Number(r[n.k]) || 0); }, 0)); })).concat([String(tot), '', '', '', '', '']).join(sep));
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-analyse-couts-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSim(); closeCompare(); closeCibles(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-aco="dialog"]') || $('[data-aco="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSim(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { openCompare(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-aco="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle · E export · J journal · S simulateur · C comparer · / recherche', ''); }
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
    var root = $('[data-aco="root"]');
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
    if (UI.view === 'cards') renderCards(); else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-aco="drawer"],[data-aco="dialog"],[data-aco="confirm"],[data-aco="journal"],[data-aco="sim"],[data-aco="compare"],[data-aco="cibles"]')) {
      $$('[data-aco="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-aco');
    shellBuilt = false;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-aco]') || t.closest('#aco-depts'))) continue;
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
    html.classList.remove('admina-aco');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSim(); closeCompare(); closeCibles();
    UI.cmp = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-aco="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-aco-hide', '1');
      natif.setAttribute('data-aco-olddisp', natif.style.display || '');
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

  window.__ADMINA_COUT_UI__ = {
    version: '1.0-t24',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    exportCSV: exportCSV,
    openCompare: openCompare,
    openSim: openSim
  };
  try { console.info('[ADMINA_COUT] M24 actif — Centre de pilotage des coûts /analyse-des-couts'); } catch (e) {}
})();
