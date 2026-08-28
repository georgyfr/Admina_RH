"""Comprehensive frontend conformity analysis: Excel vs Website."""
import json

# Excel fields from the 18 data sheets
excel = {
    '1-Demandes Recrutement': [
        'N° Demande', 'Date Demande', 'Departement / Service', 'Poste Recherche',
        'Type de Poste', 'Type de Contrat', 'Effectif Demande', 'Motif du Recrutement',
        'Date Besoin', 'Priorite', 'Statut', 'Date Pourvue', 'Responsable Demande',
        'Role du Responsable', 'Cabinet / Agence Externe', 'Budget Salaire (FCFA)',
        'Cout Recrutement (FCFA)', 'Delai (jours)', 'Notes'
    ],
    '2-Base Candidats': [
        'N° Candidat', 'Civilite', 'Nom', 'Prenom', 'Genre',
        'Date de Naissance', 'Nationalite', 'Situation Familiale', 'Telephone', 'Email',
        'Adresse', 'Ville', 'Niveau Etude', 'Diplome', 'Etablissement',
        'Annees Exp.', 'Dernier Employeur', 'Competences Cles', 'Langues',
        'Niveau Langue', 'Outils/Logiciels', 'Poste Vise', 'Source Candidature',
        'Date Candidature', 'Statut', 'Score (/20)', 'Type Contrat',
        'Contrat Telechargeable', 'Date Debut Essai', 'Date Fin Essai',
        'Date Embauche Definitive', 'Certificat Travail', 'Attestation CNPS',
        'Extrait Casier Judiciaire', 'Notes'
    ],
    '3-Planning Entretiens': [
        'N° Entretien', 'Candidat', 'Poste Vise', 'Date Entretien', 'Heure',
        'Duree (min)', 'Type Entretien', 'Evaluateur(s)', 'Lieu / Salle / Lien',
        'Statut', 'Resultat', 'Score (/20)', 'Prochaine Etape',
        'Date Prochaine Etape', 'Notes'
    ],
    '4-Grille Evaluation': [
        'N° Evaluation', 'Candidat', 'Poste Vise', 'Date Evaluation', 'Evaluateur',
        'Experience / Competences (/5)', 'Motivation / Projet (/5)',
        'Adaptabilite / Culture (/5)', 'Presentation / Communication (/5)',
        'Technique / Metier (/5)', 'Total (/25)', 'Recommandation',
        'Salaire Souhaite (FCFA)', 'Salaire Propose (FCFA)', 'Decision Finale',
        'Notes', 'Source Candidature', 'Statut Candidat', 'Score Entretien (/20)'
    ],
    '5-Verification References': [
        'N° Verif.', 'Candidat', 'Poste Visé', 'Referent Contacte',
        'Entreprise Referent', 'Poste Referent', 'Tel Referent', 'Date Contact',
        'Verification Par', 'Elements Verifies', 'Resultat Global',
        'Details / Retour', 'Suites Donnees', 'Decision Finale', 'Date Decision'
    ],
    '6-Suivi Contrats': [
        'N° Contrat', 'Employe', 'Poste', 'Departement', 'Type Contrat',
        'Date Debut', 'Date Fin', 'Duree (mois)', 'Salaire Brut (FCFA)',
        'Statut Contrat', 'Date Renouvellement', 'Motif Fin', 'Responsable', 'Notes'
    ],
    '7-Gestion Cabinets': [
        'N° Cabinet', 'Cabinet / Agence', 'Specialite', 'Contact', 'Telephone',
        'Email', 'Ville', 'Nb Candidats Fournis', 'Nb Recrutements',
        'Taux Transformation (%)', 'Cout Total (FCFA)', 'Evaluation',
        'Contrat en Cours', 'Date Debut Contrat', 'Date Fin Contrat', 'Notes'
    ],
    '8-Prevision Postes Offres': [
        'N° Offre', 'Departement', 'Poste', 'Effectif Actuel', 'Effectif Prevu',
        'Ecart', 'Motif', 'Date Besoin', 'Priorite', 'Statut Offre',
        'Budget (FCFA)', 'Profil Recherche', 'Canal Diffusion', 'Date Publication',
        'Candidatures Recues', 'Notes'
    ],
    '9-Sources Recrutement': [
        'N°', 'Source', 'Nb Candidats', 'Nb Entretiens', 'Nb Recrutements',
        'Taux Transformation (%)', 'Cout (FCFA)', 'Cout par Recrutement (FCFA)',
        'Delai Moyen (jours)', 'Qualite Moyenne (/20)', 'Notes'
    ],
    '10-Analyse Couts': [
        'N°', 'Demande Liee', 'Poste', 'Cabinet Externe',
        'Cout Publication (FCFA)', 'Cout Cabinet (FCFA)', 'Cout Entretiens (FCFA)',
        'Cout Formation Integration (FCFA)', 'Cout Total (FCFA)',
        'Date', 'Departement', 'Notes'
    ],
    '11-Integration Employe': [
        'N°', 'Employe', 'Poste', 'Departement', 'Date Arrivee',
        'Manager Accueillant', 'Documents Admin', 'Formation Securite',
        'Formation Metier', 'Equipement & Badge', 'Visite Locaux',
        'Statut Integration', 'Date Fin Integration', 'Notes'
    ],
    '12-Checklist Integration': [
        'N°', 'Employe', 'Poste', 'Categorie', 'Etape / Tache',
        'Responsable', 'Date Prevue', 'Date Realisee', 'Statut',
        'Commentaires', 'Departement', 'Date Arrivee'
    ],
    '13-Periode Essai': [
        'N°', 'Employe', 'Poste', 'Departement', 'Type Contrat',
        'Date Debut Essai', 'Date Fin Essai', 'Duree (jours)', 'Evaluateur',
        'Objectifs Fixes', 'Score Mi-parcours (/20)', 'Score Final (/20)',
        'Decision', 'Date Decision', 'Notes'
    ],
    '14-Plan Accueil Formation': [
        'N°', 'Employe', 'Poste', 'Module Formation', 'Formateur',
        'Date Debut', 'Date Fin', 'Duree (heures)', 'Statut',
        'Evaluation (/20)', 'Notes', 'Departement', 'Date Arrivee'
    ],
    '15-Stagiaires': [
        'N°', 'Nom', 'Prenom', 'Etablissement', 'Formation',
        'Departement Accueil', 'Tuteur', 'Date Debut', 'Date Fin',
        'Duree (mois)', 'Indemnite (FCFA/mois)', 'Statut', 'Evaluation (/20)', 'Notes'
    ],
    '16-Saisonniers Temporaires': [
        'N°', 'Nom', 'Prenom', 'Poste', 'Departement',
        'Date Debut', 'Date Fin', 'Duree (jours)', 'Salaire Journalier (FCFA)',
        'Cout Total (FCFA)', 'Statut', 'Motif', 'Source', 'Notes'
    ],
    '17-Suivi Post-Embauche': [
        'N°', 'Employe', 'Poste', 'Departement', 'Date Embauche',
        'Anciennete (mois)', 'Eval 1 mois (/20)', 'Eval 3 mois (/20)',
        'Satisfaction Manager', 'Integration Equipe', 'Risque Depart', 'Commentaires'
    ],
    '18-Pipeline Candidatures': [
        'N° Pipeline', 'Candidat', 'Poste Vise', 'Departement', 'Source',
        'Date Candidature', 'Stade Actuel', 'Date Mouvement', 'Delai (jours)',
        'Evaluateur', 'Prochaine Action', 'Priorite', 'Notes'
    ],
}

