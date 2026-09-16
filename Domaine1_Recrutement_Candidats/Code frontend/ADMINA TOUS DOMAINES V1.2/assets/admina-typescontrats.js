/* ==========================================================================
   admina-typescontrats.js — v1.0-w4 (W4-b) — module additif /types-de-contrats
   --------------------------------------------------------------------------
   Canon Admina-RH « additif sur natif » : ce module N'AUCUNE dépendance hors
   le chunk natif déjà patché (window.__ADMINA_TCT_API__ v1.0-w4) et ne modifie
   AUCUN fichier natif. Tout le rendu vit sous un préfixe unique : tct-.

   PHILOSOPHIE DE LA PAGE (verbatim) :
   « LE CADRE JURIDIQUE — Cette page n'est pas une liste : c'est la bibliothèque
   de règles qui donne du sens à chaque contrat signé. Chaque type de contrat est
   un cadre avec des LIMITES (durée maximale, rupture possible ou non) et des
   COÛTS (avantages légaux, charges). Bien choisir son type, c'est engager sans
   se surprendre : un CDD qui se renouvelle au-delà de sa durée max devient
   juridiquement fragile, un type non utilisé est un cadre mort. Ici on lit le
   portefeuille contractuel À TRAVERS ses règles : répartition, concentrations,
   garde-fous. »
   (Cette page a peu de lignes — la richesse est dans l'ANALYSE DES RÈGLES,
   pas dans la table.)

   Pont optionnel : window.__ADMINA_CTR_API__?.getData?.()?.contrats (page
   suivi-contrats) — lecture silencieuse try/catch, croise les contrats actifs
   réels (comptage par typeContrat) avec les nbContrats déclarés.

   ARCHITECTURE (14 sections) : constantes/état · utilitaires (esc, journal,
   toasts, dark) · normalisation + pont API/LS/snapshot · métriques & alertes
   AAA · filtres/tri/pagination · détection du chemin (regex + 350 ms +
   popstate) · flux subscribe + poller 1200 ms · construction UI sous le titre
   natif · rendu global (héro, alertes, KPI, graphiques SVG) · VUE SIGNATURE
   « Répartition & Limites » (barres ∝ nbContrats, badges, garde-fous) ·
   table triable aria-sort + pager + sélection · actions (fiche drawer,
   dialogues validés, duplication, suppression groupée, seuils, export CSV) ·
   raccourcis clavier · interface publique __ADMINA_TCT_UI__ + démarrage.
   ========================================================================== */
