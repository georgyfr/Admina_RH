/* =============================================================
   Admina-RH — Checklist d'Intégration — couche admina
   W2-b : BOÎTE À OUTILS DE L'ARRIVÉE — Checklists d'intégration

   PHILOSOPHIE DE LA PAGE —
   /checklist-integration est la BOÎTE À OUTILS DE L'ARRIVÉE : des
   checklists standardisées et réutilisables (par modèle de poste, par
   type d'arrivée) qui garantissent qu'aucune étape n'est oubliée. La
   checklist est un instrument d'EXHAUSTIVITÉ : on coche, on trace qui a
   coché et quand, on voit la progression en un coup d'œil ; les items
   bloqués ou en retard remontent comme alertes ; les modèles sont
   dupliquables et adaptables à chaque nouvelle arrivée. La page est
   centrée sur les LISTES D'ITEMS et leur progression — elle n'est PAS
   un suivi de parcours individuel (cela appartient à
   /integration-employe). Jamais un dossier nominatif : toujours des
   listes cochables, traçables, réutilisables.

   - Scope strict : /checklist-integration (RegExp /\/checklist-integration\/?$/)
   - Idempotent (data-acl / data-acl-hide), sans collision (__ADMINA_ACL_W2__)
   - Données : window.__ADMINA_ACL_API__ (patch chunk W2) → fallback
     localStorage 'admina-checklist-data' (même clé que le wrapper) →
     snapshot démo (copie conforme du chunk natif)
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   - Résilience : 30 réessais API (500 ms) → fallback LS direct → sinon
     page native intacte
   - Pont bidirectionnel : subscribe (API) + poller 1,2 s (signature)
   - Cohabitation stricte : tout préfixé acl-, rien de global hors
     window.__ADMINA_ACL_W2__ / window.__ADMINA_ACL_UI__
   - Modèle de données : les items natifs (CHK-xxx) sont regroupés en
     checklists (chkKey CKL-xxx pour les checklists du module, clé
     dérivée employé|arrivée pour les items hérités du natif). Les
     champs additionnels (chkTitre, chkModele, chkType, chkResp,
     chkNotes, cloturee, bloquee, obligatoire, faitPar) sont portés par
     les items eux-mêmes — le tableau natif les ignore, le LS les
     conserve, la vue native reste reflétée par le pont API.
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_ACL_W2__) return;
  window.__ADMINA_ACL_W2__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/checklist-integration\/?$/;
  var LS_DATA = 'admina-checklist-data';
  var LS_UI = 'admina-acl-ui';
  var LS_SEUILS = 'admina-acl-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', cat: '', dept: '', modele: '', chkstat: '', flag: '', kpi: '', view: 'checklist', sortKey: 'arrivee', sortDir: -1, page: 0, per: 10, drawerId: null, dialogOpen: false, editKey: null, delKey: null, sel: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { progressionCible: 75, urgenceJours: 7 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var STATUTS_ITEMS = [
    { k: 'Fait', lab: 'Fait', c: '#059669' },
    { k: 'En cours', lab: 'En cours', c: '#d97706' },
    { k: 'A faire', lab: 'À faire', c: '#64748b' },
    { k: 'Non applicable', lab: 'Non applicable', c: '#0891b2' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS_ITEMS.length; i++) { if (STATUTS_ITEMS[i].k === k) return STATUTS_ITEMS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  var CATS = ['Documents administratifs', 'Formation securite', 'Formation metier', 'Equipement & Badge', 'Presentation equipes', 'Visite locaux', 'Compte informatique'];
  var TYPES = [
    { k: 'arrivee', lab: 'Arrivée employé' },
    { k: 'modele', lab: 'Modèle réutilisable' }
  ];
  function typeMeta(k) { return (k === 'modele') ? TYPES[1] : TYPES[0]; }

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
  function startOfToday() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysTo(s) {
    var t = tsOf(s);
    if (!t) return null;
    return Math.round((t - startOfToday()) / 86400000);
  }
  function todayFr() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
  }
  function dateFrOk(s) { return /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(String(s || '').trim()); }
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
  function toastsZone() { var z = $('[data-acl="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-acl', 'toasts'); z.className = 'acl-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'acl-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_ACL_API__ || null; }
  function lsData() {
    try { var d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); if (d && Array.isArray(d.checklists)) return d; } catch (e) {}
    return null;
  }
  /* Copie conforme des 11 items de démonstration du chunk natif —
     utilisée UNIQUEMENT par le fallback quand ni l'API ni le LS n'ont
     encore de données (résilience au démarrage, affichage seul). */
  var DEMO = [
    { id: 1, numero: 'CHK-001', employe: 'Nkoulou Amina', poste: 'Chef Cuisinier', categorie: 'Documents administratifs', etape: 'Dossier administratif complet', responsable: 'RH', datePrevue: '01/03/2025', dateRealisee: '01/03/2025', statut: 'Fait', commentaires: 'Tous les documents reçus', departement: 'Restauration', dateArrivee: '01/03/2025' },
    { id: 2, numero: 'CHK-002', employe: 'Nkoulou Amina', poste: 'Chef Cuisinier', categorie: 'Formation securite', etape: 'Sécurité incendie & HACCP', responsable: 'Sécurité', datePrevue: '03/03/2025', dateRealisee: '03/03/2025', statut: 'Fait', commentaires: 'Formation validée', departement: 'Restauration', dateArrivee: '01/03/2025' },
    { id: 3, numero: 'CHK-003', employe: 'Nkoulou Amina', poste: 'Chef Cuisinier', categorie: 'Equipement & Badge', etape: 'Remise badge et uniforme', responsable: 'Administration', datePrevue: '01/03/2025', dateRealisee: '01/03/2025', statut: 'Fait', commentaires: '', departement: 'Restauration', dateArrivee: '01/03/2025' },
    { id: 4, numero: 'CHK-004', employe: 'Mbarga Paul', poste: 'Réceptionniste Nuit', categorie: 'Documents administratifs', etape: 'Contrat signé, documents complets', responsable: 'RH', datePrevue: '15/03/2025', dateRealisee: '15/03/2025', statut: 'Fait', commentaires: '', departement: 'Hébergement', dateArrivee: '15/03/2025' },
    { id: 5, numero: 'CHK-005', employe: 'Mbarga Paul', poste: 'Réceptionniste Nuit', categorie: 'Formation securite', etape: 'Sécurité incendie', responsable: 'Sécurité', datePrevue: '18/03/2025', dateRealisee: '18/03/2025', statut: 'Fait', commentaires: '', departement: 'Hébergement', dateArrivee: '15/03/2025' },
    { id: 6, numero: 'CHK-006', employe: 'Tabi Sandrine', poste: 'Comptable Senior', categorie: 'Documents administratifs', etape: 'Vérification diplômes', responsable: 'RH', datePrevue: '01/02/2025', dateRealisee: '01/02/2025', statut: 'Fait', commentaires: 'Diplôme Licence Comptabilité vérifié', departement: 'Finance & Comptabilite', dateArrivee: '01/02/2025' },
    { id: 7, numero: 'CHK-007', employe: 'Tabi Sandrine', poste: 'Comptable Senior', categorie: 'Compte informatique', etape: 'Création comptes Sage & email', responsable: 'IT', datePrevue: '03/02/2025', dateRealisee: '05/02/2025', statut: 'Fait', commentaires: 'Retard de 2 jours', departement: 'Finance & Comptabilite', dateArrivee: '01/02/2025' },
    { id: 8, numero: 'CHK-008', employe: 'Eyenga Clarisse', poste: 'Agent Accueil', categorie: 'Documents administratifs', etape: 'Dossier complet', responsable: 'RH', datePrevue: '10/02/2025', dateRealisee: '10/02/2025', statut: 'Fait', commentaires: '', departement: 'Service Client', dateArrivee: '10/02/2025' },
    { id: 9, numero: 'CHK-009', employe: 'Nganou André', poste: 'Agent de Sécurité', categorie: 'Equipement & Badge', etape: 'Badge et équipement sécurité', responsable: 'Sécurité', datePrevue: '01/03/2025', dateRealisee: '03/03/2025', statut: 'Fait', commentaires: 'Livraison retardée', departement: 'Sécurité', dateArrivee: '01/03/2025' },
    { id: 10, numero: 'CHK-010', employe: 'Kamga Blaise', poste: 'Développeur Full Stack', categorie: 'Compte informatique', etape: 'Config poste dev + accès', responsable: 'IT', datePrevue: '01/04/2025', dateRealisee: '', statut: 'En cours', commentaires: 'En attente matériel', departement: 'Informatique', dateArrivee: '01/04/2025' },
    { id: 11, numero: 'CHK-011', employe: 'Mebara Nadège', poste: 'Community Manager', categorie: 'Formation metier', etape: 'Formation outils marketing', responsable: 'Marketing', datePrevue: '20/03/2025', dateRealisee: '', statut: 'A faire', commentaires: '', departement: 'Marketing & Communication', dateArrivee: '15/03/2025' }
  ];
  function normRow(r) {
    var u = {}; for (var k in r) u[k] = r[k];
    u.employe = String(u.employe || '');
    u.poste = String(u.poste || '');
    u.categorie = String(u.categorie || '');
    u.etape = String(u.etape || '');
    u.responsable = String(u.responsable || '');
    u.datePrevue = String(u.datePrevue || '');
    u.dateRealisee = String(u.dateRealisee || '');
    u.statut = String(u.statut || 'A faire');
    u.commentaires = String(u.commentaires || '');
    u.departement = String(u.departement || '');
    u.dateArrivee = String(u.dateArrivee || '');
    u.chkKey = u.chkKey ? String(u.chkKey) : '';
    u.chkTitre = String(u.chkTitre || '');
    u.chkModele = String(u.chkModele || '');
    u.chkType = u.chkType === 'modele' ? 'modele' : (u.chkType === 'arrivee' ? 'arrivee' : '');
    u.chkResp = String(u.chkResp || '');
    u.chkNotes = String(u.chkNotes || '');
    u.cloturee = !!u.cloturee;
    u.bloquee = !!u.bloquee;
    u.obligatoire = !!u.obligatoire;
    u.faitPar = String(u.faitPar || '');
    u.fait = u.statut === 'Fait';
    u.na = u.statut === 'Non applicable';
    u.encours = u.statut === 'En cours';
    u.due = daysTo(u.datePrevue);
    u.retard = !u.fait && !u.na && u.due !== null && u.due < 0;
    u.urgent = !u.fait && !u.na && u.due !== null && u.due <= SEUILS.urgenceJours;
    return u;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.checklists) { d = lsData(); }
    var arr = d && Array.isArray(d.checklists) ? d.checklists : null;
    if (!arr || !arr.length) arr = DEMO;
    return arr.map(normRow);
  }
  /* ---- regroupement des items en checklists ---- */
  function legacyKey(row) { return 'LEG|' + norm(row.employe) + '|' + norm(row.dateArrivee); }
  function groupKeyOf(row) { return row.chkKey ? row.chkKey : legacyKey(row); }
  function rowInGroup(row, key) { return groupKeyOf(row) === String(key); }
  function numeroSort(row) {
    var m = /^CKL-(\d+)$/.exec(String(row.chkKey || ''));
    if (m) return Number(m[1]);
    var m2 = /^CHK-(\d+)$/.exec(String(row.numero || ''));
    return 100000 + (m2 ? Number(m2[1]) : (Number(row.id) || 0));
  }
  function buildGroups(rows) {
    var map = {};
    (rows || []).forEach(function (r) {
      var k = groupKeyOf(r);
      if (!map[k]) map[k] = [];
      map[k].push(r);
    });
    var out = Object.keys(map).map(function (k) {
      var items = map[k].slice().sort(function (a, b) {
        var na = /^CHK-(\d+)$/.exec(String(a.numero || '')), nb = /^CHK-(\d+)$/.exec(String(b.numero || ''));
        var va = na ? Number(na[1]) : (Number(a.id) || 0), vb = nb ? Number(nb[1]) : (Number(b.id) || 0);
        return va - vb;
      });
      var f = items[0];
      var titre = f.chkTitre || (f.employe ? 'Checklist d\u2019arrivée — ' + f.employe : 'Checklist sans employé');
      var modele = f.chkModele || (f.poste ? 'Modèle ' + f.poste : 'Modèle générique');
      var type = f.chkType || 'arrivee';
      var resp = f.chkResp || '';
      var nb = items.length, nbFait = 0, nbNA = 0, nbBloq = 0, nbUrg = 0, nbRet = 0, nbObl = 0, nbOblRest = 0, nbEnc = 0;
      items.forEach(function (it) {
        if (it.fait) nbFait++;
        if (it.na) nbNA++;
        if (it.bloquee) nbBloq++;
        if (it.urgent) nbUrg++;
        if (it.retard) nbRet++;
        if (it.encours) nbEnc++;
        if (it.obligatoire) { nbObl++; if (!it.fait && !it.na) nbOblRest++; }
      });
      var denom = nb - nbNA;
      var prog = denom > 0 ? Math.round(nbFait / denom * 100) : 100;
      var complete = nb > 0 && (nbFait + nbNA) === nb;
      return {
        key: k, numero: /^CKL-\d+$/.test(k) ? k : '', titre: titre, modele: modele, type: type,
        employe: f.employe, poste: f.poste, departement: f.departement, dateArrivee: f.dateArrivee,
        resp: resp, notes: f.chkNotes || '', cloturee: !!f.cloturee,
        items: items, nb: nb, nbFait: nbFait, nbNA: nbNA, nbEnc: nbEnc, nbRest: nb - nbFait - nbNA,
        nbBloq: nbBloq, nbUrg: nbUrg, nbRet: nbRet, nbObl: nbObl, nbOblRest: nbOblRest,
        prog: prog, complete: complete,
        nSort: numeroSort(f)
      };
    });
    return out;
  }
  function groups() { return buildGroups(data()); }
  function groupByKey(key) {
    var gs = groups();
    for (var i = 0; i < gs.length; i++) { if (String(gs[i].key) === String(key)) return gs[i]; }
    return null;
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextId(rows) { return rows.reduce(function (m, r) { return Math.max(m, Number(r.id) || 0); }, 0) + 1; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) { var m2 = /^CHK-(\d+)$/.exec(String(r.numero || '')); return Math.max(m, m2 ? Number(m2[1]) : 0); }, 0) + 1;
    var cand = 'CHK-' + String(mx).padStart(3, '0');
    while (rows.some(function (r) { return r.numero === cand; })) { mx++; cand = 'CHK-' + String(mx).padStart(3, '0'); }
    return cand;
  }
  function nextChkKey(rows) {
    var mx = rows.reduce(function (m, r) { var m2 = /^CKL-(\d+)$/.exec(String(r.chkKey || '')); return Math.max(m, m2 ? Number(m2[1]) : 0); }, 0) + 1;
    var cand = 'CKL-' + String(mx).padStart(3, '0');
    return cand;
  }
  function mutate(fn, actionLabel, detail) {
    var ok = false;
    var a = api();
    if (a && typeof a.setData === 'function' && typeof a.getData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (cur && Array.isArray(cur.checklists)) {
        var nv = fn({ checklists: cur.checklists });
        a.setData(nv);
        ok = true;
      }
    }
    if (!ok) {
      var ld = lsData();
      var base = ld && Array.isArray(ld.checklists) && ld.checklists.length ? ld.checklists.slice() : DEMO.slice();
      var nv2 = fn({ checklists: base });
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e3) { toast('Écriture impossible — stockage indisponible', 'err'); return false; }
      ok = true;
    }
    refresh(); setTimeout(refresh, 80); setTimeout(refresh, 350);
    if (actionLabel) jlog(actionLabel, detail || '');
    return true;
  }
  /* écriture ciblée sur UNE checklist (tous ses items portent les champs groupe) */
  function patchGroup(key, patch, actionLabel, detail) {
    return mutate(function (cur) {
      cur.checklists = cur.checklists.map(function (x) {
        if (!rowInGroup(normRow(x), key)) return x;
        var cp = {}; for (var k in x) cp[k] = x[k];
        for (var k2 in patch) cp[k2] = patch[k2];
        return cp;
      });
      return cur;
    }, actionLabel, detail || '');
  }

  /* ================= croisements optionnels (silencieux sinon) ================= */
  function retainedNames() {
    var out = [];
    try {
      var s = window.__ADMINA_SEL_API__;
      if (s && typeof s.getData === 'function') {
        var d = s.getData();
        (d.selections || []).forEach(function (r) { if (r && r.statut === 'Retenu' && r.candidat) out.push(String(r.candidat).trim()); });
      }
    } catch (e) {}
    if (!out.length) {
      try {
        var c = window.__ADMINA_CAND_API__;
        if (c && typeof c.getData === 'function') {
          var d2 = c.getData();
          (d2.candidats || []).forEach(function (r) { if (r && r.statut === 'Retenu') out.push(String((r.prenom || '') + ' ' + (r.nom || '')).trim()); });
        }
      } catch (e2) {}
    }
    return out.filter(function (x) { return x && x !== ' '; });
  }

  /* ================= alertes ================= */
  function computeAlerts(gs) {
    var out = [];
    var bloq = gs.filter(function (g) { return g.nbBloq > 0; });
    var nbBloqItems = gs.reduce(function (s, g) { return s + g.nbBloq; }, 0);
    if (nbBloqItems) out.push({ tone: 'err', txt: nbBloqItems + ' item' + (nbBloqItems > 1 ? 's' : '') + ' bloqué' + (nbBloqItems > 1 ? 's' : '') + ' dans ' + bloq.length + ' checklist' + (bloq.length > 1 ? 's' : '') + ' — débloquer pour relancer la progression (' + bloq.slice(0, 2).map(function (g) { return g.numero || g.titre; }).join(', ') + '…)', f: 'bloq' });
    var sous = gs.filter(function (g) { return !g.cloturee && !g.complete && g.nb - g.nbNA > 0 && g.prog < SEUILS.progressionCible; });
    if (sous.length) out.push({ tone: 'warn', txt: sous.length + ' checklist' + (sous.length > 1 ? 's' : '') + ' sous le seuil de progression (' + SEUILS.progressionCible + ' %) — la moins avancée : ' + (sous.slice().sort(function (a, b) { return a.prog - b.prog; })[0].numero || sous[0].titre) + ' à ' + pct(sous.slice().sort(function (a, b) { return a.prog - b.prog; })[0].prog), f: 'prog' });
    var urg = gs.filter(function (g) { return g.nbUrg > 0 || g.nbRet > 0; });
    var nbUrgItems = gs.reduce(function (s, g) { return s + g.nbUrg; }, 0);
    if (nbUrgItems) out.push({ tone: 'warn', txt: nbUrgItems + ' item' + (nbUrgItems > 1 ? 's' : '') + ' urgent' + (nbUrgItems > 1 ? 's' : '') + ' non coché' + (nbUrgItems > 1 ? 's' : '') + ' (échéance ≤ ' + SEUILS.urgenceJours + ' j ou dépassée) — ' + urg.slice(0, 2).map(function (g) { return g.numero || g.titre; }).join(', '), f: 'urg' });
    var noresp = gs.filter(function (g) { return !g.resp; });
    if (noresp.length) out.push({ tone: 'info', txt: noresp.length + ' checklist' + (noresp.length > 1 ? 's' : '') + ' sans responsable désigné — assigner un pilote (' + noresp.slice(0, 2).map(function (g) { return g.numero || g.titre; }).join(', ') + ')', f: 'noresp' });
    var ouvertes = gs.filter(function (g) { return g.complete && !g.cloturee; });
    if (ouvertes.length) out.push({ tone: 'ok', txt: ouvertes.length + ' checklist' + (ouvertes.length > 1 ? 's' : '') + ' complète' + (ouvertes.length > 1 ? 's' : '') + ' non clôturée' + (ouvertes.length > 1 ? 's' : '') + ' — vérifier les items obligatoires puis clôturer (' + ouvertes.slice(0, 2).map(function (g) { return g.numero || g.titre; }).join(', ') + ')', f: 'ouvre' });
    var retus = retainedNames();
    if (retus.length) {
      var sans = retus.filter(function (n) {
        return !gs.some(function (g) { return g.employe && norm(g.employe) === norm(n); });
      });
      if (sans.length) out.push({ tone: 'info', txt: sans.length + ' embauche' + (sans.length > 1 ? 's' : '') + ' confirmée' + (sans.length > 1 ? 's' : '') + ' sans checklist d\u2019arrivée — dupliquer un modèle (' + sans.slice(0, 2).join(', ') + '…)', f: 'cross' });
    }
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var gs = groups();
    var q = norm(UI.q);
    var out = gs.filter(function (g) {
      if (UI.flag === 'bloq' && !(g.nbBloq > 0)) return false;
      if (UI.flag === 'prog' && !(!g.cloturee && !g.complete && g.nb - g.nbNA > 0 && g.prog < SEUILS.progressionCible)) return false;
      if (UI.flag === 'urg' && !(g.nbUrg > 0)) return false;
      if (UI.flag === 'ret' && !(g.nbRet > 0)) return false;
      if (UI.flag === 'noresp' && g.resp) return false;
      if (UI.flag === 'ouvre' && !(g.complete && !g.cloturee)) return false;
      if (UI.kpi === 'prog' && !(!g.cloturee && !g.complete && g.nb - g.nbNA > 0 && g.prog < SEUILS.progressionCible)) return false;
      if (UI.kpi === 'bloq' && !(g.nbBloq > 0)) return false;
      if (UI.kpi === 'urg' && !(g.nbUrg > 0)) return false;
      if (UI.kpi === 'ret' && !(g.nbRet > 0)) return false;
      if (UI.kpi === 'clot' && !g.cloturee) return false;
      if (UI.chkstat === 'clot' && !g.cloturee) return false;
      if (UI.chkstat === 'encours' && g.cloturee) return false;
      if (UI.dept && norm(g.departement) !== norm(UI.dept)) return false;
      if (UI.modele && norm(g.modele) !== norm(UI.modele)) return false;
      if (UI.type && g.type !== UI.type) return false;
      if (UI.statut && !g.items.some(function (it) { return it.statut === UI.statut; })) return false;
      if (UI.cat && !g.items.some(function (it) { return norm(it.categorie) === norm(UI.cat); })) return false;
      if (q) {
        var inG = norm(g.titre).indexOf(q) > -1 || norm(g.modele).indexOf(q) > -1 || norm(g.numero).indexOf(q) > -1 ||
          norm(g.employe).indexOf(q) > -1 || norm(g.poste).indexOf(q) > -1 || norm(g.departement).indexOf(q) > -1 || norm(g.resp).indexOf(q) > -1;
        if (!inG) inG = g.items.some(function (it) {
          return norm(it.etape).indexOf(q) > -1 || norm(it.categorie).indexOf(q) > -1 || norm(it.responsable).indexOf(q) > -1 || norm(it.commentaires).indexOf(q) > -1 || norm(it.numero).indexOf(q) > -1;
        });
        if (!inG) return false;
      }
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'numero') { va = a.nSort; vb = b.nSort; }
      else if (k === 'nb') { va = a.nb; vb = b.nb; }
      else if (k === 'prog') { va = a.prog; vb = b.prog; }
      else if (k === 'bloq') { va = a.nbBloq; vb = b.nbBloq; }
      else if (k === 'urg') { va = a.nbUrg + a.nbRet; vb = b.nbUrg + b.nbRet; }
      else if (k === 'arrivee') { va = dateKey(a.dateArrivee); vb = dateKey(b.dateArrivee); }
      else if (k === 'statut') { va = a.cloturee ? 1 : 0; vb = b.cloturee ? 1 : 0; }
      else if (k === 'type') { va = a.type; vb = b.type; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.cat ? 1 : 0) + (UI.dept ? 1 : 0) + (UI.modele ? 1 : 0) + (UI.chkstat ? 1 : 0) + (UI.flag ? 1 : 0) + (UI.kpi ? 1 : 0) + (UI.type ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.cat = ''; UI.dept = ''; UI.modele = ''; UI.chkstat = ''; UI.flag = ''; UI.kpi = ''; UI.type = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Checklist\s+d.{0,2}Int[ée]gration/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-acl="root"]');
    if (!root) {
      root = h('section', { 'data-acl': 'root', class: 'acl-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-acl-page')) {
      page.setAttribute('data-acl-page', '1');
      page.setAttribute('data-acl-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-acl-hide')) {
      natif.setAttribute('data-acl-hide', '1');
      natif.setAttribute('data-acl-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-acl="root"]'); if (root) root.remove();
    $$('[data-acl-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-acl-oldw') || '';
      n.removeAttribute('data-acl-page');
      n.removeAttribute('data-acl-oldw');
    });
    $$('[data-acl-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-acl-olddisp') || '';
      n.removeAttribute('data-acl-hide');
      n.removeAttribute('data-acl-olddisp');
    });
    $$('[data-acl]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-acl="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'acl-btn acl-btn-primary acl-backbtn', 'data-acl': 'back' }, 'Revenir à la boîte à outils');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'checklist-integration');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    prog: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 17l5-6 4 3 5-8 4 5"/><path d="M3 21h18"/></svg>',
    seuils: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="2.6"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>'
  };
  var CLIP_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a3 3 0 0 1 6 0"/><path d="m9 13 2 2 4-4"/></svg>';

  function buildShell() {
    var root = $('[data-acl="root"]');
    if (!root || $('[data-acl="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="acl-hero" data-acl="hero">' + '<div class="acl-hero-main">' + '<div class="acl-hero-title">' + '<span class="acl-hero-ico" aria-hidden="true">' + CLIP_ICON + '</span>' + '<div><h2 class="acl-h2">Boîte à outils de l\u2019arrivée — Checklists d\u2019intégration</h2>' + '<p class="acl-hero-sub" data-acl="herosub"></p></div>' + '</div>' + '<div class="acl-hero-actions">' + '<button class="acl-btn" data-acl="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' + '<button class="acl-btn" data-acl="btn-prog" title="Progression & goulots (P)">' + ICO.prog + 'Progression</button>' + '<button class="acl-btn" data-acl="btn-seuils" title="Seuils de pilotage">' + ICO.seuils + 'Seuils</button>' + '<button class="acl-btn" data-acl="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' + '<button class="acl-btn" data-acl="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' + '<button class="acl-btn acl-btn-primary" data-acl="btn-new" title="Nouvelle checklist (N)">' + ICO.plus + 'Nouvelle checklist</button>' + '</div>' + '</div>' + '<div class="acl-hero-alerts" data-acl="alerts"></div>' + '</div>' +

      /* KPI */
      '<div class="acl-kpis" data-acl="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="acl-charts" data-acl="charts">' + '<div class="acl-chart-card"><div class="acl-chart-title">Items par statut</div><div class="acl-donut-wrap" data-acl="donut"></div></div>' + '<div class="acl-chart-card"><div class="acl-chart-title">Progression moyenne par modèle</div><div class="acl-bars" data-acl="bars"></div></div>' + '<div class="acl-chart-card"><div class="acl-chart-title">Items par catégorie</div><div class="acl-bars" data-acl="cats"></div></div>' + '</div>' +

      /* BARRE D'OUTILS */
      '<div class="acl-toolbar" data-acl="toolbar">' + '<div class="acl-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (checklist, employé, item, catégorie, responsable…)" data-acl="search" aria-label="Rechercher une checklist ou un item" /></div>' + '<select data-acl="f-statut" class="acl-sel" aria-label="Filtrer par statut des items"></select>' + '<select data-acl="f-cat" class="acl-sel" aria-label="Filtrer par catégorie d\u2019items"></select>' + '<select data-acl="f-dept" class="acl-sel" aria-label="Filtrer par département"></select>' + '<select data-acl="f-modele" class="acl-sel" aria-label="Filtrer par modèle de checklist"></select>' + '<select data-acl="f-chkstat" class="acl-sel" aria-label="Filtrer par statut de checklist"></select>' + '<button class="acl-chipbtn" data-acl="btn-reset" hidden>Réinitialiser</button>' + '<span class="acl-count" data-acl="count"></span>' + '<div class="acl-views" role="group" aria-label="Mode d\u2019affichage">' + '<button class="acl-vbtn" data-acl="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' + '<button class="acl-vbtn" data-acl="v-cards" title="Vue cartes (K)">' + ICO.cards + 'Cartes</button>' + '<button class="acl-vbtn" data-acl="v-checklist" title="Vue checklist — cocher en direct (C)">' + ICO.list + 'Checklist</button>' + '</div>' + '</div>' +

      /* CONTENU */
      '<div data-acl="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-acl="selbar"></div>' +

      /* PIED */
      '<div class="acl-foot">Checklists réutilisables · progression tracée (qui a coché, quand) · items bloqués remontés en alerte · journal d\u2019audit actif · seuils configurables · <button class="acl-link" data-acl="btn-native">Afficher le tableau natif</button></div>';

    $('[data-acl="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-acl="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-acl="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'checklist-integration'); window.print(); });
    $('[data-acl="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-acl="btn-prog"]', root).addEventListener('click', openProgression);
    $('[data-acl="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-acl="btn-native"]', root).addEventListener('click', showNative);
    $('[data-acl="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-acl="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-acl="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-acl="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.page = 0; refresh(); });
    $('[data-acl="f-cat"]', root).addEventListener('change', function (e) { UI.cat = e.target.value; UI.page = 0; refresh(); });
    $('[data-acl="f-dept"]', root).addEventListener('change', function (e) { UI.dept = e.target.value; UI.page = 0; refresh(); });
    $('[data-acl="f-modele"]', root).addEventListener('change', function (e) { UI.modele = e.target.value; UI.page = 0; refresh(); });
    $('[data-acl="f-chkstat"]', root).addEventListener('change', function (e) { UI.chkstat = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-acl="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-acl="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
    $('[data-acl="v-checklist"]', root).addEventListener('click', function () { setView('checklist'); });
  }

  function setView(v) { UI.view = v; saveUI(); refresh(); }

  /* ================= rendus dynamiques ================= */
  function heroStats() {
    var gs = groups();
    var nbItems = 0, nbFait = 0, nbNA = 0, nbBloq = 0, nbUrg = 0, nbRet = 0, nbClot = 0, progSum = 0, denom = 0;
    gs.forEach(function (g) {
      nbItems += g.nb; nbFait += g.nbFait; nbNA += g.nbNA; nbBloq += g.nbBloq; nbUrg += g.nbUrg; nbRet += g.nbRet;
      if (g.cloturee) nbClot++;
      if (g.nb - g.nbNA > 0) { progSum += g.prog; denom++; }
    });
    var progMoy = denom ? Math.round(progSum / denom) : 100;
    return { gs: gs, nb: gs.length, nbItems: nbItems, nbFait: nbFait, nbNA: nbNA, nbBloq: nbBloq, nbUrg: nbUrg, nbRet: nbRet, nbClot: nbClot, progMoy: progMoy };
  }

  function renderHero() {
    var st = heroStats();
    var sub = st.nb + ' checklist' + (st.nb > 1 ? 's' : '') +
      ' · ' + st.nbItems + ' item' + (st.nbItems > 1 ? 's' : '') +
      ' · progression moyenne ' + pct(st.progMoy) +
      ' · ' + st.nbBloq + ' bloqué' + (st.nbBloq > 1 ? 's' : '');
    if (st.nbUrg > 0) sub += ' · ' + st.nbUrg + ' urgent' + (st.nbUrg > 1 ? 's' : '');
    $('[data-acl="herosub"]').textContent = sub;
    var zone = $('[data-acl="alerts"]');
    var al = computeAlerts(st.gs);
    zone.innerHTML = al.map(function (a) {
      return '<button class="acl-alert ' + a.tone + '" data-acl="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.acl-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'bloq') UI.flag = 'bloq';
        else if (f === 'prog') UI.flag = 'prog';
        else if (f === 'urg') UI.flag = 'urg';
        else if (f === 'noresp') UI.flag = 'noresp';
        else if (f === 'ouvre') UI.flag = 'ouvre';
        else if (f === 'cross') { toast('Dupliquez un modèle de checklist et affectez-le à ces arrivées (bouton ⧉ sur une carte)', ''); }
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderKPIs() {
    var st = heroStats();
    var kpis = [
      { k: '', t: 'CHECKLISTS', v: String(st.nb), s: st.nbClot + ' clôturée' + (st.nbClot > 1 ? 's' : '') + ' · ' + st.nbItems + ' items', cls: '' },
      { k: 'prog', t: 'PROGRESSION MOY.', v: pct(st.progMoy), s: 'seuil cible ' + SEUILS.progressionCible + ' %', cls: '' },
      { k: 'bloq', t: 'ITEMS BLOQUÉS', v: String(st.nbBloq), s: st.nbBloq ? 'à débloquer d\u2019urgence' : 'aucun blocage', cls: st.nbBloq > 0 ? 'bad' : '' },
      { k: 'urg', t: 'URGENTS ≤ ' + SEUILS.urgenceJours + ' j', v: String(st.nbUrg), s: 'non cochés, échéance proche', cls: '' },
      { k: 'ret', t: 'EN RETARD', v: String(st.nbRet), s: 'date prévue dépassée', cls: st.nbRet > 0 ? 'bad' : '' },
      { k: 'clot', t: 'CLÔTURÉES', v: String(st.nbClot), s: 'sur ' + st.nb + ' checklist' + (st.nb > 1 ? 's' : ''), cls: '' }
    ];
    var zone = $('[data-acl="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="acl-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' + '<span class="acl-kpi-t">' + esc(k.t) + '</span>' + '<span class="acl-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' + '<span class="acl-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.acl-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.cat = ''; UI.dept = ''; UI.modele = ''; UI.chkstat = ''; UI.flag = ''; UI.type = ''; }
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
      var s = '<circle r="' + R + '" cx="60" cy="60" fill="none" stroke="' + p.c + '" stroke-width="17" ' + 'stroke-dasharray="' + Math.max(0, len - 1.2) + ' ' + (C - Math.max(0, len - 1.2)) + '" ' + 'stroke-dashoffset="' + (-off) + '" transform="rotate(-90 60 60)" />';
      off += len;
      return s;
    }).join('');
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Répartition des items par statut">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' + '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">' + esc(label || 'items') + '</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-acl="donut"]');
    var parts = STATUTS_ITEMS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length, 'items') +
      '<div class="acl-donut-legend">' + parts.map(function (p) {
        return '<span class="acl-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' + '<span class="acl-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="acl-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.acl-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.statut = UI.statut === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items, mode) {
    var mx = 0;
    items.forEach(function (it) { if (it.raw > mx) mx = it.raw; });
    if (!items.length) return '<div class="acl-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = mode === 'pct' ? Math.max(1.5, it.raw) : (mx > 0 ? Math.max(1.5, it.raw / mx * 100) : 2);
      var fillCls = mode === 'pct' ? (it.raw >= SEUILS.progressionCible ? '' : ' over') : '';
      return '<div class="acl-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0" title="' + esc(it.tip || it.name) + '">' + '<span class="acl-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' + '<span class="acl-bar-track"><span class="acl-bar-fill' + fillCls + '" style="width:' + w + '%"></span></span>' + '<span class="acl-bar-val">' + it.val + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var gs = groups();
    var z1 = $('[data-acl="bars"]');
    var byM = {};
    gs.forEach(function (g) {
      var m = g.modele || '—';
      if (!byM[m]) byM[m] = { sum: 0, d: 0, nb: 0 };
      if (g.nb - g.nbNA > 0) { byM[m].sum += g.prog; byM[m].d++; }
      byM[m].nb++;
    });
    var items1 = Object.keys(byM).map(function (m) {
      return { key: m, name: m, raw: byM[m].d ? Math.round(byM[m].sum / byM[m].d) : 100, val: pct(byM[m].d ? Math.round(byM[m].sum / byM[m].d) : 100), tip: byM[m].nb + ' checklist(s)' };
    }).sort(function (a, b) { return b.raw - a.raw; }).slice(0, 8);
    z1.innerHTML = barRowsHtml(items1, 'pct');
    $$('.acl-bar-row', z1).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.modele = UI.modele === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    var rows = data();
    var z2 = $('[data-acl="cats"]');
    var byC = {};
    rows.forEach(function (r) { var c = r.categorie || '—'; if (!byC[c]) byC[c] = { v: 0, rest: 0 }; byC[c].v++; if (!r.fait && !r.na) byC[c].rest++; });
    var items2 = Object.keys(byC).map(function (c) {
      return { key: c, name: c, raw: byC[c].v, val: byC[c].v + (byC[c].rest ? ' (' + byC[c].rest + ' à faire)' : ''), tip: '' };
    }).sort(function (a, b) { return b.raw - a.raw; }).slice(0, 8);
    z2.innerHTML = barRowsHtml(items2, 'count');
    $$('.acl-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.cat = UI.cat === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var gs = groups();
    var cats = {}, depts = {}, modes = {};
    gs.forEach(function (g) {
      if (g.departement) depts[g.departement] = 1;
      if (g.modele) modes[g.modele] = 1;
      g.items.forEach(function (it) { if (it.categorie) cats[it.categorie] = 1; });
    });
    var sel1 = $('[data-acl="f-statut"]');
    sel1.innerHTML = '<option value="">Statut items : tous</option>' + STATUTS_ITEMS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-acl="f-cat"]');
    sel2.innerHTML = '<option value="">Catégorie : toutes</option>' + Object.keys(cats).sort().map(function (c) {
      return '<option value="' + esc(c) + '"' + (UI.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');
    var sel3 = $('[data-acl="f-dept"]');
    sel3.innerHTML = '<option value="">Département : tous</option>' + Object.keys(depts).sort().map(function (c) {
      return '<option value="' + esc(c) + '"' + (UI.dept === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');
    var sel4 = $('[data-acl="f-modele"]');
    sel4.innerHTML = '<option value="">Modèle : tous</option>' + Object.keys(modes).sort().map(function (c) {
      return '<option value="' + esc(c) + '"' + (UI.modele === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');
    var sel5 = $('[data-acl="f-chkstat"]');
    sel5.innerHTML = '<option value="">Checklist : toutes</option>' + '<option value="encours"' + (UI.chkstat === 'encours' ? ' selected' : '') + '>En cours</option>' + '<option value="clot"' + (UI.chkstat === 'clot' ? ' selected' : '') + '>Clôturées</option>';
    $('[data-acl="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-acl="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + gs.length + ' checklists';
  }

  /* ================= chips & cellules ================= */
  function statutItemChip(it) {
    var sm = statutMeta(it.statut);
    return '<span class="acl-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function typeChip(g) {
    var t = typeMeta(g.type);
    return '<span class="acl-chip ' + (g.type === 'modele' ? 'info' : 'neutral') + '" title="Type de checklist">' + esc(t.lab) + '</span>';
  }
  function clotChip(g) {
    return g.cloturee
      ? '<span class="acl-chip ok" title="Checklist clôturée">' + ICO.lock + ' Clôturée</span>'
      : '<span class="acl-chip neutral" title="Checklist en cours">En cours</span>';
  }
  function progCell(g) {
    var cls = g.prog >= SEUILS.progressionCible ? '' : ' over';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="acl-progv' + (g.prog >= 100 ? ' full' : '') + '">' + g.prog + ' %</span>' + '<span class="acl-pbar' + cls + '" aria-hidden="true"><i style="width:' + g.prog + '%"></i></span></span>';
  }
  function badgeBloq(n) { return n > 0 ? '<span class="acl-chip err" title="Items bloqués">' + n + ' bloqué' + (n > 1 ? 's' : '') + '</span>' : '<span class="acl-chip neutral">0 bloqué</span>'; }
  function badgeUrg(g) {
    var s = [];
    if (g.nbUrg > 0) s.push('<span class="acl-chip warn" title="Items urgents non cochés">' + g.nbUrg + ' urgent' + (g.nbUrg > 1 ? 's' : '') + '</span>');
    if (g.nbRet > 0) s.push('<span class="acl-chip err" title="Items en retard">' + g.nbRet + ' retard</span>');
    return s.join(' ') || '<span class="acl-chip neutral">—</span>';
  }
  function actionsHtml(g) {
    return '<div class="acl-actions">' + '<button class="acl-ic" data-open="' + esc(g.key) + '" title="Fiche de la checklist">' + ICO.eye + '</button>' + '<button class="acl-ic" data-edit="' + esc(g.key) + '" title="Modifier">' + ICO.edit + '</button>' + '<button class="acl-ic" data-dup="' + esc(g.key) + '" title="Dupliquer (modèle réutilisable, items décochés)">' + ICO.dup + '</button>' + '<button class="acl-ic danger" data-del="' + esc(g.key) + '" title="Supprimer">' + ICO.del + '</button>' + '</div>';
  }

  /* ================= vue tableau ================= */
  function renderTable() {
    var rows = filtered();
    var st = heroStats();
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = key ? ' aria-sort="' + (key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none') + '"' : '';
      return '<th' + aria + ' ' + (key ? 'data-sort="' + key + '"' : '') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="acl-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'acl-th-chk') + th('N°', 'numero') + th('Checklist', 'titre') + th('Modèle', 'modele') + th('Type', 'type') +
      th('Employé', 'employe') + th('Poste', 'poste') + th('Département', 'dept') + th('Items', 'nb', 'acl-right') + th('Progression', 'prog') +
      th('Bloqués', 'bloq') + th('Urgents', 'urg') + th('Responsable', 'resp') + th('Arrivée', 'arrivee') + th('Statut', 'statut') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (g) {
      return '<tr data-id="' + esc(g.key) + '">' + '<td><input type="checkbox" class="acl-chk" data-chk="' + esc(g.key) + '"' + (UI.sel.indexOf(g.key) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(g.titre) + '"></td>' + '<td class="acl-num">' + esc(g.numero || 'héritée') + '</td>' + '<td><span class="acl-titre" data-open="' + esc(g.key) + '">' + esc(g.titre) + '</span></td>' + '<td>' + esc(g.modele) + '</td>' + '<td>' + typeChip(g) + '</td>' + '<td style="font-weight:600">' + esc(g.employe || '—') + '</td>' + '<td>' + esc(g.poste || '—') + '</td>' + '<td>' + (g.departement ? '<span class="acl-chip neutral">' + esc(g.departement) + '</span>' : '—') + '</td>' + '<td class="acl-right"><b>' + g.nbFait + '</b>/' + g.nb + (g.nbObl ? ' <span class="acl-chip gold" title="Items obligatoires">' + g.nbObl + ' oblig.</span>' : '') + '</td>' + '<td>' + progCell(g) + '</td>' + '<td>' + badgeBloq(g.nbBloq) + '</td>' + '<td>' + badgeUrg(g) + '</td>' + '<td>' + esc(g.resp || '—') + '</td>' + '<td class="acl-num">' + esc(g.dateArrivee || '—') + '</td>' + '<td>' + clotChip(g) + '</td>' + '<td>' + actionsHtml(g) + '</td></tr>';
    }).join('');
    var foot = '<tr class="acl-tfoot"><td></td><td colspan="15">TOTAL ' + st.nb + ' checklists · ' + st.nbItems + ' items · progression moyenne ' + pct(st.progMoy) + ' · ' + st.nbBloq + ' bloqué(s) · ' + st.nbClot + ' clôturée(s)</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="acl-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' + '<select class="acl-sel" data-acl="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' + '<button class="acl-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' + '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' + '<button class="acl-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-acl="content"]');
    card.innerHTML = '<div class="acl-tblcard"><div class="acl-tblwrap"><table class="acl-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="16"><div class="acl-empty">Aucune checklist ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    bindCommon(card);
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'titre' || k === 'numero' || k === 'employe' || k === 'modele' ? 1 : -1; }
        refresh();
      });
    });
    var perSel = $('[data-acl="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function bindCommon(card) {
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var k = c.getAttribute('data-chk');
        var i = UI.sel.indexOf(k);
        if (c.checked && i < 0) UI.sel.push(k);
        if (!c.checked && i > -1) UI.sel.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit')); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupGroup(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-acl="content"]');
    card.innerHTML = rows.length ? '<div class="acl-cards">' + rows.map(function (g) {
      return '<div class="acl-cardx' + (g.nbBloq > 0 ? ' bloq' : '') + '" data-id="' + esc(g.key) + '">' + '<div class="acl-card-top"><div><input type="checkbox" class="acl-chk" data-chk="' + esc(g.key) + '"' + (UI.sel.indexOf(g.key) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' + '<span class="acl-num">' + esc(g.numero || 'héritée') + '</span></div>' + '<span>' + typeChip(g) + ' ' + clotChip(g) + '</span></div>' + '<div class="acl-card-name" data-open="' + esc(g.key) + '">' + esc(g.titre) + '</div>' + '<div class="acl-card-total" style="font-size:.86rem">' + esc(g.modele) + '</div>' + '<div class="acl-card-struct">' + progCell(g) + '</div>' + '<div class="acl-card-meta">' + badgeBloq(g.nbBloq) + badgeUrg(g) +
        '<span class="acl-chip neutral">' + g.nbFait + '/' + g.nb + ' items</span>' +
        (g.nbObl ? '<span class="acl-chip gold">' + g.nbObl + ' oblig.</span>' : '') + '</div>' + '<div class="acl-card-meta"><span class="acl-chip info">' + esc(g.employe || 'Sans employé') + '</span>' +
        (g.departement ? '<span class="acl-chip neutral">' + esc(g.departement) + '</span>' : '') +
        '<span class="acl-chip neutral">' + esc(g.resp ? 'Resp. ' + g.resp : 'Sans responsable') + '</span></div>' + '<div class="acl-card-foot"><span class="acl-num">Arrivée ' + esc(g.dateArrivee || '—') + '</span>' + '<div class="acl-card-act">' + '<button class="acl-ic" data-open="' + esc(g.key) + '" title="Détail">' + ICO.eye + '</button>' + '<button class="acl-ic" data-edit="' + esc(g.key) + '" title="Modifier">' + ICO.edit + '</button>' + '<button class="acl-ic" data-dup="' + esc(g.key) + '" title="Dupliquer">' + ICO.dup + '</button>' + '<button class="acl-ic danger" data-del="' + esc(g.key) + '" title="Supprimer">' + ICO.del + '</button>' + '</div></div></div>';
    }).join('') + '</div>' : '<div class="acl-empty">Aucune checklist ne correspond aux filtres</div>';
    bindCommon(card);
  }

  /* ================= VUE CHECKLIST (signature) ================= */
  function itemLine(it) {
    var cls = 'acl-ckitem' + (it.fait ? ' fait' : '') + (it.na ? ' na' : '') + (it.bloquee ? ' bloq' : '') + (it.retard ? ' retard' : '') + (it.urgent ? ' urgent' : '');
    var trace = it.fait ? (it.faitPar ? 'coché par ' + esc(it.faitPar) : 'coché') + (it.dateRealisee ? ' le ' + esc(it.dateRealisee) : '') : '';
    var badges = '';
    if (it.obligatoire) badges += '<span class="acl-oblig" title="Item obligatoire — requis pour la clôture">★ obligatoire</span>';
    if (it.bloquee) badges += '<span class="acl-chip err" title="Item bloqué — nécessite une action">bloqué</span>';
    if (it.retard) badges += '<span class="acl-chip err" title="Date prévue dépassée">retard ' + Math.abs(it.due) + ' j</span>';
    else if (it.urgent) badges += '<span class="acl-chip warn" title="Échéance proche">≤ ' + it.due + ' j</span>';
    if (it.na) badges += '<span class="acl-chip info">non applicable</span>';
    return '<li class="' + cls + '" data-item="' + esc(it.id) + '">' + '<input type="checkbox" class="acl-ckcheck" data-check="' + esc(it.id) + '"' + (it.fait ? ' checked' : '') + ' aria-label="Cocher : ' + esc(it.etape) + '">' + '<div class="acl-ckmain">' + '<div class="acl-ckline1"><span class="acl-cklabel" data-open-item="' + esc(it.id) + '" title="Ouvrir la fiche de la checklist">' + esc(it.etape || '(item sans libellé)') + '</span>' + badges + '</div>' + '<div class="acl-ckmeta"><span class="acl-chip neutral">' + esc(it.categorie || '—') + '</span>' + '<span>' + esc(it.responsable || 'sans responsable') + '</span>' + '<span>prévue ' + esc(it.datePrevue || '—') + '</span>' +
          (trace ? '<span class="acl-trace">' + trace + '</span>' : '') +
          (it.commentaires ? '<span class="acl-cknote" title="' + esc(it.commentaires) + '">📝 ' + esc(it.commentaires) + '</span>' : '') +
        '</div>' + '</div>' + '<span class="acl-num">' + esc(it.numero || '') + '</span>' + '</li>';
  }

  function renderChecklist() {
    var rows = filtered();
    var card = $('[data-acl="content"]');
    card.innerHTML = rows.length ? '<div class="acl-cklist">' + rows.map(function (g) {
      var items = g.items;
      if (UI.statut) items = items.filter(function (it) { return it.statut === UI.statut; });
      if (UI.cat) items = items.filter(function (it) { return norm(it.categorie) === norm(UI.cat); });
      return '<div class="acl-ckcard' + (g.nbBloq > 0 ? ' bloq' : '') + (g.complete ? ' complete' : '') + (g.cloturee ? ' clot' : '') + '" data-id="' + esc(g.key) + '">' + '<div class="acl-ckhead">' + '<div class="acl-ckhead-main">' + '<div class="acl-ckline1"><input type="checkbox" class="acl-chk" data-chk="' + esc(g.key) + '"' + (UI.sel.indexOf(g.key) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(g.titre) + '">' + '<span class="acl-num">' + esc(g.numero || 'héritée') + '</span>' + typeChip(g) + clotChip(g) + '</div>' + '<div class="acl-cktitle" data-open="' + esc(g.key) + '" title="Ouvrir la fiche">' + esc(g.titre) + '</div>' + '<div class="acl-cksub">' + esc(g.modele) + (g.employe ? ' · ' + esc(g.employe) : '') + (g.departement ? ' · ' + esc(g.departement) : '') +
              (g.dateArrivee ? ' · arrivée ' + esc(g.dateArrivee) : '') + ' · ' + esc(g.resp ? 'resp. ' + g.resp : 'sans responsable') + '</div>' + '</div>' + '<div class="acl-ckhead-side">' + '<div class="acl-ckprog"><span class="acl-ckprog-v">' + g.prog + ' %</span>' + '<span class="acl-pbar' + (g.prog >= SEUILS.progressionCible ? '' : ' over') + '" aria-hidden="true"><i style="width:' + g.prog + '%"></i></span></div>' + '<div class="acl-ckprog-sub">' + g.nbFait + ' fait' + (g.nbFait > 1 ? 's' : '') + ' / ' + (g.nb - g.nbNA) + ' à faire' + (g.nbNA ? ' · ' + g.nbNA + ' n/a' : '') + (g.nbBloq ? ' · ' + g.nbBloq + ' bloqué(s)' : '') + '</div>' +
            actionsHtml(g) +
          '</div>' + '</div>' + '<ul class="acl-ckitems">' + items.map(itemLine).join('') + '</ul>' + '<div class="acl-ckfoot">' + '<button class="acl-btn acl-btn-ghost" data-cloture="' + esc(g.key) + '">' + (g.cloturee ? ICO.unlock + ' Réouvrir' : ICO.lock + ' Clôturer la checklist') + '</button>' + '<span class="acl-ckfoot-hint">' + (g.nbOblRest > 0 ? g.nbOblRest + ' item(s) obligatoire(s) restant(s) avant clôture' : (g.complete ? 'Tous les items sont traités' : 'Cochez directement — chaque coche est tracée')) + '</span>' + '</div>' + '</div>';
    }).join('') + '</div>' : '<div class="acl-empty">Aucune checklist ne correspond aux filtres</div>';
    bindCommon(card);
    $$('[data-check]', card).forEach(function (c) {
      c.addEventListener('change', function () { toggleItem(c.getAttribute('data-check'), c.checked); });
    });
    $$('[data-open-item]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var it = rowById(b.getAttribute('data-open-item'));
        if (it) openDrawer(groupKeyOf(it));
      });
    });
    $$('[data-cloture]', card).forEach(function (b) {
      b.addEventListener('click', function () { toggleCloture(b.getAttribute('data-cloture')); });
    });
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-acl="selbar"]');
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    var gs = groups().filter(function (g) { return UI.sel.indexOf(g.key) > -1; });
    var nbItems = gs.reduce(function (s, g) { return s + g.nb; }, 0);
    zone.innerHTML = '<div class="acl-selbar">' + '<span class="acl-selbar-info">' + gs.length + ' checklist' + (gs.length > 1 ? 's' : '') + ' sélectionnée' + (gs.length > 1 ? 's' : '') + '</span>' + '<span class="acl-selbar-sub">' + nbItems + ' items</span>' + '<button class="acl-btn acl-btn-ghost" data-sel="exp">Exporter</button>' + '<button class="acl-btn acl-btn-danger" data-sel="del">Supprimer</button>' + '<button class="acl-btn acl-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= mutations items ================= */
  function toggleItem(id, checked) {
    var it = rowById(id);
    if (!it) { toast('Item introuvable', 'err'); return; }
    if (checked === it.fait) return;
    mutate(function (cur) {
      cur.checklists = cur.checklists.map(function (x) {
        if (String(x.id) !== String(id)) return x;
        var cp = {}; for (var k in x) cp[k] = x[k];
        cp.statut = checked ? 'Fait' : 'A faire';
        cp.dateRealisee = checked ? todayFr() : '';
        cp.faitPar = checked ? 'RH' : '';
        return cp;
      });
      return cur;
    }, checked ? 'Item coché' : 'Item décoché', (it.numero || '') + ' ' + it.etape + ' — ' + (it.chkTitre || it.employe || 'checklist'));
    toast(checked ? 'Item coché — ' + it.etape : 'Item décoché — ' + it.etape, checked ? 'ok' : '');
    if (UI.drawerId) refreshDrawer();
  }
  function setItemStatut(id, statut) {
    var it = rowById(id);
    if (!it || it.statut === statut) return;
    var wasFait = it.fait;
    var nowFait = statut === 'Fait';
    mutate(function (cur) {
      cur.checklists = cur.checklists.map(function (x) {
        if (String(x.id) !== String(id)) return x;
        var cp = {}; for (var k in x) cp[k] = x[k];
        cp.statut = statut;
        if (nowFait && !wasFait) { cp.dateRealisee = todayFr(); cp.faitPar = 'RH'; }
        if (!nowFait && wasFait) { cp.dateRealisee = ''; cp.faitPar = ''; }
        return cp;
      });
      return cur;
    }, 'Statut item modifié', (it.numero || '') + ' ' + it.etape + ' → ' + statutMeta(statut).lab);
    toast('Item : ' + statutMeta(statut).lab, 'ok');
    if (UI.drawerId) refreshDrawer();
  }
  function toggleBloqItem(id) {
    var it = rowById(id);
    if (!it) return;
    var nv = !it.bloquee;
    mutate(function (cur) {
      cur.checklists = cur.checklists.map(function (x) {
        if (String(x.id) !== String(id)) return x;
        var cp = {}; for (var k in x) cp[k] = x[k];
        cp.bloquee = nv;
        return cp;
      });
      return cur;
    }, nv ? 'Item bloqué' : 'Item débloqué', (it.numero || '') + ' ' + it.etape);
    toast(nv ? 'Item marqué bloqué — il remonte en alerte' : 'Item débloqué', nv ? 'err' : 'ok');
    if (UI.drawerId) refreshDrawer();
  }
  function setItemNote(id, note) {
    var it = rowById(id);
    if (!it || it.commentaires === note) return;
    mutate(function (cur) {
      cur.checklists = cur.checklists.map(function (x) {
        if (String(x.id) !== String(id)) return x;
        var cp = {}; for (var k in x) cp[k] = x[k];
        cp.commentaires = note;
        return cp;
      });
      return cur;
    }, 'Note item modifiée', (it.numero || '') + ' ' + it.etape);
  }
  function toggleCloture(key) {
    var g = groupByKey(key);
    if (!g) return;
    if (!g.cloturee) {
      if (g.nbOblRest > 0) {
        var miss = g.items.filter(function (it) { return it.obligatoire && !it.fait && !it.na; }).map(function (it) { return it.etape; });
        toast('Clôture impossible — ' + g.nbOblRest + ' item(s) obligatoire(s) non coché(s) : ' + miss.slice(0, 3).join(', ') + (miss.length > 3 ? '…' : ''), 'err');
        return;
      }
      patchGroup(key, { cloturee: true }, 'Checklist clôturée', g.numero + ' ' + g.titre);
      toast('Checklist clôturée — arrivée complète', 'ok');
    } else {
      patchGroup(key, { cloturee: false }, 'Checklist réouverte', g.numero + ' ' + g.titre);
      toast('Checklist réouverte', '');
    }
    if (UI.drawerId) refreshDrawer();
  }
  function saveGroupResp(key, resp) {
    var g = groupByKey(key);
    if (!g) return;
    patchGroup(key, { chkResp: resp }, 'Responsable de checklist modifié', g.numero + ' → ' + (resp || '—'));
    toast('Responsable enregistré', 'ok');
    if (UI.drawerId) refreshDrawer();
  }
  function saveGroupNotes(key, notes) {
    var g = groupByKey(key);
    if (!g) return;
    patchGroup(key, { chkNotes: notes }, 'Notes de checklist modifiées', g.numero);
    toast('Notes enregistrées', 'ok');
  }

  /* ================= drawer fiche checklist =================
     Anti stale-closure (leçon M26) : chaque handler RELIT l'état courant
     via groupByKey / rowById au moment du clic, jamais la variable r
     capturée à l'ouverture. */
  function closeDrawer() { $$('[data-acl="drawer"],[data-acl="backdrop"][data-acl-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function refreshDrawer() {
    var dr = $('[data-acl="drawer"]');
    if (!dr || !UI.drawerId) return;
    var body = $('.acl-drawer-body', dr);
    var st = body ? body.scrollTop : 0;
    openDrawer(UI.drawerId, true);
    var nb = $('.acl-drawer-body', $('[data-acl="drawer"]'));
    if (nb) nb.scrollTop = st;
  }
  function openDrawer(key, quiet) {
    var g = groupByKey(key);
    if (!g) { closeDrawer(); return; }
    closeDrawer();
    UI.drawerId = String(key);
    var bd = h('div', { class: 'acl-backdrop', 'data-acl': 'backdrop', 'data-acl-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var dr = h('aside', { class: 'acl-drawer', 'data-acl': 'drawer', role: 'dialog', 'aria-label': 'Fiche ' + g.titre });
    var itemsHtml = g.items.map(function (it) {
      var trace = it.fait ? (it.faitPar ? 'coché par ' + esc(it.faitPar) : 'coché') + (it.dateRealisee ? ' le ' + esc(it.dateRealisee) : '') : 'non coché';
      return '<div class="acl-ditem' + (it.bloquee ? ' bloq' : '') + '" data-item="' + esc(it.id) + '">' + '<div class="acl-ditem-l1">' + '<input type="checkbox" class="acl-ckcheck" data-check="' + esc(it.id) + '"' + (it.fait ? ' checked' : '') + ' aria-label="Cocher : ' + esc(it.etape) + '">' + '<span class="acl-cklabel">' + esc(it.etape || '(sans libellé)') + '</span>' +
          (it.obligatoire ? '<span class="acl-oblig">★</span>' : '') +
          '<select class="acl-in acl-stat-sel" data-stat="' + esc(it.id) + '" aria-label="Statut de l\u2019item">' +
            STATUTS_ITEMS.map(function (s) { return '<option value="' + esc(s.k) + '"' + (s.k === it.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>'; }).join('') +
          '</select>' + '<button class="acl-ic' + (it.bloquee ? ' danger' : '') + '" data-bloq="' + esc(it.id) + '" title="' + (it.bloquee ? 'Débloquer' : 'Marquer bloqué') + '">' + (it.bloquee ? ICO.unlock : ICO.lock) + '</button>' + '</div>' + '<div class="acl-ditem-l2">' + '<span class="acl-chip neutral">' + esc(it.categorie || '—') + '</span>' + '<span class="acl-num">' + esc(it.numero || '') + '</span>' + '<span>prévue ' + esc(it.datePrevue || '—') + (it.retard ? ' <b class="acl-red">retard ' + Math.abs(it.due) + ' j</b>' : '') + '</span>' + '<span>' + trace + '</span>' + '</div>' + '<div class="acl-ditem-l3"><input class="acl-in" data-note="' + esc(it.id) + '" value="' + esc(it.commentaires) + '" placeholder="Note sur cet item (matériel attendu, précision…)" aria-label="Note de l\u2019item"></div>' + '</div>';
    }).join('');
    dr.innerHTML =
      '<div class="acl-drawer-head"><div><div class="acl-drawer-title">' + esc(g.titre) + '</div>' + '<div class="acl-drawer-sub">' + esc(g.numero || 'checklist héritée du tableau natif') + ' · ' + esc(typeMeta(g.type).lab) + ' · ' + esc(g.modele) + '</div></div>' + '<button class="acl-drawer-x" aria-label="Fermer">✕</button></div>' + '<div class="acl-drawer-body">' + '<div class="acl-live" style="margin-top:0"><span>Progression <b>' + g.prog + ' %</b></span>' + '<span>Items <b>' + g.nbFait + '/' + g.nb + '</b></span>' + '<span>Bloqués <b' + (g.nbBloq ? ' class="bad"' : '') + '>' + g.nbBloq + '</b></span>' + '<span>Urgents <b>' + g.nbUrg + '</b></span>' + '<span>' + (g.cloturee ? '<b class="good">Clôturée</b>' : 'En cours') + '</span></div>' + '<div class="acl-drawer-actions" style="margin:10px 0 2px">' + '<button class="acl-btn acl-btn-primary" data-act="cloture">' + (g.cloturee ? 'Réouvrir la checklist' : 'Clôturer la checklist') + '</button>' + '</div>' +
        (g.cloturee ? '' : (g.nbOblRest > 0 ? '<div class="acl-form-warn">' + g.nbOblRest + ' item(s) obligatoire(s) restant(s) avant clôture</div>' : '')) +
        '<div class="acl-fsec">Responsable & arrivée</div>' + '<dl class="acl-kv">' + '<dt>Employé</dt><dd>' + esc(g.employe || '— (modèle)') + '</dd>' + '<dt>Poste</dt><dd>' + esc(g.poste || '—') + '</dd>' + '<dt>Département</dt><dd>' + esc(g.departement || '—') + '</dd>' + '<dt>Date d\u2019arrivée</dt><dd>' + esc(g.dateArrivee || '—') + '</dd>' + '</dl>' + '<div class="acl-sim-row" style="margin-bottom:10px"><label for="acl-resp">Responsable de la checklist</label>' + '<input id="acl-resp" class="acl-in" data-acl="resp" value="' + esc(g.resp) + '" placeholder="Ex. RH, IT, Sécurité…">' + '<button class="acl-btn acl-btn-ghost" data-act="resp">Enregistrer</button></div>' + '<div class="acl-fsec">Items (' + g.nb + ')</div>' + '<div class="acl-ditems">' + itemsHtml + '</div>' + '<div class="acl-fsec">Notes de la checklist</div>' + '<textarea class="acl-notebox" data-acl="note" placeholder="Contexte de l\u2019arrivée, accueil, remarques…">' + esc(g.notes) + '</textarea>' + '<div class="acl-drawer-actions">' + '<button class="acl-btn acl-btn-ghost" data-act="note">Enregistrer les notes</button>' + '<button class="acl-btn acl-btn-ghost" data-act="edit">Modifier</button>' + '<button class="acl-btn acl-btn-ghost" data-act="dup">Dupliquer</button>' + '<button class="acl-btn acl-btn-danger" data-act="del">Supprimer</button>' + '</div>' + '</div>';
    $('.acl-drawer-x', dr).addEventListener('click', closeDrawer);
    /* handlers : relecture de l'état courant à chaque interaction */
    $$('[data-check]', dr).forEach(function (c) { c.addEventListener('change', function () { toggleItem(c.getAttribute('data-check'), c.checked); }); });
    $$('[data-stat]', dr).forEach(function (s) {
      s.addEventListener('change', function () {
        var id = s.getAttribute('data-stat');
        var it = rowById(id);
        if (!it || it.statut === s.value) return;
        setItemStatut(id, s.value);
      });
    });
    $$('[data-bloq]', dr).forEach(function (b) { b.addEventListener('click', function () { toggleBloqItem(b.getAttribute('data-bloq')); }); });
    $$('[data-note]', dr).forEach(function (n) {
      n.addEventListener('change', function () { setItemNote(n.getAttribute('data-note'), n.value); });
    });
    $('[data-act="cloture"]', dr).addEventListener('click', function () { toggleCloture(UI.drawerId); });
    $('[data-act="resp"]', dr).addEventListener('click', function () {
      var v = $('[data-acl="resp"]', dr).value.trim();
      var g2 = groupByKey(UI.drawerId);
      if (g2 && g2.resp === v) return;
      saveGroupResp(UI.drawerId, v);
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-acl="note"]', dr).value;
      var g2 = groupByKey(UI.drawerId);
      if (g2 && g2.notes === v) return;
      saveGroupNotes(UI.drawerId, v);
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(UI.drawerId); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupGroup(UI.drawerId); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(UI.drawerId); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    if (!quiet) jlog('Ouverture fiche checklist', g.numero + ' ' + g.titre);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-acl="dialog"],[data-acl="backdrop"][data-acl-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editKey = null; }
  function openDialog(editKey) {
    closeDialog();
    var g = editKey ? groupByKey(editKey) : null;
    UI.dialogOpen = true;
    UI.editKey = editKey || null;
    var bd = h('div', { class: 'acl-backdrop', 'data-acl': 'backdrop', 'data-acl-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'acl-dialog', 'data-acl': 'dialog', role: 'dialog', 'aria-label': g ? 'Modifier la checklist' : 'Nouvelle checklist' });
    var itemRows = (g ? g.items : [{ categorie: 'Documents administratifs', obligatoire: true }]).map(function (it) { return { id: it.id || '', libelle: it.etape || '', categorie: it.categorie || 'Documents administratifs', responsable: it.responsable || '', datePrevue: it.datePrevue || '', obligatoire: !!it.obligatoire, note: it.commentaires || '' }; });
    function itemRowHtml(it, i) {
      return '<div class="acl-itrow" data-i="' + i + '"' + (it.id ? ' data-id="' + esc(it.id) + '"' : '') + '>' + '<input class="acl-in" data-if="libelle" value="' + esc(it.libelle) + '" placeholder="Libellé de l\u2019item * (ex. Dossier administratif complet)" aria-label="Libellé de l\u2019item">' + '<select class="acl-in" data-if="categorie" aria-label="Catégorie">' +
          CATS.map(function (c) { return '<option value="' + esc(c) + '"' + (c === it.categorie ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') +
        '</select>' + '<input class="acl-in" data-if="responsable" value="' + esc(it.responsable) + '" placeholder="Responsable" aria-label="Responsable de l\u2019item">' + '<input class="acl-in" data-if="datePrevue" value="' + esc(it.datePrevue) + '" placeholder="jj/mm/aaaa" aria-label="Date prévue">' + '<label class="acl-itoblig" title="Item obligatoire : requis pour clôturer la checklist"><input type="checkbox" data-if="obligatoire"' + (it.obligatoire ? ' checked' : '') + '> oblig.</label>' + '<button class="acl-ic danger" data-irow-del="' + i + '" title="Retirer cet item">✕</button>' + '</div>';
    }
    dlg.innerHTML =
      '<div class="acl-dialog-head"><h3>' + (g ? 'Modifier la checklist ' + esc(g.numero || '') : 'Nouvelle checklist d\u2019intégration') + '</h3>' + '<button class="acl-drawer-x" aria-label="Fermer">✕</button></div>' + '<div class="acl-dialog-body">' + '<div class="acl-fgrid">' + '<label class="acl-lab full">Titre de la checklist *<input class="acl-in" data-f="titre" value="' + esc(g ? g.titre : '') + '" placeholder="Ex. Checklist d\u2019arrivée — Développeur Full Stack"></label>' + '<label class="acl-lab">Type<select class="acl-in" data-f="type">' + TYPES.map(function (t) {
            return '<option value="' + t.k + '"' + ((g ? g.type : 'arrivee') === t.k ? ' selected' : '') + '>' + esc(t.lab) + '</option>';
          }).join('') + '</select></label>' + '<label class="acl-lab">Modèle *<input class="acl-in" data-f="modele" value="' + esc(g ? g.modele : '') + '" placeholder="Ex. Modèle Développeur Full Stack" list="acl-modeles"><datalist id="acl-modeles">' +
            (function () { var s = {}; groups().forEach(function (gg) { s[gg.modele] = 1; }); return Object.keys(s).sort().map(function (m) { return '<option value="' + esc(m) + '">'; }).join(''); })() +
          '</datalist></label>' + '<label class="acl-lab">Employé concerné<input class="acl-in" data-f="employe" value="' + esc(g ? g.employe : '') + '" placeholder="Requis pour une arrivée, vide pour un modèle"></label>' + '<label class="acl-lab">Poste<input class="acl-in" data-f="poste" value="' + esc(g ? g.poste : '') + '" placeholder="Ex. Développeur Full Stack"></label>' + '<label class="acl-lab">Département<input class="acl-in" data-f="departement" value="' + esc(g ? g.departement : '') + '" placeholder="Ex. Informatique"></label>' + '<label class="acl-lab">Date d\u2019arrivée<input class="acl-in" data-f="dateArrivee" value="' + esc(g ? g.dateArrivee : '') + '" placeholder="jj/mm/aaaa"></label>' + '<label class="acl-lab">Responsable de la checklist<input class="acl-in" data-f="resp" value="' + esc(g ? g.resp : '') + '" placeholder="Ex. RH"></label>' + '</div>' + '<div class="acl-fsec" style="display:flex;align-items:center;gap:8px">Items de la checklist' + '<button class="acl-btn acl-btn-ghost" data-act="additem" type="button">' + ICO.plus + 'Ajouter un item</button></div>' + '<div class="acl-items-edit" data-acl="items-edit">' + itemRows.map(itemRowHtml).join('') + '</div>' + '<div class="acl-live" data-acl="dlg-live"></div>' + '<div data-acl="dlg-err"></div>' + '</div>' + '<div class="acl-dialog-foot"><span class="acl-form-hint">Exhaustivité d\u2019abord : les items ★ obligatoires bloquent la clôture · chaque coche est tracée (qui, quand)</span>' + '<span style="display:flex;gap:8px"><button class="acl-btn acl-btn-ghost" data-act="cancel" style="color:var(--acl-text);border-color:var(--acl-line)">Annuler</button>' + '<button class="acl-btn acl-btn-primary" data-act="save">' + (g ? 'Enregistrer' : 'Créer la checklist') + '</button></span></div>';
    $('.acl-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function readItems() {
      return $$('.acl-itrow', dlg).map(function (row) {
        return {
          id: row.getAttribute('data-id') || '',
          libelle: ($('[data-if="libelle"]', row) || {}).value || '',
          categorie: ($('[data-if="categorie"]', row) || {}).value || '',
          responsable: ($('[data-if="responsable"]', row) || {}).value || '',
          datePrevue: ($('[data-if="datePrevue"]', row) || {}).value || '',
          obligatoire: !!($('[data-if="obligatoire"]', row) || {}).checked,
          note: ''
        };
      });
    }
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var its = readItems();
      var nObl = its.filter(function (x) { return x.obligatoire; }).length;
      var emOk = !String(val.dateArrivee || '').trim() || dateFrOk(val.dateArrivee);
      $('[data-acl="dlg-live"]', dlg).innerHTML =
        '<span>Type <b>' + esc(typeMeta(val.type).lab) + '</b></span>' + '<span>Items <b>' + its.length + '</b></span>' + '<span>Dont obligatoires <b>' + nObl + '</b></span>' +
        (val.employe ? '<span>Employé <b>' + esc(val.employe) + '</b></span>' : '<span class="bad">Modèle sans employé (réutilisable)</span>') +
        (!emOk ? '<span class="bad">⚠ Date d\u2019arrivée invalide (jj/mm/aaaa)</span>' : '');
    }
    dlg.addEventListener('input', live);
    dlg.addEventListener('change', live);
    $('[data-act="additem"]', dlg).addEventListener('click', function () {
      var zone = $('[data-acl="items-edit"]', dlg);
      var div = h('div', {});
      div.innerHTML = itemRowHtml({ categorie: 'Documents administratifs' }, $$('[data-irow-del]', dlg).length + 1000);
      var row = div.firstElementChild;
      row.removeAttribute('data-id');
      zone.appendChild(row);
      var del = $('[data-irow-del]', row);
      del.addEventListener('click', function () { row.remove(); live(); });
      var inp = $('[data-if="libelle"]', row);
      if (inp) inp.focus();
      live();
    });
    $$('[data-irow-del]', dlg).forEach(function (b) {
      b.addEventListener('click', function () { b.closest('.acl-itrow').remove(); live(); });
    });
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-acl="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="acl-form-err">' + esc(msg) + '</div>'; }
      var titre = String(val.titre || '').trim();
      if (!titre) return fail('Le titre de la checklist est obligatoire.');
      var type = val.type === 'modele' ? 'modele' : 'arrivee';
      var employe = String(val.employe || '').trim();
      if (type === 'arrivee' && !employe) return fail('L\u2019employé est obligatoire pour une checklist d\u2019arrivée (sinon choisir « Modèle réutilisable »).');
      var dA = String(val.dateArrivee || '').trim();
      if (dA && !dateFrOk(dA)) return fail('La date d\u2019arrivée doit être au format jj/mm/aaaa.');
      var items = readItems();
      if (!items.length) return fail('Ajoutez au moins un item à la checklist.');
      for (var ii = 0; ii < items.length; ii++) {
        if (!String(items[ii].libelle || '').trim()) return fail('Chaque item doit avoir un libellé (ligne ' + (ii + 1) + ').');
        var dp = String(items[ii].datePrevue || '').trim();
        if (dp && !dateFrOk(dp)) return fail('La date prévue de l\u2019item ' + (ii + 1) + ' doit être au format jj/mm/aaaa.');
      }
      var modele = String(val.modele || '').trim() || (val.poste ? 'Modèle ' + val.poste : 'Modèle générique');
      var grp = { chkTitre: titre, chkType: type, chkModele: modele, chkResp: String(val.resp || '').trim(), employe: employe, poste: String(val.poste || '').trim(), departement: String(val.departement || '').trim(), dateArrivee: dA };
      if (editKey) {
        mutate(function (cur) {
          var kept = {};
          items.forEach(function (it) { if (it.id) kept[String(it.id)] = it; });
          var newRows = [];
          /* migration : tous les items du groupe reçoivent un chkKey stable
             (les groupes hérités du natif, clé LEG|…, deviennent CKL-xxx) */
          var chk = /^CKL-/.test(String(editKey)) ? String(editKey) : nextChkKey(cur.checklists);
          cur.checklists = cur.checklists.filter(function (x) {
            var nr = normRow(x);
            if (!rowInGroup(nr, editKey)) return true;
            if (!kept[String(x.id)]) return false; /* item retiré */
            var cp = {}; for (var k in x) cp[k] = x[k];
            var it = kept[String(x.id)];
            cp.etape = String(it.libelle).trim();
            cp.categorie = it.categorie;
            cp.responsable = it.responsable;
            cp.datePrevue = it.datePrevue;
            cp.obligatoire = it.obligatoire;
            for (var k2 in grp) cp[k2] = grp[k2];
            cp.chkKey = chk;
            return true;
          });
          items.forEach(function (it) {
            if (it.id) return;
            var nr = {
              id: nextId(cur.checklists.concat(newRows)), numero: nextNumero(cur.checklists.concat(newRows)),
              statut: 'A faire', dateRealisee: '', faitPar: '', bloquee: false, commentaires: '', chkKey: chk
            };
            for (var k3 in grp) nr[k3] = grp[k3];
            nr.etape = String(it.libelle).trim();
            nr.categorie = it.categorie; nr.responsable = it.responsable; nr.datePrevue = it.datePrevue; nr.obligatoire = it.obligatoire;
            newRows.push(nr);
          });
          cur.checklists = cur.checklists.concat(newRows);
          return cur;
        }, 'Checklist modifiée', titre);
        toast('Checklist mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var chkKey = nextChkKey(cur.checklists);
          items.forEach(function (it) {
            var nr = {
              id: nextId(cur.checklists), numero: nextNumero(cur.checklists),
              employe: employe, poste: grp.poste, departement: grp.departement, dateArrivee: dA,
              categorie: it.categorie, etape: String(it.libelle).trim(), responsable: it.responsable,
              datePrevue: it.datePrevue, dateRealisee: '', statut: 'A faire', commentaires: '',
              chkKey: chkKey, chkTitre: titre, chkModele: modele, chkType: type, chkResp: grp.chkResp, chkNotes: '',
              cloturee: false, bloquee: false, obligatoire: it.obligatoire, faitPar: ''
            };
            cur.checklists.push(nr);
          });
          return cur;
        }, 'Checklist créée', titre + ' (' + items.length + ' items)');
        toast('Checklist créée — ' + items.length + ' item(s)', 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="titre"]', dlg);
    if (first) first.focus();
    live();
  }

  /* ================= duplication / suppression =================
     Duplication = modèle réutilisable : items décochés, traçage
     réinitialisé (statut, dates, auteur, blocages, notes d'items). */
  function dupGroup(key) {
    var g = groupByKey(key);
    if (!g) return;
    mutate(function (cur) {
      var chkKey = nextChkKey(cur.checklists);
      var titre = g.titre + ' — copie';
      g.items.forEach(function (it) {
        cur.checklists.push({
          id: nextId(cur.checklists), numero: nextNumero(cur.checklists),
          employe: '', poste: g.poste, departement: g.departement, dateArrivee: '',
          categorie: it.categorie, etape: it.etape, responsable: it.responsable,
          datePrevue: it.datePrevue, dateRealisee: '', statut: 'A faire', commentaires: '',
          chkKey: chkKey, chkTitre: titre, chkModele: g.modele, chkType: 'modele', chkResp: '', chkNotes: '',
          cloturee: false, bloquee: false, obligatoire: it.obligatoire, faitPar: ''
        });
      });
      return cur;
    }, 'Checklist dupliquée', g.numero + ' → modèle réutilisable (' + g.nb + ' items décochés)');
    toast('Checklist dupliquée — items décochés, à affecter à une nouvelle arrivée', 'ok');
  }
  function closeConfirm() { $$('[data-acl="confirm"],[data-acl="backdrop"][data-acl-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(key) {
    var g = groupByKey(key);
    if (!g) return;
    closeConfirm();
    var bd = h('div', { class: 'acl-backdrop', 'data-acl': 'backdrop', 'data-acl-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'acl-confirm', 'data-acl': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette checklist ?</h4><p>' + esc(g.numero || g.titre) + ' — ' + esc(g.titre) + ' (' + g.nb + ' item' + (g.nb > 1 ? 's' : '') + ', progression ' + g.prog + ' %). Cette action est définitive.</p>' + '<div class="acl-confirm-row"><button class="acl-btn acl-btn-ghost" data-a="no" style="color:var(--acl-text);border-color:var(--acl-line)">Annuler</button>' + '<button class="acl-btn acl-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.checklists = cur.checklists.filter(function (x) { return !rowInGroup(normRow(x), key); }); return cur; }, 'Checklist supprimée', g.numero + ' ' + g.titre);
      UI.sel = UI.sel.filter(function (x) { return x !== String(key); });
      closeConfirm(); closeDrawer();
      toast('Checklist supprimée (' + g.nb + ' items)', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(keys) {
    closeConfirm();
    var gs = groups().filter(function (g) { return keys.indexOf(g.key) > -1; });
    if (!gs.length) return;
    var nbItems = gs.reduce(function (s, g) { return s + g.nb; }, 0);
    var title = gs.length > 1 ? ('Supprimer ' + gs.length + ' checklists ?') : 'Supprimer 1 checklist ?';
    var bd = h('div', { class: 'acl-backdrop', 'data-acl': 'backdrop', 'data-acl-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'acl-confirm', 'data-acl': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + gs.map(function (g) { return esc(g.numero || g.titre); }).join(', ') + ' — ' + nbItems + ' items au total. Cette action est définitive.</p>' + '<div class="acl-confirm-row"><button class="acl-btn acl-btn-ghost" data-a="no" style="color:var(--acl-text);border-color:var(--acl-line)">Annuler</button>' + '<button class="acl-btn acl-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.checklists = cur.checklists.filter(function (x) { return keys.indexOf(groupKeyOf(normRow(x))) < 0; }); return cur; }, 'Suppression groupée', gs.length + ' checklists (' + nbItems + ' items)');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(gs.length + ' checklist(s) supprimée(s)', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= panneau progression ================= */
  function closeProgression() { $$('[data-acl="prog"],[data-acl="backdrop"][data-acl-for="prog"]').forEach(function (n) { n.remove(); }); }
  function openProgression() {
    closeProgression();
    var gs = groups();
    var st = heroStats();
    var bd = h('div', { class: 'acl-backdrop', 'data-acl': 'backdrop', 'data-acl-for': 'prog' });
    bd.addEventListener('click', closeProgression);
    var p = h('div', { class: 'acl-panel', 'data-acl': 'prog', role: 'dialog', 'aria-label': 'Progression des checklists' });
    var byM = {};
    gs.forEach(function (g) {
      var m = g.modele || '—';
      if (!byM[m]) byM[m] = { sum: 0, d: 0, nb: 0, bloq: 0 };
      if (g.nb - g.nbNA > 0) { byM[m].sum += g.prog; byM[m].d++; }
      byM[m].nb++; byM[m].bloq += g.nbBloq;
    });
    var mx = Math.max.apply(null, Object.keys(byM).map(function (m) { return byM[m].d ? Math.round(byM[m].sum / byM[m].d) : 100; }).concat([1]));
    var bars1 = Object.keys(byM).map(function (m) {
      var avg = byM[m].d ? Math.round(byM[m].sum / byM[m].d) : 100;
      return '<div class="acl-sim-arow"><span style="min-width:170px;font-weight:700" title="' + esc(m) + '">' + esc(m) + '</span>' + '<span class="acl-bar-track"><span class="acl-bar-fill' + (avg < SEUILS.progressionCible ? ' over' : '') + '" style="width:' + Math.max(avg ? 4 : 0, avg / mx * 100) + '%"></span></span>' + '<span><b>' + pct(avg) + '</b> · ' + byM[m].nb + ' checklist(s)' + (byM[m].bloq ? ' · ' + byM[m].bloq + ' bloqué(s)' : '') + '</span></div>';
    }).join('');
    var rows = data();
    var byC = {};
    rows.forEach(function (r) { if (!r.fait && !r.na) { var c = r.categorie || '—'; if (!byC[c]) byC[c] = 0; byC[c]++; } });
    var restants = Object.keys(byC).map(function (c) { return { c: c, n: byC[c] }; }).sort(function (a, b) { return b.n - a.n; });
    var mx2 = Math.max.apply(null, restants.map(function (r) { return r.n; }).concat([1]));
    var bars2 = restants.map(function (r) {
      return '<div class="acl-sim-arow"><span style="min-width:170px">' + esc(r.c) + '</span>' + '<span class="acl-bar-track"><span class="acl-bar-fill" style="width:' + Math.max(4, r.n / mx2 * 100) + '%;background:linear-gradient(90deg,#f59e0b,#dc2626)"></span></span>' + '<span><b>' + r.n + '</b> item(s) restant(s)</span></div>';
    }).join('') || '<div class="acl-empty">Tous les items sont cochés 🎉</div>';
    var tip = '💡 ';
    var goulot = restants[0];
    if (goulot) tip += 'Le goulot est la catégorie « ' + goulot.c + ' » avec ' + goulot.n + ' item(s) non coché(s) — traitez-la en priorité. ';
    if (st.nbBloq) tip += 'Des items bloqués attendent une action : débloquez-les pour relancer la progression. ';
    if (st.nbRet) tip += st.nbRet + ' item(s) en retard : l\u2019exhaustivité de l\u2019arrivée est compromise. ';
    if (!goulot && !st.nbBloq && !st.nbRet) tip += 'Toutes les checklists sont à jour — pensez à clôturer les complètes.';
    p.innerHTML = '<div class="acl-panel-head"><h3>Progression des checklists — vue pilote</h3><button class="acl-drawer-x" aria-label="Fermer">✕</button></div>' + '<div class="acl-panel-body">' + '<div class="acl-sim-kpis"><span><b>' + st.nb + '</b> checklist(s)</span>' + '<span><b>' + pct(st.progMoy) + '</b> progression moyenne</span>' + '<span><b>' + st.nbClot + '</b> clôturée(s)</span>' + '<span><b>' + st.nbBloq + '</b> bloqué(s)</span>' + '<span><b>' + (st.nbItems - st.nbFait - st.nbNA) + '</b> item(s) restant(s)</span></div>' + '<div style="font-size:.72rem;color:var(--acl-text2);margin:8px 0 5px">Progression moyenne par modèle :</div>' + '<div class="acl-sim-alloc">' + bars1 + '</div>' + '<div style="font-size:.72rem;color:var(--acl-text2);margin:10px 0 5px">Items restants par catégorie (goulots) :</div>' + '<div class="acl-sim-alloc">' + bars2 + '</div>' + '<div class="acl-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' + '</div>';
    $('.acl-drawer-x', p).addEventListener('click', closeProgression);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Progression ouverte', '');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-acl="seuils"],[data-acl="backdrop"][data-acl-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'acl-backdrop', 'data-acl': 'backdrop', 'data-acl-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'acl-panel', 'data-acl': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="acl-panel-head"><h3>Seuils de pilotage</h3><button class="acl-drawer-x" aria-label="Fermer">✕</button></div>' + '<div class="acl-panel-body">' + '<p class="acl-cibles-note">Ces seuils alimentent les alertes, les couleurs de progression et les KPI (exhaustivité des arrivées maîtrisée, urgences vues à temps).</p>' + '<div class="acl-sim-row"><label for="acl-s1">Progression cible des checklists (%)</label><input type="range" id="acl-s1" min="50" max="100" step="5" value="' + SEUILS.progressionCible + '"><input class="acl-in" type="number" min="50" max="100" step="5" data-acl="s1n" value="' + SEUILS.progressionCible + '"></div>' + '<div class="acl-sim-row"><label for="acl-s2">Fenêtre d\u2019urgence des items (jours)</label><input type="range" id="acl-s2" min="1" max="30" step="1" value="' + SEUILS.urgenceJours + '"><input class="acl-in" type="number" min="1" max="30" step="1" data-acl="s2n" value="' + SEUILS.urgenceJours + '"></div>' + '<div class="acl-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="acl-btn acl-btn-primary" data-act="save">Appliquer</button></div>' + '</div>';
    $('.acl-drawer-x', p).addEventListener('click', closeSeuils);
    [['acl-s1', 's1n', 'progressionCible', 50, 100, 5], ['acl-s2', 's2n', 'urgenceJours', 1, 30, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-acl="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.progressionCible = Math.max(50, Math.min(100, Number($('[data-acl="s1n"]', p).value) || SEUILS.progressionCible));
      SEUILS.urgenceJours = Math.max(1, Math.min(30, Number($('[data-acl="s2n"]', p).value) || SEUILS.urgenceJours));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'progression cible ' + SEUILS.progressionCible + ' % · urgence ' + SEUILS.urgenceJours + ' j');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-acl="journal"],[data-acl="backdrop"][data-acl-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'acl-backdrop', 'data-acl': 'backdrop', 'data-acl-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'acl-panel', 'data-acl': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="acl-panel-head"><h3>Journal d\u2019activité</h3><button class="acl-drawer-x" aria-label="Fermer">✕</button></div>' + '<div class="acl-panel-body" data-acl="jlist"></div>';
    $('.acl-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-acl="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="acl-jrow"><span class="acl-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' + '<span class="acl-jact">' + esc(x.action || '') + '</span><span class="acl-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="acl-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(keys) {
    var gs = groups();
    if (keys && keys.length) gs = gs.filter(function (g) { return keys.indexOf(g.key) > -1; });
    else gs = filtered();
    if (!gs.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Checklist', 'Titre', 'Type', 'Modèle', 'Employé', 'Poste', 'Département', 'Date arrivée', 'Responsable', 'Clôturée', 'Progression %', 'N° Item', 'Catégorie', 'Item', 'Statut', 'Obligatoire', 'Bloquée', 'Date prévue', 'Date réalisée', 'Coché par', 'Retard (j)', 'Note item', 'Notes checklist'];
    var lines = [head.join(sep)];
    gs.forEach(function (g) {
      g.items.forEach(function (it) {
        var cells = [g.numero || '', g.titre, typeMeta(g.type).lab, g.modele, g.employe, g.poste, g.departement, g.dateArrivee, g.resp, g.cloturee ? 'oui' : 'non', g.prog,
          it.numero, it.categorie, it.etape, it.statut, it.obligatoire ? 'oui' : 'non', it.bloquee ? 'oui' : 'non', it.datePrevue, it.dateRealisee, it.faitPar,
          it.retard ? Math.abs(it.due) : '', it.commentaires, g.notes];
        lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
      });
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-checklists-integration-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', lines.length - 1 + ' items');
    toast(lines.length - 1 + ' item(s) exporté(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeProgression(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-acl="dialog"]') || $('[data-acl="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { openProgression(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { setView('checklist'); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { setView('cards'); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { setView('table'); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-acl="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle checklist · E export · J journal · P progression · C vue checklist · K cartes · T tableau · S seuils · / recherche', ''); }
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
    var root = $('[data-acl="root"]');
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
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v) { if (typeof v.view === 'string' && ['table', 'cards', 'checklist'].indexOf(v.view) > -1) UI.view = v.view; if (typeof v.per === 'number') UI.per = v.per; } } catch (e) {}
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
    if (UI.view === 'cards') renderCards();
    else if (UI.view === 'checklist') renderChecklist();
    else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-acl="drawer"],[data-acl="dialog"],[data-acl="confirm"],[data-acl="journal"],[data-acl="prog"],[data-acl="seuils"]')) {
      $$('[data-acl="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, apiT = null, apiTries = 0, lastSig = '', bridgeUnsub = null;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function dataSig() {
    try {
      var a = api();
      var n = a && typeof a.getData === 'function' ? (a.getData().checklists || []).length : -1;
      var ld = lsData();
      return n + '|' + (ld ? JSON.stringify(ld).length : 0);
    } catch (e) { return 'err'; }
  }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-acl');
    shellBuilt = false;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    /* résilience : si __ADMINA_ACL_API__ tarde, 30 réessais (500 ms),
       le fallback LS direct couvre l'affichage et l'écriture entre-temps ;
       si ni API ni LS → page native intacte */
    clearInterval(apiT); apiTries = 0;
    apiT = setInterval(function () {
      apiTries++;
      if (api() || apiTries >= 30) { clearInterval(apiT); apiT = null; }
      if (active && isOn()) refresh();
    }, 500);
    /* pont bidirectionnel : la couche native notifie via subscribe */
    try {
      var a0 = api();
      if (a0 && typeof a0.subscribe === 'function') bridgeUnsub = a0.subscribe(function () { scheduleRefresh(); });
    } catch (eB) { bridgeUnsub = null; }
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-acl]')) continue;
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
    html.classList.remove('admina-acl');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearInterval(apiT); apiT = null; clearTimeout(refreshT);
    try { if (bridgeUnsub) { bridgeUnsub(); bridgeUnsub = null; } } catch (eU) {}
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeProgression(); closeSeuils();
    UI.sel = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
    lastSig = '';
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-acl="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-acl-hide', '1');
      natif.setAttribute('data-acl-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    var sig = dataSig();
    if (sig !== lastSig) { lastSig = sig; refresh(); return; }
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

  window.__ADMINA_ACL_UI__ = {
    version: '1.0-w2',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    exportCSV: exportCSV,
    openProgression: openProgression,
    openJournal: openJournal,
    openSeuils: openSeuils,
    setView: setView,
    debug: function () { return { UI: UI, SEUILS: SEUILS, groups: groups, data: data, apiTries: apiTries }; }
  };
  try { console.info('[ADMINA_ACL] W2-b actif — Boîte à outils de l\u2019arrivée /checklist-integration'); } catch (e) {}
})();
