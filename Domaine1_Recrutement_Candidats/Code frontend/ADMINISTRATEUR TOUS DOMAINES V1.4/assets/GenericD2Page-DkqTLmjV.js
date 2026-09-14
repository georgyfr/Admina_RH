import { r as e } from "./rolldown-runtime-hePW80VL.js";
import { Ot as t, bt as n, i as r, n as i, t as a } from "./Box-CHFloNRC.js";
import { t as o } from "./Stack-Cy3ghQhp.js";
import { t as s } from "./MenuItem-B8KY7-EM.js";
import { t as c } from "./Alert-DHjcum1A.js";
import { t as l } from "./Button-BQQgqhbv.js";
import { n as ee, t as u } from "./CardContent-DnvVPajD.js";
import { t as d } from "./Snackbar-BKYfOLsX.js";
import { i as f, n as p, r as m, t as h } from "./DialogTitle-BqcuQvp9.js";
import { t as g } from "./TablePagination-DUk1RJcj.js";
import { a as _, i as v, n as te, o as ne, r as y, t as b } from "./TableRow-BqEqVmYd.js";
import { t as x } from "./Add-CqKjp1fE.js";
import { t as S } from "./Download-ZXrHscdk.js";
import { t as C } from "./Visibility-DN-pE9Uf.js";
import { t as w } from "./WarningAmber-B5bERzOj.js";
import { L as T, S as E, b as D, q as O, s as k } from "./index-5-yT4YcR.js";
import {
  $ as A,
  C as j,
  D as M,
  F as N,
  L as P,
  M as F,
  N as I,
  P as L,
  Q as R,
  S as z,
  Z as B,
  _ as V,
  b as H,
  g as U,
  m as W,
  o as G,
  v as K,
} from "./data-DKlDykqN.js";
import { a as q, i as J, n as Y, r as X, t as Z } from "./components-jUwzSD7P.js";
import { p as CG } from "./data-DKlDykqN.js";
import { t as RF } from "./Autorenew-p6citdTw.js";
import { t as AU } from "./ArrowUpward-DS2b_CnH.js";
import { t as AD } from "./ArrowDownward-ypDSPS8N.js";
import { t as CT } from "./CalendarToday-DmfkOBZI.js";
import { t as AS2 } from "./Assessment-rn0S5uJR.js";
import { t as AB } from "./AccountBalanceWallet-j86C9uBL.js";
import { t as AT } from "./AccessTime-znnVq312.js";
import { t as HSA } from "./HealthAndSafety-rj08z02O.js";
import { t as PYC } from "./Payments-DG2h2GSU.js";
import { t as HEA } from "./HourglassEmpty-HIf4jpB0.js";
import { t as SCH } from "./Schedule-C7p8NDIg.js";
import { t as RCPT } from "./ReceiptLong-tLozChDd.js";
import { t as GVL } from "./Gavel-D87BpYZK.js";
var Q = e(t(), 1),
  $ = n(),
  re = {
    avenants: {
      title: `Avenants de contrat`,
      subtitle: `Modifications contractuelles (salaire, poste, temps partiel) — traçabilité audit`,
      columns: [
        { key: `amendment_number`, label: `N° Avenant` },
        {
          key: `contract`,
          label: `Contrat`,
          render: (e) => {
            let t = W.find((t) => t.id === e.contract_id);
            return t ? t.contract_number : e.contract_id;
          },
        },
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `date_avenant`, label: `Date`, render: (e) => A(e.date_avenant) },
        {
          key: `type_modification`,
          label: `Type`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.type_modification,
              size: `small`,
              color:
                e.type_modification === `Salaire` ? `success` : e.type_modification === `Poste` ? `primary` : `warning`,
              variant: `outlined`,
            }),
        },
        { key: `ancienne_valeur`, label: `Ancienne valeur` },
        {
          key: `nouvelle_valeur`,
          label: `Nouvelle valeur`,
          render: (e) =>
            (0, $.jsx)(i, {
              variant: `caption`,
              fontWeight: 700,
              sx: { color: e.type_modification === `Salaire` ? `success.main` : `primary.main` },
              children: e.nouvelle_valeur,
            }),
        },
        { key: `motif`, label: `Motif` },
        { key: `date_effet`, label: `Date effet`, render: (e) => A(e.date_effet) },
        { key: `statut`, label: `Statut`, render: (e) => (0, $.jsx)(q, { status: e.statut }) },
      ],
      data: G,
      canCreate: !0,
      canExport: !0,
    },
    documents: {
      title: `Suivi des documents`,
      subtitle: `Alertes expiration · déclenche rappels auto si < 15 jours`,
      alert: (e) => {
        let t = e.filter((e) => e.statut === `Expire` || e.statut === `A renouveler`);
        return t.length > 0 ? `${t.length} document(s) à renouveler ou expiré(s)` : null;
      },
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        {
          key: `type_document`,
          label: `Type`,
          render: (e) => (0, $.jsx)(T, { label: e.type_document, size: `small`, variant: `outlined` }),
        },
        {
          key: `numero_document`,
          label: `N° Document`,
          render: (e) =>
            (0, $.jsx)(i, { variant: `caption`, sx: { fontFamily: `monospace` }, children: e.numero_document }),
        },
        { key: `date_emission`, label: `Émission`, render: (e) => A(e.date_emission) },
        { key: `date_expiration`, label: `Expiration`, render: (e) => A(e.date_expiration) },
        { key: `jours`, label: `Jours restants`, render: (e) => (0, $.jsx)(Z, { date: e.date_expiration }) },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_document[e.statut] }),
        },
        { key: `lieu_depot`, label: `Lieu dépôt` },
      ],
      data: K,
    },
    bancaires: {
      title: `Données bancaires`,
      subtitle: `RIB masqué partiellement (****1234) — sécurité RGPD`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `banque`, label: `Banque` },
        { key: `agence`, label: `Agence` },
        {
          key: `rib`,
          label: `RIB`,
          render: (e) =>
            (0, $.jsxs)(i, {
              variant: `caption`,
              sx: { fontFamily: `monospace` },
              children: [`****`, e.rib?.slice(-4) || `****`],
            }),
        },
        {
          key: `is_principal`,
          label: `Principal`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.is_principal ? `Oui` : `Non`,
              size: `small`,
              color: e.is_principal ? `success` : `default`,
              variant: `outlined`,
            }),
        },
        { key: `statut`, label: `Statut`, render: (e) => (0, $.jsx)(q, { status: e.statut }) },
      ],
      data: [
        {
          id: `b1`,
          employee_id: `emp-001`,
          banque: `Afriland First Bank`,
          agence: `Bonanjo`,
          rib: `3000100001203456789012`,
          is_principal: !0,
          statut: `Actif`,
        },
        {
          id: `b2`,
          employee_id: `emp-002`,
          banque: `BICEC`,
          agence: `Bastos`,
          rib: `3000200002301456789012`,
          is_principal: !0,
          statut: `Actif`,
        },
        {
          id: `b3`,
          employee_id: `emp-003`,
          banque: `SGBC`,
          agence: `Akwa`,
          rib: `3000300003402567890123`,
          is_principal: !0,
          statut: `Actif`,
        },
        {
          id: `b4`,
          employee_id: `emp-004`,
          banque: `UBA`,
          agence: `Bonapriso`,
          rib: `3000400004503678901234`,
          is_principal: !0,
          statut: `A verifier`,
        },
      ],
    },
    mutuelle: {
      title: `Mutuelle & prévoyance`,
      subtitle: `Adhésions, couverture, cotisations`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `organisme`, label: `Organisme` },
        {
          key: `numero_adherent`,
          label: `N° Adhérent`,
          render: (e) =>
            (0, $.jsx)(i, { variant: `caption`, sx: { fontFamily: `monospace` }, children: e.numero_adherent }),
        },
        { key: `date_adhesion`, label: `Adhésion`, render: (e) => A(e.date_adhesion) },
        {
          key: `couverture`,
          label: `Couverture`,
          render: (e) => (0, $.jsx)(T, { label: e.couverture, size: `small`, variant: `outlined` }),
        },
        {
          key: `cotisation_mensuelle`,
          label: `Cotis. mensuelle`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.cotisation_mensuelle }),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_adhesion?.[e.statut] || e.statut }),
        },
      ],
      data: [
        {
          id: `m1`,
          employee_id: `emp-001`,
          organisme: `ACTIVA Assurances`,
          numero_adherent: `ACT-001`,
          date_adhesion: `2019-01-20`,
          couverture: `Familiale`,
          cotisation_mensuelle: 15e3,
          statut: `Active`,
        },
        {
          id: `m2`,
          employee_id: `emp-002`,
          organisme: `SUNU Vie`,
          numero_adherent: `SUN-002`,
          date_adhesion: `2020-03-10`,
          couverture: `Individuelle`,
          cotisation_mensuelle: 8e3,
          statut: `Active`,
        },
        {
          id: `m3`,
          employee_id: `emp-003`,
          organisme: `Saham Assurance`,
          numero_adherent: `SAH-003`,
          date_adhesion: `2018-06-15`,
          couverture: `Familiale`,
          cotisation_mensuelle: 18e3,
          statut: `Active`,
        },
        {
          id: `m4`,
          employee_id: `emp-008`,
          organisme: `AXA Cameroun`,
          numero_adherent: `AXA-008`,
          date_adhesion: `2024-02-05`,
          couverture: `Individuelle`,
          cotisation_mensuelle: 1e4,
          statut: `Active`,
        },
      ],
    },
    permis: {
      title: `Autorisations & permis`,
      subtitle: `Permis travail, carte séjour, visa — alertes expiration`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        {
          key: `type_permit`,
          label: `Type`,
          render: (e) => (0, $.jsx)(T, { label: e.type_permit, size: `small`, variant: `outlined` }),
        },
        {
          key: `numero_permit`,
          label: `N° Permis`,
          render: (e) =>
            (0, $.jsx)(i, { variant: `caption`, sx: { fontFamily: `monospace` }, children: e.numero_permit }),
        },
        { key: `date_delivrance`, label: `Délivrance`, render: (e) => A(e.date_delivrance) },
        { key: `date_expiration`, label: `Expiration`, render: (e) => A(e.date_expiration) },
        { key: `jours`, label: `Jours restants`, render: (e) => (0, $.jsx)(Z, { date: e.date_expiration }) },
        { key: `autorite`, label: `Autorité` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_permit[e.statut] }),
        },
      ],
      data: [
        {
          id: `p1`,
          employee_id: `emp-008`,
          type_permit: `Carte sejour`,
          numero_permit: `CS-2024-008`,
          date_delivrance: `2024-01-10`,
          date_expiration: `2025-10-10`,
          autorite: `DGSN`,
          statut: `A renouveler`,
        },
        {
          id: `p2`,
          employee_id: `emp-015`,
          type_permit: `Permis travail`,
          numero_permit: `PT-2021-015`,
          date_delivrance: `2021-01-20`,
          date_expiration: `2026-01-20`,
          autorite: `MINTSS`,
          statut: `Valide`,
        },
      ],
    },
    soldes: {
      title: `Soldes de congés 2025`,
      subtitle: `218 VLOOKUP + 648 COUNTIF Excel → SQL JOIN + SUM FILTER`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        {
          key: `droit_annuel_jours`,
          label: `Droit annuel`,
          align: `right`,
          render: (e) => `${e.droit_annuel_jours} j`,
        },
        { key: `conges_pris_jours`, label: `Pris`, align: `right`, render: (e) => `${e.conges_pris_jours} j` },
        { key: `conges_en_cours`, label: `En cours`, align: `right`, render: (e) => `${e.conges_en_cours} j` },
        {
          key: `solde_disponible`,
          label: `Solde disponible`,
          align: `right`,
          render: (e) =>
            (0, $.jsxs)(i, {
              variant: `body2`,
              fontWeight: 700,
              sx: { color: e.solde_disponible < 5 ? `error.main` : `success.main` },
              children: [e.solde_disponible, ` j`],
            }),
        },
        {
          key: `taux_utilisation`,
          label: `Taux utilisation`,
          render: (e) => (0, $.jsx)(X, { value: e.taux_utilisation, max: 100, label: `${e.taux_utilisation}%` }),
        },
      ],
      data: N,
    },
    absences: {
      title: `Absences maladie`,
      subtitle: `Workflow: déclaration → upload justificatif → validation manager → visite reprise si > 3j`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        {
          key: `type_absence`,
          label: `Type`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: j.type_absence?.[e.type_absence] || e.type_absence,
              size: `small`,
              variant: `outlined`,
            }),
        },
        { key: `date_debut`, label: `Du`, render: (e) => A(e.date_debut) },
        { key: `date_fin`, label: `Au`, render: (e) => A(e.date_fin) },
        { key: `duree_jours`, label: `Durée`, align: `right`, render: (e) => `${e.duree_jours} j` },
        { key: `motif`, label: `Motif` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_absence?.[e.statut] }),
        },
      ],
      data: [
        {
          id: `a1`,
          employee_id: `emp-003`,
          type_absence: `maladie`,
          date_debut: `2025-09-15`,
          date_fin: `2025-09-20`,
          duree_jours: 6,
          motif: `Paludisme`,
          statut: `justifiee`,
        },
        {
          id: `a2`,
          employee_id: `emp-010`,
          type_absence: `absence_non_justifiee`,
          date_debut: `2025-08-20`,
          date_fin: `2025-08-21`,
          duree_jours: 2,
          motif: `Non signalé`,
          statut: `non_justifiee`,
        },
        {
          id: `a3`,
          employee_id: `emp-017`,
          type_absence: `accident_travail`,
          date_debut: `2025-07-10`,
          date_fin: `2025-07-25`,
          duree_jours: 16,
          motif: `Brûlure main`,
          statut: `justifiee`,
        },
      ],
    },
    "heures-supp": {
      title: `Heures supplémentaires`,
      subtitle: `Validation manager OBLIGATOIRE avant intégration paie · Taux: 100% / 125% / 150%`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `semaine`, label: `Semaine` },
        { key: `heures_normales`, label: `Heures normales`, align: `right`, render: (e) => `${e.heures_normales}h` },
        {
          key: `heures_supp`,
          label: `Heures supp.`,
          align: `right`,
          render: (e) =>
            (0, $.jsx)(T, { label: `${e.heures_supp}h`, size: `small`, color: `primary`, variant: `outlined` }),
        },
        {
          key: `taux_majoration`,
          label: `Taux`,
          render: (e) => (0, $.jsx)(T, { label: e.taux_majoration, size: `small`, variant: `outlined` }),
        },
        {
          key: `montant_calcule`,
          label: `Montant calculé`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.montant_calcule }),
        },
        { key: `valide_par`, label: `Validé par`, render: (e) => (e.valide_par ? B(R(e.valide_par)) : `—`) },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_heures[e.statut] }),
        },
      ],
      data: z,
    },
    pointage: {
      title: `Pointage de présence`,
      subtitle: `Saisie quotidienne → validation hebdo manager → export planning + paie`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `semaine`, label: `Semaine` },
        { key: `jours_presents`, label: `Présents`, align: `right` },
        { key: `jours_absents`, label: `Absents`, align: `right` },
        { key: `retards_minutes`, label: `Retards (min)`, align: `right` },
        {
          key: `taux_presence`,
          label: `Taux présence`,
          render: (e) => (0, $.jsx)(X, { value: e.taux_presence, max: 100, label: `${e.taux_presence}%` }),
        },
        { key: `statut`, label: `Statut`, render: (e) => (0, $.jsx)(q, { status: e.statut }) },
      ],
      data: [
        {
          id: `pt1`,
          employee_id: `emp-001`,
          semaine: `S37-2025`,
          jours_presents: 5,
          jours_absents: 0,
          retards_minutes: 0,
          taux_presence: 100,
          statut: `valide`,
        },
        {
          id: `pt2`,
          employee_id: `emp-003`,
          semaine: `S37-2025`,
          jours_presents: 4,
          jours_absents: 1,
          retards_minutes: 30,
          taux_presence: 80,
          statut: `valide`,
        },
        {
          id: `pt3`,
          employee_id: `emp-008`,
          semaine: `S37-2025`,
          jours_presents: 3,
          jours_absents: 2,
          retards_minutes: 0,
          taux_presence: 60,
          statut: `brouillon`,
        },
        {
          id: `pt4`,
          employee_id: `emp-014`,
          semaine: `S37-2025`,
          jours_presents: 5,
          jours_absents: 0,
          retards_minutes: 15,
          taux_presence: 100,
          statut: `valide`,
        },
      ],
    },
    planning: {
      title: `Planning mensuel`,
      subtitle: `Génération auto depuis pointage → validation manager → clôture mensuelle`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `mois`, label: `Mois` },
        { key: `jours_ouvrables`, label: `Ouvrables`, align: `right` },
        { key: `jours_presents`, label: `Présents`, align: `right` },
        { key: `jours_absents`, label: `Absents`, align: `right` },
        { key: `heures_supp`, label: `Heures supp.`, align: `right`, render: (e) => `${e.heures_supp}h` },
        {
          key: `taux_presence`,
          label: `Taux`,
          render: (e) => (0, $.jsx)(X, { value: e.taux_presence, max: 100, label: `${e.taux_presence}%` }),
        },
        { key: `statut`, label: `Statut`, render: (e) => (0, $.jsx)(q, { status: e.statut }) },
      ],
      data: [
        {
          id: `pl1`,
          employee_id: `emp-001`,
          mois: `2025-09`,
          jours_ouvrables: 22,
          jours_presents: 22,
          jours_absents: 0,
          heures_supp: 0,
          taux_presence: 100,
          statut: `valide`,
        },
        {
          id: `pl2`,
          employee_id: `emp-003`,
          mois: `2025-09`,
          jours_ouvrables: 22,
          jours_presents: 18,
          jours_absents: 4,
          heures_supp: 8,
          taux_presence: 82,
          statut: `brouillon`,
        },
        {
          id: `pl3`,
          employee_id: `emp-014`,
          mois: `2025-09`,
          jours_ouvrables: 22,
          jours_presents: 20,
          jours_absents: 2,
          heures_supp: 10,
          taux_presence: 91,
          statut: `brouillon`,
        },
      ],
    },
    paie: {
      title: `Fiches de paie`,
      subtitle: `KPI Obj. 3: 100% générées avant le 5 du mois · Génération: presence + congés + HS - prêts`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `mois`, label: `Mois` },
        { key: `salaire_brut`, label: `Brut`, align: `right`, render: (e) => (0, $.jsx)(Y, { value: e.salaire_brut }) },
        {
          key: `cotisations`,
          label: `Cotisations`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.cotisations }),
        },
        { key: `taux_charges`, label: `Taux`, align: `right`, render: (e) => `${e.taux_charges}%` },
        {
          key: `net_a_payer`,
          label: `Net à payer`,
          align: `right`,
          render: (e) =>
            (0, $.jsx)(i, {
              variant: `body2`,
              fontWeight: 700,
              sx: { fontFamily: `monospace` },
              children: (0, $.jsx)(Y, { value: e.net_a_payer }),
            }),
        },
        {
          key: `mode_paie`,
          label: `Mode`,
          render: (e) => (0, $.jsx)(T, { label: e.mode_paie, size: `small`, variant: `outlined` }),
        },
        { key: `statut`, label: `Statut`, render: (e) => (0, $.jsx)(q, { status: e.statut }) },
      ],
      data: [
        {
          id: `fp1`,
          employee_id: `emp-001`,
          mois: `2025-08`,
          salaire_brut: 125e4,
          cotisations: 312500,
          taux_charges: 25,
          net_a_payer: 937500,
          mode_paie: `Virement`,
          statut: `payee`,
        },
        {
          id: `fp2`,
          employee_id: `emp-002`,
          mois: `2025-08`,
          salaire_brut: 98e4,
          cotisations: 245e3,
          taux_charges: 25,
          net_a_payer: 735e3,
          mode_paie: `Virement`,
          statut: `payee`,
        },
        {
          id: `fp3`,
          employee_id: `emp-008`,
          mois: `2025-08`,
          salaire_brut: 45e4,
          cotisations: 112500,
          taux_charges: 25,
          net_a_payer: 337500,
          mode_paie: `Cheque`,
          statut: `validee`,
        },
        {
          id: `fp4`,
          employee_id: `emp-013`,
          mois: `2025-08`,
          salaire_brut: 8e4,
          cotisations: 12e3,
          taux_charges: 15,
          net_a_payer: 68e3,
          mode_paie: `Especes`,
          statut: `generee`,
        },
      ],
    },
    declarations: {
      title: `Déclarations sociales`,
      subtitle: `KPI Obj. 5: 0 déclaration en retard · CNPS, Impôts, MINTSS`,
      alert: (e) => {
        let t = e.filter((e) => e.statut === `en_retard`);
        return t.length > 0 ? `${t.length} déclaration(s) en retard — action urgente` : null;
      },
      columns: [
        {
          key: `organisme`,
          label: `Organisme`,
          render: (e) => (0, $.jsx)(T, { label: e.organisme, size: `small`, color: `primary`, variant: `outlined` }),
        },
        { key: `type_declaration`, label: `Type` },
        { key: `periode`, label: `Période` },
        { key: `montant`, label: `Montant`, align: `right`, render: (e) => (0, $.jsx)(Y, { value: e.montant }) },
        {
          key: `date_soumission`,
          label: `Soumise le`,
          render: (e) => (e.date_soumission ? A(e.date_soumission) : `—`),
        },
        { key: `date_echeance`, label: `Échéance`, render: (e) => A(e.date_echeance) },
        { key: `nombre_salaries`, label: `Salariés`, align: `right` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_declaration[e.statut] }),
        },
      ],
      data: U,
    },
    prets: {
      title: `Prêts & avances`,
      subtitle: `Calculateur mensualité: M = (P × r/12) / (1 - (1+r/12)^-n) · Déductions auto en paie`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        {
          key: `type_pret`,
          label: `Type`,
          render: (e) => (0, $.jsx)(T, { label: j.type_pret[e.type_pret], size: `small`, variant: `outlined` }),
        },
        {
          key: `montant_accorde`,
          label: `Montant`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.montant_accorde }),
        },
        { key: `taux_interet`, label: `Taux`, align: `right`, render: (e) => `${e.taux_interet}%` },
        {
          key: `mensualite`,
          label: `Mensualité`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.mensualite }),
        },
        { key: `duree_mois`, label: `Durée`, align: `right`, render: (e) => `${e.duree_mois} mois` },
        {
          key: `solde_restant`,
          label: `Solde restant`,
          render: (e) =>
            (0, $.jsx)(X, {
              value: e.montant_accorde - e.solde_restant,
              max: e.montant_accorde,
              label: (0, $.jsx)(Y, { value: e.solde_restant }),
            }),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_pret[e.statut] }),
        },
      ],
      data: F,
    },
    sanctions: {
      title: `Sanctions disciplinaires`,
      subtitle: `4 niveaux: oral → écrit → blâme → suspension · Procédure légale (convocation 5j min)`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        {
          key: `type_sanction`,
          label: `Type`,
          render: (e) => {
            let t =
              e.type_sanction === `avertissement_oral` || e.type_sanction === `avertissement_ecrit`
                ? `warning`
                : (e.type_sanction, `error`);
            return (0, $.jsx)(T, {
              label: j.type_sanction[e.type_sanction],
              size: `small`,
              color: t,
              variant: `outlined`,
            });
          },
        },
        { key: `faute_commise`, label: `Faute` },
        { key: `date_faute`, label: `Date faute`, render: (e) => A(e.date_faute) },
        { key: `date_notification`, label: `Notification`, render: (e) => A(e.date_notification) },
        {
          key: `duree_suspension_jours`,
          label: `Suspension`,
          align: `right`,
          render: (e) => (e.duree_suspension_jours ? `${e.duree_suspension_jours} j` : `—`),
        },
        { key: `valide_par`, label: `Validé par`, render: (e) => B(R(e.valide_par)) },
        { key: `statut`, label: `Statut`, render: (e) => (0, $.jsx)(q, { status: e.statut }) },
      ],
      data: L,
    },
    "visites-medicales": {
      title: `Visites médicales`,
      subtitle: `4 types: embauche, périodique, reprise, demandée · 4 niveaux aptitude`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        {
          key: `type_visite`,
          label: `Type`,
          render: (e) => (0, $.jsx)(T, { label: j.type_visite[e.type_visite], size: `small`, variant: `outlined` }),
        },
        { key: `medecin_structure`, label: `Médecin/Structure` },
        { key: `date_visite`, label: `Visite`, render: (e) => A(e.date_visite) },
        {
          key: `date_prochaine_visite`,
          label: `Prochaine`,
          render: (e) => (0, $.jsx)(Z, { date: e.date_prochaine_visite }),
        },
        {
          key: `aptitude`,
          label: `Aptitude`,
          render: (e) => (0, $.jsx)(q, { status: e.aptitude, label: j.aptitude[e.aptitude] }),
        },
        { key: `cout`, label: `Coût`, align: `right`, render: (e) => (0, $.jsx)(Y, { value: e.cout }) },
      ],
      data: P,
    },
    departs: {
      title: `Dossiers de départs`,
      subtitle: `Checklist complète: attestation, certificat, solde tout compte, restitution matériel`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `date_depart`, label: `Date départ`, render: (e) => A(e.date_depart) },
        {
          key: `motif_depart`,
          label: `Motif`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: j.motif_depart[e.motif_depart],
              size: `small`,
              color: e.motif_depart === `licenciement` ? `error` : `default`,
              variant: `outlined`,
            }),
        },
        {
          key: `solde_conges_jours`,
          label: `Solde congés`,
          align: `right`,
          render: (e) => `${e.solde_conges_jours} j`,
        },
        {
          key: `dernier_salaire`,
          label: `Dernier salaire`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.dernier_salaire }),
        },
        { key: `indemnite`, label: `Indemnité`, align: `right`, render: (e) => (0, $.jsx)(Y, { value: e.indemnite }) },
        {
          key: `documents_remis`,
          label: `Documents`,
          render: (e) => (0, $.jsxs)(i, { variant: `caption`, children: [e.documents_remis?.length || 0, `/4`] }),
        },
        {
          key: `statut_dossier`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut_dossier, label: j.statut_dossier[e.statut_dossier] }),
        },
      ],
      data: V,
    },
    archivage: {
      title: `Archivage documents`,
      subtitle: `Durées de conservation: 1 an / 3 ans / 5 ans (selon nature) — verrouillage en lecture seule`,
      columns: [
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `type_document`, label: `Type` },
        { key: `date_archive`, label: `Date archive`, render: (e) => A(e.date_archive) },
        { key: `lieu_stockage`, label: `Lieu` },
        { key: `duree_conservation`, label: `Durée conservation` },
        { key: `responsable`, label: `Responsable` },
      ],
      data: [
        {
          id: `ar1`,
          employee_id: `emp-020`,
          type_document: `Dossier complet départ`,
          date_archive: `2025-08-15`,
          lieu_stockage: `Coffre fort`,
          duree_conservation: `5 ans`,
          responsable: `emp-004`,
        },
      ],
    },
    rappels: {
      title: `Rappels administratifs`,
      subtitle: `Auto-génération quand document expire < 30j · tri par échéance`,
      columns: [
        {
          key: `type_rappel`,
          label: `Type`,
          render: (e) => (0, $.jsx)(T, { label: j.type_rappel[e.type_rappel], size: `small`, variant: `outlined` }),
        },
        { key: `description`, label: `Description` },
        { key: `employee`, label: `Employé`, render: (e) => B(R(e.employee_id)) },
        { key: `date_echeance`, label: `Échéance`, render: (e) => A(e.date_echeance) },
        { key: `jours`, label: `Statut échéance`, render: (e) => (0, $.jsx)(Z, { date: e.date_echeance }) },
        { key: `responsable`, label: `Responsable`, render: (e) => B(R(e.responsable_suivi)) },
        { key: `action_requise`, label: `Action requise` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut, label: j.statut_rappel[e.statut] }),
        },
      ],
      data: I,
    },
  };
