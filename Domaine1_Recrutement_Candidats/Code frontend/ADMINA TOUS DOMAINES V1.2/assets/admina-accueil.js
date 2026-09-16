/* =============================================================
   Admina-RH — Plan d'Accueil & Formation — couche admina (W2-c)
   M-W2 : CENTRE DE PILOTAGE — Plan d'Accueil & Formation
   PHILOSOPHIE :
   /plan-accueil-formation = le PROGRAMME DE L'ARRIVÉE dans le
   temps : quelles séances de formation sont prévues pour chaque
   nouvel arrivant, avec qui (formateur), quand (semaines 1-4
   d'accueil, dates, heures, durées) et où (salle). C'est un
   AGENDA DE FORMATION — la dimension temporelle est centrale.
   Les trous du programme (nouvel arrivant sans séance planifiée
   dans ses N premiers jours), les collisions (formateur ou salle
   double-bookés) et les séances passées sans compte-rendu sont
   des alertes actionnables. Le programme est planifiable,
   déplaçable, clonable. Ce n'est PAS une checklist d'items
   (W2-b) ni un suivi de parcours (W2-a) : c'est un PLANNING.
   Règle d'or : un programme vivant et actionnable, jamais une
   checklist ni un tableur.
   - Scope strict : /plan-accueil-formation (RE_PAGE réévaluée à
     chaque navigation SPA — interval 350 ms + popstate)
   - Idempotent (data-aac / data-aac-hide), sans collision (__ADMINA_AAC_W2__)
   - Données : window.__ADMINA_AAC_API__ (patch chunk) → fallback
     localStorage admina-accueil-data · 30 réessais au démarrage,
     sinon page native intacte
   - Pont bidirectionnel : subscribe + poller 1,2 s (la vue native
     reflète les séances modifiées et inversement)
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   - Croisements optionnels (silencieux sinon) : __ADMINA_SEL_API__
     (sélections « Retenu ») et __ADMINA_CAND_API__ (candidats
     « Retenu ») → arrivants à programmer
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_AAC_W2__) return;
  window.__ADMINA_AAC_W2__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/plan-accueil-formation\/?$/;
  var LS_DATA = 'admina-accueil-data';
  var LS_UI = 'admina-accueil-ui';
  var LS_SEUILS = 'admina-accueil-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', st: '', ty: '', fo: '', de: '', pd: '', kpi: '', filt: '', view: 'table', mo: 'week', sortKey: 'deb', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, delId: null, sel: [], week: 0 };

  /* ================= seuils ================= */
  var SEUILS_DEF = { delaiPlanif: 5, maxConflits: 0, crDelai: 3 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var STATUTS = [
    { k: 'Terminee', lab: 'Terminée', c: '#059669' },
    { k: 'En cours', lab: 'En cours', c: '#d97706' },
    { k: 'Planifiee', lab: 'Planifiée', c: '#0e7490' },
    { k: 'Annulee', lab: 'Annulée', c: '#dc2626' }
  ];
  function stMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  var MODULES_BASE = [
    'HACCP & Hygiène alimentaire',
    'Management & Leadership',
    'Sage Comptabilité avancée',
    "Techniques d'accueil hôtelier",
    'Sécurité incendie',
    'Protocoles sûreté',
    'Architecture interne & CI/CD',
    'Stratégie réseaux sociaux',
    'SAP Achat',
    'PMS & Réception',
    'Service client & résolution conflits',
    'Anglais hôtelier'
  ];
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
  function hmMin(h) { var m = /^(\d{1,2}):(\d{2})/.exec(String(h || '')); return m ? Number(m[1]) * 60 + Number(m[2]) : 0; }
  function validDate(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (!m) return null;
    var d = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
    if (d.getUTCDate() !== Number(m[1]) || d.getUTCMonth() !== Number(m[2]) - 1) return null;
    return pad2(Number(m[1])) + '/' + pad2(Number(m[2])) + '/' + m[3];
  }
  function jourCourt(ts) { return new Date(ts).toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' }); }
  function jourLong(ts) { return new Date(ts).toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'UTC' }); }
  function dateCourte(ts) { return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }); }
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
  function toastsZone() { var z = $('[data-aac="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-aac', 'toasts'); z.className = 'aac-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'aac-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_AAC_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.sessions && Array.isArray(d.sessions) && d.sessions.length) return true;
    return false;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.sessions) { d = readLS(); }
    if (!d || !d.sessions || !d.sessions.length) return [];
    return d.sessions.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = String(u.id);
      u.duree = (u.duree === null || u.duree === undefined || u.duree === '') ? 0 : (Number(u.duree) || 0);
      u.eval20 = (u.eval20 === null || u.eval20 === undefined || u.eval20 === '') ? null : Number(u.eval20);
      u.heure = String(u.heure || '');
      u.salle = String(u.salle || '');
      u.compteRendu = String(u.compteRendu || '');
      u.ts = tsDH(u.dateDebut);
      var tf = tsDH(u.dateFin);
      u.tsF = tf > u.ts ? tf : u.ts;
      u.tsA = tsDH(u.dateArrivee);
      u.stm = stMeta(u.statut);
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextIdNumero(rows) {
    var mx = 0;
    rows.forEach(function (r) {
      var nid = Number(r.id); if (isFinite(nid)) mx = Math.max(mx, nid);
      var m = /^FMT-(\d+)$/.exec(String(r.numero || ''));
      if (m) mx = Math.max(mx, Number(m[1]));
    });
    mx = mx + 1;
    return { id: mx, numero: 'FMT-' + String(mx).padStart(3, '0') };
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.sessions) { toast('Écriture impossible — recharger la page', 'err'); return false; }
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
    if (cur2 && cur2.sessions) {
      var nv2 = fn(cur2);
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { return false; }
      if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
      refresh();
      return true;
    }
    toast('Écriture impossible — API indisponible', 'err');
    return false;
  }

  /* ================= arrivants & trous du programme ================= */
  function arrivalsMap(rows) {
    var by = {};
    rows.forEach(function (r) {
      var k = norm(r.employe); if (!k) return;
      var b = by[k] = by[k] || { name: r.employe, arrivee: 0, n: 0 };
      if (r.tsA && (!b.arrivee || r.tsA < b.arrivee)) b.arrivee = r.tsA;
      if (r.statut !== 'Annulee' && r.ts) b.n++;
    });
    /* croisements optionnels — silencieux si les ponts ne sont pas là */
    try {
      var sApi = window.__ADMINA_SEL_API__;
      if (sApi && typeof sApi.getData === 'function') {
        var sel = (sApi.getData() || {}).selections || [];
        sel.forEach(function (s) {
          if (!s || s.statut !== 'Retenu') return;
          var k = norm(s.candidat); var t = tsDH(s.dateSelection || s.dateArrivee || s.dateDisponibilite);
          if (!k || !t) return;
          var b = by[k] = by[k] || { name: s.candidat, arrivee: 0, n: 0 };
          if (!b.arrivee || t < b.arrivee) b.arrivee = t;
        });
      }
    } catch (e) {}
    try {
      var cApi = window.__ADMINA_CAND_API__;
      if (cApi && typeof cApi.getData === 'function') {
        var cands = (cApi.getData() || {}).candidats || [];
        cands.forEach(function (c) {
          if (!c || c.statut !== 'Retenu') return;
          var k = norm(c.nom || c.candidat || c.prenom);
          var t = tsDH(c.dateSelection || c.dateArrivee || c.dateDisponibilite || c.dateDispo);
          if (!k || !t) return;
          var b = by[k] = by[k] || { name: c.nom || c.candidat || c.prenom, arrivee: 0, n: 0 };
          if (!b.arrivee || t < b.arrivee) b.arrivee = t;
        });
      }
    } catch (e2) {}
    return by;
  }
  function gapsList(rows) {
    var today = startOfToday();
    var by = arrivalsMap(rows);
    return Object.keys(by).filter(function (k) {
      var b = by[k];
      if (!b.arrivee || b.arrivee > today) return false;
      var winEnd = b.arrivee + SEUILS.delaiPlanif * 86400000;
      var ok = rows.some(function (r) {
        return norm(r.employe) === k && r.statut !== 'Annulee' && r.ts && r.ts <= winEnd && r.tsF >= b.arrivee;
      });
      return !ok;
    }).map(function (k) { return by[k]; });
  }

  /* ================= conflits formateur / salle ================= */
  function interOf(r) {
    if (r.heure && (!r.tsF || r.tsF === r.ts)) {
      var s = r.ts + hmMin(r.heure) * 60000;
      return [s, s + Math.max(1800000, (Number(r.duree) || 0) * 3600000)];
    }
    return [r.ts, Math.max(r.ts, r.tsF || r.ts) + 86399999];
  }
  function interOver(a, b) { return a[0] <= b[1] && b[0] <= a[1]; }
  function conflictMap(rows) {
    var res = {}, groups = {};
    rows.forEach(function (r) {
      if (r.statut === 'Annulee' || !r.ts) return;
      if (r.formateur) { var k1 = 'F|' + norm(r.formateur); (groups[k1] = groups[k1] || []).push(r); }
      if (r.salle) { var k2 = 'S|' + norm(r.salle); (groups[k2] = groups[k2] || []).push(r); }
    });
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      if (g.length < 2) return;
      for (var i = 0; i < g.length; i++) {
        for (var j = i + 1; j < g.length; j++) {
          if (!interOver(interOf(g[i]), interOf(g[j]))) continue;
          var a = g[i], b = g[j];
          res[a.id] = res[a.id] || [];
          if (res[a.id].indexOf(b.numero || ('#' + b.id)) < 0) res[a.id].push(b.numero || ('#' + b.id));
          res[b.id] = res[b.id] || [];
          if (res[b.id].indexOf(a.numero || ('#' + a.id)) < 0) res[b.id].push(a.numero || ('#' + a.id));
        }
      }
    });
    return res;
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var today = startOfToday();
    var gaps = gapsList(rows);
    if (gaps.length) out.push({ tone: 'err', txt: gaps.length + ' nouvel' + (gaps.length > 1 ? 'le' : '') + ' arrivant' + (gaps.length > 1 ? 's' : '') + ' sans séance planifiée dans les ' + SEUILS.delaiPlanif + ' premiers jours — programmer l\u2019accueil (' + gaps.slice(0, 2).map(function (g) { return g.name; }).join(', ') + '…)', f: 'gaps' });
    var noform = rows.filter(function (r) { return (r.statut === 'Planifiee' || r.statut === 'En cours') && !String(r.formateur || '').trim(); });
    if (noform.length) out.push({ tone: 'err', txt: noform.length + ' séance' + (noform.length > 1 ? 's' : '') + ' sans formateur — à assigner avant la date (' + noform.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'noform' });
    var confl = conflictMap(rows);
    var confIds = Object.keys(confl);
    if (confIds.length > SEUILS.maxConflits) out.push({ tone: 'warn', txt: confIds.length + ' séance' + (confIds.length > 1 ? 's' : '') + ' en conflit de créneau — même période avec un formateur ou une salle en commun (' + confIds.slice(0, 3).map(function (id) { return numeroOf(rows, id); }).join(', ') + ')', f: 'conflict' });
    var nosalle = rows.filter(function (r) { return (r.statut === 'Planifiee' || r.statut === 'En cours') && r.tsF >= today && !r.salle; });
    if (nosalle.length) out.push({ tone: 'warn', txt: nosalle.length + ' séance' + (nosalle.length > 1 ? 's' : '') + ' à venir sans salle ni lieu — à affecter (' + nosalle.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'nosalle' });
    var noc = rows.filter(function (r) { return r.statut === 'Terminee' && r.tsF && r.tsF < today - SEUILS.crDelai * 86400000 && !r.compteRendu; });
    if (noc.length) out.push({ tone: 'info', txt: noc.length + ' séance' + (noc.length > 1 ? 's' : '') + ' passée' + (noc.length > 1 ? 's' : '') + ' sans compte-rendu — à consigner (' + noc.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'noc' });
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
    var monday = mondayOf(today);
    var confl = conflictMap(rows);
    var gaps = gapsList(rows);
    var gapK = {}; gaps.forEach(function (g) { gapK[norm(g.name)] = 1; });
    var out = rows.filter(function (r) {
      if (UI.st && r.statut !== UI.st) return false;
      if (UI.ty && r.moduleFormation !== UI.ty) return false;
      if (UI.fo && norm(r.formateur) !== norm(UI.fo)) return false;
      if (UI.de && r.departement !== UI.de) return false;
      if (UI.pd === 'up' && !(r.ts && r.tsF >= today)) return false;
      if (UI.pd === 'past' && !(r.ts && r.tsF < today)) return false;
      if (UI.pd === 'w' && !(r.ts && r.ts <= today + 7 * 86400000 && r.tsF >= today)) return false;
      if (UI.pd === 'today' && !(r.ts && r.ts <= today && r.tsF >= today)) return false;
      if (UI.kpi === 'plan' && r.statut !== 'Planifiee') return false;
      if (UI.kpi === 'enc' && r.statut !== 'En cours') return false;
      if (UI.kpi === 'ter' && r.statut !== 'Terminee') return false;
      if (UI.kpi === 'week' && !(r.statut !== 'Annulee' && r.ts && r.ts <= monday + 7 * 86400000 && r.tsF >= monday)) return false;
      if (UI.filt === 'noform' && !((r.statut === 'Planifiee' || r.statut === 'En cours') && !String(r.formateur || '').trim())) return false;
      if (UI.filt === 'conflict' && !confl[r.id]) return false;
      if (UI.filt === 'nosalle' && !(!r.salle)) return false;
      if (UI.filt === 'noc' && !(r.statut === 'Terminee' && !r.compteRendu)) return false;
      if (UI.filt === 'gaps' && !gapK[norm(r.employe)]) return false;
      if (q && !(norm(r.numero).indexOf(q) > -1 || norm(r.employe).indexOf(q) > -1 || norm(r.poste).indexOf(q) > -1 || norm(r.moduleFormation).indexOf(q) > -1 || norm(r.formateur).indexOf(q) > -1 || norm(r.departement).indexOf(q) > -1 || norm(r.salle).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1 || norm(r.compteRendu).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'deb') { va = a.ts; vb = b.ts; }
      else if (k === 'fin') { va = a.tsF; vb = b.tsF; }
      else if (k === 'dur') { va = a.duree; vb = b.duree; }
      else if (k === 'eval') { va = a.eval20 == null ? -1 : a.eval20; vb = b.eval20 == null ? -1 : b.eval20; }
      else if (k === 'st') { va = stIdx(a.statut); vb = stIdx(b.statut); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return (a.ts || 0) - (b.ts || 0);
    });
    return out;
  }
  function mondayOf(ts) { var d = new Date(ts); var dow = (d.getUTCDay() + 6) % 7; return startOfDay(ts) - dow * 86400000; }
  function stIdx(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return i; } return 99; }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.st ? 1 : 0) + (UI.ty ? 1 : 0) + (UI.fo ? 1 : 0) + (UI.de ? 1 : 0) + (UI.pd ? 1 : 0) + (UI.kpi ? 1 : 0) + (UI.filt ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.st = ''; UI.ty = ''; UI.fo = ''; UI.de = ''; UI.pd = ''; UI.kpi = ''; UI.filt = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Plan\s+d.{1,2}Accueil\s*&\s*Formations/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-aac="root"]');
    if (!root) {
      root = h('section', { 'data-aac': 'root', class: 'aac-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-aac-page')) {
      page.setAttribute('data-aac-page', '1');
      page.setAttribute('data-aac-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-aac-hide')) {
      natif.setAttribute('data-aac-hide', '1');
      natif.setAttribute('data-aac-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-aac="root"]'); if (root) root.remove();
    $$('[data-aac-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-aac-oldw') || '';
      n.removeAttribute('data-aac-page');
      n.removeAttribute('data-aac-oldw');
    });
    $$('[data-aac-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-aac-olddisp') || '';
      n.removeAttribute('data-aac-hide');
      n.removeAttribute('data-aac-olddisp');
    });
    $$('[data-aac]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-aac="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'aac-btn aac-btn-primary aac-backbtn', 'data-aac': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'plan-accueil-formation');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/><path d="M8 15h3"/></svg>',
    seuils: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    week: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 5v5M13 5v5M18 5v5"/></svg>',
    s14: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="4.5" height="16" rx="1"/><rect x="9.75" y="4" width="4.5" height="11" rx="1"/><rect x="16.5" y="4" width="4.5" height="14" rx="1"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  var CAL_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/><path d="M8 15h3M13 15h3"/></svg>';

  function buildShell() {
    var root = $('[data-aac="root"]');
    if (!root || $('[data-aac="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="aac-hero" data-aac="hero">' +
        '<div class="aac-hero-main">' +
          '<div class="aac-hero-title">' +
            '<span class="aac-hero-ico" aria-hidden="true">' + CAL_ICON + '</span>' +
            '<div><h2 class="aac-h2">Centre de pilotage — Plan d\u2019Accueil &amp; Formation</h2>' +
            '<p class="aac-hero-sub" data-aac="herosub"></p></div>' +
          '</div>' +
          '<div class="aac-hero-actions">' +
            '<button class="aac-btn" data-aac="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="aac-btn" data-aac="btn-seuils" title="Seuils du programme (S)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="aac-btn" data-aac="btn-planning" title="Vue planning (P)">' + ICO.cal + 'Planning</button>' +
            '<button class="aac-btn" data-aac="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="aac-btn aac-btn-primary" data-aac="btn-new" title="Nouvelle séance (N)">' + ICO.plus + 'Nouvelle séance</button>' +
          '</div>' +
        '</div>' +
        '<div class="aac-hero-alerts" data-aac="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="aac-kpis" data-aac="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="aac-charts" data-aac="charts">' +
        '<div class="aac-chart-card"><div class="aac-chart-title">Séances par statut</div><div class="aac-donut-wrap" data-aac="donut"></div></div>' +
        '<div class="aac-chart-card"><div class="aac-chart-title">Séances par type de formation</div><div data-aac="bars-ty"></div></div>' +
        '<div class="aac-chart-card"><div class="aac-chart-title">Charge par formateur</div><div data-aac="bars-fo"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="aac-toolbar" data-aac="toolbar">' +
        '<div class="aac-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (employé, module, formateur, salle, notes…)" data-aac="search" aria-label="Rechercher une séance" /></div>' +
        '<select data-aac="f-st" class="aac-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-aac="f-ty" class="aac-sel" aria-label="Filtrer par type de formation"></select>' +
        '<select data-aac="f-fo" class="aac-sel" aria-label="Filtrer par formateur"></select>' +
        '<select data-aac="f-de" class="aac-sel" aria-label="Filtrer par département"></select>' +
        '<select data-aac="f-per" class="aac-sel" aria-label="Filtrer par période"></select>' +
        '<button class="aac-chipbtn" data-aac="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="aac-count" data-aac="count"></span>' +
        '<div class="aac-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="aac-vbtn" data-aac="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="aac-vbtn" data-aac="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
          '<button class="aac-vbtn" data-aac="v-planning" title="Vue planning accueil (P)">' + ICO.week + 'Planning</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-aac="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-aac="selbar"></div>' +

      /* PIED */
      '<div class="aac-foot">Programme de l\u2019arrivée — planifier · déplacer · cloner · rendre compte · journal d\u2019audit actif · <button class="aac-link" data-aac="btn-native">Afficher le tableau natif</button></div>';

    $('[data-aac="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-aac="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-aac="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-aac="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-aac="btn-planning"]', root).addEventListener('click', function () { UI.view = 'planning'; saveUI(); refresh(); });
    $('[data-aac="btn-native"]', root).addEventListener('click', showNative);
    $('[data-aac="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-aac="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-aac="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-aac="f-st"]', root).addEventListener('change', function (e) { UI.st = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aac="f-ty"]', root).addEventListener('change', function (e) { UI.ty = e.target.value; UI.page = 0; refresh(); });
    $('[data-aac="f-fo"]', root).addEventListener('change', function (e) { UI.fo = e.target.value; UI.page = 0; refresh(); });
    $('[data-aac="f-de"]', root).addEventListener('change', function (e) { UI.de = e.target.value; UI.page = 0; refresh(); });
    $('[data-aac="f-per"]', root).addEventListener('change', function (e) { UI.pd = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aac="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-aac="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
    $('[data-aac="v-planning"]', root).addEventListener('click', function () { UI.view = 'planning'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function stats(rows) {
    var plan = rows.filter(function (r) { return r.statut === 'Planifiee'; }).length;
    var enc = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var ter = rows.filter(function (r) { return r.statut === 'Terminee'; }).length;
    var heures = rows.reduce(function (s, r) { return s + (Number(r.duree) || 0); }, 0);
    var evals = rows.filter(function (r) { return r.eval20 != null; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.eval20; }, 0) / evals.length : 0;
    var conf = Object.keys(conflictMap(rows)).length;
    var gaps = gapsList(rows).length;
    var emps = {}, mods = {};
    rows.forEach(function (r) { if (r.employe) emps[r.employe] = 1; if (r.moduleFormation) mods[r.moduleFormation] = 1; });
    return { plan: plan, enc: enc, ter: ter, heures: heures, moy: moy, nEval: evals.length, conf: conf, gaps: gaps, nEmp: Object.keys(emps).length, nMod: Object.keys(mods).length };
  }

  function renderHero() {
    var rows = data();
    var st = stats(rows);
    var sub = rows.length + ' séance' + (rows.length > 1 ? 's' : '') +
      ' · ' + st.plan + ' planifiée' + (st.plan > 1 ? 's' : '') +
      ' · ' + st.conf + ' conflit' + (st.conf > 1 ? 's' : '') +
      ' · ' + st.gaps + ' nouvel' + (st.gaps > 1 ? 'le' : '') + ' arrivant' + (st.gaps > 1 ? 's' : '') + ' sans programme' +
      ' · ' + st.heures + 'h de formation' +
      ' · note moyenne ' + (st.nEval ? st.moy.toFixed(1) : '—') + '/20';
    $('[data-aac="herosub"]').textContent = sub;
    var zone = $('[data-aac="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="aac-alert ' + a.tone + '" data-aac="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.aac-alert', zone).forEach(function (b) {
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
    var st = stats(rows);
    var today = startOfToday();
    var monday = mondayOf(today);
    var sem = rows.filter(function (r) { return r.statut !== 'Annulee' && r.ts && r.ts <= monday + 7 * 86400000 && r.tsF >= monday; }).length;
    var ter = rows.filter(function (r) { return r.statut === 'Terminee'; });
    var crOk = ter.filter(function (r) { return r.compteRendu; }).length;
    var kpis = [
      { k: '', t: 'SÉANCES', v: String(rows.length), s: st.nEmp + ' arrivant(s) · ' + st.nMod + ' module(s)', cls: '' },
      { k: 'plan', t: 'PLANIFIÉES', v: String(st.plan), s: 'à venir & à préparer', cls: '' },
      { k: 'enc', t: 'EN COURS', v: String(st.enc), s: 'parcours en cours', cls: '' },
      { k: 'ter', t: 'TERMINÉES', v: String(st.ter), s: 'CR consigné ' + crOk + '/' + ter.length, cls: '' },
      { k: 'week', t: 'CETTE SEMAINE', v: String(sem), s: 'séances actives sur 7 j', cls: sem === 0 ? 'bad' : '' },
      { k: '', t: 'NOTE MOYENNE', v: (st.nEval ? st.moy.toFixed(1) : '—') + '/20', s: st.nEval + ' évaluée(s) · ' + st.heures + 'h au total', cls: '' }
    ];
    var zone = $('[data-aac="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="aac-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="aac-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="aac-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="aac-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.aac-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.st = ''; UI.ty = ''; UI.fo = ''; UI.de = ''; UI.pd = ''; UI.filt = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Séances par statut">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">' + esc(label) + '</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-aac="donut"]');
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length, 'séances') +
      '<div class="aac-donut-legend">' + parts.map(function (p) {
        return '<span class="aac-dl-item' + (UI.st === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="aac-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="aac-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.aac-dl-item', zone).forEach(function (it) {
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
    if (!items.length) return '<div class="aac-empty">Aucune donnée</div>';
    var mx = 1;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    var H = items.length * rowH + 6;
    var bars = items.map(function (it, i) {
      var y = i * rowH + 5;
      var w = Math.max(2, (it.v / mx) * (W - L - R - 14));
      return '<g class="aac-barg" data-key="' + esc(it.key) + '" role="button" tabindex="0"><title>' + esc(it.name + ' : ' + it.v + (it.labelv ? ' · ' + it.labelv : '')) + '</title>' +
        '<text x="' + (L - 8) + '" y="' + (y + 13) + '" text-anchor="end" class="aac-svg-lab">' + esc(it.name.length > 24 ? it.name.slice(0, 23) + '…' : it.name) + '</text>' +
        '<rect x="' + L + '" y="' + y + '" width="' + (W - L - R) + '" height="17" rx="4" class="aac-svg-track"/>' +
        '<rect x="' + L + '" y="' + y + '" width="' + w + '" height="17" rx="4" class="aac-svg-fill"/>' +
        '<text x="' + (L + w + 6) + '" y="' + (y + 13) + '" class="aac-svg-val">' + it.v + '</text></g>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Répartition">' + bars + '</svg>';
  }

  function renderBars() {
    var rows = data();
    var z1 = $('[data-aac="bars-ty"]');
    var items1 = MODULES_BASE.map(function (m) { return m; })
      .concat(rows.map(function (r) { return r.moduleFormation; }).filter(Boolean))
      .filter(function (v, i, a) { return a.indexOf(v) === i; })
      .map(function (m) {
        var sub = rows.filter(function (r) { return r.moduleFormation === m; });
        return { key: m, name: m, v: sub.length };
      }).filter(function (x) { return x.v > 0; }).sort(function (a, b) { return b.v - a.v; });
    z1.innerHTML = barsSvg(items1);
    $$('.aac-barg', z1).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.ty = UI.ty === k ? '' : k;
        UI.page = 0;
        refresh();
      });
    });
    var z2 = $('[data-aac="bars-fo"]');
    var map2 = {};
    rows.forEach(function (r) {
      var k = norm(r.formateur); if (!k) return;
      if (!map2[k]) map2[k] = { key: r.formateur, name: r.formateur, v: 0, h: 0 };
      map2[k].v++; map2[k].h += Number(r.duree) || 0;
    });
    var items2 = Object.keys(map2).map(function (k) { return map2[k]; }).map(function (x) { return { key: x.key, name: x.name, v: x.v, labelv: x.h + 'h' }; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    z2.innerHTML = barsSvg(items2);
    $$('.aac-barg', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.fo = UI.fo === k ? '' : k;
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var mods = {};
    var fos = {};
    var des = {};
    rows.forEach(function (r) { if (r.moduleFormation) mods[r.moduleFormation] = 1; if (r.formateur) fos[r.formateur] = 1; if (r.departement) des[r.departement] = 1; });
    var sel = $('[data-aac="f-st"]');
    sel.innerHTML = '<option value="">Statut : tous</option>' + STATUTS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.st === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-aac="f-ty"]');
    sel2.innerHTML = '<option value="">Type : tous</option>' + Object.keys(mods).sort().map(function (m) {
      return '<option value="' + esc(m) + '"' + (UI.ty === m ? ' selected' : '') + '>' + esc(m) + '</option>';
    }).join('');
    var sel3 = $('[data-aac="f-fo"]');
    sel3.innerHTML = '<option value="">Formateur : tous</option>' + Object.keys(fos).sort().map(function (f) {
      return '<option value="' + esc(f) + '"' + (UI.fo === f ? ' selected' : '') + '>' + esc(f) + '</option>';
    }).join('');
    var sel4 = $('[data-aac="f-de"]');
    sel4.innerHTML = '<option value="">Département : tous</option>' + Object.keys(des).sort().map(function (d) {
      return '<option value="' + esc(d) + '"' + (UI.de === d ? ' selected' : '') + '>' + esc(d) + '</option>';
    }).join('');
    var sel5 = $('[data-aac="f-per"]');
    sel5.innerHTML = '<option value="">Période : toutes</option>' +
      '<option value="up"' + (UI.pd === 'up' ? ' selected' : '') + '>À venir</option>' +
      '<option value="w"' + (UI.pd === 'w' ? ' selected' : '') + '>7 prochains jours</option>' +
      '<option value="today"' + (UI.pd === 'today' ? ' selected' : '') + '>Aujourd\u2019hui</option>' +
      '<option value="past"' + (UI.pd === 'past' ? ' selected' : '') + '>Passées</option>';
    $('[data-aac="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-aac="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' séances';
  }

  function statutChip(r) {
    var sm = r.stm || stMeta(r.statut);
    return '<span class="aac-chip" style="background:' + sm.c + '18;border:1px solid ' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function confChip(r, confl) {
    if (!confl || !confl[r.id]) return '';
    return '<span class="aac-chip cfl" title="Conflit de créneau avec ' + esc(confl[r.id].join(', ')) + '">⚠ conflit</span>';
  }
  function evalCell(r) {
    if (r.eval20 == null) return '<span class="aac-score zero" title="Non évaluée">—</span>';
    var cls = r.eval20 >= 15 ? ' hi' : ' mid';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="aac-score' + cls + '">' + r.eval20 + '</span>' +
      '<span class="aac-scorebar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(r.eval20 / 20 * 100)) + '%"></i></span></span>';
  }
  function crCell(r) {
    if (r.statut !== 'Terminee') return '<span class="aac-num" title="Le compte-rendu se consigne après la séance">—</span>';
    return r.compteRendu
      ? '<span class="aac-chip ok" title="' + esc(String(r.compteRendu).slice(0, 120)) + '">CR ✓</span>'
      : '<span class="aac-chip warn" title="Compte-rendu manquant">⚠ sans CR</span>';
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var confl = conflictMap(all);
    var st = stats(all);
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var as = key && key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : null;
      return '<th' + (key ? ' data-sort="' + key + '"' + (as ? ' aria-sort="' + as + '"' : '') : '') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="aac-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'aac-th-chk') + th('N°', 'numero') + th('Employé', 'employe') + th('Poste', 'poste') +
      th('Module de formation', 'moduleFormation') + th('Formateur', 'formateur') + th('Début', 'deb') + th('Fin', 'fin') +
      th('Durée (h)', 'dur', 'aac-right') + th('Salle / lieu', 'salle') + th('Statut', 'st') + th('Éval. /20', 'eval', 'aac-right') + th('Compte-rendu', null) + th('Département', 'departement') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="aac-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.numero) + '"></td>' +
        '<td class="aac-num">' + esc(r.numero || '') + '</td>' +
        '<td><span class="aac-cand" data-open="' + esc(r.id) + '">' + esc(r.employe || '—') + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.poste || '—') + '</td>' +
        '<td style="max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(r.moduleFormation || '') + '">' + esc(r.moduleFormation || '—') + '</td>' +
        '<td>' + esc(r.formateur || '⚠ aucun') + '</td>' +
        '<td class="aac-num">' + esc(r.dateDebut || '—') + (r.ts ? ' <span class="aac-num">(' + esc(jourCourt(r.ts)) + '.)</span>' : '') + ' ' + confChip(r, confl) + '</td>' +
        '<td class="aac-num">' + esc(r.dateFin || r.dateDebut || '—') + '</td>' +
        '<td class="aac-right">' + (r.duree ? r.duree + 'h' : '—') + '</td>' +
        '<td>' + (r.salle ? esc(r.salle) : '<span class="aac-num" title="Aucune salle affectée">⚠ —</span>') + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td class="aac-right">' + evalCell(r) + '</td>' +
        '<td>' + crCell(r) + '</td>' +
        '<td>' + esc(r.departement || '—') + '</td>' +
        '<td><div class="aac-actions">' +
          '<button class="aac-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aac-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aac-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (autre date)">' + ICO.dup + '</button>' +
          '<button class="aac-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="aac-tfoot"><td></td><td colspan="14">TOTAL ' + all.length + ' séances · ' + st.plan + ' planifiée(s) · ' + st.enc + ' en cours · ' + st.ter + ' terminée(s) · ' + st.heures + 'h · note moyenne ' + (st.nEval ? st.moy.toFixed(1) : '—') + '/20</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="aac-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="aac-sel" data-aac="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="aac-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="aac-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-aac="content"]');
    card.innerHTML = '<div class="aac-tblcard"><div class="aac-tblwrap"><table class="aac-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="15"><div class="aac-empty">Aucune séance ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'employe' || k === 'numero' || k === 'poste' || k === 'moduleFormation' || k === 'formateur' || k === 'salle' || k === 'departement' ? 1 : (k === 'deb' ? 1 : -1); }
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
    var perSel = $('[data-aac="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var confl = conflictMap(data());
    var card = $('[data-aac="content"]');
    card.innerHTML = rows.length ? '<div class="aac-cards">' + rows.map(function (r) {
      return '<div class="aac-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="aac-card-top"><div><input type="checkbox" class="aac-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="aac-num">' + esc(r.numero || '') + '</span></div>' +
        statutChip(r) + '</div>' +
        '<div class="aac-card-name" data-open="' + esc(r.id) + '">' + esc(r.employe || '—') + '</div>' +
        '<div class="aac-card-when">' + esc(r.dateDebut || '—') + (r.dateFin && r.dateFin !== r.dateDebut ? ' → ' + esc(r.dateFin) : '') +
        (r.heure ? ' · <span class="aac-num">' + esc(r.heure) + '</span>' : '') +
        (r.ts ? ' <span class="aac-num">(' + esc(jourCourt(r.ts)) + '.)</span>' : '') + '</div>' +
        '<div class="aac-card-meta">' + confChip(r, confl) +
        (r.moduleFormation ? '<span class="aac-chip info">' + esc(r.moduleFormation) + '</span>' : '') +
        (r.departement ? '<span class="aac-chip neutral">' + esc(r.departement) + '</span>' : '') + '</div>' +
        '<div class="aac-card-struct"><span style="font-size:.76rem;color:var(--aac-text2)">' + esc(r.formateur || '⚠ aucun formateur') + ' · ' + esc(r.salle || '⚠ sans salle') + ' · ' + (r.duree ? r.duree + 'h' : '—') + '</span>' +
        '<span>' + evalCell(r) + '</span></div>' +
        '<div class="aac-card-foot"><span class="aac-num">' + esc(r.compteRendu ? 'CR ✓' : (r.poste || '—')) + '</span>' +
        '<div class="aac-card-act">' +
          '<button class="aac-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aac-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aac-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (autre date)">' + ICO.dup + '</button>' +
          '<button class="aac-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="aac-empty">Aucune séance ne correspond aux filtres</div>';
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

  /* ================= VUE PLANNING ACCUEIL (signature) ================= */
  function slotHtml(r, confl) {
    var stm = r.stm;
    var late = r.statut === 'Planifiee' && r.tsF < startOfToday();
    var off = r.statut === 'Annulee';
    return '<div class="aac-slot' + (off ? ' off' : '') + (late ? ' late' : '') + '" style="border-left-color:' + stm.c + '" data-open="' + esc(r.id) + '" role="button" tabindex="0" title="' + esc(r.employe + ' — ' + r.moduleFormation + ' — ' + r.dateDebut + (r.heure ? ' ' + r.heure : '') + ' — ' + stm.lab) + '">' +
      '<div class="aac-slot-top"><span class="aac-slot-time">' + esc(r.heure || 'journée') + '</span><span class="aac-slot-dur">' + (r.duree ? r.duree + 'h' : '') + '</span></div>' +
      '<div class="aac-slot-name">' + esc(r.employe || '—') + '</div>' +
      '<div class="aac-slot-meta">' + esc(r.moduleFormation || '—') + (confl[r.id] ? ' · <b class="aac-cfl">⚠ conflit</b>' : '') + '</div>' +
      '<div class="aac-slot-loc">' + esc((r.formateur || '⚠ sans formateur') + ' · ' + (r.salle || '⚠ sans salle')) + '</div>' +
    '</div>';
  }

  function renderPlanning() {
    var card = $('[data-aac="content"]');
    var rows = filtered();
    var all = data();
    var confl = conflictMap(all);
    var today = startOfToday();
    if (!UI.week) UI.week = today;
    var monday = mondayOf(UI.week);
    var st = stats(all);
    var modeBtn = function (mo, lab, ico) {
      return '<button class="aac-modebtn' + (UI.mo === mo ? ' on' : '') + '" data-mo="' + mo + '">' + ico + lab + '</button>';
    };
    var navStep = UI.mo === 's14' ? 28 : 7;
    var lbl, cols, info;
    if (UI.mo === 's14') {
      var w2 = monday + 28 * 86400000;
      lbl = 'Semaines d\u2019accueil du ' + new Date(monday).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }) +
        ' au ' + new Date(w2 - 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
      var inView = 0;
      cols = [0, 1, 2, 3].map(function (wi) {
        var ws = monday + wi * 7 * 86400000;
        var we = ws + 7 * 86400000;
        var inRows = rows.filter(function (r) { return r.ts >= ws && r.ts < we; }).sort(function (a, b) { return (a.ts - b.ts) || (hmMin(a.heure) - hmMin(b.heure)); });
        inView += inRows.length;
        var isCur = today >= ws && today < we;
        var d1 = new Date(ws).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
        var d2 = new Date(we - 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
        var slots = inRows.map(function (r) {
          return '<div class="aac-slot" style="border-left-color:' + r.stm.c + '" data-open="' + esc(r.id) + '" role="button" tabindex="0" title="' + esc(r.employe + ' — ' + r.moduleFormation + ' — ' + r.dateDebut + ' — ' + r.stm.lab) + '">' +
            '<div class="aac-slot-top"><span class="aac-slot-time">' + esc(dateCourte(r.ts)) + (r.heure ? ' · ' + esc(r.heure) : '') + '</span><span class="aac-slot-dur">' + (r.duree ? r.duree + 'h' : '') + '</span></div>' +
            '<div class="aac-slot-name">' + esc(r.employe || '—') + '</div>' +
            '<div class="aac-slot-meta">' + esc(r.moduleFormation || '—') + (confl[r.id] ? ' · <b class="aac-cfl">⚠ conflit</b>' : '') + '</div>' +
            '<div class="aac-slot-loc">' + esc(r.formateur || '⚠ sans formateur') + '</div>' +
          '</div>';
        }).join('');
        return '<div class="aac-s4col' + (isCur ? ' today' : '') + '">' +
          '<button class="aac-day-h" data-day="' + esc(pad2(new Date(ws).getUTCDate()) + '/' + pad2(new Date(ws).getUTCMonth() + 1) + '/' + new Date(ws).getUTCFullYear()) + '" title="Planifier une séance cette semaine">Semaine ' + (wi + 1) + ' <b>' + esc(d1) + ' – ' + esc(d2) + '</b><span class="aac-day-n">' + (inRows.length || '') + '</span></button>' +
          '<div class="aac-day-b">' + (slots || '<div class="aac-day-none">aucune séance</div>') + '</div></div>';
      }).join('');
      var hors = rows.length - inView;
      info = inView + ' séance(s) sur la période' + (hors > 0 ? ' · ' + hors + ' hors des 4 semaines affichées' : '') +
        ' · ' + st.conf + ' conflit(s) · cliquez un créneau pour l\u2019ouvrir · cliquez un en-tête pour planifier';
    } else {
      var monday2 = monday + 6 * 86400000;
      lbl = 'Semaine du ' + new Date(monday).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }) +
        ' au ' + new Date(monday2).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
      var nbWeek = rows.filter(function (r) { return r.tsF >= monday && r.ts < monday + 7 * 86400000; }).length;
      cols = [0, 1, 2, 3, 4, 5, 6].map(function (idx) {
        var ts = monday + idx * 86400000;
        var dt = new Date(ts);
        var isToday = ts === today;
        var inRows = rows.filter(function (r) { return r.ts <= ts + 86399999 && r.tsF >= ts; }).sort(function (a, b) { return (a.ts - b.ts) || (hmMin(a.heure) - hmMin(b.heure)); });
        var slots = inRows.map(function (r) { return slotHtml(r, confl); }).join('');
        var dateStr = pad2(dt.getUTCDate()) + '/' + pad2(dt.getUTCMonth() + 1) + '/' + dt.getUTCFullYear();
        return '<div class="aac-day' + (isToday ? ' today' : '') + '">' +
          '<button class="aac-day-h" data-day="' + esc(dateStr) + '" title="Planifier une séance le ' + esc(dateStr) + '">' + JOURS[idx] + ' <b>' + dt.getUTCDate() + '</b><span class="aac-day-n">' + (inRows.length || '') + '</span></button>' +
          '<div class="aac-day-b">' + (slots || '<div class="aac-day-none">libre</div>') + '</div></div>';
      }).join('');
      info = nbWeek + ' séance(s) sur la semaine · cliquez un créneau pour l\u2019ouvrir · cliquez un jour pour planifier';
    }
    card.innerHTML = '<div class="aac-tblcard" style="overflow:visible">' +
      '<div class="aac-weekbar">' +
        '<div class="aac-weeknav">' +
          '<span class="aac-modes" role="group" aria-label="Granularité du planning">' +
            modeBtn('week', 'Semaine', ICO.week) +
            modeBtn('s14', 'Semaines 1-4', ICO.s14) +
          '</span>' +
          '<button class="aac-pgbtn" data-wk="-' + navStep + '" aria-label="Période précédente">‹</button>' +
          '<button class="aac-chipbtn" data-wk="0">Cette semaine</button>' +
          '<button class="aac-pgbtn" data-wk="' + navStep + '" aria-label="Période suivante">›</button>' +
          '<span class="aac-week-lbl">' + esc(lbl) + '</span>' +
        '</div>' +
        '<span class="aac-week-info">' + esc(info) + '</span>' +
      '</div>' +
      '<div class="aac-weekwrap"><div class="aac-week' + (UI.mo === 's14' ? ' s14' : '') + '">' + cols + '</div></div></div>';
    $$('[data-mo]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.mo = b.getAttribute('data-mo'); saveUI(); refresh(); });
    });
    $$('[data-wk]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var n = Number(b.getAttribute('data-wk'));
        UI.week = n === 0 ? startOfToday() : monday + n * 86400000;
        refresh();
      });
    });
    $$('[data-day]', card).forEach(function (b) {
      b.addEventListener('click', function () { openDialog(null, b.getAttribute('data-day')); });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
  }

  function renderSelBar() {
    var zone = $('[data-aac="selbar"]');
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    zone.innerHTML = '<div class="aac-selbar">' +
      '<span class="aac-selbar-info">' + UI.sel.length + ' sélectionnée' + (UI.sel.length > 1 ? 's' : '') + '</span>' +
      '<button class="aac-btn aac-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="aac-btn aac-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="aac-btn aac-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer fiche séance ================= */
  function closeDrawer() { $$('[data-aac="drawer"],[data-aac="backdrop"][data-aac-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'aac-backdrop', 'data-aac': 'backdrop', 'data-aac-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var stm = r.stm;
    var confl = conflictMap(data())[r.id];
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var crBlock =
      '<div class="aac-fsec">Compte-rendu de séance</div>' +
      (r.statut !== 'Terminee' ? '<p style="font-size:.76rem;color:var(--aac-text2);margin:4px 0">Le compte-rendu se consigne une fois la séance passée — passez le statut à « Terminée ».</p>' : '') +
      '<textarea class="aac-notebox" data-aac="crbox" placeholder="Déroulé, participation, points à reprendre…">' + esc(r.compteRendu || '') + '</textarea>' +
      '<div class="aac-evalrow">' +
        '<label class="aac-lab">Évaluation /20<input class="aac-in" type="number" min="0" max="20" step="0.5" data-aac="eval-n" value="' + (r.eval20 == null ? '' : esc(r.eval20)) + '" placeholder="—"></label>' +
        '<button class="aac-btn aac-btn-ghost" data-act="cr" style="color:var(--aac-text);border-color:var(--aac-line)">Enregistrer CR & éval.</button>' +
      '</div>';
    /* programme de l'arrivée — toutes les séances de cet employé */
    var peers = data().filter(function (x) { return norm(x.employe) === norm(r.employe) && x.statut !== 'Annulee'; })
      .sort(function (a, b) { return a.ts - b.ts; });
    var progRows = [];
    if (r.tsA) progRows.push('<div class="aac-prog-arr">→ Arrivée le <b>' + esc(r.dateArrivee) + '</b></div>');
    peers.forEach(function (p) {
      var wk = r.tsA ? Math.floor((startOfDay(p.ts) - startOfDay(r.tsA)) / (7 * 86400000)) + 1 : null;
      progRows.push('<div class="aac-prog-row' + (String(p.id) === String(id) ? ' now' : '') + '">' +
        '<span class="aac-prog-dot" style="background:' + (p.stm || stMeta(p.statut)).c + '"></span>' +
        '<span class="aac-prog-lab">' + esc(p.numero || '') + ' · ' + esc(p.moduleFormation || '—') + '</span>' +
        '<span class="aac-prog-meta">' + esc(p.dateDebut + (p.dateFin && p.dateFin !== p.dateDebut ? ' → ' + p.dateFin : '')) +
        (wk && wk >= 1 ? ' · S' + wk : '') + ' · ' + esc((p.stm || stMeta(p.statut)).lab) + '</span></div>');
    });
    var progBlock = '<div class="aac-fsec">Programme de l\u2019arrivée — ' + esc(r.employe || '—') + '</div>' +
      '<div class="aac-prog">' + (progRows.join('') || '<div class="aac-num">Aucune autre séance pour cet arrivant.</div>') + '</div>';
    var dr = h('aside', { class: 'aac-drawer', 'data-aac': 'drawer', role: 'dialog', 'aria-label': 'Fiche séance ' + r.numero });
    dr.innerHTML =
      '<div class="aac-drawer-head"><div><div class="aac-drawer-title">' + esc(r.employe || '—') + '</div>' +
      '<div class="aac-drawer-sub">' + esc(r.numero || '') + ' · ' + esc(r.moduleFormation || '—') + ' · ' + esc(r.poste || '—') + '</div></div>' +
      '<button class="aac-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aac-drawer-body">' +
        '<div class="aac-live" style="margin-top:0"><span>Statut <b style="color:' + stm.c + '">' + esc(stm.lab) + '</b></span>' +
          '<span>Évaluation <b>' + (r.eval20 == null ? '—' : r.eval20 + '/20') + '</b></span>' +
          '<span>Durée <b>' + (r.duree ? r.duree + 'h' : '—') + '</b></span>' +
          '<span>Arrivé le <b>' + esc(r.dateArrivee || '—') + '</b></span></div>' +
        (confl && confl.length ? '<div class="aac-confwarn">⚠ Conflit de créneau avec ' + esc(confl.join(', ')) + ' — même période, formateur ou salle en commun.</div>' : '') +
        '<div class="aac-fsec">Séance & programme</div>' +
        '<dl class="aac-kv">' +
          kv('Module', esc(r.moduleFormation || '—')) +
          kv('Formateur', esc(r.formateur || '⚠ aucun')) +
          kv('Début', esc(r.dateDebut || '—') + (r.ts ? ' <span class="aac-num">(' + esc(jourLong(r.ts)) + ')</span>' : '')) +
          kv('Fin', esc(r.dateFin || r.dateDebut || '—') + (r.tsF && r.tsF !== r.ts ? ' <span class="aac-num">(' + esc(jourLong(r.tsF)) + ')</span>' : '')) +
          kv('Heure', esc(r.heure || 'journée')) +
          kv('Durée', r.duree ? r.duree + 'h' : '—') +
          kv('Salle / lieu', r.salle ? esc(r.salle) : '<span style="color:var(--aac-warn)">⚠ non affectée</span>') +
          kv('Département', esc(r.departement || '—')) +
        '</dl>' +
        '<div class="aac-fsec">Participants</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="aac-chip info">' + esc(r.employe || '—') + ' (nouvel arrivant)</span>' +
        '<span class="aac-chip neutral">' + esc(r.formateur || '⚠ formateur à assigner') + '</span></div>' +
        progBlock +
        '<div class="aac-fsec">Compte-rendu</div>' + crBlock +
        '<div class="aac-fsec">Notes</div>' +
        '<textarea class="aac-notebox" data-aac="note" placeholder="Prérequis, matériel, remarques…">' + esc(r.notes || '') + '</textarea>' +
        '<div class="aac-fsec">Statut</div>' +
        '<div class="aac-sim-row" style="margin-bottom:10px"><label for="aac-stsel">Changer le statut</label>' +
          '<select id="aac-stsel" class="aac-in" data-aac="stsel">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="aac-drawer-actions">' +
          '<button class="aac-btn aac-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="aac-btn aac-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="aac-btn aac-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="aac-btn aac-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.aac-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-aac="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      mutate(function (cur) {
        cur.sessions = cur.sessions.map(function (x) { if (String(x.id) === String(id)) x.statut = nv; return x; });
        return cur;
      }, 'Statut modifié', r.numero + ' → ' + stMeta(nv).lab);
      toast('Statut : ' + stMeta(nv).lab, 'ok');
    });
    $('[data-act="cr"]', dr).addEventListener('click', function () {
      var crv = $('[data-aac="crbox"]', dr).value;
      var sv = $('[data-aac="eval-n"]', dr).value;
      var sc = String(sv).trim() === '' ? null : Number(sv);
      if (sc != null && (!isFinite(sc) || sc < 0 || sc > 20)) { toast('L\u2019évaluation doit être comprise entre 0 et 20', 'err'); return; }
      mutate(function (cur) {
        cur.sessions = cur.sessions.map(function (x) { if (String(x.id) === String(id)) { x.compteRendu = crv; x.eval20 = sc; } return x; });
        return cur;
      }, 'Compte-rendu enregistré', r.numero + (sc == null ? '' : ' · éval ' + sc + '/20'));
      toast('Compte-rendu enregistré', 'ok');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-aac="note"]', dr).value;
      mutate(function (cur) {
        cur.sessions = cur.sessions.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
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
  function closeDialog() { $$('[data-aac="dialog"],[data-aac="backdrop"][data-aac-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId, presetDate) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var initDate = r ? String(r.dateDebut || '') : (presetDate || '');
    var initHeure = r ? (r.heure || (editId ? '' : '09:00')) : '09:00';
    /* date d'arrivée pré-remplie depuis les autres séances du même employé */
    var initArrivee = r ? String(r.dateArrivee || '') : '';
    if (!initArrivee) {
      var emp = v('employe');
      if (emp) {
        var peer = rows.filter(function (x) { return norm(x.employe) === norm(emp) && x.dateArrivee; })[0];
        if (peer) initArrivee = String(peer.dateArrivee || '');
      }
    }
    var bd = h('div', { class: 'aac-backdrop', 'data-aac': 'backdrop', 'data-aac-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'aac-dialog', 'data-aac': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une séance' : 'Nouvelle séance' });
    var emps = {}, posts = {}, mods = {}, forms = {}, deps = {}, salles = {};
    rows.forEach(function (x) {
      if (x.employe) emps[x.employe] = 1;
      if (x.poste) posts[x.poste] = 1;
      if (x.moduleFormation) mods[x.moduleFormation] = 1;
      if (x.formateur) forms[x.formateur] = 1;
      if (x.departement) deps[x.departement] = 1;
      if (x.salle) salles[x.salle] = 1;
    });
    MODULES_BASE.forEach(function (m) { mods[m] = 1; });
    /* croisements optionnels : arrivants à programmer (sélections/candidats retenus) */
    try {
      var sApi = window.__ADMINA_SEL_API__;
      if (sApi && typeof sApi.getData === 'function') {
        ((sApi.getData() || {}).selections || []).forEach(function (s) { if (s && s.statut === 'Retenu' && s.candidat) emps[s.candidat] = 1; });
      }
    } catch (e) {}
    try {
      var cApi = window.__ADMINA_CAND_API__;
      if (cApi && typeof cApi.getData === 'function') {
        ((cApi.getData() || {}).candidats || []).forEach(function (c) { if (c && c.statut === 'Retenu') { var nm = c.nom || c.candidat || c.prenom; if (nm) emps[nm] = 1; } });
      }
    } catch (e2) {}
    function dl(id, arr) {
      return '<datalist id="' + id + '">' + Object.keys(arr).sort().map(function (x) { return '<option value="' + esc(x) + '"></option>'; }).join('') + '</datalist>';
    }
    dlg.innerHTML =
      '<div class="aac-dialog-head"><h3>' + (r ? 'Modifier la séance ' + esc(r.numero || '') : 'Nouvelle séance d\u2019accueil') + '</h3>' +
      '<button class="aac-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aac-dialog-body">' +
        '<div class="aac-fgrid">' +
          '<label class="aac-lab">Employé (nouvel arrivant) *<input class="aac-in" data-f="employe" value="' + esc(v('employe')) + '" placeholder="Ex. Nkoulou Amina" list="aac-dl-emp"></label>' +
          '<label class="aac-lab">Poste<input class="aac-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Chef Cuisinier" list="aac-dl-poste"></label>' +
          '<label class="aac-lab full">Module de formation *<input class="aac-in" data-f="moduleFormation" value="' + esc(v('moduleFormation')) + '" placeholder="Ex. HACCP & Hygiène alimentaire" list="aac-dl-mod"></label>' +
          '<label class="aac-lab">Formateur *<input class="aac-in" data-f="formateur" value="' + esc(v('formateur')) + '" placeholder="Ex. M. Fotso André" list="aac-dl-form"></label>' +
          '<label class="aac-lab">Département<input class="aac-in" data-f="departement" value="' + esc(v('departement')) + '" placeholder="Ex. Restauration" list="aac-dl-dep"></label>' +
          '<label class="aac-lab">Date début * (jj/mm/aaaa)<input class="aac-in" data-f="dateDebut" value="' + esc(initDate) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="aac-lab">Heure *<input class="aac-in" type="time" data-f="heure" value="' + esc(initHeure) + '"></label>' +
          '<label class="aac-lab">Durée (heures) *<input class="aac-in" type="number" min="1" max="400" step="1" data-f="duree" value="' + esc(r ? (r.duree || '') : '18') + '" placeholder="Ex. 18"></label>' +
          '<label class="aac-lab">Date fin (si plusieurs jours)<input class="aac-in" data-f="dateFin" value="' + esc(r ? String(r.dateFin || '') : '') + '" placeholder="jj/mm/aaaa (vide = même jour)"></label>' +
          '<label class="aac-lab">Salle / lieu<input class="aac-in" data-f="salle" value="' + esc(v('salle')) + '" placeholder="Salle, atelier, visio…" list="aac-dl-salle"></label>' +
          '<label class="aac-lab">Statut<select class="aac-in" data-f="statut">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + ((r ? v('statut') : 'Planifiee') === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></label>' +
          '<label class="aac-lab">Évaluation /20<input class="aac-in" type="number" min="0" max="20" step="0.5" data-f="eval20" value="' + (r && r.eval20 != null ? esc(r.eval20) : '') + '" placeholder="—"></label>' +
          '<label class="aac-lab">Date d\u2019arrivée de l\u2019employé<input class="aac-in" data-f="dateArrivee" value="' + esc(initArrivee) + '" placeholder="jj/mm/aaaa (calendrier d\u2019accueil)"></label>' +
          '<label class="aac-lab full">Compte-rendu<textarea class="aac-in aac-ta" data-f="compteRendu" placeholder="Se consigne après la séance…">' + esc(v('compteRendu')) + '</textarea></label>' +
          '<label class="aac-lab full">Notes<textarea class="aac-in aac-ta" data-f="notes" placeholder="Prérequis, matériel, remarques…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        dl('aac-dl-emp', emps) + dl('aac-dl-poste', posts) + dl('aac-dl-mod', mods) + dl('aac-dl-form', forms) + dl('aac-dl-dep', deps) + dl('aac-dl-salle', salles) +
        '<div class="aac-live" data-aac="dlg-live"></div>' +
        '<div data-aac="dlg-err"></div>' +
      '</div>' +
      '<div class="aac-dialog-foot"><span class="aac-form-hint">Programme de l\u2019arrivée · les conflits formateur/salle sont signalés en direct · le compte-rendu clôt la séance</span>' +
      '<span style="display:flex;gap:8px"><button class="aac-btn aac-btn-ghost" data-act="cancel" style="color:var(--aac-text);border-color:var(--aac-line)">Annuler</button>' +
      '<button class="aac-btn aac-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Planifier la séance') + '</button></span></div>';
    $('.aac-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var ts = tsDH(val.dateDebut);
      var tsf = tsDH(val.dateFin) || ts;
      var durH = Number(val.duree) || 0;
      var hm = hmMin(val.heure);
      /* conflits en direct : même formateur ou même salle, période qui chevauche */
      var nconf = 0;
      if (ts && (val.formateur || val.salle)) {
        var a0 = (val.heure && tsf === ts) ? ts + hm * 60000 : ts;
        var a1 = (val.heure && tsf === ts) ? Math.max(a0 + 1, a0 + durH * 3600000) : Math.max(ts, tsf) + 86399999;
        rows.forEach(function (x) {
          if (!x.ts || x.statut === 'Annulee' || String(x.id) === String(editId || '')) return;
          var same = (val.formateur && norm(x.formateur) === norm(val.formateur)) || (val.salle && norm(x.salle) === norm(val.salle));
          if (!same) return;
          var b0 = (x.heure && x.tsF === x.ts) ? x.ts + hmMin(x.heure) * 60000 : x.ts;
          var b1 = (x.heure && x.tsF === x.ts) ? Math.max(b0 + 1, b0 + (x.duree || 0) * 3600000) : x.tsF + 86399999;
          if (a0 <= b1 && b0 <= a1) nconf++;
        });
      }
      /* semaine d'accueil */
      var arrTs = tsDH(val.dateArrivee);
      var wkLbl = '—';
      if (ts && arrTs) {
        var wk = Math.floor((startOfDay(ts) - startOfDay(arrTs)) / (7 * 86400000)) + 1;
        wkLbl = wk <= 0 ? 'avant l\u2019arrivée' : 'semaine ' + wk + ' de l\u2019accueil';
      }
      $('[data-aac="dlg-live"]', dlg).innerHTML =
        '<span>Période <b>' + (ts ? esc(val.dateDebut + (val.heure ? ' ' + val.heure : '')) + (tsf !== ts ? ' → ' + esc(val.dateFin) : '') : 'à compléter') + '</b></span>' +
        '<span>Durée <b>' + (durH ? durH + 'h' : '—') + '</b></span>' +
        '<span>Statut <b>' + esc(val.statut ? stMeta(val.statut).lab : '—') + '</b></span>' +
        (arrTs ? '<span>Semaine d\u2019accueil <b>' + esc(wkLbl) + '</b></span>' : '') +
        (nconf ? '<span class="bad">⚠ ' + nconf + ' conflit(s) formateur/salle sur cette période</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-aac="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="aac-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.employe || '').trim()) return fail('L\u2019employé (nouvel arrivant) est obligatoire.');
      if (!String(val.moduleFormation || '').trim()) return fail('Le module de formation est obligatoire.');
      if (!String(val.formateur || '').trim()) return fail('Le formateur est obligatoire.');
      if (!String(val.dateDebut || '').trim()) return fail('La date de début est obligatoire (format jj/mm/aaaa).');
      var dOk = validDate(val.dateDebut);
      if (!dOk) return fail('La date de début est invalide — attendu jj/mm/aaaa.');
      if (!String(val.heure || '').trim()) return fail('L\u2019heure est obligatoire.');
      var durH = Number(val.duree);
      if (!isFinite(durH) || durH < 1 || durH > 400) return fail('La durée doit être un nombre d\u2019heures entre 1 et 400.');
      var dFin = '';
      if (String(val.dateFin || '').trim()) {
        dFin = validDate(val.dateFin);
        if (!dFin) return fail('La date de fin est invalide — attendu jj/mm/aaaa.');
        if (tsDH(dFin) < tsDH(dOk)) return fail('La date de fin ne peut pas précéder la date de début.');
      }
      var sv = String(val.eval20 || '').trim();
      var sc = sv === '' ? null : Number(sv);
      if (sc != null && (!isFinite(sc) || sc < 0 || sc > 20)) return fail('L\u2019évaluation doit être comprise entre 0 et 20.');
      if (String(val.dateArrivee || '').trim() && !validDate(val.dateArrivee)) return fail('La date d\u2019arrivée est invalide — attendu jj/mm/aaaa.');
      var rec = {
        employe: String(val.employe).trim(),
        poste: String(val.poste || '').trim(),
        moduleFormation: String(val.moduleFormation).trim(),
        formateur: String(val.formateur).trim(),
        departement: String(val.departement || '').trim(),
        dateDebut: dOk,
        heure: String(val.heure || '').trim(),
        duree: Math.round(durH),
        dateFin: dFin || dOk,
        salle: String(val.salle || '').trim(),
        statut: String(val.statut || '').trim() || 'Planifiee',
        eval20: sc,
        dateArrivee: validDate(val.dateArrivee) || '',
        compteRendu: String(val.compteRendu || ''),
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.sessions = cur.sessions.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Séance modifiée', rec.employe + ' · ' + rec.moduleFormation + ' · ' + rec.dateDebut);
        toast('Séance mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var nn = nextIdNumero(cur.sessions.map(function (x) {
            var u = {}; for (var kk in x) u[kk] = x[kk]; u.id = String(u.id); return u;
          }));
          var cp = { id: nn.id, numero: nn.numero };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.sessions = cur.sessions.concat([cp]);
          return cur;
        }, 'Séance créée', rec.employe + ' · ' + rec.moduleFormation + ' · ' + rec.dateDebut);
        toast('Séance planifiée — ' + rec.employe, 'ok');
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
    var newId = null;
    mutate(function (cur) {
      var nn = nextIdNumero(cur.sessions.map(function (x) {
        var u = {}; for (var kk in x) u[kk] = x[kk]; u.id = String(u.id); return u;
      }));
      var cp = {};
      for (var k in r) if (['id', 'numero', 'ts', 'tsF', 'tsA', 'stm'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = String(nn.id);
      cp.numero = nn.numero;
      cp.statut = 'Planifiee';
      cp.eval20 = null;
      cp.compteRendu = '';
      cur.sessions = cur.sessions.concat([cp]);
      newId = String(nn.id);
      return cur;
    }, 'Séance dupliquée', r.numero + ' → à replanifier');
    toast('Séance dupliquée — choisissez la nouvelle date', 'ok');
    if (newId) setTimeout(function () { openDialog(newId, null); }, 140);
  }
  function closeConfirm() { $$('[data-aac="confirm"],[data-aac="backdrop"][data-aac-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'aac-backdrop', 'data-aac': 'backdrop', 'data-aac-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aac-confirm', 'data-aac': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette séance ?</h4><p>' + esc(r.numero || '') + ' — ' + esc(r.employe || '') + ' (' + esc(r.moduleFormation || '—') + ', ' + esc(r.dateDebut || '—') + '). Cette action est définitive.</p>' +
      '<div class="aac-confirm-row"><button class="aac-btn aac-btn-ghost" data-a="no" style="color:var(--aac-text);border-color:var(--aac-line)">Annuler</button>' +
      '<button class="aac-btn aac-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.sessions = cur.sessions.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Séance supprimée', r.numero);
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Séance supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' séances ?') : 'Supprimer 1 séance ?';
    var bd = h('div', { class: 'aac-backdrop', 'data-aac': 'backdrop', 'data-aac-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aac-confirm', 'data-aac': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero || '#' + r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="aac-confirm-row"><button class="aac-btn aac-btn-ghost" data-a="no" style="color:var(--aac-text);border-color:var(--aac-line)">Annuler</button>' +
      '<button class="aac-btn aac-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.sessions = cur.sessions.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' séances');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' séances supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-aac="seuils"],[data-aac="backdrop"][data-aac-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'aac-backdrop', 'data-aac': 'backdrop', 'data-aac-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'aac-panel', 'data-aac': 'seuils', role: 'dialog', 'aria-label': 'Seuils du programme d\u2019accueil' });
    p.innerHTML = '<div class="aac-panel-head"><h3>Seuils du programme</h3><button class="aac-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aac-panel-body">' +
        '<p class="aac-cibles-note">Ces seuils alimentent les alertes du programme d\u2019accueil : trous de planification, collisions de créneaux et compte-rendus en retard.</p>' +
        '<div class="aac-sim-row"><label for="aac-s1">Délai de planification (jours après l\u2019arrivée)</label><input type="range" id="aac-s1" min="2" max="30" step="1" value="' + SEUILS.delaiPlanif + '"><input class="aac-in" type="number" min="2" max="30" step="1" data-aac="s1n" value="' + SEUILS.delaiPlanif + '"></div>' +
        '<div class="aac-sim-row"><label for="aac-s2">Conflits tolérés (nombre de séances)</label><input type="range" id="aac-s2" min="0" max="5" step="1" value="' + SEUILS.maxConflits + '"><input class="aac-in" type="number" min="0" max="5" step="1" data-aac="s2n" value="' + SEUILS.maxConflits + '"></div>' +
        '<div class="aac-sim-row"><label for="aac-s3">Délai de compte-rendu (jours après la séance)</label><input type="range" id="aac-s3" min="1" max="30" step="1" value="' + SEUILS.crDelai + '"><input class="aac-in" type="number" min="1" max="30" step="1" data-aac="s3n" value="' + SEUILS.crDelai + '"></div>' +
        '<div class="aac-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="aac-btn aac-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.aac-drawer-x', p).addEventListener('click', closeSeuils);
    [['aac-s1', 's1n', 'delaiPlanif', 2, 30, 1], ['aac-s2', 's2n', 'maxConflits', 0, 5, 1], ['aac-s3', 's3n', 'crDelai', 1, 30, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-aac="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.delaiPlanif = Math.max(2, Math.min(30, Number($('[data-aac="s1n"]', p).value) || SEUILS.delaiPlanif));
      SEUILS.maxConflits = Math.max(0, Math.min(5, Number($('[data-aac="s2n"]', p).value) || SEUILS.maxConflits));
      SEUILS.crDelai = Math.max(1, Math.min(30, Number($('[data-aac="s3n"]', p).value) || SEUILS.crDelai));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'planif ' + SEUILS.delaiPlanif + ' j · conflits ≤ ' + SEUILS.maxConflits + ' · CR ≤ ' + SEUILS.crDelai + ' j');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-aac="journal"],[data-aac="backdrop"][data-aac-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'aac-backdrop', 'data-aac': 'backdrop', 'data-aac-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'aac-panel', 'data-aac': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="aac-panel-head"><h3>Journal d\u2019activité</h3><button class="aac-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aac-panel-body" data-aac="jlist"></div>';
    $('.aac-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-aac="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="aac-jrow"><span class="aac-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="aac-jact">' + esc(x.action || '') + '</span><span class="aac-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="aac-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Séance', 'Employé', 'Poste', 'Module de formation', 'Formateur', 'Date début', 'Heure', 'Date fin', 'Durée (h)', 'Salle/Lieu', 'Statut', 'Éval /20', 'Département', 'Date d\u2019arrivée', 'Compte-rendu', 'Notes'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero, r.employe, r.poste, r.moduleFormation, r.formateur, r.dateDebut, r.heure, r.dateFin || r.dateDebut, r.duree || '', r.salle, stMeta(r.statut).lab, r.eval20 == null ? '' : r.eval20, r.departement, r.dateArrivee, r.compteRendu, r.notes];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-plan-accueil-formation-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-aac="dialog"]') || $('[data-aac="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { UI.view = 'planning'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { UI.view = 'cards'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { toggleDark(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-aac="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle séance · E export · J journal · P planning · C cartes · T tableau · S seuils · K thème · / recherche', ''); }
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
    var root = $('[data-aac="root"]');
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
    var root = $('[data-aac="root"]');
    var cur = root ? root.getAttribute('data-theme') === 'dark' : false;
    try { localStorage.setItem('admina-dark', cur ? 'false' : 'true'); } catch (e) {}
    detectTheme();
    toast(cur ? 'Thème clair activé' : 'Thème sombre activé', 'ok');
  }

  /* ================= UI persist ================= */
  function loadUI() {
    try {
      var v = JSON.parse(localStorage.getItem(LS_UI) || 'null');
      if (v) {
        if (typeof v.view === 'string') UI.view = v.view;
        if (typeof v.per === 'number') UI.per = v.per;
        if (typeof v.mo === 'string' && (v.mo === 'week' || v.mo === 's14')) UI.mo = v.mo;
      }
    } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per, mo: UI.mo })); } catch (e) {} }

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
    if (!document.querySelector('[data-aac="drawer"],[data-aac="dialog"],[data-aac="confirm"],[data-aac="journal"],[data-aac="seuils"]')) {
      $$('[data-aac="backdrop"]').forEach(function (b) { b.remove(); });
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
    html.classList.add('admina-aac');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-aac]')) continue;
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
    html.classList.remove('admina-aac');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils();
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
    var root = $('[data-aac="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-aac-hide', '1');
      natif.setAttribute('data-aac-olddisp', natif.style.display || '');
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

  window.__ADMINA_AAC_UI__ = {
    version: '1.0-w2',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openPlanning: function () { UI.view = 'planning'; saveUI(); refresh(); },
    openSeuils: openSeuils,
    openJournal: openJournal,
    exportCSV: exportCSV,
    debug: { filtered: filtered, alerts: computeAlerts, conflicts: conflictMap, arrivals: arrivalsMap, gaps: gapsList, nextNumero: nextIdNumero, seuils: function () { return SEUILS; } }
  };
  try { console.info('[ADMINA_ACC] W2-c actif — Centre de pilotage Plan d\u2019Accueil & Formation /plan-accueil-formation'); } catch (e) {}
})();
