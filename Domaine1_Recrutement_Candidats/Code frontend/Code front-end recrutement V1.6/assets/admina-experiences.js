/* =============================================================
   Admina-RH — Expériences des Candidats — couche admina (W3-e)
   Scope : /experiences · préfixe aex- · flag __ADMINA_EXP_W3__
   ---------------------------------------------------------------
   PHILOSOPHIE DE LA PAGE (exigence permanente du client) :
   « /experiences = L'HISTORIQUE PROFESSIONNEL VÉRIFIÉ. L'expérience
   passée prédit la réussite future — mais seule l'expérience
   VÉRIFIÉE pèse dans une décision. La page sépare nettement le
   vérifié du non-vérifié, pousse à lancer les vérifications (pont
   avec la page Vérifications de références), révèle les trous de
   parcours et les durées incohérentes. Un parcours n'est pas une
   liste de postes : c'est une trajectoire datée, cumulée, et dont
   les maillons forts sont ceux qui ont été confirmés par un tiers. »
   ---------------------------------------------------------------
   VUE SIGNATURE (défaut au chargement) : « PARCOURS PAR CANDIDAT »
     une rangée par candidat — frise chronologique horizontale de
     SES expériences ordonnées par dateDebut, segments proportionnels
     aux durées, vérifié = plein / non vérifié = hachuré, cumul
     d'années, badge « % vérifié », pastille si trou de parcours >
     seuil ; clic segment → drawer sur CETTE expérience.
   - Héro calculé (X expériences · Y % vérifiées · Z candidats ·
     N années cumulées) + sous-ligne entreprises distinctes
   - 5 alertes AAA cliquables → filtres : longues non vérifiées
     (≥ seuil, action « lancer une vérification » = dialog pré-rempli
     + journal, JAMAIS d'écriture dans les données d'une autre page),
     candidats sans aucune vérifiée, trous de parcours > seuil,
     durées incohérentes (tolérance configurable), croisement
     __ADMINA_VREF_API__ (silencieux si absent)
   - 6 KPI (≥ 4 filtrent) + 3 graphiques SVG vanilla cliquables
     (donut vérifiées, top entreprises, histogramme durées)
   - Recherche + filtres (vérifiée, entreprise, période, durée) +
     Réinitialiser · table triable aria-sort · vue cartes · drawer
     fiche (mini-frise du candidat, toggle vérifiée, description
     éditable, alertes inline, historique journal) · dialog
     création/édition VALIDÉ (dates MM/aaaa, dateFin > dateDebut
     bloquant ou « en cours », durée AUTO-CALCULée, aperçu live
     chevauchements) · duplication (vérifiée réinitialisée) ·
     suppression simple & groupée confirmée · seuils persistés ·
     export CSV · journal admina_journal + délégation
     __ADMINA_AUDIT__ · raccourcis N/E/J/P/C/S/K/T + / + ? ·
     dark mode auto · burger mobile <820px · 390px sans débordement
     (frise scrollable DANS son conteneur)
   - Données : window.__ADMINA_EXP_API__ (chunk déjà patché par
     l'orchestrateur — AUCUN re-patch ici) → fallback localStorage
     admina-experiences-data · résilience 30 réessais (450 ms) ·
     pont bidirectionnel (subscribe + poller 1,2 s) · anti-collision
     id = max(id)+1 (déjà côté chunk, respecté ici)
   - Stale-closure drawer évitée (leçon M26) : toute mutation relit
     les données fraîches via mutate(cur) puis reopenDrawerAt(id)
   - Aucun global hors window.__ADMINA_EXP_*
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_EXP_W3__) return;
  window.__ADMINA_EXP_W3__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/experiences\/?$/;
  var LS_DATA = 'admina-experiences-data';
  var LS_UI = 'admina-experiences-ui';
  var LS_SEUILS = 'admina-experiences-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', ver: '', entr: '', periode: '', dur: '', kpi: '', view: 'parcours', sortKey: 'debut', sortDir: 1, page: 0, rpp: 10, drawerId: null, dialogOpen: false, editId: null, sel: [] };

  /* ================= seuils (persistés) ================= */
  var SEUILS_DEF = { longNonVerifiee: 12, trouMax: 6, tolerance: 1 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
  function expRef(r) { return 'EXP-' + String(r.id == null ? 0 : r.id).padStart(3, '0'); }
  /* dates au format natif MM/aaaa (ex. 01/2015) */
  function parseMY(s) {
    var m = /^(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (!m) return null;
    var mo = Number(m[1]), y = Number(m[2]);
    if (mo < 1 || mo > 12 || y < 1900 || y > 2200) return null;
    return { m: mo, y: y };
  }
  function mIdx(s) { var p = parseMY(s); return p ? p.y * 12 + (p.m - 1) : null; }
  function nowIdx() { var d = new Date(); return d.getFullYear() * 12 + d.getMonth(); }
  function fmtDuree(m) {
    m = Math.max(0, Math.round(Number(m) || 0));
    var y = Math.floor(m / 12), r = m % 12;
    var p = [];
    if (y > 0) p.push(y + ' an' + (y > 1 ? 's' : ''));
    if (r > 0 || y === 0) p.push(r + ' mois');
    return p.join(' ');
  }
  function parseDuree(s) {
    var v = String(s || '').toLowerCase();
    if (!v) return null;
    var y = /(\d+)\s*an/.exec(v), mo = /(\d+)\s*mois/.exec(v);
    if (!y && !mo) return null;
    return (y ? Number(y[1]) * 12 : 0) + (mo ? Number(mo[1]) : 0);
  }
  function anneesTxt(m) {
    var a = m / 12;
    var s = a.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    return s + ' annee' + (a > 1.0001 ? 's' : '');
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
  function toastsZone() { var z = $('[data-aex="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-aex', 'toasts'); z.className = 'aex-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'aex-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_EXP_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.experiences && Array.isArray(d.experiences) && d.experiences.length) return true;
    return false;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.experiences) { d = readLS(); }
    if (!d || !d.experiences || !d.experiences.length) return [];
    var now = nowIdx();
    return d.experiences.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = Number(u.id) || 0;
      u.candidat = String(u.candidat || '').trim();
      u.ver = u.verifiee === 'Oui';
      u.m1 = mIdx(u.dateDebut);
      u.m2 = String(u.dateFin || '').trim() ? mIdx(u.dateFin) : null;
      u.encours = u.m2 == null;
      u.calcM = u.m1 != null ? Math.max(0, (u.m2 != null ? u.m2 : now) - u.m1) : 0;
      u.calcTxt = u.m1 != null ? fmtDuree(u.calcM) : '\u2014';
      u.parsed = parseDuree(u.duree);
      u.noncalc = (u.m1 != null && u.m2 != null && (!String(u.duree || '').trim() || norm(u.duree) === 'a calculer'));
      u.incoh = (u.m1 != null && u.m2 != null && u.parsed != null && Math.abs(u.parsed - (u.m2 - u.m1)) > SEUILS.tolerance);
      u.long = !u.ver && u.calcM >= SEUILS.longNonVerifiee;
      u.ovl = '';
      var vr = null;
      if (!u.ver) vr = vrefFind(u.candidat, u.entreprise);
      u.vrefMiss = !!vr;
      u.vrefStatut = vr ? String(vr.statut || '') : '';
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
      if (!cur || !cur.experiences) { toast('\u00c9criture impossible \u2014 recharger la page', 'err'); return false; }
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
    if (cur2 && cur2.experiences) {
      var nv2 = fn(cur2);
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { return false; }
      if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
      refresh();
      return true;
    }
    toast('\u00c9criture impossible \u2014 API indisponible', 'err');
    return false;
  }

  /* ================= pont Vérifications de références =========
     Croisement LECTURE SEULE avec __ADMINA_VREF_API__ ( getData()
     .verifications, champs candidat/entreprise/statut ). SILENCIEUX
     si l'API est absente. On n'écrit JAMAIS dans les données d'une
     autre page : la demande de vérification va au journal + toast. */
  function vrefData() {
    try {
      var a = window.__ADMINA_VREF_API__;
      var d = a && typeof a.getData === 'function' ? a.getData() : null;
      return (d && d.verifications) || [];
    } catch (e) { return []; }
  }
  function vrefFind(cand, entr) {
    var list = vrefData();
    if (!list.length) return null;
    var nc = norm(cand), ne = norm(entr);
    if (!nc || !ne) return null;
    for (var i = 0; i < list.length; i++) {
      var v = list[i] || {};
      var vc = norm(v.candidat), ve = norm(v.entreprise);
      if (!vc || !ve) continue;
      var cm = vc === nc || vc.indexOf(nc) > -1 || nc.indexOf(vc) > -1;
      var em = ve === ne || ve.indexOf(ne) > -1 || ne.indexOf(ve) > -1;
      if (cm && em) return v;
    }
    return null;
  }

  /* ================= parcours par candidat ================= */
  function buildParcours(rows) {
    var map = {}; var order = [];
    rows.forEach(function (r) {
      var k = norm(r.candidat) || '\u2014';
      if (!map[k]) { map[k] = { cand: r.candidat || '\u2014', key: k, rows: [] }; order.push(k); }
      map[k].rows.push(r);
    });
    return order.map(function (k) {
      var c = map[k];
      c.rows.sort(function (a, b) { return (a.m1 == null ? 999999 : a.m1) - (b.m1 == null ? 999999 : b.m1) || (Number(a.id) || 0) - (Number(b.id) || 0); });
      var totalM = 0, verM = 0, hasIncoh = false, hasLong = false;
      c.rows.forEach(function (r) {
        totalM += Math.max(r.calcM, 0);
        if (r.ver) verM += Math.max(r.calcM, 0);
        if (r.incoh || r.noncalc) hasIncoh = true;
        if (r.long) hasLong = true;
      });
      var gaps = [];
      for (var i = 1; i < c.rows.length; i++) {
        var prev = c.rows[i - 1], cur = c.rows[i];
        if (prev.m2 == null) { if (cur.m1 != null && prev.m1 != null && cur.m1 < prev.m1) cur.ovl = prev.entreprise; continue; }
        var g = (cur.m1 == null ? 0 : cur.m1) - prev.m2 - 1;
        if (g < 0) {
          cur.ovl = prev.entreprise;
          if (!prev.ovl) prev.ovl = cur.entreprise;
        } else if (g > 0) {
          gaps.push({ afterId: prev.id, beforeId: cur.id, months: g, from: prev.dateFin, to: cur.dateDebut });
        }
      }
      c.totalM = totalM; c.verM = verM;
      c.pct = totalM > 0 ? Math.round(verM / totalM * 100) : 0;
      c.gaps = gaps;
      c.gapsSeuil = gaps.filter(function (g) { return g.months > SEUILS.trouMax; });
      c.hasTrou = c.gapsSeuil.length > 0;
      c.hasIncoh = hasIncoh;
      c.hasLong = hasLong;
      c.noVer = verM === 0;
      var last = c.rows[c.rows.length - 1];
      c.span = (c.rows[0].dateDebut || '?') + ' \u2192 ' + (last.dateFin ? last.dateFin : 'aujourd\u2019hui');
      return c;
    }).sort(function (a, b) { return b.totalM - a.totalM; });
  }
  function gapMonthsBetween(prev, cur) {
    if (prev.m2 == null || cur.m1 == null) return 0;
    return cur.m1 - prev.m2 - 1;
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var lnv = rows.filter(function (r) { return r.long; });
    if (lnv.length) out.push({
      tone: 'err', f: 'lnv', act: true,
      txt: lnv.length + ' exp\u00e9rience' + (lnv.length > 1 ? 's' : '') + ' LONGUE' + (lnv.length > 1 ? 'S' : '') + ' (\u2265 ' + SEUILS.longNonVerifiee + ' mois) non v\u00e9rifi\u00e9e' + (lnv.length > 1 ? 's' : '') + ' \u2014 seule l\u2019exp\u00e9rience v\u00e9rifi\u00e9e p\u00e8se : ' + lnv.slice(0, 2).map(function (r) { return r.candidat + ' @ ' + r.entreprise; }).join(', ') + '\u2026'
    });
    var pmap = buildParcours(rows);
    var noVer = pmap.filter(function (c) { return c.noVer; });
    if (noVer.length) out.push({
      tone: 'err', f: 'noverifcand',
      txt: noVer.length + ' candidat' + (noVer.length > 1 ? 's' : '') + ' sans AUCUNE exp\u00e9rience v\u00e9rifi\u00e9e \u2014 lancer les contr\u00f4les : ' + noVer.slice(0, 2).map(function (c) { return c.cand; }).join(', ') + '\u2026'
    });
    var tr = pmap.filter(function (c) { return c.hasTrou; });
    if (tr.length) out.push({
      tone: 'warn', f: 'trou',
      txt: 'Trou' + (tr.length > 1 ? 's' : '') + ' de parcours > ' + SEUILS.trouMax + ' mois chez ' + tr.length + ' candidat' + (tr.length > 1 ? 's' : '') + ' : ' + tr.slice(0, 2).map(function (c) { return c.cand + ' (' + c.gapsSeuil[0].months + ' mois entre ' + c.gapsSeuil[0].from + ' et ' + c.gapsSeuil[0].to + ')'; }).join(', ') + '\u2026'
    });
    var inc = rows.filter(function (r) { return r.incoh || r.noncalc; });
    if (inc.length) out.push({
      tone: 'warn', f: 'incoh',
      txt: inc.length + ' dur\u00e9e' + (inc.length > 1 ? 's' : '') + ' incoh\u00e9rente' + (inc.length > 1 ? 's' : '') + ' ou jamais calcul\u00e9e' + (inc.length > 1 ? 's' : '') + ' (tol\u00e9rance ' + SEUILS.tolerance + ' mois) : ' + inc.slice(0, 2).map(function (r) { return expRef(r) + ' ' + r.candidat; }).join(', ') + '\u2026'
    });
    var vr = rows.filter(function (r) { return r.vrefMiss; });
    if (vr.length) out.push({
      tone: 'info', f: 'vref',
      txt: vr.length + ' exp\u00e9rience' + (vr.length > 1 ? 's' : '') + ' marqu\u00e9e' + (vr.length > 1 ? 's' : '') + ' \u00ab Non \u00bb alors qu\u2019une v\u00e9rification existe d\u00e9j\u00e0 (pont /verification-references) : ' + vr.slice(0, 2).map(function (r) { return r.candidat + ' @ ' + r.entreprise + ' (' + (r.vrefStatut || 'statut ?') + ')'; }).join(', ') + '\u2026'
    });
    return out.slice(0, 6);
  }

  /* ================= filtres / tri ================= */
  function bucketOf(m) { if (m < 12) return 'b0'; if (m < 36) return 'b1'; if (m < 60) return 'b2'; if (m < 120) return 'b3'; return 'b4'; }
  var BUCKETS = [
    { k: 'b0', lab: '< 1 an', short: '<1 an' },
    { k: 'b1', lab: '1 \u2013 3 ans', short: '1-3' },
    { k: 'b2', lab: '3 \u2013 5 ans', short: '3-5' },
    { k: 'b3', lab: '5 \u2013 10 ans', short: '5-10' },
    { k: 'b4', lab: '10 ans +', short: '10+' }
  ];
  function filtered() {
    var rows = data();
    var pmap = {};
    buildParcours(rows).forEach(function (c) { pmap[c.key] = c; });
    var avgM = rows.length ? Math.round(rows.reduce(function (s, r) { return s + Math.max(r.calcM, 0); }, 0) / rows.length) : 0;
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      var pc = pmap[norm(r.candidat)] || { rows: [], verM: 1, gapsSeuil: [] };
      if (UI.ver === 'oui' && !r.ver) return false;
      if (UI.ver === 'non' && r.ver) return false;
      if (UI.entr && norm(r.entreprise) !== norm(UI.entr)) return false;
      if (UI.periode === 'avant18' && !(r.m1 != null && r.m1 < 2018 * 12)) return false;
      if (UI.periode === '18-21' && !(r.m1 != null && r.m1 >= 2018 * 12 && r.m1 < 2021 * 12)) return false;
      if (UI.periode === '21+' && !(r.m1 != null && r.m1 >= 2021 * 12)) return false;
      if (UI.periode === 'encours' && !r.encours) return false;
      if (UI.dur === 'b0' && !(r.calcM < 12)) return false;
      if (UI.dur === 'b1' && !(r.calcM >= 12 && r.calcM < 36)) return false;
      if (UI.dur === 'b2' && !(r.calcM >= 36 && r.calcM < 60)) return false;
      if (UI.dur === 'b3' && !(r.calcM >= 60 && r.calcM < 120)) return false;
      if (UI.dur === 'b4' && !(r.calcM >= 120)) return false;
      if (UI.kpi === 'verif' && !r.ver) return false;
      if (UI.kpi === 'a-verifier' && r.ver) return false;
      if (UI.kpi === 'multi' && pc.rows.length < 2) return false;
      if (UI.kpi === 'long' && !(r.calcM >= avgM && avgM > 0)) return false;
      if (UI.kpi === 'noverifcand' && !pc.noVer) return false;
      if (UI.kpi === 'trou' && !pc.gapsSeuil.length) return false;
      if (UI.kpi === 'incoh' && !(r.incoh || r.noncalc)) return false;
      if (UI.kpi === 'lnv' && !r.long) return false;
      if (UI.kpi === 'vref' && !r.vrefMiss) return false;
      if (q && !(norm(r.candidat).indexOf(q) > -1 || norm(r.entreprise).indexOf(q) > -1 || norm(r.poste).indexOf(q) > -1 || norm(r.description).indexOf(q) > -1 || norm(expRef(r)).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'debut') { va = a.m1 == null ? 999999 : a.m1; vb = b.m1 == null ? 999999 : b.m1; }
      else if (k === 'duree') { va = a.calcM; vb = b.calcM; }
      else if (k === 'ver') { va = a.ver ? 1 : 0; vb = b.ver ? 1 : 0; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.ver ? 1 : 0) + (UI.entr ? 1 : 0) + (UI.periode ? 1 : 0) + (UI.dur ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.ver = ''; UI.entr = ''; UI.periode = ''; UI.dur = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Exp[ée]riences\s+des\s+Candidats/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-aex="root"]');
    if (!root) {
      root = h('section', { 'data-aex': 'root', class: 'aex-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-aex-page')) {
      page.setAttribute('data-aex-page', '1');
      page.setAttribute('data-aex-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-aex-hide')) {
      natif.setAttribute('data-aex-hide', '1');
      natif.setAttribute('data-aex-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-aex="root"]'); if (root) root.remove();
    $$('[data-aex-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-aex-oldw') || '';
      n.removeAttribute('data-aex-page');
      n.removeAttribute('data-aex-oldw');
    });
    $$('[data-aex-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-aex-olddisp') || '';
      n.removeAttribute('data-aex-hide');
      n.removeAttribute('data-aex-olddisp');
    });
    $$('[data-aex]').forEach(function (n) { n.remove(); });
  }
  function showNative() {
    var root = $('[data-aex="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'aex-btn aex-btn-primary aex-backbtn', 'data-aex': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'experiences');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    trajet: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h4l3-8 4 12 3-7h4"/></svg>',
    seuils: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    frise: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="7" height="6" rx="2"/><rect x="11" y="5" width="5" height="6" rx="2"/><rect x="18" y="5" width="4" height="6" rx="2"/><path d="M4 15h16M4 19h10"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    calc: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h2M12 19h2"/></svg>'
  };
  var USER_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/><path d="M12 14v7M9 18h6"/></svg>';

  function buildShell() {
    var root = $('[data-aex="root"]');
    if (!root || $('[data-aex="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="aex-hero" data-aex="hero">' +
        '<div class="aex-hero-main">' +
          '<div class="aex-hero-title">' +
            '<span class="aex-hero-ico" aria-hidden="true">' + USER_ICON + '</span>' +
            '<div><h2 class="aex-h2">Centre de pilotage \u2014 Historique professionnel v\u00e9rifi\u00e9</h2>' +
            '<p class="aex-hero-sub" data-aex="herosub"></p>' +
            '<p class="aex-hero-sub2" data-aex="herosub2"></p></div>' +
          '</div>' +
          '<div class="aex-hero-actions">' +
            '<button class="aex-btn" data-aex="btn-journal" title="Journal d\u2019activit\u00e9 (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="aex-btn" data-aex="btn-seuils" title="Seuils de pilotage (K)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="aex-btn" data-aex="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="aex-btn" data-aex="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="aex-btn aex-btn-primary" data-aex="btn-new" title="Nouvelle exp\u00e9rience (N)">' + ICO.plus + 'Nouvelle exp\u00e9rience</button>' +
          '</div>' +
        '</div>' +
        '<div class="aex-hero-alerts" data-aex="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="aex-kpis" data-aex="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="aex-charts" data-aex="charts">' +
        '<div class="aex-chart-card"><div class="aex-chart-title">V\u00e9rifi\u00e9 vs non v\u00e9rifi\u00e9</div><div class="aex-donut-wrap" data-aex="donut"></div></div>' +
        '<div class="aex-chart-card"><div class="aex-chart-title">Top entreprises (exp\u00e9riences)</div><div class="aex-svgwrap" data-aex="ents"></div></div>' +
        '<div class="aex-chart-card"><div class="aex-chart-title">Dur\u00e9es des exp\u00e9riences</div><div class="aex-svgwrap" data-aex="hist"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="aex-toolbar" data-aex="toolbar">' +
        '<div class="aex-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (candidat, entreprise, poste, description\u2026)" data-aex="search" aria-label="Rechercher une exp\u00e9rience" /></div>' +
        '<select data-aex="f-ver" class="aex-sel" aria-label="Filtrer par v\u00e9rification"></select>' +
        '<select data-aex="f-entr" class="aex-sel" aria-label="Filtrer par entreprise"></select>' +
        '<select data-aex="f-periode" class="aex-sel" aria-label="Filtrer par p\u00e9riode de d\u00e9but"></select>' +
        '<select data-aex="f-dur" class="aex-sel" aria-label="Filtrer par dur\u00e9e"></select>' +
        '<button class="aex-chipbtn" data-aex="btn-reset" hidden>R\u00e9initialiser</button>' +
        '<span class="aex-count" data-aex="count"></span>' +
        '<div class="aex-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="aex-vbtn" data-aex="v-parcours" title="Parcours par candidat (P)">' + ICO.frise + 'Parcours</button>' +
          '<button class="aex-vbtn" data-aex="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="aex-vbtn" data-aex="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-aex="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-aex="selbar"></div>' +

      /* PIED */
      '<div class="aex-foot">Source de v\u00e9rit\u00e9 locale (navigateur) \u2014 conforme Manuel D1 (vivier) · journal d\u2019audit actif · seuils configurables · <button class="aex-link" data-aex="btn-native">Afficher le tableau natif</button></div>';

    $('[data-aex="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-aex="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-aex="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'experiences'); window.print(); });
    $('[data-aex="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-aex="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-aex="btn-native"]', root).addEventListener('click', showNative);
    $('[data-aex="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-aex="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-aex="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aex="f-ver"]', root).addEventListener('change', function (e) { UI.ver = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aex="f-entr"]', root).addEventListener('change', function (e) { UI.entr = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aex="f-periode"]', root).addEventListener('change', function (e) { UI.periode = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aex="f-dur"]', root).addEventListener('change', function (e) { UI.dur = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aex="v-parcours"]', root).addEventListener('click', function () { setView('parcours'); });
    $('[data-aex="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-aex="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
  }

  function setView(v) { UI.view = v; refresh(); }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var oui = rows.filter(function (r) { return r.ver; }).length;
    var pVer = rows.length ? Math.round(oui / rows.length * 100) : 0;
    var cands = {}; var ents = {};
    rows.forEach(function (r) { if (r.candidat) cands[r.candidat] = 1; if (r.entreprise) ents[r.entreprise] = 1; });
    var nbCand = Object.keys(cands).length;
    var totalM = rows.reduce(function (s, r) { return s + Math.max(r.calcM, 0); }, 0);
    var top = Object.keys(ents).map(function (k) { return { k: k, v: rows.filter(function (r) { return r.entreprise === k; }).length }; }).sort(function (a, b) { return b.v - a.v; })[0];
    $('[data-aex="herosub"]').textContent =
      rows.length + ' exp\u00e9rience' + (rows.length > 1 ? 's' : '') +
      ' \u00b7 ' + pVer + ' % v\u00e9rifi\u00e9es' +
      ' \u00b7 ' + nbCand + ' candidat' + (nbCand > 1 ? 's' : '') +
      ' \u00b7 ' + anneesTxt(totalM) + ' cumul\u00e9es';
    $('[data-aex="herosub2"]').textContent =
      Object.keys(ents).length + ' entreprise' + (Object.keys(ents).length > 1 ? 's' : '') + ' distincte' + (Object.keys(ents).length > 1 ? 's' : '') +
      (top ? ' \u00b7 top : ' + top.k + ' (' + top.v + ')' : '') +
      ' \u00b7 la trajectoire compte, les maillons confirm\u00e9s comptent plus';
    var zone = $('[data-aex="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="aex-alert ' + a.tone + '" data-aex="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    var act = al.filter(function (a) { return a.act; });
    if (act.length) {
      var b = h('button', { class: 'aex-actchip', 'data-aex': 'act-verif', title: 'Ouvre une demande pr\u00e9-remplie (candidat + entreprise) \u2014 not\u00e9e au journal, pont avec /verification-references' });
      b.innerHTML = ICO.shield + ' Lancer une v\u00e9rification';
      zone.appendChild(b);
      b.addEventListener('click', function () {
        var rows2 = data();
        var first = rows2.filter(function (r) { return r.long; })[0] || rows2[0];
        openVerifDialog(first ? { candidat: first.candidat, entreprise: first.entreprise } : {});
      });
    }
    $$('.aex-alert', zone).forEach(function (b2) {
      b2.addEventListener('click', function () {
        var f = b2.getAttribute('data-f');
        resetFilters();
        UI.kpi = f;
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var oui = rows.filter(function (r) { return r.ver; }).length;
    var pVer = nb ? Math.round(oui / nb * 100) : 0;
    var cands = {}; var ents = {}; var multiCand = 0;
    rows.forEach(function (r) {
      if (r.candidat) {
        cands[r.candidat] = (cands[r.candidat] || 0) + 1;
        if (cands[r.candidat] === 2) multiCand++;
      }
      if (r.entreprise) ents[r.entreprise] = 1;
    });
    var nbCand = Object.keys(cands).length;
    var nbEnt = Object.keys(ents).length;
    var avgM = nb ? Math.round(rows.reduce(function (s, r) { return s + Math.max(r.calcM, 0); }, 0) / nb) : 0;
    var nLong = rows.filter(function (r) { return r.calcM >= avgM && avgM > 0; }).length;
    var top = Object.keys(ents).map(function (k) { return { k: k, v: rows.filter(function (r) { return r.entreprise === k; }).length }; }).sort(function (a, b) { return b.v - a.v; })[0];
    var lnv = rows.filter(function (r) { return r.long; }).length;
    var kpis = [
      { k: '', t: 'EXP\u00c9RIENCES', v: String(nb), s: nbCand + ' candidats \u00b7 ' + nbEnt + ' entreprises', cls: '' },
      { k: 'verif', t: 'V\u00c9RIFI\u00c9ES', v: String(oui), s: pct(pVer) + ' v\u00e9rifi\u00e9es', cls: '' },
      { k: 'multi', t: 'CANDIDATS DISTINCTS', v: String(nbCand), s: multiCand + ' multi-postes', cls: '' },
      { k: 'long', t: 'DUR\u00c9E MOYENNE', v: fmtDuree(avgM), s: nLong + ' exp\u00e9rience(s) \u2265 moyenne', cls: '' },
      { k: 'topent', t: 'ENTREPRISES DISTINCTES', v: String(nbEnt), s: top ? 'top : ' + top.k : 'aucune', cls: '' },
      { k: 'a-verifier', t: '\u00c0 V\u00c9RIFIER', v: String(nb - oui), s: 'dont ' + lnv + ' longue(s) \u2265 ' + SEUILS.longNonVerifiee + ' mois', cls: (nb - oui) > 0 ? 'bad' : '' }
    ];
    var zone = $('[data-aex="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="aex-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="aex-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="aex-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="aex-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.aex-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        if (k === 'topent') {
          UI.kpi = ''; UI.q = ''; UI.periode = ''; UI.dur = ''; UI.ver = '';
          UI.entr = (top && UI.entr !== top.k) ? top.k : '';
          UI.page = 0; refresh(); return;
        }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.ver = ''; UI.entr = ''; UI.periode = ''; UI.dur = ''; }
        UI.page = 0;
        refresh();
      });
    });
  }

  /* ================= graphiques SVG vanilla ================= */
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="' + esc(label) + '">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">exp\u00e9riences</text></svg>';
  }

  function entSvg(items, curKey) {
    if (!items.length) return '<div class="aex-empty">Aucune donn\u00e9e</div>';
    var W = 300, rowH = 24, padL = 118, padR = 30, H = items.length * rowH + 6;
    var mx = 1;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="img" aria-label="Top entreprises">';
    items.forEach(function (it, i) {
      var y = i * rowH + 5;
      var w = Math.max(2, (it.v / mx) * (W - padL - padR));
      var nm = it.name.length > 16 ? it.name.slice(0, 15) + '\u2026' : it.name;
      s += '<g class="aex-svgrow' + (curKey === it.key ? ' on' : '') + '" data-key="' + esc(it.key) + '" role="button" tabindex="0" aria-label="Filtrer : ' + esc(it.name) + '">' +
        '<title>' + esc(it.name + ' \u2014 ' + it.v + ' exp\u00e9rience(s)') + '</title>' +
        '<text x="' + (padL - 6) + '" y="' + (y + 11) + '" text-anchor="end" font-size="10" fill="currentColor">' + esc(nm) + '</text>' +
        '<rect x="' + padL + '" y="' + y + '" width="' + w + '" height="14" rx="3.5" fill="#0d9488" opacity=".92"></rect>' +
        '<text x="' + (padL + w + 5) + '" y="' + (y + 11) + '" font-size="10" fill="currentColor" opacity=".7">' + it.v + '</text></g>';
    });
    return s + '</svg>';
  }

  function histSvg(buckets, curKey) {
    var W = 300, H = 156, padL = 10, padB = 30, padT = 14;
    var mx = 1;
    buckets.forEach(function (b) { if (b.v > mx) mx = b.v; });
    var bw = (W - padL - 10) / buckets.length;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="img" aria-label="Histogramme des dur\u00e9es">';
    buckets.forEach(function (b, i) {
      var h_ = Math.max(2, (b.v / mx) * (H - padT - padB));
      var x = padL + i * bw + 7, y = H - padB - h_;
      s += '<g class="aex-svgrow' + (curKey === b.k ? ' on' : '') + '" data-key="' + b.k + '" role="button" tabindex="0" aria-label="Filtrer : ' + esc(b.lab) + '">' +
        '<title>' + esc(b.lab + ' \u2014 ' + b.v + ' exp\u00e9rience(s)') + '</title>' +
        '<rect x="' + x + '" y="' + y + '" width="' + (bw - 14) + '" height="' + h_ + '" rx="4" fill="#0f766e" opacity=".92"></rect>' +
        '<text x="' + (x + (bw - 14) / 2) + '" y="' + (y - 4) + '" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">' + b.v + '</text>' +
        '<text x="' + (x + (bw - 14) / 2) + '" y="' + (H - padB + 13) + '" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".75">' + esc(b.short) + '</text></g>';
    });
    return s + '</svg>';
  }

  function renderCharts() {
    var rows = data();
    var zD = $('[data-aex="donut"]');
    var oui = rows.filter(function (r) { return r.ver; }).length;
    var non = rows.length - oui;
    var parts = [
      { k: 'oui', lab: 'V\u00e9rifi\u00e9es', c: '#059669', v: oui },
      { k: 'non', lab: 'Non v\u00e9rifi\u00e9es', c: '#f59e0b', v: non }
    ];
    zD.innerHTML = donutSvg(parts, rows.length, 'V\u00e9rifi\u00e9 vs non v\u00e9rifi\u00e9') +
      '<div class="aex-donut-legend">' + parts.map(function (p) {
        return '<span class="aex-dl-item' + (UI.ver === p.k ? ' on' : '') + '" data-st="' + p.k + '" role="button" tabindex="0">' +
          '<span class="aex-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="aex-dl-val">' + p.v + ' \u00b7 ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.aex-dl-item', zD).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.ver = UI.ver === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    var map = {};
    rows.forEach(function (r) { var e = r.entreprise || '\u2014'; if (!map[e]) map[e] = 0; map[e]++; });
    var items = Object.keys(map).map(function (k) { return { key: k, name: k, v: map[k] }; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 6);
    var zE = $('[data-aex="ents"]');
    zE.innerHTML = entSvg(items, UI.entr);
    $$('.aex-svgrow', zE).forEach(function (g) {
      g.addEventListener('click', function () {
        var k = g.getAttribute('data-key');
        UI.entr = UI.entr === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    var bmap = {};
    rows.forEach(function (r) { var b = bucketOf(r.calcM); if (!bmap[b]) bmap[b] = 0; bmap[b]++; });
    var bks = BUCKETS.map(function (b) { return { k: b.k, lab: b.lab, short: b.short, v: bmap[b.k] || 0 }; });
    var zH = $('[data-aex="hist"]');
    zH.innerHTML = histSvg(bks, UI.dur);
    $$('.aex-svgrow', zH).forEach(function (g) {
      g.addEventListener('click', function () {
        var k = g.getAttribute('data-key');
        UI.dur = UI.dur === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var ents = {};
    rows.forEach(function (r) { if (r.entreprise) ents[r.entreprise] = 1; });
    var sel1 = $('[data-aex="f-ver"]');
    sel1.innerHTML = '<option value="">V\u00e9rifi\u00e9e : toutes</option>' +
      '<option value="oui"' + (UI.ver === 'oui' ? ' selected' : '') + '>V\u00e9rifi\u00e9es (Oui)</option>' +
      '<option value="non"' + (UI.ver === 'non' ? ' selected' : '') + '>Non v\u00e9rifi\u00e9es</option>';
    var sel2 = $('[data-aex="f-entr"]');
    sel2.innerHTML = '<option value="">Entreprise : toutes</option>' + Object.keys(ents).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.entr === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-aex="f-periode"]');
    sel3.innerHTML = '<option value="">D\u00e9but : toutes p\u00e9riodes</option>' +
      '<option value="avant18"' + (UI.periode === 'avant18' ? ' selected' : '') + '>Avant 2018</option>' +
      '<option value="18-21"' + (UI.periode === '18-21' ? ' selected' : '') + '>2018 \u2013 2020</option>' +
      '<option value="21+"' + (UI.periode === '21+' ? ' selected' : '') + '>2021 et plus</option>' +
      '<option value="encours"' + (UI.periode === 'encours' ? ' selected' : '') + '>En cours (sans fin)</option>';
    var sel4 = $('[data-aex="f-dur"]');
    sel4.innerHTML = '<option value="">Dur\u00e9e : toutes</option>' + BUCKETS.map(function (b) {
      return '<option value="' + b.k + '"' + (UI.dur === b.k ? ' selected' : '') + '>' + esc(b.lab) + '</option>';
    }).join('');
    $('[data-aex="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-aex="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' exp\u00e9riences';
  }

  /* ================= cellules ================= */
  function verChip(r) {
    return r.ver
      ? '<span class="aex-chip ok" title="Exp\u00e9rience confirm\u00e9e par un tiers">Oui</span>'
      : '<span class="aex-chip warn" title="Non v\u00e9rifi\u00e9e \u2014 ne p\u00e8se pas dans une d\u00e9cision">Non</span>';
  }
  function periodeCell(r) {
    var fin = r.dateFin ? esc(r.dateFin) : 'aujourd\u2019hui';
    return '<span class="aex-per">' + esc(r.dateDebut || '?') + ' \u2192 ' + fin + (r.encours ? ' <span class="aex-chip info">en cours</span>' : '') + '</span>';
  }
  function dureeCell(r) {
    var base = '<span class="aex-dur">' + esc(r.duree || '\u2014') + '</span>';
    if (!r.encours && r.m1 != null && r.m2 != null) base += ' <span class="aex-num">(calc. ' + esc(fmtDuree(r.m2 - r.m1)) + ')</span>';
    if (r.encours && r.m1 != null) base += ' <span class="aex-num">(\u00e0 ce jour ' + esc(r.calcTxt) + ')</span>';
    if (r.incoh) return base + ' <span class="aex-chip err" title="Dur\u00e9e d\u00e9clar\u00e9e \u2260 dur\u00e9e calcul\u00e9e depuis les dates (tol\u00e9rance ' + SEUILS.tolerance + ' mois)">\u2260 dates</span>';
    if (r.noncalc) return base + ' <span class="aex-chip err" title="Dur\u00e9e jamais calcul\u00e9e \u2014 recalculer depuis les dates">\u00e0 calculer</span>';
    return base;
  }
  function descCell(r) {
    var d = String(r.description || '');
    return d.length > 48 ? '<span title="' + esc(d) + '">' + esc(d.slice(0, 48)) + '\u2026</span>' : esc(d) || '\u2014';
  }

  /* ================= table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var oui = all.filter(function (r) { return r.ver; }).length;
    var totalM = all.reduce(function (s, r) { return s + Math.max(r.calcM, 0); }, 0);
    var start = UI.page * UI.rpp;
    var pageRows = rows.slice(start, start + UI.rpp);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = 'none';
      if (key) aria = key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none';
      return '<th ' + (key ? 'data-sort="' + key + '" aria-sort="' + aria + '"' : '') + ' class="' + (cls || '') + '" scope="col">' + label +
        (key && key === sortKey ? '<span class="aex-arrow">' + (dir < 0 ? '\u25bc' : '\u25b2') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'aex-th-chk') + th('N\u00b0') + th('Candidat', 'candidat') + th('Entreprise', 'entreprise') + th('Poste', 'poste') +
      th('P\u00e9riode', 'debut') + th('Dur\u00e9e', 'duree') + th('V\u00e9rifi\u00e9e', 'ver') + th('Description') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="aex-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="S\u00e9lectionner ' + esc(expRef(r)) + '"></td>' +
        '<td class="aex-num">' + esc(expRef(r)) + '</td>' +
        '<td><span class="aex-cand" data-open="' + esc(r.id) + '">' + esc(r.candidat || '\u2014') + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.entreprise || '\u2014') + '</td>' +
        '<td>' + esc(r.poste || '\u2014') + '</td>' +
        '<td>' + periodeCell(r) + '</td>' +
        '<td>' + dureeCell(r) + '</td>' +
        '<td>' + verChip(r) + '</td>' +
        '<td class="aex-desc">' + descCell(r) + '</td>' +
        '<td><div class="aex-actions">' +
          '<button class="aex-ic" data-open="' + esc(r.id) + '" title="D\u00e9tail">' + ICO.eye + '</button>' +
          '<button class="aex-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aex-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aex-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="aex-tfoot"><td></td><td colspan="9">TOTAL ' + all.length + ' exp\u00e9riences \u00b7 ' + oui + ' v\u00e9rifi\u00e9e(s) (' + pct(all.length ? oui / all.length * 100 : 0) + ') \u00b7 cumul ' + anneesTxt(totalM) + '</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.rpp));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="aex-pager"><span>' + rows.length + ' \u00e9l\u00e9ment' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="aex-sel" data-aex="rpp" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.rpp === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="aex-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>\u2039</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="aex-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>\u203a</button></div>';
    var card = $('[data-aex="content"]');
    card.innerHTML = '<div class="aex-tblcard"><div class="aex-tblwrap"><table class="aex-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="10"><div class="aex-empty">Aucune exp\u00e9rience ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = (k === 'candidat' || k === 'entreprise' || k === 'poste' || k === 'debut') ? 1 : -1; }
        refresh();
      });
    });
    bindRowActions(card);
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var rppSel = $('[data-aex="rpp"]', card);
    if (rppSel) rppSel.addEventListener('change', function () { UI.rpp = Number(rppSel.value); UI.page = 0; saveUI(); refresh(); });
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
    var card = $('[data-aex="content"]');
    card.innerHTML = rows.length ? '<div class="aex-cards">' + rows.map(function (r) {
      return '<div class="aex-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="aex-card-top"><div><input type="checkbox" class="aex-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="S\u00e9lectionner" style="margin-right:6px">' +
        '<span class="aex-num">' + esc(expRef(r)) + '</span></div>' +
        verChip(r) + '</div>' +
        '<div class="aex-card-name" data-open="' + esc(r.id) + '">' + esc(r.candidat || '\u2014') + '</div>' +
        '<div class="aex-card-poste">' + esc(r.poste || '\u2014') + ' \u00b7 <b>' + esc(r.entreprise || '\u2014') + '</b></div>' +
        '<div class="aex-card-meta">' + periodeCell(r) + '</div>' +
        '<div class="aex-card-meta">' + dureeCell(r) + '</div>' +
        '<div class="aex-card-desc">' + descCell(r) + '</div>' +
        '<div class="aex-card-foot"><span class="aex-num">' + esc(r.calcTxt) + (r.encours ? ' \u00e0 ce jour' : '') + '</span>' +
        '<div class="aex-card-act">' +
          '<button class="aex-ic" data-open="' + esc(r.id) + '" title="D\u00e9tail">' + ICO.eye + '</button>' +
          '<button class="aex-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aex-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aex-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="aex-empty">Aucune exp\u00e9rience ne correspond aux filtres</div>';
    bindRowActions(card);
  }

  /* ================= VUE PARCOURS PAR CANDIDAT (signature) =====
     Une rangée = un candidat ; la frise horizontale = SES
     expériences ordonnées par dateDebut, segments proportionnels
     aux durées, vérifié = plein / non vérifié = hachuré ; trous de
     parcours matérialisés entre segments ; clic segment = fiche de
     CETTE expérience. */
  function segHtml(r, mini, curId) {
    var w = Math.max(r.calcM, 1);
    var per = (r.dateDebut || '?') + ' \u2192 ' + (r.dateFin ? r.dateFin : 'aujourd\u2019hui');
    var tip = (r.ver ? 'V\u00e9rifi\u00e9e' : 'Non v\u00e9rifi\u00e9e') + ' \u00b7 ' + per +
      ' \u00b7 ' + (r.encours ? 'en cours (' + r.calcTxt + ' \u00e0 ce jour)' : r.calcTxt) +
      ' \u00b7 ' + (r.entreprise || '\u2014') + ' \u2014 ' + (r.poste || '\u2014');
    return '<button class="aex-seg ' + (r.ver ? 'ok' : 'no') + (String(curId) === String(r.id) ? ' cur' : '') + (mini ? ' mini' : '') + '" ' +
      'style="flex-grow:' + w + '" data-open="' + esc(r.id) + '" title="' + esc(tip) + '" aria-label="' + esc(tip) + '">' +
      '<span class="aex-seg-ent">' + esc(r.entreprise || '\u2014') + '</span>' +
      '<span class="aex-seg-per">' + esc(r.dateDebut || '?') + (r.dateFin ? ' \u2192 ' + esc(r.dateFin) : ' \u2192 \u2026') + '</span>' +
      '</button>';
  }
  function friseHtml(par, mini, curId) {
    var parts = [];
    for (var i = 0; i < par.rows.length; i++) {
      var r = par.rows[i];
      if (i > 0) {
        var prev = par.rows[i - 1];
        var g = gapMonthsBetween(prev, r);
        if (g > 0) {
          var hot = g > SEUILS.trouMax;
          parts.push('<span class="aex-gap' + (hot ? ' hot' : '') + '" style="flex-grow:' + Math.max(g, 0.6) + '" ' +
            'title="' + esc('Trou de parcours : ' + g + ' mois (' + prev.dateFin + ' \u2192 ' + r.dateDebut + ')' + (hot ? ' \u2014 au-del\u00e0 du seuil (' + SEUILS.trouMax + ' mois)' : '')) + '">' +
            (hot ? '<i class="aex-gapmark">' + g + ' mois</i>' : '') + '</span>');
        } else if (g < 0) {
          parts.push('<span class="aex-ovl" style="flex:0 0 16px" title="' + esc('Chevauchement : ' + r.entreprise + ' d\u00e9marre avant la fin de ' + prev.entreprise) + '">\u29c9</span>');
        }
      }
      parts.push(segHtml(r, mini, curId));
    }
    return '<div class="aex-frise-inner">' + parts.join('') + '</div>';
  }
  function renderParcours() {
    var rows = filtered();
    var card = $('[data-aex="content"]');
    var legend = '<div class="aex-pc-legend">' +
      '<span><i class="aex-leg ok"></i>v\u00e9rifi\u00e9e (plein)</span>' +
      '<span><i class="aex-leg no"></i>non v\u00e9rifi\u00e9e (hachur\u00e9)</span>' +
      '<span><i class="aex-leg gap"></i>trou de parcours</span>' +
      '<span class="aex-pc-hint">Cliquez un segment pour ouvrir la fiche de cette exp\u00e9rience \u2014 cliquez le nom pour le parcours complet. Largeur \u221d dur\u00e9e.</span>' +
      '</div>';
    var head = '<div class="aex-chead">' +
      '<span>Candidat</span><span>Trajectoire (chronologique, \u221d dur\u00e9e)</span><span>Cumul &amp; v\u00e9rification</span></div>';
    var body = rows.length ? buildParcours(rows).map(function (par) {
      var badges = '';
      if (par.hasTrou) badges += '<span class="aex-chip err" title="Trou de parcours > ' + SEUILS.trouMax + ' mois">trou ' + par.gapsSeuil[0].months + ' mois</span> ';
      if (par.hasIncoh) badges += '<span class="aex-chip warn" title="Dur\u00e9es incoh\u00e9rentes ou jamais calcul\u00e9es">dur\u00e9e \u00e0 corriger</span> ';
      if (par.noVer) badges += '<span class="aex-chip err" title="Aucune exp\u00e9rience v\u00e9rifi\u00e9e pour ce candidat">0 v\u00e9rifi\u00e9e</span> ';
      if (par.hasLong) badges += '<span class="aex-chip warn" title="Exp\u00e9rience longue non v\u00e9rifi\u00e9e">longue non v\u00e9rifi\u00e9e</span> ';
      var pctCls = par.pct >= 75 ? 'ok' : (par.pct > 0 ? 'mid' : 'zero');
      return '<div class="aex-crow' + (par.hasTrou ? ' has-trou' : '') + '">' +
        '<div class="aex-cid">' +
          '<span class="aex-cname" data-open="' + esc(par.rows[0].id) + '" title="Ouvrir le parcours complet">' + esc(par.cand) + '</span>' +
          '<span class="aex-num">' + par.rows.length + ' exp\u00e9rience' + (par.rows.length > 1 ? 's' : '') + ' \u00b7 ' + esc(par.span) + '</span>' +
          (badges ? '<span class="aex-pc-badges">' + badges + '</span>' : '') +
        '</div>' +
        '<div class="aex-frise" role="group" aria-label="Frise des exp\u00e9riences de ' + esc(par.cand) + '">' + friseHtml(par, false, null) + '</div>' +
        '<div class="aex-cstats">' +
          '<span class="aex-cumul"><b>' + esc(fmtDuree(par.totalM)) + '</b><i>cumul\u00e9es</i></span>' +
          '<span class="aex-pct ' + pctCls + '" title="Part v\u00e9rifi\u00e9e du cumul (en mois)">' + par.pct + ' % v\u00e9rifi\u00e9</span>' +
        '</div>' +
      '</div>';
    }).join('') : '<div class="aex-empty">Aucun parcours ne correspond aux filtres</div>';
    card.innerHTML = '<div class="aex-pccard">' + legend + head + body + '</div>';
    bindRowActions(card);
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-aex="selbar"]');
    if (!zone) return;
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    var rows = UI.sel.map(function (id) { return rowById(id); }).filter(Boolean);
    var verM = rows.reduce(function (s, r) { return s + Math.max(r.calcM, 0); }, 0);
    zone.innerHTML = '<div class="aex-selbar">' +
      '<span class="aex-selbar-info">' + rows.length + ' s\u00e9lectionn\u00e9' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="aex-selbar-sub">cumul ' + esc(fmtDuree(verM)) + '</span>' +
      '<button class="aex-btn aex-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="aex-btn aex-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="aex-btn aex-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer fiche expérience =================
     Leçon M26/W2 : aucun handler ne se referme sur un snapshot —
     chaque mutation relit les données fraîches via mutate(cur) puis
     reopenDrawerAt(id) rouvre la fiche sur l'état à jour. */
  function closeDrawer() { $$('[data-aex="drawer"],[data-aex="backdrop"][data-aex-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id, focus) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = String(id);
    var par = buildParcours(data()).filter(function (c) { return c.key === norm(r.candidat); })[0] || { rows: [r], gaps: [], gapsSeuil: [], pct: 0, totalM: r.calcM, noVer: !r.ver };
    var bd = h('div', { class: 'aex-backdrop', 'data-aex': 'backdrop', 'data-aex-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    /* alertes inline */
    var warnBlock = '';
    if (r.incoh) warnBlock += '<div class="aex-warnblock">\u26a0 Dur\u00e9e d\u00e9clar\u00e9e (\u00ab ' + esc(r.duree || '\u2014') + ' \u00bb) \u2260 dur\u00e9e calcul\u00e9e depuis les dates (' + esc(fmtDuree(r.m2 - r.m1)) + ') \u2014 recalculer ci-dessous.</div>';
    if (r.noncalc) warnBlock += '<div class="aex-warnblock">\u26a0 Dur\u00e9e jamais calcul\u00e9e (\u00ab ' + esc(r.duree || 'vide') + ' \u00bb) \u2014 bouton Recalculer ci-dessous.</div>';
    (par.gaps || []).forEach(function (g) {
      if (String(g.afterId) === String(r.id)) warnBlock += '<div class="aex-warnblock' + (g.months > SEUILS.trouMax ? '' : ' soft') + '">\u26a0 Trou APR\u00c8S cette exp\u00e9rience : ' + g.months + ' mois (' + esc(g.from) + ' \u2192 ' + esc(g.to) + ')' + (g.months > SEUILS.trouMax ? ' \u2014 au-del\u00e0 du seuil (' + SEUILS.trouMax + ' mois).' : '.') + '</div>';
      if (String(g.beforeId) === String(r.id)) warnBlock += '<div class="aex-warnblock' + (g.months > SEUILS.trouMax ? '' : ' soft') + '">\u26a0 Trou AVANT cette exp\u00e9rience : ' + g.months + ' mois (' + esc(g.from) + ' \u2192 ' + esc(g.to) + ')' + (g.months > SEUILS.trouMax ? ' \u2014 au-del\u00e0 du seuil (' + SEUILS.trouMax + ' mois).' : '.') + '</div>';
    });
    if (r.ovl) warnBlock += '<div class="aex-warnblock soft">\u29c9 Chevauchement avec \u00ab ' + esc(r.ovl) + ' \u00bb \u2014 p\u00e9riodes communes.</div>';
    if (r.long) warnBlock += '<div class="aex-warnblock">\u26a0 Exp\u00e9rience longue (\u2265 ' + SEUILS.longNonVerifiee + ' mois) NON v\u00e9rifi\u00e9e \u2014 elle ne p\u00e8se pas dans une d\u00e9cision. <button class="aex-linkbtn" data-act="verif">' + ICO.shield + ' Lancer une v\u00e9rification</button></div>';
    if (r.vrefMiss) warnBlock += '<div class="aex-warnblock info">\u2139 Une v\u00e9rification existe d\u00e9j\u00e0 pour ce candidat chez cette entreprise (statut : ' + esc(r.vrefStatut || '?') + ', page V\u00e9rifications de r\u00e9f\u00e9rences) mais l\u2019exp\u00e9rience reste \u00ab Non \u00bb \u2014 r\u00e9concilier.</div>';
    /* historique du candidat (journal) */
    var hist = journalRows().filter(function (x) {
      var blob = norm((x.action || '') + ' ' + (x.detail || ''));
      return blob.indexOf(norm(r.candidat)) > -1 || blob.indexOf(norm(expRef(r))) > -1;
    }).slice(0, 8);
    var histHtml = hist.length ? hist.map(function (x) {
      var d = new Date(x.time);
      return '<div class="aex-jrow"><span class="aex-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="aex-jact">' + esc(x.action || '') + '</span><span class="aex-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="aex-empty" style="padding:10px 0">Aucune activit\u00e9 journalis\u00e9e pour ce candidat.</div>';
    var dr = h('aside', { class: 'aex-drawer', 'data-aex': 'drawer', role: 'dialog', 'aria-label': 'Fiche exp\u00e9rience ' + expRef(r) });
    dr.innerHTML =
      '<div class="aex-drawer-head"><div><div class="aex-drawer-title">' + esc(r.candidat || '\u2014') + '</div>' +
      '<div class="aex-drawer-sub">' + esc(expRef(r)) + ' \u00b7 ' + esc(r.poste || '\u2014') + ' \u00b7 ' + esc(r.entreprise || '\u2014') + '</div></div>' +
      '<button class="aex-drawer-x" aria-label="Fermer">\u2715</button></div>' +
      '<div class="aex-drawer-body">' +
        '<div class="aex-live" style="margin-top:0">' +
          '<span>V\u00e9rifi\u00e9e <b>' + (r.ver ? 'Oui' : 'Non') + '</b></span>' +
          '<span>Dur\u00e9e <b>' + esc(r.encours ? r.calcTxt + ' \u00e0 ce jour' : r.calcTxt) + '</b></span>' +
          '<span>P\u00e9riode <b>' + esc(r.dateDebut || '?') + ' \u2192 ' + esc(r.dateFin || 'aujourd\u2019hui') + '</b></span>' +
          '<span>Candidat <b>' + par.pct + ' % v\u00e9rifi\u00e9 \u00b7 ' + esc(fmtDuree(par.totalM)) + ' cumul\u00e9es</b></span>' +
        '</div>' +
        warnBlock +
        '<div class="aex-fsec">Parcours du candidat \u2014 toutes ses exp\u00e9riences (mini-frise)</div>' +
        '<div class="aex-frise mini" role="group" aria-label="Mini-frise du parcours de ' + esc(r.candidat || '') + '">' + friseHtml(par, true, r.id) + '</div>' +
        '<div class="aex-fsec">V\u00e9rification</div>' +
        '<div class="aex-verrow"><span>Exp\u00e9rience confirm\u00e9e par un tiers ?</span>' +
          '<span class="aex-seg2" role="group" aria-label="Basculer la v\u00e9rification">' +
            '<button class="aex-toggle' + (r.ver ? ' on' : '') + '" data-ver="Oui">Oui</button>' +
            '<button class="aex-toggle' + (!r.ver ? ' on' : '') + '" data-ver="Non">Non</button>' +
          '</span></div>' +
        '<div class="aex-fsec">Dates &amp; dur\u00e9e</div>' +
        '<dl class="aex-kv">' +
          kv('Date de d\u00e9but', esc(r.dateDebut || '\u2014')) +
          kv('Date de fin', esc(r.dateFin || '\u2014') + (r.encours ? ' <span class="aex-chip info">en cours</span>' : '')) +
          kv('Dur\u00e9e d\u00e9clar\u00e9e', esc(r.duree || '\u2014') + (r.incoh ? ' <span class="aex-chip err">\u2260 dates</span>' : '') + (r.noncalc ? ' <span class="aex-chip err">\u00e0 calculer</span>' : '')) +
          kv('Dur\u00e9e calcul\u00e9e', esc(r.calcTxt) + (r.encours ? ' (\u00e0 ce jour)' : '')) +
        '</dl>' +
        '<div class="aex-drawer-actions" style="margin-top:8px">' +
          '<button class="aex-btn aex-btn-ghost" data-act="recalc" title="Recalcule la dur\u00e9e depuis les dates MM/aaaa et l\u2019enregistre">' + ICO.calc + ' Recalculer la dur\u00e9e</button>' +
        '</div>' +
        '<div class="aex-fsec">Description (\u00e9ditable inline)</div>' +
        '<textarea class="aex-notebox" data-aex="desc" placeholder="Missions, responsabilit\u00e9s, r\u00e9sultats\u2026">' + esc(r.description || '') + '</textarea>' +
        '<div class="aex-drawer-actions">' +
          '<button class="aex-btn aex-btn-ghost" data-act="desc">Enregistrer la description</button>' +
        '</div>' +
        '<div class="aex-fsec">Historique (journal)</div>' +
        histHtml +
        '<div class="aex-drawer-actions">' +
          '<button class="aex-btn aex-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="aex-btn aex-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="aex-btn aex-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.aex-drawer-x', dr).addEventListener('click', closeDrawer);
    /* bascule vérifiée : relit la donnée fraîche via mutate(cur) */
    $$('.aex-toggle', dr).forEach(function (b) {
      b.addEventListener('click', function () {
        var nv = b.getAttribute('data-ver');
        mutate(function (cur) {
          cur.experiences = cur.experiences.map(function (x) { if (String(x.id) === String(id)) x.verifiee = nv; return x; });
          return cur;
        }, 'Vérification mise à jour', expRef(r) + ' \u00b7 ' + r.candidat + ' @ ' + r.entreprise + ' \u2192 ' + nv);
        toast('V\u00e9rifi\u00e9e : ' + nv, nv === 'Oui' ? 'ok' : '');
        reopenDrawerAt(id, null);
      });
    });
    $('[data-act="recalc"]', dr).addEventListener('click', function () {
      var r2 = rowById(id);
      if (!r2) return;
      var nv;
      if (!r2.dateFin || !String(r2.dateFin).trim()) nv = 'En cours';
      else if (r2.m1 == null || r2.m2 == null) { toast('Dates invalides \u2014 corrigez d\u2019abord (MM/aaaa)', 'err'); return; }
      else nv = fmtDuree(r2.m2 - r2.m1);
      mutate(function (cur) {
        cur.experiences = cur.experiences.map(function (x) { if (String(x.id) === String(id)) x.duree = nv; return x; });
        return cur;
      }, 'Durée recalculée', expRef(r) + ' \u00b7 ' + r.candidat + ' \u2192 ' + nv);
      toast('Dur\u00e9e recalcul\u00e9e : ' + nv, 'ok');
      reopenDrawerAt(id, null);
    });
    $('[data-act="desc"]', dr).addEventListener('click', function () {
      var v = $('[data-aex="desc"]', dr).value;
      mutate(function (cur) {
        cur.experiences = cur.experiences.map(function (x) { if (String(x.id) === String(id)) x.description = v; return x; });
        return cur;
      }, 'Description modifiée', expRef(r) + ' \u00b7 ' + r.candidat);
      toast('Description enregistr\u00e9e', 'ok');
    });
    var vb = $('[data-act="verif"]', dr);
    if (vb) vb.addEventListener('click', function () { openVerifDialog({ candidat: r.candidat, entreprise: r.entreprise }); });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    /* mini-frise : clic sur une autre expérience du même candidat */
    $$('.aex-seg', dr).forEach(function (s) {
      s.addEventListener('click', function () { openDrawer(s.getAttribute('data-open'), null); });
    });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', expRef(r) + ' \u00b7 ' + r.candidat + ' @ ' + r.entreprise);
  }
  function reopenDrawerAt(id, focus) {
    if (UI.drawerId !== null && String(UI.drawerId) === String(id)) openDrawer(id, focus);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-aex="dialog"],[data-aex="backdrop"][data-aex-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
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
    var bd = h('div', { class: 'aex-backdrop', 'data-aex': 'backdrop', 'data-aex-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'aex-dialog', 'data-aex': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une exp\u00e9rience' : 'Nouvelle exp\u00e9rience' });
    var candsDl = '<datalist id="aex-cands">' + Object.keys(rows.reduce(function (m, x) { if (x.candidat) m[norm(x.candidat)] = x.candidat; return m; }, {})).sort().map(function (k) { return '<option value="' + esc(k) + '"></option>'; }).join('') + '</datalist>';
    var entsDl = '<datalist id="aex-ents">' + Object.keys(rows.reduce(function (m, x) { if (x.entreprise) m[x.entreprise] = 1; return m; }, {})).sort().map(function (d2) { return '<option value="' + esc(d2) + '"></option>'; }).join('') + '</datalist>';
    var encours = r ? r.encours : !(prefill && prefill.dateFin);
    dlg.innerHTML =
      '<div class="aex-dialog-head"><h3>' + (r ? 'Modifier l\u2019exp\u00e9rience ' + esc(expRef(r)) : 'Nouvelle exp\u00e9rience') + '</h3>' +
      '<button class="aex-drawer-x" aria-label="Fermer">\u2715</button></div>' +
      '<div class="aex-dialog-body">' +
        '<div class="aex-fgrid">' +
          '<label class="aex-lab">Candidat * (format \u00ab Nom Pr\u00e9nom \u00bb)<input class="aex-in" data-f="candidat" list="aex-cands" value="' + esc(v('candidat')) + '" placeholder="Ex. Ndiaye Moussa"></label>' +
          '<label class="aex-lab">Entreprise *<input class="aex-in" data-f="entreprise" list="aex-ents" value="' + esc(v('entreprise')) + '" placeholder="Ex. H\u00f4tel Sawa"></label>' +
          '<label class="aex-lab">Poste occup\u00e9 *<input class="aex-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="aex-lab">V\u00e9rifi\u00e9e<select class="aex-in" data-f="verifiee"><option value="Non"' + ((r ? !r.ver : true) ? ' selected' : '') + '>Non</option><option value="Oui"' + (r && r.ver ? ' selected' : '') + '>Oui</option></select></label>' +
          '<label class="aex-lab">Date de d\u00e9but * (MM/aaaa)<input class="aex-in" data-f="dateDebut" value="' + esc(v('dateDebut')) + '" placeholder="MM/aaaa" inputmode="numeric" maxlength="7"></label>' +
          '<label class="aex-lab">Date de fin (MM/aaaa)<input class="aex-in" data-f="dateFin" value="' + esc(v('dateFin')) + '" placeholder="MM/aaaa ou vide" inputmode="numeric" maxlength="7"' + (encours ? ' disabled' : '') + '></label>' +
          '<label class="aex-lab aex-chkbox"><input type="checkbox" data-f="encours"' + (encours ? ' checked' : '') + '> Poste actuel \u2014 en cours \u00e0 ce jour (\u00ab Aujourd\u2019hui \u00bb)</label>' +
          '<label class="aex-lab full">Description<textarea class="aex-in aex-ta" data-f="description" placeholder="Missions, responsabilit\u00e9s, r\u00e9sultats\u2026">' + esc(v('description')) + '</textarea></label>' +
        '</div>' + candsDl + entsDl +
        '<div class="aex-live" data-aex="dlg-live"></div>' +
        '<div data-aex="dlg-err"></div>' +
      '</div>' +
      '<div class="aex-dialog-foot"><span class="aex-form-hint">Dur\u00e9e AUTO-CALCUL\u00e9e depuis les dates \u00b7 dateFin &gt; dateDebut \u00b7 un parcours est une trajectoire dat\u00e9e</span>' +
      '<span style="display:flex;gap:8px"><button class="aex-btn aex-btn-ghost" data-act="recalc2" title="Force le recalcul de l\u2019aper\u00e7u">Recalculer</button>' +
      '<button class="aex-btn aex-btn-ghost" data-act="cancel" style="color:var(--aex-text);border-color:var(--aex-line)">Annuler</button>' +
      '<button class="aex-btn aex-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Cr\u00e9er l\u2019exp\u00e9rience') + '</button></span></div>';
    $('.aex-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function formVals() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = (i.type === 'checkbox') ? i.checked : i.value; });
      return val;
    }
    /* chevauchements éventuels avec les autres expériences du même candidat */
    function overlaps(val) {
      var m1 = mIdx(val.dateDebut), m2 = val.encours ? null : mIdx(val.dateFin);
      if (m1 == null) return [];
      var otherCand = r ? norm(r.candidat) : norm(val.candidat);
      var pmap = buildParcours(rows);
      var par = pmap.filter(function (c) { return c.key === otherCand; })[0];
      if (!par) return [];
      return par.rows.filter(function (x) {
        if (r && String(x.id) === String(r.id)) return false;
        var a1 = x.m1, a2 = x.m2 != null ? x.m2 : nowIdx();
        if (a1 == null) return false;
        var b2 = m2 != null ? m2 : nowIdx();
        return a1 <= b2 && m1 <= a2;
      });
    }
    function live() {
      var val = formVals();
      var m1 = mIdx(val.dateDebut), m2 = val.encours ? null : mIdx(val.dateFin);
      var dur = '\u2014';
      if (val.encours) { if (m1 != null) dur = fmtDuree(Math.max(0, nowIdx() - m1)) + ' \u00e0 ce jour (en cours)'; }
      else if (m1 != null && m2 != null) dur = fmtDuree(m2 - m1);
      var ovl = overlaps(val);
      $('[data-aex="dlg-live"]', dlg).innerHTML =
        '<span>Dur\u00e9e calcul\u00e9e <b>' + esc(dur) + '</b></span>' +
        '<span>Chevauchements <b class="' + (ovl.length ? 'bad' : 'good') + '">' + (ovl.length ? '\u26a0 avec ' + esc(ovl.map(function (x) { return x.entreprise; }).join(', ')) : 'aucun') + '</b></span>' +
        (m1 == null && String(val.dateDebut || '').trim() ? '<span class="bad">\u26a0 Date de d\u00e9but invalide (MM/aaaa)</span>' : '') +
        (!val.encours && m2 == null && String(val.dateFin || '').trim() ? '<span class="bad">\u26a0 Date de fin invalide (MM/aaaa)</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) {
      i.addEventListener('input', function () {
        if (i.getAttribute('data-f') === 'encours') {
          var fin = $('[data-f="dateFin"]', dlg);
          fin.disabled = !!i.checked;
          if (i.checked) fin.value = '';
        }
        live();
      });
    });
    $('[data-act="recalc2"]', dlg).addEventListener('click', function () { live(); toast('Aper\u00e7u recalcul\u00e9 depuis les dates', 'ok'); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = formVals();
      var err = $('[data-aex="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="aex-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.candidat || '').trim()) return fail('Le candidat est obligatoire (format \u00ab Nom Pr\u00e9nom \u00bb).');
      if (!String(val.entreprise || '').trim()) return fail('L\u2019entreprise est obligatoire.');
      if (!String(val.poste || '').trim()) return fail('Le poste est obligatoire.');
      if (!parseMY(val.dateDebut)) return fail('La date de d\u00e9but est obligatoire et doit \u00eatre au format MM/aaaa valide (ex. 03/2021).');
      var m1 = mIdx(val.dateDebut);
      var fin = '';
      if (!val.encours) {
        if (!parseMY(val.dateFin)) return fail('La date de fin doit \u00eatre au format MM/aaaa valide \u2014 ou cochez \u00ab Poste actuel \u00bb pour une exp\u00e9rience en cours.');
        var m2 = mIdx(val.dateFin);
        if (m2 <= m1) return fail('La date de fin doit \u00eatre POST\u00c9RIEURE \u00e0 la date de d\u00e9but (ou cochez \u00ab Poste actuel \u00bb).');
        fin = String(val.dateFin).trim();
      }
      var rec = {
        candidat: String(val.candidat).trim(),
        entreprise: String(val.entreprise).trim(),
        poste: String(val.poste).trim(),
        dateDebut: String(val.dateDebut).trim(),
        dateFin: fin,
        duree: fin ? fmtDuree(mIdx(fin) - m1) : 'En cours',
        verifiee: val.verifiee === 'Oui' ? 'Oui' : 'Non',
        description: String(val.description || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.experiences = cur.experiences.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Expérience modifiée', expRef(r) + ' \u00b7 ' + rec.candidat + ' @ ' + rec.entreprise);
        toast('Exp\u00e9rience mise \u00e0 jour (dur\u00e9e recalcul\u00e9e : ' + rec.duree + ')', 'ok');
      } else {
        mutate(function (cur) {
          var mx = cur.experiences.reduce(function (m, x) { var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n); return m; }, 0) + 1;
          var cp = {};
          for (var k2 in rec) cp[k2] = rec[k2];
          cp.id = mx;
          cur.experiences = cur.experiences.concat([cp]);
          return cur;
        }, 'Expérience créée', 'EXP-' + String(nextId(data())).padStart(3, '0') + ' \u00b7 ' + rec.candidat + ' @ ' + rec.entreprise);
        toast('Exp\u00e9rience cr\u00e9\u00e9e \u2014 ' + rec.candidat, 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="candidat"]', dlg);
    if (first) first.focus();
  }

  /* ================= dialog demande de vérification (pont) =====
     Ouvre un dialog PRÉ-REMPLI (candidat + entreprise) et note la
     demande dans le JOURNAL (+ toast). On n'écrit JAMAIS dans les
     données de la page Vérifications de références. */
  function openVerifDialog(pre) {
    closeDialog();
    var bd = h('div', { class: 'aex-backdrop', 'data-aex': 'backdrop', 'data-aex-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'aex-dialog small', 'data-aex': 'dialog', role: 'dialog', 'aria-label': 'Demander une v\u00e9rification' });
    dlg.innerHTML =
      '<div class="aex-dialog-head"><h3>' + ICO.shield + ' Demander une v\u00e9rification</h3>' +
      '<button class="aex-drawer-x" aria-label="Fermer">\u2715</button></div>' +
      '<div class="aex-dialog-body">' +
        '<p class="aex-cibles-note">La demande est not\u00e9e dans le journal d\u2019audit (pont avec la page <b>V\u00e9rifications de r\u00e9f\u00e9rences</b>) \u2014 les donn\u00e9es de cette autre page ne sont pas modifi\u00e9es ici.</p>' +
        '<div class="aex-fgrid">' +
          '<label class="aex-lab">Candidat *<input class="aex-in" data-f="candidat" value="' + esc(pre && pre.candidat || '') + '" placeholder="Nom Pr\u00e9nom"></label>' +
          '<label class="aex-lab">Entreprise *<input class="aex-in" data-f="entreprise" value="' + esc(pre && pre.entreprise || '') + '" placeholder="Employeur \u00e0 contacter"></label>' +
          '<label class="aex-lab full">Note<textarea class="aex-in aex-ta" data-f="note" placeholder="R\u00e9f\u00e9rent \u00e0 contacter, \u00e9l\u00e9ments \u00e0 confirmer, priorit\u00e9\u2026"></textarea></label>' +
        '</div>' +
      '</div>' +
      '<div class="aex-dialog-foot"><span class="aex-form-hint">Seule l\u2019exp\u00e9rience v\u00e9rifi\u00e9e p\u00e8se dans une d\u00e9cision</span>' +
      '<span style="display:flex;gap:8px"><button class="aex-btn aex-btn-ghost" data-act="cancel" style="color:var(--aex-text);border-color:var(--aex-line)">Annuler</button>' +
      '<button class="aex-btn aex-btn-primary" data-act="save">Noter la demande</button></span></div>';
    $('.aex-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-aex="dlg-err"]', dlg);
      function fail(msg) { if (err) { err.innerHTML = '<div class="aex-form-err">' + esc(msg) + '</div>'; } else { toast(msg, 'err'); } }
      if (!String(val.candidat || '').trim()) return fail('Le candidat est obligatoire.');
      if (!String(val.entreprise || '').trim()) return fail('L\u2019entreprise est obligatoire.');
      jlog('Vérification demandée', val.candidat.trim() + ' @ ' + val.entreprise.trim() + (val.note ? ' \u2014 ' + val.note.trim() : ''));
      toast('Demande de v\u00e9rification not\u00e9e au journal \u2014 \u00e0 traiter dans /verification-references', 'ok');
      closeDialog();
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
      var mx = cur.experiences.reduce(function (m, x) { var n = Number(x.id); if (isFinite(n)) m = Math.max(m, n); return m; }, 0) + 1;
      var cp = {};
      for (var k in r) if (['ver', 'm1', 'm2', 'encours', 'calcM', 'calcTxt', 'parsed', 'noncalc', 'incoh', 'long', 'ovl', 'vrefMiss', 'vrefStatut'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = mx;
      /* une copie doit être re-confirmée par un tiers : vérifiée réinitialisée */
      cp.verifiee = 'Non';
      cur.experiences = cur.experiences.concat([cp]);
      return cur;
    }, 'Expérience dupliquée', expRef(r) + ' \u00b7 ' + r.candidat + ' @ ' + r.entreprise + ' (v\u00e9rifi\u00e9e r\u00e9initialis\u00e9e)');
    toast('Exp\u00e9rience dupliqu\u00e9e (v\u00e9rifi\u00e9e r\u00e9initialis\u00e9e \u00e0 Non)', 'ok');
  }
  function closeConfirm() { $$('[data-aex="confirm"],[data-aex="backdrop"][data-aex-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'aex-backdrop', 'data-aex': 'backdrop', 'data-aex-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aex-confirm', 'data-aex': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette exp\u00e9rience ?</h4><p>' + esc(expRef(r)) + ' \u2014 ' + esc(r.candidat || '\u2014') + ' chez ' + esc(r.entreprise || '\u2014') + ' (' + esc(r.dateDebut || '?') + ' \u2192 ' + esc(r.dateFin || 'aujourd\u2019hui') + '). Le maillon dispara\u00eetra de la frise du candidat. Cette action est d\u00e9finitive.</p>' +
      '<div class="aex-confirm-row"><button class="aex-btn aex-btn-ghost" data-a="no" style="color:var(--aex-text);border-color:var(--aex-line)">Annuler</button>' +
      '<button class="aex-btn aex-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.experiences = cur.experiences.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Expérience supprimée', expRef(r) + ' \u00b7 ' + r.candidat + ' @ ' + r.entreprise);
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Exp\u00e9rience supprim\u00e9e', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' exp\u00e9riences ?') : 'Supprimer 1 exp\u00e9rience ?';
    var bd = h('div', { class: 'aex-backdrop', 'data-aex': 'backdrop', 'data-aex-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aex-confirm', 'data-aex': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(expRef(r) + ' ' + r.candidat); }).join(', ') + '. Cette action est d\u00e9finitive.</p>' +
      '<div class="aex-confirm-row"><button class="aex-btn aex-btn-ghost" data-a="no" style="color:var(--aex-text);border-color:var(--aex-line)">Annuler</button>' +
      '<button class="aex-btn aex-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.experiences = cur.experiences.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' exp\u00e9riences');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' exp\u00e9riences supprim\u00e9es', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-aex="seuils"],[data-aex="backdrop"][data-aex-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'aex-backdrop', 'data-aex': 'backdrop', 'data-aex-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'aex-panel', 'data-aex': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="aex-panel-head"><h3>Seuils de pilotage</h3><button class="aex-drawer-x" aria-label="Fermer">\u2715</button></div>' +
      '<div class="aex-panel-body">' +
        '<p class="aex-cibles-note">Ces seuils alimentent les alertes \u00ab longue non v\u00e9rifi\u00e9e \u00bb, \u00ab trous de parcours \u00bb et la d\u00e9tection des dur\u00e9es incoh\u00e9rentes \u2014 r\u00e9glez-les selon la rigueur attendue de vos trajectoires. Persist\u00e9s localement.</p>' +
        '<div class="aex-sim-row"><label for="aex-s1">Exp\u00e9rience longue non v\u00e9rifi\u00e9e (\u2265 mois)</label><input type="range" id="aex-s1" min="6" max="36" step="1" value="' + SEUILS.longNonVerifiee + '"><input class="aex-in" type="number" min="6" max="36" step="1" data-aex="s1n" value="' + SEUILS.longNonVerifiee + '"></div>' +
        '<div class="aex-sim-row"><label for="aex-s2">Trou de parcours signal\u00e9 (&gt; mois entre 2 exp\u00e9riences)</label><input type="range" id="aex-s2" min="3" max="24" step="1" value="' + SEUILS.trouMax + '"><input class="aex-in" type="number" min="3" max="24" step="1" data-aex="s2n" value="' + SEUILS.trouMax + '"></div>' +
        '<div class="aex-sim-row"><label for="aex-s3">Tol\u00e9rance dur\u00e9e d\u00e9clar\u00e9e vs dates (mois)</label><input type="range" id="aex-s3" min="1" max="3" step="1" value="' + SEUILS.tolerance + '"><input class="aex-in" type="number" min="1" max="3" step="1" data-aex="s3n" value="' + SEUILS.tolerance + '"></div>' +
        '<div class="aex-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="aex-btn aex-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.aex-drawer-x', p).addEventListener('click', closeSeuils);
    [['aex-s1', 's1n', 'longNonVerifiee', 6, 36], ['aex-s2', 's2n', 'trouMax', 3, 24], ['aex-s3', 's3n', 'tolerance', 1, 3]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-aex="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.longNonVerifiee = Math.max(6, Math.min(36, Number($('[data-aex="s1n"]', p).value) || SEUILS.longNonVerifiee));
      SEUILS.trouMax = Math.max(3, Math.min(24, Number($('[data-aex="s2n"]', p).value) || SEUILS.trouMax));
      SEUILS.tolerance = Math.max(1, Math.min(3, Number($('[data-aex="s3n"]', p).value) || SEUILS.tolerance));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'longue non v\u00e9rifi\u00e9e \u2265 ' + SEUILS.longNonVerifiee + ' mois \u00b7 trou > ' + SEUILS.trouMax + ' mois \u00b7 tol\u00e9rance ' + SEUILS.tolerance + ' mois');
      toast('Seuils appliqu\u00e9s \u2014 alertes recalcul\u00e9es', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-aex="journal"],[data-aex="backdrop"][data-aex-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'aex-backdrop', 'data-aex': 'backdrop', 'data-aex-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'aex-panel', 'data-aex': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activit\u00e9' });
    p.innerHTML = '<div class="aex-panel-head"><h3>Journal d\u2019activit\u00e9</h3><button class="aex-drawer-x" aria-label="Fermer">\u2715</button></div>' +
      '<div class="aex-panel-body" data-aex="jlist"></div>';
    $('.aex-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-aex="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="aex-jrow"><span class="aex-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="aex-jact">' + esc(x.action || '') + '</span><span class="aex-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="aex-empty">Aucune activit\u00e9 enregistr\u00e9e pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne \u00e0 exporter', 'err'); return; }
    var sep = ';';
    var head = ['N\u00b0', 'Candidat', 'Entreprise', 'Poste', 'Date d\u00e9but', 'Date fin', 'Dur\u00e9e d\u00e9clar\u00e9e', 'Dur\u00e9e calcul\u00e9e', 'V\u00e9rifi\u00e9e', 'Description'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [expRef(r), r.candidat, r.entreprise, r.poste, r.dateDebut, r.dateFin || 'En cours', r.duree, r.calcTxt + (r.encours ? ' (\u00e0 ce jour)' : ''), r.verifiee, r.description];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'experiences-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) export\u00e9e(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-aex="dialog"]') || $('[data-aex="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { setView('parcours'); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { setView('cards'); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { setView('table'); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { openSeuils(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { selectAllVisible(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-aex="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle exp\u00e9rience \u00b7 E export CSV \u00b7 J journal \u00b7 P parcours \u00b7 C cartes \u00b7 T tableau \u00b7 K seuils \u00b7 S tout s\u00e9lectionner \u00b7 / recherche', ''); }
  }
  function selectAllVisible() {
    var vis = filtered().map(function (r) { return String(r.id); });
    var all = vis.length > 0 && vis.every(function (id) { return UI.sel.indexOf(id) > -1; });
    UI.sel = all ? [] : vis.slice();
    toast(all ? 'S\u00e9lection effac\u00e9e' : UI.sel.length + ' exp\u00e9rience(s) s\u00e9lectionn\u00e9e(s)', 'ok');
    refresh();
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

  /* ================= thème (dark auto) ================= */
  function detectTheme() {
    var dark = null;
    try {
      var v = localStorage.getItem('admina-dark');
      if (v === 'true') dark = true;
      else if (v === 'false') dark = false;
    } catch (e) {}
    if (dark === null) {
      var root = $('[data-aex="root"]');
      var elx = root ? root.parentElement : null;
      while (elx && elx !== document.documentElement) {
        var bg = '';
        try { bg = getComputedStyle(elx).backgroundColor || ''; } catch (e2) {}
        var m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?\)/.exec(bg);
        if (m && (m[4] === undefined || parseFloat(m[4]) > 0.5)) {
          dark = (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255 < 0.45;
          break;
        }
        elx = elx.parentElement;
      }
    }
    if (dark === null) {
      try { dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e3) { dark = false; }
    }
    if (dark) html.setAttribute('data-dark', '');
    else html.removeAttribute('data-dark');
  }

  /* ================= UI persist ================= */
  function loadUI() {
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v && typeof v.rpp === 'number') UI.rpp = v.rpp; } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ rpp: UI.rpp })); } catch (e) {} }

  /* ================= refresh global ================= */
  var shellBuilt = false;
  function buildShellOnce() { if (!shellBuilt) { buildShell(); shellBuilt = true; } }
  function refresh() {
    if (!isOn()) return;
    if (!mountRoot()) return;
    buildShellOnce();
    renderHero();
    renderKPIs();
    renderCharts();
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
    if (!document.querySelector('[data-aex="drawer"],[data-aex="dialog"],[data-aex="confirm"],[data-aex="journal"],[data-aex="seuils"]')) {
      $$('[data-aex="backdrop"]').forEach(function (b) { b.remove(); });
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
    html.classList.add('admina-aex');
    shellBuilt = false;
    bootTries = 0;
    UI.view = 'parcours'; /* vue signature par défaut au chargement */
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-aex]')) continue;
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
    html.classList.remove('admina-aex');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils();
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
    var root = $('[data-aex="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-aex-hide', '1');
      natif.setAttribute('data-aex-olddisp', natif.style.display || '');
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

  window.__ADMINA_EXP_UI__ = {
    version: '1.0-w3',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openVerifDialog: openVerifDialog,
    openSeuils: openSeuils,
    openJournal: openJournal,
    setView: setView,
    exportCSV: exportCSV,
    debug: { filtered: filtered, alerts: computeAlerts, parcours: buildParcours, seuils: SEUILS, duree: fmtDuree, calc: fmtDuree, bucketOf: bucketOf, nextId: nextId, vrefFind: vrefFind }
  };
  try { console.info('[ADMINA_EXP] W3-e actif \u2014 Historique professionnel v\u00e9rifi\u00e9 /experiences (vue Parcours par candidat)'); } catch (e) {}
})();
