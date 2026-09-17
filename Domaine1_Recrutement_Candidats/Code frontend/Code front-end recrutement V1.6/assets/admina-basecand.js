/* =============================================================
   Admina-RH — Base de Données Candidats — couche admina
   M25 : CENTRE DE PILOTAGE — Base candidats & pipeline de recrutement
   Héro calculé + alertes contextuelles cliquables + 6 KPI filtres
   + 3 graphiques (donut pipeline par statut, candidats par poste
   visé, candidats par source) + recherche/filtres
   + table triable + vue cartes + drawer fiche complète (candidature,
   croisement demande, formation & compétences, personnel, documents
   & contrat) + croisement ISO avec __ADMINA_STORE__.demandes
   (poste visé ↔ demande ouverte) + création/édition validée 18
   champs + changement de statut rapide + duplication + suppression
   confirmée + barre de sélection multi + comparateur de candidats
   (aide à la décision) + pipeline (flux & goulots) + seuils
   configurables + export CSV complet + journal d'audit local
   + thème sombre + responsive mobile.
   - Scope strict : /Domaine1_Recrutement_Candidats/base-candidats
   - Idempotent (data-abc / data-abc-hide), sans collision (__ADMINA_CAND_M25__)
   - Données : window.__ADMINA_CAND_API__ (patch chunk) → fallback localStorage
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_CAND_M25__) return;
  window.__ADMINA_CAND_M25__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/Domaine1_Recrutement_Candidats\/base-candidats\/?$/;
  var LS_DATA = 'admina-cand-data';
  var LS_UI = 'admina-cand-ui';
  var LS_SEUILS = 'admina-cand-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', source: '', niv: '', score: '', age: '', kpi: '', view: 'table', sortKey: 'date', sortDir: -1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, delId: null, cmp: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { scoreTalent: 15, delaiReponse: 30, partSource: 40 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var STATUTS = [
    { k: 'Nouveau', lab: 'Nouveau', c: '#64748b', f: 'f1' },
    { k: "En cours d'etude", lab: "En cours d'étude", c: '#0891b2', f: 'f2' },
    { k: 'Entretien planifie', lab: 'Entretien planifié', c: '#d97706', f: 'f3' },
    { k: 'Entretien realise', lab: 'Entretien réalisé', c: '#7c3aed', f: 'f4' },
    { k: 'Retenu', lab: 'Retenu', c: '#059669', f: 'f5' },
    { k: 'Refuse', lab: 'Refusé', c: '#dc2626', f: 'f6' },
    { k: 'En reserve', lab: 'En réserve', c: '#6b7280', f: 'f7' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8', f: 'f1' }; }
  var PIPE = ['Nouveau', "En cours d'etude", 'Entretien planifie', 'Entretien realise', 'Retenu'];
  function pipeIdx(k) { return PIPE.indexOf(k); }
  var SOURCES = ['Candidature spontanee', 'Site web entreprise', 'LinkedIn', 'Reseaux sociaux', 'Ecole/Universite', 'Cabinet de recrutement', 'Cooptation', 'Salon emploi'];
  var NIVEAUX = ['Sans diplome', 'CAP/BEP', 'BTS/DUT', 'Licence', 'Master'];
  var CIVILITES = ['M.', 'Mme'];
  var CONTRATS = ['CDI', 'CDD', 'Stage', 'Autre'];

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
  function daysSince(s) {
    var t = tsOf(s);
    if (!t) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
  function ageFrom(dob) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(dob || '').trim());
    if (!m) return 0;
    var b = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    if (isNaN(b.getTime())) return 0;
    var d = new Date();
    var a = d.getUTCFullYear() - b.getUTCFullYear();
    var mm = d.getUTCMonth() - b.getUTCMonth();
    if (mm < 0 || (mm === 0 && d.getUTCDate() < b.getUTCDate())) a--;
    return Math.max(0, a);
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
  function toastsZone() { var z = $('[data-abc="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-abc', 'toasts'); z.className = 'abc-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'abc-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_CAND_API__ || null; }
  function storeDemandes() {
    try { var s = window.__ADMINA_STORE__; if (s && s.demandes && s.demandes.length) return s.demandes; } catch (e) {}
    return [];
  }
  function demandeForPoste(poste) {
    var p = norm(poste);
    if (!p) return null;
    var ds = storeDemandes();
    var ex = ds.filter(function (d) { return norm(d.poste) === p; });
    if (ex.length) return ex[0];
    var ct = ds.filter(function (d) { var dp = norm(d.poste); return dp && (dp.indexOf(p) > -1 || p.indexOf(dp) > -1); });
    return ct.length ? ct[0] : null;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.candidats) { try { d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e2) { d = null; } }
    if (!d || !d.candidats || !d.candidats.length) return [];
    return d.candidats.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.score = Number(u.score) || 0;
      u.anneesExp = Number(u.anneesExp) || 0;
      u.nomComplet = (u.prenom || '') + ' ' + (u.nom || '');
      u.age = ageFrom(u.dateNaissance);
      u.anciennete = daysSince(u.dateCandidature);
      u.sm = statutMeta(u.statut);
      u.dm = demandeForPoste(u.posteVise);
      return u;
    });
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) { var m2 = /^CAN-(\d+)$/.exec(String(r.id || '')); return Math.max(m, m2 ? Number(m2[1]) : 0); }, 0) + 1;
    return 'CAN-' + String(mx).padStart(3, '0');
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.candidats) { toast('Écriture impossible — recharger la page', 'err'); return false; }
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
    var nb = rows.length;
    var noScore = rows.filter(function (r) { return (r.statut === 'Entretien realise' || r.statut === 'Retenu') && r.score <= 0; });
    if (noScore.length) out.push({ tone: 'err', txt: noScore.length + ' évaluation' + (noScore.length > 1 ? 's' : '') + ' manquante' + (noScore.length > 1 ? 's' : '') + ' — ' + noScore.slice(0, 2).map(function (r) { return r.id + ' ' + r.nomComplet; }).join(', ') + '…', f: 'noscore' });
    var old = rows.filter(function (r) { return pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4 && r.anciennete > SEUILS.delaiReponse; });
    if (old.length) {
      var worst = old.slice().sort(function (a, b) { return b.anciennete - a.anciennete; })[0];
      out.push({ tone: 'warn', txt: old.length + ' candidature' + (old.length > 1 ? 's' : '') + ' active' + (old.length > 1 ? 's' : '') + ' sans réponse depuis plus de ' + SEUILS.delaiReponse + ' j — le plus ancien : ' + worst.nomComplet + ' (' + worst.anciennete + ' j)', f: 'old' });
    }
    var seen = {}, dups = [];
    rows.forEach(function (r) { var e = norm(r.email); if (e) { if (seen[e]) dups.push(r); else seen[e] = 1; } });
    if (dups.length) out.push({ tone: 'warn', txt: dups.length + ' doublon' + (dups.length > 1 ? 's' : '') + ' d\u2019email détecté' + (dups.length > 1 ? 's' : '') + ' — vérifier les candidatures (' + dups.slice(0, 2).map(function (r) { return r.id; }).join(', ') + ')', f: 'dup' });
    var nodemand = rows.filter(function (r) { return pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4 && !r.dm; });
    if (nodemand.length && storeDemandes().length) out.push({ tone: 'info', txt: nodemand.length + ' candidat' + (nodemand.length > 1 ? 's' : '') + ' actif' + (nodemand.length > 1 ? 's' : '') + ' sur un poste sans demande ouverte (' + nodemand.slice(0, 2).map(function (r) { return r.posteVise; }).join(', ') + '…)', f: 'nodemand' });
    var talents = rows.filter(function (r) { return r.score >= SEUILS.scoreTalent; });
    if (talents.length) out.push({ tone: 'ok', txt: talents.length + ' profil' + (talents.length > 1 ? 's' : '') + ' avec score ≥ ' + SEUILS.scoreTalent + '/20 — vivier de talents à préserver (' + talents.slice(0, 2).map(function (r) { return r.nomComplet; }).join(', ') + ')', f: 'talent' });
    var bySrc = {};
    rows.forEach(function (r) { var s = r.sourceCandidature || '—'; bySrc[s] = (bySrc[s] || 0) + 1; });
    var topSrc = null;
    Object.keys(bySrc).forEach(function (s) { if (!topSrc || bySrc[s] > bySrc[topSrc]) topSrc = s; });
    if (topSrc && nb > 0 && bySrc[topSrc] / nb * 100 > SEUILS.partSource) out.push({ tone: 'info', txt: 'Source dominante : ' + topSrc + ' — ' + bySrc[topSrc] + ' candidatures (' + pct(bySrc[topSrc] / nb * 100) + ' du total)', f: 'src' });
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.statut === '__pipe') { if (!(pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4)) return false; }
      else if (UI.statut && r.statut !== UI.statut) return false;
      if (UI.source && norm(r.sourceCandidature) !== norm(UI.source)) return false;
      if (UI.niv && norm(r.niveauEtude) !== norm(UI.niv)) return false;
      if (UI.score === 't15' && !(r.score >= SEUILS.scoreTalent)) return false;
      if (UI.score === 't12' && !(r.score >= 12)) return false;
      if (UI.score === 'none' && r.score > 0) return false;
      if (UI.age === 'd30' && !(r.anciennete > 30 && pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4)) return false;
      if (UI.age === 'd60' && !(r.anciennete > 60 && pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4)) return false;
      if (UI.kpi === 'pipe' && !(pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4)) return false;
      if (UI.kpi === 'ret' && r.statut !== 'Retenu') return false;
      if (UI.kpi === 'tal' && !(r.score >= SEUILS.scoreTalent)) return false;
      if (q && !(norm(r.nomComplet).indexOf(q) > -1 || norm(r.id).indexOf(q) > -1 || norm(r.email).indexOf(q) > -1 || norm(r.posteVise).indexOf(q) > -1 || norm(r.telephone).indexOf(q) > -1 || norm(r.competencesCles).indexOf(q) > -1 || norm(r.ville).indexOf(q) > -1 || norm(r.diplome).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'score') { va = a.score; vb = b.score; }
      else if (k === 'exp') { va = a.anneesExp; vb = b.anneesExp; }
      else if (k === 'anci') { va = a.anciennete; vb = b.anciennete; }
      else if (k === 'date') { va = dateKey(a.dateCandidature); vb = dateKey(b.dateCandidature); }
      else if (k === 'statut') { va = pipeIdx(a.statut) < 0 ? 99 : pipeIdx(a.statut); vb = pipeIdx(b.statut) < 0 ? 99 : pipeIdx(b.statut); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.source ? 1 : 0) + (UI.niv ? 1 : 0) + (UI.score ? 1 : 0) + (UI.age ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.source = ''; UI.niv = ''; UI.score = ''; UI.age = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Base\s+de\s+Donn[ée]es\s+Candidats/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-abc="root"]');
    if (!root) {
      root = h('section', { 'data-abc': 'root', class: 'abc-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-abc-page')) {
      page.setAttribute('data-abc-page', '1');
      page.setAttribute('data-abc-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-abc-hide')) {
      natif.setAttribute('data-abc-hide', '1');
      natif.setAttribute('data-abc-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-abc="root"]'); if (root) root.remove();
    $$('[data-abc-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-abc-oldw') || '';
      n.removeAttribute('data-abc-page');
      n.removeAttribute('data-abc-oldw');
    });
    $$('[data-abc-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-abc-olddisp') || '';
      n.removeAttribute('data-abc-hide');
      n.removeAttribute('data-abc-olddisp');
    });
    $$('[data-abc]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-abc="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'abc-btn abc-btn-primary abc-backbtn', 'data-abc': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'base-candidats');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pipe: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>',
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
  var USER_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>';

  function buildShell() {
    var root = $('[data-abc="root"]');
    if (!root || $('[data-abc="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="abc-hero" data-abc="hero">' +
        '<div class="abc-hero-main">' +
          '<div class="abc-hero-title">' +
            '<span class="abc-hero-ico" aria-hidden="true">' + USER_ICON + '</span>' +
            '<div><h2 class="abc-h2">Centre de pilotage — Base de Données Candidats</h2>' +
            '<p class="abc-hero-sub" data-abc="herosub"></p></div>' +
          '</div>' +
          '<div class="abc-hero-actions">' +
            '<button class="abc-btn" data-abc="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="abc-btn" data-abc="btn-pipe" title="Pipeline & flux (P)">' + ICO.pipe + 'Pipeline</button>' +
            '<button class="abc-btn" data-abc="btn-cmp" title="Comparer des candidats (C)">' + ICO.cmp + 'Comparer <span class="abc-nc-badge" data-abc="cmp-badge"></span></button>' +
            '<button class="abc-btn" data-abc="btn-seuils" title="Seuils de pilotage">' + ICO.seuils + 'Seuils</button>' +
            '<button class="abc-btn" data-abc="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="abc-btn" data-abc="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="abc-btn abc-btn-primary" data-abc="btn-new" title="Nouveau candidat (N)">' + ICO.plus + 'Nouveau candidat</button>' +
          '</div>' +
        '</div>' +
        '<div class="abc-hero-alerts" data-abc="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="abc-kpis" data-abc="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="abc-charts" data-abc="charts">' +
        '<div class="abc-chart-card"><div class="abc-chart-title">Pipeline par statut</div><div class="abc-donut-wrap" data-abc="donut"></div></div>' +
        '<div class="abc-chart-card"><div class="abc-chart-title" data-abc="bars-title">Candidats par poste visé</div><div class="abc-bars" data-abc="bars"></div></div>' +
        '<div class="abc-chart-card"><div class="abc-chart-title">Candidats par source</div><div class="abc-bars" data-abc="sources"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="abc-toolbar" data-abc="toolbar">' +
        '<div class="abc-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (nom, email, poste, compétences…)" data-abc="search" aria-label="Rechercher un candidat" /></div>' +
        '<select data-abc="f-statut" class="abc-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-abc="f-source" class="abc-sel" aria-label="Filtrer par source de candidature"></select>' +
        '<select data-abc="f-niv" class="abc-sel" aria-label="Filtrer par niveau d\u2019étude"></select>' +
        '<select data-abc="f-score" class="abc-sel" aria-label="Filtrer par score"></select>' +
        '<select data-abc="f-age" class="abc-sel" aria-label="Filtrer par ancienneté"></select>' +
        '<button class="abc-chipbtn" data-abc="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="abc-count" data-abc="count"></span>' +
        '<div class="abc-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="abc-vbtn" data-abc="v-table" title="Vue tableau">' + ICO.tbl + 'Tableau</button>' +
          '<button class="abc-vbtn" data-abc="v-cards" title="Vue cartes">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-abc="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-abc="selbar"></div>' +

      /* PIED */
      '<div class="abc-foot">Source de vérité locale (navigateur) — conforme Manuel D1 (base candidats & recrutement) · journal d\u2019audit actif · seuils configurables · <button class="abc-link" data-abc="btn-native">Afficher le tableau natif</button></div>';

    $('[data-abc="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-abc="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-abc="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'base-candidats'); window.print(); });
    $('[data-abc="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-abc="btn-pipe"]', root).addEventListener('click', openPipeline);
    $('[data-abc="btn-cmp"]', root).addEventListener('click', openCompare);
    $('[data-abc="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-abc="btn-native"]', root).addEventListener('click', showNative);
    $('[data-abc="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-abc="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-abc="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-abc="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-abc="f-source"]', root).addEventListener('change', function (e) { UI.source = e.target.value; UI.page = 0; refresh(); });
    $('[data-abc="f-niv"]', root).addEventListener('change', function (e) { UI.niv = e.target.value; UI.page = 0; refresh(); });
    $('[data-abc="f-score"]', root).addEventListener('change', function (e) { UI.score = e.target.value; UI.page = 0; refresh(); });
    $('[data-abc="f-age"]', root).addEventListener('change', function (e) { UI.age = e.target.value; UI.page = 0; refresh(); });
    $('[data-abc="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-abc="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var nbPipe = rows.filter(function (r) { return pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4; }).length;
    var nbRet = rows.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var evals = rows.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length) : 0;
    var sub = rows.length + ' candidat' + (rows.length > 1 ? 's' : '') +
      ' · pipeline ' + nbPipe + ' actif' + (nbPipe > 1 ? 's' : '') +
      ' · ' + nbRet + ' retenu' + (nbRet > 1 ? 's' : '') + ' (' + pct(rows.length ? nbRet / rows.length * 100 : 0) + ')' +
      ' · score moyen ' + (evals.length ? moy.toFixed(1) : '—') + '/20';
    $('[data-abc="herosub"]').textContent = sub;
    var zone = $('[data-abc="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="abc-alert ' + a.tone + '" data-abc="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.abc-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'noscore') UI.score = 'none';
        else if (f === 'old') UI.age = 'd30';
        else if (f === 'dup') { /* les doublons n'ont pas de filtre dédié : on affiche tout */ }
        else if (f === 'nodemand') { UI.statut = '__pipe'; }
        else if (f === 'talent') UI.kpi = 'tal';
        else if (f === 'src') { UI.kpi = ''; UI.statut = ''; UI.source = ''; }
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var nbPipe = rows.filter(function (r) { return pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4; }).length;
    var nbRet = rows.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var evals = rows.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length : 0;
    var nbTal = rows.filter(function (r) { return r.score >= SEUILS.scoreTalent; }).length;
    var expMoy = nb ? (rows.reduce(function (s, r) { return s + (Number(r.anneesExp) || 0); }, 0) / nb) : 0;
    var villes = {}; var postes = {};
    rows.forEach(function (r) { if (r.ville) villes[r.ville] = 1; if (r.posteVise) postes[r.posteVise] = 1; });
    var kpis = [
      { k: '', t: 'CANDIDATS', v: String(nb), s: Object.keys(villes).length + ' villes · ' + Object.keys(postes).length + ' postes visés', cls: '' },
      { k: 'pipe', t: 'PIPELINE ACTIF', v: String(nbPipe), s: 'Nouveau → Entretien réalisé', cls: '' },
      { k: 'ret', t: 'RETENUS', v: String(nbRet), s: 'taux de sélection ' + pct(nb ? nbRet / nb * 100 : 0), cls: nbRet === 0 ? 'bad' : '' },
      { k: '', t: 'SCORE MOYEN', v: (evals.length ? moy.toFixed(1) : '—') + '/20', s: 'sur ' + evals.length + ' évalué' + (evals.length > 1 ? 's' : ''), cls: '' },
      { k: 'tal', t: 'TALENTS ≥' + SEUILS.scoreTalent, v: String(nbTal), s: 'score seuil ' + SEUILS.scoreTalent + '/20', cls: '' },
      { k: '', t: 'EXP. MOYENNE', v: expMoy.toFixed(1) + ' ans', s: 'toutes candidatures', cls: '' }
    ];
    var zone = $('[data-abc="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="abc-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="abc-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="abc-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="abc-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.abc-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.source = ''; UI.niv = ''; UI.score = ''; UI.age = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Pipeline par statut">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">candidats</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-abc="donut"]');
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="abc-donut-legend">' + parts.map(function (p) {
        return '<span class="abc-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="abc-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="abc-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.abc-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.statut = UI.statut === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) return '<div class="abc-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="abc-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="abc-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="abc-bar-track"><span class="abc-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="abc-bar-val">' + it.v + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-abc="bars"]');
    var map = {};
    rows.forEach(function (r) { var p = r.posteVise || '—'; if (!map[p]) map[p] = { key: p, name: p, v: 0 }; map[p].v++; });
    var items = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items);
    $$('.abc-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        resetFilters();
        UI.q = k;
        var si = $('[data-abc="search"]');
        if (si) si.value = k;
        refresh();
      });
    });
    var z2 = $('[data-abc="sources"]');
    var map2 = {};
    rows.forEach(function (r) { var s = r.sourceCandidature || '—'; if (!map2[s]) map2[s] = { key: s, name: s, v: 0 }; map2[s].v++; });
    var items2 = Object.keys(map2).map(function (k) { return map2[k]; }).sort(function (a, b) { return b.v - a.v; });
    z2.innerHTML = barRowsHtml(items2);
    $$('.abc-bar-row', z2).forEach(function (b) {
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
    var srcs = {};
    rows.forEach(function (r) { if (r.sourceCandidature) srcs[r.sourceCandidature] = 1; });
    var sel = $('[data-abc="f-statut"]');
    sel.innerHTML = '<option value="">Statut : tous</option>' +
      '<option value="__pipe"' + (UI.statut === '__pipe' ? ' selected' : '') + '>Pipeline actif</option>' +
      STATUTS.map(function (s) {
        return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
      }).join('');
    var sel2 = $('[data-abc="f-source"]');
    sel2.innerHTML = '<option value="">Source : toutes</option>' + Object.keys(srcs).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.source === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-abc="f-niv"]');
    sel3.innerHTML = '<option value="">Niveau : tous</option>' + NIVEAUX.map(function (n) {
      return '<option value="' + esc(n) + '"' + (UI.niv === n ? ' selected' : '') + '>' + esc(n) + '</option>';
    }).join('');
    var sel4 = $('[data-abc="f-score"]');
    sel4.innerHTML = '<option value="">Score : tous</option>' +
      '<option value="t15"' + (UI.score === 't15' ? ' selected' : '') + '>\u2265 ' + SEUILS.scoreTalent + ' /20</option>' +
      '<option value="t12"' + (UI.score === 't12' ? ' selected' : '') + '>\u2265 12 /20</option>' +
      '<option value="none"' + (UI.score === 'none' ? ' selected' : '') + '>Non évalués</option>';
    var sel5 = $('[data-abc="f-age"]');
    sel5.innerHTML = '<option value="">Ancienneté : toutes</option>' +
      '<option value="d30"' + (UI.age === 'd30' ? ' selected' : '') + '>Actives &gt; 30 j</option>' +
      '<option value="d60"' + (UI.age === 'd60' ? ' selected' : '') + '>Actives &gt; 60 j</option>';
    $('[data-abc="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-abc="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' candidats';
  }

  function statutChip(r) {
    var sm = r.sm || statutMeta(r.statut);
    return '<span class="abc-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }

  function scoreCell(r) {
    if (r.score <= 0) return '<span class="abc-score zero" title="Non évalué">—</span>';
    var cls = r.score >= SEUILS.scoreTalent ? ' hi' : ' mid';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="abc-score' + cls + '">' + r.score + '</span>' +
      '<span class="abc-scorebar" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(r.score / 20 * 100)) + '%"></i></span></span>';
  }

  function anciCell(r) {
    if (pipeIdx(r.statut) < 0 || pipeIdx(r.statut) >= 4) return '<span class="abc-anci">' + r.anciennete + ' j</span>';
    var cls = r.anciennete > 60 ? ' err' : r.anciennete > SEUILS.delaiReponse ? ' warn' : '';
    return '<span class="abc-anci' + cls + '">' + r.anciennete + ' j</span>';
  }

  function dmChip(r) {
    if (!r.dm) return '<span class="abc-chip neutral" title="Aucune demande ouverte pour ce poste">—</span>';
    var ok = norm(r.dm.poste) === norm(r.posteVise);
    return '<span class="abc-chip ' + (ok ? 'ok' : 'warn') + '" title="' + esc('Demande ' + r.dm.numero + ' · ' + r.dm.statut + ' · ' + (r.dm.departement || '—')) + '">' + esc(r.dm.numero) + (ok ? '' : ' ⚠') + '</span>';
  }

  function chips(s) {
    return String(s || '').split('/').map(function (x) { x = x.trim(); return x ? '<span class="abc-chip neutral">' + esc(x) + '</span>' : ''; }).join(' ');
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var nbRet = all.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var evals = all.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length).toFixed(1) : '—';
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      return '<th ' + (key ? 'data-sort="' + key + '"' : '') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="abc-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'abc-th-chk') + th('N°', 'numero') + th('Candidat', 'nom') + th('Poste visé', 'poste') + th('Demande', null) +
      th('Source', 'source') + th('Statut', 'statut') + th('Score', 'score') + th('Niveau', 'niv') + th('Exp.', 'exp', 'abc-right') +
      th('Ville', 'ville') + th('Candidature', 'date') + th('Attente', 'anci') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="abc-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.nomComplet) + '"></td>' +
        '<td class="abc-num">' + esc(r.id) + '</td>' +
        '<td><span class="abc-poste" data-open="' + esc(r.id) + '">' + esc(r.nomComplet) + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.posteVise || '—') + '</td>' +
        '<td>' + dmChip(r) + '</td>' +
        '<td>' + (r.sourceCandidature ? '<span class="abc-chip neutral">' + esc(r.sourceCandidature) + '</span>' : '—') + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td>' + scoreCell(r) + '</td>' +
        '<td>' + esc(r.niveauEtude || '—') + '</td>' +
        '<td class="abc-right">' + (r.anneesExp || '0') + '</td>' +
        '<td>' + esc(r.ville || '—') + '</td>' +
        '<td class="abc-num">' + esc(jDate(r.dateCandidature) || '—') + '</td>' +
        '<td>' + anciCell(r) + '</td>' +
        '<td><div class="abc-actions">' +
          '<button class="abc-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="abc-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="abc-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="abc-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="abc-tfoot"><td></td><td colspan="13">TOTAL ' + all.length + ' candidats · ' + nbRet + ' retenu(s) · score moyen ' + moy + '/20</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="abc-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="abc-sel" data-abc="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="abc-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="abc-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-abc="content"]');
    card.innerHTML = '<div class="abc-tblcard"><div class="abc-tblwrap"><table class="abc-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="14"><div class="abc-empty">Aucun candidat ne correspond aux filtres</div></td></tr>') +
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
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 candidats', 'err'); c.checked = false; return; } UI.cmp.push(id); }
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
    var perSel = $('[data-abc="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var card = $('[data-abc="content"]');
    card.innerHTML = rows.length ? '<div class="abc-cards">' + rows.map(function (r) {
      var sm = r.sm;
      return '<div class="abc-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="abc-card-top"><div><input type="checkbox" class="abc-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="abc-num">' + esc(r.id) + '</span></div>' +
        statutChip(r) + '</div>' +
        '<div class="abc-card-name" data-open="' + esc(r.id) + '">' + esc(r.nomComplet) + '</div>' +
        '<div class="abc-card-total" style="font-size:.95rem">' + esc(r.posteVise || '—') + '</div>' +
        '<div class="abc-card-struct"><span>' + scoreCell(r) + '<span style="color:var(--abc-text2);font-size:.74rem;font-weight:600">Exp. ' + (r.anneesExp || 0) + ' an(s) · ' + esc(r.niveauEtude || '—') + '</span></span></div>' +
        '<div class="abc-card-meta">' + dmChip(r) + (r.sourceCandidature ? '<span class="abc-chip neutral">' + esc(r.sourceCandidature) + '</span>' : '') +
        (r.ville ? '<span class="abc-chip info">' + esc(r.ville) + '</span>' : '') + '</div>' +
        '<div class="abc-card-foot"><span class="abc-num">' + esc(jDate(r.dateCandidature) || '—') + ' · ' + r.anciennete + ' j</span>' +
        '<div class="abc-card-act">' +
          '<button class="abc-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="abc-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="abc-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="abc-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="abc-empty">Aucun candidat ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Comparaison limitée à 4 candidats', 'err'); c.checked = false; return; } UI.cmp.push(id); }
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
    var badge = $('[data-abc="cmp-badge"]');
    if (badge) { badge.textContent = UI.cmp.length ? String(UI.cmp.length) : ''; badge.style.display = UI.cmp.length ? '' : 'none'; }
    var zone = $('[data-abc="selbar"]');
    if (!UI.cmp.length) { zone.innerHTML = ''; return; }
    var rows = UI.cmp.map(function (id) { return rowById(id); }).filter(Boolean);
    var evals = rows.filter(function (r) { return r.score > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.score; }, 0) / evals.length).toFixed(1) : '—';
    zone.innerHTML = '<div class="abc-selbar">' +
      '<span class="abc-selbar-info">' + rows.length + ' sélectionné' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="abc-selbar-sub">score moyen ' + moy + '/20</span>' +
      '<button class="abc-btn abc-btn-ghost" data-sel="cmp" ' + (rows.length < 2 ? 'disabled' : '') + '>Comparer</button>' +
      '<button class="abc-btn abc-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="abc-btn abc-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="abc-btn abc-btn-ghost" data-sel="clear">Annuler</button></div>';
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
  function closeDrawer() { $$('[data-abc="drawer"],[data-abc="backdrop"][data-abc-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var sm = r.sm;
    var comps = chips(r.competencesCles);
    var langs = chips(r.langues);
    var outils = chips(r.outilsLogiciels);
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var dmd = r.dm;
    var demandBlock = !dmd
      ? '<dl class="abc-kv">' + kv('Liaison', 'Aucune demande ouverte pour ce poste') + '</dl>' +
        (storeDemandes().length ? '<a class="abc-btn abc-btn-ghost" style="text-decoration:none" href="/Domaine1_Recrutement_Candidats/demandes">Ouvrir les demandes →</a>' : '')
      : '<dl class="abc-kv">' +
        kv('Demande', esc(dmd.numero) + (norm(dmd.poste) === norm(r.posteVise) ? ' <span class="abc-chip ok">conforme</span>' : ' <span class="abc-chip warn">poste incohérent</span>')) +
        kv('Statut demande', esc(dmd.statut || '—')) +
        kv('Priorité', esc(dmd.priorite || '—')) +
        kv('Manager', esc(dmd.manager || '—')) +
        kv('Site', esc(dmd.site || '—')) +
        '</dl>' +
        '<a class="abc-btn abc-btn-ghost" style="text-decoration:none" href="/Domaine1_Recrutement_Candidats/demandes">Ouvrir les demandes →</a>';
    var dr = h('aside', { class: 'abc-drawer', 'data-abc': 'drawer', role: 'dialog', 'aria-label': 'Fiche ' + r.nomComplet });
    dr.innerHTML =
      '<div class="abc-drawer-head"><div><div class="abc-drawer-title">' + esc(r.nomComplet) + '</div>' +
      '<div class="abc-drawer-sub">' + esc(r.id) + ' · ' + esc(r.posteVise || '—') + ' · ' + esc(r.ville || '—') + '</div></div>' +
      '<button class="abc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="abc-drawer-body">' +
        '<div class="abc-live" style="margin-top:0"><span>Statut <b style="color:' + sm.c + '">' + esc(sm.lab) + '</b></span>' +
          '<span>Score <b>' + (r.score > 0 ? r.score + '/20' : '—') + '</b></span>' +
          '<span>Attente <b>' + r.anciennete + ' j</b></span>' +
          '<span>Âge <b>' + (r.age ? r.age + ' ans' : '—') + '</b></span></div>' +
        '<div class="abc-fsec">Candidature & statut</div>' +
        '<div class="abc-sim-row" style="margin-bottom:10px"><label for="abc-stsel">Changer le statut</label>' +
          '<select id="abc-stsel" class="abc-in" data-abc="stsel">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<dl class="abc-kv">' +
          kv('Poste visé', esc(r.posteVise || '—')) +
          kv('Source', esc(r.sourceCandidature || '—')) +
          kv('Date candidature', esc(jDate(r.dateCandidature) || '—')) +
          kv('Type de contrat', esc(r.typeContrat || '—')) +
        '</dl>' +
        '<div class="abc-fsec">Demande de recrutement liée</div>' + demandBlock +
        '<div class="abc-fsec">Formation & compétences</div>' +
        '<dl class="abc-kv">' +
          kv('Niveau étude', esc(r.niveauEtude || '—')) +
          kv('Diplôme', esc(r.diplome || '—')) +
          kv('Établissement', esc(r.etablissement || '—')) +
          kv('Années d\u2019expérience', String(r.anneesExp || 0)) +
          kv('Dernier employeur', esc(r.dernierEmployeur || '—')) +
          kv('Niveau langue', esc(r.niveauLangue || '—')) +
        '</dl>' +
        (comps ? '<div style="margin:2px 0 6px"><span class="abc-fsec" style="display:block;margin-bottom:4px">Compétences clés</span>' + comps + '</div>' : '') +
        (langs ? '<div style="margin:2px 0 6px"><span class="abc-fsec" style="display:block;margin-bottom:4px">Langues</span>' + langs + '</div>' : '') +
        (outils ? '<div style="margin:2px 0 6px"><span class="abc-fsec" style="display:block;margin-bottom:4px">Outils / logiciels</span>' + outils + '</div>' : '') +
        '<div class="abc-fsec">Informations personnelles</div>' +
        '<dl class="abc-kv">' +
          kv('Civilité · Genre', esc((r.civilite || '—') + ' · ' + (r.genre || '—'))) +
          kv('Date de naissance', esc(jDate(r.dateNaissance) || '—') + (r.age ? ' (' + r.age + ' ans)' : '')) +
          kv('Nationalité', esc(r.nationalite || '—')) +
          kv('Situation familiale', esc(r.situationFam || '—')) +
          kv('Téléphone', esc(r.telephone || '—')) +
          kv('Email', esc(r.email || '—')) +
          kv('Adresse', esc((r.adresse || '—') + (r.ville ? ', ' + r.ville : ''))) +
        '</dl>' +
        '<div class="abc-fsec">Documents & contrat</div>' +
        '<dl class="abc-kv">' +
          kv('Contrat', esc(r.contratTelechargeable || 'Non fourni')) +
          kv('Début d\u2019essai', esc(jDate(r.dateDebutEssai) || '—')) +
          kv('Fin d\u2019essai', esc(jDate(r.dateFinEssai) || '—')) +
          kv('Embauche définitive', esc(jDate(r.dateEmbaucheDefinitive) || '—')) +
          kv('Documents', (r.certificatTravail ? '<span class="abc-chip ok">Certificat de travail ✓</span> ' : '') + (r.attestationCNPS ? '<span class="abc-chip ok">Attestation CNPS ✓</span> ' : '') + (r.extraitCasierJudiciaire ? '<span class="abc-chip ok">Casier judiciaire ✓</span>' : (!r.certificatTravail && !r.attestationCNPS && !r.extraitCasierJudiciaire ? '—' : ''))) +
        '</dl>' +
        '<div class="abc-fsec">Notes</div>' +
        '<textarea class="abc-notebox" data-abc="note" placeholder="Notes internes (entretiens, impressions…)">' + esc(r.notes || '') + '</textarea>' +
        '<div class="abc-drawer-actions">' +
          '<button class="abc-btn abc-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="abc-btn abc-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="abc-btn abc-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="abc-btn abc-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.abc-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-abc="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statut) return;
      mutate(function (cur) {
        cur.candidats = cur.candidats.map(function (x) { if (String(x.id) === String(id)) x.statut = nv; return x; });
        return cur;
      }, 'Statut modifié', r.id + ' → ' + statutMeta(nv).lab);
      toast('Statut : ' + statutMeta(nv).lab, 'ok');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-abc="note"]', dr).value;
      mutate(function (cur) {
        cur.candidats = cur.candidats.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.id);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', r.id);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-abc="dialog"],[data-abc="backdrop"][data-abc-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'abc-dialog', 'data-abc': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier un candidat' : 'Nouveau candidat' });
    function opts(list, cur, labFn) {
      return '<option value=""></option>' + list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = labFn ? labFn(x) : (typeof x === 'object' ? x.lab : x);
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    dlg.innerHTML =
      '<div class="abc-dialog-head"><h3>' + (r ? 'Modifier le candidat ' + esc(r.id) : 'Nouveau candidat') + '</h3>' +
      '<button class="abc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="abc-dialog-body">' +
        '<div class="abc-fgrid">' +
          '<label class="abc-lab">Civilité<select class="abc-in" data-f="civilite">' + opts(CIVILITES, v('civilite')) + '</select></label>' +
          '<label class="abc-lab">Nom *<input class="abc-in" data-f="nom" value="' + esc(v('nom')) + '" placeholder="Ex. Ndiaye"></label>' +
          '<label class="abc-lab">Prénom *<input class="abc-in" data-f="prenom" value="' + esc(v('prenom')) + '" placeholder="Ex. Moussa"></label>' +
          '<label class="abc-lab">Téléphone *<input class="abc-in" data-f="telephone" value="' + esc(v('telephone')) + '" placeholder="+237 6…"></label>' +
          '<label class="abc-lab">Email<input class="abc-in" type="email" data-f="email" value="' + esc(v('email')) + '" placeholder="nom@email.com"></label>' +
          '<label class="abc-lab">Ville<input class="abc-in" data-f="ville" value="' + esc(v('ville')) + '" placeholder="Ex. Yaoundé"></label>' +
          '<label class="abc-lab">Niveau d\u2019étude<select class="abc-in" data-f="niveauEtude">' + opts(NIVEAUX, v('niveauEtude')) + '</select></label>' +
          '<label class="abc-lab">Diplôme<input class="abc-in" data-f="diplome" value="' + esc(v('diplome')) + '" placeholder="Ex. Master Info"></label>' +
          '<label class="abc-lab">Établissement<input class="abc-in" data-f="etablissement" value="' + esc(v('etablissement')) + '"></label>' +
          '<label class="abc-lab">Années d\u2019expérience<input class="abc-in" type="number" min="0" step="1" data-f="anneesExp" value="' + esc(v('anneesExp') || '0') + '"></label>' +
          '<label class="abc-lab">Dernier employeur<input class="abc-in" data-f="dernierEmployeur" value="' + esc(v('dernierEmployeur')) + '"></label>' +
          '<label class="abc-lab">Poste visé *<input class="abc-in" data-f="posteVise" value="' + esc(v('posteVise')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="abc-lab">Source de candidature<select class="abc-in" data-f="sourceCandidature">' + opts(SOURCES, v('sourceCandidature')) + '</select></label>' +
          '<label class="abc-lab">Statut<select class="abc-in" data-f="statut">' + opts(STATUTS, v('statut'), function (x) { return x.lab; }) + '</select></label>' +
          '<label class="abc-lab">Score /20<input class="abc-in" type="number" min="0" max="20" step="0.5" data-f="score" value="' + esc(v('score') || '0') + '"></label>' +
          '<label class="abc-lab">Type de contrat<select class="abc-in" data-f="typeContrat">' + opts(CONTRATS, v('typeContrat')) + '</select></label>' +
          '<label class="abc-lab">Date de candidature<input class="abc-in" data-f="dateCandidature" value="' + esc(jDate(v('dateCandidature'))) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="abc-lab full">Compétences clés (séparées par /)<input class="abc-in" data-f="competencesCles" value="' + esc(v('competencesCles')) + '" placeholder="Ex. Gastronomie/Management/HACCP"></label>' +
          '<label class="abc-lab full">Notes<textarea class="abc-in abc-ta" data-f="notes" placeholder="Impressions d\u2019entretien, précisions…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        '<div class="abc-live" data-abc="dlg-live"></div>' +
        '<div data-abc="dlg-err"></div>' +
      '</div>' +
      '<div class="abc-dialog-foot"><span class="abc-form-hint">ISO 30401 · candidature conforme Manuel D1 · le score alimente le vivier de talents</span>' +
      '<span style="display:flex;gap:8px"><button class="abc-btn abc-btn-ghost" data-act="cancel" style="color:var(--abc-text);border-color:var(--abc-line)">Annuler</button>' +
      '<button class="abc-btn abc-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer le candidat') + '</button></span></div>';
    $('.abc-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var sc = Number(val.score) || 0;
      var anc = daysSince(val.dateCandidature);
      var em = String(val.email || '').trim();
      var emOk = !em || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em);
      var samePoste = rows.filter(function (x) { return norm(x.posteVise) === norm(val.posteVise) && (!editId || String(x.id) !== String(editId)); }).length;
      $('[data-abc="dlg-live"]', dlg).innerHTML =
        '<span>Score <b class="' + (sc >= SEUILS.scoreTalent ? 'good' : sc > 0 ? '' : 'bad') + '">' + (sc > 0 ? sc + '/20' : 'non évalué') + '</b></span>' +
        '<span>Statut <b>' + esc(val.statut ? statutMeta(val.statut).lab : '—') + '</b></span>' +
        '<span>Ancienneté <b>' + (anc ? anc + ' j' : '—') + '</b></span>' +
        (samePoste ? '<span><b>' + samePoste + '</b> autre(s) candidat(s) sur ce poste</span>' : '') +
        (!emOk ? '<span class="bad">⚠ Email invalide</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-abc="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="abc-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.nom || '').trim()) return fail('Le nom est obligatoire.');
      if (!String(val.prenom || '').trim()) return fail('Le prénom est obligatoire.');
      if (!String(val.posteVise || '').trim()) return fail('Le poste visé est obligatoire.');
      if (!String(val.telephone || '').trim()) return fail('Le téléphone est obligatoire.');
      var em = String(val.email || '').trim();
      if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return fail('Adresse email invalide.');
      var sc = Number(val.score) || 0;
      if (sc < 0 || sc > 20) return fail('Le score doit être compris entre 0 et 20.');
      var N2 = function (x) { var k2 = Number(x); return isFinite(k2) ? Math.max(0, k2) : 0; };
      var rec = {
        civilite: String(val.civilite || '').trim(),
        genre: String(val.civilite || '').trim() === 'Mme' ? 'Feminin' : 'Masculin',
        nom: String(val.nom).trim(),
        prenom: String(val.prenom).trim(),
        telephone: String(val.telephone).trim(),
        email: em,
        ville: String(val.ville || '').trim(),
        niveauEtude: String(val.niveauEtude || '').trim(),
        diplome: String(val.diplome || '').trim(),
        etablissement: String(val.etablissement || '').trim(),
        anneesExp: N2(val.anneesExp),
        dernierEmployeur: String(val.dernierEmployeur || '').trim(),
        posteVise: String(val.posteVise).trim(),
        sourceCandidature: String(val.sourceCandidature || '').trim(),
        statut: String(val.statut || '').trim() || 'Nouveau',
        score: sc,
        typeContrat: String(val.typeContrat || '').trim(),
        dateCandidature: String(val.dateCandidature || '').trim(),
        competencesCles: String(val.competencesCles || '').trim(),
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.candidats = cur.candidats.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Candidat modifié', rec.prenom + ' ' + rec.nom);
        toast('Candidat mis à jour', 'ok');
      } else {
        mutate(function (cur) {
          var id = cur.candidats.reduce(function (m, x) { var m2 = /^CAN-(\d+)$/.exec(String(x.id || '')); return Math.max(m, m2 ? Number(m2[1]) : 0); }, 0) + 1;
          var cp = {
            id: 'CAN-' + String(id).padStart(3, '0'),
            dateNaissance: '', nationalite: 'Camerounaise', situationFam: '', adresse: '',
            langues: '', niveauLangue: '', outilsLogiciels: '',
            contratTelechargeable: '', dateDebutEssai: '', dateFinEssai: '', dateEmbaucheDefinitive: '',
            certificatTravail: false, attestationCNPS: false, extraitCasierJudiciaire: false
          };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.candidats = cur.candidats.concat([cp]);
          return cur;
        }, 'Candidat créé', rec.prenom + ' ' + rec.nom);
        toast('Candidat créé — ' + rec.prenom + ' ' + rec.nom, 'ok');
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
      var mx = cur.candidats.reduce(function (m, x) { var m2 = /^CAN-(\d+)$/.exec(String(x.id || '')); return Math.max(m, m2 ? Number(m2[1]) : 0); }, 0) + 1;
      var cp = {};
      for (var k in r) if (['nomComplet', 'age', 'anciennete', 'sm', 'dm'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = 'CAN-' + String(mx).padStart(3, '0');
      cp.prenom = String(r.prenom || '');
      cp.notes = r.notes || '';
      cp.statut = 'Nouveau';
      cp.score = 0;
      cur.candidats = cur.candidats.concat([cp]);
      return cur;
    }, 'Candidat dupliqué', r.id);
    toast('Candidat dupliqué (statut réinitialisé)', 'ok');
  }
  function closeConfirm() { $$('[data-abc="confirm"],[data-abc="backdrop"][data-abc-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'abc-confirm', 'data-abc': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer ce candidat ?</h4><p>' + esc(r.id) + ' — ' + esc(r.nomComplet) + ' (' + esc(r.posteVise || '—') + '). Cette action est définitive.</p>' +
      '<div class="abc-confirm-row"><button class="abc-btn abc-btn-ghost" data-a="no" style="color:var(--abc-text);border-color:var(--abc-line)">Annuler</button>' +
      '<button class="abc-btn abc-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.candidats = cur.candidats.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Candidat supprimé', r.id);
      UI.cmp = UI.cmp.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Candidat supprimé', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' candidats ?') : 'Supprimer 1 candidat ?';
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'abc-confirm', 'data-abc': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="abc-confirm-row"><button class="abc-btn abc-btn-ghost" data-a="no" style="color:var(--abc-text);border-color:var(--abc-line)">Annuler</button>' +
      '<button class="abc-btn abc-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.candidats = cur.candidats.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' candidats');
      UI.cmp = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' candidats supprimés', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= comparateur ================= */
  function closeCompare() { $$('[data-abc="compare"],[data-abc="backdrop"][data-abc-for="compare"]').forEach(function (n) { n.remove(); }); }
  function openCompare() {
    closeCompare();
    var ids = UI.cmp.length >= 2 ? UI.cmp : [];
    if (ids.length < 2) {
      var all = data().slice().sort(function (a, b) { return b.score - a.score; });
      ids = [all[0], all[1]].filter(Boolean).map(function (r) { return r.id; });
    }
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (rows.length < 2) { toast('Sélectionnez au moins 2 candidats à comparer', 'err'); return; }
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'compare' });
    bd.addEventListener('click', closeCompare);
    var p = h('div', { class: 'abc-panel', 'data-abc': 'compare', role: 'dialog', 'aria-label': 'Comparateur' });
    var head = '<tr><th>Critère</th>' + rows.map(function (r) { return '<th>' + esc(r.nomComplet) + '<br><span style="font-weight:600;color:var(--abc-text2)">' + esc(r.id) + '</span></th>'; }).join('') + '</tr>';
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
      row2('Statut', function (r) { return pipeIdx(r.statut) < 0 ? 99 : pipeIdx(r.statut); }, function (v, r) { return esc(statutMeta(r.statut).lab); }, false) +
      row2('Score /20', function (r) { return r.score; }, function (v) { return v > 0 ? String(v) : '—'; }, false) +
      row2('Niveau d\u2019étude', function () { return 0; }, function (v, r) { return esc(r.niveauEtude || '—'); }, false) +
      row2('Années d\u2019expérience', function (r) { return r.anneesExp; }, function (v) { return String(v); }, false) +
      row2('Âge', function (r) { return r.age || 999; }, function (v) { return v && v !== 999 ? v + ' ans' : '—'; }, false) +
      row2('Source', function () { return 0; }, function (v, r) { return esc(r.sourceCandidature || '—'); }, false) +
      row2('Type de contrat visé', function () { return 0; }, function (v, r) { return esc(r.typeContrat || '—'); }, false) +
      row2('Ville', function () { return 0; }, function (v, r) { return esc(r.ville || '—'); }, false) +
      row2('Date de candidature', function () { return 0; }, function (v, r) { return esc(jDate(r.dateCandidature) || '—'); }, false) +
      row2('Attente', function (r) { return r.anciennete; }, function (v) { return v + ' j'; }, true) +
      '<tr><td>Demande alignée</td>' + rows.map(function (r) {
        return '<td>' + (r.dm ? esc(r.dm.numero) + (norm(r.dm.poste) === norm(r.posteVise) ? '' : ' <span class="abc-chip warn">⚠</span>') : '—') + '</td>';
      }).join('') + '</tr>';
    var best = rows.slice().sort(function (a, b) { return b.score - a.score; })[0];
    p.innerHTML = '<div class="abc-panel-head"><h3>Comparateur de candidats — aide à la décision</h3><button class="abc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="abc-panel-body"><div class="abc-cmp-wrap"><table class="abc-cmp"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="abc-cibles-note" style="margin-top:10px">Vert = le plus favorable · Rouge = le moins favorable sur le critère. Score le plus élevé : <b>' + esc(best.nomComplet) + '</b> (' + best.score + '/20). La décision finale reste humaine (ISO 30401).</p></div>';
    $('.abc-drawer-x', p).addEventListener('click', closeCompare);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Comparateur ouvert', rows.length + ' candidats');
  }

  /* ================= pipeline ================= */
  function closePipeline() { $$('[data-abc="pipe"],[data-abc="backdrop"][data-abc-for="pipe"]').forEach(function (n) { n.remove(); }); }
  function openPipeline() {
    closePipeline();
    var rows = data();
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'pipe' });
    bd.addEventListener('click', closePipeline);
    var p = h('div', { class: 'abc-panel', 'data-abc': 'pipe', role: 'dialog', 'aria-label': 'Pipeline' });
    var nb = rows.length;
    var nbRet = rows.filter(function (r) { return r.statut === 'Retenu'; }).length;
    var nbRef = rows.filter(function (r) { return r.statut === 'Refuse'; }).length;
    var actives = rows.filter(function (r) { return pipeIdx(r.statut) > -1 && pipeIdx(r.statut) < 4; });
    var ancAct = actives.length ? Math.round(actives.reduce(function (s, r) { return s + r.anciennete; }, 0) / actives.length) : 0;
    var bySt = {};
    STATUTS.forEach(function (s) { bySt[s.k] = 0; });
    rows.forEach(function (r) { if (bySt[r.statut] != null) bySt[r.statut]++; });
    var mx = Math.max.apply(null, STATUTS.map(function (s) { return bySt[s.k]; }).concat([1]));
    var bars = STATUTS.map(function (s) {
      return '<div class="abc-sim-arow"><span style="min-width:150px;color:' + s.c + ';font-weight:700">' + esc(s.lab) + '</span>' +
        '<span class="abc-bar-track"><span class="abc-bar-fill" style="width:' + Math.max(bySt[s.k] ? 4 : 0, bySt[s.k] / mx * 100) + '%;background:' + s.c + '"></span></span>' +
        '<span><b>' + bySt[s.k] + '</b> · ' + pct(nb ? bySt[s.k] / nb * 100 : 0) + '</span></div>';
    }).join('');
    var goulot = null;
    PIPE.slice(0, 4).forEach(function (k) {
      var n = bySt[k] || 0;
      if (!goulot || n > goulot.n) goulot = { k: k, n: n };
    });
    var tip = '💡 ';
    if (goulot && goulot.n > 0) {
      var sem = Math.ceil(goulot.n / 5);
      tip += 'L\u2019étape « ' + statutMeta(goulot.k).lab + ' » concentre ' + goulot.n + ' candidat(s) — à 5 entretiens/semaine, comptez ' + sem + ' semaine(s) pour absorber. ';
    }
    if (ancAct > SEUILS.delaiReponse) tip += 'L\u2019attente moyenne des candidatures actives (' + ancAct + ' j) dépasse le seuil de ' + SEUILS.delaiReponse + ' j : risque de perte de candidats.';
    else tip += 'Attente moyenne des candidatures actives : ' + ancAct + ' j (seuil ' + SEUILS.delaiReponse + ' j).';
    p.innerHTML = '<div class="abc-panel-head"><h3>Pipeline de recrutement — flux & goulots</h3><button class="abc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="abc-panel-body">' +
        '<div class="abc-sim-kpis"><span><b>' + nbRet + '</b> retenu(s) (' + pct(nb ? nbRet / nb * 100 : 0) + ')</span>' +
          '<span><b>' + nbRef + '</b> refusé(s) (' + pct(nb ? nbRef / nb * 100 : 0) + ')</span>' +
          '<span>attente moyenne <b>' + ancAct + ' j</b></span></div>' +
        '<div style="font-size:.72rem;color:var(--abc-text2);margin:8px 0 5px">Répartition des candidats par étape :</div>' +
        '<div class="abc-sim-alloc">' + bars + '</div>' +
        '<div class="abc-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' +
      '</div>';
    $('.abc-drawer-x', p).addEventListener('click', closePipeline);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Pipeline ouvert', '');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-abc="seuils"],[data-abc="backdrop"][data-abc-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'abc-panel', 'data-abc': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="abc-panel-head"><h3>Seuils de pilotage</h3><button class="abc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="abc-panel-body">' +
        '<p class="abc-cibles-note">Ces seuils alimentent les alertes, les couleurs et le filtre « talents » (Manuel D1 : vivier de talents préservé, délais de réponse maîtrisés).</p>' +
        '<div class="abc-sim-row"><label for="abc-s1">Score « talent » (/20)</label><input type="range" id="abc-s1" min="10" max="20" step="1" value="' + SEUILS.scoreTalent + '"><input class="abc-in" type="number" min="0" max="20" step="1" data-abc="s1n" value="' + SEUILS.scoreTalent + '"></div>' +
        '<div class="abc-sim-row"><label for="abc-s2">Délai de réponse maximum (jours)</label><input type="range" id="abc-s2" min="7" max="120" step="1" value="' + SEUILS.delaiReponse + '"><input class="abc-in" type="number" min="1" max="365" step="1" data-abc="s2n" value="' + SEUILS.delaiReponse + '"></div>' +
        '<div class="abc-sim-row"><label for="abc-s3">Part d\u2019une source maximum (%)</label><input type="range" id="abc-s3" min="10" max="90" step="5" value="' + SEUILS.partSource + '"><input class="abc-in" type="number" min="1" max="100" step="1" data-abc="s3n" value="' + SEUILS.partSource + '"></div>' +
        '<div class="abc-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="abc-btn abc-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.abc-drawer-x', p).addEventListener('click', closeSeuils);
    [['abc-s1', 's1n', 'scoreTalent', 10, 20, 1], ['abc-s2', 's2n', 'delaiReponse', 7, 120, 1], ['abc-s3', 's3n', 'partSource', 10, 90, 5]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-abc="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.scoreTalent = Math.max(10, Math.min(20, Number($('[data-abc="s1n"]', p).value) || SEUILS.scoreTalent));
      SEUILS.delaiReponse = Math.max(7, Math.min(120, Number($('[data-abc="s2n"]', p).value) || SEUILS.delaiReponse));
      SEUILS.partSource = Math.max(10, Math.min(90, Number($('[data-abc="s3n"]', p).value) || SEUILS.partSource));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'talent ≥ ' + SEUILS.scoreTalent + '/20 · réponse ≤ ' + SEUILS.delaiReponse + ' j · source ≤ ' + SEUILS.partSource + ' %');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-abc="journal"],[data-abc="backdrop"][data-abc-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'abc-backdrop', 'data-abc': 'backdrop', 'data-abc-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'abc-panel', 'data-abc': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="abc-panel-head"><h3>Journal d\u2019activité</h3><button class="abc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="abc-panel-body" data-abc="jlist"></div>';
    $('.abc-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-abc="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="abc-jrow"><span class="abc-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="abc-jact">' + esc(x.action || '') + '</span><span class="abc-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="abc-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Candidat', 'Civilité', 'Nom', 'Prénom', 'Téléphone', 'Email', 'Ville', 'Poste visé', 'Demande alignée', 'Statut demande', 'Source', 'Statut', 'Score /20', 'Niveau étude', 'Diplôme', 'Établissement', 'Années exp.', 'Dernier employeur', 'Compétences clés', 'Langues', 'Niveau langue', 'Outils', 'Type contrat', 'Date candidature', 'Attente (j)', 'Date naissance', 'Âge', 'Notes', 'Contrat', 'Début essai', 'Fin essai', 'Embauche déf.'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.id, r.civilite, r.nom, r.prenom, r.telephone, r.email, r.ville, r.posteVise, r.dm ? r.dm.numero : '', r.dm ? r.dm.statut : '', r.sourceCandidature, r.statut, r.score || '', r.niveauEtude, r.diplome, r.etablissement, r.anneesExp, r.dernierEmployeur, r.competencesCles, r.langues, r.niveauLangue, r.outilsLogiciels, r.typeContrat, jDate(r.dateCandidature), r.anciennete, jDate(r.dateNaissance), r.age || '', r.notes, r.contratTelechargeable, jDate(r.dateDebutEssai), jDate(r.dateFinEssai), jDate(r.dateEmbaucheDefinitive)];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-base-candidats-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closePipeline(); closeCompare(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-abc="dialog"]') || $('[data-abc="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { openPipeline(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { openCompare(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-abc="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouveau · E export · J journal · P pipeline · C comparer · S seuils · / recherche', ''); }
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
    var root = $('[data-abc="root"]');
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
    if (UI.view === 'cards') renderCards(); else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-abc="drawer"],[data-abc="dialog"],[data-abc="confirm"],[data-abc="journal"],[data-abc="pipe"],[data-abc="compare"],[data-abc="seuils"]')) {
      $$('[data-abc="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-abc');
    shellBuilt = false;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-abc]') || t.closest('#abc-stsel'))) continue;
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
    html.classList.remove('admina-abc');
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
    var root = $('[data-abc="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-abc-hide', '1');
      natif.setAttribute('data-abc-olddisp', natif.style.display || '');
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

  window.__ADMINA_CAND_UI__ = {
    version: '1.0-t25',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    exportCSV: exportCSV,
    openCompare: openCompare,
    openPipeline: openPipeline
  };
  try { console.info('[ADMINA_CAND] M25 actif — Centre de pilotage base candidats /base-candidats'); } catch (e) {}
})();