/* ================================================================
   SOLDES V2 — Cockpit des soldes de congés (écran 'soldes' uniquement)
   Source de vérité : demandes Congés V2 (localStorage admina_d2_conges_v2)
   sinon tableau partagé. Moteur identique Congés V2 : jours ouvrables,
   fériés Cameroun, prorata embauche, report N-1 (meta.reports).
   Aucun autre écran du chunk n'utilise ce code (branchement dédié dans ie).
   ================================================================ */
var SLD_LS = `admina_d2_conges_v2`;
var SLD_PALETTE = [`#7e3ff2`, `#0ea5e9`, `#f59e0b`, `#10b981`, `#ef4444`, `#8b5cf6`, `#06b6d4`, `#ec4899`, `#84cc16`, `#f97316`];
function sldPaques(annee) {
  var a = annee % 19,
    b = Math.floor(annee / 100),
    c = annee % 100,
    d = Math.floor(b / 4),
    e2 = b % 4,
    f2 = Math.floor((b + 8) / 25),
    g2 = Math.floor((b - f2 + 1) / 3),
    h2 = (19 * a + b - d - g2 + 15) % 30,
    i2 = Math.floor(c / 4),
    k2 = c % 4,
    l2 = (32 + 2 * e2 + 2 * i2 - h2 - k2) % 7,
    m2 = Math.floor((a + 11 * h2 + 22 * l2) / 451),
    mois = Math.floor((h2 + l2 - 7 * m2 + 114) / 31),
    jour = ((h2 + l2 - 7 * m2 + 114) % 31) + 1;
  return new Date(annee, mois - 1, jour);
}
function sldFeriesListe(annee) {
  var fixes = [`01-01`, `11-02`, `01-05`, `20-05`, `15-08`, `25-12`],
    out = fixes.map((x) => annee + `-` + x),
    p = sldPaques(annee);
  [
    [-2, `Vendredi Saint`],
    [39, `Ascension`],
    [50, `Lundi de Pentecôte`],
  ].forEach((x) => {
    var d = new Date(p);
    d.setDate(d.getDate() + x[0]);
    out.push(d.toISOString().slice(0, 10));
  });
  var musulmans = {
    2024: [`04-10`, `06-17`, `09-16`],
    2025: [`03-31`, `06-07`, `09-05`],
    2026: [`03-20`, `05-27`, `08-26`],
    2027: [`03-10`, `05-17`, `08-16`],
    2028: [`02-27`, `05-05`, `08-04`],
  };
  (musulmans[annee] || []).forEach((x) => out.push(annee + `-` + x));
  return out;
}
var SLD_FSET = null;
function sldFset() {
  if (SLD_FSET) return SLD_FSET;
  var s = new Set();
  for (var yy = 2022; yy <= 2032; yy++) sldFeriesListe(yy).forEach((x) => s.add(x));
  try {
    var raw = localStorage.getItem(SLD_LS);
    if (raw) {
      var st = JSON.parse(raw);
      ((st && st.meta && st.meta.feriesExtra) || []).forEach((x) => x && s.add(x));
    }
  } catch (err) {}
  SLD_FSET = s;
  return s;
}
function sldOuvrables(debut, fin, fset) {
  if (!debut || !fin) return 0;
  var d = new Date(debut),
    f = new Date(fin);
  if (f < d) return 0;
  var n = 0,
    cur = new Date(d),
    garde = 0;
  while (cur <= f && garde < 400) {
    var dow = cur.getDay();
    if (dow !== 0 && dow !== 6) {
      var iso = cur.toISOString().slice(0, 10);
      if (!fset || !fset.has(iso)) n++;
    }
    cur.setDate(cur.getDate() + 1);
    garde++;
  }
  return n;
}
function sldDemandes() {
  try {
    var raw = localStorage.getItem(SLD_LS);
    if (raw) {
      var st = JSON.parse(raw);
      if (st && st.v === 3 && Array.isArray(st.demandes) && st.demandes.length > 0) return st.demandes;
    }
  } catch (err) {}
  return CG;
}
function sldStoreMeta() {
  try {
    var raw = localStorage.getItem(SLD_LS);
    if (raw) {
      var st = JSON.parse(raw);
      if (st && st.meta) return st.meta;
    }
  } catch (err) {}
  return null;
}
function sldReport(empId, meta) {
  return (meta && meta.reports && meta.reports[empId]) || 0;
}
function sldDroit(emp, annee) {
  var base = emp && emp.categorie === `Cadre` ? 30 : 26,
    em = new Date(emp.date_embauche),
    moisT = 12;
  if (em.getFullYear() === annee) moisT = 12 - em.getMonth();
  else if (em.getFullYear() > annee) moisT = 0;
  var droit = Math.round((base * moisT) / 12);
  return { droit: droit, base: base, prorata: droit < base ? 1 : 0 };
}
function sldStatut(m) {
  if (m.prev < 0 || m.dispo < 0) return { key: `critique`, label: `Critique`, color: `error`, filled: !0 };
  if (m.taux > 75) return { key: `tendu`, label: `Tendu`, color: `warning`, filled: !0 };
  if (m.taux < 40) return { key: `sousUtilise`, label: `Sous-utilisé`, color: `info`, filled: !1 };
  return { key: `sain`, label: `Sain`, color: `success`, filled: !1 };
}
function sldHash(s) {
  var h = 0;
  for (var i2 = 0; i2 < s.length; i2++) h = ((h * 31 + s.charCodeAt(i2)) & 0x7fffffff) >>> 0;
  return h;
}
function sldInitiales(nom) {
  var p = String(nom || `?`)
    .trim()
    .split(/\s+/);
  return ((p[0] || `?`)[0] + (p[1] ? p[1][0] : p[0].length > 1 ? p[0][1] : ``)).toUpperCase();
}
function sldAvatar(emp, size, fs) {
  var nm = B(emp),
    bg = SLD_PALETTE[sldHash(nm) % SLD_PALETTE.length];
  return (0, $.jsx)(a, {
    sx: {
      width: size || 36,
      height: size || 36,
      borderRadius: `50%`,
      background: `linear-gradient(135deg,` + bg + `,` + bg + `cc)`,
      color: `#fff`,
      display: `flex`,
      alignItems: `center`,
      justifyContent: `center`,
      fontWeight: 700,
      fontSize: fs || 13,
      flexShrink: 0,
    },
    children: sldInitiales(nm),
  });
}
function sldFCFA(n) {
  return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ` `) + ` FCFA`;
}

