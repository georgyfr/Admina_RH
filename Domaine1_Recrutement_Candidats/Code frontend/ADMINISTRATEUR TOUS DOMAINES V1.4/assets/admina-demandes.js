/* ============================================================
   ADMINA-RH — Demandes de Recrutement (Domaine 1, route /demandes)
   Couche M14 — corrige les 5 faiblesses + lot 1 :
     1. PERSISTANCE  : snapshot localStorage restauré dans le chunk natif
                       (statuts, notes, nouvelles demandes) + pont ADEM_V1.
                       (Les brouillons du formulaire sont déjà persistés par ADEM_V8.)
     2. KANBAN       : le glisser-déposer natif (react-beautiful-dnd) fonctionne ;
                       on ajoute une aide visible au-dessus du board.
     3. TRI          : en-têtes cliquables (asc/desc/rien) sur les colonnes
                       natives + colonne « Délai » d'ADEM_V9 — tri au niveau données.
     4. PASSERELLE   : bouton « Créer l'offre » dans le drawer (statut Validée /
                       En cours) → crée l'offre côté /offres (consommateur dans
                       admina-offres.js) et marque la demande (offreLien).
     5. EXPORT       : menu Excel (.xls) / JSON / Copier / Imprimer-PDF,
                       respectant la vue filtrée ADEM_V2.
   Lot 1 — ANALYSE INTELLIGENTE : panneau d'aide à la décision
   (délais ISO 45 j, relances, demandes validées sans offre, charge par départ).
   Lot 2 — MULTI-SÉLECTION (cases + barre d'actions groupées), FAVORIS (étoiles,
   filtre, persistance), IMPORT (JSON/CSV avec numérotation anti-collision),
   RACCOURCIS clavier (/ Ctrl+K N A E I F 1 2 ? Échap) + panneau d'aide.
   Lot 3 — ÉCHÉANCIER/RELANCES (panneau groupé par mois de « Date Besoin »,
   badges retard/imminent, bouton Relancer + compteur persisté dans le
   snapshot), CIBLE ISO CONFIGURABLE (admina_dm_cfg : cible/vigilance/relance
   — propagée à l'analyse, à l'échéancier et à la bannière ADEM_V9 du shell
   via CFGV9), HARMONISATION DESIGN /OFFRES (héro dégradé vert + 4 stats
   vivantes, h5 natif masqué), JOURNAL D'ACTIVITÉ (admina_journal via
   __ADMINA_AUDIT__, recherche, export JSON), raccourcis C (échéancier)
   et J (journal).
   Dépend de : window.__ADMINA_DEMANDES_API__ (patch du chunk Demandes)
               window.__ADEM_V1__._setRuntime (patch shell D1)
               window.__ADMINA_AUDIT__ (journal, présent sur le SPA D1)
   Tout est scopé : html.admina-dmx + éléments [data-dmx].
   ============================================================ */
