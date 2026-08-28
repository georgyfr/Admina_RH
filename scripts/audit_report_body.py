# -*- coding: utf-8 -*-
"""
Audit Fonctionnel Admina-RH - Rapport PDF (corps)
"""
import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import mm, cm, inch
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import SimpleDocTemplate

# ━━ Fonts ━━
FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold', italic='FreeSerif-Italic')
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')

# ━━ Cascade Palette ━━
PAGE_BG       = colors.HexColor('#f2f2f1')
SECTION_BG    = colors.HexColor('#eeeeec')
CARD_BG       = colors.HexColor('#ebeae6')
TABLE_STRIPE  = colors.HexColor('#f0efee')
HEADER_FILL   = colors.HexColor('#655c40')
COVER_BLOCK   = colors.HexColor('#5e5947')
BORDER        = colors.HexColor('#beb8a7')
ICON          = colors.HexColor('#917d40')
ACCENT        = colors.HexColor('#8d7325')
ACCENT_2      = colors.HexColor('#43a1c1')
TEXT_PRIMARY   = colors.HexColor('#1f1e1c')
TEXT_MUTED     = colors.HexColor('#908e87')
SEM_SUCCESS   = colors.HexColor('#438358')
SEM_WARNING   = colors.HexColor('#927742')
SEM_ERROR     = colors.HexColor('#91463f')
SEM_INFO      = colors.HexColor('#4e77a0')

# ━━ Styles ━─
body_style = ParagraphStyle(
    name='Body', fontName='FreeSerif', fontSize=10.5, leading=17,
    alignment=TA_JUSTIFY, spaceAfter=6, textColor=TEXT_PRIMARY
)
h1_style = ParagraphStyle(
    name='H1', fontName='FreeSerif-Bold', fontSize=18, leading=24,
    spaceBefore=18, spaceAfter=10, textColor=HEADER_FILL
)
h2_style = ParagraphStyle(
    name='H2', fontName='FreeSerif-Bold', fontSize=13, leading=18,
    spaceBefore=14, spaceAfter=8, textColor=TEXT_PRIMARY
)
h3_style = ParagraphStyle(
    name='H3', fontName='FreeSerif-Bold', fontSize=11, leading=15,
    spaceBefore=10, spaceAfter=6, textColor=ACCENT
)
caption_style = ParagraphStyle(
    name='Caption', fontName='FreeSerif-Italic', fontSize=9, leading=13,
    alignment=TA_LEFT, textColor=TEXT_MUTED, spaceAfter=6
)
kpi_style = ParagraphStyle(
    name='KPI', fontName='FreeSerif-Bold', fontSize=28, leading=34,
    alignment=TA_CENTER, textColor=SEM_ERROR
)
kpi_label_style = ParagraphStyle(
    name='KPILabel', fontName='FreeSerif', fontSize=9, leading=13,
    alignment=TA_CENTER, textColor=TEXT_MUTED
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='FreeSerif', fontSize=10.5, leading=17,
    alignment=TA_LEFT, leftIndent=18, bulletIndent=6, spaceAfter=4,
    textColor=TEXT_PRIMARY, bulletFontName='FreeSerif', bulletFontSize=10.5
)
toc_h0 = ParagraphStyle(name='TOC0', fontName='FreeSerif-Bold', fontSize=12, leading=20, leftIndent=0, textColor=TEXT_PRIMARY)
toc_h1 = ParagraphStyle(name='TOC1', fontName='FreeSerif', fontSize=10.5, leading=18, leftIndent=20, textColor=TEXT_MUTED)