function SldKpi(pg) {
  var IC = pg.ic;
  return (0, $.jsxs)(
    a,
    {
      onClick: pg.onClic,
      sx: {
        p: 2,
        borderRadius: 3,
        cursor: `pointer`,
        minWidth: 0,
        bgcolor: `background.paper`,
        background: pg.grad ? `linear-gradient(135deg,#7e3ff2 0%,#9d6bff 100%)` : undefined,
        color: pg.grad ? `#fff` : `text.primary`,
        border: `1px solid`,
        borderColor: pg.actif ? `#7e3ff2` : `divider`,
        boxShadow: pg.actif ? 4 : 1,
        transition: `box-shadow .2s`,
        "&:hover": { boxShadow: 6 },
      },
      children: [
        (0, $.jsx)(IC, { sx: { fontSize: 30, mb: 0.5, color: pg.grad ? `rgba(255,255,255,.92)` : pg.couleur || `primary.main` } }),
        (0, $.jsx)(i, { variant: `h5`, fontWeight: 800, children: pg.valeur }),
        (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, sx: { color: pg.grad ? `rgba(255,255,255,.9)` : `text.primary` }, children: pg.label }),
        pg.sub
          ? (0, $.jsx)(i, {
              variant: `caption`,
              sx: { display: `block`, mt: 0.5, color: pg.grad ? `rgba(255,255,255,.75)` : `text.secondary` },
              children: pg.sub,
            })
          : null,
      ],
    },
  );
}
function SldTuile(pg) {
  return (0, $.jsxs)(
    a,
    {
      sx: { border: `1px solid`, borderColor: `divider`, borderRadius: 2, p: 1.5, textAlign: `center`, bgcolor: `background.default` },
      children: [
        (0, $.jsx)(i, { variant: `caption`, sx: { color: `text.secondary`, fontWeight: 600 }, children: pg.label }),
        (0, $.jsx)(i, { variant: `h6`, fontWeight: 800, sx: { color: pg.couleur || `text.primary` }, children: pg.valeur }),
      ],
    },
  );
}
function sldBarre(pct, couleur) {
  var p2 = Math.max(0, Math.min(100, pct || 0));
  return (0, $.jsxs)(a, {
    sx: { display: `flex`, alignItems: `center`, gap: 1, minWidth: 130 },
    children: [
      (0, $.jsx)(a, {
        sx: { flex: 1, height: 8, borderRadius: 4, bgcolor: `action.hover`, overflow: `hidden` },
        children: (0, $.jsx)(a, { sx: { width: p2 + `%`, height: `100%`, borderRadius: 4, bgcolor: couleur } }),
      }),
      (0, $.jsx)(i, { variant: `caption`, fontWeight: 800, children: p2 + `%` }),
    ],
  });
}
function sldChipStatut(m) {
  var st = sldStatut(m);
  return (0, $.jsx)(T, {
    label: st.label,
    size: `small`,
    color: st.color,
    variant: st.filled ? `filled` : `outlined`,
    sx: { fontWeight: 700, fontSize: `0.7rem` },
  });
}
function sldChipDemande(st) {
  var mp = { approuvee: [`Approuvée`, `success`], en_attente: [`En attente`, `warning`], refusee: [`Refusée`, `error`], annulee: [`Annulée`, `default`] },
    x2 = mp[st] || [st, `default`];
  return (0, $.jsx)(T, { label: x2[0], size: `small`, color: x2[1], variant: `outlined`, sx: { fontWeight: 700, fontSize: `0.7rem` } });
}
function sldAlertePerso(m) {
  var st = sldStatut(m);
  if (st.key === `critique`)
    return (0, $.jsx)(c, {
      severity: `error`,
      icon: (0, $.jsx)(w, {}),
      sx: { mb: 2, fontWeight: 600 },
      children: `Solde négatif` + (m.att > 0 ? ` si les demandes en attente sont approuvées (projection ` + m.prev + ` j)` : ``) + ` — arbitrage DRH requis : refus motivé, report ou congé sans solde.`,
    });
  if (st.key === `sousUtilise`)
    return (0, $.jsx)(c, {
      severity: `warning`,
      sx: { mb: 2, fontWeight: 600 },
      children: `Moins de 40 % du droit annuel consommé — encouragez la planification : le repos annuel est une obligation légale (art. 89 et s. Code du travail) et un facteur de prévention burn-out.`,
    });
  if (st.key === `tendu`)
    return (0, $.jsx)(c, { severity: `info`, sx: { mb: 2, fontWeight: 600 }, children: `Taux d'utilisation élevé (> 75 %) — veiller à conserver une couverture d'équipe suffisante.` });
  return null;
}
function SoldesV2() {
  var nav = O(),
    AN = new Date().getFullYear(),
    stTick = (0, Q.useState)(0),
    tick = stTick[0],
    setTick = stTick[1],
    stRech = (0, Q.useState)(``),
    rech = stRech[0],
    setRech = stRech[1],
    stDept = (0, Q.useState)(`tous`),
    dept = stDept[0],
    setDept = stDept[1],
    stStat = (0, Q.useState)(`tous`),
    statutF = stStat[0],
    setStatutF = stStat[1],
    stExo = (0, Q.useState)(String(AN)),
    exo = stExo[0],
    setExo = stExo[1],
    stTri = (0, Q.useState)({ key: `dispo`, dir: `asc` }),
    tri = stTri[0],
    setTri = stTri[1],
    stPage = (0, Q.useState)(0),
    page = stPage[0],
    setPage = stPage[1],
    stPp = (0, Q.useState)(10),
    pp = stPp[0],
    setPp = stPp[1],
    stDet = (0, Q.useState)(null),
    detail = stDet[0],
    setDetail = stDet[1],
    stSnk = (0, Q.useState)(null),
    snack = stSnk[0],
    setSnack = stSnk[1],
    stSyn = (0, Q.useState)(new Date()),
    sync = stSyn[0],
    setSync = stSyn[1];
  var roleAct = window.__congesD2Role || `drh`,
    estEmploye = roleAct === `employe`,
    metaLocal = sldStoreMeta(),
    empSim = (metaLocal && metaLocal.emploiSimule) || `emp-002`;
  var calc = (0, Q.useMemo)(() => {
    var DEM = sldDemandes(),
      FER = sldFset(),
      meta = sldStoreMeta(),
      anneeSel = exo === `tous` ? AN : parseInt(exo, 10);
    return H.map((emp) => {
      var dr = sldDroit(emp, anneeSel),
        rep = anneeSel === AN ? sldReport(emp.id, meta) : 0,
        pris = 0,
        att = 0,
        dems = [];
      DEM.forEach((q2) => {
        if (q2.employee_id !== emp.id || q2.type_conge !== `conge_annuel`) return;
        var an = String(q2.date_debut || ``).slice(0, 4);
        if (exo !== `tous` && an !== exo) return;
        var oj = sldOuvrables(q2.date_debut, q2.date_fin, FER);
        if (q2.statut === `approuvee`) pris += oj;
        else if (q2.statut === `en_attente`) att += oj;
        dems.push(q2);
      });
      var dispo = dr.droit + rep - pris,
        prev = dispo - att,
        taux = dr.droit > 0 ? Math.round((pris / dr.droit) * 100) : 0;
      return { emp: emp, droit: dr.droit, base: dr.base, prorata: dr.prorata, report: rep, pris: pris, att: att, dispo: dispo, prev: prev, taux: taux, dems: dems };
    });
  }, [tick, exo]);
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    H.forEach((e2) => e2.departement && s2.add(e2.departement));
    return Array.from(s2).sort();
  }, []);
  var flt = (0, Q.useMemo)(
    () =>
      calc.filter((m2) => {
        if (dept !== `tous` && m2.emp.departement !== dept) return !1;
        var st = sldStatut(m2);
        if (statutF !== `tous` && st.key !== statutF) return !1;
        if (rech) {
          var q2 = rech.toLowerCase(),
            nm = B(m2.emp).toLowerCase();
          if (!nm.includes(q2) && !String(m2.emp.matricule || ``).toLowerCase().includes(q2) && !String(m2.emp.departement || ``).toLowerCase().includes(q2)) return !1;
        }
        return !0;
      }),
    [calc, dept, statutF, rech],
  );
  var srt = flt.slice().sort((m1, m2) => {
    var k1, k2;
    switch (tri.key) {
      case `employe`:
        k1 = B(m1.emp);
        k2 = B(m2.emp);
        break;
      case `dept`:
        k1 = m1.emp.departement || ``;
        k2 = m2.emp.departement || ``;
        break;
      case `droit`:
        k1 = m1.droit;
        k2 = m2.droit;
        break;
      case `pris`:
        k1 = m1.pris;
        k2 = m2.pris;
        break;
      case `att`:
        k1 = m1.att;
        k2 = m2.att;
        break;
      case `taux`:
        k1 = m1.taux;
        k2 = m2.taux;
        break;
      default:
        k1 = m1.dispo;
        k2 = m2.dispo;
    }
    var cmp = typeof k1 === `string` ? k1.localeCompare(k2) : k1 - k2;
    return tri.dir === `asc` ? cmp : -cmp;
  });
  var kpi = (0, Q.useMemo)(() => {
    var tot = 0,
      crit = 0,
      sousU = 0,
      sTaux = 0,
      prov = 0;
    flt.forEach((m2) => {
      tot += Math.max(m2.dispo, 0);
      sTaux += m2.taux;
      var st = sldStatut(m2);
      if (st.key === `critique`) crit++;
      if (st.key === `sousUtilise`) sousU++;
      var sal = m2.emp.salaire_brut || 0;
      prov += Math.max(m2.dispo, 0) * (sal / 26);
    });
    return { tot: tot, crit: crit, sousU: sousU, tauxMoy: flt.length ? Math.round(sTaux / flt.length) : 0, prov: prov };
  }, [flt]);
  var jRestants = Math.max(0, Math.ceil((new Date(AN, 11, 31) - new Date()) / 864e5));
  var fExport = () => {
    var entetes = [`Matricule`, `Employé`, `Département`, `Poste`, `Catégorie`, `Exercice`, `Droit (j)`, `Dont report N-1`, `Pris (j ouvr.)`, `En attente (j ouvr.)`, `Solde disponible (j)`, `Solde projeté (j)`, `Taux (%)`, `Statut`, `Alerte`],
      lignes = srt.map((m2) => {
        var st = sldStatut(m2),
          al = st.key === `critique` ? `Dépassement projeté — arbitrage requis` : st.key === `sousUtilise` ? `Non-consommation — risque légal/burn-out` : st.key === `tendu` ? `Taux élevé — couverture à surveiller` : ``;
        return [
          m2.emp.matricule || ``,
          B(m2.emp),
          m2.emp.departement || ``,
          m2.emp.poste || ``,
          m2.emp.categorie || ``,
          exo === `tous` ? `Tous` : exo,
          m2.droit,
          m2.report,
          m2.pris,
          m2.att,
          m2.dispo,
          m2.prev,
          m2.taux,
          st.label,
          al,
        ]
          .map((x2) => `"${String(x2 == null ? `` : x2).replace(/"/g, `""`)}"`)
          .join(`;`);
      }),
      csv = `﻿` + entetes.join(`;`) + `
` + lignes.join(`
`),
      bl = new Blob([csv], { type: `text/csv;charset=utf-8;` }),
      ur = URL.createObjectURL(bl),
      an2 = document.createElement(`a`);
    ((an2.href = ur), (an2.download = `soldes_conges_${exo}_${new Date().toISOString().slice(0, 10)}.csv`), an2.click(), URL.revokeObjectURL(ur));
    setSnack({ msg: srt.length + ` solde(s) exporté(s) en CSV (décompte jours ouvrables)`, sev: `success` });
  };
  var fRefresh = () => {
    ((SLD_FSET = null), setSync(new Date()), setTick(tick + 1), setSnack({ msg: `Soldes recalculés depuis les demandes de congés (source : Congés Annuels V2)`, sev: `success` }));
  };
  var fTri = (key) => setTri((tr) => ({ key: key, dir: tr.key === key && tr.dir === `asc` ? `desc` : `asc` }));
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: { fontWeight: 700, whiteSpace: `nowrap`, bgcolor: `background.default` },
        children: (0, $.jsxs)(a, {
          sx: { display: `inline-flex`, alignItems: `center`, gap: 0.5, cursor: `pointer`, userSelect: `none`, "&:hover": { color: `primary.main` } },
          onClick: () => fTri(key),
          children: [
            label,
            tri.key === key
              ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, { sx: { fontSize: 15, color: `primary.main` } })
              : (0, $.jsx)(a, { sx: { width: 15 } }),
          ],
        }),
      },
      key,
    );

  /* — Vue salarié (RGPD, rôle Employé) : uniquement sa propre situation — */
  if (estEmploye) {
    var mo = calc.find((x2) => x2.emp.id === empSim) || calc[0];
    return (0, $.jsxs)(a, {
      children: [
        (0, $.jsx)(c, { severity: `info`, sx: { mb: 2.5, fontWeight: 600 }, children: `Vue salarié — vous consultez uniquement votre propre situation (confidentialité RGPD).` }),
        (0, $.jsx)(J, {
          title: `Mon solde de congés`,
          subtitle: `Exercice ` + (exo === `tous` ? `tous exercices` : exo) + ` · décompte en jours ouvrables (fériés Cameroun déduits)`,
          action: (0, $.jsx)(l, { variant: `outlined`, size: `small`, startIcon: (0, $.jsx)(RF, {}), onClick: fRefresh, sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Actualiser` }),
        }),
        (0, $.jsxs)(ee, {
          sx: { mt: 2, borderRadius: 3 },
          children: [
            (0, $.jsxs)(u, {
              children: [
                (0, $.jsxs)(o, { direction: `row`, spacing: 2, alignItems: `center`, sx: { mb: 2 }, children: [sldAvatar(mo.emp, 56, 22), (0, $.jsxs)(a, { children: [(0, $.jsx)(i, { variant: `h6`, fontWeight: 800, children: B(mo.emp) }), (0, $.jsx)(i, { variant: `body2`, color: `text.secondary`, children: (mo.emp.poste || ``) + ` · ` + (mo.emp.departement || ``) + ` · ` + (mo.emp.matricule || ``) })] }), (0, $.jsx)(a, { sx: { ml: `auto` }, children: sldChipStatut(mo) })] }),
                sldAlertePerso(mo),
                (0, $.jsxs)(a, { sx: { display: `grid`, gridTemplateColumns: `repeat(auto-fit,minmax(130px,1fr))`, gap: 1.5 }, children: [(0, $.jsx)(SldTuile, { label: `Droit annuel`, valeur: mo.droit + ` j` }), (0, $.jsx)(SldTuile, { label: `Report N-1`, valeur: `+` + mo.report + ` j` }), (0, $.jsx)(SldTuile, { label: `Pris (ouvrables)`, valeur: mo.pris + ` j` }), (0, $.jsx)(SldTuile, { label: `En attente`, valeur: mo.att + ` j`, couleur: mo.att > 0 ? `warning.main` : null }), (0, $.jsx)(SldTuile, { label: `Disponible`, valeur: mo.dispo + ` j`, couleur: mo.dispo < 0 ? `error.main` : `success.main` }), (0, $.jsx)(SldTuile, { label: `Projection si accord`, valeur: mo.prev + ` j`, couleur: mo.prev < 0 ? `error.main` : `text.primary` })] }),
                (0, $.jsx)(a, { sx: { mt: 2 }, children: sldBarre(mo.taux, mo.taux > 75 ? `error.main` : mo.taux < 40 ? `warning.main` : `success.main`) }),
                (0, $.jsx)(i, { variant: `subtitle2`, sx: { mt: 2.5, mb: 1, fontWeight: 800 }, children: `Mes congés annuels ` + (exo === `tous` ? `(tous exercices)` : exo) + ` — ` + mo.dems.length + ` demande(s)` }),
                mo.dems.length === 0
                  ? (0, $.jsx)(i, { variant: `body2`, color: `text.secondary`, children: `Aucune demande de congé annuel sur cet exercice.` })
                  : (0, $.jsx)(a, { sx: { display: `flex`, flexDirection: `column`, gap: 1 }, children: mo.dems
                      .slice()
                      .sort((p2, q2) => (p2.date_debut < q2.date_debut ? 1 : -1))
                      .map((q2) =>
                        (0, $.jsxs)(
                          a,
                          {
                            sx: { display: `flex`, alignItems: `center`, gap: 1.5, p: 1, borderRadius: 2, border: `1px solid`, borderColor: `divider` },
                            children: [
                              (0, $.jsx)(CT, { sx: { fontSize: 18, color: `primary.main` } }),
                              (0, $.jsxs)(i, { variant: `body2`, fontWeight: 700, children: [q2.leave_number || `—`, ` · `, A(q2.date_debut), ` → `, A(q2.date_fin)] }),
                              (0, $.jsx)(i, { variant: `caption`, color: `text.secondary`, children: sldOuvrables(q2.date_debut, q2.date_fin, sldFset()) + ` j ouvrables` }),
                              (0, $.jsx)(a, { sx: { ml: `auto` }, children: sldChipDemande(q2.statut) }),
                            ],
                          },
                          q2.id,
                        ),
                      ) }),
                (0, $.jsx)(o, { direction: `row`, spacing: 1.5, sx: { mt: 2.5 }, children: (0, $.jsx)(l, { variant: `contained`, size: `small`, startIcon: (0, $.jsx)(CT, {}), onClick: () => nav(`/domaine2_Gestion_Administrative_Personnel/conges`), sx: { textTransform: `none`, fontSize: `0.75rem`, bgcolor: `#7e3ff2` }, children: `Poser un congé / voir mes demandes` }) }),
              ],
            }),
          ],
        }),
        (0, $.jsx)(d, { open: !!snack, autoHideDuration: 4e3, onClose: () => setSnack(null), anchorOrigin: { vertical: `bottom`, horizontal: `center` }, message: snack ? snack.msg : `` }),
      ],
    });
  }
  /* — Vue RH / Manager : cockpit complet — */
  return (0, $.jsxs)(o, {
    spacing: 2.5,
    sx: { width: `100%`, maxWidth: `100%`, minWidth: 0 },
    children: [
      (0, $.jsx)(J, {
        title: `Soldes de congés — Cockpit de pilotage`,
        subtitle: `Exercice ` + (exo === `tous` ? `tous exercices confondus` : exo) + ` · décompte en jours ouvrables (week-ends et fériés Cameroun déduits) · synchronisé en temps réel avec les demandes de Congés Annuels`,
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          alignItems: `center`,
          children: [
            (0, $.jsx)(i, { variant: `caption`, sx: { color: `text.secondary`, display: { xs: `none`, md: `block` } }, children: `Synchro ` + sync.toLocaleTimeString() }),
            (0, $.jsxs)(l, { variant: `outlined`, size: `small`, onClick: fRefresh, sx: { textTransform: `none`, fontSize: `0.75rem`, minWidth: 0, px: { xs: 1, sm: 1.5 } }, children: [(0, $.jsx)(RF, { sx: { fontSize: 18 } }), (0, $.jsx)(i, { component: `span`, sx: { display: { xs: `none`, sm: `inline` }, fontSize: `inherit` }, children: `Actualiser` })] }),
            (0, $.jsxs)(l, { variant: `outlined`, size: `small`, onClick: fExport, sx: { textTransform: `none`, fontSize: `0.75rem`, minWidth: 0, px: { xs: 1, sm: 1.5 } }, children: [(0, $.jsx)(S, { sx: { fontSize: 18 } }), (0, $.jsx)(i, { component: `span`, sx: { display: { xs: `none`, sm: `inline` }, fontSize: `inherit` }, children: `Export CSV` })] }),
          ],
        }),
      }),
      kpi.crit > 0
        ? (0, $.jsx)(c, {
            severity: `error`,
            icon: (0, $.jsx)(w, {}),
            sx: { fontWeight: 600, overflowWrap: `anywhere`, "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } } },
            action: (0, $.jsx)(l, { color: `error`, size: `small`, onClick: () => setStatutF(`critique`), sx: { textTransform: `none` }, children: `Examiner` }),
            children: kpi.crit + ` employé(s) dépasseraient leur solde si les demandes en attente étaient approuvées — arbitrage DRH requis (refus motivé, report ou ajustement).`,
          })
        : null,
      kpi.sousU > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            sx: { fontWeight: 600, overflowWrap: `anywhere`, "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } } },
            action: (0, $.jsx)(l, { color: `warning`, size: `small`, onClick: () => setStatutF(`sousUtilise`), sx: { textTransform: `none` }, children: `Voir` }),
            children: kpi.sousU + ` employé(s) sous 40 % de consommation ` + (exo === `tous` ? `` : exo) + ` — obligation légale de repos (art. 89 et s. Code du travail) · ` + jRestants + ` jour(s) avant le 31/12 : anticipez la planification.`,
          })
        : null,
      (0, $.jsxs)(a, { sx: { display: `grid`, gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(4,1fr)` }, gap: 2 }, children: [
        (0, $.jsx)(SldKpi, { ic: AB, grad: !0, valeur: kpi.tot + ` j`, label: `Solde total disponible`, sub: `≈ provision ` + sldFCFA(kpi.prov), actif: statutF === `tous` && dept === `tous` && !rech, onClic: () => { (setStatutF(`tous`), setDept(`tous`), setRech(``), setPage(0)); } }),
        (0, $.jsx)(SldKpi, { ic: w, couleur: `error.main`, valeur: String(kpi.crit), label: `Alertes critiques`, sub: `solde projeté négatif`, actif: statutF === `critique`, onClic: () => (setStatutF(statutF === `critique` ? `tous` : `critique`), setPage(0)) }),
        (0, $.jsx)(SldKpi, { ic: AT, couleur: `warning.main`, valeur: String(kpi.sousU), label: `Sous-utilisés`, sub: `< 40 % consommé — risque légal`, actif: statutF === `sousUtilise`, onClic: () => (setStatutF(statutF === `sousUtilise` ? `tous` : `sousUtilise`), setPage(0)) }),
        (0, $.jsx)(SldKpi, { ic: AS2, couleur: `success.main`, valeur: kpi.tauxMoy + ` %`, label: `Taux moyen d'utilisation`, sub: srt.length + ` employé(s) affiché(s)`, actif: !1, onClic: () => fTri(`taux`) }),
      ] }),
      (0, $.jsxs)(a, { sx: { display: `flex`, gap: 1.5, flexWrap: `wrap`, alignItems: `center` }, children: [
        (0, $.jsx)(D, {
          size: `small`,
          placeholder: `Rechercher (nom, matricule, département…)`,
          value: rech,
          onChange: (e2) => { (setRech(e2.target.value), setPage(0)); },
          InputProps: { startAdornment: (0, $.jsx)(k, { sx: { fontSize: 18, mr: 1, color: `text.secondary` } }) },
          sx: { flex: 1, minWidth: 160, "& .MuiInput-root": { fontSize: `0.8rem` } },
        }),
        (0, $.jsxs)(D, { select: !0, size: `small`, label: `Statut`, value: statutF, onChange: (e2) => { (setStatutF(e2.target.value), setPage(0)); }, sx: { minWidth: 150, width: { xs: `100%`, sm: `auto` } }, children: [
          (0, $.jsx)(s, { value: `tous`, children: `Tous les statuts` }),
          (0, $.jsx)(s, { value: `critique`, children: `🔴 Critique` }),
          (0, $.jsx)(s, { value: `tendu`, children: `🟠 Tendu (> 75 %)` }),
          (0, $.jsx)(s, { value: `sain`, children: `🟢 Sain (40-75 %)` }),
          (0, $.jsx)(s, { value: `sousUtilise`, children: `🔵 Sous-utilisé (< 40 %)` }),
        ] }),
        (0, $.jsxs)(D, { select: !0, size: `small`, label: `Exercice`, value: exo, onChange: (e2) => { (setExo(e2.target.value), setPage(0)); }, sx: { minWidth: 150, width: { xs: `100%`, sm: `auto` } }, children: [
          (0, $.jsx)(s, { value: String(AN), children: `Exercice ` + AN }),
          (0, $.jsx)(s, { value: String(AN - 1), children: `Exercice ` + (AN - 1) }),
          (0, $.jsx)(s, { value: String(AN - 2), children: `Exercice ` + (AN - 2) }),
          (0, $.jsx)(s, { value: `tous`, children: `Tous exercices` }),
        ] }),
        dept !== `tous` || statutF !== `tous` || rech
          ? (0, $.jsx)(l, { size: `small`, onClick: () => { (setDept(`tous`), setStatutF(`tous`), setRech(``), setPage(0)); }, sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Effacer les filtres` })
          : null,
      ] }),
      (0, $.jsx)(a, { sx: { display: `flex`, gap: 0.75, flexWrap: `wrap`, mb: -0.5 }, children: [
        (0, $.jsx)(T, { label: `Tous départements`, size: `small`, onClick: () => (setDept(`tous`), setPage(0)), color: dept === `tous` ? `primary` : `default`, variant: dept === `tous` ? `filled` : `outlined`, sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` } }),
        depts.map((dp) =>
          (0, $.jsx)(T, { label: dp, size: `small`, onClick: () => (setDept(dept === dp ? `tous` : dp), setPage(0)), color: dept === dp ? `primary` : `default`, variant: dept === dp ? `filled` : `outlined`, sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` } }, dp),
        ),
      ] }),
      (0, $.jsx)(ee, { children: (0, $.jsxs)(u, { children: [
        (0, $.jsx)(y, { sx: { overflowX: `auto`, maxWidth: `100%` }, children: (0, $.jsxs)(ne, { size: `small`, stickyHeader: !0, children: [
          (0, $.jsx)(te, { children: (0, $.jsxs)(b, { children: [
            fTh(`Employé`, `employe`),
            fTh(`Département`, `dept`),
            fTh(`Droit annuel`, `droit`, `right`),
            fTh(`Pris (ouvr.)`, `pris`, `right`),
            fTh(`En attente`, `att`, `right`),
            fTh(`Solde disponible`, `dispo`, `right`),
            fTh(`Taux`, `taux`),
            (0, $.jsx)(v, { sx: { fontWeight: 700 }, children: `Statut` }),
            (0, $.jsx)(v, { align: `center`, sx: { fontWeight: 700 }, children: `Actions` }),
          ] }) }),
          (0, $.jsx)(_, { children: srt.slice(page * pp, page * pp + pp).map((m2, idx) =>
            (0, $.jsxs)(b, { hover: !0, onClick: () => setDetail(m2), sx: { cursor: `pointer` }, children: [
              (0, $.jsxs)(v, { children: [
                (0, $.jsxs)(a, { sx: { display: `flex`, alignItems: `center`, gap: 1.2 }, children: [
                  sldAvatar(m2.emp, 34, 12),
                  (0, $.jsxs)(a, { sx: { minWidth: 0 }, children: [
                    (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, noWrap: !0, children: B(m2.emp) }),
                    (0, $.jsx)(i, { variant: `caption`, sx: { color: `text.secondary`, fontFamily: `monospace` }, children: m2.emp.matricule || `` }),
                  ] }),
                ] }),
              ] }),
              (0, $.jsx)(v, { children: (0, $.jsx)(T, { label: m2.emp.departement || `—`, size: `small`, variant: `outlined`, sx: { fontSize: `0.68rem`, fontWeight: 700 } }) }),
              (0, $.jsxs)(v, { align: `right`, children: [
                m2.droit + ` j`,
                m2.prorata ? (0, $.jsx)(i, { variant: `caption`, sx: { display: `block`, color: `info.main`, fontWeight: 700 }, children: `prorata embauche` }) : null,
                m2.report > 0 ? (0, $.jsx)(i, { variant: `caption`, sx: { display: `block`, color: `secondary.main`, fontWeight: 700 }, children: `dont report +` + m2.report + ` j` }) : null,
              ] }),
              (0, $.jsx)(v, { align: `right`, children: (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, children: m2.pris + ` j` }) }),
              (0, $.jsx)(v, { align: `right`, children: m2.att > 0 ? (0, $.jsx)(T, { label: m2.att + ` j`, size: `small`, color: `warning`, variant: `outlined`, sx: { fontWeight: 800, fontSize: `0.7rem` } }) : (0, $.jsx)(i, { variant: `body2`, sx: { color: `text.secondary` }, children: `0 j` }) }),
              (0, $.jsxs)(v, { align: `right`, children: [
                (0, $.jsx)(i, { variant: `body2`, fontWeight: 800, sx: { color: m2.dispo < 0 ? `error.main` : m2.dispo < 5 ? `warning.main` : `success.main` }, children: m2.dispo + ` j` }),
                m2.att > 0 ? (0, $.jsx)(i, { variant: `caption`, sx: { display: `block`, color: `text.secondary` }, children: `projeté : ` + m2.prev + ` j` }) : null,
              ] }),
              (0, $.jsx)(v, { children: sldBarre(m2.taux, m2.taux > 75 ? `error.main` : m2.taux < 40 ? `warning.main` : `success.main`) }),
              (0, $.jsx)(v, { children: sldChipStatut(m2) }),
              (0, $.jsx)(v, { align: `center`, children: (0, $.jsxs)(o, { direction: `row`, spacing: 0.5, justifyContent: `center`, children: [
                (0, $.jsx)(E, { title: `Détail du solde`, children: (0, $.jsx)(r, { size: `small`, color: `primary`, onClick: (e2) => (e2.stopPropagation(), setDetail(m2)), children: (0, $.jsx)(C, { fontSize: `small` }) }) }),
                (0, $.jsx)(E, { title: `Voir ses demandes dans Congés Annuels`, children: (0, $.jsx)(r, { size: `small`, color: `secondary`, onClick: (e2) => (e2.stopPropagation(), nav(`/domaine2_Gestion_Administrative_Personnel/conges`)), children: (0, $.jsx)(CT, { fontSize: `small` }) }) }),
              ] }) }),
            ] }, m2.emp.id || idx),
          ) }),
          srt.length === 0
            ? (0, $.jsx)(b, { children: (0, $.jsx)(v, { colSpan: 9, align: `center`, sx: { py: 4, color: `text.secondary` }, children: `Aucun employé ne correspond aux filtres actifs` }) })
            : null,
        ] }) }),
        (0, $.jsx)(g, {
          component: `div`,
          count: srt.length,
          page: page,
          onPageChange: (e2, p2) => setPage(p2),
          rowsPerPage: pp,
          onRowsPerPageChange: (e2) => { (setPp(parseInt(e2.target.value)), setPage(0)); },
          rowsPerPageOptions: [10, 20, 50],
          labelRowsPerPage: `Lignes:`,
          labelDisplayedRows: (pg2) => pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
          sx: { mt: 1 },
        }),
      ] }) }),
      (0, $.jsxs)(f, { open: !!detail, onClose: () => setDetail(null), maxWidth: `md`, fullWidth: !0, children: [
        detail
          ? (0, $.jsxs)(h, {
              sx: { fontWeight: 800, display: `flex`, alignItems: `center`, gap: 1.5 },
              children: [
                sldAvatar(detail.emp, 44, 18),
                (0, $.jsxs)(a, { children: [
                  (0, $.jsx)(i, { variant: `h6`, fontWeight: 800, children: B(detail.emp) }),
                  (0, $.jsx)(i, { variant: `caption`, color: `text.secondary`, children: (detail.emp.poste || ``) + ` · ` + (detail.emp.departement || ``) + ` · ` + (detail.emp.matricule || ``) + ` · ` + (detail.emp.categorie || ``) }),
                ] }),
                (0, $.jsx)(a, { sx: { ml: `auto` }, children: sldChipStatut(detail) }),
              ],
            })
          : null,
        detail
          ? (0, $.jsxs)(p, { children: [
              sldAlertePerso(detail),
              (0, $.jsxs)(a, { sx: { display: `grid`, gridTemplateColumns: { xs: `repeat(3,1fr)`, sm: `repeat(6,1fr)` }, gap: 1.5 }, children: [
                (0, $.jsx)(SldTuile, { label: `Droit annuel`, valeur: detail.droit + ` j` }),
                (0, $.jsx)(SldTuile, { label: `Base`, valeur: detail.base + ` j` }),
                (0, $.jsx)(SldTuile, { label: `Report N-1`, valeur: `+` + detail.report + ` j` }),
                (0, $.jsx)(SldTuile, { label: `Pris (ouvrables)`, valeur: detail.pris + ` j` }),
                (0, $.jsx)(SldTuile, { label: `Disponible`, valeur: detail.dispo + ` j`, couleur: detail.dispo < 0 ? `error.main` : `success.main` }),
                (0, $.jsx)(SldTuile, { label: `Projection si accord`, valeur: detail.prev + ` j`, couleur: detail.prev < 0 ? `error.main` : `text.primary` }),
              ] }),
              (0, $.jsxs)(a, { sx: { mt: 2 }, children: [
                (0, $.jsx)(i, { variant: `caption`, fontWeight: 700, sx: { color: `text.secondary` }, children: `Décompte : jours ouvrables lun-ven, fériés Cameroun déduits · provision indicative ` + sldFCFA(Math.max(detail.dispo, 0) * ((detail.emp.salaire_brut || 0) / 26)) }),
              ] }),
              (0, $.jsx)(i, { variant: `subtitle2`, sx: { mt: 2, mb: 1, fontWeight: 800 }, children: `Congés annuels ` + (exo === `tous` ? `— tous exercices` : exo) + ` — ` + detail.dems.length + ` demande(s)` }),
              detail.dems.length === 0
                ? (0, $.jsx)(i, { variant: `body2`, color: `text.secondary`, children: `Aucune demande de congé annuel sur cet exercice.` })
                : (0, $.jsx)(a, { sx: { display: `flex`, flexDirection: `column`, gap: 1, maxHeight: 260, overflowY: `auto` }, children: detail.dems
                    .slice()
                    .sort((p2, q2) => (p2.date_debut < q2.date_debut ? 1 : -1))
                    .map((q2) =>
                      (0, $.jsxs)(a, { sx: { display: `flex`, alignItems: `center`, gap: 1.5, p: 1, borderRadius: 2, border: `1px solid`, borderColor: `divider` }, children: [
                        (0, $.jsx)(CT, { sx: { fontSize: 18, color: `primary.main` } }),
                        (0, $.jsxs)(a, { sx: { minWidth: 0, flex: 1 }, children: [
                          (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, noWrap: !0, children: (q2.leave_number || `—`) + ` · ` + A(q2.date_debut) + ` → ` + A(q2.date_fin) }),
                          (0, $.jsx)(i, { variant: `caption`, color: `text.secondary`, children: sldOuvrables(q2.date_debut, q2.date_fin, sldFset()) + ` j ouvrables / ` + q2.nombre_jours + ` j calendaires` + (q2.date_demande ? ` · déposée le ` + A(q2.date_demande) : ``) }),
                        ] }),
                        sldChipDemande(q2.statut),
                      ] }, q2.id),
                    ) }),
            ] })
          : null,
        (0, $.jsxs)(m, { sx: { px: 3, pb: 2 }, children: [
          (0, $.jsx)(l, { onClick: () => setDetail(null), children: `Fermer` }),
          (0, $.jsx)(l, { variant: `contained`, startIcon: (0, $.jsx)(CT, {}), onClick: () => nav(`/domaine2_Gestion_Administrative_Personnel/conges`), sx: { bgcolor: `#7e3ff2`, textTransform: `none` }, children: `Ouvrir Congés Annuels` }),
        ] }),
      ] }),
      (0, $.jsx)(d, { open: !!snack, autoHideDuration: 4e3, onClose: () => setSnack(null), anchorOrigin: { vertical: `bottom`, horizontal: `center` }, message: snack ? snack.msg : `` }),
    ],
  });
}

