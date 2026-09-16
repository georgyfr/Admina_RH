/*! admina-conformite.js — Vague 4 · W4-c · page /documents-conformite
 * ============================================================================
 *  LE DOSSIER PROPRE — La conformité n'est pas une case cochée : c'est un
 *  rituel de preuve. Chaque document clé d'un employé doit avoir été vérifié
 *  PAR QUELQU'UN, À UNE DATE — sinon il n'existe pas juridiquement. Et les
 *  documents à durée limitée (CNI, attestations, certificats) vieillissent :
 *  ils doivent être re-vérifiés AVANT leur échéance, pas après. Cette page
 *  répond à trois questions : qu'est-ce qui n'est pas conforme (à régulariser
 *  maintenant) ? qu'est-ce qui attend (relances) ? qu'est-ce qui expire
 *  bientôt (prévenance) ? Qui a vérifié quoi reste tracé : la responsabilité
 *  fait partie de la preuve.
 * ----------------------------------------------------------------------------
 *  Module ADDITIF posé SOUS le titre natif de /documents-conformite.
 *  Le chunk natif Conformite-Dt7SGiC2.js (patché par l'orchestrateur) expose
 *  window.__ADMINA_CNF_API__ v1.0-w4 : getData() → {conformite:[...]},
 *  setData({conformite}), subscribe(f). LS natif : 'admina-conformite-data'
 *  (JSON {conformite:[...]}). Ce module n'écrase jamais l'API native : il la
 *  consomme, et en cas d'indisponibilité retombe sur le LS puis sur un
 *  snapshot de démonstration embarqué (écritures de secours en LS).
 *  Contenu : héro calculé · 5 alertes AAA cliquables · 6 KPI (4 filtres) ·
 *  3 graphiques SVG cliquables · recherche + filtres + tri + pager · vue
 *  cartes · VUE SIGNATURE « CONFORMITÉ PAR EMPLOYÉ » (défaut) · drawer fiche
 *  (statut rapide, inline, historique) · dialog création/édition validé ·
 *  duplication · suppression simple + groupée (confirm maison) · panneau
 *  seuils persistés · export CSV (BOM, « ; ») · raccourcis N/E/J/P/C/S/K/T +
 *  / + ? · dark auto · burger <820px · pied « Voir la page native ».
 *  0 global hors __ADMINA_CNF_API__ (natif), __ADMINA_CNF_UI__ (état UI :
 *  filtered/alerts/nextNumero/seuils) et le drapeau de garde __ADMINA_CNF_W4__.
 *  Préfixe unique : cnf- · racines : html.admina-cnf + [data-cnf-page].
 * ==========================================================================*/
(function () {
'use strict';
if (window.__ADMINA_CNF_W4__) return;

/* ==========================================================================
 * 1. CONSTANTES & ÉTAT
 * ========================================================================== */
var VERSION = '1.0-w4';
var LS_DATA = 'admina-conformite-data';
var LS_SEUILS = 'admina-conformite-seuils';
var LS_J = 'admina_journal';
var J_MAX = 500;
var PAGE_RE = /\/documents-conformite\/?$/;
var STATUTS = ['Conforme', 'Non conforme', 'En attente', 'Expiré'];
var ST_CLASS = {
  'Conforme': 'cnf-st-conforme',
  'Non conforme': 'cnf-st-nonconforme',
  'En attente': 'cnf-st-attente',
  'Expiré': 'cnf-st-expire'
};
var ST_VAR = { 'Conforme': 'ok', 'Non conforme': 'nok', 'En attente': 'wait', 'Expiré': 'exp' };
var TYPES_CANON = ['Contrat de travail', 'Diplôme', 'Certificat de travail', "Carte d'identité", 'Attestation CNPS', 'Extrait casier judiciaire'];
var COLS = [
  ['numero', 'N°'], ['typeDocument', 'Type de document'], ['employe', 'Employé'],
  ['poste', 'Poste'], ['departement', 'Département'], ['statutDocument', 'Statut'],
  ['dateVerification', 'Vérifié le'], ['verificateur', 'Vérificateur'],
  ['dateEcheance', 'Échéance'], ['commentaires', 'Commentaires']
];
var FIELDS = ['numero', 'typeDocument', 'employe', 'poste', 'departement', 'statutDocument',
  'dateVerification', 'verificateur', 'dateEcheance', 'commentaires'];

/* Snapshot de démonstration embarqué (miroir du snapshot natif) — dernier recours */
var DEMO = [
  { id: 1, numero: 'CONF-001', typeDocument: 'Contrat de travail', employe: 'Ndiaye Moussa', poste: 'Chef Cuisinier', departement: 'Restauration', statutDocument: 'Conforme', dateVerification: '20/02/2025', verificateur: 'M. Nkoulou Paul', dateEcheance: '15/03/2026', commentaires: 'Tous les documents en règle' },
  { id: 2, numero: 'CONF-002', typeDocument: 'Diplôme', employe: 'Tchouankou Claire', poste: 'Comptable Senior', departement: 'Finance & Comptabilite', statutDocument: 'Conforme', dateVerification: '22/02/2025', verificateur: 'Mme. Fotso Marie', dateEcheance: '', commentaires: "Diplôme vérifié auprès de l'université" },
  { id: 3, numero: 'CONF-003', typeDocument: 'Certificat de travail', employe: 'Nganou André', poste: 'Agent de Sécurité', departement: 'Securite', statutDocument: 'Non conforme', dateVerification: '25/02/2025', verificateur: 'M. Kamga Blaise', dateEcheance: '', commentaires: "Certificat manquant, demandé à l'employé" },
  { id: 4, numero: 'CONF-004', typeDocument: "Carte d'identité", employe: 'Mebara Nadège', poste: 'Agent Accueil', departement: 'Service Client', statutDocument: 'Conforme', dateVerification: '26/02/2025', verificateur: 'M. Ngo Ndobo Alain', dateEcheance: '10/08/2029', commentaires: 'CNI valide' },
  { id: 5, numero: 'CONF-005', typeDocument: 'Attestation CNPS', employe: 'Kamga Blaise', poste: 'Développeur Full Stack', departement: 'Informatique', statutDocument: 'En attente', dateVerification: '', verificateur: '', dateEcheance: '', commentaires: 'En cours de vérification CNPS' },
  { id: 6, numero: 'CONF-006', typeDocument: 'Extrait casier judiciaire', employe: 'Eyenga Clarisse', poste: 'Community Manager', departement: 'Marketing & Communication', statutDocument: 'Conforme', dateVerification: '27/02/2025', verificateur: 'M. Nkoulou Paul', dateEcheance: '', commentaires: 'Casier vierge confirmé' }
];

var S = {
  mounted: false,
  suppressed: false,
  raw: [],
  srcLabel: '',
  view: 'employes',           /* VUE SIGNATURE par défaut */
  q: '', fStatut: '', fType: '', fDept: '', fMode: '',
  sortKey: 'numero', sortDir: 1,
  page: 1, per: 10,
  sel: {},
  drawerId: null,
  editId: null,
  confirmCb: null,
  seuils: loadSeuils(),
  poller: null, apiWait: null, unsub: null,
  lastApiJson: ''
};

/* État UI exposé (0 autre global) */
var UI = window.__ADMINA_CNF_UI__ = {
  v: VERSION,
  filtered: [],
  alerts: [],
  nextNumero: '',
  seuils: S.seuils
};

/* ==========================================================================
 * 2. UTILITAIRES DOM & DATES
 * ========================================================================== */
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function appendKid(n, c) {
  if (c === null || c === undefined || c === false) return;
  if (Array.isArray(c)) { for (var i = 0; i < c.length; i++) appendKid(n, c[i]); return; }
  if (c.nodeType) { n.appendChild(c); return; }
  n.appendChild(document.createTextNode(String(c)));
}
function el(tag, attrs) {
  var n = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v === null || v === undefined) continue;
      if (k === 'class') n.className = String(v);
      else if (k === 'text') n.textContent = String(v);
      else if (k === 'html') n.innerHTML = String(v);
      else if (k === 'style') n.setAttribute('style', String(v));
      else if (k === 'checked') n.checked = true;
      else if (k === 'disabled') n.disabled = true;
      else if (k === 'selected') n.selected = true;
      else if (k === 'value') n.value = String(v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, String(v));
    }
  }
  for (var i = 2; i < arguments.length; i++) appendKid(n, arguments[i]);
  return n;
}
function checkbox(checked, label, onch) {
  var a = { type: 'checkbox', 'aria-label': label, onchange: onch };
  if (checked) a.checked = '1';
  return el('input', a);
}
function pad2(x) { return (x < 10 ? '0' : '') + x; }
function pl(n) { return n > 1 ? 's' : ''; }
function parseDj(s) {
  if (!s || typeof s !== 'string') return null;
  var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  var d = +m[1], mo = +m[2], y = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}
function fmtDj(dt) {
  if (!dt) return '';
  return pad2(dt.getDate()) + '/' + pad2(dt.getMonth() + 1) + '/' + dt.getFullYear();
}
function today0() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }
function daysFromToday(s) { var d = parseDj(s); if (!d) return null; return Math.round((d - today0()) / 86400000); }
function daysSince(s) { var v = daysFromToday(s); return v === null ? null : -v; }
function ymd() { var t = new Date(); return t.getFullYear() + '-' + pad2(t.getMonth() + 1) + '-' + pad2(t.getDate()); }
function fmtTs(ts) { try { return new Date(ts).toLocaleString('fr-FR'); } catch (e) { return String(ts); } }
function distinct(arr) {
  var seen = {}, out = [];
  arr.forEach(function (x) { var k = String(x == null ? '' : x); if (k && !seen[k]) { seen[k] = 1; out.push(k); } });
  return out;
}
function distinctTypes(list) {
  var present = {}; list.forEach(function (v) { if (v.typeDocument) present[v.typeDocument] = 1; });
  var out = TYPES_CANON.filter(function (t) { return present[t]; });
  var extra = Object.keys(present).filter(function (t) { return TYPES_CANON.indexOf(t) < 0; }).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  return out.concat(extra);
}
function byId(list, id) {
  for (var i = 0; i < list.length; i++) { if (+list[i].id === +id) return list[i]; }
  return null;
}
function nextId(list) { return list.reduce(function (m, v) { return Math.max(m, +v.id || 0); }, 0) + 1; }
function nextNumero(list) {
  var mx = 0;
  list.forEach(function (v) { var m = /^CONF-(\d+)$/.exec(v.numero || ''); if (m) mx = Math.max(mx, +m[1]); });
  var s = 'CONF-' + pad3(mx + 1);
  while (list.some(function (v) { return v.numero === s; })) { mx++; s = 'CONF-' + pad3(mx + 1); }
  return s;
}
function pad3(n) { var s = String(n); while (s.length < 3) s = '0' + s; return s; }
function norm(list) {
  return (list || []).map(function (v) {
    var o = {};
    Object.keys(v || {}).forEach(function (k) {
      var val = v[k];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      o[k] = val;
    });
    o.id = (/^\d+$/.test(String(o.id)) || typeof o.id === 'number') ? +o.id : 0;
    FIELDS.forEach(function (k) { if (typeof o[k] !== 'string') o[k] = (o[k] === undefined || o[k] === null) ? '' : String(o[k]); });
    if (STATUTS.indexOf(o.statutDocument) < 0) o.statutDocument = 'En attente';
    if (!o.numero) o.numero = 'CONF-?';
    return o;
  });
}
function cmp(a, b, k) {
  var va = a[k], vb = b[k];
  if (k === 'dateVerification' || k === 'dateEcheance') {
    var da = parseDj(va), db = parseDj(vb);
    va = da ? da.getTime() : Infinity; vb = db ? db.getTime() : Infinity;
  } else if (k === 'numero') {
    var na = /(\d+)/.exec(va || ''), nb = /(\d+)/.exec(vb || '');
    va = na ? +na[1] : 1e9; vb = nb ? +nb[1] : 1e9;
  }
  if (typeof va === 'number' && typeof vb === 'number') return va - vb;
  return String(va == null ? '' : va).localeCompare(String(vb == null ? '' : vb), 'fr', { sensitivity: 'base' });
}
function shortType(t) {
  var M = { 'Contrat de travail': 'Contrat', 'Certificat de travail': 'Certificat', "Carte d'identité": 'CNI', 'Attestation CNPS': 'CNPS', 'Extrait casier judiciaire': 'Casier', 'Diplôme': 'Diplôme' };
  if (M[t]) return M[t];
  return t.length > 11 ? t.slice(0, 10) + '…' : t;
}
function shortStatut(s) {
  return { 'Conforme': 'Conforme', 'Non conforme': 'Non conf.', 'En attente': 'Attente', 'Expiré': 'Expiré' }[s] || s;
}
function csvCell(v) {
  var s = String(v == null ? '' : v);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return /[;"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function val(sel) { var n = $(sel); return n && n.value != null ? String(n.value).trim() : ''; }

/* ==========================================================================
 * 3. JOURNAL LOCAL (LS admina_journal, 500 max) + AUDIT
 * ========================================================================== */
function jread() {
  try { var r = JSON.parse(localStorage.getItem(LS_J) || '[]'); return Array.isArray(r) ? r : []; } catch (e) { return []; }
}
function jlog(action, detail, numero) {
  var entry = { ts: new Date().toISOString(), role: 'RH', page: '/documents-conformite', action: String(action || ''), numero: String(numero || ''), detail: String(detail || '') };
  try {
    var j = jread(); j.push(entry);
    while (j.length > J_MAX) j.shift();
    localStorage.setItem(LS_J, JSON.stringify(j));
  } catch (e) { /* quota / privacy : silencieux */ }
  try { if (typeof window.__ADMINA_AUDIT__ === 'function') window.__ADMINA_AUDIT__(entry); } catch (e) { /* hook absent */ }
}

/* ==========================================================================
 * 4. SEUILS (LS admina-conformite-seuils) — prévenance & relances
 * ========================================================================== */
function loadSeuils() {
  try {
    var s = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null');
    if (s && +s.echeanceProche >= 30 && +s.echeanceProche <= 180 && +s.attenteJours >= 7 && +s.attenteJours <= 60) {
      return { echeanceProche: +s.echeanceProche, attenteJours: +s.attenteJours };
    }
  } catch (e) { /* défauts */ }
  return { echeanceProche: 90, attenteJours: 14 };
}
function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(S.seuils)); } catch (e) { /* silencieux */ } UI.seuils = S.seuils; }

