/*! ============================================================================
 *  admina-rapport.js — Module additif « Photographie de synthèse » (W4-e)
 *  Route cible : /audit — Admina-RH · Vague 4 · version 1.0-w4
 *  Nature : LECTURE SEULE — agrégateur d’APIs, zéro état propre, zéro saisie.
 *  ---------------------------------------------------------------------------
 *  PHILOSOPHIE DE LA PAGE (verbatim, reflétée partout dans ce fichier) :
 *
 *  « LA PHOTOGRAPHIE DE SYNTHÈSE — Chaque page de l'application gère son propre
 *  sujet : ici, on ne gère rien. Cette page est le rapport consolidé : elle
 *  parcourt toutes les sources actives du système (contrats, types, conformité,
 *  journal d'audit, candidats, pipeline, sélections, entretiens, évaluations,
 *  vérifications, intégration, post-embauche, stagiaires, saisonniers,
 *  compétences, expériences…) et en tire une photographie à l'instant T. Elle
 *  est en lecture seule par principe : un rapport qui s'édite est un rapport
 *  qui ment. On la consulte, on l'exporte, on l'imprime — et on retourne
 *  travailler dans les pages spécialisées. »
 *  ---------------------------------------------------------------------------
 *  COMPORTEMENT :
 *   - Détection STRICTE de la page : regex /\/audit\/?$/ sur location.pathname
 *     (ne JAMAIS matcher /audit-statuts ni /audit/xxx).
 *   - /audit n’est pas routée nativement : le shell se charge, la zone de
 *     contenu peut être vide ou contenir du résidu. On s’insère À CÔTÉ des
 *     nœuds natifs, on ne retire JAMAIS rien (cascade main/Box → #root>div →
 *     #root → body, réessais 30 × 450 ms).
 *   - AUCUN état propre : ce module agrège les APIs des autres modules
 *     (__ADMINA_*_API__.getData()) et n’écrit rien dans leurs clés LS.
 *   - Scan silencieux : chaque source est entourée de try/catch ; source
 *     absente = carte grise « module non actif sur cette session », jamais
 *     d’erreur visible.
 *   - Métriques génériques (compteur, dernier id max, champs, période) +
 *     métriques SPÉCIFIQUES pour les 4 modules W4 (contrats = masse salariale,
 *     types = référentiel, conformité = % conforme, journal = actions
 *     sensibles 7 j).
 *   - Bandeau d’alertes transverses : somme des alertes des 4 modules W4 si
 *     leurs __ADMINA_XXX_UI__.alerts existent, sinon recomptage local prudent.
 *   - Graphique SVG vanilla : répartition des enregistrements par module,
 *     barres horizontales cliquables → toast informatif (no-op).
 *   - Export CSV global (BOM, « ; », une section par module,
 *     rapport-consolide-AAAA-MM-JJ.csv) + Impression (window.print dans
 *     try/catch, classe arp-print qui allège le rendu).
 *   - Journal : chaque GÉNÉRATION pousse {time, action:'Export', detail:
 *     'Rapport consolidé généré (N modules, M enregistrements)', role:'RH'}
 *     dans LS admina_journal (max 500) + try/catch __ADMINA_AUDIT__.
 *   - Poller 1200 ms : rafraîchit uniquement les compteurs (léger), la
 *     date/heure de génération reste figée jusqu’au bouton Actualiser.
 *   - Raccourcis : « / » recherche locale de carte · « ? » aide · « T » export
 *     CSV · « P » imprimer. AUCUN autre raccourci.
 *   - Idempotence : garde if (window.__ADMINA_ARP_W4__) return; en tête, flag
 *     posé en FIN d’init ; zéro global hors __ADMINA_ARP_API__ /
 *     __ADMINA_ARP_UI__ / __ADMINA_ARP_W4__ ; préfixe arp- partout ; racine
 *     html.admina-arp + [data-arp-page] ; désactivation propre hors scope
 *     (garde 350 ms + popstate) ; sombre automatique (LS admina-dark).
 * ==========================================================================*/
