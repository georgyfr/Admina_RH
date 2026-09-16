/* =============================================================
   admina-auditstatuts.js — Admina-RH · page /audit-statuts (W4-d)
   Module additif — v1.0-w4 — canon admina-stagiaires
   -------------------------------------------------------------
   LA MÉMOIRE DES CHANGEMENTS DE STATUT — Quand un contrat passe
   à Échu, quand un document devient Non conforme, quand une
   demande est rejetée : qui l'a fait, quand, et pourquoi. Cette
   page est la piste d'audit de l'application : elle ne s'édite
   pas "pour faire joli", elle enregistre. Chaque entrée répond à
   quatre questions : QUI (utilisateur), QUAND (date/heure),
   QUOI (action + module), DANS QUEL CONTEXTE (détails). Les
   actions sensibles (Suppression, Export) sont marquées : ce sont
   celles qu'on relit après un incident. Le reste du système
   écrit ici ; cette page lit, filtre, et met en évidence.
   -------------------------------------------------------------
   Canon : IIFE 'use strict' ; garde __ADMINA_ADT_W4__ ; flag FIN
   d'init ; 0 global hors __ADMINA_ADT_API__ / __ADMINA_ADT_UI__ ;
   préfixe adt- ; root html.admina-adt + [data-adt-page] ;
   détection regex /\/audit-statuts\/?$/ réévaluée 350 ms + popstate ;
   résilience API (30x450 ms) -> LS -> snapshot ; setData + subscribe
   + poller 1200 ms ; journal commun admina_journal (max 500) ;
   pont optionnel window.__ADMINA_AUDIT__ (try/catch silencieux).
   -------------------------------------------------------------
   CONTRAT API (chunk Audit-BDyct-xF.js patché, v1.0-w4) :
     window.__ADMINA_ADT_API__ = {
       version : '1.0-w4',
       getData()  -> { journal : [entrée, …] },
       setData(o) -> o = { journal : [entrée, …] },
       subscribe(f) -> f rappelé à chaque écriture du shell.
     }
     Entrée : { id:Number, numero:'AUD-001', date:'jj/mm/aaaa hh:mm',
                utilisateur:string, action:'Création'|'Modification'|
                'Suppression'|'Connexion'|'Export',
                module:'Demandes'|'Entretiens'|'Système'|'Candidats'|
                        'Contrats'|…,
                details:string }
   MODÈLE DE RÉSILIENCE : API (30 × 450 ms) -> LS 'admina-auditstatuts-data'
   (JSON {journal}) -> snapshot démo embarqué AUD-001…AUD-005. Toute
   écriture repasse par save() : LS + API.setData + journal commun.
   VUES : FLUX D'ACTIVITÉ (signature, défaut) · Tableau · Cartes.
   RACCOURCIS : N nouveau · E export · J flux · T tableau · C cartes ·
   S tout sélectionner · P purger les filtres · K seuils · / recherche ·
   ? aide · Échap fermer (ignorés dans les champs et les dialogs).
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_ADT_W4__) return;

  /* ================= constantes ================= */
  var VERSION = '1.0-w4';
  var LS_DATA = 'admina-auditstatuts-data';
  var LS_SEUILS = 'admina-auditstatuts-seuils';
  var LS_JOURNAL = 'admina_journal';
  var LS_UI = 'admina-adt-ui';
  var SS_NATIVE = 'admina-adt-native';
  var ROUTE_RE = /\/audit-statuts\/?$/;
  var ACTIONS = ['Création', 'Modification', 'Suppression', 'Connexion', 'Export'];
  var SENSIBLE = { 'Suppression': true, 'Export': true };
  var MODULES_REF = ['Demandes', 'Entretiens', 'Système', 'Candidats', 'Contrats', 'Documents', 'Paie', 'Congés'];
  var COLORS = {
    'Création': '#2e7d32',
    'Modification': '#1565c0',
    'Suppression': '#c62828',
    'Connexion': '#546e7a',
    'Export': '#ef6c00'
  };
  var PAGE_SIZE = 12;

  /* ================= seuils ================= */
  var SEUILS_DEF = { sensibleJours: 7, silenceJours: 30 };
  function loadSeuils() {
    try {
      var raw = localStorage.getItem(LS_SEUILS);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o === 'object') {
          var sj = clamp(Math.round(+o.sensibleJours || SEUILS_DEF.sensibleJours), 7, 30);
          var sl = clamp(Math.round(+o.silenceJours || SEUILS_DEF.silenceJours), 14, 90);
          return { sensibleJours: sj, silenceJours: sl };
        }
      }
    } catch (e) { /* silencieux */ }
    return { sensibleJours: SEUILS_DEF.sensibleJours, silenceJours: SEUILS_DEF.silenceJours };
  }
  function saveSeuils() {
    try { localStorage.setItem(LS_SEUILS, JSON.stringify(S.seuils)); } catch (e) { /* silencieux */ }
  }

  /* ================= référentiels / outils ================= */
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pad3(n) { return (n < 10 ? '00' : n < 100 ? '0' : '') + n; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function trunc(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function uniq(arr) { var seen = {}, out = []; arr.forEach(function (x) { if (x && !seen[x]) { seen[x] = 1; out.push(x); } }); return out; }
  function byId(j, id) { for (var i = 0; i < j.length; i++) { if (j[i].id === id) return j[i]; } return null; }
  function pd(s) {
    if (!s) return null;
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/.exec(String(s).trim());
    if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), 0);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtNow() {
    var d = new Date();
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function dayKey(d) { return d ? d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) : '?'; }
  function dayFr(d) {
    try { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear(); }
  }
  function ilYa(d) {
    if (!d) return '—';
    var j = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (j <= 0) return "aujourd'hui";
    if (j === 1) return 'hier';
    return 'il y a ' + j + ' j';
  }
  function isHorsHoraires(d) {
    if (!d) return false;
    var h = d.getHours(), dw = d.getDay();
    return h < 8 || h >= 19 || dw === 0 || dw === 6;
  }
  function maxId(j) { var m = 0; j.forEach(function (e) { if (+e.id > m) m = +e.id; }); return m; }
  function nextNumero(j) {
    var m = 0;
    j.forEach(function (e) {
      var mm = /(\d+)\s*$/.exec(String(e.numero || ''));
      if (mm && +mm[1] > m) m = +mm[1];
    });
    return 'AUD-' + pad3(m + 1);
  }

  /* ================= données =================
     Charge en cascade : API du chunk (30 × 450 ms) -> LS -> snapshot
     démo embarqué. norm() garantit des identifiants uniques (max+1)
     et des champs typés avant tout rendu. */
  function snapshot() {
    return {
      journal: [
        { id: 1, numero: 'AUD-001', date: '28/02/2025 14:30', utilisateur: 'M. Nkoulou Paul', action: 'Création', module: 'Demandes', details: 'Création demande DR-2025-008' },
        { id: 2, numero: 'AUD-002', date: '27/02/2025 10:15', utilisateur: 'Mme. Fotso Marie', action: 'Modification', module: 'Entretiens', details: 'Modification entretien ENT-2025-004' },
        { id: 3, numero: 'AUD-003', date: '26/02/2025 16:45', utilisateur: 'M. Kamga Blaise', action: 'Connexion', module: 'Système', details: 'Connexion depuis 192.168.1.45' },
        { id: 4, numero: 'AUD-004', date: '25/02/2025 09:00', utilisateur: 'Mme. Mebara Nadège', action: 'Export', module: 'Candidats', details: 'Export CSV base candidats' },
        { id: 5, numero: 'AUD-005', date: '24/02/2025 11:30', utilisateur: 'M. Ngo Ndobo Alain', action: 'Création', module: 'Contrats', details: 'Création contrat CTR-2025-003' }
      ]
    };
  }
  function norm(j) {
    var out = [];
    (Array.isArray(j) ? j : []).forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      out.push({
        id: +e.id || 0,
        numero: String(e.numero || ''),
        date: String(e.date || ''),
        utilisateur: String(e.utilisateur || '—'),
        action: ACTIONS.indexOf(e.action) > -1 ? e.action : 'Modification',
        module: String(e.module || 'Système'),
        details: String(e.details == null ? '' : e.details)
      });
    });
    var m = maxId(out), nums = [];
    out.forEach(function (e) {
      if (!e.id) { m += 1; e.id = m; }
      if (!e.numero) { e.numero = nextNumero(nums.concat(out)); }
      nums.push(e);
    });
    out.sort(function (a, b) { return a.id - b.id; });
    return out;
  }
  function findApi() {
    try {
      var a = window.__ADMINA_ADT_API__;
      if (a && typeof a.getData === 'function' && typeof a.setData === 'function') return a;
    } catch (e) { /* silencieux */ }
    return null;
  }
  function load() {
    var api = findApi();
    if (api) {
      try {
        var d = api.getData();
        if (d && Array.isArray(d.journal) && d.journal.length) {
          S.api = api; S.src = 'api'; S.journal = norm(d.journal); lastSig = JSON.stringify(S.journal); return;
        }
      } catch (e) { /* silencieux */ }
    }
    try {
      var raw = localStorage.getItem(LS_DATA);
      if (raw) {
        var d2 = JSON.parse(raw);
        if (d2 && Array.isArray(d2.journal) && d2.journal.length) {
          S.api = api; S.src = 'ls'; S.journal = norm(d2.journal); lastSig = JSON.stringify(S.journal); return;
        }
      }
    } catch (e) { /* silencieux */ }
    S.api = api; S.src = 'snapshot'; S.journal = norm(snapshot().journal); lastSig = JSON.stringify(S.journal);
  }
  function save(j) {
    S.journal = j;
    lastSig = JSON.stringify(j);
    try { localStorage.setItem(LS_DATA, JSON.stringify({ journal: j })); } catch (e) { /* silencieux */ }
    if (S.api) { try { S.api.setData({ journal: j }); } catch (e) { /* silencieux */ } }
    feedJournal(j);
  }
  function feedJournal(j) {
    try {
      var last = j[j.length - 1];
      if (!last) return;
      var arr = [];
      try { arr = JSON.parse(localStorage.getItem(LS_JOURNAL) || '[]'); } catch (e) { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      var sig = (last.numero || '') + '|' + (last.date || '');
      var dup = arr.some(function (x) { return x && x.source === 'audit-statuts' && x.sig === sig; });
      if (!dup) {
        arr.push({
          source: 'audit-statuts', sig: sig, type: 'audit', numero: last.numero, date: last.date,
          utilisateur: last.utilisateur, action: last.action, module: last.module, details: last.details, ts: Date.now()
        });
        if (arr.length > 500) arr = arr.slice(-500);
        localStorage.setItem(LS_JOURNAL, JSON.stringify(arr));
      }
    } catch (e) { /* silencieux */ }
    try {
      var B = window.__ADMINA_AUDIT__;
      if (B) {
        var payload = { source: 'audit-statuts', numero: last.numero, date: last.date, utilisateur: last.utilisateur, action: last.action, module: last.module, details: last.details };
        if (typeof B.log === 'function') B.log(payload);
        else if (typeof B.push === 'function') B.push(payload);
        else if (Array.isArray(B)) B.push(payload);
      }
    } catch (e) { /* silencieux */ }
  }
  function bridgeEntries() {
    var out = [];
    try {
      var B = window.__ADMINA_AUDIT__;
      if (!B) return out;
      var raw = null;
      if (Array.isArray(B)) raw = B;
      else if (Array.isArray(B.entries)) raw = B.entries;
      else if (typeof B.getEntries === 'function') raw = B.getEntries();
      else if (Array.isArray(B.journal)) raw = B.journal;
      else if (Array.isArray(B.history)) raw = B.history;
      if (Array.isArray(raw)) {
        raw.forEach(function (x) {
          if (!x || typeof x !== 'object') return;
          out.push({
            date: String(x.date || x.at || ''),
            module: String(x.module || x.source || '—'),
            utilisateur: String(x.utilisateur || x.user || '—'),
            text: String(x.details || x.text || x.action || x.label || x.message || '—')
          });
        });
      }
    } catch (e) { /* silencieux */ }
    return out;
  }

  /* ================= état =================
     S est la source unique de vérité de l'UI : les handlers ne
     captent jamais les données (anti stale-closure) — ils relisent
     fresh() / S.journal au moment du clic. */
  var S = {
    api: null, src: 'snapshot', journal: [], filtered: [], alerts: [],
    view: 'flux', q: '', fAction: '', fUser: '', fModule: '', fPeriod: '', dFrom: '', dTo: '',
    flagNoDetails: false, flagHorsHoraires: false,
    sort: { k: 'date', dir: -1 }, page: 1, psize: PAGE_SIZE,
    sel: {}, drawerId: null, seuils: loadSeuils(), ready: false, active: false
  };
  var DLG = null;
  var lastSig = '';
  (function loadUI() {
    try {
      var raw = localStorage.getItem(LS_UI);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o === 'object') {
          if (['table', 'cartes', 'flux'].indexOf(o.view) > -1) S.view = o.view;
          if (+o.psize > 0) S.psize = +o.psize;
          if (o.sort && o.sort.k) S.sort = { k: String(o.sort.k), dir: +o.sort.dir < 0 ? -1 : 1 };
        }
      }
    } catch (e) { /* silencieux */ }
  })();
  function persistUI() {
    try { localStorage.setItem(LS_UI, JSON.stringify({ view: S.view, psize: S.psize, sort: S.sort })); } catch (e) { /* silencieux */ }
  }

  /* ================= alertes AAA =================
     Cinq alertes « à retenir » : actions sensibles récentes,
     modifications sans détails, modules silencieux, acteurs
     inactifs, connexions hors heures ouvrables. Chacune est
     cliquable et pose le filtre correspondant. */
  function computeAlerts(j) {
    var A = [];
    var nowD = new Date();
    var seu = S.seuils;
    var limS = new Date(nowD.getTime() - seu.sensibleJours * 86400000);
    var sens = j.filter(function (e) { return SENSIBLE[e.action]; })
      .filter(function (e) { var d = pd(e.date); return d && d.getTime() >= limS.getTime(); });
    A.push({
      id: 'sensibles', ico: '⚠', n: sens.length, on: S.fAction === 'sensible',
      txt: sens.length
        ? sens.length + ' action(s) sensible(s) (Suppression / Export) sur les ' + seu.sensibleJours + ' derniers jours — à relire en priorité après incident'
        : 'Aucune action sensible sur les ' + seu.sensibleJours + ' derniers jours',
      apply: function () { setFilter({ fAction: S.fAction === 'sensible' ? '' : 'sensible', flagNoDetails: false, flagHorsHoraires: false }); }
    });
    var nd = j.filter(function (e) { return e.action === 'Modification' && !String(e.details || '').trim(); });
    A.push({
      id: 'nodet', ico: '✎', n: nd.length, on: S.flagNoDetails,
      txt: nd.length
        ? nd.length + ' modification(s) SANS détails — le contexte manque, complètez la fiche (QUOI sans DANS QUEL CONTEXTE)'
        : 'Toutes les modifications ont un contexte détaillé',
      apply: function () {
        S.flagNoDetails = !S.flagNoDetails; S.page = 1;
        if (S.flagNoDetails) { S.fAction = ''; S.flagHorsHoraires = false; }
        renderAll();
      }
    });
    var mods = uniq(j.map(function (e) { return e.module; }));
    var sil = mods.map(function (m) {
      var last = null;
      j.forEach(function (e) { if (e.module === m) { var d = pd(e.date); if (d && (!last || d > last)) last = d; } });
      return { k: m, d: last };
    }).filter(function (x) { return !x.d || (nowD.getTime() - x.d.getTime()) > seu.silenceJours * 86400000; })
      .sort(function (a, b) { return (a.d ? a.d.getTime() : 0) - (b.d ? b.d.getTime() : 0); });
    A.push({
      id: 'silence', ico: '⏱', n: sil.length, on: !!sil.length && S.fModule === sil[0].k,
      txt: sil.length
        ? sil.length + ' module(s) silencieux depuis plus de ' + seu.silenceJours + ' j : ' + sil.slice(0, 3).map(function (x) { return x.k; }).join(', ') + (sil.length > 3 ? '…' : '')
        : 'Tous les modules ont écrit au moins une entrée depuis ' + seu.silenceJours + ' j',
      apply: function () { if (sil.length) setFilter({ fModule: S.fModule === sil[0].k ? '' : sil[0].k, fAction: '', fUser: '', flagNoDetails: false, flagHorsHoraires: false }); }
    });
    var users = uniq(j.map(function (e) { return e.utilisateur; }));
    var inact = users.map(function (u) {
      var last = null;
      j.forEach(function (e) { if (e.utilisateur === u) { var d = pd(e.date); if (d && (!last || d > last)) last = d; } });
      return { k: u, d: last };
    }).filter(function (x) { return !x.d || (nowD.getTime() - x.d.getTime()) > seu.silenceJours * 86400000; })
      .sort(function (a, b) { return (a.d ? a.d.getTime() : 0) - (b.d ? b.d.getTime() : 0); });
    A.push({
      id: 'inactifs', ico: '👤', n: inact.length, on: !!inact.length && S.fUser === inact[0].k,
      txt: inact.length
        ? inact.length + ' acteur(s) sans aucune écriture depuis plus de ' + seu.silenceJours + ' j : ' + inact.slice(0, 3).map(function (x) { return x.k; }).join(', ') + (inact.length > 3 ? '…' : '')
        : 'Tous les acteurs ont écrit au moins une entrée depuis ' + seu.silenceJours + ' j',
      apply: function () { if (inact.length) setFilter({ fUser: S.fUser === inact[0].k ? '' : inact[0].k, fAction: '', fModule: '', flagNoDetails: false, flagHorsHoraires: false }); }
    });
    var hh = j.filter(function (e) { return e.action === 'Connexion' && isHorsHoraires(pd(e.date)); });
    A.push({
      id: 'horaires', ico: '🌙', n: hh.length, on: S.flagHorsHoraires,
      txt: hh.length
        ? hh.length + ' connexion(s) HORS heures ouvrables (avant 8 h, après 19 h ou week-end) — vérifier la légitimité'
        : 'Aucune connexion hors heures ouvrables (8 h – 19 h, lundi – vendredi)',
      apply: function () {
        S.flagHorsHoraires = !S.flagHorsHoraires; S.page = 1;
        if (S.flagHorsHoraires) { S.fAction = 'Connexion'; S.flagNoDetails = false; } else { S.fAction = ''; }
        renderAll();
      }
    });
    return A;
  }

  /* ================= filtres / tri ================= */
  function setFilter(o) {
    if ('q' in o) S.q = String(o.q || '');
    if ('fAction' in o) S.fAction = o.fAction || '';
    if ('fUser' in o) S.fUser = o.fUser || '';
    if ('fModule' in o) S.fModule = o.fModule || '';
    if ('fPeriod' in o) S.fPeriod = o.fPeriod || '';
    if ('flagNoDetails' in o) S.flagNoDetails = !!o.flagNoDetails;
    if ('flagHorsHoraires' in o) S.flagHorsHoraires = !!o.flagHorsHoraires;
    S.page = 1;
    renderAll();
  }
  function resetFilters() {
    S.q = ''; S.fAction = ''; S.fUser = ''; S.fModule = ''; S.fPeriod = '';
    resetDates();
    S.flagNoDetails = false; S.flagHorsHoraires = false;
    S.page = 1; S.sel = {};
    renderAll();
    toast('Filtres réinitialisés', 'ok');
  }
  function inPeriod(e) {
    if (!S.fPeriod) return true;
    var d = pd(e.date);
    if (!d) return false;
    return d.getTime() >= Date.now() - (+S.fPeriod) * 86400000;
  }
  function inDates(e) {
    if (!S.dFrom && !S.dTo) return true;
    var d = pd(e.date);
    if (!d) return false;
    var f = pd(S.dFrom), t = pd(S.dTo);
    if (f) { f = new Date(f.getFullYear(), f.getMonth(), f.getDate(), 0, 0, 0); if (d < f) return false; }
    if (t) { t = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59); if (d > t) return false; }
    return true;
  }
  function resetDates() { S.dFrom = ''; S.dTo = ''; }
  function drawerNav(dir) {
    if (!S.drawerId) return;
    var idx = -1;
    for (var i = 0; i < S.filtered.length; i++) { if (S.filtered[i].id === S.drawerId) { idx = i; break; } }
    if (idx < 0) return;
    var t = S.filtered[idx + dir];
    if (t) openDrawer(t.id);
    else toast(dir < 0 ? 'Début du fil atteint' : 'Fin du fil atteinte', 'ok');
  }
  function filtered(j) {
    var q = S.q.trim().toLowerCase();
    var out = j.filter(function (e) {
      if (S.fAction === 'sensible') { if (!SENSIBLE[e.action]) return false; }
      else if (S.fAction && e.action !== S.fAction) return false;
      if (S.fUser && e.utilisateur !== S.fUser) return false;
      if (S.fModule && e.module !== S.fModule) return false;
      if (S.flagNoDetails && !(e.action === 'Modification' && !String(e.details || '').trim())) return false;
      if (S.flagHorsHoraires && !(e.action === 'Connexion' && isHorsHoraires(pd(e.date)))) return false;
      if (!inPeriod(e)) return false;
      if (!inDates(e)) return false;
      if (q) {
        var hay = (e.numero + ' ' + e.utilisateur + ' ' + e.module + ' ' + e.details + ' ' + e.action).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var k = S.sort.k, dir = S.sort.dir;
    out.sort(function (a, b) {
      if (k === 'date') {
        var da = pd(a.date), db = pd(b.date);
        var ta = da ? da.getTime() : 0, tb = db ? db.getTime() : 0;
        return (ta - tb) * dir;
      }
      var va = String(a[k] == null ? '' : a[k]).toLowerCase();
      var vb = String(b[k] == null ? '' : b[k]).toLowerCase();
      return va < vb ? -dir : va > vb ? dir : 0;
    });
    return out;
  }

  /* ================= conteneur natif ================= */
  function mount() {
    if (document.getElementById('adt-page')) return;
    var root = document.createElement('section');
    root.id = 'adt-page';
    root.className = 'adt-page';
    root.setAttribute('data-adt-page', '1');
    var title = findTitle();
    if (!title) return;
    try {
      title.insertAdjacentElement('afterend', root);
    } catch (e) { return; }
    /* garde mobile : neutraliser le margin-left drawer sur tous les ancêtres décalés */
    try {
      var stop = document.getElementById('root'), hop = root.parentElement;
      while (hop && hop !== document.body && hop !== stop) {
        if (parseFloat(getComputedStyle(hop).marginLeft || '0') > 80) hop.classList.add('adt-host');
        hop = hop.parentElement;
      }
    } catch (e2) { /* silencieux */ }
    build(root);
    wire(root);
    S.ready = true;
    renderAll();
  }
  function findTitle() {
    try {
      var hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6,[class*="MuiTypography-h5"]');
      for (var i = 0; i < hs.length; i++) {
        var t = hs[i].textContent || '';
        if (/journal d'audit/i.test(t) || (/audit/i.test(t) && /statut/i.test(t))) return hs[i];
      }
    } catch (e) { /* silencieux */ }
    return null; /* le tick retentera : jamais de fallback body (leçon W4 — drawer natif) */
  }
  function activate() {
    if (!findTitle()) return; /* le titre natif n'est pas encore rendu : onRoute retentera */
    document.documentElement.classList.add('admina-adt');
    document.documentElement.classList.remove('adt-nav-open');
    S.active = true;
    mount();
  }
  function deactivate() {
    S.active = false;
    var r = document.getElementById('adt-page');
    if (r && r.parentElement) r.parentElement.removeChild(r);
    document.documentElement.classList.remove('admina-adt');
    document.documentElement.classList.remove('adt-dark');
    document.documentElement.classList.remove('adt-nav-open');
    var hs = document.querySelectorAll('.adt-host');
    for (var i = 0; i < hs.length; i++) hs[i].classList.remove('adt-host');
    closeDrawer();
    closeDialog();
    S.ready = false;
  }
  function onRoute() {
    var native = false;
    try { native = sessionStorage.getItem(SS_NATIVE) === '1'; } catch (e) { /* silencieux */ }
    var desired = ROUTE_RE.test(location.pathname) && !native;
    var chip = document.getElementById('adt-native-chip');
    if (chip) {
      if (ROUTE_RE.test(location.pathname) && native) chip.classList.remove('adt-hide');
      else chip.classList.add('adt-hide');
    }
    if (desired && !S.active) activate();
    else if (!desired && S.active) deactivate();
  }

  /* ================= construction DOM ================= */
  function build(root) {
    root.innerHTML =
      '<div class="adt-hero">' +
        '<div class="adt-hero-main">' +
          '<div class="adt-hero-kicker">LA MÉMOIRE DES CHANGEMENTS DE STATUT</div>' +
          '<h3 class="adt-hero-title" id="adt-hero-txt">…</h3>' +
          '<div class="adt-hero-sub">Piste d\'audit de l\'application : chaque entrée répond à quatre questions — QUI, QUAND, QUOI, DANS QUEL CONTEXTE. Les actions sensibles (Suppression, Export) sont marquées : ce sont celles qu\'on relit après un incident. Le reste du système écrit ici ; cette page lit, filtre, et met en évidence.</div>' +
        '</div>' +
        '<div class="adt-hero-side">' +
          '<button type="button" class="adt-chip adt-bridge adt-hide" id="adt-bridge-chip" title="Historique commun du système (lecture seule)"></button>' +
        '</div>' +
      '</div>' +
      '<div class="adt-live adt-hide" id="adt-live"></div>' +
      '<div class="adt-alerts" id="adt-alerts" aria-live="polite"></div>' +
      '<div class="adt-kpis" id="adt-kpis"></div>' +
      '<div class="adt-charts">' +
        '<div class="adt-chart"><div class="adt-chart-t">Répartition par action — cliquer une part pour filtrer</div><div class="adt-chart-body" id="adt-ch-action"></div></div>' +
        '<div class="adt-chart"><div class="adt-chart-t">Entrées par module — cliquer une barre pour filtrer</div><div class="adt-chart-body" id="adt-ch-module"></div></div>' +
        '<div class="adt-chart"><div class="adt-chart-t">Acteurs les plus actifs — cliquer une barre pour filtrer</div><div class="adt-chart-body" id="adt-ch-user"></div></div>' +
      '</div>' +
      '<div class="adt-toolbar" id="adt-toolbar">' +
        '<div class="adt-toolbar-l">' +
          '<div class="adt-viewsw" role="tablist" aria-label="Vues">' +
            '<button type="button" class="adt-viewbtn" data-view="flux">Flux d\'activité</button>' +
            '<button type="button" class="adt-viewbtn" data-view="table">Tableau</button>' +
            '<button type="button" class="adt-viewbtn" data-view="cartes">Cartes</button>' +
          '</div>' +
          '<div class="adt-periodsw" id="adt-periodsw" role="group" aria-label="Période analysée">' +
            '<button type="button" class="adt-period" data-p="">Tout</button>' +
            '<button type="button" class="adt-period" data-p="7">7 j</button>' +
            '<button type="button" class="adt-period" data-p="30">30 j</button>' +
            '<button type="button" class="adt-period" data-p="90">90 j</button>' +
          '</div>' +
          '<span class="adt-count" id="adt-count"></span>' +
        '</div>' +
        '<div class="adt-toolbar-r">' +
          '<input type="search" id="adt-q" class="adt-search" placeholder="Rechercher (numéro, utilisateur, module, détails)…" aria-label="Recherche">' +
          '<input type="text" id="adt-dfrom" class="adt-select adt-dates" placeholder="du jj/mm/aaaa" aria-label="Date de début" maxlength="10">' +
          '<input type="text" id="adt-dto" class="adt-select adt-dates" placeholder="au jj/mm/aaaa" aria-label="Date de fin" maxlength="10">' +
          '<select id="adt-faction" class="adt-select" aria-label="Filtrer par action"></select>' +
          '<select id="adt-fuser" class="adt-select" aria-label="Filtrer par utilisateur"></select>' +
          '<select id="adt-fmodule" class="adt-select" aria-label="Filtrer par module"></select>' +
          '<button type="button" class="adt-btn" id="adt-reset">Réinitialiser</button>' +
          '<button type="button" class="adt-btn adt-btn-primary" id="adt-new">+ Nouvelle entrée</button>' +
          '<button type="button" class="adt-btn" id="adt-export" title="Exporter la sélection courante (CSV)">Export CSV</button>' +
          '<button type="button" class="adt-btn" id="adt-seuils-btn" title="Seuils d\'alerte (K)">Seuils</button>' +
          '<button type="button" class="adt-btn adt-btn-ghost" id="adt-help" title="Raccourcis clavier (?)">?</button>' +
        '</div>' +
        '<div class="adt-flagrow adt-hide" id="adt-flags"></div>' +
      '</div>' +
      '<div class="adt-selbar adt-hide" id="adt-selbar">' +
        '<span class="adt-selbar-txt" id="adt-selbar-txt"></span>' +
        '<span class="adt-selbar-actions">' +
          '<button type="button" class="adt-btn adt-btn-sm adt-btn-danger" id="adt-sel-del">Supprimer la sélection</button>' +
          '<button type="button" class="adt-btn adt-btn-sm" id="adt-sel-cancel">Annuler</button>' +
        '</span>' +
      '</div>' +
      '<div class="adt-view adt-view-table" id="adt-view-table">' +
        '<div class="adt-tablewrap"><table class="adt-table"><caption class="adt-hide">Journal d\'audit des changements de statut</caption>' +
          '<thead><tr id="adt-thead-row"></tr></thead><tbody id="adt-tbody"></tbody>' +
        '</table></div>' +
        '<div class="adt-pager">' +
          '<select id="adt-psize" class="adt-select" aria-label="Entrées par page">' +
            '<option value="12">12 / page</option>' +
            '<option value="24">24 / page</option>' +
            '<option value="48">48 / page</option>' +
          '</select>' +
          '<button type="button" class="adt-btn adt-btn-sm" id="adt-prev">‹ Précédent</button>' +
          '<span class="adt-pager-info" id="adt-pager-info"></span>' +
          '<button type="button" class="adt-btn adt-btn-sm" id="adt-next">Suivant ›</button>' +
        '</div>' +
      '</div>' +
      '<div class="adt-view adt-view-cartes" id="adt-view-cartes"><div class="adt-cards" id="adt-cards"></div></div>' +
      '<div class="adt-view adt-view-flux" id="adt-view-flux">' +
        '<div class="adt-tl-quick">' +
          '<div class="adt-quickrow"><span class="adt-quicklab">Action</span><span class="adt-qchips" id="adt-quick-actions"></span></div>' +
          '<div class="adt-quickrow"><span class="adt-quicklab">Utilisateur</span><span class="adt-qchips" id="adt-quick-users"></span></div>' +
          '<div class="adt-quickrow"><span class="adt-quicklab">Module</span><span class="adt-qchips" id="adt-quick-modules"></span></div>' +
        '</div>' +
        '<div class="adt-tl" id="adt-timeline"></div>' +
      '</div>' +
      '<div class="adt-foot">' +
        '<span class="adt-foot-note">Module additif ' + VERSION + ' — la page native reste intacte ; cette interface lit, filtre et met en évidence le journal d\'audit.</span>' +
        '<button type="button" class="adt-btn adt-btn-ghost" id="adt-foot-native">Voir la page native</button>' +
      '</div>' +
      '<div class="adt-drawer-back adt-hide" id="adt-drawer-back"></div>' +
      '<aside class="adt-drawer" id="adt-drawer" role="dialog" aria-modal="true" aria-label="Fiche d\'entrée d\'audit">' +
        '<div class="adt-drawer-head">' +
          '<div><div class="adt-drawer-num" id="adt-drawer-num"></div><h4 class="adt-drawer-title">Fiche d\'entrée d\'audit</h4></div>' +
          '<span class="adt-drawer-nav">' +
            '<button type="button" class="adt-dnav" id="adt-drawer-prev" title="Entrée précédente dans le fil courant" aria-label="Entrée précédente">‹</button>' +
            '<button type="button" class="adt-drawer-x" id="adt-drawer-x" aria-label="Fermer">×</button>' +
            '<button type="button" class="adt-dnav" id="adt-drawer-next" title="Entrée suivante dans le fil courant" aria-label="Entrée suivante">›</button>' +
          '</span>' +
        '</div>' +
        '<div class="adt-drawer-body">' +
          '<div class="adt-drawer-badges" id="adt-drawer-badges"></div>' +
          '<div class="adt-drawer-kv" id="adt-drawer-kv"></div>' +
          '<div class="adt-drawer-sect">Détails <span class="adt-hint">modifiable — la page enregistre</span></div>' +
          '<textarea class="adt-drawer-det" id="adt-drawer-det" rows="3" placeholder="Contexte de l\'entrée (quoi, pourquoi, référence)…"></textarea>' +
          '<div class="adt-drawer-detfoot"><button type="button" class="adt-btn adt-btn-sm adt-btn-primary" id="adt-det-save">Enregistrer les détails</button><span class="adt-hint">Chaque correction est volontaire : elle précise le contexte d\'un changement de statut.</span></div>' +
          '<div class="adt-drawer-sect">Historique lié <span class="adt-hint">même utilisateur ou même module</span></div>' +
          '<div class="adt-hist" id="adt-hist"></div>' +
        '</div>' +
        '<div class="adt-drawer-foot">' +
          '<button type="button" class="adt-btn adt-btn-ghost" id="adt-json" title="Copier la fiche en JSON">Copier JSON</button>' +
          '<button type="button" class="adt-btn" id="adt-dup">Dupliquer</button>' +
          '<button type="button" class="adt-btn adt-btn-danger" id="adt-del">Supprimer</button>' +
        '</div>' +
      '</aside>' +
      '<div class="adt-overlay adt-hide" id="adt-overlay"><div class="adt-dialog" id="adt-dialog" role="dialog" aria-modal="true"></div></div>' +
      '<div class="adt-notifs" id="adt-notifs" aria-live="polite"></div>' +
      '<button type="button" class="adt-burger" id="adt-burger" aria-label="Menu">☰</button>' +
      '<nav class="adt-nav" id="adt-nav" aria-label="Navigation">' +
        '<div class="adt-nav-head"><span>Admina-RH</span><button type="button" class="adt-drawer-x" id="adt-nav-x" aria-label="Fermer le menu">×</button></div>' +
        '<a class="adt-nav-link" href="/">Tableau de bord</a>' +
        '<a class="adt-nav-link" href="/demandes">Demandes</a>' +
        '<a class="adt-nav-link" href="/collaborateurs">Collaborateurs</a>' +
        '<a class="adt-nav-link" href="/candidats">Candidats</a>' +
        '<a class="adt-nav-link" href="/contrats">Contrats</a>' +
        '<a class="adt-nav-link" href="/documents-conformite">Documents & conformité</a>' +
        '<a class="adt-nav-link" href="/audit-statuts">Audit des statuts</a>' +
      '</nav>';
  }

  /* ================= câblage événements ================= */
  function wire(root) {
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!(t && t.closest)) return;
      var el;
      if ((el = t.closest('.adt-viewbtn'))) { setView(el.getAttribute('data-view')); return; }
      if ((el = t.closest('.adt-alert'))) {
        var i = +el.getAttribute('data-i');
        var a = S.alerts[i];
        if (a && typeof a.apply === 'function') a.apply();
        return;
      }
      if ((el = t.closest('#adt-reset'))) { resetFilters(); return; }
      if ((el = t.closest('#adt-new'))) { openForm(null); return; }
      if ((el = t.closest('#adt-export'))) { exportCSV(); return; }
      if ((el = t.closest('#adt-seuils-btn'))) { openSeuils(); return; }
      if ((el = t.closest('#adt-help'))) { openHelp(); return; }
      if ((el = t.closest('#adt-bridge-chip'))) { toggleLive(); return; }
      if ((el = t.closest('[data-close]'))) { closeDialog(); return; }
      if ((el = t.closest('#adt-form-save'))) { if (DLG && DLG.kind === 'form' && el && !el.disabled && DLG.submit) DLG.submit(); return; }
      if ((el = t.closest('#adt-confirm-yes'))) { var cb = DLG ? DLG.onYes : null; closeDialog(); if (typeof cb === 'function') cb(); return; }
      if ((el = t.closest('#adt-se-def'))) { if (DLG && DLG.onDef) DLG.onDef(); return; }
      if ((el = t.closest('#adt-se-save'))) { if (DLG && DLG.onSave) DLG.onSave(); return; }
      if ((el = t.closest('.adt-period'))) { setFilter({ fPeriod: el.getAttribute('data-p') }); return; }
      if ((el = t.closest('.adt-flag'))) {
        var fk = el.getAttribute('data-flag');
        if (fk === 'flagNoDetails') S.flagNoDetails = false;
        if (fk === 'flagHorsHoraires') { S.flagHorsHoraires = false; if (S.fAction === 'Connexion') S.fAction = ''; }
        S.page = 1; renderAll();
        return;
      }
      if ((el = t.closest('#adt-sel-del'))) { deleteSelected(); return; }
      if ((el = t.closest('#adt-sel-cancel'))) { S.sel = {}; renderAll(); return; }
      if ((el = t.closest('#adt-prev'))) { S.page = Math.max(1, S.page - 1); renderViews(); return; }
      if ((el = t.closest('#adt-next'))) { S.page = S.page + 1; renderViews(); return; }
      if ((el = t.closest('#adt-foot-native'))) { goNative(); return; }
      if ((el = t.closest('#adt-burger'))) {
        document.documentElement.classList.toggle('adt-nav-open');
        return;
      }
      if ((el = t.closest('#adt-nav-x'))) {
        document.documentElement.classList.remove('adt-nav-open');
        return;
      }
      if ((el = t.closest('.adt-nav-link'))) {
        document.documentElement.classList.remove('adt-nav-open');
        return;
      }
      if ((el = t.closest('#adt-drawer-x'))) { closeDrawer(); return; }
      if ((el = t.closest('#adt-drawer-back'))) { closeDrawer(); return; }
      if ((el = t.closest('#adt-drawer-prev'))) { drawerNav(-1); return; }
      if ((el = t.closest('#adt-drawer-next'))) { drawerNav(1); return; }
      if ((el = t.closest('#adt-det-save'))) { saveDrawerDetails(); return; }
      if ((el = t.closest('#adt-json'))) { copyJSON(S.drawerId); return; }
      if ((el = t.closest('#adt-dup'))) { duplicateEntry(S.drawerId); return; }
      if ((el = t.closest('#adt-del'))) { deleteEntry(S.drawerId); return; }
      if ((el = t.closest('.adt-hist-item'))) { var hid = +el.getAttribute('data-id'); if (hid) openDrawer(hid); return; }
      if ((el = t.closest('.adt-qchip'))) {
        var kind = el.getAttribute('data-kind'), val = el.getAttribute('data-val');
        applyQuick(kind, val);
        return;
      }
      if ((el = t.closest('.adt-donut-seg'))) { setFilter({ fAction: S.fAction === el.getAttribute('data-action') ? '' : el.getAttribute('data-action'), flagNoDetails: false, flagHorsHoraires: false }); return; }
      if ((el = t.closest('.adt-legend-item'))) { setFilter({ fAction: S.fAction === el.getAttribute('data-action') ? '' : el.getAttribute('data-action'), flagNoDetails: false, flagHorsHoraires: false }); return; }
      if ((el = t.closest('.adt-bar-g'))) {
        var mk = el.getAttribute('data-module'), uk = el.getAttribute('data-user');
        if (mk !== null) setFilter({ fModule: S.fModule === mk ? '' : mk, fAction: '', fUser: '', flagNoDetails: false, flagHorsHoraires: false });
        else if (uk !== null) setFilter({ fUser: S.fUser === uk ? '' : uk, fAction: '', fModule: '', flagNoDetails: false, flagHorsHoraires: false });
        return;
      }
      if ((el = t.closest('.adt-mini'))) {
        e.stopPropagation();
        var cid = +el.getAttribute('data-id'), act = el.getAttribute('data-act');
        if (act === 'dup') duplicateEntry(cid);
        else if (act === 'del') deleteEntry(cid);
        return;
      }
      if ((el = t.closest('.adt-card'))) { openDrawer(+el.getAttribute('data-id')); return; }
      if ((el = t.closest('.adt-tl-item'))) { openDrawer(+el.getAttribute('data-id')); return; }
      if ((el = t.closest('.adt-thbtn'))) {
        var th = el.closest('.adt-th'), k = th ? th.getAttribute('data-k') : null;
        if (k) {
          if (S.sort.k === k) S.sort.dir = -S.sort.dir;
          else S.sort = { k: k, dir: k === 'date' ? -1 : 1 };
          persistUI(); renderViews(); renderHead();
        }
        return;
      }
      if ((el = t.closest('.adt-row')) && !t.closest('.adt-cbx')) { openDrawer(+el.getAttribute('data-id')); return; }
      if (t.id === 'adt-overlay') { closeDialog(); return; }
    });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (!t) return;
      if (DLG && DLG.validate && t.closest && t.closest('#adt-dialog')) DLG.validate();
      if (t.id === 'adt-faction') setFilter({ fAction: t.value, flagNoDetails: false, flagHorsHoraires: false });
      else if (t.id === 'adt-fuser') setFilter({ fUser: t.value });
      else if (t.id === 'adt-fmodule') setFilter({ fModule: t.value });
      else if (t.id === 'adt-psize') {
        S.psize = +t.value || PAGE_SIZE; S.page = 1; persistUI(); renderViews();
      }
      else if (t.id === 'adt-selall') {
        var on = t.checked;
        pageEntries().forEach(function (en) { if (on) S.sel[en.id] = true; else delete S.sel[en.id]; });
        renderViews(); renderSelbar();
      } else if (t.classList && t.classList.contains('adt-cbx')) {
        var id = +t.getAttribute('data-id');
        if (t.checked) S.sel[id] = true; else delete S.sel[id];
        renderViews(); renderSelbar();
      }
    });
    root.addEventListener('input', function (e) {
      var t = e.target;
      if (t && DLG && DLG.onInput) DLG.onInput(t);
      if (t && t.id === 'adt-q') {
        S.q = t.value; S.page = 1;
        renderViews();
        var c = document.getElementById('adt-count');
        if (c) c.textContent = countTxt();
      }
      if (t && (t.id === 'adt-dfrom' || t.id === 'adt-dto')) {
        if (t.id === 'adt-dfrom') S.dFrom = t.value.trim();
        else S.dTo = t.value.trim();
        S.page = 1;
        renderViews();
        var c2 = document.getElementById('adt-count');
        if (c2) c2.textContent = countTxt();
      }
    });
    var q = document.getElementById('adt-q');
    if (q) q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { q.value = ''; S.q = ''; renderAll(); } });
    document.addEventListener('keydown', onKey);
    try {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var applyDark = function () {
        var dark = null;
        try {
          var v = localStorage.getItem('admina-dark');
          if (v === '1') dark = true;
          else if (v === '0') dark = false;
        } catch (e0) { /* LS indisponible */ }
        if (dark === null) {
          try {
            var bg = getComputedStyle(document.body).backgroundColor;
            var m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(bg || '');
            if (m) {
              var lum = (0.2126 * Number(m[1]) + 0.7152 * Number(m[2]) + 0.0722 * Number(m[3])) / 255;
              dark = lum < 0.4;
            }
          } catch (e1) { /* style indisponible */ }
        }
        if (dark === null) dark = mq.matches;
        if (dark) document.documentElement.classList.add('adt-dark');
        else document.documentElement.classList.remove('adt-dark');
      };
      if (mq.addEventListener) mq.addEventListener('change', applyDark);
      else if (mq.addListener) mq.addListener(applyDark);
      applyDark();
    } catch (e) { /* silencieux */ }
  }

  /* ================= rendus dynamiques ================= */
  function renderAll(keepToolbar) {
    if (!S.ready) return;
    S.filtered = filtered(S.journal);
    S.alerts = computeAlerts(S.journal);
    renderHero();
    renderBridge();
    renderAlerts();
    renderKPIs();
    renderCharts();
    if (!keepToolbar) renderToolbar();
    renderViews();
    renderSelbar();
  }
  function renderViews() {
    if (!S.ready) return;
    var maxPage = Math.max(1, Math.ceil(S.filtered.length / S.psize));
    if (S.page > maxPage) S.page = maxPage;
    renderCount();
    renderHead();
    renderTable();
    renderCards();
    renderFlux();
    showView();
  }
  function showView() {
    var map = { table: 'adt-view-table', cartes: 'adt-view-cartes', flux: 'adt-view-flux' };
    Object.keys(map).forEach(function (k) {
      var el = document.getElementById(map[k]);
      if (el) el.classList.toggle('adt-hide', S.view !== k);
    });
    document.querySelectorAll('#adt-page .adt-viewbtn').forEach(function (b) {
      b.classList.toggle('adt-on', b.getAttribute('data-view') === S.view);
      b.setAttribute('aria-selected', b.getAttribute('data-view') === S.view ? 'true' : 'false');
    });
  }
  function setView(v) {
    if (['table', 'cartes', 'flux'].indexOf(v) < 0) return;
    S.view = v; persistUI(); showView();
  }
  function countTxt() {
    return S.filtered.length + ' entrée' + (S.filtered.length > 1 ? 's' : '') + ' affichée' + (S.filtered.length > 1 ? 's' : '') +
      ' · ' + S.journal.length + ' au total · source : ' + (S.src === 'api' ? 'API' : S.src === 'ls' ? 'stockage local' : 'jeu de démonstration');
  }
  function renderCount() { var c = document.getElementById('adt-count'); if (c) c.textContent = countTxt(); }

  function renderHero() {
    var j = S.journal;
    var cr = j.filter(function (e) { return e.action === 'Création'; }).length;
    var sup = j.filter(function (e) { return e.action === 'Suppression'; }).length;
    var exp = j.filter(function (e) { return e.action === 'Export'; }).length;
    var sens = sup + exp;
    var last = null;
    j.forEach(function (e) { var d = pd(e.date); if (d && (!last || d > last)) last = d; });
    var sensTxt = sens === 1 ? '1 suppression sensible' : sens > 1 ? sens + ' actions sensibles' : 'aucune action sensible';
    var el = document.getElementById('adt-hero-txt');
    if (el) el.textContent = j.length + ' entrées · ' + cr + ' création' + (cr > 1 ? 's' : '') + ' · ' + sensTxt + ' · dernier événement ' + ilYa(last);
  }
  function renderBridge() {
    var chip = document.getElementById('adt-bridge-chip');
    var panel = document.getElementById('adt-live');
    if (!chip || !panel) return;
    var b = bridgeEntries();
    if (!b.length) {
      chip.classList.add('adt-hide');
      panel.classList.add('adt-hide');
      panel.innerHTML = '';
      return;
    }
    chip.classList.remove('adt-hide');
    chip.textContent = 'journal live des modules (' + b.length + ' entrées)';
    var rows = b.slice(-20).reverse().map(function (x) {
      return '<div class="adt-live-item">' +
        '<span class="adt-live-date">' + esc(x.date || '—') + '</span>' +
        '<span class="adt-live-mod">' + esc(trunc(x.module, 22)) + '</span>' +
        '<span class="adt-live-txt">' + esc(trunc(x.text, 90)) + '</span>' +
      '</div>';
    }).join('');
    panel.innerHTML = '<div class="adt-live-t">Journal live des modules — ' + b.length + ' entrée(s) reçue(s) du reste du système (lecture seule)</div>' +
      (rows || '<div class="adt-live-empty">Aucune entrée détaillée exposée par le pont.</div>');
  }
  function toggleLive() {
    var p = document.getElementById('adt-live');
    if (p) p.classList.toggle('adt-hide');
  }
  function renderAlerts() {
    var box = document.getElementById('adt-alerts');
    if (!box) return;
    box.innerHTML = S.alerts.map(function (a, i) {
      return '<button type="button" class="adt-alert' + (a.n > 0 ? ' adt-alert-hot' : '') + (a.on ? ' adt-on' : '') + '" data-i="' + i + '"' +
        (a.on ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' +
        '<span class="adt-alert-ico">' + a.ico + '</span>' +
        '<span class="adt-alert-txt">' + esc(a.txt) + '</span>' +
        '<span class="adt-alert-go">' + (a.on ? 'filtre actif ✕' : 'filtrer ›') + '</span>' +
      '</button>';
    }).join('');
  }
  function renderKPIs() {
    var box = document.getElementById('adt-kpis');
    if (!box) return;
    var j = S.journal;
    var actors = uniq(j.map(function (e) { return e.utilisateur; }));
    var kpis = [
      { lab: 'Entrées', num: j.length, sub: S.filtered.length + ' après filtres', action: '', on: false },
      { lab: 'Créations', num: j.filter(function (e) { return e.action === 'Création'; }).length, sub: 'nouveaux enregistrements', action: 'Création', on: S.fAction === 'Création' },
      { lab: 'Modifications', num: j.filter(function (e) { return e.action === 'Modification'; }).length, sub: 'changements de statut', action: 'Modification', on: S.fAction === 'Modification' },
      { lab: 'Suppressions', num: j.filter(function (e) { return e.action === 'Suppression'; }).length, sub: 'sensibles ⚠', action: 'Suppression', on: S.fAction === 'Suppression' },
      { lab: 'Exports', num: j.filter(function (e) { return e.action === 'Export'; }).length, sub: 'sensibles ⚠', action: 'Export', on: S.fAction === 'Export' },
      { lab: 'Acteurs distincts', num: actors.length, sub: actors.length ? trunc(actors.slice(0, 2).join(', '), 34) : '—', action: '', on: false }
    ];
    box.innerHTML = kpis.map(function (k) {
      return '<div class="adt-kpi' + (k.action ? ' adt-kpi-btn' : '') + (k.on ? ' adt-on' : '') + '"' +
        (k.action ? ' role="button" tabindex="0" data-action="' + esc(k.action) + '" title="Filtrer : ' + esc(k.action) + '"' : '') + '>' +
        '<span class="adt-kpi-num">' + k.num + '</span>' +
        '<span class="adt-kpi-lab">' + esc(k.lab) + '</span>' +
        '<span class="adt-kpi-sub">' + esc(k.sub) + '</span>' +
      '</div>';
    }).join('');
    box.querySelectorAll('.adt-kpi-btn').forEach(function (k) {
      k.addEventListener('click', function () {
        var a = k.getAttribute('data-action');
        setFilter({ fAction: S.fAction === a ? '' : a, flagNoDetails: false, flagHorsHoraires: false });
      });
      k.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); k.click(); } });
    });
  }

  /* ================= graphiques SVG ================= */
  function counts(arr, key) {
    var m = {};
    arr.forEach(function (e) { var k = e[key] || '—'; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(function (k) { return { k: k, n: m[k] }; }).sort(function (a, b) { return b.n - a.n; });
  }
  function renderCharts() {
    var j = S.journal;
    var total = j.length || 1;
    var ca = counts(j, 'action');
    var order = {};
    ACTIONS.forEach(function (a, i) { order[a] = i; });
    ca.sort(function (a, b) { return (order[a.k] != null ? order[a.k] : 99) - (order[b.k] != null ? order[b.k] : 99); });
    var boxA = document.getElementById('adt-ch-action');
    if (boxA) {
      var r = 52, c = 2 * Math.PI * r, off = 0, segs = '';
      ca.forEach(function (x) {
        var len = x.n / total * c;
        segs += '<circle class="adt-donut-seg" data-action="' + esc(x.k) + '" cx="70" cy="70" r="' + r + '" fill="none" stroke="' + (COLORS[x.k] || '#8aa0b5') + '" stroke-width="26" stroke-dasharray="' + len.toFixed(2) + ' ' + (c - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 70 70)"><title>' + esc(x.k) + ' : ' + x.n + '</title></circle>';
        off += len;
      });
      boxA.innerHTML = '<div class="adt-donut-wrap">' +
        '<svg class="adt-donut" viewBox="0 0 140 140" role="img" aria-label="Répartition des entrées par action">' + segs +
        '<text x="70" y="66" text-anchor="middle" class="adt-donut-n">' + j.length + '</text>' +
        '<text x="70" y="84" text-anchor="middle" class="adt-donut-l">entrées</text></svg>' +
        '<div class="adt-legend">' + ACTIONS.map(function (a) {
          var n = j.filter(function (e) { return e.action === a; }).length;
          return '<span class="adt-legend-item' + (S.fAction === a ? ' adt-on' : '') + '" data-action="' + esc(a) + '"><span class="adt-dot" data-action="' + esc(a) + '"></span>' + esc(a) + ' <b>' + n + '</b></span>';
        }).join('') + '</div></div>';
    }
    var cm = counts(j, 'module').slice(0, 8);
    var boxM = document.getElementById('adt-ch-module');
    if (boxM) boxM.innerHTML = barsSVG(cm, 'module', 'adt-bar-mod');
    var cu = counts(j, 'utilisateur').slice(0, 7);
    var boxU = document.getElementById('adt-ch-user');
    if (boxU) boxU.innerHTML = barsSVG(cu, 'user', 'adt-bar-user');
  }
  function barsSVG(items, attr, cls) {
    if (!items.length) return '<div class="adt-empty">Aucune donnée à représenter.</div>';
    var max = 1;
    items.forEach(function (it) { if (it.n > max) max = it.n; });
    var rowH = 26, h = items.length * rowH + 6, W = 380, labelW = 118;
    var s = '<svg class="adt-bars" viewBox="0 0 ' + W + ' ' + h + '" role="img" preserveAspectRatio="xMinYMin meet">';
    items.forEach(function (it, i) {
      var y = i * rowH + 4;
      var w = Math.max(3, (it.n / max) * (W - labelW - 44));
      s += '<g class="adt-bar-g" data-' + attr + '="' + esc(it.k) + '">' +
        '<text x="0" y="' + (y + 13) + '" class="adt-bar-l">' + esc(trunc(it.k, 15)) + '</text>' +
        '<rect class="adt-bar-r ' + cls + '" x="' + labelW + '" y="' + y + '" width="' + w.toFixed(1) + '" height="18" rx="5"><title>' + esc(it.k) + ' : ' + it.n + ' entrée(s)</title></rect>' +
        '<text x="' + (labelW + w + 6).toFixed(1) + '" y="' + (y + 13) + '" class="adt-bar-n">' + it.n + '</text>' +
      '</g>';
    });
    return s + '</svg>';
  }

  /* ================= toolbar / filtres =================
     Les contrôles sont resynchronisés à chaque renderAll (valeurs,
     options dynamiques utilisateurs/modules, pastilles de période
     et drapeaux actifs) — sans jamais écraser la saisie en cours. */
  function renderPeriod() {
    var box = document.getElementById('adt-periodsw');
    if (!box) return;
    box.querySelectorAll('.adt-period').forEach(function (b) {
      b.classList.toggle('adt-on', (b.getAttribute('data-p') || '') === S.fPeriod);
      b.setAttribute('aria-pressed', (b.getAttribute('data-p') || '') === S.fPeriod ? 'true' : 'false');
    });
  }
  function renderToolbar() {
    var fa = document.getElementById('adt-faction');
    if (fa) {
      fa.innerHTML = '<option value="">Toutes les actions</option><option value="sensible">⚠ Sensibles (suppression + export)</option>' +
        ACTIONS.map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + '</option>'; }).join('');
      fa.value = S.fAction;
      if (fa.value !== S.fAction) fa.value = '';
    }
    var users = uniq(S.journal.map(function (e) { return e.utilisateur; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    var fu = document.getElementById('adt-fuser');
    if (fu) {
      fu.innerHTML = '<option value="">Tous les utilisateurs</option>' + users.map(function (u) { return '<option value="' + esc(u) + '">' + esc(u) + '</option>'; }).join('');
      fu.value = S.fUser;
      if (fu.value !== S.fUser) fu.value = '';
    }
    var mods = uniq(MODULES_REF.concat(S.journal.map(function (e) { return e.module; }))).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    var fm = document.getElementById('adt-fmodule');
    if (fm) {
      fm.innerHTML = '<option value="">Tous les modules</option>' + mods.map(function (m) { return '<option value="' + esc(m) + '">' + esc(m) + '</option>'; }).join('');
      fm.value = S.fModule;
      if (fm.value !== S.fModule) fm.value = '';
    }
    var q = document.getElementById('adt-q');
    if (q && document.activeElement !== q && q.value !== S.q) q.value = S.q;
    var df = document.getElementById('adt-dfrom'), dt = document.getElementById('adt-dto');
    if (df && document.activeElement !== df && df.value !== S.dFrom) df.value = S.dFrom;
    if (dt && document.activeElement !== dt && dt.value !== S.dTo) dt.value = S.dTo;
    renderPeriod();
    var flags = document.getElementById('adt-flags');
    if (flags) {
      var list = [];
      if (S.flagNoDetails) list.push({ k: 'flagNoDetails', txt: '✎ Modifications sans détails' });
      if (S.flagHorsHoraires) list.push({ k: 'flagHorsHoraires', txt: '🌙 Connexions hors heures ouvrables' });
      if (list.length) {
        flags.classList.remove('adt-hide');
        flags.innerHTML = list.map(function (f) {
          return '<button type="button" class="adt-flag" data-flag="' + f.k + '">' + esc(f.txt) + ' ✕</button>';
        }).join('');
      } else {
        flags.classList.add('adt-hide');
        flags.innerHTML = '';
      }
    }
  }
  function applyQuick(kind, val) {
    if (kind === 'action') {
      if (S.fAction === val) val = '';
      setFilter({ fAction: val, flagNoDetails: false, flagHorsHoraires: false });
    } else if (kind === 'user') {
      setFilter({ fUser: S.fUser === val ? '' : val });
    } else if (kind === 'module') {
      setFilter({ fModule: S.fModule === val ? '' : val });
    }
  }
  function qchip(kind, val, label, color) {
    var on = (kind === 'action' && (S.fAction === val || (val === 'sensible' && S.fAction === 'sensible'))) ||
             (kind === 'user' && S.fUser === val) || (kind === 'module' && S.fModule === val);
    return '<button type="button" class="adt-qchip' + (on ? ' adt-on' : '') + '" data-kind="' + kind + '" data-val="' + esc(val) + '">' +
      (color ? '<span class="adt-dot" data-action="' + esc(val) + '"></span>' : '') + esc(label) + '</button>';
  }

  /* ================= table ================= */
  var COLS = [
    { k: 'numero', t: 'N°' },
    { k: 'date', t: 'Date' },
    { k: 'utilisateur', t: 'Utilisateur' },
    { k: 'action', t: 'Action' },
    { k: 'module', t: 'Module' },
    { k: 'details', t: 'Détails' }
  ];
  function renderHead() {
    var row = document.getElementById('adt-thead-row');
    if (!row) return;
    row.innerHTML = COLS.map(function (c) {
      var dir = S.sort.k === c.k ? (S.sort.dir > 0 ? 'ascending' : 'descending') : 'none';
      var arrow = S.sort.k === c.k ? (S.sort.dir > 0 ? '▲' : '▼') : '↕';
      return '<th class="adt-th" data-k="' + c.k + '" aria-sort="' + dir + '" scope="col">' +
        '<button type="button" class="adt-thbtn">' + c.t + ' <span class="adt-arrow">' + arrow + '</span></button></th>';
    }).join('') +
      '<th class="adt-th adt-th-act" scope="col">Actions</th>' +
      '<th class="adt-th adt-th-sel" scope="col"><input type="checkbox" id="adt-selall" aria-label="Tout sélectionner sur la page"></th>';
    var all = document.getElementById('adt-selall');
    if (all) {
      var pe = pageEntries();
      all.checked = pe.length > 0 && pe.every(function (e) { return S.sel[e.id]; });
    }
  }
  function pageEntries() {
    var a = (S.page - 1) * S.psize;
    return S.filtered.slice(a, a + S.psize);
  }
  function renderTable() {
    var tb = document.getElementById('adt-tbody');
    if (!tb) return;
    var pe = pageEntries();
    if (!pe.length) {
      tb.innerHTML = '<tr><td class="adt-td adt-empty" colspan="8">Aucune entrée ne correspond aux filtres. Le journal d\'audit ne s\'invente pas : élargissez la recherche ou réinitialisez.</td></tr>';
    } else {
      tb.innerHTML = pe.map(function (e) {
        var selOn = !!S.sel[e.id];
        return '<tr class="adt-row' + (selOn ? ' adt-selrow' : '') + '" data-id="' + e.id + '">' +
          '<td class="adt-td adt-td-sel"><input type="checkbox" class="adt-cbx" data-id="' + e.id + '"' + (selOn ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(e.numero) + '"></td>' +
          '<td class="adt-td adt-num">' + esc(e.numero) + '</td>' +
          '<td class="adt-td">' + esc(e.date) + '</td>' +
          '<td class="adt-td">' + esc(e.utilisateur) + '</td>' +
          '<td class="adt-td"><span class="adt-badge" data-action="' + esc(e.action) + '">' + esc(e.action) + '</span>' + (SENSIBLE[e.action] ? ' <span class="adt-warn" title="Action sensible — à relire après incident">⚠</span>' : '') + '</td>' +
          '<td class="adt-td">' + esc(e.module) + '</td>' +
          '<td class="adt-td adt-detcell" title="' + esc(e.details) + '">' + esc(trunc(e.details, 70)) + '</td>' +
          '<td class="adt-td adt-td-act">' +
            '<button type="button" class="adt-mini" data-id="' + e.id + '" data-act="dup" title="Dupliquer ' + esc(e.numero) + '">⧉</button>' +
            '<button type="button" class="adt-mini adt-mini-danger" data-id="' + e.id + '" data-act="del" title="Supprimer ' + esc(e.numero) + '">🗑</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }
    var maxPage = Math.max(1, Math.ceil(S.filtered.length / S.psize));
    var info = document.getElementById('adt-pager-info');
    if (info) info.textContent = 'Page ' + S.page + ' / ' + maxPage + ' — ' + S.filtered.length + ' entrée(s)';
    var psz = document.getElementById('adt-psize');
    if (psz && +psz.value !== S.psize) psz.value = String(S.psize);
    var prev = document.getElementById('adt-prev'), next = document.getElementById('adt-next');
    if (prev) prev.disabled = S.page <= 1;
    if (next) next.disabled = S.page >= maxPage;
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var box = document.getElementById('adt-cards');
    if (!box) return;
    var pe = pageEntries();
    if (!pe.length) {
      box.innerHTML = '<div class="adt-empty">Aucune entrée à afficher en cartes.</div>';
      return;
    }
    box.innerHTML = pe.map(function (e) {
      return '<div class="adt-card' + (S.sel[e.id] ? ' adt-selrow' : '') + '" data-id="' + e.id + '">' +
        '<div class="adt-card-head"><span class="adt-card-num">' + esc(e.numero) + '</span><span class="adt-card-date">' + esc(e.date) + '</span></div>' +
        '<div class="adt-card-badges"><span class="adt-badge" data-action="' + esc(e.action) + '">' + esc(e.action) + '</span>' +
        (SENSIBLE[e.action] ? '<span class="adt-warn" title="Action sensible">⚠</span>' : '') +
        '<span class="adt-card-mod">' + esc(e.module) + '</span></div>' +
        '<div class="adt-card-user">' + esc(e.utilisateur) + '</div>' +
        '<div class="adt-card-det">' + esc(trunc(e.details || '—', 110)) + '</div>' +
        '<div class="adt-card-foot">' +
          '<button type="button" class="adt-mini" data-id="' + e.id + '" data-act="dup" title="Dupliquer">⧉ Dupliquer</button>' +
          '<button type="button" class="adt-mini adt-mini-danger" data-id="' + e.id + '" data-act="del" title="Supprimer">🗑 Supprimer</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ================= VUE FLUX D'ACTIVITÉ (signature) =================
     Fil vertical groupé par jour (dates longues françaises), un
     point coloré par action, l'heure, l'acteur, le module et le
     détail de chaque entrée ; pastille ⚠ rouge sur les actions
     sensibles ; filtres rapides au-dessus du fil ; clic = fiche. */
  function renderFlux() {
    var qa = document.getElementById('adt-quick-actions');
    var qu = document.getElementById('adt-quick-users');
    var qm = document.getElementById('adt-quick-modules');
    if (qa) {
      qa.innerHTML = qchip('action', '', 'Toutes') +
        qchip('action', 'sensible', '⚠ Sensibles') +
        ACTIONS.map(function (a) { return qchip('action', a, a, true); }).join('');
    }
    if (qu) {
      var us = uniq(S.journal.map(function (e) { return e.utilisateur; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
      qu.innerHTML = us.length ? us.map(function (u) { return qchip('user', u, u); }).join('') : '<span class="adt-hint">Aucun acteur.</span>';
    }
    if (qm) {
      var ms = uniq(S.journal.map(function (e) { return e.module; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
      qm.innerHTML = ms.length ? ms.map(function (m) { return qchip('module', m, m); }).join('') : '<span class="adt-hint">Aucun module.</span>';
    }
    var box = document.getElementById('adt-timeline');
    if (!box) return;
    if (!S.filtered.length) {
      box.innerHTML = '<div class="adt-empty">Le fil d\'activité est vide pour ces filtres. Chaque changement de statut du système apparaîtra ici, daté et signé.</div>';
      return;
    }
    var days = {};
    var order = [];
    S.filtered.forEach(function (e) {
      var d = pd(e.date);
      var k = d ? dayKey(d) : '?';
      if (!days[k]) { days[k] = { d: d, items: [] }; order.push(k); }
      days[k].items.push(e);
    });
    order.sort(function (a, b) { return a === '?' ? -1 : b === '?' ? 1 : b.localeCompare(a); });
    box.innerHTML = order.map(function (k) {
      var g = days[k];
      var title = g.d ? dayFr(g.d) : 'Date inconnue';
      return '<div class="adt-tl-day">' +
        '<div class="adt-tl-daytitle">' + esc(title) + '<span class="adt-tl-daycount">' + g.items.length + ' entrée' + (g.items.length > 1 ? 's' : '') + '</span></div>' +
        '<div class="adt-tl-list">' + g.items.map(tlItem).join('') + '</div>' +
      '</div>';
    }).join('');
  }
  function tlItem(e) {
    var d = pd(e.date);
    var hhmm = d ? pad2(d.getHours()) + ':' + pad2(d.getMinutes()) : '--:--';
    return '<button type="button" class="adt-tl-item" data-id="' + e.id + '" title="Ouvrir la fiche ' + esc(e.numero) + '">' +
      '<span class="adt-tl-dot" data-action="' + esc(e.action) + '"></span>' +
      '<span class="adt-tl-time">' + hhmm + '</span>' +
      '<span class="adt-tl-body">' +
        '<span class="adt-tl-top"><b class="adt-tl-user">' + esc(e.utilisateur) + '</b>' +
        '<span class="adt-badge" data-action="' + esc(e.action) + '">' + esc(e.action) + '</span>' +
        '<span class="adt-tl-mod">' + esc(e.module) + '</span>' +
        (SENSIBLE[e.action] ? '<span class="adt-warn" title="Action sensible — à relire après incident">⚠</span>' : '') +
        '<span class="adt-tl-num">' + esc(e.numero) + '</span></span>' +
        '<span class="adt-tl-det">' + esc(e.details || '—') + '</span>' +
      '</span>' +
    '</button>';
  }

  /* ================= sélection groupée ================= */
  function renderSelbar() {
    var bar = document.getElementById('adt-selbar');
    if (!bar) return;
    var n = Object.keys(S.sel).length;
    if (!n) { bar.classList.add('adt-hide'); return; }
    bar.classList.remove('adt-hide');
    var txt = document.getElementById('adt-selbar-txt');
    if (txt) txt.textContent = n + ' entrée' + (n > 1 ? 's' : '') + ' sélectionnée' + (n > 1 ? 's' : '') + ' — la suppression d\'une piste d\'audit est un acte grave, elle demande une confirmation.';
  }
  function deleteSelected() {
    var ids = Object.keys(S.sel).map(Number);
    if (!ids.length) return;
    openConfirm(
      'Supprimer ' + ids.length + ' entrée' + (ids.length > 1 ? 's' : '') + ' d\'audit ?',
      'Cette action est définitive. ' + (ids.length > 1 ? 'Les entrées seront retirées' : 'L\'entrée sera retirée') + ' du journal sans laisser de trace — à réserver aux corrections légitimes.',
      function () {
        var j = fresh();
        var set = {};
        ids.forEach(function (i) { set[i] = 1; });
        j = j.filter(function (e) { return !set[e.id]; });
        S.sel = {};
        save(j);
        renderAll();
        toast(ids.length + ' entrée(s) supprimée(s)', 'ok');
      }
    );
  }

  /* ================= drawer fiche entrée =================
     La fiche répond aux quatre questions de la page (QUI · QUAND ·
     QUOI · DANS QUEL CONTEXTE), permet une édition rapide des
     détails, liste l'historique lié et donne les actes lourds
     (dupliquer, supprimer, copier en JSON). */
  function openDrawer(id) {
    var j = fresh();
    var e = byId(j, id);
    if (!e) { toast('Entrée introuvable (elle a peut-être été supprimée).', 'err'); return; }
    S.drawerId = id;
    var num = document.getElementById('adt-drawer-num');
    if (num) num.textContent = e.numero + ' · ' + e.module;
    var bad = document.getElementById('adt-drawer-badges');
    if (bad) {
      bad.innerHTML = '<span class="adt-badge" data-action="' + esc(e.action) + '">' + esc(e.action) + '</span>' +
        (SENSIBLE[e.action] ? '<span class="adt-warn">⚠ action sensible — à relire après incident</span>' : '');
    }
    var d = pd(e.date);
    var kv = document.getElementById('adt-drawer-kv');
    if (kv) {
      kv.innerHTML =
        '<div class="adt-dk">QUI</div><div class="adt-dv">' + esc(e.utilisateur) + '</div>' +
        '<div class="adt-dk">QUAND</div><div class="adt-dv">' + esc(e.date) + (d ? ' <span class="adt-hint">(' + esc(dayFr(d)) + ')</span>' : '') + '</div>' +
        '<div class="adt-dk">QUOI</div><div class="adt-dv">' + esc(e.action) + ' · module ' + esc(e.module) + '</div>' +
        '<div class="adt-dk">CONTEXTE</div><div class="adt-dv">' + esc(e.details || '— aucun détail enregistré —') + '</div>';
    }
    var ta = document.getElementById('adt-drawer-det');
    if (ta) ta.value = e.details || '';
    var hist = document.getElementById('adt-hist');
    if (hist) {
      var rel = j.filter(function (x) { return x.id !== e.id && (x.utilisateur === e.utilisateur || x.module === e.module); });
      rel.sort(function (a, b) { return (pd(b.date) ? pd(b.date).getTime() : 0) - (pd(a.date) ? pd(a.date).getTime() : 0); });
      hist.innerHTML = rel.length ? rel.slice(0, 6).map(function (x) {
        return '<button type="button" class="adt-hist-item" data-id="' + x.id + '">' +
          '<span class="adt-hist-date">' + esc(x.date) + '</span>' +
          '<span class="adt-badge" data-action="' + esc(x.action) + '">' + esc(x.action) + '</span>' +
          '<span class="adt-hist-txt">' + esc(x.utilisateur) + ' · ' + esc(x.module) + ' — ' + esc(trunc(x.details || '—', 46)) + '</span>' +
        '</button>';
      }).join('') : '<div class="adt-hint">Aucune autre entrée liée à cet utilisateur ou ce module.</div>';
    }
    var dr = document.getElementById('adt-drawer');
    var bk = document.getElementById('adt-drawer-back');
    if (dr) dr.classList.add('adt-open');
    if (bk) bk.classList.remove('adt-hide');
  }
  function closeDrawer() {
    var dr = document.getElementById('adt-drawer');
    var bk = document.getElementById('adt-drawer-back');
    if (dr) dr.classList.remove('adt-open');
    if (bk) bk.classList.add('adt-hide');
    S.drawerId = null;
  }
  function fresh() {
    var api = findApi();
    if (api) {
      try {
        var d = api.getData();
        if (d && Array.isArray(d.journal) && d.journal.length) { S.api = api; S.src = 'api'; return norm(d.journal); }
      } catch (e) { /* silencieux */ }
    }
    return S.journal;
  }
  function saveDrawerDetails() {
    if (!S.drawerId) return;
    var j = fresh();
    var e = byId(j, S.drawerId);
    var ta = document.getElementById('adt-drawer-det');
    if (!e || !ta) return;
    e.details = ta.value.trim();
    save(j);
    renderAll();
    openDrawer(S.drawerId);
    toast('Détails enregistrés — le contexte est à jour', 'ok');
  }

  /* ================= dialog création / édition ================= */
  function openOverlay(html) {
    var ov = document.getElementById('adt-overlay');
    var dl = document.getElementById('adt-dialog');
    if (!ov || !dl) return;
    dl.innerHTML = html;
    ov.classList.remove('adt-hide');
    var f = dl.querySelector('input,select,textarea');
    if (f) { try { f.focus(); } catch (e) { /* silencieux */ } }
  }
  function closeDialog() {
    var ov = document.getElementById('adt-overlay');
    if (ov) { ov.classList.add('adt-hide'); }
    var dl = document.getElementById('adt-dialog');
    if (dl) dl.innerHTML = '';
    DLG = null;
  }
  function dialogHead(title) {
    return '<div class="adt-dialog-head"><h4 class="adt-dialog-t">' + title + '</h4><button type="button" class="adt-drawer-x" data-close="1" aria-label="Fermer">×</button></div>';
  }
  function openForm(id) {
    var j = fresh();
    var e = id ? byId(j, id) : null;
    var users = uniq(j.map(function (x) { return x.utilisateur; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    var mods = uniq(MODULES_REF.concat(j.map(function (x) { return x.module; }))).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    var dlUser = 'adt-dl-users-' + Date.now();
    var dlMod = 'adt-dl-mods-' + Date.now();
    openOverlay(
      dialogHead(e ? 'Modifier l\'entrée ' + esc(e.numero) : 'Nouvelle entrée d\'audit') +
      '<div class="adt-form" id="adt-form">' +
        '<div class="adt-grid2">' +
          '<div class="adt-field"><label class="adt-label" for="adt-f-num">Numéro</label>' +
            '<input class="adt-input" id="adt-f-num" value="' + esc(e ? e.numero : nextNumero(j)) + '" readonly></div>' +
          '<div class="adt-field"><label class="adt-label" for="adt-f-date">Date (jj/mm/aaaa hh:mm) <span class="adt-hint">vide = maintenant</span></label>' +
            '<input class="adt-input" id="adt-f-date" placeholder="jj/mm/aaaa hh:mm" value="' + esc(e ? e.date : '') + '"><div class="adt-err" data-err="date"></div></div>' +
        '</div>' +
        '<div class="adt-field"><label class="adt-label" for="adt-f-user">Utilisateur (QUI) — obligatoire</label>' +
          '<input class="adt-input" id="adt-f-user" list="' + dlUser + '" value="' + esc(e ? e.utilisateur : '') + '" placeholder="M. / Mme. — qui a effectué le changement">' +
          '<datalist id="' + dlUser + '">' + users.map(function (u) { return '<option value="' + esc(u) + '"></option>'; }).join('') + '</datalist>' +
          '<div class="adt-err" data-err="user"></div></div>' +
        '<div class="adt-grid2">' +
          '<div class="adt-field"><label class="adt-label" for="adt-f-action">Action (QUOI) — obligatoire</label>' +
            '<select class="adt-select" id="adt-f-action"><option value="">— choisir —</option>' +
            ACTIONS.map(function (a) { return '<option value="' + esc(a) + '"' + (e && e.action === a ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') +
            '</select><div class="adt-err" data-err="action"></div></div>' +
          '<div class="adt-field"><label class="adt-label" for="adt-f-module">Module — obligatoire</label>' +
            '<input class="adt-input" id="adt-f-module" list="' + dlMod + '" value="' + esc(e ? e.module : '') + '" placeholder="Demandes, Entretiens, Système…">' +
            '<datalist id="' + dlMod + '">' + mods.map(function (m) { return '<option value="' + esc(m) + '"></option>'; }).join('') + '</datalist>' +
            '<div class="adt-err" data-err="module"></div></div>' +
        '</div>' +
        '<div class="adt-field"><label class="adt-label" for="adt-f-details">Détails (DANS QUEL CONTEXTE)</label>' +
          '<textarea class="adt-textarea" id="adt-f-details" rows="3" placeholder="Ex. : Création demande DR-2025-008 · Modification entretien ENT-2025-004 · Connexion depuis 192.168.1.45">' + esc(e ? e.details : '') + '</textarea></div>' +
        '<div class="adt-form-foot">' +
          '<button type="button" class="adt-btn" data-close="1">Annuler</button>' +
          '<button type="button" class="adt-btn adt-btn-primary" id="adt-form-save"' + (e ? '' : ' disabled') + '>' + (e ? 'Enregistrer' : 'Créer l\'entrée') + '</button>' +
        '</div>' +
      '</div>'
    );
    var saveBtn = null;
    function vals() {
      return {
        date: (document.getElementById('adt-f-date') || {}).value || '',
        user: ((document.getElementById('adt-f-user') || {}).value || '').trim(),
        action: (document.getElementById('adt-f-action') || {}).value || '',
        module: ((document.getElementById('adt-f-module') || {}).value || '').trim(),
        details: (document.getElementById('adt-f-details') || {}).value || ''
      };
    }
    function validate() {
      var v = vals();
      var errs = { date: '', user: '', action: '', module: '' };
      if (v.date.trim() && !pd(v.date)) errs.date = 'Format attendu : jj/mm/aaaa hh:mm';
      if (v.user.length < 2) errs.user = 'Utilisateur obligatoire (min. 2 caractères) — la piste d\'audit répond toujours à QUI';
      if (!v.action) errs.action = 'Action obligatoire — Création, Modification, Suppression, Connexion ou Export';
      if (v.module.length < 2) errs.module = 'Module obligatoire (min. 2 caractères)';
      var dl2 = document.getElementById('adt-dialog');
      if (dl2) {
        Object.keys(errs).forEach(function (k) {
          var el = dl2.querySelector('[data-err="' + k + '"]');
          if (el) el.textContent = errs[k];
        });
      }
      var ok = !errs.date && !errs.user && !errs.action && !errs.module;
      saveBtn = document.getElementById('adt-form-save');
      if (saveBtn) saveBtn.disabled = !ok;
      return ok;
    }
    function submit() {
      var v = vals();
      if (!validate()) return;
      var j2 = fresh();
      var dateTxt = v.date.trim() || fmtNow();
      if (e) {
        var cur = byId(j2, e.id);
        if (cur) {
          cur.date = dateTxt; cur.utilisateur = v.user; cur.action = v.action;
          cur.module = v.module; cur.details = v.details.trim();
        }
        save(j2); renderAll(); closeDialog();
        toast('Entrée ' + e.numero + ' modifiée', 'ok');
      } else {
        var nid = maxId(j2) + 1;
        var nnum = nextNumero(j2);
        j2.push({ id: nid, numero: nnum, date: dateTxt, utilisateur: v.user, action: v.action, module: v.module, details: v.details.trim() });
        save(j2); renderAll(); closeDialog();
        toast('Entrée ' + nnum + ' créée', 'ok');
      }
    }
    DLG = { kind: 'form', validate: validate, submit: submit, onInput: null };
    validate();
  }

  /* ================= duplication / suppression ================= */
  function duplicateEntry(id) {
    var j = fresh();
    var e = byId(j, id);
    if (!e) return;
    var nid = maxId(j) + 1;
    var copy = {
      id: nid, numero: nextNumero(j), date: fmtNow(), utilisateur: e.utilisateur,
      action: e.action, module: e.module, details: (e.details ? e.details + ' ' : '') + '(dupliqué de ' + e.numero + ')'
    };
    j.push(copy);
    save(j);
    renderAll();
    closeDrawer();
    toast('Entrée dupliquée : ' + copy.numero, 'ok');
  }
  function deleteEntry(id) {
    var j = fresh();
    var e = byId(j, id);
    if (!e) return;
    openConfirm(
      'Supprimer l\'entrée ' + esc(e.numero) + ' ?',
      esc(e.action) + ' de ' + esc(e.utilisateur) + ' — ' + esc(trunc(e.details || 'sans détails', 80)) + '. Cette ligne disparaîtra définitivement de la piste d\'audit.',
      function () {
        var j2 = fresh().filter(function (x) { return x.id !== id; });
        if (S.drawerId === id) closeDrawer();
        save(j2);
        renderAll();
        toast('Entrée ' + e.numero + ' supprimée', 'ok');
      }
    );
  }

  /* ================= confirm maison / seuils / aide ================= */
  function openConfirm(title, txt, onYes) {
    openOverlay(
      dialogHead(title) +
      '<div class="adt-confirm-txt">' + txt + '</div>' +
      '<div class="adt-form-foot">' +
        '<button type="button" class="adt-btn" data-close="1">Annuler</button>' +
        '<button type="button" class="adt-btn adt-btn-danger" id="adt-confirm-yes">Confirmer la suppression</button>' +
      '</div>'
    );
    DLG = { kind: 'confirm', onYes: onYes };
  }
  function openSeuils() {
    var s = S.seuils;
    openOverlay(
      dialogHead('Seuils d\'alerte (K)') +
      '<div class="adt-form">' +
        '<p class="adt-hint">Les seuils pilotent les alertes de la piste d\'audit : après combien de temps une action sensible reste-t-elle « à relire », et à partir de quand un module ou un acteur est-il considéré comme silencieux. Ils sont persistés localement.</p>' +
        '<div class="adt-seuils-row"><label class="adt-label" for="adt-se-sensible">Actions sensibles — fenêtre de relecture : <b class="adt-seuils-val" id="adt-v-sensible">' + s.sensibleJours + ' j</b></label>' +
          '<input type="range" class="adt-range" id="adt-se-sensible" min="7" max="30" step="1" value="' + s.sensibleJours + '"></div>' +
        '<div class="adt-seuils-row"><label class="adt-label" for="adt-se-silence">Silence d\'un module / acteur : <b class="adt-seuils-val" id="adt-v-silence">' + s.silenceJours + ' j</b></label>' +
          '<input type="range" class="adt-range" id="adt-se-silence" min="14" max="90" step="1" value="' + s.silenceJours + '"></div>' +
        '<div class="adt-form-foot">' +
          '<button type="button" class="adt-btn" data-close="1">Fermer</button>' +
          '<button type="button" class="adt-btn" id="adt-se-def">Valeurs par défaut</button>' +
          '<button type="button" class="adt-btn adt-btn-primary" id="adt-se-save">Enregistrer</button>' +
        '</div>' +
      '</div>'
    );
    var r1 = document.getElementById('adt-se-sensible'), r2 = document.getElementById('adt-se-silence');
    var v1 = document.getElementById('adt-v-sensible'), v2 = document.getElementById('adt-v-silence');
    DLG = { kind: 'seuils', onInput: onInput, onDef: onDef, onSave: onSave };
    function onInput(t) {
      if (t.id === 'adt-se-sensible' && v1) v1.textContent = t.value + ' j';
      if (t.id === 'adt-se-silence' && v2) v2.textContent = t.value + ' j';
    }
    function onDef() {
      if (r1) { r1.value = SEUILS_DEF.sensibleJours; if (v1) v1.textContent = r1.value + ' j'; }
      if (r2) { r2.value = SEUILS_DEF.silenceJours; if (v2) v2.textContent = r2.value + ' j'; }
    }
    function onSave() {
      S.seuils = {
        sensibleJours: clamp(+r1.value || SEUILS_DEF.sensibleJours, 7, 30),
        silenceJours: clamp(+r2.value || SEUILS_DEF.silenceJours, 14, 90)
      };
      saveSeuils();
      closeDialog();
      renderAll();
      toast('Seuils enregistrés', 'ok');
    }
  }
  function openHelp() {
    openOverlay(
      dialogHead('Raccourcis clavier') +
      '<div class="adt-help-list">' +
        '<div><span class="adt-kbd">N</span> Nouvelle entrée d\'audit</div>' +
        '<div><span class="adt-kbd">E</span> Export CSV de la sélection courante</div>' +
        '<div><span class="adt-kbd">J</span> Vue Flux d\'activité (signature de la page)</div>' +
        '<div><span class="adt-kbd">T</span> Vue Tableau</div>' +
        '<div><span class="adt-kbd">C</span> Vue Cartes</div>' +
        '<div><span class="adt-kbd">S</span> Tout sélectionner / désélectionner (page courante)</div>' +
        '<div><span class="adt-kbd">P</span> Purger les filtres (réinitialiser)</div>' +
        '<div><span class="adt-kbd">K</span> Panneau des seuils d\'alerte</div>' +
        '<div><span class="adt-kbd">/</span> Recherche</div>' +
        '<div><span class="adt-kbd">?</span> Cette aide</div>' +
        '<div><span class="adt-kbd">Échap</span> Fermer fiche / dialog / menu</div>' +
      '</div>' +
      '<div class="adt-form-foot"><button type="button" class="adt-btn adt-btn-primary" data-close="1">Fermer</button></div>'
    );
  }

  /* ================= export CSV =================
     Export de la sélection courante (filtres + période) avec BOM
     UTF-8 et séparateur « ; » — lisible directement dans un tableur. */
  function exportCSV() {
    var rows = S.filtered.length ? S.filtered : S.journal;
    var head = 'Numero;Date;Utilisateur;Action;Module;Details';
    var lines = rows.map(function (e) {
      return [e.numero, e.date, e.utilisateur, e.action, e.module, e.details].map(function (v) {
        return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      }).join(';');
    });
    var csv = '\ufeff' + head + '\n' + lines.join('\n');
    try {
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'admina-audit-statuts.csv';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        try { URL.revokeObjectURL(a.href); a.remove(); } catch (e) { /* silencieux */ }
      }, 400);
      toast('Export CSV : ' + rows.length + ' entrée(s)', 'ok');
    } catch (e) {
      toast('Export impossible dans ce navigateur', 'err');
    }
  }

  /* ================= copie JSON de la fiche ================= */
  function copyJSON(id) {
    var e = byId(fresh(), id);
    if (!e) { toast('Entrée introuvable', 'err'); return; }
    var txt = JSON.stringify(e, null, 2);
    var done = function () { toast('Fiche ' + e.numero + ' copiée en JSON', 'ok'); };
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt, done); });
      } else fallbackCopy(txt, done);
    } catch (err) { fallbackCopy(txt, done); }
  }
  function fallbackCopy(txt, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (typeof done === 'function') done();
    } catch (e) { toast('Copie impossible dans ce contexte', 'err'); }
  }

  /* ================= toasts ================= */
  function toast(msg, kind) {
    var box = document.getElementById('adt-notifs');
    if (!box) return;
    var t = document.createElement('div');
    t.className = 'adt-notif' + (kind === 'err' ? ' adt-notif-err' : ' adt-notif-ok');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('adt-out'); }, 2200);
    setTimeout(function () { if (t.parentElement) t.parentElement.removeChild(t); }, 2600);
  }

  /* ================= clavier ================= */
  function typing(e) {
    var t = e.target;
    if (!t) return false;
    var tag = t.tagName || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return true;
    return false;
  }
  function dialogOpen() {
    var ov = document.getElementById('adt-overlay');
    return !!(ov && !ov.classList.contains('adt-hide'));
  }
  function onKey(e) {
    if (!S.active) return;
    if (e.key === 'Escape') {
      if (dialogOpen()) { closeDialog(); return; }
      if (S.drawerId) { closeDrawer(); return; }
      document.documentElement.classList.remove('adt-nav-open');
      return;
    }
    if (typing(e) || dialogOpen()) return;
    var k = e.key;
    if (k === '/') { e.preventDefault(); var q = document.getElementById('adt-q'); if (q) q.focus(); return; }
    if (k === '?') { openHelp(); return; }
    var lk = (k || '').toLowerCase();
    if (lk === 'n') { openForm(null); }
    else if (lk === 'e') { exportCSV(); }
    else if (lk === 'j') { setView('flux'); }
    else if (lk === 't') { setView('table'); }
    else if (lk === 'c') { setView('cartes'); }
    else if (lk === 's') {
      var pe = pageEntries();
      var allSel = pe.length > 0 && pe.every(function (x) { return S.sel[x.id]; });
      pe.forEach(function (x) { if (allSel) delete S.sel[x.id]; else S.sel[x.id] = true; });
      renderViews(); renderSelbar();
      toast(allSel ? 'Sélection effacée' : pe.length + ' entrée(s) sélectionnée(s)', 'ok');
    }
    else if (lk === 'p') { resetFilters(); }
    else if (lk === 'k') { openSeuils(); }
  }

  /* ================= mode natif ================= */
  function goNative() {
    try { sessionStorage.setItem(SS_NATIVE, '1'); } catch (e) { /* silencieux */ }
    deactivate();
    onRoute();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }
  function bootChip() {
    if (document.getElementById('adt-native-chip')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'adt-native-chip';
    b.className = 'adt-native-chip adt-hide';
    b.textContent = '↩ Réactiver l\'interface enrichie de l\'audit';
    b.addEventListener('click', function () {
      try { sessionStorage.removeItem(SS_NATIVE); } catch (e) { /* silencieux */ }
      onRoute();
    });
    document.body.appendChild(b);
  }

  /* ================= refresh global ================= */
  function scheduleRefresh() {
    load();
    if (S.active) renderAll();
  }
  function pollerTick() {
    if (!S.active) return;
    var api = findApi();
    if (!api) return;
    try {
      var d = api.getData();
      var sig = JSON.stringify(d && d.journal ? d.journal : []);
      if (sig !== lastSig) { S.api = api; scheduleRefresh(); }
    } catch (e) { /* silencieux */ }
  }

  /* ================= activation ================= */
  function boot() {
    bootChip();
    load();
    onRoute();
    var tries = 0;
    var poll = setInterval(function () {
      tries += 1;
      var api = findApi();
      if (api || tries >= 30) {
        clearInterval(poll);
        var had = S.api;
        load();
        if (S.active) renderAll();
        if (api && !had) {
          try { api.subscribe(function () { scheduleRefresh(); }); } catch (e) { /* silencieux */ }
        }
      }
    }, 450);
    setInterval(pollerTick, 1200);
    setInterval(onRoute, 350);
    try { window.addEventListener('popstate', onRoute); } catch (e) { /* silencieux */ }
    window.__ADMINA_ADT_UI__ = {
      version: VERSION,
      get filtered() { return S.filtered; },
      get alerts() { return S.alerts; },
      get nextNumero() { return nextNumero(S.journal); },
      get seuils() { return S.seuils; }
    };
    window.__ADMINA_ADT_W4__ = { v: VERSION, page: 'audit-statuts' };
  }

  boot();
})();