/* ==========================================================================
 * 5. DONNÉES — API native → LS → snapshot démo (résilience)
 * ========================================================================== */
function getApi() { return window.__ADMINA_CNF_API__; }
function apiReady() {
  var a = getApi();
  return !!(a && typeof a.getData === 'function' && typeof a.setData === 'function');
}
function loadLS() {
  try {
    var raw = localStorage.getItem(LS_DATA);
    if (raw) { var j = JSON.parse(raw); if (j && Array.isArray(j.conformite)) return j.conformite; }
  } catch (e) { /* corrompu → ignore */ }
  return null;
}
function resolveData() {
  if (apiReady()) {
    try {
      var d = getApi().getData();
      if (d && Array.isArray(d.conformite) && d.conformite.length) return { list: d.conformite, src: 'api' };
    } catch (e) { /* continue */ }
  }
  var l = loadLS();
  if (l && l.length) return { list: l, src: 'ls' };
  return { list: DEMO.map(function (v) { return Object.assign({}, v); }), src: 'demo' };
}
function persistLSOnly(list) {
  try { localStorage.setItem(LS_DATA, JSON.stringify({ conformite: list })); } catch (e) { /* silencieux */ }
}
function persist(list) {
  S.raw = list;
  var ok = false;
  if (apiReady()) { try { getApi().setData({ conformite: list }); ok = true; } catch (e) { /* secours LS */ } }
  persistLSOnly(list);
  return ok;
}
function freshData() {
  if (apiReady()) {
    try {
      var d = getApi().getData();
      if (d && Array.isArray(d.conformite)) { S.raw = norm(d.conformite); }
    } catch (e) { /* garde l'état courant */ }
  }
  return S.raw;
}

/* ==========================================================================
 * 6. CALCULS — stats & 5 alertes AAA
 * ========================================================================== */
function computeStats(list) {
  var t = list.length, cf = 0, nc = 0, at = 0, ex = 0, sv = 0, ep = 0;
  var seu = S.seuils;
  list.forEach(function (v) {
    var s = v.statutDocument;
    if (s === 'Conforme') cf++; else if (s === 'Non conforme') nc++;
    else if (s === 'En attente') at++; else if (s === 'Expiré') ex++;
    if ((v.verificateur || '') === '') sv++;
    var d = daysFromToday(v.dateEcheance);
    if (d !== null && d >= 0 && d <= seu.echeanceProche && s !== 'Expiré') ep++;
  });
  var emps = {};
  list.forEach(function (v) { if (v.employe) emps[v.employe] = 1; });
  return {
    total: t, conforme: cf, nonconforme: nc, attente: at, expire: ex,
    sansVerif: sv, echeanceProche: ep,
    pct: t ? Math.round(cf / t * 100) : 0,
    employes: Object.keys(emps).length
  };
}
function computeAlerts(list) {
  var seu = S.seuils;
  var nc = list.filter(function (v) { return v.statutDocument === 'Non conforme'; });
  var att = list.filter(function (v) {
    if (v.statutDocument !== 'En attente') return false;
    if (!v.dateVerification) return true;
    var d = daysSince(v.dateVerification);
    return d === null || d > seu.attenteJours;
  });
  var ech = list.filter(function (v) {
    if (v.statutDocument === 'Expiré') return false;
    var d = daysFromToday(v.dateEcheance);
    return d !== null && d >= 0 && d <= seu.echeanceProche;
  });
  var sv = list.filter(function (v) { return (v.verificateur || '') === ''; });
  var ex = list.filter(function (v) { return v.statutDocument === 'Expiré'; });
  return [
    { id: 'regulariser', kind: 'danger', n: nc.length, label: 'Non conformes à régulariser', hint: 'À régulariser maintenant' },
    { id: 'relances', kind: 'warn', n: att.length, label: 'En attente > ' + seu.attenteJours + ' j sans vérification', hint: 'Relances à faire' },
    { id: 'prevenance', kind: 'warn', n: ech.length, label: 'Échéances ≤ ' + seu.echeanceProche + ' j', hint: 'Prévenance — re-vérifier avant' },
    { id: 'preuve', kind: 'info', n: sv.length, label: 'Vérifications sans vérificateur', hint: 'Preuve incomplète' },
    { id: 'expires', kind: 'info', n: ex.length, label: 'Documents Expiré', hint: 'À re-vérifier' }
  ];
}

/* ==========================================================================
 * 7. FILTRES & TRI
 * ========================================================================== */
function matchQ(v, q) {
  var fs = [v.numero, v.employe, v.poste, v.typeDocument, v.verificateur, v.commentaires];
  for (var i = 0; i < fs.length; i++) { if (String(fs[i] || '').toLowerCase().indexOf(q) > -1) return true; }
  return false;
}
function applyFilters(list) {
  var q = S.q, out = list;
  if (q) out = out.filter(function (v) { return matchQ(v, q); });
  if (S.fStatut) out = out.filter(function (v) { return v.statutDocument === S.fStatut; });
  if (S.fType) out = out.filter(function (v) { return v.typeDocument === S.fType; });
  if (S.fDept) out = out.filter(function (v) { return v.departement === S.fDept; });
  if (S.fMode === 'echeance') {
    out = out.filter(function (v) {
      if (v.statutDocument === 'Expiré') return false;
      var d = daysFromToday(v.dateEcheance);
      return d !== null && d >= 0 && d <= S.seuils.echeanceProche;
    });
  } else if (S.fMode === 'sansverif') {
    out = out.filter(function (v) { return (v.verificateur || '') === ''; });
  } else if (S.fMode === 'relances') {
    out = out.filter(function (v) {
      if (v.statutDocument !== 'En attente') return false;
      if (!v.dateVerification) return true;
      var d = daysSince(v.dateVerification);
      return d === null || d > S.seuils.attenteJours;
    });
  } else if (S.fMode.indexOf('echeanceMois:') === 0) {
    var ym = S.fMode.slice(14);
    out = out.filter(function (v) {
      var d = parseDj(v.dateEcheance);
      return !!d && (d.getFullYear() + '-' + pad2(d.getMonth() + 1)) === ym;
    });
  }
  return out.slice();
}
function sortList(list) {
  var k = S.sortKey, dir = S.sortDir;
  list.sort(function (a, b) { return cmp(a, b, k) * dir; });
  return list;
}
function modeLabel(m) {
  if (m === 'echeance') return 'Échéances ≤ ' + S.seuils.echeanceProche + ' j';
  if (m === 'sansverif') return 'Sans vérificateur';
  if (m === 'relances') return 'En attente > ' + S.seuils.attenteJours + ' j';
  if (m.indexOf('echeanceMois:') === 0) { var p = m.slice(14).split('-'); return 'Échéances ' + MOIS[+p[1] - 1] + ' ' + p[0]; }
  return '';
}
var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/* Dark auto (LS admina-dark > luminance du fond > prefers-color-scheme) — cohérence natif */
function applyDark() {
  var dark = null;
  try {
    var v = localStorage.getItem('admina-dark');
    if (v === '1') dark = true;
    else if (v === '0') dark = false;
  } catch (e) { /* LS indisponible */ }
  if (dark === null) {
    try {
      var bg = getComputedStyle(document.body).backgroundColor;
      var m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(bg || '');
      if (m) {
        var lum = (0.2126 * Number(m[1]) + 0.7152 * Number(m[2]) + 0.0722 * Number(m[3])) / 255;
        dark = lum < 0.4;
      }
    } catch (e2) { /* style indisponible */ }
  }
  if (dark === null) dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('admina-cnf-dark', !!dark);
}

/* ==========================================================================
 * 8. CYCLE DE VIE — détection 350 ms + popstate, montage/démontage propres
 * ========================================================================== */
function tick350() {
  var on = PAGE_RE.test(location.pathname);
  if (on && !S.suppressed) { if (!S.mounted) mount(); }
  else if (S.mounted) unmount();
}
function fixHostGap() {
  var stop = document.getElementById('root');
  var hop = $('#cnf-root') ? $('#cnf-root').parentElement : null;
  while (hop && hop !== document.body && hop !== stop) {
    if (parseFloat(getComputedStyle(hop).marginLeft || '0') > 80) hop.classList.add('cnf-host');
    hop = hop.parentElement;
  }
}
function mount() {
  if (S.mounted) return;
  if (!findAnchor()) return; /* le titre natif n'est pas encore rendu : le tick relancera */
  S.mounted = true;
  document.documentElement.classList.add('admina-cnf');
  applyDark();
  buildRoot();
  fixHostGap();
  var r = resolveData();
  S.raw = norm(r.list);
  S.srcLabel = { api: 'API native __ADMINA_CNF_API__ (v1.0-w4)', ls: 'secours localStorage ' + LS_DATA, demo: 'secours snapshot démo embarqué' }[r.src] || r.src;
  if (r.src !== 'api') persist(S.raw);           /* écriture de secours */
  renderAll();
  startApiWait();
  startPoller();
  subscribeApi();
  jlog('montage', 'module conformité monté (source : ' + r.src + ')');
}
function unmount() {
  if (!S.mounted) return;
  S.mounted = false;
  if (S.apiWait) { clearInterval(S.apiWait); S.apiWait = null; }
  try { if (S.unsub) S.unsub(); } catch (e) { /* déjà parti */ }
  S.unsub = null;
  var root = $('#cnf-root');
  if (root && root.parentNode) root.parentNode.removeChild(root);
  document.documentElement.classList.remove('admina-cnf', 'admina-cnf-dark', 'cnf-lock', 'cnf-nav-open');
  $$('.cnf-host').forEach(function (n) { n.classList.remove('cnf-host'); });
  S.drawerId = null;
  jlog('demontage', 'module conformité désactivé proprement');
}
function startApiWait() {
  if (S.apiWait) clearInterval(S.apiWait);
  var n = 0;
  S.apiWait = setInterval(function () {
    n++;
    if (apiReady()) {
      clearInterval(S.apiWait); S.apiWait = null;
      subscribeApi();
      try {
        var d = getApi().getData();
        if (d && Array.isArray(d.conformite) && d.conformite.length) {
          S.raw = norm(d.conformite); renderAll();
        } else if (S.raw.length) {
          persist(S.raw);                    /* on partage nos données au natif */
        }
      } catch (e) { /* silencieux */ }
    } else if (n >= 30) { clearInterval(S.apiWait); S.apiWait = null; }
  }, 450);
}
function startPoller() {
  if (S.poller) return;
  S.poller = setInterval(function () { if (S.mounted) pollTick(); }, 1200);
}
function pollTick() {
  if (!apiReady()) return;
  try {
    var d = getApi().getData();
    if (d && Array.isArray(d.conformite)) {
      var j = JSON.stringify(d.conformite);
      if (j !== S.lastApiJson) {
        S.lastApiJson = j;
        S.raw = norm(d.conformite);
        renderAll();
      }
    }
  } catch (e) { /* silencieux */ }
}
function subscribeApi() {
  var a = getApi();
  if (a && typeof a.subscribe === 'function' && !S.unsub) {
    try { S.unsub = a.subscribe(function () { pollTick(); }); } catch (e) { S.unsub = null; }
  }
}
function onStorage(e) {
  if (!S.mounted || !e) return;
  if (e.key === LS_DATA) {
    var l = loadLS();
    if (l) { S.raw = norm(l); renderAll(); }
  } else if (e.key === LS_SEUILS) { S.seuils = loadSeuils(); renderAll(); }
}

