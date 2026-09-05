// ============================================================
// ModeleAvenantPDF.jsx — Onglet "Modele_Avenant_PDF"
// ÉTAPE 5 : Modèle d'avenant pré-rempli + export PDF en 1 clic
// Émule la feuille Excel Modele_Avenant_PDF :
//   B1   : liste déroulante N° Avenant (source = Avenants!A:A)
//   B5.. : cellules nommées (RECHERCHEX) : NomEmploye, PosteActuel,
//          NouveauPoste, SalaireAncien, NouveauSalaire, TempsAncien,
//          NouveauTemps, Motif, DateEffet
//   Bouton "📄 Exporter en PDF" → impression navigateur
//   Zone d'impression = lignes 5 à 30 du modèle
//   Nom fichier : Avenant_[N°Avenant]_[Employé]_[Date].pdf
// ============================================================
import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Grid, Divider,
  Alert, Dialog, DialogTitle, DialogContent, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Snackbar, MenuItem, TextField, InputAdornment, Link,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import {
  AVENANTS, CONTRATS, EMPLOYEES, findEmployee, employeeFullName,
  formatNumber, formatDate, MOTIFS_AVENANT, STATUTS_AVENANT,
} from './data';
import { SectionHeader } from './components';

const VIOLET = '#7e3ff2';
const NAVY = '#0b2a4a';
const VERT = '#2a7a4a';
const ORANGE = '#b86a2a';
const ROUGE = '#b33a4a';
const BLEU = '#2a6a9a';
const GRIS = '#6b7a8a';

// --- RECHERCHEX : récupère un champ d'un avenant par son N° ---
// Excel : =RECHERCHEX($B$1; Avenants!A:A; Avenants!<col>;"Non trouvé";0)
const rechX = (amendmentNumber, field) => {
  const av = AVENANTS.find(a => a.amendment_number === amendmentNumber);
  if (!av) return 'Non trouvé';
  const val = av[field];
  if (val === undefined || val === null || val === '') return '—';
  return val;
};

// --- Formatage spécial selon le champ ---
const formatField = (amendmentNumber, field) => {
  const raw = rechX(amendmentNumber, field);
  if (raw === '—' || raw === 'Non trouvé') return raw;
  if (field === 'salaire_ancien' || field === 'nouveau_salaire') {
    return `${formatNumber(raw)} FCFA`;
  }
  if (field === 'date_effet' || field === 'date_signature') {
    return formatDate(raw);
  }
  return String(raw);
};

// --- Mapping cellules nommées → champ avenant (RECHERCHEX) ---
const NAMED_CELLS = [
  // --- Cellules Excel d'origine (B5-B13) ---
  { name: 'NomEmploye',     cell: 'B5',  field: '_employeeName',   col: 'C', label: 'Nom de l\'employé',          formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!C:C; "Non trouvé"; 0)' },
  { name: 'PosteActuel',    cell: 'B6',  field: 'poste_actuel',    col: 'D', label: 'Poste actuel',               formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!D:D; "Non trouvé"; 0)' },
  { name: 'NouveauPoste',  cell: 'B7',  field: 'nouveau_poste',   col: 'E', label: 'Nouveau poste',              formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!E:E; "Non trouvé"; 0)' },
  { name: 'SalaireAncien',  cell: 'B8',  field: 'salaire_ancien',  col: 'F', label: 'Salaire ancien (FCFA)',      formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!F:F; "Non trouvé"; 0)' },
  { name: 'NouveauSalaire', cell: 'B9',  field: 'nouveau_salaire', col: 'G', label: 'Nouveau salaire (FCFA)',    formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!G:G; "Non trouvé"; 0)' },
  { name: 'TempsAncien',    cell: 'B10', field: 'temps_ancien',    col: 'H', label: 'Temps de travail ancien',   formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!H:H; "Non trouvé"; 0)' },
  { name: 'NouveauTemps',   cell: 'B11', field: 'nouveau_temps',   col: 'I', label: 'Nouveau temps de travail',  formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!I:I; "Non trouvé"; 0)' },
  { name: 'Motif',          cell: 'B12', field: 'motif',           col: 'J', label: 'Motif de l\'avenant',        formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!J:J; "Non trouvé"; 0)' },
  { name: 'DateEffet',      cell: 'B13', field: 'date_effet',      col: 'L', label: 'Date d\'effet',              formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!L:L; "Non trouvé"; 0)' },
  // --- Master Prompt : nouvelles cellules nommées (B14-B26) ---
  // Étape 1 : En-tête
  { name: 'NumeroContrat',     cell: 'B14', field: '_contractNumber', col: 'B', label: 'Contrat référent',           formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!B:B; "Non trouvé"; 0)' },
  { name: 'DateEmission',      cell: 'B15', field: '_today',          col: '',   label: 'Date d\'émission',           formula: '=AUJOURDHUI()' },
  { name: 'VersionDoc',        cell: 'B16', field: '_version',        col: '',   label: 'Version du document',        formula: '="V1.0"' },
  // Étape 2 : Coordonnées employeur
  { name: 'EmployeurNom',      cell: 'B17', field: '_employeurNom',   col: '',   label: 'Raison sociale',            formula: '="Admina-RH SARL"' },
  { name: 'EmployeurAdresse',  cell: 'B18', field: '_employeurAddr',  col: '',   label: 'Siège social',              formula: '="Douala, Cameroun"' },
  { name: 'RepresentantLegal', cell: 'B19', field: '_representant',   col: '',   label: 'Représentant légal',         formula: '="Directeur Général"' },
  // Étape 2 : Coordonnées salarié
  { name: 'MatriculeSalarie',  cell: 'B20', field: '_matricule',      col: '',   label: 'Matricule salarié',          formula: '=RECHERCHEX($B$1; Avenants!A:A; \'6-Suivi Contrats\'!B:B; "Non trouvé"; 0)' },
  { name: 'EmailSalarie',      cell: 'B21', field: '_email',          col: '',   label: 'Email salarié',              formula: '=RECHERCHEX(NomEmploye; \'2-Base Candidats\'!D:D; \'2-Base Candidats\'!G:G; "Non renseigné"; 0)' },
  // Étape 3 : Signature employeur
  { name: 'DateSignatureEmployeur', cell: 'B22', field: '_today',     col: '',   label: 'Date signature employeur',   formula: '=AUJOURDHUI() (modifiable)' },
  { name: 'NomSignataire',    cell: 'B23', field: '_signataire',      col: '',   label: 'Nom du signataire',          formula: '="Le Directeur Général"' },
  // Étape 4 : Clauses optionnelles (nouveaux champs avenant P, Q, R)
  { name: 'NouveauLieu',        cell: 'B24', field: 'nouveau_lieu',         col: 'P', label: 'Nouveau lieu de travail',     formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!P:P; ""; 0)' },
  { name: 'NouvelleFinEssai',  cell: 'B25', field: 'nouvelle_fin_essai',   col: 'Q', label: 'Nouvelle date de fin d\'essai', formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!Q:Q; ""; 0)' },
  { name: 'Observations',      cell: 'B26', field: 'observations_avn',    col: 'R', label: 'Observations spécifiques',     formula: '=RECHERCHEX($B$1; Avenants!A:A; Avenants!R:R; ""; 0)' },
];