(function () {
  'use strict';

  /* Garde anti-double-injection (canon) : le flag est posé en FIN d'init. */
  if (window.__ADMINA_TCT_W4__) return;

  /* ========================================================================
     1. CONSTANTES & ÉTAT
     -----------------------------------------------------------------------
     Un préfixe unique : tct- (classes CSS, ids, attributs data-tct-*).
     Les seules clés LS touchées sont celles du module + le journal partagé
     et le drapeau de thème du shell. La détection du chemin est une REGEX
     stricte sur location.pathname (jamais indexOf — piège des routes
     similaires), réévaluée toutes les 350 ms et au popstate.
     ======================================================================== */
  var PAGE_RE = /\/types-de-contrats\/?$/;           // détection stricte du chemin (PAS includes)
  var LS_DATA = 'admina-typescontrats-data';         // LS natif du chunk patché {types:[...]}
  var LS_SEUILS = 'admina-typescontrats-seuils';     // seuils d'analyse persistés {concentration}
  var LS_JOURNAL = 'admina_journal';                 // journal partagé Admina-RH (max 500)
  var LS_DARK = 'admina-dark';                       // mode sombre global du shell
  var API_TRIES = 30, API_WAIT = 450;                // pont API : 30 essais × 450 ms
  var POLL_MS = 1200;                                // poller de re-lecture fraîche
  var DETECT_MS = 350;                               // réévaluation du chemin
  var PER_PAGE = 8;                                  // pagination table
  var DUREES = ['Indéterminée', '6 mois', '18 mois', '24 mois', '36 mois', 'Selon mission'];
  var COULEURS = {
    CDI: '#2563eb', CDD: '#7c3aed', Stage: '#0891b2',
    Interim: '#d97706', Alternance: '#059669', Freelance: '#dc2626'
  };

  /* Snapshot démo embarqué (miroir exact du chunk natif, secours ultime). */
  var SNAPSHOT = [
    { id: 1, type: 'CDI', description: 'Contrat à Durée Indéterminée', dureeMax: 'Indéterminée', rupturePossible: 'Oui', avantages: 'Préavis 3 mois, congés payés, CNPS', nbContrats: 12 },
    { id: 2, type: 'CDD', description: 'Contrat à Durée Déterminée', dureeMax: '24 mois', rupturePossible: 'Non', avantages: 'Préavis 1 mois, CNPS, prime de précarité 10%', nbContrats: 8 },
    { id: 3, type: 'Stage', description: 'Convention de stage', dureeMax: '6 mois', rupturePossible: 'Oui', avantages: 'Indemnité de stage, pas de CNPS', nbContrats: 5 },
    { id: 4, type: 'Interim', description: 'Contrat de travail temporaire', dureeMax: '18 mois', rupturePossible: 'Oui', avantages: 'Majoration de 10%, prime de reprise', nbContrats: 3 },
    { id: 5, type: 'Alternance', description: "Contrat d'alternance ou apprentissage", dureeMax: '36 mois', rupturePossible: 'Non', avantages: 'Exonération charges partielles, tutorat', nbContrats: 2 },
    { id: 6, type: 'Freelance', description: 'Prestation de services', dureeMax: 'Selon mission', rupturePossible: 'Oui', avantages: 'Facturation libre, pas de charges patronales', nbContrats: 1 }
  ];

  var state = {
    active: false, masque: false, api: null, source: 'snapshot',
    types: [], signature: '', unsub: null, pollTimer: null, detTimer: null,
    vue: 'sig',                                     // VUE SIGNATURE par défaut : Répartition & Limites
    search: '', filtreType: '', filtreRupture: 'tous', filtreDuree: 'tous', filtreSpecial: '',
    sortKey: 'type', sortDir: 'asc', page: 1,
    sel: null,                                      // Set d'ids sélectionnés
    dlg: null, pendingDelete: null, drawerId: null,
    seuils: { concentration: 50 },
    els: {}
  };

  /* ========================================================================
     2. UTILITAIRES
     -----------------------------------------------------------------------
     Tout libellé affiché passe par esc() : les textes sont saisis par les RH
     (types, descriptions, avantages) — aucune injection possible. Le journal
     (LS admina_journal, role 'RH', max 500) et le pont facultatif
     __ADMINA_AUDIT__ tracent chaque mutation sans jamais bloquer la page :
     toute erreur est absorbée en try/catch — l'ANALYSE ne doit jamais casser
     la lecture des règles.
     ======================================================================== */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtInt(n) { n = Number(n) || 0; try { return n.toLocaleString('fr-FR'); } catch (e) { return String(n); } }
  function pctTxt(p) { var v = Math.round((Number(p) || 0) * 10) / 10; return String(v).replace('.', ',') + ' %'; }
  function resume(s, n) { s = String(s == null ? '' : s); n = n || 64; return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function s_(n) { return n > 1 ? 's' : ''; }
  function lireLS(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ecrireLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function lsBrut(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function couleurType(nom) {
    if (COULEURS[nom]) return COULEURS[nom];
    var h = 0, i, s = String(nom || '?');
    for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return 'hsl(' + h + ' 62% 45%)';
  }

  /* Lecture des règles : chaque type est résumé par une phrase « cadre »
     qui rend la limite lisible hors table (fiche type + récap copiable). */
  function decrireRegle(t) {
    var duree = t.dureeMax === 'Indéterminée'
      ? 'sans borne de durée (Indéterminée)'
      : 'borné à ' + t.dureeMax;
    var rupt = t.rupturePossible === 'Oui'
      ? 'rompre est possible (cadre flexible, ajustable en cours de vie)'
      : 'rompre est impossible (engagement fort : aller au terme, sinon requalification)';
    var cout = t.avantages ? t.avantages : 'aucun avantage légal renseigné';
    return t.type + ' (' + t.description + ') : cadre ' + duree + ', ' + rupt +
      '. Coûts/avantages : ' + cout + '. Portée actuelle : ' + t.nbContrats + ' contrat' + (t.nbContrats > 1 ? 's' : '') + '.';
  }

  /* Récapitulatif texte d'un type — bouton « Copier » de la fiche. */
  function recapitulatifTxt(t, m) {
    var p = m.total > 0 ? (t.nbContrats / m.total * 100) : 0;
    return decrireRegle(t) + ' Poids : ' + pctTxt(p) + ' du portefeuille (' + fmtInt(m.total) + ' contrats).';
  }
  function copierRecap(id) {
    var f = trouverFrais(id);
    if (!f) { toast('Type introuvable.', 'err'); return; }
    var txt = recapitulatifTxt(f.t, calculerMetriques());
    var ok = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(txt);
        ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) {
      try {
        var ta = document.createElement('textarea');
        ta.value = txt;
        ta.setAttribute('readonly', 'readonly');
        ta.className = 'tct-sr';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok = true;
      } catch (e) { ok = false; }
    }
    if (ok) { toast('Récapitulatif copié.', 'ok'); journal('copie', 'fiche ' + f.t.type); }
    else toast('Copie impossible dans ce navigateur.', 'err');
  }

  /* Bloc « méthode de lecture » de la vue signature — repliable.
     Il explicite la philosophie de la page : LIMITES d'abord, poids ensuite,
     COÛTS enfin, cadres morts et garde-fous pour refermer. */
  function blocMethode() {
    return '<details class="tct-methode">' +
      '<summary class="tct-methode-s">Méthode de lecture — comment lire ce portefeuille À TRAVERS ses règles</summary>' +
      '<div class="tct-methode-b">' +
      '<p><strong>1. La limite d\'abord.</strong> Chaque bloc porte la durée max et le régime de rupture : c\'est l\'ossature juridique. Une barre longue sous une durée courte = beaucoup d\'engagements qui devront tous être renouvelés ou transformés à échéance proche.</p>' +
      '<p><strong>2. Le poids ensuite.</strong> Le % du portefeuille situe la dépendance : au-delà du seuil de concentration (' + state.seuils.concentration + ' %, réglable via K), un seul cadre porte l\'essentiel des effectifs — la bascule de toute la politique RH tient à un type.</p>' +
      '<p><strong>3. Les coûts enfin.</strong> Les avantages légaux (préavis, primes, charges, CNPS) sont le prix du cadre : un type peu coûteux mais non utilisé est un levier oublié ; un type coûteux et dominant mérite une revue.</p>' +
      '<p><strong>4. Les cadres morts.</strong> Le badge RARE signale un type sans contrat : cadre non utilisé = règle qui ne sert personne — à relancer ou à retirer de la bibliothèque.</p>' +
      '<p><strong>5. Les garde-fous.</strong> La section basse sépare les engagements forts (rupture impossible) des cadres flexibles : c\'est là qu\'on vérifie qu\'un renouvellement ne fait pas passer un CDD au-delà de sa borne — au risque de la requalification.</p>' +
      '</div></details>';
  }

  function journal(action, detail) {
    try {
      var j = lireLS(LS_JOURNAL, []);
      if (!Array.isArray(j)) j = [];
      j.unshift({ time: new Date().toISOString(), action: String(action || ''), detail: String(detail || ''), role: 'RH' });
      if (j.length > 500) j = j.slice(0, 500);
      ecrireLS(LS_JOURNAL, j);
    } catch (e) { /* journal jamais bloquant */ }
    try {
      if (window.__ADMINA_AUDIT__ && typeof window.__ADMINA_AUDIT__.log === 'function') {
        window.__ADMINA_AUDIT__.log(action, detail);
      }
    } catch (e) { /* pont audit optionnel */ }
  }

  function toast(msg, type) {
    var box = state.els.toasts;
    if (!box) return;
    var t = document.createElement('div');
    t.className = 'tct-toast' + (type ? ' tct-toast--' + type : '');
    t.setAttribute('role', 'status');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3800);
  }

  function appliquerDark() {
    var v = lsBrut(LS_DARK);
    var on = v === '1' || v === 'true' || v === 'on';
    document.documentElement.classList.toggle('admina-tct-dark', on);
  }

  /* ========================================================================
     3. NORMALISATION & PONT API (30×450 ms) → LS → snapshot
     -----------------------------------------------------------------------
     Résilience à trois étages : chunk natif patché (__ADMINA_TCT_API__ v1.0-w4),
     puis LS 'admina-typescontrats-data' (écritures de secours si setData
     échoue), puis snapshot démo embarqué. Une donnée absente ne casse jamais
     la page : elle réduit simplement la fraîcheur de la source.
     ======================================================================== */
  function normaliser(r) {
    if (!r || typeof r !== 'object') return null;
    var id = parseInt(r.id, 10); if (isNaN(id)) id = 0;
    var nb = parseInt(r.nbContrats, 10); if (isNaN(nb)) nb = 0;
    var type = String(r.type == null ? '' : r.type).trim();
    if (!type) type = 'Type ' + (id || '?');
    return {
      id: id,
      type: type,
      description: String(r.description == null ? '' : r.description),
      dureeMax: String(r.dureeMax || 'Indéterminée'),
      rupturePossible: (String(r.rupturePossible || 'Oui').toLowerCase() === 'non' ? 'Non' : 'Oui'),
      avantages: String(r.avantages == null ? '' : r.avantages),
      nbContrats: nb
    };
  }

  function chercherApi(reste, cb) {
    var api = window.__ADMINA_TCT_API__;
    if (api && typeof api.getData === 'function') { cb(api); return; }
    if (reste <= 0) { cb(null); return; }
    setTimeout(function () {
      if (!state.active) { cb(null); return; }   // désactivation propre entre deux essais
      chercherApi(reste - 1, cb);
    }, API_WAIT);
  }

  function lireData() {
    var api = state.api;
    if (api && typeof api.getData === 'function') {
      try {
        var d = api.getData();
        if (d && Array.isArray(d.types) && d.types.length) {
          state.source = 'api';
          return d.types.map(normaliser).filter(Boolean);
        }
      } catch (e) { /* silencieux, on descend d'un cran */ }
    }
    var ls = lireLS(LS_DATA, null);
    if (ls && Array.isArray(ls.types) && ls.types.length) {
      state.source = 'ls';
      return ls.types.map(normaliser).filter(Boolean);
    }
    state.source = 'snapshot';
    return SNAPSHOT.map(normaliser);
  }

  /* Écritures de secours LS si le pont setData est indisponible. */
  function secourirLS(types) {
    try { localStorage.setItem(LS_DATA, JSON.stringify({ types: types })); } catch (e) { }
  }
  function ecrireData(types) {
    var ok = false, api = state.api;
    if (api && typeof api.setData === 'function') {
      try { api.setData({ types: types }); ok = true; } catch (e) { ok = false; }
    }
    if (!ok) { secourirLS(types); state.source = 'ls'; }
    return ok;
  }

  /* Pont optionnel vers suivi-contrats — silencieux try/catch si absent. */
  function lireCtr() {
    try {
      var api = window.__ADMINA_CTR_API__;
      if (!api || typeof api.getData !== 'function') return null;
      var d = api.getData();
      if (!d || !Array.isArray(d.contrats)) return null;
      return d.contrats;
    } catch (e) { return null; }
  }
  function ctrActifs(contrats) {
    return contrats.filter(function (c) {
      if (!c || !c.typeContrat) return false;
      var st = c.statut == null ? '' : String(c.statut).toLowerCase();
      return st === '' || st === 'actif';
    });
  }

  /* ========================================================================
     4. MÉTRIQUES — le portefeuille lu À TRAVERS ses règles
     -----------------------------------------------------------------------
     Trois lectures empilées :
       · RÉPARTITION — qui porte quoi (nbContrats, % du portefeuille, maximum) ;
       · LIMITES    — durées max et régime de rupture (engagement vs flexibilité) ;
       · COÛTS      — avantages légaux et rattachements réels via le pont CTR.
     Les alertes AAA en dérivent : concentration > seuil, cadres morts,
     vigilance CDD/Alternance à rupture impossible, divergences déclarés/
     réels, durées courtes sur des types très utilisés. Rien n'est décoratif :
     chaque alerte est une porte d'entrée vers un filtre de la table.
     ======================================================================== */
  function calculerMetriques() {
    var types = state.types, i, t;
    var total = 0, maxN = 0;
    for (i = 0; i < types.length; i++) { total += types[i].nbContrats; if (types[i].nbContrats > maxN) maxN = types[i].nbContrats; }
    var dom = null, domP = 0, rares = [], imp = [], durees = {}, diverg = [];
    var ctrPar = {}, ctrTotal = 0;
    var contrats = lireCtr(), actifs = contrats ? ctrActifs(contrats) : null;

    for (i = 0; i < types.length; i++) {
      t = types[i];
      var p = total > 0 ? (t.nbContrats / total * 100) : 0;
      if (!dom || p > domP) { dom = t; domP = p; }
      if (t.nbContrats === 0) rares.push(t);
      if (t.rupturePossible === 'Non') imp.push(t);
      if (!durees[t.dureeMax]) durees[t.dureeMax] = { label: t.dureeMax, nbTypes: 0, nbContrats: 0 };
      durees[t.dureeMax].nbTypes++; durees[t.dureeMax].nbContrats += t.nbContrats;
    }
    if (actifs) {
      for (i = 0; i < actifs.length; i++) {
        var k = String(actifs[i].typeContrat);
        ctrPar[k] = (ctrPar[k] || 0) + 1;
        ctrTotal++;
      }
      for (i = 0; i < types.length; i++) {
        t = types[i];
        var reel = ctrPar[t.type] || 0;
        if (reel !== t.nbContrats) diverg.push({ type: t.type, declare: t.nbContrats, reel: reel });
      }
    }
    var utilises = types.length - rares.length;
    return {
      types: types, total: total, maxN: maxN,
      dom: dom, domP: domP, rares: rares, imp: imp, durees: durees,
      diverg: diverg, ctrPar: ctrPar, ctrTotal: ctrTotal, ctrPresent: !!actifs,
      utilises: utilises, usedPct: types.length ? (utilises / types.length * 100) : 0
    };
  }

  /* Alertes AAA — chacune cliquable et poussant vers un filtre de la table. */
  function calculerAlertes(m) {
    var al = [];
    if (m.dom && m.domP > state.seuils.concentration) {
      al.push({
        sev: 'crit', ico: '⛔',
        txt: 'Concentration : ' + m.dom.type + ' pèse ' + pctTxt(m.domP) + ' du portefeuille (seuil ' + state.seuils.concentration + ' %) — un cadre trop dominant est un risque.',
        act: function () { filtrerType(m.dom.type); }
      });
    }
    if (m.rares.length) {
      al.push({
        sev: 'warn', ico: '∅',
        txt: m.rares.length + ' type' + s_(m.rares.length) + ' sans aucun contrat (' + m.rares.map(function (t) { return t.type; }).join(', ') + ') — cadre mort : à relancer ou à retirer.',
        act: function () { state.filtreSpecial = 'sans'; allerTable(); }
      });
    }
    var vig = m.types.filter(function (t) { return (t.type === 'CDD' || t.type === 'Alternance') && t.rupturePossible === 'Non'; });
    if (vig.length) {
      al.push({
        sev: 'warn', ico: '⚖',
        txt: 'Vigilance : ' + vig.map(function (t) { return t.type + ' à rupture impossible (durée max ' + t.dureeMax + ')'; }).join(' ; ') + ' — engagement fort, renouveler au-delà de la durée max devient juridiquement fragile.',
        act: function () { state.filtreRupture = 'Non'; allerTable(); }
      });
    }
    if (m.ctrPresent) {
      if (m.diverg.length) {
        al.push({
          sev: 'warn', ico: '≠',
          txt: 'Divergence nbContrats déclarés vs contrats réels (suivi-contrats) : ' + m.diverg.map(function (d) { return d.type + ' ' + d.declare + ' déclarés / ' + d.reel + ' réels'; }).join(' ; ') + ' — ' + fmtInt(m.ctrTotal) + ' contrats actifs recensés.',
          act: function () { filtrerType(m.diverg[0].type); }
        });
      } else {
        al.push({
          sev: 'info', ico: '✓',
          txt: 'Recensement conforme : ' + fmtInt(m.ctrTotal) + ' contrats actifs recensés via suivi-contrats, cohérents avec les nbContrats déclarés.',
          act: function () { allerTable(); }
        });
      }
    }
    var courts = m.types.filter(function (t) {
      return t.dureeMax !== 'Indéterminée' && t.nbContrats > 0 && t.nbContrats >= Math.max(3, m.total * 0.15);
    });
    if (courts.length) {
      al.push({
        sev: 'info', ico: '⏳',
        txt: 'Durée max courte pour un type très utilisé : ' + courts.map(function (t) { return t.type + ' (' + t.dureeMax + ')'; }).join(', ') + ' — surveiller les échéances de renouvellement.',
        act: function () { filtrerType(courts[0].type); }
      });
    }
    return al;
  }

  /* ========================================================================
     5. FILTRES / TRI / PAGINATION
     -----------------------------------------------------------------------
     Les filtres sont les portes d'entrée des alertes, KPI et graphiques :
     un clic quelque part amène TOUJOURS à la même table filtrée. Le tri est
     francophone (localeCompare 'fr'), la pagination borne le DOM à 8 lignes.
     ======================================================================== */
  function appliquerFiltres(list) {
    var q = state.search.trim().toLowerCase();
    return list.filter(function (t) {
      if (state.filtreType && t.type !== state.filtreType) return false;
      if (state.filtreRupture !== 'tous' && t.rupturePossible !== state.filtreRupture) return false;
      if (state.filtreDuree !== 'tous' && t.dureeMax !== state.filtreDuree) return false;
      if (state.filtreSpecial === 'sans' && t.nbContrats !== 0) return false;
      if (state.filtreSpecial === 'utilises' && t.nbContrats === 0) return false;
      if (q && (t.type + ' ' + t.description + ' ' + t.avantages).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function trier(list) {
    var k = state.sortKey, dir = state.sortDir === 'desc' ? -1 : 1;
    return list.slice().sort(function (a, b) {
      var va = a[k], vb = b[k];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'fr') * dir;
    });
  }
  function resetFiltres() {
    state.search = ''; state.filtreType = ''; state.filtreRupture = 'tous';
    state.filtreDuree = 'tous'; state.filtreSpecial = ''; state.page = 1;
    var el;
    el = state.els.search; if (el) el.value = '';
    el = state.els.fRupture; if (el) el.value = 'tous';
    el = state.els.fDuree; if (el) el.value = 'tous';
    rafraichir(true);
  }
  function filtrerType(type) {
    state.filtreType = String(type || '');
    state.filtreSpecial = '';
    allerTable();
  }
  function allerTable() {
    state.vue = 'table';
    state.page = 1;
    rafraichir(true);
  }
  function prochainId(types) {
    var max = 0, i;
    for (i = 0; i < types.length; i++) if (types[i].id > max) max = types[i].id;
    return max + 1;
  }

  /* ========================================================================
     6. DÉTECTION DU CHEMIN — regex stricte, 350 ms + popstate, idempotent
     -----------------------------------------------------------------------
     Activation propre au montage, désactivation propre (timers, abonnements,
     DOM ajouté) à la sortie. Le module peut être masqué via le pied de page
     (« Voir la page native ») sans se re-monter tout seul tant que l'URL ne
     change pas.
     ======================================================================== */
  function pageCourante() { return PAGE_RE.test(location.pathname); }

  var dernierChemin = null;
  function evaluer() {
    /* Le masque « Voir la page native » persiste tant que le chemin ne change
       pas ; une vraie navigation (aller/retour) réarme la réactivation. */
    var chemin = location.pathname;
    var sur = PAGE_RE.test(chemin);
    var navigation = dernierChemin !== null && chemin !== dernierChemin;
    dernierChemin = chemin;
    if (sur) {
      if (state.active) return;                 // idempotence : jamais deux montages
      if (navigation) state.masque = false;
      if (!state.masque) activer();
    } else {
      if (state.active) desactiver();
      state.masque = false;
    }
  }

  function demarrer() {
    state.detTimer = setInterval(evaluer, DETECT_MS);
    window.addEventListener('popstate', evaluer);
    window.addEventListener('storage', function (e) {
      if (e && e.key === LS_DARK && state.active) appliquerDark();
    });
    evaluer();
  }

  function activer() {
    if (state.active) return;
    state.active = true;
    appliquerDark();
    document.documentElement.classList.add('admina-tct');
    if (!monterUI()) {
      // Le titre natif n'est pas encore dans le DOM : on retente au prochain tick.
      state.active = false;
      document.documentElement.classList.remove('admina-tct');
      return;
    }
    chercherApi(API_TRIES, function (api) {
      if (!state.active) return;
      state.api = api;
      brancherFlux();
      rafraichir(true);
    });
    brancherFlux(); // poller immédiat même si l'API tarde
    rafraichir(true);
    journal('activation', 'admina-typescontrats v1.0-w4 — /types-de-contrats');
  }

  function desactiver() {
    if (!state.active) return;
    state.active = false;
    if (state.unsub) { try { state.unsub(); } catch (e) { } state.unsub = null; }
    if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
    fermerDrawer(); fermerModals();
    var root = state.els.root;
    if (root && root.parentNode) root.parentNode.removeChild(root);
    document.querySelectorAll('.tct-host').forEach(function (n) { n.classList.remove('tct-host'); });
    var bg = state.els.burger;
    if (bg && bg.parentNode) bg.parentNode.removeChild(bg);
    var ts = state.els.toasts;
    if (ts && ts.parentNode) ts.parentNode.removeChild(ts);
    state.els = {};
    document.documentElement.classList.remove('admina-tct', 'admina-tct-dark');
    journal('desactivation', 'admina-typescontrats — sortie de /types-de-contrats');
  }

  /* ========================================================================
     7. FLUX DE DONNÉES — subscribe + poller 1200 ms, re-lecture fraîche
     -----------------------------------------------------------------------
     Le poller relit la source à intervalle régulier et ne re-rend que si la
     signature JSON a changé : coût nul en usage statique, réactivité réelle
     quand le chunk natif (ou un autre onglet) bouge. Les handlers relisent
     TOUJOURS lireData() avant de muter : aucun stale-closure possible.
     ======================================================================== */
  function brancherFlux() {
    if (!state.pollTimer) {
      state.pollTimer = setInterval(function () {
        if (!state.active) return;
        rafraichir(false);
      }, POLL_MS);
    }
    var api = state.api;
    if (api && typeof api.subscribe === 'function' && !state.unsub) {
      try {
        state.unsub = api.subscribe(function () {
          if (state.active) rafraichir(false);
        });
      } catch (e) { state.unsub = null; }
    }
  }

  function rafraichir(force) {
    if (!state.active || !state.els.root) return;
    var frais = lireData();
    var sig = JSON.stringify(frais);
    if (!force && sig === state.signature) return;
    state.types = frais;
    state.signature = sig;
    // purge des sélections disparues
    if (state.sel && state.sel.size) {
      var ids = {};
      frais.forEach(function (t) { ids[t.id] = true; });
      var avant = state.sel.size;
      Array.from(state.sel).forEach(function (id) { if (!ids[id]) state.sel.delete(id); });
      if (state.sel.size !== avant) journal('selection-purge', (avant - state.sel.size) + ' élément(s) disparu(s) de la sélection');
    } else if (!state.sel) {
      state.sel = new Set();
    }
    renderAll();
  }

  /* ========================================================================
     8. CONSTRUCTION DE L'UI (sous le titre natif)
     -----------------------------------------------------------------------
     Le squelette est monté une seule fois sous le titre natif ; un seul
     écouteur délégué par type d'événement (click / change / input / keydown).
     Les dialogues, la fiche et les toasts sont posés sur <body> pour passer
     au-dessus de tout empilement natif, et retirés proprement à la sortie.
     ======================================================================== */
  function findTitre() {
    var hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6,[class*="MuiTypography-h5"]'), i, txt;
    for (i = 0; i < hs.length; i++) {
      txt = (hs[i].textContent || '').toLowerCase();
      if (txt.indexOf('types de contrats') >= 0) return hs[i];
    }
    return null; /* le tick retentera : jamais de fallback (leçon W4 — drawer natif) */
  }

  function monterUI() {
    var titre = findTitre();
    if (!titre) return false;

    var root = document.createElement('section');
    root.className = 'tct-root';
    root.setAttribute('data-tct-module', 'typescontrats');
    root.setAttribute('aria-label', 'Analyse des types de contrats — le cadre juridique');
    root.innerHTML = [
      '<div class="tct-hero">',
      '  <p class="tct-hero-kicker">LE CADRE JURIDIQUE</p>',
      '  <h2 class="tct-hero-title">Types de contrats — Répartition &amp; Limites</h2>',
      '  <p class="tct-hero-line" id="tct-hero-line">Calcul du portefeuille…</p>',
      '  <div class="tct-hero-chips" id="tct-hero-chips"></div>',
      '</div>',
      '<div class="tct-alertes" id="tct-alertes" role="list" aria-label="Alertes sur les règles"></div>',
      '<div class="tct-kpis" id="tct-kpis" aria-label="Indicateurs du portefeuille"></div>',
      '<div class="tct-charts" id="tct-charts" aria-label="Graphiques du portefeuille"></div>',
      '<div class="tct-toolbar" role="search">',
      '  <input id="tct-search" class="tct-search" type="search" placeholder="Rechercher (type, description, avantages) — touche /" aria-label="Rechercher un type de contrat">',
      '  <select id="tct-f-rupture" class="tct-select" aria-label="Filtrer par rupture">',
      '    <option value="tous">Rupture : toutes</option>',
      '    <option value="Oui">Rupture possible</option>',
      '    <option value="Non">Rupture impossible</option>',
      '  </select>',
      '  <select id="tct-f-duree" class="tct-select" aria-label="Filtrer par durée maximale"></select>',
      '  <span class="tct-chipzone" id="tct-chipzone"></span>',
      '  <button type="button" class="tct-btn tct-btn--ghost" data-action="reset">Réinitialiser</button>',
      '  <span class="tct-spacer"></span>',
      '  <div class="tct-views" role="tablist" aria-label="Choix de la vue">',
      '    <button type="button" class="tct-view-btn" role="tab" data-action="vue" data-vue="sig">Répartition &amp; limites</button>',
      '    <button type="button" class="tct-view-btn" role="tab" data-action="vue" data-vue="table">Table</button>',
      '    <button type="button" class="tct-view-btn" role="tab" data-action="vue" data-vue="cartes">Cartes</button>',
      '  </div>',
      '  <button type="button" class="tct-btn" data-action="export" title="Exporter en CSV (E)">Export CSV</button>',
      '  <button type="button" class="tct-btn tct-btn--ghost" data-action="seuils" title="Seuils d\'analyse (K)">Seuils</button>',
      '  <button type="button" class="tct-btn tct-btn--primary" data-action="nouveau" title="Nouveau type (N)">+ Nouveau</button>',
      '</div>',
      '<p class="tct-meta" id="tct-meta"></p>',
      '<section class="tct-view" id="tct-vue-sig" aria-label="Vue Répartition et limites"></section>',
      '<section class="tct-view" id="tct-vue-table" hidden>',
      '  <div class="tct-batchbar" id="tct-batchbar" hidden></div>',
      '  <div class="tct-tablewrap"><table class="tct-table">',
      '    <thead id="tct-thead"></thead>',
      '    <tbody id="tct-tbody"></tbody>',
      '  </table></div>',
      '  <div class="tct-pager" id="tct-pager"></div>',
      '</section>',
      '<section class="tct-view" id="tct-vue-cartes" hidden></section>',
      '<div class="tct-foot">',
      '  <button type="button" class="tct-foot-btn" data-action="foot-native">Voir la page native</button>',
      '  <span aria-hidden="true">·</span>',
      '  <button type="button" class="tct-foot-btn" data-action="journal">Journal (J)</button>',
      '  <span aria-hidden="true">·</span>',
      '  <button type="button" class="tct-foot-btn" data-action="aide">Raccourcis (?)</button>',
      '  <span class="tct-foot-ver">admina-typescontrats v1.0-w4 — additif, page native intacte</span>',
      '</div>',
      '<p class="tct-sr tct-live" id="tct-live" aria-live="polite"></p>'
    ].join('');

    titre.insertAdjacentElement('afterend', root);
    /* garde mobile : neutraliser le margin-left drawer sur tous les ancêtres décalés */
    var stop = document.getElementById('root'), hop = root.parentElement;
    while (hop && hop !== document.body && hop !== stop) {
      if (parseFloat(getComputedStyle(hop).marginLeft || '0') > 80) hop.classList.add('tct-host');
      hop = hop.parentElement;
    }

    state.els.root = root;
    state.els.heroLine = root.querySelector('#tct-hero-line');
    state.els.heroChips = root.querySelector('#tct-hero-chips');
    state.els.alertes = root.querySelector('#tct-alertes');
    state.els.kpis = root.querySelector('#tct-kpis');
    state.els.charts = root.querySelector('#tct-charts');
    state.els.search = root.querySelector('#tct-search');
    state.els.fRupture = root.querySelector('#tct-f-rupture');
    state.els.fDuree = root.querySelector('#tct-f-duree');
    state.els.chipzone = root.querySelector('#tct-chipzone');
    state.els.meta = root.querySelector('#tct-meta');
    state.els.vueSig = root.querySelector('#tct-vue-sig');
    state.els.vueTable = root.querySelector('#tct-vue-table');
    state.els.vueCartes = root.querySelector('#tct-vue-cartes');
    state.els.batchbar = root.querySelector('#tct-batchbar');
    state.els.thead = root.querySelector('#tct-thead');
    state.els.tbody = root.querySelector('#tct-tbody');
    state.els.pager = root.querySelector('#tct-pager');
    state.els.live = root.querySelector('#tct-live');

    construireThead();

    // conteneurs hors flux (toasts + burger) posés sur body
    var toasts = document.createElement('div');
    toasts.className = 'tct-toasts';
    toasts.setAttribute('aria-live', 'polite');
    document.body.appendChild(toasts);
    state.els.toasts = toasts;

    var burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'tct-burger';
    burger.setAttribute('aria-label', 'Ouvrir la navigation');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span aria-hidden="true">☰</span>';
    burger.addEventListener('click', function () {
      var on = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    document.body.appendChild(burger);
    state.els.burger = burger;

    // délégation d'événements (les handlers relisent des données FRAÎCHES)
    root.addEventListener('click', onClic);
    root.addEventListener('keydown', onToucheLigne);
    root.addEventListener('change', onChange);
    state.els.search.addEventListener('input', function () {
      state.search = state.els.search.value;
      state.page = 1;
      rafraichir(false);
    });
    state.els.fRupture.addEventListener('change', function () {
      state.filtreRupture = state.els.fRupture.value;
      state.page = 1;
      rafraichir(true);
    });
    state.els.fDuree.addEventListener('change', function () {
      state.filtreDuree = state.els.fDuree.value;
      state.page = 1;
      rafraichir(true);
    });
    return true;
  }

  function construireThead() {
    var cols = [
      { k: 'type', l: 'Type' },
      { k: 'description', l: 'Description' },
      { k: 'dureeMax', l: 'Durée max' },
      { k: 'rupturePossible', l: 'Rupture' },
      { k: 'avantages', l: 'Avantages' },
      { k: 'nbContrats', l: 'Contrats' }
    ];
    var h = ['<tr><th scope="col" class="tct-th-check"><input type="checkbox" data-action="sel-all" aria-label="Tout sélectionner"></th>'];
    cols.forEach(function (c) {
      h.push('<th scope="col" class="tct-th-sort" tabindex="0" data-key="' + c.k + '" data-action="sort" aria-sort="none">' + esc(c.l) + '<span class="tct-ar" aria-hidden="true"></span></th>');
    });
    h.push('<th scope="col" class="tct-th-act">Actions</th></tr>');
    state.els.thead.innerHTML = h.join('');
  }

  /* ========================================================================
     9. RENDU GLOBAL
     -----------------------------------------------------------------------
     Seules les zones dynamiques sont réécrites : la recherche garde son
     focus, les valeurs des filtres survivent au poller. Le héro, les KPI et
     les graphiques dérivent TOUS de calculerMetriques() — une seule source
     de vérité, zéro compteur décoratif.
     ======================================================================== */
  function renderAll() {
    if (!state.active || !state.els.root) return;
    appliquerDark();
    var m = calculerMetriques();
    renderHero(m);
    renderAlertes(calculerAlertes(m));
    renderKpis(m);
    renderCharts(m);
    majOptionsDuree(m);
    renderChipzone();
    var filtres = trier(appliquerFiltres(state.types));
    var maxPage = Math.max(1, Math.ceil(filtres.length / PER_PAGE));
    if (state.page > maxPage) state.page = maxPage;
    renderMeta(m, filtres.length);
    renderSig(m);
    renderTable(m, filtres);
    renderCartes(m, filtres);
    renderBatchbar();
    // bascule des vues
    state.els.vueSig.hidden = state.vue !== 'sig';
    state.els.vueTable.hidden = state.vue !== 'table';
    state.els.vueCartes.hidden = state.vue !== 'cartes';
    var btns = state.els.root.querySelectorAll('.tct-view-btn');
    btns.forEach(function (b) {
      var on = b.getAttribute('data-vue') === state.vue;
      b.classList.toggle('tct-view-btn--on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    state.els.live.textContent = filtres.length + ' type' + s_(filtres.length) + ' affiché' + s_(filtres.length) + ' sur ' + state.types.length + '.';
  }

  function renderHero(m) {
    var parts = [];
    parts.push(m.types.length + ' type' + s_(m.types.length));
    parts.push(fmtInt(m.total) + ' contrat' + s_(m.total) + ' actif' + s_(m.total));
    parts.push(m.rares.length + ' type' + s_(m.rares.length) + ' non utilisé' + s_(m.rares.length));
    if (m.dom) parts.push(m.dom.type + ' = ' + pctTxt(m.domP) + ' du portefeuille');
    state.els.heroLine.textContent = parts.join(' · ');

    var chips = [];
    chips.push('<span class="tct-chip tct-chip--ok">' + m.utilises + '/' + m.types.length + ' cadres utilisés</span>');
    chips.push('<span class="tct-chip tct-chip--info">' + m.imp.length + ' rupture' + s_(m.imp.length) + ' impossible' + s_(m.imp.length) + '</span>');
    if (m.ctrPresent) {
      chips.push('<span class="tct-chip tct-chip--warn">' + fmtInt(m.ctrTotal) + ' contrats actifs recensés (suivi-contrats)</span>');
    } else {
      chips.push('<span class="tct-chip tct-chip--info">Pont suivi-contrats absent — nbContrats déclaratifs</span>');
    }
    chips.push('<span class="tct-chip">Seuil concentration : ' + state.seuils.concentration + ' %</span>');
    state.els.heroChips.innerHTML = chips.join('');
  }

  function renderAlertes(al) {
    if (!al.length) {
      state.els.alertes.innerHTML = '<p class="tct-note">Aucune alerte — le portefeuille respecte ses règles (aucun type au-delà du seuil de concentration, aucun cadre mort, recensement cohérent).</p>';
      return;
    }
    var h = al.map(function (a, i) {
      return '<button type="button" class="tct-alerte tct-alerte--' + a.sev + '" role="listitem" data-action="alerte" data-i="' + i + '"' +
        ' aria-label="Alerte : ' + esc(resume(a.txt, 90)) + ' — cliquer pour filtrer la table">' +
        '<span class="tct-alerte-ico" aria-hidden="true">' + a.ico + '</span>' +
        '<span class="tct-alerte-txt">' + esc(a.txt) + '</span>' +
        '<span class="tct-alerte-act" aria-hidden="true">Filtrer →</span></button>';
    });
    state.els.alertes.innerHTML = h.join('');
    state._alertes = al;
  }

  function renderKpis(m) {
    function kpi(lab, val, sub, act, aria) {
      return '<' + (act ? 'button type="button"' : 'div') + ' class="tct-kpi' + (act ? ' tct-kpi--click' : '') + '"' +
        (act ? ' data-action="' + act + '"' + (aria ? ' aria-label="' + esc(aria) + '"' : '') : '') + '>' +
        '<span class="tct-kpi-val">' + val + '</span>' +
        '<span class="tct-kpi-lab">' + esc(lab) + '</span>' +
        '<span class="tct-kpi-sub">' + esc(sub) + '</span>' +
        (act ? '<span class="tct-kpi-go" aria-hidden="true">Filtrer →</span>' : '') +
        '</' + (act ? 'button' : 'div') + '>';
    }
    var h = '';
    h += kpi('Types', String(m.types.length), 'cadres juridiques définis', null, '');
    h += kpi('Contrats actifs', fmtInt(m.total), m.ctrPresent ? 'dont ' + fmtInt(m.ctrTotal) + ' recensés (CTR)' : 'somme des nbContrats', null, '');
    h += kpi('Types utilisés', pctTxt(m.usedPct), m.utilises + '/' + m.types.length + ' cadres portent des contrats', 'kpi-utilises', 'Filtrer : types utilisés uniquement');
    h += kpi('Type dominant', m.dom ? esc(m.dom.type) : '—', m.dom ? pctTxt(m.domP) + ' du portefeuille' : 'aucun', 'kpi-dominant', m.dom ? 'Filtrer sur le type dominant ' + m.dom.type : '');
    h += kpi('Rupture impossible', String(m.imp.length), 'engagement fort — vigilance renouvellement', 'kpi-rimp', 'Filtrer : rupture impossible');
    h += kpi('Sans contrat', String(m.rares.length), 'cadres morts à relancer ou retirer', 'kpi-sans', 'Filtrer : types sans contrat');
    state.els.kpis.innerHTML = h;
  }

  /* Graphiques SVG vanilla — aucun moteur externe : donut (répartition),
     barres (rupture) et barres (durées max), tous cliquables vers la table. */
  function renderCharts(m) {
    var h = '';
    /* --- donut répartition par type --- */
    var r = 56, cx = 80, cy = 80, C = 2 * Math.PI * r, off = 0;
    var slices = '';
    if (m.total <= 0) {
      slices = '<circle class="tct-donut-slice" cx="80" cy="80" r="56" fill="none" stroke="#94a3b8" stroke-width="26"></circle>';
    } else {
      m.types.forEach(function (t) {
        if (t.nbContrats <= 0) return;
        var len = t.nbContrats / m.total * C;
        var col = couleurType(t.type);
        slices += '<g class="tct-svg-row" data-action="chart-type" data-type="' + esc(t.type) + '" role="button" tabindex="0" aria-label="Filtrer la table sur ' + esc(t.type) + ' (' + pctTxt(t.nbContrats / m.total * 100) + ')">' +
          '<circle class="tct-donut-slice" cx="80" cy="80" r="56" fill="none" stroke="' + col + '" stroke-width="26" stroke-dasharray="' + len.toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 80 80)"><title>' + esc(t.type + ' — ' + t.nbContrats + ' contrats (' + pctTxt(t.nbContrats / m.total * 100) + ')') + '</title></circle></g>';
        off += len;
      });
    }
    var leg = m.types.map(function (t) {
      var p = m.total > 0 ? (t.nbContrats / m.total * 100) : 0;
      return '<button type="button" class="tct-leg-item" data-action="chart-type" data-type="' + esc(t.type) + '" aria-label="Filtrer sur ' + esc(t.type) + '">' +
        '<span class="tct-leg-dot" style="background:' + couleurType(t.type) + '"></span>' +
        '<span class="tct-leg-lab">' + esc(t.type) + (t.nbContrats === 0 ? ' <span class="tct-badge tct-badge--rare">RARE</span>' : '') + '</span>' +
        '<span class="tct-leg-val">' + fmtInt(t.nbContrats) + ' · ' + pctTxt(p) + '</span></button>';
    }).join('');
    h += '<div class="tct-chart"><h3 class="tct-chart-t">Répartition du portefeuille</h3>' +
      '<p class="tct-chart-sub">Poids de chaque type — cliquer une part ou une légende pour filtrer la table.</p>' +
      '<div class="tct-donut-wrap"><svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Donut de répartition par type">' +
      slices +
      '<text x="80" y="76" text-anchor="middle" class="tct-donut-big">' + fmtInt(m.total) + '</text>' +
      '<text x="80" y="94" text-anchor="middle" class="tct-donut-small">contrats</text>' +
      '</svg><div class="tct-donut-leg">' + leg + '</div></div></div>';

    /* --- barres rupture Oui / Non --- */
    var nOui = m.types.filter(function (t) { return t.rupturePossible === 'Oui'; }).length;
    var nNon = m.types.filter(function (t) { return t.rupturePossible === 'Non'; }).length;
    var nb = Math.max(1, nOui + nNon);
    var wOui = nOui / nb * 280, wNon = nNon / nb * 280;
    h += '<div class="tct-chart"><h3 class="tct-chart-t">Garde-fous : rupture</h3>' +
      '<p class="tct-chart-sub">Flexibilité (' + nOui + ' types) vs engagement fort (' + nNon + ' types).</p>' +
      '<svg viewBox="0 0 280 110" width="100%" role="img" aria-label="Barres rupture possible ou impossible">' +
      '<g class="tct-svg-row" data-action="chart-rupture" data-val="Oui" role="button" tabindex="0" aria-label="Filtrer : rupture possible">' +
      '<text x="0" y="14" class="tct-svg-lab">Rupture possible</text>' +
      '<rect x="0" y="22" width="280" height="18" rx="9" class="tct-svg-track"></rect>' +
      '<rect x="0" y="22" width="' + Math.max(wOui, 2).toFixed(1) + '" height="18" rx="9" fill="#059669"></rect>' +
      '<text x="280" y="35" text-anchor="end" class="tct-svg-val">' + nOui + ' type' + s_(nOui) + '</text></g>' +
      '<g class="tct-svg-row" data-action="chart-rupture" data-val="Non" role="button" tabindex="0" aria-label="Filtrer : rupture impossible">' +
      '<text x="0" y="68" class="tct-svg-lab">Rupture impossible</text>' +
      '<rect x="0" y="76" width="280" height="18" rx="9" class="tct-svg-track"></rect>' +
      '<rect x="0" y="76" width="' + Math.max(wNon, 2).toFixed(1) + '" height="18" rx="9" fill="#dc2626"></rect>' +
      '<text x="280" y="89" text-anchor="end" class="tct-svg-val">' + nNon + ' type' + s_(nNon) + '</text></g>' +
      '</svg></div>';

    /* --- barres durée max par type --- */
    var durs = Object.keys(m.durees).map(function (k) { return m.durees[k]; })
      .sort(function (a, b) { return b.nbTypes - a.nbTypes; });
    var maxD = 1, i;
    for (i = 0; i < durs.length; i++) if (durs[i].nbTypes > maxD) maxD = durs[i].nbTypes;
    var rows = '', y = 16, H = durs.length * 34 + 12;
    durs.forEach(function (d) {
      var w = d.nbTypes / maxD * 150;
      rows += '<g class="tct-svg-row" data-action="chart-duree" data-val="' + esc(d.label) + '" role="button" tabindex="0" aria-label="Filtrer : durée max ' + esc(d.label) + '">' +
        '<text x="0" y="' + y + '" class="tct-svg-lab">' + esc(d.label) + '</text>' +
        '<rect x="0" y="' + (y + 6) + '" width="150" height="14" rx="7" class="tct-svg-track"></rect>' +
        '<rect x="0" y="' + (y + 6) + '" width="' + Math.max(w, 2).toFixed(1) + '" height="14" rx="7" fill="#2563eb"></rect>' +
        '<text x="280" y="' + (y + 17) + '" text-anchor="end" class="tct-svg-val">' + d.nbTypes + ' type' + s_(d.nbTypes) + ' · ' + fmtInt(d.nbContrats) + ' ctd</text></g>';
      y += 34;
    });
    if (!durs.length) rows = '<text x="0" y="30" class="tct-svg-lab">Aucune donnée</text>';
    h += '<div class="tct-chart"><h3 class="tct-chart-t">Durées maximales</h3>' +
      '<p class="tct-chart-sub">Limites légales par type — cliquer une barre pour filtrer.</p>' +
      '<svg viewBox="0 0 280 ' + H + '" width="100%" role="img" aria-label="Barres des durées maximales">' + rows + '</svg></div>';

    state.els.charts.innerHTML = h;
  }

  function majOptionsDuree(m) {
    var sel = state.els.fDuree;
    var courant = state.filtreDuree;
    var labels = Object.keys(m.durees);
    labels.sort(function (a, b) { return String(a).localeCompare(String(b), 'fr'); });
    var h = '<option value="tous">Durée max : toutes</option>';
    labels.forEach(function (l) { h += '<option value="' + esc(l) + '">' + esc(l) + '</option>'; });
    sel.innerHTML = h;
    if (courant !== 'tous' && labels.indexOf(courant) < 0) { state.filtreDuree = 'tous'; courant = 'tous'; }
    sel.value = courant;
  }

  function renderChipzone() {
    var h = '';
    if (state.filtreType) {
      h += '<span class="tct-filtre-chip">Type : ' + esc(state.filtreType) +
        '<button type="button" class="tct-filtre-x" data-action="clear-type" aria-label="Retirer le filtre type ' + esc(state.filtreType) + '">✕</button></span>';
    }
    if (state.filtreSpecial === 'sans') h += '<span class="tct-filtre-chip">Sans contrat<button type="button" class="tct-filtre-x" data-action="clear-special" aria-label="Retirer le filtre sans contrat">✕</button></span>';
    if (state.filtreSpecial === 'utilises') h += '<span class="tct-filtre-chip">Utilisés uniquement<button type="button" class="tct-filtre-x" data-action="clear-special" aria-label="Retirer le filtre utilisés">✕</button></span>';
    state.els.chipzone.innerHTML = h;
  }

  function renderMeta(m, nFiltres) {
    var src = { api: 'API native (chunk patché)', ls: 'localStorage — secours', snapshot: 'snapshot démo embarqué' }[state.source] || state.source;
    state.els.meta.textContent = nFiltres + ' type' + s_(nFiltres) + ' affiché' + s_(nFiltres) + ' sur ' + m.types.length +
      ' — source : ' + src + ' — lecture du portefeuille À TRAVERS ses règles.';
  }

  /* ========================================================================
     10. VUE SIGNATURE — RÉPARTITION & LIMITES
     -----------------------------------------------------------------------
     Un bloc par type : barre horizontale ∝ nbContrats (échelle = maximum du
     portefeuille), % du total, badges de règles (durée, rupture Oui=vert /
     Non=rouge, avantages résumés), alerte de concentration au-delà du seuil,
     badge RARE si le cadre ne porte aucun contrat. La section « garde-fous »
     referme la lecture : engagement fort vs flexibilité.
     ======================================================================== */
  function renderSig(m) {
    var tries = m.types.slice().sort(function (a, b) { return b.nbContrats - a.nbContrats; });
    var h = '<div class="tct-sig-head"><h3 class="tct-sig-t">RÉPARTITION &amp; LIMITES</h3>' +
      '<p class="tct-sig-sub">Un cadre = des LIMITES (durée max, rupture) et des COÛTS (avantages). Barre ∝ nbContrats — clic sur un bloc pour filtrer la table.</p>' +
      blocMethode() +
      '</div>';
    h += '<div class="tct-sig-blocks">';
    if (!tries.length) h += '<p class="tct-note">Aucun type de contrat défini — créer le premier cadre avec + Nouveau.</p>';
    tries.forEach(function (t) {
      var p = m.total > 0 ? (t.nbContrats / m.total * 100) : 0;
      var w = m.maxN > 0 ? (t.nbContrats / m.maxN * 100) : 0;
      var badges = '';
      if (t.nbContrats === 0) badges += '<span class="tct-badge tct-badge--rare">RARE — cadre non utilisé</span>';
      if (p > state.seuils.concentration) badges += '<span class="tct-badge tct-badge--conc">Concentration ' + pctTxt(p) + '</span>';
      var av = t.nbContrats === 0
        ? 'Aucun contrat rattaché — ce cadre ne porte rien aujourd\'hui.'
        : resume(t.avantages, 72);
      h += '<button type="button" class="tct-sig-block" style="--c:' + couleurType(t.type) + '" data-action="sig-type" data-type="' + esc(t.type) + '"' +
        ' aria-label="Type ' + esc(t.type) + ', ' + t.nbContrats + ' contrats, ' + pctTxt(p) + ' du portefeuille — filtrer la table">' +
        '<span class="tct-sig-top">' +
        '<span class="tct-sig-name">' + esc(t.type) + '</span>' +
        '<span class="tct-sig-badges">' + badges + '</span>' +
        '<span class="tct-sig-n">' + fmtInt(t.nbContrats) + ' contrat' + s_(t.nbContrats) + '</span>' +
        '<span class="tct-sig-pct">' + pctTxt(p) + '</span>' +
        '</span>' +
        '<span class="tct-sig-bar"><span class="tct-sig-fill" style="width:' + w.toFixed(1) + '%"></span></span>' +
        '<span class="tct-sig-meta">' +
        '<span class="tct-badge tct-badge--duree">Durée max : ' + esc(t.dureeMax) + '</span>' +
        '<span class="tct-badge ' + (t.rupturePossible === 'Oui' ? 'tct-badge--ok' : 'tct-badge--no') + '">Rupture : ' + (t.rupturePossible === 'Oui' ? 'possible' : 'impossible') + '</span>' +
        '<span class="tct-sig-av">' + esc(av) + '</span>' +
        '</span></button>';
    });
    h += '</div>';

    /* Garde-fous : engagement fort vs flexibles. */
    var forts = m.types.filter(function (t) { return t.rupturePossible === 'Non'; });
    var souples = m.types.filter(function (t) { return t.rupturePossible === 'Oui'; });
    h += '<div class="tct-garde">';
    h += '<div class="tct-garde-col tct-garde-col--fort"><div class="tct-garde-t">Engagement fort — rupture impossible</div>' +
      '<ul class="tct-garde-list">' +
      (forts.length ? forts.map(function (t) {
        return '<li class="tct-garde-item"><strong>' + esc(t.type) + '</strong> — durée max ' + esc(t.dureeMax) + ', ' + fmtInt(t.nbContrats) + ' contrat' + s_(t.nbContrats) + '</li>';
      }).join('') : '<li class="tct-garde-item">Aucun — tous les cadres restent révocables.</li>') +
      '</ul><p class="tct-garde-note">Renouveler au-delà de la durée max fragilise juridiquement le contrat : requalification possible en CDI.</p></div>';
    h += '<div class="tct-garde-col tct-garde-col--souple"><div class="tct-garde-t">Flexibles — rupture possible</div>' +
      '<ul class="tct-garde-list">' +
      (souples.length ? souples.map(function (t) {
        return '<li class="tct-garde-item"><strong>' + esc(t.type) + '</strong> — durée max ' + esc(t.dureeMax) + ', ' + fmtInt(t.nbContrats) + ' contrat' + s_(t.nbContrats) + '</li>';
      }).join('') : '<li class="tct-garde-item">Aucun — chaque engagement est verrouillé.</li>') +
      '</ul><p class="tct-garde-note">Cadres ajustables : utiles pour les pics, les essais et les missions bornées.</p></div>';
    h += '</div>';
    state.els.vueSig.innerHTML = h;
  }

  /* ========================================================================
     11. VUE TABLE — triable aria-sort, 6 colonnes, pager, sélection
     -----------------------------------------------------------------------
     Six colonnes triables (type, description, durée, rupture, avantages,
     contrats) avec aria-sort tenu à jour, sélection multiple avec barre
     d'actions groupées, compteur réel du pont CTR entre parenthèses.
     ======================================================================== */
  function renderTable(m, filtres) {
    var maxPage = Math.max(1, Math.ceil(filtres.length / PER_PAGE));
    var page = Math.min(state.page, maxPage);
    var deb = (page - 1) * PER_PAGE;
    var pageItems = filtres.slice(deb, deb + PER_PAGE);

    // aria-sort + flèches
    var ths = state.els.thead.querySelectorAll('th[data-key]');
    ths.forEach(function (th) {
      var k = th.getAttribute('data-key');
      var v = 'none';
      if (k === state.sortKey) v = state.sortDir === 'asc' ? 'ascending' : 'descending';
      th.setAttribute('aria-sort', v);
    });

    if (!pageItems.length) {
      state.els.tbody.innerHTML = '<tr><td colspan="8" class="tct-vide">Aucun type ne correspond aux filtres — <button type="button" class="tct-linklike" data-action="reset">Réinitialiser les filtres</button></td></tr>';
    } else {
      var rows = pageItems.map(function (t) {
        var sel = state.sel && state.sel.has(t.id);
        var reel = m.ctrPresent ? (m.ctrPar[t.type] || 0) : null;
        var ida = esc(t.type);
        return '<tr data-id="' + t.id + '">' +
          '<td class="tct-td-check"><input type="checkbox" data-action="sel-row" data-id="' + t.id + '" aria-label="Sélectionner ' + ida + '"' + (sel ? ' checked' : '') + '></td>' +
          '<td><button type="button" class="tct-linklike" data-action="row-voir" data-id="' + t.id + '" aria-label="Voir la fiche de ' + ida + '">' + esc(t.type) + '</button></td>' +
          '<td>' + esc(t.description) + '</td>' +
          '<td><span class="tct-badge tct-badge--duree">' + esc(t.dureeMax) + '</span></td>' +
          '<td><span class="tct-badge ' + (t.rupturePossible === 'Oui' ? 'tct-badge--ok' : 'tct-badge--no') + '">' + (t.rupturePossible === 'Oui' ? 'Rupture possible' : 'Rupture impossible') + '</span></td>' +
          '<td class="tct-td-av">' + esc(resume(t.avantages, 60)) + '</td>' +
          '<td class="tct-td-nb">' + fmtInt(t.nbContrats) + (reel != null ? ' <span class="tct-nb-reel">(' + fmtInt(reel) + ' réels)</span>' : '') + '</td>' +
          '<td class="tct-td-actions">' +
          '<button type="button" class="tct-ico-btn" data-action="row-voir" data-id="' + t.id + '" title="Voir la fiche" aria-label="Voir ' + ida + '">ⓘ</button>' +
          '<button type="button" class="tct-ico-btn" data-action="row-edit" data-id="' + t.id + '" title="Modifier" aria-label="Modifier ' + ida + '">✎</button>' +
          '<button type="button" class="tct-ico-btn" data-action="row-dup" data-id="' + t.id + '" title="Dupliquer" aria-label="Dupliquer ' + ida + '">⧉</button>' +
          '<button type="button" class="tct-ico-btn tct-ico-btn--del" data-action="row-del" data-id="' + t.id + '" title="Supprimer" aria-label="Supprimer ' + ida + '">✖</button>' +
          '</td></tr>';
      });
      state.els.tbody.innerHTML = rows.join('');
    }

    var selTous = state.els.thead.querySelector('input[data-action="sel-all"]');
    if (selTous) {
      var nSel = pageItems.filter(function (t) { return state.sel && state.sel.has(t.id); }).length;
      selTous.checked = pageItems.length > 0 && nSel === pageItems.length;
      selTous.indeterminate = nSel > 0 && nSel < pageItems.length;
    }

    var ph = '<button type="button" class="tct-pager-btn" data-action="page-prev"' + (page <= 1 ? ' disabled' : '') + ' aria-label="Page précédente">‹ Précédent</button>' +
      '<span class="tct-pager-info">Page ' + page + ' / ' + maxPage + ' — ' +
      (filtres.length ? (deb + 1) + '–' + Math.min(deb + PER_PAGE, filtres.length) : 0) + ' sur ' + filtres.length + '</span>' +
      '<button type="button" class="tct-pager-btn" data-action="page-next"' + (page >= maxPage ? ' disabled' : '') + ' aria-label="Page suivante">Suivant ›</button>';
    state.els.pager.innerHTML = ph;
  }

  function renderCartes(m, filtres) {
    if (!filtres.length) {
      state.els.vueCartes.innerHTML = '<p class="tct-note">Aucun type ne correspond aux filtres.</p>';
      return;
    }
    var h = '<div class="tct-cartes">';
    filtres.forEach(function (t) {
      var p = m.total > 0 ? (t.nbContrats / m.total * 100) : 0;
      var reel = m.ctrPresent ? (m.ctrPar[t.type] || 0) : null;
      h += '<article class="tct-carte" style="--c:' + couleurType(t.type) + '">' +
        '<div class="tct-carte-head"><span class="tct-carte-type">' + esc(t.type) + '</span>' +
        '<span class="tct-carte-nb">' + fmtInt(t.nbContrats) + ' ctd' + (reel != null ? ' · ' + fmtInt(reel) + ' réels' : '') + '</span></div>' +
        '<p class="tct-carte-desc">' + esc(t.description) + '</p>' +
        '<div class="tct-carte-badges">' +
        '<span class="tct-badge tct-badge--duree">' + esc(t.dureeMax) + '</span>' +
        '<span class="tct-badge ' + (t.rupturePossible === 'Oui' ? 'tct-badge--ok' : 'tct-badge--no') + '">' + (t.rupturePossible === 'Oui' ? 'Rupture possible' : 'Rupture impossible') + '</span>' +
        (t.nbContrats === 0 ? '<span class="tct-badge tct-badge--rare">RARE</span>' : '') +
        (p > state.seuils.concentration ? '<span class="tct-badge tct-badge--conc">' + pctTxt(p) + '</span>' : '') +
        '</div>' +
        '<p class="tct-carte-av">' + esc(t.avantages || 'Aucun avantage renseigné.') + '</p>' +
        '<div class="tct-carte-foot">' +
        '<button type="button" class="tct-btn tct-btn--ghost" data-action="row-voir" data-id="' + t.id + '">Fiche</button>' +
        '<button type="button" class="tct-btn tct-btn--ghost" data-action="row-edit" data-id="' + t.id + '">Modifier</button>' +
        '<button type="button" class="tct-btn tct-btn--ghost" data-action="row-dup" data-id="' + t.id + '">Dupliquer</button>' +
        '<button type="button" class="tct-btn tct-btn--danger" data-action="row-del" data-id="' + t.id + '">Supprimer</button>' +
        '</div></article>';
    });
    h += '</div>';
    state.els.vueCartes.innerHTML = h;
  }

  function renderBatchbar() {
    var n = state.sel ? state.sel.size : 0;
    if (!n) { state.els.batchbar.hidden = true; state.els.batchbar.innerHTML = ''; return; }
    state.els.batchbar.hidden = false;
    state.els.batchbar.innerHTML = '<span>' + n + ' type' + s_(n) + ' sélectionné' + s_(n) + '</span>' +
      '<button type="button" class="tct-btn tct-btn--danger" data-action="batch-del">Supprimer la sélection</button>' +
      '<button type="button" class="tct-btn tct-btn--ghost" data-action="batch-clear">Annuler</button>';
  }

  /* ========================================================================
     12. ACTIONS — handlers relisent TOUJOURS des données fraîches
     -----------------------------------------------------------------------
     Chaque mutation suit le même circuit : lireData() frais → transformation
     → ecrireData (API, sinon secours LS) → journal → toast → rendu. La fiche
     type propose un ajustement rapide du nbContrats, une copie du récapitul
     atif et les contrats liés via le pont CTR quand il est présent.
     ======================================================================== */
  function trouverFrais(id) {
    var types = lireData();
    var i, t;
    for (i = 0; i < types.length; i++) { t = types[i]; if (t.id === id) return { t: t, types: types }; }
    return null;
  }

  function onClic(e) {
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el) {
      if (e.target.classList && e.target.classList.contains('tct-overlay')) fermerModals();
      return;
    }
    var act = el.getAttribute('data-action');
    var id = parseInt(el.getAttribute('data-id'), 10);
    switch (act) {
      case 'alerte': {
        var i = parseInt(el.getAttribute('data-i'), 10);
        var a = (state._alertes || [])[i];
        if (a && typeof a.act === 'function') a.act();
        break;
      }
      case 'kpi-utilises': state.filtreSpecial = 'utilises'; allerTable(); break;
      case 'kpi-sans': state.filtreSpecial = 'sans'; allerTable(); break;
      case 'kpi-rimp': state.filtreRupture = 'Non'; allerTable(); break;
      case 'kpi-dominant': {
        var m0 = calculerMetriques();
        if (m0.dom) filtrerType(m0.dom.type);
        break;
      }
      case 'chart-type': case 'sig-type': filtrerType(el.getAttribute('data-type')); break;
      case 'chart-rupture': state.filtreRupture = el.getAttribute('data-val') || 'tous'; allerTable(); break;
      case 'chart-duree': state.filtreDuree = el.getAttribute('data-val') || 'tous'; allerTable(); break;
      case 'clear-type': state.filtreType = ''; rafraichir(true); break;
      case 'clear-special': state.filtreSpecial = ''; rafraichir(true); break;
      case 'reset': resetFiltres(); break;
      case 'vue': state.vue = el.getAttribute('data-vue') || 'sig'; rafraichir(true); break;
      case 'sort': {
        var k = el.getAttribute('data-key');
        if (state.sortKey === k) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortKey = k; state.sortDir = 'asc'; }
        rafraichir(true);
        break;
      }
      case 'page-prev': state.page = Math.max(1, state.page - 1); rafraichir(true); break;
      case 'page-next': state.page = state.page + 1; rafraichir(true); break;
      case 'nouveau': ouvrirDialog('new', null); break;
      case 'export': exporterCSV(); break;
      case 'seuils': ouvrirSeuils(); break;
      case 'journal': ouvrirJournal(); break;
      case 'aide': ouvrirAide(); break;
      case 'foot-native': {
        state.masque = true;
        desactiver();
        break;
      }
      case 'row-voir': case 'sig-voir': ouvrirDrawer(id); break;
      case 'row-edit': ouvrirDialog('edit', id); break;
      case 'row-dup': dupliquer(id); break;
      case 'row-del': supprimer([id]); break;
      case 'batch-del': supprimer(Array.from(state.sel || [])); break;
      case 'batch-clear': if (state.sel) state.sel.clear(); rafraichir(true); break;
      case 'sel-all': break; // géré via change
      case 'sel-row': break; // géré via change
      case 'drawer-close': fermerDrawer(); break;
      case 'drawer-edit': {
        var cur = state.drawerId;
        fermerDrawer();
        if (cur != null) ouvrirDialog('edit', cur);
        break;
      }
      case 'drawer-dup': {
        var cur2 = state.drawerId;
        fermerDrawer();
        if (cur2 != null) dupliquer(cur2);
        break;
      }
      case 'drawer-copy': if (state.drawerId != null) copierRecap(state.drawerId); break;
      case 'drawer-del': {
        var cur3 = state.drawerId;
        fermerDrawer();
        if (cur3 != null) supprimer([cur3]);
        break;
      }
      case 'quick-save': sauverRapide(parseInt(el.getAttribute('data-id'), 10)); break;
      case 'dialog-close': case 'dialog-cancel': fermerModals(); break;
      case 'dialog-save': sauverDialog(); break;
      case 'confirm-cancel': fermerModals(); break;
      case 'confirm-ok': confirmerSuppression(); break;
      case 'seuils-save': sauverSeuils(); break;
      case 'modal-close': fermerModals(); break;
    }
  }

  function onToucheLigne(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el) return;
    var tag = (el.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button') return;
    e.preventDefault();
    el.click();
  }

  function onChange(e) {
    var t = e.target;
    if (!t || !t.matches) return;
    if (t.matches('input[type="checkbox"][data-action="sel-row"]')) {
      var id = parseInt(t.getAttribute('data-id'), 10);
      if (!state.sel) state.sel = new Set();
      if (t.checked) state.sel.add(id); else state.sel.delete(id);
      renderBatchbar();
      var all = state.els.thead.querySelector('input[data-action="sel-all"]');
      if (all) {
        var vis = state.els.tbody.querySelectorAll('input[data-action="sel-row"]');
        var n = 0;
        vis.forEach(function (c) { if (c.checked) n++; });
        all.checked = vis.length > 0 && n === vis.length;
        all.indeterminate = n > 0 && n < vis.length;
      }
    } else if (t.matches('input[type="checkbox"][data-action="sel-all"]')) {
      if (!state.sel) state.sel = new Set();
      var rows = state.els.tbody.querySelectorAll('input[data-action="sel-row"]');
      rows.forEach(function (c) {
        var rid = parseInt(c.getAttribute('data-id'), 10);
        if (t.checked) state.sel.add(rid); else state.sel.delete(rid);
        c.checked = t.checked;
      });
      renderBatchbar();
    }
  }

  /* ---------------- fiche type (drawer) ---------------- */
  function ouvrirDrawer(id) {
    var f = trouverFrais(id);
    if (!f) { toast('Type introuvable — données rafraîchies.', 'err'); rafraichir(true); return; }
    fermerDrawer();
    state.drawerId = id;
    var t = f.t, m = calculerMetriques();
    var p = m.total > 0 ? (t.nbContrats / m.total * 100) : 0;
    var voile = document.createElement('div');
    voile.className = 'tct-voile';
    voile.setAttribute('data-action', 'drawer-close');
    var dr = document.createElement('aside');
    dr.className = 'tct-drawer tct-drawer--on';
    dr.setAttribute('role', 'dialog');
    dr.setAttribute('aria-modal', 'true');
    dr.setAttribute('aria-label', 'Fiche type ' + t.type);

    var contratsHtml = '';
    var contrats = lireCtr();
    if (contrats) {
      var actifs = ctrActifs(contrats).filter(function (c) { return String(c.typeContrat) === t.type; });
      if (actifs.length) {
        var lis = actifs.slice(0, 8).map(function (c) {
          var qui = c.employe || c.employeNom || c.salarie || c.titre || ('contrat #' + (c.id != null ? c.id : '?'));
          var st = c.statut ? ' — ' + c.statut : '';
          return '<li class="tct-lien-item">' + esc(String(qui)) + esc(st) + '</li>';
        }).join('');
        if (actifs.length > 8) lis += '<li class="tct-lien-item tct-lien-more">… et ' + (actifs.length - 8) + ' autre' + s_(actifs.length - 8) + '</li>';
        contratsHtml = '<ul class="tct-liens">' + lis + '</ul><p class="tct-note">' + fmtInt(actifs.length) + ' contrat' + s_(actifs.length) + ' actif' + s_(actifs.length) + ' recensé' + s_(actifs.length) + ' via suivi-contrats.</p>';
      } else {
        contratsHtml = '<p class="tct-note">Aucun contrat actif recensé via suivi-contrats pour ce type.</p>';
      }
    } else {
      contratsHtml = '<p class="tct-note">Pont suivi-contrats absent — recensement des contrats liés indisponible (nbContrats déclaratifs).</p>';
    }

    dr.innerHTML = '<div class="tct-drawer-head"><h3 class="tct-drawer-title">' + esc(t.type) +
      (t.nbContrats === 0 ? ' <span class="tct-badge tct-badge--rare">RARE</span>' : '') +
      (p > state.seuils.concentration ? ' <span class="tct-badge tct-badge--conc">' + pctTxt(p) + '</span>' : '') +
      '</h3><button type="button" class="tct-drawer-close" data-action="drawer-close" aria-label="Fermer la fiche">✕</button></div>' +
      '<div class="tct-drawer-body">' +
      '<p class="tct-drawer-sec" data-tct-sec="description">' + esc(t.description) + '</p>' +
      '<div class="tct-drawer-sec"><span class="tct-drawer-lab">Règles du cadre</span>' +
      '<div class="tct-dl">' +
      '<div class="tct-dl-row"><span class="tct-dl-k">Durée max</span><span class="tct-dl-v"><span class="tct-badge tct-badge--duree">' + esc(t.dureeMax) + '</span></span></div>' +
      '<div class="tct-dl-row"><span class="tct-dl-k">Rupture</span><span class="tct-dl-v"><span class="tct-badge ' + (t.rupturePossible === 'Oui' ? 'tct-badge--ok' : 'tct-badge--no') + '">' + (t.rupturePossible === 'Oui' ? 'Possible — cadre flexible' : 'Impossible — engagement fort') + '</span></span></div>' +
      '<div class="tct-dl-row"><span class="tct-dl-k">nbContrats</span><span class="tct-dl-v">' + fmtInt(t.nbContrats) + '</span></div>' +
      '</div></div>' +
      '<div class="tct-drawer-sec"><span class="tct-drawer-lab">Avantages légaux (coûts)</span><p>' + esc(t.avantages || 'Non renseigné.') + '</p></div>' +
      '<div class="tct-drawer-sec"><span class="tct-drawer-lab">Ajustement rapide — nbContrats</span>' +
      '<div class="tct-quickedit"><input class="tct-input" type="number" min="0" step="1" value="' + t.nbContrats + '" id="tct-qe-nb" aria-label="Nouveau nombre de contrats pour ' + esc(t.type) + '">' +
      '<button type="button" class="tct-btn tct-btn--primary" data-action="quick-save" data-id="' + t.id + '">Enregistrer</button></div></div>' +
      '<div class="tct-drawer-sec"><span class="tct-drawer-lab">Portefeuille</span>' +
      '<p>' + pctTxt(p) + ' du portefeuille total (' + fmtInt(m.total) + ' contrats)</p>' +
      '<div class="tct-mini-bar"><div class="tct-mini-fill" style="width:' + Math.min(100, p).toFixed(1) + '%;background:' + couleurType(t.type) + '"></div></div></div>' +
      '<div class="tct-drawer-sec"><span class="tct-drawer-lab">Contrats liés</span>' + contratsHtml + '</div>' +
      '</div>' +
      '<div class="tct-drawer-foot">' +
      '<button type="button" class="tct-btn tct-btn--ghost" data-action="drawer-copy">Copier</button>' +
      '<button type="button" class="tct-btn tct-btn--ghost" data-action="drawer-edit">Modifier</button>' +
      '<button type="button" class="tct-btn tct-btn--ghost" data-action="drawer-dup">Dupliquer</button>' +
      '<button type="button" class="tct-btn tct-btn--danger" data-action="drawer-del">Supprimer</button>' +
      '</div>';
    document.body.appendChild(voile);
    document.body.appendChild(dr);
    state.els.voile = voile;
    state.els.drawer = dr;
  }
  function fermerDrawer() {
    state.drawerId = null;
    if (state.els.drawer && state.els.drawer.parentNode) state.els.drawer.parentNode.removeChild(state.els.drawer);
    if (state.els.voile && state.els.voile.parentNode) state.els.voile.parentNode.removeChild(state.els.voile);
    state.els.drawer = null; state.els.voile = null;
  }
  function sauverRapide(id) {
    var inp = document.getElementById('tct-qe-nb');
    var v = inp ? parseInt(inp.value, 10) : NaN;
    if (isNaN(v) || v < 0) { toast('Nombre de contrats invalide (entier ≥ 0).', 'err'); return; }
    var f = trouverFrais(id);
    if (!f) { toast('Type introuvable.', 'err'); return; }
    var avant = f.t.nbContrats;
    f.t.nbContrats = v;
    ecrireData(f.types);
    journal('edition-rapide', 'nbContrats ' + f.t.type + ' : ' + avant + ' → ' + v);
    toast('nbContrats de ' + f.t.type + ' mis à jour (' + v + ').', 'ok');
    rafraichir(true);
    ouvrirDrawer(id); // re-rendu de la fiche avec les données fraîches
  }

  /* ---------------- dialog création / édition VALIDÉ ---------------- */
  function ouvrirDialog(mode, id) {
    fermerModals();
    state.dlg = { mode: mode, id: id };
    var edit = mode === 'edit';
    var t = null;
    if (edit) {
      var f = trouverFrais(id);
      if (!f) { toast('Type introuvable.', 'err'); state.dlg = null; return; }
      t = f.t;
    }
    var ov = document.createElement('div');
    ov.className = 'tct-overlay';
    var opts = DUREES.map(function (d) {
      return '<option value="' + esc(d) + '"' + (t && t.dureeMax === d ? ' selected' : '') + '>' + esc(d) + '</option>';
    }).join('');
    ov.innerHTML = '<div class="tct-dialog" role="dialog" aria-modal="true" aria-labelledby="tct-dlg-t">' +
      '<div class="tct-dialog-head"><h3 class="tct-dialog-t" id="tct-dlg-t">' + (edit ? 'Modifier le type — ' + esc(t.type) : 'Nouveau type de contrat') + '</h3>' +
      '<button type="button" class="tct-dialog-x" data-action="dialog-close" aria-label="Fermer le formulaire">✕</button></div>' +
      '<div class="tct-form">' +
      '<div class="tct-field"><label class="tct-label" for="tct-d-type">Type (obligatoire, unique) *</label>' +
      '<input class="tct-input" id="tct-d-type" type="text" value="' + (t ? esc(t.type) : '') + '" placeholder="Ex. CDD — contrat à durée déterminée">' +
      '<p class="tct-err" id="tct-err-type" hidden></p></div>' +
      '<div class="tct-field"><label class="tct-label" for="tct-d-desc">Description</label>' +
      '<input class="tct-input" id="tct-d-desc" type="text" value="' + (t ? esc(t.description) : '') + '" placeholder="Libellé complet du cadre"></div>' +
      '<div class="tct-field"><label class="tct-label" for="tct-d-duree">Durée maximale</label>' +
      '<select class="tct-select" id="tct-d-duree">' + opts + '</select></div>' +
      '<div class="tct-field"><label class="tct-label" for="tct-d-rupt">Rupture possible</label>' +
      '<select class="tct-select" id="tct-d-rupt"><option value="Oui"' + (!t || t.rupturePossible === 'Oui' ? ' selected' : '') + '>Oui — cadre flexible</option><option value="Non"' + (t && t.rupturePossible === 'Non' ? ' selected' : '') + '>Non — engagement fort</option></select></div>' +
      '<div class="tct-field"><label class="tct-label" for="tct-d-nb">Nombre de contrats (entier ≥ 0)</label>' +
      '<input class="tct-input" id="tct-d-nb" type="number" min="0" step="1" value="' + (t ? t.nbContrats : 0) + '">' +
      '<p class="tct-err" id="tct-err-nb" hidden></p></div>' +
      '<div class="tct-field tct-field--full"><label class="tct-label" for="tct-d-av">Avantages légaux (charges, primes, préavis)</label>' +
      '<textarea class="tct-textarea" id="tct-d-av" rows="3" placeholder="Ex. Préavis 1 mois, CNPS, prime de précarité 10%">' + (t ? esc(t.avantages) : '') + '</textarea></div>' +
      '<div class="tct-field tct-field--full"><div class="tct-apercu" id="tct-apercu">Aperçu du poids dans le portefeuille…</div></div>' +
      '</div>' +
      '<div class="tct-dialog-foot">' +
      '<button type="button" class="tct-btn tct-btn--ghost" data-action="dialog-cancel">Annuler</button>' +
      '<button type="button" class="tct-btn tct-btn--primary" id="tct-dlg-save" data-action="dialog-save">' + (edit ? 'Enregistrer les modifications' : 'Créer le type') + '</button>' +
      '</div></div>';
    document.body.appendChild(ov);
    state.els.modal = ov;
    ov.addEventListener('input', validerDialog);
    validerDialog();
    var first = ov.querySelector('#tct-d-type');
    if (first) first.focus();
  }

  function validerDialog() {
    var ov = state.els.modal;
    if (!ov || !state.dlg) return;
    var typeI = ov.querySelector('#tct-d-type');
    var nbI = ov.querySelector('#tct-d-nb');
    var errT = ov.querySelector('#tct-err-type');
    var errN = ov.querySelector('#tct-err-nb');
    var save = ov.querySelector('#tct-dlg-save');
    var apercu = ov.querySelector('#tct-apercu');
    var nom = (typeI.value || '').trim();
    var nb = parseInt(nbI.value, 10);
    var errs = [];

    if (!nom) { errs.push('Type obligatoire.'); errT.textContent = 'Type obligatoire.'; errT.hidden = false; }
    else {
      var frais = lireData();
      var doublon = frais.some(function (x) {
        return x.type.toLowerCase() === nom.toLowerCase() && !(state.dlg.mode === 'edit' && x.id === state.dlg.id);
      });
      if (doublon) { errs.push('Doublon.'); errT.textContent = 'Ce type existe déjà — doublon interdit.'; errT.hidden = false; }
      else errT.hidden = true;
    }
    if (isNaN(nb) || nb < 0) { errs.push('Nb invalide.'); errN.textContent = 'Nombre de contrats invalide (entier ≥ 0).'; errN.hidden = false; }
    else errN.hidden = true;

    save.disabled = errs.length > 0;

    // aperçu live du % du portefeuille après enregistrement
    var frais2 = lireData();
    var total = 0, i;
    for (i = 0; i < frais2.length; i++) {
      if (state.dlg.mode === 'edit' && frais2[i].id === state.dlg.id) continue;
      total += frais2[i].nbContrats;
    }
    var totalApres = total + (isNaN(nb) ? 0 : nb);
    var p = totalApres > 0 ? (nb / totalApres * 100) : 0;
    var mot = state.dlg.mode === 'edit' ? 'pèsera' : 'pèsera à la création';
    apercu.textContent = 'Aperçu : ce type ' + mot + ' pour ' + pctTxt(p) + ' du portefeuille (' + (isNaN(nb) ? '—' : fmtInt(nb)) + ' contrats sur ' + fmtInt(totalApres) + ')' +
      (p > state.seuils.concentration ? ' — au-delà du seuil de concentration (' + state.seuils.concentration + ' %) !' : '.');
    apercu.className = 'tct-apercu' + (p > state.seuils.concentration ? ' tct-apercu--warn' : '');
  }

  function sauverDialog() {
    var ov = state.els.modal;
    if (!ov || !state.dlg) return;
    var nom = (ov.querySelector('#tct-d-type').value || '').trim();
    var desc = ov.querySelector('#tct-d-desc').value || '';
    var duree = ov.querySelector('#tct-d-duree').value || 'Indéterminée';
    var rupt = ov.querySelector('#tct-d-rupt').value === 'Non' ? 'Non' : 'Oui';
    var nb = parseInt(ov.querySelector('#tct-d-nb').value, 10);
    var av = ov.querySelector('#tct-d-av').value || '';
    if (!nom || isNaN(nb) || nb < 0) { validerDialog(); toast('Formulaire invalide — corriger les champs signalés.', 'err'); return; }
    var frais = lireData();
    var doublon = frais.some(function (x) {
      return x.type.toLowerCase() === nom.toLowerCase() && !(state.dlg.mode === 'edit' && x.id === state.dlg.id);
    });
    if (doublon) { toast('Doublon interdit : « ' + nom + ' » existe déjà.', 'err'); return; }
    if (state.dlg.mode === 'edit') {
      var i, t;
      for (i = 0; i < frais.length; i++) {
        t = frais[i];
        if (t.id === state.dlg.id) {
          t.type = nom; t.description = desc; t.dureeMax = duree;
          t.rupturePossible = rupt; t.avantages = av; t.nbContrats = nb;
          break;
        }
      }
      ecrireData(frais);
      journal('edition', 'type ' + nom + ' (id ' + state.dlg.id + ') — durée ' + duree + ', rupture ' + rupt + ', nbContrats ' + nb);
      toast('Type « ' + nom + ' » mis à jour.', 'ok');
    } else {
      frais.unshift({
        id: prochainId(frais), type: nom, description: desc,
        dureeMax: duree, rupturePossible: rupt, avantages: av, nbContrats: nb
      });
      ecrireData(frais);
      journal('creation', 'type ' + nom + ' — durée ' + duree + ', rupture ' + rupt + ', nbContrats ' + nb);
      toast('Type « ' + nom + ' » créé.', 'ok');
    }
    fermerModals();
    rafraichir(true);
  }

  /* ---------------- duplication / suppression ---------------- */
  function dupliquer(id) {
    var f = trouverFrais(id);
    if (!f) { toast('Type introuvable.', 'err'); return; }
    var base = f.t.type + ' (copie)';
    var n = 2;
    while (f.types.some(function (x) { return x.type.toLowerCase() === base.toLowerCase(); })) {
      base = f.t.type + ' (copie ' + n + ')';
      n++;
    }
    var copie = {
      id: prochainId(f.types), type: base, description: f.t.description,
      dureeMax: f.t.dureeMax, rupturePossible: f.t.rupturePossible,
      avantages: f.t.avantages, nbContrats: 0
    };
    var idx = f.types.findIndex(function (x) { return x.id === id; });
    if (idx >= 0) f.types.splice(idx + 1, 0, copie); else f.types.push(copie);
    ecrireData(f.types);
    journal('duplication', f.t.type + ' → ' + base + ' (id ' + copie.id + ', nbContrats 0)');
    toast('Type dupliqué : « ' + base + ' » (0 contrat, à rerattacher).', 'ok');
    rafraichir(true);
  }

  function supprimer(ids) {
    if (!ids || !ids.length) return;
    state.pendingDelete = ids;
    var frais = lireData();
    var noms = ids.map(function (id) {
      var t = frais.filter(function (x) { return x.id === id; })[0];
      return t ? t.type : ('#' + id);
    });
    ouvrirConfirm('Supprimer ' + (ids.length > 1 ? ids.length + ' types' : 'le type « ' + noms[0] + ' »') + ' ?',
      'Cette action retire ' + (ids.length > 1 ? 'ces cadres' : 'ce cadre') + ' du portefeuille : les règles associées cesseront de s\'appliquer. Les contrats déjà signés ne sont pas touchés.');
  }

  function ouvrirConfirm(titre, msg) {
    fermerModals();
    var ov = document.createElement('div');
    ov.className = 'tct-overlay tct-overlay--confirm';
    ov.innerHTML = '<div class="tct-dialog tct-confirm" role="alertdialog" aria-modal="true" aria-labelledby="tct-cf-t">' +
      '<h3 class="tct-dialog-t" id="tct-cf-t">' + esc(titre) + '</h3>' +
      '<p class="tct-confirm-msg">' + esc(msg) + '</p>' +
      '<div class="tct-dialog-foot">' +
      '<button type="button" class="tct-btn tct-btn--ghost" data-action="confirm-cancel">Annuler</button>' +
      '<button type="button" class="tct-btn tct-btn--danger" data-action="confirm-ok">Supprimer</button>' +
      '</div></div>';
    document.body.appendChild(ov);
    state.els.modal = ov;
  }
  function confirmerSuppression() {
    var ids = state.pendingDelete || [];
    state.pendingDelete = null;
    fermerModals();
    if (!ids.length) return;
    var frais = lireData();
    var noms = [];
    var restants = frais.filter(function (t) {
      if (ids.indexOf(t.id) >= 0) { noms.push(t.type); return false; }
      return true;
    });
    ecrireData(restants);
    if (state.sel) ids.forEach(function (id) { state.sel.delete(id); });
    journal('suppression', noms.join(', ') + ' (' + ids.length + ' type' + s_(ids.length) + ')');
    toast(ids.length > 1 ? (ids.length + ' types supprimés.') : ('Type « ' + (noms[0] || '') + ' » supprimé.'), 'ok');
    if (state.filtreType && noms.indexOf(state.filtreType) >= 0) state.filtreType = '';
    rafraichir(true);
  }

  /* ---------------- seuils (K) — persistés ---------------- */
  function lireSeuils() {
    var s = lireLS(LS_SEUILS, null);
    if (s && typeof s === 'object' && !isNaN(parseInt(s.concentration, 10))) {
      return { concentration: parseInt(s.concentration, 10) };
    }
    return { concentration: 50 };
  }
  function ouvrirSeuils() {
    fermerModals();
    state.seuils = lireSeuils();
    var ov = document.createElement('div');
    ov.className = 'tct-overlay';
    ov.innerHTML = '<div class="tct-dialog tct-dialog--small" role="dialog" aria-modal="true" aria-labelledby="tct-se-t">' +
      '<div class="tct-dialog-head"><h3 class="tct-dialog-t" id="tct-se-t">Seuils d\'analyse</h3>' +
      '<button type="button" class="tct-dialog-x" data-action="modal-close" aria-label="Fermer">✕</button></div>' +
      '<div class="tct-form">' +
      '<div class="tct-field tct-field--full"><label class="tct-label" for="tct-se-conc">Seuil de concentration (% du portefeuille, 30–80)</label>' +
      '<input class="tct-input" id="tct-se-conc" type="number" min="30" max="80" step="5" value="' + state.seuils.concentration + '">' +
      '<p class="tct-note">Au-delà de ce seuil, un type trop dominant déclenche une alerte — un portefeuille concentré sur un seul cadre est un risque.</p></div>' +
      '</div>' +
      '<div class="tct-dialog-foot">' +
      '<button type="button" class="tct-btn tct-btn--ghost" data-action="dialog-cancel">Annuler</button>' +
      '<button type="button" class="tct-btn tct-btn--primary" data-action="seuils-save">Enregistrer</button>' +
      '</div></div>';
    document.body.appendChild(ov);
    state.els.modal = ov;
  }
  function sauverSeuils() {
    var ov = state.els.modal;
    if (!ov) return;
    var v = parseInt(ov.querySelector('#tct-se-conc').value, 10);
    if (isNaN(v)) { toast('Seuil invalide.', 'err'); return; }
    v = Math.min(80, Math.max(30, v));
    state.seuils = { concentration: v };
    ecrireLS(LS_SEUILS, state.seuils);
    journal('seuils', 'concentration = ' + v + ' %');
    toast('Seuil de concentration : ' + v + ' %.', 'ok');
    fermerModals();
    rafraichir(true);
  }

  /* ---------------- journal / aide ---------------- */
  function ouvrirJournal() {
    fermerModals();
    var j = lireLS(LS_JOURNAL, []);
    if (!Array.isArray(j)) j = [];
    var rows = j.slice(0, 60).map(function (e) {
      var d = new Date(e.time);
      var hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
      return '<li class="tct-journal-row"><span class="tct-journal-time">' + hh + '</span>' +
        '<span class="tct-journal-act">' + esc(e.action || '') + '</span>' +
        '<span class="tct-journal-det">' + esc(e.detail || '') + '</span></li>';
    }).join('');
    var ov = document.createElement('div');
    ov.className = 'tct-overlay';
    ov.innerHTML = '<div class="tct-dialog tct-dialog--small" role="dialog" aria-modal="true" aria-labelledby="tct-jl-t">' +
      '<div class="tct-dialog-head"><h3 class="tct-dialog-t" id="tct-jl-t">Journal d\'activité (partagé, max 500)</h3>' +
      '<button type="button" class="tct-dialog-x" data-action="modal-close" aria-label="Fermer">✕</button></div>' +
      (rows ? '<ul class="tct-journal">' + rows + '</ul>' : '<p class="tct-note">Journal vide.</p>') +
      '<div class="tct-dialog-foot"><button type="button" class="tct-btn tct-btn--ghost" data-action="modal-close">Fermer</button></div></div>';
    document.body.appendChild(ov);
    state.els.modal = ov;
  }

  function ouvrirAide() {
    fermerModals();
    function item(k, d) { return '<li class="tct-help-item"><kbd class="tct-kbd">' + k + '</kbd><span>' + d + '</span></li>'; }
    var ov = document.createElement('div');
    ov.className = 'tct-overlay';
    ov.innerHTML = '<div class="tct-dialog tct-dialog--small" role="dialog" aria-modal="true" aria-labelledby="tct-ai-t">' +
      '<div class="tct-dialog-head"><h3 class="tct-dialog-t" id="tct-ai-t">Raccourcis clavier</h3>' +
      '<button type="button" class="tct-dialog-x" data-action="modal-close" aria-label="Fermer">✕</button></div>' +
      '<ul class="tct-help-grid">' +
      item('N', 'Nouveau type de contrat') +
      item('E', 'Export CSV du portefeuille') +
      item('J', 'Journal d\'activité') +
      item('P', 'Vue Répartition &amp; limites (signature)') +
      item('C', 'Vue cartes') +
      item('S', 'Recherche (focus)') +
      item('K', 'Seuils d\'analyse') +
      item('T', 'Vue table') +
      item('/', 'Focus recherche') +
      item('?', 'Cette aide') +
      item('Échap', 'Fermer fiche / dialogues') +
      '</ul>' +
      '<details class="tct-methode tct-methode--aide"><summary class="tct-methode-s">Glossaire éclair — les mots des règles</summary>' +
      '<div class="tct-methode-b">' +
      '<p><strong>Cadre</strong> — un type de contrat et ses règles (durée, rupture, avantages). La page entière est la bibliothèque de ces cadres.</p>' +
      '<p><strong>Concentration</strong> — part d\'un type dans le portefeuille total ; au-delà du seuil (K), elle devient un risque signalé.</p>' +
      '<p><strong>Cadre mort (RARE)</strong> — type avec 0 contrat : règle jamais activée, à relancer ou à retirer.</p>' +
      '<p><strong>Engagement fort</strong> — type à rupture impossible : on va au terme ou on s\'expose à la requalification.</p>' +
      '<p><strong>nbContrats réels</strong> — comptage issu du pont suivi-contrats (window.__ADMINA_CTR_API__) comparé au nbContrats déclaré ; un écart déclenche une alerte.</p>' +
      '</div></details>' +
      '<p class="tct-note">Raccourcis ignorés pendant la saisie (champs, dialogues ouverts).</p>' +
      '<div class="tct-dialog-foot"><button type="button" class="tct-btn tct-btn--ghost" data-action="modal-close">Fermer</button></div></div>';
    document.body.appendChild(ov);
    state.els.modal = ov;
  }

  function fermerModals() {
    if (state.els.modal && state.els.modal.parentNode) state.els.modal.parentNode.removeChild(state.els.modal);
    state.els.modal = null;
    state.dlg = null;
  }

  /* ---------------- export CSV (BOM, « ; ») ---------------- */
  function exporterCSV() {
    var frais = lireData();
    var cell = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var lignes = [['id', 'type', 'description', 'dureeMax', 'rupturePossible', 'avantages', 'nbContrats'].join(';')];
    frais.forEach(function (t) {
      lignes.push([t.id, t.type, t.description, t.dureeMax, t.rupturePossible, t.avantages, t.nbContrats].map(cell).join(';'));
    });
    var contenu = '\ufeff' + lignes.join('\r\n');
    try {
      var blob = new Blob([contenu], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'types-de-contrats-admina.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    } catch (e) { toast('Export impossible dans ce navigateur.', 'err'); return; }
    journal('export', frais.length + ' type' + s_(frais.length) + ' exporté' + s_(frais.length) + ' (CSV ;)');
    toast(frais.length + ' type' + s_(frais.length) + ' exporté' + s_(frais.length) + ' en CSV.', 'ok');
  }

  /* ========================================================================
     13. RACCOURCIS CLAVIER — N/E/J/P/C/S/K/T + / + ?
     -----------------------------------------------------------------------
     Ignorés pendant la saisie (input/textarea/select/contenteditable) et
     tant qu'un dialogue est ouvert ; Échap ferme fiche et dialogues en
     priorité. Une touche = une action visible, jamais une mutation sourde.
     ======================================================================== */
  document.addEventListener('keydown', function (e) {
    if (!state.active) return;
    if (e.key === 'Escape') {
      if (state.els.modal) { fermerModals(); return; }
      if (state.els.drawer) { fermerDrawer(); return; }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && t.matches && t.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (state.els.modal) return; // dialog ouvert : pas de raccourcis
    var k = e.key;
    if (k === '/') { e.preventDefault(); if (state.els.search) state.els.search.focus(); return; }
    if (k === '?') { e.preventDefault(); ouvrirAide(); return; }
    switch (k.toLowerCase()) {
      case 'n': e.preventDefault(); ouvrirDialog('new', null); break;
      case 'e': e.preventDefault(); exporterCSV(); break;
      case 'j': e.preventDefault(); ouvrirJournal(); break;
      case 'p': e.preventDefault(); state.vue = 'sig'; rafraichir(true); break;
      case 'c': e.preventDefault(); state.vue = 'cartes'; rafraichir(true); break;
      case 's': e.preventDefault(); if (state.els.search) state.els.search.focus(); break;
      case 'k': e.preventDefault(); ouvrirSeuils(); break;
      case 't': e.preventDefault(); state.vue = 'table'; rafraichir(true); break;
    }
  });

  /* ========================================================================
     14. INTERFACE PUBLIQUE + DÉMARRAGE
     -----------------------------------------------------------------------
     window.__ADMINA_TCT_UI__ (v1.0-w4) expose filtered / alerts /
     nextNumero / seuils pour l'orchestrateur et les futurs ponts ; le flag
     __ADMINA_TCT_W4__ est posé en FIN d'init (canon anti-double-injection).
     Aucun autre global : tout vit dans la closure.
     ======================================================================== */
  window.__ADMINA_TCT_UI__ = {
    version: '1.0-w4',
    filtered: function () { return trier(appliquerFiltres(lireData())); },
    alerts: function () { var garde = state.types; state.types = lireData(); var m = calculerMetriques(); var a = calculerAlertes(m); state.types = garde; return a; },
    nextNumero: function () { return prochainId(lireData()); },
    seuils: function () { return lireSeuils(); }
  };

  demarrer();

  /* Flag anti-double-injection posé en FIN d'init (canon). */
  window.__ADMINA_TCT_W4__ = true;
})();