# Fields CONFIRMED present on the website (from browser audit)
# Key = Excel sheet name, Value = list of Excel field names that ARE visible on the site
site = {
    '1-Demandes Recrutement': [
        'N° Demande', 'Date Demande', 'Departement / Service', 'Poste Recherche',
        'Type de Poste', 'Type de Contrat', 'Effectif Demande', 'Motif du Recrutement',
        'Date Besoin', 'Priorite', 'Statut'
    ],
    '2-Base Candidats': [
        'N° Candidat', 'Civilite', 'Nom', 'Prenom', 'Telephone', 'Email',
        'Poste Vise', 'Source Candidature', 'Date Candidature', 'Statut'
    ],
    '3-Planning Entretiens': [
        'N° Entretien', 'Candidat', 'Poste Vise', 'Date Entretien',
        'Duree (min)', 'Type Entretien', 'Evaluateur(s)', 'Lieu / Salle / Lien',
        'Statut', 'Resultat', 'Score (/20)'
    ],
    '4-Grille Evaluation': [
        'N° Evaluation', 'Candidat', 'Poste Vise', 'Date Evaluation', 'Evaluateur',
        'Experience / Competences (/5)', 'Motivation / Projet (/5)',
        'Adaptabilite / Culture (/5)', 'Presentation / Communication (/5)',
        'Technique / Metier (/5)', 'Total (/25)', 'Recommandation',
        'Salaire Souhaite (FCFA)', 'Salaire Propose (FCFA)',
        'Source Candidature', 'Statut Candidat'
    ],
    '5-Verification References': [
        'N° Verif.', 'Candidat', 'Poste Visé', 'Referent Contacte',
        'Entreprise Referent', 'Tel Referent', 'Date Contact', 'Verification Par'
    ],
    '6-Suivi Contrats': [
        'N° Contrat', 'Employe', 'Poste', 'Departement', 'Type Contrat',
        'Date Debut', 'Date Fin', 'Duree (mois)', 'Salaire Brut (FCFA)', 'Statut Contrat'
    ],
    '7-Gestion Cabinets': [
        'N° Cabinet', 'Cabinet / Agence', 'Specialite', 'Contact', 'Telephone',
        'Email', 'Ville', 'Nb Candidats Fournis', 'Nb Recrutements', 'Taux Transformation (%)'
    ],
    '8-Prevision Postes Offres': [
        'N° Offre', 'Departement', 'Poste', 'Effectif Actuel', 'Effectif Prevu',
        'Ecart', 'Motif', 'Date Besoin', 'Priorite', 'Statut Offre', 'Canal Diffusion'
    ],
    '9-Sources Recrutement': [
        'Source', 'Nb Candidats', 'Cout (FCFA)'
    ],
    '10-Analyse Couts': [
        'N°', 'Poste', 'Demande Liee', 'Date', 'Departement',
        'Cout Publication (FCFA)', 'Cout Cabinet (FCFA)', 'Cout Entretiens (FCFA)',
        'Cout Formation Integration (FCFA)', 'Cout Total (FCFA)'
    ],
    '11-Integration Employe': [
        'N°', 'Employe', 'Poste', 'Departement', 'Date Arrivee',
        'Manager Accueillant', 'Documents Admin', 'Formation Securite',
        'Formation Metier', 'Equipement & Badge'
    ],
    '12-Checklist Integration': [
        'N°', 'Employe', 'Poste', 'Categorie', 'Etape / Tache',
        'Responsable', 'Date Prevue', 'Date Realisee', 'Statut'
    ],
    '13-Periode Essai': [
        'N°', 'Employe', 'Poste', 'Departement', 'Type Contrat',
        'Date Debut Essai', 'Date Fin Essai', 'Duree (jours)', 'Evaluateur',
        'Objectifs Fixes', 'Score Mi-parcours (/20)', 'Decision'
    ],
    '14-Plan Accueil Formation': [
        'N°', 'Employe', 'Poste', 'Module Formation', 'Formateur',
        'Date Debut', 'Date Fin', 'Duree (heures)', 'Statut', 'Evaluation (/20)'
    ],
    '15-Stagiaires': [
        'N°', 'Nom', 'Prenom', 'Etablissement', 'Formation',
        'Departement Accueil', 'Tuteur', 'Date Debut', 'Date Fin', 'Duree (mois)', 'Statut'
    ],
    '16-Saisonniers Temporaires': [
        'N°', 'Nom', 'Prenom', 'Poste', 'Departement',
        'Date Debut', 'Date Fin', 'Duree (jours)', 'Statut',
        'Taux Horaire (FCFA)', 'Cout Total (FCFA)'
    ],
    '17-Suivi Post-Embauche': [
        'N°', 'Employe', 'Poste', 'Departement', 'Date Embauche',
        'Anciennete (mois)', 'Eval 1 mois (/20)', 'Eval 3 mois (/20)',
        'Eval 6 mois (/20)', 'Satisfaction Manager'
    ],
    '18-Pipeline Candidatures': [
        'N° Pipeline', 'Candidat', 'Poste Vise', 'Departement', 'Source',
        'Date Candidature', 'Stade Actuel', 'Delai (jours)',
        'Evaluateur', 'Prochaine Action', 'Priorite'
    ],
}

