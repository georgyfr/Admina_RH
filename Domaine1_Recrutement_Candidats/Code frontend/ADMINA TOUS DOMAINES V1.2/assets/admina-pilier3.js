/* ============================================================
   ADMINA-RH — PILIER 3 « Interagir » — Tableau de Bord Domaine 1
   Palette ⌘K · Export multi-format réel · Filtres URL partageables
   Multi-sélection avec actions groupées · Accessibilité clavier
   Dépend de : admina-pilier2.js (classe admina-tdb, drawer) et
   admina-pilier1.js (window.__ADMINA_STORE__ / __ADMINA_AUDIT__).
   Ne touche AUCUNE autre page (tout est sous isTDB()).
   ============================================================ */
(function () {
  'use strict';
  if (window.__ADMINA_P3__) return;
  window.__ADMINA_P3__ = true;

  var html = document.documentElement;
  var TDB_RE = /\/Domaine1_Recrutement_Candidats\/tableau-de-bord\/?$/;
  function isTDB() { return TDB_RE.test(location.pathname); }

  /* ------------------------------------------------------------ utils */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function demandes() {
    var s = window.__ADMINA_STORE__;
    return (s && s.demandes) || [];
  }
  function jlog(action, detail) {
    try {
      var roleEl = $('[aria-label="Vue par rôle"]');
      var role = roleEl ? (roleEl.textContent || '').trim().split('\n')[0] : '-';
      window.__ADMINA_AUDIT__ && window.__ADMINA_AUDIT__.log(action, detail, role);
    } catch (e) { /* journal indisponible */ }
  }

  /* ------------------------------------------------- région aria-live */
  var live = null, liveTimer = null;
  function ensureLive() {
    if (live && live.isConnected) return;
    live = document.createElement('div');
    live.className = 'admina-p3-live';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
  }
  function announce(msg) {
    if (!isTDB()) return;
    ensureLive();
    live.classList.remove('admina-p3-show');
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      live.textContent = msg;
      live.classList.add('admina-p3-show');
      liveTimer = setTimeout(function () { live.classList.remove('admina-p3-show'); }, 3200);
    }, 80);
  }

  /* ================================================ MOTEUR DE FILTRES */
  var FILTERS = {
    periode:     { label: 'Période',     opts: ['mois', 'trimestre', 'annee', 'tout'] },
    departement: { label: 'Département', opts: ['tout', 'Restauration', 'Hébergement', 'Finance', 'Informatique', 'Sécurité', 'Service Client', 'Marketing', 'Logistique', 'Commercial'] },
    site:        { label: 'Site',        opts: ['tout', 'Siège', 'Annexe', 'Hôtel Sawa', 'Campus'] }
  };
  var FILTER_URLKEY = { periode: 'periode', departement: 'dept', site: 'site' };

  function findForm(key) {
    var lbl = FILTERS[key].label;
    return $$('.MuiFormControl-root').filter(function (f) {
      var l = $('.MuiInputLabel-root', f);
      return l && l.textContent.trim() === lbl;
    })[0] || null;
  }
  function getFilter(key) {
    var fc = findForm(key);
    if (!fc) return null;
    var inp = $('input', fc);
    return inp ? inp.value : null;
  }
  function clickOption(value) {
    var lbs = $$('ul[role="listbox"]');
    for (var i = lbs.length - 1; i >= 0; i--) {
      var items = $$('[role="option"]', lbs[i]);
      for (var j = 0; j < items.length; j++) {
        if (items[j].getAttribute('data-value') === value) { items[j].click(); return true; }
      }
    }
    return false;
  }
  function applyFilter(key, value, cb) {
    cb = cb || function () {};
    if (!FILTERS[key] || FILTERS[key].opts.indexOf(value) < 0) { cb(false); return; }
    var tries = 0;
    (function attempt() {
      var fc = findForm(key);
      if (!fc) { if (++tries > 12) { cb(false); return; } setTimeout(attempt, 350); return; }
      var cbx = $('[role="combobox"]', fc);
      if (!cbx) { cb(false); return; }
      cbx.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      setTimeout(function () {
        var ok = clickOption(value);
        if (!ok) { document.body.click(); if (++tries > 4) { cb(false); return; } setTimeout(attempt, 320); return; }
        setTimeout(function () {
          if (getFilter(key) === value) { cb(true); }
          else if (++tries > 4) { cb(false); }
          else { setTimeout(attempt, 320); }
        }, 220);
      }, 260);
    })();
  }

  /* ============================================ FILTRES PARTAGEABLES */
  var urlWriting = false;
  var urlReady = false;          // syncUrl bloqué tant que readUrl n'a pas tourné
  var baseline = {};             // valeurs initiales du site (ex : trimestre/tout/tout)
  function captureBaseline() {
    Object.keys(FILTERS).forEach(function (k) {
      var v = getFilter(k);
      if (v != null && !(k in baseline)) baseline[k] = v;
    });
  }
  function currentQs() {
    var p = new URLSearchParams();
    Object.keys(FILTERS).forEach(function (k) {
      var v = getFilter(k);
      if (v && baseline[k] !== undefined && v !== baseline[k]) p.set(FILTER_URLKEY[k], v);
    });
    return p.toString();
  }
  function syncUrl() {
    if (!isTDB() || urlWriting || !urlReady) return;
    try {
      var qs = currentQs();
      var target = location.pathname + (qs ? '?' + qs : '') + location.hash;
      if (target !== location.pathname + location.search + location.hash) {
        urlWriting = true;
        history.replaceState(null, '', target);
        urlWriting = false;
      }
    } catch (e) { urlWriting = false; }
  }
  function readUrl() {
    if (!isTDB() || urlReady) return;
    var q = new URLSearchParams(location.search);
    var keys = Object.keys(FILTERS);
    var hasParams = keys.some(function (k) { return q.get(FILTER_URLKEY[k]); });
    var applied = [];
    var i = 0;
    (function next() {
      if (i >= keys.length) {
        urlReady = true;
        if (applied.length) {
          announce('Filtres partagés appliqués : ' + applied.join(' · '));
          jlog('Filtres', 'Lien partagé appliqué — ' + applied.join(', '));
        }
        return;
      }
      var k = keys[i++];
      var v = q.get(FILTER_URLKEY[k]);
      if (v && FILTERS[k].opts.indexOf(v) >= 0 && getFilter(k) !== v) {
        applyFilter(k, v, function (ok) { if (ok) applied.push(FILTERS[k].label + ' = ' + v); next(); });
      } else { next(); }
    })();
  }
  setInterval(syncUrl, 900);
  window.addEventListener('popstate', function () { setTimeout(readUrl, 420); });

  /* ============================================== MOTEUR D'EXPORT RÉEL */
  function exportRows() {
    if (selected.size) {
      return demandes().filter(function (d) { return selected.has(d.numero); });
    }
    return demandes();
  }
  function stamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }
  function download(name, mime, content) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 4000);
  }
  function tableMatrix(rows) {
    if (!rows.length) return { head: [], body: [] };
    var head = ['N°', 'Poste', 'Département', 'Site', 'Statut', 'Délai (j)', 'Alerte'];
    var body = rows.map(function (d) {
      return [d.numero, d.poste, d.departement || '', d.site || '-', d.statut,
              d.joursAttente != null ? d.joursAttente : '', d.alerte ? 'oui' : 'non'];
    });
    return { head: head, body: body };
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var EXPORTS = {
    csv: {
      label: 'Fichier CSV', ico: 'CSV', ext: '.csv',
      build: function (rows) {
        var m = tableMatrix(rows);
        var line = function (cells) { return cells.map(function (c) { c = String(c == null ? '' : c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';'); };
        return '\uFEFF' + [line(m.head)].concat(m.body.map(line)).join('\r\n');
      },
      mime: 'text/csv;charset=utf-8'
    },
    xls: {
      label: 'Classeur Excel', ico: 'XLS', ext: '.xls',
      build: function (rows) {
        var m = tableMatrix(rows);
        var t = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body>';
        t += '<table border="1"><tr>' + m.head.map(function (h) { return '<th style="background:#eee">' + esc(h) + '</th>'; }).join('') + '</tr>';
        t += m.body.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('');
        return t + '</table></body></html>';
      },
      mime: 'application/vnd.ms-excel;charset=utf-8'
    },
    json: {
      label: 'Données JSON', ico: '{ }', ext: '.json',
      build: function (rows) {
        return JSON.stringify({
          genere: new Date().toISOString(),
          source: 'Admina-RH — Domaine 1 Recrutement / Tableau de Bord',
          filtres: (function () { var o = {}; Object.keys(FILTERS).forEach(function (k) { o[k] = getFilter(k); }); return o; })(),
          total: rows.length,
          demandes: rows
        }, null, 2);
      },
      mime: 'application/json;charset=utf-8'
    }
  };
  function doExport(kind) {
    var rows = exportRows();
    if (!rows.length) { announce('Aucune donnée à exporter'); return; }
    var e = EXPORTS[kind];
    download('demandes-recrutement-' + stamp() + e.ext, e.mime, e.build(rows));
    jlog('Export', kind.toUpperCase() + ' — ' + rows.length + ' demande(s)' + (selected.size ? ' (sélection)' : ''));
    announce(e.label + ' téléchargé — ' + rows.length + ' demande(s)');
  }
  function doCopy() {
    var rows = exportRows();
    if (!rows.length) { announce('Aucune donnée à copier'); return; }
    var m = tableMatrix(rows);
    var tsv = [m.head.join('\t')].concat(m.body.map(function (r) { return r.join('\t'); })).join('\n');
    (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(tsv) : Promise.reject())
      .then(function () { announce(rows.length + ' demande(s) copiée(s) — prêtes à coller'); jlog('Export', 'Copie presse-papiers — ' + rows.length + ' demande(s)'); })
      .catch(function () {
        var ta = document.createElement('textarea');
        ta.value = tsv; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); announce(rows.length + ' demande(s) copiée(s)'); jlog('Export', 'Copie presse-papiers — ' + rows.length); } catch (e) { announce('Copie impossible dans ce navigateur'); }
        ta.remove();
      });
  }
  function doPrint() {
    var rows = exportRows();
    if (!rows.length) { announce('Aucune donnée à imprimer'); return; }
    var m = tableMatrix(rows);
    var f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f);
    var doc = f.contentDocument || f.contentWindow.document;
    doc.open();
    doc.write('<!doctype html><html lang="fr"><head><meta charset="utf-8" /><title>Demandes de recrutement</title><style>'
      + 'body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111}'
      + 'h1{font-size:17px;margin:0 0 4px} .meta{font-size:11px;color:#555;margin-bottom:14px}'
      + 'table{border-collapse:collapse;width:100%;font-size:11px}'
      + 'th,td{border:1px solid #999;padding:5px 7px;text-align:left;vertical-align:top}'
      + 'th{background:#efeaff} tr:nth-child(even) td{background:#fafafa}'
      + '@page{size:A4 landscape;margin:12mm}</style></head><body>'
      + '<h1>Admina-RH — Demandes de recrutement</h1>'
      + '<div class="meta">Édité le ' + new Date().toLocaleString('fr-FR') + ' — ' + rows.length + ' demande(s)'
      + (selected.size ? ' (sélection)' : '') + '</div>'
      + '<table><thead><tr>' + m.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>'
      + m.body.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('')
      + '</tbody></table></body></html>');
    doc.close();
    setTimeout(function () {
      try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) {}
      setTimeout(function () { f.remove(); }, 3000);
    }, 350);
    jlog('Export', 'Impression / PDF — ' + rows.length + ' demande(s)');
    announce('Boîte d\'impression ouverte — « Enregistrer au format PDF » possible');
  }

  /* ============================================ MENU D'EXPORT (UI) */
  var menu = null, bypassOriginal = false, menuAnchorBtn = null;
  function ensureMenu() {
    if (menu && menu.isConnected) return;
    menu = document.createElement('div');
    menu.className = 'admina-p3-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Choix du format d\'export');
    document.body.appendChild(menu);
    document.addEventListener('click', function (e) {
      if (html.classList.contains('admina-p3-menu-open') && menu && !menu.contains(e.target)) closeMenu();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (!html.classList.contains('admina-p3-menu-open')) return;
      var items = $$('[role="menuitem"]', menu);
      var idx = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); menuAnchorBtn && menuAnchorBtn.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1 + items.length) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Tab') { e.preventDefault(); closeMenu(); }
    }, true);
  }
  function closeMenu() { html.classList.remove('admina-p3-menu-open'); }
  function openExportMenu(anchor, titleOverride) {
    if (!isTDB()) return;
    ensureMenu();
    menuAnchorBtn = anchor;
    var rows = exportRows();
    var title = titleOverride || ('Exporter ' + rows.length + ' demande(s)');
    var csvItem = '<button role="menuitem" data-x="csv-original"><span class="admina-p3-mico">CSV</span>'
      + '<span>Format CSV (natif)<br /><small style="opacity:.65">téléchargement standard</small></span></button>';
    var other = [
      '<button role="menuitem" data-x="xls"><span class="admina-p3-mico">XLS</span><span>Classeur Excel<br /><small style="opacity:.65">ouvre dans Excel / Calc</small></span></button>',
      '<button role="menuitem" data-x="json"><span class="admina-p3-mico">{ }</span><span>Données JSON<br /><small style="opacity:.65">filtres inclus, intégration API</small></span></button>',
      '<button role="menuitem" data-x="copy"><span class="admina-p3-mico">CTR</span><span>Copier dans le presse-papiers<br /><small style="opacity:.65">collable dans Excel / mail</small></span></button>',
      '<button role="menuitem" data-x="print"><span class="admina-p3-mico">PDF</span><span>Imprimer / Enregistrer en PDF<br /><small style="opacity:.65">mise en page A4 paysage</small></span></button>'
    ].join('');
    menu.innerHTML = '<div class="admina-p3-mtitle">' + title + '</div>' + csvItem + other;
    var r = anchor.getBoundingClientRect();
    menu.style.visibility = 'hidden';
    html.classList.add('admina-p3-menu-open');
    setTimeout(function () {
      var mw = menu.offsetWidth, mh = menu.offsetHeight;
      var left = Math.min(Math.max(8, r.right - mw), window.innerWidth - mw - 8);
      var top;
      if (r.top < 0 || r.bottom > window.innerHeight || (r.bottom + 6 + mh > window.innerHeight && r.top - mh - 6 < 0)) {
        top = Math.max(8, Math.round((window.innerHeight - mh) / 3));
      } else if (r.bottom + 6 + mh > window.innerHeight) {
        top = Math.max(8, r.top - mh - 6);
      } else {
        top = r.bottom + 6;
      }
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      menu.style.visibility = 'visible';
      var first = $('[role="menuitem"]', menu);
      first && first.focus();
    }, 0);
    $$('[role="menuitem"]', menu).forEach(function (b) {
      b.onclick = function () {
        var x = b.getAttribute('data-x');
        closeMenu();
        if (x === 'csv-original' && menuAnchorBtn) {
          bypassOriginal = true;
          menuAnchorBtn.click();
          setTimeout(function () { bypassOriginal = false; }, 80);
        }
        else if (x === 'copy') doCopy();
        else if (x === 'print') doPrint();
        else doExport(x);
      };
    });
  }
  /* interception du bouton « Export » du tableau de bord (PAS l'icône topbar) */
  document.addEventListener('click', function (e) {
    if (!isTDB() || bypassOriginal) return;
    var btn = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!btn || (btn.textContent || '').trim() !== 'Export') return;
    if (btn.getAttribute('aria-label') === 'Exporter') return;   // icône topbar hors périmètre
    if (btn.closest('.MuiToolbar-root')) return;                 // topbar
    e.preventDefault(); e.stopPropagation();
    openExportMenu(btn);
  }, true);

  /* ================================================== MULTI-SÉLECTION */
  var selected = new Set();
  function demandesTable() {
    return $$('table').filter(function (t) { return /DR-2025-/.test(t.textContent || ''); })[0] || null;
  }
  function ensureCheckboxes() {
    if (!isTDB()) return;
    var t = demandesTable();
    if (!t || !t.tHead || !t.tBodies.length) return;
    var hr = t.tHead.rows[0];
    if (!hr || !hr.cells.length) return;
    if (!hr.cells[0].classList.contains('admina-sel-col')) {
      var th = document.createElement('th');
      th.className = 'admina-sel-col';
      th.setAttribute('aria-label', 'Sélection');
      var all = document.createElement('input');
      all.type = 'checkbox';
      all.className = 'admina-sel-box';
      all.setAttribute('aria-label', 'Tout sélectionner');
      all.addEventListener('change', function () {
        var t2 = demandesTable(); if (!t2) return;
        if (all.checked) {
          $$('tbody tr', t2).forEach(function (r) {
            var m = (r.textContent || '').match(/DR-2025-\d+/);
            if (m) selected.add(m[0]);
          });
          announce(selected.size + ' demande(s) sélectionnée(s)');
        } else {
          selected.clear();
          announce('Sélection effacée');
        }
        refreshChecks();
      });
      th.appendChild(all);
      hr.insertBefore(th, hr.cells[0]);
    }
    var allBox = $('input.admina-sel-box', hr);
    var changed = false;
    $$('tbody tr', t).forEach(function (r) {
      var c0 = r.cells[0];
      if (c0 && c0.classList.contains('admina-sel-col')) {
        var box = $('input', c0);
        var m = (r.textContent || '').match(/DR-2025-\d+/);
        if (box && m) {
          var want = selected.has(m[0]);
          if (box.checked !== want) { box.checked = want; changed = true; }
        }
        return;
      }
      var m2 = (r.textContent || '').match(/DR-2025-\d+/);
      if (!m2) return;
      var td = document.createElement('td');
      td.className = 'admina-sel-col';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'admina-sel-box';
      cb.setAttribute('aria-label', 'Sélectionner ' + m2[0]);
      cb.checked = selected.has(m2[0]);
      cb.addEventListener('change', function () {
        if (cb.checked) selected.add(m2[0]); else selected.delete(m2[0]);
        if (cb.checked && selected.size === 1) announce('1 demande sélectionnée — actions groupées disponibles en bas');
        refreshBar();
      });
      td.appendChild(cb);
      r.insertBefore(td, r.cells[0]);
      changed = true;
    });
    if (allBox) {
      var total = $$('tbody tr', t).length;
      var selInPage = 0;
      $$('tbody tr', t).forEach(function (r) {
        var m = (r.textContent || '').match(/DR-2025-\d+/);
        if (m && selected.has(m[0])) selInPage++;
      });
      allBox.checked = total > 0 && selInPage === total;
      allBox.indeterminate = selInPage > 0 && selInPage < total;
      allBox.setAttribute('aria-label', selInPage ? 'Tout sélectionner (' + selInPage + ' sur ' + total + ' déjà cochées)' : 'Tout sélectionner');
    }
    if (changed) refreshBar();
  }
  function refreshChecks() {
    var t = demandesTable(); if (!t) return;
    $$('tbody tr', t).forEach(function (r) {
      var m = (r.textContent || '').match(/DR-2025-\d+/);
      var box = r.cells[0] && r.cells[0].classList.contains('admina-sel-col') ? $('input', r.cells[0]) : null;
      if (m && box) box.checked = selected.has(m[0]);
    });
    refreshBar();
  }
  function bulkAct(kind) {
    var nums = Array.from(selected);
    var done = 0, i = 0;
    announce(kind === 'valider' ? 'Validation de ' + nums.length + ' demande(s)…' : 'Relance de ' + nums.length + ' manager(s)…');
    (function step() {
      if (i >= nums.length) {
        announce('Terminé : ' + done + '/' + nums.length + ' ' + (kind === 'valider' ? 'demande(s) validée(s)' : 'rappel(s) envoyé(s)'));
        jlog(kind === 'valider' ? 'Validation groupée' : 'Relance groupée', done + '/' + nums.length + ' demande(s)');
        selected.clear(); refreshChecks();
        return;
      }
      var num = nums[i++];
      var t = demandesTable();
      var row = t && $$('tbody tr', t).filter(function (r) { return (r.textContent || '').indexOf(num) >= 0; })[0];
      var btn = row && $$('button', row).filter(function (b) {
        var a = b.getAttribute('aria-label') || '';
        return kind === 'valider' ? a === 'Valider' : a.indexOf('Rappeler') === 0;
      })[0];
      if (btn) { btn.click(); done++; }
      setTimeout(step, 260);
    })();
  }
  function refreshBar() {
    var bar = $('.admina-p3-bar');
    if (!bar) return;
    var n = selected.size;
    html.classList.toggle('admina-p3-sel', n > 0);
    var c = $('.admina-p3-count', bar);
    if (c) c.textContent = n + ' demande' + (n > 1 ? 's' : '') + ' sélectionnée' + (n > 1 ? 's' : '');
    var bv = $('.admina-p3-bval', bar);
    if (bv) bv.disabled = !n;
    var br = $('.admina-p3-brap', bar);
    if (br) br.disabled = !n;
    var be = $('.admina-p3-bexp', bar);
    if (be) be.disabled = !n;
  }
  function ensureBar() {
    if ($('.admina-p3-bar') || !isTDB()) return;
    var bar = document.createElement('div');
    bar.className = 'admina-p3-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Actions sur la sélection');
    bar.innerHTML = '<span class="admina-p3-count" aria-live="polite">0 demande sélectionnée</span>'
      + '<button type="button" class="admina-p3-ok admina-p3-bval">Valider la sélection</button>'
      + '<button type="button" class="admina-p3-warn admina-p3-brap">Rappeler les managers</button>'
      + '<button type="button" class="admina-p3-bexp">Exporter la sélection</button>'
      + '<button type="button" class="admina-p3-x" aria-label="Effacer la sélection">✕</button>';
    document.body.appendChild(bar);
    $('.admina-p3-bval', bar).addEventListener('click', function () { bulkAct('valider'); });
    $('.admina-p3-brap', bar).addEventListener('click', function () { bulkAct('rappeler'); });
    $('.admina-p3-bexp', bar).addEventListener('click', function (e) { openExportMenu(e.currentTarget, 'Exporter la sélection'); });
    $('.admina-p3-x', bar).addEventListener('click', function () { selected.clear(); refreshChecks(); announce('Sélection effacée'); });
  }

  /* ===================================================== PALETTE ⌘K */
  var pal = null, palInput = null, palList = null, palCmds = [], palActive = 0, palLastFocus = null;
  function openDetail(numero) {
    var t = demandesTable();
    var row = t && $$('tbody tr', t).filter(function (r) { return (r.textContent || '').indexOf(numero) >= 0; })[0];
    var btn = row && $('button[aria-label="Voir la demande"]', row);
    if (btn) { btn.click(); announce('Détail ' + numero + ' ouvert'); return true; }
    announce('Demande ' + numero + ' introuvable dans la vue actuelle');
    return false;
  }
  function rowAction(numero, kind) {
    var t = demandesTable();
    var row = t && $$('tbody tr', t).filter(function (r) { return (r.textContent || '').indexOf(numero) >= 0; })[0];
    var btn = row && $$('button', row).filter(function (b) {
      var a = b.getAttribute('aria-label') || '';
      return kind === 'valider' ? a === 'Valider' : a.indexOf('Rappeler') === 0;
    })[0];
    if (btn) { btn.click(); announce(kind === 'valider' ? 'Validation de ' + numero : 'Rappel envoyé pour ' + numero); }
    else announce('Action indisponible pour ' + numero);
  }
  function setRole(label) {
    var trig = $('[aria-label="Vue par rôle"]');
    if (!trig) { announce('Sélecteur de rôle introuvable'); return; }
    trig.click();
    var tries = 0;
    (function attempt() {
      var opts = $$('.MuiPopover-root div[role="button"], .MuiMenu-root div[role="button"]')
        .filter(function (o) {
          var t = (o.textContent || '').replace(/\s+/g, ' ').trim();
          return t === label || t.indexOf(label) === 0;
        });
      if (opts.length) {
        opts[0].click();
        announce('Vue par rôle : ' + label);
        jlog('Vue rôle', label);
      } else if (++tries < 8) {
        setTimeout(attempt, 280);
      } else {
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        announce('Rôle « ' + label + ' » introuvable');
      }
    })();
  }
  function toggleDark() {
    var b = $$('button').filter(function (x) { return /Mode (sombre|clair)/i.test(x.getAttribute('aria-label') || ''); })[0];
    if (b) { b.click(); announce(b.getAttribute('aria-label') === 'Mode sombre' ? 'Mode sombre activé' : 'Mode clair activé'); }
  }
  function shareLink() {
    syncUrl();
    var url = location.origin + location.pathname + location.search;
    (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject())
      .then(function () { announce('Lien copié — filtres inclus : ' + (location.search || '(aucun filtre)')); jlog('Partage', 'Lien avec filtres copié'); })
      .catch(function () {
        var ta = document.createElement('textarea');
        ta.value = url; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); announce('Lien copié (filtres inclus)'); jlog('Partage', 'Lien avec filtres copié'); } catch (e) { announce('Copie impossible'); }
        ta.remove();
      });
  }
  function buildCommands() {
    var cmds = [];
    /* Navigation — depuis la sidebar réelle (robuste aux changements) */
    $$('.MuiDrawer-docked .MuiListItemButton-root, .MuiDrawer-docked button, .MuiDrawer-docked a').forEach(function (b) {
      if (/cdn-item/.test((b.className || '') + '')) return; // sélecteur multi-domaines : traité à part
      var nested = $$('button, a, .MuiListItemButton-root', b);
      var sources = nested.length > 1 ? nested : [b];
      sources.forEach(function (src) {
        var t = (src.textContent || '').replace(/\s+/g, ' ').trim();
        if (t && t.length > 1 && t.length < 42 && !/Rôle|compte|Déconnexion/i.test(t)
            && !cmds.some(function (c) { return c.label === t; })) {
          cmds.push({ cat: 'Aller à', ico: '→', label: t, kw: 'navigation page aller ' + t.toLowerCase(), run: function () { src.click(); announce('Page : ' + t); } });
        }
      });
    });
    cmds.push({ cat: 'Aller à', ico: '⌂', label: 'Tous les domaines (accueil Admina-RH)', kw: 'hub accueil domaines sortir', run: function () { location.href = '/'; } });
    /* Demandes — ouvrir le détail */
    demandes().forEach(function (d) {
      cmds.push({
        cat: 'Demandes', ico: '#',
        label: 'Ouvrir ' + d.numero + ' — ' + d.poste, hint: d.statut,
        kw: 'détail drawer voir demande ' + (d.departement || ''),
        run: function () { openDetail(d.numero); }
      });
    });
    /* Actions */
    demandes().forEach(function (d) {
      if (d.statut === 'En attente') {
        cmds.push({
          cat: 'Actions', ico: '✓',
          label: 'Valider ' + d.numero + ' — ' + d.poste, hint: d.departement || '',
          kw: 'valider demande attente décision',
          run: function () { rowAction(d.numero, 'valider'); }
        });
      }
      if (d.alerte) {
        cmds.push({
          cat: 'Actions', ico: '!',
          label: 'Rappeler le manager — ' + d.numero, hint: d.manager || '',
          kw: 'rappel relance manager retard',
          run: function () { rowAction(d.numero, 'rappeler'); }
        });
      }
    });
    var rel = $$('button').filter(function (b) { return /^Relance globale/.test((b.textContent || '').trim()); })[0];
    if (rel) cmds.push({
      cat: 'Actions', ico: '!',
      label: 'Relance globale des managers', hint: (rel.textContent.match(/\((\d+)\)/) || [])[1] ? '3 en retard' : '',
      kw: 'relance globale tous managers',
      run: function () { rel.click(); announce('Relance globale envoyée'); }
    });
    cmds.push({ cat: 'Actions', ico: '◐', label: 'Basculer mode sombre / clair', kw: 'thème sombre clair apparence', run: toggleDark });
    ['Recruteur', 'Manager RH', 'DRH'].forEach(function (r) {
      cmds.push({ cat: 'Actions', ico: '◉', label: 'Vue par rôle : ' + r, kw: 'vue profil ' + r.toLowerCase(), run: function () { setRole(r); } });
    });
    cmds.push({ cat: 'Actions', ico: '⇗', label: 'Copier le lien partageable (filtres inclus)', kw: 'partager url lien copier', run: shareLink });
    /* Filtres */
    Object.keys(FILTERS).forEach(function (k) {
      var optsLabels = { periode: { mois: 'Ce mois', trimestre: 'Ce trimestre', annee: 'Cette année', tout: 'Tout' } };
      FILTERS[k].opts.forEach(function (v) {
        var lab = (optsLabels[k] && optsLabels[k][v]) || v;
        cmds.push({
          cat: 'Filtres', ico: '≡',
          label: FILTERS[k].label + ' : ' + lab,
          hint: getFilter(k) === v ? 'actif' : '',
          kw: 'filtre ' + FILTERS[k].label + ' ' + v,
          run: function () {
            applyFilter(k, v, function (ok) {
              announce(ok ? 'Filtre appliqué — ' + FILTERS[k].label + ' = ' + lab : 'Filtre non appliqué');
              if (ok) jlog('Filtre', FILTERS[k].label + ' = ' + v);
            });
          }
        });
      });
    });
    /* Exports */
    cmds.push({ cat: 'Exporter', ico: 'CSV', label: 'Exporter en CSV' + (selected.size ? ' (sélection : ' + selected.size + ')' : ''), kw: 'export csv fichier', run: function () { var b = headerExportBtn(); if (b && !selected.size) { bypassOriginal = true; b.click(); setTimeout(function () { bypassOriginal = false; }, 80); } else doExport('csv'); } });
    cmds.push({ cat: 'Exporter', ico: 'XLS', label: 'Exporter en Excel' + (selected.size ? ' (sélection)' : ''), kw: 'export excel xls classeur', run: function () { doExport('xls'); } });
    cmds.push({ cat: 'Exporter', ico: '{ }', label: 'Exporter en JSON' + (selected.size ? ' (sélection)' : ''), kw: 'export json données api', run: function () { doExport('json'); } });
    cmds.push({ cat: 'Exporter', ico: 'CTR', label: 'Copier les données (presse-papiers)', kw: 'copier presse-papiers coller', run: doCopy });
    cmds.push({ cat: 'Exporter', ico: 'PDF', label: 'Imprimer / Enregistrer en PDF', kw: 'imprimer pdf impression', run: doPrint });
    return cmds;
  }
  function headerExportBtn() {
    return $$('button').filter(function (b) {
      return (b.textContent || '').trim() === 'Export' && !b.closest('.MuiToolbar-root');
    })[0] || null;
  }
  function ensurePalette() {
    if (pal && pal.isConnected) return;
    pal = document.createElement('div');
    pal.className = 'admina-p3-backdrop';
    pal.innerHTML = '<div class="admina-p3-panel" role="dialog" aria-modal="true" aria-label="Palette de commandes">'
      + '<div class="admina-p3-inputrow">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>'
      + '<input class="admina-p3-input" type="text" role="combobox" aria-expanded="true" aria-controls="admina-p3-listbox" aria-autocomplete="list" placeholder="Rechercher une page, une demande, une action…" aria-label="Rechercher une commande" />'
      + '<span class="admina-p3-esc">esc</span>'
      + '</div>'
      + '<ul class="admina-p3-list" id="admina-p3-listbox" role="listbox" aria-label="Commandes"></ul>'
      + '<div class="admina-p3-foot"><span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span><span><kbd>↵</kbd> exécuter</span><span><kbd>esc</kbd> fermer</span></div>'
      + '</div>';
    document.body.appendChild(pal);
    palInput = $('.admina-p3-input', pal);
    palList = $('.admina-p3-list', pal);
    pal.addEventListener('mousedown', function (e) { if (e.target === pal) paletteClose(); });
    palInput.addEventListener('input', function () { renderPal(palInput.value); });
    palInput.addEventListener('keydown', function (e) {
      var opts = $$('.admina-p3-item', palList);
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(palActive + 1, opts); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(palActive - 1, opts); }
      else if (e.key === 'Enter') { e.preventDefault(); var el = opts[palActive]; if (el) runCmd(el); }
      else if (e.key === 'Escape') { e.preventDefault(); paletteClose(); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
  }
  function setActive(i, opts) {
    opts = opts && opts.length ? opts : $$('.admina-p3-item', palList);
    if (!opts.length) return;
    palActive = (i + opts.length) % opts.length;
    opts.forEach(function (o, k) {
      var on = k === palActive;
      o.classList.toggle('admina-p3-active', on);
      o.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) {
        o.scrollIntoView({ block: 'nearest' });
        palInput.setAttribute('aria-activedescendant', o.id);
      }
    });
  }
  function runCmd(el) {
    var cmd = palCmds[parseInt(el.getAttribute('data-i'), 10)];
    paletteClose();
    if (cmd) setTimeout(function () { cmd.run(); }, 60);
  }
  function renderPal(query) {
    var q = norm(query).split(/\s+/).filter(Boolean);
    palCmds = buildCommands();
    var scored = palCmds.map(function (c, i) {
      var hay = norm(c.cat + ' ' + c.label + ' ' + (c.kw || ''));
      var ok = q.every(function (t) { return hay.indexOf(t) >= 0; });
      return { c: c, i: i, ok: ok, score: ok && norm(c.label).indexOf(q.join(' ')) === 0 ? 0 : 1 };
    }).filter(function (x) { return x.ok; });
    scored.sort(function (a, b) { return a.score - b.score; });
    var htmlBuf = '', lastCat = null, idx = 0, flat = [];
    scored.forEach(function (x) {
      if (x.c.cat !== lastCat) {
        htmlBuf += '<li class="admina-p3-cat" aria-hidden="true">' + x.c.cat + '</li>';
        lastCat = x.c.cat;
      }
      htmlBuf += '<li class="admina-p3-item" role="option" id="p3-opt-' + idx + '" data-i="' + x.i + '" aria-selected="false">'
        + '<span class="admina-p3-ico" aria-hidden="true">' + x.c.ico + '</span>'
        + '<span class="admina-p3-lbl">' + x.c.label + '</span>'
        + (x.c.hint ? '<span class="admina-p3-hint">' + x.c.hint + '</span>' : '')
        + '</li>';
      flat.push(idx);
      idx++;
    });
    palList.innerHTML = htmlBuf || '<li class="admina-p3-empty">Aucune commande — essayez « DR-2025 », « valider », « export »…</li>';
    $$('.admina-p3-item', palList).forEach(function (el) {
      el.addEventListener('click', function () { runCmd(el); });
      el.addEventListener('mousemove', function () { setActive(flat.indexOf(parseInt(el.getAttribute('data-id') || el.getAttribute('data-i'), 10))); });
    });
    palActive = 0;
    setActive(0);
  }
  function paletteToggle() {
    if (html.classList.contains('admina-p3-open-pal')) paletteClose();
    else paletteOpen();
  }
  function paletteOpen() {
    if (!isTDB()) return;
    if (html.classList.contains('admina-drawer-open')) return; // le drawer a la priorité
    ensurePalette();
    palLastFocus = document.activeElement;
    html.classList.add('admina-p3-open-pal');
    palInput.value = '';
    renderPal('');
    setTimeout(function () { palInput.focus(); }, 30);
  }
  function paletteClose() {
    html.classList.remove('admina-p3-open-pal');
    if (palLastFocus && palLastFocus.focus) { try { palLastFocus.focus(); } catch (e) {} }
    palLastFocus = null;
  }
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') {
      e.preventDefault(); e.stopPropagation();
      paletteToggle();
      return;
    }
    if (e.key === 'Escape' && html.classList.contains('admina-p3-open-pal') && !html.classList.contains('admina-drawer-open')) {
      paletteClose();
    }
  }, true);

  /* bouton visible « Rechercher… ⌘K » près de Filtres / Export */
  function ensurePaletteBtn() {
    if (!isTDB()) return;
    if ($('.admina-p3-open')) return;
    var anchor = headerExportBtn();
    if (!anchor) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'admina-p3-open';
    b.setAttribute('aria-label', 'Ouvrir la palette de commandes (Ctrl+K)');
    b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>'
      + '<span class="admina-p3-openword">Rechercher…</span><kbd>Ctrl K</kbd>';
    b.addEventListener('click', paletteToggle);
    anchor.parentElement.insertBefore(b, anchor);
  }

  /* =================================================== ACCESSIBILITÉ */
  function ensureSkip() {
    if (!$('.admina-p3-skip')) {
      var a = document.createElement('a');
      a.className = 'admina-p3-skip';
      a.href = '#admina-main';
      a.textContent = 'Aller au contenu principal';
      a.addEventListener('click', function (e) {
        var t = contentCol();
        if (t) { e.preventDefault(); t.setAttribute('tabindex', '-1'); t.focus(); t.scrollIntoView({ block: 'start' }); }
      });
      document.body.insertBefore(a, document.body.firstChild);
    }
    var col = contentCol();
    if (col && col.id !== 'admina-main') { col.id = 'admina-main'; }
  }
  function contentCol() {
    var tb = $('.MuiToolbar-root');
    if (!tb) return null;
    var n = tb;
    while (n && n.parentElement) {
      var sibs = Array.prototype.slice.call(n.parentElement.children).filter(function (c) { return c !== n; });
      for (var i = 0; i < sibs.length; i++) {
        if (/MuiDrawer/.test((sibs[i].className || '') + '')) return n;
      }
      n = n.parentElement;
    }
    return null;
  }
  function enhanceKPIs() {
    if (!isTDB()) return;
    $$('.MuiPaper-root').forEach(function (p) {
      if (p.dataset.adminaP3) return;
      var txt = (p.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt || txt.length > 160) return;
      if (getComputedStyle(p).cursor !== 'pointer') return;
      var firstLine = txt.split(/\s{2,}|\s\+/)[0].slice(0, 60);
      p.dataset.adminaP3 = '1';
      p.setAttribute('role', 'button');
      p.setAttribute('tabindex', '0');
      p.setAttribute('aria-label', firstLine + ' — appuyer sur Entrée pour explorer');
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); }
      });
    });
  }
  function enhanceCharts() {
    if (!isTDB()) return;
    $$('.recharts-responsive-container').forEach(function (c) {
      if (c.dataset.adminaP3) return;
      c.dataset.adminaP3 = '1';
      var card = c.closest('.MuiPaper-root');
      var title = card ? ((card.textContent || '').replace(/\s+/g, ' ').trim().split(/\s{2,}/)[0] || 'graphique') : 'graphique';
      c.setAttribute('role', 'img');
      c.setAttribute('aria-label', 'Graphique — ' + title.slice(0, 80));
    });
  }
  function enhanceTable() {
    if (!isTDB()) return;
    var t = demandesTable();
    if (!t || t.dataset.adminaP3) return;
    t.dataset.adminaP3 = '1';
    t.setAttribute('aria-label', 'Tableau des demandes de recrutement');
    if (!t.caption) {
      var cap = document.createElement('caption');
      cap.className = 'admina-sr-only';
      cap.textContent = 'Liste des demandes de recrutement : numéro, poste, statut et actions. Utilisez les cases à cocher pour des actions groupées.';
      t.insertBefore(cap, t.tHead);
    }
    $$('thead th', t).forEach(function (th) { th.setAttribute('scope', 'col'); });
  }

  /* ======================================== OBSERVATEUR DE RENDU (MO) */
  var moTimer = null;
  function ensureAll() {
    if (!isTDB()) return;
    ensureLive();
    ensureBar();
    ensurePaletteBtn();
    ensureCheckboxes();
    ensureSkip();
    enhanceKPIs();
    enhanceCharts();
    enhanceTable();
    syncUrl();
  }
  var mo = new MutationObserver(function () {
    if (moTimer) return;
    moTimer = setTimeout(function () { moTimer = null; ensureAll(); }, 140);
  });
  function start() {
    ensureAll();
    /* readUrl DOIT préciser syncUrl : on attend les formulaires, on applique,
       puis on autorise la synchronisation */
    var tries = 0;
    (function waitForms() {
      captureBaseline();
      if (Object.keys(baseline).length >= 3 || ++tries > 20) {
        readUrl();
        setTimeout(function () { urlReady = true; syncUrl(); }, 400);
      } else {
        setTimeout(waitForms, 300);
      }
    })();
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