/* ==========================================================================
 * 9. RACINE & TOOLBAR (construits UNE fois ; sync légère ensuite)
 * ========================================================================== */
function findAnchor() {
  var hs = $$('h1,h2,h3,h4,h5,h6,[class*="MuiTypography-h5"]');
  for (var i = 0; i < hs.length; i++) { if (/conformit/i.test(hs[i].textContent || '')) return hs[i].parentElement || hs[i]; }
  return null; /* le tick retentera : jamais de fallback body (leçon W4 — drawer natif) */
}
function buildRoot() {
  if ($('#cnf-root')) return;
  var root = el('div', { id: 'cnf-root', class: 'admina-cnf-root', 'data-cnf-page': '' });
  root.appendChild(el('section', { id: 'cnf-hero', class: 'cnf-hero' }));
  root.appendChild(el('section', { id: 'cnf-alerts', class: 'cnf-alerts', 'aria-label': 'Alertes de conformité (AAA : à régulariser, à relancer, anticiper)' }));
  root.appendChild(el('section', { id: 'cnf-kpis', class: 'cnf-kpis', 'aria-label': 'Indicateurs clés' }));
  root.appendChild(el('section', { id: 'cnf-charts', class: 'cnf-charts', 'aria-label': 'Graphiques' }));
  root.appendChild(buildToolbar());
  root.appendChild(el('section', { id: 'cnf-bulk', class: 'cnf-bulkbar', hidden: '' }));
  root.appendChild(el('section', { id: 'cnf-view', class: 'cnf-view' }));
  root.appendChild(el('nav', { id: 'cnf-pager', class: 'cnf-pager', 'aria-label': 'Pagination' }));

  var foot = el('footer', { id: 'cnf-foot', class: 'cnf-foot' });
  foot.appendChild(el('button', { class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: suppress, text: 'Voir la page native ↗' }));
  foot.appendChild(el('span', { class: 'cnf-foot-note', text: 'Module additif admina-conformite · v' + VERSION + ' · préfixe cnf- · données partagées avec la page native · journal local (500 max) · LE DOSSIER PROPRE' }));
  root.appendChild(foot);

  /* Overlays fixes (dans la racine : détruits au démontage) */
  root.appendChild(el('div', { id: 'cnf-drawer-wrap', class: 'cnf-overlay cnf-overlay-right', hidden: '' },
    el('aside', { id: 'cnf-drawer', class: 'cnf-drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Fiche vérification' })));
  root.appendChild(el('div', { id: 'cnf-dialog-wrap', class: 'cnf-overlay', hidden: '' },
    el('div', { id: 'cnf-dialog', class: 'cnf-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Vérification' })));
  root.appendChild(el('div', { id: 'cnf-confirm-wrap', class: 'cnf-overlay', hidden: '' },
    el('div', { id: 'cnf-confirm', class: 'cnf-confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': 'Confirmation' })));
  root.appendChild(el('div', { id: 'cnf-panel-wrap', class: 'cnf-overlay', hidden: '' },
    el('div', { id: 'cnf-panel', class: 'cnf-panel', role: 'dialog', 'aria-modal': 'true', "aria-label": "Seuils d'alerte" })));
  root.appendChild(el('div', { id: 'cnf-toasts', class: 'cnf-toasts', 'aria-live': 'polite' }));
  root.appendChild(el('button', { id: 'cnf-burger', class: 'cnf-burger', type: 'button', 'aria-label': 'Ouvrir la navigation', onclick: function () { document.documentElement.classList.toggle('cnf-nav-open'); } },
    el('span', { class: 'cnf-burger-bar' }), el('span', { class: 'cnf-burger-bar' }), el('span', { class: 'cnf-burger-bar' })));

  var anchor = findAnchor();
  if (!anchor || anchor === document.body || !anchor.parentNode) return;
  anchor.parentNode.insertBefore(root, anchor.nextSibling);
  anchor.classList.add('cnf-host'); /* garde mobile : le conteneur natif garde margin-left du drawer */

  wireToolbar();
  wireOverlays();
}
function buildToolbar() {
  var tb = el('section', { id: 'cnf-toolbar', class: 'cnf-toolbar', 'aria-label': 'Recherche et filtres' });
  var r1 = el('div', { class: 'cnf-toolbar-row' });
  r1.appendChild(el('input', { id: 'cnf-search', class: 'cnf-search', type: 'search', placeholder: 'Rechercher… (n°, employé, poste, type, vérificateur, commentaires) — raccourci /', 'aria-label': 'Recherche' }));
  var selStatut = el('select', { id: 'cnf-fstatut', class: 'cnf-sel', 'aria-label': 'Filtrer par statut' });
  selStatut.appendChild(el('option', { value: '', text: 'Tous les statuts' }));
  STATUTS.forEach(function (s) { selStatut.appendChild(el('option', { value: s, text: s })); });
  r1.appendChild(selStatut);
  r1.appendChild(el('select', { id: 'cnf-ftype', class: 'cnf-sel', 'aria-label': 'Filtrer par type de document' }));
  r1.appendChild(el('select', { id: 'cnf-fdept', class: 'cnf-sel', 'aria-label': 'Filtrer par département' }));
  r1.appendChild(el('button', { id: 'cnf-reset', class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: function () { resetFilters(true); }, text: 'Réinitialiser' }));
  tb.appendChild(r1);

  var r2 = el('div', { class: 'cnf-toolbar-row' });
  var sw = el('div', { class: 'cnf-viewsw', role: 'tablist', 'aria-label': 'Vue' });
  sw.appendChild(el('button', { class: 'cnf-viewsw-btn', type: 'button', 'data-view': 'employes', title: 'Vue signature — Par employé (raccourci P)', onclick: function () { setView('employes'); }, text: 'Par employé' }));
  sw.appendChild(el('button', { class: 'cnf-viewsw-btn', type: 'button', 'data-view': 'table', title: 'Journal des vérifications (raccourci J)', onclick: function () { setView('table'); }, text: 'Tableau' }));
  sw.appendChild(el('button', { class: 'cnf-viewsw-btn', type: 'button', 'data-view': 'cards', title: 'Vue cartes (raccourci C)', onclick: function () { setView('cards'); }, text: 'Cartes' }));
  r2.appendChild(sw);
  r2.appendChild(el('span', { id: 'cnf-modechip', class: 'cnf-modechip', hidden: '' }));
  r2.appendChild(el('span', { class: 'cnf-toolbar-spacer' }));
  r2.appendChild(el('button', { id: 'cnf-new', class: 'cnf-btn cnf-btn-primary', type: 'button', onclick: function () { openDialog(null); }, text: '+ Nouvelle vérification' }));
  r2.appendChild(el('button', { id: 'cnf-export', class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: exportCSV, text: 'Exporter CSV' }));
  r2.appendChild(el('button', { id: 'cnf-seuils', class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: openPanel, text: 'Seuils' }));
  r2.appendChild(el('button', { id: 'cnf-help', class: 'cnf-btn cnf-btn-ghost', type: 'button', 'aria-label': 'Aide et raccourcis', title: 'Aide (?)', onclick: openHelp, text: '?' }));
  tb.appendChild(r2);
  return tb;
}
function wireToolbar() {
  var s = $('#cnf-search');
  if (s) s.addEventListener('input', function () { S.q = String(this.value || '').trim().toLowerCase(); S.page = 1; renderAll(); });
  var f1 = $('#cnf-fstatut');
  if (f1) f1.addEventListener('change', function () { S.fStatut = this.value; S.page = 1; renderAll(); });
  var f2 = $('#cnf-ftype');
  if (f2) f2.addEventListener('change', function () { S.fType = this.value; S.page = 1; renderAll(); });
  var f3 = $('#cnf-fdept');
  if (f3) f3.addEventListener('change', function () { S.fDept = this.value; S.page = 1; renderAll(); });
}
function wireOverlays() {
  [['#cnf-drawer-wrap', closeDrawer], ['#cnf-dialog-wrap', closeDialog], ['#cnf-confirm-wrap', closeConfirm], ['#cnf-panel-wrap', closePanel]].forEach(function (p) {
    var w = $(p[0]);
    if (w) w.addEventListener('click', function (e) { if (e.target === w) p[1](); });
  });
}
function fillSelect(n, items, current, emptyLabel) {
  if (!n) return;
  var sig = emptyLabel + '|' + items.join('|');
  if (n.getAttribute('data-cnf-sig') === sig) { n.value = current || ''; return; }
  n.setAttribute('data-cnf-sig', sig);
  n.innerHTML = '';
  n.appendChild(el('option', { value: '', text: emptyLabel }));
  items.forEach(function (t) { n.appendChild(el('option', { value: t, text: t })); });
  n.value = current || '';
}
function syncToolbar() {
  var list = S.raw;
  fillSelect($('#cnf-ftype'), distinctTypes(list), S.fType, 'Tous les types');
  fillSelect($('#cnf-fdept'), distinct(list.map(function (v) { return v.departement; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); }), S.fDept, 'Tous les départements');
  var s1 = $('#cnf-fstatut'); if (s1) s1.value = S.fStatut;
  $$('.cnf-viewsw-btn').forEach(function (b) { b.classList.toggle('cnf-viewsw-on', b.getAttribute('data-view') === S.view); b.setAttribute('aria-selected', b.getAttribute('data-view') === S.view ? 'true' : 'false'); });
  var mc = $('#cnf-modechip');
  if (mc) {
    if (S.fMode) { mc.hidden = false; mc.innerHTML = ''; mc.appendChild(el('span', { text: modeLabel(S.fMode) })); mc.appendChild(el('button', { class: 'cnf-mode-x', type: 'button', 'aria-label': 'Retirer le filtre avancé', onclick: function () { S.fMode = ''; S.page = 1; renderAll(); }, text: '×' })); }
    else mc.hidden = true;
  }
}
function setView(v) {
  if (S.view === v) return;
  S.view = v; S.page = 1; renderAll();
  jlog('vue', 'vue ' + v);
}
function resetFilters(user) {
  S.q = ''; S.fStatut = ''; S.fType = ''; S.fDept = ''; S.fMode = ''; S.page = 1;
  var s = $('#cnf-search'); if (s) s.value = '';
  renderAll();
  if (user) { toast('Filtres réinitialisés — ' + S.raw.length + ' vérification' + pl(S.raw.length) + ' affichée' + pl(S.raw.length), 'info'); jlog('filtre', 'réinitialisation'); }
}
function filtStatut(st) {
  S.fStatut = (S.fStatut === st) ? '' : st; S.fMode = ''; S.page = 1; renderAll();
  toast(st ? 'Filtre statut : ' + st : 'Filtre statut retiré', 'info'); jlog('filtre', 'statut ' + st);
}
function filtType(t) {
  S.fType = (S.fType === t) ? '' : t; S.page = 1; renderAll();
  toast(t ? 'Filtre type : ' + t : 'Filtre type retiré', 'info'); jlog('filtre', 'type ' + t);
}
function filtMode(m) {
  S.fMode = (S.fMode === m) ? '' : m; S.page = 1; renderAll();
  toast(m ? 'Filtre : ' + modeLabel(m) : 'Filtre avancé retiré', 'info'); jlog('filtre', m || 'aucun');
}
function alertFilter(id) {
  S.q = ''; S.fStatut = ''; S.fType = ''; S.fDept = ''; S.fMode = ''; S.page = 1;
  var s = $('#cnf-search'); if (s) s.value = '';
  if (id === 'regulariser') S.fStatut = 'Non conforme';
  else if (id === 'relances') S.fMode = 'relances';
  else if (id === 'prevenance') S.fMode = 'echeance';
  else if (id === 'preuve') S.fMode = 'sansverif';
  else if (id === 'expires') S.fStatut = 'Expiré';
  renderAll();
  var a = UI.alerts.filter(function (x) { return x.id === id; })[0];
  toast('Alerte → filtre appliqué' + (a ? ' (' + a.n + ' concerné' + pl(a.n) + ')' : ''), 'info');
  jlog('filtre', 'alerte ' + id);
}

