#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genere les 2 livrables Phase 0 pour Admina_RH Domaine 2 :
  - regles_metier.json  (22 modules, 5-12 regles/module, total > 150)
  - workflows.json      (15 workflows avec steps + diagrammes Mermaid)

Sources :
  - PROMPT_DEV_Domaine2_Complet_V2.md (1669 lignes, spec V2)
  - /home/z/my-project/work-admina/app/src/pages/domaine2/data.js (nomenclatures)

Usage :
  python3 generate_phase0_json.py
"""

import json
import os
from pathlib import Path

# ============================================================
# LIVRABLE 1 : REGLES METIER
# ============================================================

V2 = "PROMPT_DEV_Domaine2_Complet_V2.md"
DATA = "work-admina/app/src/pages/domaine2/data.js"

def s(section, line=None):
    """Construit une reference source normalisee."""
    if line:
        return f"{V2} section {section} (l. {line})"
    return f"{V2} section {section}"


modules = []

# -------------------- MODULE 1 : EMPLOYES --------------------
modules.append({
    "name": "Employes",
    "description": "Feuille maitresse du Domaine 2, source unique de verite. 23 colonnes dont matricule (cle), identite, postes, salaires. Alimente tous les satellites via LEFT JOIN employee_id.",
    "regles": [
        {
            "id": "EMP-001",
            "title": "Unicite du matricule employe",
            "description": "Chaque employe possede un matricule unique saisi manuellement une seule fois a la creation. Ce matricule est la cle primaire et la cle de jointure vers tous les satellites.",
            "impact": "Champ matricule disabled apres creation ; message d'erreur si doublon detecte ; c'est la valeur utilisee dans tous les selecteurs d'employe.",
            "source": s("11.1 procedure creation fiche employe", 818),
            "validation": {
                "required": ["matricule"],
                "format": "regex ^EMP-[0-9]{3,4}$",
                "condition": "UNIQUE en BDD (constraint + index)"
            }
        },
        {
            "id": "EMP-002",
            "title": "Saisie obligatoire via listes deroulantes ref_lists",
            "description": "Les champs civilite, genre, situation_familiale, nationalite, departement, type_contrat, categorie, regime_travail, statut doivent etre saisis via les listes deroulantes alimentees par ref_lists (equivalent feuille _Lists).",
            "impact": "Tous les Select du formulaire employe sont alimentes par ref_lists ; pas de saisie libre ; garantit la coherence nomenclature.",
            "source": s("11.1 regles (Coherence)", 819),
            "validation": {
                "required": ["civilite", "genre", "nationalite", "departement", "type_contrat", "categorie", "regime_travail", "statut"],
                "valeurs": "Voir NOMENCLATURES dans data.js"
            }
        },
        {
            "id": "EMP-003",
            "title": "Calcul automatique de l'anciennete",
            "description": "L'anciennete en annees et mois est calculee automatiquement a partir de date_embauche via EXTRACT(YEAR FROM age(current_date, date_embauche)). Aucune saisie manuelle.",
            "impact": "Champ anciennete read-only affiche dans la liste employes et l'onglet Informations.",
            "source": s("13.7 formules anciennete", 1146),
            "validation": {
                "format": "computed SQL",
                "condition": "EXTRACT(YEAR FROM age(current_date, date_embauche))"
            }
        },
        {
            "id": "EMP-004",
            "title": "Propagation automatique aux feuilles satellites",
            "description": "Une fois l'employe cree, il est immediatement visible dans toutes les feuilles satellites via LEFT JOIN employees sur employee_id (equivalent VLOOKUP Excel). Aucune re-saisie du nom dans les satellites.",
            "impact": "Le selecteur d'employe (EmployeePicker) dans tous les ecrans satellites liste automatiquement les matricules existants ; le nom est recupere via JOIN.",
            "source": s("11.1 etape 7 propagation", 815),
            "validation": {
                "condition": "FK employee_id NOT NULL sur chaque table satellite"
            }
        },
        {
            "id": "EMP-005",
            "title": "Gate Phase 1 -> Phase 2 : completude obligatoire",
            "description": "Pour basculer de Phase 1 (Identification) a Phase 2 (Contractualisation), tous les champs obligatoires de la fiche employe doivent etre renseignes. Le bouton 'Creer contrat' reste desactive tant que la fiche est incomplete.",
            "impact": "Indicateur visuel de completude dans la liste employes ; bouton 'Creer contrat' grise si fiche incomplete.",
            "source": s("7 regles de basculement (Gates)", 262),
            "validation": {
                "required": ["matricule", "civilite", "nom", "prenom", "date_naissance", "genre", "nationalite", "telephone", "email", "department_id", "position_id", "type_contrat", "date_embauche", "salaire_brut", "statut"],
                "condition": "Tous required = true avant enable bouton contrat"
            }
        },
        {
            "id": "EMP-006",
            "title": "Format email RFC + unicite par tenant",
            "description": "Le champ email doit respecter le format RFC 5322 simplifie et etre unique par tenant_id.",
            "impact": "Validation regex cote formulaire + contrainte UNIQUE en BDD ; message d'erreur si doublon.",
            "source": s("8.1 table employees (col email)", 275),
            "validation": {
                "required": ["email"],
                "format": "regex ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                "condition": "UNIQUE par tenant_id"
            }
        },
        {
            "id": "EMP-007",
            "title": "Statut employe (4 valeurs) + alimentation KPI Taux d'actifs",
            "description": "Le statut ne prend que 4 valeurs : Actif, Inactif, Suspendu, Essai. Alimente le KPI Taux d'actifs (cible > 90%).",
            "impact": "Filtre 'statut' dans la liste employes + KPI dashboard ; badge couleur selon valeur.",
            "source": s("14.1 KPI Taux d'actifs", 1193),
            "validation": {
                "required": ["statut"],
                "valeurs": ["Actif", "Inactif", "Suspendu", "Essai"]
            }
        },
        {
            "id": "EMP-008",
            "title": "Photo employe optionnelle (formats et taille)",
            "description": "Le champ photo_url est optionnel. Formats acceptes : JPG, JPEG, PNG. Taille maximum 2 Mo.",
            "impact": "Avatar affiche dans la liste employes et l'onglet Informations ; upload avec controle MIME type + size.",
            "source": s("8.1 table employees (col photo_url)", 275),
            "validation": {
                "required": False,
                "format": "regex \\.(jpg|jpeg|png)$",
                "size_max": "2MB"
            }
        },
        {
            "id": "EMP-009",
            "title": "Salaire brut FCFA obligatoire + alimentation masse salariale",
            "description": "Le salaire_brut est obligatoire, entier strictement positif, en FCFA. Alimente le KPI Masse salariale brute du Tableau de Bord.",
            "impact": "Formatage MontantCell '1 234 567 FCFA' dans toutes les vues ; KPI SUM(salaire_brut) au Tableau de Bord.",
            "source": s("14.1 KPI Masse salariale brute", 1199),
            "validation": {
                "required": ["salaire_brut"],
                "type": "integer",
                "min": 0,
                "currency": "FCFA"
            }
        },
        {
            "id": "EMP-010",
            "title": "Recherche multi-criteres + 3 filtres",
            "description": "La liste employes offre une recherche plein texte (nom, prenom, matricule, email) + 3 filtres deroulants : Departement, Statut, Type Contrat. Pagination 20/page.",
            "impact": "Barre de recherche + 3 Select filtres en sticky top ; pagination serveur.",
            "source": s("10 ECRAN 2 Liste Employes", 467),
            "validation": {
                "condition": "LIKE on (nom || prenom || matricule || email) AND filters in (department_id, statut, type_contrat)"
            }
        }
    ]
})

# -------------------- MODULE 2 : CONTRATS --------------------
modules.append({
    "name": "Contrats",
    "description": "Gestion des contrats de travail (CDI/CDD/Stage/Interim/Apprentissage). Auto-calcul duree et jours restants + alerte expiration < 30j.",
    "regles": [
        {
            "id": "CTR-001",
            "title": "Numero de contrat unique",
            "description": "contract_number est unique (cle) et saisi manuellement ou auto-genere selon nomenclature entreprise.",
            "impact": "Champ obligatoire en creation ; message d'erreur si doublon.",
            "source": s("8.1 table d02_contracts", 276),
            "validation": {
                "required": ["contract_number"],
                "format": "regex ^CTR-[0-9]{4}$",
                "condition": "UNIQUE par tenant_id"
            }
        },
        {
            "id": "CTR-002",
            "title": "Types de contrat (5 valeurs)",
            "description": "type_contrat ∈ {CDI, CDD, Stage, Interim, Apprentissage}. Affiche en badge couleur different selon le type.",
            "impact": "Filtre type_contrat dans la liste ; badge dans la colonne Type Contrat.",
            "source": s("8.5 enums + nomenclatures data.js", 320),
            "validation": {
                "required": ["type_contrat"],
                "valeurs": ["CDI", "CDD", "Stage", "Interim", "Apprentissage"]
            }
        },
        {
            "id": "CTR-003",
            "title": "Calcul automatique duree en mois",
            "description": "duree_mois = (date_fin - date_debut) / 30, calculee automatiquement. Jamais de saisie manuelle.",
            "impact": "Colonne Duree (mois) read-only dans la table contrats.",
            "source": s("10 ECRAN 4 Contrats + 13.8", 507),
            "validation": {
                "format": "computed",
                "condition": "(date_fin - date_debut) / 30"
            }
        },
        {
            "id": "CTR-004",
            "title": "Calcul automatique jours restants",
            "description": "jours_restants = date_fin - current_date. Affiche avec badge couleur (>30j vert, 15-30j orange, <15j rouge).",
            "impact": "Colonne Jours restants read-only ; badge couleur JoursRestantsCell.",
            "source": s("13.8 formules jours restants", 1153),
            "validation": {
                "format": "computed",
                "condition": "date_fin - NOW()"
            }
        },
        {
            "id": "CTR-005",
            "title": "Auto-bascule statut a 'echu'",
            "description": "Le statut bascule automatiquement a 'echu' quand jours_restants < 0 (trigger trg_contracts_status).",
            "impact": "Statut mis a jour sans action manuelle ; alerte visuelle rouge dans la liste contrats.",
            "source": s("13.9 regles bascule + 17.6 trigger 1", 1165),
            "validation": {
                "condition": "IF jours_restants < 0 THEN statut = 'echu' (trigger BEFORE UPDATE)"
            }
        },
        {
            "id": "CTR-006",
            "title": "Alerte expiration < 30 jours + auto-rappel",
            "description": "Badge rouge si jours_restants ≤ 30. Declenche automatiquement un rappel dans d02_reminders (type renouvellement_contrat).",
            "impact": "Ligne en surbrillance orange/rouge dans la liste ; nouvelle entree dans Rappels Admin.",
            "source": s("13.10 generation rappels + 17.6 trigger 3", 1179),
            "validation": {
                "condition": "IF jours_restants ≤ 30 THEN badge rouge + INSERT d02_reminders (type=renouvellement_contrat)"
            }
        },
        {
            "id": "CTR-007",
            "title": "Resiliation possible (rupture anticipee)",
            "description": "Un contrat en vigueur peut passer a 'resilie' via action manuelle (rupture anticipee). Cette action est irreversible et tracee dans l'audit log.",
            "impact": "Bouton 'Resilier' dans le menu actions ; confirmation AlertDialog avant action irreversible.",
            "source": s("12.6 workflow contrats", 1054),
            "validation": {
                "condition": "statut precedent = 'en_vigueur' ; confirmation user obligatoire ; audit log entry"
            }
        },
        {
            "id": "CTR-008",
            "title": "Salaires, regime et lieu obligatoires",
            "description": "salaire_brut (FCFA, > 0), regime_travail et lieu_travail sont obligatoires a la creation du contrat.",
            "impact": "Validation formulaire ; valeurs regime_travail issues de ref_lists.",
            "source": s("8.1 table d02_contracts", 276),
            "validation": {
                "required": ["salaire_brut", "regime_travail", "lieu_travail"],
                "valeurs_regime": ["Temps plein", "Temps partiel", "25h/sem", "40h/sem"],
                "type_salaire": "integer > 0 FCFA"
            }
        }
    ]
})

# -------------------- MODULE 3 : AVENANTS --------------------
modules.append({
    "name": "Avenants",
    "description": "Modifications de contrat (salaire, poste, temps partiel, lieu, promotion). Historique complet pour audit et conformite regulatoire.",
    "regles": [
        {
            "id": "AVT-001",
            "title": "Lien FK obligatoire vers contrat existant",
            "description": "contract_id est obligatoire (FK vers d02_contracts). Impossible de creer un avenant sans contrat pre-existant.",
            "impact": "Selecteur de contrat obligatoire ; impossible de saisir un contract_id inexistant.",
            "source": s("8.1 table d02_contract_amendments + 9.6", 277),
            "validation": {
                "required": ["contract_id"],
                "condition": "FK contract_id NOT NULL, must exist in d02_contracts"
            }
        },
        {
            "id": "AVT-002",
            "title": "Numero d'avenant sequentiel par contrat",
            "description": "amendment_number est auto-incremente par contrat (1, 2, 3... pour le meme contract_id).",
            "impact": "Champ read-only calcule a la creation ; visible dans la colonne N Avenant.",
            "source": s("11.2 procedure contrats et avenants", 836),
            "validation": {
                "format": "computed",
                "condition": "MAX(amendment_number)+1 WHERE contract_id = X"
            }
        },
        {
            "id": "AVT-003",
            "title": "Types de modification (5 valeurs)",
            "description": "type_modification ∈ {Salaire, Poste, Temps partiel, Lieu travail, Promotion}. Determiner les champs impactes.",
            "impact": "Filtre type_modification dans la liste ; badge couleur different.",
            "source": s("8.1 + nomenclatures data.js type_avenant", 277),
            "validation": {
                "required": ["type_modification"],
                "valeurs": ["Salaire", "Poste", "Temps partiel", "Lieu travail", "Promotion"]
            }
        },
        {
            "id": "AVT-004",
            "title": "Tracabilite ancienne/nouvelle valeur + date effet future",
            "description": "ancienne_valeur et nouvelle_valeur sont obligatoires pour audit. motif obligatoire (min 10 caracteres). date_effet doit etre posterieure ou egale a aujourd'hui.",
            "impact": "Validation formulaire ; champs read-only pour l'audit ; date_effet via DatePicker avec min=today.",
            "source": s("11.2 champs avenant", 841),
            "validation": {
                "required": ["ancienne_valeur", "nouvelle_valeur", "motif", "date_effet"],
                "condition": "date_effet >= NOW()",
                "min_length_motif": 10
            }
        },
        {
            "id": "AVT-005",
            "title": "Historique complet (pas de hard delete)",
            "description": "Tout avenant est conserve a vie (jamais supprime) pour conformite regulatoire et audit. Seul le soft-delete est autorise.",
            "impact": "Pas de bouton 'Supprimer' dans la liste avenants ; action 'Archiver' a la place.",
            "source": s("10 ECRAN 5 tracabilite", 516),
            "validation": {
                "condition": "no hard delete allowed ; soft_delete only with audit log"
            }
        },
        {
            "id": "AVT-006",
            "title": "Propagation automatique vers la fiche employe",
            "description": "Un avenant de type Salaire met a jour employees.salaire_brut ; un avenant de type Poste met a jour employees.position_id ; un avenant Temps partiel met a jour employees.regime_travail.",
            "impact": "Apres validation DRH, la fiche employe est automatiquement mise a jour ; pas de re-saisie manuelle.",
            "source": s("11.2 procedure gestion contrats", 836),
            "validation": {
                "condition": "IF type=Salaire THEN UPDATE employees.salaire_brut ; IF type=Poste THEN UPDATE employees.position_id ; IF type=Temps partiel THEN UPDATE employees.regime_travail"
            }
        }
    ]
})

# -------------------- MODULE 4 : DOCUMENTS --------------------
modules.append({
    "name": "Documents",
    "description": "Suivi des documents employes (CNI, passeport, attestations, diplomes, RIB...). Alertes expiration automatiques + generation rappels.",
    "regles": [
        {
            "id": "DOC-001",
            "title": "Types de documents (10 valeurs)",
            "description": "type_document ∈ {CNI, Passeport, Attestation CNPS, Casier judiciaire, Certificat medical, Diplome, RIB bancaire, Photo identite, Certificat domicile, Contrat precedent}.",
            "impact": "Select dans le formulaire d'upload ; filtre dans la liste documents.",
            "source": s("8.1 table d02_employee_documents + nomenclatures data.js", 278),
            "validation": {
                "required": ["type_document"],
                "valeurs": ["CNI", "Passeport", "Attestation CNPS", "Casier judiciaire", "Certificat medical", "Diplome", "RIB bancaire", "Photo identite", "Certificat domicile", "Contrat precedent"]
            }
        },
        {
            "id": "DOC-002",
            "title": "Statuts document (3 valeurs) + bascule auto",
            "description": "statut ∈ {Valide, A renouveler, Expire}. Bascule automatique selon date_expiration via trigger update_document_status.",
            "impact": "Badge couleur dans la liste ; pas d'action manuelle necessaire pour la bascule.",
            "source": s("8.5 enum d02_document_status + 13.9", 321),
            "validation": {
                "valeurs": ["valide", "a_renouveler", "expire"]
            }
        },
        {
            "id": "DOC-003",
            "title": "Auto-bascule a 'a_renouveler' si jours ≤ 30",
            "description": "Trigger update_document_status bascule statut a 'a_renouveler' si jours_restants ≤ 30.",
            "impact": "Badge orange dans la liste documents ; ligne en surbrillance.",
            "source": s("13.9 regles bascule + 17.6 trigger 4", 1167),
            "validation": {
                "condition": "IF jours_restants ≤ 30 AND statut='valide' THEN 'a_renouveler' (trigger BEFORE UPDATE)"
            }
        },
        {
            "id": "DOC-004",
            "title": "Auto-bascule a 'expire' quand date depassee",
            "description": "Le statut bascule a 'expire' automatiquement quand date_expiration < NOW().",
            "impact": "Badge rouge critique dans la liste ; ligne en surbrillance rouge.",
            "source": s("13.9 regles bascule + 17.6 trigger 4", 1166),
            "validation": {
                "condition": "IF date_expiration < NOW() THEN statut = 'expire' (trigger BEFORE UPDATE)"
            }
        },
        {
            "id": "DOC-005",
            "title": "Auto-generation de rappel (trigger generate_document_reminder)",
            "description": "Trigger generate_document_reminder cree une entree dans d02_reminders (type expiration_document) quand jours_restants ≤ 15, depuis d02_employee_documents et d02_work_permits.",
            "impact": "Nouvelle ligne auto-creee dans Rappels Admin ; responsable_suivi notifie.",
            "source": s("13.10 + 17.6 trigger 3", 1177),
            "validation": {
                "condition": "IF jours_restants ≤ 15 THEN INSERT d02_reminders (type=expiration_document)"
            }
        },
        {
            "id": "DOC-006",
            "title": "Lieu de depot (4 valeurs)",
            "description": "lieu_depot ∈ {Dossier physique, Coffre fort, Archive numerique, Service RH}. Permet de localiser immediatement le document papier.",
            "impact": "Select dans le formulaire ; colonne Lieu Depot dans la liste.",
            "source": s("8.1 + nomenclatures data.js lieu_depot", 278),
            "validation": {
                "required": ["lieu_depot"],
                "valeurs": ["Dossier physique", "Coffre fort", "Archive numerique", "Service RH"]
            }
        },
        {
            "id": "DOC-007",
            "title": "Alerte visuelle couleur selon jours restants",
            "description": "Badge couleur dans la liste : vert (>30j), orange (15-30j), rouge (<15j). Pattern UX officiel du Domaine 2.",
            "impact": "Composant JoursRestantsCell avec couleur automatique selon le seuil.",
            "source": s("16.4 patterns UX alertes echeance", 1404),
            "validation": {
                "condition": "IF jours < 15 THEN rouge ; ELIF jours ≤ 30 THEN orange ; ELSE vert"
            }
        },
        {
            "id": "DOC-008",
            "title": "Sanctions Inspection du Travail si document expire",
            "description": "Un document expire non renouvele expose l'entreprise a des sanctions lors des controles de l'Inspection du Travail. Doit etre signale comme alerte critique.",
            "impact": "Statut 'expire' = alerte critique dans le Tableau de Bord et Rappels Admin.",
            "source": s("10 ECRAN 6 conformite", 523),
            "validation": {
                "condition": "statut = 'expire' declenche alerte critique + rappel priorite haute"
            }
        }
    ]
})

# -------------------- MODULE 5 : BANCAIRES --------------------
modules.append({
    "name": "Bancaires",
    "description": "Coordonnees bancaires (RIB) des employes. Donnees sensibles chiffrees au repos et masquees a l'affichage (RGPD).",
    "regles": [
        {
            "id": "BNK-001",
            "title": "Banque dans la liste agreee (8 valeurs)",
            "description": "banque ∈ {Afriland First Bank, BICEC, SGBC, UBA, Ecobank, BGFI, Standard Chartered, Banque Atlantique}. Liste des banques agreees Cameroun.",
            "impact": "Select dans le formulaire ; filtre banque dans la liste.",
            "source": s("8.1 table d02_bank_details + nomenclatures data.js", 279),
            "validation": {
                "required": ["banque"],
                "valeurs": ["Afriland First Bank", "BICEC", "SGBC", "UBA", "Ecobank", "BGFI", "Standard Chartered", "Banque Atlantique"]
            }
        },
        {
            "id": "BNK-002",
            "title": "RIB masque a l'affichage (securite)",
            "description": "Le RIB ne doit JAMAIS etre affiche en clair dans le DOM. Affichage masque avec format ****1234 (4 derniers digits visibles).",
            "impact": "Colonne RIB affichee masquee ; bouton 'Voir RIB' avec confirmation et audit log ; copie interdite par defaut.",
            "source": s("10 ECRAN 7 + 17.5 securite", 528),
            "validation": {
                "format": "mask",
                "condition": "Affichage ****1234 (4 derniers digits), full access requires admin role + audit log"
            }
        },
        {
            "id": "BNK-003",
            "title": "Chiffrement RIB au repos (RGPD)",
            "description": "Le RIB est chiffre en base (RGPD). Lecture uniquement via service dedie avec audit log obligatoire.",
            "impact": "Pas de RIB en clair dans les dumps ; colonne BDD chiffree AES-256.",
            "source": s("17.5 securite", 1449),
            "validation": {
                "condition": "encrypt(rib) at rest with AES-256 ; decrypt only via service layer + audit"
            }
        },
        {
            "id": "BNK-004",
            "title": "Un seul compte principal par employe",
            "description": "Un employe ne peut avoir qu'un seul RIB principal (is_principal=true). Si un nouveau RIB devient principal, les autres passent a is_principal=false.",
            "impact": "Toggle is_principal exclusif ; message d'alerte si user tente de definir un 2e principal.",
            "source": s("8.1 table d02_bank_details + 10 ECRAN 7", 279),
            "validation": {
                "condition": "UNIQUE PARTIAL INDEX WHERE is_principal=true AND employee_id=X ; trigger update siblings to false"
            }
        },
        {
            "id": "BNK-005",
            "title": "Statuts RIB (3 valeurs)",
            "description": "statut ∈ {Actif, Inactif, A verifier}. Seuls les RIB 'Actif' alimentent la paie.",
            "impact": "Filtre statut dans la liste ; badge couleur ; blocage paie si 'A verifier'.",
            "source": s("8.1 + nomenclatures data.js statut_rib", 279),
            "validation": {
                "valeurs": ["Actif", "Inactif", "A verifier"]
            }
        },
        {
            "id": "BNK-006",
            "title": "Agence obligatoire",
            "description": "agence est obligatoire (libelle). Permet la tracabilite en cas de virement echoue.",
            "impact": "Champ obligatoire dans le formulaire d'ajout RIB.",
            "source": s("8.1 table d02_bank_details", 279),
            "validation": {
                "required": ["agence"],
                "min_length": 3
            }
        }
    ]
})

# -------------------- MODULE 6 : MUTUELLE --------------------
modules.append({
    "name": "Mutuelle",
    "description": "Adhesions mutuelle / prevoyance. Calcul auto cotisation annuelle + integration paie si statut Active.",
    "regles": [
        {
            "id": "MUT-001",
            "title": "Organismes prevoyance (5 valeurs)",
            "description": "organisme ∈ {ACTIVA Assurances, SUNU Vie, Saham Assurance, AXA Cameroun, Beneficial Life}.",
            "impact": "Select dans le formulaire ; filtre organisme dans la liste.",
            "source": s("8.1 table d02_insurance_enrollments + data.js organisme_prevo", 280),
            "validation": {
                "required": ["organisme"],
                "valeurs": ["ACTIVA Assurances", "SUNU Vie", "Saham Assurance", "AXA Cameroun", "Beneficial Life"]
            }
        },
        {
            "id": "MUT-002",
            "title": "Couverture (4 valeurs)",
            "description": "couverture ∈ {Individuelle, Familiale, Conjoint, Enfants}. Determiner les personnes a charge.",
            "impact": "Select dans le formulaire ; badge dans la liste.",
            "source": s("8.1 + nomenclatures data.js couverture", 280),
            "validation": {
                "required": ["couverture"],
                "valeurs": ["Individuelle", "Familiale", "Conjoint", "Enfants"]
            }
        },
        {
            "id": "MUT-003",
            "title": "Calcul automatique cotisation annuelle",
            "description": "cotisation_annuelle = cotisation_mensuelle x 12, calculee automatiquement. Aucune saisie manuelle.",
            "impact": "Champ cotisation_annuelle read-only ; se met a jour si cotisation_mensuelle change.",
            "source": s("8.1 + 10 ECRAN 8", 532),
            "validation": {
                "format": "computed",
                "condition": "cotisation_annuelle = cotisation_mensuelle x 12"
            }
        },
        {
            "id": "MUT-004",
            "title": "Statut adhesion (3 valeurs) + blocage paie si resiliee",
            "description": "statut ∈ {Active, Suspendue, Resiliee}. Une adhesion resiliee ne peut plus alimenter la paie.",
            "impact": "Filtre statut dans la liste ; badge couleur ; blocage integration paie si non Active.",
            "source": s("8.1 + nomenclatures data.js statut_adhesion", 280),
            "validation": {
                "valeurs": ["Active", "Suspendue", "Resiliee"]
            }
        },
        {
            "id": "MUT-005",
            "title": "Personnes a charge (optionnel, max 10)",
            "description": "personnes_a_charge est une liste optionnelle (nom, lien de parente, date naissance). Maximum 10 personnes.",
            "impact": "Formulaire repeater avec bouton 'Ajouter personne' ; suppression individuelle possible.",
            "source": s("8.1 table d02_insurance_enrollments", 280),
            "validation": {
                "required": False,
                "max_items": 10,
                "condition": "IF couverture IN ['Familiale','Conjoint','Enfants'] THEN required min 1"
            }
        },
        {
            "id": "MUT-006",
            "title": "Integration paie : deduction mensuelle automatique",
            "description": "La cotisation mensuelle est deduite automatiquement du net_a_payer si statut='Active'.",
            "impact": "Ligne 'Mutuelle' dans le calcul de paie ; visible dans l'onglet Paie de l'employe.",
            "source": s("10 ECRAN 8 + 11.5 procedure paie", 532),
            "validation": {
                "condition": "IF statut='Active' THEN deduire cotisation_mensuelle dans d02_pay_slips"
            }
        }
    ]
})

# -------------------- MODULE 7 : PERMIS --------------------
modules.append({
    "name": "Permis",
    "description": "Autorisations et permis (permis travail, carte sejour, visa). Autorites emettrices MINTSS, DGSN, Ministere Interieur. Alertes auto.",
    "regles": [
        {
            "id": "PER-001",
            "title": "Types de permis (4 valeurs)",
            "description": "type_permit ∈ {Permis travail, Carte sejour, Visa long sejour, Titre de sejour}.",
            "impact": "Select dans le formulaire ; filtre type_permit dans la liste.",
            "source": s("8.1 table d02_work_permits + nomenclatures data.js", 283),
            "validation": {
                "required": ["type_permit"],
                "valeurs": ["Permis travail", "Carte sejour", "Visa long sejour", "Titre de sejour"]
            }
        },
        {
            "id": "PER-002",
            "title": "Autorites emettrices (4 valeurs)",
            "description": "autorite ∈ {MINTSS, DGSN, Ministere Interieur, Delegation Generale}. Permet de savoir a quel organisme adresser le renouvellement.",
            "impact": "Select dans le formulaire ; colonne Autorite dans la liste.",
            "source": s("8.1 + 11.6 procedure autorisations", 283),
            "validation": {
                "required": ["autorite"],
                "valeurs": ["MINTSS", "DGSN", "Ministere Interieur", "Delegation Generale"]
            }
        },
        {
            "id": "PER-003",
            "title": "Statuts permis (4 valeurs)",
            "description": "statut ∈ {Valide, A renouveler, En renouvellement, Expire}. Plus fin que le statut document (inclut le statut intermediaire 'En renouvellement').",
            "impact": "Filtre statut ; badge couleur ; permet le suivi d'un renouvellement en cours.",
            "source": s("8.5 enum d02_permit_status", 322),
            "validation": {
                "valeurs": ["Valide", "A renouveler", "En renouvellement", "Expire"]
            }
        },
        {
            "id": "PER-004",
            "title": "Calcul jours restants + alerte auto ≤ 30j",
            "description": "jours_restants = date_expiration - NOW(). Si ≤ 30 jours → statut 'A renouveler' + rappel auto cree (type expiration_document).",
            "impact": "Colonne Jours restants avec badge couleur ; nouvelle entree dans Rappels Admin.",
            "source": s("13.8 + 13.10", 1158),
            "validation": {
                "format": "computed",
                "condition": "IF jours_restants ≤ 30 THEN statut='A renouveler' + INSERT d02_reminders"
            }
        },
        {
            "id": "PER-005",
            "title": "Auto-bascule a 'Expire'",
            "description": "Le statut bascule automatiquement a 'Expire' quand date_expiration < NOW().",
            "impact": "Badge rouge critique ; alerte dans le Tableau de Bord.",
            "source": s("13.9 regles bascule", 1168),
            "validation": {
                "condition": "IF date_expiration < NOW() THEN statut = 'Expire' (trigger BEFORE UPDATE)"
            }
        },
        {
            "id": "PER-006",
            "title": "Numero de permis unique",
            "description": "permit_number et numero_permit sont uniques par tenant_id. Permet d'identifier sans ambiguute un permis.",
            "impact": "Validation unicite cote formulaire + contrainte BDD.",
            "source": s("8.1 table d02_work_permits", 283),
            "validation": {
                "required": ["permit_number", "numero_permit"],
                "condition": "UNIQUE par tenant_id"
            }
        }
    ]
})

# -------------------- MODULE 8 : CONGES ANNUELS --------------------
modules.append({
    "name": "Conges Annuels",
    "description": "Demandes de conges (8 types). Workflow approbation 2 niveaux (Manager + DRH si >5j ou sans solde). Auto-calc nombre de jours et MAJ solde.",
    "regles": [
        {
            "id": "CNG-001",
            "title": "Types de conge (8 valeurs)",
            "description": "type_conge ∈ {conge_annuel, conge_maladie, conge_maternite, conge_paternite, conge_marriage, conge_deuil, conge_sans_solde, conge_exceptionnel}.",
            "impact": "Select avec badge couleur different par type ; filtre type dans la liste.",
            "source": s("8.5 enum d02_leave_type", 313),
            "validation": {
                "required": ["type_conge"],
                "valeurs": ["conge_annuel", "conge_maladie", "conge_maternite", "conge_paternite", "conge_marriage", "conge_deuil", "conge_sans_solde", "conge_exceptionnel"]
            }
        },
        {
            "id": "CNG-002",
            "title": "Calcul automatique nombre de jours (exclut weekends et feries)",
            "description": "nombre_jours = (date_fin - date_debut) + 1 - jours_weekend - jours_feries, calcule automatiquement.",
            "impact": "Champ read-only mis a jour quand dates changent ; affichage 'X jours ouvres'.",
            "source": s("10 ECRAN 10 + 13.1 formules conges", 550),
            "validation": {
                "format": "computed",
                "condition": "(date_fin - date_debut) + 1 - weekends - jours_feries"
            }
        },
        {
            "id": "CNG-003",
            "title": "Statuts demande (4 valeurs)",
            "description": "statut ∈ {en_attente, approuvee, rejetee, annulee}. Couleurs : jaune, vert, rouge, gris.",
            "impact": "Badge couleur ; boutons approbation visibles selon le statut.",
            "source": s("8.5 enum d02_leave_request_status", 314),
            "validation": {
                "valeurs": ["en_attente", "approuvee", "rejetee", "annulee"]
            }
        },
        {
            "id": "CNG-004",
            "title": "Workflow approbation 2 niveaux (DRH si >5j ou sans solde)",
            "description": "Les conges > 5 jours OU de type conge_sans_solde necessitent une validation DRH niveau 2, apres validation Manager niveau 1.",
            "impact": "Bouton 'Approuver DRH' visible uniquement dans ces cas ; timeline workflow affichee.",
            "source": s("12.1 workflow conges + 10 ECRAN 10", 972),
            "validation": {
                "condition": "IF nombre_jours > 5 OR type_conge='conge_sans_solde' THEN niveau_2_required (DRH)"
            }
        },
        {
            "id": "CNG-005",
            "title": "Controle solde disponible (conge_annuel)",
            "description": "Une demande de conge_annuel ne peut pas depasser le solde_disponible de l'employe.",
            "impact": "Bouton 'Soumettre' desactive si nombre_jours > solde_disponible ; message d'avertissement.",
            "source": s("11.3 workflow conges + 13.1", 851),
            "validation": {
                "condition": "IF type='conge_annuel' AND nombre_jours > solde_disponible THEN block"
            }
        },
        {
            "id": "CNG-006",
            "title": "MAJ auto du solde a l'approbation (trigger update_leave_balance)",
            "description": "Trigger update_leave_balance decremente conges_pris_jours et incremente conges_en_cours (puis solde_disponible recalcule) quand statut passe a 'approuvee'.",
            "impact": "Solde de conges mis a jour automatiquement ; pas d'action manuelle.",
            "source": s("17.6 trigger 5 + 13.1", 1176),
            "validation": {
                "condition": "ON statut='approuvee' UPDATE d02_leave_balances (conges_pris_jours += nombre_jours)"
            }
        },
        {
            "id": "CNG-007",
            "title": "Integration paie si conge sans solde",
            "description": "Si type='conge_sans_solde', retenue automatique en paie (deduction proportionnelle au nombre de jours).",
            "impact": "Ligne 'Retenue conge sans solde' dans le calcul de paie du mois.",
            "source": s("11.3 + 13.4 formules paie", 852),
            "validation": {
                "condition": "IF type='conge_sans_solde' THEN deduire en paie proportionnellement"
            }
        },
        {
            "id": "CNG-008",
            "title": "Motif obligatoire (min 10 caracteres)",
            "description": "Le champ motif (textarea) est obligatoire pour toute demande de conge. Minimum 10 caracteres.",
            "impact": "Validation cote formulaire ; message d'erreur si motif trop court.",
            "source": s("10 ECRAN 10 formulaire demande", 551),
            "validation": {
                "required": ["motif"],
                "min_length": 10
            }
        }
    ]
})

# -------------------- MODULE 9 : SOLDES CONGES --------------------
modules.append({
    "name": "Soldes Conges",
    "description": "Soldes de conges par employe et par annee. Auto-calc depuis les demandes approuvees. Transposition des 218 VLOOKUP + 648 COUNTIF Excel.",
    "regles": [
        {
            "id": "SLD-001",
            "title": "Calcul solde_disponible",
            "description": "solde_disponible = droit_annuel_jours + report_n1_jours - conges_pris_jours - conges_en_cours, calcule automatiquement.",
            "impact": "Colonne Solde Disponible read-only ; barre de progression couleur.",
            "source": s("13.1 formules conges + 10 ECRAN 11", 1102),
            "validation": {
                "format": "computed",
                "condition": "droit_annuel_jours + report_n1_jours - conges_pris_jours - conges_en_cours"
            }
        },
        {
            "id": "SLD-002",
            "title": "Calcul taux_utilisation",
            "description": "taux_utilisation = (conges_pris_jours / droit_annuel_jours) x 100, en pourcentage.",
            "impact": "Colonne Taux Utilisation avec valeur + barre.",
            "source": s("13.1 + 10 ECRAN 11", 1103),
            "validation": {
                "format": "computed percent",
                "condition": "(conges_pris_jours / droit_annuel_jours) x 100"
            }
        },
        {
            "id": "SLD-003",
            "title": "conges_pris_jours auto-calc depuis demandes approuvees",
            "description": "conges_pris_jours = SUM(nombre_jours) FROM d02_leave_requests WHERE type='conge_annuel' AND statut='approuvee' AND year(date_debut) = annee.",
            "impact": "Colonne Conges Pris read-only ; recalculee en temps reel via trigger.",
            "source": s("10 ECRAN 11 logique de calcul + 13.1", 573),
            "validation": {
                "format": "computed SQL aggregate",
                "condition": "SUM(nombre_jours) WHERE type='conge_annuel' AND statut='approuvee' AND year=annee"
            }
        },
        {
            "id": "SLD-004",
            "title": "Selecteur d'annee obligatoire",
            "description": "L'ecran soldes affiche les donnees par annee. Selecteur d'annee en haut, defaut = annee courante.",
            "impact": "Select annee sticky top ; changement d'annee recharge les donnees.",
            "source": s("10 ECRAN 11", 564),
            "validation": {
                "required": ["annee"],
                "format": "YYYY",
                "condition": "default = current year"
            }
        },
        {
            "id": "SLD-005",
            "title": "Barre de progression couleur selon seuils",
            "description": "Barre de progression du solde disponible : verte si > 25% du droit annuel, rouge si < 5 jours.",
            "impact": "Composant ProgressCell avec couleur automatique.",
            "source": s("10 ECRAN 11 colonnes", 563),
            "validation": {
                "condition": "IF solde_disponible < 5 THEN rouge ; ELIF solde_disponible / droit_annuel > 0.25 THEN vert ; ELSE orange"
            }
        },
        {
            "id": "SLD-006",
            "title": "Precision ecart = 0 (KPI Processus 3)",
            "description": "L'ecart entre le compteur (solde_disponible) et le reel (somme des conges pris approuves) doit etre strictement nul. KPI Processus 3 ISO.",
            "impact": "Alerte critique si ecart detecte ; audit mensuel automatique.",
            "source": s("14.3 KPI Processus 3 - conges & absences", 1230),
            "validation": {
                "condition": "ecart = 0 obligatoire ; si ecart != 0 THEN non-conformite"
            }
        }
    ]
})

# -------------------- MODULE 10 : ABSENCES --------------------
modules.append({
    "name": "Absences",
    "description": "Absences maladie, accident travail, maternite, hospitalisation, quarantaine. Upload justificatif + visite medicale reprise auto si >3 semaines.",
    "regles": [
        {
            "id": "ABS-001",
            "title": "Types d'absence (8 valeurs)",
            "description": "type_absence ∈ {maladie, accident_travail, hospitalisation, quarantaine, conge_maternite, conge_paternite, absence_autorisee, absence_non_justifiee}.",
            "impact": "Select dans le formulaire ; filtre type dans la liste ; badge couleur.",
            "source": s("8.5 enum d02_absence_type", 315),
            "validation": {
                "required": ["type_absence"],
                "valeurs": ["maladie", "accident_travail", "hospitalisation", "quarantaine", "conge_maternite", "conge_paternite", "absence_autorisee", "absence_non_justifiee"]
            }
        },
        {
            "id": "ABS-002",
            "title": "Calcul duree en jours",
            "description": "duree_jours = (date_fin - date_debut) + 1, calculee automatiquement.",
            "impact": "Champ read-only ; affichage dans la liste absences.",
            "source": s("10 ECRAN 12 + 8.2", 580),
            "validation": {
                "format": "computed",
                "condition": "(date_fin - date_debut) + 1"
            }
        },
        {
            "id": "ABS-003",
            "title": "Upload justificatif PDF (5 Mo max)",
            "description": "justificatif_url est obligatoire pour les absences maladie et hospitalisation. Format PDF, max 5 Mo.",
            "impact": "Champ upload avec controle MIME type + size ; bouton de visualisation PDF.",
            "source": s("10 ECRAN 12 + 11.3 workflow absences", 582),
            "validation": {
                "format": "regex \\.pdf$",
                "size_max": "5MB",
                "condition": "required IF type_absence IN [maladie, hospitalisation]"
            }
        },
        {
            "id": "ABS-004",
            "title": "Statuts absence (4 valeurs)",
            "description": "statut ∈ {en_attente, justifiee, non_justifiee, rejetee}.",
            "impact": "Filtre statut ; badge couleur ; boutons validation visibles selon statut.",
            "source": s("8.5 enum d02_absence_status", 316),
            "validation": {
                "valeurs": ["en_attente", "justifiee", "non_justifiee", "rejetee"]
            }
        },
        {
            "id": "ABS-005",
            "title": "Validation manager obligatoire (delai 5 jours ouvres)",
            "description": "Le manager valide (justifiee ou non_justifiee). Aucune absence ne peut rester en_attente plus de 5 jours ouvres (KPI Processus 3).",
            "impact": "Alerte au Tableau de Bord si absence en_attente depasse 5j ; relance auto manager.",
            "source": s("11.3 + 14.3 Processus 3", 857),
            "validation": {
                "condition": "IF statut='en_attente' AND age > 5 jours ouvres THEN alerte + relance auto"
            }
        },
        {
            "id": "ABS-006",
            "title": "Visite medicale de reprise auto si duree > 3 semaines",
            "description": "Si duree_jours > 21 (3 semaines), auto-creation d'une visite de reprise dans d02_medical_visits. Egalement declenchee pour accident_travail et conge_maternite.",
            "impact": "Nouvelle ligne auto-cree dans Visites Medicales (type='reprise') ; notification au manager et a l'employe.",
            "source": s("11.3 etape 4 + 10 ECRAN 20", 858),
            "validation": {
                "condition": "IF duree_jours > 21 OR type IN [accident_travail, conge_maternite] THEN INSERT d02_medical_visits (type='reprise')"
            }
        },
        {
            "id": "ABS-007",
            "title": "Integration paie : maintien ou retenue",
            "description": "Selon le type et le statut : maintien de salaire (maladie justifiee, conge maternite) ou retenue (non justifiee). Integre automatiquement en paie.",
            "impact": "Ligne 'Maintien salaire' ou 'Retenue absence' dans le calcul de paie du mois.",
            "source": s("11.3 + 13.4 formules paie", 859),
            "validation": {
                "condition": "IF statut='justifiee' THEN maintien ; ELIF statut='non_justifiee' THEN retenue ; ELSE en_attente (pas en paie)"
            }
        }
    ]
})

# -------------------- MODULE 11 : HEURES SUPP --------------------
modules.append({
    "name": "Heures Supp",
    "description": "Heures supplementaires hebdomadaires. Validation manager OBLIGATOIRE avant integration paie. 3 taux de majoration (100/125/150%).",
    "regles": [
        {
            "id": "HSU-001",
            "title": "Declaration hebdomadaire (semaine ISO)",
            "description": "Saisie par semaine ISO. heures_normales et heures_supp obligatoires.",
            "impact": "Selecteur de semaine ISO ; un enregistrement = 1 employe x 1 semaine.",
            "source": s("10 ECRAN 13 + 11.4 procedure pointage", 591),
            "validation": {
                "required": ["semaine", "heures_normales", "heures_supp"],
                "format": "semaine ISO YYYY-Www"
            }
        },
        {
            "id": "HSU-002",
            "title": "Taux de majoration (3 valeurs)",
            "description": "taux_majoration ∈ {100% (simple), 125% (nuit/weekend), 150% (jour ferie)}.",
            "impact": "Select dans le formulaire ; badge selon le taux.",
            "source": s("10 ECRAN 13 + 13.3 + 8.5", 596),
            "validation": {
                "required": ["taux_majoration"],
                "valeurs": ["100%", "125%", "150%"]
            }
        },
        {
            "id": "HSU-003",
            "title": "Calcul salaire_horaire_base (base 40h/sem)",
            "description": "salaire_horaire_base = salaire_brut_mensuel / 173.33 (base 40h/sem x 4.33 semaines).",
            "impact": "Valeur intermediaire read-only utilisee pour les calculs HS.",
            "source": s("13.3 formules heures supp", 1115),
            "validation": {
                "format": "computed",
                "condition": "salaire_brut_mensuel / 173.33"
            }
        },
        {
            "id": "HSU-004",
            "title": "Calcul montant_brut",
            "description": "montant_brut = heures_supp x salaire_horaire_base.",
            "impact": "Colonne Montant Brut read-only ; format FCFA.",
            "source": s("13.3", 1116),
            "validation": {
                "format": "computed",
                "condition": "heures_supp x salaire_horaire_base"
            }
        },
        {
            "id": "HSU-005",
            "title": "Calcul montant_calcule (avec majoration)",
            "description": "montant_calcule = montant_brut x (1 + taux_majoration/100).",
            "impact": "Colonne Montant Calcule read-only ; format FCFA ; valeur utilisee en paie.",
            "source": s("13.3", 1117),
            "validation": {
                "format": "computed",
                "condition": "montant_brut x (1 + taux_majoration/100)"
            }
        },
        {
            "id": "HSU-006",
            "title": "Validation manager OBLIGATOIRE",
            "description": "Les HS doivent etre validees par le responsable hierarchique avant toute integration paie. Statut : en_attente → validee/rejetee.",
            "impact": "Boutons 'Valider' / 'Rejeter' visibles par le manager ; timeline workflow.",
            "source": s("11.4 regle imperative + 12.2", 878),
            "validation": {
                "valeurs": ["en_attente", "validee", "rejetee", "payee"],
                "condition": "transitions en_attente -> validee|rejetee requires role manager"
            }
        },
        {
            "id": "HSU-007",
            "title": "Seules les HS 'validees' vont en paie",
            "description": "Une HS non validee NE PEUT PAS etre integree en paie (rejetee = ignoree, en_attente = bloquee).",
            "impact": "Filtre automatique dans la generation de paie : WHERE statut='validee'.",
            "source": s("11.4 + 12.2", 879),
            "validation": {
                "condition": "paie_integration requires statut='validee' ; en_attente and rejetee are excluded"
            }
        },
        {
            "id": "HSU-008",
            "title": "Passage a 'payee' apres integration paie",
            "description": "Le statut passe automatiquement a 'payee' apres integration dans la fiche de paie. Aucune HS payee ne peut etre modifiee.",
            "impact": "Champ statut verrouille apres 'payee' ; bouton 'Modifier' masque.",
            "source": s("12.2 + 13.3", 608),
            "validation": {
                "condition": "AFTER paie_generation THEN statut='payee' ; locked for modification"
            }
        }
    ]
})

# -------------------- MODULE 12 : POINTAGE --------------------
modules.append({
    "name": "Pointage",
    "description": "Pointage hebdomadaire de presence. Auto-calc taux_presence + validation manager + alimentation planning et paie.",
    "regles": [
        {
            "id": "PNT-001",
            "title": "Saisie quotidienne (badgeage auto ou manuel)",
            "description": "Saisie quotidienne par badgeage (auto ou manuel). Un enregistrement = 1 employe x 1 semaine.",
            "impact": "Interface de saisie rapide ; bouton 'Badgeage auto' possible via integration hardware.",
            "source": s("10 ECRAN 14 + 11.4 workflow pointage", 616),
            "validation": {
                "required": ["employee_id", "semaine"],
                "format": "semaine ISO YYYY-Www"
            }
        },
        {
            "id": "PNT-002",
            "title": "Calcul taux_presence",
            "description": "taux_presence = (jours_presents / jours_ouvrables) x 100, calcule automatiquement.",
            "impact": "Colonne Taux Presence avec barre de progression.",
            "source": s("13.2 formules presence + 10 ECRAN 14", 1108),
            "validation": {
                "format": "computed percent",
                "condition": "(jours_presents / jours_ouvrables) x 100"
            }
        },
        {
            "id": "PNT-003",
            "title": "Calcul jours_ouvrables",
            "description": "jours_ouvrables = jours_dans_mois - jours_weekend - jours_feries. Utilise pour tous les calculs de presence.",
            "impact": "Valeur intermediaire read-only ; base du taux de presence.",
            "source": s("13.2", 1109),
            "validation": {
                "format": "computed",
                "condition": "jours_dans_mois - jours_weekend - jours_feries"
            }
        },
        {
            "id": "PNT-004",
            "title": "Calcul retard_total_minutes",
            "description": "retard_total_minutes = somme des retards journaliers de la semaine.",
            "impact": "Colonne Retards (min) ; aggregé hebdomadaire.",
            "source": s("13.2", 1110),
            "validation": {
                "format": "computed",
                "condition": "SUM(retards_journaliers) pour la semaine"
            }
        },
        {
            "id": "PNT-005",
            "title": "Validation hebdomadaire manager",
            "description": "Validation par le manager en fin de semaine. Statut : brouillon → valide/rejete.",
            "impact": "Boutons 'Valider' / 'Rejeter' visibles par le manager ; verrouillage apres validation.",
            "source": s("11.4 + 8.5 enum d02_attendance_status", 870),
            "validation": {
                "valeurs": ["brouillon", "valide", "rejete"],
                "condition": "transitions require role manager"
            }
        },
        {
            "id": "PNT-006",
            "title": "Taux presence cible > 95% (KPI Obj. 4)",
            "description": "Le KPI Objectif 4 exige un taux de presence mensuel > 95%. Alerte au Tableau de Bord si < 95%.",
            "impact": "KPI cible au Tableau de Bord ; alerte si seuil non respecte.",
            "source": s("3 Objectif 4 + 14.1", 78),
            "validation": {
                "condition": "IF taux_presence < 95% THEN alerte critique Tableau de Bord"
            }
        }
    ]
})

# -------------------- MODULE 13 : PLANNING --------------------
modules.append({
    "name": "Planning",
    "description": "Planning mensuel par employe. Generation auto depuis pointage + cloture mensuelle irreversible (gate Phase 3 -> Phase 4).",
    "regles": [
        {
            "id": "PLN-001",
            "title": "Generation auto depuis Pointage",
            "description": "Le planning mensuel est genere automatiquement par agregation des pointages hebdomadaires de chaque employe.",
            "impact": "Bouton 'Generer planning mensuel' ; aucun champ a saisir manuellement.",
            "source": s("10 ECRAN 15 + 11.4 workflow pointage", 630),
            "validation": {
                "format": "computed aggregate",
                "condition": "SUM pointages hebdo WHERE mois = X GROUP BY employee_id"
            }
        },
        {
            "id": "PLN-002",
            "title": "Statuts planning (3 valeurs)",
            "description": "statut ∈ {brouillon, valide, cloture}. Cloture = plus de modification possible, alimente la paie.",
            "impact": "Badge couleur ; bouton 'Cloturer' visible uniquement pour manager/DRH.",
            "source": s("8.5 enum d02_planning_status", 319),
            "validation": {
                "valeurs": ["brouillon", "valide", "cloture"]
            }
        },
        {
            "id": "PLN-003",
            "title": "Vue calendar couleur (5 statuts)",
            "description": "Vue calendrier : vert=present, rouge=absent, orange=retard, bleu=conge, violet=mission.",
            "impact": "Toggle entre vue calendar et vue table ; legende couleurs affichee.",
            "source": s("10 ECRAN 15", 627),
            "validation": {
                "condition": "color mapping : present=vert, absent=rouge, retard=orange, conge=bleu, mission=violet"
            }
        },
        {
            "id": "PLN-004",
            "title": "Cloture mensuelle irreversible (gate Phase 3 -> Phase 4)",
            "description": "Une fois le planning cloture, plus aucune modification possible. Gate de basculement Phase 3 -> Phase 4 (paie).",
            "impact": "Bouton 'Cloturer' avec confirmation AlertDialog ; boutons edit masques apres cloture.",
            "source": s("7 regles de basculement + 10 ECRAN 15", 264),
            "validation": {
                "condition": "IF statut='cloture' THEN readonly ; gate Phase 3 -> Phase 4 unlocked"
            }
        },
        {
            "id": "PLN-005",
            "title": "Validation manager < 48h avant periode (KPI Processus 2)",
            "description": "Le planning doit etre valide au moins 48h avant la periode concernee (KPI Processus 2 ISO).",
            "impact": "Alerte si planning non valide a J-2 ; relance auto manager.",
            "source": s("14.3 KPI Processus 2 - Quotidien", 1226),
            "validation": {
                "condition": "validation_date < period_start - 48h ; IF NOT THEN alerte"
            }
        }
    ]
})

# -------------------- MODULE 14 : PAIE --------------------
modules.append({
    "name": "Paie",
    "description": "Generation des fiches de paie mensuelles. Integration auto (pointage + conges + HS validees + prets). Validation DRH + paiement.",
    "regles": [
        {
            "id": "PAI-001",
            "title": "Calcul salaire_brut",
            "description": "salaire_brut = salaire_base + heures_supp_montant_calcule + primes - retenues_absences.",
            "impact": "Champ calcule read-only dans la fiche de paie ; detail ligne par ligne visible.",
            "source": s("13.4 formules paie", 1123),
            "validation": {
                "format": "computed",
                "condition": "salaire_base + heures_supp_montant_calcule + primes - retenues_absences"
            }
        },
        {
            "id": "PAI-002",
            "title": "Calcul cotisations",
            "description": "cotisations = salaire_brut x taux_charges (taux en vigueur CNPS).",
            "impact": "Champ calcule ; detail par organisme (CNPS, CNP, impots) visible.",
            "source": s("13.4", 1124),
            "validation": {
                "format": "computed",
                "condition": "salaire_brut x taux_charges"
            }
        },
        {
            "id": "PAI-003",
            "title": "Calcul net_a_payer",
            "description": "net_a_payer = salaire_brut - cotisations - deductions_prets - autres_retenues.",
            "impact": "Champ mis en avant ; format FCFA.",
            "source": s("13.4", 1125),
            "validation": {
                "format": "computed",
                "condition": "salaire_brut - cotisations - deductions_prets - autres_retenues"
            }
        },
        {
            "id": "PAI-004",
            "title": "Statuts paie (3 valeurs)",
            "description": "statut ∈ {generee, validee, payee}. Cycle : generee → validee (DRH) → payee (paiement).",
            "impact": "Badge couleur ; boutons 'Valider' et 'Marquer payee' visibles selon le statut.",
            "source": s("8.5 enum d02_pay_status + 11.5", 333),
            "validation": {
                "valeurs": ["generee", "validee", "payee"]
            }
        },
        {
            "id": "PAI-005",
            "title": "Validation DRH obligatoire avant paiement",
            "description": "Toute fiche de paie doit etre validee par la DRH (statut 'validee') avant tout paiement (statut 'payee').",
            "impact": "Bouton 'Marquer payee' desactive tant que statut != 'validee'.",
            "source": s("11.5 etape 5 + 5.2 matrice RACI", 891),
            "validation": {
                "condition": "statut='validee' required before 'payee' ; validator_id + validation_date required"
            }
        },
        {
            "id": "PAI-006",
            "title": "Modes de paiement (3 valeurs) + date_paiement obligatoire",
            "description": "mode_paie ∈ {Virement, Cheque, Especes}. date_paiement obligatoire quand statut='payee'.",
            "impact": "Select mode_paie ; DatePicker date_paiement requis quand payee.",
            "source": s("8.1 + nomenclatures data.js mode_paie", 281),
            "validation": {
                "valeurs": ["Virement", "Cheque", "Especes"],
                "condition": "date_paiement required IF statut='payee'"
            }
        },
        {
            "id": "PAI-007",
            "title": "Ponctualite paie : 100% generees avant le 5 (KPI Obj. 3)",
            "description": "100% des fiches de paie doivent etre generees avant le 5 du mois suivant (KPI Objectif 3).",
            "impact": "Alerte au Tableau de Bord si generation en retard ; KPI mesure mensuellement.",
            "source": s("3 Objectif 3 + 10 ECRAN 16", 76),
            "validation": {
                "condition": "generation_date <= 5th of next month ; IF > 5 THEN alerte critique"
            }
        },
        {
            "id": "PAI-008",
            "title": "Integration HS validees + prets en_remboursement",
            "description": "Seules les HS 'validees' sont integrees. Les mensualites de prets 'en_remboursement' sont deduites automatiquement.",
            "impact": "Filtre SQL automatique lors de la generation ; ligne 'HS' et 'Retenue pret' dans le detail paie.",
            "source": s("11.5 etape 1 + 11.7", 887),
            "validation": {
                "condition": "HS.statut='validee' AND prets.statut='en_remboursement' inclus dans calcul"
            }
        }
    ]
})

# -------------------- MODULE 15 : DECLARATIONS SOCIALES --------------------
modules.append({
    "name": "Declarations Sociales",
    "description": "Declarations CNPS, CNP, Direction des Impots, DGI, MINTSS. Alertes retard + KPI Obj. 5 (0 en retard).",
    "regles": [
        {
            "id": "DCL-001",
            "title": "Organismes (5 valeurs)",
            "description": "organisme ∈ {CNPS, CNP, Direction des Impots, DGI, MINTSS}. CNPS = Caisse Nationale de Prevoyance Sociale.",
            "impact": "Select dans le formulaire ; filtre organisme dans la liste.",
            "source": s("8.1 table d02_social_declarations + 11.5 + nomenclatures data.js", 282),
            "validation": {
                "required": ["organisme"],
                "valeurs": ["CNPS", "CNP", "Direction des Impots", "DGI", "MINTSS"]
            }
        },
        {
            "id": "DCL-002",
            "title": "Types de declaration (3 valeurs)",
            "description": "type_declaration ∈ {Mensuelle, Trimestrielle, Annuelle}.",
            "impact": "Select dans le formulaire ; filtre type dans la liste.",
            "source": s("8.5 enum d02_declaration_type", 329),
            "validation": {
                "required": ["type_declaration"],
                "valeurs": ["Mensuelle", "Trimestrielle", "Annuelle"]
            }
        },
        {
            "id": "DCL-003",
            "title": "Statuts declaration (3 valeurs)",
            "description": "statut ∈ {soumise, en_retard, validee}. Cycle : soumise → validee (apres reception organisme).",
            "impact": "Badge couleur ; badge rouge si en_retard.",
            "source": s("8.5 enum d02_declaration_status", 330),
            "validation": {
                "valeurs": ["soumise", "en_retard", "validee"]
            }
        },
        {
            "id": "DCL-004",
            "title": "Auto-bascule a 'en_retard' (cron quotidien)",
            "description": "Si date_echeance < NOW() et statut != 'soumise', alors statut bascule a 'en_retard'. Cron quotidien.",
            "impact": "Maj auto chaque nuit a 00h ; badge rouge au matin.",
            "source": s("13.9 + 17.6 trigger 6", 1170),
            "validation": {
                "condition": "IF date_echeance < NOW() AND statut != 'soumise' THEN statut='en_retard' (cron quotidien)"
            }
        },
        {
            "id": "DCL-005",
            "title": "Alerte badge rouge + auto-rappel",
            "description": "Quand statut='en_retard', badge rouge + auto-generation d'un rappel (type declaration_sociale) dans d02_reminders.",
            "impact": "Ligne en surbrillance rouge ; nouvelle entree dans Rappels Admin.",
            "source": s("10 ECRAN 17 + 13.10", 660),
            "validation": {
                "condition": "IF statut='en_retard' THEN badge rouge + INSERT d02_reminders (type=declaration_sociale)"
            }
        },
        {
            "id": "DCL-006",
            "title": "KPI Obj. 5 : 0 declaration en retard",
            "description": "L'objectif strategique 5 impose 0 declaration en retard. Alertes critiques au Tableau de Bord.",
            "impact": "KPI cible 0 ; si > 0 alors alerte critique affichee en tete du Tableau de Bord.",
            "source": s("3 Objectif 5 + 14.1", 78),
            "validation": {
                "condition": "count(statut='en_retard') = 0 ; IF > 0 THEN alerte critique"
            }
        },
        {
            "id": "DCL-007",
            "title": "Suivi montant (FCFA) + nombre_salaries",
            "description": "Chaque declaration enregistre le montant (FCFA, > 0) et le nombre de salaries concernes.",
            "impact": "Colonnes Montant (FCFA) et Nombre Salaries obligatoires.",
            "source": s("8.1 table d02_social_declarations", 282),
            "validation": {
                "required": ["montant", "nombre_salaries"],
                "type_montant": "integer > 0 FCFA",
                "type_nombre_salaries": "integer > 0"
            }
        }
    ]
})

# -------------------- MODULE 16 : PRETS --------------------
modules.append({
    "name": "Prets",
    "description": "Prets et avances (3 types). Calculateur mensualite (amortissement constant) + deduction auto en paie.",
    "regles": [
        {
            "id": "PRT-001",
            "title": "Types de pret (3 valeurs)",
            "description": "type_pret ∈ {avance_salaire, pret_social, pret_logement}.",
            "impact": "Select dans le formulaire ; badge selon le type.",
            "source": s("8.5 enum d02_loan_type", 327),
            "validation": {
                "required": ["type_pret"],
                "valeurs": ["avance_salaire", "pret_social", "pret_logement"]
            }
        },
        {
            "id": "PRT-002",
            "title": "Statuts pret (5 valeurs)",
            "description": "statut ∈ {demande, accorde, en_remboursement, solde, refuse}. Cycle complet de vie.",
            "impact": "Badge couleur ; boutons 'Accorder' / 'Refuser' / 'Demarrer remboursement' visibles selon le statut.",
            "source": s("8.5 enum d02_loan_status", 328),
            "validation": {
                "valeurs": ["demande", "accorde", "en_remboursement", "solde", "refuse"]
            }
        },
        {
            "id": "PRT-003",
            "title": "Calcul mensualite (amortissement constant)",
            "description": "mensualite = (montant_accorde x (taux_interet/12)) / (1 - (1 + taux_interet/12)^(-duree_mois)).",
            "impact": "Calculateur dans le formulaire de demande ; valeur read-only apres validation.",
            "source": s("13.5 formules prets", 1131),
            "validation": {
                "format": "computed",
                "condition": "(montant_accorde x (taux_interet/12)) / (1 - (1 + taux_interet/12)^(-duree_mois))"
            }
        },
        {
            "id": "PRT-004",
            "title": "Cas particulier taux 0% (pret social)",
            "description": "Si taux_interet = 0%, alors mensualite = montant_accorde / duree_mois (cas du pret social a 0%).",
            "impact": "Calcul automatique alternatif ; evite la division par zero.",
            "source": s("13.5", 1134),
            "validation": {
                "condition": "IF taux_interet = 0 THEN mensualite = montant_accorde / duree_mois"
            }
        },
        {
            "id": "PRT-005",
            "title": "Calcul solde_restant + mois_restants",
            "description": "solde_restant = montant_accorde - (mensualite x mois_payes) ; mois_restants = duree_mois - mois_payes.",
            "impact": "Colonnes Solde Restant (barre) et Mois Restants dans la liste ; maj auto chaque mois apres deduction paie.",
            "source": s("13.5", 1132),
            "validation": {
                "format": "computed",
                "condition": "montant_accorde - (mensualite x mois_payes)"
            }
        },
        {
            "id": "PRT-006",
            "title": "Deduction automatique en paie (statut en_remboursement)",
            "description": "Les prets 'en_remboursement' sont deduits automatiquement du net_a_payer chaque mois.",
            "impact": "Ligne 'Retenue pret' dans le calcul de paie ; visible dans l'onglet Paie de l'employe.",
            "source": s("11.7 + 10 ECRAN 18", 921),
            "validation": {
                "condition": "IF statut='en_remboursement' THEN deduire mensualite dans d02_pay_slips"
            }
        },
        {
            "id": "PRT-007",
            "title": "Passage a 'solde' quand solde_restant = 0",
            "description": "Quand solde_restant atteint 0, le pret bascule automatiquement a 'solde'.",
            "impact": "Statut maj sans action manuelle ; ligne archivee apres.",
            "source": s("12.5 workflow prets", 1051),
            "validation": {
                "condition": "IF solde_restant <= 0 THEN statut='solde' (auto-update)"
            }
        },
        {
            "id": "PRT-008",
            "title": "Validation DRH obligatoire (accorde ou refuse)",
            "description": "Toute demande de pret doit etre validee par la DRH (accorde ou refuse) avant debut remboursement.",
            "impact": "Boutons 'Accorder' / 'Refuser' visibles par DRH uniquement ; confirmation AlertDialog.",
            "source": s("12.5 + 5.2 matrice RACI", 1043),
            "validation": {
                "condition": "statut='demande' -> 'accorde'|'refuse' requires role DRH"
            }
        }
    ]
})

# -------------------- MODULE 17 : SANCTIONS --------------------
modules.append({
    "name": "Sanctions",
    "description": "Sanctions disciplinaires (4 niveaux). Procedure legale complete (constat -> convocation 5j -> entretien -> notification -> validation DRH -> execution).",
    "regles": [
        {
            "id": "SCN-001",
            "title": "4 niveaux de sanction (gradient de severite)",
            "description": "type_sanction ∈ {avertissement_oral, avertissement_ecrit, blame, suspension}. Badge jaune, orange, rouge, violet.",
            "impact": "Select dans le formulaire ; badge couleur selon le type ; couleur definitive.",
            "source": s("8.5 enum d02_sanction_type + 10 ECRAN 19", 324),
            "validation": {
                "required": ["type_sanction"],
                "valeurs": ["avertissement_oral", "avertissement_ecrit", "blame", "suspension"]
            }
        },
        {
            "id": "SCN-002",
            "title": "Delai de convocation >= 5 jours ouvres",
            "description": "Le delai entre la convocation a entretien et l'entretien disciplinaire doit etre >= 5 jours ouvables (droit du travail).",
            "impact": "Validation formulaire : date_entretien - date_convocation >= 5 jours ouvres ; message d'erreur sinon.",
            "source": s("11.7 + 12.3 workflow sanctions", 926),
            "validation": {
                "condition": "date_entretien - date_convocation >= 5 jours ouvres (exclut weekends et feries)"
            }
        },
        {
            "id": "SCN-003",
            "title": "Procedure disciplinaire complete (6 etapes)",
            "description": "Cycle obligatoire : Constat → Verification → Convocation → Entretien → Notification → Validation DRH → Execution. Statuts detailles par etape.",
            "impact": "Timeline workflow visible ; transitions de statut controlees ; impossible de sauter une etape.",
            "source": s("11.7 + 12.3", 926),
            "validation": {
                "condition": "transitions : brouillon -> en_verification -> convoque -> en_entretien -> notifiee -> validee -> en_execution -> executee"
            }
        },
        {
            "id": "SCN-004",
            "title": "Mention obligatoire des voies de recours",
            "description": "La notification de sanction doit obligatoirement mentionner les voies de recours (exigence legale).",
            "impact": "Champ 'voies_recours' obligatoire dans le formulaire de notification ; case a cocher + texte.",
            "source": s("11.7 etape 5 notification", 1006),
            "validation": {
                "required": ["voies_recours"],
                "condition": "voies_recours=true required for statut='notifiee'"
            }
        },
        {
            "id": "SCN-005",
            "title": "duree_suspension_jours si type=suspension",
            "description": "Si type_sanction='suspension', duree_suspension_jours est obligatoire et > 0.",
            "impact": "Champ conditionnel : visible uniquement si type=suspension ; min 1 jour.",
            "source": s("8.1 table d02_sanctions + 10 ECRAN 19", 288),
            "validation": {
                "required": "conditional",
                "condition": "required IF type_sanction='suspension'",
                "min": 1
            }
        },
        {
            "id": "SCN-006",
            "title": "Validation DRH obligatoire (valide_par)",
            "description": "Toute sanction doit etre validee par la DRH (champ valide_par FK employees obligatoire).",
            "impact": "Champ valide_par obligatoire avant passage a 'validee' ; selecteur DRH.",
            "source": s("8.1 + 11.7 etape 7 + 5.2 RACI", 288),
            "validation": {
                "required": ["valide_par"],
                "condition": "FK employees, role=DRH required before statut='validee'"
            }
        },
        {
            "id": "SCN-007",
            "title": "Tracabilite audit (pas de suppression physique)",
            "description": "Une sanction ne peut jamais etre supprimee physiquement (hard delete interdit), pour audit et contentieux. Soft delete uniquement avec audit log.",
            "impact": "Pas de bouton 'Supprimer' dans la liste ; action 'Archiver' a la place ; entrée d02_audit_log obligatoire.",
            "source": s("10 ECRAN 19 + 17.5 audit trail", 679),
            "validation": {
                "condition": "no hard delete allowed ; soft_delete with audit log entry"
            }
        },
        {
            "id": "SCN-008",
            "title": "Pilotage statistique au Tableau de Bord (climat social)",
            "description": "Les sanctions alimentent les statistiques climat social du Tableau de Bord (par type, par departement, par mois).",
            "impact": "Chart 'Repartition sanctions par type' au Tableau de Bord ; alerte si pic anormal.",
            "source": s("11.7 pilotage + 14.1", 928),
            "validation": {
                "condition": "aggregate by type, dept, month ; visible au Tableau de Bord"
            }
        }
    ]
})

# -------------------- MODULE 18 : VISITES MEDICALES --------------------
modules.append({
    "name": "Visites Medicales",
    "description": "Visites medicales (4 types) + 4 niveaux d'aptitude. Auto-creation visite de reprise si inapte_temporaire ou absence longue.",
    "regles": [
        {
            "id": "VMD-001",
            "title": "4 types de visite",
            "description": "type_visite ∈ {embauche, periodique, reprise, demandee}. Embauche=obligatoire avant prise de poste, Periodique=annuelle, Reprise=apres arret prolonge, Demandee=par employe ou medecin.",
            "impact": "Select dans le formulaire ; badge selon le type.",
            "source": s("8.5 + 10 ECRAN 20 + 11.6", 323),
            "validation": {
                "required": ["type_visite"],
                "valeurs": ["embauche", "periodique", "reprise", "demandee"]
            }
        },
        {
            "id": "VMD-002",
            "title": "4 niveaux d'aptitude",
            "description": "aptitude ∈ {apte, apte_avec_restrictions, inapte_temporaire, inapte_definitif}. Badge vert, orange, rouge clair, rouge fonce.",
            "impact": "Badge couleur decisive dans la liste ; alerte si inapte_definitif (impact paie et contrat).",
            "source": s("8.5 enum d02_medical_aptitude", 323),
            "validation": {
                "valeurs": ["apte", "apte_avec_restrictions", "inapte_temporaire", "inapte_definitif"]
            }
        },
        {
            "id": "VMD-003",
            "title": "Visite d'embauche obligatoire avant prise de poste",
            "description": "La visite d'embauche est obligatoire AVANT la prise de poste effective de l'employe.",
            "impact": "Blocage activation contrat tant que visite d'embauche non realisee ; alerte.",
            "source": s("11.6 + 10 ECRAN 20", 912),
            "validation": {
                "condition": "visite(embauche).date_visite < employees.date_embauche required"
            }
        },
        {
            "id": "VMD-004",
            "title": "Visite periodique annuelle (date_prochaine = date_visite + 12 mois)",
            "description": "La visite periodique est annuelle. date_prochaine_visite = date_visite + 12 mois (365 jours).",
            "impact": "Champ date_prochaine_visite auto-calcule ; alerte 15j avant echeance.",
            "source": s("11.6", 912),
            "validation": {
                "condition": "date_prochaine_visite = date_visite + 365 jours (auto-update)"
            }
        },
        {
            "id": "VMD-005",
            "title": "Visite de reprise automatique (3 cas)",
            "description": "Visite de reprise auto-creee apres : (a) absence maladie > 3 semaines, (b) accident_travail, (c) conge_maternite.",
            "impact": "Trigger depuis d02_absences vers d02_medical_visits ; notification au medecin et a l'employe.",
            "source": s("11.6 + 11.3 + 12.8", 912),
            "validation": {
                "condition": "trigger from absence(duree>21) OR accident_travail OR conge_maternite ; INSERT d02_medical_visits (type='reprise')"
            }
        },
        {
            "id": "VMD-006",
            "title": "Auto-creation visite de reprise si inapte_temporaire (+30j)",
            "description": "Si aptitude='inapte_temporaire', auto-creation d'une nouvelle visite (type=reprise) a +30 jours.",
            "impact": "Nouvelle ligne dans Visites Medicales ; notification RH.",
            "source": s("12.8 workflow visites medicales", 1090),
            "validation": {
                "condition": "IF aptitude='inapte_temporaire' THEN INSERT d02_medical_visits (type='reprise', date_visite=NOW()+30j)"
            }
        },
        {
            "id": "VMD-007",
            "title": "Alerte rappel < 15 jours (auto-rappel)",
            "description": "Si date_prochaine_visite - NOW() ≤ 15 jours, declenche un rappel auto (type visite_medicale) dans d02_reminders.",
            "impact": "Nouvelle entree dans Rappels Admin ; notification RH.",
            "source": s("13.10 + 17.6 trigger", 1181),
            "validation": {
                "condition": "IF (date_prochaine_visite - NOW()) ≤ 15 jours THEN INSERT d02_reminders (type=visite_medicale)"
            }
        },
        {
            "id": "VMD-008",
            "title": "Restrictions obligatoires si apte_avec_restrictions",
            "description": "Si aptitude='apte_avec_restrictions', le champ restrictions est obligatoire (description texte).",
            "impact": "Champ conditionnel : visible et requis uniquement si aptitude='apte_avec_restrictions'.",
            "source": s("8.1 + 10 ECRAN 20", 700),
            "validation": {
                "required": "conditional",
                "condition": "required IF aptitude='apte_avec_restrictions'",
                "min_length": 10
            }
        }
    ]
})

# -------------------- MODULE 19 : DEPARTS --------------------
modules.append({
    "name": "Departs",
    "description": "Dossiers de depart (5 motifs). Procedure complete : notification → calcul solde → checklist → restitution → offboarding IT → archivage.",
    "regles": [
        {
            "id": "DPR-001",
            "title": "5 motifs de depart",
            "description": "motif_depart ∈ {demission, licenciement, fin_cdd, retraite, deces}. Determinant pour le calcul d'indemnite.",
            "impact": "Select dans le formulaire ; impact direct sur la formule d'indemnite calculee.",
            "source": s("8.5 enum d02_departure_motif + 10 ECRAN 21", 325),
            "validation": {
                "required": ["motif_depart"],
                "valeurs": ["demission", "licenciement", "fin_cdd", "retraite", "deces"]
            }
        },
        {
            "id": "DPR-002",
            "title": "Statuts dossier (3 valeurs)",
            "description": "statut_dossier ∈ {en_cours, en_attente_piece, clos}. en_cours=pieces en cours, en_attente_piece=manque doc ou restitution, clos=tout finalise.",
            "impact": "Badge couleur ; progression visible via timeline.",
            "source": s("8.5 enum d02_departure_status", 326),
            "validation": {
                "valeurs": ["en_cours", "en_attente_piece", "clos"]
            }
        },
        {
            "id": "DPR-003",
            "title": "Calcul solde de conges restant",
            "description": "solde_conges_jours = solde_disponible dans d02_leave_balances (annee en cours), a indemniser ou deduire selon le motif.",
            "impact": "Champ calcule read-only ; visible dans la timeline depart.",
            "source": s("11.8 + 13.6 formules indemnite", 935),
            "validation": {
                "format": "computed",
                "condition": "FROM d02_leave_balances WHERE employee_id=X AND annee=current"
            }
        },
        {
            "id": "DPR-004",
            "title": "Calcul indemnite de depart (par motif)",
            "description": "Indemnite selon motif : demission = aucune ; fin_cdd = prime_precarite 10% du brut total ; licenciement = (1/5 × salaire_moyen × annees) + (2/15 × salaire_moyen × annees>10) ; retraite = formule conventionnelle.",
            "impact": "Champ calcule read-only ; detail du calcul visible dans la timeline.",
            "source": s("13.6 formules indemnite de depart", 1139),
            "validation": {
                "format": "computed",
                "condition": "switch(motif) : demission=0 ; fin_cdd=10%×brut_total ; licenciement=(1/5)×salaire_moyen×annees + (2/15)×salaire_moyen×max(0,annees-10) ; retraite=formule_conventionnelle"
            }
        },
        {
            "id": "DPR-005",
            "title": "Calcul solde de tout compte",
            "description": "solde_tout_compte = dernier_salaire + indemnite_conges_payes + indemnite_depart + primes.",
            "impact": "Champ mis en avant ; format FCFA ; document remis a l'employe.",
            "source": s("13.6", 1143),
            "validation": {
                "format": "computed",
                "condition": "dernier_salaire + indemnite_conges_payes + indemnite + primes"
            }
        },
        {
            "id": "DPR-006",
            "title": "Checklist documents a remettre (5 items)",
            "description": "Checklist obligatoire : attestation travail, certificat travail, recu solde tout compte, attestation France Travail (Pole Emploi), releve d'heures. Aucun dossier clos sans tous les items valides.",
            "impact": "Checklist interactive dans l'ecran departs ; bouton 'Clore' desactive si tous items non coches.",
            "source": s("11.8 etape 6 + 10 ECRAN 21", 936),
            "validation": {
                "required": ["attestation_travail", "certificat_travail", "recu_solde_tout_compte", "attestation_france_travail", "releve_heures"],
                "condition": "all items checked before 'clos'"
            }
        },
        {
            "id": "DPR-007",
            "title": "Restitution materiel 100% obligatoire",
            "description": "Restitution obligatoire de tout le materiel : badge, ordinateur, vehicule. Aucun dossier ne peut etre clos sans restitution 100%.",
            "impact": "Checklist de restitution ; bouton 'Clore' desactive si un item non restitue.",
            "source": s("11.8 etape 7 + 14.3 Processus 6", 937),
            "validation": {
                "required": ["badge_restitue", "ordinateur_restitue", "vehicule_restitue"],
                "condition": "all items = true before 'clos'"
            }
        },
        {
            "id": "DPR-008",
            "title": "Desactivation acces IT (offboarding)",
            "description": "Desactivation des acces informatiques obligatoire avant cloture : badge, email, comptes applicatifs, VPN.",
            "impact": "Tache IT obligatoire dans la timeline ; notification au service IT ; ticket auto-cree.",
            "source": s("11.8 etape 8 + 12.4", 938),
            "validation": {
                "condition": "it_offboarding=true required before 'clos' ; ticket auto-creer vers service IT"
            }
        },
        {
            "id": "DPR-009",
            "title": "Archivage automatique du dossier apres cloture",
            "description": "Le dossier de depart cloture est archive automatiquement dans d02_document_archives (duree 5 ans minimum).",
            "impact": "Apres 'clos', une entree d02_document_archives est creee automatiquement.",
            "source": s("11.8 etape 9 + 10 ECRAN 22", 939),
            "validation": {
                "condition": "AFTER statut='clos' THEN INSERT d02_document_archives (duree=5_ans)"
            }
        },
        {
            "id": "DPR-010",
            "title": "Delai de remise du solde de tout compte (KPI Processus 6)",
            "description": "Le solde de tout compte doit etre remis dans les delais legaux (KPI Processus 6 ISO).",
            "impact": "Alerte si delai depasse ; KPI mesure au Tableau de Bord.",
            "source": s("14.3 KPI Processus 6 - Sortie", 1249),
            "validation": {
                "condition": "remise_stc_date <= delai_legal ; IF > delai THEN alerte + NC"
            }
        }
    ]
})

# -------------------- MODULE 20 : ARCHIVAGE --------------------
modules.append({
    "name": "Archivage",
    "description": "Archivage documentaire. Durees de conservation 1/3/5 ans selon type. Dossiers verrouilles en lecture seule (gate Phase 5).",
    "regles": [
        {
            "id": "ARC-001",
            "title": "Durees de conservation (3 valeurs)",
            "description": "duree_conservation ∈ {1 an, 3 ans, 5 ans} selon le type de document.",
            "impact": "Select dans le formulaire ; affichage dans la liste ; alerte quand fin de conservation approche.",
            "source": s("8.5 enum d02_archive_duree + 10 ECRAN 22", 334),
            "validation": {
                "required": ["duree_conservation"],
                "valeurs": ["1_an", "3_ans", "5_ans"]
            }
        },
        {
            "id": "ARC-002",
            "title": "Repartition par duree selon type document",
            "description": "1 an = notes de service, convocations ; 3 ans = pointages, plannings ; 5 ans = contrats, fiches de paie, declarations sociales.",
            "impact": "Auto-suggestion de duree selon type_document selectionne ; modifiable par le responsable.",
            "source": s("10 ECRAN 22 regles de conservation", 753),
            "validation": {
                "condition": "type_document -> duree mapping : notes/convocations=1_an ; pointages/plannings=3_ans ; contrats/paie/declarations=5_ans"
            }
        },
        {
            "id": "ARC-003",
            "title": "Lieux de stockage (2 valeurs)",
            "description": "lieu_stockage ∈ {Archive numerique RH, Archive physique Salle B}.",
            "impact": "Select dans le formulaire ; colonne Lieu de Stockage dans la liste.",
            "source": s("8.1 + 11.8 + 10 ECRAN 22", 285),
            "validation": {
                "required": ["lieu_stockage"],
                "valeurs": ["Archive numerique RH", "Archive physique Salle B"]
            }
        },
        {
            "id": "ARC-004",
            "title": "Verrouillage des dossiers archives (gate Phase 5)",
            "description": "Un dossier archive est en lecture seule : plus aucune modification possible. Gate Phase 5 du cycle de vie.",
            "impact": "Boutons edit/delete masques apres archivage ; bouton 'Consulter' uniquement.",
            "source": s("7 regles de basculement Phase 5", 265),
            "validation": {
                "condition": "IF archived THEN readonly ; no UPDATE / DELETE allowed"
            }
        },
        {
            "id": "ARC-005",
            "title": "Responsable d'archivage obligatoire",
            "description": "responsable (FK employees) est obligatoire pour chaque entree d'archive. Permet la tracabilite.",
            "impact": "Selecteur d'employe obligatoire ; colonne Responsable dans la liste.",
            "source": s("8.1 table d02_document_archives + 11.8", 285),
            "validation": {
                "required": ["responsable"],
                "condition": "FK employees NOT NULL"
            }
        },
        {
            "id": "ARC-006",
            "title": "KPI Obj. 6 : 100% archives dans les delais",
            "description": "L'objectif strategique 6 exige 100% des documents archives dans les delais legaux. Auditable.",
            "impact": "KPI cible au Tableau de Bord ; alerte si retard d'archivage.",
            "source": s("3 Objectif 6 + 14.1", 79),
            "validation": {
                "condition": "count(en_retard_archivage) = 0 ; IF > 0 THEN alerte"
            }
        }
    ]
})

# -------------------- MODULE 21 : RAPPELS --------------------
modules.append({
    "name": "Rappels",
    "description": "Rappels administratifs centralises. Auto-generation par triggers/cron. 5 types. Tri par date echeance croissante.",
    "regles": [
        {
            "id": "RAP-001",
            "title": "5 types de rappels",
            "description": "type_rappel ∈ {expiration_document, renouvellement_contrat, echeance_periode_essai, visite_medicale, declaration_sociale}.",
            "impact": "Filtre type dans la liste ; icone differente par type.",
            "source": s("8.5 enum d02_reminder_type + 11.9", 331),
            "validation": {
                "required": ["type_rappel"],
                "valeurs": ["expiration_document", "renouvellement_contrat", "echeance_periode_essai", "visite_medicale", "declaration_sociale"]
            }
        },
        {
            "id": "RAP-002",
            "title": "Statuts rappel (3 valeurs)",
            "description": "statut ∈ {en_attente, en_retard, traite}. Cycle complet.",
            "impact": "Badge couleur : jaune, rouge, vert.",
            "source": s("8.5 enum d02_reminder_status", 332),
            "validation": {
                "valeurs": ["en_attente", "en_retard", "traite"]
            }
        },
        {
            "id": "RAP-003",
            "title": "Auto-generation par triggers (5 sources)",
            "description": "Les rappels sont generes automatiquement par triggers quand une echeance approche (< 7j, < 15j ou < 30j selon le type).",
            "impact": "Aucune saisie manuelle ; les rappels apparaissent automatiquement dans la liste.",
            "source": s("13.10 + 17.6 triggers 3,4,6", 1173),
            "validation": {
                "condition": "triggers : document≤30j ; contrat≤30j ; essai≤7j ; visite≤15j ; declaration≤7j"
            }
        },
        {
            "id": "RAP-004",
            "title": "Auto-bascule a 'en_retard' (cron quotidien)",
            "description": "Cron quotidien : UPDATE d02_reminders SET statut='en_retard' WHERE date_echeance < NOW() AND statut='en_attente'.",
            "impact": "Maj auto chaque nuit a 00h ; badge rouge au matin.",
            "source": s("17.6 trigger 6 + 13.9", 1482),
            "validation": {
                "condition": "cron quotidien 00h00 : IF date_echeance < NOW() AND statut='en_attente' THEN statut='en_retard'"
            }
        },
        {
            "id": "RAP-005",
            "title": "Tri par defaut : date_echeance croissante",
            "description": "La liste des rappels est triee par defaut par date_echeance croissante (les plus urgents en premier).",
            "impact": "ORDER BY date_echeance ASC ; badge rouge en haut de liste.",
            "source": s("10 ECRAN 22b", 763),
            "validation": {
                "format": "ORDER BY date_echeance ASC"
            }
        },
        {
            "id": "RAP-006",
            "title": "Marquer comme traite exige action_requise realisee",
            "description": "Le passage a 'traite' exige la realisation de l'action_requise et le responsable_suivi.",
            "impact": "Bouton 'Marquer traite' desactive si action_requise non cochee ; confirmation demandee.",
            "source": s("11.9 + 10 ECRAN 22b", 778),
            "validation": {
                "condition": "statut='traite' requires action_requise realised + responsable_suivi_id"
            }
        },
        {
            "id": "RAP-007",
            "title": "KPI hebdomadaire : 0 rappel en retard non traite",
            "description": "KPI hebdomadaire : 0 rappel en retard non traite (cible Tableau de Bord).",
            "impact": "KPI affiche au Tableau de Bord ; alerte si > 0.",
            "source": s("14.1 KPI Rappels en retard", 1203),
            "validation": {
                "condition": "count(statut='en_retard') = 0 ; IF > 0 THEN alerte"
            }
        }
    ]
})

# -------------------- MODULE 22 : TABLEAU DE BORD --------------------
modules.append({
    "name": "Tableau de Bord",
    "description": "Outil de pilotage central. 12 KPIs principaux + 7 objectifs strategiques + mini-tableaux dynamiques. Refresh via materialized views.",
    "regles": [
        {
            "id": "TDB-001",
            "title": "12 KPIs principaux (5 categories)",
            "description": "Le tableau de bord affiche 12 KPIs principaux : Effectif total, Taux d'actifs, Contrats en vigueur, Documents conformes, Taux presence, Total absences, HS validees, Masse salariale brute, Total cotisations, Declarations en retard, Departs clos, Rappels en retard.",
            "impact": "12 KPI cards en tete du dashboard ; actualisation mensuelle.",
            "source": s("14.1 12 KPIs principaux", 1188),
            "validation": {
                "required": True,
                "count": 12
            }
        },
        {
            "id": "TDB-002",
            "title": "KPI Effectif total (COUNT)",
            "description": "KPI Effectif total = COUNT(*) FROM employees WHERE tenant_id. Mis a jour mensuellement.",
            "impact": "Card 'Effectif Total' avec valeur + tendance vs mois precedent.",
            "source": s("14.1 + 10 ECRAN 1", 1192),
            "validation": {
                "format": "COUNT SQL",
                "condition": "SELECT COUNT(*) FROM employees WHERE tenant_id=X"
            }
        },
        {
            "id": "TDB-003",
            "title": "KPI Taux d'actifs cible > 90%",
            "description": "KPI Taux d'actifs = COUNT(statut='Actif') / COUNT(*) × 100. Cible > 90%.",
            "impact": "Card avec valeur + cible ; alerte si < 90%.",
            "source": s("14.1 + 3 Objectif 1", 1193),
            "validation": {
                "condition": "COUNT(statut='Actif') / COUNT(*) * 100 ; IF < 90% THEN alerte"
            }
        },
        {
            "id": "TDB-004",
            "title": "KPI Documents conformes cible 100% (Obj. 1)",
            "description": "KPI Documents conformes = COUNT(statut='valide') / COUNT(*) × 100. Cible 100% (Obj. 1 Completude des dossiers).",
            "impact": "Card avec valeur + cible ; alerte si < 100%.",
            "source": s("14.1 + 3 Objectif 1", 1195),
            "validation": {
                "condition": "COUNT(statut='valide') / COUNT(*) * 100 ; IF < 100% THEN alerte"
            }
        },
        {
            "id": "TDB-005",
            "title": "KPI Taux presence cible > 95% (Obj. 4)",
            "description": "KPI Taux presence = AVG(taux_presence) FROM d02_monthly_planning. Cible > 95% (Obj. 4).",
            "impact": "Card avec valeur + cible ; alerte si < 95%.",
            "source": s("14.1 + 3 Objectif 4", 1196),
            "validation": {
                "condition": "AVG(taux_presence) FROM d02_monthly_planning ; IF < 95% THEN alerte"
            }
        },
        {
            "id": "TDB-006",
            "title": "KPI Declarations en retard cible 0 (Obj. 5)",
            "description": "KPI Declarations en retard = COUNT(statut='en_retard') FROM d02_social_declarations. Cible 0 (Obj. 5).",
            "impact": "Card avec valeur + cible 0 ; alerte critique si > 0.",
            "source": s("14.1 + 3 Objectif 5", 1201),
            "validation": {
                "condition": "COUNT(statut='en_retard') FROM d02_social_declarations ; IF > 0 THEN alerte critique"
            }
        },
        {
            "id": "TDB-007",
            "title": "Affichage des 7 objectifs strategiques",
            "description": "Le Tableau de Bord affiche les 7 objectifs strategiques ISO avec leur progression et couleur (vert si cible atteinte, orange sinon, rouge si en alerte).",
            "impact": "Section dediee avec 7 lignes ; progression visible ; clic pour detail.",
            "source": s("3 Objectifs strategiques + 10 ECRAN 1", 68),
            "validation": {
                "required": True,
                "count": 7,
                "valeurs_objectifs": ["Completude dossiers 100%", "Conformite contractuelle 0% echus", "Ponctualite paie 100% avant 5", "Taux presence > 95%", "Conformite declarations 0 retard", "Archivage a jour 100%", "Satisfaction administrative > 80%"]
            }
        },
        {
            "id": "TDB-008",
            "title": "Mini-tableaux dynamiques (5+ listes)",
            "description": "Le dashboard affiche : derniers rappels admin (5), conges en attente (5), prets en cours (somme soldes restants), dossiers depart clos du mois.",
            "impact": "Mini-tableaux dynamiques ; clic sur une ligne redirige vers l'ecran dedie.",
            "source": s("10 ECRAN 1 composants", 446),
            "validation": {
                "required": True,
                "lists": ["rappels_urgents_5", "conges_en_attente_5", "prets_en_cours", "departs_clos_mois"]
            }
        },
        {
            "id": "TDB-009",
            "title": "Refresh temps reel (materialized views + Realtime)",
            "description": "Les KPIs sont calcules via materialized views rafraichies nightly ; alertes critiques en temps reel via Supabase Realtime (channel d02_notifications).",
            "impact": "Refresh nocturne pour les KPIs ; notifications push temps reel pour les alertes.",
            "source": s("17.4 performance + 17.7 realtime", 1443),
            "validation": {
                "format": "materialized view + realtime",
                "condition": "MV refreshed nightly ; Realtime channel for alerts"
            }
        },
        {
            "id": "TDB-010",
            "title": "Charts Recharts (bar, donut, line)",
            "description": "Bar chart (repartition par departement), donut chart (types de contrat), charts d'evolution (masse salariale 12 mois).",
            "impact": "Composants Recharts ; couleurs conformes au design system.",
            "source": s("10 ECRAN 1 + 16.2 composants shadcn", 444),
            "validation": {
                "required": True,
                "types": ["bar", "donut", "line"]
            }
        },
        {
            "id": "TDB-011",
            "title": "Filtre periode (mois/trimestre/annee)",
            "description": "Filtre periode sur tous les KPIs : mois, trimestre, annee. Defaut = mois courant.",
            "impact": "Select sticky top ; changement de filtre recharge tous les KPIs.",
            "source": s("18.3 dashboard + 10 ECRAN 1", 1507),
            "validation": {
                "required": True,
                "valeurs": ["mois", "trimestre", "annee"],
                "default": "mois"
            }
        },
        {
            "id": "TDB-012",
            "title": "Bandeau conformite ISO en pied de page",
            "description": "Bandeau de pied de page affichant : REFERENTIEL ISO 30401:2018 + ISO 9001:2015, DOMAINE D2, CLASSIFICATION Document Interne - Processus GRH, VERSION 1.0.",
            "impact": "Footer present sur tous les ecrans D2 ; statique ; exigence ISO.",
            "source": s("2 metadata documentaire", 60),
            "validation": {
                "required": True,
                "format": "footer",
                "fields": ["REFERENTIEL", "DOMAINE", "CLASSIFICATION", "VERSION"]
            }
        }
    ]
})

# ============================================================
# Construction de l'objet final regles_metier
# ============================================================

regles_metier = {
    "metadata": {
        "version": "1.0",
        "date": "2026-09-02",
        "source": [
            V2,
            DATA,
            "worklog.md Task 1 + Task 2 (audit + 22 ecrans deployes)"
        ],
        "conformite": "ISO 30401:2018 + ISO 9001:2015 + ISO 10667:2011 + ISO 22400-3:2022",
        "domaine": "D2 - Gestion Administrative du Personnel",
        "modules_count": len(modules),
        "regles_count": sum(len(m["regles"]) for m in modules)
    },
    "modules": modules
}

# ============================================================
# LIVRABLE 2 : WORKFLOWS
# ============================================================

workflows = []

# WF-001 : Demande de Conge (2 niveaux)
workflows.append({
    "id": "WF-001",
    "name": "Demande de Conge",
    "description": "Workflow d'approbation a 2 niveaux : validation Manager (niveau 1) puis DRH (niveau 2) si conge > 5 jours ou sans solde. Mise a jour auto du solde de conges.",
    "actors": ["Employe", "Manager Hierarchique", "DRH"],
    "steps": [
        {"id": "WF-001-001", "action": "Employe soumet la demande (type_conge, date_debut, date_fin, motif)", "actor": "Employe", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/conges", "source": s("12.1 + 10 ECRAN 10", 966)},
        {"id": "WF-001-002", "action": "Auto-calcul du nombre de jours (exclut weekends et feries)", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/conges", "source": s("13.1 formules conges", 1101)},
        {"id": "WF-001-003", "action": "Manager valide ou refuse (niveau 1)", "actor": "Manager Hierarchique", "status": "approuvee OU rejetee", "interface": "/domaine2_Gestion_Administrative_Personnel/conges", "source": s("12.1 workflow conges", 969)},
        {"id": "WF-001-004", "action": "Si nombre_jours > 5 OU type='conge_sans_solde' alors DRH valide (niveau 2)", "actor": "DRH", "status": "approuvee_definitive OU rejetee", "interface": "/domaine2_Gestion_Administrative_Personnel/conges", "source": s("12.1 + 10 ECRAN 10", 972)},
        {"id": "WF-001-005", "action": "Mise a jour automatique du solde de conges (trigger update_leave_balance)", "actor": "Systeme", "status": "approuvee_definitive", "interface": "/domaine2_Gestion_Administrative_Personnel/conges/soldes", "source": s("17.6 trigger 5", 1176)},
        {"id": "WF-001-006", "action": "Si type='conge_sans_solde' alors deduction automatique en paie", "actor": "Systeme", "status": "payee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("11.3 + 13.4", 852)}
    ],
    "diagram": "flowchart TD\n  A([Employe soumet demande]) -->|en_attente| B[Auto-calc nombre_jours]\n  B --> C{Manager valide?}\n  C -->|Non| Z1([rejetee])\n  C -->|Oui, niveau 1| D{Conge > 5j OU sans solde?}\n  D -->|Non| E([approuvee_definitive])\n  D -->|Oui| F{DRH valide?}\n  F -->|Non| Z1\n  F -->|Oui| E\n  E --> G[MAJ auto solde conges]\n  G --> H{Type sans solde?}\n  H -->|Oui| I[Deduction en paie]\n  H -->|Non| J([Fin])\n  I --> J"
})

# WF-002 : Creation d'un Contrat
workflows.append({
    "id": "WF-002",
    "name": "Creation d'un Contrat",
    "description": "Creation d'un contrat de travail avec auto-calcul duree et jours restants. Alerte expiration < 30j + auto-rappel. Auto-bascule a 'echu' quand jours_restants < 0.",
    "actors": ["Responsable Admin RH", "Assistant RH", "DRH"],
    "steps": [
        {"id": "WF-002-001", "action": "Saisie contrat (employee_id, type, date_debut, date_fin, salaire_brut, regime, lieu)", "actor": "Assistant RH", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/contrats", "source": s("11.2 procedure contrats", 833)},
        {"id": "WF-002-002", "action": "Auto-calcul duree_mois et jours_restants", "actor": "Systeme", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/contrats", "source": s("13.8 + 10 ECRAN 4", 507)},
        {"id": "WF-002-003", "action": "Validation DRH", "actor": "DRH", "status": "en_vigueur", "interface": "/domaine2_Gestion_Administrative_Personnel/contrats", "source": s("5.2 matrice RACI", 145)},
        {"id": "WF-002-004", "action": "Si jours_restants ≤ 30 alors alerte badge rouge + auto-creation rappel (type renouvellement_contrat)", "actor": "Systeme", "status": "en_vigueur", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10 + 17.6 trigger 3", 1179)},
        {"id": "WF-002-005", "action": "Si jours_restants < 0 alors auto-bascule a 'echu' (trigger trg_contracts_status)", "actor": "Systeme", "status": "echu", "interface": "/domaine2_Gestion_Administrative_Personnel/contrats", "source": s("13.9 + 17.6 trigger 1", 1165)},
        {"id": "WF-002-006", "action": "Si rupture anticipee alors action manuelle 'resilie' (irreversible, auditee)", "actor": "Responsable Admin RH", "status": "resilie", "interface": "/domaine2_Gestion_Administrative_Personnel/contrats", "source": s("12.6 workflow contrats", 1064)}
    ],
    "diagram": "flowchart TD\n  A([Saisie contrat]) --> B[Auto-calc duree + jours_restants]\n  B --> C{DRH valide?}\n  C -->|Non| Z([brouillon])\n  C -->|Oui| D([en_vigueur])\n  D --> E{jours ≤ 30?}\n  E -->|Oui| F[Alerte rouge + rappel auto]\n  E -->|Non| G{jours < 0?}\n  F --> G\n  G -->|Oui| H([echu])\n  G -->|Non| I{Rupture anticipee?}\n  I -->|Oui| J([resilie])\n  I -->|Non| K([Fin])"
})

# WF-003 : Creation d'Avenant
workflows.append({
    "id": "WF-003",
    "name": "Creation d'Avenant",
    "description": "Creation d'un avenant modifiant un contrat (salaire, poste, temps partiel, lieu, promotion). Auto-increment amendment_number + propagation auto vers employees.",
    "actors": ["Responsable Admin RH", "DRH"],
    "steps": [
        {"id": "WF-003-001", "action": "Selection du contrat existant (FK contract_id obligatoire)", "actor": "Responsable Admin RH", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/avenants", "source": s("8.1 + 9.6", 277)},
        {"id": "WF-003-002", "action": "Saisie type_modification, ancienne_valeur, nouvelle_valeur, motif, date_effet", "actor": "Responsable Admin RH", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/avenants", "source": s("11.2 champs avenant", 841)},
        {"id": "WF-003-003", "action": "Auto-increment amendment_number par contrat", "actor": "Systeme", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/avenants", "source": s("11.2 procedure", 836)},
        {"id": "WF-003-004", "action": "Validation DRH", "actor": "DRH", "status": "valide", "interface": "/domaine2_Gestion_Administrative_Personnel/avenants", "source": s("5.2 matrice RACI", 146)},
        {"id": "WF-003-005", "action": "Propagation auto : si Salaire alors update employees.salaire_brut ; si Poste alors update employees.position_id ; si Temps partiel alors update employees.regime_travail", "actor": "Systeme", "status": "valide", "interface": "/domaine2_Gestion_Administrative_Personnel/employes", "source": s("11.2 propagation avenant", 836)}
    ],
    "diagram": "flowchart TD\n  A([Selection contrat existant]) --> B[Saisie avenant: type, ancienne, nouvelle, motif, date_effet]\n  B --> C[Auto-increment amendment_number]\n  C --> D{DRH valide?}\n  D -->|Non| Z([brouillon])\n  D -->|Oui| E([valide])\n  E --> F{Type modification?}\n  F -->|Salaire| G[UPDATE employees.salaire_brut]\n  F -->|Poste| H[UPDATE employees.position_id]\n  F -->|Temps partiel| I[UPDATE employees.regime_travail]\n  F -->|Autre| J([Fin])\n  G --> J\n  H --> J\n  I --> J"
})

# WF-004 : Upload / Validation Document
workflows.append({
    "id": "WF-004",
    "name": "Upload et Validation d'un Document",
    "description": "Upload d'un document employe (CNI, passeport, etc.) avec auto-bascule de statut selon date_expiration et generation auto de rappels.",
    "actors": ["Assistant RH", "Responsable Admin RH", "Systeme"],
    "steps": [
        {"id": "WF-004-001", "action": "Upload document (type, numero, date_emission, date_expiration, lieu_depot)", "actor": "Assistant RH", "status": "valide", "interface": "/domaine2_Gestion_Administrative_Personnel/documents", "source": s("10 ECRAN 6", 518)},
        {"id": "WF-004-002", "action": "Validation format (PDF / JPG / PNG) + taille max", "actor": "Systeme", "status": "valide", "interface": "/domaine2_Gestion_Administrative_Personnel/documents", "source": s("17.5 securite", 1448)},
        {"id": "WF-004-003", "action": "Calcul automatique jours_restants", "actor": "Systeme", "status": "valide", "interface": "/domaine2_Gestion_Administrative_Personnel/documents", "source": s("13.8", 1156)},
        {"id": "WF-004-004", "action": "Si jours_restants ≤ 30 alors trigger bascule statut a 'a_renouveler'", "actor": "Systeme", "status": "a_renouveler", "interface": "/domaine2_Gestion_Administrative_Personnel/documents", "source": s("13.9 + 17.6 trigger 4", 1167)},
        {"id": "WF-004-005", "action": "Si jours_restants ≤ 15 alors auto-creation rappel (type expiration_document)", "actor": "Systeme", "status": "a_renouveler", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10 + 17.6 trigger 3", 1177)},
        {"id": "WF-004-006", "action": "Si date_expiration < NOW() alors auto-bascule a 'expire'", "actor": "Systeme", "status": "expire", "interface": "/domaine2_Gestion_Administrative_Personnel/documents", "source": s("13.9 + 17.6 trigger 4", 1166)}
    ],
    "diagram": "flowchart TD\n  A([Upload document]) --> B[Validation format + taille]\n  B --> C{Format OK?}\n  C -->|Non| Z1([Erreur])\n  C -->|Oui| D[Calcul jours_restants]\n  D --> E([valide])\n  E --> F{jours ≤ 30?}\n  F -->|Oui| G([a_renouveler])\n  F -->|Non| H{jours ≤ 15?}\n  G --> H\n  H -->|Oui| I[Auto-creation rappel]\n  H -->|Non| J{date_exp < NOW?}\n  I --> J\n  J -->|Oui| K([expire])\n  J -->|Non| L([Fin])"
})

# WF-005 : Validation Heures Supplementaires
workflows.append({
    "id": "WF-005",
    "name": "Validation Heures Supplementaires",
    "description": "Declaration hebdomadaire d'heures supplementaires. Validation Manager OBLIGATOIRE avant integration paie. Seules les HS 'validees' vont en paie.",
    "actors": ["Employe", "Manager Hierarchique", "Comptable Paie"],
    "steps": [
        {"id": "WF-005-001", "action": "Declaration hebdomadaire (heures_normales, heures_supp, taux_majoration)", "actor": "Employe", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/heures-supp", "source": s("10 ECRAN 13 + 11.4", 606)},
        {"id": "WF-005-002", "action": "Auto-calcul salaire_horaire_base, montant_brut, montant_calcule", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/heures-supp", "source": s("13.3", 1115)},
        {"id": "WF-005-003", "action": "Manager valide ou refuse", "actor": "Manager Hierarchique", "status": "validee OU rejetee", "interface": "/domaine2_Gestion_Administrative_Personnel/heures-supp", "source": s("11.4 + 12.2", 607)},
        {"id": "WF-005-004", "action": "Si 'validee' alors integration dans la fiche de paie du mois", "actor": "Comptable Paie", "status": "payee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("11.4 + 13.4", 608)},
        {"id": "WF-005-005", "action": "Si 'rejetee' alors ignoree (jamais en paie)", "actor": "Systeme", "status": "rejetee", "interface": "/domaine2_Gestion_Administrative_Personnel/heures-supp", "source": s("11.4 regle imperative", 879)}
    ],
    "diagram": "flowchart TD\n  A([Declaration hebdo HS]) --> B[Auto-calc montant_brut + montant_calcule]\n  B --> C([en_attente])\n  C --> D{Manager valide?}\n  D -->|Oui| E([validee])\n  D -->|Non| F([rejetee])\n  F --> G([Ignoree - pas en paie])\n  E --> H[Integration fiche de paie]\n  H --> I([payee])"
})

# WF-006 : Pointage Hebdomadaire
workflows.append({
    "id": "WF-006",
    "name": "Pointage Hebdomadaire",
    "description": "Saisie quotidienne du pointage, validation hebdomadaire Manager, agregation mensuelle vers planning et export paie.",
    "actors": ["Employe", "Manager Hierarchique", "Comptable Paie"],
    "steps": [
        {"id": "WF-006-001", "action": "Saisie quotidienne pointage (badgeage auto ou manuel)", "actor": "Employe", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/pointage", "source": s("11.4 workflow pointage", 869)},
        {"id": "WF-006-002", "action": "Auto-calcul taux_presence + retards_total_minutes", "actor": "Systeme", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/pointage", "source": s("13.2 formules presence", 1108)},
        {"id": "WF-006-003", "action": "Validation hebdomadaire Manager", "actor": "Manager Hierarchique", "status": "valide OU rejete", "interface": "/domaine2_Gestion_Administrative_Personnel/pointage", "source": s("11.4 + 8.5", 870)},
        {"id": "WF-006-004", "action": "Agregation mensuelle vers d02_monthly_planning", "actor": "Systeme", "status": "brouillon_planning", "interface": "/domaine2_Gestion_Administrative_Personnel/planning", "source": s("10 ECRAN 15 + 11.4", 630)},
        {"id": "WF-006-005", "action": "Validation puis cloture mensuelle (gate Phase 3 -> Phase 4, irreversible)", "actor": "DRH", "status": "cloture", "interface": "/domaine2_Gestion_Administrative_Personnel/planning", "source": s("7 regles de basculement + 10 ECRAN 15", 264)},
        {"id": "WF-006-006", "action": "Export vers paie", "actor": "Comptable Paie", "status": "cloture", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("11.5 procedure paie", 887)}
    ],
    "diagram": "flowchart TD\n  A([Saisie quotidienne badgeage]) --> B[Auto-calc taux_presence + retards]\n  B --> C([brouillon])\n  C --> D{Manager valide?}\n  D -->|Non| Z([rejete])\n  D -->|Oui| E([valide])\n  E --> F[Agregation mensuelle planning]\n  F --> G{DRH cloture?}\n  G -->|Oui, irreversible| H([cloture])\n  G -->|Non| G\n  H --> I[Export vers paie]\n  I --> J([Fin])"
})

# WF-007 : Generation Fiche de Paie
workflows.append({
    "id": "WF-007",
    "name": "Generation Fiche de Paie",
    "description": "Generation mensuelle des fiches de paie. Recuperation auto des donnees (pointage, conges, HS validees, prets) + calculs + validation DRH + paiement.",
    "actors": ["Comptable Paie", "DRH"],
    "steps": [
        {"id": "WF-007-001", "action": "Recuperation auto : pointage valide, conges, HS validees, prets en_remboursement", "actor": "Systeme", "status": "generee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("11.5 processus paie", 887)},
        {"id": "WF-007-002", "action": "Calcul salaire_brut = base + HS + primes - retenues_absences", "actor": "Systeme", "status": "generee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("13.4", 1123)},
        {"id": "WF-007-003", "action": "Calcul cotisations = salaire_brut x taux_charges", "actor": "Systeme", "status": "generee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("13.4", 1124)},
        {"id": "WF-007-004", "action": "Calcul net_a_payer = brut - cotisations - deductions_prets", "actor": "Systeme", "status": "generee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("13.4", 1125)},
        {"id": "WF-007-005", "action": "Validation DRH (validator_id + validation_date)", "actor": "DRH", "status": "validee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("11.5 etape 5", 891)},
        {"id": "WF-007-006", "action": "Paiement (virement / cheque / especes) + date_paiement", "actor": "Comptable Paie", "status": "payee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("11.5 etape 6", 892)},
        {"id": "WF-007-007", "action": "KPI Obj. 3 : generation avant le 5 du mois suivant", "actor": "Comptable Paie", "status": "payee", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("3 Objectif 3 + 10 ECRAN 16", 76)}
    ],
    "diagram": "flowchart TD\n  A([Recuperation auto donnees]) --> B[Calcul salaire_brut]\n  B --> C[Calcul cotisations]\n  C --> D[Calcul net_a_payer]\n  D --> E([generee])\n  E --> F{DRH valide?}\n  F -->|Non| E\n  F -->|Oui| G([validee])\n  G --> H[Paiement virement/cheque/especes]\n  H --> I([payee])\n  I --> J{Generee avant le 5?}\n  J -->|Oui| K([KPI OK])\n  J -->|Non| L([Alerte KPI Obj.3])"
})

# WF-008 : Declaration Sociale
workflows.append({
    "id": "WF-008",
    "name": "Declaration Sociale",
    "description": "Soumission des declarations sociales (CNPS, CNP, Impots). Alertes retard automatiques + KPI Obj. 5 (0 en retard).",
    "actors": ["Comptable Paie", "DRH"],
    "steps": [
        {"id": "WF-008-001", "action": "Saisie declaration (organisme, type, periode, montant, date_echeance, nombre_salaries)", "actor": "Comptable Paie", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/declarations", "source": s("10 ECRAN 17", 657)},
        {"id": "WF-008-002", "action": "Soumission a l'organisme + date_soumission", "actor": "Comptable Paie", "status": "soumise", "interface": "/domaine2_Gestion_Administrative_Personnel/declarations", "source": s("11.5 declarations sociales", 899)},
        {"id": "WF-008-003", "action": "Validation par l'organisme", "actor": "Organisme externe", "status": "validee", "interface": "/domaine2_Gestion_Administrative_Personnel/declarations", "source": s("11.5", 901)},
        {"id": "WF-008-004", "action": "Si date_echeance < NOW() et statut != 'soumise' alors auto-bascule 'en_retard' (cron quotidien)", "actor": "Systeme", "status": "en_retard", "interface": "/domaine2_Gestion_Administrative_Personnel/declarations", "source": s("13.9 + 17.6 trigger 6", 1170)},
        {"id": "WF-008-005", "action": "Si 'en_retard' alors badge rouge + auto-creation rappel (type declaration_sociale)", "actor": "Systeme", "status": "en_retard", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("10 ECRAN 17 + 13.10", 660)},
        {"id": "WF-008-006", "action": "KPI Obj. 5 : 0 declaration en retard", "actor": "DRH", "status": "validee", "interface": "/domaine2_Gestion_Administrative_Personnel", "source": s("3 Objectif 5 + 14.1", 78)}
    ],
    "diagram": "flowchart TD\n  A([Saisie declaration]) --> B[Soumission organisme]\n  B --> C([soumise])\n  C --> D{date_echeance < NOW et non soumise?}\n  D -->|Oui, cron| E([en_retard])\n  D -->|Non| F{Organisme valide?}\n  E --> G[Badge rouge + auto-rappel]\n  F -->|Oui| H([validee])\n  F -->|Non| C\n  G --> I{KPI Obj.5 = 0 en retard?}\n  H --> I\n  I -->|Oui| J([OK])\n  I -->|Non| K([Alerte critique TdB])"
})

# WF-009 : Sanction Disciplinaire
workflows.append({
    "id": "WF-009",
    "name": "Sanction Disciplinaire",
    "description": "Procedure disciplinaire complete conforme au droit du travail : constat → verification → convocation (5j min) → entretien → notification (voies de recours) → validation DRH → execution.",
    "actors": ["Manager Hierarchique", "Responsable Admin RH", "DRH", "Employe"],
    "steps": [
        {"id": "WF-009-001", "action": "Constat de la faute (par manager ou RH)", "actor": "Manager Hierarchique", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/sanctions", "source": s("11.7 procedure + 12.3", 924)},
        {"id": "WF-009-002", "action": "Verification des faits (audit, temoignages)", "actor": "Responsable Admin RH", "status": "en_verification", "interface": "/domaine2_Gestion_Administrative_Personnel/sanctions", "source": s("12.3 workflow sanctions", 997)},
        {"id": "WF-009-003", "action": "Convocation a entretien (delai legal ≥ 5 jours ouvres)", "actor": "Responsable Admin RH", "status": "convoque", "interface": "/domaine2_Gestion_Administrative_Personnel/sanctions", "source": s("11.7 etape 3 + 12.3", 1000)},
        {"id": "WF-009-004", "action": "Entretien + defense de l'employe", "actor": "Employe", "status": "en_entretien", "interface": "/domaine2_Gestion_Administrative_Personnel/sanctions", "source": s("12.3", 1003)},
        {"id": "WF-009-005", "action": "Notification sanction (mention voies de recours obligatoire)", "actor": "Responsable Admin RH", "status": "notifiee", "interface": "/domaine2_Gestion_Administrative_Personnel/sanctions", "source": s("11.7 etape 5 + 12.3", 1006)},
        {"id": "WF-009-006", "action": "Validation DRH (valide_par FK employees)", "actor": "DRH", "status": "validee", "interface": "/domaine2_Gestion_Administrative_Personnel/sanctions", "source": s("11.7 etape 7 + 5.2 RACI", 1009)},
        {"id": "WF-009-007", "action": "Execution (date_execution) puis suivi", "actor": "Responsable Admin RH", "status": "en_execution puis executee", "interface": "/domaine2_Gestion_Administrative_Personnel/sanctions", "source": s("12.3", 1012)}
    ],
    "diagram": "flowchart TD\n  A([Constat faute]) --> B([brouillon])\n  B --> C[Verification faits]\n  C --> D([en_verification])\n  D --> E[Convocation entretien 5j min]\n  E --> F([convoque])\n  F --> G[Entretien + defense]\n  G --> H([en_entretien])\n  H --> I[Notification + voies de recours]\n  I --> J([notifiee])\n  J --> K{DRH valide?}\n  K -->|Non| J\n  K -->|Oui| L([validee])\n  L --> M[Execution]\n  M --> N([executee])"
})

# WF-010 : Procedure de Depart
workflows.append({
    "id": "WF-010",
    "name": "Procedure de Depart",
    "description": "Procedure complete de depart (5 motifs) : notification → calcul solde → checklist documents → restitution materiel → offboarding IT → remise documents + solde → archivage.",
    "actors": ["Responsable Admin RH", "Assistant RH", "DRH", "Comptable Paie", "IT", "Employe"],
    "steps": [
        {"id": "WF-010-001", "action": "Notification du depart (lettre demission ou notification rupture)", "actor": "Employe", "status": "dossier_ouvert", "interface": "/domaine2_Gestion_Administrative_Personnel/departs", "source": s("11.8 + 12.4", 1017)},
        {"id": "WF-010-002", "action": "Calcul solde_conges + dernier_salaire + indemnite (par motif)", "actor": "Comptable Paie", "status": "en_calcul", "interface": "/domaine2_Gestion_Administrative_Personnel/departs", "source": s("13.6 formules indemnite", 1137)},
        {"id": "WF-010-003", "action": "Checklist documents a remettre (5 items obligatoires)", "actor": "Assistant RH", "status": "en_preparation", "interface": "/domaine2_Gestion_Administrative_Personnel/departs", "source": s("11.8 etape 6", 936)},
        {"id": "WF-010-004", "action": "Restitution materiel (badge, ordinateur, vehicule) - 100% obligatoire", "actor": "Employe", "status": "en_attente_restitution", "interface": "/domaine2_Gestion_Administrative_Personnel/departs", "source": s("11.8 etape 7", 937)},
        {"id": "WF-010-005", "action": "Desactivation acces IT (offboarding)", "actor": "IT", "status": "it_offboarding", "interface": "/domaine2_Gestion_Administrative_Personnel/departs", "source": s("11.8 etape 8 + 12.4", 1029)},
        {"id": "WF-010-006", "action": "Remise documents + versement solde de tout compte", "actor": "Comptable Paie", "status": "remis", "interface": "/domaine2_Gestion_Administrative_Personnel/departs", "source": s("12.4 workflow depart", 1032)},
        {"id": "WF-010-007", "action": "Archivage automatique du dossier (5 ans)", "actor": "Systeme", "status": "clos", "interface": "/domaine2_Gestion_Administrative_Personnel/archivage", "source": s("11.8 etape 9 + 12.4", 1035)}
    ],
    "diagram": "flowchart TD\n  A([Notification depart]) --> B([dossier_ouvert])\n  B --> C[Calcul solde + indemnite]\n  C --> D([en_calcul])\n  D --> E[Checklist 5 documents]\n  E --> F([en_preparation])\n  F --> G[Restitution materiel 100%]\n  G --> H([en_attente_restitution])\n  H --> I[Offboarding IT]\n  I --> J([it_offboarding])\n  J --> K[Remise docs + versement STC]\n  K --> L([remis])\n  L --> M[Archivage auto 5 ans]\n  M --> N([clos])"
})

# WF-011 : Demande de Pret
workflows.append({
    "id": "WF-011",
    "name": "Demande de Pret",
    "description": "Demande de pret (3 types) avec calculateur de mensualite (amortissement constant) + validation DRH + deduction auto en paie + passage a 'solde' quand remboursement termine.",
    "actors": ["Employe", "DRH", "Comptable Paie"],
    "steps": [
        {"id": "WF-011-001", "action": "Saisie demande (type, montant_demande, taux_interet, duree_mois)", "actor": "Employe", "status": "demande", "interface": "/domaine2_Gestion_Administrative_Personnel/prets", "source": s("10 ECRAN 18 + 12.5", 666)},
        {"id": "WF-011-002", "action": "Calculateur mensualite (amortissement constant) + cas taux 0%", "actor": "Systeme", "status": "demande", "interface": "/domaine2_Gestion_Administrative_Personnel/prets", "source": s("13.5 formules prets", 1131)},
        {"id": "WF-011-003", "action": "Validation DRH (accorde ou refuse)", "actor": "DRH", "status": "accorde OU refuse", "interface": "/domaine2_Gestion_Administrative_Personnel/prets", "source": s("12.5 + 5.2 RACI", 1043)},
        {"id": "WF-011-004", "action": "Debut remboursement (date_debut_remboursement)", "actor": "Comptable Paie", "status": "en_remboursement", "interface": "/domaine2_Gestion_Administrative_Personnel/prets", "source": s("12.5", 1046)},
        {"id": "WF-011-005", "action": "Deduction mensuelle auto dans la paie (mensualite)", "actor": "Systeme", "status": "en_remboursement", "interface": "/domaine2_Gestion_Administrative_Personnel/paie", "source": s("11.7 + 13.5", 921)},
        {"id": "WF-011-006", "action": "Si solde_restant = 0 alors auto-bascule a 'solde'", "actor": "Systeme", "status": "solde", "interface": "/domaine2_Gestion_Administrative_Personnel/prets", "source": s("12.5", 1051)}
    ],
    "diagram": "flowchart TD\n  A([Demande employe]) --> B[Calculateur mensualite]\n  B --> C([demande])\n  C --> D{DRH valide?}\n  D -->|Non| E([refuse])\n  D -->|Oui| F([accorde])\n  F --> G[Debut remboursement]\n  G --> H([en_remboursement])\n  H --> I[Deduction mensuelle paie]\n  I --> J{solde_restant = 0?}\n  J -->|Non| I\n  J -->|Oui| K([solde])"
})

# WF-012 : Visite Medicale
workflows.append({
    "id": "WF-012",
    "name": "Visite Medicale",
    "description": "Visites medicales (4 types : embauche, periodique, reprise, demandee). 4 niveaux d'aptitude. Auto-creation visite de reprise si inapte_temporaire. Alerte rappel < 15j.",
    "actors": ["Assistant RH", "Medecin du travail", "Employe"],
    "steps": [
        {"id": "WF-012-001", "action": "Planification visite (type ∈ embauche / periodique / reprise / demandee)", "actor": "Assistant RH", "status": "planifiee", "interface": "/domaine2_Gestion_Administrative_Personnel/visites-medicales", "source": s("10 ECRAN 20 + 12.8", 1082)},
        {"id": "WF-012-002", "action": "Realisation de la visite", "actor": "Medecin du travail", "status": "realisee", "interface": "/domaine2_Gestion_Administrative_Personnel/visites-medicales", "source": s("12.8", 1085)},
        {"id": "WF-012-003", "action": "Saisie resultat + aptitude (4 niveaux) + restrictions + cout", "actor": "Medecin du travail", "status": "completee", "interface": "/domaine2_Gestion_Administrative_Personnel/visites-medicales", "source": s("12.8", 1088)},
        {"id": "WF-012-004", "action": "Si aptitude='inapte_temporaire' alors auto-creation visite de reprise a +30 jours", "actor": "Systeme", "status": "completee", "interface": "/domaine2_Gestion_Administrative_Personnel/visites-medicales", "source": s("12.8", 1090)},
        {"id": "WF-012-005", "action": "Calcul date_prochaine_visite (visite periodique = +12 mois)", "actor": "Systeme", "status": "completee", "interface": "/domaine2_Gestion_Administrative_Personnel/visites-medicales", "source": s("11.6", 912)},
        {"id": "WF-012-006", "action": "Si date_prochaine_visite - NOW() ≤ 15j alors auto-creation rappel (type visite_medicale)", "actor": "Systeme", "status": "completee", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10 + 17.6 trigger", 1181)}
    ],
    "diagram": "flowchart TD\n  A([Planification visite]) --> B([planifiee])\n  B --> C[Realisation visite]\n  C --> D([realisee])\n  D --> E[Saisie resultat + aptitude]\n  E --> F([completee])\n  F --> G{aptitude?}\n  G -->|apte| H[Calcul date prochaine +12 mois]\n  G -->|apte_avec_restrictions| H\n  G -->|inapte_temporaire| I[Auto-creation visite reprise +30j]\n  G -->|inapte_definitif| J[Alerte critique RH + paie]\n  I --> H\n  H --> K{prochaine ≤ 15j?}\n  K -->|Oui| L[Auto-creation rappel]\n  K -->|Non| M([Fin])\n  L --> M"
})

# WF-013 : Archivage Documentaire
workflows.append({
    "id": "WF-013",
    "name": "Archivage Documentaire",
    "description": "Archivage documentaire avec durees de conservation 1/3/5 ans selon le type. Verrouillage lecture seule (gate Phase 5). Audit interne annuel.",
    "actors": ["Assistant RH", "Responsable Admin RH", "Auditeur Interne"],
    "steps": [
        {"id": "WF-013-001", "action": "Selection du document a archiver (depuis documents, departs, etc.)", "actor": "Assistant RH", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/archivage", "source": s("10 ECRAN 22 + 11.8", 749)},
        {"id": "WF-013-002", "action": "Attribution duree_conservation (1/3/5 ans selon type_document, auto-suggestion)", "actor": "Systeme", "status": "brouillon", "interface": "/domaine2_Gestion_Administrative_Personnel/archivage", "source": s("10 ECRAN 22 regles", 753)},
        {"id": "WF-013-003", "action": "Choix lieu_stockage (Archive numerique RH / Archive physique Salle B)", "actor": "Responsable Admin RH", "status": "archive", "interface": "/domaine2_Gestion_Administrative_Personnel/archivage", "source": s("8.1 + 11.8", 285)},
        {"id": "WF-013-004", "action": "Verrouillage lecture seule (gate Phase 5 irreversible)", "actor": "Systeme", "status": "archive_lock", "interface": "/domaine2_Gestion_Administrative_Personnel/archivage", "source": s("7 regles de basculement Phase 5", 265)},
        {"id": "WF-013-005", "action": "Tracabilite : responsable + date archive + observations", "actor": "Responsable Admin RH", "status": "archive_lock", "interface": "/domaine2_Gestion_Administrative_Personnel/archivage", "source": s("8.1 table d02_document_archives", 285)},
        {"id": "WF-013-006", "action": "Audit interne annuel (verification durees de conservation respectees)", "actor": "Auditeur Interne", "status": "audite", "interface": "/domaine2_Gestion_Administrative_Personnel/archivage", "source": s("4.2 audits internes", 100)}
    ],
    "diagram": "flowchart TD\n  A([Selection document a archiver]) --> B[Auto-suggestion duree selon type]\n  B --> C[Choix lieu_stockage]\n  C --> D([archive])\n  D --> E[Verrouillage lecture seule Phase 5]\n  E --> F([archive_lock irreversible])\n  F --> G[Tracabilite responsable + date]\n  G --> H{Audit annuel?}\n  H -->|OK| I([audite conforme])\n  H -->|NC| J([Non-conformite])"
})

# WF-014 : Generation automatique de Rappels
workflows.append({
    "id": "WF-014",
    "name": "Generation automatique de Rappels",
    "description": "Generation automatique de rappels par triggers SQL et cron quotidien. 5 sources (documents, contrats, essai, visites medicales, declarations).",
    "actors": ["Systeme (triggers / cron)", "Responsable Admin RH", "Assistant RH"],
    "steps": [
        {"id": "WF-014-001", "action": "Trigger sur d02_employee_documents : si jours ≤ 30 alors INSERT rappel (type expiration_document)", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10 + 17.6 trigger 3", 1177)},
        {"id": "WF-014-002", "action": "Trigger sur d02_work_permits : si jours ≤ 30 alors INSERT rappel (type expiration_document)", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10", 1178)},
        {"id": "WF-014-003", "action": "Trigger sur d02_contracts : si jours ≤ 30 alors INSERT rappel (type renouvellement_contrat)", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10", 1179)},
        {"id": "WF-014-004", "action": "Trigger sur d02_contracts essai : si echeance periode essai ≤ 7j alors INSERT rappel (type echeance_periode_essai)", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10", 1180)},
        {"id": "WF-014-005", "action": "Trigger sur d02_medical_visits : si date_prochaine ≤ NOW()+15j alors INSERT rappel (type visite_medicale)", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10", 1181)},
        {"id": "WF-014-006", "action": "Trigger sur d02_social_declarations : si date_echeance ≤ NOW()+7j alors INSERT rappel (type declaration_sociale)", "actor": "Systeme", "status": "en_attente", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("13.10", 1182)},
        {"id": "WF-014-007", "action": "Cron quotidien 00h00 : bascule 'en_retard' si date_echeance < NOW() et statut='en_attente'", "actor": "Systeme", "status": "en_retard", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("17.6 trigger 6 + 13.9", 1482)},
        {"id": "WF-014-008", "action": "Traitement par responsable_suivi (realisation action_requise) → 'traite'", "actor": "Responsable Admin RH", "status": "traite", "interface": "/domaine2_Gestion_Administrative_Personnel/rappels", "source": s("11.9 + 10 ECRAN 22b", 778)}
    ],
    "diagram": "flowchart TD\n  subgraph Sources\n    A1[d02_employee_documents ≤ 30j]\n    A2[d02_work_permits ≤ 30j]\n    A3[d02_contracts ≤ 30j]\n    A4[d02_contracts essai ≤ 7j]\n    A5[d02_medical_visits ≤ 15j]\n    A6[d02_social_declarations ≤ 7j]\n  end\n  A1 --> B[INSERT rappel en_attente]\n  A2 --> B\n  A3 --> B\n  A4 --> B\n  A5 --> B\n  A6 --> B\n  B --> C{Cron quotidien 00h00}\n  C --> D{date_echeance < NOW?}\n  D -->|Oui| E([en_retard])\n  D -->|Non| F([en_attente])\n  E --> G[Traitement responsable_suivi]\n  F --> G\n  G --> H([traite])"
})

# WF-015 : Cycle PDCA trimestriel
workflows.append({
    "id": "WF-015",
    "name": "Cycle PDCA trimestriel",
    "description": "Cycle PDCA (Plan-Do-Check-Act) de Deming. Revue trimestrielle de direction. Detection et traitement des non-conformites (5 Pourquoi / Ishikawa). Conformite ISO 9001 §9.2 + §9.3.",
    "actors": ["DRH", "Responsable Admin RH", "Auditeur Interne", "Direction Generale"],
    "steps": [
        {"id": "WF-015-001", "action": "PLAN : Definition objectifs + KPIs cibles (annuel + trimestriel)", "actor": "DRH", "status": "plan", "interface": "/domaine2_Gestion_Administrative_Personnel/pdca", "source": s("4 cycle PDCA + 10 ECRAN 23", 88)},
        {"id": "WF-015-002", "action": "DO : Mise en oeuvre des procedures (quotidien, 22 feuilles)", "actor": "Responsable Admin RH", "status": "do", "interface": "/domaine2_Gestion_Administrative_Personnel", "source": s("4 cycle PDCA", 91)},
        {"id": "WF-015-003", "action": "CHECK : Audit interne semestriel + analyse KPIs trimestrielle", "actor": "Auditeur Interne", "status": "check", "interface": "/domaine2_Gestion_Administrative_Personnel/non-conformites", "source": s("4.2 audits internes + 4 cycle PDCA", 100)},
        {"id": "WF-015-004", "action": "Detection non-conformites → enregistrement dans registre d02_non_conformities", "actor": "Auditeur Interne", "status": "check", "interface": "/domaine2_Gestion_Administrative_Personnel/non-conformites", "source": s("4.3 traitement NC + 8.3 table", 108)},
        {"id": "WF-015-005", "action": "Analyse cause racine (methode 5 Pourquoi ou Ishikawa)", "actor": "Responsable Admin RH", "status": "check", "interface": "/domaine2_Gestion_Administrative_Personnel/non-conformites", "source": s("4.3 traitement NC", 113)},
        {"id": "WF-015-006", "action": "ACT : Mise en oeuvre actions correctives + maj procedures", "actor": "DRH", "status": "act", "interface": "/domaine2_Gestion_Administrative_Personnel/pdca", "source": s("4 cycle PDCA + 10 ECRAN 23", 93)},
        {"id": "WF-015-007", "action": "Revue de direction trimestrielle (compte-rendu documente)", "actor": "Direction Generale", "status": "act", "interface": "/domaine2_Gestion_Administrative_Personnel/pdca", "source": s("4.1 revues de direction", 95)},
        {"id": "WF-015-008", "action": "Verification de l'efficacite des actions → feedback vers nouveau PLAN", "actor": "Auditeur Interne", "status": "plan", "interface": "/domaine2_Gestion_Administrative_Personnel/pdca", "source": s("4.3 etape 6 verification", 116)}
    ],
    "diagram": "flowchart TD\n  A([PLAN: objectifs + KPIs]) --> B[DO: execution quotidienne]\n  B --> C[CHECK: audit semestriel + KPIs trimestriel]\n  C --> D{NC detectee?}\n  D -->|Oui| E[Enregistrement registre NC]\n  D -->|Non| K([Conforme])\n  E --> F[Analyse cause racine 5P/Ishikawa]\n  F --> G[ACT: actions correctives + maj procedures]\n  G --> H[Revue direction trimestrielle]\n  H --> I{Efficacite verifiee?}\n  I -->|Oui| A\n  I -->|Non| G\n  K --> H"
})

# ============================================================
# Construction de l'objet final workflows
# ============================================================

workflows_obj = {
    "metadata": {
        "version": "1.0",
        "date": "2026-09-02",
        "source": [
            V2,
            DATA
        ],
        "conformite": "ISO 30401:2018 + ISO 9001:2015 (cycle PDCA §9.2 + §9.3)",
        "domaine": "D2 - Gestion Administrative du Personnel",
        "workflows_count": len(workflows)
    },
    "workflows": workflows
}

# ============================================================
# Ecriture des fichiers JSON
# ============================================================

out_dir = Path("/home/z/my-project/work-admina/docs/phase0")
out_dir.mkdir(parents=True, exist_ok=True)

regles_path = out_dir / "regles_metier.json"
wf_path = out_dir / "workflows.json"

with open(regles_path, "w", encoding="utf-8") as f:
    json.dump(regles_metier, f, ensure_ascii=False, indent=2)

with open(wf_path, "w", encoding="utf-8") as f:
    json.dump(workflows_obj, f, ensure_ascii=False, indent=2)

# ============================================================
# Stats + verification rapide
# ============================================================

print(f"regles_metier.json  : {regles_path}")
print(f"  - modules        : {len(modules)}")
print(f"  - regles total   : {sum(len(m['regles']) for m in modules)}")
print(f"  - taille fichier : {regles_path.stat().st_size} octets")
print()
print(f"workflows.json      : {wf_path}")
print(f"  - workflows      : {len(workflows)}")
print(f"  - steps total    : {sum(len(w['steps']) for w in workflows)}")
print(f"  - taille fichier : {wf_path.stat().st_size} octets")
print()
print("OK : 2 fichiers JSON generes.")
