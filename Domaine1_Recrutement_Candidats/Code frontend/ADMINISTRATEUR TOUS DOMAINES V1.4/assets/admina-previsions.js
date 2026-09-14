/* =============================================================
   Admina-RH — Prévisions Postes & Offres — couche admina
   Lot 2 (M19) : CENTRE DE PILOTAGE — Effectifs & Budget de recrutement
   Héro + 6 KPI cliquables + 3 graphiques (donut statuts, budget/département,
   échéancier 8 mois) + recherche/filtres + table triable + vue cartes +
   drawer détail + création/édition complète + duplication + suppression
   confirmée + export CSV + journal d'audit + thème sombre + responsive.
   - Scope strict : /Domaine1_Recrutement_Candidats/previsions-postes
   - Idempotent (data-apx / data-apx-hide), sans collision (__ADMINA_PREV_M19__)
   - Données : window.__ADMINA_PREV_API__ (patch chunk) → fallback localStorage
   - Journal : window.__ADMINA_AUDIT__ (SPA D1)
   ============================================================= */
(function () {
  'use strict';
  if (window.__ADMINA_PREV_M19__) return;
  window.__ADMINA_PREV_M19__ = true;

  var html = document.documentElement;
  var RE_PAGE = /\/Domaine1_Recrutement_Candidats\/previsions-postes\/?$/;
  var LS_DATA = 'admina-previsions-data';
  var LS_UI = 'admina-previsions-ui';

  var STATUTS = ['A creer', 'Publiee', 'Candidatures en cours', 'Cloturee', 'Annulee'];
  var PRIORITES = ['Urgente', 'Haute', 'Moyenne', 'Basse'];
  var MOTIFS = ['Remplacement', 'Creation de poste', 'Saisonnalite', 'Surcharge'];
  var CANAUX = ['Site web', 'LinkedIn', 'Cabinet', 'Cooptation', 'Reseaux sociaux', 'École / Université', 'Presse', 'Autre'];

  var UI = { q: '', dept: '', statut: '', prio: '', motif: '', kpi: '', view: 'table', sortKey: 'id', sortDir: 1, page: 0, per: 10, drawer: 0, dialog: 0, editId: null, delId: null };

  /* ================= outils ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fcfa(n) { return (Number(n) || 0).toLocaleString('fr-FR') + ' FCFA'; }
  function kfcfa(n) { n = Number(n) || 0; return n >= 1000000 ? (n / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M' : n >= 1000 ? Math.round(n / 1000) + ' k' : String(n); }
  function pd(s) { /* dd/MM/yyyy → Date|null */
    if (!s) return null;
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s).trim());
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    return null;
  }
  function iso2fr(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || '').trim()); return m ? m[3] + '/' + m[2] + '/' + m[1] : (v || ''); }
  function fr2iso(v) { var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(v || '').trim()); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; }
  function daysUntil(s) { var d = pd(s); if (!d) return null; return Math.round((d - new Date(new Date().toDateString())) / 86400000); }
  function ecartNum(r) { return (Number(r.effectifPrevu) || 0) - (Number(r.effectifActuel) || 0); }
  function actif(r) { return r.statut !== 'Cloturee' && r.statut !== 'Annulee'; }
  function jlog(a, d) { try { window.__ADMINA_AUDIT__ && window.__ADMINA_AUDIT__.log(a, d, 'Recruteur'); } catch (e) {} }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function loadUI() { try { var v = JSON.parse(localStorage.getItem(LS_UI) || 'null'); if (v) { ['q', 'dept', 'statut', 'prio', 'motif', 'view', 'per'].forEach(function (k) { if (typeof v[k] === 'string' || typeof v[k] === 'number') UI[k] = v[k]; }); } } catch (e) {} }
  function saveUI() { try { localStorage.setItem(LS_UI, JSON.stringify({ view: UI.view, per: UI.per })); } catch (e) {} }

  /* ================= toasts ================= */
  function toastsZone() { var z = $('[data-apx="toasts"]'); if (!z) { z = document.createElement('div'); z.setAttribute('data-apx', 'toasts'); z.className = 'apx-toasts'; document.body.appendChild(z); } return z; }
  function toast(msg, tone) {
    var z = toastsZone();
    var t = document.createElement('div');
    t.className = 'apx-toast'; t.setAttribute('data-tone', tone || 'ok');
    var s = document.createElement('span'); s.textContent = msg;
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Fermer la notification'); x.onclick = function () { t.remove(); };
    t.appendChild(s); t.appendChild(x); z.appendChild(t);
    setTimeout(function () { if (t.parentElement) t.remove(); }, 4200);
  }

  /* ================= données ================= */
  function api() { return window.__ADMINA_PREV_API__ || null; }
  function data() {
    var a = api();
    if (a && typeof a.getData === 'function') { var d = a.getData(); if (Array.isArray(d)) return d; }
    try { var v = JSON.parse(localStorage.getItem(LS_DATA) || 'null'); if (Array.isArray(v)) return v; } catch (e) {}
    return [];
  }
  function mutate(fn, actionLabel, detail) {
    var a = api();
    if (a && typeof a.setData === 'function') {
      a.setData(fn);
      if (actionLabel) jlog(actionLabel, detail || '');
      refresh();
      /* React applique le setState après le handler : rattrape le rendu */
      setTimeout(refresh, 80);
      setTimeout(refresh, 350);
      return true;
    }
    /* fallback : écriture LS directe + reload */
    try {
      var cur = data().slice();
      var nv = typeof fn === 'function' ? fn(cur) : cur;
      localStorage.setItem(LS_DATA, JSON.stringify(nv));
      if (actionLabel) jlog(actionLabel, (detail || '') + ' (reload)');
      location.reload();
      return true;
    } catch (e) { toast('Écriture impossible : ' + e.message, 'err'); return false; }
  }
  function nextId(rows) { return rows.reduce(function (m, r) { return Math.max(m, Number(r.id) || 0); }, 0) + 1; }
  function nextNum(rows) { return 'PO-' + String(nextId(rows)).padStart(3, '0'); }

  /* ================= thème ================= */
  function detectTheme() {
    var root = $('[data-apx="root"]');
    if (!root) return;
    var dark = null;
    try {
      var v = localStorage.getItem('admina-dark');
      if (v === 'true') dark = true;
      else if (v === 'false') dark = false;
    } catch (e) {}
    if (dark === null) {
      var el = root.parentElement;
      while (el && el !== document.documentElement) {
        var bg = '';
        try { bg = getComputedStyle(el).backgroundColor || ''; } catch (e2) {}
        var m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?\)/.exec(bg);
        if (m && (m[4] === undefined || parseFloat(m[4]) > 0.5)) {
          var lum = (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255;
          dark = lum < 0.45;
          break;
        }
        el = el.parentElement;
      }
    }
    if (dark === null) {
      try { dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e3) { dark = false; }
    }
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  /* ================= filtrage / tri ================= */
  function filtered() {
    var rows = data();
    var q = norm(UI.q.trim());
    var out = rows.filter(function (r) {
      if (UI.dept && r.departement !== UI.dept) return false;
      if (UI.statut && r.statut !== UI.statut) return false;
      if (UI.prio && r.priorite !== UI.prio) return false;
      if (UI.motif && r.motif !== UI.motif) return false;
      if (UI.kpi === 'pourvoir' && !actif(r)) return false;
      if (UI.kpi === 'urgent') { var d = daysUntil(r.dateBesoin); if (!(d !== null && d <= 45 && actif(r))) return false; }
      if (UI.kpi === 'budget0' && (Number(r.budget) || 0) > 0) return false;
      if (q) {
        var hay = norm([r.numero, r.departement, r.poste, r.motif, r.statut, r.priorite, r.canalDiffusion, r.profilRecherche, r.notes].join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var k = UI.sortKey, dir = UI.sortDir;
    out.sort(function (a, b) {
      var va, vb;
      if (k === 'budget') { va = Number(a.budget) || 0; vb = Number(b.budget) || 0; }
      else if (k === 'effectif') { va = ecartNum(a); vb = ecartNum(b); }
      else if (k === 'dateBesoin') { va = pd(a.dateBesoin) ? pd(a.dateBesoin).getTime() : 9e15; vb = pd(b.dateBesoin) ? pd(b.dateBesoin).getTime() : 9e15; }
      else if (k === 'candidaturesRecues') { va = Number(a.candidaturesRecues) || 0; vb = Number(b.candidaturesRecues) || 0; }
      else { va = String(a[k] == null ? '' : a[k]); vb = String(b[k] == null ? '' : b[k]); va = norm(va); vb = norm(vb); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }
  function activeFilterCount() { return (UI.q ? 1 : 0) + (UI.dept ? 1 : 0) + (UI.statut ? 1 : 0) + (UI.prio ? 1 : 0) + (UI.motif ? 1 : 0) + (UI.kpi ? 1 : 0); }
  function resetFilters() { UI.q = ''; UI.dept = ''; UI.statut = ''; UI.prio = ''; UI.motif = ''; UI.kpi = ''; UI.page = 0; }

  /* ================= conteneur natif ================= */
  function conteneurNatif() {
    var hs = $$('h5, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/Pr[eé]visions\s*[—-]\s*Postes/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ================= construction DOM ================= */
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function h(sel, attrs, htmlStr) { var e = document.createElement(sel); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (htmlStr != null) e.innerHTML = htmlStr; return e; }

  function mountRoot() {
    var natif = conteneurNatif();
    if (!natif) return false;
    var root = $('[data-apx="root"]');
    if (!root) {
      root = h('section', { 'data-apx': 'root', class: 'apx-root' });
      natif.parentElement.insertBefore(root, natif);
    }
    /* le conteneur de page natif (enfant flex) peut s'écraser → largeur pleine */
    var page = natif.parentElement;
    if (page && !page.hasAttribute('data-apx-page')) {
      page.setAttribute('data-apx-page', '1');
      page.setAttribute('data-apx-oldw', page.style.width || '');
    }
    natif.setAttribute('data-apx-hide', '1');
    natif.setAttribute('data-apx-olddisp', natif.style.display || '');
    natif.style.display = 'none';
    return true;
  }
  function unmountRoot() {
    var root = $('[data-apx="root"]'); if (root) root.remove();
    $$('[data-apx-page]').forEach(function (n) {
      n.style.width = n.getAttribute('data-apx-oldw') || '';
      n.removeAttribute('data-apx-page');
      n.removeAttribute('data-apx-oldw');
    });
    $$('[data-apx-hide]').forEach(function (n) {
      n.style.display = n.getAttribute('data-apx-olddisp') || '';
      n.removeAttribute('data-apx-hide');
      n.removeAttribute('data-apx-olddisp');
    });
    $$('[data-apx]').forEach(function (n) { n.remove(); });
  }

  function buildShell() {
    var root = $('[data-apx="root"]');
    if (!root || $('[data-apx="hero"]', root)) return;
    root.innerHTML =
      /* HÉRO */
      '<div class="apx-hero" data-apx="hero">' +
        '<div class="apx-hero-main">' +
          '<div class="apx-hero-title">' +
            '<span class="apx-hero-ico" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8" rx="1"/><rect x="12" y="6" width="3" height="12" rx="1"/><rect x="17" y="13" width="3" height="5" rx="1"/></svg>' +
            '</span>' +
            '<div><h2 class="apx-h2">Centre de pilotage — Effectifs &amp; budget de recrutement</h2>' +
            '<p class="apx-hero-sub" data-apx="herosub"></p></div>' +
          '</div>' +
          '<div class="apx-hero-actions">' +
            '<button class="apx-btn" data-apx="btn-journal" title="Journal d\u2019activit\u00e9 (J)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Journal</button>' +
            '<button class="apx-btn" data-apx="btn-sim" title="Simulateur d\u2019effectifs et de budget (S)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>Simulateur</button>' +
            '<button class="apx-btn" data-apx="btn-import" title="Importer un fichier CSV (I)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>Importer</button>' +
            '<button class="apx-btn" data-apx="btn-nc" title="Registre des \u00e9carts de conformit\u00e9 (R)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>\u00c9carts <span class="apx-nc-badge" data-apx="nc-badge"></span></button>' +
            '<button class="apx-btn" data-apx="btn-print" title="Imprimer (P)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 14h8v7H8z"/></svg>Imprimer</button>' +
            '<button class="apx-btn" data-apx="btn-export" title="Exporter en CSV (E)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>Exporter CSV</button>' +
            '<button class="apx-btn apx-btn-primary" data-apx="btn-new" title="Nouvelle prévision (N)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Nouvelle prévision</button>' +
          '</div>' +
        '</div>' +
        '<div class="apx-hero-alerts" data-apx="alerts"></div>' +
      '</div>' +

      /* KPI */
      '<div class="apx-kpis" data-apx="kpis"></div>' +

      /* GRAPHIQUES */
      '<div class="apx-charts" data-apx="charts">' +
        '<div class="apx-chart-card"><div class="apx-chart-title">Répartition par statut</div><div class="apx-donut-wrap" data-apx="donut"></div></div>' +
        '<div class="apx-chart-card"><div class="apx-chart-title">Budget par département</div><div class="apx-bars" data-apx="bars"></div></div>' +
        '<div class="apx-chart-card"><div class="apx-chart-title">Échéancier des besoins (8 mois)</div><div data-apx="timeline"></div></div>' +
      '</div>' +

      /* BARRE D'OUTILS */
      '<div class="apx-toolbar" data-apx="toolbar">' +
        '<div class="apx-search"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input type="search" placeholder="Rechercher (poste, département, profil, notes…)" data-apx="search" aria-label="Rechercher une prévision" /></div>' +
        '<select data-apx="f-dept" class="apx-sel" aria-label="Filtrer par département"></select>' +
        '<select data-apx="f-statut" class="apx-sel" aria-label="Filtrer par statut"></select>' +
        '<select data-apx="f-prio" class="apx-sel" aria-label="Filtrer par priorité"></select>' +
        '<select data-apx="f-motif" class="apx-sel" aria-label="Filtrer par motif"></select>' +
        '<button class="apx-chipbtn" data-apx="btn-reset" hidden>Réinitialiser</button>' +
        '<span class="apx-count" data-apx="count"></span>' +
        '<div class="apx-views" role="group" aria-label="Mode d\u2019affichage">' +
          '<button class="apx-vbtn" data-apx="v-table" title="Vue tableau"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>Tableau</button>' +
          '<button class="apx-vbtn" data-apx="v-cards" title="Vue cartes"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>Cartes</button>' +
        '</div>' +
      '</div>' +

      /* CONTENU (table ou cartes) */
      '<div data-apx="content"></div>' +

      /* BARRE DE SÉLECTION */
      '<div data-apx="selbar"></div>' +

      /* PIED */
      '<div class="apx-foot">Source de vérité locale (navigateur) — journal d\u2019audit ISO 9001 actif · <button class="apx-link" data-apx="btn-native">Afficher le tableau natif</button></div>';

    /* --- listeners fixes --- */
    $('[data-apx="btn-new"]', root).addEventListener('click', function () { openDialog(null); });
    $('[data-apx="btn-export"]', root).addEventListener('click', function () { exportCSV(null); });
    $('[data-apx="btn-print"]', root).addEventListener('click', function () { jlog('Impression', 'previsions-postes'); window.print(); });
    $('[data-apx="btn-journal"]', root).addEventListener('click', openJournal);
    $('[data-apx="btn-sim"]', root).addEventListener('click', openSimulator);
    $('[data-apx="btn-import"]', root).addEventListener('click', openImport);
    $('[data-apx="btn-nc"]', root).addEventListener('click', openNC);
    $('[data-apx="btn-native"]', root).addEventListener('click', showNative);
    $('[data-apx="v-table"]', root).addEventListener('click', function () { setView('table'); });
    $('[data-apx="v-cards"]', root).addEventListener('click', function () { setView('cards'); });
    var si = $('[data-apx="search"]', root);
    si.addEventListener('input', function () { UI.q = si.value; UI.page = 0; refresh(); });
    ['dept', 'statut', 'prio', 'motif'].forEach(function (k) {
      var s = $('[data-apx="f-' + k + '"]', root);
      s.addEventListener('change', function () { UI[k] = s.value; UI.page = 0; refresh(); });
    });
    $('[data-apx="btn-reset"]', root).addEventListener('click', function () { resetFilters(); refresh(); });
    document.addEventListener('keydown', onKey);
  }

  function setView(v) { UI.view = v; saveUI(); refresh(); }

  function showNative() {
    /* bascule volontaire vers le tableau natif (données identiques, sans enhancement) */
    var root = $('[data-apx="root"]');
    var natif = conteneurNatif();
    if (root) root.style.display = 'none';
    if (natif) { natif.style.display = ''; }
    var back = h('button', { class: 'apx-btn apx-btn-primary apx-backbtn', 'data-apx': 'back' }, 'Revenir au Centre de pilotage');
    back.addEventListener('click', function () { if (root) root.style.display = ''; back.remove(); if (natif) natif.style.display = 'none'; });
    natif.parentElement.insertBefore(back, natif);
    jlog('Affichage tableau natif', 'previsions-postes');
  }

  /* ================= rendus dynamiques ================= */
  function chip(txt, tone) { return '<span class="apx-chip" data-tone="' + tone + '">' + esc(txt) + '</span>'; }
  function statutTone(s) { return { 'A creer': 'neutral', 'Publiee': 'info', 'Candidatures en cours': 'warn', 'Cloturee': 'ok', 'Annulee': 'err' }[s] || 'neutral'; }
  function prioTone(p) { return { Urgente: 'err', Haute: 'warn', Moyenne: 'info', Basse: 'neutral' }[p] || 'neutral'; }

  function renderHero() {
    var root = $('[data-apx="root"]'); if (!root) return;
    var rows = data();
    var actifs = rows.filter(actif);
    var sum = function (f) { return rows.reduce(function (s, r) { return s + (f(r) || 0); }, 0); };
    var ec = sum(ecartNum);
    var bud = sum(function (r) { return Number(r.budget) || 0; });
    var urg = actifs.filter(function (r) { var d = daysUntil(r.dateBesoin); return d !== null && d <= 45; }).length;
    $('[data-apx="herosub"]', root).textContent =
      rows.length + ' prévision' + (rows.length > 1 ? 's' : '') + ' · ' + ec + ' poste' + (ec > 1 ? 's' : '') + ' à pourvoir · budget prévisionnel ' + fcfa(bud) + (urg ? ' · ' + urg + ' échéance' + (urg > 1 ? 's' : '') + ' urgente' + (urg > 1 ? 's' : '') + '' : '');

    /* alertes contextuelles */
    var al = $('[data-apx="alerts"]', root);
    var items = [];
    if (urg) items.push('<span class="apx-alert" data-tone="err"><b>' + urg + '</b> besoin' + (urg > 1 ? 's' : '') + ' urgent' + (urg > 1 ? 's' : '') + ' (&lt; 45 j ou en retard)</span>');
    var noChan = actifs.filter(function (r) { return !r.canalDiffusion; }).length;
    if (noChan) items.push('<span class="apx-alert" data-tone="warn"><b>' + noChan + '</b> prévision' + (noChan > 1 ? 's' : '') + ' sans canal de diffusion</span>');
    var noBud = actifs.filter(function (r) { return !(Number(r.budget) || 0); }).length;
    if (noBud) items.push('<span class="apx-alert" data-tone="warn"><b>' + noBud + '</b> sans budget renseigné</span>');
    var aCreer = rows.filter(function (r) { return r.statut === 'A creer'; }).length;
    if (aCreer) items.push('<span class="apx-alert" data-tone="info"><b>' + aCreer + '</b> prévision' + (aCreer > 1 ? 's' : '') + ' à créer / publier</span>');
    al.innerHTML = items.join('');
  }

  function renderKPIs() {
    var root = $('[data-apx="root"]'); if (!root) return;
    var rows = data();
    var actifs = rows.filter(actif);
    var sum = function (f) { return rows.reduce(function (s, r) { return s + (f(r) || 0); }, 0); };
    var ec = sum(ecartNum);
    var bud = sum(function (r) { return Number(r.budget) || 0; });
    var urg = actifs.filter(function (r) { var d = daysUntil(r.dateBesoin); return d !== null && d <= 45; }).length;
    var kpis = [
      { k: '', t: 'EFFECTIF ACTUEL', v: sum(function (r) { return Number(r.effectifActuel) || 0; }), s: 'postes occupés aujourd\u2019hui' },
      { k: '', t: 'EFFECTIF PRÉVU', v: sum(function (r) { return Number(r.effectifPrevu) || 0; }), s: 'cible après recrutements' },
      { k: 'pourvoir', t: 'À POURVOIR', v: ec, s: 'écarts cumulés (+N)', tone: 'err' },
      { k: '', t: 'BUDGET TOTAL', v: kfcfa(bud), s: fcfa(bud), tone: 'violet' },
      { k: '', t: 'BUDGET MOYEN / POSTE', v: ec > 0 ? kfcfa(Math.round(bud / Math.max(ec, 1))) : '—', s: 'par poste à pourvoir' },
      { k: 'urgent', t: 'ÉCHÉANCES URGENTES', v: urg, s: '≤ 45 j ou en retard', tone: urg ? 'err' : 'ok' }
    ];
    $('[data-apx="kpis"]', root).innerHTML = kpis.map(function (x) {
      return '<button class="apx-kpi' + (UI.kpi === x.k && x.k ? ' apx-kpi-on' : '') + '" data-kpi="' + x.k + '"' + (x.tone ? ' data-tone="' + x.tone + '"' : '') + '>' +
        '<span class="apx-kpi-t">' + x.t + '</span><span class="apx-kpi-v">' + esc(String(x.v)) + '</span><span class="apx-kpi-s">' + esc(x.s) + '</span></button>';
    }).join('');
    $$('.apx-kpi', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kpi');
        UI.kpi = (UI.kpi === k || !k) ? '' : k;
        UI.page = 0;
        refresh();
      });
    });
  }

  function renderDonut() {
    var root = $('[data-apx="root"]'); if (!root) return;
    var rows = data();
    var counts = STATUTS.map(function (s) { return { s: s, n: rows.filter(function (r) { return r.statut === s; }).length }; }).filter(function (x) { return x.n > 0; });
    var tot = counts.reduce(function (s, x) { return s + x.n; }, 0);
    var wrap = $('[data-apx="donut"]', root);
    if (!tot) { wrap.innerHTML = '<div class="apx-empty">Aucune donnée</div>'; return; }
    var colors = { 'A creer': '#94a3b8', 'Publiee': '#8b5cf6', 'Candidatures en cours': '#f59e0b', 'Cloturee': '#10b981', 'Annulee': '#ef4444' };
    var cx = 70, cy = 70, r = 52, ri = 34, a0 = -Math.PI / 2;
    var segs = counts.map(function (x) {
      var a1 = a0 + (x.n / tot) * Math.PI * 2;
      var large = (a1 - a0) > Math.PI ? 1 : 0;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var xi1 = cx + ri * Math.cos(a1), yi1 = cy + ri * Math.sin(a1);
      var xi0 = cx + ri * Math.cos(a0), yi0 = cy + ri * Math.sin(a0);
      var d = 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' L' + xi1.toFixed(2) + ' ' + yi1.toFixed(2) + ' A' + ri + ' ' + ri + ' 0 ' + large + ' 0 ' + xi0.toFixed(2) + ' ' + yi0.toFixed(2) + ' Z';
      a0 = a1;
      return '<path d="' + d + '" fill="' + colors[x.s] + '" opacity="0.92"><title>' + esc(x.s) + ' : ' + x.n + '</title></path>';
    }).join('');
    wrap.innerHTML = '<div class="apx-donut">' +
      '<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Répartition par statut">' + segs +
      '<text x="70" y="66" text-anchor="middle" class="apx-donut-n">' + tot + '</text>' +
      '<text x="70" y="82" text-anchor="middle" class="apx-donut-l">prévisions</text></svg>' +
      '<div class="apx-legend">' + counts.map(function (x) {
        return '<button class="apx-leg' + (UI.statut === x.s ? ' apx-leg-on' : '') + '" data-st="' + esc(x.s) + '"><span class="apx-dot" style="background:' + colors[x.s] + '"></span>' + esc(x.s) + ' <b>' + x.n + '</b></button>';
      }).join('') + '</div></div>';
    $$('.apx-leg', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-st');
        UI.statut = UI.statut === s ? '' : s;
        UI.kpi = ''; UI.page = 0;
        refresh();
      });
    });
  }

  function renderBars() {
    var root = $('[data-apx="root"]'); if (!root) return;
    var rows = data();
    var by = {};
    rows.forEach(function (r) { var d = r.departement || '—'; by[d] = (by[d] || 0) + (Number(r.budget) || 0); });
    var arr = Object.keys(by).map(function (k) { return { d: k, b: by[k] }; }).sort(function (a, b) { return b.b - a.b; }).slice(0, 8);
    var max = Math.max.apply(null, arr.map(function (x) { return x.b; }).concat([1]));
    var wrap = $('[data-apx="bars"]', root);
    if (!arr.length) { wrap.innerHTML = '<div class="apx-empty">Aucune donnée</div>'; return; }
    wrap.innerHTML = arr.map(function (x) {
      var w = Math.max(2, Math.round(x.b / max * 100));
      return '<button class="apx-bar' + (UI.dept === x.d ? ' apx-bar-on' : '') + '" data-d="' + esc(x.d) + '" title="' + esc(x.d) + ' : ' + fcfa(x.b) + '">' +
        '<span class="apx-bar-l">' + esc(x.d) + '</span>' +
        '<span class="apx-bar-t"><span class="apx-bar-f" style="width:' + w + '%"></span></span>' +
        '<span class="apx-bar-v">' + kfcfa(x.b) + '</span></button>';
    }).join('');
    $$('.apx-bar', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = b.getAttribute('data-d');
        UI.dept = UI.dept === d ? '' : d;
        UI.kpi = ''; UI.page = 0;
        refresh();
      });
    });
  }

  function renderTimeline() {
    var root = $('[data-apx="root"]'); if (!root) return;
    var rows = data().filter(actif);
    var now = new Date();
    var months = [];
    for (var i = -1; i <= 6; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({ y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString('fr-FR', { month: 'short' }), n: { U: 0, H: 0, M: 0, B: 0 } });
    }
    rows.forEach(function (r) {
      var d = pd(r.dateBesoin); if (!d) return;
      months.forEach(function (mo) { if (mo.y === d.getFullYear() && mo.m === d.getMonth()) { var c = (r.priorite || 'M').charAt(0).toUpperCase(); if (mo.n[c] != null) mo.n[c]++; } });
    });
    var max = Math.max.apply(null, months.map(function (m) { return m.n.U + m.n.H + m.n.M + m.n.B; }).concat([1]));
    var pc = { U: '#ef4444', H: '#f59e0b', M: '#8b5cf6', B: '#94a3b8' };
    var wrap = $('[data-apx="timeline"]', root);
    wrap.innerHTML =
      '<div class="apx-tl">' + months.map(function (m) {
        var t = m.n.U + m.n.H + m.n.M + m.n.B;
        var hU = Math.round(m.n.U / max * 100), hH = Math.round(m.n.H / max * 100), hM = Math.round(m.n.M / max * 100), hB = Math.round(m.n.B / max * 100);
        return '<div class="apx-tl-col" title="' + m.label + ' ' + m.y + ' : ' + t + ' besoin(s)">' +
          '<div class="apx-tl-stack">' +
          (m.n.U ? '<span class="apx-tl-seg" style="height:' + hU + '%;background:' + pc.U + '"></span>' : '') +
          (m.n.H ? '<span class="apx-tl-seg" style="height:' + hH + '%;background:' + pc.H + '"></span>' : '') +
          (m.n.M ? '<span class="apx-tl-seg" style="height:' + hM + '%;background:' + pc.M + '"></span>' : '') +
          (m.n.B ? '<span class="apx-tl-seg" style="height:' + hB + '%;background:' + pc.B + '"></span>' : '') +
          (t ? '' : '<span class="apx-tl-zero"></span>') +
          '</div><span class="apx-tl-n">' + (t || '') + '</span><span class="apx-tl-l">' + m.label + '</span></div>';
      }).join('') + '</div>' +
      '<div class="apx-tl-legend">' +
        '<span><i style="background:' + pc.U + '"></i>Urgente</span><span><i style="background:' + pc.H + '"></i>Haute</span>' +
        '<span><i style="background:' + pc.M + '"></i>Moyenne</span><span><i style="background:' + pc.B + '"></i>Basse</span></div>';
  }

  function sortIcon(k) { return UI.sortKey === k ? (UI.sortDir > 0 ? ' ▲' : ' ▼') : ''; }

  function renderContent() {
    var root = $('[data-apx="root"]'); if (!root) return;
    var c = $('[data-apx="content"]', root);
    var rows = filtered();
    var n = activeFilterCount();
    var rst = $('[data-apx="btn-reset"]', root);
    if (rst) rst.hidden = n === 0;
    var cnt = $('[data-apx="count"]', root);
    if (cnt) cnt.textContent = rows.length + ' / ' + data().length + ' prévision(s)' + (n ? ' · ' + n + ' filtre' + (n > 1 ? 's' : '') : '');

    if (UI.view === 'cards') { c.innerHTML = renderCards(rows); bindCards(c); }
    else { c.innerHTML = renderTable(rows); bindTable(c); }
  }

  function renderTable(rows) {
    var cols = [
      { k: 'numero', t: 'N°' }, { k: 'departement', t: 'Département' }, { k: 'poste', t: 'Poste' },
      { k: 'effectif', t: 'Effectifs' }, { k: 'effectif', t: 'Écart' }, { k: 'motif', t: 'Motif' },
      { k: 'dateBesoin', t: 'Besoin le' }, { k: 'priorite', t: 'Priorité' }, { k: 'statut', t: 'Statut' },
      { k: 'canalDiffusion', t: 'Canal' }, { k: 'budget', t: 'Budget' }, { k: 'candidaturesRecues', t: 'Cand.' }
    ];
    var per = UI.per, tot = rows.length, pages = Math.max(1, Math.ceil(tot / per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pageRows = rows.slice(UI.page * per, UI.page * per + per);

    var htmlStr = '<div class="apx-tablewrap"><table class="apx-table"><thead><tr>' +
      '<th class="apx-th-chk"><input type="checkbox" class="apx-chk-all" aria-label="Sélectionner toute la page"></th>' +
      cols.map(function (c0) {
        return '<th tabindex="0" role="button" aria-sort="' + (UI.sortKey === c0.k ? (UI.sortDir > 0 ? 'ascending' : 'descending') : 'none') + '" data-sort="' + c0.k + '" title="Trier par ' + esc(c0.t) + '">' + esc(c0.t) + '<span class="apx-si">' + sortIcon(c0.k) + '</span></th>';
      }).join('') +
      '<th class="apx-th-act">Actions</th></tr></thead><tbody>';
    if (!pageRows.length) {
      htmlStr += '<tr><td colspan="' + (cols.length + 2) + '" class="apx-norows">Aucune prévision ne correspond aux critères.</td></tr>';
    }
    pageRows.forEach(function (r) {
      var d = daysUntil(r.dateBesoin);
      var late = d !== null && d <= 45 && actif(r);
      htmlStr += '<tr class="apx-row" data-id="' + r.id + '" tabindex="0">' +
        '<td class="apx-td-chk"><input type="checkbox" class="apx-chk" data-id="' + r.id + '"' + (SEL.indexOf(Number(r.id)) >= 0 ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(r.numero || '') + '"></td>' +
        '<td class="apx-td-num">' + esc(r.numero || '') + '</td>' +
        '<td>' + esc(r.departement || '—') + '</td>' +
        '<td class="apx-td-poste">' + esc(r.poste || '—') + '</td>' +
        '<td class="apx-td-c">' + esc((Number(r.effectifActuel) || 0) + ' → ' + (Number(r.effectifPrevu) || 0)) + '</td>' +
        '<td class="apx-td-c"><span class="apx-badge" data-tone="' + (ecartNum(r) > 0 ? 'err' : 'neutral') + '">+' + ecartNum(r) + '</span></td>' +
        '<td>' + esc(r.motif || '—') + '</td>' +
        '<td' + (late ? ' class="apx-td-late"' : ' title="Besoin le ' + esc(r.dateBesoin || '') + '"') + '>' + esc(r.dateBesoin || '—') + (late ? ' <span class="apx-minichip" data-tone="err">' + (d >= 0 ? 'dans ' + d + ' j' : 'retard ' + Math.abs(d) + ' j') + '</span>' : '') + '</td>' +
        '<td>' + chip(r.priorite || '—', prioTone(r.priorite)) + '</td>' +
        '<td>' + chip(r.statut || '—', statutTone(r.statut)) + '</td>' +
        '<td>' + (r.canalDiffusion ? esc(r.canalDiffusion) : '—') + '</td>' +
        '<td class="apx-td-r">' + fcfa(r.budget) + '</td>' +
        '<td class="apx-td-c">' + esc(String(Number(r.candidaturesRecues) || 0)) + '</td>' +
        '<td class="apx-td-act">' +
          '<button class="apx-ic" data-act="view" title="Voir le détail" aria-label="Voir le détail de ' + esc(r.numero) + '"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
          '<button class="apx-ic" data-act="edit" title="Modifier" aria-label="Modifier ' + esc(r.numero) + '"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg></button>' +
          '<button class="apx-ic" data-act="dup" title="Dupliquer" aria-label="Dupliquer ' + esc(r.numero) + '"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>' +
          '<button class="apx-ic apx-ic-danger" data-act="del" title="Supprimer" aria-label="Supprimer ' + esc(r.numero) + '"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg></button>' +
        '</td></tr>';
    });
    htmlStr += '</tbody></table></div>';
    htmlStr += renderPager(tot, pages);
    return htmlStr;
  }

  function renderCards(rows) {
    var per = UI.per, tot = rows.length, pages = Math.max(1, Math.ceil(tot / per));
    if (UI.page >= pages) UI.page = pages - 1;
    var pageRows = rows.slice(UI.page * per, UI.page * per + per);
    var htmlStr = '<div class="apx-cards">';
    if (!pageRows.length) htmlStr += '<div class="apx-empty">Aucune prévision ne correspond aux critères.</div>';
    pageRows.forEach(function (r) {
      var d = daysUntil(r.dateBesoin);
      var late = d !== null && d <= 45 && actif(r);
      var pct = (Number(r.effectifPrevu) || 0) > 0 ? Math.min(100, Math.round((Number(r.effectifActuel) || 0) / (Number(r.effectifPrevu) || 1) * 100)) : 0;
      htmlStr += '<div class="apx-card" data-id="' + r.id + '" tabindex="0">' +
        '<div class="apx-card-top"><span class="apx-td-num">' + esc(r.numero || '') + '</span>' + chip(r.statut || '—', statutTone(r.statut)) + '</div>' +
        '<div class="apx-card-poste">' + esc(r.poste || '—') + '</div>' +
        '<div class="apx-card-dept">' + esc(r.departement || '—') + ' · ' + esc(r.motif || '—') + '</div>' +
        '<div class="apx-card-gauge"><span style="width:' + pct + '%"></span></div>' +
        '<div class="apx-card-meta"><span>' + (Number(r.effectifActuel) || 0) + ' → ' + (Number(r.effectifPrevu) || 0) + ' <em>(+' + ecartNum(r) + ')</em></span>' +
        '<span class="apx-card-bud">' + fcfa(r.budget) + '</span></div>' +
        '<div class="apx-card-meta2"><span' + (late ? ' class="apx-td-late"' : '') + '>Besoin : ' + esc(r.dateBesoin || '—') + (late ? ' · ' + (d >= 0 ? d + ' j' : 'retard ' + Math.abs(d) + ' j') : '') + '</span>' + chip(r.priorite || '—', prioTone(r.priorite)) + '</div>' +
        '<div class="apx-card-act">' +
          '<button class="apx-ic" data-act="view" title="Voir">👁</button>' +
          '<button class="apx-ic" data-act="edit" title="Modifier">✎</button>' +
          '<button class="apx-ic" data-act="dup" title="Dupliquer">⧉</button>' +
          '<button class="apx-ic apx-ic-danger" data-act="del" title="Supprimer">🗑</button>' +
        '</div></div>';
    });
    htmlStr += '</div>';
    htmlStr += renderPager(tot, pages);
    return htmlStr;
  }

  function renderPager(tot, pages) {
    if (tot === 0) return '';
    var from = tot === 0 ? 0 : UI.page * UI.per + 1;
    var to = Math.min(tot, (UI.page + 1) * UI.per);
    var htmlStr = '<div class="apx-pager"><span class="apx-pager-info">' + from + '–' + to + ' sur ' + tot + '</span>' +
      '<select class="apx-sel apx-per" data-apx="per" aria-label="Lignes par page">' + [5, 10, 25].map(function (n) { return '<option value="' + n + '"' + (UI.per === n ? ' selected' : '') + '>' + n + ' / page</option>'; }).join('') + '</select>' +
      '<span class="apx-pager-btns">' +
      '<button class="apx-btn apx-btn-sm" data-pg="first"' + (UI.page === 0 ? ' disabled' : '') + ' aria-label="Première page">«</button>' +
      '<button class="apx-btn apx-btn-sm" data-pg="prev"' + (UI.page === 0 ? ' disabled' : '') + ' aria-label="Page précédente">‹</button>' +
      '<span class="apx-pager-cur">' + (UI.page + 1) + ' / ' + pages + '</span>' +
      '<button class="apx-btn apx-btn-sm" data-pg="next"' + (UI.page >= pages - 1 ? ' disabled' : '') + ' aria-label="Page suivante">›</button>' +
      '<button class="apx-btn apx-btn-sm" data-pg="last"' + (UI.page >= pages - 1 ? ' disabled' : '') + ' aria-label="Dernière page">»</button>' +
      '</span></div>';
    return htmlStr;
  }

  function bindTable(c) {
    var chkAll = $('.apx-chk-all', c);
    if (chkAll) {
      chkAll.checked = pageCheckedState().all;
      chkAll.indeterminate = pageCheckedState().some && !pageCheckedState().all;
      chkAll.addEventListener('change', function () {
        var pageIds = $$('.apx-chk', c).map(function (cb) { return Number(cb.getAttribute('data-id')); });
        if (chkAll.checked) {
          pageIds.forEach(function (id) { if (SEL.indexOf(id) < 0) SEL.push(id); });
        } else {
          SEL = SEL.filter(function (id) { return pageIds.indexOf(id) < 0; });
        }
        renderSelBar();
      });
    }
    $$('.apx-chk', c).forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = Number(cb.getAttribute('data-id'));
        if (cb.checked) { if (SEL.indexOf(id) < 0) SEL.push(id); }
        else SEL = SEL.filter(function (x) { return x !== id; });
        var st = pageCheckedState();
        if (chkAll) { chkAll.checked = st.all; chkAll.indeterminate = st.some && !st.all; }
        renderSelBar();
      });
    });
    $$('th[data-sort]', c).forEach(function (th) {
      function doSort() {
        var k = th.getAttribute('data-sort');
        if (UI.sortKey === k) UI.sortDir = -UI.sortDir;
        else { UI.sortKey = k; UI.sortDir = 1; }
        jlog('Tri', 'previsions par ' + k + ' (' + (UI.sortDir > 0 ? 'asc' : 'desc') + ')');
        refresh();
      }
      th.addEventListener('click', doSort);
      th.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doSort(); } });
    });
    $$('.apx-row', c).forEach(function (tr) {
      var id = Number(tr.getAttribute('data-id'));
      tr.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        openDrawer(id);
      });
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter') openDrawer(id); });
    });
    $$('button[data-act]', c).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = Number(b.closest('[data-id]').getAttribute('data-id'));
        var act = b.getAttribute('data-act');
        if (act === 'view') openDrawer(id);
        if (act === 'edit') openDialog(id);
        if (act === 'dup') duplicate(id);
        if (act === 'del') askDelete(id);
      });
    });
    bindPager(c);
  }

  function bindCards(c) {
    $$('.apx-card', c).forEach(function (cd) {
      var id = Number(cd.getAttribute('data-id'));
      cd.addEventListener('click', function (e) { if (!e.target.closest('button')) openDrawer(id); });
    });
    $$('button[data-act]', c).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = Number(b.closest('[data-id]').getAttribute('data-id'));
        var act = b.getAttribute('data-act');
        if (act === 'view') openDrawer(id);
        if (act === 'edit') openDialog(id);
        if (act === 'dup') duplicate(id);
        if (act === 'del') askDelete(id);
      });
    });
    bindPager(c);
  }

  function bindPager(c) {
    $$('button[data-pg]', c).forEach(function (b) {
      b.addEventListener('click', function () {
        var pg = b.getAttribute('data-pg');
        var tot = filtered().length, pages = Math.max(1, Math.ceil(tot / UI.per));
        if (pg === 'first') UI.page = 0;
        if (pg === 'prev') UI.page = Math.max(0, UI.page - 1);
        if (pg === 'next') UI.page = Math.min(pages - 1, UI.page + 1);
        if (pg === 'last') UI.page = pages - 1;
        refresh();
      });
    });
    var per = $('[data-apx="per"]', c);
    if (per) per.addEventListener('change', function () { UI.per = parseInt(per.value, 10) || 10; UI.page = 0; saveUI(); refresh(); });
  }

  /* ================= sélects filtres dynamiques ================= */
  function renderFilters() {
    var root = $('[data-apx="root"]'); if (!root) return;
    var rows = data();
    var depts = Array.from(new Set(rows.map(function (r) { return r.departement || ''; }).filter(Boolean))).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    fillSelect($('[data-apx="f-dept"]', root), depts, UI.dept, 'Tous départements');
    fillSelect($('[data-apx="f-statut"]', root), STATUTS, UI.statut, 'Tous statuts');
    fillSelect($('[data-apx="f-prio"]', root), PRIORITES, UI.prio, 'Toutes priorités');
    fillSelect($('[data-apx="f-motif"]', root), MOTIFS, UI.motif, 'Tous motifs');
    var si = $('[data-apx="search"]', root);
    if (si && document.activeElement !== si && si.value !== UI.q) si.value = UI.q;
    $('[data-apx="v-table"]', root).classList.toggle('apx-vbtn-on', UI.view === 'table');
    $('[data-apx="v-cards"]', root).classList.toggle('apx-vbtn-on', UI.view === 'cards');
  }
  function fillSelect(sel, items, val, allLabel) {
    if (!sel) return;
    var opts = ['<option value="">' + esc(allLabel) + '</option>'].concat(items.map(function (i) {
      return '<option value="' + esc(i) + '"' + (val === i ? ' selected' : '') + '>' + esc(i) + '</option>';
    }));
    var cur = sel.value;
    if (val !== cur || sel.options.length !== opts.length) sel.innerHTML = opts.join('');
  }

  /* ================= drawer détail ================= */
  function rowById(id) { return data().filter(function (r) { return Number(r.id) === id; })[0] || null; }
  function openDrawer(id) {
    UI.drawer = id;
    var root = $('[data-apx="root"]'); if (!root) return;
    closeDrawer();
    var r = rowById(id); if (!r) return;
    var d = daysUntil(r.dateBesoin);
    var fields = [
      ['Département', r.departement], ['Poste', r.poste],
      ['Effectif actuel → prévu', (Number(r.effectifActuel) || 0) + ' → ' + (Number(r.effectifPrevu) || 0) + '  (+' + ecartNum(r) + ')'],
      ['Motif', r.motif], ['Priorité', r.priorite], ['Statut', r.statut],
      ['Besoin le', r.dateBesoin + (d !== null ? '  (' + (d >= 0 ? 'dans ' + d + ' j' : Math.abs(d) + ' j de retard') + ')' : '')],
      ['Canal de diffusion', r.canalDiffusion || '—'],
      ['Budget', fcfa(r.budget)], ['Candidatures reçues', String(Number(r.candidaturesRecues) || 0)],
      ['Publication', r.datePublication || '—']
    ];
    var back = h('div', { class: 'apx-backdrop', 'data-apx': 'backdrop', 'data-apx-for': 'drawer' });
    back.addEventListener('click', closeDrawer);
    var dr = h('aside', { class: 'apx-drawer', 'data-apx': 'drawer', role: 'dialog', 'aria-label': 'Détail ' + (r.numero || '') });
    dr.innerHTML =
      '<div class="apx-drawer-head"><div><span class="apx-td-num">' + esc(r.numero || '') + '</span>' + chip(r.statut || '', statutTone(r.statut)) + chip(r.priorite || '', prioTone(r.priorite)) +
      '<div class="apx-drawer-title">' + esc(r.poste || '—') + '</div><div class="apx-drawer-sub">' + esc(r.departement || '') + '</div></div>' +
      '<button class="apx-ic apx-drawer-x" aria-label="Fermer le panneau">✕</button></div>' +
      '<div class="apx-drawer-body">' +
        '<div class="apx-kv">' + fields.map(function (f) { return '<div class="apx-k"><span>' + esc(f[0]) + '</span><b>' + esc(f[1] == null ? '—' : String(f[1])) + '</b></div>'; }).join('') + '</div>' +
        (r.profilRecherche ? '<div class="apx-drawer-sec">Profil recherché</div><p class="apx-drawer-p">' + esc(r.profilRecherche) + '</p>' : '') +
        '<div class="apx-drawer-sec">Notes</div>' +
        '<textarea class="apx-ta" data-apx="d-notes" rows="3" placeholder="Ajouter une note…">' + esc(r.notes || '') + '</textarea>' +
        '<div class="apx-drawer-row"><label class="apx-lab">Statut' +
          '<select class="apx-sel" data-apx="d-statut">' + STATUTS.map(function (s) { return '<option' + (r.statut === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('') + '</select></label>' +
          '<button class="apx-btn" data-apx="d-save">Enregistrer les modifications</button></div>' +
        '<div class="apx-drawer-sec">Actions</div>' +
        '<div class="apx-drawer-actions">' +
          '<button class="apx-btn" data-apx="d-edit">✎ Modifier la fiche</button>' +
          '<button class="apx-btn" data-apx="d-dup">⧉ Dupliquer</button>' +
          '<button class="apx-btn" data-apx="d-dem">↗ Créer la demande de recrutement</button>' +
          '<button class="apx-btn apx-btn-danger" data-apx="d-del">🗑 Supprimer</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(back);
    document.body.appendChild(dr);
    $('.apx-drawer-x', dr).addEventListener('click', closeDrawer);
    $('[data-apx="d-save"]', dr).addEventListener('click', function () {
      var ns = $('[data-apx="d-statut"]', dr).value;
      var nt = $('[data-apx="d-notes"]', dr).value;
      mutate(function (rows) {
        return rows.map(function (x) { return Number(x.id) === id ? Object.assign({}, x, { statut: ns, notes: nt }) : x; });
      }, 'Modification rapide', (r.numero || '') + ' statut=' + ns);
      toast('Modifications enregistrées (' + (r.numero || '') + ')');
    });
    $('[data-apx="d-edit"]', dr).addEventListener('click', function () { openDialog(id); });
    $('[data-apx="d-dup"]', dr).addEventListener('click', function () { duplicate(id); });
    $('[data-apx="d-del"]', dr).addEventListener('click', function () { askDelete(id); });
    $('[data-apx="d-dem"]', dr).addEventListener('click', function () {
      try {
        localStorage.setItem('admina_demande_prefill', JSON.stringify({
          poste: r.poste, departement: r.departement, budget: r.budget, priorite: r.priorite,
          from: r.numero, at: new Date().toISOString()
        }));
      } catch (e) {}
      jlog('Passerelle', 'prévision ' + (r.numero || '') + ' → demande de recrutement');
      toast('Prévision transmise — ouvrez « Demandes » pour finaliser la demande');
    });
  }
  function closeDrawer() {
    $$('[data-apx="drawer"],[data-apx="backdrop"][data-apx-for="drawer"]').forEach(function (n) { n.remove(); });
    UI.drawer = 0;
  }

  /* ================= dialog création / édition ================= */
  function openDialog(editId) {
    var root = $('[data-apx="root"]'); if (!root) return;
    closeDialog();
    UI.editId = editId || null;
    var r = editId ? rowById(editId) : null;
    var back = h('div', { class: 'apx-backdrop', 'data-apx': 'backdrop', 'data-apx-for': 'dialog' });
    back.addEventListener('click', function (e) { if (e.target === back) closeDialog(); });
    var dl0 = h('div', { class: 'apx-dialog', 'data-apx': 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': (r ? 'Modifier' : 'Nouvelle') + ' prévision' });
    var v = function (k) { return r && r[k] != null ? String(r[k]) : ''; };
    var dIso = r ? (fr2iso(r.dateBesoin) || (pd(r.dateBesoin) ? pd(r.dateBesoin).toISOString().slice(0, 10) : '')) : '';
    var pIso = r ? (fr2iso(r.datePublication) || (pd(r.datePublication) ? pd(r.datePublication).toISOString().slice(0, 10) : '')) : '';
    var datalists = CANAUX.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('');
    dl0.innerHTML =
      '<div class="apx-dialog-head"><h3>' + (r ? 'Modifier la prévision ' + esc(r.numero || '') : 'Nouvelle prévision') + '</h3>' +
      '<button class="apx-ic apx-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apx-dialog-body">' +
        '<div class="apx-fsec">Identification</div>' +
        '<div class="apx-fgrid">' +
          '<label class="apx-lab">Département *<input class="apx-in" data-apx="i-dept" value="' + esc(v('departement')) + '" list="apx-depts" placeholder="ex. Restauration" required></label>' +
          '<label class="apx-lab">Poste *<input class="apx-in" data-apx="i-poste" value="' + esc(v('poste')) + '" placeholder="ex. Chef Cuisinier" required></label>' +
        '</div>' +
        '<div class="apx-fsec">Effectifs</div>' +
        '<div class="apx-fgrid apx-f3">' +
          '<label class="apx-lab">Effectif actuel<input class="apx-in" type="number" min="0" step="1" data-apx="i-act" value="' + esc(v('effectifActuel') || '0') + '"></label>' +
          '<label class="apx-lab">Effectif prévu<input class="apx-in" type="number" min="0" step="1" data-apx="i-prev" value="' + esc(v('effectifPrevu') || '1') + '"></label>' +
          '<div class="apx-lab">Écart calculé<div class="apx-ecart" data-apx="i-ecart">+0</div></div>' +
        '</div>' +
        '<div class="apx-fsec">Planification</div>' +
        '<div class="apx-fgrid apx-f3">' +
          '<label class="apx-lab">Motif *<select class="apx-sel" data-apx="i-motif">' + ['<option value="">— Choisir —</option>'].concat(MOTIFS.map(function (m) { return '<option' + (r && r.motif === m ? ' selected' : '') + '>' + esc(m) + '</option>'; })).join('') + '</select></label>' +
          '<label class="apx-lab">Besoin le *<input class="apx-in" type="date" data-apx="i-date" value="' + esc(dIso) + '" required></label>' +
          '<label class="apx-lab">Priorité *<select class="apx-sel" data-apx="i-prio">' + ['<option value="">— Choisir —</option>'].concat(PRIORITES.map(function (m) { return '<option' + (r && r.priorite === m ? ' selected' : '') + '>' + esc(m) + '</option>'; })).join('') + '</select></label>' +
        '</div>' +
        '<div class="apx-fgrid apx-f3">' +
          '<label class="apx-lab">Statut<select class="apx-sel" data-apx="i-statut">' + STATUTS.map(function (m) { return '<option' + ((r ? r.statut : 'A creer') === m ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></label>' +
          '<label class="apx-lab">Canal de diffusion<input class="apx-in" data-apx="i-canal" value="' + esc(v('canalDiffusion')) + '" list="apx-canaux" placeholder="ex. LinkedIn"></label>' +
          '<label class="apx-lab">Budget (FCFA)<input class="apx-in" type="number" min="0" step="1000" data-apx="i-budget" value="' + esc(v('budget') || '0') + '"></label>' +
        '</div>' +
        '<div class="apx-fsec">Candidatures &amp; publication</div>' +
        '<div class="apx-fgrid apx-f2">' +
          '<label class="apx-lab">Candidatures reçues<input class="apx-in" type="number" min="0" step="1" data-apx="i-cand" value="' + esc(v('candidaturesRecues') || '0') + '"></label>' +
          '<label class="apx-lab">Date de publication<input class="apx-in" type="date" data-apx="i-pub" value="' + esc(pIso) + '"></label>' +
        '</div>' +
        '<div class="apx-fsec">Profil &amp; notes</div>' +
        '<label class="apx-lab">Profil recherché<textarea class="apx-ta" data-apx="i-profil" rows="2" placeholder="Diplômes, expérience, compétences…">' + esc(v('profilRecherche')) + '</textarea></label>' +
        '<label class="apx-lab">Notes<textarea class="apx-ta" data-apx="i-notes" rows="2">' + esc(v('notes')) + '</textarea></label>' +
        '<div class="apx-form-err" data-apx="ferr" hidden></div>' +
      '</div>' +
      '<div class="apx-dialog-foot">' +
        '<span class="apx-form-hint">* obligatoire — l\u2019écart et le numéro sont calculés automatiquement</span>' +
        '<div><button class="apx-btn" data-apx="c-cancel">Annuler</button>' +
        '<button class="apx-btn apx-btn-primary" data-apx="c-save">' + (r ? 'Enregistrer' : 'Créer la prévision') + '</button></div>' +
      '</div>';
    document.body.appendChild(h('datalist', { id: 'apx-canaux' }, datalists));
    var deptsDL = Array.from(new Set(data().map(function (x) { return x.departement || ''; }).filter(Boolean))).map(function (d) { return '<option value="' + esc(d) + '">'; }).join('');
    document.body.appendChild(h('datalist', { id: 'apx-depts' }, deptsDL));
    document.body.appendChild(back);
    document.body.appendChild(dl0);

    var updEcart = function () {
      var a = Number($('[data-apx="i-act"]', dl0).value) || 0;
      var b = Number($('[data-apx="i-prev"]', dl0).value) || 0;
      $('[data-apx="i-ecart"]', dl0).textContent = '+' + Math.max(0, b - a);
    };
    $('[data-apx="i-act"]', dl0).addEventListener('input', updEcart);
    $('[data-apx="i-prev"]', dl0).addEventListener('input', updEcart);
    updEcart();

    $('.apx-drawer-x', dl0).addEventListener('click', closeDialog);
    $('[data-apx="c-cancel"]', dl0).addEventListener('click', closeDialog);
    $('[data-apx="c-save"]', dl0).addEventListener('click', function () { saveDialog(); });
    $('[data-apx="i-dept"]', dl0).focus();
    try { var __pf = JSON.parse(localStorage.getItem('admina_prev_prefill') || 'null'); if (__pf && __pf.canalDiffusion && Date.now() - (__pf._t || 0) < 120000) { var __ic = $('[data-apx="i-canal"]', dl0); if (__ic && !__ic.value) __ic.value = String(__pf.canalDiffusion); localStorage.removeItem('admina_prev_prefill'); } } catch (__e) {}
  }
  function closeDialog() {
    $$('[data-apx="dialog"],[data-apx="backdrop"][data-apx-for="dialog"]').forEach(function (n) { n.remove(); });
    $$('#apx-canaux,#apx-depts').forEach(function (n) { n.remove(); });
    UI.dialog = 0; UI.editId = null;
  }
  function saveDialog() {
    var dl0 = $('[data-apx="dialog"]'); if (!dl0) return;
    var g = function (k) { var e = $('[data-apx="' + k + '"]', dl0); return e ? e.value.trim() : ''; };
    var departement = g('i-dept'), poste = g('i-poste'), motif = g('i-motif'), date = g('i-date'), prio = g('i-prio');
    var err = '';
    if (!departement) err = 'Le département est obligatoire.';
    else if (!poste) err = 'Le poste est obligatoire.';
    else if (!motif) err = 'Le motif est obligatoire.';
    else if (!date) err = 'La date de besoin est obligatoire.';
    else if (!prio) err = 'La priorité est obligatoire.';
    var fe = $('[data-apx="ferr"]', dl0);
    if (err) { fe.textContent = err; fe.hidden = false; fe.scrollIntoView({ block: 'nearest' }); return; }
    fe.hidden = true;
    var payload = {
      departement: departement, poste: poste,
      effectifActuel: Number(g('i-act')) || 0, effectifPrevu: Number(g('i-prev')) || 0,
      motif: motif, dateBesoin: iso2fr(date), priorite: prio, statut: g('i-statut') || 'A creer',
      canalDiffusion: g('i-canal'), budget: Number(g('i-budget')) || 0,
      candidaturesRecues: Number(g('i-cand')) || 0, datePublication: iso2fr(g('i-pub')),
      profilRecherche: g('i-profil'), notes: g('i-notes')
    };
    if (UI.editId) {
      var eid = UI.editId;
      mutate(function (rows) {
        return rows.map(function (x) {
          if (Number(x.id) !== eid) return x;
          var nv = Object.assign({}, x, payload);
          nv.ecart = '+' + String(Math.max(0, ecartNum(nv)));
          return nv;
        });
      }, 'Modification', payload.poste + ' (' + departement + ')');
      toast('Prévision modifiée');
    } else {
      mutate(function (rows) {
        var id = nextId(rows);
        var nv = Object.assign({ id: id, numero: 'PO-' + String(id).padStart(3, '0'), ecart: '+0', profilRecherche: '', notes: '' }, payload);
        nv.ecart = '+' + String(Math.max(0, ecartNum(nv)));
        return rows.concat([nv]);
      }, 'Création', payload.poste + ' (' + departement + ')');
      toast('Prévision créée — elle est désormais persistante');
    }
    closeDialog();
    UI.page = 0;
    refresh();
  }

  /* ================= duplication / suppression ================= */
  function duplicate(id) {
    var r = rowById(id); if (!r) return;
    mutate(function (rows) {
      var nid = nextId(rows);
      var cp = Object.assign({}, r, { id: nid, numero: 'PO-' + String(nid).padStart(3, '0'), statut: 'A creer', datePublication: '', candidaturesRecues: 0 });
      return rows.concat([cp]);
    }, 'Duplication', r.numero + ' → ' + r.poste);
    toast('Prévision dupliquée (statut « À créer »)');
  }
  function askDelete(id) {
    var r = rowById(id); if (!r) return;
    closeConfirm();
    var back = h('div', { class: 'apx-backdrop', 'data-apx': 'backdrop', 'data-apx-for': 'confirm' });
    var dl0 = h('div', { class: 'apx-dialog apx-dialog-sm', 'data-apx': 'confirm', role: 'alertdialog', 'aria-modal': 'true' });
    dl0.innerHTML =
      '<div class="apx-dialog-head"><h3>Supprimer ' + esc(r.numero || '') + ' ?</h3></div>' +
      '<div class="apx-dialog-body"><p>« <b>' + esc(r.poste || '') + '</b> » (' + esc(r.departement || '') + ') sera définitivement supprimé du plan de prévision. Cette action est enregistrée au journal.</p></div>' +
      '<div class="apx-dialog-foot"><div>' +
      '<button class="apx-btn" data-apx="k-no">Annuler</button>' +
      '<button class="apx-btn apx-btn-danger" data-apx="k-yes">Supprimer</button></div></div>';
    document.body.appendChild(back);
    document.body.appendChild(dl0);
    $('[data-apx="k-no"]', dl0).addEventListener('click', closeConfirm);
    back.addEventListener('click', closeConfirm);
    $('[data-apx="k-yes"]', dl0).addEventListener('click', function () {
      closeConfirm();
      if (UI.drawer) closeDrawer();
      mutate(function (rows) { return rows.filter(function (x) { return Number(x.id) !== id; }); }, 'Suppression', r.numero + ' ' + (r.poste || ''));
      toast('Prévision ' + (r.numero || '') + ' supprimée', 'warn');
      refresh();
    });
  }
  function closeConfirm() { $$('[data-apx="confirm"],[data-apx="backdrop"][data-apx-for="confirm"]').forEach(function (n) { n.remove(); }); }
  function cleanupBackdrops() {
    if (!document.querySelector('[data-apx="drawer"],[data-apx="dialog"],[data-apx="confirm"],[data-apx="journal"]')) {
      $$('[data-apx="backdrop"]').forEach(function (b) { b.remove(); });
    }
  }

  /* ================= multi-sélection ================= */
  var SEL = [];
  function renderSelBar() {
    var bar = $('[data-apx="selbar"]');
    if (!bar) return;
    if (!SEL.length) { bar.innerHTML = ''; return; }
    var rows = data().filter(function (r) { return SEL.indexOf(Number(r.id)) >= 0; });
    var bud = rows.reduce(function (s, r) { return s + (Number(r.budget) || 0); }, 0);
    var ec = rows.reduce(function (s, r) { return s + ecartNum(r); }, 0);
    bar.innerHTML = '<div class="apx-selbar">' +
      '<span class="apx-selbar-info"><b>' + SEL.length + '</b> sélectionnée(s) · +' + ec + ' poste(s) · ' + fcfa(bud) + '</span>' +
      '<span class="apx-selbar-actions">' +
      '<select class="apx-sel" data-apx="sel-status"><option value="">Statut…</option>' + STATUTS.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select>' +
      '<button class="apx-btn apx-btn-sm" data-apx="sel-status-go">Appliquer</button>' +
      '<button class="apx-btn apx-btn-sm" data-apx="sel-export">Exporter</button>' +
      '<button class="apx-btn apx-btn-sm apx-btn-danger" data-apx="sel-del">Supprimer</button>' +
      '<button class="apx-btn apx-btn-sm" data-apx="sel-clear">Désélectionner</button></span></div>';
    $('[data-apx="sel-export"]', bar).addEventListener('click', function () { exportCSV(rows); });
    $('[data-apx="sel-clear"]', bar).addEventListener('click', function () { SEL = []; renderSelBar(); refresh(); });
    $('[data-apx="sel-del"]', bar).addEventListener('click', function () { askDeleteMany(rows.map(function (r) { return Number(r.id); })); });
    $('[data-apx="sel-status-go"]', bar).addEventListener('click', function () {
      var v = $('[data-apx="sel-status"]', bar).value;
      if (!v) { toast('Choisissez un statut à appliquer', 'warn'); return; }
      var ids = SEL.slice();
      mutate(function (all) { return all.map(function (x) { return ids.indexOf(Number(x.id)) >= 0 ? Object.assign({}, x, { statut: v }) : x; }); }, 'Modification groupée', ids.length + ' prévision(s) → ' + v);
      toast(ids.length + ' prévision(s) → ' + v);
      SEL = [];
      refresh();
    });
  }
  function askDeleteMany(ids) {
    if (!ids.length) return;
    closeConfirm();
    var rows = data().filter(function (r) { return ids.indexOf(Number(r.id)) >= 0; });
    var bud = rows.reduce(function (s, r) { return s + (Number(r.budget) || 0); }, 0);
    var back = h('div', { class: 'apx-backdrop', 'data-apx': 'backdrop', 'data-apx-for': 'confirm' });
    back.addEventListener('click', closeConfirm);
    var dl0 = h('div', { class: 'apx-dialog apx-dialog-sm', 'data-apx': 'confirm', role: 'alertdialog', 'aria-modal': 'true' });
    dl0.innerHTML =
      '<div class="apx-dialog-head"><h3>Supprimer ' + ids.length + ' prévision(s) ?</h3></div>' +
      '<div class="apx-dialog-body"><p>Sélection concernée : <b>' + esc(rows.slice(0, 4).map(function (r) { return r.numero || ('#' + r.id); }).join(', ')) + (rows.length > 4 ? '…' : '') + '</b><br>Budget cumulé retiré du plan : <b>' + fcfa(bud) + '</b>. Action enregistrée au journal.</p></div>' +
      '<div class="apx-dialog-foot"><div>' +
      '<button class="apx-btn" data-apx="k-no">Annuler</button>' +
      '<button class="apx-btn apx-btn-danger" data-apx="k-yes">Supprimer ' + ids.length + '</button></div></div>';
    document.body.appendChild(back);
    document.body.appendChild(dl0);
    $('[data-apx="k-no"]', dl0).addEventListener('click', closeConfirm);
    $('[data-apx="k-yes"]', dl0).addEventListener('click', function () {
      closeConfirm();
      mutate(function (all) { return all.filter(function (x) { return ids.indexOf(Number(x.id)) < 0; }); }, 'Suppression groupée', ids.length + ' prévision(s)');
      toast(ids.length + ' prévision(s) supprimée(s)', 'warn');
      SEL = [];
      refresh();
    });
  }

  /* ================= simulateur what-if ================= */
  function openSimulator() {
    closeSim();
    var root = $('[data-apx="root"]'); if (!root) return;
    var rows = data().filter(actif);
    var ec = rows.reduce(function (s, r) { return s + ecartNum(r); }, 0);
    var bud = rows.reduce(function (s, r) { return s + (Number(r.budget) || 0); }, 0);
    var budMoy = ec > 0 ? Math.round(bud / Math.max(ec, 1)) : 200000;
    var effAct = rows.reduce(function (s, r) { return s + (Number(r.effectifActuel) || 0); }, 0);
    var back = h('div', { class: 'apx-backdrop', 'data-apx': 'backdrop', 'data-apx-for': 'dialog' });
    back.addEventListener('click', function (e) { if (e.target === back) closeSim(); });
    var dl0 = h('div', { class: 'apx-dialog', 'data-apx': 'sim', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Simulateur' });
    dl0.innerHTML =
      '<div class="apx-dialog-head"><h3>Simulateur — effectifs &amp; budget</h3><button class="apx-ic apx-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apx-dialog-body">' +
        '<p class="apx-form-hint">Ajustez les hypothèses : le plan projeté se recalcule instantanément à partir de votre situation actuelle (' + ec + ' postes à pourvoir, ' + fcfa(bud) + ' planifiés).</p>' +
        '<label class="apx-lab">Postes à recruter sur l\u2019horizon : <b data-apx="v-n"></b><input type="range" class="apx-range" data-apx="s-n" min="0" max="' + Math.max(30, ec + 10) + '" step="1" value="' + Math.max(0, ec) + '"></label>' +
        '<label class="apx-lab">Budget moyen par recrutement : <b data-apx="v-b"></b><input type="range" class="apx-range" data-apx="s-b" min="0" max="1000000" step="10000" value="' + budMoy + '"></label>' +
        '<label class="apx-lab">Capacité mensuelle de recrutement : <b data-apx="v-c"></b><input type="range" class="apx-range" data-apx="s-c" min="1" max="15" step="1" value="3"></label>' +
        '<label class="apx-lab">Délai moyen d\u2019un recrutement (jours) : <b data-apx="v-d"></b><input type="range" class="apx-range" data-apx="s-d" min="7" max="180" step="7" value="60"></label>' +
        '<div class="apx-sim-out" data-apx="sim-out"></div>' +
      '</div>' +
      '<div class="apx-dialog-foot"><span class="apx-form-hint">Simulation locale — aucune donnée modifiée</span><div><button class="apx-btn" data-apx="sim-close">Fermer</button></div></div>';
    document.body.appendChild(back);
    document.body.appendChild(dl0);
    $('.apx-drawer-x', dl0).addEventListener('click', closeSim);
    $('[data-apx="sim-close"]', dl0).addEventListener('click', closeSim);
    function upd() {
      var n = Number($('[data-apx="s-n"]', dl0).value);
      var b = Number($('[data-apx="s-b"]', dl0).value);
      var c = Number($('[data-apx="s-c"]', dl0).value);
      var d = Number($('[data-apx="s-d"]', dl0).value);
      $('[data-apx="v-n"]', dl0).textContent = n + ' poste(s)';
      $('[data-apx="v-b"]', dl0).textContent = fcfa(b);
      $('[data-apx="v-c"]', dl0).textContent = c + ' / mois';
      $('[data-apx="v-d"]', dl0).textContent = d + ' j';
      var total = n * b;
      var delta = total - bud;
      var mois = c > 0 ? Math.ceil(n / c) : 0;
      var fin = new Date(); fin.setMonth(fin.getMonth() + mois); fin.setDate(fin.getDate() + d);
      var eff = effAct + n;
      $('[data-apx="sim-out"]', dl0).innerHTML =
        '<div class="apx-sim-kpis">' +
        '<div class="apx-sim-k"><span>Effectif cible global</span><b>' + eff + '</b></div>' +
        '<div class="apx-sim-k"><span>Budget projeté</span><b>' + fcfa(total) + '</b></div>' +
        '<div class="apx-sim-k" data-tone="' + (delta > 0 ? 'err' : 'ok') + '"><span>' + (delta > 0 ? 'Budget à débloquer' : 'Marge vs plan actuel') + '</span><b>' + fcfa(Math.abs(delta)) + '</b></div>' +
        '<div class="apx-sim-k"><span>Horizon de dotation</span><b>' + mois + ' mois' + (n ? ' ≈ ' + fin.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '') + '</b></div>' +
        '</div>' +
        (delta > 0 ? '<p class="apx-sim-warn">⚠ Le plan actuel couvre ' + fcfa(bud) + ' : prévoir un arbitrage budgétaire de ' + fcfa(delta) + ' (ou revoir le budget moyen à ' + fcfa(Math.floor(bud / Math.max(n, 1))) + ').</p>' :
          '<p class="apx-sim-ok">✓ Le budget planifié (' + fcfa(bud) + ') couvre cette hypothèse avec une marge de ' + fcfa(Math.abs(delta)) + '.</p>');
    }
    ['s-n', 's-b', 's-c', 's-d'].forEach(function (k) { $('[data-apx="' + k + '"]', dl0).addEventListener('input', upd); });
    upd();
    jlog('Simulation', 'ouverture du simulateur');
  }
  function closeSim() { $$('[data-apx="sim"],[data-apx="backdrop"][data-apx-for="dialog"]').forEach(function (n) { n.remove(); }); }

  /* ================= import CSV ================= */
  function normKey(s) { return norm(s).replace(/[^a-z0-9]/g, ''); }
  var KEYMAP = { numero: 'numero', departement: 'departement', dept: 'departement', poste: 'poste', effectifactuel: 'effectifActuel', effectifactuel: 'effectifActuel', effectifprevu: 'effectifPrevu', ecart: 'ecart', motif: 'motif', datebesoin: 'dateBesoin', besoin: 'dateBesoin', priorite: 'priorite', statut: 'statut', canaldediffusion: 'canalDiffusion', canal: 'canalDiffusion', budget: 'budget', profilrecherche: 'profilRecherche', profil: 'profilRecherche', datepublication: 'datePublication', candidaturesrecues: 'candidaturesRecues', candidatures: 'candidaturesRecues', notes: 'notes' };
  function parseCSVtext(txt) {
    txt = String(txt || '').replace(/^\ufeff/, '').replace(/\r/g, '');
    var lines = txt.split('\n').filter(function (l) { return l.trim().length; });
    if (!lines.length) return { header: [], rows: [] };
    var sep = [';', '\t', ','].map(function (s) { return { s: s, n: lines[0].split(s).length }; }).sort(function (a, b) { return b.n - a.n; })[0].s;
    function splitLine(l) {
      var out = [], cur = '', q = false;
      for (var i = 0; i < l.length; i++) {
        var ch = l[i];
        if (q) { if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
        else if (ch === '"') q = true;
        else if (ch === sep) { out.push(cur); cur = ''; }
        else cur += ch;
      }
      out.push(cur); return out;
    }
    var header = splitLine(lines[0]).map(function (h0) { return normKey(h0); });
    var rows = lines.slice(1).map(function (l) {
      var cells = splitLine(l);
      var o = {};
      header.forEach(function (k, i) { var kk = KEYMAP[k]; if (kk) o[kk] = (cells[i] || '').trim(); });
      return o;
    });
    return { header: header, rows: rows };
  }
  function normalizeImported(r) {
    var errs = [];
    var out = {};
    out.departement = r.departement || '';
    out.poste = r.poste || '';
    if (!out.departement) errs.push('département manquant');
    if (!out.poste) errs.push('poste manquant');
    var motif = MOTIFS.filter(function (m) { return norm(m) === norm(r.motif || ''); })[0];
    if (motif) out.motif = motif; else errs.push('motif invalide (« ' + (r.motif || '?') + ' »)');
    var d = pd(r.dateBesoin || '');
    if (d) out.dateBesoin = d.toLocaleDateString('fr-FR'); else errs.push('date de besoin invalide (« ' + (r.dateBesoin || '?') + ' »)');
    var p = PRIORITES.filter(function (m) { return norm(m) === norm(r.priorite || ''); })[0];
    if (p) out.priorite = p; else errs.push('priorité invalide (« ' + (r.priorite || '?') + ' »)');
    var st = STATUTS.filter(function (m) { return norm(m) === norm(r.statut || ''); })[0];
    out.statut = st || 'A creer';
    out.effectifActuel = Math.max(0, parseInt(r.effectifActuel, 10) || 0);
    out.effectifPrevu = Math.max(0, parseInt(r.effectifPrevu, 10) || 0);
    out.budget = Math.max(0, parseInt(r.budget, 10) || 0);
    out.candidaturesRecues = Math.max(0, parseInt(r.candidaturesRecues, 10) || 0);
    out.canalDiffusion = r.canalDiffusion || '';
    out.profilRecherche = r.profilRecherche || '';
    out.notes = r.notes || '';
    var dp = pd(r.datePublication || '');
    out.datePublication = dp ? dp.toLocaleDateString('fr-FR') : '';
    out.ecart = '+' + String(Math.max(0, out.effectifPrevu - out.effectifActuel));
    return { row: out, errs: errs };
  }
  function openImport() {
    closeImport();
    var root = $('[data-apx="root"]'); if (!root) return;
    var back = h('div', { class: 'apx-backdrop', 'data-apx': 'backdrop', 'data-apx-for': 'dialog' });
    back.addEventListener('click', function (e) { if (e.target === back) closeImport(); });
    var dl0 = h('div', { class: 'apx-dialog', 'data-apx': 'import', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Importer des prévisions' });
    dl0.innerHTML =
      '<div class="apx-dialog-head"><h3>Importer des prévisions (CSV)</h3><button class="apx-ic apx-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apx-dialog-body">' +
        '<p class="apx-form-hint">Colonnes reconnues (séparateur ; , ou tabulation, avec ou sans en-tête d\u2019exemple) : departement*, poste*, motif*, dateBesoin* (JJ/MM/AAAA ou AAAA-MM-JJ), priorite*, effectifActuel, effectifPrevu, statut, canalDiffusion, budget, profilRecherche, datePublication, candidaturesRecues, notes, numero (ignoré, réattribué).</p>' +
        '<label class="apx-lab">Fichier CSV<input class="apx-in" type="file" accept=".csv,text/csv" data-apx="imp-file"></label>' +
        '<label class="apx-lab">…ou coller le contenu<textarea class="apx-ta" rows="5" data-apx="imp-text" placeholder="departement;poste;effectifActuel;effectifPrevu;motif;dateBesoin;priorite;budget\nRestauration;Second de cuisine;3;4;Creation de poste;01/07/2026;Haute;250000"></textarea></label>' +
        '<div class="apx-imp-report" data-apx="imp-report"></div>' +
      '</div>' +
      '<div class="apx-dialog-foot"><span class="apx-form-hint" data-apx="imp-count"></span><div>' +
      '<button class="apx-btn" data-apx="imp-close">Fermer</button>' +
      '<button class="apx-btn apx-btn-primary" data-apx="imp-go" disabled>Importer</button></div></div>';
    document.body.appendChild(back);
    document.body.appendChild(dl0);
    $('.apx-drawer-x', dl0).addEventListener('click', closeImport);
    $('[data-apx="imp-close"]', dl0).addEventListener('click', closeImport);
    var parsed = null;
    function analyze() {
      var txt = $('[data-apx="imp-text"]', dl0).value;
      parsed = parseCSVtext(txt);
      var rep = $('[data-apx="imp-report"]', dl0);
      var count = $('[data-apx="imp-count"]', dl0);
      var go = $('[data-apx="imp-go"]', dl0);
      if (!parsed.rows.length) { rep.innerHTML = '<div class="apx-form-err">Aucune ligne détectée.</div>'; count.textContent = ''; go.disabled = true; return; }
      var okRows = [], errLines = [];
      parsed.rows.forEach(function (r, i) {
        var nrm = normalizeImported(r);
        if (nrm.errs.length) errLines.push('Ligne ' + (i + 2) + ' : ' + nrm.errs.join(', '));
        else okRows.push(nrm.row);
      });
      rep.innerHTML =
        (okRows.length ? '<div class="apx-imp-ok"><b>' + okRows.length + '</b> ligne(s) valide(s)</div>' : '') +
        (errLines.length ? '<div class="apx-form-err"><b>' + errLines.length + '</b> ligne(s) en erreur :<br>' + errLines.slice(0, 6).map(esc).join('<br>') + (errLines.length > 6 ? '<br>…' : '') + '</div>' : '') +
        (okRows.length ? '<div class="apx-imp-preview"><table class="apx-table apx-table-mini"><thead><tr><th>Dépt.</th><th>Poste</th><th>Motif</th><th>Besoin</th><th>Prio.</th><th>Budget</th></tr></thead><tbody>' +
          okRows.slice(0, 5).map(function (r) { return '<tr><td>' + esc(r.departement) + '</td><td>' + esc(r.poste) + '</td><td>' + esc(r.motif) + '</td><td>' + esc(r.dateBesoin) + '</td><td>' + esc(r.priorite) + '</td><td>' + fcfa(r.budget) + '</td></tr>'; }).join('') +
          '</tbody></table>' + (okRows.length > 5 ? '<div class="apx-form-hint">+' + (okRows.length - 5) + ' autre(s)…</div>' : '') + '</div>' : '');
      count.textContent = okRows.length ? okRows.length + ' prévision(s) prête(s) à l\u2019import' : '';
      go.disabled = !okRows.length;
      go.__rows = okRows;
    }
    $('[data-apx="imp-file"]', dl0).addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { $('[data-apx="imp-text"]', dl0).value = String(fr.result || ''); analyze(); };
      fr.readAsText(f, 'utf-8');
    });
    $('[data-apx="imp-text"]', dl0).addEventListener('input', analyze);
    $('[data-apx="imp-go"]', dl0).addEventListener('click', function () {
      var rows = this.__rows || [];
      if (!rows.length) return;
      mutate(function (all) {
        var id = nextId(all);
        return all.concat(rows.map(function (r) {
          var cp = Object.assign({}, r, { id: id, numero: 'PO-' + String(id).padStart(3, '0') });
          id++;
          return cp;
        }));
      }, 'Import CSV', rows.length + ' prévision(s) importée(s)');
      toast(rows.length + ' prévision(s) importée(s)');
      closeImport();
      refresh();
    });
    jlog('Import CSV', 'ouverture de l\u2019assistant');
  }
  function closeImport() { $$('[data-apx="import"],[data-apx="backdrop"][data-apx-for="dialog"]').forEach(function (n) { n.remove(); }); }

  /* ================= registre des écarts (conformité) ================= */
  function computeNC() {
    var rows = data();
    var seen = {};
    var out = [];
    rows.forEach(function (r) {
      var d = daysUntil(r.dateBesoin);
      if (actif(r) && d !== null && d < 0) out.push({ r: r, type: 'Retard', tone: 'err', label: 'échéance dépassée de ' + Math.abs(d) + ' j' });
      else if (actif(r) && d !== null && d <= 45) out.push({ r: r, type: 'Échéance imminente', tone: 'warn', label: 'échéance dans ' + d + ' j' });
      if (actif(r) && !(Number(r.budget) || 0)) out.push({ r: r, type: 'Budget manquant', tone: 'warn', label: 'aucun budget renseigné' });
      if (actif(r) && !r.canalDiffusion && r.statut !== 'A creer') out.push({ r: r, type: 'Canal manquant', tone: 'info', label: 'diffusion non définie' });
      if (r.statut === 'Cloturee' && ecartNum(r) > 0) out.push({ r: r, type: 'Incohérence', tone: 'info', label: 'clôturée avec +' + ecartNum(r) + ' poste(s) non pourvu(s)' });
      var k = norm((r.poste || '') + '|' + (r.departement || ''));
      if (k !== '|') { if (seen[k]) out.push({ r: r, type: 'Doublon', tone: 'warn', label: 'poste identique à ' + (seen[k].numero || '') }); else seen[k] = r; }
    });
    return out;
  }
  function openNC() {
    closeNC();
    var root = $('[data-apx="root"]'); if (!root) return;
    var items = computeNC();
    var back = h('div', { class: 'apx-backdrop', 'data-apx': 'backdrop', 'data-apx-for': 'dialog' });
    back.addEventListener('click', closeNC);
    var dl0 = h('div', { class: 'apx-dialog apx-dialog-nc', 'data-apx': 'nc', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Registre des écarts' });
    var byType = {};
    items.forEach(function (x) { (byType[x.type] = byType[x.type] || []).push(x); });
    dl0.innerHTML =
      '<div class="apx-dialog-head"><h3>Registre des écarts — conformité plan de prévision</h3><button class="apx-ic apx-drawer-x" aria-label="Fermer">✕</button></div>' +
      '<div class="apx-dialog-body">' +
      (items.length ? Object.keys(byType).map(function (t) {
        return '<div class="apx-nc-sec"><span class="apx-chip" data-tone="' + byType[t][0].tone + '">' + esc(t) + ' · ' + byType[t].length + '</span>' +
          byType[t].map(function (x) {
            return '<button class="apx-nc-row" data-id="' + x.r.id + '"><span class="apx-td-num">' + esc(x.r.numero || '') + '</span><span class="apx-nc-poste">' + esc((x.r.poste || '') + ' — ' + (x.r.departement || '')) + '</span><span class="apx-nc-lab">' + esc(x.label) + '</span><span class="apx-nc-go">Voir →</span></button>';
          }).join('') + '</div>';
      }).join('') : '<div class="apx-empty">Aucun écart détecté — plan conforme. ✓</div>') +
      '</div>' +
      '<div class="apx-dialog-foot"><span class="apx-form-hint">' + items.length + ' écart(s) · mis à jour en temps réel · ISO 9001 §9.1</span><div><button class="apx-btn" data-apx="nc-close">Fermer</button></div></div>';
    document.body.appendChild(back);
    document.body.appendChild(dl0);
    $('.apx-drawer-x', dl0).addEventListener('click', closeNC);
    $('[data-apx="nc-close"]', dl0).addEventListener('click', closeNC);
    $$('.apx-nc-row', dl0).forEach(function (b) {
      b.addEventListener('click', function () {
        closeNC();
        openDrawer(Number(b.getAttribute('data-id')));
      });
    });
  }
  function closeNC() { $$('[data-apx="nc"],[data-apx="backdrop"][data-apx-for="dialog"]').forEach(function (n) { n.remove(); }); }

  /* ================= export CSV ================= */
  function exportCSV(rowsOverride) {
    var rows = rowsOverride || filtered();
    var cols = ['numero', 'departement', 'poste', 'effectifActuel', 'effectifPrevu', 'ecart', 'motif', 'dateBesoin', 'priorite', 'statut', 'canalDiffusion', 'budget', 'profilRecherche', 'datePublication', 'candidaturesRecues', 'notes'];
    function escCsv(v) { v = v == null ? '' : String(v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var csv = '\ufeff' + cols.join(';') + '\n' + rows.map(function (r) { return cols.map(function (c) { return escCsv(r[c]); }).join(';'); }).join('\n');
    dl(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'previsions-postes' + (activeFilterCount() ? '-filtrees' : '') + '.csv');
    jlog('Export CSV', rows.length + ' prévision(s)' + (activeFilterCount() ? ' (filtrées)' : ''));
    toast(rows.length + ' prévision(s) exportée(s) en CSV');
  }

  /* ================= journal ================= */
  function journalRows() {
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.read === 'function') return window.__ADMINA_AUDIT__.read() || [];
      return JSON.parse(localStorage.getItem('admina_journal') || '[]');
    } catch (e) { return []; }
  }
  function openJournal() {
    closeJournal();
    var back = h('div', { class: 'apx-backdrop apx-backdrop-j', 'data-apx': 'backdrop', 'data-apx-for': 'journal' });
    back.addEventListener('click', closeJournal);
    var dl0 = h('div', { class: 'apx-journal', 'data-apx': 'journal', role: 'dialog', 'aria-label': 'Journal d\u2019activité' });
    dl0.innerHTML =
      '<div class="apx-drawer-head"><div><div class="apx-drawer-title">Journal d\u2019activité</div><div class="apx-drawer-sub" data-apx="jcount"></div></div>' +
      '<button class="apx-ic apx-drawer-x" aria-label="Fermer le journal">✕</button></div>' +
      '<div class="apx-jsearch"><input type="search" class="apx-in" placeholder="Filtrer le journal…" data-apx="jsearch" aria-label="Filtrer le journal"></div>' +
      '<div class="apx-jlist" data-apx="jlist"></div>';
    document.body.appendChild(back);
    document.body.appendChild(dl0);
    $('.apx-drawer-x', dl0).addEventListener('click', closeJournal);
    $('[data-apx="jsearch"]', dl0).addEventListener('input', renderJournal);
    renderJournal();
  }
  function renderJournal() {
    var body = $('[data-apx="jlist"]'); if (!body) return;
    var q = norm(($('[data-apx="jsearch"]') || {}).value || '');
    var rows = journalRows().filter(function (r) { return !q || norm((r.action || '') + ' ' + (r.detail || '') + ' ' + (r.role || '')).indexOf(q) >= 0; }).slice(0, 120);
    $('[data-apx="jcount"]').textContent = rows.length + ' entrée(s)';
    body.innerHTML = rows.map(function (r) {
      var hh = '?';
      try { hh = new Date(r.time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
      return '<div class="apx-jrow"><span class="apx-jtime">' + esc(hh) + '</span><span class="apx-jact">' + esc(r.action || '') + '</span><span class="apx-jdet">' + esc(r.detail || '') + '</span></div>';
    }).join('') || '<div class="apx-empty">Aucune entrée.</div>';
  }
  function closeJournal() { $$('[data-apx="journal"],[data-apx="backdrop"][data-apx-for="journal"]').forEach(function (n) { n.remove(); }); }

  /* ================= navigation mobile (burger, pattern pilier2) ================= */
  var burger = null, navBackdrop = null;
  function ensureBurger() {
    if (!isOn()) return;
    var tb = document.querySelector('.MuiToolbar-root');
    if (!tb) return;
    if (!burger || !burger.isConnected) {
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

  /* ================= clavier ================= */
  function onKey(e) {
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeNav(); closeSim(); closeImport(); closeNC(); return; }
    var t = e.target || {};
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
    if ($('[data-apx="dialog"]') || $('[data-apx="confirm"]')) return;
    if (e.key === 'n' || e.key === 'N') { openDialog(null); e.preventDefault(); }
    if (e.key === 'e' || e.key === 'E') { exportCSV(null); e.preventDefault(); }
    if (e.key === 'j' || e.key === 'J') { openJournal(); e.preventDefault(); }
    if (e.key === 's' || e.key === 'S') { openSimulator(); e.preventDefault(); }
    if (e.key === 'i' || e.key === 'I') { openImport(); e.preventDefault(); }
    if (e.key === 'r' || e.key === 'R') { openNC(); e.preventDefault(); }
    if (e.key === '/') { var si = $('[data-apx="search"]'); if (si) { si.focus(); e.preventDefault(); } }
  }

  /* ================= refresh global ================= */
  function refresh() {
    if (!isOn()) return;
    if (!mountRoot()) return;
    buildShellOnce();
    renderHero();
    renderKPIs();
    renderDonut();
    renderBars();
    renderTimeline();
    renderFilters();
    renderContent();
    renderSelBar();
    updateNcBadge();
    cleanupBackdrops();
    ensureBurger();
    detectTheme();
  }
  function pageCheckedState() {
    var cbs = $$('.apx-chk');
    var all = cbs.length > 0 && cbs.every(function (cb) { return cb.checked; });
    var some = cbs.some(function (cb) { return cb.checked; });
    return { all: all, some: some };
  }
  function updateNcBadge() {
    var badge = $('[data-apx="nc-badge"]');
    if (!badge) return;
    var n = computeNC().length;
    badge.textContent = n ? String(n) : '';
    badge.style.display = n ? 'inline-grid' : 'none';
  }
  var shellBuilt = false;
  function buildShellOnce() { if (!shellBuilt) { buildShell(); shellBuilt = true; } }

  /* ================= fix table natif (Lot 1 conservé) ================= */
  function fixTables() {
    var containers = $$('.MuiTableContainer-root');
    for (var i = 0; i < containers.length; i++) {
      var el0 = containers[i];
      if (el0.__adminaPrevFixed) continue;
      el0.__adminaPrevFixed = true;
      el0.style.overflowX = 'auto';
      el0.style.maxWidth = '100%';
      var tbl = el0.querySelector('table.MuiTable-root');
      if (tbl) { var w = tbl.style.minWidth; if (!w || parseInt(w, 10) < 1180) tbl.style.minWidth = '1180px'; }
    }
  }

  /* ================= activation ================= */
  var active = false, mo = null, pollT = null;
  function isOn() { return RE_PAGE.test(location.pathname); }
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-apx');
    shellBuilt = false;
    loadUI();
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.nodeType === 1 && t.closest && (t.closest('[data-apx]') || t.closest('#apx-canaux') || t.closest('#apx-depts'))) continue;
        scheduleRefresh();
        break;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  var refreshT = null;
  function scheduleRefresh() { clearTimeout(refreshT); refreshT = setTimeout(function () { if (active && isOn()) refresh(); }, 200); }
  function deactivate() {
    if (!active) return;
    active = false;
    html.classList.remove('admina-apx');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearTimeout(refreshT);
    closeNav();
    unmountRoot();
    closeDrawer(); closeDialog(); closeConfirm(); closeJournal(); closeSim(); closeImport(); closeNC();
    SEL = [];
    document.removeEventListener('keydown', onKey);
    shellBuilt = false;
  }
  function poller() {
    if (!active) return;
    detectTheme();
    cleanupBackdrops();
    fixTables();
    var natif = conteneurNatif();
    var root = $('[data-apx="root"]');
    /* le React natif a re-montré son contenu (remount) → re-masque + re-render */
    if (natif && natif.style.display !== 'none' && root && root.style.display === '') {
      natif.setAttribute('data-apx-hide', '1');
      natif.setAttribute('data-apx-olddisp', natif.style.display || '');
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

  window.__ADMINA_PREV_UI__ = {
    version: '2.0-lot2',
    isPage: isOn,
    api: api,
    refresh: refresh,
    openDialog: openDialog,
    exportCSV: exportCSV
  };
  try { console.info('[ADMINA_PREV] Lot 2 actif — Centre de pilotage /previsions-postes'); } catch (e) {}
})();
