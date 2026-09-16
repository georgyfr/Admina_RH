/* ============================================================
   Admina V38 — Sidebar D1 ergonomique + breadcrumbs + rubrique
   (additif-sur-natif : 0 octet natif modifié, idempotent)

   Structure DOM native constatée :
     .MuiDrawer-paper
       ├─ Box en-tête logo, dividers, liste héritée
       ├─ Box groupe (titre SPAN + UL des items du groupe)
       └─ panneau « Autres Domaines »

   1. Titres de groupe cliquables (chevron + repli mémorisé)
   2. Groupe de l'item actif déplié + item amené dans le champ
   3. « Tableau de Bord » marqué actif sur la racine D1
   4. Breadcrumbs faux (« Accueil › Admina-RH ») réécrits
   5. Bandeau de navigation croisée sur les 4 pages
      ANALYTICS & CONFIGURATION (navigation SPA via la sidebar)
   ============================================================ */
(function () {
  'use strict';
  if (window.__ADMINA_SB38__) return;
  window.__ADMINA_SB38__ = true;

  var D = document;
  var D1P = '/Domaine1_Recrutement_Candidats';

  /* Miroir exact de la nav native du bundle (31 entrées) */
  var NAV = {
    '': { t: 'Tableau de Bord', g: "VUE D'ENSEMBLE" },
    'tableau-de-bord': { t: 'Tableau de Bord', g: "VUE D'ENSEMBLE" },
    'offres': { t: "Offres d'Emploi", g: 'GESTION DES OFFRES' },
    'demandes': { t: 'Demandes', g: 'GESTION DES OFFRES' },
    'previsions-postes': { t: 'Prévisions Postes', g: 'GESTION DES OFFRES' },
    'sources-recrutement': { t: 'Sources Recrutement', g: 'GESTION DES OFFRES' },
    'analyse-des-couts': { t: 'Analyse des Coûts', g: 'GESTION DES OFFRES' },
    'base-candidats': { t: 'Base Candidats', g: 'GESTION DES CANDIDATS' },
    'pipeline-candidatures': { t: 'Pipeline Candidatures', g: 'GESTION DES CANDIDATS' },
    'types-de-contrats': { t: 'Types de Contrats', g: 'GESTION DES CANDIDATS' },
    'departements': { t: 'Départements', g: 'GESTION DES CANDIDATS' },
    'planning-entretiens': { t: 'Planning Entretiens', g: 'PROCESSUS DE RECRUTEMENT' },
    'grille-evaluation': { t: 'Grille Évaluation', g: 'PROCESSUS DE RECRUTEMENT' },
    'verification-references': { t: 'Vérification Références', g: 'PROCESSUS DE RECRUTEMENT' },
    'selections': { t: 'Sélections', g: 'PROCESSUS DE RECRUTEMENT' },
    'gestion-cabinets': { t: 'Gestion Cabinets', g: 'PROCESSUS DE RECRUTEMENT' },
    'suivi-contrats': { t: 'Suivi Contrats', g: 'PROCESSUS DE RECRUTEMENT' },
    'integration-employe': { t: 'Intégration Employé', g: 'INTÉGRATION & SUIVI' },
    'checklist-integration': { t: 'Checklist Intégration', g: 'INTÉGRATION & SUIVI' },
    'periode-dessai': { t: "Période d'Essai", g: 'INTÉGRATION & SUIVI' },
    'plan-accueil-formation': { t: 'Plan Accueil Formation', g: 'INTÉGRATION & SUIVI' },
    'suivi-post-embauche': { t: 'Suivi Post-Embauche', g: 'INTÉGRATION & SUIVI' },
    'stagiaires': { t: 'Stagiaires', g: 'STAGIAIRES & SAISONNIERS' },
    'saisonniers-temporaires': { t: 'Saisonniers & Temporaires', g: 'STAGIAIRES & SAISONNIERS' },
    'sources-roi': { t: 'Sources & ROI', g: 'PLUS' },
    'experiences': { t: 'Expériences', g: 'PLUS' },
    'formations-candidats': { t: 'Formations Candidats', g: 'PLUS' },
    'competences': { t: 'Compétences', g: 'PLUS' },
    'kpis-objectifs-rh': { t: 'KPIs & Objectifs RH', g: 'ANALYTICS & CONFIGURATION' },
    'documents-conformite': { t: 'Documents Conformité', g: 'ANALYTICS & CONFIGURATION' },
    'parametres': { t: 'Paramètres', g: 'ANALYTICS & CONFIGURATION' },
    'audit-statuts': { t: 'Audit Statuts', g: 'ANALYTICS & CONFIGURATION' }
  };
  var TITLES = ["VUE D'ENSEMBLE", 'GESTION DES OFFRES', 'GESTION DES CANDIDATS',
    'PROCESSUS DE RECRUTEMENT', 'INTÉGRATION & SUIVI', 'STAGIAIRES & SAISONNIERS',
    'PLUS', 'ANALYTICS & CONFIGURATION'];
  var FOLD_KEY = 'adminaSbFoldV38';
  var RUBRIC = ['kpis-objectifs-rh', 'documents-conformite', 'parametres', 'audit-statuts'];
  var RUBRIC_TITLE = 'Analytics & Configuration';
  var ROOTS = {
    'kpis-objectifs-rh': '.adm-w.admina-akp, .admina-akp',
    'documents-conformite': '.admina-cnf-root',
    'parametres': '.adm-w.admina-apr, .admina-apr',
    'audit-statuts': '#adt-page, .adt-page'
  };
  /* Seules 2 routes sur 26 ont un faux libellé natif */
  var BCFIX = {
    'kpis-objectifs-rh': ['Analytics', 'KPIs & Objectifs RH'],
    'demandes': ['Recrutement', 'Demandes']
  };

  function route() {
    try {
      var p = location.pathname.split('/').filter(Boolean);
      return (p[0] === 'Domaine1_Recrutement_Candidats' && p[1]) || '';
    } catch (e) { return ''; }
  }
  function norm(s) { return ('' + s).replace(/\u200b/g, '').replace(/\s+/g, ' ').trim(); }
  function paper() { return D.querySelector('.MuiDrawer-paper'); }

  /* ---------- repli des groupes (mémoire locale) ---------- */
  function loadFold() { try { return JSON.parse(localStorage.getItem(FOLD_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function saveFold(f) { try { localStorage.setItem(FOLD_KEY, JSON.stringify(f)); } catch (e) {} }

  /* Décore les titres de groupe (idempotent) ; renvoie les groupes trouvés.
     Groupe natif = Box contenant le SPAN titre + la UL des items. */
  function decorateGroups() {
    var pp = paper();
    if (!pp || pp.getBoundingClientRect().width < 100) return null;
    var groups = [];
    TITLES.forEach(function (t) {
      var span = null, all = pp.querySelectorAll('span'), i;
      for (i = 0; i < all.length; i++) {
        /* le span décoré contient le chevron : matcher sur le texte seul */
        if (norm(all[i].textContent) === t) { span = all[i]; break; }
      }
      if (!span) return;
      var gb = span.parentElement;
      if (!gb || gb === pp) return;
      var ul = gb.querySelector('ul');
      if (!ul) return;
      if (gb.dataset.admHead !== '1') {
        gb.dataset.admHead = '1';
        span.classList.add('adm-sb-head');
        span.setAttribute('role', 'button');
        span.setAttribute('tabindex', '0');
        span.setAttribute('aria-expanded', 'true');
        var chev = D.createElement('span');
        chev.className = 'adm-sb-chev';
        chev.setAttribute('aria-hidden', 'true');
        span.appendChild(chev);
        span.addEventListener('click', function () {
          var st = loadFold();
          var folded = gb.classList.contains('adm-sb-folded');
          if (folded) { gb.classList.remove('adm-sb-folded'); delete st[t]; }
          else { gb.classList.add('adm-sb-folded'); st[t] = 1; }
          span.setAttribute('aria-expanded', folded ? 'true' : 'false');
          saveFold(st);
          updateFades();
        });
        span.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); span.click(); }
        });
      }
      groups.push({ t: t, head: span, box: gb, ul: ul });
    });
    return groups;
  }

  function applyFold(groups) {
    var st = loadFold();
    groups.forEach(function (g) {
      var folded = !!st[g.t];
      g.box.classList.toggle('adm-sb-folded', folded);
      g.head.setAttribute('aria-expanded', folded ? 'false' : 'true');
    });
  }

  /* ---------- item actif ---------- */
  function findItemByText(pp, txt) {
    var cands = pp.querySelectorAll('.MuiListItemButton-root, button, [role="button"]'), i;
    for (i = 0; i < cands.length; i++) {
      if (norm(cands[i].textContent) === txt) return cands[i];
    }
    return null;
  }

  /* Marquage de l'item actif — idempotent, exécuté à chaque tick.
     Renvoie l'élément marqué (ou null). */
  function markActive() {
    var pp = paper();
    if (!pp || pp.getBoundingClientRect().width < 100) return null;
    var r = route(), info = NAV[r];
    if (!info) return null;
    /* déplier le groupe qui contient l'item actif */
    var all = pp.querySelectorAll('span.adm-sb-head'), i, gb = null;
    if (!all.length) all = pp.querySelectorAll('span');
    for (i = 0; i < all.length; i++) {
      if (norm(all[i].textContent) === info.g) {
        gb = all[i].parentElement;
        break;
      }
    }
    if (gb && gb !== pp && gb.querySelector('ul')) {
      gb.classList.remove('adm-sb-folded');
      var h2 = gb.dataset.admHead === '1' ? gb.querySelector('.adm-sb-head') : null;
      if (h2) h2.setAttribute('aria-expanded', 'true');
    }
    /* item sélectionné natif ; sinon recherché par libellé (les URLs à
       slash final ne déclenchent pas toujours la sélection native) */
    var isTdb = (r === '' || r === 'tableau-de-bord');
    var sel = pp.querySelector('.MuiListItemButton-root.Mui-selected');
    if (!sel) sel = findItemByText(pp, info.t);
    if (!sel && isTdb) sel = findItemByText(pp, 'Tableau de Bord');
    if (!sel) return null;
    var ons = pp.querySelectorAll('.adm-sb-on');
    for (i = 0; i < ons.length; i++) if (ons[i] !== sel) ons[i].classList.remove('adm-sb-on');
    sel.classList.add('adm-sb-on');
    return sel;
  }

  function ensureActiveVisible() {
    var sel = markActive();
    if (!sel) return false;
    setTimeout(function () {
      try { sel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      catch (e) { try { sel.scrollIntoView(); } catch (e2) {} }
      updateFades();
    }, 60);
    return true;
  }

  /* ---------- breadcrumbs faux corrigés ---------- */
  function fixBreadcrumb() {
    var r = route(), want = BCFIX[r];
    if (!want) return;
    var accs = D.querySelectorAll('span'), i, acc = null;
    for (i = 0; i < accs.length; i++) {
      if (!accs[i].children.length && norm(accs[i].textContent) === 'Accueil') {
        var b = accs[i].parentElement;
        if (b && b.parentElement && /MuiToolbar/.test('' + b.parentElement.className)) { acc = accs[i]; break; }
      }
    }
    if (!acc) return;
    var box = acc.parentElement;
    var flat = norm(box.textContent).replace(/ /g, '');
    if (flat === 'AccueilAdmina-RH') {
      box.innerHTML =
        '<span class="adm-bc">Accueil</span><span class="adm-bc-sep">›</span>' +
        '<span class="adm-bc">' + want[0] + '</span><span class="adm-bc-sep">›</span>' +
        '<span class="adm-bc adm-bc-cur">' + want[1] + '</span>';
    }
  }

  /* ---------- bandeau rubrique (4 pages) ----------
     Inséré comme premier enfant du conteneur de contenu natif
     ([data-adm-content]) : toujours tout en haut, sur les 4 pages. */
  function buildStrip(r) {
    var host = D.querySelector('[data-adm-content]') || D.querySelector(ROOTS[r]);
    if (!host) return false;
    var nav = D.createElement('div');
    nav.className = 'adm-rubnav';
    var t = D.createElement('span');
    t.className = 'adm-rubnav-t';
    t.textContent = RUBRIC_TITLE;
    nav.appendChild(t);
    RUBRIC.forEach(function (key) {
      var a = D.createElement('a');
      a.href = D1P + '/' + key;
      a.className = 'adm-rubnav-a' + (key === r ? ' adm-rubnav-on' : '');
      a.textContent = NAV[key].t;
      if (key === r) a.setAttribute('aria-current', 'page');
      else {
        a.addEventListener('click', function (ev) {
          /* navigation SPA : réutilise l'item natif de la sidebar */
          var pp = paper();
          var item = pp ? findItemByText(pp, NAV[key].t) : null;
          if (item) { ev.preventDefault(); item.click(); }
          /* sinon : href classique (repli) */
        });
      }
      nav.appendChild(a);
    });
    host.insertBefore(nav, host.firstChild);
    return true;
  }
  function removeStrips() {
    var olds = D.querySelectorAll('.adm-rubnav'), i;
    for (i = 0; i < olds.length; i++) olds[i].remove();
  }

  /* ---------- dégradé bas (contenu restant) ---------- */
  var fade = null;
  function ensureFade() {
    var pp = paper();
    if (!fade && D.body) {
      fade = D.createElement('div');
      fade.className = 'adm-sb-fade';
      fade.setAttribute('aria-hidden', 'true');
      D.body.appendChild(fade);
      if (pp) pp.addEventListener('scroll', updateFades, { passive: true });
      window.addEventListener('resize', updateFades);
    } else if (fade && pp && !fade.__bound) {
      pp.addEventListener('scroll', updateFades, { passive: true });
      fade.__bound = true;
    }
    return fade;
  }
  function updateFades() {
    if (!fade) return;
    var pp = paper();
    if (!pp) { fade.style.display = 'none'; return; }
    if (pp.getBoundingClientRect().width < 100) { fade.style.display = 'none'; return; }
    var max = pp.scrollHeight - pp.clientHeight;
    fade.style.display = (max > 24 && pp.scrollTop < max - 12) ? 'block' : 'none';
  }

  /* ---------- boucle principale (route-aware, idempotente) ----------
     Passe complète à chaque tick : tout est gardé (garde-fous) et sans
     effet si déjà appliqué. L'auto-scroll, lui, n'agit qu'une fois par
     route (et seulement quand l'item est réellement trouvé). */
  var lastRoute = null, scrolledRoute = null;
  function tick() {
    try {
      var r = route();
      if (r !== lastRoute) {
        removeStrips();
        lastRoute = r;
      }
      /* sidebar : décoration + repli mémorisé (retry tant que absent) */
      var groups = decorateGroups();
      if (groups && groups.length) applyFold(groups);
      /* item actif : marquage à chaque tick (idempotent, survit aux
         re-renders React), auto-scroll une fois par route */
      markActive();
      var pp = paper();
      if (pp && scrolledRoute !== r) {
        if (ensureActiveVisible() || !NAV[r]) scrolledRoute = r;
      }
      /* bandeau rubrique : maintenu présent ET tout en haut du contenu
         (le système de masque peut déplacer .adm-w après coup) */
      if (RUBRIC.indexOf(r) >= 0) {
        var strip = D.querySelector('.adm-rubnav');
        var host = D.querySelector('[data-adm-content]') || D.querySelector(ROOTS[r]);
        if (!strip && host) buildStrip(r);
        else if (strip && host && (strip.parentElement !== host || host.firstElementChild !== strip)) {
          host.insertBefore(strip, host.firstChild);
        }
      }
      fixBreadcrumb();
      ensureFade();
      updateFades();
    } catch (e) {
      try { console.debug('[adm38] tick:', e && (e.stack || e.message || e)); } catch (e2) {}
    }
  }

  ['pushState', 'replaceState'].forEach(function (k) {
    var o = history[k];
    if (!o) return;
    history[k] = function () {
      var r = o.apply(this, arguments);
      setTimeout(tick, 60);
      return r;
    };
  });
  window.addEventListener('popstate', function () { setTimeout(tick, 80); });

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', tick);
  else tick();
  setInterval(tick, 700);
})();
