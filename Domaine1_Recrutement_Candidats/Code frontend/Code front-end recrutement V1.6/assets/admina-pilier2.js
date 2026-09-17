/* =====================================================================
   ADMINA-RH — PILIER 2 « Réorganiser » — Tableau de Bord Domaine 1
   - Drawer de détail « sans perte de contexte » : le clic « Voir la
     demande » n'explore plus /offres ; il ouvre un panneau latéral
     alimenté par la source unique window.__ADMINA_STORE__ (Pilier 1)
     et l'historique ISO du journal window.__ADMINA_AUDIT__.
   - Navigation mobile : la sidebar masquée (<820px) devient un
     panneau coulissant ouvrable via un bouton hamburger injecté.
   - Routage SPA : html.admina-tdb posé/retiré à chaque navigation
     -> aucune règle CSS ni comportement hors du tableau de bord.
   Aucune autre page, aucun bundle existant n'est modifié.
   ===================================================================== */
(function () {
  'use strict';
  if (window.__ADMINA_P2__) return; // anti double-injection
  window.__ADMINA_P2__ = { v: '2.0' };

  var TDB_RE = /\/Domaine1_Recrutement_Candidats\/tableau-de-bord\/?$/;
  var NUM_RE = /DR-\d{4}-\d{3}/;
  var html = document.documentElement;

  function isTDB() { return TDB_RE.test(location.pathname); }
  function isDark() { return html.classList.contains('adem7-dark'); }

  /* ------------------------------------------------ routage SPA */
  var _ps = history.pushState, _rs = history.replaceState;
  history.pushState = function () { var r = _ps.apply(this, arguments); setTimeout(applyRoute, 0); return r; };
  history.replaceState = function () { var r = _rs.apply(this, arguments); setTimeout(applyRoute, 0); return r; };
  window.addEventListener('popstate', function () { setTimeout(applyRoute, 0); });

  function applyRoute() {
    var tdb = isTDB();
    html.classList.toggle('admina-tdb', tdb);
    if (!tdb) { closeDrawer(true); closeNav(true); return; }
    ensureBurger();
    // La Toolbar React peut monter après le script : réessais brefs
    var tries = 0;
    var iv = setInterval(function () {
      if (!isTDB()) { clearInterval(iv); return; }
      ensureBurger();
      if (++tries > 24 || (document.getElementById('admina-burger') && document.getElementById('admina-burger').isConnected)) clearInterval(iv);
    }, 500);
  }

  /* --------------------------------- utilitaires store / journal */
  function demandes() {
    var s = window.__ADMINA_STORE__;
    return (s && s.demandes && s.demandes.length) ? s.demandes : [];
  }
  function journalFor(numero) {
    var a = window.__ADMINA_AUDIT__;
    if (!a || !a.read) return [];
    try {
      return a.read().filter(function (e) { return (e.detail || '').indexOf(numero) !== -1; }).slice(0, 8);
    } catch (e) { return []; }
  }

  /* ---------------------------------------------------- palette */
  var STATUS = {
    'Validée':   { c: '#1b5e20', cd: '#66bb6a', bg: 'rgba(46,125,50,.16)' },
    'En attente':{ c: '#8f4400', cd: '#ffb74d', bg: 'rgba(237,108,2,.16)' },
    'En cours':  { c: '#004d40', cd: '#4db6ac', bg: 'rgba(0,121,107,.16)' },
    'Pourvue':   { c: '#4a148c', cd: '#ce93d8', bg: 'rgba(106,27,154,.14)' },
    'Clôturée':  { c: '#424242', cd: '#bdbdbd', bg: 'rgba(95,99,104,.16)' }
  };
  var STEPS_BY_STATUS = {
    'En attente': ['done', 'cur', 'todo', 'todo'],
    'Validée':    ['done', 'done', 'cur', 'todo'],
    'En cours':   ['done', 'done', 'cur', 'todo'],
    'Pourvue':    ['done', 'done', 'done', 'done'],
    'Clôturée':   ['done', 'done', 'todo', 'todo']
  };
  var STEP_LABELS = ['Demande émise', 'Validation', 'Recrutement en cours', 'Poste pourvu'];

  function fmtDate(iso) {
    if (!iso) return '—';
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (e) { return iso; }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------ DOM du drawer */
  var drawer, backdrop, dwBody, dwHeadNum, dwHeadPoste, dwChipEl, lastFocus = null;

  function buildDrawer() {
    if (drawer) return;
    backdrop = document.createElement('div');
    backdrop.className = 'admina-drawer-backdrop';
    backdrop.addEventListener('click', function () { closeDrawer(); });

    drawer = document.createElement('aside');
    drawer.className = 'admina-drawer';
    drawer.id = 'admina-detail-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'admina-dw-num');
    drawer.innerHTML =
      '<div class="admina-dw-head">' +
      '  <div class="admina-dw-headtxt">' +
      '    <h2 class="admina-dw-num" id="admina-dw-num"></h2>' +
      '    <p class="admina-dw-poste"></p>' +
      '    <span class="admina-dw-chip"></span>' +
      '  </div>' +
      '  <button type="button" class="admina-dw-close" aria-label="Fermer le détail de la demande" title="Fermer (Échap)">&#10005;</button>' +
      '</div>' +
      '<div class="admina-dw-body" tabindex="-1"></div>' +
      '<div class="admina-dw-foot">' +
      '  <button type="button" class="admina-dw-navb" data-nav="prev" aria-label="Demande précédente">&#8592;&nbsp; Précédente</button>' +
      '  <button type="button" class="admina-dw-navb" data-nav="next" aria-label="Demande suivante">Suivante &nbsp;&#8594;</button>' +
      '  <span class="admina-dw-src">Consultation sans perte de contexte<br>Source : référentiel D1 — ISO 30401</span>' +
      '</div>';

    drawer.querySelector('.admina-dw-close').addEventListener('click', function () { closeDrawer(); });
    drawer.querySelector('[data-nav="prev"]').addEventListener('click', function () { step(-1); });
    drawer.querySelector('[data-nav="next"]').addEventListener('click', function () { step(1); });
    dwHeadNum = drawer.querySelector('.admina-dw-num');
    dwHeadPoste = drawer.querySelector('.admina-dw-poste');
    dwChipEl = drawer.querySelector('.admina-dw-chip');
    dwBody = drawer.querySelector('.admina-dw-body');

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    // Piège de focus simple (Tab reste dans le panneau)
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = drawer.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function currentNumero() {
    return drawer && drawer.getAttribute('data-numero');
  }
  function step(dir) {
    var list = demandes(); if (!list.length) return;
    var i = 0;
    for (var k = 0; k < list.length; k++) if (list[k].numero === currentNumero()) { i = k; break; }
    var n = (i + dir + list.length) % list.length;
    renderDemande(list[n]);
  }

  function renderDemande(d) {
    if (!d) return;
    drawer.setAttribute('data-numero', d.numero);
    dwHeadNum.textContent = d.numero;
    dwHeadPoste.textContent = d.poste + ' — ' + (d.departement || '—');
    var sc = STATUS[d.statut] || STATUS['Clôturée'];
    var col = isDark() ? sc.cd : sc.c;
    dwChipEl.textContent = d.statut + (d.alerte ? ' · Alerte (' + d.joursAttente + ' j)' : '');
    dwChipEl.style.color = col; dwChipEl.style.background = sc.bg;
    dwChipEl.style.border = '1px solid ' + col;

    var alerteTxt = d.alerte ? ('Oui — ' + d.joursAttente + ' jours d\u2019attente') : 'Non';
    var steps = STEPS_BY_STATUS[d.statut] || ['done', 'todo', 'todo', 'todo'];
    var stepsHtml = '<ol class="admina-dw-steps">';
    for (var i = 0; i < STEP_LABELS.length; i++) {
      var st = steps[i] || 'todo';
      stepsHtml += '<li class="admina-dw-step ' + (st === 'done' ? 'on' : (st === 'cur' ? 'cur' : '')) + '">' +
        '<span class="admina-dw-dot" aria-hidden="true">' + (st === 'done' ? '&#10003;' : '') + '</span>' +
        '<span>' + esc(STEP_LABELS[i]) + (st === 'cur' ? ' — en cours' : '') + '</span>' +
        (i < STEP_LABELS.length - 1 ? '<span class="admina-dw-stepline" aria-hidden="true"></span>' : '') +
        '</li>';
    }
    stepsHtml += '</ol>';

    var log = journalFor(d.numero);
    var logHtml = '';
    if (log.length) {
      logHtml = '<div class="admina-dw-log">';
      for (var j = 0; j < log.length; j++) {
        var e2 = log[j];
        var t = '';
        try { t = new Date(e2.time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (er) { t = e2.time || ''; }
        var roleTxt = (e2.role && typeof e2.role === 'object') ? (e2.role.label || e2.role.name || '—') : (e2.role || '—');
        logHtml += '<div class="admina-dw-logi"><span class="admina-dw-loga">' + esc(e2.action || 'Évènement') + '</span> — ' +
          esc(e2.detail || '') + '<span class="admina-dw-logt">' + esc(t) + ' · ' + esc(roleTxt) + '</span></div>';
      }
      logHtml += '</div>';
    } else {
      logHtml = '<p class="admina-dw-empty">Aucun évènement journalisé pour cette demande (traçabilité ISO 9001 §8.5).</p>';
    }

    dwBody.innerHTML =
      '<section class="admina-dw-sec" aria-label="Progression du dossier">' +
      '  <h3 class="admina-dw-secT">Progression</h3>' + stepsHtml +
      '</section>' +
      '<section class="admina-dw-sec" aria-label="Informations de la demande">' +
      '  <h3 class="admina-dw-secT">Informations</h3>' +
      '  <div class="admina-dw-grid">' +
      fld('Poste', d.poste) + fld('Département', d.departement) +
      fld('Manager', d.manager) + fld('Site', d.site) +
      fld('Priorité', d.priorite) + fld('Date de demande', fmtDate(d.date)) +
      fld('Jours d\u2019attente', d.joursAttente + ' j') + fld('Alerte SLA', alerteTxt) +
      '  </div>' +
      '</section>' +
      '<section class="admina-dw-sec" aria-label="Historique de traçabilité">' +
      '  <h3 class="admina-dw-secT">Historique (journal)</h3>' + logHtml +
      '</section>';

    function fld(k, v) {
      return '<div class="admina-dw-f"><p class="admina-dw-fk">' + esc(k) + '</p><p class="admina-dw-fv">' + esc(v) + '</p></div>';
    }
  }

  function openDrawer(numero, trigger) {
    var d = null;
    var list = demandes();
    for (var k = 0; k < list.length; k++) if (list[k].numero === numero) { d = list[k]; break; }
    if (!d) return false;
    buildDrawer();
    renderDemande(d);
    lastFocus = trigger || document.activeElement;
    html.classList.add('admina-drawer-open');
    html.style.overflow = 'hidden';
    var c = drawer.querySelector('.admina-dw-close');
    if (c) c.focus();
    return true;
  }
  function closeDrawer(silent) {
    if (!drawer || !html.classList.contains('admina-drawer-open')) return;
    html.classList.remove('admina-drawer-open');
    html.style.overflow = '';
    if (!silent && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  /* ------------------------- interception « Voir la demande » */
  document.addEventListener('click', function (e) {
    if (!isTDB()) return;
    var btn = e.target && e.target.closest ? e.target.closest('button, a') : null;
    if (!btn) return;
    var isVoir = btn.getAttribute('aria-label') === 'Voir la demande';
    if (!isVoir) return;
    var row = btn.closest('tr');
    if (!row) return;
    var m = (row.textContent || '').match(NUM_RE);
    if (!m) return;
    e.preventDefault(); e.stopPropagation();
    openDrawer(m[0], btn);
  }, true);

  /* ------------------------------------------- clavier global */
  document.addEventListener('keydown', function (e) {
    if (!isTDB()) return;
    if (e.key === 'Escape') {
      if (html.classList.contains('admina-drawer-open')) { closeDrawer(); e.preventDefault(); }
      else if (html.classList.contains('admina-nav-open')) { closeNav(); e.preventDefault(); }
    } else if (html.classList.contains('admina-drawer-open') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      var t = e.target;
      if (t && t.tagName === 'INPUT' || t && t.tagName === 'TEXTAREA') return;
      step(e.key === 'ArrowRight' ? 1 : -1);
    }
  });

  /* -------------------------------------- navigation mobile */
  var burger = null, navBackdrop = null;
  function ensureBurger() {
    if (!isTDB()) return;
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
  function openNav() {
    html.classList.add('admina-nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
  }
  function closeNav(silent) {
    if (!html.classList.contains('admina-nav-open')) return;
    html.classList.remove('admina-nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  // Un clic sur un item de navigation ferme le panneau (le routage SPA suit)
  document.addEventListener('click', function (e) {
    if (!html.classList.contains('admina-nav-open')) return;
    var item = e.target && e.target.closest ? e.target.closest('.MuiDrawer-docked .MuiListItemButton-root, .MuiDrawer-docked a') : null;
    if (item) setTimeout(closeNav, 120);
  }, true);

  /* -------------------------------------------------- démarrage */
  applyRoute();
})();
