const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, PageNumber, PageBreak,
        BorderStyle, ShadingType, WidthType, TableLayoutType, SectionType,
        TableOfContents, TabStopType, TabStopPosition } = require('docx');

// ─── Palette: DM-1 Deep Cyan (Tech/AI) ───
const PAL = {
  bg: "162235", primary: "FFFFFF", accent: "37DCF2",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
  table: { headerBg: "1B6B7A", headerText: "FFFFFF", accentLine: "1B6B7A", innerLine: "C8DDE2", surface: "EDF3F5" }
};
const c = (hex) => hex.replace("#", "");

// ─── No borders helper ───
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ─── Helper: body paragraph (French = no CJK indent) ───
function bodyP(text, opts = {}) {
  return new Paragraph({
    spacing: { line: 312, after: 100 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    ...opts.paraOpts,
    children: [new TextRun({ text, size: 24, color: "1A2B40", font: { ascii: "Calibri", eastAsia: "SimHei" }, ...opts.runOpts })],
  });
}

// Helper: bold label + normal text in one paragraph
function labelP(label, text, opts = {}) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    ...opts.paraOpts,
    children: [
      new TextRun({ text: label, size: 24, bold: true, color: "1A2B40", font: { ascii: "Calibri" } }),
      new TextRun({ text, size: 24, color: "1A2B40", font: { ascii: "Calibri" } }),
    ],
  });
}

// Helper: bullet item
function bulletP(text, level = 0) {
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    indent: { left: 600 + level * 400, hanging: 300 },
    children: [new TextRun({ text: "\u2022  " + text, size: 24, color: "1A2B40", font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

// Helper: sub-bullet (dash)
function subBulletP(text) {
  return new Paragraph({
    spacing: { line: 312, after: 50 },
    indent: { left: 1000, hanging: 300 },
    children: [new TextRun({ text: "-  " + text, size: 22, color: "3A4A5A", font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

// Helper: code block paragraph (monospace)
function codeP(text) {
  return new Paragraph({
    spacing: { line: 260, after: 0 },
    shading: { type: ShadingType.CLEAR, fill: "F4F8FC" },
    indent: { left: 400 },
    children: [new TextRun({ text, size: 18, font: { ascii: "Consolas", eastAsia: "SimHei" }, color: "2A3A4A" })],
  });
}

// Helper: table cell
function tc(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: PAL.table.innerLine },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: PAL.table.innerLine },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    },
    margins: { top: 50, bottom: 50, left: 100, right: 100 },
    children: [new Paragraph({
      spacing: { line: 280, after: 0 },
      children: [new TextRun({
        text, size: opts.headerSize || 20,
        bold: !!opts.bold,
        color: opts.headerText || "1A2B40",
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      })],
    })],
  });
}

// Helper: header cell
function hc(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: PAL.table.headerBg },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: PAL.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: PAL.table.accentLine },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      spacing: { line: 280, after: 0 },
      children: [new TextRun({ text, size: 20, bold: true, color: PAL.table.headerText, font: { ascii: "Calibri" } })],
    })],
  });
}

// Helper: create table from data
function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const pctWidths = colWidths.map(w => (w / totalW * 100).toFixed(1));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => hc(h, pctWidths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        cantSplit: true,
        children: row.map((cell, ci) => tc(cell, {
          shading: ri % 2 === 0 ? PAL.table.surface : "FFFFFF",
          width: pctWidths[ci],
        })),
      })),
    ],
  });
}

// Helper: page section heading (like PAGE 01)
function pageHeading(num, title, route) {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 400, after: 100 },
      children: [new TextRun({ text: `PAGE ${num} — ${title} (${route})`, bold: true, size: 26, color: "0A1628", font: { ascii: "Calibri", eastAsia: "SimHei" } })],
    }),
  ];
}

// Helper: field label with detail
function fieldDetail(label, value) {
  return new Paragraph({
    spacing: { line: 312, after: 50 },
    indent: { left: 400 },
    children: [
      new TextRun({ text: label + " : ", bold: true, size: 22, color: "2A3A4A", font: { ascii: "Calibri" } }),
      new TextRun({ text: value, size: 22, color: "3A4A5A", font: { ascii: "Calibri", eastAsia: "SimHei" } }),
    ],
  });
}

// ─── COVER (R1 Pure Paragraph Left) ───
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = [title]; // Simple: no CJK semantic breaks needed for French
    if (title.length <= cpl * 3) break;
    titlePt -= 2;
  }
  if (!lines) lines = [title];
  return { titlePt: Math.max(titlePt, minPt), titleLines: lines };
}

function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, metaLineCount = 0, fixedHeight = 400 } = params;
  const SAFETY = 1200;
  const usableHeight = 16838 - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = Math.max(usableHeight - contentHeight, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(remainingSpace * 0.45);
  const rawBottom = Math.floor(remainingSpace * 0.45);
  let bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  bottomSpacing = Math.min(bottomSpacing, 4200); // cap to prevent cover overflow
  let topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  topSpacing = Math.min(topSpacing, 4200); // cap to prevent cover overflow
  return { topSpacing, bottomSpacing };
}

function buildCoverR1(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle,
    metaLineCount: (config.metaLines || []).length,
    fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];

  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));

  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel, size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 40 })],
    }));
  }

  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: P.titleColor, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
    }));
  }

  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
    }));
  }

  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: P.metaColor, font: { ascii: "Calibri" } })],
    }));
  }

  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));

  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: { ascii: "Calibri" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Calibri" } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({ height: { value: 16838, rule: "exact" }, children: [
      new TableCell({ shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders, children })
    ] })],
  })];
}