/* ==========================================================================
 * 10. RENDU GLOBAL
 * ========================================================================== */
function renderAll() {
  if (!S.mounted) return;
  freshData();
  var st = computeStats(S.raw);
  UI.alerts = computeAlerts(S.raw);
  UI.nextNumero = nextNumero(S.raw);
  UI.seuils = S.seuils;
  var filtered = sortList(applyFilters(S.raw));
  UI.filtered = filtered;
  renderHero(st);
  renderAlerts();
  renderKpis(st);
  renderCharts();
  syncToolbar();
  renderBulk();
  renderView(filtered);
  renderPager(filtered);
}
function renderHero(st) {
  var host = $('#cnf-hero'); if (!host) return;
  host.innerHTML = '';
  var line = [
    st.total + ' vérification' + pl(st.total),
    st.conforme + ' conforme' + pl(st.conforme) + ' (' + st.pct + ' %)',
    st.nonconforme + ' non conforme' + pl(st.nonconforme),
    st.attente + ' en attente',
    st.echeanceProche + ' échéance' + pl(st.echeanceProche) + ' ≤ ' + S.seuils.echeanceProche + ' j'
  ].join(' · ');
  host.appendChild(el('div', { class: 'cnf-hero-title', text: 'LE DOSSIER PROPRE' }));
  host.appendChild(el('div', { class: 'cnf-hero-line', text: line }));
  host.appendChild(el('div', { class: 'cnf-hero-sub', text: "La conformité n'est pas une case cochée : c'est un rituel de preuve. Vérifié par quelqu'un, à une date — sinon le document n'existe pas juridiquement. Re-vérifier AVANT l'échéance, pas après." }));
  host.appendChild(el('div', { class: 'cnf-hero-src', text: 'Source : ' + S.srcLabel + ' · seuils : échéance ≤ ' + S.seuils.echeanceProche + ' j, relance > ' + S.seuils.attenteJours + ' j' }));
}
function renderAlerts() {
  var host = $('#cnf-alerts'); if (!host) return;
  host.innerHTML = '';
  UI.alerts.forEach(function (a) {
    var body = el('span', { class: 'cnf-alert-body' },
      el('span', { class: 'cnf-alert-label', text: a.label }),
      el('span', { class: 'cnf-alert-hint', text: a.hint + (a.n ? ' — ' + a.n + ' dossier' + pl(a.n) : ' — rien à signaler') }));
    var b = el('button', { class: 'cnf-alert cnf-alert-' + a.kind, type: 'button', title: a.label + ' — ' + a.hint, onclick: function () { alertFilter(a.id); } },
      el('span', { class: 'cnf-alert-num', text: String(a.n) }), body);
    if (a.n > 0) b.appendChild(el('span', { class: 'cnf-alert-dot', 'aria-hidden': 'true' }));
    host.appendChild(b);
  });
}
function renderKpis(st) {
  var host = $('#cnf-kpis'); if (!host) return;
  host.innerHTML = '';
  function go(fn) { return function () { fn(); }; }
  var defs = [
    { n: String(st.total), label: 'Total', sub: 'vérifications tracées', filter: false, tone: '' },
    { n: st.pct + ' %', label: 'Conformes', sub: st.conforme + ' / ' + st.total + ' documents', filter: false, tone: st.pct >= 80 ? 'cnf-kpi-good' : (st.pct >= 50 ? 'cnf-kpi-warn' : 'cnf-kpi-bad') },
    { n: String(st.nonconforme), label: 'Non conformes', sub: 'à régulariser maintenant', filter: true, on: S.fStatut === 'Non conforme', tone: 'cnf-kpi-bad', act: go(function () { filtStatut('Non conforme'); }) },
    { n: String(st.attente), label: 'En attente', sub: 'relances à faire', filter: true, on: S.fStatut === 'En attente', tone: 'cnf-kpi-warn', act: go(function () { filtStatut('En attente'); }) },
    { n: String(st.echeanceProche), label: 'Échéances ≤ ' + S.seuils.echeanceProche + ' j', sub: 'prévenance', filter: true, on: S.fMode === 'echeance', tone: 'cnf-kpi-warn', act: go(function () { filtMode('echeance'); }) },
    { n: String(st.sansVerif), label: 'Sans vérificateur', sub: 'preuve incomplète', filter: true, on: S.fMode === 'sansverif', tone: st.sansVerif > 0 ? 'cnf-kpi-bad' : 'cnf-kpi-good', act: go(function () { filtMode('sansverif'); }) }
  ];
  defs.forEach(function (d) {
    var cls = 'cnf-kpi' + (d.filter ? ' cnf-kpi-filter' : '') + (d.on ? ' cnf-kpi-on' : '') + (d.tone ? ' ' + d.tone : '');
    var a = { class: cls, type: 'button' };
    if (d.filter) {
      a.onclick = d.act;
      a.title = 'Cliquer pour filtrer';
    } else a.disabled = '1';
    host.appendChild(el('button', a,
      el('span', { class: 'cnf-kpi-num', text: d.n }),
      el('span', { class: 'cnf-kpi-label', text: d.label }),
      el('span', { class: 'cnf-kpi-sub', text: d.sub })));
  });
}

/* ==========================================================================
 * 11. GRAPHIQUES SVG VANILLA (donut, types, échéances/mois) — cliquables
 * ========================================================================== */
function sEl(t, attrs) {
  var n = document.createElementNS('http://www.w3.org/2000/svg', t);
  if (attrs) for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]); }
  return n;
}
function arcPath(cx, cy, r0, r1, a0, a1) {
  var large = (a1 - a0) > Math.PI ? 1 : 0;
  var x0 = cx + r1 * Math.cos(a0), y0 = cy + r1 * Math.sin(a0);
  var x1 = cx + r1 * Math.cos(a1), y1 = cy + r1 * Math.sin(a1);
  var x2 = cx + r0 * Math.cos(a1), y2 = cy + r0 * Math.sin(a1);
  var x3 = cx + r0 * Math.cos(a0), y3 = cy + r0 * Math.sin(a0);
  return 'M' + x0 + ',' + y0 + ' A' + r1 + ',' + r1 + ' 0 ' + large + ' 1 ' + x1 + ',' + y1 +
    ' L' + x2 + ',' + y2 + ' A' + r0 + ',' + r0 + ' 0 ' + large + ' 0 ' + x3 + ',' + y3 + ' Z';
}
function renderCharts() {
  var host = $('#cnf-charts'); if (!host) return;
  host.innerHTML = '';
  var st = computeStats(S.raw);
  var cnt = {};
  STATUTS.forEach(function (s) { cnt[s] = 0; });
  S.raw.forEach(function (v) { if (cnt[v.statutDocument] !== undefined) cnt[v.statutDocument]++; });

  /* — Donut des statuts — */
  var c1 = el('section', { class: 'cnf-chart-card' });
  c1.appendChild(el('h3', { class: 'cnf-chart-title', text: 'Statuts des vérifications' }));
  var box1 = el('div', { class: 'cnf-donutbox' });
  var svg = sEl('svg', { viewBox: '0 0 160 160', class: 'cnf-donut', role: 'img', 'aria-label': 'Répartition des statuts' });
  var total = st.total || 1, a0 = -Math.PI / 2;
  STATUTS.forEach(function (s) {
    var n = cnt[s]; if (!n) return;
    var a1 = a0 + n / total * 2 * Math.PI;
    var p = sEl('path', { d: arcPath(80, 80, 46, 72, a0 + 0.012, Math.max(a0 + 0.013, a1 - 0.012)), class: 'cnf-dseg', style: 'fill:var(--cnf-' + ST_VAR[s] + ')', tabindex: '0', role: 'button', 'aria-label': s + ' : ' + n });
    var ti = sEl('title'); ti.textContent = s + ' — ' + n + ' (cliquer pour filtrer)'; p.appendChild(ti);
    p.addEventListener('click', function () { filtStatut(s); });
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filtStatut(s); } });
    svg.appendChild(p); a0 = a1;
  });
  var tn = sEl('text', { x: '80', y: '77', 'text-anchor': 'middle', class: 'cnf-donut-num' }); tn.textContent = String(st.total); svg.appendChild(tn);
  var tl = sEl('text', { x: '80', y: '95', 'text-anchor': 'middle', class: 'cnf-donut-lab' }); tl.textContent = 'vérifications'; svg.appendChild(tl);
  box1.appendChild(svg);
  var leg = el('div', { class: 'cnf-legend' });
  STATUTS.forEach(function (s) {
    leg.appendChild(el('button', { class: 'cnf-legend-item' + (S.fStatut === s ? ' cnf-legend-on' : ''), type: 'button', title: 'Filtrer : ' + s, onclick: function () { filtStatut(s); } },
      el('span', { class: 'cnf-swatch', style: 'background:var(--cnf-' + ST_VAR[s] + ')' }),
      el('span', { text: s + ' · ' + cnt[s] })));
  });
  box1.appendChild(leg);
  c1.appendChild(box1);
  c1.appendChild(el('p', { class: 'cnf-chart-note', text: 'Cliquez un statut (segment ou légende) pour filtrer la liste.' }));
  host.appendChild(c1);

  /* — Répartition par type de document — */
  var c2 = el('section', { class: 'cnf-chart-card' });
  c2.appendChild(el('h3', { class: 'cnf-chart-title', text: 'Répartition par type de document' }));
  var bars = el('div', { class: 'cnf-bars' });
  var types = distinctTypes(S.raw).map(function (t) {
    return { name: t, n: S.raw.filter(function (v) { return v.typeDocument === t; }).length };
  }).filter(function (t) { return t.n > 0; }).sort(function (a, b) { return b.n - a.n; });
  var mx = types.reduce(function (m, t) { return Math.max(m, t.n); }, 1);
  types.forEach(function (t) {
    var b = el('button', { class: 'cnf-bar-row' + (S.fType === t.name ? ' cnf-bar-on' : ''), type: 'button', title: 'Filtrer : ' + t.name + ' (' + t.n + ')' });
    b.appendChild(el('span', { class: 'cnf-bar-label', text: t.name }));
    b.appendChild(el('span', { class: 'cnf-bar-track' }, el('span', { class: 'cnf-bar-fill', style: 'width:' + Math.round(t.n / mx * 100) + '%' })));
    b.appendChild(el('span', { class: 'cnf-bar-count', text: String(t.n) }));
    b.addEventListener('click', function () { filtType(t.name); });
    bars.appendChild(b);
  });
  if (!types.length) bars.appendChild(el('div', { class: 'cnf-empty', text: 'Aucun type à afficher.' }));
  c2.appendChild(bars);
  c2.appendChild(el('p', { class: 'cnf-chart-note', text: 'Cliquez un type pour filtrer — chaque colonne de la vue Par employé reprend ces types.' }));
  host.appendChild(c2);

  /* — Échéances par mois à venir (prévenance) — */
  var c3 = el('section', { class: 'cnf-chart-card' });
  c3.appendChild(el('h3', { class: 'cnf-chart-title', text: 'Échéances par mois (12 mois à venir)' }));
  var mo = el('div', { class: 'cnf-mo' });
  var now = today0();
  var months = [], counts = [];
  for (var i = 0; i < 12; i++) {
    var d0 = new Date(now.getFullYear(), now.getMonth() + i, 1);
    var key = d0.getFullYear() + '-' + pad2(d0.getMonth() + 1);
    var n2 = S.raw.filter(function (v) {
      var d = parseDj(v.dateEcheance);
      return !!d && (d.getFullYear() + '-' + pad2(d.getMonth() + 1)) === key;
    }).length;
    months.push({ key: key, lab: d0.toLocaleDateString('fr-FR', { month: 'short' }) + ' ' + String(d0.getFullYear()).slice(2), n: n2 });
    counts.push(n2);
  }
  var mx2 = Math.max.apply(null, counts.concat([1]));
  months.forEach(function (m) {
    var col = el('button', { class: 'cnf-mo-col' + (S.fMode === 'echeanceMois:' + m.key ? ' cnf-mo-on' : ''), type: 'button', title: m.lab + ' — ' + m.n + ' échéance' + pl(m.n), 'aria-label': m.lab + ' : ' + m.n + ' échéances' });
    col.appendChild(el('span', { class: 'cnf-mo-val', text: m.n ? String(m.n) : '' }));
    var tr = el('span', { class: 'cnf-mo-track' });
    var fi = el('span', { class: 'cnf-mo-fill' });
    fi.style.height = (m.n ? Math.max(8, Math.round(m.n / mx2 * 100)) : 2) + '%';
    tr.appendChild(fi); col.appendChild(tr);
    col.appendChild(el('span', { class: 'cnf-mo-lab', text: m.lab }));
    col.addEventListener('click', function () { filtMode('echeanceMois:' + m.key); });
    mo.appendChild(col);
  });
  c3.appendChild(mo);
  c3.appendChild(el('p', { class: 'cnf-chart-note', text: 'Prévenance : cliquez un mois pour isoler ses échéances — re-vérifier AVANT, pas après.' }));
  host.appendChild(c3);
}

