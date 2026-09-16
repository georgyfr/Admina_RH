/* =============================================================
   Admina-RH — Suivi Post-Embauche (/suivi-post-embauche) — couche admina
   W2-d : CENTRE DE SUIVI — mécanique de confiance après l'embauche
   -------------------------------------------------------------
   PHILOSOPHIE — /suivi-post-embauche est la MÉCANIQUE DE CONFIANCE
   qui prend le relais après la signature : les points réguliers
   (J+7, 1 mois, 3 mois, 6 mois, 12 mois) entre le nouvel employé,
   son manager et les RH, pour détecter tôt le mal-être comme la
   satisfaction, tracer les échanges et sécuriser la prise de poste.
   Sa matière première est une TIMELINE de points de suivi par
   employé : chaque point a une date, un responsable, un
   ressenti/satisfaction mesuré (score /20 + ressenti 1-5) et se
   conclut par des ACTIONS DÉCIDÉES tracées. Les points manqués
   (date passée sans tenue), les ressentis faibles (score sous
   seuil), les employés sans prochain point planifié, les actions
   non réalisées et les points imminents non préparés sont des
   alertes actionnables — jamais décoratives. Le suivi est
   bienveillant et régulier, jamais une formalité. Ce n'est PAS un
   planning (W2-c) ni une checklist (W2-b) : c'est un fil de suivi
   temporel par personne — la vue Timeline est la signature de la
   page ; la table et les cartes n'en sont que des lectures.
   -------------------------------------------------------------
   - Scope strict : /suivi-post-embauche (RegExp /\/suivi-post-embauche\/?$/)
   - Idempotent (data-ape / data-ape-hide), sans collision (__ADMINA_APE_W2__)
   - Données : window.__ADMINA_APE_API__ (patch chunk W2-d, pont
     bidirectionnel localStorage admina-postembauche-data {suivis:[…]}) →
     fallback localStorage si l'API tarde (30 réessais au boot, sinon
     page native intacte). Champs natifs intacts (eval1/3/6 mois
     mirrorés à l'écriture d'un point mappé) ; points additifs
     (J+7, 12 mois, libres) stockés dans row.points.
   - Croisements optionnels silencieux : __ADMINA_CAND_API__ (W1 base
     candidats) et __ADMINA_SEL_API__ (W1-d sélections) → liens affichés
     dans la fiche si une correspondance existe, sinon rien.
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   - Canon : admina-basecand.js (M25) transposé abc→ape
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_APE_W2__) return;
  window.__ADMINA_APE_W2__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/suivi-post-embauche\/?$/;
  var LS_DATA = 'admina-postembauche-data';
  var LS_UI = 'admina-postembauche-ui';
  var LS_SEUILS = 'admina-postembauche-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', dept: '', sat: '', risk: '', flag: '', ptype: '', view: 'table', sortKey: 'numero', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, dialogMode: '', editId: null, editPt: null, cmp: [], tlEmp: null };

  /* ================= seuils ================= */
  var SEUILS_DEF = { scoreMin: 14, retardJours: 3, imminentJours: 2 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var SATS = [
    { k: 'Tres satisfait', lab: 'Très satisfait', c: '#059669' },
    { k: 'Satisfait', lab: 'Satisfait', c: '#0e7490' },
    { k: 'Neutre', lab: 'Neutre', c: '#64748b' },
    { k: 'Insatisfait', lab: 'Insatisfait', c: '#d97706' },
    { k: 'Tres insatisfait', lab: 'Très insatisfait', c: '#dc2626' }
  ];
  function satMeta(k) { for (var i = 0; i < SATS.length; i++) { if (SATS[i].k === k) return SATS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  var RISKS = [
    { k: 'Faible', lab: 'Faible', c: '#059669' },
    { k: 'Moyen', lab: 'Moyen', c: '#d97706' },
    { k: 'Eleve', lab: 'Élevé', c: '#dc2626' },
    { k: 'Critique', lab: 'Critique', c: '#991b1b' }
  ];
  function riskMeta(k) { for (var i = 0; i < RISKS.length; i++) { if (RISKS[i].k === k) return RISKS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  /* Jalons : J+7/1/3/6 mois dérivés des données natives (évals /20) ;
     12 mois et Autre = uniquement planifiés explicitement (additif). */
  var LADDER = [
    { t: 'J+7', id: 'J7', off: 7, lab: "Point d'accueil (J+7)" },
    { t: '1 mois', id: 'M1', off: 30, lab: 'Point 1 mois (J+30)', nk: 'eval1mois' },
    { t: '3 mois', id: 'M3', off: 90, lab: 'Point 3 mois (J+90)', nk: 'eval3mois' },
    { t: '6 mois', id: 'M6', off: 180, lab: 'Point 6 mois (J+180)', nk: 'eval6mois' },
    { t: '12 mois', id: 'M12', off: 365, lab: 'Point 12 mois (J+365)' },
    { t: 'Autre', id: 'X', off: 90, lab: 'Point libre' }
  ];
  function ladderIdx(t) { for (var i = 0; i < LADDER.length; i++) { if (LADDER[i].t === t) return i; } return LADDER.length; }
  function labFor(t) { var i = ladderIdx(t); return i < LADDER.length ? LADDER[i].lab : (t || 'Point'); }
  function offFor(t) { var i = ladderIdx(t); return i < LADDER.length ? 'J+' + LADDER[i].off : ''; }
  function nativeKeyFor(t) { var i = ladderIdx(t); return i < LADDER.length && LADDER[i].nk ? LADDER[i].nk : null; }
  var STMAP = {
    tenu: { lab: 'Tenu', chip: 'ok', c: '#059669' },
    manque: { lab: 'Manqué', chip: 'err', c: '#dc2626' },
    rattrap: { lab: 'À rattraper', chip: 'warn', c: '#d97706' },
    avenir: { lab: 'À venir', chip: 'info', c: '#0891b2' }
  };
  var RESSENTI = { 1: 'Difficile', 2: 'Mitigé', 3: 'Correct', 4: 'Bien', 5: 'Épanoui' };
  function ressFromScore(v) { return v >= 16 ? 5 : v >= 14 ? 4 : v >= 12 ? 3 : v >= 10 ? 2 : 1; }

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
  function pad3(n) { return String(n).padStart(3, '0'); }
  function truncate(s, n) { s = String(s || ''); return s.length > n ? s.substring(0, n) + '…' : s; }
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
  function nowTs() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function fmtToday() { var d = new Date(); return pad3(d.getDate()).slice(-2) + '/' + pad3(d.getMonth() + 1).slice(-2) + '/' + d.getFullYear(); }
  function daysUntil(s) { var t = tsOf(s); if (!t) return null; return Math.round((t - nowTs()) / 86400000); }
  function addDaysStr(s, days) { var t = tsOf(s); if (!t) return ''; var d = new Date(t + days * 86400000); return pad3(d.getUTCDate()).slice(-2) + '/' + pad3(d.getUTCMonth() + 1).slice(-2) + '/' + d.getUTCFullYear(); }
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
  function toastsZone() { var z = $('[data-ape="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-ape', 'toasts'); z.className = 'ape-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'ape-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_APE_API__ || null; }
  function rawRows() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.suivis) { try { d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e2) { d = null; } }
    if (!d || !d.suivis || !Array.isArray(d.suivis)) return [];
    return d.suivis;
  }
  function hasLS() { try { var d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); return !!(d && d.suivis && d.suivis.length); } catch (e) { return false; } }
  /* Dérivation des jalons manquants : les points stockés gagnent toujours ;
     1/3/6 mois mirrorés depuis les évals natives (passées seulement) ;
     J+7 passé = accueil réputé effectué (bienveillance, pas de faux manqué) ;
     12 mois & Autre ne sont jamais dérivés — seulement planifiés. */
  function derivePoints(r) {
    var out = [], seen = {};
    var stored = Array.isArray(r.points) ? r.points : [];
    stored.forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      var q = {};
      for (var k in p) q[k] = p[k];
      q.id = String(p.id || 'pt' + (out.length + 1));
      q.type = String(p.type || 'Autre');
      q.date = String(p.date || '');
      q.tenu = !!p.tenu;
      q.score = (p.score == null || p.score === '') ? null : Math.max(0, Math.min(20, Number(p.score) || 0));
      q.ressenti = Math.max(0, Math.min(5, Number(p.ressenti) || 0));
      q.responsable = String(p.responsable || '');
      q.actions = Array.isArray(p.actions) ? p.actions.filter(function (a) { return a && a.lib; }).map(function (a) { return { lib: String(a.lib), fait: !!a.fait }; }) : [];
      q.notes = String(p.notes || '');
      out.push(q);
      if (!seen[q.type]) seen[q.type] = 1;
    });
    var em = tsOf(r.dateEmbauche);
    if (em) {
      LADDER.forEach(function (L) {
        if (seen[L.t]) return;
        if (L.t === '12 mois' || L.t === 'Autre') return;
        var d = addDaysStr(r.dateEmbauche, L.off);
        if (!d) return;
        var p = { id: 'd-' + L.id, type: L.t, date: d, tenu: false, score: null, ressenti: 0, responsable: '', actions: [], notes: '', derive: 1 };
        if (L.nk) {
          var v = Number(r[L.nk]);
          var ok = isFinite(v) && v > 0;
          if (tsOf(d) < nowTs()) { p.tenu = ok; p.score = ok ? v : null; p.ressenti = ok ? ressFromScore(v) : 0; }
        } else if (L.t === 'J+7') {
          if (tsOf(d) < nowTs()) { p.tenu = true; p.notes = "Accueil réputé effectué (jalon non tracé nativement)"; }
        }
        out.push(p);
      });
    }
    out.sort(function (a, b) { var da = tsOf(a.date), db = tsOf(b.date); if (da !== db) return da - db; return ladderIdx(a.type) - ladderIdx(b.type); });
    return out;
  }
  function data() {
    var rows = rawRows();
    if (!rows.length) return [];
    var today = nowTs();
    return rows.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.numero = u.numero || ('SPE-' + pad3(u.id));
      u.employe = u.employe || '—';
      u.anciennete = Number(u.anciennete) || 0;
      u.pts = derivePoints(u);
      var tenus = 0, manque = 0, rattrap = 0, avenir = 0, scores = [], actions = 0, actionsDone = 0;
      var dernier = null, prochain = null, imminent = false, faible = false;
      var sat = satMeta(u.satisfaction);
      u.pts.forEach(function (p) {
        var t = tsOf(p.date);
        var du = daysUntil(p.date);
        if (p.tenu) p.st = 'tenu';
        else if (t && t < today) { var late = Math.floor((today - t) / 86400000); p.st = late > SEUILS.retardJours ? 'manque' : 'rattrap'; }
        else p.st = 'avenir';
        if (p.st === 'tenu') { tenus++; if (p.score != null && p.score > 0) { scores.push(p.score); if (p.score < SEUILS.scoreMin) faible = true; } if (!dernier || (t && tsOf(dernier.date) <= t)) dernier = p; }
        else if (p.st === 'manque') manque++;
        else if (p.st === 'rattrap') rattrap++;
        else { avenir++; if (t && !prochain && t >= today) prochain = p; if (du != null && du >= 0 && du <= SEUILS.imminentJours) imminent = true; }
        p.actions.forEach(function (a) { actions++; if (a.fait) actionsDone++; });
      });
      u.pts.slice().sort(function (a, b) { return tsOf(a.date) - tsOf(b.date); }).forEach(function (p) { if (p.st === 'avenir' && !prochain) prochain = p; });
      u.pTenus = tenus; u.pManques = manque; u.pRattrap = rattrap; u.pAvenir = avenir; u.pTotal = u.pts.length;
      u.moyScore = scores.length ? scores.reduce(function (s, v) { return s + v; }, 0) / scores.length : 0;
      u.dernier = dernier; u.prochain = prochain;
      u.fManque = manque > 0;
      u.fFaible = faible || sat.k === 'Insatisfait' || sat.k === 'Tres insatisfait';
      u.fSans = !prochain;
      u.fAction = actionsDone < actions;
      u.fImminent = imminent;
      u.fNext30 = !!(prochain && daysUntil(prochain.date) != null && daysUntil(prochain.date) <= 30);
      u.fAvenir = avenir > 0;
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function ptById(row, pid) { for (var i = 0; i < (row.pts || []).length; i++) { if (String(row.pts[i].id) === String(pid)) return row.pts[i]; } return null; }
  function nextNumero(rows) {
    var mx = 0;
    rows.forEach(function (r) {
      var a = Number(r.id); if (isFinite(a)) mx = Math.max(mx, a);
      var m = /^SPE-(\d+)$/.exec(String(r.numero || ''));
      if (m) mx = Math.max(mx, Number(m[1]));
    });
    return 'SPE-' + pad3(mx + 1);
  }
  function nextPointId(row) {
    var mx = 0;
    (row.pts || []).forEach(function (p) { var m = /^pt(\d+)$/.exec(String(p.id || '')); if (m) mx = Math.max(mx, Number(m[1])); });
    return 'pt' + (mx + 1);
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    var cur = null;
    if (a && typeof a.setData === 'function') {
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.suivis) { var ls1 = null; try { ls1 = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e1) {} cur = { suivis: (ls1 && ls1.suivis) || [] }; }
      var nv = fn(cur);
      if (!nv || !nv.suivis) { toast('Écriture impossible — données invalides', 'err'); return false; }
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh(); setTimeout(refresh, 80); setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct (résilience : l'API n'est pas là, on écrit quand même) */
    var cur2 = null;
    try { cur2 = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e2) {}
    if (!cur2 || !cur2.suivis) cur2 = { suivis: [] };
    var nv2 = fn(cur2);
    if (!nv2 || !nv2.suivis) { toast('Écriture impossible — données invalides', 'err'); return false; }
    try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e3) { toast('Stockage local indisponible', 'err'); return false; }
    if (actionLabel) jlog(actionLabel, detail || '');
    refresh(); setTimeout(refresh, 80); setTimeout(refresh, 350);
    return false;
  }

  /* ================= croisements optionnels (silencieux) ================= */
  function candLink(r) {
    try {
      var a = window.__ADMINA_CAND_API__;
      if (a && typeof a.getData === 'function') {
        var cs = (a.getData() || {}).candidats || [];
        var nm = norm(r.employe);
        for (var i = 0; i < cs.length; i++) {
          var c = cs[i];
          var full = norm((c.prenom || '') + ' ' + (c.nom || '')) || norm(c.nomComplet || '');
          if (full && nm && (full.indexOf(nm) > -1 || nm.indexOf(full) > -1)) return { lab: 'Candidat ' + (c.id || ''), href: '/Domaine1_Recrutement_Candidats/base-candidats' };
        }
      }
    } catch (e) {}
    return null;
  }
  function selLink(r) {
    try {
      var a = window.__ADMINA_SEL_API__;
      if (a && typeof a.getData === 'function') {
        var ss = (a.getData() || {}).selections || [];
        var nm = norm(r.employe);
        for (var i = 0; i < ss.length; i++) {
          var s = ss[i];
          if (norm(s.candidat || '') && nm && (norm(s.candidat).indexOf(nm) > -1 || nm.indexOf(norm(s.candidat)) > -1)) return { lab: 'Sélection ' + (s.numero || s.id || ''), href: '/Domaine1_Recrutement_Candidats/selections' };
        }
      }
    } catch (e) {}
    return null;
  }

  /* ================= alertes (AAA → filtres) ================= */
  function computeAlerts(rows) {
    var out = [];
    var manq = rows.filter(function (r) { return r.fManque; });
    if (manq.length) out.push({ tone: 'err', txt: manq.reduce(function (s, r) { return s + r.pManques; }, 0) + ' point(s) de suivi manqué(s) — date passée sans tenue (' + manq.slice(0, 2).map(function (r) { return r.numero + ' ' + r.employe; }).join(', ') + '…)', f: '__manque' });
    var faib = rows.filter(function (r) { return r.fFaible; });
    if (faib.length) out.push({ tone: 'warn', txt: faib.length + ' employé(s) avec un ressenti/satisfaction faible (score < ' + SEUILS.scoreMin + '/20 ou insatisfait) — ' + faib.slice(0, 2).map(function (r) { return r.employe; }).join(', ') + '…', f: '__faible' });
    var sans = rows.filter(function (r) { return r.fSans; });
    if (sans.length) out.push({ tone: 'warn', txt: sans.length + ' employé(s) sans prochain point planifié — planifier la suite du fil (' + sans.slice(0, 2).map(function (r) { return r.employe; }).join(', ') + '…)', f: '__sans' });
    var act = rows.filter(function (r) { return r.fAction; });
    if (act.length) out.push({ tone: 'info', txt: act.length + ' employé(s) avec des actions décidées non réalisées — un point n\u2019est terminé que lorsque ses actions sont tracées (' + act.slice(0, 2).map(function (r) { return r.employe; }).join(', ') + '…)', f: '__action' });
    var imm = rows.filter(function (r) { return r.fImminent; });
    if (imm.length) out.push({ tone: 'info', txt: 'Point(s) imminent(s) (J-' + SEUILS.imminentJours + ' max) à préparer — ' + imm.slice(0, 2).map(function (r) { return r.employe + ' (' + (r.prochain ? jDate(r.prochain.date) : '—') + ')'; }).join(', '), f: '__imminent' });
    return out.filter(function (a) { return a.txt; }).slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function flagMatch(r) {
    if (!UI.flag) return true;
    if (UI.flag === '__manque') return r.fManque;
    if (UI.flag === '__faible') return r.fFaible;
    if (UI.flag === '__sans') return r.fSans;
    if (UI.flag === '__action') return r.fAction;
    if (UI.flag === '__imminent') return r.fImminent;
    if (UI.flag === '__next30') return r.fNext30;
    if (UI.flag === '__avenir') return r.fAvenir;
    if (UI.flag === '__ok') return !r.fManque && !r.fFaible && !r.fSans;
    return true;
  }
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.dept && norm(r.departement) !== norm(UI.dept)) return false;
      if (UI.sat && r.satisfaction !== UI.sat) return false;
      if (UI.risk && r.risqueDepart !== UI.risk) return false;
      if (!flagMatch(r)) return false;
      if (UI.ptype && !r.pts.some(function (p) { return p.type === UI.ptype; })) return false;
      if (q && !(norm(r.employe).indexOf(q) > -1 || norm(r.numero).indexOf(q) > -1 || norm(r.poste).indexOf(q) > -1 || norm(r.departement).indexOf(q) > -1 || norm(r.commentaires).indexOf(q) > -1 || r.pts.some(function (p) { return norm(p.responsable).indexOf(q) > -1 || norm(p.notes).indexOf(q) > -1 || p.actions.some(function (a) { return norm(a.lib).indexOf(q) > -1; }); }))) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'tenus') { va = a.pTenus; vb = b.pTenus; }
      else if (k === 'dernier') { va = a.dernier ? dateKey(a.dernier.date) : 0; vb = b.dernier ? dateKey(b.dernier.date) : 0; }
      else if (k === 'prochain') { va = a.prochain ? dateKey(a.prochain.date) : 99999999; vb = b.prochain ? dateKey(b.prochain.date) : 99999999; }
      else if (k === 'score') { va = a.moyScore; vb = b.moyScore; }
      else if (k === 'embauche') { va = dateKey(a.dateEmbauche); vb = dateKey(b.dateEmbauche); }
      else if (k === 'anci') { va = a.anciennete; vb = b.anciennete; }
      else if (k === 'satisfaction') { va = SATS.map(function (s) { return s.k; }).indexOf(a.satisfaction); vb = SATS.map(function (s) { return s.k; }).indexOf(b.satisfaction); if (va < 0) va = 99; if (vb < 0) vb = 99; }
      else if (k === 'risque') { va = RISKS.map(function (s) { return s.k; }).indexOf(a.risqueDepart); vb = RISKS.map(function (s) { return s.k; }).indexOf(b.risqueDepart); if (va < 0) va = 99; if (vb < 0) vb = 99; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.dept ? 1 : 0) + (UI.sat ? 1 : 0) + (UI.risk ? 1 : 0) + (UI.flag ? 1 : 0) + (UI.ptype ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.dept = ''; UI.sat = ''; UI.risk = ''; UI.flag = ''; UI.ptype = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Suivi\s+Post[-\s]?Embauche/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    var root = $('[data-ape="root"]');
    if (!natif) {
      /* fallback LS : pas de page native montable → rendu autonome si des
         données locales existent, sinon page native intacte (boot ≤ 30). */
      if (!hasLS()) return false;
      if (root) return true;
      var host = $('main') || $('.MuiContainer-root') || document.body;
      root = h('section', { 'data-ape': 'root', class: 'ape-root', 'data-ape-sa': '1' });
      host.insertBefore(root, host.firstChild);
      return true;
    }
    if (!root) {
      root = h('section', { 'data-ape': 'root', class: 'ape-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-ape-page')) {
      page.setAttribute('data-ape-page', '1');
      page.setAttribute('data-ape-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-ape-hide')) {
      natif.setAttribute('data-ape-hide', '1');
      natif.setAttribute('data-ape-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-ape="root"]'); if (root) root.remove();
    $$('[data-ape-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-ape-oldw') || '';
      n.removeAttribute('data-ape-page');
      n.removeAttribute('data-ape-oldw');
    });
    $$('[data-ape-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-ape-olddisp') || '';
      n.removeAttribute('data-ape-hide');
      n.removeAttribute('data-ape-olddisp');
    });
    $$('[data-ape]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-ape="root"]');
    var natif = conteneurNatif();
    if (!natif) { toast('Tableau natif indisponible', 'err'); return; }
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'ape-btn ape-btn-primary ape-backbtn', 'data-ape': 'back' }, 'Revenir au Centre de suivi');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'suivi-post-embauche');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    tl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v16"/><circle cx="12" cy="6" r="2.1"/><circle cx="12" cy="12" r="2.1"/><circle cx="12" cy="18" r="2.1"/></svg>',
    plan: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M12 14v4M10 16h4"/></svg>',
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
    heart: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C7 16.5 3 13.3 3 9.2 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.3 1-1.4 2.6-2.3 4.3-2.3 2.5 0 4.7 1.9 4.7 4.7 0 4.1-4 7.3-9 11.8z"/></svg>'
  };
  var USER_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/><path d="M17.5 13.5 19 15l3-3"/></svg>';

  function buildShell() {
    var root = $('[data-ape="root"]');
    if (!root || $('[data-ape="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="ape-hero" data-ape="hero">' +
        '<div class="ape-hero-main">' +
          '<div class="ape-hero-title">' +
            '<span class="ape-hero-ico" aria-hidden="true">' + USER_ICON + '</span>' +
            '<div><h2 class="ape-h2">Centre de suivi — Post-Embauche</h2>' +
            '<p class="ape-hero-sub" data-ape="herosub"></p></div>' +
          '</div>' +
          '<div class="ape-hero-actions">' +
            '<button class="ape-btn" data-ape="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="ape-btn" data-ape="btn-tl" title="Vue Timeline — fil de suivi (K)">' + ICO.tl + 'Timeline</button>' +
            '<button class="ape-btn" data-ape="btn-plan" title="Planifier un point de suivi (P)">' + ICO.plan + 'Planifier un point</button>' +
            '<button class="ape-btn" data-ape="btn-seuils" title="Seuils de suivi">' + ICO.seuils + 'Seuils</button>' +
            '<button class="ape-btn" data-ape="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="ape-btn" data-ape="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="ape-btn ape-btn-primary" data-ape="btn-new" title="Nouveau suivi (N)">' + ICO.plus + 'Nouveau suivi</button>' +
          '</div>' +
        '</div>' +
        '<div class="ape-hero-alerts" data-ape="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="ape-kpis" data-ape="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="ape-charts" data-ape="charts">' +
        '<div class="ape-chart-card"><div class="ape-chart-title">Points de suivi par état</div><div class="ape-donut-wrap" data-ape="donut"></div></div>' +
        '<div class="ape-chart-card"><div class="ape-chart-title">Satisfaction moyenne par département</div><div class="ape-bars" data-ape="bars"></div></div>' +
        '<div class="ape-chart-card"><div class="ape-chart-title">Points par type de jalon</div><div class="ape-bars" data-ape="types"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="ape-toolbar" data-ape="toolbar">' +
        '<div class="ape-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (employé, poste, département, responsable, notes…)" data-ape="search" aria-label="Rechercher un employé suivi" /></div>' +
        '<select data-ape="f-dept" class="ape-sel" aria-label="Filtrer par département"></select>' +
        '<select data-ape="f-sat" class="ape-sel" aria-label="Filtrer par satisfaction"></select>' +
        '<select data-ape="f-risk" class="ape-sel" aria-label="Filtrer par risque de départ"></select>' +
        '<select data-ape="f-flag" class="ape-sel" aria-label="Filtrer par état du suivi"></select>' +
        '<button class="ape-chipbtn" data-ape="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="ape-count" data-ape="count"></span>' +
        '<div class="ape-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="ape-vbtn" data-ape="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="ape-vbtn" data-ape="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
          '<button class="ape-vbtn" data-ape="v-tl" title="Vue Timeline — fil de suivi (K)">' + ICO.tl + 'Timeline</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-ape="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-ape="selbar"></div>' +

      /* PIED */
      '<div class="ape-foot">Mécanique de confiance post-embauche — points réguliers, ressentis mesurés, actions tracées · bienveillance & régularité, jamais une formalité · journal d\u2019audit actif · seuils configurables · <button class="ape-link" data-ape="btn-native">Afficher le tableau natif</button></div>';

    $('[data-ape="btn-new"]', root).addEventListener('click', function () { openDialog('employe', null, null); });
    $('[data-ape="btn-plan"]', root).addEventListener('click', function () { openDialog('point', UI.tlEmp || UI.drawerId, null); });
    $('[data-ape="btn-tl"]', root).addEventListener('click', function () { UI.view = 'timeline'; saveUI(); refresh(); });
    $('[data-ape="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-ape="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'suivi-post-embauche'); window.print(); });
    $('[data-ape="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-ape="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-ape="btn-native"]', root).addEventListener('click', showNative);
    if (!conteneurNatif()) $('[data-ape="btn-native"]', root).style.display = 'none';
    $('[data-ape="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-ape="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-ape="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-ape="f-dept"]', root).addEventListener('change', function (e) { UI.dept = e.target.value; UI.page = 0; refresh(); });
    $('[data-ape="f-sat"]', root).addEventListener('change', function (e) { UI.sat = e.target.value; UI.page = 0; refresh(); });
    $('[data-ape="f-risk"]', root).addEventListener('change', function (e) { UI.risk = e.target.value; UI.page = 0; refresh(); });
    $('[data-ape="f-flag"]', root).addEventListener('change', function (e) { UI.flag = e.target.value; UI.page = 0; refresh(); });
    $('[data-ape="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-ape="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
    $('[data-ape="v-tl"]', root).addEventListener('click', function () { UI.view = 'timeline'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var tenus = 0, manque = 0, total = 0, allScores = [];
    rows.forEach(function (r) { tenus += r.pTenus; manque += r.pManques + r.pRattrap; total += r.pTotal; r.pts.forEach(function (p) { if (p.st === 'tenu' && p.score > 0) allScores.push(p.score); }); });
    var moy = allScores.length ? (allScores.reduce(function (s, v) { return s + v; }, 0) / allScores.length) : 0;
    var sub = rows.length + ' employé' + (rows.length > 1 ? 's' : '') + ' suivi' + (rows.length > 1 ? 's' : '') +
      ' · ' + tenus + ' point' + (tenus > 1 ? 's' : '') + ' tenu' + (tenus > 1 ? 's' : '') +
      ' · ' + manque + ' en retard' +
      ' · satisfaction moyenne ' + (allScores.length ? moy.toFixed(1) : '—') + '/20';
    $('[data-ape="herosub"]').textContent = sub;
    var zone = $('[data-ape="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="ape-alert ' + a.tone + '" data-ape="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.ape-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        UI.flag = f;
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var depts = {}, tenus = 0, total = 0, manque = 0, nbFaible = 0, nbSans = 0, nbNext30 = 0;
    rows.forEach(function (r) {
      if (r.departement) depts[r.departement] = 1;
      tenus += r.pTenus; total += r.pTotal; manque += r.pManques;
      if (r.fFaible) nbFaible++;
      if (r.fSans) nbSans++;
      if (r.fNext30) nbNext30++;
    });
    var kpis = [
      { k: '', t: 'EMPLOYÉS SUIVIS', v: String(rows.length), s: Object.keys(depts).length + ' départements · ' + total + ' points tracés', cls: '' },
      { k: '', t: 'POINTS TENUS', v: String(tenus), s: 'sur ' + total + ' jalon(s) au fil', cls: '' },
      { k: '__manque', t: 'POINTS MANQUÉS', v: String(manque), s: 'date passée sans tenue', cls: manque > 0 ? 'bad' : '' },
      { k: '__faible', t: 'SATISFACTION FAIBLE', v: String(nbFaible), s: 'score < ' + SEUILS.scoreMin + '/20 ou insatisfait', cls: nbFaible > 0 ? 'bad' : '' },
      { k: '__sans', t: 'SANS PROCHAIN POINT', v: String(nbSans), s: 'aucun jalon planifié', cls: nbSans > 0 ? 'bad' : '' },
      { k: '__next30', t: 'PROCHAIN ≤ 30 J', v: String(nbNext30), s: 'points à tenir sous 30 jours', cls: '' }
    ];
    var zone = $('[data-ape="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="ape-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.flag === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="ape-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="ape-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="ape-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.ape-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.flag = UI.flag === k ? '' : k;
        if (UI.flag) { UI.q = ''; UI.dept = ''; UI.sat = ''; UI.risk = ''; UI.ptype = ''; }
        UI.page = 0;
        refresh();
      });
    });
  }

  function donutSvg(parts, total, lab) {
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Points de suivi par état">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">' + esc(lab) + '</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-ape="donut"]');
    var tenus = 0, manque = 0, rattrap = 0, avenir = 0;
    rows.forEach(function (r) { tenus += r.pTenus; manque += r.pManques; rattrap += r.pRattrap; avenir += r.pAvenir; });
    var total = tenus + manque + rattrap + avenir;
    var parts = [
      { k: 'tenu', lab: 'Tenus', c: STMAP.tenu.c, v: tenus },
      { k: 'manque', lab: 'Manqués', c: STMAP.manque.c, v: manque },
      { k: 'rattrap', lab: 'À rattraper', c: STMAP.rattrap.c, v: rattrap },
      { k: 'avenir', lab: 'À venir', c: STMAP.avenir.c, v: avenir }
    ];
    zone.innerHTML = donutSvg(parts, total, 'points') +
      '<div class="ape-donut-legend">' + parts.map(function (p) {
        return '<span class="ape-dl-item' + (UI.flag === '__manque' && (p.k === 'manque' || p.k === 'rattrap') ? ' on' : '') + '" data-st="' + p.k + '" role="button" tabindex="0">' +
          '<span class="ape-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="ape-dl-val">' + p.v + ' · ' + pct(total ? p.v / total * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.ape-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        resetFilters();
        if (k === 'manque' || k === 'rattrap') UI.flag = '__manque';
        else if (k === 'avenir') UI.flag = '__avenir';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) return '<div class="ape-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="ape-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="ape-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="ape-bar-track"><span class="ape-bar-fill" style="width:' + w + '%' + (it.c ? ';background:' + it.c : '') + '"></span></span>' +
        '<span class="ape-bar-val">' + esc(it.val != null ? it.val : it.v) + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-ape="bars"]');
    var map = {};
    rows.forEach(function (r) {
      var d = r.departement || '—';
      if (!map[d]) map[d] = { k: d, s: 0, n: 0 };
      if (r.moyScore > 0) { map[d].s += r.moyScore; map[d].n++; }
    });
    var items = Object.keys(map).map(function (k) {
      var m = map[k];
      var moy = m.n ? m.s / m.n : 0;
      return { key: k, name: k, v: m.n ? Math.round(moy * 10) : 0, val: m.n ? moy.toFixed(1) + '/20 (' + m.n + ' emp.)' : '—', c: moy && moy < SEUILS.scoreMin ? 'linear-gradient(90deg,#f59e0b,#dc2626)' : '' };
    }).filter(function (it) { return it.v > 0; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items);
    $$('.ape-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        resetFilters();
        UI.dept = k;
        refresh();
      });
    });
    var z2 = $('[data-ape="types"]');
    var items2 = LADDER.filter(function (L) { return L.t !== 'Autre'; }).map(function (L) {
      var tot = 0, ten = 0;
      rows.forEach(function (r) { r.pts.forEach(function (p) { if (p.type === L.t) { tot++; if (p.st === 'tenu') ten++; } }); });
      return { key: L.t, name: L.lab, v: tot, val: tot ? ten + '/' + tot + ' tenus' : '0', c: STMAP.tenu.c };
    }).filter(function (it) { return it.v > 0; });
    z2.innerHTML = barRowsHtml(items2);
    $$('.ape-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        resetFilters();
        UI.ptype = k;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var depts = {};
    rows.forEach(function (r) { if (r.departement) depts[r.departement] = 1; });
    var sel = $('[data-ape="f-dept"]');
    sel.innerHTML = '<option value="">Département : tous</option>' + Object.keys(depts).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.dept === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel2 = $('[data-ape="f-sat"]');
    sel2.innerHTML = '<option value="">Satisfaction : toutes</option>' + SATS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.sat === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel3 = $('[data-ape="f-risk"]');
    sel3.innerHTML = '<option value="">Risque : tous</option>' + RISKS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.risk === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel4 = $('[data-ape="f-flag"]');
    sel4.innerHTML = '<option value="">État du suivi : tous</option>' +
      '<option value="__manque"' + (UI.flag === '__manque' ? ' selected' : '') + '>Points manqués</option>' +
      '<option value="__faible"' + (UI.flag === '__faible' ? ' selected' : '') + '>Satisfaction faible</option>' +
      '<option value="__sans"' + (UI.flag === '__sans' ? ' selected' : '') + '>Sans prochain point</option>' +
      '<option value="__action"' + (UI.flag === '__action' ? ' selected' : '') + '>Actions en attente</option>' +
      '<option value="__imminent"' + (UI.flag === '__imminent' ? ' selected' : '') + '>Point imminent</option>' +
      '<option value="__next30"' + (UI.flag === '__next30' ? ' selected' : '') + '>Prochain point ≤ 30 j</option>' +
      '<option value="__avenir"' + (UI.flag === '__avenir' ? ' selected' : '') + '>Points à venir</option>' +
      '<option value="__ok"' + (UI.flag === '__ok' ? ' selected' : '') + '>Suivi à jour</option>';
    $('[data-ape="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-ape="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' employés';
  }

  /* ================= cellules ================= */
  function satChip(r) {
    var sm = satMeta(r.satisfaction);
    return '<span class="ape-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function riskChip(r) {
    var rm = riskMeta(r.risqueDepart);
    return '<span class="ape-chip st" style="background:' + rm.c + '18;border-color:' + rm.c + '66;color:' + rm.c + '" title="Risque de départ : ' + esc(rm.lab) + '">' + esc(rm.lab) + '</span>';
  }
  function scoreCell(score) {
    if (score == null || !(score > 0)) return '<span class="ape-score zero" title="Non mesuré">—</span>';
    var cls = score < SEUILS.scoreMin ? ' low' : score >= 16 ? ' hi' : ' mid';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="ape-score' + cls + '">' + score + '</span>' +
      '<span class="ape-scorebar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(score / 20 * 100)) + '%"></i></span></span>';
  }
  function starsHtml(n) {
    n = Math.max(0, Math.min(5, Number(n) || 0));
    if (!n) return '';
    var s = '';
    for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return '<span class="ape-stars" role="img" aria-label="Ressenti ' + n + ' sur 5 (' + RESSENTI[n] + ')">' + s + '</span>';
  }
  function prochainCell(r) {
    var out = '';
    if (r.prochain) {
      var du = daysUntil(r.prochain.date);
      var cls = (du != null && du >= 0 && du <= SEUILS.imminentJours) ? 'warn' : 'info';
      out += '<span class="ape-chip ' + cls + '" title="Prochain point : ' + esc(labFor(r.prochain.type)) + '">' + esc(r.prochain.type) + ' · ' + esc(jDate(r.prochain.date)) + (du != null && du >= 0 && du <= SEUILS.imminentJours ? ' · J-' + du : '') + '</span>';
    } else if (r.pManques > 0) {
      out += '<span class="ape-chip err" title="Aucun point planifié — des points sont manqués">à replanifier</span>';
    } else {
      out += '<span class="ape-chip neutral">aucun planifié</span>';
    }
    if (r.pManques > 0) out += ' <span class="ape-chip err" title="Points manqués (date passée sans tenue)">' + r.pManques + ' manqué' + (r.pManques > 1 ? 's' : '') + '</span>';
    else if (r.pRattrap > 0) out += ' <span class="ape-chip warn" title="Points à rattraper rapidement">' + r.pRattrap + ' à rattraper</span>';
    return out;
  }
  function ptsDots(r) {
    var slots = ['J+7', '1 mois', '3 mois', '6 mois', '12 mois'];
    return '<span class="ape-dots" aria-hidden="true">' + slots.map(function (t) {
      var p = null;
      r.pts.forEach(function (x) { if (x.type === t && (!p || tsOf(x.date) > tsOf(p.date))) p = x; });
      if (!p) return '<i class="ape-dotslot empty" title="' + esc(t) + ' : non planifié"></i>';
      return '<i class="ape-dotslot ' + p.st + '" title="' + esc(t) + ' : ' + esc(STMAP[p.st].lab) + (p.st === 'tenu' && p.score ? ' · ' + p.score + '/20' : '') + '"></i>';
    }).join('') + '</span>';
  }

  /* ================= vue table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var tenus = 0, manque = 0, scores = [];
    all.forEach(function (r) { tenus += r.pTenus; manque += r.pManques; r.pts.forEach(function (p) { if (p.st === 'tenu' && p.score > 0) scores.push(p.score); }); });
    var moy = scores.length ? (scores.reduce(function (s, v) { return s + v; }, 0) / scores.length).toFixed(1) : '—';
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = 'none';
      if (key === sortKey) aria = dir < 0 ? 'descending' : 'ascending';
      return '<th' + (key ? ' data-sort="' + key + '" aria-sort="' + aria + '"' : ' aria-sort="none"') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="ape-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'ape-th-chk') + th('N°', 'numero') + th('Employé', 'nom') + th('Poste', 'poste') + th('Département', 'dept') +
      th('Embauche', 'embauche') + th('Ancienneté', 'anci') + th('Points', 'tenus') + th('Dernier point', 'dernier') +
      th('Prochain point', 'prochain') + th('Satisfaction', 'satisfaction') + th('Risque', 'risque') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(String(r.id)) + '">' +
        '<td><input type="checkbox" class="ape-chk" data-chk="' + esc(String(r.id)) + '"' + (UI.cmp.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.employe) + '"></td>' +
        '<td class="ape-num">' + esc(r.numero) + '</td>' +
        '<td><span class="ape-poste" data-open="' + esc(String(r.id)) + '">' + esc(r.employe) + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.poste || '—') + '</td>' +
        '<td>' + (r.departement ? '<span class="ape-chip neutral">' + esc(r.departement) + '</span>' : '—') + '</td>' +
        '<td class="ape-num">' + esc(jDate(r.dateEmbauche) || '—') + '</td>' +
        '<td><span class="ape-anci">' + r.anciennete + ' mois</span></td>' +
        '<td><span style="display:inline-flex;align-items:center;gap:7px">' + ptsDots(r) + '<span class="ape-num">' + r.pTenus + '/' + r.pTotal + '</span></span></td>' +
        '<td>' + (r.dernier ? '<span class="ape-num">' + esc(r.dernier.type) + ' · ' + esc(jDate(r.dernier.date)) + '</span> ' + scoreCell(r.dernier.score) : '—') + '</td>' +
        '<td>' + prochainCell(r) + '</td>' +
        '<td>' + satChip(r) + '</td>' +
        '<td>' + riskChip(r) + '</td>' +
        '<td><div class="ape-actions">' +
          '<button class="ape-ic" data-open="' + esc(String(r.id)) + '" title="Fiche & fil de suivi">' + ICO.eye + '</button>' +
          '<button class="ape-ic" data-edit="' + esc(String(r.id)) + '" title="Modifier le suivi">' + ICO.edit + '</button>' +
          '<button class="ape-ic" data-plan="' + esc(String(r.id)) + '" title="Planifier un point">' + ICO.plan + '</button>' +
          '<button class="ape-ic" data-dup="' + esc(String(r.id)) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="ape-ic danger" data-del="' + esc(String(r.id)) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="ape-tfoot"><td></td><td colspan="12">TOTAL ' + all.length + ' employés · ' + tenus + ' points tenus · ' + manque + ' manqués · satisfaction moyenne ' + moy + '/20</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="ape-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="ape-sel" data-ape="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="ape-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="ape-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-ape="content"]');
    card.innerHTML = '<div class="ape-tblcard"><div class="ape-tblwrap"><table class="ape-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="13"><div class="ape-empty">Aucun employé ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'nom' || k === 'numero' || k === 'poste' || k === 'dept' ? 1 : -1; }
        refresh();
      });
    });
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) UI.cmp.push(id);
        if (!c.checked && i > -1) UI.cmp.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog('employe', b.getAttribute('data-edit'), null); }); });
    $$('[data-plan]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog('point', b.getAttribute('data-plan'), null); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupEmployee(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-ape="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-ape="content"]');
    card.innerHTML = rows.length ? '<div class="ape-cards">' + rows.map(function (r) {
      return '<div class="ape-cardx" data-id="' + esc(String(r.id)) + '">' +
        '<div class="ape-card-top"><div><input type="checkbox" class="ape-chk" data-chk="' + esc(String(r.id)) + '"' + (UI.cmp.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="ape-num">' + esc(r.numero) + '</span></div>' +
        '<span>' + satChip(r) + '</span></div>' +
        '<div class="ape-card-name" data-open="' + esc(String(r.id)) + '">' + esc(r.employe) + '</div>' +
        '<div class="ape-card-total" style="font-size:.95rem">' + esc(r.poste || '—') + '</div>' +
        '<div class="ape-card-struct"><span>' + ptsDots(r) + '<span style="color:var(--ape-text2);font-size:.74rem;font-weight:600">' + r.pTenus + '/' + r.pTotal + ' points tenus' + (r.moyScore ? ' · ' + r.moyScore.toFixed(1) + '/20' : '') + '</span></span></div>' +
        '<div class="ape-card-meta">' + riskChip(r) + prochainCell(r) + '</div>' +
        '<div class="ape-card-foot"><span class="ape-num">' + esc(jDate(r.dateEmbauche) || '—') + ' · ' + r.anciennete + ' mois</span>' +
        '<div class="ape-card-act">' +
          '<button class="ape-ic" data-open="' + esc(String(r.id)) + '" title="Fiche & fil de suivi">' + ICO.eye + '</button>' +
          '<button class="ape-ic" data-edit="' + esc(String(r.id)) + '" title="Modifier le suivi">' + ICO.edit + '</button>' +
          '<button class="ape-ic" data-plan="' + esc(String(r.id)) + '" title="Planifier un point">' + ICO.plan + '</button>' +
          '<button class="ape-ic" data-dup="' + esc(String(r.id)) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="ape-ic danger" data-del="' + esc(String(r.id)) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="ape-empty">Aucun employé ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) UI.cmp.push(id);
        if (!c.checked && i > -1) UI.cmp.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog('employe', b.getAttribute('data-edit'), null); }); });
    $$('[data-plan]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog('point', b.getAttribute('data-plan'), null); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupEmployee(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= vue TIMELINE (signature) =================
     Le fil de suivi temporel par employé : jalons J+7 → 12 mois,
     passés/à venir, tenus/manqués, séparateur « aujourd'hui »,
     navigation entre employés, clic jalon = fiche. */
  function tlNav(delta) {
    var rows = filtered();
    if (!rows.length) return;
    var idx = -1;
    rows.forEach(function (r, i) { if (String(r.id) === String(UI.tlEmp)) idx = i; });
    if (idx < 0) idx = 0;
    idx = Math.max(0, Math.min(rows.length - 1, idx + delta));
    UI.tlEmp = String(rows[idx].id);
    refresh();
  }
  function renderTimeline() {
    var rows = filtered();
    var card = $('[data-ape="content"]');
    if (!rows.length) { card.innerHTML = '<div class="ape-empty">Aucun employé ne correspond aux filtres</div>'; return; }
    var cur = null;
    rows.forEach(function (r) { if (!cur && String(r.id) === String(UI.tlEmp)) cur = r; });
    if (!cur) { cur = rows[0]; UI.tlEmp = String(cur.id); }
    var idx = rows.indexOf(cur);
    var side = '<aside class="ape-tl-side" data-ape="tl-side"><div class="ape-tl-sidehead">Employés <span>' + rows.length + '</span></div><div class="ape-tl-elist">' + rows.map(function (r) {
      var nx = r.prochain;
      var state = r.fManque ? '<span class="ape-chip err">' + r.pManques + ' manqué' + (r.pManques > 1 ? 's' : '') + '</span>'
        : nx ? '<span class="ape-chip info">' + esc(nx.type) + ' · ' + esc(jDate(nx.date)) + '</span>'
        : '<span class="ape-chip neutral">sans prochain</span>';
      return '<button class="ape-tl-eitem' + (r === cur ? ' on' : '') + '" data-tle="' + esc(String(r.id)) + '">' +
        '<span class="ape-tl-ename">' + esc(r.employe) + '</span>' +
        '<span class="ape-tl-emeta">' + esc(r.poste || '—') + '</span>' +
        '<span class="ape-tl-estate">' + state + '</span></button>';
    }).join('') + '</div></aside>';
    var head = '<div class="ape-tl-head">' +
      '<div class="ape-tl-nav"><button class="ape-pgbtn" data-tlnav="-1"' + (idx <= 0 ? ' disabled' : '') + ' aria-label="Employé précédent" title="Employé précédent (←)">‹</button>' +
      '<button class="ape-pgbtn" data-tlnav="1"' + (idx >= rows.length - 1 ? ' disabled' : '') + ' aria-label="Employé suivant" title="Employé suivant (→)">›</button></div>' +
      '<div class="ape-tl-id"><div class="ape-tl-name">' + esc(cur.employe) + '</div>' +
      '<div class="ape-tl-sub">' + esc(cur.numero) + ' · ' + esc(cur.poste || '—') + ' · ' + esc(cur.departement || '—') + ' · embauché le ' + esc(jDate(cur.dateEmbauche) || '—') + '</div></div>' +
      '<div class="ape-tl-chips">' + satChip(cur) + riskChip(cur) + '</div>' +
      '<button class="ape-btn ape-btn-primary" data-tlplan="1">' + ICO.plus + 'Planifier un point</button></div>';
    var today = nowTs();
    var sepDone = false;
    function nodeHtml(p) {
      var stM = STMAP[p.st];
      var off = offFor(p.type);
      var acts = p.actions.length ? (p.actions.filter(function (a) { return a.fait; }).length + '/' + p.actions.length + ' action(s)') : '';
      return '<div class="ape-tlnode st-' + p.st + '" role="button" tabindex="0" data-tnode="' + esc(String(cur.id)) + '|' + esc(p.id) + '" title="Ouvrir la fiche">' +
        '<span class="ape-tldot" aria-hidden="true"></span>' +
        '<span class="ape-tlwhen"><b>' + esc(jDate(p.date) || '—') + '</b>' + (off ? '<i>' + off + '</i>' : '') + '</span>' +
        '<span class="ape-tlcard"><span class="ape-tlct">' + esc(labFor(p.type)) + '</span>' +
        '<span class="ape-chip ' + stM.chip + '">' + stM.lab + (p.st === 'tenu' && p.score > 0 ? ' · ' + p.score + '/20' : '') + '</span>' +
        (p.ressenti ? starsHtml(p.ressenti) : '') +
        (p.responsable ? '<span class="ape-tlmeta">' + esc(p.responsable) + '</span>' : '') +
        (acts ? '<span class="ape-tlmeta">' + acts + '</span>' : '') +
        (p.notes ? '<span class="ape-tlmeta note">' + esc(truncate(p.notes, 90)) + '</span>' : '') +
        '</span></div>';
    }
    var nodes = '';
    (cur.pts || []).forEach(function (p) {
      var t = tsOf(p.date);
      if (!sepDone && (!t || t > today)) { nodes += '<div class="ape-tltoday"><span>Aujourd\u2019hui · ' + fmtToday() + '</span></div>'; sepDone = true; }
      nodes += nodeHtml(p);
    });
    if (!sepDone) nodes += '<div class="ape-tltoday"><span>Aujourd\u2019hui · ' + fmtToday() + '</span></div>';
    if (!(cur.pts || []).length) nodes = '<div class="ape-empty">Aucun point de suivi — planifier le premier point d\u2019accueil (J+7)</div>';
    card.innerHTML = '<div class="ape-tlwrap">' + side + '<div class="ape-tl-main">' + head +
      '<div class="ape-tl-hints"><span>' + cur.pTenus + ' tenus</span><span>' + cur.pManques + ' manqués</span><span>' + cur.pRattrap + ' à rattraper</span><span>' + cur.pAvenir + ' à venir</span>' + (cur.moyScore ? '<span>satisfaction ' + cur.moyScore.toFixed(1) + '/20</span>' : '') + '</div>' +
      '<div class="ape-tl-thread">' + nodes + '</div></div></div>';
    $$('[data-tle]', card).forEach(function (b) { b.addEventListener('click', function () { UI.tlEmp = b.getAttribute('data-tle'); refresh(); }); });
    $$('[data-tlnav]', card).forEach(function (b) { b.addEventListener('click', function () { tlNav(Number(b.getAttribute('data-tlnav'))); }); });
    var plan = $('[data-tlplan]', card);
    if (plan) plan.addEventListener('click', function () { openDialog('point', UI.tlEmp, null); });
    $$('[data-tnode]', card).forEach(function (n) {
      n.addEventListener('click', function () { openDrawer(n.getAttribute('data-tnode').split('|')[0]); });
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(n.getAttribute('data-tnode').split('|')[0]); } });
    });
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-ape="selbar"]');
    if (!UI.cmp.length) { zone.innerHTML = ''; return; }
    var rows = UI.cmp.map(function (id) { return rowById(id); }).filter(Boolean);
    zone.innerHTML = '<div class="ape-selbar">' +
      '<span class="ape-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="ape-selbar-sub">le fil de suivi de chaque employé est conservé à l\u2019export</span>' +
      '<button class="ape-btn ape-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="ape-btn ape-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="ape-btn ape-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.cmp = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.cmp.slice());
        else if (a === 'del') askDelBulk(UI.cmp.slice());
      });
    });
  }

  /* ================= drawer fiche employé ================= */
  function closeDrawer() { $$('[data-ape="drawer"],[data-ape="backdrop"][data-ape-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'ape-backdrop', 'data-ape': 'backdrop', 'data-ape-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var cl = candLink(r);
    var sl = selLink(r);
    var ptsHtml = (r.pts || []).map(function (p) {
      var stM = STMAP[p.st];
      var acts = p.actions.length ? '<div class="ape-pacts">' + p.actions.map(function (a, i) {
        return '<label class="ape-pact"><input type="checkbox" data-actf="' + esc(String(r.id)) + '|' + esc(p.id) + '|' + i + '"' + (a.fait ? ' checked' : '') + '> <span' + (a.fait ? ' style="text-decoration:line-through;opacity:.65"' : '') + '>' + esc(a.lib) + '</span></label>';
      }).join('') + '</div>' : '';
      return '<div class="ape-pcard st-' + p.st + '">' +
        '<div class="ape-phead"><b>' + esc(labFor(p.type)) + '</b><span class="ape-num">' + esc(jDate(p.date) || '—') + (offFor(p.type) ? ' · ' + offFor(p.type) : '') + '</span>' +
        '<span class="ape-chip ' + stM.chip + '">' + stM.lab + (p.st === 'tenu' && p.score > 0 ? ' · ' + p.score + '/20' : '') + '</span></div>' +
        '<div class="ape-pmeta">' + (p.responsable ? 'Responsable : <b>' + esc(p.responsable) + '</b> · ' : '') + (p.ressenti ? 'Ressenti ' + starsHtml(p.ressenti) + ' (' + RESSENTI[p.ressenti] + ')' : (p.st === 'tenu' && p.score > 0 ? 'Ressenti déduit du score' : 'Ressenti non renseigné')) + '</div>' +
        acts +
        (p.notes ? '<div class="ape-pnotes">' + esc(p.notes) + '</div>' : '') +
        '<div class="ape-pbtns">' +
          '<button class="ape-ic" data-pedit="' + esc(p.id) + '" title="Éditer le point">' + ICO.edit + '</button>' +
          '<button class="ape-ic" data-pdup="' + esc(p.id) + '" title="Dupliquer → point suivant planifié (ressenti/actions réinitialisés)">' + ICO.dup + '</button>' +
          '<button class="ape-ic danger" data-pdel="' + esc(p.id) + '" title="Supprimer le point">' + ICO.del + '</button>' +
        '</div></div>';
    }).join('');
    var dr = h('aside', { class: 'ape-drawer', 'data-ape': 'drawer', role: 'dialog', 'aria-label': 'Fiche ' + r.employe });
    dr.innerHTML =
      '<div class="ape-drawer-head"><div><div class="ape-drawer-title">' + esc(r.employe) + '</div>' +
      '<div class="ape-drawer-sub">' + esc(r.numero) + ' · ' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + ' · embauché le ' + esc(jDate(r.dateEmbauche) || '—') + '</div></div>' +
      '<button class="ape-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ape-drawer-body">' +
        '<div class="ape-live" style="margin-top:0">' +
          '<span>Satisfaction <select id="ape-satsel" class="ape-in" data-ape="satsel" style="width:auto;padding:2px 6px;font-size:.74rem">' + SATS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.satisfaction ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></span>' +
          '<span>Risque <select id="ape-rksel" class="ape-in" data-ape="rksel" style="width:auto;padding:2px 6px;font-size:.74rem">' + RISKS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.risqueDepart ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></span>' +
          '<span>Points <b>' + r.pTenus + '/' + r.pTotal + '</b> tenus</span>' +
          '<span>Prochain <b>' + (r.prochain ? esc(r.prochain.type) + ' · ' + esc(jDate(r.prochain.date)) : '—') + '</b></span>' +
        '</div>' +
        '<div class="ape-fsec">Fil de suivi — points réguliers</div>' +
        (ptsHtml || '<div class="ape-empty" style="padding:10px 0">Aucun point — planifier le point d\u2019accueil (J+7)</div>') +
        '<div style="margin:10px 0"><button class="ape-btn ape-btn-ghost" data-act="plan">' + ICO.plus + 'Planifier un point</button></div>' +
        '<div class="ape-fsec">Liens recrutement (silencieux)</div>' +
        '<dl class="ape-kv">' +
          kv('Candidat (base)', cl ? '<a class="ape-link" href="' + esc(cl.href) + '">' + esc(cl.lab) + ' →</a>' : '—') +
          kv('Sélection', sl ? '<a class="ape-link" href="' + esc(sl.href) + '">' + esc(sl.lab) + ' →</a>' : '—') +
        '</dl>' +
        '<div class="ape-fsec">Commentaires (tableau natif)</div>' +
        '<textarea class="ape-notebox" data-ape="note" placeholder="Commentaires visibles aussi dans le tableau natif">' + esc(r.commentaires || '') + '</textarea>' +
        '<div class="ape-drawer-actions">' +
          '<button class="ape-btn ape-btn-ghost" data-act="note">Enregistrer les commentaires</button>' +
          '<button class="ape-btn ape-btn-ghost" data-act="edit">Modifier le suivi</button>' +
          '<button class="ape-btn ape-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="ape-btn ape-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.ape-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-ape="satsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      var cur = rowById(id);
      if (!cur || nv === cur.satisfaction) return;
      mutate(function (c) {
        c.suivis = c.suivis.map(function (x) { if (String(x.id) === String(id)) x.satisfaction = nv; return x; });
        return c;
      }, 'Satisfaction modifiée', cur.numero + ' → ' + satMeta(nv).lab);
      toast('Satisfaction : ' + satMeta(nv).lab, 'ok');
    });
    $('[data-ape="rksel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      var cur = rowById(id);
      if (!cur || nv === cur.risqueDepart) return;
      mutate(function (c) {
        c.suivis = c.suivis.map(function (x) { if (String(x.id) === String(id)) x.risqueDepart = nv; return x; });
        return c;
      }, 'Risque modifié', cur.numero + ' → ' + riskMeta(nv).lab);
      toast('Risque de départ : ' + riskMeta(nv).lab, 'ok');
    });
    $$('[data-actf]', dr).forEach(function (cb) {
      cb.addEventListener('change', function () {
        var parts = cb.getAttribute('data-actf').split('|');
        var i = Number(parts[2]);
        mutate(function (c) {
          c.suivis = c.suivis.map(function (x) {
            if (String(x.id) !== String(parts[0])) return x;
            var arr = Array.isArray(x.points) ? x.points : [];
            for (var j = 0; j < arr.length; j++) {
              if (String(arr[j].id) === String(parts[1]) && arr[j].actions && arr[j].actions[i]) { arr[j].actions[i].fait = cb.checked; break; }
            }
            x.points = arr;
            return x;
          });
          return c;
        }, cb.checked ? 'Action réalisée' : 'Action réouverte', r.numero + ' · action #' + (i + 1));
      });
    });
    $$('[data-pedit]', dr).forEach(function (b) { b.addEventListener('click', function () { openDialog('point', id, b.getAttribute('data-pedit')); }); });
    $$('[data-pdup]', dr).forEach(function (b) { b.addEventListener('click', function () { dupPoint(id, b.getAttribute('data-pdup')); }); });
    $$('[data-pdel]', dr).forEach(function (b) { b.addEventListener('click', function () { askDelPoint(id, b.getAttribute('data-pdel')); }); });
    $('[data-act="plan"]', dr).addEventListener('click', function () { openDialog('point', id, null); });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-ape="note"]', dr).value;
      mutate(function (c) {
        c.suivis = c.suivis.map(function (x) { if (String(x.id) === String(id)) x.commentaires = v; return x; });
        return c;
      }, 'Commentaires modifiés', r.numero);
      toast('Commentaires enregistrés', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog('employe', id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupEmployee(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', r.numero + ' ' + r.employe);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-ape="dialog"],[data-ape="backdrop"][data-ape-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; UI.editPt = null; }
  /* Deux modes : 'employe' (création/édition du suivi) et 'point'
     (planification / tenue d'un point : employé, type, date,
     responsable obligatoires ; score borné 0-20 ; ressenti 1-5). */
  function openDialog(mode, empId, ptId) {
    closeDialog();
    mode = mode || 'employe';
    var rows = data();
    UI.dialogOpen = true;
    UI.dialogMode = mode;
    UI.editId = empId || null;
    UI.editPt = ptId || null;
    var bd = h('div', { class: 'ape-backdrop', 'data-ape': 'backdrop', 'data-ape-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'ape-dialog', 'data-ape': 'dialog', role: 'dialog', 'aria-label': mode === 'point' ? 'Point de suivi' : 'Suivi employé' });
    function opts(list, cur, labFn) {
      return '<option value=""></option>' + list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = labFn ? labFn(x) : (typeof x === 'object' ? x.lab : x);
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    var respDatalist = '<datalist id="ape-resps">' + (function () {
      var seen = {};
      var out = '';
      rows.forEach(function (r) { r.pts.forEach(function (p) { if (p.responsable && !seen[norm(p.responsable)]) { seen[norm(p.responsable)] = 1; out += '<option value="' + esc(p.responsable) + '">'; } }); });
      return out;
    })() + '</datalist>';

    if (mode === 'point') {
      var r = empId ? rowById(empId) : null;
      var p = (r && ptId) ? ptById(r, ptId) : null;
      if (ptId && !p) { closeDialog(); toast('Point introuvable', 'err'); return; }
      var v = function (k, dflt) { return p ? (p[k] == null ? (dflt || '') : String(p[k])) : (dflt || ''); };
      dlg.innerHTML =
        '<div class="ape-dialog-head"><h3>' + (p ? 'Modifier le point — ' + esc(r.employe) : 'Planifier un point de suivi') + '</h3>' +
        '<button class="ape-drawer-x" aria-label="Fermer">✕</button></div>' +
        '<div class="ape-dialog-body">' +
          '<div class="ape-fgrid">' +
            '<label class="ape-lab">Employé *<select class="ape-in" data-f="emp">' + rows.map(function (x) {
              return '<option value="' + esc(String(x.id)) + '"' + (r && String(x.id) === String(empId) ? ' selected' : '') + '>' + esc(x.employe) + ' (' + esc(x.numero) + ')</option>';
            }).join('') + '</select></label>' +
            '<label class="ape-lab">Type de point *<select class="ape-in" data-f="type">' + LADDER.map(function (L) {
              return '<option value="' + esc(L.t) + '"' + (p && p.type === L.t ? ' selected' : '') + '>' + esc(L.lab) + '</option>';
            }).join('') + '</select></label>' +
            '<label class="ape-lab">Date du point *<input class="ape-in" data-f="date" value="' + esc(p ? jDate(p.date) : '') + '" placeholder="jj/mm/aaaa"></label>' +
            '<label class="ape-lab">Responsable *<input class="ape-in" data-f="resp" value="' + esc(v('responsable')) + '" list="ape-resps" placeholder="Manager, RH…">' + respDatalist + '</label>' +
            '<label class="ape-lab">Point tenu<input type="checkbox" class="ape-chkbox" data-f="tenu"' + (p && p.tenu ? ' checked' : '') + ' style="width:auto"> <span style="font-weight:400">cocher si l\u2019échange a eu lieu</span></label>' +
            '<label class="ape-lab">Score satisfaction /20 (si tenu)<input class="ape-in" type="number" min="0" max="20" step="1" data-f="score" value="' + esc(p && p.score != null ? String(p.score) : '') + '" placeholder="0 à 20"></label>' +
            '<label class="ape-lab">Ressenti employé (1 à 5)<select class="ape-in" data-f="ress">' + '<option value=""></option>' + [1, 2, 3, 4, 5].map(function (n) {
              return '<option value="' + n + '"' + (p && Number(p.ressenti) === n ? ' selected' : '') + '>' + n + ' — ' + RESSENTI[n] + '</option>';
            }).join('') + '</select></label>' +
            '<label class="ape-lab full">Actions décidées (une par ligne)<textarea class="ape-in ape-ta" data-f="actions" placeholder="Ex. : points réguliers avec le manager — un par ligne">' + esc(p ? p.actions.map(function (a) { return a.lib; }).join('\n') : '') + '</textarea></label>' +
            '<label class="ape-lab full">Notes d\u2019échange<textarea class="ape-in ape-ta" data-f="notes" placeholder="Ce qui s\u2019est dit, climat, signaux…">' + esc(v('notes')) + '</textarea></label>' +
          '</div>' +
          '<div class="ape-live" data-ape="dlg-live"></div>' +
          '<div data-ape="dlg-err"></div>' +
        '</div>' +
        '<div class="ape-dialog-foot"><span class="ape-form-hint">Un point se conclut par des actions tracées · score borné 0-20 · le score alimente les évals natives 1/3/6 mois</span>' +
        '<span style="display:flex;gap:8px"><button class="ape-btn ape-btn-ghost" data-act="cancel" style="color:var(--ape-text);border-color:var(--ape-line)">Annuler</button>' +
        '<button class="ape-btn ape-btn-primary" data-act="save">' + (p ? 'Enregistrer le point' : 'Planifier le point') + '</button></span></div>';
      var live = function () {
        var val = {};
        $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
        var emp = rowById(val.emp);
        var du = daysUntil(val.date);
        var sc = val.score === '' ? null : Number(val.score);
        var scOk = sc == null || (isFinite(sc) && sc >= 0 && sc <= 20);
        var tenu = !!$('[data-f="tenu"]', dlg).checked;
        var ladderPos = ladderIdx(val.type) + 1;
        $('[data-ape="dlg-live"]', dlg).innerHTML =
          '<span>Employé <b>' + esc(emp ? emp.employe : '—') + '</b></span>' +
          '<span>Jalon <b>' + esc(val.type || '—') + '</b> (n° ' + ladderPos + ' du fil)</span>' +
          '<span>Délai <b>' + (du == null ? '—' : du > 0 ? 'J+' + du : du === 0 ? 'aujourd\u2019hui' : 'passé de ' + (-du) + ' j') + '</b></span>' +
          '<span>Score <b class="' + (!scOk ? 'bad' : sc != null && sc < SEUILS.scoreMin ? 'bad' : sc != null ? 'good' : '') + '">' + (sc != null && isFinite(sc) ? sc + '/20' : 'non mesuré') + '</b></span>' +
          (tenu ? '<span>Point <b>tenu</b></span>' : '') +
          (!scOk ? '<span class="bad">⚠ Score hors bornes (0-20)</span>' : '');
      };
      $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); i.addEventListener('change', live); });
      live();
      $('[data-act="save"]', dlg).addEventListener('click', function () {
        var val = {};
        $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
        var err = $('[data-ape="dlg-err"]', dlg);
        function fail(msg) { err.innerHTML = '<div class="ape-form-err">' + esc(msg) + '</div>'; }
        if (!val.emp) return fail('L\u2019employé est obligatoire.');
        if (!val.type) return fail('Le type de point est obligatoire.');
        if (!String(val.date || '').trim() || tsOf(val.date) <= 0) return fail('La date du point est obligatoire (jj/mm/aaaa).');
        if (!String(val.resp || '').trim()) return fail('Le responsable est obligatoire (manager ou RH).');
        var tenu = !!$('[data-f="tenu"]', dlg).checked;
        var sc = val.score === '' ? null : Number(val.score);
        if (sc != null && (!isFinite(sc) || sc < 0 || sc > 20)) return fail('Le score doit être compris entre 0 et 20.');
        var ress = Number(val.ress) || 0;
        if (ress && (ress < 1 || ress > 5)) return fail('Le ressenti doit être compris entre 1 et 5.');
        var actions = String(val.actions || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return { lib: x, fait: false }; });
        var nk = nativeKeyFor(val.type);
        var dstr = jDate(val.date);
        mutate(function (c) {
          c.suivis = c.suivis.map(function (x) {
            if (String(x.id) !== String(val.emp)) return x;
            var pid = p ? String(p.id) : nextPointId({ pts: Array.isArray(x.points) ? x.points : [] });
            var rec = { id: pid, type: val.type, date: dstr, tenu: tenu, score: tenu && sc != null && sc > 0 ? sc : null, ressenti: ress, responsable: String(val.resp).trim(), actions: actions, notes: String(val.notes || '') };
            var arr = Array.isArray(x.points) ? x.points.slice() : [];
            var found = false;
            for (var j = 0; j < arr.length; j++) { if (String(arr[j].id) === pid) { arr[j] = rec; found = true; break; } }
            if (!found) arr.push(rec);
            x.points = arr;
            if (nk) x[nk] = rec.tenu ? (rec.score > 0 ? rec.score : null) : null;
            return x;
          });
          return c;
        }, p ? 'Point modifié' : 'Point planifié', labFor(val.type) + ' · ' + dstr + (tenu ? ' (tenu)' : '') + ' · ' + String(val.resp).trim());
        toast(p ? 'Point mis à jour' : 'Point planifié — ' + labFor(val.type), 'ok');
        closeDialog(); closeDrawer();
      });
      document.body.appendChild(bd);
      document.body.appendChild(dlg);
      var first2 = $('[data-f="type"]', dlg);
      if (first2 && !p) first2.focus();
      return;
    }

    /* mode 'employe' */
    var rr = empId ? rowById(empId) : null;
    var vv = function (k) { return rr ? (rr[k] == null ? '' : String(rr[k])) : ''; };
    dlg.innerHTML =
      '<div class="ape-dialog-head"><h3>' + (rr ? 'Modifier le suivi — ' + esc(rr.employe) : 'Nouveau suivi post-embauche') + '</h3>' +
      '<button class="ape-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ape-dialog-body">' +
        '<div class="ape-fgrid">' +
          '<label class="ape-lab">Employé *<input class="ape-in" data-f="employe" value="' + esc(vv('employe')) + '" placeholder="Ex. Nkoulou Amina"></label>' +
          '<label class="ape-lab">Poste *<input class="ape-in" data-f="poste" value="' + esc(vv('poste')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="ape-lab">Département *<input class="ape-in" data-f="departement" value="' + esc(vv('departement')) + '" placeholder="Ex. Restauration"></label>' +
          '<label class="ape-lab">Date d\u2019embauche *<input class="ape-in" data-f="dateEmbauche" value="' + esc(jDate(vv('dateEmbauche'))) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="ape-lab">Satisfaction<select class="ape-in" data-f="satisfaction">' + opts(SATS, vv('satisfaction') || 'Neutre') + '</select></label>' +
          '<label class="ape-lab">Risque de départ<select class="ape-in" data-f="risqueDepart">' + opts(RISKS, vv('risqueDepart') || 'Moyen') + '</select></label>' +
          '<label class="ape-lab full">Commentaires<textarea class="ape-in ape-ta" data-f="commentaires" placeholder="Contexte de l\u2019embauche, référent, particularités…">' + esc(vv('commentaires')) + '</textarea></label>' +
        '</div>' +
        '<div class="ape-live" data-ape="dlg-live"></div>' +
        '<div data-ape="dlg-err"></div>' +
      '</div>' +
      '<div class="ape-dialog-foot"><span class="ape-form-hint">La création déclenche le fil J+7 → 1 · 3 · 6 mois (jalons dérivés de la date d\u2019embauche) · 12 mois à planifier</span>' +
      '<span style="display:flex;gap:8px"><button class="ape-btn ape-btn-ghost" data-act="cancel" style="color:var(--ape-text);border-color:var(--ape-line)">Annuler</button>' +
      '<button class="ape-btn ape-btn-primary" data-act="save">' + (rr ? 'Enregistrer' : 'Créer le suivi') + '</button></span></div>';
    $('.ape-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    var live2 = function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var du = daysUntil(val.dateEmbauche);
      $('[data-ape="dlg-live"]', dlg).innerHTML =
        '<span>Fil dérivé <b>' + (tsOf(val.dateEmbauche) ? 'J+7 · 1 · 3 · 6 mois' : '—') + '</b></span>' +
        '<span>Embauche <b>' + (du == null ? '—' : du > 0 ? 'dans ' + du + ' j' : Math.abs(du) + ' j écoulés') + '</b></span>' +
        '<span>Satisfaction <b>' + esc(val.satisfaction ? satMeta(val.satisfaction).lab : '—') + '</b></span>';
    };
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live2); i.addEventListener('change', live2); });
    live2();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-ape="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="ape-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.employe || '').trim()) return fail('Le nom de l\u2019employé est obligatoire.');
      if (!String(val.poste || '').trim()) return fail('Le poste est obligatoire.');
      if (!String(val.departement || '').trim()) return fail('Le département est obligatoire.');
      if (!String(val.dateEmbauche || '').trim() || tsOf(val.dateEmbauche) <= 0) return fail('La date d\u2019embauche est obligatoire (jj/mm/aaaa).');
      var rec = {
        employe: String(val.employe).trim(),
        poste: String(val.poste).trim(),
        departement: String(val.departement).trim(),
        dateEmbauche: jDate(val.dateEmbauche),
        satisfaction: String(val.satisfaction || '').trim() || 'Neutre',
        risqueDepart: String(val.risqueDepart || '').trim() || 'Moyen',
        commentaires: String(val.commentaires || '')
      };
      if (empId) {
        mutate(function (c) {
          c.suivis = c.suivis.map(function (x) { if (String(x.id) === String(empId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return c;
        }, 'Suivi modifié', rec.employe);
        toast('Suivi mis à jour', 'ok');
      } else {
        mutate(function (c) {
          var mx = 0;
          c.suivis.forEach(function (x) {
            var a = Number(x.id); if (isFinite(a)) mx = Math.max(mx, a);
            var m = /^SPE-(\d+)$/.exec(String(x.numero || ''));
            if (m) mx = Math.max(mx, Number(m[1]));
          });
          var nid = mx + 1;
          var cp = { id: nid, numero: 'SPE-' + pad3(nid), anciennete: 0, eval1mois: null, eval3mois: null, eval6mois: null, points: [] };
          for (var k2 in rec) cp[k2] = rec[k2];
          c.suivis = c.suivis.concat([cp]);
          return c;
        }, 'Suivi créé', rec.employe + ' — ' + rec.poste);
        toast('Suivi créé — fil J+7 → 6 mois dérivé', 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="employe"]', dlg);
    if (first) first.focus();
  }

  /* ================= duplication ================= */
  function dupEmployee(id) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (c) {
      var mx = 0;
      c.suivis.forEach(function (x) {
        var a = Number(x.id); if (isFinite(a)) mx = Math.max(mx, a);
        var m = /^SPE-(\d+)$/.exec(String(x.numero || ''));
        if (m) mx = Math.max(mx, Number(m[1]));
      });
      var nid = mx + 1;
      var cp = { id: nid, numero: 'SPE-' + pad3(nid), employe: r.employe, poste: r.poste, departement: r.departement, dateEmbauche: r.dateEmbauche, anciennete: r.anciennete, eval1mois: null, eval3mois: null, eval6mois: null, satisfaction: 'Neutre', risqueDepart: 'Moyen', commentaires: '', points: [] };
      c.suivis = c.suivis.concat([cp]);
      return c;
    }, 'Suivi dupliqué', r.numero + ' → ' + nextNumero(rawRows()));
    toast('Suivi dupliqué (points réinitialisés — fil redérivé)', 'ok');
  }
  /* Dupliquer un point = planifier le point SUIVANT du fil :
     jalon suivant, date décalée de l'écart entre jalons,
     ressenti/actions/score réinitialisés. */
  function dupPoint(empId, ptId) {
    var r = rowById(empId);
    if (!r) return;
    var p = ptById(r, ptId);
    if (!p) return;
    var li = ladderIdx(p.type);
    var nextT = li < LADDER.length - 1 ? LADDER[li + 1].t : 'Autre';
    var gap = nextT === 'Autre' ? 90 : (LADDER[li + 1].off - LADDER[li].off);
    if (!(gap > 0)) gap = 90;
    var ndate = addDaysStr(p.date, gap);
    if (!ndate) { toast('Date du point source invalide', 'err'); return; }
    mutate(function (c) {
      c.suivis = c.suivis.map(function (x) {
        if (String(x.id) !== String(empId)) return x;
        var arr = Array.isArray(x.points) ? x.points.slice() : [];
        var np = { id: nextPointId({ pts: arr }), type: nextT, date: ndate, tenu: false, score: null, ressenti: 0, responsable: p.responsable || '', actions: [], notes: '' };
        arr.push(np);
        x.points = arr;
        return x;
      });
      return c;
    }, 'Point dupliqué → suivant planifié', r.numero + ' · ' + labFor(p.type) + ' → ' + labFor(nextT) + ' · ' + ndate);
    toast('Point suivant planifié — ressenti et actions réinitialisés', 'ok');
  }

  /* ================= suppression (confirmée) ================= */
  function closeConfirm() { $$('[data-ape="confirm"],[data-ape="backdrop"][data-ape-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function confirmBox(title, body, onYes) {
    closeConfirm();
    var bd = h('div', { class: 'ape-backdrop', 'data-ape': 'backdrop', 'data-ape-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'ape-confirm', 'data-ape': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + body + '</p>' +
      '<div class="ape-confirm-row"><button class="ape-btn ape-btn-ghost" data-a="no" style="color:var(--ape-text);border-color:var(--ape-line)">Annuler</button>' +
      '<button class="ape-btn ape-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', onYes);
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    confirmBox('Supprimer ce suivi ?', esc(r.numero) + ' — ' + esc(r.employe) + ' (' + esc(r.poste || '—') + '). Tout le fil de suivi (' + r.pTotal + ' points) est supprimé. Cette action est définitive.', function () {
      mutate(function (c) { c.suivis = c.suivis.filter(function (x) { return String(x.id) !== String(id); }); return c; }, 'Suivi supprimé', r.numero + ' ' + r.employe);
      UI.cmp = UI.cmp.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Suivi supprimé', 'ok');
    });
  }
  function askDelBulk(ids) {
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' suivis ?') : 'Supprimer 1 suivi ?';
    confirmBox(title, rows.map(function (r) { return esc(r.numero); }).join(', ') + '. Cette action est définitive.', function () {
      mutate(function (c) { c.suivis = c.suivis.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return c; }, 'Suppression groupée', rows.length + ' suivis');
      UI.cmp = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' suivis supprimés', 'ok');
    });
  }
  function askDelPoint(empId, ptId) {
    var r = rowById(empId);
    if (!r) return;
    var p = ptById(r, ptId);
    if (!p) return;
    confirmBox('Supprimer ce point ?', esc(labFor(p.type)) + ' · ' + esc(jDate(p.date)) + ' — ' + esc(r.employe) + '. Cette action est définitive.', function () {
      mutate(function (c) {
        c.suivis = c.suivis.map(function (x) {
          if (String(x.id) !== String(empId)) return x;
          x.points = (Array.isArray(x.points) ? x.points : []).filter(function (y) { return String(y.id) !== String(ptId); });
          return x;
        });
        return c;
      }, 'Point supprimé', r.numero + ' · ' + labFor(p.type) + ' · ' + jDate(p.date));
      closeConfirm();
      toast('Point supprimé du fil', 'ok');
    });
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-ape="seuils"],[data-ape="backdrop"][data-ape-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'ape-backdrop', 'data-ape': 'backdrop', 'data-ape-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'ape-panel', 'data-ape': 'seuils', role: 'dialog', 'aria-label': 'Seuils de suivi' });
    p.innerHTML = '<div class="ape-panel-head"><h3>Seuils de suivi</h3><button class="ape-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ape-panel-body">' +
        '<p class="ape-cibles-note">Ces seuils alimentent les alertes, les couleurs et les filtres (Manuel D1 : détecter tôt le mal-être, bienveillance & régularité).</p>' +
        '<div class="ape-sim-row"><label for="ape-s1">Satisfaction minimale d\u2019un point (/20)</label><input type="range" id="ape-s1" min="10" max="18" step="1" value="' + SEUILS.scoreMin + '"><input class="ape-in" type="number" min="10" max="18" step="1" data-ape="s1n" value="' + SEUILS.scoreMin + '"></div>' +
        '<div class="ape-sim-row"><label for="ape-s2">Délai de retard avant alerte « manqué » (jours)</label><input type="range" id="ape-s2" min="1" max="15" step="1" value="' + SEUILS.retardJours + '"><input class="ape-in" type="number" min="1" max="15" step="1" data-ape="s2n" value="' + SEUILS.retardJours + '"></div>' +
        '<div class="ape-sim-row"><label for="ape-s3">Fenêtre de préparation d\u2019un point imminent (jours)</label><input type="range" id="ape-s3" min="1" max="7" step="1" value="' + SEUILS.imminentJours + '"><input class="ape-in" type="number" min="1" max="7" step="1" data-ape="s3n" value="' + SEUILS.imminentJours + '"></div>' +
        '<div class="ape-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="ape-btn ape-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.ape-drawer-x', p).addEventListener('click', closeSeuils);
    [['ape-s1', 's1n', 'scoreMin', 10, 18, 1], ['ape-s2', 's2n', 'retardJours', 1, 15, 1], ['ape-s3', 's3n', 'imminentJours', 1, 7, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-ape="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.scoreMin = Math.max(10, Math.min(18, Number($('[data-ape="s1n"]', p).value) || SEUILS.scoreMin));
      SEUILS.retardJours = Math.max(1, Math.min(15, Number($('[data-ape="s2n"]', p).value) || SEUILS.retardJours));
      SEUILS.imminentJours = Math.max(1, Math.min(7, Number($('[data-ape="s3n"]', p).value) || SEUILS.imminentJours));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'satisfaction ≥ ' + SEUILS.scoreMin + '/20 · retard > ' + SEUILS.retardJours + ' j · imminent ≤ ' + SEUILS.imminentJours + ' j');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-ape="journal"],[data-ape="backdrop"][data-ape-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'ape-backdrop', 'data-ape': 'backdrop', 'data-ape-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'ape-panel', 'data-ape': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="ape-panel-head"><h3>Journal d\u2019activité — suivi post-embauche</h3><button class="ape-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ape-panel-body" data-ape="jlist"></div>';
    $('.ape-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-ape="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="ape-jrow"><span class="ape-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="ape-jact">' + esc(x.action || '') + '</span><span class="ape-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="ape-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Suivi', 'Employé', 'Poste', 'Département', 'Date embauche', 'Ancienneté (mois)', 'Type point', 'Date point', 'État', 'Score /20', 'Ressenti /5', 'Responsable', 'Actions décidées', 'Actions réalisées', 'Notes d\u2019échange', 'Satisfaction', 'Risque départ', 'Commentaires'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var base = [r.numero, r.employe, r.poste, r.departement, jDate(r.dateEmbauche), r.anciennete];
      var pts = r.pts.length ? r.pts : [null];
      pts.forEach(function (p) {
        var cells;
        if (!p) cells = base.concat(['', '', '', '', '', '', '', '', r.satisfaction, r.risqueDepart, r.commentaires]);
        else cells = base.concat([labFor(p.type), jDate(p.date), STMAP[p.st].lab, p.score != null ? p.score : '', p.ressenti || '', p.responsable, p.actions.map(function (a) { return a.lib; }).join(' / '), p.actions.filter(function (a) { return a.fait; }).length + '/' + p.actions.length, p.notes, r.satisfaction, r.risqueDepart, r.commentaires]);
        lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
      });
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-suivi-post-embauche-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' suivis');
    toast(rows.length + ' suivi(s) exporté(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-ape="dialog"]') || $('[data-ape="confirm"]') || $('[data-ape="drawer"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog('employe', null, null); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { openDialog('point', UI.tlEmp, null); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { UI.view = 'timeline'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { UI.view = 'cards'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-ape="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === 'ArrowLeft' && UI.view === 'timeline') { tlNav(-1); e.preventDefault(); }
    else if (e.key === 'ArrowRight' && UI.view === 'timeline') { tlNav(1); e.preventDefault(); }
    else if (e.key === '?') { toast('Raccourcis : N nouveau suivi · P planifier un point · K timeline · C cartes · T tableau · E export · J journal · S seuils · / recherche · ← → employé (timeline)', ''); }
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
    var root = $('[data-ape="root"]');
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
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v) { if (typeof v.view === 'string' && ['table', 'cards', 'timeline'].indexOf(v.view) > -1) UI.view = v.view; if (typeof v.per === 'number') UI.per = v.per; } } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per })); } catch (e) {} }

  /* ================= refresh global ================= */
  var shellBuilt = false;
  function buildShellOnce() { if (!shellBuilt) { buildShell(); shellBuilt = true; } }
  function refresh() {
    if (!isOn()) return;
    if (!mountRoot()) return;
    if (!$('[data-ape="hero"]')) shellBuilt = false;
    buildShellOnce();
    renderHero();
    renderKPIs();
    renderDonut();
    renderBars();
    renderFilters();
    if (UI.view === 'cards') renderCards();
    else if (UI.view === 'timeline') renderTimeline();
    else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-ape="drawer"],[data-ape="dialog"],[data-ape="confirm"],[data-ape="journal"],[data-ape="seuils"]')) {
      $$('[data-ape="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0, subscribed = false;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function ensureSub() {
    if (subscribed) return;
    var a = api();
    if (a && typeof a.subscribe === 'function') {
      try { a.subscribe(function () { scheduleRefresh(); }); subscribed = true; } catch (e) {}
    }
  }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-ape');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    ensureSub();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-ape]') || t.closest('#ape-satsel') || t.closest('#ape-rksel'))) continue;
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
    html.classList.remove('admina-ape');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils();
    UI.cmp = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    ensureSub();
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-ape="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-ape-hide', '1');
      natif.setAttribute('data-ape-olddisp', natif.style.display || '');
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

  /* démarrage : interval 350 ms + popstate (scope /suivi-post-embauche) */
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

  window.__ADMINA_APE_UI__ = {
    version: '1.0-w2',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openJournal: openJournal,
    openSeuils: openSeuils,
    exportCSV: exportCSV,
    openTimeline: function () { UI.view = 'timeline'; saveUI(); refresh(); },
    debug: {
      rows: function () { return data(); },
      rawRows: rawRows,
      seuils: SEUILS,
      ui: UI,
      alerts: function () { return computeAlerts(data()); }
    }
  };
  try { console.info('[ADMINA_APE] W2-d actif — Centre de suivi Post-Embauche /suivi-post-embauche'); } catch (e) {}
})();
