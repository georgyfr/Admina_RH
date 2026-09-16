/* ============================================================================
 * admina-contrats — W4-a — module additif pour /suivi-contrats (Admina-RH)
 * Version : 1.0-w4 · Préfixe : ctr- · Racine : html.admina-ctr + [data-ctr-page]
 *
 * PHILOSOPHIE DE LA PAGE :
 * « LE CYCLE DE VIE CONTRACTUEL — Le contrat n'est pas un PDF archivé : c'est
 * une promesse engagée dans le temps. Cette page garde la promesse vivante :
 * elle montre ce qui expire bientôt (prévenance avant le préavis), ce qui reste
 * en négociation (une promesse non signée est un risque), ce que l'engagement
 * coûte chaque mois (masse salariale contractuelle), et d'où vient chaque
 * contrat (traçabilité DR→CTR). Elle ne redécrit pas ce que les autres pages
 * savent déjà : le type de contrat renvoie aux règles (Types de Contrats), la
 * demande liée renvoie à l'origine (Demandes). Ici, on pilote les ÉCHÉANCES et
 * les TRANSITIONS de statut. »
 *
 * VUE SIGNATURE : « ÉCHÉANCIER DES ÉCHÉANCES » — 12 prochains mois, barres ∝
 * nombre de fins, urgence ≤30 j rouge / ≤90 j orange / >90 j neutre, tick
 * « aujourd'hui », clic barre → filtre table, panneau « À trancher ».
 *
 * Résilience : API window.__ADMINA_CTR_API__ (30×450 ms) → LS admina-contrats-data
 * → snapshot démo embarqué. Mutations UNIQUEMENT via API.setData / lecture
 * getData().contrats ; pont bidirectionnel subscribe + poller 1200 ms.
 *
 * CONVENTIONS W4 (héritées des leçons W2/W3) :
 * - Préfixe exclusif ctr- : classes CSS, data-act/data-key/data-id, clés LS admina-contrats-*.
 * - Racine html.admina-ctr + attribut data-ctr-page sur le conteneur module ; 0 autre global.
 * - Aucune mutation du DOM natif hors l'insertion SOUS le h5 ; la page native reste intacte.
 * - Toute écriture → API.setData({contrats}) (repli LS) puis journal {time, action, detail, role:'RH'}.
 * - Ré-lecture fraîche (readFresh) dans CHAQUE handler du drawer/dialog — anti stale-closure.
 * - Anti-collision : id = max(id)+1 ; numero = CTR-<année>-<max suffixe +1> (tous formats CTR-####-###).
 * - normStatut() mappe les variantes sans accent du natif ('Renouvele', 'Echu', 'Resilie',
 *   'En negociation') vers les libellés accentués canoniques.
 * - Seuils K persistés (admina-contrats-seuils) : preavis 30-120 (60), negociationJours 7-60 (14),
 *   echeanceProche 30-180 (90) — utilisés par héro, alertes, échéancier, panneau « À trancher ».
 * ==========================================================================*/