// ─── DOCUMENT CONTENT ───
function buildContent() {
  const content = [];

  // ═══════════════════════════════════════════
  // REGLE SUPREME
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "Regle Supreme", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  // Alert box using table with red-ish shading
  content.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, left: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, right: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, insideHorizontal: NB, insideVertical: NB },
    rows: [new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: "FDF2F2" }, borders: { top: NB, bottom: NB, left: NB, right: NB },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [
        new Paragraph({ spacing: { line: 312, after: 80 },
          children: [new TextRun({ text: "Ne JAMAIS modifier, supprimer ou alterer les pages, composants et donnees listes dans la section [FROZEN] ci-dessous. Toute modification d'un element gele est INTERDITE.", bold: true, size: 24, color: "C0392B", font: { ascii: "Calibri" } })] }),
        new Paragraph({ spacing: { line: 312, after: 0 },
          children: [new TextRun({ text: "En cas de doute, verifiez les screenshots dans /frozen-snapshots/.", size: 24, color: "7B241C", font: { ascii: "Calibri" } })] }),
      ],
    })] })],
  }));
  content.push(new Paragraph({ spacing: { after: 200 } }));

  // ═══════════════════════════════════════════
  // 1. ARCHITECTURE DU PROJET
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "1. Architecture du projet", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  const archLines = [
    "Admina-RH/",
    "  src/",
    "    App.jsx              # [FROZEN] Routeur principal, sidebar, layout",
    "    components/",
    "      Sidebar.jsx       # [FROZEN] Menu lateral complet avec 26 liens",
    "      Header.jsx        # [FROZEN] Barre superieure (recherche, notifs, user)",
    "      KPICard.jsx       # [FROZEN] Composant carte KPI reutilisable",
    "    pages/",
    "      TableauDeBord.jsx   # [FROZEN] /",
    "      Entretiens.jsx      # [FROZEN] /entretiens",
    "      Evaluations.jsx     # [FROZEN] /evaluations",
    "      Verifications.jsx   # [FROZEN] /verifications",
    "      Selections.jsx      # [FROZEN] /selections",
    "      Cabinets.jsx        # [FROZEN] /cabinets",
    "      Contrats.jsx        # [FROZEN] /contrats",
    "      Integration.jsx     # [FROZEN] /integration",
    "      Checklist.jsx       # [FROZEN] /checklist",
    "      PeriodeEssai.jsx    # [FROZEN] /periode-essai",
    "      Formation.jsx       # [FROZEN] /formation",
    "      PostEmbauche.jsx    # [FROZEN] /post-embauche",
    "      Stagiaires.jsx      # [FROZEN] /stagiaires",
    "      Saisonniers.jsx     # [FROZEN] /saisonniers",
    "      Previsions.jsx      # [FROZEN] /previsions",
    "      Sources.jsx         # [FROZEN] /sources",
    "      Couts.jsx           # [FROZEN] /couts",
    "      Pipeline.jsx        # [FROZEN] /pipeline",
    "      Documents.jsx       # [FROZEN] /documents",
    "      Conformite.jsx      # [FROZEN] /conformite",
    "      Parametres.jsx      # [FROZEN] /parametres",
    "      Audit.jsx           # [FROZEN] /audit",
    "      TypesContrats.jsx   # [FROZEN] /types-contrats",
    "      Departements.jsx    # [FROZEN] /departements",
    "      SourcesROI.jsx      # [FROZEN] /sources-roi",
    "      Experiences.jsx     # [FROZEN] /experiences",
    "      FormationsCandidats.jsx # [FROZEN] /formations",
    "      Competences.jsx     # [FROZEN] /competences",
    "      Statuts.jsx         # [FROZEN] /statuts",
    "      Demandes.jsx        # [DEV] /offres — PAGE EN CONSTRUCTION",
    "      Candidats.jsx       # [DEV] /candidats — PAGE EN CONSTRUCTION",
    "    data/",
    "      nomenclatures.js    # [FROZEN] 38 listes de reference",
    "  AI_GUIDE.md            # CE FICHIER",
    "  FROZEN_STATE.md        # Etat detaille du gel",
    "  frozen-snapshots/      # 28 screenshots de reference",
  ];
  for (const line of archLines) {
    content.push(codeP(line));
  }
  content.push(new Paragraph({ spacing: { after: 200 } }));

  // ═══════════════════════════════════════════
  // 2. FROZEN — PAGES GELEES
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "2. FROZEN — Pages gelees (16 pages)", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  // Rules for frozen pages
  const frozenRules = [
    "NE PAS modifier les colonnes existantes d'un tableau",
    "NE PAS supprimer ou renommer un champ affiche",
    "NE PAS changer le titre, le sous-titre ou la description",
    "NE PAS modifier les KPI cards (texte, valeur, calcul)",
    "NE PAS changer le style MUI/Material UI des composants existants",
    "NE PAS modifier les donnees d'exemple (mock data) visibles",
    "NE PAS alterer les filtres, boutons et actions existants",
    "AUTORISE : AJOUTER de nouvelles colonnes a DROITE des existantes",
    "AUTORISE : AJOUTER de nouveaux KPI cards a COTE des existants",
    "AUTORISE : AJOUTER de nouveaux filtres",
    "AUTORISE : AJOUTER de nouveaux boutons d'action",
    "Verification : Comparer avec le screenshot correspondant dans /frozen-snapshots/",
  ];
  for (const rule of frozenRules) {
    const isAllowed = rule.startsWith("AUTORISE");
    content.push(new Paragraph({
      spacing: { line: 312, after: 50 },
      indent: { left: 400 },
      children: [
        new TextRun({ text: (isAllowed ? "  " : "  ") + rule, size: 22,
          color: isAllowed ? "1B6B7A" : "C0392B",
          font: { ascii: "Calibri" } }),
      ],
    }));
  }
  content.push(new Paragraph({ spacing: { after: 200 } }));

  // ── All 29 page descriptions ──
  const pages = [
    { num: "01", title: "Tableau de Bord", route: "/", screenshot: "01_tableau-de-bord.png",
      pageTitle: "Tableau de Bord", subtitle: "Vue d'ensemble de votre activite de recrutement",
      kpis: [
        { label: "Total Demandes", value: "8", sub: "5 demandes ouvertes" },
        { label: "Total Candidats", value: "10", sub: "9 candidats actifs" },
        { label: "Taux de Conversion", value: "20.0%", sub: "2 retenus / 10 candidats" },
        { label: "Delai Moyen", value: "27 j", sub: "jours ouvrés" },
      ],
      charts: [
        "Evolution du Recrutement (lineaire, Oct 2024-Fev 2025, 2 series)",
        "Sources de Recrutement (barres horizontales, 6 sources)",
        "Repartition par Departement (donut, 8 departements)",
        "Statuts des Demandes (barres, 6 statuts)",
      ],
      lists: [
        "Demandes Recentes (5 items: DR-2025-008, 006, 003, 004, 002)",
        "Candidats Recents (5 items: Eyenga, Bikay, Nkoulou, Kamga, Mebara)",
      ],
      fields: ["No, Poste, Departement (chip), Statut (chip), Date", "Nom complet, No CAN, Source (chip), Etape (chip), Score (/20)"] },

    { num: "02", title: "Pipeline Candidatures", route: "/pipeline", screenshot: "19_pipeline-candidatures.png",
      pageTitle: "Pipeline de Recrutement", subtitle: "Glissez-deposez les candidats entre les colonnes",
      kpis: [],
      columns: "8 Colonnes Kanban : Nouvelle candidature, CV recus, Pre-selection, Entretien telephonique, Entretien physique, Test technique, Verification references, Proposition envoyee, Embauche",
      fields: ["Nom candidat, Poste, Source, Priorite (chip), Date, Score (/20)"] },

    { num: "03", title: "Planning Entretiens", route: "/entretiens", screenshot: "03_planning-entretiens.png",
      pageTitle: "Planification des Entretiens", counter: "7 entretien(s)", btn: "Ajouter Entretien",
      filters: ["Tous", "Planifies", "Realises", "Annules"],
      columns: "Candidat, Type, Date & Heure, Duree, Lieu/Lien, Evaluateur(s), Statut, Resultat, Actions",
      data: "7 lignes (Ndiaye, Tchouankou, Nganou x2, Mebara, Kamga, Nkoulou Brandon)" },

    { num: "04", title: "Grille Evaluation", route: "/evaluations", screenshot: "04_grille-evaluation.png",
      pageTitle: "Evaluations des Candidats", counter: "3 evaluation(s) enregistrée(s)", btn: "Nouvelle Evaluation",
      kpis: [{ label: "TOTAL EVALUATIONS", value: "3" }, { label: "SCORE MOYEN", value: "15.1/20" }, { label: "RECOMMANDATION EMBAUCHE", value: "2" }, { label: "RECOMMANDATION REFUS", value: "1" }],
      fields: ["Nom candidat + Evaluateur + date", "Bouton recommandation : Embaucher / Ne pas embaucher", "5 criteres /5 : Competences techniques, Experience professionnelle, Qualites humaines, Motivation, Adequation au poste", "Total /25 + Score /20", "Zone Commentaire global", "3 Evaluations : Ndiaye Moussa (23.8/25), Tchouankou Claire (19.7/25), Nkoulou Brandon (13.0/25)"] },

    { num: "05", title: "Verification References", route: "/verifications", screenshot: "05_verification-references.png",
      pageTitle: "Verification des References", counter: "2 verifications enregistrees", btn: "Ajouter Verification",
      kpis: [{ label: "TOTAL", value: "2" }, { label: "VERIFIES", value: "2" }, { label: "EN ATTENTE", value: "0" }, { label: "NON VERIFIES", value: "0" }],
      columns: "Candidat, Entreprise, Contact, Telephone, Date Verification, Verificateur, Statut, Resultat, Actions",
      data: "2 donnees : Ndiaye Moussa (Hotel Sawa), Tabe Arnaud (Hotel Select)" },

    { num: "06", title: "Selections", route: "/selections", screenshot: "06_selections.png",
      pageTitle: "Selections", subtitle: "Gestion des shortlists et decisions de recrutement",
      kpis: [{ label: "Total", value: "10" }, { label: "Retenus", value: "2" }, { label: "Rejetes", value: "2" }, { label: "En attente", value: "1" }],
      columns: "Candidat, Poste, Departement, Date Selection, Decideur, Statut, Note, Actions", btn: "Nouvelle Selection",
      data: "10 donnees : Nkoulou CAN-012 a Moukouri CAN-066" },

    { num: "07", title: "Gestion Cabinets", route: "/cabinets", screenshot: "07_gestion-cabinets.png",
      pageTitle: "Gestion des Cabinets", counter: "12 cabinets partenaires", btn: "Nouveau Cabinet",
      kpis: [{ label: "TOTAL CABINETS", value: "12" }, { label: "TAUX REUSSITE MOYEN", value: "27.7%" }, { label: "CANDIDATS FOURNIS TOTAL", value: "117" }],
      columns: "No Cabinet, Cabinet/Agence, Specialite, Contact, Telephone, Email, Ville, Candidats Fournis, Recrutements, Taux Reussite (%)",
      data: "10 donnees : CA-001 (HRC Cameroon) a CA-010 (Interne)" },

    { num: "08", title: "Suivi Contrats", route: "/contrats", screenshot: "08_suivi-contrats.png",
      pageTitle: "Suivi des Contrats", counter: "12 contrats au total", btn: "Exporter CSV, Nouveau Contrat",
      kpis: [{ label: "TOTAL", value: "12" }, { label: "EN COURS", value: "10" }, { label: "ECHUS", value: "1" }, { label: "A RENOUVELER", value: "1" }],
      columns: "No Contrat, Employe, Poste, Departement, Type Contrat, Date Debut, Date Fin, Duree (mois), Salaire Brut (FCFA), Statut",
      data: "CT-001 (Nkoulou Amina) a CT-010 (Ouedraogo Ibrahim)" },

    { num: "09", title: "Integration Employe", route: "/integration", screenshot: "09_integration-employe.png",
      pageTitle: "Integration Employe", counter: "9 integrations", btn: "Nouvelle Integration",
      kpis: [{ label: "EN COURS", value: "2" }, { label: "TERMINEES", value: "7" }, { label: "EN RETARD", value: "0" }],
      columns: "No, Employe, Poste, Departement, Date Arrivee, Manager Accueillant, Documents Admin, Formation Securite, Equipement Badge, Compte Informatique",
      data: "INT-001 a INT-009" },

    { num: "10", title: "Checklist Integration", route: "/checklist", screenshot: "10_checklist-integration.png",
      pageTitle: "Checklist d'Integration", counter: "11 taches au total", btn: "Exporter CSV, Nouvelle Tache",
      kpis: [{ label: "TOTAL TACHES", value: "11" }, { label: "FAITES", value: "9" }, { label: "EN COURS", value: "1" }, { label: "A FAIRE", value: "1" }],
      columns: "No, Employe, Poste, Categorie, Etape/Tache, Responsable, Date Prevue, Date Realisee, Statut",
      data: "CHK-001 a CHK-010, Categories : Documents administratifs, Formation securite, Equipement & Badge, Compte informatique, Formation metier" },

    { num: "11", title: "Periode d'Essai", route: "/periode-essai", screenshot: "11_periode-essai.png",
      pageTitle: "Periodes d'Essai", btn: "Exporter CSV, Ajouter",
      kpis: [{ label: "Total Periodes", value: "10" }, { label: "Taux de Reussite", value: "71%" }, { label: "Note Moyenne", value: "14.6/20" }],
      columns: "No, Employe, Poste, Departement, Type Contrat, Date Debut Essai, Date Fin Essai, Duree (jours), Evaluateur, Note Globale (/20), Decision",
      data: "ESS-001 a ESS-010, Decisions : En cours, Embauche confirmee, Prolongation essai, Rupture essai" },

    { num: "12", title: "Plan Accueil Formation", route: "/formation", screenshot: "12_plan-accueil-formation.png",
      pageTitle: "Plan d'Accueil & Formations", counter: "12 formations au total", btn: "Exporter CSV, Nouvelle Formation",
      kpis: [{ label: "TOTAL FORMATIONS", value: "12" }, { label: "HEURES TOTALES", value: "114h" }, { label: "NOTE MOYENNE", value: "16.5/20" }],
      columns: "No, Employe, Poste, Module Formation, Formateur, Date Debut, Date Fin, Duree (h), Statut, Eval. /20",
      data: "FMT-001 a FMT-010, Statuts : Terminee, En cours" },

    { num: "13", title: "Suivi Post-Embauche", route: "/post-embauche", screenshot: "13_suivi-post-embauche.png",
      pageTitle: "Suivi Post-Embauche", btn: "Exporter CSV, Ajouter",
      kpis: [{ label: "Total Suivis", value: "9" }, { label: "Satisfaction Moyenne", value: "4.4/5" }, { label: "Risque Moyen", value: "1.1/4" }],
      columns: "No, Employe, Poste, Departement, Date Embauche, Anciennete (mois), Eval 1 mois (/20), Eval 3 mois (/20), Eval 6 mois (/20), Satisfaction",
      data: "SPE-001 a SPE-009, Satisfaction : Satisfait, Tres satisfait" },

    { num: "14", title: "Stagiaires", route: "/stagiaires", screenshot: "14_stagiaires.png",
      pageTitle: "Stagiaires", btn: "Exporter CSV, Ajouter",
      kpis: [{ label: "Total Stagiaires", value: "10" }, { label: "En Cours", value: "7" }, { label: "Indemnite Totale", value: "490 000 FCFA" }],
      columns: "No, Nom, Prenom, Etablissement, Formation, Departement Accueil, Tuteur, Date Debut, Date Fin, Duree (jours)",
      data: "STG-001 (Tchoumi Sandra) a STG-010 (Bikay Patricia)" },

    { num: "15", title: "Saisonniers & Temporaires", route: "/saisonniers", screenshot: "15_saisonniers-temporaires.png",
      pageTitle: "Saisonniers", btn: "Exporter CSV, Ajouter",
      kpis: [{ label: "Total Saisonniers", value: "10" }, { label: "Cout Total", value: "3 956 300 FCFA" }, { label: "Duree Moyenne", value: "87 jours" }],
      columns: "No, Nom, Prenom, Poste, Departement, Date Debut, Date Fin, Duree (jours), Statut, Taux Horaire (FCFA), Cout Total (FCFA)",
      data: "SAI-001 (Nkoum Patrick) a SAI-010 (Tchouankou Gloire)" },

    { num: "16", title: "Previsions Postes & Offres", route: "/previsions", screenshot: "16_previsions-postes-offres.png",
      pageTitle: "Previsions — Postes & Offres", counter: "11 offres previsionnelles", btn: "Exporter CSV, Nouvelle Prevision",
      kpis: [{ label: "TOTAL POSTES PREVUS", value: "11" }, { label: "ECART TOTAL", value: "+14" }, { label: "BUDGET TOTAL", value: "2 760 000 FCFA" }],
      columns: "No Offre, Departement, Poste, Effectif Actuel, Effectif Prevu, Ecart, Motif, Date Besoin, Priorite, Statut, Canal Diffusion",
      data: "PO-001 a PO-010" },

    { num: "17", title: "Sources de Recrutement", route: "/sources", screenshot: "17_sources-recrutement.png",
      pageTitle: "Sources de Recrutement", btn: "Ajouter",
      kpis: [{ label: "Sources actives", value: "9/11" }, { label: "Total candidats", value: "148" }, { label: "Cout total", value: "1 510 000 FCFA" }],
      data: "11 cartes : Site web, Reference interne, LinkedIn, Indeed, Cabinet de recrutement, Ecole/Universite, Salon professionnel, Candidature spontanee, Reseaux sociaux, Presse, Autre" },

    { num: "18", title: "Analyse des Couts", route: "/couts", screenshot: "18_analyse-couts.png",
      pageTitle: "Analyse des Couts de Recrutement",
      kpis: [{ label: "COUT TOTAL", value: "1 295 000 FCFA" }, { label: "COUT MOYEN/DEMANDE", value: "185 000 FCFA" }, { label: "COUT MOYEN/POSTE POURVU", value: "647 500 FCFA" }, { label: "DEMANDE LA PLUS CHERE", value: "Chef Cuisinier" }],
      columns: "Poste, Publicite, Cabinet, Deplacement, Tests, Hebergement, Formation, Autres, Cout Total, Cout/Poste",
      data: "7 donnees : Chef Cuisinier (520K) a Developpeur Full Stack (185K)",
      charts: ["Couts par Demande (Empiles)", "Repartition par Categorie"] },

    { num: "19", title: "Documents", route: "/documents", screenshot: "20_documents.png",
      pageTitle: "Gestion des Documents", btn: "Televerser",
      filters: ["Tous", "CV", "Lettre de motivation", "Contrat", "Fiche de poste", "Grille evaluation", "Attestation", "Autre"],
      columns: "Nom, Type, Candidat, Taille (KO), Date Upload, Uploade par, Actions",
      data: "5 donnees : CV_Ndiaye_Moussa.pdf, LM_Ndiaye_Moussa.pdf, CV_Tchouankou_Claire.pdf, Grille_Ndiaye_Moussa.pdf, FP_Chef_Cuisinier.pdf" },

    { num: "20", title: "Conformite", route: "/conformite", screenshot: "21_conformite.png",
      pageTitle: "Conformite", subtitle: "Suivi de conformite des modules de l'application Admina-RH",
      kpis: [{ label: "CONFORMITE GLOBALE", value: "77.3%", sub: "Au-dessus du seuil, Seuil de base: 45%" },
              { label: "PAGES FONCTIONNELLES", value: "100% (31/31)" },
              { label: "REFERENCE DE BASE", value: "v1.0.0" }],
      data: "Tableau 31 modules : colonnes PAGE, CHEMIN, FONCTIONNEL, CONFORMITE" },

    { num: "21", title: "Parametres", route: "/parametres", screenshot: "22_parametres.png",
      pageTitle: "Parametres du Systeme",
      fields: ["General : Nom entreprise (HRC Cameroon), Logo (hrc-logo.png), Devise (FCFA), Langue (Francais)",
               "Recrutement : Delai par defaut (30), Score minimum (12), Notification email (Active)",
               "Evaluation : Bareme (/25), Nombre criteres (5), Seuil recommandation (15)"] },

    { num: "22", title: "Audit", route: "/audit", screenshot: "23_audit.png",
      pageTitle: "Journal d'Audit",
      filters: ["Action", "Module", "Utilisateur", "Date debut", "Date fin"],
      columns: "Date & Heure, Utilisateur, Action, Module, Details",
      data: "Entrees avec Mme. Fotso Marie, M. Nkoulou Paul, etc." },

    { num: "23", title: "Types de Contrats", route: "/types-contrats", screenshot: "24_types-contrats.png",
      pageTitle: "Types de Contrats", btn: "Ajouter",
      columns: "Type, Description, Duree max, Rupture possible, Avantages legaux",
      data: "7 Types : CDI, CDD, Stage, Saisonnier, Interim, Freelance, Alternance" },

    { num: "24", title: "Departements", route: "/departements", screenshot: "25_departements.png",
      pageTitle: "Departements", btn: "Ajouter",
      columns: "Nom, Description, Responsable, Nb employes, Effectif cible, Progression, Localisation",
      data: "17 Departements : Direction Generale a Achats (avec % progression)" },

    { num: "25", title: "Sources & ROI", route: "/sources-roi", screenshot: "26_sources-roi.png",
      pageTitle: "Sources de Recrutement & ROI",
      kpis: [{ label: "TOTAL CANDIDATS", value: "118" }, { label: "MEILLEURE SOURCE", value: "Reference interne (ROI 2900.0%)" }, { label: "TAUX CONVERSION MOYEN", value: "7.6%" }, { label: "COUT MOYEN/EMBAUCHE", value: "130 000 FCFA" }],
      columns: "Source, Nb Candidats, Nb Entretiens, Nb Embauches, Taux Conversion, Cout Total (FCFA), Cout/Candidat (FCFA), Cout/Embauche (FCFA), ROI (%)",
      data: "6 donnees : LinkedIn, Cabinet de recrutement, Site web, Reference interne, Reseaux sociaux, Candidature spontanee",
      charts: ["Candidats vs Embauches par Source (barres groupees)", "Distribution des Sources (donut)"] },

    { num: "26", title: "Experiences Candidats", route: "/experiences", screenshot: "27_experiences.png",
      pageTitle: "Experiences des Candidats", btn: "Ajouter",
      columns: "Candidat, Entreprise, Poste, Date debut, Date fin, Duree, Description, Verifiee",
      data: "Ndiaye Moussa (Hotel Sawa, Restaurant Le Nautic), Tchouankou Claire, etc." },

    { num: "27", title: "Formations Candidats", route: "/formations", screenshot: "28_formations-candidats.png",
      pageTitle: "Formations des Candidats", btn: "Ajouter",
      columns: "Candidat, Etablissement, Diplome, Specialite, Date debut, Date fin, Duree",
      data: "Ndiaye Moussa (BTS Hotellerie-Restauration), Tchouankou Claire (Licence Comptabilite), etc." },

    { num: "28", title: "Competences", route: "/competences", screenshot: "29_competences.png",
      pageTitle: "Competences des Candidats", btn: "Ajouter",
      columns: "Candidat, Competence, Niveau, Annees d'experience",
      data: "Ndiaye Moussa (Gastronomie/Expert/8ans, Management/Avance/5ans, HACCP/Expert/7ans), etc." },

    { num: "29", title: "Statuts", route: "/statuts", screenshot: "30_statuts.png",
      pageTitle: "Gestion des Statuts", subtitle: "Reference des statuts utilises dans le systeme. Cette page est en lecture seule.",
      data: "Statuts Candidats : Nouveau (Ordre 1), En cours (Ordre 2), Retenu (Ordre 3), Non retenu (Ordre 4), En attente (Ordre 5), Recontact (Ordre 6) / Statuts Offres : affiches cote droit" },
  ];

  for (const pg of pages) {
    content.push(...pageHeading(pg.num, pg.title, pg.route));
    if (pg.screenshot) content.push(fieldDetail("Screenshot", "frozen-snapshots/" + pg.screenshot));
    if (pg.pageTitle) content.push(fieldDetail("Titre", pg.pageTitle));
    if (pg.subtitle) content.push(fieldDetail("Sous-titre", pg.subtitle));
    if (pg.counter) content.push(fieldDetail("Compteur", pg.counter));
    if (pg.btn) content.push(fieldDetail("Bouton(s)", pg.btn));

    if (pg.kpis && pg.kpis.length > 0) {
      content.push(new Paragraph({ spacing: { before: 120, after: 60 },
        children: [new TextRun({ text: "KPI Cards (GELES) :", bold: true, size: 22, color: "1B6B7A", font: { ascii: "Calibri" } })] }));
      for (const kpi of pg.kpis) {
        content.push(subBulletP(kpi.label + " : " + kpi.value + (kpi.sub ? ", " + kpi.sub : "")));
      }
    }

    if (pg.filters && pg.filters.length > 0) {
      content.push(fieldDetail("Filtres onglets", pg.filters.join(", ")));
    }

    if (pg.columns) content.push(fieldDetail("Colonnes tableau", pg.columns));
    if (pg.charts) {
      for (const ch of pg.charts) content.push(subBulletP("Graphique : " + ch));
    }
    if (pg.lists) {
      for (const lst of pg.lists) content.push(subBulletP(lst));
    }
    if (pg.fields) {
      for (const f of pg.fields) content.push(subBulletP(f));
    }
    if (pg.data) content.push(fieldDetail("Donnees gelees", pg.data));

    // separator line
    content.push(new Paragraph({ spacing: { after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0", space: 4 } }, children: [] }));
  }

  // ═══════════════════════════════════════════
  // 3. FROZEN — COMPOSANTS PARTAGES
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "3. FROZEN — Composants partages geles", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  // Sidebar
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: "Sidebar (Sidebar.jsx)", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(fieldDetail("Logo", "AR + Admina-RH"));
  content.push(fieldDetail("Sous-titre", "Domaine 1 — Recrutement"));
  const sidebarSections = [
    "VUE D'ENSEMBLE : Tableau de Bord",
    "GESTION DES OFFRES : Demandes, Previsions Postes, Sources Recrutement, Analyse des Couts",
    "GESTION DES CANDIDATS : Base Candidats, Pipeline Candidatures, Types de Contrats, Departements",
    "PROCESSUS DE RECRUTEMENT : Planning Entretiens, Grille Evaluation, Verification References, Selections, Gestion Cabinets, Suivi Contrats",
    "INTEGRATION & SUIVI : Integration Employe, Checklist Integration, Periode d'Essai, Plan Accueil Formation, Suivi Post-Embauche",
    "STAGIAIRES & SAISONNIERS : Stagiaires, Saisonniers & Temporaires",
    "ANALYTICS & DOCUMENTS : Documents, Conformite",
    "CONFIGURATION : Parametres, Audit",
  ];
  for (let i = 0; i < sidebarSections.length; i++) {
    content.push(subBulletP((i+1) + ". " + sidebarSections[i]));
  }
  content.push(fieldDetail("Bouton", "Reduire le menu"));

  // Header
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: "Header (Header.jsx)", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(bodyP("Elements GELES : Titre de page dynamique, barre de recherche (\"Rechercher...\"), date du jour, bouton notifications (\"3 notifications\"), menu utilisateur (\"RH\")."));

  // KPICard
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: "KPICard (KPICard.jsx)", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(fieldDetail("Props", "titre, valeur, sous-texte"));
  content.push(fieldDetail("Style", "carte Material UI avec padding"));

  // ═══════════════════════════════════════════
  // 4. FROZEN — NOMENCLATURES
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "4. FROZEN — Donnees de reference (nomenclatures)", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(bodyP("Les 38 listes de reference du fichier Excel sont GELEES. Elles definissent les valeurs autorisees pour chaque champ du systeme."));

  const nomData = [
    ["statut_demande", "En attente, Validee, En cours, Pourvue, Annulee"],
    ["priorite", "Urgente, Haute, Moyenne, Basse"],
    ["type_contrat", "CDI, CDD, Stage, Interim, Alternance, Freelance"],
    ["type_poste", "Cadre, Agent de maitrise, Operationnel, Stagiaire, Temporaire"],
    ["motif", "Remplacement, Creation de poste, Saisonnalite, Surcharge, Reorganisation"],
    ["source", "Site web entreprise, Presse, Cooptation, Reseaux sociaux, Candidature spontanee, Ecole/Universite, Cabinet de recrutement, Salon emploi, Autre"],
    ["statut_candidat", "Nouveau, En cours d'etude, Entretien planifie, Entretien realise, Retenu, Refuse, En reserve, Desiste"],
    ["statut_entretien", "Planifie, Realise, Annule, Reporte"],
    ["type_entretien", "Telephonique, Visioconference, Presentiel, Technique, 2eme tour, Final"],
    ["resultat_entretien", "Favorable, Defavorable, A revoir, En attente"],
    ["elements_verif", "Diplome, Experience, Comportement, Salaire declare, Causes de depart"],
    ["resultat_verif", "Favorable, Defavorable, Partiel, N'a pas repondu, Non verifiable"],
    ["decision_finale", "Embauche recommandee, Embauche avec reserve, Refus, En attente decision"],
    ["oui_non", "Oui, Non"],
    ["civilite", "M., Mme, Mlle"],
    ["niveau_etude", "Sans diplome, CAP/BEP, BTS/DUT, Licence, Master, Doctorat, Autre"],
    ["niveau_langue", "Aucun, Debutant, Intermediaire, Avance, Bilingue, Natif"],
    ["genre", "Masculin, Feminin"],
    ["situation_fam", "Celibataire, Marie(e), Divorce(e), Veuf(ve)"],
    ["departement", "Direction Generale, Ressources Humaines, Finance & Comptabilite, Marketing & Communication, Informatique, Commercial, Logistique & Approvisionnement, Production, Service Client, Juridique, Administration, Securite, Restauration, Herbergement, Maintenance, Lingerie, Audiovisuel"],
    ["role_responsable", "Directeur General, Directeur Adjoint, DRH, DRH Adjoint, Chef de Departement, Chef de Service, Responsable de Pole, Superviseur, Manager Operationnel"],
    ["cabinet_recrutement", "HRC Cameroon, Activa RH, Skillmatch Africa, Michael Page Cameroon, Pedarec, AfricSearch, Manpower Cameroon, Interne (sans cabinet), Autre"],
    ["statut_contrat", "En cours, Renouvele, Echu, Resilie, En negociation"],
    ["motif_fin_contrat", "Fin de contrat, Demission, Licenciement, Depart retraite, Mutation, Force majeure"],
    ["specialite_cabinet", "Generaliste, Cadres dirigeants, Informatique, Finance, Hotellerie & Tourisme, Commerce, BTP, Logistique"],
    ["evaluation_cabinet", "Excellent, Bon, Moyen, Insuffisant, A evaluer"],
    ["canal_diffusion", "Site web, LinkedIn, Facebook, Presse ecrite, Radio, Salon emploi, Cabinet, Cooptation, Universites, Affichage"],
    ["statut_offre", "A creer, Publiee, Candidatures en cours, Cloturee, Annulee"],
    ["categorie_checklist", "Documents administratifs, Formation securite, Formation metier, Equipement & Badge, Presentation equipes, Visite locaux, Compte informatique, Repas & avantages"],
    ["statut_checklist", "A faire, En cours, Fait, Non applicable"],
    ["decision_essai", "Embauche confirmee, Prolongation essai, Rupture essai, En cours"],
    ["statut_integration", "En cours, Terminee, Echec, Prolongee"],
    ["statut_formation", "Planifiee, En cours, Terminee, Annulee"],
    ["statut_stagiaire", "En cours, Termine, Abandonne, Embauche"],
    ["satisfaction", "Tres satisfait, Satisfait, Neutre, Insatisfait, Tres insatisfait"],
    ["risque_depart", "Faible, Moyen, Eleve, Critique"],
    ["stade_pipeline", "CV recu, Pre-selection, Entretien HR, Test technique, Entretien final, Offre envoyee, Accepte, Refuse, Retraite"],
    ["priorite_pipeline", "Haute, Moyenne, Basse"],
  ];

  content.push(makeTable(
    ["Nomenclature", "Valeurs gelees"],
    nomData,
    [30, 70]
  ));
  content.push(new Paragraph({ spacing: { after: 200 } }));

  // ═══════════════════════════════════════════
  // 5. DEV — PAGES A CONSTRUIRE
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "5. DEV — Pages a construire (2 pages)", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  // PAGE A - Demandes
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 },
    children: [new TextRun({ text: "PAGE A — Demandes de Recrutement (/offres)", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(labelP("Feuille Excel reference : ", "1-Demandes Recrutement (19 champs)"));
  content.push(new Paragraph({ spacing: { before: 100, after: 80 },
    children: [new TextRun({ text: "Champs OBLIGATOIRES a implementer :", bold: true, size: 22, color: "1A2B40", font: { ascii: "Calibri" } })] }));

  const demandesFields = [
    "No Demande (auto-genere : DR-YYYY-NNN)", "Date Demande", "Departement / Service (dropdown -> nomenclature departement)",
    "Poste Recherche", "Type de Poste (dropdown -> type_poste)", "Type de Contrat (dropdown -> type_contrat)",
    "Effectif Demande", "Motif du Recrutement (dropdown -> motif)", "Date Besoin", "Priorite (dropdown -> priorite)",
    "Statut (dropdown -> statut_demande)", "Date Pourvue", "Responsable Demande", "Role du Responsable (dropdown -> role_responsable)",
    "Cabinet / Agence Externe (dropdown -> cabinet_recrutement)", "Budget Salaire (FCFA)", "Cout Recrutement (FCFA)", "Delai (jours)", "Notes",
  ];
  demandesFields.forEach((f, i) => content.push(subBulletP((i+1) + ". " + f)));
  content.push(fieldDetail("UI attendue", "Tableau avec filtres (comme les autres pages) + Bouton \"Nouvelle Demande\" + KPI cards"));

  // PAGE B - Candidats
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 },
    children: [new TextRun({ text: "PAGE B — Base Candidats (/candidats)", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(labelP("Feuille Excel reference : ", "2-Base Candidats (35 champs)"));
  content.push(new Paragraph({ spacing: { before: 100, after: 80 },
    children: [new TextRun({ text: "Champs OBLIGATOIRES a implementer :", bold: true, size: 22, color: "1A2B40", font: { ascii: "Calibri" } })] }));

  const candidatsFields = [
    "No Candidat (auto : CAN-NNN)", "Civilite (dropdown -> civilite)", "Nom", "Prenom", "Genre (dropdown -> genre)",
    "Date de Naissance", "Nationalite", "Situation Familiale (dropdown -> situation_fam)", "Telephone", "Email",
    "Adresse", "Ville", "Niveau Etude (dropdown -> niveau_etude)", "Diplome", "Etablissement", "Annees Exp.",
    "Dernier Employeur", "Competences Cles", "Langues", "Niveau Langue (dropdown -> niveau_langue)",
    "Outils/Logiciels", "Poste Vise", "Source Candidature (dropdown -> source)", "Date Candidature",
    "Statut (dropdown -> statut_candidat)", "Score (/20)", "Type Contrat (dropdown -> type_contrat)",
    "Contrat Telechargeable", "Date Debut Essai", "Date Fin Essai", "Date Embauche Definitive",
    "Certificat Travail", "Attestation CNPS", "Extrait Casier Judiciaire", "Notes",
  ];
  candidatsFields.forEach((f, i) => content.push(subBulletP((i+1) + ". " + f)));
  content.push(fieldDetail("UI attendue", "Vue tableau + Vue fiche detaillee (onglets) + Lien vers sous-pages Experiences/Formations/Competences"));

  // ═══════════════════════════════════════════
  // 6. DEV — CHAMPS MANQUANTS
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "6. DEV — Champs manquants a ajouter", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  content.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, left: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, right: { style: BorderStyle.SINGLE, size: 6, color: "C0392B" }, insideHorizontal: NB, insideVertical: NB },
    rows: [new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: "FDF2F2" }, borders: { top: NB, bottom: NB, left: NB, right: NB },
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      children: [new Paragraph({ spacing: { line: 312, after: 0 },
        children: [new TextRun({ text: "REGLE : Ajouter les colonnes manquantes a DROITE des colonnes existantes. Ne PAS deplacer ou renommer les colonnes gelees.", bold: true, size: 22, color: "C0392B", font: { ascii: "Calibri" } })] })],
    })] })],
  }));
  content.push(new Paragraph({ spacing: { after: 120 } }));

  const missingFields = [
    ["Entretiens", "No Entretien, Poste Vise, Score (/20), Prochaine Etape, Date Prochaine Etape, Notes"],
    ["Evaluations", "No Evaluation, Poste Vise, Salaire Souhaite (FCFA), Salaire Propose (FCFA), Source Candidature, Statut Candidat"],
    ["Verifications", "No Verif., Poste Vise, Elements Verifies (selection multiple), Resultat Global (dropdown), Details/Retour, Suites Donnees, Decision Finale, Date Decision"],
    ["Selections", "No Selection (ajouter), Notes"],
    ["Cabinets", "Cout Total (FCFA), Evaluation (dropdown), Contrat en Cours (oui/non), Date Debut Contrat, Date Fin Contrat, Notes"],
    ["Previsions", "Budget (FCFA), Profil Recherche, Date Publication, Candidatures Recues, Notes"],
    ["Sources", "Vue tableau : No, Nb Entretiens, Nb Recrutements, Taux Transformation, Cout/Recrutement, Delai Moyen, Qualite Moyenne (/20), Notes"],
    ["Couts", "No, Demande Liee, Date, Departement, Notes"],
    ["Integration", "Formation Metier, Visite Locaux, Statut Integration (dropdown), Date Fin Integration, Notes"],
    ["Checklist", "Commentaires, Departement, Date Arrivee"],
    ["Periode Essai", "Objectifs Fixes, Score Mi-parcours (/20), Score Final (/20), Date Decision, Notes"],
    ["Formation", "Notes, Departement, Date Arrivee"],
    ["Stagiaires", "Indemnite (FCFA/mois), Statut (colonne), Evaluation (/20), Notes"],
    ["Saisonniers", "Motif (colonne), Source (colonne), Notes"],
    ["Post-Embauche", "Risque Depart (par ligne), Commentaires"],
    ["Pipeline", "No Pipeline, Departement, Date Mouvement, Delai (jours), Evaluateur, Prochaine Action, Notes"],
  ];
  content.push(makeTable(
    ["Page", "Champs manquants a AJOUTER (a droite)"],
    missingFields,
    [20, 80]
  ));
  content.push(new Paragraph({ spacing: { after: 200 } }));

  // ═══════════════════════════════════════════
  // 7. WORKFLOW OBLIGATOIRE
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "7. Workflow obligatoire", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: "Avant toute modification de code :", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(bulletP("Lire ce fichier (AI_GUIDE.md) en entier"));
  content.push(bulletP("Verifier le screenshot concerne dans frozen-snapshots/"));
  content.push(bulletP("Confirmer que la modification cible est dans la section [DEV] et NON dans [FROZEN]"));

  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: "Pendant le developpement :", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(bulletP("NE JAMAIS ouvrir ou modifier un fichier liste comme [FROZEN] dans l'arborescence"));
  content.push(bulletP("SEULEMENT creer de nouveaux fichiers ou modifier des fichiers listes [DEV]"));
  content.push(bulletP("AJOUTER les nouvelles colonnes/champs a DROITE des existantes"));
  content.push(bulletP("CONSERVER exactement le meme nommage, style et structure pour les elements gelees"));

  content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: "Apres le developpement :", bold: true, size: 28, color: "0A1628", font: { ascii: "Calibri" } })] }));
  content.push(bulletP("COMPARER visuellement le resultat avec le screenshot de reference"));
  content.push(bulletP("VERIFIER qu'aucun element gele n'a change"));
  content.push(bulletP("Tester que les nouvelles fonctionnalites ne cassent pas les existantes"));

  // ═══════════════════════════════════════════
  // 8. VERIFICATION AVANT CHAQUE MODIFICATION
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "8. Verification avant chaque modification", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  const checkItems = [
    "AI_GUIDE.md a ete lu en entier ?",
    "Screenshot de reference consulte ?",
    "La cible est dans [DEV] (pas dans [FROZEN]) ?",
    "Aucun fichier [FROZEN] ne sera modifie ?",
    "Les colonnes existantes ne seront pas deplacees/renommees ?",
    "Les donnees d'exemple ne seront pas modifiees ?",
    "Le style MUI existant est conserve ?",
    "La sidebar et le header restent identiques ?",
    "Les nomenclatures (38 listes) ne sont pas modifiees ?",
    "Le routage existant (/entretiens, /contrats, etc.) fonctionne toujours ?",
  ];
  for (const item of checkItems) {
    content.push(new Paragraph({
      spacing: { line: 312, after: 60 },
      indent: { left: 600, hanging: 300 },
      children: [
        new TextRun({ text: "\u25A1  " + item, size: 24, color: "1A2B40", font: { ascii: "Calibri" } }),
      ],
    }));
  }

  // ═══════════════════════════════════════════
  // 9. HISTORIQUE DU GEL
  // ═══════════════════════════════════════════
  content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text: "9. Historique du gel", bold: true, size: 32, color: "0A1628", font: { ascii: "Calibri" } })] }));

  content.push(makeTable(
    ["Date", "Action", "Auteur"],
    [["29/08/2026", "GEL v1.0 — 28 pages capturees, 144/279 champs geles", "Super Z"]],
    [25, 55, 20]
  ));
  content.push(new Paragraph({ spacing: { after: 200 } }));

  content.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "1B6B7A" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "1B6B7A" }, left: { style: BorderStyle.SINGLE, size: 4, color: "1B6B7A" }, right: { style: BorderStyle.SINGLE, size: 4, color: "1B6B7A" }, insideHorizontal: NB, insideVertical: NB },
    rows: [new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: "EDF3F5" }, borders: { top: NB, bottom: NB, left: NB, right: NB },
      margins: { top: 100, bottom: 100, left: 200, right: 200 },
      children: [new Paragraph({ spacing: { line: 312, after: 0 },
        children: [new TextRun({ text: "PROCHAINE ETAPE : Une fois les 2 pages manquantes (Demandes + Base Candidats) construites et les champs manquants ajoutes, ce fichier sera mis a jour pour passer les nouveaux elements de [DEV] a [FROZEN]. Le degel complet interviendra a 100% de couverture front-end.", size: 22, color: "1B6B7A", font: { ascii: "Calibri" } })] })],
    })] })],
  }));

  return content;
}