(function () {
  "use strict";
  if (window.__ADMINA_ARP_W4__) return;

  /* ==========================================================================
   * 1. CONSTANTES
   * ========================================================================*/

  /** Détection STRICTE de la route /audit (jamais /audit-statuts, /audit/xx). */
  var PAGE_RE = /\/audit\/?$/;

  var RETRY_MS = 450;          // réessais d’ancrage (30 × 450 ms ≈ 13,5 s)
  var MOUNT_TRIES = 30;
  var POLL_MS = 1200;          // poller léger sur les APIs présentes
  var ROUTE_MS = 350;          // garde de désactivation hors scope
  var JOURNAL_MAX = 500;       // plafond du journal LS admina_journal
  var SCAN_DEBOUNCE = 600;     // re-scan complet quand une source apparaît

  var LS_JOURNAL = "admina_journal";
  var LS_DARK = "admina-dark";

  var ROOT_ID = "arp-root";

  /** Mois courts français (sparklines). */
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc."];

  /** Palette de répartition (6 teintes, référencées --arp-c0..5 côté CSS). */
  var PALETTE_LEN = 6;

  /* ==========================================================================
   * 2. REGISTRE DES SOURCES (25 APIs agrégées, lecture seule)
   *    key      : identifiant court interne (préfixe arp- côté DOM)
   *    gk       : nom de la globale __ADMINA_*_API__ à scanner
   *    ui       : globale __ADMINA_*_UI__ éventuelle (alertes) — modules W4
   *    name     : nom affiché sur la carte
   *    desc     : rôle de la page spécialisée (rappel : ici on ne gère rien)
   *    cat      : famille (Cœur RH / Vivier / Intégration / Pilotage)
   *    mono     : monogramme affiché dans la carte
   *    w4       : métriques spécifiques Vague 4
   * ========================================================================*/
  var SOURCES = [
    { key: "ctr",  ls: "admina-contrats-data", gk: "__ADMINA_CTR_API__",  ui: "__ADMINA_CTR_UI__",  name: "Contrats",                cat: "Cœur RH",     mono: "CT", w4: true,
      desc: "Suivi des contrats actifs, échéances et masse salariale — la page spécialisée gère ce sujet." },
    { key: "tct",  ls: "admina-typescontrats-data", gk: "__ADMINA_TCT_API__",  ui: "__ADMINA_TCT_UI__",  name: "Types de contrats",       cat: "Cœur RH",     mono: "TC", w4: true,
      desc: "Référentiel des types de contrats (durées, catégories) — la page spécialisée gère ce sujet." },
    { key: "cnf",  ls: "admina-conformite-data", gk: "__ADMINA_CNF_API__",  ui: "__ADMINA_CNF_UI__",  name: "Conformité documentaire", cat: "Cœur RH",     mono: "CF", w4: true,
      desc: "Documents exigibles et pièces conformes — la page spécialisée gère ce sujet." },
    { key: "adt",  ls: "admina-auditstatuts-data", gk: "__ADMINA_ADT_API__",  ui: "__ADMINA_ADT_UI__",  name: "Journal d’audit",         cat: "Cœur RH",     mono: "JA", w4: true,
      desc: "Traçabilité des actions, y compris sensibles — la page spécialisée gère ce sujet." },
    { key: "cand", ls: "admina-cand-data", gk: "__ADMINA_CAND_API__", ui: null,                 name: "Base candidats",          cat: "Vivier",      mono: "BC", w4: false,
      desc: "Fiches candidates du vivier — géré dans sa page dédiée." },
    { key: "ppl",  ls: "admina-ppl-data", gk: "__ADMINA_PPL_API__",  ui: null,                 name: "Pipeline",                cat: "Vivier",      mono: "PP", w4: false,
      desc: "Kanban des candidatures en cours — géré dans sa page dédiée." },
    { key: "sel",  ls: "admina-selections-data", gk: "__ADMINA_SEL_API__",  ui: null,                 name: "Sélections",              cat: "Vivier",      mono: "SE", w4: false,
      desc: "Décisions de shortlist et de sélection — géré dans sa page dédiée." },
    { key: "ent",  ls: "admina-entretiens-data", gk: "__ADMINA_ENT_API__",  ui: null,                 name: "Entretiens",              cat: "Vivier",      mono: "EN", w4: false,
      desc: "Planification et comptes rendus d’entretiens — géré dans sa page dédiée." },
    { key: "ev",   ls: "admina-evaluations-data", gk: "__ADMINA_EV_API__",   ui: null,                 name: "Évaluations",             cat: "Vivier",      mono: "EV", w4: false,
      desc: "Grilles, scores et verdicts d’évaluation — géré dans sa page dédiée." },
    { key: "vr",   ls: "admina-verifications-data", gk: "__ADMINA_VR_API__",   ui: null,                 name: "Vérifications",           cat: "Vivier",      mono: "VR", w4: false,
      desc: "Contrôle des références et antécédents — géré dans sa page dédiée." },
    { key: "igr",  ls: "admina-integration-data", gk: "__ADMINA_IGR_API__",  ui: null,                 name: "Intégration",             cat: "Intégration", mono: "IG", w4: false,
      desc: "Parcours d’onboarding des nouvelles recrues — géré dans sa page dédiée." },
    { key: "acl",  ls: "admina-checklist-data", gk: "__ADMINA_ACL_API__",  ui: null,                 name: "Checklist",               cat: "Intégration", mono: "CK", w4: false,
      desc: "Listes de tâches d’intégration à cocher — géré dans sa page dédiée." },
    { key: "aac",  ls: "admina-accueil-data", gk: "__ADMINA_AAC_API__",  ui: null,                 name: "Accueil (jour 1)",        cat: "Intégration", mono: "A1", w4: false,
      desc: "Préparation matérielle et administrative de l’arrivée — géré dans sa page dédiée." },
    { key: "ape",  ls: "admina-postembauche-data", gk: "__ADMINA_APE_API__",  ui: null,                 name: "Post-embauche",           cat: "Intégration", mono: "PE", w4: false,
      desc: "Suivi après embauche (semaines 1 à 4) — géré dans sa page dédiée." },
    { key: "ade",  ls: "admina-dessai-data", gk: "__ADMINA_ADE_API__",  ui: null,                 name: "Fin d’essai",             cat: "Intégration", mono: "FE", w4: false,
      desc: "Désaiguillage de la période d’essai — géré dans sa page dédiée." },
    { key: "stg",  ls: "admina-stagiaires-data", gk: "__ADMINA_STG_API__",  ui: null,                 name: "Stagiaires",              cat: "Vivier",      mono: "ST", w4: false,
      desc: "L’essai mutuel : vivier pré-qualifié — géré dans sa page dédiée." },
    { key: "sai",  ls: "admina-saisonniers-data", gk: "__ADMINA_SAI_API__",  ui: null,                 name: "Saisonniers",             cat: "Vivier",      mono: "SA", w4: false,
      desc: "Le fichier des retournants et couvertures — géré dans sa page dédiée." },
    { key: "fca",  ls: "admina-formationscand-data", gk: "__ADMINA_FCA_API__",  ui: null,                 name: "Formations candidats",    cat: "Vivier",      mono: "FC", w4: false,
      desc: "Le capacitaire : diplômes, écoles, viviers — géré dans sa page dédiée." },
    { key: "cpt",  ls: "admina-competences-data", gk: "__ADMINA_CPT_API__",  ui: null,                 name: "Compétences",             cat: "Vivier",      mono: "CP", w4: false,
      desc: "La matrice de talents : qui sait quoi — géré dans sa page dédiée." },
    { key: "exp",  ls: "admina-experiences-data", gk: "__ADMINA_EXP_API__",  ui: null,                 name: "Expériences",             cat: "Vivier",      mono: "EX", w4: false,
      desc: "L’historique vérifié des parcours — géré dans sa page dédiée." },
    { key: "sou",  ls: "admina-sources-data", gk: "__ADMINA_SOU_API__",  ui: null,                 name: "Sources",                 cat: "Pilotage",    mono: "SO", w4: false,
      desc: "Origines des candidatures et ROI — géré dans sa page dédiée." },
    { key: "pre",  ls: "admina-previsions-data", gk: "__ADMINA_PRE_API__",  ui: null,                 name: "Prévisions",              cat: "Pilotage",    mono: "PR", w4: false,
      desc: "Besoins anticipés et effectifs cibles — géré dans sa page dédiée." },
    { key: "dem",  gk: "__ADMINA_DEM_API__",  ui: null,                 name: "Demandes",                cat: "Pilotage",    mono: "DM", w4: false,
      desc: "Demandes de recrutement entrantes — géré dans sa page dédiée." },
    { key: "off",  gk: "__ADMINA_OFF_API__",  ui: null,                 name: "Offres",                  cat: "Pilotage",    mono: "OF", w4: false,
      desc: "Offres émises et leurs réponses — géré dans sa page dédiée." },
    { key: "cou",  ls: "admina-couts-data", gk: "__ADMINA_COU_API__",  ui: null,                 name: "Coûts",                   cat: "Pilotage",    mono: "CO", w4: false,
      desc: "Coûts de recrutement et budgets — géré dans sa page dédiée." }
  ];

  /* ==========================================================================
   * 3. ÉTAT INTERNE (fermé — aucun global)
   * ========================================================================*/
  var state = {
    active: false,        // la route /audit est-elle affichée ?
    root: null,           // racine [data-arp-page] injectée
    els: {},              // références DOM utiles
    scanned: null,        // dernier scan complet (tableau de résultats)
    generatedAt: null,    // date/heure de génération (figée jusqu’à Actualiser)
    searchQ: "",          // filtre local de cartes
    scanning: false,      // anti-réentrance du scan complet
    fullTimer: 0,         // debounce de re-scan complet
    routeTimer: 0,        // debounce popstate
    journalDone: false    // une génération déjà journalisée pour cette visite
  };

  /** Instantané exposé via __ADMINA_ARP_API__ (modules / counts / generatedAt). */
  var snapshot = { version: "1.0-w4", generatedAt: null, counts: { modules: 0, records: 0 }, modules: [] };

  /* ==========================================================================
   * 4. PETITS OUTILS (ES5, défensifs)
   * ========================================================================*/

  function lsGet(k, d) {
    try {
      var v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch (e) { return d; }
  }

  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* silencieux */ }
  }

  function isDark() {
    try {
      var v = localStorage.getItem(LS_DARK);
      return v === "1" || v === "true" || v === "on";
    } catch (e) { return false; }
  }

  /** Applique (ou retire) l’attribut sombre sur <html> tant que la page est active. */
  function applyDark() {
    var h = document.documentElement;
    if (!h) return;
    if (state.active && isDark()) h.setAttribute("data-arp-dark", "1");
    else h.removeAttribute("data-arp-dark");
  }

  function pad2(n) { n = Number(n) || 0; return (n < 10 ? "0" : "") + n; }

  function fmtInt(n) {
    n = Number(n) || 0;
    try { return new Intl.NumberFormat("fr-FR").format(n); }
    catch (e) {
      try { return n.toLocaleString("fr-FR"); }
      catch (e2) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
    }
  }

  function fmtMoney(n) {
    n = Number(n);
    if (!isFinite(n)) return "—";
    return fmtInt(Math.round(n)) + " FCFA";
  }

  function fmtDay(d) {
    if (!d) return "—";
    return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear();
  }

  function fmtDateTime(d) {
    if (!d) return "—";
    return fmtDay(d) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function isoDay(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function isoNow() {
    try { return new Date().toISOString(); } catch (e) { return String(Date.now()); }
  }

  /** Minuscules sans accents (recherche locale de cartes). */
  function normTxt(s) {
    try {
      return String(s == null ? "" : s).toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {
      return String(s == null ? "" : s).toLowerCase();
    }
  }

  /** Échappement HTML minimal (toutes les données tierces passent dedans). */
  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function escAttr(s) { return escHtml(s); }

  /** Tronque proprement une étiquette. */
  function clip(s, n) {
    s = String(s == null ? "" : s);
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  /* ==========================================================================
   * 5. LECTURE DES DONNÉES TIERCES (générique et prudente)
   * ========================================================================*/

  /** api.getData() → première clé dont la valeur est un tableau. */
  function firstArray(d) {
    try {
      if (!d || typeof d !== "object") return null;
      var ks = Object.keys(d);
      for (var i = 0; i < ks.length; i++) {
        if (Array.isArray(d[ks[i]]) && ks[i] !== "alerts") return d[ks[i]];
      }
    } catch (e) { /* silencieux */ }
    return null;
  }

  /** Tableau d'une source : API du module d'abord, sinon LS de session (lecture seule). */
  function dataOf(m) {
    try {
      var api = window[m.gk];
      if (api && typeof api.getData === "function") {
        var arr = firstArray(api.getData());
        if (arr) return arr;
      }
    } catch (e) { /* on tente le LS */ }
    try {
      if (m.ls) {
        var raw = localStorage.getItem(m.ls);
        if (raw) return firstArray(JSON.parse(raw));
      }
    } catch (e2) { /* source indisponible */ }
    return null;
  }

  /** Comptage léger d’une source (poller). null = source indisponible. */
  function quickCount(m) {
    var arr = dataOf(m);
    return arr ? arr.length : null;
  }

  /** Scan complet d’une source : compteur + métriques + série + répartition. */
  function scanFull(m) {
    var res = {
      key: m.key, name: m.name, desc: m.desc, cat: m.cat, mono: m.mono, w4: !!m.w4,
      active: false, count: 0, items: [], fields: [], lastId: null,
      metrics: [], series: null, repart: null,
      minTs: null, maxTs: null
    };
    try {
      var arr = dataOf(m);
      if (!arr) return res;
      res.active = true;
      res.count = arr.length;
      res.items = arr;
      if (arr.length) {
        var f0 = arr[0];
        if (f0 && typeof f0 === "object") res.fields = Object.keys(f0);
      }
      /* Dernier id max (id, ID, pk, ref numérique). */
      var mx = null;
      for (var i = 0; i < arr.length; i++) {
        var it = arr[i];
        if (!it || typeof it !== "object") continue;
        var raw = it.id != null ? it.id : (it.ID != null ? it.ID : (it.pk != null ? it.pk : it.ref));
        var v = Number(raw);
        if (raw != null && isFinite(v)) {
          if (mx == null || v > mx) mx = v;
        }
        /* Bornes temporelles globales (métrique Période). */
        var ts = dateTsOf(it);
        if (ts != null) {
          if (res.minTs == null || ts < res.minTs) res.minTs = ts;
          if (res.maxTs == null || ts > res.maxTs) res.maxTs = ts;
        }
      }
      res.lastId = mx;
      /* Série mensuelle glissante (8 mois) pour sparkline. */
      res.series = buildSeries(arr);
      /* Répartition catégorielle de repli. */
      res.repart = res.series ? null : buildRepart(arr, res.fields);
      /* Métriques affichées : spécifiques W4 sinon génériques. */
      if (m.w4) res.metrics = w4Metrics(m.key, arr, res);
      if (!res.metrics.length) res.metrics = genericMetrics(res);
    } catch (e) { /* scan silencieux : la source reste « non active » */ }
    return res;
  }

  /** Premier champ texte dont la clé matche re. */
  function txtField(it, re) {
    try {
      if (!it || typeof it !== "object") return null;
      var ks = Object.keys(it);
      for (var i = 0; i < ks.length; i++) {
        if (re.test(ks[i])) {
          var v = it[ks[i]];
          if (typeof v === "string" && v.length) return v;
        }
      }
    } catch (e) { /* silencieux */ }
    return null;
  }

  /** Premier champ numérique dont la clé matche re. */
  function numField(it, re) {
    try {
      if (!it || typeof it !== "object") return null;
      var ks = Object.keys(it);
      for (var i = 0; i < ks.length; i++) {
        if (re.test(ks[i])) {
          var v = it[ks[i]];
          if (typeof v === "number" && isFinite(v)) return v;
          if (typeof v === "string" && v.length) {
            var c = v.replace(/\s/g, "").replace(",", ".");
            if (isFinite(Number(c))) return Number(c);
          }
        }
      }
    } catch (e) { /* silencieux */ }
    return null;
  }

  /** Statut textuel générique d’un item. */
  function statutOf(it) {
    return txtField(it, /^(statut|status|etat|state)$/i) || "";
  }

  /** Parse robuste d’une valeur temporelle (ms, s, ISO, jj/mm/aaaa). */
  function parseTs(v) {
    if (v == null) return null;
    if (typeof v === "number" && isFinite(v)) {
      if (v > 1e12) return v;              // millisecondes
      if (v > 1e9) return v * 1000;        // secondes
      return null;
    }
    if (typeof v === "string" && v.length >= 8) {
      var t = Date.parse(v);
      if (isFinite(t)) return t;
      var mm = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/.exec(v.trim());
      if (mm) {
        var d = new Date(Number(mm[3]), Number(mm[2]) - 1, Number(mm[1]));
        return isNaN(d.getTime()) ? null : d.getTime();
      }
    }
    return null;
  }

  /** Horodatage plausible d’un item (clés date/heure/debut/fin/…). */
  var DATE_RE = /(date|heure|time|horodat|debut|fin$|echeance|embauche|essai|creation|cree|maj$|update|created)/i;

  function dateTsOf(it) {
    try {
      if (!it || typeof it !== "object") return null;
      var ks = Object.keys(it);
      for (var i = 0; i < ks.length; i++) {
        if (DATE_RE.test(ks[i])) {
          var ts = parseTs(it[ks[i]]);
          if (ts != null) return ts;
        }
      }
    } catch (e) { /* silencieux */ }
    return null;
  }

  /** Horodatage sur une famille de clés précise (ex. fin/échéance). */
  function dateTsOn(it, re) {
    try {
      if (!it || typeof it !== "object") return null;
      var ks = Object.keys(it);
      for (var i = 0; i < ks.length; i++) {
        if (re.test(ks[i])) {
          var ts = parseTs(it[ks[i]]);
          if (ts != null) return ts;
        }
      }
    } catch (e) { /* silencieux */ }
    return null;
  }

  /* --- Série mensuelle glissante (8 mois) pour sparklines ------------------ */
  function monthIdx(ts) {
    var d = new Date(ts);
    return d.getFullYear() * 12 + d.getMonth();
  }

  function buildSeries(items) {
    try {
      var now = new Date();
      var start = now.getFullYear() * 12 + now.getMonth() - 7;
      var buckets = {}, any = 0;
      for (var i = 0; i < items.length; i++) {
        var ts = dateTsOf(items[i]);
        if (ts == null) continue;
        var k = monthIdx(ts);
        if (k < start || k > start + 7) continue;
        buckets[k] = (buckets[k] || 0) + 1;
        any++;
      }
      if (!any) return null;
      var series = [];
      for (var j = 0; j <= 7; j++) {
        var mk = start + j;
        series.push({
          label: MOIS[((mk % 12) + 12) % 12],
          count: buckets[mk] || 0
        });
      }
      var nz = 0;
      for (var q = 0; q < series.length; q++) { if (series[q].count > 0) nz++; }
      return nz >= 2 ? series : null;
    } catch (e) { return null; }
  }

  /* --- Répartition catégorielle simple (repli des sparklines) -------------- */
  var CAT_RES = [
    /^(statut|status)$/i, /^etat$/i, /^(type|typecontrat|typecontratid)$/i,
    /^(categorie|category|famille)$/i, /^(service|departement|poste)$/i,
    /^(phase|etape|stage)$/i, /^(decision|resultat|verdict)$/i,
    /^(niveau|priorite|prioriteid)$/i
  ];

  function buildRepart(items, fields) {
    try {
      if (!items || !items.length || !fields || !fields.length) return null;
      var key = null;
      for (var i = 0; i < CAT_RES.length && !key; i++) {
        for (var j = 0; j < fields.length; j++) {
          if (CAT_RES[i].test(fields[j])) { key = fields[j]; break; }
        }
      }
      if (!key) return null;
      var tally = {};
      for (var k = 0; k < items.length; k++) {
        var v = items[k] ? items[k][key] : null;
        if (v == null || v === "") v = "(non renseigné)";
        v = String(v);
        tally[v] = (tally[v] || 0) + 1;
      }
      var arr = Object.keys(tally).map(function (x) { return { v: x, c: tally[x] }; });
      if (arr.length < 2) return null;
      arr.sort(function (a, b) { return b.c - a.c; });
      var others = 0;
      for (var o = 4; o < arr.length; o++) others += arr[o].c;
      return { field: key, parts: arr.slice(0, 4), others: others };
    } catch (e) { return null; }
  }

  /* ==========================================================================
   * 6. MÉTRIQUES — génériques puis SPÉCIFIQUES W4
   * ========================================================================*/

  /** Métriques génériques : dernier id max, champs disponibles, période. */
  function genericMetrics(res) {
    var out = [];
    out.push(["Dernier id", res.lastId == null ? "—" : "#" + fmtInt(res.lastId)]);
    out.push(["Champs disponibles", res.fields.length ? fmtInt(res.fields.length) : "—"]);
    if (res.minTs != null && res.maxTs != null) {
      var a = new Date(res.minTs), b = new Date(res.maxTs);
      var la = MOIS[a.getMonth()] + " " + String(a.getFullYear()).slice(2);
      var lb = MOIS[b.getMonth()] + " " + String(b.getFullYear()).slice(2);
      out.push(["Période détectée", la === lb ? la : la + " → " + lb]);
    } else {
      out.push(["Horodatage", "non détecté"]);
    }
    return out;
  }

  /** % « conforme » prudent (champ statut/état ou booléen conforme). */
  function cnfIsOk(it) {
    var s = txtField(it, /^(statut|status|etat|state|conformite|conforme)$/i);
    if (typeof s === "string" && s.length) {
      var t = s.toLowerCase();
      if (/(non|incomplet|manquant|expir|perime|absent|attente|rejete|refuse|ko|echec)/.test(t)) return false;
      if (/(conforme|valide|ok|complet|approuve|aprouve|livre|presente)/.test(t)) return true;
      return false;
    }
    if (it && typeof it.conforme === "boolean") return it.conforme;
    if (it && typeof it.ok === "boolean") return it.ok;
    return null; // indéterminé : exclu du calcul
  }

  /** Action « sensible » du journal (suppression, modification, export, échec…). */
  function adtIsSensitive(it, now) {
    var a = txtField(it, /^(action|type|operation|evenement|event|detail|details)$/i) || "";
    if (!a) return false;
    var t = a.toLowerCase();
    if (!/(supprim|effac|delete|modif|edition|edit|export|impress|echec|echoue|erreur|refus|connexion|session|role|permission|droit)/.test(t)) return false;
    var ts = dateTsOf(it);
    if (ts == null) return true; // sans date : compté par prudence
    return (now - ts) <= 7 * 86400000;
  }

  /** Contrats : échéance dans les 30 jours (alerte transverse locale). */
  function ctrEcheanceSoon(it, now) {
    var fin = dateTsOn(it, /(fin|echeance|expiration)/i);
    if (fin == null) return false;
    var st = statutOf(it).toLowerCase();
    if (/(rompu|resilie|termine|fini| clos|cloture|annule)/.test(st)) return false;
    var d = fin - now;
    return d >= -86400000 && d <= 30 * 86400000;
  }

  /** Métriques SPÉCIFIQUES des modules Vague 4. */
  function w4Metrics(key, arr, res) {
    var now = Date.now();
    var out = [];
    try {
      if (key === "ctr") {
        var masse = 0, masseN = 0, actifs = 0, ech30 = 0;
        for (var i = 0; i < arr.length; i++) {
          var it = arr[i];
          var s = numField(it, /(salaire|cout|remuneration|masse)/i);
          if (s != null) { masse += s; masseN++; }
          var st = statutOf(it).toLowerCase();
          if (/(actif|en cours|encours|signe|valide)/.test(st)) actifs++;
          if (ctrEcheanceSoon(it, now)) ech30++;
        }
        out.push(["Masse salariale", masseN ? fmtMoney(masse) : "—"]);
        out.push(["Actifs", fmtInt(actifs) + " / " + fmtInt(arr.length)]);
        out.push(["Échéance ≤ 30 j", fmtInt(ech30)]);
        return out;
      }
      if (key === "tct") {
        var cats = {}, durs = 0, dursN = 0;
        for (var j = 0; j < arr.length; j++) {
          var it2 = arr[j];
          var c = txtField(it2, /^(categorie|category|famille|groupe)$/i);
          if (!c) c = txtField(it2, /^(libelle|nom|titre|label)$/i) || "(divers)";
          cats[c] = (cats[c] || 0) + 1;
          var du = numField(it2, /(duree|mois|jours|months)$/i);
          if (du != null) { durs += du; dursN++; }
        }
        out.push(["Types référencés", fmtInt(arr.length)]);
        out.push(["Catégories", fmtInt(Object.keys(cats).length)]);
        out.push([dursN ? "Durée moyenne (mois)" : "Durées", dursN ? fmtInt(Math.round(durs / dursN)) : "—"]);
        return out;
      }
      if (key === "cnf") {
        var ok = 0, ko = 0;
        for (var k = 0; k < arr.length; k++) {
          var v = cnfIsOk(arr[k]);
          if (v === true) ok++;
          else if (v === false) ko++;
        }
        var tot = ok + ko;
        var pct = tot ? Math.round((ok / tot) * 100) : null;
        out.push(["% conforme", pct == null ? "—" : fmtInt(pct) + " %"]);
        out.push(["Conformes", fmtInt(ok)]);
        out.push(["À corriger", fmtInt(ko)]);
        return out;
      }
      if (key === "adt") {
        var sens = 0, auteurs = {};
        for (var n = 0; n < arr.length; n++) {
          if (adtIsSensitive(arr[n], now)) sens++;
          var au = txtField(arr[n], /^(auteur|user|utilisateur|acteur|par)$/i);
          if (au) auteurs[au] = 1;
        }
        out.push(["Entrées", fmtInt(arr.length)]);
        out.push(["Sensibles (7 j)", fmtInt(sens)]);
        out.push(["Auteurs distincts", fmtInt(Object.keys(auteurs).length || 0)]);
        return out;
      }
    } catch (e) { /* repli : métriques génériques */ }
    return out;
  }

  /* ==========================================================================
   * 7. ALERTES TRANSVERSES (somme des 4 modules W4)
   *    1re intention : __ADMINA_XXX_UI__.alerts ; repli : recomptage local.
   * ========================================================================*/
  function findScanned(key) {
    var arr = state.scanned || [];
    for (var i = 0; i < arr.length; i++) { if (arr[i].key === key) return arr[i]; }
    return null;
  }

  function localAlertCount(key) {
    var mod = findScanned(key);
    if (!mod || !mod.active) return 0;
    var now = Date.now(), n = 0, items = mod.items || [];
    try {
      if (key === "ctr") {
        for (var i = 0; i < items.length; i++) { if (ctrEcheanceSoon(items[i], now)) n++; }
      } else if (key === "cnf") {
        for (var j = 0; j < items.length; j++) { if (cnfIsOk(items[j]) === false) n++; }
      } else if (key === "adt") {
        for (var k = 0; k < items.length; k++) { if (adtIsSensitive(items[k], now)) n++; }
      }
    } catch (e) { return 0; }
    return n;
  }

  function computeAlerts() {
    var defs = [
      { key: "ctr", ui: "__ADMINA_CTR_UI__", label: "Contrats",  txt: "échéance(s) ≤ 30 j" },
      { key: "cnf", ui: "__ADMINA_CNF_UI__", label: "Conformité", txt: "document(s) à corriger" },
      { key: "adt", ui: "__ADMINA_ADT_UI__", label: "Journal",   txt: "action(s) sensible(s) 7 j" },
      { key: "tct", ui: "__ADMINA_TCT_UI__", label: "Types",     txt: "incohérence(s) de référentiel" }
    ];
    var out = { total: 0, items: [] };
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i], n = null, src = "local";
      try {
        var u = window[d.ui];
        if (u && Array.isArray(u.alerts)) { n = u.alerts.length; src = "ui"; }
      } catch (e) { n = null; }
      if (n == null) {
        try { n = d.key === "tct" ? 0 : localAlertCount(d.key); }
        catch (e2) { n = 0; }
      }
      n = Number(n) || 0;
      out.total += n;
      out.items.push({ key: d.key, label: d.label, txt: d.txt, n: n, src: src });
    }
    return out;
  }

  /* ==========================================================================
   * 8. JOURNAL — chaque GÉNÉRATION est tracée (LS admina_journal, max 500)
   * ========================================================================*/
  function pushJournal(detail) {
    var entry = {
      time: isoNow(),
      action: "Export",
      detail: detail,
      role: "RH"
    };
    try {
      var j = lsGet(LS_JOURNAL, []);
      if (!Array.isArray(j)) j = [];
      j.push(entry);
      if (j.length > JOURNAL_MAX) j = j.slice(-JOURNAL_MAX);
      lsSet(LS_JOURNAL, j);
    } catch (e) { /* silencieux */ }
    try {
      var A = window.__ADMINA_AUDIT__;
      if (A && typeof A.push === "function") A.push(entry);
      else if (A && typeof A.log === "function") A.log(entry);
      else if (A && typeof A.add === "function") A.add(entry);
    } catch (e2) { /* silencieux */ }
  }

  /* ==========================================================================
   * 9. TOASTS (informateurs — aucun confirm/alert natif)
   * ========================================================================*/
  function toastBox() {
    if (state.els.toasts && state.els.toasts.isConnected) return state.els.toasts;
    var box = document.createElement("div");
    box.className = "arp-toasts";
    box.setAttribute("aria-live", "polite");
    (state.root && state.root.isConnected ? state.root : document.body).appendChild(box);
    state.els.toasts = box;
    return box;
  }

  function showToast(msg, kind) {
    try {
      var box = toastBox();
      var t = document.createElement("div");
      t.className = "arp-toast arp-toast--" + (kind || "info");
      t.setAttribute("role", "status");
      t.textContent = msg; // textContent : aucune injection
      t.addEventListener("click", function () { dismiss(); });
      box.appendChild(t);
      var done = false;
      function dismiss() {
        if (done) return;
        done = true;
        if (t.parentNode) {
          t.classList.add("arp-toast--out");
          setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
        }
      }
      setTimeout(dismiss, 3400);
    } catch (e) { /* silencieux */ }
  }

  /* ==========================================================================
   * 10. RENDU — construction de la page (aucun nœud natif retiré)
   * ========================================================================*/

  /** Cascade d’ancrage : main (large) → dernier conteneur de #root hors Drawer → #root → body. */
  function findAnchor() {
    var n = null;
    try {
      n = document.querySelector("main");
      if (n && n.getBoundingClientRect().width < 400) n = null; /* main trop étroit = tiroir, pas une zone de contenu */
      if (n && n.nodeType === 1) return n;
    } catch (e) { /* silencieux */ }
    try {
      var r = document.getElementById("root");
      if (r) {
        /* Zone de contenu du layout : dernier DIV de #root qui n’est PAS le Drawer natif. */
        var kids = r.children, best = null;
        for (var i = 0; i < kids.length; i++) {
          var c = kids[i];
          if (c.tagName !== "DIV") continue;
          if (/MuiDrawer-root/.test(c.className || "")) continue; /* le tiroir latéral natif — jamais */
          if (c.getBoundingClientRect && c.getBoundingClientRect().width < 300) continue;
          best = c; /* on garde le dernier trouvé (le layout rend la zone de contenu en dernier) */
        }
        if (best) return best;
        return r;
      }
    } catch (e2) { /* silencieux */ }
    try { return document.body || null; } catch (e3) { return null; }
  }

  /** Sparkline SVG (série mensuelle) — vanilla, léger. */
  function sparkSvg(series) {
    var w = 120, h = 30, max = 1, pts = [];
    for (var i = 0; i < series.length; i++) { if (series[i].count > max) max = series[i].count; }
    for (var j = 0; j < series.length; j++) {
      var x = series.length === 1 ? 0 : (j / (series.length - 1)) * w;
      var y = h - 3 - (series[j].count / max) * (h - 8);
      pts.push(Math.round(x * 10) / 10 + "," + Math.round(y * 10) / 10);
    }
    var line = pts.join(" ");
    var s = '<svg class="arp-spark" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" role="img" aria-label="Tendance sur ' + series.length + ' mois">';
    s += '<polygon class="arp-spark-area" points="0,' + (h - 2) + " " + line + " " + w + "," + (h - 2) + '"></polygon>';
    s += '<polyline class="arp-spark-line" points="' + line + '"></polyline>';
    s += "</svg>";
    return s;
  }

  /** Barre de répartition simple (repli sans série temporelle). */
  function repartHtml(rp) {
    var total = rp.others;
    for (var i = 0; i < rp.parts.length; i++) total += rp.parts[i].c;
    if (!total) return "";
    var segs = "", lgd = [];
    for (var j = 0; j < rp.parts.length; j++) {
      var p = rp.parts[j];
      var pct = Math.round((p.c / total) * 100);
      segs += '<i class="arp-seg arp-seg-' + (j % PALETTE_LEN) + '" style="width:' + pct + '%" title="' + escAttr(p.v) + " : " + fmtInt(p.c) + '"></i>';
      lgd.push('<span class="arp-lgd"><i class="arp-seg-dot arp-seg-' + (j % PALETTE_LEN) + '"></i>' + escHtml(clip(p.v, 16)) + " " + fmtInt(p.c) + "</span>");
    }
    if (rp.others > 0) lgd.push('<span class="arp-lgd"><i class="arp-seg-dot arp-seg-5"></i>Autres ' + fmtInt(rp.others) + "</span>");
    var html = '<div class="arp-repart" role="img" aria-label="Répartition par ' + escAttr(rp.field) + '">' + segs + "</div>";
    html += '<div class="arp-repart-legend">' + lgd.join("") + "</div>";
    html += '<p class="arp-spark-cap">Répartition par « ' + escHtml(rp.field) + ' »</p>';
    return html;
  }

  /** Une carte module (active ou grise). */
  function cardHtml(m) {
    var cls = "arp-card" + (m.active ? "" : " arp-card--off");
    var h = [];
    h.push('<article class="' + cls + '" data-arp-card="' + m.key + '" data-arp-name="' + escAttr(m.name) + '" data-arp-desc="' + escAttr(m.desc) + '">');
    h.push('<header class="arp-card-head">');
    h.push('<span class="arp-mono" aria-hidden="true">' + escHtml(m.mono) + "</span>");
    h.push('<div class="arp-card-idt">');
    h.push('<h3 class="arp-card-name">' + escHtml(m.name) + "</h3>");
    h.push('<span class="arp-card-cat">' + escHtml(m.cat) + "</span>");
    h.push("</div>");
    h.push(m.active
      ? '<span class="arp-state arp-state--on"><i></i>actif</span>'
      : '<span class="arp-state arp-state--off"><i></i>hors session</span>');
    h.push("</header>");
    if (m.active) {
      h.push('<div class="arp-card-count"><strong data-arp-count="' + m.key + '">' + fmtInt(m.count) + "</strong><span>" + (m.count === 1 ? "enregistrement" : "enregistrements") + "</span></div>");
      h.push('<div class="arp-card-metrics">');
      for (var i = 0; i < m.metrics.length; i++) {
        h.push('<div class="arp-metric"><span class="arp-metric-k">' + escHtml(m.metrics[i][0]) + '</span><span class="arp-metric-v">' + escHtml(m.metrics[i][1]) + "</span></div>");
      }
      h.push("</div>");
      if (m.series) {
        h.push(sparkSvg(m.series));
        h.push('<p class="arp-spark-cap">Tendance sur 8 mois glissants</p>');
      } else if (m.repart) {
        h.push(repartHtml(m.repart));
      } else {
        h.push('<p class="arp-spark-cap arp-spark-cap--mute">Série temporelle non détectable — photographie ponctuelle.</p>');
      }
      h.push('<p class="arp-card-desc">' + escHtml(m.desc) + "</p>");
    } else {
      h.push('<p class="arp-card-offtxt">Module non actif sur cette session — aucune donnée agrégée. La carte passera en actif dès que la source sera disponible.</p>');
    }
    h.push("</article>");
    return h.join("");
  }

  /** Graphique SVG vanilla — répartition des enregistrements par module. */
  function renderChart() {
    var box = state.els.chart;
    if (!box) return;
    var rows = [];
    var arr = state.scanned || [];
    for (var i = 0; i < arr.length; i++) { if (arr[i].active && arr[i].count > 0) rows.push(arr[i]); }
    rows.sort(function (a, b) { return b.count - a.count; });
    if (!rows.length) {
      box.innerHTML = '<p class="arp-chart-empty">Aucun enregistrement détecté pour l’instant — les modules actifs apparaîtront ici dès que leurs sources exposent des données.</p>';
      return;
    }
    var max = rows[0].count || 1;
    var rowH = 34, labW = 168, barX = 178, W = 660, H = rows.length * rowH + 12;
    var s = [];
    s.push('<svg class="arp-chart-svg" viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" aria-label="Répartition des enregistrements par module">');
    s.push("<title>Répartition des enregistrements par module</title>");
    for (var r = 0; r < rows.length; r++) {
      var m = rows[r];
      var bw = Math.max(6, Math.round((m.count / max) * (W - barX - 64)));
      var y = r * rowH + 6;
      var col = "var(--arp-c" + (r % PALETTE_LEN) + ")";
      s.push('<g class="arp-row" data-arp-mod="' + m.key + '" tabindex="0" role="button" aria-label="' + escAttr(m.name) + " : " + fmtInt(m.count) + ' enregistrements">');
      s.push('<rect class="arp-row-hit" x="0" y="' + (y - 3) + '" width="' + W + '" height="' + (rowH - 3) + '" fill="transparent"></rect>');
      s.push('<text class="arp-row-lab" x="' + labW + '" y="' + (y + 14) + '" text-anchor="end">' + escHtml(clip(m.name, 20)) + "</text>");
      s.push('<rect class="arp-bar" x="' + barX + '" y="' + y + '" width="' + bw + '" height="19" rx="5" style="fill:' + col + '"></rect>');
      s.push('<text class="arp-row-val" x="' + (barX + bw + 8) + '" y="' + (y + 14) + '">' + fmtInt(m.count) + "</text>");
      s.push("</g>");
    }
    s.push("</svg>");
    box.innerHTML = s.join("");
  }

  /** Clic sur une barre → toast informatif (no-op assumé, lecture seule). */
  function onChartClick(e) {
    try {
      var node = e.target;
      while (node && node !== state.els.chart) {
        if (node.getAttribute && node.getAttribute("data-arp-mod")) break;
        node = node.parentNode;
      }
      if (!node || node === state.els.chart || !node.getAttribute) return;
      var key = node.getAttribute("data-arp-mod");
      var m = findScanned(key);
      if (!m) return;
      showToast("Module " + m.name + " : " + fmtInt(m.count) + " enregistrement" + (m.count === 1 ? "" : "s") + " — consultation seule, géré dans sa page spécialisée.", "info");
    } catch (err) { /* silencieux */ }
  }

  /** Bandeau d’alertes transverses. */
  function renderAlerts() {
    var box = state.els.alerts;
    if (!box) return;
    var al = computeAlerts();
    var h = [];
    h.push('<div class="arp-alerts-head">');
    h.push('<h2 class="arp-alerts-title">Alertes transverses</h2>');
    h.push('<span class="arp-totalbadge ' + (al.total > 0 ? "arp-totalbadge--warn" : "arp-totalbadge--ok") + '">' + fmtInt(al.total) + (al.total === 1 ? " alerte" : " alertes") + "</span>");
    h.push('<span class="arp-alerts-sub">somme des 4 modules Cœur RH (contrats, types, conformité, journal) — lecture seule</span>');
    h.push("</div>");
    if (al.total === 0) {
      h.push('<p class="arp-allok">Aucune alerte transverse — photographie nette à l’instant T. Les pages spécialisées restent les seules à intervenir sur les sujets.</p>');
    } else {
      h.push('<div class="arp-alchips">');
      for (var i = 0; i < al.items.length; i++) {
        var it = al.items[i];
        if (!it.n) continue;
        h.push('<span class="arp-alchip"><b>' + fmtInt(it.n) + "</b> " + escHtml(it.label) + " — " + escHtml(it.txt) + "</span>");
      }
      h.push("</div>");
      h.push('<p class="arp-alnote">Détail et traitement dans les pages spécialisées : ici, on photographie, on ne corrige pas.</p>');
    }
    box.innerHTML = h.join("");
  }

  /** Grille de cartes. */
  function renderGrid() {
    var g = state.els.grid;
    if (!g) return;
    var arr = state.scanned || [];
    var h = [];
    for (var i = 0; i < arr.length; i++) h.push(cardHtml(arr[i]));
    g.innerHTML = h.join("");
    applyFilter();
  }

  /** Héro — compteurs vivants + date de génération figée. */
  function renderHero() {
    var a = 0, recs = 0, arr = state.scanned || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].active) { a++; recs += arr[i].count; }
    }
    if (state.els.liveMods) state.els.liveMods.textContent = fmtInt(a) + (a === 1 ? " module actif" : " modules actifs");
    if (state.els.liveRecs) state.els.liveRecs.textContent = fmtInt(recs) + (recs === 1 ? " enregistrement" : " enregistrements");
    if (state.els.liveGen) state.els.liveGen.textContent = state.generatedAt ? "générée le " + fmtDateTime(state.generatedAt) : "génération en cours…";
    if (state.els.foot) {
      state.els.foot.innerHTML =
        "<p><strong>Photographie de synthèse — lecture seule par principe.</strong> Un rapport qui s’édite est un rapport qui ment : on la consulte, on l’exporte, on l’imprime, et on retourne travailler dans les pages spécialisées.</p>" +
        "<p>" + fmtInt(SOURCES.length) + " sources agrégées · admina-rapport v1.0-w4 · aucune donnée stockée par ce module · génération conservée jusqu’à « Actualiser ».</p>";
    }
  }

  /** Filtre local de cartes (recherche « / »). */
  function applyFilter() {
    var g = state.els.grid;
    if (!g) return;
    var q = normTxt(state.searchQ);
    var cards = g.querySelectorAll("[data-arp-card]");
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var hay = normTxt(c.getAttribute("data-arp-name") + " " + c.getAttribute("data-arp-desc") + " " + (c.getAttribute("data-arp-card") || ""));
      var ok = !q || hay.indexOf(q) !== -1;
      c.classList.toggle("arp-hidden", !ok);
      if (ok) shown++;
    }
    if (state.els.searchInfo) {
      var total = (state.scanned || []).length;
      state.els.searchInfo.textContent = q
        ? shown + " / " + total + " modules affichés"
        : total + " / " + total + " modules";
    }
  }

  /** Aide (touche « ? ») — vrai panneau DIALOG, jamais de dialogue natif. */
  function ensureHelp() {
    if (state.els.help) return state.els.help;
    var ov = document.createElement("div");
    ov.className = "arp-overlay";
    ov.setAttribute("hidden", "");
    ov.innerHTML =
      '<div class="arp-help" role="dialog" aria-modal="true" aria-label="Aide de la photographie de synthèse">' +
      '<header class="arp-help-head"><h2>Aide — Photographie de synthèse</h2>' +
      '<button type="button" class="arp-help-close" data-arp-close aria-label="Fermer l’aide">×</button></header>' +
      '<p class="arp-help-lead">« La photographie de synthèse parcourt toutes les sources actives du système et en tire une photographie à l’instant T. Lecture seule par principe : un rapport qui s’édite est un rapport qui ment. »</p>' +
      '<ul class="arp-help-list">' +
      "<li><kbd>/</kbd> recherche locale d’une carte de module</li>" +
      "<li><kbd>?</kbd> ouvrir / fermer cette aide</li>" +
      "<li><kbd>T</kbd> exporter le rapport consolidé en CSV</li>" +
      "<li><kbd>P</kbd> imprimer la photographie</li>" +
      "<li><kbd>Échap</kbd> fermer l’aide / quitter la recherche</li>" +
      "</ul>" +
      '<p class="arp-help-foot">Aucun bouton de saisie, de modification ou de suppression ici — chaque sujet se traite dans sa page spécialisée.</p>' +
      "</div>";
    ov.addEventListener("click", function (e) {
      if (e.target === ov || (e.target.getAttribute && e.target.getAttribute("data-arp-close"))) {
        toggleHelp(false);
      }
    });
    state.root.appendChild(ov);
    state.els.help = ov;
    return ov;
  }

  function toggleHelp(force) {
    if (!state.active) return;
    var ov = ensureHelp();
    var open = typeof force === "boolean" ? force : ov.hasAttribute("hidden");
    if (open) ov.removeAttribute("hidden");
    else ov.setAttribute("hidden", "");
  }

  /* ==========================================================================
   * 11. EXPORT CSV GLOBAL (BOM, « ; », une section par module)
   * ========================================================================*/
  function csvCell(v) {
    if (v == null) return "";
    if (typeof v === "object") {
      try { v = JSON.stringify(v); } catch (e) { v = String(v); }
    }
    v = String(v);
    if (/[";\r\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  function exportCSV() {
    try {
      var arr = state.scanned || [];
      var a = 0, recs = 0;
      var L = [];
      L.push("Rapport consolidé Admina-RH — Photographie de synthèse");
      L.push("Générée le;" + csvCell(fmtDateTime(state.generatedAt || new Date())));
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].active) { a++; recs += arr[i].count; }
      }
      L.push("Modules actifs;" + a);
      L.push("Enregistrements;" + recs);
      L.push("Lecture seule par principe — un rapport qui s'édite est un rapport qui ment.");
      L.push("");
      for (var k = 0; k < arr.length; k++) {
        var m = arr[k];
        L.push("### " + m.name + (m.active ? " (" + m.count + " enregistrements)" : " (MODULE NON ACTIF SUR CETTE SESSION)"));
        if (!m.active || !m.items || !m.items.length) { L.push(""); continue; }
        /* Entêtes : union des champs des premiers items (stable). */
        var seen = {}, cols = [];
        for (var n = 0; n < m.items.length && n < 50; n++) {
          var it = m.items[n];
          if (!it || typeof it !== "object") continue;
          var ks = Object.keys(it);
          for (var c = 0; c < ks.length; c++) {
            if (!seen[ks[c]]) { seen[ks[c]] = 1; cols.push(ks[c]); }
          }
        }
        L.push(cols.map(csvCell).join(";"));
        for (var r = 0; r < m.items.length; r++) {
          var row = m.items[r];
          var vals = [];
          for (var q = 0; q < cols.length; q++) vals.push(csvCell(row ? row[cols[q]] : ""));
          L.push(vals.join(";"));
        }
        L.push("");
      }
      var blob = new Blob(["\ufeff" + L.join("\r\n")], { type: "text/csv;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "rapport-consolide-" + isoDay(new Date()) + ".csv";
      document.body.appendChild(link);
      link.click();
      setTimeout(function () {
        try { URL.revokeObjectURL(url); if (link.parentNode) link.parentNode.removeChild(link); } catch (e) { /* silencieux */ }
      }, 400);
      pushJournal("Rapport consolidé exporté en CSV (" + a + " modules, " + recs + " enregistrements)");
      showToast("Export CSV lancé — rapport-consolide-" + isoDay(new Date()) + ".csv (" + a + " modules, " + fmtInt(recs) + " enregistrements).", "ok");
    } catch (e) {
      showToast("Export CSV impossible sur ce navigateur (lecture seule préservée).", "warn");
    }
  }

  /* ==========================================================================
   * 12. IMPRESSION — window.print() sous try/catch + classe arp-print
   * ========================================================================*/
  function printReport() {
    try {
      var root = state.root;
      if (root) root.classList.add("arp-print");
      var cleaned = false;
      function cleanup() {
        if (cleaned) return;
        cleaned = true;
        try { if (root) root.classList.remove("arp-print"); } catch (e) { /* silencieux */ }
        try { window.removeEventListener("afterprint", cleanup); } catch (e2) { /* silencieux */ }
      }
      try { window.addEventListener("afterprint", cleanup); } catch (e3) { /* silencieux */ }
      setTimeout(cleanup, 1500);
      window.print();
    } catch (e) {
      showToast("Impression indisponible ici — exportez en CSV depuis la touche T.", "warn");
    }
  }

  /* ==========================================================================
   * 13. SCAN COMPLET + INSTANTANÉ API
   * ========================================================================*/
  function updateSnapshot() {
    var arr = state.scanned || [], mods = [], a = 0, recs = 0;
    for (var i = 0; i < arr.length; i++) {
      mods.push({ key: arr[i].key, name: arr[i].name, active: arr[i].active, count: arr[i].count });
      if (arr[i].active) { a++; recs += arr[i].count; }
    }
    snapshot.modules = mods;
    snapshot.counts = { modules: a, records: recs };
    snapshot.generatedAt = state.generatedAt ? state.generatedAt.toISOString() : null;
  }

  /**
   * Scan complet de toutes les sources + rendu.
   * @param {boolean} logIt — true : considéré comme une GÉNÉRATION (journal).
   */
  function fullScan(logIt) {
    if (state.scanning) return;
    state.scanning = true;
    try {
      var out = [];
      for (var i = 0; i < SOURCES.length; i++) out.push(scanFull(SOURCES[i]));
      state.scanned = out;
      state.generatedAt = new Date();
      updateSnapshot();
      renderHero();
      renderAlerts();
      renderGrid();
      renderChart();
      if (logIt && !state.journalDone) {
        state.journalDone = true;
        pushJournal("Rapport consolidé généré (" + snapshot.counts.modules + " modules, " + snapshot.counts.records + " enregistrements)");
      }
    } finally {
      state.scanning = false;
    }
  }

  /** Re-scan complet différé (nouvelle source apparue) — sans re-journaliser. */
  function scheduleFullScan() {
    if (state.fullTimer) clearTimeout(state.fullTimer);
    state.fullTimer = setTimeout(function () {
      state.fullTimer = 0;
      if (state.active) fullScan(false);
    }, SCAN_DEBOUNCE);
  }

  /** Actualiser : recalcule TOUT (nouvelle génération, journalisée). */
  function doRefresh() {
    if (!state.active) return;
    var b = state.els.btnRefresh;
    if (b) { b.disabled = true; b.classList.add("arp-busy"); }
    setTimeout(function () {
      try {
        state.journalDone = false;
        fullScan(true);
        showToast("Photographie recalculée — " + snapshot.counts.modules + " modules actifs, " + fmtInt(snapshot.counts.records) + " enregistrements.", "ok");
      } catch (e) { /* silencieux */ } finally {
        if (b) { b.disabled = false; b.classList.remove("arp-busy"); }
      }
    }, 60);
  }

  /* ==========================================================================
   * 14. POLLER 1200 ms — compteurs seulement (léger), génération figée
   * ========================================================================*/
  function pollTick() {
    if (!state.active) return;
    applyDark();
    var root = state.root;
    if (!root || !root.isConnected) {
      /* Le layout natif a pu réconcilier le DOM : on se ré-accroche. */
      if (!state.reconnectTimer) {
        state.reconnectTimer = setTimeout(function () {
          state.reconnectTimer = 0;
          if (state.active && (!state.root || !state.root.isConnected)) {
            var anchor = findAnchor();
            if (anchor && !document.getElementById(ROOT_ID)) mountWithRetry(10);
          }
        }, RETRY_MS);
      }
      return;
    }
    var arr = state.scanned;
    if (!arr) { fullScan(true); return; }
    var dirty = false, appeared = false;
    for (var i = 0; i < arr.length; i++) {
      var m = arr[i];
      var c = quickCount(SOURCES[i] || m);
      if (m.active) {
        if (c == null) { appeared = true; break; } // la source a disparu → re-scan
        if (c !== m.count) { m.count = c; dirty = true; }
      } else if (c != null) {
        appeared = true; break;                    // nouvelle source → re-scan
      }
    }
    /* Compteurs des cartes (patch ciblé, sans re-rendu complet). */
    var counts = root.querySelectorAll("[data-arp-count]");
    for (var k = 0; k < counts.length; k++) {
      var key = counts[k].getAttribute("data-arp-count");
      var mod = findScanned(key);
      if (mod && mod.active) counts[k].textContent = fmtInt(mod.count);
    }
    renderHero();
    if (dirty) { renderChart(); renderAlerts(); }
    if (appeared) scheduleFullScan();
  }

  /* ==========================================================================
   * 15. MONTAGE / DÉMONTAGE (cascade d’ancrage, réessais 30 × 450 ms)
   * ========================================================================*/
  function buildPage(anchor) {
    var root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "arp-page";
    root.setAttribute("data-arp-page", "");
    root.setAttribute("aria-label", "Photographie de synthèse — rapport consolidé");

    root.innerHTML =
      '<div class="arp-hero">' +
      '  <p class="arp-kicker">Admina-RH · /audit · Rapport consolidé</p>' +
      '  <h1 class="arp-title">Photographie de synthèse</h1>' +
      '  <p class="arp-live" aria-live="polite">' +
      '    <span class="arp-chip" data-arp-live="mods">…</span>' +
      '    <span class="arp-chip" data-arp-live="recs">…</span>' +
      '    <span class="arp-chip arp-chip--gen" data-arp-live="gen">…</span>' +
      "  </p>" +
      '  <blockquote class="arp-phil">« LA PHOTOGRAPHIE DE SYNTHÈSE — Chaque page de l\'application gère son propre sujet : ici, on ne gère rien. Cette page est le rapport consolidé : elle parcourt toutes les sources actives du système et en tire une photographie à l\'instant T. Elle est en lecture seule par principe : un rapport qui s\'édite est un rapport qui ment. On la consulte, on l\'exporte, on l\'imprime — et on retourne travailler dans les pages spécialisées. »</blockquote>' +
      '  <div class="arp-actions">' +
      '    <button type="button" class="arp-btn arp-btn--primary" data-arp-act="refresh">Actualiser</button>' +
      '    <button type="button" class="arp-btn arp-btn--ghost" data-arp-act="csv">Export CSV</button>' +
      '    <button type="button" class="arp-btn arp-btn--ghost" data-arp-act="print">Imprimer</button>' +
      "  </div>" +
      "</div>" +
      '<div class="arp-alerts" data-arp-zone="alerts"></div>' +
      '<div class="arp-toolbar">' +
      '  <input type="text" class="arp-search" placeholder="Filtrer les cartes de modules… (touche /)" aria-label="Rechercher un module" autocomplete="off" spellcheck="false">' +
      '  <span class="arp-search-info" data-arp-live="info"></span>' +
      "</div>" +
      '<div class="arp-grid" data-arp-zone="grid"></div>' +
      '<section class="arp-chart-wrap" aria-label="Répartition des enregistrements par module">' +
      '  <h2 class="arp-h2">Répartition des enregistrements par module</h2>' +
      '  <div class="arp-chart" data-arp-zone="chart"></div>' +
      '  <p class="arp-chart-note">Clic sur une barre : détail informatif uniquement — aucun traitement ne se fait ici.</p>' +
      "</section>" +
      '<footer class="arp-foot" data-arp-zone="foot"></footer>';

    anchor.appendChild(root); // à côté des nœuds natifs — rien n’est retiré

    state.root = root;
    state.els = {
      root: root,
      liveMods: root.querySelector('[data-arp-live="mods"]'),
      liveRecs: root.querySelector('[data-arp-live="recs"]'),
      liveGen: root.querySelector('[data-arp-live="gen"]'),
      alerts: root.querySelector('[data-arp-zone="alerts"]'),
      search: root.querySelector(".arp-search"),
      searchInfo: root.querySelector('[data-arp-live="info"]'),
      grid: root.querySelector('[data-arp-zone="grid"]'),
      chart: root.querySelector('[data-arp-zone="chart"]'),
      foot: root.querySelector('[data-arp-zone="foot"]'),
      btnRefresh: root.querySelector('[data-arp-act="refresh"]'),
      help: null,
      toasts: null
    };

    /* Événements de la page (délégations locales). */
    state.els.btnRefresh.addEventListener("click", doRefresh);
    root.querySelector('[data-arp-act="csv"]').addEventListener("click", exportCSV);
    root.querySelector('[data-arp-act="print"]').addEventListener("click", printReport);
    state.els.search.addEventListener("input", function () {
      state.searchQ = state.els.search.value || "";
      applyFilter();
    });
    state.els.chart.addEventListener("click", onChartClick);
  }

  function mountWithRetry(triesLeft) {
    if (!state.active) return;
    if (state.root && state.root.isConnected && state.els.grid) return;
    /* Nettoyage d’un éventuel root partiel (idempotence, jamais de doublon). */
    try {
      var stale = document.getElementById(ROOT_ID);
      if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
      state.root = null;
    } catch (e0) { /* silencieux */ }
    var anchor = findAnchor();
    if (!anchor) {
      if (triesLeft > 0) setTimeout(function () { mountWithRetry(triesLeft - 1); }, RETRY_MS);
      return;
    }
    try { buildPage(anchor); } catch (e) {
      if (triesLeft > 0) setTimeout(function () { mountWithRetry(triesLeft - 1); }, RETRY_MS);
      return;
    }
    if (state.root && state.root.isConnected) {
      state.searchQ = "";
      fullScan(true); // GÉNÉRATION initiale (journalisée)
    } else if (triesLeft > 0) {
      setTimeout(function () { mountWithRetry(triesLeft - 1); }, RETRY_MS);
    }
  }

  /** Désactivation propre : hors scope, on retire TOUT notre rendu. */
  function deactivate() {
    state.active = false;
    if (state.fullTimer) { clearTimeout(state.fullTimer); state.fullTimer = 0; }
    if (state.routeTimer) { clearTimeout(state.routeTimer); state.routeTimer = 0; }
    try {
      if (state.root) {
        if (state.root.parentNode) state.root.parentNode.removeChild(state.root);
        state.root = null;
      }
    } catch (e) { /* silencieux */ }
    state.els = {};
    var h = document.documentElement;
    try {
      h.classList.remove("admina-arp");
      h.removeAttribute("data-arp-dark");
    } catch (e2) { /* silencieux */ }
  }

  function activate() {
    if (state.active) return;
    state.active = true;
    state.journalDone = false;
    try { document.documentElement.classList.add("admina-arp"); } catch (e) { /* silencieux */ }
    applyDark();
    mountWithRetry(MOUNT_TRIES);
  }

  /* ==========================================================================
   * 16. ROUTE + RACCOURCIS (350 ms + popstate ; seulement / ? T P)
   * ========================================================================*/
  function inScope() {
    try { return PAGE_RE.test(window.location.pathname); }
    catch (e) { return false; }
  }

  function routeCheck() {
    var s = inScope();
    if (s && !state.active) activate();
    else if (!s && state.active) deactivate();
  }

  function onKey(e) {
    if (!state.active) return;
    var t = e.target || {};
    var tag = String(t.tagName || "").toUpperCase();
    var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
    if (e.key === "Escape") {
      if (state.els.help && !state.els.help.hasAttribute("hidden")) { toggleHelp(false); return; }
      if (typing && state.els.search) { state.els.search.blur(); }
      return;
    }
    if (typing) return; // on ne capte rien pendant une saisie
    if (e.key === "/") {
      e.preventDefault();
      if (state.els.search) state.els.search.focus();
    } else if (e.key === "?") {
      e.preventDefault();
      toggleHelp();
    } else if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      exportCSV();
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      printReport();
    }
    /* Aucun autre raccourci : la photographie ne pilote rien d’autre. */
  }

  /* ==========================================================================
   * 17. API PUBLIQUE (les 2 seules globales du module, v1.0-w4)
   * ========================================================================*/
  window.__ADMINA_ARP_API__ = {
    version: "1.0-w4",
    route: "/audit",
    getData: function () {
      return {
        modules: snapshot.modules,
        counts: { modules: snapshot.counts.modules, records: snapshot.counts.records },
        generatedAt: snapshot.generatedAt
      };
    }
  };

  window.__ADMINA_ARP_UI__ = {
    version: "1.0-w4",
    refresh: doRefresh,
    exportCSV: exportCSV,
    print: printReport,
    toast: showToast,
    help: function () { toggleHelp(true); }
  };

  /* ==========================================================================
   * 18. INIT — un seul passage ; flag posé en FIN d’init (idempotence)
   * ========================================================================*/
  var inited = false;

  function init() {
    if (inited) return;
    inited = true;

    /* Garde de route : 350 ms d’intervalle + popstate (désactivation propre). */
    setInterval(routeCheck, ROUTE_MS);
    try {
      window.addEventListener("popstate", function () {
        if (state.routeTimer) clearTimeout(state.routeTimer);
        state.routeTimer = setTimeout(routeCheck, ROUTE_MS);
      });
    } catch (e) { /* silencieux */ }

    /* Raccourcis : seulement / (recherche), ? (aide), T (export), P (imprimer). */
    try { document.addEventListener("keydown", onKey); } catch (e2) { /* silencieux */ }

    /* Poller léger 1200 ms : compteurs uniquement, génère rien, n’écrit rien. */
    setInterval(pollTick, POLL_MS);

    /* Première entrée si l’utilisateur est déjà sur /audit. */
    routeCheck();

    /* flag FIN d’init — le garde en tête protège toute ré-exécution. */
    window.__ADMINA_ARP_W4__ = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