# ── Analysis ──
print('='*80)
print('CONFORMITE FRONTEND : Excel vs Site Admina-RH')
print('='*80)

total_excel = 0
total_present = 0
results = []

for sheet_name, excel_fields in excel.items():
    present = site.get(sheet_name, [])
    present_count = len(present)
    total = len(excel_fields)
    total_excel += total
    total_present += present_count
    missing = [f for f in excel_fields if f not in present]
    pct = (present_count / total * 100) if total > 0 else 0
    results.append((sheet_name, total, present_count, pct, missing))
    status = '✅' if pct == 100 else '⚠️' if pct >= 70 else '❌'
    print(f'\n{status} {sheet_name} ({total} champs)')
    print(f'   Presents : {present_count}/{total} = {pct:.1f}%')
    if missing:
        print(f'   Manquants ({len(missing)}): {missing}')

print(f'\n{"="*80}')
print(f'TOTAL : {total_present}/{total_excel} champs presents = {total_present/total_excel*100:.1f}%')
print(f'Champs manquants globaux : {total_excel - total_present}')
print(f'Feuilles Excel : {len(excel)}')
print(f'Feuilles a 100% : {sum(1 for r in results if r[3]==100)}/{len(results)}')

# Detail per sheet
print(f'\n{"="*80}')
print('DETAIL PAR FEUILLE')
print(f'{"="*80}')
for sheet, total, pres, pct, missing in results:
    bar_len = 30
    filled = int(bar_len * pct / 100)
    bar = '█' * filled + '░' * (bar_len - filled)
    print(f'{sheet:40s} [{bar}] {pct:5.1f}% ({pres}/{total})')