/* ==========================================================================
 * 12. VUES — Par employé (signature) / Tableau / Cartes
 * ========================================================================== */
function renderView(list) {
  var host = $('#cnf-view'); if (!host) return;
  if (S.view === 'table') renderTable(list);
  else if (S.view === 'cards') renderCards(list);
  else renderEmployes(list);
}
function renderEmployes(list) {
  var host = $('#cnf-view'); host.innerHTML = '';
  var types = distinctTypes(list);
  var emps = {};
  list.forEach(function (v) { (emps[v.employe] = emps[v.employe] || []).push(v); });
  var names = Object.keys(emps).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  var st = computeStats(list);
  var wrap = el('div', { class: 'cnf-empwrap' });
  wrap.appendChild(el('div', { class: 'cnf-emp-counts', text: names.length + ' employé' + pl(names.length) + ' · ' + st.pct + ' % conforme · ' + st.nonconforme + ' document' + pl(st.nonconforme) + ' à régulariser' }));
  if (!names.length) wrap.appendChild(el('div', { class: 'cnf-empty', text: 'Aucun employé dans la sélection — Réinitialiser pour tout revoir.' }));
  var grid = el('div', { class: 'cnf-emptable', role: 'table', 'aria-label': 'Conformité par employé' });
  var gcols = 'var(--cnf-empw) repeat(' + Math.max(types.length, 1) + ',minmax(112px,1fr))';

  var hr = el('div', { class: 'cnf-emp-row cnf-emp-rowhead', role: 'row', style: 'grid-template-columns:' + gcols });
  hr.appendChild(el('div', { class: 'cnf-emp-head', text: 'Employé · Département' }));
  types.forEach(function (t) { hr.appendChild(el('div', { class: 'cnf-emp-colhead', title: t, text: shortType(t) })); });
  grid.appendChild(hr);

  names.forEach(function (nm) {
    var vs = emps[nm], byType = {};
    vs.forEach(function (v) { byType[v.typeDocument] = v; });
    var nc = vs.filter(function (x) { return x.statutDocument === 'Non conforme'; }).length;
    var at = vs.filter(function (x) { return x.statutDocument === 'En attente'; }).length;
    var cf = vs.filter(function (x) { return x.statutDocument === 'Conforme'; }).length;
    var pct = vs.length ? Math.round(cf / vs.length * 100) : 0;
    var row = el('div', { class: 'cnf-emp-row', role: 'row', style: 'grid-template-columns:' + gcols });
    var head = el('div', { class: 'cnf-emp-head' });
    head.appendChild(el('span', { class: 'cnf-emp-dot ' + (nc > 0 ? 'cnf-emp-dot-red' : (at > 0 ? 'cnf-emp-dot-orange' : 'cnf-emp-dot-green')), 'aria-hidden': 'true', title: nc ? nc + ' non conforme(s)' : (at ? at + ' en attente' : 'aucun problème détecté') }));
    head.appendChild(el('span', { class: 'cnf-emp-name', text: nm }));
    head.appendChild(el('span', { class: 'cnf-emp-dept', text: vs[0].departement || '—' }));
    head.appendChild(el('span', { class: 'cnf-emp-pct ' + (pct >= 80 ? 'cnf-pct-good' : (pct >= 50 ? 'cnf-pct-warn' : 'cnf-pct-bad')), title: pct + ' % de documents conformes', text: pct + ' %' }));
    row.appendChild(head);
    types.forEach(function (t) {
      var v = byType[t];
      if (!v) { row.appendChild(el('div', { class: 'cnf-emp-cell cnf-emp-cell-empty', title: t + ' — aucune vérification', text: '·' })); return; }
      var c = el('button', { class: 'cnf-emp-cell ' + ST_CLASS[v.statutDocument], type: 'button', title: t + ' — ' + v.statutDocument + (v.dateEcheance ? ' — échéance ' + v.dateEcheance : '') + (v.verificateur ? ' — vérifié par ' + v.verificateur : ' — sans vérificateur'), onclick: function () { openDrawer(v.id); } });
      c.appendChild(el('span', { class: 'cnf-emp-cell-txt', text: shortStatut(v.statutDocument) }));
      row.appendChild(c);
    });
    grid.appendChild(row);
  });
  wrap.appendChild(grid);
  wrap.appendChild(el('p', { class: 'cnf-chart-note', text: 'Pastille rouge = au moins 1 non conforme · orange = en attente · verte = rien à signaler. Cliquez une cellule pour ouvrir la fiche de CETTE vérification.' }));
  host.appendChild(wrap);
}
function echBadge(v) {
  var d = daysFromToday(v.dateEcheance);
  if (d === null) return el('span', { class: 'cnf-ech', text: '—' });
  var cls = 'cnf-ech' + (v.statutDocument === 'Expiré' || d < 0 ? ' cnf-ech-late' : (d <= S.seuils.echeanceProche ? ' cnf-ech-soon' : ''));
  return el('span', { class: cls, text: v.dateEcheance + ' (J' + (d < 0 ? '−' + (-d) : '+' + d) + ')' });
}
function renderTable(list) {
  var host = $('#cnf-view'); host.innerHTML = '';
  var wrap = el('div', { class: 'cnf-tablewrap' });
  var table = el('table', { class: 'cnf-table' });
  var thead = el('thead'), trh = el('tr');
  var allSel = list.length > 0 && list.every(function (v) { return S.sel[v.id]; });
  var thC = el('th', { class: 'cnf-col-check', scope: 'col', 'aria-label': 'Sélection' });
  thC.appendChild(checkbox(allSel, 'Tout sélectionner', function () {
    var on = this.checked;
    list.forEach(function (v) { if (on) S.sel[v.id] = true; else delete S.sel[v.id]; });
    renderAll();
  }));
  trh.appendChild(thC);
  COLS.forEach(function (c) {
    var on = S.sortKey === c[0];
    var th = el('th', { scope: 'col', class: 'cnf-th-sort', 'aria-sort': on ? (S.sortDir > 0 ? 'ascending' : 'descending') : 'none' });
    th.appendChild(el('button', { class: 'cnf-th-btn', type: 'button', title: 'Trier par ' + c[1], onclick: function () { if (S.sortKey === c[0]) S.sortDir *= -1; else { S.sortKey = c[0]; S.sortDir = 1; } S.page = 1; renderAll(); }, text: c[1] + (on ? (S.sortDir > 0 ? ' ▲' : ' ▼') : '') }));
    trh.appendChild(th);
  });
  trh.appendChild(el('th', { class: 'cnf-col-actions', scope: 'col', text: 'Actions' }));
  thead.appendChild(trh); table.appendChild(thead);

  var tbody = el('tbody');
  var per = S.per, start = (S.page - 1) * per, rows = list.slice(start, start + per);
  rows.forEach(function (v) {
    var tr = el('tr', { class: 'cnf-row' + (S.sel[v.id] ? ' cnf-row-sel' : ''), 'data-cnf-id': String(v.id) });
    var td0 = el('td', { class: 'cnf-col-check' });
    td0.appendChild(checkbox(!!S.sel[v.id], 'Sélectionner ' + v.numero, function () {
      if (this.checked) S.sel[v.id] = true; else delete S.sel[v.id];
      renderAll();
    }));
    tr.appendChild(td0);
    tr.appendChild(el('td', null, el('button', { class: 'cnf-num-link', type: 'button', title: 'Ouvrir la fiche ' + v.numero, onclick: function () { openDrawer(v.id); }, text: v.numero })));
    tr.appendChild(el('td', { text: v.typeDocument }));
    tr.appendChild(el('td', { text: v.employe }));
    tr.appendChild(el('td', { text: v.poste || '—' }));
    tr.appendChild(el('td', { text: v.departement || '—' }));
    tr.appendChild(el('td', null, el('span', { class: 'cnf-chip ' + ST_CLASS[v.statutDocument], text: v.statutDocument })));
    tr.appendChild(el('td', { text: v.dateVerification || '—' }));
    tr.appendChild(el('td', { text: v.verificateur || '—' }));
    tr.appendChild(el('td', null, echBadge(v)));
    tr.appendChild(el('td', null, el('span', { class: 'cnf-cmt', title: v.commentaires || '', text: v.commentaires || '—' })));
    var tdA = el('td', { class: 'cnf-col-actions' });
    tdA.appendChild(el('button', { class: 'cnf-act', type: 'button', 'aria-label': 'Ouvrir ' + v.numero, onclick: function () { openDrawer(v.id); }, text: 'Ouvrir' }));
    tdA.appendChild(el('button', { class: 'cnf-act', type: 'button', 'aria-label': 'Dupliquer ' + v.numero, onclick: function () { duplicate(v.id); }, text: 'Dupliquer' }));
    tdA.appendChild(el('button', { class: 'cnf-act cnf-act-danger', type: 'button', 'aria-label': 'Supprimer ' + v.numero, onclick: function () { askDelete(v.id); }, text: 'Supprimer' }));
    tr.appendChild(tdA);
    tbody.appendChild(tr);
  });
  if (!rows.length) {
    var trE = el('tr'), tdE = el('td', { class: 'cnf-empty', colSpan: '12' });
    tdE.textContent = 'Aucune vérification ne correspond aux filtres — « Réinitialiser » (T) pour tout revoir.';
    trE.appendChild(tdE); tbody.appendChild(trE);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);
  host.appendChild(wrap);
}
function renderCards(list) {
  var host = $('#cnf-view'); host.innerHTML = '';
  var grid = el('div', { class: 'cnf-cards' });
  list.forEach(function (v) {
    var c = el('article', { class: 'cnf-card' });
    c.appendChild(el('div', { class: 'cnf-card-top' },
      el('button', { class: 'cnf-num-link', type: 'button', onclick: function () { openDrawer(v.id); }, text: v.numero }),
      el('span', { class: 'cnf-chip ' + ST_CLASS[v.statutDocument], text: v.statutDocument })));
    c.appendChild(el('div', { class: 'cnf-card-type', text: v.typeDocument }));
    c.appendChild(el('div', { class: 'cnf-card-emp', text: v.employe }));
    c.appendChild(el('div', { class: 'cnf-card-meta', text: [v.poste, v.departement].filter(Boolean).join(' · ') || '—' }));
    var meta2 = el('div', { class: 'cnf-card-meta' });
    meta2.appendChild(echBadge(v));
    meta2.appendChild(el('span', { text: ' · vérifié le ' + (v.dateVerification || '—') + (v.verificateur ? ' par ' + v.verificateur : ' — sans vérificateur') }));
    c.appendChild(meta2);
    if (v.commentaires) c.appendChild(el('div', { class: 'cnf-card-cmt', title: v.commentaires, text: v.commentaires }));
    var acts = el('div', { class: 'cnf-card-acts' });
    acts.appendChild(el('button', { class: 'cnf-act', type: 'button', onclick: function () { openDrawer(v.id); }, text: 'Ouvrir' }));
    acts.appendChild(el('button', { class: 'cnf-act', type: 'button', onclick: function () { duplicate(v.id); }, text: 'Dupliquer' }));
    acts.appendChild(el('button', { class: 'cnf-act cnf-act-danger', type: 'button', onclick: function () { askDelete(v.id); }, text: 'Supprimer' }));
    c.appendChild(acts);
    grid.appendChild(c);
  });
  if (!list.length) grid.appendChild(el('div', { class: 'cnf-empty', text: 'Aucune carte — ajustez la recherche ou Réinitialiser.' }));
  host.appendChild(grid);
}
function renderPager(list) {
  var host = $('#cnf-pager'); if (!host) return;
  host.innerHTML = '';
  var total = list.length, pages = Math.max(1, Math.ceil(total / S.per));
  if (S.page > pages) S.page = pages;
  var start = (S.page - 1) * S.per, end = Math.min(total, start + S.per);
  host.appendChild(el('span', { class: 'cnf-pager-info', text: total ? (start + 1) + '–' + end + ' sur ' + total : '0 vérification' }));
  var pb = { class: 'cnf-pager-btn', type: 'button', 'aria-label': 'Page précédente', text: '‹', onclick: function () { S.page--; renderAll(); } };
  if (S.page <= 1) pb.disabled = '1';
  host.appendChild(el('button', pb));
  host.appendChild(el('span', { class: 'cnf-pager-info', text: S.page + ' / ' + pages }));
  var nb = { class: 'cnf-pager-btn', type: 'button', 'aria-label': 'Page suivante', text: '›', onclick: function () { S.page++; renderAll(); } };
  if (S.page >= pages) nb.disabled = '1';
  host.appendChild(el('button', nb));
  var lab = el('label', { class: 'cnf-per' }, ' Par page ');
  var ps = el('select', { class: 'cnf-sel cnf-per-sel', 'aria-label': 'Lignes par page', onchange: function () { S.per = +this.value; S.page = 1; renderAll(); } });
  [5, 10, 25].forEach(function (n) {
    var o = el('option', { value: String(n), text: String(n) });
    if (n === S.per) o.selected = true;
    ps.appendChild(o);
  });
  lab.appendChild(ps);
  host.appendChild(lab);
}
function renderBulk() {
  var host = $('#cnf-bulk'); if (!host) return;
  var ids = Object.keys(S.sel).filter(function (k) { return S.sel[k]; }).map(Number).filter(function (id) { return !!byId(S.raw, id); });
  host.innerHTML = '';
  if (!ids.length) { host.hidden = true; return; }
  host.hidden = false;
  host.appendChild(el('span', { class: 'cnf-bulk-info', text: ids.length + ' vérification' + pl(ids.length) + ' sélectionnée' + pl(ids.length) }));
  host.appendChild(el('button', { class: 'cnf-btn cnf-btn-danger', type: 'button', onclick: function () {
    askConfirm('Supprimer la sélection ?', ids.length + ' vérification' + pl(ids.length) + ' sera' + (ids.length > 1 ? 'ont' : '') + ' supprimée' + pl(ids.length) + ' — inscription au journal.', function () { doDelete(ids); });
  }, text: 'Supprimer la sélection' }));
  host.appendChild(el('button', { class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: function () { S.sel = {}; renderAll(); }, text: 'Tout désélectionner' }));
}

