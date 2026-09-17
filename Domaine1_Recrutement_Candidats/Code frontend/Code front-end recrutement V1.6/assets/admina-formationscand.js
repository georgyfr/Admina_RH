/* =============================================================
   Admina-RH — Formations des Candidats — couche admina (W3-c)
   Scope : /formations-candidats · préfixe afc- · flag __ADMINA_FCA_W3__
   ---------------------------------------------------------------
   PHILOSOPHIE DE LA PAGE (exigence permanente du client, VERBATIM) :
   « /formations-candidats = LE CAPACITAIRE. Ce que les candidats ont
   APPRIS est un capital documenté : chaque diplôme renseigné est une
   qualification exploitable pour un besoin futur, chaque école est un
   vivier récoltable. La page n'est pas un registre scolaire : c'est
   l'annuaire des qualifications — elle révèle les viviers derrière
   chaque établissement, les diplômes rares ou pléthoriques, et les
   diplômes "à venir" (formations en cours) qu'il faudra relancer au
   bon moment. Rien de ce qu'un candidat a appris ne doit se perdre. »
   ---------------------------------------------------------------
   VUE SIGNATURE (défaut) : « DIPLÔMES & ÉCOLES » — deux volets côte
   à côte (empilés <760 px) : (1) PAR DIPLÔME — une rangée par
   diplôme, compteur de candidats, barre proportionnelle, chips
   Obtenu/En cours, tags rare/pléthorique, cliquable → filtre
   diplôme ; (2) PAR ÉTABLISSEMENT — une rangée par école, compteur
   (le « vivier »), badge « fort vivier » au-dessus du seuil,
   cliquable → filtre école. Compteurs recalculés en direct.
   ---------------------------------------------------------------
   - Héro calculé (X formations · Y obtenues · Z en cours · N candidats
     distincts) + sous-ligne établissements & diplômes distincts
   - 5 alertes AAA cliquables → filtres : (1) diplômes « à venir » à
     relancer (En cours, fin dépassée ou sous relanceMois) ; (2) écoles
     à fort vivier au-dessus du seuil ; (3) candidats multi-formations
     (profils enrichis ≥ 2 lignes) ; (4) dates incohérentes (fin ≤
     début) ; (5) croisement __ADMINA_CAND_API__ — formations de
     candidats absents de la base (orphanes), SILENCIEUX si API absente
   - 6 KPI cliquables (≥ 4 filtrent) : Formations, Obtenues, En cours,
     Candidats distincts, Établissements, Diplômes distincts
   - 3 graphiques SVG vanilla cliquables → filtre : donut statuts,
     formations par décennie (dateDebut), vivier par établissement
     (barres horizontales top 8, candidats distincts)
   - Recherche (candidat/établissement/diplôme/spécialité) + filtres
     (statut, établissement, spécialité) + Réinitialiser + puces de
     filtres actifs (diplôme, période, alerte, KPI)
   - Table triable aria-sort : candidat, diplôme, spécialité,
     établissement, période (dateDebut→dateFin), durée calculée
     (années), statut chip (Obtenu success, En cours info), actions
   - Vue cartes · drawer fiche = parcours DU MÊME CANDIDAT (mini-
     timeline éducation), statut rapide, notes, alertes inline,
     historique depuis admina_journal
   - Dialog création/édition VALIDÉ (candidat/établissement/diplôme
     obligatoires, dates MM/aaaa 01/AAAA–12/AAAA, dateFin > dateDebut
     bloquant, statut select, aperçu live durée)
   - Duplication (candidat conservé, id max+1) · suppressions simple
     & groupée confirmées · panneau Viviers & relances (K) · seuils
     persistés fortVivier (2-10) / relanceMois (0-24) · export CSV 10
     colonnes formations-candidats-AAAA-MM-JJ.csv · journal
     admina_journal {time,action,detail,role:'RH'} + délégation
     __ADMINA_AUDIT__ · raccourcis N/E/J/P/C/S/K/T + / + ? (ignorés
     dans les inputs) · dark mode auto (LS admina-dark + luminance +
     prefers-color-scheme → html.admina-afc[data-dark]) · burger
     mobile <820px · garde-fous 390 px (0 débordement)
   - Données : window.__ADMINA_FCA_API__ (chunk DÉJÀ patché par
     l'orchestrateur — aucun re-patch ici) → fallback localStorage
     admina-formationscand-data → snapshot démo (miroir des 8 lignes
     natives) · résilience : 30 réessais (450 ms) au démarrage ·
     pont bidirectionnel (subscribe + poller 1,2 s) — la vue native
     reflète les mutations du module
   - STALE-CLOSURE DRAWER (leçon M26) : chaque handler relit la ligne
     courante via rowById/mutate(cur) — reopenDrawerAt(id) après
     mutation
   - Aucun global hors window.__ADMINA_FCA_*
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_FCA_W3__) return;

  var html = document.documentElement;
  var RE_PAGE = /\/formations-candidats\/?$/;
  var LS_DATA = 'admina-formationscand-data';
  var LS_UI = 'admina-formationscand-ui';
  var LS_SEUILS = 'admina-formationscand-seuils';
  var LS_J = 'admina_journal';

  var UI = { q: '', statut: '', etab: '', spec: '', dipl: '', periode: '', flag: '', kpi: '', view: 'dual', sortKey: 'debut', sortDir: -1, page: 0, per: 10, drawerId: null, dialogOpen: false, editId: null, sel: [] };

  /* ================= seuils (persistés) ================= */
  var SEUILS_DEF = { fortVivier: 2, relanceMois: 6 };
  var SEUILS = loadSeuils();
  function loadSeuils() {
    try { var v = JSON.parse(localStorage.getItem(LS_SEUILS) || 'null'); if (v && typeof v === 'object') return Object.assign({}, SEUILS_DEF, v); } catch (e) {}
    return Object.assign({}, SEUILS_DEF);
  }
  function saveSeuils() { try { localStorage.setItem(LS_SEUILS, JSON.stringify(SEUILS)); } catch (e) {} }

  /* ================= référentiels ================= */
  var STATUTS = [
    { k: 'Obtenu', lab: 'Obtenu', c: '#059669', chip: 'ok' },
    { k: 'En cours', lab: 'En cours', c: '#0e7490', chip: 'info' },
    { k: 'Abandonné', lab: 'Abandonné', c: '#dc2626', chip: 'err' }
  ];
  function statutMeta(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return STATUTS[i]; } return { k: k || '', lab: k || '—', c: '#94a3b8', chip: 'neutral' }; }
  function statutIdx(k) { for (var i = 0; i < STATUTS.length; i++) { if (STATUTS[i].k === k) return i; } return 99; }

  /* Snapshot démo — miroir exact des 8 lignes natives du chunk
     FormationsCandidats-UyR--d2I.js (dernier recours de résilience :
     API absente ET LS vide). */
  var DEMO = [
    { id: 1, candidat: 'Ndiaye Moussa', etablissement: 'École Hôtelière de Douala', diplome: 'Master Hôtellerie-Restauration', specialite: 'Gastronomie & Management', dateDebut: '09/2012', dateFin: '06/2014', statut: 'Obtenu' },
    { id: 2, candidat: 'Tchouankou Claire', etablissement: 'Université de Douala', diplome: 'Licence en Comptabilité', specialite: 'Comptabilité & Finance', dateDebut: '09/2016', dateFin: '06/2019', statut: 'Obtenu' },
    { id: 3, candidat: 'Nganou André', etablissement: 'Lycée de Bafoussam', diplome: 'BAC', specialite: 'Sciences', dateDebut: '09/2010', dateFin: '06/2013', statut: 'Obtenu' },
    { id: 4, candidat: 'Mebara Nadège', etablissement: 'Université de Yaoundé II', diplome: 'BTS Hôtellerie', specialite: 'Accueil & Réception', dateDebut: '09/2018', dateFin: '06/2020', statut: 'Obtenu' },
    { id: 5, candidat: 'Kamga Blaise', etablissement: 'Université de Douala', diplome: 'Licence Informatique', specialite: 'Développement', dateDebut: '09/2015', dateFin: '06/2018', statut: 'Obtenu' },
    { id: 6, candidat: 'Kamga Blaise', etablissement: 'IFRI Yaoundé', diplome: 'Master Informatique', specialite: 'Ingénierie Logicielle', dateDebut: '09/2020', dateFin: 'En cours', statut: 'En cours' },
    { id: 7, candidat: 'Eyenga Clarisse', etablissement: 'Université de Dschang', diplome: 'Licence Communication', specialite: 'Marketing Digital', dateDebut: '09/2019', dateFin: '06/2022', statut: 'Obtenu' },
    { id: 8, candidat: 'Nkoulou Brandon', etablissement: 'Lycée de Douala', diplome: 'BAC', specialite: 'Lettres', dateDebut: '09/2022', dateFin: '06/2025', statut: 'En cours' }
  ];

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pct(n) { return (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' %'; }

  /* Dates MM/aaaa (format natif de la page). Renvoie un index de mois
     (aaaa*12 + m - 1) ou 0 si absent/invalide — « En cours » littéral
     du natif compte comme absence de date. */
  function monthIdx(s) {
    var m = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(String(s || '').trim());
    if (!m) return 0;
    var mo = Number(m[1]), y = Number(m[2]);
    if (y < 1900 || y > 2200) return 0;
    return y * 12 + (mo - 1);
  }
  function validMonth(s) { return monthIdx(s) > 0; }
  function nowIdx() { var d = new Date(); return d.getFullYear() * 12 + d.getMonth(); }
  function monthLabel(idx) { if (!idx) return '—'; var y = Math.floor(idx / 12), m = (idx % 12) + 1; return (m < 10 ? '0' : '') + m + '/' + y; }
  function decadeOf(idx) { if (!idx) return 0; return Math.floor(idx / 120) * 10; }
  function monthsSince(idx) { return Math.max(0, nowIdx() - idx); }
  function yearsTxt(mois) {
    if (!mois || mois <= 0) return '—';
    if (mois < 24) return mois + ' mois';
    return (mois / 12).toFixed(1).replace('.', ',') + ' ans';
  }

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
  function toastsZone() { var z = $('[data-afc="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-afc', 'toasts'); z.className = 'afc-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone(); var t = el('div', 'afc-toast' + (tone ? ' ' + tone : '')); t.setAttribute('role', 'status');
    var s = el('span', null, msg); t.appendChild(s);
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_FCA_API__ || null; }
  function readLS() { try { return JSON.parse(localStorage.getItem(LS_DATA) || 'null'); } catch (e) { return null; } }
  function ready() {
    var a = api();
    if (a && typeof a.getData === 'function') return true;
    var d = readLS();
    if (d && d.formations && Array.isArray(d.formations) && d.formations.length) return true;
    return false;
  }
  function data() {
    var d = null;
    var a = api();
    if (a && typeof a.getData === 'function') { try { d = a.getData(); } catch (e) { d = null; } }
    /* chaîne de résilience W3 : API (même vide — dataset intentionnel)
       → LS admina-formationscand-data → snapshot démo */
    var raw = null;
    if (d && d.formations && Array.isArray(d.formations)) raw = d.formations;
    if (!raw) {
      var ls = readLS();
      if (ls && ls.formations && Array.isArray(ls.formations)) raw = ls.formations;
    }
    if (!raw) raw = DEMO;
    var rows = raw.map(function (r) {
      var u = {};
      for (var k in r) u[k] = r[k];
      u.id = Number(u.id) || 0;
      u.candidat = String(u.candidat || '').trim();
      u.etablissement = String(u.etablissement || '').trim();
      u.diplome = String(u.diplome || '').trim();
      u.specialite = String(u.specialite || '').trim();
      u.statut = String(u.statut || '').trim() || 'En cours';
      u.ref = 'FC-' + String(u.id).padStart(3, '0');
      u.deb = monthIdx(u.dateDebut);
      u.fin = monthIdx(u.dateFin);
      u.finTxt = u.fin > 0 ? monthLabel(u.fin) : (String(u.dateFin || '').trim() && !validMonth(u.dateFin) ? String(u.dateFin).trim() : '');
      u.durMois = u.fin > u.deb ? (u.fin - u.deb) : (u.statut === 'En cours' && u.deb > 0 ? Math.max(1, nowIdx() - u.deb + 1) : 0);
      u.durOngoing = !(u.fin > u.deb) && u.statut === 'En cours' && u.deb > 0;
      u.incoh = u.deb > 0 && u.fin > 0 && u.fin <= u.deb;
      u.late = u.statut === 'En cours' && u.fin > 0 && u.fin <= nowIdx();
      u.soon = u.statut === 'En cours' && u.fin > 0 && !u.late && u.fin <= nowIdx() + SEUILS.relanceMois;
      u.relance = u.late || u.soon;
      return u;
    });
    /* agrégats recalculés en direct : viviers, multi-formations,
       diplômes partagés, orphanes (croisement __ADMINA_CAND_API__)
       — passe 1 : comptages ; passe 2 : rattachement finalisé */
    var base = baseCandNames();
    var candN = {}, diplN = {};
    rows.forEach(function (r) {
      var kc = norm(r.candidat);
      if (kc) candN[kc] = (candN[kc] || 0) + 1;
      var kd = norm(r.diplome);
      if (kd) diplN[kd] = (diplN[kd] || 0) + 1;
    });
    rows.forEach(function (r) {
      var kc = norm(r.candidat);
      var kd = norm(r.diplome);
      r.multiCount = candN[kc] || 1;
      r.multi = r.multiCount >= 2;
      r.diplN = diplN[kd] || 1;
      r.orphan = false;
      if (base && kc && !base.map[kc]) {
        /* tolérance d'inversion Nom Prénom / Prénom Nom */
        var inv = kc.split(/\s+/).reverse().join(' ');
        r.orphan = !base.map[inv] && !fuzzyIn(base.map, kc);
      }
    });
    return rows;
  }
  function fuzzyIn(base, k) {
    for (var b in base) { if (b.indexOf(k) > -1 || k.indexOf(b) > -1) return true; }
    return false;
  }
  /* Croisement candidats : __ADMINA_CAND_API__ UNIQUEMENT (spec W3-c :
     SILENCIEUX si l'API est absente — try/catch partout).
     Renvoie { map: {clé_normalisée: 1}, list: [noms d'affichage] } */
  function baseCandNames() {
    try {
      var c = window.__ADMINA_CAND_API__;
      var d = c && typeof c.getData === 'function' ? c.getData() : null;
      if (!d || !d.candidats || !d.candidats.length) return null;
      var map = {}, list = [], seen = {};
      d.candidats.forEach(function (r) {
        if (!r) return;
        var disp = String(r.candidat || ((r.prenom || '') + ' ' + (r.nom || '')) || ((r.nom || '') + ' ' + (r.prenom || ''))).trim();
        var full = norm(((r.prenom || '') + ' ' + (r.nom || '')).trim());
        var full2 = norm(((r.nom || '') + ' ' + (r.prenom || '')).trim());
        var alias = norm(r.candidat || '');
        if (full) { map[full] = 1; if (full2) map[full2] = 1; }
        if (alias) map[alias] = 1;
        if (disp && !seen[norm(disp)]) { seen[norm(disp)] = 1; list.push(disp); }
      });
      return { map: map, list: list };
    } catch (e) { return null; }
  }
  function rowById(id) { var rows = data(); for (var i = 0; i < rows.length; i++) { if (String(rows[i].id) === String(id)) return rows[i]; } return null; }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      var cur = null;
      try { cur = a.getData(); } catch (e) { cur = null; }
      if (!cur || !cur.formations) { toast('Écriture impossible — recharger la page', 'err'); return false; }
      var nv = fn(cur);
      a.setData(nv);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback LS direct (résilience W3) */
    var cur2 = readLS();
    if (cur2 && cur2.formations) {
      var nv2 = fn(cur2);
      try { localStorage.setItem(LS_DATA, JSON.stringify(nv2)); } catch (e2) { return false; }
      if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
      refresh();
      return true;
    }
    /* démarrage en snapshot démo : amorcer le LS pour rendre persistant */
    if (!cur2) {
      try {
        var nv3 = fn({ formations: DEMO.map(function (r) { var u = {}; for (var k in r) u[k] = r[k]; return u; }) });
        localStorage.setItem(LS_DATA, JSON.stringify(nv3));
        if (actionLabel) jlog(actionLabel + ' (local)', detail || '');
        refresh();
        return true;
      } catch (e3) {}
    }
    toast('Écriture impossible — API indisponible', 'err');
    return false;
  }

  /* ================= agrégats capacitaires ================= */
  function viviers(rows) {
    var map = {};
    (rows || data()).forEach(function (r) {
      var k = norm(r.etablissement);
      if (!k) return;
      if (!map[k]) map[k] = { key: r.etablissement, name: r.etablissement, cands: {}, n: 0, obt: 0, enc: 0 };
      map[k].cands[norm(r.candidat)] = 1;
      map[k].n++;
      if (r.statut === 'Obtenu') map[k].obt++;
      else if (r.statut === 'En cours') map[k].enc++;
    });
    return Object.keys(map).map(function (k) {
      var v = map[k];
      v.candCount = Object.keys(v.cands).length;
      v.fort = v.candCount > SEUILS.fortVivier;
      return v;
    }).sort(function (a, b) { return b.candCount - a.candCount || b.n - a.n || a.name.localeCompare(b.name); });
  }
  function fortViviers(rows) { return viviers(rows).filter(function (v) { return v.fort; }); }
  function diplomes(rows) {
    var map = {};
    (rows || data()).forEach(function (r) {
      var k = norm(r.diplome);
      if (!k) return;
      if (!map[k]) map[k] = { key: k, name: r.diplome, cands: {}, n: 0, obt: 0, enc: 0, abd: 0 };
      map[k].cands[norm(r.candidat)] = 1;
      map[k].n++;
      if (r.statut === 'Obtenu') map[k].obt++;
      else if (r.statut === 'En cours') map[k].enc++;
      else map[k].abd++;
    });
    return Object.keys(map).map(function (k) {
      var v = map[k];
      v.candCount = Object.keys(v.cands).length;
      v.rare = v.candCount === 1;
      v.plethorique = v.candCount >= 3;
      return v;
    }).sort(function (a, b) { return b.candCount - a.candCount || b.n - a.n || a.name.localeCompare(b.name); });
  }
  function multiCands(rows) {
    var map = {};
    (rows || data()).forEach(function (r) {
      var k = norm(r.candidat);
      if (!k) return;
      if (!map[k]) map[k] = { key: k, name: r.candidat, ids: [], dipls: {} };
      map[k].ids.push(r.id);
      map[k].dipls[norm(r.diplome)] = r.diplome;
    });
    return Object.keys(map).map(function (k) { return map[k]; }).filter(function (m) { return m.ids.length >= 2; })
      .sort(function (a, b) { return b.ids.length - a.ids.length || a.name.localeCompare(b.name); });
  }
  function orphans(rows) {
    var base = baseCandNames();
    if (!base) return [];
    return (rows || data()).filter(function (r) { return r.orphan; });
  }

  /* ================= alertes AAA ================= */
  function computeAlerts(rows) {
    var out = [];
    var rel = rows.filter(function (r) { return r.relance; });
    if (rel.length) {
      var lateN = rel.filter(function (r) { return r.late; }).length;
      out.push({
        tone: lateN ? 'err' : 'warn',
        txt: rel.length + ' diplôme' + (rel.length > 1 ? 's' : '') + ' « à venir » à relancer — fin prévue dépassée ou dans ≤ ' + SEUILS.relanceMois + ' mois (' +
          rel.slice(0, 2).map(function (r) { return r.candidat + ' · ' + r.diplome + ' (' + (r.fin > 0 ? monthLabel(r.fin) : 'sans date') + ')'; }).join(', ') + '…)',
        f: 'relance'
      });
    }
    var forts = fortViviers(rows);
    if (forts.length) {
      out.push({
        tone: 'info',
        txt: forts.length + ' école' + (forts.length > 1 ? 's' : '') + ' à fort vivier (plus de ' + SEUILS.fortVivier + ' candidats distincts) — vivier récoltable : ' +
          forts.slice(0, 3).map(function (v) { return v.name + ' (' + v.candCount + ')'; }).join(', '),
        f: 'vivier'
      });
    }
    var multi = multiCands(rows);
    if (multi.length) {
      out.push({
        tone: 'ok',
        txt: multi.length + ' profil' + (multi.length > 1 ? 's' : '') + ' enrichi' + (multi.length > 1 ? 's' : '') + ' (≥ 2 formations) — capital documenté à exploiter : ' +
          multi.slice(0, 3).map(function (m) { return m.name + ' (' + m.ids.length + ')'; }).join(', '),
        f: 'multi'
      });
    }
    var inc = rows.filter(function (r) { return r.incoh; });
    if (inc.length) {
      out.push({
        tone: 'err',
        txt: inc.length + ' formation' + (inc.length > 1 ? 's' : '') + ' aux dates incohérentes (fin ≤ début) — corriger le capital documenté : ' +
          inc.slice(0, 2).map(function (r) { return r.ref + ' ' + r.candidat; }).join(', ') + '…',
        f: 'dates'
      });
    }
    var orp = orphans(rows);
    if (orp.length) {
      out.push({
        tone: 'warn',
        txt: orp.length + ' formation' + (orp.length > 1 ? 's' : '') + ' rattachée' + (orp.length > 1 ? 's' : '') + ' à des candidats absents de la base candidats (orphanes) : ' +
          orp.slice(0, 3).map(function (r) { return r.candidat; }).join(', ') + '…',
        f: 'orph'
      });
    }
    return out.slice(0, 6);
  }

  /* ================= filtres / tri ================= */
  function decadeLabel(d) { return d ? (d + '–' + (d + 9)) : '—'; }
  function flagLabel(f) {
    return { relance: 'À relancer', vivier: 'Forts viviers', multi: 'Profils enrichis', dates: 'Dates incohérentes', orph: 'Candidats orphelins' }[f] || f;
  }
  function kpiLabel(k) {
    return { obt: 'Obtenues', enc: 'En cours', cand: 'Multi-formations', etab: 'Forts viviers', dipl: 'Diplômes partagés' }[k] || k;
  }
  function filtered() {
    var rows = data();
    var q = norm(UI.q);
    var out = rows.filter(function (r) {
      if (UI.statut && r.statut !== UI.statut) return false;
      if (UI.etab && norm(r.etablissement) !== norm(UI.etab)) return false;
      if (UI.spec && norm(r.specialite) !== norm(UI.spec)) return false;
      if (UI.dipl && norm(r.diplome) !== norm(UI.dipl)) return false;
      if (UI.periode && UI.periode.indexOf('d:') === 0 && decadeOf(r.deb) !== Number(UI.periode.slice(2))) return false;
      if (UI.flag === 'relance' && !r.relance) return false;
      if (UI.flag === 'vivier' && !isFortRow(r, rows)) return false;
      if (UI.flag === 'multi' && !r.multi) return false;
      if (UI.flag === 'dates' && !r.incoh) return false;
      if (UI.flag === 'orph' && !r.orphan) return false;
      if (UI.kpi === 'obt' && r.statut !== 'Obtenu') return false;
      if (UI.kpi === 'enc' && r.statut !== 'En cours') return false;
      if (UI.kpi === 'cand' && !r.multi) return false;
      if (UI.kpi === 'etab' && !isFortRow(r, rows)) return false;
      if (UI.kpi === 'dipl' && !(r.diplN >= 2)) return false;
      if (q && !(norm(r.candidat).indexOf(q) > -1 || norm(r.etablissement).indexOf(q) > -1 || norm(r.diplome).indexOf(q) > -1 || norm(r.specialite).indexOf(q) > -1 || norm(r.ref).indexOf(q) > -1)) return false;
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'debut') { va = a.deb || 99999999; vb = b.deb || 99999999; }
      else if (k === 'duree') { va = a.durMois; vb = b.durMois; }
      else if (k === 'statut') { va = statutIdx(a.statut); vb = statutIdx(b.statut); }
      else if (k === 'ref') { va = Number(a.id) || 0; vb = Number(b.id) || 0; }
      else { va = norm(String(a[k] == null ? '' : a[k])); vb = norm(String(b[k] == null ? '' : b[k])); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function isFortRow(r, rows) {
    var vivs = viviers(rows);
    for (var i = 0; i < vivs.length; i++) { if (norm(vivs[i].name) === norm(r.etablissement)) return vivs[i].fort; }
    return false;
  }
  function activeFilterCount() {
    return (UI.q ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.etab ? 1 : 0) + (UI.spec ? 1 : 0) + (UI.dipl ? 1 : 0) + (UI.periode ? 1 : 0) + (UI.flag ? 1 : 0) + (UI.kpi ? 1 : 0);
  }
  function resetFilters() { UI.q = ''; UI.statut = ''; UI.etab = ''; UI.spec = ''; UI.dipl = ''; UI.periode = ''; UI.flag = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Formations\s+des\s+Candidats/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-afc="root"]');
    if (!root) {
      root = h('section', { 'data-afc': 'root', class: 'afc-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-afc-page')) {
      page.setAttribute('data-afc-page', '1');
      page.setAttribute('data-afc-oldw', page.style.width || '');
    }
    if (!natif.hasAttribute('data-afc-hide')) {
      natif.setAttribute('data-afc-hide', '1');
      natif.setAttribute('data-afc-olddisp', natif.style.display || '');
    }
    if (root.style.display !== 'none') natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-afc="root"]'); if (root) root.remove();
    $$('[data-afc-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-afc-oldw') || '';
      n.removeAttribute('data-afc-page');
      n.removeAttribute('data-afc-oldw');
    });
    $$('[data-afc-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-afc-olddisp') || '';
      n.removeAttribute('data-afc-hide');
      n.removeAttribute('data-afc-olddisp');
    });
    $$('[data-afc]').forEach(function (n) { n.remove(); });
  }

  function showNative() {
    var root = $('[data-afc="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'afc-btn afc-btn-primary afc-backbtn', 'data-afc': 'back' }, 'Revenir au Centre de pilotage');
    back.style.cssText = 'margin:6px 0;position:relative;z-index:5;';
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    if (natif && natif.parentElement) natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'formations-candidats');
  }

  var ICO = {
    journal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    viviers: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M6 21V10l6-4 6 4v11"/><path d="M10 21v-5h4v5"/></svg>',
    seuils: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    print: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tbl: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    dual: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/></svg>',
    cards: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    dup: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  var CAP_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.2 2.7 2.6 6 2.6s6-1.4 6-2.6v-4.5"/><path d="M22 9v5"/></svg>';

  function buildShell() {
    var root = $('[data-afc="root"]');
    if (!root || $('[data-afc="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="afc-hero" data-afc="hero">' +
        '<div class="afc-hero-main">' +
          '<div class="afc-hero-title">' +
            '<span class="afc-hero-ico" aria-hidden="true">' + CAP_ICON + '</span>' +
            '<div><h2 class="afc-h2">Centre de pilotage — Diplômes, Écoles &amp; Viviers</h2>' +
            '<p class="afc-hero-sub" data-afc="herosub"></p>' +
            '<p class="afc-hero-sub2" data-afc="herosub2"></p></div>' +
          '</div>' +
          '<div class="afc-hero-actions">' +
            '<button class="afc-btn" data-afc="btn-journal" title="Journal d\u2019activité (J)">' + ICO.journal + 'Journal</button>' +
            '<button class="afc-btn" data-afc="btn-viviers" title="Viviers &amp; relances (K)">' + ICO.viviers + 'Viviers</button>' +
            '<button class="afc-btn" data-afc="btn-seuils" title="Seuils de pilotage (S)">' + ICO.seuils + 'Seuils</button>' +
            '<button class="afc-btn" data-afc="btn-print" title="Imprimer">' + ICO.print + 'Imprimer</button>' +
            '<button class="afc-btn" data-afc="btn-export" title="Exporter en CSV (E)">' + ICO.dl + 'Exporter CSV</button>' +
            '<button class="afc-btn afc-btn-primary" data-afc="btn-new" title="Nouvelle formation (N)">' + ICO.plus + 'Nouvelle formation</button>' +
          '</div>' +
        '</div>' +
        '<div class="afc-hero-alerts" data-afc="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="afc-kpis" data-afc="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="afc-charts" data-afc="charts">' +
        '<div class="afc-chart-card"><div class="afc-chart-title">Statuts des formations</div><div class="afc-donut-wrap" data-afc="donut"></div></div>' +
        '<div class="afc-chart-card"><div class="afc-chart-title">Formations par période (décennie de début)</div><div class="afc-bars" data-afc="barsperiode"></div></div>' +
        '<div class="afc-chart-card"><div class="afc-chart-title">Vivier par établissement — top 8 (candidats distincts)</div><div class="afc-bars" data-afc="barsviv"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="afc-toolbar" data-afc="toolbar">' +
        '<div class="afc-search">' + ICO.search +
          '<input type="search" placeholder="Rechercher (candidat, établissement, diplôme, spécialité…)" data-afc="search" aria-label="Rechercher une formation" /></div>' +
        '<select data-afc="f-statut" class="afc-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-afc="f-etab" class="afc-sel" aria-label="Filtrer par établissement"></select>' +
        '<select data-afc="f-spec" class="afc-sel" aria-label="Filtrer par spécialité"></select>' +
        '<span class="afc-activefs" data-afc="activefs"></span>' +
        '<button class="afc-chipbtn" data-afc="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="afc-count" data-afc="count"></span>' +
        '<div class="afc-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="afc-vbtn" data-afc="v-dual" title="Vue Diplômes &amp; Écoles (P)">' + ICO.dual + 'Diplômes &amp; Écoles</button>' +
          '<button class="afc-vbtn" data-afc="v-table" title="Vue tableau (T)">' + ICO.tbl + 'Tableau</button>' +
          '<button class="afc-vbtn" data-afc="v-cards" title="Vue cartes (C)">' + ICO.cards + 'Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU */
      '<div data-afc="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-afc="selbar"></div>' +

      /* PIED */
      '<div class="afc-foot">L\u2019annuaire des qualifications — rien de ce qu\u2019un candidat a appris ne doit se perdre · source de vérité locale (navigateur) · journal d\u2019audit actif · seuils configurables · <button class="afc-link" data-afc="btn-native">Afficher le tableau natif</button></div>';

    $('[data-afc="btn-new"]', root).addEventListener('click', function () { openDialog(null, null); });
    $('[data-afc="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-afc="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'formations-candidats'); window.print(); });
    $('[data-afc="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-afc="btn-viviers"]', root).addEventListener('click', openViviers);
    $('[data-afc="btn-seuils"]', root).addEventListener('click', openSeuils);
    $('[data-afc="btn-native"]', root).addEventListener('click', showNative);
    $('[data-afc="btn-reset"]', root).addEventListener('click', function () {
      resetFilters();
      var si = $('[data-afc="search"]', root); if (si) si.value = '';
      refresh();
    });
    $('[data-afc="search"]', root).addEventListener('input', function (e) { UI.q = e.target.value; UI.page = 0; refresh(); });
    $('[data-afc="f-statut"]', root).addEventListener('change', function (e) { UI.statut = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-afc="f-etab"]', root).addEventListener('change', function (e) { UI.etab = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-afc="f-spec"]', root).addEventListener('change', function (e) { UI.spec = e.target.value; UI.kpi = ''; UI.page = 0; refresh(); });
    $('[data-afc="v-dual"]', root).addEventListener('click', function () { setView('dual'); });
    $('[data-afc="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-afc="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
  }

  function setView(v) { UI.view = v; saveUI(); refresh(); }

  /* ================= rendus dynamiques ================= */
  function renderHero() {
    var rows = data();
    var obt = rows.filter(function (r) { return r.statut === 'Obtenu'; }).length;
    var enc = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var cands = {}; var vivs = {}; var dipls = {};
    rows.forEach(function (r) {
      if (norm(r.candidat)) cands[norm(r.candidat)] = 1;
      if (norm(r.etablissement)) vivs[norm(r.etablissement)] = 1;
      if (norm(r.diplome)) dipls[norm(r.diplome)] = 1;
    });
    $('[data-afc="herosub"]').textContent =
      rows.length + ' formation' + (rows.length > 1 ? 's' : '') +
      ' · ' + obt + ' obtenue' + (obt > 1 ? 's' : '') +
      ' · ' + enc + ' en cours' +
      ' · ' + Object.keys(cands).length + ' candidat' + (Object.keys(cands).length > 1 ? 's' : '') + ' distinct' + (Object.keys(cands).length > 1 ? 's' : '');
    $('[data-afc="herosub2"]').textContent =
      Object.keys(vivs).length + ' établissement' + (Object.keys(vivs).length > 1 ? 's' : '') + ' distinct' + (Object.keys(vivs).length > 1 ? 's' : '') +
      ' · ' + Object.keys(dipls).length + ' diplôme' + (Object.keys(dipls).length > 1 ? 's' : '') + ' distinct' + (Object.keys(dipls).length > 1 ? 's' : '') +
      ' — l\u2019annuaire des qualifications';
    var zone = $('[data-afc="alerts"]');
    var al = computeAlerts(rows);
    zone.innerHTML = al.map(function (a) {
      return '<button class="afc-alert ' + a.tone + '" data-afc="alert" data-f="' + a.f + '">' + esc(a.txt) + '</button>';
    }).join('');
    $$('.afc-alert', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        resetFilters();
        UI.flag = f;
        if (f === 'orph' && !orphans(data()).length) toast('Croisement base candidats indisponible ici — alerte silencieuse sans __ADMINA_CAND_API__', '');
        refresh();
      });
    });
  }

  function renderKPIs() {
    var rows = data();
    var nb = rows.length;
    var obt = rows.filter(function (r) { return r.statut === 'Obtenu'; }).length;
    var enc = rows.filter(function (r) { return r.statut === 'En cours'; }).length;
    var rel = rows.filter(function (r) { return r.relance; }).length;
    var multi = multiCands(rows);
    var vivs = viviers(rows);
    var forts = vivs.filter(function (v) { return v.fort; });
    var dipls = diplomes(rows);
    var part = dipls.filter(function (d) { return d.candCount >= 2; });
    var nbCands = {}; rows.forEach(function (r) { if (norm(r.candidat)) nbCands[norm(r.candidat)] = 1; });
    var nbCand = Object.keys(nbCands).length;
    var kpis = [
      { k: '', t: 'FORMATIONS', v: String(nb), s: vivs.length + ' écoles · ' + dipls.length + ' diplômes', cls: '' },
      { k: 'obt', t: 'OBTENUES', v: String(obt), s: 'taux de capital ' + pct(nb ? obt / nb * 100 : 0), cls: '' },
      { k: 'enc', t: 'EN COURS', v: String(enc), s: 'dont ' + rel + ' à relancer', cls: '' },
      { k: 'cand', t: 'CANDIDATS DISTINCTS', v: String(nbCand), s: 'dont ' + multi.length + ' profil' + (multi.length > 1 ? 's' : '') + ' enrichi' + (multi.length > 1 ? 's' : '') + ' (≥ 2 formations)', cls: '' },
      { k: 'etab', t: 'ÉTABLISSEMENTS', v: String(vivs.length), s: 'dont ' + forts.length + ' fort' + (forts.length > 1 ? 's' : '') + ' vivier' + (forts.length > 1 ? 's' : '') + ' (> ' + SEUILS.fortVivier + ')', cls: '' },
      { k: 'dipl', t: 'DIPLÔMES DISTINCTS', v: String(dipls.length), s: 'dont ' + part.length + ' partagé' + (part.length > 1 ? 's' : '') + ' (≥ 2 candidats)', cls: '' }
    ];
    var zone = $('[data-afc="kpis"]');
    zone.innerHTML = kpis.map(function (k) {
      return '<button class="afc-kpi' + (k.cls === 'bad' ? ' gold' : '') + (UI.kpi === k.k && k.k ? ' on' : '') + '" data-k="' + k.k + '">' +
        '<span class="afc-kpi-t">' + esc(k.t) + '</span>' +
        '<span class="afc-kpi-v' + (k.cls === 'bad' ? ' bad' : '') + '">' + esc(k.v) + '</span>' +
        '<span class="afc-kpi-s">' + esc(k.s) + '</span></button>';
    }).join('');
    $$('.afc-kpi', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        if (!k) { resetFilters(); refresh(); return; }
        UI.kpi = UI.kpi === k ? '' : k;
        if (UI.kpi) { UI.q = ''; UI.statut = ''; UI.etab = ''; UI.spec = ''; UI.dipl = ''; UI.periode = ''; UI.flag = ''; }
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
    return '<svg viewBox="0 0 120 120" width="128" height="128" role="img" aria-label="Statuts des formations">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="currentColor">' + esc(String(total)) + '</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="8" fill="currentColor" opacity=".65">formations</text></svg>';
  }

  function renderDonut() {
    var rows = data();
    var zone = $('[data-afc="donut"]');
    var parts = STATUTS.map(function (n) {
      return { k: n.k, lab: n.lab, c: n.c, v: rows.filter(function (r) { return r.statut === n.k; }).length };
    });
    zone.innerHTML = donutSvg(parts, rows.length) +
      '<div class="afc-donut-legend">' + parts.map(function (p) {
        return '<span class="afc-dl-item' + (UI.statut === p.k ? ' on' : '') + '" data-st="' + esc(p.k) + '" role="button" tabindex="0">' +
          '<span class="afc-dl-dot" style="background:' + p.c + '"></span>' + esc(p.lab) +
          '<span class="afc-dl-val">' + p.v + ' · ' + pct(rows.length ? p.v / rows.length * 100 : 0) + '</span></span>';
      }).join('') + '</div>';
    $$('.afc-dl-item', zone).forEach(function (it) {
      it.addEventListener('click', function () {
        var k = it.getAttribute('data-st');
        UI.statut = UI.statut === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function barRowsHtml(items, fmt) {
    var mx = 0;
    items.forEach(function (it) { if (it.v > mx) mx = it.v; });
    if (!items.length || mx <= 0) return '<div class="afc-empty">Aucune donnée</div>';
    return items.map(function (it) {
      var w = Math.max(1.5, it.v / mx * 100);
      return '<div class="afc-bar-row" data-key="' + esc(it.key || '') + '" role="button" tabindex="0">' +
        '<span class="afc-bar-name" title="' + esc(it.name) + '">' + esc(it.name) + '</span>' +
        '<span class="afc-bar-track"><span class="afc-bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="afc-bar-val">' + (fmt ? fmt(it.v) : it.v) + '</span></div>';
    }).join('');
  }

  function renderBars() {
    var rows = data();
    var z1 = $('[data-afc="barsperiode"]');
    var map1 = {};
    rows.forEach(function (r) {
      var d = decadeOf(r.deb);
      if (!d) return;
      if (!map1[d]) map1[d] = { key: String(d), v: 0 };
      map1[d].v++;
    });
    var items1 = Object.keys(map1).sort().map(function (k) {
      return { key: 'd:' + k, name: decadeLabel(Number(k)), v: map1[k].v };
    });
    z1.innerHTML = barRowsHtml(items1);
    $$('.afc-bar-row', z1).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.periode = UI.periode === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    var z2 = $('[data-afc="barsviv"]');
    var items2 = viviers(rows).slice(0, 8).map(function (v) {
      return { key: v.name, name: v.name, v: v.candCount, s: v.n };
    });
    z2.innerHTML = barRowsHtml(items2, function (v) { return v + ' cand.'; });
    $$('.afc-bar-row', z2).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-key');
        UI.etab = UI.etab === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderFilters() {
    var rows = data();
    var etabs = {}; var specs = {};
    rows.forEach(function (r) { if (r.etablissement) etabs[r.etablissement] = 1; if (r.specialite) specs[r.specialite] = 1; });
    var sel = $('[data-afc="f-statut"]');
    sel.innerHTML = '<option value="">Statut : tous</option>' + STATUTS.map(function (s) {
      return '<option value="' + esc(s.k) + '"' + (UI.statut === s.k ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
    }).join('');
    var sel2 = $('[data-afc="f-etab"]');
    sel2.innerHTML = '<option value="">Établissement : tous</option>' + Object.keys(etabs).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.etab === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    var sel3 = $('[data-afc="f-spec"]');
    sel3.innerHTML = '<option value="">Spécialité : toutes</option>' + Object.keys(specs).sort().map(function (s) {
      return '<option value="' + esc(s) + '"' + (UI.spec === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    $('[data-afc="btn-reset"]').hidden = activeFilterCount() === 0;
    var cnt = $('[data-afc="count"]');
    if (cnt) cnt.textContent = filtered().length + ' / ' + rows.length + ' formations';
    var afs = $('[data-afc="activefs"]');
    var chips = [];
    if (UI.dipl) chips.push({ c: 'dipl', l: 'Diplôme : ' + UI.dipl });
    if (UI.periode) chips.push({ c: 'periode', l: 'Période : ' + decadeLabel(Number(UI.periode.slice(2))) });
    if (UI.flag) chips.push({ c: 'flag', l: flagLabel(UI.flag) });
    if (UI.kpi) chips.push({ c: 'kpi', l: kpiLabel(UI.kpi) });
    afs.innerHTML = chips.map(function (c) {
      return '<button class="afc-afchip" data-clear="' + c.c + '" title="Retirer ce filtre">' + esc(c.l) + ' <span aria-hidden="true">×</span></button>';
    }).join('');
    $$('.afc-afchip', afs).forEach(function (b) {
      b.addEventListener('click', function () { UI[b.getAttribute('data-clear')] = ''; UI.page = 0; refresh(); });
    });
  }

  /* ================= cellules ================= */
  function statutChip(r) {
    var sm = statutMeta(r.statut);
    return '<span class="afc-chip ' + sm.chip + '" title="' + esc(sm.lab) + '">' + esc(sm.lab) + '</span>';
  }
  function periodCell(r) {
    var fin = r.fin > 0 ? monthLabel(r.fin) : (r.durOngoing ? 'en cours' : (r.finTxt || '—'));
    return '<span class="afc-period">' + esc(r.deb > 0 ? monthLabel(r.deb) : (r.dateDebut || '—')) + ' <span aria-hidden="true">→</span> ' + esc(fin) + '</span>';
  }
  function durCell(r) {
    if (!r.durMois) return '<span class="afc-num">—</span>';
    return '<span class="afc-dur">' + esc(yearsTxt(r.durMois)) + (r.durOngoing ? ' <span class="afc-num">(en cours)</span>' : '') + '</span>';
  }
  function relCell(r) {
    if (r.late) return '<span class="afc-chip err" title="Fin prévue dépassée de ' + monthsSince(r.fin) + ' mois — diplôme « à venir » à relancer">à relancer</span> ';
    if (r.soon) return '<span class="afc-chip warn" title="Fin prévue dans ' + (r.fin - nowIdx()) + ' mois — préparer la relance">relance proche</span> ';
    return '';
  }

  /* ================= table ================= */
  function renderTable() {
    var rows = filtered();
    var all = data();
    var obt = all.filter(function (r) { return r.statut === 'Obtenu'; }).length;
    var enc = all.filter(function (r) { return r.statut === 'En cours'; }).length;
    var cands = {}; all.forEach(function (r) { if (norm(r.candidat)) cands[norm(r.candidat)] = 1; });
    var start = UI.page * UI.per;
    var pageRows = rows.slice(start, start + UI.per);
    var sortKey = UI.sortKey, dir = UI.sortDir;
    function th(label, key, cls) {
      var aria = 'none';
      if (key) aria = key === sortKey ? (dir < 0 ? 'descending' : 'ascending') : 'none';
      return '<th ' + (key ? 'data-sort="' + key + '" aria-sort="' + aria + '"' : '') + ' class="' + (cls || '') + '" scope="col">' + label +
        (key && key === sortKey ? '<span class="afc-arrow">' + (dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
    }
    var thead = '<tr>' + th('', null, 'afc-th-chk') + th('Réf.', 'ref') + th('Candidat', 'candidat') + th('Diplôme', 'diplome') + th('Spécialité', 'specialite') +
      th('Établissement', 'etablissement') + th('Période', 'debut') + th('Durée', 'duree') + th('Statut', 'statut') + th('Actions', null) + '</tr>';
    var body = pageRows.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td><input type="checkbox" class="afc-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner la formation de ' + esc(r.candidat) + '"></td>' +
        '<td class="afc-num">' + esc(r.ref) + '</td>' +
        '<td><span class="afc-cand" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</span>' + (r.multi ? ' <span class="afc-chip ok" title="Profil enrichi : ' + r.multiCount + ' formations documentées">multi</span>' : '') + '</td>' +
        '<td style="font-weight:600">' + esc(r.diplome || '—') + '</td>' +
        '<td>' + esc(r.specialite || '—') + '</td>' +
        '<td>' + esc(r.etablissement || '—') + '</td>' +
        '<td>' + periodCell(r) + relCell(r) + '</td>' +
        '<td>' + durCell(r) + '</td>' +
        '<td>' + statutChip(r) + '</td>' +
        '<td><div class="afc-actions">' +
          '<button class="afc-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="afc-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="afc-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (candidat conservé)">' + ICO.dup + '</button>' +
          '<button class="afc-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></td></tr>';
    }).join('');
    var foot = '<tr class="afc-tfoot"><td></td><td colspan="9">TOTAL ' + all.length + ' formations · ' + obt + ' obtenue(s) · ' + enc + ' en cours · ' + Object.keys(cands).length + ' candidats distincts</td></tr>';
    var pages = Math.max(1, Math.ceil(rows.length / UI.per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pager = '<div class="afc-pager"><span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<select class="afc-sel" data-afc="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) {
        return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>';
      }).join('') + '</select>' +
      '<button class="afc-pgbtn" data-pg="-1"' + (UI.page <= 0 ? ' disabled' : '') + '>‹</button>' +
      '<span>Page ' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="afc-pgbtn" data-pg="1"' + (UI.page >= pages - 1 ? ' disabled' : '') + '>›</button></div>';
    var card = $('[data-afc="content"]');
    card.innerHTML = '<div class="afc-tblcard"><div class="afc-tblwrap"><table class="afc-tbl"><thead>' + thead + '</thead><tbody>' +
      (body || '<tr><td colspan="10"><div class="afc-empty">Aucune formation ne correspond aux filtres — le capital documenté reste intact</div></td></tr>') +
      '</tbody><tfoot>' + foot + '</tfoot></table></div>' + pager + '</div>';
    $$('th[data-sort]', card).forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = k === 'debut' || k === 'duree' ? -1 : 1; }
        refresh();
      });
    });
    bindRowActions(card);
    $$('[data-pg]', card).forEach(function (b) {
      b.addEventListener('click', function () { UI.page += Number(b.getAttribute('data-pg')); refresh(); });
    });
    var perSel = $('[data-afc="per"]', card);
    if (perSel) perSel.addEventListener('change', function () { UI.per = Number(perSel.value); UI.page = 0; saveUI(); refresh(); });
  }

  function bindRowActions(scope) {
    $$('[data-chk]', scope).forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-chk');
        var i = UI.sel.indexOf(id);
        if (c.checked && i < 0) UI.sel.push(id);
        if (!c.checked && i > -1) UI.sel.splice(i, 1);
        renderSelBar();
        renderHero();
      });
    });
    $$('[data-open]', scope).forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.getAttribute('data-open')); }); });
    $$('[data-edit]', scope).forEach(function (b) { b.addEventListener('click', function () { openDialog(b.getAttribute('data-edit'), null); }); });
    $$('[data-dup]', scope).forEach(function (b) { b.addEventListener('click', function () { dupRow(b.getAttribute('data-dup')); }); });
    $$('[data-del]', scope).forEach(function (b) { b.addEventListener('click', function () { askDel(b.getAttribute('data-del')); }); });
  }

  /* ================= vue cartes ================= */
  function renderCards() {
    var rows = filtered();
    var card = $('[data-afc="content"]');
    card.innerHTML = rows.length ? '<div class="afc-cards">' + rows.map(function (r) {
      return '<div class="afc-cardx" data-id="' + esc(r.id) + '">' +
        '<div class="afc-card-top"><div><input type="checkbox" class="afc-chk" data-chk="' + esc(r.id) + '"' + (UI.sel.indexOf(String(r.id)) > -1 ? ' checked' : '') + ' aria-label="Sélectionner" style="margin-right:6px">' +
        '<span class="afc-num">' + esc(r.ref) + '</span></div>' +
        statutChip(r) + '</div>' +
        '<div class="afc-card-name" data-open="' + esc(r.id) + '">' + esc(r.candidat || '—') + '</div>' +
        '<div class="afc-card-dipl">' + esc(r.diplome || '—') + (r.specialite ? ' <span class="afc-num">· ' + esc(r.specialite) + '</span>' : '') + '</div>' +
        '<div class="afc-card-ecole"><span class="afc-chip neutral" data-etab="' + esc(r.etablissement) + '" role="button" tabindex="0" title="Filtrer sur cet établissement (le vivier)">' + esc(r.etablissement || '—') + '</span></div>' +
        '<div class="afc-card-meta">' + periodCell(r) + ' ' + relCell(r) + '</div>' +
        '<div class="afc-card-foot"><span class="afc-num">Durée : ' + esc(yearsTxt(r.durMois)) + '</span>' +
        '<div class="afc-card-act">' +
          '<button class="afc-ic" data-open="' + esc(r.id) + '" title="Détail">' + ICO.eye + '</button>' +
          '<button class="afc-ic" data-edit="' + esc(r.id) + '" title="Modifier">' + ICO.edit + '</button>' +
          '<button class="afc-ic" data-dup="' + esc(r.id) + '" title="Dupliquer (candidat conservé)">' + ICO.dup + '</button>' +
          '<button class="afc-ic danger" data-del="' + esc(r.id) + '" title="Supprimer">' + ICO.del + '</button>' +
        '</div></div></div>';
    }).join('') + '</div>' : '<div class="afc-empty">Aucune formation ne correspond aux filtres — le capital documenté reste intact</div>';
    bindRowActions(card);
    $$('[data-etab]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-etab');
        UI.etab = UI.etab === k ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  /* ================= VUE SIGNATURE « DIPLÔMES & ÉCOLES » =========
     Le capacitaire : (1) PAR DIPLÔME — qualifications documentées,
     compteur de candidats, barre proportionnelle, chips Obtenu/En
     cours, tags rare/pléthorique ; (2) PAR ÉTABLISSEMENT — le vivier,
     badge « fort vivier » au-dessus du seuil. Compteurs recalculés
     en direct ; chaque rangée est cliquable → filtre. */
  function renderDual() {
    var rows = data();
    var card = $('[data-afc="content"]');
    var dipls = diplomes(rows);
    var vivs = viviers(rows);
    var maxD = 0, maxV = 0;
    dipls.forEach(function (d) { if (d.candCount > maxD) maxD = d.candCount; });
    vivs.forEach(function (v) { if (v.candCount > maxV) maxV = v.candCount; });
    function bar(count, max) { return '<span class="afc-vbar-track"><span class="afc-vbar-fill" style="width:' + (max > 0 ? Math.max(2, count / max * 100) : 2) + '%"></span></span>'; }
    function tagsD(d) {
      var t = '';
      if (d.rare) t += '<span class="afc-vtag" title="Diplôme rare : un seul porteur — veiller à ne pas le perdre">rare</span>';
      if (d.plethorique) t += '<span class="afc-vtag gold" title="Diplôme pléthorique : ' + d.candCount + ' porteurs — gros vivier de qualifications">pléthorique</span>';
      return t;
    }
    var paneD =
      '<div class="afc-pane">' +
        '<div class="afc-pane-head"><h3 class="afc-pane-title">Par diplôme <span class="afc-pane-n">' + dipls.length + ' qualification' + (dipls.length > 1 ? 's' : '') + ' distincte' + (dipls.length > 1 ? 's' : '') + '</span></h3>' +
        '<span class="afc-pane-hint">Chaque diplôme = une qualification exploitable — cliquez pour filtrer.</span></div>' +
        (dipls.length ? dipls.map(function (d) {
          return '<div class="afc-vrow' + (UI.dipl && norm(UI.dipl) === d.key ? ' on' : '') + '" data-dipl="' + esc(d.name) + '" role="button" tabindex="0" title="Filtrer sur ce diplôme">' +
            '<div class="afc-vmain"><span class="afc-vname">' + esc(d.name) + '</span>' +
            '<span class="afc-vmeta">' + d.candCount + ' candidat' + (d.candCount > 1 ? 's' : '') + ' · ' + d.n + ' formation' + (d.n > 1 ? 's' : '') + '</span>' +
            '<span class="afc-vtags">' + tagsD(d) + '</span></div>' +
            '<div class="afc-vbar-zone">' + bar(d.candCount, maxD) +
            '<span class="afc-vchips">' +
              (d.obt ? '<span class="afc-chip ok">' + d.obt + ' obt.</span>' : '') +
              (d.enc ? '<span class="afc-chip info">' + d.enc + ' enc.</span>' : '') +
              (d.abd ? '<span class="afc-chip err">' + d.abd + ' abd.</span>' : '') +
            '</span></div>' +
            '<span class="afc-vcount" title="Candidats distincts portant ce diplôme">' + d.candCount + '</span>' +
          '</div>';
        }).join('') : '<div class="afc-empty">Aucun diplôme documenté</div>') +
      '</div>';
    var paneV =
      '<div class="afc-pane">' +
        '<div class="afc-pane-head"><h3 class="afc-pane-title">Par établissement <span class="afc-pane-n">' + vivs.length + ' vivier' + (vivs.length > 1 ? 's' : '') + '</span></h3>' +
        '<span class="afc-pane-hint">Chaque école est un vivier récoltable — cliquez pour filtrer.</span></div>' +
        (vivs.length ? vivs.map(function (v) {
          return '<div class="afc-vrow' + (UI.etab && norm(UI.etab) === norm(v.name) ? ' on' : '') + '" data-etabrow="' + esc(v.name) + '" role="button" tabindex="0" title="Filtrer sur cet établissement">' +
            '<div class="afc-vmain"><span class="afc-vname">' + esc(v.name) + '</span>' +
            '<span class="afc-vmeta">' + v.candCount + ' candidat' + (v.candCount > 1 ? 's' : '') + ' distinct' + (v.candCount > 1 ? 's' : '') + ' · ' + v.n + ' formation' + (v.n > 1 ? 's' : '') + '</span>' +
            '<span class="afc-vtags">' + (v.fort ? '<span class="afc-vbadge" title="Vivier fort : plus de ' + SEUILS.fortVivier + ' candidats distincts — école récoltable en priorité">★ fort vivier</span>' : '') + '</span></div>' +
            '<div class="afc-vbar-zone">' + bar(v.candCount, maxV) +
            '<span class="afc-vchips">' +
              (v.obt ? '<span class="afc-chip ok">' + v.obt + ' obt.</span>' : '') +
              (v.enc ? '<span class="afc-chip info">' + v.enc + ' enc.</span>' : '') +
            '</span></div>' +
            '<span class="afc-vcount" title="Vivier : candidats distincts">' + v.candCount + '</span>' +
          '</div>';
        }).join('') : '<div class="afc-empty">Aucun établissement documenté</div>') +
      '</div>';
    card.innerHTML = '<div class="afc-dual" data-afc="dual">' + paneD + paneV + '</div>';
    $$('[data-dipl]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-dipl');
        UI.dipl = UI.dipl && norm(UI.dipl) === norm(k) ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
    $$('[data-etabrow]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-etabrow');
        UI.etab = UI.etab && norm(UI.etab) === norm(k) ? '' : k;
        UI.kpi = '';
        UI.page = 0;
        refresh();
      });
    });
  }

  /* ================= barre de sélection ================= */
  function renderSelBar() {
    var zone = $('[data-afc="selbar"]');
    if (!zone) return;
    if (!UI.sel.length) { zone.innerHTML = ''; return; }
    var rows = UI.sel.map(function (id) { return rowById(id); }).filter(Boolean);
    var cands = {}; rows.forEach(function (r) { if (r) cands[norm(r.candidat)] = 1; });
    zone.innerHTML = '<div class="afc-selbar">' +
      '<span class="afc-selbar-info">' + rows.length + ' sélectionnée' + (rows.length > 1 ? 's' : '') + '</span>' +
      '<span class="afc-selbar-sub">' + Object.keys(cands).length + ' candidat' + (Object.keys(cands).length > 1 ? 's' : '') + ' concerné' + (Object.keys(cands).length > 1 ? 's' : '') + '</span>' +
      '<button class="afc-btn afc-btn-ghost" data-sel="exp">Exporter</button>' +
      '<button class="afc-btn afc-btn-danger" data-sel="del">Supprimer</button>' +
      '<button class="afc-btn afc-btn-ghost" data-sel="clear">Annuler</button></div>';
    $$('[data-sel]', zone).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-sel');
        if (a === 'clear') { UI.sel = []; refresh(); }
        else if (a === 'exp') exportCSV(UI.sel.slice());
        else if (a === 'del') askDelBulk(UI.sel.slice());
      });
    });
  }

  /* ================= drawer fiche (parcours du candidat) =========
     Leçon M26 : aucun handler ne se referme sur un snapshot —
     chaque mutation relit les données fraîches via mutate(cur). */
  function closeDrawer() { $$('[data-afc="drawer"],[data-afc="backdrop"][data-afc-for="drawer"]').forEach(function (n) { n.remove(); }); UI.drawerId = null; }
  function openDrawer(id) {
    var r = rowById(id);
    if (!r) return;
    closeDrawer();
    UI.drawerId = String(id);
    var bd = h('div', { class: 'afc-backdrop', 'data-afc': 'backdrop', 'data-afc-for': 'drawer' });
    bd.addEventListener('click', closeDrawer);
    var sm = statutMeta(r.statut);
    var sameCand = data().filter(function (x) { return norm(x.candidat) === norm(r.candidat); })
      .sort(function (a, b) { return (a.deb || 99999999) - (b.deb || 99999999); });
    var obtC = sameCand.filter(function (x) { return x.statut === 'Obtenu'; }).length;
    var encC = sameCand.filter(function (x) { return x.statut === 'En cours'; }).length;
    function kv(dt, dd) { return '<dt>' + dt + '</dt><dd>' + dd + '</dd>'; }
    var warnBlock = '';
    if (r.late) warnBlock += '<div class="afc-warnblock">⚠ Fin prévue dépassée de ' + monthsSince(r.fin) + ' mois — diplôme « à venir » à confirmer (statut ou date) ou à relancer auprès du candidat.</div>';
    if (r.soon) warnBlock += '<div class="afc-warnblock">⏳ Fin prévue dans ' + (r.fin - nowIdx()) + ' mois — préparer la relance au bon moment (seuil : ' + SEUILS.relanceMois + ' mois).</div>';
    if (r.incoh) warnBlock += '<div class="afc-warnblock">⚠ Dates incohérentes : la fin précède ou égale le début — corriger le capital documenté.</div>';
    if (r.orphan) warnBlock += '<div class="afc-warnblock">⚠ Candidat introuvable dans la base candidats (croisement __ADMINA_CAND_API__) — vérifier l\u2019identité ou le doublon.</div>';
    if (r.multi) warnBlock += '<div class="afc-warnblock afc-warnok">★ Profil enrichi : ' + sameCand.length + ' formations documentées pour ce candidat.</div>';
    var tl = sameCand.map(function (x) {
      var xm = statutMeta(x.statut);
      return '<div class="afc-tl-node' + (String(x.id) === String(id) ? ' cur' : '') + '" data-tl="' + esc(x.id) + '" role="button" tabindex="0" title="Ouvrir cette formation">' +
        '<span class="afc-tl-dot" style="background:' + xm.c + '"></span>' +
        '<span class="afc-tl-mid"><span class="afc-tl-line">' + esc(x.deb > 0 ? monthLabel(x.deb) : '—') + ' → ' + esc(x.fin > 0 ? monthLabel(x.fin) : 'en cours') + '</span>' +
        '<span class="afc-tl-sub">' + esc(x.etablissement || '—') + ' — ' + esc(x.diplome || '—') + '</span></span>' +
        '<span class="afc-chip ' + xm.chip + '">' + esc(xm.lab) + '</span></div>';
    }).join('');
    var dr = h('aside', { class: 'afc-drawer', 'data-afc': 'drawer', role: 'dialog', 'aria-label': 'Fiche formation ' + r.ref });
    dr.innerHTML =
      '<div class="afc-drawer-head"><div><div class="afc-drawer-title">' + esc(r.candidat || '—') + '</div>' +
      '<div class="afc-drawer-sub">' + esc(r.ref) + ' · ' + esc(r.etablissement || '—') + ' · ' + esc(r.diplome || '—') + '</div></div>' +
      '<button class="afc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="afc-drawer-body">' +
        '<div class="afc-live" style="margin-top:0"><span>Statut <b style="color:' + sm.c + '">' + esc(sm.lab) + '</b></span>' +
          '<span>Période <b>' + esc(r.deb > 0 ? monthLabel(r.deb) : '—') + ' → ' + esc(r.fin > 0 ? monthLabel(r.fin) : (r.durOngoing ? 'en cours' : '—')) + '</b></span>' +
          '<span>Durée <b>' + esc(yearsTxt(r.durMois)) + '</b></span>' +
          '<span>Spécialité <b>' + esc(r.specialite || '—') + '</b></span></div>' +
        warnBlock +
        '<div class="afc-fsec">Parcours du candidat — capital documenté (' + sameCand.length + ' formation' + (sameCand.length > 1 ? 's' : '') + ' · ' + obtC + ' obtenue' + (obtC > 1 ? 's' : '') + ' · ' + encC + ' en cours)</div>' +
        '<div class="afc-tl">' + tl + '</div>' +
        '<div class="afc-fsec">Statut rapide</div>' +
        '<div class="afc-sim-row" style="margin-bottom:10px"><label for="afc-stsel">Statut de la formation</label>' +
          '<select id="afc-stsel" class="afc-in" data-afc="stsel">' + STATUTS.map(function (s) {
            return '<option value="' + esc(s.k) + '"' + (s.k === r.statut ? ' selected' : '') + '>' + esc(s.lab) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="afc-fsec">Notes</div>' +
        '<textarea class="afc-notebox" data-afc="note" placeholder="Qualifications exploitables, précisions sur la formation, à relancer…">' + esc(r.notes || '') + '</textarea>' +
        '<div class="afc-drawer-actions">' +
          '<button class="afc-btn afc-btn-ghost" data-act="note">Enregistrer les notes</button>' +
          '<button class="afc-btn afc-btn-ghost" data-act="edit">Modifier</button>' +
          '<button class="afc-btn afc-btn-ghost" data-act="dup">Dupliquer</button>' +
          '<button class="afc-btn afc-btn-danger" data-act="del">Supprimer</button>' +
        '</div>' +
        '<div class="afc-fsec">Historique (journal)</div>' +
        '<div data-afc="dh"></div>' +
      '</div>';
    $('.afc-drawer-x', dr).addEventListener('click', closeDrawer);
    /* mini-timeline : cliquer un nœud = ouvrir CETTE formation du même candidat */
    $$('[data-tl]', dr).forEach(function (n) {
      n.addEventListener('click', function () { openDrawer(n.getAttribute('data-tl')); });
    });
    $('[data-afc="stsel"]', dr).addEventListener('change', function (e) {
      var nv = e.target.value;
      if (nv === r.statut) return;
      mutate(function (cur) {
        cur.formations = cur.formations.map(function (x) { if (String(x.id) === String(id)) x.statut = nv; return x; });
        return cur;
      }, 'Statut modifié', r.ref + ' · ' + r.candidat + ' → ' + statutMeta(nv).lab);
      toast('Statut : ' + statutMeta(nv).lab, 'ok');
      reopenDrawerAt(id);
    });
    $('[data-act="note"]', dr).addEventListener('click', function () {
      var v = $('[data-afc="note"]', dr).value;
      mutate(function (cur) {
        cur.formations = cur.formations.map(function (x) { if (String(x.id) === String(id)) x.notes = v; return x; });
        return cur;
      }, 'Notes modifiées', r.ref + ' · ' + r.candidat);
      toast('Notes enregistrées', 'ok');
    });
    $('[data-act="edit"]', dr).addEventListener('click', function () { openDialog(id, null); });
    $('[data-act="dup"]', dr).addEventListener('click', function () { dupRow(id); });
    $('[data-act="del"]', dr).addEventListener('click', function () { askDel(id); });
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    var dh = $('[data-afc="dh"]', dr);
    var jr = journalRows().filter(function (x) {
      var d = norm(x.detail || '');
      return d.indexOf(norm(r.candidat)) > -1 || d.indexOf(norm(r.ref)) > -1;
    }).slice(0, 6);
    dh.innerHTML = jr.length ? jr.map(function (x) {
      var d = new Date(x.time);
      return '<div class="afc-jrow"><span class="afc-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="afc-jact">' + esc(x.action || '') + '</span><span class="afc-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="afc-empty" style="padding:10px 0">Aucun mouvement journalisé pour ce candidat.</div>';
    jlog('Ouverture fiche', r.ref + ' · ' + r.candidat);
  }
  function reopenDrawerAt(id) {
    if (UI.drawerId !== null && String(UI.drawerId) === String(id)) openDrawer(id);
  }

  /* ================= dialog création / édition ================= */
  function closeDialog() { $$('[data-afc="dialog"],[data-afc="backdrop"][data-afc-for="dialog"]').forEach(function (n) { n.remove(); }); UI.dialogOpen = false; UI.editId = null; }
  function openDialog(editId, prefill) {
    closeDialog();
    var rows = data();
    var r = editId ? rowById(editId) : null;
    UI.dialogOpen = true;
    UI.editId = editId || null;
    var v = function (k) {
      if (r) return r[k] == null ? '' : String(r[k]);
      if (prefill && prefill[k] != null) return String(prefill[k]);
      return '';
    };
    var bd = h('div', { class: 'afc-backdrop', 'data-afc': 'backdrop', 'data-afc-for': 'dialog' });
    bd.addEventListener('click', closeDialog);
    var dlg = h('div', { class: 'afc-dialog', 'data-afc': 'dialog', role: 'dialog', 'aria-label': r ? 'Modifier une formation' : 'Nouvelle formation' });
    function opts(list, cur) {
      return list.map(function (x) {
        return '<option value="' + esc(x) + '"' + (cur === x ? ' selected' : '') + '>' + esc(x) + '</option>';
      }).join('');
    }
    function datalist(idl, key) {
      var seen = {};
      var items = [];
      rows.forEach(function (x) { var val = String(x[key] || '').trim(); if (val && !seen[norm(val)]) { seen[norm(val)] = 1; items.push(val); } });
      if (key === 'candidat') {
        var base = baseCandNames();
        if (base) base.list.forEach(function (nm) { if (!seen[norm(nm)]) { seen[norm(nm)] = 1; items.push(nm); } });
      }
      return '<datalist id="' + idl + '">' + items.sort().map(function (x2) { return '<option value="' + esc(x2) + '"></option>'; }).join('') + '</datalist>';
    }
    /* « En cours » littéral du natif = pas de date fin saisissable */
    var finVal = v('dateFin');
    if (!validMonth(finVal)) finVal = '';
    dlg.innerHTML =
      '<div class="afc-dialog-head"><h3>' + (r ? 'Modifier la formation ' + esc(r.ref) : 'Nouvelle formation') + '</h3>' +
      '<button class="afc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="afc-dialog-body">' +
        '<div class="afc-fgrid">' +
          '<label class="afc-lab">Candidat *<input class="afc-in" data-f="candidat" list="afc-dl-cand" value="' + esc(v('candidat')) + '" placeholder="Format : Nom Prénom (ex. Ndiaye Moussa)"></label>' +
          '<label class="afc-lab">Établissement *<input class="afc-in" data-f="etablissement" list="afc-dl-etab" value="' + esc(v('etablissement')) + '" placeholder="Ex. Université de Douala"></label>' +
          '<label class="afc-lab">Diplôme *<input class="afc-in" data-f="diplome" list="afc-dl-dipl" value="' + esc(v('diplome')) + '" placeholder="Ex. Master Informatique"></label>' +
          '<label class="afc-lab">Spécialité<input class="afc-in" data-f="specialite" list="afc-dl-spec" value="' + esc(v('specialite')) + '" placeholder="Ex. Développement"></label>' +
          '<label class="afc-lab">Date de début * (MM/aaaa)<input class="afc-in" data-f="dateDebut" value="' + esc(v('dateDebut')) + '" placeholder="MM/aaaa (ex. 09/2015)" inputmode="numeric"></label>' +
          '<label class="afc-lab">Date de fin (MM/aaaa — vide si en cours)<input class="afc-in" data-f="dateFin" value="' + esc(finVal) + '" placeholder="MM/aaaa (ex. 06/2018)" inputmode="numeric"></label>' +
          '<label class="afc-lab">Statut<select class="afc-in" data-f="statut">' + opts(['Obtenu', 'En cours', 'Abandonné'], v('statut') || 'En cours') + '</select></label>' +
          '<label class="afc-lab full">Notes<textarea class="afc-in afc-ta" data-f="notes" placeholder="Qualifications exploitables pour un besoin futur, précisions…">' + esc(v('notes')) + '</textarea></label>' +
        '</div>' + datalist('afc-dl-cand', 'candidat') + datalist('afc-dl-etab', 'etablissement') + datalist('afc-dl-dipl', 'diplome') + datalist('afc-dl-spec', 'specialite') +
        '<div class="afc-live" data-afc="dlg-live"></div>' +
        '<div data-afc="dlg-err"></div>' +
      '</div>' +
      '<div class="afc-dialog-foot"><span class="afc-form-hint">Rien de ce qu\u2019un candidat a appris ne doit se perdre · dates au format MM/aaaa (01/AAAA–12/AAAA) · la fin doit suivre le début</span>' +
      '<span style="display:flex;gap:8px"><button class="afc-btn afc-btn-ghost" data-act="cancel" style="color:var(--afc-text);border-color:var(--afc-line)">Annuler</button>' +
      '<button class="afc-btn afc-btn-primary" data-act="save">' + (r ? 'Enregistrer' : 'Créer la formation') + '</button></span></div>';
    $('.afc-drawer-x', dlg).addEventListener('click', closeDialog);
    $('[data-act="cancel"]', dlg).addEventListener('click', closeDialog);
    function live() {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var deb = monthIdx(val.dateDebut);
      var fin = monthIdx(val.dateFin);
      var st = val.statut || 'En cours';
      var dur = fin > deb ? (fin - deb) : (st === 'En cours' && deb > 0 ? Math.max(1, nowIdx() - deb + 1) : 0);
      var spans =
        '<span>Statut <b>' + esc(st) + '</b></span>' +
        '<span>Période <b>' + (deb ? esc(monthLabel(deb)) + ' → ' + esc(fin ? monthLabel(fin) : (st === 'En cours' ? 'en cours' : '—')) : '—') + '</b></span>' +
        '<span>Durée <b>' + (dur ? esc(yearsTxt(dur)) : '—') + '</b></span>';
      if (deb && fin && fin <= deb) spans += '<span class="bad">⚠ la fin doit suivre le début</span>';
      if (st === 'Obtenu' && !fin) spans += '<span class="bad">⚠ un diplôme obtenu doit porter sa date de fin</span>';
      if (st === 'En cours' && fin && fin <= nowIdx()) spans += '<span class="bad">⚠ fin prévue dépassée — diplôme « à venir » à relancer</span>';
      $('[data-afc="dlg-live"]', dlg).innerHTML = spans;
    }
    $$('[data-f]', dlg).forEach(function (i) { i.addEventListener('input', live); });
    live();
    $('[data-act="save"]', dlg).addEventListener('click', function () {
      var val = {};
      $$('[data-f]', dlg).forEach(function (i) { val[i.getAttribute('data-f')] = i.value; });
      var err = $('[data-afc="dlg-err"]', dlg);
      function fail(msg) { err.innerHTML = '<div class="afc-form-err">' + esc(msg) + '</div>'; }
      if (!String(val.candidat || '').trim()) return fail('Le candidat est obligatoire (format « Nom Prénom »).');
      if (!String(val.etablissement || '').trim()) return fail('L\u2019établissement est obligatoire — chaque école est un vivier récoltable.');
      if (!String(val.diplome || '').trim()) return fail('Le diplôme est obligatoire — chaque diplôme est une qualification exploitable.');
      if (!validMonth(val.dateDebut)) return fail('La date de début est obligatoire et doit être au format MM/aaaa (mois 01 à 12, année réelle).');
      if (String(val.dateFin || '').trim() && !validMonth(val.dateFin)) return fail('La date de fin doit être au format MM/aaaa (mois 01 à 12, année réelle) — ou vide si la formation est en cours.');
      if (monthIdx(val.dateFin) && monthIdx(val.dateFin) <= monthIdx(val.dateDebut)) return fail('La date de fin doit être postérieure à la date de début.');
      if (val.statut === 'Obtenu' && !String(val.dateFin || '').trim()) return fail('Un diplôme obtenu doit porter sa date de fin (MM/aaaa) — rien de ce qu\u2019un candidat a appris ne doit se perdre sans date.');
      var rec = {
        candidat: String(val.candidat).trim(),
        etablissement: String(val.etablissement).trim(),
        diplome: String(val.diplome).trim(),
        specialite: String(val.specialite || '').trim(),
        dateDebut: String(val.dateDebut).trim(),
        dateFin: String(val.dateFin || '').trim(),
        statut: String(val.statut || '').trim() || 'En cours',
        notes: String(val.notes || '')
      };
      if (editId) {
        mutate(function (cur) {
          cur.formations = cur.formations.map(function (x) { if (String(x.id) === String(editId)) { var cp = {}; for (var kk in x) cp[kk] = x[kk]; for (var k2 in rec) cp[k2] = rec[k2]; return cp; } return x; });
          return cur;
        }, 'Formation modifiée', rec.candidat + ' · ' + rec.diplome);
        toast('Formation mise à jour', 'ok');
      } else {
        mutate(function (cur) {
          var mx = cur.formations.reduce(function (m, x) { var n = Number(x.id); return isFinite(n) ? Math.max(m, n) : m; }, 0) + 1;
          var cp = {};
          for (var k2 in rec) cp[k2] = rec[k2];
          cp.id = mx;
          cur.formations = cur.formations.concat([cp]);
          return cur;
        }, 'Formation créée', rec.candidat + ' · ' + rec.diplome);
        toast('Formation créée — ' + rec.candidat, 'ok');
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
      var mx = cur.formations.reduce(function (m, x) { var n = Number(x.id); return isFinite(n) ? Math.max(m, n) : m; }, 0) + 1;
      var cp = {};
      for (var k in r) if (['ref', 'deb', 'fin', 'finTxt', 'durMois', 'durOngoing', 'incoh', 'late', 'soon', 'relance', 'multi', 'multiCount', 'diplN', 'orphan'].indexOf(k) < 0) cp[k] = r[k];
      cp.id = mx;
      cp.notes = '';
      cur.formations = cur.formations.concat([cp]);
      return cur;
    }, 'Formation dupliquée', (r.ref) + ' · ' + r.candidat + ' (candidat conservé)');
    toast('Formation dupliquée — candidat conservé, nouvelle ligne à compléter', 'ok');
  }
  function closeConfirm() { $$('[data-afc="confirm"],[data-afc="backdrop"][data-afc-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function askDel(id) {
    var r = rowById(id);
    if (!r) return;
    closeConfirm();
    var bd = h('div', { class: 'afc-backdrop', 'data-afc': 'backdrop', 'data-afc-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'afc-confirm', 'data-afc': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>Supprimer cette formation ?</h4><p>' + esc(r.ref) + ' — ' + esc(r.candidat || '—') + ' (' + esc(r.diplome || '—') + ', ' + esc(r.etablissement || '—') + '). Cette qualification sortira du capital documenté. Cette action est définitive.</p>' +
      '<div class="afc-confirm-row"><button class="afc-btn afc-btn-ghost" data-a="no" style="color:var(--afc-text);border-color:var(--afc-line)">Annuler</button>' +
      '<button class="afc-btn afc-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.formations = cur.formations.filter(function (x) { return String(x.id) !== String(id); }); return cur; }, 'Formation supprimée', r.ref + ' · ' + r.candidat);
      UI.sel = UI.sel.filter(function (x) { return x !== String(id); });
      closeConfirm(); closeDrawer();
      toast('Formation supprimée', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }
  function askDelBulk(ids) {
    closeConfirm();
    var rows = ids.map(function (i) { return rowById(i); }).filter(Boolean);
    if (!rows.length) return;
    var title = rows.length > 1 ? ('Supprimer ' + rows.length + ' formations ?') : 'Supprimer 1 formation ?';
    var bd = h('div', { class: 'afc-backdrop', 'data-afc': 'backdrop', 'data-afc-for': 'confirm' });
    bd.addEventListener('click', closeConfirm);
    var c = h('div', { class: 'afc-confirm', 'data-afc': 'confirm', role: 'alertdialog' });
    c.innerHTML = '<h4>' + title + '</h4><p>' + rows.map(function (r) { return esc(r.ref + ' ' + r.candidat); }).join(', ') + '. Ces qualifications sortiront du capital documenté. Cette action est définitive.</p>' +
      '<div class="afc-confirm-row"><button class="afc-btn afc-btn-ghost" data-a="no" style="color:var(--afc-text);border-color:var(--afc-line)">Annuler</button>' +
      '<button class="afc-btn afc-btn-danger" data-a="yes">Supprimer</button></div>';
    $('[data-a="no"]', c).addEventListener('click', closeConfirm);
    $('[data-a="yes"]', c).addEventListener('click', function () {
      mutate(function (cur) { cur.formations = cur.formations.filter(function (x) { return ids.indexOf(String(x.id)) < 0; }); return cur; }, 'Suppression groupée', rows.length + ' formations');
      UI.sel = [];
      closeConfirm(); closeDrawer();
      toast(rows.length + ' formations supprimées', 'ok');
    });
    document.body.appendChild(bd);
    document.body.appendChild(c);
  }

  /* ================= panneau Viviers & relances (K) ==============
     Le capacitaire en un écran : qui récolter, quoi relancer, quels
     profils enrichis exploiter. */
  function closeViviers() { $$('[data-afc="viviers"],[data-afc="backdrop"][data-afc-for="viviers"]').forEach(function (n) { n.remove(); }); }
  function openViviers() {
    closeViviers();
    var rows = data();
    var forts = fortViviers(rows);
    var rel = rows.filter(function (r) { return r.relance; }).sort(function (a, b) { return (a.fin || 99999999) - (b.fin || 99999999); });
    var multi = multiCands(rows);
    var bd = h('div', { class: 'afc-backdrop', 'data-afc': 'backdrop', 'data-afc-for': 'viviers' });
    bd.addEventListener('click', closeViviers);
    var p = h('div', { class: 'afc-panel', 'data-afc': 'viviers', role: 'dialog', 'aria-label': 'Viviers & relances' });
    var secF = '<div class="afc-fsec">Écoles à fort vivier — récoltables (seuil : plus de ' + SEUILS.fortVivier + ' candidats)</div>' +
      (forts.length ? forts.map(function (v) {
        return '<div class="afc-viv-row" data-viv-open="' + esc(v.name) + '" role="button" tabindex="0">' +
          '<span class="afc-viv-who"><b>' + esc(v.name) + '</b></span>' +
          '<span class="afc-viv-what">' + v.candCount + ' candidats distincts · ' + v.n + ' formations (' + v.obt + ' obt. · ' + v.enc + ' enc.)</span>' +
          '<span class="afc-vbadge">★ fort vivier</span></div>';
      }).join('') : '<div class="afc-empty" style="padding:10px 0">Aucune école au-dessus du seuil — ajuster le seuil (S) si besoin.</div>');
    var secR = '<div class="afc-fsec">Diplômes « à venir » à relancer — au bon moment</div>' +
      (rel.length ? rel.map(function (r) {
        var delta = r.fin - nowIdx();
        return '<div class="afc-viv-row' + (r.late ? ' hot' : '') + '" data-rel-open="' + esc(r.id) + '" role="button" tabindex="0">' +
          '<span class="afc-viv-who"><b>' + esc(r.candidat) + '</b> · ' + esc(r.diplome) + '</span>' +
          '<span class="afc-viv-what">fin ' + esc(monthLabel(r.fin)) + ' — ' + (r.late ? 'dépassée de ' + monthsSince(r.fin) + ' mois : confirmer le diplôme' : 'dans ' + delta + ' mois : préparer la relance') + '</span>' +
          '<button class="afc-ic" title="Ouvrir la fiche">' + ICO.eye + '</button></div>';
      }).join('') : '<div class="afc-empty" style="padding:10px 0">Aucun diplôme à venir dans la fenêtre de relance (' + SEUILS.relanceMois + ' mois).</div>');
    var secM = '<div class="afc-fsec">Profils enrichis — ≥ 2 formations documentées</div>' +
      (multi.length ? multi.map(function (m) {
        return '<div class="afc-viv-row" data-mul-open="' + esc(m.ids[0]) + '" role="button" tabindex="0">' +
          '<span class="afc-viv-who"><b>' + esc(m.name) + '</b></span>' +
          '<span class="afc-viv-what">' + m.ids.length + ' formations · ' + Object.keys(m.dipls).length + ' diplôme' + (Object.keys(m.dipls).length > 1 ? 's' : '') + ' distinct' + (Object.keys(m.dipls).length > 1 ? 's' : '') + '</span>' +
          '<button class="afc-ic" title="Ouvrir le parcours">' + ICO.eye + '</button></div>';
      }).join('') : '<div class="afc-empty" style="padding:10px 0">Aucun profil multi-formations pour le moment.</div>');
    p.innerHTML = '<div class="afc-panel-head"><h3>Viviers &amp; relances — le capacitaire</h3><button class="afc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="afc-panel-body">' +
        '<div class="afc-sim-kpis"><span><b>' + forts.length + '</b> fort(s) vivier(s)</span><span><b>' + rel.length + '</b> à relancer</span><span><b>' + multi.length + '</b> profil(s) enrichi(s)</span></div>' +
        secF + secR + secM +
        '<div class="afc-sim-tip" style="margin-top:10px">💡 Rien de ce qu\u2019un candidat a appris ne doit se perdre : récoltez les viviers, relancez les diplômes à venir au bon moment, exploitez les profils enrichis.</div>' +
      '</div>';
    $('.afc-drawer-x', p).addEventListener('click', closeViviers);
    $$('[data-viv-open]', p).forEach(function (b) {
      b.addEventListener('click', function () {
        closeViviers();
        resetFilters();
        UI.etab = b.getAttribute('data-viv-open');
        refresh();
      });
    });
    $$('[data-rel-open]', p).forEach(function (b) {
      b.addEventListener('click', function () { closeViviers(); openDrawer(b.getAttribute('data-rel-open')); });
    });
    $$('[data-mul-open]', p).forEach(function (b) {
      b.addEventListener('click', function () { closeViviers(); openDrawer(b.getAttribute('data-mul-open')); });
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
    jlog('Viviers & relances ouvert', forts.length + ' vivier(s) · ' + rel.length + ' relance(s)');
  }

  /* ================= seuils (S) ================= */
  function closeSeuils() { $$('[data-afc="seuils"],[data-afc="backdrop"][data-afc-for="seuils"]').forEach(function (n) { n.remove(); }); }
  function openSeuils() {
    closeSeuils();
    var bd = h('div', { class: 'afc-backdrop', 'data-afc': 'backdrop', 'data-afc-for': 'seuils' });
    bd.addEventListener('click', closeSeuils);
    var p = h('div', { class: 'afc-panel', 'data-afc': 'seuils', role: 'dialog', 'aria-label': 'Seuils de pilotage' });
    p.innerHTML = '<div class="afc-panel-head"><h3>Seuils de pilotage</h3><button class="afc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="afc-panel-body">' +
        '<p class="afc-cibles-note">Ces seuils alimentent les alertes « fort vivier » et « diplômes à venir à relancer » — réglez-les selon la taille de vos viviers et votre calendrier de relance.</p>' +
        '<div class="afc-sim-row"><label for="afc-s1">Vivier fort d\u2019une école (candidats distincts, au-delà du seuil)</label><input type="range" id="afc-s1" min="2" max="10" step="1" value="' + SEUILS.fortVivier + '"><input class="afc-in" type="number" min="2" max="10" step="1" data-afc="s1n" value="' + SEUILS.fortVivier + '"></div>' +
        '<div class="afc-sim-row"><label for="afc-s2">Anticipation de relance des diplômes à venir (mois avant la fin prévue)</label><input type="range" id="afc-s2" min="0" max="24" step="1" value="' + SEUILS.relanceMois + '"><input class="afc-in" type="number" min="0" max="24" step="1" data-afc="s2n" value="' + SEUILS.relanceMois + '"></div>' +
        '<div class="afc-dialog-foot" style="border:none;padding:10px 0 0"><span></span><button class="afc-btn afc-btn-primary" data-act="save">Appliquer</button></div>' +
      '</div>';
    $('.afc-drawer-x', p).addEventListener('click', closeSeuils);
    [['afc-s1', 's1n', 'fortVivier', 2, 10, 1], ['afc-s2', 's2n', 'relanceMois', 0, 24, 1]].forEach(function (cfg) {
      var rr = $('#' + cfg[0], p), n = $('[data-afc="' + cfg[1] + '"]', p);
      rr.addEventListener('input', function () { n.value = rr.value; });
      n.addEventListener('change', function () { var v = Math.max(cfg[3], Math.min(cfg[4], Number(n.value) || cfg[3])); rr.value = v; n.value = v; });
    });
    $('[data-act="save"]', p).addEventListener('click', function () {
      SEUILS.fortVivier = Math.max(2, Math.min(10, Number($('[data-afc="s1n"]', p).value) || SEUILS.fortVivier));
      SEUILS.relanceMois = Math.max(0, Math.min(24, Number($('[data-afc="s2n"]', p).value) || SEUILS.relanceMois));
      saveSeuils();
      closeSeuils();
      jlog('Seuils mis à jour', 'fortVivier ' + SEUILS.fortVivier + ' · relanceMois ' + SEUILS.relanceMois);
      toast('Seuils appliqués — alertes et viviers recalculés', 'ok');
      refresh();
    });
    document.body.appendChild(bd);
    document.body.appendChild(p);
  }

  /* ================= journal ================= */
  function closeJournal() { $$('[data-afc="journal"],[data-afc="backdrop"][data-afc-for="journal"]').forEach(function (n) { n.remove(); }); }
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
    var bd = h('div', { class: 'afc-backdrop', 'data-afc': 'backdrop', 'data-afc-for': 'journal' });
    bd.addEventListener('click', closeJournal);
    var p = h('div', { class: 'afc-panel', 'data-afc': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    p.innerHTML = '<div class="afc-panel-head"><h3>Journal d\u2019activité</h3><button class="afc-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="afc-panel-body" data-afc="jlist"></div>';
    $('.afc-drawer-x', p).addEventListener('click', closeJournal);
    document.body.appendChild(bd);
    document.body.appendChild(p);
    var list = $('[data-afc="jlist"]', p);
    var j = journalRows();
    list.innerHTML = j.length ? j.slice(0, 40).map(function (x) {
      var d = new Date(x.time);
      return '<div class="afc-jrow"><span class="afc-jtime">' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '<span class="afc-jact">' + esc(x.action || '') + '</span><span class="afc-jdet">' + esc(x.detail || '') + '</span></div>';
    }).join('') : '<div class="afc-empty">Aucune activité enregistrée pour le moment.</div>';
  }

  /* ================= export CSV (10 colonnes) ================= */
  function exportCSV(ids) {
    var rows = ids && ids.length ? ids.map(function (i) { return rowById(i); }).filter(Boolean) : filtered();
    if (!rows.length) { toast('Aucune ligne à exporter', 'err'); return; }
    var sep = ';';
    var head = ['Réf', 'Candidat', 'Établissement', 'Diplôme', 'Spécialité', 'Date début', 'Date fin', 'Durée (mois)', 'Durée (années)', 'Statut'];
    var lines = [head.join(sep)];
    rows.forEach(function (r) {
      var cells = [r.ref, r.candidat, r.etablissement, r.diplome, r.specialite, r.deb > 0 ? monthLabel(r.deb) : r.dateDebut, r.fin > 0 ? monthLabel(r.fin) : (r.durOngoing ? 'En cours' : r.finTxt), r.durMois || '', r.durMois ? (r.durMois / 12).toFixed(2).replace('.', ',') : '', r.statut];
      lines.push(cells.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(sep));
    });
    dl(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'formations-candidats-' + new Date().toISOString().slice(0, 10) + '.csv');
    jlog('Export CSV', rows.length + ' lignes');
    toast(rows.length + ' ligne(s) exportée(s)', 'ok');
  }

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeViviers(); closeSeuils(); closeNav(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-afc="dialog"]') || $('[data-afc="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null, null); e.preventDefault(); }
    else if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    else if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    else if (e.key === 'p' || e.key === 'P') { setView('dual'); e.preventDefault(); }
    else if (e.key === 'c' || e.key === 'C') { setView('cards'); e.preventDefault(); }
    else if (e.key === 't' || e.key === 'T') { setView('table'); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { openSeuils(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { openViviers(); e.preventDefault(); }
    else if (e.key === '/') { var si = $('[data-afc="search"]'); if (si) { si.focus(); e.preventDefault(); } }
    else if (e.key === '?') { toast('Raccourcis : N nouvelle formation · E export · J journal · P Diplômes & Écoles · C cartes · T tableau · S seuils · K viviers & relances · / recherche', ''); }
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
    var root = $('[data-afc="root"]');
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
    if (dark) html.setAttribute('data-dark', '1');
    else html.removeAttribute('data-dark');
  }

  /* ================= UI persist ================= */
  function loadUI() {
    try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v) { if (typeof v.view === 'string' && ['dual', 'table', 'cards'].indexOf(v.view) > -1) UI.view = v.view; if (typeof v.per === 'number') UI.per = v.per; } } catch (e) {}
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
    else if (UI.view === 'table') renderTable();
    else renderDual();
    renderSelBar();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-afc="drawer"],[data-afc="dialog"],[data-afc="confirm"],[data-afc="journal"],[data-afc="viviers"],[data-afc="seuils"]')) {
      $$('[data-afc="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null, bootTries = 0, subBound = false;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function tryActivate() {
    if (active) return;
    if (!isOn()) { bootTries = 0; return; }
    bootTries++;
    if (!ready()) {
      if (bootTries < 30) { setTimeout(tryActivate, 450); return; }
      /* après 30 essais sans API ni LS : snapshot démo (dernier filet
         de résilience) — la page native reste intacte si le montage
         échoue (montageRoot renvoie false). */
    }
    activate();
  }
  function bindApiSub() {
    if (subBound) return;
    var a = api();
    if (a && typeof a.subscribe === 'function') {
      try { a.subscribe(function () { if (active) scheduleRefresh(); }); subBound = true; } catch (e) {}
    }
  }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-afc');
    shellBuilt = false;
    bootTries = 0;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-afc]')) continue;
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
    html.classList.remove('admina-afc');
    html.removeAttribute('data-dark');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeViviers(); closeSeuils();
    UI.sel = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    bindApiSub();
    var natif = conteneurNatif();
    var root = $('[data-afc="root"]');
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-afc-hide', '1');
      natif.setAttribute('data-afc-olddisp', natif.style.display || '');
      natif.style.display = 'none';
    }
    if (!root || !root.isConnected) refresh();
  }

  /* démarrage : réessais 30 × 450 ms (relit l'API à chaque essai),
     puis snapshot démo — pont subscribe + poller 1,2 s */
  if (isOn()) tryActivate();
  setInterval(function () {
    var on = isOn();
    if (on && !active) tryActivate();
    else if (!on && active) deactivate();
  }, 350);
  window.addEventListener('popstate', function () {
    var on = isOn();
    if (on && !active) tryActivate();
    else if (!on && active) deactivate();
  });

  window.__ADMINA_FCA_UI__ = {
    version: '1.0-w3',
    isPage: isOn,
    api: api,
    data: data,
    refresh: refresh,
    openDialog: openDialog,
    openDrawer: openDrawer,
    openViviers: openViviers,
    openJournal: openJournal,
    openSeuils: openSeuils,
    setView: setView,
    exportCSV: exportCSV,
    debug: { filtered: filtered, alerts: computeAlerts, viviers: viviers, seuils: SEUILS }
  };
  try { console.info('[ADMINA_FCA] W3-c actif — /formations-candidats · vue signature « Diplômes & Écoles » (le capacitaire)'); } catch (e) {}

  window.__ADMINA_FCA_W3__ = true;
})();
