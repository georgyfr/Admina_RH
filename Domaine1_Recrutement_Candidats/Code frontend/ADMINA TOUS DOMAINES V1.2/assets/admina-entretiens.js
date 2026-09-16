/* =============================================================
   Admina-RH — Planning des Entretiens — couche admina (W1-a)
   M-W1 : CENTRE DE PILOTAGE — Planning des Entretiens
   PHILOSOPHIE :
   Planning Entretiens = l'agenda du recrutement : planifier,
   préparer, mener, conclure. La page donne une vue claire de qui
   voit qui, quand et où, repère à l'avance les trous et les
   collisions du calendrier (évaluateur manquant, créneau en
   conflit, entretien dépassé non tenu) et pousse chaque entretien
   jusqu'à sa conclusion (feedback, score, prochaine étape). Trois
   prismes complémentaires — vue planning hebdomadaire (signature),
   tableau analytique, cartes — restent au service d'un seul objet :
   l'entretien lui-même. Règle d'or : un agenda vivant et
   actionnable, jamais un tableur ni un pipeline.
   - Scope strict : /planning-entretiens (RE_PAGE réévaluée à chaque navigation SPA)
   - Idempotent (data-aen / data-aen-hide), sans collision (__ADMINA_ENTRE_W1__)
   - Données : window.__ADMINA_ENTRE_API__ (patch chunk) → fallback localStorage
     admina-entretiens-data · 30 réessais au démarrage, sinon page native intacte
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_ENTRE_W1__) return;
  window.__ADMINA_ENTRE_W1__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/planning-entretiens\/?$/;
  var LS_DATA = 'admina-entretiens-data';
  var LS_UI = 'admina-entretiens-ui';
  var LS_J = 'admina_journal';

  var UI = { q: '', st: '', ty: '', res: '', pd: '', ev: '', kpi: '', filt: '', view: 'table', sortKey: 'date', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, delId: null, sel: [], week: 0, charts: true };

  /* ================= référentiels ================= */
  var STATUTS = [
    { k: 'Planifie', lab: 'Planifié', c: '#0e7490' },
    { k: 'Reporte', lab: 'Reporté', c: '#d97706' },
    { k: 'Realise', lab: 'Réalisé', c: '#059669' },
    { k: 'Annule', lab: 'Annulé', c: '#dc2626' }
  ];
  function stMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  var RESULTATS = [
    { k: 'Favorable', lab: 'Favorable', c: '#059669' },
    { k: 'Defavorable', lab: 'Défavorable', c: '#dc2626' },
    { k: 'A revoir', lab: 'À revoir', c: '#d97706' },
    { k: 'En attente', lab: 'En attente', c: '#64748b' }
  ];
  function resMeta(k) { for (var i = 0; i < RESULTATS.length; i++) { if (RESULTATS[i].k === k) return RESULTATS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  var TYPES = [
    { k: 'Telephonique', lab: 'Téléphonique' },
    { k: 'Visioconference', lab: 'Visioconférence' },
    { k: 'Presentiel', lab: 'Présentiel' },
    { k: 'Technique', lab: 'Technique' },
    { k: '2eme tour', lab: '2ème tour' },
    { k: 'Final', lab: 'Final' }
  ];
  function typeLab(k) { for (var i = 0; i < TYPES.length; i++) { if (TYPES[i].k === k) return TYPES[i].lab; } return k || '—'; }
  var DUREES = ['15min', '30min', '45min', '1h', '1h30', '2h', '2h30', '3h'];
  var JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
  function pad2(n) { return String(n).length < 2 ? '0' + n : String(n); }
  function tsDH(s) {
    var v = String(s || '').trim();
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T,]+(\d{1,2}):(\d{2}))?/.exec(v);
    if (m) return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0));
    var m2 = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ]+(\d{1,2}):(\d{2}))?/.exec(v);
    if (m2) return Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]), Number(m2[4] || 0), Number(m2[5] || 0));
    return 0;
  }
  function startOfDay(ts) { return ts - (ts % 86400000); }
  function startOfToday() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function heureOf(s) { var m = /(\d{1,2}:\d{2})/.exec(String(s || '')); return m ? m[1] : ''; }
  function dureeMin(s) {
    var v = String(s || '').trim();
    var m = /^(\d+)\s*h(?:(\d+))?/.exec(v);
    if (m) return Number(m[1]) * 60 + Number(m[2] || 0);
    m = /^(\d+)\s*min/.exec(v);
    if (m) return Number(m[1]);
    return 0;
  }
  function validDate(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (!m) return null;
    var d = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
    if (d.getUTCDate() !== Number(m[1]) || d.getUTCMonth() !== Number(m[2]) - 1) return null;
    return pad2(Number(m[1])) + '/' + pad2(Number(m[2])) + '/' + m[3];
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
  function toastsZone() { var z = $('[data-aen="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-aen', 'toasts'); z.className = 'aen-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'aen-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_ENTRE_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.entretiens && Array.isArray(d.entretiens) && d.entretiens.length) return true;
    return false;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.entretiens) { d = readLS(); }
    if (!d || !d.entretiens || !d.entretiens.length) return [];
    return d.entretiens.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = String(u.id);
      u.score = (u.score === null || u.score === undefined || u.score === '') ? null : Number(u.score);
      u.ts = tsDH(u.dateHeure);
      u.stm = stMeta(u.statut);
      u.rm = resMeta(u.resultat);
      u.evals = String(u.evaluateurs || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextIdNumero(rows) {
    var mx = 0, yr = null;
    rows.forEach(function (r) {
      var nid = Number(r.id); if (isFinite(nid)) mx = Math.max(mx, nid);
      var m = /^ENT-(\d{4})-(\d+)$/.exec(String(r.numero || ''));
      if (m) { yr = m[1]; mx = Math.max(mx, Number(m[2])); }
    });
    mx = mx + 1;
    if (!yr) yr = String(new Date().getFullYear());
    return { id: mx, numero: 'ENT-' + yr + '-' + String(mx).padStart(3, '0') };
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.entretiens) { toast('Écriture impossible — recharger la page', 'err'); return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct (résilience) */
    var cur2 = readLS();
    if (cur2 && cur2.entretiens) {
      var nv2 = fn(cur2);
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { return false; }
      if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
      refresh();
      return true;
    }
    toast('Écriture impossible — API indisponible', 'err');
    return false;
  }

  /* ================= conflits & finalistes ================= */
  function conflictMap(rows) {
    var res = {};
    var groups = {};
    rows.forEach(function (r) {
      if (r.statut !== 'Planifie' || !r.ts) return;
      var k1 = 'L|' + r.ts + '|' + norm(r.lieu);
      (groups[k1] = groups[k1] || []).push(r);
      r.evals.forEach(function (ev) {
        var k2 = 'E|' + r.ts + '|' + norm(ev);
        (groups[k2] = groups[k2] || []).push(r);
      });
    });
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      if (g.length < 2) return;
      g.forEach(function (r) {
        var others = g.filter(function (x) { return x.id !== r.id; }).map(function (x) { return x.numero || ('#' + x.id); });
        res[r.id] = (res[r.id] || []).concat(others);
      });
    });
    Object.keys(res).forEach(function (k) {
      var seen = {};
      res[k] = res[k].filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; });
    });
    return res;
  }
  function finalistMap(rows) {
    var byC = {};
    rows.forEach(function (r) {
      var k = norm(r.candidat);
      if (!k) return;
      var b = byC[k] = byC[k] || { name: r.candidat, fav: false, plan: false };
      if (r.resultat === 'Favorable') b.fav = true;
      if (r.statut === 'Planifie') b.plan = true;
    });
    var out = {};
    Object.keys(byC).forEach(function (k) { if (byC[k].fav && !byC[k].plan) out[k] = byC[k]; });
    return out;
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var today = startOfToday();
    var noEval = rows.filter(function (r) { return r.statut === 'Planifie' && r.evals.length === 0; });
    if (noEval.length) out.push({ tone: 'err', txt: noEval.length + ' entretien' + (noEval.length > 1 ? 's' : '') + ' planifié' + (noEval.length > 1 ? 's' : '') + ' sans évaluateur — à assigner avant la date (' + noEval.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'noeval' });
    var past = rows.filter(function (r) { return r.statut === 'Planifie' && r.ts && r.ts < today; });
    if (past.length) out.push({ tone: 'warn', txt: past.length + ' entretien' + (past.length > 1 ? 's' : '') + ' à une date passée non tenu' + (past.length > 1 ? 's' : '') + ' — à réaliser, reporter ou annuler (' + past.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'past' });
    var noFb = rows.filter(function (r) { return r.statut === 'Realise' && (r.score == null || !r.resultat || r.resultat === 'En attente'); });
    if (noFb.length) out.push({ tone: 'info', txt: noFb.length + ' entretien' + (noFb.length > 1 ? 's' : '') + ' réalisé' + (noFb.length > 1 ? 's' : '') + ' sans feedback complet — score / décision à consigner (' + noFb.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'nofeedback' });
    var confl = conflictMap(rows);
    var confIds = Object.keys(confl);
    if (confIds.length) out.push({ tone: 'warn', txt: confIds.length + ' conflit' + (confIds.length > 1 ? 's' : '') + ' de créneau — même horaire avec un lieu ou un évaluateur en commun (' + confIds.slice(0, 3).map(function (id) { return numeroOf(rows, id); }).join(', ') + ')', f: 'conflict' });
    var fin = finalistMap(rows);
    var finNames = Object.keys(fin);
    if (finNames.length) out.push({ tone: 'ok', txt: finNames.length + ' candidat' + (finNames.length > 1 ? 's' : '') + ' avec un avis favorable sans entretien planifié — planifier la suite (' + finNames.slice(0, 2).map(function (k) { return fin[k].name; }).join(', ') + ')', f: 'next' });
    return out.slice(0, 5);
  }
  function numeroOf(rows, id) {
    for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i].numero || ('#' + id); }
    return '#' + id;
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var today = startOfToday();
    var confl = conflictMap(rows);
    var fin = finalistMap(rows);
    var out = rows.filter(function (r) {
      if (UI.st && r.statut !== UI.st) return false;
      if (UI.ty && r.type !== UI.ty) return false;
      if (UI.res && r.resultat !== UI.res) return false;
      if (UI.ev && r.evals.every(function (e) { return norm(e) !== norm(UI.ev); })) return false;
      if (UI.pd === 'up' && !(r.ts && r.ts >= today)) return false;
      if (UI.pd === 'past' && !(r.ts && r.ts < today)) return false;
      if (UI.pd === 'w' && !(r.ts && r.ts >= today && r.ts < today + 7 * 86400000)) return false;
      if (UI.pd === 'today' && !(r.ts && startOfDay(r.ts) === today)) return false;
      if (UI.kpi === 'plan' && r.statut !== 'Planifie') return false;
      if (UI.kpi === 'week' && !(r.statut === 'Planifie' && r.ts >= today && r.ts < today + 7 * 86400000)) return false;
      if (UI.kpi === 'real' && r.statut !== 'Realise') return false;
      if (UI.kpi === 'fav' && !(r.statut === 'Realise' && r.resultat === 'Favorable')) return false;
      if (UI.filt === 'noeval' && !(r.statut === 'Planifie' && r.evals.length === 0)) return false;
      if (UI.filt === 'past' && !(r.statut === 'Planifie' && r.ts && r.ts < today)) return false;
      if (UI.filt === 'nofeedback' && !(r.statut === 'Realise' && (r.score == null || !r.resultat || r.resultat === 'En attente'))) return false;
      if (UI.filt === 'conflict' && !confl[r.id]) return false;
      if (UI.filt === 'next' && !fin[norm(r.candidat)]) return false;
      if (q && !(norm(r.numero).indexOf(q) > -1 || norm(r.candidat).indexOf(q) > -1 || norm(r.type).indexOf(q) > -1 || norm(typeLab(r.type)).indexOf(q) > -1 || norm(r.lieu).indexOf(q) > -1 || norm(r.evaluateurs).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1 || norm(r.posteVise).indexOf(q) > -1 || norm(r.prochaineEtape).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'date') { va = a.ts; vb = b.ts; }
      else if (k === 'score') { va = a.score == null ? -1 : a.score; vb = b.score == null ? -1 : b.score; }
      else if (k === 'dur') { va = dureeMin(a.duree); vb = dureeMin(b.duree); }
      else if (k === 'st') { va = stIdx(a.statut); vb = stIdx(b.statut); }
      else if (k === 'res') { va = resIdx(a.resultat); vb = resIdx(b.resultat); }
      else if (k === 'type') { va = norm(typeLab(a.type)); vb = norm(typeLab(b.type)); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return (a.ts || 0) - (b.ts || 0);
    });
    return out;
  }
  function stIdx(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return i; } return 99; }
  function resIdx(k) { for (var i = 0; i < RESULTATS.length; i++) { if (RESULTATS[i].k === k) return i; } return 99; }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.st ? 1 : 0) + (UI.ty ? 1 : 0) + (UI.res ? 1 : 0) + (UI.pd ? 1 : 0) + (UI.ev ? 1 : 0) + (UI.kpi ? 1 : 0) + (UI.filt ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.st = ''; UI.ty = ''; UI.res = ''; UI.pd = ''; UI.ev = ''; UI.kpi = ''; UI.filt = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Planification\s+des\s+Entretiens/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-aen="root"]');
    if (!root) {
      root = h('section', { 'data-aen': 'root', class: 'aen-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-aen-page')) {
      page.setAttribute('data-aen-page', '1');
      page.setAttribute('data-aen-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-aen-hide')) {
      natif.setAttribute('data-aen-hide', '1');
      natif.setAttribute('data-aen-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-aen="root"]'); if (root) root.remove();
    $$('[data-aen-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-aen-oldw') || '';
      n.removeAttribute('data-aen-page');
      n.removeAttribute('data-aen-oldw');
    });
    $$('[data-aen-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-aen-olddisp') || '';
      n.removeAttribute('data-aen-hide');
      n.removeAttribute('data-aen-olddisp');
    });
    $$('[data-aen]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-aen="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'aen-btn aen-btn-primary aen-backbtn', 'data-aen': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'planning-entretiens');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/><path d="M8 15h3"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    week: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 5v5M13 5v5M18 5v5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  var CAL_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/><path d="M8 15h3M13 15h3"/></svg>';

  function buildShell() {
    var root = $('[data-aen="root"]');
    if (!root || $('[data-aen="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="aen-hero" data-aen="hero">' +
        '<div class="aen-hero-main">' +
          '<div class="aen-hero-title">' +
            '<span class="aen-hero-ico" aria-hidden="true">' + CAL_ICON + '</span>' +
            '<div><h2 class="aen-h2">Centre de pilotage — Planning des Entretiens</h2>' +
            '<p class="aen-hero-sub" data-aen="herosub"></p></div>' +
          '</div>' +
          '<div class="aen-hero-actions">' +
            '<button class="aen-btn" data-aen="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="aen-btn" data-aen="btn-planning" title="Vue planning (P)">' + ICO.cal + 'Planning</button>' +
            '<button class="aen-btn" data-aen="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="aen-btn aen-btn-primary" data-aen="btn-new" title="Nouvel entretien (N)">' + ICO.plus + 'Nouvel entretien</button>' +
          '</div>' +
        '</div>' +
        '<div class="aen-hero-alerts" data-aen="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="aen-kpis" data-aen="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="aen-charts" data-aen="charts">' +
        '<div class="aen-chart-card"><div class="aen-chart-title">Entretiens par statut</div><div class="aen-donut-wrap" data-aen="donut"></div></div>' +
        '<div class="aen-chart-card"><div class="aen-chart-title">Entretiens par type</div><div data-aen="bars-ty"></div></div>' +
        '<div class="aen-chart-card"><div class="aen-chart-title">Charge par évaluateur</div><div data-aen="bars-ev"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="aen-toolbar" data-aen="toolbar">' +
        '<div class="aen-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (candidat, lieu, évaluateur, notes…)" data-aen="search" aria-label="Rechercher un entretien" /></div>' +
        '<select data-aen="f-st" class="aen-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-aen="f-ty" class="aen-sel" aria-label="Filtrer par type d\u2019entretien"></select>' +
        '<select data-aen="f-res" class="aen-sel" aria-label="Filtrer par résultat"></select>' +
        '<select data-aen="f-per" class="aen-sel" aria-label="Filtrer par période"></select>' +
        '<select data-aen="f-ev" class="aen-sel" aria-label="Filtrer par évaluateur"></select>' +
        '<button class="aen-chipbtn" data-aen="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="aen-count" data-aen="count"></span>' +
        '<div class="aen-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="aen-vbtn" data-aen="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="aen-vbtn" data-aen="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
          '<button class="aen-vbtn" data-aen="v-planning" title="Vue planning semaine (P)">' + ICO.week + 'Planning</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-aen="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-aen="selbar"></div>' +

      /* PIED */
      '<div class="aen-foot">Agenda du recrutement (source de vérité locale) — planifier · préparer · mener · conclure · journal d\u2019audit actif · <button class="aen-link" data-aen="btn-native">Afficher le tableau natif</button></div>';

    $('[data-aen="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-aen="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-aen="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-aen="btn-planning"]', root).addEventListener('click', function () { UI.view = 'planning'; saveUI(); refresh(); });
    $('[data-aen="btn-native"]', root).addEventListener('click', showNative);
    $('[data-aen="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-aen="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-aen="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-aen="f-st"]', root).addEventListener('change', function (e) { UI.st = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aen="f-ty"]', root).addEventListener('change', function (e) { UI.ty = e.target.value; UI.page = 0; refresh(); });
    $('[data-aen="f-res"]', root).addEventListener('change', function (e) { UI.res = e.target.value; UI.page = 0; refresh(); });
    $('[data-aen="f-per"]', root).addEventListener('change', function (e) { UI.pd = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aen="f-ev"]', root).addEventListener('change', function (e) { UI.ev = e.target.value; UI.page = 0; refresh(); });
    $('[data-aen="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-aen="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
    $('[data-aen="v-planning"]', root).addEventListener('click', function () { UI.view = 'planning'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var today = startOfToday();
    var plan = rows.filter(function (r) { return r.statut === 'Planifie'; }).length;
    var sem = rows.filter(function (r) { return r.statut === 'Planifie' && r.ts >= today && r.ts < today + 7 * 86400000; }).length;
    var real = rows.filter(function (r) { return r.statut === 'Realise'; }).length;
    var fav = rows.filter(function (r) { return r.statut === 'Realise' && r.resultat === 'Favorable'; }).length;
    var evals = rows.filter(function (r) { return r.score != null; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length : 0;
    var sub = rows.length + ' entretien' + (rows.length > 1 ? 's' : '') +
      ' · ' + plan + ' planifié' + (plan > 1 ? 's' : '') + ' (dont ' + sem + ' cette semaine)' +
      ' · ' + real + ' réalisé' + (real > 1 ? 's' : '') +
      ' · taux favorable ' + pct(real ? fav / real * 100 : 0) +
      ' · score moyen ' + (evals.length ? moy.toFixed(1) : '—') + '/20';
    $('[data-aen="herosub"]').textContent = sub;
    var zone = $('[data-aen="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="aen-alert ' + a.tone + '" data-aen="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.aen-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        UI.filt = f;
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var today = startOfToday();
    var plan = rows.filter(function (r) { return r.statut === 'Planifie'; }).length;
    var sem = rows.filter(function (r) { return r.statut === 'Planifie' && r.ts >= today && r.ts < today + 7 * 86400000; }).length;
    var real = rows.filter(function (r) { return r.statut === 'Realise'; }).length;
    var fav = rows.filter(function (r) { return r.statut === 'Realise' && r.resultat === 'Favorable'; }).length;
    var evals = rows.filter(function (r) { return r.score != null; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length : 0;
    var cands = {}; rows.forEach(function (r) { if (r.candidat) cands[r.candidat] = 1; });
    var kpis = [
      { k: '', t: 'ENTRETIENS', v: String(rows.length), s: Object.keys(cands).length + ' candidat(s) · ' + TYPES.filter(function (t) { return rows.some(function (r) { return r.type === t.k; }); }).length + ' type(s)', cls: '' },
      { k: 'plan', t: 'PLANIFIÉS', v: String(plan), s: 'à venir & en attente', cls: '' },
      { k: 'week', t: 'CETTE SEMAINE', v: String(sem), s: '7 prochains jours', cls: sem === 0 ? 'bad' : '' },
      { k: 'real', t: 'RÉALISÉS', v: String(real), s: 'tenus à ce jour', cls: '' },
      { k: 'fav', t: 'FAVORABLES', v: String(fav), s: 'taux ' + pct(real ? fav / real * 100 : 0), cls: '' },
      { k: '', t: 'SCORE MOYEN', v: (evals.length ? moy.toFixed(1) : '—') + '/20', s: 'sur ' + evals.length + ' évalué' + (evals.length > 1 ? 's' : ''), cls: '' }
    ];
    var zone = $('[data-aen="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="aen-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="aen-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="aen-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="aen-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.aen-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.st = ''; UI.ty = ''; UI.res = ''; UI.pd = ''; UI.ev = ''; UI.filt = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Entretiens par statut">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">' + esc(label) + '</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-aen="donut"]');
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length, 'entretiens') +
      '<div class="aen-donut-legend">' + parts.map(function (p) {
        return '<span class="aen-dl-item' + (UI.st === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="aen-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="aen-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.aen-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.st = UI.st === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barsSvg(items, maxW) {
    var rowH = 26, W = maxW || 430, L = 150, R = 36;
    if (!items.length) return '<div class="aen-empty">Aucune donnée</div>';
    var mx = 1;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    var H = items.length * rowH + 6;
    var bars = items.map(function (it, i) {
      var y = i * rowH + 5;
      var w = Math.max(2, (it.v / mx) * (W - L - R - 14));
      return '<g class="aen-barg" data-key="' + esc(it.key) + '" role="button" tabindex="0"><title>' + esc(it.name + ' : ' + it.v) + '</title>' +
        '<text x="' + (L - 8) + '" y="' + (y + 13) + '" text-anchor="end" class="aen-svg-lab">' + esc(it.name.length > 24 ? it.name.slice(0, 23) + '…' : it.name) + '</text>' +
        '<rect x="' + L + '" y="' + y + '" width="' + (W - L - R) + '" height="17" rx="4" class="aen-svg-track"/>' +
        '<rect x="' + L + '" y="' + y + '" width="' + w + '" height="17" rx="4" class="aen-svg-fill"/>' +
        '<text x="' + (L + w + 6) + '" y="' + (y + 13) + '" class="aen-svg-val">' + it.v + '</text></g>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Répartition">' + bars + '</svg>';
  }

  function renderBars() {
    var rows = data();
    var z1 = $('[data-aen="bars-ty"]');
    var items1 = TYPES.map(function (t) {
      return { key: t.k, name: t.lab, v: rows.filter(function (r) { return r.type === t.k; }).length };
    }).filter(function (x) { return x.v > 0; }).sort(function (a, b) { return b.v - a.v; });
    z1.innerHTML = barsSvg(items1);
    $$('.aen-barg', z1).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.ty = UI.ty === k ? '' : k;
        UI.page = 0;
        refresh();
      });
    });
    var z2 = $('[data-aen="bars-ev"]');
    var map2 = {};
    rows.forEach(function (r) { r.evals.forEach(function (e) { if (!map2[norm(e)]) map2[norm(e)] = { key: e, name: e, v: 0 }; map2[norm(e)].v++; }); });
    var items2 = Object.keys(map2).map(function (k) { return map2[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    z2.innerHTML = barsSvg(items2);
    $$('.aen-barg', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.ev = UI.ev === k ? '' : k;
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var evs = {};
    rows.forEach(function (r) { r.evals.forEach(function (e) { if (e) evs[norm(e)] = e; }); });
    var sel = $('[data-aen="f-st"]');
    sel.innerHTML = '<option value="">Statut : tous</option>' + STATUTS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.st === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-aen="f-ty"]');
    sel2.innerHTML = '<option value="">Type : tous</option>' + TYPES.map(function (t) {
      return '<option value="' + esc(t.k) + '"' + (UI.ty === t.k ? ' selected' : '') + '>' + esc(t.lab) + '</option>';
    }).join('');
    var sel3 = $('[data-aen="f-res"]');
    sel3.innerHTML = '<option value="">Résultat : tous</option>' + RESULTATS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.res === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel4 = $('[data-aen="f-per"]');
    sel4.innerHTML = '<option value="">Période : toutes</option>' +
      '<option value="up"' + (UI.pd === 'up' ? ' selected' : '') + '>À venir</option>' +
      '<option value="w"' + (UI.pd === 'w' ? ' selected' : '') + '>7 prochains jours</option>' +
      '<option value="today"' + (UI.pd === 'today' ? ' selected' : '') + '>Aujourd\u2019hui</option>' +
      '<option value="past"' + (UI.pd === 'past' ? ' selected' : '') + '>Passés</option>';
    var sel5 = $('[data-aen="f-ev"]');
    sel5.innerHTML = '<option value="">Évaluateur : tous</option>' + Object.keys(evs).sort().map(function (k) {
      return '<option value="' + esc(evs[k]) + '"' + (norm(UI.ev) === k ? ' selected' : '') + '>' + esc(evs[k]) + '</option>';
    }).join('');
    $('[data-aen="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-aen="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' entretiens';
  }

  function statutChip(r) {
    var sm = r.stm || stMeta(r.statut);
    return '<span class="aen-chip" style="background:' + sm.c + '18;border:1px solid ' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function resChip(r) {
    var rm = r.rm || resMeta(r.resultat);
    return '<span class="aen-chip" style="background:' + rm.c + '18;border:1px solid ' + rm.c + '66;color:' + rm.c + '" title="' + esc(rm.lab) + '">' + esc(rm.lab) + '</span>';
  }
  function typeChip(r) {
    return '<span class="aen-chip neutral" title="Type d\u2019entretien">' + esc(typeLab(r.type)) + '</span>';
  }
  function scoreCell(r) {
    if (r.score == null) return '<span class="aen-score zero" title="Non évalué">—</span>';
    var cls = r.score >= 15 ? ' hi' : ' mid';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="aen-score' + cls + '">' + r.score + '</span>' +
      '<span class="aen-scorebar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(r.score / 20 * 100)) + '%"></i></span></span>';
  }
  function confChip(r, confl) {
    if (!confl || !confl[r.id]) return '';
    return '<span class="aen-chip cfl" title="Conflit de créneau avec ' + esc(confl[r.id].join(', ')) + '">⚠ conflit</span>';
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var confl = conflictMap(all);
    var plan = all.filter(function (r) { return r.statut === 'Planifie'; }).length;
    var real = all.filter(function (r) { return r.statut === 'Realise'; }).length;
    var fav = all.filter(function (r) { return r.statut === 'Realise' && r.resultat === 'Favorable'; }).length;
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var as = key && key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : null;
      return '<th' + (key ? ' data-sort="' + key + '"' + (as ? ' aria-sort="' + as + '"' : '') : '') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="aen-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'aen-th-chk') + th('N°', 'numero') + th('Candidat', 'cand') + th('Poste visé', 'poste') +
      th('Type', 'type') + th('Date & heure', 'date') + th('Durée', 'dur') + th('Lieu/Lien', 'lieu') + th('Évaluateur(s)', 'eval') +
      th('Statut', 'st') + th('Résultat', 'res') + th('Score', 'score', 'aen-right') + th('Prochaine étape', 'next') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="aen-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.numero) + '"></td>' +
        '<td class="aen-num">' + esc(r.numero || '') + '</td>' +
        '<td><span class="aen-cand" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.posteVise || '—') + '</td>' +
        '<td>' + typeChip(r) + '</td>' +
        '<td class="aen-num">' + esc(r.dateHeure || '—') + (r.ts ? ' <span class="aen-num">(' + esc(new Date(r.ts).toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' })) + '.)</span>' : '') + ' ' + confChip(r, confl) + '</td>' +
        '<td>' + esc(r.duree || '—') + '</td>' +
        '<td>' + esc(r.lieu || '—') + '</td>' +
        '<td style="max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(r.evaluateurs || '') + '">' + esc(r.evaluateurs || '⚠ aucun') + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td>' + resChip(r) + '</td>' +
        '<td class="aen-right">' + scoreCell(r) + '</td>' +
        '<td>' + esc(r.prochaineEtape || '—') + (r.dateProchaineEtape ? ' <span class="aen-num">(' + esc(r.dateProchaineEtape) + ')</span>' : '') + '</td>' +
        '<td><div class="aen-actions">' +
          '<button class="aen-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aen-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aen-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aen-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="aen-tfoot"><td></td><td colspan="13">TOTAL ' + all.length + ' entretiens · ' + plan + ' planifié(s) · ' + real + ' réalisé(s) · taux favorable ' + pct(real ? fav / real * 100 : 0) + '</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="aen-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="aen-sel" data-aen="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="aen-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="aen-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-aen="content"]');
    card.innerHTML = '<div class="aen-tblcard"><div class="aen-tblwrap"><table class="aen-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="14"><div class="aen-empty">Aucun entretien ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'cand' || k === 'numero' || k === 'poste' || k === 'lieu' ? 1 : (k === 'date' ? 1 : -1); }
        refresh();
      });
    });
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.sel.indexOf(id);
        if (c.checked && i < 0) UI.sel.push(id);
        if (!c.checked && i > -1) UI.sel.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit'), null); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-aen="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var confl = conflictMap(data());
    var card = $('[data-aen="content"]');
    card.innerHTML = rows.length ? '<div class="aen-cards">' + rows.map(function (r) {
      return '<div class="aen-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="aen-card-top"><div><input type="checkbox" class="aen-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="aen-num">' + esc(r.numero || '') + '</span></div>' +
        statutChip(r) + '</div>' +
        '<div class="aen-card-name" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</div>' +
        '<div class="aen-card-when">' + esc(r.dateHeure || '—') + (r.ts ? ' <span class="aen-num">(' + esc(new Date(r.ts).toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'UTC' })) + ')</span>' : '') + '</div>' +
        '<div class="aen-card-meta">' + typeChip(r) + resChip(r) + confChip(r, confl) +
        (r.posteVise ? '<span class="aen-chip info">' + esc(r.posteVise) + '</span>' : '') + '</div>' +
        '<div class="aen-card-struct"><span style="font-size:.76rem;color:var(--aen-text2)">' + esc(r.lieu || '—') + ' · ' + esc(r.duree || '—') + ' · ' + esc(r.evaluateurs || '⚠ aucun évaluateur') + '</span>' +
        '<span>' + scoreCell(r) + '</span></div>' +
        '<div class="aen-card-foot"><span class="aen-num">' + esc(r.prochaineEtape ? '→ ' + r.prochaineEtape : '—') + '</span>' +
        '<div class="aen-card-act">' +
          '<button class="aen-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aen-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aen-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aen-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="aen-empty">Aucun entretien ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.sel.indexOf(id);
        if (c.checked && i < 0) UI.sel.push(id);
        if (!c.checked && i > -1) UI.sel.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit'), null); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= VUE PLANNING (signature) ================= */
  function renderPlanning() {
    var card = $('[data-aen="content"]');
    var rows = filtered();
    var all = data();
    var confl = conflictMap(all);
    var today = startOfToday();
    if (!UI.week) UI.week = today;
    var d = new Date(UI.week);
    var dow = (d.getUTCDay() + 6) % 7;
    var monday = startOfDay(UI.week) - dow * 86400000;
    var days = [];
    for (var i = 0; i < 7; i++) days.push(monday + i * 86400000);
    var lbl1 = new Date(monday).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    var lbl2 = new Date(monday + 6 * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    var nbWeek = rows.filter(function (r) { return r.ts >= monday && r.ts < monday + 7 * 86400000; }).length;
    var cols = days.map(function (ts, idx) {
      var dt = new Date(ts);
      var isToday = ts === today;
      var inRows = rows.filter(function (r) { return r.ts >= ts && r.ts < ts + 86400000; }).sort(function (a, b) { return a.ts - b.ts; });
      var slots = inRows.map(function (r) {
        var stm = r.stm;
        var late = r.statut === 'Planifie' && r.ts < today;
        var off = r.statut === 'Annule';
        return '<div class="aen-slot' + (off ? ' off' : '') + (late ? ' late' : '') + '" style="border-left-color:' + stm.c + '" data-open="' + esc(r.id) + '" title="' + esc(r.candidat + ' — ' + r.dateHeure + ' — ' + stm.lab) + '" role="button" tabindex="0">' +
          '<div class="aen-slot-top"><span class="aen-slot-time">' + esc(heureOf(r.dateHeure) || '—') + '</span><span class="aen-slot-dur">' + esc(r.duree || '') + '</span></div>' +
          '<div class="aen-slot-name">' + esc(r.candidat || '—') + '</div>' +
          '<div class="aen-slot-meta">' + esc(typeLab(r.type)) + (confl[r.id] ? ' · <b class="aen-cfl">⚠ conflit</b>' : '') + '</div>' +
          '<div class="aen-slot-loc">' + esc(r.lieu || '—') + '</div>' +
        '</div>';
      }).join('');
      var dateStr = pad2(dt.getUTCDate()) + '/' + pad2(dt.getUTCMonth() + 1) + '/' + dt.getUTCFullYear();
      return '<div class="aen-day' + (isToday ? ' today' : '') + '">' +
        '<button class="aen-day-h" data-day="' + esc(dateStr) + '" title="Planifier un entretien le ' + esc(dateStr) + '">' + JOURS[idx] + ' <b>' + dt.getUTCDate() + '</b><span class="aen-day-n">' + (inRows.length || '') + '</span></button>' +
        '<div class="aen-day-b">' + (slots || '<div class="aen-day-none">libre</div>') + '</div></div>';
    }).join('');
    card.innerHTML = '<div class="aen-tblcard" style="overflow:visible">' +
      '<div class="aen-weekbar">' +
        '<div class="aen-weeknav">' +
          '<button class="aen-pgbtn" data-wk="-7" aria-label="Semaine précédente">‹</button>' +
          '<button class="aen-chipbtn" data-wk="0">Cette semaine</button>' +
          '<button class="aen-pgbtn" data-wk="7" aria-label="Semaine suivante">›</button>' +
          '<span class="aen-week-lbl">Semaine du ' + esc(lbl1) + ' au ' + esc(lbl2) + '</span>' +
        '</div>' +
        '<span class="aen-week-info">' + nbWeek + ' entretien(s) sur la semaine · cliquez un entretien pour l\u2019ouvrir · cliquez un jour pour planifier</span>' +
      '</div>' +
      '<div class="aen-weekwrap"><div class="aen-week">' + cols + '</div></div></div>';
    $$('[data-wk]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var n = Number(b.getAttribute('data-wk'));
        UI.week = n === 0 ? startOfToday() : monday + n * 7 * 86400000;
        refresh();
      });
    });
    $$('[data-day]', card).forEach(function (b) {
      b.addEventListener('click', function () { openDialog(null, b.getAttribute('data-day')); });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
  }

  function renderSelBar() {
    var zone = $('[data-aen="selbar"]');
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    zone.innerHTML = '<div class="aen-selbar">' +
      '<span class="aen-selbar-info">' + UI.sel.length + ' sélectionné' + (UI.sel.length > 1 ? 's' : '') + '</span>' +
      '<button class="aen-btn aen-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="aen-btn aen-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="aen-btn aen-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer détail ================= */
  function closeDrawer() { $$('[data-aen="drawer"],[data-aen="backdrop"][data-aen-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'aen-backdrop', 'data-aen': 'backdrop', 'data-aen-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var stm = r.stm, rm = r.rm;
    var confl = conflictMap(data())[r.id];
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var evalsChips = r.evals.length
      ? r.evals.map(function (e) { return '<span class="aen-chip neutral">' + esc(e) + '</span>'; }).join(' ')
      : '<span class="aen-chip err">⚠ aucun évaluateur assigné</span>';
    var fbBlock = r.statut === 'Realise'
      ? '<div class="aen-fbrow">' +
          '<label class="aen-lab">Résultat<select class="aen-in" data-aen="resqsel">' + RESULTATS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.resultat ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></label>' +
          '<label class="aen-lab">Score /20<input class="aen-in" type="number" min="0" max="20" step="0.5" data-aen="fb-score" value="' + (r.score == null ? '' : esc(r.score)) + '" placeholder="—"></label>' +
          '<button class="aen-btn aen-btn-ghost" data-act="fb" style="color:var(--aen-text);border-color:var(--aen-line)">Enregistrer le feedback</button>' +
        '</div>'
      : '<p style="font-size:.76rem;color:var(--aen-text2);margin:4px 0">Le feedback (résultat + score) se consigne une fois l\u2019entretien passé — passez le statut à « Réalisé ».</p>';
    var dr = h('aside', { class: 'aen-drawer', 'data-aen': 'drawer', role: 'dialog', 'aria-label': 'Fiche entretien ' + r.numero });
    dr.innerHTML =
      '<div class="aen-drawer-head"><div><div class="aen-drawer-title">' + esc(r.candidat || '—') + '</div>' +
      '<div class="aen-drawer-sub">' + esc(r.numero || '') + ' · ' + esc(typeLab(r.type)) + ' · ' + esc(r.posteVise || '—') + '</div></div>' +
      '<button class="aen-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aen-drawer-body">' +
        '<div class="aen-live" style="margin-top:0"><span>Statut <b style="color:' + stm.c + '">' + esc(stm.lab) + '</b></span>' +
          '<span>Résultat <b>' + esc(rm.lab) + '</b></span>' +
          '<span>Score <b>' + (r.score == null ? '—' : r.score + '/20') + '</b></span>' +
          '<span>Créneau <b>' + esc(r.dateHeure || '—') + '</b></span></div>' +
        (confl && confl.length ? '<div class="aen-confwarn">⚠ Conflit de créneau avec ' + esc(confl.join(', ')) + ' — même horaire, lieu ou évaluateur en commun.</div>' : '') +
        '<div class="aen-fsec">Créneau & type</div>' +
        '<dl class="aen-kv">' +
          kv('Date & heure', esc(r.dateHeure || '—') + (r.ts ? ' <span class="aen-num">(' + esc(new Date(r.ts).toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'UTC' })) + ')</span>' : '')) +
          kv('Durée', esc(r.duree || '—')) +
          kv('Lieu / Lien', esc(r.lieu || '—')) +
          kv('Type', esc(typeLab(r.type))) +
          kv('Poste visé', esc(r.posteVise || '—')) +
        '</dl>' +
        '<div class="aen-fsec">Participants</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="aen-chip info">' + esc(r.candidat || '—') + ' (candidat)</span>' + evalsChips + '</div>' +
        '<div class="aen-fsec">Préparation</div>' +
        '<dl class="aen-kv">' +
          kv('Prochaine étape', esc(r.prochaineEtape || '—')) +
          kv('Date prochaine étape', esc(r.dateProchaineEtape || '—')) +
        '</dl>' +
        '<div class="aen-fsec">Feedback</div>' + fbBlock +
        '<div class="aen-fsec">Notes</div>' +
        '<textarea class="aen-notebox" data-aen="note" placeholder="Préparation, impressions, décision…">' + esc(r.notes || '') + '</textarea>' +
        '<div class="aen-fsec">Statut</div>' +
        '<div class="aen-sim-row" style="margin-bottom:10px"><label for="aen-stsel">Changer le statut</label>' +
          '<select id="aen-stsel" class="aen-in" data-aen="stsel">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="aen-drawer-actions">' +
          '<button class="aen-btn aen-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="aen-btn aen-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="aen-btn aen-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="aen-btn aen-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.aen-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-aen="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statut) return;
      mutate(function (cur) {
        cur.entretiens = cur.entretiens.map(function (x) { if (String(x.id) === String(id)) x.statut = nv; return x; });
        return cur;
      }, 'Statut modifié', r.numero + ' → ' + stMeta(nv).lab);
      toast('Statut : ' + stMeta(nv).lab, 'ok');
    });
    var resq = $('[data-aen="resqsel"]', dr);
    if (resq) resq.addEventListener('change', function (e) {
      var nv = e.target.value;
      mutate(function (cur) {
        cur.entretiens = cur.entretiens.map(function (x) { if (String(x.id) === String(id)) x.resultat = nv; return x; });
        return cur;
      }, 'Résultat modifié', r.numero + ' → ' + resMeta(nv).lab);
      toast('Résultat : ' + resMeta(nv).lab, 'ok');
    });
    $('[data-act="fb"]', dr).addEventListener('click', function () {
      var sv = $('[data-aen="fb-score"]', dr).value;
      var sc = String(sv).trim() === '' ? null : Number(sv);
      if (sc != null && (!isFinite(sc) || sc < 0 || sc > 20)) { toast('Le score doit être compris entre 0 et 20', 'err'); return; }
      mutate(function (cur) {
        cur.entretiens = cur.entretiens.map(function (x) { if (String(x.id) === String(id)) x.score = sc; return x; });
        return cur;
      }, 'Feedback enregistré', r.numero + (sc == null ? ' (score effacé)' : ' score ' + sc + '/20'));
      toast('Feedback enregistré', 'ok');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-aen="note"]', dr).value;
      mutate(function (cur) {
        cur.entretiens = cur.entretiens.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.numero);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', r.numero);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-aen="dialog"],[data-aen="backdrop"][data-aen-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId, presetDate) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var initDH = r ? String(r.dateHeure || '') : '';
    var initDate = r ? (initDH.split(' ')[0] || '') : (presetDate || '');
    var initHeure = r ? (heureOf(initDH) || '') : '';
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'aen-backdrop', 'data-aen': 'backdrop', 'data-aen-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'aen-dialog', 'data-aen': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier un entretien' : 'Nouvel entretien' });
    var cands = {}; rows.forEach(function (x) { if (x.candidat) cands[x.candidat] = 1; });
    var posts = {}; rows.forEach(function (x) { if (x.posteVise) posts[x.posteVise] = 1; });
    var evsx = {}; rows.forEach(function (x) { x.evals.forEach(function (e) { if (e) evsx[e] = 1; }); });
    function dl(id, arr) {
      return '<datalist id="' + id + '">' + Object.keys(arr).sort().map(function (x) { return '<option value="' + esc(x) + '"></option>'; }).join('') + '</datalist>';
    }
    dlg.innerHTML =
      '<div class="aen-dialog-head"><h3>' + (r ? 'Modifier l\u2019entretien ' + esc(r.numero || '') : 'Nouvel entretien') + '</h3>' +
      '<button class="aen-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aen-dialog-body">' +
        '<div class="aen-fgrid">' +
          '<label class="aen-lab">Candidat *<input class="aen-in" data-f="candidat" value="' + esc(v('candidat')) + '" placeholder="Ex. Ndiaye Moussa" list="aen-dl-cand"></label>' +
          '<label class="aen-lab">Type d\u2019entretien *<select class="aen-in" data-f="type">' + TYPES.map(function (t) {
            return '<option value="' + esc(t.k) + '"' + (v('type') === t.k ? ' selected' : '') + '>' + esc(t.lab) + '</option>';
          }).join('') + '</select></label>' +
          '<label class="aen-lab">Date * (jj/mm/aaaa)<input class="aen-in" data-f="date" value="' + esc(initDate) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="aen-lab">Heure *<input class="aen-in" type="time" data-f="heure" value="' + esc(initHeure) + '"></label>' +
          '<label class="aen-lab">Durée<select class="aen-in" data-f="duree">' + DUREES.map(function (d) {
            return '<option value="' + esc(d) + '"' + (v('duree') === d ? ' selected' : '') + '>' + esc(d) + '</option>';
          }).join('') + '</select></label>' +
          '<label class="aen-lab">Lieu / Lien *<input class="aen-in" data-f="lieu" value="' + esc(v('lieu')) + '" placeholder="Salle A, Zoom…"></label>' +
          '<label class="aen-lab full">Évaluateur(s) * (séparés par une virgule)<input class="aen-in" data-f="evaluateurs" value="' + esc(v('evaluateurs')) + '" placeholder="Mme. Fotso Marie, M. Nkoulou Paul" list="aen-dl-ev"></label>' +
          '<label class="aen-lab">Poste visé<input class="aen-in" data-f="posteVise" value="' + esc(v('posteVise')) + '" placeholder="Ex. Chef Cuisinier" list="aen-dl-poste"></label>' +
          '<label class="aen-lab">Statut<select class="aen-in" data-f="statut">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + ((r ? v('statut') : 'Planifie') === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></label>' +
          '<label class="aen-lab">Résultat<select class="aen-in" data-f="resultat">' + RESULTATS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + ((r ? v('resultat') : 'En attente') === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></label>' +
          '<label class="aen-lab">Score /20<input class="aen-in" type="number" min="0" max="20" step="0.5" data-f="score" value="' + (r && r.score != null ? esc(r.score) : '') + '" placeholder="—"></label>' +
          '<label class="aen-lab">Date prochaine étape<input class="aen-in" data-f="dateProchaineEtape" value="' + esc(v('dateProchaineEtape')) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="aen-lab full">Prochaine étape<input class="aen-in" data-f="prochaineEtape" value="' + esc(v('prochaineEtape')) + '" placeholder="Ex. Test technique, Entretien final…"></label>' +
          '<label class="aen-lab full">Notes<textarea class="aen-in aen-ta" data-f="notes" placeholder="Préparation, points à couvrir, impressions…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        dl('aen-dl-cand', cands) + dl('aen-dl-ev', evsx) + dl('aen-dl-poste', posts) +
        '<div class="aen-live" data-aen="dlg-live"></div>' +
        '<div data-aen="dlg-err"></div>' +
      '</div>' +
      '<div class="aen-dialog-foot"><span class="aen-form-hint">Agenda D1 · le conflit de créneau est signalé en direct · le feedback clôt l\u2019entretien</span>' +
      '<span style="display:flex;gap:8px"><button class="aen-btn aen-btn-ghost" data-act="cancel" style="color:var(--aen-text);border-color:var(--aen-line)">Annuler</button>' +
      '<button class="aen-btn aen-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Planifier l\u2019entretien') + '</button></span></div>';
    $('.aen-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var dh = String(val.date || '').trim() + ' ' + String(val.heure || '').trim();
      var ts = tsDH(dh);
      var sc = String(val.score || '').trim();
      var same = ts ? rows.filter(function (x) { return x.ts === ts && String(x.id) !== String(editId || '') && x.statut === 'Planifie'; }).length : 0;
      $('[data-aen="dlg-live"]', dlg).innerHTML =
        '<span>Créneau <b>' + (ts ? esc(dh) + ' (' + esc(new Date(ts).toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'UTC' })) + ')' : 'à compléter') + '</b></span>' +
        '<span>Durée <b>' + esc(val.duree || '—') + '</b></span>' +
        '<span>Statut <b>' + esc(val.statut ? stMeta(val.statut).lab : '—') + '</b></span>' +
        (sc !== '' ? '<span>Score <b>' + esc(sc) + '/20</b></span>' : '') +
        (same ? '<span class="bad">⚠ ' + same + ' entretien(s) déjà planifié(s) à ce créneau</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-aen="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="aen-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.candidat || '').trim()) return fail('Le candidat est obligatoire.');
      if (!String(val.type || '').trim()) return fail('Le type d\u2019entretien est obligatoire.');
      var dOk = validDate(val.date);
      if (!String(val.date || '').trim()) return fail('La date est obligatoire (format jj/mm/aaaa).');
      if (!dOk) return fail('La date est invalide — attendu jj/mm/aaaa.');
      if (!String(val.heure || '').trim()) return fail('L\u2019heure est obligatoire.');
      if (!String(val.lieu || '').trim()) return fail('Le lieu / lien est obligatoire.');
      if (!String(val.evaluateurs || '').trim()) return fail('Au moins un évaluateur est obligatoire.');
      var sv = String(val.score || '').trim();
      var sc = sv === '' ? null : Number(sv);
      if (sc != null && (!isFinite(sc) || sc < 0 || sc > 20)) return fail('Le score doit être compris entre 0 et 20.');
      if (String(val.dateProchaineEtape || '').trim() && !validDate(val.dateProchaineEtape)) return fail('La date de prochaine étape est invalide — attendu jj/mm/aaaa.');
      var rec = {
        candidat: String(val.candidat).trim(),
        type: String(val.type).trim(),
        dateHeure: dOk + ' ' + String(val.heure).trim(),
        duree: String(val.duree || '').trim(),
        lieu: String(val.lieu).trim(),
        evaluateurs: String(val.evaluateurs).trim(),
        posteVise: String(val.posteVise || '').trim(),
        statut: String(val.statut || '').trim() || 'Planifie',
        resultat: String(val.resultat || '').trim() || 'En attente',
        score: sc,
        prochaineEtape: String(val.prochaineEtape || '').trim(),
        dateProchaineEtape: String(val.dateProchaineEtape || '').trim(),
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.entretiens = cur.entretiens.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Entretien modifié', rec.candidat + ' · ' + rec.dateHeure);
        toast('Entretien mis à jour', 'ok');
      } else {
        mutate(function (cur) {
          var nn = nextIdNumero(cur.entretiens.map(function (x) {
            var u = {}; for (var kk in x) u[kk] = x[kk]; u.id = String(u.id); return u;
          }));
          var cp = { id: nn.id, numero: nn.numero };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.entretiens = cur.entretiens.concat([cp]);
          return cur;
        }, 'Entretien créé', rec.candidat + ' · ' + rec.dateHeure);
        toast('Entretien planifié — ' + rec.candidat, 'ok');
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
      var nn = nextIdNumero(cur.entretiens.map(function (x) {
        var u = {}; for (var kk in x) u[kk] = x[kk]; u.id = String(u.id); return u;
      }));
      var cp = {};
      for (var k in r) if (['id', 'numero', 'ts', 'stm', 'rm', 'evals'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = nn.id;
      cp.numero = nn.numero;
      cp.statut = 'Planifie';
      cp.resultat = 'En attente';
      cp.score = null;
      cur.entretiens = cur.entretiens.concat([cp]);
      return cur;
    }, 'Entretien dupliqué', r.numero);
    toast('Entretien dupliqué (statut réinitialisé)', 'ok');
  }
  function closeConfirm() { $$('[data-aen="confirm"],[data-aen="backdrop"][data-aen-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'aen-backdrop', 'data-aen': 'backdrop', 'data-aen-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aen-confirm', 'data-aen': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cet entretien ?</h4><p>' + esc(r.numero || '') + ' — ' + esc(r.candidat || '') + ' (' + esc(r.dateHeure || '—') + '). Cette action est définitive.</p>' +
      '<div class="aen-confirm-row"><button class="aen-btn aen-btn-ghost" data-a="no" style="color:var(--aen-text);border-color:var(--aen-line)">Annuler</button>' +
      '<button class="aen-btn aen-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.entretiens = cur.entretiens.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Entretien supprimé', r.numero);
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Entretien supprimé', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' entretiens ?') : 'Supprimer 1 entretien ?';
    var bd = h('div', { class: 'aen-backdrop', 'data-aen': 'backdrop', 'data-aen-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aen-confirm', 'data-aen': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero || '#' + r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="aen-confirm-row"><button class="aen-btn aen-btn-ghost" data-a="no" style="color:var(--aen-text);border-color:var(--aen-line)">Annuler</button>' +
      '<button class="aen-btn aen-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.entretiens = cur.entretiens.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' entretiens');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' entretiens supprimés', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-aen="journal"],[data-aen="backdrop"][data-aen-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'aen-backdrop', 'data-aen': 'backdrop', 'data-aen-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'aen-panel', 'data-aen': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="aen-panel-head"><h3>Journal d\u2019activité</h3><button class="aen-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aen-panel-body" data-aen="jlist"></div>';
    $('.aen-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-aen="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="aen-jrow"><span class="aen-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="aen-jact">' + esc(x.action || '') + '</span><span class="aen-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="aen-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Entretien', 'Candidat', 'Poste visé', 'Type', 'Date & heure', 'Jour', 'Durée', 'Lieu/Lien', 'Évaluateur(s)', 'Statut', 'Résultat', 'Score /20', 'Prochaine étape', 'Date prochaine étape', 'Notes'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero, r.candidat, r.posteVise, typeLab(r.type), r.dateHeure, r.ts ? new Date(r.ts).toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'UTC' }) : '', r.duree, r.lieu, r.evaluateurs, stMeta(r.statut).lab, resMeta(r.resultat).lab, r.score == null ? '' : r.score, r.prochaineEtape, r.dateProchaineEtape, r.notes];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-planning-entretiens-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-aen="dialog"]') || $('[data-aen="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { UI.view = 'planning'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { UI.view = 'cards'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { UI.charts = !UI.charts; var z = $('[data-aen="charts"]'); if (z) z.classList.toggle('aen-charts-off', !UI.charts); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { toggleDark(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-aen="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvel entretien · E export · J journal · P planning · C cartes · T tableau · S statistiques · K thème · / recherche', ''); }
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
    var root = $('[data-aen="root"]');
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
  function toggleDark() {
    var root = $('[data-aen="root"]');
    var cur = root ? root.getAttribute('data-theme') === 'dark' : false;
    try { localStorage.setItem('admina-dark', cur ? 'false' : 'true'); } catch (e) {}
    detectTheme();
    toast(cur ? 'Thème clair activé' : 'Thème sombre activé', 'ok');
  }

  /* ================= UI persist ================= */
  function loadUI() {
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v) { if (typeof v.view === 'string') UI.view = v.view; if (typeof v.per === 'number') UI.per = v.per; } } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per })); } catch (e) {} }

  /* ================= refresh global ================= */
  var shellBuilt = false, subBound = false;
  function buildShellOnce() { if (!shellBuilt) { buildShell(); shellBuilt = true; } }
  function bindApiSub() {
    if (subBound) return;
    var a = api();
    if (a && typeof a.subscribe === 'function') {
      try { a.subscribe(function () { if (active) scheduleRefresh(); }); subBound = true; } catch (e) {}
    }
  }
  function refresh() {
    if (!isOn()) return;
    if (!mountRoot()) return;
    buildShellOnce();
    bindApiSub();
    renderHero();
    renderKPIs();
    renderDonut();
    renderBars();
    renderFilters();
    if (UI.view === 'cards') renderCards();
    else if (UI.view === 'planning') renderPlanning();
    else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-aen="drawer"],[data-aen="dialog"],[data-aen="confirm"],[data-aen="journal"]')) {
      $$('[data-aen="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function tryActivate() {
    if (active) return;
    if (!isOn()) { bootTries = 0; return; }
    bootTries++;
    if (!ready()) {
      if (bootTries < 30) { setTimeout(tryActivate, 400); return; }
      return; /* ni API ni LS après 30 essais : laisser la page native intacte */
    }
    activate();
  }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-aen');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-aen]')) continue;
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
    html.classList.remove('admina-aen');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal();
    UI.sel = [];
    UI.week = 0;
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    bindApiSub();
    var natif = conteneurNatif();
    var root = $('[data-aen="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-aen-hide', '1');
      natif.setAttribute('data-aen-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) refresh();
  }

  /* démarrage : réessais 30 × 400 ms (relit l'API à chaque essai), sinon page native intacte */
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

  window.__ADMINA_ENTRE_UI__ = {
    version: '1.0-w1',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openPlanning: function () { UI.view = 'planning'; saveUI(); refresh(); },
    openJournal: openJournal,
    exportCSV: exportCSV,
    debug: { filtered: filtered, alerts: computeAlerts, conflicts: conflictMap, finalists: finalistMap, nextNumero: nextIdNumero }
  };
  try { console.info('[ADMINA_ENTRE] W1-a actif — Centre de pilotage Planning des Entretiens /planning-entretiens'); } catch (e) {}
})();