/* ==========================================================================
 * 13. MUTATIONS — création, édition, duplication, suppression
 * ========================================================================== */
function doDelete(ids) {
  var list = freshData();
  var removed = [];
  ids.forEach(function (id) {
    var v = byId(list, id);
    if (v) { removed.push(v.numero); list = list.filter(function (x) { return +x.id !== +id; }); }
    delete S.sel[id];
  });
  if (!removed.length) return;
  persist(list);
  jlog(removed.length > 1 ? 'suppression-groupee' : 'suppression', removed.join(', '), removed[0]);
  toast(removed.length + ' vérification' + pl(removed.length) + ' supprimée' + pl(removed.length) + ' (journalisé)', 'ok');
  if (S.drawerId && ids.indexOf(+S.drawerId) > -1) closeDrawer();
  renderAll();
}
function askDelete(id) {
  var v = byId(freshData(), id);
  if (!v) return;
  askConfirm('Supprimer ' + v.numero + ' ?', v.typeDocument + ' — ' + v.employe + '. Cette action est inscrite au journal (500 max).', function () { doDelete([id]); });
}
function duplicate(id) {
  var list = freshData();
  var v = byId(list, id);
  if (!v) return;
  var copy = Object.assign({}, v);
  copy.id = nextId(list);
  copy.numero = nextNumero(list);
  copy.statutDocument = 'En attente';
  copy.dateVerification = '';
  list.push(copy);
  persist(list);
  jlog('duplication', v.numero + ' → ' + copy.numero, copy.numero);
  toast('Dupliqué en ' + copy.numero + ' (statut En attente, date vidée)', 'ok');
  S.drawerId = copy.id;
  renderAll();
  renderDrawer();
}

/* ==========================================================================
 * 14. DRAWER — fiche vérification (statut rapide + inline + historique)
 * ========================================================================== */
function drawerOpen() { var w = $('#cnf-drawer-wrap'); return !!w && !w.hidden; }
function openDrawer(id) {
  S.drawerId = id;
  renderDrawer();
  var w = $('#cnf-drawer-wrap');
  if (w) { w.hidden = false; document.documentElement.classList.add('cnf-lock'); }
  jlog('consultation', 'ouverture fiche', String((byId(freshData(), id) || {}).numero || ''));
}
function closeDrawer() {
  S.drawerId = null;
  var w = $('#cnf-drawer-wrap');
  if (w) w.hidden = true;
  unlockIfFree();
}
function unlockIfFree() {
  var any = ['#cnf-drawer-wrap', '#cnf-dialog-wrap', '#cnf-confirm-wrap', '#cnf-panel-wrap'].some(function (s) { var w = $(s); return w && !w.hidden; });
  if (!any) document.documentElement.classList.remove('cnf-lock');
}
function drawerAlerts(v) {
  var A = [];
  if (v.statutDocument === 'Non conforme') A.push(['bad', 'Non conforme — à régulariser maintenant.']);
  if ((v.verificateur || '') === '') A.push(['warn', 'Sans vérificateur : preuve incomplète — qui a vérifié, à quelle date ?']);
  if (v.statutDocument === 'En attente') {
    if (!v.dateVerification) A.push(['warn', 'En attente sans aucune vérification enregistrée — relancer.']);
    else {
      var d0 = daysSince(v.dateVerification);
      if (d0 !== null && d0 > S.seuils.attenteJours) A.push(['warn', 'En attente depuis ' + d0 + ' j (> ' + S.seuils.attenteJours + ' j) — relancer.']);
    }
  }
  var de = daysFromToday(v.dateEcheance);
  if (de !== null && v.statutDocument !== 'Expiré') {
    if (de < 0) A.push(['bad', 'Échéance dépassée depuis ' + (-de) + ' j — re-vérifier.']);
    else if (de <= S.seuils.echeanceProche) A.push(['warn', 'Échéance dans ' + de + ' j — prévenance : re-vérifier avant.']);
  }
  if (v.statutDocument === 'Expiré') A.push(['info', 'Statut Expiré — planifier une nouvelle vérification.']);
  if (!A.length) A.push(['ok', 'Rien à signaler : la preuve est complète (vérificateur + date).']);
  return A;
}
function updField(id, field, newVal) {
  var list = freshData();
  var v = byId(list, id);
  if (!v) return false;
  if ((field === 'dateVerification' || field === 'dateEcheance') && newVal !== '' && !parseDj(newVal)) {
    toast('Date invalide (jj/mm/aaaa attendu) — rien modifié', 'bad');
    renderDrawer();
    return false;
  }
  v[field] = newVal;
  if (field === 'statutDocument' && newVal === 'Conforme' && !v.dateVerification) {
    v.dateVerification = fmtDj(today0());
    toast('Passage à Conforme : date de vérification posée au ' + v.dateVerification + ' (auto)', 'ok');
  }
  persist(list);
  jlog(field === 'statutDocument' ? 'changement-statut' : 'modification-inline', field + ' → ' + (newVal === '' ? '(vide)' : newVal), v.numero);
  renderAll();
  renderDrawer();
  return true;
}
function renderDrawer() {
  var box = $('#cnf-drawer');
  if (!box) return;
  var v = byId(freshData(), S.drawerId);
  if (!v) { closeDrawer(); return; }
  box.innerHTML = '';

  var head = el('div', { class: 'cnf-drawer-head' });
  var ht = el('div');
  ht.appendChild(el('div', { class: 'cnf-drawer-title', text: v.numero + ' — ' + v.typeDocument }));
  ht.appendChild(el('div', { class: 'cnf-drawer-sub', text: v.employe + (v.poste ? ' · ' + v.poste : '') + (v.departement ? ' · ' + v.departement : '') }));
  head.appendChild(ht);
  head.appendChild(el('button', { class: 'cnf-drawer-close', type: 'button', 'aria-label': 'Fermer la fiche', onclick: closeDrawer, text: '×' }));
  box.appendChild(head);

  var body = el('div', { class: 'cnf-drawer-body' });

  var secS = el('div', { class: 'cnf-sec' });
  secS.appendChild(el('div', { class: 'cnf-sec-title', text: 'Statut (changement rapide)' }));
  var sr = el('div', { class: 'cnf-statusrow' });
  STATUTS.forEach(function (s) {
    sr.appendChild(el('button', { class: 'cnf-statusbtn ' + ST_CLASS[s] + (v.statutDocument === s ? ' cnf-statusbtn-on' : ''), type: 'button', onclick: function () { updField(v.id, 'statutDocument', s); }, text: s }));
  });
  secS.appendChild(sr);
  body.appendChild(secS);

  var secA = el('div', { class: 'cnf-sec' });
  secA.appendChild(el('div', { class: 'cnf-sec-title', text: 'Alertes de cette fiche' }));
  var ia = el('div', { class: 'cnf-inline-alerts' });
  drawerAlerts(v).forEach(function (a) { ia.appendChild(el('div', { class: 'cnf-inline-alert cnf-ia-' + a[0], text: a[1] })); });
  secA.appendChild(ia);
  body.appendChild(secA);

  var secP = el('div', { class: 'cnf-sec' });
  secP.appendChild(el('div', { class: 'cnf-sec-title', text: 'Preuve — qui, quand' }));
  var fDv = el('div', { class: 'cnf-field' }, el('span', { class: 'cnf-field-label', text: 'Date de vérification (jj/mm/aaaa)' }));
  var inDv = el('input', { id: 'cnf-drv-dv', class: 'cnf-input', type: 'text', inputmode: 'numeric', placeholder: 'jj/mm/aaaa', value: v.dateVerification || '' });
  inDv.addEventListener('change', function () { updField(v.id, 'dateVerification', String(this.value || '').trim()); });
  fDv.appendChild(inDv);
  secP.appendChild(fDv);
  var fVe = el('div', { class: 'cnf-field' }, el('span', { class: 'cnf-field-label', text: 'Vérificateur (la responsabilité fait partie de la preuve)' }));
  var inVe = el('input', { id: 'cnf-drv-verif', class: 'cnf-input', type: 'text', placeholder: 'Qui a vérifié ?', value: v.verificateur || '' });
  inVe.addEventListener('change', function () { updField(v.id, 'verificateur', String(this.value || '').trim()); });
  fVe.appendChild(inVe);
  secP.appendChild(fVe);
  body.appendChild(secP);

  var secE = el('div', { class: 'cnf-sec' });
  secE.appendChild(el('div', { class: 'cnf-sec-title', text: 'Échéance (documents à durée limitée)' }));
  var fDe = el('div', { class: 'cnf-field' }, el('span', { class: 'cnf-field-label', text: "Date d'échéance (jj/mm/aaaa, optionnelle)" }));
  var inDe = el('input', { id: 'cnf-drv-de', class: 'cnf-input', type: 'text', inputmode: 'numeric', placeholder: 'jj/mm/aaaa', value: v.dateEcheance || '' });
  inDe.addEventListener('change', function () { updField(v.id, 'dateEcheance', String(this.value || '').trim()); });
  fDe.appendChild(inDe);
  secE.appendChild(fDe);
  secE.appendChild(el('div', { id: 'cnf-drv-prev', class: 'cnf-drv-prev' }));
  body.appendChild(secE);

  var secC = el('div', { class: 'cnf-sec' });
  secC.appendChild(el('div', { class: 'cnf-sec-title', text: 'Commentaires (inline)' }));
  var ta = el('textarea', { id: 'cnf-drv-cmt', class: 'cnf-textarea', rows: '3', placeholder: 'Observations, démarche en cours…' });
  ta.value = v.commentaires || '';
  ta.addEventListener('change', function () { updField(v.id, 'commentaires', String(this.value || '').trim()); });
  secC.appendChild(ta);
  body.appendChild(secC);

  var secH = el('div', { class: 'cnf-sec' });
  secH.appendChild(el('div', { class: 'cnf-sec-title', text: 'Historique — journal local (numero ' + v.numero + ')' }));
  var hist = el('div', { class: 'cnf-hist' });
  var items = jread().filter(function (j) { return j.numero === v.numero; }).reverse().slice(0, 20);
  if (!items.length) hist.appendChild(el('div', { class: 'cnf-hist-empty', text: 'Aucune opération journalisée pour ce numero.' }));
  items.forEach(function (j) {
    hist.appendChild(el('div', { class: 'cnf-hist-item' },
      el('span', { class: 'cnf-hist-ts', text: fmtTs(j.ts) }),
      el('span', { class: 'cnf-hist-act', text: j.action }),
      el('span', { class: 'cnf-hist-detail', text: j.detail || '' })));
  });
  secH.appendChild(hist);
  body.appendChild(secH);

  box.appendChild(body);
  var foot = el('div', { class: 'cnf-drawer-foot' });
  foot.appendChild(el('button', { id: 'cnf-drv-dup', class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: function () { duplicate(v.id); }, text: 'Dupliquer' }));
  foot.appendChild(el('button', { id: 'cnf-drv-del', class: 'cnf-btn cnf-btn-danger', type: 'button', onclick: function () { askDelete(v.id); }, text: 'Supprimer' }));
  foot.appendChild(el('button', { class: 'cnf-btn cnf-btn-primary', type: 'button', onclick: closeDrawer, text: 'Fermer' }));
  box.appendChild(foot);

  var prev = $('#cnf-drv-prev', box);
  if (prev) {
    var de2 = daysFromToday(v.dateEcheance), dv2 = daysSince(v.dateVerification);
    if (de2 !== null) {
      if (de2 < 0) prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-bad', text: 'Échéance dépassée depuis ' + (-de2) + ' j.' }));
      else if (de2 <= S.seuils.echeanceProche) prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-warn', text: 'Échéance dans ' + de2 + ' j (≤ ' + S.seuils.echeanceProche + ' j : prévenance).' }));
      else prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-ok', text: 'Échéance dans ' + de2 + ' j.' }));
    } else prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-muted', text: 'Aucune échéance (document à durée illimitée ?).' }));
    if (dv2 !== null) prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-info', text: 'Vérifiée il y a ' + dv2 + ' j' + (v.verificateur ? ' par ' + v.verificateur : ' — sans vérificateur') + '.' }));
  }
  var c = $('#cnf-drawer-close', box); if (c) c.focus();
}