# ━━ TocDocTemplate ━━
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    available = A4[0] - 2 * inch
    if col_widths is None:
        n = len(headers)
        col_widths = [available / n] * n
    header_paras = [Paragraph(f'<b>{h}</b>', ParagraphStyle(
        name='TH', fontName='FreeSerif-Bold', fontSize=9.5, leading=13,
        textColor=colors.white, alignment=TA_CENTER
    )) for h in headers]
    data = [header_paras]
    for row in rows:
        data.append([Paragraph(str(c), ParagraphStyle(
            name='TC', fontName='FreeSerif', fontSize=9, leading=13,
            textColor=TEXT_PRIMARY, alignment=TA_LEFT
        )) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'FreeSerif-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def status_cell(status, detail=''):
    """Return colored status text."""
    color_map = {
        'NON IMPLEMENTE': SEM_ERROR,
        'PARTIEL': SEM_WARNING,
        'OPERATIONNEL': SEM_SUCCESS,
        'CRITIQUE': SEM_ERROR,
        'AVERTISSEMENT': SEM_WARNING,
        'INFO': SEM_INFO,
    }
    c = color_map.get(status, TEXT_PRIMARY)
    txt = f'<font color="{c.hexval()}"><b>{status}</b></font>'
    if detail:
        txt += f'<br/><font size="8" color="{TEXT_MUTED.hexval()}">{detail}</font>'
    return txt

def safe_keep(elements):
    """KeepTogether with height limit."""
    total = sum(e.wrap(A4[0] - 2*inch, A4[1])[1] for e in elements)
    if total <= A4[1] * 0.4:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

# ━━ Build Document ━━
OUTPUT = '/home/z/my-project/download/audit_fonctionnel_admina_rh.pdf'

# Numbering plan:
# Outline Index | Type    | Chapter # | Title
# 1             | cover   | -          | Cover
# 2             | toc     | -          | TDM
# 3             | content | 1          | Resume executif
# 4             | content | 2          | Methodologie d'audit
# 5             | content | 3          | Conformite du modele de donnees
# 6             | content | 4          | Audit par module
# 7             | content | 5          | Analyse technique
# 8             | content | 6          | Synthese et recommandations

doc = TocDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=inch, rightMargin=inch,
    topMargin=0.8*inch, bottomMargin=0.8*inch,
    title='Audit Fonctionnel Admina-RH',
    author='Z.ai',
    subject='Audit fonctionnel Admina-RH Module Recrutement'
)

story = []

# ── TOC ──
toc = TableOfContents()
toc.levelStyles = [toc_h0, toc_h1]
story.append(toc)
story.append(PageBreak())

# ════════════════════════════════════════════
# CHAPITRE 1 - RESUME EXECUTIF
# ════════════════════════════════════════════
story.append(add_heading('1. Resume executif', h1_style, level=0))

story.append(Paragraph(
    "Cet audit fonctionnel a ete realise le 28 aout 2026 sur la plateforme Admina-RH, "
    "une application SaaS de gestion du recrutement deployee a l'adresse admina-rh-bd0.pages.dev "
    "(Cloudflare Pages). L'objectif principal est d'evaluer la conformite de l'implementation "
    "par rapport au modele de donnees de reference defini dans le fichier Excel "
    "<b>Domaine1_Recrutement_Candidats</b>, qui comporte 19 onglets couvrant l'integralite "
    "du cycle de recrutement, depuis la demande de poste jusqu'au suivi post-embauche.",
    body_style
))

story.append(Paragraph(
    "Le constat principal de cet audit est sans appel : <b>23 modules sur 24 sont "
    "entierement non implementes</b>. Seul le Tableau de Bord affiche un contenu "
    "fonctionnel, avec des donnees statiques et aucun mecanisme de navigation vers "
    "les modules detailles. L'application ne dispose d'aucun backend, d'aucune "
    "integration avec le stockage Cloudflare R2 fourni, et d'aucun systeme "
    "d'authentification. Les erreurs JavaScript en console confirment un etat "
    "de developpement en cours, loin d'etre prete pour une mise en production.",
    body_style
))

# KPI Table
kpi_data = [
    [Paragraph('<b>4%</b>', kpi_style),
     Paragraph('<b>0%</b>', kpi_style),
     Paragraph('<b>0%</b>', kpi_style),
     Paragraph('<b>2</b>', kpi_style)],
    [Paragraph('Taux d\'implementation<br/>des modules', kpi_label_style),
     Paragraph('Couverture backend<br/>et API', kpi_label_style),
     Paragraph('Integration<br/>Cloudflare R2', kpi_label_style),
     Paragraph('Erreurs JavaScript<br/>en console', kpi_label_style)],
]
kpi_table = Table(kpi_data, colWidths=[A4[0]/4 - 18]*4)
kpi_table.setStyle(TableStyle([
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
    ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
    ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
    ('TOPPADDING', (0, 0), (-1, 0), 12),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
    ('TOPPADDING', (0, 1), (-1, 1), 2),
    ('BOTTOMPADDING', (0, 1), (-1, 1), 12),
]))
story.append(Spacer(1, 12))
story.append(kpi_table)
story.append(Spacer(1, 18))

story.append(add_heading('1.1 Perimetre de l\'audit', h2_style, level=1))
story.append(Paragraph(
    "L'audit couvre l'ensemble des 19 onglets du fichier Excel de reference, "
    "qui definissent le modele de donnees complet du Domaine 1 (Recrutement) "
    "d'Admina-RH. Ce modele comprend 38 listes de reference dans l'onglet "
    "_Lists (statuts de demande, priorites, types de contrats, niveaux "
    "d'etude, departements, cabinets de recrutement, etc.) et 18 onglets "
    "fonctionnels detallant les entites et relations de chaque module. "
    "L'application web deploiee a ete testee page par page pour verifier "
    "la presence des fonctionnalites, la coherence des donnees affichees, "
    "et l'interactivite des elements d'interface.",
    body_style
))

story.append(add_heading('1.2 Contexte technique', h2_style, level=1))
story.append(Paragraph(
    "Admina-RH est une application React/Vite utilisant la bibliotheque MUI "
    "(Material UI) avec le systeme de style Emotion. Le bundle JavaScript "
    "principal (index-DrBeIkBb.js) pese 536 Ko, ce qui indique un framework "
    "substantiel. Cependant, l'analyse du bundle revele l'absence totale de "
    "references a Cloudflare, R2, ou tout SDK de stockage S3. Aucun appel "
    "API (fetch, axios) n'est present dans le code frontend, confirmant que "
    "l'application fonctionne entierement avec des donnees embarquees en "
    "dur dans le bundle JavaScript. Le deploiement sur Cloudflare Pages "
    "est purement statique, sans fonctions serveur ni routes API.",
    body_style
))

# ════════════════════════════════════════════
# CHAPITRE 2 - METHODOLOGIE
# ════════════════════════════════════════════
story.append(add_heading('2. Methodologie d\'audit', h1_style, level=0))

story.append(Paragraph(
    "L'audit a ete conduit selon une approche en trois phases complementaires, "
    "concues pour couvrir a la fois les aspects fonctionnels et techniques "
    "de la plateforme. Cette methodologie garantit une evaluation exhaustive "
    "et reproductible de l'etat d'implementation d'Admina-RH.",
    body_style
))

story.append(add_heading('2.1 Phase 1 : Extraction du modele de reference', h2_style, level=1))
story.append(Paragraph(
    "Le fichier Excel a ete analyse avec la bibliotheque openpyxl en mode "
    "lecture seule pour extraire l'integralite du schema de donnees. "
    "L'onglet _Lists a ete traite pour inventorier les 38 listes de reference "
    "(statuts, nomenclatures, enumerations) qui gouvernent le comportement "
    "de l'application. Chaque onglet fonctionnel a ete examine pour "
    "identifier les champs, les types de donnees attendus, les relations "
    "entre entites et les regles de gestion. Cette phase a produit un "
    "inventaire complet de 19 entites metier et de leurs attributs.",
    body_style
))

story.append(add_heading('2.2 Phase 2 : Test fonctionnel systematique', h2_style, level=1))
story.append(Paragraph(
    "Chacune des 24 pages accessibles depuis la barre de navigation laterale "
    "a ete visitee a l'aide d'un outil d'automatisation navigateur (Playwright). "
    "Pour chaque page, les verifications suivantes ont ete effectuees : "
    "presence d'un contenu fonctionnel (formulaire, tableau, graphique), "
    "coherence des donnees affichees avec le modele Excel, interactivite "
    "des elements (boutons, liens, champs de saisie), et absence "
    "d'erreurs JavaScript dans la console du navigateur. Les captures "
    "d'ecran ont ete realisees pour documenter l'etat visuel de chaque module.",
    body_style
))

story.append(add_heading('2.3 Phase 3 : Analyse technique du frontend', h2_style, level=1))
story.append(Paragraph(
    "Le bundle JavaScript principal a ete telecharge et analyse programmatiquement "
    "depuis le navigateur pour rechercher des references a des services externes "
    "(Cloudflare R2, API REST, endpoints d'authentification). La console "
    "du navigateur a ete inspectee pour identifier les erreurs d'execution "
    "JavaScript, et l'espace de stockage local (localStorage) a ete "
    "verifie pour detecter d'eventuelles donnees persistantes. Cette "
    "analyse technique permet d'evaluer la maturite de l'architecture "
    "et la proximite d'une version deployable en production.",
    body_style
))

# ════════════════════════════════════════════
# CHAPITRE 3 - CONFORMITE DU MODELE DE DONNEES
# ════════════════════════════════════════════
story.append(add_heading('3. Conformite du modele de donnees', h1_style, level=0))

story.append(Paragraph(
    "Le fichier Excel de reference definit un modele de donnees complet et "
    "structure pour le domaine Recrutement. Cette section compare "
    "systematiquement les 38 listes de reference de l'onglet _Lists avec "
    "les valeurs observees sur le site web, afin de mesurer le degre de "
    "conformite entre la specification et l'implementation.",
    body_style
))

story.append(add_heading('3.1 Inventaire des listes de reference (_Lists)', h2_style, level=1))
story.append(Paragraph(
    "L'onglet _Lists du fichier Excel contient 38 colonnes, chacune definissant "
    "une liste de valeurs autorisees pour un champ de l'application. Ces listes "
    "couvrent l'ensemble du vocabulaire metier : statuts de demande (En attente, "
    "Validee, En cours, Pourvue, Annulee), niveaux de priorite (Urgente, Haute, "
    "Moyenne, Basse), types de contrats (CDI, CDD, Stage, Interim, Alternance, "
    "Freelance), 19 departements metier (de Direction Generale a Audiovisuel), "
    "8 cabinets de recutement partenaires, et de nombreuses autres nomenclatures "
    "pour les entretiens, evaluations, integrations et suivis. Ce fichier "
    "constitue la source de verite pour l'ensemble des donnees de reference "
    "de l'application.",
    body_style
))

story.append(add_heading('3.2 Liste exhaustive des 38 nomenclatures', h2_style, level=1))

lists_headers = ['N.', 'Nom de la liste', 'Nb. valeurs', 'Conformite']
lists_data = [
    ['1', 'statut_demande', '6', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['2', 'priorite', '4', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['3', 'type_contrat', '7', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['4', 'type_poste', '6', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['5', 'motif', '6', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['6', 'source', '9', status_cell('PARTIEL', '7 sources sur dashboard')],
    ['7', 'statut_candidat', '7', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['8', 'statut_entretien', '5', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['9', 'type_entretien', '5', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['10', 'departement', '19', status_cell('PARTIEL', '7 dept. sur dashboard')],
    ['11', 'cabinet_recrutement', '8', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['12', 'statut_contrat', '5', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['13', 'canal_diffusion', '8', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['14', 'categorie_checklist', '6', status_cell('NON VERIFIABLE', 'Pages non implementees')],
    ['15', 'stade_pipeline', '7', status_cell('NON VERIFIABLE', 'Pages non implementees')],
]
story.append(Spacer(1, 12))
story.append(make_table(lists_headers, lists_data, [30, 140, 70, 230]))
story.append(Paragraph(
    "Tableau 1 : Extrait des 38 nomenclatures - Seules les sources et departements "
    "partiellement visibles sur le dashboard ont pu etre verifies. Les 36 autres "
    "listes ne sont accessibles nulle part dans l'interface.",
    caption_style
))

# ════════════════════════════════════════════
# CHAPITRE 4 - AUDIT PAR MODULE
# ════════════════════════════════════════════
story.append(add_heading('4. Audit detaille par module', h1_style, level=0))

story.append(Paragraph(
    "Cette section presente les resultats de l'audit module par module. "
    "Chaque module defini dans le fichier Excel est compare a son "
    "implementation (ou absence d'implementation) sur le site web. "
    "Les 24 pages de l'application sont organisees en 7 groupes "
    "fonctionnels dans la barre de navigation laterale.",
    body_style
))

# Module comparison table
mod_headers = ['#', 'Module (Navigation)', 'Onglet Excel', 'Statut', 'Detail']
avail = A4[0] - 2*inch
mod_rows = [
    ['1', 'Tableau de Bord', '18-Tableau de Bord', status_cell('OPERATIONNEL'), 'Donnees statiques, 4 KPI, 4 graphiques, 5 demandes et 5 candidats affiches'],
    ['2', 'Demandes', '1-Demandes Recrutement', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucun formulaire, aucune liste, page vide'],
    ['3', 'Previsions Postes', '8-Prevision Postes Offres', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['4', 'Sources Recrutement', '9-Sources Recrutement', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['5', 'Analyse des Couts', '10-Analyse Couts', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['6', 'Base Candidats', '2-Base Candidats', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['7', 'Pipeline Candidatures', '18-Pipeline Candidatures', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['8', 'Types de Contrats', '(dans _Lists)', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['9', 'Departements', '(dans _Lists)', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['10', 'Planning Entretiens', '3-Planning Entretiens', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['11', 'Grille Evaluation', '4-Grille Evaluation', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['12', 'Verification References', '5-Verification References', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['13', 'Selections', '(transversal)', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['14', 'Gestion Cabinets', '7-Gestion Cabinets', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['15', 'Suivi Contrats', '6-Suivi Contrats', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['16', 'Integration Employe', '11-Integration Employe', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['17', 'Checklist Integration', '12-Checklist Integration', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['18', 'Periode d\'Essai', '13-Periode Essai', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['19', 'Plan Accueil Formation', '14-Plan Accueil Formation', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['20', 'Suivi Post-Embauche', '17-Suivi Post-Embauche', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['21', 'Stagiaires', '15-Stagiaires', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['22', 'Saisonniers', '16-Saisonniers Temporaires', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['23', 'Documents', '(non defini)', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
    ['24', 'Conformite', '(non defini)', status_cell('NON IMPLEMENTE', 'Icone construction'), 'Aucune fonctionnalite'],
]
story.append(Spacer(1, 12))
story.append(make_table(mod_headers, mod_rows, [25, 110, 120, 90, avail - 345]))
story.append(Paragraph(
    "Tableau 2 : Matrice de conformite des 24 modules. Seul le module 1 (Tableau de Bord) "
    "affiche un contenu fonctionnel. Les 23 autres modules affichent exclusivement "
    "un emojee de construction sans aucune fonctionnalite accessible.",
    caption_style
))

# ── 4.1 Dashboard Analysis ──
story.append(add_heading('4.1 Analyse du Tableau de Bord (seul module actif)', h2_style, level=1))

story.append(Paragraph(
    "Le Tableau de Bord est le seul module a presenter un contenu exploitable. "
    "Il affiche quatre indicateurs cles de performance (KPI) en haut de page : "
    "le nombre total de demandes (8), le nombre de postes pourvus (10), un "
    "taux de transformation (20.0%) et un delai moyen de recrutement (27 jours). "
    "Cependant, ces valeurs sont statiques et embrquees dans le code JavaScript. "
    "Aucun mecanisme de filtrage par date ou par departement n'est disponible, "
    "et le clic sur les KPI ne produit aucune action ni navigation.",
    body_style
))

story.append(Paragraph(
    "Quatre graphiques sont affiches sur le tableau de bord : un graphique "
    "d'evolution du recrutement (demandes creees vs pourvues sur 5 mois, d'octobre "
    "2024 a fevrier 2025), un diagramme de sources de recrutement (7 sources "
    "dont LinkedIn, reference interne, cabinet, site web, reseaux sociaux, "
    "candidature spontanee et ecoles/universites), un graphique de repartition "
    "par departement (7 departements sur les 19 definis dans l'Excel), et "
    "un diagramme des statuts de demandes (6 statuts : Brouillon, En attente, "
    "Validee, Publiee, Pourvue, Cloturee). Ces graphiques sont coherents "
    "avec les listes de reference de l'Excel, mais ils sont purement decoratifs "
    "et ne permettent aucune interaction (pas de zoom, pas de filtrage, "
    "pas d'export).",
    body_style
))

story.append(Paragraph(
    "Deux listes d'elements recents sont visibles : cinq demandes recentes "
    "(DR-2025-008 a DR-2025-002) et cinq candidats recents (CAN-005 a "
    "CAN-010). Les demandes affichent un identifiant, un titre de poste, un "
    "departement, un statut et une date, ce qui correspond aux champs "
    "attendus de l'onglet Excel. Les candidats affichent un nom, un "
    "identifiant, une source, un statut et un score (pour l'un d'eux). "
    "Toutefois, le clic sur ces elements ne produit aucune navigation vers "
    "une fiche detaillee, ce qui limite considerablement l'utilite du tableau "
    "de bord comme point d'entree operationnel.",
    body_style
))

# ── 4.2-4.4 Non-implemented modules ──
story.append(add_heading('4.2 Gestion des Offres et Previsions', h2_style, level=1))
story.append(Paragraph(
    "Les quatre modules de ce groupe (Demandes, Previsions Postes, Sources "
    "Recrutement, Analyse des Couts) sont tous en etat de construction "
    "avancee. L'onglet Excel 1-Demandes Recrutement definit des champs "
    "pour le titre du poste, la description, le profil recherche, le salaire, "
    "le type de contrat, la priorite, le departement et le statut. "
    "L'onglet 8-Prevision Postes Offres structure les previsions de "
    "recrutement par periode et par departement. L'onglet 9-Sources "
    "Recrutement detaille les canaux d'acquisition avec leurs metriques. "
    "L'onglet 10-Analyse Couts definit les couts par poste, par cabinet "
    "et par canal. Aucun de ces modules ne presente le moindre "
    "formulaire, tableau ou graphique sur le site.",
    body_style
))

story.append(add_heading('4.3 Gestion des Candidats et Processus', h2_style, level=1))
story.append(Paragraph(
    "Ce groupe comprend six modules critiques du processus de recrutement : "
    "Base Candidats, Pipeline Candidatures, Planning Entretiens, Grille "
    "Evaluation, Verification References et Selections. L'onglet Excel "
    "2-Base Candidats definit un profil candidat complet (donnees personnelles, "
    "formation, experience, competences). L'onglet 3-Planning Entretiens "
    "structure le calendrier des entretiens avec types (telephonique, "
    "visioconference, presentiel, 2eme tour, final) et resultats. La Grille "
    "Evaluation (onglet 4) definit des criteres d'evaluation notes. La "
    "Verification References (onglet 5) trace les elements verifies "
    "(diplome, experience, comportement, salaire, causes de depart). "
    "L'absence totale de ces modules rend impossible toute gestion "
    "concrete du recrutement.",
    body_style
))

story.append(add_heading('4.4 Integration, Suivi et Configuration', h2_style, level=1))
story.append(Paragraph(
    "Les treize modules restants couvrent l'integration des nouveaux "
    "employes (Checklist Integration, Plan Accueil Formation, Periode "
    "d'Essai, Suivi Post-Embauche), la gestion des cabinets et contrats, "
    "les stagiaires et saisonniers, ainsi que la configuration et l'audit. "
    "Le fichier Excel definit des workflows detailles pour chacun : 6 "
    "categories de checklist d'integration (documents administratifs, "
    "formation securite, formation metier, equipement et badge, "
    "presentation equipes, visite locaux), 5 decisions d'essai, 4 statuts "
    "d'integration, 4 niveaux de satisfaction, et 5 niveaux de risque de "
    "depart. Aucune de ces fonctionnalites n'est accessible sur le site. "
    "Les pages Parametres, Audit, Documents et Conformite sont egalement "
    "vides, ce qui signifie qu'il n'existe aucune interface pour configurer "
    "l'application, consulter les journaux d'audit, gerer les documents ni "
    "verifier la conformite reglementaire.",
    body_style
))

# ════════════════════════════════════════════
# CHAPITRE 5 - ANALYSE TECHNIQUE
# ════════════════════════════════════════════
story.append(add_heading('5. Analyse technique', h1_style, level=0))

story.append(add_heading('5.1 Architecture et stack technique', h2_style, level=1))
story.append(Paragraph(
    "L'application utilise React avec Vite comme bundler, Material UI (MUI) "
    "comme bibliotheque de composants, et Emotion pour le style CSS-in-JS. "
    "La police Inter (Google Fonts) est chargee avec les poids 300 a 800, "
    "ce qui est coherent avec un design system moderne. Le bundle principal "
    "de 536 Ko suggere l'utilisation de React Router ou d'un systeme de "
    "navigation client-side, mais l'analyse du code revele que le routeur "
    "est un systeme maison base sur des composants React stateful "
    "plutot que React Router officiel.",
    body_style
))

story.append(add_heading('5.2 Erreurs JavaScript identifiees', h2_style, level=1))
story.append(Paragraph(
    "La console du navigateur revele une erreur critique au chargement de "
    "la page : <b>ReferenceError: filteredDemandes is not defined</b>. Cette "
    "erreur se produit dans le fichier index-DrBeIkBb.js et indique qu'une "
    "variable utilisee dans le composant de page n'est pas correctement "
    "definie dans la portee du module. Cette erreur empeche le rendu "
    "correct des pages qui dependent de cette variable et suggere un "
    "probleme de refactoring incomplet ou de fusion de code defectueuse. "
    "L'erreur est reproductible a chaque navigation vers une page de "
    "contenu, confirmant qu'il ne s'agit pas d'un cas isole.",
    body_style
))

story.append(add_heading('5.3 Absence d\'infrastructure backend', h2_style, level=1))
story.append(Paragraph(
    "L'analyse du bundle JavaScript confirme l'absence totale d'appels "
    "reseau (fetch, axios, XMLHttpRequest). L'application ne communique "
    "avec aucun serveur, aucune API REST, aucune base de donnees. "
    "Les identifiants Cloudflare R2 fournis (jeton API, cle d'acces, "
    "endpoint S3) ne sont references nulle part dans le code frontend, "
    "ce qui signifie que l'integration de stockage de fichiers (CV, "
    "contrats, documents) n'est pas commencee. Le localStorage du "
    "navigateur est vide, confirmant qu'aucune persistance de donnees "
    "n'est implementee, meme cote client. En resume, l'application "
    "est un prototype purement statique sans aucune couche de donnees.",
    body_style
))

story.append(add_heading('5.4 Securite et authentification', h2_style, level=1))
story.append(Paragraph(
    "L'application est publiquement accessible sans aucune forme "
    "d'authentification. Aucun ecran de connexion, aucune verification "
    "d'identite, aucune gestion de sessions ou de jetons. Le menu "
    "utilisateur dans l'en-tete ne declenche aucune action visible. "
    "L'ensemble des donnees affichees (noms de candidats, postes, "
    "statuts de demande) est donc accessible a toute personne disposant "
    "de l'URL. Pour une application RH traitant des donnees "
    "personnelles, ce niveau de securite est incompatible avec les "
    "exigences de protection des donnees et de confidentialite, "
    "notamment dans le contexte reglementaire camerounais et de la "
    "convention OHADA relative a la protection des donnees.",
    body_style
))

# ════════════════════════════════════════════
# CHAPITRE 6 - SYNTHESE ET RECOMMANDATIONS
# ════════════════════════════════════════════
story.append(add_heading('6. Synthese et recommandations', h1_style, level=0))

story.append(add_heading('6.1 Niveau de maturite global', h2_style, level=1))
story.append(Paragraph(
    "Sur une echelle de maturite logicielle, Admina-RH se situe actuellement "
    "au stade de <b>prototype de maquette statique</b>. L'interface utilisateur "
    "et la navigation sont en place, le systeme de design (couleurs, "
    "typographie, composants MUI) est coherent et professionnel, mais "
    "l'application ne dispose d'aucune fonctionnalite metier operationnelle "
    "au-dela de l'affichage de donnees predefinies sur un tableau de bord. "
    "Le travail accompli represente environ 15 a 20% de l'effort total "
    "necessaire pour une version minimum viable (MVP) du produit.",
    body_style
))

# Maturity matrix
mat_headers = ['Critere', 'Niveau actuel', 'Niveau MVP requis', 'Ecart']
mat_rows = [
    ['Modules fonctionnels', '1/24 (4%)', '24/24 (100%)', status_cell('CRITIQUE')],
    ['Backend / API', '0%', '100%', status_cell('CRITIQUE')],
    ['Base de donnees', '0%', '100%', status_cell('CRITIQUE')],
    ['Authentification', '0%', '100%', status_cell('CRITIQUE')],
    ['Integration R2', '0%', '100%', status_cell('CRITIQUE')],
    ['Gestion des erreurs', 'Erreurs JS non corrigees', 'Zero erreur en production', status_cell('CRITIQUE')],
    ['UI / Navigation', '100%', '100%', status_cell('OPERATIONNEL')],
    ['Design system', '100%', '100%', status_cell('OPERATIONNEL')],
    ['Donnees de reference', 'Partiel (dashboard)', 'Complet (38 listes)', status_cell('AVERTISSEMENT')],
]
story.append(Spacer(1, 12))
story.append(make_table(mat_headers, mat_rows, [120, 115, 130, avail - 365]))
story.append(Paragraph(
    "Tableau 3 : Matrice de maturite. Deux criteres seulement atteignent le "
    "niveau requis : l'UI/Navigation et le design system. Les sept autres "
    "criteres presentent un ecart critique qui doit etre adresse avant "
    "toute mise en production.",
    caption_style
))

story.append(add_heading('6.2 Plan de remediation prioritaire', h2_style, level=1))
story.append(Paragraph(
    "Pour atteindre une version minimum viable (MVP) deployable, les "
    "actions suivantes sont recommandees par ordre de priorite "
    "decroissante. Chaque phase est estimee en effort relatif et "
    "represente un pre-requis pour les phases suivantes.",
    body_style
))

rec_headers = ['Priorite', 'Action', 'Detail']
rec_rows = [
    ['P0 - Critique', 'Corriger les erreurs JavaScript', 'Resoudre le ReferenceError filteredDemandes et tout autre erreur bloquant le rendu des pages'],
    ['P0 - Critique', 'Implementer le backend et la base de donnees', 'Choisir et configurer un backend (Cloudflare Workers, Supabase, ou autre) avec une base de donnees structuree conforme au modele Excel'],
    ['P0 - Critique', 'Ajouter l\'authentification', 'Implementer un systeme de connexion/mot de passe avec gestion des roles (admin, DRH, responsable)'],
    ['P1 - Eleve', 'Developper les modules metier cles', 'Implementer au minimum : Demandes, Base Candidats, Pipeline Candidatures, Planning Entretiens, et Suivi Contrats'],
    ['P1 - Eleve', 'Integration Cloudflare R2', 'Connecter le stockage R2 pour les CV, lettres de motivation, contrats et autres documents'],
    ['P2 - Moyen', 'Completer les modules restants', 'Developper les modules d\'integration, de suivi, de gestion des stagiaires et de configuration'],
    ['P2 - Moyen', 'Implementer l\'audit et la conformite', 'Ajouter les journaux d\'audit, la verification de conformite et la gestion documentaire'],
    ['P3 - Standard', 'Tests et securite', 'Ecrire des tests unitaires et d\'integration, effectuer un audit de securite, optimiser les performances'],
]
story.append(Spacer(1, 12))
story.append(make_table(rec_headers, rec_rows, [80, 150, avail - 230]))
story.append(Paragraph(
    "Tableau 4 : Plan de remediation par ordre de priorite. Les actions P0 "
    "sont des pre-requis bloquants pour toute mise en production.",
    caption_style
))

story.append(add_heading('6.3 Risques identifies', h2_style, level=1))
story.append(Paragraph(
    "Trois risques majeurs sont identifies a ce stade du developpement. "
    "Premierement, le <b>risque de non-conformite reglementaire</b> est "
    "eleve : l'absence d'authentification et de controle d'acces expose "
    "des donnees personnelles de candidats (noms, postes, sources) "
    "a tout visiteur, ce qui constitue une violation potentielle des "
    "reglementations sur la protection des donnees personnelles. "
    "Deuxiemement, le <b>risque technique d'architecture</b> est critique : "
    "l'absence de backend signifie qu'il n'y a pas de persistance des "
    "donnees, pas de gestion des droits, pas de validation metier. "
    "Troisiemement, le <b>risque de perception produit</b> est important : "
    "une application publique avec 23 pages en construction peut "
    "donner une image negative de la maturite du produit aupres des "
    "utilisateurs ou investisseurs qui visitent la demonstration.",
    body_style
))

# ── Build ──
doc.multiBuild(story)
print(f'Body PDF generated: {OUTPUT}')