function ie({ screen: e }) {
  if (e === `soldes`) return (0, $.jsx)(SoldesV2, {});
  if (e === `absences`) return (0, $.jsx)(AbsencesV2, {});
  let t = O(),
    n = re[e],
    [T, A] = (0, Q.useState)(0),
    [j, N] = (0, Q.useState)(10),
    [P, F] = (0, Q.useState)(``),
    [I, L] = (0, Q.useState)(null),
    [z, V] = (0, Q.useState)(!1),
    [U, W] = (0, Q.useState)({}),
    K = n?.data || [],
    q = (0, Q.useMemo)(() => {
      if (!P) return K;
      let e = P.toLowerCase();
      return K.filter((t) => {
        let n = R(t.employee_id);
        return (
          (n ? B(n).toLowerCase() : ``).includes(e) ||
          Object.values(t).some((t) =>
            String(t || ``)
              .toLowerCase()
              .includes(e),
          )
        );
      });
    }, [K, P]),
    Y = q.slice(T * j, T * j + j),
    X = n?.alert ? n.alert(q) : null;
  return n
    ? (0, $.jsxs)(a, {
        children: [
          X &&
            (0, $.jsx)(c, { severity: `error`, icon: (0, $.jsx)(w, {}), sx: { mb: 2, fontWeight: 600 }, children: X }),
          (0, $.jsx)(ee, {
            children: (0, $.jsxs)(u, {
              children: [
                (0, $.jsx)(J, {
                  title: n.title,
                  subtitle: `${q.length} enregistrement(s)${P ? ` (filtrés sur ${K.length})` : ``} · ${n.subtitle}`,
                  action: (0, $.jsxs)(o, {
                    direction: `row`,
                    spacing: 1,
                    children: [
                      n.canExport !== !1 &&
                        (0, $.jsx)(l, {
                          variant: `outlined`,
                          size: `small`,
                          startIcon: (0, $.jsx)(S, {}),
                          onClick: () => {
                            let t = n.columns.map((e) => e.label),
                              r = q.map((e) =>
                                n.columns.map((t) => {
                                  let n = e[t.key];
                                  if (t.render) {
                                    let r = R(e.employee_id);
                                    n = r ? B(r) : e[t.key] || ``;
                                  }
                                  return `"${String(n || ``).replace(/"/g, `""`)}"`;
                                }),
                              ),
                              i =
                                `﻿` +
                                t.join(`;`) +
                                `
` +
                                r.map((e) => e.join(`;`)).join(`
`),
                              a = new Blob([i], { type: `text/csv;charset=utf-8;` }),
                              o = URL.createObjectURL(a),
                              s = document.createElement(`a`);
                            ((s.href = o),
                              (s.download = `${e}-${new Date().toISOString().slice(0, 10)}.csv`),
                              s.click(),
                              URL.revokeObjectURL(o),
                              L({ msg: `${q.length} enregistrement(s) exporté(s) en CSV`, severity: `success` }));
                          },
                          sx: { textTransform: `none`, fontSize: `0.75rem` },
                          children: `Export CSV`,
                        }),
                      n.canCreate &&
                        (0, $.jsx)(l, {
                          variant: `contained`,
                          size: `small`,
                          startIcon: (0, $.jsx)(x, {}),
                          onClick: () => V(!0),
                          sx: { textTransform: `none`, fontSize: `0.75rem` },
                          children: `Nouveau`,
                        }),
                    ],
                  }),
                }),
                (0, $.jsx)(o, {
                  direction: `row`,
                  spacing: 1.5,
                  sx: { mb: 2 },
                  children: (0, $.jsx)(D, {
                    size: `small`,
                    placeholder: `Rechercher (nom, matricule, type, valeur...)`,
                    value: P,
                    onChange: (e) => {
                      (F(e.target.value), A(0));
                    },
                    InputProps: {
                      startAdornment: (0, $.jsx)(k, { sx: { fontSize: 18, mr: 1, color: `text.secondary` } }),
                    },
                    sx: { flex: 1, "& .MuiInput-root": { fontSize: `0.8rem` } },
                  }),
                }),
                (0, $.jsx)(y, {
                  children: (0, $.jsxs)(ne, {
                    size: `small`,
                    stickyHeader: !0,
                    children: [
                      (0, $.jsx)(te, {
                        children: (0, $.jsxs)(b, {
                          sx: { bgcolor: `background.default` },
                          children: [
                            n.columns.map((e) =>
                              (0, $.jsx)(
                                v,
                                { align: e.align || `left`, sx: { fontWeight: 700 }, children: e.label },
                                e.key,
                              ),
                            ),
                            n.canCreate &&
                              (0, $.jsx)(v, { align: `center`, sx: { fontWeight: 700 }, children: `Actions` }),
                          ],
                        }),
                      }),
                      (0, $.jsxs)(_, {
                        children: [
                          Y.map((e, i) =>
                            (0, $.jsxs)(
                              b,
                              {
                                hover: !0,
                                children: [
                                  n.columns.map((t) =>
                                    (0, $.jsx)(
                                      v,
                                      {
                                        align: t.align || `left`,
                                        children: t.render
                                          ? t.render(e)
                                          : e[t.key] !== void 0 && e[t.key] !== null
                                            ? String(e[t.key])
                                            : `—`,
                                      },
                                      t.key,
                                    ),
                                  ),
                                  n.canCreate &&
                                    (0, $.jsx)(v, {
                                      align: `center`,
                                      children: (0, $.jsx)(o, {
                                        direction: `row`,
                                        spacing: 0.5,
                                        justifyContent: `center`,
                                        children:
                                          e.employee_id &&
                                          (0, $.jsx)(E, {
                                            title: `Voir la fiche employé`,
                                            children: (0, $.jsx)(r, {
                                              size: `small`,
                                              color: `primary`,
                                              onClick: () =>
                                                t(
                                                  `/domaine2_Gestion_Administrative_Personnel/employes/fiche?id=${e.employee_id}`,
                                                ),
                                              children: (0, $.jsx)(C, { fontSize: `small` }),
                                            }),
                                          }),
                                      }),
                                    }),
                                ],
                              },
                              e.id || i,
                            ),
                          ),
                          Y.length === 0 &&
                            (0, $.jsx)(b, {
                              children: (0, $.jsxs)(v, {
                                colSpan: n.columns.length + +!!n.canCreate,
                                align: `center`,
                                sx: { py: 4, color: `text.secondary` },
                                children: [`Aucun enregistrement`, P ? ` trouvé pour cette recherche` : ``],
                              }),
                            }),
                        ],
                      }),
                    ],
                  }),
                }),
                q.length > 0 &&
                  (0, $.jsx)(g, {
                    component: `div`,
                    count: q.length,
                    page: T,
                    onPageChange: (e, t) => A(t),
                    rowsPerPage: j,
                    onRowsPerPageChange: (e) => {
                      (N(parseInt(e.target.value)), A(0));
                    },
                    rowsPerPageOptions: [10, 20, 50],
                    labelRowsPerPage: `Lignes:`,
                    labelDisplayedRows: ({ from: e, to: t, count: n }) => `${e}-${t} sur ${n}`,
                    sx: { mt: 1 },
                  }),
              ],
            }),
          }),
          n.canCreate &&
            z &&
            (0, $.jsxs)(f, {
              open: z,
              onClose: () => V(!1),
              maxWidth: `sm`,
              fullWidth: !0,
              children: [
                (0, $.jsxs)(h, {
                  sx: { fontWeight: 700, display: `flex`, alignItems: `center`, gap: 1 },
                  children: [(0, $.jsx)(x, { color: `success` }), ` Nouveau — `, n.title],
                }),
                (0, $.jsx)(p, {
                  children: (0, $.jsxs)(o, {
                    spacing: 1.5,
                    sx: { mt: 1 },
                    children: [
                      (0, $.jsx)(c, {
                        severity: `info`,
                        sx: { fontSize: `0.75rem` },
                        children: `Sélectionnez un employé et remplissez les informations. Les champs marqués * sont obligatoires.`,
                      }),
                      (0, $.jsx)(D, {
                        select: !0,
                        size: `small`,
                        label: `Employé *`,
                        fullWidth: !0,
                        value: U.employee_id || ``,
                        onChange: (e) => W({ ...U, employee_id: e.target.value }),
                        children: H.map((e) =>
                          (0, $.jsxs)(
                            s,
                            { value: e.id, children: [e.matricule, ` — `, B(e), ` (`, e.statut, `)`] },
                            e.id,
                          ),
                        ),
                      }),
                      e === `avenants` &&
                        (0, $.jsxs)($.Fragment, {
                          children: [
                            (0, $.jsx)(D, {
                              select: !0,
                              size: `small`,
                              label: `Type modification`,
                              fullWidth: !0,
                              value: U.type_modification || `Salaire`,
                              onChange: (e) => W({ ...U, type_modification: e.target.value }),
                              children: M.type_avenant.map((e) => (0, $.jsx)(s, { value: e, children: e }, e)),
                            }),
                            (0, $.jsxs)(o, {
                              direction: `row`,
                              spacing: 1.5,
                              children: [
                                (0, $.jsx)(D, {
                                  size: `small`,
                                  label: `Ancienne valeur`,
                                  fullWidth: !0,
                                  value: U.ancienne_valeur || ``,
                                  onChange: (e) => W({ ...U, ancienne_valeur: e.target.value }),
                                }),
                                (0, $.jsx)(D, {
                                  size: `small`,
                                  label: `Nouvelle valeur`,
                                  fullWidth: !0,
                                  value: U.nouvelle_valeur || ``,
                                  onChange: (e) => W({ ...U, nouvelle_valeur: e.target.value }),
                                }),
                              ],
                            }),
                            (0, $.jsx)(D, {
                              size: `small`,
                              label: `Motif`,
                              fullWidth: !0,
                              value: U.motif || ``,
                              onChange: (e) => W({ ...U, motif: e.target.value }),
                            }),
                            (0, $.jsx)(D, {
                              type: `date`,
                              size: `small`,
                              label: `Date effet`,
                              fullWidth: !0,
                              value: U.date_effet || new Date().toISOString().slice(0, 10),
                              onChange: (e) => W({ ...U, date_effet: e.target.value }),
                              InputLabelProps: { shrink: !0 },
                            }),
                          ],
                        }),
                      e !== `avenants` &&
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          color: `text.secondary`,
                          children: `Formulaire de création pour cet écran — à personnaliser selon le type.`,
                        }),
                    ],
                  }),
                }),
                (0, $.jsxs)(m, {
                  sx: { px: 3, pb: 2 },
                  children: [
                    (0, $.jsx)(l, { onClick: () => V(!1), children: `Annuler` }),
                    (0, $.jsx)(l, {
                      variant: `contained`,
                      startIcon: (0, $.jsx)(x, {}),
                      disabled: !U.employee_id,
                      onClick: () => {
                        if (e === `avenants` && G) {
                          let e = `AVN-2026-${String(G.length + 1).padStart(3, `0`)}`;
                          (G.push({
                            id: `avn-${Date.now()}`,
                            amendment_number: e,
                            contract_id: U.contract_id || `ctr-001`,
                            employee_id: U.employee_id,
                            date_avenant: new Date().toISOString().slice(0, 10),
                            type_modification: U.type_modification || `Salaire`,
                            ancienne_valeur: U.ancienne_valeur || ``,
                            nouvelle_valeur: U.nouvelle_valeur || ``,
                            motif: U.motif || ``,
                            date_effet: U.date_effet || new Date().toISOString().slice(0, 10),
                            statut: `Active`,
                          }),
                            L({ msg: `Avenant ${e} créé avec succès`, severity: `success` }));
                        } else L({ msg: `Enregistrement créé (simulation mock)`, severity: `success` });
                        (V(!1), W({}), A(0));
                      },
                      sx: { bgcolor: `#7e3ff2` },
                      children: `Créer`,
                    }),
                  ],
                }),
              ],
            }),
          (0, $.jsx)(d, {
            open: !!I,
            autoHideDuration: 4e3,
            onClose: () => L(null),
            anchorOrigin: { vertical: `bottom`, horizontal: `center` },
            message: I?.msg,
          }),
        ],
      })
    : (0, $.jsx)(a, { sx: { p: 3 }, children: (0, $.jsxs)(i, { children: [`Écran non configuré: `, e] }) });
}
/* ================================================================
   ABSENCES V2 — Cockpit absentéisme & santé au travail (écran 'absences')
   Pattern SoldesV2 : hydratation autonome (localStorage admina_d2_absences_v2
   ?? seed ?? demandes santé Congés V2), moteur ouvrables + fériés Cameroun
   commun (sldOuvrables/sldFset), conformité Code du travail Cameroun.
   Aucun autre écran du chunk n'utilise ce code (branchement dédié dans ie).
   ================================================================ */