export default function ModeleAvenantPDF() {
  const navigate = useNavigate();
  // B1 : N° Avenant sélectionné (défaut = premier avenant)
  const [selectedNum, setSelectedNum] = useState(AVENANTS[0]?.amendment_number || '');
  const [snack, setSnack] = useState(null);
  const printRef = useRef(null);

  // --- RECHERCHEX : récupère l'avenant complet sélectionné ---
  const avenant = useMemo(
    () => AVENANTS.find(a => a.amendment_number === selectedNum) || null,
    [selectedNum]
  );

  // --- RECHERCHEX employé + contrat associés ---
  const employee = useMemo(() => avenant ? findEmployee(avenant.employee_id) : null, [avenant]);
  const contract = useMemo(
    () => avenant ? CONTRATS.find(c => c.id === avenant.contract_id) : null,
    [avenant]
  );

  // --- Récupère la valeur d'une cellule nommée (RECHERCHEX simulée) ---
  const getValue = useCallback((namedCell) => {
    if (!avenant) return 'Non trouvé';
    // Cellules calculées (spéciales,préfixées _)
    switch (namedCell.field) {
      case '_employeeName':
        return employee ? employeeFullName(employee) : 'Non trouvé';
      case '_contractNumber':
        return contract?.contract_number || 'Non trouvé';
      case '_today': {
        const today = new Date();
        return today.toLocaleDateString('fr-FR');
      }
      case '_version':
        return 'V1.0';
      case '_employeurNom':
        return 'Admina-RH SARL';
      case '_employeurAddr':
        return 'Douala, Cameroun';
      case '_representant':
        return 'Directeur Général';
      case '_matricule':
        return employee?.matricule || 'Non trouvé';
      case '_email':
        return employee?.email || 'Non renseigné';
      case '_signataire':
        return 'Le Directeur Général';
      default:
        return formatField(selectedNum, namedCell.field);
    }
  }, [avenant, employee, contract, selectedNum]);

  // --- Aperçu temps réel du nom du fichier PDF ---
  const pdfFileName = useMemo(() => {
    if (!avenant || !employee) return 'Avenant_.pdf';
    const emp = employee.nom.replace(/\s+/g, '_');
    const d = new Date().toISOString().slice(0, 10);
    return `Avenant_${avenant.amendment_number.replace(/-/g, '_')}_${emp}_${d}.pdf`;
  }, [avenant, employee]);

  // --- Variations (delta salaire + évolutions affichées dans le PDF) ---
  const deltaSalaire = useMemo(() => {
    if (!avenant) return null;
    const diff = avenant.nouveau_salaire - avenant.salaire_ancien;
    const pct = avenant.salaire_ancien > 0 ? (diff / avenant.salaire_ancien) * 100 : 0;
    return { diff, pct };
  }, [avenant]);

  // --- Génération du HTML du modèle d'avenant (réutilisé par Aperçu + Export PDF) ---
  const generateAvenantHTML = useCallback((mode = 'print') => {
    if (!avenant) return null;
    // --- Données de base ---
    const emp = employee ? employeeFullName(employee) : '—';
    const posteAvant = avenant.poste_actuel || '—';
    const posteApres = avenant.nouveau_poste || posteAvant;
    const salaireAvant = formatNumber(avenant.salaire_ancien);
    const salaireApres = formatNumber(avenant.nouveau_salaire);
    const tempsAvant = avenant.temps_ancien || '—';
    const tempsApres = avenant.nouveau_temps || tempsAvant;
    const motif = avenant.motif || '—';
    const dateEffet = formatDate(avenant.date_effet);
    // --- Master Prompt : nouvelles données ---
    const contractNum = contract?.contract_number || '—';
    const matricule = employee?.matricule || '—';
    const emailSal = employee?.email || 'Non renseigné';
    const dateEmission = new Date().toLocaleDateString('fr-FR');
    const versionDoc = 'V1.0';
    const employeurNom = 'Admina-RH SARL';
    const employeurAddr = 'Douala, Cameroun';
    const representant = 'Directeur Général';
    const nomSignataire = 'Le Directeur Général';
    const lieuAncien = contract?.lieu_travail || employee?.lieu_travail || 'Douala';
    const nouveauLieu = avenant.nouveau_lieu || '';
    const nouvelleFinEssai = avenant.nouvelle_fin_essai || '';
    const observationsAvn = avenant.observations_avn || '';
    // Calcul delta salarial
    const delta = avenant.nouveau_salaire - avenant.salaire_ancien;
    const pct = avenant.salaire_ancien > 0 ? ((delta / avenant.salaire_ancien) * 100).toFixed(1) : '0';
    const signe = delta >= 0 ? '+' : '';

    // --- Clauses conditionnelles (SI champ renseigné) ---
    const clauseLieu = nouveauLieu ? `
      <div class="clause">
        <h3>Article 4 — Modification du lieu de travail</h3>
        <p>À compter du <strong>${dateEffet}</strong>, le lieu de travail du salarié est modifié comme suit :
        Ancien lieu : <em>${lieuAncien}</em> — Nouveau lieu : <strong>${nouveauLieu}</strong>.
        Toutes les autres clauses du contrat initial restent inchangées.</p>
      </div>` : '';
    const clauseEssai = nouvelleFinEssai ? `
      <div class="clause">
        <h3>Article 5 — Période d'essai</h3>
        <p>La période d'essai initialement prévue est modifiée. Sa nouvelle date de fin est fixée au
        <strong>${formatDate(nouvelleFinEssai)}</strong>. Les autres conditions de la période d'essai
        (durée, renouvellement) demeurent inchangées.</p>
      </div>` : '';
    const clauseObs = observationsAvn ? `
      <div class="clause observations">
        <h3>Observations spécifiques</h3>
        <p>${observationsAvn}</p>
      </div>` : '';

    const html = `
      <html><head><title>${pdfFileName}</title>
      <style>
        @page { size: A4; margin: 18mm 16mm; }
        body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #0b2a4a; margin: 0; padding: 0; ${mode === 'preview' ? 'background: #f4f7fc;' : ''} }
        .sheet { max-width: 800px; margin: ${mode === 'preview' ? '24px auto' : '0 auto'}; padding: 24px 32px; background: #fff; ${mode === 'preview' ? 'box-shadow: 0 4px 24px rgba(11,42,74,0.12); border-radius: 4px;' : ''} }
        .head { text-align: center; border-bottom: 3px double #0b2a4a; padding-bottom: 14px; margin-bottom: 14px; }
        .head h1 { font-size: 1.4rem; margin: 0 0 6px 0; letter-spacing: 0.04em; }
        .head .sub { font-size: 0.76rem; color: #6b7a8a; line-height: 1.5; }
        .head .meta { font-size: 0.7rem; color: #6b7a8a; margin-top: 4px; }
        .ref-line { display: flex; justify-content: space-between; font-size: 0.7rem; color: #6b7a8a; margin-bottom: 16px; padding: 6px 10px; background: #fafbfd; border-left: 3px solid #7e3ff2; border-radius: 2px; }
        .identites { display: flex; justify-content: space-between; margin-bottom: 18px; gap: 16px; }
        .identite { flex: 1; border: 1px solid #d6dde6; border-radius: 6px; padding: 12px 14px; background: #fafbfd; }
        .identite h3 { font-size: 0.7rem; color: #7e3ff2; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e9edf2; padding-bottom: 4px; }
        .identite p { font-size: 0.78rem; margin: 3px 0; color: #1a2a3a; line-height: 1.4; }
        .identite p strong { color: #0b2a4a; }
        .identite p .label { color: #6b7a8a; display: inline-block; min-width: 90px; }
        h2.titre-bloc { font-size: 0.9rem; color: #0b2a4a; border-left: 4px solid #7e3ff2; padding-left: 8px; margin: 16px 0 8px 0; }
        table.modif { width: 100%; border-collapse: collapse; margin: 8px 0 14px 0; }
        table.modif th, table.modif td { padding: 7px 10px; border: 1px solid #d6dde6; font-size: 0.78rem; text-align: left; }
        table.modif th { background: #f4f7fc; color: #0b2a4a; font-weight: 700; }
        table.modif td.avant { color: #6b7a8a; }
        table.modif td.apres { font-weight: 700; color: #2a7a4a; }
        .delta { font-size: 0.72rem; color: #2a7a4a; font-weight: 700; }
        .clauses { margin-top: 6px; }
        .clause { margin-bottom: 11px; page-break-inside: avoid; }
        .clause h3 { font-size: 0.78rem; color: #0b2a4a; margin: 0 0 3px 0; }
        .clause p { font-size: 0.76rem; color: #2a3a4a; text-align: justify; margin: 0; line-height: 1.45; }
        .clause.observations { background: #fff8e6; border-left: 3px solid #f0ad4e; padding: 8px 10px; border-radius: 2px; }
        .clause.observations h3 { color: #b86a2a; }
        .signatures { display: flex; justify-content: space-between; margin-top: 36px; gap: 24px; page-break-inside: avoid; }
        .sig-block { text-align: center; width: 46%; border: 1px solid #d6dde6; border-radius: 6px; padding: 12px; background: #fafbfd; }
        .sig-block .sig-title { font-size: 0.78rem; color: #0b2a4a; font-weight: 700; margin: 0 0 4px 0; }
        .sig-block .sig-name { font-size: 0.72rem; color: #1a2a3a; margin: 2px 0; }
        .sig-block .sig-label { font-size: 0.65rem; color: #6b7a8a; }
        .sig-block .sig-line { border-top: 1px dashed #0b2a4a; margin-top: 32px; padding-top: 4px; font-size: 0.66rem; color: #6b7a8a; }
        .footer { text-align: center; margin-top: 24px; padding-top: 10px; border-top: 1px solid #d6dde6; font-size: 0.62rem; color: #6b7a8a; }
        .footer .version { font-weight: 700; color: #7e3ff2; }
        .stamp { display: inline-block; margin-top: 6px; padding: 2px 8px; border: 1px solid #7e3ff2; color: #7e3ff2; border-radius: 4px; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em; }
        ${mode === 'preview' ? '.preview-toolbar { position: sticky; top: 0; background: #0b2a4a; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15); } .preview-toolbar button { background: #7e3ff2; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 700; } .preview-toolbar button:hover { background: #6a2ed0; } .preview-toolbar .filename { font-family: monospace; opacity: 0.9; }' : ''}
      </style></head>
      <body>
        ${mode === 'preview' ? `<div class="preview-toolbar">
          <div><strong>📄 Aperçu du document</strong> — <span class="filename">${pdfFileName}</span></div>
          <div>
            <button onclick="window.print()">🖨️ Imprimer / Exporter PDF</button>
          </div>
        </div>` : ''}
        <div class="sheet">
          <div class="head">
            <h1>AVENANT AU CONTRAT DE TRAVAIL</h1>
            <div class="sub">N° <strong>${avenant.amendment_number}</strong> — Contrat référent : <strong>${contractNum}</strong> — Émis le <strong>${dateEmission}</strong></div>
            <div class="meta">Réf. interne : ${avenant.amendment_number}  |  Date d'effet : ${dateEffet}  |  Motif : ${motif}</div>
          </div>
          <div class="ref-line">
            <span><strong>Version :</strong> ${versionDoc}</span>
            <span><strong>Date d'émission :</strong> ${dateEmission}</span>
            <span><strong>Statut :</strong> ${avenant.statut}</span>
          </div>
          <div class="identites">
            <div class="identite">
              <h3>Employeur</h3>
              <p><strong>${employeurNom}</strong></p>
              <p><span class="label">Siège social :</span> ${employeurAddr}</p>
              <p><span class="label">Représentant :</span> ${representant}</p>
              <p><span class="label">Capital social :</span> 10 000 000 FCFA</p>
            </div>
            <div class="identite">
              <h3>Salarié</h3>
              <p><strong>${emp}</strong></p>
              <p><span class="label">Matricule :</span> ${matricule}</p>
              <p><span class="label">Email :</span> ${emailSal}</p>
              <p><span class="label">Poste actuel :</span> ${posteAvant}</p>
              <p><span class="label">Nouveau poste :</span> ${posteApres}</p>
            </div>
          </div>
          <h2 class="titre-bloc">Objet de l'avenant</h2>
          <p style="font-size:0.78rem;color:#2a3a4a;text-align:justify;line-height:1.45;">
            Le présent avenant a pour objet de modifier, à compter du <strong>${dateEffet}</strong>,
            les conditions initiales du contrat de travail référencé sous le numéro <strong>${contractNum}</strong>,
            conformément à l'article 32 du Code du Travail camerounais (Loi n° 92/007 du 14/08/1992).
            Le motif de cette modification est : <strong>${motif}</strong>.
          </p>
          <h2 class="titre-bloc">Modifications apportées</h2>
          <table class="modif">
            <thead>
              <tr><th>Élément</th><th>Avant (ancien)</th><th>Après (nouveau)</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Poste</td>
                <td class="avant">${posteAvant}</td>
                <td class="apres">${posteApres}</td>
              </tr>
              <tr>
                <td>Salaire brut mensuel</td>
                <td class="avant">${salaireAvant} FCFA</td>
                <td class="apres">${salaireApres} FCFA</td>
              </tr>
              <tr>
                <td>Régime de travail</td>
                <td class="avant">${tempsAvant}</td>
                <td class="apres">${tempsApres}</td>
              </tr>${nouveauLieu ? `
              <tr>
                <td>Lieu de travail</td>
                <td class="avant">${lieuAncien}</td>
                <td class="apres">${nouveauLieu}</td>
              </tr>` : ''}
              <tr>
                <td>Variation salariale</td>
                <td class="avant">—</td>
                <td class="apres"><span class="delta">${signe}${formatNumber(delta)} FCFA (${signe}${pct}%)</span></td>
              </tr>
            </tbody>
          </table>
          <div class="clauses">
            <div class="clause">
              <h3>Article 1 — Objet</h3>
              <p>Le présent avenant, conclu entre <strong>${employeurNom}</strong> (représenté par ${representant}) et M./Mme <strong>${emp}</strong>, modifie
              les conditions d'exécution du contrat de travail <strong>${contractNum}</strong> initialement signé.
              Il entre en vigueur à la date d'effet mentionnée ci-dessus.</p>
            </div>
            <div class="clause">
              <h3>Article 2 — Date d'effet</h3>
              <p>Les présentes modifications prennent effet le <strong>${dateEffet}</strong>. À compter
              de cette date, les clauses modifiées se substituent à celles du contrat initial.
              Les clauses non modifiées du contrat initial demeurent pleinement applicables.</p>
            </div>
            <div class="clause">
              <h3>Article 3 — Modalités d'application</h3>
              <p>Le nouveau salaire brut mensuel est fixé à <strong>${salaireApres} FCFA</strong>,
              payable mensuellement à terme échu, sous déduction des cotisations sociales légales.
              Le nouveau régime de travail est de <strong>${tempsApres}</strong>, et le poste occupé
              est <strong>${posteApres}</strong>.</p>
            </div>
            ${clauseLieu}
            ${clauseEssai}
            <div class="clause">
              <h3>Article 6 — Maintien des autres clauses</h3>
              <p>Toutes les autres stipulations du contrat de travail initial et des avenants antérieurs
              demeurent inchangées et continuent de produire leurs pleins effets. Le présent avenant ne
              remet pas en cause la nature du contrat (CDI/CDD) ni la période d'essai éventuellement
              accomplie${nouvelleFinEssai ? ' (sauf modification prévue à l\'Article 5)' : ''}.</p>
            </div>
            ${clauseObs}
            <div class="clause">
              <h3>Article 7 — Acceptation et signature</h3>
              <p>Fait à Douala, en deux (2) exemplaires originaux, dont un remis à chacune des parties.
              Les soussignés reconnaissent avoir pris connaissance du présent avenant et en acceptent
              les termes sans réserve.</p>
            </div>
          </div>
          <div class="signatures">
            <div class="sig-block">
              <div class="sig-title">L'employeur (signature &amp; cachet)</div>
              <div class="sig-name">Nom : <strong>${nomSignataire}</strong></div>
              <div class="sig-name">Date : <strong>${dateEmission}</strong></div>
              <div class="sig-label">Signature :</div>
              <div class="sig-line">${employeurNom} — ${representant}</div>
            </div>
            <div class="sig-block">
              <div class="sig-title">Le salarié (signature)</div>
              <div class="sig-name">Nom : <strong>${emp}</strong></div>
              <div class="sig-name">Matricule : <strong>${matricule}</strong></div>
              <div class="sig-label">Date : ____________</div>
              <div class="sig-line">Signature :</div>
            </div>
          </div>
          <div class="footer">
            Document généré automatiquement par Admina-RH — Conforme ISO 30401:2018 &amp; Code du Travail camerounais (Loi n° 92/007 du 14/08/1992), art. 32<br/>
            <span class="version">Version ${versionDoc}</span> — Avenant généré le ${dateEmission} · ${pdfFileName}
            <div><span class="stamp">DOC OFFICIEL</span></div>
          </div>
        </div>
      </body></html>
    `;
    return html;
  }, [avenant, employee, contract, pdfFileName]);

  // --- Aperçu du document (ouvre un onglet sans déclencher l'impression) ---
  const handlePreview = () => {
    if (!avenant) { setSnack({ msg: 'Veuillez sélectionner un N° d\'avenant', severity: 'warning' }); return; }
    const html = generateAvenantHTML('preview');
    if (!html) { setSnack({ msg: 'Erreur lors de la génération de l\'aperçu', severity: 'error' }); return; }
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) { setSnack({ msg: 'Veuillez autoriser les pop-ups pour afficher l\'aperçu', severity: 'error' }); return; }
    previewWindow.document.write(html);
    previewWindow.document.close();
    setSnack({ msg: `Aperçu ouvert dans un nouvel onglet — ${pdfFileName}`, severity: 'info' });
  };

  // --- Export PDF via impression navigateur ---
  // Excel VBA : ActiveSheet.ExportAsFixedFormat xlTypePDF, "Avenants_PDF\" & fileName
  // Web équivalent : window.open() + print() avec zone d'impression définie
  const handleExportPDF = () => {
    if (!avenant) { setSnack({ msg: 'Veuillez sélectionner un N° d\'avenant', severity: 'warning' }); return; }
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) { setSnack({ msg: 'Veuillez autoriser les pop-ups pour exporter le PDF', severity: 'error' }); return; }
    const html = generateAvenantHTML('print');
    if (!html) return;
    printWindow.document.write(html);
    printWindow.document.close();
    // Attendre le rendu avant impression
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 350);
    setSnack({ msg: `Export PDF généré : ${pdfFileName}`, severity: 'success' });
  };

  // --- Validation : si aucun avenant sélectionné ---
  if (!avenant) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='warning'>Aucun avenant sélectionné. Veuillez choisir un N° dans la liste déroulante (cellule B1).</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* === BARRE D'ACTIONS PRINCIPALE === */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
        <Button
          variant='outlined' size='small' startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/domaine2_Gestion_Administrative_Personnel/avenants')}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          Retour aux avenants
        </Button>
        <Button
          variant='contained' size='small' startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
          sx={{ bgcolor: ROUGE, textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, '&:hover': { bgcolor: '#9a2f3a' } }}
        >
          📄 Exporter en PDF
        </Button>
        <Tooltip title='Nom du fichier généré'>
          <Chip
            icon={<InfoOutlinedIcon sx={{ fontSize: 14 }} />}
            label={pdfFileName}
            size='small'
            sx={{ fontSize: '0.62rem', bgcolor: 'rgba(179,58,74,0.08)', color: ROUGE, fontFamily: 'monospace', fontWeight: 600, maxWidth: { xs: '100%', sm: 420 }, '& .MuiChip-label': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
          />
        </Tooltip>
      </Stack>

      {/* === BANDEAU EXCEL : SIMULATION DE L'ONGLET Modele_Avenant_PDF === */}
      <Alert severity='info' sx={{ mb: 2, fontSize: '0.75rem', '& .MuiAlert-message': { width: '100%' } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent='space-between'>
          <Box>
            <strong>📌 Onglet Excel « Modele_Avenant_PDF »</strong> — Sélectionnez un N° Avenant en B1, les cellules nommées se remplissent automatiquement via RECHERCHEX. La zone d'impression correspond aux lignes 5 à 30 du modèle.
          </Box>
          <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', fontFamily: 'monospace' }}>
            Zone impression : A5:T30 · Dossier : Avenants_PDF\\
          </Typography>
        </Stack>
      </Alert>

      {/* === CELLULE B1 : LISTE DÉROULANTE N° AVENANT === */}
      <Card sx={{ mb: 2, border: `2px solid ${VIOLET}30`, borderRadius: '12px', bgcolor: '#faf5fff' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box sx={{ flexShrink: 0 }}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Box sx={{ width: 36, height: 36, bgcolor: VIOLET, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, fontWeight: 800, fontSize: '0.7rem', fontFamily: 'monospace' }}>B1</Box>
                <Box>
                  <Typography variant='caption' sx={{ fontSize: '0.62rem', color: '#6b7a8a', display: 'block' }}>Cellule B1 — Liste déroulante (source: Avenants!A:A)</Typography>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.85rem', color: NAVY }}>Sélection du N° Avenant</Typography>
                </Box>
              </Stack>
            </Box>
            <TextField
              select size='small' value={selectedNum} onChange={(e) => setSelectedNum(e.target.value)}
              sx={{ flex: 1, minWidth: 250, '& .MuiInputBase-input': { fontWeight: 700, fontFamily: 'monospace' } }}
              InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 18, color: VIOLET }} /></InputAdornment> }}
            >
              {AVENANTS.map(a => {
                const emp = findEmployee(a.employee_id);
                return (
                  <MenuItem key={a.id} value={a.amendment_number}>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 700, color: VIOLET }}>{a.amendment_number}</Typography>
                      <Typography variant='caption' sx={{ color: '#6b7a8a' }}>·</Typography>
                      <Typography variant='caption' sx={{ color: NAVY }}>{emp ? employeeFullName(emp) : '—'}</Typography>
                      <Chip label={a.statut} size='small' sx={{ height: 14, fontSize: '0.5rem', ml: 0.5 }} />
                    </Stack>
                  </MenuItem>
                );
              })}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* === CELLULES NOMMÉES AVEC RECHERCHEX (B5..B13) === */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <SectionHeader
            title='Cellules nommées (RECHERCHEX)'
            subtitle='Chaque champ se remplit automatiquement avec la formule =RECHERCHEX($B$1; Avenants!A:A; Avenants!<colonne>; "Non trouvé"; 0)'
            action={<Chip icon={<SpellcheckIcon sx={{ fontSize: 14 }} />} label={`${NAMED_CELLS.length} champs`} size='small' sx={{ bgcolor: 'rgba(126,63,242,0.1)', color: VIOLET, fontWeight: 700, fontSize: '0.62rem' }} />}
          />
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9edf2', borderRadius: 1 }}>
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem', width: 50 }}>Cellule</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem', width: 130 }}>Nom défini</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Libellé</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem' }}>Valeur (RECHERCHEX)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.66rem', fontFamily: 'monospace' }}>Formule Excel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {NAMED_CELLS.map((nc) => {
                  const value = getValue(nc);
                  const isEmpty = value === '—' || value === 'Non trouvé';
                  return (
                    <TableRow key={nc.name} hover>
                      <TableCell>
                        <Box sx={{ display: 'inline-block', px: 0.6, py: 0.2, bgcolor: '#eef0f3', borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.6rem', fontWeight: 700, color: '#6b7a8a' }}>{nc.cell}</Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={nc.name} size='small' sx={{ bgcolor: 'rgba(126,63,242,0.1)', color: VIOLET, fontWeight: 700, fontSize: '0.6rem', height: 18 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', color: '#4a5a6a' }}>{nc.label}</TableCell>
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.74rem', fontWeight: 700, color: isEmpty ? GRIS : NAVY, fontFamily: nc.field?.includes('salaire') ? 'monospace' : 'inherit' }}>
                          {value}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' sx={{ fontSize: '0.58rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={nc.formula}>
                          {nc.formula}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* === ZONE D'IMPRESSION : MODÈLE D'AVENANT (LIGNES 5-30) === */}
      <Card sx={{ mb: 2, border: `2px dashed ${ROUGE}40`, borderRadius: '12px' }}>
        <CardContent>
          <SectionHeader
            title="Zone d'impression (lignes 5 à 30 du modèle)"
            subtitle='Aperçu du document PDF généré — pré-rempli automatiquement avec RECHERCHEX'
            action={
              <Stack direction='row' spacing={1}>
                <Button variant='outlined' size='small' startIcon={<VisibilityIcon />} onClick={handlePreview} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>Aperçu</Button>
                <Button variant='contained' size='small' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ bgcolor: ROUGE, textTransform: 'none', fontSize: '0.72rem', fontWeight: 700 }}>📄 Exporter PDF</Button>
              </Stack>
            }
          />
          {/* Le ref ci-dessous correspond à la zone d'impression (lignes 5 à 30) */}
          <Box ref={printRef} sx={{
            bgcolor: '#fff', border: `1px solid ${ROUGE}20`, borderRadius: 1.5, p: { xs: 2, md: 3.5 },
            maxWidth: 820, mx: 'auto', boxShadow: '0 1px 8px rgba(11,42,74,0.04)',
          }}>
            {/* En-tête officiel enrichi (Master Prompt Étape 1) */}
            <Box sx={{ textAlign: 'center', borderBottom: `3px double ${NAVY}`, pb: 1.5, mb: 1.5 }}>
              <Typography variant='h5' fontWeight={800} sx={{ color: NAVY, fontSize: { xs: '1.15rem', md: '1.4rem' }, letterSpacing: '0.04em' }}>AVENANT AU CONTRAT DE TRAVAIL</Typography>
              <Typography variant='caption' sx={{ color: '#6b7a8a', fontSize: '0.76rem', display: 'block', mt: 0.3 }}>
                N° <strong style={{ color: NAVY }}>{avenant.amendment_number}</strong> — Contrat référent : <strong style={{ color: VIOLET }}>{contract?.contract_number || '—'}</strong> — Émis le <strong style={{ color: NAVY }}>{new Date().toLocaleDateString('fr-FR')}</strong>
              </Typography>
              <Typography variant='caption' sx={{ color: '#9aa8b8', fontSize: '0.68rem', display: 'block', mt: 0.3 }}>
                Réf. interne : {avenant.amendment_number}  |  Date d'effet : {formatDate(avenant.date_effet)}  |  Motif : {avenant.motif}
              </Typography>
            </Box>
            {/* Ligne de références enrichie (Version, Date émission, Statut) */}
            <Stack direction='row' justifyContent='space-between' sx={{ fontSize: '0.7rem', color: '#6b7a8a', mb: 2, px: 1, py: 0.8, bgcolor: '#fafbfd', borderLeft: `3px solid ${VIOLET}`, borderRadius: 0.5 }}>
              <span><strong>Version :</strong> <Chip label="V1.0" size="small" sx={{ fontSize: '0.55rem', height: 14, bgcolor: 'rgba(126,63,242,0.1)', color: VIOLET, fontWeight: 700 }} /></span>
              <span><strong>Date d'émission :</strong> {new Date().toLocaleDateString('fr-FR')}</span>
              <span><strong>Statut :</strong> {avenant.statut}</span>
            </Stack>
            {/* Identités employeur + salarié enrichies (Master Prompt Étape 2) */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: '1px solid #d6dde6', borderRadius: 1, p: 1.5, bgcolor: '#fafbfd' }}>
                  <Typography variant='caption' sx={{ fontSize: '0.65rem', color: VIOLET, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 0.5, borderBottom: '1px solid #e9edf2', pb: 0.3 }}>Employeur</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.78rem', display: 'block', fontWeight: 700, color: NAVY, mb: 0.2 }}>Admina-RH SARL</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#4a5a6a', display: 'block' }}><span style={{ color: '#6b7a8a', display: 'inline-block', minWidth: 90 }}>Siège social :</span> Douala, Cameroun</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#4a5a6a', display: 'block' }}><span style={{ color: '#6b7a8a', display: 'inline-block', minWidth: 90 }}>Représentant :</span> Directeur Général</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#4a5a6a', display: 'block' }}><span style={{ color: '#6b7a8a', display: 'inline-block', minWidth: 90 }}>Capital social :</span> 10 000 000 FCFA</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: '1px solid #d6dde6', borderRadius: 1, p: 1.5, bgcolor: '#fafbfd' }}>
                  <Typography variant='caption' sx={{ fontSize: '0.65rem', color: VIOLET, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 0.5, borderBottom: '1px solid #e9edf2', pb: 0.3 }}>Salarié</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.78rem', display: 'block', fontWeight: 700, color: NAVY, mb: 0.2 }}>{employee ? employeeFullName(employee) : '—'}</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#4a5a6a', display: 'block' }}><span style={{ color: '#6b7a8a', display: 'inline-block', minWidth: 90 }}>Matricule :</span> {employee?.matricule || '—'}</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#4a5a6a', display: 'block' }}><span style={{ color: '#6b7a8a', display: 'inline-block', minWidth: 90 }}>Email :</span> {employee?.email || 'Non renseigné'}</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#4a5a6a', display: 'block' }}><span style={{ color: '#6b7a8a', display: 'inline-block', minWidth: 90 }}>Poste actuel :</span> {avenant.poste_actuel || '—'}</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#4a5a6a', display: 'block' }}><span style={{ color: '#6b7a8a', display: 'inline-block', minWidth: 90 }}>Nouveau poste :</span> {avenant.nouveau_poste || '—'}</Typography>
                </Box>
              </Grid>
            </Grid>
            {/* Objet */}
            <Typography variant='subtitle2' sx={{ fontSize: '0.85rem', color: NAVY, borderLeft: `4px solid ${VIOLET}`, pl: 1, mb: 0.8 }}>Objet de l'avenant</Typography>
            <Typography variant='body2' sx={{ fontSize: '0.76rem', color: '#2a3a4a', textAlign: 'justify', lineHeight: 1.45, mb: 1.5 }}>
              Le présent avenant a pour objet de modifier, à compter du <strong>{formatDate(avenant.date_effet)}</strong>,
              les conditions initiales du contrat de travail référencé sous le numéro <strong>{contract?.contract_number || '—'}</strong>,
              conformément à l'article 32 du Code du Travail camerounais (Loi n° 92/007 du 14/08/1992).
              Le motif de cette modification est : <strong>{avenant.motif}</strong>.
            </Typography>
            {/* Tableau des modifications */}
            <Typography variant='subtitle2' sx={{ fontSize: '0.85rem', color: NAVY, borderLeft: `4px solid ${VIOLET}`, pl: 1, mb: 0.8 }}>Modifications apportées</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d6dde6', borderRadius: 1, mb: 1.5 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f4f7fc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Élément</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Avant (ancien)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Après (nouveau)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.74rem' }}>Poste</TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', color: '#6b7a8a' }}>{avenant.poste_actuel || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: VERT }}>{avenant.nouveau_poste || avenant.poste_actuel || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.74rem' }}>Salaire brut mensuel</TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', color: '#6b7a8a', fontFamily: 'monospace' }}>{formatNumber(avenant.salaire_ancien)} FCFA</TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: VERT, fontFamily: 'monospace' }}>{formatNumber(avenant.nouveau_salaire)} FCFA</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.74rem' }}>Régime de travail</TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', color: '#6b7a8a' }}>{avenant.temps_ancien || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: VERT }}>{avenant.nouveau_temps || avenant.temps_ancien || '—'}</TableCell>
                  </TableRow>
                  {avenant.nouveau_lieu && (
                    <TableRow sx={{ bgcolor: 'rgba(184,106,42,0.05)' }}>
                      <TableCell sx={{ fontSize: '0.74rem' }}>Lieu de travail</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', color: '#6b7a8a' }}>{contract?.lieu_travail || employee?.lieu_travail || 'Douala'}</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: ORANGE }}>{avenant.nouveau_lieu}</TableCell>
                    </TableRow>
                  )}
                  {deltaSalaire && (
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.74rem' }}>Variation salariale</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', color: '#6b7a8a' }}>—</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: deltaSalaire.diff >= 0 ? VERT : ROUGE }}>
                        {deltaSalaire.diff >= 0 ? '+' : ''}{formatNumber(deltaSalaire.diff)} FCFA ({deltaSalaire.diff >= 0 ? '+' : ''}{deltaSalaire.pct.toFixed(1)}%)
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Articles de loi + clauses conditionnelles (Master Prompt Étape 4) */}
            <Typography variant='subtitle2' sx={{ fontSize: '0.85rem', color: NAVY, borderLeft: `4px solid ${VIOLET}`, pl: 1, mb: 0.8 }}>Clauses</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {[
                { n: 1, t: 'Objet', c: `Le présent avenant, conclu entre Admina-RH SARL (représenté par le Directeur Général) et M./Mme ${employee ? employeeFullName(employee) : '—'}, modifie les conditions d'exécution du contrat ${contract?.contract_number || '—'} initialement signé. Il entre en vigueur à la date d'effet mentionnée ci-dessus.` },
                { n: 2, t: 'Date d\'effet', c: `Les présentes modifications prennent effet le ${formatDate(avenant.date_effet)}. À compter de cette date, les clauses modifiées se substituent à celles du contrat initial. Les clauses non modifiées du contrat initial demeurent pleinement applicables.` },
                { n: 3, t: 'Modalités d\'application', c: `Le nouveau salaire brut mensuel est fixé à ${formatNumber(avenant.nouveau_salaire)} FCFA, payable mensuellement à terme échu, sous déduction des cotisations sociales légales. Le régime de travail est ${avenant.nouveau_temps || avenant.temps_ancien || '—'}, et le poste occupé est ${avenant.nouveau_poste || avenant.poste_actuel || '—'}.` },
              ].map(art => (
                <Box key={art.n}>
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.76rem', color: NAVY, display: 'block', mb: 0.3 }}>Article {art.n} — {art.t}</Typography>
                  <Typography variant='body2' sx={{ fontSize: '0.74rem', color: '#2a3a4a', textAlign: 'justify', lineHeight: 1.45 }}>{art.c}</Typography>
                </Box>
              ))}
              {/* Clause conditionnelle : Nouveau lieu (Master Prompt Étape 4.3) */}
              {avenant.nouveau_lieu && (
                <Box sx={{ p: 1, bgcolor: 'rgba(184,106,42,0.05)', borderLeft: `3px solid ${ORANGE}`, borderRadius: 0.5 }}>
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.76rem', color: ORANGE, display: 'block', mb: 0.3 }}>Article 4 — Modification du lieu de travail</Typography>
                  <Typography variant='body2' sx={{ fontSize: '0.74rem', color: '#2a3a4a', textAlign: 'justify', lineHeight: 1.45 }}>
                    À compter du <strong>{formatDate(avenant.date_effet)}</strong>, le lieu de travail du salarié est modifié comme suit :
                    Ancien lieu : <em>{contract?.lieu_travail || employee?.lieu_travail || 'Douala'}</em> — Nouveau lieu : <strong style={{ color: ORANGE }}>{avenant.nouveau_lieu}</strong>.
                    Toutes les autres clauses du contrat initial restent inchangées.
                  </Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mt: 0.3 }}>
                    {'=SI(NouveauLieu<>""; "Article 4 — Modification du lieu..."; "")'}
                  </Typography>
                </Box>
              )}
              {/* Clause conditionnelle : Période d'essai (Master Prompt Étape 4.3) */}
              {avenant.nouvelle_fin_essai && (
                <Box sx={{ p: 1, bgcolor: 'rgba(184,106,42,0.05)', borderLeft: `3px solid ${ORANGE}`, borderRadius: 0.5 }}>
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.76rem', color: ORANGE, display: 'block', mb: 0.3 }}>Article 5 — Période d'essai</Typography>
                  <Typography variant='body2' sx={{ fontSize: '0.74rem', color: '#2a3a4a', textAlign: 'justify', lineHeight: 1.45 }}>
                    La période d'essai initialement prévue est modifiée. Sa nouvelle date de fin est fixée au <strong style={{ color: ORANGE }}>{formatDate(avenant.nouvelle_fin_essai)}</strong>.
                    Les autres conditions de la période d'essai (durée, renouvellement) demeurent inchangées.
                  </Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mt: 0.3 }}>
                    {'=SI(NouvelleFinEssai<>""; "Article 5 — Période d\'essai..."; "")'}
                  </Typography>
                </Box>
              )}
              {/* Article Maintien des autres clauses */}
              <Box>
                <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.76rem', color: NAVY, display: 'block', mb: 0.3 }}>Article 6 — Maintien des autres clauses</Typography>
                <Typography variant='body2' sx={{ fontSize: '0.74rem', color: '#2a3a4a', textAlign: 'justify', lineHeight: 1.45 }}>
                  Toutes les autres stipulations du contrat de travail initial et des avenants antérieurs demeurent inchangées et continuent de produire leurs pleins effets. Le présent avenant ne remet pas en cause la nature du contrat (CDI/CDD) ni la période d'essai éventuellement accomplie{avenant.nouvelle_fin_essai ? ' (sauf modification prévue à l\'Article 5)' : ''}.
                </Typography>
              </Box>
              {/* Clause conditionnelle : Observations (Master Prompt Étape 4.3) */}
              {avenant.observations_avn && (
                <Box sx={{ p: 1, bgcolor: '#fff8e6', borderLeft: `3px solid #f0ad4e`, borderRadius: 0.5 }}>
                  <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.76rem', color: ORANGE, display: 'block', mb: 0.3 }}>Observations spécifiques</Typography>
                  <Typography variant='body2' sx={{ fontSize: '0.74rem', color: '#2a3a4a', textAlign: 'justify', lineHeight: 1.45 }}>{avenant.observations_avn}</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.55rem', color: '#9aa8b8', fontFamily: 'monospace', display: 'block', mt: 0.3 }}>
                    {'=SI(Observations<>""; "Observations spécifiques..."; "")'}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant='caption' fontWeight={700} sx={{ fontSize: '0.76rem', color: NAVY, display: 'block', mb: 0.3 }}>Article 7 — Acceptation et signature</Typography>
                <Typography variant='body2' sx={{ fontSize: '0.74rem', color: '#2a3a4a', textAlign: 'justify', lineHeight: 1.45 }}>
                  Fait à Douala, en deux (2) exemplaires originaux, dont un remis à chacune des parties. Les soussignés reconnaissent avoir pris connaissance du présent avenant et en acceptent les termes sans réserve.
                </Typography>
              </Box>
            </Stack>
            {/* Signatures enrichies (Master Prompt Étape 3) */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', border: '1px solid #d6dde6', borderRadius: 1, p: 1.5, bgcolor: '#fafbfd' }}>
                  <Typography variant='caption' sx={{ fontSize: '0.78rem', color: NAVY, fontWeight: 700, mb: 0.5, display: 'block' }}>L'employeur (signature &amp; cachet)</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#1a2a3a', display: 'block' }}>Nom : <strong>Le Directeur Général</strong></Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#1a2a3a', display: 'block' }}>Date : <strong>{new Date().toLocaleDateString('fr-FR')}</strong></Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', display: 'block', mt: 1 }}>Signature :</Typography>
                  <Box sx={{ borderTop: `1px dashed ${NAVY}`, mt: 3, pt: 0.5, fontSize: '0.66rem', color: '#6b7a8a' }}>Admina-RH SARL — Directeur Général</Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', border: '1px solid #d6dde6', borderRadius: 1, p: 1.5, bgcolor: '#fafbfd' }}>
                  <Typography variant='caption' sx={{ fontSize: '0.78rem', color: NAVY, fontWeight: 700, mb: 0.5, display: 'block' }}>Le salarié (signature)</Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#1a2a3a', display: 'block' }}>Nom : <strong>{employee ? employeeFullName(employee) : '—'}</strong></Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.72rem', color: '#1a2a3a', display: 'block' }}>Matricule : <strong>{employee?.matricule || '—'}</strong></Typography>
                  <Typography variant='caption' sx={{ fontSize: '0.65rem', color: '#6b7a8a', display: 'block', mt: 1 }}>Date : ____________</Typography>
                  <Box sx={{ borderTop: `1px dashed ${NAVY}`, mt: 3, pt: 0.5, fontSize: '0.66rem', color: '#6b7a8a' }}>Signature :</Box>
                </Box>
              </Grid>
            </Grid>
            {/* Footer enrichi avec version + date émission */}
            <Box sx={{ textAlign: 'center', mt: 2.5, pt: 1, borderTop: '1px solid #d6dde6', fontSize: '0.62rem', color: '#6b7a8a' }}>
              Document généré automatiquement par Admina-RH — Conforme ISO 30401:2018 &amp; Code du Travail camerounais (Loi n° 92/007 du 14/08/1992), art. 32<br/>
              <strong style={{ color: VIOLET }}>Version V1.0</strong> — Avenant généré le {new Date().toLocaleDateString('fr-FR')} · {pdfFileName}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* === INSTRUCTION ALTERNATIVE (VBA INTERDIT) === */}
      <Alert severity='warning' sx={{ mb: 2, fontSize: '0.75rem' }}>
        <Typography variant='subtitle2' fontWeight={700} sx={{ fontSize: '0.82rem', mb: 0.5 }}>⚠️ Si VBA est interdit dans votre environnement Excel :</Typography>
        Sélectionner le N° d'avenant en <strong>B1</strong>, puis utiliser <strong>Fichier &gt; Exporter &gt; Créer PDF/XPS</strong>.
        Le nom du fichier suggéré sera : <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace' }}>{pdfFileName}</code>
        <br/>Dans l'application web Admina-RH, cliquez simplement sur <strong>« 📄 Exporter en PDF »</strong> : la zone d'impression (lignes 5 à 30) est déjà définie.
      </Alert>

      {/* === SNACKBAR === */}
      <Snackbar
        open={Boolean(snack)} autoHideDuration={4500} onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snack?.msg}
      />
    </Box>
  );
}