(function () {
  'use strict';
  if (window.__ADMINA_DM_M14__) return;
  window.__ADMINA_DM_M14__ = true;

  /* ======================= état global ======================= */
  var html = document.documentElement;
  var DM_RE = /\/Domaine1_Recrutement_Candidats\/demandes\/?$/;
  var active = false, mo = null, tickT = 0, refreshT = 0, pollT = 0;
  var restored = false, defHash0 = null, defaultSig = null, lastSig = null, baseOrder = null, sort = null;
  var lastRestoreInfo = null;
  var LS_DATA = 'admina_dm_data_v1';
  var LS_SORT = 'admina_dm_sort';
  var LS_BRIDGE = 'admina_offres_bridge_pending';
  var LS_FAVS = 'admina_dm_favs';
  var LS_FAVONLY = 'admina_dm_favonly';
  var LS_CFG = 'admina_dm_cfg';
  var favOnly = false;
  var CFG = { iso: 45, vig: 30, rel: 14 };   /* cible ISO configurable (lot 3) */
  var ECH_FILTRE = '';                       /* filtre courant du panneau échéancier */
  var JQ = '';                               /* recherche courante du journal */
  function lireCfg() {
    try {
      var c = JSON.parse(localStorage.getItem(LS_CFG) || 'null') || {};
      CFG.iso = Math.max(5, Math.min(365, parseInt(c.iso, 10) || 45));
      CFG.vig = Math.max(1, Math.min(364, parseInt(c.vig, 10) || 30));
      CFG.rel = Math.max(1, Math.min(180, parseInt(c.rel, 10) || 14));
    } catch (e) {}
    if (CFG.vig >= CFG.iso) CFG.vig = CFG.iso - 1;
    return CFG;
  }
  lireCfg();
  var SEL = {};
  try { favOnly = localStorage.getItem(LS_FAVONLY) === '1'; } catch (e) {}
  var ST_ACTIFS = ['En attente', 'Validée', 'En cours'];
  var PRIO_RANK = { 'Urgente': 0, 'Haute': 1, 'Moyenne': 2, 'Basse': 3 };
  var STATUT_RANK = { 'Validée': 0, 'En attente': 1, 'En cours': 2, 'Pourvue': 3, 'Annulee': 4, 'Annulée': 4, 'Clôturée': 5 };
  var SORTS = {
    'N°': { k: 'numero', t: 'txt' },
    'Date': { k: 'dateDemande', t: 'date' },
    'Département': { k: 'departement', t: 'txt' },
    'Poste': { k: 'posteRecherche', t: 'txt' },
    'Priorité': { k: 'priorite', t: 'prio' },
    'Statut': { k: 'statut', t: 'statut' },
    'Responsable': { k: 'responsableDemande', t: 'txt' },
    'Délai': { k: 'delai', t: 'num' }
  };
  var DM_COLS = [['numero', 'N°'], ['dateDemande', 'Date'], ['departement', 'Département'], ['posteRecherche', 'Poste'],
    ['typePoste', 'Type Poste'], ['typeContrat', 'Type Contrat'], ['effectif', 'Effectif'], ['motif', 'Motif'],
    ['dateBesoin', 'Date Besoin'], ['priorite', 'Priorité'], ['statut', 'Statut'], ['datePourvue', 'Date Pourvue'],
    ['responsableDemande', 'Responsable'], ['roleResponsable', 'Rôle'], ['cabinetAgence', 'Cabinet'],
    ['budgetSalaire', 'Budget Salaire'], ['coutRecrutement', 'Coût Recrutement'], ['delai', 'Délai (j)'],
    ['site', 'Site'], ['notes', 'Notes']];
  try { sort = JSON.parse(localStorage.getItem(LS_SORT) || 'null'); } catch (e) { sort = null; }
  if (!sort || !sort.k) sort = null;

  /* ======================= utilitaires ======================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function api() { return window.__ADMINA_DEMANDES_API__ || null; }
  function data() { var a = api(); return (a && a.data) || []; }
  function jlog(action, detail) {
    try { window.__ADMINA_AUDIT__ && window.__ADMINA_AUDIT__.log(action, detail, 'Recruteur'); } catch (e) {}
  }
  function pd(s) { /* "20/01/2025" -> Date|null */
    if (!s) return null;
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s).trim());
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }
  function today() { return new Date().toLocaleDateString('fr-FR'); }
  function ageJours(d) {
    var p = pd(d && d.dateDemande);
    if (!p) return null;
    return Math.floor((new Date().setHours(0, 0, 0, 0) - p.getTime()) / 86400000);
  }
  function actifItem(d) { return ST_ACTIFS.indexOf(d.statut) >= 0; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function byNumero(n) {
    var d = data();
    for (var i = 0; i < d.length; i++) if (d[i].numero === n) return d[i];
    return null;
  }
  function v1() { return window.__ADEM_V1__ || null; }
  function v2() { return window.__ADEM_V2__ || null; }
  function labStatut(s) { return s === 'Annulee' ? 'Annulée' : s; }

  /* ======================= toasts ======================= */
  function toastsZone() {
    var z = $('.dmx-toasts');
    if (!z) {
      z = document.createElement('div');
      z.className = 'dmx-toasts';
      z.setAttribute('data-dmx', 'toasts');
      var live = document.createElement('div');
      live.className = 'dmx-live';
      live.setAttribute('aria-live', 'polite');
      z.appendChild(live);
      document.body.appendChild(z);
    }
    return z;
  }
  function toast(msg, tone) {
    var z = toastsZone();
    var t = document.createElement('div');
    t.className = 'dmx-toast';
    t.setAttribute('data-tone', tone || 'ok');
    t.setAttribute('data-dmx', 'toast');
    var s = document.createElement('span');
    s.textContent = msg;
    var x = document.createElement('button');
    x.textContent = '\u00d7';
    x.setAttribute('aria-label', 'Fermer la notification');
    x.onclick = function () { t.remove(); };
    t.appendChild(s); t.appendChild(x);
    z.appendChild(t);
    var live = $('.dmx-live', z);
    if (live) live.textContent = msg;
    setTimeout(function () { t.remove(); }, 4600);
  }

  /* ======================= PERSISTANCE ======================= */
  function fingerprint(d) { return d.length + '|' + d.map(function (x) { return x.numero; }).join(','); }
  function sig(d) {
    return JSON.stringify(d.map(function (x) {
      return [x.numero, x.statut, x.notes || '', x.datePourvue || '', x.offreLien || '', (x.historique || []).length,
        (x.candidatsAssocies || []).length, x.posteRecherche, x.priorite, x.departement, x.responsableDemande,
        x.budgetSalaire, x.coutRecrutement, x.delai, x.site, x.dateDemande, x.dateBesoin, x.effectif, x.motif,
        x.typePoste, x.typeContrat, x.cabinetAgence, x.roleResponsable, x.dateDemande, x.relances || 0];
    }));
  }
  function lireSnapshot() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_DATA) || 'null');
      return (s && s.items && s.items.length) ? s : null;
    } catch (e) { return null; }
  }
  function ecrireSnapshot(items) {
    try {
      localStorage.setItem(LS_DATA, JSON.stringify({
        v: 1, savedAt: new Date().toISOString(), defHash: defHash0 || '', items: items
      }));
    } catch (e) {}
  }
  function pushV1(items) {
    /* met la copie de données ADEM_V1 (widgets, filtres V2, graphes V5, ISO V9)
       en phase avec l'état réel du chunk — sans cela les couches ADEM restent figées */
    try {
      if (v1() && typeof v1()._setRuntime === 'function') v1()._setRuntime(items || data());
    } catch (e) {}
  }
  function appliquerSnapshot() {
    /* applique la sauvegarde sur l'état courant (chemin plein ou fusion si le chunk a évolué) */
    var a = api();
    if (!a || !a.data || !a.data.length) return false;
    var snap = lireSnapshot();
    if (!snap) return false;
    var curHash = fingerprint(a.data);
    if (snap.defHash === curHash) {
      a.set(snap.items.slice());
    } else {
      var cur = a.data;
      var merged = cur.map(function (d) {
        var ov = null;
        for (var i = 0; i < snap.items.length; i++) if (snap.items[i].numero === d.numero) { ov = snap.items[i]; break; }
        return ov ? Object.assign({}, d, {
          statut: ov.statut, notes: ov.notes, datePourvue: ov.datePourvue, offreLien: ov.offreLien,
          historique: ov.historique || d.historique, candidatsAssocies: ov.candidatsAssocies || d.candidatsAssocies
        }) : d;
      });
      snap.items.forEach(function (s2) {
        var found = cur.some(function (d) { return d.numero === s2.numero; });
        if (!found) merged.push(s2);
      });
      a.set(merged);
    }
    return true;
  }
  function restaurer() {
    if (restored) return;
    var a = api();
    if (!a || !a.data || !a.data.length) return;
    defHash0 = fingerprint(a.data);
    defaultSig = sig(a.data);   /* signature des données d'origine — sert à détecter un remontage */
    var snap = lireSnapshot();
    if (snap) {
      /* Le composant React peut se remonter juste après le montage initial (boot SPA)
         et réinitialiser l'état : on applique, on VÉRIFIE, et on réessaie jusqu'à 12×. */
      var expectedSig = sig(snap.items);
      var essais = 0;
      (function reessai() {
        essais++;
        appliquerSnapshot();
        setTimeout(function () {
          var a2 = api();
          var s = (a2 && a2.data && a2.data.length) ? sig(a2.data) : null;
          var ok = s === expectedSig;
          if (!ok && essais < 12 && active) { reessai(); return; }
          if (ok && a2) {
            baseOrder = a2.data.map(function (x) { return x.numero; });
            lastSig = s;
            pushV1();
            if (sort) applySort();
          }
          /* si !ok après 12 essais : lastSig reste vide → le poller réconcilie
             en continu (détection defaultSig) jusqu'à ce que le set prenne */
        }, 320);
      })();
      var hh = new Date(snap.savedAt || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      toast(snap.items.length + ' demande(s) restaurée(s) depuis la sauvegarde locale (' + hh + ')');
      jlog('Persistance | Restauration demandes', String(snap.items.length));
      lastRestoreInfo = { n: snap.items.length, hh: hh };
      noticeRestauration(snap.items.length, hh);
    } else {
      setTimeout(function () {
        var a2 = api();
        if (!a2 || !a2.data || !a2.data.length) return;
        baseOrder = a2.data.map(function (x) { return x.numero; });
        lastSig = sig(a2.data);
        pushV1();
      }, 320);
    }
    restored = true;
  }
  function noticeRestauration(n, hh) {
    var sub = null, cand = $$('p, [class*="body2"]');
    for (var i = 0; i < cand.length; i++) {
      if (/demande\(s\) de recrutement/.test(cand[i].textContent || '') && cand[i].textContent.length < 80) { sub = cand[i]; break; }
    }
    if (!sub) return;
    var chip = $('.dmx-restored', sub);
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'dmx-restored';
      chip.setAttribute('data-dmx', 'restored');
      chip.style.marginLeft = '8px';
      sub.appendChild(chip);
    }
    chip.textContent = '\u21ba sauvegarde locale active \u00b7 ' + n + ' demande(s) \u00b7 ' + hh;
  }
  function poller() {
    if (!active) return;
    var a = api();
    if (!a || !a.data || !a.data.length) return;
    var s = sig(a.data);
    if (s === lastSig) return;
    /* détection de remontage du composant (retour aux données d'origine) :
       on RE-applique la sauvegarde au lieu d'écraser celle-ci par les défauts */
    if (defaultSig && s === defaultSig && restored && lireSnapshot()) {
      appliquerSnapshot();
      return; /* lastSig reste différent : le prochain tick recalera après rendu */
    }
    lastSig = s;
    ecrireSnapshot(a.data);
    pushV1();
  }
  function reinitDonnees() {
    if (!window.confirm('Réinitialiser les demandes de recrutement à l\u2019état d\u2019origine ?\n\nLes statuts, notes et demandes créées localement seront effacés (les brouillons du formulaire sont conservés).')) return;
    try { localStorage.removeItem(LS_DATA); } catch (e) {}
    try { localStorage.removeItem(LS_SORT); } catch (e) {}
    jlog('Persistance | Réinitialisation demandes', 'retour aux données d\u2019origine');
    location.reload();
  }

  /* ======================= TRI DES COLONNES ======================= */
  function cmpVal(a, b, type) {
    if (type === 'num') return (Number(a) || 0) - (Number(b) || 0);
    if (type === 'date') {
      var da = pd(a), db = pd(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    }
    if (type === 'prio') return (PRIO_RANK[a] != null ? PRIO_RANK[a] : 9) - (PRIO_RANK[b] != null ? PRIO_RANK[b] : 9);
    if (type === 'statut') return (STATUT_RANK[a] != null ? STATUT_RANK[a] : 9) - (STATUT_RANK[b] != null ? STATUT_RANK[b] : 9);
    return norm(a).localeCompare(norm(b), 'fr');
  }
  function applySort() {
    var a = api();
    if (!a) return;
    if (!sort || !sort.k) { restoreOrder(); return; }
    var conf = null;
    for (var lab in SORTS) if (SORTS[lab].k === sort.k) conf = SORTS[lab];
    if (!conf) { sort = null; restoreOrder(); return; }
    var dir = sort.dir === 'desc' ? -1 : 1;
    var copy = a.data.slice().sort(function (x, y) { return cmpVal(x[conf.k], y[conf.k], conf.t) * dir || 0; });
    a.set(copy);
    a.setPage && a.setPage(0);
  }
  function restoreOrder() {
    var a = api();
    if (!a || !baseOrder) return;
    var rank = {}; baseOrder.forEach(function (n, i) { rank[n] = i; });
    var copy = a.data.slice().sort(function (x, y) {
      var rx = rank[x.numero], ry = rank[y.numero];
      if (rx == null && ry == null) return (x.id || 0) - (y.id || 0);
      if (rx == null) return 1;
      if (ry == null) return -1;
      return rx - ry;
    });
    a.set(copy);
  }
  function attachSort() {
    var ths = $$('table thead th');
    if (!ths.length) return;
    ths.forEach(function (th) {
      var lab = (th.textContent || '').replace(/[\u25b2\u25bc]/g, '').replace(/\s+/g, ' ').trim();
      var conf = SORTS[lab];
      if (!conf) return;
      if (!th.hasAttribute('data-dmx-sortable')) {
        th.setAttribute('data-dmx-sortable', '1');
        th.setAttribute('data-dmx-key', conf.k);
        th.setAttribute('tabindex', '0');
        th.setAttribute('title', 'Trier par ' + lab);
        var sp = document.createElement('span');
        sp.className = 'dmx-sort';
        sp.setAttribute('aria-hidden', 'true');
        sp.textContent = '\u25b2';
        th.appendChild(sp);
        th.onclick = function () { cycleSort(conf.k); };
        th.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleSort(conf.k); } };
      }
    });
    updateSortUI();
  }
  function cycleSort(k) {
    if (!sort || sort.k !== k) sort = { k: k, dir: 'asc' };
    else if (sort.dir === 'asc') sort = { k: k, dir: 'desc' };
    else sort = null;
    try { localStorage.setItem(LS_SORT, sort ? JSON.stringify(sort) : ''); } catch (e) {}
    applySort();
    updateSortUI();
    jlog('Tri demandes', sort ? (sort.k + ' ' + sort.dir) : 'aucun');
  }
  function updateSortUI() {
    $$('th[data-dmx-sortable]').forEach(function (th) {
      var k = th.getAttribute('data-dmx-key');
      var on = sort && sort.k === k;
      if (on) {
        th.setAttribute('data-dmx-dir', sort.dir);
        th.setAttribute('aria-sort', sort.dir === 'asc' ? 'ascending' : 'descending');
      } else {
        th.removeAttribute('data-dmx-dir');
        th.removeAttribute('aria-sort');
      }
    });
  }

  /* ======================= EXPORT MULTI-FORMAT ======================= */
  function esc(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  function dl(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function exportSet() {
    var d = data();
    var out = d;
    try {
      var vn = v2() && v2().visibleNums && v2().visibleNums();
      if (vn && d.length && vn.size && vn.size < d.length) out = d.filter(function (x) { return vn.has(x.numero); });
    } catch (e) {}
    if (favOnly) out = out.filter(function (x) { return isFav(x.numero); });
    return out;
  }
  function doXLS(list) {
    var h = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>' +
      '<table border="1"><tr>' + DM_COLS.map(function (c) { return '<th style="background:#0D7C66;color:#fff">' + c[1] + '</th>'; }).join('') + '</tr>' +
      list.map(function (o) { return '<tr>' + DM_COLS.map(function (c) { return '<td>' + (o[c[0]] == null ? '' : o[c[0]]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table></body></html>';
    dl(new Blob([h], { type: 'application/vnd.ms-excel' }), 'demandes_recrutement.xls');
  }
  function doJSONExport(list) {
    var out = { application: 'Admina-RH \u2014 Domaine 1 Recrutement', page: 'Demandes de Recrutement',
      exporte: new Date().toISOString(), norme: 'ISO 9001 \u00b7 ISO 30401', total: list.length, demandes: list };
    dl(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), 'demandes_recrutement.json');
  }
  function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }
  function doCopy(list) {
    var tsv = DM_COLS.map(function (c) { return c[1]; }).join('\t') + '\n' +
      list.map(function (o) { return DM_COLS.map(function (c) { return o[c[0]] == null ? '' : o[c[0]]; }).join('\t'); }).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).catch(function () { fallbackCopy(tsv); });
    } else fallbackCopy(tsv);
  }
  function doPrint(list) {
    var f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f);
    var doc = f.contentDocument;
    doc.open();
    doc.write('<html><head><meta charset="utf-8"><title>Demandes de Recrutement \u2014 Admina-RH</title><style>' +
      '@page{size:A4 landscape;margin:11mm}' +
      'body{font-family:Arial,Helvetica,sans-serif;color:#1d2b36;font-size:9.5px}' +
      'h1{font-size:15px;margin:0 0 2px}h1 span{color:#0D7C66}' +
      '.meta{font-size:8.5px;color:#607080;margin-bottom:10px}' +
      'table{width:100%;border-collapse:collapse}' +
      'th{background:#0D7C66;color:#fff;text-align:left;padding:4px 5px;font-size:8.5px}' +
      'td{border-bottom:1px solid #dde3e6;padding:4px 5px;vertical-align:top}' +
      'tr:nth-child(even) td{background:#f2f9f6}' +
      '.ft{margin-top:10px;font-size:7.5px;color:#8a97a0;text-align:center}' +
      '</style></head><body>' +
      '<h1>Admina-RH <span>\u2014 Demandes de Recrutement</span></h1>' +
      '<div class="meta">' + list.length + ' demande(s) \u00b7 \u00e9dit\u00e9 le ' + new Date().toLocaleString('fr-FR') + ' \u00b7 ISO 9001 / 30401</div>' +
      '<table><tr>' + DM_COLS.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '</tr>' +
      list.map(function (o) { return '<tr>' + DM_COLS.map(function (c) { return '<td>' + (o[c[0]] == null ? '' : o[c[0]]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table><div class="ft">Admina-RH \u00b7 Domaine 1 \u2014 Recrutement \u00b7 document g\u00e9n\u00e9r\u00e9 automatiquement</div></body></html>');
    doc.close();
    setTimeout(function () { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(function () { f.remove(); }, 3000); }, 250);
  }
  function closeMenus() { $$('[data-dmx="menu"]').forEach(function (m) { m.remove(); }); }
  function openExportMenu(x, y) {
    closeMenus();
    var list = exportSet();
    var filtered = list.length !== data().length;
    var m = document.createElement('div');
    m.className = 'dmx-menu';
    m.setAttribute('data-dmx', 'menu');
    m.setAttribute('role', 'menu');
    var items = [
      ['Excel (.xls)', 'mise en page tableau', function () { jlog('Export | XLS demandes', String(list.length)); doXLS(list); toast('Export Excel g\u00e9n\u00e9r\u00e9'); }],
      ['JSON', 'donn\u00e9es + m\u00e9tadonn\u00e9es', function () { jlog('Export | JSON demandes', String(list.length)); doJSONExport(list); toast('Export JSON g\u00e9n\u00e9r\u00e9'); }],
      ['Copier', 'TSV vers presse-papiers', function () { doCopy(list); toast('Tableau copi\u00e9 \u2014 collez dans Excel'); }],
      ['Imprimer / PDF', 'A4 paysage', function () { jlog('Export | Impression demandes', String(list.length)); doPrint(list); }]
    ];
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.setAttribute('role', 'menuitem');
      b.type = 'button';
      b.innerHTML = it[0] + (filtered ? ' <span style="color:#0D7C66;font-size:.62rem">(' + list.length + ' filtr\u00e9es)</span>' : '') + '<small>' + it[1] + '</small>';
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
      if (e.key === 'Escape') closeMenus();
      if (e.key === 'ArrowDown') { e.preventDefault(); (bs[i + 1] || bs[0]).focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (bs[i - 1] || bs[bs.length - 1]).focus(); }
    });
  }
  document.addEventListener('click', function (e) {
    if (!active) return;
    if (!e.target.closest || (!e.target.closest('.dmx-menu') && !e.target.closest('[data-dmx="export"]'))) closeMenus();
  });

  /* ======================= TOOLBAR (Export ▾ + Analyse) ======================= */
  function buildToolbar() {
    if ($('[data-dmx="export"]') && $('[data-dmx="analyse"]') && $('[data-dmx="import"]') && $('[data-dmx="favbtn"]') && $('[data-dmx="echea"]') && $('[data-dmx="journal"]')) return;
    var btns = $$('button').filter(function (b) { return /Exporter CSV/.test(b.textContent || ''); });
    var csvBtn = btns[0];
    if (!csvBtn) return;
    var anchor = csvBtn;
    if (!$('[data-dmx="export"]')) {
      var eb = document.createElement('button');
      eb.type = 'button';
      eb.className = 'dmx-btn dmx-ghost';
      eb.setAttribute('data-dmx', 'export');
      eb.setAttribute('aria-haspopup', 'menu');
      eb.setAttribute('aria-label', 'Options d\u2019export des demandes');
      eb.innerHTML = 'Export <span class="dmx-caret">\u25be</span>';
      eb.onclick = function (ev) {
        ev.stopPropagation();
        var r = eb.getBoundingClientRect();
        openExportMenu(r.left, r.bottom + 6);
      };
      anchor.insertAdjacentElement('afterend', eb);
      anchor = eb;
    }
    if (!$('[data-dmx="analyse"]')) {
      var ab = document.createElement('button');
      ab.type = 'button';
      ab.className = 'dmx-btn';
      ab.setAttribute('data-dmx', 'analyse');
      ab.innerHTML = '\u25c6 Analyse intelligente';
      ab.onclick = function () { openAnalyse(); };
      anchor.insertAdjacentElement('afterend', ab);
    }
    if (!$('[data-dmx="import"]')) {
      var eb2 = $('[data-dmx="export"]');
      if (eb2) {
        var ib = document.createElement('button');
        ib.type = 'button';
        ib.className = 'dmx-btn dmx-ghost';
        ib.setAttribute('data-dmx', 'import');
        ib.setAttribute('aria-label', 'Importer des demandes depuis un fichier JSON ou CSV');
        ib.title = 'Importer (JSON / CSV) — raccourci : I';
        ib.innerHTML = '\u2935 Importer';
        ib.onclick = function () { var fi = $('[data-dmx="file"]'); fi && fi.click(); };
        eb2.insertAdjacentElement('afterend', ib);
      }
    }
    if (!$('[data-dmx="file"]')) {
      var fi2 = document.createElement('input');
      fi2.type = 'file';
      fi2.accept = '.json,.csv,text/csv,application/json';
      fi2.style.display = 'none';
      fi2.setAttribute('data-dmx', 'file');
      fi2.addEventListener('change', function () {
        var f = fi2.files && fi2.files[0];
        fi2.value = '';
        if (f) lireFichierImport(f);
      });
      document.body.appendChild(fi2);
    }
    if (!$('[data-dmx="favbtn"]')) {
      var imp = $('[data-dmx="import"]');
      var fb = document.createElement('button');
      fb.type = 'button';
      fb.className = 'dmx-btn dmx-ghost dmx-favbtn';
      fb.setAttribute('data-dmx', 'favbtn');
      fb.title = 'Afficher uniquement les favoris — raccourci : F';
      fb.setAttribute('aria-pressed', favOnly ? 'true' : 'false');
      fb.onclick = function () { basculerFavOnly(); };
      if (imp) imp.insertAdjacentElement('afterend', fb);
      else if (anchor) anchor.insertAdjacentElement('afterend', fb);
    }
    if (!$('[data-dmx="echea"]')) {
      var fb2 = $('[data-dmx="favbtn"]') || anchor;
      var cb = document.createElement('button');
      cb.type = 'button';
      cb.className = 'dmx-btn dmx-ghost';
      cb.setAttribute('data-dmx', 'echea');
      cb.title = '\u00c9ch\u00e9ancier des demandes & r\u00e9glages ISO — raccourci : C';
      cb.onclick = function () { openEcheancier(); };
      if (fb2) fb2.insertAdjacentElement('afterend', cb);
      else if (anchor) anchor.insertAdjacentElement('afterend', cb);
    }
    if (!$('[data-dmx="journal"]')) {
      var ec = $('[data-dmx="echea"]') || anchor;
      var jb = document.createElement('button');
      jb.type = 'button';
      jb.className = 'dmx-btn dmx-ghost';
      jb.setAttribute('data-dmx', 'journal');
      jb.textContent = '\u2691 Journal';
      jb.title = 'Journal d\u2019activit\u00e9 — raccourci : J';
      jb.onclick = function () { openJournal(); };
      if (ec) ec.insertAdjacentElement('afterend', jb);
      else if (anchor) anchor.insertAdjacentElement('afterend', jb);
    }
    updateEcheaBtn();
    updateFavBtn();
  }

  /* ======================= PASSERELLE DR \u2192 OFFRE ======================= */
  function construireOffre(d) {
    return {
      id: 0, numero: '',
      intitule: d.posteRecherche || 'Poste \u00e0 d\u00e9finir',
      departement: d.departement || '',
      typePoste: d.typePoste || 'Cadre',
      typeContrat: d.typeContrat || 'CDI',
      canalDiffusion: 'Site web',
      statutOffre: 'A creer',
      datePublication: '', dateCloture: '',
      dateRequise: d.dateBesoin || '',
      responsable: d.responsableDemande || '',
      roleResponsable: d.roleResponsable || 'DRH',
      priorite: d.priorite || 'Moyenne',
      budgetAlloue: d.budgetSalaire || 0,
      salaireMin: d.budgetSalaire || 0,
      salaireMax: d.budgetSalaire || 0,
      nbCandidatures: 0, nbCandidaturesRecues: 0,
      candidatsAssocies: [],
      description: 'Offre issue de la demande ' + d.numero + ' \u2014 ' + (d.posteRecherche || '') + '.',
      historique: [{ date: today(), evenement: 'Offre cr\u00e9\u00e9e \u00e0 partir de la demande ' + d.numero + ' (passerelle)', auteur: d.responsableDemande || 'Recrutement', type: 'creation' }],
      site: d.site || ''
    };
  }
  function allerVersOffres() {
    var links = $$('a').filter(function (a) {
      var h = a.getAttribute('href') || '';
      return (h === '/offres' || /\/offres\/?$/.test(h)) && a.offsetWidth > 0;
    });
    if (links[0]) { links[0].click(); return true; }
    location.assign('/Domaine1_Recrutement_Candidats/offres');
    return true;
  }
  function creerOffreDepuis(d) {
    if (!d) return;
    if (!window.confirm('Cr\u00e9er l\u2019offre d\u2019emploi correspondant \u00e0 ' + d.numero + ' \u00ab ' + (d.posteRecherche || '') + ' \u00bb ?\n\nVous serez redirig\u00e9 vers Offres d\u2019Emploi (l\u2019offre sera cr\u00e9\u00e9e au statut \u00ab \u00c0 cr\u00e9er \u00bb).')) return;
    try {
      localStorage.setItem(LS_BRIDGE, JSON.stringify({ offre: construireOffre(d), from: d.numero, at: new Date().toISOString() }));
    } catch (e) { toast('Impossible de pr\u00e9parer le transfert', 'err'); return; }
    jlog('Passerelle DR\u2192Offre', d.numero + ' \u2192 /offres');
    toast('Transfert vers Offres d\u2019Emploi\u2026', 'ok');
    setTimeout(allerVersOffres, 350);
  }
  function enhanceDrawer() {
    var papers = $$('.MuiDrawer-root .MuiPaper-root').filter(function (p) {
      return /DR-\d{4}-\d{3}/.test(p.textContent || '');
    });
    if (!papers.length) { var old = $('[data-dmx="mkoffer"]'); if (old) old.remove(); var ob = $('[data-dmx="olink"]'); if (ob) ob.remove(); return; }
    var paper = papers[0];
    var num = (/DR-\d{4}-\d{3}/.exec(paper.textContent) || [''])[0];
    var d = byNumero(num);
    if (!d) return;
    /* --- bouton Créer l'offre (footer, à côté de « Marquer pourvue ») --- */
    var marq = $$('button', paper).filter(function (b) { return /Marquer pourvue/.test(b.textContent || ''); })[0];
    var foot = marq ? marq.parentElement : null;
    var eligible = d.statut === 'Valid\u00e9e' || d.statut === 'En cours';
    var mk = $('[data-dmx="mkoffer"]');
    if (foot && eligible) {
      if (!mk || mk.parentElement !== foot || (marq && mk.nextSibling !== marq)) {
        if (mk) mk.remove();
        mk = document.createElement('button');
        mk.type = 'button';
        mk.className = 'dmx-mkoffer';
        mk.setAttribute('data-dmx', 'mkoffer');
        mk.setAttribute('aria-label', 'Cr\u00e9er l\u2019offre pour ' + num);
        mk.innerHTML = '\u2b95 Cr\u00e9er l\u2019offre';
        mk.onclick = function () { creerOffreDepuis(byNumero(num)); };
        /* inséré AVANT « Marquer pourvue » : en fin de ligne il passe sous la
           pastille flottante « Domaines » (ADEM_V12, bas-droit de l'écran) */
        if (marq && marq.parentElement === foot) foot.insertBefore(mk, marq);
        else foot.appendChild(mk);
      }
    } else if (mk) mk.remove();
    /* --- bouton Relancer (footer, à côté de Créer l'offre) — lot 3 --- */
    var rel = $('[data-dmx="drel"]');
    if (foot && actifItem(d)) {
      if (!rel || rel.parentElement !== foot || (mk && rel.nextSibling !== mk)) {
        if (rel) rel.remove();
        rel = document.createElement('button');
        rel.type = 'button';
        rel.className = 'dmx-drel';
        rel.setAttribute('data-dmx', 'drel');
        rel.setAttribute('aria-label', 'Relancer la demande ' + num);
        rel.onclick = function () { relancer(num); };
        if (mk && mk.parentElement === foot) foot.insertBefore(rel, mk);
        else if (marq && marq.parentElement === foot) foot.insertBefore(rel, marq);
        else foot.appendChild(rel);
      }
      var relTxt = '\ud83d\udd14 Relancer' + (nbRelances(d) ? ' (' + nbRelances(d) + ')' : '');
      if (rel.textContent !== relTxt) rel.textContent = relTxt;
    } else if (rel) rel.remove();
    /* --- badge offre liée dans l'en-tête du drawer --- */
    var head = paper.firstElementChild;
    var chipsRow = head ? head.querySelector('[style*="flex-wrap"], [class*="css"]') : null;
    if (head && d.offreLien) {
      var target = null;
      var rows = $$('div', head);
      for (var i = 0; i < rows.length; i++) {
        var nchips = rows[i].querySelectorAll('.MuiChip-root').length;
        if (nchips >= 2) { target = rows[i]; break; }
      }
      if (target) {
        var ob = $('[data-dmx="olink"]');
        if (!ob || ob.parentElement !== target) {
          if (ob) ob.remove();
          ob = document.createElement('button');
          ob.type = 'button';
          ob.className = 'dmx-olink';
          ob.setAttribute('data-dmx', 'olink');
          ob.setAttribute('title', 'Voir l\u2019offre li\u00e9e sur /offres');
          ob.textContent = '\u2192 ' + d.offreLien;
          ob.onclick = function () { allerVersOffres(); };
          target.appendChild(ob);
        }
      }
    }
  }

  /* ======================= HINT KANBAN ======================= */
  function kanbanHint() {
    var old = $('.dmx-khint');
    var col = $('[data-rfd-droppable-id]');
    if (!col) { if (old) old.remove(); return; }
    var board = col.parentElement;
    if (!board || !board.parentElement) return;
    if (old && old.parentElement === board.parentElement && old.nextElementSibling === board) return;
    if (old) old.remove();
    var h = document.createElement('div');
    h.className = 'dmx-khint';
    h.setAttribute('data-dmx', 'khint');
    h.innerHTML = '<span class="dmx-kbadge">Glisser-d\u00e9poser actif</span>' +
      '<span>Faites glisser une carte par sa <b>poign\u00e9e \u29bf</b> vers une autre colonne pour changer son statut \u2014 l\u2019action est enregistr\u00e9e localement.</span>';
    board.parentElement.insertBefore(h, board);
  }

  /* ======================= ANALYSE INTELLIGENTE (lot 1) ======================= */
  function closeAnalyse() { var b = $('[data-dmx="aback"]'); if (b) b.remove(); }
  function openAnalyse(force) {
    if (force) closeAnalyse();
    if ($('[data-dmx="aback"]')) { closeAnalyse(); return; }
    closeMenus();
    jlog('Analyse intelligente demandes', 'ouverture');
    var d = data();
    var actifs = d.filter(actifItem);
    var pourvues = d.filter(function (x) { return x.statut === 'Pourvue'; });
    var ages = actifs.map(function (x) { return { x: x, a: ageJours(x) }; }).filter(function (p) { return p.a != null; });
    var delaiMoyen = ages.length ? Math.round(ages.reduce(function (s, p) { return s + p.a; }, 0) / ages.length) : 0;
    var critiques = ages.filter(function (p) { return p.a > CFG.iso; }).sort(function (p, q) { return q.a - p.a; });
    var relances = d.filter(function (x) {
      var a = ageJours(x);
      return x.statut === 'En attente' && (x.priorite === 'Urgente' || x.priorite === 'Haute') && a != null && a > CFG.rel;
    }).sort(function (x, y) { return (ageJours(y) || 0) - (ageJours(x) || 0); });
    var sansOffre = d.filter(function (x) { return x.statut === 'Valid\u00e9e' && !x.offreLien; });
    var budgetActif = actifs.reduce(function (s, x) { return s + (x.budgetSalaire || 0); }, 0);
    var budgetPourvu = pourvues.reduce(function (s, x) { return s + (x.budgetSalaire || 0); }, 0);
    var depts = {};
    actifs.forEach(function (x) {
      if (!depts[x.departement]) depts[x.departement] = { n: 0, b: 0 };
      depts[x.departement].n++; depts[x.departement].b += (x.budgetSalaire || 0);
    });
    var deptRows = Object.keys(depts).map(function (k) { return { k: k, n: depts[k].n, b: depts[k].b }; })
      .sort(function (p, q) { return q.n - p.n || q.b - p.b; });

    var back = document.createElement('div');
    back.className = 'dmx-aback';
    back.setAttribute('data-dmx', 'aback');

    function line(html, opts) {
      opts = opts || {};
      return '<div class="dmx-aline' + (opts.click ? ' dmx-click" data-num="' + opts.click : '"') + '>' + html + '</div>';
    }
    function tag(cls, txt) { return '<span class="dmx-tag ' + cls + '">' + txt + '</span>'; }

    var critHtml = critiques.length
      ? critiques.slice(0, 8).map(function (p) {
          return line(tag('crit', p.a + ' j') + '<b>' + p.x.numero + '</b><span>' + (p.x.posteRecherche || '') + '</span>' +
            tag('muted', p.x.priorite || '\u2014') + '<button type="button" class="dmx-go" data-num="' + p.x.numero + '">Ouvrir</button>', { click: p.x.numero });
        }).join('') + (critiques.length > 8 ? '<div class="dmx-aempty">+ ' + (critiques.length - 8) + ' autre(s)\u2026</div>' : '')
      : '<div class="dmx-aempty">\u2705 Aucune demande active ne d\u00e9passe la cible ISO de ' + CFG.iso + ' jours.</div>';

    var relHtml = relances.length
      ? relances.slice(0, 6).map(function (x) {
          return line(tag('warn', ageJours(x) + ' j') + '<b>' + x.numero + '</b><span>' + (x.posteRecherche || '') + '</span>' + tag('info', x.priorite) +
            '<button type="button" class="dmx-go" data-rel="' + x.numero + '">\ud83d\udd14 Relancer</button>' +
            '<button type="button" class="dmx-go" data-num="' + x.numero + '">Ouvrir</button>', { click: x.numero });
        }).join('')
      : '<div class="dmx-aempty">\u2705 Aucune relance prioritaire n\u2019est n\u00e9cessaire.</div>';

    var soHtml = sansOffre.length
      ? sansOffre.map(function (x) {
          return line(tag('ok', 'Valid\u00e9e') + '<b>' + x.numero + '</b><span>' + (x.posteRecherche || '') + '</span>' +
            '<button type="button" class="dmx-go" data-so="' + x.numero + '">\u2b95 Cr\u00e9er l\u2019offre</button>');
        }).join('')
      : '<div class="dmx-aempty">\u2713 Toutes les demandes valid\u00e9es ont une offre li\u00e9e.</div>';

    var deptHtml = deptRows.length
      ? deptRows.slice(0, 6).map(function (r) {
          return line(tag('muted', r.n + ' active(s)') + '<b>' + r.k + '</b><span>budget engag\u00e9 : <b>' + fmt(r.b) + ' FCFA</b></span>');
        }).join('')
      : '<div class="dmx-aempty">Aucune demande active.</div>';

    var reco = [];
    if (critiques.length) reco.push('<b>' + critiques.length + '</b> demande(s) d\u00e9passent la cible ISO de ' + CFG.iso + ' jours \u2014 traitez en priorit\u00e9 ou justifiez au registre des NC.');
    if (relances.length) reco.push('Relancez <b>' + relances.length + '</b> demande(s) prioritaire(s) rest\u00e9e(s) en attente de validation.');
    if (sansOffre.length) reco.push('<b>' + sansOffre.length + '</b> demande(s) valid\u00e9e(s) sans offre : utilisez la passerelle \u00ab Cr\u00e9er l\u2019offre \u00bb pour boucler le processus.');
    if (budgetActif) reco.push('Budget engag\u00e9 sur les demandes actives : <b>' + fmt(budgetActif) + ' FCFA</b> \u00b7 d\u00e9j\u00e0 pourvu : <b>' + fmt(budgetPourvu) + ' FCFA</b>.');
    if (!reco.length) reco.push('Situation saine : aucune action requise.');

    back.innerHTML =
      '<div class="dmx-apanel" role="dialog" aria-modal="true" aria-label="Analyse intelligente des demandes">' +
        '<div class="dmx-ahead"><div><h3>\u25c6 Analyse intelligente \u2014 Demandes</h3>' +
        '<div class="dmx-asub">' + d.length + ' demande(s) \u00b7 ' + actifs.length + ' active(s) \u00b7 g\u00e9n\u00e9r\u00e9 le ' + new Date().toLocaleString('fr-FR') + '</div></div>' +
        '<button type="button" class="dmx-aclose" aria-label="Fermer l\u2019analyse">\u2715</button></div>' +
        '<div class="dmx-abody">' +
          '<div class="dmx-akpis">' +
            '<div class="dmx-akpi"><div class="l">Demandes actives</div><div class="v">' + actifs.length + '</div></div>' +
            '<div class="dmx-akpi"><div class="l">D\u00e9lai moyen</div><div class="v' + (delaiMoyen > CFG.iso ? ' red' : (delaiMoyen > CFG.vig ? ' amber' : '')) + '">' + delaiMoyen + ' j</div></div>' +
            '<div class="dmx-akpi"><div class="l">Critiques &gt; ' + CFG.iso + ' j</div><div class="v' + (critiques.length ? ' red' : '') + '">' + critiques.length + '</div></div>' +
            '<div class="dmx-akpi"><div class="l">Budget actif</div><div class="v">' + fmt(budgetActif) + '</div></div>' +
          '</div>' +
          '<div class="dmx-asect">\u23f3 D\u00e9lais critiques (cible ISO ' + CFG.iso + ' j) \u2014 cliquez pour ouvrir</div>' +
          '<div class="dmx-alist">' + critHtml + '</div>' +
          '<div class="dmx-asect">\ud83d\udd14 Relances recommand\u00e9es (prioritaires &gt; ' + CFG.rel + ' j en attente)</div>' +
          '<div class="dmx-alist">' + relHtml + '</div>' +
          '<div class="dmx-asect">\u2b95 Passerelle \u2014 valid\u00e9es sans offre li\u00e9e</div>' +
          '<div class="dmx-alist">' + soHtml + '</div>' +
          '<div class="dmx-asect">\ud83d\udcc2 Charge par d\u00e9partement (demandes actives)</div>' +
          '<div class="dmx-alist">' + deptHtml + '</div>' +
          '<div class="dmx-asect">\ud83d\udca1 Recommandations</div>' +
          '<div class="dmx-alist">' + reco.map(function (r) { return '<div class="dmx-aline">' + r + '</div>'; }).join('') + '</div>' +
          '<div class="dmx-afoot">' +
            '<button type="button" class="dmx-abtn" data-act="echea">\u23f1 \u00c9ch\u00e9ancier &amp; r\u00e9glages</button>' +
            '<button type="button" class="dmx-abtn" data-act="json">Exporter l\u2019analyse (JSON)</button>' +
            '<button type="button" class="dmx-abtn danger" data-act="reset">\u21ba R\u00e9initialiser les donn\u00e9es</button>' +
            '<span class="spacer"></span>' +
            '<span class="dmx-anote">Analyse calcul\u00e9e localement \u00b7 ISO 9001 \u00a710.2 \u00b7 Manuel D1 \u00a77.3</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    function onKey(e) { if (e.key === 'Escape') closeAnalyse(); }
    back.addEventListener('click', function (e) {
      if (e.target === back) { closeAnalyse(); document.removeEventListener('keydown', onKey); return; }
      var t = e.target;
      var go = t.closest && t.closest('.dmx-go');
      if (go && go.getAttribute('data-so')) {
        var dd = byNumero(go.getAttribute('data-so'));
        closeAnalyse();
        if (dd) creerOffreDepuis(dd);
        return;
      }
      if (go && go.getAttribute('data-rel')) {
        var rn = go.getAttribute('data-rel');
        relancer(rn);
        openAnalyse(true);   /* re-render frais avec le nouveau compteur */
        return;
      }
      if (t.getAttribute && t.getAttribute('data-act') === 'echea') { closeAnalyse(); openEcheancier(); return; }
      var row = t.closest && t.closest('.dmx-aline.dmx-click');
      if (row && row.getAttribute('data-num')) {
        var x = byNumero(row.getAttribute('data-num'));
        if (x) { var a = api(); a && a.openDetail(x); }
        closeAnalyse();
        document.removeEventListener('keydown', onKey);
        return;
      }
      if (t.getAttribute && t.getAttribute('data-act') === 'json') {
        var out = { application: 'Admina-RH \u2014 Analyse des demandes', generee: new Date().toISOString(),
          total: d.length, actives: actifs.length, delaiMoyenJours: delaiMoyen,
          critiques: critiques.map(function (p) { return { numero: p.x.numero, poste: p.x.posteRecherche, ageJours: p.a, priorite: p.x.priorite }; }),
          relances: relances.map(function (x) { return { numero: x.numero, priorite: x.priorite, ageJours: ageJours(x) }; }),
          valideesSansOffre: sansOffre.map(function (x) { return x.numero; }),
          chargeParDepartement: deptRows };
        dl(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), 'analyse_demandes.json');
        toast('Analyse export\u00e9e (JSON)');
      }
      if (t.getAttribute && t.getAttribute('data-act') === 'reset') { closeAnalyse(); reinitDonnees(); }
    });
    back.querySelector('.dmx-aclose').addEventListener('click', function () { closeAnalyse(); document.removeEventListener('keydown', onKey); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
  }

  /* ======================= LOT 2 — FAVORIS ======================= */
  function favList() {
    try { return JSON.parse(localStorage.getItem(LS_FAVS) || '[]'); } catch (e) { return []; }
  }
  function isFav(n) { return favList().indexOf(n) >= 0; }
  function setFav(n, on) {
    var f = favList(), i = f.indexOf(n);
    if (on && i < 0) f.push(n);
    else if (!on && i >= 0) f.splice(i, 1);
    else return on;
    try { localStorage.setItem(LS_FAVS, JSON.stringify(f)); } catch (e) {}
    return on;
  }
  function basculerFav(num) {
    if (!num) return;
    var on = !isFav(num);
    setFav(num, on);
    toast(on ? num + ' ajout\u00e9 aux favoris' : num + ' retir\u00e9 des favoris');
    jlog('Favoris demandes', (on ? '\u2605 ' : '\u2606 ') + num);
    updateFavBtn();
    refresh();
  }
  function basculerFavOnly() {
    favOnly = !favOnly;
    try { localStorage.setItem(LS_FAVONLY, favOnly ? '1' : '0'); } catch (e) {}
    updateFavBtn();
    refresh();
    jlog('Filtre favoris demandes', favOnly ? 'activ\u00e9' : 'd\u00e9sactiv\u00e9');
    toast(favOnly ? 'Filtre favoris activ\u00e9' : 'Filtre favoris d\u00e9sactiv\u00e9');
  }
  function updateFavBtn() {
    var fb = $('[data-dmx="favbtn"]');
    if (!fb) return;
    var n = favList().length;
    var txt = '\u2605 Favoris (' + n + ')';
    if (fb.textContent !== txt) fb.textContent = txt;
    fb.setAttribute('aria-pressed', favOnly ? 'true' : 'false');
    fb.classList.toggle('dmx-on', favOnly);
  }

  /* ======================= LOT 2 — MULTI-SÉLECTION ======================= */
  function selNums() { return Object.keys(SEL).filter(function (k) { return SEL[k]; }); }
  function numeroOfEl(el) {
    var m = /DR-\d{4}-\d{3}/.exec(el.textContent || '');
    return m ? m[0] : null;
  }
  function enhanceRows() {
    var rows = $$('table tbody tr');
    if (!rows.length) return;
    rows.forEach(function (tr) {
      var num = numeroOfEl(tr);
      if (!num) return;
      var cell = tr.cells && tr.cells[0];
      if (!cell) return;
      if (SEL[num]) tr.setAttribute('data-dmx-sel', '1');
      else tr.removeAttribute('data-dmx-sel');
      tr.classList.toggle('dmx-favhide', favOnly && !isFav(num));
      var star = $('.dmx-favstar', cell);
      if (!star) {
        star = document.createElement('button');
        star.type = 'button';
        star.className = 'dmx-favstar';
        star.setAttribute('data-dmx', 'favstar');
        star.title = 'Ajouter/retirer des favoris';
        star.addEventListener('click', function (e) { e.stopPropagation(); basculerFav(num); });
        cell.insertBefore(star, cell.firstChild);
      }
      var on = isFav(num);
      var want = on ? '\u2605' : '\u2606';
      if (star.textContent !== want) star.textContent = want;
      if (star.getAttribute('aria-pressed') !== (on ? 'true' : 'false')) star.setAttribute('aria-pressed', on ? 'true' : 'false');
      var chk = $('.dmx-chk', cell);
      if (!chk) {
        chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.className = 'dmx-chk';
        chk.setAttribute('data-dmx', 'rowchk');
        chk.setAttribute('aria-label', 'S\u00e9lectionner ' + num);
        chk.addEventListener('click', function (e) { e.stopPropagation(); });
        chk.addEventListener('change', function () {
          if (chk.checked) SEL[num] = true; else delete SEL[num];
          refreshBulk();
          refresh();
        });
        cell.insertBefore(chk, cell.firstChild);
      }
      if (chk.checked !== !!SEL[num]) chk.checked = !!SEL[num];
    });
  }
  function enhanceKanbanFavs() {
    var cards = $$('[data-rfd-draggable-id]');
    if (!cards.length) return;
    cards.forEach(function (c) {
      var num = numeroOfEl(c);
      if (!num) return;
      c.classList.toggle('dmx-favhide', favOnly && !isFav(num));
      var star = $('.dmx-kfav', c);
      if (!star) {
        star = document.createElement('button');
        star.type = 'button';
        star.className = 'dmx-kfav';
        star.setAttribute('data-dmx', 'kfav');
        star.title = 'Ajouter/retirer des favoris';
        star.setAttribute('aria-label', 'Favori ' + num);
        star.addEventListener('click', function (e) { e.stopPropagation(); basculerFav(num); });
        c.appendChild(star);
      }
      var want = isFav(num) ? '\u2605' : '\u2606';
      if (star.textContent !== want) star.textContent = want;
      star.setAttribute('aria-pressed', isFav(num) ? 'true' : 'false');
    });
  }
  function syncSelAll() {
    var ths = $$('table thead th');
    if (!ths.length) return;
    var th = ths[0];
    var all = $$('table tbody tr').map(numeroOfEl).filter(Boolean);
    if (!all.length) { var s0 = $('.dmx-selall', th); if (s0) s0.remove(); return; }
    var box = $('.dmx-selall', th);
    if (!box) {
      box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'dmx-selall';
      box.setAttribute('data-dmx', 'selall');
      box.title = 'Tout s\u00e9lectionner / d\u00e9s\u00e9lectionner (page visible)';
      box.setAttribute('aria-label', 'Tout s\u00e9lectionner');
      box.addEventListener('click', function (e) { e.stopPropagation(); });
      box.addEventListener('change', function () {
        $$('table tbody tr').forEach(function (tr) {
          var n = numeroOfEl(tr);
          if (!n) return;
          if (box.checked) SEL[n] = true; else delete SEL[n];
        });
        refreshBulk();
        refresh();
      });
      th.insertBefore(box, th.firstChild);
    }
    var selCount = all.filter(function (n) { return SEL[n]; }).length;
    box.checked = selCount > 0 && selCount === all.length;
    box.indeterminate = selCount > 0 && selCount < all.length;
  }
  function refreshBulk() {
    var n = selNums().length;
    var bar = $('[data-dmx="bulk"]');
    if (!n) { if (bar) bar.remove(); return; }
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'dmx-bulk';
      bar.setAttribute('data-dmx', 'bulk');
      bar.setAttribute('role', 'toolbar');
      bar.setAttribute('aria-label', 'Actions group\u00e9es sur la s\u00e9lection');
      bar.innerHTML = '<span class="dmx-bcount"></span>' +
        '<select class="dmx-bsel" aria-label="Nouveau statut de la s\u00e9lection">' +
        '<option value="">Statut\u2026</option>' +
        '<option>En attente</option><option>Valid\u00e9e</option><option>En cours</option>' +
        '<option>Pourvue</option><option value="Annulee">Annul\u00e9e</option>' +
        '</select>' +
        '<button type="button" data-act="statut">Appliquer</button>' +
        '<button type="button" data-act="favon" title="Ajouter la s\u00e9lection aux favoris">\u2605 Favoris</button>' +
        '<button type="button" data-act="favoff" title="Retirer la s\u00e9lection des favoris">\u2606 Retirer</button>' +
        '<button type="button" data-act="xls" title="Exporter la s\u00e9lection en Excel">Exporter</button>' +
        '<button type="button" data-act="clear" aria-label="Effacer la s\u00e9lection">\u2715 Effacer</button>';
      bar.addEventListener('click', function (e) { e.stopPropagation(); });
      bar.onclick = function (e) {
        var act = e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        var sel = selNums();
        if (act === 'clear') { SEL = {}; refreshBulk(); refresh(); return; }
        if (act === 'favon' || act === 'favoff') {
          sel.forEach(function (num) { setFav(num, act === 'favon'); });
          toast(sel.length + ' demande(s) ' + (act === 'favon' ? 'ajout\u00e9e(s) aux' : 'retir\u00e9e(s) des') + ' favoris');
          jlog('Favoris demandes (groupe)', (act === 'favon' ? '\u2605 ' : '\u2606 ') + sel.join(', '));
          updateFavBtn(); refresh(); return;
        }
        if (act === 'xls') {
          var list = data().filter(function (x) { return SEL[x.numero]; });
          jlog('Export | XLS s\u00e9lection demandes', String(list.length));
          doXLS(list);
          toast('Export Excel de la s\u00e9lection g\u00e9n\u00e9r\u00e9 (' + list.length + ')');
          return;
        }
        if (act === 'statut') {
          var st = $('.dmx-bsel', bar).value;
          if (!st) { toast('Choisissez d\u2019abord un statut', 'err'); return; }
          if (!window.confirm('Appliquer le statut \u00ab ' + labStatut(st) + ' \u00bb \u00e0 ' + sel.length + ' demande(s) ?')) return;
          var a = api();
          if (!a) return;
          var dt = today();
          a.set(function (prev) {
            return prev.map(function (x) {
              if (!SEL[x.numero]) return x;
              var h = (x.historique || []).concat([{ date: dt, evenement: 'Statut : ' + x.statut + ' \u2192 ' + labStatut(st) + ' (s\u00e9lection group\u00e9e)', auteur: 'Utilisateur', type: 'statut' }]);
              return Object.assign({}, x, { statut: st, datePourvue: st === 'Pourvue' ? (x.datePourvue || dt) : '', historique: h });
            });
          });
          jlog('Statut group\u00e9 demandes', st + ' \u2190 ' + sel.join(', '));
          toast(sel.length + ' demande(s) mise(s) \u00e0 jour : ' + labStatut(st));
          SEL = {};
          refreshBulk();
          refresh();
        }
      };
      document.body.appendChild(bar);
    }
    var bc = $('.dmx-bcount', bar);
    var txt = n + ' demande(s) s\u00e9lectionn\u00e9e(s)';
    if (bc && bc.textContent !== txt) bc.textContent = txt;
  }

  /* ======================= LOT 2 — IMPORT JSON / CSV ======================= */
  var HDR = {
    n: 'numero', n0: 'numero', no: 'numero', num: 'numero', numero: 'numero', numerodemande: 'numero', reference: 'numero', ref: 'numero',
    date: 'dateDemande', datedemande: 'dateDemande', datedelademande: 'dateDemande',
    departement: 'departement', dept: 'departement', service: 'departement',
    poste: 'posteRecherche', posterecherche: 'posteRecherche', intitule: 'posteRecherche', intituleposte: 'posteRecherche', postearepourvoir: 'posteRecherche',
    typeposte: 'typePoste', type: 'typePoste',
    typecontrat: 'typeContrat', contrat: 'typeContrat',
    effectif: 'effectif',
    motif: 'motif',
    datebesoin: 'dateBesoin', besoin: 'dateBesoin', datedebesoin: 'dateBesoin',
    priorite: 'priorite', importance: 'priorite',
    statut: 'statut', etat: 'statut',
    datepourvue: 'datePourvue', dateembauche: 'datePourvue',
    responsable: 'responsableDemande', responsabledemande: 'responsableDemande', responsabledelademande: 'responsableDemande',
    role: 'roleResponsable', roleresponsable: 'roleResponsable',
    cabinet: 'cabinetAgence', cabinetagence: 'cabinetAgence',
    budget: 'budgetSalaire', budgetsalaire: 'budgetSalaire', budgetmensuel: 'budgetSalaire', salaire: 'budgetSalaire',
    cout: 'coutRecrutement', coutrecrutement: 'coutRecrutement', coutdurecrutement: 'coutRecrutement',
    site: 'site',
    notes: 'notes', note: 'notes', commentaire: 'notes'
  };
  function normHdr(h) { return norm(String(h)).replace(/[^a-z0-9]/g, ''); }
  function normDateDM(s) {
    var t = String(s || '').trim();
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
    return m ? (m[3] + '/' + m[2] + '/' + m[1]) : t;
  }
  function normNum(v) {
    if (typeof v === 'number') return v;
    var t = String(v == null ? '' : v).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
    var n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  }
  function normStatut(s) {
    var t = norm(s);
    if (!t) return '';
    if (/annul/.test(t) || /clotur/.test(t)) return 'Annulee';
    if (/valid/.test(t)) return 'Valid\u00e9e';
    if (/cours/.test(t)) return 'En cours';
    if (/attente/.test(t)) return 'En attente';
    if (/pourv/.test(t)) return 'Pourvue';
    return '';
  }
  function normPrio(s) {
    var t = norm(s);
    if (/urg/.test(t)) return 'Urgente';
    if (/haut/.test(t)) return 'Haute';
    if (/moy/.test(t)) return 'Moyenne';
    if (/bas/.test(t)) return 'Basse';
    return '';
  }
  function mapRow(o) {
    var out = {};
    for (var k in o) { var kk = normHdr(k); if (HDR[kk]) out[HDR[kk]] = o[k]; }
    return out;
  }
  function mapJsonItem(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    function alt(names) {
      for (var i = 0; i < names.length; i++) {
        var v = o[names[i]];
        if (v != null && v !== '') return v;
      }
      return '';
    }
    return {
      numero: String(alt(['numero', 'num', 'n\u00b0', 'n'])),
      dateDemande: normDateDM(alt(['dateDemande', 'date'])),
      departement: String(alt(['departement', 'dept'])),
      posteRecherche: String(alt(['posteRecherche', 'poste', 'intitule'])),
      typePoste: String(alt(['typePoste', 'type'])),
      typeContrat: String(alt(['typeContrat', 'contrat'])),
      effectif: normNum(alt(['effectif'])),
      motif: String(alt(['motif'])),
      dateBesoin: normDateDM(alt(['dateBesoin', 'besoin'])),
      priorite: String(alt(['priorite', 'prio'])),
      statut: String(alt(['statut', 'etat'])),
      datePourvue: normDateDM(alt(['datePourvue'])),
      responsableDemande: String(alt(['responsableDemande', 'resp'])),
      roleResponsable: String(alt(['roleResponsable', 'role'])),
      cabinetAgence: String(alt(['cabinetAgence', 'cabinet'])),
      budgetSalaire: normNum(alt(['budgetSalaire', 'budget'])),
      coutRecrutement: normNum(alt(['coutRecrutement', 'cout'])),
      site: String(alt(['site'])),
      notes: String(alt(['notes', 'note'])),
      historique: Array.isArray(o.historique) ? o.historique : [],
      candidatsAssocies: Array.isArray(o.candidatsAssocies) ? o.candidatsAssocies : []
    };
  }
  function parseCSV(txt) {
    var lines = [], row = [], cur = '', inQ = false;
    var first = (txt.split(/\r?\n/)[0] || '');
    var delim = ((first.match(/;/g) || []).length > (first.match(/,/g) || []).length) ? ';' : ',';
    for (var i = 0; i < txt.length; i++) {
      var c = txt[i];
      if (inQ) {
        if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === delim) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && txt[i + 1] === '\n') i++;
        row.push(cur); cur = '';
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [];
      } else cur += c;
    }
    row.push(cur);
    if (row.length > 1 || row[0] !== '') lines.push(row);
    if (!lines.length) return [];
    var head = lines[0].map(normHdr);
    return lines.slice(1).map(function (l) {
      var o = {};
      head.forEach(function (h, i2) { if (h) o[h] = (l[i2] == null ? '' : l[i2]).trim(); });
      return o;
    });
  }
  function lireFichierImport(f) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var txt = String(r.result || '');
        var list = null;
        if (/\.json$/i.test(f.name) || /^\s*[\[{]/.test(txt)) {
          var j = JSON.parse(txt);
          if (Array.isArray(j)) list = j;
          else if (j && Array.isArray(j.demandes)) list = j.demandes;
          else if (j && Array.isArray(j.items)) list = j.items;
          if (!list) { toast('JSON non reconnu : un tableau de demandes est attendu', 'err'); return; }
          list = list.map(mapJsonItem);
        } else {
          list = parseCSV(txt).map(mapRow).map(mapJsonItem);
        }
        if (!list.length) { toast('Aucune demande trouv\u00e9e dans le fichier', 'err'); return; }
        doImport(list);
      } catch (e) {
        toast('Import impossible : ' + (e && e.message ? e.message : 'fichier illisible'), 'err');
      }
    };
    r.onerror = function () { toast('Lecture du fichier impossible', 'err'); };
    r.readAsText(f, 'utf-8');
  }
  function doImport(list) {
    var a = api();
    if (!a || !a.data) { toast('Donn\u00e9es non disponibles \u2014 r\u00e9essayez', 'err'); return; }
    var cur = a.data.slice();
    var maxY = {};
    cur.forEach(function (x) {
      var m = /^DR-(\d{4})-(\d+)/.exec(x.numero || '');
      if (m && (+m[2]) > (maxY[m[1]] || 0)) maxY[m[1]] = +m[2];
    });
    var maxId = cur.reduce(function (m, x) { return Math.max(m, x.id || 0); }, 0);
    var dt = today();
    var created = 0, updated = 0, skipped = 0;
    list.forEach(function (it) {
      if (!it || !it.posteRecherche) { skipped++; return; }
      if (it.statut) { var st = normStatut(it.statut); if (st) it.statut = st; }
      if (it.priorite) { var p = normPrio(it.priorite); if (p) it.priorite = p; }
      var num = String(it.numero || '').trim();
      if (num && /^DR-\d{4}-\d+$/.test(num)) {
        var idx = -1;
        for (var i = 0; i < cur.length; i++) if (cur[i].numero === num) { idx = i; break; }
        var mm = /^DR-(\d{4})-(\d+)/.exec(num);
        if (idx >= 0) {
          var ex = cur[idx];
          cur[idx] = Object.assign({}, ex, it, {
            id: ex.id, numero: ex.numero,
            historique: (ex.historique || []).concat([{ date: dt, evenement: 'Import : champs mis \u00e0 jour depuis un fichier', auteur: 'Import', type: 'import' }])
          });
          updated++;
        } else {
          maxId++;
          cur.push(Object.assign({}, it, {
            id: maxId,
            statut: it.statut || 'En attente',
            dateDemande: it.dateDemande || dt,
            historique: (it.historique || []).concat([{ date: dt, evenement: 'Demande import\u00e9e depuis un fichier', auteur: 'Import', type: 'import' }])
          }));
          if (mm) maxY[mm[1]] = Math.max(maxY[mm[1]] || 0, +mm[2]);
          created++;
        }
        return;
      }
      maxId++;
      var y = String(new Date().getFullYear());
      maxY[y] = (maxY[y] || 0) + 1;
      var nn = 'DR-' + y + '-' + ('00' + maxY[y]).slice(-3);
      cur.push(Object.assign({}, it, {
        id: maxId, numero: nn,
        statut: it.statut || 'En attente',
        dateDemande: it.dateDemande || dt,
        historique: (it.historique || []).concat([{ date: dt, evenement: 'Demande import\u00e9e depuis un fichier (n\u00b0 ' + nn + ')', auteur: 'Import', type: 'import' }])
      }));
      created++;
    });
    a.set(cur);
    var msg = 'Import : ' + created + ' cr\u00e9\u00e9e(s), ' + updated + ' mise(s) \u00e0 jour' + (skipped ? ', ' + skipped + ' ignor\u00e9e(s)' : '');
    toast(msg, (created || updated) ? 'ok' : 'err');
    jlog('Import demandes', created + ' cr\u00e9\u00e9es / ' + updated + ' m\u00e0j / ' + skipped + ' ignor\u00e9es');
  }

  /* ======================= LOT 3 — CONFIG CIBLE ISO ======================= */
  function ecrireCfg(vals) {
    var c = {};
    try { c = JSON.parse(localStorage.getItem(LS_CFG) || '{}') || {}; } catch (e) {}
    ['iso', 'vig', 'rel'].forEach(function (k) {
      var v = parseInt(vals && vals[k], 10);
      if (!isNaN(v)) c[k] = v;
    });
    try { localStorage.setItem(LS_CFG, JSON.stringify(c)); } catch (e) {}
    lireCfg();
    try { window.__ADEM_V9__ && window.__ADEM_V9__._refresh && window.__ADEM_V9__._refresh(); } catch (e) {}
    jlog('R\u00e9glages cible ISO', 'cible ' + CFG.iso + ' j \u00b7 vigilance \u2264 ' + CFG.vig + ' j \u00b7 relance ' + CFG.rel + ' j');
    toast('R\u00e9glages enregistr\u00e9s : cible ' + CFG.iso + ' j, vigilance \u2264 ' + CFG.vig + ' j, relance ' + CFG.rel + ' j');
    refresh();
  }

  /* ======================= LOT 3 — RELANCES ======================= */
  function nbRelances(d) { return (d && d.relances) || 0; }
  function relancer(num) {
    var d = byNumero(num);
    if (!d) return;
    if (!actifItem(d)) { toast('Demande ' + labStatut(d.statut) + ' \u2014 relance inutile', 'warn'); return; }
    var a = api();
    if (!a) { toast('Donn\u00e9es indisponibles', 'err'); return; }
    var dt = today();
    a.set(function (prev) {
      return prev.map(function (x) {
        if (x.numero !== num) return x;
        return Object.assign({}, x, {
          relances: (x.relances || 0) + 1,
          derniereRelance: dt,
          historique: (x.historique || []).concat([{ date: dt, evenement: 'Relance \u00e9mise (n\u00b0 ' + ((x.relances || 0) + 1) + ')', auteur: 'Recrutement', type: 'relance' }])
        });
      });
    });
    toast('Relance enregistr\u00e9e pour ' + num);
    jlog('Relance demande', num + ' (total ' + (nbRelances(d) + 1) + ')');
    refresh();
  }
  function tagTone(cls, txt) { return '<span class="dmx-tag ' + cls + '">' + txt + '</span>'; }

  /* ======================= LOT 3 — ÉCHÉANCIER ======================= */
  function etatEcheance(d) {
    if (d.statut === 'Pourvue' || d.statut === 'Annulee' || d.statut === 'Cl\u00f4tur\u00e9e') return { k: 'termine', lbl: labStatut(d.statut) };
    var db = pd(d.dateBesoin);
    if (!db) return { k: 'sans', lbl: 'sans \u00e9ch\u00e9ance' };
    var diff = Math.round((db.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (diff < 0) return { k: 'retard', lbl: 'retard ' + (-diff) + ' j', j: -diff };
    if (diff === 0) return { k: 'proche', lbl: 'aujourd\u2019hui', j: 0 };
    if (diff <= 7) return { k: 'proche', lbl: 'J+' + diff, j: diff };
    return { k: 'avenir', lbl: 'J+' + diff, j: diff };
  }
  function echeaStats() {
    var st = { retard: 0, proche: 0, avenir: 0, termine: 0, sans: 0, rel: 0 };
    data().forEach(function (x) {
      var e = etatEcheance(x);
      st[e.k]++;
      if (actifItem(x) && nbRelances(x)) st.rel++;
    });
    return st;
  }
  function updateEcheaBtn() {
    var b = $('[data-dmx="echea"]');
    if (!b) return;
    var st = echeaStats();
    var txt = '\u23f1 \u00c9ch\u00e9ancier' + (st.retard ? ' (' + st.retard + ')' : '');
    if (b.textContent !== txt) b.textContent = txt;
  }
  function closeEcheancier() { var b = $('[data-dmx="eback"]'); if (b) b.remove(); }
  function openEcheancier() {
    if ($('[data-dmx="eback"]')) { closeEcheancier(); return; }
    closeMenus();
    jlog('\u00c9ch\u00e9ancier demandes', 'ouverture');
    var back = document.createElement('div');
    back.className = 'dmx-aback';
    back.setAttribute('data-dmx', 'eback');
    back.innerHTML = '<div class="dmx-apanel dmx-epanel" role="dialog" aria-modal="true" aria-label="\u00c9ch\u00e9ancier des demandes">' +
      '<div class="dmx-ahead"><div><h3>\u23f1 \u00c9ch\u00e9ancier — Demandes</h3>' +
      '<div class="dmx-asub">Regroup\u00e9es par mois de \u00ab Date Besoin \u00bb \u00b7 g\u00e9n\u00e9r\u00e9 le ' + new Date().toLocaleString('fr-FR') + '</div></div>' +
      '<button type="button" class="dmx-aclose" aria-label="Fermer l\u2019\u00e9ch\u00e9ancier">\u2715</button></div>' +
      '<div class="dmx-abody" data-dmx="ebody"></div></div>';
    function onKey(e) { if (e.key === 'Escape') { closeEcheancier(); document.removeEventListener('keydown', onKey); } }
    back.addEventListener('click', function (e) {
      if (e.target === back) { closeEcheancier(); document.removeEventListener('keydown', onKey); return; }
      var t = e.target;
      var chip = t.closest && t.closest('.dmx-echip');
      if (chip) { ECH_FILTRE = chip.getAttribute('data-f') || ''; renderEcheancier(); return; }
      var rlb = t.closest && t.closest('[data-rel]');
      if (rlb) { relancer(rlb.getAttribute('data-rel')); renderEcheancier(); return; }
      if (t.getAttribute && t.getAttribute('data-act') === 'cfgsave') {
        var vals = {};
        $$('input[data-cfg]', back).forEach(function (inp) { vals[inp.getAttribute('data-cfg')] = inp.value; });
        ecrireCfg(vals);
        renderEcheancier();
        return;
      }
      var row = t.closest && t.closest('.dmx-aline.dmx-click');
      if (row && row.getAttribute('data-num')) {
        var x = byNumero(row.getAttribute('data-num'));
        if (x) { var a = api(); a && a.openDetail(x); }
        closeEcheancier();
        document.removeEventListener('keydown', onKey);
      }
    });
    back.querySelector('.dmx-aclose').addEventListener('click', function () { closeEcheancier(); document.removeEventListener('keydown', onKey); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    renderEcheancier();
  }
  function renderEcheancier() {
    var body = $('[data-dmx="ebody"]');
    if (!body) return;
    var d = data();
    var st = echeaStats();
    var filtres = [['', 'Toutes'], ['retard', 'En retard'], ['proche', '\u2264 7 j'], ['rel', '\ud83d\udd14 Relanc\u00e9es']];
    var chips = filtres.map(function (f) {
      return '<button type="button" class="dmx-echip" data-f="' + f[0] + '" aria-pressed="' + (ECH_FILTRE === f[0] ? 'true' : 'false') + '">' + f[1] + '</button>';
    }).join('');
    var rows = d.map(function (x) { return { x: x, e: etatEcheance(x) }; }).filter(function (p) {
      if (ECH_FILTRE === '') return true;
      if (ECH_FILTRE === 'rel') return actifItem(p.x) && nbRelances(p.x) > 0;
      return p.e.k === ECH_FILTRE;
    });
    var groupes = {}; var ordre = [];
    rows.forEach(function (p) {
      var db = pd(p.x.dateBesoin);
      var key = db ? ('m' + db.getFullYear() + '-' + ('0' + (db.getMonth() + 1)).slice(-2)) : 'sans';
      if (!groupes[key]) {
        groupes[key] = { lbl: db ? db.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Sans \u00e9ch\u00e9ance', items: [], ts: db ? db.getTime() : -1 };
        ordre.push(key);
      }
      groupes[key].items.push(p);
    });
    ordre.sort(function (a, b) { return groupes[a].ts - groupes[b].ts; });
    var TAGS = { retard: ['crit', 'En retard'], proche: ['warn', 'Imminent'], avenir: ['ok', '\u00c0 venir'], termine: ['muted', 'Sold\u00e9e'], sans: ['muted', '\u2014'] };
    var html = '<div class="dmx-akpis">' +
      '<div class="dmx-akpi"><div class="l">En retard</div><div class="v' + (st.retard ? ' red' : '') + '">' + st.retard + '</div></div>' +
      '<div class="dmx-akpi"><div class="l">\u00c9ch\u00e9ance \u2264 7 j</div><div class="v' + (st.proche ? ' amber' : '') + '">' + st.proche + '</div></div>' +
      '<div class="dmx-akpi"><div class="l">\u00c0 venir</div><div class="v">' + st.avenir + '</div></div>' +
      '<div class="dmx-akpi"><div class="l">Relanc\u00e9es</div><div class="v">' + st.rel + '</div></div>' +
      '</div>' +
      '<div class="dmx-echips">' + chips + '</div>';
    if (!rows.length) {
      html += '<div class="dmx-aempty">Aucune demande dans ce filtre.</div>';
    } else {
      ordre.forEach(function (k) {
        var g = groupes[k];
        html += '<div class="dmx-egroup">' + g.lbl.charAt(0).toUpperCase() + g.lbl.slice(1) + ' \u00b7 ' + g.items.length + '</div>';
        g.items.sort(function (p, q) { return (p.e.j || 0) - (q.e.j || 0); }).forEach(function (p) {
          var tg = TAGS[p.e.k] || TAGS.sans;
          var dt = p.x.dateBesoin ? ' \u00b7 besoin : <b>' + p.x.dateBesoin + '</b>' + (p.e.lbl && p.e.k !== 'sans' ? ' (' + p.e.lbl + ')' : '') : '';
          var rl = nbRelances(p.x) ? tagTone('info', '\ud83d\udd14 ' + nbRelances(p.x)) : '';
          var btnRel = actifItem(p.x) ? '<button type="button" class="dmx-go" data-rel="' + p.x.numero + '">\ud83d\udd14 Relancer</button>' : '';
          html += '<div class="dmx-aline dmx-click" data-num="' + p.x.numero + '">' +
            tagTone(tg[0], tg[1]) + '<b>' + p.x.numero + '</b><span>' + (p.x.posteRecherche || '') + dt + '</span>' + rl +
            (p.e.k !== 'termine' ? tagTone('muted', labStatut(p.x.statut)) : '') +
            '<button type="button" class="dmx-go" data-num="' + p.x.numero + '">Ouvrir</button>' + btnRel + '</div>';
        });
      });
    }
    html += '<div class="dmx-asect">\u2699 R\u00e9glages — cible ISO configurable</div>' +
      '<div class="dmx-ecfg">' +
      '<label>Cible critique <input type="number" min="5" max="365" value="' + CFG.iso + '" data-cfg="iso"> j</label>' +
      '<label>Vigilance \u2264 <input type="number" min="1" max="364" value="' + CFG.vig + '" data-cfg="vig"> j</label>' +
      '<label>Relance apr\u00e8s <input type="number" min="1" max="180" value="' + CFG.rel + '" data-cfg="rel"> j</label>' +
      '<button type="button" class="dmx-abtn" data-act="cfgsave">Enregistrer</button>' +
      '<span class="dmx-ecfgnote">Propag\u00e9 \u00e0 l\u2019analyse, \u00e0 l\u2019\u00e9ch\u00e9ancier et \u00e0 la banni\u00e8re ISO (ADEM_V9) \u00b7 enregistr\u00e9 localement</span>' +
      '</div>';
    body.innerHTML = html;
  }

  /* ======================= LOT 3 — JOURNAL D'ACTIVITÉ ======================= */
  function journalRows() {
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.read === 'function') return window.__ADMINA_AUDIT__.read() || [];
      return JSON.parse(localStorage.getItem('admina_journal') || '[]');
    } catch (e) { return []; }
  }
  function closeJournal() { var b = $('[data-dmx="jback"]'); if (b) b.remove(); }
  function openJournal() {
    if ($('[data-dmx="jback"]')) { closeJournal(); return; }
    closeMenus();
    JQ = '';
    jlog('Journal d\u2019activit\u00e9 demandes', 'ouverture');
    var back = document.createElement('div');
    back.className = 'dmx-aback';
    back.setAttribute('data-dmx', 'jback');
    back.innerHTML = '<div class="dmx-apanel dmx-jpanel" role="dialog" aria-modal="true" aria-label="Journal d\u2019activit\u00e9">' +
      '<div class="dmx-ahead"><div><h3>\u2691 Journal d\u2019activit\u00e9</h3>' +
      '<div class="dmx-asub">Toutes les actions trac\u00e9es sur les demandes \u00b7 stock\u00e9es localement (200 derni\u00e8res)</div></div>' +
      '<button type="button" class="dmx-aclose" aria-label="Fermer le journal">\u2715</button></div>' +
      '<div class="dmx-abody">' +
        '<div class="dmx-jtools">' +
          '<input type="search" class="dmx-jsearch" data-dmx="jsearch" placeholder="Filtrer le journal\u2026" value="" aria-label="Filtrer le journal">' +
          '<button type="button" class="dmx-abtn" data-act="jexport">Exporter (JSON)</button>' +
          '<button type="button" class="dmx-abtn danger" data-act="jclear">Vider</button>' +
          '<span class="dmx-jcount"></span>' +
        '</div>' +
        '<div class="dmx-jlist" data-dmx="jlist"></div>' +
      '</div></div>';
    function onKey(e) { if (e.key === 'Escape') { closeJournal(); document.removeEventListener('keydown', onKey); } }
    back.addEventListener('click', function (e) {
      if (e.target === back) { closeJournal(); document.removeEventListener('keydown', onKey); return; }
      var t = e.target;
      if (t.getAttribute && t.getAttribute('data-act') === 'jclear') {
        if (!window.confirm('Effacer tout le journal d\u2019activit\u00e9 ?')) return;
        try { localStorage.setItem('admina_journal', '[]'); } catch (e2) {}
        jlog('Journal d\u2019activit\u00e9 demandes', 'vid\u00e9');
        renderJournal();
        return;
      }
      if (t.getAttribute && t.getAttribute('data-act') === 'jexport') {
        var rows = journalRows();
        dl(new Blob([JSON.stringify({ application: 'Admina-RH — Journal d\u2019activit\u00e9 (Demandes)', exporte: new Date().toISOString(), entrees: rows }, null, 2)], { type: 'application/json' }), 'journal_activite.json');
        toast('Journal export\u00e9 (JSON)');
        return;
      }
    });
    back.addEventListener('input', function (e) {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-dmx') === 'jsearch') {
        JQ = e.target.value || '';
        renderJournal();
      }
    });
    back.querySelector('.dmx-aclose').addEventListener('click', function () { closeJournal(); document.removeEventListener('keydown', onKey); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    renderJournal();
  }
  function renderJournal() {
    var body = $('[data-dmx="jlist"]');
    if (!body) return;
    var rows = journalRows();
    var q = norm(JQ);
    if (q) rows = rows.filter(function (r) { return norm((r.action || '') + ' ' + (r.detail || '') + ' ' + (r.role || '')).indexOf(q) >= 0; });
    var list = rows.map(function (r) {
      var h = '?';
      try { h = new Date(r.time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (e) {}
      return '<div class="dmx-jrow"><span class="dmx-jtime">' + h + '</span>' +
        '<span class="dmx-jact">' + (r.action || '') + '</span>' +
        '<span class="dmx-jdet">' + (r.detail || '') + '</span>' +
        '<span class="dmx-jrole">' + (r.role || '') + '</span></div>';
    }).join('');
    var cnt = $('.dmx-jcount');
    if (cnt) cnt.textContent = rows.length + ' entr\u00e9e(s)';
    body.innerHTML =
      '<div class="dmx-jhead dmx-jrow"><span class="dmx-jtime">Quand</span><span class="dmx-jact">Action</span><span class="dmx-jdet">D\u00e9tail</span><span class="dmx-jrole">R\u00f4le</span></div>' +
      (list || '<div class="dmx-aempty">Aucune entr\u00e9e' + (q ? ' pour cette recherche' : '') + '.</div>');
  }

  /* ======================= LOT 3 — HÉRO (harmonisation /offres) ======================= */
  function buildHero() {
    var root = conteneurRacine();
    if (!root) return;
    var hero = $('[data-dmx="hero"]');
    if (!hero) {
      hero = document.createElement('section');
      hero.className = 'dmx-hero';
      hero.setAttribute('data-dmx', 'hero');
      root.insertBefore(hero, root.firstChild);
      var h5 = root.querySelector('h5');
      if (h5 && !h5.hasAttribute('data-dmx-hide')) {
        h5.setAttribute('data-dmx-hide', '1');
        h5.setAttribute('data-dmx-olddisp', h5.style.display || '');
        h5.style.display = 'none';
      }
    }
    refreshHero();
  }
  function refreshHero() {
    var hero = $('[data-dmx="hero"]');
    if (!hero) return;
    var d = data();
    var actifs = d.filter(actifItem).length;
    var st = echeaStats();
    var fav = favList().length;
    var h =
      '<div class="dmx-hrow">' +
        '<h2>Demandes de Recrutement <span class="dmx-hbadge">ISO 9001 · 30401</span></h2>' +
        '<div class="dmx-hstats">' +
          '<div class="dmx-hstat"><b>' + d.length + '</b><span>demandes</span></div>' +
          '<div class="dmx-hstat"><b>' + actifs + '</b><span>actives</span></div>' +
          '<div class="dmx-hstat"><b' + (st.retard ? ' class="dmx-hwarn"' : '') + '>' + st.retard + '</b><span>en retard</span></div>' +
          '<div class="dmx-hstat"><b>' + fav + '</b><span>favoris</span></div>' +
        '</div>' +
      '</div>' +
      '<p>Pilotez les demandes, leurs \u00e9ch\u00e9ances et la passerelle vers les offres — mis à jour en direct.</p>';
    if (hero.__h !== h) { hero.__h = h; hero.innerHTML = h; }
  }

  /* ======================= LOT 2 — RACCOURCIS CLAVIER ======================= */
  function helpOpen() { return !!$('[data-dmx="help"]'); }
  function closeHelp() { var h = $('[data-dmx="help"]'); if (h) h.remove(); }
  function focusRecherche() {
    var q = $('#adem2-bar .adem2-q') || $('input[placeholder*="Recherch"]');
    if (q) { q.focus(); q.select && q.select(); }
  }
  function nouvelleDemande() {
    var b = $$('button').filter(function (x) { return /nouvelle\s+demande/i.test(x.textContent || '') && x.offsetWidth > 0; })[0];
    if (b) { b.click(); return; }
    try { window.__ADEM_V8__ && window.__ADEM_V8__.open({ mode: 'new' }); } catch (e) {}
  }
  function vueK(mode) {
    var rx = mode === 'kanban' ? /kanban/i : /tableau/i;
    var b = $$('button').filter(function (x) { return rx.test(x.textContent || '') && x.offsetWidth > 0; })[0];
    if (b) { b.click(); toast(mode === 'kanban' ? 'Vue Kanban' : 'Vue tableau'); }
  }
  function openHelp() {
    closeMenus();
    if (helpOpen()) { closeHelp(); return; }
    var h = document.createElement('div');
    h.className = 'dmx-help';
    h.setAttribute('data-dmx', 'help');
    h.innerHTML = '<div class="dmx-hpanel" role="dialog" aria-modal="true" aria-label="Raccourcis clavier des demandes">' +
      '<h3>Raccourcis clavier \u2014 Demandes</h3><table>' +
      '<tr><td><span class="dmx-kbd">/</span> ou <span class="dmx-kbd">Ctrl K</span></td><td>Rechercher</td></tr>' +
      '<tr><td><span class="dmx-kbd">N</span></td><td>Nouvelle demande</td></tr>' +
      '<tr><td><span class="dmx-kbd">A</span></td><td>Analyse intelligente</td></tr>' +
      '<tr><td><span class="dmx-kbd">E</span></td><td>Menu d\u2019export (Excel / JSON / Copier / PDF)</td></tr>' +
      '<tr><td><span class="dmx-kbd">I</span></td><td>Importer un fichier (JSON / CSV)</td></tr>' +
      '<tr><td><span class="dmx-kbd">F</span></td><td>Filtre favoris</td></tr>' +
      '<tr><td><span class="dmx-kbd">C</span></td><td>\u00c9ch\u00e9ancier &amp; r\u00e9glages de la cible ISO</td></tr>' +
      '<tr><td><span class="dmx-kbd">J</span></td><td>Journal d\u2019activit\u00e9</td></tr>' +
      '<tr><td><span class="dmx-kbd">1</span> / <span class="dmx-kbd">2</span></td><td>Vue tableau / Kanban</td></tr>' +
      '<tr><td><span class="dmx-kbd">?</span></td><td>Cette aide</td></tr>' +
      '<tr><td><span class="dmx-kbd">\u00c9chap</span></td><td>Fermer / effacer la s\u00e9lection</td></tr>' +
      '</table>' +
      '<div style="margin-top:10px;font-size:.72rem;color:#78848e">S\u00e9lection multiple : cochez les lignes \u2192 barre d\u2019actions group\u00e9es (statut, favoris, export Excel). \u00c9toile \u2605 = favori, conserv\u00e9 entre les sessions. \ud83d\udd14 Relancer = trace la relance dans l\u2019historique et le journal. R\u00e9glages de la cible ISO dans l\u2019\u00e9ch\u00e9ancier (touche C).</div>' +
      '<div class="dmx-hfoot"><button type="button" class="dmx-hclose">Fermer</button></div></div>';
    document.body.appendChild(h);
    h.addEventListener('click', function (e) {
      if (e.target === h || (e.target.closest && e.target.closest('.dmx-hclose'))) closeHelp();
    });
    var b = $('.dmx-hclose', h);
    b && b.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (!active) return;
    var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '') || e.target.isContentEditable;
    if (e.key === 'Escape') {
      if (helpOpen()) { closeHelp(); return; }
      if ($('.dmx-menu')) { closeMenus(); return; }
      if ($('[data-dmx="aback"]')) { closeAnalyse(); return; }
      if ($('[data-dmx="eback"]')) { closeEcheancier(); return; }
      if ($('[data-dmx="jback"]')) { closeJournal(); return; }
      if (selNums().length) { SEL = {}; refreshBulk(); refresh(); }
      return;
    }
    if (inField) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); focusRecherche(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = (e.key || '').toLowerCase();
    if (e.key === '/') { e.preventDefault(); focusRecherche(); return; }
    if (e.key === '?') { openHelp(); return; }
    if (k === 'n') { nouvelleDemande(); return; }
    if (k === 'a') { openAnalyse(); return; }
    if (k === 'e') {
      var eb = $('[data-dmx="export"]');
      if (eb) { var r = eb.getBoundingClientRect(); openExportMenu(r.left, r.bottom + 6); }
      return;
    }
    if (k === 'i') { var fi = $('[data-dmx="file"]'); fi && fi.click(); return; }
    if (k === 'f') { basculerFavOnly(); return; }
    if (k === 'c') { openEcheancier(); return; }
    if (k === 'j') { openJournal(); return; }
    if (e.key === '1') { vueK('tableau'); return; }
    if (e.key === '2') { vueK('kanban'); return; }
  });

  /* ======================= repères DOM ======================= */
  function conteneurRacine() {
    var hs = $$('h5, h1, [class*="MuiTypography-h5"]');
    for (var i = 0; i < hs.length; i++) {
      if (/demandes de recrutement/i.test(hs[i].textContent || '')) return hs[i].parentElement;
    }
    return null;
  }

  /* ======================= rafraîchissement global ======================= */
  function refresh() {
    if (!active) return;
    clearTimeout(refreshT);
    refreshT = setTimeout(function () {
      if (!restored) restaurer();
      if (restored && lastRestoreInfo) noticeRestauration(lastRestoreInfo.n, lastRestoreInfo.hh);
      buildToolbar();
      attachSort();
      enhanceDrawer();
      kanbanHint();
      enhanceRows();
      enhanceKanbanFavs();
      syncSelAll();
      refreshBulk();
      updateFavBtn();
      buildHero();
      updateEcheaBtn();
      if ($('[data-dmx="eback"]')) renderEcheancier();
    }, 80);
  }

  /* ======================= activation / désactivation ======================= */
  function activate() {
    if (active) return;
    active = true;
    restored = false;
    html.classList.add('admina-dmx');
    refresh();
    clearInterval(pollT);
    pollT = setInterval(poller, 1200);
    mo = new MutationObserver(function (muts) {
      for (var mi = 0; mi < muts.length; mi++) {
        var t = muts[mi].target;
        if (t && t.nodeType === 1 && t.closest && t.closest('[data-dmx]')) continue;
        refresh(); return;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    /* restauration : le composant React peut monter après — réessais */
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (!active) { clearInterval(iv); return; }
      var a = api();
      if (a && a.data && a.data.length) { restaurer(); clearInterval(iv); }
      else if (tries > 60) clearInterval(iv);
    }, 300);
  }
  function deactivate() {
    if (!active) return;
    active = false;
    html.classList.remove('admina-dmx');
    if (mo) { mo.disconnect(); mo = null; }
    clearInterval(pollT); clearInterval(refreshT); clearTimeout(refreshT);
    $$('[data-dmx]').forEach(function (el) { el.remove(); });
    $$('[data-dmx-hide]').forEach(function (el) {
      el.style.display = el.getAttribute('data-dmx-olddisp') || '';
      el.removeAttribute('data-dmx-hide');
      el.removeAttribute('data-dmx-olddisp');
    });
    $$('.dmx-favhide').forEach(function (el) { el.classList.remove('dmx-favhide'); });
    $$('tr[data-dmx-sel]').forEach(function (tr) { tr.removeAttribute('data-dmx-sel'); });
    SEL = {};
    $$('th[data-dmx-sortable]').forEach(function (th) {
      th.removeAttribute('data-dmx-sortable');
      th.removeAttribute('data-dmx-key');
      th.removeAttribute('data-dmx-dir');
      th.removeAttribute('aria-sort');
      th.removeAttribute('tabindex');
      th.removeAttribute('title');
      var sp = $('.dmx-sort', th);
      if (sp) sp.remove();
      th.onclick = null; th.onkeydown = null;
    });
  }
  function isOn() {
    if (DM_RE.test(location.pathname)) return true;
    var m = (location.hash || '').match(/adem_r=([^&]+)/);
    if (m) { try { return DM_RE.test(decodeURIComponent(m[1])); } catch (e) {} }
    return false;
  }

  /* ======================= démarrage ======================= */
  if (isOn()) activate();
  clearInterval(tickT);
  tickT = setInterval(function () {
    var on = isOn();
    if (on && !active) activate();
    else if (!on && active) deactivate();
  }, 350);
  window.addEventListener('popstate', function () {
    var on = isOn();
    if (on && !active) activate();
    else if (!on && active) deactivate();
  });
  /* flush de sécurité : dernière écriture avant de quitter */
  window.addEventListener('pagehide', function () {
    if (active && restored && api() && api().data && api().data.length) ecrireSnapshot(api().data);
  });
})();
