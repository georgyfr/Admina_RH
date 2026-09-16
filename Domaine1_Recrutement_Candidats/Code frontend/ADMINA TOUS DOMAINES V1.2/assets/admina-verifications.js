/* =============================================================
   Admina-RH — Vérification des Références — couche admina
   W1-c : CENTRE DE PILOTAGE — diligence & vérification référentielle
   PHILOSOPHIE — Vérification Références = la DILIGENCE du recrutement :
   ne jamais offrir sans avoir vérifié ; tracer chaque contact de
   référent (canal, date, relance) ; relancer sans attendre ; conclure
   par écrit (favorable / partiel / défavorable) avant toute décision.
   La page reste fidèle à sa nature de SUIVI DE VÉRIFICATIONS : on
   pilote des dossiers (référent, contact, relance, conclusion), pas
   un pipeline ni un référentiel de candidats.
   Héro calculé + alertes AAA cliquables→filtres (relances, délais de
   conclusion, résultats défavorables, référent sans contact, dossiers
   non démarrés & finalistes non couverts via __ADMINA_CAND_API__)
   + 6 KPI filtres + 3 graphiques SVG vanilla cliquables (donut statut,
   vérifications par entreprise, éléments vérifiés) + recherche et
   filtres + table triable (aria-sort) + vue cartes + drawer fiche
   (référent, contacts & relances, conclusion) + dialog création/édition
   VALIDÉ + duplication + suppression simple/groupée confirmée + seuils
   configurables (relance & conclusion) + panneau Diligence + panneau
   Relances + export CSV + journal d'audit + raccourcis clavier
   + thème sombre + burger mobile <820px.
   - Scope strict : /verification-references (RegExp /\/verification-references\/?$/)
   - Idempotent (data-avr / data-avr-hide), sans collision (__ADMINA_VREF_W1__)
   - Données : window.__ADMINA_VREF_API__ (patch chunk) → fallback
     localStorage 'admina-verifications-data' après 30 réessais ;
     si l'API tarde et qu'aucune donnée locale n'existe, la page
     native reste INTACTE.
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_VREF_W1__) return;
  window.__ADMINA_VREF_W1__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/verification-references\/?$/;
  var LS_DATA = 'admina-verifications-data';
  var LS_UI = 'admina-verifications-ui';
  var LS_SEUILS = 'admina-verifications-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', resultat: '', decision: '', elem: '', age: '', kpi: '', view: 'table', sortKey: 'date', sortDir: -1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, sel: [] };

  /* ================= seuils ================= */
  var SEUILS_DEF = { relanceJours: 7, delaiConclusion: 21, tauxFavorableMin: 70 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var STATUTS = [
    { k: 'Non démarrée', lab: 'Non démarrée', c: '#64748b', f: 'f1' },
    { k: 'En cours', lab: 'En cours', c: '#0891b2', f: 'f2' },
    { k: 'Favorable', lab: 'Favorable', c: '#059669', f: 'f3' },
    { k: 'Partiel', lab: 'Partielle', c: '#d97706', f: 'f4' },
    { k: 'Defavorable', lab: 'Défavorable', c: '#dc2626', f: 'f5' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8', f: 'f6' }; }
  function stIdx(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return i; } return k ? 99 : 98; }
  var RESULTATS = ['Favorable', 'Defavorable', 'Partiel', 'Non verifiable'];
  var RES_LAB = { 'Favorable': 'Favorable', 'Defavorable': 'Défavorable', 'Partiel': 'Partielle', 'Non verifiable': 'Non vérifiable' };
  function resRank(k) { var i = RESULTATS.indexOf(k); return i < 0 ? 4 : i; }
  var DECISIONS = ['Embauche recommandee', 'Embauche avec reserve', 'En attente decision', 'Refus'];
  var DEC_LAB = { 'Embauche recommandee': 'Embauche recommandée', 'Embauche avec reserve': 'Embauche avec réserve', 'Refus': 'Refus', 'En attente decision': 'En attente de décision' };
  function decRank(k) { var i = DECISIONS.indexOf(k); return i < 0 ? 4 : i; }
  var CANAUX = ['Téléphone', 'Email', 'WhatsApp', 'LinkedIn', 'En personne'];
  var ELEMENTS = ['Diplôme', 'Expérience', 'Comportement', 'Référent', 'Ancienneté', 'Motif de départ'];

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
  function todayFR() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
  }
  function toArray(x) {
    if (Array.isArray(x)) return x.map(function (v) { return String(v == null ? '' : v).trim(); }).filter(Boolean);
    return String(x || '').split('/').map(function (v) { return v.trim(); }).filter(Boolean);
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
  function toastsZone() { var z = $('[data-avr="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-avr', 'toasts'); z.className = 'avr-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'avr-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_VREF_API__ || null; }
  function lsRead() {
    try { var d = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); if (d && Array.isArray(d.verifications)) return d.verifications; } catch (e) {}
    return [];
  }
  function lsWrite(rows) {
    try {
      var o = {};
      try { o = JSON.parse(localStorage.getItem(LS_DATA) || '{}') || {}; } catch (e) { o = {}; }
      o.verifications = rows;
      localStorage.setItem(LS_DATA, JSON.stringify(o));
    } catch (e2) {}
  }
  function normalize(r) {
    var u = {};
    for (var k in r) u[k] = r[k];
    u.numero = String(u.numero || '');
    u.candidat = String(u.candidat || '');
    u.entreprise = String(u.entreprise || '');
    u.contact = String(u.contact || '');
    u.telephone = String(u.telephone || '');
    u.verificateur = String(u.verificateur || '');
    u.canalContact = String(u.canalContact || '');
    u.elementsVerifies = toArray(u.elementsVerifies);
    u.resultatChips = toArray(u.resultatChips);
    u.relances = Array.isArray(u.relances) ? u.relances : [];
    u.anciennete = daysSince(u.dateVerification);
    u.sm = statutMeta(u.statut);
    u.dernierContact = dernierContact(u);
    return u;
  }
  function dernierContact(r) {
    var best = String(r.dateVerification || '');
    (r.relances || []).forEach(function (x) { if (dateKey(x && x.date) > dateKey(best)) best = String(x.date || ''); });
    return best;
  }
  function joursSansContact(r) {
    var t = tsOf(dernierContact(r));
    if (!t) return daysSince(r.dateVerification) || 9999;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
  function estEnRetard(r) {
    return r.statut === 'En cours' && joursSansContact(r) > SEUILS.relanceJours;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.verifications) d = { verifications: lsRead() };
    if (!d.verifications || !d.verifications.length) return [];
    return d.verifications.map(normalize);
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function nextId(rows) { return rows.reduce(function (m, r) { return Math.max(m, Number(r && r.id) || 0); }, 0) + 1; }
  function nextNumero(rows) {
    var mx = 0, yr = null;
    rows.forEach(function (r) {
      var m = /^VERIF-(\d{4})-(\d+)$/.exec(String((r && r.numero) || ''));
      if (m) { var n = Number(m[2]); if (n > mx) { mx = n; yr = m[1]; } }
    });
    if (!yr) yr = String(new Date().getFullYear());
    return 'VERIF-' + yr + '-' + String(mx + 1).padStart(3, '0');
  }
  function finalistes() {
    var out = [];
    try {
      var a = window.__ADMINA_CAND_API__;
      if (a && typeof a.getData === 'function') {
        var d = a.getData();
        ((d && d.candidats) || []).forEach(function (c) {
          if (c && c.statut === 'Retenu') out.push({ nom: ((c.prenom || '') + ' ' + (c.nom || '')).trim(), poste: c.posteVise || '' });
        });
      }
    } catch (e) {}
    return out;
  }
  function finalistesNonVerifies() {
    var rows = data();
    var fs = finalistes();
    if (!fs.length) return [];
    return fs.filter(function (f) {
      var n = norm(f.nom);
      return !rows.some(function (r) { var c = norm(r.candidat); return c && (c === n || c.indexOf(n) > -1 || n.indexOf(c) > -1); });
    });
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.verifications) cur = { verifications: lsRead() };
      var nv = fn(cur);
      if (!nv || !nv.verifications) return false;
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    if (!lsFallback) { toast('Synchronisation avec la page en cours — réessayez dans un instant', ''); return false; }
    var cur2 = { verifications: lsRead() };
    var nv2 = fn(cur2);
    if (!nv2 || !nv2.verifications) return false;
    lsWrite(nv2.verifications);
    if (actionLabel) jlog(actionLabel + ' (mode local)', detail || '');
    refresh();
    return true;
  }

  /* ================= alertes ================= */
  function computeAlerts(rows) {
    var out = [];
    var neg = rows.filter(function (r) { return r.statut === 'Defavorable' || r.resultatGlobal === 'Defavorable'; });
    if (neg.length) out.push({ tone: 'err', txt: neg.length + ' référence' + (neg.length > 1 ? 's' : '') + ' défavorable' + (neg.length > 1 ? 's' : '') + ' — suites et décision à sécuriser (' + neg.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'neg' });
    var old = rows.filter(function (r) { return r.statut === 'En cours' && r.anciennete > SEUILS.delaiConclusion; });
    if (old.length) {
      var worst = old.slice().sort(function (a, b) { return b.anciennete - a.anciennete; })[0];
      out.push({ tone: 'err', txt: old.length + ' vérification' + (old.length > 1 ? 's' : '') + ' en cours sans conclusion depuis plus de ' + SEUILS.delaiConclusion + ' j — la plus ancienne : ' + worst.numero + ' (' + worst.anciennete + ' j)', f: 'old' });
    }
    var late = rows.filter(estEnRetard);
    if (late.length) {
      var w2 = late.slice().sort(function (a, b) { return joursSansContact(b) - joursSansContact(a); })[0];
      out.push({ tone: 'warn', txt: late.length + ' relance' + (late.length > 1 ? 's' : '') + ' de référent requise' + (late.length > 1 ? 's' : '') + ' (> ' + SEUILS.relanceJours + ' j sans nouvelle) — ' + w2.numero + ' (' + joursSansContact(w2) + ' j)', f: 'relance' });
    }
    var noc = rows.filter(function (r) { return !r.contact || !r.telephone; });
    if (noc.length) out.push({ tone: 'warn', txt: noc.length + ' référent' + (noc.length > 1 ? 's' : '') + ' sans coordonnée exploitable (contact ou téléphone manquant) — ' + noc.slice(0, 2).map(function (r) { return r.numero; }).join(', '), f: 'nocontact' });
    var nostart = rows.filter(function (r) { return r.statut === 'Non démarrée' || !r.statut; });
    var fnv = finalistesNonVerifies();
    if (nostart.length || fnv.length) {
      var t = nostart.length + ' dossier' + (nostart.length > 1 ? 's' : '') + ' de vérification non démarré' + (nostart.length > 1 ? 's' : '');
      if (fnv.length) t += ' · ' + fnv.length + ' finaliste' + (fnv.length > 1 ? 's' : '') + ' de la base candidats sans vérification (' + fnv.slice(0, 2).map(function (f) { return f.nom; }).join(', ') + '…)';
      out.push({ tone: 'info', txt: t, f: 'nostart' });
    }
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.kpi === 'enc' && r.statut !== 'En cours') return false;
      if (UI.kpi === 'fav' && !(r.statut === 'Favorable' || r.resultatGlobal === 'Favorable')) return false;
      if (UI.kpi === 'def' && !(r.statut === 'Defavorable' || r.resultatGlobal === 'Defavorable')) return false;
      if (UI.kpi === 'relance' && !estEnRetard(r)) return false;
      if (UI.kpi === 'noconcl' && r.decisionFinale) return false;
      if (UI.kpi === 'nocontact' && r.contact && r.telephone) return false;
      if (UI.kpi === 'nostart' && !(r.statut === 'Non démarrée' || !r.statut)) return false;
      if (UI.statut && r.statut !== UI.statut) return false;
      if (UI.resultat === '__none') { if (r.resultatGlobal) return false; }
      else if (UI.resultat && r.resultatGlobal !== UI.resultat) return false;
      if (UI.decision === '__none') { if (r.decisionFinale) return false; }
      else if (UI.decision && r.decisionFinale !== UI.decision) return false;
      if (UI.elem) {
        var found = false;
        (r.elementsVerifies || []).forEach(function (x) { if (norm(x) === norm(UI.elem)) found = true; });
        if (!found) return false;
      }
      if (UI.age === 'drelance' && !estEnRetard(r)) return false;
      if (UI.age === 'dconcl' && !(r.statut === 'En cours' && r.anciennete > SEUILS.delaiConclusion)) return false;
      if (q && !(norm(r.candidat).indexOf(q) > -1 || norm(r.numero).indexOf(q) > -1 || norm(r.entreprise).indexOf(q) > -1 || norm(r.contact).indexOf(q) > -1 || norm(r.telephone).indexOf(q) > -1 || norm(r.verificateur).indexOf(q) > -1 || norm(r.posteVise).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'date') { va = dateKey(a.dateVerification); vb = dateKey(b.dateVerification); }
      else if (k === 'statut') { va = stIdx(a.statut); vb = stIdx(b.statut); }
      else if (k === 'resultat') { va = resRank(a.resultatGlobal); vb = resRank(b.resultatGlobal); }
      else if (k === 'decision') { va = decRank(a.decisionFinale); vb = decRank(b.decisionFinale); }
      else if (k === 'rel') { va = joursSansContact(a); vb = joursSansContact(b); }
      else if (k === 'anci') { va = a.anciennete; vb = b.anciennete; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.resultat ? 1 : 0) + (UI.decision ? 1 : 0) + (UI.elem ? 1 : 0) + (UI.age ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.resultat = ''; UI.decision = ''; UI.elem = ''; UI.age = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/V[ée]rification\s+des\s+R[ée]f[ée]rences/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    if (!api() && (!lsFallback || !lsRead().length)) return false;
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-avr="root"]');
    if (!root) {
      root = h('section', { 'data-avr': 'root', class: 'avr-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-avr-page')) {
      page.setAttribute('data-avr-page', '1');
      page.setAttribute('data-avr-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-avr-hide')) {
      natif.setAttribute('data-avr-hide', '1');
      natif.setAttribute('data-avr-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-avr="root"]'); if (root) root.remove();
    $$('[data-avr-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-avr-oldw') || '';
      n.removeAttribute('data-avr-page');
      n.removeAttribute('data-avr-oldw');
    });
    $$('[data-avr-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-avr-olddisp') || '';
      n.removeAttribute('data-avr-hide');
      n.removeAttribute('data-avr-olddisp');
    });
    $$('[data-avr]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-avr="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'avr-btn avr-btn-primary avr-backbtn', 'data-avr': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'verification-references');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    dil: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.8h6V4"/><path d="m8.6 11.4 2 2 4.2-4.2"/><path d="M8.6 16.4h6.8"/></svg>',
    rel: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z"/></svg>',
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
  var SHIELD_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4.5 5v6c0 5 3.2 8.6 7.5 10.5 4.3-1.9 7.5-5.5 7.5-10.5V5z"/><path d="m8.7 11.6 2.2 2.2 4.4-4.4"/></svg>';

  function buildShell() {
    var root = $('[data-avr="root"]');
    if (!root || $('[data-avr="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="avr-hero" data-avr="hero">' +
        '<div class="avr-hero-main">' +
          '<div class="avr-hero-title">' +
            '<span class="avr-hero-ico" aria-hidden="true">' + SHIELD_ICON + '</span>' +
            '<div><h2 class="avr-h2">Centre de pilotage — Vérification des Références</h2>' +
            '<p class="avr-hero-sub" data-avr="herosub"></p></div>' +
          '</div>' +
          '<div class="avr-hero-actions">' +
            '<button class="avr-btn" data-avr="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="avr-btn" data-avr="btn-dil" title="Diligence & conformité (P)">' + ICO.dil + 'Diligence</button>' +
            '<button class="avr-btn" data-avr="btn-rel" title="Contacts & relances (C)">' + ICO.rel + 'Relances</button>' +
            '<button class="avr-btn" data-avr="btn-seuils" title="Seuils de pilotage (S)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="avr-btn" data-avr="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="avr-btn" data-avr="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="avr-btn avr-btn-primary" data-avr="btn-new" title="Nouvelle vérification (N)">' + ICO.plus + 'Nouvelle vérification</button>' +
          '</div>' +
        '</div>' +
        '<div class="avr-hero-alerts" data-avr="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="avr-kpis" data-avr="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="avr-charts" data-avr="charts">' +
        '<div class="avr-chart-card"><div class="avr-chart-title">Dossiers par statut</div><div class="avr-donut-wrap" data-avr="donut"></div></div>' +
        '<div class="avr-chart-card"><div class="avr-chart-title">Vérifications par entreprise</div><div class="avr-bars" data-avr="bars"></div></div>' +
        '<div class="avr-chart-card"><div class="avr-chart-title">Éléments vérifiés</div><div class="avr-bars" data-avr="elems"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="avr-toolbar" data-avr="toolbar">' +
        '<div class="avr-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (candidat, référent, entreprise, n°…)" data-avr="search" aria-label="Rechercher une vérification" /></div>' +
        '<select data-avr="f-statut" class="avr-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-avr="f-resultat" class="avr-sel" aria-label="Filtrer par résultat global"></select>' +
        '<select data-avr="f-decision" class="avr-sel" aria-label="Filtrer par décision finale"></select>' +
        '<select data-avr="f-elem" class="avr-sel" aria-label="Filtrer par élément vérifié"></select>' +
        '<select data-avr="f-age" class="avr-sel" aria-label="Filtrer par délai"></select>' +
        '<button class="avr-chipbtn" data-avr="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="avr-count" data-avr="count"></span>' +
        '<div class="avr-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="avr-vbtn" data-avr="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="avr-vbtn" data-avr="v-cards" title="Vue cartes (K)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-avr="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-avr="selbar"></div>' +

      /* PIED */
      '<div class="avr-foot">Source de vérité locale (navigateur) — conforme Manuel D1 (recrutement) · diligence tracée, relances horodatées · journal d\u2019audit actif · seuils configurables · <button class="avr-link" data-avr="btn-native">Afficher le tableau natif</button></div>';

    $('[data-avr="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-avr="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-avr="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'verification-references'); window.print(); });
    $('[data-avr="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-avr="btn-dil"]', root).addEventListener('click', openDiligence);
    $('[data-avr="btn-rel"]', root).addEventListener('click', openRelances);
    $('[data-avr="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-avr="btn-native"]', root).addEventListener('click', showNative);
    $('[data-avr="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-avr="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-avr="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-avr="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-avr="f-resultat"]', root).addEventListener('change', function (e) { UI.resultat = e.target.value; UI.page = 0; refresh(); });
    $('[data-avr="f-decision"]', root).addEventListener('change', function (e) { UI.decision = e.target.value; UI.page = 0; refresh(); });
    $('[data-avr="f-elem"]', root).addEventListener('change', function (e) { UI.elem = e.target.value; UI.page = 0; refresh(); });
    $('[data-avr="f-age"]', root).addEventListener('change', function (e) { UI.age = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-avr="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-avr="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var nbEnc = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var nbFav = rows.filter(function (r) { return r.statut === 'Favorable' || r.resultatGlobal === 'Favorable'; }).length;
    var nbLate = rows.filter(estEnRetard).length;
    var last = rows.slice().sort(function (a, b) { return dateKey(b.dateVerification) - dateKey(a.dateVerification); })[0];
    var sub = rows.length + ' vérification' + (rows.length > 1 ? 's' : '') +
      ' · ' + nbFav + ' favorable' + (nbFav > 1 ? 's' : '') + ' (' + pct(rows.length ? nbFav / rows.length * 100 : 0) + ')' +
      ' · ' + nbEnc + ' en cours' +
      ' · ' + nbLate + ' à relancer' +
      (last ? ' · dernière vérification le ' + esc(jDate(last.dateVerification) || '—') : '');
    $('[data-avr="herosub"]').textContent = sub;
    var zone = $('[data-avr="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="avr-alert ' + a.tone + '" data-avr="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.avr-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'relance') UI.kpi = 'relance';
        else if (f === 'old') UI.age = 'dconcl';
        else if (f === 'neg') UI.statut = 'Defavorable';
        else if (f === 'nocontact') UI.kpi = 'nocontact';
        else if (f === 'nostart') {
          UI.kpi = 'nostart';
          var fnv = finalistesNonVerifies();
          if (fnv.length) toast('Finalistes sans vérification : ' + fnv.map(function (f2) { return f2.nom; }).join(', '), '');
        }
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var ents = {};
    rows.forEach(function (r) { if (r.entreprise) ents[r.entreprise] = 1; });
    var nbEnc = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var nbFav = rows.filter(function (r) { return r.statut === 'Favorable' || r.resultatGlobal === 'Favorable'; }).length;
    var nbDef = rows.filter(function (r) { return r.statut === 'Defavorable' || r.resultatGlobal === 'Defavorable'; }).length;
    var nbLate = rows.filter(estEnRetard).length;
    var nbNoC = rows.filter(function (r) { return !r.decisionFinale; }).length;
    var kpis = [
      { k: '', t: 'VÉRIFICATIONS', v: String(nb), s: Object.keys(ents).length + ' entreprise(s) référente(s)', cls: '' },
      { k: 'enc', t: 'EN COURS', v: String(nbEnc), s: 'conclusion attendue ≤ ' + SEUILS.delaiConclusion + ' j', cls: '' },
      { k: 'fav', t: 'FAVORABLES', v: String(nbFav), s: pct(nb ? nbFav / nb * 100 : 0) + ' du total · seuil ' + SEUILS.tauxFavorableMin + ' %', cls: (nb && nbFav / nb * 100 >= SEUILS.tauxFavorableMin) ? '' : 'gold' },
      { k: 'def', t: 'DÉFAVORABLES', v: String(nbDef), s: 'résultats à traiter avant décision', cls: nbDef > 0 ? 'bad' : '' },
      { k: 'relance', t: 'À RELANCER', v: String(nbLate), s: 'sans nouvelle > ' + SEUILS.relanceJours + ' j', cls: nbLate > 0 ? 'bad' : '' },
      { k: 'noconcl', t: 'SANS CONCLUSION', v: String(nbNoC), s: 'décision finale absente', cls: '' }
    ];
    var zone = $('[data-avr="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="avr-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="avr-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="avr-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="avr-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.avr-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.resultat = ''; UI.decision = ''; UI.elem = ''; UI.age = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Dossiers par statut">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">dossiers</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-avr="donut"]');
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="avr-donut-legend">' + parts.map(function (p) {
        return '<span class="avr-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="avr-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="avr-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.avr-dl-item', zone).forEach(function (it) {
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
    if (mx <= 0) return '<div class="avr-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="avr-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="avr-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="avr-bar-track"><span class="avr-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="avr-bar-val">' + it.v + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var zone = $('[data-avr="bars"]');
    var map = {};
    rows.forEach(function (r) { var p = r.entreprise || '—'; if (!map[p]) map[p] = { key: p, name: p, v: 0 }; map[p].v++; });
    var items = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    zone.innerHTML = barRowsHtml(items);
    $$('.avr-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        resetFilters();
        UI.q = k;
        var si = $('[data-avr="search"]');
        if (si) si.value = k;
        refresh();
      });
    });
    var z2 = $('[data-avr="elems"]');
    var map2 = {};
    rows.forEach(function (r) { (r.elementsVerifies || []).forEach(function (e) { var k = e || '—'; if (!map2[k]) map2[k] = { key: k, name: k, v: 0 }; map2[k].v++; }); });
    if (!Object.keys(map2).length) map2['Aucun élément tracé'] = { key: '', name: 'Aucun élément tracé', v: rows.length };
    var items2 = Object.keys(map2).map(function (k) { return map2[k]; }).sort(function (a, b) { return b.v - a.v; });
    z2.innerHTML = barRowsHtml(items2);
    $$('.avr-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.elem = UI.elem === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var elems = {};
    rows.forEach(function (r) { (r.elementsVerifies || []).forEach(function (e) { if (e) elems[e] = 1; }); });
    var sel = $('[data-avr="f-statut"]');
    sel.innerHTML = '<option value="">Statut : tous</option>' + STATUTS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-avr="f-resultat"]');
    sel2.innerHTML = '<option value="">Résultat : tous</option>' + RESULTATS.map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.resultat === s ? ' selected' : '') + '>' + esc(RES_LAB[s] || s) + '</option>';
    }).join('') + '<option value="__none"' + (UI.resultat === '__none' ? ' selected' : '') + '>Non renseigné</option>';
    var sel3 = $('[data-avr="f-decision"]');
    sel3.innerHTML = '<option value="">Décision : toutes</option>' + DECISIONS.map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.decision === s ? ' selected' : '') + '>' + esc(DEC_LAB[s] || s) + '</option>';
    }).join('') + '<option value="__none"' + (UI.decision === '__none' ? ' selected' : '') + '>Non renseignée</option>';
    var sel4 = $('[data-avr="f-elem"]');
    sel4.innerHTML = '<option value="">Élément vérifié : tous</option>' + Object.keys(elems).sort().map(function (e) {
      return '<option value="' + esc(e) + '"' + (UI.elem === e ? ' selected' : '') + '>' + esc(e) + '</option>';
    }).join('');
    var sel5 = $('[data-avr="f-age"]');
    sel5.innerHTML = '<option value="">Délai : tous</option>' +
      '<option value="drelance"' + (UI.age === 'drelance' ? ' selected' : '') + '>À relancer (&gt; ' + SEUILS.relanceJours + ' j)</option>' +
      '<option value="dconcl"' + (UI.age === 'dconcl' ? ' selected' : '') + '>En cours &gt; ' + SEUILS.delaiConclusion + ' j</option>';
    $('[data-avr="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-avr="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' dossiers';
  }

  function statutChip(r) {
    var sm = r.sm || statutMeta(r.statut);
    return '<span class="avr-chip st" style="background:' + sm.c + '18;border-color:' + sm.c + '66;color:' + sm.c + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function resChip(r) {
    if (!r.resultatGlobal) return '<span class="avr-chip neutral" title="Résultat global non renseigné">—</span>';
    var c = r.resultatGlobal === 'Favorable' ? 'ok' : r.resultatGlobal === 'Defavorable' ? 'err' : r.resultatGlobal === 'Partiel' ? 'warn' : 'info';
    return '<span class="avr-chip ' + c + '" title="Résultat global">' + esc(RES_LAB[r.resultatGlobal] || r.resultatGlobal) + '</span>';
  }
  function decChip(r) {
    if (!r.decisionFinale) return '<span class="avr-chip neutral" title="Décision finale non renseignée">—</span>';
    var c = r.decisionFinale === 'Embauche recommandee' ? 'ok' : r.decisionFinale === 'Refus' ? 'err' : 'warn';
    return '<span class="avr-chip ' + c + '" title="Décision finale">' + esc(DEC_LAB[r.decisionFinale] || r.decisionFinale) + '</span>';
  }
  function relChip(r) {
    var n = (r.relances || []).length;
    var j = joursSansContact(r);
    var late = estEnRetard(r);
    return '<span class="avr-chip ' + (late ? 'warn' : 'neutral') + '" title="' + (n ? n + ' relance(s) enregistrée(s)' : 'Aucune relance') + ' · dernier contact il y a ' + j + ' j">' +
      n + ' relance' + (n > 1 ? 's' : '') + ' · ' + j + ' j</span>';
  }
  function elemsCell(r) {
    var e = r.elementsVerifies || [];
    if (!e.length) return '<span class="avr-chip neutral" title="Aucun élément vérifié tracé">—</span>';
    return e.slice(0, 3).map(function (x) { return '<span class="avr-chip info">' + esc(x) + '</span>'; }).join(' ') +
      (e.length > 3 ? ' <span class="avr-num">+' + (e.length - 3) + '</span>' : '');
  }
  function detCell(r) {
    if (!r.detailsRetour) return '—';
    return '<span class="avr-det" title="' + esc(r.detailsRetour) + '">' + esc(r.detailsRetour) + '</span>';
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var nbFav = all.filter(function (r) { return r.statut === 'Favorable' || r.resultatGlobal === 'Favorable'; }).length;
    var nbEnc = all.filter(function (r) { return r.statut === 'En cours'; }).length;
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = key ? ' aria-sort="' + (key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none') + '"' : '';
      return '<th ' + (key ? 'data-sort="' + key + '"' : '') + aria + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="avr-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'avr-th-chk') + th('N°', 'numero') + th('Candidat', 'candidat') + th('Entreprise', 'entreprise') +
      th('Référent', 'contact') + th('Téléphone', null) + th('Date vérif.', 'date') + th('Statut', 'statut') +
      th('Éléments', null) + th('Résultat global', 'resultat') + th('Décision finale', 'decision') + th('Relances', 'rel') +
      th('Détails / retour', null) + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="avr-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.numero) + '"></td>' +
        '<td class="avr-num">' + esc(r.numero || r.id) + '</td>' +
        '<td><span class="avr-poste" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</span>' + (r.posteVise ? '<div class="avr-num">' + esc(r.posteVise) + '</div>' : '') + '</td>' +
        '<td style="font-weight:600">' + esc(r.entreprise || '—') + '</td>' +
        '<td>' + (r.contact ? esc(r.contact) : '<span class="avr-chip warn" title="Référent à renseigner">sans contact</span>') + '</td>' +
        '<td class="avr-num">' + esc(r.telephone || '—') + '</td>' +
        '<td class="avr-num">' + esc(jDate(r.dateVerification) || '—') + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td>' + elemsCell(r) + '</td>' +
        '<td>' + resChip(r) + '</td>' +
        '<td>' + decChip(r) + '</td>' +
        '<td>' + relChip(r) + '</td>' +
        '<td>' + detCell(r) + '</td>' +
        '<td><div class="avr-actions">' +
          '<button class="avr-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="avr-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="avr-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="avr-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="avr-tfoot"><td></td><td colspan="13">TOTAL ' + all.length + ' dossier(s) · ' + nbFav + ' favorable(s) · ' + nbEnc + ' en cours · seuils : relance ' + SEUILS.relanceJours + ' j · conclusion ' + SEUILS.delaiConclusion + ' j</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="avr-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="avr-sel" data-avr="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="avr-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="avr-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-avr="content"]');
    card.innerHTML = '<div class="avr-tblcard"><div class="avr-tblwrap"><table class="avr-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="14"><div class="avr-empty">Aucune vérification ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'candidat' || k === 'numero' || k === 'entreprise' || k === 'contact' ? 1 : -1; }
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
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit')); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-avr="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var card = $('[data-avr="content"]');
    card.innerHTML = rows.length ? '<div class="avr-cards">' + rows.map(function (r) {
      var sm = r.sm;
      return '<div class="avr-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="avr-card-top"><div><input type="checkbox" class="avr-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="avr-num">' + esc(r.numero || r.id) + '</span></div>' +
        statutChip(r) + '</div>' +
        '<div class="avr-card-name" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</div>' +
        '<div class="avr-card-struct"><span style="font-weight:700;color:var(--avr-text)">' + esc(r.entreprise || '—') + '</span>' +
        '<span>Référent : ' + esc(r.contact || 'non renseigné') + ' · ' + esc(r.telephone || '—') + '</span>' +
        '<span>Vérificateur : ' + esc(r.verificateur || '—') + '</span></div>' +
        '<div class="avr-card-meta">' + resChip(r) + decChip(r) +
        (r.canalContact ? '<span class="avr-chip neutral">' + esc(r.canalContact) + '</span>' : '') + '</div>' +
        '<div class="avr-card-struct"><span>' + elemsCell(r) + '</span></div>' +
        '<div class="avr-card-foot"><span class="avr-num">' + esc(jDate(r.dateVerification) || '—') + ' · ' + esc(r.relances && r.relances.length ? r.relances.length + ' relance(s)' : 'aucune relance') + '</span>' +
        '<div class="avr-card-act">' +
          '<button class="avr-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="avr-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="avr-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="avr-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="avr-empty">Aucune vérification ne correspond aux filtres</div>';
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
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit')); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  function renderSelBar() {
    var zone = $('[data-avr="selbar"]');
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    zone.innerHTML = '<div class="avr-selbar">' +
      '<span class="avr-selbar-info">' + UI.sel.length + ' sélectionné' + (UI.sel.length > 1 ? 's' : '') + '</span>' +
      '<button class="avr-btn avr-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="avr-btn avr-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="avr-btn avr-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer détail ================= */
  function closeDrawer() { $$('[data-avr="drawer"],[data-avr="backdrop"][data-avr-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var sm = r.sm;
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var tl = (r.relances || []).slice().sort(function (a, b) { return dateKey(b.date) - dateKey(a.date); }).map(function (x) {
      return '<div class="avr-tl-row"><span class="avr-tl-when">' + esc(jDate(x.date) || '—') + '</span>' +
        '<span class="avr-tl-what"><span class="avr-chip neutral">' + esc(x.canal || '—') + '</span>' +
        '<span class="avr-tl-note">' + esc(x.note || '') + '</span></span></div>';
    }).join('');
    var jc = joursSansContact(r);
    var dr = h('aside', { class: 'avr-drawer', 'data-avr': 'drawer', role: 'dialog', 'aria-label': 'Fiche ' + (r.numero || '') });
    dr.innerHTML =
      '<div class="avr-drawer-head"><div><div class="avr-drawer-title">' + esc(r.candidat || '—') + '</div>' +
      '<div class="avr-drawer-sub">' + esc(r.numero || '') + ' · ' + esc(r.entreprise || '—') + (r.posteVise ? ' · ' + esc(r.posteVise) : '') + '</div></div>' +
      '<button class="avr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="avr-drawer-body">' +
        '<div class="avr-live" style="margin-top:0"><span>Statut <b style="color:' + sm.c + '">' + esc(sm.lab) + '</b></span>' +
          '<span>Résultat <b>' + esc(r.resultatGlobal ? (RES_LAB[r.resultatGlobal] || r.resultatGlobal) : '—') + '</b></span>' +
          '<span>Décision <b>' + esc(r.decisionFinale ? (DEC_LAB[r.decisionFinale] || r.decisionFinale) : '—') + '</b></span>' +
          '<span>Dernier contact <b' + (estEnRetard(r) ? ' class="bad"' : '') + '>' + jc + ' j</b></span></div>' +
        '<div class="avr-fsec">Statut de la vérification</div>' +
        '<div class="avr-sim-row" style="margin-bottom:10px"><label for="avr-stsel">Changer le statut</label>' +
          '<select id="avr-stsel" class="avr-in" data-avr="stsel">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select><span></span></div>' +
        '<div class="avr-fsec">Référent & contact</div>' +
        '<dl class="avr-kv">' +
          kv('Entreprise', esc(r.entreprise || '—')) +
          kv('Référent', esc(r.contact || '—') + (!r.contact ? ' <span class="avr-chip warn">à renseigner</span>' : '')) +
          kv('Téléphone', esc(r.telephone || '—') + (!r.telephone ? ' <span class="avr-chip warn">à renseigner</span>' : '')) +
          kv('Canal privilégié', esc(r.canalContact || '—')) +
          kv('Vérificateur', esc(r.verificateur || '—')) +
          kv('Date de vérification', esc(jDate(r.dateVerification) || '—')) +
        '</dl>' +
        '<div class="avr-drawer-actions" style="margin-top:8px"><button class="avr-btn avr-btn-ghost" data-act="relance-now">' + ICO.rel + 'Relancer aujourd\u2019hui</button></div>' +
        '<div class="avr-fsec">Éléments vérifiés</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap">' + elemsCell(r) + '</div>' +
        ((r.resultatChips || []).length ? '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:5px">' + r.resultatChips.map(function (x) { return '<span class="avr-chip ok">' + esc(x) + '</span>'; }).join(' ') + '</div>' : '') +
        '<div class="avr-fsec">Contacts & relances (' + (r.relances || []).length + ')</div>' +
        ((r.relances || []).length ? '<div class="avr-tl">' + tl + '</div>' : '<div class="avr-empty" style="padding:8px 0">Aucune relance tracée pour le moment.</div>') +
        '<div class="avr-relform">' +
          '<input class="avr-in" id="avr-reldate" placeholder="jj/mm/aaaa" value="' + esc(todayFR()) + '" aria-label="Date de la relance">' +
          '<select class="avr-in" id="avr-relcanal" aria-label="Canal de la relance">' + CANAUX.map(function (c) {
            return '<option value="' + esc(c) + '"' + (c === (r.canalContact || 'Téléphone') ? ' selected' : '') + '>' + esc(c) + '</option>';
          }).join('') + '</select>' +
          '<input class="avr-in" id="avr-relnote" placeholder="Compte rendu de la relance…" aria-label="Note de relance">' +
          '<button class="avr-btn avr-btn-primary" data-act="rel-add">Tracer</button>' +
        '</div>' +
        '<div class="avr-fsec">Conclusion</div>' +
        '<dl class="avr-kv">' +
          kv('Résultat global', esc(r.resultatGlobal ? (RES_LAB[r.resultatGlobal] || r.resultatGlobal) : '—') + (!r.resultatGlobal ? ' <span class="avr-chip warn">à conclure</span>' : '')) +
          kv('Décision finale', esc(r.decisionFinale ? (DEC_LAB[r.decisionFinale] || r.decisionFinale) : '—') + (!r.decisionFinale ? ' <span class="avr-chip warn">à conclure</span>' : '')) +
          kv('Date de décision', esc(jDate(r.dateDecision) || '—')) +
        '</dl>' +
        (r.detailsRetour ? '<p style="font-size:.78rem;margin:6px 0 0;color:var(--avr-text)">' + esc(r.detailsRetour) + '</p>' : '') +
        (r.suitesDonnees ? '<dl class="avr-kv" style="margin-top:6px">' + kv('Suites données', esc(r.suitesDonnees)) + '</dl>' : '') +
        '<div class="avr-fsec">Notes</div>' +
        '<textarea class="avr-notebox" data-avr="note" placeholder="Notes internes (contexte, impressions du référent…)">' + esc(r.notes || '') + '</textarea>' +
        '<div class="avr-drawer-actions">' +
          '<button class="avr-btn avr-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="avr-btn avr-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="avr-btn avr-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="avr-btn avr-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.avr-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-avr="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statut) return;
      mutate(function (cur) {
        cur.verifications = cur.verifications.map(function (x) { if (String(x.id) === String(id)) x.statut = nv; return x; });
        return cur;
      }, 'Statut modifié', r.numero + ' → ' + statutMeta(nv).lab);
      toast('Statut : ' + statutMeta(nv).lab, 'ok');
    });
    $('[data-act="relance-now"]', dr).addEventListener('click', function () {
      mutate(function (cur) {
        cur.verifications = cur.verifications.map(function (x) {
          if (String(x.id) === String(id)) {
            if (!Array.isArray(x.relances)) x.relances = [];
            x.relances.push({ date: todayFR(), canal: x.canalContact || 'Téléphone', note: 'Relance enregistrée depuis la fiche' });
          }
          return x;
        });
        return cur;
      }, 'Relance enregistrée', r.numero + ' (' + (r.contact || 'référent') + ')');
      toast('Relance tracée — ' + r.numero, 'ok');
      openDrawer(id);
    });
    $('[data-act="rel-add"]', dr).addEventListener('click', function () {
      var dte = $('#avr-reldate', dr).value.trim();
      var canal = $('#avr-relcanal', dr).value;
      var note = $('#avr-relnote', dr).value.trim();
      if (dte && !/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(dte)) { toast('Format de date invalide (jj/mm/aaaa)', 'err'); return; }
      mutate(function (cur) {
        cur.verifications = cur.verifications.map(function (x) {
          if (String(x.id) === String(id)) {
            if (!Array.isArray(x.relances)) x.relances = [];
            x.relances.push({ date: dte || todayFR(), canal: canal, note: note });
          }
          return x;
        });
        return cur;
      }, 'Relance tracée', r.numero + ' · ' + canal);
      toast('Relance tracée — ' + r.numero, 'ok');
      openDrawer(id);
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-avr="note"]', dr).value;
      mutate(function (cur) {
        cur.verifications = cur.verifications.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.numero);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    jlog('Ouverture fiche', r.numero || String(r.id));
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-avr="dialog"],[data-avr="backdrop"][data-avr-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'avr-dialog', 'data-avr': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une vérification' : 'Nouvelle vérification' });
    function opts(list, cur, labFn) {
      return '<option value=""></option>' + list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = labFn ? labFn(x) : (typeof x === 'object' ? x.lab : x);
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    dlg.innerHTML =
      '<div class="avr-dialog-head"><h3>' + (r ? 'Modifier la vérification ' + esc(r.numero || '') : 'Nouvelle vérification de références') + '</h3>' +
      '<button class="avr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="avr-dialog-body">' +
        '<div class="avr-fgrid">' +
          '<label class="avr-lab">Candidat *<input class="avr-in" data-f="candidat" value="' + esc(v('candidat')) + '" placeholder="Ex. Ndiaye Moussa"></label>' +
          '<label class="avr-lab">Poste visé<input class="avr-in" data-f="posteVise" value="' + esc(v('posteVise')) + '" placeholder="Ex. Réceptionniste"></label>' +
          '<label class="avr-lab">Entreprise (ancien employeur) *<input class="avr-in" data-f="entreprise" value="' + esc(v('entreprise')) + '" placeholder="Ex. Hôtel Sawa"></label>' +
          '<label class="avr-lab">Référent contacté *<input class="avr-in" data-f="contact" value="' + esc(v('contact')) + '" placeholder="Ex. M. Mbarga Jean"></label>' +
          '<label class="avr-lab">Téléphone *<input class="avr-in" data-f="telephone" value="' + esc(v('telephone')) + '" placeholder="+237 6…"></label>' +
          '<label class="avr-lab">Canal de contact<select class="avr-in" data-f="canalContact">' + opts(CANAUX, v('canalContact')) + '</select></label>' +
          '<label class="avr-lab">Vérificateur<input class="avr-in" data-f="verificateur" value="' + esc(v('verificateur')) + '" placeholder="Ex. Mme Fotso Marie"></label>' +
          '<label class="avr-lab">Date de vérification<input class="avr-in" data-f="dateVerification" value="' + esc(jDate(v('dateVerification'))) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="avr-lab">Statut<select class="avr-in" data-f="statut">' + opts(STATUTS, v('statut'), function (x) { return x.lab; }) + '</select></label>' +
          '<label class="avr-lab">Éléments vérifiés (séparés par /)<input class="avr-in" data-f="elems" value="' + esc((r ? r.elementsVerifies : []).join(' / ')) + '" placeholder="Ex. Diplôme / Expérience / Comportement"></label>' +
          '<label class="avr-lab">Résultat global<select class="avr-in" data-f="resultatGlobal">' + opts(RESULTATS, v('resultatGlobal'), function (x) { return RES_LAB[x] || x; }) + '</select></label>' +
          '<label class="avr-lab">Décision finale<select class="avr-in" data-f="decisionFinale">' + opts(DECISIONS, v('decisionFinale'), function (x) { return DEC_LAB[x] || x; }) + '</select></label>' +
          '<label class="avr-lab">Date de décision<input class="avr-in" data-f="dateDecision" value="' + esc(jDate(v('dateDecision'))) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="avr-lab full">Détails du retour du référent<textarea class="avr-in avr-ta" data-f="detailsRetour" placeholder="Ce que le référent confirme précisément…">' + esc(v('detailsRetour')) + '</textarea></label>' +
          '<label class="avr-lab full">Suites données<textarea class="avr-in avr-ta" data-f="suitesDonnees" placeholder="Ex. Embauche validée par la DRH…">' + esc(v('suitesDonnees')) + '</textarea></label>' +
          '<label class="avr-lab full">Notes<textarea class="avr-in avr-ta" data-f="notes">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        '<div class="avr-live" data-avr="dlg-live"></div>' +
        '<div data-avr="dlg-err"></div>' +
      '</div>' +
      '<div class="avr-dialog-foot"><span class="avr-form-hint">Diligence Manuel D1 · toute décision d\u2019embauche doit reposer sur une vérification conclue et tracée</span>' +
      '<span style="display:flex;gap:8px"><button class="avr-btn avr-btn-ghost" data-act="cancel" style="color:var(--avr-text);border-color:var(--avr-line)">Annuler</button>' +
      '<button class="avr-btn avr-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer la vérification') + '</button></span></div>';
    $('.avr-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var anc = daysSince(val.dateVerification);
      var elems = toArray(val.elems);
      var warn = [];
      if (!elems.length) warn.push('<span class="bad">⚠ aucun élément vérifié</span>');
      if (val.decisionFinale && !val.resultatGlobal) warn.push('<span class="bad">⚠ décision sans résultat global</span>');
      if (val.resultatGlobal === 'Defavorable' && val.decisionFinale === 'Embauche recommandee') warn.push('<span class="bad">⚠ incohérence : défavorable mais embauche recommandée</span>');
      $('[data-avr="dlg-live"]', dlg).innerHTML =
        '<span>Statut <b>' + esc(val.statut ? statutMeta(val.statut).lab : '—') + '</b></span>' +
        '<span>Résultat <b>' + esc(val.resultatGlobal ? (RES_LAB[val.resultatGlobal] || val.resultatGlobal) : '—') + '</b></span>' +
        '<span>Décision <b>' + esc(val.decisionFinale ? (DEC_LAB[val.decisionFinale] || val.decisionFinale) : '—') + '</b></span>' +
        '<span>Ancienneté <b>' + (anc ? anc + ' j' : '—') + '</b></span>' +
        '<span>Éléments <b class="' + (elems.length ? 'good' : 'bad') + '">' + elems.length + '</b></span>' +
        warn.join('');
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('change', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-avr="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="avr-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.candidat || '').trim()) return fail('Le nom du candidat est obligatoire.');
      if (!String(val.entreprise || '').trim()) return fail('L\u2019entreprise (ancien employeur) est obligatoire.');
      if (!String(val.contact || '').trim()) return fail('Le référent contacté est obligatoire — la diligence exige un contact tracé.');
      var tel = String(val.telephone || '').replace(/[^0-9]/g, '');
      if (!tel) return fail('Le téléphone du référent est obligatoire.');
      if (tel.length < 6) return fail('Numéro de téléphone trop court.');
      var drx = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      if (String(val.dateVerification || '').trim() && !drx.test(String(val.dateVerification).trim())) return fail('Format de date de vérification invalide (jj/mm/aaaa).');
      if (String(val.dateDecision || '').trim() && !drx.test(String(val.dateDecision).trim())) return fail('Format de date de décision invalide (jj/mm/aaaa).');
      if (val.decisionFinale && val.decisionFinale !== 'En attente decision' && !val.resultatGlobal) return fail('Renseignez d\u2019abord le résultat global avant la décision finale (diligence).');
      if (val.resultatGlobal === 'Defavorable' && val.decisionFinale === 'Embauche recommandee') return fail('Incohérence : un résultat défavorable ne peut pas déboucher sur une embauche recommandée.');
      var elems = toArray(val.elems);
      var rec = {
        candidat: String(val.candidat).trim(),
        posteVise: String(val.posteVise || '').trim(),
        entreprise: String(val.entreprise).trim(),
        contact: String(val.contact).trim(),
        telephone: String(val.telephone).trim(),
        canalContact: String(val.canalContact || '').trim(),
        verificateur: String(val.verificateur || '').trim(),
        dateVerification: String(val.dateVerification || '').trim() || todayFR(),
        statut: String(val.statut || '').trim() || 'Non démarrée',
        elementsVerifies: elems,
        resultatGlobal: String(val.resultatGlobal || '').trim(),
        decisionFinale: String(val.decisionFinale || '').trim(),
        dateDecision: String(val.dateDecision || '').trim(),
        detailsRetour: String(val.detailsRetour || '').trim(),
        suitesDonnees: String(val.suitesDonnees || '').trim(),
        notes: String(val.notes || '')
      };
      rec['posteVisé'] = rec.posteVise;
      if (editId) {
        mutate(function (cur) {
          cur.verifications = cur.verifications.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Vérification modifiée', rec.candidat);
        toast('Vérification mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var cp = {};
          for (var k2 in rec) cp[k2] = rec[k2];
          cp.id = nextId(cur.verifications);
          cp.numero = nextNumero(cur.verifications);
          cp.relances = [];
          cp.resultatChips = [];
          cur.verifications = cur.verifications.concat([cp]);
          return cur;
        }, 'Vérification créée', rec.candidat + ' · ' + rec.entreprise);
        toast('Vérification créée — ' + rec.candidat, 'ok');
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
      var cp = {};
      for (var k in r) if (['id', 'numero', 'sm', 'dernierContact', 'anciennete'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = nextId(cur.verifications);
      cp.numero = nextNumero(cur.verifications);
      cp.statut = 'Non démarrée';
      cp.resultatGlobal = '';
      cp.decisionFinale = '';
      cp.dateDecision = '';
      cp.detailsRetour = '';
      cp.suitesDonnees = '';
      cp.relances = [];
      cp.notes = '';
      cur.verifications = cur.verifications.concat([cp]);
      return cur;
    }, 'Vérification dupliquée', r.numero);
    toast('Vérification dupliquée (statut réinitialisé)', 'ok');
  }
  function closeConfirm() { $$('[data-avr="confirm"],[data-avr="backdrop"][data-avr-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'avr-confirm', 'data-avr': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette vérification ?</h4><p>' + esc(r.numero || r.id) + ' — ' + esc(r.candidat) + ' (' + esc(r.entreprise || '—') + '). Cette action est définitive.</p>' +
      '<div class="avr-confirm-row"><button class="avr-btn avr-btn-ghost" data-a="no" style="color:var(--avr-text);border-color:var(--avr-line)">Annuler</button>' +
      '<button class="avr-btn avr-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.verifications = cur.verifications.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Vérification supprimée', r.numero || String(r.id));
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Vérification supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' vérifications ?') : 'Supprimer 1 vérification ?';
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'avr-confirm', 'data-avr': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero || r.id); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="avr-confirm-row"><button class="avr-btn avr-btn-ghost" data-a="no" style="color:var(--avr-text);border-color:var(--avr-line)">Annuler</button>' +
      '<button class="avr-btn avr-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.verifications = cur.verifications.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' dossiers');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' vérifications supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= panneau diligence ================= */
  function closeDiligence() { $$('[data-avr="dil"],[data-avr="backdrop"][data-avr-for="dil"]').forEach(function (n) { n.remove(); }); }
  function openDiligence() {
    closeDiligence();
    var rows = data();
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'dil' });
    bd.addEventListener('click', closeDiligence);
    var p = h('div', { class: 'avr-panel', 'data-avr': 'dil', role: 'dialog', 'aria-label': 'Diligence et conformité' });
    var nb = rows.length;
    var nbFav = rows.filter(function (r) { return r.statut === 'Favorable' || r.resultatGlobal === 'Favorable'; }).length;
    var nbEnc = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var noc = rows.filter(function (r) { return !r.contact || !r.telephone; });
    var late = rows.filter(estEnRetard);
    var noconcl = rows.filter(function (r) { return !r.decisionFinale; });
    var negSansSuite = rows.filter(function (r) { return (r.statut === 'Defavorable' || r.resultatGlobal === 'Defavorable') && !r.suitesDonnees; });
    var fnv = finalistesNonVerifies();
    function dilRow(state, lab, sub, act) {
      var ic = state === 'ok' ? '✓' : state === 'ko' ? '✕' : '!';
      return '<div class="avr-dil-row ' + state + '" data-dil="' + act + '"><span class="avr-dil-state">' + ic + '</span>' +
        '<span><b>' + esc(lab) + '</b><br><span style="color:var(--avr-text2);font-size:.72rem">' + esc(sub) + '</span></span></div>';
    }
    var rows2 =
      dilRow(noc.length ? 'ko' : 'ok', 'Référents joignables', noc.length ? noc.length + ' dossier(s) sans contact ou téléphone' : 'Tous les dossiers ont un contact tracé', 'nocontact') +
      dilRow(late.length ? 'ko' : 'ok', 'Relances à jour (≤ ' + SEUILS.relanceJours + ' j)', late.length ? late.length + ' relance(s) requise(s)' : 'Aucun référent en attente au-delà du seuil', 'relance') +
      dilRow(noconcl.length ? 'warn' : 'ok', 'Conclusions écrites', noconcl.length ? noconcl.length + ' dossier(s) sans décision finale' : 'Tous les dossiers sont conclus', 'noconcl') +
      dilRow(negSansSuite.length ? 'ko' : 'ok', 'Défavorables traités', negSansSuite.length ? negSansSuite.length + ' résultat(s) défavorable(s) sans suites données' : 'Chaque défavorable a une suite tracée', 'neg') +
      dilRow(nb && (nbFav / nb * 100 >= SEUILS.tauxFavorableMin) ? 'ok' : 'warn', 'Taux de favorables ≥ ' + SEUILS.tauxFavorableMin + ' %', nb ? nbFav + '/' + nb + ' (' + pct(nbFav / nb * 100) + ')' : 'Aucun dossier', 'fav');
    var tip = '💡 ';
    if (nbEnc > 0) tip += nbEnc + ' vérification(s) encore en cours : aucune offre ne devrait partir avant leur conclusion. ';
    if (fnv.length) tip += fnv.length + ' finaliste(s) de la base candidats n\u2019a(ont) aucun dossier de vérification — créer le(s) dossier(s) avant l\u2019offre.';
    else if (nbEnc === 0 && nb > 0) tip += 'Toutes les vérifications sont closes : la diligence est à jour.';
    p.innerHTML = '<div class="avr-panel-head"><h3>Diligence & conformité — avant toute offre</h3><button class="avr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="avr-panel-body">' +
        '<div class="avr-sim-kpis"><span><b>' + nbFav + '</b> favorable(s) (' + pct(nb ? nbFav / nb * 100 : 0) + ')</span>' +
          '<span><b>' + nbEnc + '</b> en cours</span>' +
          '<span><b>' + late.length + '</b> à relancer</span>' +
          '<span><b>' + fnv.length + '</b> finaliste(s) non couvert(s)</span></div>' +
        rows2 +
        '<div class="avr-sim-tip" style="margin-top:10px">' + esc(tip) + '</div>' +
        '<p class="avr-cibles-note" style="margin-top:10px">Cliquez une ligne pour filtrer le tableau sur les dossiers concernés. Seuils modifiables (S).</p>' +
      '</div>';
    $('.avr-drawer-x', p).addEventListener('click', closeDiligence);
    $$('.avr-dil-row', p).forEach(function (d) {
      d.addEventListener('click', function () {
        var a = d.getAttribute('data-dil');
        resetFilters();
        if (a === 'nocontact') UI.kpi = 'nocontact';
        else if (a === 'relance') UI.kpi = 'relance';
        else if (a === 'noconcl') UI.kpi = 'noconcl';
        else if (a === 'neg') UI.statut = 'Defavorable';
        else if (a === 'fav') UI.kpi = 'fav';
        closeDiligence();
        refresh();
      });
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Diligence ouverte', '');
  }

  /* ================= panneau relances ================= */
  function closeRelances() { $$('[data-avr="relp"],[data-avr="backdrop"][data-avr-for="relp"]').forEach(function (n) { n.remove(); }); }
  function openRelances() {
    closeRelances();
    var rows = data().filter(function (r) { return r.statut === 'En cours' || r.statut === 'Non démarrée'; });
    rows.sort(function (a, b) { return joursSansContact(b) - joursSansContact(a); });
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'relp' });
    bd.addEventListener('click', closeRelances);
    var p = h('div', { class: 'avr-panel', 'data-avr': 'relp', role: 'dialog', 'aria-label': 'Contacts et relances' });
    var late = rows.filter(estEnRetard);
    var canaux = {};
    data().forEach(function (r) { var c = r.canalContact || (r.relances && r.relances.length ? r.relances[r.relances.length - 1].canal : ''); if (c) canaux[c] = (canaux[c] || 0) + 1; });
    var body = rows.length ? rows.map(function (r) {
      var j = joursSansContact(r);
      return '<div class="avr-rel-row' + (estEnRetard(r) ? ' avr-rel-late' : '') + '" data-id="' + esc(r.id) + '">' +
        '<b>' + esc(r.numero || r.id) + '</b><span>' + esc(r.candidat || '—') + ' → ' + esc(r.contact || 'référent à renseigner') + '</span>' +
        '<span class="avr-chip neutral">' + esc(r.canalContact || 'canal non défini') + '</span>' +
        '<span style="font-variant-numeric:tabular-nums">dernier contact : il y a ' + j + ' j</span>' +
        '<button class="avr-btn avr-btn-primary" data-rel="' + esc(r.id) + '" style="margin-left:auto">Relancer aujourd\u2019hui</button></div>';
    }).join('') : '<div class="avr-empty">Aucun dossier actif à relancer.</div>';
    p.innerHTML = '<div class="avr-panel-head"><h3>Contacts & relances — traçabilité des référents</h3><button class="avr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="avr-panel-body">' +
        '<div class="avr-sim-kpis"><span><b>' + late.length + '</b> relance(s) requise(s) (&gt; ' + SEUILS.relanceJours + ' j)</span>' +
          Object.keys(canaux).map(function (c) { return '<span><b>' + canaux[c] + '</b> via ' + esc(c) + '</span>'; }).join('') + '</div>' +
        body +
        '<p class="avr-cibles-note" style="margin-top:10px">Une relance trace la date, le canal et un compte rendu — cliquez une ligne pour ouvrir la fiche complète.</p>' +
      '</div>';
    $('.avr-drawer-x', p).addEventListener('click', closeRelances);
    $$('.avr-rel-row', p).forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('[data-rel]')) return;
        closeRelances();
        openDrawer(row.getAttribute('data-id'));
      });
    });
    $$('[data-rel]', p).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-rel');
        var r = rowById(id);
        if (!r) return;
        mutate(function (cur) {
          cur.verifications = cur.verifications.map(function (x) {
            if (String(x.id) === String(id)) {
              if (!Array.isArray(x.relances)) x.relances = [];
              x.relances.push({ date: todayFR(), canal: x.canalContact || 'Téléphone', note: 'Relance depuis le panneau relances' });
            }
            return x;
          });
          return cur;
        }, 'Relance enregistrée', r.numero + ' (' + (r.contact || 'référent') + ')');
        toast('Relance tracée — ' + r.numero, 'ok');
        closeRelances();
        openRelances();
      });
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Panneau relances ouvert', late.length + ' en retard');
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-avr="seuils"],[data-avr="backdrop"][data-avr-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'avr-panel', 'data-avr': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="avr-panel-head"><h3>Seuils de pilotage</h3><button class="avr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="avr-panel-body">' +
        '<p class="avr-cibles-note">Ces seuils alimentent les alertes, les couleurs et les filtres (Manuel D1 : diligence tracée, relances sans délai, conclusions écrites avant l\u2019offre).</p>' +
        '<div class="avr-sim-row"><label for="avr-s1">Relance référent après (jours)</label><input type="range" id="avr-s1" min="3" max="30" step="1" value="' + SEUILS.relanceJours + '"><input class="avr-in" type="number" min="1" max="60" step="1" data-avr="s1n" value="' + SEUILS.relanceJours + '"></div>' +
        '<div class="avr-sim-row"><label for="avr-s2">Conclusion maximum après (jours)</label><input type="range" id="avr-s2" min="7" max="120" step="1" value="' + SEUILS.delaiConclusion + '"><input class="avr-in" type="number" min="1" max="365" step="1" data-avr="s2n" value="' + SEUILS.delaiConclusion + '"></div>' +
        '<div class="avr-sim-row"><label for="avr-s3">Taux de favorables minimum (%)</label><input type="range" id="avr-s3" min="30" max="95" step="5" value="' + SEUILS.tauxFavorableMin + '"><input class="avr-in" type="number" min="0" max="100" step="1" data-avr="s3n" value="' + SEUILS.tauxFavorableMin + '"></div>' +
        '<div class="avr-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="avr-btn avr-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.avr-drawer-x', p).addEventListener('click', closeSeuils);
    [['avr-s1', 's1n', 'relanceJours', 3, 30, 1], ['avr-s2', 's2n', 'delaiConclusion', 7, 120, 1], ['avr-s3', 's3n', 'tauxFavorableMin', 30, 95, 5]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-avr="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.relanceJours = Math.max(3, Math.min(30, Number($('[data-avr="s1n"]', p).value) || SEUILS.relanceJours));
      SEUILS.delaiConclusion = Math.max(7, Math.min(120, Number($('[data-avr="s2n"]', p).value) || SEUILS.delaiConclusion));
      SEUILS.tauxFavorableMin = Math.max(30, Math.min(95, Number($('[data-avr="s3n"]', p).value) || SEUILS.tauxFavorableMin));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'relance > ' + SEUILS.relanceJours + ' j · conclusion ≤ ' + SEUILS.delaiConclusion + ' j · favorables ≥ ' + SEUILS.tauxFavorableMin + ' %');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-avr="journal"],[data-avr="backdrop"][data-avr-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'avr-backdrop', 'data-avr': 'backdrop', 'data-avr-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'avr-panel', 'data-avr': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="avr-panel-head"><h3>Journal d\u2019activité</h3><button class="avr-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="avr-panel-body" data-avr="jlist"></div>';
    $('.avr-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-avr="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="avr-jrow"><span class="avr-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="avr-jact">' + esc(x.action || '') + '</span><span class="avr-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="avr-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Vérif', 'Candidat', 'Poste visé', 'Entreprise', 'Référent', 'Téléphone', 'Canal', 'Vérificateur', 'Date vérification', 'Statut', 'Éléments vérifiés', 'Résultat global', 'Décision finale', 'Date décision', 'Détails / retour', 'Suites données', 'Notes', 'Relances (n)', 'Dernier contact', 'Dernière relance'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var lastRel = (r.relances || []).slice().sort(function (a, b) { return dateKey(b.date) - dateKey(a.date); })[0];
      var cells = [r.numero || r.id, r.candidat, r.posteVise, r.entreprise, r.contact, r.telephone, r.canalContact, r.verificateur, jDate(r.dateVerification), r.statut, (r.elementsVerifies || []).join(' / '), r.resultatGlobal, r.decisionFinale, jDate(r.dateDecision), r.detailsRetour, r.suitesDonnees, r.notes, (r.relances || []).length, jDate(r.dernierContact), lastRel ? (jDate(lastRel.date) + ' (' + (lastRel.canal || '') + ')') : ''];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-verifications-references-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeDiligence(); closeRelances(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-avr="dialog"]') || $('[data-avr="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { openDiligence(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { openRelances(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { UI.view = 'cards'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-avr="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle · E export · J journal · P diligence · C relances · S seuils · K cartes · T tableau · / recherche', ''); }
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
    var root = $('[data-avr="root"]');
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

  /* ================= résilience API ================= */
  var API_MAX = 30;
  var apiTries = 0, lsFallback = false, apiTimer = null, subAttached = false;
  function attachSub() {
    if (subAttached) return;
    var a = api();
    if (a && typeof a.subscribe === 'function') {
      subAttached = true;
      try { a.subscribe(function () { scheduleRefresh(); }); } catch (e) {}
    }
  }
  function ensureApiRetry() {
    if (apiTimer) return;
    apiTimer = setInterval(function () {
      apiTries++;
      if (api()) { attachSub(); clearInterval(apiTimer); apiTimer = null; if (active) refresh(); return; }
      if (apiTries >= API_MAX) {
        clearInterval(apiTimer); apiTimer = null;
        lsFallback = true;
        jlog('Mode local activé', 'API __ADMINA_VREF_API__ absente après ' + API_MAX + ' réessais');
        if (lsRead().length && conteneurNatif()) { toast('API native indisponible — mode local (localStorage) activé', 'warn'); if (active) refresh(); }
        else toast('API native indisponible — page native conservée', 'warn');
      }
    }, 700);
  }

  /* ================= refresh global ================= */
  var shellBuilt = false;
  function buildShellOnce() { if (!shellBuilt) { buildShell(); shellBuilt = true; } }
  function refresh() {
    if (!isOn()) return;
    var rootv = $('[data-avr="root"]');
    var natifv = conteneurNatif();
    if (rootv && rootv.style.display === 'none' && natifv && natifv.style.display !== 'none') return;
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
    if (!document.querySelector('[data-avr="drawer"],[data-avr="dialog"],[data-avr="confirm"],[data-avr="journal"],[data-avr="dil"],[data-avr="relp"],[data-avr="seuils"]')) {
      $$('[data-avr="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-avr');
    shellBuilt = false;
    loadUI();
    ensureApiRetry();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-avr]') || t.closest('#avr-stsel') || t.closest('#avr-relform'))) continue;
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
    html.classList.remove('admina-avr');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeDiligence(); closeRelances(); closeSeuils();
    UI.sel = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-avr="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-avr-hide', '1');
      natif.setAttribute('data-avr-olddisp', natif.style.display || '');
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

  window.__ADMINA_VREF_UI__ = {
    version: '1.0-w1',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    exportCSV: exportCSV,
    openDiligence: openDiligence,
    openRelances: openRelances,
    openJournal: openJournal
  };
  try { console.info('[ADMINA_VREF] W1-c actif — Centre de pilotage Vérification des Références /verification-references'); } catch (e) {}
})();