/* ==========================================================================
 * 15. DIALOG CRÉATION/ÉDITION — VALIDÉ (aperçu live, save disabled)
 * ========================================================================== */
function dialogOpen() { var w = $('#cnf-dialog-wrap'); return !!w && !w.hidden; }
function openDialog(editId) {
  S.editId = (typeof editId === 'number') ? editId : null;
  renderDialog();
  var w = $('#cnf-dialog-wrap');
  if (w) { w.hidden = false; document.documentElement.classList.add('cnf-lock'); }
  var first = $('#cnf-f-type'); if (first) first.focus();
}
function closeDialog() {
  S.editId = null;
  var w = $('#cnf-dialog-wrap');
  if (w) w.hidden = true;
  unlockIfFree();
}
function renderDialog() {
  var box = $('#cnf-dialog');
  if (!box) return;
  var v = S.editId != null ? byId(freshData(), S.editId) : null;
  box.innerHTML = '';
  var src = v || { typeDocument: '', statutDocument: 'En attente', employe: '', poste: '', departement: '', dateVerification: '', verificateur: '', dateEcheance: '', commentaires: '' };

  box.appendChild(el('div', { class: 'cnf-dialog-title', text: v ? 'Modifier ' + v.numero : 'Nouvelle vérification — ' + (UI.nextNumero || nextNumero(S.raw)) }));
  box.appendChild(el('div', { class: 'cnf-dialog-sub', text: "Type, employé, poste, département et statut obligatoires · dates jj/mm/aaaa valides · au passage à Conforme sans date, la date du jour est posée automatiquement." }));

  var body = el('div', { class: 'cnf-dialog-body' });
  var grid = el('div', { class: 'cnf-form-grid' });

  var dls = document.createElement('datalist'); dls.id = 'cnf-dl-types';
  distinctTypes(S.raw).forEach(function (t) { dls.appendChild(el('option', { value: t })); });
  var dle = document.createElement('datalist'); dle.id = 'cnf-dl-emps';
  distinct(S.raw.map(function (x) { return x.employe; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); }).forEach(function (t) { dle.appendChild(el('option', { value: t })); });
  var dld = document.createElement('datalist'); dld.id = 'cnf-dl-depts';
  distinct(S.raw.map(function (x) { return x.departement; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); }).forEach(function (t) { dld.appendChild(el('option', { value: t })); });

  function field(key, labelTxt, node, hint) {
    var w = el('label', { class: 'cnf-field' + (key === 'commentaires' ? ' cnf-span2' : '') });
    w.appendChild(el('span', { class: 'cnf-field-label', text: labelTxt }));
    w.appendChild(node);
    if (hint) w.appendChild(el('span', { class: 'cnf-err', 'data-hint': '1', text: hint }));
    w.appendChild(el('span', { class: 'cnf-err', id: 'cnf-f-err-' + key, text: '' }));
    return w;
  }
  var inType = el('input', { id: 'cnf-f-type', class: 'cnf-input', type: 'text', list: 'cnf-dl-types', placeholder: 'Contrat de travail, Diplôme…', value: src.typeDocument || '' });
  var inEmp = el('input', { id: 'cnf-f-emp', class: 'cnf-input', type: 'text', list: 'cnf-dl-emps', placeholder: 'Nom de l\u2019employé', value: src.employe || '' });
  var inPoste = el('input', { id: 'cnf-f-poste', class: 'cnf-input', type: 'text', placeholder: 'Poste occupé', value: src.poste || '' });
  var inDep = el('input', { id: 'cnf-f-dep', class: 'cnf-input', type: 'text', list: 'cnf-dl-depts', placeholder: 'Département', value: src.departement || '' });
  var selStat = el('select', { id: 'cnf-f-statut', class: 'cnf-input' });
  STATUTS.forEach(function (s) {
    var o = el('option', { value: s, text: s });
    if (s === src.statutDocument) o.selected = true;
    selStat.appendChild(o);
  });
  var inDv = el('input', { id: 'cnf-f-dv', class: 'cnf-input', type: 'text', inputmode: 'numeric', placeholder: 'jj/mm/aaaa (auto si Conforme)', value: src.dateVerification || '' });
  var inVerif = el('input', { id: 'cnf-f-verif', class: 'cnf-input', type: 'text', placeholder: 'Qui a vérifié ? (optionnel)', value: src.verificateur || '' });
  var inDe = el('input', { id: 'cnf-f-de', class: 'cnf-input', type: 'text', inputmode: 'numeric', placeholder: 'jj/mm/aaaa (optionnel)', value: src.dateEcheance || '' });
  var taC = el('textarea', { id: 'cnf-f-cmt', class: 'cnf-textarea', rows: '3', placeholder: 'Commentaires…' });
  taC.value = src.commentaires || '';

  grid.appendChild(field('typeDocument', 'Type de document *', inType));
  grid.appendChild(field('statutDocument', 'Statut *', selStat));
  grid.appendChild(field('employe', 'Employé *', inEmp));
  grid.appendChild(field('poste', 'Poste *', inPoste));
  grid.appendChild(field('departement', 'Département *', inDep));
  grid.appendChild(field('dateVerification', 'Date de vérification', inDv));
  grid.appendChild(field('verificateur', 'Vérificateur', inVerif));
  grid.appendChild(field('dateEcheance', "Date d'échéance", inDe));
  grid.appendChild(field('commentaires', 'Commentaires', taC));
  grid.appendChild(dls); grid.appendChild(dle); grid.appendChild(dld);
  body.appendChild(grid);

  var prev = el('div', { id: 'cnf-preview', class: 'cnf-preview' });
  body.appendChild(prev);
  box.appendChild(body);

  var foot = el('div', { class: 'cnf-dialog-foot' });
  foot.appendChild(el('button', { id: 'cnf-f-cancel', class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: closeDialog, text: 'Annuler' }));
  var save = el('button', { id: 'cnf-f-save', class: 'cnf-btn cnf-btn-primary', type: 'button', text: v ? 'Enregistrer' : 'Créer la vérification' });
  save.addEventListener('click', saveDialog);
  foot.appendChild(save);
  box.appendChild(foot);

  function refresh() {
    var f = readForm();
    var errs = validateForm(f);
    ['typeDocument', 'employe', 'poste', 'departement', 'statutDocument', 'dateVerification', 'dateEcheance'].forEach(function (k) {
      var node = $('#cnf-f-' + (k === 'typeDocument' ? 'type' : k === 'employe' ? 'emp' : k === 'poste' ? 'poste' : k === 'departement' ? 'dep' : k === 'statutDocument' ? 'statut' : k === 'dateVerification' ? 'dv' : 'de'));
      if (node) node.classList.toggle('cnf-field-bad', !!errs[k]);
      var e = $('#cnf-f-err-' + k);
      if (e) e.textContent = errs[k] || '';
    });
    save.disabled = Object.keys(errs).length > 0;
    save.classList.toggle('cnf-btn-disabled', save.disabled);
    prev.innerHTML = '';
    if (f.dateVerification && parseDj(f.dateVerification)) {
      var d = daysSince(f.dateVerification);
      prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-info', text: 'Vérifiée il y a ' + d + ' j.' }));
    } else {
      prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-muted', text: f.statutDocument === 'Conforme' ? 'Pas encore vérifiée — la date du jour sera posée automatiquement à l\u2019enregistrement.' : 'Pas encore vérifiée.' }));
    }
    if (f.dateEcheance && parseDj(f.dateEcheance)) {
      var de3 = daysFromToday(f.dateEcheance);
      if (de3 < 0) prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-bad', text: 'Échéance dépassée depuis ' + (-de3) + ' j.' }));
      else if (de3 <= S.seuils.echeanceProche) prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-warn', text: 'Échéance dans ' + de3 + ' j (≤ ' + S.seuils.echeanceProche + ' j : prévenance).' }));
      else prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-ok', text: 'Échéance dans ' + de3 + ' j.' }));
    } else {
      prev.appendChild(el('span', { class: 'cnf-preview-line cnf-t-muted', text: 'Aucune échéance (document à durée illimitée ?).' }));
    }
  }
  [inType, inEmp, inPoste, inDep, inDv, inVerif, inDe, taC].forEach(function (n) {
    n.addEventListener('input', refresh);
    n.addEventListener('change', refresh);
  });
  selStat.addEventListener('change', function () {
    if (this.value === 'Conforme' && !val('#cnf-f-dv')) { inDv.value = fmtDj(today0()); toast('Conforme : date de vérification posée au ' + inDv.value, 'info'); }
    refresh();
  });
  refresh();
}
function readForm() {
  return {
    typeDocument: val('#cnf-f-type'),
    statutDocument: val('#cnf-f-statut'),
    employe: val('#cnf-f-emp'),
    poste: val('#cnf-f-poste'),
    departement: val('#cnf-f-dep'),
    dateVerification: val('#cnf-f-dv'),
    verificateur: val('#cnf-f-verif'),
    dateEcheance: val('#cnf-f-de'),
    commentaires: val('#cnf-f-cmt')
  };
}
function validateForm(f) {
  var errs = {};
  if (!f.typeDocument) errs.typeDocument = 'Type de document obligatoire';
  if (!f.employe) errs.employe = 'Employé obligatoire';
  if (!f.poste) errs.poste = 'Poste obligatoire';
  if (!f.departement) errs.departement = 'Département obligatoire';
  if (STATUTS.indexOf(f.statutDocument) < 0) errs.statutDocument = 'Statut obligatoire';
  if (f.dateVerification && !parseDj(f.dateVerification)) errs.dateVerification = 'Format jj/mm/aaaa attendu';
  if (f.dateEcheance && !parseDj(f.dateEcheance)) errs.dateEcheance = 'Format jj/mm/aaaa attendu';
  return errs;
}
function saveDialog() {
  var f = readForm();
  var errs = validateForm(f);
  if (Object.keys(errs).length) { toast('Formulaire invalide — corrigez les champs signalés', 'bad'); return; }
  var list = freshData();
  if (S.editId != null) {
    var v = byId(list, S.editId);
    if (!v) { closeDialog(); return; }
    Object.keys(f).forEach(function (k) { v[k] = f[k]; });
    persist(list);
    jlog('modification', 'fiche mise à jour (' + Object.keys(f).join(', ') + ')', v.numero);
    toast('Fiche ' + v.numero + ' enregistrée', 'ok');
  } else {
    var rec = Object.assign({ id: nextId(list), numero: UI.nextNumero || nextNumero(list) }, f);
    if (rec.statutDocument === 'Conforme' && !rec.dateVerification) rec.dateVerification = fmtDj(today0());
    list.push(rec);
    persist(list);
    jlog('creation', 'nouvelle vérification (' + rec.typeDocument + ' — ' + rec.employe + ')', rec.numero);
    toast('Vérification ' + rec.numero + ' créée', 'ok');
  }
  closeDialog();
  renderAll();
}
function openHelp() {
  var box = $('#cnf-dialog');
  if (!box) return;
  box.innerHTML = '';
  box.appendChild(el('div', { class: 'cnf-dialog-title', text: 'Aide & raccourcis — LE DOSSIER PROPRE' }));
  box.appendChild(el('div', { class: 'cnf-dialog-sub', text: "Trois questions : qu'est-ce qui n'est pas conforme (régulariser) ? qu'est-ce qui attend (relances) ? qu'est-ce qui expire bientôt (prévenance) ?" }));
  var body = el('div', { class: 'cnf-dialog-body' });
  var list = el('div', { class: 'cnf-help-list' });
  [
    ['N', 'Nouvelle vérification'], ['E', 'Exporter CSV (BOM, séparateur « ; »)'],
    ['J', 'Vue Tableau (journal des vérifications)'], ['P', 'Vue Par employé (signature)'],
    ['C', 'Vue Cartes'], ['S', 'Recherche (comme /)'], ['T', 'Tout afficher — Réinitialiser'],
    ['K', "Panneau des seuils (prévenance / relance)"], ['/', 'Focus recherche'], ['?', 'Cette aide'],
    ['Échap', 'Fermer la fenêtre active']
  ].forEach(function (r) {
    list.appendChild(el('div', { class: 'cnf-help-row' }, el('span', { class: 'cnf-kbd', text: r[0] }), el('span', { class: 'cnf-help-what', text: r[1] })));
  });
  body.appendChild(list);
  body.appendChild(el('p', { class: 'cnf-chart-note', text: 'Les raccourcis sont ignorés pendant la saisie (champs, dialogues ouverts).' }));
  box.appendChild(body);
  var foot = el('div', { class: 'cnf-dialog-foot' });
  foot.appendChild(el('button', { class: 'cnf-btn cnf-btn-primary', type: 'button', onclick: closeDialog, text: 'Compris' }));
  box.appendChild(foot);
  var w = $('#cnf-dialog-wrap');
  if (w) { w.hidden = false; document.documentElement.classList.add('cnf-lock'); }
}

