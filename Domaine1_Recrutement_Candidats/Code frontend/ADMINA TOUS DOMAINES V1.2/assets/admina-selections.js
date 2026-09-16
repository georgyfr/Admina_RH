/* =============================================================
   Admina-RH — Sélections (/selections) — couche admina
   W1-d : CENTRE DE PILOTAGE — Sélections (décisions finales)
   -------------------------------------------------------------
   PHILOSOPHIE — Sélections = la décision finale du recrutement :
   la shortlist a été faite, le pipeline a parlé, ici on ARBITRE.
   Chaque ligne est un arbitrage tracé : candidat, poste, décision
   (Retenu / Rejeté / En attente), note /20, justification écrite,
   décideur, notification du candidat. Le module rend ces décisions
   lisibles, comparables et auditable — héro calculé, alertes
   « arbitrages oubliés » cliquables (attente prolongée, finaliste
   sans décision, décision sans justification, poste sans sélection
   ferme, retenu sans offre liée), KPI filtres, donut des décisions,
   charge d'arbitrage par département/décideur, table triable,
   vue cartes, dossier de décision (critères, score, justification,
   notification), création/édition VALIDÉE, duplication, suppression
   confirmée, seuils configurables, export CSV, journal d'audit —
   SANS jamais trahir sa nature de tableau de décisions.
   -------------------------------------------------------------
   - Scope strict : /selections (RegExp /\/selections\/?$/)
   - Idempotent (data-asl / data-asl-hide), sans collision (__ADMINA_SEL_W1__)
   - Données : window.__ADMINA_SEL_API__ (patch chunk W1-d, pont
     bidirectionnel localStorage admina-selections-data) → fallback
     localStorage si l'API tarde (30 réessais au boot, sinon page
     native intacte)
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   - Canon : admina-basecand.js (M25) transposé abc→asl
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_SEL_W1__) return;
  window.__ADMINA_SEL_W1__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/selections\/?$/;
  var LS_DATA = 'admina-selections-data';
  var LS_UI = 'admina-sel-ui';
  var LS_SEUILS = 'admina-sel-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', dep: '', note: '', age: '', kpi: '', view: 'table', sortKey: 'date', sortDir: -1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, cmp: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { delaiDecision: 7, noteFinaliste: 15, noteFaible: 12 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var DECISIONS = [
    { k: 'Retenu', lab: 'Retenu', c: '#059669', f: 'd1' },
    { k: 'Rejete', lab: 'Rejeté', c: '#dc2626', f: 'd2' },
    { k: 'En attente', lab: 'En attente', c: '#d97706', f: 'd3' }
  ];
  function decMeta(k) { for (var i = 0; i < DECISIONS.length; i++) { if (DECISIONS[i].k === k) return DECISIONS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8', f: 'd3' }; }
  var DEC_RANK = { 'En attente': 0, 'Retenu': 1, 'Rejete': 2 };
  var NOTIFS = ['À envoyer', 'Envoyée', 'Non applicable'];

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
  function daysSince(s) {
    var t = tsOf(s);
    if (!t) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
  function todayFR() {
    var d = new Date();
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
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
  function toastsZone() { var z = $('[data-asl="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-asl', 'toasts'); z.className = 'asl-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'asl-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_SEL_API__ || null; }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.selections) { try { d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e2) { d = null; } }
    if (!d || !d.selections || !d.selections.length) return [];
    return d.selections.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.note = Number(u.note) || 0;
      u.sm = decMeta(u.statut);
      u.age = daysSince(u.dateSelection);
      u.justified = !!(u.notes && String(u.notes).trim().length);
      u.offre = String(u.offreLien || '').trim();
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function selIdNum(r) {
    var m = /^SEL-\d+-(\d+)$/.exec(String(r.numero || ''));
    return Math.max(Number(r.id) || 0, m ? Number(m[1]) : 0);
  }
  function nextSel(rows) {
    var mx = rows.reduce(function (m, r) { return Math.max(m, selIdNum(r)); }, 0) + 1;
    return { id: mx, numero: 'SEL-2025-' + String(mx).padStart(3, '0') };
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.selections) { toast('Écriture impossible — recharger la page', 'err'); return false; }
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

  /* ================= alertes ================= */
  function postesSansDecision(rows) {
    var ferme = {}, tout = {};
    rows.forEach(function (r) {
      var p = r.poste || '—';
      tout[p] = 1;
      if (r.statut === 'Retenu' || r.statut === 'Rejete') ferme[p] = 1;
    });
    return Object.keys(tout).filter(function (p) { return !ferme[p]; });
  }
  function computeAlerts(rows) {
    var out = [];
    var att = rows.filter(function (r) { return r.statut === 'En attente'; });
    var old = att.filter(function (r) { return r.age > SEUILS.delaiDecision; });
    if (old.length) {
      var worst = old.slice().sort(function (a, b) { return b.age - a.age; })[0];
      out.push({ tone: 'warn', txt: old.length + ' décision' + (old.length > 1 ? 's' : '') + ' en attente depuis plus de ' + SEUILS.delaiDecision + ' j — la plus ancienne : ' + worst.numero + ' ' + worst.candidat + ' (' + worst.age + ' j)', f: 'old' });
    }
    var fin = att.filter(function (r) { return r.note >= SEUILS.noteFinaliste; });
    if (fin.length) out.push({ tone: 'err', txt: fin.length + ' finaliste' + (fin.length > 1 ? 's' : '') + ' sans décision — note ≥ ' + SEUILS.noteFinaliste + '/20, à arbitrer sans délai (' + fin.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'final' });
    var nojust = rows.filter(function (r) { return !r.justified; });
    if (nojust.length) out.push({ tone: 'err', txt: nojust.length + ' décision' + (nojust.length > 1 ? 's' : '') + ' sans justification écrite — l\u2019arbitrage doit être tracé (' + nojust.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'nojust' });
    var nodec = postesSansDecision(rows);
    if (nodec.length) out.push({ tone: 'info', txt: nodec.length + ' poste' + (nodec.length > 1 ? 's' : '') + ' sans sélection ferme — toutes les décisions y sont en attente (' + nodec.slice(0, 2).join(', ') + '…)', f: 'nodec' });
    var nooffre = rows.filter(function (r) { return r.statut === 'Retenu' && !r.offre; });
    if (nooffre.length) out.push({ tone: 'warn', txt: nooffre.length + ' candidat' + (nooffre.length > 1 ? 's' : '') + ' retenu' + (nooffre.length > 1 ? 's' : '') + ' sans offre liée — à transmettre vers les offres d\u2019emploi (' + nooffre.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'nooffre' });
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var fermePostes = {};
    rows.forEach(function (r) { if (r.statut === 'Retenu' || r.statut === 'Rejete') fermePostes[norm(r.poste)] = 1; });
    var out = rows.filter(function (r) {
      if (UI.statut && r.statut !== UI.statut) return false;
      if (UI.dep && norm(r.departement) !== norm(UI.dep)) return false;
      if (UI.note === 'tal' && !(r.note >= SEUILS.noteFinaliste)) return false;
      if (UI.note === 't12' && !(r.note >= 12)) return false;
      if (UI.note === 'low' && !(r.note > 0 && r.note < SEUILS.noteFaible)) return false;
      if (UI.note === 'none' && r.note > 0) return false;
      if (UI.age === 'over' && !(r.statut === 'En attente' && r.age > SEUILS.delaiDecision)) return false;
      if (UI.kpi === 'ret' && r.statut !== 'Retenu') return false;
      if (UI.kpi === 'rej' && r.statut !== 'Rejete') return false;
      if (UI.kpi === 'att' && r.statut !== 'En attente') return false;
      if (UI.kpi === 'final' && !(r.note >= SEUILS.noteFinaliste)) return false;
      if (UI.kpi === 'nojust' && r.justified) return false;
      if (UI.kpi === 'nodec' && fermePostes[norm(r.poste)]) return false;
      if (UI.kpi === 'nooffre' && !(r.statut === 'Retenu' && !r.offre)) return false;
      if (q && !(norm(r.numero).indexOf(q) > -1 || norm(r.candidat).indexOf(q) > -1 || norm(r.poste).indexOf(q) > -1 || norm(r.departement).indexOf(q) > -1 || norm(r.decideur).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'note') { va = a.note; vb = b.note; }
      else if (k === 'age') { va = a.age; vb = b.age; }
      else if (k === 'date') { va = dateKey(a.dateSelection); vb = dateKey(b.dateSelection); }
      else if (k === 'statut') { va = DEC_RANK[a.statut] != null ? DEC_RANK[a.statut] : 9; vb = DEC_RANK[b.statut] != null ? DEC_RANK[b.statut] : 9; }
      else if (k === 'just') { va = a.justified ? 1 : 0; vb = b.justified ? 1 : 0; }
      else if (k === 'dep') { va = norm(a.departement); vb = norm(b.departement); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.dep ? 1 : 0) + (UI.note ? 1 : 0) + (UI.age ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.note = ''; UI.age = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/^S[ée]lections\s*$/.test((hs[i].textContent || '').trim())) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-asl="root"]');
    if (!root) {
      root = h('section', { 'data-asl': 'root', class: 'asl-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-asl-page')) {
      page.setAttribute('data-asl-page', '1');
      page.setAttribute('data-asl-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-asl-hide')) {
      natif.setAttribute('data-asl-hide', '1');
      natif.setAttribute('data-asl-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-asl="root"]'); if (root) root.remove();
    $$('[data-asl-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-asl-oldw') || '';
      n.removeAttribute('data-asl-page');
      n.removeAttribute('data-asl-oldw');
    });
    $$('[data-asl-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-asl-olddisp') || '';
      n.removeAttribute('data-asl-hide');
      n.removeAttribute('data-asl-olddisp');
    });
    $$('[data-asl]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-asl="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'asl-btn asl-btn-primary asl-backbtn', 'data-asl': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'selections');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    arbitre: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 21h8"/><path d="M6 7l6-3 6 3"/><path d="M6 7l-2.8 6a3.2 3.2 0 0 0 5.6 0z"/><path d="M18 7l-2.8 6a3.2 3.2 0 0 0 5.6 0z"/></svg>',
    cmp: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3v18M15 3v18"/><rect x="3" y="6" width="6" height="9" rx="1"/><rect x="15" y="9" width="6" height="9" rx="1"/></svg>',
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
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>'
  };
  var DEC_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12.5l2.5 2.5L16 9.5"/><circle cx="12" cy="12" r="9"/></svg>';

  function buildShell() {
    var root = $('[data-asl="root"]');
    if (!root || $('[data-asl="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="asl-hero" data-asl="hero">' +
        '<div class="asl-hero-main">' +
          '<div class="asl-hero-title">' +
            '<span class="asl-hero-ico" aria-hidden="true">' + DEC_ICON + '</span>' +
            '<div><h2 class="asl-h2">Centre de pilotage — Sélections</h2>' +
            '<p class="asl-hero-sub" data-asl="herosub"></p></div>' +
          '</div>' +
          '<div class="asl-hero-actions">' +
            '<button class="asl-btn" data-asl="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="asl-btn" data-asl="btn-arbitre" title="Dossier d\u2019arbitrage & notifications (P)">' + ICO.arbitre + 'Arbitrage</button>' +
            '<button class="asl-btn" data-asl="btn-cmp" title="Comparer des décisions (C)">' + ICO.cmp + 'Comparer <span class="asl-nc-badge" data-asl="cmp-badge"></span></button>' +
            '<button class="asl-btn" data-asl="btn-seuils" title="Seuils de pilotage">' + ICO.seuils + 'Seuils</button>' +
            '<button class="asl-btn" data-asl="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="asl-btn" data-asl="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="asl-btn asl-btn-primary" data-asl="btn-new" title="Nouvelle décision (N)">' + ICO.plus + 'Nouvelle décision</button>' +
          '</div>' +
        '</div>' +
        '<div class="asl-hero-alerts" data-asl="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="asl-kpis" data-asl="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="asl-charts" data-asl="charts">' +
        '<div class="asl-chart-card"><div class="asl-chart-title">Décisions prises</div><div class="asl-donut-wrap" data-asl="donut"></div></div>' +
        '<div class="asl-chart-card"><div class="asl-chart-title">Sélections par département</div><div class="asl-bars" data-asl="bars"></div></div>' +
        '<div class="asl-chart-card"><div class="asl-chart-title">Charge d\u2019arbitrage par décideur</div><div class="asl-bars" data-asl="decideurs"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="asl-toolbar" data-asl="toolbar">' +
        '<div class="asl-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (candidat, poste, n°, décideur, justification…)" data-asl="search" aria-label="Rechercher une décision" /></div>' +
        '<select data-asl="f-statut" class="asl-sel" aria-label="Filtrer par décision"></select>' +
        '<select data-asl="f-dep" class="asl-sel" aria-label="Filtrer par département"></select>' +
        '<select data-asl="f-note" class="asl-sel" aria-label="Filtrer par note"></select>' +
        '<select data-asl="f-age" class="asl-sel" aria-label="Filtrer par attente"></select>' +
        '<button class="asl-chipbtn" data-asl="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="asl-count" data-asl="count"></span>' +
        '<div class="asl-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="asl-vbtn" data-asl="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="asl-vbtn" data-asl="v-cards" title="Vue cartes (K)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-asl="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-asl="selbar"></div>' +

      /* PIED */
      '<div class="asl-foot">Décisions tracées : shortlist · arbitrage transparent · justification écrite · notification (ISO 30401) · journal d\u2019audit actif · seuils configurables · <button class="asl-link" data-asl="btn-native">Afficher le tableau natif</button></div>';

    $('[data-asl="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-asl="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-asl="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'selections'); window.print(); });
    $('[data-asl="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-asl="btn-arbitre"]', root).addEventListener('click', openArbitrage);
    $('[data-asl="btn-cmp"]', root).addEventListener('click', openCompare);
    $('[data-asl="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-asl="btn-native"]', root).addEventListener('click', showNative);
    $('[data-asl="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-asl="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-asl="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-asl="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-asl="f-dep"]', root).addEventListener('change', function (e) { UI.dep = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-asl="f-note"]', root).addEventListener('change', function (e) { UI.note = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-asl="f-age"]', root).addEventListener('change', function (e) { UI.age = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-asl="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-asl="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var nbRet = rows.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var nbAtt = rows.filter(function (r) { return r.statut === 'En attente'; }).length;
    var notes = rows.filter(function (r) { return r.note > 0; });
    var moy = notes.length ? (notes.reduce(function (s, r) { return s + r.note; }, 0) / notes.length) : 0;
    var just = rows.filter(function (r) { return r.justified; }).length;
    var sub = rows.length + ' décision' + (rows.length > 1 ? 's' : '') +
      ' · ' + nbRet + ' retenu' + (nbRet > 1 ? 's' : '') + ' (' + pct(rows.length ? nbRet / rows.length * 100 : 0) + ')' +
      ' · ' + nbAtt + ' en attente' +
      ' · note moyenne ' + (notes.length ? moy.toFixed(1) : '—') + '/20' +
      ' · ' + pct(rows.length ? just / rows.length * 100 : 0) + ' justifiées';
    $('[data-asl="herosub"]').textContent = sub;
    var zone = $('[data-asl="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="asl-alert ' + a.tone + '" data-asl="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.asl-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'old') UI.age = 'over';
        else if (f === 'final') { UI.statut = 'En attente'; UI.note = 'tal'; }
        else if (f === 'nojust') UI.kpi = 'nojust';
        else if (f === 'nodec') UI.kpi = 'nodec';
        else if (f === 'nooffre') UI.kpi = 'nooffre';
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var nbRet = rows.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var nbRej = rows.filter(function (r) { return r.statut === 'Rejete'; }).length;
    var nbAtt = rows.filter(function (r) { return r.statut === 'En attente'; }).length;
    var attOld = rows.filter(function (r) { return r.statut === 'En attente' && r.age > SEUILS.delaiDecision; }).length;
    var notes = rows.filter(function (r) { return r.note > 0; });
    var moy = notes.length ? notes.reduce(function (s, r) { return s + r.note; }, 0) / notes.length : 0;
    var nbFin = rows.filter(function (r) { return r.note >= SEUILS.noteFinaliste; }).length;
    var deps = {}; var postes = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; if (r.poste) postes[r.poste] = 1; });
    var kpis = [
      { k: '', t: 'DÉCISIONS', v: String(nb), s: Object.keys(postes).length + ' postes · ' + Object.keys(deps).length + ' départements', cls: '' },
      { k: 'ret', t: 'RETENUS', v: String(nbRet), s: 'taux de sélection ' + pct(nb ? nbRet / nb * 100 : 0), cls: nbRet === 0 ? 'gold' : '' },
      { k: 'rej', t: 'REJETÉS', v: String(nbRej), s: 'décisions argumentées', cls: '' },
      { k: 'att', t: 'EN ATTENTE', v: String(nbAtt), s: attOld ? attOld + ' au-delà de ' + SEUILS.delaiDecision + ' j' : 'dans les délais', cls: attOld ? 'gold' : '' },
      { k: '', t: 'NOTE MOYENNE', v: (notes.length ? moy.toFixed(1) : '—') + '/20', s: 'sur ' + notes.length + ' notée' + (notes.length > 1 ? 's' : ''), cls: '' },
      { k: 'final', t: 'FINALISTES ≥' + SEUILS.noteFinaliste, v: String(nbFin), s: 'shortlist à arbitrer', cls: '' }
    ];
    var zone = $('[data-asl="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="asl-kpi' + (k.cls === 'gold' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="asl-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="asl-kpi-v' + (k.cls === 'gold' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="asl-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.asl-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.dep = ''; UI.note = ''; UI.age = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Répartition des décisions">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">décisions</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-asl="donut"]');
    var parts = DECISIONS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="asl-donut-legend">' + parts.map(function (p) {
        return '<span class="asl-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="asl-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="asl-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.asl-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.statut = UI.statut === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) return '<div class="asl-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="asl-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="asl-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="asl-bar-track"><span class="asl-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="asl-bar-val">' + it.v + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-asl="bars"]');
    var map = {};
    rows.forEach(function (r) { var p = r.departement || '—'; if (!map[p]) map[p] = { key: p, name: p, v: 0 }; map[p].v++; });
    var items = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items);
    $$('.asl-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.dep = UI.dep === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    var z2 = $('[data-asl="decideurs"]');
    var map2 = {};
    rows.forEach(function (r) { var d = r.decideur || '—'; if (!map2[d]) map2[d] = { key: d, name: d, v: 0 }; map2[d].v++; });
    var items2 = Object.keys(map2).map(function (k) { return map2[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    z2.innerHTML = barRowsHtml(items2);
    $$('.asl-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        resetFilters();
        if (k && k !== '—') { UI.q = k; var si = $('[data-asl="search"]'); if (si) si.value = k; }
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var deps = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; });
    var sel = $('[data-asl="f-statut"]');
    sel.innerHTML = '<option value="">Décision : toutes</option>' + DECISIONS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-asl="f-dep"]');
    sel2.innerHTML = '<option value="">Département : tous</option>' + Object.keys(deps).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.dep === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-asl="f-note"]');
    sel3.innerHTML = '<option value="">Note : toutes</option>' +
      '<option value="tal"' + (UI.note === 'tal' ? ' selected' : '') + '>\u2265 ' + SEUILS.noteFinaliste + ' /20 (finalistes)</option>' +
      '<option value="t12"' + (UI.note === 't12' ? ' selected' : '') + '>\u2265 12 /20</option>' +
      '<option value="low"' + (UI.note === 'low' ? ' selected' : '') + '>&lt; ' + SEUILS.noteFaible + ' /20</option>' +
      '<option value="none"' + (UI.note === 'none' ? ' selected' : '') + '>Non notées</option>';
    var sel4 = $('[data-asl="f-age"]');
    sel4.innerHTML = '<option value="">Attente : toutes</option>' +
      '<option value="over"' + (UI.age === 'over' ? ' selected' : '') + '>En attente &gt; ' + SEUILS.delaiDecision + ' j</option>';
    $('[data-asl="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-asl="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' décisions';
  }

  function decChip(r) {
    var sm = r.sm || decMeta(r.statut);
    return '<span class="asl-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }

  function noteCell(r) {
    if (r.note <= 0) return '<span class="asl-score zero" title="Non noté">—</span>';
    var cls = r.note >= SEUILS.noteFinaliste ? ' hi' : r.note < SEUILS.noteFaible ? ' low' : ' mid';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="asl-score' + cls + '">' + r.note + '</span>' +
      '<span class="asl-scorebar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(r.note / 20 * 100)) + '%"></i></span></span>';
  }

  function justCell(r) {
    if (!r.justified) return '<span class="asl-just missing" title="Aucune justification écrite">⚠ à justifier</span>';
    return '<span class="asl-just" title="' + esc(r.notes) + '">' + esc(r.notes) + '</span>';
  }

  function ageCell(r) {
    if (r.statut !== 'En attente') return '<span class="asl-anci">' + r.age + ' j</span>';
    var cls = r.age > SEUILS.delaiDecision * 2 ? ' err' : r.age > SEUILS.delaiDecision ? ' warn' : '';
    return '<span class="asl-anci' + cls + '">' + r.age + ' j</span>';
  }

  function notifChip(r) {
    var n = String(r.notif || '').trim();
    if (!n) return '<span class="asl-chip neutral" title="Notification non renseignée">—</span>';
    if (n === 'Envoyée') return '<span class="asl-chip ok" title="Candidat notifié' + (r.notifDate ? ' le ' + r.notifDate : '') + '">Notifié ✓</span>';
    if (n === 'À envoyer') return '<span class="asl-chip warn" title="Notification à envoyer">À notifier</span>';
    return '<span class="asl-chip neutral" title="' + esc(n) + '">' + esc(n) + '</span>';
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var nbRet = all.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var notes = all.filter(function (r) { return r.note > 0; });
    var moy = notes.length ? (notes.reduce(function (s, r) { return s + r.note; }, 0) / notes.length).toFixed(1) : '—';
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var sortAttr = '';
      if (key) sortAttr = key === sortKey ? ' aria-sort="' + (dir < 0 ? 'descending' : 'ascending') + '"' : ' aria-sort="none"';
      return '<th' + (key ? ' data-sort="' + key + '"' : '') + sortAttr + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="asl-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'asl-th-chk') + th('N°', 'numero') + th('Candidat', 'candidat') + th('Poste', 'poste') + th('Département', 'dep') +
      th('Décision', 'statut') + th('Note', 'note') + th('Justification', 'just') + th('Décideur', 'decideur') +
      th('Date', 'date') + th('Attente', 'age') + th('Notification', null) + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="asl-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.numero) + '"></td>' +
        '<td class="asl-num">' + esc(r.numero || r.id) + '</td>' +
        '<td><span class="asl-poste" data-open="' + esc(r.id) + '">' + esc(r.candidat) + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.poste || '—') + '</td>' +
        '<td>' + (r.departement ? '<span class="asl-chip neutral">' + esc(r.departement) + '</span>' : '—') + '</td>' +
        '<td>' + decChip(r) + '</td>' +
        '<td>' + noteCell(r) + '</td>' +
        '<td>' + justCell(r) + '</td>' +
        '<td>' + esc(r.decideur || '—') + '</td>' +
        '<td class="asl-num">' + esc(jDate(r.dateSelection) || '—') + '</td>' +
        '<td>' + ageCell(r) + '</td>' +
        '<td>' + notifChip(r) + '</td>' +
        '<td><div class="asl-actions">' +
          '<button class="asl-ic" data-open="' + esc(r.id) + '" title="Dossier de décision">' + ICO.eye + '</button>' +
          '<button class="asl-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="asl-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="asl-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="asl-tfoot"><td></td><td colspan="12">TOTAL ' + all.length + ' décisions · ' + nbRet + ' retenu(s) · note moyenne ' + moy + '/20</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="asl-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="asl-sel" data-asl="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="asl-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="asl-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-asl="content"]');
    card.innerHTML = '<div class="asl-tblcard"><div class="asl-tblwrap"><table class="asl-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="13"><div class="asl-empty">Aucune décision ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'candidat' || k === 'numero' || k === 'poste' || k === 'dep' || k === 'decideur' ? 1 : -1; }
        refresh();
      });
    });
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 décisions', 'err'); c.checked = false; return; } UI.cmp.push(id); }
        if (!c.checked && i > -1) UI.cmp.splice(i, 1);
        renderSelBar();
        renderHero();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit')); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-asl="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var card = $('[data-asl="content"]');
    card.innerHTML = rows.length ? '<div class="asl-cards">' + rows.map(function (r) {
      return '<div class="asl-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="asl-card-top"><div><input type="checkbox" class="asl-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="asl-num">' + esc(r.numero || r.id) + '</span></div>' +
        decChip(r) + '</div>' +
        '<div class="asl-card-name" data-open="' + esc(r.id) + '">' + esc(r.candidat) + '</div>' +
        '<div class="asl-card-total" style="font-size:.95rem">' + esc(r.poste || '—') + '</div>' +
        '<div><span style="display:inline-flex;align-items:center;gap:7px">' + noteCell(r) +
        '<span style="color:var(--asl-text2);font-size:.74rem;font-weight:600">' + esc(r.decideur || 'Décideur non renseigné') + '</span></span></div>' +
        '<div class="asl-card-just' + (r.justified ? '' : ' missing') + '">' + (r.justified ? esc(r.notes) : '⚠ Décision sans justification écrite') + '</div>' +
        '<div class="asl-card-meta">' + (r.departement ? '<span class="asl-chip neutral">' + esc(r.departement) + '</span>' : '') + notifChip(r) + (r.offre ? '<span class="asl-chip ok" title="Offre liée">' + esc(r.offre) + '</span>' : '') + '</div>' +
        '<div class="asl-card-foot"><span class="asl-num">' + esc(jDate(r.dateSelection) || '—') + ' · ' + ageCell(r) + '</span>' +
        '<div class="asl-card-act">' +
          '<button class="asl-ic" data-open="' + esc(r.id) + '" title="Dossier de décision">' + ICO.eye + '</button>' +
          '<button class="asl-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="asl-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="asl-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="asl-empty">Aucune décision ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 décisions', 'err'); c.checked = false; return; } UI.cmp.push(id); }
        if (!c.checked && i > -1) UI.cmp.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit')); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  function renderSelBar() {
    var badge = $('[data-asl="cmp-badge"]');
    if (badge) { badge.textContent = UI.cmp.length ? String(UI.cmp.length) : ''; badge.style.display = UI.cmp.length ? '' : 'none'; }
    var zone = $('[data-asl="selbar"]');
    if (!UI.cmp.length) { zone.innerHTML = ''; return; }
    var rows = UI.cmp.map(function (id) { return rowById(id); }).filter(Boolean);
    var notes = rows.filter(function (r) { return r.note > 0; });
    var moy = notes.length ? (notes.reduce(function (s, r) { return s + r.note; }, 0) / notes.length).toFixed(1) : '—';
    zone.innerHTML = '<div class="asl-selbar">' +
      '<span class="asl-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="asl-selbar-sub">note moyenne ' + moy + '/20</span>' +
      '<button class="asl-btn asl-btn-ghost" data-sel="cmp" ' + (rows.length < 2 ? 'disabled' : '') + '>Comparer</button>' +
      '<button class="asl-btn asl-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="asl-btn asl-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="asl-btn asl-btn-ghost" data-sel="clear">Annuler</button></div>';
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

  /* ================= drawer dossier de décision ================= */
  function closeDrawer() { $$('[data-asl="drawer"],[data-asl="backdrop"][data-asl-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var sm = r.sm;
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var verdict;
    if (r.note <= 0) verdict = '<span class="asl-verdict">Non noté — évaluation manquante</span>';
    else if (r.note >= SEUILS.noteFinaliste) verdict = '<span class="asl-verdict" style="background:var(--asl-okbg);color:var(--asl-ok);border-color:var(--asl-ok)">Profil finaliste ≥ ' + SEUILS.noteFinaliste + '/20</span>';
    else if (r.note < SEUILS.noteFaible) verdict = '<span class="asl-verdict" style="background:var(--asl-errbg);color:var(--asl-err);border-color:var(--asl-err)">Note faible &lt; ' + SEUILS.noteFaible + '/20</span>';
    else verdict = '<span class="asl-verdict">Profil intermédiaire</span>';
    var notifBlock;
    if (String(r.notif || '').trim() === 'Envoyée') {
      notifBlock = '<dl class="asl-kv">' + kv('Statut', '<span class="asl-chip ok">Candidat notifié ✓</span>' + (r.notifDate ? ' le ' + esc(jDate(r.notifDate)) : '')) + '</dl>';
    } else {
      notifBlock = '<dl class="asl-kv">' + kv('Statut', notifChip(r)) + '</dl>' +
        '<button class="asl-btn asl-btn-ghost" data-act="notify">' + ICO.bell + 'Marquer le candidat comme notifié</button>';
    }
    var dr = h('aside', { class: 'asl-drawer', 'data-asl': 'drawer', role: 'dialog', 'aria-label': 'Dossier de décision ' + r.candidat });
    dr.innerHTML =
      '<div class="asl-drawer-head"><div><div class="asl-drawer-title">' + esc(r.candidat) + '</div>' +
      '<div class="asl-drawer-sub">' + esc(r.numero || r.id) + ' · ' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div></div>' +
      '<button class="asl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asl-drawer-body">' +
        '<div class="asl-live" style="margin-top:0"><span>Décision <b style="color:' + sm.c + '">' + esc(sm.lab) + '</b></span>' +
          '<span>Note <b>' + (r.note > 0 ? r.note + '/20' : '—') + '</b></span>' +
          '<span>Attente <b>' + r.age + ' j</b></span>' +
          '<span>Notification <b>' + esc(String(r.notif || '—')) + '</b></span></div>' +
        '<div class="asl-fsec">Dossier de décision</div>' +
        '<div class="asl-sim-row" style="margin-bottom:10px"><label for="asl-decsel">Changer la décision</label>' +
          '<select id="asl-decsel" class="asl-in" data-asl="decsel">' + DECISIONS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select><span></span></div>' +
        '<dl class="asl-kv">' +
          kv('N° sélection', esc(r.numero || r.id)) +
          kv('Poste', esc(r.poste || '—')) +
          kv('Département', esc(r.departement || '—')) +
          kv('Date de décision', esc(jDate(r.dateSelection) || '—')) +
          kv('Décideur', esc(r.decideur || '—')) +
          kv('Offre liée', r.offre ? esc(r.offre) : '<span class="asl-chip neutral">—</span>') +
        '</dl>' +
        '<div class="asl-fsec">Critères & score</div>' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' + noteCell(r) + verdict + '</div>' +
        '<p class="asl-cibles-note" style="margin-top:8px">Seuils : finaliste ≥ ' + SEUILS.noteFinaliste + '/20 · note faible &lt; ' + SEUILS.noteFaible + '/20 (modifiables via « Seuils »).</p>' +
        '<div class="asl-fsec">Justification écrite</div>' +
        '<textarea class="asl-notebox" data-asl="note" placeholder="Justification de la décision — obligatoire pour tout arbitrage (ISO 30401)">' + esc(r.notes || '') + '</textarea>' +
        (!r.justified ? '<div class="asl-live" style="margin-top:8px"><span class="bad">⚠ Cette décision n\u2019a pas encore de justification écrite</span></div>' : '') +
        '<div class="asl-fsec">Notification du candidat</div>' +
        notifBlock +
        (r.statut === 'Retenu' && !r.offre ? '<a class="asl-btn asl-btn-ghost" style="text-decoration:none" href="/Domaine1_Recrutement_Candidats/offres">Ouvrir les offres d\u2019emploi →</a>' : '') +
        '<div class="asl-drawer-actions">' +
          '<button class="asl-btn asl-btn-ghost" data-act="note">Enregistrer la justification</button>' +
          '<button class="asl-btn asl-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="asl-btn asl-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="asl-btn asl-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.asl-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-asl="decsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statut) return;
      mutate(function (cur) {
        cur.selections = cur.selections.map(function (x) { if (String(x.id) === String(id)) { x.statut = nv; if (nv !== 'En attente' && !String(x.decisionDate || '').trim()) x.decisionDate = todayFR(); } return x; });
        return cur;
      }, 'Décision modifiée', (r.numero || r.id) + ' → ' + decMeta(nv).lab);
      toast('Décision : ' + decMeta(nv).lab, 'ok');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-asl="note"]', dr).value;
      if (!String(v).trim()) { toast('La justification écrite est obligatoire', 'err'); return; }
      mutate(function (cur) {
        cur.selections = cur.selections.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Justification enregistrée', r.numero || r.id);
      toast('Justification enregistrée', 'ok');
    });
    $('[data-act="notify"]', dr) && $('[data-act="notify"]', dr).addEventListener('click', function () {
      mutate(function (cur) {
        cur.selections = cur.selections.map(function (x) { if (String(x.id) === String(id)) { x.notif = 'Envoyée'; x.notifDate = todayFR(); } return x; });
        return cur;
      }, 'Candidat notifié', r.numero || r.id);
      toast('Notification enregistrée — ' + r.candidat, 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture dossier de décision', r.numero || r.id);
  }

  /* ================= dialog création / édition (validé) ================= */
  function closeDialog() { $$('[data-asl="dialog"],[data-asl="backdrop"][data-asl-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'asl-dialog', 'data-asl': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une décision' : 'Nouvelle décision' });
    function opts(list, cur) {
      return list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = typeof x === 'object' ? x.lab : x;
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    dlg.innerHTML =
      '<div class="asl-dialog-head"><h3>' + (r ? 'Modifier la décision ' + esc(r.numero || r.id) : 'Nouvelle sélection — dossier de décision') + '</h3>' +
      '<button class="asl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asl-dialog-body">' +
        '<div class="asl-fgrid">' +
          '<label class="asl-lab">Candidat *<input class="asl-in" data-f="candidat" value="' + esc(v('candidat')) + '" placeholder="Ex. Nkoulou Brandon"></label>' +
          '<label class="asl-lab">Poste *<input class="asl-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="asl-lab">Département<input class="asl-in" data-f="departement" value="' + esc(v('departement')) + '" placeholder="Ex. Restauration"></label>' +
          '<label class="asl-lab">Décision *<select class="asl-in" data-f="statut">' + opts(DECISIONS, v('statut') || 'En attente') + '</select></label>' +
          '<label class="asl-lab">Note /20<input class="asl-in" type="number" min="0" max="20" step="1" data-f="note" value="' + esc(v('note') || '0') + '"></label>' +
          '<label class="asl-lab">Date de décision<input class="asl-in" data-f="dateSelection" value="' + esc(jDate(v('dateSelection')) || todayFR()) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="asl-lab">Décideur<input class="asl-in" data-f="decideur" value="' + esc(v('decideur')) + '" placeholder="Ex. Mme. Fotso Marie"></label>' +
          '<label class="asl-lab">Offre liée (si retenu)<input class="asl-in" data-f="offreLien" value="' + esc(v('offreLien')) + '" placeholder="Ex. OF-2025-001"></label>' +
          '<label class="asl-lab">Notification<select class="asl-in" data-f="notif">' + opts(NOTIFS, v('notif') || 'À envoyer') + '</select></label>' +
          '<label class="asl-lab full">Justification écrite *<textarea class="asl-in asl-ta" data-f="notes" placeholder="Motivation de la décision — obligatoire pour tout arbitrage">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        '<div class="asl-live" data-asl="dlg-live"></div>' +
        '<div data-asl="dlg-err"></div>' +
      '</div>' +
      '<div class="asl-dialog-foot"><span class="asl-form-hint">ISO 30401 · toute décision est tracée : candidat, poste, arbitrage, justification · le candidat retenu est à notifier puis à transmettre aux offres</span>' +
      '<span style="display:flex;gap:8px"><button class="asl-btn asl-btn-ghost" data-act="cancel" style="color:var(--asl-text);border-color:var(--asl-line)">Annuler</button>' +
      '<button class="asl-btn asl-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer la décision') + '</button></span></div>';
    $('.asl-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var sc = Number(val.note) || 0;
      var anc = daysSince(val.dateSelection);
      var jok = !!(val.notes && String(val.notes).trim().length);
      $('[data-asl="dlg-live"]', dlg).innerHTML =
        '<span>Décision <b>' + esc(val.statut ? decMeta(val.statut).lab : '—') + '</b></span>' +
        '<span>Note <b class="' + (sc >= SEUILS.noteFinaliste ? 'good' : sc > 0 ? '' : 'bad') + '">' + (sc > 0 ? sc + '/20' : 'non noté') + '</b></span>' +
        '<span>Attente <b>' + (anc ? anc + ' j' : '—') + '</b></span>' +
        '<span>Justification <b class="' + (jok ? 'good' : 'bad') + '">' + (jok ? '✓ écrite' : '⚠ obligatoire') + '</b></span>';
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('change', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-asl="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="asl-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.candidat || '').trim()) return fail('Le candidat est obligatoire.');
      if (!String(val.poste || '').trim()) return fail('Le poste est obligatoire.');
      if (!String(val.statut || '').trim()) return fail('La décision est obligatoire.');
      if (!String(val.notes || '').trim()) return fail('La justification écrite est obligatoire — une décision non tracée n\u2019est pas opposable.');
      var sc = Number(val.note) || 0;
      if (sc < 0 || sc > 20) return fail('La note doit être comprise entre 0 et 20.');
      if (val.dateSelection && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(String(val.dateSelection).trim()) && !/^\d{4}-\d{1,2}-\d{1,2}$/.test(String(val.dateSelection).trim())) return fail('Format de date attendu : jj/mm/aaaa.');
      var rec = {
        candidat: String(val.candidat).trim(),
        poste: String(val.poste).trim(),
        departement: String(val.departement || '').trim(),
        statut: String(val.statut).trim(),
        note: sc,
        dateSelection: String(val.dateSelection || '').trim() || todayFR(),
        decideur: String(val.decideur || '').trim(),
        offreLien: String(val.offreLien || '').trim(),
        notif: String(val.notif || '').trim(),
        notes: String(val.notes || '').trim()
      };
      if (editId) {
        mutate(function (cur) {
          cur.selections = cur.selections.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Décision modifiée', rec.candidat + ' — ' + rec.poste);
        toast('Décision mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var nx = nextSel(cur.selections);
          var cp = {
            id: nx.id,
            numero: nx.numero,
            statut: rec.statut,
            notifDate: ''
          };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.selections = cur.selections.concat([cp]);
          return cur;
        }, 'Décision créée', rec.candidat + ' — ' + rec.poste);
        toast('Décision créée — ' + rec.candidat, 'ok');
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
      var nx = nextSel(cur.selections);
      var cp = {};
      for (var k in r) if (['sm', 'age', 'justified', 'offre'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = nx.id;
      cp.numero = nx.numero;
      cp.statut = 'En attente';
      cp.notif = 'À envoyer';
      cp.notifDate = '';
      cp.offreLien = '';
      cp.notes = '';
      cp.dateSelection = todayFR();
      cur.selections = cur.selections.concat([cp]);
      return cur;
    }, 'Décision dupliquée', r.numero || r.id);
    toast('Décision dupliquée (nouvel arbitrage à justifier)', 'ok');
  }
  function closeConfirm() { $$('[data-asl="confirm"],[data-asl="backdrop"][data-asl-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'asl-confirm', 'data-asl': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette décision ?</h4><p>' + esc(r.numero || r.id) + ' — ' + esc(r.candidat) + ' (' + esc(r.poste || '—') + '). Cette action est définitive.</p>' +
      '<div class="asl-confirm-row"><button class="asl-btn asl-btn-ghost" data-a="no" style="color:var(--asl-text);border-color:var(--asl-line)">Annuler</button>' +
      '<button class="asl-btn asl-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.selections = cur.selections.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Décision supprimée', r.numero || r.id);
      UI.cmp = UI.cmp.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Décision supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' décisions ?') : 'Supprimer 1 décision ?';
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'asl-confirm', 'data-asl': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero || r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="asl-confirm-row"><button class="asl-btn asl-btn-ghost" data-a="no" style="color:var(--asl-text);border-color:var(--asl-line)">Annuler</button>' +
      '<button class="asl-btn asl-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.selections = cur.selections.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' décisions');
      UI.cmp = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' décisions supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= comparateur de décisions ================= */
  function closeCompare() { $$('[data-asl="compare"],[data-asl="backdrop"][data-asl-for="compare"]').forEach(function (n) { n.remove(); }); }
  function openCompare() {
    closeCompare();
    var ids = UI.cmp.length >= 2 ? UI.cmp : [];
    if (ids.length < 2) {
      var all = data().slice().sort(function (a, b) { return b.note - a.note; });
      ids = [all[0], all[1]].filter(Boolean).map(function (r) { return String(r.id); });
    }
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (rows.length < 2) { toast('Sélectionnez au moins 2 décisions à comparer', 'err'); return; }
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'compare' });
    bd.addEventListener('click', closeCompare);
    var p = h('div', { class: 'asl-panel', 'data-asl': 'compare', role: 'dialog', 'aria-label': 'Comparateur' });
    var head = '<tr><th>Critère</th>' + rows.map(function (r) { return '<th>' + esc(r.candidat) + '<br><span style="font-weight:600;color:var(--asl-text2)">' + esc(r.numero || r.id) + '</span></th>'; }).join('') + '</tr>';
    function row2(lab, get, fmt, bestMin) {
      var vals = rows.map(get);
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      return '<tr><td>' + esc(lab) + '</td>' + rows.map(function (r, i) {
        var v = vals[i];
        var cls = mn === mx ? '' : (bestMin ? (v === mn ? ' best' : v === mx ? ' bad' : '') : (v === mx ? ' best' : v === mn ? ' bad' : ''));
        return '<td class="' + cls + '">' + fmt(v, r) + '</td>';
      }).join('') + '</tr>';
    }
    var body =
      row2('Décision', function (r) { return DEC_RANK[r.statut] != null ? DEC_RANK[r.statut] : 9; }, function (v, r) { return esc(decMeta(r.statut).lab); }, false) +
      row2('Note /20', function (r) { return r.note; }, function (v) { return v > 0 ? String(v) : '—'; }, false) +
      row2('Poste', function () { return 0; }, function (v, r) { return esc(r.poste || '—'); }, false) +
      row2('Département', function () { return 0; }, function (v, r) { return esc(r.departement || '—'); }, false) +
      row2('Décideur', function () { return 0; }, function (v, r) { return esc(r.decideur || '—'); }, false) +
      row2('Date de décision', function () { return 0; }, function (v, r) { return esc(jDate(r.dateSelection) || '—'); }, false) +
      row2('Attente', function (r) { return r.age; }, function (v) { return v + ' j'; }, true) +
      row2('Justification', function (r) { return r.justified ? 1 : 0; }, function (v, r) { return r.justified ? '<span class="asl-chip ok">✓ écrite</span>' : '<span class="asl-chip err">⚠ manquante</span>'; }, false) +
      row2('Notification', function (r) { return String(r.notif || '') === 'Envoyée' ? 1 : 0; }, function (v, r) { return notifChip(r); }, false) +
      '<tr><td>Offre liée</td>' + rows.map(function (r) {
        return '<td>' + (r.offre ? esc(r.offre) : '—') + '</td>';
      }).join('') + '</tr>';
    var best = rows.slice().sort(function (a, b) { return b.note - a.note; })[0];
    p.innerHTML = '<div class="asl-panel-head"><h3>Comparateur de décisions — aide à l\u2019arbitrage</h3><button class="asl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asl-panel-body"><div class="asl-cmp-wrap"><table class="asl-cmp"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="asl-cibles-note" style="margin-top:10px">Vert = le plus favorable · Rouge = le moins favorable sur le critère. Meilleure note : <b>' + esc(best.candidat) + '</b> (' + best.note + '/20). La décision finale reste humaine (ISO 30401).</p></div>';
    $('.asl-drawer-x', p).addEventListener('click', closeCompare);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Comparateur ouvert', rows.length + ' décisions');
  }

  /* ================= dossier d'arbitrage & notifications ================= */
  function closeArbitrage() { $$('[data-asl="arbitre"],[data-asl="backdrop"][data-asl-for="arbitre"]').forEach(function (n) { n.remove(); }); }
  function openArbitrage() {
    closeArbitrage();
    var rows = data();
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'arbitre' });
    bd.addEventListener('click', closeArbitrage);
    var p = h('div', { class: 'asl-panel', 'data-asl': 'arbitre', role: 'dialog', 'aria-label': 'Dossier d\u2019arbitrage' });
    var nb = rows.length;
    var nbRet = rows.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var nbRej = rows.filter(function (r) { return r.statut === 'Rejete'; }).length;
    var nbAtt = rows.filter(function (r) { return r.statut === 'En attente'; }).length;
    var nojust = rows.filter(function (r) { return !r.justified; }).length;
    var nonotif = rows.filter(function (r) { return r.statut === 'Retenu' && String(r.notif || '').trim() !== 'Envoyée'; }).length;
    var nooffre = rows.filter(function (r) { return r.statut === 'Retenu' && !r.offre; }).length;
    var att = rows.filter(function (r) { return r.statut === 'En attente'; });
    var ancAtt = att.length ? Math.round(att.reduce(function (s, r) { return s + r.age; }, 0) / att.length) : 0;
    var mx = Math.max.apply(null, DECISIONS.map(function (s) { return rows.filter(function (r) { return r.statut === s.k; }).length; }).concat([1]));
    var bars = DECISIONS.map(function (s) {
      var n = rows.filter(function (r) { return r.statut === s.k; }).length;
      return '<div class="asl-sim-arow"><span style="min-width:150px;color:' + s.c + ';font-weight:700">' + esc(s.lab) + '</span>' +
        '<span class="asl-bar-track"><span class="asl-bar-fill" style="width:' + Math.max(n ? 4 : 0, n / mx * 100) + '%;background:' + s.c + '"></span></span>' +
        '<span><b>' + n + '</b> · ' + pct(nb ? n / nb * 100 : 0) + '</span></div>';
    }).join('');
    var nodec = postesSansDecision(rows);
    var tip = '💡 ';
    if (nonotif) tip += nonotif + ' candidat(s) retenu(s) pas encore notifié(s) — une décision sans notification n\u2019est pas terminée. ';
    if (nojust) tip += nojust + ' décision(s) sans justification écrite — à tracer pour garantir l\u2019équité (ISO 30401). ';
    if (ancAtt > SEUILS.delaiDecision) tip += 'Attente moyenne des arbitrages en cours : ' + ancAtt + ' j (seuil ' + SEUILS.delaiDecision + ' j) — risque de perte des finalistes.';
    else tip += 'Attente moyenne des arbitrages en cours : ' + ancAtt + ' j (seuil ' + SEUILS.delaiDecision + ' j).';
    p.innerHTML = '<div class="asl-panel-head"><h3>Dossier d\u2019arbitrage — décisions & notifications</h3><button class="asl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asl-panel-body">' +
        '<div class="asl-sim-kpis"><span><b>' + nbRet + '</b> retenu(s) (' + pct(nb ? nbRet / nb * 100 : 0) + ')</span>' +
          '<span><b>' + nbRej + '</b> rejeté(s)</span>' +
          '<span><b>' + nbAtt + '</b> en attente</span>' +
          '<span><b>' + (nb ? Math.round((nbRet + nbRej) / nb * 100) : 0) + ' %</b> tranché</span></div>' +
        '<div style="font-size:.72rem;color:var(--asl-text2);margin:8px 0 5px">Répartition des décisions :</div>' +
        '<div class="asl-sim-alloc">' + bars + '</div>' +
        '<div class="asl-sim-kpis" style="margin-top:12px"><span>Justifications écrites <b>' + (nb - nojust) + '/' + nb + '</b></span>' +
          '<span>À notifier <b style="' + (nonotif ? 'color:var(--asl-err)' : '') + '">' + nonotif + '</b></span>' +
          '<span>Sans offre liée <b style="' + (nooffre ? 'color:var(--asl-err)' : '') + '">' + nooffre + '</b></span>' +
          '<span>Postes sans décision ferme <b>' + nodec.length + '</b></span></div>' +
        (nodec.length ? '<div class="asl-sim-tip" style="margin-top:8px">Postes sans sélection ferme : ' + esc(nodec.join(', ')) + '</div>' : '') +
        '<div class="asl-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' +
      '</div>';
    $('.asl-drawer-x', p).addEventListener('click', closeArbitrage);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Dossier d\u2019arbitrage ouvert', '');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-asl="seuils"],[data-asl="backdrop"][data-asl-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'asl-panel', 'data-asl': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="asl-panel-head"><h3>Seuils de pilotage</h3><button class="asl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asl-panel-body">' +
        '<p class="asl-cibles-note">Ces seuils alimentent les alertes, les couleurs et le filtre « finalistes » (Manuel D1 : arbitrage tracé, délais de décision maîtrisés, notification systématique).</p>' +
        '<div class="asl-sim-row"><label for="asl-s1">Attente maximum d\u2019une décision (jours)</label><input type="range" id="asl-s1" min="3" max="30" step="1" value="' + SEUILS.delaiDecision + '"><input class="asl-in" type="number" min="3" max="30" step="1" data-asl="s1n" value="' + SEUILS.delaiDecision + '"></div>' +
        '<div class="asl-sim-row"><label for="asl-s2">Note « finaliste » (/20)</label><input type="range" id="asl-s2" min="10" max="20" step="1" value="' + SEUILS.noteFinaliste + '"><input class="asl-in" type="number" min="0" max="20" step="1" data-asl="s2n" value="' + SEUILS.noteFinaliste + '"></div>' +
        '<div class="asl-sim-row"><label for="asl-s3">Note « faible » (/20)</label><input type="range" id="asl-s3" min="5" max="15" step="1" value="' + SEUILS.noteFaible + '"><input class="asl-in" type="number" min="1" max="15" step="1" data-asl="s3n" value="' + SEUILS.noteFaible + '"></div>' +
        '<div class="asl-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="asl-btn asl-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.asl-drawer-x', p).addEventListener('click', closeSeuils);
    [['asl-s1', 's1n', 'delaiDecision', 3, 30, 1], ['asl-s2', 's2n', 'noteFinaliste', 10, 20, 1], ['asl-s3', 's3n', 'noteFaible', 5, 15, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-asl="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.delaiDecision = Math.max(3, Math.min(30, Number($('[data-asl="s1n"]', p).value) || SEUILS.delaiDecision));
      SEUILS.noteFinaliste = Math.max(10, Math.min(20, Number($('[data-asl="s2n"]', p).value) || SEUILS.noteFinaliste));
      SEUILS.noteFaible = Math.max(5, Math.min(15, Number($('[data-asl="s3n"]', p).value) || SEUILS.noteFaible));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'attente ≤ ' + SEUILS.delaiDecision + ' j · finaliste ≥ ' + SEUILS.noteFinaliste + '/20 · faible < ' + SEUILS.noteFaible + '/20');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-asl="journal"],[data-asl="backdrop"][data-asl-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'asl-backdrop', 'data-asl': 'backdrop', 'data-asl-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'asl-panel', 'data-asl': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="asl-panel-head"><h3>Journal d\u2019activité</h3><button class="asl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="asl-panel-body" data-asl="jlist"></div>';
    $('.asl-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-asl="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="asl-jrow"><span class="asl-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="asl-jact">' + esc(x.action || '') + '</span><span class="asl-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="asl-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Sélection', 'Candidat', 'Poste', 'Département', 'Décision', 'Note /20', 'Justification', 'Décideur', 'Date décision', 'Attente (j)', 'Offre liée', 'Notification'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero || r.id, r.candidat, r.poste, r.departement, decMeta(r.statut).lab, r.note || '', r.notes, r.decideur, jDate(r.dateSelection), r.age, r.offre, String(r.notif || '')];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-selections-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeArbitrage(); closeCompare(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-asl="dialog"]') || $('[data-asl="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { openArbitrage(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { openCompare(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { UI.view = 'cards'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-asl="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle décision · E export · J journal · P arbitrage · C comparer · S seuils · K cartes · T tableau · / recherche', ''); }
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
    var root = $('[data-asl="root"]');
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
    if (!document.querySelector('[data-asl="drawer"],[data-asl="dialog"],[data-asl="confirm"],[data-asl="journal"],[data-asl="arbitre"],[data-asl="compare"],[data-asl="seuils"]')) {
      $$('[data-asl="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-asl');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-asl]') || t.closest('#asl-decsel'))) continue;
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
    html.classList.remove('admina-asl');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeArbitrage(); closeCompare(); closeSeuils();
    UI.cmp = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-asl="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-asl-hide', '1');
      natif.setAttribute('data-asl-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) {
      bootTries++;
      if (bootTries > 30) {
        /* 30 réessais sans page native montable ni API : laisser la page native intacte */
        deactivate();
        return;
      }
      refresh();
    } else {
      bootTries = 0;
    }
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

  window.__ADMINA_SEL_UI__ = {
    version: '1.0-w1',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    exportCSV: exportCSV,
    openArbitrage: openArbitrage,
    openCompare: openCompare,
    openJournal: openJournal,
    openSeuils: openSeuils
  };
  try { console.info('[ADMINA_SEL] W1-d actif — Centre de pilotage Sélections /selections'); } catch (e) {}
})();