var ABS_LS = `admina_d2_absences_v2`;
var ABS_TYPES = {
  maladie: [`Congé maladie`, 50, `art. 86 CT — demi-salaire après 1 an d'ancienneté (plafond 6 mois/an)`],
  accident_travail: [`Accident du travail`, 100, `loi n° 98/004 — prise en charge CNPS · déclaration sous 48 h`],
  hospitalisation: [`Hospitalisation`, 50, `art. 86 CT — demi-salaire sur justificatif`],
  quarantaine: [`Quarantaine`, 50, `mesure sanitaire — sur justificatif`],
  conge_maternite: [`Congé maternité`, 100, `art. 84 CT — 14 semaines, indemnités journalières CNPS`],
  conge_paternite: [`Congé paternité`, 100, `art. 85 CT — 10 jours à la naissance`],
  absence_autorisee: [`Absence autorisée`, 100, `événement familial / autorisation manager`],
  absence_non_justifiee: [`Absence non justifiée`, 0, `aucune indemnité — procédure art. 34-36 CT au-delà de 8 j`],
};
var ABS_ST = {
  en_attente: [`En attente`, `warning`, `outlined`],
  justifiee: [`Justifiée`, `success`, `outlined`],
  non_justifiee: [`Non justifiée`, `error`, `filled`],
  rejetee: [`Rejetée`, `default`, `outlined`],
};
var ABS_SRC = { base: [`Base`, `default`], conges: [`Congés V2`, `secondary`], v2: [`Déclarée`, `primary`] };
function absStore() {
  try {
    var r = localStorage.getItem(ABS_LS);
    if (r) {
      var s = JSON.parse(r);
      if (s && s.v === 1) return s;
    }
  } catch (err) {}
  return { v: 1, patches: {}, records: [], meta: { coutJour: 15000 } };
}
function absSave(st) {
  try {
    localStorage.setItem(ABS_LS, JSON.stringify(st));
  } catch (err) {}
}
function absLibelle(t) {
  var m = ABS_TYPES[t];
  return m ? m[0] : t || `—`;
}
function absChipStatut(s2) {
  var x2 = ABS_ST[s2] || [s2 || `—`, `default`, `outlined`];
  return (0, $.jsx)(T, { label: x2[0], size: `small`, color: x2[1], variant: x2[2], sx: { fontWeight: 700, fontSize: `0.7rem` } });
}
function absChipSource(src) {
  var x2 = ABS_SRC[src] || [src || `—`, `default`];
  return (0, $.jsx)(T, { label: x2[0], size: `small`, color: x2[1], variant: `outlined`, sx: { fontWeight: 700, fontSize: `0.62rem`, height: 20 } });
}
function absSeed() {
  return re && re.absences && Array.isArray(re.absences.data) ? re.absences.data : [];
}
function absCongesSante() {
  var out = [];
  try {
    (sldDemandes() || []).forEach((q2) => {
      if (q2.type_conge !== `conge_maladie` && q2.type_conge !== `conge_maternite` && q2.type_conge !== `conge_paternite`) return;
      if (q2.statut === `annulee`) return;
      out.push({
        id: `cg-` + q2.id,
        employee_id: q2.employee_id,
        type_absence: q2.type_conge === `conge_maladie` ? `maladie` : q2.type_conge,
        date_debut: q2.date_debut,
        date_fin: q2.date_fin,
        duree_jours: q2.nombre_jours,
        motif: q2.motif || `Congé santé`,
        statut: q2.statut === `approuvee` ? `justifiee` : q2.statut === `en_attente` ? `en_attente` : `rejetee`,
        source: `conges`,
      });
    });
  } catch (err) {}
  return out;
}
function absToutes() {
  var st = absStore(),
    out = [];
  absSeed().forEach((r) => out.push(Object.assign({}, r, { source: `base` })));
  absCongesSante().forEach((r) => out.push(r));
  (st.records || []).forEach((r) => out.push(Object.assign({}, r, { source: `v2` })));
  out.forEach((r) => {
    var p = st.patches && st.patches[r.id];
    if (p) Object.assign(r, p);
  });
  return out;
}
function absCalendaire(d1, d2) {
  if (!d1 || !d2) return 0;
  var n = Math.round((new Date(d2) - new Date(d1)) / 864e5) + 1;
  return n > 0 ? n : 0;
}
function absIndemn(emp, ouvr, tauxPct) {
  var sal = (emp && emp.salaire_brut) || 0;
  return Math.round((sal / 26) * ouvr * (tauxPct / 100));
}
function absAutoExo() {
  var cnt = {};
  absToutes().forEach((r) => {
    var an = String(r.date_debut || ``).slice(0, 4);
    if (an) cnt[an] = (cnt[an] || 0) + 1;
  });
  var meilleur = null,
    max = -1;
  Object.keys(cnt).forEach((an) => {
    if (cnt[an] > max || (cnt[an] === max && an === String(new Date().getFullYear()))) {
      max = cnt[an];
      meilleur = an;
    }
  });
  return meilleur || String(new Date().getFullYear());
}
function absFlags(r, cumulNJ) {
  var auj = new Date().toISOString().slice(0, 10),
    tms = new Date(r.date_debut).getTime(),
    nj = r.statut === `non_justifiee`;
  return {
    cnps: r.type_absence === `accident_travail` && !r.cnps_declare,
    cnpsLate: r.type_absence === `accident_travail` && !r.cnps_declare && new Date().getTime() - tms > 48 * 36e5,
    visite: (r.ouvr || 0) > 3 && !r.visite_prog && r.date_fin && r.date_fin < auj,
    relance: nj && !(r.relances > 0),
    abandon: nj && cumulNJ >= 8,
  };
}
function absBradford(rows) {
  var m = {};
  rows.forEach((r) => {
    if (r.statut === `rejetee` || r.type_absence === `conge_maternite` || r.type_absence === `conge_paternite`) return;
    var e2 = m[r.employee_id] || { S: 0, D: 0 };
    e2.S += 1;
    e2.D += r.ouvr || 0;
    m[r.employee_id] = e2;
  });
  Object.keys(m).forEach((k2) => {
    m[k2].B = m[k2].S * m[k2].S * m[k2].D;
  });
  return m;
}
function AbsKpi(pg) {
  var IC = pg.ic;
  return (0, $.jsxs)(
    a,
    {
      onClick: pg.onClic,
      sx: {
        p: 2,
        borderRadius: 3,
        cursor: `pointer`,
        minWidth: 0,
        bgcolor: `background.paper`,
        background: pg.grad ? `linear-gradient(135deg,#7e3ff2 0%,#9d6bff 100%)` : undefined,
        color: pg.grad ? `#fff` : `text.primary`,
        border: `1px solid`,
        borderColor: pg.actif ? `#7e3ff2` : `divider`,
        boxShadow: pg.actif ? 4 : 1,
        transition: `box-shadow .2s`,
        "&:hover": { boxShadow: 6 },
      },
      children: [
        (0, $.jsx)(IC, { sx: { fontSize: 30, mb: 0.5, color: pg.grad ? `rgba(255,255,255,.92)` : pg.couleur || `primary.main` } }),
        (0, $.jsx)(i, { variant: `h5`, fontWeight: 800, sx: { overflowWrap: `anywhere` }, children: pg.valeur }),
        (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, sx: { color: pg.grad ? `rgba(255,255,255,.9)` : `text.primary` }, children: pg.label }),
        pg.sub
          ? (0, $.jsx)(i, {
              variant: `caption`,
              sx: { display: `block`, mt: 0.5, color: pg.grad ? `rgba(255,255,255,.75)` : `text.secondary` },
              children: pg.sub,
            })
          : null,
      ],
    },
  );
}
function AbsTuile(pg) {
  return (0, $.jsxs)(
    a,
    {
      sx: { border: `1px solid`, borderColor: `divider`, borderRadius: 2, p: 1.5, textAlign: `center`, bgcolor: `background.default` },
      children: [
        (0, $.jsx)(i, { variant: `caption`, sx: { color: `text.secondary`, fontWeight: 600 }, children: pg.label }),
        (0, $.jsx)(i, { variant: `h6`, fontWeight: 800, sx: { color: pg.couleur || `text.primary`, fontSize: `1rem` }, children: pg.valeur }),
      ],
    },
  );
}
function absChipConf(fl) {
  var out = [];
  if (fl.cnpsLate) out.push((0, $.jsx)(T, { key: `c`, label: `CNPS 48 h dépassé`, size: `small`, color: `error`, variant: `filled`, sx: { fontWeight: 700, fontSize: `0.62rem` } }));
  else if (fl.cnps) out.push((0, $.jsx)(T, { key: `c`, label: `CNPS à déclarer`, size: `small`, color: `warning`, variant: `outlined`, sx: { fontWeight: 700, fontSize: `0.62rem` } }));
  if (fl.visite) out.push((0, $.jsx)(T, { key: `v`, label: `Visite reprise due`, size: `small`, color: `warning`, variant: `outlined`, sx: { fontWeight: 700, fontSize: `0.62rem` } }));
  if (fl.relance) out.push((0, $.jsx)(T, { key: `r`, label: `Relance due`, size: `small`, color: `warning`, variant: `outlined`, sx: { fontWeight: 700, fontSize: `0.62rem` } }));
  if (fl.abandon) out.push((0, $.jsx)(T, { key: `a`, label: `Abandon de poste ?`, size: `small`, color: `error`, variant: `filled`, sx: { fontWeight: 700, fontSize: `0.62rem` } }));
  if (out.length === 0)
    out.push((0, $.jsx)(T, { key: `ok`, label: `À jour`, size: `small`, color: `success`, variant: `outlined`, sx: { fontWeight: 700, fontSize: `0.62rem` } }));
  return (0, $.jsx)(a, { sx: { display: `flex`, gap: 0.5, flexWrap: `wrap` }, children: out });
}