/* ==========================================================================
 * 16. CONFIRM MAISON (0 confirm() natif)
 * ========================================================================== */
function confirmOpen() { var w = $('#cnf-confirm-wrap'); return !!w && !w.hidden; }
function askConfirm(title, msg, onYes) {
  var box = $('#cnf-confirm');
  if (!box) return;
  S.confirmCb = onYes || null;
  box.innerHTML = '';
  box.appendChild(el('div', { class: 'cnf-confirm-title', text: title }));
  box.appendChild(el('div', { class: 'cnf-confirm-msg', text: msg }));
  var foot = el('div', { class: 'cnf-confirm-foot' });
  foot.appendChild(el('button', { id: 'cnf-cf-no', class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: closeConfirm, text: 'Annuler' }));
  foot.appendChild(el('button', { id: 'cnf-cf-yes', class: 'cnf-btn cnf-btn-danger', type: 'button', onclick: function () { var cb = S.confirmCb; closeConfirm(); if (cb) cb(); }, text: 'Confirmer la suppression' }));
  box.appendChild(foot);
  var w = $('#cnf-confirm-wrap');
  if (w) { w.hidden = false; document.documentElement.classList.add('cnf-lock'); }
  var yes = $('#cnf-cf-yes'); if (yes) yes.focus();
}
function closeConfirm() {
  S.confirmCb = null;
  var w = $('#cnf-confirm-wrap');
  if (w) w.hidden = true;
  unlockIfFree();
}

/* ==========================================================================
 * 17. PANNEAU SEUILS (K) — persistés LS admina-conformite-seuils
 * ========================================================================== */
function panelOpen() { var w = $('#cnf-panel-wrap'); return !!w && !w.hidden; }
function openPanel() {
  renderPanel();
  var w = $('#cnf-panel-wrap');
  if (w) { w.hidden = false; document.documentElement.classList.add('cnf-lock'); }
}
function closePanel() {
  var w = $('#cnf-panel-wrap');
  if (w) w.hidden = true;
  unlockIfFree();
}
function renderPanel() {
  var box = $('#cnf-panel');
  if (!box) return;
  box.innerHTML = '';
  box.appendChild(el('div', { class: 'cnf-dialog-title', text: "Seuils d'alerte (K)" }));
  box.appendChild(el('div', { class: 'cnf-panel-sub', text: 'Réglages locaux persistés (LS ' + LS_SEUILS + ') — recalculent immédiatement le héro, les alertes, les KPI et les badges d\u2019échéance.' }));
  function row(key, labelTxt, mn, mx, step) {
    var w = el('div', { class: 'cnf-field' });
    w.appendChild(el('label', { class: 'cnf-field-label', 'for': 'cnf-r-' + key, text: labelTxt }));
    var input = el('input', { id: 'cnf-r-' + key, class: 'cnf-range', type: 'range', min: String(mn), max: String(mx), step: String(step), value: String(S.seuils[key]) });
    var vl = el('span', { class: 'cnf-range-val', id: 'cnf-r-val-' + key, text: S.seuils[key] + ' j' });
    input.addEventListener('input', function () {
      S.seuils[key] = +this.value;
      var v2 = $('#cnf-r-val-' + key); if (v2) v2.textContent = S.seuils[key] + ' j';
      saveSeuils();
      renderAll();
    });
    w.appendChild(input); w.appendChild(vl);
    return w;
  }
  box.appendChild(row('echeanceProche', 'Prévenance — échéance proche (30–180 j)', 30, 180, 5));
  box.appendChild(row('attenteJours', 'Relance — attente anormale (7–60 j)', 7, 60, 1));
  var foot = el('div', { class: 'cnf-panel-foot' });
  foot.appendChild(el('button', { id: 'cnf-p-reset', class: 'cnf-btn cnf-btn-ghost', type: 'button', onclick: function () { S.seuils = { echeanceProche: 90, attenteJours: 14 }; UI.seuils = S.seuils; saveSeuils(); renderAll(); renderPanel(); toast('Seuils réinitialisés (90 j / 14 j)', 'info'); }, text: 'Défauts (90 j / 14 j)' }));
  foot.appendChild(el('button', { id: 'cnf-p-close', class: 'cnf-btn cnf-btn-primary', type: 'button', onclick: closePanel, text: 'Fermer' }));
  box.appendChild(foot);
}

/* ==========================================================================
 * 18. EXPORT CSV (BOM « ; »), TOASTS, RACCOURCIS, PIED
 * ========================================================================== */
function exportCSV() {
  var rows = UI.filtered.slice();
  var lines = [FIELDS.join(';')].concat(rows.map(function (v) { return FIELDS.map(function (k) { return csvCell(v[k]); }).join(';'); }));
  var txt = '\uFEFF' + lines.join('\r\n');
  try {
    var blob = new Blob([txt], { type: 'text/csv;charset=utf-8;' });
    var a = el('a', { href: URL.createObjectURL(blob), download: 'conformite-' + ymd() + '.csv' });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  } catch (e) { toast('Export impossible dans ce contexte', 'bad'); return; }
  jlog('export-csv', rows.length + ' ligne(s) exportée(s)');
  toast(rows.length + ' ligne' + pl(rows.length) + ' exportée' + pl(rows.length) + ' (CSV BOM « ; »)', 'ok');
}
function toast(msg, kind) {
  var host = $('#cnf-toasts');
  if (!host) return;
  var t = el('div', { class: 'cnf-toast cnf-toast-' + (kind || 'info'), text: msg });
  host.appendChild(t);
  setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3200);
  while (host.children.length > 4) host.removeChild(host.firstChild);
}
function overlayAnyOpen() { return drawerOpen() || dialogOpen() || confirmOpen() || panelOpen(); }
function onKey(e) {
  if (!S.mounted) return;
  var t = e.target, tag = t && t.tagName ? t.tagName.toLowerCase() : '';
  var typing = (tag === 'input' && t.type !== 'checkbox' && t.type !== 'radio' && t.type !== 'button') || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable);
  if (e.key === 'Escape') {
    if (dialogOpen()) { closeDialog(); e.preventDefault(); return; }
    if (confirmOpen()) { closeConfirm(); e.preventDefault(); return; }
    if (panelOpen()) { closePanel(); e.preventDefault(); return; }
    if (drawerOpen()) { closeDrawer(); e.preventDefault(); return; }
    return;
  }
  if (typing || overlayAnyOpen()) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  var k = typeof e.key === 'string' ? e.key.toLowerCase() : '';
  if (e.key === '/') { e.preventDefault(); var s2 = $('#cnf-search'); if (s2) { s2.focus(); s2.select(); } return; }
  if (e.key === '?') { e.preventDefault(); openHelp(); return; }
  var map = {
    n: function () { openDialog(null); },
    e: exportCSV,
    j: function () { setView('table'); },
    p: function () { setView('employes'); },
    c: function () { setView('cards'); },
    s: function () { var s3 = $('#cnf-search'); if (s3) { s3.focus(); s3.select(); } },
    t: function () { resetFilters(true); },
    k: openPanel
  };
  if (map[k]) { e.preventDefault(); map[k](); }
}
function suppress() {
  S.suppressed = true;
  jlog('page-native', 'retour à la page native');
  unmount();
  var old = $('#cnf-return'); if (old) old.remove();
  var chip = el('button', { id: 'cnf-return', class: 'cnf-return', type: 'button', title: 'Ré-afficher le module conformité (LE DOSSIER PROPRE)', onclick: function () { S.suppressed = false; chip.remove(); tick350(); } }, 'Module conformité ↩');
  document.body.appendChild(chip);
  toast('Module masqué — page native visible. Utilisez la pastille en bas à droite pour revenir.', 'info');
}

/* ==========================================================================
 * 19. BOOT — détection 350 ms + popstate + storage, drapeau en fin d'init
 * ========================================================================== */
function boot() {
  try {
    tick350();
    window.setInterval(tick350, 350);
    window.addEventListener('popstate', tick350);
    window.addEventListener('storage', onStorage);
    document.addEventListener('keydown', onKey, true);
  } catch (e) { /* environnement Hostile : silencieux */ }
}
try { boot(); } catch (e) { /* silencieux */ }
window.__ADMINA_CNF_W4__ = true;
})();
