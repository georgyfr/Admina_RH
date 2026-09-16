/* =============================================================
   Admina-RH — Pipeline de Recrutement — couche admina
   M26 : CENTRE DE PILOTAGE — Pipeline des candidatures
   Héro calculé + alertes contextuelles cliquables + 6 KPI filtres
   + 3 graphiques (donut candidatures par stade, répartition par
   département, par source) + recherche/filtres + KANBAN avec
   VRAI drag & drop (HTML5) + déplacement clavier (← →) et
   boutons mobiles + table triable 14 colonnes + vue cartes
   + drawer fiche complète (timeline stades, évaluation, suivi,
   changement de stade/priorité rapide, notes éditables)
   + création/édition validée + duplication + suppression
   confirmée simple/groupée + barre de sélection multi + comparateur
   + flux & goulots (conversion par étape, délais moyens)
   + seuils configurables + export CSV + journal d'audit local
   + thème sombre + responsive mobile.
   - Scope strict : /Domaine1_Recrutement_Candidats/pipeline-candidatures
   - Idempotent (data-apl / data-apl-hide), sans collision (__ADMINA_PPL_M26__)
   - Données : window.__ADMINA_PPL_API__ (patch chunk) → fallback localStorage
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_PPL_M26__) return;
  window.__ADMINA_PPL_M26__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/Domaine1_Recrutement_Candidats\/pipeline-candidatures\/?$/;
  var LS_DATA = 'admina-ppl-data';
  var LS_UI = 'admina-ppl-ui';
  var LS_SEUILS = 'admina-ppl-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', stade: '', prio: '', source: '', dept: '', score: '', delai: '', kpi: '', view: 'kanban', sortKey: 'numero', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, cmp: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { delaiAlerte: 30, delaiOffre: 7, scoreTalent: 15 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var STADES = [
    { k: 'CV recu', lab: 'CV reçus', c: '#64748b' },
    { k: 'Pre-selection', lab: 'Pré-sélection', c: '#0891b2' },
    { k: 'Entretien HR', lab: 'Entretien HR', c: '#d97706' },
    { k: 'Test technique', lab: 'Test technique', c: '#7c3aed' },
    { k: 'Entretien final', lab: 'Entretien final', c: '#c026d3' },
    { k: 'Offre envoyee', lab: 'Offre envoyée', c: '#ea580c' },
    { k: 'Accepte', lab: 'Accepté', c: '#059669' },
    { k: 'Refuse', lab: 'Refusé', c: '#dc2626' }
  ];
  function stadeMeta(k) { for (var i = 0; i < STADES.length; i++) { if (STADES[i].k === k) return STADES[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  function stadeIdx(k) { for (var i = 0; i < STADES.length; i++) { if (STADES[i].k === k) return i; } return -1; }
  var FUNNEL = [0, 1, 2, 3, 4, 5, 6]; /* indices du funnel (Accepte inclus) */
  var PRIOS = [
    { k: 'Haute', lab: 'Haute', c: '#dc2626' },
    { k: 'Moyenne', lab: 'Moyenne', c: '#d97706' },
    { k: 'Basse', lab: 'Basse', c: '#64748b' }
  ];
  function prioMeta(k) { for (var i = 0; i < PRIOS.length; i++) { if (PRIOS[i].k === k) return PRIOS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8' }; }
  var SOURCES = ['Site web entreprise', 'Presse', 'Cooptation', 'Reseaux sociaux', 'Candidature spontanee', 'Ecole/Universite', 'Cabinet de recrutement', 'Salon emploi', 'Autre'];
  var DEPARTEMENTS = ['Direction Generale', 'Ressources Humaines', 'Finance & Comptabilite', 'Marketing & Communication', 'Informatique', 'Commercial', 'Logistique & Approvisionnement', 'Production', 'Service Client', 'Juridique', 'Administration', 'Securite', 'Restauration', 'Herbergement', 'Maintenance', 'Lingerie', 'Audiovisuel'];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }
  function dateKey(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (m) return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
    var m2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    if (m2) return Number(m2[1]) * 10000 + Number(m2[2]) * 100 + Number(m2[3]);
    return 0;
  }
  function todayFr() { return new Date().toLocaleDateString('fr-FR'); }
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
  function toastsZone() { var z = $('[data-apl="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-apl', 'toasts'); z.className = 'apl-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'apl-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_PPL_API__ || null; }
  function rawData() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.candidatures) { try { d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e2) { d = null; } }
    if (!d || !d.candidatures || !d.candidatures.length) return [];
    return d.candidatures;
  }
  function data() {
    return rawData().map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = u.id != null ? u.id : '';
      u.numero = u.numero || (u.id != null && u.id !== '' ? 'PPL-' + String(u.id).padStart(3, '0') : '—');
      u.score = u.score == null ? 0 : (Number(u.score) || 0);
      u.delai = Number(u.delai) || 0;
      u.st = stadeMeta(u.stade);
      u.si = stadeIdx(u.stade);
      u.pr = prioMeta(u.priorite);
      u.actif = u.si >= 0 && u.si < 6;
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) {
      var m2 = /^PPL-(\d+)$/.exec(String(r.numero || ''));
      var a = m2 ? Number(m2[1]) : 0;
      var m3 = Number(r.id); if (!isFinite(m3)) m3 = 0;
      return Math.max(m, a, m3);
    }, 0) + 1;
    return mx;
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.candidatures) { toast('Écriture impossible — recharger la page', 'err'); return false; }
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
  function computeAlerts(rows) {
    var out = [];
    var bloq = rows.filter(function (r) { return r.actif && r.delai > SEUILS.delaiAlerte; });
    if (bloq.length) {
      var worst = bloq.slice().sort(function (a, b) { return b.delai - a.delai; })[0];
      out.push({ tone: 'err', txt: bloq.length + ' candidature' + (bloq.length > 1 ? 's' : '') + ' active' + (bloq.length > 1 ? 's' : '') + ' sans progression depuis plus de ' + SEUILS.delaiAlerte + ' j — le pire : ' + worst.nom + ' (' + worst.delai + ' j en « ' + stadeMeta(worst.stade).lab + ' »)', f: 'bloq' });
    }
    var noEval = rows.filter(function (r) { return r.si >= 3 && r.si < 6 && r.score <= 0; });
    if (noEval.length) out.push({ tone: 'warn', txt: noEval.length + ' évaluation' + (noEval.length > 1 ? 's' : '') + ' manquante' + (noEval.length > 1 ? 's' : '') + ' à un stade avancé — décision impossible sans score (' + noEval.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'eval' });
    var offAtt = rows.filter(function (r) { return r.stade === 'Offre envoyee' && r.delai > SEUILS.delaiOffre; });
    if (offAtt.length) out.push({ tone: 'warn', txt: offAtt.length + ' offre' + (offAtt.length > 1 ? 's' : '') + ' en attente de réponse depuis plus de ' + SEUILS.delaiOffre + ' j — relancer le(s) candidat(s) (' + offAtt.slice(0, 2).map(function (r) { return r.nom; }).join(', ') + ')', f: 'offre' });
    var noEv = rows.filter(function (r) { return r.si >= 2 && r.si < 6 && !String(r.evaluateur || '').trim(); });
    if (noEv.length) out.push({ tone: 'info', txt: noEv.length + ' candidature' + (noEv.length > 1 ? 's' : '') + ' sans évaluateur assigné à partir de l\u2019entretien HR (' + noEv.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + '…)', f: 'notev' });
    var tal = rows.filter(function (r) { return r.score >= SEUILS.scoreTalent; });
    if (tal.length) out.push({ tone: 'ok', txt: tal.length + ' profil' + (tal.length > 1 ? 's' : '') + ' avec score ≥ ' + SEUILS.scoreTalent + '/20 — vivier de talents à préserver (' + tal.slice(0, 2).map(function (r) { return r.nom; }).join(', ') + ')', f: 'talent' });
    if (!out.length) out.push({ tone: 'ok', txt: 'Aucune alerte — pipeline fluide, évaluations à jour et délais sous contrôle', f: 'none' });
    return out;
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (q) {
        var hay = norm([r.numero, r.nom, r.poste, r.departement, r.source, r.evaluateur, r.prochaineAction, r.notes].join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      if (UI.stade) {
        if (UI.stade === '__actif') { if (!r.actif) return false; }
        else if (UI.stade === '__adv') { if (!(r.si >= 3 && r.si < 6)) return false; }
        else if (r.stade !== UI.stade) return false;
      }
      if (UI.prio && r.priorite !== UI.prio) return false;
      if (UI.source && r.source !== UI.source) return false;
      if (UI.dept && r.departement !== UI.dept) return false;
      if (UI.score === 'none' && r.score > 0) return false;
      else if (UI.score === 't15' && r.score < SEUILS.scoreTalent) return false;
      else if (UI.score === 't12' && r.score < 12) return false;
      if (UI.delai === '__bloq' && !(r.actif && r.delai > SEUILS.delaiAlerte)) return false;
      else if (UI.delai === '__bloq2' && !(r.actif && r.delai > SEUILS.delaiAlerte * 2)) return false;
      else if (UI.delai === '__offre' && !(r.stade === 'Offre envoyee' && r.delai > SEUILS.delaiOffre)) return false;
      if (UI.kpi === 'cour' && !r.actif) return false;
      else if (UI.kpi === 'acc' && r.stade !== 'Accepte') return false;
      else if (UI.kpi === 'ref' && r.stade !== 'Refuse') return false;
      else if (UI.kpi === 'tal' && r.score < SEUILS.scoreTalent) return false;
      else if (UI.kpi === 'notev' && !(r.si >= 2 && r.si < 6 && !String(r.evaluateur || '').trim())) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    function rankPrio(p) { return p === 'Haute' ? 3 : p === 'Moyenne' ? 2 : p === 'Basse' ? 1 : 0; }
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'stade') { va = a.si; vb = b.si; }
      else if (k === 'prio') { va = rankPrio(a.priorite); vb = rankPrio(b.priorite); }
      else if (k === 'score') { va = a.score; vb = b.score; }
      else if (k === 'delai') { va = a.delai; vb = b.delai; }
      else if (k === 'date') { va = dateKey(a.date); vb = dateKey(b.date); }
      else if (k === 'dm') { va = dateKey(a.dateMouvement); vb = dateKey(b.dateMouvement); }
      else { va = String(a[k] != null ? a[k] : ''); vb = String(b[k] != null ? b[k] : ''); return va.localeCompare(vb, 'fr') * dir; }
      return (va - vb) * dir;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.stade ? 1 : 0) + (UI.prio ? 1 : 0) + (UI.source ? 1 : 0) + (UI.dept ? 1 : 0) + (UI.score ? 1 : 0) + (UI.delai ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.stade = ''; UI.prio = ''; UI.source = ''; UI.dept = ''; UI.score = ''; UI.delai = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('main h1, main h2, main h5, main h6, [role="main"] h5, h5');
    for (var i = 0; i < hs.length; i++) {
      if (/Pipeline\s+de\s+Recrutement/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-apl="root"]');
    if (!root) {
      root = h('section', { 'data-apl': 'root', class: 'apl-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-apl-page')) {
      page.setAttribute('data-apl-page', '1');
      page.setAttribute('data-apl-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-apl-hide')) {
      natif.setAttribute('data-apl-hide', '1');
      natif.setAttribute('data-apl-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-apl="root"]'); if (root) root.remove();
    $$('[data-apl-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-apl-oldw') || '';
      n.removeAttribute('data-apl-page');
      n.removeAttribute('data-apl-oldw');
    });
    $$('[data-apl-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-apl-olddisp') || '';
      n.removeAttribute('data-apl-hide');
      n.removeAttribute('data-apl-olddisp');
    });
    $$('[data-apl]').forEach(function (n) { n.remove(); });
  }
  function showNative() {
    var root = $('[data-apl="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'apl-btn apl-btn-primary apl-backbtn', 'data-apl': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage vue native', 'pipeline-candidatures');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pipe: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>',
    kan: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="18" rx="1.2"/><rect x="9.5" y="3" width="5" height="12" rx="1.2"/><rect x="16" y="3" width="5" height="15" rx="1.2"/></svg>',
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
  var HERO_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="18" rx="1.2"/><rect x="10" y="3" width="5" height="12" rx="1.2"/><rect x="17" y="3" width="4" height="15" rx="1.2"/></svg>';

  function buildShell() {
    var root = $('[data-apl="root"]');
    if (!root || $('[data-apl="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="apl-hero" data-apl="hero">' +
        '<div class="apl-hero-main">' +
          '<div class="apl-hero-title">' +
            '<span class="apl-hero-ico" aria-hidden="true">' + HERO_ICON + '</span>' +
            '<div><h2 class="apl-h2">Centre de pilotage — Pipeline de Recrutement</h2>' +
            '<p class="apl-hero-sub" data-apl="herosub"></p></div>' +
          '</div>' +
          '<div class="apl-hero-actions">' +
            '<button class="apl-btn" data-apl="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="apl-btn" data-apl="btn-pipe" title="Flux & goulots (P)">' + ICO.pipe + 'Flux & goulots</button>' +
            '<button class="apl-btn" data-apl="btn-cmp" title="Comparer des candidatures (C)">' + ICO.cmp + 'Comparer <span class="apl-nc-badge" data-apl="cmp-badge"></span></button>' +
            '<button class="apl-btn" data-apl="btn-seuils" title="Seuils de pilotage">' + ICO.seuils + 'Seuils</button>' +
            '<button class="apl-btn" data-apl="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="apl-btn" data-apl="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="apl-btn apl-btn-primary" data-apl="btn-new" title="Nouvelle candidature (N)">' + ICO.plus + 'Nouvelle candidature</button>' +
          '</div>' +
        '</div>' +
        '<div class="apl-hero-alerts" data-apl="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="apl-kpis" data-apl="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="apl-charts" data-apl="charts">' +
        '<div class="apl-chart-card"><div class="apl-chart-title">Candidatures par stade</div><div class="apl-donut-wrap" data-apl="donut"></div></div>' +
        '<div class="apl-chart-card"><div class="apl-chart-title">Candidatures par département</div><div class="apl-bars" data-apl="bars"></div></div>' +
        '<div class="apl-chart-card"><div class="apl-chart-title">Candidatures par source</div><div class="apl-bars" data-apl="sources"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="apl-toolbar" data-apl="toolbar">' +
        '<div class="apl-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (n°, nom, poste, évaluateur, notes…)" data-apl="search" aria-label="Rechercher une candidature" /></div>' +
        '<select data-apl="f-stade" class="apl-sel" aria-label="Filtrer par stade"></select>' +
        '<select data-apl="f-prio" class="apl-sel" aria-label="Filtrer par priorité"></select>' +
        '<select data-apl="f-source" class="apl-sel" aria-label="Filtrer par source"></select>' +
        '<select data-apl="f-dept" class="apl-sel" aria-label="Filtrer par département"></select>' +
        '<select data-apl="f-score" class="apl-sel" aria-label="Filtrer par score"></select>' +
        '<select data-apl="f-delai" class="apl-sel" aria-label="Filtrer par délai"></select>' +
        '<button class="apl-chipbtn" data-apl="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="apl-count" data-apl="count"></span>' +
        '<div class="apl-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="apl-vbtn" data-apl="v-kanban" title="Vue Kanban (K) — glisser-déposer">' + ICO.kan + 'Kanban</button>' +
          '<button class="apl-vbtn" data-apl="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="apl-vbtn" data-apl="v-cards" title="Vue cartes">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-apl="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-apl="selbar"></div>' +

      /* PIED */
      '<div class="apl-foot">Source de vérité locale (navigateur) — conforme Manuel D1 (pipeline de recrutement) · journal d\u2019audit actif · seuils configurables · <button class="apl-link" data-apl="btn-native">Afficher la vue native</button></div>';

    $('[data-apl="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-apl="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-apl="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'pipeline-candidatures'); window.print(); });
    $('[data-apl="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-apl="btn-pipe"]', root).addEventListener('click', openPipeline);
    $('[data-apl="btn-cmp"]', root).addEventListener('click', openCompare);
    $('[data-apl="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-apl="btn-native"]', root).addEventListener('click', showNative);
    $('[data-apl="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-apl="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-apl="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-apl="f-stade"]', root).addEventListener('change', function (e) { UI.stade = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-apl="f-prio"]', root).addEventListener('change', function (e) { UI.prio = e.target.value; UI.page = 0; refresh(); });
    $('[data-apl="f-source"]', root).addEventListener('change', function (e) { UI.source = e.target.value; UI.page = 0; refresh(); });
    $('[data-apl="f-dept"]', root).addEventListener('change', function (e) { UI.dept = e.target.value; UI.page = 0; refresh(); });
    $('[data-apl="f-score"]', root).addEventListener('change', function (e) { UI.score = e.target.value; UI.page = 0; refresh(); });
    $('[data-apl="f-delai"]', root).addEventListener('change', function (e) { UI.delai = e.target.value; UI.page = 0; refresh(); });
    $('[data-apl="v-kanban"]', root).addEventListener('click', function () { UI.view = 'kanban'; saveUI(); refresh(); });
    $('[data-apl="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-apl="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var act = rows.filter(function (r) { return r.actif; }).length;
    var acc = rows.filter(function (r) { return r.stade === 'Accepte'; }).length;
    var evals = rows.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length) : 0;
    var sub = rows.length + ' candidature' + (rows.length > 1 ? 's' : '') +
      ' · ' + act + ' en cours' +
      ' · ' + acc + ' accepté' + (acc > 1 ? 's' : '') + ' (' + pct(rows.length ? acc / rows.length * 100 : 0) + ')' +
      ' · score moyen ' + (evals.length ? moy.toFixed(1) : '—') + '/20';
    $('[data-apl="herosub"]').textContent = sub;
    var zone = $('[data-apl="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="apl-alert ' + a.tone + '" data-apl="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.apl-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'bloq') UI.delai = '__bloq';
        else if (f === 'eval') { UI.score = 'none'; UI.stade = '__adv'; }
        else if (f === 'offre') UI.delai = '__offre';
        else if (f === 'notev') UI.kpi = 'notev';
        else if (f === 'talent') UI.kpi = 'tal';
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var act = rows.filter(function (r) { return r.actif; });
    var acc = rows.filter(function (r) { return r.stade === 'Accepte'; }).length;
    var ref = rows.filter(function (r) { return r.stade === 'Refuse'; }).length;
    var evals = rows.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length : 0;
    var delMoy = act.length ? Math.round(act.reduce(function (s, r) { return s + r.delai; }, 0) / act.length) : 0;
    var postes = {}; var depts = {};
    rows.forEach(function (r) { if (r.poste) postes[r.poste] = 1; if (r.departement) depts[r.departement] = 1; });
    var kpis = [
      { k: '', t: 'CANDIDATURES', v: String(nb), s: Object.keys(postes).length + ' postes · ' + Object.keys(depts).length + ' départements', cls: '' },
      { k: 'cour', t: 'EN COURS', v: String(act.length), s: 'CV reçus → offre envoyée', cls: '' },
      { k: 'acc', t: 'ACCEPTÉS', v: String(acc), s: 'taux d\u2019acceptation ' + pct(nb ? acc / nb * 100 : 0), cls: acc === 0 ? 'gold' : '' },
      { k: 'ref', t: 'REFUSÉS', v: String(ref), s: 'taux de refus ' + pct(nb ? ref / nb * 100 : 0), cls: '' },
      { k: '', t: 'SCORE MOYEN', v: (evals.length ? moy.toFixed(1) : '—') + '/20', s: 'sur ' + evals.length + ' évalué' + (evals.length > 1 ? 's' : ''), cls: '' },
      { k: '', t: 'DÉLAI MOYEN', v: delMoy + ' j', s: 'candidatures actives (seuil ' + SEUILS.delaiAlerte + ' j)', cls: delMoy > SEUILS.delaiAlerte ? 'gold' : '' }
    ];
    var zone = $('[data-apl="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="apl-kpi' + (k.cls === 'gold' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="apl-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="apl-kpi-v' + (k.cls === 'gold' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="apl-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.apl-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.stade = ''; UI.prio = ''; UI.source = ''; UI.dept = ''; UI.score = ''; UI.delai = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Candidatures par stade">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">candidatures</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-apl="donut"]');
    var parts = STADES.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.stade === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="apl-donut-legend">' + parts.map(function (p) {
        return '<span class="apl-dl-item' + (UI.stade === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="apl-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="apl-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.apl-dl-item', zone).forEach(function (it) {
      function act() {
        var k = it.getAttribute('data-st');
        UI.stade = UI.stade === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      }
      it.addEventListener('click', act);
      it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
  }

  function barRowsHtml(items) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) return '<div class="apl-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="apl-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="apl-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="apl-bar-track"><span class="apl-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="apl-bar-val">' + it.v + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-apl="bars"]');
    var map = {};
    rows.forEach(function (r) { var p = r.departement || '—'; if (!map[p]) map[p] = { key: p, name: p, v: 0 }; map[p].v++; });
    var items = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items);
    $$('.apl-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        resetFilters();
        UI.dept = k;
        refresh();
      });
    });
    var z2 = $('[data-apl="sources"]');
    var map2 = {};
    rows.forEach(function (r) { var s = r.source || '—'; if (!map2[s]) map2[s] = { key: s, name: s, v: 0 }; map2[s].v++; });
    var items2 = Object.keys(map2).map(function (k) { return map2[k]; }).sort(function (a, b) { return b.v - a.v; });
    z2.innerHTML = barRowsHtml(items2);
    $$('.apl-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.source = UI.source === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var srcs = {}, dpts = {};
    rows.forEach(function (r) { if (r.source) srcs[r.source] = 1; if (r.departement) dpts[r.departement] = 1; });
    var sel1 = $('[data-apl="f-stade"]');
    sel1.innerHTML = '<option value="">Stade : tous</option>' +
      '<option value="__actif"' + (UI.stade === '__actif' ? ' selected' : '') + '>En cours (actifs)</option>' +
      '<option value="__adv"' + (UI.stade === '__adv' ? ' selected' : '') + '>Stades avancés (Test +)</option>' +
      STADES.map(function (s) {
        return '<option value="' + esc(s.k) + '"' + (UI.stade === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
      }).join('');
    var sel2 = $('[data-apl="f-prio"]');
    sel2.innerHTML = '<option value="">Priorité : toutes</option>' + PRIOS.map(function (p) {
      return '<option value="' + esc(p.k) + '"' + (UI.prio === p.k ? ' selected' : '') + '>' + esc(p.lab) + '</option>';
    }).join('');
    var sel3 = $('[data-apl="f-source"]');
    sel3.innerHTML = '<option value="">Source : toutes</option>' + Object.keys(srcs).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.source === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel4 = $('[data-apl="f-dept"]');
    sel4.innerHTML = '<option value="">Département : tous</option>' + Object.keys(dpts).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.dept === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel5 = $('[data-apl="f-score"]');
    sel5.innerHTML = '<option value="">Score : tous</option>' +
      '<option value="t15"' + (UI.score === 't15' ? ' selected' : '') + '>\u2265 ' + SEUILS.scoreTalent + ' /20</option>' +
      '<option value="t12"' + (UI.score === 't12' ? ' selected' : '') + '>\u2265 12 /20</option>' +
      '<option value="none"' + (UI.score === 'none' ? ' selected' : '') + '>Non évalués</option>';
    var sel6 = $('[data-apl="f-delai"]');
    sel6.innerHTML = '<option value="">Délai : tous</option>' +
      '<option value="__bloq"' + (UI.delai === '__bloq' ? ' selected' : '') + '>Actifs &gt; ' + SEUILS.delaiAlerte + ' j</option>' +
      '<option value="__bloq2"' + (UI.delai === '__bloq2' ? ' selected' : '') + '>Actifs &gt; ' + (SEUILS.delaiAlerte * 2) + ' j</option>' +
      '<option value="__offre"' + (UI.delai === '__offre' ? ' selected' : '') + '>Offres &gt; ' + SEUILS.delaiOffre + ' j</option>';
    $('[data-apl="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-apl="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' candidatures';
  }

  function stadeChip(r) {
    return '<span class="apl-chip st" style="background:' + r.st.c + '18;border-color:' + r.st.c + '66;color:' + r.st.c + '" title="' + esc(r.st.lab) + '">' + esc(r.st.lab) + '</span>';
  }
  function prioChip(r) {
    return '<span class="apl-chip" style="background:' + r.pr.c + '14;border-color:' + r.pr.c + '55;color:' + r.pr.c + '" title="Priorité ' + esc(r.pr.lab) + '">' + esc(r.pr.lab) + '</span>';
  }
  function scoreCell(r) {
    if (r.score <= 0) return '<span class="apl-score zero" title="Non évalué">—</span>';
    var cls = r.score >= SEUILS.scoreTalent ? ' hi' : ' mid';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="apl-score' + cls + '">' + r.score + '</span>' +
      '<span class="apl-scorebar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(r.score / 20 * 100)) + '%"></i></span></span>';
  }
  function delaiCell(r) {
    if (!r.delai) return '<span class="apl-anci">0 j</span>';
    var cls = '';
    if (r.stade === 'Offre envoyee' && r.delai > SEUILS.delaiOffre) cls = ' err';
    else if (r.actif && r.delai > SEUILS.delaiAlerte) cls = ' err';
    else if (r.actif && r.delai > SEUILS.delaiAlerte / 2) cls = ' warn';
    return '<span class="apl-anci' + cls + '" title="Jours dans le stade actuel">' + r.delai + ' j</span>';
  }

  /* ================= KANBAN (drag & drop) ================= */
  function moveStage(id, ns, via) {
    var r = rowById(id);
    if (!r || r.stade === ns) return;
    var oldLab = r.st.lab, newLab = stadeMeta(ns).lab;
    mutate(function (cur) {
      cur.candidatures = cur.candidatures.map(function (x) {
        if (String(x.id) === String(id)) { x.stade = ns; x.dateMouvement = todayFr(); x.delai = 0; }
        return x;
      });
      return cur;
    }, 'Stade modifié (' + (via || 'kanban') + ')', r.numero + ' ' + r.nom + ' : ' + oldLab + ' → ' + newLab);
    toast(r.numero + ' ' + r.nom + ' → ' + newLab, 'ok');
  }
  function kcardHtml(r) {
    var si = r.si;
    return '<div class="apl-kcard" draggable="true" tabindex="0" role="button" data-kid="' + esc(r.id) + '" style="--kp-c:' + r.pr.c + '"' +
      ' aria-label="' + esc(r.numero + ' ' + r.nom + ' — ' + r.poste + ', stade ' + r.st.lab) + '">' +
      '<div class="apl-kcard-top"><span class="apl-kcard-num">' + esc(r.numero) + '</span>' + prioChip(r) + '</div>' +
      '<div class="apl-kcard-name">' + esc(r.nom) + '</div>' +
      '<div class="apl-kcard-poste">' + esc(r.poste || '—') + '</div>' +
      '<div class="apl-kcard-meta"><span class="apl-kcard-info" title="Source">' + esc(r.source || '—') + '</span>' +
        (r.score > 0 ? '<span class="apl-kcard-info"><b style="color:var(--apl-text)">' + r.score + '</b>/20</span>' : '') + '</div>' +
      '<div class="apl-kcard-foot"><span class="apl-delai-mini' + (r.actif && r.delai > SEUILS.delaiAlerte ? ' err' : (r.actif && r.delai > SEUILS.delaiAlerte / 2 ? ' warn' : '')) + '" title="Jours dans le stade">' + r.delai + ' j</span>' +
        '<span class="apl-kcard-move">' +
          '<button class="apl-mvbtn" data-mv="-1" title="Stade précédent" aria-label="Stade précédent"' + (si <= 0 ? ' disabled' : '') + '>‹</button>' +
          '<button class="apl-mvbtn" data-mv="1" title="Stade suivant" aria-label="Stade suivant"' + (si >= STADES.length - 1 ? ' disabled' : '') + '>›</button>' +
        '</span></div>' +
      '</div>';
  }
  function renderKanban() {
    var rows = filtered();
    var card = $('[data-apl="content"]');
    var cols = STADES.map(function (s) {
      var items = rows.filter(function (r) { return r.stade === s.k; });
      return '<div class="apl-kcol" data-kcol="' + esc(s.k) + '" style="--kcol-c:' + s.c + '" role="list" aria-label="' + esc(s.lab) + '">' +
        '<div class="apl-kcol-head"><span class="apl-kcol-title"><span class="apl-dl-dot" style="background:' + s.c + '"></span>' + esc(s.lab) + '</span>' +
        '<span class="apl-kcol-count">' + items.length + '</span></div>' +
        '<div class="apl-kcol-body" data-drop="' + esc(s.k) + '">' +
          items.map(kcardHtml).join('') +
          (items.length ? '' : '<div class="apl-kcol-empty">Glissez une carte ici</div>') +
        '</div></div>';
    }).join('');
    card.innerHTML = '<div class="apl-kanban" data-apl="kanban">' + cols + '</div>' +
      '<div class="apl-kanban-hint" style="font-size:.72rem;color:var(--apl-text2);margin-top:2px">💡 Glissez-déposez une carte vers une colonne pour faire avancer le stade · boutons ‹ › ou flèches ← → au clavier également · clic sur la carte : fiche complète</div>';

    /* cartes : drag + clavier + clic */
    $$('.apl-kcard', card).forEach(function (c) {
      var id = c.getAttribute('data-kid');
      c.addEventListener('dragstart', function (e) {
        try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (er) {}
        c.classList.add('dragging');
      });
      c.addEventListener('dragend', function () { c.classList.remove('dragging'); $$('.apl-kcol', card).forEach(function (k) { k.classList.remove('dropover'); }); });
      c.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { moveStage(id, STADES[Math.max(0, stadeIdxSafe(id) - 1)].k, 'clavier'); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { moveStage(id, STADES[Math.min(STADES.length - 1, stadeIdxSafe(id) + 1)].k, 'clavier'); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') { openDrawer(id); e.preventDefault(); }
      });
      c.addEventListener('click', function (e) {
        if (e.target.closest('.apl-mvbtn')) return;
        openDrawer(id);
      });
      $$('.apl-mvbtn', c).forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var d = Number(b.getAttribute('data-mv'));
          var cur = stadeIdxSafe(id);
          var nx = Math.max(0, Math.min(STADES.length - 1, cur + d));
          if (nx !== cur) moveStage(id, STADES[nx].k, 'bouton');
        });
      });
    });
    /* colonnes : drop zones */
    $$('.apl-kcol', card).forEach(function (k) {
      var st = k.getAttribute('data-kcol');
      var body = $('[data-drop]', k);
      k.addEventListener('dragover', function (e) { e.preventDefault(); try { e.dataTransfer.dropEffect = 'move'; } catch (er) {} k.classList.add('dropover'); });
      k.addEventListener('dragleave', function (e) { if (e.target === k || !k.contains(e.relatedTarget)) k.classList.remove('dropover'); });
      k.addEventListener('drop', function (e) {
        e.preventDefault();
        k.classList.remove('dropover');
        var did = '';
        try { did = e.dataTransfer.getData('text/plain'); } catch (er) {}
        if (did) moveStage(did, st, 'glisser-déposer');
      });
    });
  }
  function stadeIdxSafe(id) {
    var r = rowById(id);
    return r ? r.si : 0;
  }

  /* ================= table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var act = all.filter(function (r) { return r.actif; }).length;
    var acc = all.filter(function (r) { return r.stade === 'Accepte'; }).length;
    var evals = all.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length).toFixed(1) : '—';
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      return '<th ' + (key ? 'data-sort="' + key + '"' : '') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="apl-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'apl-th-chk') + th('N°', 'numero') + th('Candidat', 'nom') + th('Poste', 'poste') + th('Département', 'departement') +
      th('Source', 'source') + th('Stade', 'stade') + th('Priorité', 'prio') + th('Score', 'score') + th('Délai', 'delai') +
      th('Évaluateur', 'evaluateur') + th('Prochaine action', 'prochaineAction') + th('Entrée', 'date') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="apl-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.nom) + '"></td>' +
        '<td class="apl-num">' + esc(r.numero) + '</td>' +
        '<td><span class="apl-poste" data-open="' + esc(r.id) + '">' + esc(r.nom) + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.poste || '—') + '</td>' +
        '<td>' + esc(r.departement || '—') + '</td>' +
        '<td>' + (r.source ? '<span class="apl-chip neutral">' + esc(r.source) + '</span>' : '—') + '</td>' +
        '<td>' + stadeChip(r) + '</td>' +
        '<td>' + prioChip(r) + '</td>' +
        '<td>' + scoreCell(r) + '</td>' +
        '<td>' + delaiCell(r) + '</td>' +
        '<td>' + esc(r.evaluateur || '—') + '</td>' +
        '<td>' + esc(r.prochaineAction || '—') + '</td>' +
        '<td class="apl-num">' + esc(r.date || '—') + '</td>' +
        '<td><div class="apl-actions">' +
          '<button class="apl-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="apl-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="apl-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="apl-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="apl-tfoot"><td></td><td colspan="13">TOTAL ' + all.length + ' candidatures · ' + act + ' en cours · ' + acc + ' accepté(s) · score moyen ' + moy + '/20</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="apl-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="apl-sel" data-apl="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="apl-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="apl-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-apl="content"]');
    card.innerHTML = '<div class="apl-tblcard"><div class="apl-tblwrap"><table class="apl-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="14"><div class="apl-empty">Aucune candidature ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'nom' || k === 'numero' || k === 'poste' ? 1 : -1; }
        refresh();
      });
    });
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 candidatures', 'err'); c.checked = false; return; } UI.cmp.push(id); }
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
    var perSel = $('[data-apl="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  /* ================= cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-apl="content"]');
    card.innerHTML = rows.length ? '<div class="apl-cards">' + rows.map(function (r) {
      return '<div class="apl-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="apl-card-top"><div><input type="checkbox" class="apl-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="apl-num">' + esc(r.numero) + '</span></div>' +
        stadeChip(r) + '</div>' +
        '<div class="apl-card-name" data-open="' + esc(r.id) + '">' + esc(r.nom) + '</div>' +
        '<div class="apl-card-total" style="font-size:.95rem">' + esc(r.poste || '—') + '</div>' +
        '<div class="apl-card-struct"><span>' + scoreCell(r) + delaiCell(r) + '</span>' + prioChip(r) + '</div>' +
        '<div class="apl-card-meta"><span class="apl-chip neutral">' + esc(r.departement || '—') + '</span>' +
        (r.source ? '<span class="apl-chip info">' + esc(r.source) + '</span>' : '') + '</div>' +
        '<div class="apl-card-foot"><span class="apl-num">' + esc(r.date || '—') + (r.evaluateur ? ' · ' + esc(r.evaluateur) : '') + '</span>' +
        '<div class="apl-card-act">' +
          '<button class="apl-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="apl-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="apl-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="apl-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="apl-empty">Aucune candidature ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 candidatures', 'err'); c.checked = false; return; } UI.cmp.push(id); }
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
    var badge = $('[data-apl="cmp-badge"]');
    if (badge) { badge.textContent = UI.cmp.length ? String(UI.cmp.length) : ''; badge.style.display = UI.cmp.length ? '' : 'none'; }
    var zone = $('[data-apl="selbar"]');
    if (!UI.cmp.length) { zone.innerHTML = ''; return; }
    var rows = UI.cmp.map(function (id) { return rowById(id); }).filter(Boolean);
    var evals = rows.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length).toFixed(1) : '—';
    zone.innerHTML = '<div class="apl-selbar">' +
      '<span class="apl-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="apl-selbar-sub">score moyen ' + moy + '/20</span>' +
      '<button class="apl-btn apl-btn-ghost" data-sel="cmp" ' + (rows.length < 2 ? 'disabled' : '') + '>Comparer</button>' +
      '<button class="apl-btn apl-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="apl-btn apl-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="apl-btn apl-btn-ghost" data-sel="clear">Annuler</button></div>';
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
  function closeDrawer() { $$('[data-apl="drawer"],[data-apl="backdrop"][data-apl-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var tl = STADES.slice(0, 7).map(function (s, i) {
      var done = r.si > i && r.si !== 7;
      var cur = r.si === i;
      var exit = r.si === 7;
      return '<li class="apl-tl-item' + (done ? ' done' : cur ? ' current' : '') + (exit && i === 6 ? '' : '') + '" style="--kcol-c:' + s.c + '">' +
        esc(s.lab) + (cur ? '<span class="apl-tl-when">depuis ' + r.delai + ' j · ' + esc(r.dateMouvement || '—') + '</span>' : '') + '</li>';
    }).join('');
    var accepteNote = r.stade === 'Accepte' ? '<p style="margin:4px 0 8px"><span class="apl-chip ok">Embauche acceptée — préparer le contrat</span></p>' : '';
    var refuseNote = r.stade === 'Refuse' ? '<p style="margin:4px 0 8px"><span class="apl-chip" style="background:#dc262614;border-color:#dc262666;color:#dc2626">Candidature refusée</span></p>' : '';
    var dr = h('aside', { class: 'apl-drawer', 'data-apl': 'drawer', role: 'dialog', 'aria-label': 'Fiche ' + r.nom });
    dr.innerHTML =
      '<div class="apl-drawer-head"><div><div class="apl-drawer-title">' + esc(r.nom) + '</div>' +
      '<div class="apl-drawer-sub">' + esc(r.numero) + ' · ' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div></div>' +
      '<button class="apl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apl-drawer-body">' +
        '<div class="apl-live" style="margin-top:0"><span>Stade <b style="color:' + r.st.c + '">' + esc(r.st.lab) + '</b></span>' +
          '<span>Score <b>' + (r.score > 0 ? r.score + '/20' : '—') + '</b></span>' +
          '<span>Délai <b>' + r.delai + ' j</b></span>' +
          '<span>Priorité <b>' + esc(r.pr.lab) + '</b></span></div>' +
        '<div class="apl-fsec">Parcours dans le pipeline</div>' +
        accepteNote + refuseNote +
        '<ul class="apl-timeline">' + tl + '</ul>' +
        '<div class="apl-fsec">Actions rapides</div>' +
        '<div class="apl-sim-row" style="margin-bottom:10px"><label for="apl-stsel">Changer le stade</label>' +
          '<select id="apl-stsel" class="apl-in" data-apl="stsel">' + STADES.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.stade ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="apl-sim-row" style="margin-bottom:10px"><label for="apl-prsel">Priorité</label>' +
          '<select id="apl-prsel" class="apl-in" data-apl="prsel">' + PRIOS.map(function (p) {
            return '<option value="' + esc(p.k) + '"' + (p.k === r.priorite ? ' selected' : '') + '>' + esc(p.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<dl class="apl-kv">' +
          '<dt>Poste visé</dt><dd>' + esc(r.poste || '—') + '</dd>' +
          '<dt>Département</dt><dd>' + esc(r.departement || '—') + '</dd>' +
          '<dt>Source</dt><dd>' + esc(r.source || '—') + '</dd>' +
          '<dt>Date d\u2019entrée</dt><dd>' + esc(r.date || '—') + '</dd>' +
          '<dt>Dernier mouvement</dt><dd>' + esc(r.dateMouvement || '—') + '</dd>' +
          '<dt>Évaluateur</dt><dd>' + esc(r.evaluateur || '—') + '</dd>' +
          '<dt>Prochaine action</dt><dd>' + esc(r.prochaineAction || '—') + '</dd>' +
        '</dl>' +
        '<div class="apl-fsec">Notes</div>' +
        '<textarea class="apl-notebox" data-apl="note" placeholder="Notes internes (entretiens, impressions, relances…)">' + esc(r.notes || '') + '</textarea>' +
        '<div class="apl-drawer-actions">' +
          '<button class="apl-btn apl-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="apl-btn apl-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="apl-btn apl-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="apl-btn apl-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.apl-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-apl="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      var cur = rowById(id);
      if (!cur || nv === cur.stade) return;
      moveStage(id, nv, 'fiche');
    });
    $('[data-apl="prsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      var cur = rowById(id);
      if (!cur || nv === cur.priorite) return;
      mutate(function (cur) {
        cur.candidatures = cur.candidatures.map(function (x) { if (String(x.id) === String(id)) x.priorite = nv; return x; });
        return cur;
      }, 'Priorité modifiée', r.numero + ' → ' + nv);
      toast('Priorité : ' + nv, 'ok');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-apl="note"]', dr).value;
      mutate(function (cur) {
        cur.candidatures = cur.candidatures.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.numero);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', r.numero);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-apl="dialog"],[data-apl="backdrop"][data-apl-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'apl-dialog', 'data-apl': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une candidature' : 'Nouvelle candidature' });
    function opts(list, cur, labFn) {
      return list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = labFn ? labFn(x) : (typeof x === 'object' ? x.lab : x);
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    dlg.innerHTML =
      '<div class="apl-dialog-head"><h3>' + (r ? 'Modifier la candidature ' + esc(r.numero) : 'Nouvelle candidature') + '</h3>' +
      '<button class="apl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apl-dialog-body">' +
        '<div class="apl-fgrid">' +
          '<label class="apl-lab">Nom du candidat *<input class="apl-in" data-f="nom" value="' + esc(v('nom')) + '" placeholder="Ex. Ndiaye Moussa"></label>' +
          '<label class="apl-lab">Poste visé *<input class="apl-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="apl-lab">Département<select class="apl-in" data-f="departement">' + opts(DEPARTEMENTS, v('departement')) + '</select></label>' +
          '<label class="apl-lab">Source<select class="apl-in" data-f="source">' + opts(SOURCES, v('source')) + '</select></label>' +
          '<label class="apl-lab">Stade<select class="apl-in" data-f="stade">' + opts(STADES, v('stade') || 'CV recu', function (x) { return x.lab; }) + '</select></label>' +
          '<label class="apl-lab">Priorité<select class="apl-in" data-f="priorite">' + opts(PRIOS, v('priorite') || 'Moyenne', function (x) { return x.lab; }) + '</select></label>' +
          '<label class="apl-lab">Date d\u2019entrée<input class="apl-in" data-f="date" value="' + esc(v('date') || todayFr()) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="apl-lab">Score /20<input class="apl-in" type="number" min="0" max="20" step="1" data-f="score" value="' + esc(v('score') || '') + '" placeholder="Non évalué"></label>' +
          '<label class="apl-lab">Évaluateur<input class="apl-in" data-f="evaluateur" value="' + esc(v('evaluateur')) + '" placeholder="Ex. M. Nkoulou Paul"></label>' +
          '<label class="apl-lab">Prochaine action<input class="apl-in" data-f="prochaineAction" value="' + esc(v('prochaineAction')) + '" placeholder="Ex. Entretien final"></label>' +
          '<label class="apl-lab full">Notes<textarea class="apl-in apl-ta" data-f="notes" placeholder="Impressions, relances, précisions…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        '<div class="apl-live" data-apl="dlg-live"></div>' +
        '<div data-apl="dlg-err"></div>' +
      '</div>' +
      '<div class="apl-dialog-foot"><span class="apl-form-hint">ISO 30401 · pipeline conforme Manuel D1 · chaque changement de stade est journalisé</span>' +
      '<span style="display:flex;gap:8px"><button class="apl-btn apl-btn-ghost" data-act="cancel" style="color:var(--apl-text);border-color:var(--apl-line)">Annuler</button>' +
      '<button class="apl-btn apl-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer la candidature') + '</button></span></div>';
    $('.apl-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var sc = Number(val.score) || 0;
      var samePoste = rows.filter(function (x) { return norm(x.poste) === norm(val.poste) && (!editId || String(x.id) !== String(editId)); }).length;
      $('[data-apl="dlg-live"]', dlg).innerHTML =
        '<span>Score <b class="' + (sc >= SEUILS.scoreTalent ? 'good' : sc > 0 ? '' : '') + '">' + (sc > 0 ? sc + '/20' : 'non évalué') + '</b></span>' +
        '<span>Stade <b>' + esc(val.stade ? stadeMeta(val.stade).lab : '—') + '</b></span>' +
        '<span>Priorité <b>' + esc(val.priorite || '—') + '</b></span>' +
        (samePoste ? '<span><b>' + samePoste + '</b> autre(s) candidature(s) sur ce poste</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-apl="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="apl-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.nom || '').trim()) return fail('Le nom du candidat est obligatoire.');
      if (!String(val.poste || '').trim()) return fail('Le poste visé est obligatoire.');
      if (!String(val.stade || '').trim()) return fail('Le stade est obligatoire.');
      if (!String(val.priorite || '').trim()) return fail('La priorité est obligatoire.');
      var sc = val.score === '' ? null : Number(val.score);
      if (sc != null && (!isFinite(sc) || sc < 0 || sc > 20)) return fail('Le score doit être compris entre 0 et 20.');
      var rec = {
        nom: String(val.nom).trim(),
        poste: String(val.poste).trim(),
        departement: String(val.departement || '').trim(),
        source: String(val.source || '').trim(),
        stade: String(val.stade).trim(),
        priorite: String(val.priorite).trim(),
        date: String(val.date || '').trim() || todayFr(),
        score: sc,
        evaluateur: String(val.evaluateur || '').trim(),
        prochaineAction: String(val.prochaineAction || '').trim(),
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.candidatures = cur.candidatures.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Candidature modifiée', rec.nom);
        toast('Candidature mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var nid = nextNumero(cur.candidatures);
          var cp = {
            id: nid,
            numero: 'PPL-' + String(nid).padStart(3, '0'),
            dateMouvement: rec.date,
            delai: 0
          };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.candidatures = cur.candidatures.concat([cp]);
          return cur;
        }, 'Candidature créée', rec.nom);
        toast('Candidature créée — ' + rec.nom, 'ok');
      }
      closeDialog();
      closeDrawer();
    });
    document.body.appendChild(bd);
    document.body.appendChild(dlg);
    var first = $('[data-f="nom"]', dlg);
    if (first) first.focus();
  }

  /* ================= duplication / suppression ================= */
  function dupRow(id) {
    var r = rowById(id);
    if (!r) return;
    mutate(function (cur) {
      var nid = nextNumero(cur.candidatures);
      var cp = { id: nid, numero: 'PPL-' + String(nid).padStart(3, '0') };
      for (var k in r) {
        if (['id', 'numero', 'st', 'si', 'pr', 'actif', 'delai', 'dateMouvement', 'stade', 'score', 'evaluateur', 'prochaineAction'].indexOf(k) < 0) cp[k] = r[k];
      }
      cp.stade = 'CV recu';
      cp.delai = 0;
      cp.dateMouvement = cp.date || todayFr();
      cp.score = null;
      cp.evaluateur = '';
      cp.prochaineAction = 'Pré-sélection';
      cur.candidatures = cur.candidatures.concat([cp]);
      return cur;
    }, 'Candidature dupliquée', r.numero);
    toast('Candidature dupliquée (stade réinitialisé à « CV reçus »)', 'ok');
  }
  function closeConfirm() { $$('[data-apl="confirm"],[data-apl="backdrop"][data-apl-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'apl-confirm', 'data-apl': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette candidature ?</h4><p>' + esc(r.numero) + ' — ' + esc(r.nom) + ' (' + esc(r.poste || '—') + ', stade ' + esc(r.st.lab) + '). Cette action est définitive.</p>' +
      '<div class="apl-confirm-row"><button class="apl-btn apl-btn-ghost" data-a="no" style="color:var(--apl-text);border-color:var(--apl-line)">Annuler</button>' +
      '<button class="apl-btn apl-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.candidatures = cur.candidatures.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Candidature supprimée', r.numero);
      UI.cmp = UI.cmp.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Candidature supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' candidatures ?') : 'Supprimer 1 candidature ?';
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'apl-confirm', 'data-apl': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="apl-confirm-row"><button class="apl-btn apl-btn-ghost" data-a="no" style="color:var(--apl-text);border-color:var(--apl-line)">Annuler</button>' +
      '<button class="apl-btn apl-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.candidatures = cur.candidatures.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' candidatures');
      UI.cmp = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' candidatures supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= comparateur ================= */
  function closeCompare() { $$('[data-apl="compare"],[data-apl="backdrop"][data-apl-for="compare"]').forEach(function (n) { n.remove(); }); }
  function openCompare() {
    closeCompare();
    var ids = UI.cmp.length >= 2 ? UI.cmp : [];
    if (ids.length < 2) {
      var all = data().slice().sort(function (a, b) { return b.score - a.score; });
      ids = [all[0], all[1]].filter(Boolean).map(function (r) { return String(r.id); });
    }
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (rows.length < 2) { toast('Sélectionnez au moins 2 candidatures à comparer', 'err'); return; }
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'compare' });
    bd.addEventListener('click', closeCompare);
    var p = h('div', { class: 'apl-panel', 'data-apl': 'compare', role: 'dialog', 'aria-label': 'Comparateur' });
    var head = '<tr><th>Critère</th>' + rows.map(function (r) { return '<th>' + esc(r.nom) + '<br><span style="font-weight:600;color:var(--apl-text2)">' + esc(r.numero) + '</span></th>'; }).join('') + '</tr>';
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
      row2('Stade atteint', function (r) { return r.si < 0 ? -1 : r.si; }, function (v, r) { return esc(r.st.lab); }, false) +
      row2('Score /20', function (r) { return r.score; }, function (v) { return v > 0 ? String(v) : '—'; }, false) +
      row2('Priorité', function () { return 0; }, function (v, r) { return esc(r.pr.lab); }, false) +
      row2('Délai dans le stade', function (r) { return r.delai; }, function (v) { return v + ' j'; }, true) +
      row2('Poste visé', function () { return 0; }, function (v, r) { return esc(r.poste || '—'); }, false) +
      row2('Département', function () { return 0; }, function (v, r) { return esc(r.departement || '—'); }, false) +
      row2('Source', function () { return 0; }, function (v, r) { return esc(r.source || '—'); }, false) +
      row2('Évaluateur', function () { return 0; }, function (v, r) { return esc(r.evaluateur || '—'); }, false) +
      row2('Prochaine action', function () { return 0; }, function (v, r) { return esc(r.prochaineAction || '—'); }, false) +
      row2('Date d\u2019entrée', function () { return 0; }, function (v, r) { return esc(r.date || '—'); }, false);
    var best = rows.slice().sort(function (a, b) { return b.score - a.score; })[0];
    p.innerHTML = '<div class="apl-panel-head"><h3>Comparateur de candidatures — aide à la décision</h3><button class="apl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apl-panel-body"><div class="apl-cmp-wrap"><table class="apl-cmp"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="apl-cibles-note" style="margin-top:10px">Vert = le plus favorable · Rouge = le moins favorable sur le critère. Score le plus élevé : <b>' + esc(best.nom) + '</b> (' + best.score + '/20). La décision finale reste humaine (ISO 30401).</p></div>';
    $('.apl-drawer-x', p).addEventListener('click', closeCompare);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Comparateur ouvert', rows.length + ' candidatures');
  }

  /* ================= flux & goulots ================= */
  function closePipeline() { $$('[data-apl="pipe"],[data-apl="backdrop"][data-apl-for="pipe"]').forEach(function (n) { n.remove(); }); }
  function openPipeline() {
    closePipeline();
    var rows = data();
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'pipe' });
    bd.addEventListener('click', closePipeline);
    var p = h('div', { class: 'apl-panel', 'data-apl': 'pipe', role: 'dialog', 'aria-label': 'Flux et goulots' });
    var nb = rows.length;
    var acc = rows.filter(function (r) { return r.stade === 'Accepte'; }).length;
    var ref = rows.filter(function (r) { return r.stade === 'Refuse'; }).length;
    var actives = rows.filter(function (r) { return r.actif; });
    var delMoy = actives.length ? Math.round(actives.reduce(function (s, r) { return s + r.delai; }, 0) / actives.length) : 0;
    /* funnel : candidatures ayant atteint chaque étape (stade courant plus avancé ou accepté) */
    function reached(i) {
      return rows.filter(function (r) { return (r.si >= i && r.si <= 6) || r.si === 6; }).length;
    }
    var funnelRows = '';
    for (var i = 0; i < FUNNEL.length; i++) {
      var s = STADES[FUNNEL[i]];
      var n = reached(FUNNEL[i]);
      var prev = i > 0 ? reached(FUNNEL[i - 1]) : n;
      var conv = i > 0 ? (prev ? Math.round(n / prev * 100) : 0) : 100;
      funnelRows += '<div class="apl-funrow"><span class="apl-funlab" style="color:' + s.c + ';font-weight:700">' + esc(s.lab) + '</span>' +
        '<span class="apl-bar-track"><span class="apl-bar-fill" style="width:' + Math.max(nb ? n / nb * 100 : 0, n ? 3 : 0) + '%;background:' + s.c + '"></span></span>' +
        '<span><b>' + n + '</b>' + (i > 0 ? ' <span style="color:var(--apl-text2)">· conv. ' + conv + ' %</span>' : '') + '</span></div>';
    }
    /* délai moyen par stade actif */
    var bySt = {};
    STADES.forEach(function (s) { bySt[s.k] = { n: 0, d: 0 }; });
    actives.forEach(function (r) { bySt[r.stade].n++; bySt[r.stade].d += r.delai; });
    var mx = Math.max.apply(null, STADES.map(function (s) { return bySt[s.k].n; }).concat([1]));
    var bars = STADES.filter(function (s) { return s.k !== 'Accepte' && s.k !== 'Refuse'; }).map(function (s) {
      var b = bySt[s.k];
      var moy2 = b.n ? Math.round(b.d / b.n) : 0;
      return '<div class="apl-sim-arow"><span style="min-width:140px;color:' + s.c + ';font-weight:700">' + esc(s.lab) + '</span>' +
        '<span class="apl-bar-track"><span class="apl-bar-fill" style="width:' + Math.max(b.n ? 4 : 0, b.n / mx * 100) + '%;background:' + s.c + '"></span></span>' +
        '<span><b>' + b.n + '</b> · ' + moy2 + ' j moy.' + (moy2 > SEUILS.delaiAlerte ? ' ⚠' : '') + '</span></div>';
    }).join('');
    var goulot = null;
    STADES.forEach(function (s) {
      if (s.k === 'Accepte' || s.k === 'Refuse') return;
      var b = bySt[s.k];
      if (b.n && (!goulot || b.n > goulot.n)) goulot = { lab: s.lab, n: b.n, d: Math.round(b.d / b.n) };
    });
    var tip = '💡 ';
    if (goulot) tip += 'Le goulot principal est « ' + goulot.lab + ' » (' + goulot.n + ' candidature(s), ' + goulot.d + ' j d\u2019attente moyenne). ';
    if (delMoy > SEUILS.delaiAlerte) tip += 'Le délai moyen des candidatures actives (' + delMoy + ' j) dépasse le seuil de ' + SEUILS.delaiAlerte + ' j : risque de découragement des candidats.';
    else tip += 'Délai moyen des candidatures actives : ' + delMoy + ' j (seuil ' + SEUILS.delaiAlerte + ' j).';
    p.innerHTML = '<div class="apl-panel-head"><h3>Flux & goulots du pipeline</h3><button class="apl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apl-panel-body">' +
        '<div class="apl-sim-kpis"><span><b>' + actives.length + '</b> en cours</span>' +
          '<span><b>' + acc + '</b> accepté(s) (' + pct(nb ? acc / nb * 100 : 0) + ')</span>' +
          '<span><b>' + ref + '</b> refusé(s) (' + pct(nb ? ref / nb * 100 : 0) + ')</span>' +
          '<span>délai moyen <b>' + delMoy + ' j</b></span></div>' +
        '<div style="font-size:.72rem;color:var(--apl-text2);margin:8px 0 5px">Entonnoir de conversion (candidatures ayant atteint chaque étape) :</div>' +
        '<div class="apl-sim-alloc">' + funnelRows + '</div>' +
        '<div style="font-size:.72rem;color:var(--apl-text2);margin:12px 0 5px">Charge et délai moyen par étape active :</div>' +
        '<div class="apl-sim-alloc">' + bars + '</div>' +
        '<div class="apl-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' +
      '</div>';
    $('.apl-drawer-x', p).addEventListener('click', closePipeline);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Flux & goulots ouvert', '');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-apl="seuils"],[data-apl="backdrop"][data-apl-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'apl-panel', 'data-apl': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="apl-panel-head"><h3>Seuils de pilotage</h3><button class="apl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apl-panel-body">' +
        '<p class="apl-cibles-note">Ces seuils alimentent les alertes, les couleurs du Kanban et le filtre « talents » (Manuel D1 : vivier de talents préservé, délais maîtrisés).</p>' +
        '<div class="apl-sim-row"><label for="apl-s1">Alerte stagnation candidature active (jours)</label><input type="range" id="apl-s1" min="10" max="60" step="1" value="' + SEUILS.delaiAlerte + '"><input class="apl-in" type="number" min="10" max="60" step="1" data-apl="s1n" value="' + SEUILS.delaiAlerte + '"></div>' +
        '<div class="apl-sim-row"><label for="apl-s2">Relance d\u2019offre sans réponse (jours)</label><input type="range" id="apl-s2" min="3" max="15" step="1" value="' + SEUILS.delaiOffre + '"><input class="apl-in" type="number" min="3" max="15" step="1" data-apl="s2n" value="' + SEUILS.delaiOffre + '"></div>' +
        '<div class="apl-sim-row"><label for="apl-s3">Score « talent » (/20)</label><input type="range" id="apl-s3" min="10" max="20" step="1" value="' + SEUILS.scoreTalent + '"><input class="apl-in" type="number" min="10" max="20" step="1" data-apl="s3n" value="' + SEUILS.scoreTalent + '"></div>' +
        '<div class="apl-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="apl-btn apl-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.apl-drawer-x', p).addEventListener('click', closeSeuils);
    [['apl-s1', 's1n', 10, 60], ['apl-s2', 's2n', 3, 15], ['apl-s3', 's3n', 10, 20]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-apl="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[2], Math.min(cfg[3], Number(n.value) || cfg[2])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.delaiAlerte = Math.max(10, Math.min(60, Number($('[data-apl="s1n"]', p).value) || SEUILS.delaiAlerte));
      SEUILS.delaiOffre = Math.max(3, Math.min(15, Number($('[data-apl="s2n"]', p).value) || SEUILS.delaiOffre));
      SEUILS.scoreTalent = Math.max(10, Math.min(20, Number($('[data-apl="s3n"]', p).value) || SEUILS.scoreTalent));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'stagnation > ' + SEUILS.delaiAlerte + ' j · offre > ' + SEUILS.delaiOffre + ' j · talent ≥ ' + SEUILS.scoreTalent + '/20');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-apl="journal"],[data-apl="backdrop"][data-apl-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'apl-backdrop', 'data-apl': 'backdrop', 'data-apl-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'apl-panel', 'data-apl': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="apl-panel-head"><h3>Journal d\u2019activité</h3><button class="apl-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apl-panel-body" data-apl="jlist"></div>';
    $('.apl-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-apl="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="apl-jrow"><span class="apl-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="apl-jact">' + esc(x.action || '') + '</span><span class="apl-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="apl-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Candidature', 'Candidat', 'Poste visé', 'Département', 'Source', 'Stade', 'Priorité', 'Score /20', 'Délai stade (j)', 'Évaluateur', 'Prochaine action', 'Date d\u2019entrée', 'Dernier mouvement', 'Notes'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.numero, r.nom, r.poste, r.departement, r.source, r.st.lab, r.priorite, r.score > 0 ? r.score : '', r.delai, r.evaluateur, r.prochaineAction, r.date, r.dateMouvement, r.notes];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-pipeline-candidatures-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closePipeline(); closeCompare(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-apl="dialog"]') || $('[data-apl="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { openPipeline(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { openCompare(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { UI.view = 'kanban'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-apl="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouveau · E export · J journal · P flux · C comparer · S seuils · K kanban · T tableau · / recherche', ''); }
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
    var root = $('[data-apl="root"]');
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
    if (UI.view === 'cards') renderCards();
    else if (UI.view === 'kanban') renderKanban();
    else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-apl="drawer"],[data-apl="dialog"],[data-apl="confirm"],[data-apl="journal"],[data-apl="pipe"],[data-apl="compare"],[data-apl="seuils"]')) {
      $$('[data-apl="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-apl');
    shellBuilt = false;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-apl]') || t.closest('#apl-stsel'))) continue;
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
    html.classList.remove('admina-apl');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closePipeline(); closeCompare(); closeSeuils();
    UI.cmp = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-apl="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-apl-hide', '1');
      natif.setAttribute('data-apl-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
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

  window.__ADMINA_PPL_UI__ = {
    version: '1.0-m26',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    exportCSV: exportCSV,
    openCompare: openCompare,
    openPipeline: openPipeline
  };
  try { console.info('[ADMINA_PPL] M26 actif — Centre de pilotage pipeline /pipeline-candidatures'); } catch (e) {}
})();
