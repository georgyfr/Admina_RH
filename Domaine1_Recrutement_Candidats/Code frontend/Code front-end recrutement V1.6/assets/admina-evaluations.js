/* =============================================================
   Admina-RH — Grille d'Évaluation des Candidats — couche admina
   W1-b : CENTRE DE PILOTAGE — Grille d'Évaluation (Domaine 1)

   PHILOSOPHIE DE LA PAGE —
   La Grille Évaluation est l'outil d'AIDE À LA DÉCISION du recrutement :
   noter objectivement chaque candidat sur des critères constants et
   bornés (0-5), calculer un score global transparent (/25 → /20),
   comparer les candidats entre eux à critères égaux et justifier chaque
   recommandation (Embaucher / Ne pas embaucher) par des commentaires
   traçables. Chaque alerte, chaque KPI et chaque graphique pousse vers
   une décision plus juste : compléter les grilles incomplètes, évaluer
   les candidats à stade avancé, repérer les talents et les scores sous
   le seuil. La page reste fidèle à sa nature de grille de notation —
   elle ne juge jamais à la place du décideur (ISO 30401), elle éclaire.

   - Scope strict : /grille-evaluation (RegExp /\/grille-evaluation\/?$/)
   - Idempotent (data-aev / data-aev-hide), sans collision (__ADMINA_EVAL_W1__)
   - Données : window.__ADMINA_EVAL_API__ (patch chunk W1) → fallback
     localStorage 'admina-evaluations-data' (même clé que le wrapper)
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   - Cohabitation stricte : tout préfixé aev-, rien de global hors
     window.__ADMINA_EVAL_W1__ / window.__ADMINA_EVAL_UI__
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_EVAL_W1__) return;
  window.__ADMINA_EVAL_W1__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/grille-evaluation\/?$/;
  var LS_DATA = 'admina-evaluations-data';
  var LS_UI = 'admina-eval-ui';
  var LS_SEUILS = 'admina-eval-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', reco: '', statut: '', poste: '', ev: '', complete: '', score: '', kpi: '', view: 'table', sortKey: 'date', sortDir: -1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, cmp: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { scoreMin: 12, scoreTalent: 15, ecartMax: 10 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var CRITERES_DEF = ['Compétences techniques', 'Expérience professionnelle', 'Qualités humaines', 'Motivation', 'Adéquation au poste'];
  var RECOS = [
    { k: 'Embaucher', lab: 'Embaucher', c: '#059669' },
    { k: 'Ne pas embaucher', lab: 'Ne pas embaucher', c: '#dc2626' },
    { k: '', lab: 'À décider', c: '#94a3b8' }
  ];
  function recoMeta(k) { for (var i = 0; i < RECOS.length; i++) { if (RECOS[i].k === k) return RECOS[i]; } return RECOS[2]; }
  var STATUTS_CAND = [
    { k: 'Retenu', lab: 'Retenu', c: '#059669' },
    { k: "En cours d'etude", lab: "En cours d'étude", c: '#0891b2' },
    { k: 'Entretien realise', lab: 'Entretien réalisé', c: '#7c3aed' },
    { k: 'Refuse', lab: 'Refusé', c: '#dc2626' },
    { k: 'En reserve', lab: 'En réserve', c: '#6b7280' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS_CAND.length; i++) { if (STATUTS_CAND[i].k === k) return STATUTS_CAND[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  function statutRank(k) { for (var i = 0; i < STATUTS_CAND.length; i++) { if (STATUTS_CAND[i].k === k) return i; } return 9; }
  var SOURCES = ['Site web entreprise', 'Presse', 'Cooptation', 'Reseaux sociaux', 'Candidature spontanee', 'Cabinet de recrutement', 'LinkedIn', 'Ecole/Universite', 'Salon emploi'];
  /* stades « avancés » du pipeline (M26) déclenchant l'alerte sans évaluation */
  var AV_STADES = ['Entretien final', 'Offre envoyee', 'Accepte'];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
  function fcfa(n) { return (Number(n) || 0).toLocaleString('fr-FR'); }
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
  function todayFr() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
  }
  function jlog(a, d) {
    try { if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.log === 'function') window.__ADMINA_AUDIT__.log(a, d, 'Évaluateur'); } catch (e) {}
    try {
      var arr = JSON.parse(localStorage.getItem(LS_J) || '[]');
      if (!Array.isArray(arr)) arr = [];
      arr.push({ time: Date.now(), action: a, detail: d || '', role: 'Évaluateur' });
      if (arr.length > 80) arr = arr.slice(-80);
      localStorage.setItem(LS_J, JSON.stringify(arr));
    } catch (e2) {}
  }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h(sel, attrs, htmlStr) { var e = document.createElement(sel); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (htmlStr != null) e.innerHTML = htmlStr; return e; }
  function toastsZone() { var z = $('[data-aev="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-aev', 'toasts'); z.className = 'aev-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'aev-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_EVAL_API__ || null; }
  function lsData() {
    try { var d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); if (d && Array.isArray(d.evaluations)) return d; } catch (e) {}
    return null;
  }
  /* Copie conforme des 3 évaluations de démonstration du chunk natif —
     utilisée UNIQUEMENT par le fallback LS quand ni l'API ni le LS n'ont
     encore de données (résilience au démarrage). */
  var DEMO = [
    { id: 1, numero: 'EVAL-2025-001', candidat: 'Ndiaye Moussa', evaluateur: 'Mme. Fotso Marie', date: '12/02/2025', posteVise: 'Chef Cuisinier', salaireSouhaite: 380000, salairePropose: 350000, sourceCandidature: 'Cabinet de recrutement', statutCandidat: 'Retenu', recommandation: 'Embaucher', criteres: [{ nom: 'Compétences techniques', note: 5, commentaire: 'Excellente maîtrise de la cuisine camerounaise et internationale' }, { nom: 'Expérience professionnelle', note: 4.5, commentaire: '8 ans dont 3 en position similaire' }, { nom: 'Qualités humaines', note: 5, commentaire: 'Très bon relationnel, leadership naturel' }, { nom: 'Motivation', note: 4.8, commentaire: 'Projets cohérents avec le poste' }, { nom: 'Adéquation au poste', note: 4.5, commentaire: 'Profil parfaitement aligné' }], total: 23.8, score20: 19, commentaireGlobal: 'Candidat exceptionnel, recommandé pour embauche immédiate. Score parmi les plus élevés.' },
    { id: 2, numero: 'EVAL-2025-002', candidat: 'Tchouankou Claire', evaluateur: 'M. Nkoulou Paul', date: '15/02/2025', posteVise: 'Comptable Senior', salaireSouhaite: 420000, salairePropose: 400000, sourceCandidature: 'LinkedIn', statutCandidat: 'Retenu', recommandation: 'Embaucher', criteres: [{ nom: 'Compétences techniques', note: 4, commentaire: 'Bonne maîtrise des logiciels comptables' }, { nom: 'Expérience professionnelle', note: 4, commentaire: '5 ans en comptabilité, dont 2 en senior' }, { nom: 'Qualités humaines', note: 3.5, commentaire: 'Réservée mais professionnelle' }, { nom: 'Motivation', note: 4, commentaire: 'Motivée par le secteur hôtelier' }, { nom: 'Adéquation au poste', note: 4.2, commentaire: 'Bon profil pour le poste' }], total: 19.7, score20: 15.8, commentaireGlobal: 'Bon candidat avec un potentiel certain. Nécessite un accompagnement sur la communication.' },
    { id: 3, numero: 'EVAL-2025-003', candidat: 'Nkoulou Brandon', evaluateur: 'M. Kamga Blaise', date: '20/02/2025', posteVise: 'Réceptionniste Nuit', salaireSouhaite: 180000, salairePropose: 0, sourceCandidature: 'Site web entreprise', statutCandidat: "En cours d'etude", recommandation: 'Ne pas embaucher', criteres: [{ nom: 'Compétences techniques', note: 2.5, commentaire: 'Connaissances de base en accueil' }, { nom: 'Expérience professionnelle', note: 2, commentaire: 'Expérience limitée à des stages' }, { nom: 'Qualités humaines', note: 3, commentaire: 'Dynamique mais manque de maturité' }, { nom: 'Motivation', note: 3, commentaire: 'Motivé mais manque de préparation' }, { nom: 'Adéquation au poste', note: 2.5, commentaire: 'Profil insuffisant pour un poste de nuit' }], total: 13, score20: 10.4, commentaireGlobal: "Candidat trop junior pour le poste. À conserver en réserve pour un poste d'agent d'accueil junior." }
  ];
  function normRow(r) {
    var u = {}; for (var k in r) u[k] = r[k];
    var cr = Array.isArray(u.criteres) ? u.criteres : [];
    u.criteres = cr.map(function (c) { return { nom: String(c && c.nom || 'Critère'), note: Number(c && c.note) || 0, commentaire: String(c && c.commentaire || '') }; });
    if (!u.criteres.length) u.criteres = CRITERES_DEF.map(function (n) { return { nom: n, note: 0, commentaire: '' }; });
    var t = 0, nn = 0;
    u.criteres.forEach(function (c) { t += c.note; if (c.note > 0) nn++; });
    u.total = Math.round(t * 10) / 10;
    u.score20 = Math.round(u.total * 8) / 10;
    u.nbNotes = nn;
    u.incomplet = nn < u.criteres.length;
    u.vierge = u.total <= 0;
    u.salaireSouhaite = Number(u.salaireSouhaite) || 0;
    u.salairePropose = Number(u.salairePropose) || 0;
    u.ecart = u.salaireSouhaite > 0 ? Math.round((u.salaireSouhaite - u.salairePropose) / u.salaireSouhaite * 100) : 0;
    u.reco = u.recommandation || '';
    return u;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.evaluations) { d = lsData(); }
    var arr = d && Array.isArray(d.evaluations) ? d.evaluations : null;
    if (!arr || !arr.length) arr = DEMO;
    return arr.map(normRow);
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) { var m2 = /^EVAL-\d{4}-(\d+)$/.exec(String(r.numero || '')); return Math.max(m, m2 ? Number(m2[1]) : 0); }, 0) + 1;
    var cand = 'EVAL-2025-' + String(mx).padStart(3, '0');
    while (rows.some(function (r) { return r.numero === cand; })) { mx++; cand = 'EVAL-2025-' + String(mx).padStart(3, '0'); }
    return cand;
  }
  function mutate(fn, actionLabel, detail) {
    var ok = false;
    var a = api();
    if (a && typeof a.setData === 'function' && typeof a.getData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (cur && Array.isArray(cur.evaluations)) {
        var nv = fn({ evaluations: cur.evaluations });
        a.setData(nv);
        ok = true;
      }
    }
    if (!ok) {
      var ld = lsData();
      var base = ld && Array.isArray(ld.evaluations) && ld.evaluations.length ? ld.evaluations.slice() : DEMO.slice();
      var nv2 = fn({ evaluations: base });
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e3) { toast('Écriture impossible — stockage indisponible', 'err'); return false; }
      ok = true;
    }
    refresh(); setTimeout(refresh, 80); setTimeout(refresh, 350);
    if (actionLabel) jlog(actionLabel, detail || '');
    return true;
  }
  function critUnion(rows) {
    var map = {};
    var out = [];
    rows.forEach(function (r) { (r.criteres || []).forEach(function (c) { var n = c.nom || 'Critère'; if (!map[n]) { map[n] = 1; out.push(n); } }); });
    return out;
  }

  /* croisement : candidats à stade avancé (base candidats M25 / pipeline M26) */
  function candidatsAvances() {
    var out = [], seen = {};
    function push(nom, poste, src) {
      var n = norm(nom); if (!n || seen[n]) return; seen[n] = 1;
      out.push({ nom: String(nom), poste: poste || '', src: src });
    }
    try {
      var ca = window.__ADMINA_CAND_API__;
      if (ca && typeof ca.getData === 'function') {
        var d = ca.getData() || {};
        (d.candidats || []).forEach(function (c) {
          if (c.statut === 'Entretien realise' || c.statut === 'Retenu') push(c.nomComplet || ((c.prenom || '') + ' ' + (c.nom || '')), c.posteVise, 'base');
        });
      }
    } catch (e) {}
    try {
      var pp = window.__ADMINA_PPL_API__;
      if (pp && typeof pp.getData === 'function') {
        var d2 = pp.getData() || {};
        (d2.candidatures || []).forEach(function (c) {
          if (AV_STADES.indexOf(String(c.stade || '')) > -1) push(c.nom, c.poste, 'pipeline');
        });
      }
    } catch (e2) {}
    return out;
  }
  function isEvalue(nom) {
    var n = norm(nom);
    return data().some(function (r) {
      var m = norm(r.candidat);
      return m && (m === n || m.indexOf(n) > -1 || n.indexOf(m) > -1);
    });
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var inc = rows.filter(function (r) { return r.incomplet; });
    if (inc.length) {
      var vierges = inc.filter(function (r) { return r.vierge; }).length;
      out.push({
        tone: vierges ? 'err' : 'warn',
        txt: inc.length + ' évaluation' + (inc.length > 1 ? 's' : '') + ' incomplète' + (inc.length > 1 ? 's' : '') + ' — critères non notés (' + inc.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)',
        f: 'inc'
      });
    }
    var av = candidatsAvances().filter(function (c) { return !isEvalue(c.nom); });
    if (av.length) out.push({ tone: 'warn', txt: av.length + ' candidat' + (av.length > 1 ? 's' : '') + ' à stade avancé sans évaluation — ' + av.slice(0, 2).map(function (c) { return c.nom; }).join(', ') + '…', f: 'avance', poste: av[0].poste, noms: av.slice(0, 4).map(function (c) { return c.nom; }).join(' · ') });
    var low = rows.filter(function (r) { return r.total > 0 && r.score20 < SEUILS.scoreMin; });
    if (low.length) out.push({ tone: 'err', txt: low.length + ' score(s) sous le seuil de ' + SEUILS.scoreMin + '/20 — ' + low.slice(0, 2).map(function (r) { return r.candidat + ' (' + r.score20 + ')'; }).join(', '), f: 'low' });
    var noev = rows.filter(function (r) { return !r.evaluateur; });
    if (noev.length) out.push({ tone: 'warn', txt: noev.length + ' évaluation' + (noev.length > 1 ? 's' : '') + ' sans évaluateur — traçabilité ISO incomplète (' + noev.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'noev' });
    var tal = rows.filter(function (r) { return r.score20 >= SEUILS.scoreTalent; });
    if (tal.length) out.push({ tone: 'ok', txt: tal.length + ' profil' + (tal.length > 1 ? 's' : '') + ' avec score ≥ ' + SEUILS.scoreTalent + '/20 — vivier de talents à préserver (' + tal.slice(0, 2).map(function (r) { return r.candidat; }).join(', ') + ')', f: 'tal' });
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.reco && r.reco !== UI.reco) return false;
      if (UI.statut && r.statutCandidat !== UI.statut) return false;
      if (UI.poste && norm(r.posteVise) !== norm(UI.poste)) return false;
      if (UI.ev === 'noev') { if (r.evaluateur) return false; }
      else if (UI.ev && norm(r.evaluateur) !== norm(UI.ev)) return false;
      if (UI.complete === 'incomplete' && !r.incomplet) return false;
      if (UI.complete === 'complete' && r.incomplet) return false;
      if (UI.score === 'tal' && !(r.score20 >= SEUILS.scoreTalent)) return false;
      if (UI.score === 'low' && !(r.total > 0 && r.score20 < SEUILS.scoreMin)) return false;
      if (UI.score === 'none' && !r.vierge) return false;
      if (UI.kpi === 'emb' && r.reco !== 'Embaucher') return false;
      if (UI.kpi === 'refus' && r.reco !== 'Ne pas embaucher') return false;
      if (UI.kpi === 'inc' && !r.incomplet) return false;
      if (UI.kpi === 'tal' && !(r.score20 >= SEUILS.scoreTalent)) return false;
      if (q) {
        var hay = norm([r.numero, r.candidat, r.posteVise, r.evaluateur, r.sourceCandidature, r.commentaireGlobal].join(' '));
        var hayCrit = norm((r.criteres || []).map(function (c) { return c.nom + ' ' + c.commentaire; }).join(' '));
        if (hay.indexOf(q) < 0 && hayCrit.indexOf(q) < 0) return false;
      }
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'score') { va = a.score20; vb = b.score20; }
      else if (k === 'total') { va = a.total; vb = b.total; }
      else if (k === 'compl') { va = a.criteres.length - a.nbNotes; vb = b.criteres.length - b.nbNotes; }
      else if (k === 'ecart') { va = a.ecart; vb = b.ecart; }
      else if (k === 'date') { va = dateKey(a.date); vb = dateKey(b.date); }
      else if (k === 'statut') { va = statutRank(a.statutCandidat); vb = statutRank(b.statutCandidat); }
      else if (k === 'reco') { va = a.reco === 'Embaucher' ? 0 : (a.reco ? 2 : 1); vb = b.reco === 'Embaucher' ? 0 : (b.reco ? 2 : 1); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.reco ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.poste ? 1 : 0) + (UI.ev ? 1 : 0) + (UI.complete ? 1 : 0) + (UI.score ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.reco = ''; UI.statut = ''; UI.poste = ''; UI.ev = ''; UI.complete = ''; UI.score = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Évaluations\s+des\s+Candidats/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-aev="root"]');
    if (!root) {
      root = h('section', { 'data-aev': 'root', class: 'aev-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-aev-page')) {
      page.setAttribute('data-aev-page', '1');
      page.setAttribute('data-aev-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-aev-hide')) {
      natif.setAttribute('data-aev-hide', '1');
      natif.setAttribute('data-aev-olddisp', natif.style.display || '');
    }
    if (natif.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-aev="root"]'); if (root) root.remove();
    $$('[data-aev-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-aev-oldw') || '';
      n.removeAttribute('data-aev-page');
      n.removeAttribute('data-aev-oldw');
    });
    $$('[data-aev-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-aev-olddisp') || '';
      n.removeAttribute('data-aev-hide');
      n.removeAttribute('data-aev-olddisp');
    });
    $$('[data-aev]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-aev="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.removeAttribute('data-aev-hide'); natif.style.display = ''; }
    var back = h('button', { class: 'aev-btn aev-btn-primary aev-backbtn', 'data-aev': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) { natif.setAttribute('data-aev-hide', '1'); natif.style.display = 'none'; } });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage grille native', 'grille-evaluation');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    ana: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></svg>',
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
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  var GRID_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>';

  function buildShell() {
    var root = $('[data-aev="root"]');
    if (!root || $('[data-aev="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="aev-hero" data-aev="hero">' +
        '<div class="aev-hero-main">' +
          '<div class="aev-hero-title">' +
            '<span class="aev-hero-ico" aria-hidden="true">' + GRID_ICON + '</span>' +
            '<div><h2 class="aev-h2">Centre de pilotage — Grille d\u2019Évaluation des Candidats</h2>' +
            '<p class="aev-hero-sub" data-aev="herosub"></p></div>' +
          '</div>' +
          '<div class="aev-hero-actions">' +
            '<button class="aev-btn" data-aev="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="aev-btn" data-aev="btn-ana" title="Analyse par critère (P)">' + ICO.ana + 'Analyse</button>' +
            '<button class="aev-btn" data-aev="btn-cmp" title="Comparer des évaluations (C)">' + ICO.cmp + 'Comparer <span class="aev-nc-badge" data-aev="cmp-badge"></span></button>' +
            '<button class="aev-btn" data-aev="btn-seuils" title="Seuils de notation (S)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="aev-btn" data-aev="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="aev-btn" data-aev="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="aev-btn aev-btn-primary" data-aev="btn-new" title="Nouvelle évaluation (N)">' + ICO.plus + 'Nouvelle évaluation</button>' +
          '</div>' +
        '</div>' +
        '<div class="aev-hero-alerts" data-aev="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="aev-kpis" data-aev="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="aev-charts" data-aev="charts">' +
        '<div class="aev-chart-card"><div class="aev-chart-title">Décisions recommandées</div><div class="aev-donut-wrap" data-aev="donut"></div></div>' +
        '<div class="aev-chart-card"><div class="aev-chart-title">Note moyenne par critère (/5)</div><div data-aev="critbars"></div></div>' +
        '<div class="aev-chart-card"><div class="aev-chart-title">Score moyen par poste visé (/20)</div><div data-aev="postebars"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="aev-toolbar" data-aev="toolbar">' +
        '<div class="aev-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (candidat, n°, poste, évaluateur, critères…)" data-aev="search" aria-label="Rechercher une évaluation" /></div>' +
        '<select data-aev="f-reco" class="aev-sel" aria-label="Filtrer par recommandation"></select>' +
        '<select data-aev="f-statut" class="aev-sel" aria-label="Filtrer par statut du candidat"></select>' +
        '<select data-aev="f-poste" class="aev-sel" aria-label="Filtrer par poste visé"></select>' +
        '<select data-aev="f-ev" class="aev-sel" aria-label="Filtrer par évaluateur"></select>' +
        '<select data-aev="f-complete" class="aev-sel" aria-label="Filtrer par complétude"></select>' +
        '<select data-aev="f-score" class="aev-sel" aria-label="Filtrer par score"></select>' +
        '<button class="aev-chipbtn" data-aev="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="aev-count" data-aev="count"></span>' +
        '<div class="aev-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="aev-vbtn" data-aev="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="aev-vbtn" data-aev="v-cards" title="Vue cartes (K)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-aev="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-aev="selbar"></div>' +

      /* PIED */
      '<div class="aev-foot">Notation objective à critères constants (ISO 30401) · source de vérité locale (navigateur) · journal d\u2019audit actif · seuils configurables · <button class="aev-link" data-aev="btn-native">Afficher la grille native</button></div>';

    $('[data-aev="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-aev="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-aev="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'grille-evaluation'); window.print(); });
    $('[data-aev="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-aev="btn-ana"]', root).addEventListener('click', openAnalyse);
    $('[data-aev="btn-cmp"]', root).addEventListener('click', openCompare);
    $('[data-aev="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-aev="btn-native"]', root).addEventListener('click', showNative);
    $('[data-aev="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-aev="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-aev="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-aev="f-reco"]', root).addEventListener('change', function (e) { UI.reco = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aev="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.page = 0; refresh(); });
    $('[data-aev="f-poste"]', root).addEventListener('change', function (e) { UI.poste = e.target.value; UI.page = 0; refresh(); });
    $('[data-aev="f-ev"]', root).addEventListener('change', function (e) { UI.ev = e.target.value; UI.page = 0; refresh(); });
    $('[data-aev="f-complete"]', root).addEventListener('change', function (e) { UI.complete = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aev="f-score"]', root).addEventListener('change', function (e) { UI.score = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-aev="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-aev="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var evals = rows.filter(function (r) { return r.total > 0; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.score20; }, 0) / evals.length : 0;
    var emb = rows.filter(function (r) { return r.reco === 'Embaucher'; }).length;
    var inc = rows.filter(function (r) { return r.incomplet; }).length;
    var sub = rows.length + ' évaluation' + (rows.length > 1 ? 's' : '') +
      ' · score moyen ' + (evals.length ? moy.toFixed(1) : '—') + '/20' +
      ' · ' + emb + ' recommandée(s) embauche' +
      ' · ' + inc + ' incomplète' + (inc > 1 ? 's' : '');
    $('[data-aev="herosub"]').textContent = sub;
    var zone = $('[data-aev="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="aev-alert ' + a.tone + '" data-aev="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.aev-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        var poste = b.getAttribute('data-poste') || '';
        var noms = b.getAttribute('data-noms') || '';
        resetFilters();
        if (f === 'inc') UI.complete = 'incomplete';
        else if (f === 'avance') {
          var rowsD = data();
          var postes = {};
          rowsD.forEach(function (r) { if (r.posteVise) postes[r.posteVise] = 1; });
          UI.poste = postes[poste] ? poste : '';
          toast(noms ? 'Candidat(s) à évaluer : ' + noms : 'Candidat à évaluer', 'info');
        }
        else if (f === 'low') UI.score = 'low';
        else if (f === 'noev') UI.ev = 'noev';
        else if (f === 'tal') UI.kpi = 'tal';
        refresh();
      });
    });
    $$('.aev-alert[data-f="avance"]', zone).forEach(function (b) {
      var a = computeAlerts(rows).filter(function (x) { return x.f === 'avance'; })[0];
      if (a) { b.setAttribute('data-poste', a.poste || ''); b.setAttribute('data-noms', a.noms || ''); }
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var evals = rows.filter(function (r) { return r.total > 0; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.score20; }, 0) / evals.length : 0;
    var emb = rows.filter(function (r) { return r.reco === 'Embaucher'; }).length;
    var ref = rows.filter(function (r) { return r.reco === 'Ne pas embaucher'; }).length;
    var inc = rows.filter(function (r) { return r.incomplet; }).length;
    var tal = rows.filter(function (r) { return r.score20 >= SEUILS.scoreTalent; }).length;
    var evs = {}, postes = {};
    rows.forEach(function (r) { if (r.evaluateur) evs[r.evaluateur] = 1; if (r.posteVise) postes[r.posteVise] = 1; });
    var kpis = [
      { k: '', t: 'ÉVALUATIONS', v: String(nb), s: Object.keys(postes).length + ' postes · ' + Object.keys(evs).length + ' évaluateurs', cls: '' },
      { k: '', t: 'SCORE MOYEN', v: (evals.length ? moy.toFixed(1) : '—') + '/20', s: 'sur ' + evals.length + ' notée' + (evals.length > 1 ? 's' : ''), cls: '' },
      { k: 'emb', t: 'EMBAUCHER', v: String(emb), s: pct(nb ? emb / nb * 100 : 0) + ' du total', cls: '' },
      { k: 'refus', t: 'REFUS', v: String(ref), s: pct(nb ? ref / nb * 100 : 0) + ' du total', cls: '' },
      { k: 'inc', t: 'INCOMPLÈTES', v: String(inc), s: 'critères non notés', cls: inc ? 'gold' : '' },
      { k: 'tal', t: 'TALENTS ≥' + SEUILS.scoreTalent, v: String(tal), s: 'score seuil ' + SEUILS.scoreTalent + '/20', cls: '' }
    ];
    var zone = $('[data-aev="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="aev-kpi' + (k.cls === 'gold' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="aev-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="aev-kpi-v' + (k.cls === 'gold' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="aev-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.aev-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.reco = ''; UI.statut = ''; UI.poste = ''; UI.ev = ''; UI.complete = ''; UI.score = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="' + esc(label) + '">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">évaluations</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-aev="donut"]');
    var parts = RECOS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.reco === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length, 'Décisions recommandées') +
      '<div class="aev-donut-legend">' + parts.map(function (p) {
        return '<span class="aev-dl-item' + (UI.reco === p.k && p.k ? ' on' : '') + '" data-reco="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="aev-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="aev-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.aev-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-reco');
        UI.reco = UI.reco === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  /* graphique à barres SVG vanilla cliquable */
  function svgBars(items, label) {
    if (!items.length) return '<div class="aev-empty">Aucune donnée</div>';
    var W = 360, rowH = 30, pad = 6, nameW = 116, valW = 46;
    var H = items.length * rowH + pad * 2;
    var maxV = 0;
    items.forEach(function (it) { if (it.v > maxV) maxV = it.v; });
    if (maxV <= 0) maxV = 1;
    var trackW = W - nameW - valW - 20;
    var rows = items.map(function (it, i) {
      var y = pad + i * rowH;
      var w = Math.max(2.5, it.v / maxV * trackW);
      var name = it.name.length > 15 ? it.name.slice(0, 14) + '…' : it.name;
      return '<g class="aev-svbar" data-key="' + esc(it.key) + '" role="button" tabindex="0" aria-label="' + esc(it.name + ' : ' + it.labelv) + '">' +
        '<title>' + esc(it.name + ' — ' + it.labelv) + '</title>' +
        '<text x="' + (nameW - 4) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end" class="aev-svname">' + esc(name) + '</text>' +
        '<rect x="' + (nameW + 6) + '" y="' + (y + 7) + '" width="' + trackW + '" height="16" rx="8" class="aev-svtrack"></rect>' +
        '<rect x="' + (nameW + 6) + '" y="' + (y + 7) + '" width="' + w + '" height="16" rx="8" class="aev-svfill" style="fill:' + it.c + '"></rect>' +
        '<text x="' + (W - 2) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end" class="aev-svval">' + esc(it.labelv) + '</text></g>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="img" aria-label="' + esc(label) + '" preserveAspectRatio="xMinYMin meet">' + rows + '</svg>';
  }

  function renderCharts() {
    var rows = data();
    var crits = critUnion(rows);
    /* note moyenne par critère */
    var zone = $('[data-aev="critbars"]');
    var items = crits.map(function (n) {
      var vals = [];
      rows.forEach(function (r) { (r.criteres || []).forEach(function (c) { if (c.nom === n && c.note > 0) vals.push(c.note); }); });
      var m = vals.length ? vals.reduce(function (s, v) { return s + v; }, 0) / vals.length : 0;
      return { key: n, name: n, v: m, labelv: (vals.length ? m.toFixed(1) : '—') + '/5 · ' + vals.length + ' note' + (vals.length > 1 ? 's' : ''), c: m >= 4 ? '#059669' : m >= 3 ? '#d97706' : '#dc2626' };
    });
    zone.innerHTML = svgBars(items, 'Note moyenne par critère');
    $$('.aev-svbar', zone).forEach(function (b) {
      function go() { resetFilters(); UI.q = b.getAttribute('data-key'); var si = $('[data-aev="search"]'); if (si) si.value = UI.q; UI.page = 0; refresh(); }
      b.addEventListener('click', go);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    /* score moyen par poste */
    var z2 = $('[data-aev="postebars"]');
    var map = {};
    rows.forEach(function (r) { var p = r.posteVise || '—'; if (!map[p]) map[p] = { s: 0, n: 0 }; if (r.total > 0) { map[p].s += r.score20; map[p].n++; } });
    var items2 = Object.keys(map).map(function (p) {
      var m = map[p].n ? map[p].s / map[p].n : 0;
      return { key: p, name: p, v: m, labelv: (map[p].n ? m.toFixed(1) : '—') + '/20 · ' + map[p].n, c: m >= SEUILS.scoreTalent ? '#059669' : m >= SEUILS.scoreMin ? '#0d9488' : '#dc2626' };
    }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    z2.innerHTML = svgBars(items2, 'Score moyen par poste visé');
    $$('.aev-svbar', z2).forEach(function (b) {
      function go() {
        var k = b.getAttribute('data-key');
        UI.poste = UI.poste === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      }
      b.addEventListener('click', go);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  function renderFilters() {
    var rows = data();
    var recos = {}, stats = {}, postes = {}, evs = {};
    rows.forEach(function (r) {
      if (r.reco) recos[r.reco] = 1;
      if (r.statutCandidat) stats[r.statutCandidat] = 1;
      if (r.posteVise) postes[r.posteVise] = 1;
      if (r.evaluateur) evs[r.evaluateur] = 1;
    });
    var s1 = $('[data-aev="f-reco"]');
    s1.innerHTML = '<option value="">Recommandation : toutes</option>' + Object.keys(recos).map(function (k) {
      return '<option value="' + esc(k) + '"' + (UI.reco === k ? ' selected' : '') + '>' + esc(recoMeta(k).lab) + '</option>';
    }).join('');
    var s2 = $('[data-aev="f-statut"]');
    s2.innerHTML = '<option value="">Statut : tous</option>' + STATUTS_CAND.filter(function (s) { return stats[s.k]; }).map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var s3 = $('[data-aev="f-poste"]');
    s3.innerHTML = '<option value="">Poste : tous</option>' + Object.keys(postes).sort().map(function (p) {
      return '<option value="' + esc(p) + '"' + (UI.poste === p ? ' selected' : '') + '>' + esc(p) + '</option>';
    }).join('');
    var s4 = $('[data-aev="f-ev"]');
    s4.innerHTML = '<option value="">Évaluateur : tous</option>' +
      '<option value="noev"' + (UI.ev === 'noev' ? ' selected' : '') + '>Sans évaluateur</option>' +
      Object.keys(evs).sort().map(function (e) {
        return '<option value="' + esc(e) + '"' + (UI.ev === e ? ' selected' : '') + '>' + esc(e) + '</option>';
      }).join('');
    var s5 = $('[data-aev="f-complete"]');
    s5.innerHTML = '<option value="">Complétude : toutes</option>' +
      '<option value="incomplete"' + (UI.complete === 'incomplete' ? ' selected' : '') + '>Incomplètes</option>' +
      '<option value="complete"' + (UI.complete === 'complete' ? ' selected' : '') + '>Complètes</option>';
    var s6 = $('[data-aev="f-score"]');
    s6.innerHTML = '<option value="">Score : tous</option>' +
      '<option value="tal"' + (UI.score === 'tal' ? ' selected' : '') + '>≥ ' + SEUILS.scoreTalent + ' /20 (talents)</option>' +
      '<option value="low"' + (UI.score === 'low' ? ' selected' : '') + '>&lt; ' + SEUILS.scoreMin + ' /20 (sous le seuil)</option>' +
      '<option value="none"' + (UI.score === 'none' ? ' selected' : '') + '>Vierges (aucune note)</option>';
    $('[data-aev="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-aev="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' évaluations';
  }

  function recoChip(r) {
    var rm = recoMeta(r.reco);
    var cls = r.reco === 'Embaucher' ? 'ok' : r.reco ? 'err' : 'neutral';
    return '<span class="aev-chip ' + cls + '" style="' + (r.reco ? 'background:' + rm.c + '18;border-color:' + rm.c + '66;color:' + rm.c : '') + '" title="Recommandation : ' + esc(rm.lab) + '">' + esc(rm.lab) + '</span>';
  }
  function statutChip(r) {
    var sm = statutMeta(r.statutCandidat);
    return '<span class="aev-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="Statut candidat : ' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function scoreCell(r) {
    if (r.total <= 0) return '<span class="aev-score zero" title="Non notée">—</span>';
    var cls = r.score20 >= SEUILS.scoreTalent ? ' hi' : r.score20 >= SEUILS.scoreMin ? ' mid' : ' lo';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="aev-score' + cls + '">' + r.score20 + '</span>' +
      '<span class="aev-scorebar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(r.score20 / 20 * 100)) + '%"></i></span></span>';
  }
  function ecartCell(r) {
    if (!r.salaireSouhaite) return '<span class="aev-num">—</span>';
    var cls = r.ecart > SEUILS.ecartMax ? ' warn' : '';
    return '<span class="aev-anci' + cls + '" title="Proposé ' + esc(fcfa(r.salairePropose)) + ' vs souhaité ' + esc(fcfa(r.salaireSouhaite)) + ' FCFA">' + (r.ecart > 0 ? '-' + r.ecart : '+' + Math.abs(r.ecart)) + ' %</span>';
  }
  function segs(note) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= Math.round(note) ? 'on' : '') + '">' + i + '</i>';
    return '<span class="aev-segs" aria-hidden="true">' + s + '</span>';
  }
  function grilleCell(r) {
    var t = r.nbNotes + '/' + r.criteres.length;
    var w = Math.round(r.nbNotes / r.criteres.length * 100);
    return '<span style="display:inline-flex;align-items:center;gap:7px" title="Critères notés : ' + t + '"><span class="aev-chip neutral">' + t + '</span>' +
      '<span class="aev-scorebar" aria-hidden="true"><i style="width:' + w + '%"></i></span></span>';
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var evals = all.filter(function (r) { return r.total > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score20; }, 0) / evals.length).toFixed(1) : '—';
    var emb = all.filter(function (r) { return r.reco === 'Embaucher'; }).length;
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var act = key && key === sortKey;
      return '<th ' + (key ? 'data-sort="' + key + '"' : '') + (act ? ' aria-sort="' + (dir < 0 ? 'descending' : 'ascending') + '"' : '') + ' class="' + (cls || '') + '">' + label +
        (act ? '<span class="aev-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'aev-th-chk') + th('N°', 'numero') + th('Candidat', 'candidat') + th('Poste visé', 'posteVise') +
      th('Évaluateur', 'evaluateur') + th('Date', 'date') + th('Statut candidat', 'statut') + th('Recommandation', 'reco') +
      th('Score /20', 'score') + th('Total /25', 'total') + th('Grille', 'compl') + th('Écart salarial', 'ecart') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="aev-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.candidat) + '"></td>' +
        '<td class="aev-num">' + esc(r.numero) + '</td>' +
        '<td><span class="aev-poste" data-open="' + esc(r.id) + '">' + esc(r.candidat) + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.posteVise || '—') + '</td>' +
        '<td>' + (r.evaluateur ? esc(r.evaluateur) : '<span class="aev-chip warn" title="Évaluateur manquant">—</span>') + '</td>' +
        '<td class="aev-num">' + esc(jDate(r.date) || '—') + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td>' + recoChip(r) + '</td>' +
        '<td>' + scoreCell(r) + '</td>' +
        '<td class="aev-num">' + (r.total > 0 ? r.total : '—') + '</td>' +
        '<td>' + grilleCell(r) + '</td>' +
        '<td>' + ecartCell(r) + '</td>' +
        '<td><div class="aev-actions">' +
          '<button class="aev-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aev-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aev-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aev-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="aev-tfoot"><td></td><td colspan="12">TOTAL ' + all.length + ' évaluations · score moyen ' + moy + '/20 · ' + emb + ' recommandée(s) embauche</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="aev-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="aev-sel" data-aev="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="aev-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="aev-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-aev="content"]');
    card.innerHTML = '<div class="aev-tblcard"><div class="aev-tblwrap"><table class="aev-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="13"><div class="aev-empty">Aucune évaluation ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'candidat' || k === 'numero' || k === 'posteVise' || k === 'evaluateur' ? 1 : -1; }
        refresh();
      });
    });
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 évaluations', 'err'); c.checked = false; return; } UI.cmp.push(id); }
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
    var perSel = $('[data-aev="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var card = $('[data-aev="content"]');
    card.innerHTML = rows.length ? '<div class="aev-cards">' + rows.map(function (r) {
      var crits = (r.criteres || []).map(function (c) {
        return '<div class="aev-critrow"><span class="aev-critname" title="' + esc(c.nom) + '">' + esc(c.nom) + '</span>' + segs(c.note) + '<span class="aev-critnote">' + (c.note > 0 ? c.note : '—') + '/5</span></div>';
      }).join('');
      return '<div class="aev-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="aev-card-top"><div><input type="checkbox" class="aev-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="aev-num">' + esc(r.numero) + '</span></div>' +
        recoChip(r) + '</div>' +
        '<div class="aev-card-name" data-open="' + esc(r.id) + '">' + esc(r.candidat) + '</div>' +
        '<div class="aev-card-total" style="font-size:.95rem">' + esc(r.posteVise || '—') + '</div>' +
        '<div class="aev-card-struct"><span>' + scoreCell(r) + '<span style="color:var(--aev-text2);font-size:.74rem;font-weight:600">' + esc(r.evaluateur || 'Évaluateur manquant') + ' · ' + esc(jDate(r.date) || '—') + '</span></span></div>' +
        '<div class="aev-card-crits">' + crits + '</div>' +
        '<div class="aev-card-meta">' + statutChip(r) + grilleCell(r) + (r.sourceCandidature ? '<span class="aev-chip neutral">' + esc(r.sourceCandidature) + '</span>' : '') + '</div>' +
        '<div class="aev-card-foot"><span class="aev-num">Total ' + (r.total > 0 ? r.total + '/25' : '—') + '</span>' +
        '<div class="aev-card-act">' +
          '<button class="aev-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="aev-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="aev-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="aev-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="aev-empty">Aucune évaluation ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 évaluations', 'err'); c.checked = false; return; } UI.cmp.push(id); }
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
    var badge = $('[data-aev="cmp-badge"]');
    if (badge) { badge.textContent = UI.cmp.length ? String(UI.cmp.length) : ''; badge.style.display = UI.cmp.length ? '' : 'none'; }
    var zone = $('[data-aev="selbar"]');
    if (!UI.cmp.length) { zone.innerHTML = ''; return; }
    var rows = UI.cmp.map(function (id) { return rowById(id); }).filter(Boolean);
    var evals = rows.filter(function (r) { return r.total > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score20; }, 0) / evals.length).toFixed(1) : '—';
    zone.innerHTML = '<div class="aev-selbar">' +
      '<span class="aev-selbar-info">' + rows.length + ' sélectionnée' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="aev-selbar-sub">score moyen ' + moy + '/20</span>' +
      '<button class="aev-btn aev-btn-ghost" data-sel="cmp" ' + (rows.length < 2 ? 'disabled' : '') + '>Comparer</button>' +
      '<button class="aev-btn aev-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="aev-btn aev-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="aev-btn aev-btn-ghost" data-sel="clear">Annuler</button></div>';
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
  function closeDrawer() { $$('[data-aev="drawer"],[data-aev="backdrop"][data-aev-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var all = data();
    var evals = all.filter(function (x) { return x.total > 0; });
    var moyG = evals.length ? evals.reduce(function (s, x) { return s + x.score20; }, 0) / evals.length : 0;
    var pos = r.total > 0 ? (r.score20 >= moyG ? 'au-dessus' : 'en dessous') : '—';
    var crits = (r.criteres || []).map(function (c) {
      return '<div class="aev-critrow aev-critrow-lg"><span class="aev-critname" title="' + esc(c.nom) + '">' + esc(c.nom) + '</span>' + segs(c.note) +
        '<span class="aev-critnote">' + (c.note > 0 ? c.note : '—') + '/5</span></div>' +
        (c.commentaire ? '<div class="aev-critcom">' + esc(c.commentaire) + '</div>' : '');
    }).join('');
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var dr = h('aside', { class: 'aev-drawer', 'data-aev': 'drawer', role: 'dialog', 'aria-label': 'Fiche ' + r.candidat });
    dr.innerHTML =
      '<div class="aev-drawer-head"><div><div class="aev-drawer-title">' + esc(r.candidat) + '</div>' +
      '<div class="aev-drawer-sub">' + esc(r.numero) + ' · ' + esc(r.posteVise || '—') + ' · ' + esc(jDate(r.date) || '—') + '</div></div>' +
      '<button class="aev-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aev-drawer-body">' +
        '<div class="aev-live" style="margin-top:0"><span>Score <b>' + (r.total > 0 ? r.score20 + '/20' : '—') + '</b></span>' +
          '<span>Total <b>' + (r.total > 0 ? r.total + '/25' : '—') + '</b></span>' +
          '<span>Grille <b>' + r.nbNotes + '/' + r.criteres.length + '</b></span>' +
          '<span>Décision <b style="color:' + recoMeta(r.reco).c + '">' + esc(recoMeta(r.reco).lab) + '</b></span></div>' +
        '<div class="aev-fsec">Grille de critères</div>' +
        '<div class="aev-critlist">' + crits + '</div>' +
        '<div class="aev-fsec">Score global calculé</div>' +
        '<dl class="aev-kv">' +
          kv('Total', (r.total > 0 ? r.total + ' /25' : '—')) +
          kv('Score /20', (r.total > 0 ? r.score20 + ' /20' : '—')) +
          kv('Moyenne générale', (evals.length ? moyG.toFixed(1) + ' /20' : '—')) +
          kv('Position', pos === '—' ? '—' : pos + ' de la moyenne') +
          kv('Complétude', r.nbNotes + ' critère(s) noté(s) sur ' + r.criteres.length + (r.incomplet ? ' <span class="aev-chip warn">incomplète</span>' : ' <span class="aev-chip ok">complète</span>')) +
        '</dl>' +
        '<div class="aev-fsec">Rémunération</div>' +
        '<dl class="aev-kv">' +
          kv('Salaire souhaité', r.salaireSouhaite ? esc(fcfa(r.salaireSouhaite)) + ' FCFA' : '—') +
          kv('Salaire proposé', r.salairePropose ? esc(fcfa(r.salairePropose)) + ' FCFA' : '—') +
          kv('Écart', r.salaireSouhaite ? (r.ecart > 0 ? '-' + r.ecart : '+' + Math.abs(r.ecart)) + ' % ' + (r.ecart > SEUILS.ecartMax ? '<span class="aev-chip warn">au-delà du seuil (' + SEUILS.ecartMax + ' %)</span>' : '') : '—') +
        '</dl>' +
        '<div class="aev-fsec">Décision & statut</div>' +
        '<div class="aev-sim-row" style="margin-bottom:10px"><label for="aev-recosel">Recommandation</label>' +
          '<select id="aev-recosel" class="aev-in" data-aev="recosel">' + RECOS.map(function (x) {
            return '<option value="' + esc(x.k) + '"' + (x.k === r.reco ? ' selected' : '') + '>' + esc(x.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="aev-sim-row" style="margin-bottom:10px"><label for="aev-stsel">Statut du candidat</label>' +
          '<select id="aev-stsel" class="aev-in" data-aev="stsel">' + STATUTS_CAND.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statutCandidat ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<dl class="aev-kv">' +
          kv('Source', esc(r.sourceCandidature || '—')) +
          kv('Évaluateur', r.evaluateur ? esc(r.evaluateur) : '<span class="aev-chip warn">manquant</span>') +
        '</dl>' +
        '<div class="aev-fsec">Commentaire global</div>' +
        '<textarea class="aev-notebox" data-aev="note" placeholder="Justification de la décision (obligatoire pour tracer la recommandation…)">' + esc(r.commentaireGlobal || '') + '</textarea>' +
        '<div class="aev-drawer-actions">' +
          '<button class="aev-btn aev-btn-ghost" data-act="note">Enregistrer le commentaire</button>' +
          '<button class="aev-btn aev-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="aev-btn aev-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="aev-btn aev-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.aev-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-aev="recosel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      var curRow = rowById(id); /* état courant — évite la closure stale (leçon M26) */
      if (!curRow || nv === curRow.reco) return;
      mutate(function (cur) {
        cur.evaluations = cur.evaluations.map(function (x) { if (String(x.id) === String(id)) x.recommandation = nv; return x; });
        return cur;
      }, 'Recommandation modifiée', r.numero + ' → ' + (recoMeta(nv).lab));
      toast('Décision : ' + recoMeta(nv).lab, 'ok');
    });
    $('[data-aev="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      var curRow2 = rowById(id); /* état courant — évite la closure stale (leçon M26) */
      if (!curRow2 || nv === curRow2.statutCandidat) return;
      mutate(function (cur) {
        cur.evaluations = cur.evaluations.map(function (x) { if (String(x.id) === String(id)) x.statutCandidat = nv; return x; });
        return cur;
      }, 'Statut candidat modifié', r.numero + ' → ' + statutMeta(nv).lab);
      toast('Statut : ' + statutMeta(nv).lab, 'ok');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-aev="note"]', dr).value;
      mutate(function (cur) {
        cur.evaluations = cur.evaluations.map(function (x) { if (String(x.id) === String(id)) x.commentaireGlobal = v; return x; });
        return cur;
      }, 'Commentaire global modifié', r.numero);
      toast('Commentaire enregistré', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', r.numero);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-aev="dialog"],[data-aev="backdrop"][data-aev-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function critRowHtml(c) {
    c = c || { nom: '', note: 0, commentaire: '' };
    return '<div class="aev-critedit">' +
      '<input class="aev-in" data-crit="nom" value="' + esc(c.nom) + '" placeholder="Intitulé du critère" aria-label="Intitulé du critère">' +
      '<input class="aev-in" type="number" min="0" max="5" step="0.5" data-crit="note" value="' + esc(String(c.note || 0)) + '" aria-label="Note du critère (0 à 5)">' +
      '<input class="aev-in" data-crit="com" value="' + esc(c.commentaire) + '" placeholder="Commentaire" aria-label="Commentaire du critère">' +
      '<button class="aev-ic" type="button" data-critdel="1" title="Retirer ce critère" aria-label="Retirer ce critère">×</button></div>';
  }
  function openDialog(editId) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'aev-dialog', 'data-aev': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une évaluation' : 'Nouvelle évaluation' });
    function opts(list, cur) {
      return list.map(function (x) {
        return '<option value="' + esc(x.k) + '"' + (cur === x.k ? ' selected' : '') + '>' + esc(x.lab) + '</option>';
      }).join('');
    }
    var initCrits = r ? r.criteres.slice() : CRITERES_DEF.map(function (n) { return { nom: n, note: 0, commentaire: '' }; });
    dlg.innerHTML =
      '<div class="aev-dialog-head"><h3>' + (r ? 'Modifier l\u2019évaluation ' + esc(r.numero) : 'Nouvelle évaluation') + '</h3>' +
      '<button class="aev-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aev-dialog-body">' +
        '<div class="aev-fgrid">' +
          '<label class="aev-lab">Candidat *<input class="aev-in" data-f="candidat" value="' + esc(v('candidat')) + '" placeholder="Ex. Ndiaye Moussa"></label>' +
          '<label class="aev-lab">Poste visé *<input class="aev-in" data-f="posteVise" value="' + esc(v('posteVise')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="aev-lab">Évaluateur<input class="aev-in" data-f="evaluateur" value="' + esc(v('evaluateur')) + '" placeholder="Ex. Mme. Fotso Marie"></label>' +
          '<label class="aev-lab">Date (jj/mm/aaaa)<input class="aev-in" data-f="date" value="' + esc(v('date') || todayFr()) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="aev-lab">Statut du candidat<select class="aev-in" data-f="statutCandidat">' +
            '<option value=""></option>' + opts(STATUTS_CAND, v('statutCandidat')) + '</select></label>' +
          '<label class="aev-lab">Source de candidature<select class="aev-in" data-f="sourceCandidature">' +
            '<option value=""></option>' + SOURCES.map(function (s) { return '<option value="' + esc(s) + '"' + (v('sourceCandidature') === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('') + '</select></label>' +
          '<label class="aev-lab">Salaire souhaité (FCFA)<input class="aev-in" type="number" min="0" step="1000" data-f="salaireSouhaite" value="' + esc(v('salaireSouhaite') || '0') + '"></label>' +
          '<label class="aev-lab">Salaire proposé (FCFA)<input class="aev-in" type="number" min="0" step="1000" data-f="salairePropose" value="' + esc(v('salairePropose') || '0') + '"></label>' +
          '<label class="aev-lab">Recommandation<select class="aev-in" data-f="recommandation">' +
            '<option value="">À décider</option>' + opts(RECOS.filter(function (x) { return x.k; }), v('reco')) + '</select></label>' +
        '</div>' +
        '<div class="aev-fsec" style="display:block;margin-top:12px">Grille de critères — notes de 0 à 5</div>' +
        '<div data-aev="critlist">' + initCrits.map(critRowHtml).join('') + '</div>' +
        '<button class="aev-chipbtn" type="button" data-act="addcrit" style="margin-top:7px">+ Ajouter un critère</button>' +
        '<label class="aev-lab" style="margin-top:10px">Commentaire global<textarea class="aev-in aev-ta" data-f="commentaireGlobal" placeholder="Justification de la décision, synthèse de l\u2019entretien…">' + esc(v('commentaireGlobal')) + '</textarea></label>' +
        '<div class="aev-live" data-aev="dlg-live"></div>' +
        '<div data-aev="dlg-err"></div>' +
      '</div>' +
      '<div class="aev-dialog-foot"><span class="aev-form-hint">Notes bornées 0-5 · total /25 · score /20 · décision justifiée (ISO 30401)</span>' +
      '<span style="display:flex;gap:8px"><button class="aev-btn aev-btn-ghost" data-act="cancel" style="color:var(--aev-text);border-color:var(--aev-line)">Annuler</button>' +
      '<button class="aev-btn aev-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer l\u2019évaluation') + '</button></span></div>';
    $('.aev-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    $('[data-act="addcrit"]', dlg).addEventListener('click', function () {
      var list = $('[data-aev="critlist"]', dlg);
      if (list.children.length >= 8) { toast('8 critères maximum', 'err'); return; }
      list.insertAdjacentHTML('beforeend', critRowHtml());
      live();
    });
    $('[data-aev="critlist"]', dlg).addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-critdel]') : null;
      if (!b) return;
      var list = $('[data-aev="critlist"]', dlg);
      if (list.children.length <= 1) { toast('Au moins un critère est requis', 'err'); return; }
      b.parentElement.remove();
      live();
    });
    function readCrits() {
      return $$('.aev-critedit', dlg).map(function (row) {
        var nom = $('[data-crit="nom"]', row).value.trim();
        var note = Number($('[data-crit="note"]', row).value);
        var com = $('[data-crit="com"]', row).value.trim();
        if (!isFinite(note)) note = 0;
        return { nom: nom, note: Math.round(note * 10) / 10, commentaire: com };
      });
    }
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var crits = readCrits();
      var t = crits.reduce(function (s, c) { return s + (c.note || 0); }, 0);
      t = Math.round(t * 10) / 10;
      var s20 = Math.round(t * 8) / 10;
      var nbN = crits.filter(function (c) { return c.note > 0; }).length;
      var sw = Number(val.salaireSouhaite) || 0;
      var sp = Number(val.salairePropose) || 0;
      var ec = sw > 0 ? Math.round((sw - sp) / sw * 100) : 0;
      var dOk = !String(val.date || '').trim() || /^\d{2}\/\d{2}\/\d{4}$/.test(String(val.date).trim());
      $('[data-aev="dlg-live"]', dlg).innerHTML =
        '<span>Total <b>' + t + '/25</b></span>' +
        '<span>Score <b class="' + (s20 >= SEUILS.scoreTalent ? 'good' : t > 0 && s20 < SEUILS.scoreMin ? 'bad' : '') + '">' + (t > 0 ? s20 + '/20' : 'non notée') + '</b></span>' +
        '<span>Grille <b>' + nbN + '/' + crits.length + '</b></span>' +
        '<span>Écart salarial <b>' + (sw ? ec + ' %' : '—') + '</b></span>' +
        (!dOk ? '<span class="bad">⚠ Date attendue au format jj/mm/aaaa</span>' : '');
    }
    dlg.addEventListener('input', function (e) { if (e.target.closest('[data-f],[data-crit]')) live(); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var crits = readCrits();
      var err = $('[data-aev="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="aev-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.candidat || '').trim()) return fail('Le nom du candidat est obligatoire.');
      if (!String(val.posteVise || '').trim()) return fail('Le poste visé est obligatoire.');
      if (!crits.length) return fail('Au moins un critère est requis.');
      for (var i = 0; i < crits.length; i++) {
        if (!crits[i].nom) return fail('Chaque critère doit avoir un intitulé (ligne ' + (i + 1) + ').');
        if (crits[i].note < 0 || crits[i].note > 5) return fail('La note du critère « ' + crits[i].nom + ' » doit être comprise entre 0 et 5.');
      }
      var dt = String(val.date || '').trim();
      if (dt && !/^\d{2}\/\d{2}\/\d{4}$/.test(dt)) return fail('La date doit être au format jj/mm/aaaa.');
      var sw = Number(val.salaireSouhaite) || 0;
      var sp = Number(val.salairePropose) || 0;
      if (sw < 0 || sp < 0) return fail('Les salaires doivent être positifs ou nuls.');
      var t = Math.round(crits.reduce(function (s, c) { return s + c.note; }, 0) * 10) / 10;
      var rec = {
        candidat: String(val.candidat).trim(),
        evaluateur: String(val.evaluateur || '').trim(),
        date: dt,
        posteVise: String(val.posteVise).trim(),
        salaireSouhaite: sw,
        salairePropose: sp,
        sourceCandidature: String(val.sourceCandidature || '').trim(),
        statutCandidat: String(val.statutCandidat || '').trim(),
        recommandation: String(val.recommandation || '').trim(),
        criteres: crits,
        total: t,
        score20: Math.round(t * 8) / 10,
        commentaireGlobal: String(val.commentaireGlobal || '').trim()
      };
      if (editId) {
        mutate(function (cur) {
          cur.evaluations = cur.evaluations.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Évaluation modifiée', rec.candidat);
        toast('Évaluation mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var rows2 = cur.evaluations;
          var id = rows2.reduce(function (m, x) { var n = Number(x.id); return Math.max(m, isFinite(n) ? n : 0); }, 0) + 1;
          var cp = { id: id, numero: nextNumero(rows2.map(normRow)) };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.evaluations = rows2.concat([cp]);
          return cur;
        }, 'Évaluation créée', rec.candidat);
        toast('Évaluation créée — ' + rec.candidat, 'ok');
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
      var rows2 = cur.evaluations;
      var nid = rows2.reduce(function (m, x) { var n = Number(x.id); return Math.max(m, isFinite(n) ? n : 0); }, 0) + 1;
      var cp = {};
      for (var k in r) if (['reco', 'nbNotes', 'incomplet', 'vierge', 'ecart', 'total', 'score20', 'criteres'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = nid;
      cp.numero = nextNumero(rows2.map(normRow));
      cp.candidat = String(r.candidat) + ' (copie)';
      cp.recommandation = '';
      cp.commentaireGlobal = '';
      cp.statutCandidat = "En cours d'etude";
      cp.date = todayFr();
      cp.criteres = (r.criteres || []).map(function (c) { return { nom: c.nom, note: c.note, commentaire: c.commentaire }; });
      cp.total = r.total;
      cp.score20 = r.score20;
      cur.evaluations = rows2.concat([cp]);
      return cur;
    }, 'Évaluation dupliquée', r.numero);
    toast('Évaluation dupliquée (décision à refaire)', 'ok');
  }
  function closeConfirm() { $$('[data-aev="confirm"],[data-aev="backdrop"][data-aev-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aev-confirm', 'data-aev': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette évaluation ?</h4><p>' + esc(r.numero) + ' — ' + esc(r.candidat) + ' (' + esc(r.posteVise || '—') + '). Cette action est définitive.</p>' +
      '<div class="aev-confirm-row"><button class="aev-btn aev-btn-ghost" data-a="no" style="color:var(--aev-text);border-color:var(--aev-line)">Annuler</button>' +
      '<button class="aev-btn aev-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.evaluations = cur.evaluations.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Évaluation supprimée', r.numero);
      UI.cmp = UI.cmp.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Évaluation supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' évaluations ?') : 'Supprimer 1 évaluation ?';
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'aev-confirm', 'data-aev': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="aev-confirm-row"><button class="aev-btn aev-btn-ghost" data-a="no" style="color:var(--aev-text);border-color:var(--aev-line)">Annuler</button>' +
      '<button class="aev-btn aev-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.evaluations = cur.evaluations.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' évaluations');
      UI.cmp = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' évaluations supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= comparateur de candidats (signature) ================= */
  function closeCompare() { $$('[data-aev="compare"],[data-aev="backdrop"][data-aev-for="compare"]').forEach(function (n) { n.remove(); }); }
  function openCompare() {
    closeCompare();
    var ids = UI.cmp.length >= 2 ? UI.cmp : [];
    if (ids.length < 2) {
      var all = data().slice().sort(function (a, b) { return b.score20 - a.score20; });
      ids = [all[0], all[1]].filter(Boolean).map(function (r) { return String(r.id); });
    }
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (rows.length < 2) { toast('Sélectionnez au moins 2 évaluations à comparer', 'err'); return; }
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'compare' });
    bd.addEventListener('click', closeCompare);
    var p = h('div', { class: 'aev-panel aev-wide', 'data-aev': 'compare', role: 'dialog', 'aria-label': 'Comparateur' });
    var head = '<tr><th>Critère</th>' + rows.map(function (r) { return '<th>' + esc(r.candidat) + '<br><span style="font-weight:600;color:var(--aev-text2)">' + esc(r.numero) + ' · ' + esc(r.posteVise || '—') + '</span></th>'; }).join('') + '</tr>';
    function row2(lab, get, fmt, bestMax) {
      var vals = rows.map(get);
      var numeric = vals.every(function (v) { return typeof v === 'number' && isFinite(v); });
      var mn = numeric ? Math.min.apply(null, vals) : 0, mx = numeric ? Math.max.apply(null, vals) : 0;
      return '<tr><td>' + esc(lab) + '</td>' + rows.map(function (r, i) {
        var v = vals[i];
        var cls = numeric && mn !== mx ? (bestMax ? (v === mx ? ' best' : v === mn ? ' bad' : '') : (v === mn ? ' best' : v === mx ? ' bad' : '')) : '';
        return '<td class="' + cls + '">' + fmt(v, r) + '</td>';
      }).join('') + '</tr>';
    }
    var crits = critUnion(rows);
    var body = crits.map(function (n) {
      return row2(n, function (r) {
        var c = (r.criteres || []).filter(function (x) { return x.nom === n; })[0];
        return c ? c.note : 0;
      }, function (v, r) {
        var c = (r.criteres || []).filter(function (x) { return x.nom === n; })[0];
        return c && c.note > 0 ? c.note + '/5' : '—';
      }, true);
    }).join('') +
      row2('Moyenne des notes', function (r) {
        var vs = (r.criteres || []).filter(function (c) { return c.note > 0; }).map(function (c) { return c.note; });
        return vs.length ? Math.round(vs.reduce(function (s, v) { return s + v; }, 0) / vs.length * 100) / 100 : 0;
      }, function (v) { return v > 0 ? v.toFixed(2) + '/5' : '—'; }, true) +
      row2('Total /25', function (r) { return r.total; }, function (v) { return v > 0 ? String(v) : '—'; }, true) +
      row2('Score /20', function (r) { return r.score20; }, function (v) { return v > 0 ? String(v) : '—'; }, true) +
      row2('Complétude', function (r) { return r.nbNotes / (r.criteres.length || 1); }, function (v, r) { return r.nbNotes + '/' + r.criteres.length; }, true) +
      row2('Recommandation', function () { return 0; }, function (v, r) { return esc(recoMeta(r.reco).lab); }, false) +
      row2('Statut candidat', function () { return 0; }, function (v, r) { return esc(statutMeta(r.statutCandidat).lab); }, false) +
      row2('Évaluateur', function () { return 0; }, function (v, r) { return esc(r.evaluateur || '—'); }, false) +
      row2('Écart salarial', function (r) { return r.salaireSouhaite ? r.ecart : 0; }, function (v, r) { return r.salaireSouhaite ? (r.ecart > 0 ? '-' + r.ecart : '+' + Math.abs(r.ecart)) + ' %' : '—'; }, false);
    var best = rows.slice().filter(function (r) { return r.total > 0; }).sort(function (a, b) { return b.score20 - a.score20; })[0];
    p.innerHTML = '<div class="aev-panel-head"><h3>Comparateur de candidats — à critères constants</h3><button class="aev-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aev-panel-body"><div class="aev-cmp-wrap"><table class="aev-cmp"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="aev-cibles-note" style="margin-top:10px">Vert = la note la plus favorable · Rouge = la moins favorable, critère par critère. ' +
      (best ? 'Score global le plus élevé : <b>' + esc(best.candidat) + '</b> (' + best.score20 + '/20). ' : '') +
      'Les notes sont comparées à critères égaux — la décision finale reste humaine (ISO 30401).</p></div>';
    $('.aev-drawer-x', p).addEventListener('click', closeCompare);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Comparateur ouvert', rows.length + ' évaluations');
  }

  /* ================= analyse par critère ================= */
  function closeAnalyse() { $$('[data-aev="analyse"],[data-aev="backdrop"][data-aev-for="analyse"]').forEach(function (n) { n.remove(); }); }
  function openAnalyse() {
    closeAnalyse();
    var rows = data();
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'analyse' });
    bd.addEventListener('click', closeAnalyse);
    var p = h('div', { class: 'aev-panel', 'data-aev': 'analyse', role: 'dialog', 'aria-label': 'Analyse par critère' });
    var evals = rows.filter(function (r) { return r.total > 0; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.score20; }, 0) / evals.length : 0;
    var crits = critUnion(rows);
    var stats = crits.map(function (n) {
      var vals = [];
      rows.forEach(function (r) { (r.criteres || []).forEach(function (c) { if (c.nom === n && c.note > 0) vals.push(c.note); }); });
      var m = vals.length ? vals.reduce(function (s, v) { return s + v; }, 0) / vals.length : 0;
      return { nom: n, n: vals.length, m: m, mn: vals.length ? Math.min.apply(null, vals) : 0, mx: vals.length ? Math.max.apply(null, vals) : 0 };
    }).sort(function (a, b) { return b.m - a.m; });
    var mxAll = Math.max.apply(null, stats.map(function (s) { return s.m; }).concat([1]));
    var bars = stats.map(function (s) {
      var spread = Math.round((s.mx - s.mn) * 10) / 10;
      return '<div class="aev-sim-arow"><span style="min-width:150px">' + esc(s.nom) + '</span>' +
        '<span class="aev-bar-track"><span class="aev-bar-fill" style="width:' + Math.max(s.m ? 4 : 0, s.m / mxAll * 100) + '%"></span></span>' +
        '<span><b>' + (s.n ? s.m.toFixed(1) : '—') + '</b>/5 · ' + s.n + ' note(s) · écart ' + spread + '</span></div>';
    }).join('');
    var disc = null;
    stats.forEach(function (s) { if (s.n > 1 && (!disc || (s.mx - s.mn) > (disc.mx - disc.mn))) disc = s; });
    var emb = rows.filter(function (r) { return r.reco === 'Embaucher'; }).length;
    var inc = rows.filter(function (r) { return r.incomplet; }).length;
    var tip = '💡 ';
    if (disc) tip += 'Le critère « ' + disc.nom + ' » est le plus discriminant (écart de ' + Math.round((disc.mx - disc.mn) * 10) / 10 + ' pt entre la meilleure et la moins bonne note) — à approfondir en entretien. ';
    tip += 'Les recommandations sont positives à ' + pct(rows.length ? emb / rows.length * 100 : 0) + '. ';
    if (inc) tip += inc + ' grille(s) incomplète(s) faussent les moyennes — à compléter en priorité.';
    else tip += 'Toutes les grilles sont complètes : les moyennes sont fiables.';
    p.innerHTML = '<div class="aev-panel-head"><h3>Analyse par critère — constance de la notation</h3><button class="aev-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aev-panel-body">' +
        '<div class="aev-sim-kpis"><span><b>' + (evals.length ? moy.toFixed(1) : '—') + '</b> score moyen /20</span>' +
          '<span><b>' + stats.length + '</b> critères suivis</span>' +
          '<span><b>' + pct(rows.length ? emb / rows.length * 100 : 0) + '</b> d\u2019avis favorables</span></div>' +
        '<div style="font-size:.72rem;color:var(--aev-text2);margin:8px 0 5px">Note moyenne obtenue par critère :</div>' +
        '<div class="aev-sim-alloc">' + bars + '</div>' +
        '<div class="aev-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' +
      '</div>';
    $('.aev-drawer-x', p).addEventListener('click', closeAnalyse);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Analyse par critère ouverte', '');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-aev="seuils"],[data-aev="backdrop"][data-aev-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'aev-panel', 'data-aev': 'seuils', role: 'dialog', 'aria-label': 'Seuils de notation' });
    p.innerHTML = '<div class="aev-panel-head"><h3>Seuils de notation</h3><button class="aev-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aev-panel-body">' +
        '<p class="aev-cibles-note">Ces seuils alimentent les alertes, les couleurs et le filtre « talents » (Manuel D1 : vivier de talents préservé, décisions justifiées).</p>' +
        '<div class="aev-sim-row"><label for="aev-s1">Seuil d\u2019alerte score (/20)</label><input type="range" id="aev-s1" min="5" max="18" step="1" value="' + SEUILS.scoreMin + '"><input class="aev-in" type="number" min="5" max="18" step="1" data-aev="s1n" value="' + SEUILS.scoreMin + '"></div>' +
        '<div class="aev-sim-row"><label for="aev-s2">Score « talent » (/20)</label><input type="range" id="aev-s2" min="10" max="20" step="1" value="' + SEUILS.scoreTalent + '"><input class="aev-in" type="number" min="10" max="20" step="1" data-aev="s2n" value="' + SEUILS.scoreTalent + '"></div>' +
        '<div class="aev-sim-row"><label for="aev-s3">Écart salarial maximum (%)</label><input type="range" id="aev-s3" min="0" max="50" step="5" value="' + SEUILS.ecartMax + '"><input class="aev-in" type="number" min="0" max="50" step="1" data-aev="s3n" value="' + SEUILS.ecartMax + '"></div>' +
        '<div class="aev-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="aev-btn aev-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.aev-drawer-x', p).addEventListener('click', closeSeuils);
    [['aev-s1', 's1n', 'scoreMin', 5, 18, 1], ['aev-s2', 's2n', 'scoreTalent', 10, 20, 1], ['aev-s3', 's3n', 'ecartMax', 0, 50, 5]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-aev="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.scoreMin = Math.max(5, Math.min(18, Number($('[data-aev="s1n"]', p).value) || SEUILS.scoreMin));
      SEUILS.scoreTalent = Math.max(10, Math.min(20, Number($('[data-aev="s2n"]', p).value) || SEUILS.scoreTalent));
      SEUILS.ecartMax = Math.max(0, Math.min(50, Number($('[data-aev="s3n"]', p).value) || SEUILS.ecartMax));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'alerte < ' + SEUILS.scoreMin + '/20 · talent ≥ ' + SEUILS.scoreTalent + '/20 · écart ≤ ' + SEUILS.ecartMax + ' %');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-aev="journal"],[data-aev="backdrop"][data-aev-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'aev-backdrop', 'data-aev': 'backdrop', 'data-aev-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'aev-panel', 'data-aev': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="aev-panel-head"><h3>Journal d\u2019activité</h3><button class="aev-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="aev-panel-body" data-aev="jlist"></div>';
    $('.aev-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-aev="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="aev-jrow"><span class="aev-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="aev-jact">' + esc(x.action || '') + '</span><span class="aev-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="aev-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var crits = critUnion(rows);
    var head = ['N° Évaluation', 'Candidat', 'Poste visé', 'Évaluateur', 'Date', 'Statut candidat', 'Source', 'Salaire souhaité (FCFA)', 'Salaire proposé (FCFA)', 'Écart (%)', 'Recommandation', 'Total /25', 'Score /20', 'Complétude'].concat(
      crits.map(function (c) { return c + ' (/5)'; })
    ).concat(['Commentaire global']);
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero, r.candidat, r.posteVise, r.evaluateur, jDate(r.date), r.statutCandidat, r.sourceCandidature, r.salaireSouhaite || '', r.salairePropose || '', r.salaireSouhaite ? r.ecart : '', r.recommandation, r.total || '', r.total > 0 ? r.score20 : '', r.nbNotes + '/' + r.criteres.length];
      crits.forEach(function (c) {
        var cc = (r.criteres || []).filter(function (x) { return x.nom === c; })[0];
        cells.push(cc && cc.note > 0 ? cc.note : '');
      });
      cells.push(r.commentaireGlobal);
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-grille-evaluation-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeAnalyse(); closeCompare(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-aev="dialog"]') || $('[data-aev="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { openAnalyse(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { openCompare(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { UI.view = 'cards'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-aev="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle · E export · J journal · P analyse · C comparer · S seuils · K cartes · T tableau · / recherche', ''); }
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
    var root = $('[data-aev="root"]');
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
    renderCharts();
    renderFilters();
    if (UI.view === 'cards') renderCards(); else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-aev="drawer"],[data-aev="dialog"],[data-aev="confirm"],[data-aev="journal"],[data-aev="analyse"],[data-aev="compare"],[data-aev="seuils"]')) {
      $$('[data-aev="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, apiT = null, apiTries = 0, lastSig = '';
  function isOn() { return RE_PAGE.test(location.pathname); }
  function dataSig() {
    try {
      var a = api();
      var n = a && typeof a.getData === 'function' ? (a.getData().evaluations || []).length : -1;
      return n + '|' + (lsData() ? JSON.stringify(lsData()).length : 0);
    } catch (e) { return 'err'; }
  }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-aev');
    shellBuilt = false;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    /* résilience : si __ADMINA_EVAL_API__ tarde, 30 réessais (500 ms),
       le fallback LS direct couvre l'affichage entre-temps */
    clearInterval(apiT); apiTries = 0;
    apiT = setInterval(function () {
      apiTries++;
      if (api() || apiTries >= 30) { clearInterval(apiT); apiT = null; }
      if (active && isOn()) refresh();
    }, 500);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-aev]')) continue;
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
    html.classList.remove('admina-aev');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearInterval(apiT); apiT = null; clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeAnalyse(); closeCompare(); closeSeuils();
    UI.cmp = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
    lastSig = '';
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-aev="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-aev-hide', '1');
      natif.setAttribute('data-aev-olddisp', natif.style.display || '');
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

  window.__ADMINA_EVAL_UI__ = {
    version: '1.0-w1',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    exportCSV: exportCSV,
    openCompare: openCompare,
    openAnalyse: openAnalyse,
    openJournal: openJournal,
    openSeuils: openSeuils
  };
  try { console.info('[ADMINA_EVAL] W1-b actif — Centre de pilotage grille d\u2019évaluation /grille-evaluation'); } catch (e) {}
})();