// ─── ASSEMBLE DOCUMENT ───
async function main() {
  const bodyContent = buildContent();

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, color: "1A2B40" },
          paragraph: { spacing: { line: 312 } },
        },
        heading1: { run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: "0A1628" },
          paragraph: { spacing: { before: 400, after: 200 } } },
        heading2: { run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: "0A1628" },
          paragraph: { spacing: { before: 300, after: 150 } } },
        heading3: { run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 26, bold: true, color: "0A1628" },
          paragraph: { spacing: { before: 200, after: 100 } } },
      },
    },
    sections: [
      // SECTION 1: Cover (margin 0)
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
        },
        children: buildCoverR1({
          title: "AI_GUIDE.md \u2014 Admina-RH",
          subtitle: "Guide de Gel Frontend — Domaine 1 : Recrutement & Candidats",
          englishLabel: "ADMINA-RH  FRONTEND  FREEZE  GUIDE",
          metaLines: [
            "Version de gel : v1.0 — 29 aout 2026",
            "Taux de couverture au gel : 57% (144/279 champs Excel)",
            "URL de reference : https://admina-rh-bd0.pages.dev/",
          ],
          footerLeft: "HRC Cameroon",
          footerRight: "Confidentiel",
          palette: {
            bg: PAL.bg, titleColor: PAL.cover.titleColor, subtitleColor: PAL.cover.subtitleColor,
            metaColor: PAL.cover.metaColor, accent: PAL.accent, footerColor: PAL.cover.footerColor,
          },
        }),
      },
      // SECTION 2: TOC (Roman numerals)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: "upperRoman" },
          },
        },
        footers: {
          default: new Footer({ children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: ["PAGE \\* ROMAN \\* MERGEFORMAT"], size: 18, color: "506070", font: { ascii: "Calibri" } })],
          })] }),
        },
        children: [
          new Paragraph({ spacing: { after: 300 },
            children: [new TextRun({ text: "Table des matieres", size: 36, bold: true, color: "0A1628", font: { ascii: "Calibri" } })] }),
          new TableOfContents("Table des matieres", {
            hyperlink: true, headingStyleRange: "1-3",
          }),
          new Paragraph({ spacing: { before: 200 }, after: 100, pageBreakAfter: true,
            children: [new TextRun({ text: "(Clic droit sur la table ci-dessus > Mettre a jour les champs pour actualiser les numeros de page)", size: 18, italics: true, color: "808080", font: { ascii: "Calibri" } })] }),
          ...bodyContent,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/download/AI_GUIDE.docx", buffer);
  console.log("AI_GUIDE.docx generated successfully!");
}

main().catch(err => { console.error(err); process.exit(1); });
