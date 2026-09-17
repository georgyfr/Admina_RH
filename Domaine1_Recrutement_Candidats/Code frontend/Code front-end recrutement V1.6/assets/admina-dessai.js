/* =============================================================
   Admina-RH — Périodes d'Essai (/periode-dessai) — couche admina
   W2-e : CENTRE DE PILOTAGE — ÉCHÉANCIER DES PÉRIODES D'ESSAI
   -------------------------------------------------------------
   PHILOSOPHIE — /periode-dessai est le TEMPS DE L'ÉPREUVE MUTUELLE.
   Chaque période d'essai porte des échéances contractuelles FERMES :
   une date de fin, un délai de prévenance pour rompre à temps, des
   renouvellements plafonnés — et une question finale : confirmer,
   renouveler ou rompre. La page n'est ni une timeline de bienveillance
   (plan d'accueil) ni un planning d'activités : c'est une SURVEILLANCE
   D'ÉCHÉANCES avec réveils. L'urgence légale y est structurante :
   approcher d'une date de fin sans décision est un risque qui doit
   remonter en alerte ; la décision (confirmation / renouvellement /
   rupture) doit être prise À TEMPS, documentée et datée ; les
   compteurs J-restants sont omniprésents — dans le héro, la table,
   les cartes, la frise et le drawer. Signature de la page : la VUE
   ÉCHÉANCIER, frise horizontale des semaines à venir où chaque fin
   de période se pose comme une pastille colorée par l'urgence, qui
   ouvre la fiche et sa décision rapide.
   -------------------------------------------------------------
   - Scope strict : /periode-dessai (RegExp /\/periode-dessai\/?$/)
   - Idempotent (data-ade / data-ade-hide), sans collision (__ADMINA_ADE_W2__)
   - Données : window.__ADMINA_ADE_API__ (patch chunk W2-e, pont
     bidirectionnel localStorage admina-dessai-data) → fallback
     localStorage si l'API tarde (30 réessais au boot, sinon page
     native intacte)
   - Journal : window.__ADMINA_AUDIT__ (SPA D1) → fallback admina_journal
   - Canon : admina-basecand.js (M25) transposé abc→ade
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_ADE_W2__) return;
  window.__ADMINA_ADE_W2__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/periode-dessai\/?$/;
  var LS_DATA = 'admina-dessai-data';
  var LS_UI = 'admina-dessai-ui';
  var LS_SEUILS = 'admina-dessai-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', dec: '', dep: '', type: '', dur: '', urg: '', kpi: '', view: 'table', sortKey: 'jrest', sortDir: 1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, cmp: [], echWeeks: 8, echAnchor: 0 };

  /* ================= seuils ================= */
  var SEUILS_DEF = { alerteJ: 21, prevenance: 8, noteFaible: 12 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var DECISIONS = [
    { k: 'En cours', lab: 'En cours', c: '#d97706', f: 'f1' },
    { k: 'Embauche confirmee', lab: 'Embauche confirmée', c: '#059669', f: 'f2' },
    { k: 'Prolongation essai', lab: 'Prolongation essai', c: '#0891b2', f: 'f3' },
    { k: 'Rupture essai', lab: 'Rupture essai', c: '#dc2626', f: 'f4' }
  ];
  function decMeta(k) { for (var i = 0; i < DECISIONS.length; i++) { if (DECISIONS[i].k === k) return DECISIONS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8', f: 'f1' }; }
  /* rang de décision : à trancher d'abord, confirmée en dernier */
  var DEC_RANK = { 'En cours': 0, 'Prolongation essai': 1, 'Rupture essai': 2, 'Embauche confirmee': 3 };
  var TYPES = ['CDI', 'CDD', 'Stage', 'Interim'];
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var DUREES_B = [
    { k: 'b60', lab: '\u2264 60 jours', test: function (d) { return d <= 60; } },
    { k: 'b90', lab: '61 \u2013 90 jours', test: function (d) { return d > 60 && d <= 90; } },
    { k: 'b120', lab: '91 \u2013 120 jours', test: function (d) { return d > 90 && d <= 120; } },
    { k: 'b121', lab: '&gt; 120 jours', test: function (d) { return d > 120; } }
  ];
  function dureeBucket(d) { for (var i = 0; i < DUREES_B.length; i++) { if (DUREES_B[i].test(d)) return DUREES_B[i].k; } return 'b120'; }
  function dureeLab(k) { for (var i = 0; i < DUREES_B.length; i++) { if (DUREES_B[i].k === k) return DUREES_B[i].lab; } return '—'; }

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
  function fmtTs(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear();
  }
  function todayMid() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysUntil(s) {
    var t = tsOf(s);
    if (!t) return 0;
    return Math.round((t - todayMid()) / 86400000);
  }
  function daysSince(s) {
    var t = tsOf(s);
    if (!t) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
  function datePlusDays(s, n) {
    var t = tsOf(s);
    if (!t) return '';
    return fmtTs(t + n * 86400000);
  }
  function todayFR() { return fmtTs(todayMid()); }
  function weekStartOf(ms) {
    var d = new Date(ms);
    var day = (d.getUTCDay() + 6) % 7; /* lundi = 0 */
    var base = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return base - day * 86400000;
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
  function toastsZone() { var z = $('[data-ade="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-ade', 'toasts'); z.className = 'ade-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'ade-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_ADE_API__ || null; }
  function lsRead() {
    try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; }
  }
  function lsWrite(d) { try { localStorage.setItem(LS_DATA, JSON.stringify(d)); } catch (e) {} }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.periodes) { d = lsRead(); }
    if (!d || !d.periodes || !d.periodes.length) return [];
    return d.periodes.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = Number(u.id) || 0;
      u.duree = Number(u.duree) || 0;
      u.noteGlobale = Number(u.noteGlobale) || 0;
      u.scoreMiParcours = u.scoreMiParcours == null || u.scoreMiParcours === '' ? null : Number(u.scoreMiParcours) || 0;
      u.scoreFinal = u.scoreFinal == null || u.scoreFinal === '' ? null : Number(u.scoreFinal) || 0;
      u.renouvellements = Number(u.renouvellements) || (u.decision === 'Prolongation essai' ? 1 : 0);
      u.plafondRenouv = Number(u.plafondRenouv) || 1;
      u.prevenance = Number(u.prevenance) || SEUILS.prevenance;
      u.motif = String(u.motif || '');
      u.dm = decMeta(u.decision);
      u.jRest = daysUntil(u.dateFinEssai);
      u.plafondAtteint = u.renouvellements >= u.plafondRenouv;
      u.motifDoc = u.motif || (u.decision === 'Rupture essai' ? String(u.notes || '').trim() : '');
      u.prog = progression(u);
      u.urg = urgOf(u);
      return u;
    });
  }
  function progression(u) {
    var d = tsOf(u.dateDebutEssai), f = tsOf(u.dateFinEssai);
    if (!d || !f || f <= d) return u.jRest < 0 ? 100 : 0;
    var p = Math.round((todayMid() - d) / (f - d) * 100);
    return Math.max(0, Math.min(100, p));
  }
  /* urgence : far = décision prise · ok = au-delà du seuil · warn = < seuil ·
     crit = délai de prévenance entamé · dep = échéance dépassée sans décision */
  function urgOf(u) {
    if (u.decision !== 'En cours') return 'far';
    if (u.jRest < 0) return 'dep';
    if (u.jRest <= u.prevenance) return 'crit';
    if (u.jRest <= SEUILS.alerteJ) return 'warn';
    return 'ok';
  }
  function urgBase(k) { return { dep: 0, crit: 1, warn: 2, ok: 3, far: 4 }[k] != null ? { dep: 0, crit: 1, warn: 2, ok: 3, far: 4 }[k] : 9; }
  function jLab(u) {
    if (u.decision !== 'En cours') return { lab: '—', tone: 'far', title: 'Décision enregistrée : ' + decMeta(u.decision).lab };
    if (u.jRest < 0) return { lab: 'J+' + Math.abs(u.jRest), tone: 'dep', title: 'Échéance dépassée de ' + Math.abs(u.jRest) + ' j sans décision' };
    if (u.jRest === 0) return { lab: "J-0", tone: 'dep', title: 'La période se termine aujourd\u2019hui' };
    return { lab: 'J-' + u.jRest, tone: u.urg, title: u.jRest + ' jour(s) avant la fin de période' };
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function essNum(r) {
    var m = /^ESS-(\d+)$/.exec(String(r.numero || ''));
    return Math.max(Number(r.id) || 0, m ? Number(m[1]) : 0);
  }
  function nextNumero(rows) {
    var mx = rows.reduce(function (m, r) { return Math.max(m, essNum(r)); }, 0) + 1;
    return { id: mx, numero: 'ESS-' + String(mx).padStart(3, '0') };
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.periodes) {
        /* API présente mais vide → fallback LS direct */
        cur = lsRead() || { periodes: [] };
        if (!cur.periodes) cur.periodes = [];
        var nv = fn(cur);
        lsWrite(nv);
        if (actionLabel) jlog(actionLabel, detail || '');
        refresh();
        setTimeout(refresh, 80);
        setTimeout(refresh, 350);
        return true;
      }
      var nv2 = fn(cur);
      a.setData(nv2);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct : le module reste fonctionnel même sans patch */
    var cur2 = lsRead() || { periodes: [] };
    if (!cur2.periodes) cur2.periodes = [];
    var nv3 = fn(cur2);
    lsWrite(nv3);
    if (actionLabel) jlog(actionLabel, detail || '');
    refresh();
    setTimeout(refresh, 80);
    setTimeout(refresh, 350);
    return true;
  }

  /* ================= alertes ================= */
  function selStore() {
    try { var a = window.__ADMINA_SEL_API__; if (a && typeof a.getData === 'function') { var d = a.getData(); if (d && d.selections && d.selections.length) return d.selections; } } catch (e) {}
    return [];
  }
  function candStore() {
    try { var a = window.__ADMINA_CAND_API__; if (a && typeof a.getData === 'function') { var d = a.getData(); if (d && d.candidats && d.candidats.length) return d.candidats; } } catch (e) {}
    return [];
  }
  function computeAlerts(rows) {
    var out = [];
    var enc = rows.filter(function (r) { return r.decision === 'En cours'; });
    /* 1 — fin de période proche (< seuil) sans décision */
    var fin = enc.filter(function (r) { return r.jRest >= 0 && r.jRest <= SEUILS.alerteJ; });
    if (fin.length) {
      var worst = fin.slice().sort(function (a, b) { return a.jRest - b.jRest; })[0];
      out.push({ tone: 'err', txt: fin.length + ' fin(s) de période à moins de ' + SEUILS.alerteJ + ' j sans décision — la plus urgente : ' + worst.numero + ' ' + worst.employe + ' (J-' + worst.jRest + ')', f: 'fin' });
    }
    /* 2 — délai de prévenance dépassé : rompre à temps n'est plus possible */
    var prev = enc.filter(function (r) { return r.jRest < r.prevenance; });
    if (prev.length) {
      var w2 = prev.slice().sort(function (a, b) { return a.jRest - b.jRest; })[0];
      out.push({ tone: 'err', txt: prev.length + ' période(s) en cours sous le délai de prévenance (' + SEUILS.prevenance + ' j) — toute rupture à l\u2019échéance est hors délai, décider maintenant (' + w2.numero + ' ' + w2.employe + ')', f: 'prev' });
    }
    /* 3 — période terminée sans décision enregistrée */
    var nodec = enc.filter(function (r) { return r.jRest < 0; });
    if (nodec.length) {
      var w3 = nodec.slice().sort(function (a, b) { return a.jRest - b.jRest; })[0];
      out.push({ tone: 'err', txt: nodec.length + ' période(s) terminée(s) sans décision enregistrée — statut juridique flou, à régulariser (' + w3.numero + ' ' + w3.employe + ', J+' + Math.abs(w3.jRest) + ')', f: 'nodec' });
    }
    /* 4 — renouvellement au plafond, en attente de validation définitive */
    var plaf = rows.filter(function (r) { return r.decision === 'Prolongation essai' && r.plafondAtteint; });
    if (plaf.length) {
      out.push({ tone: 'warn', txt: plaf.length + ' renouvellement(s) au plafond (' + plaf[0].renouvellements + '/' + plaf[0].plafondRenouv + ') en attente de validation — confirmer ou rompre avant la nouvelle échéance (' + plaf.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'renouv' });
    }
    /* 5 — rupture sans motif documenté */
    var nomot = rows.filter(function (r) { return r.decision === 'Rupture essai' && !r.motifDoc; });
    if (nomot.length) {
      out.push({ tone: 'warn', txt: nomot.length + ' rupture(s) sans motif documenté — la décision doit être justifiée et traçable (' + nomot.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'nomotif' });
    }
    /* croisement optionnel __ADMINA_SEL_API__ (silencieux si absent) :
       embauche confirmée sans sélection « Retenu » tracée en amont */
    var sel = selStore();
    if (sel.length) {
      var retenus = {};
      sel.forEach(function (s) { if (s && s.statut === 'Retenu') retenus[norm(s.candidat)] = 1; });
      var orph = rows.filter(function (r) { return r.decision === 'Embauche confirmee' && !retenus[norm(r.employe)]; });
      if (orph.length) out.push({ tone: 'info', txt: orph.length + ' confirmation(s) d\u2019embauche sans sélection « Retenu » tracée dans /selections (' + orph.slice(0, 2).map(function (r) { return r.numero; }).join(', ') + ')', f: 'sel' });
    }
    /* croisement optionnel __ADMINA_CAND_API__ (silencieux si absent) :
       période en cours sans candidat connu dans la base */
    var cand = candStore();
    if (cand.length) {
      var connus = {};
      cand.forEach(function (c) { var n = norm((c.prenom || '') + ' ' + (c.nom || '')); if (n) connus[n] = 1; });
      var inconnus = enc.filter(function (r) { return !connus[norm(r.employe)]; });
      if (inconnus.length) out.push({ tone: 'info', txt: inconnus.length + ' période(s) en cours pour un employé absent de la base candidats — vérifier la traçabilité du recrutement (' + inconnus.slice(0, 2).map(function (r) { return r.employe; }).join(', ') + ')', f: 'cand' });
    }
    return out.slice(0, 5);
  }

  /* ================= filtres / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.dec && r.decision !== UI.dec) return false;
      if (UI.dep && norm(r.departement) !== norm(UI.dep)) return false;
      if (UI.type && norm(r.typeContrat) !== norm(UI.type)) return false;
      if (UI.dur && dureeBucket(r.duree) !== UI.dur) return false;
      if (UI.urg === 'pas' && !(r.decision === 'En cours' && r.jRest < 0)) return false;
      if (UI.urg === 'prev' && !(r.decision === 'En cours' && r.jRest < r.prevenance)) return false;
      if (UI.urg === 'seuil' && !(r.decision === 'En cours' && r.jRest >= 0 && r.jRest <= SEUILS.alerteJ)) return false;
      if (UI.urg === 'plaf' && !(r.decision === 'Prolongation essai' && r.plafondAtteint)) return false;
      if (UI.urg === 'mot' && !(r.decision === 'Rupture essai' && !r.motifDoc)) return false;
      if (UI.urg === 'calme' && !(r.urg === 'ok' || r.urg === 'far')) return false;
      if (UI.kpi === 'enc' && r.decision !== 'En cours') return false;
      if (UI.kpi === 'ech' && !(r.decision === 'En cours' && r.jRest <= SEUILS.alerteJ)) return false;
      if (UI.kpi === 'att' && !(r.decision === 'En cours' && r.noteGlobale >= SEUILS.noteFaible)) return false;
      if (UI.kpi === 'ok' && r.decision !== 'Embauche confirmee') return false;
      if (q && !(norm(r.numero).indexOf(q) > -1 || norm(r.employe).indexOf(q) > -1 || norm(r.poste).indexOf(q) > -1 || norm(r.departement).indexOf(q) > -1 || norm(r.evaluateur).indexOf(q) > -1 || norm(r.objectifsFixes).indexOf(q) > -1 || norm(r.notes).indexOf(q) > -1 || norm(r.motif).indexOf(q) > -1 || norm(r.typeContrat).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'jrest') { va = urgBase(a.urg) * 10000000 + (tsOf(a.dateFinEssai) || 0); vb = urgBase(b.urg) * 10000000 + (tsOf(b.dateFinEssai) || 0); }
      else if (k === 'fin') { va = dateKey(a.dateFinEssai); vb = dateKey(b.dateFinEssai); }
      else if (k === 'deb') { va = dateKey(a.dateDebutEssai); vb = dateKey(b.dateDebutEssai); }
      else if (k === 'dur') { va = a.duree; vb = b.duree; }
      else if (k === 'ren') { va = a.renouvellements; vb = b.renouvellements; }
      else if (k === 'note') { va = a.noteGlobale; vb = b.noteGlobale; }
      else if (k === 'dec') { va = DEC_RANK[a.decision] != null ? DEC_RANK[a.decision] : 9; vb = DEC_RANK[b.decision] != null ? DEC_RANK[b.decision] : 9; }
      else if (k === 'dep') { va = norm(a.departement); vb = norm(b.departement); }
      else if (k === 'type') { va = norm(a.typeContrat); vb = norm(b.typeContrat); }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.dec ? 1 : 0) + (UI.dep ? 1 : 0) + (UI.type ? 1 : 0) + (UI.dur ? 1 : 0) + (UI.urg ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.dec = ''; UI.dep = ''; UI.type = ''; UI.dur = ''; UI.urg = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/^P[ée]riodes\s+d['’]Essai\s*$/i.test((hs[i].textContent || '').trim())) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-ade="root"]');
    if (!root) {
      root = h('section', { 'data-ade': 'root', class: 'ade-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-ade-page')) {
      page.setAttribute('data-ade-page', '1');
      page.setAttribute('data-ade-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-ade-hide')) {
      natif.setAttribute('data-ade-hide', '1');
      natif.setAttribute('data-ade-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-ade="root"]'); if (root) root.remove();
    $$('[data-ade-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-ade-oldw') || '';
      n.removeAttribute('data-ade-page');
      n.removeAttribute('data-ade-oldw');
    });
    $$('[data-ade-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-ade-olddisp') || '';
      n.removeAttribute('data-ade-hide');
      n.removeAttribute('data-ade-olddisp');
    });
    $$('[data-ade]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-ade="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'ade-btn ade-btn-primary ade-backbtn', 'data-ade': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'periode-dessai');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    ech: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="9" cy="15" r="1.6" fill="currentColor" stroke="none"/><circle cx="14" cy="17.5" r="1.6" fill="currentColor" stroke="none"/></svg>',
    alarm: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 2"/><path d="M5 3 2 6M19 3l3 3"/></svg>',
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
    clock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  };
  var CLOCK_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/><path d="M12 3v2"/></svg>';

  function buildShell() {
    var root = $('[data-ade="root"]');
    if (!root || $('[data-ade="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="ade-hero" data-ade="hero">' +
        '<div class="ade-hero-main">' +
          '<div class="ade-hero-title">' +
            '<span class="ade-hero-ico" aria-hidden="true">' + CLOCK_ICON + '</span>' +
            '<div><h2 class="ade-h2">Centre de pilotage — Périodes d\u2019Essai</h2>' +
            '<p class="ade-hero-sub" data-ade="herosub"></p></div>' +
          '</div>' +
          '<div class="ade-hero-actions">' +
            '<button class="ade-btn" data-ade="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="ade-btn" data-ade="btn-ech" title="Vue échéancier (P)">' + ICO.ech + 'Échéancier</button>' +
            '<button class="ade-btn" data-ade="btn-seuils" title="Seuils d\u2019alerte (S)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="ade-btn" data-ade="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="ade-btn" data-ade="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="ade-btn ade-btn-primary" data-ade="btn-new" title="Nouvelle période (N)">' + ICO.plus + 'Nouvelle période</button>' +
          '</div>' +
        '</div>' +
        '<div class="ade-hero-alerts" data-ade="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="ade-kpis" data-ade="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="ade-charts" data-ade="charts">' +
        '<div class="ade-chart-card"><div class="ade-chart-title">Décisions de fin de période</div><div class="ade-donut-wrap" data-ade="donut"></div></div>' +
        '<div class="ade-chart-card"><div class="ade-chart-title" data-ade="ech-title">Échéances à trancher par semaine</div><div class="ade-bars" data-ade="bars-ech"></div></div>' +
        '<div class="ade-chart-card"><div class="ade-chart-title">Durées de période</div><div class="ade-bars" data-ade="bars-dur"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="ade-toolbar" data-ade="toolbar">' +
        '<div class="ade-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (employé, poste, département, évaluateur…)" data-ade="search" aria-label="Rechercher une période d\u2019essai" /></div>' +
        '<select data-ade="f-dec" class="ade-sel" aria-label="Filtrer par décision"></select>' +
        '<select data-ade="f-dep" class="ade-sel" aria-label="Filtrer par département"></select>' +
        '<select data-ade="f-type" class="ade-sel" aria-label="Filtrer par type de contrat"></select>' +
        '<select data-ade="f-dur" class="ade-sel" aria-label="Filtrer par durée"></select>' +
        '<select data-ade="f-urg" class="ade-sel" aria-label="Filtrer par urgence"></select>' +
        '<button class="ade-chipbtn" data-ade="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="ade-count" data-ade="count"></span>' +
        '<div class="ade-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="ade-vbtn" data-ade="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="ade-vbtn" data-ade="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
          '<button class="ade-vbtn" data-ade="v-ech" title="Vue échéancier (P)">' + ICO.alarm + 'Échéancier</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-ade="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-ade="selbar"></div>' +

      /* PIED */
      '<div class="ade-foot">Échéancier contractuel local (navigateur) — conforme Manuel D1 (périodes d\u2019essai, prévenance, renouvellements plafonnés) · journal d\u2019audit actif · seuils configurables · <button class="ade-link" data-ade="btn-native">Afficher le tableau natif</button></div>';

    $('[data-ade="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-ade="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-ade="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'periode-dessai'); window.print(); });
    $('[data-ade="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-ade="btn-ech"]', root).addEventListener('click', function () { UI.view = 'ech'; saveUI(); refresh(); });
    $('[data-ade="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-ade="btn-native"]', root).addEventListener('click', showNative);
    $('[data-ade="btn-reset"]', root).addEventListener('click', function () { resetFilters(); var si = $('[data-ade="search"]', root); if (si) si.value = ''; refresh(); });
    $('[data-ade="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-ade="f-dec"]', root).addEventListener('change', function (e) { UI.dec = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-ade="f-dep"]', root).addEventListener('change', function (e) { UI.dep = e.target.value; UI.page = 0; refresh(); });
    $('[data-ade="f-type"]', root).addEventListener('change', function (e) { UI.type = e.target.value; UI.page = 0; refresh(); });
    $('[data-ade="f-dur"]', root).addEventListener('change', function (e) { UI.dur = e.target.value; UI.page = 0; refresh(); });
    $('[data-ade="f-urg"]', root).addEventListener('change', function (e) { UI.urg = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-ade="v-table"]', root).addEventListener('click', function () { UI.view = 'table'; saveUI(); refresh(); });
    $('[data-ade="v-cards"]', root).addEventListener('click', function () { UI.view = 'cards'; saveUI(); refresh(); });
    $('[data-ade="v-ech"]', root).addEventListener('click', function () { UI.view = 'ech'; saveUI(); refresh(); });
  }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var enc = rows.filter(function (r) { return r.decision === 'En cours'; });
    var ech = enc.filter(function (r) { return r.jRest <= SEUILS.alerteJ; });
    var att = enc.filter(function (r) { return r.noteGlobale >= SEUILS.noteFaible; });
    var evals = rows.filter(function (r) { return r.noteGlobale > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.noteGlobale; }, 0) / evals.length) : 0;
    var sub = rows.length + ' période' + (rows.length > 1 ? 's' : '') +
      ' · ' + enc.length + ' en cours' +
      ' · ' + ech.length + ' échéance' + (ech.length > 1 ? 's' : '') + ' < ' + SEUILS.alerteJ + ' j' +
      ' · ' + att.length + ' confirmation' + (att.length > 1 ? 's' : '') + ' en attente' +
      ' · note moyenne ' + (evals.length ? moy.toFixed(1) : '—') + '/20';
    $('[data-ade="herosub"]').textContent = sub;
    var zone = $('[data-ade="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="ade-alert ' + a.tone + '" data-ade="alert" data-f="' + a.f + '">' + ICO.alarm + ' ' + esc(a.txt) + '</button>';
    }).join('');
    $$('.ade-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        if (f === 'fin') UI.kpi = 'ech';
        else if (f === 'prev') UI.urg = 'prev';
        else if (f === 'nodec') UI.urg = 'pas';
        else if (f === 'renouv') UI.urg = 'plaf';
        else if (f === 'nomotif') UI.urg = 'mot';
        else if (f === 'sel') UI.kpi = 'ok';
        else if (f === 'cand') { UI.kpi = ''; UI.dec = 'En cours'; }
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var enc = rows.filter(function (r) { return r.decision === 'En cours'; });
    var ech = enc.filter(function (r) { return r.jRest <= SEUILS.alerteJ; });
    var att = enc.filter(function (r) { return r.noteGlobale >= SEUILS.noteFaible; });
    var ok = rows.filter(function (r) { return r.decision === 'Embauche confirmee'; });
    var evals = rows.filter(function (r) { return r.noteGlobale > 0; });
    var moy = evals.length ? evals.reduce(function (s, r) { return s + r.noteGlobale; }, 0) / evals.length : 0;
    var deps = {}; var types = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; if (r.typeContrat) types[r.typeContrat] = 1; });
    var kpis = [
      { k: '', t: 'PÉRIODES', v: String(nb), s: Object.keys(deps).length + ' départements · ' + Object.keys(types).length + ' types', cls: '' },
      { k: 'enc', t: 'EN COURS', v: String(enc.length), s: 'décision finale à préparer', cls: enc.length ? '' : 'good' },
      { k: 'ech', t: 'ÉCHÉANCES < ' + SEUILS.alerteJ + 'J', v: String(ech.length), s: 'sans décision — risque à lever', cls: ech.length ? 'bad' : '' },
      { k: 'att', t: 'CONFIRMATIONS EN ATTENTE', v: String(att.length), s: 'note ≥ ' + SEUILS.noteFaible + '/20, décision non prise', cls: '' },
      { k: 'ok', t: 'CONFIRMÉES', v: String(ok.length), s: 'taux de confirmation ' + pct(nb ? ok.length / nb * 100 : 0), cls: '' },
      { k: '', t: 'NOTE MOYENNE', v: (evals.length ? moy.toFixed(1) : '—') + '/20', s: 'sur ' + evals.length + ' évaluée' + (evals.length > 1 ? 's' : ''), cls: '' }
    ];
    var zone = $('[data-ade="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="ade-kpi' + (k.cls ? ' ' + k.cls : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="ade-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="ade-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="ade-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.ade-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.dec = ''; UI.dep = ''; UI.type = ''; UI.dur = ''; UI.urg = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Décisions de fin de période">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">périodes</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-ade="donut"]');
    var parts = DECISIONS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.decision === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="ade-donut-legend">' + parts.map(function (p) {
        return '<span class="ade-dl-item' + (UI.dec === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="ade-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="ade-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.ade-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.dec = UI.dec === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (mx <= 0) return '<div class="ade-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="ade-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="ade-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="ade-bar-track"><span class="ade-bar-fill' + (it.hot ? ' hot' : '') + '" style="width:' + w + '%"></span></span>' +
        '<span class="ade-bar-val">' + it.v + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    /* graphique 2 — échéances à trancher par semaine (fenêtre de l'échéancier) */
    var zone = $('[data-ade="bars-ech"]');
    var weeks = UI.echWeeks || 8;
    var anchor = UI.echAnchor || weekStartOf(Date.now());
    var aTrancher = rows.filter(function (r) { return r.decision === 'En cours' || r.decision === 'Prolongation essai'; });
    var items = [];
    for (var i = 0; i < weeks; i++) {
      var ws = anchor + i * 7 * 86400000;
      var we = ws + 6 * 86400000;
      var n = aTrancher.filter(function (r) { var t = tsOf(r.dateFinEssai); return t >= ws && t <= we; }).length;
      items.push({ key: String(ws), name: 'sem. du ' + fmtTs(ws), v: n, hot: n > 0 });
    }
    var tit = $('[data-ade="ech-title"]');
    if (tit) tit.textContent = 'Échéances à trancher par semaine (' + weeks + ' sem. → ' + fmtTs(anchor + (weeks - 1) * 7 * 86400000) + ')';
    zone.innerHTML = barRowsHtml(items);
    $$('.ade-bar-row', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        UI.view = 'ech';
        UI.echAnchor = Number(b.getAttribute('data-key')) || anchor;
        saveUI();
        refresh();
      });
    });
    /* graphique 3 — durées de période */
    var z2 = $('[data-ade="bars-dur"]');
    var items2 = DUREES_B.map(function (b) {
      return { key: b.k, name: b.lab.replace('&gt;', '>'), v: rows.filter(function (r) { return dureeBucket(r.duree) === b.k; }).length };
    });
    z2.innerHTML = barRowsHtml(items2);
    $$('.ade-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.dur = UI.dur === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var deps = {};
    rows.forEach(function (r) { if (r.departement) deps[r.departement] = 1; });
    var sel = $('[data-ade="f-dec"]');
    sel.innerHTML = '<option value="">Décision : toutes</option>' + DECISIONS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.dec === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-ade="f-dep"]');
    sel2.innerHTML = '<option value="">Département : tous</option>' + Object.keys(deps).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.dep === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-ade="f-type"]');
    sel3.innerHTML = '<option value="">Contrat : tous</option>' + TYPES.map(function (n) {
      return '<option value="' + esc(n) + '"' + (UI.type === n ? ' selected' : '') + '>' + esc(n) + '</option>';
    }).join('');
    var sel4 = $('[data-ade="f-dur"]');
    sel4.innerHTML = '<option value="">Durée : toutes</option>' + DUREES_B.map(function (b) {
      return '<option value="' + b.k + '"' + (UI.dur === b.k ? ' selected' : '') + '>' + b.lab + '</option>';
    }).join('');
    var sel5 = $('[data-ade="f-urg"]');
    sel5.innerHTML = '<option value="">Urgence : toutes</option>' +
      '<option value="seuil"' + (UI.urg === 'seuil' ? ' selected' : '') + '>Fin &lt; ' + SEUILS.alerteJ + ' j sans décision</option>' +
      '<option value="prev"' + (UI.urg === 'prev' ? ' selected' : '') + '>Délai de prévenance dépassé</option>' +
      '<option value="pas"' + (UI.urg === 'pas' ? ' selected' : '') + '>Terminée sans décision</option>' +
      '<option value="plaf"' + (UI.urg === 'plaf' ? ' selected' : '') + '>Renouvellement au plafond</option>' +
      '<option value="mot"' + (UI.urg === 'mot' ? ' selected' : '') + '>Rupture sans motif</option>' +
      '<option value="calme"' + (UI.urg === 'calme' ? ' selected' : '') + '>Sans urgence</option>';
    $('[data-ade="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-ade="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' périodes';
  }

  function decChip(r) {
    var dm = r.dm || decMeta(r.decision);
    return '<span class="ade-chip st" style="background:' + dm.c + '18;border-color:' + dm.c + '66;color:' + dm.c + '" title="' + esc(dm.lab) + '">' + esc(dm.lab) + '</span>';
  }

  function jbCell(r) {
    var j = jLab(r);
    return '<span class="ade-jb ' + j.tone + '" title="' + esc(j.title) + '">' + esc(j.lab) + '</span>';
  }

  function progCell(r) {
    var late = r.jRest < 0 && r.decision === 'En cours';
    return '<span style="display:inline-flex;flex-direction:column;gap:2px;align-items:flex-end">' +
      '<span class="ade-progtxt">' + r.prog + ' %</span>' +
      '<span class="ade-prog' + (late ? ' late' : '') + '" aria-hidden="true"><i style="width:' + r.prog + '%"></i></span></span>';
  }

  function renvCell(r) {
    var out = '<span class="ade-renv" title="Renouvellements consommés : ' + r.renouvellements + ' / ' + r.plafondRenouv + '">';
    for (var i = 0; i < Math.max(r.plafondRenouv, r.renouvellements); i++) {
      out += '<i class="' + (i < r.renouvellements ? (r.plafondAtteint ? 'full' : 'used') : '') + '"></i>';
    }
    out += '</span>';
    return out;
  }

  function noteCell(r) {
    if (!(r.noteGlobale > 0)) return '<span class="ade-num">—</span>';
    var cls = r.noteGlobale >= SEUILS.noteFaible ? 'ok' : 'warn';
    return '<span style="display:inline-flex;align-items:center;gap:7px"><span class="ade-chip ' + cls + '">' + r.noteGlobale + '/20</span></span>';
  }

  function renderTable() {
    var rows = filtered();
    var all = data();
    var enc = all.filter(function (r) { return r.decision === 'En cours'; });
    var ok = all.filter(function (r) { return r.decision === 'Embauche confirmee'; });
    var evals = all.filter(function (r) { return r.noteGlobale > 0; });
    var moy = evals.length ? (evals.reduce(function (s, r) { return s + r.noteGlobale; }, 0) / evals.length).toFixed(1) : '—';
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var ar = '';
      if (key && key === sortKey) ar = ' aria-sort="' + (dir < 0 ? 'descending' : 'ascending') + '"';
      return '<th' + ar + (key ? ' data-sort="' + key + '"' : '') + ' class="' + (cls || '') + '">' + label +
        (key === sortKey ? '<span class="ade-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'ade-th-chk') + th('N°', 'numero') + th('Employé', 'employe') + th('Poste', 'poste') + th('Département', 'dep') +
      th('Contrat', 'type') + th('Début', 'deb') + th('Fin', 'fin') + th('J restants', 'jrest') + th('Durée', 'dur', 'ade-right') +
      th('Renouv.', 'ren') + th('Note', 'note') + th('Évaluateur', 'evaluateur') + th('Décision', 'dec') + th('Le', 'dateDecision') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="ade-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.employe) + '"></td>' +
        '<td class="ade-num">' + esc(r.numero) + '</td>' +
        '<td><span class="ade-emp" data-open="' + esc(r.id) + '">' + esc(r.employe) + '</span></td>' +
        '<td style="font-weight:600">' + esc(r.poste || '—') + '</td>' +
        '<td>' + esc(r.departement || '—') + '</td>' +
        '<td><span class="ade-chip neutral">' + esc(r.typeContrat || '—') + '</span></td>' +
        '<td class="ade-num">' + esc(r.dateDebutEssai || '—') + '</td>' +
        '<td class="ade-num">' + esc(r.dateFinEssai || '—') + '</td>' +
        '<td>' + jbCell(r) + '</td>' +
        '<td class="ade-right">' + r.duree + ' j</td>' +
        '<td>' + renvCell(r) + '</td>' +
        '<td>' + noteCell(r) + '</td>' +
        '<td>' + esc(r.evaluateur || '—') + '</td>' +
        '<td>' + decChip(r) + '</td>' +
        '<td class="ade-num">' + esc(r.dateDecision || '—') + '</td>' +
        '<td><div class="ade-actions">' +
          '<button class="ade-ic" data-open="' + esc(r.id) + '" title="Détail & décision rapide">' + ICO.eye + '</button>' +
          '<button class="ade-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="ade-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (décision réinitialisée)">' + ICO.dup + '</button>' +
          '<button class="ade-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="ade-tfoot"><td></td><td colspan="15">TOTAL ' + all.length + ' périodes · ' + enc.length + ' en cours · ' + ok.length + ' confirmée(s) · note moyenne ' + moy + '/20</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="ade-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="ade-sel" data-ade="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="ade-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="ade-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-ade="content"]');
    card.innerHTML = '<div class="ade-tblcard"><div class="ade-tblwrap"><table class="ade-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="16"><div class="ade-empty">Aucune période ne correspond aux filtres</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'employe' || k === 'numero' || k === 'poste' || k === 'dep' ? 1 : -1; }
        refresh();
      });
    });
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Sélection limitée à 4 périodes', 'err'); c.checked = false; return; } UI.cmp.push(id); }
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
    var perSel = $('[data-ade="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function renderCards() {
    var rows = filtered();
    var card = $('[data-ade="content"]');
    card.innerHTML = rows.length ? '<div class="ade-cards">' + rows.map(function (r) {
      var j = jLab(r);
      return '<div class="ade-cardx' + (r.urg === 'dep' ? ' dep' : '') + '" data-id="' + esc(r.id) + '">' +
        '<div class="ade-card-top"><div><input type="checkbox" class="ade-chk" data-chk="' + esc(r.id) + '"' + (UI.cmp.indexOf(r.id) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="ade-num">' + esc(r.numero) + '</span></div>' +
        decChip(r) + '</div>' +
        '<div class="ade-card-name" data-open="' + esc(r.id) + '">' + esc(r.employe) + '</div>' +
        '<div class="ade-card-role">' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div>' +
        '<div class="ade-card-jrest"><span class="ade-jb ' + j.tone + '" title="' + esc(j.title) + '">' + esc(j.lab) + '</span>' +
        '<span class="ade-num">fin ' + esc(r.dateFinEssai || '—') + '</span></div>' +
        '<div class="ade-card-prog">' + progCell(r) + '<span>début ' + esc(r.dateDebutEssai || '—') + ' · ' + r.duree + ' j · prévenance ' + r.prevenance + ' j</span></div>' +
        '<div class="ade-card-meta">' + renvCell(r) + noteCell(r) +
        '<span class="ade-chip neutral">' + esc(r.typeContrat || '—') + '</span>' +
        (r.decision === 'Rupture essai' ? '<span class="ade-motifchip ' + (r.motifDoc ? 'doc' : 'abs') + '">' + (r.motifDoc ? 'motif ✓' : 'sans motif') + '</span>' : '') + '</div>' +
        '<div class="ade-card-foot"><span class="ade-num">' + esc(r.evaluateur || '—') + '</span>' +
        '<div class="ade-card-act">' +
          '<button class="ade-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="ade-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="ade-ic" data-dup="' + esc(r.id) + '" title="Dupliquer">' + ICO.dup + '</button>' +
          '<button class="ade-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="ade-empty">Aucune période ne correspond aux filtres</div>';
    $$('[data-chk]', card).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.cmp.indexOf(id);
        if (c.checked && i < 0) { if (UI.cmp.length >= 4) { toast('Sélection limitée à 4 périodes', 'err'); c.checked = false; return; } UI.cmp.push(id); }
        if (!c.checked && i > -1) UI.cmp.splice(i, 1);
        renderSelBar();
      });
    });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', card).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit')); }); });
    $$('[data-dup]', card).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', card).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= VUE ÉCHÉANCIER (signature) ================= */
  function renderEcheancier() {
    var card = $('[data-ade="content"]');
    var rows = data();
    var weeks = UI.echWeeks || 8;
    var anchor = UI.echAnchor || weekStartOf(Date.now());
    if (!UI.echAnchor) UI.echAnchor = anchor;
    var curWs = weekStartOf(Date.now());
    var weEnd = anchor + weeks * 7 * 86400000 - 1;
    var inWin = rows.filter(function (r) { var t = tsOf(r.dateFinEssai); return t >= anchor && t <= weEnd; });
    var enc = rows.filter(function (r) { return r.decision === 'En cours'; });
    var head = '<div class="ade-ech-head">' +
      '<span class="ade-ech-title">' + ICO.alarm + ' Échéancier des fins de période</span>' +
      '<span class="ade-ech-range">' + fmtTs(anchor) + ' → ' + fmtTs(anchor + weeks * 7 * 86400000 - 86400000) + '</span>' +
      '<span class="ade-ech-nav">' +
        '<button class="ade-pgbtn" data-ech="prev" title="' + weeks + ' semaines avant">‹</button>' +
        '<button class="ade-pgbtn" data-ech="today" title="Revenir à la semaine en cours (K)">Aujourd\u2019hui</button>' +
        '<button class="ade-pgbtn" data-ech="next" title="' + weeks + ' semaines après">›</button>' +
        '<select class="ade-sel" data-ade="echw" aria-label="Horizon de l\u2019échéancier">' + [4, 8, 12].map(function (n) {
          return '<option value="' + n + '"' + (weeks === n ? ' selected' : '') + '>' + n + ' semaines</option>';
        }).join('') + '</select>' +
        (inWin.length === 0 && rows.length ? '<button class="ade-chipbtn" data-ech="jump">⏭ Première échéance non décidée</button>' : '') +
      '</span></div>';
    var frise = '<div class="ade-frise-wrap"><div class="ade-frise">';
    var anyItem = false;
    for (var i = 0; i < weeks; i++) {
      var ws = anchor + i * 7 * 86400000;
      var we = ws + 6 * 86400000;
      var items = rows.filter(function (r) { var t = tsOf(r.dateFinEssai); return t >= ws && t <= we; });
      items.sort(function (a, b) { return (urgBase(a.urg) - urgBase(b.urg)) || (tsOf(a.dateFinEssai) - tsOf(b.dateFinEssai)); });
      if (items.length) anyItem = true;
      frise += '<div class="ade-week' + (ws === curWs ? ' now' : '') + '">' +
        '<div class="ade-week-head"><b>' + (i === 0 && ws === curWs ? 'cette sem.' : fmtTs(ws)) + '</b>' +
        '<span class="ade-week-cnt">' + items.length + '</span></div>' +
        '<div class="ade-week-body">' + items.map(function (r) {
          var j = jLab(r);
          return '<button class="ade-essep u-' + r.urg + '" data-open="' + esc(r.id) + '" title="' + esc(r.employe + ' · ' + (r.poste || '') + ' — ' + j.title) + '">' +
            '<b>' + esc(r.numero) + ' · ' + esc(r.employe.split(' ')[0]) + '</b>' +
            '<span>' + esc(fmtTs(tsOf(r.dateFinEssai)) + ' · ' + (r.decision === 'En cours' ? 'à trancher' : decMeta(r.decision).lab)) + '</span>' +
            '<span class="ade-jb ' + j.tone + '">' + esc(j.lab) + '</span></button>';
        }).join('') + '</div></div>';
    }
    frise += '</div>';
    if (!anyItem) {
      frise += '<div class="ade-echempty">Aucune échéance dans cette fenêtre.' +
        (enc.length || rows.length ? '<button class="ade-btn ade-btn-primary" data-ech="jump">Aller à la première échéance non décidée</button>' : '') +
        '</div>';
    }
    frise += '</div>' +
      '<div class="ade-legend">' +
        '<span><i class="l-dep"></i> dépassée sans décision</span>' +
        '<span><i class="l-crit"></i> prévenance entamée</span>' +
        '<span><i class="l-warn"></i> &lt; ' + SEUILS.alerteJ + ' j</span>' +
        '<span><i class="l-ok"></i> au-delà du seuil</span>' +
        '<span><i class="l-far"></i> décision prise</span>' +
      '</div>';
    /* compteurs J-restants par période */
    var trie = rows.slice().sort(function (a, b) { return (urgBase(a.urg) - urgBase(b.urg)) || (tsOf(a.dateFinEssai) - tsOf(b.dateFinEssai)); });
    var cnts = '<div class="ade-cnts"><div class="ade-fsec" style="margin-top:16px">Compteurs J-restants par période</div>' +
      trie.map(function (r) {
        var j = jLab(r);
        return '<div class="ade-cnt-row" data-open="' + esc(r.id) + '" role="button" tabindex="0" title="Ouvrir la fiche & décision rapide">' +
          '<span class="ade-num">' + esc(r.numero) + '</span>' +
          '<span class="ade-cnt-emp">' + esc(r.employe) + '</span>' +
          '<span class="ade-cnt-fin ade-hide-m">' + esc(r.dateFinEssai) + '</span>' +
          '<span class="ade-jb ' + j.tone + '">' + esc(j.lab) + '</span>' +
          '<span class="ade-num ade-hide-m">' + r.prog + ' %</span>' +
          '<span class="ade-hide-m">' + decChip(r) + '</span>' +
          '<span class="ade-num">' + esc(r.dateDecision || '—') + '</span></div>';
      }).join('') + '</div>';
    card.innerHTML = head + frise + cnts;
    $$('[data-ech]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-ech');
        if (a === 'prev') UI.echAnchor = UI.echAnchor - weeks * 7 * 86400000;
        else if (a === 'next') UI.echAnchor = UI.echAnchor + weeks * 7 * 86400000;
        else if (a === 'today') UI.echAnchor = weekStartOf(Date.now());
        else if (a === 'jump') {
          var cands = rows.filter(function (r) { return r.decision === 'En cours'; });
          if (!cands.length) cands = rows;
          var mn = null;
          cands.forEach(function (r) { var t = tsOf(r.dateFinEssai); if (t && (mn === null || t < mn)) mn = t; });
          UI.echAnchor = mn ? weekStartOf(mn) : weekStartOf(Date.now());
        }
        refresh();
      });
    });
    var wsel = $('[data-ade="echw"]', card);
    if (wsel) wsel.addEventListener('change', function () { UI.echWeeks = Number(wsel.value) || 8; saveUI(); refresh(); });
    $$('[data-open]', card).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
  }

  function renderSelBar() {
    var zone = $('[data-ade="selbar"]');
    if (!zone) return;
    if (!UI.cmp.length) { zone.innerHTML = ''; return; }
    var rows = UI.cmp.map(function (id) { return rowById(id); }).filter(Boolean);
    var enc = rows.filter(function (r) { return r.decision === 'En cours'; }).length;
    zone.innerHTML = '<div class="ade-selbar">' +
      '<span class="ade-selbar-info">' + rows.length + ' sélectionnée' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="ade-selbar-sub">' + enc + ' en cours (décision à préparer)</span>' +
      '<button class="ade-btn ade-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="ade-btn ade-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="ade-btn ade-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.cmp = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.cmp.slice());
        else if (a === 'del') askDelBulk(UI.cmp.slice());
      });
    });
  }

  /* ================= drawer détail ================= */
  function closeDrawer() { $$('[data-ade="drawer"],[data-ade="backdrop"][data-ade-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id, silent) {
    var r = rowById(id); /* relecture : jamais de closure périmée */
    if (!r) return;
    closeDrawer();
    UI.drawerId = id;
    var bd = h('div', { class: 'ade-backdrop', 'data-ade': 'backdrop', 'data-ade-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var dm = r.dm;
    var j = jLab(r);
    var limitePrev = datePlusDays(r.dateFinEssai, -(Number(r.prevenance) || SEUILS.prevenance));
    var prevPerdu = r.decision === 'En cours' && r.jRest < r.prevenance;
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var dr = h('aside', { class: 'ade-drawer', 'data-ade': 'drawer', role: 'dialog', 'aria-label': 'Fiche période ' + r.numero });
    dr.innerHTML =
      '<div class="ade-drawer-head"><div><div class="ade-drawer-title">' + esc(r.employe) + '</div>' +
      '<div class="ade-drawer-sub">' + esc(r.numero) + ' · ' + esc(r.poste || '—') + ' · ' + esc(r.departement || '—') + '</div></div>' +
      '<button class="ade-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ade-drawer-body">' +
        '<div class="ade-live" style="margin-top:0">' +
          '<span>Décision <b style="color:' + dm.c + '">' + esc(dm.lab) + '</b></span>' +
          '<span>Fin <b>' + esc(r.dateFinEssai || '—') + '</b></span>' +
          '<span>J restants <b class="' + (j.tone === 'dep' || j.tone === 'crit' ? 'bad' : '') + '">' + esc(j.lab) + '</b></span>' +
          '<span>Progression <b>' + r.prog + ' %</b></span></div>' +
        '<div class="ade-fsec">Décision rapide</div>' +
        '<div class="ade-decrow"><label for="ade-decsel">Trancher la période</label>' +
          '<select id="ade-decsel" class="ade-in" data-ade="decsel" style="max-width:230px">' + DECISIONS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.decision ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select>' +
          '<button class="ade-btn ade-btn-ghost" data-act="prolong"' + (r.plafondAtteint ? ' title="Plafond de renouvellements atteint"' : '') + '>Prolonger +1 mois</button></div>' +
        (r.plafondAtteint ? '<div class="ade-tip warn">Plafond de renouvellements atteint (' + r.renouvellements + '/' + r.plafondRenouv + ') — une prolongation supplémentaire est impossible : confirmer ou rompre.</div>' : '') +
        (prevPerdu ? '<div class="ade-tip hot">Délai de prévenance (' + r.prevenance + ' j) dépassé : une rupture notifiée aujourd\u2019hui ne respecterait plus le délai légal avant le ' + esc(r.dateFinEssai) + '.</div>' : '') +
        '<div class="ade-fsec">Échéances & délais</div>' +
        '<dl class="ade-kv">' +
          kv('Début d\u2019essai', esc(r.dateDebutEssai || '—')) +
          kv('Fin d\u2019essai', esc(r.dateFinEssai || '—')) +
          kv('Durée', r.duree + ' jours') +
          kv('J restants', '<span class="ade-jb ' + j.tone + '">' + esc(j.lab) + '</span>') +
          kv('Délai de prévenance', r.prevenance + ' jours (rupture à notifier avant le ' + esc(limitePrev) + ')') +
          kv('Progression', '<span class="ade-prog' + (r.jRest < 0 && r.decision === 'En cours' ? ' late' : '') + '" style="width:110px;display:inline-block;vertical-align:middle"><i style="width:' + r.prog + '%"></i></span> ' + r.prog + ' %') +
        '</dl>' +
        '<div class="ade-fsec">Renouvellements</div>' +
        '<dl class="ade-kv">' +
          kv('Consommés / plafond', renvCell(r) + ' ' + r.renouvellements + ' / ' + r.plafondRenouv + (r.plafondAtteint ? ' <span class="ade-chip err">plafond atteint</span>' : '')) +
          kv('Date de décision', esc(r.dateDecision || '—')) +
        '</dl>' +
        '<div class="ade-fsec">Évaluation</div>' +
        '<dl class="ade-kv">' +
          kv('Note globale', noteCell(r)) +
          kv('Score mi-parcours', r.scoreMiParcours == null ? '—' : r.scoreMiParcours + '/20') +
          kv('Score final', r.scoreFinal == null ? '—' : r.scoreFinal + '/20') +
          kv('Objectifs fixés', esc(r.objectifsFixes || '—')) +
          kv('Évaluateur', esc(r.evaluateur || '—')) +
          kv('Type de contrat', esc(r.typeContrat || '—')) +
        '</dl>' +
        '<div class="ade-fsec">Motif de la décision</div>' +
        (r.decision === 'Rupture essai' ? '<div style="margin:0 0 7px"><span class="ade-motifchip ' + (r.motifDoc ? 'doc' : 'abs') + '">' + (r.motifDoc ? 'motif documenté ✓' : 'AUCUN MOTIF — à documenter') + '</span></div>' : '') +
        '<textarea class="ade-notebox" data-ade="motif" placeholder="Motif de la décision (obligatoire pour une rupture — inadaptation, insuffisance…)" aria-label="Motif de la décision">' + esc(r.motif || '') + '</textarea>' +
        '<div class="ade-fsec">Notes</div>' +
        '<textarea class="ade-notebox" data-ade="note" placeholder="Notes internes (mi-parcours, impressions…)">' + esc(r.notes || '') + '</textarea>' +
        '<div class="ade-drawer-actions">' +
          '<button class="ade-btn ade-btn-ghost" data-act="motif">Enregistrer le motif</button>' +
          '<button class="ade-btn ade-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="ade-btn ade-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="ade-btn ade-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="ade-btn ade-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
      '</div>';
    $('.ade-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-ade="decsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      var cur = rowById(id); /* relecture anti stale-closure */
      if (!cur || nv === cur.decision) return;
      var warn = '';
      if (nv === 'Rupture essai' && !cur.motifDoc) warn = ' — motif à documenter';
      if (nv === 'Prolongation essai' && cur.plafondAtteint) warn = ' — plafond de renouvellements atteint';
      mutate(function (obj) {
        obj.periodes = obj.periodes.map(function (x) { if (String(x.id) === String(id)) { x.decision = nv; if (!x.dateDecision) x.dateDecision = todayFR(); } return x; });
        return obj;
      }, 'Décision modifiée', r.numero + ' → ' + decMeta(nv).lab);
      toast('Décision : ' + decMeta(nv).lab + warn, warn ? 'err' : 'ok');
      setTimeout(function () { if (UI.drawerId === id) openDrawer(id, true); }, 90);
    });
    $('[data-act="prolong"]', dr).addEventListener('click', function () {
      var cur = rowById(id);
      if (!cur) return;
      if (cur.plafondAtteint) { toast('Plafond de renouvellements atteint (' + cur.renouvellements + '/' + cur.plafondRenouv + ') — confirmer ou rompre', 'err'); return; }
      mutate(function (obj) {
        obj.periodes = obj.periodes.map(function (x) {
          if (String(x.id) === String(id)) {
            x.renouvellements = (Number(x.renouvellements) || 0) + 1;
            x.decision = 'Prolongation essai';
            x.dateFinEssai = datePlusDays(x.dateFinEssai, 30);
            x.duree = (Number(x.duree) || 0) + 30;
            x.dateDecision = todayFR();
          }
          return x;
        });
        return obj;
      }, 'Renouvellement enregistré', r.numero + ' (+30 j → ' + datePlusDays(r.dateFinEssai, 30) + ')');
      toast('Prolongation enregistrée (+1 mois, renouvellement ' + (cur.renouvellements + 1) + '/' + cur.plafondRenouv + ')', 'ok');
      setTimeout(function () { if (UI.drawerId === id) openDrawer(id, true); }, 90);
    });
    $('[data-act="motif"]', dr).addEventListener('click', function () {
      var v = $('[data-ade="motif"]', dr).value;
      mutate(function (obj) {
        obj.periodes = obj.periodes.map(function (x) { if (String(x.id) === String(id)) x.motif = v; return x; });
        return obj;
      }, 'Motif enregistré', r.numero);
      toast('Motif enregistré', 'ok');
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-ade="note"]', dr).value;
      mutate(function (obj) {
        obj.periodes = obj.periodes.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return obj;
      }, 'Notes modifiées', r.numero);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    if (!silent) jlog('Ouverture fiche', r.numero);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-ade="dialog"],[data-ade="backdrop"][data-ade-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) { return r ? (r[k] == null ? '' : String(r[k])) : ''; };
    var bd = h('div', { class: 'ade-backdrop', 'data-ade': 'backdrop', 'data-ade-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'ade-dialog', 'data-ade': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une période d\u2019essai' : 'Nouvelle période d\u2019essai' });
    function opts(list, cur, labFn) {
      return '<option value=""></option>' + list.map(function (x) {
        var vv = typeof x === 'object' ? x.k : x;
        var ll = labFn ? labFn(x) : (typeof x === 'object' ? x.lab : x);
        return '<option value="' + esc(vv) + '"' + (cur === vv ? ' selected' : '') + '>' + esc(ll) + '</option>';
      }).join('');
    }
    dlg.innerHTML =
      '<div class="ade-dialog-head"><h3>' + (r ? 'Modifier la période ' + esc(r.numero) : 'Nouvelle période d\u2019essai') + '</h3>' +
      '<button class="ade-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ade-dialog-body">' +
        '<div class="ade-fgrid">' +
          '<label class="ade-lab">Employé *<input class="ade-in" data-f="employe" value="' + esc(v('employe')) + '" placeholder="Ex. Nkoulou Amina"></label>' +
          '<label class="ade-lab">Poste *<input class="ade-in" data-f="poste" value="' + esc(v('poste')) + '" placeholder="Ex. Chef Cuisinier"></label>' +
          '<label class="ade-lab">Département *<input class="ade-in" data-f="departement" value="' + esc(v('departement')) + '" placeholder="Ex. Restauration"></label>' +
          '<label class="ade-lab">Type de contrat<select class="ade-in" data-f="typeContrat">' + opts(TYPES, v('typeContrat')) + '</select></label>' +
          '<label class="ade-lab">Date début essai *<input class="ade-in" data-f="dateDebutEssai" value="' + esc(v('dateDebutEssai')) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="ade-lab">Durée (jours) *<input class="ade-in" type="number" min="1" max="730" step="1" data-f="duree" value="' + esc(v('duree') || '90') + '"></label>' +
          '<label class="ade-lab">Date fin essai *(calculée)<input class="ade-in" data-f="dateFinEssai" value="' + esc(v('dateFinEssai')) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="ade-lab">Évaluateur *<input class="ade-in" data-f="evaluateur" value="' + esc(v('evaluateur')) + '" placeholder="Ex. M. Nkoulou Paul"></label>' +
          '<label class="ade-lab">Décision<select class="ade-in" data-f="decision">' + opts(DECISIONS, v('decision') || 'En cours', function (x) { return x.lab; }) + '</select></label>' +
          '<label class="ade-lab">Date de décision<input class="ade-in" data-f="dateDecision" value="' + esc(v('dateDecision')) + '" placeholder="jj/mm/aaaa"></label>' +
          '<label class="ade-lab">Note globale /20<input class="ade-in" type="number" min="0" max="20" step="1" data-f="noteGlobale" value="' + esc(v('noteGlobale') || '0') + '"></label>' +
          '<label class="ade-lab">Score mi-parcours /20<input class="ade-in" type="number" min="0" max="20" step="1" data-f="scoreMiParcours" value="' + esc(v('scoreMiParcours')) + '" placeholder="—"></label>' +
          '<label class="ade-lab">Score final /20<input class="ade-in" type="number" min="0" max="20" step="1" data-f="scoreFinal" value="' + esc(v('scoreFinal')) + '" placeholder="—"></label>' +
          '<label class="ade-lab">Délai de prévenance (jours)<input class="ade-in" type="number" min="0" max="60" step="1" data-f="prevenance" value="' + esc(v('prevenance') || String(SEUILS.prevenance)) + '"></label>' +
          '<label class="ade-lab">Renouvellements consommés<input class="ade-in" type="number" min="0" max="3" step="1" data-f="renouvellements" value="' + esc(v('renouvellements') || '0') + '"></label>' +
          '<label class="ade-lab">Plafond de renouvellements<input class="ade-in" type="number" min="0" max="3" step="1" data-f="plafondRenouv" value="' + esc(v('plafondRenouv') || '1') + '"></label>' +
          '<label class="ade-lab full">Objectifs fixés<textarea class="ade-in ade-ta" data-f="objectifsFixes" placeholder="Ex. Maîtriser 100% de la carte, former 2 commis">' + esc(v('objectifsFixes')) + '</textarea></label>' +
          '<label class="ade-lab full">Motif de la décision<textarea class="ade-in ade-ta" data-f="motif" placeholder="Obligatoire si décision = Rupture essai">' + esc(v('motif')) + '</textarea></label>' +
          '<label class="ade-lab full">Notes<textarea class="ade-in ade-ta" data-f="notes" placeholder="Impressions, précisions…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' +
        '<div class="ade-live" data-ade="dlg-live"></div>' +
        '<div data-ade="dlg-err"></div>' +
      '</div>' +
      '<div class="ade-dialog-foot"><span class="ade-form-hint">ISO 30401 · la date fin est recalculée depuis début + durée · cohérence renouvellements/plafond contrôlée</span>' +
      '<span style="display:flex;gap:8px"><button class="ade-btn ade-btn-ghost" data-act="cancel" style="color:var(--ade-text);border-color:var(--ade-line)">Annuler</button>' +
      '<button class="ade-btn ade-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer la période') + '</button></span></div>';
    $('.ade-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function val() {
      var o = {};
      $$('[data-f]', dlg).forEach(function (i) { o[i.getAttribute('data-f')] = i.value; });
      return o;
    }
    function live() {
      var valo = val();
      var d1 = tsOf(valo.dateDebutEssai), d2 = tsOf(valo.dateFinEssai);
      var jR = d2 ? Math.round((d2 - todayMid()) / 86400000) : null;
      var calcFin = d1 && Number(valo.duree) > 0 ? fmtTs(d1 + Number(valo.duree) * 86400000) : '';
      var ren = Number(valo.renouvellements) || 0, pl = Number(valo.plafondRenouv) || 0;
      var dm = decMeta(valo.decision);
      $('[data-ade="dlg-live"]', dlg).innerHTML =
        '<span>Décision <b style="color:' + dm.c + '">' + esc(dm.lab) + '</b></span>' +
        '<span>Fin recalculée <b>' + esc(calcFin || '—') + '</b></span>' +
        '<span>J restants <b>' + (jR == null ? '—' : (jR < 0 ? 'J+' + Math.abs(jR) : 'J-' + jR)) + '</b></span>' +
        '<span>Renouvellements <b class="' + (ren > pl ? 'bad' : '') + '">' + ren + ' / ' + (pl || '—') + '</b></span>' +
        (valo.decision === 'Rupture essai' && !String(valo.motif || '').trim() ? '<span class="bad">⚠ motif requis pour une rupture</span>' : '');
    }
    $$('[data-f]', dlg).forEach(function (i) {
      i.addEventListener('input', function () {
        var f = i.getAttribute('data-f');
        var valo = val();
        /* cohérence dates ↔ durée : la fin est recalculée, la durée recalculée */
        if (f === 'dateDebutEssai' || f === 'duree') {
          var d1 = tsOf(valo.dateDebutEssai), du = Number(valo.duree);
          if (d1 && du > 0) {
            var fin = $('[data-f="dateFinEssai"]', dlg);
            if (fin) fin.value = fmtTs(d1 + du * 86400000);
          }
        } else if (f === 'dateFinEssai') {
          var dd1 = tsOf(valo.dateDebutEssai), dd2 = tsOf(valo.dateFinEssai);
          if (dd1 && dd2 && dd2 > dd1) {
            var duIn = $('[data-f="duree"]', dlg);
            if (duIn) duIn.value = String(Math.round((dd2 - dd1) / 86400000));
          }
        }
        live();
      });
    });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var valo = val();
      var err = $('[data-ade="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="ade-form-err">' + esc(msg) + '</div>'; }
      if (!String(valo.employe || '').trim()) return fail('Le nom de l\u2019employé est obligatoire.');
      if (!String(valo.poste || '').trim()) return fail('Le poste est obligatoire.');
      if (!String(valo.departement || '').trim()) return fail('Le département est obligatoire.');
      if (!String(valo.evaluateur || '').trim()) return fail('L\u2019évaluateur est obligatoire.');
      var d1 = tsOf(valo.dateDebutEssai);
      if (!d1) return fail('La date de début est obligatoire (format jj/mm/aaaa).');
      var du = Number(valo.duree);
      if (!du || du < 1 || du > 730) return fail('La durée doit être comprise entre 1 et 730 jours.');
      var d2 = tsOf(valo.dateFinEssai);
      if (!d2) return fail('La date de fin est obligatoire (format jj/mm/aaaa).');
      if (d2 <= d1) return fail('La date de fin doit être postérieure à la date de début.');
      var calc = Math.round((d2 - d1) / 86400000);
      if (Math.abs(calc - du) > 1) return fail('Durée incohérente avec les dates : ' + calc + ' j d\u2019écart calculé pour une durée saisie de ' + du + ' j.');
      var note = Number(valo.noteGlobale) || 0;
      if (note < 0 || note > 20) return fail('La note globale doit être comprise entre 0 et 20.');
      var smp = String(valo.scoreMiParcours || '').trim() === '' ? null : Number(valo.scoreMiParcours);
      var sf = String(valo.scoreFinal || '').trim() === '' ? null : Number(valo.scoreFinal);
      if (smp != null && (smp < 0 || smp > 20)) return fail('Le score mi-parcours doit être compris entre 0 et 20.');
      if (sf != null && (sf < 0 || sf > 20)) return fail('Le score final doit être compris entre 0 et 20.');
      var ren = Number(valo.renouvellements) || 0;
      var pl = Number(valo.plafondRenouv) || 0;
      if (ren < 0 || ren > 3) return fail('Les renouvellements consommés doivent être compris entre 0 et 3.');
      if (pl < 0 || pl > 3) return fail('Le plafond de renouvellements doit être compris entre 0 et 3.');
      if (ren > pl) return fail('Cohérence impossible : ' + ren + ' renouvellement(s) consommé(s) pour un plafond de ' + pl + ' — augmentez le plafond ou réduisez les renouvellements.');
      var dec = String(valo.decision || '').trim() || 'En cours';
      if (dec === 'Rupture essai' && !String(valo.motif || '').trim()) return fail('Le motif est obligatoire pour une rupture — documentez la décision.');
      var N2 = function (x) { var k2 = Number(x); return isFinite(k2) ? Math.max(0, k2) : 0; };
      var rec = {
        employe: String(valo.employe).trim(),
        poste: String(valo.poste).trim(),
        departement: String(valo.departement).trim(),
        typeContrat: String(valo.typeContrat || '').trim(),
        dateDebutEssai: String(valo.dateDebutEssai).trim(),
        dateFinEssai: String(valo.dateFinEssai).trim(),
        duree: calc, /* les dates font foi */
        evaluateur: String(valo.evaluateur).trim(),
        decision: dec,
        dateDecision: String(valo.dateDecision || '').trim(),
        noteGlobale: note,
        scoreMiParcours: smp,
        scoreFinal: sf,
        prevenance: N2(valo.prevenance),
        renouvellements: ren,
        plafondRenouv: pl,
        objectifsFixes: String(valo.objectifsFixes || '').trim(),
        motif: String(valo.motif || '').trim(),
        notes: String(valo.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.periodes = cur.periodes.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Période modifiée', rec.employe);
        toast('Période mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var nx = nextNumero(cur.periodes);
          var cp = { id: nx.id, numero: nx.numero, decision: 'En cours', noteGlobale: 0, scoreMiParcours: null, scoreFinal: null, dateDecision: '', renouvellements: 0, plafondRenouv: 1, motif: '' };
          for (var k2 in rec) cp[k2] = rec[k2];
          cur.periodes = cur.periodes.concat([cp]);
          return cur;
        }, 'Période créée', rec.employe);
        toast('Période créée — ' + rec.employe, 'ok');
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
    mutate(function (cur) {
      var nx = nextNumero(cur.periodes);
      var cp = {};
      for (var k in r) if (['jRest', 'urg', 'prog', 'dm', 'motifDoc', 'plafondAtteint'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = nx.id;
      cp.numero = nx.numero;
      cp.decision = 'En cours';
      cp.noteGlobale = 0;
      cp.scoreMiParcours = null;
      cp.scoreFinal = null;
      cp.dateDecision = '';
      cp.renouvellements = 0;
      cp.motif = '';
      cur.periodes = cur.periodes.concat([cp]);
      return cur;
    }, 'Période dupliquée', r.numero);
    toast('Période dupliquée (décision réinitialisée)', 'ok');
  }
  function closeConfirm() { $$('[data-ade="confirm"],[data-ade="backdrop"][data-ade-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'ade-backdrop', 'data-ade': 'backdrop', 'data-ade-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'ade-confirm', 'data-ade': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette période d\u2019essai ?</h4><p>' + esc(r.numero) + ' — ' + esc(r.employe) + ' (' + esc(r.poste || '—') + ', fin ' + esc(r.dateFinEssai || '—') + '). Cette action est définitive.</p>' +
      '<div class="ade-confirm-row"><button class="ade-btn ade-btn-ghost" data-a="no" style="color:var(--ade-text);border-color:var(--ade-line)">Annuler</button>' +
      '<button class="ade-btn ade-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.periodes = cur.periodes.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Période supprimée', r.numero);
      UI.cmp = UI.cmp.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Période supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' périodes ?') : 'Supprimer 1 période ?';
    var bd = h('div', { class: 'ade-backdrop', 'data-ade': 'backdrop', 'data-ade-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'ade-confirm', 'data-ade': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.numero); }).join(', ') + '. Cette action est définitive.</p>' +
      '<div class="ade-confirm-row"><button class="ade-btn ade-btn-ghost" data-a="no" style="color:var(--ade-text);border-color:var(--ade-line)">Annuler</button>' +
      '<button class="ade-btn ade-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.periodes = cur.periodes.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' périodes');
      UI.cmp = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' périodes supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= seuils ================= */
  function closeSeuils() { $$('[data-ade="seuils"],[data-ade="backdrop"][data-ade-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'ade-backdrop', 'data-ade': 'backdrop', 'data-ade-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'ade-panel', 'data-ade': 'seuils', role: 'dialog', 'aria-label': 'Seuils d\u2019alerte' });
    p.innerHTML = '<div class="ade-panel-head"><h3>Seuils d\u2019alerte — échéances</h3><button class="ade-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ade-panel-body">' +
        '<p class="ade-cibles-note">Ces seuils alimentent les alertes, la frise de l\u2019échéancier et les compteurs J-restants (Manuel D1 : décision de fin de période prise à temps, prévenance respectée, renouvellements plafonnés).</p>' +
        '<div class="ade-sim-row"><label for="ade-s1">Alerte « fin proche » (jours avant la fin)</label><input type="range" id="ade-s1" min="7" max="60" step="1" value="' + SEUILS.alerteJ + '"><input class="ade-in" type="number" min="1" max="90" step="1" data-ade="s1n" value="' + SEUILS.alerteJ + '"></div>' +
        '<div class="ade-sim-row"><label for="ade-s2">Délai de prévenance par défaut (jours)</label><input type="range" id="ade-s2" min="1" max="30" step="1" value="' + SEUILS.prevenance + '"><input class="ade-in" type="number" min="1" max="60" step="1" data-ade="s2n" value="' + SEUILS.prevenance + '"></div>' +
        '<div class="ade-sim-row"><label for="ade-s3">Note « confirmation méritée » (/20)</label><input type="range" id="ade-s3" min="5" max="18" step="1" value="' + SEUILS.noteFaible + '"><input class="ade-in" type="number" min="0" max="20" step="1" data-ade="s3n" value="' + SEUILS.noteFaible + '"></div>' +
        '<div class="ade-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="ade-btn ade-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.ade-drawer-x', p).addEventListener('click', closeSeuils);
    [['ade-s1', 's1n', 'alerteJ', 7, 60, 1], ['ade-s2', 's2n', 'prevenance', 1, 30, 1], ['ade-s3', 's3n', 'noteFaible', 5, 18, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-ade="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v2 = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v2; n.value = v2; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.alerteJ = Math.max(7, Math.min(60, Number($('[data-ade="s1n"]', p).value) || SEUILS.alerteJ));
      SEUILS.prevenance = Math.max(1, Math.min(30, Number($('[data-ade="s2n"]', p).value) || SEUILS.prevenance));
      SEUILS.noteFaible = Math.max(5, Math.min(18, Number($('[data-ade="s3n"]', p).value) || SEUILS.noteFaible));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'fin < ' + SEUILS.alerteJ + ' j · prévenance ' + SEUILS.prevenance + ' j · confirmation ≥ ' + SEUILS.noteFaible + '/20');
      toast('Seuils appliqués — alertes recalculées', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-ade="journal"],[data-ade="backdrop"][data-ade-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'ade-backdrop', 'data-ade': 'backdrop', 'data-ade-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'ade-panel', 'data-ade': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="ade-panel-head"><h3>Journal d\u2019activité</h3><button class="ade-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="ade-panel-body" data-ade="jlist"></div>';
    $('.ade-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-ade="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="ade-jrow"><span class="ade-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="ade-jact">' + esc(x.action || '') + '</span><span class="ade-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="ade-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['N° Période', 'Employé', 'Poste', 'Département', 'Type contrat', 'Date début essai', 'Date fin essai', 'Durée (j)', 'J restants', 'Urgence', 'Renouvellements', 'Plafond', 'Prévenance (j)', 'Évaluateur', 'Note /20', 'Score mi-parcours', 'Score final', 'Décision', 'Date décision', 'Motif', 'Objectifs fixés', 'Notes'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var j = jLab(r);
      var cells = [r.numero, r.employe, r.poste, r.departement, r.typeContrat, r.dateDebutEssai, r.dateFinEssai, r.duree, j.lab, r.urg, r.renouvellements, r.plafondRenouv, r.prevenance, r.evaluateur, r.noteGlobale || '', r.scoreMiParcours == null ? '' : r.scoreMiParcours, r.scoreFinal == null ? '' : r.scoreFinal, decMeta(r.decision).lab, r.dateDecision, r.motifDoc, r.objectifsFixes, r.notes];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'admina-periodes-essai-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-ade="dialog"]') || $('[data-ade="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { UI.view = 'ech'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { UI.view = 'cards'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { UI.view = 'table'; saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { UI.view = 'ech'; UI.echAnchor = weekStartOf(Date.now()); saveUI(); refresh(); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-ade="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouveau · E export · J journal · P échéancier · C cartes · T tableau · K aujourd\u2019hui (échéancier) · S seuils · / recherche', ''); }
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
    var root = $('[data-ade="root"]');
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
    try {
      var v = JSON.parse(localStorage.getItem(LS_UI) || 'null');
      if (v) {
        if (typeof v.view === 'string') UI.view = v.view;
        if (typeof v.per === 'number') UI.per = v.per;
        if (typeof v.echWeeks === 'number') UI.echWeeks = v.echWeeks;
      }
    } catch (e) {}
  }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per, echWeeks: UI.echWeeks })); } catch (e) {} }

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
    else if (UI.view === 'ech') renderEcheancier();
    else renderTable();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-ade="drawer"],[data-ade="dialog"],[data-ade="confirm"],[data-ade="journal"],[data-ade="seuils"]')) {
      $$('[data-ade="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0, unsub = null, lastSnap = '';
  function isOn() { return RE_PAGE.test(location.pathname); }
  function fingerprint() {
    var a = api();
    var d = null;
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    if (!d || !d.periodes) d = lsRead();
    try { return JSON.stringify(d && d.periodes ? d.periodes : []); } catch (e2) { return ''; }
  }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-ade');
    shellBuilt = false;
    bootTries = 0;
    lastSnap = '';
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    /* pont bidirectionnel : abonnement aux mutations natives (si le patch est actif) */
    try {
      var a = api();
      if (a && typeof a.subscribe === 'function') unsub = a.subscribe(function () { if (active && isOn()) scheduleRefresh(); });
    } catch (e0) { unsub = null; }
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-ade]') || t.closest('#ade-decsel'))) continue;
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
    html.classList.remove('admina-ade');
    if (mo) { mo.disconnect(); mo = null; }
    if (unsub) { try { unsub(); } catch (e) {} unsub = null; }
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
    detectTheme();
    cleanupBackdrops();
    var natif = conteneurNatif();
    var root = $('[data-ade="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-ade-hide', '1');
      natif.setAttribute('data-ade-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    /* pont : détection des changements de données côté natif/LS (poll 1,2 s) */
    var snap = fingerprint();
    if (snap !== lastSnap) { lastSnap = snap; scheduleRefresh(); }
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

  window.__ADMINA_ADE_UI__ = {
    version: '1.0-w2',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openEcheancier: function () { UI.view = 'ech'; saveUI(); refresh(); },
    exportCSV: exportCSV,
    openJournal: openJournal,
    openSeuils: openSeuils,
    debug: function () {
      var rows = data();
      return {
        version: '1.0-w2',
        rows: rows.length,
        enCours: rows.filter(function (r) { return r.decision === 'En cours'; }).length,
        echeances: rows.filter(function (r) { return r.decision === 'En cours' && r.jRest <= SEUILS.alerteJ; }).length,
        api: !!api(),
        view: UI.view,
        seuils: Object.assign({}, SEUILS),
        alerts: computeAlerts(rows)
      };
    }
  };
  try { console.info('[ADMINA_ADE] W2-e actif — Échéancier des périodes d\u2019essai /periode-dessai'); } catch (e) {}
})();