function AbsencesV2() {
  var nav = O(),
    AN = new Date().getFullYear(),
    stTick = (0, Q.useState)(0),
    tick = stTick[0],
    setTick = stTick[1],
    stRech = (0, Q.useState)(``),
    rech = stRech[0],
    setRech = stRech[1],
    stDept = (0, Q.useState)(`tous`),
    dept = stDept[0],
    setDept = stDept[1],
    stStatut = (0, Q.useState)(`tous`),
    statutF = stStatut[0],
    setStatutF = stStatut[1],
    stType = (0, Q.useState)(`tous`),
    typeF = stType[0],
    setTypeF = stType[1],
    stExo = (0, Q.useState)(absAutoExo),
    exo = stExo[0],
    setExo = stExo[1],
    stTri = (0, Q.useState)({ key: `debut`, dir: `desc` }),
    tri = stTri[0],
    setTri = stTri[1],
    stPage = (0, Q.useState)(0),
    page = stPage[0],
    setPage = stPage[1],
    stPp = (0, Q.useState)(10),
    pp = stPp[0],
    setPp = stPp[1],
    stDet = (0, Q.useState)(null),
    detail = stDet[0],
    setDetail = stDet[1],
    stSnk = (0, Q.useState)(null),
    snack = stSnk[0],
    setSnack = stSnk[1],
    stSyn = (0, Q.useState)(new Date()),
    sync = stSyn[0],
    setSync = stSyn[1],
    stNew = (0, Q.useState)(!1),
    dlgNew = stNew[0],
    setDlgNew = stNew[1],
    stPar = (0, Q.useState)(!1),
    dlgPar = stPar[0],
    setDlgPar = stPar[1],
    stVDate = (0, Q.useState)(``),
    vDate = stVDate[0],
    setVDate = stVDate[1],
    stEmpNew = (0, Q.useState)(``),
    empNew = stEmpNew[0],
    setEmpNew = stEmpNew[1],
    stTypeNew = (0, Q.useState)(`maladie`),
    typeNew = stTypeNew[0],
    setTypeNew = stTypeNew[1],
    stD1New = (0, Q.useState)(``),
    d1New = stD1New[0],
    setD1New = stD1New[1],
    stD2New = (0, Q.useState)(``),
    d2New = stD2New[0],
    setD2New = stD2New[1],
    stMotifNew = (0, Q.useState)(``),
    motifNew = stMotifNew[0],
    setMotifNew = stMotifNew[1],
    stCout = (0, Q.useState)(15000),
    cout = stCout[0],
    setCout = stCout[1];
  var roleAct = window.__congesD2Role || `drh`,
    estEmploye = roleAct === `employe`,
    metaCg = sldStoreMeta(),
    empSim = (metaCg && metaCg.emploiSimule) || `emp-002`,
    FER = sldFset();
  /* — Fusion temps réel : seed + Congés V2 santé + déclarations locales — */
  var ALL = (0, Q.useMemo)(() => {
    var st = absStore(),
      cumulNJ = {};
    var cj = (st.meta && st.meta.coutJour) || 15000;
    var base = absToutes().map((r) => {
      var ouvr = sldOuvrables(r.date_debut, r.date_fin, FER);
      var emp = R(r.employee_id);
      return Object.assign({}, r, {
        ouvr: ouvr,
        cal: absCalendaire(r.date_debut, r.date_fin),
        annee: String(r.date_debut || ``).slice(0, 4),
        tm: ABS_TYPES[r.type_absence] || [absLibelle(r.type_absence), 0, ``],
        emp: emp,
        indem: absIndemn(emp, ouvr, (ABS_TYPES[r.type_absence] || [0, 0])[1]),
        coutR: r.statut === `non_justifiee` ? ouvr * cj : 0,
      });
    });
    base.forEach((r) => {
      if (r.statut === `non_justifiee`) cumulNJ[r.employee_id] = (cumulNJ[r.employee_id] || 0) + r.ouvr;
    });
    base.forEach((r) => {
      r.fl = absFlags(r, cumulNJ[r.employee_id] || 0);
    });
    return base;
  }, [tick]);
  var brad = (0, Q.useMemo)(() => {
    var scope = ALL.filter((r) => exo === `tous` || r.annee === exo);
    return absBradford(scope);
  }, [ALL, exo]);
  var rows = (0, Q.useMemo)(() => {
    return ALL.filter((r) => {
      if (estEmploye && r.employee_id !== empSim) return !1;
      if (exo !== `tous` && !estEmploye && r.annee !== exo) return !1;
      if (dept !== `tous` && (!r.emp || r.emp.departement !== dept)) return !1;
      if (typeF !== `tous` && r.type_absence !== typeF) return !1;
      if (statutF === `a_reguler`) {
        if (!(r.fl.cnpsLate || r.fl.cnps || r.fl.visite || r.fl.relance || r.fl.abandon || r.statut === `en_attente`)) return !1;
      } else if (statutF === `recommande`) {
        var bb = brad[r.employee_id];
        if (!bb || bb.B < 450) return !1;
      } else if (statutF !== `tous` && r.statut !== statutF) return !1;
      if (rech) {
        var q2 = rech.toLowerCase(),
          nm = r.emp ? B(r.emp).toLowerCase() : ``;
        if (!nm.includes(q2) && !String(r.motif || ``).toLowerCase().includes(q2) && !String(absLibelle(r.type_absence)).toLowerCase().includes(q2) && !String((r.emp && r.emp.matricule) || ``).toLowerCase().includes(q2) && !String((r.emp && r.emp.departement) || ``).toLowerCase().includes(q2) && !String(r.employee_id || ``).toLowerCase().includes(q2)) return !1;
      }
      return !0;
    });
  }, [ALL, exo, dept, typeF, statutF, rech, brad, estEmploye, empSim]);
  var srt = rows.slice().sort((r1, r2) => {
    var k1, k2;
    switch (tri.key) {
      case `employe`:
        k1 = r1.emp ? B(r1.emp) : ``;
        k2 = r2.emp ? B(r2.emp) : ``;
        break;
      case `dept`:
        k1 = (r1.emp && r1.emp.departement) || ``;
        k2 = (r2.emp && r2.emp.departement) || ``;
        break;
      case `type`:
        k1 = absLibelle(r1.type_absence);
        k2 = absLibelle(r2.type_absence);
        break;
      case `duree`:
        k1 = r1.ouvr;
        k2 = r2.ouvr;
        break;
      case `cout`:
        k1 = r1.indem + r1.coutR;
        k2 = r2.indem + r2.coutR;
        break;
      case `statut`:
        k1 = r1.statut || ``;
        k2 = r2.statut || ``;
        break;
      default:
        k1 = r1.date_debut || ``;
        k2 = r2.date_debut || ``;
    }
    var cmp = typeof k1 === `string` ? k1.localeCompare(k2) : k1 - k2;
    return tri.dir === `asc` ? cmp : -cmp;
  });
  var kpi = (0, Q.useMemo)(() => {
    var jours = 0,
      coutTot = 0,
      aReg = 0,
      bradf = 0;
    var scope = ALL.filter((r) => estEmploye ? r.employee_id === empSim : !0).filter((r) => exo === `tous` || r.annee === exo);
    scope.forEach((r) => {
      if (r.statut !== `rejetee`) jours += r.ouvr;
      coutTot += r.indem + r.coutR;
      if (r.fl.cnpsLate || r.fl.cnps || r.fl.visite || r.fl.relance || r.fl.abandon || r.statut === `en_attente`) aReg++;
    });
    Object.keys(brad).forEach((k2) => {
      if (brad[k2].B >= 450) bradf++;
    });
    var jOuvrPeriode = sldOuvrables(AN + `-01-01`, new Date().toISOString().slice(0, 10), FER),
      eff = estEmploye ? 1 : H.length,
      tauxAbs = exo === String(AN) && jOuvrPeriode > 0 ? Math.round(((jours / (eff * jOuvrPeriode)) * 100) * 10) / 10 : null;
    return { jours: jours, coutTot: coutTot, aReg: aReg, bradf: bradf, tauxAbs: tauxAbs };
  }, [ALL, exo, brad, estEmploye, empSim, tick]);
  var alCNPS = rows.filter((r) => r.fl.cnpsLate || r.fl.cnps),
    alAbandon = rows.filter((r) => r.fl.abandon),
    alVisite = rows.filter((r) => r.fl.visite),
    alRelance = rows.filter((r) => r.fl.relance),
    alBrad = rows.filter((r) => {
      var bb = brad[r.employee_id];
      return bb && bb.B >= 450 && r === rows.find((x2) => x2.employee_id === r.employee_id);
    }),
    alMat = rows.filter((r) => r.type_absence === `conge_maternite` && r.statut === `justifiee`);
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    H.forEach((e2) => e2.departement && s2.add(e2.departement));
    return Array.from(s2).sort();
  }, []);
  var fRefresh = () => {
    ((SLD_FSET = null), setSync(new Date()), setTick(tick + 1), setSnack({ msg: `Dossiers recalculés — sources : base + Congés Annuels V2 + déclarations locales`, sev: `success` }));
  };
  var fTri = (key) => setTri((tr) => ({ key: key, dir: tr.key === key && tr.dir === `asc` ? `desc` : `asc` }));
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: { fontWeight: 700, whiteSpace: `nowrap`, bgcolor: `background.default` },
        children: (0, $.jsxs)(a, {
          sx: { display: `inline-flex`, alignItems: `center`, gap: 0.5, cursor: `pointer`, userSelect: `none`, "&:hover": { color: `primary.main` } },
          onClick: () => fTri(key),
          children: [
            label,
            tri.key === key
              ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, { sx: { fontSize: 15, color: `primary.main` } })
              : (0, $.jsx)(a, { sx: { width: 15 } }),
          ],
        }),
      },
      key,
    );
  var fPatch = (id, patch, msg) => {
    var st = absStore();
    st.patches = st.patches || {};
    st.patches[id] = Object.assign({}, st.patches[id], patch);
    absSave(st);
    setTick(tick + 1);
    setSnack({ msg: msg, sev: `success` });
  };
  var fCnps = (r) => fPatch(r.id, { cnps_declare: 1, cnps_date: new Date().toISOString().slice(0, 10) }, `Accident du travail déclaré à la CNPS — délai légal de 48 h couvert (loi n° 98/004).`);
  var fVisite = (r) => {
    if (!vDate) return setSnack({ msg: `Choisissez d'abord la date de la visite de reprise.`, sev: `warning` });
    var id = r.id;
    fPatch(id, { visite_prog: 1, visite_date: vDate }, `Visite de reprise programmée le ` + A(vDate) + ` (médecine du travail).`);
    setVDate(``);
    setDetail(null);
  };
  var fJustifie = (r) => fPatch(r.id, { statut: `justifiee`, justifie_le: new Date().toISOString().slice(0, 10) }, `Justificatif enregistré — dossier marqué justifié.`);
  var fRelance = (r) => fPatch(r.id, { relances: (r.relances || 0) + 1, relance_date: new Date().toISOString().slice(0, 10) }, `Relance justificatif enregistrée (rappel au salarié).`);
  var fRejete = (r) => fPatch(r.id, { statut: `rejetee` }, `Dossier rejeté — l'absence reste non justifiée.`);
  var fNew = () => {
    if (!empNew || !d1New || !d2New) return setSnack({ msg: `Employé, dates de début et de fin obligatoires.`, sev: `warning` });
    if (d2New < d1New) return setSnack({ msg: `La date de fin précède la date de début.`, sev: `error` });
    var st = absStore();
    st.records = st.records || [];
    st.records.push({
      id: `abv2-` + Date.now(),
      employee_id: empNew,
      type_absence: typeNew,
      date_debut: d1New,
      date_fin: d2New,
      duree_jours: absCalendaire(d1New, d2New),
      motif: motifNew || absLibelle(typeNew),
      statut: `en_attente`,
      source: `v2`,
      date_declaration: new Date().toISOString().slice(0, 10),
    });
    absSave(st);
    ((setDlgNew(!1), setD1New(``), setD2New(``), setMotifNew(``), setTick(tick + 1)),
      setSnack({ msg: `Absence déclarée — dossier en attente de justificatif (` + sldOuvrables(d1New, d2New, FER) + ` j ouvrables).`, sev: `success` }));
  };
  var fSaveParams = () => {
    var st = absStore();
    st.meta = st.meta || {};
    st.meta.coutJour = Math.max(0, parseInt(cout, 10) || 0);
    absSave(st);
    ((setDlgPar(!1), setTick(tick + 1)), setSnack({ msg: `Paramètres enregistrés — coûts recalculés.`, sev: `success` }));
  };
  var fExport = () => {
    var entetes = [`Matricule`, `Employé`, `Département`, `Type`, `Du`, `Au`, `Durée ouvrable (j)`, `Durée calendaire (j)`, `Statut`, `Justificatif reçu le`, `CNPS déclarée`, `Visite de reprise`, `Relances`, `Indemnité estimée (FCFA)`, `Coût remplacement (FCFA)`, `Conformité`, `Exercice`, `Source`],
      lignes = srt.map((r) => {
        var conf = r.fl.cnpsLate ? `CNPS 48 h dépassé` : r.fl.cnps ? `CNPS à déclarer` : r.fl.abandon ? `Abandon de poste (art. 34-36)` : r.fl.visite ? `Visite de reprise due` : r.fl.relance ? `Relance justificatif due` : `À jour`;
        return [
          (r.emp && r.emp.matricule) || ``,
          r.emp ? B(r.emp) : ``,
          (r.emp && r.emp.departement) || ``,
          absLibelle(r.type_absence),
          A(r.date_debut),
          A(r.date_fin),
          r.ouvr,
          r.cal,
          ABS_ST[r.statut] ? ABS_ST[r.statut][0] : r.statut,
          r.justifie_le ? A(r.justifie_le) : ``,
          r.cnps_declare ? (r.cnps_date ? A(r.cnps_date) : `oui`) : `non`,
          r.visite_prog ? (r.visite_date ? A(r.visite_date) : `programmée`) : `non`,
          r.relances || 0,
          r.indem,
          r.coutR,
          conf,
          r.annee,
          ABS_SRC[r.source] ? ABS_SRC[r.source][0] : r.source,
        ]
          .map((x2) => `"${String(x2 == null ? `` : x2).replace(/"/g, `""`)}"`)
          .join(`;`);
      }),
      csv = `﻿` + entetes.join(`;`) + `
` + lignes.join(`
`),
      bl = new Blob([csv], { type: `text/csv;charset=utf-8;` }),
      ur = URL.createObjectURL(bl),
      an2 = document.createElement(`a`);
    ((an2.href = ur), (an2.download = `absences_${exo}_${new Date().toISOString().slice(0, 10)}.csv`), an2.click(), URL.revokeObjectURL(ur));
    setSnack({ msg: srt.length + ` dossier(s) exporté(s) — valeurs réelles (durées ouvrables, indemnités, conformité)`, sev: `success` });
  };
  var openDet = (r2) => { if (r2 && r2.fl === undefined) { try { console.error('AB2DBG detail sans fl:', JSON.stringify(r2).slice(0, 400)); } catch (err) {} } (setVDate(``), setDetail(r2)); };
  var absDlgDetail = () =>
    (0, $.jsxs)(f, { open: !!detail, onClose: () => setDetail(null), maxWidth: `md`, fullWidth: !0, children: [
      detail
        ? (0, $.jsxs)(h, { sx: { fontWeight: 800, display: `flex`, alignItems: `center`, gap: 1.5 }, children: [
            sldAvatar(detail.emp || {}, 44, 18),
            (0, $.jsxs)(a, { children: [
              (0, $.jsx)(i, { variant: `h6`, fontWeight: 800, children: detail.emp ? B(detail.emp) : detail.employee_id }),
              (0, $.jsx)(i, { variant: `caption`, color: `text.secondary`, children: ((detail.emp && detail.emp.poste) || ``) + ` · ` + ((detail.emp && detail.emp.departement) || ``) + ` · ` + ((detail.emp && detail.emp.matricule) || ``) }),
            ] }),
            (0, $.jsx)(a, { sx: { ml: `auto`, display: `flex`, gap: 1, alignItems: `center` }, children: [absChipSource(detail.source), absChipStatut(detail.statut)] }),
          ] })
        : null,
      detail
        ? (0, $.jsxs)(p, { children: [
            detail.fl.cnpsLate
              ? (0, $.jsx)(c, { severity: `error`, sx: { mb: 2, fontWeight: 600 }, children: `Délai CNPS de 48 h dépassé sans déclaration (loi n° 98/004) — déclarez immédiatement pour sécuriser la prise en charge.` })
              : null,
            detail.fl.abandon
              ? (0, $.jsx)(c, { severity: `error`, sx: { mb: 2, fontWeight: 600 }, children: `Cumul ≥ 8 jours ouvrables non justifiés — procédure disciplinaire / abandon de poste (art. 34-36 CT) à engager.` })
              : null,
            detail.fl.visite
              ? (0, $.jsx)(c, { severity: `warning`, sx: { mb: 2, fontWeight: 600 }, children: `Arrêt de plus de 3 jours : visite de reprise à programmer avec la médecine du travail.` })
              : null,
            detail.fl.relance
              ? (0, $.jsx)(c, { severity: `warning`, sx: { mb: 2, fontWeight: 600 }, children: `Aucun justificatif reçu — relancez le salarié (J+2) et tracez la démarche.` })
              : null,
            (0, $.jsxs)(a, { sx: { display: `grid`, gridTemplateColumns: { xs: `repeat(3,1fr)`, sm: `repeat(6,1fr)` }, gap: 1.5 }, children: [
              (0, $.jsx)(AbsTuile, { label: `Type`, valeur: absLibelle(detail.type_absence) }),
              (0, $.jsx)(AbsTuile, { label: `Durée ouvrable`, valeur: detail.ouvr + ` j` }),
              (0, $.jsx)(AbsTuile, { label: `Durée calendaire`, valeur: detail.cal + ` j` }),
              (0, $.jsx)(AbsTuile, { label: `Taux légal`, valeur: detail.tm[1] + ` %` }),
              (0, $.jsx)(AbsTuile, { label: `Indemnité estimée`, valeur: sldFCFA(detail.indem), couleur: detail.indem > 0 ? `success.main` : `text.primary` }),
              (0, $.jsx)(AbsTuile, { label: `Coût remplacement`, valeur: detail.coutR > 0 ? sldFCFA(detail.coutR) : `—`, couleur: detail.coutR > 0 ? `error.main` : `text.primary` }),
            ] }),
            (0, $.jsx)(i, { variant: `caption`, sx: { display: `block`, mt: 1, color: `text.secondary` }, children: (detail.tm[2] || ``) + (detail.emp && detail.emp.salaire_brut ? ` · base : salaire brut / 26 × jours ouvrables × taux` : ``) }),
            (0, $.jsx)(i, { variant: `subtitle2`, sx: { mt: 2, mb: 1, fontWeight: 800 }, children: `Conformité & actions` }),
            (0, $.jsxs)(o, { direction: `row`, spacing: 1, sx: { flexWrap: `wrap`, rowGap: 1.5, alignItems: `center` }, children: [
              detail.type_absence === `accident_travail`
                ? detail.cnps_declare
                  ? (0, $.jsx)(T, { label: `CNPS déclarée` + (detail.cnps_date ? ` le ` + A(detail.cnps_date) : ``), color: `success`, variant: `outlined`, sx: { fontWeight: 700 } })
                  : (0, $.jsx)(l, { variant: `contained`, color: `error`, size: `small`, startIcon: (0, $.jsx)(GVL, {}), onClick: () => fCnps(detail), sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Déclarer à la CNPS` })
                : null,
              detail.ouvr > 3
                ? detail.visite_prog
                  ? (0, $.jsx)(T, { label: `Visite de reprise` + (detail.visite_date ? ` — ` + A(detail.visite_date) : ` programmée`), color: `success`, variant: `outlined`, sx: { fontWeight: 700 } })
                  : (0, $.jsxs)(a, { sx: { display: `flex`, gap: 1, alignItems: `center`, flexWrap: `wrap` }, children: [
                      (0, $.jsx)(D, { type: `date`, size: `small`, label: `Date visite`, value: vDate, onChange: (e2) => setVDate(e2.target.value), InputLabelProps: { shrink: !0 }, sx: { width: 175, "& .MuiInput-root": { fontSize: `0.8rem` } } }),
                      (0, $.jsx)(l, { variant: `contained`, size: `small`, startIcon: (0, $.jsx)(SCH, {}), onClick: () => fVisite(detail), sx: { textTransform: `none`, fontSize: `0.75rem`, bgcolor: `#7e3ff2` }, children: `Programmer` }),
                    ] })
                : null,
              detail.statut === `en_attente` || detail.statut === `non_justifiee`
                ? (0, $.jsxs)(o, { direction: `row`, spacing: 1, children: [
                    (0, $.jsx)(l, { variant: `contained`, size: `small`, startIcon: (0, $.jsx)(RCPT, {}), onClick: () => { (fJustifie(detail), setDetail(null)); }, sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Certificat reçu — justifier` }),
                    (0, $.jsx)(l, { variant: `outlined`, size: `small`, startIcon: (0, $.jsx)(RF, {}), onClick: () => fRelance(detail), sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Relancer (` + (detail.relances || 0) + `)` }),
                    detail.statut === `en_attente`
                      ? (0, $.jsx)(l, { variant: `outlined`, color: `error`, size: `small`, onClick: () => { (fRejete(detail), setDetail(null)); }, sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Rejeter` })
                      : null,
                  ] })
                : null,
            ] }),
            (0, $.jsx)(i, { variant: `subtitle2`, sx: { mt: 2.5, mb: 1, fontWeight: 800 }, children: `Historique du dossier` }),
            (0, $.jsx)(a, { sx: { display: `flex`, flexDirection: `column`, gap: 0.75 }, children: [
              [`Déclarée — ` + A(detail.date_debut) + ` · motif : ` + (detail.motif || `—`), CT, `primary.main`],
              detail.justifie_le ? [`Justificatif reçu — ` + A(detail.justifie_le), RCPT, `success.main`] : null,
              detail.cnps_declare ? [`Déclarée à la CNPS` + (detail.cnps_date ? ` — ` + A(detail.cnps_date) : ``), GVL, `success.main`] : null,
              detail.relances > 0 ? [detail.relances + ` relance(s) — dernière le ` + A(detail.relance_date), RF, `warning.main`] : null,
              [`Fin d'arrêt — ` + A(detail.date_fin), AT, `text.secondary`],
              detail.visite_prog ? [`Visite de reprise` + (detail.visite_date ? ` — ` + A(detail.visite_date) : ` programmée`), SCH, `success.main`] : null,
            ]
              .filter(Boolean)
              .map((li, ix) =>
                (0, $.jsxs)(a, { sx: { display: `flex`, alignItems: `center`, gap: 1.2 }, children: [
                  (0, $.jsx)(li[1], { sx: { fontSize: 16, color: li[2] } }),
                  (0, $.jsx)(i, { variant: `body2`, children: li[0] }),
                ] }, ix),
              ) }),
          ] })
        : null,
      (0, $.jsxs)(m, { sx: { px: 3, pb: 2 }, children: [
        (0, $.jsx)(l, { onClick: () => setDetail(null), children: `Fermer` }),
        detail && detail.source === `conges`
          ? (0, $.jsx)(l, { variant: `contained`, startIcon: (0, $.jsx)(CT, {}), onClick: () => nav(`/domaine2_Gestion_Administrative_Personnel/conges`), sx: { bgcolor: `#7e3ff2`, textTransform: `none` }, children: `Ouvrir Congés Annuels` })
          : null,
        detail
          ? (0, $.jsx)(l, { variant: `outlined`, onClick: () => { (setRech(detail.emp ? B(detail.emp) : detail.employee_id), setDetail(null), setPage(0)); }, sx: { textTransform: `none` }, children: `Voir tous ses dossiers` })
          : null,
      ] }),
    ] });
  var absDlgNew = () =>
    (0, $.jsxs)(f, { open: dlgNew, onClose: () => setDlgNew(!1), maxWidth: `sm`, fullWidth: !0, children: [
      (0, $.jsx)(h, { sx: { fontWeight: 800 }, children: `Déclarer une absence` }),
      (0, $.jsxs)(p, { sx: { display: `flex`, flexDirection: `column`, gap: 2 }, children: [
        (0, $.jsx)(c, { severity: `info`, children: `Le dossier démarre « En attente » — justificatif à fournir sous 48 h. Durées recalculées automatiquement en jours ouvrables (week-ends et fériés Cameroun déduits).` }),
        (0, $.jsxs)(D, { select: !0, size: `small`, label: `Employé`, value: empNew, onChange: (e2) => setEmpNew(e2.target.value), disabled: estEmploye, sx: { "& .MuiInput-root": { fontSize: `0.85rem` } }, children: [
          (0, $.jsx)(s, { value: ``, children: `— Choisir un employé —` }),
          H.map((e3) => (0, $.jsx)(s, { value: e3.id, children: B(e3) + ` · ` + (e3.departement || ``) }, e3.id)),
        ] }),
        (0, $.jsxs)(D, { select: !0, size: `small`, label: `Type d'absence`, value: typeNew, onChange: (e2) => setTypeNew(e2.target.value), sx: { "& .MuiInput-root": { fontSize: `0.85rem` } }, children:
          Object.keys(ABS_TYPES).map((tk) => (0, $.jsx)(s, { value: tk, children: ABS_TYPES[tk][0] }, tk)),
        }),
        (0, $.jsxs)(a, { sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 }, children: [
          (0, $.jsx)(D, { type: `date`, size: `small`, label: `Du`, value: d1New, onChange: (e2) => setD1New(e2.target.value), InputLabelProps: { shrink: !0 }, sx: { "& .MuiInput-root": { fontSize: `0.85rem` } } }),
          (0, $.jsx)(D, { type: `date`, size: `small`, label: `Au`, value: d2New, onChange: (e2) => setD2New(e2.target.value), InputLabelProps: { shrink: !0 }, sx: { "& .MuiInput-root": { fontSize: `0.85rem` } } }),
        ] }),
        d1New && d2New && d2New >= d1New
          ? (0, $.jsx)(i, { variant: `caption`, color: `text.secondary`, children: `Durée : ` + sldOuvrables(d1New, d2New, FER) + ` j ouvrables / ` + absCalendaire(d1New, d2New) + ` j calendaires · indemnité estimée ` + sldFCFA(absIndemn(R(empNew), sldOuvrables(d1New, d2New, FER), ABS_TYPES[typeNew][1])) })
          : null,
        (0, $.jsx)(D, { size: `small`, label: `Motif (facultatif)`, value: motifNew, onChange: (e2) => setMotifNew(e2.target.value), sx: { "& .MuiInput-root": { fontSize: `0.85rem` } } }),
      ] }),
      (0, $.jsxs)(m, { sx: { px: 3, pb: 2 }, children: [
        (0, $.jsx)(l, { onClick: () => setDlgNew(!1), children: `Annuler` }),
        (0, $.jsx)(l, { variant: `contained`, onClick: fNew, sx: { bgcolor: `#7e3ff2`, textTransform: `none` }, children: `Enregistrer le dossier` }),
      ] }),
    ] });
  var absDlgParams = () =>
    (0, $.jsxs)(f, { open: dlgPar, onClose: () => setDlgPar(!1), maxWidth: `xs`, fullWidth: !0, children: [
      (0, $.jsx)(h, { sx: { fontWeight: 800 }, children: `Paramètres de coûts` }),
      (0, $.jsxs)(p, { sx: { display: `flex`, flexDirection: `column`, gap: 2 }, children: [
        (0, $.jsx)(D, { type: `number`, size: `small`, label: `Coût journalier de remplacement (FCFA)`, value: cout, onChange: (e2) => setCout(e2.target.value), sx: { "& .MuiInput-root": { fontSize: `0.85rem` } } }),
        (0, $.jsx)(i, { variant: `caption`, color: `text.secondary`, children: `Appliqué aux seules absences non justifiées (coût de remplacement). Les indemnités légales utilisent salaire brut / 26 × jours ouvrables × taux réglementaire : ` + Object.keys(ABS_TYPES).map((tk) => absLibelle(tk) + ` ` + ABS_TYPES[tk][1] + ` %`).join(` · `) + `.` }),
      ] }),
      (0, $.jsxs)(m, { sx: { px: 3, pb: 2 }, children: [
        (0, $.jsx)(l, { onClick: () => setDlgPar(!1), children: `Annuler` }),
        (0, $.jsx)(l, { variant: `contained`, onClick: fSaveParams, sx: { bgcolor: `#7e3ff2`, textTransform: `none` }, children: `Enregistrer` }),
      ] }),
    ] });
  /* — Vue salarié (RGPD, rôle Employé) : uniquement ses propres dossiers — */
  var jRestants = Math.max(0, Math.ceil((new Date(AN, 11, 31) - new Date()) / 864e5));
  if (estEmploye) {
    var mes = srt,
      mesJours = mes.filter((r) => r.statut !== `rejetee`).reduce((s2, r) => s2 + r.ouvr, 0),
      mesAtt = mes.filter((r) => r.statut === `en_attente`).length,
      mesIndem = mes.filter((r) => r.statut !== `rejetee`).reduce((s2, r) => s2 + r.indem, 0),
      moEmp = R(empSim) || {},
      prochain = mes
        .filter((r) => r.date_fin >= new Date().toISOString().slice(0, 10))
        .sort((r1, r2) => (r1.date_fin > r2.date_fin ? 1 : -1))[0];
    return (0, $.jsxs)(a, {
      children: [
        (0, $.jsx)(c, { severity: `info`, sx: { mb: 2.5, fontWeight: 600 }, children: `Vue salarié — vous consultez uniquement vos propres dossiers d'absence (confidentialité RGPD).` }),
        (0, $.jsx)(J, {
          title: `Mes absences & arrêts`,
          subtitle: `Historique complet (tous exercices) · décompte en jours ouvrables (fériés Cameroun déduits)`,
          action: (0, $.jsx)(l, { variant: `outlined`, size: `small`, startIcon: (0, $.jsx)(RF, {}), onClick: fRefresh, sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Actualiser` }),
        }),
        (0, $.jsx)(ee, {
          sx: { mt: 2, borderRadius: 3 },
          children: (0, $.jsxs)(u, {
            children: [
              (0, $.jsxs)(o, { direction: `row`, spacing: 2, alignItems: `center`, sx: { mb: 2 }, children: [
                sldAvatar(moEmp, 56, 22),
                (0, $.jsxs)(a, { children: [
                  (0, $.jsx)(i, { variant: `h6`, fontWeight: 800, children: B(moEmp) }),
                  (0, $.jsx)(i, { variant: `body2`, color: `text.secondary`, children: (moEmp.poste || ``) + ` · ` + (moEmp.departement || ``) + ` · ` + (moEmp.matricule || ``) }),
                ] }),
                (0, $.jsx)(a, { sx: { ml: `auto` }, children: (0, $.jsx)(l, { variant: `contained`, size: `small`, startIcon: (0, $.jsx)(x, {}), onClick: () => { (setEmpNew(empSim), setDlgNew(!0)); }, sx: { textTransform: `none`, fontSize: `0.75rem`, bgcolor: `#7e3ff2` }, children: `Déclarer une absence` }) }),
              ] }),
              (0, $.jsxs)(a, { sx: { display: `grid`, gridTemplateColumns: `repeat(auto-fit,minmax(130px,1fr))`, gap: 1.5 }, children: [
                (0, $.jsx)(AbsTuile, { label: `Jours d'absence`, valeur: mesJours + ` j` }),
                (0, $.jsx)(AbsTuile, { label: `Dossiers en cours`, valeur: String(mesAtt), couleur: mesAtt > 0 ? `warning.main` : null }),
                (0, $.jsx)(AbsTuile, { label: `Indemnités estimées`, valeur: sldFCFA(mesIndem) }),
                (0, $.jsx)(AbsTuile, { label: `Prochain retour`, valeur: prochain ? A(prochain.date_fin) : `—` }),
              ] }),
              (0, $.jsx)(i, { variant: `subtitle2`, sx: { mt: 2.5, mb: 1, fontWeight: 800 }, children: `Mes dossiers — ` + mes.length }),
              mes.length === 0
                ? (0, $.jsx)(i, { variant: `body2`, color: `text.secondary`, children: `Aucun dossier d'absence sur cet exercice. Déclarez toute absence dès le premier jour (justificatif sous 48 h).` })
                : (0, $.jsx)(a, { sx: { display: `flex`, flexDirection: `column`, gap: 1 }, children: mes.map((r) =>
                    (0, $.jsxs)(
                      a,
                      { sx: { display: `flex`, alignItems: `center`, gap: 1.5, p: 1, borderRadius: 2, border: `1px solid`, borderColor: `divider`, flexWrap: `wrap` }, children: [
                        (0, $.jsx)(CT, { sx: { fontSize: 18, color: `primary.main` } }),
                        (0, $.jsxs)(a, { sx: { minWidth: 0 }, children: [
                          (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, children: absLibelle(r.type_absence) + ` · ` + A(r.date_debut) + ` → ` + A(r.date_fin) }),
                          (0, $.jsx)(i, { variant: `caption`, color: `text.secondary`, children: r.ouvr + ` j ouvrables · ` + (r.motif || ``) }),
                        ] }),
                        (0, $.jsx)(a, { sx: { ml: `auto` }, children: absChipStatut(r.statut) }),
                      ] },
                      r.id,
                    ),
                  ) }),
              (0, $.jsxs)(o, { direction: `row`, spacing: 1.5, sx: { mt: 2.5 }, children: [
                (0, $.jsx)(l, { variant: `outlined`, size: `small`, startIcon: (0, $.jsx)(CT, {}), onClick: () => nav(`/domaine2_Gestion_Administrative_Personnel/conges`), sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Mes congés annuels` }),
              ] }),
            ],
          }),
        }),
        absDlgNew(),
        (0, $.jsx)(d, { open: !!snack, autoHideDuration: 4e3, onClose: () => setSnack(null), anchorOrigin: { vertical: `bottom`, horizontal: `center` }, message: snack ? snack.msg : `` }),
      ],
    });
  }
  /* — Vue RH / Manager : cockpit absentéisme complet — */
  return (0, $.jsxs)(o, {
    spacing: 2.5,
    sx: { width: `100%`, maxWidth: `100%`, minWidth: 0 },
    children: [
      (0, $.jsx)(J, {
        title: `Absences maladie — Cockpit absentéisme & conformité`,
        subtitle: `Exercice ` + (exo === `tous` ? `tous exercices confondus` : exo) + ` · décompte en jours ouvrables (fériés Cameroun déduits) · fusion temps réel : base + Congés Annuels V2 + déclarations locales · conformité CT Cameroun (art. 34-36, 83-93) & CNPS`,
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          alignItems: `center`,
          children: [
            (0, $.jsx)(i, { variant: `caption`, sx: { color: `text.secondary`, display: { xs: `none`, md: `block` } }, children: `Synchro ` + sync.toLocaleTimeString() }),
            (0, $.jsxs)(l, { variant: `outlined`, size: `small`, onClick: fRefresh, sx: { textTransform: `none`, fontSize: `0.75rem`, minWidth: 0, px: { xs: 1, sm: 1.5 } }, children: [(0, $.jsx)(RF, { sx: { fontSize: 18 } }), (0, $.jsx)(i, { component: `span`, sx: { display: { xs: `none`, sm: `inline` }, fontSize: `inherit` }, children: `Actualiser` })] }),
            (0, $.jsxs)(l, { variant: `outlined`, size: `small`, onClick: fExport, sx: { textTransform: `none`, fontSize: `0.75rem`, minWidth: 0, px: { xs: 1, sm: 1.5 } }, children: [(0, $.jsx)(S, { sx: { fontSize: 18 } }), (0, $.jsx)(i, { component: `span`, sx: { display: { xs: `none`, sm: `inline` }, fontSize: `inherit` }, children: `Export CSV` })] }),
            (0, $.jsxs)(l, { variant: `contained`, size: `small`, onClick: () => { (setEmpNew(``), setDlgNew(!0)); }, sx: { textTransform: `none`, fontSize: `0.75rem`, minWidth: 0, px: { xs: 1, sm: 1.5 }, bgcolor: `#7e3ff2` }, children: [(0, $.jsx)(x, { sx: { fontSize: 18 } }), (0, $.jsx)(i, { component: `span`, sx: { display: { xs: `none`, sm: `inline` }, fontSize: `inherit` }, children: `Déclarer` })] }),
            (0, $.jsx)(l, { variant: `outlined`, size: `small`, onClick: () => { var st = absStore(); setCout((st.meta && st.meta.coutJour) || 15000); setDlgPar(!0); }, sx: { textTransform: `none`, fontSize: `0.75rem`, minWidth: 0, px: { xs: 1, sm: 1.5 } }, children: [(0, $.jsx)(PYC, { sx: { fontSize: 18 } }), (0, $.jsx)(i, { component: `span`, sx: { display: { xs: `none`, sm: `inline` }, fontSize: `inherit` }, children: `Paramètres` })] }),
          ],
        }),
      }),
      exo !== `tous` && exo !== String(AN)
        ? (0, $.jsx)(c, {
            severity: `info`,
            sx: { fontWeight: 600 },
            children: `Exercice ` + AN + ` en cours (` + jRestants + ` jour(s) avant le 31/12) — l'exercice affiché ` + exo + ` est le plus documenté. Basculez via le filtre Exercice ou déclarez un dossier ` + AN + `.`,
          })
        : null,
      alCNPS.length > 0
        ? (0, $.jsx)(c, {
            severity: `error`,
            icon: (0, $.jsx)(w, {}),
            sx: { fontWeight: 600, overflowWrap: `anywhere`, "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } } },
            action: (0, $.jsx)(l, { color: `error`, size: `small`, onClick: () => (setTypeF(`accident_travail`), setPage(0)), sx: { textTransform: `none` }, children: `Examiner` }),
            children: alCNPS.length + ` accident(s) du travail à déclarer à la CNPS — délai légal 48 h (loi n° 98/004, art. 78) : risque de pénalité et de prise en charge refusée.`,
          })
        : null,
      alAbandon.length > 0
        ? (0, $.jsx)(c, {
            severity: `error`,
            icon: (0, $.jsx)(GV, {}),
            sx: { fontWeight: 600, overflowWrap: `anywhere`, "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } } },
            action: (0, $.jsx)(l, { color: `error`, size: `small`, onClick: () => (setStatutF(`a_reguler`), setPage(0)), sx: { textTransform: `none` }, children: `Examiner` }),
            children: alAbandon.length + ` absence(s) non justifiée(s) atteignent 8 jours ouvrables cumulés — engager la procédure disciplinaire / abandon de poste (art. 34-36 Code du travail).`,
          })
        : null,
      alVisite.length + alRelance.length > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            sx: { fontWeight: 600, overflowWrap: `anywhere`, "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } } },
            action: (0, $.jsx)(l, { color: `warning`, size: `small`, onClick: () => (setStatutF(`a_reguler`), setPage(0)), sx: { textTransform: `none` }, children: `Traiter` }),
            children: alVisite.length + ` visite(s) de reprise à programmer (arrêt > 3 j — médecine du travail) · ` + alRelance.length + ` justificatif(s) à relancer (J+2).`,
          })
        : null,
      alBrad.length > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            sx: { fontWeight: 600, overflowWrap: `anywhere`, "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } } },
            action: (0, $.jsx)(l, { color: `warning`, size: `small`, onClick: () => (setStatutF(`recommande`), setPage(0)), sx: { textTransform: `none` }, children: `Voir` }),
            children: alBrad.length + ` salarié(s) avec facteur de Bradford ≥ 450 (arrêts courts répétés) — entretien de prévention recommandé (lien burn-out : voir Soldes de congés).`,
          })
        : null,
      (0, $.jsxs)(a, { sx: { display: `grid`, gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(4,1fr)` }, gap: 2 }, children: [
        (0, $.jsx)(AbsKpi, { ic: HSA, grad: !0, valeur: kpi.jours + ` j`, label: `Jours d'absence perdus`, sub: kpi.tauxAbs != null ? `taux d'absentéisme ` + kpi.tauxAbs + ` % (cible < 4 %)` : `tous exercices confondus`, actif: statutF === `tous` && dept === `tous` && typeF === `tous` && !rech, onClic: () => { (setStatutF(`tous`), setDept(`tous`), setTypeF(`tous`), setRech(``), setPage(0)); } }),
        (0, $.jsx)(AbsKpi, { ic: HEA, couleur: `warning.main`, valeur: String(kpi.aReg), label: `Dossiers à régulariser`, sub: `CNPS · visites reprise · relances · attentes`, actif: statutF === `a_reguler`, onClic: () => (setStatutF(statutF === `a_reguler` ? `tous` : `a_reguler`), setPage(0)) }),
        (0, $.jsx)(AbsKpi, { ic: PYC, couleur: `error.main`, valeur: sldFCFA(kpi.coutTot), label: `Coût estimé`, sub: `indemnités légales + remplacements (paramétrable)`, actif: !1, onClic: () => fTri(`cout`) }),
        (0, $.jsx)(AbsKpi, { ic: SCH, couleur: `secondary.main`, valeur: String(kpi.bradf), label: `Récidives (Bradford ≥ 450)`, sub: `arrêts courts répétés — prévention burn-out`, actif: statutF === `recommande`, onClic: () => (setStatutF(statutF === `recommande` ? `tous` : `recommande`), setPage(0)) }),
      ] }),
      (0, $.jsxs)(a, { sx: { display: `flex`, gap: 1.5, flexWrap: `wrap`, alignItems: `center` }, children: [
        (0, $.jsx)(D, {
          size: `small`,
          placeholder: `Rechercher (nom, matricule, motif, type…)`,
          value: rech,
          onChange: (e2) => { (setRech(e2.target.value), setPage(0)); },
          InputProps: { startAdornment: (0, $.jsx)(k, { sx: { fontSize: 18, mr: 1, color: `text.secondary` } }) },
          sx: { flex: 1, minWidth: 160, "& .MuiInput-root": { fontSize: `0.8rem` } },
        }),
        (0, $.jsxs)(D, { select: !0, size: `small`, label: `Statut`, value: statutF, onChange: (e2) => { (setStatutF(e2.target.value), setPage(0)); }, sx: { minWidth: 160, width: { xs: `100%`, sm: `auto` } }, children: [
          (0, $.jsx)(s, { value: `tous`, children: `Tous les statuts` }),
          (0, $.jsx)(s, { value: `a_reguler`, children: `🔴 À régulariser (actions dues)` }),
          (0, $.jsx)(s, { value: `non_justifiee`, children: `Non justifiée` }),
          (0, $.jsx)(s, { value: `en_attente`, children: `En attente` }),
          (0, $.jsx)(s, { value: `justifiee`, children: `Justifiée` }),
          (0, $.jsx)(s, { value: `rejetee`, children: `Rejetée` }),
          (0, $.jsx)(s, { value: `recommande`, children: `🟠 Récidive Bradford ≥ 450` }),
        ] }),
        (0, $.jsxs)(D, { select: !0, size: `small`, label: `Type`, value: typeF, onChange: (e2) => { (setTypeF(e2.target.value), setPage(0)); }, sx: { minWidth: 170, width: { xs: `100%`, sm: `auto` } }, children: [
          (0, $.jsx)(s, { value: `tous`, children: `Tous les types` }),
          Object.keys(ABS_TYPES).map((tk) => (0, $.jsx)(s, { value: tk, children: ABS_TYPES[tk][0] }, tk)),
        ] }),
        (0, $.jsxs)(D, { select: !0, size: `small`, label: `Exercice`, value: exo, onChange: (e2) => { (setExo(e2.target.value), setPage(0)); }, sx: { minWidth: 150, width: { xs: `100%`, sm: `auto` } }, children: [
          (0, $.jsx)(s, { value: String(AN), children: `Exercice ` + AN }),
          (0, $.jsx)(s, { value: String(AN - 1), children: `Exercice ` + (AN - 1) }),
          (0, $.jsx)(s, { value: String(AN - 2), children: `Exercice ` + (AN - 2) }),
          (0, $.jsx)(s, { value: `tous`, children: `Tous exercices` }),
        ] }),
        dept !== `tous` || statutF !== `tous` || typeF !== `tous` || rech
          ? (0, $.jsx)(l, { size: `small`, onClick: () => { (setDept(`tous`), setStatutF(`tous`), setTypeF(`tous`), setRech(``), setPage(0)); }, sx: { textTransform: `none`, fontSize: `0.75rem` }, children: `Effacer les filtres` })
          : null,
      ] }),
      (0, $.jsx)(a, { sx: { display: `flex`, gap: 0.75, flexWrap: `wrap`, mb: -0.5 }, children: [
        (0, $.jsx)(T, { label: `Tous départements`, size: `small`, onClick: () => (setDept(`tous`), setPage(0)), color: dept === `tous` ? `primary` : `default`, variant: dept === `tous` ? `filled` : `outlined`, sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` } }),
        depts.map((dp) =>
          (0, $.jsx)(T, { label: dp, size: `small`, onClick: () => (setDept(dept === dp ? `tous` : dp), setPage(0)), color: dept === dp ? `primary` : `default`, variant: dept === dp ? `filled` : `outlined`, sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` } }, dp),
        ),
      ] }),
      (0, $.jsx)(ee, { children: (0, $.jsxs)(u, { children: [
        (0, $.jsx)(y, { sx: { overflowX: `auto`, maxWidth: `100%` }, children: (0, $.jsxs)(ne, { size: `small`, stickyHeader: !0, children: [
          (0, $.jsx)(te, { children: (0, $.jsxs)(b, { children: [
            fTh(`Employé`, `employe`),
            fTh(`Département`, `dept`),
            fTh(`Type`, `type`),
            fTh(`Période`, `debut`),
            fTh(`Durée (ouvr.)`, `duree`, `right`),
            (0, $.jsx)(v, { sx: { fontWeight: 700 }, children: `Conformité` }),
            fTh(`Indemnité estimée`, `cout`, `right`),
            (0, $.jsx)(v, { sx: { fontWeight: 700 }, children: `Statut` }),
            (0, $.jsx)(v, { align: `center`, sx: { fontWeight: 700 }, children: `Actions` }),
          ] }) }),
          (0, $.jsx)(_, { children: srt.slice(page * pp, page * pp + pp).map((rw, idx) =>
            (0, $.jsxs)(b, { hover: !0, onClick: () => openDet(rw), sx: { cursor: `pointer` }, children: [
              (0, $.jsxs)(v, { children: [
                (0, $.jsxs)(a, { sx: { display: `flex`, alignItems: `center`, gap: 1.2 }, children: [
                  sldAvatar(rw.emp || {}, 34, 12),
                  (0, $.jsxs)(a, { sx: { minWidth: 0 }, children: [
                    (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, noWrap: !0, children: rw.emp ? B(rw.emp) : rw.employee_id }),
                    (0, $.jsx)(i, { variant: `caption`, sx: { color: `text.secondary`, fontFamily: `monospace` }, children: (rw.emp && rw.emp.matricule) || `` }),
                  ] }),
                ] }),
              ] }),
              (0, $.jsx)(v, { children: (0, $.jsx)(T, { label: (rw.emp && rw.emp.departement) || `—`, size: `small`, variant: `outlined`, sx: { fontSize: `0.68rem`, fontWeight: 700 } }) }),
              (0, $.jsxs)(v, { children: [
                (0, $.jsx)(T, { label: absLibelle(rw.type_absence), size: `small`, color: rw.fl.abandon || rw.fl.cnpsLate ? `error` : rw.type_absence === `absence_non_justifiee` ? `warning` : `primary`, variant: `outlined`, sx: { fontWeight: 700, fontSize: `0.66rem` } }),
                (0, $.jsx)(i, { variant: `caption`, sx: { display: `block`, color: `text.secondary` }, children: rw.motif || `` }),
              ] }),
              (0, $.jsxs)(v, { children: [
                (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, noWrap: !0, children: A(rw.date_debut) + ` → ` + A(rw.date_fin) }),
                (0, $.jsx)(a, { sx: { display: `flex`, alignItems: `center`, gap: 0.5, mt: 0.25 }, children: absChipSource(rw.source) }),
              ] }),
              (0, $.jsxs)(v, { align: `right`, children: [
                (0, $.jsx)(i, { variant: `body2`, fontWeight: 800, children: rw.ouvr + ` j` }),
                (0, $.jsx)(i, { variant: `caption`, sx: { display: `block`, color: `text.secondary` }, children: rw.cal + ` j cal.` }),
              ] }),
              (0, $.jsx)(v, { children: absChipConf(rw.fl) }),
              (0, $.jsxs)(v, { align: `right`, children: [
                (0, $.jsx)(i, { variant: `body2`, fontWeight: 700, children: rw.indem > 0 ? sldFCFA(rw.indem) : `—` }),
                rw.coutR > 0 ? (0, $.jsx)(i, { variant: `caption`, sx: { display: `block`, color: `error.main`, fontWeight: 700 }, children: `+ ` + sldFCFA(rw.coutR) + ` remp.` }) : null,
              ] }),
              (0, $.jsx)(v, { children: absChipStatut(rw.statut) }),
              (0, $.jsx)(v, { align: `center`, children: (0, $.jsx)(o, { direction: `row`, spacing: 0.5, justifyContent: `center`, children: (0, $.jsx)(E, { title: `Détail du dossier`, children: (0, $.jsx)(r, { size: `small`, color: `primary`, onClick: (e2) => (e2.stopPropagation(), openDet(rw)), children: (0, $.jsx)(C, { fontSize: `small` }) }) }) }) }),
            ] }, rw.id || idx),
          ) }),
          srt.length === 0
            ? (0, $.jsx)(b, { children: (0, $.jsx)(v, { colSpan: 9, align: `center`, sx: { py: 4, color: `text.secondary` }, children: `Aucun dossier d'absence ne correspond aux filtres actifs — déclarez une absence ou changez d'exercice.` }) })
            : null,
        ] }) }),
        (0, $.jsx)(g, {
          component: `div`,
          count: srt.length,
          page: page,
          onPageChange: (e2, p2) => setPage(p2),
          rowsPerPage: pp,
          onRowsPerPageChange: (e2) => { (setPp(parseInt(e2.target.value)), setPage(0)); },
          rowsPerPageOptions: [10, 20, 50],
          labelRowsPerPage: `Lignes:`,
          labelDisplayedRows: (pg2) => pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
          sx: { mt: 1 },
        }),
      ] }) }),
      absDlgDetail(),
      absDlgNew(),
      absDlgParams(),
      (0, $.jsx)(d, { open: !!snack, autoHideDuration: 4e3, onClose: () => setSnack(null), anchorOrigin: { vertical: `bottom`, horizontal: `center` }, message: snack ? snack.msg : `` }),
    ],
  });
}

export { ie as default };
