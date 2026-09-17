/* ============================================================
   ADMINA-RH — Offres d'Emploi (Domaine 1, route /offres)
   Interactif + Intelligent + Ergonomique — néant d'autre page.
   Dépend de : window.__ADMINA_OFFRES_API__ (patch du chunk Offres)
                window.__ADMINA_AUDIT__ (journal ISO, présent sur le SPA D1)
   Tout est scopé : html.admina-offres + éléments [data-admina-ofx].
   ============================================================ */
(function () {
  'use strict';
  if (window.__ADMINA_OFFRES_P4__) return;
  window.__ADMINA_OFFRES_P4__ = true;

  /* ======================= état global ======================= */
  var html = document.documentElement;
  var OFFRES_RE = /\/Domaine1_Recrutement_Candidats\/offres\/?$/;
  var active = false, mo = null, tickT = 0, darkT = 0, refreshT = 0;
  var SEL = {};               // numero -> true (multi-sélection)
  var predKey = null;
  var view = 'table';
  try { view = localStorage.getItem('admina_offres_view') || 'table'; } catch (e) {}
  var ST_ACTIF = ['A creer', 'Publiee', 'Candidatures en cours'];
  var TONE_STATUT = {
    'A creer': '#616161', 'Publiee': '#0f7a5e',
    'Candidatures en cours': '#e65100', 'Cloturee': '#2e7d32', 'Annulee': '#d32f2f'
  };
  var LIB_STATUT = {
    'A creer': 'À créer', 'Publiee': 'Publiée',
    'Candidatures en cours': 'Candidatures en cours', 'Cloturee': 'Clôturée', 'Annulee': 'Annulée'
  };

  /* ======================= utilitaires ======================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function api() { return window.__ADMINA_OFFRES_API__ || null; }
  function data() { var a = api(); return (a && a.data) || []; }
  function jlog(action, detail) {
    try { window.__ADMINA_AUDIT__ && window.__ADMINA_AUDIT__.log(action, detail, 'Recruteur'); } catch (e) {}
  }
  function fmtFCFA(n) {
    if (n == null) return '—';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }
  function fmtK(n) {
    if (n >= 1000000) return (Math.round(n / 100000) / 10) + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return String(n);
  }
  function pd(s) { /* "20/01/2025" -> Date|null */
    if (!s) return null;
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }
  function today() { return new Date().toLocaleDateString('fr-FR'); }
  function joursAvant(s) {
    var d = pd(s); if (!d) return null;
    return Math.ceil((d - new Date().setHours(0, 0, 0, 0)) / 86400000);
  }
  function actif(o) { return ST_ACTIF.indexOf(o.statutOffre) >= 0; }

  /* ---------------- favoris ---------------- */
  function favs() {
    try { return JSON.parse(localStorage.getItem('admina_offres_favs') || '[]'); }
    catch (e) { return []; }
  }
  function isFav(n) { return favs().indexOf(n) >= 0; }
  function toggleFav(n) {
    var f = favs(), i = f.indexOf(n);
    if (i >= 0) f.splice(i, 1); else f.push(n);
    try { localStorage.setItem('admina_offres_favs', JSON.stringify(f)); } catch (e) {}
    return i < 0;
  }

  /* ---------------- toasts ---------------- */
  function toastsZone() {
    var z = $('.admina-ofx-toasts');
    if (!z) {
      z = document.createElement('div');
      z.className = 'admina-ofx-toasts';
      z.setAttribute('data-admina-ofx', 'toasts');
      var live = document.createElement('div');
      live.className = 'admina-ofx-live admina-ofx-live-txt';
      live.setAttribute('aria-live', 'polite');
      z.appendChild(live);
      document.body.appendChild(z);
    }
    return z;
  }
  function toast(msg, tone) {
    var z = toastsZone();
    var t = document.createElement('div');
    t.className = 'admina-ofx-toast';
    t.setAttribute('data-tone', tone || 'ok');
    var s = document.createElement('span');
    s.textContent = msg;
    var x = document.createElement('button');
    x.textContent = '×';
    x.setAttribute('aria-label', 'Fermer la notification');
    x.onclick = function () { t.remove(); };
    t.appendChild(s); t.appendChild(x);
    z.appendChild(t);
    var live = $('.admina-ofx-live-txt', z);
    if (live) live.textContent = msg;
    setTimeout(function () { t.remove(); }, 4200);
  }

  /* ======================= prédicats ======================= */
  var PREDS = {
    favs: { label: 'Favoris', tone: 'fav',
      fn: function (o) { return isFav(o.numero); } },
    expirees: { label: 'Expirées', tone: 'danger',
      fn: function (o) { var j = joursAvant(o.dateCloture); return actif(o) && j !== null && j < 0; } },
    cloture7: { label: 'Clôture ≤ 7 j', tone: 'warn',
      fn: function (o) { var j = joursAvant(o.dateCloture); return actif(o) && j !== null && j >= 0 && j <= 7; } },
    zero: { label: 'Sans candidature', tone: 'danger',
      fn: function (o) { return actif(o) && !(o.nbCandidaturesRecues > 0); } },
    urgentes: { label: 'Urgentes', tone: 'warn',
      fn: function (o) { return actif(o) && o.priorite === 'Urgente'; } },
    acreer: { label: 'À créer', tone: 'muted',
      fn: function (o) { return o.statutOffre === 'A creer'; } }
  };
  function applyPred(key) {
    predKey = (predKey === key) ? null : key;
    window.__ADMINA_OFFRES_PRED__ = key && predKey ? PREDS[key].fn : null;
    var a = api();
    if (a) { a.setPage(0); a.bump(); }
    refresh();
    announce(key && predKey ? ('Filtre intelligent : ' + PREDS[key].label) : 'Filtre intelligent retiré');
  }

  /* ======================= filtres natifs (DOM) ======================= */
  function readNativeFilters() {
    var selects = $$('.MuiInputBase-root .MuiSelect-select');
    var dept = 'Tous', statut = 'Tous', canal = 'Tous';
    // identification par position : ordre d'affichage dept, statut, canal
    var vals = selects.map(function (s) { return (s.textContent || '').trim(); });
    vals.forEach(function (v, idx) {
      if (/^Tous les d/.test(v)) dept = 'Tous';
      else if (idx === 0) dept = v;
      if (/^Tous les statuts/.test(v)) statut = 'Tous';
      else if (idx === 1) statut = v;
      if (/^Tous les canaux/.test(v)) canal = 'Tous';
      else if (idx === 2) canal = v;
    });
    var inp = $('input[placeholder^="Rechercher par"]');
    var q = inp ? inp.value : '';
    return { dept: dept, statut: statut, canal: canal, q: q };
  }
  function filtrer(list) {
    var f = readNativeFilters();
    var t = norm(f.q).trim();
    var pred = (predKey && window.__ADMINA_OFFRES_PRED__) || null;
    return list.filter(function (o) {
      if (f.dept !== 'Tous' && o.departement !== f.dept) return false;
      if (f.statut !== 'Tous' && o.statutOffre !== f.statut) return false;
      if (f.canal !== 'Tous' && o.canalDiffusion !== f.canal) return false;
      if (t && (norm(o.numero).indexOf(t) < 0 && norm(o.intitule).indexOf(t) < 0 &&
                norm(o.departement).indexOf(t) < 0 && norm(o.responsable).indexOf(t) < 0)) return false;
      if (pred && !pred(o)) return false;
      return true;
    });
  }

  /* ======================= repères DOM ======================= */
  function ancreH5() {
    var hs = $$('h5, h1, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/offres d'emploi/i.test(hs[i].textContent || '')) return hs[i];
    }
    return null;
  }
  function conteneurRacine() {
    var h5 = ancreH5();
    if (!h5) return null;
    var n = h5;
    while (n && n.parentElement && n.parentElement !== document.body && !$$('table', n).length) n = n.parentElement;
    return n || document.body.firstElementChild;
  }

  /* ======================= 1. héro ======================= */
  function buildHero(root) {
    if ($('.admina-ofx-hero', root)) return;
    var d = data();
    var actives = d.filter(function (o) { return actif(o); }).length;
    var cands = d.reduce(function (s, o) { return s + (o.nbCandidaturesRecues || 0); }, 0);
    var fav = favs().length;
    var hero = document.createElement('section');
    hero.className = 'admina-ofx admina-ofx-hero';
    hero.setAttribute('data-admina-ofx', 'hero');
    hero.innerHTML =
      '<div class="admina-ofx-hrow">' +
        '<h2>Offres d\u2019Emploi <span class="admina-ofx-badge">ISO 9001 \u00b7 30414</span></h2>' +
        '<div class="admina-ofx-hstats">' +
          '<div class="admina-ofx-hstat"><b>' + d.length + '</b><span>offres</span></div>' +
          '<div class="admina-ofx-hstat"><b>' + actives + '</b><span>actives</span></div>' +
          '<div class="admina-ofx-hstat"><b>' + cands + '</b><span>candidatures</span></div>' +
          '<div class="admina-ofx-hstat"><b>' + fav + '</b><span>favoris</span></div>' +
        '</div>' +
      '</div>' +
      '<p>Pilotez la publication, le suivi des candidatures et la cl\u00f4ture de vos offres \u2014 mis \u00e0 jour en direct.</p>';
    root.insertBefore(hero, root.firstChild);
    var h5n = ancreH5();
    if (h5n && !h5n.getAttribute('data-ofx-hide')) {
      h5n.setAttribute('data-ofx-hide', '1');
      h5n.setAttribute('data-ofx-old-disp', h5n.style.display || '');
      h5n.style.display = 'none';
    }
  }

  function refreshHero(root) {
    var hero = $('.admina-ofx-hero', root);
    if (!hero) return;
    var d = data();
    var actives = d.filter(function (o) { return actif(o); }).length;
    var cands = d.reduce(function (s, o) { return s + (o.nbCandidaturesRecues || 0); }, 0);
    var fav = favs().length;
    var bs = $$('.admina-ofx-hstat b', hero);
    if (bs.length === 4) {
      var hv = [String(d.length), String(actives), String(cands), String(fav)];
      for (var hi = 0; hi < 4; hi++) { if (bs[hi].textContent !== hv[hi]) bs[hi].textContent = hv[hi]; }
    }
  }

  /* ======================= 2. insights ======================= */
  function refreshInsights() {
    var bar = $('.admina-ofx-insights');
    if (!bar) return;
    var d = data();
    var counts = {
      expirees: d.filter(PREDS.expirees.fn).length,
      cloture7: d.filter(PREDS.cloture7.fn).length,
      zero: d.filter(PREDS.zero.fn).length,
      urgentes: d.filter(PREDS.urgentes.fn).length,
      acreer: d.filter(PREDS.acreer.fn).length,
      favs: favs().length
    };
    /* anti-boucle : ne reconstruire que si les compteurs changent (le clic utilisateur
       doit toujours retomber sur le même élément, sinon mousedown/up ne produit pas de click) */
    var csig = [counts.expirees, counts.cloture7, counts.zero, counts.urgentes, counts.acreer, counts.favs].join(',');
    if (bar._ofxCsig === csig) {
      if (bar._ofxPred !== (predKey || '')) {
        bar._ofxPred = predKey || '';
        $$('.admina-ofx-chip', bar).forEach(function (c) {
          c.setAttribute('aria-pressed', predKey && c.getAttribute('data-key') === predKey ? 'true' : 'false');
        });
      }
      return;
    }
    bar._ofxCsig = csig; bar._ofxPred = predKey || '';
    bar.innerHTML = '';
    var lab = document.createElement('span');
    lab.className = 'admina-ofx-ilabel';
    lab.textContent = '\u25c6 Analyse intelligente';
    bar.appendChild(lab);
    [['expirees', counts.expirees], ['cloture7', counts.cloture7], ['zero', counts.zero],
     ['urgentes', counts.urgentes], ['acreer', counts.acreer], ['favs', counts.favs]]
      .forEach(function (p) {
        if (!p[1]) return;
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'admina-ofx-chip';
        c.setAttribute('data-key', p[0]);
        c.setAttribute('data-tone', PREDS[p[0]].tone);
        c.setAttribute('aria-pressed', predKey === p[0] ? 'true' : 'false');
        c.innerHTML = '<span class="n">' + p[1] + '</span> ' + PREDS[p[0]].label;
        c.onclick = function () { applyPred(p[0]); };
        bar.appendChild(c);
      });
    var hint = document.createElement('span');
    hint.style.cssText = 'margin-left:auto;font-size:.68rem;color:#8d7a3f;';
    hint.textContent = 'Cliquez sur une alerte pour filtrer';
    bar.appendChild(hint);
  }
  function buildInsights(root) {
    if ($('.admina-ofx-insights', root)) { refreshInsights(); return; }
    var bar = document.createElement('div');
    bar.className = 'admina-ofx admina-ofx-insights';
    bar.setAttribute('data-admina-ofx', 'insights');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Alertes intelligentes');
    var kg = kpiGrid();
    var hero = $('.admina-ofx-hero', root);
    if (hero) hero.insertAdjacentElement('afterend', bar);
    else (kg.grid || root).insertAdjacentElement(kg.grid ? 'afterend' : 'afterbegin', bar);
    refreshInsights();
  }

  /* ======================= 3. cartes KPI natives enrichies ======================= */
  function kpiGrid() {
    /* strict : uniquement les 4 cartes KPI natives — ni la table (qui contient le texte
       « Candidatures en cours » dans ses lignes), ni nos propres éléments */
    var RE = /^(TOTAL OFFRES|PUBLI\u00c9ES|CANDIDATURES EN COURS|TOTAL CANDIDATURES)/i;
    var papers = $$('.MuiPaper-root').filter(function (p) {
      return !p.querySelector('table') && !p.closest('[data-admina-ofx]') && RE.test((p.textContent || '').trim());
    });
    if (papers.length < 4) return { papers: papers, grid: null };
    return { papers: papers, grid: papers[0].parentElement ? papers[0].parentElement.parentElement : null };
  }
  function enhanceKpis(root) {
    var kg = kpiGrid();
    var grid = kg.grid, papers = kg.papers;
    if (!grid || !papers.length) return;
    var d = data();
    var colors = ['#0f7a5e', '#0f7a5e', '#e65100', '#7b1fa2'];
    var cands = d.reduce(function (s, o) { return s + (o.nbCandidaturesRecues || 0); }, 0);
    var att = d.reduce(function (s, o) { return s + (o.nbCandidatures || 0); }, 0);
    var ratios = [1, d.length ? d.filter(function (o) { return o.statutOffre === 'Publiee'; }).length / d.length : 0,
                  d.length ? d.filter(function (o) { return o.statutOffre === 'Candidatures en cours'; }).length / d.length : 0,
                  att ? Math.min(cands / att, 1) : 0];
    papers.forEach(function (p, i) {
      if (p.getAttribute('data-ofx-kpi')) return;
      p.setAttribute('data-ofx-kpi', String(i));
      p.classList.add('admina-ofx-kpi');
      p.style.setProperty('--kpi-c', colors[i] || '#0f7a5e');
      var bar = document.createElement('div');
      bar.className = 'admina-ofx-kpi-bar';
      bar.innerHTML = '<i style="width:' + Math.round(ratios[i] * 100) + '%"></i>';
      p.appendChild(bar);
      if (i <= 2) {
        p.setAttribute('role', 'button');
        p.setAttribute('tabindex', '0');
        p.setAttribute('aria-label', 'Filtrer : ' + (p.textContent || '').split('\n')[0]);
        p.style.cursor = 'pointer';
        var actfn = [function () { var a = api(); a.setFilters('Tous', 'Tous', 'Tous'); a.setSearch(''); applyPred(null); },
                     function () { var a = api(); a.setFilters('Tous', 'Publiee', 'Tous'); a.setPage(0); toast('Filtre : offres publi\u00e9es'); },
                     function () { var a = api(); a.setFilters('Tous', 'Candidatures en cours', 'Tous'); a.setPage(0); toast('Filtre : candidatures en cours'); }][i];
        p.onclick = actfn;
        p.onkeydown = function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); actfn(); }
        };
      }
    });
    // 2 cartes intelligentes supplémentaires
    var c7 = d.filter(PREDS.cloture7.fn).length;
    var c0 = d.filter(PREDS.zero.fn).length;
    var extra = [
      { key: 'cloture7', tone: '#b8860b', titre: 'CL\u00d4TURE \u2264 7 J', val: c7, sub: 'agir vite', r: c7 ? Math.min(c7 / Math.max(d.length, 1), 1) : 0 },
      { key: 'zero', tone: '#d32f2f', titre: 'SANS CANDIDATURE', val: c0, sub: 'revoir le canal', r: c0 ? Math.min(c0 / Math.max(d.length, 1), 1) : 0 }
    ];
    /* rangée dédiée pour les 2 KPI supplémentaires — insérée DIRECTEMENT APRÈS la
       rangée KPI native (css-1lwwoo2, enfant direct de la colonne racine).
       Correctif M11 : ils étaient appendChild(grid=colonne racine) → tout en bas. */
    var extrasRow = $('.admina-ofx-extrasrow');
    if (!extrasRow) {
      extrasRow = document.createElement('div');
      extrasRow.className = 'admina-ofx admina-ofx-extrasrow';
      extrasRow.setAttribute('data-admina-ofx', 'kpi-extras');
      var kpiRow = papers[0] && papers[0].parentElement && papers[0].parentElement.parentElement && papers[0].parentElement.parentElement !== document.body ? papers[0].parentElement : null;
      if (kpiRow && kpiRow.parentElement) {
        kpiRow.parentElement.insertBefore(extrasRow, kpiRow.nextSibling);
      } else {
        var sInput = $('input[placeholder^="Rechercher par"]');
        var sBox = sInput ? (sInput.closest('.MuiFormControl-root') || sInput.closest('.MuiInputBase-root') || sInput.parentElement) : null;
        if (sBox && sBox.parentElement) sBox.parentElement.insertBefore(extrasRow, sBox);
        else grid.appendChild(extrasRow);
      }
    }
    extra.forEach(function (x) {
      var id = 'ofx-extra-' + x.key;
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'admina-ofx admina-ofx-kpi MuiPaper-root';
        el.setAttribute('data-admina-ofx', 'kpi-extra');
        el.style.cssText = 'flex:1 1 260px;min-width:240px;padding:16px 16px 14px;border-radius:10px;background:#fff;border:1px solid #e3e7ea;' +
          'box-shadow:0 1px 4px rgba(0,0,0,.08);position:relative;overflow:hidden;';
        el.innerHTML = '<div style="font-size:.68rem;font-weight:800;letter-spacing:.5px;color:#6b7a86;">' + x.titre + '</div>' +
          '<div style="font-size:1.7rem;font-weight:800;color:#1d2b36;line-height:1.25;">' + x.val + '</div>' +
          '<div class="admina-ofx-kpi-sub">' + x.sub + '</div>';
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', 'Filtrer : ' + x.titre);
        el.style.cursor = 'pointer';
        el.style.setProperty('--kpi-c', x.tone);
        el.onclick = function () { applyPred(x.key); };
        el.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyPred(x.key); } };
        extrasRow.appendChild(el);
      } else if (el.children[1] && el.children[1].textContent !== String(x.val)) {
        el.children[1].textContent = String(x.val);
      }
      var b = $('.admina-ofx-kpi-bar', el);
      if (!b) { b = document.createElement('div'); b.className = 'admina-ofx-kpi-bar'; b.innerHTML = '<i></i>'; el.appendChild(b); }
      var bi = $('i', b), bw = Math.round(x.r * 100) + '%';
      if (bi && bi.style.width !== bw) bi.style.width = bw;
    });
  }

  /* ======================= 4. toolbar : Vue + Export ======================= */
  function buildToolbar(root) {
    if ($('[data-admina-ofx="vue"]', root)) return;
    var btns = $$('button', root).filter(function (b) { return /Exporter CSV/.test(b.textContent || ''); });
    var csvBtn = btns[0];
    if (!csvBtn) return;
    /* bouton Vue */
    var vbtn = document.createElement('button');
    vbtn.type = 'button';
    vbtn.setAttribute('data-admina-ofx', 'vue');
    vbtn.className = 'admina-ofx-vuebtn';
    vbtn.style.cssText = 'display:inline-flex;align-items:center;gap:7px;padding:7px 14px;border-radius:9px;' +
      'border:1px solid rgba(15,122,94,.5);background:#eef6f2;color:#0d5c46;font-weight:700;font-size:.8rem;' +
      'cursor:pointer;min-height:37px;';
    function vueLabel() { vbtn.textContent = view === 'table' ? '\u25a3 Vue cartes' : '\u2630 Vue tableau'; }
    vueLabel();
    vbtn.onclick = function () {
      view = (view === 'table') ? 'cards' : 'table';
      try { localStorage.setItem('admina_offres_view', view); } catch (e) {}
      vueLabel();
      applyView();
      toast('Vue : ' + (view === 'cards' ? 'cartes' : 'tableau'));
    };
    csvBtn.insertAdjacentElement('afterend', vbtn);
    /* bouton Export ▾ */
    var ebtn = document.createElement('button');
    ebtn.type = 'button';
    ebtn.setAttribute('data-admina-ofx', 'export');
    ebtn.style.cssText = vbtn.style.cssText + 'background:#fff;color:#37474f;border-color:#c7d0d6;';
    ebtn.textContent = 'Export \u25be';
    ebtn.setAttribute('aria-haspopup', 'menu');
    ebtn.setAttribute('aria-label', 'Options d\u2019export');
    vbtn.insertAdjacentElement('afterend', ebtn);
    ebtn.onclick = function (ev) {
      ev.stopPropagation();
      var r = ebtn.getBoundingClientRect();
      openExportMenu(r.left, r.bottom + 6);
    };
    function applyView() {
      html.classList.toggle('admina-ofx-cards-on', view === 'cards');
      refresh();
    }
    applyView._done = true;
    html.classList.toggle('admina-ofx-cards-on', view === 'cards');
  }

  /* ======================= 5. menu export ======================= */
  function closeMenus() { $$('[data-admina-ofx="menu"], [data-admina-ofx="help"]').forEach(function (m) { m.remove(); }); }
  function openExportMenu(x, y) {
    closeMenus();
    var m = document.createElement('div');
    m.className = 'admina-ofx admina-ofx-menu';
    m.setAttribute('data-admina-ofx', 'menu');
    m.setAttribute('role', 'menu');
    var items = [
      ['CSV', 'colonnes compl\u00e8tes', function () { jlog('Export | CSV offres', String(filtrer(data()).length)); doCSV(filtrer(data()), 'offres_emploi.csv'); toast('Export CSV g\u00e9n\u00e9r\u00e9'); }],
      ['Excel (.xls)', 'mise en page tableau', function () { jlog('Export | XLS offres', String(filtrer(data()).length)); doXLS(filtrer(data())); toast('Export Excel g\u00e9n\u00e9r\u00e9'); }],
      ['JSON', 'donn\u00e9es + m\u00e9tadonn\u00e9es', function () { jlog('Export | JSON offres', String(filtrer(data()).length)); doJSON(filtrer(data())); toast('Export JSON g\u00e9n\u00e9r\u00e9'); }],
      ['Copier', 'TSV vers presse-papiers', function () { doCopy(filtrer(data())); toast('Tableau copi\u00e9 \u2014 collez dans Excel'); }],
      ['Imprimer / PDF', 'A4 paysage', function () { jlog('Export | Impression offres', String(filtrer(data()).length)); doPrint(filtrer(data())); }],
      ['Copier le lien filtr\u00e9', 'partage d\u2019URL', function () { doShareLink(); }]
    ];
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.setAttribute('role', 'menuitem');
      b.type = 'button';
      b.innerHTML = it[0] + '<small>' + it[1] + '</small>';
      b.onclick = function () { closeMenus(); it[2](); };
      m.appendChild(b);
    });
    document.body.appendChild(m);
    var mw = m.offsetWidth, mh = m.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    m.style.left = Math.max(8, Math.min(x, vw - mw - 8)) + 'px';
    m.style.top = Math.max(8, Math.min(y, vh - mh - 8)) + 'px';
    var first = $('button', m);
    if (first) first.focus();
    m.addEventListener('keydown', function (e) {
      var bs = $$('button', m), i = bs.indexOf(document.activeElement);
      if (e.key === 'Escape') { closeMenus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); (bs[i + 1] || bs[0]).focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (bs[i - 1] || bs[bs.length - 1]).focus(); }
    });
  }
  document.addEventListener('click', function (e) {
    if (!active) return;
    if (!e.target.closest || (!e.target.closest('.admina-ofx-menu') && !e.target.closest('[data-admina-ofx="export"]'))) closeMenus();
  });

  /* ---------------- générateurs d'export ---------------- */
  var COLS = [['numero', 'N°'], ['intitule', 'Intitulé'], ['departement', 'Département'], ['typePoste', 'Type Poste'],
    ['typeContrat', 'Type Contrat'], ['canalDiffusion', 'Canal'], ['statutOffre', 'Statut Offre'],
    ['datePublication', 'Publication'], ['dateCloture', 'Clôture'], ['dateRequise', 'Date Requise'],
    ['responsable', 'Responsable'], ['priorite', 'Priorité'], ['budgetAlloue', 'Budget Alloué'],
    ['salaireMin', 'Salaire Min'], ['salaireMax', 'Salaire Max'], ['nbCandidaturesRecues', 'Candidatures Reçues'],
    ['nbCandidatures', 'Candidatures Attendues'], ['site', 'Site']];
  function esc(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  function dl(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function csvOf(list) {
    var rows = [COLS.map(function (c) { return esc(c[1]); }).join(';')];
    list.forEach(function (o) { rows.push(COLS.map(function (c) { return esc(o[c[0]]); }).join(';')); });
    return '\ufeff' + rows.join('\r\n');
  }
  function doCSV(list, name) { dl(new Blob([csvOf(list)], { type: 'text/csv;charset=utf-8' }), name || 'offres_emploi.csv'); }
  function doXLS(list) {
    var h = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>' +
      '<table border="1"><tr>' + COLS.map(function (c) { return '<th style="background:#0f7a5e;color:#fff">' + c[1] + '</th>'; }).join('') + '</tr>' +
      list.map(function (o) { return '<tr>' + COLS.map(function (c) { return '<td>' + (o[c[0]] == null ? '' : o[c[0]]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table></body></html>';
    dl(new Blob([h], { type: 'application/vnd.ms-excel' }), 'offres_emploi.xls');
  }
  function doJSON(list) {
    var out = { application: 'Admina-RH \u2014 Domaine 1 Recrutement', page: 'Offres d\u2019Emploi',
      exporte: new Date().toISOString(), norme: 'ISO 9001 \u00b7 ISO 30414', total: list.length, offres: list };
    dl(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), 'offres_emploi.json');
  }
  function doCopy(list) {
    var tsv = COLS.map(function (c) { return c[1]; }).join('\t') + '\n' +
      list.map(function (o) { return COLS.map(function (c) { return o[c[0]] == null ? '' : o[c[0]]; }).join('\t'); }).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).catch(function () { fallbackCopy(tsv); });
    } else fallbackCopy(tsv);
  }
  function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }
  function doShareLink() {
    var f = readNativeFilters();
    var p = new URLSearchParams();
    if (f.dept !== 'Tous') p.set('dept', f.dept);
    if (f.statut !== 'Tous') p.set('statut', f.statut);
    if (f.canal !== 'Tous') p.set('canal', f.canal);
    if (f.q) p.set('q', f.q);
    var url = location.origin + location.pathname + (p.toString() ? '?' + p.toString() : '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast('Lien copi\u00e9 \u2014 les filtres s\u2019appliqueront \u00e0 l\u2019ouverture'); },
        function () { fallbackCopy(url); toast('Lien copi\u00e9'); });
    } else { fallbackCopy(url); toast('Lien copi\u00e9'); }
    jlog('Partage | Lien offres filtr\u00e9', p.toString() || '(aucun filtre)');
  }
  function doPrint(list) {
    var f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f);
    var doc = f.contentDocument;
    doc.open();
    doc.write('<html><head><meta charset="utf-8"><title>Offres d\u2019Emploi \u2014 Admina-RH</title><style>' +
      '@page{size:A4 landscape;margin:11mm}' +
      'body{font-family:Arial,Helvetica,sans-serif;color:#1d2b36;font-size:9.5px}' +
      'h1{font-size:15px;margin:0 0 2px}h1 span{color:#0f7a5e}' +
      '.meta{font-size:8.5px;color:#607080;margin-bottom:10px}' +
      'table{width:100%;border-collapse:collapse}' +
      'th{background:#0f7a5e;color:#fff;text-align:left;padding:4px 5px;font-size:8.5px}' +
      'td{border-bottom:1px solid #dde3e6;padding:4px 5px;vertical-align:top}' +
      'tr:nth-child(even) td{background:#f4f8f6}' +
      '.ft{margin-top:10px;font-size:7.5px;color:#8a97a0;text-align:center}' +
      '</style></head><body>' +
      '<h1>Admina-RH <span>\u2014 Offres d\u2019Emploi</span></h1>' +
      '<div class="meta">' + list.length + ' offre(s) \u00b7 \u00e9dit\u00e9 le ' + new Date().toLocaleString('fr-FR') + ' \u00b7 ISO 9001 / 30414</div>' +
      '<table><tr>' + COLS.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '</tr>' +
      list.map(function (o) { return '<tr>' + COLS.map(function (c) { return '<td>' + (o[c[0]] == null ? '' : o[c[0]]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table><div class="ft">Admina-RH \u00b7 Domaine 1 \u2014 Recrutement \u00b7 document g\u00e9n\u00e9r\u00e9 automatiquement</div></body></html>');
    doc.close();
    setTimeout(function () { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(function () { f.remove(); }, 3000); }, 250);
  }

  /* ======================= 6. lignes : favoris, badges, checkboxes, actions ======================= */
  function findOffer(numero) {
    var d = data();
    for (var i = 0; i < d.length; i++) if (d[i].numero === numero) return d[i];
    return null;
  }
  function enhanceRows() {
    var table = $('table');
    if (!table) return;
    var head = $('thead tr', table);
    if (!head) return;
    /* colonne checkbox */
    var ths = $$('th', head);
    if (ths[0] && !ths[0].hasAttribute('data-ofx-chk-col')) {
      var th = document.createElement('th');
      th.setAttribute('data-ofx-chk-col', '1');
      th.style.cssText = 'width:36px;padding:8px 4px 8px 12px;';
      var call = document.createElement('input');
      call.type = 'checkbox';
      call.className = 'admina-ofx-chk';
      call.setAttribute('data-admina-ofx', 'chk-all');
      call.setAttribute('aria-label', 'Tout s\u00e9lectionner');
      call.onclick = function (e) {
        e.stopPropagation();
        var on = call.checked;
        SEL = {};
        $$('.admina-ofx-chk[data-num]', table).forEach(function (c) {
          c.checked = on;
          if (on) SEL[c.getAttribute('data-num')] = true;
        });
        refreshBulk();
      };
      th.appendChild(call);
      head.insertBefore(th, ths[0]);
    }
    updateChkAll(table);
    /* lignes */
    $$('tbody tr', table).forEach(function (tr) {
      if (!tr.getAttribute('data-ofx-done') || !$('td[data-ofx-chk-cell]', tr)) {
        var old0 = $('td[data-ofx-chk-cell]', tr);
        if (old0) old0.remove();
        var td0 = document.createElement('td');
        td0.setAttribute('data-ofx-chk-cell', '1');
        td0.style.cssText = 'padding:8px 4px 8px 12px;';
        var chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.className = 'admina-ofx-chk';
        chk.setAttribute('aria-label', 'S\u00e9lectionner cette offre');
        td0.appendChild(chk);
        tr.insertBefore(td0, tr.firstChild);
        tr.setAttribute('data-ofx-done', '1');
      }
      var cells = $$('td', tr);
      var numEl = cells[1];
      var num = numEl ? (numEl.textContent || '').match(/OF-\d{4}-\d{3}(?!\d)/) : null;
      if (!num) return;
      var numero = num[0];
      var o = findOffer(numero);
      if (!o) return;
      var chk = $('.admina-ofx-chk', tr);
      if (!chk) return;
      if (chk.getAttribute('data-num') !== numero) {
        chk.setAttribute('data-num', numero);
        chk.setAttribute('aria-label', 'S\u00e9lectionner ' + numero);
      }
      chk.checked = !!SEL[numero];
      chk.onclick = function (e) { e.stopPropagation(); };
      chk.onchange = function () { if (chk.checked) SEL[numero] = true; else delete SEL[numero]; refreshBulk(); updateChkAll(table); };
      /* étoile favori dans la cellule N° */
      var cellNum = cells[1];
      if (cellNum && !$('.admina-ofx-fav', cellNum)) {
        cellNum.classList.add('admina-ofx-num');
        var fv = document.createElement('button');
        fv.type = 'button';
        fv.className = 'admina-ofx-fav';
        fv.setAttribute('aria-pressed', isFav(numero) ? 'true' : 'false');
        fv.setAttribute('aria-label', 'Favori ' + numero);
        fv.title = 'Ajouter/retirer des favoris';
        fv.innerHTML = isFav(numero) ? '\u2605' : '\u2606';
        fv.onclick = function (e) {
          e.stopPropagation();
          var on = toggleFav(numero);
          fv.setAttribute('aria-pressed', on ? 'true' : 'false');
          fv.innerHTML = on ? '\u2605' : '\u2606';
          toast(on ? numero + ' ajout\u00e9 aux favoris' : numero + ' retir\u00e9 des favoris');
          refresh();
        };
        cellNum.insertBefore(fv, cellNum.firstChild);
      }
      /* badges Publication (clôture) + barre candidatures */
      var cellPub = cells[2], cellCand = cells[6];
      if (cellPub && !$('.admina-ofx-cellsub', cellPub)) {
        var sub = document.createElement('div');
        sub.className = 'admina-ofx-cellsub';
        sub.setAttribute('data-ofx-sub', '1');
        var j = joursAvant(o.dateCloture);
        if (o.statutOffre === 'A creer') {
          sub.innerHTML = tag('muted', '\u00c0 publier');
        } else if (j === null) {
          sub.innerHTML = tag('muted', 'Pas de cl\u00f4ture');
        } else if (j < 0 && actif(o)) {
          sub.innerHTML = tag('danger', 'Expir\u00e9e depuis ' + (-j) + ' j');
        } else if (j <= 7 && actif(o)) {
          sub.innerHTML = tag('warn', 'Cl\u00f4ture J-' + j);
        } else if (o.dateCloture) {
          sub.innerHTML = tag('muted', 'Cl\u00f4ture : ' + o.dateCloture);
        }
        if (sub.innerHTML) cellPub.appendChild(sub);
      }
      if (cellCand && !$('.admina-ofx-cbar', cellCand)) {
        var rec = o.nbCandidaturesRecues || 0, att = o.nbCandidatures || 0;
        var ratio = att ? Math.min(rec / att, 1) : (rec > 0 ? 1 : 0);
        var tone = ratio >= .6 ? '' : (ratio >= .25 ? ' data-mid="1"' : ' data-low="1"');
        var csub = document.createElement('div');
        csub.className = 'admina-ofx-cellsub';
        csub.innerHTML = '<div class="admina-ofx-cbar"><i' + tone + ' style="width:' + Math.round(ratio * 100) + '%"></i></div>' +
          '<span style="font-size:.62rem;color:#78848e;">' + rec + '/' + att + '</span>';
        cellCand.appendChild(csub);
      }
      /* actions : dupliquer + copier le lien */
      var last = cells[cells.length - 1];
      if (last && !$('.admina-ofx-rowact', last)) {
        var wrap = document.createElement('div');
        wrap.className = 'admina-ofx-rowact';
        wrap.style.cssText = 'display:inline-flex;gap:2px;vertical-align:middle;';
        wrap.innerHTML =
          '<button type="button" data-act="dup" title="Dupliquer l\u2019offre" aria-label="Dupliquer ' + numero + '" style="border:none;background:transparent;cursor:pointer;font-size:15px;padding:4px;border-radius:6px;">\u29c9</button>' +
          '<button type="button" data-act="lnk" title="Copier le lien de partage" aria-label="Copier le lien de ' + numero + '" style="border:none;background:transparent;cursor:pointer;font-size:15px;padding:4px;border-radius:6px;">\ud83d\udd17</button>';
        var bd = $('[data-act="dup"]', wrap), bl = $('[data-act="lnk"]', wrap);
        bd.onclick = function (e) { e.stopPropagation(); dupliquer(o); };
        bl.onclick = function (e) {
          e.stopPropagation();
          var url = location.origin + location.pathname + '?q=' + encodeURIComponent(numero);
          (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
            function () { toast('Lien de ' + numero + ' copi\u00e9'); },
            function () { fallbackCopy(url); toast('Lien de ' + numero + ' copi\u00e9'); });
        };
        [bd, bl].forEach(function (b) {
          b.onmouseenter = function () { b.style.background = 'rgba(15,122,94,.12)'; };
          b.onmouseleave = function () { b.style.background = 'transparent'; };
        });
        last.appendChild(wrap);
      }
    });
  }
  function tag(tone, txt) { return '<span class="admina-ofx-tag" data-tone="' + tone + '">' + txt + '</span>'; }
  function updateChkAll(table) {
    var all = $('[data-admina-ofx="chk-all"]');
    if (!all) return;
    var boxes = $$('.admina-ofx-chk[data-num]', table);
    var on = boxes.filter(function (b) { return b.checked; }).length;
    all.checked = boxes.length > 0 && on === boxes.length;
    all.indeterminate = on > 0 && on < boxes.length;
  }
  function syncChk(table) {
    $$('.admina-ofx-chk[data-num]', table).forEach(function (b) { b.checked = !!SEL[b.getAttribute('data-num')]; });
    updateChkAll(table);
  }

  /* ======================= 7. duplication ======================= */
  function dupliquer(o) {
    var a = api();
    if (!a) return;
    var nums = data().map(function (x) {
      var m = /OF-(\d{4})-(\d+)/.exec(x.numero || '');
      return m ? [+m[1], +m[2]] : [2025, 0];
    });
    var maxY = 2025, maxN = 0;
    nums.forEach(function (p) { if (p[0] > maxY) maxY = p[0]; if (p[1] > maxN) maxN = p[1]; });
    var newNum = 'OF-' + maxY + '-' + String(maxN + 1).padStart(3, '0');
    var maxId = data().reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0);
    var copy = JSON.parse(JSON.stringify(o));
    copy.id = maxId + 1;
    copy.numero = newNum;
    copy.statutOffre = 'A creer';
    copy.datePublication = '';
    copy.dateCloture = '';
    copy.nbCandidaturesRecues = 0;
    copy.nbCandidatures = 0;
    copy.candidatsAssocies = [];
    copy.historique = [{ date: today(), evenement: 'Dupliqu\u00e9e depuis ' + o.numero, auteur: 'Utilisateur', type: 'creation' }];
    a.set(function (prev) { return prev.concat([copy]); });
    jlog('Duplication offre', o.numero + ' \u2192 ' + newNum);
    toast(newNum + ' cr\u00e9\u00e9e \u00e0 partir de ' + o.numero + ' (statut \u00c0 cr\u00e9er)');
    refresh(); /* re-enhance les nouvelles lignes sans attendre l'observateur */
  }

  /* ======================= 8. actions groupées ======================= */
  function refreshBulk() {
    var n = Object.keys(SEL).filter(function (k) { return SEL[k]; }).length;
    var bar = $('[data-admina-ofx="bulk"]');
    if (!n) { if (bar) bar.remove(); return; }
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'admina-ofx admina-ofx-bulk';
      bar.setAttribute('data-admina-ofx', 'bulk');
      bar.setAttribute('role', 'toolbar');
      bar.setAttribute('aria-label', 'Actions group\u00e9es');
      document.body.appendChild(bar);
      bar.innerHTML = '<span class="admina-ofx-bcount"></span>' +
        '<button type="button" data-act="clot">Cl\u00f4turer la s\u00e9lection</button>' +
        '<button type="button" data-act="csv">Exporter la s\u00e9lection</button>' +
        '<button type="button" data-act="clear">\u2715 Effacer</button>';
      bar.onclick = function (e) {
        var act = e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        var selNums = Object.keys(SEL).filter(function (k) { return SEL[k]; });
        if (act === 'clear') { SEL = {}; refreshBulk(); var t = $('table'); if (t) syncChk(t); return; }
        if (act === 'csv') {
          var list = data().filter(function (o) { return SEL[o.numero]; });
          jlog('Export | CSV s\u00e9lection offres', String(list.length));
          doCSV(list, 'offres_selection.csv');
          toast('CSV de la s\u00e9lection g\u00e9n\u00e9r\u00e9 (' + list.length + ')');
        }
        if (act === 'clot') {
          var a = api();
          if (!a) return;
          var dt = today();
          a.set(function (prev) {
            return prev.map(function (o) {
              if (!SEL[o.numero] || !actif(o)) return o;
              var h = (o.historique || []).concat([{ date: dt, evenement: 'Offre cl\u00f4tur\u00e9e (s\u00e9lection group\u00e9e)', auteur: 'Utilisateur', type: 'cloture' }]);
              return Object.assign({}, o, { statutOffre: 'Cloturee', dateCloture: o.dateCloture || dt, historique: h });
            });
          });
          jlog('Cl\u00f4ture group\u00e9e offres', selNums.join(', '));
          toast(selNums.length + ' offre(s) cl\u00f4tur\u00e9e(s)');
          SEL = {};
          refreshBulk();
          refresh();
        }
      };
    }
    var bc = $('.admina-ofx-bcount', bar);
    var btxt = n + ' offre(s) s\u00e9lectionn\u00e9e(s)';
    if (bc && bc.textContent !== btxt) bc.textContent = btxt;
  }

  /* ======================= 9. vue cartes ======================= */
  function health(o) {
    var s = 40;
    var att = o.nbCandidatures || 0, rec = o.nbCandidaturesRecues || 0;
    s += att ? Math.round(30 * Math.min(rec / att, 1)) : (rec > 0 ? 30 : 0);
    if (actif(o)) s += 20;
    var j = joursAvant(o.dateCloture);
    if (j === null || j > 7) s += 10;
    return Math.max(0, Math.min(100, s));
  }
  function refreshCards(root) {
    var host = $('.admina-ofx-cards', root);
    if (!host) {
      host = document.createElement('div');
      host.className = 'admina-ofx admina-ofx-cards';
      host.setAttribute('data-admina-ofx', 'cards');
      var table = $('table', root);
      if (table) {
        var wrap = table.closest('.MuiTableContainer-root') || table.parentElement;
        wrap.insertAdjacentElement('afterend', host);
      } else root.appendChild(host);
    }
    var list = filtrer(data());
    /* anti-boucle : signature du rendu cartes — rebuild uniquement si les données changent.
       Sans cela, le MutationObserver relançait refresh() ~17×/s et les clics réels
       (mousedown/mouseup) ne produisaient jamais d'événement click. */
    var sig = (predKey || '') + '|' + favs().join(',') + '|' + list.map(function (o) {
      return o.numero + ':' + o.statutOffre + ':' + (o.nbCandidaturesRecues || 0) + ':' + (o.nbCandidatures || 0) + ':' + (o.dateCloture || '') + ':' + (o.priorite || '') + ':' + (o.datePublication || '');
    }).join('|');
    if (host._ofxSig === sig) return;
    host._ofxSig = sig;
    host.innerHTML = '';
    if (!list.length) {
      host.innerHTML = '<div style="padding:36px;text-align:center;color:#78848e;grid-column:1/-1;">Aucune offre ne correspond aux filtres.</div>';
      return;
    }
    list.forEach(function (o) {
      var c = document.createElement('article');
      c.className = 'admina-ofx-card';
      c.setAttribute('tabindex', '0');
      c.setAttribute('data-admina-ofx', 'card');
      c.setAttribute('aria-label', o.numero + ' ' + o.intitule);
      var j = joursAvant(o.dateCloture);
      var clotTag = o.statutOffre === 'A creer' ? tag('muted', '\u00c0 publier')
        : (j === null ? '' : (!actif(o) ? tag('muted', 'Cl\u00f4tur\u00e9e le ' + o.dateCloture)
          : (j < 0 ? tag('danger', 'Expir\u00e9e') : (j <= 7 ? tag('warn', 'J-' + j) : tag('muted', o.dateCloture)))));
      var hs = health(o);
      var hc = hs >= 70 ? '#0f7a5e' : (hs >= 40 ? '#e8a400' : '#d32f2f');
      var rec = o.nbCandidaturesRecues || 0, att = o.nbCandidatures || 0;
      var ratio = att ? Math.min(rec / att, 1) : (rec > 0 ? 1 : 0);
      var tone = ratio >= .6 ? '' : (ratio >= .25 ? ' data-mid="1"' : ' data-low="1"');
      c.innerHTML =
        '<div class="admina-ofx-ctop">' +
          '<span class="admina-ofx-cnum">' + o.numero + '</span>' +
          '<span class="admina-ofx-tag" data-tone="info" style="border-color:' + (TONE_STATUT[o.statutOffre] || '#616161') + '22;color:' + (TONE_STATUT[o.statutOffre] || '#616161') + ';background:' + (TONE_STATUT[o.statutOffre] || '#616161') + '14;">' + (LIB_STATUT[o.statutOffre] || o.statutOffre) + '</span>' +
          (o.priorite === 'Urgente' ? tag('danger', 'Urgente') : (o.priorite === 'Haute' ? tag('warn', 'Haute') : '')) +
          '<button type="button" class="admina-ofx-fav admina-ofx-cfav" aria-pressed="' + (isFav(o.numero) ? 'true' : 'false') + '" aria-label="Favori ' + o.numero + '">' + (isFav(o.numero) ? '\u2605' : '\u2606') + '</button>' +
        '</div>' +
        '<h4>' + o.intitule + '</h4>' +
        '<div class="admina-ofx-cdept">' + o.departement + ' \u00b7 ' + (o.typeContrat || '') + ' \u00b7 ' + (o.canalDiffusion || '') + '</div>' +
        '<div class="admina-ofx-cstats">' +
          '<div class="admina-ofx-cstat"><b>' + rec + (att ? ' / ' + att : '') + '</b><span>candidatures</span></div>' +
          '<div class="admina-ofx-cstat"><b>' + fmtK(o.salaireMin || 0) + '\u2013' + fmtK(o.salaireMax || 0) + '</b><span>FCFA / mois</span></div>' +
          '<div class="admina-ofx-cstat"><b>' + fmtK(o.budgetAlloue || 0) + '</b><span>budget</span></div>' +
        '</div>' +
        '<div class="admina-ofx-cbar" style="width:100%"><i' + tone + ' style="width:' + Math.round(ratio * 100) + '%"></i></div>' +
        '<div class="admina-ofx-cfoot">' + clotTag +
          '<span class="admina-ofx-cspacer"></span>' +
          '<button type="button" data-act="dup" aria-label="Dupliquer ' + o.numero + '" style="border:1px solid #dfe3e6;background:#fff;border-radius:8px;padding:4px 9px;font-size:.7rem;font-weight:700;cursor:pointer;">Dupliquer</button>' +
          '<div class="admina-ofx-health" style="--hp:' + hs + '%;--hc:' + hc + ';" title="Score de sant\u00e9 : ' + hs + '/100">' + hs + '</div>' +
        '</div>';
      $('.admina-ofx-cfav', c).onclick = function (e) {
        e.stopPropagation();
        var on = toggleFav(o.numero);
        e.currentTarget.setAttribute('aria-pressed', on ? 'true' : 'false');
        e.currentTarget.innerHTML = on ? '\u2605' : '\u2606';
        toast(on ? o.numero + ' ajout\u00e9 aux favoris' : o.numero + ' retir\u00e9 des favoris');
        refresh();
      };
      $('[data-act="dup"]', c).onclick = function (e) { e.stopPropagation(); dupliquer(o); };
      c.onclick = function () { var a = api(); a && a.openDetail(o); };
      c.onkeydown = function (e) { if (e.key === 'Enter') { var a = api(); a && a.openDetail(o); } };
      host.appendChild(c);
    });
  }

  /* ======================= 10. fil d'Ariane ======================= */
  function fixBreadcrumb() {
    var cands = $$('header span[class*="MuiTypography-caption"]');
    cands.forEach(function (el) {
      if (/^Demandes$/.test((el.textContent || '').trim()) && !el.getAttribute('data-ofx-crumb')) {
        el.setAttribute('data-ofx-crumb', '1');
        el.setAttribute('data-ofx-old', 'Demandes');
        el.textContent = 'Offres d\u2019Emploi';
      }
    });
  }

  /* ======================= 11. raccourcis clavier ======================= */
  function helpPanel() {
    closeMenus();
    var h = document.createElement('div');
    h.className = 'admina-ofx admina-ofx-help';
    h.setAttribute('data-admina-ofx', 'help');
    h.innerHTML = '<div class="admina-ofx-hpanel"><h3>Raccourcis clavier \u2014 Offres</h3><table>' +
      '<tr><td><span class="admina-ofx-kbd">/</span></td><td>Rechercher</td></tr>' +
      '<tr><td><span class="admina-ofx-kbd">Ctrl</span> + <span class="admina-ofx-kbd">K</span></td><td>Rechercher</td></tr>' +
      '<tr><td><span class="admina-ofx-kbd">V</span></td><td>Basculer vue tableau / cartes</td></tr>' +
      '<tr><td><span class="admina-ofx-kbd">F</span></td><td>Filtre favoris</td></tr>' +
      '<tr><td><span class="admina-ofx-kbd">?</span></td><td>Cette aide</td></tr>' +
      '<tr><td><span class="admina-ofx-kbd">\u00c9chap</span></td><td>Effacer filtre intelligent / fermer</td></tr></table>' +
      '<div style="margin-top:14px;text-align:right;"><button type="button" style="border:1px solid #c7d0d6;background:#eef6f2;color:#0d5c46;font-weight:700;border-radius:8px;padding:6px 14px;cursor:pointer;">Fermer</button></div></div>';
    document.body.appendChild(h);
    h.onclick = function (e) { if (e.target === h || /Fermer/.test(e.target.textContent || '')) h.remove(); };
    var b = $('button', h); b && b.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (!active) return;
    var inField = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''));
    if (e.key === 'Escape') {
      var help = $('[data-admina-ofx="help"]');
      if (help) { help.remove(); return; }
      if (html.classList.contains('admina-ofx-nav-open')) { closeNav(); return; }
      if (predKey) { applyPred(null); return; }
      if (Object.keys(SEL).length) { SEL = {}; refreshBulk(); var t = $('table'); t && syncChk(t); }
      return;
    }
    if (inField) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { // (déjà filtré inField)
      e.preventDefault();
      var inp = $('input[placeholder^="Rechercher par"]');
      inp && inp.focus();
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      var inp2 = $('input[placeholder^="Rechercher par"]');
      inp2 && inp2.focus();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 'v') { var vb = $('[data-admina-ofx="vue"]'); vb && vb.click(); }
    if (k === 'f') { applyPred('favs'); }
    if (e.key === '?') { helpPanel(); }
  });

  /* ======================= 12. annonce + dark ======================= */
  function announce(msg) {
    var z = toastsZone();
    var live = $('.admina-ofx-live-txt', z);
    if (live) live.textContent = msg;
  }
  function watchDark() {
    function lum() {
      var c = getComputedStyle(document.body).backgroundColor;
      var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || '');
      if (!m) return 1;
      return (0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3]) / 255;
    }
    function apply() {
      var l = lum();
      html.classList.toggle('admina-dark', l < 0.5);
      var bg = getComputedStyle(document.body).backgroundColor;
      if (html.style.getPropertyValue('--admina-page-bg') !== bg) html.style.setProperty('--admina-page-bg', bg);
    }
    apply();
    clearInterval(darkT);
    darkT = setInterval(apply, 900);
  }

  /* ======================= drawer slide-over (mobile) ======================= */
  function markContent() {
    var root = conteneurRacine();
    if (!root) return;
    var n = root;
    while (n && n !== document.body) {
      var ml = parseFloat(getComputedStyle(n).marginLeft);
      if (ml >= 240 && ml <= 280 && !n.hasAttribute('data-ofx-content')) {
        n.setAttribute('data-ofx-content', '1');
      }
      n = n.parentElement;
    }
  }
  function closeNav() { html.classList.remove('admina-ofx-nav-open'); }
  function buildBurger() {
    markContent();
    if ($('.admina-ofx-burger')) return;
    var header = $('header');
    if (!header) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'admina-ofx admina-ofx-burger';
    b.setAttribute('data-admina-ofx', 'burger');
    b.setAttribute('aria-label', 'Ouvrir la navigation');
    b.textContent = '\u2630';
    b.onclick = function () {
      html.classList.add('admina-ofx-nav-open');
      var bd = $('.admina-ofx-backdrop');
      if (!bd) {
        bd = document.createElement('div');
        bd.className = 'admina-ofx admina-ofx-backdrop';
        bd.setAttribute('data-admina-ofx', 'backdrop');
        bd.onclick = closeNav;
        document.body.appendChild(bd);
      }
    };
    header.insertBefore(b, header.firstChild);
  }
  document.addEventListener('click', function (e) {
    if (!active || !html.classList.contains('admina-ofx-nav-open')) return;
    if (e.target.closest && e.target.closest('.MuiDrawer-docked')) {
      setTimeout(closeNav, 350);
    }
  }, true);

  /* ======================= correction flexbox mobile ======================= */
  function fixMobile() {
    var root = conteneurRacine();
    if (!root) return;
    var n = root;
    while (n && n !== document.body) {
      if (!n.hasAttribute('data-ofx-mw')) {
        n.setAttribute('data-ofx-mw', '1');
        n.classList.add('admina-ofx-mw');
      }
      n = n.parentElement;
    }
  }
  function unfixMobile() {
    $$('[data-ofx-mw]').forEach(function (el) {
      el.classList.remove('admina-ofx-mw');
      el.removeAttribute('data-ofx-mw');
    });
  }

  /* ======================= rafraîchissement global ======================= */
  function refresh() {
    if (!active) return;
    clearTimeout(refreshT);
    refreshT = setTimeout(function () {
      var root = conteneurRacine();
      if (!root) return;
      buildHero(root);
      refreshHero(root);
      buildInsights(root);
      enhanceKpis(root);
      buildToolbar(root);
      enhanceRows();
      refreshBulk();
      if (view === 'cards') refreshCards(root);
      fixBreadcrumb();
      fixMobile();
      buildBurger();
    }, 60);
  }

  /* ======================= activation / désactivation ======================= */
  function activate() {
    if (active) return;
    active = true;
    html.classList.add('admina-offres');
    refresh();
    watchDark();
    chasserPasserelle();
    mo = new MutationObserver(function (muts) {
      /* ignorer nos propres zones (hero/insights/cartes/toasts/menu/bulk) : sinon
         chaque reconstruction relance refresh() → boucle infinie de rebuild (~17/s) */
      for (var mi = 0; mi < muts.length; mi++) {
        var t = muts[mi].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-admina-ofx]')) continue;
        refresh(); return;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  function deactivate() {
    if (!active) return;
    active = false;
    html.classList.remove('admina-offres', 'admina-ofx-cards-on', 'admina-ofx-nav-open');
    window.__ADMINA_OFFRES_PRED__ = null;
    SEL = {};
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(darkT);
    $$('[data-admina-ofx]').forEach(function (el) { el.remove(); });
    unfixMobile();
    var h5n = ancreH5();
    if (h5n && h5n.getAttribute('data-ofx-hide')) {
      h5n.style.display = h5n.getAttribute('data-ofx-old-disp') || '';
      h5n.removeAttribute('data-ofx-hide');
    }
    $$('[data-ofx-crumb]').forEach(function (el) {
      el.textContent = el.getAttribute('data-ofx-old') || el.textContent;
      el.removeAttribute('data-ofx-crumb');
    });
  }
  function tick() {
    clearInterval(tickT);
    tickT = setInterval(function () {
      var on = isOn();
      if (on && !active) activate();
      else if (!on && active) deactivate();
    }, 350);
  }
  function isOn() {
    if (OFFRES_RE.test(location.pathname)) return true;
    var m = (location.hash || '').match(/adem_r=([^&]+)/);
    if (m) { try { return OFFRES_RE.test(decodeURIComponent(m[1])); } catch (e) {} }
    return false;
  }

  /* ======================= 13. passerelle Demandes → Offres ======================= */
  /* Alimenté par admina-demandes.js : localStorage 'admina_offres_bridge_pending'
     = {"offre":{...},"from":"DR-2025-0XX"} → consommé à l'arrivée sur /offres :
     l'offre est créée au statut « À créer », numérotée OF-AAAA-NNN, et la demande
     d'origine est marquée (offreLien + historique) dans le snapshot /demandes. */
  function nextOffreNum() {
    var maxY = 2025, maxN = 0;
    data().forEach(function (x) {
      var m = /OF-(\d{4})-(\d+)/.exec(x.numero || '');
      if (m) { if (+m[1] > maxY) maxY = +m[1]; if (+m[2] > maxN) maxN = +m[2]; }
    });
    return 'OF-' + maxY + '-' + String(maxN + 1).padStart(3, '0');
  }
  function marquerDemandeCote(from, newNum) {
    try {
      var snap = JSON.parse(localStorage.getItem('admina_dm_data_v1') || 'null');
      if (!snap || !snap.items) return;
      var dt = today();
      snap.items.forEach(function (d) {
        if (d.numero === from) {
          d.offreLien = newNum;
          d.historique = (d.historique || []).concat([{ date: dt, evenement: 'Offre ' + newNum + ' créée (passerelle)', auteur: d.responsableDemande || 'Recrutement', type: 'creation' }]);
        }
      });
      snap.savedAt = new Date().toISOString();
      localStorage.setItem('admina_dm_data_v1', JSON.stringify(snap));
    } catch (e) {}
  }
  function consommerPasserelle() {
    var raw = null;
    try { raw = localStorage.getItem('admina_offres_bridge_pending'); } catch (e) {}
    if (!raw) return true;
    var a = api();
    if (!a) return false; /* attendre que le composant Offres expose son API */
    var p = null;
    try { p = JSON.parse(raw); } catch (e) {}
    if (!p || !p.offre) {
      try { localStorage.removeItem('admina_offres_bridge_pending'); } catch (e) {}
      return true;
    }
    /* Le composant Offres peut se remonter juste après le montage (boot SPA) et
       réinitialiser l'état : on crée, on VÉRIFIE la présence réelle, on réessaie.
       Le pending n'est retiré qu'après succès confirmé. */
    var from = p.from || '?';
    var essais = 0;
    (function tenter() {
      essais++;
      var a2 = api(); /* relire à chaque essai : le composant peut se remonter */
      if (!a2) { if (essais < 30 && active) { setTimeout(tenter, 400); } return; }
      var copy = JSON.parse(JSON.stringify(p.offre));
      copy.id = data().reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0) + 1;
      copy.numero = nextOffreNum();
      copy.statutOffre = 'A creer';
      a2.set(function (prev) { return prev.concat([copy]); });
      setTimeout(function () {
        var present = data().some(function (x) { return x.numero === copy.numero; });
        if (!present && essais < 30 && active) { tenter(); return; }
        if (present) {
          try { localStorage.removeItem('admina_offres_bridge_pending'); } catch (e) {}
          jlog('Passerelle DR→Offre', from + ' → ' + copy.numero);
          toast(copy.numero + ' créée depuis ' + from + ' (passerelle)');
          marquerDemandeCote(from, copy.numero);
          refresh();
        }
        /* sinon : pending conservé, retenté à la prochaine activation de /offres */
      }, 350);
    })();
    return true;
  }
  var bridgeT = null;
  function chasserPasserelle() {
    clearInterval(bridgeT);
    var tries = 0;
    bridgeT = setInterval(function () {
      tries++;
      if (consommerPasserelle() || tries > 30) clearInterval(bridgeT);
    }, 400);
  }

  /* ======================= démarrage ======================= */
  if (isOn()) activate();
  tick();
  window.addEventListener('popstate', function () { var on = isOn(); on && !active ? activate() : (!on && active && deactivate()); });
})();