(function () {
  'use strict';
  if (window.__ADMINA_CTR_W4__) return;

  /* ============================== 1. CONSTANTES ============================== */
  const RX_PAGE = /\/suivi-contrats\/?$/;
  const LS_DATA = 'admina-contrats-data';
  const LS_SEUILS = 'admina-contrats-seuils';
  const LS_JOURNAL = 'admina_journal';
  const LS_DARK = 'admina-dark';
  const TICK_MS = 350;
  const POLL_MS = 1200;
  const API_TRIES = 30;
  const API_MS = 450;
  const VERSION = '1.0-w4';

  const STATUTS = ['En cours', 'En négociation', 'Renouvelé', 'Échu', 'Résilié'];
  const TYPES = ['CDI', 'CDD', 'Stage', 'Interim', 'Alternance', 'Freelance'];
  const STAT_COLORS = {
    'En cours': '#2e7d32',
    'En négociation': '#ed6c02',
    'Renouvelé': '#0288d1',
    'Échu': '#c62828',
    'Résilié': '#616161'
  };
  const SEUIL_DEF = { preavis: 60, negociationJours: 14, echeanceProche: 90 };
  const SEUIL_RANGES = { preavis: [30, 120], negociationJours: [7, 60], echeanceProche: [30, 180] };
  const SEUIL_HINT = {
    preavis: 'Fenêtre de prévenance avant la fin (30 à 120 jours)',
    negociationJours: 'Durée maximale tolérée d\u2019une négociation (7 à 60 jours)',
    echeanceProche: 'Horizon « échéance proche » des alertes (30 à 180 jours)'
  };

  const STATUT_MAP = (function () {
    const m = {};
    STATUTS.forEach(function (s) { m[s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()] = s; });
    return m;
  })();

  const COLS = [
    { k: 'numero', label: 'N° contrat' },
    { k: 'employe', label: 'Employé' },
    { k: 'poste', label: 'Poste' },
    { k: 'departement', label: 'Département' },
    { k: 'typeContrat', label: 'Type' },
    { k: 'dateDebut', label: 'Début', t: 'date' },
    { k: 'dateFin', label: 'Fin', t: 'date' },
    { k: '_jours', label: 'Échéance', t: 'num' },
    { k: 'salaireBrut', label: 'Salaire (FCFA)', t: 'num' },
    { k: 'statut', label: 'Statut' },
    { k: 'demandeLiee', label: 'DR liée' }
  ];

  /* Snapshot démo embarqué — secours si API et LS indisponibles (6 contrats). */
  const SNAPSHOT = [
    { id: 1, numero: 'CTR-2025-001', employe: 'Ndiaye Moussa', poste: 'Chef Cuisinier', departement: 'Restauration', typeContrat: 'CDI', dateDebut: '01/04/2025', dateFin: '31/03/2030', salaireBrut: 350000, statut: 'En cours', demandeLiee: 'DR-2025-001', notes: 'Embauche confirmée' },
    { id: 2, numero: 'CTR-2025-002', employe: 'Tchouankou Claire', poste: 'Comptable Senior', departement: 'Finance & Comptabilite', typeContrat: 'CDI', dateDebut: '15/04/2025', dateFin: '14/04/2030', salaireBrut: 400000, statut: 'En négociation', demandeLiee: 'DR-2025-003', notes: 'En attente de signature' },
    { id: 3, numero: 'CTR-2025-003', employe: 'Mebara Nadège', poste: 'Agent Accueil', departement: 'Service Client', typeContrat: 'CDD', dateDebut: '01/03/2025', dateFin: '31/08/2025', salaireBrut: 150000, statut: 'En cours', demandeLiee: 'DR-2025-004', notes: '' },
    { id: 4, numero: 'CTR-2024-015', employe: 'Mme. Fotso Marie', poste: 'Chef de Département Hébergement', departement: 'Hébergement', typeContrat: 'CDI', dateDebut: '01/01/2020', dateFin: '31/12/2025', salaireBrut: 500000, statut: 'Renouvelé', demandeLiee: '', notes: 'Contrat renouvelé pour 5 ans' },
    { id: 5, numero: 'CTR-2024-018', employe: 'M. Nkoulou Paul', poste: 'DRH', departement: 'Ressources Humaines', typeContrat: 'CDI', dateDebut: '01/09/2019', dateFin: '31/08/2029', salaireBrut: 550000, statut: 'En cours', demandeLiee: '', notes: '' },
    { id: 6, numero: 'CTR-2025-004', employe: 'Nganou André', poste: 'Agent de Sécurité', departement: 'Sécurité', typeContrat: 'CDD', dateDebut: '01/04/2025', dateFin: '30/06/2025', salaireBrut: 120000, statut: 'En négociation', demandeLiee: 'DR-2025-005', notes: '' }
  ];

  /* ============================== 2. ÉTAT MODULE ============================= */
  const S = {
    active: false,
    src: 'demo',
    contrats: [],
    hash: '',
    view: 'ech',
    q: '',
    fStatut: '',
    fType: '',
    fDept: '',
    month: null,
    quick: null,
    sortKey: 'dateFin',
    sortDir: 'asc',
    page: 0,
    size: 10,
    bulkStatut: '',
    echOffset: 0,
    sel: new Set(),
    drawerId: null,
    editId: null,
    dlgEl: null,
    seuils: Object.assign({}, SEUIL_DEF),
    tickN: 0
  };
  let root = null;

  /* ============================== 3. UTILITAIRES ============================= */
  function fold(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function trunc(s, n) {
    s = String(s == null ? '' : s);
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; }
    return String(h);
  }
  function dataHash(list) { return hashStr(JSON.stringify(list)); }

  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'value') n.value = v;
        else if (k === 'checked') n.checked = !!v;
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    appendKids(n, kids);
    return n;
  }
  function appendKids(n, kids) {
    (Array.isArray(kids) ? kids : [kids]).forEach(function flat(k) {
      if (k === null || k === undefined || k === false) return;
      if (Array.isArray(k)) { k.forEach(flat); return; }
      n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    });
  }
  function svgEl(tag, attrs, kids) {
    const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'text') n.textContent = v;
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v);
      });
    }
    appendKids(n, kids);
    return n;
  }
  function debounce(fn, ms) {
    let t = null;
    return function () {
      const args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  /* Dates jj/mm/aaaa — validation calendaire réelle. */
  function parseFr(s) {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s == null ? '' : s).trim());
    if (!m) return null;
    const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
    const dt = new Date(y, mo - 1, d);
    if (dt.getDate() !== d || dt.getMonth() !== mo - 1 || dt.getFullYear() !== y) return null;
    return dt;
  }
  function validFrDate(s) { return parseFr(s) !== null; }
  function today0() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function dLeftFromDate(dt) { return Math.round((dt - today0()) / 864e5); }
  function dLeft(c) { const d = parseFr(c.dateFin); return d ? dLeftFromDate(d) : null; }
  function monthKeyOf(s) { const d = parseFr(s); return d ? pad2(d.getMonth() + 1) + '/' + d.getFullYear() : null; }
  function monthKeyFromDate(d) { return pad2(d.getMonth() + 1) + '/' + d.getFullYear(); }

  function fmtFCFA(n) {
    n = Math.round(Number(n) || 0);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0FCFA';
  }
  function fmtK(n) {
    const k = Math.round((Number(n) || 0) / 1000);
    return String(k).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ' k FCFA';
  }
  function fmtKs(n) {
    const k = Math.round((Number(n) || 0) / 1000);
    return String(k).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ' k';
  }
  function fmtJournalTime(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function normStatut(s) {
    if (!s) return 'En cours';
    const k = fold(s).trim();
    if (STATUT_MAP[k]) return STATUT_MAP[k];
    const hit = STATUTS.find(function (x) { return fold(x) === k; });
    return hit || String(s).trim();
  }
  function stClass(st) {
    switch (st) {
      case 'En cours': return 'ok';
      case 'En négociation': return 'neg';
      case 'Renouvelé': return 'ren';
      case 'Échu': return 'ech';
      case 'Résilié': return 'res';
      default: return 'neu';
    }
  }
  function dClass(d) {
    if (d === null || d === undefined) return 'neu';
    if (d < 0) return 'red';
    if (d <= 30) return 'red';
    if (d <= 90) return 'amb';
    return 'neu';
  }
  function dLabel(d) {
    if (d === null || d === undefined) return '—';
    if (d < 0) return 'échue ' + (-d) + ' j';
    if (d === 0) return 'aujourd\u2019hui';
    return 'dans ' + d + ' j';
  }

  /* ============================== 4. JOURNAL ================================= */
  function readJournal() {
    try {
      const raw = localStorage.getItem(LS_JOURNAL);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function pushJournal(action, detail) {
    try {
      const arr = readJournal();
      arr.push({ time: new Date().toISOString(), action: String(action), detail: String(detail || ''), role: 'RH' });
      if (arr.length > 500) arr.splice(0, arr.length - 500);
      try { localStorage.setItem(LS_JOURNAL, JSON.stringify(arr)); } catch (e) { /* quota */ }
    } catch (e) { /* LS indisponible */ }
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.log === 'function') {
        window.__ADMINA_AUDIT__.log({ action: action, detail: detail, role: 'RH' });
      }
    } catch (e) { /* audit absent */ }
  }

  /* ============================== 5. SEUILS (K) ============================== */
  function clampSeuil(k, v) {
    const r = SEUIL_RANGES[k] || [0, 99999];
    v = Math.round(Number(v));
    if (!isFinite(v)) return SEUIL_DEF[k];
    return Math.min(r[1], Math.max(r[0], v));
  }
  function loadSeuils() {
    try {
      const raw = localStorage.getItem(LS_SEUILS);
      if (raw) {
        const o = JSON.parse(raw);
        ['preavis', 'negociationJours', 'echeanceProche'].forEach(function (k) {
          if (o && o[k] !== undefined) S.seuils[k] = clampSeuil(k, o[k]);
        });
      }
    } catch (e) { S.seuils = Object.assign({}, SEUIL_DEF); }
  }
  function saveSeuils(next) {
    S.seuils = {
      preavis: clampSeuil('preavis', next.preavis),
      negociationJours: clampSeuil('negociationJours', next.negociationJours),
      echeanceProche: clampSeuil('echeanceProche', next.echeanceProche)
    };
    try { localStorage.setItem(LS_SEUILS, JSON.stringify(S.seuils)); } catch (e) { /* quota */ }
    pushJournal('seuils', 'preavis=' + S.seuils.preavis + 'j, negociation=' + S.seuils.negociationJours + 'j, echeance=' + S.seuils.echeanceProche + 'j');
    renderStatic(); renderView();
  }

  /* ============================== 6. DONNÉES / API =========================== */
  function api() { return window.__ADMINA_CTR_API__ || null; }

  function normalizeList(arr) {
    const out = [];
    let maxId = 0;
    (Array.isArray(arr) ? arr : []).forEach(function (c) {
      if (!c || typeof c !== 'object') return;
      const o = {};
      o.id = Number(c.id); if (!isFinite(o.id)) o.id = 0;
      if (o.id > maxId) maxId = o.id;
      o.numero = String(c.numero || '').trim();
      o.employe = String(c.employe || '').trim();
      o.poste = String(c.poste || '').trim();
      o.departement = String(c.departement || '').trim();
      const t = String(c.typeContrat || '').trim();
      const tHit = TYPES.find(function (x) { return fold(x) === fold(t); });
      o.typeContrat = tHit || (t || 'CDI');
      o.dateDebut = String(c.dateDebut || '').trim();
      o.dateFin = String(c.dateFin || '').trim();
      o.salaireBrut = Number(c.salaireBrut); if (!isFinite(o.salaireBrut)) o.salaireBrut = 0;
      o.statut = normStatut(c.statut);
      o.demandeLiee = String(c.demandeLiee || '').trim();
      o.notes = String(c.notes || '');
      out.push(o);
    });
    out.forEach(function (o) { if (!o.id) { maxId += 1; o.id = maxId; } });
    return out;
  }

  function readLS() {
    try {
      const raw = localStorage.getItem(LS_DATA);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && Array.isArray(d.contrats)) return normalizeList(d.contrats);
      }
    } catch (e) { /* LS corrompu */ }
    return null;
  }

  function readFresh() {
    const a = api();
    if (a && typeof a.getData === 'function') {
      try {
        const d = a.getData();
        if (d && Array.isArray(d.contrats)) return normalizeList(d.contrats);
      } catch (e) { /* API en erreur → repli LS */ }
    }
    return readLS();
  }

  function writeContrats(list, action, detail) {
    list = normalizeList(list);
    const a = api();
    if (a && typeof a.setData === 'function') {
      try {
        a.setData({ contrats: list.map(function (c) { return Object.assign({}, c); }) });
      } catch (e) {
        try { localStorage.setItem(LS_DATA, JSON.stringify({ contrats: list })); } catch (e2) { /* quota */ }
      }
    } else {
      try { localStorage.setItem(LS_DATA, JSON.stringify({ contrats: list })); } catch (e) { /* quota */ }
    }
    if (action) pushJournal(action, detail);
    S.contrats = list;
    S.src = a ? 'api' : 'ls';
    S.hash = dataHash(list);
    renderStatic(); renderView();
    if (S.drawerId !== null) refreshDrawer();
  }

  function nextNumero(list) {
    const L = list || readFresh() || S.contrats;
    let max = 0;
    L.forEach(function (c) {
      const m = /^CTR-\d{4}-(\d+)$/.exec(c.numero || '');
      if (m) { const v = Number(m[1]); if (v > max) max = v; }
    });
    return 'CTR-' + new Date().getFullYear() + '-' + String(max + 1).padStart(3, '0');
  }
  function nextId(list) {
    return (list || []).reduce(function (m, x) { return Math.max(m, Number(x.id) || 0); }, 0) + 1;
  }

  /* Amorçage : API immédiate sinon repli LS/snapshot puis attente 30×450 ms. */
  function apiBoot() {
    const a = api();
    if (a && typeof a.getData === 'function') {
      S.src = 'api';
      onExternal('boot');
      hookSubscribe(a);
      return;
    }
    const l = readLS();
    if (l) { S.contrats = l; S.hash = dataHash(l); S.src = 'ls'; }
    else {
      S.contrats = normalizeList(SNAPSHOT);
      S.hash = dataHash(S.contrats);
      S.src = 'demo';
      try { localStorage.setItem(LS_DATA, JSON.stringify({ contrats: S.contrats })); } catch (e) { /* quota */ }
    }
    let tries = 0;
    const iv = setInterval(function () {
      tries += 1;
      const b = api();
      if (b && typeof b.getData === 'function') {
        clearInterval(iv);
        S.src = 'api';
        onExternal('api-ready');
        hookSubscribe(b);
      } else if (tries >= API_TRIES) {
        clearInterval(iv);
      }
    }, API_MS);
  }
  function hookSubscribe(a) {
    try {
      if (a && typeof a.subscribe === 'function') {
        a.subscribe(function () { onExternal('subscribe'); });
      }
    } catch (e) { /* subscribe indisponible */ }
  }

  /* Pont bidirectionnel : re-lecture fraîche, anti stale-closure. */
  function onExternal(why) {
    const a = api();
    let list = null;
    if (a && typeof a.getData === 'function') {
      try {
        const d = a.getData();
        if (d && Array.isArray(d.contrats)) list = normalizeList(d.contrats);
      } catch (e) { /* lecture API en erreur */ }
    }
    if (!list) list = readLS();
    if (!list) return;
    const h = dataHash(list);
    if (h === S.hash) return;
    S.contrats = list;
    S.hash = h;
    if (a) S.src = 'api';
    if (S.active) { renderStatic(); renderView(); if (S.drawerId !== null) refreshDrawer(); }
  }

  /* ============================== 7. CALCULS MÉTIER ========================== */
  function negDays(c) {
    if (c.statut !== 'En négociation') return 0;
    const d = parseFr(c.dateDebut);
    if (!d) return 0;
    const n = dLeftFromDate(d) * -1;
    return n > 0 ? n : 0;
  }
  function heroStats() {
    const L = S.contrats;
    const encours = L.filter(function (c) { return c.statut === 'En cours'; }).length;
    const masse = L.reduce(function (a, c) { return a + (Number(c.salaireBrut) || 0); }, 0);
    const ech = L.filter(function (c) {
      const d = dLeft(c);
      return d !== null && d >= 0 && d <= S.seuils.echeanceProche;
    }).length;
    let next = null;
    L.forEach(function (c) {
      const d = dLeft(c);
      if (d !== null && d >= 0 && (next === null || d < next.d)) next = { c: c, d: d };
    });
    return { n: L.length, encours: encours, masse: masse, ech: ech, next: next };
  }
  function computeAlerts() {
    const L = S.contrats, su = S.seuils, out = [];
    const a1 = L.filter(function (c) {
      const d = dLeft(c);
      return d !== null && d <= su.preavis && c.statut !== 'Renouvelé' && c.statut !== 'Résilié';
    });
    out.push({ key: 'echeance', label: 'Échéance ≤ ' + su.preavis + ' j sans Renouvelé', hint: 'Prévenance avant le préavis', count: a1.length, tone: 'red' });
    const a2 = L.filter(function (c) { return negDays(c) > su.negociationJours; });
    out.push({ key: 'neg', label: 'En négociation depuis > ' + su.negociationJours + ' j', hint: 'Une promesse non signée est un risque', count: a2.length, tone: 'amb' });
    const cur = monthKeyFromDate(today0());
    const a3 = L.filter(function (c) { return c.typeContrat === 'CDD' && monthKeyOf(c.dateFin) === cur; });
    out.push({ key: 'cddmois', label: 'CDD finissant ce mois', hint: 'Fin de promesse à durée déterminée', count: a3.length, tone: 'blu' });
    const a4 = L.filter(function (c) { return !c.demandeLiee; });
    out.push({ key: 'sansdr', label: 'Sans demande liée (DR)', hint: 'Traçabilité DR→CTR rompue', count: a4.length, tone: 'vio' });
    const a5 = L.filter(function (c) {
      const d = dLeft(c);
      return (c.statut === 'Échu' || c.statut === 'Résilié') && d !== null && d >= -su.echeanceProche;
    });
    out.push({ key: 'echus', label: 'Échu / Résilié récent', hint: 'À solder ou archiver', count: a5.length, tone: 'gry' });
    return out;
  }
  function matchQuick(c, key) {
    const su = S.seuils;
    switch (key) {
      case 'echeance': {
        const d = dLeft(c);
        return d !== null && d <= su.preavis && c.statut !== 'Renouvelé' && c.statut !== 'Résilié';
      }
      case 'neg': return negDays(c) > su.negociationJours;
      case 'cddmois': return c.typeContrat === 'CDD' && monthKeyOf(c.dateFin) === monthKeyFromDate(today0());
      case 'sansdr': return !c.demandeLiee;
      case 'echus': {
        const d = dLeft(c);
        return (c.statut === 'Échu' || c.statut === 'Résilié') && d !== null && d >= -su.echeanceProche;
      }
      case 'j90': {
        const d = dLeft(c);
        return d !== null && d >= 0 && d <= su.echeanceProche;
      }
      default: return true;
    }
  }
  function quickLabel(key) {
    if (key === 'j90') return 'Échéances ≤ ' + S.seuils.echeanceProche + ' j';
    const a = computeAlerts().find(function (x) { return x.key === key; });
    return a ? a.label : key;
  }
  function computeFiltered() {
    const q = fold(S.q).trim();
    return S.contrats.filter(function (c) {
      if (q) {
        const hay = fold([c.numero, c.employe, c.poste, c.departement, c.notes, c.demandeLiee].join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      if (S.fStatut && c.statut !== S.fStatut) return false;
      if (S.fType && c.typeContrat !== S.fType) return false;
      if (S.fDept && c.departement !== S.fDept) return false;
      if (S.month && monthKeyOf(c.dateFin) !== S.month) return false;
      if (S.quick && !matchQuick(c, S.quick)) return false;
      return true;
    });
  }
  function sortVal(c, col) {
    if (col.k === '_jours') { const d = dLeft(c); return d === null ? null : d; }
    if (col.t === 'date') { const d = parseFr(c[col.k]); return d ? d.getTime() : null; }
    return c[col.k];
  }
  function sortRows(rows) {
    const col = COLS.find(function (x) { return x.k === S.sortKey; }) || COLS[0];
    const dir = S.sortDir === 'desc' ? -1 : 1;
    rows.sort(function (a, b) {
      const va = sortVal(a, col), vb = sortVal(b, col);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      if (col.t === 'num' || col.t === 'date') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'fr', { sensitivity: 'base' }) * dir;
    });
  }

  /* ============================== 8. DÉTECTION DE PAGE ======================= */
  function isPage() { return RX_PAGE.test(location.pathname); }
  function tick() {
    const on = isPage();
    if (on) {
      if (!S.active) activate();
      else if (!root || !root.isConnected) {
        mount();
        /* Montage tardif (titre natif rendu après activation) : rattraper le rendu initial. */
        if (root && root.isConnected) { renderStatic(); renderView(); }
      }
      S.tickN = (S.tickN || 0) + 1;
      if (S.tickN % 4 === 0) applyDark();
    } else if (S.active) {
      deactivate();
    }
  }
  function activate() {
    S.active = true;
    document.documentElement.classList.add('admina-ctr');
    applyDark();
    if (!root || !root.isConnected) mount();
    if (root && root.isConnected) { renderStatic(); renderView(); }
  }
  function deactivate() {
    S.active = false;
    document.documentElement.classList.remove('admina-ctr');
    document.documentElement.classList.remove('admina-ctr-dark');
    document.body.classList.remove('ctr-nav-open');
    removeRestore();
    document.querySelectorAll('.ctr-host').forEach(function (n) { n.classList.remove('ctr-host'); });
    if (root) { root.remove(); root = null; }
  }

  /* ============================== 9. MONTAGE DOM ============================= */
  const SKELETON =
    '<div class="ctr-topbar">' +
      '<div class="ctr-brand"><span class="ctr-logo" aria-hidden="true">⧗</span><div><strong>Le cycle de vie contractuel</strong><small>Échéances &amp; transitions — la promesse, pas le PDF</small></div></div>' +
      '<div class="ctr-views-btns" role="tablist" aria-label="Vues">' +
        '<button type="button" class="ctr-vbtn" data-act="view" data-view="ech">Échéancier</button>' +
        '<button type="button" class="ctr-vbtn" data-act="view" data-view="tbl">Table</button>' +
        '<button type="button" class="ctr-vbtn" data-act="view" data-view="cards">Cartes</button>' +
      '</div>' +
      '<div class="ctr-actions">' +
        '<button type="button" class="ctr-icb" data-act="export" title="Exporter en CSV (E)" aria-label="Exporter en CSV">CSV</button>' +
        '<button type="button" class="ctr-icb" data-act="seuils" title="Seuils d\u2019alerte (K)" aria-label="Seuils d\u2019alerte">Seuils</button>' +
        '<button type="button" class="ctr-icb" data-act="help" title="Aide &amp; raccourcis (?)" aria-label="Aide et raccourcis">?</button>' +
        '<button type="button" class="ctr-burger" data-act="burger" aria-label="Menu">☰</button>' +
      '</div>' +
    '</div>' +
    '<section class="ctr-hero" aria-live="polite"></section>' +
    '<section class="ctr-alerts" aria-label="Alertes du cycle de vie"></section>' +
    '<section class="ctr-kpis" aria-label="Indicateurs clés"></section>' +
    '<section class="ctr-charts" aria-label="Graphiques"></section>' +
    '<div class="ctr-toolbar">' +
      '<div class="ctr-search"><input type="search" class="ctr-in ctr-q" placeholder="Rechercher : numero, employé, poste, département, notes…" aria-label="Recherche multi-champs"></div>' +
      '<select class="ctr-in ctr-fstatut" aria-label="Filtrer par statut"></select>' +
      '<select class="ctr-in ctr-ftype" aria-label="Filtrer par type de contrat"></select>' +
      '<select class="ctr-in ctr-fdept" aria-label="Filtrer par département"></select>' +
      '<button type="button" class="ctr-btn" data-act="reset">Réinitialiser</button>' +
      '<button type="button" class="ctr-btn ctr-btn-new" data-act="new">+ Nouveau contrat</button>' +
      '<div class="ctr-chips"></div>' +
      '<div class="ctr-selbar" hidden></div>' +
    '</div>' +
    '<div class="ctr-view"></div>' +
    '<footer class="ctr-foot">' +
      '<span>W4-a · admina-contrats v' + VERSION + ' — module additif : la page native reste maître des données (API setData · LS ' + LS_DATA + ').</span>' +
      '<button type="button" class="ctr-btn" data-act="native">Voir la page native</button>' +
    '</footer>' +
    '<div class="ctr-ovl" data-act="ovl-close" aria-hidden="true"></div>' +
    '<aside class="ctr-drawer" aria-label="Fiche contrat"></aside>' +
    '<div class="ctr-toasts" aria-live="polite"></div>';

  function findTitleHost() {
    const hs = document.querySelectorAll('h5, [class*="MuiTypography-h5"]');
    for (let i = 0; i < hs.length; i++) {
      if (/suivi des contrats/i.test(hs[i].textContent || '')) return hs[i];
    }
    return null; /* le tick retentera : jamais de fallback body (leçon W4 — drawer natif) */
  }
  /* Neutralise le décalage drawer (margin-left) sur les ancêtres natifs — leçon W3/W4. */
  function fixHostGap() {
    if (!root) return;
    const stop = document.getElementById('root');
    let hop = root.parentElement;
    while (hop && hop !== document.body && hop !== stop) {
      if (parseFloat(getComputedStyle(hop).marginLeft || '0') > 80) hop.classList.add('ctr-host');
      hop = hop.parentElement;
    }
  }
  function mount() {
    if (root && root.isConnected) return;
    const host = findTitleHost();
    if (!host) return; /* le titre natif n'est pas encore rendu (React lazy) : le tick relancera */
    root = el('div', { 'class': 'ctr-root' });
    root.setAttribute('data-ctr-page', '');
    root.innerHTML = SKELETON;
    host.insertAdjacentElement('afterend', root);
    fixHostGap();
    wireToolbar();
    wireDelegation();
  }
  function wireToolbar() {
    const q = root.querySelector('.ctr-q');
    q.value = S.q || '';
    q.addEventListener('input', debounce(function () {
      S.q = q.value; S.page = 0; renderView();
    }, 160));
    const st = root.querySelector('.ctr-fstatut');
    st.appendChild(new Option('Tous les statuts', ''));
    STATUTS.forEach(function (s) { st.appendChild(new Option(s, s)); });
    st.value = S.fStatut || '';
    st.addEventListener('change', function () { S.fStatut = st.value; S.page = 0; renderView(); });
    const ty = root.querySelector('.ctr-ftype');
    ty.appendChild(new Option('Tous les types', ''));
    TYPES.forEach(function (t) { ty.appendChild(new Option(t, t)); });
    ty.value = S.fType || '';
    ty.addEventListener('change', function () { S.fType = ty.value; S.page = 0; renderView(); });
    const dp = root.querySelector('.ctr-fdept');
    dp.addEventListener('change', function () { S.fDept = dp.value; S.page = 0; renderView(); });
    syncSelects();
  }
  function syncSelects() {
    if (!root) return;
    const depts = {};
    S.contrats.forEach(function (c) { if (c.departement) depts[c.departement] = 1; });
    const sel = root.querySelector('.ctr-fdept');
    const cur = S.fDept || '';
    sel.innerHTML = '';
    sel.appendChild(new Option('Tous les départements', ''));
    Object.keys(depts).sort(function (a, b) { return a.localeCompare(b, 'fr'); })
      .forEach(function (d) { sel.appendChild(new Option(d, d)); });
    sel.value = cur;
    if (sel.value !== cur) { sel.value = ''; S.fDept = ''; }
    root.querySelector('.ctr-fstatut').value = S.fStatut || '';
    root.querySelector('.ctr-ftype').value = S.fType || '';
    const q = root.querySelector('.ctr-q');
    if (document.activeElement !== q) q.value = S.q || '';
  }
  function wireDelegation() {
    root.addEventListener('click', onClick);
    root.addEventListener('change', function (e) {
      const t = e.target;
      if (t && t.classList && t.classList.contains('ctr-pgsz')) {
        S.size = Number(t.value) || 10;
        S.page = 0;
        renderView();
      }
    });
  }

  /* ============================== 10. RENDU STATIQUE ========================= */
  function renderStatic() {
    if (!root || !root.isConnected) return;
    const hz = root.querySelector('.ctr-hero');
    hz.innerHTML = '';
    hz.appendChild(buildHero());
    const al = root.querySelector('.ctr-alerts');
    al.innerHTML = '';
    computeAlerts().forEach(function (a) {
      al.appendChild(el('button', {
        'class': 'ctr-al tone-' + a.tone + (S.quick === a.key ? ' ctr-on' : ''),
        'data-act': 'alert', 'data-key': a.key, 'type': 'button',
        'aria-pressed': S.quick === a.key ? 'true' : 'false',
        'aria-label': a.label + ' — ' + a.count + ' contrat(s)'
      }, [
        el('strong', { 'class': 'ctr-al-n', text: String(a.count) }),
        el('span', { 'class': 'ctr-al-t' }, [el('b', { text: a.label }), el('small', { text: a.hint })])
      ]));
    });
    const kp = root.querySelector('.ctr-kpis');
    kp.innerHTML = '';
    kpis().forEach(function (k) {
      const cls = 'ctr-kpi tone-' + (k.tone || 'neu') + (k.act ? ' ctr-click' : '');
      let node;
      if (k.act === 'reset') node = el('button', { 'class': cls, 'data-act': 'reset', 'type': 'button', 'aria-label': 'Réinitialiser les filtres' });
      else if (k.act === 'kpi') node = el('button', { 'class': cls, 'data-act': 'kpi', 'data-key': k.key, 'type': 'button', 'aria-label': 'Filtrer : ' + k.label });
      else node = el('div', { 'class': cls });
      node.appendChild(el('span', { 'class': 'ctr-kval', text: k.val }));
      node.appendChild(el('span', { 'class': 'ctr-klab', text: k.label }));
      kp.appendChild(node);
    });
    const ch = root.querySelector('.ctr-charts');
    ch.innerHTML = '';
    ch.appendChild(chartCard('Statuts — la promesse par état', buildDonut(), buildDonutLegend(), 'Cliquer une part ou une légende → filtre la table.'));
    ch.appendChild(chartCard('Masse contractuelle par département', buildDept(), null, 'FCFA / mois — cliquer un département → filtre.'));
    ch.appendChild(chartCard('Fins par mois à venir', buildMonths(), null, '12 prochains mois — cliquer un mois → filtre la table.'));
    syncSelects();
  }
  function chartCard(title, svg, extra, hint) {
    const card = el('div', { 'class': 'ctr-chartcard' }, [
      el('h4', { 'class': 'ctr-chart-h', text: title }),
      svg
    ]);
    if (extra) card.appendChild(extra);
    card.appendChild(el('p', { 'class': 'ctr-chart-hint', text: hint }));
    return card;
  }
  function kpis() {
    const h = heroStats(), L = S.contrats;
    return [
      { key: 'total', label: 'Total contrats', val: String(h.n), act: 'reset', tone: 'neu' },
      { key: 'encours', label: 'En cours', val: String(L.filter(function (c) { return c.statut === 'En cours'; }).length), act: 'kpi', tone: 'grn' },
      { key: 'masse', label: 'Masse salariale', val: fmtK(h.masse) + '/mois', act: null, tone: 'neu' },
      { key: 'ech', label: 'Échéances ≤ ' + S.seuils.echeanceProche + ' j', val: String(h.ech), act: 'kpi', tone: 'amb' },
      { key: 'neg', label: 'En négociation', val: String(L.filter(function (c) { return c.statut === 'En négociation'; }).length), act: 'kpi', tone: 'org' },
      { key: 'echus', label: 'Échus', val: String(L.filter(function (c) { return c.statut === 'Échu'; }).length), act: 'kpi', tone: 'red' }
    ];
  }
  function buildHero() {
    const h = heroStats();
    const frag = document.createDocumentFragment();
    frag.appendChild(el('p', { 'class': 'ctr-hero-l1', text:
      h.n + ' contrat' + (h.n > 1 ? 's' : '') + ' · ' + h.encours + ' en cours · masse ' +
      fmtFCFA(h.masse) + '/mois · ' + h.ech + ' échéance' + (h.ech > 1 ? 's' : '') + ' ≤ ' + S.seuils.echeanceProche + ' j'
    }));
    let sub;
    if (h.next) {
      const d = h.next.d;
      sub = 'Prochaine échéance : ' + h.next.c.numero + ' — ' + h.next.c.employe + ' — ' + h.next.c.dateFin +
        ' (' + (d === 0 ? 'aujourd\u2019hui' : 'dans ' + d + ' j') + ') · statut ' + h.next.c.statut;
    } else {
      sub = 'Aucune échéance à venir dans les données actuelles.';
    }
    frag.appendChild(el('p', { 'class': 'ctr-hero-l2', text: sub }));
    frag.appendChild(el('p', { 'class': 'ctr-hero-l3', text:
      'Le contrat n\u2019est pas un PDF archivé : c\u2019est une promesse engagée dans le temps — prévenance avant le préavis, négociation tranchée, traçabilité DR→CTR.'
    }));
    return frag;
  }

  /* ============================== 11. GRAPHIQUES SVG ========================= */
  function buildDonut() {
    const counts = STATUTS.map(function (s) {
      return { s: s, n: S.contrats.filter(function (c) { return c.statut === s; }).length };
    }).filter(function (x) { return x.n > 0; });
    const total = counts.reduce(function (a, x) { return a + x.n; }, 0) || 1;
    const R = 40, CX = 60, CY = 60, CIRC = 2 * Math.PI * R;
    const svg = svgEl('svg', { viewBox: '0 0 120 120', 'class': 'ctr-donut', role: 'img', 'aria-label': 'Répartition des contrats par statut' });
    let acc = 0;
    counts.forEach(function (x) {
      const len = x.n / total * CIRC;
      const c = svgEl('circle', {
        cx: CX, cy: CY, r: R, fill: 'none',
        stroke: STAT_COLORS[x.s], 'stroke-width': '18',
        'stroke-dasharray': len.toFixed(2) + ' ' + CIRC.toFixed(2),
        'stroke-dashoffset': (-acc).toFixed(2),
        transform: 'rotate(-90 ' + CX + ' ' + CY + ')',
        'class': 'ctr-slice', 'data-act': 'chart-statut', 'data-val': x.s
      });
      const ti = svgEl('title');
      ti.textContent = x.s + ' — ' + x.n + ' contrat(s) — cliquer pour filtrer';
      c.appendChild(ti);
      svg.appendChild(c);
      acc += len;
    });
    const tt = svgEl('text', { x: CX, y: CY + 5, 'text-anchor': 'middle', 'class': 'ctr-donut-tot' });
    tt.textContent = String(total);
    svg.appendChild(tt);
    return svg;
  }
  function buildDonutLegend() {
    const box = el('div', { 'class': 'ctr-donut-legend' });
    STATUTS.forEach(function (s) {
      const n = S.contrats.filter(function (c) { return c.statut === s; }).length;
      box.appendChild(el('button', {
        'class': 'ctr-legbtn' + (S.fStatut === s ? ' ctr-on' : ''),
        'data-act': 'chart-statut', 'data-val': s, 'type': 'button',
        'aria-label': 'Filtrer statut ' + s
      }, [
        el('i', { 'class': 'ctr-legdot', style: 'background:' + STAT_COLORS[s] }),
        el('span', { text: s + ' (' + n + ')' })
      ]));
    });
    return box;
  }
  function buildDept() {
    const agg = {};
    S.contrats.forEach(function (c) {
      const k = c.departement || '—';
      agg[k] = (agg[k] || 0) + (Number(c.salaireBrut) || 0);
    });
    const rows = Object.keys(agg).map(function (k) { return { k: k, v: agg[k] }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    const max = Math.max(1, ...rows.map(function (r) { return r.v; }));
    const H = rows.length * 26 + 10;
    const svg = svgEl('svg', { viewBox: '0 0 344 ' + H, 'class': 'ctr-svgbars', role: 'img', 'aria-label': 'Masse salariale contractuelle par département' });
    rows.forEach(function (r, i) {
      const y = i * 26 + 5;
      const g = svgEl('g', { 'class': 'ctr-bar-g', 'data-act': 'chart-dept', 'data-val': r.k });
      const t1 = svgEl('text', { x: 0, y: y + 13, 'class': 'ctr-svg-lab' });
      t1.textContent = trunc(r.k, 16);
      const rect = svgEl('rect', { x: 112, y: y, width: Math.max(2, Math.round(160 * r.v / max)), height: 16, rx: 3, 'class': 'ctr-svg-bar' });
      const t2 = svgEl('text', { x: 280, y: y + 13, 'class': 'ctr-svg-val' });
      t2.textContent = fmtKs(r.v);
      const ti = svgEl('title');
      ti.textContent = r.k + ' — ' + fmtFCFA(r.v) + '/mois — cliquer pour filtrer';
      g.appendChild(t1); g.appendChild(rect); g.appendChild(t2); g.appendChild(ti);
      svg.appendChild(g);
    });
    return svg;
  }
  function buildMonths() {
    const t = today0();
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const m = new Date(t.getFullYear(), t.getMonth() + i, 1);
      const k = pad2(m.getMonth() + 1) + '/' + m.getFullYear();
      arr.push({ k: k, n: S.contrats.filter(function (c) { return monthKeyOf(c.dateFin) === k; }).length });
    }
    const max = Math.max(1, ...arr.map(function (x) { return x.n; }));
    const svg = svgEl('svg', { viewBox: '0 0 320 112', 'class': 'ctr-svgcols', role: 'img', 'aria-label': 'Nombre de contrats finissant par mois, 12 prochains mois' });
    const gap = 320 / 12;
    arr.forEach(function (x, i) {
      const w = 22;
      const bx = i * gap + 4;
      const bh = Math.round(x.n / max * 78);
      const by = 92 - bh;
      const g = svgEl('g', { 'class': 'ctr-col-g' + (S.month === x.k ? ' ctr-cur' : ''), 'data-act': 'chart-month', 'data-month': x.k });
      const r = svgEl('rect', { x: bx, y: by, width: w, height: x.n ? Math.max(3, bh) : 1, rx: 2, 'class': 'ctr-svg-col' + (x.n ? '' : ' ctr-colzero') });
      g.appendChild(r);
      if (x.n) {
        const cnt = svgEl('text', { x: bx + w / 2, y: by - 3, 'text-anchor': 'middle', 'class': 'ctr-svg-n' });
        cnt.textContent = String(x.n);
        g.appendChild(cnt);
      }
      const lb = svgEl('text', { x: bx + w / 2, y: 106, 'text-anchor': 'middle', 'class': 'ctr-svg-mm' });
      lb.textContent = x.k.slice(0, 2);
      g.appendChild(lb);
      const ti = svgEl('title');
      ti.textContent = x.k + ' — ' + x.n + ' fin(s) — cliquer pour filtrer';
      g.appendChild(ti);
      svg.appendChild(g);
    });
    return svg;
  }

  /* ============================== 12. VUES =================================== */
  function setView(v) {
    S.view = v;
    renderView();
  }
  function updateViewBtns() {
    if (!root) return;
    root.querySelectorAll('.ctr-vbtn').forEach(function (b) {
      const on = b.getAttribute('data-view') === S.view;
      b.classList.toggle('ctr-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function updateChips() {
    if (!root) return;
    const ch = root.querySelector('.ctr-chips');
    ch.innerHTML = '';
    if (S.month) ch.appendChild(el('button', { 'class': 'ctr-chip', 'data-act': 'chip-month', 'type': 'button', text: 'Fins : ' + S.month + ' ✕' }));
    if (S.quick) ch.appendChild(el('button', { 'class': 'ctr-chip', 'data-act': 'chip-quick', 'type': 'button', text: 'Alerte : ' + quickLabel(S.quick) + ' ✕' }));
    if (S.fDept) ch.appendChild(el('button', { 'class': 'ctr-chip', 'data-act': 'chip-dept', 'type': 'button', text: 'Dép. : ' + S.fDept + ' ✕' }));
  }
  function renderSelbar() {
    if (!root) return;
    const sb = root.querySelector('.ctr-selbar');
    if (!sb) return;
    if (!S.sel.size) { sb.hidden = true; sb.innerHTML = ''; return; }
    sb.hidden = false;
    sb.innerHTML = '';
    sb.appendChild(el('span', { 'class': 'ctr-seln', text: S.sel.size + ' sélectionné(s)' }));
    sb.appendChild(el('button', { 'class': 'ctr-btn ctr-danger', 'data-act': 'del-sel', 'type': 'button', text: 'Supprimer la sélection' }));
    sb.appendChild(el('button', { 'class': 'ctr-btn', 'data-act': 'sel-clear', 'type': 'button', text: 'Annuler' }));
  }
  function renderView() {
    if (!root || !root.isConnected) return;
    const host = root.querySelector('.ctr-view');
    if (!host) return;
    updateViewBtns(); updateChips(); renderSelbar();
    host.innerHTML = '';
    if (S.view === 'ech') host.appendChild(buildEch());
    else if (S.view === 'cards') host.appendChild(buildCards());
    else host.appendChild(buildTable());
  }
  function resetFilters() {
    S.q = ''; S.fStatut = ''; S.fType = ''; S.fDept = '';
    S.month = null; S.quick = null; S.page = 0;
    syncSelects();
    renderStatic(); renderView();
  }
  function toggleQuick(key) {
    S.quick = S.quick === key ? null : key;
    S.page = 0;
    renderStatic(); renderView();
  }
  function setMonth(k) {
    S.month = (k && S.month === k) ? null : k;
    S.page = 0;
    renderStatic(); renderView();
  }
  function setStatutFilter(v) {
    S.fStatut = (S.fStatut === v) ? '' : v;
    S.page = 0;
    syncSelects(); renderView();
  }
  function kpiFilter(key) {
    if (key === 'encours') setStatutFilter('En cours');
    else if (key === 'neg') setStatutFilter('En négociation');
    else if (key === 'echus') setStatutFilter('Échu');
    else if (key === 'ech') { S.quick = S.quick === 'j90' ? null : 'j90'; S.page = 0; renderStatic(); renderView(); }
  }

  /* ---------- Vue signature : ÉCHÉANCIER DES ÉCHÉANCES ---------- */
  function buildEch() {
    const t = today0();
    const months = [];
    for (let i = 0; i < 12; i++) months.push(new Date(t.getFullYear(), t.getMonth() + i, 1));
    const data = months.map(function (m) {
      const k = pad2(m.getMonth() + 1) + '/' + m.getFullYear();
      const items = S.contrats.filter(function (c) { return monthKeyOf(c.dateFin) === k; });
      let minD = null;
      items.forEach(function (c) {
        const d = dLeft(c);
        if (d !== null && (minD === null || d < minD)) minD = d;
      });
      return { k: k, items: items, minD: minD };
    });
    const max = Math.max(1, ...data.map(function (x) { return x.items.length; }));
    const main = el('div', { 'class': 'ctr-ech-main' });
    main.appendChild(el('div', { 'class': 'ctr-ech-head' }, [
      el('strong', { text: 'ÉCHÉANCIER DES ÉCHÉANCES — 12 prochains mois' }),
      el('span', { 'class': 'ctr-legend' }, [
        legendDot('red', '≤ 30 j'),
        legendDot('amb', '≤ 90 j'),
        legendDot('neu', '> 90 j'),
        el('span', { 'class': 'ctr-ticklab', text: '│ aujourd\u2019hui' })
      ])
    ]));
    const rowsBox = el('div', { 'class': 'ctr-ech-rows' });
    data.forEach(function (m) {
      const pct = m.items.length ? Math.max(4, Math.round(m.items.length / max * 100)) : 0;
      const lvl = m.items.length ? (m.minD !== null && m.minD <= 30 ? 'red' : (m.minD !== null && m.minD <= 90 ? 'amb' : 'neu')) : 'neu';
      const capText = m.items.map(function (c) { return c.numero + ' · ' + trunc(c.employe, 18); }).join('  ·  ');
      const bar = el('div', {
        'class': 'ctr-bar lvl-' + lvl,
        style: 'width:' + pct + '%',
        'data-act': 'month', 'data-month': m.k,
        role: m.items.length ? 'button' : null,
        tabindex: m.items.length ? '0' : null,
        'aria-label': m.k + ' — ' + m.items.length + ' contrat(s) — cliquer pour filtrer la table'
      });
      if (m.items.length && pct >= 55) bar.appendChild(el('span', { 'class': 'ctr-cap', text: capText }));
      const track = el('div', { 'class': 'ctr-track' }, [el('i', { 'class': 'ctr-tick', 'aria-hidden': 'true' }), bar]);
      if (m.items.length && pct < 55) {
        track.appendChild(el('span', { 'class': 'ctr-cap ctr-cap-out', style: 'left:calc(' + pct + '% + 10px)', text: capText }));
      }
      rowsBox.appendChild(el('div', { 'class': 'ctr-ech-row' + (S.month === m.k ? ' ctr-cur' : '') }, [
        el('span', { 'class': 'ctr-ech-label', text: m.k }),
        track,
        el('span', { 'class': 'ctr-ech-count' + (m.items.length ? '' : ' ctr-mut'), text: m.items.length ? String(m.items.length) : '' })
      ]));
    });
    main.appendChild(rowsBox);
    const su = S.seuils;
    const at = S.contrats.filter(function (c) {
      const d = dLeft(c);
      return d !== null && d <= su.preavis && c.statut !== 'Renouvelé' && c.statut !== 'Résilié';
    }).sort(function (a, b) { return (dLeft(a) || 0) - (dLeft(b) || 0); });
    const aside = el('aside', { 'class': 'ctr-ech-aside' }, [
      el('h4', { text: 'À trancher' }),
      el('p', { 'class': 'ctr-muted', text: 'Fin ≤ ' + su.preavis + ' j sans statut Renouvelé — prévenance avant le préavis.' })
    ]);
    if (!at.length) aside.appendChild(el('div', { 'class': 'ctr-okbox', text: 'Rien à trancher : toutes les promesses proches sont renouvelées ou résiliées.' }));
    at.forEach(function (c) {
      aside.appendChild(el('button', { 'class': 'ctr-atr', 'data-act': 'open', 'data-id': String(c.id), 'type': 'button' }, [
        el('strong', { text: c.numero + ' — ' + trunc(c.employe, 20) }),
        el('span', { 'class': 'ctr-dpill ' + dClass(dLeft(c)), text: dLabel(dLeft(c)) }),
        el('span', { 'class': 'ctr-mut', text: c.statut + ' · fin ' + c.dateFin })
      ]));
    });
    return el('div', { 'class': 'ctr-ech' }, [main, aside]);
  }
  function legendDot(cls, label) {
    return el('span', { 'class': 'ctr-legitem' }, [el('i', { 'class': 'ctr-doti ' + cls, 'aria-hidden': 'true' }), document.createTextNode(' ' + label)]);
  }

  /* ---------- Vue TABLE (11 colonnes, tri aria-sort, pager) ---------- */
  function buildTable() {
    const rows = computeFiltered();
    sortRows(rows);
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / S.size));
    if (S.page >= pages) S.page = pages - 1;
    const start = S.page * S.size;
    const slice = rows.slice(start, start + S.size);
    const wrap = el('div', { 'class': 'ctr-tblwrap' });
    const tbl = el('table', { 'class': 'ctr-tbl' });
    const thead = el('thead');
    const trh = el('tr');
    COLS.forEach(function (col) {
      const dir = S.sortKey === col.k ? S.sortDir : 'none';
      trh.appendChild(el('th', {
        scope: 'col',
        'aria-sort': dir === 'asc' ? 'ascending' : (dir === 'desc' ? 'descending' : 'none'),
        'class': 'ctr-th' + (col.t ? ' ctr-thnum' : ''),
        tabindex: '0',
        'data-act': 'sort', 'data-key': col.k,
        'aria-label': 'Trier par ' + col.label
      }, [
        el('span', { text: col.label }),
        el('span', { 'class': 'ctr-sortic', 'aria-hidden': 'true', text: dir === 'asc' ? '▲' : (dir === 'desc' ? '▼' : '↕') })
      ]));
    });
    thead.appendChild(trh);
    tbl.appendChild(thead);
    const tbody = el('tbody');
    if (!slice.length) {
      tbody.appendChild(el('tr', { 'class': 'ctr-empty' }, [
        el('td', { colspan: String(COLS.length), text: 'Aucun contrat ne correspond aux filtres — Réinitialisez pour revoir la promesse complète.' })
      ]));
    }
    slice.forEach(function (c) { tbody.appendChild(buildRow(c)); });
    tbl.appendChild(tbody);
    wrap.appendChild(tbl);
    const pg = el('div', { 'class': 'ctr-pager' }, [
      el('span', { 'class': 'ctr-muted', text: total ? (start + 1) + '–' + Math.min(total, start + S.size) + ' sur ' + total : '0 contrat' }),
      el('button', { 'class': 'ctr-icb', 'data-act': 'pg-prev', 'type': 'button', 'aria-label': 'Page précédente', text: '‹', disabled: S.page <= 0 ? 'disabled' : null }),
      el('span', { text: 'Page ' + (S.page + 1) + '/' + pages }),
      el('button', { 'class': 'ctr-icb', 'data-act': 'pg-next', 'type': 'button', 'aria-label': 'Page suivante', text: '›', disabled: S.page >= pages - 1 ? 'disabled' : null }),
      (function () {
        const s = el('select', { 'class': 'ctr-in ctr-pgsz', 'aria-label': 'Lignes par page' });
        [5, 10, 25].forEach(function (n) { s.appendChild(new Option(n + ' lignes', String(n))); });
        s.value = String(S.size);
        return s;
      })()
    ]);
    return el('div', { 'class': 'ctr-tblzone' }, [wrap, pg]);
  }
  function buildRow(c) {
    const d = dLeft(c);
    const tr = el('tr', { 'class': 'ctr-row' + (S.sel.has(c.id) ? ' ctr-selrow' : ''), 'data-act': 'open', 'data-id': String(c.id), tabindex: '0' });
    tr.addEventListener('keydown', function (e) { if (e.key === 'Enter') openDrawer(c.id); });
    const cb = el('input', { type: 'checkbox', 'data-act': 'sel', 'data-id': String(c.id), 'aria-label': 'Sélectionner ' + c.numero });
    cb.checked = S.sel.has(c.id);
    tr.appendChild(el('td', { 'class': 'ctr-td-num' }, [cb, el('strong', { text: c.numero })]));
    tr.appendChild(el('td', { text: c.employe }));
    tr.appendChild(el('td', { 'class': 'ctr-mut', text: c.poste }));
    tr.appendChild(el('td', { text: c.departement }));
    tr.appendChild(el('td', null, [el('span', { 'class': 'ctr-type', text: c.typeContrat })]));
    tr.appendChild(el('td', { text: c.dateDebut }));
    tr.appendChild(el('td', { text: c.dateFin }));
    tr.appendChild(el('td', null, [el('span', { 'class': 'ctr-dpill ' + dClass(d), text: dLabel(d) })]));
    tr.appendChild(el('td', { 'class': 'ctr-num', text: fmtFCFA(c.salaireBrut) }));
    tr.appendChild(el('td', null, [el('span', { 'class': 'ctr-badge st-' + stClass(c.statut), text: c.statut })]));
    tr.appendChild(el('td', { 'class': 'ctr-mut', text: c.demandeLiee || '— pas de DR —' }));
    return tr;
  }

  /* ---------- Vue CARTES ---------- */
  function buildCards() {
    const rows = computeFiltered();
    sortRows(rows);
    const grid = el('div', { 'class': 'ctr-cardsgrid' });
    if (!rows.length) grid.appendChild(el('div', { 'class': 'ctr-empty ctr-emptycard', text: 'Aucun contrat ne correspond aux filtres.' }));
    rows.forEach(function (c) {
      const d = dLeft(c);
      grid.appendChild(el('article', {
        'class': 'ctr-card' + (S.sel.has(c.id) ? ' ctr-selrow' : ''),
        'data-act': 'open', 'data-id': String(c.id), tabindex: '0'
      }, [
        el('header', { 'class': 'ctr-card-h' }, [
          el('strong', { text: c.numero }),
          el('span', { 'class': 'ctr-badge st-' + stClass(c.statut), text: c.statut })
        ]),
        el('h4', { 'class': 'ctr-card-name', text: c.employe }),
        el('div', { 'class': 'ctr-mut', text: [c.poste, c.departement].filter(Boolean).join(' · ') }),
        el('div', { 'class': 'ctr-crow' }, [
          el('span', { 'class': 'ctr-type', text: c.typeContrat }),
          el('span', { 'class': 'ctr-dpill ' + dClass(d), text: dLabel(d) })
        ]),
        el('div', { 'class': 'ctr-cdates', text: c.dateDebut + ' → ' + c.dateFin }),
        el('div', { 'class': 'ctr-csal', text: fmtFCFA(c.salaireBrut) + ' / mois' }),
        c.demandeLiee
          ? el('div', { 'class': 'ctr-cdr', text: 'DR : ' + c.demandeLiee })
          : el('div', { 'class': 'ctr-cdr ctr-warn', text: 'DR : — traçabilité rompue' }),
        c.notes ? el('div', { 'class': 'ctr-cnotes', text: trunc(c.notes, 90) }) : null
      ]));
    });
    return grid;
  }

  /* ============================== 13. DRAWER FICHE =========================== */
  function openDrawer(id) {
    S.drawerId = Number(id);
    if (root) {
      root.querySelector('.ctr-drawer').classList.add('ctr-open');
      root.querySelector('.ctr-ovl').classList.add('ctr-on');
    }
    refreshDrawer();
  }
  function closeDrawer() {
    S.drawerId = null;
    if (root) {
      root.querySelector('.ctr-drawer').classList.remove('ctr-open');
      root.querySelector('.ctr-ovl').classList.remove('ctr-on');
    }
  }
  function inlineAlerts(c) {
    const su = S.seuils, out = [];
    const d = dLeft(c);
    if (d !== null && d <= su.preavis && c.statut !== 'Renouvelé' && c.statut !== 'Résilié') {
      out.push({ tone: 'red', t: d < 0 ? 'Échue depuis ' + (-d) + ' j sans renouvellement — à trancher.' : 'Fin dans ' + d + ' j — préavis sans renouvellement.' });
    }
    const nd = negDays(c);
    if (nd > su.negociationJours) out.push({ tone: 'amb', t: 'Négociation ouverte depuis ' + nd + ' j (> ' + su.negociationJours + ' j) — une promesse non signée est un risque.' });
    if (!c.demandeLiee) out.push({ tone: 'vio', t: 'Traçabilité DR→CTR rompue : aucune demande liée.' });
    if ((c.statut === 'Échu' || c.statut === 'Résilié') && d !== null && d >= -su.echeanceProche) {
      out.push({ tone: 'gry', t: 'Statut ' + c.statut + ' récent — à solder ou archiver.' });
    }
    return out;
  }
  function refreshDrawer() {
    if (!root) return;
    const dr = root.querySelector('.ctr-drawer');
    if (!dr) return;
    if (S.drawerId === null) { dr.innerHTML = ''; return; }
    const c = (readFresh() || []).find(function (x) { return Number(x.id) === Number(S.drawerId); });
    if (!c) { closeDrawer(); return; }
    dr.innerHTML = '';
    dr.appendChild(el('div', { 'class': 'ctr-dhead' }, [
      el('div', null, [
        el('strong', { text: c.numero }),
        el('span', { 'class': 'ctr-badge st-' + stClass(c.statut), text: c.statut })
      ]),
      el('button', { 'class': 'ctr-icb', 'data-act': 'drawer-close', 'type': 'button', 'aria-label': 'Fermer la fiche', text: '✕' })
    ]));
    dr.appendChild(el('h3', { 'class': 'ctr-dname', text: c.employe }));
    dr.appendChild(el('div', { 'class': 'ctr-dsub', text: [c.poste, c.departement, c.typeContrat].filter(Boolean).join(' · ') }));
    const seg = el('div', { 'class': 'ctr-seg', role: 'group', 'aria-label': 'Changement de statut rapide' });
    STATUTS.forEach(function (s) {
      seg.appendChild(el('button', {
        'class': 'ctr-segb' + (c.statut === s ? ' ctr-on' : ''),
        'data-act': 'status', 'data-val': s, 'type': 'button', text: s
      }));
    });
    dr.appendChild(el('div', { 'class': 'ctr-dsec' }, [el('h4', { text: 'Transition de statut' }), seg]));
    const ial = inlineAlerts(c);
    if (ial.length) {
      const b = el('div', { 'class': 'ctr-ial' });
      ial.forEach(function (a) { b.appendChild(el('div', { 'class': 'ctr-ial-i tone-' + a.tone, text: '● ' + a.t })); });
      dr.appendChild(b);
    }
    const grid = el('div', { 'class': 'ctr-dgrid' });
    grid.appendChild(fieldDate(c, 'dateDebut', 'Début'));
    grid.appendChild(fieldDate(c, 'dateFin', 'Fin'));
    grid.appendChild(fieldNum(c, 'salaireBrut', 'Salaire brut (FCFA)'));
    grid.appendChild(fieldTxt(c, 'demandeLiee', 'Demande liée (DR-…)'));
    dr.appendChild(el('div', { 'class': 'ctr-dsec' }, [el('h4', { text: 'Engagement (enregistrement auto)' }), grid]));
    const ta = el('textarea', { 'class': 'ctr-in ctr-ta', rows: '3', 'aria-label': 'Notes du contrat' });
    ta.value = c.notes || '';
    ta.addEventListener('change', function () { saveInline('notes', ta.value, c.id, 'Notes'); });
    dr.appendChild(el('div', { 'class': 'ctr-dsec' }, [el('h4', { text: 'Notes' }), ta]));
    const jr = readJournal()
      .filter(function (e2) { return String(e2.detail || '').indexOf(c.numero) >= 0; })
      .slice(-15).reverse();
    const jw = el('div', { 'class': 'ctr-journal' });
    if (!jr.length) jw.appendChild(el('div', { 'class': 'ctr-muted', text: 'Aucun évènement journalisé pour ce contrat.' }));
    jr.forEach(function (e2) {
      jw.appendChild(el('div', { 'class': 'ctr-jrow' }, [
        el('span', { 'class': 'ctr-jtime', text: fmtJournalTime(e2.time) }),
        el('span', { 'class': 'ctr-jact', text: e2.action + ' — ' + e2.detail })
      ]));
    });
    dr.appendChild(el('div', { 'class': 'ctr-dsec' }, [el('h4', { text: 'Historique (admina_journal)' }), jw]));
    dr.appendChild(el('div', { 'class': 'ctr-dact' }, [
      el('button', { 'class': 'ctr-btn', 'data-act': 'edit', 'data-id': String(c.id), 'type': 'button', text: 'Éditer (dialog)' }),
      el('button', { 'class': 'ctr-btn', 'data-act': 'dup', 'data-id': String(c.id), 'type': 'button', text: 'Dupliquer' }),
      el('button', { 'class': 'ctr-btn ctr-danger', 'data-act': 'del', 'data-id': String(c.id), 'type': 'button', text: 'Supprimer' })
    ]));
  }
  function fieldDate(c, k, label) {
    const i = el('input', { 'class': 'ctr-in', type: 'text', inputmode: 'numeric', placeholder: 'jj/mm/aaaa', 'aria-label': label });
    i.value = c[k] || '';
    i.addEventListener('change', function () { saveInline(k, i.value, c.id, label); });
    return el('label', { 'class': 'ctr-f' }, [el('span', { 'class': 'ctr-flab', text: label }), i]);
  }
  function fieldNum(c, k, label) {
    const i = el('input', { 'class': 'ctr-in', type: 'number', min: '0', step: '1000', 'aria-label': label });
    i.value = String(c[k] || '');
    i.addEventListener('change', function () { saveInline(k, i.value, c.id, label); });
    return el('label', { 'class': 'ctr-f' }, [el('span', { 'class': 'ctr-flab', text: label }), i]);
  }
  function fieldTxt(c, k, label) {
    const i = el('input', { 'class': 'ctr-in', type: 'text', placeholder: 'DR-AAAA-XXX', 'aria-label': label });
    i.value = c[k] || '';
    i.addEventListener('change', function () { saveInline(k, i.value, c.id, label); });
    return el('label', { 'class': 'ctr-f' }, [el('span', { 'class': 'ctr-flab', text: label }), i]);
  }
  function saveInline(k, v, id, label) {
    const list = readFresh();
    if (!list) return;
    const i = list.findIndex(function (x) { return Number(x.id) === Number(id); });
    if (i < 0) return;
    const c = list[i];
    const old = c[k];
    if (k === 'dateDebut' || k === 'dateFin') {
      if (!validFrDate(v) ||
          (k === 'dateFin' && parseFr(v) <= parseFr(c.dateDebut)) ||
          (k === 'dateDebut' && c.dateFin && parseFr(c.dateFin) <= parseFr(v))) {
        toast('Date invalide : jj/mm/aaaa réel, fin APRÈS début (bloquant)', 'err');
        refreshDrawer();
        return;
      }
    }
    if (k === 'salaireBrut') {
      v = Number(v);
      if (!isFinite(v) || v < 0) { toast('Salaire numérique requis (≥ 0)', 'err'); refreshDrawer(); return; }
    }
    c[k] = (k === 'statut') ? normStatut(v) : v;
    writeContrats(list, 'modif-inline', c.numero + ' · ' + k + ' : ' + String(old) + ' → ' + String(c[k]));
    toast('Enregistré : ' + (label || k), 'ok');
  }

  /* ============================== 14. DIALOG CRÉATION/ÉDITION ================ */
  const FORM_FIELDS = [
    { k: 'employe', label: 'Employé (nom + prénom)', req: true },
    { k: 'poste', label: 'Poste', req: true },
    { k: 'departement', label: 'Département', req: true },
    { k: 'typeContrat', label: 'Type de contrat', type: 'select', opts: TYPES, req: true },
    { k: 'dateDebut', label: 'Date de début (jj/mm/aaaa)', req: true },
    { k: 'dateFin', label: 'Date de fin (jj/mm/aaaa)', req: true },
    { k: 'salaireBrut', label: 'Salaire brut mensuel (FCFA)', req: true },
    { k: 'statut', label: 'Statut', type: 'select', opts: STATUTS, req: true },
    { k: 'demandeLiee', label: 'Demande liée (DR-AAAA-XXX)', req: false },
    { k: 'notes', label: 'Notes', type: 'textarea', req: false }
  ];
  function validateForm(v, editId) {
    const errs = {};
    const num = String(v.numero || '').trim();
    if (!num) errs.numero = 'Numéro requis';
    else if (S.contrats.some(function (c) { return Number(c.id) !== Number(editId || 0) && fold(c.numero) === fold(num); })) errs.numero = 'Numéro déjà utilisé (anti-collision)';
    ['employe', 'poste', 'departement'].forEach(function (k) {
      if (!String(v[k] || '').trim()) errs[k] = 'Champ obligatoire';
    });
    if (!validFrDate(v.dateDebut)) errs.dateDebut = 'Date réelle jj/mm/aaaa requise';
    if (!validFrDate(v.dateFin)) errs.dateFin = 'Date réelle jj/mm/aaaa requise';
    else if (validFrDate(v.dateDebut) && parseFr(v.dateFin) <= parseFr(v.dateDebut)) errs.dateFin = 'La fin doit être APRÈS le début (bloquant)';
    const sal = Number(String(v.salaireBrut || '').replace(/[\s\u00a0]/g, '').replace(',', '.'));
    if (!isFinite(sal) || String(v.salaireBrut || '').trim() === '' || sal < 0) errs.salaireBrut = 'Salaire numérique requis (≥ 0)';
    if (STATUTS.indexOf(normStatut(v.statut)) < 0) errs.statut = 'Statut inconnu';
    return errs;
  }
  function buildPreview(v) {
    const p1 = parseFr(v.dateDebut), p2 = parseFr(v.dateFin);
    if (!p1 || !p2) return 'Aperçu : dates requises au format jj/mm/aaaa.';
    if (p2 <= p1) return 'Aperçu : BLOQUÉ — la fin doit être après le début.';
    const days = Math.round((p2 - p1) / 864e5);
    let months = (p2.getFullYear() - p1.getFullYear()) * 12 + (p2.getMonth() - p1.getMonth());
    if (p2.getDate() < p1.getDate()) months = Math.max(0, months - 1);
    const d = dLeftFromDate(p2);
    const rest = d < 0 ? ' · échue depuis ' + (-d) + ' j' : ' · échéance dans ' + d + ' j';
    return 'Aperçu live : durée ' + months + ' mois (' + days + ' j)' + rest;
  }
  function openDialog(id) {
    S.editId = (id === null || id === undefined) ? null : Number(id);
    closeDrawer();
    const c = S.editId !== null ? S.contrats.find(function (x) { return Number(x.id) === S.editId; }) : null;
    const v = {
      numero: c ? c.numero : nextNumero(S.contrats),
      employe: c ? c.employe : '',
      poste: c ? c.poste : '',
      departement: c ? c.departement : '',
      typeContrat: c ? c.typeContrat : 'CDD',
      dateDebut: c ? c.dateDebut : '',
      dateFin: c ? c.dateFin : '',
      salaireBrut: c ? String(c.salaireBrut) : '',
      statut: c ? c.statut : 'En négociation',
      demandeLiee: c ? c.demandeLiee : '',
      notes: c ? c.notes : ''
    };
    const refs = {};
    const ov = el('div', { 'class': 'ctr-modal-ovl' });
    const m = el('div', { 'class': 'ctr-modal ctr-form-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': c ? 'Éditer le contrat' : 'Nouveau contrat' });
    m.appendChild(el('h3', { text: c ? 'Éditer ' + c.numero : 'Nouveau contrat — la promesse commence ici' }));
    const grid = el('div', { 'class': 'ctr-fgrid' });
    function mkField(k, label, type) {
      const err = el('span', { 'class': 'ctr-ferr', 'aria-live': 'polite' });
      let input;
      if (type === 'select') {
        input = el('select', { 'class': 'ctr-in', 'aria-label': label });
        (FORM_FIELDS.find(function (f) { return f.k === k; }).opts || []).forEach(function (o) { input.appendChild(new Option(o, o)); });
      } else if (type === 'textarea') {
        input = el('textarea', { 'class': 'ctr-in', rows: '2', 'aria-label': label });
      } else if (k === 'salaireBrut') {
        input = el('input', { 'class': 'ctr-in', type: 'number', min: '0', step: '1000', 'aria-label': label });
      } else {
        input = el('input', { 'class': 'ctr-in', type: 'text', 'aria-label': label, placeholder: k === 'dateDebut' || k === 'dateFin' ? 'jj/mm/aaaa' : '' });
      }
      input.value = v[k] || '';
      const upd = function () { v[k] = input.value; revalidate(); };
      input.addEventListener('input', upd);
      input.addEventListener('change', upd);
      refs[k] = { err: err, input: input };
      return el('label', { 'class': 'ctr-f' }, [el('span', { 'class': 'ctr-flab', text: label }), input, err]);
    }
    grid.appendChild(mkField('numero', 'Numéro (anti-collision auto)', 'text'));
    FORM_FIELDS.forEach(function (f) { grid.appendChild(mkField(f.k, f.label, f.type || 'text')); });
    m.appendChild(grid);
    const prev = el('div', { 'class': 'ctr-preview', 'aria-live': 'polite' });
    m.appendChild(prev);
    const saveBtn = el('button', { 'class': 'ctr-btn ctr-primary', 'type': 'button', text: c ? 'Enregistrer' : 'Créer le contrat' });
    saveBtn.addEventListener('click', persist);
    m.appendChild(el('div', { 'class': 'ctr-modal-actions' }, [
      el('button', { 'class': 'ctr-btn', 'type': 'button', text: 'Annuler', onclick: function () { closeDialog(); } }),
      saveBtn
    ]));
    ov.appendChild(m);
    ov.__isForm = true;
    document.body.appendChild(ov);
    S.dlgEl = ov;
    function revalidate() {
      const errs = validateForm(v, S.editId);
      Object.keys(refs).forEach(function (k) { refs[k].err.textContent = errs[k] || ''; });
      const bad = Object.keys(errs).length > 0;
      saveBtn.disabled = bad;
      prev.textContent = buildPreview(v);
    }
    function persist() {
      const errs = validateForm(v, S.editId);
      if (Object.keys(errs).length) return;
      const list = readFresh() || S.contrats.slice();
      const rec = {
        numero: String(v.numero).trim(),
        employe: String(v.employe).trim(),
        poste: String(v.poste).trim(),
        departement: String(v.departement).trim(),
        typeContrat: v.typeContrat,
        dateDebut: String(v.dateDebut).trim(),
        dateFin: String(v.dateFin).trim(),
        salaireBrut: Number(String(v.salaireBrut).replace(/[\s\u00a0]/g, '').replace(',', '.')),
        statut: normStatut(v.statut),
        demandeLiee: String(v.demandeLiee || '').trim(),
        notes: String(v.notes || '')
      };
      if (S.editId !== null) {
        const i = list.findIndex(function (x) { return Number(x.id) === S.editId; });
        if (i < 0) { closeDialog(); return; }
        rec.id = list[i].id;
        const oldNum = list[i].numero;
        list[i] = rec;
        writeContrats(list, 'edition', rec.numero + (oldNum !== rec.numero ? ' (ex ' + oldNum + ')' : '') + ' — ' + rec.employe);
      } else {
        rec.id = nextId(list);
        list.push(rec);
        writeContrats(list, 'creation', rec.numero + ' — ' + rec.employe + ' (' + rec.typeContrat + ')');
      }
      closeDialog();
      toast('Contrat enregistré : ' + rec.numero, 'ok');
      openDrawer(rec.id);
    }
    revalidate();
    const first = refs.employe.input;
    if (first) setTimeout(function () { try { first.focus(); } catch (e) { /* focus refusé */ } }, 30);
  }
  function closeDialog() {
    if (S.dlgEl) { S.dlgEl.remove(); S.dlgEl = null; }
    S.editId = null;
  }

  /* ============================== 15. CONFIRMATION MAISON ==================== */
  function askConfirm(title, msg, okLabel, danger) {
    return new Promise(function (res) {
      const ov = el('div', { 'class': 'ctr-modal-ovl' });
      function cleanup(val) { ov.remove(); res(val); }
      ov.__cleanup = cleanup;
      ov.appendChild(el('div', { 'class': 'ctr-modal ctr-confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': title }, [
        el('h3', { text: title }),
        el('p', { text: msg }),
        el('div', { 'class': 'ctr-modal-actions' }, [
          el('button', { 'class': 'ctr-btn', 'type': 'button', text: 'Annuler', onclick: function () { cleanup(false); } }),
          el('button', { 'class': 'ctr-btn ' + (danger ? 'ctr-danger' : 'ctr-primary'), 'type': 'button', text: okLabel || 'Confirmer', onclick: function () { cleanup(true); } })
        ])
      ]));
      ov.addEventListener('click', function (e) { if (e.target === ov) cleanup(false); });
      document.body.appendChild(ov);
    });
  }
  function closeAllConfirms() {
    document.querySelectorAll('.ctr-modal-ovl').forEach(function (o) {
      if (typeof o.__cleanup === 'function') o.__cleanup(false);
      else o.remove();
    });
    S.dlgEl = null;
  }

  /* ============================== 16. DUPLICATION / SUPPRESSION ============== */
  function duplicate(id) {
    const list = readFresh();
    if (!list) return;
    const c = list.find(function (x) { return Number(x.id) === Number(id); });
    if (!c) return;
    const rec = Object.assign({}, c, {
      id: nextId(list),
      numero: nextNumero(list),
      statut: 'En négociation',
      notes: c.notes ? '[Copie] ' + c.notes : ''
    });
    list.push(rec);
    writeContrats(list, 'duplication', rec.numero + ' (copie de ' + c.numero + ' — statut repassé en négociation)');
    toast('Dupliqué : ' + rec.numero + ' (à trancher)', 'ok');
    openDrawer(rec.id);
  }
  function deleteOne(id) {
    const list = readFresh();
    if (!list) return;
    const c = list.find(function (x) { return Number(x.id) === Number(id); });
    if (!c) return;
    askConfirm('Supprimer le contrat', 'Supprimer définitivement ' + c.numero + ' — ' + c.employe + ' ? L\u2019action est journalisée (rôle RH).', 'Supprimer', true)
      .then(function (yes) {
        if (!yes) return;
        const l2 = (readFresh() || list).filter(function (x) { return Number(x.id) !== Number(id); });
        writeContrats(l2, 'suppression', c.numero + ' — ' + c.employe);
        closeDrawer();
        toast('Contrat supprimé : ' + c.numero, 'ok');
      });
  }
  function deleteSelected() {
    if (!S.sel.size) return;
    const n = S.sel.size;
    askConfirm('Suppression groupée', 'Supprimer ' + n + ' contrat(s) sélectionné(s) ? L\u2019action est journalisée (rôle RH).', 'Supprimer tout', true)
      .then(function (yes) {
        if (!yes) return;
        const ids = new Set(S.sel);
        const list = (readFresh() || []).filter(function (c) { return !ids.has(Number(c.id)); });
        writeContrats(list, 'suppression-groupée', n + ' contrat(s) supprimé(s)');
        S.sel.clear();
        closeDrawer();
        renderSelbar(); renderView();
        toast(n + ' contrat(s) supprimé(s)', 'ok');
      });
  }
  function toggleSel(id) {
    if (S.sel.has(id)) S.sel.delete(id); else S.sel.add(id);
    renderView();
  }

  /* ============================== 17. EXPORT CSV ============================= */
  function csvCell(v) {
    v = String(v === null || v === undefined ? '' : v);
    return /[";\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function doExport() {
    const rows = computeFiltered();
    const head = ['Numero', 'Employe', 'Poste', 'Departement', 'Type', 'DateDebut', 'DateFin', 'SalaireBrut', 'Statut', 'DemandeLiee', 'Notes'];
    const lines = [head.join(';')];
    rows.forEach(function (c) {
      lines.push([c.numero, c.employe, c.poste, c.departement, c.typeContrat, c.dateDebut, c.dateFin,
        Math.round(Number(c.salaireBrut) || 0), c.statut, c.demandeLiee, c.notes].map(csvCell).join(';'));
    });
    const d = new Date();
    const name = 'contrats-' + d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + '.csv';
    try {
      const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const a = el('a', { href: URL.createObjectURL(blob), download: name });
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      pushJournal('export', rows.length + ' contrat(s) → ' + name);
      toast(rows.length + ' contrat(s) exportés → ' + name, 'ok');
    } catch (e) {
      toast('Export impossible : ' + e.message, 'err');
    }
  }

  /* ============================== 18. SEUILS / AIDE (MODALES) ================ */
  function openSeuils() {
    const ov = el('div', { 'class': 'ctr-modal-ovl' });
    const m = el('div', { 'class': 'ctr-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Seuils d\u2019alerte' });
    m.appendChild(el('h3', { text: 'Seuils d\u2019alerte (K) — calibrage de la prévenance' }));
    m.appendChild(el('p', { 'class': 'ctr-muted', text: 'Persistés en LS ' + LS_SEUILS + ' — utilisés par le héro, les alertes, l\u2019échéancier et le panneau « À trancher ».' }));
    const inputs = {};
    const grid = el('div', { 'class': 'ctr-fgrid' });
    ['preavis', 'negociationJours', 'echeanceProche'].forEach(function (k) {
      const r = SEUIL_RANGES[k];
      const i = el('input', { 'class': 'ctr-in', type: 'number', min: String(r[0]), max: String(r[1]), 'aria-label': k });
      i.value = String(S.seuils[k]);
      inputs[k] = i;
      grid.appendChild(el('label', { 'class': 'ctr-f' }, [
        el('span', { 'class': 'ctr-flab', text: k + ' (' + r[0] + '–' + r[1] + ' j)' }),
        i,
        el('span', { 'class': 'ctr-ferr', text: SEUIL_HINT[k] })
      ]));
    });
    m.appendChild(grid);
    m.appendChild(el('div', { 'class': 'ctr-modal-actions' }, [
      el('button', { 'class': 'ctr-btn', 'type': 'button', text: 'Réinitialiser les seuils', onclick: function () {
        ['preavis', 'negociationJours', 'echeanceProche'].forEach(function (k) { inputs[k].value = String(SEUIL_DEF[k]); });
      } }),
      el('button', { 'class': 'ctr-btn', 'type': 'button', text: 'Annuler', onclick: function () { ov.remove(); } }),
      el('button', { 'class': 'ctr-btn ctr-primary', 'type': 'button', text: 'Appliquer', onclick: function () {
        const next = {};
        Object.keys(inputs).forEach(function (k) { next[k] = inputs[k].value; });
        saveSeuils(next);
        ov.remove();
        toast('Seuils appliqués et persistés', 'ok');
      } })
    ]));
    ov.appendChild(m);
    document.body.appendChild(ov);
  }
  function openHelp() {
    const ov = el('div', { 'class': 'ctr-modal-ovl' });
    const rows = [
      ['N', 'Nouveau contrat (dialog validé)'],
      ['E', 'Export CSV (BOM, séparateur ;)'],
      ['J', 'Vue Échéancier (signature)'],
      ['T', 'Vue Table'],
      ['C', 'Vue Cartes'],
      ['P', 'Pagination : cycle 5 / 10 / 25'],
      ['S', 'Synchroniser (re-lecture API/LS)'],
      ['K', 'Panneau des seuils'],
      ['/', 'Recherche'],
      ['?', 'Cette aide'],
      ['Échap', 'Fermer fiche / dialog / confirm']
    ];
    const tbl = el('div', { 'class': 'ctr-help' });
    rows.forEach(function (r) {
      tbl.appendChild(el('div', { 'class': 'ctr-helprow' }, [
        el('kbd', { text: r[0] }),
        el('span', { text: r[1] })
      ]));
    });
    ov.appendChild(el('div', { 'class': 'ctr-modal ctr-confirm', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Aide' }, [
      el('h3', { text: 'Le cycle de vie contractuel — raccourcis' }),
      el('p', { 'class': 'ctr-muted', text: 'Raccourcis ignorés dans les champs de saisie et les dialogs. Les mutations passent par l\u2019API native (setData) et sont journalisées (rôle RH).' }),
      tbl,
      el('div', { 'class': 'ctr-modal-actions' }, [
        el('button', { 'class': 'ctr-btn ctr-primary', 'type': 'button', text: 'Compris', onclick: function () { ov.remove(); } })
      ])
    ]));
    document.body.appendChild(ov);
  }

  /* ============================== 19. TOASTS / PAGINATION / SYNC ============= */
  function toast(msg, kind) {
    try {
      const host = root ? root.querySelector('.ctr-toasts') : null;
      if (!host) return;
      const t = el('div', { 'class': 'ctr-toast ' + (kind === 'err' ? 'ctr-terr' : 'ctr-tok'), text: msg });
      host.appendChild(t);
      setTimeout(function () {
        t.classList.add('ctr-out');
        setTimeout(function () { t.remove(); }, 320);
      }, 3400);
    } catch (e) { /* toast non critique */ }
  }
  function cyclePager() {
    S.size = S.size === 5 ? 10 : (S.size === 10 ? 25 : 5);
    S.page = 0;
    renderView();
    toast('Pagination : ' + S.size + ' lignes par page', 'ok');
  }
  function syncNow() {
    onExternal('manual');
    toast('Données resynchronisées (' + (S.src === 'api' ? 'API native' : S.src === 'ls' ? 'LS secours' : 'snapshot') + ')', 'ok');
  }

  /* ============================== 20. PAGE NATIVE / BURGER / DARK ============ */
  function showNative() {
    if (!root) return;
    root.style.display = 'none';
    removeRestore();
    const chip = el('button', { 'class': 'ctr-restore', 'type': 'button', text: '← Revenir au module Contrats' });
    chip.addEventListener('click', function () {
      root.style.display = '';
      chip.remove();
    });
    document.body.appendChild(chip);
  }
  function removeRestore() {
    document.querySelectorAll('.ctr-restore').forEach(function (c) { c.remove(); });
  }
  function applyDark() {
    let dark = null;
    try {
      const v = localStorage.getItem(LS_DARK);
      if (v === '1') dark = true;
      else if (v === '0') dark = false;
    } catch (e) { /* LS indisponible */ }
    if (dark === null) {
      try {
        const bg = getComputedStyle(document.body).backgroundColor;
        const m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(bg || '');
        if (m) {
          const lum = (0.2126 * Number(m[1]) + 0.7152 * Number(m[2]) + 0.0722 * Number(m[3])) / 255;
          dark = lum < 0.4;
        }
      } catch (e) { /* style indisponible */ }
    }
    if (dark === null) dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('admina-ctr-dark', !!dark);
  }

  /* ============================== 21. DÉLÉGATION CLIC ======================== */
  function onClick(e) {
    const t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t) return;
    const act = t.getAttribute('data-act');
    switch (act) {
      case 'view': setView(t.getAttribute('data-view')); break;
      case 'export': doExport(); break;
      case 'seuils': openSeuils(); break;
      case 'help': openHelp(); break;
      case 'reset': resetFilters(); break;
      case 'new': openDialog(null); break;
      case 'burger': document.body.classList.toggle('ctr-nav-open'); break;
      case 'native': showNative(); break;
      case 'alert': toggleQuick(t.getAttribute('data-key')); break;
      case 'kpi': kpiFilter(t.getAttribute('data-key')); break;
      case 'chart-statut': setStatutFilter(t.getAttribute('data-val')); break;
      case 'chart-dept':
        S.fDept = t.getAttribute('data-val') || '';
        S.page = 0; syncSelects(); renderView();
        break;
      case 'chart-month': case 'month': setMonth(t.getAttribute('data-month')); break;
      case 'chip-month': setMonth(S.month); break;
      case 'chip-quick': S.quick = null; renderStatic(); renderView(); break;
      case 'chip-dept': S.fDept = ''; syncSelects(); renderView(); break;
      case 'open': openDrawer(Number(t.getAttribute('data-id'))); break;
      case 'sel': toggleSel(Number(t.getAttribute('data-id'))); break;
      case 'del-sel': deleteSelected(); break;
      case 'sel-clear': S.sel.clear(); renderView(); break;
      case 'sort': toggleSort(t.getAttribute('data-key')); break;
      case 'pg-prev': if (S.page > 0) { S.page -= 1; renderView(); } break;
      case 'pg-next': S.page += 1; renderView(); break;
      case 'drawer-close': closeDrawer(); break;
      case 'ovl-close': closeDrawer(); break;
      case 'dup': duplicate(Number(t.getAttribute('data-id'))); break;
      case 'del': deleteOne(Number(t.getAttribute('data-id'))); break;
      case 'edit': openDialog(Number(t.getAttribute('data-id'))); break;
      case 'status': saveInline('statut', t.getAttribute('data-val'), S.drawerId, 'Statut'); break;
      default: break;
    }
  }
  function toggleSort(k) {
    if (S.sortKey === k) S.sortDir = S.sortDir === 'asc' ? 'desc' : 'asc';
    else { S.sortKey = k; S.sortDir = 'asc'; }
    renderView();
  }

  /* ============================== 22. RACCOURCIS CLAVIER ===================== */
  function onKey(e) {
    if (!S.active) return;
    if (e.key === 'Escape') {
      closeAllConfirms();
      closeDrawer();
      return;
    }
    const t = e.target;
    const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('.ctr-modal-ovl')) return;
    if (e.key === '/') {
      e.preventDefault();
      const q = root && root.querySelector('.ctr-q');
      if (q) { q.focus(); q.select(); }
      return;
    }
    if (e.key === '?') { e.preventDefault(); openHelp(); return; }
    const k = e.key.toLowerCase();
    const map = {
      n: function () { openDialog(null); },
      e: doExport,
      j: function () { setView('ech'); },
      t: function () { setView('tbl'); },
      c: function () { setView('cards'); },
      p: cyclePager,
      s: syncNow,
      k: openSeuils
    };
    if (map[k]) { e.preventDefault(); map[k](); }
  }

  /* ============================== 23. INTERFACE DEBUG ======================== */
  window.__ADMINA_CTR_UI__ = {
    version: VERSION,
    get filtered() { return computeFiltered(); },
    get alerts() { return computeAlerts(); },
    nextNumero: function () { return nextNumero(); },
    get seuils() { return Object.assign({}, S.seuils); }
  };

  /* ============================== 24. INIT =================================== */
  function init() {
    loadSeuils();
    apiBoot();
    setInterval(tick, TICK_MS);
    window.addEventListener('popstate', tick);
    document.addEventListener('keydown', onKey);
    tick();
    window.__ADMINA_CTR_W4__ = true; /* canon : flag posé en FIN d'init */
  }
  init();
})();
